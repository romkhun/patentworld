# About Page, Explore Page & Additional Pages Audit

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated)
**Files audited:**
- `/home/saerom/projects/patentworld/src/app/about/page.tsx`
- `/home/saerom/projects/patentworld/src/app/explore/page.tsx`
- `/home/saerom/projects/patentworld/src/app/methodology/page.tsx`
- `/home/saerom/projects/patentworld/src/lib/constants.ts`

---

## 1. About Page Audit (section 1.17)

### 1.1 Required Content Checklist

| Item | Present? | Notes |
|------|----------|-------|
| Author information and credentials | YES | "Saerom (Ronnie) Lee, Assistant Professor of Management, The Wharton School, University of Pennsylvania" (lines 97-109 JSON-LD, lines 164-168 header, lines 196-209 section) |
| Project description and scope | YES | Opening paragraph (lines 187-191): "interactive data exploration platform...50 years of United States patent activity...9.36M patents" |
| Data source description | YES | Section "Data Source & Attribution" (lines 249-281). Names PatentsView, USPTO, 9.36M patents, coverage 1976-2025 |
| PatentsView version / download date | YES | "accessed January 2025" (line 269) |
| Temporal coverage | YES | "January 1976 - September 2025" (line 271) |
| Methodology overview | YES | Section "Methodology" (lines 284-309). Describes DuckDB processing, data steps |
| Link to detailed methodology | YES | Link to /methodology/#definitions (lines 306-308) |
| Limitations and caveats | **PARTIAL** | No dedicated limitations section on the About page. The methodology page has a full limitations section. The About page links to methodology but does not summarize limitations. |
| License / terms of use | **PARTIAL** | CC BY 4.0 is present in JSON-LD structured data (line 94) but **NOT visible** in the rendered page content. No visible license statement or terms of use section. |
| Contact information | YES | Email: saeroms@upenn.edu (line 206). Personal website link (line 201) |
| How to cite the website | YES | "Suggested Citation" section (lines 331-338): "Lee, Saerom (Ronnie). 2025. 'PatentWorld: 50 Years of US Patent Data.' The Wharton School, University of Pennsylvania." |
| Acknowledgments | **PARTIAL** | "AI-Assisted Development" section (lines 356-368) acknowledges Claude AI usage, but no broader acknowledgments (e.g., research assistants, funding, colleagues, PatentsView team) |

### 1.2 Missing Items

1. **No visible license/terms of use**: The CC BY 4.0 license is only in JSON-LD (structured data for search engines), not displayed to human readers. Recommend adding a visible "License" section stating the CC BY 4.0 terms.

2. **No standalone limitations section**: The About page does not summarize data limitations. Users must navigate to `/methodology/#limitations` to find them. Recommend at least a brief summary paragraph with a link.

3. **Incomplete acknowledgments**: Only Claude AI is acknowledged. Consider adding acknowledgments for PatentsView/USPTO, any funding sources, or collaborators.

### 1.3 Factual Claims Extracted (Track B Verification)

