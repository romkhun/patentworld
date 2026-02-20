import duckdb
import os
import sys
import time
import math

sys.path.insert(0, '/home/saerom/projects/patentworld/data-pipeline')
from config import tsv_table, save_json, query_to_json, OUTPUT_DIR

con = duckdb.connect()
con.execute("SET threads = 10")
con.execute("SET memory_limit = '100GB'")

patent_tsv = tsv_table("g_patent")
cpc_tsv = tsv_table("g_cpc_current")
assignee_tsv = tsv_table("g_assignee_disambiguated")
inventor_tsv = tsv_table("g_inventor_disambiguated")
location_tsv = tsv_table("g_location_disambiguated")

# ── ANALYSIS 18: Filing Route — Direct vs. PCT Entry ──
print("\n" + "="*60)
print("ANALYSIS 18: Filing Route (PCT / Direct / Domestic)")
print("="*60)

fp_tsv = tsv_table("g_foreign_priority")
pct_tsv = tsv_table("g_pct_data")

# Inspect columns
sql_fp_cols = f"SELECT * FROM {fp_tsv} LIMIT 5"
fp_cols = con.execute(sql_fp_cols).fetchdf()
print(f"  g_foreign_priority columns: {list(fp_cols.columns)}")

sql_pct_cols = f"SELECT * FROM {pct_tsv} LIMIT 5"
pct_cols = con.execute(sql_pct_cols).fetchdf()
print(f"  g_pct_data columns: {list(pct_cols.columns)}")
print(pct_cols.head().to_string())

