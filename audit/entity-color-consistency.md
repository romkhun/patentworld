# Entity Color Consistency Audit

**Date:** 2026-02-21
**Source:** Consolidated from audit-report.md (Section 3.13) and code-level-audit.md (Section 1.9.9)

---

## Summary

| Metric | Value |
|--------|-------|
| Centralized color file | `src/lib/colors.ts` |
| Named color palettes | 20+ maps and arrays |
| ENTITY_COLORS entries | 15 (top assignees: IBM, Samsung, Canon, etc.) |
| CHART_COLORS entries | 9 (general categorical palette) |
| REGION_COLORS entries | 7 (geographic regions) |
| Hardcoded hex values remaining | 19 |
| Data-encoding hardcoded colors | **0** |

All named entity colors are defined centrally in `src/lib/colors.ts` and are consistent across all chart components that use them. The Okabe-Ito colorblind-safe palette is used throughout.

---

## Centralized Palettes in `src/lib/colors.ts`

| Palette | Entries | Purpose |
|---------|---------|---------|
| `CHART_COLORS` | 9 | General categorical palette |
| `BUMP_COLORS` | 15 | Bump charts, multi-line |
| `CPC_SECTION_COLORS` | 9 | CPC technology sections A-H, Y |
| `WIPO_SECTOR_COLORS` | 5 | WIPO technology sectors |
| `TOPIC_COLORS` | 25 | Topic modeling scatter plots |
| `GREEN_CATEGORY_COLORS` | 10 | Green innovation sub-categories |
| `COUNTRY_COLORS` | 7 | Assignee country of origin |
| `INDUSTRY_COLORS` | 10 | Industry/portfolio analysis |
| `ENTITY_COLORS` | 15 | Top assignees (IBM, Samsung, etc.) |
| `REGION_COLORS` | 7 | Geographic regions (moved from PWWorldFlowMap) |
| `SEMI_SUBFIELD_COLORS` | 10 | Semiconductor sub-categories |
| `QUANTUM_SUBFIELD_COLORS` | 8 | Quantum computing sub-categories |
| `CYBER_SUBFIELD_COLORS` | 7 | Cybersecurity sub-categories |
| `BIOTECH_SUBFIELD_COLORS` | 7 | Biotechnology sub-categories |
| `DIGIHEALTH_SUBFIELD_COLORS` | 12 | Digital health sub-categories |
| `AGTECH_SUBFIELD_COLORS` | 6 | Agricultural technology |
| `AV_SUBFIELD_COLORS` | 5 | Autonomous vehicles |
| `SPACE_SUBFIELD_COLORS` | 8 | Space technology |
| `PRINT3D_SUBFIELD_COLORS` | 9 | 3D printing |
| `BLOCKCHAIN_SUBFIELD_COLORS` | 3 | Blockchain |
| `PATENT_TYPE_COLORS` | 4 | Utility/Design/Plant/Reissue |
| `ASSIGNEE_TYPE_COLORS` | 5 | Corporate/Individual/University |
| `FILING_ROUTE_COLORS` | 3 | PCT/Direct Foreign/Domestic |
| `SEQUENTIAL_SCALE` | 9 | Viridis heatmap scale |
| `DIVERGING_SCALE` | 9 | Blue-orange diverging scale |

**Total defined entity-color pairs:** 220+ across all categorical maps, scales, and arrays.

---

## Fixes Applied (Phase 2B)

Two centralization issues were identified and resolved:

| # | Component | Issue | Fix |
|---|-----------|-------|-----|
| 1 | `PWWorldFlowMap.tsx` | Defined 7 `REGION_COLORS` locally instead of importing from `colors.ts` | Moved `REGION_COLORS` to `colors.ts`; component now imports from centralized file |
| 2 | `PWSankeyDiagram.tsx` | Hardcoded `#0072B2` and `#D55E00` for net-flow semantics | Now imports `CHART_COLORS` from `colors.ts` |

---

## Remaining Hardcoded Values

19 hardcoded hex values remain across chart components. All are **neutral grays and whites** used for axes, borders, reference lines, and background strokes -- not for encoding data entities:

| Color | Usage | Files |
|-------|-------|-------|
| `#9ca3af` (gray-400) | Reference/average lines | PWLineChart, PWFanChart, PWAreaChart, PWLollipopChart, PWBubbleScatter, PWScatterChart, PWSmallMultiples, PWBarChart |
| `#d1d5db` (gray-300) | Annotation strokes, chip backgrounds | TimeAnnotations, PWSeriesSelector |
| `#999` / `#999999` | Fallback gray for missing data | PWBubbleScatter, PWWorldFlowMap |
| `#888` | Fallback for missing node color | PWChordDiagram, PWTreemap |
| `#fff` | White stroke for active dots, text on dark backgrounds | PWLineChart, PWBumpChart, PWNetworkGraph, PWTreemap |
| `#ddd` | Light border/divider | Various |
| `#f0f4ff` | Light blue background in heatmap | PWValueHeatmap |

These are structurally appropriate for non-data-encoding visual elements (reference lines, active state indicators, contrast strokes) and do not represent entity or category colors.

---

## Verification

Post-fix verification (audit-report.md Section 3.13):

- PWSankeyDiagram: **PASS** (imports CHART_COLORS from colors.ts)
- PWWorldFlowMap: **PASS** (imports REGION_COLORS from colors.ts)
- All 15 ENTITY_COLORS: consistent across all components that reference named entities
- 19 hardcoded hex values: all neutral grays, not data-encoding

---

## Status: PASS
