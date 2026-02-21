# Causal Language Audit Report -- Section 1.9.1

**Date:** 2026-02-21
**Scope:** All chapter pages (`src/app/chapters/*/page.tsx`), homepage (`src/app/page.tsx`, `src/app/HomeContent.tsx`), About, FAQ, Methodology, and the chapter constants file (`src/lib/constants.ts`).
**Auditor:** Automated (Claude Opus 4.6)

---

## Summary of Findings

| Category          | Count |
|-------------------|-------|
| DIRECT_CAUSAL     | 28    |
| QUASI_CAUSAL      | 150+  |
| NORMATIVE         | 5     |

The overwhelming pattern: "reflecting" is used pervasively (100+ instances) as a quasi-causal connector. Most usages are benign hedges ("reflecting the capital-intensive nature of...") that function as observational interpretations. A smaller set of findings involve genuinely causal language ("led to," "caused," "enabled," "triggered," "opened the field to") that requires attention.

---

## PRIORITY 1: Known Issues (from Audit Plan)

### Finding 1: 3D Printing -- "opened the field to broad-based competition"

**File:** `/home/saerom/projects/patentworld/src/lib/constants.ts`
**Line:** 179
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
description: 'Top-four-firm concentration in 3D printing patents declined from 36% in 2005 to 11% by 2024, as the expiration of key FDM patents in 2009 opened the field to broad-based competition.'
```
**Also appears in:**
- `/home/saerom/projects/patentworld/src/lib/seo.ts` line 133 (shortened variant: "FDM patent expirations opened the field")

**Issue:** Asserts that patent expiration *caused* broad-based competition. This is a plausible hypothesis but the descriptive data alone cannot establish this causal link.
**Suggested replacement:**
```
description: 'Top-four-firm concentration in 3D printing patents declined from 36% in 2005 to 11% by 2024. The decline coincided with the expiration of key FDM patents in 2009 and a subsequent increase in new entrants.'
```

---

### Finding 2: Biotechnology -- "reflecting successive waves from recombinant DNA to CRISPR-Cas9"

**File:** `/home/saerom/projects/patentworld/src/lib/constants.ts`
**Line:** 207
**Classification:** QUASI_CAUSAL
**Exact text:**
```
description: 'Biotechnology achieved the lowest top-four concentration among all advanced technology domains studied, declining from 13.5% in 2007 to 4.6% by 2025. Subfield diversity tripled from 0.32 in 1976 to 0.94 by 2025, reflecting successive waves from recombinant DNA to CRISPR-Cas9.'
```
**Also appears in:** `/home/saerom/projects/patentworld/src/app/chapters/biotechnology/page.tsx` line 951
**Issue:** "Reflecting successive waves" implies that the diversity increase was *driven by* specific technology breakthroughs. This is interpretive.
**Suggested replacement:**
```
'...to 0.94 by 2025, a pattern consistent with the sequential emergence of new biotechnology subfields from recombinant DNA to CRISPR-Cas9.'
```

---

### Finding 3: Cybersecurity -- "reflecting broad-based entry across the field"

**File:** `/home/saerom/projects/patentworld/src/lib/constants.ts`
**Line:** 221
**Classification:** QUASI_CAUSAL
**Exact text:**
```
description: 'Cybersecurity top-four concentration declined from 32.4% in 1980 to 9.4% by 2025, reflecting broad-based entry across the field.'
```
**Also appears in:** `/home/saerom/projects/patentworld/src/app/chapters/cybersecurity/page.tsx` line 891
**Issue:** "Reflecting broad-based entry" is observational but lacks hedging. The decline in concentration is *consistent with* broad-based entry but could also reflect reclassification or incumbent fragmentation.
**Suggested replacement:**
```
'...to 9.4% by 2025, consistent with broad-based entry across the security field.'
```

---

### Finding 4: Quantum Computing -- "reflecting high hardware IP barriers"

**File:** `/home/saerom/projects/patentworld/src/lib/constants.ts`
**Line:** 242
**Classification:** QUASI_CAUSAL
**Exact text:**
```
description: '...It is the only domain where early entrants (1990s cohort) patent faster than later entrants, reflecting high hardware IP barriers.'
```
**Also appears in:** `/home/saerom/projects/patentworld/src/app/chapters/quantum-computing/page.tsx` line 897
**Issue:** "Reflecting high hardware IP barriers" posits a causal explanation (barriers *cause* the velocity pattern) without evidence.
**Suggested replacement:**
```
'...patent faster than later entrants, a pattern consistent with high hardware IP barriers to entry.'
```

---

### Finding 5: Space Technology -- "reflecting the transition from government-dominated to commercial-driven innovation"

**File:** `/home/saerom/projects/patentworld/src/lib/constants.ts`
**Line:** 256
**Classification:** QUASI_CAUSAL
**Exact text:**
```
description: 'Space technology top-four concentration fluctuated between 4.9% and 36.7%, reflecting the transition from government-dominated to commercial-driven innovation.'
```
**Also appears in multiple lines in:** `/home/saerom/projects/patentworld/src/app/chapters/space-technology/page.tsx` (lines 823, 825, 887, 902, 454)
**Issue:** Asserts the concentration pattern is explained by the government-to-commercial transition.
**Suggested replacement:**
```
'...between 4.9% and 36.7%, coinciding with the sector's transition from government-dominated to commercially driven patenting activity.'
```

---

### Finding 6: Inventor Mechanics "Event-Study Evidence" -- Causal Overreach

**File:** `/home/saerom/projects/patentworld/src/app/chapters/mech-inventors/page.tsx`

**6a.** Line 553-554
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
controls for secular trends and life-cycle effects, revealing how the disruption of
changing organizational context affects citation impact.
```
**Issue:** "Revealing how ... affects" is causal language. The event-study design controls for some confounders but does not establish causation without articulating identification assumptions (e.g., parallel trends, no selection on mobility timing).
**Suggested replacement:**
```
'controls for secular trends and life-cycle effects, estimating how citation impact changes around the timing of organizational transitions. The estimates are associative: they assume that the timing of moves is not systematically correlated with unobserved shocks to inventor productivity.'
```

