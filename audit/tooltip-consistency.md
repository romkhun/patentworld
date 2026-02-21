# PatentWorld Audit 1.6.19 -- Tooltip Formatting Consistency

**Date:** 2026-02-21
**Scope:** All 459 visualizations across 35 chapter pages and 21 chart components
**Files searched:** `src/app/chapters/*/page.tsx`, `src/components/charts/*.tsx`

---

## Executive Summary

The tooltip system is architecturally sound: a shared `TOOLTIP_STYLE` constant provides consistent visual styling (background, border, border-radius, font, padding, shadow) across all chart components. The `formatCompact` function serves as the default number formatter. However, there are **5 categories of inconsistency** detailed below.

**Overall severity: Low-to-Medium.** The inconsistencies are mostly cosmetic and follow a "best fit for context" pattern rather than true bugs, but a few edge cases produce visually jarring or semantically confusing tooltip text.

---

## 1. Tooltip Number Format Consistency

### Architecture

All Recharts-based chart components default to `formatCompact` when no `yFormatter` is provided:

| Component | Default formatter | Tooltip mechanism |
|---|---|---|
| PWLineChart | `formatCompact` | `formatter` prop + custom `content` when `truncationYear` set |
| PWBarChart | `formatCompact` | `formatter` prop |
| PWAreaChart | `formatCompact` (stacked%), `toFixed(1)%` (stackedPercent) | `formatter` prop |
| PWLollipopChart | `formatCompact` | `formatter` prop |
| PWSlopeChart | `formatCompact` | Custom HTML tooltip (SlopeTooltip) |
| PWScatterChart | `formatCompact` | Custom `content` prop |
| PWFanChart | `formatCompact` | Custom `content` prop (percentile labels) |
| PWBumpChart | N/A (rank) | `formatter` prop -- outputs `#N` or `N/A` |
| PWLorenzCurve | fraction->% | `formatter` prop -- `(v*100).toFixed(1)%` |
| PWCoefficientPlot | `toFixed(4)` | Custom `content` prop |
| PWTrajectoryScatter | `toFixed(4)` | Custom `content` prop (labeled X/Y) |
| PWBubbleScatter | Per-axis formatters | Custom `content` prop |
| PWSmallMultiples | `formatCompact` | `formatter` prop |
| PWTreemap | `formatCompact` | CustomTooltip component |
| PWNetworkGraph | `toLocaleString()` | Custom HTML tooltip |
| PWConvergenceMatrix | `toFixed(1)%` in cells, `toFixed(2)%` in detail | Custom HTML tooltip |
| PWValueHeatmap | `formatCompact` | Custom HTML tooltip |
| PWRankHeatmap | `#N` | Custom HTML tooltip |
| PWChoroplethMap | `formatDefault` (own copy of formatCompact) | Custom HTML tooltip |
| PWWorldFlowMap | Inline ternary | Custom HTML tooltip |
| PWSankeyDiagram | `formatCompact` | Custom HTML tooltip |
| PWChordDiagram | `formatCompact` | Custom HTML tooltip |

### `formatCompact` behavior
```ts
// From src/lib/formatters.ts
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
```

**Key observation:** `formatCompact` is used for both **axis ticks and tooltips**. This means tooltips for large patent counts show abbreviated forms like "12K" or "1.2M" rather than precise values like "12,345". The library provides a `formatCount(value, 'tooltip')` function that gives full precision (`12,345`) but it is **never used in any chart component**.

### Findings

| Issue | Count | Severity | Details |
|---|---|---|---|
| Tooltips use abbreviated `formatCompact` instead of full-precision `formatCount` for patent/citation counts | ~200+ charts | Low | Intentional design choice, but differs from stated formatter library design (`formatCount` was built for tooltip context) |
| `PWChoroplethMap` duplicates `formatCompact` as `formatDefault` rather than importing it | 1 component | Low | Identical logic, maintenance risk |
| `PWWorldFlowMap` uses inline ternary (`total >= 1000 ? ... : toLocaleString()`) instead of `formatCompact` | 1 component | Low | Functionally equivalent but inconsistent with other components |
| `system-patent-fields` uses `v.toLocaleString()%` which produces `"1,234%"` instead of `"1,234%"` (correct but odd for percentages) | 1 chart | Medium | Growth percentages can be large numbers; `toLocaleString` adds comma separators inside percentages |

---

## 2. Tooltip Entity Name Matching with Legend Names

### Architecture

Recharts tooltips automatically use the `name` prop from `<Line>`, `<Bar>`, `<Area>`, and `<Scatter>` elements. Since both the legend and the tooltip pull from the same `name` prop, **entity name matching is inherently consistent** for all Recharts-based components.

### Findings

