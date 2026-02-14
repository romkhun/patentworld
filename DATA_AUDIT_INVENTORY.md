# PatentWorld — Data Audit Inventory

## 1. Data Files

### 1.1 Summary

| Directory | Files | Size |
|-----------|-------|------|
| `public/data/chapter1/` | 5 | ~580 KB |
| `public/data/chapter2/` | 8 | ~1.7 MB |
| `public/data/chapter3/` | 8 | ~360 KB |
| `public/data/chapter4/` | 8 | ~1.5 MB |
| `public/data/chapter5/` | 14 | ~1.1 MB |
| `public/data/chapter6/` | 7 | ~240 KB |
| `public/data/chapter7/` | 5 | ~160 KB |
| `public/data/chapter9/` | 6 | ~500 KB |
| `public/data/chapter10/` | 3 | ~200 KB |
| `public/data/chapter11/` | 9 | ~940 KB |
| `public/data/chapter12/` | 6 | ~2.5 MB |
| `public/data/green/` | 6 | ~400 KB |
| `public/data/explore/` | 4 | ~800 KB |
| `public/data/company/` | 20 | ~2.3 MB |
| **Total** | **~107** | **~11.7 MB** |

### 1.2 File Listing by Directory

#### chapter1/ (The Innovation Landscape)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| patents_per_year.json | 11 KB | 50 year-type combos | 01_chapter1_landscape.py |
| patents_per_month.json | 200 KB | ~2,400 month entries | 01_chapter1_landscape.py |
| claims_per_year.json | 5 KB | 50 years | 01_chapter1_landscape.py |
| grant_lag.json | 6 KB | 50 years | 01_chapter1_landscape.py |
| hero_stats.json | 0.2 KB | 1 summary | 01_chapter1_landscape.py |

#### chapter2/ (The Technology Revolution)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| wipo_sectors_per_year.json | 30 KB | ~250 entries | 02_chapter2_technology.py |
| wipo_fields_per_year.json | 200 KB | ~1,700 entries | 02_chapter2_technology.py |
| cpc_sections_per_year.json | 15 KB | ~450 entries | 02_chapter2_technology.py |
| cpc_class_change.json | 300 KB | ~6,000 classes | 02_chapter2_technology.py |
| tech_diversity.json | 3 KB | 50 years | 02_chapter2_technology.py |
| cpc_treemap.json | 900 KB | ~700 groups | 02_chapter2_technology.py |
| technology_halflife.json | 1 KB | 8 sections | 24_chapter2_technology_halflife.py |
| technology_decay_curves.json | 8 KB | ~240 section-year | 24_chapter2_technology_halflife.py |

#### chapter3/ (Who Innovates?)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| assignee_types_per_year.json | 8 KB | ~250 entries | 03_chapter3_assignees.py |
| top_assignees.json | 7 KB | 50 assignees | 03_chapter3_assignees.py |
| top_orgs_over_time.json | 30 KB | ~900 entries | 03_chapter3_assignees.py |
| domestic_vs_foreign.json | 5 KB | ~100 entries | 03_chapter3_assignees.py |
| concentration.json | 4 KB | ~50 entries | 03_chapter3_assignees.py |
| firm_collaboration_network.json | 30 KB | nodes + edges | 09_chapter3_firm_deep.py |
| portfolio_diversity.json | 40 KB | ~1,100 entries | 15_chapter3_portfolio_diversity.py |
| network_metrics_by_decade.json | 4 KB | ~41 entries | 27_chapter6_network_deep.py |

#### chapter4/ (The Geography of Innovation)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| us_states_per_year.json | 200 KB | ~2,500 entries | 04_chapter4_geography.py |
| us_states_summary.json | 5 KB | ~55 states | 04_chapter4_geography.py |
| countries_per_year.json | 100 KB | ~1,500 entries | 04_chapter4_geography.py |
| top_cities.json | 10 KB | 50 cities | 04_chapter4_geography.py |
| state_specialization.json | 10 KB | ~400 entries | 21_chapter4_regional_specialization.py |
| inventor_state_flows.json | 50 KB | ~800 flows | 13_inventor_movement.py |
| inventor_country_flows.json | 5 KB | ~100 flows | 13_inventor_movement.py |
| inventor_mobility_trend.json | 3 KB | ~46 years | 13_inventor_movement.py |
| innovation_diffusion.json | 1 MB | ~29,000 entries | 26_chapter4_diffusion.py |
| regional_specialization.json | 20 KB | ~600 entries | 21_chapter4_regional_specialization.py |

