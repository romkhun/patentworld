#!/usr/bin/env python3
"""
68: Sleeping Beauty × Half-Life by CPC Section — Section 13b

For each CPC section, compute:
  - Sleeping beauty rate: % of patents with <2 citations in first 3 years but ≥10 total
  - Citation half-life: median years until 50% of total citations accumulated
Uses citation data joined with patent master.

Output: public/data/computed/sleeping_beauty_halflife.json
"""
import time
import duckdb
from config import CITATION_TSV, PATENT_TSV, CPC_CURRENT_TSV, OUTPUT_DIR, save_json, timed_msg, CPC_SECTION_NAMES

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/computed"
con = duckdb.connect()
con.execute("SET threads TO 38")

timed_msg("Step 1: Build citation-year table")
t0 = time.time()

# Build citing patent grant years
con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE cite_years AS
    SELECT
        c.citation_patent_id AS cited_patent_id,
        m_cited.grant_year AS cited_year,
        m_cited.cpc_section,
        m_citing.grant_year AS citing_year,
        m_citing.grant_year - m_cited.grant_year AS cite_lag
    FROM {CITATION_TSV()} c
    JOIN '{MASTER}' m_cited ON c.citation_patent_id = m_cited.patent_id
    JOIN '{MASTER}' m_citing ON c.patent_id = m_citing.patent_id
    WHERE m_cited.grant_year BETWEEN 1980 AND 2015
      AND m_cited.cpc_section IS NOT NULL
      AND m_cited.cpc_section != 'Y'
      AND m_citing.grant_year >= m_cited.grant_year
""")
print(f"  cite_years built in {time.time()-t0:.1f}s")

timed_msg("Step 2: Sleeping beauty rate by CPC section")
t0 = time.time()

# Sleeping beauty: <2 cites in first 3 years, ≥10 total
sb = con.execute("""
    WITH patent_cites AS (
        SELECT
            cited_patent_id,
            cpc_section,
            SUM(CASE WHEN cite_lag <= 3 THEN 1 ELSE 0 END) AS early_cites,
            COUNT(*) AS total_cites
        FROM cite_years
        GROUP BY cited_patent_id, cpc_section
    )
    SELECT
        cpc_section,
        COUNT(*) AS total_patents,
        SUM(CASE WHEN early_cites <= 2 AND total_cites >= 10 THEN 1 ELSE 0 END) AS sleeping_beauties,
        ROUND(100.0 * SUM(CASE WHEN early_cites <= 2 AND total_cites >= 10 THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*), 0), 3) AS sb_rate_pct
    FROM patent_cites
    GROUP BY cpc_section
    ORDER BY cpc_section
""").fetchdf()
print(f"  Sleeping beauty done in {time.time()-t0:.1f}s")

timed_msg("Step 3: Citation half-life by CPC section")
t0 = time.time()

# Median half-life: median of (year at which 50% of citations accumulated)
hl = con.execute("""
    WITH cumulative AS (
        SELECT
            cited_patent_id,
            cpc_section,
            cite_lag,
            COUNT(*) AS cites_at_lag,
            SUM(COUNT(*)) OVER (PARTITION BY cited_patent_id ORDER BY cite_lag) AS cum_cites,
            SUM(COUNT(*)) OVER (PARTITION BY cited_patent_id) AS total_cites
        FROM cite_years
        GROUP BY cited_patent_id, cpc_section, cite_lag
    ),
    half_life_per_patent AS (
        SELECT
            cited_patent_id,
            cpc_section,
            MIN(cite_lag) AS half_life_years
        FROM cumulative
        WHERE cum_cites >= total_cites * 0.5
          AND total_cites >= 5
        GROUP BY cited_patent_id, cpc_section
    )
    SELECT
        cpc_section,
        ROUND(AVG(half_life_years), 2) AS mean_half_life,
        ROUND(MEDIAN(half_life_years), 2) AS median_half_life,
        COUNT(*) AS n_patents
    FROM half_life_per_patent
    GROUP BY cpc_section
    ORDER BY cpc_section
""").fetchdf()
print(f"  Half-life done in {time.time()-t0:.1f}s")

# Merge
timed_msg("Step 4: Merge and output")
merged = sb.merge(hl, on="cpc_section", how="left")
merged["section_name"] = merged["cpc_section"].map(CPC_SECTION_NAMES)
records = merged.to_dict(orient="records")
save_json(records, f"{OUT}/sleeping_beauty_halflife.json")

con.close()
print("\n=== 68_sleeping_beauty_halflife complete ===\n")
