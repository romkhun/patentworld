#!/usr/bin/env python3
"""
Portfolio Overlap (F2) and Strategy Profiles (F3) in one script.

F2 — Portfolio Overlap: For top 50 assignees per decade, compute CPC subclass
     distribution vectors, pairwise cosine similarity, and UMAP 2D projection.
     Each company gets an industry label based on its dominant CPC section.

F3 — Strategy Profiles: 8-dimension radar chart for top 30 assignees.
     Dimensions: breadth, depth, defensiveness, influence, science_intensity,
     speed, collaboration, freshness.  Each min-max normalized to 0-100.

Generates:
  company/portfolio_overlap.json
  company/strategy_profiles.json
"""
import sys
import time
import json
import numpy as np
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV, INVENTOR_TSV,
    LOCATION_TSV, CITATION_TSV, APPLICATION_TSV,
    OUTPUT_DIR, CPC_SECTION_NAMES, query_to_json, save_json, timed_msg, tsv_table,
)


def log(msg):
    print(msg, flush=True)


con = duckdb.connect()

# ── Load company name mapping ────────────────────────────────────────────────
mapping_path = f"{OUTPUT_DIR}/company/company_name_mapping.json"
with open(mapping_path, "r") as f:
    COMPANY_MAP = json.load(f)
log(f"  Loaded {len(COMPANY_MAP)} company name mappings from {mapping_path}")


def display_name(raw_org):
    """Return the clean display name for a raw organisation string."""
    return COMPANY_MAP.get(raw_org, raw_org)


# ── Identify top 50 assignees by utility-patent count ────────────────────────
timed_msg("Identifying top 50 assignees")

t0 = time.time()
top50_rows = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT p.patent_id) AS total
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a
        ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY organization
    ORDER BY total DESC
    LIMIT 50
""").fetchall()
top50_orgs = [row[0] for row in top50_rows]
log(f"  Top 50 assignees identified in {time.time()-t0:.1f}s")

# Register top 50 as a temp table
con.execute("CREATE TEMPORARY TABLE top50 AS SELECT unnest($1::VARCHAR[]) AS org", [top50_orgs])


# =============================================================================
# F2: Portfolio Overlap — UMAP projection of patent portfolio similarity
# =============================================================================
timed_msg("F2: Portfolio Overlap — CPC subclass vectors + cosine similarity + UMAP")

t0 = time.time()

# Step 1: Get CPC subclass counts per assignee per decade
subclass_df = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        CAST(FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS INTEGER) AS decade,
        c.cpc_subclass,
        COUNT(DISTINCT p.patent_id) AS cnt
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top50)
      AND c.cpc_subclass IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY organization, decade, cpc_subclass
""").fetchdf()

log(f"  Subclass distribution query done in {time.time()-t0:.1f}s ({len(subclass_df):,} rows)")

# Step 2: Also get dominant CPC section per org-decade for industry labelling
section_df = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        CAST(FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS INTEGER) AS decade,
        c.cpc_section,
        COUNT(DISTINCT p.patent_id) AS cnt
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top50)
      AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY organization, decade, cpc_section
    ORDER BY organization, decade, cnt DESC
""").fetchdf()

# Get top CPC subclass per org-decade for the top_cpc field
top_subclass_df = con.execute(f"""
    WITH ranked AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            CAST(FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS INTEGER) AS decade,
            c.cpc_subclass,
            COUNT(DISTINCT p.patent_id) AS cnt,
            ROW_NUMBER() OVER (
                PARTITION BY a.disambig_assignee_organization,
                             CAST(FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS INTEGER)
                ORDER BY COUNT(DISTINCT p.patent_id) DESC
            ) AS rn
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top50)
          AND c.cpc_subclass IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY organization, decade, cpc_subclass
    )
    SELECT organization, decade, cpc_subclass
    FROM ranked
    WHERE rn = 1
