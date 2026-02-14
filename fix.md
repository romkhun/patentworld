# PatentWorld — Visualization Improvement Suggestions

## Guiding Principle

Every chart should pass the **5-second test**: a reader glancing at the chart for 5 seconds should be able to identify (1) what it shows and (2) the single most important pattern. If a chart requires more than 5 seconds to parse, it needs redesign — not more explanation.

The target audience is academic: faculty, PhD students, policymakers, journalists. They expect precision, clarity, and restraint. They are put off by dashboardy, corporate, or infographic aesthetics.

---

## 1. Chart Titles: Replace Labels with Findings

The single highest-impact change across the entire site. Most patent data visualizations use descriptive titles ("Patents by Year," "Top Assignees," "Citation Trends") that tell the reader *what* the chart shows but not *what it means*.

**Replace every chart title with a declarative finding that includes a specific number.**

| Before (Descriptive) | After (Insight-Oriented) |
|---|---|
| Patents Over Time | Annual US Patent Grants Grew Five-Fold, from 70,226 in 1976 to 352,049 in 2024 |
| Top 10 Assignees | IBM Holds the Largest US Patent Portfolio with [X] Grants, Followed by Samsung and Canon |
| Citations by Technology | Computing Patents Receive [X]% More Forward Citations Than the Cross-Technology Median |
| Gender in Patenting | Female Inventor Representation Rose from [X]% in 1976 to [Y]% in 2024 |
| Grant Lag Over Time | Median Time from Application to Grant Increased from [X] to [Y] Months |
| AI Patent Growth | AI-Related Patent Grants Grew [X]-Fold Between 2010 and 2024 |
| Patent Quality Trends | Median 5-Year Forward Citations Declined from [X] in 1990 to [Y] in 2015 |

These titles double as TL;DR summaries for AI crawlers, screen readers, and skim-readers. Verify every number before committing it to a title.

---

## 2. Legends: Positioning, Ordering, and Clutter

### 2.1 Positioning — Never Inside the Data Area

Legends overlapping data lines, bars, or map regions is one of the most common readability failures. Rules:

- **Desktop (≥1024px)**: Legend below the chart (horizontal layout), or to the right if there are ≤5 items.
- **Tablet (768–1023px)**: Legend below the chart, always.
- **Mobile (≤767px)**: Legend below the chart, stacked vertically if items don't fit on one row. Consider hiding legends on mobile and relying on tooltips + direct labels instead.
- **Never**: Legend floating on top of the chart area, inside the plot region, or partially occluding data.

Test every chart at 375px, 768px, and 1440px. If the legend overlaps at any breakpoint, fix it.

### 2.2 Ordering — Match the Visual Hierarchy

Legend items must appear in the same order as their visual prominence in the chart:

| Chart Type | Legend Order |
|---|---|
| Line chart | By value at the **rightmost** (most recent) data point, descending. The line that ends highest should be first in the legend. |
| Stacked area/bar | Match the stacking order: bottom-to-top in the chart = top-to-bottom in the legend. |
| Bar chart (grouped) | By total value, descending. |
| Pie / donut | By slice size, descending (largest first). |
| Scatter | By bubble size or by a meaningful grouping (e.g., technology area). |

If the current legend order is alphabetical or arbitrary, re-sort. Alphabetical ordering is almost never the most useful — it forces the reader to scan back and forth between the legend and the chart.

### 2.3 Reduce Legend Clutter

- **≤3 series**: Use direct labels on the lines/bars instead of a separate legend. Place the label at the end of each line (right-aligned, adjacent to the final data point). This eliminates the legend entirely.
- **4–6 series**: A compact horizontal legend below the chart is fine.
- **7+ series**: The chart probably has too many series. Switch to small multiples (one mini-chart per series) or add a toggle/filter to show ≤5 series at a time. A legend with 10+ items is never readable.

---

## 3. Axis Labels and Formatting

