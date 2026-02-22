# PatentWorld v7 Audit -- Terminology Consistency

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** Terminology consistency across all source files
**Baseline:** `audit/terminology-consistency.md` (v6, 10 terminology concepts audited)

---

## Method

All `.tsx` and `.ts` source files under `src/` were searched for variant terminology for key concepts. Occurrence counts were tallied and patterns assessed for consistency.

## Key Findings

### 1. "patent grants" -- CONSISTENT
- **Dominant term:** "patent grants" (108 occurrences across 30+ files).
- **Variants:** "granted patents" (9, used in grammatically appropriate passive contexts), "issued patents" (2, in literature review summaries).
- **Assessment:** No remediation needed. Dominant term is used consistently.

### 2. "assignee" / "organization" -- CONTEXTUALLY APPROPRIATE
- **"assignee"** (326 occurrences): Used as technical/legal term when referring to the patent record field.
- **"organization"** (519): Generic term in chapter prose.
- **"firm"** (557): Dominant in economics-oriented chapters (mech-organizations, system-convergence).
- **"company"** (345): Dominant in org-company-profiles and UI components.
- **Assessment:** All four terms are used extensively. The usage follows defensible conventions: "assignee" for patent records, "organization" for generic reference, "firm" for economic analysis, "company" for profile pages. No critical inconsistencies found.

### 3. "forward citations" -- STANDARDIZED
- **Dominant term:** "forward citations" (191 occurrences).
- **Variants:** "citations received" (13), "citation count" (21).
- **Assessment:** "Forward citations" is the standardized term used in all primary analytical contexts. Variants appear in natural-language descriptions where they are grammatically appropriate.

### 4. Additional Terminology

| Concept | Dominant Term | Consistent? |
|---------|--------------|-------------|
| Patent issuance | "patent grants" | YES |
| Named inventor | "inventor" (931) vs "patentee" (4) | YES |
| CPC taxonomy | "CPC section" | YES |
| Filing process | "patent filing" | YES |
| Technology grouping | "technology domain" | MOSTLY (some variation) |
| Deep Dive format | "Deep Dive" (unhyphenated) | YES |
| Market power | "concentration" | YES |

## Conclusion

No critical terminology inconsistencies found. "Patent grants" is used consistently as the primary term for patent issuance. "Assignee" and "organization" are used contextually (legal vs. prose) in a defensible pattern. "Forward citations" is standardized as the primary citation impact term.

---

Status: COMPLETE
