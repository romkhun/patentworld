#!/usr/bin/env python3
"""
Firm-Level Quality Distribution Over Time (Analysis Group 1)

For each of the top 50 assignees, computes per-year:
  - Forward citation percentiles (p10, p25, p50, p75, p90, p99)
  - Mean forward citations
  - Blockbuster rate (top 1% within year × CPC section)
  - Dud rate (zero 5-year forward citations)
  - Gini coefficient of forward citations
  - Claims percentiles (p25, p50, p75, p90)
  - CPC scope percentiles (p50, p75, p90)
  - System-wide medians for reference lines

Output:
  company/firm_quality_distribution.json
  company/firm_quality_scatter.json
  company/firm_quality_gini.json
  company/firm_claims_distribution.json
  company/firm_scope_distribution.json
"""
import json
import time
import duckdb
import numpy as np
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/company"
con = duckdb.connect()

# Load company name mapping
with open(f"{OUT}/company_name_mapping.json", "r") as f:
    COMPANY_MAP = json.load(f)

def clean_name(raw):
    return COMPANY_MAP.get(raw, raw)

# ── Step 1: Identify top 50 assignees ────────────────────────────────────────
timed_msg("Step 1: Identify top 50 assignees")
t0 = time.time()

top50_rows = con.execute(f"""
    SELECT a.disambig_assignee_organization AS org, COUNT(DISTINCT p.patent_id) AS total
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY org
    ORDER BY total DESC
    LIMIT 50
""").fetchall()
top50_orgs = [row[0] for row in top50_rows]
print(f"  Top 50 assignees identified in {time.time()-t0:.1f}s")

# ── Step 2: Build base tables ────────────────────────────────────────────────
timed_msg("Step 2: Build base tables (patents, CPC, citations)")
t0 = time.time()

# Patent base with assignee
con.execute("DROP TABLE IF EXISTS firm_patents")
con.execute(f"""
    CREATE TEMPORARY TABLE firm_patents AS
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        p.num_claims,
        a.disambig_assignee_organization AS org
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND a.disambig_assignee_organization IN ({','.join(f"'{o.replace(chr(39), chr(39)+chr(39))}'" for o in top50_orgs)})
""")
fp_count = con.execute("SELECT COUNT(*) FROM firm_patents").fetchone()[0]
print(f"  firm_patents: {fp_count:,} rows in {time.time()-t0:.1f}s")

# Primary CPC section per patent
t0 = time.time()
con.execute("DROP TABLE IF EXISTS patent_cpc")
con.execute(f"""
    CREATE TEMPORARY TABLE patent_cpc AS
    SELECT patent_id, cpc_section AS section, cpc_subclass
    FROM {CPC_CURRENT_TSV()}
    WHERE cpc_sequence = 0
""")
print(f"  patent_cpc built in {time.time()-t0:.1f}s")

# CPC scope (distinct subclasses per patent)
t0 = time.time()
con.execute("DROP TABLE IF EXISTS patent_scope")
con.execute(f"""
    CREATE TEMPORARY TABLE patent_scope AS
    SELECT patent_id, COUNT(DISTINCT cpc_subclass) AS scope
    FROM {CPC_CURRENT_TSV()}
    GROUP BY patent_id
""")
print(f"  patent_scope built in {time.time()-t0:.1f}s")

# 5-year forward citations
t0 = time.time()
con.execute("DROP TABLE IF EXISTS fwd_cite_5yr")
con.execute(f"""
    CREATE TEMPORARY TABLE fwd_cite_5yr AS
    SELECT
        c.citation_patent_id AS patent_id,
        COUNT(*) AS fwd_cites
    FROM {CITATION_TSV()} c
    JOIN {PATENT_TSV()} citing ON c.patent_id = citing.patent_id
    JOIN {PATENT_TSV()} cited ON c.citation_patent_id = cited.patent_id
    WHERE citing.patent_date IS NOT NULL
      AND cited.patent_date IS NOT NULL
      AND DATEDIFF('day', CAST(cited.patent_date AS DATE), CAST(citing.patent_date AS DATE)) BETWEEN 0 AND 1826
    GROUP BY c.citation_patent_id
""")
fc_count = con.execute("SELECT COUNT(*) FROM fwd_cite_5yr").fetchone()[0]
print(f"  fwd_cite_5yr: {fc_count:,} rows in {time.time()-t0:.1f}s")

# ── Step 3: Compute blockbuster thresholds (top 1% per year × CPC section) ──
timed_msg("Step 3: Compute blockbuster thresholds")
t0 = time.time()

