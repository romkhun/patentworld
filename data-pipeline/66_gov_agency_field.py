#!/usr/bin/env python3
"""
Government Agency × Technology Field — Analysis 7 for Chapter 1 (system-public-investment).

Join g_gov_interest_org with patent master to compute:
1. Agency × CPC section matrix (patent count, mean normalized citations, mean generality)
2. Agency breadth vs depth scatter

Output (to public/data/chapter1/):
  - gov_agency_field_matrix.json
  - gov_agency_breadth_depth.json
"""
import time
import duckdb
from config import (
    GOV_INTEREST_TSV, GOV_INTEREST_ORG_TSV,
    CPC_CURRENT_TSV, CITATION_TSV, PATENT_TSV,
    OUTPUT_DIR, save_json, timed_msg,
)

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/chapter1"
con = duckdb.connect()
con.execute("SET threads TO 38")

# ── Step 1: Join gov interest with master ─────────────────────────────────────
timed_msg("Step 1: Join gov_interest tables with patent master")
t0 = time.time()

# Check column names in gov_interest_org
cols = con.execute(f"SELECT * FROM {GOV_INTEREST_ORG_TSV()} LIMIT 0").description
col_names = [c[0] for c in cols]
print(f"  gov_interest_org columns: {col_names}")

# Determine the agency name column
agency_col = 'level_one' if 'level_one' in col_names else col_names[1]
print(f"  Using agency column: {agency_col}")

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE gov_patents AS
    SELECT DISTINCT
        gi.patent_id,
        gio.{agency_col} AS agency,
        m.grant_year,
        m.cpc_section,
        m.fwd_cite_5y,
        m.scope,
        m.n_cpc_sections
    FROM {GOV_INTEREST_TSV()} gi
    JOIN {GOV_INTEREST_ORG_TSV()} gio ON gi.patent_id = gio.patent_id
    JOIN '{MASTER}' m ON gi.patent_id = m.patent_id
    WHERE gio.{agency_col} IS NOT NULL
      AND TRIM(gio.{agency_col}) != ''
      AND m.cpc_section IS NOT NULL
""")
cnt = con.execute("SELECT COUNT(*) FROM gov_patents").fetchone()[0]
print(f"  gov_patents: {cnt:,} rows in {time.time()-t0:.1f}s")

# ── Step 2: Compute cohort means for normalization ────────────────────────────
timed_msg("Step 2: Cohort means for normalization")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE cohort_mean AS
    SELECT grant_year, cpc_section, AVG(fwd_cite_5y) AS cm
    FROM '{MASTER}'
    WHERE grant_year BETWEEN 1976 AND 2020 AND cpc_section IS NOT NULL
    GROUP BY grant_year, cpc_section
""")
print(f"  Cohort means done in {time.time()-t0:.1f}s")

# ── Step 3: Generality for gov patents ────────────────────────────────────────
timed_msg("Step 3: Generality index for gov-funded patents")
t0 = time.time()

con.execute(f"""
    CREATE OR REPLACE TEMPORARY TABLE gov_generality AS
    WITH fwd_sections AS (
        SELECT
            c.citation_patent_id AS patent_id,
            LEFT(cpc.cpc_section, 1) AS section,
            COUNT(*) AS cnt
        FROM {CITATION_TSV()} c
        JOIN {CPC_CURRENT_TSV()} cpc ON c.patent_id = cpc.patent_id AND cpc.cpc_sequence = 0
        WHERE c.citation_patent_id IN (SELECT DISTINCT patent_id FROM gov_patents)
        GROUP BY c.citation_patent_id, LEFT(cpc.cpc_section, 1)
    ),
    fwd_hhi AS (
        SELECT
            patent_id,
            1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2)) AS generality
        FROM (
            SELECT fs.patent_id, fs.section, fs.cnt,
                   SUM(fs.cnt) OVER (PARTITION BY fs.patent_id) AS total
            FROM fwd_sections fs
        ) sub
        WHERE total >= 2
        GROUP BY patent_id
    )
    SELECT patent_id, generality FROM fwd_hhi
""")
print(f"  Generality done in {time.time()-t0:.1f}s")

