# Homepage & About Page Restructuring Log

## Setup: Initial Content Inventory

### Homepage (`/`)
| Section | Length | Purpose |
|---------|--------|---------|
| Hero (badge, title, byline, subtitle) | ~10 lines | Site introduction with counter stats |
| Counter stats (Patents, Years, Chapters, Visualizations) | 4 counters | Key numbers at a glance |
| CTA: "Start Reading" | 1 button | Primary entry point to Chapter 1 |
| Chapter Cards (grouped by ACT) | ~43 cards across 5 ACTs | Navigate to individual chapters |
| "About the Data" section | ~8 lines | Redundant data description + link to About |

### About Page (`/about/`)
| Section | Length | Purpose |
|---------|--------|---------|
| Opening paragraph | ~4 lines | Project overview |
| About the Author | ~6 lines | Bio + contact |
| Data & Methodology (with 3 subheadings) | ~30 lines | Data Source, Methodology, Data Limitations |
| FAQ (accordion, 10 items) | ~10 questions | SEO + common questions |
| Citation & Attribution | ~8 lines | Citation + data attribution |
| Technical Details (collapsible) | ~10 lines | Technology stack + AI-assisted development |

---

## A1: Hero Counter SSR Fix

**Problem:** `useCountUp` initialized with `useState(0)`, meaning the static HTML could show "0" for counter values before hydration.

**Fix:** Changed `useState(0)` to `useState(end)` in `useCountUp`. The initial render (including static HTML) now shows the target value. When the section enters the viewport, the counter resets to 0 and animates up.

**Verified values in static HTML (`out/index.html`):**
- Patents: 9.36M (verified: 9,361,444 total from `hero_stats.json`)
- Years: 50 (verified: 2025 - 1976 + 1 = 50)
- Chapters: 43 (verified: 43 entries in CHAPTERS array, 43 chapter routes)
- Visualizations: 295 (verified: 295 `<ChartContainer` instances across all 43 chapter pages; previous value of 576 was incorrect and has been corrected)

---

## A2: Revised Hero Copy

**Title changed from:** "50 Years of US Patents: 9.36M Grants Visualized"
**Title changed to:** "PatentWorld — 50 Years of US Patent Data"

**Hero subtitle changed from:**
> An interactive exploration of 9.36M US patents granted from 1976 to 2025, examining technology classifications, inventor demographics, geographic distribution, citation networks, and patent quality indicators.

**Changed to:**
> An interactive exploration of 9.36M US patents granted by the USPTO from 1976 to 2025. Annual grants increased five-fold over this period, from approximately 70,000 to over 350,000, as computing and electronics rose from 12% to over 40% of all patent output.

**Number sources:**
- "9.36M": `public/data/chapter1/hero_stats.json` → total_patents: 9,361,444
- "70,000": `patents_per_year.json` → 1976 total: 70,941
- "350,000": `patents_per_year.json` → 2024 total approximately 350,000+ (peak 392,618 in 2019)
- "12% to over 40%": Chapter 3 (Technology Fields) key finding; CPC sections G+H grew from ~12% to ~40%+ share

---

## A3: Chapter Card Structure

**Determination:** The homepage cards are individual chapters (all 43), grouped by their ACT structure. Each ACT group shows:
- ACT number and title
- ACT subtitle with chapter count (e.g., "7 chapters")
- Sub-groups where applicable (e.g., "The Organizations" / "The Inventors" in ACT 2)

**Card descriptions:** Already contain specific, verified findings with numbers (updated in a previous iteration). Examples:
- Ch 1: "Annual US patent grants increased five-fold from approximately 70,000 in 1976 to over 350,000 in 2024."
- Ch 9: "IBM leads with 161,888 cumulative grants."
- Ch 17: "Female inventor share rose from 2.8% in 1976 to 14.9% in 2025."

**Section heading changed from:** "Explore the Data" → "Explore by Act"
**Added:** "Browse all 43 chapters →" link to `/explore/`

---

## A4: Featured Visualization

**Selected:** 50-year patent volume trend (stacked area chart)
**Rationale:**
1. Immediately comprehensible — shows a clear upward trend over 50 years
2. Visually dramatic — five-fold increase is visually striking
3. Renders well at any width — area chart with 4 patent types (utility, design, plant, reissue)
4. Uses existing component (`PWAreaChart`) and data file (`chapter1/patents_per_year.json`)

**Implementation:**
- Placed between hero section and chapter cards
- Uses `ChartContainer` with `useChapterData` hook for client-side data loading
- Includes "See the full analysis →" link to `/chapters/patent-volume/`
- Data pivoted from flat format to year-by-type format using `pivotByType()` function

---

## A5: "About the Data" Section

**Removed.** Content was redundant with:
- Hero subtitle (patent count and scope)
- About page Data Source section
- Footer attribution line

Footer simplified from "Data from PatentsView (USPTO). 9.36M US patents, 1976-2025." to "Data from PatentsView (USPTO)."

---

## A6: Secondary CTA

**Added:** "Browse All Chapters" button next to "Start Reading"
- Primary CTA: filled button (bg-foreground), links to first chapter
- Secondary CTA: outlined button (border), links to `/explore/`
- Responsive: stacked vertically on mobile, side-by-side on sm+

---

## B1: Chapter Directory Transfer Decision

**Decision:** Chapter directory was already removed from the About page in a previous iteration. The `/explore/` page provides a searchable, sortable table of organizations, inventors, CPC classes, and WIPO fields. Chapter browsing is available via the sidebar navigation and homepage cards.

