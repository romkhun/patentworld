# PatentWorld Quality Remediation — Claude Code Prompt

You are tasked with fixing content, metadata, rendering, SEO, and AI-readiness issues on the PatentWorld website (https://patentworld.vercel.app/). The site is a Next.js application. The full audit report is attached as `/home/saerom/projects/patentworld/comment_all.md`.

Work through the issues below in the order given (Phases 1–5). For each fix, identify the relevant source file(s), make the change, and verify it renders correctly. If a fix requires data from the analysis pipeline that you do not have access to, leave a `// TODO: AUDIT-FIX` comment with the specific data needed and move on.

---

## PHASE 1 — CRITICAL: Factual Errors and Broken Content

These must be fixed before any deployment.

### 1.1 Green Innovation: Populate placeholder values (C1, F3)

Search for em-dash characters (—) serving as template placeholders in the Green Innovation chapter content files. The correct values exist in the chapter's prose paragraph:
- Peak: 35,693 in 2019
- Share: approximately 9.6% of all utility patents
- Cumulative total: compute from data or leave TODO

Files to check: look for the Green Innovation chapter data file (likely under `src/data/chapters/`, `src/content/`, or MDX files). Also check any template/config files that feed figure titles and key findings.

Replace:
- "peaking at — in —" → "peaking at 35,693 in 2019"
- "Reaching —%" → "Reaching 9.6%"
- "Rose to — by —" → "Rose to 35,693 by 2019"
- "total 0 over 50 years" → compute the correct cumulative total or mark TODO

### 1.2 Organizational Mechanics: Populate placeholder values (C1 extension)

Search for ellipsis ("...") and em-dash ("—") characters serving as placeholders in the Organizational Mechanics chapter content files (`/chapters/mech-organizations/`). Two section headings contain placeholders:

- "IBM's Exploration Score Averages — Across **...** Years of Patenting" → Replace "..." with the actual year count (e.g., "49 Years" if IBM patents span 1976–2025)
- "IBM Devotes **—%** of Recent Patents to Exploitation Over Exploration" → Compute the exploitation percentage from the stacked-share data and insert it (e.g., "95%")

Note: These headings are dynamically generated for the selected company (default: IBM). The fix may require updating the heading template to pull values from the computed data rather than using hardcoded placeholders. Check whether the template uses string interpolation with missing/null fallback values.

### 1.3 Patent Law Timeline: Stevenson-Wydler Act year (I1)

Find the Patent Law and Policy timeline data. Change the Stevenson-Wydler Technology Innovation Act entry from 1982 to **1980**.

### 1.4 Patent Law Timeline: Federal Circuit year (I2)

In the same timeline, change the Federal Circuit creation entry from 1984 to **1982**.

### 1.5 Patent Law Timeline: eBay v. MercExchange year (I6)

In the same timeline, change the eBay v. MercExchange entry from **2007** to **2006**. The Supreme Court decided this case on May 15, 2006 (547 U.S. 388). Add or update the citation.

### 1.6 Patent Law Timeline: KSR v. Teleflex year (I7)

In the same timeline, change the KSR v. Teleflex entry from **2010** to **2007**. The Supreme Court decided this case on April 30, 2007 (550 U.S. 398). The year 2010 belongs to Bilski v. Kappos, not KSR. Verify that Bilski is correctly dated to 2010 if it appears on the timeline.

**IMPORTANT: Given that at least 4 timeline entries have wrong years (Stevenson-Wydler, Federal Circuit, eBay, KSR), verify ALL remaining timeline entries against authoritative sources. The correct Supreme Court decision dates are:**
- eBay v. MercExchange: May 15, 2006
- KSR v. Teleflex: April 30, 2007
- Bilski v. Kappos: June 28, 2010
- Association for Molecular Pathology v. Myriad Genetics: June 13, 2013
- Alice Corp. v. CLS Bank: June 19, 2014
- TC Heartland v. Kraft Foods: May 22, 2017
- Oil States Energy v. Greene's Energy: April 24, 2018
- SAS Institute v. Iancu: April 24, 2018

Fix any date that does not match. Add case citations (volume U.S. page) to each entry.

### 1.7 Patent Law Timeline: Bilski v. Kappos year (I9)

In the same timeline, change Bilski v. Kappos from **2011** to **2010**. The Supreme Court decided this case on June 28, 2010 (561 U.S. 593). The year is off by one. This is the fifth confirmed timeline date error.

### 1.8 Patent Fields: Page title mismatch (A1)

Find the Patent Fields chapter's page title / SEO title. It currently reads "Computing Rose From 10% to 55% of Patents."

Change to match the chapter's own data: "Computing Rose From 27% to 57% of Patents — CPC Sections G and H" (or whatever the chapter's canonical framing is). If the page title is generated from a data file, fix it there.