### 3.1 No Unnecessary Decimal Places

| Data Type | Correct Formatting | Wrong |
|---|---|---|
| Years | `2000` | `2000.0`, `2,000` |
| Patent counts | `150,000` or `150K` | `150000`, `150,000.00` |
| Percentages | `45%` or `45.2%` | `45.23847%`, `0.45` |
| Ratios / indices | `1.3` or `1.34` | `1.342857` |
| Citation counts | `12` | `12.0`, `12.00` |
| Dollar amounts (if any) | `$2.5B` | `$2,500,000,000` |

**Rule**: Use the fewest decimal places that preserve the distinction between adjacent data points. If two bars represent 45.2% and 45.8%, one decimal place is needed. If they represent 45% and 52%, zero decimal places suffice.

### 3.2 Year Axes

- Tick every 5 or 10 years: `1980, 1990, 2000, 2010, 2020`. Never show every year (too crowded) or fractional years (`2010.5`).
- First and last years should always appear as ticks, even if they break the regular interval (e.g., `1976, 1980, 1990, 2000, 2010, 2020, 2025`).
- On mobile, reduce to start and end year only, or every 10 years.

### 3.3 Value Axes

- Use abbreviated scales for large numbers: `0, 100K, 200K, 300K` not `0, 100000, 200000, 300000`.
- Always start the y-axis at zero for bar charts (truncated y-axes distort comparisons).
- For line charts, starting above zero is acceptable if the range is narrow and the purpose is to show variation — but label the axis clearly and do not mislead.
- Always include the unit in the axis label: "Patent Grants (thousands)", "Share of Total (%)", "Median Forward Citations (5-year window)".

### 3.4 Axis Label Orientation

- Horizontal labels are always preferred. If x-axis labels must be rotated (e.g., long company names), rotate to 45° maximum. Never use vertical (90°) labels — they are unreadable.
- If labels are too long for 45°, switch to a horizontal bar chart (swap x and y axes).

---

## 4. Color

### 4.1 Palette

Use a single consistent palette across the entire site. Recommended: **Okabe-Ito** (designed for colorblind accessibility) or a **ColorBrewer qualitative** palette (e.g., Set2 or Dark2).

Define 8 named colors and assign them consistently:

```
Color 1: #0072B2  (blue)       — Primary series / most important
Color 2: #E69F00  (orange)     — Secondary series
Color 3: #009E73  (green)      — Tertiary series
Color 4: #CC79A7  (pink)       — Fourth series
Color 5: #56B4E9  (light blue) — Fifth series
Color 6: #D55E00  (red-orange) — Sixth / alert
Color 7: #F0E442  (yellow)     — Seventh (use sparingly — low contrast)
Color 8: #999999  (gray)       — Reference lines, system averages, "other"
```

**The same entity must always be the same color across the entire site.** If IBM is blue in Chapter 3, it must be blue in Chapter 9. If CPC Section G is green in the Technology Revolution chapter, it must be green everywhere.

Create a `ENTITY_COLOR_MAP` constant:
```js
const ENTITY_COLORS = {
  "IBM": "#0072B2",
  "Samsung": "#E69F00",
  "Canon": "#009E73",
  // ...
  "CPC Section G": "#0072B2",
  "CPC Section H": "#E69F00",
  // ...
};
```

### 4.2 Colorblind Safety

- Never use red vs. green as the sole distinguisher between two series.
- Test every chart with a colorblind simulator (e.g., Coblis or Chrome DevTools > Rendering > Emulate vision deficiencies).
- When in doubt, add shape differences (dashed vs. solid lines, circles vs. squares for scatter points) in addition to color.

### 4.3 Contrast

- All text on charts (labels, annotations, tick marks) must meet WCAG 4.5:1 contrast against their background.
- Light gray text on white backgrounds is a common failure. Use `#4A4A4A` minimum for chart text on white.
- Colored fills (e.g., bar chart bars or area chart fills) must be distinguishable from adjacent fills. Test: can you tell the difference if you squint?

