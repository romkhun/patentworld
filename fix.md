# Claude Code Prompt: Audit, Verify, and Optimize patentworld.vercel.app

You are auditing and improving the website https://patentworld.vercel.app/. This is an academic/professional site presenting patent and innovation research by a Wharton School faculty member. **Accuracy is paramount** — any errors will severely undermine the author's reputation and credibility. Every claim, figure, reference, and description must be verifiably correct.

---

## GENERAL GUIDELINES (Apply Throughout All Phases)

These principles govern every phase. Do not wait for a specific phase to follow them.

- **Accuracy is the top priority.** Every analysis, figure, takeaway, and caption must be precisely supported by the data. Do not overstate, speculate, or extrapolate. Never fabricate, invent, or assume information.
- **When uncertain, flag — do not guess or silently remove.** Add uncertain items to `AUDIT_LOG.md` under a "FLAGGED FOR AUTHOR REVIEW" heading with the page name, the specific claim, and the reason for uncertainty.
- **When a claim is partially correct but overstated,** revise it to be precisely accurate rather than removing it entirely. Only remove claims that are outright false and cannot be salvaged.
- **Do not introduce new claims, findings, statistics, or interpretations** that are not already present in the source material. Exception: you may add specific numbers from the data to replace vague language (e.g., replacing "significant increase" with the actual percentage), but you must not introduce analytical conclusions the author did not make.
- **Permitted structural additions** (exceptions to the above): The following types of new text are permitted because they are structural scaffolding, not new analysis. Each must be based solely on findings already present in existing figures, captions, and text — never on new analytical conclusions:
  - TL;DR blocks and Key Findings lists (Phases 5a, 5d)
  - Chapter Introductions and Summary/transition paragraphs (Phases 5a, 5d, 5h)
  - Transition sentences connecting chapters and cross-references (Phase 5h)
  - Section headings (Phases 5d, 5e, 6)
  - FAQ page answers — only using verified numbers already established in the chapters (Phase 9e)
- **Match existing codebase conventions** for the chart library, component patterns, data file format, and project structure. When uncertain, find an existing example in the codebase and replicate it. (Note: some phases below mandate specific improvements to color palettes, chart titles, and caption formats — those mandates override existing conventions where they conflict.)
- **Maintain the author's voice and academic tone** throughout all revisions. Target register: *Management Science*, *American Economic Review*, *Research Policy*.
- **Phases are sequential and cumulative.** Later phases must preserve all fixes from earlier phases. If a later phase's instruction appears to conflict with an earlier phase's completed work, the earlier phase's work takes precedence unless the later phase explicitly addresses that specific item.
- **Logging:** After completing each phase, append a summary to `AUDIT_LOG.md` listing: (a) all changes made with file paths, (b) all items flagged for author review, and (c) the reason for each flag or change. Each phase also produces its own dedicated deliverable log file as specified.
- **The primary audience** is researchers, policymakers, and industry professionals.

---

## BEFORE YOU BEGIN

Complete these setup steps in order before starting any phase.

1. **Install dependencies.** Identify the package manager (`package-lock.json` → `npm install`; `yarn.lock` → `yarn install`; `pnpm-lock.yaml` → `pnpm install`). Resolve any install errors before proceeding.

2. **Create `AUDIT_LOG.md`** in the project root. This file is the author's primary record of all changes and flagged items. It will be appended to throughout every phase.

3. **Explore the project structure.** Examine routing, content files, components, config, assets, and styles. Identify the tech stack (framework, styling library, deployment target). Read every page's source files to understand the content, structure, and naming conventions. Save a brief summary of the tech stack and project layout at the top of `AUDIT_LOG.md`.

4. **Map the data pipeline.** Before checking any displayed content, build an inventory:
   - Identify every `.json`, `.csv`, `.tsv` data file. For each: its purpose, which component(s) consume it, any generating script, and the source PatentsView table(s).
   - Identify every preprocessing script (Python, Node, shell). For each: inputs, outputs, and logic.
   - Identify inline data transformations in frontend code. Adjust the directory paths below to match the project structure identified in Step 3:
     ```bash
     grep -rn "\.filter\|\.map\|\.reduce\|\.sort\|\.slice\|Math\.\|toFixed\|parseInt\|parseFloat" \
       src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
     ```
   - Save this inventory to `DATA_AUDIT_INVENTORY.md`.

5. **Start the dev server** (e.g., `npm run dev`). If there are build errors that prevent the site from running, fix them immediately. Log any build fixes in `AUDIT_LOG.md`.

---

## PHASE 1: Bug Fixes and Baseline Verification

Get the site into a stable, error-free state before auditing content. All fixes in this phase go into `BUGFIX_LOG.md`.

### 1a. Console Errors

Open every page (home, about, explore, all chapters). Check for and fix:
- JavaScript runtime errors
- Failed network requests (404s for data files, images, fonts)
- React/framework warnings (missing keys, hydration mismatches, state updates on unmounted components)
- Empty or broken chart containers

Add null guards, fallback states, and defensive checks where needed.

### 1b. Hero Counters

The homepage hero section displays counters (e.g., "Patents," "Years," "Chapters," "Visualizations"). Verify:
- Do the counters render the correct values in the **static HTML source** (not just after JavaScript hydration)? Check the page source or SSR output. If they render as "0" or a placeholder in the HTML, fix immediately — search engines and AI crawlers will read the placeholder value.
- Are the values correct? Recount from the source data: total patents, year span, actual number of chapter routes, actual number of chart components rendered across all chapters. (Note: these values may change again in Phase 5d if chapters are split — they will be re-verified in Phase 10.)

### 1c. Links

- Every internal link resolves correctly (no 404s).
- All Previous/Next chapter links point to the correct chapter.
- External links (PatentsView, author email, personal site) open in new tabs with `target="_blank" rel="noopener noreferrer"`.

### 1d. Data Integrity (Quick Pass)

For every chart, verify in the source code:
- Renders with actual data (no empty charts, no `NaN`, no `undefined`, no `Infinity`, no `"null"` strings).
- Year ranges are correct (verify against the data files — expected range is approximately 1976–2025).
- No sudden drops to zero in non-terminal years (which would suggest missing data).

### 1e. Redundancy (Quick Pass)

- Remove unused data files (files not imported by any component).
- Remove unrendered components (components not referenced by any page or other component).
- Remove dead code (unreachable branches, commented-out blocks, unused imports).
- **Do not remove figures, sections, or text in this phase** — even if they appear redundant. Content removal requires the accuracy verification in Phase 2 and the structured evaluation in Phase 5c.

### 1f. Deliverable

`BUGFIX_LOG.md` — every bug found and fix applied.

---

## PHASE 2: Content Accuracy Audit

**This is the most critical phase.** Every displayed fact must be verifiably correct. Go through every page.

### 2a. Numerical Claims

For **every number** displayed anywhere on the site — in text, captions, annotations, key-finding boxes, hero stats — do the following:

1. Locate the data file that should source this number (use `DATA_AUDIT_INVENTORY.md` from setup).
2. Recompute the correct value from the data file.
3. Compare. If mismatch: **fix the text to match the data immediately.**
4. If the number cannot be verified against any source data file: flag it in `AUDIT_LOG.md` for the author. If it is a standalone claim with no data backing, mark it with an HTML comment `<!-- UNVERIFIED: [reason] -->` and flag it.

**High-priority items to verify:**
- Home page hero stats (patent count, years, chapters, visualizations)
- All "top N" rankings — re-rank from data, verify displayed order
- All growth multiples and growth rates — recompute: `(latest value) / (earliest value)`
- All specific years cited as inflection points — verify the data shows an actual inflection at that year
- All comparative claims ("X has more than Y," "A is the largest") — verify
- All percentages and shares — verify numerator, denominator, and that they sum correctly where applicable

### 2b. Takeaways, Captions, and Descriptions

- Read every takeaway, figure caption, section description, and summary statement.
- **Verify each claim against the actual data values in the source code.** The claim must be directly and precisely supported by the data or figure it references.
- **Revise overstated claims** to match the data precisely. For example, change "X dominates" to "X leads" if the margin is modest. Only fully remove a claim if it is outright false and cannot be revised.
- **Replace vague language with specific figures from the data** where available. For example, change "significant increase" to "a 23% increase from 2010 to 2020."
- Ensure captions describe exactly what the figure depicts — no more, no less.