Also fix the homepage introduction paragraph. It currently says "computing and electronics rose from 12% to over 40%." This is a hybrid that matches neither the CPC figure (27 to 57%) nor the topic-model figure (12 to 33%). Replace with one of:
- "CPC sections G and H — covering computing, electronics, and physics — rose from 27% to 57% of all patent grants"
- "Computing and semiconductor topics (identified via text analysis) grew from 12% to 33% of all patent abstracts"

### 1.9 Public Investment: Standardize timeline (A3)

Search all content files for the strings "1,269 in 1976" and "6,457 in 2015" related to Public Investment / government-funded patents. Replace with "1,294 in 1980" and "8,359 in 2019" to match the chapter's Bayh-Dole Act framing.

Locations to check:
- Homepage card / chapter card description
- Chapter page meta description
- JSON-LD structured data (both site-wide hasPart array and chapter-specific ScholarlyArticle)
- Chapter key findings or stat cards if they use the old figures

### 1.10 Gender: Fix citation directionality (B5)

In the Gender chapter key findings, the claim "All-male teams produce the highest average citation impact (14.2)" uses a historical cohort with complete citations. The figure title "All-Female Teams Average 1.06 Forward Citations in 2024" uses truncated 2024 data.

Fix: Add a qualifying note to the figure title: "All-Female Teams Average 1.06 Forward Citations in 2024 (Recent Cohorts; Citation Window Incomplete)"

Add a reconciliation sentence to the key findings or executive summary: "Note: Lifetime citation rankings (all-male 14.2, mixed 12.6, all-female 9.5) reflect patents with complete 5-year citation windows. Recent-year figures use truncated citation windows and may show different patterns."

### 1.11 Backward-citation caption logic error (B6)

In the Patent Quality chapter, find the backward-citation figure's caption text. It contains a phrase like "heavily cited patents" or "growing right tail of heavily cited patents."

Replace "heavily cited patents" with "patents with unusually long reference lists" (or "patents that cite unusually many prior patents").

This is a semantic error: "heavily cited" describes forward citations (received), not backward citations (made).

### 1.12 Homepage vs llms.txt: visualization count mismatch (A9)

The homepage hero statistics state "359 Visualizations." The `/llms.txt` file states "Visualizations: 459." Determine the true count from the build system (e.g., count all chart/figure components across all chapters).

Fix approach:
- If 459 is correct: update the homepage hero statistic
- If 359 is correct: update llms.txt
- Ideal: auto-generate both from a single source (e.g., a build-time count of visualization components)

Files to check: homepage data source (likely a constants file or CMS), `/public/llms.txt` or wherever llms.txt is generated.

---

## PHASE 2 — HIGH PRIORITY: Metadata, Consistency, and Disambiguation

### 2.1 HHI threshold attribution (I3)

Find the About page content. It states: "DOJ/FTC 2023 guidelines classify markets as unconcentrated (<1,500), moderately concentrated (1,500-2,500), highly concentrated (>2,500)."

Change "2023 guidelines" to "2010 Horizontal Merger Guidelines" (the actual source of these specific thresholds). The 2023 Merger Guidelines use different cutoffs.

### 2.2 Patent Law: "7 Key Events" vs "21 events" (I8)

