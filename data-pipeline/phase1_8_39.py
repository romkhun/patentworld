import duckdb
import os
import sys
import time
import orjson

sys.path.insert(0, '/home/saerom/projects/patentworld/data-pipeline')
from config import tsv_table, save_json, query_to_json, OUTPUT_DIR, TEMP_DIR

con = duckdb.connect()
con.execute("SET threads = 38")
con.execute("SET memory_limit = '200GB'")

# ── ANALYSIS 1: Application-Year vs Grant-Year Trends ──
print("\n" + "="*60)
print("ANALYSIS 1: Application-Year vs Grant-Year Trends")
print("="*60)

patent_tsv = tsv_table("g_patent")
app_tsv = tsv_table("g_application")

# 1a: Filing-year vs Grant-year counts (utility only)
sql_dual = f"""
WITH base AS (
  SELECT 
    p.patent_id,
    YEAR(p.patent_date::DATE) AS grant_year,
    YEAR(a.filing_date::DATE) AS filing_year
  FROM {patent_tsv} p
  JOIN {app_tsv} a ON p.patent_id = a.patent_id
  WHERE p.patent_type = 'utility'
    AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
    AND YEAR(a.filing_date::DATE) BETWEEN 1970 AND 2025
)
SELECT 
  'grant_year' AS series,
  grant_year AS year,
  COUNT(*) AS count
FROM base
WHERE grant_year BETWEEN 1976 AND 2025
GROUP BY grant_year

UNION ALL

SELECT 
  'filing_year' AS series,
  filing_year AS year,
  COUNT(*) AS count
FROM base
WHERE filing_year BETWEEN 1976 AND 2024
GROUP BY filing_year

ORDER BY series, year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter1", exist_ok=True)
records = query_to_json(con, sql_dual, f"{OUTPUT_DIR}/chapter1/filing_vs_grant_year.json")

# Find peaks
grant_peak = max([r for r in records if r['series']=='grant_year'], key=lambda x: x['count'])
filing_peak = max([r for r in records if r['series']=='filing_year' and r['year'] <= 2021], key=lambda x: x['count']) if any(r['series']=='filing_year' for r in records) else None
print(f"  Grant-year peak: {grant_peak}")

# 1b: Median grant pendency by filing year
sql_pendency = f"""
WITH base AS (
  SELECT 
    YEAR(a.filing_date::DATE) AS filing_year,
    (p.patent_date::DATE - a.filing_date::DATE) AS lag_days
  FROM {patent_tsv} p
  JOIN {app_tsv} a ON p.patent_id = a.patent_id
  WHERE p.patent_type = 'utility'
    AND YEAR(a.filing_date::DATE) BETWEEN 1976 AND 2022
    AND (p.patent_date::DATE - a.filing_date::DATE) BETWEEN 0 AND 10000
)
SELECT 
  filing_year AS year,
  ROUND(AVG(lag_days) / 365.25, 2) AS avg_pendency_years,
  ROUND(MEDIAN(lag_days) / 365.25, 2) AS median_pendency_years,
  COUNT(*) AS patent_count
FROM base
GROUP BY filing_year
ORDER BY filing_year
"""
records2 = query_to_json(con, sql_pendency, f"{OUTPUT_DIR}/chapter1/pendency_by_filing_year.json")
print(f"  Pendency spot-checks:")
for r in records2:
    if r['year'] in [1980, 2000, 2010, 2020]:
        print(f"    {r['year']}: median={r['median_pendency_years']}y, avg={r['avg_pendency_years']}y, n={r['patent_count']}")

# ── ANALYSIS 8: Drawing Complexity (g_figures) ──
print("\n" + "="*60)
print("ANALYSIS 8: Drawing Complexity (g_figures)")
print("="*60)

figures_tsv = tsv_table("g_figures")

# 8a: Mean figures per patent by grant year
sql_figs = f"""
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  ROUND(AVG(f.num_figures), 2) AS avg_figures,
  ROUND(AVG(f.num_sheets), 2) AS avg_sheets,
  ROUND(MEDIAN(f.num_figures), 2) AS median_figures,
  COUNT(*) AS patent_count
