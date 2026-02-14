# PatentWorld — Data Analysis Audit

## Methodology

Every pipeline script (01–40) was systematically reviewed for:
- **Data loading**: Correct use of config.py helpers, table references
- **Filtering**: Patent type filtering (`patent_type = 'utility'`), year boundaries (1976–2025)
- **Aggregation**: Double-counting risk (`COUNT(*)` vs `COUNT(DISTINCT patent_id)`)
- **Citation direction**: `patent_id` = citing patent, `citation_patent_id` = cited patent
- **CPC handling**: `cpc_sequence = 0` for primary classification vs all classifications for breadth
- **Period binning**: DuckDB float division bug detection (`(yr / N) * N` vs `FLOOR(yr / N) * N`)
- **Output validation**: Spot-checks against actual JSON output files

---

## Issue Catalog

### HIGH Severity (5 issues)

| # | Script | Issue | Description | Impact |
|---|--------|-------|-------------|--------|
| H1 | 14, 15, 19 | Period binning bug | `CAST((yr / 5) * 5 AS INTEGER)` returns the year itself in DuckDB (float division). Produces 50 per-year windows instead of 10 five-year bins. | Visualization data is 5x larger than intended; "periods" overlap. Affects `hhi_by_section.json`, `portfolio_diversity.json`, `friction_map.json` |
| H2 | 17, 20, 25 | Decade binning bug | `CAST((yr / 10) * 10 AS INTEGER)` returns the year itself. Produces 41 per-year entries with labels like "1981s". | Affects `citation_lag_by_section.json`, `inventor_mobility_by_decade.json`, `gender_section_trend.json` |
| H3 | 26, 27 | Same float division bug | Affects innovation diffusion periods and network metrics decades | `innovation_diffusion.json` has per-year periods; `network_metrics_by_decade.json` has per-year decades |
| H4 | 27 | Bridge inventor disambiguation | Top "bridge inventors" (Lei Zhang: 187 orgs) are almost certainly disambiguation artifacts | Data quality issue in bridge_inventors portion of `network_metrics_by_decade.json` |
| H5 | 32 | Forward citation 5-year window broken | LEFT JOIN structure means year filter is in ON clause; when it fails, citation row survives. `median_citations_5yr` actually measures total forward citations. | `company_profiles.json` citation metrics are inflated |

### MEDIUM Severity (9 issues)

| # | Script | Issue | Description |
|---|--------|-------|-------------|
| M1 | 06 | `citations_per_year` label ambiguity | Measures backward citations (references made) but label "citations" suggests forward |
| M2 | 06 | Citation lag metric | Measures age of cited prior art using `citation_date` which may differ from cited patent grant date |
| M3 | 11 | quality_by_sector missing forward cites | `avg_forward_cites` field is absent from all output records due to LEFT JOIN issue |
| M4 | 14 | App/grant ratio meaningless for recent years | 2024 shows 873% ratio, 2025 shows 11,094% due to incomplete data |
| M5 | 16 | Superstar concentration double-counts | `SUM(patents_this_year)` counts inventor-patent pairs; inflates top1pct/top5pct shares |
| M6 | 18 | Composite quality uses global z-scores | Secular trends in claims/scope inflate recent years' composite index |
| M7 | 25 | Gender patent double-counting | Mixed-gender patents counted once per gender in `gender_by_tech` |
| M8 | 35, 36 | Top-N without patent_type filter | Top-50/30 identification queries omit `patent_type='utility'` filter |
| M9 | 30 | quality_by_country 1970s artifact | `FLOOR(1976/10)*10=1970` creates partial decade from 4 years of data |

### LOW Severity (20+ issues)

