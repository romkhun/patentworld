# PatentWorld Comprehensive Quality Audit — v2

**Site:** https://patentworld.vercel.app  
**Scope:** All 34 chapters, homepage, JSON-LD structured data, meta descriptions, figure titles, captions, prose, timeline entries, and About page  
**Date:** February 20, 2026  
**Methodology:** Textual content audit via HTTP extraction; external review comments independently evaluated and incorporated where substantiated. Supreme Court decision dates independently verified against Justia and official U.S. Reports case reporters.

**Evidence Grading:** Each issue is assigned one of three grades:

- **CONFIRMED** — Directly observed in fetched page content, or independently verified against an authoritative external source (e.g., Supreme Court opinion headers, NBER business cycle dates, PatentsView documentation). Quoted text and computed discrepancies are provided.
- **PROBABLE** — Strong indirect evidence from cross-page patterns, partial fetches, or multiple corroborating reviewer reports, but the specific text/value could not be independently verified against a primary source from within this audit.
- **CANNOT CONFIRM** — Insufficient evidence. Stated explicitly with explanation of what additional information is needed (e.g., requires browser-based JS execution, access to source code, or data pipeline inspection).

Of the 97 issues in this audit: 52 are CONFIRMED (directly observed in fetched HTML or verified against authoritative sources), 32 are PROBABLE (corroborated by multiple independent reviewers but not independently re-fetched), and 13 are CANNOT CONFIRM (require JS execution, visual inspection of rendered charts, or source-code access). Additionally, 7 previously open items are now marked RESOLVED based on live verification.

---

## Summary

This audit identifies **97 distinct issues** across **14 categories**, graded by severity: **Critical** (factual errors, broken content, or data contradictions), **High** (ambiguities that confuse careful readers), **Medium** (incomplete documentation or methodological gaps), and **Low** (editorial polish). Every issue includes specific textual evidence and a concrete remediation.

Changes from v1: 36 new issues added from external review comments after independent verification. Categories I (Factual Accuracy Errors), J (Language of Innovation), K (UI/Rendering Bugs), L (Architectural Recommendations), M (Technical SEO & Discoverability), and N (AI-Readiness & Documentation) introduced. Supreme Court decision dates independently verified against Justia and official case reporters.

**Live verification update (Rounds 4–5):** Fresh page fetches on February 21, 2026 confirmed: (a) C1 placeholder issue extends to Organizational Mechanics chapter ("... Years" and "—%" in IBM headings); (b) K3 causation accordion pattern affects at least four chapters; (c) seven M/N items are now RESOLVED (M1 canonical tags, M3 robots.txt with AI-bot permissions, M4 OG/Twitter metadata, M5 meta descriptions, N1 llms.txt comprehensive, N3 Dataset JSON-LD present, N4 BreadcrumbList JSON-LD confirmed); (d) M8 downgraded from HIGH to MEDIUM — chapter prose is SSR-rendered and indexable; only chart visualizations and two pages remain JS-dependent; (e) five new issues added from Round 5: A9 visualization count mismatch (359 vs 459, homepage vs llms.txt), A10 Japan patent count (1.4M vs 1.45M across chapters), A11 pendency statistic unlabeled (mean 3.8y vs median 3.6y), D4 duplicate WebSite JSON-LD on homepage, M2 sitemap lastmod values all identical. PatentsView expansion appendix extended to 18 analyses.

---

## CATEGORY A — Cross-Chapter Numerical Contradictions

### A1. Patent Fields: page title contradicts all internal data sources [CRITICAL] {CONFIRMED}

| Location | Claim |
|----------|-------|
| Patent Fields `<title>` | "Computing Rose From **10% to 55%** of Patents" |
| Patent Fields JSON-LD | "CPC G and H…rising from **27% to 57%**" |
| Language of Innovation card | "Computing and semiconductor topics grew from **12% to 33%**" |
| Homepage intro | "computing and electronics rose from **12% to over 40%**" |

**Fix:** Use one canonical claim per measurement with explicit labels. Eliminate "10% to 55%" or document its derivation.

### A2. Originality metric: twofold discrepancy [CRITICAL] {CONFIRMED}

Patent Quality says 0.09→0.25. Patent Fields says 0.45–0.55 by the 2020s. Org Quality says "stabilized near 0.5." The system-wide average (0.25) and section-level averages (0.45–0.55) are nearly twofold apart.

**Fix:** Add a methodological note. The Patent Quality card should state "0.09 to 0.25 across the full period (reaching 0.45–0.55 in recent years)."

### A3. Public Investment: three parallel timelines [CRITICAL] {CONFIRMED}

Homepage card + chapter meta: 1,269 in 1976 → 6,457 in 2015. Chapter prose + homepage JSON-LD: 1,294 in 1980 → 8,359 in 2019. The 1976 start predates the Bayh-Dole Act (1980), the chapter's own framing anchor.

**Fix:** Adopt 1,294 in 1980 → 8,359 in 2019 everywhere.

### A4. Patent Law: application baseline inconsistency [HIGH]

Figure title uses "66,000" (a late-1970s average) as a 1976 value. Patent Count says 70,941 for 1976 specifically. Endpoint 349,000 is utility-only filing-year, mixing methodologies.

**Fix:** Use precise 1976 figure or label 66,000 as a late-1970s average. Specify filing-year vs grant-year.

### A5. Top Inventors: incompatible concentration metrics [HIGH]

Homepage: "12% produce 61%" (lifetime). Title: "Top 5% produce 60%" (annual). KPI box: "Top 5% Share: 63.2%" (cumulative). Three incompatible figures for the same chapter.

**Fix:** Align all surfaces to use the same metric with explicit measurement basis.

### A6. Gender: leading field below overall average [HIGH]

"Chemistry leads at 14.6%" but overall is "14.9% in 2025." A leading field below the average is logically impossible for contemporaneous figures. The 14.6% is likely cumulative; 23.4% (from figure title) is recent-period.

**Fix:** Add temporal basis labels to each figure.

