"""
Compute all 5 company profile datasets for all 99 companies.
Outputs:
  - company/corporate_speed.json
  - company/firm_claims_distribution.json
  - company/firm_quality_distribution.json
  - company/strategy_profiles.json
  - chapter3/firm_tech_evolution.json
"""
import polars as pl
import json, time, zipfile, io
import numpy as np
from scipy import stats as sp_stats

DATA = "/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView/"
OUT = "/home/saerom/projects/patentworld/public/data/company/"
OUT_CH3 = "/home/saerom/projects/patentworld/public/data/chapter3/"

t0 = time.time()

def read_zip_tsv(filename, columns=None):
    """Read a TSV file from inside a ZIP archive."""
    path = f"{DATA}{filename}"
    print(f"  Reading {filename}...")
    with zipfile.ZipFile(path) as z:
        tsv_name = z.namelist()[0]
        with z.open(tsv_name) as f:
            df = pl.read_csv(
                f.read(),
                separator="\t",
                columns=columns,
                infer_schema_length=10000,
                ignore_errors=True,
            )
    # Normalize patent_id to string (some tables infer as i64)
    if "patent_id" in df.columns:
        df = df.with_columns(pl.col("patent_id").cast(pl.Utf8))
    if "citation_patent_id" in df.columns:
        df = df.with_columns(pl.col("citation_patent_id").cast(pl.Utf8))
    print(f"    -> {len(df):,} rows")
    return df

# ══════════════════════════════════════════════════════════════
# SETUP: Load mappings and identify target companies
# ══════════════════════════════════════════════════════════════

with open(f"{OUT}company_name_mapping.json") as f:
    name_map = json.load(f)

with open(f"{OUT}company_profiles.json") as f:
    profiles = json.load(f)
target_companies = sorted(set(d["company"] for d in profiles))
print(f"Target companies: {len(target_companies)}")

# Reverse mapping: clean -> raw
clean_to_raw = {}
for raw, clean in name_map.items():
    clean_to_raw.setdefault(clean, set()).add(raw)
target_raw_names = set()
for c in target_companies:
    if c in clean_to_raw:
        target_raw_names.update(clean_to_raw[c])
print(f"Target raw org names: {len(target_raw_names)}")

# ══════════════════════════════════════════════════════════════
# LOAD BASE DATA
# ══════════════════════════════════════════════════════════════

print("\n── Loading base data ──")

# Assignee
assignee = read_zip_tsv("g_assignee_disambiguated.tsv.zip",
    columns=["patent_id", "disambig_assignee_organization"])
assignee = assignee.filter(
    pl.col("disambig_assignee_organization").is_in(list(target_raw_names))
)
raw_to_clean_df = pl.DataFrame({
    "disambig_assignee_organization": list(name_map.keys()),
    "company": list(name_map.values()),
})
assignee = assignee.join(raw_to_clean_df, on="disambig_assignee_organization", how="inner")
# Keep raw org name for tech evolution, and unique patent for other uses
assignee_with_raw = assignee.unique(subset=["patent_id"], keep="first")
assignee_unique = assignee_with_raw.select(["patent_id", "company"])
print(f"  Company patents (unique): {len(assignee_unique):,}")

# Patent
patent = read_zip_tsv("g_patent.tsv.zip",
    columns=["patent_id", "patent_type", "patent_date", "num_claims"])
patent = patent.filter(pl.col("patent_type") == "utility")
patent = patent.with_columns(
    pl.col("patent_date").str.to_date("%Y-%m-%d", strict=False).alias("grant_date")
)
patent = patent.filter(pl.col("grant_date").is_not_null())
patent = patent.with_columns(pl.col("grant_date").dt.year().alias("year"))
patent = patent.filter((pl.col("year") >= 1976) & (pl.col("year") <= 2025))
print(f"  Utility patents 1976-2025: {len(patent):,}")

# Application (for grant lag)
application = read_zip_tsv("g_application.tsv.zip",
    columns=["patent_id", "filing_date"])
application = application.with_columns(
    pl.col("filing_date").str.to_date("%Y-%m-%d", strict=False).alias("file_date")
)
application = application.filter(pl.col("file_date").is_not_null())
application = application.filter(pl.col("file_date").dt.year() >= 1950)

# CPC
cpc = read_zip_tsv("g_cpc_current.tsv.zip",
    columns=["patent_id", "cpc_section", "cpc_subclass", "cpc_type"])
