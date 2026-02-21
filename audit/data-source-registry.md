# PatentWorld Data Source Registry

> Generated: 2026-02-21 (S1.2 comprehensive audit)
> Project: `/home/saerom/projects/patentworld`

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total JSON data files | 383 |
| Total data size | 42.45 MB |
| Data directories | 36 |
| Files referenced by chapter pages | 352 |
| Orphan files (not referenced) | 31 |
| Missing files (referenced but absent) | 0 |
| Geo files (TopoJSON) | 2 (218 KB) |
| Data dictionary | 1 (5.2 KB) |

---

## 2. public/data-dictionary.json

**Path:** `/home/saerom/projects/patentworld/public/data-dictionary.json`
**Size:** 5,241 bytes

A machine-readable schema reference documenting:
- **coverage**: 9.36M patents, 1976-2025, types: utility, design, plant, reissue
- **source_tables** (12): g_patent, g_application, g_cpc_current, g_assignee_disambiguated, g_inventor_disambiguated, g_location_disambiguated, g_us_patent_citation, g_foreign_citation, g_gov_interest, g_gov_interest_org, g_cpc_title, g_wipo_technology
- **data_directories** (36): descriptions mapping each folder to its analytical domain
- **derived_metrics** (9): originality, generality, blockbuster_rate, dud_rate, shannon_entropy, hhi, cr4, exploration_score, grant_lag, cohort_normalization
- **technology_domains** (12): CPC code definitions for ai, green, semiconductors, quantum_computing, cybersecurity, biotechnology, digital_health, agricultural_technology, autonomous_vehicles, space_technology, 3d_printing, blockchain

---

## 3. public/geo/ Files

| File | Size | Format | Contents |
|------|------|--------|----------|
| `public/geo/us-states.json` | 112 KB | TopoJSON (Topology) | US state boundaries and nation outline. Objects: `states`, `nation`. Used by `PWChoroplethMap` component. |
| `public/geo/world-110m.json` | 106 KB | TopoJSON (Topology) | World country boundaries (110m resolution) and land outline. Objects: `countries`, `land`. Used by `PWWorldFlowMap` component. |

---

## 4. Data Files by Folder

### 4.1 chapter1/ -- Patent Count (Chapter 1: system-patent-count)

**11 files, 0.07 MB. Used by:** `system-patent-count/page.tsx`, `system-patent-quality/page.tsx`, `system-public-investment/page.tsx`, `HomeContent.tsx`

| File | Format | Rows | Schema (top-level keys) | Year Range |
|------|--------|------|------------------------|------------|
| `patents_per_year.json` | array | 247 | year, patent_type, count | 1976-2025 |
| `patents_per_month.json` | array | 597 | month, count | -- |
| `filing_vs_grant_year.json` | array | 99 | series, year, count | 1976-2025 |
| `grant_lag.json` | array | 50 | year, avg_lag_days, median_lag_days, count | 1976-2025 |
| `pendency_by_filing_year.json` | array | 47 | year, avg_pendency_years, median_pendency_years, patent_count | 1976-2022 |
| `claims_per_year.json` | array | 50 | year, avg_claims, median_claims, count | 1976-2025 |
| `continuation_chains.json` | array | 50 | year, total_patents, originals, continuations, divisions, cips, related_filings, related_share_pct | 1976-2025 |
| `hero_stats.json` | object | -- | total_patents, first_year, last_year, peak_year, peak_year_count | -- |
| `gov_agency_breadth_depth.json` | array | 23 | agency, total_patents, n_sections, breadth, depth | -- |
| `gov_agency_field_matrix.json` | array | 103 | agency, section, patent_count, mean_norm_citations, mean_generality | -- |
| `gov_impact_comparison.json` | array | 2 | funding_status, patent_count, mean_raw_citations, mean_normalized, top_decile_share, top_1pct_share | -- |

**Orphan files:** `patents_per_month.json`

---

### 4.2 chapter2/ -- Patent Quality (Chapter 2: system-patent-quality)

**15 files, 0.32 MB. Used by:** `system-patent-quality/page.tsx`, `system-patent-fields/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `cpc_sections_per_year.json` | array | 400 | year, section, count | 1976-2025 |
| `cpc_treemap.json` | array | 548 | section, cpc_class, class_name, patent_count | -- |
| `cpc_class_change.json` | array | 30 | cpc_class, early_count, late_count, pct_change, class_name, direction | -- |
| `tech_diversity.json` | array | 50 | year, diversity_index, hhi | 1976-2025 |
| `technology_decay_curves.json` | array | 248 | section, years_after, citations, pct_of_total | -- |
| `technology_halflife.json` | array | 8 | section, half_life_years, total_citations | -- |
| `technology_scurves.json` | array | 8 | section, section_name, K, r, t0, lifecycle_stage, current_pct_of_K, current_growth_rate, cumulative_total, recent_5yr_volume, years, actual_cumulative, fitted_cumulative | -- |
| `figures_per_patent.json` | array | 50 | year, avg_figures, avg_sheets, median_figures, patent_count | 1976-2025 |
| `figures_by_cpc_section.json` | array | 8 | cpc_section, avg_figures, avg_sheets, patent_count | -- |
| `foreign_citation_share.json` | array | 50 | year, total_patents, avg_foreign_citations, avg_us_citations, avg_foreign_share_pct | 1976-2025 |
| `npl_citations_per_year.json` | array | 50 | year, avg_npl_citations, median_npl_citations, total_patents, patents_with_npl | 1976-2025 |
| `npl_citations_by_cpc.json` | array | 8 | cpc_section, avg_npl_citations, patent_count | -- |
| `blockbuster_lorenz.json` | array | 4 | decade, n_firms, total_patents, total_blockbusters, gini, lorenz | -- |
| `wipo_fields_per_year.json` | array | 1700 | year, sector, field, count | 1976-2025 |
| `wipo_sectors_per_year.json` | array | 250 | year, sector, count | 1976-2025 |

**Orphan files:** `cpc_class_change.json`, `wipo_fields_per_year.json`, `wipo_sectors_per_year.json`

---

### 4.3 chapter3/ -- Patent Fields / Assignees (Chapters 3, 8, 9: org-composition, org-patent-count)

**17 files, 0.96 MB. Used by:** `org-composition/page.tsx`, `org-patent-count/page.tsx`, `inv-team-size/page.tsx`, `mech-inventors/page.tsx`, `mech-organizations/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `assignee_types_per_year.json` | array | 200 | year, category, count | 1976-2025 |
| `top_assignees.json` | array | 50 | organization, total_patents, first_year, last_year | 1976-2014 |
| `top_orgs_over_time.json` | array | 835 | year, organization, count, rank | 1980-2025 |
| `concentration.json` | array | 10 | period_start, period, top10_share, top50_share, top100_share, total_patents | -- |
| `domestic_vs_foreign.json` | array | 150 | year, origin, count | 1976-2025 |
| `non_us_by_section.json` | array | 2685 | year, section, country, count | 1976-2025 |
| `firm_citation_impact.json` | array | 30 | organization, total_patents, avg_citations_received, median_citations_received, p90_citations_received | -- |
| `firm_collaboration_network.json` | object | -- | nodes (618 items: id, name, patents), edges | -- |
| `firm_tech_evolution.json` | array | 5546 | organization, period, section, count | -- |
| `network_metrics_by_decade.json` | array | 5 | decade, decade_label, num_nodes, num_edges, num_patents, avg_degree, avg_team_size | -- |
| `portfolio_diversity.json` | array | 252 | organization, period_start, period, num_subclasses, shannon_entropy, active_subclasses | -- |
| `team_size_coefficients.json` | object | -- | main_coefficients (4 items: category, coefficient, se, ci_lower, ci_upper), interaction, by_decade, metadata | -- |
| `bridge_inventors.json` | array | 30 | inventor_id, first_name, last_name, num_orgs, total_patents | -- |
| `cpc_reclassification_by_decade.json` | array | 2 | decade, total_patents, reclassified, reclass_rate_pct | -- |
| `cpc_reclassification_flows.json` | array | 56 | from_section, to_section, count | -- |
| `wipo_field_growth.json` | array | 35 | field, count_early, count_late, growth_pct, total | -- |
| `wipo_sector_shares.json` | array | 250 | year, sector, patent_count | 1976-2025 |