| Issue | Count | Severity | Details |
|---|---|---|---|
| No mismatches detected | 0 | N/A | All Recharts components use the same `name` field for both legend and tooltip |
| PWBumpChart truncates names in tooltip (`truncate` to 28 chars) but shows full names in end-labels (truncated to 22 chars) | 1 component | Low | Different truncation lengths: tooltip uses 28 chars, end-label uses 22 chars |
| PWLineChart with `truncationYear` matches by both `key` and `name` in custom tooltip | 1 component | Low | Defensive coding, not a bug |

---

## 3. Tooltip Year/Date Format Consistency

### Architecture

Years are displayed as the raw `xKey` data value in tooltip labels. No chart component explicitly formats years in tooltips -- they pass through as-is from the data (typically integers like `2020`).

### Findings

| Issue | Count | Severity | Details |
|---|---|---|---|
| No explicit year formatting in tooltips | All charts | N/A | Years pass through as raw integers, which is correct |
| PWSmallMultiples formats the label row as `Year: {label}` | 1 component | Low | Only component that adds a "Year:" prefix to tooltip labels |
| PWLineChart custom content shows bare `{label}` as tooltip header | 1 case | Low | Consistent with Recharts default behavior |
| PWRankHeatmap shows `Year: {year}` in tooltip | 1 component | Low | Matches PWSmallMultiples pattern |
| Library provides `formatYear()` function but it is never used in tooltips | 0 usages | Low | `formatYear` exists but all charts display year values directly |

**Assessment: Consistent.** All year values display as plain 4-digit integers.

---

## 4. Tooltip Percentage Decimal Precision Consistency

### Finding Summary

This is the **most significant inconsistency** in the codebase. Percentage formatting in tooltips (controlled by `yFormatter` props passed from chapter pages) uses **four different precision patterns**:

| Pattern | Count | Example Output | Files Using Pattern |
|---|---|---|---|
| `v.toFixed(1)%` | ~50 charts | `"12.3%"` | Most chapters (dominant pattern) |
| `v.toFixed(0)%` | ~15 charts | `"12%"` | inv-serial-new, inv-team-size, inv-gender, inv-top-inventors, mech-organizations, system-language, system-patent-law, green-innovation, system-patent-fields |
| `${v}%` (no decimal control) | 4 charts | `"12.345678%"` (uncontrolled) | inv-generalist-specialist:129, org-company-profiles:652, org-patent-quality:280, geo-domestic:333 |
| `(v * 100).toFixed(1)%` (fraction-to-pct) | 6 charts | `"12.3%"` | inv-serial-new:563, inv-team-size:395, inv-gender:498, inv-generalist-specialist:274, inv-top-inventors:448, system-patent-quality:427 |

Additionally, the **`PWAreaChart` stackedPercent mode** always uses `toFixed(1)%` in tooltips regardless of what the chapter passes as `yFormatter`, because it has its own internal formatter.

### Specific Issues

| Issue | File | Line | Severity |
|---|---|---|---|
| `${v}%` with no precision control -- could show many decimal places | inv-generalist-specialist/page.tsx | 129 | Medium |
| `${v}%` with no precision control | org-company-profiles/page.tsx | 652 | Medium |
| `${v}%` with no precision control | org-patent-quality/page.tsx | 280 | Medium |
| `${v}%` with no precision control | geo-domestic/page.tsx | 333 | Medium |
| `v.toLocaleString()%` uses locale-aware formatting (commas in large numbers) | system-patent-fields/page.tsx | 1119 | Medium |
| Mixed 0 vs 1 decimal precision for percentages within same chapter | inv-serial-new, inv-gender | multiple | Low |

### Recommendation

Standardize on `toFixed(1)%` for all percentage tooltips (the dominant pattern). The four `${v}%` instances should add `.toFixed(1)`. The library's `formatPercent()` function exists but is never used in any chart.

---

## 5. Tooltip Value Ordering Consistency

### Architecture

Value ordering in tooltips is determined by:
- **Recharts `formatter` prop:** Preserves the order of data series as defined in the component's children (i.e., the order of `<Line>`, `<Bar>`, `<Area>` elements).
- **Custom `content` prop:** Uses the order from `payload`, which matches the series definition order.

### Findings

| Issue | Count | Severity | Details |
|---|---|---|---|
| No explicit value sorting in any tooltip | All charts | N/A | All components display values in series definition order |
| PWFanChart shows percentiles in descending order (P99, P90, P75, Median, P25, P10) | 1 component | N/A | Correct: descending order matches the visual fan layout |
| PWScatterChart custom tooltip shows category, x-value, y-value in fixed order | 1 component | N/A | Consistent |
| PWBubbleScatter shows company, x-label, y-label, patents, section in fixed order | 1 component | N/A | Consistent |

**Assessment: Consistent.** All tooltips maintain the natural order of their data series.

