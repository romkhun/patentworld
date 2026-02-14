#!/usr/bin/env python3
"""
Ambidexterity and Performance Cross-Analysis

For each top-50 assignee, per 5-year window:
  - Ambidexterity index: 1 - |exploration_share - exploitation_share|
  - Portfolio-level blockbuster rate
  - Portfolio-level median forward citations

Output:
  company/firm_ambidexterity_quality.json
"""
import json
import time
import duckdb
import numpy as np
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/company"
con = duckdb.connect()

with open(f"{OUT}/company_name_mapping.json", "r") as f:
    COMPANY_MAP = json.load(f)

def clean_name(raw):
    return COMPANY_MAP.get(raw, raw)

# ── Step 1: Identify top 50 assignees ────────────────────────────────────────
timed_msg("Step 1: Identify top 50 assignees")
t0 = time.time()

top50_rows = con.execute(f"""
    SELECT a.disambig_assignee_organization AS org, COUNT(DISTINCT p.patent_id) AS total
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY org
    ORDER BY total DESC
    LIMIT 50
""").fetchall()
top50_orgs = [row[0] for row in top50_rows]
org_sql = ','.join(f"'{o.replace(chr(39), chr(39)+chr(39))}'" for o in top50_orgs)
print(f"  Top 50 identified in {time.time()-t0:.1f}s")

# ── Step 2: Build base tables ────────────────────────────────────────────────
timed_msg("Step 2: Build base tables")
t0 = time.time()

con.execute("DROP TABLE IF EXISTS amb_patents")
con.execute(f"""
    CREATE TEMPORARY TABLE amb_patents AS
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        CAST(FLOOR((YEAR(CAST(p.patent_date AS DATE)) - 1980) / 5.0) * 5 + 1980 AS INT) AS window_start,
        a.disambig_assignee_organization AS org
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1980 AND 2019
      AND a.disambig_assignee_organization IN ({org_sql})
""")
ap_count = con.execute("SELECT COUNT(*) FROM amb_patents").fetchone()[0]
print(f"  amb_patents: {ap_count:,} rows in {time.time()-t0:.1f}s")

# Primary CPC
con.execute("DROP TABLE IF EXISTS amb_cpc")
con.execute(f"""
    CREATE TEMPORARY TABLE amb_cpc AS
    SELECT patent_id, cpc_section, cpc_subclass
    FROM {CPC_CURRENT_TSV()}
    WHERE cpc_sequence = 0
""")

# Forward citations (5yr)
con.execute("DROP TABLE IF EXISTS amb_fwd")
con.execute(f"""
    CREATE TEMPORARY TABLE amb_fwd AS
    SELECT
        c.citation_patent_id AS patent_id,
        COUNT(*) AS fwd_cites
    FROM {CITATION_TSV()} c
    JOIN {PATENT_TSV()} citing ON c.patent_id = citing.patent_id
    JOIN {PATENT_TSV()} cited ON c.citation_patent_id = cited.patent_id
    WHERE citing.patent_date IS NOT NULL AND cited.patent_date IS NOT NULL
      AND DATEDIFF('day', CAST(cited.patent_date AS DATE), CAST(citing.patent_date AS DATE)) BETWEEN 0 AND 1826
    GROUP BY c.citation_patent_id
""")

# Blockbuster thresholds per year × CPC section
con.execute("DROP TABLE IF EXISTS amb_thresholds")
con.execute(f"""
    CREATE TEMPORARY TABLE amb_thresholds AS
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        c.cpc_section AS section,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)) AS p99_threshold
    FROM {PATENT_TSV()} p
    JOIN amb_cpc c ON p.patent_id = c.patent_id
    LEFT JOIN amb_fwd fc ON p.patent_id = fc.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1980 AND 2019
    GROUP BY year, section
""")
print(f"  Base tables built in {time.time()-t0:.1f}s")

