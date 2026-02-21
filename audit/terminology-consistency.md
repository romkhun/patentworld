# PatentWorld Terminology Consistency Audit

**Audit reference:** Section 1.9.5
**Date:** 2026-02-21
**Scope:** All source files under `src/` (35 chapter pages, components, lib modules; `.next/` build artifacts excluded)

---

## Summary

| # | Concept | Variants found | Dominant term | Severity |
|---|---------|---------------|---------------|----------|
| 1 | Patent issuance | 3 | "patent grants" | LOW |
| 2 | Rights-holding entity | 4 | "organization" / "firm" | HIGH |
| 3 | Named inventor | 2 | "inventor" | LOW |
| 4 | Citation impact metric | 3 | "forward citations" | MEDIUM |
| 5 | CPC taxonomy level | 3 | "CPC section" | MEDIUM |
| 6 | Filing vs application | 2 | "patent filing" | LOW |
| 7 | Patent type qualifier | 2 | "utility patent" (explicit) | LOW |
| 8 | Market power concept | 3 | "concentration" | MEDIUM |
| 9 | Technology grouping | 4 | "technology domain" | HIGH |
| 10 | Hyphenation of "deep dive" | 2 | "Deep Dive" (unhyphenated) | LOW |

**Overall assessment:** Two HIGH-severity inconsistencies (entity terminology and technology grouping terms) affect reader comprehension across many chapters. Six MEDIUM/LOW issues are localized or follow defensible conventions.

---

## Detailed Findings

### 1. "patent grants" vs "granted patents" vs "issued patents"

| Variant | Total occurrences | Chapters using it |
|---------|:-:|---|
| **patent grants** | 108 | system-patent-count (5), system-patent-fields (5), system-patent-law (6), org-patent-count (9), org-composition (17), org-patent-portfolio (2), inv-team-size (2), inv-top-inventors (1), inv-serial-new (1), geo-domestic (8), geo-international (2), all 12 deep-dive chapters (2 each), system-public-investment (1), HomeContent (2), methodology (1), seo.ts (5), constants.ts (4) |
| granted patent(s) | 9 | system-patent-law (3), methodology (3), inv-team-size (1) |
| issued patent(s) | 2 | system-patent-law (2) |

**Assessment:** LOW. "Patent grants" is the overwhelmingly dominant form (108 vs 9 vs 2). The 9 uses of "granted patents" appear in natural-language contexts where the passive voice is grammatically appropriate (e.g., "all USPTO-granted patents," "recently granted patents have had less time"). The 2 "issued patents" uses are in literature review summaries in system-patent-law quoting external research. No remediation needed.

---

### 2. "assignee" vs "organization" vs "firm" vs "company"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| **assignee(s)** | 326 | All deep-dive chapters (27-40 each), org-composition (38), org-patent-quality (21), system-convergence (15), inv-team-size (15), system-patent-fields (13), methodology (17), types.ts (18), glossary.ts (4) |
| **organization(s)** | 519 | org-patent-count (42), all deep-dive chapters (27-37 each), mech-inventors (32), mech-organizations (22), org-patent-quality (15), system-convergence (11), org-company-profiles (11), methodology (18), types.ts (19), constants.ts (12) |
| **firm(s)** | 557 | mech-organizations (46), system-convergence (21), org-patent-quality (20), mech-inventors (17), org-company-profiles (8), org-patent-portfolio (6), org-composition (6), DescriptiveGapNote (5), seo.ts (4), methodology (3) |
| **company/companies** | 345 | org-company-profiles (112), org-patent-portfolio (41), org-patent-quality (31), orgNames.ts (28), PWCompanySelector (22), mech-organizations (17), agricultural-technology (17), types.ts (19), biotechnology (14), autonomous-vehicles (11) |

**Assessment:** HIGH. All four terms are used extensively and interchangeably across the site.

**Patterns observed:**
- "Assignee" is used as the technical/legal term, especially in data methodology contexts and when referring to the PatentsView field directly. This is appropriate and should be retained where it refers to the patent record holder.
- "Organization" is the generic term used in chapter prose when discussing entities without implying corporate status. Most common in org-* and deep-dive chapters.
- "Firm" dominates in the economics-oriented chapters (mech-organizations at 46 uses, system-convergence at 21, org-patent-quality at 20) and appears in analytical contexts like "within-firm" and "between-firm" decompositions.
- "Company" dominates in org-company-profiles (112 uses) and org-patent-portfolio (41), plus all component names (PWCompanySelector, etc.).

**Recommendation:** Standardize on "organization" as the default term in chapter prose. Reserve "assignee" for contexts explicitly referencing the patent record field. Reserve "firm" for established economic phrases (e.g., "within-firm convergence"). Reserve "company" for the company-profiles chapter and UI component labels. Document this convention in a style guide.

