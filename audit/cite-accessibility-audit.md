# Combined Audit: CiteThisFigure + Accessibility + GlossaryTooltip

**Date:** 2026-02-21
**Scope:** Sections 1.13, 1.12, and 1.9.6 of the PatentWorld QA plan

---

## 1. CiteThisFigure Audit (Section 1.13 + 1.6.22)

### 1.1 Component Location

- **File:** `/home/saerom/projects/patentworld/src/components/charts/CiteThisFigure.tsx`
- **Integration:** Rendered inside `ChartContainer.tsx` at line 116 as `<CiteThisFigure title={title} figureId={id} />`

### 1.2 Coverage: Every ChartContainer Gets CiteThisFigure

CiteThisFigure is **embedded directly inside ChartContainer** (not opt-in). Since every visualization goes through ChartContainer, every figure automatically receives a citation widget.

| Metric | Count |
|--------|-------|
| Total ChartContainer instances across all pages | **459** |
| ChartContainer instances with `id=` prop | **459** (100%) |
| ChartContainer instances missing `id=` prop | **0** |
| HERO_STATS.visualizations (declared target) | **458** |
| Pages using ChartContainer | **36** (35 chapter pages + HomeContent) |
| Pages importing CiteThisFigure directly | **2** (CiteThisFigure.tsx + ChartContainer.tsx only) |

**Note:** The count of 459 exceeds the declared 458 by 1, which is the homepage hero chart (`fig-homepage-patent-volume` in `HomeContent.tsx`). The 458 figure in `HERO_STATS` refers to chapter visualizations only. All figures have CiteThisFigure.

### 1.3 Citation Fields Verification

| Field | Value | Status |
|-------|-------|--------|
| Author | `Lee, Saerom (Ronnie)` | PASS |
| Year | `2025` | PASS (hardcoded -- will need update in future) |
| Title | Dynamic from `title` prop | PASS |
| Container | `PatentWorld: 50 Years of US Patent Data` | PASS |
| Institution | `The Wharton School, University of Pennsylvania` | PASS |
| URL | `window.location.origin + pathname + #figureId` | PASS (stable anchor) |
| Accessed date | Dynamic via `new Date().toLocaleDateString()` | PASS |
| Data source | `USPTO via PatentsView` | PASS |

### 1.4 APA 7th Edition Format Review

**Generated format:**
```
Lee, Saerom (Ronnie). 2025. "Title." In PatentWorld: 50 Years of US Patent Data.
The Wharton School, University of Pennsylvania. URL. Accessed DATE.
Data source: United States Patent and Trademark Office (USPTO) via PatentsView.
```

**Issues:**

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| C1 | APA 7 uses `(2025).` not `. 2025.` | Minor | APA 7 format: `Lee, S. (R.). (2025). Title. In ...` -- the year should be in parentheses after the author, not separated by a period |
| C2 | Parenthetical author name | Minor | APA 7 would render as `Lee, S. (R.)` with initials, though for a web resource the full name is acceptable |
| C3 | "Accessed" date phrasing | Minor | APA 7 uses `Retrieved DATE, from URL` rather than `URL. Accessed DATE` |
| C4 | Smart quotes vs. plain quotes | Cosmetic | The title uses ASCII `"..."` -- APA prefers italics for titles rather than quotes for web resources |

**Recommendation:** These are minor formatting deviations. The citation is functional and contains all required fields. A strict APA 7 version would be:
```
Lee, S. (R.). (2025). Title. In PatentWorld: 50 Years of US Patent Data.
The Wharton School, University of Pennsylvania. Retrieved DATE, from URL.
```

### 1.5 BibTeX Format Review

**Generated format:**
```bibtex
@misc{lee2025patentworld_SLUG,
  author = {Lee, Saerom (Ronnie)},
  title = {Title},
  year = {2025},
  howpublished = {PatentWorld: 50 Years of US Patent Data},
  institution = {The Wharton School, University of Pennsylvania},
  url = {URL},
  note = {Data source: USPTO via PatentsView. Accessed DATE}
}
```

**Issues:**

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| C5 | `institution` not a standard `@misc` field | Minor | BibTeX `@misc` does not recognize `institution`; use `organization` or move to `note` |
| C6 | `howpublished` phrasing | Minor | Should be `\url{...}` or a descriptive string; currently stores the project name rather than the medium |

**Recommendation:** These are minor. BibTeX processors will silently ignore unknown fields, so `institution` will be dropped by some bibliography styles. Consider using `@online` (biblatex) or moving institution to `note`.

