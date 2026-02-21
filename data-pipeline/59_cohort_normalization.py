#!/usr/bin/env python3
"""
Cohort Normalization — normalize 5-year forward citations by (grant_year × cpc_section) cohort.

Reads patent_master.parquet, computes cohort means, and outputs multiple JSON files
for system-level, heatmap, assignee, inventor-group, geography, and team-size views.

Output (all to public/data/computed/):
  1. cohort_normalized_citations_system.json
  2. cohort_normalized_citations_heatmap.json
  3. cohort_normalized_by_assignee.json
  4. cohort_normalized_by_inventor_group.json
  5. cohort_normalized_by_geography.json
  6. cohort_normalized_by_teamsize.json
"""
import time
import duckdb
from config import OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/computed"
con = duckdb.connect()
con.execute("SET threads TO 38")

# ── Step 1: Load master and compute cohort means ──────────────────────────────
timed_msg("Step 1: Compute cohort means (grant_year × cpc_section)")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE master AS
    SELECT * FROM '{MASTER}'
    WHERE grant_year BETWEEN 1976 AND 2020
      AND cpc_section IS NOT NULL
      AND cpc_section NOT IN ('Y', 'D')
""")
cnt = con.execute("SELECT COUNT(*) FROM master").fetchone()[0]
print(f"  Loaded {cnt:,} patents (≤2020, excl Y/D) in {time.time()-t0:.1f}s")

con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE cohort_means AS
    SELECT
        grant_year,
        cpc_section,
        AVG(fwd_cite_5y) AS cohort_mean_5y,
        COUNT(*) AS cohort_size
    FROM master
    GROUP BY grant_year, cpc_section
""")

# Add normalized column to master
con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE master_norm AS
    SELECT
        m.*,
        cm.cohort_mean_5y,
        CASE WHEN cm.cohort_mean_5y > 0
             THEN m.fwd_cite_5y / cm.cohort_mean_5y
             ELSE 0
        END AS cohort_norm_5y
    FROM master m
    JOIN cohort_means cm ON m.grant_year = cm.grant_year AND m.cpc_section = cm.cpc_section
""")
print(f"  Cohort normalization done in {time.time()-t0:.1f}s")

# ── Output 1: System-level trends ─────────────────────────────────────────────
timed_msg("Output 1: cohort_normalized_citations_system.json")
t0 = time.time()

system_data = con.execute("""
    SELECT
        grant_year AS year,
        ROUND(AVG(cohort_norm_5y), 4) AS mean_cohort_norm,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cohort_norm_5y), 4) AS median_cohort_norm,
        ROUND(
            CAST(SUM(CASE WHEN cohort_norm_5y >= (
                SELECT PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY cohort_norm_5y)
                FROM master_norm mn2 WHERE mn2.grant_year = master_norm.grant_year
            ) THEN fwd_cite_5y ELSE 0 END) AS DOUBLE) /
            NULLIF(SUM(fwd_cite_5y), 0) * 100,
        2) AS top1pct_share
    FROM master_norm
    GROUP BY grant_year
    ORDER BY grant_year
""").fetchdf()
save_json(system_data.to_dict(orient="records"), f"{OUT}/cohort_normalized_citations_system.json")
print(f"  Done in {time.time()-t0:.1f}s")

# ── Output 2: Heatmap (year × section) ────────────────────────────────────────
timed_msg("Output 2: cohort_normalized_citations_heatmap.json")
t0 = time.time()

heatmap_data = con.execute("""
    SELECT
        grant_year AS year,
        cpc_section AS section,
        ROUND(AVG(cohort_norm_5y), 4) AS mean_norm,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cohort_norm_5y), 4) AS median_norm,
        COUNT(*) AS patent_count
    FROM master_norm
    GROUP BY grant_year, cpc_section
    ORDER BY grant_year, cpc_section
""").fetchdf()
save_json(heatmap_data.to_dict(orient="records"), f"{OUT}/cohort_normalized_citations_heatmap.json")
print(f"  Done in {time.time()-t0:.1f}s")

# ── Output 3: Top 100 assignees ───────────────────────────────────────────────
timed_msg("Output 3: cohort_normalized_by_assignee.json")
t0 = time.time()

# Identify top 100 assignees
con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE top_assignees AS
    SELECT primary_assignee_org AS org, COUNT(*) AS total
    FROM master_norm
    WHERE primary_assignee_org IS NOT NULL AND TRIM(primary_assignee_org) != ''
    GROUP BY primary_assignee_org
    ORDER BY total DESC
    LIMIT 100
""")

