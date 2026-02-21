#!/usr/bin/env python3
"""
Exploration–Exploitation Trajectory — Analysis 3 for Chapter 5 (mech-organizations).

For top-10 firms × 5-year periods: self-citation rate + exploration index
(cosine distance from trailing CPC subclass centroid).

Reuses composite exploration scores from script 42 output.

Output: public/data/chapter5/exploration_exploitation_trajectory.json
"""
import json
import time
import math
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter5"
con = duckdb.connect()
con.execute("SET threads TO 38")

# ── Step 1: Load existing exploration scores if available ─────────────────────
timed_msg("Step 1: Load exploration data and identify top firms")
t0 = time.time()

# Identify top 10 firms by patent count in master
top10_rows = con.execute(f"""
    SELECT primary_assignee_org AS firm, COUNT(*) AS total
    FROM '{MASTER}'
    WHERE primary_assignee_org IS NOT NULL AND TRIM(primary_assignee_org) != ''
    GROUP BY primary_assignee_org
    ORDER BY total DESC
    LIMIT 10
""").fetchall()
top10_firms = [r[0] for r in top10_rows]
firm_sql = ','.join(f"'{f.replace(chr(39), chr(39)+chr(39))}'" for f in top10_firms)
print(f"  Top 10 firms identified in {time.time()-t0:.1f}s")

# ── Step 2: Build firm patent CPC vectors per 5-year period ───────────────────
timed_msg("Step 2: Build CPC subclass vectors per firm × 5-year period")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE firm_patents AS
    SELECT m.patent_id, m.grant_year, m.primary_assignee_org AS firm
    FROM '{MASTER}' m
    WHERE m.primary_assignee_org IN ({firm_sql})
      AND m.grant_year BETWEEN 1976 AND 2024
""")

# CPC subclass distribution per firm × period
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE firm_cpc AS
    SELECT
        fp.firm,
        FLOOR((fp.grant_year - 1976) / 5) * 5 + 1976 AS period_start,
        cpc.cpc_subclass,
        COUNT(*) AS cnt
    FROM firm_patents fp
    JOIN {CPC_CURRENT_TSV()} cpc ON fp.patent_id = cpc.patent_id
    GROUP BY fp.firm, period_start, cpc.cpc_subclass
""")
print(f"  firm_cpc done in {time.time()-t0:.1f}s")

# ── Step 3: Self-citation rate per firm × period ──────────────────────────────
timed_msg("Step 3: Self-citation rate per firm × period")
t0 = time.time()

self_cite = con.execute(f"""
    WITH cite_match AS (
        SELECT
            fp.firm,
            FLOOR((fp.grant_year - 1976) / 5) * 5 + 1976 AS period_start,
            c.patent_id,
            c.citation_patent_id,
            CASE WHEN a2.disambig_assignee_organization = fp.firm THEN 1 ELSE 0 END AS is_self
        FROM firm_patents fp
        JOIN {CITATION_TSV()} c ON fp.patent_id = c.patent_id
        LEFT JOIN {ASSIGNEE_TSV()} a2 ON c.citation_patent_id = a2.patent_id AND a2.assignee_sequence = 0
    )
    SELECT
        firm,
        period_start,
        ROUND(CAST(SUM(is_self) AS DOUBLE) / NULLIF(COUNT(*), 0), 4) AS self_citation_rate,
        COUNT(*) AS total_citations
    FROM cite_match
    GROUP BY firm, period_start
    ORDER BY firm, period_start
""").fetchdf()
print(f"  Self-citation done in {time.time()-t0:.1f}s")

# ── Step 4: Compute cosine distance from trailing period ──────────────────────
timed_msg("Step 4: Compute exploration index (cosine distance from prior CPC centroid)")
t0 = time.time()

# Pull CPC vectors into Python for cosine computation
cpc_df = con.execute("SELECT firm, period_start, cpc_subclass, cnt FROM firm_cpc ORDER BY firm, period_start").fetchdf()

# Build vectors per (firm, period)
from collections import defaultdict
vectors = defaultdict(lambda: defaultdict(int))
for _, row in cpc_df.iterrows():
    key = (row['firm'], int(row['period_start']))
    vectors[key][row['cpc_subclass']] += int(row['cnt'])

def cosine_dist(v1, v2):
    """Cosine distance between two sparse dicts."""
    all_keys = set(v1.keys()) | set(v2.keys())
    dot = sum(v1.get(k, 0) * v2.get(k, 0) for k in all_keys)
    mag1 = math.sqrt(sum(v ** 2 for v in v1.values()))
    mag2 = math.sqrt(sum(v ** 2 for v in v2.values()))
    if mag1 == 0 or mag2 == 0:
        return 1.0
    return 1.0 - dot / (mag1 * mag2)

# Compute trajectory points
trajectory = {}
for firm in top10_firms:
    periods = sorted(set(p for (f, p) in vectors.keys() if f == firm))
    firm_points = []
    for i, period in enumerate(periods):
        vec = vectors.get((firm, period), {})
        # Exploration = cosine distance from prior period
        if i > 0:
            prev_vec = vectors.get((firm, periods[i-1]), {})
            exploration = round(cosine_dist(prev_vec, vec), 4)
        else:
            exploration = None

        # Self-citation rate for this period
        sc_row = self_cite[(self_cite['firm'] == firm) & (self_cite['period_start'] == period)]
        sc_rate = float(sc_row['self_citation_rate'].iloc[0]) if len(sc_row) > 0 else None

        firm_points.append({
            'period': f"{period}-{period+4}",
            'period_start': period,
            'exploration_index': exploration,
            'self_citation_rate': sc_rate,
            'exploitation_index': round(1.0 - exploration, 4) if exploration is not None else None,
        })
    trajectory[firm] = firm_points

save_json(trajectory, f"{OUT}/exploration_exploitation_trajectory.json")
print(f"  Trajectories done in {time.time()-t0:.1f}s")

con.close()
print("\n=== 62_exploration_trajectory complete ===\n")
