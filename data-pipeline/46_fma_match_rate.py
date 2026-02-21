#!/usr/bin/env python3
"""
First-Mover Advantage — Analysis 1: Match Rate
How often does the pioneer become the eventual dominant player?
Generates: fma/match_rate_by_section.json, fma/match_rate_by_decade.json, fma/sankey_selected.json
"""
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV,
    OUTPUT_DIR, query_to_json, save_json, timed_msg, CPC_SECTION_NAMES,
)

OUT = f"{OUTPUT_DIR}/fma"
con = duckdb.connect()

# ── Rebuild base tables (self-contained) ──────────────────────────────────────
timed_msg("Rebuilding base tables for match rate analysis")
con.execute(f"""
    CREATE OR REPLACE TEMP TABLE patent_assignee_cpc AS
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS grant_year,
        a.disambig_assignee_organization AS organization,
        c.cpc_section,
        c.cpc_subclass
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_date IS NOT NULL
      AND p.patent_type = 'utility'
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
      AND c.cpc_subclass IS NOT NULL
""")

con.execute("""
    CREATE OR REPLACE TEMP TABLE qualifying_subclasses AS
    SELECT cpc_subclass, cpc_section, COUNT(*) AS total_patents,
           MIN(grant_year) AS first_year
    FROM patent_assignee_cpc
    GROUP BY cpc_subclass, cpc_section
    HAVING COUNT(*) >= 500
""")

con.execute("""
    CREATE OR REPLACE TEMP TABLE entry_order AS
    SELECT
        organization, cpc_subclass, cpc_section,
        MIN(grant_year) AS entry_year,
        COUNT(*) AS total_patents,
        SUM(CASE WHEN grant_year <= MIN(grant_year) + 4 THEN 1 ELSE 0 END) AS patents_first_5yr
    FROM patent_assignee_cpc pac
    JOIN qualifying_subclasses qs ON pac.cpc_subclass = qs.cpc_subclass
    GROUP BY organization, cpc_subclass, cpc_section
""")

con.execute("""
    CREATE OR REPLACE TEMP TABLE first_movers AS
    WITH ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY cpc_subclass ORDER BY entry_year ASC, total_patents DESC) AS rn
        FROM entry_order WHERE patents_first_5yr >= 3
    )
    SELECT organization, cpc_subclass, cpc_section, entry_year, total_patents
    FROM ranked WHERE rn = 1
""")

con.execute("""
    CREATE OR REPLACE TEMP TABLE dominant_players AS
    WITH recent AS (
        SELECT organization, cpc_subclass, cpc_section, COUNT(*) AS recent_patents
        FROM patent_assignee_cpc pac
        JOIN qualifying_subclasses qs ON pac.cpc_subclass = qs.cpc_subclass
        WHERE grant_year BETWEEN 2015 AND 2024
        GROUP BY organization, cpc_subclass, cpc_section
    ),
    ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY cpc_subclass ORDER BY recent_patents DESC) AS rn
        FROM recent
    )
    SELECT organization, cpc_subclass, cpc_section, recent_patents
    FROM ranked WHERE rn = 1
""")

# ── 1b: Match rate by CPC section ────────────────────────────────────────────
timed_msg("Match rate by CPC section")
query_to_json(con, """
    SELECT
        fm.cpc_section AS section,
        COUNT(*) AS total_subclasses,
        SUM(CASE WHEN fm.organization = dp.organization THEN 1 ELSE 0 END) AS match_count,
        ROUND(100.0 * SUM(CASE WHEN fm.organization = dp.organization THEN 1 ELSE 0 END)
              / COUNT(*), 1) AS match_rate_pct
    FROM first_movers fm
    JOIN dominant_players dp ON fm.cpc_subclass = dp.cpc_subclass
    GROUP BY fm.cpc_section
    ORDER BY match_rate_pct DESC
""", f"{OUT}/match_rate_by_section.json")

# ── 1c: Match rate by emergence decade ────────────────────────────────────────
timed_msg("Match rate by emergence decade")
query_to_json(con, """
    WITH subclass_decade AS (
        SELECT
            qs.cpc_subclass,
            CASE
                WHEN qs.first_year BETWEEN 1976 AND 1985 THEN '1976-1985'
                WHEN qs.first_year BETWEEN 1986 AND 1995 THEN '1986-1995'
                WHEN qs.first_year BETWEEN 1996 AND 2005 THEN '1996-2005'
                WHEN qs.first_year BETWEEN 2006 AND 2015 THEN '2006-2015'
                ELSE '2016-2025'
            END AS emergence_decade
        FROM qualifying_subclasses qs
    )
    SELECT
        sd.emergence_decade,
        COUNT(*) AS total_subclasses,
        SUM(CASE WHEN fm.organization = dp.organization THEN 1 ELSE 0 END) AS match_count,
        ROUND(100.0 * SUM(CASE WHEN fm.organization = dp.organization THEN 1 ELSE 0 END)
              / COUNT(*), 1) AS match_rate_pct
    FROM first_movers fm
    JOIN dominant_players dp ON fm.cpc_subclass = dp.cpc_subclass
    JOIN subclass_decade sd ON fm.cpc_subclass = sd.cpc_subclass
    GROUP BY sd.emergence_decade
    ORDER BY sd.emergence_decade
""", f"{OUT}/match_rate_by_decade.json")

# ── 1a: Sankey data for selected subclasses ───────────────────────────────────
timed_msg("Sankey diagram data: 20 selected subclasses")
sankey_data = con.execute("""
    SELECT
        fm.cpc_subclass,
        fm.cpc_section,
        qs.total_patents,
        fm.organization AS first_mover,
        dp.organization AS dominant_player,
        CASE WHEN fm.organization = dp.organization THEN 1 ELSE 0 END AS is_match
    FROM first_movers fm
    JOIN dominant_players dp ON fm.cpc_subclass = dp.cpc_subclass
    JOIN qualifying_subclasses qs ON fm.cpc_subclass = qs.cpc_subclass
    ORDER BY qs.total_patents DESC
    LIMIT 30
""").fetchdf()

# Build Sankey nodes and links
records = sankey_data.to_dict(orient="records")
# Collect unique firms for left (first_mover) and right (dominant_player)
left_firms = list(dict.fromkeys(r['first_mover'] for r in records))
right_firms = list(dict.fromkeys(r['dominant_player'] for r in records))

# Build node list: left firms first, then right firms (prefixed to avoid collisions)
nodes = []
node_index = {}
for f in left_firms:
    key = f"fm:{f}"
    node_index[key] = len(nodes)
    nodes.append({"name": f, "side": "first_mover"})
for f in right_firms:
    key = f"dp:{f}"
    node_index[key] = len(nodes)
    nodes.append({"name": f, "side": "dominant_player"})

links = []
for r in records:
    src = node_index[f"fm:{r['first_mover']}"]
    tgt = node_index[f"dp:{r['dominant_player']}"]
    links.append({
        "source": src,
        "target": tgt,
        "value": r['total_patents'],
        "subclass": r['cpc_subclass'],
        "section": r['cpc_section'],
        "is_match": r['is_match'],
    })

save_json({"nodes": nodes, "links": links, "subclasses": records},
          f"{OUT}/sankey_selected.json")

con.close()
print("\n=== FMA Match Rate (Analysis 1) complete ===\n")
