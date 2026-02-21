# Language Audit: Causal Language, Informal Language, and Acronym Definitions

Generated: 2026-02-21
Scope: All `page.tsx` files under `src/app/chapters/`, `src/app/`, including about, faq, methodology, explore, and home pages.

---

## 1.9.1 -- Causal and Quasi-Causal Language

### A. Direct Causal Connectors

Each entry lists file, line, quoted text, and assessment.

#### "led to"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `system-patent-law/page.tsx` | 207 | "the ruling **led to** a general increase in innovation by reducing distortions caused by patent litigation" | ACCEPTABLE -- cites Bessen & Meurer empirical study using eBay as natural experiment; causal methodology present. |
| 2 | `system-patent-law/page.tsx` | 289 | "Celera's short-term IP on gene sequences **led to** 20-30% reductions in subsequent scientific research" | ACCEPTABLE -- cites Williams (2013) using Celera's sequencing IP as natural experiment. |
| 3 | `system-patent-law/page.tsx` | 301 | "This holding **led to** a substantial increase in 101 rejections and invalidations" | ACCEPTABLE -- describing a documented legal outcome (Alice Corp. decision); factual claim about post-decision rejection rates. |

#### "caused"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `system-patent-law/page.tsx` | 207 | "reducing distortions **caused** by patent litigation" | ACCEPTABLE -- embedded within a research summary citing empirical study. |

#### "due to"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `inv-team-size/page.tsx` | 299 | "Recent years are truncated **due to** citation lag" | ACCEPTABLE -- technical/methodological note, not a causal claim. |
| 2 | `inv-team-size/page.tsx` | 610 | "If team size causally increases patent quality rather than reflecting project selection, then exogenous team expansions (for example, **due to** firm mergers) should produce citation gains" | ACCEPTABLE -- falsifiability statement, explicitly conditional. |
| 3 | `blockchain/page.tsx` | 923 | "**Due to** the narrow range of CPC codes" | ACCEPTABLE -- methodological note about classification structure. |
| 4 | `cybersecurity/page.tsx` | 860 | "**due to** the specialized expertise required for security research" | FLAG -- asserts a reason without formal evidence. Recommend: "consistent with the specialized expertise..." |
| 5 | `system-convergence/page.tsx` | 402 | "at different absolute levels **due to** differences in classification granularity" | ACCEPTABLE -- methodological note about CPC vs IPC. |
| 6 | `system-patent-count/page.tsx` | 276 | "incomplete data **due to** pending applications" | ACCEPTABLE -- methodological note. |
| 7 | `inv-gender/page.tsx` | 378 | "Recent years are truncated **due to** citation lag" | ACCEPTABLE -- methodological note. |

#### "driven by"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `blockchain/page.tsx` | 301 | "patent filings in emerging technologies are **driven by** genuine technical progress" | FLAG -- causal claim without supporting methodology. Recommend: "are associated with" or "coincide with". |
| 2 | `org-patent-count/page.tsx` | 469 | "If organizational concentration is **driven by** genuine R&D scale advantages rather than strategic filing" | ACCEPTABLE -- falsifiability statement, explicitly conditional. |
| 3 | `system-patent-law/page.tsx` | 71 | "**driven by** invalidation of patents owned by large patentees triggering more innovation by small firms" | ACCEPTABLE -- summarizing Galasso & Schankerman's causal study using random judge assignment. |
| 4 | `system-convergence/page.tsx` | 437 | "If convergence is **driven by** genuine interdisciplinarity rather than CPC reclassification artifacts" | ACCEPTABLE -- falsifiability statement. |
| 5 | `inv-gender/page.tsx` | 602 | "If the gender citation gap is **driven by** field composition" | ACCEPTABLE -- falsifiability statement. |
| 6 | `green-innovation/page.tsx` | 873 | "If green patent growth is **driven by** policy incentives (IRA, EU Green Deal) rather than technology push" | ACCEPTABLE -- falsifiability statement. |