cpc = cpc.filter(pl.col("cpc_type") == "inventional")

# Inventor (for team size)
inventor = read_zip_tsv("g_inventor_disambiguated.tsv.zip",
    columns=["patent_id", "inventor_id"])
team_size = inventor.group_by("patent_id").agg(
    pl.n_unique("inventor_id").alias("team_size")
)
del inventor  # Free memory
print(f"  Team sizes: {len(team_size):,} patents")

# Citations
citations = read_zip_tsv("g_us_patent_citation.tsv.zip",
    columns=["patent_id", "citation_patent_id"])

# Forward citations per patent
print("  Computing forward citations...")
fwd_cit = (
    citations.group_by("citation_patent_id")
    .agg(pl.len().alias("fwd_citations"))
    .rename({"citation_patent_id": "patent_id"})
)
print(f"    Patents with forward citations: {len(fwd_cit):,}")

# Backward citations per patent
bwd_count = citations.group_by("patent_id").agg(
    pl.len().alias("bwd_citations")
)

# Non-patent references
print("  Loading non-patent references...")
try:
    npl = read_zip_tsv("g_other_reference.tsv.zip", columns=["patent_id"])
    npl_count = npl.group_by("patent_id").agg(pl.len().alias("npl_count"))
    del npl
    has_npl = True
    print(f"    NPL patents: {len(npl_count):,}")
except Exception as e:
    print(f"    NPL load failed: {e}")
    has_npl = False

# Join patent + assignee (base table for most computations)
pa = patent.join(assignee_unique, on="patent_id", how="inner")
print(f"\n  Base patent-assignee table: {len(pa):,} rows")

elapsed = time.time() - t0
print(f"\n── Data loading complete in {elapsed:.0f}s ──\n")

# ══════════════════════════════════════════════════════════════
# 1. CORPORATE SPEED (GRANT LAG)
# ══════════════════════════════════════════════════════════════

print("═══ Computing corporate_speed.json ═══")
pa_app = pa.join(application.select(["patent_id", "file_date"]), on="patent_id", how="inner")
pa_app = pa_app.with_columns(
    (pl.col("grant_date") - pl.col("file_date")).dt.total_days().alias("grant_lag_days")
)
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
print(f"  -> {len(set(r['company'] for r in speed_result))} companies written")

# ══════════════════════════════════════════════════════════════
# 2. CLAIMS DISTRIBUTION
# ══════════════════════════════════════════════════════════════

print("\n═══ Computing firm_claims_distribution.json ═══")
sys_claims = patent.group_by("year").agg(
    pl.col("num_claims").median().alias("system_median")
)

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
print(f"  -> {len(claims_result)} companies written")

# ══════════════════════════════════════════════════════════════
# 3. QUALITY DISTRIBUTION (FORWARD CITATIONS)
# ══════════════════════════════════════════════════════════════

print("\n═══ Computing firm_quality_distribution.json ═══")

# Join all patents with forward citations
all_patent_cit = patent.select(["patent_id", "year"]).join(fwd_cit, on="patent_id", how="left")
all_patent_cit = all_patent_cit.with_columns(pl.col("fwd_citations").fill_null(0))

# System median and p75 per year
sys_stats = all_patent_cit.group_by("year").agg([
    pl.col("fwd_citations").median().alias("system_median"),
    pl.col("fwd_citations").quantile(0.75, interpolation="linear").alias("system_p75"),
])

# Company patents with forward citations
pa_cit = pa.select(["patent_id", "company", "year"]).join(fwd_cit, on="patent_id", how="left")
pa_cit = pa_cit.with_columns(pl.col("fwd_citations").fill_null(0))

def gini(values):
    v = np.array(values, dtype=float)
    if len(v) == 0 or v.sum() == 0:
        return 0.0
    v = np.sort(v)
    n = len(v)
    idx = np.arange(1, n + 1)
    return float((2 * np.sum(idx * v) - (n + 1) * np.sum(v)) / (n * np.sum(v)))

