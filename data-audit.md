# PatentWorld — Definitive Audit, Enhancement & Quality Assurance

## Context

PatentWorld is a Next.js site deployed at https://patentworld.vercel.app/ analyzing 50 years of US patent data (9.36M patents, 1976–2025) from [PatentsView](https://patentsview.org). The site is authored by **Saerom (Ronnie) Lee, Assistant Professor of Management, The Wharton School, University of Pennsylvania**.

**Any factual error, fabricated claim, or inaccurate statistic will directly damage the author's professional reputation and academic credibility. Treat every number, every claim, every reference, and every caption as if it will be scrutinized by peer reviewers at a top economics journal. When in doubt, remove the claim rather than risk inaccuracy.**

**Before writing any code or making any change**: Read the full codebase — `package.json`, directory structure, every chapter page, every data file, every component — to understand existing patterns. All work must follow existing conventions.

---

## Execution Order

```
STREAM 1:  Bug Fixes & Error Resolution                        ← Clean baseline
    ↓
STREAM 2:  Data Pipeline Audit (scripts, transformations, files) ← Verify the computational foundation
    ↓
STREAM 3:  Accuracy Audit (claims, references, terminology)      ← Fix all displayed content
    ↓
STREAM 4:  Remove Uninsightful Figures                           ← Cut before reorganizing
    ↓
STREAM 5:  Company-Level Analysis (new content)                  ← Add depth
    ↓
STREAM 6:  Tone & Language Audit                                 ← Formal academic register
    ↓
STREAM 7:  Restructure & Reorganize                              ← Logical narrative flow
    ↓
STREAM 8:  Visualization Improvements                            ← Polish all charts
    ↓
STREAM 9:  Navigation Improvements                               ← User experience
    ↓
STREAM 10: SEO, GEO, & Performance Optimization                 ← Final layer
```

---

# STREAM 1: Fix All Errors, Redundancies & Bugs

## 1.1 Build

Run `npm run build`. Fix every error and every warning. Zero tolerance. Repeat until the build completes with zero errors and zero warnings.

## 1.2 Console Errors

Open every page (home, about, explore, all chapters) and check for:
- JavaScript runtime errors
- Failed network requests (404s for data files, images, fonts)
- React warnings (missing keys, hydration mismatches, state updates on unmounted components)
- Empty or broken chart containers

Fix every issue. Add null guards, fallback states, and defensive checks.

## 1.3 Navigation & Links

- Verify every link on every page resolves correctly.
- Verify all "Previous Chapter / Next Chapter" links point to the correct chapter.
- Verify external links (PatentsView, mailto:saeroms@upenn.edu, www.saeromlee.com) open in new tabs.
- Verify no 404s exist anywhere.

## 1.4 Visual & Layout

Check every page at 375px, 768px, and 1440px:
- No overlapping text, labels, or legends on any chart
- No horizontal scroll on mobile
- No charts overflowing containers
- No tooltips clipped by viewport edges
- No truncated or cut-off text
- Navigation menu works correctly on mobile

## 1.5 Data Integrity (Quick Pass)

For every chart:
- Confirm it renders with actual data (no empty charts, no NaN, no undefined, no Infinity).
- Confirm year ranges are correct (1976–2025).
- Confirm no sudden drops to zero in non-final years.

## 1.6 Redundancy Removal

- Identify any figures, sections, or text passages that repeat the same information presented elsewhere. Remove duplicates.
- Identify unused data files and unrendered components. Remove them.

## 1.7 Deliverable

`BUGFIX_LOG.md` documenting every bug found and fix applied.

---

# STREAM 2: Data Pipeline Audit

**This stream audits the entire data pipeline — from preprocessing scripts through data transformations to the final numbers displayed on the site. It is the computational foundation for all accuracy claims.**

## 2.0 Map the Full Data Pipeline

Before auditing anything, build a complete inventory:

1. **Run `find . -type f`** and read `package.json`, the directory tree, and any README or documentation files. Understand how data flows: raw PatentsView inputs → preprocessing scripts → processed JSON/CSV → frontend components → charts and text.

2. **Identify all data files.** Locate every `.json`, `.csv`, `.tsv`, and any other data file used by the site. For each file, determine:
   - Its purpose (which chapter/chart consumes it)
   - How it was generated (which script, or was it manually created?)
   - Its source data (which PatentsView table(s))

3. **Identify all preprocessing scripts.** Locate every Python, Node, or shell script that processes, transforms, aggregates, or computes data. This includes scripts in `/scripts/`, `/data/`, `/preprocessing/`, `/lib/`, or any other location. Also check for inline data transformations in React components or Next.js data-fetching functions (`getStaticProps`, `generateStaticParams`, server components, etc.).

