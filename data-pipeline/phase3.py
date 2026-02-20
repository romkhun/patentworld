import duckdb
import os
import sys
import time

sys.path.insert(0, '/home/saerom/projects/patentworld/data-pipeline')
from config import tsv_table, save_json, query_to_json, OUTPUT_DIR

con = duckdb.connect()
con.execute("SET threads = 12")
con.execute("SET memory_limit = '150GB'")

patent_tsv = tsv_table("g_patent")
cpc_tsv = tsv_table("g_cpc_current")
assignee_tsv = tsv_table("g_assignee_disambiguated")
inventor_tsv = tsv_table("g_inventor_disambiguated")
location_tsv = tsv_table("g_location_disambiguated")
citation_tsv = tsv_table("g_us_patent_citation")

# ── ANALYSIS 5: NPL Citations ──
print("\n" + "="*60)
print("ANALYSIS 5: Non-Patent Literature (NPL) Citation Rates")
print("="*60)

other_ref_tsv = tsv_table("g_other_reference")

# Inspect columns
sql_cols = f"SELECT * FROM {other_ref_tsv} LIMIT 5"
cols = con.execute(sql_cols).fetchdf()
print(f"  g_other_reference columns: {list(cols.columns)}")

# Count NPL per patent, then aggregate by year
sql_npl = f"""
WITH npl_counts AS (
  SELECT patent_id, COUNT(*) AS npl_count
  FROM {other_ref_tsv}
  GROUP BY patent_id
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  ROUND(AVG(COALESCE(n.npl_count, 0)), 2) AS avg_npl_citations,
  ROUND(MEDIAN(COALESCE(n.npl_count, 0)), 2) AS median_npl_citations,
  COUNT(*) AS total_patents,
  SUM(CASE WHEN n.npl_count > 0 THEN 1 ELSE 0 END) AS patents_with_npl
FROM {patent_tsv} p
LEFT JOIN npl_counts n ON p.patent_id = n.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter2", exist_ok=True)
records_npl = query_to_json(con, sql_npl, f"{OUTPUT_DIR}/chapter2/npl_citations_per_year.json")
for r in records_npl:
    if r['year'] in [1980, 2000, 2020]:
        print(f"  {r['year']}: avg NPL = {r['avg_npl_citations']}, median = {r['median_npl_citations']}")

# NPL by CPC section (recent 5 years)
sql_npl_cpc = f"""
WITH npl_counts AS (
  SELECT patent_id, COUNT(*) AS npl_count
  FROM {other_ref_tsv}
  GROUP BY patent_id
),
primary_cpc AS (
  SELECT patent_id, cpc_section FROM {cpc_tsv} WHERE cpc_sequence = 0
)
SELECT 
  c.cpc_section,
  ROUND(AVG(COALESCE(n.npl_count, 0)), 2) AS avg_npl_citations,
  COUNT(*) AS patent_count
