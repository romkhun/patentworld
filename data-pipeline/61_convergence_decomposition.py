#!/usr/bin/env python3
"""
Convergence Decomposition — Analysis 2 for Chapter 10 (system-convergence).

1. Within-firm vs between-firm shift-share decomposition of multi-section patent share.
2. Near vs far field convergence based on 1976-1985 baseline co-occurrence.
3. Top-10 assignee share of multi-section patents over time.

Output (to public/data/chapter10/):
  - convergence_decomposition.json
  - convergence_near_far.json
  - convergence_top_assignees.json
"""
import time
import duckdb
from config import OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter10"
con = duckdb.connect()
con.execute("SET threads TO 38")

# ── Step 1: Load master ───────────────────────────────────────────────────────
timed_msg("Step 1: Load patent master")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE m AS
    SELECT patent_id, grant_year, cpc_section, n_cpc_sections, is_multi_section,
           primary_assignee_org, primary_assignee_id
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1976 AND 2024
      AND cpc_section IS NOT NULL
""")
cnt = con.execute("SELECT COUNT(*) FROM m").fetchone()[0]
print(f"  Loaded {cnt:,} rows in {time.time()-t0:.1f}s")

# ── Analysis 1: Within-firm vs between-firm shift-share decomposition ─────────
timed_msg("Analysis 1: Shift-share decomposition")
t0 = time.time()

decomp = con.execute("""
    WITH firm_year AS (
        SELECT
            grant_year AS year,
            primary_assignee_org AS firm,
            COUNT(*) AS n_patents,
            SUM(CASE WHEN is_multi_section THEN 1 ELSE 0 END) AS n_multi,
            CAST(SUM(CASE WHEN is_multi_section THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*) AS multi_rate
        FROM m
        WHERE primary_assignee_org IS NOT NULL AND TRIM(primary_assignee_org) != ''
        GROUP BY grant_year, primary_assignee_org
        HAVING COUNT(*) >= 5
    ),
    system_year AS (
        SELECT
            year,
            SUM(n_patents) AS total_patents,
            SUM(n_multi) AS total_multi,
            CAST(SUM(n_multi) AS DOUBLE) / SUM(n_patents) AS system_multi_rate
        FROM firm_year
        GROUP BY year
    ),
    prev_year AS (
        SELECT
            fy.year,
            fy.firm,
            fy.n_patents,
            fy.multi_rate,
            LAG(fy.n_patents) OVER (PARTITION BY fy.firm ORDER BY fy.year) AS prev_patents,
            LAG(fy.multi_rate) OVER (PARTITION BY fy.firm ORDER BY fy.year) AS prev_rate,
            LAG(sy.total_patents) OVER (ORDER BY fy.year) AS prev_total
        FROM firm_year fy
        JOIN system_year sy ON fy.year = sy.year
    ),
    components AS (
        SELECT
            year,
            -- Within-firm: Σ (share_t-1 × Δrate)
            SUM(
                (CAST(prev_patents AS DOUBLE) / NULLIF(prev_total, 0))
                * (multi_rate - prev_rate)
            ) AS within_component,
            -- Between-firm: Σ (Δshare × rate_t-1)
            SUM(
                (CAST(n_patents AS DOUBLE) / NULLIF(prev_total, 0)
                 - CAST(prev_patents AS DOUBLE) / NULLIF(prev_total, 0))
                * prev_rate
            ) AS between_component
        FROM prev_year
        WHERE prev_patents IS NOT NULL AND prev_total > 0
        GROUP BY year
    )
    SELECT
        c.year,
        sy.system_multi_rate AS overall_multi_rate,
        ROUND(c.within_component, 6) AS within_firm,
        ROUND(c.between_component, 6) AS between_firm,
        ROUND(c.within_component + c.between_component, 6) AS total_change
    FROM components c
    JOIN system_year sy ON c.year = sy.year
    ORDER BY c.year
""").fetchdf()
save_json(decomp.to_dict(orient="records"), f"{OUT}/convergence_decomposition.json")
print(f"  Decomposition done in {time.time()-t0:.1f}s")

# ── Analysis 2: Near vs far field convergence ─────────────────────────────────
timed_msg("Analysis 2: Near vs far convergence (baseline 1976-1985)")
t0 = time.time()

# Load all CPC assignments per patent for co-occurrence
from config import CPC_CURRENT_TSV
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE patent_sections AS
    SELECT DISTINCT patent_id, cpc_section
    FROM {CPC_CURRENT_TSV()}
    WHERE cpc_section IS NOT NULL AND cpc_section NOT IN ('Y')
""")

