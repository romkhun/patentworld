#!/usr/bin/env python3
"""
Batch 1 Act 1a Verification Script
Verifies hardcoded claims in Chapters 1, 2, and 3 of PatentWorld
against raw PatentsView TSV data using DuckDB.

Usage: python batch1_act1a.py
"""

import duckdb
import json
import os

# Paths
RAW = "/tmp/patentview"
DATA = "/home/saerom/projects/patentworld/public/data"

con = duckdb.connect(":memory:")
con.execute("SET threads TO 38")

print("=" * 80)
print("CHAPTER 1: PATENT COUNT VERIFICATION")
print("=" * 80)

# ─── 1. Total patent count (all types, 1976-2025) ───
print("\n[1.1] Total patents (all types) 1976-2025")
print("Claimed: 9.36 million")
result = con.execute(f"""
    SELECT COUNT(*) AS total
    FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"')
    WHERE EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
""").fetchone()
print(f"Raw data: {result[0]:,} ({result[0]/1e6:.2f}M)")

# ─── 1.2 Peak year and count (all types) ───
print("\n[1.2] Peak year (all types)")
print("Claimed: 2019 peak, 392,618 or 393,000")
result = con.execute(f"""
    SELECT EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) AS yr,
           COUNT(*) AS cnt
    FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"')
    WHERE EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) BETWEEN 1976 AND 2025
    GROUP BY yr
    ORDER BY cnt DESC
    LIMIT 5
""").fetchall()
for yr, cnt in result:
    print(f"  {int(yr)}: {cnt:,}")

# ─── 1.3 1976 total (all types) ───
print("\n[1.3] 1976 total grants (all types)")
print("Claimed: ~70,000 in 1976 (chart title says 70,941)")
result = con.execute(f"""
    SELECT COUNT(*) AS cnt
    FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"')
    WHERE EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) = 1976
""").fetchone()
print(f"Raw data: {result[0]:,}")

# Check patents_per_year.json for 1976 sum
print("JSON data sum for 1976:")
with open(f"{DATA}/chapter1/patents_per_year.json") as f:
    ppy = json.load(f)
total_1976 = sum(r['count'] for r in ppy if r['year'] == 1976)
print(f"  Sum of all types: {total_1976:,}")

# ─── 1.4 2024 total ───
print("\n[1.4] 2024 total grants (all types)")
print("Claimed: 374,000 by 2024")
result = con.execute(f"""
    SELECT COUNT(*) AS cnt
    FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"')
    WHERE EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) = 2024
""").fetchone()
print(f"Raw data: {result[0]:,}")
total_2024_json = sum(r['count'] for r in ppy if r['year'] == 2024)
print(f"JSON sum: {total_2024_json:,}")

# ─── 1.5 Average 1976-1979 ───
print("\n[1.5] Average annual grants 1976-1979")
print("Claimed: 66,000 per year (average, 1976-1979)")
totals_76_79 = []
for yr in [1976, 1977, 1978, 1979]:
    t = sum(r['count'] for r in ppy if r['year'] == yr)
    totals_76_79.append(t)
    print(f"  {yr}: {t:,}")
avg_76_79 = sum(totals_76_79) / len(totals_76_79)
print(f"  Average: {avg_76_79:,.0f}")

# ─── 1.6 Utility over 90% ───
print("\n[1.6] Utility patent share")
print("Claimed: 'over 90% of all grants'")
utility_total = sum(r['count'] for r in ppy if r['patent_type'] == 'utility')
all_total = sum(r['count'] for r in ppy)
print(f"Utility: {utility_total:,}, All: {all_total:,}, Share: {utility_total/all_total*100:.1f}%")

# ─── 1.7 Grant lag peak at 3.8 years in 2010 (by grant year) ───
print("\n[1.7] Grant lag peak (by grant year)")
print("Claimed: 3.82 years in 2010 / 3.8 years in 2010")
with open(f"{DATA}/chapter1/grant_lag.json") as f:
    lag = json.load(f)
