"""Compute strategy_profiles.json for all companies.

8 dimensions, each converted to percentile rank (0-100) within the company universe:
- breadth: number of distinct CPC sections
- depth: Herfindahl index of CPC subclass distribution
- defensiveness: self-citation rate (fraction of backward citations to own patents)
- influence: average forward citations per patent
- science_intensity: fraction of non-patent references
- speed: inverse of median grant lag
- collaboration: average team size (inventors per patent)
- freshness: average recency of backward citations (1 / mean citation age)
"""
import polars as pl
import json, time
import numpy as np
from scipy import stats as sp_stats

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

print(f"Computing strategy profiles for {len(target_companies)} companies...")

# ── Load assignee data ──
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
assignee_full = assignee.clone()  # Keep full for self-citation check
assignee = assignee.unique(subset=["patent_id"], keep="first")
print(f"  Company patents: {len(assignee):,}")

# ── Load patent data ──
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

# Join patent + assignee
pa = patent.join(assignee.select(["patent_id", "company"]), on="patent_id", how="inner")
print(f"  Joined: {len(pa):,}")

# ── Load CPC data ──
print("Loading g_cpc_current...")
cpc = pl.read_csv(
    f"{DATA}g_cpc_current.tsv.zip",
    separator="\t",
    columns=["patent_id", "cpc_section", "cpc_subclass", "cpc_type"],
    infer_schema_length=10000,
)
cpc = cpc.filter(pl.col("cpc_type") == "inventional")

# ── Load application data for grant lag ──
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
application = application.filter(pl.col("file_date").is_not_null())
application = application.filter(pl.col("file_date").dt.year() >= 1950)

# ── Load inventor data for team size ──
print("Loading g_inventor_disambiguated...")
inventor = pl.read_csv(
    f"{DATA}g_inventor_disambiguated.tsv.zip",
    separator="\t",
    columns=["patent_id", "inventor_id"],
    infer_schema_length=10000,
)
team_size = inventor.group_by("patent_id").agg(pl.n_unique("inventor_id").alias("team_size"))
print(f"  Team sizes computed for {len(team_size):,} patents")

# ── Load citations ──
print("Loading g_us_patent_citation...")
citations = pl.read_csv(
    f"{DATA}g_us_patent_citation.tsv.zip",
    separator="\t",
    columns=["patent_id", "citation_patent_id"],
    infer_schema_length=10000,
)
# Forward citations per patent
fwd_cit = citations.group_by("citation_patent_id").agg(
    pl.len().alias("fwd_citations")
).rename({"citation_patent_id": "patent_id"})

# Backward citations per patent
bwd_count = citations.group_by("patent_id").agg(
    pl.len().alias("bwd_citations")
)

# ── Load non-patent references for science intensity ──
print("Loading g_other_reference...")
try:
    other_ref = pl.read_csv(
        f"{DATA}g_other_reference.tsv.zip",
        separator="\t",
        columns=["patent_id"],
        infer_schema_length=10000,
    )
    npl_count = other_ref.group_by("patent_id").agg(
        pl.len().alias("npl_count")
    )
    print(f"  NPL references: {len(npl_count):,} patents")
    has_npl = True
except Exception as e:
    print(f"  Could not load NPL data: {e}")
    has_npl = False

# ── Compute self-citation rate ──
print("\nComputing self-citations...")
# For each company's patent, count backward citations that go to the same company's patents
# Get all patent_ids belonging to each company
company_patents = assignee.select(["patent_id", "company"])

# Get backward citations with company info
bwd_with_company = citations.join(
    company_patents.rename({"patent_id": "citing_patent", "company": "citing_company"}),
    left_on="patent_id", right_on="citing_patent", how="inner"
)
bwd_with_company = bwd_with_company.join(
    company_patents.rename({"patent_id": "cited_patent", "company": "cited_company"}),
    left_on="citation_patent_id", right_on="cited_patent", how="left"
)
# Self-citation: citing_company == cited_company
self_cit = bwd_with_company.with_columns(
    (pl.col("citing_company") == pl.col("cited_company")).alias("is_self_cite")
)
self_cit_rate = self_cit.group_by("citing_company").agg([
    pl.col("is_self_cite").sum().alias("self_cites"),
    pl.len().alias("total_bwd_cites"),
]).with_columns(
    (pl.col("self_cites") / pl.col("total_bwd_cites")).alias("self_cite_rate")
).rename({"citing_company": "company"})

# ── Compute backward citation freshness ──
print("Computing citation freshness...")
# For each backward citation, compute age = citing patent year - cited patent year
patent_years = patent.select(["patent_id", "year"])
bwd_ages = citations.join(
    company_patents, on="patent_id", how="inner"  # citing patent company
).join(
    patent_years.rename({"patent_id": "citing_id", "year": "citing_year"}),
    left_on="patent_id", right_on="citing_id", how="inner"
).join(
    patent_years.rename({"patent_id": "cited_id", "year": "cited_year"}),
    left_on="citation_patent_id", right_on="cited_id", how="inner"
).with_columns(
    (pl.col("citing_year") - pl.col("cited_year")).alias("citation_age")
).filter(pl.col("citation_age") >= 0)