| # | Claim | Location | Status |
|---|-------|----------|--------|
| A1 | "9.36 million granted patents from 1976 to 2025" | line 257 | Consistent with constants.ts (9.36M) |
| A2 | "Annual grants increased from approximately 70,000 in 1976 to a peak of 393,000 (all types) in 2019" | FAQ line 37 | Needs cross-check with chapter 1 data |
| A3 | "IBM leads all organizations with 161,888 cumulative US patent grants" | FAQ line 41 | Needs cross-check with chapter 9 data |
| A4 | "Samsung (157,906) and Canon (88,742)" | FAQ line 41 | Needs cross-check with chapter 9 data |
| A5 | "top 100 firms collectively hold 32-39% of all corporate patents" | FAQ line 41 | Needs cross-check with chapter 9 data |
| A6 | "median time...peaked at 3.6 years (median) (1,317 days) in 2010" | FAQ line 44 | Needs cross-check with chapter 1 data |
| A7 | "2.4 years (875 days) in 2023" | FAQ line 44 | Needs cross-check with chapter 1 data |
| A8 | "CPC sections G and H...grown from 27%...to 57.3% by 2024" | FAQ line 48 | Needs cross-check with chapter 3 data |
| A9 | "AI patent grants grew 5.7-fold from 5,201 in 2012 to 29,624 in 2023, reaching 9.4% of all patent grants" | FAQ line 52 | Needs cross-check with chapter 25 data |
| A10 | "Women represent 14.9% of all US patent inventors as of 2025 (through September), up from 2.8% in 1976" | FAQ line 57 | Needs cross-check with chapter 16 data |
| A11 | "United States accounts for the largest share...Foreign-origin patents now constitute over 50% of all US grants" | FAQ line 61 | Needs cross-check with chapter 8/19 data |
| A12 | "Average 5-year forward citations peaked at 6.4 in 2019, up from 2.5 in 1976" | FAQ line 65 | Needs cross-check with chapter 2 data |
| A13 | "Average claims per patent rose from 9.4 to 16.6" | FAQ line 65 | Needs cross-check with chapter 2 data |
| A14 | "Originality increased from 0.09 to 0.25, while generality declined from 0.28 to 0.15" | FAQ line 65 | Needs cross-check with chapter 2 data |
| A15 | "The America Invents Act (AIA) of 2011 was the most consequential US patent reform since the 1952 Patent Act" | FAQ line 69 | External factual claim -- widely accepted characterization |
| A16 | "top 5% of inventors...account for 63.2% of all patents, with their annual share rising from 26% to 60%" | FAQ line 73 | Needs cross-check with chapter 13 data |
| A17 | "most prolific inventor, Shunpei Yamazaki, holds 6,709 US patents" | FAQ line 73 | Needs cross-check with chapter 13 data |
| A18 | "Raw data were...processed using DuckDB" | line 288 | Note: MEMORY.md says Polars was used. The methodology page (line 344) says "DuckDB...and Polars (Python)". The About page omits Polars. |
| A19 | "PatentsView bulk data download, accessed January 2025" | line 269 | Consistent across pages |
| A20 | "Saerom (Ronnie) Lee is an Assistant Professor of Management at The Wharton School" | lines 197-198 | External claim -- verify via saeromlee.com |

### 1.4 Structural / Design Notes

- **Table of Contents**: Present (6 items: Author, Chapters, Data, Methodology, FAQ, Citation). Well-organized.
- **JSON-LD**: Three structured data blocks (Dataset, FAQPage, BreadcrumbList). Well-formed.
- **Chapter listing**: Uses `CHAPTERS` and `ACT_GROUPINGS` from constants, rendering all 34 chapters across 6 acts dynamically. All links use `/chapters/${ch.slug}/` format.
- **FAQ section**: 10 questions with collapsible `<details>` elements.
- **Technical details**: Collapsible section mentioning Next.js 14, Recharts, Tailwind CSS, Claude AI.

### 1.5 Text Issue

- Line 216: "six acts" -- This is correct (there are 6 acts in ACT_GROUPINGS).
- Line 288: "processed using DuckDB, an analytical SQL database engine" -- This omits Polars. The methodology page correctly says "DuckDB...and Polars (Python)". The About page should match.

---

## 2. Explore Page Audit (section 1.18)

### 2.1 Page Purpose Mismatch

**IMPORTANT**: The Explore page (`/explore/`) is **NOT** a chapter listing page. It is an **interactive data browser** with four searchable/sortable tables:
- Organizations (top assignees)
- Inventors (top inventors)
- CPC Classes (technology classification summary)
- WIPO Fields (WIPO technology field summary)

The Explore page does **NOT** list the 34 chapters. Chapter listing is on the **About page** (section "Chapters") and the **home page**.

### 2.2 Data File Verification

The Explore page loads these JSON files via `useChapterData`:

| Tab | Data File | Exists? |
|-----|-----------|---------|
| Organizations | `explore/top_assignees_all.json` | YES |
| Inventors | `explore/top_inventors_all.json` | YES |
| CPC Classes | `explore/cpc_class_summary.json` | YES |
| WIPO Fields | `explore/wipo_field_summary.json` | YES |

All four data files are confirmed present in `/home/saerom/projects/patentworld/public/data/explore/`.

