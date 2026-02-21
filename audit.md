# PatentWorld Comprehensive Audit, Fix, and Deploy — Claude Code Prompt

## ROLE

You are a forensic editor, data/visualization auditor, academic methodology reviewer, technical SEO engineer, accessibility specialist, and full-stack developer operating on the PatentWorld codebase. Your PRIMARY mandate is **absolute accuracy and precision**: every number, percentage, ranking, trend claim, caption, takeaway, legal reference, citation, derived metric formula, methodology description, and external factual claim on the website must be provably correct. Your SECONDARY mandate is **academic rigor**: every statement must be defensible in a peer-reviewed context, free of unsupported causal language, and free of politically or socially sensitive presentation that could undermine credibility.

---

## CONTEXT

- **Project directory:** `/home/saerom/projects/patentworld`
- **Live site (post-deploy):** `https://patentworld.vercel.app/`
- **Hosting:** Vercel (auto-deploys on push to main).
- **Site structure:** 34 chapters organized into 6 Acts, **458 interactive visualizations**, covering 9.36M US patents (1976–2025) sourced from PatentsView.
  - Act 1 — The System (7 chapters): Patent Count, Patent Quality, Patent Fields, Convergence, Language of Innovation, Patent Law & Policy, Public Investment
  - Act 2 — The Organizations (5 chapters): Assignee Composition, Organizational Patent Count, Organizational Patent Quality, Patent Portfolio, Interactive Company Profiles
  - Act 3 — The Inventors (5 chapters): Top Inventors, Generalist vs. Specialist, Serial Inventors vs. New Entrants, Gender and Patenting, Team Size and Collaboration
  - Act 4 — The Geography (2 chapters): Domestic Geography, International Geography
  - Act 5 — The Mechanics (3 chapters): Organizational Mechanics, Inventor Mechanics, Geographic Mechanics
  - Act 6 — Deep Dives (12 chapters): 3D Printing, Agricultural Technology, Artificial Intelligence, Autonomous Vehicles, Biotechnology, Blockchain, Cybersecurity, Digital Health, Green Innovation, Quantum Computing, Semiconductors, Space Technology
  - Plus: Homepage, About page, Explore page, and any Methodology/Sitemap/Data Dictionary pages
- **Component inventory:**
  - **30 chart component types** (e.g., AreaChart, BarChart, LineChart, ScatterPlot, TreeMap, Sankey, Choropleth, RadarChart, HeatMap, StackedBar, GroupedBar, PieChart, DonutChart, BubbleChart, WaterfallChart, BoxPlot, ViolinPlot, FunnelChart, GaugeChart, SparkLine, ComboChart, StreamGraph, ForceDirectedGraph, CirclePacking, SunburstChart, ParallelCoordinates, RidgePlot, BeeswarmPlot, DumbbellChart, SlopeChart)
  - **24 chapter content component types** (e.g., ChapterHero, NarrativeSection, KeyTakeaway, SummaryBox, DataTable, ComparisonPanel, TimelineView, MetricCard, InsightCallout, MethodologyNote, CiteThisFigure, GlossaryTooltip, FigureCaption, ChapterNavigation, ActHeader, CrossReference, DataSourceNote, LimitationDisclosure, ConfounderNote, FilterControl, ToggleSwitch, TabPanel, AccordionSection, InteractiveExplorer)
  - **8 layout/navigation component types** (e.g., Header, NavPanel, Footer, Breadcrumb, SkipToContent, ScrollProgress, MobileMenu, SearchOverlay)
- **Typography:** 3 font families — Playfair Display (headings), Plus Jakarta Sans (body text), JetBrains Mono (code/data labels). 18+ color palettes including 15 ENTITY_COLORS for consistent entity encoding.
- **CiteThisFigure:** Generates both APA and BibTeX citation formats with author, title, year, URL, and access date fields.
- **Working method:** All code reading and file editing happens on the local source files. Do NOT crawl or fetch the live site. Use web search to verify external factual claims.
- **Accuracy mandate:** Do not guess. If something cannot be verified from the source files, data files, computed checks, OR authoritative online sources, write exactly: `"I cannot confirm."` Never "correct" a value without proving the correct value from a verifiable source.

---

## THREE VERIFICATION TRACKS

**Track A — Data-Driven Claims** (verified against repo data files): Numbers, percentages, rankings, trends derived from PatentsView data. Verified by tracing data lineage and running independent computation scripts.

**Track B — External Factual Claims** (verified via web search): Patent law, court decisions, academic citations, institutional facts, definitions, global statistics, technology milestones, methodology attributions, author affiliation.

**Track C — Methodology & Derived Metrics** (verified against code AND literature): How metrics are computed, what algorithms produce the results, whether implementations match the cited/standard academic definitions.

**Track D — Sensitivity & Controversy Screening** (reviewed for neutrality, precision, and academic defensibility): Every statement touching geopolitics, gender, national characterization, causal policy claims, loaded terminology, or metric-to-concept conflation must be screened. Categories:
- `GEOPOLITICAL` — Taiwan sovereignty, territorial framing, diplomatic sensitivities (e.g., "distinctive institutional circumstances" as vague geopolitical language)
- `GENDER_FRAMING` — normative targets, parity assumptions, gap framing without baseline justification (e.g., "well below parity" implies 50% is a normative target)
- `NATIONAL_CHARACTERIZATION` — asymmetric hedging of quality metrics across countries (e.g., "lower average claims" for China without equivalent hedging for other countries)
- `CAUSAL_POLICY` — policy changes presented as causes of patenting trends without methodological support
- `LOADED_TERMINOLOGY` — politically charged terms from research literature used without attribution or neutralization (e.g., "patent troll")
- `METRIC_CONFLATION` — patent filing volume equated with "inventive activity," "innovation," or "technological progress" without disclosure that patents are a proxy measure

---

## EXECUTION MODEL — FOUR SEQUENTIAL PHASES

Complete each phase fully before proceeding. Save progress after each Act within Phase 1. After each phase, print a status summary.

---

## PHASE 1: DISCOVERY & AUDIT

### 1.1 — Map the Codebase

```bash
cd /home/saerom/projects/patentworld

# Project structure (source files)
find . -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' -o -name '*.mdx' -o -name '*.md' \) | grep -v node_modules | grep -v .next | sort

# Framework, dependencies, scripts
cat package.json

# Routing/build config
cat next.config.* 2>/dev/null || cat vite.config.* 2>/dev/null

# Static assets
ls -laR public/

# Data files
find . -type f \( -name '*.csv' -o -name '*.json' -o -name '*.parquet' -o -name '*.tsv' \) | grep -v node_modules | grep -v .next | sort

# Chart libraries
grep -rE "recharts|d3|chart\.js|plotly|nivo|visx|victory|observable" package.json

# Font files and imports
grep -rE "@font-face|font-family|google.*fonts|next/font" --include='*.tsx' --include='*.ts' --include='*.css' --include='*.scss' . | grep -v node_modules | head -50

# Git state
git log --oneline -20
git remote -v
git branch --show-current
git status
```

If the working tree is dirty, stash or commit with `"chore: stash pre-audit state"`.

### 1.2 — Data Source Registry

Save to `audit/data-source-registry.md`. For each data file:
- File path, format, schema (columns + types), row count
- Time coverage (earliest/latest year)
- Key identifiers (patent numbers, assignee IDs, CPC codes, inventor IDs)
- PatentsView data version / download date (if identifiable)
- Disambiguation version for inventor and assignee IDs
- Which pages import this data (trace `import` statements)
- Transformation functions and their file paths
- Whether CPC reclassification over time is handled
- Data lineage map: raw file → transformation → chart/text

### 1.3 — Page and Visualization Inventory

Save to `audit/page-inventory.md`. For EVERY page/route:
- File path, route URL, page title, Act + position
- Meta description, JSON-LD presence, heading hierarchy
- Count of visualization components on the page
- Verify total visualization count = 458
- Verify total chapter count = 34
- Verify Act chapter counts: 7 + 5 + 5 + 2 + 3 + 12 = 34

Also inventory:
- Homepage, About page, Explore page, any Methodology page, Sitemap page, Data Dictionary page, 404 page
- For EACH of these non-chapter pages, record what content they contain

### 1.4 — Technology Domain Definition Registry

Save to `audit/technology-domain-definitions.md`. For each of the 12 Deep Dive domains:
- Domain name, definition method (CPC codes, keywords, patent IDs, other)
- Specific codes/keywords that define membership
- File path of the definition
- Whether definition is disclosed on the chapter page
- Whether domains overlap (a patent in both AI and Cybersecurity)
- Whether overlap is disclosed

