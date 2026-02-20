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
cpc_tsv = tsv_table("g_cpc_current")

# ── ANALYSIS 2: Continuation/Division Chains ──
print("\n" + "="*60)
print("ANALYSIS 2: Continuation/Division Chains")
print("="*60)

rel_doc_tsv = tsv_table("g_us_rel_doc")

# Inspect the related_doc_type values
sql_inspect = f"""
SELECT DISTINCT related_doc_type, COUNT(*) AS cnt
FROM {rel_doc_tsv}
GROUP BY related_doc_type
ORDER BY cnt DESC
LIMIT 30
"""
inspect_result = con.execute(sql_inspect).fetchdf()
print("  related_doc_type values found:")
print(inspect_result.to_string())

# Also check column names
sql_cols = f"SELECT * FROM {rel_doc_tsv} LIMIT 5"
cols_result = con.execute(sql_cols).fetchdf()
print(f"\n  Columns: {list(cols_result.columns)}")
print(cols_result.head().to_string())

# Classify each patent based on whether it has a parent continuation/division/CIP
# related_doc_type contains: continuation, continuation-in-part, division, reissue, etc.
# related_doc_kind contains: child-doc, parent-doc, parent-grant-document, etc.
sql_classify = f"""
WITH rel_types AS (
  SELECT DISTINCT patent_id,
    MAX(CASE WHEN LOWER(related_doc_type) = 'continuation' THEN 1 ELSE 0 END) AS is_continuation,
    MAX(CASE WHEN LOWER(related_doc_type) = 'division' THEN 1 ELSE 0 END) AS is_division,
    MAX(CASE WHEN LOWER(related_doc_type) = 'continuation-in-part' THEN 1 ELSE 0 END) AS is_cip
  FROM {rel_doc_tsv}
  GROUP BY patent_id
)
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  COUNT(*) AS total_patents,
  SUM(CASE WHEN r.patent_id IS NULL THEN 1 ELSE 0 END) AS originals,
  SUM(CASE WHEN r.is_continuation = 1 THEN 1 ELSE 0 END) AS continuations,
  SUM(CASE WHEN r.is_division = 1 THEN 1 ELSE 0 END) AS divisions,
  SUM(CASE WHEN r.is_cip = 1 THEN 1 ELSE 0 END) AS cips,
  SUM(CASE WHEN r.patent_id IS NOT NULL THEN 1 ELSE 0 END) AS related_filings,
  ROUND(100.0 * SUM(CASE WHEN r.patent_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS related_share_pct
FROM {patent_tsv} p
LEFT JOIN rel_types r ON p.patent_id = r.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter1", exist_ok=True)
records = query_to_json(con, sql_classify, f"{OUTPUT_DIR}/chapter1/continuation_chains.json")

# Spot-checks
for r in records:
    if r['year'] in [1976, 2000, 2024]:
        print(f"  {r['year']}: total={r['total_patents']}, originals={r['originals']}, related={r['related_filings']} ({r['related_share_pct']}%)")

# ── ANALYSIS 14: Terminal Disclaimers ──
print("\n" + "="*60)
print("ANALYSIS 14: Terminal Disclaimers")
print("="*60)

term_tsv = tsv_table("g_us_term_of_grant")

# Inspect columns
sql_term_cols = f"SELECT * FROM {term_tsv} LIMIT 5"
term_cols = con.execute(sql_term_cols).fetchdf()
print(f"  Columns: {list(term_cols.columns)}")
print(term_cols.head().to_string())

# Terminal disclaimer rate over time
sql_td = f"""
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  COUNT(*) AS total_patents,
  SUM(CASE WHEN t.disclaimer_date IS NOT NULL OR (t.term_disclaimer IS NOT NULL AND t.term_disclaimer != '') THEN 1 ELSE 0 END) AS with_terminal_disclaimer,
  ROUND(100.0 * SUM(CASE WHEN t.disclaimer_date IS NOT NULL OR (t.term_disclaimer IS NOT NULL AND t.term_disclaimer != '') THEN 1 ELSE 0 END) / COUNT(*), 2) AS td_rate_pct