#### "enabled"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `biotechnology/page.tsx` | 264 | "the Bayh-Dole Act (1980) which **enabled** universities to patent federally funded inventions" | ACCEPTABLE -- factual description of statutory effect. |
| 2 | `biotechnology/page.tsx` | 275 | "Bayh-Dole Act of 1980 **enabled** a substantial expansion of university-originated patents" | ACCEPTABLE -- factual. The act literally enabled this activity. |
| 3 | `biotechnology/page.tsx` | 341 | "the Bayh-Dole Act which **enabled** universities to patent inventions arising from federally funded..." | ACCEPTABLE -- same as above. |
| 4 | `biotechnology/page.tsx` | 420 | "**enabled** more precise genomic alterations" | ACCEPTABLE -- describing technical capability of CRISPR. |
| 5 | `org-composition/page.tsx` | 153 | "The Bayh-Dole Act (1980) **enabled** university patenting" | ACCEPTABLE -- factual. |
| 6 | `org-composition/page.tsx` | 180 | "Bayh-Dole Act of 1980 **enabled** universities and small businesses to patent" | ACCEPTABLE -- factual. |
| 7 | `3d-printing/page.tsx` | 814 | "FDM patent expirations **enabled** widespread entry" | FLAG -- implies a causal mechanism without formal evidence. Recommend: "coincided with widespread entry" or "were followed by widespread entry". |
| 8 | `digital-health/page.tsx` | 374 | "AI and robotic technologies have **enabled** more sophisticated clinical interventions" | FLAG -- quasi-causal claim about technology capability without supporting evidence. Recommend: "are associated with" or "have facilitated". |

#### "contributed to"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `system-patent-law/page.tsx` | 539 | "This holding may have **contributed to** a moderation in software-related patenting" | ACCEPTABLE -- uses hedging language ("may have"). |

#### "prompted"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `biotechnology/page.tsx` | 853 | "has **prompted** international calls for moratoriums" | ACCEPTABLE -- factual description of regulatory responses to CRISPR. |

#### "triggered"

No instances found in narrative text.

#### "gave rise to" / "brought about" / "fostered" / "spurred" / "fueled" / "because of"

No instances found.

---

### B. Soft-Causal Connectors

#### "reflecting"

This is the most pervasive soft-causal connector in the project. There are **200+ instances** across all chapter pages. "Reflecting" is used as a standard interpretive connector to link observed data patterns to plausible explanations.

**Systemic pattern:** Nearly every chart caption and insight string uses "reflecting" to connect a data observation to an interpretation. Examples:

| # | File | Line | Quoted Text | Severity |
|---|------|------|-------------|----------|
| 1 | `page.tsx` | 56 | "**reflecting** the digital transformation" | LOW -- broad contextual claim. |
| 2 | `faq/page.tsx` | 60 | "**reflecting** increasingly globalized R&D" | LOW -- broad contextual claim. |
| 3 | `biotechnology/page.tsx` | 266 | "**reflecting** the distinct institutional structure of life sciences innovation" | LOW -- descriptive. |
| 4 | `biotechnology/page.tsx` | 781 | "**Reflecting** the Multidisciplinary Demands of Life Sciences" | LOW -- in chart title. |
| 5 | `space-technology/page.tsx` (16 instances) | various | "**reflecting** the commercialization...", "**reflecting** the importance of..." | LOW -- descriptive pattern. |
| 6 | `cybersecurity/page.tsx` (14 instances) | various | "**reflecting** the resource-intensive nature...", "**reflecting** the domain's sustained high barriers..." | MEDIUM -- some imply causal mechanism (e.g., barriers "cause" concentration). |
| 7 | `system-patent-law/page.tsx` | 363 | "**reflecting** the ongoing policy debate" | LOW -- factual description. |
| 8 | `semiconductors/page.tsx` (15 instances) | various | "**reflecting** the capital-intensive nature...", "**reflecting** the geographic migration..." | MEDIUM -- implies capital intensity causes concentration. |

**Recommendation:** "Reflecting" is used with reasonable restraint and appropriate hedging. However, the sheer frequency (200+ uses) creates a stylistic monotony and some instances blur the line between description and causal inference. Consider:
- Varying connectors: "consistent with," "coinciding with," "paralleling," "in line with"
- For the strongest implied causal claims, adding explicit hedging: "a pattern consistent with..." rather than "reflecting..."

