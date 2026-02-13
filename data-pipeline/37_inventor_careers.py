#!/usr/bin/env python3
"""
Inventor Career Analyses — three datasets in one script.

Generates:
  company/inventor_careers.json    (D1: Career curves + duration distribution)
  company/inventor_drift.json      (D2: Technology drift / specialization over time)
  company/comeback_inventors.json  (D3: Comeback inventors with >=5-year gaps)
"""
import sys
import time
import math
from collections import defaultdict
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
# D1: Inventor Career Curves (inventors with >= 5 patents)
# =============================================================================
timed_msg("D1: Inventor Career Curves — productivity by career year")

t0 = time.time()

# Step 1: Get per-inventor, per-year patent counts and career start year
log("  Building inventor-year patent counts...")
inventor_years_df = con.execute(f"""
    WITH inventor_patent_years AS (
        SELECT
            i.inventor_id,
            YEAR(CAST(p.patent_date AS DATE)) AS patent_year,
            COUNT(DISTINCT p.patent_id) AS patents_in_year
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
        GROUP BY i.inventor_id, patent_year
    ),
    inventor_stats AS (
        SELECT
            inventor_id,
            MIN(patent_year) AS career_start,
            MAX(patent_year) AS career_end,
            SUM(patents_in_year) AS total_patents
        FROM inventor_patent_years
        GROUP BY inventor_id
        HAVING total_patents >= 5
    )
    SELECT
        ipy.inventor_id,
        ipy.patent_year,
        ipy.patents_in_year,
        ist.career_start,
        ist.career_end,
        ipy.patent_year - ist.career_start AS career_year
    FROM inventor_patent_years ipy
    JOIN inventor_stats ist ON ipy.inventor_id = ist.inventor_id
    ORDER BY ipy.inventor_id, ipy.patent_year
""").fetchdf()
log(f"  Query done in {time.time()-t0:.1f}s ({len(inventor_years_df):,} rows)")

# Step 2: Compute aggregate productivity curves by career_year
log("  Computing aggregate productivity curves...")
t1 = time.time()

curves_df = con.execute("""
    SELECT
        career_year,
        AVG(patents_in_year) AS avg_patents,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY patents_in_year) AS median_patents,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY patents_in_year) AS p25_patents,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY patents_in_year) AS p75_patents,
        COUNT(DISTINCT inventor_id) AS inventor_count
    FROM inventor_years_df
    WHERE career_year BETWEEN 0 AND 40
    GROUP BY career_year
    ORDER BY career_year
""").fetchdf()

curves = []
for _, row in curves_df.iterrows():
    curves.append({
        "career_year": int(row["career_year"]),
        "avg_patents": round(float(row["avg_patents"]), 3),
        "median_patents": round(float(row["median_patents"]), 2),
        "p25_patents": round(float(row["p25_patents"]), 2),
        "p75_patents": round(float(row["p75_patents"]), 2),
        "inventor_count": int(row["inventor_count"]),
    })
log(f"  Career curves computed: {len(curves)} career years")

# Step 3: Career duration distribution
log("  Computing career duration distribution...")
durations_df = con.execute("""
    SELECT
        career_end - career_start AS duration,
        COUNT(DISTINCT inventor_id) AS count
    FROM (
        SELECT inventor_id, MIN(career_start) AS career_start, MAX(career_end) AS career_end
        FROM inventor_years_df
        GROUP BY inventor_id
    )
    GROUP BY duration
    ORDER BY duration
""").fetchdf()

durations = []
for _, row in durations_df.iterrows():
    durations.append({
        "duration": int(row["duration"]),
        "count": int(row["count"]),
    })

result_d1 = {"curves": curves, "durations": durations}
save_json(result_d1, f"{OUTPUT_DIR}/company/inventor_careers.json")
log(f"  D1 complete in {time.time()-t0:.1f}s total")


# =============================================================================
# D2: Inventor Technology Drift (inventors with >= 10 patents)
# =============================================================================
timed_msg("D2: Inventor Technology Drift — specialization classification by decade")

