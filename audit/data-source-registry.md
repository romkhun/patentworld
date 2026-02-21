# PatentWorld Data Source Registry

> Generated: 2026-02-20
> Project: `/home/saerom/projects/patentworld`

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total JSON data files | 383 |
| Total data size | 42.5 MB |
| Data directories | 36 |
| Chapter pages (page.tsx) | 34 + explore + home |
| Pipeline scripts (numbered) | 75 (01 through 75) |
| Batch/phase scripts | 6 (phase1_8_39, phase2, phase3, phase5, phase6_9, phase7) |
| Utility scripts | 2 (config.py, domain_utils.py) |
| Computed quality metrics | 27 files |
| Raw PatentsView tables used | 12 tables |
| Raw PatentsView files available | 39 zip files |
| Hardcoded data locations | 3 (constants.ts, referenceEvents.ts, system-patent-law/page.tsx) |

---

## 1. Raw PatentsView Data Sources

**Location:** `/media/saerom/saerom-ssd/Penn Dropbox/Saerom (Ronnie) Lee/Research/PatentsView/`

All raw data is distributed as `*.tsv.zip` files. The pipeline extracts them to `/tmp/patentview/` on first use via DuckDB's `read_csv_auto`.

### Tables Used by the Pipeline

| Table | Config Function | Description | Est. Rows |
|-------|----------------|-------------|-----------|
| g_patent | `PATENT_TSV()` | Core patent table (all types) | 9.36M |
| g_application | `APPLICATION_TSV()` | Application filing data | ~9M |
| g_cpc_current | `CPC_CURRENT_TSV()` | Current CPC classifications | 58M |
| g_cpc_title | `CPC_TITLE_TSV()` | CPC code descriptions | ~260K |
| g_wipo_technology | `WIPO_TSV()` | WIPO technology field mapping | ~9M |
| g_assignee_disambiguated | `ASSIGNEE_TSV()` | Disambiguated assignees | 8.7M |
| g_inventor_disambiguated | `INVENTOR_TSV()` | Disambiguated inventors | 24M |
| g_location_disambiguated | `LOCATION_TSV()` | Geocoded locations | ~120K |
| g_us_patent_citation | `CITATION_TSV()` | US patent citations | 151M |
| g_foreign_citation | `FOREIGN_CITATION_TSV()` | Foreign citations | ~29M |
| g_gov_interest | `GOV_INTEREST_TSV()` | Government interest statements | ~230K |
| g_gov_interest_org | `GOV_INTEREST_ORG_TSV()` | Government agency details | ~360K |

### Additional Tables Used by Phase Scripts

| Table | Used In | Purpose |
|-------|---------|---------|
| g_patent_abstract | phase scripts, 28_chapter12 | Topic modeling on 8.4M abstracts |
| g_figures | phase1_8_39 | Figures per patent analysis |
| g_pct_data | phase6_9 | PCT filing route analysis |
| g_foreign_priority | phase6_9 | Priority country composition |
| g_rel_app_text | 01_chapter1 | Continuation chain analysis |
| g_attorney_disambiguated | phase7 | Law firm concentration |
| g_examiner_not_disambiguated | phase7 | Examiner-inventor overlap |
| g_gov_interest_contracts | phase scripts | Government contract numbers |

### Intermediate Artifact

| File | Script | Description |
|------|--------|-------------|
| `/tmp/patentview/patent_master.parquet` | 58_build_patent_master.py | Wide patent-level fact table (~9.3M rows x 20 cols) used by scripts 59-75 |

---

## 2. JSON Data Files by Directory

### Files Per Directory

| Directory | Files | Size (KB) | Primary Chapter(s) |
|-----------|-------|-----------|-------------------|
| 3dprint | 13 | 117 | Ch 23: 3D Printing |
| act6 | 8 | 132 | Deep Dive Overview |
| agtech | 13 | 113 | Ch 24: Agricultural Technology |
| av | 13 | 98 | Ch 26: Autonomous Vehicles |
| biotech | 13 | 139 | Ch 27: Biotechnology |
| blockchain | 14 | 56 | Ch 28: Blockchain |
| chapter1 | 11 | 72 | Ch 1: Patent Count + Ch 7: Public Investment |
| chapter2 | 15 | 331 | Ch 2: Patent Quality + Ch 3: Patent Fields |
| chapter3 | 17 | 981 | Ch 3: Patent Fields + Ch 8-11 (org chapters) |
| chapter4 | 12 | 4,876 | Ch 4: Convergence + Ch 18-19 (geo) + Ch 21-22 (mech) |
| chapter5 | 22 | 256 | Ch 13-17 (inventor chapters) + Ch 20-21 (mech) |
| chapter6 | 16 | 73 | Ch 6: Patent Law + Ch 2: Quality + Ch 22: Mech Geography |
| chapter7 | 7 | 72 | Ch 3: Patent Fields + Ch 4: Convergence + Ch 22: Mech Geography |
| chapter8 | 4 | 27 | Ch 8: Assignee Composition |
| chapter9 | 11 | 119 | Ch 2: Quality + Ch 9: Org Patent Count + Ch 10: Org Quality |
| chapter10 | 10 | 97 | Ch 4: Convergence + Ch 10: Org Quality |
| chapter11 | 15 | 144 | Ch 25: AI Patents |
| chapter12 | 6 | 646 | Ch 5: Language of Innovation |
| chapter13 | 2 | 0.5 | Ch 13: Top Inventors |
| chapter14 | 1 | 0.2 | Ch 14: Generalist vs Specialist |
| chapter16 | 1 | 11 | Ch 16: Gender and Patenting |
| chapter17 | 2 | 5 | Ch 17: Team Size |
| chapter18 | 3 | 13 | Ch 18: Domestic Geography |
| chapter19 | 2 | 94 | Ch 19: International Geography |
| chapter20 | 1 | 0.3 | Ch 20: Organizational Mechanics |
| chapter21 | 2 | 2 | Ch 21: Inventor Mechanics |
| chapter22 | 1 | 1 | Ch 22: Geographic Mechanics |
| company | 30 | 4,570 | Ch 9-12 (org chapters) + Ch 14-15 (inventor) + Ch 20-21 (mech) |
| computed | 27 | 2,578 | Cross-chapter quality metrics |
| cyber | 13 | 116 | Ch 29: Cybersecurity |
| digihealth | 14 | 151 | Ch 30: Digital Health |
| explore | 4 | 26,991 | Explore page |
| green | 20 | 238 | Ch 31: Green Innovation |
| quantum | 14 | 70 | Ch 32: Quantum Computing |
| semiconductors | 13 | 148 | Ch 33: Semiconductors |
| space | 13 | 127 | Ch 34: Space Technology |

---

## 3. Complete Data File Catalog

### 3.1 Domain Deep-Dive Files (Act 6)

Each of the 12 deep-dive technology domains follows a standardized template of 11-13 files generated by `domain_utils.run_domain_pipeline()` plus domain-specific enrichments. Domains: 3dprint, agtech, av, biotech, blockchain, cyber, digihealth, green, quantum, semiconductors, space, AI (chapter11).

**Standard template per domain (11 files):**

| Suffix | Format | Schema | Typical Rows | Time Range |
|--------|--------|--------|-------------|------------|
| `_per_year.json` | array | year, total_patents, domain_patents, domain_pct | 26-50 | 1976/1990-2025 |
| `_by_subfield.json` | array | year, subfield, count | 45-527 | varies-2025 |
| `_top_assignees.json` | array | organization, domain_patents, first_year, last_year | 50 | - |
| `_top_inventors.json` | array | first_name, last_name, domain_patents, first_year, last_year | 50 | - |
| `_geography.json` | array | country, state, domain_patents, first_year, last_year | 76-100 | - |
| `_quality.json` | array | year, patent_count, avg_claims, avg_backward_cites, avg_scope, avg_team_size | 26-50 | varies-2025 |
| `_org_over_time.json` | array | year, organization, count | 139-607 | varies-2025 |
| `_strategies.json` | array | organization, subfield, patent_count | 34-215 | - |
| `_diffusion.json` | array | year, section, domain_patents_with_section, total_domain, pct_of_domain | 29-288 | 1990-2025 |
| `_team_comparison.json` | array | year, category, patent_count, avg_team_size, median_team_size | 65-72 | 1990-2025 |
| `_assignee_type.json` | array | year, assignee_category, count | 45-144 | 1990-2025 |

**Additional per domain (from scripts 73, 74):**

| Suffix | Schema | Typical Rows |
|--------|--------|-------------|
| `_entrant_incumbent.json` | year, entrant_count, incumbent_count | 29-36 |
| `_quality_bifurcation.json` | period, patent_count, top_decile_share, median_claims | 6-7 |

**Domain-specific enrichments:**