#### chapter5/ (The Inventors)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| team_size_per_year.json | 5 KB | 50 years | 05_chapter5_inventors.py |
| gender_per_year.json | 8 KB | ~150 entries | 05_chapter5_inventors.py |
| gender_by_sector.json | 3 KB | ~40 entries | 05_chapter5_inventors.py |
| prolific_inventors.json | 15 KB | 100 inventors | 05_chapter5_inventors.py |
| inventor_entry.json | 4 KB | 50 years | 05_chapter5_inventors.py |
| inventor_collaboration_network.json | 30 KB | nodes + edges | 10_chapter5_inventor_deep.py |
| inventor_longevity.json | 15 KB | ~200 entries | 10_chapter5_inventor_deep.py |
| star_inventor_impact.json | 30 KB | 200 inventors | 10_chapter5_inventor_deep.py |
| superstar_concentration.json | 4 KB | 50 years | 16_chapter5_superstar_solo_firsttime.py |
| solo_inventors.json | 4 KB | 50 years | 16_chapter5_superstar_solo_firsttime.py |
| solo_inventors_by_section.json | 1 KB | 8 sections | 16_chapter5_superstar_solo_firsttime.py |
| first_time_inventors.json | 4 KB | 50 years | 16_chapter5_superstar_solo_firsttime.py |
| inventor_mobility.json | 1 KB | 2 groups | 20_chapter5_inventor_mobility.py |
| inventor_mobility_by_decade.json | 3 KB | ~41 entries | 20_chapter5_inventor_mobility.py |

#### chapter6/ (Collaboration Networks)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| citations_per_year.json | 5 KB | 50 years | 06_chapter6_citations.py |
| citation_categories.json | 8 KB | ~100 entries | 06_chapter6_citations.py |
| citation_lag.json | 5 KB | 50 years | 06_chapter6_citations.py |
| gov_funded_per_year.json | 3 KB | 50 years | 06_chapter6_citations.py |
| gov_agencies.json | 2 KB | ~20 agencies | 06_chapter6_citations.py |
| citation_lag_by_section.json | 20 KB | ~328 entries | 17_chapter7_citation_lag.py |
| citation_lag_trend.json | 4 KB | 46 years | 17_chapter7_citation_lag.py |

#### chapter7/ (The Knowledge Network / Innovation Dynamics crossover)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| grant_lag_by_sector.json | 30 KB | ~250 entries | 08_chapter7_dynamics.py |
| cross_domain.json | 5 KB | 50 years | 08_chapter7_dynamics.py |
| intl_collaboration.json | 5 KB | 50 years | 08_chapter7_dynamics.py |
| corp_diversification.json | 5 KB | ~60 entries | 08_chapter7_dynamics.py |
| friction_map.json | 15 KB | ~400 entries | 19_chapter8_friction_maps.py |

#### chapter9/ (Patent Quality)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| quality_trends.json | 8 KB | 50 years | 11_chapter9_patent_quality.py |
| originality_generality.json | 5 KB | 45 years | 11_chapter9_patent_quality.py |
| self_citation_rate.json | 3 KB | ~50 entries | 11_chapter9_patent_quality.py |
| quality_by_sector.json | 15 KB | ~250 entries | 11_chapter9_patent_quality.py |
| breakthrough_patents.json | 5 KB | ~350 entries | 11_chapter9_patent_quality.py |
| composite_quality_index.json | 15 KB | ~360 entries | 18_chapter9_composite_quality.py |
| sleeping_beauties.json | 10 KB | 50 patents | 22_chapter9_sleeping_beauty.py |

#### chapter10/ (Patent Law & Policy)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| hhi_by_section.json | 50 KB | ~400 entries | 14_chapter10_patent_law.py |
| applications_vs_grants.json | 4 KB | 50 years | 14_chapter10_patent_law.py |
| convergence_matrix.json | 15 KB | ~200 entries | 14_chapter10_patent_law.py |

#### chapter11/ (AI Patents)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| ai_patents_per_year.json | 3 KB | 50 years | 12_chapter11_ai_patents.py |
| ai_by_subfield.json | 10 KB | ~200 entries | 12_chapter11_ai_patents.py |
| ai_top_assignees.json | 3 KB | 20 assignees | 12_chapter11_ai_patents.py |
| ai_top_inventors.json | 3 KB | 20 inventors | 12_chapter11_ai_patents.py |
| ai_geography.json | 5 KB | ~200 entries | 12_chapter11_ai_patents.py |
| ai_quality.json | 4 KB | 50 years | 12_chapter11_ai_patents.py |
| ai_org_over_time.json | 5 KB | ~200 entries | 12_chapter11_ai_patents.py |
| ai_strategies.json | 8 KB | 190 entries | 23_chapter11_ai_deep.py |
| ai_gpt_diffusion.json | 4 KB | ~250 entries | 23_chapter11_ai_deep.py |

