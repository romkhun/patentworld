#!/usr/bin/env python3
"""
Inventor Mobility Event Study — Analysis 4 for Chapter 5 (mech-inventors).

Identifies inventor moves (assignee changes between consecutive patents).
Builds event-study panel t-5 to t+5.
Computes means with 95% CIs.

Output: public/data/chapter5/inventor_mobility_event_study.json
"""
import time
import numpy as np
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, INVENTOR_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()
con.execute("SET threads TO 38")
con.execute("SET memory_limit = '200GB'")

# ── Step 1: Identify inventor moves ───────────────────────────────────────────
timed_msg("Step 1: Identify inventor moves (assignee changes)")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE inventor_patents AS
    SELECT
        i.inventor_id,
        i.patent_id,
        m.grant_year,
        m.grant_date,
        m.fwd_cite_5y,
        m.cpc_section,
        m.scope,
        m.primary_assignee_org AS assignee
    FROM {INVENTOR_TSV()} i
    JOIN '{MASTER}' m ON i.patent_id = m.patent_id
    WHERE m.primary_assignee_org IS NOT NULL
      AND TRIM(m.primary_assignee_org) != ''
      AND m.grant_year BETWEEN 1980 AND 2020
""")
cnt = con.execute("SELECT COUNT(*) FROM inventor_patents").fetchone()[0]
print(f"  inventor_patents: {cnt:,} rows in {time.time()-t0:.1f}s")

# Find move events: consecutive patents by same inventor with different assignee
timed_msg("Step 1b: Detect moves via LAG window")
t0 = time.time()

con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE move_events AS
    SELECT
        inventor_id,
        patent_id AS move_patent_id,
        grant_year AS move_year,
        assignee AS new_assignee,
        prev_assignee AS old_assignee
    FROM (
        SELECT
            inventor_id, patent_id, grant_year, grant_date, assignee,
            LAG(assignee) OVER (PARTITION BY inventor_id ORDER BY grant_date, patent_id) AS prev_assignee,
            LAG(grant_year) OVER (PARTITION BY inventor_id ORDER BY grant_date, patent_id) AS prev_year
        FROM inventor_patents
    ) sub
    WHERE assignee != prev_assignee
      AND prev_assignee IS NOT NULL
      AND grant_year - prev_year <= 5
""")
move_count = con.execute("SELECT COUNT(*) FROM move_events").fetchone()[0]
print(f"  Found {move_count:,} move events in {time.time()-t0:.1f}s")

# ── Step 2: Sample if needed ──────────────────────────────────────────────────
if move_count > 50000:
    timed_msg(f"Step 2: Sampling 50,000 of {move_count:,} events")
    con.execute("""
        CREATE OR REPLACE TEMPORARY TABLE move_sample AS
        SELECT * FROM move_events USING SAMPLE 50000
    """)
else:
    con.execute("CREATE OR REPLACE TEMPORARY TABLE move_sample AS SELECT * FROM move_events")
sample_cnt = con.execute("SELECT COUNT(*) FROM move_sample").fetchone()[0]
print(f"  Using {sample_cnt:,} move events")

# ── Step 3: Build event-study panel t-5 to t+5 ───────────────────────────────
timed_msg("Step 3: Build event-study panel")
t0 = time.time()

panel = con.execute("""
    SELECT
        ms.inventor_id,
        ms.move_year,
        ip.grant_year - ms.move_year AS relative_year,
        ip.fwd_cite_5y,
        ip.scope,
        CASE WHEN ip.assignee = ms.new_assignee THEN 'new'
             WHEN ip.assignee = ms.old_assignee THEN 'old'
             ELSE 'other'
        END AS firm_type
    FROM move_sample ms
    JOIN inventor_patents ip ON ms.inventor_id = ip.inventor_id
    WHERE ip.grant_year BETWEEN ms.move_year - 5 AND ms.move_year + 5
""").fetchdf()
print(f"  Panel: {len(panel):,} observations in {time.time()-t0:.1f}s")

# ── Step 4: Aggregate with 95% CIs ───────────────────────────────────────────
timed_msg("Step 4: Aggregate event-study means with 95% CIs")
t0 = time.time()