| File | Domain | Schema | Rows |
|------|--------|--------|------|
| `blockchain/blockchain_hype_cycle.json` | Blockchain | cohort_year, total_entrants, one_and_done, one_and_done_pct | 15 |
| `chapter11/ai_gpt_kpi.json` | AI | year, distinct_sections, ai_patents_with_other, hhi | 26 |
| `chapter11/ai_gpt_diffusion.json` | AI | year, section, ai_patents_with_section, total_ai, pct_of_ai | 226 |
| `chapter11/wipo_portfolio_diversity.json` | AI | organization, total_patents, num_wipo_fields, wipo_shannon_entropy | 50 |
| `green/green_volume.json` | Green | year, green_count, total_patents, green_pct | 50 |
| `green/green_by_category.json` | Green | year, category, count | 500 |
| `green/green_by_country.json` | Green | year, country, count | 334 |
| `green/green_top_companies.json` | Green | organization, total_green, category, category_count | 195 |
| `green/green_ai_trend.json` | Green | year, green_ai_count | 37 |
| `green/green_ai_heatmap.json` | Green | green_category, ai_subfield, count | 66 |
| `green/green_ev_battery_coupling.json` | Green | year, total_green, green_ev, green_battery, green_ev_battery, lift | 26 |
| `digihealth/digihealth_regulatory_split.json` | Digital Health | year, category, patent_count | 71 |
| `quantum/quantum_semiconductor_dependence.json` | Quantum | cohort, total_assignees, with_semi_experience, pct_with_semi | 5 |

### 3.2 Act 6 Cross-Domain Overview

| File | Format | Schema | Rows | Source Script |
|------|--------|--------|------|---------------|
| `act6/act6_comparison.json` | array | domain, slug, total_patents, recent_5yr, cagr_5yr, share_2024, mean_citations, mean_claims | 12 | 72 |
| `act6/act6_timeseries.json` | array | domain, slug, year, count | 559 | 72 |
| `act6/act6_quality.json` | array | domain, slug, period, patent_count, mean_citations, mean_claims, mean_scope, mean_team_size | 83 | 72 |
| `act6/act6_spillover.json` | array | domain_a, domain_b, observed, expected, lift | 66 | 72 |
| `act6/act6_continuation_rates.json` | array | domain, total_patents, related_filings, continuation_share_pct | 12 | phase2 |
| `act6/act6_domain_filing_vs_grant.json` | array | domain, series, year, count | 1,113 | phase1_8_39 |
| `act6/act6_npl_by_domain.json` | array | domain, avg_npl_citations, median_npl_citations, patent_count | 12 | phase3 |
| `act6/systems_complexity.json` | array | domain, period, mean_team_size, mean_claims, patent_count, team_size_index, claims_index | 21 | 75 |

### 3.3 Chapter 1: Patent Count (system-patent-count)

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter1/patents_per_year.json` | array | year, patent_type, count | 247 | 1976-2025 | 01 |
| `chapter1/patents_per_month.json` | array | month, count | 597 | - | 01 |
| `chapter1/claims_per_year.json` | array | year, avg_claims, median_claims, count | 50 | 1976-2025 | 01 |
| `chapter1/grant_lag.json` | array | year, avg_lag_days, median_lag_days, count | 50 | 1976-2025 | 01 |
| `chapter1/hero_stats.json` | object | total_patents, first_year, last_year, peak_year, peak_year_count | 5 keys | - | 01 |
| `chapter1/filing_vs_grant_year.json` | array | series, year, count | 99 | 1976-2025 | phase1_8_39 |
| `chapter1/pendency_by_filing_year.json` | array | year, avg_pendency_years, median_pendency_years, patent_count | 47 | 1976-2022 | phase1_8_39 |
| `chapter1/continuation_chains.json` | array | year, total_patents, originals, continuations, divisions, cips, related_filings, related_share_pct | 50 | 1976-2025 | phase1_8_39 |
| `chapter1/gov_agency_field_matrix.json` | array | agency, section, patent_count, mean_norm_citations, mean_generality | 103 | - | 66 |
| `chapter1/gov_agency_breadth_depth.json` | array | agency, total_patents, n_sections, breadth, depth | 23 | - | 66 |
| `chapter1/gov_impact_comparison.json` | array | funding_status, patent_count, mean_raw_citations, mean_normalized, top_decile_share, top_1pct_share | 2 | - | 69 |

### 3.4 Chapter 2: Patent Quality (system-patent-quality) + Patent Fields (system-patent-fields)

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter2/cpc_sections_per_year.json` | array | year, section, count | 400 | 1976-2025 | 02 |
| `chapter2/wipo_sectors_per_year.json` | array | year, sector, count | 250 | 1976-2025 | 02 |
| `chapter2/wipo_fields_per_year.json` | array | year, sector, field, count | 1,700 | 1976-2025 | 02 |
| `chapter2/cpc_class_change.json` | array | cpc_class, early_count, late_count, pct_change, class_name, direction | 30 | - | 02 |
| `chapter2/tech_diversity.json` | array | year, diversity_index, hhi | 50 | 1976-2025 | 02 |
| `chapter2/cpc_treemap.json` | array | section, cpc_class, class_name, patent_count | 548 | - | 02 |
| `chapter2/technology_halflife.json` | array | section, half_life_years, total_citations | 8 | - | 24 |
| `chapter2/technology_decay_curves.json` | array | section, years_after, citations, pct_of_total | 248 | - | 24 |
| `chapter2/technology_scurves.json` | array | section, section_name, K, r, t0, lifecycle_stage, current_pct_of_K, current_growth_rate | 8 | - | 30 |
| `chapter2/figures_per_patent.json` | array | year, avg_figures, avg_sheets, median_figures, patent_count | 50 | 1976-2025 | phase1_8_39 |
| `chapter2/figures_by_cpc_section.json` | array | cpc_section, avg_figures, avg_sheets, patent_count | 8 | - | phase1_8_39 |
| `chapter2/npl_citations_per_year.json` | array | year, avg_npl_citations, median_npl_citations, total_patents, patents_with_npl | 50 | 1976-2025 | phase1_8_39 |
| `chapter2/npl_citations_by_cpc.json` | array | cpc_section, avg_npl_citations, patent_count | 8 | - | phase1_8_39 |
| `chapter2/foreign_citation_share.json` | array | year, total_patents, avg_foreign_citations, avg_us_citations, avg_foreign_share_pct | 50 | 1976-2025 | phase1_8_39 |
| `chapter2/blockbuster_lorenz.json` | array | decade, n_firms, total_patents, total_blockbusters, gini, lorenz | 4 | - | 65 |

### 3.5 Chapter 3: Assignees + Firm Deep (system-patent-fields, org chapters)

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter3/assignee_types_per_year.json` | array | year, category, count | 200 | 1976-2025 | 03 |
| `chapter3/top_assignees.json` | array | organization, total_patents, first_year, last_year | 50 | - | 03 |
| `chapter3/top_orgs_over_time.json` | array | year, organization, count, rank | 835 | 1980-2025 | 03 |
| `chapter3/domestic_vs_foreign.json` | array | year, origin, count | 150 | 1976-2025 | 03 |
| `chapter3/concentration.json` | array | period_start, period, top10_share, top50_share, top100_share, total_patents | 10 | 1976-2021 | 03 |
| `chapter3/firm_collaboration_network.json` | object | nodes, edges | ~1,147 entries | - | 09 |
| `chapter3/firm_citation_impact.json` | array | organization, total_patents, avg_citations_received, median, p90 | 30 | - | 09 |
| `chapter3/firm_tech_evolution.json` | array | organization, period, section, count | 5,546 | 1976-2021 | 09 |
| `chapter3/portfolio_diversity.json` | array | organization, period_start, period, num_subclasses, shannon_entropy, active_subclasses | 252 | 1975-2025 | 15 |
| `chapter3/non_us_by_section.json` | array | year, section, country, count | 2,685 | 1976-2025 | 30 |
| `chapter3/network_metrics_by_decade.json` | array | decade, decade_label, num_nodes, num_edges, num_patents, avg_degree, avg_team_size | 5 | - | 27 |
| `chapter3/bridge_inventors.json` | array | inventor_id, first_name, last_name, num_orgs, total_patents | 30 | - | 27 |
| `chapter3/team_size_coefficients.json` | object | main_coefficients, interaction, by_decade, metadata | 16 keys | - | 64 |
| `chapter3/cpc_reclassification_by_decade.json` | array | decade, total_patents, reclassified, reclass_rate_pct | 2 | - | phase5 |
| `chapter3/cpc_reclassification_flows.json` | array | from_section, to_section, count | 56 | - | phase5 |
| `chapter3/wipo_sector_shares.json` | array | year, sector, patent_count | 250 | 1976-2025 | phase5 |
| `chapter3/wipo_field_growth.json` | array | field, count_early, count_late, growth_pct, total | 35 | - | phase5 |

### 3.6 Chapter 4: Geography

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter4/us_states_per_year.json` | array | year, state, count | 2,692 | 1976-2025 | 04 |
| `chapter4/us_states_summary.json` | array | state, total_patents, unique_inventors | 57 | - | 04 |
| `chapter4/countries_per_year.json` | array | year, country, count | 5,304 | 1976-2025 | 04 |
| `chapter4/top_cities.json` | array | city, state, total_patents, lat, lng | 50 | - | 04 |
| `chapter4/state_specialization.json` | array | state, section, count | 441 | - | 04 |
| `chapter4/regional_specialization.json` | array | city, state, total_patents, section, metro_section_count, location_quotient | 5,735 | - | 21 |
| `chapter4/innovation_diffusion.json` | array | tech_area, period_start, period, city, state, country, lat, lng | 24,533 | 1975-2025 | 26 |
| `chapter4/innovation_diffusion_summary.json` | array | tech_area, periods | 3 | - | 26 |
| `chapter4/inventor_mobility_trend.json` | array | year, total_patents_with_prev, intl_moves, domestic_moves, intl_mobility_pct, domestic_mobility_pct | 46 | 1980-2025 | 13 |
| `chapter4/inventor_state_flows.json` | array | from_state, to_state, flow_count | 200 | - | 13 |
| `chapter4/inventor_country_flows.json` | array | from_country, to_country, flow_count | 200 | - | 13 |
| `chapter4/ipc_vs_cpc_convergence.json` | array | year, total_patents, ipc_multi_section_pct, cpc_multi_section_pct | 50 | 1976-2025 | 30 |

