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

### Remaining Items (Cannot Verify Without Browser)

- Responsive layout at 375px/768px/1440px (code uses Tailwind responsive classes consistently)
- Tooltip overflow on mobile (tooltips use absolute positioning with container-relative coordinates)
- Touch target sizes for interactive elements
- Header nav hidden on mobile (`hidden md:flex`) — Explore/About accessible via footer links