---

### 3. "inventor" vs "patentee"

| Variant | Total occurrences | Chapters using it |
|---------|:-:|---|
| **inventor(s)** | 931 | All 35 chapters, all inventor-focused chapters (inv-serial-new: 133, inv-top-inventors: 124, mech-inventors: 108, inv-team-size: 61, inv-generalist-specialist: 52, inv-gender: 43), methodology (31), seo.ts (19), constants.ts (18), deep-dive chapters (14-19 each), etc. |
| patentee(s) | 4 | system-convergence (3), system-patent-law (1) |

**Assessment:** LOW. "Inventor" is used 233x more frequently than "patentee." The 4 "patentee" uses are in system-convergence in the specific context of shift-share decomposition ("population of patentees"), where the term correctly distinguishes the broader population of patent holders (including organizations) from individual inventors. The single use in system-patent-law is similar. No remediation needed; these are semantically distinct terms used correctly.

---

### 4. "forward citations" vs "citations received" vs "citation count"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| **forward citation(s)** | 191 | org-patent-quality (25), system-patent-quality (22), chapterMeasurementConfig (12), system-patent-fields (11), geo-international (11), org-company-profiles (10), inv-top-inventors (10), geo-domestic (10), inv-team-size (9), inv-generalist-specialist (8), all deep-dive chapters (1-2 each), methodology (5), glossary (3) |
| citations received | 13 | system-patent-quality (2), system-patent-fields (2), mech-organizations (2), inv-gender (1), inv-team-size (1), biotechnology (1), blockchain (1), autonomous-vehicles (1), org-patent-count (1), PWChordDiagram (1) |
| citation count(s) | 21 | system-patent-quality (7), methodology (3), system-patent-fields (2), mech-organizations (2), inv-generalist-specialist (2), inv-serial-new (1), inv-gender (1), chapterMeasurementConfig (1), PWLineChart (1) |

**Assessment:** MEDIUM. "Forward citations" is the clear primary term (191 occurrences), but "citations received" (13) and "citation count" (21) appear as synonyms in scattered chapters.

**Patterns observed:**
- "Forward citations" is the established technical term used in the glossary definition and measurement config.
- "Citations received" appears mostly in chart captions and subtitles as a more reader-friendly alternative (e.g., "forward citations received within 5 years").
- "Citation count" appears in system-patent-quality (7 uses) and methodology, often in compound phrases like "5-year forward citation count."

**Recommendation:** Standardize on "forward citations" in all analytical prose. "Citation count" is acceptable as a compound noun when preceded by a qualifier (e.g., "5-year forward citation count"). Avoid standalone "citations received" as a synonym.

---

### 5. "CPC section" vs "CPC class" vs "technology field"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| **CPC section(s)** | 232 | system-patent-fields (58), system-convergence (18), system-patent-quality (9), system-language (9), methodology (9), all deep-dive chapters (2-9 each), inv-team-size (8), system-public-investment (8), org-company-profiles (7), chapterMeasurementConfig (6), inv-generalist-specialist (5) |
| CPC class(es) | 47 | system-patent-fields (9), semiconductors (4), blockchain (4), system-language (3), various deep-dive chapters (1-2 each), methodology (1), glossary (1) |
| technology field(s) | 63 | system-patent-fields (10), inv-team-size (8), system-public-investment (7), system-patent-quality (4), system-convergence (4), glossary (4), methodology (4), inv-generalist-specialist (4), org-patent-portfolio (3), inv-serial-new (3), inv-gender (3), geo-international (3) |

**Assessment:** MEDIUM. These terms refer to different levels of the CPC hierarchy, but the distinction is not always maintained consistently.

**Patterns observed:**
- "CPC section" correctly refers to the top-level letter codes (A-H, Y) and is used consistently in system-patent-fields and system-convergence.
- "CPC class" refers to lower-level subgroups within sections and is used less frequently, mostly in deep-dive chapters referencing specific CPC codes for domain definitions.
- "Technology field" is a more general term, often referring to WIPO's 35-field classification rather than CPC hierarchy levels. The glossary defines "WIPO technology fields" explicitly.

**Recommendation:** These three terms are not true synonyms -- they refer to different classification levels. Add a brief note in the glossary clarifying: CPC section = top-level letter (8 sections), CPC class = 3-digit subgroup, technology field = WIPO 35-field classification. Audit uses of "technology field" to ensure they reference WIPO fields and not CPC sections.

---

