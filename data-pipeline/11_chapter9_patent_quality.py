#!/usr/bin/env python3
"""
Chapter 9 – Patent Quality Dimensions
Based on Jaffe & de Rassenfosse (2017) "Patent citation data in social science research"

Generates:
  - quality_trends.json
  - originality_generality.json
  - self_citation_rate.json
  - quality_by_sector.json
  - breakthrough_patents.json
"""
import duckdb
import numpy as np
from config import (
    PATENT_TSV, APPLICATION_TSV, CPC_CURRENT_TSV, CITATION_TSV,
    INVENTOR_TSV, ASSIGNEE_TSV, WIPO_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter9"
con = duckdb.connect()

# ── a) Quality trends ────────────────────────────────────────────────────────
timed_msg("quality_trends: main time series of quality indicators by year")

query_to_json(con, f"""
    WITH patent_base AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            p.num_claims
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    backward_cites AS (
        SELECT c.patent_id, COUNT(*) AS backward_citations
        FROM {CITATION_TSV()} c
        GROUP BY c.patent_id
    ),
    forward_cites_5yr AS (
        SELECT
            c.citation_patent_id AS patent_id,
            COUNT(*) AS forward_citations_5yr
        FROM {CITATION_TSV()} c
        JOIN {PATENT_TSV()} citing ON c.patent_id = citing.patent_id
        JOIN {PATENT_TSV()} cited ON c.citation_patent_id = cited.patent_id
        WHERE citing.patent_date IS NOT NULL
          AND cited.patent_date IS NOT NULL
          AND DATEDIFF('day', CAST(cited.patent_date AS DATE), CAST(citing.patent_date AS DATE)) <= 1826
        GROUP BY c.citation_patent_id
    ),
    scope AS (
        SELECT patent_id, COUNT(DISTINCT LEFT(cpc_subclass, 4)) AS patent_scope
        FROM {CPC_CURRENT_TSV()}
        GROUP BY patent_id
    ),
    num_inventors AS (
        SELECT patent_id, COUNT(DISTINCT inventor_id) AS num_inventors
        FROM {INVENTOR_TSV()}
        GROUP BY patent_id
    ),
    grant_lag AS (
        SELECT
            a.patent_id,
            DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) AS grant_lag_days
        FROM {APPLICATION_TSV()} a
        JOIN {PATENT_TSV()} p ON a.patent_id = p.patent_id
        WHERE a.filing_date IS NOT NULL AND p.patent_date IS NOT NULL
    ),
    combined AS (
        SELECT
            pb.year,
            pb.num_claims,
            COALESCE(bc.backward_citations, 0) AS backward_citations,
            fc.forward_citations_5yr,
            COALESCE(sc.patent_scope, 1) AS patent_scope,
            COALESCE(ni.num_inventors, 1) AS num_inventors,
            gl.grant_lag_days
        FROM patent_base pb
        LEFT JOIN backward_cites bc ON pb.patent_id = bc.patent_id
        LEFT JOIN forward_cites_5yr fc ON pb.patent_id = fc.patent_id
        LEFT JOIN scope sc ON pb.patent_id = sc.patent_id
        LEFT JOIN num_inventors ni ON pb.patent_id = ni.patent_id
        LEFT JOIN grant_lag gl ON pb.patent_id = gl.patent_id
    )
    SELECT
        year,
        ROUND(AVG(num_claims), 2) AS avg_claims,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY num_claims) AS median_claims,
        ROUND(AVG(backward_citations), 2) AS avg_backward_cites,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY backward_citations) AS median_backward_cites,
        ROUND(AVG(forward_citations_5yr) FILTER (WHERE year <= 2020), 2) AS avg_forward_cites_5yr,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY forward_citations_5yr) FILTER (WHERE year <= 2020) AS median_forward_cites_5yr,
        ROUND(AVG(patent_scope), 2) AS avg_scope,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY patent_scope) AS median_scope,
        ROUND(AVG(num_inventors), 2) AS avg_inventors,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY num_inventors) AS median_inventors,
        ROUND(AVG(grant_lag_days), 1) AS avg_grant_lag_days,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY grant_lag_days) AS median_grant_lag_days
    FROM combined
    GROUP BY year
    ORDER BY year
""", f"{OUT}/quality_trends.json")

# ── b) Originality & Generality ──────────────────────────────────────────────
timed_msg("originality_generality: HHI-based diversity indices by year")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    -- Originality: diversity of CPC sections in backward citations
    backward_sections AS (
        SELECT
            c.patent_id,
            LEFT(cpc.cpc_section, 1) AS section,
            COUNT(*) AS cnt
        FROM {CITATION_TSV()} c
        JOIN {CPC_CURRENT_TSV()} cpc ON c.citation_patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        GROUP BY c.patent_id, LEFT(cpc.cpc_section, 1)
    ),
    backward_hhi AS (
        SELECT
            patent_id,
            SUM(POWER(CAST(cnt AS DOUBLE) / total, 2)) AS hhi
        FROM (
            SELECT bs.patent_id, bs.section, bs.cnt, SUM(bs.cnt) OVER (PARTITION BY bs.patent_id) AS total
            FROM backward_sections bs
        ) sub
        WHERE total >= 2
        GROUP BY patent_id
    ),
    originality AS (
        SELECT py.year, ROUND(AVG(1.0 - bh.hhi), 4) AS avg_originality,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 1.0 - bh.hhi) AS median_originality
        FROM patent_year py
        JOIN backward_hhi bh ON py.patent_id = bh.patent_id
        GROUP BY py.year
    ),
    -- Generality: diversity of CPC sections in forward citations
    forward_sections AS (
        SELECT
            c.citation_patent_id AS patent_id,
            LEFT(cpc.cpc_section, 1) AS section,
            COUNT(*) AS cnt
        FROM {CITATION_TSV()} c
        JOIN {CPC_CURRENT_TSV()} cpc ON c.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        GROUP BY c.citation_patent_id, LEFT(cpc.cpc_section, 1)
    ),
    forward_hhi AS (
        SELECT
            patent_id,
            SUM(POWER(CAST(cnt AS DOUBLE) / total, 2)) AS hhi
        FROM (
            SELECT fs.patent_id, fs.section, fs.cnt, SUM(fs.cnt) OVER (PARTITION BY fs.patent_id) AS total
            FROM forward_sections fs
        ) sub
        WHERE total >= 2
        GROUP BY patent_id
    ),
    generality AS (
        SELECT py.year, ROUND(AVG(1.0 - fh.hhi), 4) AS avg_generality,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 1.0 - fh.hhi) AS median_generality
        FROM patent_year py
        JOIN forward_hhi fh ON py.patent_id = fh.patent_id
        WHERE py.year <= 2020
        GROUP BY py.year
    )
    SELECT
        COALESCE(o.year, g.year) AS year,
        o.avg_originality,
        o.median_originality,
        g.avg_generality,
        g.median_generality
    FROM originality o
    FULL OUTER JOIN generality g ON o.year = g.year
    ORDER BY year