| Category | Scripts | Description |
|----------|---------|-------------|
| Float type in output | 01, 03, 08, 15 | Period labels appear as "1976.0" instead of integers |
| hero_stats.total_patents float | 01 | Value is `9361444.0` instead of `9361444` |
| hero_stats counts all patent types | 01 | Includes design, plant, reissue (intentional but potentially confusing) |
| CPC class naming confusion | 02 | Variable `cpc_class` maps to `cpc_group` (subgroup level) |
| Gender inference errors | 05 | Kia Silverbrook (male) classified as 'F' — upstream PatentsView issue |
| Geography uses first inventor only | 04, 12, 21, 26 | `inventor_sequence=0` captures only primary inventor location |
| `citations_per_year` label direction | 06 | Backward citations labeled as generic "citations" |
| Left-censoring in first-time inventors | 16 | 1976 shows 100% debut rate by construction |
| Right-censoring in inventor longevity | 10 | Within-cohort later entrants deflate survival rates |
| Inventor segments inflated totals | 30 | Total sums inventor-patent appearances (~22M) not unique patents (~8.5M) |
| -0.0 value in Shannon entropy | 15 | `SUM(share * LN(share))` produces `-0.0` when share=1.0 |
| Name mapping artifacts | 31 | "Deere &", "Merck &", "Eli Lilly and" — trailing conjunctions |
| Missing G06T in AI classes | 12 | Generative image model patents excluded from AI analysis |
| Clean energy proxy codes | 26 | Misses nuclear, hydrogen, efficiency categories |
| Green filter redundancy | 29 | Both cpc_subclass and cpc_group LIKE 'Y02%' — redundant |
| Gender team 80% threshold is no-op | 25 | Threshold always passes because `team_size` already excludes unknowns |
| D3 "count" ambiguity | 37 | Field counts gap events, not unique inventors |
| Anomalous "MH" state | 04 | Marshall Islands shows 10K+ patents — likely disambiguation artifact |

---

## Per-Script Audit Details

### Scripts 01–10 (Core Chapter Data)

**01_chapter1_landscape.py** — OK with minor cosmetic issues (float types). All computations verified correct. Patent counts match published records (~70K utility in 1976, peak 392K in 2019).

**02_chapter2_technology.py** — OK. CPC primary correctly used (`cpc_sequence=0`). WIPO primary correctly used (`wipo_field_sequence=0`). Tech diversity (1-HHI) computed correctly.

**03_chapter3_assignees.py** — OK with cosmetic float labels in concentration periods. IBM #1 (161,888), Samsung #2 (157,906) match known records.

**04_chapter4_geography.py** — OK. Uses first inventor location (standard simplification). CA leads (992K), San Jose #1 city (96K). Anomalous MH (Marshall Islands) state is upstream data quality issue.

**05_chapter5_inventors.py** — OK. Yamazaki #1 (6,709 patents) matches known records. Gender estimation has known upstream errors (Kia Silverbrook).

