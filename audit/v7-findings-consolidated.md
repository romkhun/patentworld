# PatentWorld v7 Audit — Consolidated Findings

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6
**Status:** Phases 1-4 findings (pre-fix)

---

## CRITICAL FINDINGS

### C1. JSON-LD Dataset Denominator Error (seo.ts:255)
- **File:** `src/lib/seo.ts`, line 255
- **Current:** `'Analysis of 9.36 million US utility patents from PatentsView / USPTO.'`
- **Correct:** `'Analysis of 9.36 million US patents (utility, design, plant, and reissue) from PatentsView / USPTO.'`
- **Impact:** JSON-LD structured data uses wrong denominator. 9.36M includes all patent types, not just utility.
- **Severity:** CRITICAL — affects search engine data interpretation
- **Constraint:** 27 (Denominator consistency)

### C2. Measurement Config Contradiction (chapterMeasurementConfig.ts:11)
- **File:** `src/lib/chapterMeasurementConfig.ts`, line 11
- **Current:** `notes: 'Utility patents only; excludes design and plant patents.'` (for system-patent-count)
- **Reality:** Chapter 1 and hero stats count ALL patent types (9.36M = utility + design + plant + reissue)
- **Impact:** Measurement metadata contradicts actual data and chapter descriptions
- **Severity:** CRITICAL — misleading provenance metadata

---

## HIGH FINDINGS

### H1. "quality-quantity tradeoff" in International Geography (constants.ts:156)
- **Text:** `'suggesting a quality-quantity tradeoff'`
- **Issue:** Loaded interpretive language (D2/D7) in homepage card AND JSON-LD description
- **Fix:** Replace with `'differences in observed patent-document characteristics across countries of origin'`
- **Constraint:** 31, 33

### H2. Gender Citation Comparison Without Confounder Disclosure (constants.ts:134)
- **Text:** `'All-male teams average 14.2 forward citations, mixed-gender teams 12.6, and all-female teams 9.5.'`
- **Issue:** Raw comparison without field-composition confounder (D1/D8). Appears in homepage card AND JSON-LD.
- **Fix:** Add `'These differences are substantially confounded by field composition.'`
- **Constraint:** 19, 27, 31

### H3. "deep integration" for US-China (mech-inventors:681,696)
- **Text:** `'highlights the deep integration of these two innovation ecosystems'`
- **Issue:** Normative geopolitical language (D2). Per audit §2.3: replace with `'high bilateral mobility volumes'`
- **Fix:** Rewrite to neutral descriptive language

### H4. "self-reinforcing" Causal Claims (geo-domestic: 5 instances)
- **Text:** `'self-reinforcing innovation ecosystems'`, `'self-reinforcing nature of agglomeration economies'`
- **Issue:** Causal mechanism claim (D4) from observational data
- **Fix:** Add literature citations (Marshall 1890, Krugman 1991) and hedge: `'consistent with agglomeration mechanisms proposed in the literature'`

### H5. Blockchain "hype cycle" Without Definition (blockchain chapter: 12+ instances, seo.ts:90)
- **Text:** SEO title `'Blockchain Patents Track a Hype Cycle'`, section heading `'The Hype Cycle in Patent Data'`
- **Issue:** Uses "hype cycle" without operational definition or Gartner citation (D3)
- **Fix:** Either cite Gartner with proprietary-framework disclosure, or replace with `'boom-bust pattern in patenting volumes'`

### H6. Modified Gini Coefficient Undisclosed (Methodology page)
- **Issue:** Gini defined as [0,1] range, but org-patent-count uses "modified Gini" producing negative values (−0.069). Not defined anywhere.
- **Fix:** Add formal definition with formula, domain, and interpretation to Methodology page

### H7. Broken JSON-LD Anchor: `/#acts` (seo.ts:267, deep-dive-overview/layout.tsx:73)
- **Current:** BreadcrumbList references `/${BASE_URL}/#acts`
- **Reality:** No element with `id="acts"` exists. Homepage has `id="chapters"`
- **Fix:** Change to `/#chapters` or add `id="acts"` to homepage

### H8. Explore Page: No Server-Rendered Content (Constraint 24)
- **File:** `src/app/explore/page.tsx`
- **Issue:** Entire page is `'use client'` with JS-only content. Search engines see empty page.
- **Fix:** Add static chapter directory section with server rendering; progressive enhancement for search

---

## MEDIUM FINDINGS

### M1. manifest.webmanifest Missing (§4.2.3)
- No manifest file in public/
- Need: name, short_name, start_url, display, icons (192×192, 512×512), theme_color

### M2. data-dictionary.md Missing (§4.3.2)
- Only JSON version exists; Markdown needed for human readability and LLM ingestion

### M3. data-dictionary.json Chapter Numbering (§4.3.2)
- Uses `chapter1`-`chapter22` that don't map to 34-chapter structure
- Fix: Replace with URL slug keys (e.g., `system-language` instead of `chapter12`)

### M4. FAQ Section Missing from About Page
- No `id="faq"` anchor exists anywhere
- Footer FAQ link would point to non-existent anchor

