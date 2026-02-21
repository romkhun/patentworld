#!/usr/bin/env python3
"""
Compute quality metrics for all PatentWorld chapter groupings.
Uses ALL patent-level records from PatentsView (no subsetting).
Powered by Polars for automatic multi-core parallelism.
Hardware: 38 CPU cores, 700 GB RAM.
"""

import polars as pl
import json
import zipfile
import os
import io
import gc
import time

DATA_DIR = '/media/saerom/saerom-ssd/Dropbox (Penn)/Research/PatentsView'
OUT_DIR = '/home/saerom/projects/patentworld/public/data/computed'
os.makedirs(OUT_DIR, exist_ok=True)

T0 = time.time()
def elapsed():
    return f"[{time.time()-T0:.0f}s]"

def read_tsv_zip(filename, columns=None, dtypes=None):
    path = os.path.join(DATA_DIR, filename)
    print(f"{elapsed()} Reading {filename}...", flush=True)
    with zipfile.ZipFile(path) as zf:
        tsv_name = zf.infolist()[0].filename
        with zf.open(tsv_name) as f:
            data = f.read()
    schema_overrides = dtypes or {}
    df = pl.read_csv(
        io.BytesIO(data),
        separator='\t',
        columns=columns,
        schema_overrides=schema_overrides,
        infer_schema_length=10000,
        null_values=['', 'NULL', 'null', 'NA', 'None'],
        ignore_errors=True,
    )
    del data
    print(f"  -> {df.height:,} rows, {df.width} columns", flush=True)
    return df

def save_json(records, filename):
    path = os.path.join(OUT_DIR, filename)
    # Handle simple lists (e.g., top_states, top_cities)
    if records and not isinstance(records[0], dict):
        with open(path, 'w') as f:
            json.dump(records, f)
        print(f"  Saved: {filename} ({len(records)} items)", flush=True)
        return
    # Clean NaN/Inf for JSON dicts
    cleaned = []
    for r in records:
        row = {}
        for k, v in r.items():
            if isinstance(v, float):
                if v != v or v == float('inf') or v == float('-inf'):
                    row[k] = None
                else:
                    row[k] = round(v, 6)
            else:
                row[k] = v
        cleaned.append(row)
    with open(path, 'w') as f:
        json.dump(cleaned, f)
    print(f"  Saved: {filename} ({len(cleaned)} records)", flush=True)

def compute_quality_agg(df, group_col, filename, min_count=10):
    """Compute quality metrics grouped by (year, group_col)."""
    print(f"  {elapsed()} Aggregating by {group_col}...", flush=True)

    agg_exprs = [pl.count().alias('patent_count')]
    for col in ['num_claims', 'scope', 'forward_citations', 'backward_citations',
                'self_citation_rate', 'grant_lag_days', 'originality', 'generality']:
        if col in df.columns:
            agg_exprs.append(pl.col(col).mean().alias(f'avg_{col}'))
    if 'is_sleeping_beauty' in df.columns:
        agg_exprs.append(pl.col('is_sleeping_beauty').sum().alias('sb_sum'))

    metrics = df.group_by(['year', group_col]).agg(agg_exprs)
    metrics = metrics.filter(pl.col('patent_count') >= min_count)

    if 'sb_sum' in metrics.columns:
        metrics = metrics.with_columns(
            (pl.col('sb_sum').cast(pl.Float64) / pl.col('patent_count')).alias('sleeping_beauty_rate')
        ).drop('sb_sum')

    metrics = metrics.rename({group_col: 'group'})
    metrics = metrics.sort(['year', 'group'])
    records = metrics.to_dicts()
    save_json(records, filename)
    return len(records)


# ═══════════════════════════════════════════════════════════════════════
print(f"{elapsed()} " + "=" * 60)
print("PHASE A: Load patents + applications")
print("=" * 60, flush=True)

patents = read_tsv_zip('g_patent.tsv.zip',
    columns=['patent_id', 'patent_type', 'patent_date', 'num_claims'],
    dtypes={'patent_id': pl.Utf8, 'num_claims': pl.Float64})

