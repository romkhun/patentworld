#!/usr/bin/env python3
"""
Quality Bifurcation — Top-Decile Share for all 12 deep-dive domains.

For each domain × 5-year period:
  - Compute top-decile citation threshold per (grant_year × cpc_section)
  - Compute share of domain patents in that top decile
  - Compute median claims

Generates → public/data/{domain_slug}/{slug}_quality_bifurcation.json
"""
import duckdb
from config import CPC_CURRENT_TSV, OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"

DOMAINS = {
    "3D Printing":   {"slug": "3dprint",  "data_dir": "3dprint",  "filter": "(cpc_subclass = 'B33Y' OR cpc_group LIKE 'B33Y%' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')"},
    "AgTech":        {"slug": "agtech",   "data_dir": "agtech",   "filter": "(cpc_subclass IN ('A01B','A01C','A01G','A01H') OR cpc_group LIKE 'G06Q50/02%')"},
    "AI":            {"slug": "ai",       "data_dir": "chapter11", "filter": "(cpc_group LIKE 'G06N%' OR cpc_group LIKE 'G06F18%' OR cpc_subclass = 'G06V' OR cpc_group LIKE 'G10L15%' OR cpc_group LIKE 'G06F40%')"},
    "AV":            {"slug": "av",       "data_dir": "av",       "filter": "(cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')"},
    "Biotech":       {"slug": "biotech",  "data_dir": "biotech",  "filter": "(cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%' OR cpc_group LIKE 'C12Q1/68%')"},
    "Blockchain":    {"slug": "blockchain","data_dir": "blockchain","filter": "(cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')"},
    "Cyber":         {"slug": "cyber",    "data_dir": "cyber",    "filter": "(cpc_group LIKE 'G06F21%' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%')"},
    "DigiHealth":    {"slug": "digihealth","data_dir": "digihealth","filter": "(cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')"},
    "Green":         {"slug": "green",    "data_dir": "green",    "filter": "(cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%' OR cpc_group LIKE 'Y02%' OR cpc_group LIKE 'Y04S%')"},
    "Quantum":       {"slug": "quantum",  "data_dir": "quantum",  "filter": "(cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%')"},
    "Semiconductor": {"slug": "semi",     "data_dir": "semiconductors", "filter": "(cpc_subclass IN ('H01L','H10N','H10K'))"},
    "Space":         {"slug": "space",    "data_dir": "space",    "filter": "(cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')"},
}

con = duckdb.connect()
con.execute("SET threads TO 38")
con.execute("SET memory_limit = '200GB'")

# ── Pre-compute system-wide top-decile thresholds per (grant_year × cpc_section) ──
timed_msg("Computing system-wide top-decile citation thresholds")
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE top_decile_thresholds AS
    SELECT
        grant_year,
        cpc_section,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY fwd_cite_5y) AS p90_threshold
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1990 AND 2020
      AND cpc_section IS NOT NULL
    GROUP BY grant_year, cpc_section
""")
print("  Thresholds computed")

for name, info in DOMAINS.items():
    slug = info["slug"]
    data_dir = info["data_dir"]
    filt = info["filter"]
    timed_msg(f"Quality Bifurcation: {name}")

    result = con.execute(f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {filt}
        ),
        domain_master AS (
            SELECT m.patent_id, m.grant_year, m.fwd_cite_5y, m.num_claims, m.cpc_section,
                   FLOOR(m.grant_year / 5) * 5 AS period
            FROM '{MASTER}' m
            JOIN domain_patents dp ON m.patent_id = dp.patent_id
            WHERE m.grant_year BETWEEN 1990 AND 2020
        ),
        with_threshold AS (
            SELECT dm.*, t.p90_threshold
            FROM domain_master dm
            LEFT JOIN top_decile_thresholds t
              ON dm.grant_year = t.grant_year AND dm.cpc_section = t.cpc_section
        )
        SELECT
            period,
            COUNT(*) AS patent_count,
            ROUND(100.0 * SUM(CASE WHEN fwd_cite_5y >= COALESCE(p90_threshold, 999999) THEN 1 ELSE 0 END)
                  / COUNT(*), 2) AS top_decile_share,
            ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY num_claims), 1) AS median_claims
        FROM with_threshold
        GROUP BY period
        ORDER BY period
    """).fetchall()

    rows = [{"period": int(r[0]), "patent_count": r[1], "top_decile_share": r[2], "median_claims": r[3]} for r in result]
    save_json(rows, f"{OUTPUT_DIR}/{data_dir}/{slug}_quality_bifurcation.json")

con.close()
print("\n=== 74_quality_bifurcation complete ===\n")