peak_lag = max(lag, key=lambda x: x['avg_lag_days'])
print(f"Peak: year={peak_lag['year']}, avg_lag_days={peak_lag['avg_lag_days']}, avg_lag_years={peak_lag['avg_lag_days']/365.25:.2f}")

# Verify from raw data
print("\nVerifying from raw data (grant_lag = patent_date - filing_date)...")
result = con.execute(f"""
    WITH patents AS (
        SELECT p.patent_id,
               TRY_CAST(p.patent_date AS DATE) AS grant_date,
               TRY_CAST(a.filing_date AS DATE) AS file_date,
               EXTRACT(YEAR FROM TRY_CAST(p.patent_date AS DATE)) AS grant_yr
        FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"', all_varchar=true) p
        JOIN read_csv_auto('{RAW}/g_application.tsv', sep='\t', header=true, quote='"', all_varchar=true) a
          ON p.patent_id = a.patent_id
        WHERE p.patent_type = 'utility'
          AND EXTRACT(YEAR FROM TRY_CAST(p.patent_date AS DATE)) BETWEEN 2008 AND 2012
          AND TRY_CAST(a.filing_date AS DATE) IS NOT NULL
          AND TRY_CAST(p.patent_date AS DATE) IS NOT NULL
          AND TRY_CAST(a.filing_date AS DATE) >= '1970-01-01'
    )
    SELECT grant_yr,
           AVG(DATEDIFF('day', file_date, grant_date)) AS avg_lag_days,
           AVG(DATEDIFF('day', file_date, grant_date)) / 365.25 AS avg_lag_years,
           COUNT(*) AS cnt
    FROM patents
    WHERE DATEDIFF('day', file_date, grant_date) > 0
    GROUP BY grant_yr
    ORDER BY grant_yr
""").fetchall()
for yr, avg_d, avg_y, cnt in result:
    print(f"  {int(yr)}: avg_lag={avg_y:.2f}y ({avg_d:.0f} days) n={cnt:,}")

# ─── 1.8 Pendency by filing year peak ───
print("\n[1.8] Pendency peak by filing year")
print("Claimed: peaked at 3.8 years in 2006 (filing year)")
with open(f"{DATA}/chapter1/pendency_by_filing_year.json") as f:
    pend = json.load(f)
peak_pend = max(pend, key=lambda x: x['avg_pendency_years'])
print(f"Peak avg: year={peak_pend['year']}, avg={peak_pend['avg_pendency_years']:.2f}y")
peak_pend_med = max(pend, key=lambda x: x['median_pendency_years'])
print(f"Peak median: year={peak_pend_med['year']}, median={peak_pend_med['median_pendency_years']:.2f}y")

# ─── 1.9 Filing vs Grant peak ───
print("\n[1.9] Filing-year utility peak")
print("Claimed in chart title: 349,093 in 2019 (filing year), 355,923 in 2019 (grant year)")
with open(f"{DATA}/chapter1/filing_vs_grant_year.json") as f:
    fvg = json.load(f)
filing_2019 = [r for r in fvg if r['year'] == 2019 and r['series'] == 'filing_year']
grant_2019 = [r for r in fvg if r['year'] == 2019 and r['series'] == 'grant_year']
print(f"Filing year 2019: {filing_2019[0]['count']:,}" if filing_2019 else "Not found")
print(f"Grant year 2019: {grant_2019[0]['count']:,}" if grant_2019 else "Not found")

# ─── 1.10 Continuation chains: 96.3% in 2024 ───
print("\n[1.10] Related filing share in 2024")
print("Claimed: 96.3% of 2024 patents had related filings")
with open(f"{DATA}/chapter1/continuation_chains.json") as f:
    cc = json.load(f)
cc_2024 = [r for r in cc if r['year'] == 2024]
if cc_2024:
    print(f"JSON: {cc_2024[0]['related_share_pct']:.2f}%")