patents = patents.with_columns(
    pl.col('patent_date').str.to_date('%Y-%m-%d', strict=False).alias('patent_date_parsed')
).with_columns(
    pl.col('patent_date_parsed').dt.year().cast(pl.Int16).alias('year')
).filter(
    pl.col('year').is_not_null()
)
print(f"  Patents: {patents.height:,}, years {patents['year'].min()}-{patents['year'].max()}", flush=True)

applications = read_tsv_zip('g_application.tsv.zip',
    columns=['patent_id', 'filing_date'],
    dtypes={'patent_id': pl.Utf8})

applications = applications.with_columns(
    pl.col('filing_date').str.to_date('%Y-%m-%d', strict=False).alias('filing_date_parsed')
)

patents = patents.join(
    applications.select(['patent_id', 'filing_date_parsed']),
    on='patent_id', how='left'
)
del applications; gc.collect()

# Grant lag with safe date ranges
patents = patents.with_columns(
    pl.when(
        pl.col('filing_date_parsed').is_not_null() &
        pl.col('patent_date_parsed').is_not_null() &
        (pl.col('filing_date_parsed') > pl.lit('1900-01-01').str.to_date('%Y-%m-%d')) &
        (pl.col('filing_date_parsed') < pl.lit('2026-12-31').str.to_date('%Y-%m-%d'))
    ).then(
        (pl.col('patent_date_parsed') - pl.col('filing_date_parsed')).dt.total_days().cast(pl.Float64)
    ).otherwise(None).alias('grant_lag_days')
)
# Filter out negative or extreme grant lags
patents = patents.with_columns(
    pl.when(
        (pl.col('grant_lag_days') < 0) | (pl.col('grant_lag_days') > 10950)
    ).then(None).otherwise(pl.col('grant_lag_days')).alias('grant_lag_days')
)
valid_lag = patents.filter(pl.col('grant_lag_days').is_not_null()).height
print(f"  {elapsed()} Valid grant_lag: {valid_lag:,}", flush=True)


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE B: CPC scope & primary section")
print("=" * 60, flush=True)

cpc = read_tsv_zip('g_cpc_current.tsv.zip',
    columns=['patent_id', 'cpc_section', 'cpc_subclass', 'cpc_sequence'],
    dtypes={'patent_id': pl.Utf8, 'cpc_sequence': pl.Int16})

# Scope = number of unique subclasses per patent
print(f"  {elapsed()} Computing scope...", flush=True)
scope = cpc.group_by('patent_id').agg(
    pl.col('cpc_subclass').n_unique().alias('scope')
)
patents = patents.join(scope, on='patent_id', how='left')
del scope

# Primary CPC section (sequence == 0)
print(f"  {elapsed()} Primary CPC section...", flush=True)
primary_cpc = cpc.filter(pl.col('cpc_sequence') == 0).select(['patent_id', 'cpc_section']).unique(subset=['patent_id'])
patents = patents.join(primary_cpc, on='patent_id', how='left')

# Build patent_id -> section map for originality/generality
patent_section_map = primary_cpc.select(['patent_id', 'cpc_section'])
del primary_cpc, cpc; gc.collect()
with_section = patents.filter(pl.col('cpc_section').is_not_null()).height
print(f"  {elapsed()} CPC done. Patents with section: {with_section:,}", flush=True)


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE C: Inventor features")
print("=" * 60, flush=True)

inventors = read_tsv_zip('g_inventor_disambiguated.tsv.zip',
    columns=['patent_id', 'inventor_id', 'gender_code', 'location_id'],
    dtypes={'patent_id': pl.Utf8, 'inventor_id': pl.Utf8, 'location_id': pl.Utf8})

# ── Team size ──
print(f"  {elapsed()} Team size...", flush=True)
team_size = inventors.group_by('patent_id').agg(
    pl.col('inventor_id').n_unique().alias('team_size')
)
patents = patents.join(team_size, on='patent_id', how='left')
del team_size

patents = patents.with_columns(
    pl.when(pl.col('team_size').is_null()).then(pl.lit(1))
    .otherwise(pl.col('team_size')).alias('team_size_val')
).with_columns(
    pl.when(pl.col('team_size_val') <= 1).then(pl.lit('Solo'))
    .when(pl.col('team_size_val') <= 3).then(pl.lit('2-3'))
    .when(pl.col('team_size_val') <= 6).then(pl.lit('4-6'))
    .otherwise(pl.lit('7+')).alias('team_size_cat')
).drop('team_size_val')

