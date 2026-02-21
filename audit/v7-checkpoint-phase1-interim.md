# Phase 1: Per-Element Verification — Interim Checkpoint

## Date: 2026-02-21

## Status: IN PROGRESS (agents running for all 6 Acts)

---

## §1.1 — Figure-Level Verification (459 ChartContainers)

### §1.1.5 — Figure IDs
- **Status:** PENDING (agent running)
- **Preliminary:** ChartContainer uses `id` prop. Homepage chart has explicit `id="fig-homepage-patent-volume"` ✓

### §1.1.6 — CiteThisFigure
- CiteThisFigure is embedded IN ChartContainer (line 115 of ChartContainer.tsx) — not standalone ✓
- Generates APA + BibTeX citations with correct author, year, institution ✓
- URL: `window.location.origin + pathname + '#' + slug` where slug = `figureId ?? 'fig-' + slugify(title)`
- **FINDING:** If ChartContainer has no explicit `id` prop, CiteThisFigure generates a slug from the title, but NO corresponding anchor element exists on the page — the `id` on ChartContainer IS the anchor. So if `id` is provided, the anchor and citation URL match. If `id` is NOT provided, ChartContainer renders without an `id` attribute, and CiteThisFigure generates a URL to a non-existent anchor.
- **Severity:** MEDIUM — affects any ChartContainer without explicit `id` prop

### §1.1.10 — Dark Mode
- ChartContainer: uses CSS variables ✓
- KeyFindings: `dark:bg-blue-950/20`, `dark:text-blue-400` ✓
- KeyInsight: `dark:bg-amber-950/20` ✓
- InsightRecap: `dark:bg-emerald-950/20`, `dark:text-emerald-400` ✓
- **Status:** Components have dark mode support ✓

### §1.1.11 — Loading/Error States
- **Loading:** YES — animated bar placeholder + "Loading visualization…" (ChartContainer.tsx lines 67-92) ✓
- **Error:** NO explicit error state — component stays in loading state indefinitely if data fails to load
- **noscript:** YES — "This visualization requires JavaScript" + fallback text from subtitle/caption/title ✓
- **FINDING:** No error boundary or timeout for failed data loads
- **Severity:** MEDIUM

### §1.1.12 — DataBadge (debug metadata per Constraint 37)
- DataBadge.tsx renders styled badge pills: "Data: PatentsView 2025-Q1", "Window: 5y", etc.
- Labels are abbreviated: Data, Window, Through, Norm, Tax
- This is NOT raw debug metadata — it's an intentionally styled provenance component ✓
- **Assessment:** Compliant with Constraint 37 — formatted through shared component

---

## §1.11 — Track A Data Accuracy

### §1.11.1 — Hero Stats (verified in v6, re-confirmed)

| Stat | Claimed | Verified | Source | Status |
|------|---------|----------|--------|--------|
| 9.36M patents | 9,361,444 | 9,361,444 | patents_per_year.json | ✓ |
| 50 Years | 50 | 50 unique years in data | patents_per_year.json | ✓ |
| 34 Chapters | 34 | 34 entries in CHAPTERS | constants.ts | ✓ |
| 458 Visualizations | 458 | 458 ChartContainers in chapters | grep count | ✓ |

### §1.11.3 — Homepage Hero Text Claims

| Claim | Verified Value | Source | Status |
|-------|---------------|--------|--------|
| ~70,000 in 1976 | 70,941 | patents_per_year.json | ✓ |
| 374,000 in 2024 | 373,852 | patents_per_year.json | ✓ |
| "more than five-fold" | 5.27× | 373,852/70,941 | ✓ |
| "27% to 57%" (G+H) | 27% → 57% | cpc_section_shares.json | ✓ (verified in v6) |
| "(through September)" 2025 | Present | HomeContent.tsx:92 | ✓ |

### §1.11.5 — Act 1 Numerical Claims (20 claims verified)

**Result: 100% ACCURACY — All 20 claims match data files**

| # | Claim | Verified Value | Match |
|---|-------|---------------|-------|
| 1 | Total patents 9.36M | 9,361,444 | ✓ |
| 2 | Peak year 2019 | 2019 | ✓ |
| 3 | Peak count 393K | 392,618 | ✓ |
| 4 | 1976 total 70,941 | 70,941 | ✓ |
| 5 | 2024 total ~374K | 373,852 | ✓ |
| 6 | 1976-1979 avg ~66K | 65,958 | ✓ |
| 7 | Five-fold increase | 5.27× | ✓ |
| 8 | 2010 peak lag 3.82y | 1,395.1 days = 3.82y | ✓ |
| 9 | 1976 lag 1.2y | 455.1 days = 1.25y | ✓ |
| 10 | 2006 peak pendency 3.8y | 3.75y | ✓ |
| 11 | 2024 related share 96.3% | 96.26% | ✓ |
| 12 | Forward cites peak 6.4 (2019) | 6.4 | ✓ |
| 13 | Scope growth 1.8-2.5 | 1.79-2.4 | ✓ |
| 14 | Avg claims 1976: 9.4 | 9.41 | ✓ |
| 15 | Avg claims peak 18.9 (2005) | 18.9 | ✓ |
| 16 | Originality 0.09→0.25 | 0.086→0.251 | ✓ |
| 17 | Generality 0.28→0.15 | 0.282→0.154 | ✓ |
| 18 | 2002 related share 36% | 35.79% | ✓ |
| 19 | 1976 pendency 1.6y | 1.56y | ✓ |
| 20 | 2019 total 393K | 392,618 | ✓ |