### 4.4 Sequential and Diverging Scales

- **Heatmaps with unipolar data** (e.g., patent counts, citation counts — always ≥0): Use a sequential single-hue scale (light to dark blue, or white to dark blue). Never use a rainbow scale.
- **Heatmaps with bipolar data** (e.g., growth rates that can be positive or negative, or deviations from a mean): Use a diverging scale (red–white–blue or orange–white–purple) centered at zero or the neutral value.
- **Always include a color legend** with labeled endpoints (minimum and maximum values) and ideally 3–5 intermediate tick marks.

---

## 5. Chart-Type-Specific Improvements

### 5.1 Line Charts

**Problem**: More than 5–6 overlapping lines become unreadable ("spaghetti chart").

**Solutions**:
- **≤3 lines**: Direct end-of-line labels (place the series name at the rightmost data point). No legend needed.
- **4–6 lines**: Direct labels + a compact legend below.
- **7–12 lines**: Switch to **small multiples** — a grid of small charts, each showing one series with a shared x and y scale. Each mini-chart has its own title (the series name). The reader sees individual trends and can compare across panels because the scales are identical.
- **13+ lines**: Small multiples or an interactive toggle/filter that lets the user select which series to display. Never show all 13+ simultaneously.

**Other line chart rules**:
- Use a stroke width of 2px for primary series, 1.5px for secondary. Never 1px (too thin on high-DPI screens) or 4px (too dominant).
- For time series with missing years, show a gap in the line (not a zero). Zero is a data value; a gap means "no data."
- Add subtle hover interaction: on hover, bold the hovered line and fade all others to 20% opacity. This lets the reader isolate any series without clicking.

### 5.2 Bar Charts

- **Sort by value** (descending), not alphabetically, unless the x-axis is inherently ordered (years, rank positions).
- **Horizontal bars** for long labels (company names, technology area names, country names). Vertical bars only for short labels (years, ranks).
- **Label the bars directly** with the value if there are ≤15 bars and the values are important (e.g., the top-10 assignees chart). Place the label at the end of the bar (inside for long bars, outside for short bars).
- **No 3D effects**. Ever.
- **Consistent bar width**. All bars in a chart should be the same width. Use gaps of ~40% of bar width between bars.

### 5.3 Stacked Area / Stacked Bar Charts

- **Stack order must be consistent** across all years/panels. The most important (or largest) category at the bottom, least important at top. The same order applies to the legend.
- **Include a percentage toggle**: Allow the reader to switch between absolute values (stacked count) and relative values (stacked to 100%). The absolute view shows growth; the relative view shows composition shifts. Both are useful.
- **Limit to 5–7 categories**. If there are more, group the smallest into "Other." No one can distinguish 12 stacked slices.
- **Color the "Other" category gray** — it should not visually compete with named categories.

### 5.4 Maps (US Choropleth)

- **Use Albers USA projection** (or equivalent). Do not use Mercator for US-focused maps (Alaska and Hawaii are mispositioned or absent).
- **Normalize by population or R&D spending** for any map showing patent counts. A raw-count choropleth of US states is just a population map. Patents per capita or patents per $1M R&D spending reveals meaningfully different geographic patterns.
- **Include a labeled color legend** with the scale endpoints and at least one midpoint.
- **Provide a tooltip on hover** showing the exact value for each state/county.
- **Consider a cartogram or hex tile map** as an alternative — these give equal visual weight to small-area, high-patent states (Connecticut, Massachusetts, New Jersey) that are nearly invisible on geographic maps.

### 5.5 Scatter Plots

