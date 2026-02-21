# PatentWorld Full-Stack Audit, Fix, and Deploy — Claude Code Prompt

## ROLE

You are a forensic editor, data/visualization auditor, academic methodology reviewer, technical SEO engineer, and full-stack developer operating on the PatentWorld codebase. Your PRIMARY mandate is **absolute accuracy**: every number, percentage, ranking, trend claim, caption, takeaway, legal reference, citation, derived metric formula, methodology description, and external factual claim on the website must be provably correct — verified against either the underlying data files (for data-driven claims), the implemented code (for derived metrics), or authoritative online sources (for external factual claims). You will audit, fix, commit, push, and deploy — in that order, with verification at each stage.

---

## CONTEXT

- **Project directory:** `/home/saerom/projects/patentworld`
- **Live site (post-deploy):** `https://patentworld.vercel.app/`
- **Hosting:** Vercel (auto-deploys on push to main).
- **Site structure:** 34 chapters organized into 6 Acts (The System, The Organizations, The Inventors, The Geography, The Mechanics, Deep Dives), 359 interactive visualizations, covering 9.36M US patents (1976–2025) sourced from PatentsView.
- **Working method:** All code reading and file editing happens on the local source files. Do NOT crawl or fetch the live site for auditing purposes. However, you MUST use web search (`curl`, or any available search/fetch tool) to verify external factual claims that cannot be checked from repo data alone.
- **Accuracy mandate:** Do not guess. If something cannot be verified from the source files, data files, computed checks, OR authoritative online sources, write exactly: `"I cannot confirm."` Never "correct" a value to what you think it should be — only correct it if you can prove the correct value from a verifiable source.

---

## THREE VERIFICATION TRACKS

### Track A — Data-Driven Claims (verified against repo data files)
Numbers, percentages, rankings, trends, and statistics derived from the site's own datasets (PatentsView data, CSV/JSON files in the repo). Verified by tracing data lineage and running independent computation scripts.

### Track B — External Factual Claims (verified via web search)
Any factual assertion NOT derived from the repo's data files: patent law references, court decisions, academic citations, institutional facts, definitions, comparative global statistics, and methodology attributions.

### Track C — Methodology & Derived Metric Claims (verified against code AND literature)
Claims about how metrics are computed, what algorithms are used, and how results should be interpreted. Verified by reading the implementation code AND cross-referencing against the cited or standard academic definitions.

---

## EXECUTION MODEL — FOUR SEQUENTIAL PHASES

You MUST complete each phase fully before proceeding to the next. Do not skip phases. After each phase, print a status summary.

---

### PHASE 1: DISCOVERY & AUDIT

**1.1 — Map the codebase**

```bash
cd /home/saerom/projects/patentworld

# Understand project structure
find . -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' -o -name '*.mdx' -o -name '*.md' \) | grep -v node_modules | grep -v .next | head -300

# Understand framework, dependencies, build scripts
cat package.json

# Understand routing, SSG/SSR, build settings
cat next.config.* 2>/dev/null || cat vite.config.* 2>/dev/null || echo "No config found"

# Inventory static assets and data files
ls -la public/
find . -type f \( -name '*.csv' -o -name '*.json' -o -name '*.parquet' -o -name '*.tsv' \) | grep -v node_modules | grep -v .next

# Inventory chart/visualization libraries in use
grep -r "recharts\|d3\|chart.js\|plotly\|nivo\|visx\|victory\|observable" package.json

# Understand recent changes
git log --oneline -20

# Confirm remote and branch
git remote -v
git branch --show-current

# Confirm clean working tree
git status
```

If the working tree is dirty, stash or commit existing changes with message `"chore: stash pre-audit state"` before proceeding.

**1.2 — Build the data source registry**

This step is CRITICAL. Before auditing any page, you must understand every data source in the repo.

1. Find every data file (CSV, JSON, TSV, static JS/TS data modules, constants files, hardcoded arrays/objects).
2. For each data file, record in `audit/data-source-registry.md`:
   - **File path** in the repo
   - **Format** (CSV, JSON, static JS object, etc.)
   - **Schema**: column names / field names and their data types
   - **Row count** (for tabular data)
   - **Time coverage**: earliest and latest year/date in the data
   - **Key identifiers**: what entity IDs are used (patent numbers, assignee IDs, CPC codes, inventor IDs, etc.)
   - **PatentsView data version**: if identifiable, record the download date or API version used
   - **Disambiguation version**: record which PatentsView disambiguation version is in use for inventor and assignee IDs
   - **Which page files import or reference this data** (trace `import` statements and file reads)
   - **Any transformations**: utility functions, data-processing scripts, or aggregation logic that transform raw data before display. Record file paths and what they do.

3. Build a **data lineage map**: for each page, trace the full chain from raw data file → transformation/aggregation code → chart component or narrative text. Document this chain so that every displayed number can be traced back to its source.

4. **PatentsView pipeline documentation**: record how the data was obtained (API or bulk download), any preprocessing scripts, and whether CPC reclassification over time is handled (CPC codes are periodically reclassified by patent offices; patents may move between classes).

**1.3 — Inventory all pages and visualizations**

From the source files (NOT from the live site), build a complete inventory:

1. Identify every page/route by reading the file structure (e.g., `app/` or `pages/` directory).
2. For each page file, extract and record: file path, route/URL it maps to, page title (from metadata/head), Act membership (1–6), chapter position within Act, presence of meta description, presence of JSON-LD, heading structure (`h1`/`h2`/`h3`).
3. Count all visualization components per page. The site claims 359 total — verify this count.
4. Identify all data source files in the repo and record their paths and purpose.
5. Save this inventory to `audit/page-inventory.md`.

**1.4 — Build the technology domain definition registry**

The site contains 12 "Deep Dive" chapters, each analyzing a technology domain (AI, 3D Printing, Agricultural Technology, Autonomous Vehicles, Biotechnology, Blockchain, Cybersecurity, Digital Health, Green Innovation, Quantum Computing, Semiconductors, Space Technology). Each domain is defined by some classification rule (CPC codes, keyword queries, or other method).

