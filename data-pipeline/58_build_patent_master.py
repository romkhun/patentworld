#!/usr/bin/env python3
"""
Build Patent Master Parquet — single patent-level fact table for downstream analyses.

Joins g_patent, g_cpc_current, g_inventor_disambiguated, g_assignee_disambiguated,
g_application, g_location_disambiguated, and g_us_patent_citation into one wide table.

Output: /tmp/patentview/patent_master.parquet  (~9.3M rows × 20 cols)
"""
import time
import duckdb
from config import (
    PATENT_TSV, APPLICATION_TSV, CPC_CURRENT_TSV, CITATION_TSV,
    INVENTOR_TSV, ASSIGNEE_TSV, LOCATION_TSV,
    timed_msg,
)

MASTER_PATH = "/tmp/patentview/patent_master.parquet"
con = duckdb.connect()
con.execute("SET threads TO 38")
con.execute("SET memory_limit = '200GB'")

# ── Step 1: Base patent table ─────────────────────────────────────────────────
timed_msg("Step 1: Build base patent table (utility patents 1976-2025)")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE base AS
    SELECT
        p.patent_id,
        CAST(p.patent_date AS DATE) AS grant_date,
        YEAR(CAST(p.patent_date AS DATE)) AS grant_year,
        p.num_claims
    FROM {PATENT_TSV()} p
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND CAST(p.patent_date AS DATE) >= DATE '1976-01-01'
      AND CAST(p.patent_date AS DATE) <= DATE '2025-12-31'
""")
cnt = con.execute("SELECT COUNT(*) FROM base").fetchone()[0]
print(f"  base: {cnt:,} rows in {time.time()-t0:.1f}s")

# ── Step 2: Primary CPC section + scope ───────────────────────────────────────
timed_msg("Step 2: CPC section, scope, n_sections")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE cpc_agg AS
    SELECT
        patent_id,
        MIN(CASE WHEN cpc_sequence = 0 THEN cpc_section END) AS cpc_section,
        COUNT(DISTINCT cpc_subclass) AS scope,
        COUNT(DISTINCT cpc_section) AS n_cpc_sections
    FROM {CPC_CURRENT_TSV()}
    GROUP BY patent_id
""")
print(f"  cpc_agg done in {time.time()-t0:.1f}s")

# ── Step 3: Team size ─────────────────────────────────────────────────────────
timed_msg("Step 3: Team size from inventor table")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE team AS
    SELECT patent_id, COUNT(DISTINCT inventor_id) AS team_size
    FROM {INVENTOR_TSV()}
    GROUP BY patent_id
""")
print(f"  team done in {time.time()-t0:.1f}s")

# ── Step 4: Primary assignee ──────────────────────────────────────────────────
timed_msg("Step 4: Primary assignee (sequence=0)")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE assignee AS
    SELECT
        patent_id,
        disambig_assignee_organization AS primary_assignee_org,
        assignee_id AS primary_assignee_id
    FROM {ASSIGNEE_TSV()}
    WHERE assignee_sequence = 0
""")
print(f"  assignee done in {time.time()-t0:.1f}s")

# ── Step 5: First inventor location + gender ──────────────────────────────────
timed_msg("Step 5: First inventor location + gender")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE inv_loc AS
    SELECT
        i.patent_id,
        i.gender_code,
        l.disambig_state,
        l.disambig_country
    FROM {INVENTOR_TSV()} i
    LEFT JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
    WHERE i.inventor_sequence = 0
""")
print(f"  inv_loc done in {time.time()-t0:.1f}s")

# ── Step 6: Grant lag from application ────────────────────────────────────────
timed_msg("Step 6: Grant lag days")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE lag AS
    SELECT
        a.patent_id,
        DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) AS grant_lag_days
    FROM {APPLICATION_TSV()} a
    JOIN {PATENT_TSV()} p ON a.patent_id = p.patent_id
    WHERE a.filing_date IS NOT NULL
      AND p.patent_date IS NOT NULL
      AND CAST(a.filing_date AS DATE) >= DATE '1900-01-01'
""")
print(f"  lag done in {time.time()-t0:.1f}s")

