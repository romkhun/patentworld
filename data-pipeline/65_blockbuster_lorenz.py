#!/usr/bin/env python3
"""
Blockbuster Lorenz Curves — Analysis 6 for Chapter 2 (org-patent-count).

Per decade: define blockbusters (top 1% fwd_cite_5y within grant_year × cpc_section).
Compute firm-level Lorenz curves for patent counts vs blockbuster counts.
Gini coefficients.

Output: public/data/chapter2/blockbuster_lorenz.json
"""
import time
import numpy as np
import duckdb
from config import OUTPUT_DIR, save_json, timed_msg

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter2"
con = duckdb.connect()
con.execute("SET threads TO 38")

# ── Step 1: Identify blockbusters ─────────────────────────────────────────────
timed_msg("Step 1: Identify blockbuster patents (top 1% fwd_cite_5y by year × section)")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE patents_ranked AS
    SELECT
        patent_id,
        grant_year,
        cpc_section,
        fwd_cite_5y,
        primary_assignee_org,
        PERCENT_RANK() OVER (PARTITION BY grant_year, cpc_section ORDER BY fwd_cite_5y) AS pctl,
        CASE
            WHEN grant_year < 1990 THEN '1976-1989'
            WHEN grant_year < 2000 THEN '1990-1999'
            WHEN grant_year < 2010 THEN '2000-2009'
            ELSE '2010-2020'
        END AS decade
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1976 AND 2020
      AND cpc_section IS NOT NULL
      AND cpc_section NOT IN ('Y')
      AND primary_assignee_org IS NOT NULL
      AND TRIM(primary_assignee_org) != ''
""")
cnt = con.execute("SELECT COUNT(*) FROM patents_ranked").fetchone()[0]
blockbuster_cnt = con.execute("SELECT COUNT(*) FROM patents_ranked WHERE pctl >= 0.99").fetchone()[0]
print(f"  {cnt:,} patents, {blockbuster_cnt:,} blockbusters in {time.time()-t0:.1f}s")

# ── Step 2: Firm-level patent + blockbuster counts per decade ─────────────────
timed_msg("Step 2: Firm-level aggregation by decade")
t0 = time.time()

firm_decade = con.execute("""
    SELECT
        decade,
        primary_assignee_org AS firm,
        COUNT(*) AS patent_count,
        SUM(CASE WHEN pctl >= 0.99 THEN 1 ELSE 0 END) AS blockbuster_count
    FROM patents_ranked
    GROUP BY decade, primary_assignee_org
    ORDER BY decade, patent_count DESC
""").fetchdf()
print(f"  {len(firm_decade):,} firm-decade rows in {time.time()-t0:.1f}s")

# ── Step 3: Compute Lorenz curves and Gini coefficients ───────────────────────
timed_msg("Step 3: Lorenz curves and Gini coefficients")
t0 = time.time()

def compute_lorenz_gini(patents, blockbusters, n_points=50):
    """Compute Lorenz curve points and Gini coefficient."""
    # Sort firms by patent count (ascending)
    order = np.argsort(patents)
    p_sorted = patents[order]
    b_sorted = blockbusters[order]

    cum_patents = np.cumsum(p_sorted)
    cum_blockbusters = np.cumsum(b_sorted)

    total_patents = cum_patents[-1]
    total_blockbusters = cum_blockbusters[-1] if cum_blockbusters[-1] > 0 else 1

    # Normalize
    x = cum_patents / total_patents  # cumulative share of patents
    y = cum_blockbusters / total_blockbusters  # cumulative share of blockbusters

    # Prepend origin
    x = np.concatenate([[0], x])
    y = np.concatenate([[0], y])

    # Gini via trapezoidal rule
    gini = 1 - 2 * np.trapz(y, x)

    # Sample n_points for output
    indices = np.linspace(0, len(x) - 1, n_points).astype(int)
    lorenz_points = [
        {'cum_patent_share': round(float(x[i]), 4), 'cum_blockbuster_share': round(float(y[i]), 4)}
        for i in indices
    ]
    return lorenz_points, float(gini)

results = []
decades = sorted(firm_decade['decade'].unique())

for decade in decades:
    sub = firm_decade[firm_decade['decade'] == decade]
    patents = sub['patent_count'].values.astype(float)
    blockbusters = sub['blockbuster_count'].values.astype(float)

    lorenz, gini = compute_lorenz_gini(patents, blockbusters)

    results.append({
        'decade': decade,
        'n_firms': len(sub),
        'total_patents': int(patents.sum()),
        'total_blockbusters': int(blockbusters.sum()),
        'gini': round(gini, 4),
        'lorenz': lorenz,
    })

save_json(results, f"{OUT}/blockbuster_lorenz.json")
print(f"  Lorenz/Gini done in {time.time()-t0:.1f}s")

con.close()
print("\n=== 65_blockbuster_lorenz complete ===\n")
