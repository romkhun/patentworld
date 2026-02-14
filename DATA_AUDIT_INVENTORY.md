# DATA AUDIT INVENTORY

**PatentWorld Data Pipeline Inventory**
Generated: 2026-02-14
Purpose: Complete inventory of all data files, ETL scripts, and frontend transformations

---

## Table of Contents

1. [Data Files](#data-files)
2. [Pipeline Scripts](#pipeline-scripts)
3. [Frontend Transformations](#frontend-transformations)

---

## Data Files

### Chapter 1: The Innovation Landscape
**Directory:** `public/data/chapter1/`

- **claims_per_year.json** - Average and median claims per utility patent by year (1976-2025)
- **grant_lag.json** - Average and median days from filing to grant by year
- **hero_stats.json** - Summary statistics: total patents, peak year, date ranges
- **patents_per_month.json** - Monthly utility patent counts (1976-2025)
- **patents_per_year.json** - Annual patent counts by type (utility, design, plant)

### Chapter 2: The Technology Revolution
**Directory:** `public/data/chapter2/`

- **cpc_class_change.json** - Growing and declining CPC classes (2000-2010 vs 2015-2025)
- **cpc_sections_per_year.json** - Patent counts by CPC section and year
- **cpc_treemap.json** - Hierarchical CPC classification data for treemap visualization
- **tech_diversity.json** - Technology diversity metrics over time
- **technology_decay_curves.json** - Technology obsolescence curves by field
- **technology_halflife.json** - Half-life calculations for technology fields
- **technology_scurves.json** - S-curve adoption patterns for technologies
- **wipo_fields_per_year.json** - Patent counts by WIPO field and year
- **wipo_sectors_per_year.json** - Patent counts by WIPO sector and year

### Chapter 3: Who Owns Innovation
**Directory:** `public/data/chapter3/`

- **assignee_types_per_year.json** - Distribution of assignee types over time
- **bridge_inventors.json** - Inventors connecting different organizations
- **concentration.json** - Patent concentration metrics (HHI, Gini coefficient)
- **domestic_vs_foreign.json** - US vs foreign assignee trends
- **firm_citation_impact.json** - Citation-based impact metrics by firm
- **firm_collaboration_network.json** - Network data for firm collaborations
- **firm_tech_evolution.json** - Technology portfolio evolution by firm
- **network_metrics_by_decade.json** - Network statistics across decades
- **non_us_by_section.json** - Non-US assignee distribution by CPC section
- **portfolio_diversity.json** - Technology portfolio diversity by firm
- **top_assignees.json** - Top assignee organizations (all-time)
- **top_orgs_over_time.json** - Top organizations tracked over time

### Chapter 4: The Geography of Innovation
**Directory:** `public/data/chapter4/`

- **countries_per_year.json** - Patent counts by country and year
- **innovation_diffusion.json** - Geographic diffusion of innovations
- **innovation_diffusion_summary.json** - Summary statistics for diffusion analysis
- **inventor_country_flows.json** - International inventor mobility flows
- **inventor_mobility_trend.json** - Inventor mobility trends over time
- **inventor_state_flows.json** - US state-to-state inventor flows
- **regional_specialization.json** - Regional technology specialization indices
- **state_specialization.json** - State-level technology specialization
- **top_cities.json** - Top cities by patent output
- **us_states_per_year.json** - Patent counts by US state and year
- **us_states_summary.json** - Summary statistics by US state

### Chapter 5: The Inventors
**Directory:** `public/data/chapter5/`

- **first_time_inventors.json** - First-time inventor entry rates
- **gender_by_sector.json** - Gender distribution by technology sector
- **gender_by_tech.json** - Gender distribution by technology field
- **gender_per_year.json** - Gender representation trends over time
- **gender_section_trend.json** - Gender trends by CPC section
- **gender_team_quality.json** - Patent quality metrics by team gender composition
- **inventor_collaboration_network.json** - Network data for inventor collaborations
- **inventor_entry.json** - New inventor entry patterns
- **inventor_longevity.json** - Career longevity of inventors
- **inventor_mobility.json** - Inventor mobility patterns
- **inventor_mobility_by_decade.json** - Mobility patterns across decades
- **inventor_segments.json** - Inventor segmentation (solo, prolific, etc.)
- **inventor_segments_trend.json** - Inventor segment trends over time
- **prolific_inventors.json** - Most prolific inventors
- **solo_inventors.json** - Solo inventor trends
- **solo_inventors_by_section.json** - Solo inventors by technology section
- **star_inventor_impact.json** - Impact metrics for star inventors
- **superstar_concentration.json** - Concentration of superstar inventors
- **team_size_per_year.json** - Average team size trends

### Chapter 6: Knowledge Networks
**Directory:** `public/data/chapter6/`

- **citation_categories.json** - Forward citation categories and distributions
- **citation_lag.json** - Time lag from grant to first citation
- **citation_lag_by_section.json** - Citation lag by CPC section
- **citation_lag_trend.json** - Citation lag trends over time
- **citations_per_year.json** - Average citations per patent by year
- **co_invention_rates.json** - Co-invention collaboration rates
- **co_invention_us_china_by_section.json** - US-China co-invention by section
- **gov_agencies.json** - Government funding by agency
- **gov_funded_per_year.json** - Government-funded patents by year

### Chapter 7: Innovation Dynamics
**Directory:** `public/data/chapter7/`

- **corp_diversification.json** - Corporate technology diversification trends
- **cross_domain.json** - Cross-domain technology combinations
- **friction_map.json** - Technology friction/distance matrix
- **grant_lag_by_sector.json** - Grant lag by technology sector
- **innovation_velocity.json** - Speed of innovation metrics
- **intl_collaboration.json** - International collaboration patterns

### Chapter 9: Patent Quality
**Directory:** `public/data/chapter9/`

- **breakthrough_patents.json** - Breakthrough patent identification
- **composite_quality_index.json** - Composite quality index over time
- **originality_generality.json** - Originality and generality metrics
- **quality_by_country.json** - Patent quality by country
- **quality_by_sector.json** - Patent quality by sector
- **quality_trends.json** - Quality metric trends
- **self_citation_by_assignee.json** - Self-citation rates by assignee
- **self_citation_by_section.json** - Self-citation by CPC section
- **self_citation_rate.json** - Overall self-citation rates
- **sleeping_beauties.json** - Delayed recognition patents

### Chapter 10: Patent Law & Policy
**Directory:** `public/data/chapter10/`

- **applications_vs_grants.json** - Application vs grant trends
- **convergence_matrix.json** - Technology convergence patterns
- **hhi_by_section.json** - Herfindahl-Hirschman Index by section

### Chapter 11: Artificial Intelligence
**Directory:** `public/data/chapter11/`

- **ai_assignee_type.json** - AI patent assignee type distribution
- **ai_by_subfield.json** - AI patents by subfield (neural nets, ML, NLP, etc.)
- **ai_geography.json** - Geographic distribution of AI patents
- **ai_gpt_diffusion.json** - GPT/generative AI diffusion patterns
- **ai_org_over_time.json** - Top AI organizations over time
- **ai_patents_per_year.json** - AI patent volume and share by year
- **ai_quality.json** - Quality indicators for AI patents
- **ai_strategies.json** - AI portfolio strategies by organization
- **ai_team_comparison.json** - AI vs non-AI team size comparison
- **ai_top_assignees.json** - Top AI patent assignees
- **ai_top_inventors.json** - Most prolific AI inventors

### Chapter 12: Topic Modeling
**Directory:** `public/data/chapter12/`

- **topic_cpc_matrix.json** - Topic-to-CPC mapping matrix
- **topic_definitions.json** - Topic labels and definitions
- **topic_novelty_top.json** - Most novel topics
- **topic_novelty_trend.json** - Topic novelty over time
- **topic_prevalence.json** - Topic prevalence trends
- **topic_umap.json** - UMAP embeddings for topic visualization

### Company Profiles
**Directory:** `public/data/company/`

- **citation_half_life.json** - Citation half-life by company
- **claims_analysis.json** - Claims analysis by company
- **comeback_inventors.json** - Inventors returning after gaps
- **company_milestones.json** - Patent milestones by company
- **company_name_mapping.json** - Company name standardization mapping
- **company_profiles.json** - Comprehensive company patent profiles
- **corporate_citation_network.json** - Citation network among corporations
- **corporate_mortality.json** - Corporate patent portfolio mortality
- **corporate_speed.json** - Innovation speed metrics by company
- **design_patents.json** - Design patent analysis
- **firm_ambidexterity_quality.json** - Exploration-exploitation vs quality
- **firm_claims_distribution.json** - Claims distribution by firm
- **firm_exploration_lifecycle.json** - Exploration patterns over firm lifecycle
- **firm_exploration_scatter.json** - Exploration vs exploitation scatter data
- **firm_exploration_scores.json** - Exploration/exploitation scores
- **firm_exploration_trajectories.json** - Exploration trajectories over time
- **firm_quality_distribution.json** - Quality distribution by firm
- **firm_quality_gini.json** - Gini coefficient for patent quality
- **firm_quality_scatter.json** - Quality scatter plot data
- **firm_scope_distribution.json** - Technology scope distribution
- **inventor_careers.json** - Inventor career trajectories
- **inventor_drift.json** - Inventor technology drift patterns
- **patent_concentration.json** - Patent concentration by firm
- **pivot_detection.json** - Technology pivot detection
- **portfolio_diversification_b3.json** - Portfolio diversification metrics
- **portfolio_overlap.json** - Portfolio overlap between firms
- **strategy_profiles.json** - Patent strategy profiles
- **talent_flows.json** - Talent flow between organizations
- **tech_leadership.json** - Technology leadership indicators
- **trajectory_archetypes.json** - Firm trajectory archetypes

### Explore Data
**Directory:** `public/data/explore/`

- **cpc_class_summary.json** - Summary statistics by CPC class
- **top_assignees_all.json** - All-time top assignees
- **top_inventors_all.json** - All-time top inventors
- **wipo_field_summary.json** - Summary statistics by WIPO field

### Green Innovation
**Directory:** `public/data/green/`

- **green_ai_heatmap.json** - Green-AI intersection heatmap
- **green_ai_trend.json** - Green-AI patent trends
- **green_assignee_type.json** - Assignee type distribution for green patents
- **green_by_category.json** - Green patents by category (solar, wind, etc.)
- **green_by_country.json** - Green patents by country
- **green_by_subfield.json** - Green patents by subfield
- **green_diffusion.json** - Cross-domain diffusion of green tech
- **green_geography.json** - Geographic distribution of green patents
- **green_org_over_time.json** - Top green organizations over time
- **green_per_year.json** - Green patent volume and share by year
- **green_quality.json** - Quality indicators for green patents
- **green_strategies.json** - Green portfolio strategies
- **green_team_comparison.json** - Team size comparison for green patents
- **green_top_assignees.json** - Top green patent assignees
- **green_top_companies.json** - Top companies in green innovation
- **green_top_inventors.json** - Top green patent inventors
- **green_volume.json** - Green patent volume trends

### Domain Deep Dives

#### 3D Printing
**Directory:** `public/data/3dprint/`

- **3dprint_assignee_type.json** - Assignee type distribution
- **3dprint_by_subfield.json** - Patents by 3D printing subfield
- **3dprint_diffusion.json** - Cross-domain diffusion
- **3dprint_geography.json** - Geographic distribution
- **3dprint_org_over_time.json** - Top organizations over time
- **3dprint_per_year.json** - Annual patent counts and share
- **3dprint_quality.json** - Quality indicators
- **3dprint_strategies.json** - Portfolio strategies
- **3dprint_team_comparison.json** - Team size comparison
- **3dprint_top_assignees.json** - Top assignees
- **3dprint_top_inventors.json** - Top inventors

#### Agricultural Technology
**Directory:** `public/data/agtech/`

- **agtech_assignee_type.json** - Assignee type distribution
- **agtech_by_subfield.json** - Patents by agtech subfield
- **agtech_diffusion.json** - Cross-domain diffusion
- **agtech_geography.json** - Geographic distribution
- **agtech_org_over_time.json** - Top organizations over time
- **agtech_per_year.json** - Annual patent counts and share
- **agtech_quality.json** - Quality indicators
- **agtech_strategies.json** - Portfolio strategies
- **agtech_team_comparison.json** - Team size comparison
- **agtech_top_assignees.json** - Top assignees
- **agtech_top_inventors.json** - Top inventors

#### Autonomous Vehicles
**Directory:** `public/data/av/`

- **av_assignee_type.json** - Assignee type distribution
- **av_by_subfield.json** - Patents by AV subfield
- **av_diffusion.json** - Cross-domain diffusion
- **av_geography.json** - Geographic distribution
- **av_org_over_time.json** - Top organizations over time
- **av_per_year.json** - Annual patent counts and share
- **av_quality.json** - Quality indicators
- **av_strategies.json** - Portfolio strategies
- **av_team_comparison.json** - Team size comparison
- **av_top_assignees.json** - Top assignees
- **av_top_inventors.json** - Top inventors

#### Biotechnology
**Directory:** `public/data/biotech/`

- **biotech_assignee_type.json** - Assignee type distribution
- **biotech_by_subfield.json** - Patents by biotech subfield
- **biotech_diffusion.json** - Cross-domain diffusion
- **biotech_geography.json** - Geographic distribution
- **biotech_org_over_time.json** - Top organizations over time
- **biotech_per_year.json** - Annual patent counts and share
- **biotech_quality.json** - Quality indicators
- **biotech_strategies.json** - Portfolio strategies
- **biotech_team_comparison.json** - Team size comparison
- **biotech_top_assignees.json** - Top assignees
- **biotech_top_inventors.json** - Top inventors

#### Blockchain
**Directory:** `public/data/blockchain/`

- **blockchain_assignee_type.json** - Assignee type distribution
- **blockchain_by_subfield.json** - Patents by blockchain subfield
- **blockchain_diffusion.json** - Cross-domain diffusion
- **blockchain_geography.json** - Geographic distribution
- **blockchain_org_over_time.json** - Top organizations over time
- **blockchain_per_year.json** - Annual patent counts and share
- **blockchain_quality.json** - Quality indicators
- **blockchain_strategies.json** - Portfolio strategies
- **blockchain_team_comparison.json** - Team size comparison
- **blockchain_top_assignees.json** - Top assignees
- **blockchain_top_inventors.json** - Top inventors

#### Cybersecurity
**Directory:** `public/data/cyber/`

- **cyber_assignee_type.json** - Assignee type distribution
- **cyber_by_subfield.json** - Patents by cybersecurity subfield
- **cyber_diffusion.json** - Cross-domain diffusion
- **cyber_geography.json** - Geographic distribution
- **cyber_org_over_time.json** - Top organizations over time
- **cyber_per_year.json** - Annual patent counts and share
- **cyber_quality.json** - Quality indicators
- **cyber_strategies.json** - Portfolio strategies
- **cyber_team_comparison.json** - Team size comparison
- **cyber_top_assignees.json** - Top assignees
- **cyber_top_inventors.json** - Top inventors

#### Digital Health
**Directory:** `public/data/digihealth/`

- **digihealth_assignee_type.json** - Assignee type distribution
- **digihealth_by_subfield.json** - Patents by digital health subfield
- **digihealth_diffusion.json** - Cross-domain diffusion
- **digihealth_geography.json** - Geographic distribution
- **digihealth_org_over_time.json** - Top organizations over time
- **digihealth_per_year.json** - Annual patent counts and share
- **digihealth_quality.json** - Quality indicators
- **digihealth_strategies.json** - Portfolio strategies
- **digihealth_team_comparison.json** - Team size comparison
- **digihealth_top_assignees.json** - Top assignees
- **digihealth_top_inventors.json** - Top inventors

#### Quantum Computing
**Directory:** `public/data/quantum/`

- **quantum_assignee_type.json** - Assignee type distribution
- **quantum_by_subfield.json** - Patents by quantum computing subfield
- **quantum_diffusion.json** - Cross-domain diffusion
- **quantum_geography.json** - Geographic distribution
- **quantum_org_over_time.json** - Top organizations over time
- **quantum_per_year.json** - Annual patent counts and share
- **quantum_quality.json** - Quality indicators
- **quantum_strategies.json** - Portfolio strategies
- **quantum_team_comparison.json** - Team size comparison
- **quantum_top_assignees.json** - Top assignees
- **quantum_top_inventors.json** - Top inventors

#### Semiconductors
**Directory:** `public/data/semiconductors/`

- **semi_assignee_type.json** - Assignee type distribution
- **semi_by_subfield.json** - Patents by semiconductor subfield
- **semi_diffusion.json** - Cross-domain diffusion
- **semi_geography.json** - Geographic distribution
- **semi_org_over_time.json** - Top organizations over time
- **semi_per_year.json** - Annual patent counts and share
- **semi_quality.json** - Quality indicators
- **semi_strategies.json** - Portfolio strategies
- **semi_team_comparison.json** - Team size comparison
- **semi_top_assignees.json** - Top assignees
- **semi_top_inventors.json** - Top inventors

#### Space Technology
**Directory:** `public/data/space/`

- **space_assignee_type.json** - Assignee type distribution
- **space_by_subfield.json** - Patents by space tech subfield
- **space_diffusion.json** - Cross-domain diffusion
- **space_geography.json** - Geographic distribution
- **space_org_over_time.json** - Top organizations over time
- **space_per_year.json** - Annual patent counts and share
- **space_quality.json** - Quality indicators
- **space_strategies.json** - Portfolio strategies
- **space_team_comparison.json** - Team size comparison
- **space_top_assignees.json** - Top assignees
- **space_top_inventors.json** - Top inventors

---

## Pipeline Scripts

### Configuration & Utilities
**Directory:** `data-pipeline/`

- **config.py** - Configuration management, path definitions, DuckDB table loading, JSON serialization
  - Input: TSV files from PatentsView (zipped)
  - Output: Helper functions for all scripts

- **domain_utils.py** - Shared utility for domain deep-dive pipelines
  - Input: CPC filter criteria, subfield mappings
  - Output: Standard domain analysis across 11 metrics

### Core Chapter Scripts

- **01_chapter1_landscape.py** - Chapter 1: The Innovation Landscape
  - Input: g_patent.tsv, g_application.tsv
  - Output: patents_per_year.json, patents_per_month.json, claims_per_year.json, grant_lag.json, hero_stats.json

- **02_chapter2_technology.py** - Chapter 2: The Technology Revolution
  - Input: g_patent.tsv, g_cpc_current.tsv, g_wipo_technology.tsv
  - Output: wipo_sectors_per_year.json, wipo_fields_per_year.json, cpc_sections_per_year.json, cpc_class_change.json, tech_diversity.json

- **03_chapter3_assignees.py** - Chapter 3: Who Owns Innovation
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv
  - Output: assignee_types_per_year.json, top_assignees.json, top_orgs_over_time.json, concentration.json, domestic_vs_foreign.json

- **04_chapter4_geography.py** - Chapter 4: The Geography of Innovation
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_location_disambiguated.tsv
  - Output: countries_per_year.json, us_states_per_year.json, us_states_summary.json, top_cities.json

- **05_chapter5_inventors.py** - Chapter 5: The Inventors
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv
  - Output: team_size_per_year.json, gender_per_year.json, prolific_inventors.json, inventor_entry.json

- **06_chapter6_citations.py** - Chapter 6: Knowledge Networks
  - Input: g_patent.tsv, g_us_patent_citation.tsv, g_gov_interest.tsv
  - Output: citations_per_year.json, citation_categories.json, citation_lag.json, gov_funded_per_year.json, gov_agencies.json

- **07_explore_data.py** - Explore Page Data
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_inventor_disambiguated.tsv, g_cpc_current.tsv, g_wipo_technology.tsv
  - Output: top_assignees_all.json, top_inventors_all.json, cpc_class_summary.json, wipo_field_summary.json

- **08_chapter7_dynamics.py** - Chapter 7: Innovation Dynamics
  - Input: g_patent.tsv, g_cpc_current.tsv, g_assignee_disambiguated.tsv
  - Output: innovation_velocity.json, corp_diversification.json, cross_domain.json, intl_collaboration.json

- **09_chapter3_firm_deep.py** - Chapter 3: Firm Deep Dive
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv, g_us_patent_citation.tsv
  - Output: firm_collaboration_network.json, firm_citation_impact.json, firm_tech_evolution.json, network_metrics_by_decade.json, non_us_by_section.json, bridge_inventors.json

- **10_chapter5_inventor_deep.py** - Chapter 5: Inventor Deep Dive
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_assignee_disambiguated.tsv
  - Output: inventor_collaboration_network.json, inventor_longevity.json, inventor_segments.json, inventor_segments_trend.json

- **11_chapter9_patent_quality.py** - Chapter 9: Patent Quality
  - Input: g_patent.tsv, g_us_patent_citation.tsv, g_cpc_current.tsv, g_location_disambiguated.tsv
  - Output: quality_trends.json, quality_by_sector.json, quality_by_country.json, originality_generality.json, self_citation_rate.json, self_citation_by_section.json, self_citation_by_assignee.json, breakthrough_patents.json

- **12_chapter11_ai_patents.py** - Chapter 11: AI Patents
  - Input: g_patent.tsv, g_cpc_current.tsv (filtered for G06N, G06F18, G06V, G10L15, G06F40)
  - Output: ai_patents_per_year.json, ai_by_subfield.json, ai_top_assignees.json, ai_top_inventors.json, ai_geography.json, ai_quality.json

- **13_inventor_movement.py** - Inventor Movement Analysis
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_location_disambiguated.tsv
  - Output: inventor_state_flows.json, inventor_country_flows.json, inventor_mobility_trend.json

- **14_chapter10_patent_law.py** - Chapter 10: Patent Law & Policy
  - Input: g_patent.tsv, g_application.tsv, g_cpc_current.tsv
  - Output: applications_vs_grants.json, hhi_by_section.json, convergence_matrix.json

- **15_chapter3_portfolio_diversity.py** - Chapter 3: Portfolio Diversity
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: portfolio_diversity.json

- **16_chapter5_superstar_solo_firsttime.py** - Chapter 5: Inventor Segments
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_cpc_current.tsv
  - Output: superstar_concentration.json, solo_inventors.json, solo_inventors_by_section.json, first_time_inventors.json, star_inventor_impact.json

- **17_chapter7_citation_lag.py** - Chapter 7: Citation Lag
  - Input: g_patent.tsv, g_us_patent_citation.tsv, g_cpc_current.tsv
  - Output: citation_lag.json, citation_lag_trend.json, citation_lag_by_section.json, grant_lag_by_sector.json

- **18_chapter9_composite_quality.py** - Chapter 9: Composite Quality
  - Input: g_patent.tsv, g_us_patent_citation.tsv, g_cpc_current.tsv, g_inventor_disambiguated.tsv
  - Output: composite_quality_index.json

- **19_chapter8_friction_maps.py** - Chapter 8: Technology Friction
  - Input: g_patent.tsv, g_cpc_current.tsv
  - Output: friction_map.json

- **20_chapter5_inventor_mobility.py** - Chapter 5: Inventor Mobility
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_assignee_disambiguated.tsv
  - Output: inventor_mobility.json, inventor_mobility_by_decade.json

- **21_chapter4_regional_specialization.py** - Chapter 4: Regional Specialization
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_location_disambiguated.tsv, g_cpc_current.tsv
  - Output: regional_specialization.json, state_specialization.json

- **22_chapter9_sleeping_beauty.py** - Chapter 9: Sleeping Beauties
  - Input: g_patent.tsv, g_us_patent_citation.tsv
  - Output: sleeping_beauties.json

- **23_chapter11_ai_deep.py** - Chapter 11: AI Deep Dive
  - Input: g_patent.tsv, g_cpc_current.tsv, g_assignee_disambiguated.tsv, g_inventor_disambiguated.tsv
  - Output: ai_assignee_type.json, ai_org_over_time.json, ai_team_comparison.json, ai_strategies.json, ai_gpt_diffusion.json

- **24_chapter2_technology_halflife.py** - Chapter 2: Technology Half-Life
  - Input: g_patent.tsv, g_us_patent_citation.tsv, g_wipo_technology.tsv
  - Output: technology_halflife.json, technology_decay_curves.json, technology_scurves.json, cpc_treemap.json

- **25_chapter5_gender_deep.py** - Chapter 5: Gender Analysis
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_cpc_current.tsv, g_wipo_technology.tsv
  - Output: gender_by_sector.json, gender_by_tech.json, gender_team_quality.json, gender_section_trend.json

- **26_chapter4_diffusion.py** - Chapter 4: Innovation Diffusion
  - Input: g_patent.tsv, g_cpc_current.tsv, g_location_disambiguated.tsv, g_inventor_disambiguated.tsv
  - Output: innovation_diffusion.json, innovation_diffusion_summary.json

- **27_chapter6_network_deep.py** - Chapter 6: Network Deep Dive
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_location_disambiguated.tsv
  - Output: co_invention_rates.json, co_invention_us_china_by_section.json

- **28_chapter12_topic_modeling.py** - Chapter 12: Topic Modeling
  - Input: g_patent.tsv, g_cpc_current.tsv, patent embeddings (external)
  - Output: topic_definitions.json, topic_prevalence.json, topic_novelty_trend.json, topic_novelty_top.json, topic_cpc_matrix.json, topic_umap.json

- **29_green_innovation.py** - Green Innovation Analysis
  - Input: g_patent.tsv, g_cpc_current.tsv (filtered for Y02/Y04S codes)
  - Output: green_volume.json, green_by_category.json, green_by_country.json, green_top_companies.json

- **30_batch_additions.py** - Batch additions and corrections
  - Input: Various sources
  - Output: Multiple supplementary files

- **31_company_name_mapping.py** - Company Name Standardization
  - Input: g_assignee_disambiguated.tsv
  - Output: company_name_mapping.json

- **32_company_profiles.py** - Company Profile Generation
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: company_profiles.json, company_milestones.json

- **33_trajectory_archetypes.py** - Firm Trajectory Archetypes
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: trajectory_archetypes.json

- **34_corporate_mortality.py** - Corporate Patent Portfolio Mortality
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv
  - Output: corporate_mortality.json

- **35_portfolio_strategy.py** - Portfolio Strategy Analysis
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: portfolio_diversification_b3.json, portfolio_overlap.json, patent_concentration.json

- **36_corporate_citations.py** - Corporate Citation Networks
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_us_patent_citation.tsv
  - Output: corporate_citation_network.json, citation_half_life.json

- **37_inventor_careers.py** - Inventor Career Trajectories
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: inventor_careers.json, comeback_inventors.json, inventor_drift.json

- **38_design_patents_claims.py** - Design Patents & Claims Analysis
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv
  - Output: design_patents.json, claims_analysis.json

- **39_talent_flows.py** - Talent Flows Between Organizations
  - Input: g_patent.tsv, g_inventor_disambiguated.tsv, g_assignee_disambiguated.tsv
  - Output: talent_flows.json

- **40_portfolio_strategy_profiles.py** - Portfolio Strategy Profiles
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: strategy_profiles.json, corporate_speed.json, tech_leadership.json, pivot_detection.json

- **41_firm_quality_distribution.py** - Firm Quality Distribution
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_us_patent_citation.tsv
  - Output: firm_quality_distribution.json, firm_quality_scatter.json, firm_quality_gini.json

- **42_firm_exploration_exploitation.py** - Exploration vs Exploitation
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: firm_exploration_scores.json, firm_exploration_scatter.json

- **43_firm_exploration_lifecycle.py** - Exploration Lifecycle
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv
  - Output: firm_exploration_lifecycle.json, firm_exploration_trajectories.json

- **44_firm_ambidexterity_quality.py** - Ambidexterity vs Quality
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv, g_cpc_current.tsv, g_us_patent_citation.tsv
  - Output: firm_ambidexterity_quality.json

- **45_fma_entry_identification.py** - FMA Entry Identification
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv
  - Output: Internal analysis

- **46_fma_match_rate.py** - FMA Match Rate Analysis
  - Input: g_patent.tsv, g_assignee_disambiguated.tsv
  - Output: Internal metrics

### Domain Deep Dive Scripts

- **47_semiconductors.py** - Semiconductors Deep Dive (H01L, H10N, H10K)
  - Uses: domain_utils.py
  - Output: 11 files in public/data/semiconductors/

- **48_quantum_computing.py** - Quantum Computing Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/quantum/

- **49_biotechnology.py** - Biotechnology Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/biotech/

- **50_autonomous_vehicles.py** - Autonomous Vehicles Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/av/

- **51_space_technology.py** - Space Technology Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/space/

- **52_cybersecurity.py** - Cybersecurity Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/cyber/

- **53_agricultural_technology.py** - Agricultural Technology Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/agtech/

- **54_digital_health.py** - Digital Health Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/digihealth/

- **55_3d_printing.py** - 3D Printing Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/3dprint/

- **56_blockchain.py** - Blockchain Deep Dive
  - Uses: domain_utils.py
  - Output: 11 files in public/data/blockchain/

- **57_green_supplement.py** - Green Innovation Supplement
  - Input: g_patent.tsv, g_cpc_current.tsv, g_assignee_disambiguated.tsv, g_inventor_disambiguated.tsv, g_location_disambiguated.tsv
  - Output: Comprehensive green innovation files (green_assignee_type.json, green_by_subfield.json, green_diffusion.json, green_geography.json, green_org_over_time.json, green_per_year.json, green_quality.json, green_strategies.json, green_team_comparison.json, green_top_assignees.json, green_top_inventors.json, green_ai_heatmap.json, green_ai_trend.json)

---

## Frontend Transformations

### Data Transformation Libraries

#### src/lib/formatters.ts
**Purpose:** Number and data formatting utilities

- `.toFixed()` - Format numbers to fixed decimal places (M/K notation, percentages, years)
- `Math.max()`, `Math.min()` - Clamp values to ranges
- `.slice()` - Slice arrays for moving averages
- `.reduce()` - Calculate averages for smoothing

**Key Functions:**
- `formatCompact(n)` - Format large numbers with M/K suffixes
- `formatPercent(n, decimals)` - Format percentages
- `formatYears(months)` - Convert months to year notation
- `movingAverage(data, window)` - Calculate moving averages

#### src/lib/chartTheme.ts
**Purpose:** Color and theme generation

- `Math.max()`, `Math.min()`, `Math.abs()` - Color interpolation clamping
- `parseInt()` - Parse hex color values
- `.toFixed()` - Format HSL color values
- `.slice()` - Extract hex color components

**Key Functions:**
- Color interpolation for gradients
- Hex to RGB conversion
- HSL color generation

#### src/lib/orgNames.ts
**Purpose:** Organization name cleanup and truncation

- `.slice()` - Truncate long organization names
- `.map()` - Transform organization data arrays

#### src/lib/referenceEvents.ts
**Purpose:** Filter reference events for charts

- `.filter()` - Filter events by year range and inclusion sets

### Chart Component Transformations

#### PWAreaChart.tsx
**Operations:**
- `.map()` - Transform data for stacked percentage areas
- `.reduce()` - Calculate totals for percentage conversion
- `.reverse()` - Reverse area order for rendering
- `.toFixed()` - Format percentage values

#### PWBarChart.tsx
**Operations:**
- `.map()` - Extract values for domain calculation
- `.reduce()` - Calculate averages
- `Math.min()`, `Math.max()` - Calculate chart domains
- `.reverse()` - Reverse bar order

#### PWLineChart.tsx
**Operations:**
- `.map()` - Render multiple lines
- `.slice()` - Truncate labels

#### PWBumpChart.tsx
**Operations:**
- `.map()` - Transform data to bump chart format
- `.sort()` - Sort years
- `.slice()` - Truncate organization names

#### PWScatterChart.tsx
**Operations:**
- `.map()` - Extract x/y values for centroids
- `.filter()` - Group data by categories
- `.reduce()` - Calculate category averages

#### PWNetworkGraph.tsx
**Operations:**
- `Math.max()` - Find max node/edge weights
- `Math.sqrt()` - Calculate node radii (square root scaling)
- `Math.min()`, `Math.max()` - Calculate bounding boxes
- `.filter()` - Filter valid edges
- `.map()` - Transform nodes/edges for simulation
- `.sort()` - Sort by connection count

#### PWRankHeatmap.tsx
**Operations:**
- `.map()` - Extract unique years
- `.sort()` - Sort rankings
- `.slice()` - Limit to top N organizations

#### PWBubbleScatter.tsx
**Operations:**
- `.map()` - Extract sections and group data
- `.filter()` - Filter by section and label set
- `Math.max()`, `Math.min()` - Calculate size domain

#### PWChoroplethMap.tsx
**Operations:**
- `.toFixed()` - Format compact numbers
- `Math.pow()`, `Math.floor()`, `Math.log10()`, `Math.ceil()` - Calculate nice maximum values
- `.sort()` - Sort states by value
- `.slice()` - Get top/bottom states

#### PWWorldFlowMap.tsx
**Operations:**
- `.filter()` - Filter valid flows with country centroids
- `.slice()` - Limit to top N flows
- `Math.max()` - Find maximum flow value
- `.map()` - Transform country totals
- `.sort()` - Sort flows and countries
- `Math.sqrt()` - Scale flow widths
- `Math.min()`, `Math.max()` - Clamp control points

#### PWConvergenceMatrix.tsx
**Operations:**
- `.filter()` - Filter by selected era
- `Math.pow()` - Apply gamma correction for visual scaling
- `.toFixed()` - Format percentage values

#### PWSankeyDiagram.tsx
**Operations:**
- `.map()` - Clone nodes and links for layout
- `Math.max()` - Calculate minimum stroke width
- `.slice()` - Truncate node labels

#### PWChordDiagram.tsx
**Operations:**
- `Math.min()` - Calculate chord diagram radius
- `.reduce()` - Calculate row/column totals
- `Math.PI` - Calculate arc positions
- `.slice()` - Truncate labels

#### PWTreemap.tsx
**Operations:**
- `Math.floor()` - Calculate max characters for labels
- `.slice()` - Truncate labels

#### PWSmallMultiples.tsx
**Operations:**
- `.map()` - Render multiple panels

#### PWSeriesSelector.tsx
**Operations:**
- `.filter()` - Filter series by search query
- `.map()` - Render series checkboxes
- `.slice()` - Get default series

#### TimeAnnotations.tsx
**Operations:**
- `.map()` - Extract annotations by category
- `.filter()` - Remove null entries

### Page-Level Transformations

#### Chapter Pages (Multiple)
**Common Patterns:**
- **Pivoting Data:** `.map()` + `.filter()` to transform time series by category
- **Extracting Unique Values:** `[...new Set(data.map(d => d.field))].sort()`
- **Sorting & Slicing:** `.sort()` + `.slice()` for top N rankings
- **Aggregations:** `.reduce()` for totals and averages
- **Filtering:** `.filter()` for year ranges, thresholds, categories
- **Percentage Calculations:** `.toFixed()` for formatting percentages

#### src/app/chapters/the-innovation-landscape/page.tsx
**Transformations:**
- Pivot monthly data by patent type
- Calculate cumulative agency funding
- Format lag values to years
- Truncate agency names

#### src/app/chapters/the-geography-of-innovation/page.tsx
**Transformations:**
- Extract top N countries
- Pivot countries by year
- Calculate percentage distributions by section
- Filter and sort specializations by location quotient
- Map state flows to Sankey format

#### src/app/chapters/green-innovation/page.tsx
**Transformations:**
- Pivot categories by year for stacked areas
- Aggregate organizations from time series
- Build AI-green heatmap matrix
- Sort and slice top strategies

#### Domain Chapter Pages (Semiconductors, Quantum, Space, AV, Blockchain, etc.)
**Common Transformations:**
- Pivot subfields by year
- Rank organizations by year
- Group countries and states
- Calculate strategy totals
- Build diffusion matrices
- Compare team sizes

#### src/app/explore/page.tsx
**Transformations:**
- `.filter()` - Search filtering by organization/inventor name
- `.slice()` - Limit to 100 results
- `.sort()` - Custom sort by field

#### src/app/HomeContent.tsx
**Transformations:**
- `Math.min()`, `Math.pow()` - Easing function for counter animation
- `Math.round()` - Round animated values
- `.toFixed()` - Format final values
- `.map()` - Render chapter cards

### Component Helper Transformations

#### RelatedChapters.tsx
**Operations:**
- `.map()` - Map chapter numbers to chapter objects
- `.filter(Boolean)` - Remove null chapters

#### ChapterTableOfContents.tsx
**Operations:**
- `.filter()` - Filter intersecting sections

#### RankingTable.tsx
**Operations:**
- `.map()` - Render table headers and rows

#### PWCompanySelector.tsx
**Operations:**
- `.filter()` - Filter companies by search query

#### PWRadarChart.tsx
**Operations:**
- `.toFixed()` - Format tick values

#### PWFanChart.tsx
**Operations:**
- `.map()` - Transform data for fan visualization

#### MobileNav.tsx, ChapterSidebar.tsx
**Operations:**
- `.map()` - Render navigation items from chapter data

#### ReadingProgress.tsx
**Operations:**
- `Math.min()` - Calculate scroll progress percentage

### Summary of Transformation Patterns

**Most Common Operations:**

1. **Array Mapping (`.map()`)** - 500+ occurrences
   - Transform data structures
   - Render lists of components
   - Extract specific fields

2. **Array Filtering (`.filter()`)** - 300+ occurrences
   - Search/query filtering
   - Year range filtering
   - Category filtering
   - Remove nulls/invalid data

3. **Array Sorting (`.sort()`)** - 200+ occurrences
   - Rank organizations/inventors
   - Sort by year
   - Sort by count/value

4. **Array Slicing (`.slice()`)** - 150+ occurrences
   - Top N rankings
   - Truncate long strings
   - Limit results

5. **Math Operations** - 100+ occurrences
   - `Math.max()`, `Math.min()` - Domain calculation, clamping
   - `Math.sqrt()` - Scale node sizes
   - `Math.pow()` - Easing, gamma correction
   - `Math.floor()`, `Math.ceil()` - Rounding

6. **Number Formatting (`.toFixed()`)** - 100+ occurrences
   - Format percentages
   - Format decimals
   - Format compact notation

7. **Array Reduction (`.reduce()`)** - 80+ occurrences
   - Calculate totals
   - Calculate averages
   - Build aggregated objects

8. **String Parsing** - 40+ occurrences
   - `parseInt()` - Parse color values, numbers
   - `parseFloat()` - Parse decimal values

**Data Flow Patterns:**

1. **Pivot Tables:** Raw data → `.map(year)` → `.filter(year)` → `.forEach()` to build pivoted object
2. **Top N Rankings:** Data → `.sort()` → `.slice(0, N)`
3. **Category Extraction:** `[...new Set(data.map(d => d.category))].sort()`
4. **Search Filtering:** `data.filter(d => d.name.toLowerCase().includes(query))`
5. **Percentage Stacking:** `.map()` to calculate totals → `.map()` to convert to percentages

---

## Data Lineage Notes

### Source Data
- **Primary Source:** PatentsView TSV files (g_patent, g_application, g_assignee_disambiguated, g_inventor_disambiguated, g_location_disambiguated, g_cpc_current, g_wipo_technology, g_us_patent_citation, g_foreign_citation, g_gov_interest, g_gov_interest_org)
- **Processing:** DuckDB SQL queries via Python
- **Date Range:** 1976-2025 (configurable per analysis)

### Data Quality Considerations
- Patent IDs forced to VARCHAR to handle non-numeric IDs (e.g., RE32443)
- Missing/null values handled with COALESCE
- Ignore_errors enabled for malformed rows
- Max line size: 10MB for large text fields

### Naming Conventions
- Files use snake_case (e.g., `patents_per_year.json`)
- Domain slugs: semi, quantum, av, biotech, agtech, cyber, digihealth, space, blockchain
- Chapter files prefixed by chapter number (chapter1/, chapter2/, etc.)

### Update Frequency
- Scripts run on-demand
- No automated scheduling
- Manual execution required for updates

---

**Total Inventory Summary:**
- **262 JSON data files** across 18 directories
- **57 Python ETL scripts** (including config.py and domain_utils.py)
- **500+ inline transformations** across 40+ React components
- **Source data:** PatentsView bulk downloads (11 TSV tables)
- **Time span:** 1976-2025 (50 years of US patent data)

---

**End of Inventory**