""", f"{OUT}/originality_generality.json")

# ── c) Self-citation rate ─────────────────────────────────────────────────────
timed_msg("self_citation_rate: self-citation rate by year")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT p.patent_id, YEAR(CAST(p.patent_date AS DATE)) AS year
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    patent_assignee AS (
        SELECT patent_id, disambig_assignee_organization AS org
        FROM {ASSIGNEE_TSV()}
        WHERE assignee_sequence = 0
          AND disambig_assignee_organization IS NOT NULL
          AND disambig_assignee_organization != ''
    ),
    cite_self AS (
        SELECT
            c.patent_id,
            c.citation_patent_id,
            CASE WHEN pa1.org = pa2.org THEN 1 ELSE 0 END AS is_self_cite
        FROM {CITATION_TSV()} c
        JOIN patent_assignee pa1 ON c.patent_id = pa1.patent_id
        JOIN patent_assignee pa2 ON c.citation_patent_id = pa2.patent_id
    ),
    per_patent AS (
        SELECT
            patent_id,
            CAST(SUM(is_self_cite) AS DOUBLE) / COUNT(*) AS self_cite_rate
        FROM cite_self
        GROUP BY patent_id
        HAVING COUNT(*) >= 1
    )
    SELECT
        py.year,
        ROUND(AVG(pp.self_cite_rate), 4) AS avg_self_cite_rate,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pp.self_cite_rate), 4) AS median_self_cite_rate
    FROM patent_year py
    JOIN per_patent pp ON py.patent_id = pp.patent_id
    GROUP BY py.year
    ORDER BY py.year
""", f"{OUT}/self_citation_rate.json")

