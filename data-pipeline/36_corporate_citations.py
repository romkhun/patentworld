#!/usr/bin/env python3
"""
Corporate Citation Analyses (C1, C2, C3)

Generates:
  company/corporate_citation_network.json  — Directed citation flows between top 30 assignees per decade
  company/tech_leadership.json             — Top 5 assignees by forward citations per CPC section per 5-year window
  company/citation_half_life.json          — Citation half-life per assignee for patents >=15 years old
"""
import sys
import time
import json
import numpy as np
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV, CITATION_TSV,
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
# C1: Corporate Citation Network — Directed citation flows between top 30
#     assignees, per decade
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("C1: Corporate Citation Network — directed flows between top 30, per decade")

t0 = time.time()

# Step 1: Identify top 30 assignees by all-time utility patent count
top30_rows = con.execute(f"""
    SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT p.patent_id) AS total
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY organization
    ORDER BY total DESC
    LIMIT 30
""").fetchall()
top30_orgs = [row[0] for row in top30_rows]
log(f"  Top 30 assignees identified in {time.time()-t0:.1f}s")

# Step 2: Create temp table with top 30 orgs' patents for efficient join
t0 = time.time()
con.execute("CREATE TEMPORARY TABLE top30_orgs AS SELECT unnest($1::VARCHAR[]) AS org", [top30_orgs])

# Build a temp table of patent_id -> organization for top 30 only
con.execute(f"""
    CREATE TEMPORARY TABLE top30_patents AS
    SELECT a.patent_id, a.disambig_assignee_organization AS organization
    FROM {ASSIGNEE_TSV()} a
    WHERE a.assignee_sequence = 0
      AND a.disambig_assignee_organization IN (SELECT org FROM top30_orgs)
""")
top30_count = con.execute("SELECT COUNT(*) FROM top30_patents").fetchone()[0]
log(f"  Top 30 patent set: {top30_count:,} patents in {time.time()-t0:.1f}s")

# Step 3: Join citations through the narrowed patent set
# citing patent -> top30_patents (source company)
# cited patent -> top30_patents (target company)
t0 = time.time()
network_df = con.execute(f"""
    SELECT
        FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS decade,
        src.organization AS source,
        tgt.organization AS target,
        COUNT(*) AS citation_count
    FROM {CITATION_TSV()} cit
    JOIN top30_patents src ON cit.patent_id = src.patent_id
    JOIN top30_patents tgt ON cit.citation_patent_id = tgt.patent_id
    JOIN {PATENT_TSV()} p ON cit.patent_id = p.patent_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND src.organization != tgt.organization
    GROUP BY decade, source, target
    HAVING citation_count >= 5
    ORDER BY decade, citation_count DESC
""").fetchdf()
log(f"  Citation network query: {time.time()-t0:.1f}s ({len(network_df):,} edges)")

# Step 4: Build output records with clean names
network_records = []
for _, row in network_df.iterrows():
    network_records.append({
        'decade': int(row['decade']),
        'source': clean_name(row['source']),
        'target': clean_name(row['target']),
        'citation_count': int(row['citation_count']),
    })

network_records.sort(key=lambda r: (r['decade'], -r['citation_count']))
save_json(network_records, f"{OUTPUT_DIR}/company/corporate_citation_network.json")
log(f"  C1 complete: {len(network_records):,} records")


# ═══════════════════════════════════════════════════════════════════════════════
# C2: Technology Leadership — Top 5 assignees by forward citations received
#     per CPC section per 5-year window
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("C2: Technology Leadership — top 5 assignees by forward citations per section per window")

t0 = time.time()

# Strategy: Build a temp table of cited patent -> assignee -> CPC section,
# then count incoming citations per (assignee, section, 5-year window of cited patent).
# Forward citations received = citations where this company's patent is the cited one.

# Step 1: Build temp table of cited patents with their assignee and CPC section
con.execute(f"""
    CREATE TEMPORARY TABLE cited_patent_info AS
    SELECT
        p.patent_id,
        a.disambig_assignee_organization AS organization,
        c.cpc_section AS section,
        CAST(FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 5) * 5 AS INTEGER) AS window_start
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
""")
cited_count = con.execute("SELECT COUNT(*) FROM cited_patent_info").fetchone()[0]
log(f"  Cited patent info table: {cited_count:,} rows in {time.time()-t0:.1f}s")

# Step 2: Count forward citations per (organization, section, window)
t0 = time.time()
leadership_df = con.execute(f"""
    WITH forward_counts AS (
        SELECT
            cpi.organization,
            cpi.section,
            cpi.window_start,
            COUNT(*) AS citations_received
        FROM {CITATION_TSV()} cit
        JOIN cited_patent_info cpi ON cit.citation_patent_id = cpi.patent_id
        GROUP BY cpi.organization, cpi.section, cpi.window_start
    ),
    ranked AS (
        SELECT
            *,
            ROW_NUMBER() OVER (
                PARTITION BY section, window_start
                ORDER BY citations_received DESC
            ) AS rank
        FROM forward_counts
    )
    SELECT
        CONCAT(CAST(window_start AS VARCHAR), '-', CAST(window_start + 4 AS VARCHAR)) AS window,
        section,
        organization AS company,
        citations_received,
        CAST(rank AS INTEGER) AS rank
    FROM ranked
    WHERE rank <= 5
      AND window_start <= 2020
    ORDER BY window_start, section, rank
""").fetchdf()
log(f"  Leadership query: {time.time()-t0:.1f}s ({len(leadership_df):,} rows)")