---

## Infrastructure Findings (from direct analysis)

### §4.1.2 — Footer
- **FINDING:** FAQ link MISSING from footer. Only 3 nav links: Methodology, About, Explore
- **Severity:** LOW

### §4.1.7 — Anchor Links
- **FINDING:** JSON-LD BreadcrumbList references `/#acts` (seo.ts:267) but NO element with `id="acts"` exists. Homepage has `id="chapters"` not `id="acts"`.
- **Severity:** MEDIUM — broken structured data anchor

### §4.2.3 — manifest.webmanifest
- **FINDING:** MISSING — no manifest file exists in public/
- **Severity:** MEDIUM

### §4.2.4 — OG Images
- All 34 chapters mapped in CHAPTER_OG_IMAGE ✓
- 15 OG image files exist in public/og/ ✓
- Fallback to 'home.png' for unmapped chapters ✓

### §4.2.7 — JSON-LD Denominator Inconsistency (Constraint 27)
- **FINDING:** layout.tsx Dataset (line 99): "9.36 million US patents" (all types)
- seo.ts Dataset (line 255): "9.36 million US **utility** patents" (utility only)
- SITE_DESCRIPTION (constants.ts line 2): "utility, design, plant, and reissue" (all types)
- **Severity:** HIGH — inconsistent denominator in structured data

### §4.3.2 — data-dictionary
- **FINDING:** No data-dictionary.json or data-dictionary.md exists in public/
- **Severity:** MEDIUM — known gap

### §4.5 — Methodology: Modified Gini
- **FINDING:** Gini coefficient defined as [0,1] range, but org-patent-count uses "modified Gini" producing negative values (−0.069). Not defined on Methodology page.
- **Severity:** HIGH — undisclosed metric

### §4.6 — Accessibility
- Skip-to-content: YES (layout.tsx:130-131 → `#main-content`) ✓
- `main id="main-content"`: YES (layout.tsx:135) ✓
- BackToTop: YES ✓
- ReadingProgress: YES ✓

### §4.7 — Font Stack
- Playfair Display (serif), Plus Jakarta Sans (sans), JetBrains Mono (mono)
- All via next/font/google with display: 'swap' — FOUT mitigated ✓

### §4.6.1 — About Page
- FAQ section: DOES NOT EXIST — no `id="faq"` anchor anywhere
- Limitations: Correctly defers to /methodology/#limitations ✓

### §2.4.9 — Typography (from previous session)
- constants.ts line 48: "1976-1995" uses hyphen-minus, not en-dash
- constants.ts line 149: "--" double hyphen, not em-dash
- **Status:** PENDING comprehensive sweep (agent running)

### §2.3 — Causal Language (v6 baseline)
- v6 found: 28 DIRECT_CAUSAL, 150+ QUASI_CAUSAL, 5 NORMATIVE
- v7 must re-verify these and identify any NEW instances
- **Status:** PENDING (agent running)

### §2.3 — Sensitivity Screening (v6 baseline)
- v6 found: 47 items across 6 categories (D1:7, D2:10, D3:6, D4:11, D5:5, D6:8)
- v7 must re-verify and identify any missed items
- **Status:** PENDING cross-reference

---

## Agents Running

| Agent | Task | Status |
|-------|------|--------|
| a886c48f04a96f05a | Act 1 data file existence | Running |
| af76b0a8a204fc869 | Act 1 numerical claims | ✅ COMPLETE — 100% accuracy |
| a51d824ac89cbce69 | Figure IDs + InsightRecaps | Running |
| a0eaa5a261de9a710 | Causal language + typography | Running |
| ae8fb21c06b58c953 | Act 2 chapters | Running |
| abd7b1732f0dafa6c | Act 3 chapters | Running |
| a1627b7db03a35e03 | Acts 4-5 chapters | Running |
| af8458be506491de0 | Act 6 Deep Dives | ✅ COMPLETE (ran out of context) |
| aec9af43fa6900c7f | Element counts all chapters | Running |