### 1.6 CiteThisFigure Accessibility Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| C7 | `aria-expanded` hardcoded to `"false"` | Medium | Line 61: The closed-state button has `aria-expanded="false"` but the open state renders entirely different JSX (lines 69-106) with no `aria-expanded="true"`. The open/close states are split across two separate `return` branches, so the expanded button never announces `aria-expanded="true"`. |
| C8 | No `aria-controls` on toggle button | Low | The "Cite this figure" button should reference the citation panel ID via `aria-controls` |
| C9 | APA/BibTeX toggle lacks `aria-pressed` | Low | The format toggle buttons (lines 74-85) act as a toggle group but lack `role="tablist"` / `aria-pressed` / `aria-selected` to communicate the active format to screen readers |
| C10 | Copy button lacks live region feedback | Low | The "Copied" state (line 102) is visual only. Screen readers will not announce the copy confirmation. Should use `aria-live="assertive"` on a status region. |
| C11 | No Escape key to close | Low | The citation panel has no keyboard shortcut to close; users must Tab to the Close button |

---

## 2. Accessibility Audit (Section 1.12)

### 2.1 Skip-to-Content Link

| Check | Status | Detail |
|-------|--------|--------|
| Skip link present | PASS | `src/app/layout.tsx` line 129: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` |
| Target `id="main-content"` exists | PASS | Line 134: `<main id="main-content" ...>` |
| Skip link visible on focus | PASS | Uses `focus:not-sr-only focus:fixed focus:top-1 focus:left-1 focus:z-[80]` |
| Present on all pages | PASS | Defined in the root `layout.tsx`, applied to every route |

### 2.2 ChartContainer Accessibility

| Check | Status | Detail |
|-------|--------|--------|
| `<figure>` semantic element | PASS | ChartContainer renders a `<figure>` element |
| `aria-labelledby` on figure | PASS | Links to the `<h3>` heading via `{id}-heading` |
| `aria-describedby` on figure | PASS | Links to `<figcaption>` via `{id}-caption` (when caption provided) |
| `<figcaption>` for captions | PASS | Line 109: renders `<figcaption>` with proper `id` |
| `<noscript>` fallback | PASS | Two noscript blocks (lines 51-56 and 88-92) provide descriptive text when JS is disabled |
| Loading state `aria-label` | PASS | Line 67: `aria-label={\`Loading chart: ${title}\`}` on the skeleton placeholder |
| `role="img"` on static charts | PASS | Line 98: `role={interactive ? 'group' : 'img'}` |
| `role="group"` on interactive charts | PASS | Same line; interactive charts get `role="group"` |
| `aria-live` status text | PASS | Line 106: `<p className="sr-only" aria-live="polite">{statusText}</p>` for interactive state changes |
| All 459 instances have `id` prop | PASS | Verified via automated scan; 459/459 have explicit `id` |

### 2.3 Individual Chart Component Accessibility

| Component | `ariaLabel` prop | `role` attribute | Keyboard support |
|-----------|-----------------|------------------|-----------------|
| PWChordDiagram | PASS (`ariaLabel` prop with fallback) | PASS (`role="img"`) | None (canvas-like SVG) |
| PWSankeyDiagram | PASS (`ariaLabel` prop with fallback) | PASS (`role="img"`) | None (canvas-like SVG) |
| PWNetworkGraph | PASS (`ariaLabel` prop with fallback) | PASS (`role="img"`) | Partial (zoom buttons have `aria-label`) |
| PWValueHeatmap | PASS | PASS (`role="grid"` on table) | N/A (table element) |
| PWCompanySelector | PASS (full ARIA combobox pattern) | PASS (`role="combobox"`, `role="listbox"`, `role="option"`) | PASS (ArrowUp/Down, Enter, Escape, Home, End) |
| PWTimeline | PASS (`aria-expanded`, `aria-controls`) | Partial | None beyond native button |
| Other PW* charts (Area, Bar, Line, Scatter, etc.) | No aria props on SVG | No explicit roles | None |

**Issues:**

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| A1 | Most PW* chart components lack internal aria attributes | Medium | PWAreaChart, PWBarChart, PWLineChart, PWScatterChart, PWBubbleScatter, PWBumpChart, PWChoroplethMap, PWCoefficientPlot, PWFanChart, PWLollipopChart, PWLorenzCurve, PWRadarChart, PWRankHeatmap, PWSmallMultiples, PWSparkline, PWTrajectoryScatter, PWTreemap, PWWorldFlowMap, PWSlopeChart, PWConvergenceMatrix do not add `role` or `aria-label` to their SVG roots. They rely entirely on ChartContainer's outer `role="img"` + `aria-label`. |
| A2 | No `prefers-reduced-motion` support | Medium | The CSS file (`globals.css`) has scroll-triggered fade-in animations (`.fade-in-section`, 600ms transitions) and chart loading pulses (`animate-pulse`) but no `@media (prefers-reduced-motion: reduce)` query to disable or minimize motion. |
| A3 | Tooltips are hover-only on most charts | Medium | Recharts-based tooltips (the majority of charts) activate only on mouse hover. There is no keyboard-triggered tooltip mechanism for the data series in bar, line, area, scatter, or other Recharts-based charts. |
| A4 | No `<title>` or `<desc>` inside SVGs | Low | Recharts-rendered SVGs and custom D3 SVGs do not include `<title>` or `<desc>` elements. ChartContainer compensates with `aria-labelledby` on the outer figure, but SVGs themselves are opaque to screen readers. |
| A5 | No forced-colors / high-contrast mode support | Low | No `@media (forced-colors: active)` or `color-scheme` declarations. Chart colors rely on CSS custom properties but do not adapt for Windows High Contrast mode. |
| A6 | Touch target sizes in chart legends | Info | `globals.css` lines 128-132 enforce `min-height: 44px` and `min-width: 44px` on `.recharts-legend-item` on mobile -- this is good. However, custom SVG interaction areas (e.g., network graph node drag, chord diagram hover) do not enforce minimum touch targets. |

### 2.4 Keyboard Navigation Summary

| Interactive Element | Keyboard Support | Status |
|--------------------|-----------------|--------|
| Skip-to-content link | Tab + Enter | PASS |
| Theme toggle | Tab + Enter | PASS (native button) |
| Mobile nav | Tab + Enter | Assumed PASS (native button) |
| PWCompanySelector | Full combobox pattern (Arrow keys, Enter, Escape, Home, End) | PASS |
| PWTimeline expand/collapse | Tab + Enter (native button) | PASS |
| PWNetworkGraph zoom controls | Tab + Enter (native buttons) | PASS |
| CiteThisFigure toggle | Tab + Enter | PASS (but see C7, C11) |
| GlossaryTooltip | Tab + focus (see Section 3) | Partial |
| Recharts tooltips on data points | Not keyboard accessible | FAIL |
| Chart hover interactions (Chord, Sankey, Network nodes) | Not keyboard accessible | FAIL |

---

## 3. GlossaryTooltip Accessibility Audit (Section 1.9.6)

### 3.1 Component Location

- **File:** `/home/saerom/projects/patentworld/src/components/chapter/GlossaryTooltip.tsx`
- **Glossary data:** `/home/saerom/projects/patentworld/src/lib/glossary.ts` (27 terms defined)
- **Usage:** Found in 22 chapter pages

### 3.2 Current Implementation Analysis

```tsx
<span className="group relative inline">
  <span
    role="term"
    tabIndex={0}
    aria-describedby={tooltipId}
    className="cursor-help border-b border-dashed ..."
  >
    {children ?? entry.term}
  </span>
  <span
    id={tooltipId}
    role="tooltip"
    className="... opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
  >
    <span className="block text-muted-foreground">{entry.definition}</span>
  </span>
</span>
```

### 3.3 Accessibility Checklist

| # | Check | Status | Detail |
|---|-------|--------|--------|
| G1 | Hover activation | PASS | `group-hover:opacity-100` shows tooltip on mouse hover |
| G2 | Keyboard focus activation | PASS | `tabIndex={0}` makes the term focusable; `group-focus-within:opacity-100` shows tooltip on focus |
| G3 | `role="tooltip"` on definition | PASS | The definition span has `role="tooltip"` |
| G4 | `aria-describedby` linking | PASS | The trigger span has `aria-describedby={tooltipId}` pointing to the tooltip's `id` |
| G5 | `role="term"` on trigger | PASS | Semantically appropriate for glossary terms |
| G6 | Touch device activation | PARTIAL | Touch devices trigger `:focus` via tap (since `tabIndex={0}`), which activates `group-focus-within:opacity-100`. However, there is no explicit touch event handler, so behavior depends on the browser's focus heuristics. On most mobile browsers, tapping a `tabIndex={0}` span will focus it and show the tooltip. |
| G7 | Escape key dismissal | FAIL | No `onKeyDown` handler exists. Users cannot press Escape to dismiss the tooltip. They must Tab away or click elsewhere. |
| G8 | Tooltip persistence on hover | FAIL | The tooltip has `pointer-events-none`, meaning users cannot hover over the tooltip text itself to read long definitions. The tooltip disappears when the mouse leaves the trigger term. |
| G9 | Delay before dismiss | FAIL | No delay/debounce -- the tooltip disappears instantly when hover leaves the trigger, which can be jarring and makes it hard for users with motor impairments to keep the tooltip visible. |
| G10 | Tooltip positioning overflow | POTENTIAL | The tooltip uses `bottom-full` (above the term) with `-translate-x-1/2` centering. For terms near the top or edges of the viewport, the tooltip may overflow off-screen. No collision detection is implemented. |
| G11 | Screen reader announces definition | PASS | `aria-describedby` ensures screen readers read the definition when the term is focused, regardless of CSS visibility. |

### 3.4 WCAG 2.1 Compliance Assessment

| WCAG Criterion | Status | Notes |
|---------------|--------|-------|
| 1.3.1 Info and Relationships (A) | PASS | `role="term"` + `aria-describedby` + `role="tooltip"` |
| 1.4.13 Content on Hover or Focus (AA) | PARTIAL FAIL | Tooltip is not hoverable (`pointer-events-none`), not dismissable via Escape, and has no persist-on-hover behavior. WCAG 1.4.13 requires all three. |
| 2.1.1 Keyboard (A) | PASS | Tooltip appears on focus via `tabIndex={0}` |
| 2.1.2 No Keyboard Trap (A) | PASS | Users can Tab away freely |
| 4.1.2 Name, Role, Value (A) | PASS | Proper ARIA roles and relationships |

---

## 4. Summary of All Issues

### Critical (0)
None.

### Medium Severity (4)

| ID | Component | Issue |
|----|-----------|-------|
| C7 | CiteThisFigure | `aria-expanded` never set to `true` in open state |
| A1 | PW* chart components | 20+ chart types lack internal SVG aria attributes |
| A2 | globals.css | No `prefers-reduced-motion` media query for animations |
| A3 | Recharts charts | Data-point tooltips are hover-only, not keyboard accessible |

### Low Severity (9)

| ID | Component | Issue |
|----|-----------|-------|
| C1 | CiteThisFigure | APA year format uses period instead of parentheses |
| C3 | CiteThisFigure | "Accessed" phrasing differs from APA 7 "Retrieved...from" |
| C5 | CiteThisFigure | BibTeX `institution` field not standard for `@misc` |
| C8 | CiteThisFigure | No `aria-controls` on toggle button |
| C9 | CiteThisFigure | APA/BibTeX toggle lacks `aria-pressed` |
| C10 | CiteThisFigure | Copy confirmation not announced to screen readers |
| C11 | CiteThisFigure | No Escape key to close citation panel |
| A4 | SVG charts | No `<title>` or `<desc>` in SVG elements |
| A5 | CSS | No forced-colors / high-contrast mode support |

### GlossaryTooltip-Specific (3)

| ID | Component | Issue |
|----|-----------|-------|
| G7 | GlossaryTooltip | No Escape key dismissal |
| G8 | GlossaryTooltip | Tooltip not hoverable (`pointer-events-none`) -- WCAG 1.4.13 partial fail |
| G9 | GlossaryTooltip | No dismiss delay for motor-impaired users |

---

## 5. Recommended Fixes (Priority Order)

### Priority 1: WCAG AA compliance

1. **GlossaryTooltip WCAG 1.4.13 fix** -- Remove `pointer-events-none` from tooltip, add Escape key handler, add a small dismiss delay (~300ms).
2. **Add `prefers-reduced-motion` media query** -- Wrap `.fade-in-section` transitions and `animate-pulse` in a reduced-motion guard.
3. **Fix CiteThisFigure `aria-expanded`** -- Unify the open/closed states into a single render with `aria-expanded={isOpen}` on the toggle button and conditional visibility on the panel.

### Priority 2: Enhanced accessibility

4. **Add `aria-live="assertive"` region** for CiteThisFigure copy confirmation.
5. **Add Escape key handler** to CiteThisFigure to close the citation panel.
6. **Add `aria-pressed`** or `role="tab"` pattern to APA/BibTeX format toggle.

### Priority 3: Citation format refinement

7. **Adjust APA citation** to strict 7th edition: `Lee, S. (R.). (2025). Title. ... Retrieved DATE, from URL.`
8. **Adjust BibTeX** to use `organization` instead of `institution`, or switch to `@online` entry type for biblatex.

---

## 6. Positive Findings

The codebase demonstrates strong baseline accessibility:

- **100% CiteThisFigure coverage** -- Every one of 459 ChartContainer instances automatically includes CiteThisFigure. No manual opt-in needed.
- **100% figure ID coverage** -- All 459 ChartContainer instances pass an `id` prop, enabling stable anchor links for citations.
- **Proper semantic HTML** -- `<figure>`, `<figcaption>`, `<h3>`, `aria-labelledby`, `aria-describedby` throughout.
- **Skip-to-content link** present globally in root layout.
- **Noscript fallbacks** in ChartContainer for non-JS environments.
- **PWCompanySelector** implements a full ARIA combobox pattern with keyboard navigation (the gold standard among the interactive components).
- **GlossaryTooltip** correctly uses `role="tooltip"`, `aria-describedby`, and `tabIndex={0}` for keyboard focus.
- **Dark mode** is well-supported with separate CSS custom properties and explicit dark-mode overrides for chart text.
- **Mobile touch targets** are enforced at 44px minimum for chart legends.
- **Screen reader live region** exists in ChartContainer for interactive status announcements.