assignee_data = con.execute("""
    SELECT
        m.grant_year AS year,
        m.primary_assignee_org AS assignee,
        ROUND(AVG(m.cohort_norm_5y), 4) AS mean_norm,
        COUNT(*) AS patent_count
    FROM master_norm m
    JOIN top_assignees ta ON m.primary_assignee_org = ta.org
    GROUP BY m.grant_year, m.primary_assignee_org
    ORDER BY m.primary_assignee_org, m.grant_year
""").fetchdf()
save_json(assignee_data.to_dict(orient="records"), f"{OUT}/cohort_normalized_by_assignee.json")
print(f"  Done in {time.time()-t0:.1f}s")

# ── Output 4: Inventor groups (gender, team_size_cat) ─────────────────────────
timed_msg("Output 4: cohort_normalized_by_inventor_group.json")
t0 = time.time()

inv_data = con.execute("""
    SELECT
        grant_year AS year,
        CASE
            WHEN gender_code = 'M' THEN 'Male'
            WHEN gender_code = 'F' THEN 'Female'
            ELSE 'Unknown'
        END AS gender,
        team_size_cat,
        ROUND(AVG(cohort_norm_5y), 4) AS mean_norm,
        COUNT(*) AS patent_count
    FROM master_norm
    GROUP BY grant_year, gender, team_size_cat
    ORDER BY grant_year
""").fetchdf()
save_json(inv_data.to_dict(orient="records"), f"{OUT}/cohort_normalized_by_inventor_group.json")
print(f"  Done in {time.time()-t0:.1f}s")

# ── Output 5: Geography (state + country) ─────────────────────────────────────
timed_msg("Output 5: cohort_normalized_by_geography.json")
t0 = time.time()

geo_data = con.execute("""
    WITH by_state AS (
        SELECT
            grant_year AS year,
            disambig_state AS state,
            'state' AS geo_type,
            ROUND(AVG(cohort_norm_5y), 4) AS mean_norm,
            COUNT(*) AS patent_count
        FROM master_norm
        WHERE disambig_country = 'US' AND disambig_state IS NOT NULL
        GROUP BY grant_year, disambig_state
        HAVING COUNT(*) >= 50
    ),
    by_country AS (
        SELECT
            grant_year AS year,
            disambig_country AS country,
            'country' AS geo_type,
            ROUND(AVG(cohort_norm_5y), 4) AS mean_norm,
            COUNT(*) AS patent_count
        FROM master_norm
        WHERE disambig_country IS NOT NULL
        GROUP BY grant_year, disambig_country
        HAVING COUNT(*) >= 50
    )
    SELECT year, state AS region, geo_type, mean_norm, patent_count FROM by_state
    UNION ALL
    SELECT year, country AS region, geo_type, mean_norm, patent_count FROM by_country
    ORDER BY geo_type, region, year
""").fetchdf()
save_json(geo_data.to_dict(orient="records"), f"{OUT}/cohort_normalized_by_geography.json")
print(f"  Done in {time.time()-t0:.1f}s")

# ── Output 6: Team size categories ────────────────────────────────────────────
timed_msg("Output 6: cohort_normalized_by_teamsize.json")
t0 = time.time()

team_data = con.execute("""
    SELECT
        grant_year AS year,
        team_size_cat,
        ROUND(AVG(cohort_norm_5y), 4) AS mean_norm,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cohort_norm_5y), 4) AS median_norm,
        COUNT(*) AS patent_count
    FROM master_norm
    GROUP BY grant_year, team_size_cat
    ORDER BY grant_year, team_size_cat
""").fetchdf()
save_json(team_data.to_dict(orient="records"), f"{OUT}/cohort_normalized_by_teamsize.json")
print(f"  Done in {time.time()-t0:.1f}s")

con.close()
print("\n=== 59_cohort_normalization complete ===\n")