# ── Gender composition ──
print(f"  {elapsed()} Gender composition...", flush=True)
gender_sums = inventors.group_by('patent_id').agg([
    (pl.col('gender_code') == 'F').sum().alias('female_count'),
    (pl.col('gender_code') == 'M').sum().alias('male_count'),
])
gender_sums = gender_sums.with_columns(
    pl.when((pl.col('female_count') > 0) & (pl.col('male_count') > 0)).then(pl.lit('mixed'))
    .when(pl.col('female_count') > 0).then(pl.lit('all_female'))
    .otherwise(pl.lit('all_male')).alias('gender_group')
)
patents = patents.join(gender_sums.select(['patent_id', 'gender_group']), on='patent_id', how='left')
del gender_sums

# ── Location / Domestic vs International ──
print(f"  {elapsed()} Domestic vs international...", flush=True)
locations = read_tsv_zip('g_location_disambiguated.tsv.zip',
    columns=['location_id', 'disambig_state', 'disambig_city', 'disambig_country'],
    dtypes={'location_id': pl.Utf8})

inv_loc = inventors.join(locations, on='location_id', how='left')

patent_loc_agg = inv_loc.group_by('patent_id').agg([
    (pl.col('disambig_country') == 'US').sum().alias('us_count'),
    pl.count().alias('total_count'),
])
patent_loc_agg = patent_loc_agg.with_columns(
    pl.when(pl.col('us_count') == pl.col('total_count'))
    .then(pl.lit('domestic'))
    .otherwise(pl.lit('international')).alias('domestic_intl')
)
patents = patents.join(patent_loc_agg.select(['patent_id', 'domestic_intl']), on='patent_id', how='left')
del patent_loc_agg

# Primary inventor location (first inventor per patent by sort order)
print(f"  {elapsed()} Primary inventor location...", flush=True)
first_inv = inv_loc.sort(['patent_id']).group_by('patent_id').first()
patents = patents.join(
    first_inv.select(['patent_id', 'disambig_state', 'disambig_city', 'disambig_country']),
    on='patent_id', how='left'
)
del first_inv, inv_loc, locations; gc.collect()

# ── Inventor classifications ──
print(f"  {elapsed()} Inventor classifications...", flush=True)
inv_pat = inventors.select(['patent_id', 'inventor_id']).unique()
inv_pat = inv_pat.join(patents.select(['patent_id', 'year', 'cpc_section']), on='patent_id', how='inner')

# 1. TOP INVENTORS (top 12% by career patents)
print(f"  {elapsed()} Top inventor classification...", flush=True)
inv_total = inv_pat.group_by('inventor_id').agg(pl.count().alias('total_patents'))
top_threshold = inv_total['total_patents'].quantile(0.88)
inv_total = inv_total.with_columns(
    (pl.col('total_patents') >= top_threshold).alias('is_top')
)
top_count = inv_total.filter(pl.col('is_top')).height
print(f"    Threshold: >= {top_threshold:.0f} patents. Top: {top_count:,}/{inv_total.height:,}", flush=True)

# For each patent: has at least one top inventor?
inv_top_flag = inv_pat.select(['patent_id', 'inventor_id']).join(
    inv_total.select(['inventor_id', 'is_top']), on='inventor_id', how='left'
)
patent_has_top = inv_top_flag.group_by('patent_id').agg(
    pl.col('is_top').max().alias('has_top_inventor')
)
patents = patents.join(patent_has_top, on='patent_id', how='left')
patents = patents.with_columns(
    pl.when(pl.col('has_top_inventor').fill_null(False))
    .then(pl.lit('top_inventor'))
    .otherwise(pl.lit('other_inventor')).alias('inventor_rank')
)
del inv_top_flag, patent_has_top

# Inventor productivity by rank
print(f"  {elapsed()} Inventor productivity by rank...", flush=True)
inv_rank = inv_pat.select(['inventor_id', 'year']).join(
    inv_total.select(['inventor_id', 'is_top']), on='inventor_id', how='left'
).with_columns(
    pl.when(pl.col('is_top').fill_null(False)).then(pl.lit('top_inventor'))
    .otherwise(pl.lit('other_inventor')).alias('group')
)
inv_prod = inv_rank.group_by(['inventor_id', 'year', 'group']).agg(pl.count().alias('patents_that_year'))
prod_agg = inv_prod.group_by(['year', 'group']).agg([
    pl.col('patents_that_year').mean().alias('avg_patents_per_inventor'),
    pl.col('inventor_id').n_unique().alias('inventor_count'),
]).sort(['year', 'group'])
save_json(prod_agg.to_dicts(), 'inventor_productivity_by_rank.json')
del inv_rank, inv_prod, prod_agg