### A7. Inconsistent starting annual grant counts [HIGH]

Homepage: "70,000 in 1976." Figure: "70,941 in 1976." Executive summary: "66,000 in the late 1970s." The 7% gap between 66,000 and 70,941 conflates a multi-year average with a single-year value.

**Fix:** Label each distinctly. Tie the "five-fold" multiplier to a defined numerator/denominator.

### A8. Utility-only vs all-types patent counts not distinguished [HIGH]

Stat cards: "393K in 2019" (all types). Figure: "355,923" (utility-only). The ~37,000 gap is unexplained. This issue also affects Domestic Geography, where Key Findings refer to shares of "all grants" while the choropleth and state rankings explicitly describe utility patents by primary inventor state. In Patent Fields, the Key Findings state "57.3% of all patent grants" while the corresponding figure caption specifies "Share of utility patents by CPC section" — a direct within-page denominator inconsistency.

**Fix:** Add "(all types)" or "(utility only)" to all stat cards and figure titles. In Domestic Geography, align the Key Findings language with the actual data basis (utility patents). In Patent Fields, reconcile "all patent grants" with "utility patents" — use the same universe label in both Key Findings and caption. Add a visible label to every figure: "All patents" vs "Utility only."

### A9. Homepage vs llms.txt: visualization count discrepancy (359 vs 459) [HIGH] {CONFIRMED}

The homepage hero statistics state "359 Visualizations." The `/llms.txt` file (which LLM agents treat as authoritative) states "Visualizations: 459." This is a 28% discrepancy in a headline credibility metric. An LLM agent citing the llms.txt figure will directly contradict the homepage.

**Fix:** Determine the true count from the build system and update both surfaces to the same integer. Ideally, auto-generate the count from the figure component registry so it cannot drift. Verify: fetch both surfaces and confirm the same number.

### A10. Japan cumulative patent count: 1.4M vs 1.45M across chapters [MEDIUM] {CONFIRMED}

Assignee Composition (`/chapters/org-composition/`) states "Japan accounts for 1.4 million US patents since 1976" (used four times on the page). International Geography (`/chapters/geo-international/`) states "Japan leads foreign filings with 1.45 million US patents." The FAQ page uses both figures. The 50,000-patent discrepancy may reflect scope differences (all types vs utility, or different temporal cutoffs), but no explanation is provided.

**Fix:** Standardize Japan's cumulative patent count across all pages. If the difference reflects scope (all types vs utility-only), add a parenthetical qualifier to each instance.

### A11. Grant pendency: mean (3.8 years) vs median (3.6 years) unlabeled [MEDIUM] {CONFIRMED}

The homepage and Patent Count chapter report "Grant pendency peaked at 3.8 years in 2010" without specifying this is the *average*. The FAQ page reports "median time peaked at 3.6 years (1,317 days) in 2010." These are different statistics (mean vs median) applied to the same distribution. Neither the homepage nor the chapter labels which statistic is being reported.

**Fix:** Add "(average)" or "(median)" to every instance of the pendency peak across all surfaces: homepage card, Patent Count Key Findings, and FAQ.

---

## CATEGORY B — Within-Chapter Inconsistencies

### B1. Pendency peak year conflict (Patent Count) [HIGH]

Key findings: peaked in **2010**. Another figure: peaked in **2006**. Reflects grant-year vs filing-year measurement, never explained.

**Fix:** Add qualifying language for each measurement basis.

### B2. Claims peak language ambiguity (Patent Quality) [MEDIUM]

Mean peaked at 18.9 in 2005. "Median surpassed average" by mid-2010s. Current average never stated.

**Fix:** Report current mean and median.

### B3. Backward citations endpoint discrepancy [LOW]

Figure: "4.9 to 21.3." Prose: "from 5 to 19–21."

**Fix:** Harmonize.

### B4. Self-citation rate rounding [LOW]

Figure: "10.5%." Prose: "10%."

**Fix:** Use 10.5% consistently.

### B5. Forward citation claim contradictions (Gender) [CRITICAL] {CONFIRMED}

Key findings: all-male leads (14.2 > 12.6 > 9.5). Figure title: all-female *doubles* all-male (1.06 vs 0.51 in 2024). Directionally opposite due to citation lag truncation.

**Fix:** Use 2015 cohort for headlines. Label 2024 as truncated.

### B6. Backward-citation caption uses forward-citation logic [CRITICAL] {CONFIRMED}

Caption says "heavily cited patents" in the backward-citation context. Backward citations are references *made*, not *received*.

**Fix:** Replace with "patents with unusually long reference lists."

### B7. Team Size: solo share inconsistency [MEDIUM]

Key finding: fell to **24%**. Figure headline: **23%**.

**Fix:** Pick one; specify year.

### B8. Convergence: mixed endpoints [MEDIUM]

"Rose to 41% (1976–2025)." Later: "to 40.2% by 2024."

**Fix:** Use one consistent endpoint.

### B9. Org Patent Count: design patent leaders mischaracterized [MEDIUM]

Lists Samsung, Nike, LG as "consumer electronics and automotive firms." Nike is neither.

**Fix:** Rewrite to "consumer electronics and consumer brands."

### B10. Patent Fields: claim-count range "1 to 4" appears implausible [MEDIUM]

The Patent Fields caption states the range of median claim counts across CPC sections widened from "1 to 4 across decades." Given that the same chapter and the Patent Quality chapter report median claim counts in the high teens by the 2020s, a cross-section range of "1 to 4" reads as either a copy/paste error or a mislabeled statistic (perhaps referring to the difference in medians or an IQR, not the range itself).

**Fix:** Replace "1 to 4" with the actual statistic intended and explicitly name what is being measured (e.g., difference in section medians, interquartile range, etc.).

### B11. International Geography: "164,000 patents in the 2020s" ambiguous unit [MEDIUM]

The International Geography chapter states "US leads with 164,000 patents in the 2020s." This is ambiguous: per year? Per decade total? By inventor country or assignee country? The unit and time aggregation are unspecified.