### M5. FAQ Link Missing from Footer (§4.1.2)
- Footer has only 3 nav links: Methodology, About, Explore
- Missing: FAQ link (→ /about/#faq)

### M6. No Error State in ChartContainer (§1.1.11)
- Component stays in loading state indefinitely if data fetch fails
- No error boundary or timeout mechanism

### M7. Typography: Hyphens Instead of En-Dashes (Constraint 34)
- constants.ts:127: `'37-51%'` → should be `'37–51%'`
- constants.ts:149: `'patents -- more than'` → should be `'patents — more than'`
- Additional instances in chapter pages pending comprehensive sweep

### M8. Patent Law Causal Language (§2.4)
- system-patent-law: `'transformed university patenting'` — causal verb
- Fix: `'was followed by growth in university patenting'`

### M9. "all grants" Ambiguous Denominator (constants.ts)
- Lines 41, 48: "of all grants" — doesn't specify utility-only vs all types
- AI patents (line 200): "9.4% of all US patent grants" — likely utility-only denominator

---

## LOW FINDINGS

### L1. ChapterHeader Gradient Colors (ChapterHeader.tsx)
- Gradient colors only map chapters 1-24; chapters 25-34 fall back to default blue
- Non-functional impact

### L2. space-technology Has No Incoming Cross-Chapter Links
- Only chapter with no other chapter linking to it

### L3. deep-dive-overview Not Linked from Homepage Navigation
- Present in sitemap and llms.txt but not linked from main navigation or chapter cards
- Orphaned route

---

## VERIFIED PASS

### Data Accuracy (Track A)
- ✓ All hero stats (9.36M, 50 years, 34 chapters, 458 visualizations)
- ✓ Homepage hero text claims (70,000 → 374,000, five-fold, 27%→57%)
- ✓ 20 Act 1 numerical claims at 100% accuracy
- ✓ v6 verified 30+ claims against raw PatentsView data
- ✓ v6 verified all 12 Deep Dive CR4 values and superlatives

### Structural Elements
- ✓ 459 ChartContainers (458 chapter + 1 homepage)
- ✓ 264 KeyInsights across 34 chapters
- ✓ 255 SectionDividers
- ✓ 42 DataNotes
- ✓ 34 KeyFindings (1 per chapter)
- ✓ 34 InsightRecaps (1 per chapter)
- ✓ 6 CompetingExplanations
- ✓ 14 RankingTables
- ✓ 39 StatCallouts
- ✓ 4 StatCards

### Figure IDs
- ✓ All 459 ChartContainers have explicit `id="fig-..."` props
- ✓ All 459 IDs are globally unique
- ✓ CiteThisFigure anchors will resolve correctly

### Cross-Chapter Links
- ✓ 88 cross-chapter links in chapter pages
- ✓ All 34 target slugs are valid routes
- ✓ 20 links in Methodology page, all valid

### Navigation
- ✓ Header: PatentWorld, Explore, Methodology, About
- ✓ Footer: Methodology, About, Explore, PatentsView attribution, CC BY 4.0
- ✓ Skip-to-content → #main-content
- ✓ BackToTop component present
- ✓ "Browse All Chapters" → #chapters (exists)
- ✓ "Start Reading" → /chapters/system-patent-count/ (exists)

### SEO
- ✓ Sitemap: build-generated from CHAPTERS array, covers all 39 pages
- ✓ robots.txt: present, allows crawling, sitemap reference correct
- ✓ Per-page metadata: unique titles, descriptions, OG tags, Twitter cards
- ✓ JSON-LD: WebSite + BreadcrumbList + ScholarlyArticle per chapter
- ✓ Entity disambiguation for UK journal in WebSite JSON-LD
- ✓ All 34 chapters mapped in CHAPTER_OG_IMAGE

### Font Stack
- ✓ Playfair Display (serif), Plus Jakarta Sans (sans), JetBrains Mono (mono)
- ✓ All via next/font/google with display: 'swap'

### Accessibility
- ✓ Skip-to-content with #main-content
- ✓ ARIA labels on nav
- ✓ Focus rings on interactive elements
- ✓ noscript fallbacks on all ChartContainers
- ✓ v6 achieved 100% Lighthouse accessibility on 38/38 pages

### GenAI Readiness
- ✓ llms.txt present and comprehensive
- ✓ llms-full.txt present
- ✓ data-dictionary.json present (but needs renumbering)
- ✓ robots.txt allows AI crawlers

### v6 Baseline Artifacts
- ✓ All 10 v6 artifacts present (figure-manifest.csv, 9 verification scripts, etc.)
- ✓ v6 found/fixed 6 data issues, 0 external claim errors, 3 methodology fixes
- ✓ 28 causal language instances catalogued, 47 sensitivity items catalogued

---

## NEXT: Phase 5 — Implement Fixes

Priority order for implementation:
1. C1, C2: Fix JSON-LD denominator and measurement config
2. H1-H6: Language/disclosure fixes in constants.ts and chapter pages
3. H7: Fix broken anchor
4. H8: Add server content to Explore page
5. M1-M9: Infrastructure and formatting fixes
6. L1-L3: Low-priority cleanups
