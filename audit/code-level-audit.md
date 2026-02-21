# PatentWorld Code-Level Audit

Date: 2026-02-21

---

## 1.9.9 -- Entity Color Consistency

### Centralized Color Palettes in `src/lib/colors.ts`

The project defines **18 named color maps** plus 2 scale arrays and a tooltip style in a single centralized file (`src/lib/colors.ts`). All palettes draw from the Okabe-Ito colorblind-safe family.

| Palette                    | Entries | Purpose                          |
|----------------------------|---------|----------------------------------|
| `CHART_COLORS`             | 9       | General categorical palette      |
| `BUMP_COLORS`              | 15      | Bump charts, multi-line          |
| `CPC_SECTION_COLORS`       | 9       | CPC technology sections A-H, Y   |
| `WIPO_SECTOR_COLORS`       | 5       | WIPO technology sectors           |
| `TOPIC_COLORS`             | 25      | Topic modeling scatter plots      |
| `GREEN_CATEGORY_COLORS`    | 10      | Green innovation sub-categories   |
| `COUNTRY_COLORS`           | 7       | Assignee country of origin        |
| `INDUSTRY_COLORS`          | 10      | Industry/portfolio analysis       |
| `ENTITY_COLORS`            | 15      | Top assignees (IBM, Samsung, etc) |
| `SEMI_SUBFIELD_COLORS`     | 10      | Semiconductor sub-categories      |
| `QUANTUM_SUBFIELD_COLORS`  | 8       | Quantum computing sub-categories  |
| `CYBER_SUBFIELD_COLORS`    | 7       | Cybersecurity sub-categories      |
| `BIOTECH_SUBFIELD_COLORS`  | 7       | Biotechnology sub-categories      |
| `DIGIHEALTH_SUBFIELD_COLORS`| 12    | Digital health sub-categories     |
| `AGTECH_SUBFIELD_COLORS`   | 6       | Agricultural technology           |
| `AV_SUBFIELD_COLORS`       | 5       | Autonomous vehicles               |
| `SPACE_SUBFIELD_COLORS`    | 8       | Space technology                  |
| `PRINT3D_SUBFIELD_COLORS`  | 9       | 3D printing                       |
| `BLOCKCHAIN_SUBFIELD_COLORS`| 3      | Blockchain                        |
| `PATENT_TYPE_COLORS`       | 4       | Utility/Design/Plant/Reissue      |
| `ASSIGNEE_TYPE_COLORS`     | 5       | Corporate/Individual/University   |
| `FILING_ROUTE_COLORS`      | 3       | PCT/Direct Foreign/Domestic       |
| `SEQUENTIAL_SCALE`         | 9       | Viridis heatmap scale             |
| `DIVERGING_SCALE`          | 9       | Blue-orange diverging scale       |

**Total defined entity-color pairs: 220** (across all categorical maps, scales, and arrays).

### Additional Theme Colors in `src/lib/chartTheme.ts`

A secondary centralized module provides:
- `categoricalColors`: 7-color WCAG-compliant palette
- `otherColor`: `#9ca3af` (gray-400)
- `sequentialScale()` and `divergingScale()` functions for continuous color generation

### Hardcoded Colors in Chart Components

The following chart components contain hardcoded hex/rgb values that bypass the centralized color system:

| File | Lines | Hardcoded Values | Assessment |
|------|-------|------------------|------------|
| `PWChordDiagram.tsx` | 105, 156 | `#888` (fallback) | LOW RISK -- fallback for missing node color |
| `PWLineChart.tsx` | 132, 134, 167, 198, 200, 233 | `#999`, `#9ca3af`, `#fff` | LOW RISK -- reference line styling and white stroke for active dots |
| `PWSlopeChart.tsx` | 84 | `#009E73`, `#D55E00` | OK -- uses values from the Okabe-Ito palette for positive/negative change |
| `PWFanChart.tsx` | 196 | `#9ca3af` | LOW RISK -- reference line gray |
| `PWAreaChart.tsx` | 118, 120 | `#9ca3af` | LOW RISK -- reference line fallback |
| `PWTreemap.tsx` | 33, 40 | `#888`, `#fff` | OK -- fallback gray, white text on dark background |
| `PWNetworkGraph.tsx` | 448 | `#fff` | OK -- hover stroke highlight |
| `PWSparkline.tsx` | 12 | `#0072B2` | OK -- default parameter uses the primary Okabe-Ito blue |
| `PWBumpChart.tsx` | 106 | `#fff` | OK -- white stroke for active dots |
| `TimeAnnotations.tsx` | 34 | `#d1d5db` | LOW RISK -- annotation stroke (Tailwind gray-300 equivalent) |
| `PWSankeyDiagram.tsx` | 140-141 | `#0072B2`, `#D55E00` | MEDIUM -- hardcoded palette colors for net-flow semantics instead of importing from `colors.ts` |
| `PWLollipopChart.tsx` | 136 | `#9ca3af` | LOW RISK -- average reference line |
| `PWBubbleScatter.tsx` | 54, 107, 110 | `#999999`, `#9ca3af` | LOW RISK -- fallback and reference lines |
| `PWSeriesSelector.tsx` | 83 | `#d1d5db` | LOW RISK -- unselected chip background |
| `PWWorldFlowMap.tsx` | 77-83, 88, 325, 432 | 7 region colors, `#999999`, `#0072B2` | **FLAG** -- defines its own `REGION_COLORS` map (7 entries) not exported from `colors.ts` |
| `PWValueHeatmap.tsx` | 27, 37, 113 | `rgb()` interpolation, `#f0f4ff`, `#0072B2`, `#fff` | LOW RISK -- procedural color scale with sensible defaults |
| `PWScatterChart.tsx` | 86-87 | `#9ca3af` | LOW RISK -- crosshair reference lines |
| `PWSmallMultiples.tsx` | 78, 88 | `#9ca3af` | LOW RISK -- reference lines |
| `PWBarChart.tsx` | 120, 162 | `#9ca3af` | LOW RISK -- average reference line |
| `PWChoroplethMap.tsx` | 161 | chartTheme.fontFamily reference | OK |

### Summary

- **PASS (mostly)**: The vast majority of chart components import colors from `colors.ts` or `chartTheme.ts`.
- **2 findings to address**:
  1. `PWWorldFlowMap.tsx` defines 7 `REGION_COLORS` locally -- should be moved to `colors.ts` for centralization.
  2. `PWSankeyDiagram.tsx` hardcodes `#0072B2` and `#D55E00` instead of importing from `colors.ts`.
- Common `#9ca3af` and `#fff` usage across chart components is structurally appropriate for reference lines and contrast strokes, but could be consolidated as named constants in `chartTheme.ts`.

---

## 1.9.12 -- Font Consistency

### Font Imports in `src/app/layout.tsx`

Three Google Fonts are loaded via `next/font/google`:

| Font             | CSS Variable        | Tailwind Class | Role     |
|------------------|---------------------|----------------|----------|
| Playfair Display | `--font-playfair`   | `font-serif`   | Headings |
| Plus Jakarta Sans| `--font-jakarta`    | `font-sans`    | Body     |
| JetBrains Mono   | `--font-jetbrains`  | `font-mono`    | Code/Data|

All three are applied to the `<html>` element via CSS variable classes:
```tsx
<html className={`${playfair.variable} ${jakarta.variable} ${jetbrains.variable}`}>
```

### Tailwind Configuration (`tailwind.config.ts`)

```ts
fontFamily: {
  serif: ['var(--font-playfair)', 'Georgia', 'serif'],
  sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-jetbrains)', 'monospace'],
},
```

All three font families are correctly wired with sensible fallback stacks.

### Chart Theme (`src/lib/chartTheme.ts`)

The chart theme centralizes:
```ts
export const fontFamily = 'var(--font-jakarta)';
```

All chart components reference `chartTheme.fontFamily` for SVG text and Recharts props. Verified in: PWBarChart, PWLineChart, PWAreaChart, PWLollipopChart, PWCoefficientPlot, PWLorenzCurve, PWTrajectoryScatter, PWChoroplethMap, PWTreemap, PWSlopeChart.

### Tooltip Style (`src/lib/colors.ts`)

```ts
fontFamily: 'var(--font-jakarta)',
```

Correctly references the centralized variable.

### Inline `fontFamily` Overrides in `.tsx` Files

All `fontFamily` usages found in `.tsx` files reference `chartTheme.fontFamily` -- no raw string overrides detected. **No rogue font-family declarations found.**

### CSS Files

No standalone `.css` files found in `src/` beyond `globals.css` (loaded via layout). No additional `font-family` declarations exist outside the Tailwind config.