### 2c. Trend and Causal Claims

For every claim about a trend, cause, or effect:

- **Overclaiming:** Does the text say "caused," "led to," "resulted in," "driven by," or "because of" when the data only shows correlation or temporal coincidence? If so, **replace immediately** with hedged language: "coincided with," "is consistent with," "occurred during the same period as," "may reflect."
- **Unsupported inflection claims:** If the text says "the 2008 recession caused a dip" but the data shows no dip at 2008, **remove the claim entirely.**
- **False or unsupported claims:** Anything not directly supported by the data must be (a) removed, (b) rewritten with appropriate qualification, or (c) supported by a citation to a published paper.

### 2d. Terminology Accuracy

Scan the entire site for the following terms. **Replace every instance.**

| Incorrect Usage | Correct Replacement |
|---|---|
| "American innovation" / "American inventors" / "American patents" | "US patents" / "inventors listed on US patents" / "patenting activity in the United States" |
| "Global innovation" (when referring to US patent data only) | "Innovation as reflected in US patent grants" or "US patenting" |
| "American ingenuity" / "American creativity" / "human ingenuity" | Remove entirely, or replace with "inventive activity reflected in the USPTO record" |
| "Patent powerhouse" / "Innovation giant" | "High-volume assignee" / "prolific patent filer" |
| "The world's most innovative companies" | "The assignees with the largest US patent portfolios" |
| "Tech giant" / "Industry leader" | "High-volume assignee" / name the company directly |
| "Innovation hub" (undefined) | "Region with high patent concentration" / "cluster of inventive activity" |

Also verify:
- Company names match PatentsView's disambiguated names. Display clean names (e.g., "IBM" not "INTERNATIONAL BUSINESS MACHINES CORPORATION"), but ensure the mapping is correct.
- Legal case names are correct in full (e.g., "Alice Corp. v. CLS Bank International (2014)" not "Alice Corp. v. CLS Bank (2013)").

### 2e. Paper References and Citations (General)

For every referenced academic paper or study **outside** the Patent Law & Policy chapter, apply these checks:

1. **Verify the paper exists.** Use web search to confirm the paper is real and that citation details (authors, year, title, journal) are correct.
   - If you **can** find the paper but some citation details are wrong, correct them.
   - If you **cannot** find the paper at all via web search, flag it in `AUDIT_LOG.md` for the author to verify manually. **Do not remove it.**
2. **Verify the site's summary is faithful to the paper's actual findings.** The summary must reflect what the paper actually concludes — not a loose paraphrase. If it overstates or mischaracterizes, revise it.
3. **Check relevance.** If the paper only tangentially relates to the claim it supports (e.g., it merely mentions the topic in passing or in a literature review rather than directly studying it), remove the citation and log the removal and reason.

### 2f. Paper References — Patent Law & Policy Chapter (Strict 7-Test Protocol)

> **Scope note:** This section applies a **stricter standard** than Phase 2e. The Patent Law & Policy chapter's credibility depends entirely on its citations being published, directly relevant, and accurately summarized. Phase 2e's lighter checks are insufficient here. If a paper appears in **both** the Patent Law chapter and another chapter, apply this section's 7-test protocol.

For **every** academic paper cited in the Patent Law & Policy chapter, apply **all seven tests** below. A paper must pass **every** test to remain.

**Test 1 — Existence.** Search for the paper's exact title on Google Scholar and the claimed journal's website. If no evidence the paper exists: **remove immediately** — it is likely a hallucinated citation.

**Test 2 — Publication Status.** Is the paper published in a peer-reviewed journal? If it exists only as a working paper (NBER, SSRN, CEPR, university series, conference proceedings, dissertation, or "forthcoming"): **remove**. Only published journal articles are acceptable. If a paper exists as both a working paper and a published journal article, cite **only** the published version.

**Test 3 — Publication Timing.** Was the paper published **after** the legal/policy change it is cited under? Use the reference dates table below. If the publication year is before the policy change year: **remove from under that policy change.**

Exception: A paper may be published in the same year as the policy change if it studies the announcement effect, legislative process, or pre-enactment anticipation — but this must be verified from the abstract.

**Test 4 — Direct Examination.** Read the paper's abstract (via journal website or Google Scholar). Does the paper's **primary research question** concern this specific legal/policy change? Does it use the policy change as an **identification strategy, natural experiment, or primary subject of empirical analysis**?

If the paper merely **mentions** the policy change in its literature review, introduction, or discussion section — but its primary research question is about something else: **remove from under that policy change.**

Common failure patterns:
- Paper about "patent quality" generally, cited under AIA, but does not study the AIA
- Paper about "patent trolls" cited under eBay, but does not study the eBay decision's impact
- Paper about "software patents" cited under Alice, but predates Alice or does not examine the decision
- Paper about "patent reform" broadly, cited under a specific Supreme Court case, but does not analyze that case
- Paper about patent systems in other countries cited under a US policy change

**Test 5 — Summary Accuracy.** Compare the chapter's summary of the paper to the paper's actual abstract. Check:
- **Research question:** Is it correctly stated?
- **Methodology:** Is it correctly described? Do not say "difference-in-differences" if the paper uses "event study" or "regression discontinuity."
- **Main finding — direction:** Does the summary say "increased" when the paper found "decreased"?
- **Main finding — magnitude:** Does the summary say "50% increase" when the paper found "25%"?
- **Hedging:** Never use "proves," "demonstrates conclusively," or "definitively shows." Use "finds," "provides evidence that," "estimates," "documents."

If inaccurate in **any** respect: **rewrite the summary based on the abstract.** Use this structure (2–4 sentences):
1. [Authors] ([Year]) [examine/study/analyze] [specific policy change], using [methodology] and [data].
2. They [find/document/estimate/provide evidence] that [main result with direction and, if available, magnitude].
3. [Optional: additional finding, important caveat, or mechanism.]

**Test 6 — Journal Hyperlink.** Every cited paper must include a hyperlink to the paper on the journal's own website (or a DOI link resolving to the journal site). Not Google Scholar, not SSRN, not a university repository. If no journal URL can be found, the publication claim is unverified: **remove the paper.**

**Test 7 — Consistent Formatting.** Every paper reference must follow this format:

```
[2–4 sentence summary following the structure above.]
— [Authors] ([Year]). "[Title]." *[Journal Name]*, [Vol]([Issue]), [Pages].
[DOI or journal URL]
```

Hyperlinks must use `target="_blank" rel="noopener noreferrer"`.

**Actions after applying all 7 tests:**
- Papers failing **any** test: remove and record the reason in `ACCURACY_AUDIT.md`.
- Papers passing all tests: keep, with corrected summary if needed.
- Policy changes with **zero remaining papers**: State explicitly in the chapter: "No empirical study of this decision's effects has been identified in a leading peer-reviewed journal." **Do not fill the gap with tangentially related papers.**
- If removing a paper disrupts the surrounding narrative, revise the text so it no longer depends on the removed citation.

**Reference Dates for Verification:**

| Policy Change | Date |
|---|---|
| Bayh-Dole Act | 1980 |
| Federal Courts Improvement Act (CAFC) | 1982 |
| Hatch-Waxman Act | 1984 |
| Uruguay Round / TRIPS | 1994 (effective 1995) |
| American Inventors Protection Act | 1999 |
| eBay v. MercExchange | May 15, 2006 |
| KSR v. Teleflex | April 30, 2007 |
| Bilski v. Kappos | June 28, 2010 |
| AIA enacted | September 16, 2011 |
| AIA IPR effective | September 16, 2012 |
| AIA first-to-file effective | March 16, 2013 |
| Mayo v. Prometheus | March 20, 2012 |
| Ass'n for Molecular Pathology v. Myriad Genetics | June 13, 2013 |
| Alice Corp. v. CLS Bank International | June 19, 2014 |
| TC Heartland v. Kraft Foods | May 22, 2017 |
| Oil States Energy Services v. Greene's Energy Group | April 24, 2018 |
| United States v. Arthrex | June 21, 2021 |

### 2g. Deliverable

