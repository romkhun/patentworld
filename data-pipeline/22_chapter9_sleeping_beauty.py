#!/usr/bin/env python3
"""
Analysis #9 – Sleeping Beauty Patents
Identify patents with delayed citation bursts.
Criteria: <2 avg citations/year for first 10 years, then >10 citations in a 3-year window.

Output: chapter9/sleeping_beauties.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter9"
con = duckdb.connect()

timed_msg("sleeping_beauties: patents with delayed citation bursts")

query_to_json(con, f"""
    WITH cited_patents AS (
        SELECT patent_id, CAST(patent_date AS DATE) AS grant_date,
               YEAR(CAST(patent_date AS DATE)) AS grant_year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2010
    ),
    citing_dates AS (
        SELECT patent_id, CAST(patent_date AS DATE) AS grant_date
        FROM {PATENT_TSV()}
        WHERE patent_date IS NOT NULL
    ),
    -- Forward citations with year-after-grant
    fwd_cites AS (
        SELECT
            c.citation_patent_id AS patent_id,
            cp.grant_year,
            CAST(DATEDIFF('day', cp.grant_date, cd.grant_date) / 365.25 AS INTEGER) AS years_after
        FROM {CITATION_TSV()} c
        JOIN cited_patents cp ON c.citation_patent_id = cp.patent_id
        JOIN citing_dates cd ON c.patent_id = cd.patent_id
        WHERE DATEDIFF('day', cp.grant_date, cd.grant_date) > 0
    ),
    -- Early period: avg cites/year in first 10 years
    early AS (
        SELECT patent_id, grant_year,
               COUNT(*) AS early_cites,
               COUNT(*) / 10.0 AS avg_early_rate
        FROM fwd_cites
        WHERE years_after BETWEEN 0 AND 9
        GROUP BY patent_id, grant_year
    ),
    -- Late burst: max 3-year window citations after year 10
    late_windows AS (
        SELECT patent_id, years_after AS window_start,
               COUNT(*) AS window_cites
        FROM fwd_cites
        WHERE years_after >= 10
        GROUP BY patent_id, years_after
    ),
    -- Aggregate 3-year windows
    late_3yr AS (
        SELECT l1.patent_id,
               l1.window_start,
               SUM(l2.window_cites) AS burst_3yr
        FROM late_windows l1
        JOIN late_windows l2 ON l1.patent_id = l2.patent_id
            AND l2.window_start BETWEEN l1.window_start AND l1.window_start + 2
        GROUP BY l1.patent_id, l1.window_start
    ),
    best_burst AS (
        SELECT patent_id, MAX(burst_3yr) AS max_burst,
               MIN(CASE WHEN burst_3yr = (SELECT MAX(burst_3yr) FROM late_3yr l2 WHERE l2.patent_id = late_3yr.patent_id) THEN window_start END) AS burst_start_year
        FROM late_3yr
        GROUP BY patent_id
    ),
    -- Total forward cites
    total_cites AS (
        SELECT patent_id, COUNT(*) AS total_fwd_cites
        FROM fwd_cites GROUP BY patent_id
    ),
    -- Sleeping beauties: low early rate + high late burst
    candidates AS (
        SELECT e.patent_id, e.grant_year, e.early_cites, e.avg_early_rate,
               bb.max_burst, bb.burst_start_year,
               tc.total_fwd_cites
        FROM early e
        JOIN best_burst bb ON e.patent_id = bb.patent_id
        JOIN total_cites tc ON e.patent_id = tc.patent_id
        WHERE e.avg_early_rate < 2
          AND bb.max_burst >= 10
    )
    SELECT
        c.patent_id,
        c.grant_year,
        LEFT(cpc.cpc_section, 1) AS section,
        cpc.cpc_subclass,
        c.early_cites,
        ROUND(c.avg_early_rate, 2) AS avg_early_rate,
        c.max_burst AS burst_citations,
        c.burst_start_year AS burst_year_after_grant,
        c.total_fwd_cites
    FROM candidates c
    JOIN {CPC_CURRENT_TSV()} cpc ON c.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
    ORDER BY c.max_burst DESC
    LIMIT 50
""", f"{OUT}/sleeping_beauties.json")

con.close()
print("\n=== Sleeping Beauty Patents complete ===\n")
