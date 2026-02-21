#!/usr/bin/env python3
"""
Comprehensive Track A verification script — DuckDB-based.
Verifies critical claims from ALL chapters against raw PatentsView data.
"""
import duckdb
import json
import os

RAW = "/tmp/patentview"
DATA = "/home/saerom/projects/patentworld/public/data"

def P(): return f"read_csv_auto('{RAW}/g_patent.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def CPC(): return f"read_csv_auto('{RAW}/g_cpc_current.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def A(): return f"read_csv_auto('{RAW}/g_assignee_disambiguated.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def I(): return f"read_csv_auto('{RAW}/g_inventor_disambiguated.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def C(): return f"read_csv_auto('{RAW}/g_us_patent_citation.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR', 'citation_patent_id': 'VARCHAR'}})"
def APP(): return f"read_csv_auto('{RAW}/g_application.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def GOV(): return f"read_csv_auto('{RAW}/g_gov_interest.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def GOVO(): return f"read_csv_auto('{RAW}/g_gov_interest_org.tsv', delim='\t', quote='\"', header=true, ignore_errors=true, types={{'patent_id': 'VARCHAR'}})"
def LOC(): return f"read_csv_auto('{RAW}/g_location_disambiguated.tsv', delim='\t', quote='\"', header=true, ignore_errors=true)"

con = duckdb.connect()
results = {}

def check(label, claimed, actual, tolerance=0.01):
    """Compare claimed vs actual values."""
    if isinstance(claimed, str):
        match = str(actual) == claimed
    elif isinstance(claimed, float):
        match = abs(claimed - actual) / max(abs(claimed), 1e-10) <= tolerance
    else:
        match = claimed == actual
    status = "✓" if match else "✗ MISMATCH"
    print(f"  {label}: claimed={claimed}, actual={actual} {status}")
    results[label] = {"claimed": claimed, "actual": actual, "match": match}
    return match

print("=" * 70)
print("COMPREHENSIVE VERIFICATION — DuckDB on Raw PatentsView TSVs")
print("=" * 70)

# ── CHAPTER 4: Convergence ──
print("\n── Ch4: Convergence ──")
r = con.execute(f"""
    WITH utility AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {P()} WHERE patent_type='utility' AND patent_date IS NOT NULL
        AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    sections_per_patent AS (
        SELECT u.patent_id, u.year,
               COUNT(DISTINCT LEFT(c.cpc_section,1)) AS n_sections
        FROM utility u
        JOIN {CPC()} c ON u.patent_id = c.patent_id
        WHERE LEFT(c.cpc_section,1) NOT IN ('Y')
        GROUP BY u.patent_id, u.year
    )
    SELECT year,
           COUNT(*) AS total,
           SUM(CASE WHEN n_sections >= 2 THEN 1 ELSE 0 END) AS multi,
           ROUND(100.0 * SUM(CASE WHEN n_sections >= 2 THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct
    FROM sections_per_patent
    WHERE year IN (1976, 2024)
    GROUP BY year ORDER BY year
""").fetchdf()
for _, row in r.iterrows():
    if row['year'] == 1976:
        check("Ch4: Multi-section 1976", 21.0, row['pct'], 1.0)
    elif row['year'] == 2024:
        check("Ch4: Multi-section 2024", 40.0, row['pct'], 1.0)

# ── CHAPTER 7: Public Investment ──
print("\n── Ch7: Public Investment ──")
r = con.execute(f"""
    SELECT YEAR(CAST(p.patent_date AS DATE)) AS year,
           COUNT(DISTINCT g.patent_id) AS gov_patents
    FROM {GOV()} g
    JOIN {P()} p ON g.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) IN (1980, 2019)
    GROUP BY year ORDER BY year
""").fetchdf()
for _, row in r.iterrows():
    if row['year'] == 1980:
        check("Ch7: Gov patents 1980", 1294, int(row['gov_patents']), 0.05)
    elif row['year'] == 2019:
        check("Ch7: Gov patents 2019", 8359, int(row['gov_patents']), 0.05)

# Top agencies
r = con.execute(f"""
    SELECT go.level_one AS agency,
           COUNT(DISTINCT g.patent_id) AS patents
    FROM {GOV()} g
    JOIN {GOVO()} go ON g.patent_id = go.patent_id
    JOIN {P()} p ON g.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND go.level_one IS NOT NULL
    GROUP BY go.level_one
    ORDER BY patents DESC
    LIMIT 5
""").fetchdf()
print(f"  Top agencies: {r.to_dict('records')}")

# ── CHAPTER 8: Assignee Composition ──
print("\n── Ch8: Assignee Composition ──")
# Japan total
r = con.execute(f"""
    SELECT COUNT(DISTINCT a.patent_id) AS jp_patents
    FROM {A()} a
    JOIN {P()} p ON a.patent_id = p.patent_id
    JOIN {LOC()} l ON a.location_id = l.location_id
    WHERE p.patent_type = 'utility'
      AND l.disambig_country = 'JP'
      AND a.assignee_sequence = 0
""").fetchone()
check("Ch8: Japan US patents", 1450000, int(r[0]), 0.05)

# ── CHAPTER 9: Org Patent Count ──
print("\n── Ch9: Org Patent Count ──")
r = con.execute(f"""
    SELECT a.disambig_assignee_organization AS org,
           COUNT(DISTINCT a.patent_id) AS patents
    FROM {A()} a
    JOIN {P()} p ON a.patent_id = p.patent_id
    WHERE p.patent_type = 'utility' AND a.assignee_sequence = 0
      AND a.disambig_assignee_organization IS NOT NULL
    GROUP BY a.disambig_assignee_organization
    ORDER BY patents DESC
    LIMIT 5
""").fetchdf()
print(f"  Top 5 orgs: {r.to_dict('records')}")
top_org = r.iloc[0]
check("Ch9: IBM leads", "International Business Machines Corporation", top_org['org'])
check("Ch9: IBM total ~161888", 161888, int(top_org['patents']), 0.02)

# Samsung 2024
r = con.execute(f"""
    SELECT COUNT(DISTINCT a.patent_id) AS cnt
    FROM {A()} a
    JOIN {P()} p ON a.patent_id = p.patent_id
    WHERE p.patent_type = 'utility' AND a.assignee_sequence = 0
      AND a.disambig_assignee_organization LIKE 'Samsung%'
      AND YEAR(CAST(p.patent_date AS DATE)) = 2024
""").fetchone()
check("Ch9: Samsung 2024 ~9716", 9716, int(r[0]), 0.05)

# ── CHAPTER 13: Top Inventors ──
print("\n── Ch13: Top Inventors ──")
r = con.execute(f"""
    SELECT COUNT(DISTINCT i.patent_id) AS patents
    FROM {I()} i
    JOIN {P()} p ON i.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
    GROUP BY i.inventor_id
    ORDER BY patents DESC
    LIMIT 1
""").fetchone()
check("Ch13: Most prolific inventor ~6709", 6709, int(r[0]), 0.05)

# ── CHAPTER 16: Gender ──
print("\n── Ch16: Gender ──")
r = con.execute(f"""
    SELECT ROUND(100.0 * SUM(CASE WHEN i.gender_code = 'F' THEN 1 ELSE 0 END) /
                 NULLIF(SUM(CASE WHEN i.gender_code IN ('M','F') THEN 1 ELSE 0 END), 0), 1) AS female_pct
    FROM {I()} i
    JOIN {P()} p ON i.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND i.inventor_sequence = 0
      AND YEAR(CAST(p.patent_date AS DATE)) = 1976
""").fetchone()
check("Ch16: Female share 1976 ~2.8%", 2.8, float(r[0]), 0.15)

r = con.execute(f"""
    SELECT ROUND(100.0 * SUM(CASE WHEN i.gender_code = 'F' THEN 1 ELSE 0 END) /
                 NULLIF(SUM(CASE WHEN i.gender_code IN ('M','F') THEN 1 ELSE 0 END), 0), 1) AS female_pct
    FROM {I()} i
    JOIN {P()} p ON i.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND i.inventor_sequence = 0
      AND YEAR(CAST(p.patent_date AS DATE)) = 2025
""").fetchone()
check("Ch16: Female share 2025 ~14.9%", 14.9, float(r[0]), 0.10)

# ── CHAPTER 17: Team Size ──
print("\n── Ch17: Team Size ──")
r = con.execute(f"""
    SELECT AVG(team_size) AS avg_ts FROM (
        SELECT p.patent_id, COUNT(DISTINCT i.inventor_id) AS team_size
        FROM {P()} p
        JOIN {I()} i ON p.patent_id = i.patent_id
        WHERE p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) = 1976
        GROUP BY p.patent_id
    )
""").fetchone()
check("Ch17: Avg team 1976 ~1.7", 1.7, round(float(r[0]), 1))

r = con.execute(f"""
    SELECT AVG(team_size) AS avg_ts FROM (
        SELECT p.patent_id, COUNT(DISTINCT i.inventor_id) AS team_size
        FROM {P()} p
        JOIN {I()} i ON p.patent_id = i.patent_id
        WHERE p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) = 2025
        GROUP BY p.patent_id
    )
""").fetchone()
check("Ch17: Avg team 2025 ~3.2", 3.2, round(float(r[0]), 1))

# ── CHAPTER 18: Domestic Geography ──
print("\n── Ch18: Domestic Geography ──")
r = con.execute(f"""
    WITH us_patents AS (
        SELECT i.patent_id, l.disambig_state AS state
        FROM {I()} i
        JOIN {P()} p ON i.patent_id = p.patent_id
        JOIN {LOC()} l ON i.location_id = l.location_id
        WHERE p.patent_type = 'utility'
          AND i.inventor_sequence = 0
          AND l.disambig_country = 'US'
          AND l.disambig_state IS NOT NULL
    )
    SELECT state, COUNT(DISTINCT patent_id) AS patents
    FROM us_patents GROUP BY state ORDER BY patents DESC LIMIT 5
""").fetchdf()
print(f"  Top 5 states: {r.to_dict('records')}")
ca = r[r['state'] == 'CA']
if not ca.empty:
    total_us = con.execute(f"""
        SELECT COUNT(DISTINCT i.patent_id)
        FROM {I()} i
        JOIN {P()} p ON i.patent_id = p.patent_id
        JOIN {LOC()} l ON i.location_id = l.location_id
        WHERE p.patent_type = 'utility' AND i.inventor_sequence = 0
          AND l.disambig_country = 'US'
    """).fetchone()[0]
    ca_pct = 100.0 * int(ca['patents'].iloc[0]) / total_us
    check("Ch18: CA share ~23.6%", 23.6, round(ca_pct, 1))
    check("Ch18: CA patents ~992708", 992708, int(ca['patents'].iloc[0]), 0.02)

# ── CHAPTER 19: International Geography ──
print("\n── Ch19: International ──")
r = con.execute(f"""
    SELECT COUNT(DISTINCT a.patent_id) AS cnt
    FROM {A()} a
    JOIN {P()} p ON a.patent_id = p.patent_id
    JOIN {LOC()} l ON a.location_id = l.location_id
    WHERE p.patent_type = 'utility' AND a.assignee_sequence = 0
      AND l.disambig_country = 'CN'
      AND YEAR(CAST(p.patent_date AS DATE)) = 2000
""").fetchone()
check("Ch19: China 2000 ~299", 299, int(r[0]), 0.15)

r = con.execute(f"""
    SELECT COUNT(DISTINCT a.patent_id) AS cnt
    FROM {A()} a
    JOIN {P()} p ON a.patent_id = p.patent_id
    JOIN {LOC()} l ON a.location_id = l.location_id
    WHERE p.patent_type = 'utility' AND a.assignee_sequence = 0
      AND l.disambig_country = 'CN'
      AND YEAR(CAST(p.patent_date AS DATE)) = 2024
""").fetchone()
check("Ch19: China 2024 ~30695", 30695, int(r[0]), 0.05)

# ── CHAPTER 25: AI Patents ──
print("\n── Ch25: AI Patents ──")
ai_filter = "(cpc.cpc_subclass IN ('G06N') OR cpc.cpc_group LIKE 'G06F18%' OR cpc.cpc_subclass = 'G06V' OR cpc.cpc_group LIKE 'G10L15%' OR cpc.cpc_group LIKE 'G06F40%')"
r = con.execute(f"""
    WITH ai_patents AS (
        SELECT DISTINCT cpc.patent_id
        FROM {CPC()} cpc WHERE {ai_filter}
    )
    SELECT YEAR(CAST(p.patent_date AS DATE)) AS year, COUNT(DISTINCT ap.patent_id) AS cnt
    FROM ai_patents ap
    JOIN {P()} p ON ap.patent_id = p.patent_id
    WHERE p.patent_type = 'utility' AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) IN (2012, 2023)
    GROUP BY year ORDER BY year
""").fetchdf()
for _, row in r.iterrows():
    if row['year'] == 2012:
        check("Ch25: AI 2012 ~5201", 5201, int(row['cnt']), 0.05)
    elif row['year'] == 2023:
        check("Ch25: AI 2023 ~29624", 29624, int(row['cnt']), 0.05)

# IBM AI patents
r = con.execute(f"""
    WITH ai_patents AS (
        SELECT DISTINCT cpc.patent_id
        FROM {CPC()} cpc WHERE {ai_filter}
    )
    SELECT a.disambig_assignee_organization AS org, COUNT(DISTINCT ap.patent_id) AS cnt
    FROM ai_patents ap
    JOIN {A()} a ON ap.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {P()} p ON ap.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
    GROUP BY a.disambig_assignee_organization
    ORDER BY cnt DESC LIMIT 5
""").fetchdf()
print(f"  Top 5 AI orgs: {r.to_dict('records')}")

# ── CROSS-DOMAIN CONCENTRATION (all 12 deep dives) ──
print("\n── Cross-Domain: Top-4 Concentration 2025 ──")
domains = {
    "3D Printing": "(cpc_subclass = 'B33Y' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')",
    "AgTech": "(cpc_subclass IN ('A01B','A01C','A01G','A01H') OR cpc_group LIKE 'G06Q50/02%')",
    "AI": "(cpc_subclass = 'G06N' OR cpc_group LIKE 'G06F18%' OR cpc_subclass = 'G06V' OR cpc_group LIKE 'G10L15%' OR cpc_group LIKE 'G06F40%')",
    "AV": "(cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')",
    "Biotech": "(cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%' OR cpc_group LIKE 'C12Q1/68%')",
    "Blockchain": "(cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')",
    "Cyber": "(cpc_subclass = 'G06F21' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%')",
    "DigiHealth": "(cpc_subclass = 'A61B5' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')",
    "Green": "(LEFT(cpc_subclass,3) IN ('Y02','Y04'))",
    "Quantum": "(cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%')",
    "Semi": "(cpc_subclass IN ('H01L','H10N','H10K'))",
    "Space": "(cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')",
}

cr4_results = {}
for name, filt in domains.items():
    r = con.execute(f"""
        WITH dp AS (
            SELECT DISTINCT patent_id FROM {CPC()} WHERE {filt}
        ),
        py AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {P()} WHERE patent_type='utility' AND patent_date IS NOT NULL
        ),
        org_cnt AS (
            SELECT a.disambig_assignee_organization AS org, COUNT(DISTINCT dp.patent_id) AS cnt
            FROM dp JOIN py ON dp.patent_id = py.patent_id
            JOIN {A()} a ON dp.patent_id = a.patent_id AND a.assignee_sequence = 0
            WHERE py.year BETWEEN 2023 AND 2025
              AND a.disambig_assignee_organization IS NOT NULL
            GROUP BY a.disambig_assignee_organization
        ),
        total AS (SELECT SUM(cnt) AS t FROM org_cnt),
        top4 AS (SELECT SUM(cnt) AS s FROM (SELECT cnt FROM org_cnt ORDER BY cnt DESC LIMIT 4))
        SELECT ROUND(100.0 * top4.s / total.t, 1) AS cr4 FROM top4, total
    """).fetchone()
    cr4 = float(r[0]) if r and r[0] else 0
    cr4_results[name] = cr4
    print(f"  {name}: CR4 (2023-2025) = {cr4}%")

# Check superlatives
max_cr4 = max(cr4_results, key=cr4_results.get)
min_cr4 = min(cr4_results, key=cr4_results.get)
print(f"\n  Most concentrated: {max_cr4} ({cr4_results[max_cr4]}%)")
print(f"  Least concentrated: {min_cr4} ({cr4_results[min_cr4]}%)")
check("Quantum most concentrated?", "Quantum", max_cr4)
check("Biotech least concentrated?", "Biotech", min_cr4)

# ── SUMMARY ──
print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)
total = len(results)
passed = sum(1 for v in results.values() if v['match'])
failed = total - passed
print(f"Total checks: {total}")
print(f"Passed: {passed}")
print(f"Failed: {failed}")
if failed > 0:
    print("\nFailed checks:")
    for k, v in results.items():
        if not v['match']:
            print(f"  {k}: claimed={v['claimed']}, actual={v['actual']}")

# Save results
with open("/home/saerom/projects/patentworld/audit/results/comprehensive_verification.json", "w") as f:
    json.dump(results, f, indent=2, default=str)
print(f"\nResults saved to audit/results/comprehensive_verification.json")

con.close()