The Patent Law page title says "Shaped by 7 Key Events." The homepage summary claims "Twenty-one legislative and judicial events since 1980." The timeline list has many more than 7 entries. Decide on the correct count and make the title, homepage card, and timeline consistent. If "7" means a curated subset, label it explicitly (e.g., "7 Landmark Decisions Among 21 Key Events").

### 2.3 Patent Fields: "Dot-Com Bust" mislabeled as 2004–2005 (I10)

In the Patent Fields chapter, find the figure title or annotation that labels a decline as "Dot-Com Bust (2004–2005)." The NBER dates the dot-com recession as March–November 2001. If the patent data shows a grant-year decline in 2004–2005 (reflecting filing-lag effects from the 2001 recession), label it accurately:

Replace: "Dot-Com Bust (2004–2005)"
With: "Grant-year decline (2004–2005), reflecting reduced filings during the early-2000s recession" or simply "Early-2000s slowdown (grant-lag effect)"

Do NOT label 2004–2005 as "the Dot-Com Bust" because the bust occurred in 2000–2001.

### 2.4 Originality metric divergence (A2)

Find the Patent Quality chapter key findings or stat card. It says "Originality increased from 0.09 to 0.25."

Add a clarifying note: "Originality increased from 0.09 in 1976 to 0.25 system-wide (section-level averages reached 0.45-0.55 by the 2020s; see Patent Fields chapter)."

### 2.5 Top Inventors metric alignment (A5)

Find the homepage card, page title, and JSON-LD for the Top Inventors chapter. Currently three incompatible metrics are used:
- "12% of inventors produce 61%" (lifetime, segment-based)
- "Top 5% produce 60%" (annual)
- "Top 5% Share: 63.2%" (KPI box, cumulative)

Pick ONE primary metric for the homepage card and page title. Add a parenthetical distinguishing measurement basis. Example: "The top 5% of inventors (by cumulative output) account for 63.2% of all patents."

### 2.6 Gender chemistry temporal basis (A6)

Find the Gender chapter key finding "Chemistry leads female representation at 14.6%." Add temporal qualifier: "Chemistry leads cumulative female representation at 14.6% (1976-2025), reaching 23.4% in the most recent period."

### 2.7 Starting grant count standardization (A7)

Search for all instances of "66,000" and "70,000" and "70,941" referring to 1976-era patent grants.

Ensure each use is labeled:
- "70,941" or "approximately 70,000" when referring to 1976 specifically
- "66,000" when referring to the late-1970s average, with label "(average, 1976-1979)"

### 2.8 Utility vs all-types qualifiers (A8)

Find stat cards showing "393K Grants in 2019" or similar all-types figures. Add "(all types)" qualifier.

Find figure titles showing utility-only figures (e.g., "355,923" or "349,093"). Ensure they say "(utility patents only)."

Also fix Domestic Geography: the Key Findings refer to shares of "all grants" while the choropleth and state rankings use utility patents by primary inventor state. Change Key Findings from "all grants" to "utility patents" (or vice versa) to match the data actually shown. Add a visible "All patents" vs "Utility only" label to every figure site-wide.

### 2.9 Centralize JSON-LD descriptions (D1)

This is a structural fix. Find where chapter descriptions are defined. There are likely TWO sources:
1. A site-wide chapter list (used in the hasPart array on every page)
2. Individual chapter page meta/JSON-LD

These must be unified. Create or identify a single canonical data file (e.g., `src/data/chapters.json` or similar) from which both the site-wide list and individual chapter pages pull their descriptions. If they already share a source, find where the divergence occurs and fix it.

### 2.10 Partial 2025 data flag (E1, E2, L4)

Add a global data coverage note. Options:
1. Add a banner component that renders on every page: "Data coverage: January 1976 through September 2025. All 2025 figures reflect partial-year data."
2. Or add a footer note on every chapter page.

Additionally, search for "in 2025" claims across all chapter content and add "(through September)" where they appear as standalone year-end figures. Key instances:
- "14.9% in 2025" (Gender)
- "10.0% in 2025" (Geographic Mechanics)

