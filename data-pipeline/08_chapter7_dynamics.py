#!/usr/bin/env python3
"""
Chapter 7 – Innovation Dynamics
Generates: grant_lag_by_sector, cross_domain, intl_collaboration,
           corp_diversification, innovation_velocity
"""
import duckdb
from config import (
    PATENT_TSV, APPLICATION_TSV, CPC_CURRENT_TSV, WIPO_TSV,
    ASSIGNEE_TSV, INVENTOR_TSV, LOCATION_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter7"
con = duckdb.connect()

# ── a) Grant lag by WIPO sector and 5-year period ────────────────────────────
timed_msg("grant_lag_by_sector: average/median grant lag by sector and period")
query_to_json(con, f"""
    WITH base AS (
        SELECT
            p.patent_id,
            CAST(p.patent_date AS DATE) AS grant_date,
            CAST(a.filing_date AS DATE) AS file_date,
            w.wipo_sector_title AS sector,
            DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) AS lag_days
        FROM {PATENT_TSV()} p
        JOIN {APPLICATION_TSV()} a ON p.patent_id = a.patent_id
        JOIN {WIPO_TSV()} w ON p.patent_id = w.patent_id AND w.wipo_field_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.filing_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    )
    SELECT
        FLOOR(YEAR(grant_date) / 5) * 5 AS period,
        sector,
        ROUND(AVG(lag_days), 0) AS avg_lag_days,
        ROUND(MEDIAN(lag_days), 0) AS median_lag_days,
        COUNT(*) AS count
    FROM base
    WHERE lag_days > 0 AND lag_days < 10000
    GROUP BY period, sector
    ORDER BY period, sector
""", f"{OUT}/grant_lag_by_sector.json")

# ── b) Cross-domain innovation (patents in multiple CPC sections) ────────────
timed_msg("cross_domain: patents classified in multiple CPC sections")
query_to_json(con, f"""
    WITH section_counts AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            COUNT(DISTINCT c.cpc_section) AS n_sections
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND c.cpc_section != 'Y'
        GROUP BY p.patent_id, year
    )
    SELECT
        year,
        COUNT(*) AS total,
        SUM(CASE WHEN n_sections = 1 THEN 1 ELSE 0 END) AS single_section,
        SUM(CASE WHEN n_sections = 2 THEN 1 ELSE 0 END) AS two_sections,
        SUM(CASE WHEN n_sections >= 3 THEN 1 ELSE 0 END) AS three_plus_sections,
        ROUND(100.0 * SUM(CASE WHEN n_sections >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS multi_section_pct
    FROM section_counts
    GROUP BY year
    ORDER BY year
""", f"{OUT}/cross_domain.json")

# ── c) International collaboration (inventors from multiple countries) ────────
timed_msg("intl_collaboration: patents with inventors from multiple countries")
query_to_json(con, f"""
    WITH patent_countries AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            COUNT(DISTINCT l.disambig_country) AS n_countries
        FROM {PATENT_TSV()} p
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND l.disambig_country IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY p.patent_id, year
    )
    SELECT
        year,
        COUNT(*) AS total_patents,
        SUM(CASE WHEN n_countries >= 2 THEN 1 ELSE 0 END) AS intl_collab_count,
        ROUND(100.0 * SUM(CASE WHEN n_countries >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS intl_collab_pct
    FROM patent_countries
    GROUP BY year
    ORDER BY year
""", f"{OUT}/intl_collaboration.json")

# ── d) Corporate diversification (top 10 orgs, CPC section distribution) ─────
timed_msg("corp_diversification: top orgs' technology breadth, early vs late")
records = con.execute(f"""
    WITH top_orgs AS (
        SELECT disambig_assignee_organization AS organization, COUNT(*) AS total
        FROM {ASSIGNEE_TSV()} a
        JOIN {PATENT_TSV()} p ON a.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND a.assignee_sequence = 0
          AND a.disambig_assignee_organization IS NOT NULL
          AND LENGTH(TRIM(a.disambig_assignee_organization)) > 1
        GROUP BY organization
        ORDER BY total DESC
        LIMIT 10
    ),
    org_section AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            c.cpc_section AS section,
            CASE
                WHEN YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2000 THEN 'early'
                WHEN YEAR(CAST(p.patent_date AS DATE)) BETWEEN 2001 AND 2025 THEN 'late'
            END AS era,
            COUNT(*) AS count
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT organization FROM top_orgs)
        GROUP BY a.disambig_assignee_organization, section, era
    )
    SELECT * FROM org_section
    WHERE era IS NOT NULL
    ORDER BY organization, era, section
""").fetchdf().to_dict(orient="records")
save_json(records, f"{OUT}/corp_diversification.json")
print(f"  {len(records)} rows")

# ── e) Innovation velocity (YoY growth rate by WIPO sector) ──────────────────
timed_msg("innovation_velocity: year-over-year growth by WIPO sector")
query_to_json(con, f"""
    WITH yearly AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            w.wipo_sector_title AS sector,
            COUNT(*) AS count
        FROM {PATENT_TSV()} p
        JOIN {WIPO_TSV()} w ON p.patent_id = w.patent_id AND w.wipo_field_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year, sector
    )
    SELECT
        y.year,
        y.sector,
        y.count,
        LAG(y.count) OVER (PARTITION BY y.sector ORDER BY y.year) AS prev_count,
        CASE
            WHEN LAG(y.count) OVER (PARTITION BY y.sector ORDER BY y.year) > 0
            THEN ROUND(100.0 * (y.count - LAG(y.count) OVER (PARTITION BY y.sector ORDER BY y.year))
                 / LAG(y.count) OVER (PARTITION BY y.sector ORDER BY y.year), 2)
            ELSE NULL
        END AS yoy_growth_pct
    FROM yearly y
    ORDER BY y.year, y.sector
""", f"{OUT}/innovation_velocity.json")

con.close()
print("\n=== Chapter 7 complete ===\n")
