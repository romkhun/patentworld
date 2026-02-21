# Cite This Figure Audit

**Date:** 2026-02-21
**Source:** Consolidated from cite-accessibility-audit.md (Sections 1 and 5) and audit-report.md (Section 3.10)

---

## Summary

| Metric | Value |
|--------|-------|
| Total ChartContainer instances | 459 |
| Chapter ChartContainer instances | 458 |
| Homepage ChartContainer instance | 1 |
| Instances receiving CiteThisFigure | **459 (100%)** |
| Instances with `id` prop | **459 (100%)** |
| Instances missing CiteThisFigure | **0** |

---

## Design: Automatic Coverage

CiteThisFigure is **embedded directly inside ChartContainer** at line 116 of `src/components/charts/ChartContainer.tsx`:

```tsx
<CiteThisFigure title={title} figureId={id} />
```

This means CiteThisFigure is not opt-in. Every visualization that uses ChartContainer (which is every visualization on the site) automatically receives a citation widget. No chapter author can accidentally omit it.

- **Component file:** `src/components/charts/CiteThisFigure.tsx`
- **Integration point:** `src/components/charts/ChartContainer.tsx` (line 116)

---

## Coverage Breakdown

| Scope | Count |
|-------|-------|
| Chapter pages using ChartContainer | 35 (all chapter pages) |
| Homepage (`HomeContent.tsx`) | 1 instance (`fig-homepage-patent-volume`) |
| Total ChartContainer instances | 459 |
| HERO_STATS.visualizations (declared count) | 458 (chapter visualizations only) |

The 459 total exceeds the declared 458 by 1 because the homepage hero chart is not counted in the chapter visualization tally.

---

## Citation Fields Verification

| Field | Value | Status |
|-------|-------|--------|
| Author | `Lee, Saerom (Ronnie)` | Correct |
| Year | `2025` | Correct (hardcoded; will need update in future) |
| Title | Dynamic from ChartContainer `title` prop | Correct |
| Container title | `PatentWorld: 50 Years of US Patent Data` | Correct |
| Institution | `The Wharton School, University of Pennsylvania` | Correct |
| URL | `window.location.origin + pathname + #figureId` | Correct (stable anchor) |
| Accessed date | Dynamic via `new Date().toLocaleDateString()` | Correct |
| Data source | `USPTO via PatentsView` | Correct |

---

## Format Verification

### APA Format

Generated output:
```
Lee, Saerom (Ronnie). 2025. "Title." In PatentWorld: 50 Years of US Patent Data.
The Wharton School, University of Pennsylvania. URL. Accessed DATE.
Data source: United States Patent and Trademark Office (USPTO) via PatentsView.
```

All required fields are present and populated correctly. Minor stylistic deviations from strict APA 7th edition noted (year placement, "Accessed" vs. "Retrieved...from") but all substantive content is correct.

### BibTeX Format

Generated output:
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

All required fields present. The `institution` field is non-standard for `@misc` but is silently ignored by most BibTeX processors. Key is auto-generated from slug for uniqueness.

---

## Accessibility

Post-fix state (audit-report.md Phase 2B, item A-6/CITE-3):

| Feature | Status |
|---------|--------|
| `aria-expanded` toggle | Present |
| `aria-live="polite"` for copy feedback | Added |
| Escape key handler to close panel | Added |
| Keyboard navigable (Tab to open/close) | Yes |

---

## Status: PASS -- 459/459 = 100% coverage
