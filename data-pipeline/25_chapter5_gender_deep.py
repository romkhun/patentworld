#!/usr/bin/env python3
"""
Analysis #16 – The Gender Innovation Gap: Deeper Dive
Technology distribution by gender, citations by team composition, trends.

Outputs:
  - chapter5/gender_by_tech.json        — tech distribution by inventor gender
  - chapter5/gender_team_quality.json   — citation comparison by team gender composition
  - chapter5/gender_section_trend.json  — female share by CPC section over time
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, INVENTOR_TSV, CITATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()

# ── Gender × Technology distribution ─────────────────────────────────────────
timed_msg("gender_by_tech: technology distribution by inventor gender")

query_to_json(con, f"""
    WITH patent_recent AS (
        SELECT patent_id
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 2010 AND 2025
    ),
    inv_gender AS (
        SELECT DISTINCT i.patent_id,
               CASE WHEN i.gender_code = 'M' THEN 'Male'
                    WHEN i.gender_code = 'F' THEN 'Female'
                    ELSE 'Unknown' END AS gender
        FROM {INVENTOR_TSV()} i
        JOIN patent_recent pr ON i.patent_id = pr.patent_id
        WHERE i.gender_code IN ('M', 'F')
    ),
    with_section AS (
        SELECT ig.patent_id, ig.gender,
               LEFT(cpc.cpc_section, 1) AS section
        FROM inv_gender ig
        JOIN {CPC_CURRENT_TSV()} cpc ON ig.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE LEFT(cpc.cpc_section, 1) != 'Y'
    )
    SELECT
        section,
        gender,
        COUNT(*) AS count
    FROM with_section
    GROUP BY section, gender
    ORDER BY section, gender
""", f"{OUT}/gender_by_tech.json")

# ── Team gender composition × quality ────────────────────────────────────────
timed_msg("gender_team_quality: citations by team gender composition")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 2000 AND 2020
    ),
    team_comp AS (
        SELECT i.patent_id,
               COUNT(DISTINCT i.inventor_id) AS team_size,
               SUM(CASE WHEN i.gender_code = 'M' THEN 1 ELSE 0 END) AS male_count,
               SUM(CASE WHEN i.gender_code = 'F' THEN 1 ELSE 0 END) AS female_count
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        WHERE i.gender_code IN ('M', 'F')
        GROUP BY i.patent_id
    ),
    team_type AS (
        SELECT patent_id,
               CASE
                   WHEN female_count = 0 THEN 'All Male'
                   WHEN male_count = 0 THEN 'All Female'
                   ELSE 'Mixed Gender'
               END AS team_gender
        FROM team_comp
        WHERE male_count + female_count >= team_size * 0.8
    ),
    fwd_cites AS (
        SELECT c.citation_patent_id AS patent_id, COUNT(*) AS fwd_cites
        FROM {CITATION_TSV()} c
        GROUP BY c.citation_patent_id
    )
    SELECT
        tt.team_gender,
        COUNT(*) AS patent_count,
        ROUND(AVG(COALESCE(fc.fwd_cites, 0)), 2) AS avg_citations,
        ROUND(MEDIAN(COALESCE(fc.fwd_cites, 0)), 0) AS median_citations
    FROM team_type tt
    LEFT JOIN fwd_cites fc ON tt.patent_id = fc.patent_id
    GROUP BY tt.team_gender
    ORDER BY tt.team_gender
""", f"{OUT}/gender_team_quality.json")

# ── Female inventor share by CPC section over time ──────────────────────────
timed_msg("gender_section_trend: female inventor share by CPC section over time")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    inv_with_section AS (
        SELECT DISTINCT i.inventor_id, py.year, i.gender_code,
               LEFT(cpc.cpc_section, 1) AS section
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        JOIN {CPC_CURRENT_TSV()} cpc ON i.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE i.gender_code IN ('M', 'F')
          AND LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    by_period AS (
        SELECT
            CAST(FLOOR(year / 5) * 5 AS INTEGER) AS period_start,
            section,
            COUNT(*) AS total_inventors,
            SUM(CASE WHEN gender_code = 'F' THEN 1 ELSE 0 END) AS female_inventors,
            ROUND(100.0 * SUM(CASE WHEN gender_code = 'F' THEN 1 ELSE 0 END) / COUNT(*), 2) AS female_pct
        FROM inv_with_section
        GROUP BY period_start, section
    )
    SELECT
        period_start,
        CONCAT(CAST(period_start AS VARCHAR), '-', CAST(period_start + 4 AS VARCHAR)) AS period,
        section,
        total_inventors,
        female_inventors,
        female_pct
    FROM by_period
    ORDER BY period_start, section
""", f"{OUT}/gender_section_trend.json")

con.close()
print("\n=== Gender Deep Dive complete ===\n")