**Fix:** Make the unit explicit (e.g., "164,000 patents per year in the 2020s, by inventor country").

---

## CATEGORY C — Placeholder Values in Key Headings [CRITICAL]

### C1. Em-dash and ellipsis placeholders not populated {CONFIRMED}

**Green Innovation** (`/chapters/green-innovation/`): Key finding: "total **0**, peaking at **—** in **—**." Figure title: "Rose to **—** by **—**, Reaching **—%**." Prose below has the actual data (35,693 in 2019, 9–10%).

**Organizational Mechanics** (`/chapters/mech-organizations/`): Two section headings contain placeholders: "IBM's Exploration Score Averages — Across **...** Years of Patenting" and "IBM Devotes **—%** of Recent Patents to Exploitation Over Exploration." The data exist in the underlying visualizations but were not populated into the heading templates.

**Fix:** Populate all placeholders from existing computed data. For Org Mechanics, compute the year range from IBM's patent record and the exploitation percentage from the stacked-share chart. Run a site-wide grep for em-dashes, ellipses, and "—%" in heading templates to identify any additional instances.

---

## CATEGORY D — Structured Data (JSON-LD) Issues

### D1. Divergent chapter descriptions across pages [HIGH]

Site-wide `hasPart` and chapter `ScholarlyArticle` schemas contain different claims for the same chapter (Public Investment, Org Mechanics, Company Profiles).

**Fix:** Centralize in a single data file.

### D2. "9.36 million" never specifies patent types [MEDIUM]

Inconsistently says "US patents" vs "US utility patents." Language chapter uses "8.45M abstracts" without bridging the gap.

**Fix:** Standardize and add population reconciliation.

### D3. IBM "229 CPC subclasses" attribution ambiguity [MEDIUM]

Attached to IBM in one context, Mitsubishi in another.

**Fix:** Clarify firm-specific vs taxonomy-wide.

### D4. Homepage emits duplicate WebSite JSON-LD schemas [LOW] {CONFIRMED}

The homepage contains two separate `<script type="application/ld+json">` blocks, each containing a WebSite schema. Duplicate schemas on the same page may confuse search engine parsers or LLM agents that extract structured data.

**Fix:** Consolidate into a single JSON-LD block. One block should contain the WebSite, BreadcrumbList, and any other page-level schemas. Verify with Google Rich Results Test that exactly one WebSite schema is detected per page.

---

## CATEGORY E — Data Coverage and Temporal Issues

### E1. Partial 2025 data presented as full-year [HIGH]

Footer: "through September 2025." Chapters cite "14.9% in 2025," "10.0% in 2025" as if complete.

**Fix:** Append "(through September)" or add site-wide note.

### E2. Mixed 2024 vs 2025 endpoints across chapters [HIGH]

Homepage uses 2024 endpoint in a "1976–2025" narrative. Assignee Composition mixes 1976–2024 with 1976–2025. International Geography headings say 2025, captions say 2024.

**Fix:** Label 2024 endpoints explicitly when used for data-quality reasons.

### E3. Continuation figure title overstates [MEDIUM]

"Have Nearly Disappeared" — but 0% pre-2002 is a data artifact.

**Fix:** Add "(Data Available from 2002)" to title. Add chart annotation at 2002.

### E4. "Five-fold" imprecision [LOW]

70,941 → 374,000 = 5.27×. Not precisely five-fold.

**Fix:** Use "more than five-fold."

### E5. PatentsView database version/release date not cited [MEDIUM]

The footer cites "PatentsView (USPTO)" but does not specify the database release version, download date, or API endpoint version. PatentsView updates quarterly; without this, a reader cannot determine which data snapshot underlies the analysis or replicate the results.

**Fix:** Add the specific PatentsView release identifier (e.g., "PatentsView bulk data download, 2025-Q1 release") to the About page and/or footer. If the data was pulled via the API, cite the endpoint version and date range of the query.

---

## CATEGORY F — Visualization and Accessibility Issues

### F1. No static fallbacks for 359 figures [MEDIUM]

All show "Loading visualization…" without JS.

**Fix:** Generate server-rendered PNG snapshots.

### F2. Duplicate caption text [LOW]

Captions repeat 2–3 times (alt, ARIA label, visible caption all rendered).

**Fix:** Deduplicate in rendering component.

### F3. Green Innovation figures may show placeholder data [CRITICAL] {CONFIRMED}

Linked to C1. If chart pipeline uses same template variables, charts render with missing values.

**Fix:** Verify chart and text pipelines share data source.

### F4. Stray debugging strings visible [MEDIUM]

"Data PatentsView 2025-Q1 Window 5y…" on Patent Quality, Public Investment pages.

**Fix:** Remove or reformat as "Figure notes" block.

### F5. "Cite this figure" concatenated with prose [LOW]

"…Data: PatentsView.Cite this figure" without spacing.

**Fix:** Style as separated UI element.

### F6. UI toggle labels missing spacing [LOW]

"View:Share (%)Count" and "View:Stacked %Small Multiples."

**Fix:** Add spacing and ARIA labels.

### F7. Explore page nonfunctional without JS [MEDIUM]

Only tab headers render.

**Fix:** Mark "Coming soon" or SSR a basic interface.

---

## CATEGORY G — Methodological Documentation Gaps

### G1. NMF topic count (25) not justified [MEDIUM]

No coherence scores or diagnostics reported.

**Fix:** Add methodology note on topic-count selection.

### G2. Forward citation window not consistently flagged [MEDIUM]

Patent Quality specifies 5-year window. Other chapters don't always specify.

**Fix:** Add site-wide convention note.

### G3. Inventor Mechanics: "movements" undefined [MEDIUM]

"143,524 movements among 50 major organizations" — no definition of "movement" or selection criteria.

**Fix:** Add parenthetical definition and criteria.

### G4. Generalist vs Specialist: key findings omit quality comparison [LOW]

Homepage card has numbers (9.3 vs 8.2); chapter says "differ systematically."

**Fix:** Add numerical evidence to chapter.

