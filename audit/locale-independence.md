# Locale Independence Audit

**Date:** 2026-02-21
**Source:** Consolidated from code-level-audit.md (Section 1.6.21) and audit-report.md (Phase 2B, LOCALE-1)

---

## Summary

| Metric | Value |
|--------|-------|
| Total `.toLocaleString()` calls audited | 43 |
| Bare calls (no explicit locale) found | 42 |
| Already correct (with `'en-US'`) | 1 (`formatCount()` in `formatters.ts`) |
| Calls fixed | 42 |
| Remaining bare calls | **0** |

All 42 bare `.toLocaleString()` calls were replaced with `.toLocaleString('en-US')` to ensure consistent number formatting regardless of the user's browser locale. Additionally, `formatCompact()` in `src/lib/formatters.ts` was fixed (it had `undefined` as the locale parameter).

---

## Root Cause

The codebase used `.toLocaleString()` without an explicit locale argument. While `<html lang="en">` is set, `.toLocaleString()` ignores the page language and instead uses the browser's system locale. A user in Germany would see `1.000` instead of `1,000` for one thousand.

---

## Files Affected (17)

The 42 bare calls were distributed across 17 files (chart components, chapter pages, and the shared formatter):

| # | File | Bare Calls | Context |
|---|------|-----------|---------|
| 1 | `src/lib/formatters.ts` | 1 | `formatCompact()` used `undefined` locale |
| 2 | `src/components/charts/PWChoroplethMap.tsx` | 1 | `formatDefault()` helper |
| 3 | `src/components/charts/PWWorldFlowMap.tsx` | 2 | Flow count formatting |
| 4 | `src/components/charts/PWScatterChart.tsx` | 1 | Tooltip values |
| 5 | `src/components/charts/PWNetworkGraph.tsx` | 1 | Patent count tooltip |
| 6 | `src/components/charts/PWConvergenceMatrix.tsx` | 1 | Patent count tooltip |
| 7 | `src/components/charts/PWBubbleScatter.tsx` | 1 | Patent count tooltip |
| 8 | `src/components/charts/RankingTable.tsx` | 1 | Cell rendering |
| 9 | `src/components/HomeContent.tsx` | 1 | Hero stat formatting |
| 10 | `src/app/chapters/biotechnology/page.tsx` | 2 | Inline stats |
| 11 | `src/app/chapters/space-technology/page.tsx` | 2 | Inline stats |
| 12 | `src/app/chapters/ai-patents/page.tsx` | 2 | Inline stats |
| 13 | `src/app/chapters/3d-printing/page.tsx` | 2 | Inline stats |
| 14 | `src/app/chapters/blockchain/page.tsx` | 2 | Inline stats |
| 15 | `src/app/chapters/quantum-computing/page.tsx` | 2 | Inline stats |
| 16 | `src/app/chapters/green-innovation/page.tsx` | 2 | Inline stats |
| 17 | `src/app/chapters/cybersecurity/page.tsx` | 2 | Inline stats |

Additional files with bare calls were also fixed in the same pass (see audit-report.md Phase 2B for the complete 25-file list including chapter pages with 1-3 calls each such as `system-public-investment`, `system-patent-fields`, `inv-serial-new`, `org-patent-count`, `inv-gender`, `agricultural-technology`, `geo-domestic`, `mech-inventors`, `deep-dive-overview`, `inv-top-inventors`, `digital-health`, `autonomous-vehicles`, `semiconductors`, and `mech-geography`).

---

## Fix Applied

All bare `.toLocaleString()` calls were changed to `.toLocaleString('en-US')`:

```diff
- value.toLocaleString()
+ value.toLocaleString('en-US')

- n.toLocaleString(undefined, { maximumFractionDigits: 1 })
+ n.toLocaleString('en-US', { maximumFractionDigits: 1 })
```

---

## Verification

Post-fix verification (audit-report.md Section 3.15) confirmed:

- **0 bare `.toLocaleString()` calls remaining** across the entire codebase
- All 41 remaining `.toLocaleString()` instances use `'en-US'` explicitly
- No `Intl.NumberFormat` or `Intl.DateTimeFormat` usage found (these would also need explicit locales)

---

## Status: PASS
