#!/usr/bin/env python3
"""
Explore – Interactive Data for the Explore Page
Generates: top_assignees_all, top_inventors_all, cpc_class_summary, wipo_field_summary
"""
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV, CPC_CURRENT_TSV, CPC_TITLE_TSV,
    WIPO_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/explore"
con = duckdb.connect()

# ── a) Top 500 assignees ────────────────────────────────────────────────────
timed_msg("top_assignees_all: top 500 organizations")
query_to_json(con, f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT p.patent_id) AS total_patents,
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
    LIMIT 500
""", f"{OUT}/top_assignees_all.json")

# ── b) Top 500 inventors ────────────────────────────────────────────────────
timed_msg("top_inventors_all: top 500 inventors")
query_to_json(con, f"""
    SELECT
        i.inventor_id,
        i.disambig_inventor_name_first AS first_name,
        i.disambig_inventor_name_last AS last_name,
        COUNT(DISTINCT p.patent_id) AS total_patents,
        MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year,
        MAX(YEAR(CAST(p.patent_date AS DATE))) AS last_year,
        MAX(i.gender_code) AS gender
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY i.inventor_id, first_name, last_name
    ORDER BY total_patents DESC
    LIMIT 500
""", f"{OUT}/top_inventors_all.json")

# ── c) CPC class summary ────────────────────────────────────────────────────
timed_msg("cpc_class_summary: all CPC classes with counts and titles")
query_to_json(con, f"""
    SELECT
        c.cpc_section AS section,
        c.cpc_group AS cpc_class,
        t.cpc_group_title AS class_name,
        COUNT(DISTINCT p.patent_id) AS total_patents
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    LEFT JOIN {CPC_TITLE_TSV()} t ON c.cpc_group = t.cpc_group
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY c.cpc_section, c.cpc_group, t.cpc_group_title
    ORDER BY total_patents DESC
""", f"{OUT}/cpc_class_summary.json")

# ── d) WIPO field summary ───────────────────────────────────────────────────
timed_msg("wipo_field_summary: all 35 WIPO fields with total counts")
query_to_json(con, f"""
    SELECT
        w.wipo_sector_title AS sector,
        w.wipo_field_title AS field,
        w.wipo_field_id AS field_id,
        COUNT(DISTINCT p.patent_id) AS total_patents
    FROM {PATENT_TSV()} p
    JOIN {WIPO_TSV()} w ON p.patent_id = w.patent_id AND w.wipo_field_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY sector, field, field_id
    ORDER BY total_patents DESC
""", f"{OUT}/wipo_field_summary.json")

con.close()
print("\n=== Explore data complete ===\n")