# ─── 1.11 Related filing share: 36% in 2002 ───
print("\n[1.11] Related filing share in 2002")
print("Claimed: 36% in 2002")
cc_2002 = [r for r in cc if r['year'] == 2002]
if cc_2002:
    print(f"JSON: {cc_2002[0]['related_share_pct']:.2f}%")

# ─── 1.12 Pendency 2.7 years by 2023 ───
print("\n[1.12] Grant lag by 2023 (grant year)")
print("Claimed in InsightRecap: '2.7 years by 2023'")
lag_2023 = [r for r in lag if r['year'] == 2023]
if lag_2023:
    print(f"JSON: avg_lag_days={lag_2023[0]['avg_lag_days']}, avg_lag_years={lag_2023[0]['avg_lag_days']/365.25:.2f}")

# ─── 1.13 Five-fold increase ───
print("\n[1.13] Five-fold increase check")
total_1976_all = sum(r['count'] for r in ppy if r['year'] == 1976)
total_2024_all = sum(r['count'] for r in ppy if r['year'] == 2024)
print(f"1976: {total_1976_all:,}, 2024: {total_2024_all:,}, ratio: {total_2024_all/total_1976_all:.1f}x")

print("\n" + "=" * 80)
print("CHAPTER 2: PATENT QUALITY VERIFICATION")
print("=" * 80)

# ─── 2.1 Claims: 9.4 in 1976, peak 18.9 in 2005 ───
print("\n[2.1] Claims per patent")
print("Claimed: 9.4 in 1976, peak 18.9 in 2005, 16.6 by 2024 (median 18)")
with open(f"{DATA}/chapter1/claims_per_year.json") as f:
    claims = json.load(f)
c1976 = [r for r in claims if r['year'] == 1976][0]
c2005 = [r for r in claims if r['year'] == 2005][0]
c2024 = [r for r in claims if r['year'] == 2024][0]
c2025 = [r for r in claims if r['year'] == 2025][0]
print(f"1976: avg={c1976['avg_claims']}, median={c1976['median_claims']}")
print(f"2005: avg={c2005['avg_claims']}, median={c2005['median_claims']}")
print(f"2024: avg={c2024['avg_claims']}, median={c2024['median_claims']}")
print(f"2025: avg={c2025['avg_claims']}, median={c2025['median_claims']}")
peak_claims = max(claims, key=lambda x: x['avg_claims'])
print(f"Peak avg claims: year={peak_claims['year']}, avg={peak_claims['avg_claims']}")

# Verify from raw data
print("\nVerifying claims from raw data...")
result = con.execute(f"""
    SELECT EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) AS yr,
           AVG(TRY_CAST(num_claims AS DOUBLE)) AS avg_c,
           MEDIAN(TRY_CAST(num_claims AS DOUBLE)) AS med_c,
           COUNT(*) AS cnt
    FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"')
    WHERE patent_type = 'utility'
      AND EXTRACT(YEAR FROM TRY_CAST(patent_date AS DATE)) IN (1976, 2005, 2024)
      AND TRY_CAST(num_claims AS DOUBLE) IS NOT NULL
    GROUP BY yr
    ORDER BY yr
""").fetchall()
for yr, avg_c, med_c, cnt in result:
    print(f"  {int(yr)}: avg={avg_c:.2f}, median={med_c:.1f}, n={cnt:,}")

# ─── 2.2 Forward citations peak 6.4 in 2019 ───
print("\n[2.2] Forward citations (5-year) peak")
print("Claimed: rose from 2.5 to peak of 6.4 in 2019")
with open(f"{DATA}/chapter9/quality_trends.json") as f:
    qt = json.load(f)