### 1.5 — Derived Metrics Registry

Save to `audit/derived-metrics-registry.md`. Catalog EVERY derived metric:

| Metric | Formula in Code | File Path | Cited Source | Standard Definition | Match? | Pages Used |
|--------|----------------|-----------|--------------|--------------------:|--------|------------|

Known metrics to look for: originality, generality, Shannon entropy, HHI, top-4 concentration, citation half-life, blockbuster rate, exploration score, patent velocity, CAGR, novelty (median entropy), Lorenz/Gini measures, convergence indices, subfield diversity, entry velocity multiplier.

For each, record whether code matches the standard/cited academic formula.

---

### 1.6 — TRACK A: Data Accuracy Audit

Process chapters IN ORDER: Act 1 (chapters 1–7) → Act 2 (8–12) → Act 3 (13–17) → Act 4 (18–19) → Act 5 (20–22) → Act 6 (23–34) → Homepage → About → Explore → Other pages.

Save checkpoint after each Act: `audit/checkpoint-act-N.md`.

For EVERY page, perform ALL of the following:

#### 1.6.1 — Number-by-Number Verification
For every number on the page (narrative, captions, figure labels, table cells, tooltips, summary boxes, takeaway sections):
1. Quote the exact text.
2. Classify as Track A, B, or C.
3. For Track A: trace data source → independently compute → record result.
4. Save scripts to `audit/verification-scripts/`.

#### 1.6.2 — Homepage Hero Statistics
Verify each independently:
- **"9.36M Patents"**: compute exact total from data; verify rounds to 9.36M.
- **"50 Years"**: 1976–2025 inclusive = 50 year labels but only 49 completed full years (2025 is partial). Which convention does the site use? Is it consistent with the text "from 1976 to 2025"?
- **"34 Chapters"**: count chapter page files.
- **"458 Visualizations"**: count all visualization components across all pages (original site text may say "359" — verify and update if needed).

#### 1.6.3 — Homepage Hero Text vs. Chapter Data Cross-Reference
The hero text states: *"Annual grants increased five-fold over this period, from 70,000 to 374,000, as computing and electronics rose from 12% to over 40% of all patent output."*

Verify:
- "five-fold": is 374,000 / 70,000 ≈ 5.0? (It is 5.34×, so "five-fold" is approximate — is this acceptable or should it say "more than five-fold"?)
- "from 70,000 to 374,000": which years? 1976 and 2024? Or 2025? The Patent Count card says "374,000 in 2024." But the hero says "from 1976 to 2025." Potential mismatch: is the endpoint 2024 or 2025?
- **"computing and electronics rose from 12% to over 40%"**: what does this measure? The Patent Fields card says CPC G+H went from 27% to 57%. The Language card says computing/semiconductor NLP topics went from 12% to 33%. Neither is "12% to over 40%." Identify which data source this claim comes from and whether it is correct. If it conflates two different measures, flag as a critical accuracy error.

#### 1.6.4 — Homepage Chapter Card Summaries
For EVERY one of the 34 chapter cards on the homepage:
1. Extract every number from the card text.
2. Cross-reference against the corresponding chapter page's data.
3. If any number differs, flag as cross-page inconsistency.
Save to `audit/homepage-card-crosscheck.md`.

#### 1.6.5 — Percentage and Share Verification
For every percentage: verify numerator, denominator, arithmetic (±0.1 pp tolerance). For grouped shares: verify they sum correctly (100% if exhaustive). Flag sums >100.1% or <99.9% without "Other" category.

#### 1.6.6 — Ranking and Ordering Verification
For every "Top N" or ordered display: independently sort data, verify order matches, verify entities are correct top/bottom N, check tie-breaking.

#### 1.6.7 — Superlative Verification (EXHAUSTIVE)
The site contains numerous superlatives. Each MUST be checked against the ENTIRE comparison set (not just displayed entities). Known superlatives from the homepage alone:

1. "IBM leads with 161,888 cumulative grants" — verify against ALL assignees
2. "Amazon holds the highest blockbuster rate at 6.7%" — verify against ALL assignees
3. "Microsoft leads in average citations at 30.7" — verify against ALL assignees
4. "Samsung peaked at 9,716 annual grants in 2024" — verify "peaked" and "2024"
5. "California accounts for 23.6% of all US patent grants" — verify against all states
6. "Japan leads foreign filings with 1.45 million" — verify against all countries
7. "Biotechnology achieved the lowest top-four concentration among all domains" — verify against all 12 domains
8. "Quantum computing remains the most concentrated domain" — verify against all 12 domains
9. "the only domain where early entrants patent faster than later entrants" (Quantum) — verify against all 12 domains
10. "the only advanced technology domain showing sustained consolidation" (Semiconductors) — verify against all 12 domains
11. "the only advanced technology domain in the study to reverse course" (Blockchain) — verify against all 12 domains
12. "the widest range among all domains" (Space Technology concentration) — verify against all 12 domains
13. "the highest entry velocity multiplier (5.5-fold)" (Green Innovation) — verify against all 12 domains
14. "HHS/NIH leads with 55,587 government-funded patents" — verify against all agencies
15. "The most prolific inventor holds 6,709 patents" — verify against all inventors
16. "Chemistry leads female representation at 14.6%" — verify against all fields

For EACH superlative: write a script that computes the metric for ALL entities and confirms the claim. Save to `audit/superlative-checks.md`.

#### 1.6.8 — Time Series and Trend Verification
For every trend claim: verify start/end values, direction, data gaps, time window stated vs. plotted, growth rate calculations (CAGR, percentage change), truncation bias.

#### 1.6.9 — Partial-Year 2025 Handling
1. Determine actual last date of data in the repo.
2. Check every chart including 2025: is partial-year status disclosed?
3. Check every calculation using 2025 as endpoint: is it biased?
4. Check for visual truncation artifacts (false drop-offs).
5. The hero says "1976 to 2025" but the Patent Count card says "374,000 in 2024" — is 2025 the last full year or a partial year? Clarify which.

#### 1.6.10 — Figure-to-Data Alignment
For every chart: trace code → data → raw file. Verify chart type appropriateness, axis ranges (zero baseline, clipping, tick intervals), legend accuracy, tooltip accuracy.

#### 1.6.11 — Table-to-Data Alignment
For every table: verify every cell, column headers, row ordering, totals/subtotals.

#### 1.6.12 — Caption Accuracy
For every caption: variables named correctly, time period correct, sample/scope correct, aggregation level correct, no over-interpretation, no causal language.

#### 1.6.13 — Narrative and Takeaway Verification
Every factual claim must be supported. Flag: unsupported, contradicted, over-stated, under-specified. Verify every comparison and superlative.

#### 1.6.14 — Cross-Page Consistency
Same statistic on multiple pages must match. Same terminology everywhere. Code matches methodology descriptions.

Specific known cross-page items to check:
- "Amazon highest blockbuster rate 6.7%" appears on both Org Quality card and Company Profiles card
- "IBM 161,888 cumulative grants" appears on Org Patent Count card and Company Profiles card
- "229 CPC subclasses" appears in Company Profiles card — verify what entity this refers to

#### 1.6.15 — Assignee Name Consistency
Verify same entity = same display name on every page. Check name mapping file. Flag "Samsung Electronics" vs. "Samsung," "International Business Machines" vs. "IBM," etc.

#### 1.6.16 — Censoring, Truncation, Missing Data Disclosure
Right-censoring (citations), left-truncation, entity exclusions, undisclosed filtering, PatentsView disambiguation caveats.

#### 1.6.17 — Deep Dive Cross-Domain Framework Consistency
All 12 Deep Dive chapters must use:
- Identical metric definitions (top-4 concentration, entry velocity, subfield diversity, patent velocity multiplier)
- Same code path or equivalent computation
- Same cohort year boundaries ("1970s entrants," "1990s entrants," "2000s entrants," "2010s entrants")
- Cross-domain superlatives verified against ALL 12 simultaneously

Write a single comprehensive script that computes key metrics for all 12 domains and validates every cross-domain claim.

#### 1.6.18 — Raw Statistic Confounder Disclosure
Flag any comparative statistic presented as a raw average without disclosing whether confounding variables are controlled. Known instances:
- **Gender chapter**: "All-male teams average 14.2 forward citations, mixed-gender teams 12.6, and all-female teams 9.5." If this is a raw average (not controlling for field, year, team size, or firm), this MUST be disclosed. Otherwise, the reader may interpret this as evidence that team gender composition causally affects citation impact.
- Any cross-group comparison (by geography, by firm type, by inventor type) that presents raw averages without acknowledging composition effects.

