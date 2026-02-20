#!/usr/bin/env python3
"""
ACT 6 Cross-Domain Comparison — builds overview data for all 12 deep-dive domains.

Uses patent_master.parquet + g_cpc_current to compute:
  1. act6_comparison.json   — per-domain summary (total, recent 5yr, CAGR, share, quality)
  2. act6_timeseries.json   — annual patent counts per domain (for small-multiples)
  3. act6_quality.json      — quality metrics per domain (citations, claims, scope, team)
  4. act6_spillover.json    — co-classification lift between domain pairs

Generates → public/data/act6/
"""
import duckdb
import math
from config import CPC_CURRENT_TSV, OUTPUT_DIR, save_json, timed_msg, query_to_json

MASTER = "/tmp/patentview/patent_master.parquet"
OUT = f"{OUTPUT_DIR}/act6"

# ── Domain CPC filters (same as scripts 47-57 + AI from 12) ───────────────────
DOMAINS = {
    "3D Printing":   {"slug": "3dprint",  "filter": "(cpc_subclass = 'B33Y' OR cpc_group LIKE 'B33Y%' OR cpc_group LIKE 'B29C64%' OR cpc_group LIKE 'B22F10%')"},
    "AgTech":        {"slug": "agtech",   "filter": "(cpc_subclass IN ('A01B','A01C','A01G','A01H') OR cpc_group LIKE 'G06Q50/02%')"},
    "AI":            {"slug": "ai",       "filter": "(cpc_group LIKE 'G06N%' OR cpc_group LIKE 'G06F18%' OR cpc_subclass = 'G06V' OR cpc_group LIKE 'G10L15%' OR cpc_group LIKE 'G06F40%')"},
    "AV":            {"slug": "av",       "filter": "(cpc_group LIKE 'B60W60%' OR cpc_group LIKE 'G05D1%' OR cpc_group LIKE 'G06V20/56%')"},
    "Biotech":       {"slug": "biotech",  "filter": "(cpc_group LIKE 'C12N15%' OR cpc_group LIKE 'C12N9%' OR cpc_group LIKE 'C12Q1/68%')"},
    "Blockchain":    {"slug": "blockchain","filter": "(cpc_group LIKE 'H04L9/0643%' OR cpc_group LIKE 'G06Q20/0655%')"},
    "Cyber":         {"slug": "cyber",    "filter": "(cpc_group LIKE 'G06F21%' OR cpc_group LIKE 'H04L9%' OR cpc_group LIKE 'H04L63%')"},
    "DigiHealth":    {"slug": "digihealth","filter": "(cpc_group LIKE 'A61B5%' OR cpc_subclass = 'G16H' OR cpc_group LIKE 'A61B34%')"},
    "Green":         {"slug": "green",    "filter": "(cpc_subclass LIKE 'Y02%' OR cpc_subclass LIKE 'Y04S%' OR cpc_group LIKE 'Y02%' OR cpc_group LIKE 'Y04S%')"},
    "Quantum":       {"slug": "quantum",  "filter": "(cpc_group LIKE 'G06N10%' OR cpc_group LIKE 'H01L39%')"},
    "Semiconductor": {"slug": "semi",     "filter": "(cpc_subclass IN ('H01L','H10N','H10K'))"},
    "Space":         {"slug": "space",    "filter": "(cpc_subclass = 'B64G' OR cpc_group LIKE 'H04B7/185%')"},
}

con = duckdb.connect()
con.execute("SET threads TO 38")
con.execute("SET memory_limit = '200GB'")

# ── Step 0: Build domain patent sets ──────────────────────────────────────────
timed_msg("Building domain patent sets")
for name, info in DOMAINS.items():
    slug = info["slug"]
    filt = info["filter"]
    con.execute(f"""
        CREATE OR REPLACE TEMPORARY TABLE dom_{slug} AS
        SELECT DISTINCT patent_id FROM {CPC_CURRENT_TSV()} WHERE {filt}
    """)
    cnt = con.execute(f"SELECT COUNT(*) FROM dom_{slug}").fetchone()[0]
    print(f"  {name}: {cnt:,} patents")

