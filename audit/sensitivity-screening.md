# Sensitivity & Controversy Screening (Track D)

**Audit Section**: 1.8.5
**Date**: 2026-02-21
**Scope**: All chapter page.tsx files, HomeContent.tsx, page.tsx (homepage), About, Explore, FAQ, and Methodology pages
**Files Screened**: 41 page files + HomeContent.tsx

---

## Summary

| Category | Count |
|----------|-------|
| D1 -- GEOPOLITICAL | 7 |
| D2 -- GENDER_FRAMING | 10 |
| D3 -- NATIONAL_CHARACTERIZATION | 6 |
| D4 -- CAUSAL_POLICY | 11 |
| D5 -- LOADED_TERMINOLOGY | 5 |
| D6 -- METRIC_CONFLATION | 8 |
| **Total** | **47** |

---

## Findings

### D1 -- GEOPOLITICAL

| ID | Category | File | Line | Quoted Text | Concern | Recommended Revision |
|----|----------|------|------|-------------|---------|----------------------|
| D1-01 | GEOPOLITICAL | `src/app/chapters/geo-international/page.tsx` | 545 | "The contrast with Taiwan, which exhibits very low PCT usage reflecting its distinctive institutional circumstances, underscores how political and treaty-access factors shape international filing behavior." | The phrase "distinctive institutional circumstances" is a euphemism that obscures the core issue: Taiwan is not a PCT member because it is not recognized as a sovereign state by most UN member nations. The vague phrasing could confuse readers or appear evasive. | Replace with: "Taiwan, which is not a party to the Patent Cooperation Treaty, exhibits very low PCT usage -- a pattern shaped by its treaty-access status. This underscores how political and institutional factors shape international filing behavior." Add a footnote: "Taiwan is not a contracting state of the PCT, which limits its residents' direct access to the international filing route." |
| D1-02 | GEOPOLITICAL | `src/app/chapters/semiconductors/page.tsx` | 462 | "The ranking dynamics reveal a long-term shift in semiconductor patent leadership from US-based and Japanese firms toward Korean and Taiwanese organizations, reflecting the geographic migration of advanced manufacturing capacity." | Uses "Taiwanese" as a descriptor for organizations without noting the geopolitical sensitivity of Taiwan's status in the semiconductor supply chain. In isolation this is factual, but given the highly charged geopolitics of TSMC and the CHIPS Act, consider a brief note on geopolitical context. | LOW RISK. Acceptable as-is since it describes corporate entities, not sovereignty. No revision strictly needed. |
| D1-03 | GEOPOLITICAL | `src/app/chapters/semiconductors/page.tsx` | 531-532 | "The United States, Japan, South Korea, and Taiwan Account for the Majority of Semiconductor Patents" | Lists Taiwan alongside sovereign nations in a chart title. | LOW RISK. This is standard practice in patent and trade statistics. No revision needed, but consider using "economy" rather than implying statehood if a future editorial pass occurs. |
| D1-04 | GEOPOLITICAL | `src/app/chapters/mech-inventors/page.tsx` | 696 | "The Taiwan-China corridor (16,917 bidirectional moves) further underscores the interconnected nature of East Asian innovation networks." | Describes Taiwan-China inventor mobility without noting the political sensitivity of cross-strait relations. | LOW RISK. Factual description of patent data. No revision strictly needed. |
| D1-05 | GEOPOLITICAL | `src/app/chapters/cybersecurity/page.tsx` | 514-516 | "The United States Dominates Cybersecurity Patenting, With Significant Contributions From Japan, China, India, and Israel" / "Israel's strong presence relative to its size underscores its recognized specialization in defensive and offensive cyber capabilities." | Characterizes Israel's "offensive cyber capabilities" in a context that could appear politically charged given ongoing conflicts. | Consider softening to: "Israel's strong presence relative to its size reflects its well-documented specialization in cybersecurity research and development." Remove "offensive" characterization. |
| D1-06 | GEOPOLITICAL | `src/app/chapters/quantum-computing/page.tsx` | 535-556 | "...while the presence of Canada, Japan, China, and Israel reflects the global nature of quantum research investment." / "Israel" mentioned as a country with quantum strengths. | Israel appears as one country among many. | NO ACTION. Factual, neutral listing. |
| D1-07 | GEOPOLITICAL | `src/app/chapters/digital-health/page.tsx` | 515-516 | "The United States Leads in Digital Health Patents, With Israel, South Korea, and Japan as Notable Contributors" | Israel appears as one country among many. | NO ACTION. Factual, neutral listing. |

