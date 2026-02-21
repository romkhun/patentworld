# PatentWorld Page & Visualization Inventory

Generated: 2026-02-21 (Audit Section 1.3)

---

## Summary

| Metric | Count |
|--------|-------|
| Total page.tsx files under src/app/ | 40 |
| Chapter pages (numbered 1-34, in CHAPTERS array) | 34 |
| Extra chapter page (deep-dive-overview, not in CHAPTERS) | 1 |
| Non-chapter pages (Home, About, Explore, FAQ, Methodology) | 5 |
| Total ChartContainer visualizations (chapters + overview) | 458 |
| ChartContainer on homepage (HomeContent.tsx) | 1 |
| Grand total ChartContainer site-wide | 459 |
| HERO_STATS.visualizations claim | 458 |

**Verification:** The `HERO_STATS.visualizations` value of **458** matches the chapter-only ChartContainer count exactly. The homepage adds 1 additional visualization (a featured area chart), bringing the true site-wide total to 459. All chart components (Recharts-based PW* components, D3-based maps/networks/sankeys/chords) are rendered inside `<ChartContainer>` wrappers; there are no unwrapped orphan visualizations.

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

| # | File Path | Route | Title | Act | Viz Count |
|---|-----------|-------|-------|-----|-----------|
| 1 | src/app/chapters/system-patent-count/page.tsx | /chapters/system-patent-count/ | Patent Count | Act 1 | 6 |
| 2 | src/app/chapters/system-patent-quality/page.tsx | /chapters/system-patent-quality/ | Patent Quality | Act 1 | 16 |
| 3 | src/app/chapters/system-patent-fields/page.tsx | /chapters/system-patent-fields/ | Patent Fields | Act 1 | 21 |
| 4 | src/app/chapters/system-convergence/page.tsx | /chapters/system-convergence/ | Convergence | Act 1 | 7 |
| 5 | src/app/chapters/system-language/page.tsx | /chapters/system-language/ | The Language of Innovation | Act 1 | 4 |
| 6 | src/app/chapters/system-patent-law/page.tsx | /chapters/system-patent-law/ | Patent Law & Policy | Act 1 | 8 |
| 7 | src/app/chapters/system-public-investment/page.tsx | /chapters/system-public-investment/ | Public Investment | Act 1 | 6 |
| | | | **Act 1 subtotal** | | **68** |

### Act 2: The Organizations (5 chapters, 41 visualizations)

| # | File Path | Route | Title | Act | Viz Count |
|---|-----------|-------|-------|-----|-----------|
| 8 | src/app/chapters/org-composition/page.tsx | /chapters/org-composition/ | Assignee Composition | Act 2 | 6 |
| 9 | src/app/chapters/org-patent-count/page.tsx | /chapters/org-patent-count/ | Organizational Patent Count | Act 2 | 6 |
| 10 | src/app/chapters/org-patent-quality/page.tsx | /chapters/org-patent-quality/ | Organizational Patent Quality | Act 2 | 12 |
| 11 | src/app/chapters/org-patent-portfolio/page.tsx | /chapters/org-patent-portfolio/ | Patent Portfolio | Act 2 | 5 |
| 12 | src/app/chapters/org-company-profiles/page.tsx | /chapters/org-company-profiles/ | Interactive Company Profiles | Act 2 | 12 |
| | | | **Act 2 subtotal** | | **41** |

### Act 3: The Inventors (5 chapters, 65 visualizations)

| # | File Path | Route | Title | Act | Viz Count |
|---|-----------|-------|-------|-----|-----------|
| 13 | src/app/chapters/inv-top-inventors/page.tsx | /chapters/inv-top-inventors/ | Top Inventors | Act 3 | 13 |
| 14 | src/app/chapters/inv-generalist-specialist/page.tsx | /chapters/inv-generalist-specialist/ | Generalist vs. Specialist | Act 3 | 10 |
| 15 | src/app/chapters/inv-serial-new/page.tsx | /chapters/inv-serial-new/ | Serial Inventors vs. New Entrants | Act 3 | 14 |
| 16 | src/app/chapters/inv-gender/page.tsx | /chapters/inv-gender/ | Gender and Patenting | Act 3 | 13 |
| 17 | src/app/chapters/inv-team-size/page.tsx | /chapters/inv-team-size/ | Team Size and Collaboration | Act 3 | 15 |
| | | | **Act 3 subtotal** | | **65** |

### Act 4: The Geography (2 chapters, 31 visualizations)

| # | File Path | Route | Title | Act | Viz Count |
|---|-----------|-------|-------|-----|-----------|
| 18 | src/app/chapters/geo-domestic/page.tsx | /chapters/geo-domestic/ | Domestic Geography | Act 4 | 16 |
| 19 | src/app/chapters/geo-international/page.tsx | /chapters/geo-international/ | International Geography | Act 4 | 15 |
| | | | **Act 4 subtotal** | | **31** |

### Act 5: The Mechanics (3 chapters, 27 visualizations)

| # | File Path | Route | Title | Act | Viz Count |
|---|-----------|-------|-------|-----|-----------|
| 20 | src/app/chapters/mech-organizations/page.tsx | /chapters/mech-organizations/ | Organizational Mechanics | Act 5 | 10 |
| 21 | src/app/chapters/mech-inventors/page.tsx | /chapters/mech-inventors/ | Inventor Mechanics | Act 5 | 13 |
| 22 | src/app/chapters/mech-geography/page.tsx | /chapters/mech-geography/ | Geographic Mechanics | Act 5 | 4 |
| | | | **Act 5 subtotal** | | **27** |