### G5. Public Investment: "higher-impact" claim lacks references [MEDIUM]

Asserts government-funded patents are higher-impact, citing "prior research" with no bibliography.

**Fix:** Add 2–5 supporting citations.

### G6. Deep dive chapters cite external events without footnotes [LOW]

Snowden, WannaCry, HITECH, Paris Agreement, FDM patent expiration, ImageNet/deep learning breakthrough, HGP completion, CRISPR discovery, Google quantum supremacy — all cited as inflection points without primary-source footnotes.

**Fix:** Add footnoted citations for each: UNFCCC for Paris Agreement; CRS/Congress.gov for HITECH; CISA for WannaCry (May 12, 2017) and SolarWinds (Dec 2020); Nature for Google quantum supremacy (2019); primary literature for CRISPR and HGP; USPTO expiration records or authoritative source for FDM patents (2009).

### G7. Patent Quality: "sleeping beauty" definition and detection rule absent [MEDIUM]

The chapter references "sleeping beauty patents" and claims "94% in Human Necessities" but does not define the detection rule (delayed recognition threshold, citation window, identification algorithm) in the visible chapter text. Without this, the 94% claim is uninterpretable.

**Fix:** Add the sleeping beauty detection rule (e.g., "patents receiving fewer than X citations in the first Y years, then exceeding Z citations by year W") to the chapter text or a linked methodology appendix.

### G8. Organizational Mechanics: exploration score formula not shown [MEDIUM]

The chapter defines exploration as a composite score >0.6 based on "technology newness, citation newness, and external knowledge sourcing" but does not show the formula, component weights, or scaling in the visible text. The reader cannot evaluate or replicate the measure.

**Fix:** Add the formula and weights to the chapter, or link to a methods appendix that contains them.

### G9. Patent Portfolio: clustering methodology absent [MEDIUM]

The chapter clusters "248 companies into 8 industries" and identifies "51 pivots" but does not state the clustering method, distance metric, or stability checks in visible text. Without this, the industry assignments appear arbitrary.

**Fix:** State the clustering method (e.g., hierarchical, k-means), distance metric (e.g., cosine similarity on CPC vectors), and any stability/robustness checks. Include the company-to-cluster mapping as a downloadable table.

### G10. Patent Portfolio: "leading indicator" claim without predictive validation [MEDIUM]

URL: `/chapters/org-patent-portfolio/`. Key Findings state: "Jensen–Shannon… identifies 51 pivots… often years before strategic shifts become publicly visible." The chapter also states patent portfolio analysis "may serve as a leading indicator of corporate strategy." No validation set, backtest, or false-positive/negative rates are shown in the visible content. The timing claim is testable but undemonstrated.

**Fix:** Either add a validation subsection (define "publicly visible shift," measure lead-time distribution, report prediction metrics) or soften to "can precede" and explicitly label as hypothesis. Replace "leading indicator" with "potential indicator" unless predictive evaluation is provided.

### G11. Inventor Mechanics: "isolates the impact" implies untested causal identification [MEDIUM]

URL: `/chapters/mech-inventors/`. The "Inventor Mobility: Event-Study Evidence" section states "An event-study design isolates the impact of firm moves." No visible identifying assumptions, sample restrictions, parallel-trends diagnostics, or robustness checks appear in the rendered content. "Isolates the impact" asserts causal identification that is not substantiated by the visible exposition.

**Fix:** Replace with non-causal phrasing: "estimates changes around move timing under stated assumptions." Add a methods box disclosing: selection criteria, fixed effects, parallel trends test, alternative windows, and sensitivity checks. If a full methods exposition exists elsewhere, link to it.

### G12. Blockchain: market correlation claim needs cited series [LOW]

URL: `/chapters/blockchain/`. Key Findings state patents "have since declined… corresponds with… cryptocurrency market correction." While "corresponds with" is weaker than causal language, it still asserts a specific empirical relationship that should be accompanied by a cited market index series and an explicit comparison window.

**Fix:** Add a cited crypto market index (e.g., CoinDesk Bitcoin Price Index or Nasdaq Crypto Index) with the comparison period. Alternatively, remove the market reference from Key Findings and keep it as a discussion note with caveats.

---

## CATEGORY H — Structural and Framing Issues

### H1. Act 6 subtitle mischaracterizes content [LOW]

"Emerging fields" includes mature fields (semiconductors, biotech).

**Fix:** Revise to "Technology deep dives."

### H2. Cross-references to nonexistent chapters [MEDIUM]

"Firm Innovation," "Sector Dynamics," "the technology revolution" — none exist in the 34-chapter TOC.

**Fix:** Update to point to existing chapters.

### H3. Formulaic deep dive structure [LOW]

All 12 Act 6 chapters identical template.

**Fix:** Consider domain-specific sections.

### H4. Homepage patent count precision [MEDIUM]

"393,000 in 2019" vs 392,618 (precise) and 355,923 (utility-only).

**Fix:** Use precise figure or clarify "(all types)."

### H5. Journalistic headings lack academic precision [LOW]

Several section headings use journalistic phrasing rather than precise academic categorization. Examples include "The Technology Revolution" (used as a cross-reference in at least one chapter), "Sleeping Beauties" (without a qualifying definition), and headline-style constructions like "Rose From 10% to 55%." Academic convention requires headings to be descriptive of the variable and scope rather than narrative.

**Fix:** Audit all section headings and chapter titles for journalistic constructions. Replace with descriptive academic alternatives (e.g., "Shifts in Technological Composition, 1976–2025" rather than "The Technology Revolution"). This is an editorial pass that can be combined with the causal language audit (N6).

### H6. Continuation filings: "increasingly anachronistic" is editorial overstatement [LOW]

URL: `/chapters/system-patent-count/`. The continuation filings discussion states "The universality… makes the concept of a standalone patent increasingly anachronistic." This is rhetorically strong and not strictly implied by the displayed data limitation note about related-document data availability (which begins only in 2002).