- **Label outliers** directly on the chart (the 5–10 most interesting points). Do not force the reader to hover over every dot.
- **Include a reference line** where appropriate: 45-degree line for X vs. Y comparisons, horizontal/vertical lines for means, or a regression/LOESS trend line for relationships.
- **Use bubble size as a third dimension** sparingly — and always include a size legend (e.g., "Bubble size = total patents: ● 1,000 ● 10,000 ● 50,000").
- **Avoid overplotting**: If 500+ points overlap, use transparency (alpha = 0.3–0.5), jitter, hexbin aggregation, or density contours instead of opaque dots.

### 5.6 Heatmaps

- **Rows and columns must be sorted meaningfully** — not randomly or alphabetically (unless alphabetical is the most useful order). For a CPC × decade heatmap, sort CPC subclasses by total patent count (descending) so the most important subclasses are at the top.
- **Limit to 15–20 rows maximum**. More than that and the cells become illegibly small. Aggregate or filter.
- **Label the color scale** with exact values at the endpoints and midpoint.
- **Add value labels inside cells** if there are ≤100 cells and the values are important. Use white text on dark cells, dark text on light cells.

### 5.7 Network Graphs

- **Limit to 20–30 nodes** for static display. A network with 100+ nodes and no interactivity is visual noise.
- **Size nodes by degree or a meaningful metric** (e.g., total patents, centrality).
- **Label all visible nodes**. If labels overlap, either reduce node count or implement a zoom interaction.
- **Use directional edges (arrows) for citation networks** — the direction of knowledge flow matters.
- **Provide a force-layout with collision detection** so nodes don't overlap.
- **Add zoom and pan** for any network with >15 nodes.
- Consider replacing the network graph entirely with a **chord diagram** (for flows between known entities) or a **matrix/heatmap** (for pairwise relationships) — these are often more readable than force-directed layouts.

### 5.8 Small Multiples

When used (for line charts with many series, or for comparing entities):
- **Shared x and y scales across all panels** — this is the entire point. If each panel has its own scale, comparison is impossible.
- **3–4 columns on desktop, 1–2 on mobile**.
- **Label each panel clearly** (company name, technology area, etc.) at the top-left of each mini-chart.
- **Sort panels by a meaningful metric** (e.g., by value at the most recent data point, or by total, descending). Not alphabetically.
- **Highlight one reference line** in every panel (e.g., the system-wide average) in dashed gray to provide a common comparison baseline.

---

## 6. Captions

Every chart must have a caption immediately below it. Captions serve three purposes: (1) accessibility (screen readers), (2) GenAI optimization (LLMs read captions but not SVG/canvas), and (3) reader guidance.

### Structure

```
[Sentence 1: What the chart shows — the data, the axes, the scope.]
[Sentence 2: The key pattern — the most important finding, with a specific number.]
[Sentence 3 (optional): Context or significance — why this matters or how it connects to the chapter's argument.]
```

### Examples

**Bad caption**: "This chart shows patents over time."

**Good caption**: "Annual US patent grants by the USPTO, 1976–2025. Patent grants grew from 70,226 in 1976 to a peak of 354,428 in 2020 before declining modestly to [X] in 2024. The sustained growth from 2000 to 2020, averaging [Y]% annually, coincided with the expansion of patenting in computing and electronics technologies (see Chapter 2)."

**Bad caption**: "Top 10 companies by patent count."

**Good caption**: "Cumulative US patent grants for the ten highest-volume assignees, 1976–2025. IBM leads with [X] total grants, followed by Samsung ([Y]) and Canon ([Z]). The top 10 assignees collectively account for [A]% of all US patents granted during this period, indicating [high/moderate] concentration."

### Implementation

Use `<figcaption>` in the HTML (not a `<p>` after the chart). Wrap the chart and caption in a `<figure>`:

```html
<figure>
  <div class="chart-container">
    <!-- chart renders here -->
  </div>
  <figcaption>
    Annual US patent grants by the USPTO, 1976–2025. Patent grants grew from 
    70,226 in 1976 to a peak of 354,428 in 2020...
  </figcaption>
</figure>
```

This structure is semantic, accessible, and readable by AI crawlers.