results = []
for rel_year in range(-5, 6):
    subset = panel[panel['relative_year'] == rel_year]
    if len(subset) == 0:
        continue

    n = len(subset)
    # Forward citations
    mean_cites = float(subset['fwd_cite_5y'].mean())
    se_cites = float(subset['fwd_cite_5y'].std() / np.sqrt(n))
    # Scope
    mean_scope = float(subset['scope'].mean())
    se_scope = float(subset['scope'].std() / np.sqrt(n))
    # New-firm share
    new_share = float((subset['firm_type'] == 'new').mean())

    results.append({
        'relative_year': rel_year,
        'n_obs': n,
        'mean_fwd_cite_5y': round(mean_cites, 4),
        'ci_lower_cites': round(mean_cites - 1.96 * se_cites, 4),
        'ci_upper_cites': round(mean_cites + 1.96 * se_cites, 4),
        'mean_scope': round(mean_scope, 4),
        'ci_lower_scope': round(mean_scope - 1.96 * se_scope, 4),
        'ci_upper_scope': round(mean_scope + 1.96 * se_scope, 4),
        'new_firm_share': round(new_share, 4),
    })

save_json(results, f"{OUT}/inventor_mobility_event_study.json")
print(f"  Event study done in {time.time()-t0:.1f}s ({len(results)} periods)")

# Also compute by move direction (up/lateral/down based on firm quality)
timed_msg("Step 4b: Event study by move direction (firm quality)")
t0 = time.time()

# Compute average firm quality
firm_quality = con.execute(f"""
    SELECT primary_assignee_org AS firm,
           AVG(fwd_cite_5y) AS mean_quality
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1990 AND 2020
      AND primary_assignee_org IS NOT NULL
    GROUP BY primary_assignee_org
    HAVING COUNT(*) >= 20
""").fetchdf()
fq_map = dict(zip(firm_quality['firm'], firm_quality['mean_quality']))

# Classify moves
move_directions = con.execute("SELECT * FROM move_sample").fetchdf()
move_dirs = []
for _, row in move_directions.iterrows():
    old_q = fq_map.get(row['old_assignee'], None)
    new_q = fq_map.get(row['new_assignee'], None)
    if old_q is not None and new_q is not None:
        if new_q > old_q * 1.2:
            move_dirs.append('up')
        elif new_q < old_q * 0.8:
            move_dirs.append('down')
        else:
            move_dirs.append('lateral')
    else:
        move_dirs.append('unknown')
move_directions['direction'] = move_dirs

# Merge direction into panel
dir_map = dict(zip(
    zip(move_directions['inventor_id'], move_directions['move_year']),
    move_directions['direction']
))
panel['direction'] = [
    dir_map.get((row['inventor_id'], row['move_year']), 'unknown')
    for _, row in panel.iterrows()
]

dir_results = []
for direction in ['up', 'lateral', 'down']:
    for rel_year in range(-5, 6):
        subset = panel[(panel['relative_year'] == rel_year) & (panel['direction'] == direction)]
        if len(subset) < 10:
            continue
        n = len(subset)
        mean_cites = float(subset['fwd_cite_5y'].mean())
        se = float(subset['fwd_cite_5y'].std() / np.sqrt(n))
        dir_results.append({
            'direction': direction,
            'relative_year': rel_year,
            'n_obs': n,
            'mean_fwd_cite_5y': round(mean_cites, 4),
            'ci_lower': round(mean_cites - 1.96 * se, 4),
            'ci_upper': round(mean_cites + 1.96 * se, 4),
        })

# Combine into final output
final = {
    'overall': results,
    'by_direction': dir_results,
    'summary': {
        'total_moves': int(move_count),
        'sampled_moves': int(sample_cnt),
        'panel_observations': len(panel),
    }
}
save_json(final, f"{OUT}/inventor_mobility_event_study.json")
print(f"  Direction analysis done in {time.time()-t0:.1f}s")

con.close()
print("\n=== 63_inventor_mobility_event complete ===\n")