""").fetchdf()

# Build lookup: (org, decade) -> top subclass
top_subclass_map = {}
for _, row in top_subclass_df.iterrows():
    top_subclass_map[(row['organization'], int(row['decade']))] = row['cpc_subclass']

# Build lookup: (org, decade) -> dominant section
dominant_section_map = {}
for _, row in section_df.iterrows():
    key = (row['organization'], int(row['decade']))
    if key not in dominant_section_map:
        dominant_section_map[key] = row['cpc_section']  # first row is highest count

# Industry assignment heuristic
def assign_industry(dominant_section, top_subclass):
    """Assign an industry label based on dominant CPC section and top subclass."""
    if dominant_section == 'H':
        if top_subclass and top_subclass.startswith('H01L'):
            return 'Semiconductor'
        return 'Electronics'
    elif dominant_section == 'A':
        return 'Pharma / Biotech'
    elif dominant_section == 'B':
        # Could be automotive or industrial
        if top_subclass and top_subclass.startswith('B60'):
            return 'Automotive'
        return 'Industrial / Conglomerate'
    elif dominant_section == 'G':
        return 'Technology'
    elif dominant_section == 'C':
        return 'Chemicals / Materials'
    elif dominant_section == 'F':
        return 'Mechanical Engineering'
    elif dominant_section == 'D':
        return 'Textiles / Paper'
    elif dominant_section == 'E':
        return 'Construction'
    else:
        return 'Other'


# Step 3: Build feature vectors per (org, decade)
# Collect all unique subclasses
all_subclasses = sorted(subclass_df['cpc_subclass'].unique())
subclass_to_idx = {sc: i for i, sc in enumerate(all_subclasses)}
n_features = len(all_subclasses)
log(f"  {n_features} unique CPC subclasses as features")

# Group by (org, decade) and build vectors
from collections import defaultdict
vectors = defaultdict(lambda: np.zeros(n_features))
for _, row in subclass_df.iterrows():
    key = (row['organization'], int(row['decade']))
    idx = subclass_to_idx[row['cpc_subclass']]
    vectors[key][idx] = float(row['cnt'])

# Normalize to proportions
for key in vectors:
    total = vectors[key].sum()
    if total > 0:
        vectors[key] = vectors[key] / total

# Step 4: Per decade, compute UMAP projection
import umap

decades = sorted(set(d for (_, d) in vectors.keys()))
overlap_records = []

for decade in decades:
    # Collect orgs that have data in this decade
    decade_orgs = [org for (org, d) in vectors.keys() if d == decade]
    if len(decade_orgs) < 5:
        log(f"  Skipping decade {decade}: only {len(decade_orgs)} companies")
        continue

    # Build matrix
    matrix = np.array([vectors[(org, decade)] for org in decade_orgs])

    # Compute pairwise cosine similarity (for reference — UMAP handles distances internally)
    # Run UMAP
    n_neighbors = min(10, len(decade_orgs) - 1)
    reducer = umap.UMAP(
        n_components=2,
        n_neighbors=n_neighbors,
        min_dist=0.3,
        metric='cosine',
        random_state=42,
    )
    embedding = reducer.fit_transform(matrix)

    for i, org in enumerate(decade_orgs):
        dom_section = dominant_section_map.get((org, decade), 'G')
        top_cpc = top_subclass_map.get((org, decade), '')
        industry = assign_industry(dom_section, top_cpc)

        overlap_records.append({
            "company": display_name(org),
            "x": round(float(embedding[i, 0]), 4),
            "y": round(float(embedding[i, 1]), 4),
            "industry": industry,
            "decade": decade,
            "top_cpc": top_cpc,
        })

    log(f"  Decade {decade}: {len(decade_orgs)} companies projected")

save_json(overlap_records, f"{OUTPUT_DIR}/company/portfolio_overlap.json")
log(f"  Total: {len(overlap_records)} company-decade records")


# =============================================================================
# F3: Strategy Profiles — 8-dimension radar chart for top 30 assignees
# =============================================================================
timed_msg("F3: Strategy Profiles — 8 dimensions for top 30 assignees")

top30_orgs = top50_orgs[:30]
con.execute("CREATE OR REPLACE TEMPORARY TABLE top30 AS SELECT unnest($1::VARCHAR[]) AS org", [top30_orgs])

# ── Dimension 1: Breadth — number of distinct CPC subclasses ─────────────────
timed_msg("  Dim 1: Breadth (distinct CPC subclasses)")
t0 = time.time()
breadth_df = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT c.cpc_subclass) AS n_subclasses
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top30)
      AND c.cpc_subclass IS NOT NULL
    GROUP BY organization
""").fetchdf()
breadth_map = dict(zip(breadth_df['organization'], breadth_df['n_subclasses'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 2: Depth — HHI of CPC distribution (inverted) ─────────────────
timed_msg("  Dim 2: Depth (HHI concentration, inverted)")
t0 = time.time()
depth_df = con.execute(f"""
    WITH org_subclass AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            c.cpc_subclass,
            COUNT(DISTINCT p.patent_id) AS cnt
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top30)
          AND c.cpc_subclass IS NOT NULL
        GROUP BY organization, cpc_subclass
    ),
    org_total AS (
        SELECT organization, SUM(cnt) AS total
        FROM org_subclass
        GROUP BY organization
    ),
    hhi AS (
        SELECT
            os.organization,
            SUM(POWER(CAST(os.cnt AS DOUBLE) / ot.total, 2)) AS hhi_value
        FROM org_subclass os
        JOIN org_total ot ON os.organization = ot.organization
        GROUP BY os.organization
    )
    SELECT organization, hhi_value FROM hhi
""").fetchdf()
# Higher HHI = more concentrated = higher depth
depth_map = dict(zip(depth_df['organization'], depth_df['hhi_value'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 3: Defensiveness — self-citation rate ──────────────────────────
timed_msg("  Dim 3: Defensiveness (self-citation rate)")
t0 = time.time()
defense_df = con.execute(f"""
    WITH cite_pairs AS (
        SELECT
            cit.patent_id AS citing_id,
            a1.disambig_assignee_organization AS citing_org,
            a2.disambig_assignee_organization AS cited_org
        FROM {CITATION_TSV()} cit
        JOIN {ASSIGNEE_TSV()} a1 ON cit.patent_id = a1.patent_id AND a1.assignee_sequence = 0
        JOIN {ASSIGNEE_TSV()} a2 ON cit.citation_patent_id = a2.patent_id AND a2.assignee_sequence = 0
        WHERE a1.disambig_assignee_organization IN (SELECT org FROM top30)
    )
    SELECT
        citing_org AS organization,
        COUNT(*) AS total_citations,
        SUM(CASE WHEN citing_org = cited_org THEN 1 ELSE 0 END) AS self_citations,
        ROUND(100.0 * SUM(CASE WHEN citing_org = cited_org THEN 1 ELSE 0 END) / COUNT(*), 4) AS self_cite_rate
    FROM cite_pairs
    GROUP BY citing_org
""").fetchdf()
defense_map = dict(zip(defense_df['organization'], defense_df['self_cite_rate'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 4: Influence — avg forward citations received ──────────────────
timed_msg("  Dim 4: Influence (avg forward citations)")
t0 = time.time()
influence_df = con.execute(f"""
    WITH firm_patents AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            p.patent_id
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top30)
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2020
    ),
    fwd AS (
        SELECT
            fp.organization,
            fp.patent_id,
            COUNT(c.patent_id) AS fwd_citations
        FROM firm_patents fp
        LEFT JOIN {CITATION_TSV()} c ON fp.patent_id = c.citation_patent_id
        GROUP BY fp.organization, fp.patent_id
    )
    SELECT
        organization,
        ROUND(AVG(fwd_citations), 4) AS avg_fwd_citations
    FROM fwd
    GROUP BY organization
""").fetchdf()
influence_map = dict(zip(influence_df['organization'], influence_df['avg_fwd_citations'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 5: Science Intensity — avg backward citations per patent ───────
timed_msg("  Dim 5: Science Intensity (avg backward citations)")
t0 = time.time()
science_df = con.execute(f"""
    WITH firm_patents AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            p.patent_id
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top30)
    ),
    bwd AS (
        SELECT
            fp.organization,
            fp.patent_id,
            COUNT(c.citation_patent_id) AS bwd_citations
        FROM firm_patents fp
        LEFT JOIN {CITATION_TSV()} c ON fp.patent_id = c.patent_id
        GROUP BY fp.organization, fp.patent_id
    )
    SELECT
        organization,
        ROUND(AVG(bwd_citations), 4) AS avg_bwd_citations
    FROM bwd
    GROUP BY organization
""").fetchdf()
science_map = dict(zip(science_df['organization'], science_df['avg_bwd_citations'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 6: Speed — inverse of median grant lag ─────────────────────────
timed_msg("  Dim 6: Speed (inverse median grant lag)")
t0 = time.time()
speed_df = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY
            DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE))
        ) AS DOUBLE) AS median_lag
    FROM {PATENT_TSV()} p
    JOIN {APPLICATION_TSV()} app ON p.patent_id = app.patent_id
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND app.filing_date IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top30)
      AND DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE)) > 0
      AND DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE)) < 10000
    GROUP BY organization
""").fetchdf()
# Inverse: lower lag = higher speed.  Use 1/median_lag (will normalize later)
speed_map = {}
for _, row in speed_df.iterrows():
    lag = float(row['median_lag'])
    speed_map[row['organization']] = 1.0 / lag if lag > 0 else 0.0
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 7: Collaboration — avg team size ──────────────────────────────
timed_msg("  Dim 7: Collaboration (avg team size)")
t0 = time.time()
collab_df = con.execute(f"""
    WITH team_sizes AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            p.patent_id,
            COUNT(DISTINCT i.inventor_id) AS team_size
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top30)
        GROUP BY organization, p.patent_id
    )
    SELECT
        organization,
        ROUND(AVG(team_size), 4) AS avg_team_size
    FROM team_sizes
    GROUP BY organization
""").fetchdf()
collab_map = dict(zip(collab_df['organization'], collab_df['avg_team_size'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Dimension 8: Freshness — share of first-time inventors ──────────────────
timed_msg("  Dim 8: Freshness (share of first-time inventors)")
t0 = time.time()
freshness_df = con.execute(f"""
    WITH inventor_first_year AS (
        SELECT
            i.inventor_id,
            MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
        GROUP BY i.inventor_id
    ),
    org_inventors AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            i.inventor_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        JOIN {INVENTOR_TSV()} i ON p.patent_id = i.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top30)
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 2015 AND 2025
    ),
    org_inventor_status AS (
        SELECT
            oi.organization,
            oi.inventor_id,
            oi.year,
            CASE WHEN oi.year = ify.first_year THEN 1 ELSE 0 END AS is_first_time
        FROM org_inventors oi
        JOIN inventor_first_year ify ON oi.inventor_id = ify.inventor_id
    )
    SELECT
        organization,
        COUNT(DISTINCT inventor_id) AS total_inventors,
        COUNT(DISTINCT CASE WHEN is_first_time = 1 THEN inventor_id END) AS first_time_inventors,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN is_first_time = 1 THEN inventor_id END)
              / COUNT(DISTINCT inventor_id), 4) AS first_time_pct
    FROM org_inventor_status
    GROUP BY organization