# 2. SERIAL vs NEW ENTRANT
print(f"  {elapsed()} Serial vs new entrant...", flush=True)
inv_first_year = inv_pat.group_by('inventor_id').agg(pl.col('year').min().alias('first_year'))
inv_pat_exp = inv_pat.select(['patent_id', 'inventor_id', 'year']).join(
    inv_first_year, on='inventor_id', how='left'
).with_columns(
    (pl.col('year') == pl.col('first_year')).cast(pl.Int8).alias('is_new')
)

patent_new = inv_pat_exp.group_by('patent_id').agg([
    pl.col('is_new').sum().alias('new_count'),
    pl.count().alias('inv_count'),
])
patent_new = patent_new.with_columns(
    pl.when(pl.col('new_count') == pl.col('inv_count'))
    .then(pl.lit('new_entrant'))
    .otherwise(pl.lit('serial')).alias('experience_type')
)
patents = patents.join(patent_new.select(['patent_id', 'experience_type']), on='patent_id', how='left')

# Inventor productivity by experience
print(f"  {elapsed()} Inventor productivity by experience...", flush=True)
inv_pat_exp = inv_pat_exp.with_columns(
    pl.when(pl.col('is_new') > 0).then(pl.lit('new_entrant'))
    .otherwise(pl.lit('serial')).alias('group')
)
exp_prod = inv_pat_exp.group_by(['inventor_id', 'year', 'group']).agg(pl.count().alias('patents_that_year'))
exp_agg = exp_prod.group_by(['year', 'group']).agg([
    pl.col('patents_that_year').mean().alias('avg_patents_per_inventor'),
    pl.col('inventor_id').n_unique().alias('inventor_count'),
]).sort(['year', 'group'])
save_json(exp_agg.to_dicts(), 'inventor_productivity_by_experience.json')
del inv_pat_exp, patent_new, inv_first_year, exp_prod, exp_agg

# 3. SPECIALIST vs GENERALIST
print(f"  {elapsed()} Specialist vs generalist...", flush=True)
inv_section_count = inv_pat.filter(pl.col('cpc_section').is_not_null()).group_by('inventor_id').agg(
    pl.col('cpc_section').n_unique().alias('n_sections')
)
inv_section_count = inv_section_count.with_columns(
    (pl.col('n_sections') == 1).alias('is_specialist')
)

inv_spec = inv_pat.select(['patent_id', 'inventor_id']).join(
    inv_section_count.select(['inventor_id', 'is_specialist']), on='inventor_id', how='left'
)
patent_spec = inv_spec.group_by('patent_id').agg([
    pl.col('is_specialist').fill_null(False).cast(pl.Int8).sum().alias('spec_sum'),
    pl.count().alias('total'),
])
patent_spec = patent_spec.with_columns(
    pl.when(pl.col('spec_sum') * 2 >= pl.col('total'))
    .then(pl.lit('specialist'))
    .otherwise(pl.lit('generalist')).alias('inventor_type')
)
patents = patents.join(patent_spec.select(['patent_id', 'inventor_type']), on='patent_id', how='left')

# Inventor productivity by specialization
print(f"  {elapsed()} Inventor productivity by specialization...", flush=True)
inv_spec_prod = inv_pat.select(['inventor_id', 'year']).join(
    inv_section_count.select(['inventor_id', 'is_specialist']), on='inventor_id', how='left'
).with_columns(
    pl.when(pl.col('is_specialist').fill_null(False)).then(pl.lit('specialist'))
    .otherwise(pl.lit('generalist')).alias('group')
)
spec_prod = inv_spec_prod.group_by(['inventor_id', 'year', 'group']).agg(pl.count().alias('patents_that_year'))
spec_agg = spec_prod.group_by(['year', 'group']).agg([
    pl.col('patents_that_year').mean().alias('avg_patents_per_inventor'),
    pl.col('inventor_id').n_unique().alias('inventor_count'),
]).sort(['year', 'group'])
save_json(spec_agg.to_dicts(), 'inventor_productivity_by_specialization.json')
del inv_spec, patent_spec, inv_section_count, inv_spec_prod, spec_prod, spec_agg