**6b.** Line 599
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
title="Moves to Higher-Quality Firms Produce Larger Post-Move Citation Gains"
```
**Issue:** "Produce larger gains" asserts a causal mechanism (the move *produces* the gains).
**Suggested replacement:**
```
title="Moves to Higher-Quality Firms Are Associated With Larger Post-Move Citation Gains"
```

**6c.** Line 600
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
caption="...suggesting that organizational context shapes inventor productivity."
```
**Issue:** "Shapes" is causal. Already hedged with "suggesting," but the claim is still directional.
**Suggested replacement:**
```
caption="...consistent with the hypothesis that organizational context is associated with inventor productivity differences."
```

**6d.** Line 601
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
insight="...indicating that organizational resources and peer quality amplify individual inventor productivity."
```
**Issue:** "Amplify" is causal; "indicating" strengthens the causal claim.
**Suggested replacement:**
```
insight="...consistent with the hypothesis that organizational resources and peer quality are positively associated with individual inventor productivity."
```

---

### Finding 7: Assignee Composition -- "de facto global standard"

**File:** `/home/saerom/projects/patentworld/src/app/chapters/org-composition/page.tsx`

**7a.** Line 122
**Classification:** NORMATIVE
**Exact text:**
```
The US patent system has become the de facto global standard for protecting high-value inventions regardless of assignee nationality.
```

**7b.** Line 201
**Classification:** NORMATIVE
**Exact text:**
```
insight="The shift to a foreign-majority patent system reflects the globalization of R&D. The US patent system functions as the de facto global standard for protecting high-value inventions regardless of assignee nationality."
```

**7c.** Line 221
**Classification:** NORMATIVE
**Exact text:**
```
system has become the de facto global standard for protecting high-value inventions.
```

**Issue:** "De facto global standard" is a normative/evaluative claim, not a descriptive one. The US system is the largest single-country patent system, but other systems (EPO, JPO, CNIPA) are also major. The claim lacks a citation.
**Suggested replacement (all three instances):**
```
'The US patent system is the largest single-country destination for international patent filings, attracting applicants from over 100 countries.'
```

---

## PRIORITY 2: Additional DIRECT_CAUSAL Findings

### Finding 8: System Patent Law -- Research Summary Causal Language

These are summaries of published research papers. Causal language here is *attributing claims to the cited authors*, which is acceptable when the paper's identification strategy supports the claim. These should be reviewed to confirm they accurately represent the papers' conclusions.

**8a.** Line 71
**Exact text:** `'patent invalidation leads to a 50% increase in follow-on citations... driven by invalidation... triggering more innovation'`
**Classification:** DIRECT_CAUSAL (attributed to Galasso & Schankerman 2015, QJE -- uses RCT-like design; acceptable)

**8b.** Line 207
**Exact text:** `'the ruling led to a general increase in innovation by reducing distortions caused by patent litigation'`
**Classification:** DIRECT_CAUSAL (attributed to Mezzanotti 2021, Management Science -- uses natural experiment; acceptable)

**8c.** Line 258
**Exact text:** `'NPE litigation causes real harm to innovation at targeted firms'`
**Classification:** DIRECT_CAUSAL (attributed to Cohen, Gurun, & Kominers 2019; acceptable if paper's identification supports it)

**8d.** Line 289
**Exact text:** `'Celera's short-term IP on gene sequences led to 20-30% reductions in subsequent scientific research'`
**Classification:** DIRECT_CAUSAL (attributed to Williams 2013, JPE -- uses quasi-experimental design; acceptable)

