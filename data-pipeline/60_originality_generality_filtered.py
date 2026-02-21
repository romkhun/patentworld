#!/usr/bin/env python3
"""
Originality & Generality at multiple citation thresholds.

Recomputes originality (1 - HHI of backward citation CPC sections) and
generality (1 - HHI of forward citation CPC sections) at three thresholds:
  - All patents (no filter)
  - >=5 citations
  - >=10 citations

Output: public/data/computed/originality_generality_filtered.json
"""
import time
import duckdb
from config import (
    PATENT_TSV, CPC_CURRENT_TSV, CITATION_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

OUT = f"{OUTPUT_DIR}/computed"
con = duckdb.connect()
con.execute("SET threads TO 38")

MASTER = "/tmp/patentview/patent_master.parquet"

# ── Step 1: Patent year table ─────────────────────────────────────────────────
timed_msg("Step 1: Build patent year lookup")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE patent_year AS
    SELECT patent_id, grant_year AS year
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1976 AND 2025
""")
print(f"  patent_year done in {time.time()-t0:.1f}s")

# ── Step 2: Backward section counts (originality) ─────────────────────────────
timed_msg("Step 2: Backward citation section counts for originality")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE bwd_sections AS
    SELECT
        c.patent_id,
        LEFT(cpc.cpc_section, 1) AS section,
        COUNT(*) AS cnt
    FROM {CITATION_TSV()} c
    JOIN {CPC_CURRENT_TSV()} cpc ON c.citation_patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
    GROUP BY c.patent_id, LEFT(cpc.cpc_section, 1)
""")

con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE bwd_hhi AS
    SELECT
        patent_id,
        SUM(cnt) AS total_bwd,
        SUM(POWER(CAST(cnt AS DOUBLE) / total, 2)) AS hhi
    FROM (
        SELECT bs.patent_id, bs.section, bs.cnt,
               SUM(bs.cnt) OVER (PARTITION BY bs.patent_id) AS total
        FROM bwd_sections bs
    ) sub
    WHERE total >= 2
    GROUP BY patent_id
""")
print(f"  bwd_hhi done in {time.time()-t0:.1f}s")

# ── Step 3: Forward section counts (generality) ───────────────────────────────
timed_msg("Step 3: Forward citation section counts for generality")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE fwd_sections AS
    SELECT
        c.citation_patent_id AS patent_id,
        LEFT(cpc.cpc_section, 1) AS section,
        COUNT(*) AS cnt
    FROM {CITATION_TSV()} c
    JOIN {CPC_CURRENT_TSV()} cpc ON c.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
    GROUP BY c.citation_patent_id, LEFT(cpc.cpc_section, 1)
""")

con.execute("""
    CREATE OR REPLACE TEMPORARY TABLE fwd_hhi AS
    SELECT
        patent_id,
        SUM(cnt) AS total_fwd,
        SUM(POWER(CAST(cnt AS DOUBLE) / total, 2)) AS hhi
    FROM (
        SELECT fs.patent_id, fs.section, fs.cnt,
               SUM(fs.cnt) OVER (PARTITION BY fs.patent_id) AS total
        FROM fwd_sections fs
    ) sub
    WHERE total >= 2
    GROUP BY patent_id
""")
print(f"  fwd_hhi done in {time.time()-t0:.1f}s")

# ── Step 4: Compute at each threshold ─────────────────────────────────────────
timed_msg("Step 4: Aggregate originality/generality at 3 thresholds")
t0 = time.time()

results = []
for threshold in [0, 5, 10]:
    label = "all" if threshold == 0 else f"gte{threshold}"

    bwd_filter = f"AND bh.total_bwd >= {threshold}" if threshold > 0 else ""
    fwd_filter = f"AND fh.total_fwd >= {threshold}" if threshold > 0 else ""

    df = con.execute(f"""
        WITH orig AS (
            SELECT
                py.year,
                ROUND(AVG(1.0 - bh.hhi), 4) AS avg_originality,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 1.0 - bh.hhi), 4) AS median_originality,
                COUNT(*) AS n_patents
            FROM patent_year py
            JOIN bwd_hhi bh ON py.patent_id = bh.patent_id
            WHERE 1=1 {bwd_filter}
            GROUP BY py.year
        ),
        gen AS (
            SELECT
                py.year,
                ROUND(AVG(1.0 - fh.hhi), 4) AS avg_generality,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 1.0 - fh.hhi), 4) AS median_generality,
                COUNT(*) AS n_patents
            FROM patent_year py
            JOIN fwd_hhi fh ON py.patent_id = fh.patent_id
            WHERE py.year <= 2020 {fwd_filter}
            GROUP BY py.year
        )
        SELECT
            COALESCE(o.year, g.year) AS year,
            o.avg_originality,
            o.median_originality,
            o.n_patents AS n_originality,
            g.avg_generality,
            g.median_generality,
            g.n_patents AS n_generality
        FROM orig o
        FULL OUTER JOIN gen g ON o.year = g.year
        ORDER BY year
    """).fetchdf()

    import pandas as pd
    for _, row in df.iterrows():
        results.append({
            "year": int(row["year"]),
            "threshold": label,
            "avg_originality": float(row["avg_originality"]) if pd.notna(row["avg_originality"]) else None,
            "median_originality": float(row["median_originality"]) if pd.notna(row["median_originality"]) else None,
            "n_originality": int(row["n_originality"]) if pd.notna(row["n_originality"]) else None,
            "avg_generality": float(row["avg_generality"]) if pd.notna(row["avg_generality"]) else None,
            "median_generality": float(row["median_generality"]) if pd.notna(row["median_generality"]) else None,
            "n_generality": int(row["n_generality"]) if pd.notna(row["n_generality"]) else None,
        })

save_json(results, f"{OUT}/originality_generality_filtered.json")
print(f"  Done in {time.time()-t0:.1f}s ({len(results)} rows)")

con.close()
print("\n=== 60_originality_generality_filtered complete ===\n")
