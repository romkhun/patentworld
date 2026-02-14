#!/usr/bin/env python3
"""
Company Profiles — per-year metrics for top 100 assignees.
Generates: company/company_profiles.json

For each company × year: patent_count, cpc_breadth, inventor_count,
avg_team_size, median_citations_5yr, top10_share, self_citation_rate,
avg_claims, intl_inventor_share, new_inventor_share, primary_cpc,
cpc_distribution.
"""
import sys
import time
import orjson
import duckdb
from config import (
    PATENT_TSV, ASSIGNEE_TSV, CPC_CURRENT_TSV, INVENTOR_TSV,
    LOCATION_TSV, CITATION_TSV,
    OUTPUT_DIR, CPC_SECTION_NAMES, save_json, timed_msg, tsv_table,
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
# Step 1: Identify top 100 assignees by total utility patent count (1976-2025)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 1: Top 100 assignees by utility-patent count")

t0 = time.time()
con.execute(f"""
    CREATE TEMPORARY TABLE top100 AS
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
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY organization
    ORDER BY total_patents DESC
    LIMIT 100
""")
log(f"  Top 100 identified in {time.time()-t0:.1f}s")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 2: Build base patent-year table for top 100
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 2: Base patent-year table for top 100 assignees")

t0 = time.time()
con.execute(f"""
    CREATE TEMPORARY TABLE base_patents AS
    SELECT
        a.disambig_assignee_organization AS organization,
        p.patent_id,
        YEAR(CAST(p.patent_date AS DATE)) AS grant_year,
        p.num_claims
    FROM {PATENT_TSV()} p
    JOIN {ASSIGNEE_TSV()} a
        ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
      AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
      AND a.disambig_assignee_organization IN (SELECT organization FROM top100)
""")
log(f"  Base patents table built in {time.time()-t0:.1f}s")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 3: Patent counts & avg claims per company-year
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 3: Patent counts and avg claims per company-year")

t0 = time.time()
basic_rows = con.execute("""
    SELECT
        organization,
        grant_year AS year,
        COUNT(*) AS patent_count,
        ROUND(AVG(num_claims), 2) AS avg_claims
    FROM base_patents
    GROUP BY organization, grant_year
    ORDER BY organization, grant_year
""").fetchall()
log(f"  Basic counts done in {time.time()-t0:.1f}s ({len(basic_rows):,} rows)")

# Build nested dict: org -> year -> {...}
profiles = {}
for org, year, patent_count, avg_claims in basic_rows:
    if org not in profiles:
        profiles[org] = {}
    profiles[org][year] = {
        "year": int(year),
        "patent_count": int(patent_count),
        "avg_claims": float(avg_claims) if avg_claims is not None else 0.0,
    }

# ═══════════════════════════════════════════════════════════════════════════════
# Step 4: CPC breadth, primary CPC, CPC distribution, top10 share
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 4: CPC metrics per company-year")

t0 = time.time()
cpc_rows = con.execute(f"""
    SELECT
        bp.organization,
        bp.grant_year AS year,
        c.cpc_section,
        COUNT(*) AS section_count
    FROM base_patents bp
    JOIN {CPC_CURRENT_TSV()} c ON bp.patent_id = c.patent_id AND c.cpc_sequence = 0
    GROUP BY bp.organization, bp.grant_year, c.cpc_section
    ORDER BY bp.organization, bp.grant_year, section_count DESC
""").fetchall()
log(f"  CPC section counts done in {time.time()-t0:.1f}s ({len(cpc_rows):,} rows)")

# Aggregate CPC metrics per org-year
cpc_by_org_year = {}  # org -> year -> {section: count}
for org, year, section, cnt in cpc_rows:
    key = (org, year)
    if key not in cpc_by_org_year:
        cpc_by_org_year[key] = {}
    if section:
        cpc_by_org_year[key][section] = int(cnt)

# Top 10 CPC subclasses per company-year for concentration metric
t0 = time.time()
subclass_rows = con.execute(f"""
    SELECT
        bp.organization,
        bp.grant_year AS year,
        c.cpc_subclass,
        COUNT(*) AS sc_count
    FROM base_patents bp
    JOIN {CPC_CURRENT_TSV()} c ON bp.patent_id = c.patent_id AND c.cpc_sequence = 0
    WHERE c.cpc_subclass IS NOT NULL
    GROUP BY bp.organization, bp.grant_year, c.cpc_subclass
    ORDER BY bp.organization, bp.grant_year, sc_count DESC
""").fetchall()
log(f"  CPC subclass counts done in {time.time()-t0:.1f}s ({len(subclass_rows):,} rows)")

# Compute top10_share per org-year
top10_share = {}  # (org, year) -> float
subclass_by_org_year = {}  # (org, year) -> [(subclass, count), ...]
for org, year, subclass, cnt in subclass_rows:
    key = (org, year)
    if key not in subclass_by_org_year:
        subclass_by_org_year[key] = []
    subclass_by_org_year[key].append(int(cnt))

for key, counts in subclass_by_org_year.items():
    counts.sort(reverse=True)
    total = sum(counts)
    top10_sum = sum(counts[:10])
    top10_share[key] = round(100.0 * top10_sum / total, 2) if total > 0 else 0.0

# Merge CPC metrics into profiles
for org in profiles:
    for year in profiles[org]:
        key = (org, year)
        cpc_dist = cpc_by_org_year.get(key, {})
        profiles[org][year]["cpc_breadth"] = len(cpc_dist)
        profiles[org][year]["cpc_distribution"] = cpc_dist
        # Primary CPC = section with highest count
        if cpc_dist:
            primary = max(cpc_dist, key=cpc_dist.get)
            profiles[org][year]["primary_cpc"] = primary
        else:
            profiles[org][year]["primary_cpc"] = None
        profiles[org][year]["top10_share"] = top10_share.get(key, 0.0)

# ═══════════════════════════════════════════════════════════════════════════════
# Step 5: Inventor count and avg team size
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 5: Inventor count and avg team size per company-year")

t0 = time.time()
inv_rows = con.execute(f"""
    WITH patent_team AS (
        SELECT
            bp.organization,
            bp.grant_year AS year,
            bp.patent_id,
            COUNT(DISTINCT i.inventor_id) AS team_size
        FROM base_patents bp
        JOIN {INVENTOR_TSV()} i ON bp.patent_id = i.patent_id
        GROUP BY bp.organization, bp.grant_year, bp.patent_id
    )
    SELECT
        organization,
        year,
        COUNT(DISTINCT patent_id) AS patent_count_check,
        SUM(team_size) AS total_inventor_slots,
        ROUND(AVG(team_size), 2) AS avg_team_size
    FROM patent_team
    GROUP BY organization, year
    ORDER BY organization, year
""").fetchall()
log(f"  Team size done in {time.time()-t0:.1f}s ({len(inv_rows):,} rows)")

# Unique inventor count per org-year
t0 = time.time()
inv_unique_rows = con.execute(f"""
    SELECT
        bp.organization,
        bp.grant_year AS year,
        COUNT(DISTINCT i.inventor_id) AS inventor_count
    FROM base_patents bp
    JOIN {INVENTOR_TSV()} i ON bp.patent_id = i.patent_id
    GROUP BY bp.organization, bp.grant_year
    ORDER BY bp.organization, bp.grant_year
""").fetchall()
log(f"  Unique inventor counts done in {time.time()-t0:.1f}s ({len(inv_unique_rows):,} rows)")

for org, year, _, _, avg_team in inv_rows:
    if org in profiles and year in profiles[org]:
        profiles[org][year]["avg_team_size"] = float(avg_team) if avg_team is not None else 0.0

for org, year, inv_count in inv_unique_rows:
    if org in profiles and year in profiles[org]:
        profiles[org][year]["inventor_count"] = int(inv_count)

# ═══════════════════════════════════════════════════════════════════════════════
# Step 6: Median forward citations within 5-year window
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 6: Median 5-year forward citations per company-year")

t0 = time.time()
cite_rows = con.execute(f"""
    WITH fwd AS (
        SELECT
            bp.organization,
            bp.grant_year AS year,
            bp.patent_id,
            COUNT(citing_p.patent_id) AS fwd_cites_5yr
        FROM base_patents bp
        LEFT JOIN {CITATION_TSV()} cit ON bp.patent_id = cit.citation_patent_id
        LEFT JOIN {PATENT_TSV()} citing_p ON cit.patent_id = citing_p.patent_id
            AND YEAR(CAST(citing_p.patent_date AS DATE)) <= bp.grant_year + 5
        GROUP BY bp.organization, bp.grant_year, bp.patent_id
    )
    SELECT
        organization,
        year,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fwd_cites_5yr) AS median_cites_5yr
    FROM fwd
    WHERE year <= 2020
    GROUP BY organization, year
    ORDER BY organization, year
""").fetchall()
log(f"  Forward citations done in {time.time()-t0:.1f}s ({len(cite_rows):,} rows)")

for org, year, median_cites in cite_rows:
    if org in profiles and year in profiles[org]:
        profiles[org][year]["median_citations_5yr"] = round(float(median_cites), 2) if median_cites is not None else 0.0

# ═══════════════════════════════════════════════════════════════════════════════
# Step 7: Self-citation rate
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 7: Self-citation rate per company-year")

t0 = time.time()
self_cite_rows = con.execute(f"""
    WITH cite_pairs AS (
        SELECT
            bp.organization,
            bp.grant_year AS year,
            cit.patent_id AS citing_id,
            cit.citation_patent_id AS cited_id,
            a2.disambig_assignee_organization AS cited_org
        FROM base_patents bp
        JOIN {CITATION_TSV()} cit ON bp.patent_id = cit.patent_id
        JOIN {ASSIGNEE_TSV()} a2 ON cit.citation_patent_id = a2.patent_id
            AND a2.assignee_sequence = 0
    )
    SELECT
        organization,
        year,
        COUNT(*) AS total_citations_made,
        SUM(CASE WHEN organization = cited_org THEN 1 ELSE 0 END) AS self_citations,
        ROUND(100.0 * SUM(CASE WHEN organization = cited_org THEN 1 ELSE 0 END) / COUNT(*), 2) AS self_cite_rate
    FROM cite_pairs
    GROUP BY organization, year
    ORDER BY organization, year
""").fetchall()
log(f"  Self-citation rates done in {time.time()-t0:.1f}s ({len(self_cite_rows):,} rows)")

for org, year, total_cites, self_cites, rate in self_cite_rows:
    if org in profiles and year in profiles[org]:
        profiles[org][year]["self_citation_rate"] = float(rate) if rate is not None else 0.0

# ═══════════════════════════════════════════════════════════════════════════════
# Step 8: International inventor share
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 8: International inventor share per company-year")

t0 = time.time()
intl_rows = con.execute(f"""
    WITH inv_loc AS (
        SELECT
            bp.organization,
            bp.grant_year AS year,
            i.inventor_id,
            l.disambig_country AS country
        FROM base_patents bp
        JOIN {INVENTOR_TSV()} i ON bp.patent_id = i.patent_id
        JOIN {LOCATION_TSV()} l ON i.location_id = l.location_id
        WHERE l.disambig_country IS NOT NULL
    )
    SELECT
        organization,
        year,
        COUNT(DISTINCT inventor_id) AS total_inventors_with_loc,
        COUNT(DISTINCT CASE WHEN country != 'US' THEN inventor_id END) AS intl_inventors,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN country != 'US' THEN inventor_id END)
              / NULLIF(COUNT(DISTINCT inventor_id), 0), 2) AS intl_share
    FROM inv_loc
    GROUP BY organization, year
    ORDER BY organization, year
""").fetchall()
log(f"  Intl inventor shares done in {time.time()-t0:.1f}s ({len(intl_rows):,} rows)")

for org, year, total_inv, intl_inv, share in intl_rows:
    if org in profiles and year in profiles[org]:
        profiles[org][year]["intl_inventor_share"] = float(share) if share is not None else 0.0

# ═══════════════════════════════════════════════════════════════════════════════
# Step 9: New inventor share (first patent year = current year)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 9: New inventor share per company-year")

t0 = time.time()
# First, compute each inventor's first patent year (globally)
con.execute(f"""
    CREATE TEMPORARY TABLE inventor_first_year AS
    SELECT
        i.inventor_id,
        MIN(YEAR(CAST(p.patent_date AS DATE))) AS first_year
    FROM {INVENTOR_TSV()} i
    JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
    WHERE p.patent_type = 'utility'
      AND p.patent_date IS NOT NULL
    GROUP BY i.inventor_id
""")
log(f"  Inventor first-year table built in {time.time()-t0:.1f}s")

t0 = time.time()
new_inv_rows = con.execute(f"""
    WITH org_inventors AS (
        SELECT
            bp.organization,
            bp.grant_year AS year,
            i.inventor_id
        FROM base_patents bp
        JOIN {INVENTOR_TSV()} i ON bp.patent_id = i.patent_id
    )
    SELECT
        oi.organization,
        oi.year,
        COUNT(DISTINCT oi.inventor_id) AS total_inventors,
        COUNT(DISTINCT CASE WHEN ify.first_year = oi.year THEN oi.inventor_id END) AS new_inventors,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN ify.first_year = oi.year THEN oi.inventor_id END)
              / NULLIF(COUNT(DISTINCT oi.inventor_id), 0), 2) AS new_inventor_share
    FROM org_inventors oi
    LEFT JOIN inventor_first_year ify ON oi.inventor_id = ify.inventor_id
    GROUP BY oi.organization, oi.year
    ORDER BY oi.organization, oi.year
""").fetchall()
log(f"  New inventor shares done in {time.time()-t0:.1f}s ({len(new_inv_rows):,} rows)")

for org, year, total_inv, new_inv, share in new_inv_rows:
    if org in profiles and year in profiles[org]:
        profiles[org][year]["new_inventor_share"] = float(share) if share is not None else 0.0

# ═══════════════════════════════════════════════════════════════════════════════
# Step 10: Assemble final output
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 10: Assembling final company profiles")

# Set defaults for any missing metrics
DEFAULT_FIELDS = {
    "inventor_count": 0,
    "avg_team_size": 0.0,
    "median_citations_5yr": 0.0,
    "top10_share": 0.0,
    "self_citation_rate": 0.0,
    "intl_inventor_share": 0.0,
    "new_inventor_share": 0.0,
    "cpc_breadth": 0,
    "primary_cpc": None,
    "cpc_distribution": {},
}

result = []
for org in sorted(profiles.keys()):
    years_data = []
    for year in sorted(profiles[org].keys()):
        entry = profiles[org][year]
        # Fill in defaults for missing fields
        for field, default in DEFAULT_FIELDS.items():
            if field not in entry:
                entry[field] = default
        years_data.append(entry)
    result.append({
        "company": display_name(org),
        "raw_name": org,
        "years": years_data,
    })

log(f"  {len(result)} companies with {sum(len(r['years']) for r in result):,} total year-entries")

# ── Save ─────────────────────────────────────────────────────────────────────
out_path = f"{OUTPUT_DIR}/company/company_profiles.json"
save_json(result, out_path)

con.close()
log("\n=== 32_company_profiles complete ===\n")
