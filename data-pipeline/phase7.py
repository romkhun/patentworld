import duckdb
import os
import sys
import time

sys.path.insert(0, '/home/saerom/projects/patentworld/data-pipeline')
from config import tsv_table, save_json, query_to_json, OUTPUT_DIR

con = duckdb.connect()
con.execute("SET threads = 8")
con.execute("SET memory_limit = '80GB'")

patent_tsv = tsv_table("g_patent")
app_tsv = tsv_table("g_application")
cpc_tsv = tsv_table("g_cpc_current")

# ── ANALYSIS 13: Examiner Art Group Activity Around Alice ──
print("\n" + "="*60)
print("ANALYSIS 13: Examiner Art Groups Around Alice v. CLS Bank")
print("="*60)

examiner_tsv = tsv_table("g_examiner_not_disambiguated")

# Inspect columns
sql_cols = f"SELECT * FROM {examiner_tsv} LIMIT 10"
cols = con.execute(sql_cols).fetchdf()
print(f"  Columns: {list(cols.columns)}")
print(cols.head(10).to_string())

# Check art_group distribution
sql_ag = f"""
SELECT DISTINCT LEFT(CAST(art_group AS VARCHAR), 2) AS tc_prefix, COUNT(*) AS cnt
FROM {examiner_tsv}
WHERE art_group IS NOT NULL
GROUP BY tc_prefix
ORDER BY cnt DESC
LIMIT 20
"""
ag_result = con.execute(sql_ag).fetchdf()
print("\n  Art group prefixes (Technology Centers):")
print(ag_result.to_string())