#### 1.6.19 — Tooltip Formatting Consistency
For ALL 458 visualizations, verify:
- Tooltip number format matches the axis label format (e.g., if the axis shows "12.3K," the tooltip should not show "12,345" without explanation).
- Tooltip entity names match legend names exactly (no truncation, no casing mismatch).
- Tooltip year/date format is consistent across all charts (e.g., "2024" vs. "2024-01" vs. "Jan 2024").
- Tooltips for percentage values show the same decimal precision as axis labels and narrative text.
- Tooltips that display multiple values use a consistent ordering (e.g., always label first, then value).
Save inconsistencies to `audit/tooltip-consistency.md`.

#### 1.6.20 — Dynamic/Computed Text Verification
Audit ALL dynamic text generated by formatting functions:
- `formatCompact()`: verify abbreviation thresholds (K, M, B) and rounding precision. Trace all call sites.
- `.toFixed()`: verify decimal precision matches the context (percentages vs. raw counts vs. ratios).
- `.toLocaleString()`: verify consistent formatting output (see §1.6.21 for locale issues).
- Template literals in narrative text: verify that interpolated values match the data source and are formatted consistently with surrounding static text.
- Conditional text (e.g., "increased" vs. "decreased" based on sign): verify logic is correct and edge cases (zero, NaN, undefined) are handled.
Save to `audit/dynamic-text-verification.md`.

#### 1.6.21 — Locale-Independence Verification
Search the entire codebase for `.toLocaleString()` calls:
- Flag ANY call that does not explicitly specify `'en-US'` as the locale parameter, since the browser's default locale may produce unexpected formatting (e.g., "1.234,56" in German locale).
- Verify that `Intl.NumberFormat` usages (if any) explicitly set locale.
- Verify that date formatting functions use explicit locale.
- Test: set `navigator.language` to a non-English locale conceptually and verify all formatted output would remain correct.
Save all unlocalized calls to `audit/locale-independence.md`.

#### 1.6.22 — CiteThisFigure Comprehensive Field Audit
For ALL 458 figures (not a sample), verify the CiteThisFigure component generates correct output:
1. **Author field**: Must read "Saerom (Ronnie) Lee" — verify exact string on every instance.
2. **Title field**: Must match the figure caption/title exactly — no truncation, no paraphrasing.
3. **Year field**: Must match the current year or the year the data was last updated — verify consistency.
4. **URL field**: Must be the correct permalink for the specific figure, not just the chapter URL.
5. **Institution field**: Must read "The Wharton School, University of Pennsylvania" — verify exact string.
6. **APA format**: Verify structure follows APA 7th edition: Author. (Year). Title. Site Name. URL.
7. **BibTeX format**: Verify all required fields (@misc: author, title, year, url, note) are present and correctly escaped.
8. **Access date**: If included, verify it is dynamically generated (not hardcoded to a past date).
Save to `audit/cite-this-figure-audit.md` with a row for every figure.

---

### 1.7 — TRACK B: External Factual Claims Verification (WEB SEARCH)

#### 1.7.1 — Extract All External Claims
Save to `audit/external-claims-registry.md`. Categories:
- `LAW` — statutes, regulations, effective dates
- `CASE` — court decisions, holdings, dates
- `POLICY` — patent office policies, institutional changes
- `HISTORY` — historical events, legislative history
- `DEFINITION` — legal/technical term definitions
- `CITATION` — academic papers, books, reports
- `INSTITUTION` — organizational facts
- `COMPARATIVE` — external benchmark comparisons
- `METHODOLOGY` — references to methods/formulas from literature
- `TECHNOLOGY_CONTEXT` — technology milestones, patent expirations, historical tech events
- `AFFILIATION` — author/contributor credentials and institutional affiliations

#### 1.7.2 — Patent Law and Policy Verification
Verify against: primary statutes (35 U.S.C.), Federal Register, USPTO.gov, WIPO.int, MPEP, CRS reports.

Specific known claims to verify:
- "Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021)" — verify count of 21, verify Bayh-Dole date (actually signed December 12, 1980), verify *United States v. Arthrex, Inc.* decided 2021.
- Every named act and decision on the Patent Law & Policy page: name, date, substance, section numbers, effective dates.

#### 1.7.3 — Court Decisions: verify case names, years, courts, holdings, citation format.

#### 1.7.4 — Academic Citations: verify authors, titles, years, journals, DOIs/URLs, characterization of findings.

#### 1.7.5 — Definitions: verify against MPEP, 35 U.S.C., WIPO Glossary, original papers.

#### 1.7.6 — Comparative Claims: verify external benchmarks against WIPO/USPTO reports.

#### 1.7.7 — Technology Context Claims
Known claims to verify:
- "the expiration of key FDM patents in 2009 opened the field to broad-based competition" (3D Printing) — verify specific FDM patent expiration dates; flag "opened the field" as causal.
- "driven by the precision agriculture revolution" (Ag Tech) — flag "driven by" as causal.
- "driven by successive waves from recombinant DNA to CRISPR-Cas9" (Biotech) — flag "driven by" as causal; verify technology wave timeline.
- Any other technology milestone dates or characterizations.