quality_result = {}
for company in target_companies:
    subset = pa_cit.filter(pl.col("company") == company)
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

        sm_row = sys_stats.filter(pl.col("year") == year)
        sm_val = float(sm_row["system_median"][0]) if len(sm_row) > 0 else 0.0
        sp75 = float(sm_row["system_p75"][0]) if len(sm_row) > 0 else 0.0

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
            "blockbuster_rate": round(float(np.mean(cits_arr > sp75)), 4) if sp75 > 0 else 0.0,
            "gini": round(gini(cits_arr), 4),
            "system_median": round(sm_val, 1),
        })
    if rows:
        quality_result[company] = sorted(rows, key=lambda x: x["year"])

with open(f"{OUT}firm_quality_distribution.json", "w") as f:
    json.dump(quality_result, f)
print(f"  -> {len(quality_result)} companies written")

# ══════════════════════════════════════════════════════════════
# 4. TECH EVOLUTION (CPC SECTIONS BY PERIOD)
# ══════════════════════════════════════════════════════════════

print("\n═══ Computing firm_tech_evolution.json ═══")
cpc_sections = cpc.select(["patent_id", "cpc_section"]).unique()

pa_cpc = pa.select(["patent_id", "year"]).join(
    assignee_with_raw.select(["patent_id", "disambig_assignee_organization"]),
    on="patent_id", how="inner"
).join(cpc_sections, on="patent_id", how="inner")