**Orphan files:** `portfolio_diversity.json`, `cpc_reclassification_by_decade.json`, `cpc_reclassification_flows.json`, `wipo_field_growth.json`, `wipo_sector_shares.json`

---

### 4.4 chapter4/ -- Geography (Chapters 18-19: geo-domestic, geo-international, mech-inventors)

**12 files, 4.76 MB. Used by:** `geo-domestic/page.tsx`, `geo-international/page.tsx`, `mech-inventors/page.tsx`, `system-convergence/page.tsx`, `mech-geography/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `countries_per_year.json` | array | 5304 | year, country, count | 1976-2025 |
| `us_states_per_year.json` | array | 2692 | year, state, count | 1976-2025 |
| `us_states_summary.json` | array | 57 | state, total_patents, unique_inventors | -- |
| `top_cities.json` | array | 50 | city, state, total_patents, lat, lng | -- |
| `state_specialization.json` | array | 441 | state, section, count | -- |
| `regional_specialization.json` | array | 5735 | city, state, total_patents, section, metro_section_count, location_quotient | -- |
| `innovation_diffusion.json` | array | 24533 | tech_area, period_start, period, city, state, country, lat, lng, patent_count | -- |
| `innovation_diffusion_summary.json` | array | 3 | tech_area, periods | -- |
| `inventor_country_flows.json` | array | 200 | from_country, to_country, flow_count | -- |
| `inventor_state_flows.json` | array | 200 | from_state, to_state, flow_count | -- |
| `inventor_mobility_trend.json` | array | 46 | year, total_patents_with_prev, intl_moves, domestic_moves, intl_mobility_pct, domestic_mobility_pct | 1980-2025 |
| `ipc_vs_cpc_convergence.json` | array | 50 | year, total_patents, ipc_multi_section_pct, cpc_multi_section_pct | 1976-2025 |

**Largest file:** `innovation_diffusion.json` (3.91 MB, 24,533 rows)
**Orphan files:** `innovation_diffusion.json`

---

### 4.5 chapter5/ -- Inventors (Chapters 13-17: inv-top-inventors, inv-serial-new, inv-gender, inv-team-size, inv-generalist-specialist, mech-inventors)

**22 files, 0.25 MB. Used by:** `inv-top-inventors/page.tsx`, `inv-serial-new/page.tsx`, `inv-gender/page.tsx`, `inv-team-size/page.tsx`, `mech-inventors/page.tsx`, `mech-organizations/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `gender_per_year.json` | array | 100 | year, gender, count | 1976-2025 |
| `gender_section_trend.json` | array | 88 | period_start, period, section, total_inventors, female_inventors, female_pct | -- |
| `gender_by_sector.json` | array | 10 | sector, gender, count | -- |
| `gender_by_tech.json` | array | 16 | section, gender, count | -- |
| `gender_team_quality.json` | array | 3 | team_gender, patent_count, avg_citations, median_citations | -- |
| `team_size_per_year.json` | array | 50 | year, avg_team_size, median_team_size, solo_pct, large_team_pct, total_patents | 1976-2025 |
| `solo_inventors.json` | array | 50 | year, total_patents, solo_patents, solo_pct | 1976-2025 |
| `solo_inventors_by_section.json` | array | 8 | section, solo_count, team_count, solo_pct | -- |
| `first_time_inventors.json` | array | 50 | year, total_patents, patents_with_debut, debut_pct | 1976-2025 |
| `inventor_entry.json` | array | 50 | year, new_inventors | 1976-2025 |
| `inventor_longevity.json` | array | 256 | cohort, career_length, survival_pct | -- |
| `inventor_segments.json` | array | 5 | segment, inventor_count, total_patents, avg_patents, patent_share, inventor_share | -- |
| `inventor_segments_trend.json` | array | 45 | year, total_inventors, one_hit_count, one_hit_pct | 1976-2020 |
| `prolific_inventors.json` | array | 100 | inventor_id, first_name, last_name, total_patents, first_year, last_year, gender | 1976-2016 |
| `star_inventor_impact.json` | array | 200 | inventor_id, first_name, last_name, total_patents, avg_citations, median_citations, max_citations | -- |
| `superstar_concentration.json` | array | 50 | year, total_patents, top1pct_patents, top5pct_patents, top1pct_share, top5pct_share, remaining_share | 1976-2025 |
| `inventor_mobility.json` | array | 2 | mobility, patent_count, avg_citations, median_citations | -- |
| `inventor_mobility_by_decade.json` | array | 5 | decade, decade_label, total_inventors, mobile_inventors, mobility_rate | -- |
| `inventor_mobility_event_study.json` | object | -- | overall (11 items: relative_year, n_obs, etc.), by_direction, summary | -- |
| `inventor_collaboration_network.json` | object | -- | nodes (632 items: id, name, patents), edges | -- |
| `bridge_centrality.json` | array | 5 | centrality_quintile, centrality_label, n_inventors, mean_degree, mean_citations, mean_patent_count | -- |
| `exploration_exploitation_trajectory.json` | object | -- | keyed by company name (10 firms), each value: array of {period, period_start, exploration_index, self_citation_rate, exploitation_index} | -- |

