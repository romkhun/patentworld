#!/usr/bin/env python3
"""
Track A Data Accuracy Audit — Act 1b (Chapters 4-7)
Independent verification of key claimed numbers from raw PatentsView data.

Uses Polars for performance on large datasets.
Raw data at /tmp/patentview/
"""

import polars as pl
import json
import os

RAW = "/tmp/patentview"
DATA = "/home/saerom/projects/patentworld/public/data"

print("=" * 70)
print("ACT 1b VERIFICATION SCRIPT — Raw PatentsView Data")
print("=" * 70)

# ─────────────────────────────────────────────────────────────────────
# CHAPTER 4: System Convergence
# ─────────────────────────────────────────────────────────────────────

print("\n" + "=" * 70)
print("CHAPTER 4: System Convergence")
print("=" * 70)

# Load g_patent for grant years
patent = pl.read_csv(
    os.path.join(RAW, "g_patent.tsv"),
    separator="\t",
    quote_char='"',
    columns=["patent_id", "patent_type", "patent_date"],
)
patent = patent.filter(pl.col("patent_type") == "utility")
patent = patent.with_columns(
    pl.col("patent_date").str.slice(0, 4).cast(pl.Int32).alias("year")
)
patent = patent.filter((pl.col("year") >= 1976) & (pl.col("year") <= 2025))
print(f"Loaded {patent.height:,} utility patents")

# Load CPC current (exclude Y section)
cpc = pl.read_csv(
    os.path.join(RAW, "g_cpc_current.tsv"),
    separator="\t",
    quote_char='"',
    columns=["patent_id", "cpc_section", "cpc_type"],
)
cpc = cpc.filter(
    (pl.col("cpc_section") != "Y") & (pl.col("cpc_type") == "inventional")
)
print(f"Loaded {cpc.height:,} CPC records (excl Y, inventional only)")

# Count distinct CPC sections per patent
sections_per_patent = (
    cpc.select("patent_id", "cpc_section")
    .unique()
    .group_by("patent_id")
    .agg(pl.col("cpc_section").n_unique().alias("n_sections"))
)

# Join with patent year
merged = patent.select("patent_id", "year").join(
    sections_per_patent, on="patent_id", how="inner"
)

# Multi-section rate by year
yearly = (
    merged.group_by("year")
    .agg(
        pl.count().alias("total"),
        (pl.col("n_sections") > 1).sum().alias("multi"),
    )
    .with_columns(
        (pl.col("multi") / pl.col("total") * 100).alias("multi_pct")
    )
    .sort("year")
)

row_1976 = yearly.filter(pl.col("year") == 1976)
row_2024 = yearly.filter(pl.col("year") == 2024)
print(f"\n--- Multi-section rate verification ---")
print(f"  1976: {row_1976['multi_pct'][0]:.2f}% (claim: ~21%)")
print(f"  2024: {row_2024['multi_pct'][0]:.2f}% (claim: ~40%)")

# ─────────────────────────────────────────────────────────────────────
# G-H Convergence pair verification
# ─────────────────────────────────────────────────────────────────────

print("\n--- G-H convergence pair verification ---")

# Get all multi-section patents and their section pairs
multi_patents = merged.filter(pl.col("n_sections") > 1).select("patent_id", "year")

# For multi-section patents, get all section pairs
multi_cpc = (
    cpc.select("patent_id", "cpc_section")
    .unique()
    .join(multi_patents, on="patent_id", how="inner")
)

# Create section pairs via self-join
pairs = (
    multi_cpc.join(multi_cpc, on="patent_id", suffix="_r")
    .filter(pl.col("cpc_section") < pl.col("cpc_section_r"))
    .select("patent_id", "year", "cpc_section", "cpc_section_r")
    .unique(subset=["patent_id", "cpc_section", "cpc_section_r"])
)

# Define eras
pairs = pairs.with_columns(
    pl.when(pl.col("year") <= 1995)
    .then(pl.lit("1976-1995"))
    .when(pl.col("year") <= 2010)
    .then(pl.lit("1996-2010"))
    .otherwise(pl.lit("2011-2025"))
    .alias("era")
)

# Count pairs per era
era_pair_counts = (
    pairs.group_by("era", "cpc_section", "cpc_section_r")
    .agg(pl.col("patent_id").n_unique().alias("patent_count"))
)

era_totals = (
    era_pair_counts.group_by("era")
    .agg(pl.col("patent_count").sum().alias("total"))
)

era_pair_pct = era_pair_counts.join(era_totals, on="era").with_columns(
    (pl.col("patent_count") / pl.col("total") * 100).alias("pct")
)

# Get G-H percentages
gh_early = era_pair_pct.filter(
    (pl.col("era") == "1976-1995")
    & (pl.col("cpc_section") == "G")
    & (pl.col("cpc_section_r") == "H")
)
gh_late = era_pair_pct.filter(
    (pl.col("era") == "2011-2025")
    & (pl.col("cpc_section") == "G")
    & (pl.col("cpc_section_r") == "H")
)

if gh_early.height > 0 and gh_late.height > 0:
    print(f"  1976-1995 G-H: {gh_early['pct'][0]:.2f}% (claim: 12.5%)")
    print(f"  2011-2025 G-H: {gh_late['pct'][0]:.2f}% (claim: 37.5%)")