# Classify filing route
sql_route = f"""
WITH pct_patents AS (
  SELECT DISTINCT patent_id FROM {pct_tsv}
),
fp_patents AS (
  SELECT DISTINCT patent_id FROM {fp_tsv}
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  COUNT(*) AS total,
  SUM(CASE WHEN pct.patent_id IS NOT NULL THEN 1 ELSE 0 END) AS pct_route,
  SUM(CASE WHEN fp.patent_id IS NOT NULL AND pct.patent_id IS NULL THEN 1 ELSE 0 END) AS direct_foreign,
  SUM(CASE WHEN fp.patent_id IS NULL AND pct.patent_id IS NULL THEN 1 ELSE 0 END) AS domestic,
  ROUND(100.0 * SUM(CASE WHEN pct.patent_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS pct_share_pct,
  ROUND(100.0 * SUM(CASE WHEN fp.patent_id IS NOT NULL AND pct.patent_id IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS direct_foreign_share_pct,
  ROUND(100.0 * SUM(CASE WHEN fp.patent_id IS NULL AND pct.patent_id IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS domestic_share_pct
FROM {patent_tsv} p
LEFT JOIN pct_patents pct ON p.patent_id = pct.patent_id
LEFT JOIN fp_patents fp ON p.patent_id = fp.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter8", exist_ok=True)
records_route = query_to_json(con, sql_route, f"{OUTPUT_DIR}/chapter8/filing_route_over_time.json")
for r in records_route:
    if r['year'] in [1980, 2000, 2024]:
        print(f"  {r['year']}: PCT={r['pct_share_pct']}%, Direct Foreign={r['direct_foreign_share_pct']}%, Domestic={r['domestic_share_pct']}%")

# Filing route by top 10 assignee countries
sql_route_country = f"""
WITH pct_patents AS (
  SELECT DISTINCT patent_id FROM {pct_tsv}
),
fp_patents AS (
  SELECT DISTINCT patent_id FROM {fp_tsv}
),
inv_country AS (
  SELECT i.patent_id, l.disambig_country AS country
  FROM {inventor_tsv} i
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE i.inventor_sequence = 0
),
top_countries AS (
  SELECT country, COUNT(*) AS cnt
  FROM inv_country
  WHERE country IS NOT NULL AND country != ''
  GROUP BY country
  ORDER BY cnt DESC
  LIMIT 10
)
SELECT 
  ic.country,
  FLOOR(YEAR(p.patent_date::DATE) / 5) * 5 AS period,
  COUNT(*) AS total,
  ROUND(100.0 * SUM(CASE WHEN pct.patent_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS pct_share,
  ROUND(100.0 * SUM(CASE WHEN fp.patent_id IS NOT NULL AND pct.patent_id IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS direct_foreign_share,
  ROUND(100.0 * SUM(CASE WHEN fp.patent_id IS NULL AND pct.patent_id IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS domestic_share
FROM {patent_tsv} p
JOIN inv_country ic ON p.patent_id = ic.patent_id
JOIN top_countries tc ON ic.country = tc.country
LEFT JOIN pct_patents pct ON p.patent_id = pct.patent_id
LEFT JOIN fp_patents fp ON p.patent_id = fp.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY ic.country, period
ORDER BY ic.country, period
"""
query_to_json(con, sql_route_country, f"{OUTPUT_DIR}/chapter8/filing_route_by_country.json")

# ── ANALYSIS 32: Priority Country ──
print("\n" + "="*60)
print("ANALYSIS 32: Priority Country — Where Ideas Originate")
print("="*60)

sql_priority = f"""
WITH earliest_priority AS (
  SELECT patent_id, 
    FIRST(foreign_country_filed ORDER BY filing_date) AS priority_country
  FROM {fp_tsv}
  WHERE foreign_country_filed IS NOT NULL AND foreign_country_filed != ''
  GROUP BY patent_id
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  COALESCE(ep.priority_country, 'US') AS priority_country,
  COUNT(*) AS count
FROM {patent_tsv} p
LEFT JOIN earliest_priority ep ON p.patent_id = ep.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year, COALESCE(ep.priority_country, 'US')
HAVING COUNT(*) > 50
ORDER BY year, count DESC
"""
os.makedirs(f"{OUTPUT_DIR}/chapter19", exist_ok=True)
records_pri = query_to_json(con, sql_priority, f"{OUTPUT_DIR}/chapter19/priority_country_composition.json")

# Top priority countries for 2024
top_2024 = [r for r in records_pri if r['year'] == 2024]
top_2024.sort(key=lambda x: x['count'], reverse=True)
print("  Top priority countries (2024):")
for r in top_2024[:10]:
    print(f"    {r['priority_country']}: {r['count']:,}")

# ── ANALYSIS 33: PCT Route by Country ──
print("\n" + "="*60)
print("ANALYSIS 33: PCT Usage by Country")
print("="*60)

sql_pct_country = f"""
WITH pct_patents AS (
  SELECT DISTINCT patent_id FROM {pct_tsv}
),
inv_country AS (
  SELECT i.patent_id, l.disambig_country AS country
  FROM {inventor_tsv} i
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE i.inventor_sequence = 0
),
top_countries AS (
  SELECT country, COUNT(*) AS cnt FROM inv_country
  WHERE country IS NOT NULL AND country != ''
  GROUP BY country ORDER BY cnt DESC LIMIT 10
)
SELECT 
  ic.country,
  YEAR(p.patent_date::DATE) AS year,
  COUNT(*) AS total,
  SUM(CASE WHEN pct.patent_id IS NOT NULL THEN 1 ELSE 0 END) AS pct_count,
  ROUND(100.0 * SUM(CASE WHEN pct.patent_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS pct_share
FROM {patent_tsv} p
JOIN inv_country ic ON p.patent_id = ic.patent_id
JOIN top_countries tc ON ic.country = tc.country
LEFT JOIN pct_patents pct ON p.patent_id = pct.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1990 AND 2025
GROUP BY ic.country, year
ORDER BY ic.country, year
"""
query_to_json(con, sql_pct_country, f"{OUTPUT_DIR}/chapter19/pct_share_by_country.json")

# ── ANALYSIS 28: Gender by Filing Route ──
print("\n" + "="*60)
print("ANALYSIS 28: Gender by Filing Route")  
print("="*60)

sql_gender_route = f"""
WITH pct_patents AS (
  SELECT DISTINCT patent_id FROM {pct_tsv}
),
fp_patents AS (
  SELECT DISTINCT patent_id FROM {fp_tsv}
),
inv_gender AS (
  SELECT patent_id, 
    gender_code,
    inventor_sequence
  FROM {inventor_tsv}
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  CASE 
    WHEN fp.patent_id IS NULL AND pct.patent_id IS NULL THEN 'domestic'
    ELSE 'foreign_origin'
  END AS origin,
  COUNT(*) AS total_inventors,
  SUM(CASE WHEN ig.gender_code = 'F' THEN 1 ELSE 0 END) AS female_inventors,
  ROUND(100.0 * SUM(CASE WHEN ig.gender_code = 'F' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS female_share_pct
FROM {patent_tsv} p
JOIN inv_gender ig ON p.patent_id = ig.patent_id
LEFT JOIN pct_patents pct ON p.patent_id = pct.patent_id
LEFT JOIN fp_patents fp ON p.patent_id = fp.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
  AND ig.gender_code IN ('M', 'F')
GROUP BY year, origin
ORDER BY year, origin
"""
os.makedirs(f"{OUTPUT_DIR}/chapter16", exist_ok=True)
records_gender = query_to_json(con, sql_gender_route, f"{OUTPUT_DIR}/chapter16/gender_by_filing_route.json")
for r in records_gender:
    if r['year'] in [2000, 2024]:
        print(f"  {r['year']} {r['origin']}: female={r['female_share_pct']}%")

# ── ANALYSIS 35: Inventor International Mobility ──
print("\n" + "="*60)
print("ANALYSIS 35: Inventor International Mobility")
print("="*60)

sql_mobility = f"""
WITH inv_country_seq AS (
  SELECT 
    i.inventor_id,
    p.patent_date,
    l.disambig_country AS country
  FROM {inventor_tsv} i
  JOIN {patent_tsv} p ON i.patent_id = p.patent_id
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE l.disambig_country IS NOT NULL AND l.disambig_country != ''
  AND p.patent_type = 'utility'
),
inv_with_moves AS (
  SELECT inventor_id, COUNT(DISTINCT country) AS num_countries,
    MIN(YEAR(patent_date::DATE)) AS first_year,
    MAX(YEAR(patent_date::DATE)) AS last_year
  FROM inv_country_seq
  GROUP BY inventor_id
  HAVING COUNT(*) >= 5
),
period_mobility AS (
  SELECT 
    FLOOR(m.first_year / 5) * 5 AS period_start,
    COUNT(*) AS total_inventors,
    SUM(CASE WHEN m.num_countries >= 2 THEN 1 ELSE 0 END) AS mobile_inventors,
    ROUND(100.0 * SUM(CASE WHEN m.num_countries >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS mobility_rate
  FROM inv_with_moves m
  WHERE m.first_year BETWEEN 1976 AND 2020
  GROUP BY period_start
)
SELECT * FROM period_mobility ORDER BY period_start
"""
os.makedirs(f"{OUTPUT_DIR}/chapter21", exist_ok=True)
records_mob = query_to_json(con, sql_mobility, f"{OUTPUT_DIR}/chapter21/inventor_international_mobility.json")
for r in records_mob:
    print(f"  {int(r['period_start'])}s: mobility rate = {r['mobility_rate']}% ({r['mobile_inventors']:,} / {r['total_inventors']:,})")

# Top country-pair flows (last 10 years)
sql_flows = f"""
WITH inv_ordered AS (
  SELECT 
    i.inventor_id,
    l.disambig_country AS country,
    YEAR(p.patent_date::DATE) AS year,
    ROW_NUMBER() OVER (PARTITION BY i.inventor_id ORDER BY p.patent_date) AS seq
  FROM {inventor_tsv} i
  JOIN {patent_tsv} p ON i.patent_id = p.patent_id
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE l.disambig_country IS NOT NULL AND l.disambig_country != ''
    AND p.patent_type = 'utility'
    AND YEAR(p.patent_date::DATE) BETWEEN 2015 AND 2025
),
moves AS (
  SELECT 
    a.inventor_id,
    a.country AS from_country,
    b.country AS to_country
  FROM inv_ordered a
  JOIN inv_ordered b ON a.inventor_id = b.inventor_id AND b.seq = a.seq + 1
  WHERE a.country != b.country
)
SELECT 
  from_country,
  to_country,
  COUNT(*) AS move_count
FROM moves
GROUP BY from_country, to_country
HAVING COUNT(*) >= 50
ORDER BY move_count DESC
LIMIT 20
"""
records_flows = query_to_json(con, sql_flows, f"{OUTPUT_DIR}/chapter21/inventor_mobility_flows.json")
print("\n  Top 10 mobility flows (2015-2025):")
for r in records_flows[:10]:
    print(f"    {r['from_country']} -> {r['to_country']}: {r['move_count']:,}")

# ── ANALYSIS 29: Cross-Institutional Collaboration ──
print("\n" + "="*60)
print("ANALYSIS 29: Cross-Institutional Collaboration Rate")
print("="*60)

sql_cross = f"""
WITH patent_assignee_count AS (
  SELECT patent_id, COUNT(DISTINCT disambig_assignee_organization) AS num_orgs
  FROM {assignee_tsv}
  WHERE disambig_assignee_organization IS NOT NULL AND disambig_assignee_organization != ''
  GROUP BY patent_id
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  COUNT(*) AS total_patents,
  SUM(CASE WHEN pac.num_orgs >= 2 THEN 1 ELSE 0 END) AS cross_institutional,
  ROUND(100.0 * SUM(CASE WHEN pac.num_orgs >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS cross_institutional_pct
FROM {patent_tsv} p
LEFT JOIN patent_assignee_count pac ON p.patent_id = pac.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter17", exist_ok=True)
records_cross = query_to_json(con, sql_cross, f"{OUTPUT_DIR}/chapter17/cross_institutional_rate.json")
for r in records_cross:
    if r['year'] in [1980, 2000, 2024]:
        print(f"  {r['year']}: cross-institutional = {r['cross_institutional_pct']}%")

# Cross-institutional by CPC section
sql_cross_cpc = f"""
WITH patent_assignee_count AS (
  SELECT patent_id, COUNT(DISTINCT disambig_assignee_organization) AS num_orgs
  FROM {assignee_tsv}
  WHERE disambig_assignee_organization IS NOT NULL AND disambig_assignee_organization != ''
  GROUP BY patent_id
),
primary_cpc AS (
  SELECT patent_id, cpc_section FROM {cpc_tsv} WHERE cpc_sequence = 0
)
SELECT 
  c.cpc_section,
  COUNT(*) AS total,
  ROUND(100.0 * SUM(CASE WHEN pac.num_orgs >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS cross_institutional_pct
FROM {patent_tsv} p
LEFT JOIN patent_assignee_count pac ON p.patent_id = pac.patent_id
JOIN primary_cpc c ON p.patent_id = c.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
GROUP BY c.cpc_section
ORDER BY cross_institutional_pct DESC
"""
query_to_json(con, sql_cross_cpc, f"{OUTPUT_DIR}/chapter17/cross_institutional_by_cpc.json")

# ── ANALYSIS 30: County-Level Geography ──
print("\n" + "="*60)
print("ANALYSIS 30: County-Level Patent Geography")
print("="*60)

sql_county = f"""
WITH inv_county AS (
  SELECT 
    i.patent_id,
    l.county AS county,
    l.disambig_state AS state,
    l.disambig_country AS country
  FROM {inventor_tsv} i
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE i.inventor_sequence = 0
    AND l.disambig_country = 'US'
    AND l.county IS NOT NULL AND l.county != ''
    AND l.disambig_state IS NOT NULL
)
SELECT 
  ic.county || ', ' || ic.state AS county_state,
  ic.state,
  COUNT(*) AS patent_count
FROM inv_county ic
JOIN {patent_tsv} p ON ic.patent_id = p.patent_id
WHERE p.patent_type = 'utility'
GROUP BY ic.county, ic.state
ORDER BY patent_count DESC
LIMIT 50
"""
os.makedirs(f"{OUTPUT_DIR}/chapter18", exist_ok=True)
records_county = query_to_json(con, sql_county, f"{OUTPUT_DIR}/chapter18/top_counties.json")
print("  Top 10 counties:")
for r in records_county[:10]:
    print(f"    {r['county_state']}: {r['patent_count']:,}")

# County concentration over time (Gini by 5-year period)
sql_county_gini = f"""
WITH inv_county AS (
  SELECT 
    i.patent_id,
    l.county || ', ' || l.disambig_state AS county_state,
    YEAR(p.patent_date::DATE) AS grant_year
  FROM {inventor_tsv} i
  JOIN {patent_tsv} p ON i.patent_id = p.patent_id
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE i.inventor_sequence = 0
    AND l.disambig_country = 'US'
    AND l.county IS NOT NULL AND l.county != ''
    AND l.disambig_state IS NOT NULL
    AND p.patent_type = 'utility'
),
period_county AS (
  SELECT 
    FLOOR(grant_year / 5) * 5 AS period,
    county_state,
    COUNT(*) AS cnt
  FROM inv_county
  GROUP BY period, county_state
),
top_share AS (
  SELECT 
    period,
    SUM(cnt) AS total,
    (SELECT SUM(cnt2) FROM (
      SELECT cnt AS cnt2 FROM period_county pc2 
      WHERE pc2.period = pc.period 
      ORDER BY cnt2 DESC LIMIT 50
    )) AS top50_sum
  FROM period_county pc
  GROUP BY period
)
SELECT period, total, top50_sum, ROUND(100.0 * top50_sum / total, 2) AS top50_share_pct
FROM top_share
WHERE period BETWEEN 1975 AND 2020
ORDER BY period
"""
records_gini = query_to_json(con, sql_county_gini, f"{OUTPUT_DIR}/chapter18/county_concentration_over_time.json")

# ── ANALYSIS 25: Multi-Institution Inventor Trajectories ──
print("\n" + "="*60)
print("ANALYSIS 25: Multi-Institution Inventor Trajectories")
print("="*60)

sql_multi_type = f"""
WITH inv_assignee AS (
  SELECT 
    i.inventor_id,
    a.assignee_type,
    COUNT(*) AS patent_count
  FROM {inventor_tsv} i
  JOIN {assignee_tsv} a ON i.patent_id = a.patent_id
  WHERE a.assignee_sequence = 0
    AND a.assignee_type IS NOT NULL
  GROUP BY i.inventor_id, a.assignee_type
),
inv_types AS (
  SELECT inventor_id, COUNT(DISTINCT assignee_type) AS num_types
  FROM inv_assignee
  GROUP BY inventor_id
),
inv_career AS (
  SELECT i.inventor_id, COUNT(DISTINCT i.patent_id) AS career_patents
  FROM {inventor_tsv} i
  GROUP BY i.inventor_id
)
SELECT 
  CASE 
    WHEN ic.career_patents >= 10 THEN '10+'
    WHEN ic.career_patents >= 5 THEN '5-9'
    WHEN ic.career_patents >= 2 THEN '2-4'
    ELSE '1'
  END AS career_length_bin,
  COUNT(*) AS total_inventors,
  SUM(CASE WHEN it.num_types >= 2 THEN 1 ELSE 0 END) AS multi_type,
  ROUND(100.0 * SUM(CASE WHEN it.num_types >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS multi_type_pct
FROM inv_types it
JOIN inv_career ic ON it.inventor_id = ic.inventor_id
GROUP BY career_length_bin
ORDER BY career_length_bin
"""
os.makedirs(f"{OUTPUT_DIR}/chapter13", exist_ok=True)
records_mt = query_to_json(con, sql_multi_type, f"{OUTPUT_DIR}/chapter13/multi_type_inventors.json")
for r in records_mt:
    print(f"  Career {r['career_length_bin']}: multi-type = {r['multi_type_pct']}%")

# ── ANALYSIS 31: Inventor Geocoordinate Clustering (DBSCAN) ──
print("\n" + "="*60)
print("ANALYSIS 31: Innovation Clusters (simplified)")
print("="*60)

# Instead of DBSCAN, do city-level clustering as a practical alternative
sql_cities = f"""
WITH inv_city AS (
  SELECT 
    i.patent_id,
    l.disambig_city AS city,
    l.disambig_state AS state,
    l.disambig_country AS country,
    l.latitude,
    l.longitude
  FROM {inventor_tsv} i
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE i.inventor_sequence = 0
    AND l.disambig_city IS NOT NULL AND l.disambig_city != ''
)
SELECT 
  ic.city || ', ' || COALESCE(ic.state, ic.country) AS location,
  ic.country,
  ROUND(AVG(CAST(ic.latitude AS FLOAT)), 4) AS lat,
  ROUND(AVG(CAST(ic.longitude AS FLOAT)), 4) AS lng,
  COUNT(*) AS patent_count
FROM inv_city ic
JOIN {patent_tsv} p ON ic.patent_id = p.patent_id
WHERE p.patent_type = 'utility'
GROUP BY ic.city, ic.state, ic.country
ORDER BY patent_count DESC
LIMIT 100
"""
records_cities = query_to_json(con, sql_cities, f"{OUTPUT_DIR}/chapter18/innovation_clusters.json")
print("  Top 10 innovation clusters:")
for r in records_cities[:10]:
    print(f"    {r['location']}: {r['patent_count']:,}")

# ── ANALYSIS 16: Government Contract Concentration ──
print("\n" + "="*60)
print("ANALYSIS 16: Government Contract Patent Concentration")
print("="*60)

gov_contracts_tsv = tsv_table("g_gov_interest_contracts")
gov_org_tsv = tsv_table("g_gov_interest_org")

# Inspect
sql_gc_cols = f"SELECT * FROM {gov_contracts_tsv} LIMIT 5"
gc_cols = con.execute(sql_gc_cols).fetchdf()
print(f"  g_gov_interest_contracts columns: {list(gc_cols.columns)}")
print(gc_cols.head().to_string())

# Top contracts by patent count
sql_top_contracts = f"""
SELECT 
  gc.contract_award_number,
  COALESCE(go2.fedagency_name, 'Unknown') AS agency,
  COUNT(DISTINCT gc.patent_id) AS patent_count
FROM {gov_contracts_tsv} gc
LEFT JOIN {gov_org_tsv} go2 ON gc.patent_id = go2.patent_id
WHERE gc.contract_award_number IS NOT NULL AND gc.contract_award_number != ''
GROUP BY gc.contract_award_number, go2.fedagency_name
ORDER BY patent_count DESC
LIMIT 50
"""
os.makedirs(f"{OUTPUT_DIR}/chapter7", exist_ok=True)
records_gc = query_to_json(con, sql_top_contracts, f"{OUTPUT_DIR}/chapter7/top_government_contracts.json")
print("  Top 10 government contracts:")
for r in records_gc[:10]:
    print(f"    {r['contract_award_number']} ({r['agency']}): {r['patent_count']} patents")

# Concentration: share of patents from top 10 contracts
total_gov = con.execute(f"SELECT COUNT(DISTINCT patent_id) FROM {gov_contracts_tsv} WHERE contract_award_number IS NOT NULL AND contract_award_number != ''").fetchone()[0]
top10_sum = sum(r['patent_count'] for r in records_gc[:10])
print(f"  Top 10 contracts: {top10_sum} / {total_gov} = {100*top10_sum/total_gov:.1f}%")

print("\n✓ Phase 6 + 9 + 16 complete")
con.close()