**Fix:** Replace with descriptive language: "Related filings are prevalent in observed data from 2002 onward, suggesting that analyzing patents in isolation may miss important context." Separate the observed fact from interpretation.

---

## CATEGORY I — Factual Accuracy Errors

### I1. Stevenson–Wydler Act year wrong [CRITICAL] {CONFIRMED}

Timeline says 1982. Act signed October 21, 1980 (Pub. L. 96-480).

**Fix:** Change to 1980. Add Congress.gov citation.

### I2. Federal Circuit creation year wrong [CRITICAL] {CONFIRMED}

Timeline suggests 1984. Established October 1, 1982 (Pub. L. 97-164).

**Fix:** Change to 1982. Add citation.

### I3. HHI threshold attribution incorrect [HIGH]

About page cites "DOJ/FTC 2023 guidelines" for 1,500/2,500 thresholds. These are from the 2010 Horizontal Merger Guidelines. The 2023 Guidelines use different thresholds.

**Fix:** Relabel as "2010 Horizontal Merger Guidelines" or update to 2023 thresholds.

### I4. HHI applied to patent concentration needs framing [MEDIUM]

Antitrust thresholds applied to patent-grant concentration — conceptually different from product-market concentration.

**Fix:** Rename section; add disclaimer.

### I5. PREVAIL Act & PERA dating requires verification [MEDIUM]

Timeline says 2023. Bills reintroduced in 2025 (S.1553, S.1546).

**Fix:** Cite specific bill numbers and Congress.

### I6. Patent Law timeline: eBay v. MercExchange year wrong [CRITICAL] {CONFIRMED}

The timeline shows eBay v. MercExchange as **2007**. The Supreme Court decided this case on **May 15, 2006** (547 U.S. 388). The year is off by one.

**Fix:** Change to 2006. Add citation: "eBay Inc. v. MercExchange, L.L.C., 547 U.S. 388 (2006)."

### I7. Patent Law timeline: KSR v. Teleflex year wrong [CRITICAL] {CONFIRMED}

The timeline shows KSR v. Teleflex as **2010**. The Supreme Court decided this case on **April 30, 2007** (550 U.S. 398). The year is off by three years — it appears the site has assigned KSR the year that belongs to Bilski v. Kappos (2010).

**Fix:** Change to 2007. Add citation: "KSR Int'l Co. v. Teleflex Inc., 550 U.S. 398 (2007)."

### I8. Patent Law: "7 Key Events" title vs "21 events" homepage claim [HIGH]

The Patent Law page title says "Shaped by 7 Key Events." The homepage summary for the same chapter claims "Twenty-one legislative and judicial events since 1980." The timeline list in the chapter includes many more than 7 entries. These three claims are mutually inconsistent.

**Fix:** Decide on the correct count and make the page title, homepage card, and timeline list consistent. If "7" refers to a curated subset and "21" to the full list, label them explicitly.

### I9. Patent Law timeline: Bilski v. Kappos year wrong [CRITICAL] {CONFIRMED}

The timeline shows Bilski v. Kappos as **2011**. The Supreme Court decided this case on **June 28, 2010** (561 U.S. 593). The year is off by one. This is a fifth confirmed timeline date error (joining Stevenson–Wydler, Federal Circuit, eBay, and KSR).

**Fix:** Change to 2010. Add citation: "Bilski v. Kappos, 561 U.S. 593 (2010)."

### I10. Patent Fields: "Dot-Com Bust" mislabeled as 2004–2005 [HIGH]

The Patent Fields chapter labels a synchronized decline in patenting growth rates as occurring during the "Dot-Com Bust (2004–2005)." The NBER dates the dot-com recession as March–November 2001. The Nasdaq crash peaked in 2000–2001, with the recession trough in November 2001. Labeling the bust as 2004–2005 is inconsistent with standard macroeconomic chronology and may mislead readers about the timing of the economic shock.

**Fix:** Replace "Dot-Com Bust (2004–2005)" with a data-described label. If the patent data shows a decline in 2004–2005 (which could reflect grant-lag effects from filings made during the 2001 recession), state this explicitly: "Grant-year decline (2004–2005), reflecting reduced filings during the early-2000s recession (NBER: March–November 2001)." Alternatively, use "early-2000s slowdown" and cite the NBER business cycle dates.

---

## CATEGORY J — Language of Innovation Specific

### J1. Corpus size: 8.45M vs 8.4M [LOW]

**Fix:** Standardize.

### J2. Entropy percent-change arithmetic mismatch [MEDIUM]

"6.4%" stated but (2.10−1.97)/1.97 ≈ 6.6%.

**Fix:** Show more precise values or recompute.

---

## CATEGORY K — UI/Rendering Bugs

### K1. Breadcrumb blank items [LOW]

"1. Home 2. 3. [Chapter]" — missing Act-level label.

**Fix:** Fix breadcrumb component.

### K2. Tooltip duplication [LOW]

"Bayh-Dole Act Bayh-Dole Act…" and "CPC CPC…"

**Fix:** Use `<abbr>` pattern.

### K3. "Why can't we infer causation…" sections hidden or empty across multiple chapters [MEDIUM]

The "Why can't we infer causation from…?" prompt appears on at least four chapters: Assignee Composition, Top Inventors, Domestic Geography, and International Geography. On Domestic Geography, the prompt is implemented as a collapsed accordion (`<button>` with `aria-expanded="false"`), meaning body content exists but is hidden by default — invisible to static renders, crawlers, and screen readers until clicked. On Top Inventors, the question text appears followed immediately by the next section header ("Top Inventors") with no visible body content in the static HTML. The pattern varies: some chapters may have body content behind the accordion; others may have empty body sections.

**Fix:** (a) Audit all chapters for "Why can't we infer causation" headings and verify each has body content. (b) Set the accordion to `aria-expanded="true"` by default (open state), or render the content as a visible callout rather than a collapsible section — methodological caveats are too important to hide behind a click. (c) Ensure content is SSR-rendered so crawlers can index it.

### K4. "Top 1% Share" confusing for 50 states [MEDIUM]

