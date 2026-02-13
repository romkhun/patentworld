#!/usr/bin/env python3
"""
Chapter 11 – Artificial Intelligence Patents
Analyzes patents related to AI (predictive and generative) using CPC classifications.

Key CPC classes for AI:
  G06N  - Computing arrangements based on specific computational models
          (neural networks, machine learning, genetic algorithms, fuzzy logic)
  G06F18 - Pattern recognition (classification, clustering, feature extraction)
  G06V  - Image or video recognition or understanding
  G10L15 - Speech recognition
  G06F40 - Natural language processing (NLP/text)
  G06T  - Image data processing (generative image models)

Generates:
  - ai_patents_per_year.json      — total AI patents per year
  - ai_by_subfield.json           — breakdown by AI subfield over time
  - ai_top_assignees.json         — top organizations in AI patenting
  - ai_top_inventors.json         — most prolific AI inventors
  - ai_geography.json             — top countries/states for AI patents
  - ai_quality.json               — AI patent quality indicators over time
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV,
    LOCATION_TSV, CITATION_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter11"
con = duckdb.connect()

# AI CPC class definitions
AI_CLASSES_SQL = """
    (cpc_group LIKE 'G06N%'
     OR cpc_group LIKE 'G06F18%'
     OR cpc_subclass = 'G06V'
     OR cpc_group LIKE 'G10L15%'
     OR cpc_group LIKE 'G06F40%')
"""

AI_SUBFIELD_SQL = """
    CASE
        WHEN cpc_group LIKE 'G06N3%' THEN 'Neural Networks / Deep Learning'
        WHEN cpc_group LIKE 'G06N20%' THEN 'Machine Learning'
        WHEN cpc_group LIKE 'G06N5%' THEN 'Knowledge-Based Systems'
        WHEN cpc_group LIKE 'G06N7%' THEN 'Probabilistic / Fuzzy'
        WHEN cpc_group LIKE 'G06N10%' THEN 'Quantum Computing'
        WHEN cpc_group LIKE 'G06N%' THEN 'Other Computational Models'
        WHEN cpc_group LIKE 'G06F18%' THEN 'Pattern Recognition'
        WHEN cpc_subclass = 'G06V' THEN 'Computer Vision'
        WHEN cpc_group LIKE 'G10L15%' THEN 'Speech Recognition'
        WHEN cpc_group LIKE 'G06F40%' THEN 'Natural Language Processing'
        ELSE 'Other AI'
    END
"""

# ── a) AI patents per year ──────────────────────────────────────────────────
timed_msg("ai_patents_per_year: AI patent counts by year")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT cpc.patent_id
        FROM {CPC_CURRENT_TSV()} cpc
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    total_by_year AS (
        SELECT year, COUNT(*) AS total_patents
        FROM patent_year
        GROUP BY year
    ),
    ai_by_year AS (
        SELECT py.year, COUNT(*) AS ai_patents
        FROM patent_year py
        JOIN ai_patents ap ON py.patent_id = ap.patent_id
        GROUP BY py.year
    )
    SELECT
        t.year,
        t.total_patents,
        COALESCE(a.ai_patents, 0) AS ai_patents,
        ROUND(100.0 * COALESCE(a.ai_patents, 0) / t.total_patents, 3) AS ai_pct
    FROM total_by_year t
    LEFT JOIN ai_by_year a ON t.year = a.year
    ORDER BY t.year
""", f"{OUT}/ai_patents_per_year.json")

# ── b) AI by subfield ───────────────────────────────────────────────────────
timed_msg("ai_by_subfield: breakdown by AI subfield over time")

query_to_json(con, f"""
    WITH ai_classified AS (
        SELECT DISTINCT
            cpc.patent_id,
            {AI_SUBFIELD_SQL} AS subfield
        FROM {CPC_CURRENT_TSV()} cpc
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    )
    SELECT
        py.year,
        ac.subfield,
        COUNT(DISTINCT ac.patent_id) AS count
    FROM ai_classified ac
    JOIN patent_year py ON ac.patent_id = py.patent_id
    GROUP BY py.year, ac.subfield
    ORDER BY py.year, ac.subfield
""", f"{OUT}/ai_by_subfield.json")

# ── c) Top AI assignees ─────────────────────────────────────────────────────
timed_msg("ai_top_assignees: top organizations by AI patent count")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    )
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT ap.patent_id) AS ai_patents,
        MIN(py.year) AS first_year,
        MAX(py.year) AS last_year
    FROM ai_patents ap
    JOIN {ASSIGNEE_TSV()} a ON ap.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN patent_year py ON ap.patent_id = py.patent_id
    WHERE a.disambig_assignee_organization IS NOT NULL
      AND a.disambig_assignee_organization != ''
    GROUP BY a.disambig_assignee_organization
    ORDER BY ai_patents DESC
    LIMIT 50
