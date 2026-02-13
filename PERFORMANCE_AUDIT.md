# PatentWorld — Performance Audit

## Architecture Summary

PatentWorld is a **fully static Next.js 14 site** (all pages prerendered at build time).
- No API routes or server-side data fetching
- All data served as static JSON files from `/public/data/`
- Charts are client-side rendered using Recharts and D3

## Build Output Analysis

All 22 pages prerendered as static content (`○` symbol):
```
Route (app)                                Size     First Load JS
┌ ○ /                                      4.27 kB         101 kB
├ ○ /_not-found                            880 B          88.5 kB
├ ○ /about                                 179 B          96.5 kB
├ ○ /chapters/ai-patents                   8.39 kB         243 kB
├ ○ /chapters/collaboration-networks       30.6 kB         258 kB
├ ○ /chapters/company-profiles             9.35 kB         248 kB
├ ○ /chapters/green-innovation             9.6 kB          238 kB
├ ○ /chapters/innovation-dynamics          10.6 kB         239 kB
├ ○ /chapters/patent-law                   18.8 kB         237 kB
├ ○ /chapters/patent-quality               11.3 kB         235 kB
├ ○ /chapters/the-geography-of-innovation  22.9 kB         247 kB
├ ○ /chapters/the-innovation-landscape     7.65 kB         230 kB
├ ○ /chapters/the-inventors                13.9 kB         243 kB
├ ○ /chapters/the-knowledge-network        13.1 kB         237 kB
├ ○ /chapters/the-language-of-innovation   9.3 kB          242 kB
├ ○ /chapters/the-technology-revolution    17.3 kB         246 kB
├ ○ /chapters/who-innovates                7.64 kB         242 kB
├ ○ /explore                               3.19 kB        90.8 kB
+ First Load JS shared by all              87.6 kB
```

## Optimizations Applied

### Static Generation
- ✅ All pages use static generation (prerendered at build time)
- ✅ Narrative text and chart annotations in raw HTML
- ✅ No API routes or server-side rendering

### Font Optimization
- ✅ `next/font/google` used for Playfair Display, Plus Jakarta Sans, JetBrains Mono
- ✅ `display: 'swap'` set on all fonts (prevents FOIT)
- ✅ `latin` subset only (minimizes font file size)

### Code Splitting
- ✅ Heavy chart libraries (Recharts, D3) only imported in client components
- ✅ `'use client'` directive limits client-side JS to interactive components
- ✅ Shared JS bundle is 87.6 kB (reasonable for a data-rich site)

### Data Files
- ✅ Data split into per-chapter directories (only needed data loaded per page)
- ✅ Most data files under 100 KB
- ⚠️ `innovation_diffusion.json` (4.6 MB) and `topic_umap.json` (1.7 MB) are large but loaded only on their respective pages

### Layout Stability (CLS)
- ✅ ChartContainer provides consistent height wrapper for all charts
- ✅ Loading skeleton shown while data loads (prevents layout shift)
- ✅ Fonts use `font-display: swap`
- ✅ IntersectionObserver-based fade-in animation for charts

### Caching
- ✅ Static assets get immutable caching headers via Vercel
- ✅ JSON data files served from `/public/` with appropriate caching
- ✅ No dynamic API calls that need ISR

### Accessibility
- ✅ `aria-label` on all chart containers (ChartContainer, PWChordDiagram, PWSankeyDiagram, PWNetworkGraph)
- ✅ `role="img"` on D3 SVG components
- ✅ Proper heading hierarchy: h1 (ChapterHeader) → h2 (KeyFindings, TL;DR, RelatedChapters) → h3 (ChartContainer)
- ✅ Focus indicators on interactive elements

### SEO
- ✅ JSON-LD structured data: WebSite, Dataset, Article, BreadcrumbList, FAQPage
- ✅ OpenGraph and Twitter Card meta tags on all pages
- ✅ Canonical URLs on all pages
- ✅ Sitemap.xml generated dynamically
- ✅ robots.txt allows all search engines and AI crawlers

## Data File Size Report

| Directory | Total Size | Largest File |
|-----------|-----------|--------------|
| chapter1/ | 40 KB | patents_per_year.json (13 KB) |
| chapter2/ | 85 KB | wipo_fields_per_year.json (35 KB) |
| chapter3/ | 180 KB | firm_collaboration_network.json (45 KB) |
| chapter4/ | 5.4 MB | innovation_diffusion.json (4.6 MB) |
| chapter5/ | 220 KB | inventor_collaboration_network.json (95 KB) |
| chapter6/ | 160 KB | citations_per_year.json (30 KB) |
| chapter7/ | 90 KB | cross_domain.json (25 KB) |
| chapter9/ | 140 KB | composite_quality_index.json (35 KB) |
| chapter10/ | 25 KB | convergence_matrix.json (15 KB) |
| chapter11/ | 120 KB | ai_by_subfield.json (30 KB) |
| chapter12/ | 1.9 MB | topic_umap.json (1.7 MB) |
| company/ | 2.3 MB | company_profiles.json (1.2 MB) |
| green/ | 45 KB | green_by_category.json (15 KB) |
| explore/ | 200 KB | top_assignees_all.json (100 KB) |

## Visualization Quality

- ✅ Consistent color palette across all chart components (CHART_COLORS, CPC_SECTION_COLORS, COUNTRY_COLORS, etc.)
- ✅ Number formatting with K/M notation via `formatCompact()` on all Recharts axis ticks and tooltips
- ✅ Tooltips present on all interactive charts with consistent styling (TOOLTIP_STYLE)
- ✅ No line charts exceed 6 data series (all use 1–4 lines)
- ✅ Bar charts sorted meaningfully (by value or chronologically)
- ✅ PWScatterChart: axis formatting and labeled axes added
- ✅ PWRankHeatmap: hover tooltips added showing full org name, year, and rank

## Recommendations (Future)

1. **Lazy loading**: Consider `next/dynamic` for chart components below the fold to reduce initial JS
2. **Large data files**: `innovation_diffusion.json` (4.6 MB) and `topic_umap.json` (1.7 MB) could be paginated or virtualized
3. **Data compression**: `company_profiles.json` (1.2 MB) could be split by company for on-demand loading
4. **OG images**: Generate branded OG images for each chapter using `next/og` for social sharing
5. **Lighthouse audit**: Run Lighthouse on deployed site for production-level metrics
6. **Reference lines**: Add historical event reference lines to time-series charts (recessions, major legislation)
