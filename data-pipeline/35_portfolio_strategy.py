#!/usr/bin/env python3
"""
Portfolio Strategy Analyses (B1, B2, B3)

Generates:
  company/portfolio_diversification_b3.json  — Shannon entropy per company per year
  company/pivot_detection.json               — JSD between consecutive 3-year windows
  company/patent_concentration.json          — HHI and C4 per CPC section per year
"""
import sys
import time
import math
import json
import numpy as np
import duckdb
from scipy.spatial.distance import jensenshannon
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV,
    OUTPUT_DIR, CPC_SECTION_NAMES, save_json, timed_msg, tsv_table,
)


def log(msg):
    print(msg, flush=True)


con = duckdb.connect()

# ── Load company name mapping ────────────────────────────────────────────────
mapping_path = f"{OUTPUT_DIR}/company/company_name_mapping.json"
with open(mapping_path, "r") as f:
    COMPANY_MAP = json.load(f)

def clean_name(raw):
    """Map raw PatentsView organization name to clean display name."""
    return COMPANY_MAP.get(raw, raw)


# ═══════════════════════════════════════════════════════════════════════════════
# B1: Portfolio Diversification — Shannon entropy per company per year
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("B1: Portfolio Diversification — Shannon entropy per company per year")

t0 = time.time()

# Step 1: Identify top 50 assignees by total utility-patent count
top50_rows = con.execute(f"""
    SELECT disambig_assignee_organization AS organization, COUNT(DISTINCT patent_id) AS total
    FROM {ASSIGNEE_TSV()}
    WHERE disambig_assignee_organization IS NOT NULL
      AND TRIM(disambig_assignee_organization) != ''
      AND assignee_sequence = 0
    GROUP BY organization
    ORDER BY total DESC
    LIMIT 50
""").fetchall()
top50_orgs = [row[0] for row in top50_rows]
log(f"  Top 50 assignees identified in {time.time()-t0:.1f}s")

# Step 2: Create temp table for top 50 orgs for efficient filtering
con.execute("CREATE TEMPORARY TABLE top50_orgs AS SELECT unnest($1::VARCHAR[]) AS org", [top50_orgs])

# Step 3: Get patent counts per org per year per CPC subclass
t0 = time.time()
subclass_counts = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.cpc_subclass,
        COUNT(DISTINCT p.patent_id) AS cnt
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND c.cpc_subclass IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top50_orgs)
    GROUP BY organization, year, cpc_subclass
""").fetchdf()
log(f"  Subclass counts query: {time.time()-t0:.1f}s ({len(subclass_counts):,} rows)")

# Step 4: Compute Shannon entropy per org per year
t0 = time.time()
diversification_records = []

for (org, year), group in subclass_counts.groupby(['organization', 'year']):
    counts = group['cnt'].values.astype(float)
    total = counts.sum()
    if total == 0:
        continue
    probs = counts / total
    # Shannon entropy: H = -sum(p_i * log2(p_i))
    entropy = -np.sum(probs * np.log2(probs))
    diversification_records.append({
        'company': clean_name(org),
        'year': int(year),
        'shannon_entropy': round(float(entropy), 4),
        'num_subclasses': int(len(counts)),
    })

diversification_records.sort(key=lambda r: (r['company'], r['year']))
save_json(diversification_records, f"{OUTPUT_DIR}/company/portfolio_diversification_b3.json")
log(f"  B1 complete: {len(diversification_records):,} records in {time.time()-t0:.1f}s")


# ═══════════════════════════════════════════════════════════════════════════════
# B2: Technology Pivot Detection — JSD between consecutive 3-year windows
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("B2: Technology Pivot Detection — JSD between consecutive 3-year windows")

t0 = time.time()

# Step 1: Identify top 20 assignees
top20_orgs = [row[0] for row in top50_rows[:20]]
con.execute("DROP TABLE IF EXISTS top20_orgs")
con.execute("CREATE TEMPORARY TABLE top20_orgs AS SELECT unnest($1::VARCHAR[]) AS org", [top20_orgs])

# Step 2: Get patent counts per org per year per CPC subclass (for top 20)
window_data = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.cpc_subclass,
        COUNT(DISTINCT p.patent_id) AS cnt
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND c.cpc_subclass IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top20_orgs)
    GROUP BY organization, year, cpc_subclass
""").fetchdf()
log(f"  Window data query: {time.time()-t0:.1f}s ({len(window_data):,} rows)")

# Step 3: For each org, compute 3-year window distributions and JSD between consecutive windows
t0 = time.time()
pivot_records = []