### 2.11 Fix broken cross-references (H2)

Search all chapter content for internal links or references to:
- "Firm Innovation"
- "Sector Dynamics"
- "the technology revolution"

These chapter names do not exist. Replace with references to the actual chapter names:
- "Firm Innovation" → likely "Assignee Composition" or "Organizational Patent Count"
- "Sector Dynamics" → likely "Patent Fields" or "Convergence"
- "the technology revolution" → likely "Patent Fields"

Verify each link's href points to a valid route.

### 2.12 Japan cumulative patent count (A10)

Assignee Composition uses "1.4 million" (4 times) while International Geography and FAQ use "1.45 million" for Japan's cumulative US patents. This 50,000-patent discrepancy may reflect rounding or scope differences.

Fix: Search all content files for "1.4 million" and "1.45 million" in the context of Japan. Standardize to a single figure. If the difference reflects different patent-type universes (utility vs all types), add a parenthetical qualifier.

### 2.13 Pendency statistic: label mean vs median (A11)

Homepage and Patent Count chapter report "peaked at 3.8 years" (the average). FAQ reports "peaked at 3.6 years (1,317 days)" (the median). Neither labels which statistic is used.

Fix: Add "(average)" after "3.8 years" on the homepage and in Patent Count chapter. Add "(median)" after "3.6 years" in the FAQ. This complements Task 3.2 (grant-year vs filing-year), but addresses a different dimension.

### 2.14 Duplicate WebSite JSON-LD on homepage (D4)

The homepage contains two `<script type="application/ld+json">` blocks each with a `"@type": "WebSite"` schema. Merge into a single JSON-LD block containing one WebSite, one BreadcrumbList, and other applicable schemas.

Verify: After fix, `document.querySelectorAll('script[type="application/ld+json"]')` should contain exactly one WebSite entry across all blocks.

---

## PHASE 3 — MEDIUM PRIORITY

### 3.1 Patent Fields: HHI framing (I4)

Find the HHI / concentration section in the Patent Fields chapter. If it uses language like "Patent markets remain unconcentrated," replace "market" language with "patenting" language: "Patent grant concentration by assignee remains below conventional thresholds." Add a note: "Note: HHI is used here as a descriptive index of assignee concentration, not as a product-market competition measure."

### 3.2 Pendency measurement basis (B1)

In the Patent Count chapter key findings, change "peaked at 3.8 years in 2010" to "peaked at 3.8 years in 2010 (measured by grant year)" and add: "By filing year, pendency peaked at 3.8 years in 2006."

### 3.3 Team Size solo share (B7)

Align the key finding and figure headline to use the same percentage (23% or 24%) and specify the year.

### 3.4 Convergence endpoints (B8)

Align the headline claim to use one endpoint. Either "41% (1976-2025, partial)" or "40.2% by 2024."

### 3.5 Design patent leaders (B9)

In Org Patent Count, change "consumer electronics and automotive firms" to "consumer electronics and consumer brands" (to account for Nike).

### 3.6 Continuation figure title (E3)

Change "Original Filings Without Continuations Have Nearly Disappeared" to "Original Filings Without Continuations Have Nearly Disappeared (Continuation Data Available from 2002)."

### 3.7 Stray debugging strings (F4)

Search for "Data PatentsView 2025-Q1" across all rendered content. Either:
- Remove from visible text, or
- Wrap in a details element or styled "Figure notes" block.

### 3.8 Explore page (F7)

If the Explore page is unfinished, add visible text: "This feature is coming soon. In the meantime, explore patent data at PatentsView (https://patentsview.org)."

### 3.9 Entropy arithmetic (J2)

In Language of Innovation, either:
- Change "6.4%" to "6.6%" (matching displayed endpoints 1.97 to 2.10), or
- Show more precise endpoints (e.g., 1.971 to 2.097) that yield 6.4%.

Also standardize "8.45M" vs "8.4M" to one figure throughout the chapter.