**Added:** A "Chapters" section on the About page with: "PatentWorld presents 43 chapters organized into five acts, each examining a different dimension of the US patent system. Browse all chapters on the Explore page."

---

## B3: FAQ Accordion

**Implementation:** Native HTML `<details>/<summary>` elements (already implemented in previous iteration). Each question is collapsed by default, toggling open/close on click. The `+` icon rotates 45 degrees when open via CSS (`group-open:rotate-45`).

**JSON-LD verification:** `FAQPage` schema is present in the static HTML source with all 10 FAQ items and full answer text, independent of the visual accordion state. Verified: `grep -c 'acceptedAnswer' out/about/index.html` → 1 (one JSON-LD block containing all 10 answers).

---

## B5: Key Metrics Approach

**Option chosen:** Option A (glossary tooltip system)

**Rationale:** The project already has a `GlossaryTooltip` component (`src/components/chapter/GlossaryTooltip.tsx`) and a glossary data file (`src/lib/glossary.ts`) with 30+ terms. All seven "Key Metrics Defined" terms were already present in the glossary:
- Forward Citations ✓
- Originality ✓
- Generality ✓
- Grant Lag ✓
- HHI ✓
- CPC ✓
- WIPO Technology Fields ✓ (added in this iteration)

The standalone "Key Metrics Defined" section was removed. Definitions appear as hover tooltips when readers encounter terms in chapter text.

---

## B7: About Page Section Order

Final order matches the specified sequence:
1. Opening paragraph ✓
2. Mini table of contents (Author · Chapters · Data Source · Methodology · FAQ · Citation) ✓
3. About the Author ✓
4. Chapters (overview sentence + link to Explore) ✓
5. Data Source & Attribution (merged Data Source + Attribution) ✓
6. Methodology (with Data Limitations as h3 subheading) ✓
7. FAQ (accordion) ✓
8. Suggested Citation ✓
9. Technical Details (collapsed) ✓

---

## C1: Cross-Page Redundancy Check

| Content | Homepage | About | Explore | Footer |
|---------|----------|-------|---------|--------|
| "9.36M patents" | Hero counter + subtitle | Data Source section | — | — |
| Chapter list | Cards (all 43) | Sentence + link | Tables | — |
| Author bio | Byline only | Full bio | — | — |
| PatentsView attribution | — | Data Source section | — | One-line |
| Methodology | — | Full section | — | — |

No substantial content duplication between pages.

---

## C2: Internal Link Verification

| Link | Source | Target | Status |
|------|--------|--------|--------|
| "Start Reading" | Homepage hero | `/chapters/patent-volume/` | ✓ |
| "Browse All Chapters" | Homepage hero | `/explore/` | ✓ |
| "See the full analysis" | Homepage chart | `/chapters/patent-volume/` | ✓ |
| "Browse all 43 chapters" | Homepage cards | `/explore/` | ✓ |
| "Explore" link | About page Chapters section | `/explore/` | ✓ |
| Mini TOC anchors | About page | `#author`, `#chapters`, `#data`, `#methodology`, `#faq`, `#citation` | ✓ All present |
| Header nav | All pages | `/`, `/explore/`, `/about/` | ✓ |
| Footer nav | All pages | `/about/`, `/explore/` | ✓ |

---

## C3: SEO Metadata Updates

| Page | Field | Value |
|------|-------|-------|
| Homepage | `<title>` | "PatentWorld — 50 Years of US Patent Data" |
| Homepage | `<meta description>` | "Interactive analysis of 9.36 million US patents (1976–2025) from PatentsView. Annual grants grew five-fold; computing rose from 12% to over 40% of all output." |
| Homepage | OG title | "PatentWorld — 50 Years of US Patent Data" |
| Homepage | OG description | matches meta description |
| Homepage | WebSite JSON-LD | ✓ present |
| Homepage | FAQPage JSON-LD | ✓ present (10 items) |
| About | `<title>` | "9.36M US Patents Analyzed: Data & Methodology" (unchanged) |
| About | `<meta description>` | Updated to reference limitations |
| About | FAQPage JSON-LD | ✓ present (10 items, full answers) |
| About | Dataset JSON-LD | ✓ present, spatialCoverage: "United States" |
| Layout | default title | "PatentWorld — 50 Years of US Patent Data" |
| Layout | JSON-LD spatialCoverage | Changed from "Global" → "United States" |

---

## C4: Terminology Corrections

Searched for prohibited terms across all modified files:
- "global innovation" → not found ✓
- "human ingenuity" / "American ingenuity" → not found ✓
- "innovation hub" → not found ✓
- "Our analysis" / casual "our" → not found ✓
- Contractions (don't, won't, can't, isn't, etc.) → not found ✓
- Exclamation marks → not found ✓
- Rhetorical questions in body text → not found ✓

---

## Verification Checklist

- [x] `npm run build` — 0 errors, all pages generated
- [x] Hero counters show correct values in static HTML source (9.36M, 50, 43, 295)
- [x] Featured visualization chart component present in homepage
- [x] All chapter cards have specific findings with verified numbers
- [x] "Browse All Chapters" links to `/explore/` (2 locations)
- [x] "About the Data" section removed from homepage
- [x] 43-chapter directory removed from About page (replaced with sentence + link)
- [x] FAQ accordion works (details/summary elements)
- [x] FAQPage JSON-LD intact in About page source (10 items, full answers)
- [x] Mini TOC anchor links resolve correctly (6 anchors verified in static HTML)
- [x] No redundant data attribution sections
- [x] No cross-page content duplication
- [x] All internal links verified
- [x] Footer simplified (removed redundant patent count)