freshness_raw = bwd_ages.group_by("company").agg(
    pl.col("citation_age").mean().alias("mean_citation_age")
)

# ── Now compute all 8 raw metrics per company ──
print("\nAggregating metrics per company...")

results = {}

for company in target_companies:
    c_patents = pa.filter(pl.col("company") == company)
    c_patent_ids = c_patents["patent_id"]
    n_patents = len(c_patents)
    if n_patents == 0:
        continue

    # 1. BREADTH: distinct CPC sections
    c_cpc = cpc.filter(pl.col("patent_id").is_in(c_patent_ids))
    c_sections = c_cpc["cpc_section"].unique()
    breadth_val = len(c_sections)

    # 2. DEPTH: Herfindahl index of CPC subclass distribution
    subclass_counts = c_cpc.group_by("cpc_subclass").agg(pl.len().alias("n"))
    total = subclass_counts["n"].sum()
    if total > 0:
        shares = subclass_counts["n"].to_numpy() / total
        depth_val = float(np.sum(shares ** 2))
    else:
        depth_val = 0.0

    # 3. DEFENSIVENESS: self-citation rate
    sc_row = self_cit_rate.filter(pl.col("company") == company)
    defensiveness_val = float(sc_row["self_cite_rate"][0]) if len(sc_row) > 0 else 0.0

    # 4. INFLUENCE: average forward citations per patent
    c_fwd = c_patents.join(fwd_cit, on="patent_id", how="left").with_columns(
        pl.col("fwd_citations").fill_null(0)
    )
    influence_val = float(c_fwd["fwd_citations"].mean())

    # 5. SCIENCE_INTENSITY: NPL ratio
    if has_npl:
        c_npl = c_patents.join(npl_count, on="patent_id", how="left").with_columns(
            pl.col("npl_count").fill_null(0)
        )
        c_bwd = c_patents.join(bwd_count, on="patent_id", how="left").with_columns(
            pl.col("bwd_citations").fill_null(0)
        )
        total_refs = float(c_bwd["bwd_citations"].sum() + c_npl["npl_count"].sum())
        sci_val = float(c_npl["npl_count"].sum()) / total_refs if total_refs > 0 else 0.0
    else:
        sci_val = 0.0

    # 6. SPEED: inverse of median grant lag
    c_app = c_patents.join(application.select(["patent_id", "file_date"]), on="patent_id", how="inner")
    c_app = c_app.with_columns(
        (pl.col("grant_date") - pl.col("file_date")).dt.total_days().alias("lag_days")
    ).filter((pl.col("lag_days") > 0) & (pl.col("lag_days") < 7300))
    if len(c_app) > 0:
        speed_val = 1.0 / float(c_app["lag_days"].median())
    else:
        speed_val = 0.0

    # 7. COLLABORATION: average team size
    c_team = c_patents.join(team_size, on="patent_id", how="left").with_columns(
        pl.col("team_size").fill_null(1)
    )
    collaboration_val = float(c_team["team_size"].mean())

    # 8. FRESHNESS: inverse of mean citation age
    fr_row = freshness_raw.filter(pl.col("company") == company)
    if len(fr_row) > 0 and float(fr_row["mean_citation_age"][0]) > 0:
        freshness_val = 1.0 / float(fr_row["mean_citation_age"][0])
    else:
        freshness_val = 0.0

    results[company] = {
        "breadth": breadth_val,
        "depth": depth_val,
        "defensiveness": defensiveness_val,
        "influence": influence_val,
        "science_intensity": sci_val,
        "speed": speed_val,
        "collaboration": collaboration_val,
        "freshness": freshness_val,
    }

print(f"  Computed raw metrics for {len(results)} companies")

# ── Convert to percentile ranks (0-100) ──
print("Converting to percentile ranks...")
dimensions = ["breadth", "depth", "defensiveness", "influence", "science_intensity", "speed", "collaboration", "freshness"]
companies = sorted(results.keys())

strategy_output = []
for dim in dimensions:
    raw_vals = [results[c][dim] for c in companies]
    # Percentile rank: fraction of values <= this value * 100
    ranks = sp_stats.rankdata(raw_vals, method="average")
    percentiles = (ranks - 1) / (len(ranks) - 1) * 100 if len(ranks) > 1 else [50.0] * len(ranks)
    for i, c in enumerate(companies):
        if c not in [s["company"] for s in strategy_output]:
            strategy_output.append({"company": c})
        entry = next(s for s in strategy_output if s["company"] == c)
        entry[dim] = round(percentiles[i], 1)

# Sort by company name
strategy_output.sort(key=lambda x: x["company"])

with open(f"{OUT}strategy_profiles.json", "w") as f:
    json.dump(strategy_output, f, indent=2)
print(f"  Wrote strategy_profiles.json with {len(strategy_output)} companies")
print(f"\nDone in {time.time() - t0:.1f}s")
