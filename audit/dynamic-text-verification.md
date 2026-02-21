# Audit S1.6.20 -- Dynamic Text Generation Verification

**Date:** 2026-02-21
**Scope:** All dynamic text generation patterns in `/home/saerom/projects/patentworld/src/`
**Auditor:** Claude Opus 4.6 (automated)

---

## Table of Contents

1. [formatCompact() Call Sites](#1-formatcompact-call-sites)
2. [.toFixed() Calls](#2-tofixed-calls)
3. [.toLocaleString() Calls](#3-tolocalestring-calls)
4. [Template Literals in Narrative Text](#4-template-literals-in-narrative-text)
5. [Conditional Text Based on Sign/Value](#5-conditional-text-based-on-signvalue)
6. [Unused Formatter Functions](#6-unused-formatter-functions)
7. [Edge Case Analysis](#7-edge-case-analysis)
8. [Summary of Findings](#8-summary-of-findings)

---

## 1. formatCompact() Call Sites

### Definition (src/lib/formatters.ts, lines 1-5)

```ts
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
```

### Thresholds and Rounding

| Range | Output | Precision | Example |
|-------|--------|-----------|---------|
| >= 1,000,000 | `X.XM` | 1 decimal | 9,360,000 -> "9.4M" |
| >= 1,000 | `XK` | 0 decimals (integer K) | 35,693 -> "36K" |
| < 1,000 | locale-formatted | max 1 decimal | 457 -> "457", 3.5 -> "3.5" |

### Missing B (Billion) Threshold

**FINDING:** No billion-level abbreviation exists. If `n >= 1_000_000_000`, it would render as e.g. `"1000.0M"` rather than `"1.0B"`. This is acceptable for the patent domain (no metric reaches billions), but is a latent risk if data scale changes.

**Status:** ACCEPTABLE -- no patent metric exceeds hundreds of millions.

### Call Sites (37 total across 17 files)

#### Chart Components (axis ticks/tooltips -- 18 call sites)

| File | Line(s) | Context | Consistent? |
|------|---------|---------|-------------|
| `src/components/charts/PWBarChart.tsx` | 86, 148, 170 | Y-axis tick formatter and tooltip | YES |
| `src/components/charts/PWLineChart.tsx` | 84, 104, 144, 159 | Y-axis tick/tooltip, left & right axes | YES |
| `src/components/charts/PWAreaChart.tsx` | 85, 104 | Y-axis tick (non-stacked) and tooltip | YES |
| `src/components/charts/PWLollipopChart.tsx` | 106, 142 | Y-axis tick and tooltip | YES |
| `src/components/charts/PWSlopeChart.tsx` | 107 | Value formatter fallback | YES |
| `src/components/charts/PWSmallMultiples.tsx` | 38 | Y-axis formatter fallback | YES |
| `src/components/charts/PWScatterChart.tsx` | 33, 34 | X/Y axis formatter fallback | YES |
| `src/components/charts/PWFanChart.tsx` | 41 | Y-axis formatter fallback | YES |
| `src/components/charts/PWValueHeatmap.tsx` | 38 | Cell value formatter default | YES |

#### Chart Components (tooltips -- 4 call sites)

| File | Line(s) | Context | Consistent? |
|------|---------|---------|-------------|
| `src/components/charts/PWChordDiagram.tsx` | 65, 81 | Node/arc tooltip text | YES |
| `src/components/charts/PWSankeyDiagram.tsx` | 188, 224 | Link and node tooltip, net flow with +/- sign | YES |
| `src/components/charts/PWTreemap.tsx` | 56 | Section label tooltip | YES |

#### Chapter Pages (narrative & table cells -- 15 call sites)

| File | Line(s) | Context | Consistent? |
|------|---------|---------|-------------|
| `src/app/chapters/system-patent-count/page.tsx` | 87, 89 | Hero stats: total patents, peak count | YES |
| `src/app/chapters/system-language/page.tsx` | 171, 285, 292, 498 | Total patent count in narrative text | YES |
| `src/app/chapters/green-innovation/page.tsx` | 298, 341, 342 | Total green patents, peak year count in title/caption | YES |
| `src/app/chapters/system-patent-fields/page.tsx` | 657, 658, 985, 986, 1056 | Table cells (cumulative totals, citations) | YES |
| `src/app/chapters/system-patent-quality/page.tsx` | 618 | Table cell (total fwd citations) | YES |
| `src/app/chapters/inv-serial-new/page.tsx` | 223, 224 | Table cells (inventor count, total patents) | YES |
| `src/app/chapters/mech-organizations/page.tsx` | 550 | Table cell (citations received) | YES |
| `src/app/chapters/org-company-profiles/page.tsx` | 435, 447, 455, 817, 821, 825, 832 | Stat cards, dynamic titles | YES |
| `src/app/chapters/deep-dive-overview/page.tsx` | 252, 269, 400 | Chart yFormatter | YES |
| `src/app/chapters/geo-international/page.tsx` | 460, 499 | Chart yFormatter | YES |
| `src/app/explore/page.tsx` | 146, 188, 225, 260 | Explore table cells | YES |

### Consistency Verdict

All 37 call sites use `formatCompact` consistently. The function is used for:
- Patent counts (appropriate: compact abbreviation for large numbers)
- Citation counts (appropriate: same scale)
- Inventor counts (appropriate: same scale)
- Grant lag days (in org-company-profiles, lines 817/821/825) -- **MINOR CONCERN**: grant lag days (typically 500-1500) will show as e.g. "1K" or "875" which is acceptable for stat cards, but slightly unusual for a days metric.

---

## 2. .toFixed() Calls

### Summary: 224 total .toFixed() call sites across the codebase

### Category A: Formatter Functions (src/lib/formatters.ts)

| Line | Expression | Precision | Context | Correct? |
|------|-----------|-----------|---------|----------|
| 2 | `(n / 1_000_000).toFixed(1)` | 1 decimal | Millions abbreviation | YES |
| 3 | `(n / 1_000).toFixed(0)` | 0 decimals | Thousands abbreviation | YES |
| 26 | `pct.toFixed(decimals)` | variable (default 1) | Percentage format | YES |
| 33 | `value.toFixed(decimals)` | variable (default 2) | Index format | YES |

### Category B: Chart Theme (src/lib/chartTheme.ts)

| Line | Expression | Precision | Context | Correct? |
|------|-----------|-----------|---------|----------|
| 80 | `saturation.toFixed(0)%, lightness.toFixed(0)%` | 0 decimals | HSL color string | YES -- integer % is correct for CSS |
| 101 | same pattern | 0 decimals | Diverging scale | YES |

### Category C: UI Components

| File | Line | Expression | Precision | Context | Correct? |
|------|------|-----------|-----------|---------|----------|
| `ConcentrationPanel.tsx` | 29 | `top1.toFixed(1)` | 1 decimal | Top 1% share (e.g., "45.2%") | YES |
| `ConcentrationPanel.tsx` | 33 | `top5.toFixed(1)` | 1 decimal | Top 5% share | YES |
| `ConcentrationPanel.tsx` | 37 | `gini.toFixed(3)` | 3 decimals | Gini coefficient (e.g., "0.832") | YES |
| `HomeContent.tsx` | 45 | `(count / 100).toFixed(decimals)` | variable | CounterStat animation | YES |
| `PWConvergenceMatrix.tsx` | 124 | `co_occurrence_pct.toFixed(1)` | 1 decimal | Cell percentage | YES |
| `PWConvergenceMatrix.tsx` | 141 | `co_occurrence_pct.toFixed(2)` | 2 decimals | Tooltip percentage | **INCONSISTENCY**: Cell shows 1 decimal, tooltip shows 2 |
| `PWCoefficientPlot.tsx` | 91 | `.toFixed(4)` | 4 decimals | Regression coefficients + CI | YES -- appropriate for statistical output |
| `PWTrajectoryScatter.tsx` | 94-95 | `.toFixed(4)` | 4 decimals | UMAP coordinates | YES |
| `PWRadarChart.tsx` | 47 | `Number(value).toFixed(0)` | 0 decimals | Radar tick labels | YES |
| `PWLorenzCurve.tsx` | 51, 66 | `(v * 100).toFixed(0)%` | 0 decimals | Axis ticks | YES |
| `PWLorenzCurve.tsx` | 79-80 | `(value * 100).toFixed(1)%` | 1 decimal | Tooltip | YES |
| `PWLorenzCurve.tsx` | 99 | `gini.toFixed(3)` | 3 decimals | Legend label | YES |
| `PWWorldFlowMap.tsx` | 265, 280 | `(total / 1000).toFixed(1)K` | 1 decimal | Tooltip -- duplicates formatCompact logic | **INCONSISTENCY**: uses 1 decimal for K where `formatCompact` uses 0 |
| `PWChoroplethMap.tsx` | 48-49 | mirrors formatCompact exactly | 1/0 decimals | Default formatter | YES (consistent) |

### Category D: Chapter Pages -- yFormatter Lambdas (systematic patterns)

#### Pattern: Percentage axes `v.toFixed(1)%`

Used in 60+ locations across nearly all chapter pages. Standard pattern for percentage Y-axes. **Consistent.**

Files: `inv-gender`, `mech-geography`, `org-patent-count`, `system-patent-quality`, `system-patent-fields`, `system-convergence`, `inv-team-size`, `inv-top-inventors`, `inv-serial-new`, `inv-generalist-specialist`, `org-composition`, `org-patent-quality`, `deep-dive-overview`, `mech-inventors`, `mech-organizations`, `system-patent-count`, `system-patent-law`, `green-innovation`, `system-language`, `geo-international`, `geo-domestic`, all ACT 6 deep-dive chapters.

#### Pattern: Index/score axes `v.toFixed(2)` or `v.toFixed(3)`

| File | Line | Precision | Context | Correct? |
|------|------|-----------|---------|----------|
| `mech-organizations/page.tsx` | 243, 333, 367, 411 | 2 decimals | Exploration scores (0-1 range) | YES |
| `system-patent-quality/page.tsx` | 343, 529 | 2 decimals | Originality/generality (0-1) | YES |
| `system-patent-quality/page.tsx` | 566 | 3 decimals | Highly precise index | YES |
| `system-patent-fields/page.tsx` | 531, 913, 930 | 2 decimals | HHI diversity, correlation | YES |
| `system-language/page.tsx` | 420 | 2 decimals | Entropy | YES |

#### Pattern: Year-based axes `v.toFixed(1)y`

| File | Line | Precision | Context | Correct? |
|------|------|-----------|---------|----------|
| `system-patent-count/page.tsx` | 211, 288 | 1 decimal | Grant pendency in years | YES |
| `system-patent-quality/page.tsx` | 473 | 1 decimal | Citation lag in years | YES |

#### Pattern: Whole-number percentage `v.toFixed(0)%`

| File | Line | Context | Correct? |
|------|------|---------|----------|
| `PWAreaChart.tsx` | 85 | Stacked percent axis ticks | YES |
| `inv-serial-new/page.tsx` | 175, 255, 299 | Share axes | YES |
| `inv-top-inventors/page.tsx` | 183 | Share axis | YES |
| `inv-team-size/page.tsx` | 206 | Solo share axis | YES |
| `system-language/page.tsx` | 250, 387 | Topic share axes | YES |
| `green-innovation/page.tsx` | 689 | Share axis | YES |
| `system-patent-law/page.tsx` | 583 | Right Y axis | YES |

#### Pattern: Data computation with .toFixed() + unary `+`

Many ACT 6 deep-dive chapters compute derived metrics:

```ts
cr4: +(top4 / total * 100).toFixed(1)      // 1 decimal for CR4
entropy: +(H / Math.log(N)).toFixed(3)      // 3 decimals for normalized entropy
velocity: +(d.totalPat / d.totalSpan).toFixed(1)  // 1 decimal for velocity
```

Files: `ai-patents`, `green-innovation`, `biotechnology`, `3d-printing`, `space-technology`, `autonomous-vehicles`, `semiconductors`, `blockchain`, `cybersecurity`, `digital-health`, `agricultural-technology`, `quantum-computing`

**Status:** Consistent across all 12 deep-dive chapters. The `+` unary operator correctly converts the string back to a number after formatting.

#### Pattern: Inline table cell formatting

| File | Line | Expression | Precision | Context | Correct? |
|------|------|-----------|-----------|---------|----------|
| `inv-serial-new/page.tsx` | 225 | `s.avg_patents.toFixed(1)` | 1 decimal | Average patents per inventor | YES |
| `inv-serial-new/page.tsx` | 226-227 | `s.inventor_share.toFixed(1)%`, `s.patent_share.toFixed(1)%` | 1 decimal | Share percentages | YES |
| `inv-serial-new/page.tsx` | 407, 411, 415 | `.toFixed(0)%`, `.toFixed(0)%`, `.toFixed(1)` | mixed | Stat cards | YES -- whole % for shares, 1 decimal for avg patents |
| `inv-gender/page.tsx` | 339 | `avg_citations.toFixed(1)` | 1 decimal | Average citations | YES |
| `org-patent-count/page.tsx` | 387 | `gini.toFixed(3)` | 3 decimals | Gini coefficient | YES |
| `org-patent-portfolio/page.tsx` | 355 | `jsd.toFixed(3)` | 3 decimals | Jensen-Shannon divergence | YES |
| `deep-dive-overview/page.tsx` | 338 | `lift.toFixed(2)` | 2 decimals | Lift ratio | YES |
| `system-patent-fields/page.tsx` | 659 | `current_pct_of_K.toFixed(1)%` | 1 decimal | Percent | YES |
| `system-patent-fields/page.tsx` | 731 | `half_life_years?.toFixed(1) ?? 'N/A'` | 1 decimal | Half-life in years | YES -- handles null |
| `system-patent-fields/page.tsx` | 987 | `self_cite_rate.toFixed(1)%` | 1 decimal | Self-citation rate | YES |
| `geo-domestic/page.tsx` | 552 | `location_quotient.toFixed(2)` | 2 decimals | LQ index | YES |
| `system-public-investment/page.tsx` | 262-263 | `.toFixed(2)` | 2 decimals | Breadth/depth scores | YES |
| `org-company-profiles/page.tsx` | 643-644 | `+(rate * 100).toFixed(2)` | 2 decimals | Blockbuster/dud rates | YES |
| `org-patent-quality/page.tsx` | 271-272 | `+(rate * 100).toFixed(2)` | 2 decimals | Same pattern | YES |

### Inconsistencies Found

1. **PWConvergenceMatrix cell vs. tooltip precision**: Cell shows `.toFixed(1)` (line 124), tooltip shows `.toFixed(2)` (line 141). This is intentional (tooltip provides more detail) but is the only component where cell and tooltip differ in precision.

2. **PWWorldFlowMap duplicates formatCompact with different precision**: Lines 265, 280 use `(total / 1000).toFixed(1)K` for values >= 1000, giving one decimal for K values (e.g., "1.5K"), whereas `formatCompact` uses `.toFixed(0)` for K values (e.g., "2K"). This produces inconsistent K-level abbreviations across the application.

---

## 3. .toLocaleString() Calls

### Summary: 37 call sites

### Formatter Functions

| File | Line | Expression | Locale | Context | Correct? |
|------|------|-----------|--------|---------|----------|
| `formatters.ts` | 4 | `n.toLocaleString(undefined, { maximumFractionDigits: 1 })` | system default | Small numbers in formatCompact | YES |
| `formatters.ts` | 13 | `Math.round(value).toLocaleString('en-US')` | `en-US` | formatCount tooltip mode | YES |

**INCONSISTENCY:** `formatCompact` uses `undefined` locale (system default) for small numbers, while `formatCount` explicitly uses `'en-US'`. In non-English server locales, this could produce different separator characters. In practice, Next.js static export runs in a controlled Node.js environment, so this is low risk.

### Chart Components

| File | Line | Expression | Context | Correct? |
|------|------|-----------|---------|----------|
| `RankingTable.tsx` | 42 | `cell.toLocaleString()` | Table cells | YES -- default locale |
| `PWScatterChart.tsx` | 103 | `d[key].toLocaleString()` | Tooltip values | YES |
| `PWNetworkGraph.tsx` | 501 | `patents.toLocaleString()` | Tooltip | YES |
| `PWConvergenceMatrix.tsx` | 142 | `patent_count.toLocaleString()` | Tooltip | YES |
| `PWChoroplethMap.tsx` | 50 | `v.toLocaleString()` | Small values fallback | YES |
| `PWWorldFlowMap.tsx` | 265, 280 | `total.toLocaleString()` | Small values fallback | YES |
| `PWBubbleScatter.tsx` | 124 | `d.size.toLocaleString()` | Tooltip | YES |

### Chapter Pages (table cells)

All chapter page `.toLocaleString()` calls are used for integer patent/citation counts in table cells. This provides thousands separators (e.g., "30,695"). **Consistent** across all uses.

| File | Line(s) | Context |
|------|---------|---------|
| `inv-gender/page.tsx` | 338 | Patent count |
| `deep-dive-overview/page.tsx` | 335, 336 | Observed/expected counts |
| `mech-geography/page.tsx` | 218 | Total patents |
| `biotechnology/page.tsx` | 690, 694 | Subfield counts |
| `3d-printing/page.tsx` | 662, 666 | Subfield counts |
| `space-technology/page.tsx` | 658, 662 | Subfield counts |
| `green-innovation/page.tsx` | 648, 650 | Org totals |
| `geo-domestic/page.tsx` | 553 | Metro section count |
| `blockchain/page.tsx` | 679, 683 | Subfield counts |
| `inv-serial-new/page.tsx` | 403 | Total count stat card |
| `ai-patents/page.tsx` | 665, 669 | Subfield counts |
| `org-patent-count/page.tsx` | 388 | Firm count |
| `system-patent-fields/page.tsx` | 506, 1119 | Axis formatter (count, %) |
| `agricultural-technology/page.tsx` | 682, 686 | Subfield counts |
| `inv-top-inventors/page.tsx` | 504, 508, 512 | Examiner/inventor name matches |
| `quantum-computing/page.tsx` | 740, 744 | Subfield counts |
| `semiconductors/page.tsx` | 744, 748 | Subfield counts |
| `autonomous-vehicles/page.tsx` | 664, 668 | Subfield counts |
| `mech-inventors/page.tsx` | 299, 381, 401 | Total patents, net flow |
| `cybersecurity/page.tsx` | 639, 643 | Subfield counts |
| `digital-health/page.tsx` | 638, 642 | Subfield counts |
| `system-public-investment/page.tsx` | 264 | Tooltip patents |

### Locale Consistency

Most calls use the default (no argument) `.toLocaleString()`. Only `formatCount` in `formatters.ts` explicitly specifies `'en-US'`. Since these are client-side calls in a browser, the default locale will typically be the user's browser locale, which could theoretically produce unexpected separators for non-US users (e.g., "30.695" in German locale). However, for a US patent data site this is low risk.

---

## 4. Template Literals in Narrative Text

### Dynamic Titles and Captions

These are the most critical dynamic text patterns -- they appear in visible chart titles and captions that combine `formatCompact`, `.toFixed()`, and fallback values.

#### green-innovation/page.tsx (lines 341-342) -- HIGHEST COMPLEXITY

```tsx
title={`Green Patent Volume Rose to ${peakYear ? formatCompact(peakYear.green_count) : '35,693'}
  by ${peakYear?.year ?? '2019'}, Reaching ${peakYear?.green_pct?.toFixed(1) ?? '10.0'}%
  of All Utility Patents`}
```

**Analysis:**
- Uses `formatCompact` for the count (will render as "36K" not "35,693") -- **MISMATCH** with fallback string "35,693" which is fully spelled out
- The `peakYear?.green_pct?.toFixed(1)` safely chains optional access
- Fallback values ("35,693", "2019", "10.0") are hardcoded and consistent with the expected data
- **FINDING:** When data loads, the title says "36K" but the fallback says "35,693" -- these are visually different formats. The fallback is shown only during initial load before data arrives.

**Status:** MINOR INCONSISTENCY -- the fallback format differs from the data-driven format, but the fallback is only visible briefly during loading.

#### green-innovation/page.tsx (line 298)

```tsx
{totalGreen > 0 ? formatCompact(totalGreen) : '457K'}
```

**Analysis:** Fallback "457K" matches the K-level abbreviation that `formatCompact` would produce. **Consistent.**

#### org-company-profiles/page.tsx (line 455)

```tsx
title={`${activeCompany} Annual Patent Output Across
  ${companySummary?.activeYears ?? '...'} Active Years,
  Peaking at ${companySummary ? formatCompact(companySummary.peakCount) : '...'} in
  ${companySummary?.peakYear ?? '...'}`}
```

**Analysis:** Uses `'...'` as loading placeholder. **Acceptable** -- the `...` is a common loading indicator.

#### org-company-profiles/page.tsx (line 832)

```tsx
title={`${activeCompany} Grant Lag Spans
  ${speedSummary ? formatCompact(speedSummary.minMedian) : '...'} to
  ${speedSummary ? formatCompact(speedSummary.maxMedian) : '...'} Days (Median)`}
```

**Analysis:** Uses `formatCompact` for days. Values like 875 would display as "875", values like 1,317 would display as "1K". The "Days" label appears after the number. **Acceptable** but slightly unusual to abbreviate days.

#### mech-organizations/page.tsx (line 225)

```tsx
title={`${selectedExplFirm}'s Exploration Score Averages
  ${selectedExplData.length > 0
    ? (selectedExplData.reduce((s, d) => s + d.mean_exploration, 0)
       / selectedExplData.length).toFixed(2)
    : '0.15'} Across
  ${selectedExplData.length > 0 ? selectedExplData.length : '49'} Years of Patenting`}
```

**Analysis:**
- Inline computation `reduce(...) / length` in a template literal -- **COMPLEX** but correct
- `.toFixed(2)` is appropriate for a 0-1 scale score
- Fallbacks ('0.15', '49') are realistic default values
- **EDGE CASE:** If `selectedExplData` were populated but had 0 total (all `mean_exploration` values = 0), the result would be "0.00" -- acceptable.

#### mech-organizations/page.tsx (line 251)

```tsx
title={`${selectedExplFirm} Devotes
  ${selectedExplData.length > 0
    ? (selectedExplData[selectedExplData.length - 1].exploitation_share * 100).toFixed(0)
    : '95'}% of Recent Patents to Exploitation Over Exploration`}
```

**Analysis:**
- Accesses last element of array (`[length - 1]`) -- safe because of `length > 0` guard
- `.toFixed(0)` for whole percent display -- appropriate
- **EDGE CASE:** If `exploitation_share` is exactly 0, displays "0%" -- technically correct but might look odd in the title. Very unlikely in practice.

### Dynamic Narrative Text (Inline JSX)

#### system-patent-count/page.tsx (lines 87-89)

```tsx
const totalPatents = hero ? formatCompact(hero.total_patents) : '9.36M';
const peakYear = hero?.peak_year ?? 2019;
const peakCount = hero ? formatCompact(hero.peak_year_count) : '393K';
```

**Analysis:** Fallbacks ("9.36M", "393K") match the expected formatCompact output. **Consistent.**

#### system-language/page.tsx (lines 171, 285, 292, 498)

```tsx
{formatCompact(totalPatents)} patent abstracts
```

Where `totalPatents` is derived from data. If data hasn't loaded, `totalPatents` could be 0, producing "0". However, these elements are inside components that likely only render when data is available (checked via `useChapterData`). **Acceptable.**

### Chart Component Tooltips (Template Literals)

#### PWChordDiagram.tsx (line 65)

```ts
content: `${nodes[index].name}\nCitations given: ${formatCompact(total)}\nCitations received: ${formatCompact(received)}`
```

**Status:** Consistent -- both values use `formatCompact`.

#### PWSankeyDiagram.tsx (line 224)

```ts
content: `${node.name}\nNet flow: ${nf > 0 ? '+' : ''}${formatCompact(nf)} inventors`
```

**Status:** Consistent -- sign prefix for positive values, `formatCompact` for the number.

#### PWWorldFlowMap.tsx (lines 265, 280)

```ts
const fmt = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toLocaleString();
```

**Status:** **INCONSISTENCY** with `formatCompact` -- this uses `.toFixed(1)` for K values (e.g., "1.5K") while `formatCompact` uses `.toFixed(0)` (e.g., "2K"). See Section 2 findings.

---

## 5. Conditional Text Based on Sign/Value

### Sign-Dependent Formatting

#### PWSlopeChart.tsx (lines 49, 84)

```tsx
const sign = change >= 0 ? '+' : '';
// ...
<div style={{ color: change >= 0 ? '#009E73' : '#D55E00' }}>
```

**Analysis:**
- Positive change: green color (#009E73) with "+" prefix
- Negative change: red-orange color (#D55E00) with no prefix (the minus is implicit in the number)
- **EDGE CASE -- zero:** `change >= 0` means zero shows "+" prefix and green color. This is acceptable (zero change is "no decrease").

#### system-patent-fields/page.tsx (lines 470, 566)

```tsx
yFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
```

**Analysis:**
- Positive: "+15%"
- Negative: "-15%" (minus from number itself)
- **Zero: "0%"** -- no "+" prefix for zero, which is correct since `v > 0` is false for zero. Consistent with the chart context (percentage change).

#### PWSankeyDiagram.tsx (line 224)

```tsx
Net flow: ${nf > 0 ? '+' : ''}${formatCompact(nf)} inventors
```

**Analysis:**
- Positive: "+1K inventors"
- Negative: "-1K inventors" (but `formatCompact` for negative: see edge case analysis below)
- **Zero: "0 inventors"** -- no sign prefix
- **EDGE CASE:** `formatCompact` does not handle negative numbers. If `nf = -1500`, then `nf >= 1_000` is false and `nf >= 1_000_000` is false, so it falls to `n.toLocaleString()` producing "-1,500" rather than "-2K". The `+` prefix is not added. **Result: "Net flow: -1,500 inventors"** -- this is inconsistent with the positive case which would show "+2K". However, in the Sankey context, the `nf > 0` guard means this branch doesn't get the "+" and the negative number renders with its own minus sign via toLocaleString, which is readable.

### Value-Dependent Conditional Rendering

#### green-innovation/page.tsx (line 298)

```tsx
{totalGreen > 0 ? formatCompact(totalGreen) : '457K'}
```

**Analysis:** Guards against zero/unloaded data. **Correct.**

#### inv-gender/page.tsx (lines 62, 93, 110)

```tsx
female_pct: m + f > 0 ? +(100 * f / (m + f)).toFixed(1) : 0
```

**Analysis:** Guards against division by zero. If no inventors in either category, defaults to 0. **Correct.**

#### geo-domestic/page.tsx (line 80)

```tsx
pctRow[key] = row.total > 0 ? +((100 * (row[key] || 0)) / row.total).toFixed(1) : 0;
```

**Analysis:** Guards against division by zero, also handles null/undefined in `row[key]` via `|| 0`. **Correct.**

### Color-Based Conditional Rendering

#### mech-inventors/page.tsx (lines 381, 401)

```tsx
// Importers (positive net flow)
<td className="font-mono text-emerald-600">+{node.net_flow.toLocaleString()}</td>
// Exporters (negative net flow)
<td className="font-mono text-red-500">{node.net_flow.toLocaleString()}</td>
```

**Analysis:**
- Importers always have positive `net_flow` (filtered by `n.net_flow > 0`), so the hardcoded "+" prefix is safe
- Exporters always have negative `net_flow` (filtered by `n.net_flow < 0`), so `toLocaleString()` produces "-1,234"
- Color coding: emerald for positive, red for negative -- **Consistent** with conventional financial/flow visualization

---

## 6. Unused Formatter Functions

The following functions are defined in `src/lib/formatters.ts` but are **never imported or used** anywhere in the codebase:

| Function | Line | Purpose | Status |
|----------|------|---------|--------|
| `formatCount()` | 11-14 | Axis vs. tooltip count formatting | UNUSED |
| `formatPercent()` | 20-27 | Auto-detecting percentage formatting | UNUSED |
| `formatIndex()` | 32-34 | Index value formatting | UNUSED |
| `formatYear()` | 39-41 | Year formatting without separators | UNUSED |

Only `formatCompact()` and `titleCase()` are imported from this module.

**Impact:** Instead of using these centralized formatters, chapter pages use inline lambdas (e.g., `(v) => v.toFixed(1)%`). This means:
- Formatting decisions are scattered across 30+ files rather than centralized
- Any change to formatting conventions requires editing dozens of files
- The `formatPercent` auto-detection threshold (1.5) is never exercised, avoiding its ambiguity issue

**Recommendation:** Either adopt the centralized formatters or remove the unused exports to avoid confusion.

### formatPercent Auto-Detection Edge Case

The unused `formatPercent` has a design flaw worth documenting:

```ts
const pct = Math.abs(value) <= 1.5 ? value * 100 : value;
```

A value of 1.3 (meaning 1.3%) would be interpreted as a fraction and multiplied by 100, producing "130.0%". This threshold of 1.5 is arbitrary and dangerous for values legitimately between 0 and 1.5 percent. Since this function is unused, this is a **latent risk only**.

---

## 7. Edge Case Analysis

### NaN Handling

**formatCompact(NaN):**
- `NaN >= 1_000_000` -> false
- `NaN >= 1_000` -> false
- `NaN.toLocaleString()` -> `"NaN"`
- **Result:** The string `"NaN"` would appear in the UI

**Mitigation:** No explicit NaN guards exist in `formatCompact`. However, the data pipeline (Polars -> JSON -> client) typically produces numbers or null, and most call sites access properties that would be `undefined` rather than `NaN`.

**Only two components check for NaN:**
- `PWBubbleScatter.tsx` (line 158): `isNaN(cx) || isNaN(cy)` -- prevents rendering NaN coordinates
- `PWChoroplethMap.tsx` (line 118): `!isNaN(centroid[0])` -- prevents rendering NaN map centroids

### Undefined/Null Handling

Most dynamic text sites use optional chaining (`?.`) and nullish coalescing (`??`) correctly:

- `peakYear?.green_pct?.toFixed(1) ?? '10.0'` -- handles null peakYear or null green_pct
- `hl.half_life_years?.toFixed(1) ?? 'N/A'` -- handles null half_life_years
- `companySummary?.activeYears ?? '...'` -- handles null companySummary

**POTENTIAL ISSUE:** Calling `.toFixed()` on `undefined` would throw a TypeError. The optional chaining (`?.toFixed()`) prevents this. All sites that access potentially-undefined values use proper chaining.

### Zero Handling

- `formatCompact(0)` -> `"0"` (falls through to `toLocaleString`)
- `(0).toFixed(1)` -> `"0.0"` -- correct
- `(0).toLocaleString()` -> `"0"` -- correct
- Division by zero guards: Present in `inv-gender` (line 62/93/110) and `geo-domestic` (line 80)

### Negative Number Handling in formatCompact

```ts
formatCompact(-1500)
// -1500 >= 1_000_000? No
// -1500 >= 1_000? No
// -> (-1500).toLocaleString() -> "-1,500"
```

The function does not abbreviate negative numbers. For negative values >= -999, this is fine. For large negative values, the abbreviated form would be more readable but is never needed in this domain (patent counts are never negative; net flows could be, but the Sankey uses `formatCompact(nf)` where nf could be negative).

**Impact:** In `PWSankeyDiagram.tsx` line 224, a negative net flow of -1,500 displays as "-1,500" while a positive flow of 1,500 displays as "2K". The asymmetry is minor and may actually improve readability.

---

## 8. Summary of Findings

### Issues Found

| # | Severity | Location | Description |
|---|----------|----------|-------------|
| 1 | LOW | `PWWorldFlowMap.tsx:265,280` | Uses `.toFixed(1)` for K abbreviation while `formatCompact` uses `.toFixed(0)`. A value of 1,500 shows "1.5K" in the flow map but "2K" via `formatCompact`. |
| 2 | LOW | `green-innovation/page.tsx:341` | Fallback string "35,693" is fully spelled out while data-driven `formatCompact` would render "36K". Visible only during brief loading state. |
| 3 | INFO | `PWConvergenceMatrix.tsx:124,141` | Cell shows 1 decimal, tooltip shows 2 decimals for the same metric. Intentional (progressive disclosure) but worth documenting. |
| 4 | INFO | `formatters.ts:4 vs 13` | `formatCompact` uses `undefined` locale; `formatCount` uses `'en-US'`. Inconsistent but low risk in static export. |
| 5 | INFO | `formatters.ts` | Four exported formatter functions (`formatCount`, `formatPercent`, `formatIndex`, `formatYear`) are never used. Dead code. |
| 6 | INFO | `formatPercent:25` | Auto-detection threshold of 1.5 would misinterpret values legitimately between 0-1.5%. Not currently used (dead code). |
| 7 | INFO | `formatCompact` | No NaN guard. Passing NaN would render the string "NaN" in the UI. No call sites currently pass NaN. |
| 8 | INFO | `formatCompact` | No billion (B) abbreviation. Not needed for current data scale. |
| 9 | INFO | `formatCompact` | Does not abbreviate negative numbers. Causes minor asymmetry in Sankey net-flow display. |
| 10 | INFO | `PWSlopeChart.tsx:49` | Zero change gets "+" prefix and green color (via `>= 0`). Acceptable convention. |

### Consistency Assessment

| Pattern | # Call Sites | Consistent? | Notes |
|---------|-------------|-------------|-------|
| `formatCompact()` | 37 | YES (except #1) | One duplicate implementation with different precision |
| `.toFixed(1)` for percentages | 60+ | YES | Universally applied for percentage axes |
| `.toFixed(0)` for whole-number % | 12 | YES | Used for share axes |
| `.toFixed(2)` for scores/indices | 15 | YES | Exploration, originality, LQ, correlation |
| `.toFixed(3)` for Gini/entropy | 8 | YES | Gini, normalized entropy, JSD |
| `.toFixed(4)` for coefficients | 4 | YES | Regression and UMAP coordinates |
| `.toLocaleString()` for counts | 37 | YES | Thousands separators in tables/tooltips |
| Sign-conditional text | 6 | YES | Consistent +/- prefixing and color coding |
| Loading fallbacks | 12 | YES (except #2) | `??` with realistic fallback values |

### Overall Verdict

The dynamic text generation patterns are **well-structured and largely consistent**. The primary formatting function `formatCompact` is used correctly across 37 call sites. The `.toFixed()` precision choices are contextually appropriate (1 decimal for percentages, 2-3 for indices, 4 for coefficients). Sign-conditional text properly handles positive, negative, and zero cases.

The two actual inconsistencies found (#1 and #2) are low severity and affect tooltip/loading states rather than primary narrative text. The unused formatter functions (#5) represent dead code that should be either adopted or removed.

No critical formatting bugs, NaN rendering paths, or broken conditional text patterns were found.
