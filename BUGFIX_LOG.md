# PatentWorld — Bug Fix Log (Stream 1)

## 1.1 Build & Compilation

**Result**: `npm run build` completes with zero errors, zero warnings. All 22 routes (14 chapters + home + about + explore + robots + sitemap + _not-found) generated successfully as static content.

## 1.2 Runtime Errors Fixed

### Fixed: company-profiles page crash — trajectory_archetypes.json wrapper object
- **File**: `src/app/chapters/company-profiles/page.tsx`
- **Issue**: Pipeline outputs `{year_min, year_max, companies: [...]}` but page expected flat `TrajectoryArchetype[]`
- **Fix**: Added `useMemo` to extract `.companies` from wrapper, with fallback for flat arrays

### Fixed: company-profiles page crash — continuous_companies data mismatch
- **File**: `src/app/chapters/company-profiles/page.tsx`
- **Issue**: `continuous_companies` is array of objects `{company, raw_name, decades}` but rendered as React children (strings), causing "Objects are not valid as a React child" crash
- **Fix**: Added `continuousNames` useMemo extracting `.company` from each object

### Fixed: company-profiles page — survival_rates data mismatch
- **File**: `src/app/chapters/company-profiles/page.tsx`
- **Issue**: `survival_rates` is array of transition objects `{from_decade, to_decade, survival_rate}` but page used `Object.entries()` expecting `Record<string, number>`, displaying "NaN%"
- **Fix**: Now reads `.from_decade`, `.to_decade`, `.survival_rate` fields directly

### Fixed: company-profiles page — infinite loop in PWRankHeatmap
- **File**: `src/app/chapters/company-profiles/page.tsx`
- **Issue**: Passed decade strings (`"1976-85"`) as `yearKey` to `PWRankHeatmap`. The component's `for (y = minYear; y <= maxYear; y += yearInterval)` loop did string concatenation (`"1976-85" + 5 = "1976-855"`), creating an infinite loop that froze the browser
- **Fix**: Changed to numeric `start_year` values with `yearInterval={10}`, `maxRank={50}`

## 1.3 Navigation & Links

- All 14 chapter pages have correct `currentChapter` prop matching CHAPTERS array
- `ChapterNavigation` correctly links prev/next using `c.number === currentChapter ± 1`
- Chapter 14 (last) shows "Explore the Data" as next destination
- All external links (`saeromlee.com`, `patentsview.org`, `claude.ai`, `mailto:saeroms@upenn.edu`) use `target="_blank"` and `rel="noopener noreferrer"`
- Home page chapter grid renders all 14 chapters from CHAPTERS constant

## 1.4 Hero Stats Verified

| Stat | Displayed | Verified Value | Status |
|------|-----------|----------------|--------|
| Patents | 9.36M | 9,361,444 (hero_stats.json) | ✅ Correct |
| Years | 50 | 1976–2025 (50 years in data) | ✅ Correct |
| Chapters | 14 | 14 entries in CHAPTERS array | ✅ Correct |
| Visualizations | 120→121 | 121 `<ChartContainer` instances | ✅ Updated |

## 1.5 Data Integrity

- All 130 JSON data files parse successfully (no invalid JSON, no empty arrays/objects)
- All chapter data directories contain expected files
- ChapterHeader gradient colors defined for all 14 chapters
- All chart components properly guard against null/undefined data with early returns

## 1.6 Re-Audit (2026-02-13)

Build and lint re-verified after all previous fixes:
- `npx next build`: PASS — zero errors, zero warnings, 22/22 pages generated
- `npx next lint`: PASS — no ESLint warnings or errors
- All 14 chapter `currentChapter` props verified correct
- All 121 `<ChartContainer>` instances confirmed (matches HERO_STATS.visualizations)
- OG images: all 15 present in `public/og/` (home + 14 chapters)
- robots.ts and sitemap.ts properly configured
- hero_stats.json: 9,361,444 total, peak 2019 (392,618) — all verified against raw data