`ACCURACY_AUDIT.md`:
- Every numerical claim checked (CORRECT / FIXED / REMOVED)
- Every trend/causal claim checked (ACCURATE / SOFTENED / REMOVED)
- Every paper reference checked — for Patent Law chapter, record all 7 test results and action taken
- Every terminology correction applied

---

## PHASE 3: Tone and Language

Review all text on every page — including text revised in Phase 2 — for formal, academic, professional register.

### 3a. Informal Language — Find and Replace

Search the entire codebase (all `.tsx`, `.ts`, `.jsx`, `.js`, `.md`, `.json` text content) for the following. **Replace every instance.**

| Remove | Replace With |
|---|---|
| "skyrocketed" / "exploded" / "took off" / "surged" / "soared" / "boomed" | "increased substantially" / "grew rapidly" / "[X]-fold increase" |
| "plummeted" / "tanked" / "cratered" / "nosedived" / "collapsed" | "declined sharply" / "decreased by [X]%" |
| "game-changer" / "groundbreaking" / "revolutionary" / "transformative" | Remove; describe what specifically changed |
| "stunning" / "remarkable" / "dramatic" / "staggering" / "breathtaking" / "eye-opening" | Remove the adjective; let the numbers speak |
| "the lion's share" / "the bulk of" / "a whopping" | "[X]% of" / "the majority ([X]%) of" |
| "a sea change" / "paradigm shift" / "watershed moment" | "a substantial structural change" |
| "no surprise" / "unsurprisingly" / "not surprisingly" / "as expected" | Remove; state the finding directly |
| "interestingly" / "it's worth noting" / "notably" / "strikingly" / "fascinatingly" | Remove filler; state the finding directly |
| "Let's look at" / "Let's explore" / "Let's dive in" / "Let's turn to" | Remove; present the analysis directly |
| "Here's the thing" / "The bottom line" / "At the end of the day" / "The takeaway" | Remove |
| "Think of it as" / "In other words" / "Simply put" / "To put it simply" | Remove or rephrase substantively |
| "you" / "your" (casual address to reader); "we" / "our" when used as casual address (not authorial "we") | Third person: "the data indicate," "this analysis reveals," or passive constructions. **Exception:** The authorial "we" (meaning "this study" or "the present analysis") is acceptable in academic register — do not replace it. Only replace "we" / "our" when it addresses the reader casually (e.g., "as we can see" → "the figure indicates"). |
| All contractions ("don't," "it's," "hasn't," "won't," "can't," "didn't") | Full forms ("do not," "it is," "has not," "will not," "cannot," "did not") |
| All exclamation marks | Remove (replace with a period) |
| Rhetorical questions in body text | Rewrite as declarative statements |
| "cutting-edge" / "state-of-the-art" / "next-generation" | Remove; describe the technology specifically |
| "a lot" / "tons of" / "huge" / "massive" | Use the actual number |
| "arguably" | Remove; either state the claim with evidence or do not make it |

### 3b. Hedging and Causation (Verification)

> **Scope note:** Phase 2c applied hedging corrections to all trend and causal claims. This step is a verification pass — confirm that Phase 2c's corrections survived intact, and catch any hedging issues in text that Phase 2c may have missed (e.g., text that was revised in Phase 2a/2b and inadvertently introduced new causal language).

- Verify all causal claims use hedged language per Phase 2c.
- Do not over-formalize to the point of stiffness. The text should be professional and accessible.

### 3c. Terminology Standardization

If the site alternates between terms that refer to the same concept (e.g., "patents" and "filings" when both mean the same thing), pick one and use it consistently. If the terms have distinct meanings, ensure they are used correctly throughout. Document all terminology decisions in `AUDIT_LOG.md`.

> **Scope note:** Phase 2d handled the specific terminology corrections table (e.g., "American innovation" → "US patents"). This section addresses any remaining inconsistencies not covered there.

### 3d. Chart Titles

Every chart title must be an **insight-oriented declarative sentence with a specific, verified number**:

| Wrong | Correct Pattern |
|---|---|
| "Patents Over Time" | "Annual US Patent Grants Grew from 70,226 in 1976 to [X] in 2024" |
| "Top Assignees" | "IBM Holds the Largest US Patent Portfolio with [X] Grants, 1976–2025" |
| "Technology Trends" | "Computing and Electronics Patents Grew from [X]% to [Y]% of Annual Grants" |
| "Gender Gap" | "Female Inventor Representation Rose from [X]% to [Y]% Between 1976 and 2024" |
| "Grant Lag" | "Median Time from Patent Application to Grant [Rose/Fell] from [X] to [Y] Months" |

**Verify every number in every title against the data before committing.** If a chart type does not lend itself to a single-number title (e.g., a network graph or a map), use a descriptive declarative sentence that states the chart's key structural finding.

### 3e. Chart Captions

Every chart must have a caption (using `<figcaption>` inside a `<figure>` element) following this structure:

1. **What the chart shows** (the data, axes, scope): "This figure presents annual US patent grant counts by CPC section, 1976–2025."
2. **The key pattern with a specific number**: "Computing-related classifications (CPC sections G and H) grew from [X]% to [Y]% of annual grants, while mechanical and chemical classifications declined from [A]% to [B]%."
3. **(Optional) Context or significance**: "This compositional shift is consistent with the broader transition of the US economy toward information-technology-intensive industries."

All in formal prose. No informal language. **Verify every number.**

### 3f. Executive Summaries vs. Key Findings — No Repetition

> **Scope note:** This section governs the *relationship* between Executive Summary/TL;DR blocks and Key Findings lists. Phase 5a governs *whether* these blocks exist (every chapter must have a TL;DR block). Apply this section's rules only to chapters that currently have both blocks. If a chapter is missing one or both, Phase 5a will address that — do not add blocks in this phase.

If a chapter currently contains both an "Executive Summary" (or "TL;DR" or "Overview") block and a "Key Findings" list, they must not repeat each other verbatim or near-verbatim. They must serve distinct purposes:

**Key Findings**: A concise list of the chapter's 3–5 most important empirical results, each stated as a single specific sentence with a number. Factual, precise, and self-contained.

**Executive Summary / TL;DR**: A 2–4 sentence narrative paragraph that synthesizes the key findings into a coherent story, adds interpretive context, and connects the chapter's contribution to the site's broader argument. It must **paraphrase** the findings (never copy them word-for-word) and **add detail** that the bullet points omit — such as significance, cross-chapter connections, or methodology.

**Rules:**
- If a chapter's Executive Summary is merely the Key Findings reworded with minor phrasing changes, **rewrite the Executive Summary** to add interpretive synthesis and contextual framing.
- No sentence should appear in both blocks in the same or substantially similar form.
- The Executive Summary must be readable as a standalone paragraph that a journalist, policymaker, or AI system could extract and cite.
- The Key Findings must be scannable as a quick-reference list.

### 3g. Deliverable

`TONE_AUDIT.md` — every informal expression found, its location, and its replacement.

---

## PHASE 4: Visualization Quality

Review every figure, chart, and graph in the source code.

> **Scope note:** Figure caption and title *content* was handled in Phases 2b and 3d–3e. This phase focuses on visual quality, layout, behavior, and responsiveness.

### 4a. Legends

- **No legend overlap.** At any viewport width, if a legend overlaps chart data, axis labels, or captions, reposition it (e.g., move it below the chart). On mobile, legends should always be below the chart.
- **Meaningful legend order.** Follow this table:

  | Chart Type | Required Legend Order |
  |---|---|
  | Line chart (top-N series) | By value at the most recent data point (descending) |
  | Stacked area / stacked bar | Match stacking order: bottom-to-top in chart = first-to-last in legend |
  | Grouped bar chart | By total value (descending) |
  | Pie / donut | By slice size (descending) |
  | Scatter with categories | By category total (descending) or meaningful grouping |

  If the current order is alphabetical or random: re-sort.

- **Direct labels where possible.** For line charts with 3 or fewer series: replace the legend entirely with direct end-of-line labels (the series name placed at the rightmost data point).

### 4b. Axis Labels

- **No unnecessary decimals.** Follow this table:

  | Data Type | Format | Not |
  |---|---|---|
  | Years | `2000` | `2000.0`, `2,000` |
  | Patent counts | `150,000` or `150K` | `150000`, `150,000.00` |
  | Percentages | `45%` or `45.2%` | `45.2384%`, `0.452` |
  | Ratios / indices | `1.3` | `1.342857` |
  | Citation counts | `12` | `12.0` |

