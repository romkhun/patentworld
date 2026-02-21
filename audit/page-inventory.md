# PatentWorld Page & Visualization Inventory

Updated: 2026-02-21 (Audit Section 1.3 -- Full Recount)

---

## Summary

| Metric | Count |
|--------|-------|
| Total page.tsx files under src/app/ | 40 |
| Chapter pages (numbered 1-34, in CHAPTERS array) | 34 |
| Extra chapter page (deep-dive-overview, not in CHAPTERS) | 1 |
| Non-chapter pages (Home, About, Explore, FAQ, Methodology) | 5 |
| Total ChartContainer instances (chapters + overview) | 458 |
| ChartContainer on homepage (HomeContent.tsx) | 1 |
| Grand total ChartContainer site-wide | 459 |
| Total PW* component instances (chapters + overview) | 463 |
| HERO_STATS.visualizations claim | 458 |

**Verification:** The `HERO_STATS.visualizations` value of **458** matches the chapter-only `<ChartContainer>` count exactly. The homepage adds 1 additional visualization (a featured PWAreaChart), bringing the true site-wide total to 459. The PW* component count (463) exceeds ChartContainer (458) by 5 because: (a) some PW* components render outside ChartContainers (PWTimeline, PWSparkline, PWCompanySelector, PWSeriesSelector); (b) some ChartContainers wrap conditionally toggled PW* pairs (e.g., PWAreaChart/PWSmallMultiples toggle); (c) one ChartContainer wraps a raw Recharts ScatterChart. All standard visualizations are rendered inside `<ChartContainer>` wrappers.

---

## Act Chapter Counts

| Act | Title | Chapters | Count | Verified |
|-----|-------|----------|-------|----------|
| 1 | The System | 1-7 | 7 | Yes |
| 2 | The Organizations | 8-12 | 5 | Yes |
| 3 | The Inventors | 13-17 | 5 | Yes |
| 4 | The Geography | 18-19 | 2 | Yes |
| 5 | The Mechanics | 20-22 | 3 | Yes |
| 6 | Deep Dives | 23-34 | 12 | Yes |
| **Total** | | | **34** | **7 + 5 + 5 + 2 + 3 + 12 = 34** |

---

## Chapter Pages (34 numbered + 1 overview)

### Act 1: The System (7 chapters, 68 visualizations)

| # | File Path | Route | Title | Act | CC | PW* Breakdown |
|---|-----------|-------|-------|-----|----|---------------|
| 1 | src/app/chapters/system-patent-count/page.tsx | /chapters/system-patent-count/ | Patent Count | Act 1 | 6 | 4 PWLineChart, 2 PWAreaChart |
| 2 | src/app/chapters/system-patent-quality/page.tsx | /chapters/system-patent-quality/ | Patent Quality | Act 1 | 16 | 13 PWLineChart, 2 PWBarChart, 1 PWScatterChart |
| 3 | src/app/chapters/system-patent-fields/page.tsx | /chapters/system-patent-fields/ | Patent Fields | Act 1 | 21 | 13 PWLineChart, 4 PWBarChart, 2 PWAreaChart, 1 PWValueHeatmap, 1 PWTreemap |
| 4 | src/app/chapters/system-convergence/page.tsx | /chapters/system-convergence/ | Convergence | Act 1 | 7 | 5 PWLineChart, 1 PWConvergenceMatrix, 1 PWAreaChart |
| 5 | src/app/chapters/system-language/page.tsx | /chapters/system-language/ | The Language of Innovation | Act 1 | 4 | 1 PWAreaChart, 1 PWSmallMultiples (toggle), 1 PWScatterChart, 1 PWBarChart, 1 PWLineChart |
| 6 | src/app/chapters/system-patent-law/page.tsx | /chapters/system-patent-law/ | Patent Law & Policy | Act 1 | 8 | 6 PWLineChart, 2 PWBarChart + 1 PWTimeline (outside CC) |
| 7 | src/app/chapters/system-public-investment/page.tsx | /chapters/system-public-investment/ | Public Investment | Act 1 | 6 | 3 PWBarChart, 1 PWValueHeatmap, 1 PWLineChart + 1 raw ScatterChart |
| | | | **Act 1 subtotal** | | **68** | |

### Act 2: The Organizations (5 chapters, 41 visualizations)

