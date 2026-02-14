# PatentWorld — Company-Level Analysis Log (Stream 4)

## Overview

Stream 4 added 10 new company-level analyses across 5 chapters, supported by 10 new data pipeline scripts, 4 new chart components, and 1 new chapter page. All data is precomputed as static JSON files; no heavy computation occurs in the browser.

## Analyses Implemented

### 4.2.1 Innovation Trajectory Profiles (Chapter 14: Company Innovation Profiles)
- **Location**: `/chapters/company-profiles/page.tsx`, Section A1
- **Data**: `public/data/company/company_profiles.json` (1.2 MB, 100 companies)
- **Pipeline**: `data-pipeline/32_company_profiles.py`
- **Visualization**: Interactive company selector (PWCompanySelector) with 5 synchronized panels:
  - Annual patent output (PWBarChart)
  - Technology portfolio evolution — CPC section distribution (PWAreaChart, stacked percentage)
  - Citation impact over time (PWLineChart)
  - Team size and inventor pool (PWLineChart, dual axis)
  - Technology breadth (PWLineChart)
- **Metrics per year per company**: patent_count, cpc_breadth, inventor_count, avg_team_size, median_citations_5yr, cpc_distribution

### 4.2.2 Rise, Peak, Decline — Trajectory Archetypes (Chapter 14)
- **Location**: `/chapters/company-profiles/page.tsx`, Section A2
- **Data**: `public/data/company/trajectory_archetypes.json` (84 KB, 200 companies)
- **Pipeline**: `data-pipeline/33_trajectory_archetypes.py`
- **Visualization**: Gallery of 6 archetype cards with centroid silhouette curves (PWLineChart), plus filterable/searchable company table
- **Archetypes identified**: Plateau, Boom & Bust, Late Bloomer, Fading Giant, Steady Grower, Reviver (exact names from clustering output)

### 4.2.3 Corporate Innovation Mortality (Chapter 14)
- **Location**: `/chapters/company-profiles/page.tsx`, Section A3
- **Data**: `public/data/company/corporate_mortality.json` (33 KB)
- **Pipeline**: `data-pipeline/34_corporate_mortality.py`
- **Visualization**: PWRankHeatmap of top 50 companies across 5 decades, survival rate statistics, continuous survivor badges
- **Metrics**: Decade-over-decade survival rates, continuous top-50 companies, rank tracking

### 4.2.4 Technology Portfolio Diversification (Chapter 14)
- **Location**: `/chapters/company-profiles/page.tsx`, Section B1
- **Data**: `public/data/company/portfolio_diversification_b3.json` (159 KB, 1,998 company-year observations)
- **Pipeline**: `data-pipeline/35_portfolio_strategy.py`
- **Visualization**: PWLineChart (Shannon entropy over time for top 10), PWScatterChart (entropy vs. citation quality)

### 4.2.5 Technology Pivot Detection (Chapter 14)
- **Location**: `/chapters/company-profiles/page.tsx`, Section B2
- **Data**: `public/data/company/pivot_detection.json` (112 KB, 803 company-window observations)
- **Pipeline**: `data-pipeline/35_portfolio_strategy.py`
- **Visualization**: PWBarChart (JSD scores per window for selected company), table of top 30 detected pivots with gaining/losing CPC sections
- **Method**: Jensen-Shannon divergence between consecutive 5-year windows; 95th percentile threshold for pivot flagging

### 4.2.6 Corporate Citation Network (Chapter 7: The Knowledge Network)
- **Location**: `/chapters/the-knowledge-network/page.tsx`, Sections C1-C3
- **Data**: `public/data/company/corporate_citation_network.json` (248 KB, 3,274 directed flows), `public/data/company/tech_leadership.json` (43 KB), `public/data/company/citation_half_life.json` (4.4 KB)
- **Pipeline**: `data-pipeline/36_corporate_citations.py`
- **Visualization**: PWChordDiagram with decade selector showing inter-company citation flows, tech leadership tables, citation half-life bar chart

### 4.2.7 Talent Flow Network (Chapter 6: Collaboration Networks)
- **Location**: `/chapters/collaboration-networks/page.tsx`, Section F1
- **Data**: `public/data/company/talent_flows.json` (81 KB, nodes + directed links)
- **Pipeline**: `data-pipeline/39_talent_flows.py`
- **Visualization**: PWSankeyDiagram showing inventor movements between top companies

### 4.2.8 Defensive vs. Offensive Patent Strategy Profiles (Chapter 6: Collaboration Networks)
- **Location**: `/chapters/collaboration-networks/page.tsx`, Sections F2-F3
- **Data**: `public/data/company/strategy_profiles.json` (4.8 KB, 30 companies), `public/data/company/portfolio_overlap.json` (25 KB, 248 points)
- **Pipeline**: `data-pipeline/40_portfolio_strategy_profiles.py`
- **Visualization**: PWRadarChart with company comparison mode (8 dimensions: breadth, depth, defensiveness, influence, science_intensity, speed, collaboration, freshness), PWScatterChart (UMAP competitive proximity map)

### 4.2.9 Design Patent Ecosystem (Chapter 8: Innovation Dynamics)
- **Location**: `/chapters/innovation-dynamics/page.tsx`, Section E1
- **Data**: `public/data/company/design_patents.json` (4.8 KB)
- **Pipeline**: `data-pipeline/38_design_patents_claims.py`
- **Visualization**: PWLineChart (utility vs. design patent trends with design share), PWBarChart (top 20 design patent filers, horizontal)

### 4.2.10 The Claims Economy (Chapter 8: Innovation Dynamics)
- **Location**: `/chapters/innovation-dynamics/page.tsx`, Section E2
- **Data**: `public/data/company/claims_analysis.json` (8.7 KB)
- **Pipeline**: `data-pipeline/38_design_patents_claims.py`
- **Visualization**: PWLineChart (median and 90th percentile claims over time), PWLineChart (median claims by CPC section × decade), table of top 15 "claim monsters"