# Gender productivity
print(f"  {elapsed()} Inventor productivity by gender...", flush=True)
inv_gender = inventors.select(['patent_id', 'inventor_id', 'gender_code']).unique()
inv_gender = inv_gender.join(patents.select(['patent_id', 'year']), on='patent_id', how='inner')
inv_gender = inv_gender.filter(pl.col('gender_code').is_in(['M', 'F']))
inv_gender = inv_gender.with_columns(
    pl.when(pl.col('gender_code') == 'F').then(pl.lit('female'))
    .otherwise(pl.lit('male')).alias('group')
)
gen_prod = inv_gender.group_by(['inventor_id', 'year', 'group']).agg(pl.count().alias('patents_that_year'))
gen_agg = gen_prod.group_by(['year', 'group']).agg([
    pl.col('patents_that_year').mean().alias('avg_patents_per_inventor'),
    pl.col('inventor_id').n_unique().alias('inventor_count'),
]).sort(['year', 'group'])
save_json(gen_agg.to_dicts(), 'inventor_productivity_by_gender.json')
del inv_gender, gen_prod, gen_agg

# Team size productivity
print(f"  {elapsed()} Inventor productivity by team size...", flush=True)
inv_team = inv_pat.select(['inventor_id', 'year', 'patent_id']).join(
    patents.select(['patent_id', 'team_size_cat']), on='patent_id', how='inner'
)
team_prod = inv_team.group_by(['inventor_id', 'year', 'team_size_cat']).agg(pl.count().alias('patents_that_year'))
team_prod = team_prod.rename({'team_size_cat': 'group'})
team_agg = team_prod.group_by(['year', 'group']).agg([
    pl.col('patents_that_year').mean().alias('avg_patents_per_inventor'),
    pl.col('inventor_id').n_unique().alias('inventor_count'),
]).sort(['year', 'group'])
save_json(team_agg.to_dicts(), 'inventor_productivity_by_team_size.json')
del inv_team, team_prod, team_agg
del inv_pat, inv_total, inventors; gc.collect()
print(f"  {elapsed()} Phase C complete.", flush=True)


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE D: Assignees")
print("=" * 60, flush=True)

assignees = read_tsv_zip('g_assignee_disambiguated.tsv.zip',
    columns=['patent_id', 'assignee_id', 'disambig_assignee_organization', 'assignee_sequence'],
    dtypes={'patent_id': pl.Utf8, 'assignee_id': pl.Utf8, 'assignee_sequence': pl.Int16})

primary = assignees.filter(pl.col('assignee_sequence') == 0).select(
    ['patent_id', 'assignee_id', 'disambig_assignee_organization']
).unique(subset=['patent_id'])
primary = primary.rename({
    'assignee_id': 'primary_assignee_id',
    'disambig_assignee_organization': 'primary_assignee_org'
})
patents = patents.join(primary, on='patent_id', how='left')

# Build assignee map for self-citation
assignee_map = primary.select(['patent_id', 'primary_assignee_id'])
del primary, assignees; gc.collect()

top_assignees = patents.group_by('primary_assignee_org').agg(
    pl.count().alias('cnt')
).sort('cnt', descending=True).head(50)
print(f"  {elapsed()} Top assignee: {top_assignees[0, 'primary_assignee_org']} ({top_assignees[0, 'cnt']:,})", flush=True)
top_assignee_list = top_assignees['primary_assignee_org'].to_list()


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE E: Citation metrics")
print("=" * 60, flush=True)

citations = read_tsv_zip('g_us_patent_citation.tsv.zip',
    columns=['patent_id', 'citation_patent_id'],
    dtypes={'patent_id': pl.Utf8, 'citation_patent_id': pl.Utf8})

# Forward citations
print(f"  {elapsed()} Forward citations...", flush=True)
fwd = citations.group_by('citation_patent_id').agg(
    pl.count().alias('forward_citations')
).rename({'citation_patent_id': 'patent_id'})
patents = patents.join(fwd, on='patent_id', how='left')
patents = patents.with_columns(pl.col('forward_citations').fill_null(0).cast(pl.Int32))
del fwd
mean_fwd = patents['forward_citations'].mean()
print(f"    Mean: {mean_fwd:.2f}", flush=True)

