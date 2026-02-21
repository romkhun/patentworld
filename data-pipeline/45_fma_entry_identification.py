#!/usr/bin/env python3
"""
First-Mover Advantage — Entry Identification (Foundation)
Generates: fma/entry_order.json, fma/qualifying_subclasses.json, fma/first_movers.json, fma/dominant_players.json
"""
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV, CPC_TITLE_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/fma"
con = duckdb.connect()

# ── a) Build base table: patent × assignee × CPC subclass ────────────────────
timed_msg("Building base table: patent × primary assignee × primary CPC subclass")
con.execute(f"""
    CREATE OR REPLACE TEMP TABLE patent_assignee_cpc AS
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS grant_year,
        a.disambig_assignee_organization AS organization,
        c.cpc_section,
        c.cpc_subclass
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a
        ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c
        ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
      AND c.cpc_subclass IS NOT NULL
""")
rows = con.execute("SELECT COUNT(*) FROM patent_assignee_cpc").fetchone()[0]
print(f"  Base table: {rows:,} rows")

# ── b) Identify qualifying subclasses (≥500 patents) ─────────────────────────
timed_msg("Identifying qualifying CPC subclasses (≥500 total patents)")
con.execute("""
    CREATE OR REPLACE TEMP TABLE qualifying_subclasses AS
    SELECT
        cpc_subclass,
        cpc_section,
        COUNT(*) AS total_patents,
        MIN(grant_year) AS first_year,
        MAX(grant_year) AS last_year,
        COUNT(DISTINCT organization) AS num_assignees
    FROM patent_assignee_cpc
    GROUP BY cpc_subclass, cpc_section
    HAVING COUNT(*) >= 500
""")
n_sub = con.execute("SELECT COUNT(*) FROM qualifying_subclasses").fetchone()[0]
print(f"  {n_sub} qualifying subclasses")

query_to_json(con, """
    SELECT cpc_subclass, cpc_section, total_patents, first_year, last_year, num_assignees
    FROM qualifying_subclasses
    ORDER BY total_patents DESC
""", f"{OUT}/qualifying_subclasses.json")

# ── c) Entry order: each assignee's first patent year per subclass ───────────
timed_msg("Computing entry order per (assignee × subclass)")
con.execute("""
    CREATE OR REPLACE TEMP TABLE entry_order AS
    SELECT
        pac.organization,
        pac.cpc_subclass,
        pac.cpc_section,
        MIN(pac.grant_year) AS entry_year,
        COUNT(*) AS total_patents,
        SUM(CASE WHEN pac.grant_year <= MIN(pac.grant_year) + 4 THEN 1 ELSE 0 END) AS patents_first_5yr
    FROM patent_assignee_cpc pac
    JOIN qualifying_subclasses qs ON pac.cpc_subclass = qs.cpc_subclass
    GROUP BY pac.organization, pac.cpc_subclass, pac.cpc_section
""")
n_entries = con.execute("SELECT COUNT(*) FROM entry_order").fetchone()[0]
print(f"  {n_entries:,} (assignee × subclass) entries")

# ── d) Identify first movers (earliest entrant with ≥3 patents in first 5 yrs)
timed_msg("Identifying first movers per subclass")
con.execute("""
    CREATE OR REPLACE TEMP TABLE first_movers AS
    WITH ranked AS (
        SELECT
            organization,
            cpc_subclass,
            cpc_section,
            entry_year,
            total_patents,
            patents_first_5yr,
            ROW_NUMBER() OVER (
                PARTITION BY cpc_subclass
                ORDER BY entry_year ASC, total_patents DESC
            ) AS rn
        FROM entry_order
        WHERE patents_first_5yr >= 3
    )
    SELECT organization, cpc_subclass, cpc_section, entry_year,
           total_patents, patents_first_5yr
    FROM ranked WHERE rn = 1
""")
n_fm = con.execute("SELECT COUNT(*) FROM first_movers").fetchone()[0]
print(f"  {n_fm} subclasses with identified first movers")

query_to_json(con, """
    SELECT organization AS first_mover, cpc_subclass, cpc_section,
           entry_year AS fm_entry_year, total_patents AS fm_total_patents,
           patents_first_5yr AS fm_patents_first_5yr
    FROM first_movers
    ORDER BY cpc_subclass
""", f"{OUT}/first_movers.json")