""", f"{OUT}/ai_top_assignees.json")

# ── d) Top AI inventors ──────────────────────────────────────────────────────
timed_msg("ai_top_inventors: most prolific AI inventors")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    )
    SELECT
        i.disambig_inventor_name_first AS first_name,
        i.disambig_inventor_name_last AS last_name,
        COUNT(DISTINCT ap.patent_id) AS ai_patents,
        MIN(py.year) AS first_year,
        MAX(py.year) AS last_year
    FROM ai_patents ap
    JOIN {INVENTOR_TSV()} i ON ap.patent_id = i.patent_id AND i.inventor_sequence = 0
    JOIN patent_year py ON ap.patent_id = py.patent_id
    WHERE i.disambig_inventor_name_last IS NOT NULL
      AND i.disambig_inventor_name_last != ''
    GROUP BY i.disambig_inventor_name_first, i.disambig_inventor_name_last
    ORDER BY ai_patents DESC
    LIMIT 50
""", f"{OUT}/ai_top_inventors.json")

# ── e) AI geography ─────────────────────────────────────────────────────────
timed_msg("ai_geography: top countries and states for AI patents")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    with_location AS (
        SELECT
            ap.patent_id,
            py.year,
            l.disambig_country AS country,
            l.disambig_state AS state
        FROM ai_patents ap
        JOIN patent_year py ON ap.patent_id = py.patent_id
        JOIN {INVENTOR_TSV()} i ON ap.patent_id = i.patent_id AND i.inventor_sequence = 0
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE l.disambig_country IS NOT NULL
    )
    SELECT
        country,
        state,
        COUNT(DISTINCT patent_id) AS ai_patents,
        MIN(year) AS first_year,
        MAX(year) AS last_year
    FROM with_location
    GROUP BY country, state
    ORDER BY ai_patents DESC
    LIMIT 100
""", f"{OUT}/ai_geography.json")

# ── f) AI quality indicators ────────────────────────────────────────────────
timed_msg("ai_quality: AI patent quality indicators over time")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_CLASSES_SQL}
    ),
    patent_base AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            p.num_claims
        FROM {PATENT_TSV()} p
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    ai_base AS (
        SELECT pb.* FROM patent_base pb JOIN ai_patents ap ON pb.patent_id = ap.patent_id
    ),
    backward AS (
        SELECT c.patent_id, COUNT(*) AS backward_cites
        FROM {CITATION_TSV()} c
        JOIN ai_patents ap ON c.patent_id = ap.patent_id
        GROUP BY c.patent_id
    ),
    scope AS (
        SELECT cpc.patent_id, COUNT(DISTINCT LEFT(cpc.cpc_subclass, 4)) AS patent_scope
        FROM {CPC_CURRENT_TSV()} cpc
        JOIN ai_patents ap ON cpc.patent_id = ap.patent_id
        GROUP BY cpc.patent_id
    ),
    team AS (
        SELECT i.patent_id, COUNT(DISTINCT i.inventor_id) AS num_inventors
        FROM {INVENTOR_TSV()} i
        JOIN ai_patents ap ON i.patent_id = ap.patent_id
        GROUP BY i.patent_id
    )
    SELECT
        ab.year,
        COUNT(*) AS patent_count,
        ROUND(AVG(ab.num_claims), 2) AS avg_claims,
        ROUND(AVG(COALESCE(b.backward_cites, 0)), 2) AS avg_backward_cites,
        ROUND(AVG(COALESCE(s.patent_scope, 1)), 2) AS avg_scope,
        ROUND(AVG(COALESCE(t.num_inventors, 1)), 2) AS avg_team_size
    FROM ai_base ab
    LEFT JOIN backward b ON ab.patent_id = b.patent_id
    LEFT JOIN scope s ON ab.patent_id = s.patent_id
    LEFT JOIN team t ON ab.patent_id = t.patent_id
    GROUP BY ab.year
    ORDER BY ab.year
""", f"{OUT}/ai_quality.json")

# ── g) AI org output over time ─────────────────────────────────────────────
timed_msg("ai_org_over_time: top AI org patent counts by year")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    top_orgs AS (
        SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT ap.patent_id) AS total
        FROM ai_patents ap
        JOIN {ASSIGNEE_TSV()} a ON ap.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
        GROUP BY a.disambig_assignee_organization
        ORDER BY total DESC
        LIMIT 15
    )
    SELECT
        py.year,
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT ap.patent_id) AS count
    FROM ai_patents ap
    JOIN patent_year py ON ap.patent_id = py.patent_id
    JOIN {ASSIGNEE_TSV()} a ON ap.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE a.disambig_assignee_organization IN (SELECT organization FROM top_orgs)
    GROUP BY py.year, a.disambig_assignee_organization
    ORDER BY py.year, a.disambig_assignee_organization
""", f"{OUT}/ai_org_over_time.json")

con.close()
print("\n=== Chapter 11: AI Patents complete ===\n")