# ── Output 1: Agency × CPC section matrix ────────────────────────────────────
timed_msg("Output 1: Agency × field matrix")
t0 = time.time()

# Top 15 agencies by patent count
top_agencies = con.execute("""
    SELECT agency, COUNT(DISTINCT patent_id) AS total
    FROM gov_patents
    GROUP BY agency
    ORDER BY total DESC
    LIMIT 15
""").fetchdf()
agency_list = top_agencies['agency'].tolist()
agency_sql = ','.join(f"'{a.replace(chr(39), chr(39)+chr(39))}'" for a in agency_list)

matrix = con.execute(f"""
    SELECT
        gp.agency,
        gp.cpc_section AS section,
        COUNT(DISTINCT gp.patent_id) AS patent_count,
        ROUND(AVG(CASE WHEN cm.cm > 0 AND gp.grant_year <= 2020
                       THEN gp.fwd_cite_5y / cm.cm ELSE NULL END), 4) AS mean_norm_citations,
        ROUND(AVG(gg.generality), 4) AS mean_generality
    FROM gov_patents gp
    LEFT JOIN cohort_mean cm ON gp.grant_year = cm.grant_year AND gp.cpc_section = cm.cpc_section
    LEFT JOIN gov_generality gg ON gp.patent_id = gg.patent_id
    WHERE gp.agency IN ({agency_sql})
      AND gp.cpc_section NOT IN ('Y', 'D')
    GROUP BY gp.agency, gp.cpc_section
    ORDER BY gp.agency, gp.cpc_section
""").fetchdf()
save_json(matrix.to_dict(orient="records"), f"{OUT}/gov_agency_field_matrix.json")
print(f"  Matrix done in {time.time()-t0:.1f}s")

# ── Output 2: Agency breadth vs depth scatter ─────────────────────────────────
timed_msg("Output 2: Agency breadth vs depth scatter")
t0 = time.time()

scatter = con.execute(f"""
    WITH agency_stats AS (
        SELECT
            gp.agency,
            COUNT(DISTINCT gp.patent_id) AS total_patents,
            COUNT(DISTINCT gp.cpc_section) AS n_sections,
            -- Breadth = 1 - HHI of CPC section distribution
            1.0 - SUM(POWER(section_share, 2)) AS breadth
        FROM (
            SELECT
                agency,
                cpc_section,
                CAST(COUNT(DISTINCT patent_id) AS DOUBLE) /
                    SUM(COUNT(DISTINCT patent_id)) OVER (PARTITION BY agency) AS section_share,
                patent_id
            FROM gov_patents
            WHERE cpc_section NOT IN ('Y', 'D')
            GROUP BY agency, cpc_section, patent_id
        ) gp
        GROUP BY gp.agency
    ),
    agency_quality AS (
        SELECT
            gp.agency,
            ROUND(AVG(CASE WHEN cm.cm > 0 AND gp.grant_year <= 2020
                            THEN gp.fwd_cite_5y / cm.cm ELSE NULL END), 4) AS mean_norm_citations
        FROM gov_patents gp
        LEFT JOIN cohort_mean cm ON gp.grant_year = cm.grant_year AND gp.cpc_section = cm.cpc_section
        GROUP BY gp.agency
    )
    SELECT
        a.agency,
        a.total_patents,
        a.n_sections,
        ROUND(a.breadth, 4) AS breadth,
        aq.mean_norm_citations AS depth
    FROM agency_stats a
    JOIN agency_quality aq ON a.agency = aq.agency
    WHERE a.total_patents >= 50
    ORDER BY a.total_patents DESC
""").fetchdf()
save_json(scatter.to_dict(orient="records"), f"{OUT}/gov_agency_breadth_depth.json")
print(f"  Breadth/depth done in {time.time()-t0:.1f}s")

con.close()
print("\n=== 66_gov_agency_field complete ===\n")