# ── d) Quality by sector ─────────────────────────────────────────────────────
timed_msg("quality_by_sector: key indicators by WIPO sector over 5-year periods")

query_to_json(con, f"""
    WITH patent_base AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            FLOOR((YEAR(CAST(p.patent_date AS DATE)) - 1976) / 5) * 5 + 1976 AS period_start,
            p.num_claims
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    with_sector AS (
        SELECT pb.*, w.wipo_sector_title AS sector
        FROM patent_base pb
        JOIN {WIPO_TSV()} w ON pb.patent_id = w.patent_id AND w.wipo_field_sequence = 0
        WHERE w.wipo_sector_title IS NOT NULL
    ),
    forward_cites_5yr AS (
        SELECT
            c.citation_patent_id AS patent_id,
            COUNT(*) AS forward_citations_5yr
        FROM {CITATION_TSV()} c
        JOIN {PATENT_TSV()} citing ON c.patent_id = citing.patent_id
        JOIN {PATENT_TSV()} cited ON c.citation_patent_id = cited.patent_id
        WHERE citing.patent_date IS NOT NULL
          AND cited.patent_date IS NOT NULL
          AND DATEDIFF('day', CAST(cited.patent_date AS DATE), CAST(citing.patent_date AS DATE)) <= 1826
        GROUP BY c.citation_patent_id
    ),
    scope AS (
        SELECT patent_id, COUNT(DISTINCT LEFT(cpc_subclass, 4)) AS patent_scope
        FROM {CPC_CURRENT_TSV()}
        GROUP BY patent_id
    )
    SELECT
        CAST(ws.period_start AS INT) || '-' || CAST(ws.period_start + 4 AS INT) AS period,
        ws.sector,
        ROUND(AVG(fc.forward_citations_5yr), 2) AS avg_forward_cites,
        ROUND(AVG(ws.num_claims), 2) AS avg_claims,
        ROUND(AVG(sc.patent_scope), 2) AS avg_scope
    FROM with_sector ws
    LEFT JOIN forward_cites_5yr fc ON ws.patent_id = fc.patent_id AND ws.year <= 2020
    LEFT JOIN scope sc ON ws.patent_id = sc.patent_id
    GROUP BY ws.period_start, ws.sector
    ORDER BY ws.period_start, ws.sector
""", f"{OUT}/quality_by_sector.json")

# ── e) Breakthrough patents ───────────────────────────────────────────────────
timed_msg("breakthrough_patents: top-1% forward citation patents by year")

query_to_json(con, f"""
    WITH patent_base AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            LEFT(cpc.cpc_section, 1) AS tech_section
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} cpc ON p.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2020
    ),
    forward_cites AS (
        SELECT c.citation_patent_id AS patent_id, COUNT(*) AS fwd_cites
        FROM {CITATION_TSV()} c
        GROUP BY c.citation_patent_id
    ),
    with_cites AS (
        SELECT pb.*, COALESCE(fc.fwd_cites, 0) AS fwd_cites
        FROM patent_base pb
        LEFT JOIN forward_cites fc ON pb.patent_id = fc.patent_id
    ),
    with_pctl AS (
        SELECT *,
            PERCENT_RANK() OVER (PARTITION BY year, tech_section ORDER BY fwd_cites) AS pctl
        FROM with_cites
    )
    SELECT
        year,
        COUNT(*) AS total_patents,
        SUM(CASE WHEN pctl >= 0.99 THEN 1 ELSE 0 END) AS breakthrough_count,
        ROUND(100.0 * SUM(CASE WHEN pctl >= 0.99 THEN 1 ELSE 0 END) / COUNT(*), 3) AS breakthrough_pct
    FROM with_pctl
    GROUP BY year
    ORDER BY year
""", f"{OUT}/breakthrough_patents.json")

con.close()
print("\n=== Chapter 9: Patent Quality complete ===\n")
