#!/usr/bin/env python3
"""
Chapter 10 – Patent Law & Policy: Empirical Analyses
Generates data for three visualizations that complement the legal narrative:

  - hhi_by_section.json          — HHI market concentration per CPC section per 5-year period
  - applications_vs_grants.json  — Filing vs grant activity per year
  - convergence_matrix.json      — CPC section co-occurrence by era
"""
import duckdb
from config import (
    PATENT_TSV, APPLICATION_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter10"
con = duckdb.connect()

# ── a) HHI by CPC section per 5-year period ─────────────────────────────────
timed_msg("hhi_by_section: HHI market concentration per CPC section per 5-year period")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS yr
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    patent_section AS (
        SELECT DISTINCT py.patent_id, py.yr,
               LEFT(cpc.cpc_section, 1) AS section
        FROM patent_year py
        JOIN {CPC_CURRENT_TSV()} cpc ON py.patent_id = cpc.patent_id
            AND cpc.cpc_sequence = 0
        WHERE LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    patent_assignee AS (
        SELECT ps.patent_id, ps.yr, ps.section,
               a.disambig_assignee_organization AS org
        FROM patent_section ps
        JOIN {ASSIGNEE_TSV()} a ON ps.patent_id = a.patent_id
            AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
    ),
    -- Compute per period/section
    period_section_org AS (
        SELECT
            CAST(FLOOR(yr / 5) * 5 AS INTEGER) AS period_start,
            section,
            org,
            COUNT(*) AS patents
        FROM patent_assignee
        GROUP BY period_start, section, org
    ),
    period_section_total AS (
        SELECT period_start, section, SUM(patents) AS total_patents
        FROM period_section_org
        GROUP BY period_start, section
    ),
    hhi_by_sec AS (
        SELECT
            pso.period_start,
            pso.section,
            pst.total_patents,
            ROUND(SUM(POWER(100.0 * pso.patents / pst.total_patents, 2)), 1) AS hhi
        FROM period_section_org pso
        JOIN period_section_total pst
            ON pso.period_start = pst.period_start AND pso.section = pst.section
        GROUP BY pso.period_start, pso.section, pst.total_patents
    ),
    -- Also compute "Overall" aggregate per period
    overall_org AS (
        SELECT period_start, org, SUM(patents) AS patents
        FROM period_section_org
        GROUP BY period_start, org
    ),
    overall_total AS (
        SELECT period_start, SUM(patents) AS total_patents
        FROM overall_org
        GROUP BY period_start
    ),
    hhi_overall AS (
        SELECT
            oo.period_start,
            'Overall' AS section,
            ot.total_patents,
            ROUND(SUM(POWER(100.0 * oo.patents / ot.total_patents, 2)), 1) AS hhi
        FROM overall_org oo
        JOIN overall_total ot ON oo.period_start = ot.period_start
        GROUP BY oo.period_start, ot.total_patents
    ),
    combined AS (
        SELECT * FROM hhi_by_sec
        UNION ALL
        SELECT * FROM hhi_overall
    )
    SELECT
        CAST(period_start AS INTEGER) AS period_start,
        CONCAT(CAST(CAST(period_start AS INTEGER) AS VARCHAR), '-', CAST(CAST(period_start AS INTEGER) + 4 AS VARCHAR)) AS period,
        section,
        CAST(total_patents AS INTEGER) AS total_patents,
        hhi
    FROM combined
    ORDER BY period_start, section
""", f"{OUT}/hhi_by_section.json")

# ── b) Applications vs grants per year ───────────────────────────────────────
timed_msg("applications_vs_grants: filing vs grant activity per year")

query_to_json(con, f"""
    WITH grants AS (
        SELECT
            YEAR(CAST(patent_date AS DATE)) AS year,
            COUNT(*) AS grants
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year
    ),
    apps AS (
        SELECT
            YEAR(CAST(a.filing_date AS DATE)) AS year,
            COUNT(*) AS applications
        FROM {APPLICATION_TSV()} a
        JOIN {PATENT_TSV()} p ON a.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND a.filing_date IS NOT NULL
          AND YEAR(CAST(a.filing_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year
    )
    SELECT
        COALESCE(g.year, a.year) AS year,
        COALESCE(a.applications, 0) AS applications,
        COALESCE(g.grants, 0) AS grants,
        CASE WHEN a.applications > 0
             THEN ROUND(100.0 * g.grants / a.applications, 1)
             ELSE NULL
        END AS grant_to_application_ratio
    FROM grants g
    FULL OUTER JOIN apps a ON g.year = a.year
    WHERE COALESCE(g.year, a.year) BETWEEN 1976 AND 2025
    ORDER BY year
""", f"{OUT}/applications_vs_grants.json")

# ── c) Technology convergence matrix ─────────────────────────────────────────
timed_msg("convergence_matrix: CPC section co-occurrence by era")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS yr
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    patent_sections AS (
        SELECT DISTINCT py.patent_id, py.yr,
               LEFT(cpc.cpc_section, 1) AS section
        FROM patent_year py
        JOIN {CPC_CURRENT_TSV()} cpc ON py.patent_id = cpc.patent_id
        WHERE LEFT(cpc.cpc_section, 1) != 'Y'
    ),
    -- Only patents with 2+ distinct sections
    multi_section AS (
        SELECT patent_id, yr
        FROM patent_sections
        GROUP BY patent_id, yr
        HAVING COUNT(DISTINCT section) >= 2
    ),
    -- Generate all ordered pairs for multi-section patents
    pairs AS (
        SELECT
            ps1.patent_id,
            ps1.yr,
            ps1.section AS section_row,
            ps2.section AS section_col
        FROM patent_sections ps1
        JOIN patent_sections ps2
            ON ps1.patent_id = ps2.patent_id AND ps1.section < ps2.section
        JOIN multi_section ms ON ps1.patent_id = ms.patent_id
    ),
    era_label AS (
        SELECT *,
            CASE
                WHEN yr BETWEEN 1976 AND 1995 THEN '1976-1995'
                WHEN yr BETWEEN 1996 AND 2010 THEN '1996-2010'
                WHEN yr BETWEEN 2011 AND 2025 THEN '2011-2025'
            END AS era
        FROM pairs
    ),
    era_totals AS (
        SELECT era, COUNT(DISTINCT patent_id) AS era_total
        FROM era_label
        GROUP BY era
    ),
    pair_counts AS (
        SELECT
            el.era,
            el.section_row,
            el.section_col,
            COUNT(DISTINCT el.patent_id) AS patent_count
        FROM era_label el
        GROUP BY el.era, el.section_row, el.section_col
    )
    SELECT
        pc.era,
        pc.section_row,
        pc.section_col,
        ROUND(100.0 * pc.patent_count / et.era_total, 2) AS co_occurrence_pct,
        pc.patent_count
    FROM pair_counts pc
    JOIN era_totals et ON pc.era = et.era
    ORDER BY pc.era, pc.section_row, pc.section_col
""", f"{OUT}/convergence_matrix.json")

con.close()
print("\n=== Chapter 10: Patent Law & Policy complete ===\n")