---

## 6. Additional Findings

### 6a. Custom vs. Standard Tooltip Rendering

| Approach | Components |
|---|---|
| Recharts `formatter` prop (standard) | PWLineChart (default), PWBarChart, PWAreaChart, PWLollipopChart, PWBumpChart, PWLorenzCurve, PWSmallMultiples, PWRadarChart |
| Custom `content` prop (Recharts) | PWLineChart (with truncationYear), PWScatterChart, PWFanChart, PWCoefficientPlot, PWTrajectoryScatter, PWBubbleScatter |
| Fully custom HTML tooltip (non-Recharts) | PWNetworkGraph, PWConvergenceMatrix, PWValueHeatmap, PWRankHeatmap, PWChoroplethMap, PWWorldFlowMap, PWSankeyDiagram, PWChordDiagram, PWSlopeChart |
| No tooltip | PWSparkline, PWTimeline |

### 6b. Tooltip Styling Inconsistencies

| Issue | Severity | Details |
|---|---|---|
| PWBumpChart overrides `TOOLTIP_STYLE` with `maxWidth: '320px'` and `fontSize: '12px'` | Low | Only component that overrides these specific styles |
| PWSmallMultiples overrides with `fontSize: '12px'` and `padding: '6px 10px'` | Low | Compact styling for small panels |
| PWNetworkGraph, PWRankHeatmap, PWChoroplethMap, PWWorldFlowMap use Tailwind CSS classes instead of `TOOLTIP_STYLE` | Medium | Different styling mechanism; visually similar but not pixel-identical |
| PWSankeyDiagram, PWChordDiagram merge `TOOLTIP_STYLE` with `position: fixed` and additional className styles | Low | Dual styling approach (inline + Tailwind) |

### 6c. Unused Library Functions

The `src/lib/formatters.ts` module provides specialized functions that are **never used in tooltips**:

| Function | Purpose | Usage in Tooltips |
|---|---|---|
| `formatCount(v, 'tooltip')` | Full-precision count with commas (e.g., "12,345") | **Never used** -- tooltips use `formatCompact` instead |
| `formatPercent(v, decimals)` | Auto-detect fraction vs percentage, configurable decimals | **Never used** -- chapters use inline lambdas |
| `formatIndex(v, decimals)` | Format index values (HHI, Gini, etc.) | **Never used** -- chapters use `toFixed()` directly |
| `formatYear(v)` | Year as plain integer string | **Never used** -- years pass through as raw data |

---

## Summary Table: Issue Severity

| Category | Issues Found | Critical | Medium | Low |
|---|---|---|---|---|
| 1. Number format consistency | 4 | 0 | 1 | 3 |
| 2. Entity name matching | 1 | 0 | 0 | 1 |
| 3. Year/date format | 0 | 0 | 0 | 0 |
| 4. Percentage decimal precision | 6 | 0 | 5 | 1 |
| 5. Value ordering | 0 | 0 | 0 | 0 |
| 6. Additional (styling, unused functions) | 6 | 0 | 1 | 5 |
| **Total** | **17** | **0** | **7** | **10** |

---

## Actionable Recommendations

### Priority 1 (Medium -- fix for consistency)

1. **Fix 4 uncontrolled percentage formatters** (`${v}%`):
   - `src/app/chapters/inv-generalist-specialist/page.tsx:129` -- change to `${v.toFixed(1)}%`
   - `src/app/chapters/org-company-profiles/page.tsx:652` -- change to `${v.toFixed(1)}%`
   - `src/app/chapters/org-patent-quality/page.tsx:280` -- change to `${v.toFixed(1)}%`
   - `src/app/chapters/geo-domestic/page.tsx:333` -- change to `${v.toFixed(1)}%`

2. **Fix `toLocaleString()%` percentage formatter**:
   - `src/app/chapters/system-patent-fields/page.tsx:1119` -- change to `${v.toFixed(0)}%` or `${Math.round(v)}%`

3. **Unify non-Recharts tooltip styling**: Replace raw Tailwind `className` tooltips in `PWNetworkGraph`, `PWRankHeatmap`, `PWChoroplethMap`, `PWWorldFlowMap` with `TOOLTIP_STYLE` for pixel-identical styling.

### Priority 2 (Low -- nice to have)

4. **Adopt `formatCount(v, 'tooltip')` in chart components** for patent/citation counts to show full precision (e.g., "12,345" instead of "12K").

5. **Adopt `formatPercent()` from the formatters library** instead of inline lambdas, to centralize decimal precision decisions.

6. **Remove duplicate `formatDefault` function** in `PWChoroplethMap.tsx` and import `formatCompact` instead.

7. **Standardize on `toFixed(1)%`** for all percentage tooltips across all chapters.