### Verdict

**PASS**: All three font families (Playfair Display, Plus Jakarta Sans, JetBrains Mono) are correctly configured, consistently applied, and have no inline overrides.

---

## 1.6.21 -- Locale Independence

### `.toLocaleString()` Calls Without Explicit Locale

**43 instances** of `.toLocaleString()` called without an explicit locale parameter across the codebase. These rely on the browser's default locale, which may produce inconsistent formatting depending on user settings.

**In `src/lib/formatters.ts`**:
- Line 4: `formatCompact()` uses `n.toLocaleString(undefined, { maximumFractionDigits: 1 })` -- **FLAG**: `undefined` locale
- Line 13: `formatCount()` uses `.toLocaleString('en-US')` -- **PASS**: explicit locale

**In chart components** (no explicit locale):
| File | Count | Context |
|------|-------|---------|
| `PWChoroplethMap.tsx` | 1 | `formatDefault()` helper |
| `PWWorldFlowMap.tsx` | 2 | Flow count formatting |
| `PWScatterChart.tsx` | 1 | Tooltip values |
| `PWNetworkGraph.tsx` | 1 | Patent count tooltip |
| `PWConvergenceMatrix.tsx` | 1 | Patent count tooltip |
| `PWBubbleScatter.tsx` | 1 | Patent count tooltip |
| `RankingTable.tsx` | 1 | Cell rendering |

**In chapter pages** (no explicit locale):
| File | Count |
|------|-------|
| `HomeContent.tsx` | 1 |
| `biotechnology/page.tsx` | 2 |
| `space-technology/page.tsx` | 2 |
| `system-public-investment/page.tsx` | 1 |
| `ai-patents/page.tsx` | 2 |
| `system-patent-fields/page.tsx` | 2 |
| `inv-serial-new/page.tsx` | 1 |
| `org-patent-count/page.tsx` | 1 |
| `3d-printing/page.tsx` | 2 |
| `cybersecurity/page.tsx` | 2 |
| `green-innovation/page.tsx` | 2 |
| `blockchain/page.tsx` | 2 |
| `inv-gender/page.tsx` | 1 |
| `agricultural-technology/page.tsx` | 2 |
| `geo-domestic/page.tsx` | 1 |
| `quantum-computing/page.tsx` | 2 |
| `mech-inventors/page.tsx` | 3 |
| `deep-dive-overview/page.tsx` | 2 |
| `inv-top-inventors/page.tsx` | 3 |
| `digital-health/page.tsx` | 2 |
| `autonomous-vehicles/page.tsx` | 2 |
| `semiconductors/page.tsx` | 2 |
| `mech-geography/page.tsx` | 1 |

### `Intl.NumberFormat` / `Intl.DateTimeFormat`

**No instances found.** The codebase does not use `Intl.NumberFormat` or `Intl.DateTimeFormat`.

### Verdict

**FAIL**: 42 of 43 `.toLocaleString()` calls lack an explicit locale. While the site targets English-speaking audiences and the `<html lang="en">` attribute is set, the formatting behavior depends on the user's browser locale. Numbers could render with periods vs. commas differently (e.g., "1.000" vs "1,000" for German locale users).

**Recommendation**: Replace all bare `.toLocaleString()` with `.toLocaleString('en-US')`, or route all formatting through the centralized `formatCount()` function in `src/lib/formatters.ts` which already uses `'en-US'`.

---

## 1.7.10 -- External Link Security

### All External URLs Found

| URL | Files |
|-----|-------|
| `https://patentsview.org` | Footer.tsx, about/page.tsx, methodology/page.tsx |
| `https://www.patentsview.org` | about/page.tsx, methodology/page.tsx |
| `https://www.saeromlee.com` | HomeContent.tsx, about/page.tsx (x3) |
| `https://claude.ai` | about/page.tsx |
| `https://patentworld.vercel.app` | faq/page.tsx, layout.tsx (metadata only) |

**Total: 6 unique external domains**, 11 link instances in JSX.

### `target="_blank"` with `rel="noopener noreferrer"` Verification

