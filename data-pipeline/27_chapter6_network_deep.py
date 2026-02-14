#!/usr/bin/env python3
"""
Analyses #7, #14 – Collaboration Network Temporal Evolution + Six Degrees
Compute network structure metrics by decade.

Outputs:
  - chapter3/network_metrics_by_decade.json — node/edge/degree/component metrics per decade
  - chapter3/bridge_inventors.json          — top betweenness centrality inventors (sampled)
"""
import duckdb
from config import (
    PATENT_TSV, INVENTOR_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

OUT_CH3 = f"{OUTPUT_DIR}/chapter3"
con = duckdb.connect()

# ── Network metrics by decade ────────────────────────────────────────────────
timed_msg("network_metrics: co-inventor/co-assignee network metrics per decade")

# Compute basic network statistics from co-invention edges per decade
# Full graph analysis is too expensive; compute summary statistics via SQL
metrics = con.execute(f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS yr
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    -- Co-inventor edges (undirected, within same patent)
    coinventor_edges AS (
        SELECT DISTINCT
            CAST(FLOOR(py.yr / 10) * 10 AS INTEGER) AS decade,
            LEAST(i1.inventor_id, i2.inventor_id) AS inv1,
            GREATEST(i1.inventor_id, i2.inventor_id) AS inv2
        FROM {INVENTOR_TSV()} i1
        JOIN {INVENTOR_TSV()} i2 ON i1.patent_id = i2.patent_id AND i1.inventor_id < i2.inventor_id
        JOIN patent_year py ON i1.patent_id = py.patent_id
    ),
    decade_edges AS (
        SELECT decade, COUNT(*) AS num_edges
        FROM coinventor_edges
        GROUP BY decade
    ),
    -- Active inventors per decade
    decade_nodes AS (
        SELECT CAST(FLOOR(py.yr / 10) * 10 AS INTEGER) AS decade,
               COUNT(DISTINCT i.inventor_id) AS num_nodes
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        GROUP BY decade
    ),
    -- Avg degree approximation: 2 * edges / nodes
    decade_patents AS (
        SELECT CAST(FLOOR(yr / 10) * 10 AS INTEGER) AS decade,
               COUNT(DISTINCT patent_id) AS num_patents
        FROM patent_year
        GROUP BY decade
    ),
    -- Avg team size per decade
    team_info AS (
        SELECT py.patent_id, CAST(FLOOR(py.yr / 10) * 10 AS INTEGER) AS decade,
               COUNT(DISTINCT i.inventor_id) AS team_size
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        GROUP BY py.patent_id, decade
    ),
    team_stats AS (
        SELECT decade, ROUND(AVG(team_size), 2) AS avg_team_size
        FROM team_info
        GROUP BY decade
    )
    SELECT
        dn.decade,
        CONCAT(CAST(dn.decade AS VARCHAR), 's') AS decade_label,
        dn.num_nodes,
        de.num_edges,
        dp.num_patents,
        ROUND(2.0 * de.num_edges / dn.num_nodes, 2) AS avg_degree,
        ts.avg_team_size
    FROM decade_nodes dn
    JOIN decade_edges de ON dn.decade = de.decade
    JOIN decade_patents dp ON dn.decade = dp.decade
    JOIN team_stats ts ON dn.decade = ts.decade
    WHERE dn.decade BETWEEN 1980 AND 2020
    ORDER BY dn.decade
""").fetchdf()

records = []
for _, row in metrics.iterrows():
    records.append({
        'decade': int(row['decade']),
        'decade_label': row['decade_label'],
        'num_nodes': int(row['num_nodes']),
        'num_edges': int(row['num_edges']),
        'num_patents': int(row['num_patents']),
        'avg_degree': float(row['avg_degree']),
        'avg_team_size': float(row['avg_team_size']),
    })

save_json(records, f"{OUT_CH3}/network_metrics_by_decade.json")

# ── Bridge inventors: most connected across organizations ────────────────────
timed_msg("bridge_inventors: inventors connecting most distinct organizations")

# Approximate bridge role: inventors with patents at many distinct organizations
bridge_data = con.execute(f"""
    WITH patent_year AS (
        SELECT patent_id, YEAR(CAST(patent_date AS DATE)) AS year
        FROM {PATENT_TSV()}
        WHERE patent_type = 'utility' AND patent_date IS NOT NULL
          AND YEAR(CAST(patent_date AS DATE)) BETWEEN 2000 AND 2025
    ),
    inv_orgs AS (
        SELECT i.inventor_id,
               i.disambig_inventor_name_first AS first_name,
               i.disambig_inventor_name_last AS last_name,
               a.disambig_assignee_organization AS org,
               COUNT(DISTINCT i.patent_id) AS patents_at_org
        FROM {INVENTOR_TSV()} i
        JOIN patent_year py ON i.patent_id = py.patent_id
        JOIN {ASSIGNEE_TSV()} a ON i.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND a.disambig_assignee_organization != ''
        GROUP BY i.inventor_id, i.disambig_inventor_name_first, i.disambig_inventor_name_last,
                 a.disambig_assignee_organization
    ),
    bridge_candidates AS (
        SELECT inventor_id, first_name, last_name,
               COUNT(DISTINCT org) AS num_orgs,
               SUM(patents_at_org) AS total_patents
        FROM inv_orgs
        GROUP BY inventor_id, first_name, last_name
        HAVING COUNT(DISTINCT org) >= 3 AND SUM(patents_at_org) >= 20
               AND COUNT(DISTINCT org) <= 30
    )
    SELECT * FROM bridge_candidates
    ORDER BY num_orgs DESC, total_patents DESC
    LIMIT 30
""").fetchdf()

bridge_records = []
for _, row in bridge_data.iterrows():
    bridge_records.append({
        'inventor_id': row['inventor_id'],
        'first_name': row['first_name'],
        'last_name': row['last_name'],
        'num_orgs': int(row['num_orgs']),
        'total_patents': int(row['total_patents']),
    })

save_json(bridge_records, f"{OUT_CH3}/bridge_inventors.json")

con.close()
print("\n=== Network Deep Analysis complete ===\n")
