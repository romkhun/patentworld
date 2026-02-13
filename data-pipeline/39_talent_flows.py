#!/usr/bin/env python3
"""
Talent Flows (F1) and Corporate Speed (F4) in one script.

F1 — Talent Flows: Track inventor movements between assignees (top 50 companies).
     Uses DuckDB LAG() window function to detect when an inventor's consecutive
     patents belong to different companies (gap <= 5 years = same career).
     Output formatted for a Sankey diagram: nodes [{name, net_flow}],
     links [{source, target, value}].

F4 — Corporate Speed: Average and median grant lag (days from filing to grant)
     per company per year for the top 50 assignees.

Generates:
  company/talent_flows.json
  company/corporate_speed.json
"""
import sys
import time
import json
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

# Register top 50 as a temp table for efficient filtering
con.execute("CREATE TEMPORARY TABLE top50 AS SELECT unnest($1::VARCHAR[]) AS org", [top50_orgs])


# =============================================================================
# F1: Talent Flows — Inventor movements between top 50 assignees
# =============================================================================
timed_msg("F1: Talent Flows — inventor movements between companies")

t0 = time.time()

# Step 1: Build inventor-year-assignee table for inventors who have patents
# at top-50 companies, then use LAG() to find previous assignee.
flow_df = con.execute(f"""
    WITH inventor_assignments AS (
        -- For each inventor-patent, get the year and the primary assignee org
        SELECT
            i.inventor_id,
            YEAR(CAST(p.patent_date AS DATE)) AS year,
            a.disambig_assignee_organization AS organization,
            p.patent_date
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IN (SELECT org FROM top50)
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    inventor_seq AS (
        -- Use LAG() to get the previous assignee for each inventor
        SELECT
            inventor_id,
            organization,
            year,
            LAG(organization) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_organization,
            LAG(year) OVER (PARTITION BY inventor_id ORDER BY patent_date) AS prev_year
        FROM inventor_assignments
    ),
    transitions AS (
        -- Keep only actual company changes within a 5-year career gap
        SELECT
            prev_organization AS from_org,
            organization AS to_org,
            inventor_id
        FROM inventor_seq
        WHERE prev_organization IS NOT NULL
          AND prev_organization != organization
          AND (year - prev_year) <= 5
    )
    SELECT
        from_org,
        to_org,
        COUNT(DISTINCT inventor_id) AS inventor_count
    FROM transitions
    GROUP BY from_org, to_org
    ORDER BY inventor_count DESC
""").fetchdf()

log(f"  Talent flow query done in {time.time()-t0:.1f}s ({len(flow_df):,} flows)")

# Build Sankey nodes and links
# Collect all organisations that appear in flows
all_orgs_in_flows = set(flow_df['from_org'].tolist() + flow_df['to_org'].tolist())

# Compute net flow per org: inflows - outflows
from collections import defaultdict
net_flow = defaultdict(int)
for _, row in flow_df.iterrows():
    net_flow[row['from_org']] -= int(row['inventor_count'])
    net_flow[row['to_org']] += int(row['inventor_count'])

# Build node list (sorted by display name for deterministic order)
org_list = sorted(all_orgs_in_flows, key=lambda o: display_name(o))
org_to_idx = {org: idx for idx, org in enumerate(org_list)}

nodes = [
    {"name": display_name(org), "net_flow": net_flow.get(org, 0)}
    for org in org_list
]

links = [
    {
        "source": org_to_idx[row['from_org']],
        "target": org_to_idx[row['to_org']],
        "value": int(row['inventor_count']),
    }
    for _, row in flow_df.iterrows()
    if row['from_org'] in org_to_idx and row['to_org'] in org_to_idx
]

talent_flows_data = {"nodes": nodes, "links": links}
save_json(talent_flows_data, f"{OUTPUT_DIR}/company/talent_flows.json")
log(f"  {len(nodes)} nodes, {len(links)} links")


# =============================================================================
# F4: Corporate Speed — Grant lag per assignee per year
# =============================================================================
timed_msg("F4: Corporate Speed — grant lag per company per year")

t0 = time.time()
speed_df = con.execute(f"""
    SELECT
        a.disambig_assignee_organization AS organization,
        YEAR(CAST(p.patent_date AS DATE)) AS year,
        ROUND(AVG(
            DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE))
        ), 1) AS avg_grant_lag_days,
        ROUND(CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY
            DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE))
        ) AS DOUBLE), 1) AS median_grant_lag_days,
        COUNT(DISTINCT p.patent_id) AS patent_count
    FROM {PATENT_TSV()} p
    JOIN {APPLICATION_TSV()} app ON p.patent_id = app.patent_id
    JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND app.filing_date IS NOT NULL
      AND a.disambig_assignee_organization IN (SELECT org FROM top50)
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE)) > 0
      AND DATEDIFF('day', CAST(app.filing_date AS DATE), CAST(p.patent_date AS DATE)) < 10000
    GROUP BY organization, year
    HAVING patent_count >= 5
    ORDER BY organization, year
""").fetchdf()

log(f"  Corporate speed query done in {time.time()-t0:.1f}s ({len(speed_df):,} rows)")

# Convert to records with clean company names
speed_records = []
for _, row in speed_df.iterrows():
    speed_records.append({
        "company": display_name(row['organization']),
        "year": int(row['year']),
        "avg_grant_lag_days": float(row['avg_grant_lag_days']),
        "median_grant_lag_days": float(row['median_grant_lag_days']),
        "patent_count": int(row['patent_count']),
    })

save_json(speed_records, f"{OUTPUT_DIR}/company/corporate_speed.json")

con.close()
log("\n=== 39_talent_flows complete ===\n")
