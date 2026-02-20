import duckdb
import os
import sys
import time

sys.path.insert(0, '/home/saerom/projects/patentworld/data-pipeline')
from config import tsv_table, save_json, query_to_json, OUTPUT_DIR

con = duckdb.connect()
con.execute("SET threads = 10")
con.execute("SET memory_limit = '100GB'")

patent_tsv = tsv_table("g_patent")
cpc_current_tsv = tsv_table("g_cpc_current")

# ── ANALYSIS 9: CPC at Issue vs. Current CPC ──
print("\n" + "="*60)
print("ANALYSIS 9: CPC at Issue vs Current CPC Reclassification")
print("="*60)

cpc_at_issue_tsv = tsv_table("g_cpc_at_issue")

# First inspect columns
sql_cols = f"SELECT * FROM {cpc_at_issue_tsv} LIMIT 5"
cols = con.execute(sql_cols).fetchdf()
print(f"  Columns: {list(cols.columns)}")
print(cols.head().to_string())

# NOTE: g_cpc_at_issue uses 1-based sequence (primary = cpc_sequence=1)
#       g_cpc_current uses 0-based sequence (primary = cpc_sequence=0)

# Reclassification rate: compare primary CPC section at issue vs current
sql_reclass = f"""
WITH at_issue AS (
  SELECT patent_id, cpc_section AS section_at_issue
  FROM {cpc_at_issue_tsv}
  WHERE cpc_sequence = 1
),
current AS (
  SELECT patent_id, cpc_section AS section_current
  FROM {cpc_current_tsv}
  WHERE cpc_sequence = 0
)
SELECT 
  FLOOR(YEAR(p.patent_date) / 10) * 10 AS decade,
  COUNT(*) AS total_patents,
  SUM(CASE WHEN ai.section_at_issue != cur.section_current THEN 1 ELSE 0 END) AS reclassified,
  ROUND(100.0 * SUM(CASE WHEN ai.section_at_issue != cur.section_current THEN 1 ELSE 0 END) / COUNT(*), 2) AS reclass_rate_pct
FROM {patent_tsv} p
JOIN at_issue ai ON p.patent_id = ai.patent_id
JOIN current cur ON p.patent_id = cur.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date) BETWEEN 1976 AND 2025
GROUP BY decade
ORDER BY decade
"""
os.makedirs(f"{OUTPUT_DIR}/chapter3", exist_ok=True)
records = query_to_json(con, sql_reclass, f"{OUTPUT_DIR}/chapter3/cpc_reclassification_by_decade.json")
for r in records:
    print(f"  {int(r['decade'])}s: {r['reclass_rate_pct']}% reclassified ({r['reclassified']:,} / {r['total_patents']:,})")

# Reclassification flow matrix
sql_flow = f"""
WITH at_issue AS (
  SELECT patent_id, cpc_section AS section_at_issue
  FROM {cpc_at_issue_tsv}
  WHERE cpc_sequence = 1
),
current AS (
  SELECT patent_id, cpc_section AS section_current
  FROM {cpc_current_tsv}
  WHERE cpc_sequence = 0
)
SELECT 
  ai.section_at_issue AS from_section,
  cur.section_current AS to_section,
  COUNT(*) AS count
FROM {patent_tsv} p
JOIN at_issue ai ON p.patent_id = ai.patent_id
JOIN current cur ON p.patent_id = cur.patent_id
WHERE p.patent_type = 'utility'
  AND ai.section_at_issue != cur.section_current
GROUP BY ai.section_at_issue, cur.section_current
ORDER BY count DESC
"""
flow_records = query_to_json(con, sql_flow, f"{OUTPUT_DIR}/chapter3/cpc_reclassification_flows.json")
print(f"  Top 5 reclassification flows:")
for r in flow_records[:5]:
    print(f"    {r['from_section']} -> {r['to_section']}: {r['count']:,}")

