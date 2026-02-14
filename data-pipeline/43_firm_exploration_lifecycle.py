#!/usr/bin/env python3
"""
Exploration → Exploitation Lifecycle at Firm × Technology Level

For each (top-30 assignee × CPC subclass) pair with ≥20 patents:
  1. Identify the firm's entry year (first patent in that subclass)
  2. Compute mean exploration score per relative year (t=0, 1, ..., 15)
  3. Average to produce firm-specific exploration decay curves

Output:
  company/firm_exploration_lifecycle.json
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

# ── Step 1: Identify top 30 assignees ────────────────────────────────────────
timed_msg("Step 1: Identify top 30 assignees")
t0 = time.time()

top30_rows = con.execute(f"""
    SELECT a.disambig_assignee_organization AS org, COUNT(DISTINCT p.patent_id) AS total
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY org
    ORDER BY total DESC
    LIMIT 30
""").fetchall()
top30_orgs = [row[0] for row in top30_rows]
org_sql = ','.join(f"'{o.replace(chr(39), chr(39)+chr(39))}'" for o in top30_orgs)
print(f"  Top 30 identified in {time.time()-t0:.1f}s")

# ── Step 2: Build patent table with CPC subclass ────────────────────────────
timed_msg("Step 2: Build patent table with CPC subclass")
t0 = time.time()

con.execute("DROP TABLE IF EXISTS lc_patents")
con.execute(f"""
    CREATE TEMPORARY TABLE lc_patents AS
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        a.disambig_assignee_organization AS org,
        c.cpc_subclass
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND a.disambig_assignee_organization IN ({org_sql})
""")
lc_count = con.execute("SELECT COUNT(*) FROM lc_patents").fetchone()[0]
print(f"  lc_patents: {lc_count:,} rows in {time.time()-t0:.1f}s")

# ── Step 3: Find entry year per (firm × subclass) ───────────────────────────
timed_msg("Step 3: Entry year per (firm × subclass)")
t0 = time.time()

# Only consider (firm × subclass) pairs with ≥20 patents
con.execute("DROP TABLE IF EXISTS firm_subclass_entry")
con.execute("""
    CREATE TEMPORARY TABLE firm_subclass_entry AS
    SELECT
        org,
        cpc_subclass,
        MIN(year) AS entry_year,
        COUNT(*) AS total_patents
    FROM lc_patents
    GROUP BY org, cpc_subclass
    HAVING COUNT(*) >= 20
""")
entry_count = con.execute("SELECT COUNT(*) FROM firm_subclass_entry").fetchone()[0]
print(f"  firm_subclass_entry: {entry_count:,} pairs in {time.time()-t0:.1f}s")

# ── Step 4: Compute simplified exploration score per patent ──────────────────
timed_msg("Step 4: Simplified exploration score per patent")
t0 = time.time()

# Use technology newness as the primary indicator for lifecycle analysis
# (counts firm's prior patents in same CPC subclass over last 5 years)
con.execute("DROP TABLE IF EXISTS lc_tech_newness")
con.execute("""
    CREATE TEMPORARY TABLE lc_tech_newness AS
    SELECT
        lp.patent_id,
        lp.org,
        lp.year,
        lp.cpc_subclass,
        (
            SELECT COUNT(DISTINCT lp2.patent_id)
            FROM lc_patents lp2
            WHERE lp2.org = lp.org
              AND lp2.cpc_subclass = lp.cpc_subclass
              AND lp2.year BETWEEN lp.year - 5 AND lp.year - 1
        ) AS prior_count
    FROM lc_patents lp
""")

con.execute("""
    ALTER TABLE lc_tech_newness ADD COLUMN exploration_score DOUBLE
""")
con.execute("""
    UPDATE lc_tech_newness SET exploration_score = CASE
        WHEN prior_count = 0 THEN 1.0
        WHEN prior_count >= 10 THEN 0.0
        ELSE 1.0 - (CAST(prior_count AS DOUBLE) / 10.0)
    END
""")
print(f"  lc_tech_newness computed in {time.time()-t0:.1f}s")

# ── Step 5: Compute mean exploration score per relative year ─────────────────
timed_msg("Step 5: Decay curves per firm")
t0 = time.time()

decay_df = con.execute("""
    SELECT
        tn.org,
        tn.year - fse.entry_year AS relative_year,
        AVG(tn.exploration_score) AS mean_exploration
    FROM lc_tech_newness tn
    JOIN firm_subclass_entry fse
        ON tn.org = fse.org AND tn.cpc_subclass = fse.cpc_subclass
    WHERE tn.year - fse.entry_year BETWEEN 0 AND 15
    GROUP BY tn.org, tn.year - fse.entry_year
    ORDER BY tn.org, relative_year
""").fetchdf()
print(f"  Decay data: {len(decay_df):,} rows in {time.time()-t0:.1f}s")

# System average decay curve
system_decay_df = con.execute("""
    SELECT
        tn.year - fse.entry_year AS relative_year,
        AVG(tn.exploration_score) AS mean_exploration
    FROM lc_tech_newness tn
    JOIN firm_subclass_entry fse
        ON tn.org = fse.org AND tn.cpc_subclass = fse.cpc_subclass
    WHERE tn.year - fse.entry_year BETWEEN 0 AND 15
    GROUP BY relative_year
    ORDER BY relative_year
""").fetchdf()

system_decay = {}
for _, row in system_decay_df.iterrows():
    system_decay[int(row['relative_year'])] = round(float(row['mean_exploration']), 4)

# ── Step 6: Build output JSON ────────────────────────────────────────────────
timed_msg("Step 6: Build lifecycle JSON")

firm_decay = {}
for _, row in decay_df.iterrows():
    name = clean_name(row['org'])
    if name not in firm_decay:
        firm_decay[name] = []
    firm_decay[name].append({
        'relative_year': int(row['relative_year']),
        'mean_exploration': round(float(row['mean_exploration']), 4),
        'system_mean': system_decay.get(int(row['relative_year']), 0),
    })

# Sort and select top 15 by steepest decay (highest initial, lowest final)
decay_slopes = {}
for name, data in firm_decay.items():
    initial = [d['mean_exploration'] for d in data if d['relative_year'] <= 1]
    final = [d['mean_exploration'] for d in data if d['relative_year'] >= 10]
    if initial and final:
        decay_slopes[name] = np.mean(initial) - np.mean(final)

top15_decay = sorted(decay_slopes.items(), key=lambda x: -x[1])[:15]
top15_names = [name for name, _ in top15_decay]

output = {
    'firms': {name: firm_decay[name] for name in top15_names if name in firm_decay},
    'system_average': [{'relative_year': k, 'mean_exploration': v} for k, v in sorted(system_decay.items())],
}

save_json(output, f"{OUT}/firm_exploration_lifecycle.json")

con.close()
print("\n=== 43_firm_exploration_lifecycle complete ===\n")
