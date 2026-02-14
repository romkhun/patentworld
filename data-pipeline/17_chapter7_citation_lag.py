#!/usr/bin/env python3
"""
Analysis #8 – Citation Lag Analysis
Measure time between cited patent grant and citing patent grant.

Output: chapter6/citation_lag_by_section.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter6"
con = duckdb.connect()

# ── Citation lag by CPC section and decade ───────────────────────────────────
timed_msg("citation_lag_by_section: median citation lag by technology area and decade")

query_to_json(con, f"""
    WITH citing_info AS (
        SELECT p.patent_id,
               CAST(p.patent_date AS DATE) AS grant_date,
               YEAR(CAST(p.patent_date AS DATE)) AS yr,
               LEFT(cpc.cpc_section, 1) AS section
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} cpc ON p.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    cited_dates AS (
        SELECT p.patent_id, CAST(p.patent_date AS DATE) AS grant_date
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility' AND p.patent_date IS NOT NULL
    ),
    lags AS (
        SELECT
            ci.section,
            CAST(FLOOR(ci.yr / 10) * 10 AS INTEGER) AS decade,
            DATEDIFF('day', cd.grant_date, ci.grant_date) AS lag_days
        FROM {CITATION_TSV()} c
        JOIN citing_info ci ON c.patent_id = ci.patent_id
        JOIN cited_dates cd ON c.citation_patent_id = cd.patent_id
        WHERE DATEDIFF('day', cd.grant_date, ci.grant_date) > 0
          AND DATEDIFF('day', cd.grant_date, ci.grant_date) < 36500
    )
    SELECT
        section,
        decade,
        CONCAT(CAST(decade AS VARCHAR), 's') AS decade_label,
        COUNT(*) AS citation_count,
        ROUND(AVG(lag_days), 0) AS avg_lag_days,
        ROUND(MEDIAN(lag_days), 0) AS median_lag_days,
        ROUND(AVG(lag_days) / 365.25, 1) AS avg_lag_years,
        ROUND(MEDIAN(lag_days) / 365.25, 1) AS median_lag_years
    FROM lags
    WHERE decade BETWEEN 1980 AND 2020
    GROUP BY section, decade
    ORDER BY section, decade
""", f"{OUT}/citation_lag_by_section.json")

# ── Overall citation lag trend by year ───────────────────────────────────────
timed_msg("citation_lag_trend: median citation lag over time")

query_to_json(con, f"""
    WITH citing_dates AS (
        SELECT p.patent_id, CAST(p.patent_date AS DATE) AS grant_date,
               YEAR(CAST(p.patent_date AS DATE)) AS yr
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility' AND p.patent_date IS NOT NULL
    ),
    cited_dates AS (
        SELECT p.patent_id, CAST(p.patent_date AS DATE) AS grant_date
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility' AND p.patent_date IS NOT NULL
    ),
    lags AS (
        SELECT
            cd_ing.yr AS year,
            DATEDIFF('day', cd_ed.grant_date, cd_ing.grant_date) AS lag_days
        FROM {CITATION_TSV()} c
        JOIN citing_dates cd_ing ON c.patent_id = cd_ing.patent_id
        JOIN cited_dates cd_ed ON c.citation_patent_id = cd_ed.patent_id
        WHERE DATEDIFF('day', cd_ed.grant_date, cd_ing.grant_date) > 0
          AND DATEDIFF('day', cd_ed.grant_date, cd_ing.grant_date) < 36500
          AND cd_ing.yr BETWEEN 1980 AND 2025
    )
    SELECT
        year,
        COUNT(*) AS citation_count,
        ROUND(AVG(lag_days) / 365.25, 2) AS avg_lag_years,
        ROUND(MEDIAN(lag_days) / 365.25, 2) AS median_lag_years
    FROM lags
    GROUP BY year
    ORDER BY year
""", f"{OUT}/citation_lag_trend.json")

con.close()
print("\n=== Citation Lag Analysis complete ===\n")
