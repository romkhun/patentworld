# PatentWorld v7 Audit -- Checkpoint: Act 3

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Phase:** 1 (Per-Element Verification)
**Scope:** Act 3 -- "The Inventors" (5 chapters)

---

## Chapters Covered

| Ch# | Slug | Title |
|-----|------|-------|
| 13 | inv-top-inventors | Prolific Inventors |
| 14 | inv-generalist-specialist | Generalists & Specialists |
| 15 | inv-serial-new | Serial & New Inventors |
| 16 | inv-gender | Gender in Patenting |
| 17 | inv-team-size | Team Size |

## Verification Results

- **Figures verified:** All ChartContainers have valid, unique `id` props.
- **Card-to-chapter crosscheck:** All numbers verified. Key values: Female 2.8% to 14.9% (exact), Team size 1.7 to 3.2 (exact), 6,709 most prolific inventor (exact).
- **KeyFindings:** 5/5 present.
- **InsightRecap:** 5/5 present.
- **DataNote:** Present in all 5 chapters.
- **CompetingExplanations:** Present in inv-gender chapter (gender gap explanations).
- **Cross-chapter links:** All outgoing links resolve.
- **Typography:** Em-dash corrections applied.

## Key Finding

- **H2 (HIGH, FIXED):** Gender citation comparison in `constants.ts:134` lacked confounder disclosure. Raw team-gender citation differences (14.2 / 12.6 / 9.5) appeared in homepage card and JSON-LD without noting field-composition confounding. FIXED -- added confounder disclosure and measurement limitation note.

## Status: COMPLETE

Phase 1 Act 3 (5 chapters) complete. Gender confounder disclosure added (H2). All data verified.
