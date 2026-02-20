#!/usr/bin/env python3
"""
70: Alice Event Study — Section 13d

Compare software patents (G06F, G06Q, H04L) vs control (CPC A, C, F),
indexed to 2013 (the year before Alice Corp. v. CLS Bank, 2014).

Metrics: patent count, mean claims, mean scope — 2008-2020.

Output: public/data/chapter10/alice_event_study.json
"""
import time
import duckdb
from config import CPC_CURRENT_TSV, OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter10"
con = duckdb.connect()
con.execute("SET threads TO 38")

timed_msg("Step 1: Identify software patents via CPC subclasses")
t0 = time.time()

# Get all patents with G06F, G06Q, or H04L as any CPC classification
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE software_patents AS
    SELECT DISTINCT patent_id
    FROM {CPC_CURRENT_TSV()}
    WHERE cpc_subclass IN ('G06F', 'G06Q', 'H04L')
""")
sw_cnt = con.execute("SELECT COUNT(*) FROM software_patents").fetchone()[0]
print(f"  Software patents: {sw_cnt:,} in {time.time()-t0:.1f}s")

timed_msg("Step 2: Classify patents and compute metrics")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE classified AS
    SELECT
        m.patent_id,
        m.grant_year,
        m.num_claims,
        m.scope,
        CASE
            WHEN sp.patent_id IS NOT NULL THEN 'Software (G06F/G06Q/H04L)'
            WHEN m.cpc_section IN ('A', 'C', 'F') THEN 'Control (A/C/F)'
            ELSE NULL
        END AS group_label
    FROM '{MASTER}' m
    LEFT JOIN software_patents sp ON m.patent_id = sp.patent_id
    WHERE m.grant_year BETWEEN 2008 AND 2020
""")
print(f"  Classification done in {time.time()-t0:.1f}s")

timed_msg("Step 3: Aggregate by year and group")
t0 = time.time()

result = con.execute("""
    WITH yearly AS (
        SELECT
            grant_year AS year,
            group_label,
            COUNT(*) AS patent_count,
            ROUND(AVG(CAST(num_claims AS DOUBLE)), 2) AS mean_claims,
            ROUND(AVG(CAST(scope AS DOUBLE)), 3) AS mean_scope
        FROM classified
        WHERE group_label IS NOT NULL
        GROUP BY grant_year, group_label
    ),
    base AS (
        SELECT group_label,
            patent_count AS base_count,
            mean_claims AS base_claims,
            mean_scope AS base_scope
        FROM yearly
        WHERE year = 2013
    )
    SELECT
        y.year,
        y.group_label,
        y.patent_count,
        y.mean_claims,
        y.mean_scope,
        ROUND(100.0 * y.patent_count / NULLIF(b.base_count, 0), 2) AS idx_count,
        ROUND(100.0 * y.mean_claims / NULLIF(b.base_claims, 0), 2) AS idx_claims,
        ROUND(100.0 * y.mean_scope / NULLIF(b.base_scope, 0), 2) AS idx_scope
    FROM yearly y
    JOIN base b ON y.group_label = b.group_label
    ORDER BY y.group_label, y.year
""").fetchdf()

save_json(result.to_dict(orient="records"), f"{OUT}/alice_event_study.json")
print(f"  Done in {time.time()-t0:.1f}s ({len(result)} rows)")
print(result.to_string(index=False))

con.close()
print("\n=== 70_alice_event_study complete ===\n")