# All utility patents with forward citations and CPC
con.execute("DROP TABLE IF EXISTS all_patents_quality")
con.execute(f"""
    CREATE TEMPORARY TABLE all_patents_quality AS
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        pc.section,
        COALESCE(fc.fwd_cites, 0) AS fwd_cites
    FROM {PATENT_TSV()} p
    JOIN patent_cpc pc ON p.patent_id = pc.patent_id
    LEFT JOIN fwd_cite_5yr fc ON p.patent_id = fc.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2019
""")

# p99 threshold per year × section
con.execute("DROP TABLE IF EXISTS blockbuster_thresholds")
con.execute("""
    CREATE TEMPORARY TABLE blockbuster_thresholds AS
    SELECT
        year, section,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY fwd_cites) AS p99_threshold
    FROM all_patents_quality
    GROUP BY year, section
""")
print(f"  Blockbuster thresholds computed in {time.time()-t0:.1f}s")

# System-wide medians per year
con.execute("DROP TABLE IF EXISTS system_medians")
con.execute("""
    CREATE TEMPORARY TABLE system_medians AS
    SELECT
        year,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fwd_cites) AS system_median_fwd_cites
    FROM all_patents_quality
    GROUP BY year
""")

# ── Step 4: Compute firm-level citation distribution ─────────────────────────
timed_msg("Step 4: Compute firm-level citation distribution per (firm × year)")
t0 = time.time()

# Only compute for years up to 2019 (need 5-year forward window)
firm_quality_df = con.execute("""
    SELECT
        fp.org,
        fp.year,
        COUNT(*) AS patent_count,
        PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p10,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p75,
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p90,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p99,
        ROUND(AVG(COALESCE(fc.fwd_cites, 0)), 2) AS mean_fwd,
        ROUND(CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) = 0 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*), 4) AS dud_rate
    FROM firm_patents fp
    LEFT JOIN fwd_cite_5yr fc ON fp.patent_id = fc.patent_id
    WHERE fp.year BETWEEN 1976 AND 2019
    GROUP BY fp.org, fp.year
    HAVING COUNT(*) >= 10
    ORDER BY fp.org, fp.year
""").fetchdf()
print(f"  Firm citation distribution: {len(firm_quality_df):,} rows in {time.time()-t0:.1f}s")

# Compute blockbuster rate per firm × year
t0 = time.time()
blockbuster_df = con.execute("""
    SELECT
        fp.org,
        fp.year,
        ROUND(
            CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) >= bt.p99_threshold THEN 1 ELSE 0 END) AS DOUBLE)
            / COUNT(*), 4
        ) AS blockbuster_rate
    FROM firm_patents fp
    LEFT JOIN fwd_cite_5yr fc ON fp.patent_id = fc.patent_id
    JOIN patent_cpc pc ON fp.patent_id = pc.patent_id
    JOIN blockbuster_thresholds bt ON fp.year = bt.year AND pc.section = bt.section
    WHERE fp.year BETWEEN 1976 AND 2019
    GROUP BY fp.org, fp.year
    HAVING COUNT(*) >= 10
    ORDER BY fp.org, fp.year
""").fetchdf()
print(f"  Blockbuster rates: {len(blockbuster_df):,} rows in {time.time()-t0:.1f}s")

# Compute Gini coefficient per firm × year
t0 = time.time()
gini_data = con.execute("""
    SELECT
        fp.org,
        fp.year,
        COALESCE(fc.fwd_cites, 0) AS fwd_cites
    FROM firm_patents fp
    LEFT JOIN fwd_cite_5yr fc ON fp.patent_id = fc.patent_id
    WHERE fp.year BETWEEN 1976 AND 2019
    ORDER BY fp.org, fp.year, fwd_cites
""").fetchdf()

def compute_gini(values):
    """Compute Gini coefficient for an array of non-negative values."""
    vals = np.sort(np.asarray(values, dtype=float))
    n = len(vals)
    if n < 2 or vals.sum() == 0:
        return 0.0
    index = np.arange(1, n + 1)
    return float((2 * np.sum(index * vals) - (n + 1) * vals.sum()) / (n * vals.sum()))

gini_records = {}
for (org, year), group in gini_data.groupby(['org', 'year']):
    if len(group) >= 10:
        g = compute_gini(group['fwd_cites'].values)
        gini_records[(org, year)] = round(g, 4)
print(f"  Gini coefficients: {len(gini_records):,} computed in {time.time()-t0:.1f}s")

# Get system medians
system_med = con.execute("SELECT year, system_median_fwd_cites FROM system_medians ORDER BY year").fetchdf()
system_median_map = dict(zip(system_med['year'], system_med['system_median_fwd_cites']))