- Use thousands separators for numbers ≥ 1,000.
- Year axes: whole years only, tick every 5 or 10 years. Always include the first and last year as ticks.
- Abbreviated scales: `0, 100K, 200K, 300K` — not `0, 100000, 200000`.
- Y-axis on bar charts must start at zero.
- Axes must include units where applicable (e.g., "Patents (thousands)" not just "Patents").
- Labels and tick marks must be fully readable — not truncated, overlapping, or cut off at any viewport width.

### 4c. Color and Visual Clarity

- **Single colorblind-safe palette** across the entire site (Okabe-Ito or ColorBrewer qualitative). If the site already uses a different accessible palette consistently, that is acceptable — but ensure it is applied uniformly.
- **The same entity is always the same color** everywhere (e.g., IBM is always the same blue in every chapter).
- No red vs. green as sole distinguisher.
- Minimum 4.5:1 contrast for normal-sized text on charts; 3:1 for large text (≥18px or ≥14px bold) per WCAG AA.
- Sequential scale for unipolar data (counts, citations); diverging scale for bipolar data (growth rates, deviations from mean). Never rainbow.
- Remove chartjunk: unnecessary gridlines, borders, background shading, 3D effects, or decorative elements.
- Prefer direct labels over legends where possible.
- Grid lines, if kept, should be subtle (`stroke: #f0f0f0` or similar).

### 4d. Chart-Type-Specific Guidelines

**Line charts:**
- 3 or fewer lines: Direct end-of-line labels, no legend.
- 4–6 lines: Compact legend below chart.
- 7+ lines: Switch to small multiples (one mini-chart per series, shared x/y scales) or add an interactive series toggle. Never display 7+ overlapping lines simultaneously.
- Stroke width: 2px primary, 1.5px secondary.
- On hover: bold the hovered line, fade others to 20% opacity.
- Missing data: show a gap in the line, not a drop to zero.

**Bar charts:**
- Sort by value (descending) unless the x-axis is inherently ordered (years, ranks).
- Use horizontal bars for long labels (company names, technology areas, country names).
- Label bars directly with values if 15 or fewer bars.
- No 3D effects.

**Stacked charts:**
- Consistent stacking order across time. Most important category at bottom.
- Legend order matches stacking order.
- Limit to 5–7 categories. Group smallest into "Other" (colored gray).

**Maps:**
- Albers USA projection for US maps.
- **Normalize where appropriate:** If the map shows raw patent counts and the pattern simply mirrors population, note this limitation in the caption or, if feasible, add a per-capita toggle. Do not change the data the author chose to display without flagging it.
- Include labeled color legend with endpoints.
- Tooltip on hover showing exact values.

**Scatter plots:**
- Label the 5–10 most notable outliers directly on the chart.
- Include reference lines where appropriate (means as dashed crosshairs, regression/LOESS trend line if showing a relationship).
- Bubble-size legend if bubble size encodes a variable.
- If 500+ overlapping points: use transparency (alpha 0.3–0.5) or hexbin aggregation.

**Heatmaps:**
- Sort rows and columns by a meaningful metric (total value descending), not alphabetically.
- Limit to 20 or fewer rows. Aggregate if more.
- Label the color scale with exact endpoint values.
- Value labels inside cells if 100 or fewer cells.

**Network graphs:**
- Size nodes by degree or a meaningful metric.
- Label all visible nodes without overlapping labels.
- Directional edges (arrows) for citation networks.
- Zoom and pan for more than 15 nodes.

### 4e. Tooltips

- Present on every chart, with consistent styling site-wide.
- Show exact value with thousands separators, series name, and x-axis value.
- Never overflow viewport edges.
- On mobile: consider a fixed tooltip bar instead of floating.

### 4f. Reference Lines

- On firm-level charts **where a meaningful system-wide baseline exists**: include the system-wide average (or median) as a dashed gray line for context. For example, on a chart of top assignees' patent counts, a dashed line showing the mean across all assignees provides scale. **Do not add reference lines where the "average" is meaningless** (e.g., on a stacked composition chart, a network graph, or a heatmap).
- On scatter plots: dashed crosshairs at the mean of x and mean of y where appropriate.

### 4g. Chart Container and Responsiveness

- Explicit `height` or `aspect-ratio` on every chart container (prevents CLS).
- Minimum font size on charts: 11px (mobile), 12px (desktop).
- Touch targets ≥ 44px on mobile.
- Charts should be full content width, capped at approximately 960px on very wide screens.
- Consistent vertical spacing: ≥ 48px between charts, 12–16px between chart and caption.
- Verify figures render without overflow, cropping, or overlap at desktop (~1440px), tablet (~768px), and mobile (~375px).

### 4h. Deliverable

`VISUALIZATION_AUDIT.md` — every chart, issues found, and fixes applied.

---

## PHASE 5: Content Organization and Flow

Review the structure of the entire site for logical progression. **Preserve all fixes from Phases 1–4.**

### 5a. Within-Chapter Structure

Every chapter should follow this internal progression:

1. **TL;DR block** (2–3 sentences): The chapter's most important findings with specific numbers. Visually distinct (e.g., a callout box or blockquote). This is the single most valuable element for AI crawlers. If the chapter also has a separate "Key Findings" list, the TL;DR must **paraphrase and synthesize** — not repeat — those findings (per Phase 3f).
2. **Introduction** (2–3 paragraphs): Frame the chapter's scope, questions, and connection to previous chapters.
3. **Broadest overview figure** (e.g., total over time, overall composition).
4. **Primary decomposition** (by the most important dimension — technology, assignee, inventor, geography).
5. **Secondary decompositions and comparisons.**
6. **Analytical deep dives** (networks, indices, correlations, firm-level profiles).
7. **Summary and forward transition** (1 paragraph): Summarize the chapter's 2–3 main findings, then introduce the next chapter's topic in 1–2 sentences.

**If any chapter in ACTs 1–4 currently has complex analyses before simple overviews: reorder now following the structure above.** For ACT 5, do not reorder figures in this step — Phase 5e provides a dedicated, more detailed reordering procedure for ACT 5 chapters. However, verify that ACT 5 chapters have the required TL;DR block (item 1), Introduction (item 2), and Summary (item 7); add any that are missing.

> **Note:** Per the "Permitted structural additions" in General Guidelines, writing new TL;DR blocks, Introductions, and Summary paragraphs for chapters that lack them is permitted. Every number must be verified against the data. Introductions must frame existing content, not introduce new findings.

### 5b. Within-Section Figure Order (ACTs 1–4)

> **Scope:** This section applies to ACTs 1–4 only. ACT 5 figure ordering is handled entirely by Phase 5e.

Figures within each section must progress from broadest to most detailed. If a detailed decomposition appears before its overview: swap them.

### 5c. Remove Uninsightful Figures

A figure should be **removed** if it meets any of these criteria:

1. **No key takeaway:** The only possible caption restates the axis labels with no analytical insight.
2. **Redundant:** The same information exists in a better figure elsewhere on the site.
3. **Trivially obvious:** Confirms something requiring no data (e.g., "more recent years have more patents" shown as a simple rising line with no annotations or decomposition).
4. **Uninterpretable:** Too complex or cluttered to convey any message, and was not fixable in Phase 4.
5. **Insufficient data:** Only 2–3 data points; better stated as a sentence.

For each removed figure: if the underlying finding is still important, incorporate it as a specific number in the text. Log every removal with reasoning in `REORGANIZATION_LOG.md`.

### 5d. Chapter Size Audit and Splitting (ACTs 1–4 Only)

> **Scope:** This section applies to ACTs 1 through 4 only. **Do not apply to ACT 5.** ACT 5 has its own analytical structure and should not be split.

Each chapter in ACTs 1–4 must contain **between 3 and 5 figures or tables in total** (after any removals from Phase 5c). This constraint ensures chapters are focused and digestible. Apply the following procedure to every chapter in ACTs 1–4:

**Step 1 — Count.** Count the total number of figures and tables in the chapter. If the chapter has 3–5: no action needed — skip to the next chapter. If the chapter has fewer than 3: flag it in `AUDIT_LOG.md` as "FLAGGED FOR AUTHOR REVIEW: [Chapter Title] has only [N] figures — consider whether additional analysis is warranted." Do not add figures yourself. If the chapter has **more than 5**: proceed to Step 2.

**Step 2 — Categorize every figure.** For each figure in the oversized chapter, record three attributes in `REORGANIZATION_LOG.md`:

| Attribute | Definition | Example Values |
|---|---|---|
| **Level of analysis** | What unit does the figure analyze? | Patent-level, firm-level (assignee-level), inventor-level, network-level, technology-class-level, geographic-level |
| **Dependent variable** | What outcome is on the y-axis (or is the primary measure)? | Grant counts, citation counts, share of total, growth rate, concentration index, Gini coefficient, collaboration frequency, exploration share, mobility rate, time lag |
| **Temporal scope** | Is this a snapshot or a trend? | Cross-sectional (single year or period), longitudinal (trend over time) |

Example categorization:

```
## Chapter: [Original Chapter Title] — Figure Inventory

| # | Figure Title | Level | Dependent | Temporal |
|---|---|---|---|---|
| 1 | "Annual Patent Grants, 1976–2024" | Patent | Grant counts | Longitudinal |
| 2 | "Top 10 Assignees by Total Grants" | Firm | Grant counts | Cross-sectional |
| 3 | "Assignee Share of Annual Grants Over Time" | Firm | Share of total | Longitudinal |
| 4 | "Inventor Team Size Distribution" | Inventor | Team size | Cross-sectional |
| 5 | "Solo vs. Team Inventions Over Time" | Inventor | Collaboration freq. | Longitudinal |
| 6 | "Citation Concentration Among Top Filers" | Firm | Citation Gini | Longitudinal |
| 7 | "Co-Invention Network, 2020" | Network | Collaboration freq. | Cross-sectional |
```

**Step 3 — Identify split boundaries.** Group figures into clusters of 3–5 using these splitting priorities (apply in order until each group has 3–5 figures):

1. **Split by level of analysis.** If the chapter contains figures at multiple levels (e.g., 3 firm-level + 4 inventor-level), this is the cleanest split. Each group becomes a chapter focused on one level.
2. **Split by dependent variable.** If all figures share the same level of analysis, split by the outcome they measure (e.g., "counts and volumes" vs. "quality and impact" vs. "concentration and inequality").
3. **Split by temporal scope.** If both of the above produce unbalanced groups, separate cross-sectional snapshots from longitudinal trends.

Each resulting group must contain 3–5 figures. If a split produces a group with fewer than 3 or more than 5, adjust the grouping. If no valid 3–5 grouping is possible after trying all three criteria (e.g., all 6 figures share the same level, dependent variable, and temporal scope), keep the chapter intact and flag it in `AUDIT_LOG.md` as "FLAGGED FOR AUTHOR REVIEW: [Chapter Title] has [N] figures but cannot be cleanly split into 3–5 figure groups. Author should decide whether to split or keep as-is." Log the final grouping decision and rationale in `REORGANIZATION_LOG.md`.

**Step 4 — Create new chapters.** For each group that becomes a new chapter:

> **Note:** Per the "Permitted structural additions" in General Guidelines, creating TL;DR blocks, Introductions, Summaries, and transition sentences for newly split chapters is permitted. They must not introduce new analytical claims — only frame, summarize, and connect findings already present in the existing figure text and captions.

1. **Create the route and page file.** Follow the project's existing file structure and naming conventions exactly. Examine how existing chapters are defined (route file, component file, data imports, layout wrapper) and replicate that structure.
2. **Choose a working chapter title** that reflects the group's shared focus (e.g., if the original chapter was "Patent Assignees" and the split produces a firm-level group and an inventor-level group, the new chapters might be titled "Assignee Patenting Patterns" and "Inventor Collaboration and Mobility"). These are provisional — Phase 6 will refine all titles.
3. **Write a TL;DR block** (2–3 sentences) for each new chapter, following the structure in Phase 5a. Every number must be verified against the data.
4. **Write an Introduction** (2–3 paragraphs) for each new chapter. The first new chapter in the sequence should inherit and adapt the original chapter's introduction. Subsequent chapters should open by connecting to the preceding new chapter (e.g., "The previous chapter documented aggregate patenting trends among top assignees. This chapter shifts focus to the individual inventors behind those patents.").
5. **Write a Summary and forward transition** (1 paragraph) for each new chapter, per Phase 5a.
6. **Move figures** into their assigned chapters, preserving their existing titles, captions, and accompanying text. Do not rewrite figure content — that was handled in Phases 2–3.
7. **Preserve the original chapter's ACT membership.** New chapters created from a split must remain within the same ACT as the original chapter.

**Step 5 — Register new chapters.** Add each new chapter to:
- The chapter configuration file (or equivalent routing config)
- The navigation sidebar / chapter list
- The previous/next chapter link chain (the new chapters replace the original in sequence)
- The home page chapter cards (if applicable)
- The homepage hero counter for "Chapters" (update the count to reflect the new total)

This registration is preliminary — Phase 6 (Titles) and Phase 7 (Navigation) will refine titles and verify all navigation. But the structure must be in place for those phases to work.

**Step 6 — Remove the original chapter.** Once all figures and text have been distributed to new chapters, delete the original oversized chapter's route and page file. Verify that no internal links still point to the old route — if any do, update them to point to the most relevant new chapter. Add a redirect from the old URL to the first new chapter's URL.

Log every split in `REORGANIZATION_LOG.md` with this structure:

```
## CHAPTER SPLIT: [Original Chapter Title]
- **Figure count (before):** [N]
- **Reason for split:** Exceeded 5-figure limit
- **Split criterion:** [Level of analysis / Dependent variable / Temporal scope]
- **New chapters created:**
  1. [New Chapter Title] — figures: [list] — [N] figures
  2. [New Chapter Title] — figures: [list] — [N] figures
- **Redirect:** [old URL] → [new URL]
```

### 5e. Within-Chapter Reordering and Restructuring (ACT 5 Only)

> **Scope:** This section applies to ACT 5 only. **Do not apply to ACTs 1–4.** ACTs 1–4 are handled by the splitting procedure in Phase 5d. ACT 5 chapters are not split; they are reordered and restructured in place.

ACT 5 chapters contain firm-level and individual-level analyses that may have accumulated figures in an ad hoc order. This section establishes a consistent internal logic for every ACT 5 chapter by categorizing figures, determining the optimal flow, restructuring the chapter around that flow, and then applying the same ordering logic uniformly across all ACT 5 chapters.

**Do this for the first ACT 5 chapter before moving to the others.** The first chapter serves as the prototype whose ordering logic is then replicated.

#### Step 1 — Select the prototype chapter.

Choose the ACT 5 chapter with the **most figures.** It provides the richest material for establishing the ordering pattern. If two chapters are tied, choose the one that spans the most levels of analysis.

#### Step 2 — Inventory all figures and tables.

For the prototype chapter, list every figure and table in its current order in `REORGANIZATION_LOG.md`:

```
## ACT 5 RESTRUCTURING: [Chapter Title] (PROTOTYPE)

### Current Figure Order
| # | Current Position | Figure Title |
|---|---|---|
| 1 | 1st | "[title]" |
| 2 | 2nd | "[title]" |
| ... | ... | ... |
```

#### Step 3 — Categorize every figure.

For each figure, record three attributes (using the same schema as Phase 5d):

| Attribute | Definition | Example Values |
|---|---|---|
| **Level of analysis** | What unit does the figure analyze? | Patent-level, firm-level (assignee-level), inventor-level, network-level, technology-class-level, geographic-level |
| **Dependent variable** | What outcome is on the y-axis or primary measure? | Grant counts, citation counts, share of total, growth rate, concentration index, Gini coefficient, collaboration frequency, exploration share, mobility rate, time lag |
| **Temporal scope** | Is this a snapshot or a trend? | Cross-sectional (single year or period), longitudinal (trend over time) |

```
### Figure Categorization
| # | Figure Title | Level | Dependent | Temporal |
|---|---|---|---|---|
| 1 | "[title]" | Firm | Exploration share | Longitudinal |
| 2 | "[title]" | Firm | Citation Gini | Longitudinal |
| ... | ... | ... | ... | ... |
```