---

## 7. Tooltips

### 7.1 Content

Every tooltip should show:
- The exact value (with thousands separators, appropriate decimal places)
- The series/entity name
- The x-axis value (typically the year)

For multi-series charts, show all visible series in the tooltip, sorted by value (descending), with the hovered series highlighted.

### 7.2 Formatting

```
─────────────────────────
  2015
  ─────────────────────────
  IBM           12,589 ← (highlighted)
  Samsung        8,234
  Canon          4,102
  ─────────────────────────
```

- Consistent styling across the entire site (same font, same background, same border radius).
- White background with a subtle shadow or border. Never a dark tooltip on a white chart (jarring contrast).
- Numbers right-aligned within the tooltip for easy comparison.

### 7.3 Behavior

- Tooltip appears on hover (desktop) or tap (mobile).
- Tooltip follows the cursor or snaps to the nearest data point.
- **Tooltip must never overflow the viewport edge.** If the data point is near the right edge of the screen, the tooltip should flip to the left side.
- On mobile, consider a fixed tooltip bar at the top or bottom of the chart (instead of a floating tooltip) since finger-following tooltips are unreliable on touch devices.

---

## 8. Annotations and Reference Lines

### 8.1 Time-Series Annotations

Every time-series chart spanning ≥15 years should include 2–4 contextual reference markers:

| Event | Year | Style |
|---|---|---|
| Dot-com peak | 2000 | Thin dashed vertical line, labeled at top |
| Global Financial Crisis | 2008–2009 | Light gray shaded vertical band |
| America Invents Act | 2011 | Thin dashed vertical line |
| Alice Corp. v. CLS Bank | 2014 | Thin dashed vertical line |
| COVID-19 | 2020 | Thin dashed vertical line |

Rules:
- Annotations should be **subtle**: light gray dashed lines, small labels (10–11px), low opacity. They provide context, not distraction.
- Labels at the top of the chart area, rotated 0° (horizontal), in a muted color.
- **Not every chart needs every annotation.** Include only the events relevant to the chart's subject. A chart about grant lag does not need the dot-com annotation; a chart about software patents does need Alice.
- Implement as a reusable `<TimeAnnotations events={[...]} />` component that accepts a list of events and renders them on any time-series chart.

### 8.2 Reference Lines for Comparisons

- On any chart showing a firm-level metric over time, include the **system-wide average** as a dashed gray line. This gives immediate context: is this firm above or below average?
- On any scatter plot, include the **mean of x** and **mean of y** as faint dashed crosshairs. This divides the plot into four interpretable quadrants.
- On any bar chart comparing entities, include the **overall average** as a vertical (for horizontal bars) or horizontal (for vertical bars) dashed line.

---

## 9. Responsive Design

### 9.1 Mobile (≤767px)

- Charts must be legible on a 375px-wide screen without horizontal scrolling.
- Minimum font size on charts: 11px. Below this, text is unreadable on mobile.
- Legends move below the chart.
- Consider hiding complex secondary panels (e.g., the decomposition panel in the exploration chart) behind a "Show details" toggle on mobile.
- Touch targets for interactive elements (toggles, dropdowns, buttons) must be ≥44×44px.
- Tooltips: use a fixed bottom bar instead of floating cursor-following tooltips.

### 9.2 Chart Container Heights

**Critical for CLS (Cumulative Layout Shift)**. Every chart container must have an explicit height or aspect ratio set before the chart renders. Without this, the page layout shifts as charts load, causing a poor CLS score and a jarring user experience.

```css
.chart-container {
  width: 100%;
  aspect-ratio: 16 / 9;  /* or explicit min-height */
  min-height: 300px;
}

@media (max-width: 767px) {
  .chart-container {
    aspect-ratio: 4 / 3;
    min-height: 250px;
  }
}
```

### 9.3 Adaptive Tick Counts

