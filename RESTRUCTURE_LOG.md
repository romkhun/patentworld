# PatentWorld Restructure Log

## Chapter Registration System

Chapters are defined in `src/lib/constants.ts` via the `CHAPTERS` array (type `ChapterMeta[]`). Each entry has: `number`, `slug`, `title`, `subtitle`, `description`, `relatedChapters?`.

ACT groupings are defined in `ACT_GROUPINGS` array (type `ActGrouping[]`). Each entry has: `act`, `title`, `subtitle`, `chapters` (number[]), `subgroups?`.

Routing uses Next.js App Router: `src/app/chapters/[slug]/page.tsx` and `src/app/chapters/[slug]/layout.tsx`.

Each chapter layout uses `chapterMetadata(slug)` and `chapterJsonLd(slug)` from `src/lib/seo.ts` which reads from `CHAPTER_KEYWORDS`, `CHAPTER_SEO_TITLES`, and `CHAPTER_SEO_DESCRIPTIONS` maps.

The sitemap at `src/app/sitemap.ts` auto-generates from the `CHAPTERS` array.

Navigation components: `ChapterSidebar.tsx`, `MobileNav.tsx`, `ChapterNavigation.tsx`, `HomeContent.tsx`, `Breadcrumb.tsx`.

## Current Site Structure Map

### ACT 1: The System (Ch 1-7)

#### Ch 1: Patent Volume & Composition (`patent-volume`)
- **File:** `src/app/chapters/patent-volume/page.tsx`
- **Sections:** Number of Patents, Design vs. Utility Patents, Patent Complexity, Grant Pendency
- **Figures:**
  - "Annual US Patent Grants Grew from 70,941 in 1976 to 392,618 in 2019 Before Moderating" → `chapter1/patents_per_year.json`
  - "Design Patent Share Fluctuated Between 6% and 14% of Total Grants" → `chapter1/patents_per_year.json`
  - "Average Claims Per Patent Doubled from 9.4 in 1976 to 18.9 in 2025" → `chapter1/claims_per_year.json`
  - "Average Grant Lag Peaked at 1,390 Days (~3.8 Years) in 2010" → `chapter1/grant_lag.json`

#### Ch 2: Patent Process & Public Investment (`patent-process`)
- **File:** `src/app/chapters/patent-process/page.tsx`
- **Sections:** Applications vs. Grants, Grant Pendency, Government Funding
- **Figures:**
  - "Patent Applications Rose Nearly 8-Fold..." → `chapter10/applications_vs_grants.json`
  - Grant Pendency figure → `chapter1/grant_lag.json`
  - "Government-Funded Patents Rose from 1,269 in 1976 to a Peak of 6,457 in 2015" → `chapter6/gov_funded_per_year.json`
  - "HHS/NIH Leads with 55,587 Government-Funded Patents..." → `chapter6/gov_agencies.json`