for org in top20_orgs:
    org_data = window_data[window_data['organization'] == org]
    if org_data.empty:
        continue

    years_available = sorted(org_data['year'].unique())
    min_year = int(min(years_available))
    max_year = int(max(years_available))

    # Build distributions for each 3-year window
    # Windows: [start, start+1, start+2]
    window_dists = {}
    all_subclasses = set(org_data['cpc_subclass'].unique())

    for start in range(min_year, max_year - 1):  # need at least 3 years
        end = start + 2
        window_slice = org_data[(org_data['year'] >= start) & (org_data['year'] <= end)]
        if window_slice.empty:
            continue
        dist = window_slice.groupby('cpc_subclass')['cnt'].sum()
        window_dists[start] = dist

    # Compute JSD between consecutive windows
    window_starts = sorted(window_dists.keys())
    jsd_values = []

    for i in range(len(window_starts) - 1):
        w1_start = window_starts[i]
        w2_start = window_starts[i + 1]
        dist1 = window_dists[w1_start]
        dist2 = window_dists[w2_start]

        # Align distributions on the union of subclasses
        all_sc = sorted(set(dist1.index) | set(dist2.index))
        p = np.array([dist1.get(sc, 0) for sc in all_sc], dtype=float)
        q = np.array([dist2.get(sc, 0) for sc in all_sc], dtype=float)

        # Normalize to probability distributions
        p_sum = p.sum()
        q_sum = q.sum()
        if p_sum == 0 or q_sum == 0:
            continue
        p = p / p_sum
        q = q / q_sum

        # scipy jensenshannon returns the JSD (square root of JS divergence)
        jsd = jensenshannon(p, q, base=2)

        # Find top gaining and losing CPC subclasses
        diff = q - p
        sc_diff = list(zip(all_sc, diff))
        sc_diff.sort(key=lambda x: x[1])
        top_losing = sc_diff[0][0] if sc_diff else None
        top_gaining = sc_diff[-1][0] if sc_diff else None

        jsd_values.append({
            'window_start': w2_start,
            'window_end': w2_start + 2,
            'jsd': round(float(jsd), 6),
            'top_gaining_cpc': top_gaining,
            'top_losing_cpc': top_losing,
        })

    # Flag pivots: 95th percentile of JSD for this company
    if jsd_values:
        jsd_vals = [r['jsd'] for r in jsd_values]
        threshold = float(np.percentile(jsd_vals, 95))

        for r in jsd_values:
            pivot_records.append({
                'company': clean_name(org),
                'window_start': r['window_start'],
                'window_end': r['window_end'],
                'jsd': r['jsd'],
                'is_pivot': r['jsd'] >= threshold,
                'top_gaining_cpc': r['top_gaining_cpc'],
                'top_losing_cpc': r['top_losing_cpc'],
            })

pivot_records.sort(key=lambda r: (r['company'], r['window_start']))
save_json(pivot_records, f"{OUTPUT_DIR}/company/pivot_detection.json")
log(f"  B2 complete: {len(pivot_records):,} records in {time.time()-t0:.1f}s")


# ═══════════════════════════════════════════════════════════════════════════════
# B3: Patent Concentration — HHI and C4 per CPC section per year
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("B3: Patent Concentration — HHI and C4 per CPC section per year")

t0 = time.time()

# Get patent counts per CPC section per year per assignee (utility patents only)
concentration_raw = con.execute(f"""
    SELECT
        c.cpc_section AS section,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT p.patent_id) AS cnt
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY section, year, organization
""").fetchdf()
log(f"  Concentration query: {time.time()-t0:.1f}s ({len(concentration_raw):,} rows)")

# Compute HHI and C4 per section per year
t0 = time.time()
concentration_records = []

for (section, year), group in concentration_raw.groupby(['section', 'year']):
    counts = group['cnt'].values.astype(float)
    total = counts.sum()
    if total == 0:
        continue

    # Market shares (as percentages, 0-100)
    shares_pct = (counts / total) * 100.0

    # HHI = sum of squared market shares (max = 10000 for monopoly)
    hhi = float(np.sum(shares_pct ** 2))

    # C4 = sum of top 4 shares (as percentage)
    top4_shares = np.sort(shares_pct)[-4:] if len(shares_pct) >= 4 else shares_pct
    c4 = float(np.sum(top4_shares))

    concentration_records.append({
        'year': int(year),
        'section': section,
        'hhi': round(hhi, 2),
        'c4': round(c4, 2),
    })

concentration_records.sort(key=lambda r: (r['year'], r['section']))
save_json(concentration_records, f"{OUTPUT_DIR}/company/patent_concentration.json")
log(f"  B3 complete: {len(concentration_records):,} records in {time.time()-t0:.1f}s")


# ── Cleanup ──────────────────────────────────────────────────────────────────
con.close()
log("\n=== 35_portfolio_strategy complete ===\n")