t0 = time.time()

# Get per-inventor CPC section distribution and first patent year
log("  Querying inventor CPC distributions...")
drift_df = con.execute(f"""
    WITH inventor_cpc AS (
        SELECT
            i.inventor_id,
            YEAR(CAST(p.patent_date AS DATE)) AS patent_year,
            c.cpc_section
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
          AND c.cpc_section IN ('A','B','C','D','E','F','G','H')
    ),
    inventor_counts AS (
        SELECT inventor_id, COUNT(*) AS total_patents
        FROM inventor_cpc
        GROUP BY inventor_id
        HAVING total_patents >= 10
    )
    SELECT
        ic.inventor_id,
        MIN(ic.patent_year) AS first_year,
        ic.cpc_section,
        COUNT(*) AS section_count,
        ict.total_patents
    FROM inventor_cpc ic
    JOIN inventor_counts ict ON ic.inventor_id = ict.inventor_id
    GROUP BY ic.inventor_id, ic.cpc_section, ict.total_patents
    ORDER BY ic.inventor_id, section_count DESC
""").fetchdf()
log(f"  Query done in {time.time()-t0:.1f}s ({len(drift_df):,} rows)")

# Compute Shannon entropy per inventor and classify
log("  Computing entropy and classifying inventors...")
t1 = time.time()

# Group by inventor
inventor_data = defaultdict(lambda: {"sections": {}, "first_year": None, "total": 0})
for _, row in drift_df.iterrows():
    inv_id = row["inventor_id"]
    inv = inventor_data[inv_id]
    inv["sections"][row["cpc_section"]] = int(row["section_count"])
    inv["total"] = int(row["total_patents"])
    fy = int(row["first_year"])
    if inv["first_year"] is None or fy < inv["first_year"]:
        inv["first_year"] = fy

# Compute entropy and classify by decade
decade_counts = defaultdict(lambda: {"specialist": 0, "moderate": 0, "generalist": 0, "total": 0})