# Treatment: TC 3600, 3700 (business methods/fintech)
# Control: TC 1600 (biotech), TC 1700 (chemical)
sql_alice = f"""
WITH examiner_tc AS (
  SELECT 
    e.patent_id,
    CAST(e.art_group AS VARCHAR) AS art_group_str,
    LEFT(CAST(e.art_group AS VARCHAR), 2) AS tc_prefix
  FROM {examiner_tsv} e
  WHERE e.art_group IS NOT NULL
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  CASE 
    WHEN et.tc_prefix IN ('36', '37') THEN 'treatment'
    WHEN et.tc_prefix IN ('16', '17') THEN 'control'
  END AS group_type,
  COUNT(DISTINCT p.patent_id) AS grant_count
FROM {patent_tsv} p
JOIN examiner_tc et ON p.patent_id = et.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 2008 AND 2024
  AND et.tc_prefix IN ('36', '37', '16', '17')
GROUP BY year, group_type
ORDER BY group_type, year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter6", exist_ok=True)
records_alice = query_to_json(con, sql_alice, f"{OUTPUT_DIR}/chapter6/alice_art_group_grants.json")

# Index to 2013 = 100
treatment_2013 = next((r['grant_count'] for r in records_alice if r['group_type']=='treatment' and r['year']==2013), None)
control_2013 = next((r['grant_count'] for r in records_alice if r['group_type']=='control' and r['year']==2013), None)
print(f"\n  Treatment (TC 36/37) in 2013: {treatment_2013}")
print(f"  Control (TC 16/17) in 2013: {control_2013}")

indexed = []
for r in records_alice:
    base = treatment_2013 if r['group_type'] == 'treatment' else control_2013
    if base:
        indexed.append({
            'year': r['year'],
            'group_type': r['group_type'],
            'grant_count': r['grant_count'],
            'indexed': round(100 * r['grant_count'] / base, 1)
        })
save_json(indexed, f"{OUTPUT_DIR}/chapter6/alice_art_group_indexed.json")

for r in indexed:
    if r['year'] in [2013, 2014, 2015, 2018]:
        print(f"  {r['year']} {r['group_type']}: {r['grant_count']:,} (index={r['indexed']})")

# Grant pendency by treatment/control
sql_alice_pendency = f"""
WITH examiner_tc AS (
  SELECT 
    e.patent_id,
    LEFT(CAST(e.art_group AS VARCHAR), 2) AS tc_prefix
  FROM {examiner_tsv} e
  WHERE e.art_group IS NOT NULL
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  CASE 
    WHEN et.tc_prefix IN ('36', '37') THEN 'treatment'
    WHEN et.tc_prefix IN ('16', '17') THEN 'control'
  END AS group_type,
  ROUND(AVG((p.patent_date::DATE - a.filing_date::DATE)), 0) AS avg_pendency_days,
  ROUND(MEDIAN((p.patent_date::DATE - a.filing_date::DATE)), 0) AS median_pendency_days
FROM {patent_tsv} p
JOIN examiner_tc et ON p.patent_id = et.patent_id
JOIN {app_tsv} a ON p.patent_id = a.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 2008 AND 2024
  AND et.tc_prefix IN ('36', '37', '16', '17')
  AND (p.patent_date::DATE - a.filing_date::DATE) BETWEEN 0 AND 10000
GROUP BY year, group_type
ORDER BY group_type, year
"""
query_to_json(con, sql_alice_pendency, f"{OUTPUT_DIR}/chapter6/alice_art_group_pendency.json")

# ── ANALYSIS 19: Law Firm Concentration ──
print("\n" + "="*60)
print("ANALYSIS 19: Law Firm / Patent Prosecution Market")
print("="*60)

attorney_tsv = tsv_table("g_attorney_disambiguated")

# Inspect
sql_att_cols = f"SELECT * FROM {attorney_tsv} LIMIT 10"
att_cols = con.execute(sql_att_cols).fetchdf()
print(f"  Columns: {list(att_cols.columns)}")
print(att_cols.head(10).to_string())

# CR4 and HHI over time
sql_cr4 = f"""
WITH firm_year AS (
  SELECT 
    YEAR(p.patent_date::DATE) AS year,
    a.disambig_attorney_organization AS firm,
    COUNT(DISTINCT a.patent_id) AS patent_count
  FROM {attorney_tsv} a
  JOIN {patent_tsv} p ON a.patent_id = p.patent_id
  WHERE p.patent_type = 'utility'
    AND a.disambig_attorney_organization IS NOT NULL
    AND a.disambig_attorney_organization != ''
    AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
  GROUP BY year, firm
),
year_total AS (
  SELECT year, SUM(patent_count) AS total FROM firm_year GROUP BY year
),
year_ranked AS (
  SELECT fy.year, fy.firm, fy.patent_count, yt.total,
    ROW_NUMBER() OVER (PARTITION BY fy.year ORDER BY fy.patent_count DESC) AS rank
  FROM firm_year fy
  JOIN year_total yt ON fy.year = yt.year
)
SELECT 
  year,
  MAX(total) AS total_with_firm,
  ROUND(100.0 * SUM(CASE WHEN rank <= 4 THEN patent_count ELSE 0 END) / MAX(total), 2) AS cr4_pct,
  ROUND(100.0 * SUM(CASE WHEN rank <= 10 THEN patent_count ELSE 0 END) / MAX(total), 2) AS cr10_pct
FROM year_ranked
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter8", exist_ok=True)
records_cr4 = query_to_json(con, sql_cr4, f"{OUTPUT_DIR}/chapter8/law_firm_concentration.json")
for r in records_cr4:
    if r['year'] in [1990, 2000, 2010, 2024]:
        print(f"  {r['year']}: CR4={r['cr4_pct']}%, CR10={r['cr10_pct']}%")

# Top 20 law firms by cumulative volume
sql_top_firms = f"""
SELECT 
  a.disambig_attorney_organization AS firm,
  COUNT(DISTINCT a.patent_id) AS total_patents,
  MIN(YEAR(p.patent_date::DATE)) AS first_year,
  MAX(YEAR(p.patent_date::DATE)) AS last_year
FROM {attorney_tsv} a
JOIN {patent_tsv} p ON a.patent_id = p.patent_id
WHERE p.patent_type = 'utility'
  AND a.disambig_attorney_organization IS NOT NULL
  AND a.disambig_attorney_organization != ''
GROUP BY firm
ORDER BY total_patents DESC
LIMIT 20
"""
records_top_firms = query_to_json(con, sql_top_firms, f"{OUTPUT_DIR}/chapter8/top_law_firms.json")
print("\n  Top 10 law firms:")
for r in records_top_firms[:10]:
    print(f"    {r['firm']}: {r['total_patents']:,} patents ({r['first_year']}-{r['last_year']})")

# ── ANALYSIS 24: Examiner-Inventor Overlap ──
print("\n" + "="*60)
print("ANALYSIS 24: Examiner-Inventor Name Overlap (Upper Bound)")
print("="*60)

inventor_tsv = tsv_table("g_inventor_disambiguated")

# Get unique examiner names
sql_examiner_names = f"""
SELECT DISTINCT 
  LOWER(TRIM(raw_examiner_name_first)) AS first_name,
  LOWER(TRIM(raw_examiner_name_last)) AS last_name
FROM {examiner_tsv}
WHERE raw_examiner_name_first IS NOT NULL AND raw_examiner_name_first != ''
  AND raw_examiner_name_last IS NOT NULL AND raw_examiner_name_last != ''
"""
# Get unique inventor names  
sql_inventor_names = f"""
SELECT DISTINCT
  LOWER(TRIM(disambig_inventor_name_first)) AS first_name,
  LOWER(TRIM(disambig_inventor_name_last)) AS last_name,
  inventor_id
FROM {inventor_tsv}
WHERE disambig_inventor_name_first IS NOT NULL AND disambig_inventor_name_first != ''
  AND disambig_inventor_name_last IS NOT NULL AND disambig_inventor_name_last != ''
"""

# Count exact matches
sql_overlap = f"""
WITH examiner_names AS (
  SELECT DISTINCT 
    LOWER(TRIM(raw_examiner_name_first)) AS first_name,
    LOWER(TRIM(raw_examiner_name_last)) AS last_name
  FROM {examiner_tsv}
  WHERE raw_examiner_name_first IS NOT NULL AND raw_examiner_name_first != ''
    AND raw_examiner_name_last IS NOT NULL AND raw_examiner_name_last != ''
),
inventor_names AS (
  SELECT DISTINCT
    LOWER(TRIM(disambig_inventor_name_first)) AS first_name,
    LOWER(TRIM(disambig_inventor_name_last)) AS last_name
  FROM {inventor_tsv}
  WHERE disambig_inventor_name_first IS NOT NULL AND disambig_inventor_name_first != ''
    AND disambig_inventor_name_last IS NOT NULL AND disambig_inventor_name_last != ''
)
SELECT 
  (SELECT COUNT(*) FROM examiner_names) AS unique_examiner_names,
  (SELECT COUNT(*) FROM inventor_names) AS unique_inventor_names,
  COUNT(*) AS name_matches
FROM examiner_names e
JOIN inventor_names i ON e.first_name = i.first_name AND e.last_name = i.last_name
"""
os.makedirs(f"{OUTPUT_DIR}/chapter13", exist_ok=True)
overlap = con.execute(sql_overlap).fetchdf()
print(overlap.to_string())

# Save result
overlap_data = overlap.to_dict(orient='records')
save_json(overlap_data, f"{OUTPUT_DIR}/chapter13/examiner_inventor_overlap.json")
print("  NOTE: This is an upper bound due to common name matches.")

print("\n Phase 7 complete (Analysis 13, 19, 24)")
con.close()
