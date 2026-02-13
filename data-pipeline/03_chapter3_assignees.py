#!/usr/bin/env python3
"""
Chapter 3 – Who Innovates
Generates: assignee_types_per_year, top_assignees, top_orgs_over_time,
           domestic_vs_foreign, concentration
"""
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter3"
con = duckdb.connect()

# ── a) Assignee types per year ────────────────────────────────────────────────
timed_msg("assignee_types_per_year: Corporate / Individual / Government by year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        CASE
            WHEN TRY_CAST(a.assignee_type AS INT) IN (2, 3) THEN 'Corporate'
            WHEN TRY_CAST(a.assignee_type AS INT) IN (4, 5) THEN 'Individual'
            WHEN TRY_CAST(a.assignee_type AS INT) IN (6, 7) THEN 'Government'
            ELSE 'Other'
        END AS category,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, category
    ORDER BY year, category
""", f"{OUT}/assignee_types_per_year.json")

# ── b) Top 50 assignees ──────────────────────────────────────────────────────
timed_msg("top_assignees: top 50 organizations by total utility patents")
query_to_json(con, f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(*) AS total_patents,
        MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year,
        MAX(YEAR(CAST(p.patent_date AS DATE))) AS last_year
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY organization
    ORDER BY total_patents DESC
    LIMIT 50
""", f"{OUT}/top_assignees.json")

# ── c) Top 20 orgs over time ─────────────────────────────────────────────────
timed_msg("top_orgs_over_time: yearly counts and rank for top 20 orgs")
query_to_json(con, f"""
    WITH top20 AS (
        SELECT a.disambig_assignee_organization AS organization
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND a.disambig_assignee_organization IS NOT NULL
          AND TRIM(a.disambig_assignee_organization) != ''
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY organization
        ORDER BY COUNT(*) DESC
        LIMIT 20
    ),
    yearly AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            a.disambig_assignee_organization AS organization,
            COUNT(*) AS count
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1980 AND 2025
          AND a.disambig_assignee_organization IN (SELECT organization FROM top20)
        GROUP BY year, organization
    )
    SELECT
        year,
        organization,
        count,
        RANK() OVER (PARTITION BY year ORDER BY count DESC) AS rank
    FROM yearly
    ORDER BY year, rank
""", f"{OUT}/top_orgs_over_time.json")

# ── d) Domestic vs foreign ───────────────────────────────────────────────────
timed_msg("domestic_vs_foreign: US vs Foreign assignees by year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        CASE
            WHEN TRY_CAST(a.assignee_type AS INT) IN (2, 4, 6) THEN 'US'
            WHEN TRY_CAST(a.assignee_type AS INT) IN (3, 5, 7) THEN 'Foreign'
            ELSE 'Unknown'
        END AS origin,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, origin
    ORDER BY year, origin
""", f"{OUT}/domestic_vs_foreign.json")

# ── e) Concentration: top-N org share by 5-year period ───────────────────────
timed_msg("concentration: top-10/50/100 org patent share by 5-year periods")
records = con.execute(f"""
    WITH patent_orgs AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            a.disambig_assignee_organization AS org,
            COUNT(*) AS cnt
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND a.disambig_assignee_organization IS NOT NULL
          AND TRIM(a.disambig_assignee_organization) != ''
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year, org
    ),
    period_orgs AS (
        SELECT
            FLOOR((year - 1976) / 5) * 5 + 1976 AS period_start,
            org,
            SUM(cnt) AS total
        FROM patent_orgs
        GROUP BY period_start, org
    ),
    ranked AS (
        SELECT
            period_start,
            org,
            total,
            ROW_NUMBER() OVER (PARTITION BY period_start ORDER BY total DESC) AS rn,
            SUM(total) OVER (PARTITION BY period_start) AS period_total
        FROM period_orgs
    )
    SELECT
        period_start,
        CAST(period_start AS VARCHAR) || '-' || CAST(period_start + 4 AS VARCHAR) AS period,
        ROUND(100.0 * SUM(CASE WHEN rn <= 10 THEN total ELSE 0 END) / MAX(period_total), 2) AS top10_share,
        ROUND(100.0 * SUM(CASE WHEN rn <= 50 THEN total ELSE 0 END) / MAX(period_total), 2) AS top50_share,
        ROUND(100.0 * SUM(CASE WHEN rn <= 100 THEN total ELSE 0 END) / MAX(period_total), 2) AS top100_share,
        MAX(period_total) AS total_patents
    FROM ranked
    GROUP BY period_start, period
    ORDER BY period_start
""").fetchdf().to_dict(orient="records")
save_json(records, f"{OUT}/concentration.json")
print(f"  {len(records)} rows")

con.close()
print("\n=== Chapter 3 complete ===\n")