#### "following"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `biotechnology/page.tsx` | 264 | "**following** the Bayh-Dole Act (1980)" | ACCEPTABLE -- temporal. |
| 2 | `biotechnology/page.tsx` | 323 | "**following** the Bayh-Dole Act (1980), the Human Genome Project completion (2003), and the CRISPR-Cas9 publication (2012)" | ACCEPTABLE -- temporal. |
| 3 | `cybersecurity/page.tsx` | 267 | "**following** major security incidents" | FLAG -- implies causal link between incidents and filing surges without formal analysis. Recommend: "observed after major security incidents". |
| 4 | `cybersecurity/page.tsx` | 298 | "Measurable increases in patenting activity have been observed **following** major security incidents" | ACCEPTABLE -- uses "observed following" which is appropriately hedged. |
| 5 | `cybersecurity/page.tsx` | 331 | "**following** the Snowden disclosures" | FLAG -- implies causation. Recommend: "after" or "subsequent to". |
| 6 | `digital-health/page.tsx` | 277 | "**following** the 2009 HITECH Act" | ACCEPTABLE -- temporal; describes a documented policy event. |
| 7 | `system-patent-fields/page.tsx` | 552 | "**Following** the Early-2000s Slowdown" | ACCEPTABLE -- temporal in chart title. |
| 8 | `system-patent-fields/page.tsx` | 589 | "declining **following** USPTO reforms" | ACCEPTABLE -- temporal. |
| 9 | `green-innovation/page.tsx` | 332 | "continued to grow **following** the 2015 Paris Agreement" | ACCEPTABLE -- temporal. |
| 10 | `green-innovation/page.tsx` | 873 | "patent filings should show discontinuous increases **following** major policy announcements" | ACCEPTABLE -- falsifiability statement. |
| 11 | `agricultural-technology/page.tsx` | 313 | "**following** the introduction of genetically modified crops in 1996" | ACCEPTABLE -- temporal. |
| 12 | `3d-printing/page.tsx` | 882 | "**following** the expiration of key FDM patents in 2009" | ACCEPTABLE -- temporal. |
| 13 | `quantum-computing/page.tsx` | 309 | "**following** milestones in qubit performance" | ACCEPTABLE -- temporal. |

#### "in response to"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `system-patent-quality/page.tsx` | 211 | "potentially **in response to** judicial guidance" | ACCEPTABLE -- hedged with "potentially". |
| 2 | `ai-patents/page.tsx` | 490 | "**in response to** advances in deep learning" | FLAG -- implies firms acted because of advances. Recommend: "coinciding with" or "following". |
| 3 | `system-patent-law/page.tsx` | 83 | "**in response to** the court's precedents" | ACCEPTABLE -- describing documented strategic behavior in empirical study. |
| 4 | `blockchain/page.tsx` | 501 | "**in response to** market conditions" | FLAG -- implies causal link without evidence. Recommend: "coinciding with market conditions". |
| 5 | `system-patent-fields/page.tsx` | 545 | "co-move **in response to** macroeconomic conditions" | FLAG -- quasi-causal. Recommend: "co-move with macroeconomic conditions". |

#### "with the emergence of"

| # | File | Line | Quoted Text | Assessment |
|---|------|------|-------------|------------|
| 1 | `about/page.tsx` | 53 | "intensified further **with the emergence of** generative AI technologies" | FLAG -- implies causal link between generative AI emergence and patent growth. Recommend: "coinciding with the emergence of". |

#### "opened the field to"

No instances found.

#### "in the wake of"

No instances found.

---

### Summary of Section 1.9.1 Findings

| Category | Count | Flagged | Acceptable |
|----------|-------|---------|------------|
| Direct causal ("led to", "caused", "resulted in") | 4 | 0 | 4 |
| "due to" | 7 | 1 | 6 |
| "driven by" | 6 | 1 | 5 |
| "enabled" | 8 | 2 | 6 |
| "contributed to" | 1 | 0 | 1 |
| "prompted" | 1 | 0 | 1 |
| "reflecting" | 200+ | ~20 (medium-severity) | ~180 |
| "following" | 13 | 2 | 11 |
| "in response to" | 5 | 3 | 2 |
| "with the emergence of" | 1 | 1 | 0 |
| **Total** | **~246** | **~30** | **~216** |

