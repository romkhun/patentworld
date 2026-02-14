#!/usr/bin/env python3
"""
Inventor Movement – Geographic mobility of inventors over time.

Identifies inventors who have patented from multiple states or countries
and computes migration flows between locations.

Generates:
  - inventor_state_flows.json   — state-to-state migration flows (top flows)
  - inventor_country_flows.json — country-to-country migration flows (top flows)
  - inventor_mobility_trend.json — mobility rate over time
"""
import duckdb
from config import (
    PATENT_TSV, INVENTOR_TSV, LOCATION_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter4"
con = duckdb.connect()

# ── a) State-to-state flows ─────────────────────────────────────────────────
timed_msg("inventor_state_flows: migration between US states")

query_to_json(con, f"""
    WITH inventor_locations AS (
        SELECT
            i.inventor_id,
            l.disambig_state AS state,
            l.disambig_country AS country,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            p.patent_date
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND l.disambig_country = 'US'
          AND l.disambig_state IS NOT NULL
          AND l.disambig_state != ''
    ),
    inventor_state_seq AS (
        SELECT
            inventor_id,
            state,
            year,
            LAG(state) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_state,
            LAG(year) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_year
        FROM inventor_locations
    ),
    migrations AS (
        SELECT
            prev_state AS from_state,
            state AS to_state,
            COUNT(*) AS flow_count
        FROM inventor_state_seq
        WHERE prev_state IS NOT NULL
          AND prev_state != state
        GROUP BY prev_state, state
    )
    SELECT from_state, to_state, flow_count
    FROM migrations
    ORDER BY flow_count DESC
    LIMIT 200
""", f"{OUT}/inventor_state_flows.json")

# ── b) Country-to-country flows ─────────────────────────────────────────────
timed_msg("inventor_country_flows: international inventor migration")

query_to_json(con, f"""
    WITH inventor_locations AS (
        SELECT
            i.inventor_id,
            l.disambig_country AS country,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            p.patent_date
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND l.disambig_country IS NOT NULL
          AND l.disambig_country != ''
    ),
    inventor_country_seq AS (
        SELECT
            inventor_id,
            country,
            year,
            LAG(country) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_country,
            LAG(year) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_year
        FROM inventor_locations
    ),
    migrations AS (
        SELECT
            prev_country AS from_country,
            country AS to_country,
            COUNT(*) AS flow_count
        FROM inventor_country_seq
        WHERE prev_country IS NOT NULL
          AND prev_country != country
        GROUP BY prev_country, country
    )
    SELECT from_country, to_country, flow_count
    FROM migrations
    ORDER BY flow_count DESC
    LIMIT 200
""", f"{OUT}/inventor_country_flows.json")

# ── c) Mobility rate over time ───────────────────────────────────────────────
timed_msg("inventor_mobility_trend: mobility rate by year")

query_to_json(con, f"""
    WITH inventor_locations AS (
        SELECT
            i.inventor_id,
            l.disambig_state AS state,
            l.disambig_country AS country,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            p.patent_date
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND l.disambig_country IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1980 AND 2025
    ),
    inventor_seq AS (
        SELECT
            inventor_id,
            country,
            state,
            year,
            LAG(country) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_country,
            LAG(state) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_state
        FROM inventor_locations
    ),
    by_year AS (
        SELECT
            year,
            COUNT(*) AS total_patents_with_prev,
            SUM(CASE WHEN prev_country != country THEN 1 ELSE 0 END) AS intl_moves,
            SUM(CASE WHEN prev_country = country AND country = 'US' AND prev_state IS NOT NULL AND prev_state != state THEN 1 ELSE 0 END) AS domestic_moves
        FROM inventor_seq
        WHERE prev_country IS NOT NULL
        GROUP BY year
    )
    SELECT
        year,
        total_patents_with_prev,
        intl_moves,
        domestic_moves,
        ROUND(100.0 * intl_moves / total_patents_with_prev, 3) AS intl_mobility_pct,
        ROUND(100.0 * domestic_moves / total_patents_with_prev, 3) AS domestic_mobility_pct
    FROM by_year
    ORDER BY year
""", f"{OUT}/inventor_mobility_trend.json")

con.close()
print("\n=== Inventor Movement complete ===\n")