# ── Step 7: Forward citations (total + 5-year window) ─────────────────────────
timed_msg("Step 7: Forward citations (total + 5-year window) — this is the slow join")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE fwd_cites AS
    SELECT
        c.citation_patent_id AS patent_id,
        COUNT(*) AS forward_citations,
        SUM(CASE
            WHEN DATEDIFF('day', CAST(cited.patent_date AS DATE),
                                  CAST(citing.patent_date AS DATE)) <= 1826
            THEN 1 ELSE 0
        END) AS fwd_cite_5y
    FROM {CITATION_TSV()} c
    JOIN {PATENT_TSV()} citing ON c.patent_id = citing.patent_id
    JOIN {PATENT_TSV()} cited ON c.citation_patent_id = cited.patent_id
    WHERE citing.patent_date IS NOT NULL AND cited.patent_date IS NOT NULL
    GROUP BY c.citation_patent_id
""")
print(f"  fwd_cites done in {time.time()-t0:.1f}s")

# ── Step 8: Backward citations ────────────────────────────────────────────────
timed_msg("Step 8: Backward citation count")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE bwd_cites AS
    SELECT patent_id, COUNT(*) AS backward_citations
    FROM {CITATION_TSV()}
    GROUP BY patent_id
""")
print(f"  bwd_cites done in {time.time()-t0:.1f}s")

# ── Step 9: Join everything and write parquet ─────────────────────────────────
timed_msg("Step 9: Final join → parquet")
t0 = time.time()

con.execute(f"""
    COPY (
        SELECT
            b.patent_id,
            b.grant_date,
            b.grant_year,
            b.num_claims,
            ca.cpc_section,
            ca.scope,
            ca.n_cpc_sections,
            CASE WHEN ca.n_cpc_sections > 1 THEN TRUE ELSE FALSE END AS is_multi_section,
            COALESCE(t.team_size, 1) AS team_size,
            CASE
                WHEN COALESCE(t.team_size, 1) = 1 THEN 'Solo'
                WHEN COALESCE(t.team_size, 1) <= 3 THEN '2-3'
                WHEN COALESCE(t.team_size, 1) <= 6 THEN '4-6'
                ELSE '7+'
            END AS team_size_cat,
            a.primary_assignee_id,
            a.primary_assignee_org,
            il.disambig_state,
            il.disambig_country,
            il.gender_code,
            COALESCE(fc.fwd_cite_5y, 0) AS fwd_cite_5y,
            COALESCE(fc.forward_citations, 0) AS forward_citations,
            COALESCE(bc.backward_citations, 0) AS backward_citations,
            COALESCE(lg.grant_lag_days, 0) AS grant_lag_days
        FROM base b
        LEFT JOIN cpc_agg ca ON b.patent_id = ca.patent_id
        LEFT JOIN team t ON b.patent_id = t.patent_id
        LEFT JOIN assignee a ON b.patent_id = a.patent_id
        LEFT JOIN inv_loc il ON b.patent_id = il.patent_id
        LEFT JOIN fwd_cites fc ON b.patent_id = fc.patent_id
        LEFT JOIN bwd_cites bc ON b.patent_id = bc.patent_id
        LEFT JOIN lag lg ON b.patent_id = lg.patent_id
    ) TO '{MASTER_PATH}' (FORMAT PARQUET, COMPRESSION ZSTD)
""")
final_cnt = con.execute(f"SELECT COUNT(*) FROM '{MASTER_PATH}'").fetchone()[0]
print(f"  Wrote {final_cnt:,} rows to {MASTER_PATH} in {time.time()-t0:.1f}s")

import os
size_mb = os.path.getsize(MASTER_PATH) / (1024 * 1024)
print(f"  File size: {size_mb:,.1f} MB")

con.close()
print("\n=== 58_build_patent_master complete ===\n")