**Overall assessment:** The project generally handles causal language well. Direct causal claims are reserved for instances with empirical support (cited studies). The primary concern is (1) the overuse of "reflecting" as a universal connector (200+ instances), which sometimes crosses from description into implied causation, and (2) a handful of "driven by", "enabled", "in response to", and "due to" instances that assert causal mechanisms without supporting methodology.

---

## 1.9.2 -- Informal and Colloquial Language

### Terms Not Found (Clean)

The following terms were searched and **not found** in any page file:
- "a lot of"
- "pretty much"
- "kind of"
- "really big"
- "skyrocketed"
- "exploded"
- "game-changer"
- "interesting to note"
- "it is worth noting"
- "it turns out"
- "notable that"
- "remarkably"
- "importantly"
- "interestingly"
- "strikingly"
- "dramatically"

### Terms Found

#### "significantly"

| # | File | Line | Quoted Text | Recommended Revision |
|---|------|------|-------------|---------------------|
| 1 | `org-composition/page.tsx` | 359 | "The patent prosecution market has become **significantly** less concentrated" | Replace with "substantially" or provide a quantitative threshold (e.g., "HHI declined by X points"). |
| 2 | `inv-team-size/page.tsx` | 466 | "teams produce patents with **significantly** higher cohort-normalized citation impact" | ACCEPTABLE if statistical significance is meant (p-value context). Verify: appears in regression results context -- likely appropriate. |
| 3 | `org-patent-portfolio/page.tsx` | 305 | "patent portfolio shifts **significantly**" | Replace with "substantially" or specify the JSD threshold. |
| 4 | `agricultural-technology/page.tsx` | 872 | "the domain has become **significantly** more accessible" | Replace with "substantially" or "considerably". |
| 5 | `system-patent-law/page.tsx` | 59 | "Public research **significantly** influences industrial R&D" | ACCEPTABLE -- summarizing Cohen et al. (2002) empirical finding; likely refers to statistical significance. |
| 6 | `system-patent-law/page.tsx` | 111 | "prior experience... **significantly** reduces the cost" | ACCEPTABLE -- summarizing empirical study; statistical significance likely intended. |
| 7 | `system-patent-law/page.tsx` | 123 | "U.S. multinationals respond... by **significantly** increasing technology transfer" | ACCEPTABLE -- summarizing Branstetter et al. empirical finding. |
| 8 | `system-patent-law/page.tsx` | 175 | "applications were **significantly** more likely to be licensed" | ACCEPTABLE -- summarizing empirical study result. |
| 9 | `system-patent-law/page.tsx` | 195 | "hazard rate... increases **significantly** upon formal patent grant" | ACCEPTABLE -- summarizing empirical study with hazard model. |
| 10 | `system-patent-law/page.tsx` | 203 | "This holding **significantly** affected non-practicing entity litigation strategies" | Replace with "substantially" -- this is a descriptive narrative claim, not a statistical test. |
| 11 | `system-patent-law/page.tsx` | 215 | "NPE litigation **significantly** reduces innovation" | ACCEPTABLE -- summarizing Cohen et al. empirical finding. |
| 12 | `system-patent-law/page.tsx` | 231 | "raising examination intensity... **significantly** improves welfare" | ACCEPTABLE -- summarizing Frakes & Wasserman simulation results. |
| 13 | `system-patent-law/page.tsx` | 305 | "Improving screening... can **significantly** improve welfare" | ACCEPTABLE -- summarizing simulation study. |

**Summary:** 13 instances of "significantly." Of these, 9 occur within summaries of peer-reviewed empirical studies where statistical significance is the intended meaning (acceptable). 4 instances use "significantly" in descriptive narrative where it functions as an informal intensifier and should be replaced with "substantially" or a quantitative measure.