**Orphan files:** `inventor_mobility.json`, `inventor_mobility_by_decade.json`, `inventor_segments_trend.json`

---

### 4.6 chapter6/ -- Patent Law & Citations (Chapter 6: system-patent-law, system-patent-quality, mech-geography, system-public-investment, system-patent-fields)

**16 files, 0.07 MB. Used by:** `system-patent-law/page.tsx`, `system-patent-quality/page.tsx`, `mech-geography/page.tsx`, `system-public-investment/page.tsx`, `system-patent-fields/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `citations_per_year.json` | array | 50 | year, avg_citations, median_citations, total_patents | 1976-2025 |
| `citation_lag.json` | array | 50 | year, avg_lag_days, median_lag_days, total_citations | 1976-2025 |
| `citation_lag_trend.json` | array | 46 | year, citation_count, avg_lag_years, median_lag_years | 1980-2025 |
| `citation_lag_by_section.json` | array | 40 | section, decade, decade_label, citation_count, avg_lag_days, median_lag_days, avg_lag_years, median_lag_years | -- |
| `citation_categories.json` | array | 69 | year, category, count | 2002-2025 |
| `co_invention_rates.json` | array | 293 | year, partner, co_count, us_patents, co_invention_rate | 1976-2025 |
| `co_invention_us_china_by_section.json` | array | 130 | year, section, us_cn_count | 2000-2025 |
| `gov_agencies.json` | array | 20 | agency, total_patents | -- |
| `gov_funded_per_year.json` | array | 50 | year, count | 1976-2025 |
| `alice_art_group_grants.json` | array | 34 | year, group_type, grant_count | 2008-2024 |
| `alice_art_group_indexed.json` | array | 34 | year, group_type, grant_count, indexed | 2008-2024 |
| `alice_art_group_pendency.json` | array | 34 | year, group_type, avg_pendency_days, median_pendency_days | 2008-2024 |
| `patent_term_adjustment.json` | array | 24 | year, avg_pta_days, median_pta_days, patent_count | 2002-2025 |
| `pta_by_cpc_section.json` | array | 8 | cpc_section, avg_pta_days, median_pta_days, patent_count | -- |
| `terminal_disclaimer_rate.json` | array | 50 | year, total_patents, with_terminal_disclaimer, td_rate_pct | 1976-2025 |
| `terminal_disclaimer_by_cpc.json` | array | 8 | cpc_section, total_patents, with_td, td_rate_pct | -- |

**Orphan files:** `alice_art_group_grants.json`, `citation_categories.json`, `citation_lag.json`

---

### 4.7 chapter7/ -- Public Investment / Cross-Domain (Chapter 7: system-public-investment, system-patent-fields, system-convergence, mech-geography)

**7 files, 0.07 MB. Used by:** `system-public-investment/page.tsx`, `system-patent-fields/page.tsx`, `system-convergence/page.tsx`, `mech-geography/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `cross_domain.json` | array | 50 | year, total, single_section, two_sections, three_plus_sections, multi_section_pct | 1976-2025 |
| `corp_diversification.json` | array | 158 | organization, section, era, count | -- |
| `friction_map.json` | array | 88 | section, period_start, period, patent_count, avg_lag_days, median_lag_days, avg_lag_years, median_lag_years | -- |
| `grant_lag_by_sector.json` | array | 55 | period, sector, avg_lag_days, median_lag_days, count | -- |
| `innovation_velocity.json` | array | 250 | year, sector, count, prev_count, yoy_growth_pct | 1976-2025 |
| `intl_collaboration.json` | array | 50 | year, total_patents, intl_collab_count, intl_collab_pct | 1976-2025 |
| `top_government_contracts.json` | array | 50 | contract_award_number, agency, patent_count | -- |

**Orphan files:** `grant_lag_by_sector.json`

---

### 4.8 chapter8/ -- Filing Routes & Law Firms (Chapter 8: org-composition)

**4 files, 0.03 MB. Used by:** `org-composition/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `filing_route_over_time.json` | array | 50 | year, total, pct_route, direct_foreign, domestic, pct_share_pct, direct_foreign_share_pct, domestic_share_pct | 1976-2025 |
| `filing_route_by_country.json` | array | 110 | country, period, total, pct_share, direct_foreign_share, domestic_share | -- |
| `law_firm_concentration.json` | array | 50 | year, total_with_firm, cr4_pct, cr10_pct | 1976-2025 |
| `top_law_firms.json` | array | 20 | firm, total_patents, first_year, last_year | 1976-2015 |

**Orphan files:** `filing_route_by_country.json`

---

### 4.9 chapter9/ -- Quality & Sleeping Beauties (Chapter 9: system-patent-quality, system-patent-fields, org-patent-count, geo-international)

**11 files, 0.12 MB. Used by:** `system-patent-quality/page.tsx`, `system-patent-fields/page.tsx`, `org-patent-count/page.tsx`, `geo-international/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `quality_trends.json` | array | 50 | year, avg_claims, median_claims, avg_backward_cites, ..., avg_grant_lag_days, median_grant_lag_days (13 cols) | 1976-2025 |
| `originality_generality.json` | array | 50 | year, avg_originality, median_originality, avg_generality, median_generality | 1976-2025 |
| `quality_by_sector.json` | array | 50 | period, sector, avg_forward_cites, avg_claims, avg_scope | -- |
| `quality_by_country.json` | array | 74 | country, decade, patent_count, avg_claims | -- |
| `sleeping_beauties.json` | array | 50 | patent_id, grant_year, section, cpc_subclass, early_cites, avg_early_rate, burst_citations, burst_year_after_grant, total_fwd_cites | 1985-2001 |
| `self_citation_rate.json` | array | 50 | year, avg_self_cite_rate, median_self_cite_rate | 1976-2025 |
| `self_citation_by_section.json` | array | 40 | decade, section, total_citations, self_citations, self_cite_rate | -- |
| `self_citation_by_assignee.json` | array | 20 | organization, total_citations, self_citations, self_cite_rate | -- |
| `breakthrough_patents.json` | array | 45 | year, total_patents, breakthrough_count, breakthrough_pct | 1976-2020 |
| `composite_quality_index.json` | array | 360 | year, section, patent_count, avg_z_cites, avg_z_claims, avg_z_scope, avg_z_lag, composite_index | 1976-2020 |
| `continuation_share_by_firm.json` | array | 50 | organization, total_patents, related_filings, continuation_share_pct | -- |

