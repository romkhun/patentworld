#!/usr/bin/env python3
"""
Shared utility for deep-dive domain pipeline scripts.
Each domain script defines its CPC filter and subfield mapping,
then calls run_domain_pipeline() to generate all standard analyses.
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV,
    LOCATION_TSV, CITATION_TSV, ASSIGNEE_TYPE_MAP,
    OUTPUT_DIR, query_to_json, timed_msg,
)


def run_domain_pipeline(
    domain_name: str,
    domain_slug: str,
    data_dir: str,
    cpc_filter_sql: str,
    subfield_sql: str,
    exclude_sections: str = "'Y'",
    start_year: int = 1976,
    org_start_year: int = 2000,
    top_org_limit: int = 15,
):
    """
    Run the standard deep-dive pipeline for a technology domain.

    Parameters
    ----------
    domain_name : str  — Human-readable domain name (e.g., "Semiconductor")
    domain_slug : str  — File prefix (e.g., "semi")
    data_dir : str     — Output subdirectory under public/data/ (e.g., "semiconductors")
    cpc_filter_sql : str — SQL WHERE clause fragment to identify domain patents
    subfield_sql : str — SQL CASE expression mapping CPC codes to subfields
    exclude_sections : str — CPC sections to exclude from diffusion analysis (comma-separated, quoted)
    start_year : int   — Analysis start year (default 1976)
    org_start_year : int — Start year for org ranking analysis (default 2000)
    top_org_limit : int — Number of orgs in rankings (default 15)
    """
    OUT = f"{OUTPUT_DIR}/{data_dir}"
    con = duckdb.connect()
    slug = domain_slug

    # ── 1) Annual patent counts + share ─────────────────────────────────────
    timed_msg(f"{domain_name}: annual patent counts")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT cpc.patent_id
            FROM {CPC_CURRENT_TSV()} cpc
            WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT p.patent_id, YEAR(CAST(p.patent_date AS DATE)) AS year
            FROM {PATENT_TSV()} p
            WHERE p.patent_type = 'utility'
              AND p.patent_date IS NOT NULL
              AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN {start_year} AND 2025
        ),
        total_by_year AS (
            SELECT year, COUNT(*) AS total_patents FROM patent_year GROUP BY year
        ),
        domain_by_year AS (
            SELECT py.year, COUNT(*) AS domain_patents
            FROM patent_year py
            JOIN domain_patents dp ON py.patent_id = dp.patent_id
            GROUP BY py.year
        )
        SELECT
            t.year,
            t.total_patents,
            COALESCE(d.domain_patents, 0) AS domain_patents,
            ROUND(100.0 * COALESCE(d.domain_patents, 0) / t.total_patents, 3) AS domain_pct
        FROM total_by_year t
        LEFT JOIN domain_by_year d ON t.year = d.year
        ORDER BY t.year
    """, f"{OUT}/{slug}_per_year.json")

    # ── 2) Sub-category breakdown ───────────────────────────────────────────
    timed_msg(f"{domain_name}: subfield breakdown")
    query_to_json(con, f"""
        WITH classified AS (
            SELECT DISTINCT cpc.patent_id,
                   {subfield_sql} AS subfield
            FROM {CPC_CURRENT_TSV()} cpc
            WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {PATENT_TSV()}
            WHERE patent_type = 'utility'
              AND patent_date IS NOT NULL
              AND YEAR(CAST(patent_date AS DATE)) BETWEEN {start_year} AND 2025
        )
        SELECT py.year, c.subfield, COUNT(DISTINCT c.patent_id) AS count
        FROM classified c
        JOIN patent_year py ON c.patent_id = py.patent_id
        GROUP BY py.year, c.subfield
        ORDER BY py.year, c.subfield
    """, f"{OUT}/{slug}_by_subfield.json")

    # ── 3) Top 50 assignees ─────────────────────────────────────────────────
    timed_msg(f"{domain_name}: top assignees")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {PATENT_TSV()}
            WHERE patent_type = 'utility'
              AND patent_date IS NOT NULL
              AND YEAR(CAST(patent_date AS DATE)) BETWEEN {start_year} AND 2025
        )
        SELECT
            a.disambig_assignee_organization AS organization,
            COUNT(DISTINCT dp.patent_id) AS domain_patents,
            MIN(py.year) AS first_year,
            MAX(py.year) AS last_year
        FROM domain_patents dp
        JOIN {ASSIGNEE_TSV()} a ON dp.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN patent_year py ON dp.patent_id = py.patent_id
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
        GROUP BY a.disambig_assignee_organization
        ORDER BY domain_patents DESC
        LIMIT 50
    """, f"{OUT}/{slug}_top_assignees.json")

    # ── 4) Org rankings over time ───────────────────────────────────────────
    timed_msg(f"{domain_name}: org rankings over time")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {PATENT_TSV()}
            WHERE patent_type = 'utility'
              AND patent_date IS NOT NULL
              AND YEAR(CAST(patent_date AS DATE)) BETWEEN {start_year} AND 2025
        ),
        top_orgs AS (
            SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT dp.patent_id) AS total
            FROM domain_patents dp
            JOIN {ASSIGNEE_TSV()} a ON dp.patent_id = a.patent_id AND a.assignee_sequence = 0
            WHERE a.disambig_assignee_organization IS NOT NULL
              AND a.disambig_assignee_organization != ''
            GROUP BY a.disambig_assignee_organization
            ORDER BY total DESC
            LIMIT {top_org_limit}
        )
        SELECT
            py.year,
            a.disambig_assignee_organization AS organization,
            COUNT(DISTINCT dp.patent_id) AS count
        FROM domain_patents dp
        JOIN patent_year py ON dp.patent_id = py.patent_id
        JOIN {ASSIGNEE_TSV()} a ON dp.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IN (SELECT organization FROM top_orgs)
        GROUP BY py.year, a.disambig_assignee_organization
        ORDER BY py.year, a.disambig_assignee_organization
    """, f"{OUT}/{slug}_org_over_time.json")

    # ── 5) Top 50 inventors ─────────────────────────────────────────────────
    timed_msg(f"{domain_name}: top inventors")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {PATENT_TSV()}
            WHERE patent_type = 'utility'
              AND patent_date IS NOT NULL
              AND YEAR(CAST(patent_date AS DATE)) BETWEEN {start_year} AND 2025
        )
        SELECT
            i.disambig_inventor_name_first AS first_name,
            i.disambig_inventor_name_last AS last_name,
            COUNT(DISTINCT dp.patent_id) AS domain_patents,
            MIN(py.year) AS first_year,
            MAX(py.year) AS last_year
        FROM domain_patents dp
        JOIN {INVENTOR_TSV()} i ON dp.patent_id = i.patent_id AND i.inventor_sequence = 0
        JOIN patent_year py ON dp.patent_id = py.patent_id
        WHERE i.disambig_inventor_name_last IS NOT NULL
          AND i.disambig_inventor_name_last != ''
        GROUP BY i.disambig_inventor_name_first, i.disambig_inventor_name_last
        ORDER BY domain_patents DESC
        LIMIT 50
    """, f"{OUT}/{slug}_top_inventors.json")

    # ── 6) Geography (countries + states) ───────────────────────────────────
    timed_msg(f"{domain_name}: geography")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {PATENT_TSV()}
            WHERE patent_type = 'utility'
              AND patent_date IS NOT NULL
              AND YEAR(CAST(patent_date AS DATE)) BETWEEN {start_year} AND 2025
        ),
        with_location AS (
            SELECT dp.patent_id, py.year,
                   l.disambig_country AS country, l.disambig_state AS state
            FROM domain_patents dp
            JOIN patent_year py ON dp.patent_id = py.patent_id
            JOIN {INVENTOR_TSV()} i ON dp.patent_id = i.patent_id AND i.inventor_sequence = 0
            JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
            WHERE l.disambig_country IS NOT NULL
        )
        SELECT country, state,
               COUNT(DISTINCT patent_id) AS domain_patents,
               MIN(year) AS first_year, MAX(year) AS last_year
        FROM with_location
        GROUP BY country, state
        ORDER BY domain_patents DESC
        LIMIT 100
    """, f"{OUT}/{slug}_geography.json")

    # ── 7) Quality indicators ───────────────────────────────────────────────
    timed_msg(f"{domain_name}: quality indicators")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_base AS (
            SELECT p.patent_id, YEAR(CAST(p.patent_date AS DATE)) AS year, p.num_claims
            FROM {PATENT_TSV()} p
            WHERE p.patent_type = 'utility'
              AND p.patent_date IS NOT NULL
              AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN {start_year} AND 2025
        ),
        domain_base AS (
            SELECT pb.* FROM patent_base pb JOIN domain_patents dp ON pb.patent_id = dp.patent_id
        ),
        backward AS (
            SELECT c.patent_id, COUNT(*) AS backward_cites
            FROM {CITATION_TSV()} c
            JOIN domain_patents dp ON c.patent_id = dp.patent_id
            GROUP BY c.patent_id
        ),
        scope AS (
            SELECT cpc.patent_id, COUNT(DISTINCT LEFT(cpc.cpc_subclass, 4)) AS patent_scope
            FROM {CPC_CURRENT_TSV()} cpc
            JOIN domain_patents dp ON cpc.patent_id = dp.patent_id
            GROUP BY cpc.patent_id
        ),
        team AS (
            SELECT i.patent_id, COUNT(DISTINCT i.inventor_id) AS num_inventors
            FROM {INVENTOR_TSV()} i
            JOIN domain_patents dp ON i.patent_id = dp.patent_id
            GROUP BY i.patent_id
        )
        SELECT
            db.year,
            COUNT(*) AS patent_count,
            ROUND(AVG(db.num_claims), 2) AS avg_claims,
            ROUND(AVG(COALESCE(b.backward_cites, 0)), 2) AS avg_backward_cites,
            ROUND(AVG(COALESCE(s.patent_scope, 1)), 2) AS avg_scope,
            ROUND(AVG(COALESCE(t.num_inventors, 1)), 2) AS avg_team_size
        FROM domain_base db
        LEFT JOIN backward b ON db.patent_id = b.patent_id
        LEFT JOIN scope s ON db.patent_id = s.patent_id
        LEFT JOIN team t ON db.patent_id = t.patent_id
        GROUP BY db.year
        ORDER BY db.year
    """, f"{OUT}/{slug}_quality.json")

    # ── 8) Team size comparison (domain vs non-domain) ──────────────────────
    timed_msg(f"{domain_name}: team size comparison")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_team AS (
            SELECT
                p.patent_id,
                YEAR(CAST(p.patent_date AS DATE)) AS year,
                COUNT(DISTINCT i.inventor_id) AS team_size,
                CASE WHEN dp.patent_id IS NOT NULL THEN '{domain_name}' ELSE 'Non-{domain_name}' END AS category
            FROM {PATENT_TSV()} p
            JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
            LEFT JOIN domain_patents dp ON p.patent_id = dp.patent_id
            WHERE p.patent_type = 'utility'
              AND p.patent_date IS NOT NULL
              AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1990 AND 2025
            GROUP BY p.patent_id, year, category
        )
        SELECT year, category,
               COUNT(*) AS patent_count,
               AVG(team_size) AS avg_team_size,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY team_size) AS median_team_size
        FROM patent_team
        GROUP BY year, category
        ORDER BY year, category
    """, f"{OUT}/{slug}_team_comparison.json")

    # ── 9) Assignee type distribution ───────────────────────────────────────
    timed_msg(f"{domain_name}: assignee type distribution")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        )
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            CASE
                WHEN a.assignee_type IN (2, 3) THEN 'Corporate'
                WHEN a.assignee_type IN (6, 7) THEN 'Government'
                WHEN a.assignee_type IN (4, 5) THEN 'Individual'
                ELSE 'University/Other'
            END AS assignee_category,
            COUNT(DISTINCT p.patent_id) AS count
        FROM domain_patents dp
        JOIN {PATENT_TSV()} p ON dp.patent_id = p.patent_id
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1990 AND 2025
        GROUP BY year, assignee_category
        ORDER BY year, assignee_category
    """, f"{OUT}/{slug}_assignee_type.json")

    # ── 10) Strategy/portfolio table ────────────────────────────────────────
    timed_msg(f"{domain_name}: strategy portfolio")
    query_to_json(con, f"""
        WITH classified AS (
            SELECT DISTINCT cpc.patent_id,
                   {subfield_sql} AS subfield
            FROM {CPC_CURRENT_TSV()} cpc
            JOIN {PATENT_TSV()} p ON cpc.patent_id = p.patent_id
            WHERE {cpc_filter_sql}
              AND p.patent_type = 'utility'
              AND p.patent_date IS NOT NULL
              AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN {start_year} AND 2025
        ),
        top_orgs AS (
            SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT c.patent_id) AS total
            FROM classified c
            JOIN {ASSIGNEE_TSV()} a ON c.patent_id = a.patent_id AND a.assignee_sequence = 0
            WHERE a.disambig_assignee_organization IS NOT NULL
              AND a.disambig_assignee_organization != ''
            GROUP BY a.disambig_assignee_organization
            ORDER BY total DESC
            LIMIT 20
        )
        SELECT
            a.disambig_assignee_organization AS organization,
            c.subfield,
            COUNT(DISTINCT c.patent_id) AS patent_count
        FROM classified c
        JOIN {ASSIGNEE_TSV()} a ON c.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IN (SELECT organization FROM top_orgs)
        GROUP BY a.disambig_assignee_organization, c.subfield
        ORDER BY a.disambig_assignee_organization, patent_count DESC
    """, f"{OUT}/{slug}_strategies.json")

    # ── 11) Cross-domain diffusion ──────────────────────────────────────────
    timed_msg(f"{domain_name}: cross-domain diffusion")
    query_to_json(con, f"""
        WITH domain_patents AS (
            SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {cpc_filter_sql}
        ),
        patent_year AS (
            SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
            FROM {PATENT_TSV()}
            WHERE patent_type = 'utility' AND patent_date IS NOT NULL
              AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1990 AND 2025
        ),
        other_sections AS (
            SELECT DISTINCT dp.patent_id, py.year,
                   LEFT(cpc.cpc_section, 1) AS co_section
            FROM domain_patents dp
            JOIN patent_year py ON dp.patent_id = py.patent_id
            JOIN {CPC_CURRENT_TSV()} cpc ON dp.patent_id = cpc.patent_id
            WHERE LEFT(cpc.cpc_section, 1) NOT IN ({exclude_sections})
        ),
        total_by_year AS (
            SELECT py.year, COUNT(DISTINCT dp.patent_id) AS total_domain
            FROM domain_patents dp
            JOIN patent_year py ON dp.patent_id = py.patent_id
            GROUP BY py.year
        )
        SELECT
            os.year,
            os.co_section AS section,
            COUNT(DISTINCT os.patent_id) AS domain_patents_with_section,
            tby.total_domain,
            ROUND(100.0 * COUNT(DISTINCT os.patent_id) / tby.total_domain, 2) AS pct_of_domain
        FROM other_sections os
        JOIN total_by_year tby ON os.year = tby.year
        GROUP BY os.year, os.co_section, tby.total_domain
        ORDER BY os.year, os.co_section
    """, f"{OUT}/{slug}_diffusion.json")

    con.close()
    print(f"\n=== {domain_name} pipeline complete ===\n")