# Backward citations
print(f"  {elapsed()} Backward citations...", flush=True)
bwd = citations.group_by('patent_id').agg(
    pl.count().alias('backward_citations')
)
patents = patents.join(bwd, on='patent_id', how='left')
patents = patents.with_columns(pl.col('backward_citations').fill_null(0).cast(pl.Int32))
del bwd
mean_bwd = patents['backward_citations'].mean()
print(f"    Mean: {mean_bwd:.2f}", flush=True)

# Self-citations
print(f"  {elapsed()} Self-citations...", flush=True)
cit_with_assignees = citations.join(
    assignee_map.rename({'primary_assignee_id': 'citing_assignee'}),
    on='patent_id', how='left'
).join(
    assignee_map.rename({'patent_id': 'citation_patent_id', 'primary_assignee_id': 'cited_assignee'}),
    on='citation_patent_id', how='left'
)
cit_with_assignees = cit_with_assignees.with_columns(
    (pl.col('citing_assignee').is_not_null() &
     pl.col('cited_assignee').is_not_null() &
     (pl.col('citing_assignee') == pl.col('cited_assignee'))).cast(pl.Int8).alias('is_self')
)
self_agg = cit_with_assignees.group_by('patent_id').agg([
    pl.col('is_self').sum().alias('self_count'),
    pl.count().alias('total_count'),
])
self_agg = self_agg.with_columns(
    (pl.col('self_count').cast(pl.Float64) / pl.col('total_count')).alias('self_citation_rate')
)
patents = patents.join(self_agg.select(['patent_id', 'self_citation_rate']), on='patent_id', how='left')
del self_agg, cit_with_assignees, assignee_map
mean_self = patents['self_citation_rate'].mean()
print(f"  {elapsed()} Mean self-citation rate: {mean_self:.4f}", flush=True)


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE F: Originality & Generality")
print("=" * 60, flush=True)

# Originality = 1 - HHI of CPC sections of backward citations
print(f"  {elapsed()} Originality...", flush=True)
cit_orig = citations.join(
    patent_section_map.rename({'cpc_section': 'cited_section'}),
    left_on='citation_patent_id', right_on='patent_id', how='inner'
)
# Count per (patent_id, cited_section), compute share^2, sum -> HHI
orig_counts = cit_orig.group_by(['patent_id', 'cited_section']).agg(pl.count().alias('cnt'))
orig_with_total = orig_counts.join(
    orig_counts.group_by('patent_id').agg(pl.col('cnt').sum().alias('total')),
    on='patent_id', how='left'
)
orig_with_total = orig_with_total.with_columns(
    ((pl.col('cnt').cast(pl.Float64) / pl.col('total')) ** 2).alias('share_sq')
)
orig_hhi = orig_with_total.group_by('patent_id').agg([
    pl.col('share_sq').sum().alias('hhi'),
    pl.col('cited_section').n_unique().alias('n_sections'),
])
orig_hhi = orig_hhi.with_columns(
    pl.when(pl.col('n_sections') == 1).then(pl.lit(0.0))
    .otherwise((1.0 - pl.col('hhi')).clip(0.0, 1.0)).alias('originality')
)
patents = patents.join(orig_hhi.select(['patent_id', 'originality']), on='patent_id', how='left')
del orig_counts, orig_with_total, orig_hhi, cit_orig; gc.collect()
mean_orig = patents['originality'].mean()
print(f"  {elapsed()} Mean originality: {mean_orig:.4f}", flush=True)

# Generality = 1 - HHI of CPC sections of forward citations
print(f"  {elapsed()} Generality...", flush=True)
cit_gen = citations.join(
    patent_section_map.rename({'cpc_section': 'citing_section'}),
    on='patent_id', how='inner'
).select(['citation_patent_id', 'citing_section']).rename({'citation_patent_id': 'patent_id'})

