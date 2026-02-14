#!/usr/bin/env python3
"""
Analyses #11, #12 – AI Patenting Strategies + AI as General Purpose Technology
AI portfolio per major player + AI co-occurrence with non-AI CPC sections.

Outputs:
  - chapter11/ai_strategies.json     — AI sub-area counts per top assignee
  - chapter11/ai_gpt_diffusion.json  — AI patent co-occurrence with non-AI CPC sections over time
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter11"
con = duckdb.connect()

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

# ── #11: AI Strategies per company ───────────────────────────────────────────
timed_msg("ai_strategies: AI sub-area patent counts per top company")

query_to_json(con, f"""
    WITH ai_classified AS (
        SELECT DISTINCT cpc.patent_id,
               {AI_SUBFIELD_SQL} AS subfield
        FROM {CPC_CURRENT_TSV()} cpc
        JOIN {PATENT_TSV()} p ON cpc.patent_id = p.patent_id
        WHERE {AI_CLASSES_SQL}
          AND p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    top_ai_orgs AS (
        SELECT a.disambig_assignee_organization AS organization, COUNT(DISTINCT ac.patent_id) AS total
        FROM ai_classified ac
        JOIN {ASSIGNEE_TSV()} a ON ac.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
        GROUP BY a.disambig_assignee_organization
        ORDER BY total DESC
        LIMIT 20
    )
    SELECT
        a.disambig_assignee_organization AS organization,
        ac.subfield,
        COUNT(DISTINCT ac.patent_id) AS patent_count
    FROM ai_classified ac
    JOIN {ASSIGNEE_TSV()} a ON ac.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE a.disambig_assignee_organization IN (SELECT organization FROM top_ai_orgs)
    GROUP BY a.disambig_assignee_organization, ac.subfield
    ORDER BY a.disambig_assignee_organization, patent_count DESC
""", f"{OUT}/ai_strategies.json")

# ── #12: AI as GPT — co-occurrence with non-AI CPC sections ─────────────────
timed_msg("ai_gpt_diffusion: AI patent co-occurrence with non-AI CPC sections over time")

query_to_json(con, f"""
    WITH ai_patents AS (
        SELECT DISTINCT patent_id
        FROM {CPC_CURRENT_TSV()}
        WHERE {AI_CLASSES_SQL}
    ),
    patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1990 AND 2025
    ),
    -- All CPC sections for AI patents (excluding G and Y since G contains AI)
    ai_other_sections AS (
        SELECT DISTINCT ap.patent_id, py.year,
               LEFT(cpc.cpc_section, 1) AS co_section
        FROM ai_patents ap
        JOIN patent_year py ON ap.patent_id = py.patent_id
        JOIN {CPC_CURRENT_TSV()} cpc ON ap.patent_id = cpc.patent_id
        WHERE LEFT(cpc.cpc_section, 1) NOT IN ('G', 'Y')
    ),
    ai_total_by_year AS (
        SELECT py.year, COUNT(DISTINCT ap.patent_id) AS total_ai
        FROM ai_patents ap
        JOIN patent_year py ON ap.patent_id = py.patent_id
        GROUP BY py.year
    )
    SELECT
        aos.year,
        aos.co_section AS section,
        COUNT(DISTINCT aos.patent_id) AS ai_patents_with_section,
        ait.total_ai,
        ROUND(100.0 * COUNT(DISTINCT aos.patent_id) / ait.total_ai, 2) AS pct_of_ai
    FROM ai_other_sections aos
    JOIN ai_total_by_year ait ON aos.year = ait.year
    GROUP BY aos.year, aos.co_section, ait.total_ai
    ORDER BY aos.year, aos.co_section
""", f"{OUT}/ai_gpt_diffusion.json")

con.close()
print("\n=== AI Deep Analysis complete ===\n")