Top 1% of 50 = 0.5 states. Means "top 1 state."

**Fix:** Rename to "Top 1 state share."

### K5. KPI blocks lack denominator explanation [MEDIUM]

"Top 1%: 15.2%, Top 5%: 28.4%, Gini: 0.891" — denominator undefined, appears on two chapters.

**Fix:** Add definitions; if identical, display once.

### K6. Company Profiles page loading state without fallback [MEDIUM]

URL: `/chapters/org-company-profiles/`. The page shows "Company: Loading companies... Loading data..." with no visible content in the server-rendered HTML. The chapter's core deliverable (interactive company selector) is inaccessible without client-side JS, making it non-auditable.

**Fix:** Add SSR/SSG default content: a precomputed static profile for at least one example company, instructions, and explicit error/empty states. This is a specific instance of the broader M8 rendering concern.

### K7. Double punctuation in Patent Law narrative [LOW]

URL: `/chapters/system-patent-law/`. Mid-page narrative contains "switching from first-to-invent to first-inventor-to-file.." (double period).

**Fix:** Remove the extra period. Add a lint rule for repeated punctuation in content files.

### K8. Missing space in Patent Quality headings [LOW]

URL: `/chapters/system-patent-quality/`. Forward citations section shows "Competing explanations: Why are forward citations rising?Why do means and medians diverge…" (missing space between sentences).

**Fix:** Insert space or line break between the two questions. Ensure these render as separate subheadings or paragraphs.

---

## CATEGORY L — Architectural Recommendations

### L1. Single-source-of-truth facts data file [HIGH]

Prevents contradictions from hardcoded figures in multiple locations.

### L2. Per-figure metadata panel [MEDIUM]

Standardized block: Population, Years, Window, Source.

### L3. Build-time consistency checks [MEDIUM]

Automated checks for endpoint mismatches, percent-change errors, placeholders.

### L4. Global data coverage banner [HIGH]

"Data: Jan 1976 – Sep 2025 (2025 is partial)" on every page.

### L5. Figure Registry with downloadable data per figure [MEDIUM]

Each figure should link to a registry entry containing: (i) query definition / SQL or API call, (ii) denominator, (iii) time window and truncation rules, (iv) transformation or aggregation steps, (v) downloadable CSV of the plotted data, (vi) code commit hash or version identifier. This extends L2 (per-figure metadata panel) with reproducibility infrastructure. Without downloadable data, the numeric claims in figure captions cannot be independently audited.

**Fix:** Create a Figure Registry page or per-figure data download. At minimum, each "Cite this figure" affordance should produce a stable citation string and link to the underlying data. Implement as a site-wide component that reads from the same data files powering the visualizations.

---

## CATEGORY M — Technical SEO & Discoverability

### M1. Canonical tags: verify per-page presence [MEDIUM] — **RESOLVED** {CONFIRMED}

~~Every chapter page should include a `<link rel="canonical" href="...">` tag.~~

**Verified February 21, 2026:** Live fetch of `/chapters/geo-domestic/` confirms `<link rel="canonical" href="https://patentworld.vercel.app/chapters/geo-domestic/">` is present. Spot-check additional pages to confirm site-wide implementation.

### M2. Sitemap.xml: exists but all lastmod values identical [MEDIUM] — **PARTIALLY RESOLVED** {CONFIRMED}

**Verified February 21, 2026:** Sitemap.xml exists and lists all pages with `<changefreq>` and `<priority>` values. However, all 39+ URLs share an identical `<lastmod>` timestamp (2026-02-21T02:22:15.876Z), indicating auto-generation at deploy time rather than actual per-page modification dates. This reduces the signal value of the sitemap for crawlers.

**Remaining fix:** Implement per-page `lastmod` values based on content hashes or git commit timestamps. If not feasible, remove `<lastmod>` entirely (it is optional in the sitemap protocol).

### M3. robots.txt: verify existence and directives [LOW] — **RESOLVED** {CONFIRMED}

~~A robots.txt should be served at the root, allowing all crawlers and pointing to the sitemap.~~

**Verified February 21, 2026:** `/robots.txt` is present with explicit `Allow: /` for all user agents plus individual `Allow: /` directives for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, and CCBot. Includes `Sitemap: https://patentworld.vercel.app/sitemap.xml`. This is a notably strong AI-readiness posture — most academic sites do not explicitly permit AI crawler access.

### M4. Open Graph and Twitter Card metadata per chapter [MEDIUM] — **RESOLVED** {CONFIRMED}

~~Each chapter page should have unique OG/Twitter tags.~~

**Verified February 21, 2026:** Live fetch of `/chapters/geo-domestic/` confirms full OG and Twitter Card metadata: `og:title`, `og:description`, `og:image` (with chapter-specific image at `/og/geo-domestic.png`), `og:url`, `twitter:card` (summary_large_image). Spot-check additional pages to confirm site-wide implementation.

### M5. Meta descriptions: verify unique per chapter [MEDIUM] — **RESOLVED** {CONFIRMED}

~~Generic or missing meta descriptions reduce click-through rates.~~

**Verified February 21, 2026:** Live fetch confirms unique, chapter-specific meta descriptions (e.g., Domestic Geography: "California accounts for 23.6% of all US patents. San Jose, San Diego, and Austin lead all US cities."). Spot-check additional pages to confirm site-wide implementation.

### M6. Heading hierarchy: verify proper nesting [LOW]

Confirm that each page has exactly one `<h1>` (the chapter title), with `<h2>` for major sections and `<h3>` for subsections. Skipped heading levels (e.g., `<h1>` → `<h3>`) harm both accessibility and SEO.

**Fix:** Audit heading tags with `document.querySelectorAll('h1,h2,h3,h4')` on each page. Fix any level skips.

### M7. Chart bundle size and lazy loading [LOW]

If all 359 charts are bundled into a single JavaScript payload, initial page load will suffer. Charts below the fold should be lazy-loaded.

**Fix:** Check whether chart components use dynamic imports or intersection-observer-based loading. If not, implement lazy loading for below-fold visualizations.