#### 1.7.8 — Author Affiliation Verification
Verify: "Saerom (Ronnie) Lee, The Wharton School, University of Pennsylvania" — search for this person's current affiliation. Verify the author's personal website link (https://www.saeromlee.com) resolves correctly.

#### 1.7.9 — Compile Track B Report
Save to `audit/external-claims-verification.md`.

#### 1.7.10 — External Link Security and Validity
For EVERY external link (`href` pointing to `http://` or `https://`) in the entire codebase:
1. **Inventory**: Extract all external URLs from all `.tsx`, `.ts`, `.jsx`, `.mdx`, and `.md` source files. Save the complete list to `audit/external-links-inventory.md`.
2. **Security attributes**: Every `<a>` tag with `target="_blank"` MUST have `rel="noopener noreferrer"`. Flag any that are missing either attribute.
3. **Protocol**: Flag any `http://` links that should be `https://`.
4. **Destination validity**: Test each URL with `curl -sI [URL]` and verify HTTP 200 (or valid redirect). Flag dead links (4xx, 5xx, connection failures).
5. **Link text accessibility**: Verify no links use generic text like "click here" or "link" — link text should be descriptive.
6. **Government/legal links**: Verify that links to `.gov` sites, court opinions, and legislative text still resolve to the correct content (government sites frequently reorganize).
Save results to `audit/external-link-audit.md`.

---

### 1.8 — TRACK C: Methodology and Derived Metrics

#### 1.8.1 — Derived Metric Formula Audit (Code vs. Literature)
For every metric: compare code implementation to the canonical academic definition. Check:
- HHI: market share as fraction or percentage? Denominator convention?
- Originality/generality: which technology classification (NBER classes, CPC sections, CPC subclasses)?
- Shannon entropy: log base (natural, 2, 10)? Normalization?
- Citation half-life: patent-level or cohort-level?
- Blockbuster rate: what percentile threshold? Computed within year, within field, or overall?
- Exploration score: "new" relative to what baseline?
- Entry velocity multiplier: how computed? Is it a ratio of cohort means?

#### 1.8.2 — Gender Inference Methodology Audit
Verify: method used, disclosure on page, error rates, ethnic/geographic bias acknowledgment, confidence threshold, handling of ambiguous/unclassifiable names, fraction unclassified, whether citation comparisons control for confounders.

#### 1.8.3 — NLP/Topic Modeling Audit
Verify: algorithm, text corpus, number of topics, selection criteria, topic labels, "novelty (median entropy)" definition, disclosure on page.

#### 1.8.4 — Network/Clustering Audit
Verify: algorithm, k selection, similarity metric, network tie definition, counts (248, 8, 632, 1,236), disclosure on page.

#### 1.8.5 — Track D: Sensitivity & Controversy Screening (SYSTEMATIC)

Screen EVERY chapter page, the homepage, About page, and Explore page for the following categories. This is NOT a spot-check — read every paragraph of narrative text and every caption.

**D1 — GEOPOLITICAL sensitivity:**
- Search all pages for references to Taiwan, Tibet, Hong Kong, Crimea, Palestine/Israel, Kashmir, and any other disputed territories.
- Flag vague geopolitical language (e.g., "distinctive institutional circumstances" at `geo-international/page.tsx:545`) that avoids naming a political reality but could be read as either evasive or politically loaded.
- Verify that country lists and maps do not inadvertently imply sovereignty positions (e.g., listing Taiwan separately from China without noting the complexity, or including it under China without noting its separate patent system).
- **Standard**: Use neutral, descriptive language. State facts about patent systems without implying political positions. If a patent office exists (e.g., TIPO in Taiwan), refer to it by office name.

**D2 — GENDER_FRAMING:**
- Search all pages for "parity," "gap," "underrepresentation," "below," "behind," "lagging," and similar evaluative framing of gender statistics.
- Flag any instance where a normative target (e.g., 50% as "parity") is implied but not justified. Example: "well below parity" at `inv-gender/page.tsx:169` implies 50% is the expected baseline without stating why.
- Flag any gender inference methodology that has higher error rates for non-Western names (e.g., `inv-gender/page.tsx:614`) but does not disclose this in the narrative.
- **Standard**: Present statistics descriptively ("Women represent X% of inventors") rather than evaluatively ("Women remain underrepresented"). If a normative benchmark is used, cite its source.

**D3 — NATIONAL_CHARACTERIZATION:**
- Search all pages for asymmetric quality characterizations across countries. Example: "lower average claims" for China at `geo-international/page.tsx:146,338` — is equivalent hedging applied to other countries' metrics?
- Flag any framing that could be read as implying one country's patents are inherently lower quality without controlling for field composition, patent office practices, or strategic filing behavior.
- **Standard**: When comparing countries, always note that differences may reflect field composition, patent office procedures, filing strategies, or definitional differences — not inherent quality differences.

**D4 — CAUSAL_POLICY:**
- Search all pages for claims that legislative acts, court decisions, or policy changes "caused," "led to," "drove," "spurred," or "prompted" changes in patenting trends.
- Flag any such claim unless accompanied by a methodological citation supporting the causal inference (e.g., a difference-in-differences study or regression discontinuity design).
- **Standard**: Use "was followed by," "coincided with," or "occurred during the same period as" unless causal evidence is cited.

**D5 — LOADED_TERMINOLOGY:**
- Search all pages for terms that are politically charged in IP policy debates: "patent troll" (use "non-practicing entity" or "patent assertion entity"), "patent thicket," "evergreening," "submarine patent," "patent shark."
- Example: "patent troll" at `system-patent-law/page.tsx:214` — even if sourced from research, the term is politically loaded and should be attributed or replaced.
- **Standard**: Use neutral terminology. If a loaded term must be used because it appears in a cited source, place it in quotation marks and attribute it.

**D6 — METRIC_CONFLATION:**
- Search all pages for instances where patent filing volume is equated with "innovation," "inventive activity," "technological progress," or "creativity."
- Example: `geo-international/page.tsx:145` equates patent filings with "inventive activity."
- **Standard**: Patents are a proxy for inventive activity, not a direct measure. Add a disclosure or caveat: "Patent filings are used here as a proxy for inventive activity, though they capture only a subset of innovation output."

Save ALL findings to `audit/sensitivity-screening.md` with columns: `ID | Category | File | Line | Quoted Text | Concern | Recommended Revision`.

#### 1.8.6 — Technology Pivot Detection Audit
Verify: operational definition, detection algorithm, count (51 pivots, 20 companies), causal claim ("often years before strategic shifts become publicly visible" — supported by evidence?), disclosure on page.

#### 1.8.7 — Compile Track C and Track D Reports
Save Track C results to `audit/methodology-verification.md`.
Save Track D results to `audit/sensitivity-screening.md`.

---

### 1.9 — Language, Presentation, and Sensitivity Audit

#### 1.9.1 — Causal and Quasi-Causal Language (COMPREHENSIVE FLAG LIST)
Flag ALL of the following unless the methodology supports causal inference:

**Direct causal connectors** (always flag): "caused," "led to," "resulted in," "due to," "because of," "driven by," "enabled," "contributed to," "fostered," "spurred," "fueled," "prompted," "triggered," "gave rise to," "brought about"

**Soft-causal connectors** (flag and evaluate): "reflecting," "as" (when used to imply causation, e.g., "as computing grew..."), "with the emergence of," "opened the field to," "in response to," "following," "in the wake of"

**Replace with**: "is associated with," "coincided with," "occurred alongside," "was accompanied by," "was followed by," "during the same period as"

#### 1.9.2 — Informal and Colloquial Language
Disallowed: "a lot of," "pretty much," "kind of," "really big," "skyrocketed," "exploded," "game-changer," "interesting to note," "it is worth noting," "it turns out," "notable that," "remarkably," "importantly," "interestingly," "strikingly," "dramatically" (unless quantified), "significantly" (unless statistical significance is tested)

#### 1.9.3 — Socially and Politically Sensitive Content
Flag any content that could undermine credibility or be misinterpreted:

- **Gender analysis**: raw citation averages by team gender composition without controlling for field, year, team size, or firm could be misinterpreted as evidence of innate differences. MUST include confounder disclosure. Consider adding: "These raw averages do not control for differences in field composition, team size, or institutional affiliation across gender groups."
- **International comparisons**: US-China comparisons (e.g., "China grew from 299 filings in 2000 to 30,695 in 2024") should be presented neutrally without implying threat or competition. Avoid language that could be read as nationalist framing.
- **Domestic geography**: "California produces more than the bottom 30 states combined" — factual but potentially provocative framing. Consider neutral alternative: "California accounts for the largest single-state share."
- **Race/ethnicity**: if any analysis touches on inventor demographics beyond gender, ensure presentation is neutral, confounder-controlled, and limitation-disclosed.
- **Organizational rankings**: ranking firms by patent counts without noting that patent strategy varies (some firms patent aggressively, others rely on trade secrets) could mislead.
- **"Government-funded patents"**: political sensitivity around public investment; present neutrally.

For each flagged item: record the text, explain the sensitivity, and propose a neutral rewrite.

#### 1.9.4 — Acronym and Abbreviation Audit
For EVERY page: verify every acronym (CPC, USPTO, HHI, CAGR, NLP, AIA, PCT, etc.) is defined at first use ON THAT PAGE. Do not assume the reader has read previous chapters.

#### 1.9.5 — Terminology Consistency
Build a terminology table: every concept and every term used to describe it. Flag inconsistencies. Examples:
- "patent grants" vs. "granted patents" vs. "issued patents"
- "assignee" vs. "organization" vs. "firm" vs. "company"
- "inventor" vs. "patentee"
- "forward citations" vs. "citations received" vs. "citation count"
- "CPC section" vs. "CPC class" vs. "technology field"

Save to `audit/terminology-consistency.md`.

#### 1.9.6 — GlossaryTooltip Accessibility Audit
The site uses `GlossaryTooltip` components (24 terms defined). Audit ALL instances:
1. **Hover-only access**: GlossaryTooltip content triggered only on hover is inaccessible to touch devices, keyboard users, and screen readers. Flag every instance.
2. **Keyboard operability**: Verify GlossaryTooltip can be triggered via `focus`/`Tab` key, not just `mouseenter`.
3. **Screen reader support**: Verify tooltips use `aria-describedby` or `role="tooltip"` with proper association to the trigger element.
4. **Touch device support**: Verify tooltips can be activated on tap (not just hover) for mobile/tablet users.
5. **Dismiss behavior**: Verify tooltips can be dismissed with `Escape` key (WCAG 1.4.13).
Save findings to `audit/glossary-tooltip-accessibility.md`.

#### 1.9.7 — Glossary Term Completeness Audit
The glossary currently defines 24 terms. Audit the ENTIRE site narrative for technical terms used but NOT defined in the glossary:
1. Extract all terms wrapped in `GlossaryTooltip` — these are the defined terms.
2. Search all narrative text for technical/specialized terms (e.g., "forward citations," "patent family," "continuation patent," "provisional application," "claim count," "patent examiner," "prior art," "prosecution history," "inter partes review," "patent portfolio," "technology class," "subfield diversity," "blockbuster rate").
3. For each undefined term: flag and recommend adding to glossary.
4. Verify that glossary definitions are accurate and consistent with how the term is used in context.
Save to `audit/glossary-completeness.md`.

#### 1.9.8 — Error and Loading State Audit
For EVERY data-dependent component across ALL 458 visualizations and all pages:
1. **Loading state**: What does the user see while data is being fetched? Verify a loading indicator (spinner, skeleton, placeholder) is shown — not a blank area.
2. **Error state**: What happens if the data fetch fails (network error, corrupted JSON, 404)? Verify an error message is displayed — not an infinite spinner or blank chart.
3. **Empty state**: What happens if the data file exists but contains no records for the requested filter/selection? Verify a "No data available" message — not a blank chart.
4. **Fallback content**: Verify that `<noscript>` fallbacks exist for all charts (cross-reference with §1.12.1).
5. **Console errors**: Identify any components that log errors to the console during normal operation.
Save to `audit/error-loading-states.md`.

#### 1.9.9 — Entity-to-Color Consistency Audit
The codebase defines 15 `ENTITY_COLORS` for consistent entity encoding across all 458 charts. Verify:
1. **Color mapping file**: Locate the definitive color mapping (e.g., `ENTITY_COLORS` constant). Record all 15 entity-color pairs.
2. **Usage audit**: For EVERY chart that displays a named entity (company, country, state, CPC section), verify it uses the centralized color mapping — not a hardcoded or ad hoc color.
3. **Cross-chapter consistency**: The same entity (e.g., "IBM," "Japan," "CPC Section G") must appear in the same color on every chart across all chapters.
4. **Unnamed/overflow entities**: When a chart displays more entities than the 15 defined colors, verify a consistent fallback palette is used.
5. **Colorblind safety**: Verify that the 15-color palette is distinguishable under protanopia, deuteranopia, and tritanopia simulations.
Save to `audit/entity-color-consistency.md`.

#### 1.9.10 — Copyright, License, and Data Attribution Audit
Verify the site includes proper legal and attribution notices:
1. **Copyright notice**: Is there a copyright notice anywhere on the site (footer, About page)? If not, flag as missing. Recommended: "© [Year] Saerom (Ronnie) Lee. All rights reserved." or an appropriate open license.
2. **PatentsView license compliance**: PatentsView data is released under CC-BY 4.0. Verify the site includes proper attribution as required by the license (author, title, source, license link). Check that the attribution appears on every page that uses the data (or at minimum on the About page and footer).
3. **Academic citation license**: If any charts or analyses are derived from published academic papers, verify that the use complies with the source paper's terms.
4. **Code/library licenses**: Verify that all npm dependencies have compatible licenses (no GPL-only libraries in a proprietary project, if applicable).
5. **Font licenses**: Verify that Playfair Display, Plus Jakarta Sans, and JetBrains Mono are used under their respective open licenses and that license terms are met.
Save to `audit/copyright-license-attribution.md`.

#### 1.9.11 — Small-Sample Warnings and Edge Case Audit
Search ALL chapters for statistics computed from small samples:
1. **Small-N warnings**: Flag any statistic (average, percentage, ranking) computed from fewer than 30 observations without a small-sample disclosure. Example: early-year data for emerging technologies (Quantum Computing pre-2000, Space Technology pre-2010) may have very few patents.
2. **Consistency check**: Verify that small-sample warnings are applied consistently across all chapters — not present in some and absent in others.
3. **Division by zero / NaN**: Search for any computed metric that could produce NaN, Infinity, or division-by-zero for edge-case data (e.g., a technology domain with zero patents in a given year).
4. **Single-entity dominance**: Flag any statistic where a single entity (company, inventor, state) accounts for >50% of the sample, as the "average" or "trend" may be dominated by that entity.
5. **Partial-year edge cases**: For 2025 (partial year), verify that year-over-year growth rates, annual averages, and rankings do not treat partial-year data as a full year.
Save to `audit/small-sample-edge-cases.md`.

#### 1.9.12 — Font Consistency Audit
The site uses 3 font families: Playfair Display (headings), Plus Jakarta Sans (body), JetBrains Mono (code/data labels). Verify:
1. **Heading fonts**: ALL headings (`h1`–`h6`) across ALL pages use Playfair Display. No heading uses a body or monospace font.
2. **Body text fonts**: ALL paragraph text, captions, descriptions, and narrative content use Plus Jakarta Sans.
3. **Data label fonts**: ALL chart axis labels, tick marks, tooltip text, and data values in tables use JetBrains Mono (or Plus Jakarta Sans — identify the convention and verify consistency).
4. **Font weight consistency**: Same heading level = same font weight across all pages.
5. **Font loading**: Verify fonts are loaded via `next/font` (or equivalent) with `display: swap` to prevent FOIT. Verify no external Google Fonts CDN calls that could fail or slow loading.
6. **Fallback fonts**: Verify appropriate fallback font stacks (e.g., `'Playfair Display', Georgia, serif`).
Save to `audit/font-consistency.md`.

---

### 1.10 — Structure, Navigation, and Design Audit

#### 1.10.1 — Navigation and Header
- Verify all navigation links work (PatentWorld logo → /, Explore → /explore/, About → /about/).
- Is the navigation panel sufficient? Should it include: Methodology, Data Dictionary, Sitemap?
- Does the navigation work on mobile (hamburger menu)?
- Is there a search function? If not, flag as missing for a 34-chapter site.

#### 1.10.2 — Footer Completeness
The footer currently contains: About link, Explore link, "Data from PatentsView (USPTO)."
Verify and flag if missing:
- Methodology / How We Built This link
- Data version / download date
- License / terms of use (PatentsView uses CC-BY 4.0)
- Contact information
- Privacy policy (if applicable)
- Last updated date
- Full citation format for the site itself

#### 1.10.3 — Breadcrumb Navigation
Every chapter page should show breadcrumbs: Home > Act N: [Act Title] > Chapter Title. Verify presence and accuracy on every chapter page.

#### 1.10.4 — Act/Chapter Sequencing
- Acts follow logical progression: System → Organizations → Inventors → Geography → Mechanics → Deep Dives.
- Within each Act, chapters are ordered logically.
- Forward references to later chapters provide sufficient context.
- Cross-links exist between related chapters across Acts.

#### 1.10.5 — URL Slug Consistency
Verify URL slugs match chapter titles consistently:
- `system-patent-count` ✓
- `org-composition` — should this be `org-assignee-composition` to match "Assignee Composition"?
- `inv-gender` — should this be `inv-gender-patenting` to match "Gender and Patenting"?
- Check all 34 slugs for consistency with titles.

#### 1.10.6 — Font and Typography Consistency
- Verify the same font family is used site-wide for: headings, body text, captions, chart labels, navigation.
- Verify font sizes are consistent for same-level headings across pages.
- Verify font loading (no FOUT/FOIT issues from web fonts).

#### 1.10.7 — Date and Number Formatting Consistency
- **Date ranges**: use en-dash (–) not hyphen (-). "1976–2025" not "1976-2025." Verify all instances.
- **Numbers**: consistent comma formatting for thousands (70,000 not 70000). Consistent use of "M" suffix for millions.
- **Percentages**: consistent decimal precision (one decimal place for most, two for HHI).
- **Year references**: "in 2024" vs. "by 2024" — use consistently.

---

### 1.11 — Visualization Quality and Consistency Audit

#### 1.11.1 — Color Encoding Consistency
With 34 chapters and 458 visualizations:
- Same entity (Samsung, IBM, Japan, California) = same color on every chart.
- Same CPC section = same color everywhere.
- Extract color palette/mapping from code; verify uniform application.

#### 1.11.2 — Axis and Label Readability
For every chart:
- Axis labels with full names and units (not codes).
- Text legible at 375px, 768px, 1280px.
- No label overlap or clipping.
- Sensible tick density.
- Y-axis starts at zero (or non-zero baseline is disclosed).

#### 1.11.3 — Responsive Design
Check at 375px (mobile), 768px (tablet), 1280px (desktop):
- Charts resize correctly.
- Text remains legible.
- Navigation works.
- No horizontal scrolling.
- Touch targets ≥44px on mobile.

#### 1.11.4 — Interactive Element Behavior
For ALL 458 interactive visualizations (not a sample):
- Tooltips show correct values matching underlying data.
- Hover states work.
- Legends toggle data series correctly.
- Time range filters work correctly.
- Dropdown/select controls populate with correct options and filter data correctly.
- Animation/transition behavior is consistent across chart types.

---

### 1.12 — Accessibility Audit

#### 1.12.1 — Noscript Fallbacks (EXHAUSTIVE — ALL 458)
Every interactive chart must have a `<noscript>` or equivalent text alternative. The homepage chart has one — verify ALL 458 charts do. This is NOT a sample — check every single visualization component.

#### 1.12.2 — ARIA Labels (EXHAUSTIVE — ALL 458)
Every chart container must have `aria-label` or `aria-describedby` — check ALL 458 visualizations, not a sample. Data tables must have `aria-label` and proper `<th>` scope attributes. Verify ARIA labels are descriptive (not generic like "chart" or "figure").

#### 1.12.3 — Keyboard Navigation
All interactive elements (tooltips, filters, tabs, dropdowns) must be keyboard-operable. Tab order must be logical.

#### 1.12.4 — Skip-to-Content
The homepage has `[Skip to content](#main-content)`. Verify every page has this.

#### 1.12.5 — Color Contrast
Text and background must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text). Chart colors must not rely solely on red/green distinction.