qt1976 = [r for r in qt if r['year'] == 1976][0]
qt2019 = [r for r in qt if r['year'] == 2019][0]
print(f"1976: avg_fwd_5yr={qt1976['avg_forward_cites_5yr']}")
print(f"2019: avg_fwd_5yr={qt2019['avg_forward_cites_5yr']}")
fwd_peak = max([r for r in qt if r['avg_forward_cites_5yr'] is not None], key=lambda x: x['avg_forward_cites_5yr'])
print(f"Peak: year={fwd_peak['year']}, avg_fwd_5yr={fwd_peak['avg_forward_cites_5yr']}")

# ─── 2.3 Scope: 1.8 to 2.5 in 2020 ───
print("\n[2.3] Patent scope (CPC subclasses)")
print("Claimed: grew from 1.8 to peak of 2.5 CPC subclasses in 2020")
qt2020 = [r for r in qt if r['year'] == 2020][0]
print(f"1976: avg_scope={qt1976['avg_scope']}")
print(f"2020: avg_scope={qt2020['avg_scope']}")
scope_peak = max([r for r in qt if r['avg_scope'] is not None], key=lambda x: x['avg_scope'])
print(f"Peak scope: year={scope_peak['year']}, avg_scope={scope_peak['avg_scope']}")

# ─── 2.4 Originality: 0.09 to 0.25 ───
print("\n[2.4] Originality and generality")
print("Claimed: originality rose from 0.09 to 0.25; generality fell from 0.28 to 0.15")
with open(f"{DATA}/chapter9/originality_generality.json") as f:
    og = json.load(f)
og1976 = [r for r in og if r['year'] == 1976][0]
print(f"1976: originality={og1976['avg_originality']}, generality={og1976['avg_generality']}")
# Find the latest year with generality data
og_last_gen = [r for r in og if r['avg_generality'] is not None]
og_peak_orig = max(og, key=lambda x: x['avg_originality'])
og_min_gen = min(og_last_gen, key=lambda x: x['avg_generality'])
print(f"Peak originality: year={og_peak_orig['year']}, val={og_peak_orig['avg_originality']}")
print(f"Min generality: year={og_min_gen['year']}, val={og_min_gen['avg_generality']}")
# Latest with data
og_recent = [r for r in og if r['year'] >= 2020 and r['avg_generality'] is not None]
if og_recent:
    latest = max(og_recent, key=lambda x: x['year'])
    print(f"Latest with generality: year={latest['year']}, orig={latest['avg_originality']}, gen={latest['avg_generality']}")

# ─── 2.5 Self-citation: 35% to 10.5% ───
print("\n[2.5] Self-citation rates")
print("Claimed: declined from 35% to 10.5% by 2010, rebound to 13-16% in 2020s")
with open(f"{DATA}/chapter9/self_citation_rate.json") as f:
    sc = json.load(f)
sc1976 = [r for r in sc if r['year'] == 1976][0]
sc2010 = [r for r in sc if r['year'] == 2010][0]
print(f"1976: avg_self_cite_rate={sc1976['avg_self_cite_rate']} ({sc1976['avg_self_cite_rate']*100:.1f}%)")
print(f"2010: avg_self_cite_rate={sc2010['avg_self_cite_rate']} ({sc2010['avg_self_cite_rate']*100:.1f}%)")
# Minimum
sc_min = min(sc, key=lambda x: x['avg_self_cite_rate'])
print(f"Minimum: year={sc_min['year']}, rate={sc_min['avg_self_cite_rate']*100:.1f}%")
# 2020s values
for yr in [2020, 2021, 2022, 2023, 2024, 2025]:
    s = [r for r in sc if r['year'] == yr]
    if s:
        print(f"  {yr}: {s[0]['avg_self_cite_rate']*100:.1f}%")

# ─── 2.6 Backward citations: 4.9 to 21.3 ───
print("\n[2.6] Backward citations")
print("Claimed: avg rose from 4.9 in 1976 to 21.3 in 2023")
with open(f"{DATA}/chapter6/citations_per_year.json") as f:
    cpy = json.load(f)