| # | File Path | Route | Title | Act | CC | PW* Breakdown |
|---|-----------|-------|-------|-----|----|---------------|
| 8 | src/app/chapters/org-composition/page.tsx | /chapters/org-composition/ | Assignee Composition | Act 2 | 6 | 3 PWAreaChart, 2 PWLineChart, 1 PWBarChart |
| 9 | src/app/chapters/org-patent-count/page.tsx | /chapters/org-patent-count/ | Organizational Patent Count | Act 2 | 6 | 2 PWLineChart, 2 PWBarChart, 1 PWLorenzCurve, 1 PWLollipopChart + 1 PWSeriesSelector (outside CC) |
| 10 | src/app/chapters/org-patent-quality/page.tsx | /chapters/org-patent-quality/ | Organizational Patent Quality | Act 2 | 12 | 5 PWLineChart, 5 PWBarChart, 1 PWFanChart, 1 PWBubbleScatter + 1 PWCompanySelector (outside CC) |
| 11 | src/app/chapters/org-patent-portfolio/page.tsx | /chapters/org-patent-portfolio/ | Patent Portfolio | Act 2 | 5 | 3 PWBarChart, 1 PWScatterChart, 1 PWLineChart |
| 12 | src/app/chapters/org-company-profiles/page.tsx | /chapters/org-company-profiles/ | Interactive Company Profiles | Act 2 | 12 | 5 PWLineChart, 3 PWBarChart, 2 PWFanChart, 2 PWAreaChart, 1 PWRadarChart + 1 PWCompanySelector (outside CC) |
| | | | **Act 2 subtotal** | | **41** | |

### Act 3: The Inventors (5 chapters, 65 visualizations)

| # | File Path | Route | Title | Act | CC | PW* Breakdown |
|---|-----------|-------|-------|-----|----|---------------|
| 13 | src/app/chapters/inv-top-inventors/page.tsx | /chapters/inv-top-inventors/ | Top Inventors | Act 3 | 13 | 9 PWLineChart, 2 PWBarChart, 1 PWLollipopChart |
| 14 | src/app/chapters/inv-generalist-specialist/page.tsx | /chapters/inv-generalist-specialist/ | Generalist vs. Specialist | Act 3 | 10 | 8 PWLineChart, 1 PWBarChart, 1 PWAreaChart |
| 15 | src/app/chapters/inv-serial-new/page.tsx | /chapters/inv-serial-new/ | Serial Inventors vs. New Entrants | Act 3 | 14 | 11 PWLineChart, 2 PWBarChart, 1 PWAreaChart |
| 16 | src/app/chapters/inv-gender/page.tsx | /chapters/inv-gender/ | Gender and Patenting | Act 3 | 13 | 11 PWLineChart, 2 PWBarChart |
| 17 | src/app/chapters/inv-team-size/page.tsx | /chapters/inv-team-size/ | Team Size and Collaboration | Act 3 | 15 | 11 PWLineChart, 2 PWBarChart, 2 PWCoefficientPlot |
| | | | **Act 3 subtotal** | | **65** | |

### Act 4: The Geography (2 chapters, 31 visualizations)

| # | File Path | Route | Title | Act | CC | PW* Breakdown |
|---|-----------|-------|-------|-----|----|---------------|
| 18 | src/app/chapters/geo-domestic/page.tsx | /chapters/geo-domestic/ | Domestic Geography | Act 4 | 16 | 10 PWLineChart, 4 PWBarChart, 1 PWLollipopChart, 1 PWChoroplethMap |
| 19 | src/app/chapters/geo-international/page.tsx | /chapters/geo-international/ | International Geography | Act 4 | 15 | 14 PWLineChart, 1 PWBarChart |
| | | | **Act 4 subtotal** | | **31** | |

### Act 5: The Mechanics (3 chapters, 27 visualizations)

| # | File Path | Route | Title | Act | CC | PW* Breakdown |
|---|-----------|-------|-------|-----|----|---------------|
| 20 | src/app/chapters/mech-organizations/page.tsx | /chapters/mech-organizations/ | Organizational Mechanics | Act 5 | 10 | 3 PWSmallMultiples, 1 PWTrajectoryScatter, 1 PWNetworkGraph, 1 PWLineChart, 1 PWCompanySelector, 1 PWChordDiagram, 1 PWBubbleScatter, 1 PWBarChart, 1 PWAreaChart |
| 21 | src/app/chapters/mech-inventors/page.tsx | /chapters/mech-inventors/ | Inventor Mechanics | Act 5 | 13 | 5 PWLineChart, 3 PWBarChart, 2 PWSankeyDiagram, 1 PWWorldFlowMap, 1 PWNetworkGraph |
| 22 | src/app/chapters/mech-geography/page.tsx | /chapters/mech-geography/ | Geographic Mechanics | Act 5 | 4 | 3 PWLineChart, 1 PWAreaChart |
| | | | **Act 5 subtotal** | | **27** | |