#### chapter12/ (The Language of Innovation)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| topic_definitions.json | 8 KB | 25 topics | 28_chapter12_topic_modeling.py |
| topic_prevalence.json | 50 KB | ~1,250 entries | 28_chapter12_topic_modeling.py |
| topic_cpc_crosstab.json | 5 KB | ~200 entries | 28_chapter12_topic_modeling.py |
| topic_umap.json | 1.5 MB | 15,000 points | 28_chapter12_topic_modeling.py |
| topic_novelty.json | 3 KB | 50 years | 28_chapter12_topic_modeling.py |
| topic_transitions.json | 15 KB | ~600 entries | 28_chapter12_topic_modeling.py |

#### green/ (Green Innovation)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| green_volume.json | 3 KB | 50 years | 29_green_innovation.py |
| green_subcategories.json | 5 KB | ~200 entries | 29_green_innovation.py |
| green_by_country.json | 8 KB | ~334 entries | 29_green_innovation.py |
| green_top_companies.json | 3 KB | 20 companies | 29_green_innovation.py |
| green_ai_heatmap.json | 3 KB | ~60 entries | 29_green_innovation.py |
| green_quality.json | 3 KB | ~40 entries | 29_green_innovation.py |

#### explore/
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| top_assignees_all.json | 80 KB | 500 assignees | 07_explore_data.py |
| top_inventors_all.json | 80 KB | 500 inventors | 07_explore_data.py |
| cpc_class_summary.json | 400 KB | ~700 classes | 07_explore_data.py |
| wipo_field_summary.json | 3 KB | 34 fields | 07_explore_data.py |

#### company/ (Company-Level Analyses)
| File | Size | Records | Source Script |
|------|------|---------|--------------|
| company_name_mapping.json | 9 KB | 200 mappings | 31_company_name_mapping.py |
| company_profiles.json | 1.2 MB | 100 companies | 32_company_profiles.py |
| trajectory_archetypes.json | 84 KB | 200 companies | 33_trajectory_archetypes.py |
| corporate_mortality.json | 33 KB | 5 decades | 34_corporate_mortality.py |
| portfolio_diversification_b3.json | 159 KB | 1,998 obs | 35_portfolio_strategy.py |
| pivot_detection.json | 112 KB | 803 obs | 35_portfolio_strategy.py |
| patent_concentration.json | 20 KB | 400 obs | 35_portfolio_strategy.py |
| corporate_citation_network.json | 248 KB | 3,274 flows | 36_corporate_citations.py |
| tech_leadership.json | 43 KB | 440 entries | 36_corporate_citations.py |
| citation_half_life.json | 4.4 KB | 49 companies | 36_corporate_citations.py |
| inventor_careers.json | 6.2 KB | curves + durations | 37_inventor_careers.py |
| inventor_drift.json | 636 B | 6 categories | 37_inventor_careers.py |
| comeback_inventors.json | 1.4 KB | 11 entries | 37_inventor_careers.py |
| design_patents.json | 4.8 KB | trends + filers | 38_design_patents_claims.py |
| claims_analysis.json | 8.7 KB | trends + sections | 38_design_patents_claims.py |
| talent_flows.json | 81 KB | nodes + links | 39_talent_flows.py |
| portfolio_overlap.json | 25 KB | 248 points | 40_portfolio_strategy_profiles.py |
| strategy_profiles.json | 4.8 KB | 30 companies | 40_portfolio_strategy_profiles.py |
| corporate_speed.json | 213 KB | 1,936 obs | 39_talent_flows.py |
| company_milestones.json | 5.3 KB | 20 companies | Manual curation |

### 1.3 Potentially Unused Data Files

| File | Reason |
|------|--------|
| `chapter1/patents_per_month.json` | No chart consumes monthly data |
| `chapter2/wipo_fields_per_year.json` | Only WIPO sectors used in chapter |
| `chapter6/citation_categories.json` | Not referenced in any page component |
| `company/company_name_mapping.json` | Used only by pipeline scripts, not frontend |
| `company/company_milestones.json` | Referenced in Ch14 but may be optional |

---

## 2. Pipeline Scripts

### 2.1 Summary