# What share of G/H's current count came from reclassification?
sql_gh = f"""
WITH at_issue AS (
  SELECT patent_id, cpc_section AS section_at_issue
  FROM {cpc_at_issue_tsv}
  WHERE cpc_sequence = 1
),
current AS (
  SELECT patent_id, cpc_section AS section_current
  FROM {cpc_current_tsv}
  WHERE cpc_sequence = 0
)
SELECT 
  cur.section_current,
  COUNT(*) AS total_current,
  SUM(CASE WHEN ai.section_at_issue != cur.section_current THEN 1 ELSE 0 END) AS from_reclass,
  ROUND(100.0 * SUM(CASE WHEN ai.section_at_issue != cur.section_current THEN 1 ELSE 0 END) / COUNT(*), 2) AS reclass_share_pct
FROM {patent_tsv} p
JOIN at_issue ai ON p.patent_id = ai.patent_id
JOIN current cur ON p.patent_id = cur.patent_id
WHERE p.patent_type = 'utility'
  AND cur.section_current IN ('G', 'H')
GROUP BY cur.section_current
"""
gh_records = con.execute(sql_gh).fetchdf()
print(f"\n  G/H reclassification share:")
print(gh_records.to_string())

# ── ANALYSIS 10: WIPO Technology Fields ──
print("\n" + "="*60)
print("ANALYSIS 10: WIPO Technology Fields")
print("="*60)

wipo_tsv = tsv_table("g_wipo_technology")

# Inspect columns
sql_wipo_cols = f"SELECT * FROM {wipo_tsv} LIMIT 10"
wipo_cols = con.execute(sql_wipo_cols).fetchdf()
print(f"  Columns: {list(wipo_cols.columns)}")
print(wipo_cols.head(10).to_string())

# WIPO sector shares over time
sql_wipo_sector = f"""
SELECT 
  YEAR(p.patent_date) AS year,
  w.wipo_sector_title AS sector,
  COUNT(DISTINCT w.patent_id) AS patent_count
FROM {wipo_tsv} w
JOIN {patent_tsv} p ON w.patent_id = p.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date) BETWEEN 1976 AND 2025
  AND w.wipo_sector_title IS NOT NULL
GROUP BY year, sector
ORDER BY year, sector
"""
query_to_json(con, sql_wipo_sector, f"{OUTPUT_DIR}/chapter3/wipo_sector_shares.json")

# Top growing/declining WIPO fields
sql_wipo_change = f"""
WITH field_counts AS (
  SELECT 
    w.wipo_field_title AS field,
    SUM(CASE WHEN YEAR(p.patent_date) BETWEEN 1990 AND 1994 THEN 1 ELSE 0 END) AS count_early,
    SUM(CASE WHEN YEAR(p.patent_date) BETWEEN 2020 AND 2024 THEN 1 ELSE 0 END) AS count_late,
    COUNT(DISTINCT w.patent_id) AS total
  FROM {wipo_tsv} w
  JOIN {patent_tsv} p ON w.patent_id = p.patent_id
  WHERE p.patent_type = 'utility'
    AND w.wipo_field_title IS NOT NULL
  GROUP BY field
  HAVING count_early > 100 AND count_late > 100
)
SELECT 
  field,
  count_early,
  count_late,
  ROUND(100.0 * count_late / NULLIF(count_early, 0) - 100, 1) AS growth_pct,
  total
FROM field_counts
ORDER BY growth_pct DESC
"""
wipo_change = query_to_json(con, sql_wipo_change, f"{OUTPUT_DIR}/chapter3/wipo_field_growth.json")
print("  Top 5 growing WIPO fields:")
for r in wipo_change[:5]:
    print(f"    {r['field']}: {r['growth_pct']}%")
print("  Top 5 declining:")
for r in wipo_change[-5:]:
    print(f"    {r['field']}: {r['growth_pct']}%")

# ── ANALYSIS 11: IPC-Based Convergence ──
print("\n" + "="*60)
print("ANALYSIS 11: IPC Convergence Robustness Check")
print("="*60)

ipc_tsv = tsv_table("g_ipc_at_issue")

# Inspect
sql_ipc_cols = f"SELECT * FROM {ipc_tsv} LIMIT 5"
ipc_cols = con.execute(sql_ipc_cols).fetchdf()
print(f"  Columns: {list(ipc_cols.columns)}")