FROM {patent_tsv} p
JOIN primary_cpc c ON p.patent_id = c.patent_id
LEFT JOIN npl_counts n ON p.patent_id = n.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
GROUP BY c.cpc_section
ORDER BY avg_npl_citations DESC
"""
records_npl_cpc = query_to_json(con, sql_npl_cpc, f"{OUTPUT_DIR}/chapter2/npl_citations_by_cpc.json")
for r in records_npl_cpc:
    print(f"  CPC {r['cpc_section']}: avg NPL = {r['avg_npl_citations']}")

# ── ANALYSIS 6: Foreign Patent Citation Share ──
print("\n" + "="*60)
print("ANALYSIS 6: Foreign Patent Citation Share")
print("="*60)

foreign_cit_tsv = tsv_table("g_foreign_citation")

# Inspect
sql_fc_cols = f"SELECT * FROM {foreign_cit_tsv} LIMIT 5"
fc_cols = con.execute(sql_fc_cols).fetchdf()
print(f"  g_foreign_citation columns: {list(fc_cols.columns)}")

# Foreign vs US citation share
sql_foreign = f"""
WITH us_cit AS (
  SELECT patent_id, COUNT(*) AS us_count
  FROM {citation_tsv}
  GROUP BY patent_id
),
foreign_cit AS (
  SELECT patent_id, COUNT(*) AS foreign_count
  FROM {foreign_cit_tsv}
  GROUP BY patent_id
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  COUNT(*) AS total_patents,
  ROUND(AVG(COALESCE(fc.foreign_count, 0)), 2) AS avg_foreign_citations,
  ROUND(AVG(COALESCE(uc.us_count, 0)), 2) AS avg_us_citations,
  ROUND(100.0 * AVG(COALESCE(CAST(fc.foreign_count AS DOUBLE), 0) / NULLIF(COALESCE(CAST(fc.foreign_count AS DOUBLE), 0) + COALESCE(CAST(uc.us_count AS DOUBLE), 0), 0)), 2) AS avg_foreign_share_pct
FROM {patent_tsv} p
LEFT JOIN us_cit uc ON p.patent_id = uc.patent_id
LEFT JOIN foreign_cit fc ON p.patent_id = fc.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
  AND (COALESCE(uc.us_count, 0) + COALESCE(fc.foreign_count, 0)) > 0
GROUP BY year
ORDER BY year
"""
records_foreign = query_to_json(con, sql_foreign, f"{OUTPUT_DIR}/chapter2/foreign_citation_share.json")
for r in records_foreign:
    if r['year'] in [1980, 2000, 2020]:
        print(f"  {r['year']}: foreign share = {r['avg_foreign_share_pct']}%")

# ── ANALYSIS 21: NPL by Firm (Science Intensity) ──
print("\n" + "="*60)
print("ANALYSIS 21: Science Intensity by Firm (NPL)")
print("="*60)

sql_npl_firm = f"""
WITH npl_counts AS (
  SELECT patent_id, COUNT(*) AS npl_count
  FROM {other_ref_tsv}
  GROUP BY patent_id
),
top_assignees AS (
  SELECT disambig_assignee_organization AS org, COUNT(*) AS total
  FROM {assignee_tsv}
  WHERE assignee_sequence = 0 AND disambig_assignee_organization IS NOT NULL AND disambig_assignee_organization != ''
  GROUP BY org ORDER BY total DESC LIMIT 50
)
SELECT 
  a.disambig_assignee_organization AS organization,
  COUNT(*) AS total_patents,
  ROUND(AVG(COALESCE(n.npl_count, 0)), 2) AS avg_npl_citations,
  ROUND(MEDIAN(COALESCE(n.npl_count, 0)), 2) AS median_npl_citations
FROM {assignee_tsv} a
JOIN top_assignees t ON a.disambig_assignee_organization = t.org
JOIN {patent_tsv} p ON a.patent_id = p.patent_id
LEFT JOIN npl_counts n ON a.patent_id = n.patent_id
WHERE a.assignee_sequence = 0 AND p.patent_type = 'utility'
GROUP BY a.disambig_assignee_organization
ORDER BY avg_npl_citations DESC
"""
os.makedirs(f"{OUTPUT_DIR}/chapter10", exist_ok=True)
records_npl_firm = query_to_json(con, sql_npl_firm, f"{OUTPUT_DIR}/chapter10/npl_by_firm.json")
print("  Top 5 firms by science intensity:")
for r in records_npl_firm[:5]:
    print(f"    {r['organization']}: avg NPL = {r['avg_npl_citations']}")

# ── ANALYSIS 22: Foreign Citation Share by Firm ──
print("\n" + "="*60)
print("ANALYSIS 22: Foreign Citation Share by Firm")
print("="*60)

sql_foreign_firm = f"""
WITH us_cit AS (
  SELECT patent_id, COUNT(*) AS us_count FROM {citation_tsv} GROUP BY patent_id
),
foreign_cit AS (
  SELECT patent_id, COUNT(*) AS foreign_count FROM {foreign_cit_tsv} GROUP BY patent_id
),
top_assignees AS (
  SELECT disambig_assignee_organization AS org, COUNT(*) AS total
  FROM {assignee_tsv}
  WHERE assignee_sequence = 0 AND disambig_assignee_organization IS NOT NULL AND disambig_assignee_organization != ''
  GROUP BY org ORDER BY total DESC LIMIT 50
)
SELECT 
  a.disambig_assignee_organization AS organization,
  COUNT(*) AS total_patents,
  ROUND(100.0 * AVG(COALESCE(CAST(fc.foreign_count AS DOUBLE), 0) / NULLIF(COALESCE(CAST(fc.foreign_count AS DOUBLE), 0) + COALESCE(CAST(uc.us_count AS DOUBLE), 0), 0)), 2) AS foreign_citation_share_pct
FROM {assignee_tsv} a
JOIN top_assignees t ON a.disambig_assignee_organization = t.org
JOIN {patent_tsv} p ON a.patent_id = p.patent_id
LEFT JOIN us_cit uc ON a.patent_id = uc.patent_id
LEFT JOIN foreign_cit fc ON a.patent_id = fc.patent_id
WHERE a.assignee_sequence = 0 AND p.patent_type = 'utility'
  AND (COALESCE(uc.us_count, 0) + COALESCE(fc.foreign_count, 0)) > 0
GROUP BY a.disambig_assignee_organization
ORDER BY foreign_citation_share_pct DESC
"""
records_ff = query_to_json(con, sql_foreign_firm, f"{OUTPUT_DIR}/chapter10/foreign_citation_by_firm.json")
print("  Top 5 firms by foreign citation share:")
for r in records_ff[:5]:
    print(f"    {r['organization']}: {r['foreign_citation_share_pct']}%")

# ── ANALYSIS 34: Check citation_category field ──
print("\n" + "="*60)
print("ANALYSIS 34: Check citation_category field")
print("="*60)

# Try directly inspecting the citation table
try:
    sql_cat_check = f"SELECT * FROM {citation_tsv} LIMIT 3"
    cat_df = con.execute(sql_cat_check).fetchdf()
    print(f"  Citation table columns: {list(cat_df.columns)}")
    if 'citation_category' in cat_df.columns:
        sql_cat_vals = f"""
        SELECT citation_category, COUNT(*) AS cnt
        FROM {citation_tsv}
        WHERE citation_category IS NOT NULL AND citation_category != ''
        GROUP BY citation_category
        ORDER BY cnt DESC
        LIMIT 10
        """
        cat_vals = con.execute(sql_cat_vals).fetchdf()
        print(f"  citation_category values:")
        print(cat_vals.to_string())
        
        if len(cat_vals) > 0:
            # Build examiner vs applicant flow matrices
            print("  citation_category IS available - proceeding with Analysis 34")
            # For now, save the category distribution
            os.makedirs(f"{OUTPUT_DIR}/chapter20", exist_ok=True)
            save_json(cat_vals.to_dict(orient='records'), f"{OUTPUT_DIR}/chapter20/citation_category_distribution.json")
        else:
            print("  INFEASIBLE: citation_category is all null/empty")
    else:
        print("  INFEASIBLE: citation_category column not present")
except Exception as e:
    print(f"  Error checking citation_category: {e}")
    print("  INFEASIBLE: cannot determine citation_category availability")

# ── ANALYSIS 26: NPL by Inventor Type (Generalist vs. Specialist) ──
print("\n" + "="*60)
print("ANALYSIS 26: NPL by Inventor Type")
print("="*60)

# Classify inventors as generalist/specialist based on CPC breadth
sql_npl_inv_type = f"""
WITH npl_counts AS (
  SELECT patent_id, COUNT(*) AS npl_count
  FROM {other_ref_tsv}
  GROUP BY patent_id
),
inv_breadth AS (
  SELECT 
    i.inventor_id,
    COUNT(DISTINCT c.cpc_subclass) AS num_subclasses
  FROM {inventor_tsv} i
  JOIN {cpc_tsv} c ON i.patent_id = c.patent_id
  GROUP BY i.inventor_id
  HAVING COUNT(DISTINCT i.patent_id) >= 5
),
inv_type AS (
  SELECT inventor_id,
    CASE WHEN num_subclasses >= 5 THEN 'generalist' ELSE 'specialist' END AS type
  FROM inv_breadth
)
SELECT 
  it.type AS inventor_type,
  COUNT(*) AS patent_count,
  ROUND(AVG(COALESCE(n.npl_count, 0)), 3) AS avg_npl,
  ROUND(MEDIAN(COALESCE(n.npl_count, 0)), 3) AS median_npl
FROM {inventor_tsv} i
JOIN inv_type it ON i.inventor_id = it.inventor_id
JOIN {patent_tsv} p ON i.patent_id = p.patent_id
LEFT JOIN npl_counts n ON i.patent_id = n.patent_id
WHERE p.patent_type = 'utility'
GROUP BY it.type
"""
os.makedirs(f"{OUTPUT_DIR}/chapter14", exist_ok=True)
records_inv_npl = query_to_json(con, sql_npl_inv_type, f"{OUTPUT_DIR}/chapter14/npl_by_inventor_type.json")
for r in records_inv_npl:
    print(f"  {r['inventor_type']}: avg NPL = {r['avg_npl']}, median = {r['median_npl']}, n = {r['patent_count']:,}")

# ── ANALYSIS 36: Cross-Border Citation Localization ──
print("\n" + "="*60)
print("ANALYSIS 36: Cross-Border Citation Localization")
print("="*60)

# Sample 500K citing-cited pairs and compute localization
sql_local = f"""
WITH citing_country AS (
  SELECT 
    i.patent_id,
    l.disambig_country AS country
  FROM {inventor_tsv} i
  JOIN {location_tsv} l ON i.location_id = l.location_id
  WHERE i.inventor_sequence = 0
    AND l.disambig_country IS NOT NULL AND l.disambig_country != ''
),
sample_citations AS (
  SELECT 
    c.patent_id AS citing_id,
    c.citation_patent_id AS cited_id
  FROM {citation_tsv} c
  WHERE c.citation_patent_id IS NOT NULL AND c.citation_patent_id != ''
  USING SAMPLE 500000
)
SELECT 
  FLOOR(YEAR(p.patent_date::DATE) / 5) * 5 AS period,
  COUNT(*) AS total_pairs,
  SUM(CASE WHEN cc1.country = cc2.country THEN 1 ELSE 0 END) AS same_country,
  ROUND(100.0 * SUM(CASE WHEN cc1.country = cc2.country THEN 1 ELSE 0 END) / COUNT(*), 2) AS same_country_pct
FROM sample_citations sc
JOIN {patent_tsv} p ON sc.citing_id = p.patent_id
JOIN citing_country cc1 ON sc.citing_id = cc1.patent_id
JOIN citing_country cc2 ON sc.cited_id = cc2.patent_id
WHERE YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY period
ORDER BY period
"""
os.makedirs(f"{OUTPUT_DIR}/chapter22", exist_ok=True)
records_local = query_to_json(con, sql_local, f"{OUTPUT_DIR}/chapter22/citation_localization.json")
for r in records_local:
    print(f"  {int(r['period'])}s: same-country = {r['same_country_pct']}%")

# ── ANALYSIS 37: NPL by ACT 6 Domain ──
print("\n" + "="*60)
print("ANALYSIS 37: NPL Citations by ACT 6 Domain")
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

domain_npl_results = []
for domain, cpc_filter in DOMAINS.items():
    sql = f"""
    WITH domain_patents AS (
      SELECT DISTINCT c.patent_id FROM {cpc_tsv} c WHERE {cpc_filter}
    ),
    npl_counts AS (
      SELECT patent_id, COUNT(*) AS npl_count FROM {other_ref_tsv} GROUP BY patent_id
    )
    SELECT 
      ROUND(AVG(COALESCE(n.npl_count, 0)), 2) AS avg_npl,
      ROUND(MEDIAN(COALESCE(n.npl_count, 0)), 2) AS median_npl,
      COUNT(*) AS patent_count
    FROM domain_patents d
    JOIN {patent_tsv} p ON d.patent_id = p.patent_id
    LEFT JOIN npl_counts n ON d.patent_id = n.patent_id
    WHERE p.patent_type = 'utility'
      AND YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
    """
    result = con.execute(sql).fetchdf().to_dict(orient='records')[0]
    domain_npl_results.append({
        'domain': domain,
        'avg_npl_citations': result['avg_npl'],
        'median_npl_citations': result['median_npl'],
        'patent_count': result['patent_count']
    })
    print(f"  {domain}: avg NPL = {result['avg_npl']}")

domain_npl_results.sort(key=lambda x: x['avg_npl_citations'], reverse=True)
os.makedirs(f"{OUTPUT_DIR}/act6", exist_ok=True)
save_json(domain_npl_results, f"{OUTPUT_DIR}/act6/act6_npl_by_domain.json")

print("\n✓ Phase 3 complete (Analysis 5, 6, 21, 22, 26, 34, 36, 37)")
con.close()