| File | Line | target="_blank" | rel="noopener noreferrer" | Status |
|------|------|-----------------|---------------------------|--------|
| `Footer.tsx` | 12 | Yes | Yes | PASS |
| `PWTimeline.tsx` | 59 | Yes | Yes | PASS |
| `HomeContent.tsx` | 86 | Yes | Yes | PASS |
| `about/page.tsx` | 165 | Yes | Yes | PASS |
| `about/page.tsx` | 197 | Yes | Yes | PASS |
| `about/page.tsx` | 201 | Yes | Yes | PASS |
| `about/page.tsx` | 253 | Yes | Yes | PASS |
| `about/page.tsx` | 274 | Yes | Yes | PASS |
| `about/page.tsx` | 360 | Yes | Yes | PASS |
| `methodology/page.tsx` | 571 | Yes | Yes | PASS |
| `methodology/page.tsx` | 589 | Yes | Yes | PASS |

### Links Without `target="_blank"`

| File | Line | URL | Assessment |
|------|------|-----|------------|
| `faq/page.tsx` | 127 | `https://patentworld.vercel.app` | OK -- self-referencing citation link, no `target="_blank"` needed |

### Verdict

**PASS**: All 11 external links that use `target="_blank"` correctly include `rel="noopener noreferrer"`. No security vulnerabilities found. The one link without `target="_blank"` is a self-reference and does not require it.

---

## 1.9.10 -- Copyright / License

### Footer (`src/components/layout/Footer.tsx`)

The footer contains:
```
Data from PatentsView (USPTO), accessed Jan 2025. Coverage: 1976-Sep 2025.
```

**No copyright notice** (no year, no copyright symbol, no "All rights reserved").

### About Page (`src/app/about/page.tsx`)

- **JSON-LD structured data** (line 94): `"license": "https://creativecommons.org/licenses/by/4.0/"` -- CC-BY 4.0 is declared in machine-readable metadata.
- **Data Source & Attribution section** (lines 248-280): Includes PatentsView attribution with links but does **not** explicitly state "CC-BY 4.0" or "Creative Commons Attribution 4.0 International" in visible text.
- **No visible copyright statement** for the PatentWorld site content itself.

### Methodology Page (`src/app/methodology/page.tsx`)

- Lines 571, 588-589: PatentsView data attribution text is present, matching the About page pattern.
- No explicit license mention in visible text.

### `package.json`

```json
"license": "ISC"
```

**FLAG**: The `package.json` declares `ISC` license, which may conflict with the CC-BY 4.0 declared in the About page JSON-LD. The ISC license applies to the code, while CC-BY 4.0 presumably applies to the data/content. This distinction is not documented anywhere.

### Findings

| Check | Status | Detail |
|-------|--------|--------|
| Copyright notice in footer | **MISSING** | No `(c) 2025 Saerom Lee` or equivalent |
| PatentsView CC-BY 4.0 in JSON-LD | PASS | Declared at `about/page.tsx` line 94 |
| PatentsView CC-BY 4.0 visible text | **MISSING** | Attribution text exists but does not mention the license name |
| PatentsView attribution text | PASS | Present in Footer, About, and Methodology pages |
| `package.json` license field | **REVIEW** | ISC declared; may need clarification vs. CC-BY 4.0 for content |
| Site content license visible | **MISSING** | No visible statement about what license covers PatentWorld itself |

### Recommendations

1. Add a copyright line to the footer: `(c) 2025 Saerom (Ronnie) Lee. All rights reserved.` (or chosen license).
2. Add visible text near the PatentsView attribution stating: "PatentsView data used under Creative Commons Attribution 4.0 International (CC-BY 4.0)."
3. Clarify the `package.json` license field or add a `LICENSE` file distinguishing code license (ISC) from content license (CC-BY 4.0).

---

## Summary of All Findings

| Section | Verdict | Critical Items |
|---------|---------|----------------|
| 1.9.9 Entity Color Consistency | PASS (with 2 minor flags) | `PWWorldFlowMap.tsx` local palette; `PWSankeyDiagram.tsx` hardcoded colors |
| 1.9.12 Font Consistency | PASS | All 3 fonts correctly configured, no overrides |
| 1.6.21 Locale Independence | **FAIL** | 42 `.toLocaleString()` calls without explicit `'en-US'` locale |
| 1.7.10 External Link Security | PASS | All `target="_blank"` links have `rel="noopener noreferrer"` |
| 1.9.10 Copyright/License | **FAIL** | Missing visible copyright notice; CC-BY 4.0 only in JSON-LD; ISC vs CC-BY 4.0 confusion |
