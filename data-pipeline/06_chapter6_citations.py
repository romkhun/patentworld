#!/usr/bin/env python3
"""
Chapter 6 – The Knowledge Network
Generates: citations_per_year, citation_categories, citation_lag,
           gov_funded_per_year, gov_agencies
"""
import duckdb
from config import (
    PATENT_TSV, CITATION_TSV, GOV_INTEREST_TSV, GOV_INTEREST_ORG_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter6"
con = duckdb.connect()

# ── a) Citations received per year ───────────────────────────────────────────
timed_msg("citations_per_year: avg and median citations per patent by grant year")
query_to_json(con, f"""
    WITH cite_counts AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            COUNT(c.citation_patent_id) AS num_citations
        FROM {PATENT_TSV()} p
        LEFT JOIN {CITATION_TSV()} c ON p.patent_id = c.patent_id
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY p.patent_id, year
    )
    SELECT
        year,
        ROUND(AVG(num_citations), 2) AS avg_citations,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY num_citations) AS median_citations,
        COUNT(*) AS total_patents
    FROM cite_counts
    GROUP BY year
    ORDER BY year
""", f"{OUT}/citations_per_year.json")

# ── b) Citation categories per year ─────────────────────────────────────────
timed_msg("citation_categories: citation counts by category and year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.citation_category AS category,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {CITATION_TSV()} c ON p.patent_id = c.patent_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND c.citation_category IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, category
    ORDER BY year, category
""", f"{OUT}/citation_categories.json")

# ── c) Citation lag ──────────────────────────────────────────────────────────
timed_msg("citation_lag: avg and median citation lag in days per citing year")
query_to_json(con, f"""
    WITH lags AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            CAST(p.patent_date AS DATE) - CAST(c.citation_date AS DATE) AS lag_days
        FROM {PATENT_TSV()} p
        JOIN {CITATION_TSV()} c ON p.patent_id = c.patent_id
        WHERE p.patent_date IS NOT NULL
          AND c.citation_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND (CAST(p.patent_date AS DATE) - CAST(c.citation_date AS DATE)) BETWEEN 0 AND 36500
    )
    SELECT
        year,
        ROUND(AVG(lag_days), 1) AS avg_lag_days,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lag_days) AS median_lag_days,
        COUNT(*) AS total_citations
    FROM lags
    GROUP BY year
    ORDER BY year
""", f"{OUT}/citation_lag.json")

# ── d) Government-funded patents per year ────────────────────────────────────
timed_msg("gov_funded_per_year: count of government-interest patents by year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        COUNT(DISTINCT p.patent_id) AS count
    FROM {PATENT_TSV()} p
    JOIN {GOV_INTEREST_TSV()} g ON p.patent_id = g.patent_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""", f"{OUT}/gov_funded_per_year.json")

# ── e) Top 20 government agencies ───────────────────────────────────────────
timed_msg("gov_agencies: top 20 funding agencies by patent count")
query_to_json(con, f"""
    SELECT
        o.level_one AS agency,
        COUNT(DISTINCT o.patent_id) AS total_patents
    FROM {GOV_INTEREST_ORG_TSV()} o
    WHERE o.level_one IS NOT NULL
      AND TRIM(o.level_one) != ''
    GROUP BY agency
    ORDER BY total_patents DESC
    LIMIT 20
""", f"{OUT}/gov_agencies.json")

con.close()
print("\n=== Chapter 6 complete ===\n")
