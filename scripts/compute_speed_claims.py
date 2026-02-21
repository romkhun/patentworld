"""Compute corporate_speed.json and firm_claims_distribution.json for all companies."""
import polars as pl
import json, time

DATA = "/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView/"
OUT = "/home/saerom/projects/patentworld/public/data/company/"

t0 = time.time()

# Load company name mapping
with open(f"{OUT}company_name_mapping.json") as f:
    name_map = json.load(f)

# Get list of companies from company_profiles.json
with open(f"{OUT}company_profiles.json") as f:
    profiles = json.load(f)
target_companies = sorted(set(d["company"] for d in profiles))
print(f"Target companies: {len(target_companies)}")

# Reverse mapping: clean name -> set of raw names
clean_to_raw = {}
for raw, clean in name_map.items():
    clean_to_raw.setdefault(clean, set()).add(raw)

# Collect all raw names for target companies
target_raw_names = set()
for c in target_companies:
    if c in clean_to_raw:
        target_raw_names.update(clean_to_raw[c])
print(f"Target raw org names: {len(target_raw_names)}")

# Load assignee data
print("Loading g_assignee_disambiguated...")
assignee = pl.read_csv(
    f"{DATA}g_assignee_disambiguated.tsv.zip",
    separator="\t",
    columns=["patent_id", "disambig_assignee_organization"],
    infer_schema_length=10000,
)
print(f"  Loaded {len(assignee):,} assignee rows")

# Filter to target companies
assignee = assignee.filter(
    pl.col("disambig_assignee_organization").is_in(list(target_raw_names))
)
print(f"  Filtered to {len(assignee):,} rows for target companies")

# Map to clean names
raw_to_clean = pl.DataFrame({
    "disambig_assignee_organization": list(name_map.keys()),
    "company": list(name_map.values()),
})
assignee = assignee.join(raw_to_clean, on="disambig_assignee_organization", how="inner")
# Keep one assignee per patent (first assignee)
assignee = assignee.unique(subset=["patent_id"], keep="first")
print(f"  Unique patents with assignee: {len(assignee):,}")

# Load patent data
print("Loading g_patent...")
patent = pl.read_csv(
    f"{DATA}g_patent.tsv.zip",
    separator="\t",
    columns=["patent_id", "patent_type", "patent_date", "num_claims"],
    infer_schema_length=10000,
)
patent = patent.filter(pl.col("patent_type") == "utility")
patent = patent.with_columns(pl.col("patent_date").str.to_date("%Y-%m-%d", strict=False).alias("grant_date"))
patent = patent.filter(pl.col("grant_date").is_not_null())
patent = patent.with_columns(pl.col("grant_date").dt.year().alias("year"))
patent = patent.filter((pl.col("year") >= 1976) & (pl.col("year") <= 2025))
print(f"  Utility patents 1976-2025: {len(patent):,}")

# Load application data for filing dates
print("Loading g_application...")
application = pl.read_csv(
    f"{DATA}g_application.tsv.zip",
    separator="\t",
    columns=["patent_id", "filing_date"],
    infer_schema_length=10000,
)
application = application.with_columns(
    pl.col("filing_date").str.to_date("%Y-%m-%d", strict=False).alias("file_date")
)
# Filter corrupt dates
application = application.filter(pl.col("file_date").is_not_null())
application = application.filter(pl.col("file_date").dt.year() >= 1950)
print(f"  Valid application rows: {len(application):,}")

# Join patent + assignee
pa = patent.join(assignee.select(["patent_id", "company"]), on="patent_id", how="inner")
print(f"  Joined patent-assignee: {len(pa):,}")

# ────────── CLAIMS DISTRIBUTION ──────────
print("\nComputing firm_claims_distribution...")

# System median claims per year
sys_claims = patent.group_by("year").agg(
    pl.col("num_claims").median().alias("system_median")
)

# Per company-year claims distribution
claims_dist = (
    pa.group_by(["company", "year"]).agg([
        pl.col("num_claims").quantile(0.25, interpolation="linear").alias("p25"),
        pl.col("num_claims").quantile(0.50, interpolation="linear").alias("p50"),
        pl.col("num_claims").quantile(0.75, interpolation="linear").alias("p75"),
        pl.col("num_claims").quantile(0.90, interpolation="linear").alias("p90"),
        pl.col("num_claims").mean().alias("mean"),
    ])
    .join(sys_claims, on="year", how="left")
    .sort(["company", "year"])
)

# Convert to dict-of-lists format
claims_result = {}
for company in target_companies:
    subset = claims_dist.filter(pl.col("company") == company)
    if len(subset) == 0:
        continue
    rows = []
    for row in subset.iter_rows(named=True):
        rows.append({
            "year": int(row["year"]),
            "p25": round(row["p25"], 1) if row["p25"] is not None else 0,
            "p50": round(row["p50"], 1) if row["p50"] is not None else 0,
            "p75": round(row["p75"], 1) if row["p75"] is not None else 0,
            "p90": round(row["p90"], 1) if row["p90"] is not None else 0,
            "mean": round(row["mean"], 2) if row["mean"] is not None else 0,
            "system_median": round(row["system_median"], 1) if row["system_median"] is not None else 0,
        })
    claims_result[company] = rows

with open(f"{OUT}firm_claims_distribution.json", "w") as f:
    json.dump(claims_result, f)
print(f"  Wrote firm_claims_distribution.json with {len(claims_result)} companies")

# ────────── CORPORATE SPEED (GRANT LAG) ──────────
print("\nComputing corporate_speed...")

# Join with application for filing date
pa_app = pa.join(application.select(["patent_id", "file_date"]), on="patent_id", how="inner")
pa_app = pa_app.with_columns(
    (pl.col("grant_date") - pl.col("file_date")).dt.total_days().alias("grant_lag_days")
)
# Filter reasonable grant lags (0 to 20 years)
pa_app = pa_app.filter((pl.col("grant_lag_days") > 0) & (pl.col("grant_lag_days") < 7300))

speed_dist = (
    pa_app.group_by(["company", "year"]).agg([
        pl.col("grant_lag_days").mean().alias("avg_grant_lag_days"),
        pl.col("grant_lag_days").median().alias("median_grant_lag_days"),
        pl.len().alias("patent_count"),
    ])
    .sort(["company", "year"])
)

speed_result = []
for row in speed_dist.iter_rows(named=True):
    speed_result.append({
        "company": row["company"],
        "year": int(row["year"]),
        "avg_grant_lag_days": round(row["avg_grant_lag_days"], 1),
        "median_grant_lag_days": round(row["median_grant_lag_days"], 1),
        "patent_count": int(row["patent_count"]),
    })

with open(f"{OUT}corporate_speed.json", "w") as f:
    json.dump(speed_result, f)
print(f"  Wrote corporate_speed.json with {len(set(r['company'] for r in speed_result))} companies")

print(f"\nDone in {time.time() - t0:.1f}s")