### 3.10 Causation sections: fix accordion visibility and populate missing body text (K3)

The "Why can't we infer causation from…?" prompt appears on at least four chapters: Assignee Composition, Top Inventors, Domestic Geography, and International Geography. The implementation varies: on Domestic Geography it is a collapsed accordion (`aria-expanded="false"`), while on Top Inventors the question appears with no visible body content.

Fix: (a) Search all chapter files for "Why can't we infer causation" or similar strings. (b) Ensure each has substantive body content explaining threats to causal inference (selection, confounders, identification). (c) Change the accordion default to `aria-expanded="true"` (open by default) or convert to a visible callout component — methodological caveats should not be hidden behind a click. (d) Verify the body content is SSR-rendered (present in the static HTML response).

### 3.11 KPI label fixes (K4, K5)

In Domestic Geography, change "Top 1% Share" to "Top 1 State Share" and "Top 5% Share" to "Top 5 States Share."

In Org Patent Count and Assignee Composition KPI blocks, add a tooltip or footnote defining the denominator (top 1% / 5% of what universe, over what time period).

### 3.12 PREVAIL/PERA dating (I5)

In the Patent Law timeline, verify the PREVAIL Act and PERA entry. If dated 2023, add the specific bill numbers from the 118th Congress. Add a note about the 2025 reintroduction (S.1553, S.1546).

### 3.13 Public Investment references (G5)

In the Public Investment chapter, find where it claims government-funded patents are "higher-impact" based on "prior research." Add 2-3 scholarly citations (e.g., key Bayh-Dole outcome studies).

### 3.14 Patent Fields: claim-count range "1 to 4" (B10)

In Patent Fields, find the caption that states claim-count range "widening from 1 to 4 across decades." Given that median claim counts in major sections are in the high teens by the 2020s, a cross-section range of "1 to 4" is implausible as stated. Replace with the actual statistic intended and name what is being measured (e.g., "difference in section medians widened from X to Y").

### 3.15 International Geography: ambiguous "164,000 patents" (B11)

Find the claim "US leads with 164,000 patents in the 2020s" in International Geography. Make the unit explicit: per year or per decade total? By inventor country or assignee country? E.g., "164,000 patents per year in the 2020s, by inventor country."

### 3.16 Sleeping beauty definition (G7)

In Patent Quality, find references to "sleeping beauty patents" and the "94% in Human Necessities" claim. Add the detection rule: what citation threshold defines a sleeping beauty? What time window? Include this in visible text or link to a methods appendix.

### 3.17 Exploration score formula (G8)

In Organizational Mechanics, find where exploration is defined as a composite score >0.6 based on "technology newness, citation newness, and external knowledge sourcing." Add the formula and component weights to visible text or a linked methods appendix.

### 3.18 Clustering methodology (G9)

In Patent Portfolio, find where "248 companies cluster into 8 industries" and "51 pivots" are claimed. Add: clustering method name, distance metric, stability checks. Include or link a company-to-cluster mapping table.

### 3.19 Patent Portfolio: soften "leading indicator" claim (G10)

In Patent Portfolio Key Findings and narrative, find "leading indicator of corporate strategy" and "often years before strategic shifts become publicly visible." Replace "leading indicator" with "potential indicator" and "often years before" with "can precede." Unless a predictive validation (backtest with metrics) is added, these claims exceed the visible evidence.

### 3.20 Inventor Mechanics: replace "isolates the impact" (G11)

In Inventor Mechanics, find "An event-study design isolates the impact of firm moves." Replace with "An event-study design estimates changes in patenting around the timing of firm moves." Add a methods box or link disclosing: sample selection criteria, fixed effects, parallel-trends diagnostics, and robustness checks.

### 3.21 Company Profiles loading state (K6)

In `/chapters/org-company-profiles/`, the page shows "Loading companies... Loading data..." without server-rendered fallback content. Add: (i) SSR default view with at least one precomputed company profile, (ii) explicit error/empty state messaging, (iii) instructions for using the selector. This is a specific instance of the M8 rendering concern.

