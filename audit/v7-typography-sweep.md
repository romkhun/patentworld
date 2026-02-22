# PatentWorld v7 Audit -- Typography Sweep

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** Em-dash and en-dash corrections across all source files

---

## Method

A comprehensive search for typographic issues was conducted across all `.tsx` and `.ts` source files:
1. Double hyphens (` -- `) used as parenthetical dashes -- should be em-dash (U+2014).
2. Hyphen-minus (`-`) used in numeric ranges -- should be en-dash (U+2013).

## Em-Dash Fixes (231 instances)

### Chapter Pages (30 files, 231 total instances of ` -- `)

Every instance of ` -- ` (space-hyphen-hyphen-space) used as a parenthetical break was replaced with an em-dash (--) across 30 of the 34 chapter `page.tsx` files.

**Files affected:** All Act 1--6 chapter pages that contained double-hyphen parenthetical breaks. The 4 remaining chapter pages either used em-dashes already or did not contain parenthetical breaks.

**Audit finding ID:** M7d

### constants.ts (1 instance)

- **Line 149:** `'patents -- more than'` changed to em-dash.
- **Audit finding ID:** M7a

## En-Dash Fixes (Numeric Ranges)

### constants.ts

| Line | Before | After | Finding ID |
|------|--------|-------|-----------|
| 48 | `1976-1995` | `1976--1995` (en-dash) | M7c |
| 127 | `37-51%` | `37--51%` (en-dash) | M7b |
| (org-patent-count description) | `32-39%` | `32--39%` (en-dash) | M7b |
| (system-patent-quality description) | `0.45-0.55` | `0.45--0.55` (en-dash) | M7b |

### Chapter Pages (10 files)

En-dash corrections applied to numeric ranges in approximately 10 chapter pages where hyphen-minus was used between numbers (e.g., year ranges, percentage ranges, value ranges). Specific instances include:

- blockchain chapter: `2--3` range corrected to en-dash.
- Various chapters: year ranges like `2012-2023` corrected to en-dash where they appeared in narrative text (chart axis labels and data files were not modified).

## Typography Standards Applied

| Context | Correct Character | Unicode |
|---------|------------------|---------|
| Parenthetical break (interrupting clause) | Em-dash | U+2014 |
| Numeric range (e.g., "1976--2025") | En-dash | U+2013 |
| Compound modifier (e.g., "US-based") | Hyphen-minus | U+002D |
| Negative numbers (e.g., "-0.069") | Hyphen-minus | U+002D |

## Summary

| Fix Type | Count | Files Affected |
|----------|-------|---------------|
| Em-dash (parenthetical) | 231 + 1 | 30 chapter pages + constants.ts |
| En-dash (numeric range) | ~15 | 10 pages + constants.ts |
| **Total corrections** | **~247** | **~32 files** |

## Verification

Post-fix grep for ` -- ` across all chapter pages returned 0 results, confirming all parenthetical double-hyphens were corrected.

---

Status: COMPLETE