# ── Step 5: Build output JSON ────────────────────────────────────────────────
timed_msg("Step 5: Build firm quality distribution JSON")

# Merge blockbuster rates and Gini
blockbuster_map = {}
for _, row in blockbuster_df.iterrows():
    blockbuster_map[(row['org'], row['year'])] = float(row['blockbuster_rate'])

firm_quality = {}
for _, row in firm_quality_df.iterrows():
    org = row['org']
    year = int(row['year'])
    name = clean_name(org)
    if name not in firm_quality:
        firm_quality[name] = []
    firm_quality[name].append({
        'year': year,
        'patent_count': int(row['patent_count']),
        'p10': round(float(row['p10']), 1),
        'p25': round(float(row['p25']), 1),
        'p50': round(float(row['p50']), 1),
        'p75': round(float(row['p75']), 1),
        'p90': round(float(row['p90']), 1),
        'p99': round(float(row['p99']), 1),
        'mean': round(float(row['mean_fwd']), 2),
        'dud_rate': round(float(row['dud_rate']), 4),
        'blockbuster_rate': blockbuster_map.get((org, year), 0),
        'gini': gini_records.get((org, year), 0),
        'system_median': round(float(system_median_map.get(year, 0)), 1),
    })

# Sort each firm's data by year
for name in firm_quality:
    firm_quality[name].sort(key=lambda d: d['year'])

save_json(firm_quality, f"{OUT}/firm_quality_distribution.json")

# ── Step 6: Claims distribution per firm × year ─────────────────────────────
timed_msg("Step 6: Claims distribution per firm × year")
t0 = time.time()

claims_df = con.execute("""
    SELECT
        fp.org,
        fp.year,
        COUNT(*) AS patent_count,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY fp.num_claims) AS p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY fp.num_claims) AS p50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY fp.num_claims) AS p75,
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY fp.num_claims) AS p90,
        ROUND(AVG(fp.num_claims), 2) AS mean_claims
    FROM firm_patents fp
    GROUP BY fp.org, fp.year
    HAVING COUNT(*) >= 10
    ORDER BY fp.org, fp.year
""").fetchdf()

# System-wide median claims per year
system_claims = con.execute(f"""
    SELECT
        YEAR(CAST(patent_date AS DATE)) AS year,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY num_claims) AS system_median_claims
    FROM {PATENT_TSV()}
    WHERE patent_type = 'utility'
      AND patent_date IS NOT NULL
      AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""").fetchdf()
system_claims_map = dict(zip(system_claims['year'], system_claims['system_median_claims']))

firm_claims = {}
for _, row in claims_df.iterrows():
    name = clean_name(row['org'])
    year = int(row['year'])
    if name not in firm_claims:
        firm_claims[name] = []
    firm_claims[name].append({
        'year': year,
        'p25': round(float(row['p25']), 1),
        'p50': round(float(row['p50']), 1),
        'p75': round(float(row['p75']), 1),
        'p90': round(float(row['p90']), 1),
        'mean': round(float(row['mean_claims']), 2),
        'system_median': round(float(system_claims_map.get(year, 0)), 1),
    })

for name in firm_claims:
    firm_claims[name].sort(key=lambda d: d['year'])

save_json(firm_claims, f"{OUT}/firm_claims_distribution.json")
print(f"  Claims distribution: {len(claims_df):,} rows in {time.time()-t0:.1f}s")

# ── Step 7: Scope distribution per firm × year ───────────────────────────────
timed_msg("Step 7: Scope distribution per firm × year")
t0 = time.time()

scope_df = con.execute("""
    SELECT
        fp.org,
        fp.year,
        COUNT(*) AS patent_count,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY COALESCE(ps.scope, 1)) AS p50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY COALESCE(ps.scope, 1)) AS p75,
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY COALESCE(ps.scope, 1)) AS p90,
        ROUND(AVG(COALESCE(ps.scope, 1)), 2) AS mean_scope
    FROM firm_patents fp
    LEFT JOIN patent_scope ps ON fp.patent_id = ps.patent_id
    GROUP BY fp.org, fp.year
    HAVING COUNT(*) >= 10
    ORDER BY fp.org, fp.year
""").fetchdf()