4. **Create the inventory.** Save to `DATA_AUDIT_INVENTORY.md`:
   - Every data file: location, size, consuming component(s)
   - Every preprocessing script: location, inputs, outputs
   - Every inline data transformation in frontend code

## 2.1 Audit Preprocessing Scripts

For every preprocessing script found in the project, read line by line and check for the following categories of errors:

### Data Loading Errors
- Is the script reading the correct source file(s)?
- Are column names / field names correct? (PatentsView column names can vary between table versions — verify against https://patentsview.org/download/data-download-tables)
- Is the file encoding handled correctly (UTF-8)?
- Are delimiters correct (TSV uses `\t`, CSV uses `,`)?
- Does the script handle header rows correctly?
- Does the script handle missing values / null fields / empty strings appropriately (not silently dropping rows or treating blanks as zero)?

### Filtering & Subsetting Errors
- If the script filters by patent type (utility, design, plant, reissue), is the filter correct for the intended analysis? Most analyses should use utility patents only unless explicitly studying design patents.
- If the script filters by year, are the boundary conditions correct? Check for off-by-one errors (e.g., `year >= 1976 AND year <= 2025` vs. `year > 1976`). The dataset should span 1976–2025.
- If the script filters by assignee, inventor, CPC code, or other field, verify the filter values are correct.
- Are there any hardcoded filter values that should be parameterized or that reference stale data?

### Aggregation & Computation Errors
- When computing counts, are duplicates handled correctly? A single patent can have multiple inventors, multiple assignees, and multiple CPC codes. Counting patents requires deduplication by patent ID. Counting inventors requires deduplication by inventor ID. Verify that every `count()`, `nunique()`, `groupby()`, or equivalent operation deduplicates on the correct key.
- When computing shares/percentages, is the denominator correct? (e.g., share of patents in a CPC section should divide by total patents in that year, not total patents across all years)
- When computing averages/medians, are outliers and edge cases handled? (e.g., patents with zero citations, patents with missing dates)
- When computing growth rates or ratios, is division by zero handled?
- When computing time-series metrics, are years with incomplete data (especially 2025, which may have partial-year data) handled or flagged?

### Citation Analysis Errors
- Forward citations: When counting citations a patent receives, is the window correct (e.g., 5-year window from grant date)? Are self-citations included or excluded as intended?
- Backward citations: When analyzing what a patent cites, are non-patent literature citations separated from patent citations?
- **Citation direction**: In PatentsView's `g_us_patent_citation` table, `patent_id` is the **citing** patent; `citation_patent_id` is the **cited** patent. Confirm the code does not reverse this. This is one of the most common and consequential errors in patent data analysis.

### CPC Classification Errors
- CPC codes have a hierarchy: section (1 letter) → class (3 chars) → subclass (4 chars) → group → subgroup. Verify the script aggregates at the intended level.
- Does the script use `g_cpc_current` (current classification) or an older classification? Current is preferred.
- When a patent has multiple CPC codes, does the script use only the primary (sequence = 0) or all codes? Verify the intended behavior.

### Date & Time Errors
- Are dates parsed correctly (format: YYYY-MM-DD in PatentsView)?
- When computing grant lag (grant date minus application date), are both dates present? Are negative or zero lags handled?
- When grouping by year, is the grant year used (not application year) unless the analysis explicitly calls for application year?

### Inventor & Assignee Errors
- Are disambiguated IDs used (not raw names)?
- When tracking inventor movements between companies, is the logic correct? (Inventor's assignee changes between consecutive patents, ordered by grant date)
- When computing team size, is it the count of unique inventors per patent?

### Output Errors
- Does the output JSON/CSV have the expected structure?
- Are numeric values rounded appropriately (not excessive decimal places)?
- Is the output sorted in a meaningful order?
- Are there any NaN, null, Infinity, or empty-string values in the output that would cause rendering errors?

## 2.2 Execute & Spot-Check

For every preprocessing script:

1. **Run the script** if raw PatentsView data files are available. Verify it completes without errors. If raw data is not available (only processed outputs exist), skip execution but still perform the full code review.

2. **Spot-check at least 5 data points per output file:**
   - Pick the first year (1976), a middle year (~2000), and the most recent full year.
   - Pick the top-ranked entity (e.g., the company with the most patents) and a mid-ranked entity.
   - Compute the expected value independently and compare to the output file.

3. **Sanity-check totals:**
   - Does the total patent count across all years sum to approximately 9.36 million (or the correct total for this data version)?
   - Do year-level totals show a generally increasing trend from 1976 to ~2020, with possible dips around 2008–2009?
   - Do top assignees include expected names (IBM, Samsung, Canon, LG, Intel, Microsoft, Apple, etc.)?
   - Are there any years with zero or suspiciously low counts suggesting missing data?

## 2.3 Audit Inline Data Transformations

Search the entire frontend codebase for data manipulations:

```bash
grep -rn "\.filter\(" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "\.map\(" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "\.reduce\(" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "\.sort\(" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "\.slice\(" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "Math\." src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "toFixed\|parseInt\|parseFloat" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "import.*\.json" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
grep -rn "fetch\|getStaticProps\|getServerSideProps" src/ app/ components/ pages/ lib/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
```

For every inline transformation found, check for:
- **Sorting in the wrong direction** (ascending vs. descending for "top N" displays)
- **Off-by-one slicing** (`.slice(0, 10)` when intending top 10 — correct, but verify)
- **Incorrect percentage computation** (numerator/denominator swapped, or not multiplied by 100)
- **String-to-number conversion** (JSON values parsed as strings, causing `"9" > "10"` sorting bugs)
- **NaN propagation** from undefined/null values in calculations
- **Hardcoded numbers** that should come from the data (e.g., "9.36M" hardcoded when the data total is different)

## 2.4 Verify Data-to-Display Pipeline

For every chart and every text statistic on every page, trace the full pipeline:

**For each chart:**
1. Identify which data file feeds it.
2. Identify any inline transformations between data loading and rendering.
3. Verify the chart's x-axis range, y-axis range, series labels, and data values match the data file after transformations.
4. Check for rendering errors:
   - Data series plotted in wrong order
   - Axis labels mismatched with data
   - Stacking order incorrect in stacked charts
   - Missing data points rendered as zero instead of gaps
   - Percentage charts that do not sum to 100%
   - Dual-axis charts with misaligned y-axes

**For each text statistic (any number in narrative text):**
1. Identify the data source.
2. Recompute the number from the data file.
3. Compare to the displayed value. If mismatch: **fix immediately**.

### Home Page Hero Stats

Verify each counter:
- **Patent count** ("9.36M"): Sum total unique patents. If the true total is 9,361,422, "9.36M" is acceptable. If the true total differs materially, fix it.
- **Year count** ("50"): Verify the data spans 1976–2025 (50 distinct years).
- **Chapter count**: Count actual chapter routes. Must match exactly.
- **Visualization count**: Count every chart rendered across all chapters. Must match exactly.

### Chapter-by-Chapter Spot Checks

For each chapter, verify the highest-risk claims:

**The Innovation Landscape:**
- Patent count for 1976, peak year, and latest full year.
- Growth multiple (latest ÷ earliest).
- Any claimed inflection points or dips — verify they exist in the data at the stated year.

**The Technology Revolution:**
- Top technology areas — re-rank and verify order.
- Growth rates for individual technology areas — recompute.
- "Fastest-growing" and "declining" claims — verify with actual growth rates.

**Who Innovates?:**
- Top assignees ranking — re-rank. Check whether ranking includes all patent types or only utility.
- Market concentration (top-10 share) — recompute.
- Foreign vs. domestic assignee claims — verify classification logic.

**The Inventors:**
- Total inventor count.
- Average/median team size and trend — recompute for sample years.
- Gender statistics — verify methodology and acknowledge PatentsView's name-based inference limitations.
- Most prolific inventor ranking — verify.

**The Geography of Innovation:**
- Top states/cities — re-rank and verify.
- Geographic concentration claims — recompute.
- International inventor share — verify computation.

**Collaboration Networks:**
- Network statistics (nodes, edges, clusters) — verify against data.
- Company network position claims — verify computations.

**The Knowledge Network:**
- Citation statistics (average, trends) — recompute.
- Government funding statistics — verify against `g_gov_interest`.

**Innovation Dynamics:**
- Grant lag statistics — recompute for sample years.
- Convergence or velocity metrics — verify methodology and spot-check.

**Patent Quality:**
- Quality metric formulas — verify each matches described methodology.
- Quality rankings — re-rank and verify.
- Quality correlations — verify direction and magnitude.

**Patent Law & Policy:**
- All legislative dates — verify against known dates:
  - Bayh-Dole Act: 1980
  - Federal Courts Improvement Act (CAFC): 1982
  - Hatch-Waxman Act: 1984
  - Uruguay Round / TRIPS: 1994 (effective 1995)
  - American Inventors Protection Act: 1999
  - AIA: Enacted September 16, 2011; first-to-file effective March 16, 2013; IPR effective September 16, 2012
  - eBay v. MercExchange: May 15, 2006
  - KSR v. Teleflex: April 30, 2007
  - Bilski v. Kappos: June 28, 2010
  - Mayo v. Prometheus: March 20, 2012
  - Myriad Genetics: June 13, 2013
  - Alice v. CLS Bank: June 19, 2014
  - TC Heartland v. Kraft Foods: May 22, 2017
  - Oil States v. Greene's Energy: April 24, 2018
  - Arthrex v. United States: June 21, 2021
- Any claims about measured impact of legislation — recompute from data.

**Artificial Intelligence:**
- AI patent identification methodology — verify CPC codes or keyword filters used.
- AI patent count and growth rate — recompute.
- Top AI patent assignees — re-rank and verify.

## 2.5 Global Consistency Check

After all individual fixes:
- Does the same number (e.g., total patents) appear in multiple places? Verify all instances match.
- Does a ranking appear in multiple charts or text? Verify consistent ordering everywhere.
- Do cross-chapter references agree? (e.g., Chapter 1 says "X patents in 2020" and Chapter 3 says "Y patents in 2020" for the same metric)

## 2.6 Important Rules

- **Do not fabricate data.** If you cannot verify a number because source data is unavailable, flag it as `[UNVERIFIABLE]` rather than guessing.
- **Do not change the methodology** unless it is clearly wrong. Document debatable choices but preserve the author's intent.
- **Preserve the author's intent.** If data contradicts a narrative claim, update the claim to match the data — do not adjust the data.
- **Back up before regenerating.** Use `cp original.json original.json.bak` before overwriting any output file.

## 2.7 Deliverables

**`DATA_AUDIT_INVENTORY.md`**: Complete inventory of all data files, scripts, and inline transformations.

**`DATA_ANALYSIS_AUDIT.md`**: For every script and transformation:
```
## Script: [filename]
- Location: [path]
- Purpose: [what it computes]
- Inputs: [source files]
- Outputs: [output files]
- Errors Found: [list each]
- Fixes Applied: [list each]
- Spot-Check Results: [5+ data points, expected vs. actual]
```

**`DATA_ACCURACY_REPORT.md`**:
- **Section 1: Executive Summary** — Total files/scripts/transformations audited, total errors by category (computation, data loading, display, stale data, consistency), total fixes.
- **Section 2: Error Catalog** — Table: `| # | Location | Type | Description | Severity | Fix |`
  - CRITICAL: displayed number materially wrong (>10% or wrong direction)
  - SIGNIFICANT: moderately wrong (2–10%)
  - MINOR: slightly wrong (<2%) or imprecise
  - COSMETIC: not wrong but could be clearer
- **Section 3: Verified Statistics** — The 20 most important site statistics with verified correct values, source files, and status.
- **Section 4: Remaining Risks** — Analyses that could not be fully verified, with what would be needed.

---

# STREAM 3: Accuracy Audit of Displayed Content

**Stream 2 verified the data pipeline. Stream 3 verifies everything the user actually sees — text claims, captions, references, and terminology.**

## 3.1 Numerical Claims in Text

For every number stated in text — narratives, captions, annotations, hero stats, key findings — that was not already verified in Stream 2:

1. Locate the data source.
2. Compute the correct value.
3. Compare. If mismatch: **fix immediately**.
4. If unverifiable: **remove the claim** or mark `<!-- UNVERIFIED -->` for author review.

## 3.2 Trend & Causal Claims

For every claim about a trend, cause, or effect:

- **Overclaiming**: Replace "caused," "led to," "resulted in," "because of" with hedged language ("coincided with," "is consistent with," "occurred during the same period as," "may reflect") unless a cited peer-reviewed paper supports the causal claim.
- **Unsupported inflection claims**: If the text says "the 2008 recession caused a dip" but the data shows no dip at 2008, **remove the claim entirely**.
- **False or unsupported claims**: Anything not directly supported by the data must be removed, rewritten with qualification, or supported by a published citation.

## 3.3 Terminology

| WRONG — Remove or Replace | CORRECT |
|---|---|
| "American innovation" / "American inventors" / "American patents" | "US patents" / "inventors listed on US patents" / "patenting activity in the United States" |
| "Global innovation" (referring to US patent data only) | "Innovation as reflected in US patent grants" or "US patenting" |
| "American ingenuity" / "American creativity" | Remove entirely |
| "Patent powerhouse" / "Innovation giant" | "Prolific patent filer" / "High-volume assignee" |
| "The world's most innovative companies" | "The assignees with the largest US patent portfolios" |

Scan every text element on the site for these and similar phrases. Replace all instances.

## 3.4 Academic Paper References (Patent Law & Policy Chapter)

For every academic paper cited in the Patent Law & Policy chapter, apply **all six tests**. A paper must pass every test to remain.

### Test 1: Does the paper exist?
Search for the exact title on Google Scholar and the claimed journal's website. If not found: **remove immediately** (likely hallucinated).

### Test 2: Is it published in a peer-reviewed journal?
If it exists only as a working paper (NBER, SSRN, CEPR, university series), **remove**. Only published journal articles are acceptable.

### Test 3: Was it published after the legal/policy change?
A paper studying the effects of a policy change enacted in 2011 cannot have been published in 2009. If the publication year is **before** the policy change year: **remove from under that policy change**. (Exception: papers studying the announcement or legislative process may be published in the same year.)

### Test 4: Does it directly examine the specific policy change?
Read the abstract. Does the paper's **primary research question** concern this specific policy change? Does it use the policy as an identification strategy or empirical subject?

If the paper merely **mentions** the policy change in its literature review or discussion but studies something else: **remove from under that policy change**.

Common failures:
- Paper about "patent quality" generally, cited under AIA, but doesn't study AIA.
- Paper about "patent trolls" cited under eBay, but doesn't study the eBay decision.
- Paper about "software patents" cited under Alice, but predates Alice or doesn't reference the decision.

### Test 5: Is the summary accurate?
Compare the chapter's summary to the paper's actual abstract:
- Research question correctly stated?
- Methodology correctly described? (Don't say "difference-in-differences" if the paper uses "event study.")
- Main finding's **direction** and **magnitude** correct?
- No overstating? (Never "proves" — use "finds," "provides evidence," "estimates.")

If inaccurate: **rewrite based on the abstract**.

### Test 6: Is there a hyperlink to the journal website?
Every cited paper must include a hyperlink to the journal's own website (or a DOI link resolving to the journal). If no journal URL can be found, the publication claim is unverified: **remove**.

### Actions
- Papers failing any test: remove and record reason.
- Papers passing all tests: keep with corrected summary if needed.
- Policy changes with zero remaining papers: state "No empirical study of this decision's effects has been identified in a leading peer-reviewed journal."

## 3.5 Deliverable

`ACCURACY_AUDIT.md`:
- Every numerical claim checked, with status (CORRECT / FIXED / REMOVED)
- Every trend/causal claim checked (ACCURATE / SOFTENED / REMOVED)
- Every paper reference checked with test results and action
- Every terminology correction

---

# STREAM 4: Remove Obvious or Uninsightful Figures

## 4.1 Removal Criteria

Remove a figure if it meets **any** of these:

1. **No key takeaway**: The only possible caption restates the axis labels with no additional insight.
2. **Redundant**: Same information is in a better figure elsewhere.
3. **Trivially obvious**: Confirms something requiring no data to know.
4. **Uninterpretable**: Too complex or cluttered to convey a clear message.
5. **Insufficient data**: Only 2–3 data points; better as a sentence.

## 4.2 Process

For each chapter:
1. List every figure with its title, type, and the non-obvious key takeaway it provides.
2. If no clear, specific, non-obvious takeaway can be stated in one sentence: flag for removal.
3. Remove flagged figures.
4. Revise surrounding text if removal creates narrative gaps.
5. If an important number loses its visualization, incorporate it as a specific figure in the text.

## 4.3 Deliverable

`FIGURES_REMOVED.md` listing every figure removed and its reason.

---

# STREAM 5: Company-Level Analyses

## 5.1 Objective

Add substantial company-level depth with **interesting, insightful, non-obvious key takeaways**. Every new analysis must have at least one specific finding that would surprise or inform an educated reader. If an analysis produces no interesting finding, do not include it.

All heavy computation must be precomputed as static JSON. **Verify every computed number before displaying it.**

## 5.2 Analyses

**Implement only if data supports it. If data is insufficient, skip and document why. Never fabricate or display unverified numbers.**

### 5.2.1 Innovation Trajectory Profiles
Top 50 assignees: annual patent volume, technology breadth (unique CPC subclasses), average team size, synchronized panels.
**Verify takeaway**: "IBM's patent output peaked at [X] in [year] and has since [declined/plateaued] by [Y]%."

### 5.2.2 Rise, Peak, and Decline Archetypes
Normalize top-100 assignees' annual counts as % of peak year. Cluster into trajectory types.
**Verify takeaway**: "Of the 50 largest filers in the 1990s, [X] have declined below 50% of peak."

### 5.2.3 Corporate Innovation Mortality
Track top-50 assignees per decade. Survival and replacement rates.
**Verify takeaway**: "Only [X] companies remained in the top 50 across all five decades."

### 5.2.4 Technology Portfolio Diversification
Shannon entropy across CPC sections per company per year for top 30.
**Verify takeaway**: Identify the most and least diversified portfolios with specific numbers.

### 5.2.5 Technology Pivot Detection
Jensen-Shannon divergence on rolling 3-year CPC distributions for top 50 assignees.
**Verify takeaway**: Identify specific pivot events with before/after percentages.

### 5.2.6 Corporate Citation Network
Directed citation flows between top 30 companies. Net knowledge producers vs. consumers.
**Verify takeaway**: Identify the largest net exporter and the most asymmetric pair.

### 5.2.7 Talent Flow Network
Inventor movements between companies using disambiguated IDs.
**Verify takeaway**: Identify the largest net talent importer.

### 5.2.8 Design Patents
Separate design from utility patents. Volume trends and top filers.
**Verify takeaway**: Specific growth rate and current design-patent share.

### 5.2.9 Claims Economy
Median and 90th-percentile claims per patent over time and by CPC section.
**Verify takeaway**: Specific fold-increase in median claims from 1980 to 2024.

## 5.3 Quality Control

Before adding any analysis:
1. Verify every number by recomputing from data.
2. Ensure the takeaway is non-obvious and specific.
3. If the analysis produces no interesting finding, **do not add it**.

## 5.4 Deliverable

`COMPANY_ANALYSIS_LOG.md`: analyses implemented, analyses skipped (with reasons), verified takeaway for each.

---

# STREAM 6: Academic Tone & Language Audit

## 6.1 Objective

Rewrite all text in formal academic register appropriate for a Wharton School faculty publication. Target register: *Management Science*, *American Economic Review*, *Research Policy*.

## 6.2 Mandatory Replacements

### Terminology (as in Stream 3.3 — enforce globally)

### Informal Language — Find and Replace Every Instance

| REMOVE | REPLACE WITH |
|---|---|
| "skyrocketed" / "exploded" / "took off" / "surged" | "increased substantially" / "grew rapidly" / specific multiple |
| "plummeted" / "tanked" / "cratered" | "declined sharply" / "decreased by [X]%" |
| "game-changer" / "groundbreaking" / "revolutionary" | Remove; describe what changed specifically |
| "stunning" / "remarkable" / "dramatic" / "staggering" | Remove adjective; let numbers speak |
| "the lion's share" / "the bulk of" | "[X]% of" |
| "a sea change" / "paradigm shift" | "a substantial structural change" |
| "no surprise" / "unsurprisingly" / "not surprisingly" | Remove; state finding directly |
| "interestingly" / "it's worth noting" / "notably" | Remove filler; state finding directly |
| "Let's look at" / "Let's explore" / "Let's dive in" | Remove; present analysis directly |
| "Here's the thing" / "The bottom line" / "At the end of the day" | Remove |
| "Think of it as" / "In other words" | Remove or rephrase |
| "you" / "your" / "we" (casual) | Third person or passive |
| Contractions | Full forms ("do not," "it is," "has not") |
| Exclamation marks | Remove all |
| Rhetorical questions in body text | Rewrite as declarative statements |

### Chart Titles

Every chart title must be an insight-oriented declarative sentence with specific data:
| WRONG | CORRECT |
|---|---|
| "Patents Over Time" | "Annual US Patent Grants Increased from 70,000 to 350,000, 1976–2024" |
| "Top Assignees" | "IBM, Samsung, and Canon Hold the Largest US Patent Portfolios, 1976–2025" |
| "Gender Gap" | "Female Inventors Account for [X]% of Listed Inventors as of 2024" |

### Chart Captions

Every caption: (1) state what the chart shows, (2) identify the most important pattern with a specific number, (3) optionally provide context. All in formal prose.

### Section Headings

Descriptive noun phrases or declarative statements — not questions or exclamations (except chapter titles).

## 6.3 About Page

- Author bio in third person with institutional affiliation.
- Methodology section written as an academic data appendix.
- Suggested citation: `Lee, Saerom (Ronnie). 2025. "PatentWorld: 50 Years of US Patent Innovation." The Wharton School, University of Pennsylvania. Available at: https://patentworld.vercel.app/`

## 6.4 Deliverable

`TONE_AUDIT.md` listing every informal expression found and its replacement.

---

# STREAM 7: Restructure, Reorganize & Reorder

## 7.1 Chapter Order

**Act I — The System:** (1) Innovation Landscape, (2) Technology Revolution.
**Act II — The Actors:** (3) Who Innovates?, (4) The Inventors.
**Act III — The Structure:** (5) Geography, (6) Collaboration Networks.
**Act IV — The Mechanics:** (7) Knowledge Network, (8) Innovation Dynamics, (9) Patent Quality.
**Act V — Context & Deep Dives:** (10) Patent Law & Policy, (11) AI, (12) Company Profiles (if created).

Update: home page grid, navigation, previous/next links, cross-references.

## 7.2 Within-Chapter Order

1. TL;DR block (2–3 sentences, specific findings)
2. Introduction (2–3 paragraphs)
3. Broadest overview visualization
4. Primary decomposition
5. Secondary decompositions
6. Analytical deep dives
7. Summary + transition to next chapter

Move complex analyses after simple overviews if currently reversed.

## 7.3 Within-Section Figure Order

Broadest → most detailed. Swap if reversed.

## 7.4 Cross-References

Add forward transitions at chapter ends. Add backward references in later chapters. Use chapter titles, not numbers.

## 7.5 Deliverable

`REORGANIZATION_LOG.md`.

---

# STREAM 8: Visualization Improvements

## 8.1 Legend & Caption Overlap (CRITICAL)

**No legend may overlap any chart data, axis label, or caption at any breakpoint.**
- Check at 375px, 768px, 1440px.
- Move overlapping legends below chart on mobile, right or below on desktop.

## 8.2 Legend Item Ordering

- Time-series "top N" legends: order by value at most recent data point (descending) or by total (descending).
- Category legends: order by category total (descending).
- Stacked charts: legend order must match stacking order (bottom-to-top).

## 8.3 Axis Labels — No Unnecessary Decimals

- Whole numbers (years, counts, ranks): zero decimal places. "2000" not "2000.0".
- Percentages: zero or one decimal place. "45%" or "45.2%", never "45.2384%".
- Large numbers: abbreviate. "1.2M" not "1,200,000" on ticks.
- Thousands separators for ≥ 1,000.
- Year axes: never display fractional years.

## 8.4 Universal Standards

**Typography**: Axis labels ≥12px, titles ≥14px. Plain language with units.
**Colors**: Single consistent palette, colorblind-safe, 4.5:1 contrast minimum.
**Tooltips**: On every chart, consistent styling, no viewport overflow.
**Responsive**: Legible at 375px. Touch targets ≥44px.
**Annotations**: 2–4 dashed vertical reference lines on time-series charts. Interpretive caption below every chart.

## 8.5 Chart-Type-Specific

- **Line charts >5 lines**: Small multiples or toggle. Direct end-of-line labels.
- **Bar charts**: Sort by value (descending) unless chronological. Horizontal for long labels.
- **Stacked charts**: Consistent order. Most important category at bottom.
- **Maps**: Appropriate projection. Legend.
- **Heatmaps**: Sequential/diverging scale. Labeled legend.

## 8.6 Deliverable

`VISUALIZATION_AUDIT.md`.

---

# STREAM 9: Navigation Improvements

## 9.1 Site-Wide
- Sticky header navigation visible on scroll.
- Current chapter highlighted in nav.
- Mobile: hamburger menu with full chapter list.

## 9.2 Chapter Navigation
- Previous/Next links at chapter bottom with chapter titles.
- Chapter table of contents (clickable section anchors) at chapter top or as sticky sidebar.
- "Back to top" floating button after scrolling past first section.

## 9.3 Home Page
- Chapter cards in same order as navigation (per Stream 7).
- Each card displays a compelling statistic, not just a generic description.
- "Start Reading" links to first chapter.

## 9.4 Reading Progress
- Thin progress bar at top of page showing scroll position within current chapter.

## 9.5 Accessibility
- Skip-to-content link.
- Heading hierarchy: one `<h1>`, then `<h2>`/`<h3>`, no skipped levels.
- Keyboard-navigable interactive elements with visible focus indicators.
- Alt text on all images. ARIA labels on chart containers.

## 9.6 Deliverable

`NAVIGATION_LOG.md`.

---

# STREAM 10: SEO, GEO & Performance

## 10.1 Meta Tags (Every Page)
- Unique `<title>` under 60 chars with specific content.
- Unique `<meta name="description">` under 160 chars with numbers.
- `<link rel="canonical">`. `<meta name="robots" content="index, follow">`.

## 10.2 Open Graph & Social
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type` on every page.
- `twitter:card` = summary_large_image.
- OG images: 1200×630px branded cards per chapter in `/public/og/`.

## 10.3 Structured Data (JSON-LD)
- Home: `WebSite` + `Dataset`.
- Chapters: `Article` with author, dates, canonical URL.
- About: `Dataset`.
- FAQ: `FAQPage`.

## 10.4 Sitemap & Robots
- `sitemap.xml` with all pages and `<lastmod>`.
- `robots.txt` allowing all crawlers + AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, CCBot).

## 10.5 FAQ Page
8–10 questions with specific verified numbers. `FAQPage` schema.

## 10.6 GenAI Optimization
- TL;DR blocks on every chapter (2–3 declarative sentences with numbers).
- `<figcaption>` or hidden `<table>` on every chart.
- Rankings as HTML `<ol>` or `<table>`.
- Consistent entity naming. Heading hierarchy. Internal linking (2–3 cross-refs per chapter).

## 10.7 Performance
Target: Lighthouse ≥ 90, all CWV passing (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- Static generation for all chapter pages. Verify text in raw HTML source.
- Lazy-load charts below fold.
- `next/image`, WebP, explicit dimensions.
- `next/font`, font-display: swap.
- Code-split chart libraries.
- Split JSON > 500KB. Trim float precision.
- Explicit height/aspect-ratio on chart containers.
- Debounce rapid interactions.

## 10.8 Deliverable

`SEO_PERFORMANCE_AUDIT.md` with before/after Lighthouse scores.

---

# Final Quality Assurance Pass

After all 10 streams:

1. `npm run build` — zero errors, zero warnings.
2. Open every page at 375px and 1440px. Confirm:
   - No blank, broken, or error-state charts
   - No overlapping legends, labels, or captions
   - No informal language
   - No "American innovation" or equivalent
   - No NaN, undefined, or obviously wrong numbers
   - No broken links
3. Recompute and verify the 5 most important numbers one final time:
   - Total patent count
   - Chapter and visualization counts
   - Top assignee and their patent count
   - Latest full-year grant total
   - One statistic from each of the 3 most data-heavy chapters
4. Confirm every paper reference has a working journal hyperlink.
5. Confirm every chart caption matches verified data.

---

# Master Deliverables Checklist

**Audit Logs:**
- [ ] `BUGFIX_LOG.md`
- [ ] `DATA_AUDIT_INVENTORY.md`
- [ ] `DATA_ANALYSIS_AUDIT.md`
- [ ] `DATA_ACCURACY_REPORT.md`
- [ ] `ACCURACY_AUDIT.md`
- [ ] `FIGURES_REMOVED.md`
- [ ] `COMPANY_ANALYSIS_LOG.md`
- [ ] `TONE_AUDIT.md`
- [ ] `REORGANIZATION_LOG.md`
- [ ] `VISUALIZATION_AUDIT.md`
- [ ] `NAVIGATION_LOG.md`
- [ ] `SEO_PERFORMANCE_AUDIT.md`

**Site Assets:**
- [ ] `sitemap.xml`
- [ ] Updated `robots.txt`
- [ ] JSON-LD structured data on every page
- [ ] FAQ page with `FAQPage` schema
- [ ] OG images in `/public/og/`

**Quality Gates:**
- [ ] Zero build errors, zero build warnings
- [ ] Zero console errors on any page
- [ ] All preprocessing scripts audited with 5+ spot-checks each
- [ ] All inline data transformations reviewed
- [ ] All data-to-display pipelines verified
- [ ] All text in formal academic register
- [ ] Zero instances of "American innovation" or similar
- [ ] All chart legends non-overlapping and meaningfully ordered
- [ ] All axis labels with appropriate decimal precision
- [ ] All paper references verified with journal hyperlinks
- [ ] No paper published before its referenced policy change
- [ ] Every paper directly examines the policy change it is cited under
- [ ] Every paper summary verified against its abstract
- [ ] Every chart has a non-obvious, verified key takeaway
- [ ] Every chart caption verified accurate with specific numbers
- [ ] Chapters reordered per narrative arc
- [ ] Previous/Next links updated
- [ ] TL;DR on every chapter
- [ ] Figcaption or hidden table on every chart
- [ ] Reading progress indicator implemented
- [ ] Chapter table of contents on every chapter page
- [ ] Lighthouse ≥ 90
- [ ] All Core Web Vitals passing