# ── e) Identify dominant players (most patents in 2015-2024) ──────────────────
timed_msg("Identifying dominant players per subclass (2015-2024)")
con.execute("""
    CREATE OR REPLACE TEMP TABLE dominant_players AS
    WITH recent AS (
        SELECT
            pac.organization,
            pac.cpc_subclass,
            pac.cpc_section,
            COUNT(*) AS recent_patents
        FROM patent_assignee_cpc pac
        JOIN qualifying_subclasses qs ON pac.cpc_subclass = qs.cpc_subclass
        WHERE pac.grant_year BETWEEN 2015 AND 2024
        GROUP BY pac.organization, pac.cpc_subclass, pac.cpc_section
    ),
    ranked AS (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY cpc_subclass ORDER BY recent_patents DESC) AS rn
        FROM recent
    )
    SELECT organization, cpc_subclass, cpc_section, recent_patents
    FROM ranked WHERE rn = 1
""")
n_dp = con.execute("SELECT COUNT(*) FROM dominant_players").fetchone()[0]
print(f"  {n_dp} subclasses with identified dominant players")

query_to_json(con, """
    SELECT organization AS dominant_player, cpc_subclass, cpc_section,
           recent_patents AS dp_recent_patents
    FROM dominant_players
    ORDER BY cpc_subclass
""", f"{OUT}/dominant_players.json")

# ── f) Combined: first mover vs dominant player per subclass ──────────────────
timed_msg("Combining first mover + dominant player per subclass")
query_to_json(con, """
    SELECT
        fm.cpc_subclass,
        fm.cpc_section,
        qs.total_patents,
        fm.organization AS first_mover,
        fm.entry_year AS fm_entry_year,
        fm.total_patents AS fm_total_patents,
        dp.organization AS dominant_player,
        dp.recent_patents AS dp_recent_patents,
        CASE WHEN fm.organization = dp.organization THEN 1 ELSE 0 END AS is_match
    FROM first_movers fm
    JOIN dominant_players dp ON fm.cpc_subclass = dp.cpc_subclass
    JOIN qualifying_subclasses qs ON fm.cpc_subclass = qs.cpc_subclass
    ORDER BY qs.total_patents DESC
""", f"{OUT}/fm_vs_dp.json")

# ── g) Entry order with percentile for Analysis 5 ────────────────────────────
timed_msg("Computing entry percentiles per subclass")
query_to_json(con, """
    WITH subclass_entry AS (
        SELECT
            organization,
            cpc_subclass,
            cpc_section,
            entry_year,
            total_patents,
            ROW_NUMBER() OVER (PARTITION BY cpc_subclass ORDER BY entry_year ASC, total_patents DESC) AS entry_rank,
            COUNT(*) OVER (PARTITION BY cpc_subclass) AS total_entrants
        FROM entry_order
    )
    SELECT
        organization,
        cpc_subclass,
        cpc_section,
        entry_year,
        total_patents,
        entry_rank,
        total_entrants,
        ROUND(100.0 * (entry_rank - 1) / GREATEST(total_entrants - 1, 1), 1) AS entry_percentile
    FROM subclass_entry
    ORDER BY cpc_subclass, entry_rank
""", f"{OUT}/entry_order.json")

# ── h) Summary stats ─────────────────────────────────────────────────────────
timed_msg("Computing summary statistics")
stats = con.execute("""
    SELECT
        COUNT(*) AS qualifying_subclasses,
        (SELECT COUNT(*) FROM first_movers) AS subclasses_with_first_mover,
        (SELECT COUNT(*) FROM dominant_players) AS subclasses_with_dominant,
        (SELECT COUNT(*) FROM first_movers fm
         JOIN dominant_players dp ON fm.cpc_subclass = dp.cpc_subclass
         WHERE fm.organization = dp.organization) AS match_count,
        (SELECT ROUND(100.0 * COUNT(*) / (
            SELECT COUNT(*) FROM first_movers fm2
            JOIN dominant_players dp2 ON fm2.cpc_subclass = dp2.cpc_subclass
        ), 1) FROM first_movers fm
         JOIN dominant_players dp ON fm.cpc_subclass = dp.cpc_subclass
         WHERE fm.organization = dp.organization) AS match_rate_pct
    FROM qualifying_subclasses
""").fetchdf().to_dict(orient="records")[0]

# Clean values
cleaned_stats = {}
import numpy as np
for k, v in stats.items():
    if hasattr(v, 'item'):
        cleaned_stats[k] = v.item()
    else:
        cleaned_stats[k] = v

save_json(cleaned_stats, f"{OUT}/fma_summary_stats.json")
print(f"  Match rate: {cleaned_stats['match_rate_pct']}%")

con.close()
print("\n=== FMA Entry Identification complete ===\n")