For each of the 12 technology domains:
1. **Extract the domain definition** from the code: which CPC codes, keywords, patent IDs, or classification rules determine membership in this domain?
2. **Record the definition** in `audit/technology-domain-definitions.md` with columns: `Domain | Definition Method | Specific Codes/Keywords | File Path | Disclosed on Page? | Overlaps with Other Domains?`
3. **Check for overlaps**: can a single patent fall into multiple domains (e.g., AI + Cybersecurity, AI + Digital Health)? If so, is this overlap disclosed?
4. **Check disclosure**: does each chapter page clearly state how the technology domain is defined, so a reader could replicate the classification?

**1.5 — Build the derived metrics registry**

The site uses numerous derived metrics from the academic innovation literature. Extract and catalog ALL derived metrics used anywhere on the site. Save to `audit/derived-metrics-registry.md`.

For each metric, record:
- **Metric name** (as used on the site): e.g., "originality," "generality," "blockbuster rate," "Shannon entropy," "HHI," "citation half-life," "exploration score," "patent velocity," "CAGR," "novelty (median entropy)"
- **Formula as implemented in code**: read the source code and extract the exact computation (numerator, denominator, aggregation, unit, time window).
- **File path** of the implementation.
- **Cited academic source** (if any): e.g., "originality as defined by Trajtenberg et al. 1997"
- **Standard academic definition**: search the web for the original paper and record the canonical formula.
- **Match?**: does the code implementation match the standard/cited academic definition? If not, document the discrepancy.
- **Pages where this metric is used**: list every page that displays or references this metric.
- **Consistent across pages?**: is the same formula used everywhere, or are there page-specific variants?

Known metrics to look for (non-exhaustive):
- **Originality index**: typically based on Trajtenberg, Henderson, Jaffe (1997) — 1 minus the HHI of backward citation class distribution
- **Generality index**: typically based on Hall, Jaffe, Trajtenberg (2001) — 1 minus the HHI of forward citation class distribution
- **Shannon entropy**: for portfolio diversity, subfield diversity
- **Herfindahl-Hirschman Index (HHI)**: for concentration (top-4 share, or full HHI)
- **Citation half-life**: time for a patent to receive 50% of its total citations
- **Blockbuster rate**: share of patents above some citation percentile threshold (define the threshold)
- **Exploration score**: new-subclass entry rate (define new relative to what baseline)
- **Patent velocity**: patents per year per entity (define denominator — per firm? per cohort?)
- **CAGR**: compound annual growth rate
- **Novelty (median entropy)**: from the NLP/topic model — define the entropy measure

---

**1.6 — TRACK A: Exhaustive data accuracy audit**

For EVERY page, perform the following data accuracy checks.

#### 1.6.1 — Number-by-number verification

For every specific number on a page — in narrative text, captions, figure labels, table cells, tooltips, summary boxes, takeaway sections, homepage chapter cards, or any other location:

1. **Extract the claim.** Quote the exact text.
2. **Classify as Track A, B, or C.** Track A if from repo data; Track B if external fact; Track C if derived metric definition/formula.
3. **For Track A: trace the data source, independently compute, record result.** Write verification scripts saved to `audit/verification-scripts/`.
4. **If mismatch**, record both values, the discrepancy, and the correct source.

#### 1.6.2 — Homepage hero statistics verification

The homepage displays four aggregate statistics: "9.36M Patents," "50 Years," "34 Chapters," "359 Visualizations." For each:

