#!/usr/bin/env python3
"""
Corporate Mortality — track top 50 assignees per decade and compute
survival/replacement rates across innovation leadership cohorts.

Generates: company/corporate_mortality.json
"""
import sys
import time
import orjson
import duckdb
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
# Step 1: Define decades and query top 50 per decade
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 1: Top 50 assignees per decade")

DECADES = [
    {"label": "1976-85",  "start": 1976, "end": 1985},
    {"label": "1986-95",  "start": 1986, "end": 1995},
    {"label": "1996-05",  "start": 1996, "end": 2005},
    {"label": "2006-15",  "start": 2006, "end": 2015},
    {"label": "2016-25",  "start": 2016, "end": 2025},
]

decades_data = []  # [{decade, companies: [{company, raw_name, rank, patent_count}]}]
decade_sets = []   # [set of raw org names in top 50]

for dec in DECADES:
    t0 = time.time()
    rows = con.execute(f"""
        SELECT
            a.disambig_assignee_organization AS organization,
            COUNT(DISTINCT p.patent_id) AS patent_count
        FROM {PATENT_TSV()} p
        JOIN {ASSIGNEE_TSV()} a
            ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND a.disambig_assignee_organization IS NOT NULL
          AND TRIM(a.disambig_assignee_organization) != ''
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN {dec['start']} AND {dec['end']}
        GROUP BY organization
        ORDER BY patent_count DESC
        LIMIT 50
    """).fetchall()
    elapsed = time.time() - t0
    log(f"  {dec['label']}: {len(rows)} companies in {elapsed:.1f}s")

    companies = []
    org_set = set()
    for rank, (org, count) in enumerate(rows, 1):
        companies.append({
            "company": display_name(org),
            "raw_name": org,
            "rank": rank,
            "patent_count": int(count),
        })
        org_set.add(org)

    decades_data.append({
        "decade": dec["label"],
        "start_year": dec["start"],
        "end_year": dec["end"],
        "companies": companies,
    })
    decade_sets.append(org_set)

# ═══════════════════════════════════════════════════════════════════════════════
# Step 2: Compute survival rates (fraction of previous decade's top 50
#          that remain in the current decade's top 50)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 2: Computing survival rates")

survival_rates = []
for i in range(1, len(DECADES)):
    prev_set = decade_sets[i - 1]
    curr_set = decade_sets[i]
    survivors = prev_set & curr_set
    newcomers = curr_set - prev_set
    departed = prev_set - curr_set

    rate = round(100.0 * len(survivors) / len(prev_set), 1) if len(prev_set) > 0 else 0.0

    survival_rates.append({
        "from_decade": DECADES[i - 1]["label"],
        "to_decade": DECADES[i]["label"],
        "survivors": len(survivors),
        "newcomers": len(newcomers),
        "departed": len(departed),
        "survival_rate": rate,
        "turnover_rate": round(100.0 - rate, 1),
        "survivor_names": sorted([display_name(o) for o in survivors]),
        "newcomer_names": sorted([display_name(o) for o in newcomers]),
        "departed_names": sorted([display_name(o) for o in departed]),
    })
    log(f"  {DECADES[i-1]['label']} -> {DECADES[i]['label']}: "
        f"{len(survivors)} survivors ({rate}%), "
        f"{len(newcomers)} newcomers, {len(departed)} departed")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 3: Find continuous companies (in top 50 across ALL 5 decades)
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 3: Finding continuous top-50 companies")

continuous_set = decade_sets[0]
for s in decade_sets[1:]:
    continuous_set = continuous_set & s

continuous_companies = []
for org in sorted(continuous_set):
    # Gather rank in each decade
    ranks = []
    for i, dec_data in enumerate(decades_data):
        for c in dec_data["companies"]:
            if c["raw_name"] == org:
                ranks.append({
                    "decade": dec_data["decade"],
                    "rank": c["rank"],
                    "patent_count": c["patent_count"],
                })
                break
    continuous_companies.append({
        "company": display_name(org),
        "raw_name": org,
        "decades": ranks,
    })

# Sort by average rank across decades
continuous_companies.sort(
    key=lambda x: sum(d["rank"] for d in x["decades"]) / len(x["decades"])
)

log(f"  {len(continuous_companies)} companies in top 50 across all 5 decades")
for cc in continuous_companies:
    ranks_str = ", ".join(f"{d['decade']}:#{d['rank']}" for d in cc["decades"])
    log(f"    {cc['company']}: {ranks_str}")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 4: Cumulative churn statistics
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 4: Cumulative churn statistics")

# For each decade, what fraction of the original (1976-85) top 50 still remain?
original_set = decade_sets[0]
cumulative_survival = []
for i, dec in enumerate(DECADES):
    remaining = original_set & decade_sets[i]
    rate = round(100.0 * len(remaining) / len(original_set), 1) if len(original_set) > 0 else 0.0
    cumulative_survival.append({
        "decade": dec["label"],
        "remaining_from_first_decade": len(remaining),
        "cumulative_survival_rate": rate,
    })
    log(f"  {dec['label']}: {len(remaining)} of original 50 remain ({rate}%)")

# ═══════════════════════════════════════════════════════════════════════════════
# Step 5: Assemble and save output
# ═══════════════════════════════════════════════════════════════════════════════
timed_msg("Step 5: Saving corporate_mortality.json")

output = {
    "decades": decades_data,
    "survival_rates": survival_rates,
    "continuous_companies": continuous_companies,
    "cumulative_survival": cumulative_survival,
    "summary": {
        "total_decades": len(DECADES),
        "companies_per_decade": 50,
        "continuous_count": len(continuous_companies),
        "avg_decade_survival_rate": round(
            sum(s["survival_rate"] for s in survival_rates) / len(survival_rates), 1
        ) if survival_rates else 0.0,
    },
}

out_path = f"{OUTPUT_DIR}/company/corporate_mortality.json"
save_json(output, out_path)

con.close()
log("\n=== 34_corporate_mortality complete ===\n")