## 1.7 Session 2 Re-Audit (2026-02-14)

### Chart Title Fixes (77 titles updated with verified numbers)

All 128 chart titles audited. 77 titles lacked specific numbers and were updated with data-verified values:

| Chapter | Titles Fixed | Examples |
|---------|:---:|---------|
| Ch 2 (Technology Revolution) | 3 | "Technology Diversity Declined from 0.848 in 1984 to 0.777 in 2009" |
| Ch 3 (Who Innovates?) | 3 | Dynamic `${selectedQualityFirm}` titles fixed (were hardcoded "Amazon") |
| Ch 4 (Inventors) | 14 | "The Top 5% of Inventors Grew from 26% to 60% of Annual Patent Output" |
| Ch 5 (Geography) | 8 | "California's 992,708 Patents Exceeding the Bottom 30 States Combined (314,664)" |
| Ch 6 (Collaboration Networks) | 2 | "US-China Co-Invention Grew from 77 Patents in 2000 to 2,749 in 2024" |
| Ch 7 (Knowledge Network) | 7 | "Average Backward Citations Per Patent Rose From 4.9 in 1976 to 21.3 in 2023" |
| Ch 8 (Innovation Dynamics) | 8 | "Multi-Section Patents Rose from 21% to 41% of All Grants (1976-2020)" |
| Ch 9 (Patent Quality) | 4 | "Canon (47.6%), TSMC (38.4%), and Micron (25.3%) Exhibit the Highest Self-Citation Rates" |
| Ch 10 (Patent Law) | 2 | "G-H Convergence Pair Rose from 12.5% to 37.5% Between 1976-1995 and 2011-2025" |
| Ch 11 (AI Patents) | 8 | "AI Patent Filings Grew from 5,201 in 2012 to 29,624 in 2023, a 5.7x Increase" |
| Ch 12 (Green Innovation) | 5 | "Green-AI Patents Grew 30-Fold From 41 in 2010 to 1,238 in 2023" |
| Ch 13 (Language of Innovation) | 3 | "Patent Novelty Rose 6.4% From 1976 to 2025 (Median Entropy 1.97 to 2.10)" |
| Ch 14 (Company Profiles) | 10 | "Only 9 of 50 Top Patent Filers Survived All 5 Decades, an 18% Cumulative Survival Rate" |
| **Total** | **77** | |

### Executive Summary Deduplication (14 chapters)

All 14 chapter Executive Summaries rewritten to not duplicate Key Findings. Each Executive Summary now provides:
- Interpretive synthesis of the chapter's findings
- Cross-chapter connections and broader context
- Paraphrased references to Key Findings (never verbatim)

### About Page Citation Fix

- Changed: `Lee, Saerom (Ronnie). 2025. "PatentWorld: 50 Years of US Patent Innovation."` → `Lee, Saerom. 2025. "PatentWorld: 50 Years of US Patent Data."`

### Section Heading Fix

- Chapter 8: `"Does Exploration Pay Off?"` → `"Returns to Technological Exploration"` (rhetorical question replaced with descriptive noun phrase)

### Company Profiles Factual Fix

- Fixed Samsung/Hitachi highest diversity claim → Mitsubishi Electric leads (verified against data)

### Build Verification

- `npx next build`: PASS — zero errors, zero warnings, 23 pages generated
- All 128 chart titles now contain specific verified numbers
- All 128 chart captions confirmed present with specific numbers

### Remaining Items (Cannot Verify Without Browser)

- Responsive layout at 375px/768px/1440px (code uses Tailwind responsive classes consistently)
- Tooltip overflow on mobile (tooltips use absolute positioning with container-relative coordinates)
- Touch target sizes for interactive elements
- Header nav hidden on mobile (`hidden md:flex`) — Explore/About accessible via footer and mobile hamburger menu