On mobile, reduce the number of axis ticks to prevent overcrowding:
- X-axis (years): show 3–5 ticks on mobile (start, midpoint, end), 6–10 on desktop.
- Y-axis: show 4–5 ticks on mobile, 6–8 on desktop.
- Recharts/D3 tick count can be set dynamically based on container width.

---

## 10. Animation and Interaction

### 10.1 Entrance Animation

- Charts should **not** animate on page load by default. Academic readers find count-up animations and line-drawing effects distracting. Exception: the homepage hero counters can animate from 0 to their final value, but only if the static HTML contains the real numbers as a fallback.
- If animation is used, keep it under 500ms with an ease-out curve. Never bounce effects.

### 10.2 Hover Effects

- **Line charts**: On hover, bold the hovered line (increase stroke width by 1px) and fade all other lines to 20% opacity. This isolates the hovered series without removing context.
- **Bar charts**: On hover, darken the hovered bar slightly (10% darker fill) and show the tooltip.
- **Scatter plots**: On hover, enlarge the hovered point by 50% and show the tooltip with all relevant dimensions.
- **All charts**: Smooth transition (150ms) for hover state changes. No abrupt snapping.

### 10.3 Interactive Controls

For charts with many entities (e.g., top-50 company profiles):
- **Dropdown selector**: Let the user choose which company to display. Default to the most interesting or most-patented company.
- **"Compare" mode**: Let the user select 2–3 companies and display them side-by-side or overlaid.
- **Series toggle**: For multi-series line charts, let the user click a legend item to show/hide that series. The hidden series should be visually struck through in the legend.

### 10.4 Keyboard Accessibility

All interactive chart elements must be navigable by keyboard:
- Tab to focus on interactive elements (dropdowns, toggles).
- Arrow keys to navigate between data points (for screen reader users).
- ARIA labels on chart containers describing the key finding (e.g., `aria-label="Chart showing IBM's forward citation distribution from 1980 to 2020. Median citations declined from 12 to 7."`).

---

## 11. Typography on Charts

### 11.1 Font

Use the same font family as the site's body text (likely a system sans-serif or Inter/Source Sans). Do not use a different font on charts — this creates visual dissonance.

### 11.2 Size Hierarchy

| Element | Size | Weight |
|---|---|---|
| Chart title | 15–16px | Semibold (600) |
| Axis labels (e.g., "Year", "Patent Grants") | 12–13px | Regular (400) |
| Tick labels (e.g., "2000", "150K") | 11–12px | Regular (400) |
| Annotations / reference labels | 10–11px | Regular, italic or muted color |
| Caption | 13–14px | Regular (400), muted color |
| Tooltip text | 12–13px | Regular |

### 11.3 Number Formatting

Use a consistent number formatter across the entire site:

```js
function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;  
  return n.toLocaleString();
}

function formatPercent(n, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}
```

Apply this formatter to all tooltips, axis ticks, and direct labels. Never display raw unformatted numbers.

---

## 12. Whitespace and Layout

### 12.1 Chart Spacing

- **Between charts**: At least 48px vertical gap between consecutive charts. Dense stacking makes the page feel cluttered and makes it hard to tell where one chart ends and the next begins.
- **Between chart and caption**: 12–16px.
- **Between title and chart area**: 16–20px.
- **Internal padding**: 24px between the chart's data area and the container edges (top, right, bottom, left). This prevents data points or labels from being clipped at the edges.

### 12.2 Width

- Charts should be **full content width** on both desktop and mobile. Do not float charts to the left or right with text wrapping around them — this works for images in newspapers, not for data visualizations that need horizontal space.
- On very wide screens (>1440px), cap chart width at ~900–1000px to prevent the visualization from becoming too stretched. Center it with `max-width: 960px; margin: 0 auto;`.

### 12.3 Vertical Rhythm

