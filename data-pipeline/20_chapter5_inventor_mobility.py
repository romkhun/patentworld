#!/usr/bin/env python3
"""
Analysis #3 – Inventor Mobility Analysis
Track how often prolific inventors change assignees; compare citations for mobile vs non-mobile.

Outputs:
  - chapter5/inventor_mobility.json           — mobile vs non-mobile citation comparison
  - chapter5/inventor_mobility_by_decade.json — mobility rate over time
"""
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV, CITATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()

# ── Inventor mobility: citation comparison ───────────────────────────────────
timed_msg("inventor_mobility: mobile vs non-mobile inventor citation comparison")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    -- Inventor-patent with assignee
    inv_patent AS (
        SELECT DISTINCT i.inventor_id, i.patent_id, py.year,
               a.disambig_assignee_organization AS org
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        JOIN {ASSIGNEE_TSV()} a ON i.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
    ),
    -- Prolific inventors (10+ patents)
    prolific AS (
        SELECT inventor_id, COUNT(DISTINCT patent_id) AS total_patents
        FROM inv_patent
        GROUP BY inventor_id
        HAVING COUNT(DISTINCT patent_id) >= 10
    ),
    -- Distinct orgs per inventor
    inventor_orgs AS (
        SELECT ip.inventor_id, COUNT(DISTINCT ip.org) AS num_orgs
        FROM inv_patent ip
        JOIN prolific p ON ip.inventor_id = p.inventor_id
        GROUP BY ip.inventor_id
    ),
    -- Forward citations per patent
    fwd_cites AS (
        SELECT c.citation_patent_id AS patent_id, COUNT(*) AS fwd_cites
        FROM {CITATION_TSV()} c
        GROUP BY c.citation_patent_id
    ),
    -- Join: inventor mobility status + patent citations
    inventor_cites AS (
        SELECT
            CASE WHEN io.num_orgs > 1 THEN 'Mobile' ELSE 'Non-Mobile' END AS mobility,
            ip.patent_id,
            COALESCE(fc.fwd_cites, 0) AS fwd_cites
        FROM inv_patent ip
        JOIN prolific p ON ip.inventor_id = p.inventor_id
        JOIN inventor_orgs io ON ip.inventor_id = io.inventor_id
        LEFT JOIN fwd_cites fc ON ip.patent_id = fc.patent_id
    )
    SELECT
        mobility,
        COUNT(DISTINCT patent_id) AS patent_count,
        ROUND(AVG(fwd_cites), 2) AS avg_citations,
        ROUND(MEDIAN(fwd_cites), 0) AS median_citations
    FROM inventor_cites
    GROUP BY mobility
    ORDER BY mobility
""", f"{OUT}/inventor_mobility.json")

# ── Mobility rate over time ──────────────────────────────────────────────────
timed_msg("inventor_mobility_by_decade: mobility rate for prolific inventors by decade")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    inv_patent AS (
        SELECT DISTINCT i.inventor_id, i.patent_id, py.year,
               a.disambig_assignee_organization AS org
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        JOIN {ASSIGNEE_TSV()} a ON i.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
    ),
    -- Inventors with 5+ patents per decade
    decade_inventors AS (
        SELECT inventor_id,
               CAST(FLOOR(year / 10) * 10 AS INTEGER) AS decade,
               COUNT(DISTINCT patent_id) AS patents,
               COUNT(DISTINCT org) AS num_orgs
        FROM inv_patent
        GROUP BY inventor_id, CAST(FLOOR(year / 10) * 10 AS INTEGER)
        HAVING COUNT(DISTINCT patent_id) >= 5
    )
    SELECT
        decade,
        CONCAT(CAST(decade AS VARCHAR), 's') AS decade_label,
        COUNT(*) AS total_inventors,
        SUM(CASE WHEN num_orgs > 1 THEN 1 ELSE 0 END) AS mobile_inventors,
        ROUND(100.0 * SUM(CASE WHEN num_orgs > 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS mobility_rate
    FROM decade_inventors
    WHERE decade BETWEEN 1980 AND 2020
    GROUP BY decade
    ORDER BY decade
""", f"{OUT}/inventor_mobility_by_decade.json")

con.close()
print("\n=== Inventor Mobility complete ===\n")