**Orphan files:** `breakthrough_patents.json`, `composite_quality_index.json`

---

### 4.10 chapter10/ -- Convergence (Chapter 4: system-convergence, system-patent-law, system-patent-fields, org-patent-quality)

**10 files, 0.09 MB. Used by:** `system-convergence/page.tsx`, `system-patent-law/page.tsx`, `system-patent-fields/page.tsx`, `org-patent-quality/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `interdisciplinarity_unified.json` | array | 49 | year, mean_scope, mean_cpc_sections, multi_section_pct, patent_count, z_scope, z_cpc_sections, z_multi_section, z_composite | 1976-2024 |
| `convergence_matrix.json` | array | 84 | era, section_row, section_col, co_occurrence_pct, patent_count | -- |
| `convergence_decomposition.json` | array | 48 | year, overall_multi_rate, within_firm, between_firm, total_change | 1977-2024 |
| `convergence_near_far.json` | array | 98 | year, distance_type, share_pct | 1976-2024 |
| `convergence_top_assignees.json` | array | 475 | year, firm, multi_count, total_count | 1976-2024 |
| `hhi_by_section.json` | array | 99 | period_start, period, section, total_patents, hhi | -- |
| `alice_event_study.json` | array | 26 | year, group_label, patent_count, mean_claims, mean_scope, idx_count, idx_claims, idx_scope | 2008-2020 |
| `applications_vs_grants.json` | array | 50 | year, applications, grants, grant_to_application_ratio | 1976-2025 |
| `foreign_citation_by_firm.json` | array | 50 | organization, total_patents, foreign_citation_share_pct | -- |
| `npl_by_firm.json` | array | 50 | organization, total_patents, avg_npl_citations, median_npl_citations | -- |

---

### 4.11 chapter11/ -- AI Patents (Chapter 25: ai-patents)

**15 files, 0.14 MB. Used by:** `ai-patents/page.tsx`, `org-patent-portfolio/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `ai_patents_per_year.json` | array | 50 | year, total_patents, ai_patents, ai_pct | 1976-2025 |
| `ai_by_subfield.json` | array | 427 | year, subfield, count | 1976-2025 |
| `ai_assignee_type.json` | array | 135 | year, assignee_category, count | 1990-2025 |
| `ai_entrant_incumbent.json` | array | 36 | year, entrant_count, incumbent_count | 1990-2025 |
| `ai_geography.json` | array | 100 | country, state, ai_patents, first_year, last_year | 1976-2018 |
| `ai_gpt_diffusion.json` | array | 226 | year, section, ai_patents_with_section, total_ai, pct_of_ai | 1990-2025 |
| `ai_gpt_kpi.json` | array | 26 | year, distinct_sections, ai_patents_with_other, hhi | 2000-2025 |
| `ai_org_over_time.json` | array | 441 | year, organization, count | 1976-2025 |
| `ai_quality.json` | array | 50 | year, patent_count, avg_claims, avg_backward_cites, avg_scope, avg_team_size | 1976-2025 |
| `ai_quality_bifurcation.json` | array | 7 | period, patent_count, top_decile_share, median_claims | -- |
| `ai_strategies.json` | array | 190 | organization, subfield, patent_count | -- |
| `ai_team_comparison.json` | array | 72 | year, category, patent_count, avg_team_size, median_team_size | 1990-2025 |
| `ai_top_assignees.json` | array | 50 | organization, ai_patents, first_year, last_year | 1976-2019 |
| `ai_top_inventors.json` | array | 50 | first_name, last_name, ai_patents, first_year, last_year | 1982-2021 |
| `wipo_portfolio_diversity.json` | array | 50 | organization, total_patents, num_wipo_fields, wipo_shannon_entropy | -- |

---

### 4.12 chapter12/ -- Language of Innovation / Topic Modeling (Chapter 5: system-language)

**6 files, 0.63 MB. Used by:** `system-language/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `topic_definitions.json` | array | 25 | id, name, top_words, patent_count | -- |
| `topic_prevalence.json` | array | 1250 | year, topic, topic_name, count, share | 1976-2025 |
| `topic_cpc_matrix.json` | array | 200 | section, section_name, topic, topic_name, count, share | -- |
| `topic_novelty_trend.json` | array | 50 | year, median_entropy, avg_entropy, patent_count | 1976-2025 |
| `topic_novelty_top.json` | array | 50 | patent_id, year, section, topic, topic_name, entropy | 1977-2025 |
| `topic_umap.json` | array | 5000 | patent_id, x, y, topic_name, year, section | 1976-2025 |

**Largest file:** `topic_umap.json` (512 KB, 5,000 sampled patents for scatter plot)

---

### 4.13 chapter13/ -- Examiner-Inventor Overlap (Chapter 13: inv-top-inventors)

**2 files, <0.01 MB. Used by:** `inv-top-inventors/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `examiner_inventor_overlap.json` | array | 1 | unique_examiner_names, unique_inventor_names, name_matches | -- |
| `multi_type_inventors.json` | array | 4 | career_length_bin, total_inventors, multi_type, multi_type_pct | -- |

---

### 4.14 chapter14/ -- Generalist vs. Specialist (Chapter 14: inv-generalist-specialist)

**1 file, <0.01 MB. Used by:** `inv-generalist-specialist/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `npl_by_inventor_type.json` | array | 2 | inventor_type, patent_count, avg_npl, median_npl | -- |

---

### 4.15 chapter16/ -- Gender by Filing Route (Chapter 16: inv-gender)

**1 file, 0.01 MB. Used by:** `inv-gender/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `gender_by_filing_route.json` | array | 100 | year, origin, total_inventors, female_inventors, female_share_pct | 1976-2025 |