**Items requiring revision:**
1. `org-composition/page.tsx:359` -- "significantly" -> "substantially"
2. `org-patent-portfolio/page.tsx:305` -- "significantly" -> "substantially" or add quantitative threshold
3. `agricultural-technology/page.tsx:872` -- "significantly" -> "substantially"
4. `system-patent-law/page.tsx:203` -- "significantly" -> "substantially"

---

## 1.9.4 -- Acronym Audit

For each page that uses an acronym, this section checks whether the acronym is defined at first use **on that page**. Definitions via `<GlossaryTooltip>` components count as definitions.

### CPC (Cooperative Patent Classification)

**Definition locations:**
- `methodology/page.tsx:254` -- "The Cooperative Patent Classification (CPC) system..."
- `about/page.tsx:262` -- "Cooperative Patent Classification (CPC) technology categories"
- `deep-dive-overview/page.tsx:419` -- "CPC (Cooperative Patent Classification) codes"

**Pages using CPC without on-page definition:**

| Page | First CPC use (line) | Status |
|------|---------------------|--------|
| `page.tsx` (home) | 56 | UNDEFINED -- uses "CPC Section H" without expansion |
| `faq/page.tsx` | 48 | UNDEFINED -- uses "CPC section G" without expansion |
| `explore/page.tsx` | 72 | UNDEFINED -- label "CPC Classes" |
| `system-patent-count/page.tsx` | n/a | NOT USED (no CPC in narrative) |
| `system-patent-quality/page.tsx` | 110 | DEFINED via `<GlossaryTooltip term="CPC">CPC</GlossaryTooltip>` |
| `system-patent-fields/page.tsx` | 323 | UNDEFINED -- first narrative use: "CPC sections G (Physics) and H (Electricity)" |
| `system-convergence/page.tsx` | 108 | UNDEFINED; first glossary tooltip at line 191 |
| `system-patent-law/page.tsx` | 439 | Appears only in code/data context (variable names) and chart labels; first narrative at 715 -- UNDEFINED |
| `system-language/page.tsx` | 93 | Code context; first narrative at 366-367 -- UNDEFINED |
| `system-public-investment/page.tsx` | 166 | UNDEFINED in narrative |
| `org-composition/page.tsx` | 392 | UNDEFINED |
| `org-patent-count/page.tsx` | 353 | UNDEFINED |
| `org-patent-quality/page.tsx` | 196 | UNDEFINED |
| `org-patent-portfolio/page.tsx` | 130 | UNDEFINED |
| `org-company-profiles/page.tsx` | 335 | UNDEFINED |
| `inv-team-size/page.tsx` | 144 | UNDEFINED; glossary tooltip at 258 exists but not at first use |
| `inv-gender/page.tsx` | 256 | UNDEFINED |
| `inv-serial-new/page.tsx` | 490 | UNDEFINED |
| `inv-generalist-specialist/page.tsx` | 70 | UNDEFINED |
| `inv-top-inventors/page.tsx` | 374 | UNDEFINED |
| `mech-geography/page.tsx` | 172 | UNDEFINED |
| `mech-inventors/page.tsx` | n/a | NOT USED in narrative |
| `mech-organizations/page.tsx` | 206 | UNDEFINED |
| `geo-domestic/page.tsx` | 315 | UNDEFINED |
| `geo-international/page.tsx` | 218 | UNDEFINED |
| All 12 deep-dive chapter pages | various | UNDEFINED -- CPC used extensively in captions/subtitles without per-page definition |

**Recommendation:** CPC is so pervasive (appearing on 30+ pages) that per-page definition is impractical. Options:
1. Define CPC at first use on each page (labor-intensive but rigorous).
2. Add a persistent site-wide abbreviation glossary accessible from every page.
3. Use `<GlossaryTooltip term="CPC">` at first use on each page (some pages already do this -- make it universal).

### USPTO (United States Patent and Trademark Office)

**Definition locations:**
- `page.tsx:72` -- "United States Patent and Trademark Office (USPTO)"
- `about/page.tsx:256-257` -- "United States Patent and Trademark Office"
- `methodology/page.tsx:144,574` -- "United States Patent and Trademark Office (USPTO)"
- `system-patent-count/page.tsx:124` -- "United States Patent and Trademark Office"