1. **9.36M Patents**: compute the exact total patent count from the underlying data. Verify it rounds to 9.36M. If the data changes, this number must update.
2. **50 Years**: verify the time span (1976–2025 = 50 calendar years, but is it 49 or 50 depending on endpoint inclusion? Confirm the site's counting convention).
3. **34 Chapters**: count the actual number of chapter page files in the codebase. Confirm it equals 34.
4. **359 Visualizations**: count all visualization components across all chapter pages. Confirm the total equals 359.

#### 1.6.3 — Homepage chapter card verification

Each of the 34 chapter cards on the homepage contains a mini-summary with specific numbers. For EVERY chapter card:

1. Extract every number from the card summary.
2. Compare against the corresponding chapter page. The card number MUST match the chapter page's data.
3. If the chapter page has been updated but the card has not, flag the inconsistency.

Save results to `audit/homepage-card-crosscheck.md`.

#### 1.6.4 — Percentage and share verification

For every percentage, share, or proportion displayed:

1. Verify numerator and denominator are identifiable and correct.
2. Verify arithmetic: numerator ÷ denominator = displayed percentage (within ±0.1 pp).
3. If multiple shares displayed together: verify they sum correctly (100% if exhaustive; stated subtotal if partial).
4. Flag sets summing to >100.1% or <99.9% (exhaustive) without explanation.

#### 1.6.5 — Ranking and ordering verification

For every ranking, "Top N" list, or ordered display:

1. Independently sort the underlying data.
2. Verify displayed order matches data-derived order.
3. Verify entities shown are the correct top/bottom N.
4. If ties exist, verify tie-breaking is stated or handled.

#### 1.6.6 — Superlative verification across full dataset

The site contains many superlative claims: "IBM leads with 161,888," "Amazon achieves the highest blockbuster rate at 6.7%," "California accounts for 23.6%," "Quantum computing remains the most concentrated domain," "the only domain where early entrants patent faster," "the widest range among all domains," etc.

For EVERY superlative ("the largest," "the highest," "the most," "the only," "the fastest-growing," "the first"):

1. Identify the comparison set: is it all entities in the data, or a stated subset?
2. **Check against the ENTIRE comparison set**, not just the displayed top N. The claim "Amazon has the highest blockbuster rate" must be verified against ALL assignees in the data, not just those shown in a table.
3. For cross-domain superlatives in the Deep Dive chapters (e.g., "the only advanced technology domain showing sustained consolidation"), verify against ALL 12 domain chapters simultaneously. Write a script that computes the metric for all 12 domains and confirms the superlative.
4. Record verification in `audit/superlative-checks.md`.

#### 1.6.7 — Time series and trend verification

For every time series or trend claim:

1. Verify start and end values against data.
2. Verify trend direction matches data.
3. Check for data gaps; verify handling (interpolation, gap, zero-fill) and disclosure.
4. Verify stated time window matches plotted data.
5. If growth rate, CAGR, or percentage change is claimed, compute independently.
6. Check for truncation bias.

#### 1.6.8 — Partial-year 2025 handling

The site claims coverage "1976 to 2025," but 2025 is almost certainly a partial year (data may only cover through Q1–Q3 2025 or earlier depending on download date).

1. **Determine the actual last date of data** in the repo's data files. Record this in the data source registry.
2. **Check every chart that includes 2025** data: is the partial-year status disclosed in the caption, axis, or a note?
3. **Check every trend/growth calculation** that uses 2025 as an endpoint: is the calculation biased by incomplete data? (e.g., "annual grants increased to 374,000 in 2024" — is 2024 also partial?)
4. **Check for visual truncation artifacts**: does any line chart show a drop-off in the most recent year that is actually a data completeness artifact rather than a real decline?
5. If partial-year status is not disclosed, flag as Critical and add appropriate disclosures.

#### 1.6.9 — Figure-to-data alignment

For every figure (chart, plot, graph):

1. Trace chart component → data variable → transformation → raw data file.
2. Verify chart type is appropriate for the data and claim.
3. Verify axis ranges (zero baseline? clipped data? even ticks?).
4. Verify legend accuracy.
5. Verify tooltip accuracy (if interactive).

#### 1.6.10 — Table-to-data alignment

For every table:

1. Verify every cell value against source data.
2. Verify column headers (correct units, aggregation level).
3. Verify row ordering.
4. Verify totals/subtotals.

#### 1.6.11 — Caption accuracy verification

For every figure and table caption:

1. Correctly names variables displayed.
2. Correctly states time period.
3. Correctly states sample/scope.
4. Correctly states aggregation level.
5. Does NOT over-interpret (no causal or evaluative language in captions).

#### 1.6.12 — Narrative and takeaway verification

For every paragraph and summary/takeaway box:

1. Every factual claim must be supported by displayed data or cross-reference.
2. Flag: unsupported, contradicted, over-stated, under-specified claims.
3. Verify every comparison and every superlative (see 1.6.6).

#### 1.6.13 — Cross-page consistency

1. Same statistic on multiple pages → values must be identical.
2. Overlapping data on different pages → no contradictions.
3. Methodology page → code must implement what is described.
4. Terminology must be consistent (same concept = same term everywhere).

#### 1.6.14 — Assignee name consistency

PatentsView disambiguated assignee IDs may map to varying display names (e.g., "International Business Machines Corporation" vs. "IBM"). Check:

1. How are assignee display names determined? Is there a name mapping file?
2. Is the same entity displayed with the same name on EVERY page where it appears?
3. Flag inconsistencies (e.g., "Samsung Electronics" on one page vs. "Samsung" on another).

#### 1.6.15 — Censoring, truncation, and missing data disclosure

1. Right-censoring (citation counts incomplete for recent patents) — disclosed?
2. Left-truncation (data starts in year X but analysis implies earlier) — disclosed?
3. Entity exclusions (missing assignees, non-utility patents) — stated?
4. Undisclosed winsorization, trimming, or filtering.
5. PatentsView disambiguation caveats present where needed.

#### 1.6.16 — Deep Dive cross-domain analytical framework consistency

All 12 Deep Dive chapters use a shared analytical framework. Verify:

1. **Metric definitions are identical** across all 12 chapters: top-four-firm concentration, entry velocity by cohort, subfield diversity (entropy), patent velocity multiplier — each must be computed identically in all 12.
2. **The same code path or function** is used for all 12, OR if chapter-specific code exists, it produces equivalent results.
3. **Cross-domain comparative claims** are verified against ALL 12 domains simultaneously (not just the two being compared). Write a script that extracts the key metrics for all 12 domains and checks every cross-domain superlative.
4. **Cohort definitions** (1970s entrants, 1990s entrants, 2010s entrants) use the same year boundaries in all chapters.

---

**1.7 — TRACK B: External factual claims verification (WEB SEARCH REQUIRED)**

#### 1.7.1 — Extract all external claims

Read through every page file. Extract and catalog every factual assertion outside the repo's data. Save to `audit/external-claims-registry.md` with columns:
`Claim ID | File Path | Line/Section | Exact Quoted Text | Claim Category | Verification Status | Source Used | Notes`

Claim categories:
- `LAW` — patent statutes, regulations, legal provisions, effective dates
- `CASE` — court decisions, holdings, case names, dates
- `POLICY` — patent office policies, procedural rules, institutional changes
- `HISTORY` — historical events, dates, legislative histories
- `DEFINITION` — legal or technical term definitions
- `CITATION` — academic papers, books, reports referenced on the site
- `INSTITUTION` — facts about organizations, companies, agencies
- `COMPARATIVE` — contextual claims comparing data to external benchmarks or global statistics
- `METHODOLOGY` — references to established methods, indices, or formulas from the literature
- `TECHNOLOGY_CONTEXT` — factual claims about technologies (e.g., "key FDM patents expired in 2009," "CRISPR-Cas9," historical technology milestones)

#### 1.7.2 — Verify patent law and policy claims

For every `LAW` or `POLICY` claim, verify against authoritative sources. Hierarchy:
1. Primary legal sources (35 U.S.C. via uscode.house.gov/congress.gov, Federal Register, treaty texts)
2. Official agency sources (USPTO.gov, WIPO.int, EPO.org)
3. Established legal references (MPEP, PCT guidelines)
4. Reputable secondary sources (CRS reports, law review articles)

Verify: law/regulation name, date of enactment, effective date, substance as described, section numbers, transition rules.

The "Patent Law & Policy" chapter (system-patent-law) claims "Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021)." Verify:
- The count of 21 is correct.
- Every named act/decision exists, has the correct date, and the description matches the actual law/holding.
- The Bayh-Dole Act date (1980) and Arthrex decision date (2021) are correct.
- The stated "empirical research on their effects" links are valid.

#### 1.7.3 — Verify court decisions and case law

For every `CASE` claim: verify case name, year, court, holding/ruling, citation format.

#### 1.7.4 — Verify academic and literature citations

For every `CITATION`: verify author(s), title, year, journal/publisher, DOI/URL resolution, and whether the site accurately characterizes the cited work's findings.

#### 1.7.5 — Verify definitions and terminology

For every `DEFINITION`: verify against MPEP, 35 U.S.C., WIPO Glossary, Black's Law Dictionary, or the original defining paper. Verify the site's definition is accurate and not misleadingly simplified.

#### 1.7.6 — Verify comparative and contextual claims

For every `COMPARATIVE`: identify the external benchmark, find the original source, verify the number, year, and scope match.

#### 1.7.7 — Verify technology context claims

For every `TECHNOLOGY_CONTEXT`: e.g., "the expiration of key FDM patents in 2009 opened the field to broad-based competition" — verify:
- The specific patents referenced (if named) actually expired in the stated year.
- The characterization of the technology milestone is accurate.
- Causal claims about patent expiry → market entry are flagged as requiring evidence.

#### 1.7.8 — Verify institutional and historical claims

For every `INSTITUTION` or `HISTORY` claim: verify dates, names, descriptions against official sources.

#### 1.7.9 — Compile Track B verification report

Save to `audit/external-claims-verification.md` with per-claim structure:
```
### Claim [ID]
- **File:** [path]
- **Line/Section:** [location]
- **Quoted text:** "[exact text]"
- **Category:** [LAW/CASE/CITATION/etc.]
- **Verification source:** [URL or source name]
- **Source excerpt:** [brief relevant excerpt]
- **Verdict:** CORRECT / INCORRECT / PARTIALLY CORRECT / CANNOT CONFIRM
- **If incorrect:** [corrected statement with source]
- **Recommended fix:** [exact text replacement]
```

---

**1.8 — TRACK C: Methodology and derived metric verification**

#### 1.8.1 — Derived metric formula audit (code vs. literature)

For every metric in the derived metrics registry (Phase 1.5):

1. **Read the code** that computes the metric.
2. **Search the web** for the canonical academic definition of the metric (using the cited source if one is given, otherwise the standard reference).
3. **Compare**: does the code implement the formula correctly? Common discrepancies to check:
   - Off-by-one in HHI denominators (market share as fraction vs. percentage)
   - Originality/generality: should use NBER patent classes, CPC subclasses, or CPC sections? Which does the code use?
   - Shannon entropy: natural log vs. log base 2 vs. log base 10? Is the normalization correct?
   - Citation half-life: is it defined on the patent level or the cohort level?
   - "Blockbuster rate": what percentile threshold defines a blockbuster? Is it the top 1%, 5%, 10%? Is the threshold computed within year, within field, or overall?
4. **Record the finding** in `audit/derived-metrics-verification.md`.

#### 1.8.2 — Gender inference methodology audit

The "Gender and Patenting" chapter reports female inventor shares and citation comparisons by team gender composition.

1. **Identify the gender inference method** in the code: is it based on a name-gender database (e.g., WGND, genderize.io, SSA baby names, World Gender Name Dictionary)? A machine learning model? PatentsView's own gender field?
2. **Check disclosure**: does the page describe the method, its limitations, and error rates?
3. **Check for ethnic/geographic bias acknowledgment**: name-based gender inference has documented higher error rates for East Asian, South Asian, and other non-Western names. Is this limitation stated?
4. **Check confidence threshold**: how does the code handle ambiguous names? Are they excluded, assigned to the majority gender, or treated as unknown? Is the threshold disclosed?
5. **Check the handling of unclassifiable names**: what fraction of inventors could not be classified? Is this stated?
6. **Verify the specific numbers**: "Female inventor share rose from 2.8% in 1976 to 14.9% in 2025" — verify against the data using the same inference method.
7. **Citation comparisons by gender composition**: "All-male teams average 14.2 forward citations, mixed-gender teams 12.6, and all-female teams 9.5." — verify these averages. Check whether the comparison controls for field, year, and team size, or is a raw average (if raw, is this disclosed?).

#### 1.8.3 — NLP and topic modeling audit

The "Language of Innovation" chapter uses NLP/topic modeling to make claims like "Computing and semiconductor topics grew from 12% to 33%" and reports "novelty (median entropy)."

1. **Identify the topic model algorithm** in the code (LDA, NMF, BERTopic, etc.).
2. **Identify the text corpus**: patent claims? Abstracts? Titles? Full text?
3. **Identify number of topics** and how it was chosen (held-out perplexity? Coherence score? Manual selection?). Is this disclosed?
4. **Extract topic labels**: how are topics named? Manually or automatically? Are labels disclosed?
5. **Verify "12% to 33%"**: compute the topic share change from the underlying topic-document distributions.
6. **Verify "novelty (median entropy)"**: what entropy measure is used? Is it the entropy of the topic distribution per patent? Per year? Is it standard in the literature? Cite the source methodology.
7. **Check disclosure**: does the page describe the algorithm, corpus, number of topics, and limitations?

#### 1.8.4 — Network analysis and clustering audit

The site reports "248 companies cluster into 8 industries by patent portfolio similarity" and "632 prolific inventors form 1,236 co-invention ties."

1. **Clustering algorithm**: identify from code (k-means, hierarchical, spectral, DBSCAN, etc.).
2. **Number of clusters (k=8)**: how was k chosen? Elbow method? Silhouette score? Manual? Is this disclosed?
3. **Similarity metric**: what measure defines "patent portfolio similarity"? Cosine similarity of CPC vectors? Jaccard index? Something else?
4. **Network construction**: for co-invention networks, what defines a tie? Co-appearance on the same patent? Within what time window? With what minimum threshold?
5. **Verify counts**: 248 companies, 8 clusters, 632 inventors, 1,236 ties — compute each from the data/code.
6. **Check disclosure**: are the algorithm, parameters, and construction rules described on the page?

#### 1.8.5 — Technology pivot detection audit

The site claims "51 technology pivots detected across 20 companies, often years before strategic shifts become publicly visible."

1. **Definition**: how is "technology pivot" operationally defined in the code? (Change in dominant CPC class? Shift in portfolio entropy? Breakpoint detection in a time series?)
2. **Detection algorithm**: what method identifies pivots? (Chow test? Bai-Perron? Manual thresholds?)
3. **Verify count**: compute the number of detected pivots from the code/data. Confirm 51 and 20.
4. **Causal/predictive claim**: "often years before strategic shifts become publicly visible" — is this supported by evidence (e.g., comparison to press announcements, 10-K filings, M&A dates)? Or is it unsupported narrative? If unsupported, flag for rewriting to descriptive language.
5. **Check disclosure**: are the definition, algorithm, and parameters described on the page?

#### 1.8.6 — Compile Track C verification report

Save to `audit/methodology-verification.md` with sections for each metric, each methodology, and the findings.

---

**1.9 — Full audit checklist (non-data, non-factual, non-methodology items)**

#### A) Structure, Navigation & Act Sequencing
- Page fits coherently into site structure (chapter sequencing, titles, breadcrumbs, internal links).
- **Act/chapter ordering logic**: verify the 6 Acts follow a logical narrative progression (System → Organizations → Inventors → Geography → Mechanics → Deep Dives). Verify chapters within each Act are ordered logically.
- **Forward reference audit**: if a chapter references a concept, metric, or finding from a LATER chapter, is sufficient context provided so the reader is not confused? Or should the reference be reordered?
- **Cross-link completeness**: every chart should link to its data source; every derived metric should link to the methodology page; related chapters should cross-reference each other.

#### B) Language & Claims Policy (STRICT)
- Academic, formal, professional language throughout.
- No informal/colloquial phrasing. Disallowed: "a lot of," "pretty much," "kind of," "really big," "skyrocketed," "exploded," "game-changer," "interesting to note," "it is worth noting," "it turns out." Replace with precise, formal alternatives.
- No unexplained abbreviations/acronyms; define at first use on each page.
- Descriptive, non-causal language unless methodology supports causal inference. Flag: "caused," "led to," "resulted in," "due to," "because of," "driven by," "enabled," "contributed to," "fostered," "spurred," "fueled," "prompted." Replace with: "is associated with," "coincided with," "occurred alongside," "was accompanied by," "was followed by."
- Fix: redundancies, inconsistencies, logical gaps, ambiguous definitions, ungrounded interpretations.
- Every claim must have a clear referent.

#### C) Figures / Plots / Tables — Readability
- Axis labels with full descriptive names and units.
- Text size legible at 375 px, 768 px, 1280 px viewports.
- No label overlap or text clipping.
- Sensible tick density.
- Color choices accessible (not relying solely on red/green distinction).
- Legends positioned clearly and not overlapping data.
- Meaningful sort order.

#### D) Color and Visual Encoding Consistency Across Chapters
With 34 chapters and 359 visualizations:
1. **Entity color consistency**: does the same entity (e.g., Samsung, IBM, Japan) use the same color on every chart across all chapters?
2. **CPC section color consistency**: if CPC sections are color-coded (e.g., G = blue, H = green), is the same color scheme used everywhere?
3. **Color legend consistency**: do legend entries for the same category use the same label and color across pages?
4. Extract the color palette/mapping from the code and verify it is applied uniformly. Flag inconsistencies.

#### E) Interactive Visualization Accessibility & Fallback Content
With 359 interactive visualizations:
1. **Noscript fallback**: does every chart have a `<noscript>` or equivalent text description so non-JS users (and search engine crawlers) get meaningful content?
2. **ARIA labels**: do chart containers have `aria-label` or `aria-describedby` attributes?
3. **Keyboard navigation**: can interactive elements (tooltips, filters, tabs) be operated via keyboard?
4. **Screen reader compatibility**: is data in tooltips and legends accessible to screen readers, or locked inside canvas/SVG without text alternatives?
5. Check a sample of 10 charts across different chapters.

#### F) "Cite This Figure" Widget Verification
The homepage shows a "Cite this figure" button.
1. Does every one of the 359 figures have this widget?
2. Is the generated citation correct: author name ("Saerom (Ronnie) Lee"), title (matching the caption), date, URL (stable, pointing to correct page/figure)?
3. Does the citation follow a recognized academic format (APA, Chicago, etc.)?
4. Is the URL in the citation a permanent link, not a dynamic route that might change?

#### G) Data Download/Export Verification
If the site offers any data download or export functionality:
1. Does the exported data match what is displayed on the corresponding chart/table?
2. Are column headers, units, and metadata included in the export?
3. Is the file format valid (valid CSV with proper escaping, valid JSON, etc.)?

#### H) Links & References
- All internal links → target file/route exists.
- External URLs → test with `curl -sI [URL]`, record HTTP status, flag 4xx/5xx.
- Broken anchors, dead routes.

#### I) SEO & Metadata
- Every page: unique `<title>`, unique `<meta name="description">`, canonical, OG tags, Twitter cards.
- One `<h1>` per page, logical `<h2>`/`<h3>` nesting.
- Descriptive, kebab-cased route paths.

#### J) Structured Data
- Existing JSON-LD inventory.
- Required: `WebSite`, `BreadcrumbList`, `Article`/`ScholarlyArticle` per chapter.
- Recommended: `Dataset`/`DataCatalog` if data is exposed.
- `Person` schema for the author.

#### K) GenAI / Agent-Friendliness
- `public/robots.txt` and `public/sitemap.xml` present and complete.
- SSG/SSR output for all chapter pages (content not hidden behind client-side JS).
- Content extractable without JavaScript.

#### L) Performance Audit
With 359 interactive visualizations, performance is critical:
1. **Lazy loading**: are off-screen charts lazy-loaded or do they all load on page entry?
2. **Code splitting**: is each chapter a separate bundle, or is the entire site one bundle?
3. **Bundle size**: check `npm run build` output for chunk sizes. Flag any chunk >500 KB.
4. **Chart library deduplication**: is the chart library imported once, or multiple times?
5. **Image optimization**: are any large static images (>500 KB) present without optimization?
6. **Core Web Vitals estimation**: based on bundle sizes and chart count per page, flag pages likely to have poor LCP (>2.5s), CLS (>0.1), or INP (>200ms).

---

**1.10 — Write the audit report**

Save to `audit/audit-report.md` with:

1. **Executive Summary** — issue counts by track and severity:
   - Track A (data accuracy): [N] errors found
   - Track B (external claims): [N] errors found
   - Track C (methodology): [N] errors found
   - Other issues: Critical [X], Major [Y], Minor [Z], Editorial [W]

2. **Track A: Data Accuracy Issue Log** — table:
   `ID | File Path | Route/URL | Location | Claimed Value | Verified Value | Data Source File | Verification Method | Discrepancy | Fix`

3. **Track B: External Claims Issue Log** — table:
   `ID | File Path | Route/URL | Location | Quoted Text | Category | Authoritative Source | Correct Fact | Fix Description`

4. **Track C: Methodology Issue Log** — table:
   `ID | File Path | Route/URL | Metric/Method | Code Implementation | Expected (Literature) | Discrepancy | Fix Description`

5. **Cross-Page Consistency Log** — table:
   `Statistic | Page 1 (path + value) | Page 2 (path + value) | Match? | Resolution`

6. **Homepage Card Crosscheck Log** — table:
   `Chapter | Card Text | Card Value | Chapter Page Value | Match?`

7. **Deep Dive Cross-Domain Comparison Log** — table:
   `Metric | Domain 1 (value) | Domain 2 (value) | ... | Domain 12 (value) | Superlative Claim | Correct?`

8. **General Issue Log** — table:
   `ID | Severity | Type | File Path | Route/URL | Location | Evidence | Problem | Fix Description`

9. **SEO & GenAI Findings**

Print: `"PHASE 1 COMPLETE. Found [N] Track A data errors, [M] Track B external claim errors, [P] Track C methodology errors, [Q] other issues (Critical: X, Major: Y, Minor: Z, Editorial: W). Proceeding to Phase 2."`

---

### PHASE 2: IMPLEMENT ALL FIXES

Work through ALL issue logs from Phase 1. Priority order: Track A data → Track C methodology → Track B external claims → General fixes.

**2.1 — Track A: Data accuracy fixes (HIGHEST PRIORITY)**

For every data accuracy error:

1. Determine correct value from data source using verification script.
2. Locate incorrect value in source code.
3. Apply correction.
4. Re-run verification script to confirm.
5. Check cascading effects: if this number changes a percentage, ranking, trend description, or appears on other pages (including homepage cards), fix ALL downstream references.
6. Log: old value, new value, file path, line number, verification script output.

Sub-categories:
- Wrong numbers → replace with verified value (or flag with `<!-- TODO -->` if unverifiable).
- Wrong percentages → recompute from verified numerator/denominator; fix narrative.
- Wrong rankings → re-sort from data; fix text referencing "the top firm" etc.
- Wrong time periods → fix display AND data filter.
- Mismatched caption and figure → rewrite caption (do NOT change figure unless figure is wrong).
- Unsupported takeaway claims → find support or weaken/remove.
- Cross-page inconsistencies → fix ALL occurrences to the verified value.
- Homepage card inconsistencies → update card to match chapter page.
- Partial-year 2025 disclosures → add notes on all charts/text that use partial 2025 data.
- Wrong superlatives → verify against full dataset, correct entity or remove superlative.

**2.2 — Track C: Methodology and derived metric fixes**

For every methodology error:

1. **Formula mismatches**: if the code implements a formula that differs from the cited/standard academic definition, fix the code to match the literature (unless the site explicitly documents and justifies the deviation).
2. **Undisclosed methodologies**: if a method (topic model, clustering, gender inference, pivot detection) is used but not described, add a methodology disclosure section to the relevant page. Include: algorithm name, key parameters, selection criteria, limitations, and source reference.
3. **Cross-chapter formula inconsistencies**: if the same metric is computed differently on different pages, standardize to a single implementation.
4. **Gender inference disclosure**: add a methodology note covering the inference method, error rates, handling of ambiguous names, and ethnic/geographic bias limitations.
5. **NLP/topic model disclosure**: add methodology note covering algorithm, corpus, number of topics, selection criteria, labels, and limitations.
6. **Network/clustering disclosure**: add methodology note covering algorithm, parameters, similarity metric, construction rules.
7. **Technology pivot disclosure**: add methodology note covering operational definition, detection algorithm, and limitations. Rewrite "often years before strategic shifts become publicly visible" to descriptive language unless supported by evidence.
8. **Technology domain definitions**: ensure each Deep Dive chapter page discloses how its domain is defined (CPC codes, keywords, etc.) and whether domains can overlap.

**2.3 — Track B: External factual claim fixes**

For every external claim error:

1. Determine correct fact from authoritative source.
2. Locate incorrect text in source code.
3. Apply correction per category-specific rules:
   - `LAW`/`POLICY`: correct to match primary legal source.
   - `CASE`: correct case name, year, court, holding.
   - `CITATION`: correct author/title/year/journal/DOI; fix mischaracterized findings.
   - `DEFINITION`: rewrite to match authoritative source; add attribution.
   - `COMPARATIVE`: correct number/year/scope to match authoritative source.
   - `TECHNOLOGY_CONTEXT`: verify milestones/dates; flag unsupported causal claims.
   - `INSTITUTION`/`HISTORY`: correct dates/names/descriptions.
4. Add source attributions where missing.

**2.4 — Content & language fixes**
- Rewrite all informal, colloquial, or causal language.
- Define acronyms at first use on each page.
- Fix all vague referents.
- Ensure formal academic prose throughout.

**2.5 — Visualization fixes**
- Fix axis labels, units, scales, legends, tooltips, color semantics, sorting.
- Fix label overlap, text sizing, tick density.
- Add truncation/censoring disclosures.
- Add non-zero baseline disclosures.
- Add partial-year 2025 disclosures.
- Fix responsive breakpoints at 375 px, 768 px, 1280 px.
- Fix color inconsistencies across chapters (standardize entity/CPC color mappings).

**2.6 — Accessibility fixes**
- Add noscript fallback text for all interactive charts missing it.
- Add ARIA labels to chart containers.
- Verify keyboard navigability for interactive elements.

**2.7 — "Cite This Figure" fixes**
- Add the widget to any figures missing it.
- Fix citation text (author, title, date, URL) where incorrect.
- Standardize citation format across all figures.

**2.8 — Navigation & link fixes**
- Fix broken internal and external links.
- Add missing cross-links between chapters, methodology, and data sources.
- Ensure breadcrumbs present and accurate.
- Fix Act/chapter ordering issues if found.

**2.9 — SEO & metadata fixes**
- Add/correct `<title>`, `<meta description>`, canonical, OG tags, Twitter cards.
- Fix heading hierarchy.
- Fix non-descriptive routes.

**2.10 — Structured data implementation**
- Add JSON-LD: `WebSite`, `BreadcrumbList`, `Article`/`ScholarlyArticle`, `Person` (author), `Dataset` (if applicable).

**2.11 — GenAI / agent-readiness implementation**
- `public/robots.txt`, `public/sitemap.xml` (complete, with `<lastmod>`).
- `public/llms.txt` with canonical page index, chapter descriptions, data provenance.
- `public/data-dictionary.json` or `.md` with all metric definitions, formulas, sources, units, time windows, limitations.

**2.12 — Performance fixes**
- Add lazy loading for off-screen charts if missing.
- Verify code splitting per chapter.
- Flag (and fix where straightforward) oversized bundles.
- Optimize large images.

**2.13 — Build verification**

```bash
cd /home/saerom/projects/patentworld
npm run build
```

If build fails, fix all errors before proceeding.

Print: `"PHASE 2 COMPLETE. Fixed [N] Track A errors, [M] Track C errors, [P] Track B errors, [Q] other issues. Build succeeded. Proceeding to Phase 3."`

---

### PHASE 3: VERIFY ALL FIXES

**3.1 — Re-run ALL Track A verification scripts**

Execute every script in `audit/verification-scripts/`. Confirm each produces a value matching the updated source code. If any mismatch, return to Phase 2.

Save outputs to `audit/verification-results-post-fix.md`.

**3.2 — Re-verify Deep Dive cross-domain superlatives**

Re-run the cross-domain comparison script from Phase 1.6.16. Confirm all superlative claims are correct after fixes.

**3.3 — Re-verify homepage card crosscheck**

Confirm every homepage chapter card number matches the corresponding chapter page.

**3.4 — Re-verify a sample of Track B and Track C fixes**

For the 10 most critical Track B fixes (LAW, CASE, CITATION) and the 5 most critical Track C fixes (formula mismatches):
1. Re-read corrected text.
2. Re-check against authoritative source / academic definition.
3. Confirm accuracy.

Save to `audit/external-claims-post-fix-check.md` and `audit/methodology-post-fix-check.md`.

**3.5 — Cross-page consistency re-check**

Confirm same statistic = same value across all pages. No new inconsistencies.

**3.6 — Page inventory re-run**

Save to `audit/post-fix-inventory.md`. Confirm all pages have metadata, JSON-LD, and no broken links.

**3.7 — Spot-check 10 most-changed files**

Verify: numbers match data, external claims match sources, language is formal and non-causal, captions accurate, takeaways supported.

**3.8 — Update the audit report** at `audit/audit-report.md`:
- Add `Status` column: `Fixed` / `Partially Fixed` / `Deferred` (with justification).
- Add `Verified` column to Track A log.
- Add `Re-verified` column to Track B/C logs (for sampled items).
- Update Executive Summary.
- Add **Combined Accuracy Certification Statement**:
  ```
  TRACK A — DATA ACCURACY: All [N] data accuracy checks pass. Every displayed number,
  percentage, ranking, trend claim, and superlative has been independently verified against
  source data files. [N] verification scripts available in audit/verification-scripts/.

  TRACK B — EXTERNAL CLAIMS: [M] external factual claims identified. [M-K] confirmed correct.
  [K] corrected. [J] could not be confirmed (flagged with TODO). Verification log:
  audit/external-claims-verification.md

  TRACK C — METHODOLOGY: [P] derived metrics and methodological claims verified against
  academic literature and code. [P-L] confirmed correct. [L] corrected (formula/code fixes
  or disclosure additions). Verification log: audit/methodology-verification.md

  HOMEPAGE: All 4 hero statistics and all 34 chapter card summaries verified against chapter
  pages and underlying data.

  DEEP DIVES: All 12 technology domains verified for cross-domain consistency. All cross-domain
  superlatives confirmed correct.

  PARTIAL-YEAR: 2025 data coverage through [DATE]. All charts and calculations using 2025 data
  include appropriate disclosure.
  ```

**3.9 — Linting and type-checking**

```bash
cd /home/saerom/projects/patentworld
npm run lint 2>/dev/null || echo "No lint script"
npx tsc --noEmit 2>/dev/null || echo "No TypeScript config"
```

Fix any new errors.

**3.10 — Final build**

```bash
cd /home/saerom/projects/patentworld
npm run build
```

Print: `"PHASE 3 COMPLETE. All Track A/B/C verifications pass. All fixes confirmed. Build clean. Proceeding to Phase 4."`

---

### PHASE 4: COMMIT, PUSH, AND DEPLOY

**4.1 — Stage and commit**

```bash
cd /home/saerom/projects/patentworld
```

Atomic, well-scoped commits:

```bash
# Commit 1: Data accuracy and methodology fixes (MOST IMPORTANT)
git add -A -- '*.tsx' '*.ts' '*.jsx' '*.js' '*.mdx' '*.md' ':!audit/' ':!public/llms.txt' ':!public/data-dictionary.*' ':!public/robots.txt' ':!public/sitemap.xml'
git commit -m "fix(accuracy): correct all data, methodology, and factual inaccuracies

TRACK A — Data accuracy:
- Corrected [N] data errors (numbers, percentages, rankings, time periods, superlatives)
- Fixed homepage hero stats and chapter card summaries to match chapter data
- Resolved [P] cross-page inconsistencies
- Added partial-year 2025 disclosures on all affected charts/text
- Standardized entity/CPC color encoding across all chapters

TRACK B — External claims:
- Corrected [K] patent law, court decision, and citation references
- Added source attributions where missing
- Fixed [J] technology context claims and historical dates

TRACK C — Methodology:
- Fixed [L] derived metric formula implementations to match academic definitions
- Added methodology disclosures for gender inference, topic modeling, clustering,
  network analysis, and technology pivot detection
- Added technology domain definitions to all 12 Deep Dive chapters
- Standardized analytical framework across all 12 Deep Dive domains

LANGUAGE & ACCESSIBILITY:
- Rewrote causal language to associative; informal to academic
- Added acronym definitions, fixed vague referents
- Added noscript fallbacks, ARIA labels, citation widgets
- Fixed responsive breakpoints and visualization readability

Audit ref: audit/audit-report.md"
```

```bash
# Commit 2: SEO and structured data
git add -A -- '*layout*' '*head*' '*metadata*' '*seo*' '*jsonld*' '*schema*'
git commit -m "feat(seo): add meta tags, JSON-LD structured data, fix heading hierarchy"
```

```bash
# Commit 3: GenAI readiness
git add public/llms.txt public/data-dictionary.* public/robots.txt public/sitemap.xml
git commit -m "feat(ai-readiness): add llms.txt, data dictionary, robots.txt, sitemap.xml"
```

```bash
# Commit 4: Audit artifacts and verification scripts
git add audit/
git commit -m "docs(audit): add complete audit report, verification scripts, and certification

- Track A: data verification scripts + results
- Track B: external claims registry + verification log
- Track C: methodology verification log
- Homepage card crosscheck, cross-domain comparison, superlative checks
- Combined accuracy certification statement"
```

Adjust `git add` patterns as needed. Run `git status` after all commits to verify clean tree.

**4.2 — Push to remote**

```bash
cd /home/saerom/projects/patentworld
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
```

If rejected, rebase first:
```bash
git pull --rebase origin "$BRANCH"
git push origin "$BRANCH"
```

**4.3 — Confirm push**

```bash
cd /home/saerom/projects/patentworld
git status
git log --oneline -10
```

Print: `"PHASE 4 COMPLETE. All changes committed and pushed to origin/$BRANCH. Vercel auto-deploy triggered. Verify at: https://patentworld.vercel.app/"`

---

## FINAL OUTPUT

```
============================================
AUDIT & DEPLOYMENT COMPLETE
============================================

TRACK A — DATA ACCURACY:
  Errors found:              [N]
  Errors fixed:              [N]
  Errors deferred:           [N] (justifications listed)
  Verification scripts:      [N] (in audit/verification-scripts/)
  Homepage hero stats:       ALL VERIFIED
  Homepage chapter cards:    ALL VERIFIED ([34] cards checked)
  Cross-page consistency:    [N] inconsistencies found, [N] resolved
  Deep Dive cross-domain:    ALL 12 domains verified, [N] superlatives checked
  Partial-year 2025:         Data through [DATE], [N] disclosures added

TRACK B — EXTERNAL CLAIMS:
  Claims identified:         [N]
  Correct:                   [N]
  Corrected:                 [N]
  Unverifiable:              [N] (flagged with TODO)
  Categories: LAW [n], CASE [n], CITATION [n], DEFINITION [n],
              COMPARATIVE [n], INSTITUTION [n], HISTORY [n],
              METHODOLOGY [n], TECHNOLOGY_CONTEXT [n]

TRACK C — METHODOLOGY:
  Metrics verified:          [N]
  Correct implementations:   [N]
  Formula fixes:             [N]
  Disclosure additions:      [N]
  Methods covered: derived metrics, gender inference, topic modeling,
                   clustering, network analysis, technology pivots,
                   domain definitions

OTHER ISSUES:
  Found:    [N] (Critical: X, Major: Y, Minor: Z, Editorial: W)
  Fixed:    [N]
  Deferred: [N]

VISUALIZATION QUALITY:
  Color consistency:     VERIFIED across [N] charts
  Accessibility:         [N] noscript fallbacks, [N] ARIA labels added
  Citation widgets:      [N] of 359 verified
  Responsive:            Checked at 375/768/1280 px

DEPLOYMENT:
  Commits made:   [N]
  Branch:         [branch name]
  Push status:    SUCCESS / FAILED
  Deploy URL:     https://patentworld.vercel.app/

COMBINED ACCURACY CERTIFICATION:
[Insert full certification from Phase 3.8]
============================================
```

---

## CONSTRAINTS & SAFEGUARDS

1. **Work locally for code.** All file reads/writes under `/home/saerom/projects/patentworld`. Do NOT fetch the live site for auditing.
2. **Use web search for external facts.** You MUST search the web to verify any claim not derived from repo data. Do not rely on training knowledge for verifiable facts.
3. **Never fabricate data.** If a number cannot be verified, flag with `<!-- TODO: verify -->` — never guess.
4. **Never fabricate citations.** If an authoritative source cannot be found, mark `CANNOT CONFIRM` with `<!-- TODO -->` — never invent a source.
5. **Never silently change a number or fact.** Every change logged with old value, new value, source, and method.
6. **Never delete content without justification.** Every removal logged.
7. **Preserve git history.** No force-push.
8. **Do not modify raw data source files** unless provably erroneous against upstream.
9. **If any phase fails critically**, stop and report. Do not push broken code.
10. **Academic language standard.** All text must read as appropriate for a peer-reviewed publication.
11. **Always `cd /home/saerom/projects/patentworld`** before any command.
12. **Verification scripts are deliverables.** Saved, committed, re-runnable by human reviewers.
13. **Authoritative source hierarchy for Track B:** (1) primary legal/government sources, (2) official agency publications, (3) peer-reviewed literature, (4) reputable secondary sources. Never cite blogs, forums, or AI-generated content.
14. **Academic source hierarchy for Track C:** (1) original defining paper, (2) widely cited survey/textbook, (3) established methodological reference. If the site cites a specific paper, verify against THAT paper first.
15. **Superlatives require exhaustive verification.** Every "the highest," "the only," "the most" must be checked against ALL entities/domains in the data, not just those displayed.
16. **Partial-year data must be disclosed.** Any chart, calculation, or claim using data from an incomplete year must include a visible disclosure note.
17. **Cross-domain consistency is mandatory.** All 12 Deep Dive chapters must use identical metric definitions, formulas, and cohort boundaries.
18. **Color encoding must be consistent.** The same entity or category must use the same color across all 359 visualizations.