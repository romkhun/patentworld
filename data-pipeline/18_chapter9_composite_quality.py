#!/usr/bin/env python3
"""
Analysis #10 – Composite Patent Quality Index
Z-score normalize forward citations (5yr), claims, scope, grant lag;
average into composite index by year and CPC section.

Output: chapter9/composite_quality_index.json
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV, APPLICATION_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter9"
con = duckdb.connect()

timed_msg("composite_quality_index: Z-score composite quality by year and CPC section")

query_to_json(con, f"""
    WITH patent_base AS (
        SELECT p.patent_id,
               YEAR(CAST(p.patent_date AS DATE)) AS yr,
               CAST(p.patent_date AS DATE) AS grant_date,
               p.num_claims,
               LEFT(cpc.cpc_section, 1) AS section
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} cpc ON p.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2020
          AND LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    -- Forward citations within 5 years
    fwd_cites AS (
        SELECT c.citation_patent_id AS patent_id, COUNT(*) AS fwd_cites_5yr
        FROM {CITATION_TSV()} c
        JOIN patent_base pb_cited ON c.citation_patent_id = pb_cited.patent_id
        JOIN {PATENT_TSV()} p_citing ON c.patent_id = p_citing.patent_id
        WHERE DATEDIFF('day', pb_cited.grant_date, CAST(p_citing.patent_date AS DATE)) BETWEEN 0 AND 1826
        GROUP BY c.citation_patent_id
    ),
    -- Patent scope: distinct CPC subclasses
    scope AS (
        SELECT cpc.patent_id, COUNT(DISTINCT cpc.cpc_subclass) AS patent_scope
        FROM {CPC_CURRENT_TSV()} cpc
        JOIN patent_base pb ON cpc.patent_id = pb.patent_id
        GROUP BY cpc.patent_id
    ),
    -- Grant lag
    grant_lag AS (
        SELECT a.patent_id,
               DATEDIFF('day', CAST(a.filing_date AS DATE), pb.grant_date) AS lag_days
        FROM {APPLICATION_TSV()} a
        JOIN patent_base pb ON a.patent_id = pb.patent_id
        WHERE a.filing_date IS NOT NULL
    ),
    -- Combined raw metrics
    combined AS (
        SELECT
            pb.patent_id, pb.yr, pb.section,
            COALESCE(fc.fwd_cites_5yr, 0) AS fwd_cites_5yr,
            COALESCE(pb.num_claims, 0) AS num_claims,
            COALESCE(s.patent_scope, 1) AS patent_scope,
            COALESCE(gl.lag_days, 0) AS lag_days
        FROM patent_base pb
        LEFT JOIN fwd_cites fc ON pb.patent_id = fc.patent_id
        LEFT JOIN scope s ON pb.patent_id = s.patent_id
        LEFT JOIN grant_lag gl ON pb.patent_id = gl.patent_id
    ),
    -- Global means and stddevs for z-score
    global_stats AS (
        SELECT
            AVG(fwd_cites_5yr) AS mu_cites, STDDEV(fwd_cites_5yr) AS sd_cites,
            AVG(num_claims) AS mu_claims, STDDEV(num_claims) AS sd_claims,
            AVG(patent_scope) AS mu_scope, STDDEV(patent_scope) AS sd_scope,
            AVG(lag_days) AS mu_lag, STDDEV(lag_days) AS sd_lag
        FROM combined
    ),
    -- Z-scores (invert lag so lower lag = higher quality)
    zscored AS (
        SELECT c.yr, c.section,
            (c.fwd_cites_5yr - gs.mu_cites) / NULLIF(gs.sd_cites, 0) AS z_cites,
            (c.num_claims - gs.mu_claims) / NULLIF(gs.sd_claims, 0) AS z_claims,
            (c.patent_scope - gs.mu_scope) / NULLIF(gs.sd_scope, 0) AS z_scope,
            -(c.lag_days - gs.mu_lag) / NULLIF(gs.sd_lag, 0) AS z_lag
        FROM combined c, global_stats gs
    )
    SELECT
        yr AS year,
        section,
        COUNT(*) AS patent_count,
        ROUND(AVG(z_cites), 4) AS avg_z_cites,
        ROUND(AVG(z_claims), 4) AS avg_z_claims,
        ROUND(AVG(z_scope), 4) AS avg_z_scope,
        ROUND(AVG(z_lag), 4) AS avg_z_lag,
        ROUND((AVG(z_cites) + AVG(z_claims) + AVG(z_scope) + AVG(z_lag)) / 4, 4) AS composite_index
    FROM zscored
    GROUP BY yr, section
    ORDER BY yr, section
""", f"{OUT}/composite_quality_index.json")

con.close()
print("\n=== Composite Quality Index complete ===\n")
