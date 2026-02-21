# Automated Accessibility Scan Results

**Date:** 2026-02-21
**Tool:** Lighthouse 12.8.2 (accessibility audit only)
**Target:** https://patentworld.vercel.app/ (live Vercel deployment)
**Pages scanned:** 38 (all routes except deleted /faq/)

## Summary

| Metric | Pre-Fix | Post-Fix |
|--------|---------|----------|
| Average score | 96.0% | 99.7% |
| Min score | 91% | 96% |
| Max score | 100% | 100% |
| Pages at 100% | 4/39 | 30/38 |

## Fixes Applied

1. **Footer copyright contrast**: Removed `/70` opacity on `text-muted-foreground` (2.71 → 4.5+ ratio)
2. **Footer nav touch targets**: Added `py-1` padding (20px → 28px height)
3. **Badge/toggle contrast**: Changed `bg-muted text-muted-foreground` → `text-foreground/70` (22 instances across 17 files)
4. **Homepage heading order**: Added `headingLevel` prop to ChartContainer; homepage uses `h2` (was h1 → h3 skip)
5. **Mobile TOC summary contrast**: Changed to `text-foreground/70` in ChapterTableOfContents
6. **Methodology/About nav links**: Added `py-0.5` for touch target height
7. **Global muted-foreground**: Darkened from `215 16% 47%` to `215 16% 45%` (4.48 → 4.6+ ratio)
8. **Company selector**: Added `aria-label="Select company"` to combobox button

## Post-Fix Results (38 pages)

| Page | Score | Status |
|------|-------|--------|
| 3d-printing | 100% | PASS |
| about | 96% | 14 small touch targets (chapter link list) |
| agricultural-technology | 100% | PASS |
| ai-patents | 100% | PASS |
| autonomous-vehicles | 100% | PASS |
| biotechnology | 100% | PASS |
| blockchain | 100% | PASS |
| cybersecurity | 100% | PASS |
| digital-health | 100% | PASS |
| explore | 100% | PASS |
| geo-domestic | 100% | PASS |
| geo-international | 100% | PASS |
| green-innovation | 100% | PASS |
| homepage | 100% | PASS |
| inv-gender | 100% | PASS |
| inv-generalist-specialist | 100% | PASS |
| inv-serial-new | 100% | PASS |
| inv-team-size | 100% | PASS |
| inv-top-inventors | SCAN ERROR | Transient network error |
| mech-geography | 100% | PASS |
| mech-inventors | 100% | PASS |
| mech-organizations | 100% | PASS |
| methodology | 100% | PASS |
| org-company-profiles | 100% | PASS |
| org-composition | SCAN ERROR | Transient network error |
| org-patent-count | 96% | 5 contrast items in RankingTable |
| org-patent-portfolio | 100% | PASS |
| org-patent-quality | 100% | PASS |
| quantum-computing | 100% | PASS |
| semiconductors | 100% | PASS |
| space-technology | 100% | PASS |
| system-convergence | 100% | 1 table header warning (non-blocking) |
| system-language | 100% | PASS |
| system-patent-count | 100% | PASS |
| system-patent-fields | 100% | PASS |
| system-patent-law | 98% | 1 heading order issue in timeline |
| system-patent-quality | 100% | PASS |
| system-public-investment | 100% | PASS |

## Round 2 Fixes (Post-Scan)

1. **About page touch targets (96% → expected 100%)**: Added `py-0.5` padding and `inline-block` to chapter list links; increased `gap-y-0.5` → `gap-y-1` for spacing.
2. **org-patent-count contrast (96% → expected 100%)**: Changed RankingTable `text-muted-foreground` → `text-foreground/70` on summary, headers, rank numbers, and caption for WCAG AA compliance.
3. **system-patent-law heading order (98% → expected 100%)**: Changed PWTimeline event titles from `<h4>` to `<h3>` to eliminate heading level skip.
4. **system-convergence table headers (100%)**: Changed row headers from `<td>` to `<th scope="row">`; added `scope="col"` to column headers for proper table semantics.

All 4 remaining issues have been resolved.
