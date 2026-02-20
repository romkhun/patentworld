#!/usr/bin/env python3
"""
69: Government-Interest Normalized Impact — Section 13c

Compare government-funded patents vs non-funded:
  - Cohort-normalized mean forward citations
  - Top-decile share (% in top 10% of year×section cohort)
  - Top-1% share (blockbuster rate)

Output: public/data/chapter1/gov_impact_comparison.json
"""
import time
import duckdb
from config import GOV_INTEREST_TSV, OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter1"
con = duckdb.connect()
con.execute("SET threads TO 38")

timed_msg("Step 1: Cohort percentiles")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE cohort_stats AS
    SELECT
        grant_year, cpc_section,
        AVG(fwd_cite_5y) AS cohort_mean,
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY fwd_cite_5y) AS p90,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY fwd_cite_5y) AS p99,
        COUNT(*) AS cohort_size
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1980 AND 2020
      AND cpc_section IS NOT NULL AND cpc_section != 'Y'
      AND fwd_cite_5y IS NOT NULL
    GROUP BY grant_year, cpc_section
""")
print(f"  Cohort stats done in {time.time()-t0:.1f}s")

timed_msg("Step 2: Flag government-funded patents")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE patent_gov AS
    SELECT
        m.patent_id,
        m.grant_year,
        m.cpc_section,
        m.fwd_cite_5y,
        CASE WHEN gi.patent_id IS NOT NULL THEN 'Government-Funded' ELSE 'Non-Funded' END AS funding_status
    FROM '{MASTER}' m
    LEFT JOIN (SELECT DISTINCT patent_id FROM {GOV_INTEREST_TSV()}) gi ON m.patent_id = gi.patent_id
    WHERE m.grant_year BETWEEN 1980 AND 2020
      AND m.cpc_section IS NOT NULL AND m.cpc_section != 'Y'
      AND m.fwd_cite_5y IS NOT NULL
""")
print(f"  Patent-gov join done in {time.time()-t0:.1f}s")

timed_msg("Step 3: Compute comparison metrics")
t0 = time.time()

result = con.execute("""
    SELECT
        pg.funding_status,
        COUNT(*) AS patent_count,
        ROUND(AVG(pg.fwd_cite_5y), 3) AS mean_raw_citations,
        ROUND(AVG(CASE WHEN cs.cohort_mean > 0 THEN pg.fwd_cite_5y / cs.cohort_mean ELSE NULL END), 3) AS mean_normalized,
        ROUND(100.0 * SUM(CASE WHEN pg.fwd_cite_5y >= cs.p90 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS top_decile_share,
        ROUND(100.0 * SUM(CASE WHEN pg.fwd_cite_5y >= cs.p99 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS top_1pct_share
    FROM patent_gov pg
    JOIN cohort_stats cs ON pg.grant_year = cs.grant_year AND pg.cpc_section = cs.cpc_section
    GROUP BY pg.funding_status
    ORDER BY pg.funding_status
""").fetchdf()

save_json(result.to_dict(orient="records"), f"{OUT}/gov_impact_comparison.json")
print(f"  Done in {time.time()-t0:.1f}s")
print(result.to_string(index=False))

con.close()
print("\n=== 69_gov_interest_impact complete ===\n")