#### 1.12.6 — Alt Text
All images (if any, beyond charts) must have descriptive alt text.

---

### 1.13 — "Cite This Figure" Audit (EXHAUSTIVE — ALL 458)

The homepage shows a "Cite this figure" button. This audit covers ALL 458 figures — not a sample.

1. **Presence**: Does every one of the 458 figures have the CiteThisFigure widget? List any missing instances.
2. **APA format verification**: Verify each citation generates valid APA 7th edition format: `Author. (Year). Title. Site Name. URL.`
3. **BibTeX format verification**: Verify each citation generates valid BibTeX `@misc` format with all required fields: `author`, `title`, `year`, `url`, `note`.
4. **Field-by-field accuracy** (cross-reference with §1.6.22):
   - Author: "Saerom (Ronnie) Lee" — exact match on every instance
   - Title: matches the figure caption/title exactly
   - Year: correct and consistent
   - URL: permanent permalink to the specific figure (not just the chapter)
   - Institution: "The Wharton School, University of Pennsylvania"
   - Access date: dynamically generated (not hardcoded)
5. **Format consistency**: Same citation structure on every figure — no variations in punctuation, capitalization, or field ordering.
6. **Copy-to-clipboard**: If the widget has a copy button, verify it copies the full citation text correctly.
7. **Cross-reference**: Reconcile results with §1.6.22 (CiteThisFigure Comprehensive Field Audit).