cpy1976 = [r for r in cpy if r['year'] == 1976][0]
cpy2023 = [r for r in cpy if r['year'] == 2023][0]
print(f"1976: avg_citations={cpy1976['avg_citations']}")
print(f"2023: avg_citations={cpy2023['avg_citations']}")

# ─── 2.7 Citation lag: 2.9/3 years in 1980 to 16.2 years in 2025 ───
print("\n[2.7] Citation lag trend")
print("Claimed: grew from 2.9 years in 1980 to 16.2 years in 2025")
with open(f"{DATA}/chapter6/citation_lag_trend.json") as f:
    clt = json.load(f)
clt1980 = [r for r in clt if r['year'] == 1980][0]
clt2025 = [r for r in clt if r['year'] == 2025][0]
print(f"1980: avg_lag_years={clt1980['avg_lag_years']}")
print(f"2025: avg_lag_years={clt2025['avg_lag_years']}")

# ─── 2.8 NPL citations: 0.23 to 12.5, 54-fold ───
print("\n[2.8] NPL citations")
print("Claimed: 54-fold from 0.23 in 1976 to 12.5 in 2024")
with open(f"{DATA}/chapter2/npl_citations_per_year.json") as f:
    npl = json.load(f)
npl1976 = [r for r in npl if r['year'] == 1976][0]
npl2024 = [r for r in npl if r['year'] == 2024][0]
print(f"1976: avg_npl={npl1976['avg_npl_citations']}")
print(f"2024: avg_npl={npl2024['avg_npl_citations']}")
print(f"Ratio: {npl2024['avg_npl_citations']/npl1976['avg_npl_citations']:.1f}x")

# ─── 2.9 NPL by CPC: Chemistry at 32.3, 2.7x system avg ───
print("\n[2.9] NPL citations by CPC section")
print("Claimed: Chemistry (C) leads at 32.3 per patent, 2.7x system average")
with open(f"{DATA}/chapter2/npl_citations_by_cpc.json") as f:
    npl_cpc = json.load(f)
total_patents_npl = sum(r['patent_count'] for r in npl_cpc)
weighted_avg = sum(r['avg_npl_citations'] * r['patent_count'] for r in npl_cpc) / total_patents_npl
print(f"System average (weighted): {weighted_avg:.1f}")
for r in sorted(npl_cpc, key=lambda x: -x['avg_npl_citations']):
    print(f"  {r['cpc_section']}: {r['avg_npl_citations']} (n={r['patent_count']:,})")
chem = [r for r in npl_cpc if r['cpc_section'] == 'C'][0]
print(f"Chemistry/system ratio: {chem['avg_npl_citations']/weighted_avg:.1f}x")

# ─── 2.10 Foreign citation share: 7% to 48% ───
print("\n[2.10] Foreign citation share")
print("Claimed: rose from 7% in 1976 to 48% by 2025")
with open(f"{DATA}/chapter2/foreign_citation_share.json") as f:
    fcs = json.load(f)
fcs1976 = [r for r in fcs if r['year'] == 1976][0]
fcs2025 = [r for r in fcs if r['year'] == 2025][0]
print(f"1976: {fcs1976['avg_foreign_share_pct']:.1f}%")
print(f"2025: {fcs2025['avg_foreign_share_pct']:.1f}%")

# ─── 2.11 Figures per patent: 6.9 to 15.8 ───
print("\n[2.11] Figures per patent")
print("Claimed: more than doubled from 6.9 in 1976 to 15.8 in 2024")
with open(f"{DATA}/chapter2/figures_per_patent.json") as f:
    fpp = json.load(f)
fpp1976 = [r for r in fpp if r['year'] == 1976][0]
fpp2024 = [r for r in fpp if r['year'] == 2024][0]
print(f"1976: avg_figures={fpp1976['avg_figures']}")
print(f"2024: avg_figures={fpp2024['avg_figures']}")

