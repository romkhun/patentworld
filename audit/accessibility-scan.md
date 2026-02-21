# Lighthouse Scan Results — Full Site

**Date:** 2026-02-21
**Tool:** Lighthouse 12.8.2
**Target:** https://patentworld.vercel.app/ (live Vercel deployment)
**Pages scanned:** 38 (all routes)

## Summary

| Metric | Value |
|--------|-------|
| **Accessibility** — Average | **100.0%** |
| **Accessibility** — Pages at 100% | **38/38** |
| **SEO** — Average | **100.0%** |
| **SEO** — Pages at 100% | **38/38** |
| **Best Practices** — Average | 99.8% |
| **Best Practices** — Pages at 100% | 36/38 (2 scanned locally over HTTP) |
| **Performance** — Average | 80.7% |
| **Performance** — Range | 65–96 |

## Full Results

| Page | Perf | A11y | BP | SEO |
|------|------|------|----|-----|
| / | 87 | 100 | 100 | 100 |
| /about/ | 96 | 100 | 100 | 100 |
| /explore/ | 93 | 100 | 100 | 100 |
| /methodology/ | 93 | 100 | 100 | 100 |
| /chapters/system-patent-count/ | 94 | 100 | 100 | 100 |
| /chapters/system-patent-quality/ | 78 | 100 | 100 | 100 |
| /chapters/system-patent-fields/ | 72 | 100 | 100 | 100 |
| /chapters/system-convergence/ | 89 | 100 | 100 | 100 |
| /chapters/system-language/ | 82 | 100 | 100 | 100 |
| /chapters/system-patent-law/ | 80 | 100 | 100 | 100 |
| /chapters/system-public-investment/ | 85 | 100 | 100 | 100 |
| /chapters/org-composition/ | 87 | 100 | 100 | 100 |
| /chapters/org-patent-count/ | 83 | 100 | 96* | 100 |
| /chapters/org-patent-quality/ | 76 | 100 | 100 | 100 |
| /chapters/org-patent-portfolio/ | 79 | 100 | 100 | 100 |
| /chapters/org-company-profiles/ | 66 | 100 | 100 | 100 |
| /chapters/inv-top-inventors/ | 79 | 100 | 100 | 100 |
| /chapters/inv-generalist-specialist/ | 81 | 100 | 100 | 100 |
| /chapters/inv-serial-new/ | 81 | 100 | 100 | 100 |
| /chapters/inv-gender/ | 84 | 100 | 100 | 100 |
| /chapters/inv-team-size/ | 83 | 100 | 100 | 100 |
| /chapters/geo-domestic/ | 71 | 100 | 100 | 100 |
| /chapters/geo-international/ | 80 | 100 | 100 | 100 |
| /chapters/mech-organizations/ | 73 | 100 | 100 | 100 |
| /chapters/mech-inventors/ | 85 | 100 | 100 | 100 |
| /chapters/mech-geography/ | 80 | 100 | 100 | 100 |
| /chapters/3d-printing/ | 83 | 100 | 100 | 100 |
| /chapters/agricultural-technology/ | 79 | 100 | 100 | 100 |
| /chapters/ai-patents/ | 76 | 100 | 100 | 100 |
| /chapters/autonomous-vehicles/ | 83 | 100 | 96* | 100 |
| /chapters/biotechnology/ | 74 | 100 | 100 | 100 |
| /chapters/blockchain/ | 80 | 100 | 100 | 100 |
| /chapters/cybersecurity/ | 75 | 100 | 100 | 100 |
| /chapters/digital-health/ | 78 | 100 | 100 | 100 |
| /chapters/green-innovation/ | 80 | 100 | 100 | 100 |
| /chapters/quantum-computing/ | 74 | 100 | 100 | 100 |
| /chapters/semiconductors/ | 83 | 100 | 100 | 100 |
| /chapters/space-technology/ | 65 | 100 | 100 | 100 |

*96% Best Practices: These pages were re-scanned locally over HTTP after Vercel bot protection blocked remote scans. The missing 4 points are the HTTPS audit, which passes on the production deployment.

## Accessibility Fixes Applied (Cumulative)

1. Footer copyright contrast: removed `/70` opacity on `text-muted-foreground`
2. Footer nav touch targets: added `py-1` padding
3. Badge/toggle contrast: `text-muted-foreground` → `text-foreground/70` (22 instances across 17 files)
4. Homepage heading order: added `headingLevel` prop to ChartContainer
5. Mobile TOC summary contrast: changed to `text-foreground/70`
6. Methodology/About nav links: added `py-0.5` for touch target height
7. Global muted-foreground: darkened from `215 16% 47%` to `215 16% 45%`
8. Company selector: added `aria-label="Select company"` to combobox button
9. About page touch targets: added `py-0.5` and `inline-block` to chapter links
10. RankingTable contrast: `text-muted-foreground` → `text-foreground/70` on summary, headers, rank numbers
11. PWTimeline heading order: `<h4>` → `<h3>` for event titles
12. system-convergence table semantics: `<td>` → `<th scope="row">` for row headers
13. PWSeriesSelector contrast: unselected series `text-muted-foreground/50` → `text-foreground/50`

## Performance Notes

Performance scores range from 65–96 and are driven primarily by JavaScript bundle size for data-heavy chapter pages (each loads multiple JSON datasets client-side). This is expected for a static site with client-side charting (Recharts). Key factors:

- **Highest performance** (93–96): Static content pages (about, explore, methodology) with minimal JS
- **Lowest performance** (65–76): Dense chapters with 15+ charts (org-company-profiles, space-technology, system-patent-fields) loading multiple large JSON files
- All pages use static export (SSG) with no server-side bottlenecks