""").fetchdf()
freshness_map = dict(zip(freshness_df['organization'], freshness_df['first_time_pct'].astype(float)))
log(f"    Done in {time.time()-t0:.1f}s")

# ── Assemble & Normalize ────────────────────────────────────────────────────
timed_msg("  Assembling and normalizing profiles")

# Collect raw values for all 8 dimensions
raw_profiles = []
for org in top30_orgs:
    raw_profiles.append({
        "organization": org,
        "breadth": breadth_map.get(org, 0),
        "depth": depth_map.get(org, 0),
        "defensiveness": defense_map.get(org, 0),
        "influence": influence_map.get(org, 0),
        "science_intensity": science_map.get(org, 0),
        "speed": speed_map.get(org, 0),
        "collaboration": collab_map.get(org, 0),
        "freshness": freshness_map.get(org, 0),
    })

dimensions = ["breadth", "depth", "defensiveness", "influence",
              "science_intensity", "speed", "collaboration", "freshness"]

# Min-max normalize each dimension to 0-100
for dim in dimensions:
    values = [p[dim] for p in raw_profiles]
    min_val = min(values)
    max_val = max(values)
    rng = max_val - min_val if max_val > min_val else 1.0
    for p in raw_profiles:
        p[dim] = round(100.0 * (p[dim] - min_val) / rng, 1)

# Build final output with clean company names
strategy_records = []
for p in raw_profiles:
    strategy_records.append({
        "company": display_name(p["organization"]),
        "breadth": p["breadth"],
        "depth": p["depth"],
        "defensiveness": p["defensiveness"],
        "influence": p["influence"],
        "science_intensity": p["science_intensity"],
        "speed": p["speed"],
        "collaboration": p["collaboration"],
        "freshness": p["freshness"],
    })

save_json(strategy_records, f"{OUTPUT_DIR}/company/strategy_profiles.json")
log(f"  {len(strategy_records)} company strategy profiles saved")

con.close()
log("\n=== 40_portfolio_strategy_profiles complete ===\n")