### 6. "patent application" vs "patent filing"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| patent application(s) | 16 | system-patent-law (7), system-patent-count (2), methodology (1), glossary (1), org-composition (1), org-company-profiles (1), inv-gender (1), geo-international (1), ai-patents (1) |
| **patent filing(s)** | 80 | geo-international (6), cybersecurity (6), system-patent-law (5), semiconductors (5), green-innovation (5), blockchain (5), space-technology (4), quantum-computing (4), digital-health (4), autonomous-vehicles (4), ai-patents (4), agricultural-technology (4), org-patent-count (3), biotechnology (3), 3d-printing (3), system-patent-count (2), seo.ts (2), mech-inventors (2), constants.ts (1), glossary (1), methodology (1), and others |

**Assessment:** LOW. "Patent filing" is the dominant form (80 vs 16). "Patent application" appears almost exclusively in system-patent-law (7 of 16 uses), where the legal distinction between an application (the document submitted to USPTO) and a filing (the act of submitting) is meaningful. This appears to be intentional rather than inconsistent.

**Recommendation:** No action needed. The current usage pattern is defensible: "patent filing" for the general act, "patent application" when referencing the legal document or formal process.

---

### 7. "utility patent" vs unqualified "patent"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| **utility patent(s)** | 155 | geo-domestic (14), system-patent-quality (10), system-patent-fields (9), org-patent-count (8), semiconductors (8), digital-health (8), all deep-dive chapters (6-8 each), system-patent-count (6), methodology (3), glossary (2), seo.ts (2), org-composition (4), inv-top-inventors (4), org-company-profiles (2) |
| unqualified "patent" | (thousands) | Every file |

**Assessment:** LOW. "Utility patent" is used in two consistent patterns: (a) data scope disclaimers specifying that analysis covers "utility patents only" and (b) comparative contexts distinguishing utility from design/plant/reissue patents. The unqualified "patent" is used everywhere else, which is correct since most chapters analyze utility patents exclusively after the initial scope statement. The methodology page establishes this convention explicitly.

**Recommendation:** No action needed. The current pattern (explicit "utility patent" for scope statements, unqualified "patent" thereafter) is clear and consistent.

---

### 8. "concentration" vs "market share" vs "dominance"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| **concentration** | 311 | geo-domestic (35), system-patent-fields (19), ai-patents (18), org-patent-count (17), cybersecurity (16), quantum-computing (15), inv-top-inventors (14), semiconductors (13), digital-health (13), autonomous-vehicles (12), space-technology (11), blockchain (11), constants.ts (10), biotechnology (10), agricultural-technology (10), 3d-printing (10), methodology (8), org-composition (8), inv-serial-new (7), green-innovation (6), seo.ts (6), system-public-investment (5) |
| dominance | 55 | space-technology (5), digital-health (5), ai-patents (5), agricultural-technology (5), semiconductors (4), 3d-printing (4), org-patent-count (3), cybersecurity (3), autonomous-vehicles (3), quantum-computing (2), org-composition (2), blockchain (2), and 13 other files (1 each) |
| market share | 3 | org-composition (2), methodology (1) |

**Assessment:** MEDIUM. "Concentration" is the dominant term (311 uses) and is the correct technical term for HHI-based analysis. "Dominance" (55 uses) appears mostly in deep-dive chapters as a more descriptive/narrative synonym. "Market share" is nearly absent (3 uses), appearing only in org-composition chart titles and the methodology HHI definition.

**Patterns observed:**
- "Concentration" is used in analytical contexts (HHI, CR4, CR10, geographic concentration).
- "Dominance" is used narratively to describe competitive positions (e.g., "IBM's dominance," "organizational dominance").
- "Market share" appears only in the law-firm analysis within org-composition.

**Recommendation:** The distinction between "concentration" (structural measure) and "dominance" (descriptive narrative) is defensible. However, consider auditing whether "dominance" is sometimes used where "concentration" would be more precise. The 3 "market share" uses in org-composition should be reviewed -- patent share is not technically "market share."

---

### 9. "technology domain" vs "technology area" vs "technology field" vs "technology class"

| Variant | Total occurrences | Primary chapters |
|---------|:-:|---|
| **technology domain(s)** | 142 | blockchain (15), autonomous-vehicles (9), system-patent-quality (7), system-patent-fields (7), system-convergence (7), biotechnology (7), system-language (6), org-company-profiles (6), green-innovation (6), ai-patents (6), constants.ts (5), semiconductors (5), org-patent-portfolio (5), cybersecurity (5), agricultural-technology (5), 3d-printing (5), quantum-computing (4), mech-organizations (4), DescriptiveGapNote (3), org-patent-quality (3), inv-serial-new (3) |
| technology area(s) | 65 | system-patent-fields (19), mech-geography (7), mech-organizations (5), green-innovation (3), blockchain (3), methodology (2), page.tsx/home (2), inv-gender (2), and 16 other files (1 each) |
| technology field(s) | 63 | system-patent-fields (10), inv-team-size (8), system-public-investment (7), system-patent-quality (4), system-convergence (4), glossary (4), methodology (4), inv-generalist-specialist (4), org-patent-portfolio (3), inv-serial-new (3), inv-gender (3), geo-international (3) |
| technology class(es) | 38 | system-patent-fields (14), glossary (3), constants.ts (3), methodology (2), inv-team-size (2), inv-gender (2), geo-international (2), geo-domestic (2), and 5 other files (1 each) |

