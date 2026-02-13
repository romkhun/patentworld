#!/usr/bin/env python3
"""
Green Innovation Chapter – The Green Innovation Race
Analyzes Y02/Y04S (climate change mitigation/adaptation) patents.

Sections:
  1. Green patent volume over time + share
  2. Green technology breakdown by sub-category
  3. Top countries and companies
  4. Green AI intersection

Generates → public/data/green/
"""
import sys
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV, LOCATION_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)

def log(msg):
    print(msg, flush=True)

OUT = f"{OUTPUT_DIR}/green"
con = duckdb.connect()

# Y02/Y04S sub-category mapping
GREEN_CATEGORY_SQL = """
    CASE
        WHEN cpc_group LIKE 'Y02E10%' THEN 'Renewable Energy'
        WHEN cpc_group LIKE 'Y02E60%' THEN 'Batteries & Storage'
        WHEN cpc_group LIKE 'Y02E%' THEN 'Other Energy'
        WHEN cpc_group LIKE 'Y02T%' THEN 'Transportation / EVs'
        WHEN cpc_group LIKE 'Y02C%' THEN 'Carbon Capture'
        WHEN cpc_group LIKE 'Y02P%' THEN 'Industrial Production'
        WHEN cpc_group LIKE 'Y02B%' THEN 'Buildings'
        WHEN cpc_group LIKE 'Y02W%' THEN 'Waste Management'
        WHEN cpc_subclass LIKE 'Y04S%' OR cpc_group LIKE 'Y04S%' THEN 'Smart Grids'
        ELSE 'Other Green'
    END
"""

GREEN_FILTER = "(cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%' OR cpc_group LIKE 'Y02%' OR cpc_group LIKE 'Y04S%')"

# AI CPC filter (matching chapter 11 methodology)
AI_FILTER = """
    (cpc_group LIKE 'G06N%'
     OR cpc_group LIKE 'G06F18%'
     OR cpc_subclass = 'G06V'
     OR cpc_group LIKE 'G10L15%'
     OR cpc_group LIKE 'G06F40%')
"""

# ── Section 1: Green patent volume over time ─────────────────────────────────
timed_msg("Section 1: Green patent volume by year")

query_to_json(con, f"""
    WITH green AS (
        SELECT DISTINCT p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND {GREEN_FILTER}
    ),
    total AS (
        SELECT YEAR(CAST(patent_date AS DATE)) AS year,
               COUNT(*) AS total_patents
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year
    )
    SELECT t.year,
           COALESCE(g.green_count, 0) AS green_count,
           t.total_patents,
           ROUND(100.0 * COALESCE(g.green_count, 0) / t.total_patents, 3) AS green_pct
    FROM total t
    LEFT JOIN (
        SELECT year, COUNT(*) AS green_count FROM green GROUP BY year
    ) g ON t.year = g.year
    ORDER BY t.year
""", f"{OUT}/green_volume.json")

# ── Section 2: Green technology breakdown ─────────────────────────────────────
timed_msg("Section 2: Green patents by sub-category over time")

query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        {GREEN_CATEGORY_SQL} AS category,
        COUNT(DISTINCT p.patent_id) AS count
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND {GREEN_FILTER}
    GROUP BY year, category
    ORDER BY year, category
""", f"{OUT}/green_by_category.json")

# ── Section 3a: Top countries ─────────────────────────────────────────────────
timed_msg("Section 3a: Green patents by assignee country")

query_to_json(con, f"""
    WITH green_patents AS (
        SELECT DISTINCT p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND {GREEN_FILTER}
    )
    SELECT
        gp.year,
        CASE
            WHEN l.disambig_country = 'US' THEN 'United States'
            WHEN l.disambig_country = 'JP' THEN 'Japan'
            WHEN l.disambig_country = 'KR' THEN 'South Korea'
            WHEN l.disambig_country = 'CN' THEN 'China'
            WHEN l.disambig_country = 'DE' THEN 'Germany'
            WHEN l.disambig_country IN ('FR','GB','IT','NL','SE','CH','FI','AT','BE','DK','ES','IE','NO') THEN 'Rest of Europe'
            ELSE 'Rest of World'
        END AS country,
        COUNT(DISTINCT gp.patent_id) AS count
    FROM green_patents gp
    JOIN {ASSIGNEE_TSV()} a ON gp.patent_id = a.patent_id
    JOIN {LOCATION_TSV()} l ON a.location_id = l.location_id
    WHERE a.assignee_sequence = 0
    GROUP BY gp.year, country
    ORDER BY gp.year, country