### 3.7 Chapter 5: Inventors

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter5/team_size_per_year.json` | array | year, avg_team_size, median_team_size, solo_pct, large_team_pct, total_patents | 50 | 1976-2025 | 05 |
| `chapter5/gender_per_year.json` | array | year, gender, count | 100 | 1976-2025 | 05 |
| `chapter5/gender_by_sector.json` | array | sector, gender, count | 10 | - | 05 |
| `chapter5/prolific_inventors.json` | array | inventor_id, first_name, last_name, total_patents, first_year, last_year, gender | 100 | - | 05 |
| `chapter5/inventor_entry.json` | array | year, new_inventors | 50 | 1976-2025 | 05 |
| `chapter5/inventor_collaboration_network.json` | object | nodes, edges | ~1,868 entries | - | 10 |
| `chapter5/inventor_longevity.json` | array | cohort, career_length, survival_pct | 256 | - | 10 |
| `chapter5/star_inventor_impact.json` | array | inventor_id, first_name, last_name, total_patents, avg_citations, median_citations, max_citations | 200 | - | 10 |
| `chapter5/superstar_concentration.json` | array | year, total_patents, top1pct_patents, top5pct_patents, top1pct_share, top5pct_share, remaining_share | 50 | 1976-2025 | 16 |
| `chapter5/solo_inventors.json` | array | year, total_patents, solo_patents, solo_pct | 50 | 1976-2025 | 16 |
| `chapter5/solo_inventors_by_section.json` | array | section, solo_count, team_count, solo_pct | 8 | - | 16 |
| `chapter5/first_time_inventors.json` | array | year, total_patents, patents_with_debut, debut_pct | 50 | 1976-2025 | 16 |
| `chapter5/gender_by_tech.json` | array | section, gender, count | 16 | - | 25 |
| `chapter5/gender_team_quality.json` | array | team_gender, patent_count, avg_citations, median_citations | 3 | - | 25 |
| `chapter5/gender_section_trend.json` | array | period_start, period, section, total_inventors, female_inventors, female_pct | 88 | 1975-2025 | 25 |
| `chapter5/inventor_mobility.json` | array | mobility, patent_count, avg_citations, median_citations | 2 | - | 20 |
| `chapter5/inventor_mobility_by_decade.json` | array | decade, decade_label, total_inventors, mobile_inventors, mobility_rate | 5 | - | 20 |
| `chapter5/inventor_mobility_event_study.json` | object | overall, by_direction, summary | ~44 entries | - | 63 |
| `chapter5/exploration_exploitation_trajectory.json` | object | {firm_name: [...]} | ~98 entries | - | 62 |
| `chapter5/inventor_segments.json` | array | segment, inventor_count, total_patents, avg_patents, patent_share, inventor_share | 5 | - | 30 |
| `chapter5/inventor_segments_trend.json` | array | year, total_inventors, one_hit_count, one_hit_pct | 45 | 1976-2020 | 30 |
| `chapter5/bridge_centrality.json` | array | centrality_quintile, centrality_label, n_inventors, mean_degree, mean_citations, mean_patent_count | 5 | - | 71 |

### 3.8 Chapter 6: Citations / Law / Co-invention

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter6/citations_per_year.json` | array | year, avg_citations, median_citations, total_patents | 50 | 1976-2025 | 06 |
| `chapter6/citation_categories.json` | array | year, category, count | 69 | 2002-2025 | 06 |
| `chapter6/citation_lag.json` | array | year, avg_lag_days, median_lag_days, total_citations | 50 | 1976-2025 | 06 |
| `chapter6/gov_funded_per_year.json` | array | year, count | 50 | 1976-2025 | 06 |
| `chapter6/gov_agencies.json` | array | agency, total_patents | 20 | - | 06 |
| `chapter6/citation_lag_by_section.json` | array | section, decade, decade_label, citation_count, avg_lag_days, median_lag_days, avg_lag_years, median_lag_years | 40 | - | 17 |
| `chapter6/citation_lag_trend.json` | array | year, citation_count, avg_lag_years, median_lag_years | 46 | 1980-2025 | 17 |
| `chapter6/co_invention_rates.json` | array | year, partner, co_count, us_patents, co_invention_rate | 293 | 1976-2025 | 30 |
| `chapter6/co_invention_us_china_by_section.json` | array | year, section, us_cn_count | 130 | 2000-2025 | 30 |
| `chapter6/alice_art_group_grants.json` | array | year, group_type, grant_count | 34 | 2008-2024 | phase7 |
| `chapter6/alice_art_group_indexed.json` | array | year, group_type, grant_count, indexed | 34 | 2008-2024 | phase7 |
| `chapter6/alice_art_group_pendency.json` | array | year, group_type, avg_pendency_days, median_pendency_days | 34 | 2008-2024 | phase7 |
| `chapter6/terminal_disclaimer_rate.json` | array | year, total_patents, with_terminal_disclaimer, td_rate_pct | 50 | 1976-2025 | phase2 |
| `chapter6/terminal_disclaimer_by_cpc.json` | array | cpc_section, total_patents, with_td, td_rate_pct | 8 | - | phase2 |
| `chapter6/patent_term_adjustment.json` | array | year, avg_pta_days, median_pta_days, patent_count | 24 | 2002-2025 | phase2 |
| `chapter6/pta_by_cpc_section.json` | array | cpc_section, avg_pta_days, median_pta_days, patent_count | 8 | - | phase2 |

### 3.9 Chapter 7: Innovation Dynamics

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter7/grant_lag_by_sector.json` | array | period, sector, avg_lag_days, median_lag_days, count | 55 | 1975-2025 | 08 |
| `chapter7/cross_domain.json` | array | year, total, single_section, two_sections, three_plus_sections, multi_section_pct | 50 | 1976-2025 | 08 |
| `chapter7/intl_collaboration.json` | array | year, total_patents, intl_collab_count, intl_collab_pct | 50 | 1976-2025 | 08 |
| `chapter7/corp_diversification.json` | array | organization, section, era, count | 158 | - | 08 |
| `chapter7/innovation_velocity.json` | array | year, sector, count, prev_count, yoy_growth_pct | 250 | 1976-2025 | 08 |
| `chapter7/friction_map.json` | array | section, period_start, period, patent_count, avg_lag_days, median_lag_days, avg_lag_years, median_lag_years | 88 | 1975-2025 | 19 |
| `chapter7/top_government_contracts.json` | array | contract_award_number, agency, patent_count | 50 | - | phase scripts |

### 3.10 Chapter 8: Filing Routes / Law Firms

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter8/filing_route_over_time.json` | array | year, total, pct_route, direct_foreign, domestic, pct_share_pct, direct_foreign_share_pct, domestic_share_pct | 50 | 1976-2025 | phase6_9 |
| `chapter8/filing_route_by_country.json` | array | country, period, total, pct_share, direct_foreign_share, domestic_share | 110 | 1975-2025 | phase6_9 |
| `chapter8/law_firm_concentration.json` | array | year, total_with_firm, cr4_pct, cr10_pct | 50 | 1976-2025 | phase7 |
| `chapter8/top_law_firms.json` | array | firm, total_patents, first_year, last_year | 20 | - | phase7 |

