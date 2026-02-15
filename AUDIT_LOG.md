# PatentWorld Audit Log

**Audit started:** 2026-02-15
**Site:** patentworld.vercel.app
**Structure:** 34 chapters across 6 ACTs, ~359 visualizations

---

## Tech Stack and Project Layout

- **Framework:** Next.js 14.2 (App Router) with static export (`output: 'export'`)
- **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Charts:** Recharts 3.7, D3 modules (d3-force, d3-geo, d3-chord, d3-sankey, d3-scale, d3-shape)
- **UI:** Lucide React icons, class-variance-authority, clsx, tailwind-merge
- **Themes:** next-themes (dark/light mode)
- **Maps:** topojson-client, d3-geo (Albers USA, world-110m)
- **TypeScript:** 5.9, ESLint with next config
- **Deployment:** Vercel (primary), GitHub Pages (optional via DEPLOY_TARGET env)
- **Trailing slash:** enabled (`trailingSlash: true`)
- **Images:** unoptimized (static export constraint)

### Directory Structure

```
src/
  app/
    page.tsx                    # Home page
    layout.tsx                  # Root layout
    HomeContent.tsx             # Home page client component
    globals.css                 # Global styles
    robots.ts                   # robots.txt generator
    sitemap.ts                  # sitemap.xml generator
    about/page.tsx              # About page
    explore/page.tsx            # Explore page
    faq/page.tsx                # FAQ page
    chapters/
      layout.tsx                # Shared chapter layout (sidebar, nav, breadcrumbs)
      [34 chapter dirs]/        # Each with page.tsx + layout.tsx
  components/
    charts/                     # 22 chart components
      ChartContainer.tsx        # Wrapper with figure/figcaption/lazy loading
      PWLineChart, PWAreaChart, PWBarChart, PWScatterChart,
      PWBubbleScatter, PWBumpChart, PWChordDiagram, PWChoroplethMap,
      PWCompanySelector, PWConvergenceMatrix, PWFanChart,
      PWNetworkGraph, PWRadarChart, PWRankHeatmap, PWSankeyDiagram,
      PWSmallMultiples, PWTimeline, PWTreemap, PWWorldFlowMap,
      PWSeriesSelector, TimeAnnotations
    chapter/                    # 13 chapter content components
      ChapterHeader, ChapterTableOfContents, DataNote,
      GlossaryTooltip, KeyFindings, KeyInsight, Narrative,
      RankingTable, RelatedChapters, SectionDivider,
      StatCallout, StatCard, StatGrid
    layout/                     # 9 layout/navigation components
      BackToTop, Breadcrumb, ChapterNavigation,
      ChapterSidebar, Footer, Header, MobileNav,
      ReadingProgress, ThemeToggle
    ui/                         # UI primitives
    explore/                    # Explore page components
  lib/
    constants.ts                # CHAPTERS array (34), ACT_GROUPINGS (6), HERO_STATS
    seo.ts                      # Per-chapter SEO metadata (titles, descriptions, keywords)
    types.ts                    # TypeScript interfaces
    colors.ts                   # Color palette definitions
    chartTheme.ts               # Shared chart theming
    formatters.ts               # Number/date formatting utilities
    glossary.ts                 # Glossary tooltip definitions
    orgNames.ts                 # Organization name mappings
    referenceEvents.ts          # Timeline reference events
public/
  data/
    chapter1-12/                # Legacy chapter data JSON files
    computed/                   # 19 computed quality metric JSON files
    company/                    # Company profile data
    explore/                    # Explore page data
    green/, 3dprint/, agtech/, av/, biotech/, blockchain/,
    cyber/, digihealth/, quantum/, semiconductors/, space/
  geo/                          # TopoJSON maps (us-states.json, world-110m.json)
```

### 6-ACT Architecture Verification

34 chapter directories confirmed in `src/app/chapters/`:

