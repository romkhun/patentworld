#!/usr/bin/env python3
"""
Chapter 1 – The Innovation Landscape
Generates: patents_per_year, patents_per_month, claims_per_year, grant_lag, hero_stats
"""
import duckdb
from config import (
    PATENT_TSV, APPLICATION_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter1"
con = duckdb.connect()

# ── a) Patents per year by type ────────────────────────────────────────────────
timed_msg("patents_per_year: patent counts by year and type")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(patent_date AS DATE)) AS year,
        patent_type,
        COUNT(*) AS count
    FROM {PATENT_TSV()}
    WHERE patent_date IS NOT NULL
      AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, patent_type
    ORDER BY year, patent_type
""", f"{OUT}/patents_per_year.json")

# ── b) Monthly utility patents ─────────────────────────────────────────────────
timed_msg("patents_per_month: monthly utility patent counts")
query_to_json(con, f"""
    SELECT
        STRFTIME(DATE_TRUNC('month', CAST(patent_date AS DATE)), '%Y-%m') AS month,
        COUNT(*) AS count
    FROM {PATENT_TSV()}
    WHERE patent_date IS NOT NULL
      AND patent_type = 'utility'
      AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY month
    ORDER BY month
""", f"{OUT}/patents_per_month.json")

# ── c) Claims per year ────────────────────────────────────────────────────────
timed_msg("claims_per_year: avg and median claims for utility patents")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(patent_date AS DATE)) AS year,
        ROUND(AVG(num_claims), 2) AS avg_claims,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY num_claims) AS median_claims,
        COUNT(*) AS count
    FROM {PATENT_TSV()}
    WHERE patent_date IS NOT NULL
      AND patent_type = 'utility'
      AND num_claims IS NOT NULL
      AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""", f"{OUT}/claims_per_year.json")

# ── d) Grant lag (filing to grant) ────────────────────────────────────────────
timed_msg("grant_lag: avg and median days from filing to grant")
query_to_json(con, f"""
    WITH lags AS (
        SELECT
            YEAR(CAST(p.patent_date AS DATE)) AS grant_year,
            CAST(p.patent_date AS DATE) - CAST(a.filing_date AS DATE) AS lag_days
        FROM {PATENT_TSV()} p
        JOIN {APPLICATION_TSV()} a ON p.patent_id = a.patent_id
        WHERE p.patent_date IS NOT NULL
          AND a.filing_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND CAST(a.filing_date AS DATE) > DATE '1975-01-01'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND (CAST(p.patent_date AS DATE) - CAST(a.filing_date AS DATE)) BETWEEN 0 AND 10000
    )
    SELECT
        grant_year AS year,
        ROUND(AVG(lag_days), 1) AS avg_lag_days,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lag_days) AS median_lag_days,
        COUNT(*) AS count
    FROM lags
    GROUP BY grant_year
    ORDER BY grant_year
""", f"{OUT}/grant_lag.json")

# ── e) Hero stats ─────────────────────────────────────────────────────────────
timed_msg("hero_stats: summary statistics")
result = con.execute(f"""
    WITH yearly AS (
        SELECT
            YEAR(CAST(patent_date AS DATE)) AS year,
            COUNT(*) AS cnt
        FROM {PATENT_TSV()}
        WHERE patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY year
    )
    SELECT
        SUM(cnt) AS total_patents,
        MIN(year) AS first_year,
        MAX(year) AS last_year,
        (SELECT year FROM yearly ORDER BY cnt DESC LIMIT 1) AS peak_year,
        MAX(cnt) AS peak_year_count
    FROM yearly
""").fetchdf().to_dict(orient="records")[0]
save_json(result, f"{OUT}/hero_stats.json")

con.close()
print("\n=== Chapter 1 complete ===\n")