#### Step 4 — Determine the optimal flow.

Using the categorization table, determine the logical reading order. Apply these ordering principles in the following priority:

1. **Level of analysis — broad to narrow.** Figures analyzing aggregate or system-level patterns come first, followed by firm-level, then inventor-level, then geography-level, then network-level. Within each level, the reader should understand the forest before the trees.

2. **Within each level — overview before decomposition.** Place figures that show the overall distribution or trend first, then figures that decompose or drill into subgroups. For example: "Distribution of exploration scores across all firms" should precede "Exploration scores for the top 20 firms individually."

3. **Within each level — generally cross-sectional before longitudinal.** As a default, establish what the current state looks like (or what the aggregate snapshot looks like) before showing how it has changed over time. For example: "Top 10 firms by citation count" should precede "Citation trends among top 10 firms, 1976–2024." **Exception:** If the longitudinal trend provides essential context for interpreting the cross-section (e.g., a long-term growth trend that explains why the current snapshot looks the way it does), place the longitudinal figure first. Log the exception and rationale.

4. **Dependent variables — group related outcomes.** Figures measuring related outcomes should be adjacent. For example, all figures about citation concentration should appear together, not interleaved with figures about technological exploration. The sequence of dependent-variable groups should move from simpler metrics (counts, shares) to more complex or derived metrics (indices, Gini coefficients, network measures).

Record the proposed new order and the rationale in `REORGANIZATION_LOG.md`:

```
### Proposed New Order
| New # | Figure Title | Level | Dependent | Temporal | Rationale for Position |
|---|---|---|---|---|---|
| 1 | "[title]" | Firm | Grant counts | Cross-sectional | System-level overview; establishes the population |
| 2 | "[title]" | Firm | Grant counts | Longitudinal | Same metric, now showing change over time |
| ... | ... | ... | ... | ... | ... |
```

#### Step 5 — Restructure the prototype chapter.

Reorder the figures in the source code to match the proposed new order. Then restructure the surrounding content:

1. **Move each figure's accompanying text with it.** If a paragraph or set of paragraphs specifically discusses a figure, they must move together. Do not leave orphaned commentary that references a figure now located elsewhere in the chapter.

2. **Revise transition sentences.** After reordering, the sentences that connect one section to the next will be wrong (e.g., "Building on the trends shown above..." may now reference a figure that is no longer above). Rewrite every transition sentence so it correctly references what precedes and follows it in the new order.

3. **Revise the Introduction** if it previews the chapter's sections in a specific order. Update the preview to match the new flow.

4. **Revise the TL;DR / Executive Summary** only if the reordering changes which findings are most prominent. If the same findings remain the most important, do not change the TL;DR.

5. **Revise section headings** if the chapter uses section headings that group figures. The headings must reflect the new grouping (e.g., if figures are now grouped by level of analysis, the section headings should reflect that: "Firm-Level Patenting Patterns," "Inventor-Level Collaboration and Mobility").

6. **Revise the Summary and forward transition** if the reordering changes the chapter's concluding emphasis.

**Content constraints when revising descriptions:**
- **Do not change any figure's title or data.** Those were finalized in Phases 2–4.
- **Captions:** Do not change the factual content of any caption. However, if a caption contains a positional reference that is now incorrect (e.g., "as shown in the figure above" when the referenced figure is now below), update the reference to point correctly. Log each such change.
- **Do not introduce new analytical claims.** Revised descriptions must convey the same findings as before, reframed to fit the new flow.
- **Maintain the author's academic tone** (per Phase 3).
- **Every revised sentence must be directly supported by the data in the figure it references.** Do not add interpretive claims that go beyond what the figure shows.

#### Step 6 — Extract the ordering template.

From the prototype chapter, extract the abstract ordering logic as a reusable template. Record it in `REORGANIZATION_LOG.md`:

```
### ACT 5 ORDERING TEMPLATE (derived from [Prototype Chapter Title])

The standard internal flow for ACT 5 chapters is:

1. [Level]: [Dependent variable group] — [Temporal scope]
   Purpose: [what this position establishes for the reader]
2. [Level]: [Dependent variable group] — [Temporal scope]
   Purpose: [what this position adds]
3. ...

Ordering principles applied:
- [Principle 1 from Step 4 that was most important for this ACT]
- [Principle 2]
- ...
```

This template captures the *logic*, not the specific figures. For example: "Begin with a firm-level cross-sectional overview, then firm-level longitudinal trends, then inventor-level patterns, then geography-level variations, then network-level structure" — not "begin with Figure 3, then Figure 1."

#### Step 7 — Apply the template to all remaining ACT 5 chapters.

If ACT 5 has only one chapter, skip this step — the prototype chapter is already restructured.

For each remaining chapter in ACT 5, repeat Steps 2–5 using the ordering template from Step 6 as the guide. Specifically:

1. **Inventory and categorize** the chapter's figures (Steps 2–3).
2. **Apply the template.** Map the chapter's figures onto the template's structure. Not every chapter will have figures at every level or for every dependent variable — the template defines the *sequence* in which levels and metrics appear, and each chapter uses whichever subset applies.
3. **Reorder and restructure** (Step 5), following the same content constraints.

If a chapter's content does not fit the template cleanly (e.g., it contains a level of analysis that no other ACT 5 chapter has), adapt the template for that chapter and log the adaptation and rationale. Do not force a chapter into a structure that makes it less readable.

Log each chapter's restructuring in `REORGANIZATION_LOG.md` with this structure:

```
## ACT 5 RESTRUCTURING: [Chapter Title]
- **Template applied:** [Prototype Chapter Title] ordering template
- **Figures reordered:** [Yes/No]
  - Previous order: [list by title]
  - New order: [list by title]
- **Sections restructured:** [Yes/No — list changes]
- **Transitions rewritten:** [count]
- **Adaptations from template:** [None / describe]
```

### 5f. Across Pages Within Each ACT

- Pages within an ACT should build on each other in a coherent sequence.
- Reorder pages within an ACT if a different sequence would be more logical. Log any reordering with rationale.
- **Consolidate duplicates.** If substantially similar content appears on multiple pages, consolidate it in the most logical location. Replace the duplicate with a brief cross-reference (e.g., "See [Chapter Title] for details on..."). Log every consolidation.

### 5g. Across ACTs

- Verify the ACT sequence provides a logical narrative arc.
- After any reordering, ensure all cross-references between ACTs point to the correct pages/sections.
- No section or figure should appear in more than one chapter.

### 5h. Cross-References

- Add 1–2 sentence transitions at each chapter's end linking to the next chapter's topic.
- Add backward references in later chapters where they build on earlier findings (e.g., "As documented in [Chapter Title], computing patents grew from [X]% to [Y]% of grants; this section examines the quality of those patents").
- Use chapter titles in cross-references, not chapter numbers (numbers may change if chapters are reordered).

### 5i. Deliverable

`REORGANIZATION_LOG.md` — previous order, new order, all changes, figures removed with reasons, all chapter splits (ACTs 1–4) with categorization tables, and all ACT 5 chapter restructurings with the ordering template and per-chapter logs.

---

## PHASE 6: Titles

> **Note:** If Phase 5d created new chapters from splits, those chapters have provisional working titles. This phase must assign proper titles to all new chapters using the same conventions applied to existing chapters.

### 6a. Audit All Existing Titles

Build a complete inventory in a new file called `TITLE_REVISIONS.md` with the following structure:

```
## ACT 1: [Current ACT Title]
### Chapter: [Current Chapter Title]
- Section: [Current Section Title] — [Assessment]
- Section: [Current Section Title] — [Assessment]
...
```

For each title, assign one of these assessments:

- **Vague or generic:** Could apply to almost anything (e.g., "Overview," "Results").
- **Inconsistent format:** Different grammatical pattern, length, or style than its peers at the same level.
- **Missing key information:** Does not mention the specific subject, metric, or finding.
- **Redundant with parent:** Restates its parent title without adding specificity.
- **Inconsistent terminology:** Uses a different term than other titles for the same concept.
- **OK — no change needed.**

### 6b. Define Naming Conventions

