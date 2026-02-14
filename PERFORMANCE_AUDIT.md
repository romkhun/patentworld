# PatentWorld — Performance Audit (Stream 8)

## Scope

Performance audit and optimization targeting Lighthouse Performance >= 90 and passing Core Web Vitals. Covers static rendering, lazy loading, asset optimization, layout stability, and interactivity.

---

## Architecture Baseline

| Metric | Value |
|--------|-------|
| Framework | Next.js 14.2.35 (App Router) |
| Rendering | 100% Static (all 22 routes prerendered) |
| Chart libraries | Recharts (client-side), D3 (client-side) |
| Data loading | Client-side fetch with in-memory cache |
| Fonts | Google Fonts via next/font (3 families, all display: swap) |
| CSS | Tailwind CSS (purged at build time) |
| Total pages | 22 |

---

## 8.2 Static Rendering Verification

All 22 routes show static in the build output, confirming static generation:
- Narrative text, TL;DR blocks, chart titles, captions, insights, and figcaptions are all rendered into the HTML at build time
- Chart data is fetched client-side via useChapterData hook after hydration
- The article wrapper uses Schema.org itemScope attribute in the static HTML

Result: PASS

---

## 8.3 Lazy Loading

### Before
- ChartContainer used useInView only for CSS fade-in animation
- Chart children were always rendered regardless of scroll position

### After
- ChartContainer defers chart children rendering until container is within 200px of viewport
- useInView hook updated to support rootMargin for pre-loading
- Off-screen charts display skeleton loading states with explicit height

Key change in ChartContainer.tsx: condition changed from loading-only to loading-or-not-inView. On a typical chapter page with 10+ charts, only the first 1-2 charts render immediately.

---

## 8.4 Asset Optimization

### Data Files

| Optimization | Before | After | Savings |
|-------------|--------|-------|---------|
| Total /public/data/ | 11.0 MB | 6.1 MB | -4.9 MB (45%) |
| innovation_diffusion.json | 4.5 MB | 9.1 KB (precomputed summary) | -4.5 MB (99.8%) |
| topic_umap.json | 1.7 MB | 501 KB (downsampled 15K to 5K) | -1.2 MB (70%) |
| regional_specialization.json | 678 KB | 666 KB (float trimming) | -12 KB |
| company_profiles.json | 1.2 MB | 1.2 MB (float trimming) | minimal |

Details:
- innovation_diffusion.json: Component only used aggregate summary statistics. Pre-computed the 9.1KB summary server-side, eliminating 29,162 records.
- topic_umap.json: Downsampled from 15,000 to 5,000 points (200/topic). Visual density preserved.
- Float precision trimmed to 2-3 decimal places across all large files.

### JavaScript Bundles

| Route | Page JS | First Load JS |
|-------|---------|---------------|
| Home | 4.3 KB | 101 KB |
| About | 179 B | 96.5 KB |
| Average chapter | ~12 KB | ~243 KB |
| Shared JS | -- | 87.6 KB |

Recharts and D3 are only loaded by the pages that use them.

### Fonts
- 3 Google Fonts loaded via next/font/google with subsets: latin and display: swap
- font-display: swap prevents invisible text during font loading

### Images
- No img tags in the application -- all visualizations are SVG/Canvas
- OG images (~230 KB each) are only served as meta tags, not rendered inline

---

## 8.5 Layout Stability (CLS)

| Element | Explicit Dimensions | Notes |
|---------|:---:|-------|
| ChartContainer | height prop (default: 600px) | Always has explicit height |
| Chart loading skeleton | Same height as chart | Fills the same space |
| Fonts | font-display: swap | Prevents layout shift |
| Images | N/A | No inline images |

---

## 8.6 Interactivity (INP)

All interactions are lightweight React state updates or D3 DOM operations:
- Chart hover/tooltip: immediate (Recharts React state)
- Company selector search: immediate (React useState)
- Decade/filter selectors: immediate (state toggle)
- Theme toggle: immediate (next-themes class toggle)
- Network graph drag: immediate (D3 force simulation, requestAnimationFrame)

---

## 8.7 Performance Summary

| Metric | Expected | Target | Notes |
|--------|----------|--------|-------|
| Performance | 90-95 | >= 90 | Static HTML, deferred charts, optimized data |
| LCP | < 1.5s | < 2.5s | Static HTML served immediately from CDN |
| INP | < 100ms | < 200ms | Lightweight state updates |
| CLS | < 0.05 | < 0.1 | All containers have explicit dimensions |

---

## Files Modified

| File | Changes |
|------|---------|
| src/components/charts/ChartContainer.tsx | Defer chart children until inView; skeleton for off-screen |
| src/hooks/useInView.ts | Added rootMargin support (200px pre-load) |
| src/app/chapters/the-geography-of-innovation/page.tsx | Switch from 4.5MB raw data to 9KB precomputed summary |
| public/data/chapter12/topic_umap.json | Downsampled from 15K to 5K points |
| src/app/chapters/the-language-of-innovation/page.tsx | Updated text to reflect 5K sample size |
| public/data/chapter4/innovation_diffusion.json | Removed (replaced by summary) |
| public/data/chapter4/innovation_diffusion_summary.json | Created (9.1 KB) |
| public/data/chapter4/regional_specialization.json | Float precision trimmed |
| public/data/company/company_profiles.json | Float precision trimmed |

---

## Build Verification

```
npm run build -> Compiled successfully
All 22 routes prerendered as static content
No TypeScript errors, no build warnings
Total data payload: 6.1 MB (reduced from 11.0 MB)
```

---

*Performance audit completed 2026-02-13. Lazy loading implemented, data files optimized (45% reduction), CLS prevention verified, all builds passing.*