# ─── 2.12 Figures by CPC: Human Necessities (A) leads at 22.2 ───
print("\n[2.12] Figures by CPC section")
print("Claimed: Human Necessities (A) leads with 22.2 figures per patent")
with open(f"{DATA}/chapter2/figures_by_cpc_section.json") as f:
    fcpc = json.load(f)
for r in sorted(fcpc, key=lambda x: -x['avg_figures']):
    print(f"  {r['cpc_section']}: avg_figures={r['avg_figures']}")

# ─── 2.13 Sleeping beauties: 94% in Human Necessities (A) ───
print("\n[2.13] Sleeping beauty concentration")
print("Claimed: 94% concentrated in Human Necessities (Section A)")
try:
    with open(f"{DATA}/chapter9/sleeping_beauties.json") as f:
        sb = json.load(f)
    sections = {}
    for r in sb:
        s = r.get('section', 'unknown')
        sections[s] = sections.get(s, 0) + 1
    total_sb = sum(sections.values())
    for s, c in sorted(sections.items(), key=lambda x: -x[1]):
        print(f"  {s}: {c} ({c/total_sb*100:.1f}%)")
except Exception as e:
    print(f"  Error: {e}")

print("\n" + "=" * 80)
print("CHAPTER 3: PATENT FIELDS VERIFICATION")
print("=" * 80)

# ─── 3.1 G+H share: 27% to 57% ───
print("\n[3.1] CPC sections G and H combined share")
print("Claimed: gained 30 ppts, rising from 27% to 57% (57.3% in KeyFindings)")
with open(f"{DATA}/chapter2/cpc_sections_per_year.json") as f:
    cpc = json.load(f)

# 1970s average
for yr in [1976, 1977, 1978, 1979]:
    yr_data = [r for r in cpc if r['year'] == yr]
    total = sum(r['count'] for r in yr_data)
    gh = sum(r['count'] for r in yr_data if r['section'] in ['G', 'H'])
    print(f"  {yr}: G+H={gh:,}, total={total:,}, share={gh/total*100:.1f}%")

# 2020s recent
for yr in [2020, 2021, 2022, 2023, 2024, 2025]:
    yr_data = [r for r in cpc if r['year'] == yr]
    total = sum(r['count'] for r in yr_data)
    gh = sum(r['count'] for r in yr_data if r['section'] in ['G', 'H'])
    print(f"  {yr}: G+H={gh:,}, total={total:,}, share={gh/total*100:.1f}%")

# Verify from raw data for recent year
print("\nVerifying G+H share from raw data for 2024...")
result = con.execute(f"""
    WITH primary_cpc AS (
        SELECT patent_id, cpc_section
        FROM read_csv_auto('{RAW}/g_cpc_current.tsv', sep='\t', header=true, quote='"', all_varchar=true)
        WHERE cpc_sequence = '0'
    ),
    patents AS (
        SELECT p.patent_id, EXTRACT(YEAR FROM TRY_CAST(p.patent_date AS DATE)) AS yr
        FROM read_csv_auto('{RAW}/g_patent.tsv', sep='\t', header=true, quote='"', all_varchar=true) p
        WHERE p.patent_type = 'utility'
          AND EXTRACT(YEAR FROM TRY_CAST(p.patent_date AS DATE)) = 2024
    )
    SELECT c.cpc_section, COUNT(*) AS cnt
    FROM patents p
    JOIN primary_cpc c ON p.patent_id = c.patent_id
    GROUP BY c.cpc_section
    ORDER BY cnt DESC
""").fetchall()
total_cpc_2024 = sum(cnt for _, cnt in result)
for sec, cnt in result:
    print(f"  {sec}: {cnt:,} ({cnt/total_cpc_2024*100:.1f}%)")
gh_2024 = sum(cnt for sec, cnt in result if sec in ['G', 'H'])
print(f"  G+H total: {gh_2024:,} ({gh_2024/total_cpc_2024*100:.1f}%)")

