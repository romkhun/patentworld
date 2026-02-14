#!/usr/bin/env python3
"""
Analysis #1 – Friction Maps
Show which technology areas face longer patent examination times.
Heatmap: CPC section × 5-year period, colored by median examination duration.

Output: chapter7/friction_map.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, APPLICATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter7"
con = duckdb.connect()

timed_msg("friction_map: examination duration by CPC section and period")

query_to_json(con, f"""
    WITH patent_lag AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS yr,
            DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) AS lag_days,
            LEFT(cpc.cpc_section, 1) AS section
        FROM {PATENT_TSV()} p
        JOIN {APPLICATION_TSV()} a ON p.patent_id = a.patent_id
        JOIN {CPC_CURRENT_TSV()} cpc ON p.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.filing_date IS NOT NULL
          AND LEFT(cpc.cpc_section, 1) != 'Y'
          AND DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) > 0
          AND DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) < 10000
    )
    SELECT
        section,
        CAST(FLOOR(yr / 5) * 5 AS INTEGER) AS period_start,
        CONCAT(CAST(CAST(FLOOR(yr / 5) * 5 AS INTEGER) AS VARCHAR), '-', CAST(CAST(FLOOR(yr / 5) * 5 AS INTEGER) + 4 AS VARCHAR)) AS period,
        COUNT(*) AS patent_count,
        ROUND(AVG(lag_days), 0) AS avg_lag_days,
        ROUND(MEDIAN(lag_days), 0) AS median_lag_days,
        ROUND(AVG(lag_days) / 365.25, 1) AS avg_lag_years,
        ROUND(MEDIAN(lag_days) / 365.25, 1) AS median_lag_years
    FROM patent_lag
    WHERE yr BETWEEN 1976 AND 2025
    GROUP BY section, period_start
    ORDER BY section, period_start
""", f"{OUT}/friction_map.json")

con.close()
print("\n=== Friction Maps complete ===\n")