### 2.3 Functional Features

- Search bar with live filtering across all tabs
- Sortable column headers (ascending/descending/neutral toggle)
- Display limited to first 100 results with overflow message (Organizations tab)
- Loading skeleton states
- Responsive table layout (`overflow-x-auto`)
- Organization names cleaned via `cleanOrgName()` utility

### 2.4 Issues Found

1. **No metadata export**: The page is a client component (`'use client'`) so it cannot export Next.js `metadata`. This means no SEO title/description/OG tags for `/explore/`. This is a notable gap for a page linked in both the header and footer navigation.

2. **No chapter navigation**: The Explore page provides no way to browse or navigate to the 34 chapters. Users must use the home page or About page for chapter discovery.

3. **Inconsistent cap on results**: Only the Organizations tab shows a "Showing 100 of N results" overflow message. The Inventors tab also `.slice(0, 100)` but has no overflow message. CPC and WIPO tables render all results without slicing.

---

## 3. Chapter Listing Verification

Since the Explore page is not the chapter listing, verifying the chapter listing on the **About page** instead:

### 3.1 Act Organization (from constants.ts)

| Act | Title | Chapters | Count |
|-----|-------|----------|-------|
| 1 | The System | 1-7 | 7 |
| 2 | The Organizations | 8-12 | 5 |
| 3 | The Inventors | 13-17 | 5 |
| 4 | The Geography | 18-19 | 2 |
| 5 | The Mechanics | 20-22 | 3 |
| 6 | Deep Dives | 23-34 | 12 |
| **Total** | | | **34** |

Distribution: 7+5+5+2+3+12 = 34. **CORRECT.**

### 3.2 Chapter Slug Verification

All 34 chapters are dynamically rendered from the CHAPTERS constant. Each links to `/chapters/${slug}/`. The slugs are:

1. system-patent-count
2. system-patent-quality
3. system-patent-fields
4. system-convergence
5. system-language
6. system-patent-law
7. system-public-investment
8. org-composition
9. org-patent-count
10. org-patent-quality
11. org-patent-portfolio
12. org-company-profiles
13. inv-top-inventors
14. inv-generalist-specialist
15. inv-serial-new
16. inv-gender
17. inv-team-size
18. geo-domestic
19. geo-international
20. mech-organizations
21. mech-inventors
22. mech-geography
23. 3d-printing
24. agricultural-technology
25. ai-patents
26. autonomous-vehicles
27. biotechnology
28. blockchain
29. cybersecurity
30. digital-health
31. green-innovation
32. quantum-computing
33. semiconductors
34. space-technology

All 34 slugs are present and link correctly via Next.js `<Link>`.

---

## 4. Methodology Page Audit

### 4.1 Content Summary

The methodology page (`/methodology/page.tsx`) is a comprehensive data dictionary containing:

| Section | Content |
|---------|---------|
| Patent Universe | Defines 9.36M all-type and ~8.45M utility-only universes |
| Temporal Coverage | Jan 1976 - Sep 2025; grant year vs. filing year distinction; 2025 partial year caveat |
| Geography Basis | Inventor country vs. assignee country; fractional vs. whole counting |
| Field Classification | CPC sections (A-H, Y), WIPO sectors, NMF topic model, Act 6 domain definitions (green patents, AI patents) |
| Data Processing | DuckDB + Polars pipeline, counting conventions (sequence=0), filing route, gender inference |
| Metric Definitions | 6 subsections: Citation Metrics (6 defs), Quality & Scope (7 defs), Diversity & Concentration (6 defs), Innovation Strategy (4 defs), Standard Quality Suite |
| Disambiguation Reliability | Splitting errors, lumping errors, assignee disambiguation challenges |
| Data Limitations | 8 explicit limitations (granted-only, US-only, citation truncation, disambiguation, CPC changes, gender inference, partial 2025, assignee coverage) |
| Data Source | PatentsView attribution, key table list with record counts |

### 4.2 Assessment

