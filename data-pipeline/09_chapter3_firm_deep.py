#!/usr/bin/env python3
"""
Chapter 3 Deep – Firm-level analyses
Generates: firm_collaboration_network, firm_citation_impact, firm_tech_evolution
"""
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CITATION_TSV, CPC_CURRENT_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg, CPC_SECTION_NAMES,
)

OUT = f"{OUTPUT_DIR}/chapter3"
con = duckdb.connect()

# ── a) Firm collaboration network ────────────────────────────────────────────
timed_msg("firm_collaboration_network: ALL orgs with co-patenting ties")

# Find ALL co-patent edges (no top-N limit).
# Optimization: first identify patents with 2+ distinct org assignees,
# then self-join only those patents.
EDGE_THRESHOLD = 50
edges_df = con.execute(f"""
    WITH multi_org AS (
        SELECT patent_id
        FROM {ASSIGNEE_TSV()}
        WHERE disambig_assignee_organization IS NOT NULL
          AND TRIM(disambig_assignee_organization) != ''
        GROUP BY patent_id
        HAVING COUNT(DISTINCT disambig_assignee_organization) >= 2
    ),
    filtered AS (
        SELECT a.patent_id, a.disambig_assignee_organization AS org
        FROM {ASSIGNEE_TSV()} a
        JOIN multi_org m ON a.patent_id = m.patent_id
        WHERE a.disambig_assignee_organization IS NOT NULL
          AND TRIM(a.disambig_assignee_organization) != ''
    )
    SELECT
        f1.org AS source,
        f2.org AS target,
        COUNT(DISTINCT f1.patent_id) AS weight
    FROM filtered f1
    JOIN filtered f2
      ON f1.patent_id = f2.patent_id AND f1.org < f2.org
    GROUP BY source, target
    HAVING weight >= {EDGE_THRESHOLD}
    ORDER BY weight DESC
""").fetchdf()
print(f"  Found {len(edges_df)} edges with weight >= {EDGE_THRESHOLD}")

# Get patent counts for all orgs that appear in edges
connected_orgs = set(edges_df['source'].tolist() + edges_df['target'].tolist())
print(f"  {len(connected_orgs)} unique organizations in network")

con.execute("CREATE TEMPORARY TABLE net_orgs AS SELECT unnest($1::VARCHAR[]) AS org", [list(connected_orgs)])
node_df = con.execute(f"""
    SELECT disambig_assignee_organization AS org, COUNT(DISTINCT patent_id) AS patents
    FROM {ASSIGNEE_TSV()}
    WHERE disambig_assignee_organization IN (SELECT org FROM net_orgs)
    GROUP BY org
""").fetchdf()

nodes = [
    {"id": row['org'], "name": row['org'], "patents": int(row['patents'])}
    for _, row in node_df.iterrows()
]
edges = [
    {"source": row['source'], "target": row['target'], "weight": int(row['weight'])}
    for _, row in edges_df.iterrows()
]
save_json({"nodes": nodes, "edges": edges}, f"{OUT}/firm_collaboration_network.json")

# ── b) Firm citation impact ──────────────────────────────────────────────────
timed_msg("firm_citation_impact: forward citations for top 30 firms")
query_to_json(con, f"""
    WITH firm_patents AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            p.patent_id
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND a.disambig_assignee_organization IS NOT NULL
          AND TRIM(a.disambig_assignee_organization) != ''
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2020
    ),
    top30 AS (
        SELECT organization
        FROM firm_patents
        GROUP BY organization
        ORDER BY COUNT(*) DESC
        LIMIT 30
    ),
    forward_cites AS (
        SELECT
            fp.organization,
            fp.patent_id,
            COUNT(c.citation_patent_id) AS fwd_citations
        FROM firm_patents fp
        JOIN top30 t ON fp.organization = t.organization
        LEFT JOIN {CITATION_TSV()} c ON fp.patent_id = c.citation_patent_id
        GROUP BY fp.organization, fp.patent_id
    )
    SELECT
        organization,
        COUNT(*) AS total_patents,
        ROUND(AVG(fwd_citations), 2) AS avg_citations_received,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fwd_citations) AS median_citations_received,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY fwd_citations) AS p90_citations_received
    FROM forward_cites
    GROUP BY organization
    ORDER BY avg_citations_received DESC
""", f"{OUT}/firm_citation_impact.json")

# ── c) Firm tech evolution ───────────────────────────────────────────────────
timed_msg("firm_tech_evolution: top 10 firms × 5-year periods × CPC sections")
query_to_json(con, f"""
    WITH top10 AS (
        SELECT disambig_assignee_organization AS organization
        FROM {ASSIGNEE_TSV()}
        WHERE disambig_assignee_organization IS NOT NULL
          AND TRIM(disambig_assignee_organization) != ''
        GROUP BY organization
        ORDER BY COUNT(DISTINCT patent_id) DESC
        LIMIT 10
    )
    SELECT
        a.disambig_assignee_organization AS organization,
        CAST(FLOOR((YEAR(CAST(p.patent_date AS DATE)) - 1976) / 5) * 5 + 1976 AS VARCHAR)
          || '-'
          || CAST(FLOOR((YEAR(CAST(p.patent_date AS DATE)) - 1976) / 5) * 5 + 1980 AS VARCHAR) AS period,
        SUBSTRING(c.cpc_group, 1, 1) AS section,
        COUNT(*) AS count
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND a.disambig_assignee_organization IN (SELECT organization FROM top10)
      AND SUBSTRING(c.cpc_group, 1, 1) != 'Y'
    GROUP BY organization, period, section
    ORDER BY organization, period, section
""", f"{OUT}/firm_tech_evolution.json")

con.close()
print("\n=== Chapter 3 Deep complete ===\n")