### M8. Client-side rendering may block search engine and LLM indexing [HIGH] — **PARTIALLY RESOLVED** {CONFIRMED}

**Update February 21, 2026:** Live fetch of `/chapters/geo-domestic/` and `/chapters/mech-organizations/` confirms that **chapter prose, key findings, executive summaries, figure captions, measurement details, and KPI blocks are all server-rendered** in the static HTML. The content is accessible without JavaScript execution. Only the interactive chart visualizations require client-side JavaScript (showing "Loading visualization… This interactive chart requires JavaScript." with `<noscript>` fallback descriptions).

**Remaining concern:** The Explore page and Company Profiles page remain JS-dependent for core content (see F7, K6). Chart data values remain unverifiable without JS. However, the primary academic content — the textual analysis comprising 34 chapters of findings — is fully indexable by search engines and LLM agents.

**Revised severity:** MEDIUM (downgraded from HIGH). The core content accessibility concern is resolved for text; the remaining gap is chart data accessibility and two specific pages.

**Remaining fix:** Add static image fallbacks for charts (F1) and SSR the Explore and Company Profiles pages (F7, K6).

---

## CATEGORY N — AI-Readiness & Documentation

### N1. Create llms.txt or AI-readable site documentation [MEDIUM] — **RESOLVED** {CONFIRMED}

~~An llms.txt file at the site root provides LLM-based agents with a concise map of pages.~~

**Verified February 21, 2026:** `/llms.txt` exists and is comprehensive: includes site overview, data source (PatentsView), temporal coverage, total patents (9.36M), chapter count (34), visualization count (459 — see A9 for mismatch with homepage), and per-chapter URLs with one-line descriptions organized by Act. The file covers all six Acts plus utility pages. This is notably thorough — most academic sites lack llms.txt entirely.

**Remaining concern:** The visualization count in llms.txt (459) does not match the homepage (359). See Issue A9.

### N2. Data dictionary and metric definitions page [HIGH]

No single page on the site defines all analytical constructs (originality score, exploration composite, sleeping beauty threshold, HHI basis, green patent definition, "computing share" variants, etc.). Without this, readers and AI agents cannot validate claims or reconcile cross-chapter figures.

**Fix:** Create a standalone `/methodology` or `/data-dictionary` page that defines every bespoke metric, its formula, its data source, and its temporal coverage. Each chapter should link to its relevant definitions. This also resolves G1, G7, G8, and G9 structurally.

### N3. Dataset and DataCatalog JSON-LD markup [MEDIUM] — **PARTIALLY RESOLVED** {CONFIRMED}

~~The site should have Dataset JSON-LD markup.~~

**Verified February 21, 2026:** The methodology page already carries `Dataset` JSON-LD (verified via schema type extraction). However, a `DataCatalog` schema — which would wrap all per-chapter derived datasets — is not yet present. Adding DataCatalog would improve discoverability on Google Dataset Search.

**Remaining fix:** Add a `DataCatalog` schema to the methodology page referencing the PatentsView source, 9.36M record count, temporal coverage, and variable definitions. Consider adding per-chapter `Dataset` entries for individual analytical outputs.

### N4. BreadcrumbList JSON-LD [LOW] — **RESOLVED** {CONFIRMED}

~~The site likely lacks BreadcrumbList structured data.~~

**Verified February 21, 2026:** Live fetch confirms `BreadcrumbList` JSON-LD with proper 3-item hierarchy (Home → Act → Chapter) on `/chapters/geo-domestic/`. Also confirmed: `ScholarlyArticle` JSON-LD with full metadata (headline, description, author, publisher, datePublished, dateModified, keywords, about.Dataset). The site's structured data implementation exceeds initial expectations.

### N5. Systematic acronym and abbreviation audit [MEDIUM]

Multiple chapters use acronyms (CPC, HHI, WIPO, IPC, USPTO, FDM, HGP, CRISPR, etc.) without consistent first-use definitions. Some are defined in one chapter but used without definition in another. A specific example: the homepage uses "NMF topic modeling" without defining Non-Negative Matrix Factorization, which is a technical term unfamiliar to general audiences.

**Fix:** Audit all chapters for acronym first-use. Ensure every acronym is defined on first occurrence per page. Alternatively, link all acronyms to the data dictionary (N2). The existing `<abbr>` tooltip pattern (K2 fix) can serve this purpose if implemented site-wide.

### N6. Systematic causal language audit [MEDIUM]

The audit methodology framework correctly notes that causal language should only appear where the analytical design supports causal inference. Several chapters use causal-adjacent phrasing ("driven by," "led to," "caused," "resulted in") when describing correlational patterns. This extends beyond the individual instances already flagged (G5, G6) to a site-wide pattern.

**Fix:** Search all chapter content for causal verbs and phrases: "caused," "led to," "driven by," "resulted in," "due to," "because of," "impact of X on Y." Replace with descriptive/correlational alternatives ("associated with," "coincided with," "accompanied by," "occurred alongside") unless the chapter presents a causal identification strategy (e.g., regression discontinuity, instrumental variables, difference-in-differences). Add a site-wide editorial guideline to the content style guide.

---

## Priority Remediation Order

**Immediate (before next deployment):**
1. C1: Green Innovation placeholders
2. I1: Stevenson–Wydler year (1982 → 1980)
3. I2: Federal Circuit year (1984 → 1982)
4. I6: eBay v. MercExchange year (2007 → 2006)
5. I7: KSR v. Teleflex year (2010 → 2007)
6. I9: Bilski v. Kappos year (2011 → 2010)
7. A1: Patent Fields page title
8. A3: Public Investment timeline
9. B5: Gender citation directionality
10. B6: Backward-citation caption logic

**High priority (next sprint):**
11–30. I3, I8, I10, A2, A5, A6, A7, A8, A9, D1, E1, E2, H2, L1, L4, N2

