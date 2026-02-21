"""Compute firm_quality_distribution.json for all companies."""
import polars as pl
import json, time, numpy as np

DATA = "/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView/"
OUT = "/home/saerom/projects/patentworld/public/data/company/"

t0 = time.time()

# Load company name mapping
with open(f"{OUT}company_name_mapping.json") as f:
    name_map = json.load(f)

with open(f"{OUT}company_profiles.json") as f:
    profiles = json.load(f)
target_companies = sorted(set(d["company"] for d in profiles))

clean_to_raw = {}
for raw, clean in name_map.items():
    clean_to_raw.setdefault(clean, set()).add(raw)
target_raw_names = set()
for c in target_companies:
    if c in clean_to_raw:
        target_raw_names.update(clean_to_raw[c])

# Load assignee data
print("Loading g_assignee_disambiguated...")
assignee = pl.read_csv(
    f"{DATA}g_assignee_disambiguated.tsv.zip",
    separator="\t",
    columns=["patent_id", "disambig_assignee_organization"],
    infer_schema_length=10000,
)
assignee = assignee.filter(
    pl.col("disambig_assignee_organization").is_in(list(target_raw_names))
)
raw_to_clean = pl.DataFrame({
    "disambig_assignee_organization": list(name_map.keys()),
    "company": list(name_map.values()),
})
assignee = assignee.join(raw_to_clean, on="disambig_assignee_organization", how="inner")
assignee = assignee.unique(subset=["patent_id"], keep="first")
print(f"  Company patents: {len(assignee):,}")

# Load patent data
print("Loading g_patent...")
patent = pl.read_csv(
    f"{DATA}g_patent.tsv.zip",
    separator="\t",
    columns=["patent_id", "patent_type", "patent_date"],
    infer_schema_length=10000,
)
patent = patent.filter(pl.col("patent_type") == "utility")
patent = patent.with_columns(pl.col("patent_date").str.to_date("%Y-%m-%d", strict=False).alias("grant_date"))
patent = patent.filter(pl.col("grant_date").is_not_null())
patent = patent.with_columns(pl.col("grant_date").dt.year().alias("year"))
patent = patent.filter((pl.col("year") >= 1976) & (pl.col("year") <= 2025))
print(f"  Utility patents: {len(patent):,}")

# Load citations
print("Loading g_us_patent_citation...")
citations = pl.read_csv(
    f"{DATA}g_us_patent_citation.tsv.zip",
    separator="\t",
    columns=["patent_id", "citation_patent_id"],
    infer_schema_length=10000,
)
print(f"  Citation rows: {len(citations):,}")

# Count forward citations per patent (how many times each patent is cited)
print("Computing forward citation counts...")
fwd_cit = (
    citations
    .group_by("citation_patent_id")
    .agg(pl.len().alias("fwd_citations"))
    .rename({"citation_patent_id": "patent_id"})
)
print(f"  Patents with citations: {len(fwd_cit):,}")

# Join patent + assignee + forward citations
pa = patent.select(["patent_id", "year"]).join(
    assignee.select(["patent_id", "company"]), on="patent_id", how="inner"
)
pa = pa.join(fwd_cit, on="patent_id", how="left")
pa = pa.with_columns(pl.col("fwd_citations").fill_null(0))
print(f"  Company patents with citation data: {len(pa):,}")

# System median forward citations per grant year
all_patent_cit = patent.select(["patent_id", "year"]).join(fwd_cit, on="patent_id", how="left")
all_patent_cit = all_patent_cit.with_columns(pl.col("fwd_citations").fill_null(0))
sys_median = all_patent_cit.group_by("year").agg(
    pl.col("fwd_citations").median().alias("system_median")
)

# Compute Gini coefficient using vectorized numpy
def gini(values):
    """Compute Gini coefficient."""
    v = np.array(values, dtype=float)
    if len(v) == 0 or v.sum() == 0:
        return 0.0
    v = np.sort(v)
    n = len(v)
    index = np.arange(1, n + 1)
    return float((2 * np.sum(index * v) - (n + 1) * np.sum(v)) / (n * np.sum(v)))

# Compute per company-year
print("Computing quality distribution per company-year...")
quality_result = {}

for company in target_companies:
    subset = pa.filter(pl.col("company") == company)
    if len(subset) == 0:
        continue

    years_data = subset.group_by("year").agg(pl.col("fwd_citations"))
    rows = []

    for yr_row in years_data.sort("year").iter_rows(named=True):
        year = int(yr_row["year"])
        cits = yr_row["fwd_citations"]
        n = len(cits)
        if n == 0:
            continue

        cits_arr = np.array(cits, dtype=float)

        # Get system median for this year
        sm_row = sys_median.filter(pl.col("year") == year)
        sm_val = float(sm_row["system_median"][0]) if len(sm_row) > 0 else 0.0

        # Blockbuster: above 75th percentile of ALL patents that year
        all_p75_row = all_patent_cit.filter(pl.col("year") == year)
        if len(all_p75_row) > 0:
            all_p75 = float(all_p75_row["fwd_citations"].quantile(0.75, interpolation="linear"))
        else:
            all_p75 = 0.0

        rows.append({
            "year": year,
            "patent_count": n,
            "p10": round(float(np.percentile(cits_arr, 10)), 1),
            "p25": round(float(np.percentile(cits_arr, 25)), 1),
            "p50": round(float(np.percentile(cits_arr, 50)), 1),
            "p75": round(float(np.percentile(cits_arr, 75)), 1),
            "p90": round(float(np.percentile(cits_arr, 90)), 1),
            "p99": round(float(np.percentile(cits_arr, 99)), 1),
            "mean": round(float(cits_arr.mean()), 2),
            "dud_rate": round(float(np.mean(cits_arr == 0)), 4),
            "blockbuster_rate": round(float(np.mean(cits_arr > all_p75)), 4) if all_p75 > 0 else 0.0,
            "gini": round(gini(cits_arr), 4),
            "system_median": round(sm_val, 1),
        })

    if rows:
        quality_result[company] = sorted(rows, key=lambda x: x["year"])

with open(f"{OUT}firm_quality_distribution.json", "w") as f:
    json.dump(quality_result, f)
print(f"  Wrote firm_quality_distribution.json with {len(quality_result)} companies")
print(f"\nDone in {time.time() - t0:.1f}s")