## Additional Analyses (Supporting Data)

### Inventor Careers, Drift, and Comebacks (Chapter 4: The Inventors)
- **Data**: `public/data/company/inventor_careers.json` (6.2 KB), `public/data/company/inventor_drift.json` (636 B), `public/data/company/comeback_inventors.json` (1.4 KB)
- **Pipeline**: `data-pipeline/37_inventor_careers.py`
- **Visualization**: Career productivity curves, specialist/generalist classification, comeback inventor profiles

### Corporate Speed (Chapter 6: Collaboration Networks)
- **Data**: `public/data/company/corporate_speed.json` (213 KB, 1,936 observations)
- **Pipeline**: `data-pipeline/39_talent_flows.py`
- **Visualization**: Grant lag trends by company

### Patent Market Concentration (Chapter 14)
- **Data**: `public/data/company/patent_concentration.json` (20 KB, 400 section-year observations)
- **Pipeline**: `data-pipeline/35_portfolio_strategy.py`
- **Visualization**: PWLineChart (HHI by CPC section over time)

## New Components Created

| Component | File | Purpose |
|-----------|------|---------|
| PWChordDiagram | `src/components/charts/PWChordDiagram.tsx` | D3-based chord diagram for inter-company citation flows |
| PWSankeyDiagram | `src/components/charts/PWSankeyDiagram.tsx` | D3-based Sankey diagram for talent flow networks |
| PWRadarChart | `src/components/charts/PWRadarChart.tsx` | Recharts radar/spider chart for strategy profiles |
| PWCompanySelector | `src/components/charts/PWCompanySelector.tsx` | Searchable dropdown for company selection |

## New Chapter Page

- **Chapter 14: Company Innovation Profiles** (`src/app/chapters/company-profiles/page.tsx`)
  - 828 lines, 13 chart containers, 6 major sections
  - Interactive company selector with 5 synchronized dashboard panels
  - Trajectory archetype gallery with filterable table
  - Corporate mortality rank heatmap
  - Portfolio diversification and pivot detection analyses
  - Patent market concentration analysis

## Data Pipeline Scripts

| Script | Analyses | Output Files | Dependencies |
|--------|----------|--------------|--------------|
| `31_company_name_mapping.py` | Name mapping | `company_name_mapping.json` | DuckDB |
| `32_company_profiles.py` | 4.2.1 | `company_profiles.json` | DuckDB |
| `33_trajectory_archetypes.py` | 4.2.2 | `trajectory_archetypes.json` | scikit-learn |
| `34_corporate_mortality.py` | 4.2.3 | `corporate_mortality.json` | DuckDB |
| `35_portfolio_strategy.py` | 4.2.4, 4.2.5, B3 | `portfolio_diversification_b3.json`, `pivot_detection.json`, `patent_concentration.json` | DuckDB |
| `36_corporate_citations.py` | 4.2.6 | `corporate_citation_network.json`, `tech_leadership.json`, `citation_half_life.json` | DuckDB |
| `37_inventor_careers.py` | D1-D3 | `inventor_careers.json`, `inventor_drift.json`, `comeback_inventors.json` | DuckDB |
| `38_design_patents_claims.py` | 4.2.9, 4.2.10 | `design_patents.json`, `claims_analysis.json` | DuckDB |
| `39_talent_flows.py` | 4.2.7, F4 | `talent_flows.json`, `corporate_speed.json` | DuckDB |
| `40_portfolio_strategy_profiles.py` | 4.2.8 | `portfolio_overlap.json`, `strategy_profiles.json` | scikit-learn, umap-learn |

## Supporting Files Modified

| File | Changes |
|------|---------|
| `src/lib/types.ts` | Added ~30 new interfaces for company-level data types |
| `src/lib/constants.ts` | Added Chapter 14 to CHAPTERS array, updated relatedChapters |
| `src/lib/colors.ts` | Added ARCHETYPE_COLORS, INDUSTRY_COLORS |
| `src/components/chapter/ChapterHeader.tsx` | Added gradient for chapter 14 |

## Analyses Skipped

None. All 10 analyses specified in Formatting.md Section 4.2 were implemented. Data availability in PatentsView was sufficient for all analyses.

## Data Files Summary

| File | Size | Records |
|------|------|---------|
| company_profiles.json | 1.2 MB | 100 companies |
| trajectory_archetypes.json | 84 KB | 200 companies |
| corporate_mortality.json | 33 KB | 5 decades |
| portfolio_diversification_b3.json | 159 KB | 1,998 observations |
| pivot_detection.json | 112 KB | 803 observations |
| patent_concentration.json | 20 KB | 400 observations |
| corporate_citation_network.json | 248 KB | 3,274 flows |
| tech_leadership.json | 43 KB | 440 entries |
| citation_half_life.json | 4.4 KB | 49 companies |
| inventor_careers.json | 6.2 KB | curves + durations |
| inventor_drift.json | 636 B | 6 categories |
| comeback_inventors.json | 1.4 KB | 11 inventors |
| design_patents.json | 4.8 KB | trends + top filers |
| claims_analysis.json | 8.7 KB | trends + sections + monsters |
| talent_flows.json | 81 KB | nodes + links |
| portfolio_overlap.json | 25 KB | 248 points |
| strategy_profiles.json | 4.8 KB | 30 companies |
| corporate_speed.json | 213 KB | 1,936 observations |
| company_name_mapping.json | 9 KB | 200 mappings |
| company_milestones.json | 5.3 KB | 20 companies |

**Total data footprint**: ~2.3 MB