**06_chapter6_citations.py** — **MEDIUM**: `citations_per_year` measures backward citations (references made), not forward. Label is ambiguous. Government agency data (HHS #1) is correct.

**07_explore_data.py** — OK. All queries correct. Minor style inconsistency with COUNT(*) vs COUNT(DISTINCT).

**08_chapter7_dynamics.py** — OK with minor period label issue (starts at 1975.0 due to FLOOR). International collaboration (8.63% in 2020) matches OECD data.

**09_chapter3_firm_deep.py** — OK. Forward citations computed correctly (`JOIN ON citation_patent_id`). Microsoft #1 citation impact (30.66 avg).

**10_chapter5_inventor_deep.py** — OK with methodological caveat on right-censoring in survival curves. Frederick Shelton IV has 965 avg citations (plausible for surgical instruments).

### Scripts 11–20 (Deep Analyses)

**11_chapter9_patent_quality.py** — **MEDIUM**: `quality_by_sector` missing forward citation data entirely. Otherwise correct. Originality/generality formulas verified. Breakthrough patents correctly defined as top 1%.

**12_chapter11_ai_patents.py** — OK. AI class definitions (G06N, G06F18, G06V, G10L15, G06F40) are standard. IBM #1 AI filer (16,781). Missing G06T is a known limitation.

**13_inventor_movement.py** — OK. Migration flows capture patent-level transitions. CA↔TX top flow (12,788). International mobility trends plausible.

**14_chapter10_patent_law.py** — **HIGH**: Period binning bug produces per-year data instead of 5-year bins. **MEDIUM**: Applications/grants ratio is artifactual for recent years.

**15_chapter3_portfolio_diversity.py** — **HIGH**: Same period binning bug. Produces 1,103 records instead of ~250.

**16_chapter5_superstar_solo_firsttime.py** — **MEDIUM**: Superstar share double-counts multi-inventor patents. Solo inventor decline (58% → 23%) is correct and well-documented.

**17_chapter7_citation_lag.py** — **HIGH**: Decade binning produces per-year values with nonsensical labels. Citation lag trend (per-year) is correct.

**18_chapter9_composite_quality.py** — **MEDIUM**: Global z-scores create secular trends. Quality index increases over time partly reflecting changing patent norms.

**19_chapter8_friction_maps.py** — **HIGH**: Period binning bug produces 400 records instead of ~80.

**20_chapter5_inventor_mobility.py** — **HIGH**: Decade binning bug. **MEDIUM**: Citation averages are inventor-weighted, not patent-weighted.

### Scripts 21–30 (Batch 2)

**21_chapter4_regional_specialization.py** — OK. Location Quotient methodology is sound. San Jose LQ=1.74 for Electricity (plausible Silicon Valley).

**22_chapter9_sleeping_beauty.py** — OK. Citation direction correct. Top sleeping beauty (patent 6294274, organic electronics) is plausible.

**23_chapter11_ai_deep.py** — **MEDIUM**: AI strategies query missing patent_type filter (defined but unused CTE). GPT diffusion methodology is sound.

**24_chapter2_technology_halflife.py** — OK. Citation direction correct. Half-lives plausible (H=10.7yr, A=15.6yr). Interpolation correct.

**25_chapter5_gender_deep.py** — **HIGH**: Period binning bug in `gender_section_trend`. **MEDIUM**: Gender patent double-counting in `gender_by_tech`.

**26_chapter4_diffusion.py** — **HIGH**: Period binning bug. Clean energy proxy misses some categories.

**27_chapter6_network_deep.py** — **HIGH**: Decade binning bug. **HIGH**: Bridge inventors are disambiguation artifacts.

**28_chapter12_topic_modeling.py** — OK. NMF with 25 topics, standard TF-IDF parameters. UMAP stratified sampling (600 per topic). 8.45M patents processed. Curated topic names with fallback.

**29_green_innovation.py** — OK with redundant filter. Samsung #1 (13,771), Toyota #2 (12,636). Green-AI heatmap methodology sound.

**30_batch_additions.py** — **MEDIUM**: quality_by_country has 1970s decade artifact. Inventor segments use inflated totals. Canon self-citation rate (47.6%) matches literature. US-China co-invention trend (0.005% → 2.11%) is plausible.

### Scripts 31–40 (Company-Level)

**31_company_name_mapping.py** — OK with minor name cleaning artifacts ("Deere &", "Merck &").

**32_company_profiles.py** — **HIGH**: Forward citation 5-year window is broken (LEFT JOIN structure). All other metrics (patent count, CPC breadth, team size, self-citation) are correct.

**33_trajectory_archetypes.py** — OK. K-means (k=6) with proper normalization. 200 companies classified.

**34_corporate_mortality.py** — OK. Survival rates (avg 64.5%) plausible. 9 continuous top-50 companies identified.

**35_portfolio_strategy.py** — **MEDIUM**: Top-50 without patent_type filter. Shannon entropy, JSD, and HHI computations are correct.

**36_corporate_citations.py** — **MEDIUM**: Top-30/50 without patent_type filter. Citation direction correct in all three analyses. Uses `FLOOR()` for decade binning (correct).

**37_inventor_careers.py** — OK. Career curves, specialization drift, and comeback detection all methodologically sound.

**38_design_patents_claims.py** — OK. Uses `FLOOR()` for decade binning. All aggregations correct.

**39_talent_flows.py** — OK. Talent flow methodology (LAG window function) is sound. Grant lag computation correct.

**40_portfolio_strategy_profiles.py** — OK. UMAP, radar dimensions, and normalization all correct. Uses `FLOOR()` for decades.

---

## Cross-Cutting Patterns

### Citation Direction — VERIFIED CORRECT across all scripts
- `c.patent_id` = citing patent (the one making the reference)
- `c.citation_patent_id` = cited patent (the one being referenced)
- Forward citations: focal patent is `citation_patent_id`
- Backward citations: focal patent is `patent_id`

### CPC Handling — GENERALLY CORRECT
- Primary CPC (`cpc_sequence=0`) used for: technology classification, section assignment, friction maps, quality metrics
- All CPC entries used for: technology breadth, portfolio diversity, Shannon entropy, scope — these are intentional design choices

### JSON Serialization — CORRECT
- `_clean_value()` converts NaN→None, numpy types→Python types
- orjson with `OPT_SERIALIZE_NUMPY` handles remaining edge cases

### PatentsView Limitations Documented
- Gender inference via name-based probabilistic model has known errors
- Inventor disambiguation can merge/split common names incorrectly
- Location assignment uses `inventor_sequence=0` (first inventor) as standard simplification