FROM {patent_tsv} p
LEFT JOIN {term_tsv} t ON p.patent_id = t.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
GROUP BY year
ORDER BY year
"""
os.makedirs(f"{OUTPUT_DIR}/chapter6", exist_ok=True)
records_td = query_to_json(con, sql_td, f"{OUTPUT_DIR}/chapter6/terminal_disclaimer_rate.json")
for r in records_td:
    if r['year'] in [1980, 2000, 2020, 2024]:
        print(f"  {r['year']}: TD rate = {r['td_rate_pct']}%")

# Terminal disclaimer by CPC section (recent 5 years)
sql_td_cpc = f"""
WITH primary_cpc AS (
  SELECT patent_id, cpc_section
  FROM {cpc_tsv}
  WHERE cpc_sequence = 0
)
SELECT 
  c.cpc_section,
  COUNT(*) AS total_patents,
  SUM(CASE WHEN t.disclaimer_date IS NOT NULL OR (t.term_disclaimer IS NOT NULL AND t.term_disclaimer != '') THEN 1 ELSE 0 END) AS with_td,
  ROUND(100.0 * SUM(CASE WHEN t.disclaimer_date IS NOT NULL OR (t.term_disclaimer IS NOT NULL AND t.term_disclaimer != '') THEN 1 ELSE 0 END) / COUNT(*), 2) AS td_rate_pct
FROM {patent_tsv} p
LEFT JOIN {term_tsv} t ON p.patent_id = t.patent_id
JOIN primary_cpc c ON p.patent_id = c.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
GROUP BY c.cpc_section
ORDER BY td_rate_pct DESC
"""
query_to_json(con, sql_td_cpc, f"{OUTPUT_DIR}/chapter6/terminal_disclaimer_by_cpc.json")

# ── ANALYSIS 15: Patent Term Adjustment ──
print("\n" + "="*60)
print("ANALYSIS 15: Patent Term Adjustment")
print("="*60)

sql_pta = f"""
SELECT 
  YEAR(p.patent_date::DATE) AS year,
  ROUND(AVG(CAST(t.term_extension AS FLOAT)), 1) AS avg_pta_days,
  ROUND(MEDIAN(CAST(t.term_extension AS FLOAT)), 1) AS median_pta_days,
  COUNT(*) AS patent_count
FROM {patent_tsv} p
JOIN {term_tsv} t ON p.patent_id = t.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 1976 AND 2025
  AND t.term_extension IS NOT NULL
  AND TRY_CAST(t.term_extension AS FLOAT) IS NOT NULL
  AND CAST(t.term_extension AS FLOAT) >= 0
  AND CAST(t.term_extension AS FLOAT) < 10000
GROUP BY year
ORDER BY year
"""
records_pta = query_to_json(con, sql_pta, f"{OUTPUT_DIR}/chapter6/patent_term_adjustment.json")
for r in records_pta:
    if r['year'] in [2000, 2010, 2020, 2024]:
        print(f"  {r['year']}: median PTA = {r['median_pta_days']} days, avg = {r['avg_pta_days']} days")

# PTA by CPC section
sql_pta_cpc = f"""
WITH primary_cpc AS (
  SELECT patent_id, cpc_section
  FROM {cpc_tsv}
  WHERE cpc_sequence = 0
)
SELECT 
  c.cpc_section,
  ROUND(AVG(CAST(t.term_extension AS FLOAT)), 1) AS avg_pta_days,
  ROUND(MEDIAN(CAST(t.term_extension AS FLOAT)), 1) AS median_pta_days,
  COUNT(*) AS patent_count
FROM {patent_tsv} p
JOIN {term_tsv} t ON p.patent_id = t.patent_id
JOIN primary_cpc c ON p.patent_id = c.patent_id
WHERE p.patent_type = 'utility'
  AND YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
  AND t.term_extension IS NOT NULL
  AND TRY_CAST(t.term_extension AS FLOAT) IS NOT NULL
  AND CAST(t.term_extension AS FLOAT) >= 0
  AND CAST(t.term_extension AS FLOAT) < 10000
