# PatentWorld Comprehensive Audit, Fix, and Deploy — Claude Code Prompt (v6)

## ROLE

You are a forensic editor, data/visualization auditor, academic methodology reviewer, technical SEO engineer, accessibility specialist, and full-stack developer operating on the PatentWorld codebase. Your PRIMARY mandate is **absolute accuracy and precision**: every number, percentage, ranking, trend claim, caption, takeaway, legal reference, citation, derived metric formula, methodology description, and external factual claim on the website must be provably correct. Your SECONDARY mandate is **academic rigor**: every statement must be defensible in a peer-reviewed context, free of unsupported causal language, and free of politically or socially sensitive framing that could undermine credibility. You must process EVERY page, EVERY chapter card, and EVERY visualization — no spot-checking, no sampling.

---

## CONTEXT

- **Project directory:** `/home/saerom/projects/patentworld`
- **Live site (reference only, post-deploy):** `https://patentworld.vercel.app/`
- **Hosting:** Vercel (auto-deploys on push to main).
- **Working method:** All auditing and editing happens on LOCAL source files. Do NOT crawl/fetch the live site. Use web search ONLY for Track B external claim verification.
- **Accuracy mandate:** Do not guess. If something cannot be verified, write exactly: `"I cannot confirm."` Never "correct" a value without proving the correct value from a verifiable source.

### Site Structure (as of latest homepage inspection)

**Header navigation:** PatentWorld (→ /), Explore (→ /explore/), Methodology (→ /methodology/), About (→ /about/)

