# PatentWorld Comprehensive Audit, Fix, and Deploy — Claude Code Prompt (v7)

## VERSION CHANGELOG (v7 integrated with external review findings)

This version merges the v7 prompt (24 new gap areas, Track D narrative coherence, Phases 0–8) with findings from two external reviews:

1. **v6 → v7 live site audit** (Feb 21, 2026): Independent inspection of all 34 chapter pages, homepage, methodology, about, explore, sitemap.xml, robots.txt, llms.txt, manifest.webmanifest, data-dictionary.json, and all JSON-LD structured data on patentworld.vercel.app.
2. **v7 → v8 forensic review** (Feb 2026): External validation of the v7 prompt's known issues, identification of one new critical finding, and five methodological enhancements to the audit pipeline.

**New critical findings integrated:**
- C5 (NEW): Domestic Geography KPI definition error — "top 1% / top 5% of states" text does not match KPI labels "Top 1 State / Top 5 States" (§1.11.17)
- C1 (reinforced): "Modified Gini" / negative Gini — now requires explicit formula, validation example, and range proof (§1.11.17)
- M4 (NEW): Unformatted debug metadata strings near charts — "Data PatentsView 2025-Q1 Window 5y Through 2020" inline (§1.1.12, Constraint 37)
- C4 (NEW): JSON-LD `hasPart` descriptions not synchronized with chapter content — systemic (§1.11.21, Constraint 33)

**Verified improvements from live site audit (resolved items marked in-place):**
- ✓ Patent Law timeline: 5 critical date errors corrected (eBay→2006, KSR→2007, Bilski→2010, Stevenson-Wydler→1980, Federal Circuit→1982)
- ✓ Gender chapter: confounder disclosure added on chapter page
- ✓ International Geography: quality-quantity tradeoff language softened on chapter page (NOT yet on homepage card / JSON-LD)
- ✓ Org Composition: "de facto global standard" removed; causation section added
- ✓ Mech-Geography: "policy tensions" language replaced with "growth rates moderated"
- ✓ SEO files present on live site: robots.txt, sitemap.xml, llms.txt, manifest.webmanifest, data-dictionary.json
- ✓ JSON-LD entity disambiguation: `disambiguatingDescription` present
- ✓ Footer provenance consistent: "Data from PatentsView (USPTO), accessed Feb 2026. Coverage: 1976–Sep 2025"
- ✓ Semiconductor superlative softened: "the only" → "the primary"

**Six sensitivity reframings integrated (§2.3):**
Country comparisons "quality" framing, U.S.–China mobility "deep integration," gender inference chapter-top callout, regional "self-reinforcing" clusters, blockchain "hype cycle" labeling, pending legislation status labels.

**Five methodological enhancements integrated:**
- Enhancement A: JS-enabled rendering pipeline with HAR/screenshots (§6.14 expanded)
- Enhancement B: Chart data extraction and recomputation (new §1.11.22)
- Enhancement C: Sitewide number registry (new §3.4 expanded, Constraint 35)
- Enhancement D: Lighthouse performance audits for templates (§4.9 expanded)
- Enhancement E: Structured five-section audit report format (§8 expanded)

**Constraints expanded from 32 → 37** (5 new: JSON-LD sync, typography standards, number registry, KPI label consistency, figure metadata standardization).

---

## ROLE

You are a forensic editor, data/visualization auditor, academic methodology reviewer, technical SEO engineer, accessibility specialist, narrative coherence analyst, and full-stack developer operating on the PatentWorld codebase. Your PRIMARY mandate is **absolute accuracy and precision**: every number, percentage, ranking, trend claim, caption, takeaway, legal reference, citation, derived metric formula, methodology description, and external factual claim on the website must be provably correct. Your SECONDARY mandate is **academic rigor**: every statement must be defensible in a peer-reviewed context, free of unsupported causal language, and free of politically or socially sensitive framing that could undermine credibility. Your TERTIARY mandate is **narrative coherence**: every chapter must tell a logically structured story with properly ordered figures, no orphan visualizations, no redundant content across chapters, and accurate cross-references. You must process EVERY page, EVERY chapter card, EVERY visualization, and EVERY structural element — no spot-checking, no sampling.

---

## CONTEXT

- **Project directory:** `/home/saerom/projects/patentworld`
- **Live site (reference only, post-deploy):** `https://patentworld.vercel.app/`
- **Hosting:** Vercel (auto-deploys on push to main).
- **Working method:** All auditing and editing happens on LOCAL source files. Do NOT crawl/fetch the live site. Use web search ONLY for Track B external claim verification.
- **Accuracy mandate:** Do not guess. If something cannot be verified, write exactly: `"I cannot confirm."` Never "correct" a value without proving the correct value from a verifiable source.
- **v6 baseline:** The v6 audit has been executed across 4+ sessions. All Phase 1–4 fixes implemented. 38/38 Lighthouse accessibility scores at 100%. v6 artifacts are in `audit/` (60+ files including figure-manifest.csv, 9+ verification scripts, 10 checkpoints). This v7 audit builds on v6 by addressing 24 identified gaps while retaining all verified strengths.

### Site Structure (verified counts)

**Header navigation:** PatentWorld (→ /), Explore (→ /explore/), Methodology (→ /methodology/), About (→ /about/)