---

### 1.14 — SEO and Technical Audit

#### 1.14.1 — Metadata
Every page: unique `<title>`, unique `<meta description>`, canonical tag, OG tags (`og:title`, `og:description`, `og:image`, `og:type`, `og:url`), Twitter card tags.

#### 1.14.2 — Heading Hierarchy
One `<h1>` per page. Logical `<h2>`/`<h3>` nesting. No skipped levels.

#### 1.14.3 — Structured Data (JSON-LD)
- Root: `WebSite` schema
- Every chapter: `Article` or `ScholarlyArticle` + `BreadcrumbList`
- Author: `Person` schema
- Data: `Dataset`/`DataCatalog` if data exposed
- Organization: `EducationalOrganization` for Wharton/Penn

#### 1.14.4 — Technical Files
- `robots.txt`: exists, permits crawling
- `sitemap.xml`: exists, complete, includes `<lastmod>`
- `favicon.ico` / `apple-touch-icon`: exists
- `manifest.json` (PWA): exists if applicable

#### 1.14.5 — Performance
- Lazy loading for off-screen charts
- Code splitting per chapter
- Bundle sizes (flag >500KB chunks)
- Image optimization
- Core Web Vitals risk assessment (LCP, CLS, INP)

---

### 1.15 — GenAI/Agent-Readiness Audit

- Content extractable without JavaScript (SSG/SSR)
- `llms.txt`: exists with page index, descriptions, data provenance
- `data-dictionary.json`/`.md`: exists with metric definitions
- AI-facing documentation consistent with human-facing pages

---

### 1.16 — Link Audit

#### 1.16.1 — Internal Links
Trace every internal link in source code → confirm target route exists. Check:
- Navigation links
- Breadcrumb links
- Cross-chapter references
- "See full analysis" links from homepage
- "Start Reading" / "Browse All Chapters" / "Explore the Data" buttons

#### 1.16.2 — External Links
Test with `curl -sI [URL]`. Verify HTTP 200 (or redirect). Known external links:
- https://patentsview.org — PatentsView data source
- https://www.saeromlee.com — author website
- Any DOIs or academic paper links
- Any government/legal source links

---

### 1.17 — About Page Audit

The About page must contain:
- Author information and credentials
- Project description and scope
- Data source description (PatentsView version, download date, coverage)
- Methodology overview or link to detailed methodology
- Limitations and caveats
- License / terms of use
- Contact information
- How to cite the website
- Acknowledgments (if applicable)

Verify all factual claims on the About page against Track B.

---

### 1.18 — Explore Page Audit

Verify:
- All 34 chapters are listed and linked
- Act organization is correct
- Descriptions match homepage cards
- All links work
- Design is consistent with the rest of the site

---

### 1.19 — Write the Audit Report

Save to `audit/audit-report.md`:

1. **Executive Summary** — issue counts by track (A, B, C, D) and severity (Critical/Major/Minor/Editorial)
2. **Track A: Data Accuracy Issue Log** — `ID | File | Route | Location | Claimed | Verified | Source | Method | Fix`
3. **Track B: External Claims Issue Log** — `ID | File | Route | Text | Category | Source | Correct Fact | Fix`
4. **Track C: Methodology Issue Log** — `ID | File | Route | Metric | Code | Literature | Fix`
5. **Track D: Sensitivity & Controversy Log** — `ID | Category (GEOPOLITICAL/GENDER_FRAMING/NATIONAL_CHARACTERIZATION/CAUSAL_POLICY/LOADED_TERMINOLOGY/METRIC_CONFLATION) | File | Line | Quoted Text | Concern | Recommended Revision | Severity`
6. **Cross-Page Consistency Log** — `Statistic | Page1 | Page2 | Match?`
7. **Homepage Card Crosscheck** — `Chapter | Card Value | Chapter Value | Match?`
8. **Deep Dive Cross-Domain Comparison** — `Metric | All 12 values | Superlative | Correct?`
9. **CiteThisFigure Audit Summary** — `Figure # | Chapter | Has Widget? | APA Correct? | BibTeX Correct? | Author Correct? | Title Match? | URL Correct?` — ALL 458 figures
10. **Glossary Audit** — `Term | Defined in Glossary? | Used on Pages | Definition Accurate?` — all technical terms
11. **Error/Loading State Audit** — `Component | Loading State? | Error State? | Empty State? | Noscript Fallback?` — ALL 458 visualizations
12. **Entity Color Consistency** — `Entity | Defined Color | Charts Using Correct Color | Charts Using Wrong Color`
13. **Tooltip Consistency** — `Chart | Tooltip Format Matches Axis? | Entity Names Match Legend? | Decimal Precision Consistent?`
14. **External Link Audit** — `URL | Source File | Status Code | Has rel="noopener noreferrer"? | Link Text Descriptive?`
15. **Font Consistency** — `Element Type | Expected Font | Pages Using Correct Font | Pages Using Wrong Font`
16. **General Issue Log** — `ID | Severity | Type | File | Route | Evidence | Problem | Fix`
17. **SEO & GenAI Findings**
18. **Copyright/License/Attribution Status**

Print: `"PHASE 1 COMPLETE. [N] Track A, [M] Track B, [P] Track C, [Q] Track D sensitivity, [R] other (Critical/Major/Minor/Editorial). Proceeding to Phase 2."`

---

## PHASE 2: IMPLEMENT ALL FIXES

Priority order: Track A data → Track C methodology → Track B external claims → Sensitivity → Language → Visualization → Accessibility → SEO → GenAI → Performance.

### 2.1 — Track A: Data Accuracy Fixes
For each error: determine correct value → apply correction → re-run verification script → check cascading effects on same page, other pages, and homepage cards → log.

### 2.2 — Track C: Methodology Fixes
Formula mismatches → fix code or document deviation. Undisclosed methods → add methodology notes. Cross-chapter inconsistencies → standardize. Gender/NLP/clustering/pivot/domain disclosures → add.

### 2.3 — Track B: External Claim Fixes
Per-category corrections (LAW, CASE, CITATION, etc.). Add source attributions.

### 2.4 — Sensitivity Fixes
Add confounder disclosure to raw comparisons. Neutralize politically loaded framing. Rewrite causal claims. Add methodology caveats to gender analysis. Ensure international comparisons are neutral.

### 2.5 — Language Fixes
Rewrite causal/quasi-causal language. Rewrite informal language. Define all acronyms. Fix vague referents. Standardize terminology.

### 2.6 — Visualization Fixes
Fix axes, labels, legends, tooltips, colors, responsive breakpoints, partial-year disclosures, non-zero baseline disclosures. Standardize color encoding across chapters.