---

### 4.16 chapter17/ -- Cross-Institutional Collaboration (Chapter 17: inv-team-size)

**2 files, 0.01 MB. Used by:** `inv-team-size/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `cross_institutional_rate.json` | array | 50 | year, total_patents, cross_institutional, cross_institutional_pct | 1976-2025 |
| `cross_institutional_by_cpc.json` | array | 8 | cpc_section, total, cross_institutional_pct | -- |

---

### 4.17 chapter18/ -- Domestic Geography (Chapter 18: geo-domestic)

**3 files, 0.01 MB. Used by:** `geo-domestic/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `county_concentration_over_time.json` | array | 10 | period, total, top50_sum, top50_share_pct | -- |
| `innovation_clusters.json` | array | 100 | location, country, lat, lng, patent_count | -- |
| `top_counties.json` | array | 50 | county_state, state, patent_count | -- |

---

### 4.18 chapter19/ -- International Geography (Chapter 19: geo-international)

**2 files, 0.09 MB. Used by:** `geo-international/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `pct_share_by_country.json` | array | 360 | country, year, total, pct_count, pct_share | 1990-2025 |
| `priority_country_composition.json` | array | 1361 | year, priority_country, count | 1976-2025 |

---

### 4.19 chapter20/ -- Organizational Mechanics (Chapter 20: mech-organizations)

**1 file, <0.01 MB. Used by:** `mech-organizations/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `citation_category_distribution.json` | array | 5 | citation_category, cnt | -- |

---

### 4.20 chapter21/ -- Inventor Mechanics (Chapter 21: mech-inventors)

**2 files, <0.01 MB. Used by:** `mech-inventors/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `inventor_international_mobility.json` | array | 10 | period_start, total_inventors, mobile_inventors, mobility_rate | -- |
| `inventor_mobility_flows.json` | array | 20 | from_country, to_country, move_count | -- |

---

### 4.21 chapter22/ -- Geographic Mechanics (Chapter 22: mech-geography)

**1 file, <0.01 MB. Used by:** `mech-geography/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `citation_localization.json` | array | 11 | period, total_pairs, same_country, same_country_pct | -- |

---

### 4.22 company/ -- Company Profiles & Firm Analysis (Chapters 9-12, 20: org-company-profiles, org-patent-quality, org-patent-portfolio, mech-organizations, inv-serial-new, inv-generalist-specialist, mech-inventors)

