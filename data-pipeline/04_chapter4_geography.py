#!/usr/bin/env python3
"""
Chapter 4 – The Geography of Innovation
Generates: us_states_per_year, us_states_summary, countries_per_year,
           top_cities, state_specialization
"""
import duckdb
from config import (
    PATENT_TSV, INVENTOR_TSV, LOCATION_TSV, CPC_CURRENT_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter4"
con = duckdb.connect()

# ── a) US states per year ────────────────────────────────────────────────────
timed_msg("us_states_per_year: patent counts by US state and year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        l.disambig_state AS state,
        COUNT(DISTINCT p.patent_id) AS count
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id AND i.inventor_sequence = 0
    JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND l.disambig_country = 'US'
      AND l.disambig_state IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, state
    ORDER BY year, state
""", f"{OUT}/us_states_per_year.json")

# ── b) US states summary ────────────────────────────────────────────────────
timed_msg("us_states_summary: total patents and unique inventors by state")
query_to_json(con, f"""
    SELECT
        l.disambig_state AS state,
        COUNT(DISTINCT p.patent_id) AS total_patents,
        COUNT(DISTINCT i.inventor_id) AS unique_inventors
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id AND i.inventor_sequence = 0
    JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND l.disambig_country = 'US'
      AND l.disambig_state IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY state
    ORDER BY total_patents DESC
""", f"{OUT}/us_states_summary.json")

# ── c) Countries per year ───────────────────────────────────────────────────
timed_msg("countries_per_year: patent counts by country and year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        l.disambig_country AS country,
        COUNT(DISTINCT p.patent_id) AS count
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id AND i.inventor_sequence = 0
    JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND l.disambig_country IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, country
    ORDER BY year, country
""", f"{OUT}/countries_per_year.json")

# ── d) Top 50 US cities ─────────────────────────────────────────────────────
timed_msg("top_cities: top 50 US cities by patent count")
query_to_json(con, f"""
    SELECT
        l.disambig_city AS city,
        l.disambig_state AS state,
        COUNT(DISTINCT p.patent_id) AS total_patents,
        ROUND(AVG(l.latitude), 4) AS lat,
        ROUND(AVG(l.longitude), 4) AS lng
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id AND i.inventor_sequence = 0
    JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND l.disambig_country = 'US'
      AND l.disambig_city IS NOT NULL
      AND l.disambig_state IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY city, state
    ORDER BY total_patents DESC
    LIMIT 50
""", f"{OUT}/top_cities.json")

# ── e) State specialization by CPC section ──────────────────────────────────
timed_msg("state_specialization: CPC section distribution per US state")
query_to_json(con, f"""
    SELECT
        l.disambig_state AS state,
        c.cpc_section AS section,
        COUNT(DISTINCT p.patent_id) AS count
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id AND i.inventor_sequence = 0
    JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND l.disambig_country = 'US'
      AND l.disambig_state IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY state, section
    ORDER BY state, section
""", f"{OUT}/state_specialization.json")

con.close()
print("\n=== Chapter 4 complete ===\n")
