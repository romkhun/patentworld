#!/usr/bin/env python3
"""
Chapter 5 Deep – Inventor-level analyses
Generates: inventor_collaboration_network, inventor_longevity, star_inventor_impact
"""
import duckdb
import numpy as np
from config import (
    PATENT_TSV, INVENTOR_TSV, CITATION_TSV, OUTPUT_DIR,
    query_to_json, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()

# ── a) Inventor collaboration network ────────────────────────────────────────
timed_msg("inventor_collaboration_network: ALL inventors with co-invention ties")

# Find ALL co-invention edges (no top-N limit).
# Optimization: first identify patents with 2+ inventors, then self-join only those.
EDGE_THRESHOLD = 200
edges_df = con.execute(f"""
    WITH multi_inv AS (
        SELECT patent_id
        FROM {INVENTOR_TSV()}
        GROUP BY patent_id
        HAVING COUNT(DISTINCT inventor_id) >= 2
    ),
    filtered AS (
        SELECT i.patent_id, i.inventor_id
        FROM {INVENTOR_TSV()} i
        JOIN multi_inv m ON i.patent_id = m.patent_id
    )
    SELECT
        f1.inventor_id AS source,
        f2.inventor_id AS target,
        COUNT(DISTINCT f1.patent_id) AS weight
    FROM filtered f1
    JOIN filtered f2
      ON f1.patent_id = f2.patent_id AND f1.inventor_id < f2.inventor_id
    GROUP BY source, target
    HAVING weight >= {EDGE_THRESHOLD}
    ORDER BY weight DESC
""").fetchdf()
print(f"  Found {len(edges_df)} edges with weight >= {EDGE_THRESHOLD}")

# Get names and patent counts for all inventors that appear in edges
connected_ids = set(edges_df['source'].tolist() + edges_df['target'].tolist())
print(f"  {len(connected_ids)} unique inventors in network")

con.execute("CREATE TEMPORARY TABLE net_inventors AS SELECT unnest($1::VARCHAR[]) AS inventor_id", [list(connected_ids)])
node_df = con.execute(f"""
    SELECT
        i.inventor_id,
        MAX(i.disambig_inventor_name_first || ' ' || i.disambig_inventor_name_last) AS name,
        COUNT(DISTINCT p.patent_id) AS patents
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
    WHERE i.inventor_id IN (SELECT inventor_id FROM net_inventors)
      AND p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY i.inventor_id
""").fetchdf()

nodes = [
    {"id": row['inventor_id'], "name": row['name'].strip(), "patents": int(row['patents'])}
    for _, row in node_df.iterrows()
]
edges = [
    {"source": row['source'], "target": row['target'], "weight": int(row['weight'])}
    for _, row in edges_df.iterrows()
]
save_json({"nodes": nodes, "edges": edges}, f"{OUT}/inventor_collaboration_network.json")

# ── b) Inventor longevity (survival curves) ──────────────────────────────────
timed_msg("inventor_longevity: career survival curves by entry cohort")

longevity_df = con.execute(f"""
    SELECT
        i.inventor_id,
        MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year,
        MAX(YEAR(CAST(p.patent_date AS DATE))) AS last_year
    FROM {PATENT_TSV()} p
    JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY i.inventor_id
""").fetchdf()

longevity_df['career_length'] = longevity_df['last_year'] - longevity_df['first_year']

# Create 5-year cohorts from 1976-1980 through 2011-2015
cohort_records = []
for cohort_start in range(1976, 2016, 5):
    cohort_end = cohort_start + 4
    cohort_label = f"{cohort_start}-{cohort_end}"
    cohort_inventors = longevity_df[
        (longevity_df['first_year'] >= cohort_start) &
        (longevity_df['first_year'] <= cohort_end)
    ]
    total = len(cohort_inventors)
    if total == 0:
        continue
    # Max possible career from this cohort (to 2025)
    max_career = 2025 - cohort_start
    for cl in range(0, min(max_career + 1, 46)):
        survived = (cohort_inventors['career_length'] >= cl).sum()
        cohort_records.append({
            "cohort": cohort_label,
            "career_length": cl,
            "survival_pct": round(100.0 * survived / total, 2),
        })

save_json(cohort_records, f"{OUT}/inventor_longevity.json")
print(f"  {len(cohort_records)} rows")

# ── c) Star inventor impact ──────────────────────────────────────────────────
timed_msg("star_inventor_impact: forward citations for top 200 prolific inventors")
query_to_json(con, f"""
    WITH inv_patents AS (
        SELECT
            i.inventor_id,
            MAX(i.disambig_inventor_name_first) AS first_name,
            MAX(i.disambig_inventor_name_last) AS last_name,
            p.patent_id
        FROM {PATENT_TSV()} p
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2020
        GROUP BY i.inventor_id, p.patent_id
    ),
    top_inv AS (
        SELECT inventor_id
        FROM inv_patents
        GROUP BY inventor_id
        ORDER BY COUNT(*) DESC
        LIMIT 200
    ),
    with_cites AS (
        SELECT
            ip.inventor_id,
            MAX(ip.first_name) AS first_name,
            MAX(ip.last_name) AS last_name,
            ip.patent_id,
            COUNT(c.citation_patent_id) AS fwd_citations
        FROM inv_patents ip
        JOIN top_inv t ON ip.inventor_id = t.inventor_id
        LEFT JOIN {CITATION_TSV()} c ON ip.patent_id = c.citation_patent_id
        GROUP BY ip.inventor_id, ip.patent_id
    )
    SELECT
        inventor_id,
        MAX(first_name) AS first_name,
        MAX(last_name) AS last_name,
        COUNT(*) AS total_patents,
        ROUND(AVG(fwd_citations), 2) AS avg_citations,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fwd_citations) AS median_citations,
        MAX(fwd_citations) AS max_citations
    FROM with_cites
    GROUP BY inventor_id
    ORDER BY avg_citations DESC
""", f"{OUT}/star_inventor_impact.json")

con.close()
print("\n=== Chapter 5 Deep complete ===\n")