**Pages using USPTO without on-page definition:**

| Page | Status |
|------|--------|
| `faq/page.tsx` | UNDEFINED -- uses "USPTO" at line 36 without expansion |
| `about/page.tsx` | DEFINED at line 256-257 |
| `explore/page.tsx` | NOT USED |
| `system-patent-law/page.tsx` | UNDEFINED -- first use at line 185 |
| `system-patent-fields/page.tsx` | UNDEFINED -- first use in insight/caption text |
| `system-patent-quality/page.tsx` | UNDEFINED -- used in captions |
| `org-patent-quality/page.tsx` | UNDEFINED -- used at line 479 |
| `geo-domestic/page.tsx` | UNDEFINED -- used at lines 461-463 |
| Multiple deep-dive chapters | UNDEFINED -- used in "PatentsView / USPTO" data source notes |

**Recommendation:** Same as CPC -- too widespread for per-page definition. Consider a standard footer note or glossary tooltip at first use per page.

### HHI (Herfindahl-Hirschman Index)

**Definition locations:**
- `about/page.tsx:129` -- "Herfindahl-Hirschman Index (HHI)"
- `methodology/page.tsx:460` -- "Herfindahl-Hirschman Index (HHI)"
- `system-patent-fields/page.tsx:491` -- "Herfindahl-Hirschman Index (HHI)"

**Pages using HHI without on-page definition:**

| Page | Status |
|------|--------|
| `system-patent-fields/page.tsx` | DEFINED at line 491 |
| `system-patent-quality/page.tsx` | UNDEFINED -- used at line 517 ("1 minus the HHI of backward citation CPC sections") |
| `ai-patents/page.tsx` | UNDEFINED -- used at lines 739-747 ("HHI" in chart labels) |

**Recommendation:** Add inline expansion at first use on `system-patent-quality/page.tsx` and `ai-patents/page.tsx`.

### AIA (America Invents Act)

**Definition locations:**
- `about/page.tsx:69` -- "The America Invents Act (AIA) of 2011"
- `system-patent-law/page.tsx:244` -- "America Invents Act (AIA)"

**Pages using AIA without on-page definition:**

| Page | Status |
|------|--------|
| `system-patent-law/page.tsx` | DEFINED at line 244 and via GlossaryTooltip at line 503 |

**Assessment:** CLEAN -- AIA is only used on pages where it is defined.

### PCT (Patent Cooperation Treaty)

**Definition locations:**
- `methodology/page.tsx:366` -- "filed via the Patent Cooperation Treaty and entering the US national phase"
- `org-composition/page.tsx:270` -- "the Patent Cooperation Treaty (PCT) route"
- `geo-international/page.tsx:515` -- "The Patent Cooperation Treaty (PCT) route"

**Pages using PCT without on-page definition:**

| Page | Status |
|------|--------|
| `org-composition/page.tsx` | DEFINED at line 270 |
| `geo-international/page.tsx` | DEFINED at line 515 |

**Assessment:** CLEAN.

### WIPO (World Intellectual Property Organization)

**Definition locations:**
- `methodology/page.tsx:289` -- "The World Intellectual Property Organization (WIPO)"
- `about/page.tsx:263` -- "WIPO technology field classifications"

**Pages using WIPO without on-page definition:**

| Page | Status |
|------|--------|
| `explore/page.tsx` | UNDEFINED -- label "WIPO Fields" at line 73 |
| `inv-gender/page.tsx` | UNDEFINED -- used at line 237 |
| `system-patent-fields/page.tsx` | UNDEFINED -- used extensively |
| `org-patent-portfolio/page.tsx` | UNDEFINED -- used at lines 376-395 |

**Recommendation:** Expand at first use on each page or add GlossaryTooltip.

### NLP (Natural Language Processing)

**Definition locations:**
- `methodology/page.tsx:331` -- "G06F40 (natural language processing)"

**Pages using NLP:**

| Page | Status |
|------|--------|
| `ai-patents/page.tsx` | Uses full phrase "natural language processing" (lines 282, 391, 418, 642, 679-682, 906) -- never abbreviated as "NLP" |