- **Thorough**: The methodology page is exceptionally comprehensive, covering 23+ metric definitions with formulas, 8 data limitations, and detailed disambiguation discussion.
- **Well-linked**: Cross-references to specific chapters (domestic geography, international geography, organizational composition, etc.)
- **JSON-LD**: Three structured data blocks (TechArticle, BreadcrumbList, DataCatalog).
- **SEO**: Full metadata (title, description, OG, Twitter, canonical URL, robots).

### 4.3 Factual Claims in Methodology Page (Track B)

| # | Claim | Location |
|---|-------|----------|
| M1 | "9.36 million patents granted by the USPTO" | line 143 |
| M2 | "~8.45 million utility patents" | line 159 |
| M3 | "~910,000 non-utility patents, predominantly design" | line 161 |
| M4 | "January 1976 through September 2025" | line 169 |
| M5 | "CPC was formally introduced in 2013" | line 257 |
| M6 | "35 technology fields across 5 sectors" (WIPO) | line 289 |
| M7 | "team size...1.8 inventors per patent in 1976 to 3.2 in 2024" | line 431 |
| M8 | "US DOJ/FTC 2010 Horizontal Merger Guidelines: <1500 unconcentrated, 1500-2500 moderate, >2500 highly concentrated" | line 465 |
| M9 | Bulk data accessed "January 2025" | line 575 |

---

## 5. FAQ Page Audit

**Result:** No standalone FAQ page exists (`/faq/page.tsx` not found). FAQ content is embedded within the About page as a collapsible accordion section with 10 questions. This is acceptable but means there is no dedicated `/faq/` URL.

---

## 6. 404 Page Audit

**Result:** No custom 404 page exists (`src/app/not-found.tsx` not found). Next.js will render its default 404 page. Recommend creating a custom not-found page with navigation back to the home page and chapter listing.

---

## 7. Summary of Issues

### Critical Issues
(None)

### High Priority

| # | Issue | Page | Recommendation |
|---|-------|------|----------------|
| H1 | No visible license/terms of use | About | Add visible "License" section showing CC BY 4.0 terms |
| H2 | No SEO metadata on Explore page | Explore | Extract metadata to a layout.tsx or use generateMetadata in a server wrapper |
| H3 | No custom 404 page | Global | Create `src/app/not-found.tsx` with site navigation |

### Medium Priority

| # | Issue | Page | Recommendation |
|---|-------|------|----------------|
| M1 | About page omits Polars from methodology description | About | Line 288: Change "DuckDB" to "DuckDB and Polars (Python)" to match methodology page |
| M2 | No limitations summary on About page | About | Add brief limitation summary or prominent link to methodology limitations |
| M3 | Inconsistent overflow messaging in Explore tables | Explore | Add overflow message to Inventors tab (also slices to 100) |
| M4 | No acknowledgments beyond Claude AI | About | Consider adding PatentsView/USPTO team, funding sources |

### Low Priority

| # | Issue | Page | Recommendation |
|---|-------|------|----------------|
| L1 | No standalone /faq/ route | Global | Consider adding redirect or standalone FAQ page for SEO |
| L2 | Explore page has no chapter navigation | Explore | Consider adding a "Browse Chapters" link or tab |
| L3 | FAQ claim about "3.6 years (median) (1,317 days)" has redundant "(median)" after already saying "median time" | About FAQ | Clean up phrasing: "peaked at 3.6 years (1,317 days)" |

---

## 8. Cross-Page Consistency Check

| Data Point | About Page | Methodology Page | Footer | Constants |
|------------|-----------|-----------------|--------|-----------|
| Total patents | 9.36M | 9.36M | -- | 9.36M |
| Coverage period | 1976-2025 | Jan 1976 - Sep 2025 | 1976-Sep 2025 | 1976-2025 |
| Data access date | Jan 2025 | Jan 2025 | Jan 2025 | -- |
| Data source | PatentsView/USPTO | PatentsView/USPTO | PatentsView/USPTO | -- |
| Processing tool | DuckDB only | DuckDB + Polars | -- | -- |
| Chapter count | dynamic (CHAPTERS.length) | -- | -- | 34 |
| Act count | "six acts" | -- | -- | 6 |

**Inconsistency found:** About page says "DuckDB" (line 288); methodology page says "DuckDB...and Polars" (line 344). The About page should include Polars.
