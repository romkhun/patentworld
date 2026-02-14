#!/usr/bin/env python3
"""
Chapter 5 – The Inventors
Generates: team_size_per_year, gender_per_year, gender_by_sector,
           prolific_inventors, inventor_entry
"""
import duckdb
from config import (
    PATENT_TSV, INVENTOR_TSV, WIPO_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()

# ── a) Team size per year ────────────────────────────────────────────────────
timed_msg("team_size_per_year: avg/median team size, solo %, large team %")
query_to_json(con, f"""
    WITH team AS (
        SELECT
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            COUNT(*) AS team_size
        FROM {PATENT_TSV()} p
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY p.patent_id, year
    )
    SELECT
        year,
        ROUND(AVG(team_size), 2) AS avg_team_size,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY team_size) AS median_team_size,
        ROUND(100.0 * SUM(CASE WHEN team_size = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS solo_pct,
        ROUND(100.0 * SUM(CASE WHEN team_size >= 5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS large_team_pct,
        COUNT(*) AS total_patents
    FROM team
    GROUP BY year
    ORDER BY year
""", f"{OUT}/team_size_per_year.json")

# ── b) Gender per year ──────────────────────────────────────────────────────
timed_msg("gender_per_year: male and female inventor counts by year")
query_to_json(con, f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        i.gender_code AS gender,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND i.gender_code IN ('M', 'F')
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year, gender
    ORDER BY year, gender
""", f"{OUT}/gender_per_year.json")

# ── c) Gender by WIPO sector ────────────────────────────────────────────────
timed_msg("gender_by_sector: gender breakdown by WIPO sector")
query_to_json(con, f"""
    SELECT
        w.wipo_sector_title AS sector,
        i.gender_code AS gender,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
    JOIN {WIPO_TSV()} w ON p.patent_id = w.patent_id AND w.wipo_field_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND i.gender_code IN ('M', 'F')
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY sector, gender
    ORDER BY sector, gender
""", f"{OUT}/gender_by_sector.json")

# ── d) Prolific inventors ───────────────────────────────────────────────────
timed_msg("prolific_inventors: top 100 inventors by patent count")
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
    LIMIT 100
""", f"{OUT}/prolific_inventors.json")

# ── e) Inventor entry (new inventors per year) ──────────────────────────────
timed_msg("inventor_entry: new inventors per year (first patent year)")
query_to_json(con, f"""
    WITH first_patent AS (
        SELECT
            i.inventor_id,
            MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year
        FROM {PATENT_TSV()} p
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        WHERE p.patent_date IS NOT NULL
          AND p.patent_type = 'utility'
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY i.inventor_id
    )
    SELECT
        first_year AS year,
        COUNT(*) AS new_inventors
    FROM first_patent
    GROUP BY first_year
    ORDER BY first_year
""", f"{OUT}/inventor_entry.json")

con.close()
print("\n=== Chapter 5 complete ===\n")