# ── Step 3: Technology newness for exploration score ─────────────────────────
timed_msg("Step 3: Compute exploration scores")
t0 = time.time()

# Simplified exploration: technology newness only (for speed)
con.execute("DROP TABLE IF EXISTS amb_exploration")
con.execute("""
    CREATE TEMPORARY TABLE amb_exploration AS
    SELECT
        ap.patent_id,
        ap.org,
        ap.year,
        ap.window_start,
        ac.cpc_subclass,
        (
            SELECT COUNT(DISTINCT ap2.patent_id)
            FROM amb_patents ap2
            JOIN amb_cpc ac2 ON ap2.patent_id = ac2.patent_id
            WHERE ap2.org = ap.org
              AND ac2.cpc_subclass = ac.cpc_subclass
              AND ap2.year BETWEEN ap.year - 5 AND ap.year - 1
        ) AS prior_count
    FROM amb_patents ap
    JOIN amb_cpc ac ON ap.patent_id = ac.patent_id
""")

con.execute("ALTER TABLE amb_exploration ADD COLUMN exploration_score DOUBLE")
con.execute("""
    UPDATE amb_exploration SET exploration_score = CASE
        WHEN prior_count = 0 THEN 1.0
        WHEN prior_count >= 10 THEN 0.0
        ELSE 1.0 - (CAST(prior_count AS DOUBLE) / 10.0)
    END
""")
print(f"  Exploration scores computed in {time.time()-t0:.1f}s")

# ── Step 4: Aggregate per firm × 5-year window ──────────────────────────────
timed_msg("Step 4: Aggregate per firm × 5-year window")
t0 = time.time()

result_df = con.execute("""
    SELECT
        ae.org,
        ae.window_start,
        COUNT(*) AS patent_count,
        ROUND(CAST(SUM(CASE WHEN ae.exploration_score > 0.6 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*), 4) AS exploration_share,
        ROUND(CAST(SUM(CASE WHEN ae.exploration_score < 0.4 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*), 4) AS exploitation_share,
        ROUND(1.0 - ABS(
            CAST(SUM(CASE WHEN ae.exploration_score > 0.6 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*)
            - CAST(SUM(CASE WHEN ae.exploration_score < 0.4 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*)
        ), 4) AS ambidexterity_index,
        ROUND(
            CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) >= bt.p99_threshold THEN 1 ELSE 0 END) AS DOUBLE)
            / COUNT(*) * 100, 3
        ) AS blockbuster_rate,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY COALESCE(fc.fwd_cites, 0)), 1) AS median_fwd_cites
    FROM amb_exploration ae
    LEFT JOIN amb_fwd fc ON ae.patent_id = fc.patent_id
    JOIN amb_thresholds bt ON ae.year = bt.year AND ae.cpc_subclass LIKE bt.section || '%'
    GROUP BY ae.org, ae.window_start
    HAVING COUNT(*) >= 50
    ORDER BY ae.org, ae.window_start
""").fetchdf()
print(f"  Aggregated: {len(result_df):,} rows in {time.time()-t0:.1f}s")

# ── Step 5: Build output JSON ────────────────────────────────────────────────
timed_msg("Step 5: Build ambidexterity JSON")

records = []
for _, row in result_df.iterrows():
    records.append({
        'company': clean_name(row['org']),
        'window': f"{int(row['window_start'])}-{int(row['window_start'])+4}",
        'patent_count': int(row['patent_count']),
        'ambidexterity_index': float(row['ambidexterity_index']),
        'exploration_share': round(float(row['exploration_share']) * 100, 2),
        'exploitation_share': round(float(row['exploitation_share']) * 100, 2),
        'blockbuster_rate': float(row['blockbuster_rate']),
        'median_fwd_cites': float(row['median_fwd_cites']),
    })

save_json(records, f"{OUT}/firm_ambidexterity_quality.json")

con.close()
print("\n=== 44_firm_ambidexterity_quality complete ===\n")