**8e.** Line 301
**Exact text:** `'This holding led to a substantial increase in Section 101 rejections and invalidations'`
**Classification:** DIRECT_CAUSAL (this is the chapter's own prose describing Alice Corp., not attributed to a paper)
**Suggested replacement:**
```
'This holding was followed by a substantial increase in Section 101 rejections and invalidations, particularly for software patents.'
```

**8f.** Line 325
**Exact text:** `'Patent litigation negatively affects R&D investment.'`
**Classification:** DIRECT_CAUSAL (attributed to Mezzanotti 2021; acceptable)

**8g.** Line 539
**Exact text:** `'This holding may have contributed to a moderation in software-related patenting'`
**Classification:** QUASI_CAUSAL (already hedged with "may have contributed to"; acceptable)

---

### Finding 9: Biotechnology -- "enabled" / "prompted"

**File:** `/home/saerom/projects/patentworld/src/app/chapters/biotechnology/page.tsx`

**9a.** Line 341
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
following the Bayh-Dole Act which enabled universities to patent inventions arising from federally
```
**Issue:** "Enabled" describes a legal mechanism (the Act *did* permit universities to patent). This is a factual claim about the law's text, not a causal claim about outcomes. **Acceptable -- no change needed.**

**9b.** Line 420
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
enabled more precise genomic alterations.
```
**Issue:** Describes a technology capability, not an economic causal claim. **Acceptable -- no change needed.**

**9c.** Line 853
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
has prompted international calls for moratoriums and regulatory frameworks
```
**Issue:** "Prompted" implies the gene-editing capability caused the calls for moratoriums. This is widely documented and factual. **Acceptable -- no change needed.**

---

### Finding 10: System Public Investment -- "leads to" / "enable"

**File:** `/home/saerom/projects/patentworld/src/app/chapters/system-public-investment/page.tsx`

**Line:** 131
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
insight="Federal agencies such as NIH/HHS, the DoD, and DOE fund research that leads to thousands of patents, often representing foundational technologies that enable subsequent waves of commercial innovation."
```
**Issue:** "Leads to" and "enable subsequent waves" are causal claims not supported by descriptive patent count data alone. The narrative text at lines 142-147 already uses better language ("results in," "are often associated with").
**Suggested replacement:**
```
insight="Federal agencies such as NIH/HHS, the DoD, and DOE fund research associated with thousands of patents, many representing foundational technologies cited by subsequent commercial innovations."
```

---

### Finding 11: System Patent Law -- "enabling"

**File:** `/home/saerom/projects/patentworld/src/app/chapters/system-patent-law/page.tsx`

**Line:** 461
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
The Bayh-Dole Act (1980) transformed university patenting, enabling academic institutions to retain patent rights from federally funded research.
```
**Issue:** "Enabling" here describes a legal mechanism (the Act's text). **Acceptable -- no change needed.**

---

### Finding 12: Page.tsx FAQ -- "propelled by"

**File:** `/home/saerom/projects/patentworld/src/app/page.tsx`

**12a.** Line 56
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
reflecting the digital transformation. Together they account for 57% of recent grants, propelled by software, semiconductors, and telecommunications innovations.
```

**12b.** Line 96
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
AI patent grants grew 5.7-fold from 5,201 in 2012 to 29,624 in 2023, propelled by advances in deep learning.
```

**Issue:** "Propelled by" is causal -- it asserts that specific technology domains *drove* patent growth.
**Suggested replacements:**
```
# 12a:
'...Together they account for 57% of recent grants, concentrated in software, semiconductors, and telecommunications innovations.'

# 12b:
'...to 29,624 in 2023, coinciding with advances in deep learning.'
```

---

### Finding 13: About page -- "coincided with" / "intensified further with the emergence of"

**File:** `/home/saerom/projects/patentworld/src/app/about/page.tsx`

**Line:** 53
**Classification:** QUASI_CAUSAL
**Exact text:**
```
The acceleration coincided with breakthroughs in deep neural networks around 2012 and intensified further with the emergence of generative AI technologies after 2020.
```
**Issue:** "Coincided with" is acceptable hedging. "Intensified further with the emergence of" is borderline -- it does not assert causation but suggests it through temporal association. **Acceptable with minor tightening.**
**Suggested replacement:**
```
'The acceleration coincided with breakthroughs in deep neural networks around 2012 and intensified after 2020, a period that also saw the emergence of generative AI technologies.'
```

---

### Finding 14: 3D Printing chapter -- "opened the technology to widespread adoption"

**File:** `/home/saerom/projects/patentworld/src/app/chapters/3d-printing/page.tsx`

**Line:** 313
**Classification:** DIRECT_CAUSAL
**Exact text:**
```
caption="...The sharp acceleration after 2009 coincides with the expiration of Stratasys's foundational FDM patent, which opened the technology to widespread adoption and new entrants."
```
**Issue:** "Which opened the technology to" is causal. The coincidence is noted, but the relative clause makes it an assertion.
**Suggested replacement:**
```
'The sharp acceleration after 2009 coincides with the expiration of Stratasys's foundational FDM patent; the subsequent period saw widespread adoption and new entrants.'
```

**Line:** 278 (executive summary)
**Exact text:** `...the desktop 3D printing expansion triggered by FDM patent expirations`
**Classification:** DIRECT_CAUSAL
**Suggested replacement:** `...the desktop 3D printing expansion that coincided with FDM patent expirations`

**Line:** 284
**Exact text:** `whose patent landscape reveals how foundational patent expirations can democratize an entire field`
**Classification:** DIRECT_CAUSAL
**Suggested replacement:** `whose patent landscape illustrates the association between foundational patent expirations and increased entry`

---

## PRIORITY 3: Pervasive "reflecting" Usage (QUASI_CAUSAL)

The word "reflecting" appears in approximately 150+ instances across all chapter pages. The pattern takes a standard form:

```
"[Metric X changed], reflecting [interpretive explanation Y]."
```

**Examples across files (sample of 20):**

| # | File (abbreviated) | Line | Exact phrase | Verdict |
|---|---|---|---|---|
| 1 | space-technology | 306 | "Reflecting the Commercialization of the Space Industry" | Hedged; acceptable |
| 2 | space-technology | 519 | "Reflecting Its Leadership in Both Government and Commercial Space Programs" | Hedged; acceptable |
| 3 | ai-patents | 326 | "Reflecting Deep Learning Advances" | Borderline -- implies causation |
| 4 | ai-patents | 832 | "Reflecting Democratization" | Borderline -- "democratization" is interpretive |
| 5 | cybersecurity | 826 | "Reflecting the Sector's Expansion" | Hedged; acceptable |
| 6 | blockchain | 379 | "Reflecting Its Niche but Volatile Status" | Hedged; acceptable |
| 7 | org-patent-portfolio | 182 | "reflecting diversified portfolio strategies" | Acceptable |
| 8 | semiconductors | 859 | "Reflecting the Golden Age of East Asian Fab Investment" | Interpretive; suggest "Coinciding with" |
| 9 | inv-team-size | 194 | "reflecting the increasing complexity and interdisciplinarity" | Causal interpretation |
| 10 | geo-domestic | 405 | "Reflecting Higher Downstream Impact" | Interpretive but supported by data |
| 11 | system-patent-quality | 736 | "Reflecting Globalization of Innovation" | Interpretive |
| 12 | system-patent-fields | 354 | "reflecting growth in consumer electronics, automotive design, and fashion-related filings" | Acceptable |
| 13 | digital-health | 319 | "Coinciding With the HITECH Act and COVID-19 Pandemic" | Already uses "coinciding" -- good |
| 14 | green-innovation | 343 | "reflecting substantial corporate and government investment" | Interpretive |
| 15 | inv-serial-new | 615 | "reflecting cumulative, path-dependent innovation trajectories" | Interpretive |
| 16 | org-composition | 115 | "reflecting the globalization of R&D" | Interpretive |
| 17 | quantum-computing | 311 | "Reflecting the Field's Transition to Engineering" | Interpretive |
| 18 | biotechnology | 781 | "Reflecting the Multidisciplinary Demands of Life Sciences" | Interpretive |
| 19 | agricultural-technology | 270 | "reflecting the capital-intensive nature of agricultural R&D" | Acceptable |
| 20 | system-patent-count | 329 | "reflects both genuine strategic adoption and the phased availability" | Acceptable |

**Recommendation for "reflecting" usage:**
Most instances are acceptable as hedged interpretive language. For title strings that use "reflecting" (which appear in chart titles and are more prominent), consider a systematic replacement with "consistent with" or "coinciding with" where the claim is not directly supported by the data presented. The highest-priority cases for review are instances where "reflecting" appears in a `title=` prop (chart titles are higher-visibility than caption text).

---

## PRIORITY 4: "Coinciding with" Usage (QUASI_CAUSAL)

"Coinciding with" is used approximately 30 times. This is generally appropriate hedging language for temporal associations. However, it can imply a causal relationship when used repeatedly in conjunction with the same pattern (event X -> patent trend Y).

**Highest-priority instances:**

| File | Line | Text | Issue |
|---|---|---|---|
| autonomous-vehicles | 312-313 | "coinciding with Google's self-driving project gaining visibility and traditional automakers responding with their own AV R&D programs" | Acceptable |
| cybersecurity | 311-312 | "coinciding with Data Breaches, Ransomware, and Regulatory Compliance" (in title) | Title implies stronger link than body text |
| ai-patents | 327 | "coinciding with advances in deep learning frameworks and GPU computing" | Acceptable |
| space-technology | 887 | "coinciding with the commercial space investment boom" | Acceptable |

**Recommendation:** "Coinciding with" is acceptable. No changes needed.

---

## PRIORITY 5: "Following" Usage (QUASI_CAUSAL)

"Following" appears in ~25 instances. When used to describe temporal sequence ("following the Bayh-Dole Act"), it can imply a post-hoc-ergo-propter-hoc relationship.

**Highest-priority instances:**

| File | Line | Text | Issue |
|---|---|---|---|
| biotechnology | 264 | "following the Bayh-Dole Act (1980)" | Acceptable temporal reference |
| cybersecurity | 267 | "following major security incidents" | Acceptable temporal reference |
| agricultural-technology | 312 | "Following GM Crop Adoption and the Precision Agriculture Expansion" (title) | Implies causation in title |
| green-innovation | 873 | "following major policy announcements" (in falsifiable statement) | Context-appropriate |
| system-patent-law | 697 | "coinciding with the GATT patent term change" | Already uses "coinciding" |

**Recommendation:** Generally acceptable. The agricultural-technology title (line 312) could be tightened:
**Current:** `"Agricultural Patent Filings Reflect Steady Growth With Accelerations Following GM Crop Adoption..."`
**Suggested:** `"Agricultural Patent Filings Show Steady Growth With Accelerations Coinciding With GM Crop Adoption..."`

---

## PRIORITY 6: NORMATIVE Language

### Finding N1: "should" in Advisory Context

Several instances of "should" appear in data caveats ("should be interpreted with caution," "should not be directly compared"). These are methodological advisories, not normative claims. **Acceptable -- no changes needed.**

### Finding N2: "de facto global standard" (covered in Finding 7 above)

### Finding N3: "must" in Descriptive Context

Instances like "examiners who must possess expertise" and "must be interpreted" are descriptive or methodological. **Acceptable -- no changes needed.**

---

## Comprehensive Action Items

### Must Fix (8 items)

1. **constants.ts:179** -- 3D Printing "opened the field to" (DIRECT_CAUSAL)
2. **seo.ts:133** -- 3D Printing "opened the field" (DIRECT_CAUSAL)
3. **org-composition/page.tsx:122, 201, 221** -- "de facto global standard" x3 (NORMATIVE)
4. **mech-inventors/page.tsx:553-554** -- "revealing how ... affects" (DIRECT_CAUSAL)
5. **mech-inventors/page.tsx:599** -- "Produce Larger Gains" title (DIRECT_CAUSAL)
6. **mech-inventors/page.tsx:600-601** -- "shapes," "amplify" (DIRECT_CAUSAL)
7. **system-public-investment/page.tsx:131** -- "leads to," "enable" (DIRECT_CAUSAL)
8. **page.tsx:56, 96** -- "propelled by" x2 (DIRECT_CAUSAL)

### Should Fix (6 items)

9. **constants.ts:207** -- Biotechnology "reflecting successive waves" (QUASI_CAUSAL)
10. **constants.ts:221** -- Cybersecurity "reflecting broad-based entry" (QUASI_CAUSAL)
11. **constants.ts:242** -- Quantum "reflecting high hardware IP barriers" (QUASI_CAUSAL)
12. **constants.ts:256** -- Space "reflecting the transition" (QUASI_CAUSAL)
13. **system-patent-law/page.tsx:301** -- Alice "led to" (DIRECT_CAUSAL, chapter prose)
14. **3d-printing/page.tsx:278, 284, 313** -- "triggered by," "opened," "can democratize" (DIRECT_CAUSAL)

### Consider Reviewing (systematic)

15. ~150 instances of "reflecting" across all chapters -- review chart *titles* specifically (higher visibility)
16. Research paper summaries in system-patent-law -- verify causal language matches paper's identification strategy
17. "Coinciding with" in chart titles (lower priority)
18. About page line 53 -- "intensified further with the emergence of" (QUASI_CAUSAL)

---

## Notes on Scope Exclusions

- **Research paper summaries** (system-patent-law/page.tsx): Causal language in summaries of peer-reviewed papers that use credible identification strategies (RCTs, natural experiments, regression discontinuity) is acceptable as *attributed* causal claims. These are flagged for completeness but do not require rewording unless the summary overstates the paper's findings.
- **Legal mechanism descriptions** ("the Bayh-Dole Act enabled universities to patent"): These describe what the law *permits*, not an empirical causal effect. No changes needed.
- **Technology capability descriptions** ("CRISPR enabled more precise genomic alterations"): These describe technical capabilities, not economic causal claims. No changes needed.