# Build baseline co-occurrence from 1976-1985
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE baseline_cooccur AS
    SELECT
        ps1.cpc_section AS section_a,
        ps2.cpc_section AS section_b,
        COUNT(DISTINCT ps1.patent_id) AS co_count
    FROM patent_sections ps1
    JOIN patent_sections ps2 ON ps1.patent_id = ps2.patent_id AND ps1.cpc_section < ps2.cpc_section
    JOIN '{MASTER}' m ON ps1.patent_id = m.patent_id
    WHERE m.grant_year BETWEEN 1976 AND 1985
    GROUP BY ps1.cpc_section, ps2.cpc_section
""")

# Near = top quartile co-occurrence, Far = bottom quartile
# Pre-compute quantiles since DuckDB doesn't support PERCENTILE_CONT as window function
q75, q25 = con.execute("""
    SELECT
        QUANTILE_CONT(co_count, 0.75),
        QUANTILE_CONT(co_count, 0.25)
    FROM baseline_cooccur
""").fetchone()
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE pair_distance AS
    SELECT *,
        CASE
            WHEN co_count >= {q75} THEN 'near'
            WHEN co_count <= {q25} THEN 'far'
            ELSE 'mid'
        END AS distance_type
    FROM baseline_cooccur
""")

# Multi-section patent co-occurrence over time
near_far = con.execute(f"""
    WITH yearly_cooccur AS (
        SELECT
            m.grant_year AS year,
            ps1.cpc_section AS section_a,
            ps2.cpc_section AS section_b,
            COUNT(DISTINCT ps1.patent_id) AS co_count
        FROM patent_sections ps1
        JOIN patent_sections ps2 ON ps1.patent_id = ps2.patent_id AND ps1.cpc_section < ps2.cpc_section
        JOIN '{MASTER}' m ON ps1.patent_id = m.patent_id
        WHERE m.grant_year BETWEEN 1976 AND 2024
        GROUP BY m.grant_year, ps1.cpc_section, ps2.cpc_section
    ),
    yearly_total AS (
        SELECT year, SUM(co_count) AS total_co FROM yearly_cooccur GROUP BY year
    )
    SELECT
        yc.year,
        pd.distance_type,
        ROUND(CAST(SUM(yc.co_count) AS DOUBLE) / yt.total_co * 100, 4) AS share_pct
    FROM yearly_cooccur yc
    JOIN pair_distance pd ON yc.section_a = pd.section_a AND yc.section_b = pd.section_b
    JOIN yearly_total yt ON yc.year = yt.year
    WHERE pd.distance_type IN ('near', 'far')
    GROUP BY yc.year, pd.distance_type, yt.total_co
    ORDER BY yc.year, pd.distance_type
""").fetchdf()
save_json(near_far.to_dict(orient="records"), f"{OUT}/convergence_near_far.json")
print(f"  Near/far done in {time.time()-t0:.1f}s")

# ── Analysis 3: Top-10 assignee share of multi-section patents ────────────────
timed_msg("Analysis 3: Top-10 assignee multi-section share")
t0 = time.time()

top_assignees = con.execute("""
    WITH top10 AS (
        SELECT primary_assignee_org AS firm, COUNT(*) AS total
        FROM m
        WHERE is_multi_section AND primary_assignee_org IS NOT NULL
        GROUP BY primary_assignee_org
        ORDER BY total DESC
        LIMIT 10
    )
    SELECT
        m.grant_year AS year,
        m.primary_assignee_org AS firm,
        SUM(CASE WHEN m.is_multi_section THEN 1 ELSE 0 END) AS multi_count,
        COUNT(*) AS total_count
    FROM m
    JOIN top10 t ON m.primary_assignee_org = t.firm
    GROUP BY m.grant_year, m.primary_assignee_org
    ORDER BY m.primary_assignee_org, m.grant_year
""").fetchdf()
save_json(top_assignees.to_dict(orient="records"), f"{OUT}/convergence_top_assignees.json")
print(f"  Top assignees done in {time.time()-t0:.1f}s")

con.close()
print("\n=== 61_convergence_decomposition complete ===\n")
