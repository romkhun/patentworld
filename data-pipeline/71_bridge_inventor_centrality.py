#!/usr/bin/env python3
"""
71: Bridge Inventor Centrality — Section 13e (Partially Feasible)

Scope to top-5K most prolific inventors (full network too large for betweenness).
Build co-invention network among these inventors, compute degree centrality
(betweenness too expensive), then compare citation impact by centrality bin.

Output: public/data/chapter5/bridge_centrality.json
"""
import time
import duckdb
from config import INVENTOR_TSV, OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()
con.execute("SET threads TO 38")

timed_msg("Step 1: Find top-5K most prolific inventors")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE top_inventors AS
    SELECT inventor_id, COUNT(DISTINCT patent_id) AS patent_count
    FROM {INVENTOR_TSV()}
    GROUP BY inventor_id
    ORDER BY patent_count DESC
    LIMIT 5000
""")
print(f"  Top 5K inventors identified in {time.time()-t0:.1f}s")

timed_msg("Step 2: Build co-invention edges among top-5K")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE coinvention AS
    SELECT
        a.inventor_id AS inv_a,
        b.inventor_id AS inv_b,
        COUNT(DISTINCT a.patent_id) AS shared_patents
    FROM {INVENTOR_TSV()} a
    JOIN {INVENTOR_TSV()} b ON a.patent_id = b.patent_id AND a.inventor_id < b.inventor_id
    WHERE a.inventor_id IN (SELECT inventor_id FROM top_inventors)
      AND b.inventor_id IN (SELECT inventor_id FROM top_inventors)
    GROUP BY a.inventor_id, b.inventor_id
""")
edge_cnt = con.execute("SELECT COUNT(*) FROM coinvention").fetchone()[0]
print(f"  Co-invention edges: {edge_cnt:,} in {time.time()-t0:.1f}s")

timed_msg("Step 3: Compute degree centrality")
t0 = time.time()

con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE degree AS
    SELECT inventor_id, SUM(degree) AS degree
    FROM (
        SELECT inv_a AS inventor_id, COUNT(*) AS degree FROM coinvention GROUP BY inv_a
        UNION ALL
        SELECT inv_b AS inventor_id, COUNT(*) AS degree FROM coinvention GROUP BY inv_b
    )
    GROUP BY inventor_id
""")
print(f"  Degree centrality done in {time.time()-t0:.1f}s")

timed_msg("Step 4: Compute citation impact by centrality bin")
t0 = time.time()

result = con.execute(f"""
    WITH inventor_quality AS (
        SELECT
            i.inventor_id,
            COALESCE(d.degree, 0) AS degree,
            AVG(m.fwd_cite_5y) AS mean_raw_citations,
            COUNT(DISTINCT i.patent_id) AS patent_count
        FROM {INVENTOR_TSV()} i
        JOIN '{MASTER}' m ON i.patent_id = m.patent_id
        LEFT JOIN degree d ON i.inventor_id = d.inventor_id
        WHERE i.inventor_id IN (SELECT inventor_id FROM top_inventors)
          AND m.grant_year BETWEEN 1980 AND 2020
          AND m.fwd_cite_5y IS NOT NULL
        GROUP BY i.inventor_id, d.degree
    ),
    binned AS (
        SELECT *,
            NTILE(5) OVER (ORDER BY degree) AS centrality_quintile
        FROM inventor_quality
    )
    SELECT
        centrality_quintile,
        CASE centrality_quintile
            WHEN 1 THEN 'Q1 (Lowest)'
            WHEN 2 THEN 'Q2'
            WHEN 3 THEN 'Q3'
            WHEN 4 THEN 'Q4'
            WHEN 5 THEN 'Q5 (Highest)'
        END AS centrality_label,
        COUNT(*) AS n_inventors,
        ROUND(AVG(degree), 1) AS mean_degree,
        ROUND(AVG(mean_raw_citations), 3) AS mean_citations,
        ROUND(AVG(patent_count), 1) AS mean_patent_count
    FROM binned
    GROUP BY centrality_quintile
    ORDER BY centrality_quintile
""").fetchdf()

save_json(result.to_dict(orient="records"), f"{OUT}/bridge_centrality.json")
print(f"  Done in {time.time()-t0:.1f}s")
print(result.to_string(index=False))

con.close()
print("\n=== 71_bridge_inventor_centrality complete ===\n")
print("NOTE: Uses degree centrality (not betweenness) due to network size constraints.")
print("Full betweenness centrality for 5K-node network would require NetworkX and significant compute time.")