# 5-year periods: 1976-1980, 1981-1985, ..., 2021-2025
pa_cpc = pa_cpc.with_columns(
    ((pl.col("year") - 1976) // 5 * 5 + 1976).alias("period_start")
)
pa_cpc = pa_cpc.with_columns(
    (pl.col("period_start").cast(pl.Float64).cast(pl.Utf8) + "-" +
     (pl.col("period_start").cast(pl.Float64) + 5).cast(pl.Utf8)).alias("period")
)

tech_evo = (
    pa_cpc.group_by(["disambig_assignee_organization", "period", "cpc_section"])
    .agg(pl.len().alias("count"))
    .sort(["disambig_assignee_organization", "period", "cpc_section"])
)

tech_result = []
for row in tech_evo.iter_rows(named=True):
    tech_result.append({
        "organization": row["disambig_assignee_organization"],
        "period": row["period"],
        "section": row["cpc_section"],
        "count": int(row["count"]),
    })

with open(f"{OUT_CH3}firm_tech_evolution.json", "w") as f:
    json.dump(tech_result, f)
print(f"  -> {len(set(r['organization'] for r in tech_result))} orgs, {len(tech_result)} rows")

# ══════════════════════════════════════════════════════════════
# 5. STRATEGY PROFILES (8 DIMENSIONS)
# ══════════════════════════════════════════════════════════════

print("\n═══ Computing strategy_profiles.json ═══")

# Self-citation rate
print("  Computing self-citations...")
company_patents_set = assignee_unique.select(["patent_id", "company"])
bwd_with_co = citations.join(
    company_patents_set.rename({"patent_id": "citing_pid", "company": "citing_co"}),
    left_on="patent_id", right_on="citing_pid", how="inner"
)
bwd_with_co = bwd_with_co.join(
    company_patents_set.rename({"patent_id": "cited_pid", "company": "cited_co"}),
    left_on="citation_patent_id", right_on="cited_pid", how="left"
)
self_cit_agg = bwd_with_co.group_by("citing_co").agg([
    (pl.col("citing_co") == pl.col("cited_co")).sum().alias("self_cites"),
    pl.len().alias("total_bwd"),
]).with_columns(
    (pl.col("self_cites") / pl.col("total_bwd")).alias("self_cite_rate")
).rename({"citing_co": "company"})

# Citation freshness
print("  Computing citation freshness...")
patent_years = patent.select(["patent_id", "year"])
bwd_ages = bwd_with_co.join(
    patent_years.rename({"patent_id": "citing_id2", "year": "citing_yr"}),
    left_on="patent_id", right_on="citing_id2", how="inner"
).join(
    patent_years.rename({"patent_id": "cited_id2", "year": "cited_yr"}),
    left_on="citation_patent_id", right_on="cited_id2", how="inner"
).with_columns(
    (pl.col("citing_yr") - pl.col("cited_yr")).alias("cit_age")
).filter(pl.col("cit_age") >= 0)

freshness_agg = bwd_ages.group_by("citing_co").agg(
    pl.col("cit_age").mean().alias("mean_cit_age")
).rename({"citing_co": "company"})

# Compute raw metrics for each company
print("  Computing 8 raw metrics per company...")
raw_metrics = {}

for company in target_companies:
    c_pats = pa.filter(pl.col("company") == company)
    c_pids = c_pats["patent_id"]
    n = len(c_pats)
    if n == 0:
        continue

    # 1. BREADTH
    c_cpc = cpc_sections.filter(pl.col("patent_id").is_in(c_pids))
    breadth = len(c_cpc["cpc_section"].unique())

    # 2. DEPTH (HHI of subclass distribution)
    c_sub = cpc.filter(pl.col("patent_id").is_in(c_pids)).select(["patent_id", "cpc_subclass"]).unique()
    sc = c_sub.group_by("cpc_subclass").agg(pl.len().alias("n"))
    total = sc["n"].sum()
    depth = float(np.sum((sc["n"].to_numpy() / total) ** 2)) if total > 0 else 0.0

    # 3. DEFENSIVENESS
    sc_row = self_cit_agg.filter(pl.col("company") == company)
    defensiveness = float(sc_row["self_cite_rate"][0]) if len(sc_row) > 0 else 0.0

    # 4. INFLUENCE (avg forward citations)
    c_fwd = c_pats.join(fwd_cit, on="patent_id", how="left").with_columns(
        pl.col("fwd_citations").fill_null(0)
    )
    influence = float(c_fwd["fwd_citations"].mean())

    # 5. SCIENCE INTENSITY (NPL ratio)
    if has_npl:
        c_npl = c_pats.join(npl_count, on="patent_id", how="left").with_columns(
            pl.col("npl_count").fill_null(0)
        )
        c_bwd = c_pats.join(bwd_count, on="patent_id", how="left").with_columns(
            pl.col("bwd_citations").fill_null(0)
        )
        total_refs = float(c_bwd["bwd_citations"].sum() + c_npl["npl_count"].sum())
        sci = float(c_npl["npl_count"].sum()) / total_refs if total_refs > 0 else 0.0
    else:
        sci = 0.0

    # 6. SPEED (inverse median grant lag)
    c_app = c_pats.join(application.select(["patent_id", "file_date"]), on="patent_id", how="inner")
    c_app = c_app.with_columns(
        (pl.col("grant_date") - pl.col("file_date")).dt.total_days().alias("lag")
    ).filter((pl.col("lag") > 0) & (pl.col("lag") < 7300))
    speed = 1.0 / float(c_app["lag"].median()) if len(c_app) > 0 else 0.0

    # 7. COLLABORATION (avg team size)
    c_team = c_pats.join(team_size, on="patent_id", how="left").with_columns(
        pl.col("team_size").fill_null(1)
    )
    collab = float(c_team["team_size"].mean())

    # 8. FRESHNESS (inverse mean citation age)
    fr_row = freshness_agg.filter(pl.col("company") == company)
    if len(fr_row) > 0 and float(fr_row["mean_cit_age"][0]) > 0:
        fresh = 1.0 / float(fr_row["mean_cit_age"][0])
    else:
        fresh = 0.0

    raw_metrics[company] = {
        "breadth": breadth, "depth": depth, "defensiveness": defensiveness,
        "influence": influence, "science_intensity": sci, "speed": speed,
        "collaboration": collab, "freshness": fresh,
    }

print(f"  Computed for {len(raw_metrics)} companies")

# Convert to percentile ranks
dims = ["breadth", "depth", "defensiveness", "influence",
        "science_intensity", "speed", "collaboration", "freshness"]
companies_list = sorted(raw_metrics.keys())

strategy_output = []
for c in companies_list:
    strategy_output.append({"company": c})

for dim in dims:
    vals = [raw_metrics[c][dim] for c in companies_list]
    ranks = sp_stats.rankdata(vals, method="average")
    pcts = (ranks - 1) / (len(ranks) - 1) * 100 if len(ranks) > 1 else [50.0] * len(ranks)
    for i, c in enumerate(companies_list):
        entry = next(s for s in strategy_output if s["company"] == c)
        entry[dim] = round(pcts[i], 1)

with open(f"{OUT}strategy_profiles.json", "w") as f:
    json.dump(strategy_output, f, indent=2)
print(f"  -> {len(strategy_output)} companies written")

# ══════════════════════════════════════════════════════════════
total_time = time.time() - t0
print(f"\n{'═' * 60}")
print(f"ALL DONE in {total_time:.0f}s ({total_time/60:.1f} min)")
print(f"{'═' * 60}")