---

### D2 -- GENDER_FRAMING

| ID | Category | File | Line | Quoted Text | Concern | Recommended Revision |
|----|----------|------|------|-------------|---------|----------------------|
| D2-01 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 169 | "The female share of inventor instances has risen steadily from 2.8% in 1976 to 14.9% in 2025 (through September), but remains well below parity with substantial variation across technology fields." | "Well below parity" is evaluative framing. While factually accurate (14.9% vs. 50%), the phrase carries normative weight that could be seen as editorializing. | Consider: "...but at 14.9% remains far from proportional representation, with substantial variation across technology fields." The factual comparison to 50% should be made explicit rather than using "parity" as shorthand. |
| D2-02 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 181 | "...with Chemistry and Human Necessities leading and Mechanical Engineering lagging." | "Lagging" implies a normative judgment that Mechanical Engineering *should* have higher female representation, rather than describing the data. | Replace "lagging" with "at the lowest levels" or "exhibiting the lowest female shares." |
| D2-03 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 208 | "The persistent gender gap in patenting is consistent with broader structural differences in STEM participation, including educational pipelines, workplace composition, and institutional factors." | "Persistent gender gap" is framing language. The text does provide structural context, which is good, but the phrase may embed the assumption that the gap is primarily caused by structural barriers rather than also reflecting preference differences. | Consider adding: "...including educational pipelines, workplace composition, institutional factors, and potentially differential career preferences -- though the relative contribution of each factor remains debated in the literature." |
| D2-04 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 228 | "...the female share of inventors on US patents remains well below parity." | Repeated use of "well below parity." | Same revision as D2-01: replace with more precise language. |
| D2-05 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 285-286 | "Why is the gender gap in patenting so persistent?" / Explanations list: "Pipeline effects," "Institutional barriers," "Field composition," "Differences in access to resources..." | The CompetingExplanations component frames this well by presenting multiple explanations. However, all four explanations posit structural/institutional barriers; none mention individual-level preference or choice-based explanations that appear in the economics literature (e.g., Ceci & Williams 2011). | Add a fifth explanation: "Differential career preferences and risk tolerance across genders, though the extent to which these reflect free choice versus constrained choice remains debated (Ceci & Williams, 2011)." |
| D2-06 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 614-616 | "Accuracy of name-based gender inference varies by cultural and geographic context, with higher error rates for names common in East Asian, South Asian, and other non-Western naming traditions." | Gender inference error rate disclosure IS present. However, the disclosure does not quantify the error rate or cite validation studies. This is a known limitation that could disproportionately affect gender gap estimates for non-Western-origin inventors. | POSITIVE: Error rate disclosure exists. Consider adding: "Validation studies of name-based gender inference typically report 90-95% accuracy for Western names but substantially lower rates for East Asian and South Asian names (Lax Martinez, Raffo, & Saito, 2016). These errors may affect cross-country gender comparisons." |
| D2-07 | GENDER_FRAMING | `src/app/faq/page.tsx` | 55-56 | "What is the gender gap in US patenting?" / "...but a substantial gender gap persists." | FAQ uses "gender gap" framing without structural context provided in the chapter. | Add brief context: "...a substantial gender gap persists, reflecting differences in STEM educational pipelines, institutional factors, and field composition." |
| D2-08 | GENDER_FRAMING | `src/app/about/page.tsx` | 56 | "What is the gender gap in US patenting?" | Same FAQ item appears on About page. | Same revision as D2-07. |
| D2-09 | GENDER_FRAMING | `src/app/page.tsx` | 109 | "What is the gender gap in patenting?" | Homepage FAQ schema uses "gender gap" framing. | LOW RISK. FAQ question titles are acceptable as search-optimized phrasings. No revision needed. |
| D2-10 | GENDER_FRAMING | `src/app/chapters/inv-gender/page.tsx` | 171 | "All-male teams produce the highest average citation impact across the full study period (14.2 cumulative citations), followed by mixed-gender teams (12.6) and all-female teams (9.5)." | Presents raw citation differences by team gender composition without immediately noting that these differences are confounded by field composition (male-dominated fields like electronics have higher citations). The explanatory note at line 175 partially addresses this, and line 600 mentions "field composition and institutional factors." | Consider adding directly after the finding: "These differences are substantially confounded by field composition: male-dominated technology areas such as electronics and computing tend to receive more citations than fields with higher female representation such as chemistry and biotechnology." |

