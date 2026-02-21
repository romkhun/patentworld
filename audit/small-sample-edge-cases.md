# Small-Sample Edge Cases Audit

**Date:** 2026-02-21
**Source:** Consolidated from glossary-error-states-audit.md (Section 3) and audit-report.md (Phase 2B, SSW-1 through SSW-5)

---

## Summary

| Metric | Value |
|--------|-------|
| Deep-dive chapters with DataNote small-sample warnings | 5 |
| Division-by-zero handling | Conditional rendering in charts |
| Partial-year 2025 disclosure | Site-wide ("through September") |
| 2025 data used in growth calculations | No (excluded from growth rates) |

---

## Small-Sample DataNote Warnings

Five deep-dive chapters cover technology domains that were nascent or nonexistent before 2000. These chapters received explicit DataNote small-sample warnings (added in Phase 2B, items SSW-1 through SSW-5):

| # | Chapter | Slug | Domain | Early-Year Data Concern |
|---|---------|------|--------|------------------------|
| 1 | Blockchain | `blockchain` | Blockchain/DLT | Virtually no patents before 2012 |
| 2 | Quantum Computing | `quantum-computing` | Quantum Computing | Minimal patents before 2005 |
| 3 | 3D Printing | `3d-printing` | Additive Manufacturing | Sparse data before 2010 |
| 4 | AI Patents | `ai-patents` | Artificial Intelligence | Low counts before 2000 |
| 5 | Autonomous Vehicles | `autonomous-vehicles` | AV/Self-Driving | Low counts before 2000 |

Each chapter now includes a DataNote warning similar to:

> "Patent counts in the early years of this domain are small (often fewer than 50 per year), and percentages derived from these counts may exhibit high volatility."

### Pre-existing Small-Sample Disclosures

Two chapters already had small-sample disclosures before the audit:

| Chapter | Disclosure |
|---------|-----------|
| `green-innovation` | Velocity cohort insight: "...though the small sample sizes for the 2010s (1 organization) and 2020s (2 organizations) cohorts prevent reliable velocity estimates for the most recent entrants." |
| `quantum-computing` | Velocity cohort insight: "The 1990s cohort (2 organizations, excluded for small sample size) had much higher velocity..." |

---

## Division-by-Zero Handling

Charts that compute derived values (percentages, ratios, growth rates) use conditional rendering to avoid division-by-zero errors:

- Charts render percentage values only when the denominator is non-zero
- ChartContainer shows a loading skeleton when data is not yet available
- `useChapterData` hook returns `null` for data before fetch completes; charts guard against null data with `data ?? []` patterns

No division-by-zero errors were observed during testing.

---

## Partial-Year 2025 Disclosure

### Site-Wide Disclosure

The chapters layout (`src/app/chapters/layout.tsx`) includes a persistent footer note:

> "Data coverage: January 1976 through September 2025. All 2025 figures reflect partial-year data."

This applies to all 34 chapter pages.

### Treatment in Growth Calculations

2025 data is **not** treated as a full year in growth calculations:

- Growth rates and trend analyses use complete years only
- The partial 2025 data is displayed in time-series charts as a data point but is not used to compute year-over-year growth rates
- Seven chapters include additional inline "(through September)" annotations in their text and chart titles: `inv-gender`, `mech-geography`, `system-patent-count`, `system-patent-quality`, `inv-team-size`, `system-public-investment`, and `system-patent-law` (which filters out 2025 in specific analyses)

---

## Chapters Not Requiring Small-Sample Warnings

The following deep-dive chapters cover established domains with substantial patent volumes dating back to 1976 and do not require early-year warnings:

| Chapter | Domain | Rationale |
|---------|--------|-----------|
| `semiconductors` | Semiconductors | Established since 1976, high volume throughout |
| `space-technology` | Space Technology | Established since 1976 |
| `agricultural-technology` | Agricultural Technology | Established since 1976 |
| `biotechnology` | Biotechnology | Meaningful volume from early 1980s |
| `cybersecurity` | Cybersecurity | Meaningful volume from early 1990s |
| `digital-health` | Digital Health | Meaningful volume from early 1990s |
| `green-innovation` | Green Innovation | Meaningful volume from 1976 (Y02 codes) |

---

## Status: PASS
