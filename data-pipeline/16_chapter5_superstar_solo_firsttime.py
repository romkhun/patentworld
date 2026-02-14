#!/usr/bin/env python3
"""
Analyses #4, #17, #18 – Superstar Inventor Concentration, Solo Inventors, First-Time Inventors
All added to The Inventors chapter.

Outputs:
  - chapter5/superstar_concentration.json   — top 1%/5% inventor share by year
  - chapter5/solo_inventors.json            — solo inventor share over time + tech areas
  - chapter5/first_time_inventors.json      — share of patents with debut inventors
"""
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, INVENTOR_TSV,
    OUTPUT_DIR, query_to_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()

# ── #4: Superstar Inventor Concentration ─────────────────────────────────────
timed_msg("superstar_concentration: top 1%/5% inventor patent share by year")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    inventor_patents AS (
        SELECT i.inventor_id, py.year, COUNT(DISTINCT py.patent_id) AS patents_this_year
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        GROUP BY i.inventor_id, py.year
    ),
    inventor_cumulative AS (
        SELECT inventor_id, year,
               SUM(patents_this_year) OVER (PARTITION BY inventor_id ORDER BY year) AS cum_patents
        FROM inventor_patents
    ),
    -- For each year, rank inventors by cumulative patents
    ranked AS (
        SELECT year, inventor_id, cum_patents,
               PERCENT_RANK() OVER (PARTITION BY year ORDER BY cum_patents ASC) AS pct_rank
        FROM inventor_cumulative
    ),
    year_totals AS (
        SELECT py.year, COUNT(DISTINCT py.patent_id) AS total_patents
        FROM patent_year py
        GROUP BY py.year
    ),
    -- Patents by top-tier inventors each year (join back to get patent_id)
    tier_patents AS (
        SELECT r.year, r.inventor_id, r.pct_rank, i.patent_id
        FROM ranked r
        JOIN {INVENTOR_TSV()} i ON r.inventor_id = i.inventor_id
        JOIN patent_year py ON i.patent_id = py.patent_id AND py.year = r.year
    )
    SELECT
        tp.year,
        yt.total_patents,
        COUNT(DISTINCT CASE WHEN tp.pct_rank >= 0.99 THEN tp.patent_id END) AS top1pct_patents,
        COUNT(DISTINCT CASE WHEN tp.pct_rank >= 0.95 THEN tp.patent_id END) AS top5pct_patents,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN tp.pct_rank >= 0.99 THEN tp.patent_id END) / yt.total_patents, 2) AS top1pct_share,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN tp.pct_rank >= 0.95 THEN tp.patent_id END) / yt.total_patents, 2) AS top5pct_share,
        ROUND(100.0 * (yt.total_patents - COUNT(DISTINCT CASE WHEN tp.pct_rank >= 0.95 THEN tp.patent_id END)) / yt.total_patents, 2) AS remaining_share
    FROM tier_patents tp
    JOIN year_totals yt ON tp.year = yt.year
    GROUP BY tp.year, yt.total_patents
    ORDER BY tp.year
""", f"{OUT}/superstar_concentration.json")

# ── #17: Solo Inventors ──────────────────────────────────────────────────────
timed_msg("solo_inventors: solo inventor trends over time")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    team_size AS (
        SELECT i.patent_id, COUNT(DISTINCT i.inventor_id) AS num_inventors
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        GROUP BY i.patent_id
    ),
    yearly AS (
        SELECT
            py.year,
            COUNT(*) AS total_patents,
            SUM(CASE WHEN ts.num_inventors = 1 THEN 1 ELSE 0 END) AS solo_patents,
            ROUND(100.0 * SUM(CASE WHEN ts.num_inventors = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS solo_pct
        FROM patent_year py
        JOIN team_size ts ON py.patent_id = ts.patent_id
        GROUP BY py.year
    )
    SELECT * FROM yearly ORDER BY year
""", f"{OUT}/solo_inventors.json")

# Solo inventor top tech areas (most recent period)
timed_msg("solo_inventors_by_section: solo vs team patents by CPC section")

query_to_json(con, f"""
    WITH patent_recent AS (
        SELECT patent_id
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 2015 AND 2025
    ),
    team_size AS (
        SELECT i.patent_id, COUNT(DISTINCT i.inventor_id) AS num_inventors
        FROM {INVENTOR_TSV()} i
        JOIN patent_recent pr ON i.patent_id = pr.patent_id
        GROUP BY i.patent_id
    ),
    with_section AS (
        SELECT DISTINCT ts.patent_id, ts.num_inventors,
               LEFT(cpc.cpc_section, 1) AS section
        FROM team_size ts
        JOIN {CPC_CURRENT_TSV()} cpc ON ts.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE LEFT(cpc.cpc_section, 1) != 'Y'
    )
    SELECT
        section,
        SUM(CASE WHEN num_inventors = 1 THEN 1 ELSE 0 END) AS solo_count,
        SUM(CASE WHEN num_inventors > 1 THEN 1 ELSE 0 END) AS team_count,
        ROUND(100.0 * SUM(CASE WHEN num_inventors = 1 THEN 1 ELSE 0 END) /
              (SUM(CASE WHEN num_inventors = 1 THEN 1 ELSE 0 END) + SUM(CASE WHEN num_inventors > 1 THEN 1 ELSE 0 END)), 2) AS solo_pct
    FROM with_section
    GROUP BY section
    ORDER BY section
""", f"{OUT}/solo_inventors_by_section.json")

# ── #18: First-Time Inventors ────────────────────────────────────────────────
timed_msg("first_time_inventors: share with debut inventors by year")

query_to_json(con, f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility'
          AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    inventor_first_year AS (
        SELECT i.inventor_id, MIN(py.year) AS debut_year
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        GROUP BY i.inventor_id
    ),
    patent_has_debut AS (
        SELECT py.patent_id, py.year,
               MAX(CASE WHEN ify.debut_year = py.year THEN 1 ELSE 0 END) AS has_debut_inventor
        FROM patent_year py
        JOIN {INVENTOR_TSV()} i ON py.patent_id = i.patent_id
        JOIN inventor_first_year ify ON i.inventor_id = ify.inventor_id
        GROUP BY py.patent_id, py.year
    )
    SELECT
        year,
        COUNT(*) AS total_patents,
        SUM(has_debut_inventor) AS patents_with_debut,
        ROUND(100.0 * SUM(has_debut_inventor) / COUNT(*), 2) AS debut_pct
    FROM patent_has_debut
    GROUP BY year
    ORDER BY year
""", f"{OUT}/first_time_inventors.json")

con.close()
print("\n=== Superstar/Solo/First-Time Inventor analyses complete ===\n")