---

### D3 -- NATIONAL_CHARACTERIZATION

| ID | Category | File | Line | Quoted Text | Concern | Recommended Revision |
|----|----------|------|------|-------------|---------|----------------------|
| D3-01 | NATIONAL_CHARACTERIZATION | `src/app/chapters/geo-international/page.tsx` | 146 | "...while countries with rapidly growing patent volumes, including China, tend to exhibit lower average claim counts, a pattern that may reflect differences in patent drafting conventions or technology field composition." | China is specifically named in the context of "lower average claim counts." While hedging language is present ("may reflect differences in..."), China is the only country singled out with a negative quality descriptor. Japan, despite also having below-US claim counts, is not similarly characterized. | Either (a) name Japan and South Korea alongside China when discussing lower-than-US claims, since they also have lower averages, or (b) remove country-specific naming from the KeyFindings bullet and instead say: "Countries with rapidly growing patent volumes tend to exhibit lower average claim counts." |
| D3-02 | NATIONAL_CHARACTERIZATION | `src/app/chapters/geo-international/page.tsx` | 338 | "...whereas rapidly growing patent origins such as China exhibit lower average claims." | Same pattern: China is the sole named example of lower claims in chart caption. | Same revision as D3-01: either include other countries or remove specific naming. |
| D3-03 | NATIONAL_CHARACTERIZATION | `src/app/chapters/geo-international/page.tsx` | 339 | "The lower average claims from countries with rapidly growing patent volumes may reflect differences in patent drafting conventions, technology composition, or strategic filing approaches." | Hedging language is present and adequate, but the insight text follows a caption that names only China. | Acceptable in isolation. Issue is the pairing with D3-02. |
| D3-04 | NATIONAL_CHARACTERIZATION | `src/app/chapters/geo-international/page.tsx` | 153 | "...while countries with rapidly growing patent volumes tend to exhibit lower average claim counts, a pattern that may reflect different patent drafting conventions, technology composition, or strategic filing approaches." | Executive Summary repeats the same pattern. Hedging is present, but the proximity to "China" in the previous sentence creates an implicit link. | Consider restructuring to place the quality observation in a separate paragraph, disconnected from the China growth statistic. |
| D3-05 | NATIONAL_CHARACTERIZATION | `src/app/chapters/geo-international/page.tsx` | 353 | "...The lower average claims from countries with rapidly growing patent volumes, including China, may reflect differences in patent drafting conventions, technology field composition, or strategic filing approaches, and parallel patterns observed in other countries during periods of rapid patent volume growth." | The additional clause "parallel patterns observed in other countries during periods of rapid patent volume growth" provides important symmetry. This is the best-hedged version. | POSITIVE. This version is well-hedged. Consider propagating this "parallel patterns" language to the KeyFindings (line 146), caption (line 338), and Executive Summary (line 153). |
| D3-06 | NATIONAL_CHARACTERIZATION | `src/app/methodology/page.tsx` | 556 | "Firms that patent primarily abroad may appear less innovative than their true activity warrants." | Uses "less innovative" to describe a measurement limitation. While this is a valid caveat about US-only data, the phrase "less innovative" equates patent counts with innovativeness. | Revise to: "Firms that patent primarily abroad may appear to have lower patent output in this dataset than their true inventive activity warrants." |

---

### D4 -- CAUSAL_POLICY