| ACT | Title | Chapters | Count |
|-----|-------|----------|-------|
| 1 | The System | system-patent-count, system-patent-quality, system-patent-fields, system-convergence, system-language, system-patent-law, system-public-investment | 7 |
| 2 | The Organizations | org-composition, org-patent-count, org-patent-quality, org-patent-portfolio, org-company-profiles | 5 |
| 3 | The Inventors | inv-top-inventors, inv-generalist-specialist, inv-serial-new, inv-gender, inv-team-size | 5 |
| 4 | The Geography | geo-domestic, geo-international | 2 |
| 5 | The Mechanics | mech-organizations, mech-inventors, mech-geography | 3 |
| 6 | Deep Dives | 3d-printing, agricultural-technology, ai-patents, autonomous-vehicles, biotechnology, blockchain, cybersecurity, digital-health, green-innovation, quantum-computing, semiconductors, space-technology | 12 |

All 34 page.tsx files exist. Constants.ts CHAPTERS array has 34 entries. ACT_GROUPINGS has 6 entries.

---

## Phase-by-Phase Changes

### Phase 1 — Bug Fixes and Baseline Verification (COMPLETED)

See `BUGFIX_LOG.md` for full details. Key fixes:
- Hero counters verified: 9.36M patents, 50 years (1976-2025), 34 chapters, 359 visualizations
- Console errors fixed: null guards added for data loading edge cases
- Links and redirects verified: all 34 chapter URLs resolve, all old URLs redirect correctly
- Data integrity quick pass: no NaN/undefined/Infinity in chart data
- Company profiles (Ch 2.5): computed all 5 datasets for all 99 companies from raw PatentsView data
- Redundancy pass: removed unused old chapter artifacts

### Phase 2 — Content Accuracy Audit (COMPLETED)

See `ACCURACY_AUDIT.md` for full details. Key actions:
- Numerical claims verified across all 34 chapters against source data files
- Quality-metric figures verified: correct data sources, correct grouping variables, spot-checked values
- Takeaways and captions reviewed: overstated claims revised, vague language replaced with specific figures
- Trend/causal claims audited: "caused" → "coincided with" / "is consistent with" where appropriate
- Terminology corrections applied (Phase 2e): "American innovation" → "US patents", "innovation hub" → "region with high patent concentration", "transformative patents" → "highly cited patents", "dramatically" → "substantially", TL;DR → Executive Summary
- Paper references verified in Patent Law chapter (Ch 1.6) using 7-test protocol; 9 papers removed for failing tests
- Paper references in all other chapters verified

### Phase 3 — Tone and Language (COMPLETED)

See `TONE_AUDIT.md` for full details. Key actions:
- Phase 3a: Scanned all 34 chapters for informal language — no remaining instances found
- Phase 3b: Verified all hedging corrections from Phase 2d survived intact
- Phase 3c: Terminology standardization verified
- Phase 3d: All chart titles confirmed as insight-oriented declarative sentences with specific numbers
- Phase 3e: All charts have formal figcaptions with verified findings
- Phase 3f: Executive Summary and Key Findings sections verified — no verbatim repetition

### Phase 8 — About the Author (COMPLETED)

- Author bio updated to match exact specified text (removed extra sentence about PatentWorld development)
- Methodology section already present and comprehensive — covers all 7 quality metrics, data source, coverage, limitations
- Suggested citation block already present with correct text
- Chapter groupings correctly organized by ACT using ACT_GROUPINGS from constants.ts

### Phase 9d — robots.txt & Sitemap

- Updated `robots.ts` to match Phase 9d specification: removed `Bytespider` entry; kept `*`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Amazonbot`, `CCBot` — all with `Allow: /`.
- Verified `sitemap.ts` includes home, about, explore, FAQ, and all 34 chapter URLs (dynamically from `CHAPTERS` array).

**ACTION REQUIRED BY AUTHOR:** Review robots.txt AI bot policy — currently allows all AI bots. Change Google-Extended and CCBot to Disallow: / if you prefer to block AI training crawlers.

**ACTION REQUIRED BY AUTHOR:** After deployment, submit sitemap to Google Search Console and Bing Webmaster Tools.