# ── Step 1: Domain summaries (comparison.json) ────────────────────────────────
timed_msg("Computing domain summaries")
rows = []
for name, info in DOMAINS.items():
    slug = info["slug"]
    r = con.execute(f"""
        WITH dm AS (
            SELECT m.patent_id, m.grant_year, m.fwd_cite_5y, m.num_claims, m.scope, m.team_size
            FROM '{MASTER}' m
            JOIN dom_{slug} d ON m.patent_id = d.patent_id
        ),
        total_count AS (SELECT COUNT(*) AS n FROM dm),
        recent AS (SELECT COUNT(*) AS n FROM dm WHERE grant_year BETWEEN 2020 AND 2024),
        yr_range AS (
            SELECT MIN(grant_year) AS y0, MAX(grant_year) AS y1,
                   COUNT(*) FILTER (WHERE grant_year BETWEEN 2015 AND 2019) AS n_early,
                   COUNT(*) FILTER (WHERE grant_year BETWEEN 2020 AND 2024) AS n_late
            FROM dm WHERE grant_year >= 2015
        ),
        latest AS (
            SELECT COUNT(*) AS domain_n FROM dm WHERE grant_year = 2024
        ),
        total_system AS (
            SELECT COUNT(*) AS sys_n FROM '{MASTER}' WHERE grant_year = 2024
        ),
        quality AS (
            SELECT
                ROUND(AVG(fwd_cite_5y), 2) AS mean_citations,
                ROUND(AVG(num_claims), 2) AS mean_claims,
                ROUND(AVG(scope), 2) AS mean_scope,
                ROUND(AVG(team_size), 2) AS mean_team_size
            FROM dm WHERE grant_year BETWEEN 2015 AND 2024
        )
        SELECT
            tc.n AS total_patents,
            r.n AS recent_5yr,
            CASE WHEN yr.n_early > 0
                 THEN ROUND(POWER(CAST(yr.n_late AS DOUBLE) / yr.n_early, 0.2) - 1, 4)
                 ELSE NULL END AS cagr_5yr,
            CASE WHEN ts.sys_n > 0
                 THEN ROUND(100.0 * lt.domain_n / ts.sys_n, 3)
                 ELSE NULL END AS share_2024,
            q.mean_citations, q.mean_claims, q.mean_scope, q.mean_team_size
        FROM total_count tc, recent r, yr_range yr, latest lt, total_system ts, quality q
    """).fetchone()

    rows.append({
        "domain": name,
        "slug": slug,
        "total_patents": r[0],
        "recent_5yr": r[1],
        "cagr_5yr": r[2],
        "share_2024": r[3],
        "mean_citations": r[4],
        "mean_claims": r[5],
        "mean_scope": r[6],
        "mean_team_size": r[7],
    })

save_json(rows, f"{OUT}/act6_comparison.json")

# ── Step 2: Time series per domain ────────────────────────────────────────────
timed_msg("Computing annual time series per domain")
ts_rows = []
for name, info in DOMAINS.items():
    slug = info["slug"]
    result = con.execute(f"""
        SELECT m.grant_year AS year, COUNT(*) AS count
        FROM '{MASTER}' m
        JOIN dom_{slug} d ON m.patent_id = d.patent_id
        WHERE m.grant_year BETWEEN 1976 AND 2025
        GROUP BY m.grant_year
        ORDER BY m.grant_year
    """).fetchall()
    for yr, cnt in result:
        ts_rows.append({"domain": name, "slug": slug, "year": yr, "count": cnt})

save_json(ts_rows, f"{OUT}/act6_timeseries.json")

# ── Step 3: Quality metrics per domain per 5-year period ─────────────────────
timed_msg("Computing quality metrics by period")
quality_rows = []
for name, info in DOMAINS.items():
    slug = info["slug"]
    result = con.execute(f"""
        SELECT
            FLOOR(m.grant_year / 5) * 5 AS period,
            COUNT(*) AS patent_count,
            ROUND(AVG(m.fwd_cite_5y), 2) AS mean_citations,
            ROUND(AVG(m.num_claims), 2) AS mean_claims,
            ROUND(AVG(m.scope), 2) AS mean_scope,
            ROUND(AVG(m.team_size), 2) AS mean_team_size
        FROM '{MASTER}' m
        JOIN dom_{slug} d ON m.patent_id = d.patent_id
        WHERE m.grant_year BETWEEN 1990 AND 2024
        GROUP BY period
        ORDER BY period
    """).fetchall()
    for row in result:
        quality_rows.append({
            "domain": name, "slug": slug,
            "period": int(row[0]), "patent_count": row[1],
            "mean_citations": row[2], "mean_claims": row[3],
            "mean_scope": row[4], "mean_team_size": row[5],
        })

save_json(quality_rows, f"{OUT}/act6_quality.json")

# ── Step 4: Co-classification spillover (lift matrix) ─────────────────────────
timed_msg("Computing co-classification spillover matrix")

# Get total patent count in master
total_patents = con.execute(f"SELECT COUNT(*) FROM '{MASTER}'").fetchone()[0]

# Domain sizes
domain_sizes = {}
for name, info in DOMAINS.items():
    slug = info["slug"]
    n = con.execute(f"""
        SELECT COUNT(*) FROM '{MASTER}' m JOIN dom_{slug} d ON m.patent_id = d.patent_id
    """).fetchone()[0]
    domain_sizes[name] = n

# Pairwise co-occurrence
domain_names = list(DOMAINS.keys())
spillover_rows = []

for i in range(len(domain_names)):
    for j in range(i + 1, len(domain_names)):
        a_name = domain_names[i]
        b_name = domain_names[j]
        a_slug = DOMAINS[a_name]["slug"]
        b_slug = DOMAINS[b_name]["slug"]

        observed = con.execute(f"""
            SELECT COUNT(*) FROM dom_{a_slug} a JOIN dom_{b_slug} b ON a.patent_id = b.patent_id
        """).fetchone()[0]

        expected = (domain_sizes[a_name] * domain_sizes[b_name]) / total_patents if total_patents > 0 else 0
        lift = observed / expected if expected > 0 else 0

        spillover_rows.append({
            "domain_a": a_name,
            "domain_b": b_name,
            "observed": observed,
            "expected": round(expected, 1),
            "lift": round(lift, 3),
        })

save_json(spillover_rows, f"{OUT}/act6_spillover.json")

con.close()
print("\n=== 72_act6_cross_domain complete ===\n")