| Range | Scripts | Purpose |
|-------|---------|---------|
| 01–07 | 7 | Core chapter data (landscape, technology, assignees, geography, inventors, citations, explore) |
| 08–10 | 3 | Deep dives (dynamics, firm deep, inventor deep) |
| 11–13 | 3 | Quality, AI patents, inventor movement |
| 14–20 | 7 | Batch 2 (patent law, portfolio, superstars, citation lag, composite quality, friction maps, mobility) |
| 21–30 | 10 | Batch 2 cont. (specialization, sleeping beauty, AI deep, halflife, gender, diffusion, network, topics, green, batch additions) |
| 31–40 | 10 | Batch 3 company-level (name mapping, profiles, archetypes, mortality, portfolio strategy, citations, careers, design/claims, talent flows, strategy profiles) |
| config.py | 1 | Shared configuration (DuckDB helpers, constants, JSON serialization) |
| **Total** | **41** | |

### 2.2 PatentsView Tables Used

| Table | Description | Used By |
|-------|-------------|---------|
| `g_patent` | Patent metadata (date, type, claims) | All 40 scripts |
| `g_assignee_disambiguated` | Assignee info (org name, type, location) | 03, 07, 09, 12, 15, 20, 23, 27, 29, 30, 31–40 |
| `g_inventor_disambiguated` | Inventor info (name, gender, location) | 04, 05, 10, 12, 13, 21, 25, 26, 27, 30, 37, 39 |
| `g_location_disambiguated` | Location coordinates | 04, 12, 13, 21, 26, 29, 30 |
| `g_cpc_current` | CPC classification codes | 02, 04, 07, 08, 09, 11, 12, 14, 15, 16, 18, 19, 21–30, 32, 35, 36, 38, 40 |
| `g_cpc_title` | CPC code descriptions | 02, 07 |
| `g_us_patent_citation` | Citation pairs | 06, 09, 10, 11, 17, 18, 22, 24, 25, 30, 32, 36 |
| `g_application` | Filing dates | 01, 08, 11, 14, 18, 30, 38, 39 |
| `g_wipo_technology` | WIPO field classifications | 02, 05, 07, 08, 11 |
| `g_gov_interest` | Government funding flags | 06 |
| `g_gov_interest_org` | Funding agency names | 06 |
| `g_patent_abstract` | Patent abstract text | 28 |

### 2.3 Key Dependencies

| Dependency | Scripts | Purpose |
|------------|---------|---------|
| DuckDB | All | SQL query engine |
| orjson | All (via config.py) | Fast JSON serialization |
| scikit-learn | 28, 33, 40 | NMF topic modeling, k-means clustering |
| scipy | 35, 40 | JSD computation, spatial operations |
| umap-learn | 28, 40 | UMAP dimensionality reduction |
| pandas | 32, 33, 34, 35, 36, 37, 39, 40 | Data manipulation |

---

## 3. Inline Data Transformations

### 3.1 Summary

All 14 chapter pages plus the home page and explore page use the `useChapterData<T>(path)` hook to fetch JSON data at runtime. Most pages perform lightweight client-side transformations for visualization.

### 3.2 Common Patterns

| Pattern | Occurrences | Description |
|---------|-------------|-------------|
| `useMemo` aggregation | ~40 | Sorting, filtering, computing derived values |
| `.map()` / `.filter()` | ~30 | Transform data arrays for chart props |
| `.reduce()` | ~15 | Compute totals, weighted averages |
| `.sort()` / `.slice()` | ~20 | Top-N selection, ranking |
| Ternary fallbacks | ~10 | `data ?? []` or `value?.toFixed(1) ?? '—'` |

### 3.3 Issues Found

| Issue | File | Line | Severity | Status |
|-------|------|------|----------|--------|
| Missing null guard on `m.assignee.length` | innovation-dynamics/page.tsx | 522 | LOW | **FIXED** |
| `comebackData[0]` stats use only 5-year gap cohort | the-inventors/page.tsx | 846–855 | MEDIUM | **FIXED** |
| `useMemo` with `setState` side effect | collaboration-networks/page.tsx | 59–63 | MEDIUM | **FIXED** |
| Variable `decades` holds section names | innovation-dynamics/page.tsx | 70–82 | LOW | Cosmetic only |
| Unmemoized inline `.map()` in JSX | the-innovation-landscape/page.tsx | 171–175 | LOW | Performance only |
| Potential null on `green_pct.toFixed(1)` | green-innovation/page.tsx | 184–185 | LOW | **FIXED** |