| ID | Category | File | Line | Quoted Text | Concern | Recommended Revision |
|----|----------|------|------|-------------|---------|----------------------|
| D4-01 | CAUSAL_POLICY | `src/app/chapters/biotechnology/page.tsx` | 264 | "Biotechnology patenting has grown substantially since the 1980s, following the Bayh-Dole Act (1980) which enabled universities to patent federally funded inventions." | "Following...which enabled" implies causal link between Bayh-Dole and biotech patent growth. Academic literature debates whether Bayh-Dole caused or merely formalized existing trends (Mowery et al., 2001). | Add "coinciding with" or note the debate: "...following the Bayh-Dole Act (1980), which enabled universities to patent federally funded inventions, though scholars debate the Act's independent causal contribution (Mowery et al., 2001)." |
| D4-02 | CAUSAL_POLICY | `src/app/chapters/biotechnology/page.tsx` | 275-277 | "The Bayh-Dole Act of 1980 enabled a substantial expansion of university-originated patents, while...gene editing in 2012 catalyzed successive waves of inventive activity." | "Enabled...expansion" and "catalyzed" are causal verbs without explicit causal methodology. | The "catalyzed" usage for CRISPR is more defensible (a specific scientific breakthrough). The "enabled" for Bayh-Dole should be hedged as in D4-01. |
| D4-03 | CAUSAL_POLICY | `src/app/chapters/3d-printing/page.tsx` | 296 | "...the expiration of foundational FDM patents in 2009 catalyzed a wave of innovation in desktop systems" | "Catalyzed" implies causal impact of patent expiration on innovation entry. While widely accepted in the industry, no causal study is cited. | Consider: "...coincided with a wave of innovation in desktop systems, consistent with the view that foundational patent expirations lowered entry barriers." |
| D4-04 | CAUSAL_POLICY | `src/app/chapters/space-technology/page.tsx` | 273 | "The founding of SpaceX in 2002 and the subsequent demonstration of reusable rocket technology catalyzed a broader commercial space movement" | "Catalyzed" implies SpaceX caused the commercial space transition. | Consider: "The founding of SpaceX in 2002 and the subsequent demonstration of reusable rocket technology coincided with -- and are widely credited with accelerating -- a broader commercial space movement." |
| D4-05 | CAUSAL_POLICY | `src/app/chapters/digital-health/page.tsx` | 286 | "The trajectory of digital health patenting has been shaped by two significant developments: the 2009 HITECH Act, which mandated electronic health record adoption and catalyzed a wave of health IT investment" | "Catalyzed" for HITECH Act is a causal claim about policy. | NOTE: The chapter consistently uses "coincided with" in the chart titles (lines 319-321) and narrative (line 307), but the Executive Summary at line 286 uses the stronger "catalyzed." Align the Executive Summary with the more cautious "coincided with" used elsewhere. |
| D4-06 | CAUSAL_POLICY | `src/app/chapters/system-patent-law/page.tsx` | 207 | "Exploiting the eBay decision as a natural experiment, the ruling led to a general increase in innovation by reducing distortions caused by patent litigation." | "Led to a general increase in innovation" is a strong causal claim. However, this is a citation summary of Mezzanotti (2021, Management Science), which does use quasi-experimental methods. | ACCEPTABLE. The causal claim is attributed to a specific peer-reviewed study using natural experiment methodology. No revision needed, but the surrounding text could note this is one study's finding. |
| D4-07 | CAUSAL_POLICY | `src/app/chapters/system-patent-law/page.tsx` | 301 | "This holding led to a substantial increase in section 101 rejections and invalidations, particularly for software patents." | "Led to" is causal language for Alice Corp's impact. | ACCEPTABLE in context. The link between a Supreme Court ruling and changes in PTO examination practice is direct and well-documented. This is closer to a legal consequence than a contested causal claim. |
| D4-08 | CAUSAL_POLICY | `src/app/chapters/system-patent-law/page.tsx` | 516 | "Bayh-Dole Act (1980): Coincided with a substantial increase in university patenting, though scholars debate whether the Act catalyzed the trend or formalized an existing one." | POSITIVE FINDING. This is exemplary hedging -- uses "coincided with" and explicitly notes scholarly debate. | NO ACTION. This is the gold standard for how causal policy claims should be phrased. Use as a model for revising D4-01 and D4-02. |
| D4-09 | CAUSAL_POLICY | `src/app/chapters/system-patent-law/page.tsx` | 464 | "Legislative and judicial changes exhibit measurable effects on patent filing patterns, with impacts observable in the data within one to two years of major rulings." | "Exhibit measurable effects" and "impacts observable" are causal language. The data show temporal correlation but the text implies causation. | Consider: "Legislative and judicial changes coincide with measurable shifts in patent filing patterns, with changes observable in the data within one to two years of major rulings, consistent with -- though not proof of -- causal effects." |
| D4-10 | CAUSAL_POLICY | `src/app/chapters/org-composition/page.tsx` | 153 | "The Bayh-Dole Act (1980) enabled university patenting, but the predominant trend is the rise of corporate R&D" | "Enabled" is a causal verb for Bayh-Dole. | LOW RISK. The sentence structure actually de-emphasizes Bayh-Dole by pivoting to the corporate trend. Acceptable. |
| D4-11 | CAUSAL_POLICY | `src/app/chapters/system-public-investment/page.tsx` | 99 | "Government-Funded Patents Rose From 1,294 in 1980 to 8,359 in 2019 After the Bayh-Dole Act" | Chart title uses "After" which implies temporal sequence but could be read as causal. | LOW RISK. "After" is temporal. The caption (line 100) uses "after...which permitted," which is factual. Acceptable. |