**Footer:** Methodology, About, Explore, FAQ (→ /about/#faq), CC BY 4.0, © 2026 Saerom (Ronnie) Lee, PatentsView attribution ("accessed Feb 2026, Coverage: 1976–Sep 2025")

**Hero statistics:** 9.36M Patents (all types) · 50 Years · 34 Chapters · 458 Visualizations

**34 chapters in 6 Acts:**
- **Act 1 — The System** (7): system-patent-count, system-patent-quality, system-patent-fields, system-convergence, system-language, system-patent-law, system-public-investment
- **Act 2 — The Organizations** (5): org-composition, org-patent-count, org-patent-quality, org-patent-portfolio, org-company-profiles
- **Act 3 — The Inventors** (5): inv-top-inventors, inv-generalist-specialist, inv-serial-new, inv-gender, inv-team-size
- **Act 4 — The Geography** (2): geo-domestic, geo-international
- **Act 5 — The Mechanics** (3): mech-organizations, mech-inventors, mech-geography
- **Act 6 — Deep Dives** (12): 3d-printing, agricultural-technology, ai-patents, autonomous-vehicles, biotechnology, blockchain, cybersecurity, digital-health, green-innovation, quantum-computing, semiconductors, space-technology

**Non-chapter pages:** Homepage (/), Explore (/explore/), Methodology (/methodology/), About (/about/), and any 404/error pages

---

## THREE VERIFICATION TRACKS

**Track A — Data-Driven Claims** (verified against repo data files): Numbers, percentages, rankings, trends derived from PatentsView data. Verified by data lineage tracing and independent computation scripts.

**Track B — External Factual Claims** (verified via web search): Patent law, court decisions, academic citations, institutional facts, definitions, global statistics, technology milestones, methodology attributions, author affiliation.

**Track C — Methodology & Derived Metrics** (verified against code AND literature): How metrics are computed, what algorithms produce results, whether implementations match cited/standard academic definitions.

---

## MANDATORY PROCESSING ORDER

You MUST audit pages in this EXACT order. After each group, save a checkpoint file. Do not skip ahead.

```
GROUP 1: Codebase mapping (Phase 1.1–1.5) → checkpoint: audit/checkpoint-codebase.md
GROUP 2: Act 1 chapters (7 pages) → checkpoint: audit/checkpoint-act1.md
GROUP 3: Act 2 chapters (5 pages) → checkpoint: audit/checkpoint-act2.md
GROUP 4: Act 3 chapters (5 pages) → checkpoint: audit/checkpoint-act3.md
GROUP 5: Act 4 chapters (2 pages) → checkpoint: audit/checkpoint-act4.md
GROUP 6: Act 5 chapters (3 pages) → checkpoint: audit/checkpoint-act5.md
GROUP 7: Act 6 chapters (12 pages) → checkpoint: audit/checkpoint-act6.md
GROUP 8: Homepage (card crosscheck, hero stats) → checkpoint: audit/checkpoint-homepage.md
GROUP 9: Methodology, About, Explore pages → checkpoint: audit/checkpoint-support-pages.md
GROUP 10: Cross-page consistency, sensitivity, SEO, GenAI → checkpoint: audit/checkpoint-global.md
```

---

## PHASE 1: DISCOVERY & AUDIT

### 1.1 — Map the Codebase

```bash
cd /home/saerom/projects/patentworld

# Project structure
find . -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' -o -name '*.mdx' -o -name '*.md' \) | grep -v node_modules | grep -v .next | sort

# Framework, dependencies
cat package.json

# Routing/build config
cat next.config.* 2>/dev/null || cat vite.config.* 2>/dev/null

# Static assets and data files
ls -laR public/
find . -type f \( -name '*.csv' -o -name '*.json' -o -name '*.parquet' -o -name '*.tsv' \) | grep -v node_modules | grep -v .next | sort

# Chart libraries
grep -rE "recharts|d3|chart\.js|plotly|nivo|visx|victory|observable" package.json

# Font imports
grep -rE "@font-face|font-family|google.*fonts|next/font" --include='*.tsx' --include='*.ts' --include='*.css' --include='*.scss' . | grep -v node_modules | head -50

# Git state
git log --oneline -20 && git remote -v && git branch --show-current && git status
```

If dirty, stash with `"chore: stash pre-audit state"`.

**Legacy/Deprecated Component Sweep:**
```bash
# Search for orphaned page components, unused routes, or content structures
# that conflict with the 34-chapter/6-Act taxonomy
grep -rn "chapter" --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.mdx' . | grep -v node_modules | grep -v .next

# Search for any references to a prior version of the site
# (e.g., different chapter count, different titles, different Act structure)
grep -rn "14 chapter\|14-chapter\|The Innovation Landscape\|Who Innovates\|The Technology Revolution" --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.mdx' . | grep -v node_modules
```

If any deprecated content structures are found (e.g., a legacy 14-chapter taxonomy, alternate chapter titles, unused page components), document them in `audit/deprecated-components.md` and flag for removal in Phase 2. The active codebase must contain exactly ONE canonical content taxonomy matching the 34-chapter/6-Act schema.

**Rendering Mode and Routing Verification:**
Determine whether the framework (Next.js, etc.) produces server-side rendered (SSR), statically generated (SSG), or client-side rendered (CSR) pages:
```bash
# Check build output mode
grep -E "output|export|ssr|static" next.config.* 2>/dev/null

# Check for rewrites/redirects in Vercel config
cat vercel.json 2>/dev/null

# Verify all routes produce valid HTML at build time
npm run build 2>&1 | tail -50
```

If the site uses client-side rendering without server-side fallbacks, deep links (e.g., `/chapters/ai-patents/`) will fail on direct navigation and be invisible to search engines. This must be corrected: all 34 chapter routes plus non-chapter pages must produce valid server-rendered HTML with HTTP 200 responses.

### 1.2 — Data Source Registry

Save to `audit/data-source-registry.md`. For EACH data file:
- File path, format, schema (columns + types), row count
- Time coverage (earliest/latest year); identify exact last date of 2025 data
- Key identifiers (patent numbers, assignee IDs, CPC codes, inventor IDs)
- PatentsView data version / download date (cross-check against footer claim "accessed Feb 2026")
- Disambiguation version for inventors and assignees
- Which pages import this data (trace imports)
- Transformation functions (file paths, what they do)
- CPC reclassification handling
- Data lineage: raw file → transformation → chart/text

### 1.3 — Page and Visualization Inventory

Save to `audit/page-inventory.md`. For EVERY page/route:
- File path, route URL, page title, Act + chapter position
- Meta description, JSON-LD presence, heading hierarchy (h1/h2/h3 structure)
- Count of visualization components

**Mandatory verification counts:**
- Total chapter pages = 34 (verify: 7+5+5+2+3+12)
- Total visualization components = 458 (count individually across ALL files; the previous version showed 359 — the increase of 99 visualizations must be accounted for)
- Non-chapter pages: homepage, explore, methodology, about, 404 — list all

**Per-figure manifest (new deliverable):**
Generate `audit/figure-manifest.csv` with one row per visualization component:
- figure_id, page_url, source_data_file, denominator (utility-only vs all types), time_window (start_year–end_year), partial_year_flag (boolean), filters_applied (e.g., "utility patents only", "top 50 assignees"), checksum of source data file

This manifest enables automated consistency checking between figure data sources and the prose claims that reference them.

### 1.4 — Technology Domain Definition Registry

Save to `audit/technology-domain-definitions.md`. For EACH of 12 Deep Dive domains:
- Domain name, definition method (CPC codes, keywords, patent IDs, other)
- Specific codes/keywords
- File path of definition
- Disclosed on chapter page? (yes/no)
- Overlaps with other domains? (list which)
- Overlap disclosed? (yes/no)

### 1.5 — Derived Metrics Registry

Save to `audit/derived-metrics-registry.md`. Catalog EVERY derived metric used anywhere:

Known metrics: originality, generality, Shannon entropy (multiple scales — portfolio-level vs. normalized subfield diversity), HHI, top-4 concentration, citation half-life, blockbuster rate, exploration score, patent velocity, CAGR, novelty (median entropy), entry velocity multiplier, convergence indices, subfield diversity (normalized entropy).

**CRITICAL — Entropy scale consistency check:** The homepage shows two different entropy scales:
- Portfolio diversity: Shannon entropy of 7.1 (Mitsubishi Electric, 287 CPC subclasses) — this is raw Shannon entropy (ln-based or log2-based)
- Subfield diversity: 0.97 (autonomous vehicles), 0.94 (biotech), 0.92 (digital health) — these appear to be NORMALIZED entropy (0–1 scale)
- Topic novelty: 1.97 to 2.10 — yet another scale

For EACH entropy metric, determine: log base, normalization method, what it measures, and verify the label is unambiguous.

For EACH metric, record: formula in code, file path, cited academic source, standard definition, match (yes/no), pages where used, consistent across pages (yes/no).

---

### 1.6 — TRACK A: Data Accuracy Audit (PER-CHAPTER)

Process ALL chapters in the mandatory order. For EACH chapter page, perform ALL of the following sub-checks.

#### 1.6.1 — Number-by-Number Verification
Every specific number on the page: quote exact text, classify (Track A/B/C), trace data source, independently compute, record result. Save scripts to `audit/verification-scripts/`.

#### 1.6.2 — Homepage Hero Statistics
Verify independently:
- **"9.36M Patents (all types)"**: compute exact total from data. Verify it rounds to 9.36M. "All types" = utility + design + plant + reissue.
- **"50 Years"**: 1976–2025 spans 50 year labels. But "(2025 data through September)" means 2025 is partial. Is "50 Years" counting year labels (correct) or completed calendar years (would be 49.75)? Verify the convention is reasonable and consistent with "from 1976 to 2025."
- **"34 Chapters"**: count chapter page files = 34.
- **"458 Visualizations"**: count ALL visualization components across ALL pages. Previously 359. Account for the increase of 99.

#### 1.6.3 — Homepage Hero Text Verification
The hero states: *"Annual grants increased more than five-fold over this period, from approximately 70,000 in 1976 to 374,000 in 2024, as computing and electronics (Cooperative Patent Classification sections G and H) rose from 27% to 57% of all grants."*

Verify each claim:
- "more than five-fold": 374,000 / 70,000 = 5.34×. "More than five-fold" is accurate. ✓
- "approximately 70,000 in 1976": verify exact 1976 total from data (all types).
- "374,000 in 2024": verify exact 2024 total from data (all types). Note "approximately" applies only to 1976, not 2024.
- "CPC sections G and H rose from 27% to 57%": verify G+H combined share in earliest and latest full year.

#### 1.6.4 — Homepage Chapter Card Summaries (34 CARDS — CHECK EVERY ONE)
For EVERY chapter card on the homepage, extract EVERY number and cross-reference against the chapter page's actual data. Save to `audit/homepage-card-crosscheck.md`.

**Known items requiring special attention** (from homepage inspection):

**Act 1 cards:**
1. Patent Count: "approximately 70,000 in 1976," "374,000 in 2024," "peaking at 393,000 (all types) in 2019," "3.8 years in 2010"
2. Patent Quality: "9.4 to a peak of 18.9 in 2005," "6.4 in 2019," "0.09 to 0.25," "0.45-0.55 by the 2020s," "0.28 to 0.15"
3. Patent Fields: "27% to 57%," "30 percentage points," "more than 1,000%"
4. Convergence: "21% to 40% by 2024," "12.5% to 37.5% between 1976-1995 and 2011-2025" — verify date ranges use en-dash
5. Language: "12% to 33%," "6.6% from 1.97 to 2.10" — verify: (2.10-1.97)/1.97 = 6.60% ✓
6. Patent Law: "Alice (2014)," "AIA (2011)," "most significant reform since 1952," "Twenty-one... from 1980 to 2025" — verify count of 21 on chapter page; verify timeline expanded to 2025
7. Public Investment: "1,294 in 1980," "8,359 in 2019," "55,587," "43,736," "33,994"

**Act 2 cards:**
8. Assignee Composition: "94% to 99%," "around 2007," "1.45 million"
9. Org Patent Count: "161,888," "9,716 in 2024," "32-39%"
10. Org Patent Quality: "6.7%," "30.7," "6.3 to 14.3" — the upper bound (14.3) lacks entity attribution
11. Patent Portfolio: "50 companies (248 company-decade observations)," "8 industry groups," "Shannon entropy of 7.1," "287 CPC subclasses," "51 pivots," "20 companies"
12. Company Profiles: descriptive, no specific numbers to verify

**Act 3 cards:**
13. Top Inventors: "top 5%... 63.2%," "26% to 60%," "6,709 patents," "10 to 965 average citations among top 100"
14. Generalist vs. Specialist: "20% to 48%," "9.3 vs 8.2," "0.212 vs 0.165"
15. Serial vs. New: "140,490 in 2019," "37-51%," "1.4 to 2.1"
16. Gender: "2.8% in 1976 to 14.9% in 2025 (through September)," "14.2 vs 12.6 vs 9.5," "14.6% (1976-2025), reaching 23.4%"
17. Team Size: "1.7 to 3.2," "58% to 23% by 2025," "16.7 vs 11.6"

**Act 4 cards:**
18. Domestic: "23.6%," "992,708," "bottom 30 states," "20.1% vs 65.1%"
19. International: "1.45 million," "299 in 2000 to 30,695 in 2024," "approximately 164,000 during the 2020s," "18.4 average claims"

**Act 5 cards:**
20. Org Mechanics: "11 of 20," "2.3x," "618 organizations"
21. Inventor Mechanics: "632," "1,236," "143,524," "50 organizations," "1.3% to 5.1%," "77.6%"
22. Geo Mechanics: "1.0% in 1976 to 10.0% in 2025 (through September)," "77 in 2000 to 2,749 in 2024"

**Act 6 cards (12 Deep Dives):**
23. 3D Printing: "36% in 2005 to 11% by 2024," "2009 FDM patents," "11.2 vs 8.3"
24. Ag Tech: "7.4 to 32.9," "nearly quadrupled" (32.9/7.4=4.45×, "nearly quadrupled" is approximate — verify), "46.7% in 2014 to 32.8% by 2025"
25. AI: "5.7-fold" (29624/5201=5.70×), "5,201 in 2012 to 29,624 in 2023," "9.4%," "16,781," "7,775," "6,195"
26. Autonomous Vehicles: "15.9 to 28.6," "1.8-fold" (28.6/15.9=1.80×), "0.97 by 2025"
27. Biotech: "13.5% in 2007 to 4.6% by 2025," "0.32 to 0.94"
28. Blockchain: "peaked in 2022," "26.3% during 2018," "14.0% by 2024"
29. Cybersecurity: "32.4% in 1980 to 9.4% by 2025," "105.8 per year," "1.4-fold over 1970s entrants," "around 2003"
30. Digital Health: "3.4-fold" (77.5/22.5=3.44×), "22.5 to 77.5," "2,909," "2,302," "1,994," "0.48 to 0.92"
31. Green Innovation: "1.8-fold" (122/68=1.79×), "68 to 122," "7,363," "5,818," "3,453," "13,771," "12,636," "10,812"
32. Quantum Computing: "28.4% in 2025 (through September)," "76.9% in 2003"
33. Semiconductors: "11.3% in 1977 to 32.6% in 2023," "197 patents per year"
34. Space Technology: "4.9% and 36.7%"

#### 1.6.5 — Growth Multiple Verification
For every stated fold-increase, independently compute:
- "more than five-fold" (374,000/70,000 = 5.34×)
- "5.7-fold" (29,624/5,201 = 5.70×)
- "3.4-fold" (77.5/22.5 = 3.44×)
- "nearly quadrupled" (32.9/7.4 = 4.45×)
- "1.8-fold" (28.6/15.9 = 1.80×; also 122/68 = 1.79×)
- "1.4-fold" (105.8/? over 1970s — what is the 1970s value? Not stated on card)
- "tripled" (0.94/0.32 = 2.94× — is this "tripled"?)
- Any other fold-change claims on chapter pages

#### 1.6.6 — Percentage and Share Verification
For every percentage: verify numerator, denominator, arithmetic (±0.1 pp). For grouped shares: sum check (100% ±0.1% if exhaustive).

#### 1.6.7 — Ranking and Ordering Verification
For every "Top N" or ordered display: independently sort, verify order, verify entities, check ties.

#### 1.6.8 — Superlative Verification (EXHAUSTIVE — against FULL comparison set)
Known superlatives from the homepage requiring verification against ALL entities/domains:

| # | Claim | Comparison Set | Verification Method |
|---|-------|---------------|-------------------|
| 1 | "IBM leads with 161,888 cumulative grants" | ALL assignees | Sort all by cumulative count |
| 2 | "Amazon holds the highest blockbuster rate at 6.7%" | ALL assignees (or top N — clarify scope) | Compute for all |
| 3 | "Microsoft leads in average citations at 30.7" | ALL assignees (or top N) | Compute for all |
| 4 | "Samsung peaked at 9,716 annual grants in 2024" | All Samsung years | Check 2024 is Samsung's max |
| 5 | "California accounts for 23.6%... more than the bottom 30 states combined" | ALL 50 states + DC | Sum bottom 30, compare |
| 6 | "Japan leads foreign filings with 1.45 million" | ALL countries | Sort by cumulative count |
| 7 | "Biotechnology achieved the lowest top-four concentration" | ALL 12 domains | Cross-domain script |
| 8 | "Quantum computing remains among the most concentrated... alongside agricultural technology" | ALL 12 domains | Cross-domain script |
| 9 | "the only domain where early entrants patent faster than later entrants" (Quantum) | ALL 12 domains | Cross-domain script |
| 10 | "the only advanced technology domain showing sustained consolidation" (Semiconductors) | ALL 12 domains | Cross-domain script |
| 11 | "the only advanced technology domain... to reverse course" (Blockchain) | ALL 12 domains | Cross-domain script |
| 12 | "HHS/NIH leads with 55,587" | ALL agencies | Sort by count |
| 13 | "The most prolific inventor holds 6,709 patents" | ALL inventors | Sort by count |
| 14 | "Chemistry leads cumulative female representation at 14.6%" | ALL fields | Sort by female share |

Save to `audit/superlative-checks.md` with script outputs.

#### 1.6.9 — Partial-Year 2025 Disclosure Consistency
The footer states "Coverage: 1976–Sep 2025." Some chapter cards include "(through September)" and others do not.

Cards WITH disclosure: Gender ("14.9% in 2025 (through September)"), Quantum Computing ("28.4% in 2025 (through September)"), Geographic Mechanics ("10.0% in 2025 (through September)"), hero text.

Cards WITHOUT disclosure that reference 2025: Team Size ("23% by 2025"), Biotechnology ("4.6% by 2025"), Cybersecurity ("9.4% by 2025"), Agricultural Technology ("32.8% by 2025"), Digital Health ("0.92 by 2025"), Autonomous Vehicles ("0.97 by 2025").

**Requirement:** ALL references to 2025 data — on cards, chapter pages, and everywhere else — must include "(through September)" or an equivalent partial-year note. Enforce uniformly.

#### 1.6.10 — "By 2025" vs. "In 2025" Precision
"By 2025" could mean "as of the latest data in 2025" or "by the end of 2025." "In 2025" means in the 2025 observation period. Verify which is intended and enforce consistent usage.

#### 1.6.11 — Time Series and Trend Verification
For every trend: verify start/end values, direction, data gaps, time window, growth rate/CAGR calculations, truncation bias.

#### 1.6.12 — Figure-to-Data Alignment
For every chart: trace code → data → raw file. Verify chart type, axis ranges (zero baseline, clipping, tick intervals), legend, tooltips.

#### 1.6.13 — Table-to-Data Alignment
For every table: verify every cell, headers, row ordering, totals/subtotals.

#### 1.6.14 — Caption Accuracy
For every caption: variables correct, time period correct, sample/scope correct, aggregation correct, no over-interpretation, no causal language.

**Known copy-editing errors (from external review):**
- Patent Quality chapter: "Competing explanations: Why are forward citations rising?Why do means…" — missing whitespace between sentences. Verify and fix all such concatenation errors sitewide.
- Patent Count chapter: "Cite this figure" labels merge into narrative prose (e.g., "Cite this figure Annual patent grants averaged…"). Ensure "Cite this figure" is rendered as a distinct interactive element, not concatenated with body text.
- Domestic Geography chapter: "…innovation-intensive industries process." — grammatical error in a summary sentence. Copy-edit the full paragraph.
- Check ALL chapters for duplicate caption blocks: external review reports captions appearing twice around "Loading visualization…" fallbacks (see Phase 1.10.4).

#### 1.6.15 — Narrative and Takeaway Verification
Every factual claim supported by displayed data. Flag unsupported/contradicted/overstated/underspecified claims.

#### 1.6.16 — Assignee Name Consistency
Same entity = same display name everywhere. Check mapping file. Flag "Samsung Electronics" vs. "Samsung," "IBM" vs. "International Business Machines," etc.

#### 1.6.17 — Cross-Page Consistency
Same statistic on multiple pages = identical values. Same terminology throughout. Code matches methodology descriptions.

Known cross-page items: IBM 161,888 (Org Count card + Company Profiles), Amazon 6.7% (Org Quality card), Japan 1.45 million (Composition card + International Geography card), 632/1,236 (Inventor Mechanics), gender citation averages (Gender card).

**CRITICAL — Known logic error on Org Patent Count chapter:**
The "Blockbuster Patent Concentration" section reports "Gini coefficients … decreased … from 0.161 … to −0.069." However, the same page defines the Gini coefficient as ranging from 0 to 1. A negative Gini coefficient contradicts this definition and is mathematically impossible under the standard formulation. Either (a) the computation is incorrect, (b) the metric is actually a signed difference or delta being mislabeled as a Gini coefficient, or (c) the display is showing a different statistic. The audit MUST: recompute the statistic from source data, verify whether it is a true Gini or a different measure, and correct the label, value, or definition to be internally consistent.

**Known definition inconsistency on Org Patent Count chapter:**
The chapter defines "blockbuster" patents as "top 1% … normalized within each filing year and CPC section cohort." However, the Methodology page defines this normalization using grant-year × CPC section. Filing-year and grant-year cohorting produce materially different results because of variable grant pendency (2–4 years). The audit MUST: determine which cohort basis the code actually uses, ensure the Methodology page and ALL chapter pages that reference "blockbuster" use the identical definition, and propagate consistently.

**Known denominator mismatch on Patent Fields chapter:**
The Key Finding states "G and H … now constituting 57.3% of all patent grants" while the section header reads "Share of utility patents by CPC section." "All grants" includes design, plant, and reissue patents; "utility patents" does not. The different denominators change the percentage. The audit MUST: determine which denominator the code uses and standardize the language across Key Finding, caption, and methodology to match.

**Known decade-definition ambiguity on International Geography chapter:**
Key Finding states "United States leads with approximately 164,000 patents … during the 2020s (summed across 2020–2024)." The term "2020s" conventionally refers to 2020–2029; the parenthetical restricts it to 2020–2024. Replace "during the 2020s" with an unambiguous label such as "2020–2024 (five-year total)" and verify consistency with how "decade" is defined on other pages.

**Known corpus-size inconsistency on Language chapter:**
Key Findings reference "8.4M abstracts" while the page heading says "8.45 million." Standardize to one value and explain rounding convention if applicable.

**Known orphaned question on Assignee Composition chapter:**
"Why can't we infer causation from assignee composition trends?" appears without a corresponding answer block. Either add a substantive 3–6 sentence explanation (confounding, cohort effects, legal/policy shifts, assignee reassignments) or remove the question.

**Known attribution inconsistency sitewide:**
Some Key Findings cite "Source: PatentWorld" while figure captions cite "PatentsView/USPTO." Readers may not understand whether numbers come from PatentsView directly or from derived computations. Standardize to: "Data: PatentsView (USPTO). Computations: PatentWorld."

#### 1.6.18 — Deep Dive Cross-Domain Framework Consistency
ALL 12 Deep Dive chapters must use: identical metric definitions (top-4 concentration, entry velocity, subfield diversity, patent velocity multiplier), same code path or equivalent computation, same cohort year boundaries.

Write ONE comprehensive script computing key metrics for all 12 domains. Save to `audit/verification-scripts/cross-domain-comparison.py`.

**CRITICAL — The Concentration Level vs. Concentration Trend Paradox:**
The homepage chapter cards create a semantic collision between three domains:
- Agricultural Technology: 32.8% top-four concentration in 2025 (the HIGHEST absolute level)
- Semiconductors: 32.6% in 2023, declared "the only domain showing sustained consolidation"
- Quantum Computing: 28.4% in 2025, framed as "among the most concentrated... alongside agricultural technology"

The underlying distinction is between *static concentration level at a point in time* (a snapshot) and *the trajectory of concentration over time* (the trend). Semiconductors is unique because its concentration has been *rising* (from 11.3% in 1977), whereas Agricultural Technology's 32.8% was reached after a *decline* from 46.7%. Quantum Computing's 28.4% is mathematically lower than both, yet it is grouped with Agriculture as "most concentrated."

The audit MUST:
1. Compute top-4 concentration for all 12 domains at their latest available year. Rank by absolute level. Determine which domain(s) truly have the highest concentration.
2. Compute the TREND (direction and magnitude of change) in top-4 concentration over time for all 12 domains. Determine which domain(s) show sustained *rising* concentration.
3. Verify that the text on each Deep Dive page — and on each homepage card — clearly distinguishes between "highest concentration level" and "rising concentration trend." If the text uses the word "concentrated" without specifying which dimension it refers to, flag as ambiguous.
4. Verify that every "only domain" or "most concentrated" claim is strictly true under whichever dimension is being invoked, and that the dimension is explicitly stated.

Save findings to `audit/concentration-paradox-check.md`.

#### 1.6.19 — Censoring, Truncation, Missing Data Disclosure
Right-censoring (citations), left-truncation, entity exclusions, undisclosed filtering, PatentsView disambiguation caveats.

#### 1.6.20 — Raw Statistic Confounder Disclosure
Flag any comparative statistic presented as a raw average without controlling for confounders:

**Known instance:** Gender chapter card states "All-male teams average 14.2 forward citations, mixed-gender teams 12.6, and all-female teams 9.5." If this is a raw average not controlling for field, year, team size, or firm, it MUST be disclosed with language such as: "These are unconditional averages and do not control for differences in field composition, team size, or institutional affiliation across gender groups."

Flag ALL cross-group comparisons (by geography, firm type, inventor type, gender) for the same issue.

---

### 1.7 — TRACK B: External Factual Claims (WEB SEARCH)

#### 1.7.1 — Extract All External Claims
Save to `audit/external-claims-registry.md`. Categories: `LAW`, `CASE`, `POLICY`, `HISTORY`, `DEFINITION`, `CITATION`, `INSTITUTION`, `COMPARATIVE`, `METHODOLOGY`, `TECHNOLOGY_CONTEXT`, `AFFILIATION`.

#### 1.7.2 — Patent Law and Policy
**Pre-verified claims (confirmed correct as of Feb 2026):**
- Alice Corp. v. CLS Bank International decided June 19, 2014 — CORRECT ✓
- AIA signed September 16, 2011; "most significant reform since 1952" — CORRECT ✓ (confirmed by White House, Wikipedia, Brookings, multiple legal analyses referencing Patent Act of 1952)
- Bayh-Dole Act (Pub. L. 96-517, December 12, 1980) — CORRECT ✓

**CRITICAL — Known timeline date errors on Patent Law chapter page (independently verified Feb 2026):**
The "21 Key Events" timeline on the Patent Law chapter contains multiple incorrect years. Each must be corrected to the authoritative date:

| Event | Site Shows | Authoritative Date | Source |
|-------|-----------|-------------------|--------|
| eBay v. MercExchange | 2007 | May 15, **2006** | 547 U.S. 388 (2006); Justia, Wikipedia, WIPO, Cornell LII |
| KSR v. Teleflex | 2010 | April 30, **2007** | 550 U.S. 398 (2007); Justia, Wikipedia, WIPO, Cornell LII |
| Bilski v. Kappos | 2011 | June 28, **2010** | 561 U.S. 593 (2010); Justia, Wikipedia, WIPO, BitLaw, Finnegan |
| Stevenson-Wydler Act | 1982 | October 21, **1980** | Pub. L. 96-480; Congress.gov, GovInfo, WIPO Lex, American Presidency Project |
| Federal Circuit Created | 1984 | April 2, **1982** (effective Oct 1, 1982) | Federal Courts Improvement Act, Pub. L. 97-164; Federal Judicial Center, Wikipedia, GovTrack |
| Hatch-Waxman Act | 1984 | September 24, **1984** | CORRECT ✓ |
| TRIPS Agreement | 1994 | Concluded April 15, **1994**; in force January 1, **1995** | Requires "date basis" note |
| GATT Patent Term Change | 1995 | **1995** | CORRECT ✓ |

Verify the remaining 13 of 21 events on the chapter page using the same authoritative-source methodology. For every event, add a "date basis" note indicating whether the year refers to: enacted/signed, effective, argued, or decided.

**Still requiring verification on chapter page:**
- "Twenty-one legislative and judicial events from 1980 to 2025" — verify count of 21 on the Patent Law chapter page; verify each event name, date, and characterization against the authoritative source hierarchy (primary legal → official agency → peer-reviewed)
- "associated with observable shifts in filing patterns within one to two years" — verify this is descriptive (associative), not causal
- Timeline expanded from "1980 to 2021" to "1980 to 2025" — verify what events were added after 2021

#### 1.7.3 — Court Decisions: verify case names, years, courts, holdings, citation format.

#### 1.7.4 — Academic Citations: verify authors, titles, years, journals, DOIs, characterization of findings.

#### 1.7.5 — Definitions: verify against MPEP, 35 U.S.C., WIPO Glossary, original papers.

#### 1.7.6 — Comparative Claims: verify external benchmarks.

#### 1.7.7 — Technology Context Claims
Known claims to verify:
- "the expiration of key FDM patents in 2009 opened the field to broad-based competition" (3D Printing): verify specific FDM patent expiry dates; flag "opened the field" as causal
- "CRISPR-Cas9" (Biotech): verify technology timeline
- Other technology milestones on Deep Dive pages

#### 1.7.8 — Author Affiliation
"Saerom (Ronnie) Lee, The Wharton School, University of Pennsylvania" — verify current affiliation. Verify https://www.saeromlee.com resolves.

#### 1.7.9 — Data Provenance
Footer states "Data from PatentsView (USPTO), accessed Feb 2026. Coverage: 1976–Sep 2025."
- Verify actual download date in repo/git history matches "Feb 2026"
- Verify PatentsView data version
- Check if PatentsView CC-BY 4.0 attribution requirements are met

**CRITICAL — Known cross-page provenance inconsistency:**
External review reports that the Explore page and chapter footers state "accessed Jan 2025" while the About page states "accessed February 2026." If confirmed, this means different pages may be displaying data from different PatentsView snapshots—or the text was updated inconsistently. The audit MUST:
1. Search the entire codebase for ALL instances of "accessed" date strings (grep for "accessed", "Jan 2025", "Feb 2026", "January 2025", "February 2026")
2. Determine the single correct access date from git history or data file timestamps
3. Generate this date from a SINGLE config constant so it cannot become inconsistent again
4. Verify every page displays the same provenance string

#### 1.7.10 — Copyright and License
"© 2026 Saerom (Ronnie) Lee. Content licensed under CC BY 4.0."
- Is the copyright year hardcoded or dynamic? If hardcoded, it will become outdated.
- Is CC BY 4.0 appropriate given PatentsView's own CC BY 4.0 license?

#### 1.7.11 — Compile Track B Report
Save to `audit/external-claims-verification.md`.

---

### 1.8 — TRACK C: Methodology and Derived Metrics

#### 1.8.1 — Derived Metric Formula Audit (code vs. literature)
For every metric: compare code to canonical definition. Check:
- HHI: fraction vs. percentage; denominator convention
- Originality/generality: which classification (NBER, CPC sections, CPC subclasses)?
- Shannon entropy: log base (e, 2, 10); normalization (yes/no); scale consistency
- Citation half-life: patent-level or cohort-level
- Blockbuster rate: percentile threshold; within year/field/overall
- Exploration score: "new" relative to what baseline
- Entry velocity multiplier: ratio of which cohort means? Denominator = total years active?
- Subfield diversity: normalized entropy (0–1)? If so, normalized by log(N_subclasses)?

#### 1.8.2 — Gender Inference Methodology Audit
Method used, disclosure, error rates, ethnic/geographic bias, confidence threshold, unclassifiable names, whether comparisons control for confounders.

#### 1.8.3 — NLP/Topic Modeling Audit
Algorithm, corpus, topic count selection, labels, "novelty (median entropy)" definition, disclosure.

#### 1.8.4 — Network/Clustering Audit
Algorithm, k selection, similarity metric, tie definition, counts (50 companies → 248 observations, 8 clusters, 632 inventors, 1,236 ties), disclosure.

#### 1.8.5 — Technology Pivot Detection Audit
Definition, algorithm, count (51 pivots, 20 companies), softened claim ("which can precede strategic shifts that later become publicly visible" — verify this is presented as possibility, not prediction). Disclosure.

#### 1.8.6 — Inventor Mobility Definition Audit
"143,524 inventor movements (consecutive patents at different assignees within 5 years)" — verify definition matches code. What counts as "different assignee"? How is the 5-year window applied? Are subsidiary name changes excluded?

#### 1.8.7 — Compile Track C Report
Save to `audit/methodology-verification.md`.

---

### 1.9 — Language, Sensitivity, and Presentation Audit

#### 1.9.1 — Causal and Quasi-Causal Language (COMPREHENSIVE)
Flag ALL of the following unless methodology supports causal inference:

**Direct causal (always flag):** "caused," "led to," "resulted in," "due to," "because of," "driven by," "enabled," "contributed to," "fostered," "spurred," "fueled," "prompted," "triggered," "gave rise to," "brought about," "opened the field to"

**Quasi-causal (flag and evaluate):** "reflecting," "as" (causal sense), "with the emergence of," "in response to," "following," "in the wake of," "coinciding with" (if used to imply cause)

**Known instances still present on homepage cards:**
1. 3D Printing: "the expiration of key FDM patents in 2009 opened the field to broad-based competition"
2. Biotechnology: "reflecting successive waves from recombinant DNA to CRISPR-Cas9"
3. Cybersecurity: "reflecting broad-based entry across the field"
4. Quantum Computing: "reflecting high hardware IP barriers"
5. Space Technology: "reflecting the transition from government-dominated to commercial-driven innovation"

**Known causal overreach on Inventor Mechanics chapter page:**
6. "Event-Study Evidence" section uses "revealing how … affects citation impact" and "Moves to higher-quality firms produce larger post-move citation gains." This is causal language. Unless the chapter enumerates identification assumptions (selection into moves, pre-trends, placebo tests, robustness), these claims must be rewritten as associative: "is associated with higher post-move citation counts" rather than "produce larger gains." If causal claims are to be retained, the text must include: (a) identification strategy, (b) sample construction, (c) pre-trend evidence, (d) placebo/robustness tests, and (e) explicit acknowledgment of threats (e.g., selection bias).

**Known normative language on Assignee Composition chapter:**
7. "US patent system has become the de facto global standard" — this is a normative characterization that can be contested. Replace with a verifiable, descriptive claim tied to observed filing behavior, such as "the US remains a major venue for multinational patent filings."

**Replace with:** "is associated with," "coincided with," "occurred alongside," "was accompanied by," "was followed by," "during the same period as"

#### 1.9.2 — Interpretive Language Beyond Data
Flag statements that interpret patterns beyond what the data directly show:
- International Geography: "suggesting a quality-quantity tradeoff" — this is an interpretation. Add "one possible interpretation is" or present as hypothesis, not conclusion.

#### 1.9.3 — Informal Language
Disallowed: "a lot of," "pretty much," "kind of," "really big," "skyrocketed," "exploded," "game-changer," "interesting to note," "it is worth noting," "it turns out," "notable that," "remarkably," "importantly," "interestingly," "strikingly," "dramatically" (unless quantified), "significantly" (unless statistical significance tested)

#### 1.9.4 — Socially and Politically Sensitive Content
Flag and review:
- **Gender analysis**: raw citation averages by team gender without confounder disclosure (see 1.6.20)
- **Gender inference measurement limitations**: The Methodology page acknowledges that gender_code (M/F) "does not capture non-binary identities" and "may misclassify." These limitations must also appear prominently on the Gender and Patenting chapter page itself, not only in the Methodology. Add a brief "Measurement limitations" note on the chapter page that foregrounds the binary constraint, potential misclassification, and the fact that coverage varies by name origin.
- **International comparisons**: "quality-quantity tradeoff" framing for non-US patents — acknowledge claims count is one measure of complexity, not a definitive quality indicator
- **"China grew from 299... to 30,695"**: present neutrally without threat/competition framing
- **US-China "policy tensions" language** (Geographic Mechanics chapter): "US-China … since China's WTO accession in 2001" and "policy tensions … after 2018" — "policy tensions" is underspecified and invites geopolitical interpretation. Tie wording to observable series breaks ("growth moderated after 2018 in some sections") and, if policy context is retained, cite a specific policy change and date.
- **"Quality-oriented filing strategy" language** (International Geography chapter): "US leads … 18.4 average claims … China … 14.7 claims" alongside "quality-oriented filing strategy" implies that higher claims = higher quality. Claims count is a measure of scope or complexity, not quality. Different drafting norms, legal systems, and field compositions confound the comparison. Rephrase as a "scope proxy" and acknowledge these factors.
- **Domestic geography**: "more than the bottom 30 states combined" — factual but potentially provocative
- **Organizational rankings**: note that patent strategy varies (some firms patent aggressively, others rely on trade secrets)
- **"Government-funded patents"**: present neutrally; note that the post-Bayh-Dole growth in government-funded patents that are then commercialized by private entities is a politically charged topic (particularly in pharmaceutical and defense contexts)

**The raw-data-without-context risk:** Multiple statistics on this site (gender shares, international filing volumes, public investment trends) present empirical findings without sufficient methodological commentary to prevent ideological projection. When raw data is presented without causal explanation, it functions as an interpretive blank slate — opposing political and ideological frameworks can project incompatible meanings onto the same numbers. For each sensitive metric, verify that the accompanying text includes:
1. Explicit disclosure of what the statistic measures (and what it does NOT measure)
2. Acknowledgment of confounding variables (see 1.6.20)
3. Avoidance of framing that implies a normative judgment about the statistic
4. No loaded verbs or adjectives ("merely," "only," "staggering," "explosive," "monopolization")

Save to `audit/sensitivity-review.md`.

#### 1.9.5 — Acronym Audit
EVERY page: verify EVERY acronym defined at first use ON THAT PAGE. CPC, USPTO, HHI, CAGR, NLP, AIA, PCT, FDM, CRISPR, ADAS, NIH, HHS, etc.

#### 1.9.6 — Terminology Consistency
Build table of concept → term mappings. Flag inconsistencies. Save to `audit/terminology-consistency.md`.

Known terms requiring consistency: "patent grants" vs. "granted patents" vs. "issued patents"; "assignee" vs. "organization" vs. "firm" vs. "company"; "forward citations" vs. "citations received"; "CPC section" vs. "CPC class" vs. "technology field"

#### 1.9.7 — Date and Number Formatting
- Date ranges: en-dash (–) not hyphen (-). "1976–2025" not "1976-2025." (Homepage currently has both "1976–2025" in hero chart and "1976-1995" in Convergence card — inconsistent)
- Numbers: comma-formatted thousands (70,000 not 70000)
- Percentages: consistent decimal precision
- "in 2024" vs. "by 2024": use consistently (temporal meaning differs)

---

### 1.10 — Structure, Navigation, and Design Audit

#### 1.10.1 — Navigation
- All nav links work: PatentWorld → /, Explore → /explore/, Methodology → /methodology/, About → /about/
- Mobile navigation (hamburger menu) works
- Consider: should a 34-chapter site have in-page search?

#### 1.10.2 — Footer
Current footer elements: Methodology, About, Explore, FAQ (→ /about/#faq), PatentsView attribution + access date + coverage, CC BY 4.0, © 2026.

Verify all links work. Check whether footer should also include: data dictionary link, sitemap link, contact information, full site citation format, PatentsView version number.

#### 1.10.3 — Anchor Links
Verify these resolve to actual element IDs:
- `#chapters` (used by "Browse All Chapters" button)
- `#main-content` (used by skip-to-content)
- `/about/#faq` (used by footer FAQ link)

#### 1.10.4 — Duplicate Content Detection
The homepage chart has TWO noscript/fallback texts:
- "This visualization requires JavaScript. Annual patent grants by type, 1976–2025..."
- "This interactive chart requires JavaScript. Annual patent grants by type, 1976–2025..."

If this is duplicated in the source, remove one. Check ALL pages for similar duplication.

#### 1.10.5 — Breadcrumbs
Every chapter page: Home > Act N: [Title] > Chapter Title. Verify presence and accuracy.

#### 1.10.6 — URL Slug Consistency
Check all slugs match chapter titles: e.g., `org-composition` for "Assignee Composition" (mismatch?), `inv-gender` for "Gender and Patenting" (mismatch?). Either rename slugs or accept the convention and verify it is documented.

#### 1.10.7 — Font and Typography
Same font family site-wide. Consistent heading sizes. No FOUT/FOIT.

**Explicit font stack verification:** Extract the declared `font-family` from the CSS/Tailwind config (e.g., `tailwind.config.js`, global CSS, or Next.js font module). The site MUST declare an explicit font stack rather than relying on unspecified browser defaults. For a data-dense visualization platform, undefined typography creates cross-platform rendering inconsistencies — different system fonts have different character widths, which can cause chart axis label overlap or misalignment on different operating systems. Verify:
- A named font family is declared (e.g., Inter, Source Sans, system-ui)
- The font is loaded consistently (via `next/font`, Google Fonts, or self-hosted)
- Chart axis labels, tick marks, and data labels inherit the declared font
- Fallback fonts are specified in the stack

#### 1.10.8 — Button Behavior Consistency
"Browse All Chapters" → `#chapters` (in-page anchor). "Explore the Data" → `/explore/` (separate page). These serve similar purposes but behave differently. Verify both work correctly.

---

### 1.11 — Visualization Quality Audit

#### 1.11.1 — Color Consistency
Same entity = same color across all charts. Same CPC section = same color everywhere. Extract palette from code and verify.

#### 1.11.2 — Axis and Label Readability
Full names and units. Legible at 375px, 768px, 1280px. No overlap/clipping. Sensible ticks. Zero baseline or disclosed.

#### 1.11.3 — Responsive Design
375px, 768px, 1280px: charts resize, text legible, nav works, no horizontal scroll, touch targets ≥44px.

#### 1.11.4 — "Cite This Figure" Widget
- Present on ALL 458 figures?
- Citation format correct: author, title (matching caption), year, URL?
- Consistent format across all figures?
- URL is permanent?

**Functional verification (not just label presence):** The homepage contains a "Cite this figure" label beneath the hero chart. Verify that this is an INTERACTIVE element, not a static text label. Specifically:
- Does clicking/tapping the label expand or reveal a copyable citation string?
- Does the citation string include all required academic fields (author, figure title, site name, year, persistent URL)?
- Is the citation format consistent with a recognized style (APA, Chicago, or a custom standardized format)?
- Can the user copy the citation to clipboard (via button or text selection)?
- If the widget is non-functional (a label with no underlying mechanism), flag as a critical UX deficiency — researchers cannot cite dynamically rendered JavaScript visualizations without a standardized reference string or persistent identifier.
- Verify this widget works identically on ALL 458 figures, not just the homepage chart.

---

### 1.12 — Accessibility Audit

- Noscript fallbacks for ALL 458 interactive charts
- ARIA labels on chart containers
- Keyboard navigation for interactive elements
- Skip-to-content on every page
- Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)
- No red/green-only distinctions

---

### 1.13 — SEO and Technical Audit

#### 1.13.1 — Metadata
Every page: unique `<title>`, unique `<meta description>`, canonical, OG tags, Twitter card tags.

#### 1.13.2 — Heading Hierarchy
One `<h1>` per page. Logical nesting. No skipped levels.

#### 1.13.3 — Structured Data (JSON-LD)
WebSite, BreadcrumbList, Article/ScholarlyArticle per chapter, Person (author), Dataset/DataCatalog.

**Entity disambiguation:** "PatentWorld" was also the title of an intellectual property law journal published approximately 1985–1989, cited in legal literature alongside publications such as the European Intellectual Property Review. Search engines and LLMs performing entity resolution may conflate the modern platform with the historical journal. The WebSite JSON-LD schema should include explicit `disambiguatingDescription` and/or `sameAs` properties to distinguish the 2026 data visualization platform from the 1980s legal publication. Example:
```json
{
  "@type": "WebSite",
  "name": "PatentWorld",
  "disambiguatingDescription": "An interactive data visualization of 9.36M US patents (1976–2025) by Saerom (Ronnie) Lee, The Wharton School",
  "url": "https://patentworld.vercel.app/"
}
```

#### 1.13.4 — Technical Files
robots.txt, sitemap.xml (complete, with lastmod), favicon, apple-touch-icon, manifest.json.

**Deep-link persistence for academic citation:** Every chapter URL (e.g., `/chapters/ai-patents/`) must be a persistent, directly navigable endpoint that returns valid HTML on a server-side HTTP GET request — not a client-side route that requires JavaScript to resolve. This is a hard requirement for academic use: researchers embed chapter URLs in publications, and a URL that fails on direct navigation is functionally broken as a citation. Verify the framework's output mode (SSG preferred, SSR acceptable, CSR-only unacceptable for this purpose) and confirm that the Vercel deployment serves all routes without requiring client-side hydration to display content.

#### 1.13.5 — Performance
Lazy loading, code splitting, bundle sizes (<500KB), image optimization, Core Web Vitals risk.

---

### 1.14 — GenAI Readiness

- Content extractable without JavaScript (SSG/SSR)
- `llms.txt` with page index, descriptions, provenance
- `data-dictionary.json`/`.md` with metric definitions
- AI-facing docs consistent with human-facing pages

---

### 1.15 — Link Audit

#### 1.15.1 — Internal Links
ALL internal links resolve. Check: nav, breadcrumbs, cross-chapter references, homepage "See full analysis" links (34), "Start Reading" and "Browse All Chapters" buttons, "Explore the Data" button.

#### 1.15.2 — External Links
Test with `curl -sI`. Known externals:
- https://patentsview.org
- https://www.saeromlee.com
- https://creativecommons.org/licenses/by/4.0/
- Any DOIs, paper links, legal source links on chapter pages

---

### 1.16 — Methodology Page Audit

The Methodology page (/methodology/) must contain:
- Data source (PatentsView version, download date, coverage, disambiguation version)
- Data processing pipeline description
- Derived metric definitions with formulas and citations
- Technology domain classification rules
- Gender inference method, limitations, error rates
- NLP/topic model details
- Clustering/network construction rules
- Technology pivot detection algorithm
- Known limitations and caveats
- CPC reclassification handling

Verify ALL content matches the code implementation.

---

### 1.17 — About Page Audit

Must contain: author credentials, project description, data source, methodology link, limitations, license, contact, how to cite, acknowledgments. Verify all claims (Track B). Verify FAQ section exists (footer links to /about/#faq).

---

### 1.18 — Explore Page Audit

All 34 chapters listed and linked. Act organization correct. Descriptions consistent with homepage cards. All links work.

---

### 1.19 — Write the Audit Report

Save to `audit/audit-report.md`:
1. Executive Summary
2. Track A: Data Accuracy Issue Log
3. Track B: External Claims Issue Log
4. Track C: Methodology Issue Log
5. Cross-Page Consistency Log
6. Homepage Card Crosscheck (34 cards)
7. Deep Dive Cross-Domain Comparison (12 domains)
8. Sensitivity/Controversy Log
9. General Issue Log
10. SEO & GenAI Findings

Print: `"PHASE 1 COMPLETE. [counts]. Proceeding to Phase 2."`

---

## PHASE 2: IMPLEMENT ALL FIXES

Priority: Track A → Track C → Track B → Sensitivity → Language → Visualization → Accessibility → Navigation/Structure → SEO → GenAI → Performance.

### 2.1 — Track A: Data Accuracy Fixes
Correct → re-run script → check cascading (same page, other pages, homepage cards, hero stats) → log.

### 2.2 — Track C: Methodology Fixes
Formula mismatches, undisclosed methods, cross-chapter inconsistencies, gender/NLP/clustering/pivot/domain disclosures, entropy scale disambiguation.

### 2.3 — Track B: External Claim Fixes
Per-category corrections. Source attributions.

### 2.4 — Sensitivity Fixes
Confounder disclosure on raw comparisons. Neutralize loaded framing. Add methodology caveats. Ensure international comparisons neutral.

### 2.5 — Language Fixes
Causal → associative. Informal → formal. Acronyms defined. Terminology standardized. Date formatting (en-dash). "By 2025" vs. "in 2025" standardized.

### 2.6 — Partial-Year 2025 Standardization
Add "(through September)" to ALL 2025 references: Team Size, Biotechnology, Cybersecurity, Agricultural Technology, Digital Health, Autonomous Vehicles, and any others found on chapter pages.

### 2.7 — Visualization Fixes
Axes, labels, legends, tooltips, colors, responsive, partial-year disclosures, non-zero baseline disclosures. Color encoding standardized.

### 2.8 — Accessibility Fixes
Noscript fallbacks (remove duplicates like the homepage double fallback), ARIA labels, keyboard nav, skip-to-content, contrast.

### 2.9 — Cite This Figure Fixes
Add to missing figures. Fix citation content. Standardize format.

### 2.10 — Navigation/Structure Fixes
Fix anchor links (#chapters, #main-content, /about/#faq). Fix breadcrumbs. Address button behavior. Complete footer.

### 2.11 — SEO Fixes
Metadata, heading hierarchy, JSON-LD.

### 2.12 — GenAI Fixes
robots.txt, sitemap.xml, llms.txt, data-dictionary.

### 2.13 — Build
```bash
cd /home/saerom/projects/patentworld && npm run build
```
Fix all errors.

Print: `"PHASE 2 COMPLETE. [counts]. Build succeeded. Proceeding to Phase 3."`

---

## PHASE 3: VERIFY ALL FIXES

### 3.1 — Re-run ALL Track A verification scripts
### 3.2 — Re-verify cross-domain superlatives
### 3.3 — Re-verify homepage card crosscheck (34 cards)
### 3.4 — Re-verify sample of 10 Track B + 5 Track C fixes
### 3.5 — Cross-page consistency re-check
### 3.6 — Partial-year 2025 disclosure completeness check
### 3.7 — Page inventory re-run
### 3.8 — Spot-check 10 most-changed files

### 3.9 — Update audit report: add Status/Verified columns

**Combined Accuracy Certification:**
```
TRACK A — DATA: [N] checks pass. Scripts: audit/verification-scripts/
  Homepage hero stats: VERIFIED (9.36M, 50, 34, 458)
  Homepage cards (34): ALL VERIFIED
  Cross-page consistency: [N] resolved
  Deep Dive cross-domain: ALL 12 validated, [N] superlatives checked
  Partial-year 2025: through [DATE], ALL references disclosed
  Growth multiples: ALL independently computed

TRACK B — EXTERNAL: [M] claims verified. [K] corrected. [J] flagged TODO.
TRACK C — METHODOLOGY: [P] metrics verified. [L] corrected. Entropy scales disambiguated.
SENSITIVITY: [Q] items reviewed and addressed.
```

### 3.10 — Lint, type-check, final build.

### 3.11 — Runtime Rendering Verification (if environment supports it)
The audit operates primarily on source files, but certain classes of defects — chart axis label overlap, tooltip positioning, responsive layout breakage, JavaScript hydration failures — manifest only at runtime. If Puppeteer, Playwright, or a headless browser is available in the environment:
```bash
# Start dev server in background
npm run dev &
sleep 10

# Spot-check rendered pages for hydration errors
npx playwright test --project=chromium || echo "Playwright not available; skip runtime checks"
```
At minimum, start the dev server and verify that 5 representative pages (homepage, one Act 1 chapter, one Deep Dive, Methodology, About) render without console errors. Document any runtime-only defects.

### 3.12 — Post-Deploy Deep-Link and HTTP Status Verification
After Phase 4 push, verify that Vercel deployment produces correct HTTP responses for all routes. This ensures deep links are shareable and citable in academic publications:
```bash
# Test representative routes return HTTP 200 (not 404 or soft-404)
for path in "/" "/explore/" "/methodology/" "/about/" "/chapters/system-patent-count/" "/chapters/ai-patents/" "/chapters/biotechnology/"; do
  STATUS=$(curl -sI "https://patentworld.vercel.app${path}" | head -1)
  echo "${path} → ${STATUS}"
done
```
If any route returns 404 or 500, the Vercel deployment configuration (rewrites, `next.config.js` output mode) must be corrected before certifying the audit.

### 3.13 — Automated Accessibility Scan (if environment supports it)
Run automated WCAG 2.1 AA compliance checks on the local dev server for a sample of pages:
```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json --output-path=audit/lighthouse-homepage.json 2>/dev/null || echo "Lighthouse not available"

# axe-core scan
npx axe http://localhost:3000 2>/dev/null || echo "axe not available"
```
Document any automated findings in `audit/accessibility-scan.md`. Prioritize failures in chart containers, interactive elements, and noscript fallbacks.

Print: `"PHASE 3 COMPLETE. All verifications pass. Build clean. Proceeding to Phase 4."`

---

## PHASE 4: COMMIT, PUSH, DEPLOY

```bash
cd /home/saerom/projects/patentworld

# Commit 1: Accuracy, methodology, factual, sensitivity, language, visualization, accessibility
git add -A -- '*.tsx' '*.ts' '*.jsx' '*.js' '*.mdx' '*.md' ':!audit/' ':!public/llms.txt' ':!public/data-dictionary.*' ':!public/robots.txt' ':!public/sitemap.xml'
git commit -m "fix(accuracy): correct data, methodology, factual, sensitivity, language issues

Track A: [N] data errors, [N] partial-year disclosures standardized
Track B: [K] external claims corrected
Track C: [L] metric formulas fixed, entropy scales disambiguated
Sensitivity: [Q] confounder disclosures, neutral framing
Language: causal→associative, informal→formal, terminology standardized
Visualization: axes/labels/colors/responsive/accessibility
Audit ref: audit/audit-report.md"

# Commit 2: SEO + structured data
git add -A -- '*layout*' '*head*' '*metadata*' '*seo*' '*jsonld*' '*schema*'
git commit -m "feat(seo): metadata, JSON-LD, heading hierarchy"

# Commit 3: GenAI readiness
git add public/llms.txt public/data-dictionary.* public/robots.txt public/sitemap.xml
git commit -m "feat(ai-readiness): llms.txt, data dictionary, robots.txt, sitemap.xml"

# Commit 4: Audit artifacts
git add audit/
git commit -m "docs(audit): complete audit report, verification scripts, certification"
```

```bash
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
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
  Found/Fixed/Deferred: [N]/[N]/[N]
  Scripts: audit/verification-scripts/
  Hero stats: VERIFIED (9.36M, 50, 34, 458)
  Cards (34): ALL VERIFIED
  Cross-page: [N] resolved (incl. provenance date, denominator, attribution)
  Cross-domain (12): ALL validated
  Superlatives: [N] checked exhaustively
  Growth multiples: [N] independently computed
  Partial-year 2025: through [DATE], ALL disclosed
  Negative Gini: resolved (value/label corrected)
  Denominator mismatches: [N] standardized
  Figure manifest: audit/figure-manifest.csv ([N] figures)

TRACK B — EXTERNAL:
  Identified/Correct/Corrected/Unverifiable: [N]/[N]/[N]/[N]
  Pre-verified: Alice (2014)✓, AIA (2011)✓, Bayh-Dole (1980)✓
  Patent Law timeline: [N]/21 verified; [N] corrected (eBay→2006, KSR→2007, Bilski→2010, Stevenson-Wydler→1980, FedCir→1982)

TRACK C — METHODOLOGY:
  Verified/Correct/Fixed: [N]/[N]/[N]
  Entropy scales: disambiguated
  Blockbuster cohort: standardized (filing-year/grant-year)
  Disclosures added: [N]

SENSITIVITY: [N] reviewed, [N] addressed
LANGUAGE: [N] causal, [N] informal, [N] acronyms, [N] formatting
VISUALIZATION: [N] fixes across 458 charts
ACCESSIBILITY: noscript/ARIA/keyboard/skip-to-content; automated scan: [run/skipped]
CITE THIS FIGURE: [N] of 458 verified (functional: yes/no)
SEO: metadata + JSON-LD (with entity disambiguation) on all pages
GENAI: llms.txt + data-dictionary + robots.txt + sitemap.xml
ROUTING: all routes return HTTP 200 on direct navigation: [verified/not tested]
FONT STACK: explicit declaration verified: [yes/no]
LEGACY COMPONENTS: deprecated structures found: [N] removed/[N]

Commits: [N] | Branch: [name] | Push: SUCCESS
Deploy: https://patentworld.vercel.app/

CERTIFICATION: [Full statement]
============================================
```

---

## CONSTRAINTS (28 rules — read each one)

1. **Work locally.** All operations under `/home/saerom/projects/patentworld`.
2. **Web search for Track B only.** Never fetch the live site for auditing.
3. **Never fabricate data.** Unverifiable → `<!-- TODO: verify -->`.
4. **Never fabricate citations.** Unfindable → `CANNOT CONFIRM` + `<!-- TODO -->`.
5. **Never silently change a number.** Every change logged.
6. **Never delete without justification.** Every removal logged.
7. **Preserve git history.** No force-push.
8. **Do not modify raw data files** unless provably erroneous.
9. **Stop on critical failure.** Do not push broken code.
10. **Academic language.** Peer-reviewed quality.
11. **Always `cd /home/saerom/projects/patentworld` first.**
12. **Verification scripts are deliverables.** Committed, re-runnable.
13. **Track B source hierarchy:** primary legal → official agency → peer-reviewed → reputable secondary. Never blogs/forums/AI.
14. **Track C source hierarchy:** original paper → cited survey → established reference.
15. **Superlatives require exhaustive verification** against ALL entities.
16. **Partial-year data must be disclosed uniformly.**
17. **Cross-domain consistency mandatory** across all 12 Deep Dives.
18. **Color encoding consistent** across all 458 visualizations.
19. **Raw comparisons must disclose confounders.**
20. **Causal language requires methodological justification.** "Reflecting," "opened the field to," "as" (causal), "produces," "affects," "reveals how" are flagged alongside "caused." Event-study or quasi-experimental claims require explicit identification assumptions and robustness evidence.
21. **Sensitivity review mandatory.** Gender, geography, rankings, public investment — all neutral. Raw statistics without methodological context risk ideological projection.
22. **Process in mandatory order.** Save checkpoint per group. No skipping ahead.
23. **Distinguish concentration LEVEL from concentration TREND.** Never use "most concentrated" without specifying whether referring to absolute top-4 share at a point in time or to the direction of change over time.
24. **Deep links must be persistent.** All routes must produce valid server-rendered HTML. CSR-only routing is unacceptable for an academic platform.
25. **One canonical taxonomy.** The active codebase must contain exactly one content structure (34 chapters, 6 Acts). Remove any deprecated legacy structures.
26. **Data provenance from a single source of truth.** The PatentsView access date, data version, and coverage dates must be generated from a SINGLE config constant. No page may display a different provenance string than any other page.
27. **Denominator consistency.** Every percentage must specify its denominator. "All patent grants" ≠ "utility patents." Key Findings, captions, methodology, and figure code must use the same denominator for each statistic.
28. **Legal/judicial dates verified against primary sources.** Every court decision date must match the authoritative decision date (Justia, Cornell LII, WIPO Lex). Every statute must specify date basis (signed, effective, or enacted). The Patent Law timeline is a known error hotspot (see Phase 1.7.2).