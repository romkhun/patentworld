# PatentWorld v7 Audit — Chart Data Extraction & Recomputation (§1.11.22)

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6
**Status:** SCOPE LIMITATION — I CANNOT CONFIRM

---

## Scope Limitation

Runtime rendering verification was **SKIPPED** — the audit environment does not support headless browser execution (Playwright/Puppeteer). The following §1.11.22 requirements could not be fulfilled:

1. **Data capture:** Chart data payloads could not be extracted from rendered pages. No HAR network logs or inline data objects were captured.
2. **Independent recomputation:** Without extracted data payloads, independent recomputation of figure-level values against rendered output was not possible.
3. **Chart-data directory:** `audit/chart-data/` was not created because no chart data payloads were extracted.

## Fallback Verification Performed

Per §1.11.22 item 4, source-code-level data lineage tracing (§1.11.12) was used as the fallback methodology:

- All 459 ChartContainer components were traced to their `useChapterData` hook calls
- Data file paths were verified against `public/data/` directory (383 JSON files across 36 directories)
- Figure-to-data alignment was verified via code review for all chapter pages
- Key numbers (hero stats, homepage cards, superlatives) were independently verified using Python scripts in `audit/verification-scripts/`

## Findings Dependent on JS Rendering

The following finding categories are marked **"I cannot confirm"** due to the JS-rendering limitation:

- §1.1.9: Tooltip content verification (values, formatting, responsiveness)
- §1.1.10: Dark mode visual audit (chart contrast, hardcoded colors)
- §1.1.12: Debug metadata string detection (DataBadge rendering verified at source level; runtime appearance cannot be confirmed)
- §1.11.22: Chart data extraction and independent recomputation
- §4.10.2: Axis and label readability at 375px/768px/1280px
- §4.10.3: Responsive design verification

## Recommendation

When headless browser execution becomes available, run the full §1.11.22 pipeline:
1. Start dev server (`npm run dev`)
2. Capture rendered HTML, screenshots, and HAR logs for all 39 pages
3. Extract chart data payloads from network logs
4. Independently recompute all headline numbers against extracted data
5. Save results to `audit/chart-data/` and update this file with findings