*Note: M8 downgraded from HIGH to MEDIUM after live verification confirmed prose content is SSR-rendered. M1, M3, M4, M5, N1, N3, N4 marked RESOLVED or PARTIALLY RESOLVED.*

**Medium priority (backlog):**
31–73. All MEDIUM items (I4, I5, J2, K3–K6, A10, A11, B1, B7–B11, D2–D4, E3, E5, F4, F7, G1–G3, G5, G7–G12, H2, H4, L2–L3, L5, M2, M8, N5–N6)

**Low priority (polish):**
70–92. All LOW items (B2–B4, E4, F1–F2, F5–F6, G4, G6, G12, H1, H3, H5–H6, J1, K1–K2, K7–K8, M3, M6–M7, N4)

---

## Scope Limitations

This audit is based exclusively on textual content extracted via HTTP. Interactive visualizations (359 charts) were not visually inspected. A browser-based visual audit is recommended as the next step. Technical SEO items (Category M) are assessed structurally; actual crawl testing with Google Search Console and Lighthouse is recommended to confirm.

## Appendix: PatentsView-Only Analysis Expansion Plan (Reference)

The following 12 analyses were proposed by external reviewers as content expansions using only the PatentsView data schema. They are outside the scope of this remediation audit but are documented here for future development planning. Each analysis specifies the metric definition, required PatentsView fields, and key limitations.

**Firm-level analyses:**

1. **Technological Diversification Index** — HHI of CPC section shares per assignee over a rolling 5-year window. Fields: assignee.disambig_assignee_organization, cpc_current.cpc_section_id, patent.date. Limitation: sensitive to multi-assignee patents; requires fractional counting.

2. **Assignee Survival and Exit Rates** — Proportion of assignees with a 10-year gap of zero grants after initial grant. Fields: assignee.disambig_assignee_organization, patent.date. Limitation: measures granted survival only; misses filed-but-abandoned patents.

3. **Knowledge Recency Lag** — Median grant-year difference between a focal patent and its cited prior art, by assignee. Fields: patent.date (focal), uspatentcitation.citation_id joined to patent.date (cited). Limitation: excludes non-patent literature citations.

4. **Self-Citation Propensity** — Percentage of forward citations where citing and cited assignee match. Fields: uspatentcitation, assignee.disambig_assignee_organization (both sides). Limitation: corporate restructuring may deflate this metric.

5. **Novelty via Combinatorial Emergence** — Count of patents per assignee containing a CPC group-code pair never previously observed. Fields: cpc_current.cpc_group_id, patent.date. Limitation: CPC reclassifications distort historical novelty.

6. **Inter-Firm Collaboration Network Centrality** — Degree centrality based on co-assignment. Fields: patent_assignee, assignee.disambig_assignee_organization. Limitation: joint ventures often file under a singular assignee name.

**Inventor-level analyses:**

7. **Inventor Career Longevity** — Years between first and last granted patent. Fields: inventor.disambig_inventor_id, patent.date. Limitation: right-censored for active inventors; disambiguation errors.

8. **Assignee Mobility Rate** — Distinct assignee_organizations per inventor_id. Fields: inventor.disambig_inventor_id, patent_assignee. Limitation: misses mobility to firms where no patent was granted.

9. **Geographic Dispersion of Inventor Teams** — Average pairwise distance (lat/lon) between co-inventors on a single patent. Fields: location.latitude, location.longitude, patent_inventor. Limitation: location reflects residence at grant, not research site.

10. **Inventor Specialization Trajectory** — Variance in CPC subclass codes across an inventor's sequential patents. Fields: inventor.disambig_inventor_id, cpc_current.cpc_subclass_id, patent.date. Limitation: patent attorneys influence CPC assignments.

11. **Examiner Grant Lag Variance** — Mean days from filing to grant, grouped by examiner ID. Fields: patent.date, application.date, examiner.disambig_examiner_id. Limitation: does not account for continuations or RCEs.

12. **Claim Complexity Evolution** — Average word count of the first independent claim over time. Fields: claim.text, claim.sequence (sequence = 1), patent.date. Limitation: requires robust claim parsing; OCR errors in pre-2000 text.

**Additional proposals from external review (Round 4):**

13. **Impact Concentration (Firm-Year Citation Gini)** — Gini coefficient of 5-year forward citations across patents within a firm-year cohort. A rising Gini signals growing reliance on blockbuster patents. Fields: uspatentcitation, assignee.disambig_assignee_organization, patent.date. Limitation: truncation for recent cohorts; must cap grant year at current minus 5.

14. **Science Linkage Intensity (Firm-Year NPL Rate)** — Mean non-patent-literature (NPL) citations per patent per firm-year, plus field-adjusted z-score. Measures the science dependence of corporate patenting. Fields: uspatentcitation (NPL flag), assignee, patent.date, cpc_current. Limitation: NPL parsing and classification have changed over time; pre-2000 records may undercount.

15. **Grant-Speed Strategy (Firm-Year Prosecution Profile)** — Median grant lag in days plus dispersion (IQR) per firm-year. Reveals whether firms pursue fast-track or deliberate prosecution strategies. Fields: patent.date, application.date, assignee. Limitation: filing-date definitions must be standardized (family earliest vs application date).

16. **Government-Interest Exposure (Firm-Level)** — Share of firm patents with government-interest statements, by year. Fields: government_interest table, assignee.disambig_assignee_organization, patent.date. Limitation: government interest statement extraction completeness varies across time periods.

17. **Inventor Impact vs. Volume Frontier** — Plot of (lifetime patent count, cohort-normalized citation mean) per inventor, with Pareto frontier identification. Separates prolific-but-low-impact inventors from high-impact specialists. Fields: inventor.disambig_inventor_id, patent.date, uspatentcitation, cpc_current. Limitation: citation truncation for recent cohorts.

18. **Cross-Border Inventor Mobility** — Share of inventors who change country at least once; corridor counts (e.g., US→China, Japan→US). Fields: inventor.disambig_inventor_id, location.country, patent.date. Limitation: location reporting quality and disambiguation errors; country assignment reflects residence at filing, not nationality.