for inv_id, inv in inventor_data.items():
    total = inv["total"]
    if total == 0:
        continue
    # Shannon entropy on CPC section distribution
    entropy = 0.0
    for section, count in inv["sections"].items():
        p = count / total
        if p > 0:
            entropy -= p * math.log2(p)

    # Classify
    if entropy < 0.5:
        category = "specialist"
    elif entropy <= 1.5:
        category = "moderate"
    else:
        category = "generalist"

    decade = (inv["first_year"] // 10) * 10
    decade_counts[decade][category] += 1
    decade_counts[decade]["total"] += 1

# Build output
drift_result = []
for decade in sorted(decade_counts.keys()):
    d = decade_counts[decade]
    total = d["total"]
    if total == 0:
        continue
    drift_result.append({
        "decade": int(decade),
        "specialist_pct": round(100.0 * d["specialist"] / total, 2),
        "moderate_pct": round(100.0 * d["moderate"] / total, 2),
        "generalist_pct": round(100.0 * d["generalist"] / total, 2),
        "inventor_count": total,
    })

save_json(drift_result, f"{OUTPUT_DIR}/company/inventor_drift.json")
log(f"  D2 complete in {time.time()-t0:.1f}s total — {len(drift_result)} decades")


# =============================================================================
# D3: Comeback Inventors (gaps >= 5 years between consecutive patent years)
# =============================================================================
timed_msg("D3: Comeback Inventors — patenting gaps >= 5 years")

t0 = time.time()

# Get per-inventor patent years with assignee and CPC info
log("  Querying inventor patent histories with assignee and CPC...")
comeback_df = con.execute(f"""
    WITH inventor_patents AS (
        SELECT
            i.inventor_id,
            p.patent_id,
            YEAR(CAST(p.patent_date AS DATE)) AS patent_year,
            a.disambig_assignee_organization AS assignee,
            c.cpc_section
        FROM {INVENTOR_TSV()} i
        JOIN {PATENT_TSV()} p ON i.patent_id = p.patent_id
        LEFT JOIN {ASSIGNEE_TSV()} a ON p.patent_id = a.patent_id AND a.assignee_sequence = 0
        LEFT JOIN {CPC_CURRENT_TSV()} c ON p.patent_id = c.patent_id AND c.cpc_sequence = 0
        WHERE p.patent_type = 'utility'
          AND p.patent_date IS NOT NULL
          AND YEAR(CAST(p.patent_date AS DATE)) BETWEEN 1976 AND 2025
    ),
    inventor_year_info AS (
        SELECT
            inventor_id,
            patent_year,
            COUNT(DISTINCT patent_id) AS patents_in_year,
            -- Pick the most common assignee and CPC section per year
            MODE(assignee) AS primary_assignee,
            MODE(cpc_section) AS primary_cpc
        FROM inventor_patents
        GROUP BY inventor_id, patent_year
    )
    SELECT *
    FROM inventor_year_info
    ORDER BY inventor_id, patent_year
""").fetchdf()
log(f"  Query done in {time.time()-t0:.1f}s ({len(comeback_df):,} rows)")

# Find gaps and compute statistics
log("  Identifying gaps and computing statistics...")
t1 = time.time()

# Group by inventor
inv_records = defaultdict(list)
for _, row in comeback_df.iterrows():
    inv_records[row["inventor_id"]].append({
        "year": int(row["patent_year"]),
        "patents": int(row["patents_in_year"]),
        "assignee": row["primary_assignee"],
        "cpc": row["primary_cpc"],
    })

# Aggregate gap statistics by gap duration bin
gap_bins = defaultdict(lambda: {
    "count": 0,
    "patents_before_sum": 0,
    "patents_after_sum": 0,
    "changed_assignee": 0,
    "changed_cpc": 0,
})

for inv_id, years_data in inv_records.items():
    years_data.sort(key=lambda x: x["year"])
    for i in range(1, len(years_data)):
        gap = years_data[i]["year"] - years_data[i-1]["year"]
        if gap >= 5:
            # Bin: 5, 6, 7, ..., 14, 15+ (cap at 15)
            bin_key = min(gap, 15)

            # Patents before gap: sum of patents in years up to and including i-1
            patents_before = sum(y["patents"] for y in years_data[:i])
            # Patents after gap: sum of patents in years from i onward
            patents_after = sum(y["patents"] for y in years_data[i:])

            # Check assignee change
            assignee_before = years_data[i-1]["assignee"]
            assignee_after = years_data[i]["assignee"]
            changed_assignee = (
                assignee_before is not None
                and assignee_after is not None
                and assignee_before != assignee_after
            )

            # Check CPC section change
            cpc_before = years_data[i-1]["cpc"]
            cpc_after = years_data[i]["cpc"]
            changed_cpc = (
                cpc_before is not None
                and cpc_after is not None
                and cpc_before != cpc_after
            )

            gap_bins[bin_key]["count"] += 1
            gap_bins[bin_key]["patents_before_sum"] += patents_before
            gap_bins[bin_key]["patents_after_sum"] += patents_after
            if changed_assignee:
                gap_bins[bin_key]["changed_assignee"] += 1
            if changed_cpc:
                gap_bins[bin_key]["changed_cpc"] += 1

# Build output
comeback_result = []
for gap_years in sorted(gap_bins.keys()):
    b = gap_bins[gap_years]
    count = b["count"]
    if count == 0:
        continue
    comeback_result.append({
        "gap_years": int(gap_years),
        "count": count,
        "avg_patents_before": round(b["patents_before_sum"] / count, 2),
        "avg_patents_after": round(b["patents_after_sum"] / count, 2),
        "changed_assignee_pct": round(100.0 * b["changed_assignee"] / count, 2),
        "changed_cpc_pct": round(100.0 * b["changed_cpc"] / count, 2),
    })

save_json(comeback_result, f"{OUTPUT_DIR}/company/comeback_inventors.json")
log(f"  D3 complete in {time.time()-t0:.1f}s total — {len(comeback_result)} gap bins")


# =============================================================================
# Done
# =============================================================================
timed_msg("All inventor career analyses complete!")
con.close()