GROUP BY c.cpc_section
ORDER BY median_pta_days DESC
"""
query_to_json(con, sql_pta_cpc, f"{OUTPUT_DIR}/chapter6/pta_by_cpc_section.json")

# ── ANALYSIS 20: Continuation Strategy by Firm ──
print("\n" + "="*60)
print("ANALYSIS 20: Continuation Strategy by Firm")
print("="*60)

assignee_tsv = tsv_table("g_assignee_disambiguated")

sql_cont_firm = f"""
WITH rel_types AS (
  SELECT DISTINCT patent_id,
    MAX(CASE WHEN LOWER(related_doc_type) IN ('continuation','division','continuation-in-part') THEN 1 ELSE 0 END) AS is_related
  FROM {rel_doc_tsv}
  GROUP BY patent_id
),
top_assignees AS (
  SELECT disambig_assignee_organization AS org, COUNT(*) AS total
  FROM {assignee_tsv}
  WHERE assignee_sequence = 0
    AND disambig_assignee_organization IS NOT NULL
    AND disambig_assignee_organization != ''
  GROUP BY org
  ORDER BY total DESC
  LIMIT 50
)
SELECT 
  a.disambig_assignee_organization AS organization,
  COUNT(*) AS total_patents,
  SUM(COALESCE(r.is_related, 0)) AS related_filings,
  ROUND(100.0 * SUM(COALESCE(r.is_related, 0)) / COUNT(*), 2) AS continuation_share_pct
FROM {assignee_tsv} a
JOIN top_assignees t ON a.disambig_assignee_organization = t.org
JOIN {patent_tsv} p ON a.patent_id = p.patent_id
LEFT JOIN rel_types r ON a.patent_id = r.patent_id
WHERE a.assignee_sequence = 0
  AND p.patent_type = 'utility'
GROUP BY a.disambig_assignee_organization
ORDER BY continuation_share_pct DESC
"""
os.makedirs(f"{OUTPUT_DIR}/chapter9", exist_ok=True)
records_cf = query_to_json(con, sql_cont_firm, f"{OUTPUT_DIR}/chapter9/continuation_share_by_firm.json")
print("  Top 5 by continuation share:")
for r in records_cf[:5]:
    print(f"    {r['organization']}: {r['continuation_share_pct']}%")
print("  Bottom 5:")
for r in records_cf[-5:]:
    print(f"    {r['organization']}: {r['continuation_share_pct']}%")

# ── ANALYSIS 38: Continuation Rates by ACT 6 Domain ──
print("\n" + "="*60)
print("ANALYSIS 38: Continuation by ACT 6 Domain")
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

all_domain_cont = []
for domain, cpc_filter in DOMAINS.items():
    sql = f"""
    WITH domain_patents AS (
      SELECT DISTINCT c.patent_id FROM {cpc_tsv} c WHERE {cpc_filter}
    ),
    rel_types AS (
      SELECT DISTINCT patent_id,
        MAX(CASE WHEN LOWER(related_doc_type) IN ('continuation','division','continuation-in-part') THEN 1 ELSE 0 END) AS is_related
      FROM {rel_doc_tsv}
      GROUP BY patent_id
    )
    SELECT 
      COUNT(*) AS total,
      SUM(COALESCE(r.is_related, 0)) AS related,
      ROUND(100.0 * SUM(COALESCE(r.is_related, 0)) / COUNT(*), 2) AS continuation_share
    FROM domain_patents d
    JOIN {patent_tsv} p ON d.patent_id = p.patent_id
    LEFT JOIN rel_types r ON d.patent_id = r.patent_id
    WHERE p.patent_type = 'utility'
      AND YEAR(p.patent_date::DATE) BETWEEN 2020 AND 2025
    """
    result = con.execute(sql).fetchdf().to_dict(orient='records')[0]
    all_domain_cont.append({
        'domain': domain,
        'total_patents': result['total'],
        'related_filings': result['related'],
        'continuation_share_pct': result['continuation_share']
    })
    print(f"  {domain}: {result['continuation_share']}%")

all_domain_cont.sort(key=lambda x: x['continuation_share_pct'], reverse=True)
os.makedirs(f"{OUTPUT_DIR}/act6", exist_ok=True)
save_json(all_domain_cont, f"{OUTPUT_DIR}/act6/act6_continuation_rates.json")

print("\n✓ Phase 2 complete (Analysis 2, 14, 15, 20, 38)")
con.close()