---

## PHASE 4 — LOW PRIORITY (Polish)

### 4.1 Self-citation rounding (B4)

Change prose "from 35% to 10%" to "from 35% to 10.5%."

### 4.2 "Five-fold" precision (E4)

Change "five-fold increase" to "more than five-fold increase" everywhere it appears.

### 4.3 Act 6 subtitle (H1)

Change "Emerging fields and frontier technologies" to "Established and emerging technology domains" or "Technology deep dives."

### 4.4 Breadcrumb fix (K1)

Find the breadcrumb component. Fix the blank second crumb ("1. Home 2. 3. ...") — likely the Act-level crumb needs a label.

### 4.5 Tooltip duplication (K2)

Find tooltip/definition rendering. "Bayh-Dole Act Bayh-Dole Act..." and "CPC CPC..." — ensure tooltip content does not duplicate into visible text. Use abbr title pattern.

### 4.6 Caption deduplication (F2)

Audit the figure rendering component. Find where alt text, ARIA label, and visible caption all output the same string. Ensure only one visible instance renders.

### 4.7 "Cite this figure" spacing (F5)

Ensure "Cite this figure" renders as a separate UI element with proper spacing, not concatenated with preceding text.

### 4.8 Toggle label spacing (F6)

Fix "View:Share (%)Count" to "View: Share (%) | Count" (add spacing/separators).

### 4.9 Journalistic headings audit (H5)

Search chapter headings for narrative/journalistic constructions that lack academic precision:

```bash
grep -rn "Revolution\|Exploded\|Skyrocket\|Boom\|Dawn of\|Rise of\|Fall of" src/
```

Replace with descriptive academic alternatives:
- "The Technology Revolution" → "Shifts in Technological Composition, 1976–2025"
- "Rise of [X]" → "Growth in [X] Patent Activity"
- Headline-style "Rose From X% to Y%" → "CPC Sections G and H: X% to Y% (1976–2025)"

This is an editorial pass that can be combined with the causal language audit (5.10/N6).

### 4.10 Double punctuation fix (K7)

In Patent Law chapter content, find "first-inventor-to-file.." (double period). Fix: remove extra period. Add a content lint rule:

```bash
grep -rn '\.\.' src/ | grep -v "node_modules\|\.min\." 
```

### 4.11 Missing space in Patent Quality headings (K8)

In Patent Quality, find "Why are forward citations rising?Why do means and medians diverge" (missing space). Add space or line break between the questions.

### 4.12 Continuation filings editorial overstatement (H6)

In Patent Count, find "makes the concept of a standalone patent increasingly anachronistic." Replace with: "Related filings are prevalent in observed data from 2002 onward, suggesting that analyzing patents in isolation may miss important context."

### 4.13 Blockchain market correlation (G12)

In Blockchain Key Findings, find "corresponds with… cryptocurrency market correction." Either add a cited crypto market index series (e.g., CoinDesk BPI) with the comparison window, or move the market reference from Key Findings to a discussion note with caveats.

---

## PHASE 5 — SEO & AI-READINESS (New Infrastructure)

### 5.1 Canonical tags (M1)

Verify that every page includes `<link rel="canonical" href="...">` in `<head>`. If using Next.js App Router, this is typically set via the `metadata` export or `generateMetadata()`. Check with:

```bash
grep -rn "canonical" src/app/
```

If absent, add canonical URLs to each page's metadata. The canonical should be the full absolute URL (e.g., `https://patentworld.vercel.app/chapters/patent-count`).

### 5.2 Sitemap.xml (M2)

Check whether `/sitemap.xml` is served. If using Next.js 13+, create `src/app/sitemap.ts`:

```typescript
export default function sitemap() {
  return [
    { url: 'https://patentworld.vercel.app/', lastModified: new Date() },
    // ... all chapter URLs
  ]
}
```

Ensure every chapter page is included. Verify by fetching the sitemap after build.

### 5.3 robots.txt (M3) — **RESOLVED**

