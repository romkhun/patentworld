#!/usr/bin/env python3
"""
Trajectory Archetypes — classify top 200 assignees' innovation trajectories
using k-means clustering on normalized annual patent count time series.

Generates: company/trajectory_archetypes.json
"""
import sys
import time
import orjson
import numpy as np
import duckdb
from sklearn.cluster import KMeans
from config import (
    PATENT_TSV, ASSIGNEE_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)


def log(msg):
    print(msg, flush=True)


con = duckdb.connect()

# ── Load company name mapping ────────────────────────────────────────────────
timed_msg("Loading company name mapping")

mapping_path = f"{OUTPUT_DIR}/company/company_name_mapping.json"
with open(mapping_path, "rb") as f:
    NAME_MAP = orjson.loads(f.read())
log(f"  Loaded {len(NAME_MAP)} company name mappings")


def display_name(raw):
    """Convert raw assignee org name to display name."""
    return NAME_MAP.get(raw, raw)


# ═══════════════════════════════════════════════════════════════════════════════
# Step 1: Get annual patent counts for top 200 assignees (1976-2025)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 1: Annual patent counts for top 200 assignees")

YEAR_MIN = 1976
YEAR_MAX = 2025
N_YEARS = YEAR_MAX - YEAR_MIN + 1  # 50

t0 = time.time()
rows = con.execute(f"""
    WITH top200 AS (
        SELECT
            a.disambig_assignee_organization AS organization,
            COUNT(DISTINCT p.patent_id) AS total_patents
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a
            ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IS NOT NULL
          AND TRIM(a.disambig_assignee_organization) != ''
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN {YEAR_MIN} AND {YEAR_MAX}
        GROUP BY organization
        ORDER BY total_patents DESC
        LIMIT 200
    )
    SELECT
        a.disambig_assignee_organization AS organization,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        COUNT(DISTINCT p.patent_id) AS patent_count
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a
        ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN {YEAR_MIN} AND {YEAR_MAX}
      AND a.disambig_assignee_organization IN (SELECT organization FROM top200)
    GROUP BY organization, year
    ORDER BY organization, year
""").fetchall()
log(f"  Query done in {time.time()-t0:.1f}s ({len(rows):,} rows)")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 2: Build 50-element time series per company, normalize to % of peak
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 2: Building normalized time series")

# Organize into dict: org -> {year: count}
org_counts = {}
for org, year, count in rows:
    if org not in org_counts:
        org_counts[org] = {}
    org_counts[org][int(year)] = int(count)

# Build matrix: each row = 50-element series normalized to % of peak
orgs = sorted(org_counts.keys())
series_matrix = np.zeros((len(orgs), N_YEARS), dtype=np.float64)

org_metadata = {}  # org -> {peak_year, peak_count, current_count}
for idx, org in enumerate(orgs):
    counts = org_counts[org]
    raw_series = np.array([counts.get(y, 0) for y in range(YEAR_MIN, YEAR_MAX + 1)], dtype=np.float64)

    peak_val = raw_series.max()
    peak_year = int(YEAR_MIN + np.argmax(raw_series))
    current_count = int(raw_series[-1])

    # Normalize to % of peak (0-100)
    if peak_val > 0:
        normalized = (raw_series / peak_val) * 100.0
    else:
        normalized = raw_series

    series_matrix[idx] = normalized
    org_metadata[org] = {
        "peak_year": peak_year,
        "peak_count": int(peak_val),
        "current_count": current_count,
        "raw_series": raw_series,
        "normalized_series": normalized,
    }

log(f"  Built {len(orgs)} time series of length {N_YEARS}")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 3: K-Means clustering (6 clusters)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 3: K-Means clustering (k=6)")

N_CLUSTERS = 6
kmeans = KMeans(n_clusters=N_CLUSTERS, n_init=20, max_iter=500, random_state=42)
labels = kmeans.fit_predict(series_matrix)
centroids = kmeans.cluster_centers_

log(f"  Clustering complete. Inertia: {kmeans.inertia_:,.0f}")
for c in range(N_CLUSTERS):
    count = int((labels == c).sum())
    log(f"    Cluster {c}: {count} companies")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 4: Label clusters based on centroid shapes
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 4: Labeling clusters by centroid shape heuristics")