**Assessment:** CLEAN -- the acronym "NLP" is never used; the full phrase is always written out.

### NPE (Non-Practicing Entity)

**Definition locations:**
- `system-patent-law/page.tsx:203` -- "non-practicing entity litigation strategies"

**Pages using NPE:**

| Page | Status |
|------|--------|
| `system-patent-law/page.tsx` | Uses abbreviation "NPEs" at lines 215, 258, 321 -- first abbreviated use at line 215 without prior expansion as "NPE". The full phrase appears at line 203 but uses "non-practicing entity" without parenthetical abbreviation. |

**Recommendation:** At line 203, change to "non-practicing entity (NPE) litigation strategies" so that subsequent uses of "NPEs" are defined.

### FDM (Fused Deposition Modeling)

**Pages using FDM:**

| Page | Status |
|------|--------|
| `3d-printing/page.tsx` | UNDEFINED -- "FDM" used at lines 265, 274, 296, 308, 309, 329, 357, 481, 814, 882, 883 without ever expanding the acronym |

**Recommendation:** Expand first use to "fused deposition modeling (FDM)" at line 265 or 274.

### CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats)

**Pages using CRISPR:**

| Page | Status |
|------|--------|
| `biotechnology/page.tsx` | Used at lines 265, 276, 310, 323, 345, 419, 499, 846, 903, 904, 951, 952 -- always as "CRISPR-Cas9" or "CRISPR". Never expanded. |

**Assessment:** CRISPR is widely recognized as a standalone term in scientific discourse. However, for a general audience, consider adding a parenthetical at first use: "CRISPR-Cas9 (a gene-editing technology)" at line 265. The full expansion "Clustered Regularly Interspaced Short Palindromic Repeats" is arguably too technical and may be counterproductive.

### ADAS (Advanced Driver-Assistance Systems)

**Pages using ADAS:**

| Page | Status |
|------|--------|
| `autonomous-vehicles/page.tsx` | DEFINED at line 284: "advanced driver-assistance systems (ADAS)" |
| `deep-dive-overview/page.tsx` | UNDEFINED -- used at line 28 ("Autonomous Vehicles & ADAS") |
| `ai-patents/page.tsx` | UNDEFINED -- used at line 899 in link text |

**Recommendation:** Expand at first use on `deep-dive-overview/page.tsx`.

### EV (Electric Vehicle)

**Pages using EV:**

| Page | Status |
|------|--------|
| `green-innovation/page.tsx` | PARTIALLY DEFINED -- "electric vehicles" written out at lines 300, 321, 332, 367, 379, 409, 439, 499, 753, but "EV" abbreviation used at lines 377, 407, 408, 415, 819, 872 without formal expansion "(EV)" at first abbreviation use |

**Recommendation:** At line 300, change to "transportation and electric vehicles (EVs)" so that subsequent "EV" abbreviations are defined.

### NIH (National Institutes of Health)

**Pages using NIH:**

| Page | Status |
|------|--------|
| `system-public-investment/page.tsx` | PARTIALLY DEFINED -- "HHS/NIH" used at lines 79, 127, 131, 286, 352. Full expansion at line 143: "Department of Health and Human Services/National Institutes of Health." But first use at line 79 is before the definition. |
| `biotechnology/page.tsx` | UNDEFINED -- "NIH-funded" at lines 547, 579, 595. Full phrase "National Institutes of Health" at line 564 appears after first use of "NIH" at line 547. |

**Recommendation:** For `system-public-investment/page.tsx`, expand at line 79 or rearrange. For `biotechnology/page.tsx`, expand at line 547.

### HHS (Health and Human Services)

| Page | Status |
|------|--------|
| `system-public-investment/page.tsx` | Same issue as NIH above -- "HHS" used before expansion at line 79 vs. definition at line 143. |

### DOD (Department of Defense)

| Page | Status |
|------|--------|
| `system-public-investment/page.tsx` | "DoD" used at line 131 without prior expansion. Full phrase at line 128 ("Department of Defense") but "DoD" abbreviation not formally introduced. |

**Recommendation:** At line 128, add "(DoD)" after "Department of Defense".