Before proposing any new titles, establish explicit conventions for each level by examining the best existing titles. Log the conventions in `TITLE_REVISIONS.md` under a "NAMING CONVENTIONS" section.

**ACT Titles:** Grammatical structure, approximate length (2–4 words), and tone. Derive from existing ACT titles.

**Chapter Titles:** Concise (2–5 words). Clearly identify the chapter's subject. Consistent grammatical structure. Derive from the dominant existing pattern.

**Section Titles:** Specific enough that a reader knows what the section covers without reading the body text. Prefer finding-driven or topic-driven titles (e.g., "Top 10 Assignees Hold 12% of All Patents" over "Top Assignees"). Introductory or transitional sections may use short descriptive titles. Aim for 4–10 words. Consistent grammatical structure within each chapter.

### 6c. Propose New Titles

For every title flagged with a problem in 6a, propose a new title that follows the conventions from 6b, resolves the flagged problem(s), and accurately describes the content. Log each proposed change in `TITLE_REVISIONS.md`. **Do not change titles marked "OK."**

Before implementing, review the full list and check for: internal consistency with conventions, distinctiveness (no two same-level titles too similar), and accuracy.

### 6d. Implement Title Changes

Apply all proposed changes. For each changed title, update it in **every location** where it appears:

**ACT titles:** Navigation sidebar, table of contents, ACT landing/index pages, config files, page headers, breadcrumbs, cross-references on other pages.