**Verified February 21, 2026:** `/robots.txt` present with `Allow: /` for all agents plus explicit AI-bot permissions (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, CCBot) and `Sitemap:` directive. No action needed.

### 5.4 Open Graph and Twitter Card metadata (M4) — **RESOLVED**

**Verified February 21, 2026:** Full OG and Twitter Card metadata confirmed on chapter pages: `og:title`, `og:description`, `og:image` (chapter-specific), `og:url`, `twitter:card` (summary_large_image). No action needed.

### 5.5 Unique meta descriptions (M5) — **RESOLVED**

**Verified February 21, 2026:** Unique, chapter-specific meta descriptions confirmed (150–160 chars). No action needed.

### 5.6 Data dictionary page (N2)

Create a new page at `/methodology` or `/data-dictionary` that defines:

- Patent universe (all types vs utility only) and the count difference
- Temporal coverage (Jan 1976 – Sep 2025; 2025 partial)
- Geography basis (inventor vs assignee)
- Field classification basis (CPC sections vs topic model)
- Every bespoke metric: originality score (formula), exploration composite (formula + weights), sleeping beauty detection rule (thresholds), HHI basis, green patent definition (Y02/Y04S CPC codes), "computing share" variants (CPC G+H vs topic model)
- Data source: PatentsView bulk download, version/date

Each chapter should link to its relevant definitions on this page. This structurally resolves G1, G7, G8, G9, and parts of A1/A8.

### 5.7 llms.txt (N1) — **MOSTLY RESOLVED**

The `/llms.txt` file already exists and is comprehensive: includes site overview, data source, temporal coverage, total patents (9.36M), chapter count (34), visualization count, and per-chapter URLs organized by Act.

**Remaining fix:** Integrate llms.txt generation into the build pipeline so that statistics (especially the visualization count — see Task 1.12/A9) are auto-generated from the same data source that feeds the site. Currently the visualization count in llms.txt (459) does not match the homepage (359).

### 5.8 BreadcrumbList JSON-LD (N4) — **RESOLVED**

~~Add BreadcrumbList structured data to each chapter page.~~

**Verified February 21, 2026:** BreadcrumbList JSON-LD already present on chapter pages with proper 3-item hierarchy (Home → Act → Chapter). No action needed.

### 5.9 Acronym first-use definitions (N5)

Search all chapter content files for common acronyms used without definition:

```bash
grep -rn "CPC\|HHI\|WIPO\|IPC\|USPTO\|FDM\|HGP\|CRISPR\|NLP\|LDA\|NMF\|SSG\|SSR" src/
```

For each chapter, ensure every acronym is defined on first use (e.g., "Cooperative Patent Classification (CPC)"). A specific known instance: the homepage uses "NMF topic modeling" without defining Non-Negative Matrix Factorization, a technical term unfamiliar to general audiences. Fix: "Non-Negative Matrix Factorization (NMF) topic modeling."

Alternatively, if implementing the `<abbr>` tooltip pattern from 4.5/K2, link all acronyms to the data dictionary (5.6/N2).

### 5.10 Causal language audit (N6)

Search all chapter content for causal verbs and phrases:

```bash
grep -rn "caused\|led to\|driven by\|resulted in\|due to\|because of\|impact of" src/
```

For each match, evaluate whether the chapter presents a causal identification strategy. If not, replace with correlational language:
- "driven by" → "associated with" or "accompanied by"
- "led to" → "preceded" or "was followed by"
- "caused" → "coincided with"
- "impact of X on Y" → "association between X and Y"

This is a site-wide editorial pass, not a per-instance fix. Create a style guide rule for future content.

### 5.11 Dataset JSON-LD (N3) — **PARTIALLY RESOLVED**

The methodology page already carries `Dataset` JSON-LD. However, a `DataCatalog` schema is not yet present.

**Remaining fix:** Add a `DataCatalog` schema referencing the PatentsView source, 9.36M record count, temporal coverage, and variable definitions. Consider per-chapter `Dataset` entries for individual analytical outputs.