### 3.11 Chapter 9: Patent Quality

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter9/quality_trends.json` | array | year, avg_claims, median_claims, avg_backward_cites, median_backward_cites, avg_forward_cites_5yr, median_forward_cites_5yr, avg_scope | 50 | 1976-2025 | 11 |
| `chapter9/self_citation_rate.json` | array | year, avg_self_cite_rate, median_self_cite_rate | 50 | 1976-2025 | 11 |
| `chapter9/quality_by_sector.json` | array | period, sector, avg_forward_cites, avg_claims, avg_scope | 50 | 1976-2021 | 11 |
| `chapter9/breakthrough_patents.json` | array | year, total_patents, breakthrough_count, breakthrough_pct | 45 | 1976-2020 | 11 |
| `chapter9/composite_quality_index.json` | array | year, section, patent_count, avg_z_cites, avg_z_claims, avg_z_scope, avg_z_lag, composite_index | 360 | 1976-2020 | 18 |
| `chapter9/sleeping_beauties.json` | array | patent_id, grant_year, section, cpc_subclass, early_cites, avg_early_rate, burst_citations, burst_year_after_grant | 50 | 1985-2001 | 22 |
| `chapter9/originality_generality.json` | array | year, avg_originality, median_originality, avg_generality, median_generality | 50 | 1976-2025 | 11 |
| `chapter9/continuation_share_by_firm.json` | array | organization, total_patents, related_filings, continuation_share_pct | 50 | - | phase scripts |
| `chapter9/self_citation_by_assignee.json` | array | organization, total_citations, self_citations, self_cite_rate | 20 | - | 30 |
| `chapter9/self_citation_by_section.json` | array | decade, section, total_citations, self_citations, self_cite_rate | 40 | - | 30 |
| `chapter9/quality_by_country.json` | array | country, decade, patent_count, avg_claims | 74 | - | 30 |

### 3.12 Chapter 10: Convergence / Patent Law

| File | Format | Schema | Rows | Time | Source |
|------|--------|--------|------|------|--------|
| `chapter10/applications_vs_grants.json` | array | year, applications, grants, grant_to_application_ratio | 50 | 1976-2025 | 14 |
| `chapter10/hhi_by_section.json` | array | period_start, period, section, total_patents, hhi | 99 | 1975-2025 | 14 |
| `chapter10/convergence_matrix.json` | array | era, section_row, section_col, co_occurrence_pct, patent_count | 84 | - | 14 |
| `chapter10/convergence_decomposition.json` | array | year, overall_multi_rate, within_firm, between_firm, total_change | 48 | 1977-2024 | 61 |
| `chapter10/convergence_near_far.json` | array | year, distance_type, share_pct | 98 | 1976-2024 | 61 |
| `chapter10/convergence_top_assignees.json` | array | year, firm, multi_count, total_count | 475 | 1976-2024 | 61 |
| `chapter10/interdisciplinarity_unified.json` | array | year, mean_scope, mean_cpc_sections, multi_section_pct, patent_count, z_scope, z_cpc_sections, z_multi_section | 49 | 1976-2024 | 67 |
| `chapter10/alice_event_study.json` | array | year, group_label, patent_count, mean_claims, mean_scope, idx_count, idx_claims, idx_scope | 26 | 2008-2020 | 70 |
| `chapter10/npl_by_firm.json` | array | organization, total_patents, avg_npl_citations, median_npl_citations | 50 | - | phase1_8_39 |
| `chapter10/foreign_citation_by_firm.json` | array | organization, total_patents, foreign_citation_share_pct | 50 | - | phase1_8_39 |

### 3.13 Chapter 12: Topic Modeling (system-language)

| File | Format | Schema | Rows | Size | Source |
|------|--------|--------|------|------|--------|
| `chapter12/topic_definitions.json` | array | id, name, top_words, patent_count | 25 | 6 KB | 28 |
| `chapter12/topic_prevalence.json` | array | year, topic, topic_name, count, share | 1,250 | 107 KB | 28 |
| `chapter12/topic_cpc_matrix.json` | array | section, section_name, topic, topic_name, count, share | 200 | 24 KB | 28 |
| `chapter12/topic_umap.json` | array | patent_id, x, y, topic_name, year, section | 5,000 | 501 KB | 28 |
| `chapter12/topic_novelty_trend.json` | array | year, median_entropy, avg_entropy, patent_count | 50 | 4 KB | 28 |
| `chapter12/topic_novelty_top.json` | array | patent_id, year, section, topic, topic_name, entropy | 50 | 6 KB | 28 |

### 3.14 Supplementary Chapter Files (13-22)

| File | Schema | Rows | Source |
|------|--------|------|--------|
| `chapter13/examiner_inventor_overlap.json` | unique_examiner_names, unique_inventor_names, name_matches | 1 | phase7 |
| `chapter13/multi_type_inventors.json` | career_length_bin, total_inventors, multi_type, multi_type_pct | 4 | phase6_9 |
| `chapter14/npl_by_inventor_type.json` | inventor_type, patent_count, avg_npl, median_npl | 2 | phase3 |
| `chapter16/gender_by_filing_route.json` | year, origin, total_inventors, female_inventors, female_share_pct | 100 | phase6_9 |
| `chapter17/cross_institutional_rate.json` | year, total_patents, cross_institutional, cross_institutional_pct | 50 | phase6_9 |
| `chapter17/cross_institutional_by_cpc.json` | cpc_section, total, cross_institutional_pct | 8 | phase6_9 |
| `chapter18/top_counties.json` | county_state, state, patent_count | 50 | phase6_9 |
| `chapter18/county_concentration_over_time.json` | period, total, top50_sum, top50_share_pct | 10 | phase6_9 |
| `chapter18/innovation_clusters.json` | location, country, lat, lng, patent_count | 100 | phase6_9 |
| `chapter19/priority_country_composition.json` | year, priority_country, count | 1,361 | phase6_9 |
| `chapter19/pct_share_by_country.json` | country, year, total, pct_count, pct_share | 360 | phase6_9 |
| `chapter20/citation_category_distribution.json` | citation_category, cnt | 5 | phase3 |
| `chapter21/inventor_international_mobility.json` | period_start, total_inventors, mobile_inventors, mobility_rate | 10 | phase6_9 |
| `chapter21/inventor_mobility_flows.json` | from_country, to_country, move_count | 20 | phase6_9 |
| `chapter22/citation_localization.json` | period, total_pairs, same_country, same_country_pct | 11 | phase3 |

### 3.15 Company Data (org chapters 8-12, mech chapters 20-21)

| File | Format | Schema | Rows | Size | Source |
|------|--------|--------|------|------|--------|
| `company/company_name_mapping.json` | object | {raw_name: display_name} | 8+ companies | 9 KB | 31 |
| `company/company_profiles.json` | array | company, raw_name, years | 100 profiles | 1,185 KB | 32 |
| `company/trajectory_archetypes.json` | object | year_min, year_max, companies, centroids | ~200 companies | 84 KB | 33 |
| `company/corporate_mortality.json` | object | decades, survival_rates, continuous_companies, cumulative_survival, summary | 23 keys | 33 KB | 34 |
| `company/portfolio_diversification_b3.json` | array | company, year, shannon_entropy, num_subclasses | 1,974 | 156 KB | 35 |
| `company/pivot_detection.json` | array | company, window_start, window_end, jsd, is_pivot, top_gaining_cpc, top_losing_cpc | 830 | 115 KB | 35 |
| `company/patent_concentration.json` | array | year, section, hhi, c4 | 400 | 20 KB | 35 |
| `company/corporate_citation_network.json` | array | decade, source, target, citation_count | 3,328 | 253 KB | 36 |
| `company/tech_leadership.json` | array | window, section, company, citations_received, rank | 400 | 39 KB | 36 |
| `company/citation_half_life.json` | array | company, half_life_years, total_citations, patent_count | 49 | 4 KB | 36 |
| `company/inventor_careers.json` | object | curves, durations | ~91 entries | 6 KB | 37 |
| `company/inventor_drift.json` | array | decade, specialist_pct, moderate_pct, generalist_pct, inventor_count | 6 | 1 KB | 37 |
| `company/comeback_inventors.json` | array | gap_years, count, avg_patents_before, avg_patents_after, changed_assignee_pct, changed_cpc_pct | 11 | 1 KB | 37 |
| `company/design_patents.json` | object | trends, top_filers | ~70 entries | 5 KB | 38 |
| `company/claims_analysis.json` | object | trends, by_section, claim_monsters | ~118 entries | 9 KB | 38 |
| `company/talent_flows.json` | object | nodes, links | ~2,273 entries | 81 KB | 39 |
| `company/corporate_speed.json` | array | company, year, avg_grant_lag_days, median_grant_lag_days, patent_count | 3,833 | 476 KB | 39 |
| `company/portfolio_overlap.json` | array | company, x, y, industry, decade, top_cpc | 248 | 25 KB | 40 |
| `company/strategy_profiles.json` | array | company, breadth, depth, defensiveness, influence, science_intensity, speed, collaboration | 99 | 22 KB | 40 |
| `company/firm_quality_distribution.json` | object | {company: [{year, ...}]} | ~3,833 company-year rows | 795 KB | 41 |
| `company/firm_claims_distribution.json` | object | {company: [{year, ...}]} | ~3,833 company-year rows | 393 KB | 41 |
| `company/firm_scope_distribution.json` | object | {company: [{year, ...}]} | ~1,915 company-year rows | 143 KB | 41 |
| `company/firm_quality_scatter.json` | array | company, blockbuster_rate, dud_rate, patent_count, primary_section | 50 | 5 KB | 41 |
| `company/firm_quality_gini.json` | object | {company: {gini, data}} | ~677 entries | 19 KB | 41 |
| `company/firm_exploration_scores.json` | object | {company: [{year, ...}]} | ~1,796 company-year rows | 575 KB | 42 |
| `company/firm_exploration_scatter.json` | array | company, exploration_share, quality_premium, patent_count, primary_section | 49 | 5 KB | 42 |
| `company/firm_exploration_trajectories.json` | object | {company: [{period, ...}]} | ~777 entries | 30 KB | 42 |
| `company/firm_exploration_lifecycle.json` | object | firms, system_average | 2 keys | 17 KB | 43 |
| `company/firm_ambidexterity_quality.json` | array | company, window, patent_count, ambidexterity_index, exploration_share, exploitation_share, blockbuster_rate, median_fwd_cites | 314 | 59 KB | 44 |
| `company/company_milestones.json` | object | {company: [{year, event}]} | 88 entries | 5 KB | 32 |

### 3.16 Explore Page

| File | Format | Schema | Rows | Size | Source |
|------|--------|--------|------|------|--------|
| `explore/top_assignees_all.json` | array | organization, total_patents, first_year, last_year | 500 | 50 KB | 07 |
| `explore/top_inventors_all.json` | array | inventor_id, first_name, last_name, total_patents, first_year, last_year, gender | 500 | 72 KB | 07 |
| `explore/cpc_class_summary.json` | array | section, cpc_class, class_name, total_patents | 146,501 | 26,865 KB | 07 |
| `explore/wipo_field_summary.json` | array | sector, field, field_id, total_patents | 34 | 3 KB | 07 |

### 3.17 Computed Quality Metrics

All files in `public/data/computed/`. Generated by scripts 58-60 and 68. Built on `patent_master.parquet`.

**Cohort-Normalized Citations (script 59):**

| File | Schema | Rows | Dimensions |
|------|--------|------|------------|
| `cohort_normalized_citations_system.json` | year, mean_cohort_norm, median_cohort_norm, top1pct_share | 45 | System-level |
| `cohort_normalized_citations_heatmap.json` | year, section, mean_norm, median_norm, patent_count | 315 | Year x CPC section |
| `cohort_normalized_by_assignee.json` | year, assignee, mean_norm, patent_count | 3,373 | Year x top assignees |
| `cohort_normalized_by_inventor_group.json` | year, gender, team_size_cat, mean_norm, patent_count | 540 | Year x gender x team size |
| `cohort_normalized_by_geography.json` | year, region, geo_type, mean_norm, patent_count | 3,587 | Year x state/country |
| `cohort_normalized_by_teamsize.json` | year, team_size_cat, mean_norm, median_norm, patent_count | 180 | Year x team size bucket |

**Quality by Dimension (script 59 / patent_master):**

| File | Schema | Rows | Group By |
|------|--------|------|----------|
| `quality_by_company.json` | year, group, patent_count, avg_num_claims, avg_scope, avg_forward_citations, avg_backward_citations, avg_self_citation_rate | 1,921 | Company |
| `quality_by_cpc_section.json` | (same) | 400 | CPC section |
| `quality_by_state.json` | (same) | 750 | US state |
| `quality_by_city.json` | (same) | 750 | City |
| `quality_by_country.json` | (same) | 743 | Country |
| `quality_by_gender.json` | (same) | 150 | Gender |
| `quality_by_team_size.json` | (same) | 200 | Team size |
| `quality_by_experience.json` | (same) | 99 | Career experience |
| `quality_by_inventor_rank.json` | (same) | 100 | Inventor rank |
| `quality_by_specialization.json` | (same) | 100 | Specialist/Generalist |
| `quality_by_domestic_intl.json` | (same) | 100 | Domestic vs International |

**Inventor Productivity (script 59):**

| File | Schema | Rows | Group By |
|------|--------|------|----------|
| `inventor_productivity_by_experience.json` | year, group, avg_patents_per_inventor, inventor_count | 99 | Experience bin |
| `inventor_productivity_by_gender.json` | (same) | 100 | Gender |
| `inventor_productivity_by_rank.json` | (same) | 100 | Rank quintile |
| `inventor_productivity_by_specialization.json` | (same) | 100 | Spec/Gen |
| `inventor_productivity_by_team_size.json` | (same) | 200 | Team size |

**Other Computed (scripts 60, 68):**

| File | Schema | Rows | Source |
|------|--------|------|--------|
| `originality_generality_filtered.json` | year, threshold, avg_originality, median_originality, n_originality, avg_generality, median_generality, n_generality | 150 | 60 |
| `sleeping_beauty_halflife.json` | cpc_section, total_patents, sleeping_beauties, sb_rate_pct, mean_half_life, median_half_life, n_patents, section_name | 8 | 68 |

**Lookup Lists:**

| File | Content | Rows |
|------|---------|------|
| `top_cities.json` | Array of 15 city name strings | 15 |
| `top_countries.json` | Array of 15 country name strings | 15 |
| `top_states.json` | Array of 15 US state abbreviation strings | 15 |

---

## 4. Data Lineage Map: Chapter -> JSON Files -> Pipeline Script -> Raw Data

### Loading Mechanism

All chapters load data via `useChapterData<T>(path)` in `src/hooks/useChapterData.ts`. This hook:
1. Fetches `/data/{path}` (relative to `NEXT_PUBLIC_BASE_PATH`)
2. Parses JSON; extracts `.data` wrapper if present
3. Caches results in a module-level `Map<string, any>`

### Act 1: The System

| Chapter | Slug | JSON Files | Pipeline Scripts | Raw Tables |
|---------|------|------------|-----------------|------------|
| 1. Patent Count | system-patent-count | chapter1/patents_per_year, hero_stats, grant_lag, filing_vs_grant_year, pendency_by_filing_year, continuation_chains | 01, phase1_8_39 | g_patent, g_application |
| 2. Patent Quality | system-patent-quality | chapter1/claims_per_year; chapter2/npl_citations_per_year, npl_citations_by_cpc, foreign_citation_share, figures_per_patent, figures_by_cpc_section; chapter6/citations_per_year, citation_lag_trend; chapter9/quality_trends, originality_generality, self_citation_rate, sleeping_beauties; computed/cohort_normalized_citations_system, originality_generality_filtered, sleeping_beauty_halflife; company/claims_analysis | 01, 06, 11, 17, 22, 30, 38, 59, 60, 68, phase1_8_39 | g_patent, g_cpc_current, g_us_patent_citation, g_application, g_foreign_citation, g_figures |
| 3. Patent Fields | system-patent-fields | chapter2/cpc_sections_per_year, tech_diversity, technology_scurves, technology_halflife, technology_decay_curves, cpc_treemap; chapter3/cpc_reclassification_by_decade, cpc_reclassification_flows, wipo_sector_shares, wipo_field_growth; chapter6/citation_lag_by_section; chapter7/innovation_velocity, friction_map; chapter9/quality_by_sector, self_citation_by_section; chapter10/hhi_by_section; computed/quality_by_cpc_section; company/claims_analysis, design_patents | 02, 08, 14, 17, 19, 24, 30, 38, 41, 59, phase5 | g_patent, g_cpc_current, g_cpc_title, g_wipo_technology, g_us_patent_citation, g_application, g_figures |
| 4. Convergence | system-convergence | chapter7/cross_domain; chapter10/convergence_matrix, convergence_decomposition, convergence_near_far, convergence_top_assignees, interdisciplinarity_unified; chapter4/ipc_vs_cpc_convergence | 08, 14, 30, 61, 67 | g_patent, g_cpc_current, g_assignee_disambiguated |
| 5. Language | system-language | chapter12/topic_definitions, topic_prevalence, topic_cpc_matrix, topic_umap, topic_novelty_trend, topic_novelty_top | 28 | g_patent, g_patent_abstract, g_cpc_current |
| 6. Patent Law | system-patent-law | chapter10/applications_vs_grants, alice_event_study; chapter6/alice_art_group_indexed, alice_art_group_pendency, terminal_disclaimer_rate, terminal_disclaimer_by_cpc, patent_term_adjustment, pta_by_cpc_section | 14, 70, phase2, phase7 | g_patent, g_application, g_cpc_current |
| 7. Public Investment | system-public-investment | chapter6/gov_funded_per_year, gov_agencies; chapter1/gov_agency_field_matrix, gov_agency_breadth_depth, gov_impact_comparison; chapter7/top_government_contracts | 06, 66, 69, phase scripts | g_patent, g_gov_interest, g_gov_interest_org, g_gov_interest_contracts |

### Act 2: The Organizations

| Chapter | Slug | JSON Files | Pipeline Scripts | Raw Tables |
|---------|------|------------|-----------------|------------|
| 8. Assignee Composition | org-composition | chapter3/assignee_types_per_year, top_assignees, domestic_vs_foreign, non_us_by_section; chapter8/filing_route_over_time, law_firm_concentration, top_law_firms | 03, 30, phase6_9, phase7 | g_patent, g_assignee_disambiguated, g_pct_data, g_attorney_disambiguated |
| 9. Org Patent Count | org-patent-count | chapter3/top_assignees, top_orgs_over_time, concentration; chapter2/blockbuster_lorenz; chapter9/continuation_share_by_firm; company/design_patents, corporate_mortality | 03, 34, 38, 65, phase scripts | g_patent, g_assignee_disambiguated, g_cpc_current, g_us_patent_citation |
| 10. Org Quality | org-patent-quality | chapter3/firm_citation_impact; chapter9/self_citation_by_assignee; chapter10/npl_by_firm, foreign_citation_by_firm; company/firm_quality_scatter, firm_quality_distribution, citation_half_life; computed/quality_by_company | 09, 30, 36, 41, 59, phase1_8_39 | g_patent, g_assignee_disambiguated, g_us_patent_citation, g_foreign_citation |
| 11. Portfolio | org-patent-portfolio | chapter7/corp_diversification; chapter11/wipo_portfolio_diversity; company/portfolio_overlap, portfolio_diversification_b3, pivot_detection | 08, 23, 35, 40 | g_patent, g_assignee_disambiguated, g_cpc_current, g_wipo_technology |
| 12. Company Profiles | org-company-profiles | company/company_profiles, strategy_profiles, corporate_speed, firm_quality_distribution, firm_claims_distribution, company_name_mapping; chapter3/firm_tech_evolution | 09, 31, 32, 39, 40, 41 | g_patent, g_assignee_disambiguated, g_cpc_current, g_inventor_disambiguated, g_location_disambiguated, g_us_patent_citation, g_application |

### Act 3: The Inventors

| Chapter | Slug | JSON Files | Pipeline Scripts |
|---------|------|------------|-----------------|
| 13. Top Inventors | inv-top-inventors | chapter5/superstar_concentration, prolific_inventors, star_inventor_impact; chapter13/examiner_inventor_overlap, multi_type_inventors; computed/quality_by_inventor_rank, inventor_productivity_by_rank | 05, 10, 16, 59, phase6_9, phase7 |
| 14. Generalist/Specialist | inv-generalist-specialist | chapter14/npl_by_inventor_type; company/inventor_drift; computed/quality_by_specialization, inventor_productivity_by_specialization | 37, 59, phase3 |
| 15. Serial/New | inv-serial-new | chapter5/first_time_inventors, inventor_entry, inventor_segments, inventor_longevity; company/inventor_careers, comeback_inventors; computed/quality_by_experience, inventor_productivity_by_experience | 05, 10, 16, 30, 37, 59 |
| 16. Gender | inv-gender | chapter5/gender_per_year, gender_by_sector, gender_by_tech, gender_section_trend, gender_team_quality; chapter16/gender_by_filing_route; computed/quality_by_gender, inventor_productivity_by_gender | 05, 25, 59, phase6_9 |
| 17. Team Size | inv-team-size | chapter5/team_size_per_year, solo_inventors, solo_inventors_by_section; chapter3/team_size_coefficients; chapter17/cross_institutional_rate, cross_institutional_by_cpc; computed/quality_by_team_size, inventor_productivity_by_team_size | 05, 16, 59, 64, phase6_9 |

### Act 4: The Geography

| Chapter | Slug | JSON Files | Pipeline Scripts |
|---------|------|------------|-----------------|
| 18. Domestic | geo-domestic | chapter4/us_states_summary, state_specialization, us_states_per_year, top_cities, regional_specialization; chapter18/top_counties, county_concentration_over_time, innovation_clusters; computed/quality_by_state, quality_by_city, top_states, top_cities | 04, 21, 59, phase6_9 |
| 19. International | geo-international | chapter4/countries_per_year; chapter9/quality_by_country; chapter19/priority_country_composition, pct_share_by_country; computed/quality_by_domestic_intl, quality_by_country, top_countries | 04, 30, 59, phase6_9 |

### Act 5: The Mechanics

| Chapter | Slug | JSON Files | Pipeline Scripts |
|---------|------|------------|-----------------|
| 20. Org Mechanics | mech-organizations | chapter3/firm_collaboration_network; chapter5/exploration_exploitation_trajectory; chapter20/citation_category_distribution; company/firm_exploration_scores, firm_exploration_trajectories, firm_exploration_lifecycle, firm_ambidexterity_quality, firm_quality_gini, corporate_citation_network, tech_leadership | 09, 36, 42, 43, 44, 62, phase3 |
| 21. Inventor Mechanics | mech-inventors | chapter3/network_metrics_by_decade, bridge_inventors; chapter4/inventor_mobility_trend, inventor_state_flows, inventor_country_flows; chapter5/inventor_collaboration_network, inventor_mobility_event_study, bridge_centrality; chapter21/inventor_international_mobility, inventor_mobility_flows; company/talent_flows | 10, 13, 27, 39, 63, 71, phase6_9 |
| 22. Geographic Mechanics | mech-geography | chapter6/co_invention_rates, co_invention_us_china_by_section; chapter7/intl_collaboration; chapter4/innovation_diffusion_summary; chapter22/citation_localization | 08, 26, 30, phase3 |

### Act 6: Deep Dives

All 12 domains follow a common pattern: `domain_utils.run_domain_pipeline()` generates 11 standard files, plus scripts 73 and 74 add entrant_incumbent and quality_bifurcation. Domain-specific enrichments come from script 75 and others.

| Chapter | Slug | Data Dir | Pipeline Script | CPC Filter |
|---------|------|----------|----------------|------------|
| 23. 3D Printing | 3d-printing | 3dprint | 55 | B33Y, B29C64/, B22F10/ |
| 24. Agtech | agricultural-technology | agtech | 53 | A01B, A01C, A01G, A01H, G06Q50/02 |
| 25. AI | ai-patents | chapter11 | 12, 23 | G06N (neural/ML), G06F18 (pattern rec), G10L (speech) |
| 26. AV | autonomous-vehicles | av | 50 | B60W60/, G05D1/, G06V20/56 |
| 27. Biotech | biotechnology | biotech | 49 | C12N15/, C12N9/, C12Q1/68 |
| 28. Blockchain | blockchain | blockchain | 56 | H04L9/0643, G06Q20/0655 |
| 29. Cybersecurity | cybersecurity | cyber | 52 | G06F21/, H04L9/, H04L63/ |
| 30. Digital Health | digital-health | digihealth | 54 | A61B5/, G16H, A61B34/ |
| 31. Green | green-innovation | green | 29, 57 | Y02, Y04S |
| 32. Quantum | quantum-computing | quantum | 48 | G06N10/, H01L39/ |
| 33. Semiconductors | semiconductors | semiconductors | 47 | H01L, H10N, H10K |
| 34. Space | space-technology | space | 51 | B64G, H04B7/185 |

Deep Dive Overview page (deep-dive-overview) loads: act6/act6_comparison, act6_timeseries, act6_quality, act6_spillover, act6_continuation_rates, act6_domain_filing_vs_grant.

---

## 5. Pipeline Script Catalog

### Numbered Scripts (01-75)

| # | Script | Description | Output Dir | Key Outputs |
|---|--------|-------------|-----------|-------------|
| 01 | chapter1_landscape | Annual patents, claims, grant lag, hero stats | chapter1 | patents_per_year, patents_per_month, claims_per_year, grant_lag, hero_stats |
| 02 | chapter2_technology | WIPO/CPC section time series, diversity | chapter2 | wipo_sectors_per_year, wipo_fields_per_year, cpc_sections_per_year, cpc_class_change, tech_diversity, cpc_treemap |
| 03 | chapter3_assignees | Assignee types, rankings, concentration | chapter3 | assignee_types_per_year, top_assignees, top_orgs_over_time, domestic_vs_foreign, concentration |
| 04 | chapter4_geography | State/country/city patent counts | chapter4 | us_states_per_year, us_states_summary, countries_per_year, top_cities, state_specialization |
| 05 | chapter5_inventors | Team size, gender, prolific inventors | chapter5 | team_size_per_year, gender_per_year, gender_by_sector, prolific_inventors, inventor_entry |
| 06 | chapter6_citations | Citation time series, gov funding | chapter6 | citations_per_year, citation_categories, citation_lag, gov_funded_per_year, gov_agencies |
| 07 | explore_data | Explore page tables | explore | top_assignees_all, top_inventors_all, cpc_class_summary, wipo_field_summary |
| 08 | chapter7_dynamics | Grant lag by sector, cross-domain, velocity | chapter7 | grant_lag_by_sector, cross_domain, intl_collaboration, corp_diversification, innovation_velocity |
| 09 | chapter3_firm_deep | Firm collaboration network, citations, tech evolution | chapter3 | firm_collaboration_network, firm_citation_impact, firm_tech_evolution |
| 10 | chapter5_inventor_deep | Inventor network, longevity, star impact | chapter5 | inventor_collaboration_network, inventor_longevity, star_inventor_impact |
| 11 | chapter9_patent_quality | Multi-dimensional quality metrics | chapter9 | quality_trends, self_citation_rate, quality_by_sector, breakthrough_patents, originality_generality |
| 12 | chapter11_ai_patents | AI patent classification and analysis | chapter11 | ai_patents_per_year, ai_by_subfield, ai_top_assignees/inventors, ai_geography, ai_quality |
| 13 | inventor_movement | Geographic mobility flows | chapter4 | inventor_mobility_trend, inventor_state_flows, inventor_country_flows |
| 14 | chapter10_patent_law | Application vs grant, HHI, convergence matrix | chapter10 | applications_vs_grants, hhi_by_section, convergence_matrix |
| 15 | chapter3_portfolio_diversity | Shannon entropy of CPC portfolios | chapter3 | portfolio_diversity |
| 16 | chapter5_superstar_solo_firsttime | Superstar concentration, solo, first-time | chapter5 | superstar_concentration, solo_inventors, solo_inventors_by_section, first_time_inventors |
| 17 | chapter7_citation_lag | Citation lag by section and trends | chapter6 | citation_lag_by_section, citation_lag_trend |
| 18 | chapter9_composite_quality | Z-score composite quality index | chapter9 | composite_quality_index |
| 19 | chapter8_friction_maps | Examination duration heatmap | chapter7 | friction_map |
| 20 | chapter5_inventor_mobility | Mobile vs non-mobile citations | chapter5 | inventor_mobility, inventor_mobility_by_decade |
| 21 | chapter4_regional_specialization | Location quotient by metro | chapter4 | regional_specialization |
| 22 | chapter9_sleeping_beauty | Delayed citation burst patents | chapter9 | sleeping_beauties |
| 23 | chapter11_ai_deep | AI strategies and GPT analysis | chapter11 | ai_strategies, ai_gpt_diffusion |
| 24 | chapter2_technology_halflife | Citation decay curves by section | chapter2 | technology_halflife, technology_decay_curves |
| 25 | chapter5_gender_deep | Gender x technology, team quality | chapter5 | gender_by_tech, gender_team_quality, gender_section_trend |
| 26 | chapter4_diffusion | Geographic innovation spread | chapter4 | innovation_diffusion, innovation_diffusion_summary |
| 27 | chapter6_network_deep | Network metrics by decade, bridge inventors | chapter3 | network_metrics_by_decade, bridge_inventors |
| 28 | chapter12_topic_modeling | LDA topic model on 8.4M abstracts | chapter12 | topic_definitions, topic_prevalence, topic_cpc_matrix, topic_umap, topic_novelty_trend, topic_novelty_top |
| 29 | green_innovation | Green patent analysis (Y02/Y04S) | green | green_volume, green_by_category, green_by_country, green_top_companies, green_ai_trend, green_ai_heatmap |
| 30 | batch_additions | Fill gaps: S-curves, non-US, segments, co-invention, self-citation, quality by country | chapter2-11 | technology_scurves, non_us_by_section, inventor_segments, co_invention_rates, self_citation_by_assignee/section, quality_by_country |
| 31 | company_name_mapping | Canonical company name disambiguation | company | company_name_mapping |
| 32 | company_profiles | Per-year profiles for top 100 assignees | company | company_profiles, company_milestones |
| 33 | trajectory_archetypes | K-means clustering of patent trajectories | company | trajectory_archetypes |
| 34 | corporate_mortality | Survival analysis across decade cohorts | company | corporate_mortality |
| 35 | portfolio_strategy | Portfolio diversification, pivots, concentration | company | portfolio_diversification_b3, pivot_detection, patent_concentration |
| 36 | corporate_citations | Citation networks, tech leadership, half-life | company | corporate_citation_network, tech_leadership, citation_half_life |
| 37 | inventor_careers | Career curves, drift, comeback | company | inventor_careers, inventor_drift, comeback_inventors |
| 38 | design_patents_claims | Design patent analysis, claims distribution | company | design_patents, claims_analysis |
| 39 | talent_flows | Inventor inter-firm movement, corporate speed | company | talent_flows, corporate_speed |
| 40 | portfolio_strategy_profiles | Portfolio overlap, strategy profiles | company | portfolio_overlap, strategy_profiles |
| 41 | firm_quality_distribution | Per-firm quality/claims/scope distributions | company | firm_quality_distribution, firm_claims_distribution, firm_scope_distribution, firm_quality_scatter, firm_quality_gini |
| 42 | firm_exploration_exploitation | Exploration vs exploitation scoring | company | firm_exploration_scores, firm_exploration_scatter, firm_exploration_trajectories |
| 43 | firm_exploration_lifecycle | Firm x CPC subclass lifecycle analysis | company | firm_exploration_lifecycle |
| 44 | firm_ambidexterity_quality | Ambidexterity index vs blockbuster rate | company | firm_ambidexterity_quality |
| 45 | fma_entry_identification | First-mover advantage: entry order | (fma, not deployed) | entry_order, qualifying_subclasses, first_movers, dominant_players |
| 46 | fma_match_rate | First-mover: match rates | (fma, not deployed) | match_rate_by_section/decade, sankey_selected |
| 47 | semiconductors | Semiconductor domain pipeline | semiconductors | 11 standard + entrant/bifurcation |
| 48 | quantum_computing | Quantum domain pipeline | quantum | 11 standard + entrant/bifurcation + semiconductor_dependence |
| 49 | biotechnology | Biotech domain pipeline | biotech | 11 standard + entrant/bifurcation |
| 50 | autonomous_vehicles | AV domain pipeline | av | 11 standard + entrant/bifurcation |
| 51 | space_technology | Space domain pipeline | space | 11 standard + entrant/bifurcation |
| 52 | cybersecurity | Cybersecurity domain pipeline | cyber | 11 standard + entrant/bifurcation |
| 53 | agricultural_technology | Agtech domain pipeline | agtech | 11 standard + entrant/bifurcation |
| 54 | digital_health | Digital health domain pipeline | digihealth | 11 standard + entrant/bifurcation + regulatory_split |
| 55 | 3d_printing | 3D printing domain pipeline | 3dprint | 11 standard + entrant/bifurcation |
| 56 | blockchain | Blockchain domain pipeline | blockchain | 11 standard + entrant/bifurcation + hype_cycle |
| 57 | green_supplement | Green supplementary: top_inventors, org_over_time, etc. | green | green_top_inventors, green_org_over_time, and 5 others |
| 58 | build_patent_master | Build wide patent_master.parquet | /tmp/patentview/ | patent_master.parquet |
| 59 | cohort_normalization | Cohort-normalized citations, quality by dimension | computed | 6 cohort files + 11 quality_by files + 5 productivity files |
| 60 | originality_generality_filtered | Originality/generality at 3 thresholds | computed | originality_generality_filtered |
| 61 | convergence_decomposition | Within/between firm convergence | chapter10 | convergence_decomposition, convergence_near_far, convergence_top_assignees |
| 62 | exploration_trajectory | Firm exploration-exploitation trajectory | chapter5 | exploration_exploitation_trajectory |
| 63 | inventor_mobility_event | Inventor move event study | chapter5 | inventor_mobility_event_study |
| 64 | team_size_coefficients | OLS team size regression | chapter3 | team_size_coefficients |
| 65 | blockbuster_lorenz | Blockbuster Lorenz curves by decade | chapter2 | blockbuster_lorenz |
| 66 | gov_agency_field | Government agency x CPC section matrix | chapter1 | gov_agency_field_matrix, gov_agency_breadth_depth |
| 67 | interdisciplinarity_trend | Composite interdisciplinarity index | chapter10 | interdisciplinarity_unified |
| 68 | sleeping_beauty_halflife | Sleeping beauty rate x half-life by section | computed | sleeping_beauty_halflife |
| 69 | gov_interest_impact | Gov-funded vs non-funded impact comparison | chapter1 | gov_impact_comparison |
| 70 | alice_event_study | Alice Corp decision: software patent effects | chapter10 | alice_event_study |
| 71 | bridge_inventor_centrality | Co-invention network centrality impact | chapter5 | bridge_centrality |
| 72 | act6_cross_domain | Cross-domain comparison for 12 deep dives | act6 | act6_comparison, act6_timeseries, act6_quality, act6_spillover |
| 73 | entrant_incumbent | Entrant vs incumbent decomposition, all domains | per domain | {slug}_entrant_incumbent |
| 74 | quality_bifurcation | Top-decile share, all domains | per domain | {slug}_quality_bifurcation |
| 75 | act6_enrichments | Domain-specific enrichments (AI KPI, Green EV, Quantum-Semi, Blockchain hype, DigiHealth regulatory, systems complexity) | chapter11, green, quantum, blockchain, digihealth, act6 | 6 files |

### Batch/Phase Scripts

| Script | Purpose | Key Outputs |
|--------|---------|-------------|
| phase1_8_39 | Filing vs grant trends, figures, NLP citations, domain filing/grant, foreign citations, NPL by firm | chapter1/filing_vs_grant_year, pendency_by_filing_year, continuation_chains; chapter2/figures_*, npl_citations_*, foreign_citation_share; chapter10/npl_by_firm, foreign_citation_by_firm; act6/act6_domain_filing_vs_grant |
| phase2 | Terminal disclaimers, PTA, continuation rates | chapter6/terminal_disclaimer_*, patent_term_adjustment, pta_by_*; act6/act6_continuation_rates |
| phase3 | Citation categories, NPL by inventor type, citation localization, ACT6 NPL | chapter20/citation_category_distribution; chapter14/npl_by_inventor_type; chapter22/citation_localization; act6/act6_npl_by_domain |
| phase5 | CPC reclassification, WIPO sectors/fields | chapter3/cpc_reclassification_*, wipo_sector_shares, wipo_field_growth |
| phase6_9 | Filing routes, priority country, gender by route, inventor mobility, cross-institutional, counties, clusters, multi-type inventors | chapter8/*, chapter16/*, chapter17/*, chapter18/*, chapter19/*, chapter21/*, chapter13/multi_type_inventors |
| phase7 | Alice art group analysis, law firms, examiner-inventor overlap | chapter6/alice_art_group_*; chapter8/law_firm_concentration, top_law_firms; chapter13/examiner_inventor_overlap |

### Utility Scripts

| Script | Purpose |
|--------|---------|
| config.py | Path configuration, TSV extraction, DuckDB helpers, JSON serialization, CPC/assignee type maps |
| domain_utils.py | Shared domain deep-dive pipeline: 11 standard analyses per technology domain |

---

## 6. Hardcoded Data Locations

### `/home/saerom/projects/patentworld/src/lib/constants.ts`

| Constant | Type | Content |
|----------|------|---------|
| `CHAPTERS` | Array<ChapterMeta> | 34 chapter definitions (number, slug, title, subtitle, description) |
| `ACT_GROUPINGS` | Array<ActGrouping> | 6 act groupings mapping chapters to acts |
| `CPC_SECTION_NAMES` | Record<string, string> | 9 CPC section code-to-name mappings (A-H, Y) |
| `HERO_STATS` | Object | Hardcoded summary stats: totalPatents=9.36M, years=50, chapters=34, visualizations=458 |

### `/home/saerom/projects/patentworld/src/lib/referenceEvents.ts`

Contains hardcoded timeline reference events used as overlay annotations on time-series charts:

| Constant | Events | Used By |
|----------|--------|---------|
| `PATENT_EVENTS` | 13 events (1980 Bayh-Dole through 2020 COVID-19) | Multiple system chapters |
| `GREEN_EVENTS` | 3 events (Kyoto, Paris, IRA) | Green Innovation |
| `SEMI_EVENTS` | 3 events (Dot-com, AIA, CHIPS) | Semiconductors |
| `QUANTUM_EVENTS` | 2 events (Quantum supremacy, error correction) | Quantum Computing |
| `CYBER_EVENTS` | 3 events (Snowden, WannaCry, SolarWinds) | Cybersecurity |
| `BIOTECH_EVENTS` | 4 events (Bayh-Dole, Genome, CRISPR, mRNA) | Biotechnology |
| `DIGIHEALTH_EVENTS` | 2 events (HITECH, COVID telemedicine) | Digital Health |
| `AGTECH_EVENTS` | 2 events (GM crops, Precision ag) | Agricultural Technology |
| `AV_EVENTS` | 3 events (Google self-driving, Tesla crash, Waymo) | Autonomous Vehicles |
| `SPACE_EVENTS` | 3 events (SpaceX, Falcon 9, Crew Dragon) | Space Technology |
| `PRINT3D_EVENTS` | 2 events (FDM patent expires, Desktop boom) | 3D Printing |
| `BLOCKCHAIN_EVENTS` | 3 events (Bitcoin, Ethereum, NFT peak) | Blockchain |

### `/home/saerom/projects/patentworld/src/app/chapters/system-patent-law/page.tsx`

Contains `TIMELINE_EVENTS`, a large inline array of 21+ legal/policy events (1980-2025) with:
- Year, title, category (Legislation/Judicial/Policy)
- Multi-paragraph descriptions
- Academic research citations with summaries (3-5 per event)
- This is the only chapter page with significant inline data

---

## 7. PatentsView Data Version

No explicit version file or download script was found. The data is stored as static zip files:

- **Location:** `/media/saerom/saerom-ssd/Penn Dropbox/Saerom (Ronnie) Lee/Research/PatentsView/`
- **Format:** 39 `*.tsv.zip` files (standard PatentsView bulk download format)
- **Coverage:** 1976-2025 (based on patent_date range in outputs)
- **Pipeline dependencies:** `duckdb>=1.1.0`, `orjson>=3.10.0` (from requirements.txt)
- **Intermediate storage:** `/tmp/patentview/` (extracted TSVs + patent_master.parquet)

---

## 8. Key Identifiers Across the Dataset

| Identifier | Description | Used In |
|-----------|-------------|---------|
| `patent_id` | USPTO patent number (VARCHAR, e.g., "RE32443") | All patent-level files |
| `inventor_id` | Disambiguated inventor ID | prolific_inventors, star_inventor_impact, network files |
| `organization` / `company` | Disambiguated assignee name | All firm-level analyses |
| `cpc_section` / `section` | CPC section code (A-H, Y) | Technology analyses |
| `cpc_class` / `cpc_subclass` | CPC class/subclass codes | Treemap, specialization, scope |
| `year` / `grant_year` | Patent grant year | Most time-series files |
| `country` / `state` / `city` | Geographic identifiers | Geography chapters |
| `wipo_field_id` / `sector` | WIPO technology classification | Technology analyses |
| `domain` / `slug` | Deep-dive domain identifier | Act 6 cross-domain files |
| `topic` / `topic_name` | LDA topic model identifier | Chapter 12 topic files |

---

## 9. Data Size Distribution

**Largest files (>100 KB):**

| File | Size (KB) | Description |
|------|-----------|-------------|
| explore/cpc_class_summary.json | 26,865 | 146,501 CPC classes |
| company/company_profiles.json | 1,185 | 100 company profiles |
| chapter4/innovation_diffusion.json | 3,822 | 24,533 city-level diffusion records |
| company/firm_quality_distribution.json | 795 | Per-firm quality over time |
| chapter4/regional_specialization.json | 677 | 5,735 location quotient records |
| computed/quality_by_company.json | 668 | 1,921 company-quality records |
| company/firm_exploration_scores.json | 575 | Exploration scores per firm-year |
| chapter3/firm_tech_evolution.json | 548 | 5,546 firm-section-period records |
| chapter12/topic_umap.json | 501 | 5,000 UMAP embedding points |
| company/corporate_speed.json | 476 | 3,833 firm-year grant lag records |

**Smallest files (<1 KB):**

| File | Size (bytes) | Description |
|------|-------------|-------------|
| chapter13/examiner_inventor_overlap.json | 85 | 1 summary row |
| computed/top_countries.json | 90 | 15 country names |
| computed/top_states.json | 90 | 15 state codes |
| chapter1/hero_stats.json | 104 | 5 summary statistics |
| chapter14/npl_by_inventor_type.json | 177 | 2 inventor type rows |
| chapter5/inventor_mobility.json | 185 | 2 mobility category rows |
| chapter3/cpc_reclassification_by_decade.json | 185 | 2 decade summaries |
| computed/top_cities.json | 251 | 15 city names |
| chapter5/gender_team_quality.json | 288 | 3 team composition rows |
| chapter20/citation_category_distribution.json | 298 | 5 citation categories |