### DOE (Department of Energy)

| Page | Status |
|------|--------|
| `system-public-investment/page.tsx` | "DOE" used at lines 330, 345. Full phrase "Department of Energy" used at lines 128, 168, 283, 318, 325, 327, 342, but "DOE" abbreviation not formally introduced with parenthetical. |

**Recommendation:** At line 128 or 168, add "(DOE)" after "Department of Energy".

### CAGR (Compound Annual Growth Rate)

**Not found** on any page. CLEAN.

---

## Acronym Audit Summary

| Acronym | Pages Using | Defined on All Pages? | Action Needed |
|---------|-------------|----------------------|---------------|
| CPC | 30+ pages | No -- defined on ~3 pages, used undefined on ~27 | Add GlossaryTooltip at first use per page |
| USPTO | 20+ pages | No -- defined on ~4 pages | Add GlossaryTooltip at first use per page |
| HHI | 3 pages | No -- undefined on 2 pages | Expand at first use on system-patent-quality, ai-patents |
| AIA | 1 page | Yes | CLEAN |
| PCT | 2 pages | Yes | CLEAN |
| WIPO | 4 pages | No -- undefined on 3 pages | Expand at first use |
| NLP | 0 pages (full form used) | N/A | CLEAN |
| NPE | 1 page | Partially | Add parenthetical at first full-form mention |
| FDM | 1 page | No | Expand at first use |
| CRISPR | 1 page | No (but widely recognized) | Consider brief parenthetical |
| ADAS | 3 pages | No -- undefined on 2 pages | Expand on deep-dive-overview, ai-patents |
| EV | 1 page | Partially | Add "(EV)" at first abbreviation use |
| NIH | 2 pages | No -- used before definition | Rearrange or expand at first use |
| HHS | 1 page | No -- used before definition | Rearrange or expand at first use |
| DOD | 1 page | Partially (abbreviation not introduced) | Add "(DoD)" at definition |
| DOE | 1 page | Partially (abbreviation not introduced) | Add "(DOE)" at definition |
| CAGR | 0 pages | N/A | CLEAN |

---

## Priority Action Items

### High Priority (causal claims without methodology)
1. `blockchain/page.tsx:301` -- "driven by genuine technical progress" -- revise to associational language
2. `3d-printing/page.tsx:814` -- "FDM patent expirations enabled widespread entry" -- revise to temporal
3. `cybersecurity/page.tsx:860` -- "due to the specialized expertise" -- revise to "consistent with"
4. `digital-health/page.tsx:374` -- "enabled more sophisticated clinical interventions" -- add hedging
5. `ai-patents/page.tsx:490` -- "in response to advances in deep learning" -- revise to "coinciding with"
6. `blockchain/page.tsx:501` -- "in response to market conditions" -- revise to "coinciding with"
7. `system-patent-fields/page.tsx:545` -- "in response to macroeconomic conditions" -- revise to "with"
8. `about/page.tsx:53` -- "with the emergence of generative AI" -- add "coinciding with"

### Medium Priority (informal language)
9. `org-composition/page.tsx:359` -- "significantly" -> "substantially"
10. `org-patent-portfolio/page.tsx:305` -- "significantly" -> "substantially"
11. `agricultural-technology/page.tsx:872` -- "significantly" -> "substantially"
12. `system-patent-law/page.tsx:203` -- "significantly" -> "substantially"

### Medium Priority (acronym definitions)
13. `3d-printing/page.tsx` -- Expand "FDM" at first use
14. `system-public-investment/page.tsx` -- Expand HHS, NIH, DoD, DOE at first abbreviated use
15. `system-patent-law/page.tsx:203` -- Add "(NPE)" at first full-form mention
16. `green-innovation/page.tsx` -- Add "(EV)" at first abbreviated use
17. `deep-dive-overview/page.tsx` -- Expand "ADAS" at first use

### Low Priority (systemic style issue)
18. Reduce overreliance on "reflecting" (~200 instances) by varying with "consistent with," "coinciding with," "paralleling"
19. Standardize CPC/USPTO/WIPO definitions across all chapter pages (GlossaryTooltip at first use)