### 5.12 SSR/SSG verification and migration (M8) [STRUCTURAL — 2–6 WEEKS]

This is the single highest-impact SEO and AI-readiness improvement. Verify whether chapter content is server-rendered or client-only:

```bash
curl -s https://patentworld.vercel.app/chapters/patent-count | grep -c "Key Findings"
```

If this returns 0 (i.e., the prose does not appear in the raw HTML), the site is client-rendered and invisible to most crawlers and LLM agents. Migration steps:

1. Ensure all chapter pages use `generateStaticParams()` + static rendering (App Router) or `getStaticProps()` (Pages Router).
2. Chapter prose, key findings, and figure captions must appear in the initial HTML response.
3. Interactive charts can remain client-rendered (with `"use client"` in App Router), but all text content must be in the server-rendered HTML.
4. Verify after migration: `curl -s [chapter URL] | grep "Key Findings"` should return matches for every chapter.

### 5.13 PatentsView database version citation (E5)

Find the footer or About page text that cites "PatentsView (USPTO)." Add the specific database release version and date:

```
Data source: USPTO PatentsView, [version/release identifier], downloaded [date].
Temporal coverage: January 1976 – September 2025.
```

If the data was pulled via API, cite the endpoint version. This is essential for reproducibility.

### 5.14 Sitemap lastmod values (M2)

All URLs in sitemap.xml share an identical `<lastmod>` timestamp (deploy time). This reduces the signal value for crawlers.

Fix: Derive per-page `lastmod` from the most recent git commit touching the page's content file. In Next.js, this can be done in the `sitemap.ts` generator by running `git log -1 --format=%cI -- [content-file-path]` at build time. If not feasible, remove `<lastmod>` entirely (it is optional in the sitemap protocol).

---

## VERIFICATION CHECKLIST

After all fixes, run these checks:

**Content accuracy:**
1. `grep -r "—" src/` in figure title and key finding contexts (Green Innovation placeholders)
2. `grep -r "1,269" src/` and `grep -r "6,457" src/` — should return zero in Public Investment context
3. `grep -rn "Stevenson" src/` near year — should show 1980, not 1982
4. `grep -rn "Federal Circuit" src/` near year — should show 1982, not 1984
5. `grep -rn "eBay" src/` near year — should show 2006, not 2007
6. `grep -rn "KSR" src/` near year — should show 2007, not 2010
7. `grep -rn "Bilski" src/` near year — should show 2010, not 2011
8. `grep -r "10% to 55%"` — should not appear as Patent Fields title
9. `grep -r "Dot-Com Bust" src/` or `grep -r "2004.*2005" src/` in macro-label context — should not label 2004–2005 as the dot-com bust
10. `grep -r "Firm Innovation" src/` and `grep -r "Sector Dynamics" src/` — zero results or valid targets
11. `grep -r "2023 guidelines"` in HHI context — should now say "2010"
12. `grep -r "heavily cited"` in backward-citation context — should be replaced
13. `grep -r "7 Key Events"` vs "21" — counts should be consistent
14. `grep -r "isolates the impact"` — should be replaced with non-causal phrasing
15. `grep -r "leading indicator"` in Patent Portfolio — should be softened or validated

**Causal language:**
16. `grep -rn "caused\|led to\|driven by\|resulted in" src/` — each match should be justified or replaced

**SEO & AI-readiness:**
17. `curl -s https://patentworld.vercel.app/robots.txt` — should return valid robots.txt
18. `curl -s https://patentworld.vercel.app/sitemap.xml` — should list all chapter URLs
19. `curl -s https://patentworld.vercel.app/llms.txt` — should return AI-readable site map
20. For each chapter page: verify `<link rel="canonical">`, `og:title`, `og:description`, `meta description` present
21. For each chapter page: verify exactly one `<h1>` tag
22. **SSR verification:** `curl -s [any chapter URL] | grep "Key Findings"` — should return matches (prose in HTML)
23. Footer or About page should cite PatentsView with a specific release version/date

**Build:**
24. `npm run build` should succeed with no new warnings