# NOTE: g_ipc_at_issue uses column name "section" (not "ipc_section")
# Multi-section IPC share vs CPC share
sql_ipc_conv = f"""
WITH ipc_sections AS (
  SELECT patent_id, COUNT(DISTINCT section) AS num_ipc_sections
  FROM {ipc_tsv}
  GROUP BY patent_id
),
cpc_sections AS (
  SELECT patent_id, COUNT(DISTINCT cpc_section) AS num_cpc_sections
  FROM {cpc_current_tsv}
  WHERE cpc_section != 'Y'
  GROUP BY patent_id
)
SELECT 
  YEAR(p.patent_date) AS year,
  COUNT(*) AS total_patents,
  ROUND(100.0 * SUM(CASE WHEN ip.num_ipc_sections >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS ipc_multi_section_pct,
  ROUND(100.0 * SUM(CASE WHEN cp.num_cpc_sections >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS cpc_multi_section_pct
FROM {patent_tsv} p
LEFT JOIN ipc_sections ip ON p.patent_id = ip.patent_id
LEFT JOIN cpc_sections cp ON p.patent_id = cp.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter4", exist_ok=True)
records_conv = query_to_json(con, sql_ipc_conv, f"{OUTPUT_DIR}/chapter4/ipc_vs_cpc_convergence.json")
for r in records_conv:
    if r['year'] in [1976, 2000, 2024]:
        print(f"  {r['year']}: IPC multi-section = {r['ipc_multi_section_pct']}%, CPC = {r['cpc_multi_section_pct']}%")

# ── ANALYSIS 23: Portfolio Scope at WIPO Field Level ──
print("\n" + "="*60)
print("ANALYSIS 23: WIPO Portfolio Diversity (Top 50 Firms)")
print("="*60)

assignee_tsv = tsv_table("g_assignee_disambiguated")

# Shannon entropy across WIPO fields for top 50 firms
sql_wipo_portfolio = f"""
WITH top_firms AS (
  SELECT disambig_assignee_organization AS org, COUNT(*) AS total
  FROM {assignee_tsv}
  WHERE assignee_sequence = 0
    AND disambig_assignee_organization IS NOT NULL
    AND disambig_assignee_organization != ''
  GROUP BY org
  ORDER BY total DESC
  LIMIT 50
),
firm_wipo AS (
  SELECT 
    a.disambig_assignee_organization AS org,
    w.wipo_field_title AS field,
    COUNT(DISTINCT a.patent_id) AS cnt
  FROM {assignee_tsv} a
  JOIN top_firms t ON a.disambig_assignee_organization = t.org
  JOIN {wipo_tsv} w ON a.patent_id = w.patent_id
  WHERE a.assignee_sequence = 0
    AND w.wipo_field_title IS NOT NULL
  GROUP BY a.disambig_assignee_organization, w.wipo_field_title
),
firm_total AS (
  SELECT org, SUM(cnt) AS total FROM firm_wipo GROUP BY org
),
firm_entropy AS (
  SELECT 
    fw.org,
    ft.total AS total_patents,
    COUNT(DISTINCT fw.field) AS num_wipo_fields,
    -SUM((CAST(fw.cnt AS DOUBLE) / ft.total) * LN(CAST(fw.cnt AS DOUBLE) / ft.total)) AS wipo_entropy
  FROM firm_wipo fw
  JOIN firm_total ft ON fw.org = ft.org
  GROUP BY fw.org, ft.total
)
SELECT 
  org AS organization,
  total_patents,
  num_wipo_fields,
  ROUND(wipo_entropy, 3) AS wipo_shannon_entropy
FROM firm_entropy
ORDER BY wipo_entropy DESC
"""
os.makedirs(f"{OUTPUT_DIR}/chapter11", exist_ok=True)
records_wp = query_to_json(con, sql_wipo_portfolio, f"{OUTPUT_DIR}/chapter11/wipo_portfolio_diversity.json")
print("  Top 5 by WIPO entropy:")
for r in records_wp[:5]:
    print(f"    {r['organization']}: entropy={r['wipo_shannon_entropy']}, fields={r['num_wipo_fields']}")

print("\nPhase 5 complete (Analysis 9, 10, 11, 23)")
con.close()