---

### D5 -- LOADED_TERMINOLOGY

| ID | Category | File | Line | Quoted Text | Concern | Recommended Revision |
|----|----------|------|------|-------------|---------|----------------------|
| D5-01 | LOADED_TERMINOLOGY | `src/app/chapters/system-patent-law/page.tsx` | 214 | "Cohen, L., Gurun, U. G., & Kominers, S. D. (2019). Patent trolls: Evidence from targeted firms." | "Patent troll" appears in an academic citation title. The site does not use this term in its own voice; it uses "NPE" (non-practicing entity) throughout. | LOW RISK. The term appears only in the title of a published peer-reviewed article. The site's own text consistently uses the neutral "NPE" or "non-practicing entity." No revision needed, but consider adding a brief note on first use: "(the term 'patent troll,' while pejorative, is used in the original publication title)." |
| D5-02 | LOADED_TERMINOLOGY | `src/app/chapters/system-patent-law/page.tsx` | 257, 320 | Same citation appears in multiple research summaries. | Same citation title repeated under multiple legal events. | Same assessment as D5-01. |
| D5-03 | LOADED_TERMINOLOGY | `src/app/chapters/system-patent-law/page.tsx` | 261 | "Huang, K. G., et al. (2024). Escaping the patent trolls..." | Another published article title using "patent trolls." | Same assessment as D5-01. |
| D5-04 | LOADED_TERMINOLOGY | `src/app/chapters/system-patent-law/page.tsx` | 321 | "Documents NPE forum shopping as a key element of strategic patent trolling" | "Patent trolling" used in a research summary, not a citation title. This is the site's own characterization of a research finding. | Consider replacing with: "Documents NPE forum shopping as a key element of strategic NPE litigation behavior." |
| D5-05 | LOADED_TERMINOLOGY | `src/app/chapters/quantum-computing/page.tsx` | 894 | "If high concentration reflects genuine technical barriers rather than strategic patent thickets" | "Patent thickets" is a loaded term, though less pejorative than "patent troll." It is used in a falsifiable hypothesis context. | LOW RISK. "Patent thicket" is widely used in academic literature (Shapiro 2001, Heller & Eisenberg 1998) and is used here in a hypothesis-testing frame. No revision needed. |

---

### D6 -- METRIC_CONFLATION

| ID | Category | File | Line | Quoted Text | Concern | Recommended Revision |
|----|----------|------|------|-------------|---------|----------------------|
| D6-01 | METRIC_CONFLATION | `src/app/chapters/geo-international/page.tsx` | 145 | "...reflecting a fundamental shift in global inventive activity." | China's growth from 299 to 30,695 patent filings is described as a "shift in global inventive activity." Patent filing volume at the USPTO is equated with inventive activity. Filing at the USPTO could reflect strategic filing decisions rather than underlying inventive activity. | Add qualifier: "...reflecting a fundamental shift in global inventive activity as measured by USPTO filings, which capture filing strategy as well as underlying invention." |
| D6-02 | METRIC_CONFLATION | `src/app/chapters/system-patent-count/page.tsx` | 138 | "The more than five-fold expansion in annual patent grants since 1976 reflects both increased inventive activity and the growing strategic importance of intellectual property protection." | POSITIVE FINDING. This explicitly distinguishes between inventive activity and strategic patenting. | NO ACTION. This is exemplary framing. Use as a model. |
| D6-03 | METRIC_CONFLATION | `src/app/chapters/inv-top-inventors/page.tsx` | 136, 160, 171 | "Innovation output is increasingly concentrated among a small elite of repeat inventors." / "is innovation output becoming more concentrated" / "innovation output is increasingly concentrated among professional, repeat inventors" | "Innovation output" is used as a synonym for patent count. Patent count measures only patented inventions, not total innovation output (which includes trade secrets, open-source contributions, publications, etc.). | Consider replacing "innovation output" with "patent output" or "patented invention output" throughout the chapter. |
| D6-04 | METRIC_CONFLATION | `src/app/chapters/biotechnology/page.tsx` | 374 | "...represents a genuine structural shift in the composition of inventive activity reflected in the USPTO record." | POSITIVE FINDING. The phrase "reflected in the USPTO record" properly scopes the claim to patent data. | NO ACTION. Well-qualified language. |
| D6-05 | METRIC_CONFLATION | `src/app/chapters/geo-domestic/page.tsx` | 493 | "City-level data reveal more pronounced geographic concentration than state-level figures, with a small number of technology hubs accounting for a disproportionate share of national innovation output." | "National innovation output" conflates patent counts with total innovation. | Replace with: "...a disproportionate share of national patent output." |
| D6-06 | METRIC_CONFLATION | `src/app/chapters/system-patent-quality/page.tsx` | 125 | "Unlike patent counts, which capture the quantity of inventive activity, quality indicators attempt to measure how significant, broad, and influential individual inventions are." | POSITIVE FINDING. Explicitly distinguishes quantity from quality and acknowledges the multi-dimensional nature of patent quality. | NO ACTION. Exemplary framing. |
| D6-07 | METRIC_CONFLATION | `src/app/methodology/page.tsx` | 556 | "Firms that patent primarily abroad may appear less innovative than their true activity warrants." | "Less innovative" conflates patent counts with innovativeness. | Revise to: "Firms that patent primarily abroad may appear to have lower patent output in this dataset than their true inventive activity warrants." |
| D6-08 | METRIC_CONFLATION | `src/app/chapters/inv-serial-new/page.tsx` | 138 | "The sustained inflow of new inventors serves as an indicator of the innovation ecosystem's capacity for renewal" | New inventor inflow as an "indicator of innovation ecosystem capacity" is a reasonable interpretation but conflates patent system entry with broader innovation ecosystem health. | LOW RISK. "Indicator of" is appropriately hedged. Consider adding "patent" before "innovation ecosystem" for precision. |

