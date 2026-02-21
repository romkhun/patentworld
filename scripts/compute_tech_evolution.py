"""Compute firm_tech_evolution.json for all companies."""
import polars as pl
import json, time

DATA = "/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView/"
OUT_COMPANY = "/home/saerom/projects/patentworld/public/data/company/"
OUT_CHAPTER3 = "/home/saerom/projects/patentworld/public/data/chapter3/"

t0 = time.time()

# Load company name mapping
with open(f"{OUT_COMPANY}company_name_mapping.json") as f:
    name_map = json.load(f)

with open(f"{OUT_COMPANY}company_profiles.json") as f:
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
# Keep first assignee per patent and the raw org name
assignee = assignee.unique(subset=["patent_id"], keep="first")
print(f"  Company patents: {len(assignee):,}")

# Load patent data for year
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

# Load CPC data
print("Loading g_cpc_current...")
cpc = pl.read_csv(
    f"{DATA}g_cpc_current.tsv.zip",
    separator="\t",
    columns=["patent_id", "cpc_section", "cpc_type"],
    infer_schema_length=10000,
)
# Keep only inventional CPCs and unique section per patent
cpc = cpc.filter(pl.col("cpc_type") == "inventional")
cpc = cpc.select(["patent_id", "cpc_section"]).unique()
print(f"  CPC patent-section pairs: {len(cpc):,}")

# Join patent + assignee + CPC
pa = patent.select(["patent_id", "year"]).join(
    assignee.select(["patent_id", "disambig_assignee_organization"]), on="patent_id", how="inner"
)
pa_cpc = pa.join(cpc, on="patent_id", how="inner")
print(f"  Joined patent-assignee-CPC: {len(pa_cpc):,}")

# Create 5-year periods
pa_cpc = pa_cpc.with_columns(
    ((pl.col("year") - 1976) // 5 * 5 + 1976).alias("period_start")
)
pa_cpc = pa_cpc.with_columns(
    (pl.col("period_start") + 4).alias("period_end")
)
pa_cpc = pa_cpc.with_columns(
    (pl.col("period_start").cast(pl.Float64).cast(pl.Utf8) + "-" +
     (pl.col("period_end").cast(pl.Float64) + 1).cast(pl.Utf8)).alias("period")
)

# Count per organization + period + section
tech_evolution = (
    pa_cpc.group_by(["disambig_assignee_organization", "period", "cpc_section"])
    .agg(pl.len().alias("count"))
    .sort(["disambig_assignee_organization", "period", "cpc_section"])
)

# Convert to list of dicts (using raw org names as in original format)
result = []
for row in tech_evolution.iter_rows(named=True):
    result.append({
        "organization": row["disambig_assignee_organization"],
        "period": row["period"],
        "section": row["cpc_section"],
        "count": int(row["count"]),
    })

with open(f"{OUT_CHAPTER3}firm_tech_evolution.json", "w") as f:
    json.dump(result, f)
print(f"  Wrote firm_tech_evolution.json with {len(set(r['organization'] for r in result))} organizations, {len(result)} rows")
print(f"\nDone in {time.time() - t0:.1f}s")