gen_counts = cit_gen.group_by(['patent_id', 'citing_section']).agg(pl.count().alias('cnt'))
gen_with_total = gen_counts.join(
    gen_counts.group_by('patent_id').agg(pl.col('cnt').sum().alias('total')),
    on='patent_id', how='left'
)
gen_with_total = gen_with_total.with_columns(
    ((pl.col('cnt').cast(pl.Float64) / pl.col('total')) ** 2).alias('share_sq')
)
gen_hhi = gen_with_total.group_by('patent_id').agg([
    pl.col('share_sq').sum().alias('hhi'),
    pl.col('citing_section').n_unique().alias('n_sections'),
])
gen_hhi = gen_hhi.with_columns(
    pl.when(pl.col('n_sections') == 1).then(pl.lit(0.0))
    .otherwise((1.0 - pl.col('hhi')).clip(0.0, 1.0)).alias('generality')
)
patents = patents.join(gen_hhi.select(['patent_id', 'generality']), on='patent_id', how='left')
del gen_counts, gen_with_total, gen_hhi, cit_gen, patent_section_map; gc.collect()
mean_gen = patents['generality'].mean()
print(f"  {elapsed()} Mean generality: {mean_gen:.4f}", flush=True)


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE G: Sleeping Beauty")
print("=" * 60, flush=True)

print(f"  {elapsed()} Computing early/late citations...", flush=True)
patent_year_map = patents.select(['patent_id', 'year']).rename({'year': 'patent_year'})

cit_years = citations.join(
    patent_year_map.rename({'patent_id': 'citing_id', 'patent_year': 'citing_year'}),
    left_on='patent_id', right_on='citing_id', how='inner'
).join(
    patent_year_map.rename({'patent_id': 'cited_id', 'patent_year': 'cited_year'}),
    left_on='citation_patent_id', right_on='cited_id', how='inner'
)
cit_years = cit_years.with_columns(
    (pl.col('citing_year') - pl.col('cited_year')).alias('years_after')
).filter(
    pl.col('years_after') >= 0
)

early_cites = cit_years.filter(pl.col('years_after') <= 10).group_by('citation_patent_id').agg(
    pl.count().alias('early_cites')
).rename({'citation_patent_id': 'patent_id'})
late_cites = cit_years.filter(pl.col('years_after') > 10).group_by('citation_patent_id').agg(
    pl.count().alias('late_cites')
).rename({'citation_patent_id': 'patent_id'})

patents = patents.join(early_cites, on='patent_id', how='left')
patents = patents.join(late_cites, on='patent_id', how='left')
patents = patents.with_columns([
    pl.col('early_cites').fill_null(0).cast(pl.Int32),
    pl.col('late_cites').fill_null(0).cast(pl.Int32),
])

patents = patents.with_columns(
    ((pl.col('year') <= 2015) &
     (pl.col('early_cites') <= 5) &
     (pl.col('forward_citations') >= 50) &
     (pl.col('late_cites') > pl.col('early_cites') * 3)).alias('is_sleeping_beauty')
)
sb_count = patents.filter(pl.col('is_sleeping_beauty')).height
print(f"  {elapsed()} Sleeping beauties: {sb_count:,}", flush=True)
del cit_years, early_cites, late_cites, citations, patent_year_map; gc.collect()


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("PHASE H: Aggregate by all groupings")
print("=" * 60, flush=True)

print(f"  Master table: {patents.height:,} rows, {patents.width} cols", flush=True)

# 1. By CPC Section (Ch 3)
print(f"\n  {elapsed()} [1/11] CPC section...", flush=True)
compute_quality_agg(patents.filter(pl.col('cpc_section').is_not_null()), 'cpc_section', 'quality_by_cpc_section.json')

# 2. By Company (Ch 10)
print(f"\n  {elapsed()} [2/11] Company...", flush=True)
compute_quality_agg(patents.filter(pl.col('primary_assignee_org').is_in(top_assignee_list)),
                    'primary_assignee_org', 'quality_by_company.json', min_count=5)

# 3. Top vs Other (Ch 13)
print(f"\n  {elapsed()} [3/11] Inventor rank...", flush=True)
compute_quality_agg(patents, 'inventor_rank', 'quality_by_inventor_rank.json')

# 4. Generalist vs Specialist (Ch 14)
print(f"\n  {elapsed()} [4/11] Specialization...", flush=True)
compute_quality_agg(patents.filter(pl.col('inventor_type').is_not_null()), 'inventor_type', 'quality_by_specialization.json')