**30 files, 4.46 MB. Used by:** `org-company-profiles/page.tsx`, `org-patent-quality/page.tsx`, `org-patent-portfolio/page.tsx`, `mech-organizations/page.tsx`, `inv-serial-new/page.tsx`, `inv-generalist-specialist/page.tsx`, `mech-inventors/page.tsx`, `org-patent-count/page.tsx`, `system-patent-quality/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `company_profiles.json` | array | 100 | company, raw_name, years | -- |
| `company_name_mapping.json` | object | -- | keyed by raw assignee name -> short name (50 companies) | -- |
| `company_milestones.json` | object | -- | keyed by short company name -> array of {year, label} | -- |
| `strategy_profiles.json` | array | 99 | company, breadth, depth, defensiveness, influence, science_intensity, speed, collaboration, freshness | -- |
| `corporate_speed.json` | array | 3833 | company, year, avg_grant_lag_days, median_grant_lag_days, patent_count | 1976-2025 |
| `citation_half_life.json` | array | 49 | company, half_life_years, total_citations, patent_count | -- |
| `corporate_citation_network.json` | array | 3328 | decade, source, target, citation_count | -- |
| `corporate_mortality.json` | object | -- | decades, survival_rates, continuous_companies, cumulative_survival, summary | -- |
| `design_patents.json` | object | -- | trends (50 items: year, utility_count, design_count, design_share), top_filers | -- |
| `claims_analysis.json` | object | -- | trends (50 items: year, median_claims, p90_claims, avg_claims), by_section, claim_monsters | -- |
| `firm_quality_distribution.json` | object | -- | keyed by 50 company names, each: array of {year, patent_count, p10-p99, mean, dud_rate, blockbuster_rate, gini, system_median} | -- |
| `firm_quality_scatter.json` | array | 50 | company, blockbuster_rate, dud_rate, patent_count, primary_section | -- |
| `firm_quality_gini.json` | object | -- | keyed by company name, each: array of {year, gini} | -- |
| `firm_claims_distribution.json` | object | -- | keyed by 50 company names, each: array of {year, p25-p90, mean, system_median} | -- |
| `firm_exploration_scores.json` | object | -- | keyed by company name, each: array of {year, patent_count, mean_exploration, ..., quality_premium} (13 cols) | -- |
| `firm_exploration_trajectories.json` | object | -- | keyed by company name, each: array of {year, exploration_share} | -- |
| `firm_exploration_lifecycle.json` | object | -- | firms (nested object by company), system_average | -- |
| `firm_exploration_scatter.json` | array | 49 | company, exploration_share, quality_premium, patent_count, primary_section | -- |
| `firm_ambidexterity_quality.json` | array | 314 | company, window, patent_count, ambidexterity_index, exploration_share, exploitation_share, blockbuster_rate, median_fwd_cites | -- |
| `firm_scope_distribution.json` | object | -- | keyed by company name, each: array of {year, p50-p90, mean, system_median} | -- |
| `portfolio_diversification_b3.json` | array | 1974 | company, year, shannon_entropy, num_subclasses | 1976-2025 |
| `portfolio_overlap.json` | array | 248 | company, x, y, industry, decade, top_cpc | -- |
| `pivot_detection.json` | array | 830 | company, window_start, window_end, jsd, is_pivot, top_gaining_cpc, top_losing_cpc | -- |
| `talent_flows.json` | object | -- | nodes (50 items: name, net_flow), links | -- |
| `tech_leadership.json` | array | 400 | window, section, company, citations_received, rank | -- |
| `trajectory_archetypes.json` | object | -- | year_min, year_max, companies (200 items: company, raw_name, archetype, cluster_id, ...), centroids | -- |
| `patent_concentration.json` | array | 400 | year, section, hhi, c4 | 1976-2025 |
| `inventor_careers.json` | object | -- | curves (41 items: career_year, avg/median/p25/p75_patents, inventor_count), durations | -- |
| `inventor_drift.json` | array | 6 | decade, specialist_pct, moderate_pct, generalist_pct, inventor_count | -- |
| `comeback_inventors.json` | array | 11 | gap_years, count, avg_patents_before, avg_patents_after, changed_assignee_pct, changed_cpc_pct | -- |

**Largest file:** `company_profiles.json` (1.21 MB, 100 companies with full year-by-year histories)
**Orphan files:** `company_milestones.json`, `firm_exploration_scatter.json`, `firm_scope_distribution.json`, `patent_concentration.json`, `trajectory_archetypes.json`

---

### 4.23 computed/ -- Pre-computed Quality Metrics (Cross-chapter: used by many chapter pages)

**27 files, 2.52 MB. Used by:** `geo-domestic/page.tsx`, `geo-international/page.tsx`, `inv-gender/page.tsx`, `inv-generalist-specialist/page.tsx`, `inv-serial-new/page.tsx`, `inv-team-size/page.tsx`, `inv-top-inventors/page.tsx`, `system-patent-quality/page.tsx`, `org-patent-quality/page.tsx`, `system-patent-fields/page.tsx`

All `quality_by_*` files share a **common schema** (12 columns):
`year, group, patent_count, avg_num_claims, avg_scope, avg_forward_citations, avg_backward_citations, avg_self_citation_rate, avg_grant_lag_days, avg_originality, avg_generality, sleeping_beauty_rate`

All `inventor_productivity_by_*` files share a **common schema** (4 columns):
`year, group, avg_patents_per_inventor, inventor_count`

| File | Format | Rows | Year Range | Grouping Dimension |
|------|--------|------|------------|-------------------|
| `quality_by_cpc_section.json` | array | 400 | 1976-2025 | CPC section (A-H) |
| `quality_by_company.json` | array | 1921 | 1976-2025 | Top companies |
| `quality_by_city.json` | array | 750 | 1976-2025 | Top cities |
| `quality_by_state.json` | array | 750 | 1976-2025 | Top states |
| `quality_by_country.json` | array | 743 | 1976-2025 | Top countries |
| `quality_by_team_size.json` | array | 200 | 1976-2025 | Team size category |
| `quality_by_gender.json` | array | 150 | 1976-2025 | Gender group |
| `quality_by_inventor_rank.json` | array | 100 | 1976-2025 | Inventor rank tier |
| `quality_by_experience.json` | array | 99 | 1976-2025 | Experience level |
| `quality_by_specialization.json` | array | 100 | 1976-2025 | Specialist/generalist |
| `quality_by_domestic_intl.json` | array | 100 | 1976-2025 | Domestic vs. international |
| `inventor_productivity_by_rank.json` | array | 100 | 1976-2025 | Inventor rank tier |
| `inventor_productivity_by_team_size.json` | array | 200 | 1976-2025 | Team size category |
| `inventor_productivity_by_gender.json` | array | 100 | 1976-2025 | Gender group |
| `inventor_productivity_by_experience.json` | array | 99 | 1976-2025 | Experience level |
| `inventor_productivity_by_specialization.json` | array | 100 | 1976-2025 | Specialist/generalist |
| `cohort_normalized_citations_system.json` | array | 45 | 1976-2020 | System-wide |
| `cohort_normalized_citations_heatmap.json` | array | 315 | 1976-2020 | CPC section x year |
| `cohort_normalized_by_teamsize.json` | array | 180 | 1976-2020 | Team size category |
| `cohort_normalized_by_assignee.json` | array | 3373 | 1976-2020 | Top assignees |
| `cohort_normalized_by_geography.json` | array | 3587 | 1976-2020 | Countries/states |
| `cohort_normalized_by_inventor_group.json` | array | 540 | 1976-2020 | Gender x team size |
| `originality_generality_filtered.json` | array | 150 | 1976-2025 | Citation threshold |
| `sleeping_beauty_halflife.json` | array | 8 | -- | CPC section |
| `top_cities.json` | array | 15 | -- | Simple string list |
| `top_states.json` | array | 15 | -- | Simple string list |
| `top_countries.json` | array | 15 | -- | Simple string list |

**Orphan files:** `cohort_normalized_by_assignee.json`, `cohort_normalized_by_geography.json`, `cohort_normalized_by_inventor_group.json`, `cohort_normalized_by_teamsize.json`, `cohort_normalized_citations_heatmap.json`

---

### 4.24 explore/ -- Interactive Explorer (Explore page)

**4 files, 26.36 MB. Used by:** `explore/page.tsx`

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `cpc_class_summary.json` | array | 146,501 | section, cpc_class, class_name, total_patents | -- |
| `top_assignees_all.json` | array | 500 | organization, total_patents, first_year, last_year | 1976-2021 |
| `top_inventors_all.json` | array | 500 | inventor_id, first_name, last_name, total_patents, first_year, last_year, gender | 1976-2020 |
| `wipo_field_summary.json` | array | 34 | sector, field, field_id, total_patents | -- |

**Largest file:** `cpc_class_summary.json` (27.5 MB, 146,501 CPC classes) -- the single largest data file in the project.

---

### 4.25 act6/ -- Deep Dive Cross-Domain Comparison (Chapter: deep-dive-overview)

**8 files, 0.13 MB. Used by:** `deep-dive-overview/page.tsx`, and all 12 individual domain chapter pages (as filing vs grant overlay)

| File | Format | Rows | Schema | Year Range |
|------|--------|------|--------|------------|
| `act6_comparison.json` | array | 12 | domain, slug, total_patents, recent_5yr, cagr_5yr, share_2024, mean_citations, mean_claims, mean_scope, mean_team_size | -- |
| `act6_timeseries.json` | array | 559 | domain, slug, year, count | 1976-2025 |
| `act6_quality.json` | array | 83 | domain, slug, period, patent_count, mean_citations, mean_claims, mean_scope, mean_team_size | -- |
| `act6_domain_filing_vs_grant.json` | array | 1113 | domain, series, year, count | 1976-2025 |
| `act6_continuation_rates.json` | array | 12 | domain, total_patents, related_filings, continuation_share_pct | -- |
| `act6_spillover.json` | array | 66 | domain_a, domain_b, observed, expected, lift | -- |
| `act6_npl_by_domain.json` | array | 12 | domain, avg_npl_citations, median_npl_citations, patent_count | -- |
| `systems_complexity.json` | array | 21 | domain, period, mean_team_size, mean_claims, patent_count, team_size_index, claims_index | -- |

**Orphan files:** `act6_npl_by_domain.json`, `systems_complexity.json`

---

### 4.26-4.36 Technology Domain Folders (Act 6 Deep Dives)

All 11 technology domain folders share a **standardized schema** with 13 file types (some domains have 1-2 extra domain-specific files). Each is used by its corresponding chapter page, plus the `act6_domain_filing_vs_grant.json` from the act6/ folder.

#### Standard Domain File Templates

| Suffix | Schema | Typical Rows | Year Range |
|--------|--------|-------------|------------|
| `_per_year.json` | year, total_patents, domain_patents, domain_pct | 26-50 | varies |
| `_by_subfield.json` | year, subfield, count | 45-527 | varies |
| `_assignee_type.json` | year, assignee_category, count | 45-144 | varies |
| `_entrant_incumbent.json` | year, entrant_count, incumbent_count | 29-36 | varies |
| `_geography.json` | country, state, domain_patents, first_year, last_year | 76-100 | varies |
| `_org_over_time.json` | year, organization, count | 139-607 | varies |
| `_quality.json` | year, patent_count, avg_claims, avg_backward_cites, avg_scope, avg_team_size | 26-50 | varies |
| `_quality_bifurcation.json` | period, patent_count, top_decile_share, median_claims | 6-7 | -- |
| `_strategies.json` | organization, subfield, patent_count | 34-215 | -- |
| `_team_comparison.json` | year, category, patent_count, avg_team_size, median_team_size | 65-72 | varies |
| `_top_assignees.json` | organization, domain_patents, first_year, last_year | 50 | varies |
| `_top_inventors.json` | first_name, last_name, domain_patents, first_year, last_year | 50 | varies |
| `_diffusion.json` | year, section, domain_patents_with_section, total_domain, pct_of_domain | 29-288 | varies |

#### Domain-Specific Extra Files

| Domain | File | Schema | Rows |
|--------|------|--------|------|
| blockchain | `blockchain_hype_cycle.json` | cohort_year, total_entrants, one_and_done, one_and_done_pct | 15 |
| quantum | `quantum_semiconductor_dependence.json` | cohort, total_assignees, with_semi_experience, pct_with_semi | 5 |
| digihealth | `digihealth_regulatory_split.json` | year, category, patent_count | 71 |
| green | `green_volume.json` | year, green_count, total_patents, green_pct | 50 |
| green | `green_by_category.json` | year, category, count | 500 |
| green | `green_by_country.json` | year, country, count | 334 |
| green | `green_top_companies.json` | organization, total_green, category, category_count | 195 |
| green | `green_ai_heatmap.json` | green_category, ai_subfield, count | 66 |
| green | `green_ai_trend.json` | year, green_ai_count | 37 |
| green | `green_ev_battery_coupling.json` | year, total_green, green_ev, green_battery, green_ev_battery, lift | 26 |

#### Per-Domain Summary

| Domain Folder | Chapter # | Chapter Slug | Files | Size (MB) | Year Start |
|---------------|-----------|-------------|-------|-----------|------------|
| `3dprint/` | 23 | 3d-printing | 13 | 0.11 | 1990 |
| `agtech/` | 24 | agricultural-technology | 13 | 0.11 | 1976 |
| `chapter11/` (ai) | 25 | ai-patents | 15 | 0.14 | 1976 |
| `av/` | 26 | autonomous-vehicles | 13 | 0.10 | 1990 |
| `biotech/` | 27 | biotechnology | 13 | 0.14 | 1976 |
| `blockchain/` | 28 | blockchain | 14 | 0.05 | 2000 |
| `cyber/` | 29 | cybersecurity | 13 | 0.11 | 1976 |
| `digihealth/` | 30 | digital-health | 14 | 0.15 | 1976 |
| `green/` | 31 | green-innovation | 20 | 0.23 | 1976 |
| `quantum/` | 32 | quantum-computing | 14 | 0.07 | 1995 |
| `semiconductors/` | 33 | semiconductors | 13 | 0.14 | 1976 |
| `space/` | 34 | space-technology | 13 | 0.12 | 1976 |

**Green domain orphan files:** `green_by_subfield.json`, `green_geography.json`, `green_per_year.json` (green uses `green_volume.json` and `green_by_category.json` instead of the standard `_per_year` / `_by_subfield` naming)

---

## 5. Chapter-to-Data-File Mapping

### Act 1: The System (Chapters 1-7)

| Chapter | Slug | Data Files Used | Folders |
|---------|------|-----------------|---------|
| 1 | system-patent-count | 6 files | chapter1 |
| 2 | system-patent-quality | 15 files | chapter1, chapter2, chapter6, chapter9, computed, company |
| 3 | system-patent-fields | 13 files | chapter2, chapter7, chapter9, chapter10, chapter6, computed |
| 4 | system-convergence | 7 files | chapter4, chapter7, chapter10 |
| 5 | system-language | 6 files | chapter12 |
| 6 | system-patent-law | 7 files | chapter6, chapter10 |
| 7 | system-public-investment | 6 files | chapter1, chapter6, chapter7 |

### Act 2: The Organizations (Chapters 8-12)

| Chapter | Slug | Data Files Used | Folders |
|---------|------|-----------------|---------|
| 8 | org-composition | 7 files | chapter3, chapter8 |
| 9 | org-patent-count | 6 files | chapter2, chapter3, chapter9, company |
| 10 | org-patent-quality | 8 files | chapter3, chapter9, chapter10, company, computed |
| 11 | org-patent-portfolio | 5 files | chapter7, chapter11, company |
| 12 | org-company-profiles | 7 files | chapter3, company |

### Act 3: The Inventors (Chapters 13-17)

| Chapter | Slug | Data Files Used | Folders |
|---------|------|-----------------|---------|
| 13 | inv-top-inventors | 7 files | chapter5, chapter13, computed |
| 14 | inv-generalist-specialist | 4 files | chapter14, company, computed |
| 15 | inv-serial-new | 7 files | chapter5, company, computed |
| 16 | inv-gender | 8 files | chapter5, chapter16, computed |
| 17 | inv-team-size | 8 files | chapter3, chapter5, chapter17, computed |

### Act 4: The Geography (Chapters 18-19)

| Chapter | Slug | Data Files Used | Folders |
|---------|------|-----------------|---------|
| 18 | geo-domestic | 12 files | chapter4, chapter18, computed |
| 19 | geo-international | 7 files | chapter4, chapter9, chapter19, computed |

### Act 5: The Mechanics (Chapters 20-22)

| Chapter | Slug | Data Files Used | Folders |
|---------|------|-----------------|---------|
| 20 | mech-organizations | 9 files | chapter3, chapter5, chapter20, company |
| 21 | mech-inventors | 11 files | chapter3, chapter4, chapter5, chapter21, company |
| 22 | mech-geography | 4 files | chapter4, chapter6, chapter7, chapter22 |

### Act 6: Deep Dives (Chapters 23-34)

| Chapter | Slug | Data Files Used | Folders |
|---------|------|-----------------|---------|
| -- | deep-dive-overview | 6 files | act6 |
| 23 | 3d-printing | 14 files | 3dprint, act6 |
| 24 | agricultural-technology | 14 files | agtech, act6 |
| 25 | ai-patents | 15 files | chapter11, act6 |
| 26 | autonomous-vehicles | 14 files | av, act6 |
| 27 | biotechnology | 14 files | biotech, act6 |
| 28 | blockchain | 15 files | blockchain, act6 |
| 29 | cybersecurity | 14 files | cyber, act6 |
| 30 | digital-health | 15 files | digihealth, act6 |
| 31 | green-innovation | 18 files | green, act6 |
| 32 | quantum-computing | 15 files | quantum, act6 |
| 33 | semiconductors | 14 files | semiconductors, act6 |
| 34 | space-technology | 14 files | space, act6 |

### Other Pages

| Page | Data Files Used | Folders |
|------|-----------------|---------|
| HomeContent | 1 file | chapter1 |
| explore | 4 files | explore |

---

## 6. Orphan File Inventory

31 data files exist on disk but are not referenced by any `useChapterData` call in any `.tsx` or `.ts` file. These may be:
- Reserved for future chapters
- Previously used and now superseded
- Intermediate computations retained for reference

| Folder | File | Rows | Possible Reason |
|--------|------|------|-----------------|
| act6 | `act6_npl_by_domain.json` | 12 | Unused cross-domain metric |
| act6 | `systems_complexity.json` | 21 | Unused cross-domain metric |
| chapter1 | `patents_per_month.json` | 597 | Monthly granularity not used (yearly suffices) |
| chapter2 | `cpc_class_change.json` | 30 | Fastest/slowest CPC classes, not visualized |
| chapter2 | `wipo_fields_per_year.json` | 1700 | WIPO field detail not visualized |
| chapter2 | `wipo_sectors_per_year.json` | 250 | Duplicated in chapter3/wipo_sector_shares |
| chapter3 | `portfolio_diversity.json` | 252 | Superseded by company/portfolio_diversification_b3 |
| chapter4 | `innovation_diffusion.json` | 24,533 | Large geo diffusion dataset (3.9 MB); summary version used instead |
| chapter5 | `inventor_mobility.json` | 2 | Summary stat, not charted |
| chapter5 | `inventor_mobility_by_decade.json` | 5 | Summary stat, not charted |
| chapter5 | `inventor_segments_trend.json` | 45 | Trend data not charted |
| chapter6 | `alice_art_group_grants.json` | 34 | Indexed version used instead |
| chapter6 | `citation_categories.json` | 69 | Not visualized |
| chapter6 | `citation_lag.json` | 50 | citation_lag_trend used instead |
| chapter7 | `grant_lag_by_sector.json` | 55 | friction_map used instead |
| chapter8 | `filing_route_by_country.json` | 110 | Country-level route not visualized |
| chapter9 | `breakthrough_patents.json` | 45 | Not visualized |
| chapter9 | `composite_quality_index.json` | 360 | Not visualized |
| company | `company_milestones.json` | ~75 | Not used in current profiles |
| company | `firm_exploration_scatter.json` | 49 | Not visualized |
| company | `firm_scope_distribution.json` | -- | Not visualized |
| company | `patent_concentration.json` | 400 | Not visualized |
| company | `trajectory_archetypes.json` | 200 | Not visualized |
| computed | `cohort_normalized_by_assignee.json` | 3,373 | Available but not loaded |
| computed | `cohort_normalized_by_geography.json` | 3,587 | Available but not loaded |
| computed | `cohort_normalized_by_inventor_group.json` | 540 | Available but not loaded |
| computed | `cohort_normalized_by_teamsize.json` | 180 | Available but not loaded |
| computed | `cohort_normalized_citations_heatmap.json` | 315 | Available but not loaded |
| green | `green_by_subfield.json` | 500 | Replaced by green_by_category |
| green | `green_geography.json` | 100 | Not used (green_by_country used instead) |
| green | `green_per_year.json` | 50 | Replaced by green_volume |

---

## 7. Data Loading Architecture

**Hook:** `src/hooks/useChapterData.ts`
- Client-side fetch from `${NEXT_PUBLIC_BASE_PATH}/data/${path}`
- In-memory `Map` cache (deduplicates fetches within a session)
- Unwraps `json.data ?? json` for backward compatibility
- All data is loaded as JSON on the client via `fetch()`

**Cohort Normalization Hook:** `src/hooks/useCohortNormalization.tsx`
- Wraps two `useChapterData` calls: one for raw data, one for normalized data
- Used for quality metric breakdowns that need cohort-normalized citations

**Geo Data:** Loaded directly in chart components (`PWChoroplethMap`, `PWWorldFlowMap`) via `fetch()`, not through `useChapterData`.

---

## 8. Size Distribution

| Size Category | Count | Total Size |
|---------------|-------|-----------|
| < 1 KB | 14 files | 6 KB |
| 1 KB - 10 KB | 205 files | 928 KB |
| 10 KB - 100 KB | 131 files | 4.3 MB |
| 100 KB - 1 MB | 25 files | 9.1 MB |
| 1 MB - 10 MB | 7 files | 11.8 MB |
| > 10 MB | 1 file | 27.5 MB |

**Top 5 largest files:**
1. `explore/cpc_class_summary.json` -- 27.5 MB (146,501 rows)
2. `chapter4/innovation_diffusion.json` -- 3.91 MB (24,533 rows, ORPHAN)
3. `company/company_profiles.json` -- 1.21 MB (100 companies)
4. `company/firm_quality_distribution.json` -- 0.81 MB (50 companies x years)
5. `chapter4/regional_specialization.json` -- 0.69 MB (5,735 rows)
