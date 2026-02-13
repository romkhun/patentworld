#!/usr/bin/env python3
"""
Design Patents and Claims Analyses — two datasets in one script.

Generates:
  company/design_patents.json   (E1: Design vs Utility patent trends + top filers)
  company/claims_analysis.json  (E2: Claims trends, by CPC section, claim monsters)
"""
import sys
import time
import os
import orjson
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV, INVENTOR_TSV,
    LOCATION_TSV, CITATION_TSV, APPLICATION_TSV,
    OUTPUT_DIR, CPC_SECTION_NAMES, query_to_json, save_json, timed_msg, tsv_table,
)

def log(msg):
    print(msg, flush=True)

con = duckdb.connect()


# =============================================================================
# E1: Design vs Utility Patents
# =============================================================================
timed_msg("E1: Design vs Utility Patents — trends and top filers")

t0 = time.time()

# Step 1: Count patents by type per year
log("  Querying patent counts by type and year...")
trends_df = con.execute(f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        SUM(CASE WHEN p.patent_type = 'utility' THEN 1 ELSE 0 END) AS utility_count,
        SUM(CASE WHEN p.patent_type = 'design' THEN 1 ELSE 0 END) AS design_count
    FROM {PATENT_TSV()} p
    WHERE p.patent_type IN ('utility', 'design')
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""").fetchdf()
log(f"  Trends query done in {time.time()-t0:.1f}s ({len(trends_df):,} rows)")

trends = []
for _, row in trends_df.iterrows():
    utility = int(row["utility_count"])
    design = int(row["design_count"])
    total = utility + design
    trends.append({
        "year": int(row["year"]),
        "utility_count": utility,
        "design_count": design,
        "design_share": round(100.0 * design / total, 2) if total > 0 else 0,
    })

# Step 2: Top 20 design patent filers (all time)
log("  Querying top 20 design patent filers...")
t1 = time.time()
top_filers_df = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        COUNT(DISTINCT p.patent_id) AS design_patents
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'design'
      AND p.patent_date IS NOT NULL
      AND a.disambig_assignee_organization IS NOT NULL
      AND TRIM(a.disambig_assignee_organization) != ''
    GROUP BY organization
    ORDER BY design_patents DESC
    LIMIT 20
""").fetchdf()
log(f"  Top filers query done in {time.time()-t1:.1f}s")

# Load company name mapping for display names
mapping_path = f"{OUTPUT_DIR}/company/company_name_mapping.json"
company_map = {}
if os.path.exists(mapping_path):
    with open(mapping_path, "rb") as f:
        company_map = orjson.loads(f.read())
    log(f"  Loaded company name mapping ({len(company_map)} entries)")
else:
    log("  WARNING: company_name_mapping.json not found, using raw names")

top_filers = []
for _, row in top_filers_df.iterrows():
    raw_name = row["organization"]
    display_name = company_map.get(raw_name, raw_name)
    top_filers.append({
        "company": display_name,
        "design_patents": int(row["design_patents"]),
    })

result_e1 = {"trends": trends, "top_filers": top_filers}
save_json(result_e1, f"{OUTPUT_DIR}/company/design_patents.json")
log(f"  E1 complete in {time.time()-t0:.1f}s total")


# =============================================================================
# E2: Claims Analysis
# =============================================================================
timed_msg("E2: Claims Analysis — trends, by CPC section, and claim monsters")

t0 = time.time()

# Step 1: Per-year claims statistics (utility patents only)
log("  Querying per-year claims statistics...")
claims_trends_df = con.execute(f"""
    SELECT
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.num_claims) AS median_claims,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY p.num_claims) AS p90_claims,
        ROUND(AVG(p.num_claims), 2) AS avg_claims
    FROM {PATENT_TSV()} p
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND p.num_claims IS NOT NULL
      AND p.num_claims > 0
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY year
    ORDER BY year
""").fetchdf()
log(f"  Claims trends query done in {time.time()-t0:.1f}s ({len(claims_trends_df):,} rows)")

claims_trends = []
for _, row in claims_trends_df.iterrows():
    claims_trends.append({
        "year": int(row["year"]),
        "median_claims": round(float(row["median_claims"]), 1),
        "p90_claims": round(float(row["p90_claims"]), 1),
        "avg_claims": round(float(row["avg_claims"]), 2),
    })

# Step 2: Claims by CPC section per decade
log("  Querying claims by CPC section per decade...")
t1 = time.time()
by_section_df = con.execute(f"""
    SELECT
        FLOOR(YEAR(CAST(p.patent_date AS DATE)) / 10) * 10 AS decade,
        c.cpc_section AS section,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.num_claims) AS median_claims,
        ROUND(AVG(p.num_claims), 2) AS avg_claims
    FROM {PATENT_TSV()} p
    JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND p.num_claims IS NOT NULL
      AND p.num_claims > 0
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
    GROUP BY decade, section
    ORDER BY decade, section
""").fetchdf()
log(f"  By-section query done in {time.time()-t1:.1f}s ({len(by_section_df):,} rows)")

by_section = []
for _, row in by_section_df.iterrows():
    by_section.append({
        "decade": int(row["decade"]),
        "section": row["section"],
        "median_claims": round(float(row["median_claims"]), 1),
        "avg_claims": round(float(row["avg_claims"]), 2),
    })

# Step 3: Top 20 "claim monsters" — patents with highest claim counts
log("  Querying top 20 claim monsters...")
t2 = time.time()
monsters_df = con.execute(f"""
    SELECT
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        p.num_claims AS claims,
        c.cpc_section AS section,
        a.disambig_assignee_organization AS assignee
    FROM {PATENT_TSV()} p
    LEFT JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
    LEFT JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND p.num_claims IS NOT NULL
    ORDER BY p.num_claims DESC
    LIMIT 20
""").fetchdf()
log(f"  Claim monsters query done in {time.time()-t2:.1f}s")

claim_monsters = []
for _, row in monsters_df.iterrows():
    raw_assignee = row["assignee"]
    display_assignee = company_map.get(raw_assignee, raw_assignee) if raw_assignee else None
    claim_monsters.append({
        "patent_id": str(row["patent_id"]),
        "year": int(row["year"]) if row["year"] is not None else None,
        "claims": int(row["claims"]),
        "section": row["section"] if row["section"] is not None else None,
        "assignee": display_assignee,
    })

result_e2 = {
    "trends": claims_trends,
    "by_section": by_section,
    "claim_monsters": claim_monsters,
}
save_json(result_e2, f"{OUTPUT_DIR}/company/claims_analysis.json")
log(f"  E2 complete in {time.time()-t0:.1f}s total")


# =============================================================================
# Done
# =============================================================================
timed_msg("All design patents and claims analyses complete!")
con.close()
