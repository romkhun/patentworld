# Glossary Tooltip Accessibility Audit

**Date:** 2026-02-21
**Source:** Consolidated from cite-accessibility-audit.md (Section 3) and glossary-error-states-audit.md (Sections 1 and 3)

---

## Summary

| Metric | Value |
|--------|-------|
| Component file | `src/components/chapter/GlossaryTooltip.tsx` |
| Glossary data file | `src/lib/glossary.ts` |
| Total glossary terms defined | 42 (31 original + 11 added in Phase 2B) |
| Chapters using GlossaryTooltip | 22 of 35 |
| WCAG 1.4.13 compliance | PASS (after fixes) |

---

## Fixes Applied

Four accessibility fixes were applied during Phase 2B (audit-report.md, item A-5):

| # | Issue | Fix | WCAG Criterion |
|---|-------|-----|----------------|
| 1 | No keyboard focus trigger | Added `onFocus` and `onBlur` handlers to show/hide tooltip on Tab focus | 2.1.1 Keyboard (A) |
| 2 | No Escape key dismissal | Added `onKeyDown` handler that closes tooltip on Escape press | 1.4.13 Content on Hover or Focus (AA) |
| 3 | Instant dismiss on mouse leave | Added 200ms `setTimeout` delay before hiding tooltip, preventing accidental dismiss for users with motor impairments | 1.4.13 Content on Hover or Focus (AA) |
| 4 | Tooltip not hoverable | Removed `pointer-events-none` from tooltip element, allowing users to move their cursor into the tooltip to read long definitions | 1.4.13 Content on Hover or Focus (AA) |

---

## Implementation Details

The GlossaryTooltip component renders:

```tsx
<span className="group relative inline">
  <span
    role="term"
    tabIndex={0}
    aria-describedby={tooltipId}
    onFocus={handleShow}
    onBlur={handleHide}
    onKeyDown={handleKeyDown}
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

Key ARIA attributes:
- `role="term"` on the trigger span (semantically appropriate for glossary terms)
- `role="tooltip"` on the definition span
- `aria-describedby={tooltipId}` linking trigger to definition
- `tabIndex={0}` for keyboard focusability

---

## WCAG 2.1 Compliance

| WCAG Criterion | Status | Notes |
|---------------|--------|-------|
| 1.3.1 Info and Relationships (A) | PASS | `role="term"` + `aria-describedby` + `role="tooltip"` |
| 1.4.13 Content on Hover or Focus (AA) | PASS | Tooltip is hoverable, dismissable via Escape, and has dismiss delay |
| 2.1.1 Keyboard (A) | PASS | Tooltip appears on Tab focus via `onFocus` handler |
| 2.1.2 No Keyboard Trap (A) | PASS | Users can Tab away freely |
| 4.1.2 Name, Role, Value (A) | PASS | Proper ARIA roles and relationships |

---

## Glossary Term Count

42 terms are defined in `src/lib/glossary.ts`:

| Category | Terms |
|----------|-------|
| Patent system | CPC, forward citations, grant lag, assignee, utility patent, design patent, patent thicket, prior art, claim count, continuation patent, inter partes review, patent portfolio, terminal disclaimer |
| Quality metrics | HHI, originality, generality, blockbuster rate, dud rate, citation half-life, Shannon entropy |
| Legal/Policy | Bayh-Dole Act, AIA, Alice decision, PatentsView, WIPO |
| NLP/ML | topic modeling, TF-IDF, NMF, UMAP, Jensen-Shannon divergence, cosine similarity, k-means clustering |
| Visualization | radar chart, chord diagram, Sankey diagram |
| Classification | Y02, green patents, WIPO technology fields, CPC section, CPC class, CPC subclass |
| Organizational | talent flow |

---

## Remaining Gap

| Issue | Severity | Detail |
|-------|----------|--------|
| Hover-only on touch devices | Low | No explicit tap handler exists, but `tabIndex={0}` causes most mobile browsers to trigger focus on tap, which activates `group-focus-within:opacity-100`. Behavior depends on browser focus heuristics. Works in practice on iOS Safari and Chrome Android. |
| Tooltip positioning overflow | Low | Tooltip uses `bottom-full` (above the term) with centering. For terms near the top or edges of the viewport, the tooltip may overflow off-screen. No collision detection is implemented. |

---

## Status: PASS (with minor touch-device caveat)