### Act 6: Deep Dives (12 chapters + 1 overview, 226 visualizations)

| # | File Path | Route | Title | Act | CC | PW* Breakdown |
|---|-----------|-------|-------|-----|----|---------------|
| -- | src/app/chapters/deep-dive-overview/page.tsx | /chapters/deep-dive-overview/ | ACT 6 Overview -- Cross-Domain Comparison | Act 6 (overview) | 5 | 3 PWBarChart, 2 PWSmallMultiples + 1 PWSparkline (outside CC) |
| 23 | src/app/chapters/3d-printing/page.tsx | /chapters/3d-printing/ | 3D Printing & Additive Manufacturing | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 24 | src/app/chapters/agricultural-technology/page.tsx | /chapters/agricultural-technology/ | Agricultural Technology | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 25 | src/app/chapters/ai-patents/page.tsx | /chapters/ai-patents/ | Artificial Intelligence | Act 6 | 19 | 10 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 26 | src/app/chapters/autonomous-vehicles/page.tsx | /chapters/autonomous-vehicles/ | Autonomous Vehicles & ADAS | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 27 | src/app/chapters/biotechnology/page.tsx | /chapters/biotechnology/ | Biotechnology & Gene Editing | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 28 | src/app/chapters/blockchain/page.tsx | /chapters/blockchain/ | Blockchain & Decentralized Systems | Act 6 | 19 | 10 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 29 | src/app/chapters/cybersecurity/page.tsx | /chapters/cybersecurity/ | Cybersecurity | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 30 | src/app/chapters/digital-health/page.tsx | /chapters/digital-health/ | Digital Health & Medical Devices | Act 6 | 19 | 9 PWLineChart, 5 PWBarChart, 4 PWAreaChart, 1 PWRankHeatmap |
| 31 | src/app/chapters/green-innovation/page.tsx | /chapters/green-innovation/ | Green Innovation | Act 6 | 19 | 10 PWLineChart, 4 PWBarChart, 4 PWAreaChart, 1 PWRankHeatmap |
| 32 | src/app/chapters/quantum-computing/page.tsx | /chapters/quantum-computing/ | Quantum Computing | Act 6 | 19 | 9 PWLineChart, 6 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 33 | src/app/chapters/semiconductors/page.tsx | /chapters/semiconductors/ | Semiconductors | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| 34 | src/app/chapters/space-technology/page.tsx | /chapters/space-technology/ | Space Technology | Act 6 | 18 | 9 PWLineChart, 5 PWBarChart, 3 PWAreaChart, 1 PWRankHeatmap |
| | | | **Act 6 subtotal** | | **226** | |

---

## Non-Chapter Pages (5 pages)

| # | File Path | Route | Title | Viz Count | Notes |
|---|-----------|-------|-------|-----------|-------|
| -- | src/app/page.tsx + src/app/HomeContent.tsx | / | PatentWorld -- 50 Years of US Patent Data | 1 | 1 ChartContainer + 1 PWAreaChart; hero stats counters; chapter cards; FAQ JSON-LD |
| -- | src/app/about/page.tsx | /about/ | 9.36M US Patents Analyzed: Data & Methodology | 0 | Author bio, chapter list, data source, methodology summary, FAQ accordion, citation, technical details |
| -- | src/app/explore/page.tsx | /explore/ | Explore | 0 | Client-side data tables with search/sort (Organizations, Inventors, CPC Classes, WIPO Fields); no chart components |
| -- | src/app/faq/page.tsx | /faq/ | Top 10 Patent FAQs: IBM, AI Growth & Gender Gap | 0 | 10 FAQ items with expandable answers; FAQ JSON-LD; citation block |
| -- | src/app/methodology/page.tsx | /methodology/ | Data Dictionary & Methodology | 0 | Patent universe, temporal coverage, geography basis, field classification, data processing, metric definitions, disambiguation, limitations, data source |

---

## Infrastructure Files (not page routes)