---

## Cross-Cutting Observations

### Positive Patterns
1. **system-patent-law (line 516)**: The Bayh-Dole treatment is a model of careful causal hedging ("coincided with...scholars debate whether the Act catalyzed the trend or formalized an existing one").
2. **system-patent-count (line 138)**: Explicitly distinguishes inventive activity from strategic filing behavior.
3. **system-patent-quality (line 125)**: Clear acknowledgment that patent counts are not the same as innovation quality.
4. **biotechnology (line 374)**: Properly scopes claims to "the USPTO record."
5. **inv-gender (lines 610-617)**: Gender inference error rate disclosure for non-Western names IS present.
6. **geo-international (line 353)**: The KeyInsight contains the best-hedged version of the claims/volume observation, noting "parallel patterns observed in other countries."
7. **Digital health chapter**: Consistently uses "coincided with" in chart titles and data narrative, though the Executive Summary slips to "catalyzed."

### Systemic Issues
1. **Asymmetric naming in national characterizations**: China is repeatedly singled out in the geo-international chapter for lower claim counts while other countries with below-US metrics (Japan, Germany) are not similarly highlighted. The hedging language is present but should be applied more symmetrically.
2. **"Innovation output" conflation**: Several chapters use "innovation output" when they mean "patent output." This is a minor but pervasive issue.
3. **Bayh-Dole causal language inconsistency**: The system-patent-law chapter hedges beautifully, but biotechnology and org-composition use stronger causal language for the same Act.
4. **"Patent troll" in citations**: Acceptable given these are published titles, but the one instance of "patent trolling" in the site's own summary voice (D5-04) should be revised.

### Files with No Findings
The following pages were screened and contain no sensitivity issues:
- `src/app/explore/page.tsx` (data tables only, no narrative)
- `src/app/chapters/blockchain/page.tsx`
- `src/app/chapters/system-convergence/page.tsx`
- `src/app/chapters/system-language/page.tsx`
- `src/app/chapters/inv-team-size/page.tsx`
- `src/app/chapters/inv-generalist-specialist/page.tsx`
- `src/app/chapters/mech-geography/page.tsx`
- `src/app/chapters/mech-organizations/page.tsx`
- `src/app/chapters/org-patent-count/page.tsx`
- `src/app/chapters/org-patent-portfolio/page.tsx`
- `src/app/chapters/org-patent-quality/page.tsx`
- `src/app/chapters/org-company-profiles/page.tsx`
- `src/app/chapters/deep-dive-overview/page.tsx`
- `src/app/chapters/geo-domestic/page.tsx` (except D6-05)
- `src/app/HomeContent.tsx` (no narrative text)