### 2.7 — Accessibility Fixes
Add noscript fallbacks, ARIA labels, keyboard navigation, skip-to-content. Fix color contrast issues.

### 2.8 — "Cite This Figure" Fixes
Add widget to any missing figures. Fix citation content and format. Standardize.

### 2.9 — Navigation, Footer, and Structural Fixes
Add methodology link to navigation (if missing). Complete footer (data version, license, contact, last updated). Fix breadcrumbs. Fix URL slugs. Fix font/typography inconsistencies. Fix date/number formatting.

### 2.10 — SEO Fixes
Add/fix metadata, heading hierarchy, JSON-LD structured data.

### 2.11 — GenAI Fixes
Create/update `robots.txt`, `sitemap.xml`, `llms.txt`, `data-dictionary`.

### 2.12 — Performance Fixes
Add lazy loading, verify code splitting, optimize bundles/images.

### 2.13 — Build Verification
```bash
cd /home/saerom/projects/patentworld
npm run build
```
Fix all build errors before proceeding.

### 2.14 — Track D: Sensitivity & Controversy Fixes
For each item flagged in Track D (§1.8.5):
- **GEOPOLITICAL**: Replace vague geopolitical language with precise, neutral descriptions. Refer to patent offices by name (e.g., "TIPO" not "Taiwan's patent system"). Do not imply sovereignty positions.
- **GENDER_FRAMING**: Replace evaluative framing ("well below parity") with descriptive framing ("Women represent X% of inventors"). Remove or justify normative benchmarks. Add gender inference methodology error disclosure for non-Western names.
- **NATIONAL_CHARACTERIZATION**: Apply symmetric hedging across all countries. If China's "lower average claims" is noted, add equivalent context for other countries' metrics. Add field-composition and patent-office-procedure caveats.
- **CAUSAL_POLICY**: Replace causal connectors ("led to," "drove") with associative language ("was followed by," "coincided with") for all policy-trend claims lacking causal methodology citations.
- **LOADED_TERMINOLOGY**: Replace "patent troll" with "non-practicing entity (NPE)" or attribute the term in quotation marks. Replace other loaded terms similarly.
- **METRIC_CONFLATION**: Add proxy disclosure wherever patent volume is used as a measure of innovation: "Patent filings are used here as a proxy for inventive activity, though they capture only a subset of innovation output."

### 2.15 — Tooltip and Dynamic Text Fixes
Fix all inconsistencies identified in §1.6.19 (tooltip formatting) and §1.6.20 (dynamic text). Standardize:
- Number formatting across tooltips, axes, and narrative text.
- Decimal precision by metric type (percentages: 1 decimal; counts: 0 decimals; ratios: 2 decimals).
- All `.toLocaleString()` calls to use explicit `'en-US'` locale parameter.

### 2.16 — Glossary and GlossaryTooltip Fixes
- Add all missing technical terms to the glossary (identified in §1.9.7).
- Fix GlossaryTooltip accessibility: add keyboard focus support, `aria-describedby`, touch activation, and `Escape` dismiss (§1.9.6).

### 2.17 — Error/Loading State Fixes
- Add loading indicators to all data-dependent components missing them.
- Add error state handling (user-facing error messages) for failed data fetches.
- Add empty-state messages for charts with no matching data.

### 2.18 — Copyright, License, and Attribution Fixes
- Add copyright notice to footer.
- Add PatentsView CC-BY 4.0 attribution (if missing or incomplete).
- Add font license compliance (if missing).

### 2.19 — Small-Sample Warning Fixes
- Add small-sample disclosures where statistics are computed from <30 observations.
- Standardize small-sample warning format across all chapters.
- Fix any partial-year 2025 edge cases in growth rate calculations.

### 2.20 — Build Re-Verification
```bash
cd /home/saerom/projects/patentworld
npm run build
```
Fix all build errors introduced by Phase 2 fixes before proceeding.

Print: `"PHASE 2 COMPLETE. Fixed [counts by track: A/B/C/D]. Build succeeded. Proceeding to Phase 3."`

---

## PHASE 3: VERIFY ALL FIXES (EXHAUSTIVE — NO SPOT-CHECKS)

### 3.1 — Re-run ALL Track A verification scripts. Confirm every script passes.
### 3.2 — Re-verify ALL Deep Dive cross-domain superlatives against all 12 domains.
### 3.3 — Re-verify ALL 34 homepage card values against chapter data.
### 3.4 — Re-verify ALL Track B external claims (not a sample). Re-verify ALL Track C methodology items.
### 3.5 — Cross-page consistency re-check: verify every statistic appearing on multiple pages matches.
### 3.6 — Page inventory re-run: confirm 34 chapters, 458 visualizations, all non-chapter pages accounted for.
### 3.7 — Re-read ALL modified files for accuracy, language, and sensitivity. Do NOT spot-check — verify every change.
### 3.8 — Update audit report with Status/Verified columns for every issue.
### 3.9 — Re-verify Track D: confirm all sensitivity items have been addressed. Re-read every GEOPOLITICAL, GENDER_FRAMING, NATIONAL_CHARACTERIZATION, CAUSAL_POLICY, LOADED_TERMINOLOGY, and METRIC_CONFLATION fix.
### 3.10 — Re-verify CiteThisFigure: confirm ALL 458 figures have correct APA and BibTeX citations.
### 3.11 — Re-verify glossary: confirm all technical terms are defined, all GlossaryTooltip instances are accessible.
### 3.12 — Re-verify error/loading states: confirm all 458 visualizations have loading, error, and empty-state handling.
### 3.13 — Re-verify entity color consistency across all 458 charts.
### 3.14 — Re-verify tooltip formatting consistency across all 458 charts.
### 3.15 — Re-verify locale independence: confirm no unlocalized `.toLocaleString()` calls remain.
### 3.16 — Re-verify external link security: confirm all `target="_blank"` links have `rel="noopener noreferrer"`.
### 3.17 — Re-verify copyright/license/attribution notices are present and complete.
### 3.18 — Re-verify font consistency across all pages.

**Combined Accuracy Certification:**
```
TRACK A — DATA: [N] checks pass. Verification scripts in audit/verification-scripts/.
TRACK B — EXTERNAL: [M] claims verified. [K] corrected. [J] unverifiable (flagged TODO).
TRACK C — METHODOLOGY: [P] metrics verified. [L] corrected.
TRACK D — SENSITIVITY: [Q] items screened. [R] revised. By category:
  GEOPOLITICAL: [N] | GENDER_FRAMING: [N] | NATIONAL_CHARACTERIZATION: [N]
  CAUSAL_POLICY: [N] | LOADED_TERMINOLOGY: [N] | METRIC_CONFLATION: [N]
HOMEPAGE: All hero stats and 34 chapter cards verified.
DEEP DIVES: All 12 domains cross-validated.
CITE THIS FIGURE: ALL 458 figures verified (APA + BibTeX).
GLOSSARY: [N] terms defined, [N] GlossaryTooltip instances accessible.
ERROR STATES: ALL 458 visualizations have loading/error/empty handling.
ENTITY COLORS: ALL 458 charts use consistent color mapping.
TOOLTIPS: ALL 458 charts have consistent formatting.
LOCALE: ALL dynamic text explicitly localized to en-US.
EXTERNAL LINKS: ALL links verified (security attributes + destination validity).
COPYRIGHT: Attribution, license, and copyright notices present.
FONTS: ALL pages use consistent font families and weights.
PARTIAL-YEAR: 2025 data through [DATE]. Disclosures added.
```

### 3.19 — Lint, type-check, final build.

Print: `"PHASE 3 COMPLETE. All verifications pass across Tracks A/B/C/D and all 18 audit areas. Build clean. Proceeding to Phase 4."`

---

## PHASE 4: COMMIT, PUSH, AND DEPLOY

### 4.1 — Commit (atomic, grouped by concern)