# 5. Serial vs New Entrant (Ch 15)
print(f"\n  {elapsed()} [5/11] Experience...", flush=True)
compute_quality_agg(patents.filter(pl.col('experience_type').is_not_null()), 'experience_type', 'quality_by_experience.json')

# 6. Gender (Ch 16)
print(f"\n  {elapsed()} [6/11] Gender...", flush=True)
compute_quality_agg(patents.filter(pl.col('gender_group').is_not_null()), 'gender_group', 'quality_by_gender.json')

# 7. Team Size (Ch 17)
print(f"\n  {elapsed()} [7/11] Team size...", flush=True)
compute_quality_agg(patents, 'team_size_cat', 'quality_by_team_size.json')

# 8. US State (Ch 18)
print(f"\n  {elapsed()} [8/11] State...", flush=True)
us_pat = patents.filter(pl.col('disambig_country') == 'US')
top_states_df = us_pat.group_by('disambig_state').agg(pl.count().alias('cnt')).sort('cnt', descending=True).head(15)
top_states = top_states_df['disambig_state'].to_list()
compute_quality_agg(us_pat.filter(pl.col('disambig_state').is_in(top_states)), 'disambig_state', 'quality_by_state.json')
save_json(top_states, 'top_states.json')

# 9. US City (Ch 18)
print(f"\n  {elapsed()} [9/11] City...", flush=True)
us_pat2 = us_pat.with_columns(
    (pl.col('disambig_city').fill_null('') + pl.lit(', ') + pl.col('disambig_state').fill_null('')).alias('city_state')
)
top_cities_df = us_pat2.group_by('city_state').agg(pl.count().alias('cnt')).sort('cnt', descending=True).head(15)
top_cities = top_cities_df['city_state'].to_list()
compute_quality_agg(us_pat2.filter(pl.col('city_state').is_in(top_cities)), 'city_state', 'quality_by_city.json')
save_json(top_cities, 'top_cities.json')
del us_pat, us_pat2

# 10. Domestic vs International (Ch 19)
print(f"\n  {elapsed()} [10/11] Domestic vs international...", flush=True)
compute_quality_agg(patents.filter(pl.col('domestic_intl').is_not_null()), 'domestic_intl', 'quality_by_domestic_intl.json')

# 11. Country (Ch 19)
print(f"\n  {elapsed()} [11/11] Country...", flush=True)
top_countries_df = patents.group_by('disambig_country').agg(pl.count().alias('cnt')).sort('cnt', descending=True).head(15)
top_countries = top_countries_df['disambig_country'].to_list()
compute_quality_agg(patents.filter(pl.col('disambig_country').is_in(top_countries)), 'disambig_country', 'quality_by_country.json')
save_json(top_countries, 'top_countries.json')


# ═══════════════════════════════════════════════════════════════════════
print(f"\n{elapsed()} " + "=" * 60)
print("SUMMARY")
print("=" * 60, flush=True)
print(f"  Total patents: {patents.height:,}", flush=True)
print(f"  Year range: {patents['year'].min()}-{patents['year'].max()}", flush=True)
print(f"  Mean claims: {patents['num_claims'].mean():.1f}", flush=True)
print(f"  Mean scope: {patents['scope'].mean():.2f}", flush=True)
print(f"  Mean fwd citations: {patents['forward_citations'].mean():.2f}", flush=True)
print(f"  Mean bwd citations: {patents['backward_citations'].mean():.2f}", flush=True)
print(f"  Mean self-cite rate: {patents['self_citation_rate'].mean():.4f}", flush=True)
print(f"  Mean grant lag (days): {patents['grant_lag_days'].mean():.0f}", flush=True)
print(f"  Mean originality: {patents['originality'].mean():.4f}", flush=True)
print(f"  Mean generality: {patents['generality'].mean():.4f}", flush=True)
print(f"  Sleeping beauties: {patents.filter(pl.col('is_sleeping_beauty')).height:,}", flush=True)
print(f"\n  Output files:", flush=True)
for f in sorted(os.listdir(OUT_DIR)):
    size = os.path.getsize(os.path.join(OUT_DIR, f))
    print(f"    {f}: {size:,} bytes", flush=True)
print(f"\n{elapsed()} ALL COMPLETE", flush=True)