| File Path | Type | Notes |
|-----------|------|-------|
| src/app/sitemap.ts | Sitemap generator | Generates sitemap.xml with all 34 chapter URLs, deep-dive-overview, and 5 non-chapter pages (41 URLs total) |
| src/app/chapters/layout.tsx | Shared chapter layout | Root layout for all chapter pages |
| src/app/chapters/*/layout.tsx | Per-chapter layout | 35 layout files (34 chapters + deep-dive-overview); handles metadata and JSON-LD |

No 404/not-found page exists. No error.tsx boundary exists.

---

## Chart Component Library (30 files)

Located in `src/components/charts/`:

| Component | Type | Instances Used | Description |
|-----------|------|---------------|-------------|
| ChartContainer.tsx | Wrapper | 458 (chapters) + 1 (home) = 459 | Lazy-loading container with title, subtitle, caption, insight, CiteThisFigure |
| CiteThisFigure.tsx | Utility | (auto) | Figure citation UI component |
| PWLineChart.tsx | Recharts | 252 | Multi-series line charts |
| PWBarChart.tsx | Recharts | 106 | Horizontal/vertical bar charts |
| PWAreaChart.tsx | Recharts | 53 | Stacked/standard area charts |
| PWRankHeatmap.tsx | Custom | 12 | Rank heatmap grids (Deep Dives) |
| PWSmallMultiples.tsx | Recharts | 5 | Small multiples grid layout |
| PWLollipopChart.tsx | Recharts | 3 | Lollipop charts |
| PWFanChart.tsx | Recharts | 3 | Fan/uncertainty charts |
| PWScatterChart.tsx | Recharts | 3 | Scatter plots |
| PWCoefficientPlot.tsx | Recharts | 2 | Coefficient/forest plots |
| PWNetworkGraph.tsx | D3 | 2 | Force-directed network graphs |
| PWSankeyDiagram.tsx | D3 | 2 | Sankey flow diagrams |
| PWBubbleScatter.tsx | Recharts | 2 | Bubble scatter plots |
| PWValueHeatmap.tsx | Custom | 2 | Value-based heatmap grids |
| PWChoroplethMap.tsx | D3 | 1 | Geographic choropleth maps |
| PWWorldFlowMap.tsx | D3 | 1 | World map with flow arrows |
| PWChordDiagram.tsx | D3 | 1 | Chord diagrams for flow data |
| PWTrajectoryScatter.tsx | Recharts | 1 | Trajectory scatter with arrows |
| PWRadarChart.tsx | Recharts | 1 | Radar/spider charts |
| PWLorenzCurve.tsx | Recharts | 1 | Lorenz curves with Gini coefficient |
| PWConvergenceMatrix.tsx | Custom | 1 | Technology convergence matrix |
| PWTreemap.tsx | Recharts | 1 | Treemap visualizations |
| PWTimeline.tsx | Custom | 1 | Event timeline with annotations |
| PWSparkline.tsx | Recharts | 1 | Inline sparkline charts |
| PWCompanySelector.tsx | Interactive | 3 | Company selection dropdown for profiles (outside CC) |
| PWSeriesSelector.tsx | Interactive | 1 | Series toggle for multi-line charts (outside CC) |
| PWBumpChart.tsx | Recharts | 0 | Bump/rank charts (defined but unused) |
| PWSlopeChart.tsx | Custom | 0 | Slope charts for period comparisons (defined but unused) |
| TimeAnnotations.tsx | Utility | (auto) | Reference event annotations overlay |

**Total PW* component instances inside ChartContainers:** 455 (458 CC - 2 with raw Recharts - 1 with no PW child)
**Total PW* instances including outside ChartContainers:** 463

---

## Visualization Component Type Summary

| Component Type | Count | % of 458 |
|----------------|-------|----------|
| PWLineChart | 252 | 55.0% |
| PWBarChart | 106 | 23.1% |
| PWAreaChart | 53 | 11.6% |
| PWRankHeatmap | 12 | 2.6% |
| All other types (18 types) | 35 | 7.6% |
| **Total** | **458** | **100%** |

---

## Visualization Totals

| Grouping | Viz Count |
|----------|-----------|
| Act 1: The System (7 chapters) | 68 |
| Act 2: The Organizations (5 chapters) | 41 |
| Act 3: The Inventors (5 chapters) | 65 |
| Act 4: The Geography (2 chapters) | 31 |
| Act 5: The Mechanics (3 chapters) | 27 |
| Act 6: Deep Dives (12 chapters + overview) | 226 |
| **All chapters total** | **458** |
| Homepage (HomeContent.tsx) | 1 |
| About, Explore, FAQ, Methodology | 0 |
| **Site-wide grand total** | **459** |

### Verification Checks

- Total chapters: **34** (matches HERO_STATS.chapters = 34, matches CHAPTERS.length = 34)
- Total visualizations (chapters): **458** (matches HERO_STATS.visualizations = 458)
- Act chapter counts: **7 + 5 + 5 + 2 + 3 + 12 = 34** (verified against ACT_GROUPINGS)
- deep-dive-overview exists as an additional page outside the 34 numbered chapters (5 visualizations, included in the 458 total)
- No sitemap page route (sitemap.ts generates XML at build time)
- No 404/not-found page exists
- No error boundary page exists

### Counting Methodology

1. **ChartContainer count (458):** Counted by `grep -oE '<ChartContainer' <file> | wc -l` across all 35 chapter page.tsx files. This is the authoritative visualization count because every distinct figure in the project is wrapped in exactly one ChartContainer.

2. **PW* component count (463):** Counted by `grep -oE '<PW[A-Z][A-Za-z]+' <file> | wc -l`. The 5-instance surplus over ChartContainer arises from:
   - 1 PWTimeline rendered outside a ChartContainer (system-patent-law)
   - 1 PWSparkline rendered outside a ChartContainer (deep-dive-overview)
   - 1 PWSeriesSelector rendered outside a ChartContainer (org-patent-count)
   - 2 PWCompanySelector instances rendered outside ChartContainers (org-patent-quality, org-company-profiles)
   - Offset by 3 ChartContainers that wrap raw Recharts or conditional toggles rather than a single PW* component

3. **Figure manifest:** All 458 figures catalogued in `audit/figure-manifest.csv` with figure_id, page_url, component_type, source_data_file, and caption_text.

---

## Figure ID Listing by Chapter

### Ch 1: Patent Count (6 figures)
- fig-innovation-landscape-annual-grants (PWAreaChart)
- fig-innovation-landscape-grant-lag (PWLineChart)
- fig-filing-vs-grant (PWLineChart)
- fig-pendency-trend (PWLineChart)
- fig-continuation-stacked (PWAreaChart)
- fig-continuation-share (PWLineChart)

### Ch 2: Patent Quality (16 figures)
- fig-innovation-landscape-claims-per-patent (PWLineChart)
- fig-patent-quality-claims-trends (PWLineChart)
- fig-patent-quality-scope (PWLineChart)
- fig-patent-quality-forward-citations (PWLineChart)
- fig-patent-quality-cohort-system (PWLineChart)
- fig-patent-quality-backward-citations (PWLineChart)
- fig-patent-quality-self-citation-rate (PWLineChart)
- fig-patent-quality-citation-lag (PWLineChart)
- fig-patent-quality-originality-generality (PWLineChart)
- fig-patent-quality-orig-gen-filtered (PWLineChart)
- fig-sleeping-beauty-halflife (PWScatterChart)
- fig-npl-citations-trend (PWLineChart)
- fig-npl-citations-by-cpc (PWBarChart)
- fig-foreign-citation-share (PWLineChart)
- fig-figures-per-patent (PWLineChart)
- fig-figures-by-cpc (PWBarChart)

### Ch 3: Patent Fields (21 figures)
- fig-patent-fields-design-trends (PWLineChart)
- fig-patent-fields-cpc-sections (PWAreaChart)
- fig-patent-fields-cpc-class-change (PWBarChart)
- fig-patent-fields-hhi-by-section (PWLineChart)
- fig-patent-fields-diversity-index (PWLineChart)
- fig-patent-fields-velocity (PWLineChart)
- fig-patent-fields-friction-map (PWLineChart)
- fig-patent-fields-scurve-maturity (PWBarChart)
- fig-patent-fields-citation-lag-by-section (PWLineChart)
- fig-patent-fields-citation-decay (PWLineChart)
- fig-patent-fields-cpc-treemap (PWTreemap)
- fig-patent-fields-claims-by-section (PWLineChart)
- fig-patent-fields-quality-by-sector (PWLineChart)
- fig-patent-fields-fwd-citations-by-cpc (PWLineChart)
- fig-patent-fields-originality-by-cpc (PWLineChart)
- fig-patent-fields-generality-by-cpc (PWLineChart)
- fig-patent-fields-scope-by-cpc (PWLineChart)
- fig-patent-fields-reclass-rate (PWBarChart)
- fig-patent-fields-reclass-flows (PWValueHeatmap)
- fig-patent-fields-wipo-sector-shares (PWAreaChart)
- fig-patent-fields-wipo-field-growth (PWBarChart)

### Ch 4: Convergence (7 figures)
- fig-cross-field-convergence-matrix (PWConvergenceMatrix)
- fig-patent-quality-cross-domain (PWAreaChart)
- fig-convergence-decomposition (PWLineChart)
- fig-convergence-near-far (PWLineChart)
- fig-convergence-top-assignees (PWLineChart)
- fig-interdisciplinarity-composite (PWLineChart)
- fig-convergence-cpc-vs-ipc (PWLineChart)

### Ch 5: The Language of Innovation (4 figures)
- fig-language-innovation-topic-prevalence (PWAreaChart / PWSmallMultiples toggle)
- fig-language-innovation-umap (PWScatterChart)
- fig-language-innovation-topic-cpc (PWBarChart)
- fig-language-innovation-novelty (PWLineChart)

### Ch 6: Patent Law & Policy (8 figures)
- fig-patent-law-applications-vs-grants (PWLineChart)
- fig-alice-event-study (PWLineChart)
- fig-patent-law-alice-indexed (PWLineChart)
- fig-patent-law-alice-pendency (PWLineChart)
- fig-patent-law-td-rate (PWLineChart)
- fig-patent-law-td-by-cpc (PWBarChart)
- fig-patent-law-pta-over-time (PWLineChart)
- fig-patent-law-pta-by-cpc (PWBarChart)
- (Plus 1 PWTimeline rendered outside ChartContainer)

### Ch 7: Public Investment (6 figures)
- fig-innovation-landscape-gov-funded (PWLineChart)
- fig-innovation-landscape-gov-agencies (PWBarChart)
- fig-gov-agency-field-matrix (PWValueHeatmap)
- fig-gov-agency-breadth-depth (raw Recharts ScatterChart)
- fig-gov-impact-comparison (PWBarChart)
- fig-gov-contract-concentration (PWBarChart)

### Ch 8: Assignee Composition (6 figures)
- fig-org-composition-assignee-types (PWAreaChart)
- fig-org-composition-domestic-vs-foreign (PWAreaChart)
- fig-org-composition-non-us-assignees (PWAreaChart)
- fig-org-composition-filing-route (PWLineChart)
- fig-org-composition-law-firm-concentration (PWLineChart)
- fig-org-composition-top-law-firms (PWBarChart)

### Ch 9: Organizational Patent Count (6 figures)
- fig-org-patent-count-top-assignees (PWLollipopChart)
- fig-org-patent-count-design-top-filers (PWBarChart)
- fig-org-patent-count-concentration (PWLineChart)
- fig-org-patent-count-org-output-trends (PWLineChart)
- fig-blockbuster-lorenz (PWLorenzCurve)
- fig-org-patent-count-continuation-share (PWBarChart)

### Ch 10: Organizational Patent Quality (12 figures)
- fig-org-patent-quality-quality-scatter (PWBubbleScatter)
- fig-org-patent-quality-quality-fan (PWFanChart)
- fig-org-patent-quality-blockbuster-dud (PWBarChart)
- fig-org-patent-quality-citation-impact (PWBarChart)
- fig-org-patent-quality-self-citation-by-assignee (PWBarChart)
- fig-org-patent-quality-citation-half-life (PWBarChart)
- fig-org-patent-quality-fwd-citations-by-company (PWLineChart)
- fig-org-patent-quality-claims-by-company (PWLineChart)
- fig-org-patent-quality-originality-by-company (PWLineChart)
- fig-org-patent-quality-grant-lag-by-company (PWLineChart)
- fig-org-patent-quality-npl-by-firm (PWLineChart)
- fig-org-patent-quality-foreign-cite-by-firm (PWBarChart)

### Ch 11: Patent Portfolio (5 figures)
- fig-patent-portfolio-competitive-proximity (PWScatterChart)
- fig-patent-portfolio-diversification (PWBarChart)
- fig-patent-portfolio-corp-diversification (PWLineChart)
- fig-patent-portfolio-pivot-detection (PWBarChart)
- fig-patent-portfolio-wipo-diversity (PWBarChart)

### Ch 12: Interactive Company Profiles (12 figures)
- fig-org-profiles-annual-output (PWLineChart)
- fig-org-profiles-cpc-distribution (PWBarChart)
- fig-org-profiles-citations (PWLineChart)
- fig-org-profiles-team-size (PWLineChart)
- fig-org-profiles-cpc-breadth (PWAreaChart)
- fig-org-profiles-tech-evolution (PWAreaChart)
- fig-org-profiles-quality-fan (PWFanChart)
- fig-org-profiles-blockbuster-dud (PWFanChart)
- fig-org-profiles-claims-distribution (PWBarChart)
- fig-org-profiles-strategy (PWRadarChart)
- fig-org-profiles-grant-lag (PWLineChart)
- fig-org-profiles-annual-patents-speed (PWLineChart)

### Ch 13: Top Inventors (13 figures)
- fig-inventors-superstar-concentration (PWLineChart)
- fig-inventors-prolific-ranking (PWLollipopChart)
- fig-inventors-citation-impact (PWBarChart)
- fig-productivity-by-rank (PWLineChart)
- fig-top-inv-fwd-citations through fig-top-inv-grant-lag (7 PWLineChart)
- fig-examiner-inventor-overlap (PWBarChart)
- fig-multi-type-inventors (PWLineChart)

### Ch 14: Generalist vs. Specialist (10 figures)
- fig-specialization-trend (PWAreaChart)
- fig-spec-fwd-citations through fig-spec-grant-lag (7 PWLineChart)
- fig-spec-productivity (PWLineChart)
- fig-npl-by-inventor-type (PWBarChart)

### Ch 15: Serial Inventors vs. New Entrants (14 figures)
- fig-inventors-first-time-entries (PWLineChart)
- fig-inventors-first-time-share (PWLineChart)
- fig-inventors-segment-shares (PWAreaChart)
- fig-inventors-career-survival (PWLineChart)
- fig-inventors-career-curve (PWLineChart)
- fig-inventors-career-duration (PWBarChart)
- fig-quality-exp-fwd-cites through fig-quality-exp-grant-lag (7 PWLineChart)
- fig-quality-exp-productivity (PWBarChart)

### Ch 16: Gender and Patenting (13 figures)
- fig-gender-female-share (PWLineChart)
- fig-gender-by-sector (PWLineChart)
- fig-gender-by-cpc-section (PWBarChart)
- fig-gender-by-cpc-trend (PWLineChart)
- fig-gender-fwd-citations through fig-gender-grant-lag (7 PWLineChart)
- fig-gender-productivity (PWLineChart)
- fig-gender-by-filing-route (PWBarChart)

### Ch 17: Team Size and Collaboration (15 figures)
- fig-team-size-trend (PWLineChart)
- fig-solo-inventor-trend (PWLineChart)
- fig-solo-by-section (PWLineChart)
- fig-team-fwd-citations through fig-team-grant-lag (7 PWLineChart)
- fig-team-productivity (PWLineChart)
- fig-team-size-coefficients (PWCoefficientPlot)
- fig-team-size-by-decade (PWCoefficientPlot)
- fig-cross-institutional-rate (PWLineChart)
- fig-cross-institutional-by-cpc (PWBarChart)

### Ch 18: Domestic Geography (16 figures)
- fig-geography-state-choropleth (PWChoroplethMap)
- fig-geography-state-rankings (PWBarChart)
- fig-geography-state-specialization (PWBarChart)
- fig-geography-state-trends (PWLineChart)
- fig-geography-state-forward-citations through fig-geography-state-grant-lag (4 PWLineChart)
- fig-geography-city-rankings (PWLollipopChart)
- fig-geography-city-forward-citations through fig-geography-city-grant-lag (4 PWLineChart)
- fig-geography-top-counties (PWBarChart)
- fig-geography-county-concentration (PWBarChart)
- fig-geography-innovation-clusters (PWLineChart)

### Ch 19: International Geography (15 figures)
- fig-geo-intl-dom-fwd-citations through fig-geo-intl-dom-grant-lag (7 PWLineChart)
- fig-geo-intl-claims-by-country (PWLineChart)
- fig-geo-intl-country-fwd-citations through fig-geo-intl-country-grant-lag (4 PWLineChart)
- fig-geo-intl-country-filing-trends (PWLineChart)
- fig-geo-intl-priority-country-composition (PWBarChart)
- fig-geo-intl-pct-share-by-country (PWLineChart)

### Ch 20: Organizational Mechanics (10 figures)
- fig-mech-org-exploration-score (PWSmallMultiples)
- fig-mech-org-exploration-share (PWSmallMultiples)
- fig-mech-org-exploration-trajectories (PWSmallMultiples)
- fig-mech-org-exploration-decay (PWLineChart)
- fig-mech-org-ambidexterity (PWBubbleScatter)
- fig-mech-org-firm-gini (PWTrajectoryScatter)
- fig-mech-org-firm-network (PWNetworkGraph)
- fig-mech-org-corporate-citation-flows (PWChordDiagram)
- fig-mech-org-exploration-trajectory (PWCompanySelector)
- fig-mech-org-citation-category-distribution (PWBarChart + PWAreaChart)

### Ch 21: Inventor Mechanics (13 figures)
- fig-collaboration-inventor-network (PWNetworkGraph)
- fig-collaboration-network-metrics (PWBarChart)
- fig-collaboration-talent-flows (PWSankeyDiagram)
- fig-net-talent-flow-summary (PWBarChart)
- fig-geography-inventor-mobility-trend (PWLineChart)
- fig-geography-state-flows (PWSankeyDiagram)
- fig-geography-global-flows (PWWorldFlowMap)
- fig-international-talent-sankey (PWBarChart)
- fig-inventor-mobility-event-overall (PWLineChart)
- fig-inventor-mobility-event-direction (PWLineChart)
- fig-bridge-centrality (PWLineChart)
- fig-mech-inventors-intl-mobility-rate (PWLineChart)
- fig-mech-inventors-top-mobility-flows (PWLineChart)

### Ch 22: Geographic Mechanics (4 figures)
- fig-mech-geo-intl-collaboration (PWLineChart)
- fig-mech-geo-co-invention-rates (PWLineChart)
- fig-mech-geo-us-china-by-section (PWAreaChart)
- fig-mech-geo-citation-localization (PWLineChart)

### Deep Dive Overview (5 figures)
- methods (non-chart informational)
- fig-act6-volume (PWBarChart)
- fig-act6-timeseries (PWSmallMultiples)
- fig-act6-quality (PWSmallMultiples)
- fig-act6-continuation-rates (PWBarChart)
- fig-act6-filing-vs-grant (PWBarChart)

### Deep Dive Chapters 23-34 (18-19 figures each, standard template)

Each deep dive chapter follows a standard template with these figure IDs (prefix varies by domain):

| Figure Pattern | Component | Description |
|---------------|-----------|-------------|
| fig-{prefix}-annual-count | PWAreaChart | Annual patent counts |
| fig-{prefix}-share | PWLineChart | Share of total patents |
| fig-{prefix}-entrant-incumbent | PWAreaChart | Entrant vs. incumbent splits |
| fig-{prefix}-subfields | PWAreaChart | Subfield composition |
| fig-{prefix}-top-assignees | PWLineChart | Top assignee trajectories |
| fig-{prefix}-org-rankings | PWRankHeatmap | Organization ranking changes |
| fig-{prefix}-top-inventors | PWBarChart | Prolific inventor rankings |
| fig-{prefix}-by-country | PWLineChart | Country-level trends |
| fig-{prefix}-by-state | PWBarChart | State-level distribution |
| fig-{prefix}-quality | PWLineChart | Quality metrics over time |
| fig-{prefix}-quality-bifurcation | PWLineChart | Quality bifurcation analysis |
| fig-{prefix}-diffusion | PWLineChart | Technology diffusion |
| fig-{prefix}-team-comparison | PWBarChart | Team size comparison |
| fig-{prefix}-assignee-type | PWBarChart | Assignee type breakdown |
| fig-{prefix}-cr4 | PWLineChart | CR4 concentration ratio |
| fig-{prefix}-entropy | PWLineChart | Subfield diversity entropy |
| fig-{prefix}-velocity | PWLineChart | Entry velocity by cohort |
| fig-{prefix}-filing-vs-grant | PWLineChart | Filing year vs. grant year |

Extra figures in AI (19): fig-ai-gpt-kpi (PWLineChart)
Extra figures in Blockchain (19): fig-blockchain-hype-cycle (PWLineChart)
Extra figures in Digital Health (19): fig-digihealth-regulatory-split (PWAreaChart)
Extra figures in Green Innovation (19): fig-green-innovation-ai-trend + fig-green-innovation-ai-heatmap (PWLineChart, PWAreaChart minus one standard)
Extra figures in Quantum Computing (19): fig-quantum-semi-dependence (PWBarChart)