**Chapter titles:** All the same locations as ACT titles, plus: `<title>` tag, meta descriptions (`og:title`, `og:description`), previous/next link labels on adjacent chapters, and URL slugs **only if** the current slug matches the old title. If you change a slug: add a redirect from the old URL to the new URL (using the project's existing redirect mechanism) and update all internal links to the old URL.

**Section titles:** The section heading, any anchor IDs derived from the title, all internal links targeting that anchor (search the full codebase), and any in-page navigation menus. If you change an anchor ID, keep the old anchor ID as a hidden element so external links still resolve.

### 6e. Terminology Standardization Pass

After all titles are updated, do a final pass across the entire site — titles, body text, captions, and takeaways — to standardize the key terms chosen in 6b/6c. **This pass is limited to terminology alignment only. Do not rewrite body text for other reasons.**

> **Scope note:** Phase 3c already performed an initial terminology standardization. This pass verifies that Phase 3c's decisions are still applied consistently after all the title changes in this phase, and catches any new inconsistencies introduced by the new titles.

### 6f. Deliverable

`TITLE_REVISIONS.md` — full title inventory with assessments, naming conventions, all proposed changes, and terminology standardization decisions.

---

## PHASE 7: Navigation

Verify and improve all navigation elements after changes made in Phases 1–6. **If Phase 5d created new chapters from splits, this phase must fully integrate them:** navigation sidebar, previous/next links, home page chapter cards, breadcrumbs, table of contents, and reading progress bars.

### 7a. Site-Wide Navigation

- **Sticky header** that remains visible on scroll, including: PatentWorld logo/home link, chapter list (dropdown or expandable), About link.
- Current chapter visually highlighted in the navigation (bold, underline, or accent color).
- On mobile: hamburger menu with full chapter list.

### 7b. Chapter Navigation

- **Previous / Next chapter links** at the bottom of every chapter, showing chapter titles (not just arrows or the words "Previous" / "Next").
- **Chapter table of contents:** At the top of each chapter (or as a sticky sidebar on desktop), list all sections as clickable anchor links.
- **"Back to top" button:** Floating button appearing after the reader scrolls past the first section.

### 7c. Home Page

- Chapter cards in the same order as the navigation (matching the final chapter order established by Phases 5d–5f, including any new chapters from splits).
- Each card displays a specific finding with a number — not a generic question or vague description.
- "Start Reading" links to the first chapter.

### 7d. Reading Progress

- **Progress bar** at the top of each chapter page (a thin horizontal bar showing scroll position).

### 7e. Link Verification

- **Test every internal link site-wide.** Use a script or automated check (e.g., grep for all internal `href` values and verify each resolves to a valid route). Fix any broken links (404s).
- Sidebar, table of contents, and all navigation menus must accurately reflect the current page order, titles, and ACT structure.
- Breadcrumbs must be present and correct on every page.
- Previous/next page links must follow the correct sequence with correct labels.
- Test all navigation elements at mobile viewport widths.
- For long pages, verify that anchor links exist and work correctly.

### 7f. Accessibility

- Skip-to-content link (hidden until focused via keyboard).
- Heading hierarchy: exactly one `<h1>` per page, then `<h2>`, `<h3>` — no skipped levels.
- All interactive elements keyboard-navigable with visible focus indicators.
- All images and figures have descriptive `alt` text (not just "figure" or "chart"). For chart images, the `alt` text should state the chart's key finding.
- ARIA labels on chart containers describing the chart's key finding.
- WCAG AA color contrast ratios (4.5:1 for normal text, 3:1 for large text).

### 7g. Deliverable

`NAVIGATION_LOG.md` — all changes made.

---

## PHASE 8: About the Author

### 8a. Author Bio

Replace the current "About the Author" content with the following text exactly:

> Saerom (Ronnie) Lee is an Assistant Professor of Management at The Wharton School, University of Pennsylvania. His research examines organizational design, human capital acquisition, startup scaling, and high-growth entrepreneurship. Additional information is available on his personal website. Correspondence: saeroms@upenn.edu. Feedback, collaboration inquiries, and suggestions are welcome.

Apply the following hyperlinks:
- Link the text **"Saerom (Ronnie) Lee"** to `https://www.saeromlee.com`
- Link the text **"personal website"** to `https://www.saeromlee.com`

### 8b. Methodology Section

The About page should include a methodology section written as an academic data appendix: data source, version, coverage, key definitions, and limitations. If such a section already exists, verify its accuracy and tone. If it does not exist, flag it in `AUDIT_LOG.md` as "RECOMMENDED: Add methodology section" — do not fabricate methodology details.

### 8c. Suggested Citation

Add a suggested citation block (if not already present):

```
Lee, Saerom (Ronnie). 2025. "PatentWorld: 50 Years of US Patent Data."
The Wharton School, University of Pennsylvania.
Available at: https://patentworld.vercel.app/
```

### 8d. Explore the Chapters

Group the chapters into their respective ACT (if not already present)

### 8e. Deliverable

Log all changes to the About page in `AUDIT_LOG.md` under a "Phase 8: About the Author" heading. No separate log file is needed for this phase.

---

## PHASE 9: SEO, GenAI Optimization, and Performance

> **Note:** If Phase 5d created new chapters from splits, every new chapter must receive all of the SEO treatment below: unique `<title>`, `<meta>` description, canonical URL, Open Graph tags, structured data, and sitemap entry.

### 9a. Meta Tags (Every Page)

- **`<title>`**: Unique, 60 characters or fewer, specific. Format: `[Insight or Topic] | PatentWorld`.
- **`<meta name="description">`**: Unique, 160 characters or fewer, with specific numbers where possible.
- **`<link rel="canonical">`** on every page. Consistent URL format (choose trailing slash or no trailing slash, apply uniformly).
- **`<meta name="robots" content="index, follow">`** on all content pages.

### 9b. Open Graph and Social Cards

- `og:title`, `og:description`, `og:image`, `og:url`, `og:type` on every page.
- `twitter:card` = `summary_large_image`.
- If OG images do not exist, flag in `AUDIT_LOG.md` as "RECOMMENDED: Create OG images (1200×630px) per chapter." Do not generate placeholder images.

### 9c. Structured Data (JSON-LD)

- Home page: `WebSite` schema.
- Each chapter: `Article` or `ScholarlyArticle` schema (author, datePublished, dateModified, headline, description).
- About page: `Dataset` schema if methodology data is described.
- `BreadcrumbList` on all pages.

### 9d. Sitemap and Robots

Create or update `sitemap.xml` listing every page with `<lastmod>`.

Create or update `robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://patentworld.vercel.app/sitemap.xml

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /
```

> **Author decision required:** The `robots.txt` above allows AI training bots (GPTBot, Google-Extended, CCBot) to crawl the site, which increases discoverability in AI systems. If the author prefers to block AI training crawlers while keeping the site visible to AI search engines, change `Google-Extended` and `CCBot` to `Disallow: /`. Log this in `AUDIT_LOG.md` as "ACTION REQUIRED BY AUTHOR: Review robots.txt AI bot policy."

> **Manual step (flag for author):** After deployment, the author should submit the sitemap to Google Search Console and Bing Webmaster Tools. Log this in `AUDIT_LOG.md` as "ACTION REQUIRED BY AUTHOR."

### 9e. FAQ Page

Create an FAQ page (or section on the About page) with `FAQPage` JSON-LD schema. Include 8–10 questions answered with **specific, verified numbers already established in the chapters.** Per the "Permitted structural additions" in General Guidelines, FAQ answers must restate findings from the site's existing content — do not compute new statistics or introduce new analytical claims. Example questions:

1. How many US patents have been granted since 1976?
2. Which company has the most US patents?
3. How long does it take to get a US patent?
4. What are the fastest-growing patent technology areas?
5. Is AI patenting increasing?
6. What is the gender gap in US patenting?
7. Which countries' inventors file the most US patents?
8. How has patent quality changed over time?

**Verify every answer against the data files.** Do not fabricate or estimate.

### 9f. GenAI Optimization

Verify that prior phases have produced the following (fix any gaps):
- **TL;DR blocks** on every chapter (Phase 5a).
- **`<figcaption>`** on every chart with the key finding as a complete sentence with a number (Phase 3e).
- **Rankings as `<ol>` or `<table>`** in the HTML DOM (not just drawn in a chart). This ensures LLMs can read ranking data.
- **Consistent entity naming** site-wide (Phases 2d and 3c).
- **Internal linking**: 2–3 cross-references per chapter with descriptive anchor text (Phase 5h).

### 9g. Performance

Performance targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.

- **Static generation:** All chapter pages statically rendered (e.g., `getStaticProps` or React Server Components). Verify narrative text appears in raw HTML source — not rendered only by client-side JavaScript.
- **Lazy loading:** Charts below the fold load via dynamic imports or `IntersectionObserver`.
- **Images:** Use the framework's image component (e.g., `next/image`), WebP format, explicit `width`/`height` dimensions.
- **Fonts:** Use the framework's font optimization (e.g., `next/font`), Latin subset, `font-display: swap`.
- **Code splitting:** Chart libraries (D3, Recharts, etc.) imported only in components that use them.
- **Data files:** Split any JSON > 500KB. Trim float precision to 2–3 decimal places maximum.
- **CLS:** Explicit `height` or `aspect-ratio` on all chart containers (Phase 4g — verify).
- **INP:** Debounce rapid interactions (dropdowns, toggles). Use `requestAnimationFrame` for animations.
- Remove unused CSS, JavaScript, and dependencies from the bundle.

### 9h. Deliverable

`SEO_PERFORMANCE_AUDIT.md` — all optimizations applied.

---

## PHASE 10: Final Quality Assurance

After all preceding phases are complete, perform an end-to-end review.

### 10a. Build Verification

Run `npm run build` (or equivalent). It must complete with **zero errors**. Resolve warnings where possible. Run the linter and type checker if configured — fix all errors, resolve warnings where reasonable.

### 10b. Page-by-Page Checklist

For every page, verify in the source code and rendered output. **This checklist applies to all pages including any new chapters created by Phase 5d splits and any ACT 5 chapters restructured by Phase 5e.**

- [ ] No blank, broken, or error-state charts
- [ ] No overlapping legends, labels, or captions
- [ ] No `NaN`, `undefined`, `Infinity`, or obviously wrong numbers in any chart or text
- [ ] No informal language visible anywhere
- [ ] No instances of terms from the Phase 2d terminology table
- [ ] No broken internal links
- [ ] No horizontal scroll on mobile
- [ ] Previous/Next chapter links are correct
- [ ] TL;DR block present at top of every chapter
- [ ] If both Executive Summary and Key Findings exist, they do not repeat each other
- [ ] Every chart has a formal `<figcaption>` with a specific verified number
- [ ] Every chart title is a declarative finding with a verified number
- [ ] ACT 5 chapters follow consistent ordering template; all transitions reference the correct adjacent figures (per Phase 5e)
- [ ] No console errors

### 10c. Paper References (Final Spot-Check)

For every remaining paper reference in the Patent Law chapter:
- [ ] The hyperlink resolves to the correct paper on a journal website
- [ ] The publication year is after the policy change year
- [ ] The summary accurately reflects the abstract

### 10d. Code Cleanup (Final Pass)

> **Scope note:** Phase 1e performed an initial cleanup of dead code and unused files. This step catches anything that became unused during Phases 2–9 (e.g., components orphaned by chapter splits, data files no longer referenced after figure removals, styles that no longer apply after visualization changes).

- Remove files, components, styles, and dependencies that are no longer referenced by any page or component.
- Consolidate duplicated logic into shared utilities or components (e.g., if Phase 5d created multiple similar chapter page files, extract shared patterns).

### 10e. Deliverable

`FINAL_QA_LOG.md` — results of all checks, any remaining issues flagged for manual review.

---

## MASTER DELIVERABLES CHECKLIST

**Audit Logs (one per phase):**
- [ ] `DATA_AUDIT_INVENTORY.md` (from setup)
- [ ] `BUGFIX_LOG.md` (Phase 1)
- [ ] `ACCURACY_AUDIT.md` (Phase 2)
- [ ] `TONE_AUDIT.md` (Phase 3)
- [ ] `VISUALIZATION_AUDIT.md` (Phase 4)
- [ ] `REORGANIZATION_LOG.md` (Phase 5)
- [ ] `TITLE_REVISIONS.md` (Phase 6)
- [ ] `NAVIGATION_LOG.md` (Phase 7)
- [ ] `SEO_PERFORMANCE_AUDIT.md` (Phase 9)
- [ ] `FINAL_QA_LOG.md` (Phase 10)
- [ ] `AUDIT_LOG.md` (cumulative, updated after every phase)

**Site Assets:**
- [ ] `sitemap.xml`
- [ ] Updated `robots.txt`
- [ ] JSON-LD structured data on every page
- [ ] FAQ page with `FAQPage` schema

**Quality Gates (every item must be true before this work is considered complete):**
- [ ] `npm run build` — zero errors
- [ ] Zero console errors on any page
- [ ] All hero counters render correct values in static HTML
- [ ] All numerical claims verified against data
- [ ] All trend/causal claims appropriately hedged
- [ ] Zero instances of terms from the Phase 2d terminology table
- [ ] All text in formal academic register — no informal language, contractions, exclamation marks, or casual address to the reader (authorial "we" is permitted per Phase 3a)
- [ ] All chart titles are declarative findings with verified numbers
- [ ] All chart captions present, formal, with verified findings
- [ ] All chart legends non-overlapping at all breakpoints
- [ ] All legend items in meaningful order per Phase 4a table
- [ ] All axis labels with appropriate decimal precision per Phase 4b table
- [ ] Consistent colorblind-safe palette across all charts
- [ ] All paper references in Patent Law chapter pass all 7 tests
- [ ] No paper cited under a policy change predates that policy change
- [ ] Every paper directly examines the policy change it is cited under
- [ ] Within-chapter sections ordered broad → detailed per Phase 5a structure
- [ ] Every chapter in ACTs 1–4 contains between 3 and 5 figures/tables (per Phase 5d)
- [ ] Every chapter in ACT 5 follows the consistent ordering template (per Phase 5e)
- [ ] Uninsightful figures removed per Phase 5c criteria
- [ ] TL;DR block on every chapter
- [ ] Executive Summary and Key Findings do not repeat each other in any chapter
- [ ] `<figcaption>` on every chart
- [ ] Previous/Next links correct
- [ ] Reading progress indicator implemented
- [ ] Chapter table of contents on every chapter page
- [ ] Sitemap and robots.txt present and accessible
- [ ] All code-level optimizations for Core Web Vitals implemented per Phase 9g (static generation, lazy loading, explicit chart dimensions, code splitting, font optimization). Actual LCP/INP/CLS measurement requires post-deployment testing — flag in `AUDIT_LOG.md` as "ACTION REQUIRED BY AUTHOR: Run Lighthouse or PageSpeed Insights after deployment to verify LCP < 2.5s, INP < 200ms, CLS < 0.1."