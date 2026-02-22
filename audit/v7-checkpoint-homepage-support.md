# PatentWorld v7 Audit -- Checkpoint: Homepage + Support Pages

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Phase:** 1 (Per-Element Verification)
**Scope:** Homepage, Methodology, About, Explore, FAQ pages

---

## Homepage Verification

### Hero Statistics
| Stat | Declared | Verified | Source | Status |
|------|----------|----------|--------|--------|
| 9.36M Patents | 9.36M | 9,361,444 | `patents_per_year.json` | CORRECT |
| 50 Years | 50 | 50 unique years (1976--2025) | `patents_per_year.json` | CORRECT |
| 34 Chapters | 34 | 34 entries in CHAPTERS array | `constants.ts` | CORRECT |
| 458 Visualizations | 458 | 458 ChartContainer instances | grep count | CORRECT |

### Hero Text Claims
- "approximately 70,000 in 1976" -- 70,941 actual. CORRECT.
- "374,000 in 2024" -- 373,852 actual. CORRECT.
- "more than five-fold" -- 5.27x actual. CORRECT.
- "27% to 57%" (G+H CPC sections) -- 27.0% to 57.3%. CORRECT.
- Partial-year disclosure "(2025 data through September)" -- present at `HomeContent.tsx:92`. CORRECT.

### Homepage Chart
- 1 ChartContainer (`id="fig-homepage-patent-volume"`). Valid, unique.

### Chapter Cards (34)
- All 34 cards verified against chapter page text. See `audit/homepage-card-crosscheck.md` for full table.
- 3 minor flags (originality 0.45-0.55 data question, Japan 1.45M rounding, top-100 boundary). None critical.

## Support Pages

### Methodology
- 18 derived metrics defined. Entropy scales disambiguated (v6 fix confirmed).
- Modified Gini: NOT defined (H6, deferred).
- Limitations section present with link from About page.

### About
- FAQ section: MISSING (M4, deferred). No `id="faq"` anchor.
- Author affiliation: verified.

### Explore
- Client-side only (H8, deferred). No server-rendered content.

### FAQ
- FAQ JSON-LD in homepage `page.tsx` -- statistics verified (9.36M, 393,000 peak, IBM 161,888, Samsung 157,906, Canon 88,742).

## Critical Fixes Applied

- **C1 (CRITICAL, FIXED):** `seo.ts:255` -- JSON-LD Dataset description said "US utility patents." Changed to "US patents (utility, design, plant, and reissue)" to match actual 9.36M denominator.
- **C2 (CRITICAL, FIXED):** `chapterMeasurementConfig.ts:11` -- system-patent-count notes said "Utility patents only." Changed to "All patent types."

## Status: COMPLETE

Phase 1 Homepage + support pages complete. Hero stats verified (9.36M, 50, 34, 458). JSON-LD denominator fixed (C1). Measurement config fixed (C2).