**Footer:** Methodology, About, Explore, FAQ (→ /about/#faq), CC BY 4.0, © 2026 Saerom (Ronnie) Lee, PatentsView attribution ("accessed Feb 2026, Coverage: 1976–Sep 2025")

**Hero statistics:** 9.36M Patents (all types) · 50 Years · 34 Chapters · 458 Visualizations

**Data provenance constants (Constraint 26):** `src/lib/constants.ts` — `DATA_ACCESS_DATE = 'February 2026'`, `DATA_COVERAGE_START = 1976`, `DATA_COVERAGE_END_YEAR = 2025`, `DATA_COVERAGE_END_MONTH = 'September'`

**34 chapters in 6 Acts:**
- **Act 1 — The System** (7): system-patent-count, system-patent-quality, system-patent-fields, system-convergence, system-language, system-patent-law, system-public-investment
- **Act 2 — The Organizations** (5): org-composition, org-patent-count, org-patent-quality, org-patent-portfolio, org-company-profiles
- **Act 3 — The Inventors** (5): inv-top-inventors, inv-generalist-specialist, inv-serial-new, inv-gender, inv-team-size
- **Act 4 — The Geography** (2): geo-domestic, geo-international
- **Act 5 — The Mechanics** (3): mech-organizations, mech-inventors, mech-geography
- **Act 6 — Deep Dives** (12): 3d-printing, agricultural-technology, ai-patents, autonomous-vehicles, biotechnology, blockchain, cybersecurity, digital-health, green-innovation, quantum-computing, semiconductors, space-technology

**Non-chapter pages:** Homepage (/), Explore (/explore/), Methodology (/methodology/), About (/about/), Deep Dive Overview (/chapters/deep-dive-overview/), and any 404/error pages

**Verified structural element counts (from codebase grep):**
- 35 page.tsx files under `src/app/chapters/` (34 chapters + deep-dive-overview)
- 459 `<ChartContainer` usages across 36 files (458 chapter + 1 homepage)
- 34 `<KeyFindings` (1 per chapter)
- 264 `<KeyInsight` across 35 files
- 255 `<SectionDivider` across 35 files
- 42 `<DataNote` across 35 files
- 34 "Executive Summary" `<h2>` sections (inline headings, 1 per chapter)
- 34 `<InsightRecap` (1 per chapter)
- 6 `<CompetingExplanations` across 5 files
- 14 `<RankingTable` across 14 files
- 39 `<StatCard` across 22 files + 1 `<StatCallout`
- `<CiteThisFigure` built into every ChartContainer (all 459)
- 89 cross-chapter `Link` hrefs in chapter pages; 117 total across all files
- 383 JSON data files across `public/data/`
- 15 OG images in `public/og/`

**Known infrastructure state (verified on live site, Feb 2026):**
- `public/sitemap.xml` — Present on live site (verify in local codebase: may be build-generated)
- `public/manifest.webmanifest` — Present on live site but minimal (single 32×32 icon; needs 192×192 and 512×512)
- `public/robots.txt` — Present and correct
- `public/llms.txt` and `public/llms-full.txt` — Present
- `public/data-dictionary.json` — Present but chapter numbering mismatched (sequential `chapter1`–`chapter22` does not map to 34-chapter structure)
- `public/data-dictionary.md` — MISSING (only .json version exists)

**Known functional gaps (from live site audit):**
- Explore page (`/explore/`) is interactive search only — does NOT list the 34 chapters as a directory
- Explore page content entirely JS-dependent; server HTML contains only loading placeholders
- `/chapters/deep-dive-overview/` is an orphaned route (in sitemap/llms.txt, not linked from navigation)
- About page sidebar "Limitations" link points to nonexistent section on About page
- Footer missing FAQ link (→ /about/#faq) despite spec
- JSON-LD `hasPart` descriptions on homepage/explore/about/methodology are not synchronized with corrected chapter content

---

## FOUR VERIFICATION TRACKS

**Track A — Data-Driven Claims** (verified against repo data files): Numbers, percentages, rankings, trends derived from PatentsView data. Verified by data lineage tracing and independent computation scripts.

**Track B — External Factual Claims** (verified via web search): Patent law, court decisions, academic citations, institutional facts, definitions, global statistics, technology milestones, methodology attributions, author affiliation.

**Track C — Methodology & Derived Metrics** (verified against code AND literature): How metrics are computed, what algorithms produce results, whether implementations match cited/standard academic definitions.

**Track D — Narrative Coherence** (new in v7): Chapter-level narrative flow, figure ordering/sequencing, cross-act coherence, cross-reference accuracy, redundancy detection, controversial statement identification.

---

## MANDATORY PROCESSING ORDER

You MUST audit in this EXACT order. After each group, save a checkpoint file. Do not skip ahead.

```
GROUP 0: Baseline validation (Phase 0) → checkpoint: audit/v7-checkpoint-baseline.md
GROUP 1: Per-element verification, Act 1 chapters (Phase 1, 7 pages) → checkpoint: audit/v7-checkpoint-act1.md
GROUP 2: Per-element verification, Act 2 chapters (Phase 1, 5 pages) → checkpoint: audit/v7-checkpoint-act2.md
GROUP 3: Per-element verification, Act 3 chapters (Phase 1, 5 pages) → checkpoint: audit/v7-checkpoint-act3.md
GROUP 4: Per-element verification, Act 4 chapters (Phase 1, 2 pages) → checkpoint: audit/v7-checkpoint-act4.md
GROUP 5: Per-element verification, Act 5 chapters (Phase 1, 3 pages) → checkpoint: audit/v7-checkpoint-act5.md
GROUP 6: Per-element verification, Act 6 chapters (Phase 1, 12 pages) → checkpoint: audit/v7-checkpoint-act6.md
GROUP 7: Per-element verification, Homepage + support pages (Phase 1) → checkpoint: audit/v7-checkpoint-homepage-support.md
GROUP 8: Within-chapter coherence (Phase 2, all 34 chapters) → checkpoint: audit/v7-checkpoint-narrative.md
GROUP 9: Cross-chapter and cross-act coherence (Phase 3) → checkpoint: audit/v7-checkpoint-cross-chapter.md
GROUP 10: Site-wide infrastructure (Phase 4) → checkpoint: audit/v7-checkpoint-infrastructure.md
GROUP 11: Implement fixes (Phase 5) → checkpoint: audit/v7-checkpoint-fixes.md
GROUP 12: Verify all fixes (Phase 6) → checkpoint: audit/v7-checkpoint-verification.md
GROUP 13: Commit, push, deploy (Phase 7) → checkpoint: audit/v7-checkpoint-deploy.md
GROUP 14: Consolidated report (Phase 8) → audit/v7-audit-report.md
```

---

## PHASE 0: BASELINE VALIDATION

Verify the integrity of v6 artifacts and refresh all inventories before beginning the v7 audit.

### §0.1 — Verify v6 Artifact Integrity

Confirm that the following v6 deliverables exist in `audit/` and are non-empty:

| # | Artifact | Path | Check |
|---|----------|------|-------|
| 1 | Figure manifest | `audit/figure-manifest.csv` | Row count ≥ 458 |
| 2 | Page inventory | `audit/page-inventory.md` | Lists all 34 chapters + support pages |
| 3 | Data source registry | `audit/data-source-registry.md` | Covers data files |
| 4 | Derived metrics registry | `audit/derived-metrics-registry.md` | Lists all metrics |
| 5 | Technology domain definitions | `audit/technology-domain-definitions.md` | 12 domains |
| 6 | External claims registry | `audit/external-claims-registry.md` | Categorized claims |
| 7 | Homepage card crosscheck | `audit/homepage-card-crosscheck.md` | 34 cards |
| 8 | Superlative checks | `audit/superlative-checks.md` | All superlatives |
| 9 | Verification scripts | `audit/verification-scripts/` | Re-runnable scripts |
| 10 | Lighthouse results | `audit/lighthouse-summary.csv` | 38/38 pages at 100% accessibility |

If any artifact is missing or corrupted, regenerate it before proceeding.

### §0.2 — Refresh Page Inventory

Recount all page.tsx files:
```bash
find src/app -name 'page.tsx' | grep -v node_modules | sort
```

**Expected:** 40 page.tsx files total:
- 34 chapter pages + 1 deep-dive-overview = 35 under `src/app/chapters/`
- Homepage (src/app/page.tsx)
- Explore (src/app/explore/page.tsx)
- Methodology (src/app/methodology/page.tsx)
- About (src/app/about/page.tsx)
- Not-found or other error pages

Record any discrepancy.

### §0.3 — Refresh Visualization Count

```bash
grep -r '<ChartContainer' --include='*.tsx' src/ | grep -v node_modules | wc -l
```

**Expected:** 459 ChartContainer usages (458 chapter visualizations + 1 homepage hero chart). The hero stats constant says 458 — this refers to chapter visualizations only; the homepage chart is additional.

### §0.4 — Refresh Structural Element Counts

Run the following and record exact counts. Any discrepancy from the expected counts must be investigated.

| Element | Grep Pattern | Expected | Files |
|---------|-------------|----------|-------|
| ChartContainer | `<ChartContainer` | 459 | 36 |
| KeyFindings | `<KeyFindings` | 34 | 34 |
| KeyInsight | `<KeyInsight` | 264 | 35 |
| SectionDivider | `<SectionDivider` | 255 | 35 |
| DataNote | `<DataNote` | 42 | 35 |
| Executive Summary (h2) | `Executive Summary` | 34 | 34 |
| InsightRecap | `<InsightRecap` | 34 | 34 |
| CompetingExplanations | `<CompetingExplanations` | 6 | 5 |
| RankingTable | `<RankingTable` | 14 | 14 |
| StatCard | `<StatCard` | 39 | 22 |
| StatCallout | `<StatCallout` | 1 | 1 |
| CiteThisFigure | Built into ChartContainer | 459 (implicit) | — |
| Cross-chapter Links | `href="/chapters/` | 89 (chapter pages) / 117 (total) | 35 / 40 |

### §0.5 — Refresh Data File Inventory

```bash
find public/data -name '*.json' | wc -l
ls -d public/data/*/ | wc -l
```

**Expected:** 383 JSON files across 36 directories.

Print: `"PHASE 0 COMPLETE. Baseline validated. Proceeding to Phase 1."`

---

## PHASE 1: PER-ELEMENT VERIFICATION (Exhaustive — No Sampling)

Process ALL chapters in mandatory order (Acts 1→6, then homepage + support pages). For EACH chapter, perform ALL of the following sub-checks.

### §1.1 — Figure-Level Verification (459 ChartContainers)

For EVERY ChartContainer across ALL 36 files:

#### §1.1.1 — Title and Subtitle
- Title present and descriptive
- Subtitle present and adds context (not duplicating title)
- Title matches the content actually shown in the figure

#### §1.1.2 — Caption Accuracy
- Variables correct, time period correct, sample/scope correct
- Aggregation method stated where relevant
- No over-interpretation, no causal language
- Denominator specified (all patents vs. utility patents vs. subset)

#### §1.1.3 — Data Source Attribution
- Source explicitly stated (e.g., "Data: PatentsView (USPTO). Computations: PatentWorld.")
- Consistent attribution format across all 459 figures

#### §1.1.4 — Caption↔Title Consistency (NEW — Gap #5)
For EVERY figure: verify the caption accurately describes the same data as the title. Flag any instance where the caption references different variables, time periods, or entity scopes than the title.

Format: `[chapter-slug] Figure [N]: title="..." caption="..." → CONSISTENT / MISMATCH: [details]`

#### §1.1.5 — Figure ID Uniqueness
Every `id` prop on ChartContainer must be unique within the page AND globally unique across the site (for anchor links and CiteThisFigure URLs).

#### §1.1.6 — CiteThisFigure URL Anchor Verification (NEW — Gap #13)
CiteThisFigure is embedded in every ChartContainer. For EVERY figure:
- Verify the generated citation string includes: author, figure title, site name, year, persistent URL
- Verify the URL anchor (`#figure-id`) resolves to the correct element on the page
- Verify the citation format is consistent across all 459 figures
- Verify the widget is interactive (click/tap expands copyable citation), not a static label

Spot-check at least 5 figures per act by inspecting the ChartContainer source code to confirm the `id` prop matches what CiteThisFigure generates.

#### §1.1.7 — Axis Labels
- Full variable names and units on both axes
- No overlap/clipping at 375px, 768px, 1280px
- Sensible tick intervals
- Zero baseline or explicitly disclosed non-zero baseline

#### §1.1.8 — Data Source File Linkage
Cross-reference against `audit/figure-manifest.csv`: each figure's `source_data_file` exists, checksum matches, time window is correct, partial_year_flag is set for 2025 data.

#### §1.1.9 — Tooltip Content Verification (NEW — Gap #10)
For figures with interactive tooltips:
- Tooltip values match the underlying data
- Tooltip format is consistent (number formatting, units, labels)
- Tooltip does not display raw data keys (e.g., `grant_count` instead of "Grant Count")
- Tooltip works on hover (desktop) and tap (mobile)

Verify by reading chart component code. For each chart type (line, bar, area, scatter, map), verify the tooltip configuration renders human-readable labels and correctly formatted values.

#### §1.1.10 — Dark Mode Visual Audit (NEW — Gap #11)
For EVERY chart type used on the site:
- Verify chart backgrounds, gridlines, axis labels, and data colors have dark mode variants
- Verify sufficient contrast in dark mode (text on background ≥ 4.5:1)
- Check for hardcoded colors that do not respond to theme changes
- Flag any chart that uses CSS colors without dark mode equivalents

Inspect the chart component code, Tailwind config, and CSS variables for dark mode support. If dark mode is not implemented, document this as a gap.

#### §1.1.11 — Loading and Error State Verification (NEW — Gap #12)

**IMPORTANT — Duplicate fallback text (reinforced from external review):** External review confirms that repeated "This visualization requires JavaScript…" blocks with duplicated caption text appear on multiple chapter pages, not only the homepage. Each figure must have exactly ONE fallback block containing: (a) a single accessible text description, and (b) a single "requires JavaScript" notice. The caption text must NOT be repeated between the fallback block and the rendered figure. Run a sitewide grep for "requires JavaScript" and count occurrences per page; any page with more fallback blocks than figures has duplication.

For the ChartContainer component:
- Verify a loading state is rendered while data is being fetched (skeleton, spinner, or "Loading visualization..." text)
- Verify an error state is rendered if data fails to load (not a blank space or crash)
- Verify noscript fallback text is present for every chart
- Check for duplicate loading/fallback text (known v6 issue: homepage had two noscript texts)

Inspect `src/components/charts/ChartContainer.tsx` and all chart wrapper components.

#### §1.1.12 — Debug Metadata String Detection (NEW — from external forensic review)
External review reports that raw metadata strings such as "Data PatentsView 2025-Q1 Window 5y Through 2020" appear inline near chart components on multiple pages (examples cited: Patent Quality, Org Patent Count). These appear to be debug or provenance tokens not formatted for end-user display. This finding requires JS-enabled verification (the strings may only appear in rendered chart output, not in static HTML). If confirmed:
- Convert all such strings to a standardized "Data provenance" format via a shared provenance component
- Standardized format: dataset name, snapshot date, extraction date, citation-window end, methodology rationale
- Apply via a shared component to ensure sitewide consistency (see Constraint 37)
- If JS-enabled rendering is unavailable, mark each affected figure as `"I cannot confirm"` and document the reason

### §1.2 — KeyFindings↔Chapter Content Consistency (NEW — Gap #6)

For EACH of the 34 KeyFindings components:
- Extract every factual claim (number, percentage, ranking, trend) from the KeyFindings text
- Trace each claim to its source: a specific ChartContainer, data file, or computation on the same page
- Flag any KeyFindings claim that is NOT substantiated by data displayed elsewhere on the chapter page
- Flag any KeyFindings claim that contradicts a figure's displayed data

Format: `[chapter-slug] KeyFindings claim: "..." → Source: [figure-id / data-file] → VERIFIED / UNSUPPORTED / CONTRADICTED`

### §1.3 — KeyInsight↔Adjacent Figure Consistency (NEW — Gap #7)

For EACH of the 264 KeyInsight components:
- Identify which figure(s) the KeyInsight is adjacent to (the immediately preceding or following ChartContainer)
- Verify the KeyInsight's text logically relates to that figure's data
- Flag any KeyInsight that references data from a different figure, a different chapter, or data not shown anywhere on the page

Format: `[chapter-slug] KeyInsight near [figure-id]: "..." → Relevant: YES / NO: [explanation]`

### §1.4 — SectionDivider Label↔Content Consistency (NEW — Gap #9)

For EACH of the 255 SectionDivider components:
- Extract the label/title text
- Read the content of the section that follows (until the next SectionDivider or end of page)
- Verify the label accurately describes the following content
- Flag any SectionDivider whose label is misleading, too vague, or does not match what follows

Format: `[chapter-slug] SectionDivider: "..." → Following content topic: [description] → MATCH / MISMATCH`

### §1.5 — Executive Summary↔Chapter Body Consistency (NEW — Gap #8)

For EACH of the 34 Executive Summary sections:
- Extract every factual claim from the executive summary text
- Verify each claim appears in or is derivable from the chapter body (figures, captions, narrative text)
- Flag any executive summary claim not supported by the chapter body
- Flag any executive summary claim that contradicts the chapter body

Format: `[chapter-slug] ExecSummary claim: "..." → Supported by: [section/figure] → VERIFIED / UNSUPPORTED / CONTRADICTED`

### §1.6 — InsightRecap Verification (34 components)

For EACH InsightRecap:
- Verify all "learned" items are factual and match chapter content
- Verify all statements are falsifiable (not vague platitudes)
- Verify "next chapter" links point to the correct slug and the correct chapter title
- Verify the transition text logically connects to the next chapter's topic

### §1.7 — DataNote Completeness Audit (NEW — Gap #17)

For EACH of the 42 DataNote components:
- Verify the note is factually accurate
- Verify the note is placed near the relevant data/figure

**Gap analysis:** Identify chapters that SHOULD have DataNotes but don't. A DataNote is warranted when:
- Sample size is small (< 100 observations for a displayed statistic)
- Data is right-censored (forward citations for recent patents)
- A methodology caveat applies (gender inference, topic modeling, disambiguation)
- Partial-year 2025 data is used
- A known confound affects interpretation

List every missing DataNote with recommended text. Format: `[chapter-slug] MISSING DataNote near [figure-id]: Reason: [explanation] → Suggested text: "..."`

### §1.8 — StatCard/StatCallout/StatGrid Verification (39 + 1)

For EVERY StatCard and StatCallout:
- Verify the displayed value matches the source data file
- Verify the label accurately describes the value
- Verify units and formatting are correct
- Cross-reference against any mention of the same statistic elsewhere on the site

### §1.9 — CompetingExplanations Verification (6 instances)

For EACH CompetingExplanations component:
- Verify each explanation is substantiated (cites data, literature, or mechanism)
- Verify no explanation is presented as the "correct" answer unless evidence warrants it
- Verify the framing is balanced and does not favor one explanation without justification

### §1.10 — RankingTable Verification (14 instances)

For EACH RankingTable:
- Verify every cell value against source data
- Verify row ordering (independently sort and compare)
- Verify entity names are consistent with the assignee name mapping
- Verify ties are handled correctly
- Verify column headers are accurate

### §1.11 — Track A: Data Accuracy Checks (retained from v6)

Perform ALL of the following for EVERY chapter page, in mandatory order.

#### §1.11.1 — Number-by-Number Verification
Every specific number on the page: quote exact text, classify (Track A/B/C), trace data source, independently compute, record result. Save scripts to `audit/verification-scripts/`.

#### §1.11.2 — Homepage Hero Statistics
Verify independently:
- **"9.36M Patents (all types)"**: compute exact total from data. Verify it rounds to 9.36M. "All types" = utility + design + plant + reissue.
- **"50 Years"**: 1976–2025 spans 50 year labels. But "(2025 data through September)" means 2025 is partial. Is "50 Years" counting year labels (correct) or completed calendar years (would be 49.75)? Verify the convention is reasonable and consistent with "from 1976 to 2025."
- **"34 Chapters"**: count chapter page files = 34.
- **"458 Visualizations"**: count ALL ChartContainer components across chapter pages (not including the homepage chart). Verify = 458.

#### §1.11.3 — Homepage Hero Text Verification
The hero states: *"Annual grants increased more than five-fold over this period, from approximately 70,000 in 1976 to 374,000 in 2024, as computing and electronics (Cooperative Patent Classification sections G and H) rose from 27% to 57% of all grants."*

Verify each claim:
- "more than five-fold": 374,000 / 70,000 = 5.34×. "More than five-fold" is accurate. ✓
- "approximately 70,000 in 1976": verify exact 1976 total from data (all types).
- "374,000 in 2024": verify exact 2024 total from data (all types). Note "approximately" applies only to 1976, not 2024.
- "CPC sections G and H rose from 27% to 57%": verify G+H combined share in earliest and latest full year.

#### §1.11.4 — Homepage Chapter Card Summaries (34 CARDS — CHECK EVERY ONE)
For EVERY chapter card on the homepage, extract EVERY number and cross-reference against the chapter page's actual data. Save to `audit/v7-homepage-card-crosscheck.md`.

**Known items requiring special attention** (from v6 — re-verify all):

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
24. Ag Tech: "7.4 to 32.9," "more than quadrupled" (32.9/7.4=4.45×), "46.7% in 2014 to 32.8% by 2025"
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

#### §1.11.5 — Growth Multiple Verification
For every stated fold-increase, independently compute:
- "more than five-fold" (374,000/70,000 = 5.34×)
- "5.7-fold" (29,624/5,201 = 5.70×)
- "3.4-fold" (77.5/22.5 = 3.44×)
- "more than quadrupled" (32.9/7.4 = 4.45×)
- "1.8-fold" (28.6/15.9 = 1.80×; also 122/68 = 1.79×)
- "1.4-fold" (105.8/? over 1970s — what is the 1970s value? Not stated on card)
- "nearly tripled" (0.94/0.32 = 2.94× — is this "tripled"?)
- Any other fold-change claims on chapter pages

#### §1.11.6 — Percentage and Share Verification
For every percentage: verify numerator, denominator, arithmetic (±0.1 pp). For grouped shares: sum check (100% ±0.1% if exhaustive).

#### §1.11.7 — Ranking and Ordering Verification
For every "Top N" or ordered display: independently sort, verify order, verify entities, check ties.

#### §1.11.8 — Superlative Verification (EXHAUSTIVE — against FULL comparison set)
Known superlatives requiring verification against ALL entities/domains:

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

Save to `audit/v7-superlative-checks.md` with script outputs.

#### §1.11.9 — Partial-Year 2025 Disclosure Consistency
The footer states "Coverage: 1976–Sep 2025." ALL references to 2025 data — on cards, chapter pages, and everywhere else — must include "(through September)" or an equivalent partial-year note. Enforce uniformly.

Known cards WITH disclosure: Gender, Quantum Computing, Geographic Mechanics, hero text.
Known cards where disclosure was added in v6: Team Size, Biotechnology, Cybersecurity, Agricultural Technology, Digital Health, Autonomous Vehicles.

Re-verify ALL 2025 references are uniformly disclosed.

#### §1.11.10 — "By 2025" vs. "In 2025" Precision
"By 2025" could mean "as of the latest data in 2025" or "by the end of 2025." "In 2025" means in the 2025 observation period. Verify which is intended and enforce consistent usage.

#### §1.11.11 — Time Series and Trend Verification
For every trend: verify start/end values, direction, data gaps, time window, growth rate/CAGR calculations, truncation bias.

#### §1.11.12 — Figure-to-Data Alignment
For every chart: trace code → data → raw file. Verify chart type, axis ranges (zero baseline, clipping, tick intervals), legend, tooltips.

#### §1.11.13 — Table-to-Data Alignment
For every table: verify every cell, headers, row ordering, totals/subtotals.

#### §1.11.14 — Caption Accuracy
For every caption: variables correct, time period correct, sample/scope correct, aggregation correct, no over-interpretation, no causal language.

**Known copy-editing errors (from v6 — re-verify fixes):**
- Patent Quality chapter: "Competing explanations: Why are forward citations rising?Why do means…" — missing whitespace between sentences.
- Patent Count chapter: "Cite this figure" labels merging into narrative prose.
- Domestic Geography chapter: grammatical error in summary sentence.
- Check ALL chapters for duplicate caption blocks around loading fallbacks.

#### §1.11.15 — Narrative and Takeaway Verification
Every factual claim supported by displayed data. Flag unsupported/contradicted/overstated/underspecified claims.

#### §1.11.16 — Assignee Name Consistency
Same entity = same display name everywhere. Check mapping file. Flag "Samsung Electronics" vs. "Samsung," "IBM" vs. "International Business Machines," etc.

#### §1.11.17 — Cross-Page Consistency
Same statistic on multiple pages = identical values. Same terminology throughout. Code matches methodology descriptions.

Known cross-page items: IBM 161,888 (Org Count card + Company Profiles), Amazon 6.7% (Org Quality card), Japan 1.45 million (Composition card + International Geography card), 632/1,236 (Inventor Mechanics), gender citation averages (Gender card).

**CRITICAL — "Modified Gini" on Org Patent Count chapter (reinforced from external reviews):**
As of the live site audit (Feb 2026), the section reads "modified Gini coefficients" with explanatory text: "positive values indicate large patent holders capture disproportionate share; negative values indicate reverse." The value −0.069 is retained. However: (a) the mathematical definition of this "modified Gini" is never specified on the site or Methodology page; (b) it does not appear in data-dictionary.json; (c) readers familiar with the standard Gini coefficient (bounded [0, 1]) will find the term misleading.

The audit MUST either: (i) provide the explicit formula in the Methodology page and data dictionary — including a worked validation example demonstrating the formula produces −0.069 with a specific input dataset, and a formal proof or explanation of why the metric's range extends below zero; (ii) rename the metric to avoid "Gini" (e.g., "net concentration index," "concentration balance score," "Lorenz deviation index"); or (iii) verify the computation and relabel if the metric actually measures a delta or directional change. **This is the highest-priority definitional gap on the site.**

**CRITICAL (NEW — from external forensic review) — Domestic Geography KPI definition mismatch:**
The KPI card under "Patent Grants Concentration Among States" displays labels "Top 1 State Share" and "Top 5 States Share," but the description text reads "top 1% and top 5% of states." These are mathematically different: "top 5% of states" implies ~2.5 states out of 50, whereas "Top 5 States" is a fixed count of five. The audit MUST: (a) determine which definition the code actually computes (fixed count or percentile), (b) correct the description text to match KPI labels exactly, removing "%" symbols, and (c) verify KPI values are consistent with the corrected definition. (See Constraint 36.)

**Known definition inconsistency — Blockbuster cohort (re-verify fix):**
Filing-year vs. grant-year cohorting. Re-verify consistency across Methodology page and all chapter pages.

**Known denominator mismatch — Patent Fields (NOW CROSS-PAGE — homepage card + JSON-LD):**
The chapter Key Finding uses "utility patent grants" (corrected on chapter page). However, the homepage card reads "rising from 27% to 57% of all grants" and the JSON-LD `hasPart` description across ALL pages also uses "all grants." The audit MUST: (a) determine which denominator the code uses, (b) standardize across chapter, homepage card, JSON-LD, and figure captions.

**Known cross-page language inconsistency — International Geography (quality-quantity tradeoff):**
Chapter page appropriately softened to: "a pattern that may reflect differences in patent drafting conventions, technology field composition, or examination practices." However, homepage card retains "suggesting a quality-quantity tradeoff" and JSON-LD `hasPart` retains old framing. The audit MUST propagate the chapter page's neutral language to homepage card and JSON-LD.

**Known decade-definition ambiguity — International Geography (re-verify fix):**
"during the 2020s" → "2020–2024 (five-year total)." JSON-LD also lacks this clarification.

**Known corpus-size inconsistency — Language chapter (re-verify fix):**
"8.4M abstracts" vs. "8.45 million."

**RESOLVED — Assignee Composition causation question (verified Feb 2026):**
~~"Why can't we infer causation…" without answer block.~~ Substantive explanation now present. "De facto global standard" and "major venue" language confirmed removed. ✓

**RESOLVED — Mech-Geography "policy tensions" (verified Feb 2026):**
~~"policy tensions … after 2018"~~ → now reads "growth rates moderated in certain technology areas after 2018." WTO reference retained factually. ✓

**NEW — Residual causal language on Patent Law chapter (from live audit):**
"The Bayh-Dole Act (1980) transformed university patenting, enabling academic institutions to retain patent rights" and "spurring academic patenting." Replace with associative language.

**NEW — Residual interpretive language on Org Patent Count chapter (from live audit):**
"Samsung first surpassed IBM… a shift that reflects the globalization of technology leadership" and "revealing how consumer electronics… leverage ornamental innovation." Replace "reflects" and "revealing how" with "coincided with" or "consistent with."

**NEW — Typography inconsistencies: hyphens, en-dashes, em-dashes (from live audit):**
- Convergence homepage card and JSON-LD: "between 1976-1995 and 2011-2025" uses U+002D (hyphen) instead of U+2013 (en-dash)
- Domestic Geography homepage card and JSON-LD: "992,708 patents -- more than" uses double hyphen instead of U+2014 (em-dash)
Run a sitewide typography sweep (see §2.4.9) and correct all instances. (See Constraint 34.)

**Known attribution inconsistency (re-verify fix):**
"Source: PatentWorld" vs. "PatentsView/USPTO." Standardize to: "Data: PatentsView (USPTO). Computations: PatentWorld."

#### §1.11.18 — Deep Dive Cross-Domain Framework Consistency
ALL 12 Deep Dive chapters must use: identical metric definitions (top-4 concentration, entry velocity, subfield diversity, patent velocity multiplier), same code path or equivalent computation, same cohort year boundaries.

Write ONE comprehensive script computing key metrics for all 12 domains. Save to `audit/verification-scripts/cross-domain-comparison.py`.

**CRITICAL — The Concentration Level vs. Concentration Trend Paradox (v6 — re-verify):**
Verify that text on each Deep Dive page — and homepage card — clearly distinguishes between "highest concentration level" and "rising concentration trend."

#### §1.11.19 — Censoring, Truncation, Missing Data Disclosure
Right-censoring (citations), left-truncation, entity exclusions, undisclosed filtering, PatentsView disambiguation caveats.

#### §1.11.20 — Raw Statistic Confounder Disclosure
Flag any comparative statistic presented as a raw average without controlling for confounders:

**Known instance (v6 — re-verify fix):** Gender chapter card: "All-male teams average 14.2 forward citations, mixed-gender teams 12.6, and all-female teams 9.5." Must disclose unconditional nature.

Flag ALL cross-group comparisons (by geography, firm type, inventor type, gender) for the same issue.

#### §1.11.21 — JSON-LD Structured Data Synchronization Check (NEW — from live audit)

After ALL chapter content edits are complete, run a systematic synchronization check between chapter page content and the JSON-LD `hasPart` descriptions embedded in every page. The JSON-LD array contains 34 ScholarlyArticle entries; each entry's `description` field must match the corresponding chapter's Key Findings.

**Process:**
1. Extract the full JSON-LD `hasPart` array from the homepage source (generated from `CHAPTERS` descriptions in `src/lib/constants.ts`)
2. For each of 34 entries, compare the `description` field against the chapter page's Key Findings text
3. Flag any discrepancy: different denominators, missing confounder disclosures, missing parenthetical clarifications, residual causal language softened on the chapter page, typography inconsistencies (hyphens vs. en-dashes)
4. Propagate ALL corrections to the JSON-LD source. Because the same `hasPart` array appears on the homepage, explore, about, and methodology pages, ensure the correction propagates to all instances (ideally from a single shared data source — `constants.ts`)

**Known discrepancies (from live site audit):**
- Patent Fields: "all grants" → must match chapter's "utility patents" denominator
- International Geography: "quality-quantity tradeoff" → must match chapter's neutral multi-explanation language
- International Geography: missing "(summed across 2020–2024)" decade clarification
- Gender: citation averages stated without confounder disclosure → must add "These are unconditional averages…" caveat
- Convergence: U+002D hyphen in date ranges → must use U+2013 en-dash
- Domestic Geography: double hyphen "--" → must use U+2014 em-dash

Save discrepancy list to `audit/v7-json-ld-sync-check.md`. (See Constraint 33.)

#### §1.11.22 — Chart Data Extraction and Independent Recomputation (NEW — from forensic review)

When the audit environment supports JS-enabled rendering (see §6.14), extract the underlying data payloads for every rendered chart:

1. **Data capture:** For each visualization, identify the JSON endpoint or embedded data object used to render it (from HAR network logs or inline `<script>` data). Save each payload to `audit/chart-data/[page-slug]--[figure-id].json`.

2. **Independent recomputation:** For every number stated in figure titles, captions, KPI cards, section summaries, Key Findings, chapter recaps, and "Cite this figure" text, independently recompute the value from the extracted data payload. Perform: (a) shares sum to 100% within stated tolerance, (b) totals equal sum of components, (c) averages/medians match recomputation, (d) axis ranges include all data points, (e) denominators consistent between figure data and prose claims.

3. **Discrepancy logging:** Log mismatches with exact expected value, actual recomputed value, and difference. Save to `audit/v7-recomputation-discrepancies.md`.

4. **Scope limitation:** If data extraction is blocked (e.g., data embedded in compiled bundles rather than discrete endpoints), write `"I cannot confirm"` for each affected figure and fall back to source-code-level data lineage tracing (§1.11.12).

#### §1.11.23 — Sitewide Number Registry (NEW — from forensic review)

Build a structured registry (`audit/number-registry.json`) cataloguing every headline number, defined term, and denominator choice across all pages. The registry must include: exact value as displayed, page URL, DOM location (section heading + element type), denominator/basis (e.g., "utility patents," "all types," "assignee-country basis"), and data source file.

After compilation, run an automated conflict-detection pass: flag any value that appears on multiple pages with different magnitudes, rounding, or denominators.

**Known candidates for conflict:** "9.36M" (hero vs. chapter references), "374,000" (hero vs. Patent Count card), "1976–Sep 2025" (footer vs. chapter text), "57%" vs. "57.3%" (Patent Fields), "1.45 million" (Org Composition vs. International Geography).

Save to `audit/number-registry.json` and `audit/v7-number-conflicts.md`. (See Constraint 35.)

### §1.12 — Track B: External Factual Claims (WEB SEARCH)

#### §1.12.1 — Extract All External Claims
Save to `audit/v7-external-claims-registry.md`. Categories: `LAW`, `CASE`, `POLICY`, `HISTORY`, `DEFINITION`, `CITATION`, `INSTITUTION`, `COMPARATIVE`, `METHODOLOGY`, `TECHNOLOGY_CONTEXT`, `AFFILIATION`.

#### §1.12.2 — Patent Law and Policy
**Pre-verified claims (confirmed correct in v6):**
- Alice Corp. v. CLS Bank International decided June 19, 2014 — CORRECT ✓
- AIA signed September 16, 2011; "most significant reform since 1952" — CORRECT ✓
- Bayh-Dole Act (Pub. L. 96-517, December 12, 1980) — CORRECT ✓

**VERIFIED CORRECTIONS on live site (Feb 2026) — all 5 critical date errors corrected:**

| Event | Was | Now | Source | Status |
|-------|-----|-----|--------|--------|
| eBay v. MercExchange | 2007 | 2006 | 547 U.S. 388 (2006) | ✓ VERIFIED |
| KSR v. Teleflex | 2010 | 2007 | 550 U.S. 398 (2007) | ✓ VERIFIED |
| Bilski v. Kappos | 2011 | 2010 | 561 U.S. 593 (2010) | ✓ VERIFIED |
| Stevenson-Wydler Act | 1982 | 1980 | Pub. L. 96-480 | ✓ VERIFIED |
| Federal Circuit Created | 1984 | 1982 | Pub. L. 97-164 | ✓ VERIFIED |

Verify remaining 16 of 21 events using the authoritative-source methodology.

**Editorial note (downgraded from critical in forensic review):** The Bayh-Dole Act entry appears under a "1980" header but lacks an explicit inline year/date. While the year is correct via the header, adding an explicit inline date (e.g., "1980 (Dec 12)") would reduce ambiguity. This is an enhancement for citation clarity, not a factual correction.

#### §1.12.3 — Court Decisions: verify case names, years, courts, holdings, citation format.

#### §1.12.4 — Academic Citations: verify authors, titles, years, journals, DOIs, characterization of findings.

#### §1.12.5 — Definitions: verify against MPEP, 35 U.S.C., WIPO Glossary, original papers.

#### §1.12.6 — Comparative Claims: verify external benchmarks.

#### §1.12.7 — Technology Context Claims
Known claims to verify:
- "the expiration of key FDM patents in 2009 opened the field to broad-based competition" (3D Printing): verify specific FDM patent expiry dates; flag "opened the field" as causal
- "CRISPR-Cas9" (Biotech): verify technology timeline
- Other technology milestones on Deep Dive pages

#### §1.12.8 — Author Affiliation
"Saerom (Ronnie) Lee, The Wharton School, University of Pennsylvania" — verify current affiliation.

#### §1.12.9 — Data Provenance
Footer states "Data from PatentsView (USPTO), accessed Feb 2026. Coverage: 1976–Sep 2025."
- Verify `DATA_ACCESS_DATE` in `src/lib/constants.ts` is the single source of truth
- Verify ALL pages render the same provenance string from this constant
- Re-verify the v6 fix for "accessed Jan 2025" → "accessed February 2026" inconsistency

#### §1.12.10 — Copyright and License
"© 2026 Saerom (Ronnie) Lee. Content licensed under CC BY 4.0."
- Is the copyright year hardcoded or dynamic?
- Is CC BY 4.0 appropriate given PatentsView's own CC BY 4.0 license?

#### §1.12.11 — Compile Track B Report
Save to `audit/v7-external-claims-verification.md`.

### §1.13 — Track C: Methodology and Derived Metrics

#### §1.13.1 — Derived Metric Formula Audit (code vs. literature)
For every metric: compare code to canonical definition. Check:
- HHI: fraction vs. percentage; denominator convention
- Originality/generality: which classification (NBER, CPC sections, CPC subclasses)?
- Shannon entropy: log base (e, 2, 10); normalization (yes/no); scale consistency
- Citation half-life: patent-level or cohort-level
- Blockbuster rate: percentile threshold; within year/field/overall
- Exploration score: "new" relative to what baseline
- Entry velocity multiplier: ratio of which cohort means? Denominator = total years active?
- Subfield diversity: normalized entropy (0–1)? If so, normalized by log(N_subclasses)?

**CRITICAL — Entropy scale consistency check:**
- Portfolio diversity: Shannon entropy of 7.1 (raw, ln-based or log2-based)
- Subfield diversity: 0.97 (normalized entropy, 0–1 scale)
- Topic novelty: 1.97 to 2.10 (yet another scale)

For EACH entropy metric, determine: log base, normalization method, what it measures, and verify the label is unambiguous.

#### §1.13.2 — Gender Inference Methodology Audit
Method used, disclosure, error rates, ethnic/geographic bias, confidence threshold, unclassifiable names, whether comparisons control for confounders.

#### §1.13.3 — NLP/Topic Modeling Audit
Algorithm, corpus, topic count selection, labels, "novelty (median entropy)" definition, disclosure.

#### §1.13.4 — Network/Clustering Audit
Algorithm, k selection, similarity metric, tie definition, counts (50 companies → 248 observations, 8 clusters, 632 inventors, 1,236 ties), disclosure.

#### §1.13.5 — Technology Pivot Detection Audit
Definition, algorithm, count (51 pivots, 20 companies), softened claim ("which can precede strategic shifts that later become publicly visible" — verify this is presented as possibility, not prediction). Disclosure.

#### §1.13.6 — Inventor Mobility Definition Audit
"143,524 inventor movements (consecutive patents at different assignees within 5 years)" — verify definition matches code. What counts as "different assignee"? How is the 5-year window applied?

#### §1.13.7 — Compile Track C Report
Save to `audit/v7-methodology-verification.md`.

Print: `"PHASE 1 COMPLETE. [counts]. Proceeding to Phase 2."`

---

## PHASE 2: WITHIN-CHAPTER COHERENCE (Track D — New in v7)

### §2.1 — Narrative Flow Audit (NEW — Gap #1)

For EACH of the 34 chapters, evaluate the narrative arc:

**For each chapter, answer ALL of the following:**

1. **Introduction→Data→Analysis→Conclusion arc:** Does the chapter follow a logical progression from introducing the topic, presenting data, analyzing patterns, to drawing conclusions? Or does it jump between topics without structure?

2. **Narrative↔Figure integration:** Is every figure referenced in the surrounding narrative text? Flag any "orphan figures" — ChartContainers that appear without any narrative context (no preceding or following text explains what the figure shows or why it matters).

3. **Logical progression:** Do ideas build on each other? Or does the chapter introduce concept A, switch to concept B, then return to concept A without transition?

4. **Tense and voice consistency:** Is the chapter written in consistent tense (present for describing data, past for historical events)? Is the voice consistent (active vs. passive)?

5. **Section balance:** Are some sections disproportionately long or short relative to their importance?

Save per-chapter narrative flow assessments to `audit/v7-narrative-flow.md` with format:
```
## [chapter-slug] — [title]
Arc quality: STRONG / ADEQUATE / WEAK
Orphan figures: [count] — [list figure IDs]
Logical gaps: [description]
Tense issues: [description]
Balance issues: [description]
Recommendations: [list]
```

### §2.2 — Figure Ordering and Sequencing Audit (NEW — Gap #2)

For EACH of the 34 chapters:

1. **Logical progression:** Do figures proceed from general to specific, or from macro-level overview to micro-level detail? Flag any figure that is out of logical order.

2. **Scale/scope progression:** Do figures build in scope (e.g., totals → breakdowns → subgroups → time series)? Flag inversions.

3. **Duplicate/redundant figures:** Are any two figures on the same page showing essentially the same data with minor variation? Flag with severity: DUPLICATE (remove one), NEAR-DUPLICATE (merge or differentiate), or JUSTIFIED (different perspective warranted).

4. **Missing figures:** Based on the narrative text, are there claims that would benefit from a supporting visualization that doesn't exist?

Save to `audit/v7-figure-ordering.md` with format:
```
## [chapter-slug] — [title]
Figure count: [N]
Ordering: LOGICAL / NEEDS REORDER: [details]
Duplicates: NONE / [list with severity]
Missing figures: NONE / [list with justification]
Reorder recommendation: [proposed order, if different]
```

### §2.3 — Controversial Statement Scan (NEW — Gap #4)

Scan ALL 41 files (34 chapter pages + homepage + explore + methodology + about + deep-dive-overview + layout files) for statements belonging to these 8 sensitivity categories:

| Code | Category | Examples |
|------|----------|----------|
| D1 | Gender/demographic | Raw citation comparisons by gender without confounder disclosure |
| D2 | Geopolitical | US-China framing, "quality-quantity tradeoff" for non-US patents |
| D3 | Normative | "De facto global standard," "game-changer," loaded adjectives |
| D4 | Causal overreach | "Led to," "caused," "opened the field to," "driven by" |
| D5 | Concentration/monopoly | Rankings presented without noting patent strategy varies |
| D6 | Public policy | Government funding framing, Bayh-Dole controversy |
| D7 | Interpretive leap | "Suggesting a quality-quantity tradeoff" without qualification |
| D8 | Measurement limitation | Gender inference binary, topic model choices, disambiguation errors |

For EACH flagged statement, record:
```
[chapter-slug] [D-code] Line [N]: "exact quote"
Assessment: [explanation of concern]
Recommendation: [keep / soften / rewrite / add caveat]
```

Cross-reference against v6 findings in `audit/sensitivity-screening.md` and `audit/causal-language-audit-1.9.1.md`. Identify any statements that v6 missed.

**Six specific reframing recommendations (from external forensic review):**

These areas carry heightened controversy risk. For each, a safer framing is provided. These are not "wrong" by default — they are topics where especially careful, descriptive language is essential to prevent misinterpretation.

**(1) Country comparisons / "quality" framing (International Geography, D2):** Comparing countries' claims, originality, and citations, explicitly referencing China vs. the US. Safer framing: use "differences in observed patent-document characteristics" and always reiterate field mix, drafting conventions, truncation, and selection effects as confounders. Avoid the word "quality" in cross-country comparisons unless operationally defined and disclosed.

**(2) U.S.–China mobility and "deep integration" (Inventor Mechanics, D2):** "US-China mobility is nearly balanced" and "highlights the deep integration" carries normative weight in a geopolitically charged domain. Safer framing: separate descriptive counts from interpretation; label "integration" as an interpretation and list alternative explanations (labor market dynamics, institutional partnerships, immigration policy). Consider replacing "deep integration" with "high bilateral mobility volumes."

**(3) Gender gap and cross-country name inference (Gender chapter, D1/D8):** Uses "gender innovation gap," reports team outcomes, lower accuracy for "non-Western naming traditions." Safer framing: retain strong limitations already present, but add an explicit "Measurement is name-based and binary-limited" callout at the TOP of the chapter AND in each figure caption, ensuring readers encounter the limitation before the data.

**(4) Regional "self-reinforcing" cluster claims (Domestic Geography, D4):** "Self-reinforcing nature of innovation clusters" and "difficult to replicate" implies a causal feedback mechanism the observational data cannot establish. Safer framing: "consistent with agglomeration mechanisms proposed in the literature (e.g., Marshall 1890; Krugman 1991)" and avoid inevitability language without citing specific counterfactual evidence.

**(5) Blockchain "hype cycle" labeling (Blockchain Deep Dive, D3):** Normative and potentially pejorative framing. Safer framing: "boom–bust pattern in patenting volumes" unless an explicit operational definition of "hype cycle" is provided (e.g., Gartner methodology with citation). If Gartner is cited, note it is a proprietary consulting framework, not a peer-reviewed construct.

**(6) Current policy/legislation references (Patent Law, D6):** "Proposed PREVAIL Act & PERA" carry contemporary political salience. Safer framing: present as "pending proposals as of [date]" with neutral description of provisions and explicit notation of legislative status (introduced, passed committee, enacted, etc.). Include date of last status check.

Save to `audit/v7-controversy-scan.md`.

### §2.4 — Language Precision Audit

#### §2.4.1 — Causal and Quasi-Causal Language (COMPREHENSIVE)
Flag ALL of the following unless methodology supports causal inference:

**Direct causal (always flag):** "caused," "led to," "resulted in," "due to," "because of," "driven by," "enabled," "contributed to," "fostered," "spurred," "fueled," "prompted," "triggered," "gave rise to," "brought about," "opened the field to"

**Quasi-causal (flag and evaluate):** "reflecting," "as" (causal sense), "with the emergence of," "in response to," "following," "in the wake of," "coinciding with" (if used to imply cause)

**Replace with:** "is associated with," "coincided with," "occurred alongside," "was accompanied by," "was followed by," "during the same period as"

**Known instances on homepage cards (v6 — re-verify):**
1. 3D Printing: "the expiration of key FDM patents in 2009 opened the field to broad-based competition"
2. Biotechnology: "reflecting successive waves from recombinant DNA to CRISPR-Cas9"
3. Cybersecurity: "reflecting broad-based entry across the field"
4. Quantum Computing: "reflecting high hardware IP barriers"
5. Space Technology: "reflecting the transition from government-dominated to commercial-driven innovation"

**Known causal overreach on Inventor Mechanics chapter page (v6 — re-verify):**
6. "Event-Study Evidence" section: "revealing how … affects citation impact" and "Moves to higher-quality firms produce larger post-move citation gains."

**RESOLVED — Normative language on Assignee Composition chapter (verified Feb 2026):**
7. ~~"US patent system has become the de facto global standard"~~ — confirmed removed. "Major venue" also absent. ✓

**NEW — Residual causal language on Patent Law chapter (from live audit):**
8. "The Bayh-Dole Act (1980) transformed university patenting" and "spurring academic patenting" — causal verbs on chapter page. Replace with: "was followed by growth in university patenting," "coincided with increased academic patenting."

**NEW — Interpretive language on Org Patent Count chapter (from live audit):**
9. "a shift that reflects the globalization of technology leadership" and "revealing how consumer electronics and consumer brands leverage ornamental innovation" — causal interpretation from descriptive data. Replace with: "coincided with," "a pattern observed alongside," "consistent with."

#### §2.4.2 — Superlative Language
Flag unqualified superlatives: "the most," "the best," "the largest," "unprecedented," "unique." Each must be verifiable against the full comparison set (see §1.11.8).

#### §2.4.3 — Growth Multiple Language
For every "X-fold" or "multiplied by X": verify arithmetic and verify the descriptor matches (e.g., "nearly quadrupled" for 4.45× is acceptable; "tripled" for 2.94× is not).

#### §2.4.4 — Percentage Confusion
Flag any instance where "percentage point" and "percent" might be confused. A rise "from 12% to 33%" is a 21 percentage point increase OR a 175% increase — verify which is used and whether it is unambiguous.

#### §2.4.5 — Informal Language
Disallowed: "a lot of," "pretty much," "kind of," "really big," "skyrocketed," "exploded," "game-changer," "interesting to note," "it is worth noting," "it turns out," "notable that," "remarkably," "importantly," "interestingly," "strikingly," "dramatically" (unless quantified), "significantly" (unless statistical significance tested)

#### §2.4.6 — Acronym Audit
EVERY page: verify EVERY acronym defined at first use ON THAT PAGE. CPC, USPTO, HHI, CAGR, NLP, AIA, PCT, FDM, CRISPR, ADAS, NIH, HHS, etc.

#### §2.4.7 — Terminology Consistency
Build table of concept → term mappings. Flag inconsistencies. Save to `audit/v7-terminology-consistency.md`.

Known terms: "patent grants" vs. "granted patents" vs. "issued patents"; "assignee" vs. "organization" vs. "firm" vs. "company"; "forward citations" vs. "citations received"; "CPC section" vs. "CPC class" vs. "technology field"

#### §2.4.8 — Date and Number Formatting
- Date ranges: en-dash (–) not hyphen (-). "1976–2025" not "1976-2025."
- Numbers: comma-formatted thousands (70,000 not 70000)
- Percentages: consistent decimal precision
- "in 2024" vs. "by 2024": use consistently (temporal meaning differs)

#### §2.4.9 — Sitewide Typography Sweep: Hyphens, En-Dashes, Em-Dashes, Minus Signs (NEW — from live audit)

Run a comprehensive sweep of ALL text content (chapter pages, homepage cards, JSON-LD descriptions, figure captions, Key Findings, `constants.ts` descriptions) for typography violations:

1. **Date ranges:** Must use en-dash (U+2013, –), not hyphen-minus (U+002D, -). Example: "1976–1995" not "1976-1995." Search pattern: four-digit year followed by U+002D followed by four-digit year.
2. **Parenthetical breaks:** Must use em-dash (U+2014, —), not double hyphen (--). Example: "992,708 patents — more than…" not "992,708 patents -- more than…"
3. **Minus signs in numerical context:** Negative numbers (e.g., "−0.069") should use the minus sign (U+2212, −), not hyphen-minus (U+002D). Verify in Gini coefficient displays and any other negative values.

Save to `audit/v7-typography-sweep.md`. Apply corrections to source files, then verify propagation to JSON-LD and homepage cards. (See Constraint 34.)

Print: `"PHASE 2 COMPLETE. [counts]. Proceeding to Phase 3."`

---

## PHASE 3: CROSS-CHAPTER AND CROSS-ACT COHERENCE (Track D — New in v7)

### §3.1 — Cross-Reference Accuracy Audit (NEW — Gap #14)

There are approximately 89 cross-chapter links in chapter pages (117 total across all files). For EVERY cross-chapter link:

1. **URL resolution:** Does the `href` resolve to an existing route? Extract slug from `/chapters/{slug}/` and verify it exists in `CHAPTERS` array in `src/lib/constants.ts`.

2. **Contextual accuracy:** Does the surrounding text accurately describe what the linked chapter contains? For example, if text says "as discussed in the Patent Quality chapter," verify that the linked chapter actually discusses the referenced topic.

3. **Bidirectional check (Constraint 30):** If Chapter A links to Chapter B, should Chapter B also link back to Chapter A? Flag one-directional references where bidirectional would be appropriate.

Save to `audit/v7-cross-reference-audit.md` with format:
```
[source-chapter] → [target-chapter] (line [N]): "[link text]"
URL: VALID / BROKEN
Context: ACCURATE / MISLEADING: [explanation]
Bidirectional: YES / NO — Should be bidirectional: YES / NO
```

### §3.2 — Cross-Act Narrative Coherence (NEW — Gap #3)

#### §3.2.1 — Act-Level Introduction Consistency (NEW — Gap #19)

The 6 Act groupings in `ACT_GROUPINGS` have titles and subtitles:

| Act | Title | Subtitle |
|-----|-------|----------|
| 1 | The System | How the patent landscape took shape |
| 2 | The Organizations | Firms and institutions driving innovation |
| 3 | The Inventors | Who invents and how they differ |
| 4 | The Geography | Where innovation happens |
| 5 | The Mechanics | How knowledge flows through organizations, inventors, and places |
| 6 | Deep Dives | Established and emerging technology domains |

For EACH act:
- Does the first chapter in the act introduce the act's theme?
- Does the last chapter in the act transition to the next act (via InsightRecap)?
- Is the act subtitle accurate given the actual chapter content?
- Do all chapters within the act share a coherent thematic focus?

#### §3.2.2 — Inter-Act Build

Verify the overall site narrative builds logically:
1. Act 1 (System) → establishes baseline of what exists
2. Act 2 (Organizations) → examines who creates within the system
3. Act 3 (Inventors) → examines individual creators
4. Act 4 (Geography) → examines where creation happens
5. Act 5 (Mechanics) → examines how knowledge flows between actors
6. Act 6 (Deep Dives) → applies framework to specific domains

Flag any chapter that seems misplaced (belongs in a different act) or any act transition that is jarring.

#### §3.2.3 — Deep Dive Framework Consistency
All 12 Deep Dive chapters must follow the same analytical framework:
- Same metric types (top-4 concentration, entry velocity, subfield diversity, patent velocity)
- Same time horizons (or justified differences)
- Same visualization types in the same order
- Same section structure

Flag any Deep Dive that deviates from the common framework without justification.

### §3.3 — Redundancy Detection (NEW — Gap #16)

Scan all 34 chapters for duplicate or near-duplicate content:

1. **Duplicate narratives:** Same paragraph or sentence appearing in multiple chapters (beyond intentional cross-references).

2. **Duplicate statistics:** Same number cited in multiple chapters — is it consistent? Is the repetition necessary?

3. **Duplicate figures:** Same data visualized in multiple chapters (beyond intentional comparisons).

For each redundancy found, classify as:
- INTENTIONAL (cross-reference, consistent repetition) — verify values match
- UNNECESSARY (remove from one location)
- INCONSISTENT (same stat, different values — critical error)

Save to `audit/v7-redundancy-detection.md`.

### §3.4 — Number Consistency Concordance Table

Build a concordance table of EVERY claim that appears in more than one location on the site. Verify all instances use identical values.

Format:
```
| Statistic | Location 1 | Value 1 | Location 2 | Value 2 | ... | Consistent? |
|-----------|-----------|---------|-----------|---------|-----|-------------|
| IBM cumulative grants | Homepage card | 161,888 | Org Count page | ? | Company Profiles | ? | YES/NO |
| Japan US patents | Composition card | 1.45M | Int'l Geography card | 1.45M | ... | YES/NO |
```

Include ALL statistics that appear on the homepage AND on at least one chapter page.

Save to `audit/v7-concordance-table.md`.

### §3.5 — Homepage Card→Chapter Transition Audit (NEW — Gap #18)

For EACH of the 34 homepage chapter cards:

1. **"See full analysis" link:** Does it point to the correct chapter URL?

2. **Card description accuracy:** Does the card description accurately preview the chapter's content? Or does it highlight statistics not prominently featured in the chapter?

3. **Expectations match:** If a reader clicks the card, will the chapter deliver on the card's implied promise? Flag any card that sets expectations the chapter doesn't fulfill.

4. **Number consistency:** Every number on the card must appear (and match) on the chapter page. (Cross-reference with §1.11.4.)

Save to `audit/v7-card-chapter-transitions.md`.

Print: `"PHASE 3 COMPLETE. [counts]. Proceeding to Phase 4."`

---

## PHASE 4: SITE-WIDE INFRASTRUCTURE

### §4.1 — Navigation Audit

#### §4.1.1 — Header Navigation
All nav links work: PatentWorld → /, Explore → /explore/, Methodology → /methodology/, About → /about/. Mobile hamburger menu works.

#### §4.1.2 — Footer
Current footer elements: Methodology, About, Explore, PatentsView attribution + access date + coverage, CC BY 4.0, © 2026.
Verify all links work. Check whether footer should also include: data dictionary link, sitemap link, contact, full citation format, PatentsView version number.

**Known issue — FAQ link missing from footer (from live audit):**
The live site footer displays only three navigation links: Methodology, About, Explore. The FAQ link (→ /about/#faq) specified in the original design is absent. The About page does contain an FAQ section with a working anchor. The audit MUST add the FAQ link to the footer navigation.

#### §4.1.3 — Breadcrumbs
Every chapter page: Home > Act N: [Title] > Chapter Title. Verify presence and accuracy for all 34 chapters.

#### §4.1.4 — Sidebar / Table of Contents
If chapters have a sidebar or in-page table of contents, verify all entries link to correct anchors. Verify TOC items match section headings.

#### §4.1.5 — Previous/Next Navigation
If chapters have prev/next links, verify:
- Chapter 1 has no "Previous" (or links to homepage)
- Chapter 34 has no "Next" (or links to a conclusion)
- All intermediate chapters link to correct neighbors in sequence

#### §4.1.6 — BackToTop
If a BackToTop button exists, verify it appears on long pages and scrolls to top.

#### §4.1.7 — Anchor Links
Verify these resolve to actual element IDs:
- `#chapters` (used by "Browse All Chapters" button)
- `#main-content` (used by skip-to-content)
- `/about/#faq` (used by footer FAQ link)
- All figure anchors used by CiteThisFigure

#### §4.1.8 — Button Behavior
"Browse All Chapters" → `#chapters` (in-page anchor). "Explore the Data" → `/explore/` (separate page). Verify both work.

### §4.2 — SEO Audit

#### §4.2.1 — Sitemap Completeness Verification (NEW — Gap #21)
Sitemap.xml is present on the live site (verified Feb 2026) but may be build-generated rather than committed to source. Verify:
- Sitemap lists ALL routes: homepage, 34 chapter pages, deep-dive-overview, explore, methodology, about
- Includes `<lastmod>` dates, `<changefreq>`, and `<priority>` values
- Sitemap URL in robots.txt matches actual location
- If build-generated (e.g., `next-sitemap` or built-in Next.js), verify configuration covers all routes
- If static, verify it is kept up-to-date

**Known issue — orphaned route:** `/chapters/deep-dive-overview/` is in the sitemap and llms.txt but not linked from homepage navigation or any chapter card. Either (a) add to navigation as an Act 6 landing page, (b) link from Explore page, or (c) remove from sitemap/llms.txt.

#### §4.2.2 — robots.txt Verification (NEW — Gap #22)
Current content:
```
User-agent: *
Allow: /
Sitemap: https://patentworld.vercel.app/sitemap.xml
```

Verify:
- All intended pages are crawlable
- No sensitive paths (e.g., `/api/`, `/_next/`) are inadvertently exposed
- Sitemap URL matches actual sitemap location
- AI training policy statement is appropriate

#### §4.2.3 — manifest.webmanifest Verification (NEW — Gap #23)
Manifest.webmanifest is present on the live site (verified Feb 2026) but minimal — specifies only a single 32×32 icon. Verify:
- `name`, `short_name`, `description` present and accurate
- `start_url`, `display`, `background_color`, `theme_color` present
- **Icon sizes:** Must include at least 192×192 and 512×512 (currently only 32×32). Add appropriately sized icons for home screen, splash screen, and taskbar contexts
- `<link rel="manifest">` present in `<head>`

#### §4.2.4 — OpenGraph Image Verification (NEW — Gap #24)
15 OG images exist in `public/og/`:
```
home.png, ai-patents.png, collaboration-networks.png, company-profiles.png,
green-innovation.png, innovation-dynamics.png, patent-law.png, patent-quality.png,
the-geography-of-innovation.png, the-innovation-landscape.png, the-inventors.png,
the-knowledge-network.png, the-language-of-innovation.png, the-technology-revolution.png,
who-innovates.png
```

Verify:
- Every chapter has an OG image mapped in `CHAPTER_OG_IMAGE` in `src/lib/seo.ts` (currently 32/34 chapters mapped; check which 2 are missing)
- Each OG image is 1200×630px (standard size)
- Images are not placeholder/blank
- The `chapterOgImage` fallback (`home.png`) is appropriate for unmapped chapters
- Homepage, Explore, Methodology, About pages also have OG images

#### §4.2.5 — Per-Page Metadata
Every page: unique `<title>`, unique `<meta description>`, canonical, OG tags, Twitter card tags. Verify via `src/lib/seo.ts` → `chapterMetadata()` and each page's `generateMetadata`.

#### §4.2.6 — Heading Hierarchy
One `<h1>` per page. Logical nesting. No skipped levels.

#### §4.2.7 — JSON-LD Structured Data
WebSite, BreadcrumbList, ScholarlyArticle per chapter, Person (author), Dataset.

**Entity disambiguation (v6):** Verify `disambiguatingDescription` is included in WebSite JSON-LD to distinguish from the 1985–1989 legal journal of the same name.

### §4.3 — GenAI Readiness

#### §4.3.1 — llms.txt
Verify `public/llms.txt` exists, lists all pages with descriptions, and is consistent with current site content. Also check `public/llms-full.txt`.

#### §4.3.2 — data-dictionary
Verify `public/data-dictionary.json` exists with metric definitions consistent with the Methodology page. Also check `public/llms-full.txt`.

**Known gap — data-dictionary.md missing (from live audit):** Only `data-dictionary.json` exists. The `.md` (Markdown) version is required for human readability and LLM ingestion via `llms.txt`. Generate `data-dictionary.md` from the JSON version, preserving all metric definitions, schema references, and technology domain mappings.

**Known gap — "modified Gini" absent from data dictionary (from live audit):** The `data-dictionary.json` defines `blockbuster_rate` but does not include the "modified Gini coefficient." Add the metric with its formula, range, and interpretation (if definable).

**Known issue — chapter numbering mismatch in data-dictionary.json (from live audit):** Uses sequential labels `chapter1`–`chapter22` that do not map to the 34-chapter/6-Act structure. Example: `chapter12` = "NLP topic modeling" but that corresponds to "The Language of Innovation." The audit MUST either (a) renumber to match the 34-chapter structure with Act groupings, or (b) replace sequential labels with URL slug keys (e.g., `system-language` instead of `chapter12`).

#### §4.3.3 — AI Bot Access
Content extractable without JavaScript (SSG). Verify `robots.txt` allows AI crawlers.

### §4.4 — Explore Page Audit (NEW — Gap #20, expanded with live audit findings)

The Explore page (`src/app/explore/page.tsx`) is currently an interactive search tool with four tabs (Organizations, Inventors, CPC Classes, WIPO Fields). **It does NOT contain a directory of the 34 chapters with links** (verified on live site, Feb 2026).

**Known issues from live audit:**

1. **No chapter listing:** The Explore page fails to list or link the 34 chapters. The audit MUST add a "Chapters" tab or static chapter directory section listing all 34 chapters organized by Act.

2. **Content entirely JavaScript-dependent:** Server-rendered HTML contains only loading placeholders (`<div class="h-8 animate-pulse rounded bg-muted">`) with no actual content. Search engines and users without JavaScript see an empty page. This violates Constraint 24. The audit MUST ensure at least a static chapter directory and summary content renders in server HTML, with interactive search enhancing progressively. (See Constraint 34 — SSR for interactive pages.)

3. **Missing `googlebot` meta tag:** The homepage includes `<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1"/>` but the Explore page has only generic robots meta. Standardize SEO meta tags across all pages.

4. **If chapter listing is added, verify:** All 34 chapters listed, act organization matches `ACT_GROUPINGS`, descriptions consistent with homepage cards and `constants.ts`, all links work

### §4.5 — Methodology Page↔Chapter Implementation Consistency (NEW — Gap #15)

The Methodology page (`src/app/methodology/page.tsx`, 50,326 bytes) is the largest single page. Verify:

1. **Every derived metric** defined on the Methodology page matches the actual code implementation
2. **Every technology domain definition** on the Methodology page matches the CPC codes/keywords used in data processing
3. **Gender inference method** description matches the code
4. **Topic modeling parameters** match the code
5. **No methodology described on a chapter page that contradicts the Methodology page**
6. **No methodology used in code that is undisclosed on the Methodology page**

This is the most labor-intensive check in Phase 4. For each metric, trace: Methodology page description → code implementation → chapter page usage. All three must be consistent.

**Known gap — "modified Gini coefficient" absent from Methodology (from live audit):**
The Methodology page defines `blockbuster_rate` but does not define the "modified Gini coefficient" used in Org Patent Count chapter. This metric, which produces negative values (−0.069), must be formally defined with its formula, domain, and interpretation. If no formal definition can be provided, this supports the case for relabeling the metric (see §1.11.17).

### §4.6 — Accessibility

- ARIA labels on chart containers
- Keyboard navigation for interactive elements
- Skip-to-content on every page
- Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)
- No red/green-only distinctions
- Noscript fallbacks for ALL 459 interactive charts
- v6 Lighthouse scores: 38/38 pages at 100% accessibility — re-verify a sample of 10 pages

### §4.6.1 — About Page Audit (expanded with live audit findings)

Must contain: author credentials, project description, data source, methodology link, limitations, license, contact, how to cite, acknowledgments. Verify all claims (Track B). Verify FAQ section exists (footer links to /about/#faq).

**Known issue — "Limitations" sidebar link (from live audit):** The About page sidebar navigation includes a "Limitations" link, but clicking it reveals no dedicated Limitations section — the text defers to the Methodology page. Either (a) add substantive Limitations content to the About page, or (b) remove the Limitations entry from the sidebar to avoid misleading readers.

### §4.7 — Font and Typography Consistency

**Explicit font stack verification:**
- A named font family is declared (e.g., Inter, Source Sans, system-ui)
- The font is loaded consistently (via `next/font`, Google Fonts, or self-hosted)
- Chart axis labels, tick marks, and data labels inherit the declared font
- Fallback fonts are specified in the stack
- Same font family site-wide, consistent heading sizes, no FOUT/FOIT

### §4.8 — Link Audit

#### §4.8.1 — Internal Links
ALL internal links resolve. Check: nav, breadcrumbs, cross-chapter references, homepage "See full analysis" links (34), "Start Reading" and "Browse All Chapters" buttons, "Explore the Data" button.

#### §4.8.2 — External Links
Test with `curl -sI`. Known externals:
- https://patentsview.org
- https://www.saeromlee.com
- https://creativecommons.org/licenses/by/4.0/
- Any DOIs, paper links, legal source links on chapter pages

### §4.9 — Performance
Lazy loading, code splitting, bundle sizes (<500KB), image optimization, Core Web Vitals risk.

**Expanded requirement (from forensic review) — Lighthouse performance audits:**
When headless browser execution is available (see §6.14), run Lighthouse audits (desktop and mobile) for three representative page templates: (a) homepage (heavy hero chart + 34 chapter cards), (b) one data-dense chapter (e.g., Patent Quality or Org Patent Count), (c) Explore page (interactive search). Save reports to `audit/lighthouse/`. For each run, report: Performance score, Largest Contentful Paint, Cumulative Layout Shift, Total Blocking Time, three largest JS bundles by size. Flag any charting library bundle exceeding 200KB gzipped. If Lighthouse unavailable, provide manual bundle-size estimates from `npm run build` output.

### §4.10 — Visualization Quality

#### §4.10.1 — Color Consistency
Same entity = same color across all charts. Same CPC section = same color everywhere. Extract palette from code and verify.

#### §4.10.2 — Axis and Label Readability
Full names and units. Legible at 375px, 768px, 1280px. No overlap/clipping. Sensible ticks. Zero baseline or disclosed.

#### §4.10.3 — Responsive Design
375px, 768px, 1280px: charts resize, text legible, nav works, no horizontal scroll, touch targets ≥44px.

#### §4.10.4 — URL Slug Consistency
Check all slugs match chapter titles: e.g., `org-composition` for "Assignee Composition," `inv-gender` for "Gender and Patenting." Verify convention is documented.

Print: `"PHASE 4 COMPLETE. [counts]. Proceeding to Phase 5."`

---

## PHASE 5: IMPLEMENT ALL FIXES

Priority order: Critical → High → Medium → Low.

Category order within each priority level:

### §5.1 — Data Accuracy Fixes (Track A)
Correct → re-run script → check cascading (same page, other pages, homepage cards, hero stats) → log.

### §5.2 — Narrative Coherence Fixes (Track D)
- Figure reordering (with anchor link preservation — Constraint 32)
- Orphan figure integration
- Executive Summary↔body mismatches
- KeyInsight↔figure mismatches
- Cross-reference corrections

### §5.3 — Methodology Fixes (Track C)
Formula mismatches, undisclosed methods, cross-chapter inconsistencies, entropy scale disambiguation.

### §5.4 — External Claim Fixes (Track B)
Per-category corrections. Source attributions.

### §5.5 — Controversial Statement Fixes
- Add D1-D8 category caveats
- Confounder disclosure on raw comparisons
- Neutralize loaded framing
- Add methodology caveats for sensitive statistics

### §5.6 — Language Fixes
Causal → associative. Informal → formal. Acronyms defined. Terminology standardized. Date formatting (en-dash). "By 2025" vs. "in 2025" standardized.

### §5.7 — Figure and Visualization Fixes
Caption↔title consistency. Tooltips. Dark mode. Loading/error states. Axes, labels, legends, colors, responsive.

### §5.8 — Cross-Consistency Fixes
- Cross-reference links fixed
- Redundancies resolved
- Concordance table mismatches corrected
- Homepage card↔chapter alignment

### §5.9 — Infrastructure Fixes
- Generate sitemap.xml
- Create manifest.webmanifest
- Fix OG image coverage
- Verify robots.txt
- Navigation, breadcrumbs, anchor links
- Accessibility (noscript duplicates, ARIA)
- SEO metadata, JSON-LD
- GenAI files (llms.txt, data dictionary)

### §5.10 — Partial-Year 2025 Standardization
Re-verify ALL 2025 references include "(through September)."

### §5.11 — Build
```bash
cd /home/saerom/projects/patentworld && npm run build
```
Fix all errors.

Print: `"PHASE 5 COMPLETE. [counts]. Build succeeded. Proceeding to Phase 6."`

---

## PHASE 6: VERIFY ALL FIXES

### §6.1 — Re-run ALL Track A verification scripts
### §6.2 — Re-verify cross-domain superlatives
### §6.3 — Re-verify homepage card crosscheck (34 cards)
### §6.4 — Re-verify sample of 10 Track B + 5 Track C fixes
### §6.5 — Cross-page consistency re-check
### §6.6 — Partial-year 2025 disclosure completeness check
### §6.7 — Page inventory re-run
### §6.8 — Cross-reference link validation (all 89+ links)
### §6.9 — Concordance table re-verification
### §6.10 — Narrative flow spot-check (5 chapters: 1 per non-Deep-Dive act + 2 Deep Dives)
### §6.11 — Infrastructure verification (sitemap, manifest, OG images, robots.txt)

### §6.12 — Update Audit Report: Add Status/Verified Columns

**Combined Accuracy Certification:**
```
TRACK A — DATA: [N] checks pass. Scripts: audit/verification-scripts/
  Homepage hero stats: VERIFIED (9.36M, 50, 34, 458)
  Homepage cards (34): ALL VERIFIED
  Cross-page consistency: [N] resolved
  Deep Dive cross-domain: ALL 12 validated, [N] superlatives checked
  Partial-year 2025: through September, ALL references disclosed
  Growth multiples: ALL independently computed
  Concordance table: [N] statistics, ALL consistent

TRACK B — EXTERNAL: [M] claims verified. [K] corrected. [J] flagged TODO.
TRACK C — METHODOLOGY: [P] metrics verified. [L] corrected. Entropy scales disambiguated.
TRACK D — NARRATIVE: [N] chapters assessed.
  Narrative flow: [N] strong, [N] adequate, [N] weak
  Figure ordering: [N] logical, [N] reordered
  Cross-references: [N] verified, [N] fixed
  Redundancies: [N] resolved
  Controversial statements: [N] flagged, [N] addressed

SENSITIVITY: [Q] items reviewed and addressed.
INFRASTRUCTURE: sitemap, manifest, OG images, robots.txt — [status]
```

### §6.13 — Lint, Type-Check, Final Build
```bash
cd /home/saerom/projects/patentworld
npx tsc --noEmit
npm run lint
npm run build
```

### §6.14 — Runtime Rendering Verification and JS-Enabled Audit Pipeline (expanded from forensic review)

The audit operates primarily on source files, but certain defects — chart axis label overlap, tooltip positioning, responsive layout breakage, hydration failures, debug metadata strings (see §1.1.12), and data payload discrepancies — manifest only at runtime.

**Full JS-enabled rendering pipeline (if Playwright/Puppeteer available):**

For each audited URL (all 34 chapter pages + homepage + methodology + about + explore):

1. **Rendered HTML snapshot:** After all charts fully load (wait for network idle), save final rendered HTML to `audit/snapshots/[page-slug].html`.
2. **Full-page screenshots:** Capture at desktop (1280px) and mobile (375px) viewports. Save to `audit/screenshots/[page-slug]-{desktop,mobile}.png`.
3. **Network log (HAR):** Capture all network requests, particularly JSON data endpoints used by chart components. Save to `audit/har/[page-slug].har`. These feed into §1.11.22 (Chart Data Extraction).
4. **Per-figure screenshots:** For each visualization, capture a targeted screenshot of the figure's bounding box. Save to `audit/figure-screenshots/[page-slug]--[figure-id].png`.
5. **Console error log:** Record any JS console errors, warnings, or uncaught exceptions. Save to `audit/console-logs/[page-slug].log`.

**Minimum viable runtime check (if full pipeline is unavailable):**
```bash
npm run dev &
sleep 10
# Spot-check 5 representative pages for hydration errors and console errors
npx playwright test --project=chromium || echo "Playwright not available; skip runtime checks"
```

**Scope limitation disclosure:** If JS-enabled rendering is unavailable, write `"Runtime rendering verification: SKIPPED — environment does not support headless browser execution. Findings dependent on JS rendering (debug metadata strings, chart data payloads, tooltip correctness, responsive layout) are marked 'I cannot confirm.'"` This must appear in the audit report executive summary.

### §6.15 — Automated Accessibility Scan (sample of 10 pages)
```bash
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json --output-path=audit/v7-lighthouse-homepage.json 2>/dev/null || echo "Lighthouse not available"
```

### §6.16 — Post-Deploy Deep-Link Verification
After Phase 7 push:
```bash
for path in "/" "/explore/" "/methodology/" "/about/" "/chapters/system-patent-count/" "/chapters/ai-patents/" "/chapters/biotechnology/"; do
  STATUS=$(curl -sI "https://patentworld.vercel.app${path}" | head -1)
  echo "${path} → ${STATUS}"
done
```

Print: `"PHASE 6 COMPLETE. All verifications pass. Build clean. Proceeding to Phase 7."`

---

## PHASE 7: COMMIT, PUSH, DEPLOY

```bash
cd /home/saerom/projects/patentworld

# Commit 1: Data accuracy + methodology + narrative coherence
git add -A -- '*.tsx' '*.ts' '*.jsx' '*.js' '*.mdx' '*.md' ':!audit/' ':!public/llms.txt' ':!public/llms-full.txt' ':!public/data-dictionary.*' ':!public/robots.txt' ':!public/sitemap.xml' ':!public/manifest.*'
git commit -m "fix(accuracy+narrative): correct data, methodology, narrative coherence, language issues

Track A: [N] data errors corrected
Track B: [K] external claims corrected
Track C: [L] metric formulas fixed, entropy scales disambiguated
Track D: [N] narrative flow fixes, [N] figure reorders, [N] cross-references fixed
Sensitivity: [Q] confounder disclosures, neutral framing
Language: causal→associative, informal→formal, terminology standardized
Visualization: captions/tooltips/dark-mode/loading-states
Audit ref: audit/v7-audit-report.md"

# Commit 2: SEO + structured data
git add -A -- '*layout*' '*head*' '*metadata*' '*seo*' '*jsonld*' '*schema*'
git commit -m "feat(seo): metadata, JSON-LD, heading hierarchy, OG images"

# Commit 3: Infrastructure (sitemap, manifest, robots.txt)
git add public/sitemap.xml public/robots.txt public/manifest.* 2>/dev/null
git commit -m "feat(infra): sitemap.xml, manifest.webmanifest, robots.txt" 2>/dev/null || echo "No infrastructure changes"

# Commit 4: GenAI readiness
git add public/llms.txt public/llms-full.txt public/data-dictionary.* 2>/dev/null
git commit -m "feat(ai-readiness): llms.txt, data dictionary" 2>/dev/null || echo "No GenAI changes"

# Commit 5: Audit artifacts
git add audit/
git commit -m "docs(audit): v7 audit report, verification scripts, certification"
```

```bash
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
git status && git log --oneline -10
```

Print: `"PHASE 7 COMPLETE. Pushed to origin/$BRANCH. Deploy: https://patentworld.vercel.app/"`

---

## PHASE 8: CONSOLIDATED REPORT

Save to `audit/v7-audit-report.md`.

### §8.1 — Finding Classification

Classify every finding by severity × category × location:

**Severity levels:**
- CRITICAL: Data error affecting a key claim, broken functionality, or security issue
- HIGH: Inconsistency across pages, missing disclosure, misleading language
- MEDIUM: Minor inaccuracy, formatting issue, missing element
- LOW: Style inconsistency, optimization opportunity, enhancement suggestion

**Categories:**
- DATA: Number, percentage, ranking, trend accuracy
- NARRATIVE: Flow, ordering, coherence, redundancy
- METHODOLOGY: Formula, definition, disclosure
- EXTERNAL: Legal, academic, institutional claim
- SENSITIVITY: Gender, geopolitical, normative, causal
- INFRASTRUCTURE: SEO, accessibility, navigation, performance
- LANGUAGE: Causal, informal, formatting, terminology

### §8.2 — Concordance Table

Every claim that appears in multiple locations → all locations → consistency status. (From §3.4.)

### §8.3 — Per-Chapter Summary

For EACH of the 34 chapters:
```
## [chapter-slug] — [title]
Findings: [N] (C: [N], H: [N], M: [N], L: [N])
Narrative flow: STRONG / ADEQUATE / WEAK
Figure ordering: LOGICAL / REORDERED
Figure count: [N] ChartContainers
KeyInsights: [N] — all consistent: YES / NO
DataNotes: [N] existing + [N] recommended
Controversial statements: [N] flagged
Cross-references: [N] outgoing, [N] incoming
Status: ALL FIXED / [N] DEFERRED
```

### §8.4 — Per-Act Summary

For EACH of the 6 acts:
```
## Act [N]: [Title]
Chapters: [N]
Inter-chapter coherence: STRONG / ADEQUATE / WEAK
Thematic consistency: YES / NO: [details]
Act transition quality: SMOOTH / JARRING: [details]
Total findings: [N]
```

### §8.5 — Site-Wide Summary
```
Top findings:
1. [description]
2. [description]
...

Recommendations:
1. [description]
2. [description]
...

Overall assessment: [statement]
```

### §8.6 — Structured Five-Section Output Format (NEW — from forensic review)

The final audit report must also include or be organized around this five-section structure for completeness and machine-readability:

**Section I — Executive Summary:** Issue counts by severity (Critical / Major / Minor / Editorial). One-paragraph narrative of most consequential findings. Scope limitation disclosures (e.g., JS-enabled rendering skipped).

**Section II — Issue Log Table:** Every finding as a row with columns: ID, Severity, Type (Data / Viz / Text / Logic / Link / SEO / Accessibility / AI-readiness / Performance), URL, Location (section heading + figure title), Exact evidence snippet, What it was compared against, Why it is a problem, Concrete fix (implementation steps), How to verify fix (test steps + expected outcome). This table subsumes the Track A/B/C/D issue logs.

**Section III — Prior Suggestions Compliance Matrix:** For each known issue documented in this prompt: status (Implemented / Partially / Not Implemented / Cannot Confirm), evidence (what changed / what remains), and remaining implementation steps if applicable.

**Section IV — PatentsView-Only Analysis Expansion Plan:** 10–20 items. For each proposed metric: precise definition (numerator, denominator, units, time window), PatentsView fields required, known limitations.

**Section V — SEO + GenAI Optimization Action Plan:** Organized by effort: Quick wins (1–2 days), Medium effort (1–2 weeks), Structural changes (2–6 weeks). Each item actionable with a testable success criterion.

---

## FINAL OUTPUT

```
============================================
PATENTWORLD v7 AUDIT & DEPLOYMENT COMPLETE
============================================
TRACK A — DATA ACCURACY:
  Found/Fixed/Deferred: [N]/[N]/[N]
  Scripts: audit/verification-scripts/
  Hero stats: VERIFIED (9.36M, 50, 34, 458)
  Cards (34): ALL VERIFIED
  Cross-page consistency: [N] resolved
  Deep Dive cross-domain: ALL 12 validated, [N] superlatives checked
  Partial-year 2025: through September, ALL disclosed
  Growth multiples: [N] independently computed
  Concordance table: [N] statistics verified across [N] locations

TRACK B — EXTERNAL:
  Identified/Correct/Corrected/Unverifiable: [N]/[N]/[N]/[N]
  Patent Law timeline: [N]/21 verified
  Author affiliation: VERIFIED
  Data provenance: VERIFIED (single source of truth)

TRACK C — METHODOLOGY:
  Verified/Correct/Fixed: [N]/[N]/[N]
  Entropy scales: disambiguated
  Blockbuster cohort: standardized
  Disclosures added: [N]

TRACK D — NARRATIVE COHERENCE (NEW):
  Chapters assessed: 34/34
  Narrative flow: [N] strong, [N] adequate, [N] weak → [N] improved
  Figure ordering: [N] reordered (anchor links preserved)
  Cross-references: [N] verified, [N] fixed, [N] bidirectional added
  Redundancies: [N] found, [N] resolved
  Controversial statements: [N] flagged (D1:[N] D2:[N] D3:[N] D4:[N] D5:[N] D6:[N] D7:[N] D8:[N])
  KeyFindings consistency: 34/34 verified
  KeyInsight consistency: 264/264 verified
  SectionDivider consistency: 255/255 verified
  Executive Summary consistency: 34/34 verified
  DataNote completeness: 42 existing + [N] added
  Homepage card→chapter transitions: 34/34 verified

SENSITIVITY: [N] reviewed, [N] addressed
  Six reframings applied: country quality / US-China mobility / gender callout /
    regional clusters / blockchain hype / pending legislation
LANGUAGE: [N] causal, [N] informal, [N] acronyms, [N] formatting
  Typography sweep: [N] en-dash, [N] em-dash, [N] minus sign corrections
VISUALIZATION: [N] fixes across 459 charts
  Caption↔title consistency: 459/459
  Tooltip verification: [N] chart types verified
  Dark mode: [status]
  Loading/error states: [status]
  Debug metadata strings: [N] found, [N] resolved / I cannot confirm (JS-dependent)
ACCESSIBILITY: Lighthouse 100% on [N]/38 pages; ARIA/keyboard/skip-to-content verified
CITE THIS FIGURE: 459/459 verified (interactive, correct anchors)
JSON-LD SYNC: hasPart descriptions synchronized with chapter content: [N]/34
  Denominator mismatches: [N] corrected
  Language softening propagated: [N] entries
  Typography corrected: [N] entries
SEO: metadata + JSON-LD on all pages
  Sitemap: [VERIFIED / UPDATED]
  Manifest: [UPDATED with proper icons / status]
  OG images: [N]/34 chapters + [N] support pages
  robots.txt: VERIFIED
NUMBER REGISTRY: [N] values catalogued, [N] conflicts detected, [N] resolved
KPI LABEL CONSISTENCY: [N] KPI cards checked, [N] mismatches corrected
GENAI: llms.txt + data-dictionary.json + data-dictionary.md + robots.txt
  data-dictionary chapter numbering: [FIXED / status]
ROUTING: all routes return HTTP 200: [verified/not tested]
FONT STACK: explicit declaration verified: [yes/no]
EXPLORE PAGE: chapter directory added: [yes/no]; SSR fallback: [yes/no]

Commits: [N] | Branch: [name] | Push: SUCCESS
Deploy: https://patentworld.vercel.app/

CERTIFICATION: [Full statement]
============================================
```

---

## CONSTRAINTS (37 rules — read each one)

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
18. **Color encoding consistent** across all 459 visualizations.
19. **Raw comparisons must disclose confounders.**
20. **Causal language requires methodological justification.** "Reflecting," "opened the field to," "as" (causal), "produces," "affects," "reveals how" are flagged alongside "caused." Event-study or quasi-experimental claims require explicit identification assumptions and robustness evidence.
21. **Sensitivity review mandatory.** Gender, geography, rankings, public investment — all neutral. Raw statistics without methodological context risk ideological projection.
22. **Process in mandatory order.** Save checkpoint per group. No skipping ahead.
23. **Distinguish concentration LEVEL from concentration TREND.** Never use "most concentrated" without specifying whether referring to absolute top-4 share at a point in time or to the direction of change over time.
24. **Deep links must be persistent; server-side rendering required.** All routes must produce valid server-rendered HTML. CSR-only routing is unacceptable for an academic platform. Interactive pages (Explore, Company Profiles) must render at least a static fallback (chapter directory, summary text) in server HTML, with interactive features enhancing progressively. Client-side-only content is invisible to search engines and users without JavaScript.
25. **One canonical taxonomy.** The active codebase must contain exactly one content structure (34 chapters, 6 Acts). Remove any deprecated legacy structures.
26. **Data provenance from a single source of truth.** The PatentsView access date, data version, and coverage dates must be generated from a SINGLE config constant (`src/lib/constants.ts`). No page may display a different provenance string than any other page.
27. **Denominator consistency.** Every percentage must specify its denominator. "All patent grants" ≠ "utility patents." Key Findings, captions, methodology, figure code, **homepage cards, and JSON-LD `hasPart` descriptions** must use the same denominator for each statistic.
28. **Legal/judicial dates verified against primary sources.** Every court decision date must match the authoritative decision date (Justia, Cornell LII, WIPO Lex). Every statute must specify date basis (signed, effective, or enacted). The Patent Law timeline is a known error hotspot.
29. **Every figure must be checked for narrative integration (Constraint 29 — NEW).** No orphan figures — every ChartContainer must be referenced in the surrounding narrative text. A figure that appears without any textual context violates this constraint.
30. **Cross-references must be verified bidirectionally (Constraint 30 — NEW).** If Chapter A links to Chapter B with a claim about B's content, B's content must support that claim. If the reference is substantive (not just "see also"), consider whether B should link back to A.
31. **Controversial statements require explicit flagging with category code (Constraint 31 — NEW).** Every statement classified as D1–D8 in §2.3 must be tracked in `audit/v7-controversy-scan.md` with a clear assessment and recommendation. No controversial statement should pass the audit unflagged.
32. **Figure ordering changes require justification and must not break anchor links (Constraint 32 — NEW).** If a figure is moved within a chapter, document the reason. Verify that CiteThisFigure URLs, cross-references, and any section anchors remain valid after the move.
33. **JSON-LD synchronization (Constraint 33 — NEW from live audit).** JSON-LD structured data descriptions must match chapter page content. After updating chapter Key Findings, summaries, or language, propagate ALL changes to the JSON-LD `hasPart` array. Confounder disclosures, decade clarifications, denominator corrections, and language softening must appear in both the chapter page and the JSON-LD description. The JSON-LD array is indexed by search engines and LLMs; discrepancies undermine both accuracy and search quality.
34. **Typography standards (Constraint 34 — NEW from live audit).** Date ranges use en-dash (–, U+2013), not hyphen (-). Parenthetical breaks use em-dash (—, U+2014), not double hyphen (--). Negative numbers use minus sign (−, U+2212), not hyphen-minus. These standards apply to chapter text, homepage cards, JSON-LD, captions, `constants.ts` descriptions, and all rendered content.
35. **Sitewide number registry (Constraint 35 — NEW from forensic review).** Build and maintain a structured registry (`audit/number-registry.json`) of every headline number, definition, and denominator/basis choice across all pages. Run an automated conflict-detection pass flagging values that appear on multiple pages with different magnitudes, rounding, or denominators. The registry is a committed deliverable artifact.
36. **KPI label-to-definition consistency (Constraint 36 — NEW from forensic review).** Every KPI card's textual description must exactly match the labels displayed on the card itself. "Top 5 States" ≠ "top 5% of states." If a percentage threshold is used, disclose the resulting count. This constraint applies to all KPI cards across all chapters.
37. **Figure metadata standardization (Constraint 37 — NEW from forensic review).** No raw, debug, or unformatted metadata strings may appear in rendered output near charts. All data provenance must be presented through a shared provenance component using a standardized format. If debug metadata strings are found (e.g., "Data PatentsView 2025-Q1 Window 5y Through 2020"), they must be reformatted or removed from the rendered view.