### Act 6: Deep Dives (12 chapters + 1 overview, 226 visualizations)

| # | File Path | Route | Title | Act | Viz Count |
|---|-----------|-------|-------|-----|-----------|
| -- | src/app/chapters/deep-dive-overview/page.tsx | /chapters/deep-dive-overview/ | ACT 6 Overview -- Cross-Domain Comparison | Act 6 (overview) | 5 |
| 23 | src/app/chapters/3d-printing/page.tsx | /chapters/3d-printing/ | 3D Printing & Additive Manufacturing | Act 6 | 18 |
| 24 | src/app/chapters/agricultural-technology/page.tsx | /chapters/agricultural-technology/ | Agricultural Technology | Act 6 | 18 |
| 25 | src/app/chapters/ai-patents/page.tsx | /chapters/ai-patents/ | Artificial Intelligence | Act 6 | 19 |
| 26 | src/app/chapters/autonomous-vehicles/page.tsx | /chapters/autonomous-vehicles/ | Autonomous Vehicles & ADAS | Act 6 | 18 |
| 27 | src/app/chapters/biotechnology/page.tsx | /chapters/biotechnology/ | Biotechnology & Gene Editing | Act 6 | 18 |
| 28 | src/app/chapters/blockchain/page.tsx | /chapters/blockchain/ | Blockchain & Decentralized Systems | Act 6 | 19 |
| 29 | src/app/chapters/cybersecurity/page.tsx | /chapters/cybersecurity/ | Cybersecurity | Act 6 | 18 |
| 30 | src/app/chapters/digital-health/page.tsx | /chapters/digital-health/ | Digital Health & Medical Devices | Act 6 | 19 |
| 31 | src/app/chapters/green-innovation/page.tsx | /chapters/green-innovation/ | Green Innovation | Act 6 | 19 |
| 32 | src/app/chapters/quantum-computing/page.tsx | /chapters/quantum-computing/ | Quantum Computing | Act 6 | 19 |
| 33 | src/app/chapters/semiconductors/page.tsx | /chapters/semiconductors/ | Semiconductors | Act 6 | 18 |
| 34 | src/app/chapters/space-technology/page.tsx | /chapters/space-technology/ | Space Technology | Act 6 | 18 |
| | | | **Act 6 subtotal** | | **226** |

---

## Non-Chapter Pages (5 pages)

| # | File Path | Route | Title | Viz Count | Notes |
|---|-----------|-------|-------|-----------|-------|
| -- | src/app/page.tsx + src/app/HomeContent.tsx | / | PatentWorld -- 50 Years of US Patent Data | 1 | Featured area chart (50 Years of US Patent Grants); hero stats counters; chapter cards; FAQ JSON-LD |
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

| Component | Type | Description |
|-----------|------|-------------|
| ChartContainer.tsx | Wrapper | Lazy-loading container with title, subtitle, caption, insight, CiteThisFigure |
| CiteThisFigure.tsx | Utility | Figure citation UI component |
| PWAreaChart.tsx | Recharts | Stacked/standard area charts |
| PWBarChart.tsx | Recharts | Horizontal/vertical bar charts |
| PWBubbleScatter.tsx | Recharts | Bubble scatter plots |
| PWBumpChart.tsx | Recharts | Bump/rank charts |
| PWChordDiagram.tsx | D3 | Chord diagrams for flow data |
| PWChoroplethMap.tsx | D3 | Geographic choropleth maps |
| PWCoefficientPlot.tsx | Recharts | Coefficient/forest plots |
| PWCompanySelector.tsx | Interactive | Company selection dropdown for profiles |
| PWConvergenceMatrix.tsx | Custom | Technology convergence matrix |
| PWFanChart.tsx | Recharts | Fan/uncertainty charts |
| PWLineChart.tsx | Recharts | Multi-series line charts |
| PWLollipopChart.tsx | Recharts | Lollipop charts |
| PWLorenzCurve.tsx | Recharts | Lorenz curves with Gini coefficient |
| PWNetworkGraph.tsx | D3 | Force-directed network graphs |
| PWRadarChart.tsx | Recharts | Radar/spider charts |
| PWRankHeatmap.tsx | Custom | Rank heatmap grids |
| PWSankeyDiagram.tsx | D3 | Sankey flow diagrams |
| PWScatterChart.tsx | Recharts | Scatter plots |
| PWSeriesSelector.tsx | Interactive | Series toggle for multi-line charts |
| PWSlopeChart.tsx | Custom | Slope charts for period comparisons |
| PWSmallMultiples.tsx | Recharts | Small multiples grid layout |
| PWSparkline.tsx | Recharts | Inline sparkline charts |
| PWTimeline.tsx | Custom | Event timeline with annotations |
| PWTrajectoryScatter.tsx | Recharts | Trajectory scatter with arrows |
| PWTreemap.tsx | Recharts | Treemap visualizations |
| PWValueHeatmap.tsx | Custom | Value-based heatmap grids |
| PWWorldFlowMap.tsx | D3 | World map with flow arrows |
| TimeAnnotations.tsx | Utility | Reference event annotations overlay |

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