# Step 3: Build output with clean names
leadership_records = []
for _, row in leadership_df.iterrows():
    leadership_records.append({
        'window': row['window'],
        'section': row['section'],
        'company': clean_name(row['company']),
        'citations_received': int(row['citations_received']),
        'rank': int(row['rank']),
    })

save_json(leadership_records, f"{OUTPUT_DIR}/company/tech_leadership.json")
log(f"  C2 complete: {len(leadership_records):,} records")


# ═══════════════════════════════════════════════════════════════════════════════
# C3: Citation Half-Life — For patents >=15 years old, compute citation
#     half-life per assignee
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("C3: Citation Half-Life — per top 50 assignees (patents granted before 2010)")

t0 = time.time()

# Step 1: Identify top 50 assignees
top50_rows = con.execute(f"""
    SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT p.patent_id) AS total
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY organization
    ORDER BY total DESC
    LIMIT 50
""").fetchall()
top50_orgs = [row[0] for row in top50_rows]

con.execute("DROP TABLE IF EXISTS top50_orgs")
con.execute("CREATE TEMPORARY TABLE top50_orgs AS SELECT unnest($1::VARCHAR[]) AS org", [top50_orgs])

# Step 2: Build temp table of top 50 assignees' patents granted before 2010
con.execute(f"""
    CREATE TEMPORARY TABLE halflife_patents AS
    SELECT
        p.patent_id,
        a.disambig_assignee_organization AS organization,
        YEAR(CAST(p.patent_date AS DATE)) AS grant_year
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2009
      AND a.disambig_assignee_organization IN (SELECT org FROM top50_orgs)
""")
hl_count = con.execute("SELECT COUNT(*) FROM halflife_patents").fetchone()[0]
log(f"  Half-life patent set: {hl_count:,} patents in {time.time()-t0:.1f}s")

# Step 3: For each citation of these patents, compute years-after-grant
t0 = time.time()
citation_lag_df = con.execute(f"""
    SELECT
        hp.organization,
        YEAR(CAST(citing.patent_date AS DATE)) - hp.grant_year AS years_after_grant,
        COUNT(*) AS citation_count
    FROM {CITATION_TSV()} cit
    JOIN halflife_patents hp ON cit.citation_patent_id = hp.patent_id
    JOIN {PATENT_TSV()} citing ON cit.patent_id = citing.patent_id
    WHERE citing.patent_date IS NOT NULL
      AND YEAR(CAST(citing.patent_date AS DATE)) - hp.grant_year >= 0
      AND YEAR(CAST(citing.patent_date AS DATE)) - hp.grant_year <= 40
    GROUP BY hp.organization, years_after_grant
    ORDER BY hp.organization, years_after_grant
""").fetchdf()
log(f"  Citation lag query: {time.time()-t0:.1f}s ({len(citation_lag_df):,} rows)")

# Step 4: Compute half-life per organization
t0 = time.time()
halflife_records = []

# Also get patent counts per org
patent_counts = con.execute("""
    SELECT organization, COUNT(DISTINCT patent_id) AS patent_count
    FROM halflife_patents
    GROUP BY organization
""").fetchdf().set_index('organization')['patent_count'].to_dict()

for org in top50_orgs:
    org_data = citation_lag_df[citation_lag_df['organization'] == org].sort_values('years_after_grant')
    if org_data.empty:
        continue

    years = org_data['years_after_grant'].values
    counts = org_data['citation_count'].values.astype(float)
    total_citations = counts.sum()

    if total_citations == 0:
        continue

    # Build cumulative citation curve
    cumulative = np.cumsum(counts)
    half_target = total_citations / 2.0

    # Find the year at which 50% of all citations are accumulated
    half_life = None
    for i, cum_val in enumerate(cumulative):
        if cum_val >= half_target:
            # Linear interpolation for more precise half-life
            if i == 0:
                half_life = float(years[i])
            else:
                # Interpolate between years[i-1] and years[i]
                prev_cum = cumulative[i - 1]
                frac = (half_target - prev_cum) / (cum_val - prev_cum)
                half_life = float(years[i - 1]) + frac * float(years[i] - years[i - 1])
            break

    if half_life is None:
        half_life = float(years[-1])  # All citations haven't reached 50%

    halflife_records.append({
        'company': clean_name(org),
        'half_life_years': round(half_life, 2),
        'total_citations': int(total_citations),
        'patent_count': int(patent_counts.get(org, 0)),
    })

halflife_records.sort(key=lambda r: r['half_life_years'])
save_json(halflife_records, f"{OUTPUT_DIR}/company/citation_half_life.json")
log(f"  C3 complete: {len(halflife_records):,} records in {time.time()-t0:.1f}s")


# ── Cleanup ──────────────────────────────────────────────────────────────────
con.close()
log("\n=== 36_corporate_citations complete ===\n")
