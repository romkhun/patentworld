# Visualization Perception, Accessibility & Legibility Log

This document records all visualization perception, accessibility, and legibility improvements made to the PatentWorld project. Each step addresses a specific category of issues, from foundational theming through typography standardization.

---

## Step 0B: Chart Theme + ChartContainer Enhancement

### chartTheme.ts (`src/lib/chartTheme.ts`)

- Created a centralized theme module exporting typography constants (font sizes, weights, font family) for consistent use across all chart components.
- Defined a WCAG-passing categorical color palette of 7 colors, ensuring sufficient contrast ratios for accessibility compliance.
- Added sequential and diverging color scales for heatmaps, choropleths, and convergence matrices.
- Provided text-on-background utility functions to guarantee legible label colors regardless of the underlying cell or region fill.

### ChartContainer (`src/components/charts/ChartContainer.tsx`)

- Added `id` prop for defined figure anchoring and cross-referencing (e.g., `id="fig-ch3-org-output"`).
- Added `subtitle` prop for displaying metric definitions and contextual notes beneath the title.
- Added `interactive` prop to distinguish static charts from interactive ones.
- Added `statusText` prop for conveying dynamic state changes to assistive technologies.
- Applied ARIA roles: `role="img"` for static charts, `role="group"` for interactive charts.
- Added `aria-live="polite"` region for dynamic status announcements (e.g., toggle state changes, series selection updates).
- Upgraded title typography to 16px / font-weight 700 for improved visual hierarchy.

---

## Step 1: Stacked Area to Small Multiples + Radar Bar Alternative

### Chapter 13 (Topic Modeling)

- Added a stacked/small-multiples toggle for the 25-topic trend chart.
- Default view shows the top 8 topics plus an aggregated "Other" category, keeping the stacked area readable.

### Chapter 6 (Strategy Profiles)

- Added a radar/bar chart toggle for strategy profile comparisons.
- Bar chart alternative provides a more accessible linear encoding for users who find radar charts difficult to interpret.

### Chapter 2 (CPC Distributions)

- Added a count/percentage toggle for CPC stacked area charts, allowing readers to switch between absolute and relative views.
- Merged CPC section D into "Other" to enforce a 7-category limit, matching the categorical palette size and reducing visual clutter.

---

## Step 2: Progressive Disclosure for Dense Line Charts

### PWSeriesSelector (`PWSeriesSelector.tsx`)

- Created a reusable series selector component with search input, show-all/reset buttons, and color swatch indicators.
- Enables progressive disclosure: users see a manageable default set and can explore additional series on demand.

### Chapter 3 (Organization Output & Diversity)

- Added series selectors for organization output charts, reducing default visible lines from 10 to 5.
- Added series selectors for diversity metric charts.

### Chapter 5 (Country Trends)

- Added a series selector for country trend lines, reducing default visible lines from 15 to 5.

### PWLineChart Hover Behavior

- Reduced non-hovered line opacity from 0.2 to 0.15 for stronger focus-on-hover contrast.
- Increased hovered line stroke width from 3 to 4 for better visual prominence.

---

## Step 3: Perceptually Uniform Color Scales

### PWRankHeatmap

- Replaced custom `cellColor`/`textColor` logic with `chartTheme.sequentialScale`, ensuring perceptually uniform gradations.
- Added a gradient legend bar to communicate the scale mapping to readers.

### PWChoroplethMap

- Replaced hardcoded `COLOR_STEPS` array with `chartTheme.sequentialStops(7)`, aligning the choropleth with the centralized perceptual scale.

### PWConvergenceMatrix

- Replaced the ad-hoc `getColor` function with `chartTheme.sequentialScale`, unifying color encoding across all matrix cells.

---

## Step 4: Redundant Encodings Beyond Color

### PWLineChart

- Added a `dashPattern` prop to `LineConfig`, allowing each line series to carry a distinct dash pattern (e.g., solid, `"8 4"`, `"2 4"`).
- Added a `showEndLabels` prop for direct labeling of line endpoints, reducing reliance on legend-only identification.
- Applied dash patterns to approximately 15 line charts across chapters, providing a non-color channel for series differentiation.

### PWScatterChart

- Added shape cycling for categorical groups: circle, square, triangle, and diamond.
- Shape encoding provides a redundant channel alongside color, critical for colorblind users.

### PWChoroplethMap

- Added direct SVG text labels for the top 5 and bottom 5 states, so extreme values are identifiable without hovering or relying solely on color intensity.

---

## Step 5: ChartContainer Props on All Charts

### Figure IDs

- Added `id="fig-{chapter-slug}-{description}"` to all approximately 128 `ChartContainer` instances across 14 chapters.
- Enables deep linking, cross-referencing from narrative text, and stable anchors for accessibility audits.

### Subtitles

- Added `subtitle` props with metric definitions to all `ChartContainer` instances (e.g., "HHI ranges from 0 (perfect diversity) to 1 (complete concentration)").
- Provides inline context so readers do not need to consult external documentation to understand what is being measured.

### Interactive Flag

- Added `interactive={true}` to all `ChartContainer` instances that include toggles, series selectors, or other interactive controls.
- Ensures the correct ARIA role (`role="group"`) is applied to interactive figures.

---

## Step 6: UMAP Axis Fixes (Chapter 13)

### PWScatterChart Axis Control

- Added `hideAxes` and `hideGrid` props to `PWScatterChart` to support dimensionality-reduction plots where numeric axes are meaningless.

### Chapter 13 UMAP Chart

- Removed misleading "UMAP-1" and "UMAP-2" axis labels, which incorrectly implied the axes carry interpretable numeric meaning.
- Added cluster centroid labels for the top 8 topics as overlay text, providing spatial orientation without relying on axis values.
- Updated the chart caption with a UMAP interpretability warning: distances and positions are approximate, and only local cluster structure is meaningful.
- Updated the surrounding narrative text to explain UMAP axis semantics, noting that axes are arbitrary projections and should not be read as meaningful dimensions.

---

## Step 7: Typography Standardization

### Chart Component Imports

- Imported `chartTheme` in all 12 reusable chart components, establishing a single source of truth for typographic values.

### Tick Labels

- Replaced all hardcoded `fontSize: 12` tick label values with `chartTheme.fontSize.tickLabel` across all chart components.

### Axis Labels

- Replaced all hardcoded `fontSize: 13` axis label values with `chartTheme.fontSize.axisLabel`.
- Applied `fontWeight: chartTheme.fontWeight.axisLabel` (500) consistently to all axis labels.

### Legend Text

- Replaced all hardcoded `fontSize: 12` legend text values with `chartTheme.fontSize.legend`.

### Specific Fixes

- **PWSmallMultiples**: Increased tick font size from 9px to 11px for legibility at small-multiple scales.
- **TimeAnnotations**: Increased annotation font size from 10px to 11px to meet minimum readability thresholds.
- **PWRadarChart**: Increased `PolarRadiusAxis` tick font size from 11px to 12px for consistency with the tick label standard.

### Font Family and Weight

- Added `fontFamily: chartTheme.fontFamily` to D3-rendered SVG text elements in `PWTreemap` and `PWChoroplethMap`, which operate outside React's style inheritance.
- Applied `chartTheme.fontWeight` constants to end labels and annotations for consistent visual weight across all textual elements.