# System-wide median scope per year
system_scope = con.execute(f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY COALESCE(ps.scope, 1)) AS system_median_scope
    FROM {PATENT_TSV()} p
    LEFT JOIN patent_scope ps ON p.patent_id = ps.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""").fetchdf()
system_scope_map = dict(zip(system_scope['year'], system_scope['system_median_scope']))

firm_scope = {}
for _, row in scope_df.iterrows():
    name = clean_name(row['org'])
    year = int(row['year'])
    if name not in firm_scope:
        firm_scope[name] = []
    firm_scope[name].append({
        'year': year,
        'p50': round(float(row['p50']), 1),
        'p75': round(float(row['p75']), 1),
        'p90': round(float(row['p90']), 1),
        'mean': round(float(row['mean_scope']), 2),
        'system_median': round(float(system_scope_map.get(year, 0)), 1),
    })

for name in firm_scope:
    firm_scope[name].sort(key=lambda d: d['year'])

save_json(firm_scope, f"{OUT}/firm_scope_distribution.json")
print(f"  Scope distribution: {len(scope_df):,} rows in {time.time()-t0:.1f}s")

# ── Step 8: Quality scatter (most recent decade: 2010-2019) ──────────────────
timed_msg("Step 8: Quality typology scatter (2010-2019)")
t0 = time.time()

# Get primary CPC section per firm (most common section in recent decade)
primary_section = con.execute("""
    SELECT
        fp.org,
        pc.section,
        COUNT(*) AS cnt,
        ROW_NUMBER() OVER (PARTITION BY fp.org ORDER BY COUNT(*) DESC) AS rn
    FROM firm_patents fp
    JOIN patent_cpc pc ON fp.patent_id = pc.patent_id
    WHERE fp.year BETWEEN 2010 AND 2019
    GROUP BY fp.org, pc.section
""").fetchdf()
primary_section = primary_section[primary_section['rn'] == 1]
primary_section_map = dict(zip(primary_section['org'], primary_section['section']))

scatter_df = con.execute("""
    SELECT
        fp.org,
        COUNT(*) AS patent_count,
        ROUND(
            CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) >= bt.p99_threshold THEN 1 ELSE 0 END) AS DOUBLE)
            / COUNT(*) * 100, 2
        ) AS blockbuster_rate,
        ROUND(
            CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) = 0 THEN 1 ELSE 0 END) AS DOUBLE)
            / COUNT(*) * 100, 2
        ) AS dud_rate
    FROM firm_patents fp
    LEFT JOIN fwd_cite_5yr fc ON fp.patent_id = fc.patent_id
    JOIN patent_cpc pc ON fp.patent_id = pc.patent_id
    JOIN blockbuster_thresholds bt ON fp.year = bt.year AND pc.section = bt.section
    WHERE fp.year BETWEEN 2010 AND 2019
    GROUP BY fp.org
    HAVING COUNT(*) >= 50
    ORDER BY blockbuster_rate DESC
""").fetchdf()

scatter_records = []
for _, row in scatter_df.iterrows():
    org = row['org']
    scatter_records.append({
        'company': clean_name(org),
        'blockbuster_rate': float(row['blockbuster_rate']),
        'dud_rate': float(row['dud_rate']),
        'patent_count': int(row['patent_count']),
        'primary_section': primary_section_map.get(org, 'G'),
    })

save_json(scatter_records, f"{OUT}/firm_quality_scatter.json")
print(f"  Quality scatter: {len(scatter_records):,} firms in {time.time()-t0:.1f}s")

# ── Step 9: Gini trajectories for small multiples ────────────────────────────
timed_msg("Step 9: Gini trajectories (top 20 firms by recent Gini)")
t0 = time.time()

# Use 3-year rolling window for smoother Gini
gini_firm = {}
for (org, year), g in gini_records.items():
    name = clean_name(org)
    if name not in gini_firm:
        gini_firm[name] = []
    gini_firm[name].append({'year': int(year), 'gini': g})

for name in gini_firm:
    gini_firm[name].sort(key=lambda d: d['year'])

# Get top 20 by most recent Gini
recent_gini = {}
for name, data in gini_firm.items():
    recent = [d for d in data if d['year'] >= 2015]
    if recent:
        recent_gini[name] = np.mean([d['gini'] for d in recent])

top20_gini = sorted(recent_gini.items(), key=lambda x: -x[1])[:20]
top20_names = [name for name, _ in top20_gini]

gini_output = {name: gini_firm[name] for name in top20_names if name in gini_firm}
save_json(gini_output, f"{OUT}/firm_quality_gini.json")
print(f"  Gini trajectories: {len(gini_output)} firms in {time.time()-t0:.1f}s")

# ── Cleanup ──────────────────────────────────────────────────────────────────
con.close()
print("\n=== 41_firm_quality_distribution complete ===\n")