**Assessment:** HIGH. All four terms are used interchangeably across the site, sometimes even within the same chapter. system-patent-fields alone uses all four variants (19 "area" + 14 "class" + 10 "field" + 7 "domain" = 50 mixed uses).

**Chapters using 3+ variants:**
- system-patent-fields: all 4 variants
- inv-team-size: domain (1), area (0), field (8), class (2)
- system-convergence: domain (7), area (0), field (4), class (0)
- inv-gender: area (2), field (3), class (2)
- methodology: domain (1), area (2), field (4), class (2)

**Recommendation:** This is the most significant terminology inconsistency in the project. Standardize as follows:
- **"technology domain"** -- for the 12 ACT 6 deep-dive subject areas (AI, biotech, semiconductors, etc.). Already dominant in deep-dive chapters and constants.ts.
- **"technology field"** -- for WIPO's 35-field classification. Already defined in the glossary as "WIPO technology fields."
- **"technology class"** -- for CPC-level groupings (sections, classes, subclasses).
- **Retire "technology area"** -- it adds no semantic value beyond the three terms above.

---

### 10. "deep dive" vs "deep-dive" (hyphenation)

| Variant | Context | Occurrences | Files |
|---------|---------|:-:|---|
| **Deep Dive(s)** (unhyphenated) | Section headings, labels, prose | ~55 | All 12 deep-dive chapters (3 each: comment + SectionDivider label + code comment), deep-dive-overview (2), mech-geography (3), constants.ts (2), methodology (1), seo.ts (1), colors.ts (1), types.ts (1), mech-inventors (1), ai-patents (1) |
| deep-dive (hyphenated) | Adjectival modifier before noun | ~7 (prose) | methodology (3: "deep-dive chapters"), types.ts (1: "deep-dive chapters"), deep-dive-overview (1: "deep-dive chapters") |
| deep-dive-overview | URL/path slug | ~15 | layout.tsx, sitemap.ts, all chapter cross-links |

**Assessment:** LOW. The pattern is actually consistent and correct:
- "Deep Dive" / "Deep Dives" (unhyphenated, capitalized) is used as a proper noun for the ACT 6 section title and section divider labels.
- "deep-dive" (hyphenated, lowercase) is used as an adjectival modifier before nouns (e.g., "deep-dive chapters"), following standard English hyphenation rules.
- "deep-dive-overview" is a URL slug, not prose.

**Recommendation:** No action needed. The current hyphenation pattern follows standard English conventions (compound adjective before noun is hyphenated; standalone noun/title is not).

---

## Priority Remediation Plan

### P0 -- Must fix (HIGH severity)

1. **Technology grouping terms (Pattern 9):** Adopt a three-tier vocabulary: "technology domain" (ACT 6 subjects), "technology field" (WIPO 35), "technology class" (CPC hierarchy). Retire "technology area." Estimated scope: ~65 substitutions across system-patent-fields, mech-geography, mech-organizations, and scattered chapters.

2. **Entity terminology (Pattern 2):** Document the four-term convention: "assignee" (patent record), "organization" (default prose), "firm" (economic analysis), "company" (company-profiles chapter and UI). Audit for misuses. Estimated scope: style guide addition + targeted review of ~50 ambiguous uses.

### P1 -- Should fix (MEDIUM severity)

3. **Citation terminology (Pattern 4):** Standardize on "forward citations" in analytical prose. Replace standalone "citations received" with "forward citations received" or just "forward citations." Estimated scope: ~13 substitutions.

4. **CPC taxonomy clarity (Pattern 5):** Add glossary disambiguation note. Audit ~10 ambiguous "technology field" uses that may actually mean CPC section.

5. **Market share vs concentration (Pattern 8):** Review 3 "market share" uses in org-composition; consider replacing with "patent share." Review ~10 "dominance" uses that may be more precisely expressed as "concentration."

### P2 -- Optional (LOW severity)

6. Patterns 1, 3, 6, 7, 10: No changes needed. Current usage is consistent or follows defensible conventions.

---

*Generated by PatentWorld audit tooling, 2026-02-21.*