FROM {figures_tsv} f
JOIN {patent_tsv} p ON f.patent_id = p.patent_id
WHERE YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter2", exist_ok=True)
records3 = query_to_json(con, sql_figs, f"{OUTPUT_DIR}/chapter2/figures_per_patent.json")
print(f"  Figures spot-checks:")
for r in records3:
    if r['year'] in [1980, 2000, 2020]:
        print(f"    {r['year']}: avg_figures={r['avg_figures']}, avg_sheets={r['avg_sheets']}, n={r['patent_count']}")

# 8b: Mean figures by CPC section (recent 5 years)
cpc_tsv = tsv_table("g_cpc_current")
sql_figs_cpc = f"""
WITH primary_cpc AS (
  SELECT patent_id, cpc_section
  FROM {cpc_tsv}
  WHERE cpc_sequence = 0
)
SELECT 
  c.cpc_section,
  ROUND(AVG(f.num_figures), 2) AS avg_figures,
  ROUND(AVG(f.num_sheets), 2) AS avg_sheets,
  COUNT(*) AS patent_count
FROM {figures_tsv} f
JOIN {patent_tsv} p ON f.patent_id = p.patent_id
JOIN primary_cpc c ON f.patent_id = c.patent_id
WHERE YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
GROUP BY c.cpc_section
ORDER BY avg_figures DESC
"""
records4 = query_to_json(con, sql_figs_cpc, f"{OUTPUT_DIR}/chapter2/figures_by_cpc_section.json")
print(f"  Figures by CPC section (2020-2025):")
for r in records4:
    print(f"    {r['cpc_section']}: avg_figures={r['avg_figures']}")

# ── ANALYSIS 39: Application-Year Trends for ACT 6 Domains ──
print("\n" + "="*60)
print("ANALYSIS 39: ACT 6 Domain Filing vs Grant Year")
print("="*60)

DOMAINS = {
    "3D Printing": "cpc_subclass = 'B33Y' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%'",
    "AgTech": "cpc_subclass IN ('A01B','A01C','A01G','A01H') OR cpc_group LIKE 'G06Q50/02%'",
    "AI": "cpc_group LIKE 'G06N%' OR cpc_group LIKE 'G06F18%' OR cpc_subclass = 'G06V'",
    "AV": "cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%'",
    "Biotech": "cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%'",
    "Blockchain": "cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%'",
    "Cyber": "cpc_group LIKE 'G06F21%' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%'",
    "DigiHealth": "cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%'",
    "Green": "cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%'",
    "Quantum": "cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%'",
    "Semiconductor": "cpc_subclass IN ('H01L','H10N','H10K')",
    "Space": "cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%'",
}

all_domain_records = []
for domain, cpc_filter in DOMAINS.items():
    sql = f"""
    WITH domain_patents AS (
      SELECT DISTINCT c.patent_id
      FROM {cpc_tsv} c
      WHERE {cpc_filter}
    )
    SELECT 
      '{domain}' AS domain,
      'grant_year' AS series,
      YEAR(p.patent_date::DATE) AS year,
      COUNT(*) AS count
    FROM domain_patents d
    JOIN {patent_tsv} p ON d.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
    GROUP BY year

    UNION ALL

    SELECT
      '{domain}' AS domain,
      'filing_year' AS series,
      YEAR(a.filing_date::DATE) AS year,
      COUNT(*) AS count
    FROM domain_patents d
    JOIN {patent_tsv} p ON d.patent_id = p.patent_id
    JOIN {app_tsv} a ON d.patent_id = a.patent_id
    WHERE p.patent_type = 'utility'
      AND YEAR(a.filing_date::DATE) BETWEEN 1976 AND 2024
    GROUP BY year
    
    ORDER BY series, year
    """
    recs = con.execute(sql).fetchdf().to_dict(orient='records')
    all_domain_records.extend(recs)
    grant_recs = [r for r in recs if r['series'] == 'grant_year']
    if grant_recs:
        peak = max(grant_recs, key=lambda x: x['count'])
        print(f"  {domain}: grant peak = {peak['year']} ({peak['count']:,})")

os.makedirs(f"{OUTPUT_DIR}/act6", exist_ok=True)
save_json(all_domain_records, f"{OUTPUT_DIR}/act6/act6_domain_filing_vs_grant.json")

print("\n✓ Phase 1 + Analysis 8 + Analysis 39 complete")
con.close()
