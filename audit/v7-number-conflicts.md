# PatentWorld v7 Audit -- Number Registry Conflict Detection

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** Sitewide number registry conflict detection per Constraint 35
**Reference:** `audit/number-registry.json`

---

## Method

A sitewide number registry was created at `audit/number-registry.json` cataloguing every headline number, its definition, denominator/basis, and all locations where it appears. Numbers were then checked for conflicts: cases where the same statistic appears with different values in different locations.

## Registry Contents

### Hero Statistics (4 values)

| Value | Definition | Locations | Consistent |
|-------|-----------|-----------|------------|
| 9.36M | Total US patents 1976--Sep 2025 (all types) | 7 locations (HERO_STATS, hero text, CounterStat, SITE_DESCRIPTION, JSON-LD, Ch1, llms.txt) | YES |
| 50 | Years of data coverage (1976--2025) | 3 locations (HERO_STATS, CounterStat, chart title) | YES |
| 34 | Total chapters | 3 locations (HERO_STATS, CounterStat, CHAPTERS array) | YES |
| 458 | Interactive visualizations (chapter ChartContainers) | 2 locations (HERO_STATS, CounterStat) | YES |

### Chapter Headline Numbers (34 sets)

Each of the 34 chapters has a set of headline numbers appearing in the homepage card description, chapter KeyFindings, Executive Summary, and (for some) SEO descriptions and FAQ items. All 34 sets were catalogued.

### Concordance Values (12)

The 12 statistics tracked in the concordance table (`v7-concordance-table.md`) were verified across homepage card, chapter page, SEO description, and JSON-LD. All 12 are consistent.

## Conflict Detection Results

### 0 conflicts found.

No statistic appears with conflicting values in different locations. Every number that appears in multiple places is consistent across all its occurrences.

### Minor Rounding Variations (Not Conflicts)

These are not conflicts but represent different levels of rounding precision for the same underlying value:

| Statistic | Precise Value | Rounded Version | Locations |
|-----------|--------------|----------------|-----------|
| 1976 patent count | 70,941 | "approximately 70,000" | Hero text uses rounded; Ch1 uses precise |
| 2024 patent count | 373,852 | "374,000" | Hero text uses rounded; Ch1 uses precise |
| Japan total | 1,448,180 | "1.45M" (card), "1.4M" (Ch8 page) | Minor inconsistency flagged in homepage-card-crosscheck |

The Japan rounding inconsistency (1.45M vs 1.4M) is documented as FLAG 2 in `v7-homepage-card-crosscheck.md` but does not constitute a factual conflict -- both are valid roundings of 1,448,180.

## Conclusion

0 conflicts found across 12 concordance values and 34 chapter headline number sets. The number registry confirms sitewide consistency of all headline statistics.

---

Status: COMPLETE