#### Ch 3: Technology Fields (`technology-fields`)
- **File:** `src/app/chapters/technology-fields/page.tsx`
- **Sections:** CPC Section Composition, WIPO Fields
- **Figures:**
  - "Electrical Engineering Grew Nearly 15-Fold from 10,404 Patents in 1976 to 150,702 in 2024" → `chapter2/cpc_sections_per_year.json` [TO REMOVE - Phase 1 #1]
  - "CPC Sections G and H Gained Roughly 30 Percentage Points of Share Over Five Decades" → `chapter2/cpc_sections_per_year.json`
  - "The Top 3 CPC Classes Account for 15-42% of Patents Across Sections, Revealing Concentrated Innovation" → `chapter2/cpc_treemap.json`
  - WIPO Fields figure → `chapter2/wipo_sectors_per_year.json`, `chapter2/wipo_fields_per_year.json`

#### Ch 4: Technology Dynamics (`technology-dynamics`)
- **File:** `src/app/chapters/technology-dynamics/page.tsx`
- **Sections:** Growth & Decline, Technology Diversity, Technology Lifecycle
- **Figures:**
  - "The Fastest-Growing Digital Technology Classes Grew by Over 1,000%..." → `chapter2/cpc_class_change.json`
  - "Technology Diversity Declined from 0.848 in 1984 to 0.777 in 2009..." → `chapter2/tech_diversity.json`
  - "Textiles Has Reached Over 97% of Estimated Carrying Capacity..." → `chapter2/technology_scurves.json`

#### Ch 5: Cross-Field Convergence (`cross-field-convergence`)
- **File:** `src/app/chapters/cross-field-convergence/page.tsx`
- **Sections:** Patent Concentration, Field-Specific Metrics, Cross-Field Convergence
- **Figures:**
  - "Patent Markets Remain Unconcentrated Across All CPC Sections, with HHI Values Well Below the 1,500 Threshold" → `chapter10/hhi_by_section.json`
  - "The G-H (Physics-Electricity) Convergence Pair Rose from 12.5% to 37.5%..." → `chapter10/convergence_matrix.json`
  - "Electricity (H) and Physics (G) Patents Exhibit the Shortest Citation Half-Lives at 10.7 and 11.2 Years..." → `chapter2/technology_halflife.json`
  - Citation decay curves figure → `chapter2/technology_decay_curves.json`

#### Ch 6: The Language of Innovation (`the-language-of-innovation`)
- **File:** `src/app/chapters/the-language-of-innovation/page.tsx`
- **Sections:** Topic Modeling, Topic Prevalence, Topic Novelty
- **Figures:**
  - Various topic modeling figures → `chapter12/topic_*.json`

#### Ch 7: Patent Law & Policy (`patent-law`)
- **File:** `src/app/chapters/patent-law/page.tsx`
- **Sections:** Interactive timeline with patent law events

### ACT 2: The Actors (Ch 8-20)

#### Ch 8: The Assignee Landscape (`assignee-landscape`)
- **File:** `src/app/chapters/assignee-landscape/page.tsx`
- **Sections:** Assignee Types, Domestic vs. Foreign, Country-Level
- **Figures:**
  - "Corporate Assignees Grew From 94% to 99%..." → `chapter3/assignee_types_per_year.json`
  - "Foreign Assignees Surpassed US-Based Assignees Around 2007..." → `chapter3/domestic_vs_foreign.json`
  - "Japan Accounts for 1.4 Million US Patents..." → `chapter3/non_us_by_section.json`

#### Ch 9: Firm Grant Rankings (`firm-rankings`)
- **File:** `src/app/chapters/firm-rankings/page.tsx`
- **Sections:** Cumulative Rankings, Rank Heatmap, Output Trajectories
- **Figures:**
  - "IBM Leads With 161,888 Cumulative Grants..." → `chapter3/top_assignees.json`
  - "GE Held Rank 1 for 6 Consecutive Years (1980-1985)..." → `chapter3/top_orgs_over_time.json` [TO REMOVE - Phase 1 #2, preserve data]
  - "Samsung Peaked at 9,716 Annual Grants in 2024..." → `chapter3/top_orgs_over_time.json`

#### Ch 10: Market Concentration (`market-concentration`)
- **File:** `src/app/chapters/market-concentration/page.tsx`
- **Sections:** Concentration, Design Patent Leadership, Corporate Mortality
- **Figures:**
  - "The Top 100 Organizations Hold 32-39% of Corporate Patents..." → `chapter3/concentration.json`
  - "Samsung (13,094), Nike (9,189), and LG (6,720) Lead Design Patent Filings..." → `company/design_patents.json`
  - "Only 9 of 50 Top Patent Filers Survived All 5 Decades..." → `company/corporate_mortality.json` [TO REMOVE - Phase 1 #3]
  - "Companies in the Top 50 Every Decade" → `company/corporate_mortality.json`

#### Ch 11: Firm Citation Quality (`firm-citation-quality`)
- **File:** `src/app/chapters/firm-citation-quality/page.tsx`
- **Sections:** Quality Typology, Citation Impact
- **Figures:**
  - "Amazon's 6.7% Blockbuster Rate Leads the Field..." → `company/firm_quality_scatter.json`
  - "Microsoft Leads in Average Citations (30.7)..." → `chapter3/firm_citation_impact.json`

#### Ch 12: Technology Portfolios (`technology-portfolios`)
- **File:** `src/app/chapters/technology-portfolios/page.tsx`
- **Sections:** Portfolio Diversity, Portfolio Diversification, Technology Pivot Detection
- **Figures:**
  - "Patent Portfolio Diversity" → `chapter3/portfolio_diversity.json` [TO REMOVE - Phase 1 #4]
  - "Portfolio Diversification" → `company/portfolio_diversification_b3.json`
  - "Technology Pivot Detection" → `company/pivot_detection.json`

#### Ch 13: Company Profiles (`company-profiles`)
- **File:** `src/app/chapters/company-profiles/page.tsx`
- **Sections:** Interactive Company Profiles
- **Figures:** Interactive multi-company dashboard → `company/company_profiles.json`, `company/company_name_mapping.json`, `company/company_milestones.json`

#### Ch 14: Knowledge Flows (`knowledge-flows`)
- **File:** `src/app/chapters/knowledge-flows/page.tsx`
- **Sections:** Citation Networks, Citation Half-Lives, Self-Citation Patterns, Corporate Technology Portfolios
- **Figures:**
  - "Citation Networks" → `company/corporate_citation_network.json`
  - "Citation Half-Lives Range From 6.3 Years (Huawei) to 14.3 Years..." → `company/citation_half_life.json`
  - "Self-Citation Patterns" → `chapter9/self_citation_by_assignee.json`
  - "Corporate Technology Portfolios" → `chapter3/firm_tech_evolution.json`

#### Ch 15: Exploration & Exploitation (`exploration-strategy`)
- **File:** `src/app/chapters/exploration-strategy/page.tsx`
- **Sections:** Exploration and Exploitation
- **Figures:**
  - "11 of 20 Major Filers Keep Exploration Below 5%..." → `company/firm_exploration_scores.json`
  - Additional exploration figures → `company/firm_exploration_*.json`

#### Ch 16: Exploration Outcomes (`exploration-outcomes`)
- **File:** `src/app/chapters/exploration-outcomes/page.tsx`
- **Sections:** Exploration Score Decay, Exploration Quality Premium, Ambidexterity and Blockbusters, Within-Firm Quality Concentration
- **Figures:**
  - "Exploration Quality Premium" → `company/firm_exploration_scatter.json` [TO REMOVE - Phase 1 #5]
  - "Exploration Score Decay" → `company/firm_exploration_lifecycle.json`
  - "Ambidexterity and Blockbusters" → `company/firm_ambidexterity_quality.json`
  - "Within-Firm Citation Gini Coefficients Rose..." → `company/firm_quality_gini.json`

#### Ch 17: Inventor Demographics (`inventor-demographics`)
- **File:** `src/app/chapters/inventor-demographics/page.tsx`
- **Sections:** Gender Composition, The Gender Innovation Gap, New Entrants
- **Figures:**
  - Gender composition figures → `chapter5/gender_per_year.json`, `chapter5/gender_by_sector.json`, `chapter5/gender_by_tech.json`, `chapter5/gender_section_trend.json`, `chapter5/gender_team_quality.json`
  - New entrant figures → `chapter5/first_time_inventors.json`, `chapter5/inventor_entry.json`

#### Ch 18: Inventor Productivity (`inventor-productivity`)
- **File:** `src/app/chapters/inventor-productivity/page.tsx`
- **Sections:** The Collaborative Turn, Top Inventors, Inventor Impact
- **Figures:**
  - Team size figures → `chapter5/team_size_per_year.json`, `chapter5/solo_inventors.json`
  - Top inventor figures → `chapter5/prolific_inventors.json`
  - Impact figures → `chapter5/star_inventor_impact.json`

#### Ch 19: Productivity Concentration (`productivity-concentration`)
- **File:** `src/app/chapters/productivity-concentration/page.tsx`
- **Sections:** Superstar Inventor Concentration, Technology Specialization vs. Generalist, Serial Inventors and Single-Patent Filers
- **Figures:**
  - "Superstar Inventor Concentration" → `chapter5/superstar_concentration.json`, `chapter5/inventor_segments.json`, `chapter5/inventor_segments_trend.json`
  - Specialization figures → `chapter5/inventor_mobility_by_decade.json`
  - Serial inventor figures → `chapter5/inventor_segments.json`

#### Ch 20: Career Trajectories (`career-trajectories`)
- **File:** `src/app/chapters/career-trajectories/page.tsx`
- **Sections:** Career Longevity, Inventor Career Trajectories, Comeback Inventors
- **Figures:**
  - Career longevity → `chapter5/inventor_longevity.json`
  - Career trajectories → `company/inventor_careers.json`
  - Comeback inventors → `company/comeback_inventors.json`

### ACT 3: The Structure (Ch 21-26)

#### Ch 21: Domestic Geography (`domestic-geography`)
- **File:** `src/app/chapters/domestic-geography/page.tsx`
- **Sections:** State and Regional Patterns, Technology Specialization
- **Figures:**
  - State choropleth → `chapter4/us_states_summary.json`
  - State rankings → `chapter4/us_states_summary.json`
  - State specialization → `chapter4/state_specialization.json`

#### Ch 22: Cities & Mobility (`cities-and-mobility`)
- **File:** `src/app/chapters/cities-and-mobility/page.tsx`
- **Sections:** State Temporal Trends, City-Level Rankings, Innovation Diffusion, Regional Specialization, Domestic Inventor Mobility
- **Figures:**
  - State trends → `chapter4/us_states_per_year.json`
  - City rankings → `chapter4/top_cities.json`
  - Innovation diffusion → `chapter4/innovation_diffusion_summary.json`
  - Regional specialization → `chapter4/regional_specialization.json`
  - Domestic mobility → `chapter4/inventor_state_flows.json`

#### Ch 23: International Geography (`international-geography`)
- **File:** `src/app/chapters/international-geography/page.tsx`
- **Sections:** International Inventor Mobility, Country-Level Filing Trends, Global Inventor Migration Flows
- **Figures:**
  - Inventor mobility trend → `chapter4/inventor_mobility_trend.json`
  - "Country-Level Filing Trends" → `chapter4/countries_per_year.json` [TO REMOVE - Phase 1 #6]
  - Global flows → `chapter4/inventor_country_flows.json`

#### Ch 24: Network Structure (`network-structure`)
- **File:** `src/app/chapters/network-structure/page.tsx`
- **Sections:** Organizational Co-Patenting, Inventor Co-Invention, Collaboration Network Structure, Bridge Inventors
- **Figures:**
  - Firm network → `chapter3/firm_collaboration_network.json`
  - Inventor network → `chapter5/inventor_collaboration_network.json`
  - Network metrics → `chapter3/network_metrics_by_decade.json`
  - Bridge inventors → `chapter3/bridge_inventors.json`

#### Ch 25: International Collaboration (`international-collaboration`)
- **File:** `src/app/chapters/international-collaboration/page.tsx`
- **Sections:** Global Collaboration, US-China Collaboration Dynamics
- **Figures:**
  - International co-invention → `chapter7/intl_collaboration.json`
  - US-China co-invention → `chapter6/co_invention_rates.json`, `chapter6/co_invention_us_china_by_section.json`

#### Ch 26: Corporate Strategy (`corporate-strategy`)
- **File:** `src/app/chapters/corporate-strategy/page.tsx`
- **Sections:** Talent Flows Between Companies, Competitive Proximity Map, Innovation Strategy Profiles, Corporate Innovation Speed
- **Figures:**
  - Talent flows → `company/talent_flows.json`
  - Portfolio overlap → `company/portfolio_overlap.json`
  - Strategy profiles → `company/strategy_profiles.json`
  - "Grant Lag Spans 439 to 1,482 Days Across Top 8 Patent Filers" → `company/corporate_speed.json` [TO REMOVE - Phase 1 #7]

### ACT 4: The Mechanics (Ch 27-31)

#### Ch 27: Citation Dynamics (`citation-dynamics`)
- **File:** `src/app/chapters/citation-dynamics/page.tsx`
- **Sections:** Citation Impact, Backward Citations, Citation Lag
- **Figures:**
  - Forward citations → `chapter9/quality_trends.json`
  - Backward citations → `chapter6/citations_per_year.json`
  - Citation lag → `chapter6/citation_lag_trend.json`

#### Ch 28: Patent Scope (`patent-scope`)
- **File:** `src/app/chapters/patent-scope/page.tsx`
- **Sections:** Patent Claims, Scope & Breadth, Cross-Domain Convergence
- **Figures:**
  - Claims trends → `company/claims_analysis.json`
  - Scope → `chapter9/quality_trends.json`
  - Cross-domain convergence → `chapter7/cross_domain.json`

#### Ch 29: Knowledge Flow Indicators (`knowledge-flow-indicators`)
- **File:** `src/app/chapters/knowledge-flow-indicators/page.tsx`
- **Sections:** Originality & Generality, Self-Citation Patterns, Sleeping Beauty Patents, Quality vs. Quantity by Country
- **Figures:**
  - Originality/Generality → `chapter9/originality_generality.json`
  - Self-citation → `chapter9/self_citation_rate.json`
  - Sleeping beauties → `chapter9/sleeping_beauties.json`
  - Quality by country → `chapter9/quality_by_country.json`

#### Ch 30: Innovation Tempo (`innovation-tempo`)
- **File:** `src/app/chapters/innovation-tempo/page.tsx`
- **Sections:** Citation Lag by Technology Area, Innovation Velocity, Patent Examination Friction
- **Figures:**
  - Citation lag by section → `chapter6/citation_lag_by_section.json`
  - Innovation velocity → `chapter7/innovation_velocity.json`
  - Examination friction → `chapter7/friction_map.json`

#### Ch 31: Patent Characteristics (`patent-characteristics`)
- **File:** `src/app/chapters/patent-characteristics/page.tsx`
- **Sections:** Claims by Technology Area, Quality Across Sectors, Composite Quality Index, Self-Citation by Technology Area
- **Figures:**
  - Claims by section → `company/claims_analysis.json`
  - Quality by sector → `chapter9/quality_by_sector.json`
  - "Composite Quality Index" → `chapter9/composite_quality_index.json` [TO REMOVE - Phase 1 #8]
  - Self-citation by section → `chapter9/self_citation_by_section.json`

### ACT 5: Deep Dives (Ch 32-43) — PRESERVED AS ACT 6

Chapters 32-43 are preserved unchanged. Each follows a standardized pattern with 8-12 figures using domain-specific data files.

- Ch 32: 3D Printing (`3d-printing`) → `data/3dprint/`
- Ch 33: Agricultural Technology (`agricultural-technology`) → `data/agtech/`
- Ch 34: Artificial Intelligence (`ai-patents`) → `data/chapter11/`
- Ch 35: Autonomous Vehicles (`autonomous-vehicles`) → `data/av/`
- Ch 36: Biotechnology (`biotechnology`) → `data/biotech/`
- Ch 37: Blockchain (`blockchain`) → `data/blockchain/`
- Ch 38: Cybersecurity (`cybersecurity`) → `data/cyber/`
- Ch 39: Digital Health (`digital-health`) → `data/digihealth/`
- Ch 40: Green Innovation (`green-innovation`) → `data/green/`
- Ch 41: Quantum Computing (`quantum-computing`) → `data/quantum/`
- Ch 42: Semiconductors (`semiconductors`) → `data/semiconductors/`
- Ch 43: Space Technology (`space-technology`) → `data/space/`

---

## Data File Inventory

262 data files (39 MB) across 25 subdirectories. All JSON format.

Key directories:
- `chapter1/` - Patent counts, claims, grant lag (5 files)
- `chapter2/` - CPC sections, WIPO fields, technology dynamics (9 files)
- `chapter3/` - Organizations, assignees, networks (12 files)
- `chapter4/` - Geography, mobility, diffusion (11 files)
- `chapter5/` - Inventors, demographics, segments (19 files)
- `chapter6/` - Citations, collaboration, gov funding (9 files)
- `chapter7/` - Innovation dynamics, velocity, friction (6 files)
- `chapter9/` - Quality metrics, originality, sleeping beauties (10 files)
- `chapter10/` - Applications vs grants, convergence, HHI (3 files)
- `chapter11/` - AI patents (11 files)
- `chapter12/` - Topic modeling (6 files)
- `company/` - Company profiles, exploration, quality (32 files)
- `explore/` - Data explorer tables (4 files)
- 11 domain directories (3dprint, agtech, av, biotech, blockchain, cyber, digihealth, green, quantum, semiconductors, space) - 11 files each (+ 6 extra for green)

---

## PHASE 1: Figure Removals

| # | Figure Title | Source Chapter | Status |
|---|---|---|---|
| 1 | "Electrical Engineering Grew Nearly 15-Fold..." | Ch 3 (`technology-fields`) | REMOVED. ChartContainer + Narrative removed. Data file `chapter2/cpc_sections_per_year.json` preserved (used by other figures). |
| 2 | "GE Held Rank 1 for 6 Consecutive Years..." | Ch 9 (`firm-rankings`) | REMOVED. PWRankHeatmap + KeyInsight removed. Data file `chapter3/top_orgs_over_time.json` preserved for reuse in Phase 3 (ACT 2, Ch 2.2, B.ii). |
| 3 | "Only 9 of 50 Top Patent Filers Survived All 5 Decades..." | Ch 10 (`market-concentration`) | REMOVED. PWRankHeatmap + mortality stat cards removed. "Companies in Top 50 Every Decade" badges retained. Data file `company/corporate_mortality.json` preserved. |
| 4 | "Patent Portfolio Diversity" | Ch 12 (`technology-portfolios`) | REMOVED. ChartContainer + Narrative removed. Data file `chapter3/portfolio_diversity.json` preserved. |
| 5 | "Exploration Quality Premium" | Ch 16 (`exploration-outcomes`) | REMOVED. SectionDivider + Narrative + PWBubbleScatter removed. Data file `company/firm_exploration_scatter.json` preserved. Also removed unused `useChapterData`, `useMemo`, type import. |
| 6 | "Country-Level Filing Trends" | Ch 23 (`international-geography`) | REMOVED. SectionDivider + PWSeriesSelector + PWLineChart + Narrative + KeyInsight removed. Data file `chapter4/countries_per_year.json` preserved. Also removed unused `useChapterData`, `useMemo`, `useState`, pivot function. |
| 7 | "Grant Lag Spans 439 to 1,482 Days..." | Ch 26 (`corporate-strategy`) | REMOVED. SectionDivider + Narrative + PWLineChart removed. Data file `company/corporate_speed.json` preserved. Also removed unused `useChapterData`, `useMemo`, type/color imports. |
| 8 | "Composite Quality Index" | Ch 31 (`patent-characteristics`) | REMOVED. SectionDivider + Narrative + PWLineChart + KeyInsight removed. Data file `chapter9/composite_quality_index.json` preserved. Also removed unused `useChapterData`, `useMemo`, type import.  |

Build verified: `npm run build` — zero errors after all 8 removals.

---

## PHASE 2: New Chapter Shell Structure

### URL Slug Mapping

| New Chapter | Slug | Route |
|---|---|---|
| 1.1 Patent Count | `system-patent-count` | `/chapters/system-patent-count/` |
| 1.2 Patent Quality | `system-patent-quality` | `/chapters/system-patent-quality/` |
| 1.3 Patent Fields | `system-patent-fields` | `/chapters/system-patent-fields/` |
| 1.4 Convergence | `system-convergence` | `/chapters/system-convergence/` |
| 1.5 The Language of Innovation | `system-language` | `/chapters/system-language/` |
| 1.6 Patent Law & Policy | `system-patent-law` | `/chapters/system-patent-law/` |
| 1.7 Public Investment | `system-public-investment` | `/chapters/system-public-investment/` |
| 2.1 Composition | `org-composition` | `/chapters/org-composition/` |
| 2.2 Patent Count | `org-patent-count` | `/chapters/org-patent-count/` |
| 2.3 Patent Quality | `org-patent-quality` | `/chapters/org-patent-quality/` |
| 2.4 Patent Portfolio | `org-patent-portfolio` | `/chapters/org-patent-portfolio/` |
| 2.5 Interactive Company Profiles | `org-company-profiles` | `/chapters/org-company-profiles/` |
| 3.1 Top Inventors | `inv-top-inventors` | `/chapters/inv-top-inventors/` |
| 3.2 Generalist vs. Specialist | `inv-generalist-specialist` | `/chapters/inv-generalist-specialist/` |
| 3.3 Serial vs. New Entrants | `inv-serial-new` | `/chapters/inv-serial-new/` |
| 3.4 Gender | `inv-gender` | `/chapters/inv-gender/` |
| 3.5 Team Size | `inv-team-size` | `/chapters/inv-team-size/` |
| 4.1 Domestic (US) | `geo-domestic` | `/chapters/geo-domestic/` |
| 4.2 International | `geo-international` | `/chapters/geo-international/` |
| 5.1 The Organizations | `mech-organizations` | `/chapters/mech-organizations/` |
| 5.2 The Inventors | `mech-inventors` | `/chapters/mech-inventors/` |
| 5.3 The Geography | `mech-geography` | `/chapters/mech-geography/` |
| ACT 6 Deep Dives | (existing slugs) | (unchanged routes) |

---

## PHASE 4: Old Chapter Deletions and Redirects

All 31 old chapter directories deleted. Vercel redirects configured in `vercel.json`.

| Old Chapter | Old Slug | Redirect Target |
|---|---|---|
| Ch 1: Patent Volume | `patent-volume` | `system-patent-count` |
| Ch 2: Patent Process | `patent-process` | `system-public-investment` |
| Ch 3: Technology Fields | `technology-fields` | `system-patent-fields` |
| Ch 4: Technology Dynamics | `technology-dynamics` | `system-patent-fields` |
| Ch 5: Cross-Field Convergence | `cross-field-convergence` | `system-convergence` |
| Ch 6: Language of Innovation | `the-language-of-innovation` | `system-language` |
| Ch 7: Patent Law | `patent-law` | `system-patent-law` |
| Ch 8: Assignee Landscape | `assignee-landscape` | `org-composition` |
| Ch 9: Firm Rankings | `firm-rankings` | `org-patent-count` |
| Ch 10: Market Concentration | `market-concentration` | `org-patent-count` |
| Ch 11: Firm Citation Quality | `firm-citation-quality` | `org-patent-quality` |
| Ch 12: Technology Portfolios | `technology-portfolios` | `org-patent-portfolio` |
| Ch 13: Company Profiles | `company-profiles` | `org-company-profiles` |
| Ch 14: Knowledge Flows | `knowledge-flows` | `org-patent-quality` |
| Ch 15: Exploration Strategy | `exploration-strategy` | `mech-organizations` |
| Ch 16: Exploration Outcomes | `exploration-outcomes` | `mech-organizations` |
| Ch 17: Inventor Demographics | `inventor-demographics` | `inv-gender` |
| Ch 18: Inventor Productivity | `inventor-productivity` | `inv-top-inventors` |
| Ch 19: Productivity Concentration | `productivity-concentration` | `inv-top-inventors` |
| Ch 20: Career Trajectories | `career-trajectories` | `inv-serial-new` |
| Ch 21: Domestic Geography | `domestic-geography` | `geo-domestic` |
| Ch 22: Cities & Mobility | `cities-and-mobility` | `geo-domestic` |
| Ch 23: International Geography | `international-geography` | `geo-international` |
| Ch 24: Network Structure | `network-structure` | `mech-inventors` |
| Ch 25: International Collaboration | `international-collaboration` | `mech-geography` |
| Ch 26: Corporate Strategy | `corporate-strategy` | `mech-inventors` |
| Ch 27: Citation Dynamics | `citation-dynamics` | `system-patent-quality` |
| Ch 28: Patent Scope | `patent-scope` | `system-patent-quality` |
| Ch 29: Knowledge Flow Indicators | `knowledge-flow-indicators` | `system-patent-quality` |
| Ch 30: Innovation Tempo | `innovation-tempo` | `system-patent-fields` |
| Ch 31: Patent Characteristics | `patent-characteristics` | `system-patent-fields` |

Additional fixes:
- Updated ACT 5 → ACT 6 in all 12 Deep Dives chapters
- Fixed broken internal links in Deep Dives chapters (patent-volume, assignee-landscape, technology-fields, innovation-tempo, network-structure → new slugs)
- Fixed homepage link from patent-volume to system-patent-count
- Updated About page chapter count from "43 chapters organized into five acts" to "34 chapters organized into six acts"
- Updated HERO_STATS.visualizations from 295 to 359

---

## PHASE 5-6: Chapter Text and Navigation

All 22 new chapters verified to have:
- KeyFindings block ✓
- TL;DR / Executive Summary ✓
- Introduction narrative ✓
- Forward transition to next chapter ✓

Navigation verified:
- constants.ts: 34 chapters, 6 ACTs ✓
- SEO: All 34 slugs have keywords, titles, descriptions, OpenGraph, JSON-LD ✓
- Sitemap: Auto-generates from CHAPTERS array ✓
- Homepage: ACT cards render dynamically from ACT_GROUPINGS ✓
- About page: Correct chapter count ✓
- Explore page: Data browser, no chapter references ✓
- ChapterSidebar, MobileNav, ChapterNavigation, Breadcrumb: All use dynamic CHAPTERS/ACT_GROUPINGS ✓

---

## PHASE 7: Verification

### Build
`npm run build` — **zero errors**. 34 chapter routes + homepage, about, explore, faq, sitemap, robots.

### Figure Accounting

| Disposition | Count |
|---|---|
| Moved from old chapters to new | 105 |
| Removed in Phase 1 | 8 |
| New figures computed | 64 |
| Orphaned (flagged for author) | 0 |
| TOTAL figures in old Ch 1–31 | 113 |

Verification: Moved (105) + Removed (8) = 113 = TOTAL ✓

New chapter total: 169 figures (ACTs 1-5) + 190 figures (ACT 6 Deep Dives) = 359 total visualizations.

### Navigation and Redirect Check
- [x] Navigation sidebar shows 6 ACTs with correct chapter nesting
- [x] Homepage cards reflect the new structure
- [x] Explore page functions correctly
- [x] 31 old chapter URLs have Vercel redirects configured
- [x] Sitemap auto-generates from CHAPTERS array (new URLs only)
- [x] Hero counter: 34 chapters, 359 visualizations
- [x] No broken internal links to old chapter slugs
- [x] ACT 5 → ACT 6 labels updated in all Deep Dives chapters
