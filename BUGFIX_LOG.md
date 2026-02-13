# PatentWorld — Bug Fix Log

## Build Errors & Warnings (Work Stream 6.2)

### Fixed: All ESLint unused variable warnings (14 warnings → 0)

| File | Variable | Fix |
|------|----------|-----|
| `ai-patents/page.tsx:51` | `asL` loading unused | Removed `loading: asL` from destructuring |
| `patent-quality/page.tsx:36` | `sbL` loading unused | Removed `loading: sbL` from destructuring |
| `patent-quality/page.tsx:39` | `scsL` loading unused | Removed `loading: scsL` from destructuring |
| `the-geography-of-innovation/page.tsx:53` | `diffL` loading unused | Removed `loading: diffL` from destructuring |
| `the-geography-of-innovation/page.tsx:54` | `rsL` loading unused | Removed `loading: rsL` from destructuring |
| `the-inventors/page.tsx:67` | `soloBySection` data unused | Removed data destructuring (kept hook call for prefetch) |
| `the-inventors/page.tsx:67` | `sbsL` loading unused | Removed with data destructuring |
| `the-inventors/page.tsx:69` | `mobL` loading unused | Removed `loading: mobL` from destructuring |
| `the-inventors/page.tsx:71` | `genderByTech` data unused | Removed data destructuring (kept hook call for prefetch) |
| `the-inventors/page.tsx:71` | `gbtL` loading unused | Removed with data destructuring |
| `the-inventors/page.tsx:72` | `gtqL` loading unused | Removed `loading: gtqL` from destructuring |
| `the-technology-revolution/page.tsx:50` | `hlL` loading unused | Removed `loading: hlL` from destructuring |
| `who-innovates/page.tsx:57` | `biL` loading unused | Removed `loading: biL` from destructuring |

**Result**: `npm run build` completes with zero errors, zero warnings. All 22 pages generated successfully.

---

## Chapter Reordering (Work Stream 3)

### Fixed: Chapter number swap (AI ↔ Green Innovation)

- AI Patents: Chapter 11 → Chapter 12
- Green Innovation: Chapter 12 → Chapter 11
- Updated `constants.ts` CHAPTERS array ordering and relatedChapters references
- Updated `ChapterHeader` gradient colors for chapters 11 and 12
- Updated `currentChapter` props in `ai-patents/page.tsx` (11→12)
- Updated `currentChapter` props in `green-innovation/page.tsx` (12→11)
- Updated `relatedChapters` for chapters 7, 10, 11, 12, 13 to reflect new numbering

---

## Hero Stats (Work Stream 1)

### Fixed: Visualization count outdated

- **Old value**: 64 visualizations
- **New value**: 120 visualizations (121 ChartContainer instances + 16 standalone tables)
- Updated `HERO_STATS.visualizations` in `constants.ts`

---

## SEO & Accessibility (Work Stream 5)

### Fixed: robots.txt missing AI crawlers
- Added `Bytespider` and `CCBot` to allowed crawlers in `robots.ts`

### Fixed: Author metadata
- Updated `layout.tsx` authors from `PatentWorld` to `Saerom (Ronnie) Lee`

### Fixed: SEO dateModified
- Updated `seo.ts` dateModified from `2025-06-01` to `2025-12-01`

### Fixed: WebSite JSON-LD missing author
- Added `author` field (Saerom Lee, Wharton) to WebSite JSON-LD in `layout.tsx`

### Fixed: About page missing chapter links
- Added "Explore the Chapters" section with links to all 14 chapters
- Satisfies internal linking requirement (about page → all chapters)

---

## Visualization Improvements (Work Stream 2)

### Fixed: PWScatterChart axis formatting
- Added `formatCompact` tick formatting to X and Y axes
- Added axis label props (`xFormatter`, `yFormatter`) for custom formatting
- Added `label` to both axes for visible axis names
- Improved tooltip to format numeric values with `toLocaleString()`

### Fixed: PWRankHeatmap hover tooltips
- Added floating tooltip on cell hover showing full org name, year, and rank
- Tooltip follows cursor position relative to container
- Cleared on mouse leave

---

## Accessibility (Work Stream 5/6)

### Fixed: Chart accessibility
- Added `ariaLabel` prop to `ChartContainer` (falls back to `title`)
- Added `role="img"` and `aria-label` to `PWChordDiagram`, `PWSankeyDiagram`, `PWNetworkGraph`
- Added `<figcaption>` rendering within `ChartContainer` for chart captions

### Fixed: FAQ expanded for GEO
- Expanded FAQ from 5 to 10 questions covering grant lag, fastest-growing areas, AI patenting, gender gap, and top countries
- All answers include specific numbers from the data

### Added: TL;DR summaries to all 14 chapters
- Each chapter now has a visually distinct `<aside>` block after KeyFindings
- Contains 2-3 fact-dense sentences with specific numbers
- Optimized for LLM extraction (GEO)

### Added: Chapter transition paragraphs
- All 14 chapters now have transition text connecting to the next chapter
- Chapter 14 has a closing paragraph concluding the PatentWorld exploration
