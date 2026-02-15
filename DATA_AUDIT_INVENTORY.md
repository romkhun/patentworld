# PatentWorld Data Audit Inventory

Generated: 2026-02-15

---

## Table of Contents

1. [JSON Data Files Under `public/data/`](#1-json-data-files-under-publicdata)
2. [Preprocessing Scripts](#2-preprocessing-scripts)
3. [Inline Data Transformations in `src/`](#3-inline-data-transformations-in-src)
4. [Computed Quality Metric Files](#4-computed-quality-metric-files-publicdatacomputed)

---

## 1. JSON Data Files Under `public/data/`

Total: **281 JSON files** across 20 subdirectories. Combined size: ~37 MB.

### 1.1 `chapter1/` -- The Innovation Landscape (5 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `hero_stats.json` | 104 B | Summary statistics (total patents, etc.) for the hero section | `system-patent-count/page.tsx` |
| `patents_per_year.json` | 14 KB | Patent counts by year and type (utility, design, plant, reissue) | `system-patent-count/page.tsx`, `HomeContent.tsx` |
| `patents_per_month.json` | 20 KB | Patent counts by month for time-series granularity | **ORPHANED** -- no component consumer found |
| `claims_per_year.json` | 3.4 KB | Average number of claims per patent by year | `system-patent-quality/page.tsx` |
| `grant_lag.json` | 3.7 KB | Average/median grant pendency (days) by year | `system-patent-count/page.tsx` |

### 1.2 `chapter2/` -- Technology (9 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `wipo_sectors_per_year.json` | 14 KB | WIPO technology sector patent counts by year | `system-patent-fields/page.tsx` |
| `wipo_fields_per_year.json` | 143 KB | WIPO field-level patent counts by year | `system-patent-fields/page.tsx` |
| `cpc_sections_per_year.json` | 17 KB | CPC section (A-H, Y) patent counts by year | `system-patent-fields/page.tsx` |
| `cpc_class_change.json` | 11 KB | Fastest-growing and declining CPC classes | `system-patent-fields/page.tsx` |
| `tech_diversity.json` | 2.6 KB | Shannon entropy of tech distribution by year | `system-patent-fields/page.tsx` |
| `technology_scurves.json` | 11 KB | S-curve fitting for technology adoption | `system-patent-fields/page.tsx` |
| `technology_decay_curves.json` | 18 KB | Forward citation decay curves by CPC section | `system-patent-fields/page.tsx` |
| `technology_halflife.json` | 524 B | Half-life of citations per CPC section | `system-patent-fields/page.tsx` |
| `cpc_treemap.json` | 89 KB | CPC hierarchy with patent counts for treemap | `system-patent-fields/page.tsx` |

### 1.3 `chapter3/` -- Organizations (12 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `assignee_types_per_year.json` | 9.7 KB | Corporate/Individual/Government breakdown by year | `org-composition/page.tsx` |
| `top_assignees.json` | 5.1 KB | Top 50 assignees by patent count | `org-composition/page.tsx`, `org-patent-count/page.tsx` |
| `top_orgs_over_time.json` | 65 KB | Top 15 organizations' patent counts by year | `org-patent-count/page.tsx` |
| `domestic_vs_foreign.json` | 6.6 KB | Domestic vs. foreign assignee share by year | `org-composition/page.tsx` |
| `concentration.json` | 1.4 KB | HHI concentration ratio by year | `org-patent-count/page.tsx` |
| `non_us_by_section.json` | 166 KB | Non-US assignee patent counts by CPC section | `org-composition/page.tsx` |
| `firm_collaboration_network.json` | 111 KB | Top-firm co-assignment network (nodes + edges) | `mech-organizations/page.tsx` |
| `firm_citation_impact.json` | 4.7 KB | Firm citation impact metrics | `org-patent-quality/page.tsx` |
| `firm_tech_evolution.json` | 64 KB | Technology evolution per firm (CPC section mix over time) | `org-company-profiles/page.tsx` |
| `portfolio_diversity.json` | 38 KB | Shannon entropy across CPC subclasses per firm per year | **ORPHANED** -- superseded by `company/portfolio_diversification_b3.json` |
| `network_metrics_by_decade.json` | 696 B | Network structure metrics per decade | `mech-inventors/page.tsx` |
| `bridge_inventors.json` | 3.3 KB | High betweenness centrality inventors | `mech-inventors/page.tsx` |

### 1.4 `chapter4/` -- Geography (11 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `us_states_per_year.json` | 104 KB | Patent counts per US state per year | `geo-domestic/page.tsx` |
| `us_states_summary.json` | 3.4 KB | Summary statistics per US state | `geo-domestic/page.tsx` |
| `countries_per_year.json` | 207 KB | Patent counts per country per year | `geo-international/page.tsx` |
| `top_cities.json` | 4.2 KB | Top US cities by patent count | `geo-domestic/page.tsx` |
| `state_specialization.json` | 18 KB | CPC section specialization by state | `geo-domestic/page.tsx` |
| `regional_specialization.json` | 678 KB | Location Quotient per city x CPC section | `geo-domestic/page.tsx` |
| `inventor_state_flows.json` | 11 KB | State-to-state inventor migration flows | `mech-inventors/page.tsx` |
| `inventor_country_flows.json` | 12 KB | Country-to-country inventor migration flows | `mech-inventors/page.tsx` |
| `inventor_mobility_trend.json` | 6.7 KB | Inventor mobility rate over time | `mech-inventors/page.tsx` |
| `innovation_diffusion.json` | 3.8 MB | City-level patent counts per year per CPC section | **ORPHANED** -- only the summary version is consumed |
| `innovation_diffusion_summary.json` | 9.2 KB | Aggregated diffusion summary per tech area | `mech-geography/page.tsx` |

### 1.5 `chapter5/` -- Inventors (18 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `team_size_per_year.json` | 5.9 KB | Avg/median team size, solo %, large team % by year | `inv-team-size/page.tsx` |
| `gender_per_year.json` | 4.1 KB | Male/female inventor share by year | `inv-gender/page.tsx` |
| `gender_by_sector.json` | 576 B | Female share by WIPO sector | `inv-gender/page.tsx` |
| `gender_by_tech.json` | 765 B | Female share by CPC section | `inv-gender/page.tsx` |
| `gender_team_quality.json` | 288 B | Citation comparison by team gender composition | `inv-gender/page.tsx` |
| `gender_section_trend.json` | 11 KB | Female share by CPC section over time | `inv-gender/page.tsx` |
| `prolific_inventors.json` | 15 KB | Top 50 most prolific inventors | `inv-top-inventors/page.tsx` |
| `inventor_entry.json` | 1.8 KB | New inventor entry rates over time | `inv-serial-new/page.tsx` |
| `inventor_longevity.json` | 16 KB | Inventor career span distribution | `inv-serial-new/page.tsx` |
| `inventor_collaboration_network.json` | 130 KB | Co-inventor network (nodes + edges) | `mech-inventors/page.tsx` |
| `inventor_segments.json` | 680 B | Inventor segmentation (one-timer, serial, etc.) | `inv-serial-new/page.tsx`, `inv-top-inventors/page.tsx` |
| `inventor_segments_trend.json` | 3.7 KB | Inventor segment shares over time | `inv-top-inventors/page.tsx` |
| `star_inventor_impact.json` | 33 KB | Star inventor citation impact analysis | `inv-top-inventors/page.tsx` |
| `superstar_concentration.json` | 7.7 KB | Top 1%/5% inventor share by year | `inv-top-inventors/page.tsx` |
| `solo_inventors.json` | 3.8 KB | Solo inventor share over time | `inv-team-size/page.tsx` |
| `solo_inventors_by_section.json` | 609 B | Solo inventor share by CPC section | `inv-team-size/page.tsx` |
| `first_time_inventors.json` | 4.1 KB | Share of patents with debut inventors | `inv-serial-new/page.tsx` |
| `inventor_mobility.json` | 185 B | Mobile vs non-mobile inventor citation comparison | **ORPHANED** -- no component consumer found |
| `inventor_mobility_by_decade.json` | 568 B | Mobility rate over time by decade | **ORPHANED** -- no component consumer found |

### 1.6 `chapter6/` -- Citations (9 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `citations_per_year.json` | 4.0 KB | Avg/median citations per patent by grant year | `system-patent-quality/page.tsx` |
| `citation_categories.json` | 4.2 KB | Citation category breakdown | `system-patent-quality/page.tsx` |
| `citation_lag.json` | 4.3 KB | Median citation lag distribution | `system-patent-quality/page.tsx` |
| `citation_lag_trend.json` | 3.8 KB | Citation lag trend over time | `system-patent-quality/page.tsx` |
| `citation_lag_by_section.json` | 6.6 KB | Citation lag by CPC section | `system-patent-fields/page.tsx` |
| `gov_funded_per_year.json` | 1.4 KB | Government-funded patents per year | `system-public-investment/page.tsx` |
| `gov_agencies.json` | 1.3 KB | Top government agencies by patent count | `system-public-investment/page.tsx` |
| `co_invention_rates.json` | 28 KB | US-China co-invention rates over time | `mech-geography/page.tsx` |
| `co_invention_us_china_by_section.json` | 5.8 KB | US-China co-invention by CPC section | `mech-geography/page.tsx` |

### 1.7 `chapter7/` -- Innovation Dynamics (6 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `grant_lag_by_sector.json` | 5.7 KB | Grant lag by WIPO sector | `system-patent-fields/page.tsx` |
| `cross_domain.json` | 6.5 KB | Cross-domain patenting rates | `system-patent-fields/page.tsx` |
| `intl_collaboration.json` | 4.3 KB | International collaboration rates | `mech-geography/page.tsx` |
| `corp_diversification.json` | 13 KB | Corporate diversification by era | `org-patent-portfolio/page.tsx` |
| `innovation_velocity.json` | 24 KB | Innovation velocity trends | `system-patent-fields/page.tsx` |
| `friction_map.json` | 15 KB | CPC section x period heatmap of examination times | `system-patent-fields/page.tsx` |

### 1.8 `chapter9/` -- Patent Quality (10 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `quality_trends.json` | 15 KB | Quality dimension trends over time | `system-patent-quality/page.tsx` |
| `originality_generality.json` | 6.5 KB | Originality and generality scores by year | `system-patent-quality/page.tsx` |
| `self_citation_rate.json` | 3.5 KB | Self-citation rate over time | `system-patent-quality/page.tsx` |
| `quality_by_sector.json` | 5.5 KB | Quality dimensions by WIPO sector | `system-patent-fields/page.tsx` |
| `quality_by_country.json` | 6.6 KB | Quality dimensions by inventor country | `geo-international/page.tsx` |
| `self_citation_by_assignee.json` | 2.3 KB | Self-citation rates for top assignees | `org-patent-quality/page.tsx` |
| `self_citation_by_section.json` | 4.2 KB | Self-citation rates by CPC section | `system-patent-fields/page.tsx` |
| `composite_quality_index.json` | 56 KB | Composite quality index by year x CPC section | `system-patent-quality/page.tsx` |
| `sleeping_beauties.json` | 9.4 KB | Sleeping beauty patents (delayed citation burst) | `system-patent-quality/page.tsx` |
| `breakthrough_patents.json` | 4.0 KB | Breakthrough patent identification | `system-patent-quality/page.tsx` |

### 1.9 `chapter10/` -- Patent Law (3 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `hhi_by_section.json` | 8.8 KB | HHI concentration per CPC section per 5-year period | `system-patent-fields/page.tsx` |
| `applications_vs_grants.json` | 4.2 KB | Filing vs grant activity per year | `system-patent-law/page.tsx` |
| `convergence_matrix.json` | 8.4 KB | CPC section co-occurrence matrix by era | `system-convergence/page.tsx` |

### 1.10 `chapter11/` -- AI Patents (11 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `ai_patents_per_year.json` | 3.4 KB | AI patent counts by year | `ai-patents/page.tsx` |
| `ai_by_subfield.json` | 26 KB | AI subfield breakdown by year | `ai-patents/page.tsx` |
| `ai_top_assignees.json` | 4.8 KB | Top 50 AI patent assignees | `ai-patents/page.tsx` |
| `ai_top_inventors.json` | 4.8 KB | Top 50 AI patent inventors | `ai-patents/page.tsx` |
| `ai_geography.json` | 8.1 KB | AI patent geography (country/state) | `ai-patents/page.tsx` |
| `ai_quality.json` | 5.8 KB | AI patent quality metrics by year | `ai-patents/page.tsx` |
| `ai_org_over_time.json` | 29 KB | Top AI organizations' patent counts by year | `ai-patents/page.tsx` |
| `ai_strategies.json` | 18 KB | AI sub-area strategy per top assignee | `ai-patents/page.tsx` |
| `ai_gpt_diffusion.json` | 20 KB | AI patent co-occurrence with non-AI CPC sections | `ai-patents/page.tsx` |
| `ai_team_comparison.json` | 7.8 KB | AI vs non-AI team size comparison | `ai-patents/page.tsx` |
| `ai_assignee_type.json` | 7.8 KB | AI assignee type distribution | `ai-patents/page.tsx` |

### 1.11 `chapter12/` -- Language of Innovation (6 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `topic_definitions.json` | 6.0 KB | 25 NMF topics with id, name, top words, patent count | `system-language/page.tsx` |
| `topic_prevalence.json` | 107 KB | Year x topic share (1976-2025) | `system-language/page.tsx` |
| `topic_cpc_matrix.json` | 25 KB | CPC section x topic count/share matrix | `system-language/page.tsx` |
| `topic_umap.json` | 501 KB | 15K patents with UMAP 2D coordinates | `system-language/page.tsx` |
| `topic_novelty_trend.json` | 4.0 KB | Median/avg entropy by year | `system-language/page.tsx` |
| `topic_novelty_top.json` | 5.6 KB | Top 50 most novel patents | `system-language/page.tsx` |

### 1.12 `company/` -- Company-Level Analyses (29 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `company_profiles.json` | 1.2 MB | Per-year metrics for top 100 assignees | `org-company-profiles/page.tsx` |
| `company_name_mapping.json` | 9.0 KB | Raw-to-clean display name mapping for top assignees | `org-company-profiles/page.tsx` |
| `company_milestones.json` | 5.4 KB | Key milestones for selected companies | **ORPHANED** -- no component consumer found |
| `strategy_profiles.json` | 4.9 KB | 8-dimension radar chart data for top 30 assignees | `org-company-profiles/page.tsx` |
| `corporate_speed.json` | 213 KB | Avg/median grant lag per company per year | `org-company-profiles/page.tsx` |
| `trajectory_archetypes.json` | 84 KB | K-means trajectory cluster labels per company | `org-company-profiles/page.tsx` |
| `corporate_mortality.json` | 33 KB | Top-50 assignee survival/replacement by decade | `org-patent-count/page.tsx` |
| `design_patents.json` | 4.8 KB | Design vs utility trends + top filers | `org-patent-count/page.tsx` |
| `claims_analysis.json` | 8.7 KB | Claims trends, by CPC section, claim outliers | `system-patent-quality/page.tsx` |
| `portfolio_diversification_b3.json` | 157 KB | Shannon entropy per company per year | `org-patent-portfolio/page.tsx` |
| `pivot_detection.json` | 116 KB | JSD between consecutive 3-year windows per company | `org-patent-portfolio/page.tsx` |
| `patent_concentration.json` | 20 KB | HHI and C4 per CPC section per year | `org-patent-count/page.tsx` |
| `portfolio_overlap.json` | 26 KB | Pairwise CPC cosine similarity + UMAP per decade | `org-patent-portfolio/page.tsx` |
| `corporate_citation_network.json` | 253 KB | Directed citation flows between top 30 assignees per decade | `mech-organizations/page.tsx` |
| `tech_leadership.json` | 40 KB | Top 5 assignees by forward citations per CPC section | `mech-organizations/page.tsx` |
| `citation_half_life.json` | 4.5 KB | Citation half-life per assignee | `org-patent-quality/page.tsx` |
| `talent_flows.json` | 81 KB | Inventor movements between top 50 companies (Sankey) | `mech-inventors/page.tsx` |
| `inventor_careers.json` | 6.3 KB | Career curves + duration distributions | `inv-serial-new/page.tsx` |
| `inventor_drift.json` | 636 B | Technology drift/specialization metric | `inv-generalist-specialist/page.tsx`, `inv-top-inventors/page.tsx` |
| `comeback_inventors.json` | 1.5 KB | Inventors with >=5-year patenting gaps | `inv-serial-new/page.tsx` |
| `firm_quality_distribution.json` | 294 KB | Citation percentiles per firm per year | `org-patent-quality/page.tsx`, `org-company-profiles/page.tsx` |
| `firm_quality_scatter.json` | 5.3 KB | Firm quality scatter plot data | `org-patent-quality/page.tsx` |
| `firm_quality_gini.json` | 19 KB | Gini coefficient of forward citations per firm | `mech-organizations/page.tsx` |
| `firm_claims_distribution.json` | 171 KB | Claims percentiles per firm per year | `org-company-profiles/page.tsx` |
| `firm_scope_distribution.json` | 143 KB | CPC scope percentiles per firm per year | `org-company-profiles/page.tsx` |
| `firm_exploration_scores.json` | 575 KB | Exploration/exploitation scores per firm per year | `mech-organizations/page.tsx` |
| `firm_exploration_scatter.json` | 5.5 KB | Exploration score scatter data | `mech-organizations/page.tsx` |
| `firm_exploration_trajectories.json` | 30 KB | Exploration share trajectories per firm | `mech-organizations/page.tsx` |
| `firm_exploration_lifecycle.json` | 17 KB | Exploration decay curves (relative year) | `mech-organizations/page.tsx` |
| `firm_ambidexterity_quality.json` | 60 KB | Ambidexterity index vs performance per 5-year window | `mech-organizations/page.tsx` |

### 1.13 `explore/` -- Explore Page (4 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `top_assignees_all.json` | 50 KB | Top assignees with patent counts (searchable table) | `explore/page.tsx` |
| `top_inventors_all.json` | 73 KB | Top inventors with patent counts (searchable table) | `explore/page.tsx` |
| `cpc_class_summary.json` | 27 MB | All CPC classes with names, counts, growth | `explore/page.tsx` |
| `wipo_field_summary.json` | 3.3 KB | WIPO fields with counts (searchable table) | `explore/page.tsx` |

### 1.14 `green/` -- Green Innovation (17 files)

| File | Size | Purpose | Consumer(s) |
|------|------|---------|-------------|
| `green_volume.json` | 3.7 KB | Green patent volume over time + share | `green-innovation/page.tsx` |
| `green_by_category.json` | 27 KB | Green tech breakdown by sub-category | `green-innovation/page.tsx` |
| `green_by_country.json` | 16 KB | Green patents by country | `green-innovation/page.tsx` |
| `green_top_companies.json` | 22 KB | Top green patent companies | `green-innovation/page.tsx` |
| `green_ai_trend.json` | 1.3 KB | Green-AI intersection trend | `green-innovation/page.tsx` |
| `green_ai_heatmap.json` | 5.2 KB | Green-AI heatmap data | `green-innovation/page.tsx` |
| `green_per_year.json` | 3.9 KB | Annual green patent counts (domain template) | **ORPHANED** -- green page uses custom `green_volume.json` |
| `green_by_subfield.json` | 27 KB | Green subfield breakdown by year (domain template) | **ORPHANED** -- green page uses `green_by_category.json` |
| `green_geography.json` | 8.5 KB | Green patent geography (domain template) | **ORPHANED** -- green page uses `green_by_country.json` |
| `green_top_assignees.json` | 5.0 KB | Top 50 green assignees | `green-innovation/page.tsx` |
| `green_top_inventors.json` | 5.1 KB | Top 50 green inventors | `green-innovation/page.tsx` |
| `green_org_over_time.json` | 41 KB | Top green organizations' counts by year | `green-innovation/page.tsx` |
| `green_quality.json` | 5.8 KB | Green patent quality metrics by year | `green-innovation/page.tsx` |
| `green_team_comparison.json` | 8.0 KB | Green vs non-green team size comparison | `green-innovation/page.tsx` |
| `green_assignee_type.json` | 8.5 KB | Green assignee type distribution | `green-innovation/page.tsx` |
| `green_strategies.json` | 18 KB | Green strategy portfolio per top assignee | `green-innovation/page.tsx` |
| `green_diffusion.json` | 30 KB | Green cross-domain diffusion | `green-innovation/page.tsx` |

### 1.15 Domain Deep-Dive Chapters (11 files each, 10 domains)

Each domain follows an identical 11-file template produced by `domain_utils.py`. All files are consumed by their respective chapter page component.

**Domains and their directories/pages:**
- `semiconductors/` (prefix: `semi_`) -> `semiconductors/page.tsx`
- `quantum/` (prefix: `quantum_`) -> `quantum-computing/page.tsx`
- `biotech/` (prefix: `biotech_`) -> `biotechnology/page.tsx`
- `av/` (prefix: `av_`) -> `autonomous-vehicles/page.tsx`
- `space/` (prefix: `space_`) -> `space-technology/page.tsx`
- `cyber/` (prefix: `cyber_`) -> `cybersecurity/page.tsx`
- `agtech/` (prefix: `agtech_`) -> `agricultural-technology/page.tsx`
- `digihealth/` (prefix: `digihealth_`) -> `digital-health/page.tsx`
- `3dprint/` (prefix: `3dprint_`) -> `3d-printing/page.tsx`
- `blockchain/` (prefix: `blockchain_`) -> `blockchain/page.tsx`

**Standard 11-file template per domain:**

| File Pattern | Size Range | Purpose |
|-------------|-----------|---------|
| `{slug}_per_year.json` | 2.0-3.9 KB | Annual patent counts + share of total |
| `{slug}_by_subfield.json` | 3.1-33 KB | Sub-category breakdown by year |
| `{slug}_top_assignees.json` | 4.9-5.2 KB | Top 50 assignees in domain |
| `{slug}_top_inventors.json` | 5.0-5.2 KB | Top 50 inventors in domain |
| `{slug}_org_over_time.json` | 9.7-41 KB | Top 15 org rankings over time |
| `{slug}_geography.json` | 6.3-8.5 KB | Geography (country + state breakdown) |
| `{slug}_quality.json` | 3.0-5.8 KB | Quality indicators (claims, cites, scope, team) |
| `{slug}_team_comparison.json` | 7.3-8.6 KB | Domain vs non-domain team size |
| `{slug}_assignee_type.json` | 2.6-8.2 KB | Corporate/Gov/Individual/University breakdown |
| `{slug}_strategies.json` | 3.7-16 KB | Top 20 org x subfield patent counts |
| `{slug}_diffusion.json` | 2.9-30 KB | Cross-domain CPC section co-occurrence |

### 1.16 `computed/` -- Quality Metric Aggregations (19 files)

See [Section 4](#4-computed-quality-metric-files-publicdatacomputed) for full details.

### 1.17 Orphaned Files Summary

The following **9 data files** are generated by pipeline scripts but have no front-end consumer:

| File | Size | Notes |
|------|------|-------|
| `chapter1/patents_per_month.json` | 20 KB | More granular than patents_per_year; unused |
| `chapter3/portfolio_diversity.json` | 38 KB | Superseded by `company/portfolio_diversification_b3.json` |
| `chapter4/innovation_diffusion.json` | 3.8 MB | **Largest orphan**; only summary version is used |
| `chapter5/inventor_mobility.json` | 185 B | Tiny file; mobility data used via other files |
| `chapter5/inventor_mobility_by_decade.json` | 568 B | Decade-level mobility; unused |
| `company/company_milestones.json` | 5.4 KB | Company milestone data; not referenced |
| `green/green_per_year.json` | 3.9 KB | Domain template duplicate; green uses custom volume file |
| `green/green_by_subfield.json` | 27 KB | Domain template duplicate; green uses green_by_category |
| `green/green_geography.json` | 8.5 KB | Domain template output; green page uses green_by_country |

---

## 2. Preprocessing Scripts

### 2.1 Configuration Files

| File | Purpose |
|------|---------|
| `data-pipeline/config.py` | Central configuration: data paths, DuckDB TSV reader helpers, `save_json()`, `query_to_json()`, CPC section names, assignee type map |
| `data-pipeline/domain_utils.py` | Shared 11-analysis template for technology domain deep dives; called by scripts 47-57 |
| `data-pipeline/run_all.sh` | Shell runner for scripts 01-07 + 14 (partial; does not run all scripts) |

### 2.2 Root-Level Scripts

| Script | Inputs | Outputs | Logic |
|--------|--------|---------|-------|
| `compute_quality_metrics.py` | PatentsView: g_patent, g_application, g_cpc_current, g_inventor_disambiguated, g_assignee_disambiguated, g_us_patent_citation, g_location_disambiguated (all TSV zips) | 19 files in `public/data/computed/` | Polars-based. Loads all patents, computes scope, team size, gender, location, inventor classifications (top/serial/specialist), forward/backward citations, self-citations, originality, generality, sleeping beauties. Aggregates by 11 groupings. |
| `edit_patent_law.py` | `src/app/chapters/patent-law/page.tsx` | Same file (in-place edit) | Regex-based removal of failed audit research citations from the patent law chapter |

### 2.3 Pipeline Scripts (data-pipeline/)

#### Chapter-Based Scripts (01-30)

| # | Script | Inputs (DuckDB TSV) | Outputs | Logic Summary |
|---|--------|---------------------|---------|---------------|
| 01 | `01_chapter1_landscape.py` | g_patent, g_application | `chapter1/`: patents_per_year, patents_per_month, claims_per_year, grant_lag, hero_stats | Patent counts by year/type, claims trend, grant pendency |
| 02 | `02_chapter2_technology.py` | g_patent, g_cpc_current, g_cpc_title, g_wipo_technology | `chapter2/`: wipo_sectors_per_year, wipo_fields_per_year, cpc_sections_per_year, cpc_class_change, tech_diversity | Technology distribution and change analysis |
| 03 | `03_chapter3_assignees.py` | g_patent, g_assignee_disambiguated | `chapter3/`: assignee_types_per_year, top_assignees, top_orgs_over_time, domestic_vs_foreign, concentration | Assignee composition and concentration |
| 04 | `04_chapter4_geography.py` | g_patent, g_inventor_disambiguated, g_location_disambiguated, g_cpc_current | `chapter4/`: us_states_per_year, us_states_summary, countries_per_year, top_cities, state_specialization | Geographic distribution of patenting |
| 05 | `05_chapter5_inventors.py` | g_patent, g_inventor_disambiguated, g_wipo_technology | `chapter5/`: team_size_per_year, gender_per_year, gender_by_sector, prolific_inventors, inventor_entry | Inventor demographics and team composition |
| 06 | `06_chapter6_citations.py` | g_patent, g_us_patent_citation, g_gov_interest, g_gov_interest_org | `chapter6/`: citations_per_year, citation_categories, citation_lag, gov_funded_per_year, gov_agencies | Citation patterns and government funding |
| 07 | `07_explore_data.py` | g_patent, g_assignee, g_inventor, g_cpc_current, g_cpc_title, g_wipo_technology | `explore/`: top_assignees_all, top_inventors_all, cpc_class_summary, wipo_field_summary | Searchable reference tables for explore page |
| 08 | `08_chapter7_dynamics.py` | g_patent, g_application, g_cpc_current, g_wipo, g_assignee, g_inventor, g_location | `chapter7/`: grant_lag_by_sector, cross_domain, intl_collaboration, corp_diversification, innovation_velocity | Innovation dynamics and cross-domain analysis |
| 09 | `09_chapter3_firm_deep.py` | g_patent, g_assignee, g_us_patent_citation, g_cpc_current | `chapter3/`: firm_collaboration_network, firm_citation_impact, firm_tech_evolution | Deep firm-level analyses |
| 10 | `10_chapter5_inventor_deep.py` | g_patent, g_inventor, g_us_patent_citation | `chapter5/`: inventor_collaboration_network, inventor_longevity, star_inventor_impact | Deep inventor-level analyses |
| 11 | `11_chapter9_patent_quality.py` | g_patent, g_cpc_current, g_us_patent_citation, g_application, g_assignee | `chapter9/`: quality_trends, originality_generality, self_citation_rate, quality_by_sector, breakthrough_patents | Patent quality dimension analysis (Jaffe & de Rassenfosse 2017) |
| 12 | `12_chapter11_ai_patents.py` | g_patent, g_cpc_current, g_assignee, g_inventor, g_location, g_us_patent_citation | `chapter11/`: ai_patents_per_year, ai_by_subfield, ai_top_assignees, ai_top_inventors, ai_geography, ai_quality, ai_org_over_time | AI patent identification via CPC (G06N, G06F18, G06V, G10L15, G06F40, G06T) |
| 13 | `13_inventor_movement.py` | g_patent, g_inventor, g_location | `chapter4/`: inventor_state_flows, inventor_country_flows, inventor_mobility_trend | Inventor geographic migration flow analysis |
| 14 | `14_chapter10_patent_law.py` | g_patent, g_application, g_cpc_current, g_assignee | `chapter10/`: hhi_by_section, applications_vs_grants, convergence_matrix | Patent law empirical analyses |
| 15 | `15_chapter3_portfolio_diversity.py` | g_patent, g_cpc_current, g_assignee | `chapter3/`: portfolio_diversity | Shannon entropy across CPC subclasses per firm |
| 16 | `16_chapter5_superstar_solo_firsttime.py` | g_patent, g_cpc_current, g_inventor | `chapter5/`: superstar_concentration, solo_inventors, first_time_inventors | Superstar/solo/debut inventor analysis |
| 17 | `17_chapter7_citation_lag.py` | g_patent, g_cpc_current, g_us_patent_citation | `chapter6/`: citation_lag_by_section | Citation lag by CPC section |
| 18 | `18_chapter9_composite_quality.py` | g_patent, g_cpc_current, g_us_patent_citation, g_application | `chapter9/`: composite_quality_index | Z-score normalized composite quality index |
| 19 | `19_chapter8_friction_maps.py` | g_patent, g_cpc_current, g_application | `chapter7/`: friction_map | Examination duration heatmap by CPC section x period |
| 20 | `20_chapter5_inventor_mobility.py` | g_patent, g_assignee, g_inventor, g_us_patent_citation | `chapter5/`: inventor_mobility, inventor_mobility_by_decade | Inventor mobility and citation comparison |
| 21 | `21_chapter4_regional_specialization.py` | g_patent, g_cpc_current, g_inventor, g_location | `chapter4/`: regional_specialization | Location Quotient per city x CPC section |
| 22 | `22_chapter9_sleeping_beauty.py` | g_patent, g_cpc_current, g_us_patent_citation | `chapter9/`: sleeping_beauties | Delayed citation burst patent identification |
| 23 | `23_chapter11_ai_deep.py` | g_patent, g_cpc_current, g_assignee | `chapter11/`: ai_strategies, ai_gpt_diffusion | AI strategy portfolios + GPT diffusion |
| 24 | `24_chapter2_technology_halflife.py` | g_patent, g_cpc_current, g_us_patent_citation | `chapter2/`: technology_halflife | Citation decay curve half-life by CPC section |
| 25 | `25_chapter5_gender_deep.py` | g_patent, g_cpc_current, g_inventor, g_us_patent_citation | `chapter5/`: gender_by_tech, gender_team_quality, gender_section_trend | Gender x technology distribution and citation analysis |
| 26 | `26_chapter4_diffusion.py` | g_patent, g_cpc_current, g_inventor, g_location | `chapter4/`: innovation_diffusion, innovation_diffusion_summary | Geographic spread of tech areas over time |
| 27 | `27_chapter6_network_deep.py` | g_patent, g_inventor, g_assignee | `chapter3/`: network_metrics_by_decade, bridge_inventors | Co-inventor/co-assignee network metrics |
| 28 | `28_chapter12_topic_modeling.py` | 8.4M patent abstracts (DuckDB) | `chapter12/`: topic_definitions, topic_prevalence, topic_cpc_matrix, topic_umap, topic_novelty_trend, topic_novelty_top | TF-IDF + NMF (25 topics) + UMAP projection |
| 29 | `29_green_innovation.py` | g_patent, g_cpc_current, g_assignee, g_inventor, g_location | `green/`: green_volume, green_by_category, green_top_companies, green_by_country, green_ai_trend, green_ai_heatmap | Y02/Y04S climate change mitigation patent analysis |
| 30 | `30_batch_additions.py` | Multiple TSV tables | `chapter2/`: technology_scurves; `chapter3/`: non_us_by_section; `chapter5/`: inventor_segments, inventor_segments_trend; `chapter6/`: co_invention_rates, co_invention_by_section; `chapter9/`: quality_by_country, self_citation_by_assignee, self_citation_by_section; `chapter11/`: ai_team_comparison, ai_assignee_type | Batch fill of audit-identified gaps |

#### Company Analysis Scripts (31-44)

| # | Script | Outputs | Logic Summary |
|---|--------|---------|---------------|
| 31 | `31_company_name_mapping.py` | `company/company_name_mapping.json` | Clean display names for top 200 assignees |
| 32 | `32_company_profiles.py` | `company/company_profiles.json` | Per-year metrics for top 100 (patents, CPC breadth, team size, citations, etc.) |
| 33 | `33_trajectory_archetypes.py` | `company/trajectory_archetypes.json` | K-means clustering on normalized annual patent count time series |
| 34 | `34_corporate_mortality.py` | `company/corporate_mortality.json` | Top-50 assignee survival/replacement rates by decade |
| 35 | `35_portfolio_strategy.py` | `company/portfolio_diversification_b3.json`, `pivot_detection.json`, `patent_concentration.json` | Shannon entropy, JSD pivot detection, HHI/C4 |
| 36 | `36_corporate_citations.py` | `company/corporate_citation_network.json`, `tech_leadership.json`, `citation_half_life.json` | Inter-firm citation flows, section leadership, half-life |
| 37 | `37_inventor_careers.py` | `company/inventor_careers.json`, `inventor_drift.json`, `comeback_inventors.json` | Career curves, tech drift, comeback inventors |
| 38 | `38_design_patents_claims.py` | `company/design_patents.json`, `claims_analysis.json` | Design vs utility trends, claims analysis |
| 39 | `39_talent_flows.py` | `company/talent_flows.json`, `corporate_speed.json` | Inventor movement between firms (Sankey), grant lag per company |
| 40 | `40_portfolio_strategy_profiles.py` | `company/portfolio_overlap.json`, `strategy_profiles.json` | Cosine similarity + UMAP, 8-dimension radar |
| 41 | `41_firm_quality_distribution.py` | `company/firm_quality_distribution.json`, `firm_quality_scatter.json`, `firm_quality_gini.json`, `firm_claims_distribution.json`, `firm_scope_distribution.json` | Per-firm citation/claims/scope percentiles and Gini |
| 42 | `42_firm_exploration_exploitation.py` | `company/firm_exploration_scores.json`, `firm_exploration_scatter.json`, `firm_exploration_trajectories.json` | Tech newness + citation newness + external sourcing = exploration score |
| 43 | `43_firm_exploration_lifecycle.py` | `company/firm_exploration_lifecycle.json` | Exploration decay curves by firm x CPC subclass |
| 44 | `44_firm_ambidexterity_quality.py` | `company/firm_ambidexterity_quality.json` | Ambidexterity index vs performance per 5-year window |

#### First-Mover Advantage Scripts (45-46)

| # | Script | Outputs | Logic Summary |
|---|--------|---------|---------------|
| 45 | `45_fma_entry_identification.py` | `fma/entry_order.json`, `fma/qualifying_subclasses.json`, `fma/first_movers.json`, `fma/dominant_players.json` | Identify pioneers and dominant players per CPC subclass |
| 46 | `46_fma_match_rate.py` | `fma/match_rate_by_section.json`, `fma/match_rate_by_decade.json`, `fma/sankey_selected.json` | How often does the pioneer become the dominant player? |

**Note:** FMA outputs (`fma/` directory) do not exist on disk -- these scripts may not have been run, or outputs were deleted.

#### Domain Deep-Dive Scripts (47-57)

All use `domain_utils.run_domain_pipeline()` with domain-specific CPC filters and subfield SQL mappings.

| # | Script | Domain | CPC Filter | Output Dir |
|---|--------|--------|-----------|-----------|
| 47 | `47_semiconductors.py` | Semiconductors | H01L, H10N, H10K | `semiconductors/` |
| 48 | `48_quantum_computing.py` | Quantum Computing | G06N10/, H01L39/ | `quantum/` |
| 49 | `49_biotechnology.py` | Biotechnology | C12N15/, C12N9/, C12Q1/68 | `biotech/` |
| 50 | `50_autonomous_vehicles.py` | Autonomous Vehicles | B60W60/, G05D1/, G06V20/56 | `av/` |
| 51 | `51_space_technology.py` | Space Technology | B64G, H04B7/185 | `space/` |
| 52 | `52_cybersecurity.py` | Cybersecurity | G06F21/, H04L9/, H04L63/ | `cyber/` |
| 53 | `53_agricultural_technology.py` | Agricultural Tech | A01B, A01C, A01G, A01H, G06Q50/02 | `agtech/` |
| 54 | `54_digital_health.py` | Digital Health | A61B5/, G16H, A61B34/ | `digihealth/` |
| 55 | `55_3d_printing.py` | 3D Printing | B33Y, B29C64/, B22F10/ | `3dprint/` |
| 56 | `56_blockchain.py` | Blockchain | H04L9/0643, G06Q20/0655 | `blockchain/` |
| 57 | `57_green_supplement.py` | Green (supplement) | Y02/, Y04S/ | `green/` (7 supplementary files) |

---

## 3. Inline Data Transformations in `src/`

### 3.1 Summary Statistics

| Pattern | Total Occurrences | Files |
|---------|-------------------|-------|
| `.filter()` | 234 | 41 |
| `.map()` | 683 | 64 |
| `.reduce()` | 92 | 22 |
| `.sort()` | 266 | 38 |
| `.slice()` | 127 | 39 |
| `Math.*` | 105 | 30 |
| `.toFixed()` | 191 | 39 |
| `parseInt()` | 3 | 1 |
| `parseFloat()` | 0 | 0 |

**Total: ~1,701 inline transformation calls across ~65 unique files.**

### 3.2 Transformation Pattern Categories

#### A. Data Pivoting / Reshaping (~40% of transformations)

Found primarily in domain chapter pages (all 10 domain deep-dives share identical pivoting code) and several system chapter pages. Converts flat `[{year, category, value}]` arrays into pivoted objects `[{year, cat1: v1, cat2: v2, ...}]` suitable for Recharts stacked area/bar charts.

**Key locations:** All 10 domain pages (`space-technology`, `cybersecurity`, `semiconductors`, etc.), `org-patent-portfolio`, `org-composition`, `system-patent-fields`, `geo-domestic`.

**Canonical pattern:**
```ts
const years = [...new Set(data.map(d => d.year))].sort();
const pivoted = years.map(year => {
  const row: any = { year };
  data.filter(d => d.year === year).forEach(d => { row[d.category] = d.value; });
  return row;
});
```

This is the heaviest per-page transformation, occurring 6-15 times per domain chapter for subfields, diffusion, team comparison, assignee type, and bump chart data.

#### B. Number Formatting (`.toFixed()` -- 191 occurrences)

Used extensively for display formatting. Concentrated in:

- **`src/lib/formatters.ts`**: Central formatting functions (`formatCompact`, `formatPercent`, `formatDuration`, `movingAverage`) -- 7 occurrences
- **Domain chapter pages**: Each has ~8 `.toFixed()` calls for CR4 ratios, entropy scores, percentage display, and quality metrics
- **`src/components/charts/`**: Chart components format tick labels and tooltips

**Common patterns:**
```ts
(v / 1_000_000).toFixed(1) + 'M'       // formatCompact
`${n.toFixed(decimals)}%`               // formatPercent
v.toFixed(2)                            // quality scores
`${(value * 100).toFixed(1)}%`          // share formatting
```

#### C. Sorting and Ranking (`.sort()` -- 266 occurrences)

Four primary sorting patterns:

- **Chronological:** `.sort((a, b) => a.year - b.year)` -- most common
- **Descending rank:** `.sort((a, b) => b.patent_count - a.patent_count)` -- for ranking tables
- **Alphabetical:** `.sort()` on string arrays for consistent ordering
- **Aggregate rank:** `.sort((a, b) => b._total - a._total)` for portfolio rankings

#### D. Filtering (`.filter()` -- 234 occurrences)

- **Year/decade filtering:** `.filter(d => d.year >= 2000)`, `.filter(d => d.count > 0)`
- **Search filtering:** `.filter(d => d.name.toLowerCase().includes(q))` in explore page
- **Category filtering:** `.filter(d => d.section === selectedSection)`
- **Boolean/null removal:** `.filter(Boolean)` to remove nulls
- **Threshold filtering:** `.filter(d => d.cr4 > 0)`, `.filter(([, d]) => d.count >= 3)`

#### E. Aggregation and Reduction (`.reduce()` -- 92 occurrences)

- **Summing totals:** `.reduce((s, d) => s + d.patent_count, 0)` -- most common
- **Computing averages:** `reduce(...) / length`
- **Shannon entropy:** `-yearData.reduce((s, d) => { const p = d.count / total; return s + p * Math.log(p); }, 0)`
- **Matrix row sums:** `matrix[index].reduce((s, v) => s + v, 0)` in chord diagram
- **Moving averages:** `slice.reduce((s, d) => s + d.value, 0) / slice.length` in formatters

#### F. Slicing / Truncation (`.slice()` -- 127 occurrences)

- **Top-N display:** `.slice(0, 15)`, `.slice(0, 30)`, `.slice(0, 50)`, `.slice(0, 100)` for ranking tables
- **String truncation:** `name.slice(0, 22) + '...'` in chart labels, company names, node labels
- **Hex parsing:** `hex.slice(0, 2)`, `hex.slice(2, 4)` in `chartTheme.ts`
- **Moving window:** `data.slice(start, end)` in `formatters.ts` moving average

#### G. Mathematical Operations (`Math.*` -- 105 occurrences)

Concentrated in visualization components:

- **`PWNetworkGraph.tsx`** (17): `Math.sqrt()` for node sizing, `Math.min/max` for zoom clamping, bounding box
- **`PWWorldFlowMap.tsx`** (7): Coordinate calculations for world map projection
- **`PWChoroplethMap.tsx`** (3): Color scale with `Math.pow`, `Math.log10`, `Math.ceil`
- **`PWChordDiagram.tsx`** (3): Angle calculations with `Math.PI`
- **Domain pages** (4 each): `Math.floor(year/10)*10` for decade binning, `Math.log(p)` for entropy

#### H. parseInt (3 occurrences, 1 file)

All in `src/lib/chartTheme.ts` for hex color parsing:
```ts
r = parseInt(hex.slice(0, 2), 16);
g = parseInt(hex.slice(2, 4), 16);
b = parseInt(hex.slice(4, 6), 16);
```

No `parseFloat()` usage found anywhere in the codebase.

---

## 4. Computed Quality Metric Files (`public/data/computed/`)

Generated by `/home/saerom/projects/patentworld/compute_quality_metrics.py` (root-level Polars script). All 19 files share a common structure.

### 4.1 Quality Aggregation Files (11 files)

Each file contains an array of objects with the structure:
```json
{
  "year": 1976,
  "group": "<group_value>",
  "patent_count": 8329,
  "avg_num_claims": 8.903,
  "avg_scope": 1.578,
  "avg_forward_citations": 25.156,
  "avg_backward_citations": 5.083,
  "avg_self_citation_rate": 0.000545,
  "avg_grant_lag_days": 604.742,
  "avg_originality": 0.0,
  "avg_generality": 0.226,
  "sleeping_beauty_rate": 0.054
}
```

| File | Size | Group Column | Sample Group Values | Min Count | Consumer(s) |
|------|------|-------------|---------------------|-----------|-------------|
| `quality_by_cpc_section.json` | 132 KB | CPC section | A, B, C, D, E, F, G, H, Y | 10 | `system-patent-fields/page.tsx` |
| `quality_by_company.json` | 668 KB | Primary assignee org | BASF SE, Canon Kabushiki Kaisha, etc. (top 50) | 5 | `org-patent-quality/page.tsx` |
| `quality_by_inventor_rank.json` | 35 KB | Inventor rank | top_inventor, other_inventor | 10 | `inv-top-inventors/page.tsx` |
| `quality_by_specialization.json` | 34 KB | Inventor type | specialist, generalist | 10 | `inv-generalist-specialist/page.tsx` |
| `quality_by_experience.json` | 34 KB | Experience type | new_entrant, serial | 10 | `inv-serial-new/page.tsx` |
| `quality_by_gender.json` | 51 KB | Gender group | all_female, all_male, mixed | 10 | `inv-gender/page.tsx` |
| `quality_by_team_size.json` | 67 KB | Team size category | Solo, 2-3, 4-6, 7+ | 10 | `inv-team-size/page.tsx` |
| `quality_by_state.json` | 247 KB | US state abbrev | CA, NY, TX, MA, IL, MI, NJ, PA, OH, WA, FL, MN, NC, CT, CO | 10 | `geo-domestic/page.tsx` |
| `quality_by_city.json` | 253 KB | City, State | San Jose CA, San Diego CA, San Francisco CA, Austin TX, etc. | 10 | `geo-domestic/page.tsx` |
| `quality_by_domestic_intl.json` | 34 KB | Domestic/international | domestic, international | 10 | `geo-international/page.tsx` |
| `quality_by_country.json` | 243 KB | Country code | US, JP, DE, KR, CN, TW, FR, GB, CA, IT, CH, NL, IL, SE, IN | 10 | `geo-international/page.tsx` |

### 4.2 Inventor Productivity Files (5 files)

Each file contains an array of objects with the structure:
```json
{
  "year": 1976,
  "group": "<group_value>",
  "avg_patents_per_inventor": 1.391,
  "inventor_count": 86431
}
```

| File | Size | Group Column | Group Values | Consumer(s) |
|------|------|-------------|-------------|-------------|
| `inventor_productivity_by_rank.json` | 11 KB | Inventor rank | top_inventor, other_inventor | `inv-top-inventors/page.tsx` |
| `inventor_productivity_by_experience.json` | 9.8 KB | Experience | new_entrant, serial | `inv-serial-new/page.tsx` |
| `inventor_productivity_by_specialization.json` | 11 KB | Specialization | specialist, generalist | `inv-generalist-specialist/page.tsx` |
| `inventor_productivity_by_gender.json` | 9.7 KB | Gender | female, male | `inv-gender/page.tsx` |
| `inventor_productivity_by_team_size.json` | 19 KB | Team size | Solo, 2-3, 4-6, 7+ | `inv-team-size/page.tsx` |

### 4.3 Lookup Files (3 files)

| File | Size | Structure | Consumer(s) |
|------|------|-----------|-------------|
| `top_states.json` | 90 B | `["CA", "NY", "TX", "MA", "IL", "MI", "NJ", "PA", "OH", "WA", "FL", "MN", "NC", "CT", "CO"]` | `geo-domestic/page.tsx` |
| `top_cities.json` | 251 B | `["San Jose, CA", "San Diego, CA", "San Francisco, CA", "Austin, TX", ...]` | `geo-domestic/page.tsx` |
| `top_countries.json` | 90 B | `["US", "JP", "DE", "KR", "CN", "TW", "FR", "GB", "CA", "IT", "CH", "NL", "IL", "SE", "IN"]` | `geo-international/page.tsx` |

---

## Appendix: Data Flow Architecture

```
PatentsView TSV.zip files (raw, ~45 GB compressed)
     |
     v
data-pipeline/*.py  (57 scripts + config.py + domain_utils.py)
     |                                        |
     | DuckDB SQL queries                     | domain_utils.run_domain_pipeline()
     v                                        v
public/data/{chapter}/*.json            public/data/{domain}/*.json
     |
     |   compute_quality_metrics.py (Polars, all 38 cores)
     |           |
     v           v
public/data/computed/*.json
     |
     v
useChapterData() hook  -->  fetch('/data/{path}')
     |
     v
React chapter pages  -->  useMemo() pivoting/filtering  -->  Recharts / D3 components
```
