#!/usr/bin/env python3
"""
Entrant vs. Incumbent Growth Decomposition — all 12 deep-dive domains.

For each domain × year:
  - Classify assignees as ENTRANTS (first patent in domain this year) vs INCUMBENTS
  - Output: entrant patent count, incumbent patent count

Generates → public/data/{domain_slug}/{slug}_entrant_incumbent.json
"""
import duckdb
from config import CPC_CURRENT_TSV, ASSIGNEE_TSV, PATENT_TSV, OUTPUT_DIR, save_json, timed_msg

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

for name, info in DOMAINS.items():
    slug = info["slug"]
    data_dir = info["data_dir"]
    filt = info["filter"]
    timed_msg(f"Entrant/Incumbent: {name}")

    result = con.execute(f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {filt}
        ),
        patent_assignee_year AS (
            SELECT
                m.patent_id,
                m.grant_year AS year,
                m.primary_assignee_id AS assignee_id
            FROM '{MASTER}' m
            JOIN domain_patents dp ON m.patent_id = dp.patent_id
            WHERE m.primary_assignee_id IS NOT NULL
              AND m.grant_year BETWEEN 1990 AND 2025
        ),
        first_year AS (
            SELECT assignee_id, MIN(year) AS entry_year
            FROM patent_assignee_year
            GROUP BY assignee_id
        ),
        classified AS (
            SELECT
                p.year,
                CASE WHEN p.year = f.entry_year THEN 'entrant' ELSE 'incumbent' END AS status,
                p.patent_id
            FROM patent_assignee_year p
            JOIN first_year f ON p.assignee_id = f.assignee_id
        )
        SELECT
            year,
            SUM(CASE WHEN status = 'entrant' THEN 1 ELSE 0 END) AS entrant_count,
            SUM(CASE WHEN status = 'incumbent' THEN 1 ELSE 0 END) AS incumbent_count
        FROM classified
        GROUP BY year
        ORDER BY year
    """).fetchall()

    rows = [{"year": r[0], "entrant_count": r[1], "incumbent_count": r[2]} for r in result]
    save_json(rows, f"{OUTPUT_DIR}/{data_dir}/{slug}_entrant_incumbent.json")

con.close()
print("\n=== 73_entrant_incumbent complete ===\n")