""", f"{OUT}/green_by_country.json")

# ── Section 3b: Top companies ─────────────────────────────────────────────────
timed_msg("Section 3b: Top 20 green patent holders")

query_to_json(con, f"""
    WITH green_patents AS (
        SELECT DISTINCT p.patent_id
        FROM {PATENT_TSV()} p
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND {GREEN_FILTER}
    ),
    green_with_cat AS (
        SELECT DISTINCT gp.patent_id,
            {GREEN_CATEGORY_SQL} AS category
        FROM green_patents gp
        JOIN {CPC_CURRENT_TSV()} c ON gp.patent_id = c.patent_id
        WHERE {GREEN_FILTER}
    ),
    top_orgs AS (
        SELECT a.disambig_assignee_organization AS organization,
               COUNT(DISTINCT gp.patent_id) AS total_green
        FROM green_patents gp
        JOIN {ASSIGNEE_TSV()} a ON gp.patent_id = a.patent_id
        WHERE a.assignee_sequence = 0
          AND a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
        GROUP BY organization
        ORDER BY total_green DESC
        LIMIT 20
    )
    SELECT t.organization, t.total_green,
           gc.category, COUNT(DISTINCT gc.patent_id) AS category_count
    FROM top_orgs t
    JOIN {ASSIGNEE_TSV()} a ON t.organization = a.disambig_assignee_organization AND a.assignee_sequence = 0
    JOIN green_with_cat gc ON a.patent_id = gc.patent_id
    GROUP BY t.organization, t.total_green, gc.category
    ORDER BY t.total_green DESC, t.organization, gc.category
""", f"{OUT}/green_top_companies.json")

# ── Section 4: Green AI intersection ──────────────────────────────────────────
timed_msg("Section 4: Green AI patent intersection")

query_to_json(con, f"""
    WITH green_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {GREEN_FILTER}
    ),
    ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_FILTER}
    ),
    green_ai AS (
        SELECT g.patent_id
        FROM green_patents g
        JOIN ai_patents a ON g.patent_id = a.patent_id
    )
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        COUNT(DISTINCT ga.patent_id) AS green_ai_count
    FROM green_ai ga
    JOIN {PATENT_TSV()} p ON ga.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""", f"{OUT}/green_ai_trend.json")

# Green AI heatmap: green sub-category × AI subfield
timed_msg("Section 4b: Green × AI heatmap")

AI_SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'G06N3%' THEN 'Neural Networks'
        WHEN cpc_group LIKE 'G06N20%' THEN 'Machine Learning'
        WHEN cpc_group LIKE 'G06N5%' THEN 'Knowledge Systems'
        WHEN cpc_group LIKE 'G06N7%' THEN 'Probabilistic'
        WHEN cpc_group LIKE 'G06F18%' THEN 'Pattern Recognition'
        WHEN cpc_subclass = 'G06V' THEN 'Computer Vision'
        WHEN cpc_group LIKE 'G10L15%' THEN 'Speech Recognition'
        WHEN cpc_group LIKE 'G06F40%' THEN 'NLP'
        ELSE 'Other AI'
    END
"""

query_to_json(con, f"""
    WITH green_cpc AS (
        SELECT patent_id, {GREEN_CATEGORY_SQL} AS green_category
        FROM {CPC_CURRENT_TSV()}
        WHERE {GREEN_FILTER}
    ),
    ai_cpc AS (
        SELECT patent_id, {AI_SUBFIELD_SQL} AS ai_subfield
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_FILTER}
    )
    SELECT
        gc.green_category,
        ac.ai_subfield,
        COUNT(DISTINCT gc.patent_id) AS count
    FROM green_cpc gc
    JOIN ai_cpc ac ON gc.patent_id = ac.patent_id
    GROUP BY gc.green_category, ac.ai_subfield
    HAVING count > 5
    ORDER BY count DESC
""", f"{OUT}/green_ai_heatmap.json")

timed_msg("Green Innovation pipeline complete!")
con.close()