```bash
cd /home/saerom/projects/patentworld

# Commit 1: Data, methodology, and factual accuracy
git add -A -- '*.tsx' '*.ts' '*.jsx' '*.js' '*.mdx' '*.md' ':!audit/' ':!public/llms.txt' ':!public/data-dictionary.*' ':!public/robots.txt' ':!public/sitemap.xml'
git commit -m "fix(accuracy): correct data, methodology, and factual inaccuracies

Track A: [N] data errors corrected, verified by independent scripts
Track B: [K] external claims corrected against authoritative sources
Track C: [L] derived metric formulas fixed to match academic definitions
Sensitivity: [Q] raw comparisons annotated, causal claims neutralized
Language: informal/causal rewritten to formal/associative
Visualizations: axes, labels, colors, responsive breakpoints fixed
Accessibility: noscript fallbacks, ARIA labels, keyboard nav added
Navigation: footer, breadcrumbs, cross-links completed

Audit ref: audit/audit-report.md"

# Commit 2: SEO and structured data
git add -A -- '*layout*' '*head*' '*metadata*' '*seo*' '*jsonld*' '*schema*'
git commit -m "feat(seo): metadata, JSON-LD schemas, heading hierarchy"

# Commit 3: GenAI readiness
git add public/llms.txt public/data-dictionary.* public/robots.txt public/sitemap.xml
git commit -m "feat(ai-readiness): llms.txt, data dictionary, robots.txt, sitemap.xml"

# Commit 4: Audit artifacts
git add audit/
git commit -m "docs(audit): complete audit report, verification scripts, certification"
```

Adjust `git add` as needed. Run `git status` to verify clean tree.

### 4.2 — Push
```bash
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
```
If rejected: `git pull --rebase origin "$BRANCH" && git push origin "$BRANCH"`.

### 4.3 — Confirm
```bash
git status && git log --oneline -10
```

Print: `"PHASE 4 COMPLETE. Pushed to origin/$BRANCH. Deploy: https://patentworld.vercel.app/"`

---

## FINAL OUTPUT

```
============================================
AUDIT & DEPLOYMENT COMPLETE
============================================

TRACK A — DATA ACCURACY:
  Found: [N] | Fixed: [N] | Deferred: [N]
  Scripts: audit/verification-scripts/
  Homepage hero stats: VERIFIED
  Homepage cards (34): VERIFIED
  Cross-page consistency: [N] resolved
  Deep Dive cross-domain: ALL 12 validated
  Superlatives checked: [N] (exhaustive — all entities, not just displayed)
  Partial-year 2025: through [DATE], [N] disclosures added
  Tooltip consistency: ALL 458 charts verified
  Dynamic text: ALL formatting functions verified
  Locale independence: ALL .toLocaleString() calls localized

TRACK B — EXTERNAL CLAIMS:
  Identified: [N] | Correct: [N] | Corrected: [N] | Unverifiable: [N]
  By category: LAW/CASE/CITATION/DEFINITION/COMPARATIVE/
               INSTITUTION/HISTORY/METHODOLOGY/TECHNOLOGY/AFFILIATION
  External links: [N] tested | [N] valid | [N] broken | [N] security-fixed

TRACK C — METHODOLOGY:
  Metrics verified: [N] | Correct: [N] | Fixed: [N]
  Disclosures added: [N]

TRACK D — SENSITIVITY & CONTROVERSY:
  Total items screened: [N]
  By category:
    GEOPOLITICAL: [N] found, [N] revised
    GENDER_FRAMING: [N] found, [N] revised
    NATIONAL_CHARACTERIZATION: [N] found, [N] revised
    CAUSAL_POLICY: [N] found, [N] revised
    LOADED_TERMINOLOGY: [N] found, [N] revised
    METRIC_CONFLATION: [N] found, [N] revised

LANGUAGE: [N] causal rewrites, [N] informal rewrites, [N] acronyms defined

VISUALIZATION: [N] fixes across 458 charts
  Color consistency: ALL 458 charts verified against ENTITY_COLORS
  Responsive: checked at 375/768/1280px
  Entity color mapping: [N] entities, ALL consistent

ACCESSIBILITY:
  Noscript fallbacks: ALL 458 charts verified (exhaustive)
  ARIA labels: ALL 458 charts verified (exhaustive)
  Skip-to-content: ALL pages verified
  GlossaryTooltip: [N] instances, ALL keyboard/touch/screen-reader accessible
  Color contrast: WCAG AA verified

CITE THIS FIGURE: ALL 458 of 458 verified
  APA format: [N] correct | [N] fixed
  BibTeX format: [N] correct | [N] fixed
  Field accuracy: author/title/year/URL/institution verified on ALL figures

GLOSSARY:
  Terms defined: [N] (was 24, now [N])
  Terms used but undefined: [N] (all added)
  GlossaryTooltip accessibility: ALL instances fixed

ERROR/LOADING STATES:
  Loading indicators: ALL 458 visualizations verified
  Error states: ALL 458 visualizations verified
  Empty states: ALL 458 visualizations verified

COPYRIGHT/LICENSE/ATTRIBUTION:
  Copyright notice: PRESENT
  PatentsView CC-BY 4.0 attribution: COMPLIANT
  Font licenses: COMPLIANT

FONT CONSISTENCY:
  Playfair Display (headings): ALL pages verified
  Plus Jakarta Sans (body): ALL pages verified
  JetBrains Mono (data): ALL pages verified
  Font loading: next/font with display:swap verified

SMALL-SAMPLE WARNINGS:
  Statistics with N<30: [N] identified, [N] disclosed
  Partial-year edge cases: [N] fixed

SEO: metadata on all pages, JSON-LD schemas added
GENAI: llms.txt, data-dictionary, robots.txt, sitemap.xml

Commits: [N] | Branch: [name] | Push: SUCCESS
Deploy: https://patentworld.vercel.app/

CERTIFICATION:
[Full certification statement — confirming exhaustive audit
across Tracks A/B/C/D, all 458 visualizations, all 34 chapters,
all non-chapter pages, and all 18 audit categories.]
============================================
```

---

## CONSTRAINTS & SAFEGUARDS

1. **Work locally for code.** All file operations under `/home/saerom/projects/patentworld`. Do NOT fetch the live site.
2. **Use web search for external facts.** Verify all non-data claims against authoritative sources.
3. **Never fabricate data.** Unverifiable numbers → `<!-- TODO: verify -->`.
4. **Never fabricate citations.** Unfindable sources → `CANNOT CONFIRM` + `<!-- TODO -->`.
5. **Never silently change a number.** Every change logged with old value, new value, source.
6. **Never delete without justification.** Every removal logged.
7. **Preserve git history.** No force-push.
8. **Do not modify raw data files** unless provably erroneous.
9. **Stop on critical failure.** Do not push broken code.
10. **Academic language standard.** Peer-reviewed quality throughout.
11. **Always `cd /home/saerom/projects/patentworld`** first.
12. **Verification scripts are deliverables.** Committed and re-runnable.
13. **Source hierarchy (Track B):** primary legal → official agency → peer-reviewed → reputable secondary. Never blogs/forums/AI.
14. **Source hierarchy (Track C):** original paper → cited survey → established reference.
15. **Superlatives require exhaustive verification** against ALL entities, not just displayed ones.
16. **Partial-year data must be disclosed.**
17. **Cross-domain consistency is mandatory** across all 12 Deep Dives.
18. **Color encoding must be consistent** across all 458 visualizations.
19. **Raw comparisons must disclose confounders** or risk misinterpretation.
20. **Causal language requires methodological justification.** "Reflecting," "driven by," "as" (causal) are flagged alongside "caused" and "led to."
21. **Sensitivity review is mandatory.** Gender, geography, institutional rankings, and public investment content must be presented neutrally.
22. **Process chapters in order** (Act 1–6, then non-chapter pages). Save checkpoint per Act.
23. **Track D screening is mandatory.** Every paragraph of narrative text and every caption must be screened for GEOPOLITICAL, GENDER_FRAMING, NATIONAL_CHARACTERIZATION, CAUSAL_POLICY, LOADED_TERMINOLOGY, and METRIC_CONFLATION issues.
24. **Copyright and attribution compliance is mandatory.** PatentsView CC-BY 4.0 license terms must be met. Font licenses must be complied with.
25. **Locale independence is mandatory.** All `.toLocaleString()` and `Intl.NumberFormat` calls must explicitly specify `'en-US'` locale to prevent browser-dependent formatting.
26. **Edge cases must be handled.** Division by zero, NaN, Infinity, empty data, partial years, and small samples must produce user-facing messages — not blank charts or console errors.
27. **No sampling or spot-checking.** Every audit instruction that previously said "sample of N" or "spot-check" now means ALL instances. The audit is exhaustive across all 458 visualizations, all 34 chapters, and all non-chapter pages.
28. **GlossaryTooltip must be accessible.** Keyboard focus, touch activation, screen reader support, and Escape dismiss are required (WCAG 1.4.13).
29. **External links must be secure.** Every `target="_blank"` must have `rel="noopener noreferrer"`. Every external URL must be tested for validity.
30. **CiteThisFigure must be present and correct on ALL 458 figures.** Both APA and BibTeX formats must be verified field-by-field.