All charts within a chapter should have a consistent height (or a small set of heights: standard = 400px, tall = 500px, compact = 300px). Mixed heights make the page feel chaotic. Set a site-wide chart height and only deviate when the data demands it (e.g., a heatmap with many rows needs more vertical space).

---

## 13. Data-Ink Ratio

Maximize the share of the chart's visual elements that represent data, and minimize non-data elements:

**Remove**:
- Grid lines (or make them very faint: `stroke: #f0f0f0`). A chart with 10 horizontal grid lines and 10 vertical grid lines has 20 non-data lines competing with the actual data lines.
- Chart borders / boxes around the plot area.
- Background shading on the plot area (should be white or transparent).
- Decorative elements, icons, or imagery.

**Keep**:
- Axis lines (x and y).
- Tick marks (short, subtle).
- Data elements (lines, bars, points).
- Direct labels (preferred over legends when possible).
- Annotations that add context.

The goal is a clean, uncluttered chart where the data is the visual dominant.

---

## 14. Specific Chart Patterns for Patent Data

### 14.1 Bump Chart for Rankings Over Time

For any chart showing "top N assignees" or "top N technology areas" over time, a **bump chart** (ranking lines) is far more effective than overlapping line charts of raw counts. Each line shows an entity's rank position (y-axis, inverted so #1 is at top) across years (x-axis). Crossings are visually salient — readers instantly see who rose, who fell, and when.

Use for: top assignees by decade, top CPC subclasses, top states/cities.

### 14.2 Slope Chart for Before/After Comparisons

For any comparison between two time periods (e.g., "share of patents before vs. after Alice"), a **slope chart** (two vertical axes connected by lines) is cleaner than a grouped bar chart. Each entity is a line; upward slope = increase, downward = decrease. The steepness encodes the magnitude.

Use for: policy impact comparisons, decade-over-decade compositional shifts.

### 14.3 Strip / Beeswarm Plot for Distributions

For showing the distribution of a continuous variable across categories (e.g., forward citations by CPC section), a **beeswarm plot** (one dot per observation, jittered to avoid overlap) or a **strip plot** shows the actual distribution shape, including outliers. This is more informative than a bar chart of means and more visually engaging than a box plot.

Use for: citation distributions by technology, grant lag distributions by company.

### 14.4 Fan Chart for Uncertainty / Distributional Data

For the firm-level quality distribution analysis, a **fan chart** (ribbon chart) shows the median as a line and the interquartile/interdecile ranges as nested ribbons. This conveys the full distribution in a compact, time-series-compatible format.

Use for: firm citation distributions over time, claims distributions over time.

---

## Summary Checklist

For every chart on the site, verify:

- [ ] Title is a declarative finding with a specific number
- [ ] Legend does not overlap any data, axis, or caption at any breakpoint
- [ ] Legend items are in descending order by value (or match stacking order)
- [ ] Axis labels have no unnecessary decimal places
- [ ] Year axis shows whole years only, with sensible tick intervals
- [ ] Large numbers use thousands separators or abbreviations (K/M)
- [ ] Color palette is consistent site-wide and colorblind-safe
- [ ] Sequential/diverging color scales are appropriate for the data type
- [ ] Text meets 4.5:1 contrast
- [ ] ≤6 overlapping lines; otherwise small multiples or toggle
- [ ] Bar charts sorted by value (descending) unless chronological
- [ ] Caption present using `<figcaption>`, containing the key finding with a number
- [ ] Tooltip shows exact values on hover, does not overflow viewport
- [ ] Responsive: legible at 375px, no horizontal scroll, legends below chart
- [ ] Chart container has explicit height/aspect-ratio (prevents CLS)
- [ ] Touch targets ≥ 44px on mobile
- [ ] 2–4 contextual annotations on time-series charts spanning ≥15 years
- [ ] System-wide average reference line on firm-level charts
- [ ] No 3D effects, no decorative imagery, minimal grid lines
- [ ] Chart passes the 5-second test: key pattern is identifiable at a glance