ARCHETYPE_LABELS = [
    "Steady Climber",
    "Boom & Bust",
    "Late Bloomer",
    "Fading Giant",
    "Volatile",
    "Plateau",
]


def classify_centroid(centroid):
    """
    Classify a centroid shape into an archetype label using heuristics.
    Centroid is a 50-element array (normalized 0-100).

    Uses peak position, tail value, variance, and trend to discriminate
    between six archetype shapes.
    """
    n = len(centroid)
    # Normalize to 0-1 for cleaner thresholds
    c = centroid / 100.0

    peak_idx = int(np.argmax(c))
    peak_pos = peak_idx / (n - 1)        # 0 = start, 1 = end
    peak_val = float(c[peak_idx])

    # Early / late averages (first and last quarter)
    early_avg = float(c[:n // 4].mean())
    late_avg = float(c[-(n // 4):].mean())
    tail_val = float(c[-5:].mean())       # last 5 years

    # Standard deviation as volatility measure
    std = float(c.std())

    # Slope of linear fit (overall trend)
    x = np.arange(n, dtype=float)
    slope = float(np.polyfit(x, c, 1)[0])

    # Slope of the tail portion (last quarter)
    tail_quarter = c[-(n // 4):]
    x_tail = np.arange(len(tail_quarter), dtype=float)
    tail_slope = float(np.polyfit(x_tail, tail_quarter, 1)[0])

    # ── Decision tree (ordered from most specific to least) ──

    # Steady Climber: ends high and generally increasing
    if tail_val > 0.7 and late_avg > early_avg:
        return "Steady Climber"

    # Late Bloomer: peak near the end, started low
    if peak_pos > 0.7 and early_avg < 0.2:
        return "Late Bloomer"

    # Fading Giant: peaked early/mid with a high peak, now very low
    if peak_pos < 0.5 and tail_val < 0.2 and peak_val > 0.7:
        return "Fading Giant"

    # Boom & Bust: peaked before the last third, tail is low
    if peak_pos < 0.6 and tail_val < 0.3:
        return "Boom & Bust"

    # Volatile: high variance without a clear directional trend
    if std > 0.25 and abs(late_avg - early_avg) < 0.2:
        return "Volatile"

    # Plateau: low variance, moderate tail value
    if std < 0.20 and 0.3 <= tail_val <= 0.7:
        return "Plateau"

    # ── Fallback tiebreakers ──
    if slope > 0:
        return "Steady Climber"
    if slope < 0 and tail_val < 0.3:
        return "Fading Giant"
    return "Plateau"


# Map each cluster index to an archetype
cluster_labels = {}
used_labels = set()
for c in range(N_CLUSTERS):
    label = classify_centroid(centroids[c])
    # Avoid duplicate labels: append cluster number if needed
    if label in used_labels:
        label = f"{label} ({c})"
    used_labels.add(label)
    cluster_labels[c] = label
    log(f"    Cluster {c} -> {label} (peak at idx {int(np.argmax(centroids[c]))})")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 5: Assemble output
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 5: Assembling output")

result = []
for idx, org in enumerate(orgs):
    meta = org_metadata[org]
    cluster_id = int(labels[idx])
    result.append({
        "company": display_name(org),
        "raw_name": org,
        "archetype": cluster_labels[cluster_id],
        "cluster_id": cluster_id,
        "normalized_series": [round(float(v), 1) for v in meta["normalized_series"]],
        "peak_year": meta["peak_year"],
        "peak_count": meta["peak_count"],
        "current_count": meta["current_count"],
    })

# Sort by peak_count descending
result.sort(key=lambda x: x["peak_count"], reverse=True)

log(f"  {len(result)} companies classified into {N_CLUSTERS} archetypes")

# Also include centroids for visualization
centroids_out = []
for c in range(N_CLUSTERS):
    centroids_out.append({
        "cluster_id": c,
        "archetype": cluster_labels[c],
        "centroid": [round(float(v), 1) for v in centroids[c]],
        "count": int((labels == c).sum()),
    })

output = {
    "year_min": YEAR_MIN,
    "year_max": YEAR_MAX,
    "companies": result,
    "centroids": centroids_out,
}

# ── Save ─────────────────────────────────────────────────────────────────────
out_path = f"{OUTPUT_DIR}/company/trajectory_archetypes.json"
save_json(output, out_path)

con.close()
log("\n=== 33_trajectory_archetypes complete ===\n")