else:
    print("  WARNING: Could not find G-H pair data")

# ─────────────────────────────────────────────────────────────────────
# IPC Multi-Section Rate
# ─────────────────────────────────────────────────────────────────────

print("\n--- IPC vs CPC multi-section rate verification ---")

ipc = pl.read_csv(
    os.path.join(RAW, "g_ipc_at_issue.tsv"),
    separator="\t",
    quote_char='"',
    columns=["patent_id", "section"],
)
ipc = ipc.filter(pl.col("section").is_not_null() & (pl.col("section") != ""))

ipc_sections = (
    ipc.select("patent_id", "section")
    .unique()
    .group_by("patent_id")
    .agg(pl.col("section").n_unique().alias("n_ipc_sections"))
)

ipc_merged = patent.select("patent_id", "year").join(
    ipc_sections, on="patent_id", how="inner"
)

ipc_yearly = (
    ipc_merged.group_by("year")
    .agg(
        pl.count().alias("total"),
        (pl.col("n_ipc_sections") > 1).sum().alias("multi"),
    )
    .with_columns(
        (pl.col("multi") / pl.col("total") * 100).alias("multi_pct")
    )
    .sort("year")
)

for yr in [1976, 2024]:
    row = ipc_yearly.filter(pl.col("year") == yr)
    if row.height > 0:
        print(f"  {yr} IPC multi-section: {row['multi_pct'][0]:.2f}%")


# ─────────────────────────────────────────────────────────────────────
# CHAPTER 7: Public Investment
# ─────────────────────────────────────────────────────────────────────

print("\n" + "=" * 70)
print("CHAPTER 7: Public Investment")
print("=" * 70)

# Load government interest
gov = pl.read_csv(
    os.path.join(RAW, "g_gov_interest.tsv"),
    separator="\t",
    quote_char='"',
    columns=["patent_id"],
)
gov = gov.unique()
print(f"Gov interest patents: {gov.height:,}")

# Join with patent year
gov_yearly = (
    gov.join(patent.select("patent_id", "year"), on="patent_id", how="inner")
    .group_by("year")
    .agg(pl.col("patent_id").n_unique().alias("count"))
    .sort("year")
)

for yr in [1980, 2019]:
    row = gov_yearly.filter(pl.col("year") == yr)
    if row.height > 0:
        print(f"  {yr} gov-funded patent count: {row['count'][0]:,} (claimed: {1294 if yr == 1980 else 8359})")

# Load government interest orgs for agency totals
gov_org = pl.read_csv(
    os.path.join(RAW, "g_gov_interest_org.tsv"),
    separator="\t",
    quote_char='"',
    columns=["patent_id", "level_one"],
)

agency_totals = (
    gov_org.group_by("level_one")
    .agg(pl.col("patent_id").n_unique().alias("total_patents"))
    .sort("total_patents", descending=True)
)

print("\n--- Top agencies ---")
for row in agency_totals.head(5).iter_rows(named=True):
    print(f"  {row['level_one']}: {row['total_patents']:,}")

print("\nClaimed: HHS 55,587 | Defense 43,736 | Energy 33,994")

# ─────────────────────────────────────────────────────────────────────
# CHAPTER 6: Patent Law data-driven claims
# ─────────────────────────────────────────────────────────────────────

print("\n" + "=" * 70)
print("CHAPTER 6: Patent Law (data-driven claims only)")
print("=" * 70)

# Pipeline: applications vs grants
app = pl.read_csv(
    os.path.join(RAW, "g_application.tsv"),
    separator="\t",
    quote_char='"',
    columns=["patent_id", "filing_date"],
)
app = app.with_columns(
    pl.col("filing_date").str.slice(0, 4).cast(pl.Int32, strict=False).alias("filing_year")
)
app = app.filter((pl.col("filing_year") >= 1976) & (pl.col("filing_year") <= 2025))

# Applications per year (from filing_date of eventually-granted patents)
apps_yearly = (
    app.filter(pl.col("filing_year").is_not_null())
    .group_by("filing_year")
    .agg(pl.col("patent_id").n_unique().alias("applications"))
    .sort("filing_year")
)

early_apps = apps_yearly.filter(pl.col("filing_year").is_in([1976, 1977, 1978, 1979]))
avg_apps = early_apps["applications"].mean()
app_2019 = apps_yearly.filter(pl.col("filing_year") == 2019)
print(f"\nPipeline verification:")
print(f"  Avg applications 1976-79: {avg_apps:,.0f} (claim: ~66,000)")
if app_2019.height > 0:
    print(f"  2019 applications: {app_2019['applications'][0]:,} (claim: ~349,000)")

# Grants per year
grants_yearly = (
    patent.group_by("year")
    .agg(pl.col("patent_id").n_unique().alias("grants"))
    .sort("year")
)
early_grants = grants_yearly.filter(pl.col("year").is_in([1976, 1977, 1978, 1979]))
avg_grants = early_grants["grants"].mean()
grant_2019 = grants_yearly.filter(pl.col("year") == 2019)
print(f"  Avg grants 1976-79: {avg_grants:,.0f}")
if grant_2019.height > 0:
    print(f"  2019 grants: {grant_2019['grants'][0]:,}")


print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)