# ─── 3.2 Technology diversity ───
print("\n[3.2] Technology diversity")
print("Claimed: declined from 0.848 in 1984 to 0.777 in 2009, stabilizing at 0.789 by 2025")
with open(f"{DATA}/chapter2/tech_diversity.json") as f:
    td = json.load(f)
td1984 = [r for r in td if r['year'] == 1984][0]
td2009 = [r for r in td if r['year'] == 2009][0]
td2025 = [r for r in td if r['year'] == 2025][0]
print(f"1984: {td1984['diversity_index']}")
print(f"2009: {td2009['diversity_index']}")
print(f"2025: {td2025['diversity_index']}")
# Check peak
td_peak = max(td, key=lambda x: x['diversity_index'])
print(f"Peak diversity: year={td_peak['year']}, val={td_peak['diversity_index']}")

# ─── 3.3 Fastest-growing classes >1000% ───
print("\n[3.3] WIPO field growth: fastest-growing >1000%")
print("Claimed: fastest digital tech classes grew by more than 1,000%")
with open(f"{DATA}/chapter3/wipo_field_growth.json") as f:
    wg = json.load(f)
above_1000 = [r for r in wg if r['growth_pct'] > 1000]
for r in sorted(above_1000, key=lambda x: -x['growth_pct']):
    print(f"  {r['field']}: {r['growth_pct']:.1f}%")

# ─── 3.4 Citation half-lives ───
print("\n[3.4] Citation half-lives")
print("Claimed: H=10.7, G=11.2, A=15.6")
with open(f"{DATA}/chapter2/technology_halflife.json") as f:
    hl = json.load(f)
for r in sorted(hl, key=lambda x: x['half_life_years']):
    print(f"  {r['section']}: {r['half_life_years']}")

# ─── 3.5 IT methods for management growth ───
print("\n[3.5] WIPO field growth details")
print("Claimed: IT methods 5,675%, Computer tech >1,600%, Digital communication >1,600%")
for field in ["IT methods for management", "Computer technology", "Digital communication"]:
    matches = [r for r in wg if r['field'] == field]
    if matches:
        r = matches[0]
        print(f"  {r['field']}: {r['growth_pct']:.1f}% ({r['count_early']:,} -> {r['count_late']:,})")

# ─── 3.6 Declining classes contracted by 84% ───
print("\n[3.6] Declining classes check")
print("Claimed: declining classes contracted by nearly 84%")
with open(f"{DATA}/chapter2/cpc_class_change.json") as f:
    ccc = json.load(f)
most_declining = min(ccc, key=lambda x: x['pct_change'])
print(f"Most declining: {most_declining.get('cpc_class','?')}: {most_declining['pct_change']:.1f}%")

# ─── 3.7 Design patent share 6-14% ───
print("\n[3.7] Design patent share range")
print("Claimed: fluctuated between 6% and 14%, peaks in 2008 and 2025")
# Compute from patents_per_year
for yr in [2008, 2014, 2025]:
    yr_data = [r for r in ppy if r['year'] == yr]
    total = sum(r['count'] for r in yr_data)
    design = sum(r['count'] for r in yr_data if r['patent_type'] == 'design')
    print(f"  {yr}: design={design:,}, total={total:,}, share={design/total*100:.1f}%")

# ─── PARTIAL YEAR CHECK ───
print("\n" + "=" * 80)
print("PARTIAL YEAR (2025) DISCLOSURE CHECK")
print("=" * 80)
print("Ch1 DataNote: 'from January 1976 through September 2025' - DISCLOSED")
print("Ch1 uses 2025 data in charts - partial year acknowledged")
print("Ch2: No explicit 2025 partial-year disclosure in DataNote")
print("Ch3: No explicit 2025 partial-year disclosure in DataNote")

# Check 2025 patent count
total_2025 = sum(r['count'] for r in ppy if r['year'] == 2025)
print(f"\n2025 total patents in data: {total_2025:,}")
print("If through September, ~9 months of 12, so annualized ~{:,}".format(int(total_2025 * 12/9)))

print("\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)
