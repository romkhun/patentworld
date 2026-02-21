# SEO, GenAI-Readiness, Navigation & Link Audit

**Date:** 2026-02-21
**Scope:** PatentWorld at `/home/saerom/projects/patentworld`

---

## 1. SEO Audit (1.14)

### 1.1 Metadata Generation

**File:** `/home/saerom/projects/patentworld/src/lib/seo.ts`

- `chapterMetadata(slug)` generates per-chapter `Metadata` objects with:
  - Insight-oriented `<title>` tags (under 60 chars) via `CHAPTER_SEO_TITLES` -- all 34 chapters covered
  - Custom meta descriptions (under 160 chars) via `CHAPTER_SEO_DESCRIPTIONS` -- all 34 chapters covered
  - Per-chapter keyword arrays via `CHAPTER_KEYWORDS` -- all 34 chapters covered
  - Base keywords `['patents', 'innovation', 'USPTO', 'patent data']` prepended to every chapter
  - OpenGraph type `article`, with title, description, URL, siteName, and image
  - Twitter `summary_large_image` card with title, description, and image
  - Canonical URL via `alternates.canonical`

- `chapterJsonLd(slug)` generates two JSON-LD schemas per chapter:
  - `ScholarlyArticle` with author, publisher, dates, keywords, Dataset `about` block
  - `BreadcrumbList` with Home > Act > Chapter hierarchy

**Verdict:** PASS -- Comprehensive and well-structured.

### 1.2 Root Layout Metadata

**File:** `/home/saerom/projects/patentworld/src/app/layout.tsx`

- Title template: `%s | PatentWorld` (default: `PatentWorld -- 50 Years of US Patent Data`)
- Root description: present, data-driven
- Keywords: 12 root keywords
- Authors: `[{ name: 'Saerom (Ronnie) Lee', url: 'https://www.saeromlee.com' }]`
- OpenGraph: type `website`, title, description, siteName, URL, 1200x630 image with alt text
- Twitter: `summary_large_image`, title, description, image
- Robots: `index: true, follow: true`, googleBot with `max-snippet: -1`, `max-image-preview: large`
- Canonical: `https://patentworld.vercel.app`
- `lang="en"` on `<html>` tag
- Google Site Verification meta tag present
- Bing Webmaster meta tag present
- WebSite JSON-LD with full CHAPTERS array as `hasPart`
- Home-level BreadcrumbList JSON-LD

**Verdict:** PASS -- Thorough root-level SEO.

### 1.3 Per-Page Metadata (Non-Chapter)

All major pages export their own `Metadata` objects:

| Page | Title | OG | Twitter | Canonical | JSON-LD |
|------|-------|----|---------|-----------|---------|
| `/` (page.tsx) | Yes | Yes | Yes | Yes | FAQPage (10 Q&As) |
| `/explore/` (layout.tsx) | Yes | Yes | Yes | Yes | BreadcrumbList |
| `/methodology/` (page.tsx) | Yes | Yes | Yes | Yes | (not checked separately) |
| `/about/` (page.tsx) | Yes | Yes | Yes | Yes | (not checked separately) |
| `/faq/` (page.tsx) | Yes | Yes | Yes | Yes | (not checked separately) |
| `/chapters/deep-dive-overview/` | Yes | Yes | Yes | Yes | ScholarlyArticle + BreadcrumbList |

**Verdict:** PASS -- All pages have full metadata.

### 1.4 Per-Chapter Metadata

All 34 chapter directories have a `layout.tsx` that:
1. Calls `chapterMetadata(SLUG)` to export metadata
2. Calls `chapterJsonLd(SLUG)` and renders via `<JsonLd>` component

Confirmed for all 34 slugs. Pattern is identical across all chapters.

**Verdict:** PASS

### 1.5 Structured Data (JSON-LD)

**File:** `/home/saerom/projects/patentworld/src/components/JsonLd.tsx`

- Clean component rendering `<script type="application/ld+json">`
- Used consistently across:
  - Root layout (WebSite + BreadcrumbList)
  - Homepage (FAQPage with 10 Q&As)
  - All 34 chapter layouts (ScholarlyArticle + BreadcrumbList)
  - Explore layout (BreadcrumbList)
  - Deep-dive overview layout (ScholarlyArticle + BreadcrumbList)
- ScholarlyArticle schemas include `author`, `publisher`, `datePublished`, `dateModified`, `about` (Dataset)
- `article` itemScope/itemType also set on the chapter `<article>` wrapper in `src/app/chapters/layout.tsx`

**Verdict:** PASS -- Excellent structured data coverage.

### 1.6 Heading Hierarchy

- Each page has exactly one `<h1>`:
  - Homepage: `PatentWorld` (in HomeContent.tsx)
  - Chapter pages: chapter title (in ChapterHeader.tsx via `<h1>`)
  - Methodology: `Data Dictionary & Methodology`
  - About: `About PatentWorld`
  - FAQ: custom heading
  - Explore: `Explore`
  - Deep-dive overview: custom heading

- `<h2>` used across 42 files for section headings within chapters (via `data-section-label` for TOC)
- `<h3>` used in 16 files for sub-section headings
- KeyFindings uses `<h2>` ("Key Findings")
- InsightRecap uses `<h3>` ("Chapter Recap") and `<h4>` for subsections
- RelatedChapters uses `<h2>` ("Related Chapters")
- ChapterTableOfContents uses `<h2>` ("In this chapter")

**Verdict:** PASS -- Clean hierarchy with single `<h1>` per page and logical nesting.

### 1.7 Robots & Sitemap

**Dynamic robots.ts** (`/home/saerom/projects/patentworld/src/app/robots.ts`):
- Allows all user agents (`*`)
- Explicit allow rules for: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, CCBot
- Points to sitemap at `https://patentworld.vercel.app/sitemap.xml`

**Static robots.txt** (`/home/saerom/projects/patentworld/public/robots.txt`):
- Simple `Allow: /` with sitemap link
- Note: The dynamic `robots.ts` will take precedence in the Next.js build; the static file may cause conflict or be ignored. **Potential issue**: having both could result in two robots.txt outputs.

**Dynamic sitemap.ts** (`/home/saerom/projects/patentworld/src/app/sitemap.ts`):
- Includes: `/`, `/methodology/`, `/about/`, `/explore/`, `/faq/`, `/chapters/deep-dive-overview/`
- All 34 chapters auto-generated from CHAPTERS array
- `lastModified` derived from git commit dates
- Priority: 1.0 (home), 0.8 (chapters), 0.6 (methodology, explore), 0.5 (about, faq), 0.7 (deep-dive overview)
- `changeFrequency: 'monthly'` for all

**Verdict:** PASS with one minor concern about dual robots.txt files.

### 1.8 Favicon

**Status: MISSING**

- No `favicon.ico`, `favicon.svg`, `favicon.png` in `public/`
- No `icon.tsx`, `icon.png`, `apple-icon.png` in `src/app/`
- No `apple-touch-icon.png` anywhere
- No `<link rel="icon">` in layout.tsx head

**Verdict:** FAIL -- No favicon configured. Browsers will show a generic icon. This affects brand recognition and perceived professionalism.

**Recommendation:** Add at minimum:
- `public/favicon.ico` (16x16 / 32x32)
- `public/apple-touch-icon.png` (180x180)
- Optionally `src/app/icon.tsx` for dynamic SVG favicon

### 1.9 OG Images

**Existing images in `public/og/`** (15 files):
```
ai-patents.png, collaboration-networks.png, company-profiles.png,
green-innovation.png, home.png, innovation-dynamics.png, patent-law.png,
patent-quality.png, the-geography-of-innovation.png, the-innovation-landscape.png,
the-inventors.png, the-knowledge-network.png, the-language-of-innovation.png,
the-technology-revolution.png, who-innovates.png
```

**Chapter OG references:** Each chapter's metadata references `${BASE_URL}/og/${ch.slug}.png`, e.g. `og/system-patent-count.png`, `og/inv-gender.png`, etc.

**Gap Analysis:** The 15 existing OG images appear to be from an earlier site structure. The current 34 chapters reference slug-based filenames (`og/system-patent-count.png`, `og/org-composition.png`, etc.) that **do not exist**.

Additionally, `og/deep-dive-overview.png` is referenced but does not exist.

**Verdict:** FAIL -- 34 out of 35 chapter OG images are missing (only `og/ai-patents.png` and `og/green-innovation.png` match by name). Social sharing will show no preview image for most chapters.

**Recommendation:** Generate OG images for all 34 chapter slugs plus `deep-dive-overview`. Consider using Next.js `ImageResponse` API or a build script.

---

## 2. GenAI-Readiness Audit (1.15)

### 2.1 llms.txt

**File:** `/home/saerom/projects/patentworld/public/llms.txt`

- Well-structured with overview, page listing (all URLs), chapter listing by Act
- Data source documentation
- Methodology summary
- Technology stack info
- 93 lines, clean Markdown format

**Verdict:** PASS -- Excellent. Follows the llms.txt convention well.

### 2.2 llms-full.txt

**File:** `/home/saerom/projects/patentworld/public/llms-full.txt`

- Extended content guide with chapter summaries and key findings
- 80+ lines covering chapter content in more detail
- Includes patent law timeline events
- Slightly out of date vs. current chapter structure (refers to "Chapter 1-10" rather than current slugs/titles)

**Verdict:** PASS with minor note -- the chapter numbering in llms-full.txt does not match the current 34-chapter structure (it uses an older 10-chapter outline). Should be updated to match current chapters.

### 2.3 data-dictionary.json

**File:** `/home/saerom/projects/patentworld/public/data-dictionary.json`

- Comprehensive schema reference for all JSON data files
- Covers: source tables (9 PatentsView tables), data directories (28 directories), derived metrics (10 metrics with formulas), technology domains (12 domains with CPC codes)
- Machine-readable JSON format

**Verdict:** PASS -- Excellent for programmatic consumption by AI systems.

### 2.4 Static Export

**File:** `/home/saerom/projects/patentworld/next.config.mjs`

- `output: 'export'` confirms static HTML generation
- `trailingSlash: true` for clean URLs
- All content extractable as plain HTML without JavaScript execution

**Verdict:** PASS -- Ideal for AI crawling and content extraction.

### 2.5 AI Bot Access

- `robots.ts` explicitly allows: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, CCBot
- No `X-Robots-Tag` restrictions found
- Static export means no authentication barriers

**Verdict:** PASS -- Proactively AI-friendly.

---

## 3. Navigation & Structure Audit (1.10)

### 3.1 Header Navigation

**File:** `/home/saerom/projects/patentworld/src/components/layout/Header.tsx`

- Sticky header with backdrop blur
- Logo link to `/` with BarChart3 icon
- Desktop nav (visible `md+`): Explore, Methodology, About
- ThemeToggle button
- MobileNav hamburger menu
- All links use Next.js `<Link>` component
- Proper `aria-label="Main navigation"` on nav element
- Focus ring styles on all interactive elements

**Missing:** No FAQ link in the header (FAQ page exists at `/faq/`)

**Verdict:** PASS -- Clean, accessible header.

### 3.2 Footer

**File:** `/home/saerom/projects/patentworld/src/components/layout/Footer.tsx`

- Data source attribution with link to patentsview.org (external, `target="_blank"`, `rel="noopener noreferrer"`)
- Navigation links: Methodology, About, Explore
- All links use Next.js `<Link>` component
- Focus ring styles

**Missing:** No FAQ link. No copyright notice. No author link.

**Verdict:** PASS -- Functional but minimal.

### 3.3 Breadcrumb

**File:** `/home/saerom/projects/patentworld/src/components/layout/Breadcrumb.tsx`

- Client component using `usePathname()`
- Renders on chapter pages only (returns null for non-chapter pages)
- Three-level hierarchy: Home > Act N: Title > Chapter Title
- Home link is clickable (`<Link href="/">`)
- Act level is text-only (not a link) -- minor issue, acts are not standalone pages
- Current page marked with `aria-current="page"`
- Proper `aria-label="Breadcrumb"` on nav element
- Included in `src/app/chapters/layout.tsx` so it appears on ALL chapter pages

**Verdict:** PASS -- Semantically correct and accessible.

### 3.4 Mobile Navigation

**File:** `/home/saerom/projects/patentworld/src/components/layout/MobileNav.tsx`

- Hamburger menu visible on `md:hidden` (< 768px)
- Full-screen overlay with slide-in panel (w-72, right-aligned)
- Navigation links: Home, Explore, Methodology, About
- All 34 chapters listed, grouped by Act
- Subgroup support for acts with subgroups
- Active state highlighting based on pathname
- Proper `aria-label` on open/close buttons
- Close on backdrop click and on link click

**Verdict:** PASS -- Complete mobile navigation with full chapter listing.

### 3.5 Chapter Sidebar

**File:** `/home/saerom/projects/patentworld/src/components/layout/ChapterSidebar.tsx`

- Fixed left sidebar on `lg+` (>= 1024px)
- Full chapter listing grouped by Act
- Active state highlighting
- 264px wide, scroll-independent
- Supports subgroups

**Verdict:** PASS -- Good desktop navigation for chapter browsing.

### 3.6 Chapter Table of Contents

**File:** `/home/saerom/projects/patentworld/src/components/chapter/ChapterTableOfContents.tsx`

- Desktop: fixed right panel on `xl+` screens (right-8, w-52)
- Mobile/Tablet: collapsible `<details>` block
- Auto-discovers sections via `[data-section-label]` attribute
- Active section tracking via IntersectionObserver
- Smooth scroll on click

**Verdict:** PASS -- Excellent in-page navigation.

### 3.7 Chapter Navigation (Prev/Next)

**File:** `/home/saerom/projects/patentworld/src/components/layout/ChapterNavigation.tsx`

- Previous/Next chapter links at bottom of each chapter
- Computed from CHAPTERS array by chapter number (+/- 1)
- When no next chapter (chapter 34), shows "Explore the Data" link to `/explore/`
- Proper `aria-label="Chapter navigation"`

**Verdict:** PASS

### 3.8 Reading Progress & UX

- `ReadingProgress`: horizontal progress bar at top of chapter pages
- `BackToTop`: floating button when scrolled past 400px, with `aria-label`
- Skip-to-content link (`<a href="#main-content">`) in root layout
- `<main id="main-content">` set correctly

**Verdict:** PASS -- Thoughtful UX enhancements.

### 3.9 Search Functionality

- No site-wide search bar or command palette
- The Explore page (`/explore/`) has a search/filter UI for patent data (organizations, inventors, technologies, WIPO fields) -- but this searches data, not site content
- No Cmd+K or search dialog

**Verdict:** NEUTRAL -- Not a deficiency for a 34-chapter content site. The Explore page serves a similar purpose. A search feature could improve discovery but is not critical.

---

## 4. Internal Link Audit (1.16)

### 4.1 Navigation Links (Consistent)

All navigation components use consistent internal links:

| Link Target | Used In |
|-------------|---------|
| `/` | Header, Breadcrumb, MobileNav |
| `/explore/` | Header, Footer, MobileNav, ChapterNavigation |
| `/methodology/` | Header, Footer, MobileNav |
| `/about/` | Header, Footer, MobileNav |
| `/chapters/{slug}/` | Sidebar, MobileNav, ChapterNavigation, RelatedChapters |

### 4.2 Trailing Slash Consistency

**Configuration:** `trailingSlash: true` in `next.config.mjs`

**Issue Found:** Many in-content `<Link>` elements omit the trailing slash:

**Links WITHOUT trailing slash** (selected examples):
- `href="/chapters/org-patent-count"` (org-composition/page.tsx:131)
- `href="/chapters/deep-dive-overview"` (multiple Act 6 chapters)
- `href="/chapters/autonomous-vehicles"` (biotechnology/page.tsx:291)
- `href="/chapters/system-convergence"` (system-patent-quality/page.tsx:254)
- `href="/chapters/inv-gender"` (inv-serial-new/page.tsx:630)
- `href="/chapters/inv-team-size"` (inv-gender/page.tsx:593)
- `href="/chapters/inv-generalist-specialist"` (inv-top-inventors/page.tsx:579)
- `href="/chapters/geo-domestic"` (inv-team-size/page.tsx:595)
- `href="/chapters/system-patent-fields"` (multiple)
- `href="/chapters/org-composition"` (multiple Act 6 chapters)
- `href="/chapters/ai-patents"` (multiple chapters)
- `href="/chapters/system-patent-quality"` (system-patent-count/page.tsx:347)
- `href="/chapters/inv-serial-new"` (inv-generalist-specialist/page.tsx:369)
- `href="/chapters/mech-geography"` (mech-inventors/page.tsx:707)
- And many more across Act 6 deep dive chapters

**Links WITH trailing slash** (consistent):
- All links in `methodology/page.tsx` use trailing slashes correctly
- Navigation components (Header, Footer, MobileNav, Sidebar, ChapterNavigation) all use trailing slashes

**Impact:** With `trailingSlash: true`, Next.js should redirect non-trailing-slash URLs to trailing-slash versions. However, this causes:
1. Unnecessary 308 redirects on static export (one extra network hop)
2. Potential SEO dilution if crawlers index both versions
3. Inconsistency in canonical URLs

**Verdict:** FAIL -- Approximately 80+ internal links in chapter page content lack trailing slashes. All in-content chapter cross-references should use trailing slashes.

**Recommendation:** Add trailing slashes to all `<Link href="/chapters/{slug}">` references. A regex find-and-replace can fix this: `href="/chapters/([^/"]+)"` -> `href="/chapters/$1/"`.

### 4.3 Cross-Chapter Links

Rich internal cross-linking found across chapters:

- **ACT 1-5 chapters** link to related chapters (e.g., Patent Count -> Patent Quality -> Patent Fields -> Convergence)
- **ACT 6 chapters** each link to:
  - The preceding deep-dive chapter (forming a reading chain)
  - The ACT 6 Overview page
  - Related ACT 1-5 chapters (e.g., Assignee Composition, AI Patents)
- **InsightRecap component** provides "Next Analysis" links at chapter end
- **ChapterNavigation** provides sequential prev/next links
- **RelatedChapters** component (used when `relatedChapters` defined in CHAPTERS)
- **Methodology page** links to 14+ specific chapters for context

**Verdict:** PASS -- Excellent internal linking for SEO and reader navigation.

### 4.4 External Links

- PatentsView attribution link in Footer (`https://patentsview.org`, `target="_blank"`, `rel="noopener noreferrer"`)
- Author URL in metadata (`https://www.saeromlee.com`)
- Penn URL in JSON-LD (`https://www.upenn.edu`)
- MeasurementSidebar links to `/about/#definitions` (internal with hash)

**Verdict:** PASS -- External links properly attributed.

### 4.5 Orphaned Pages Check

All pages in the app directory are reachable:

| Page | Linked From |
|------|-------------|
| `/` | Header logo, Breadcrumb |
| `/explore/` | Header, Footer, MobileNav, ChapterNavigation (last chapter) |
| `/methodology/` | Header, Footer, MobileNav, multiple chapter pages |
| `/about/` | Header, Footer, MobileNav, methodology page |
| `/faq/` | **Not linked from any navigation component** |
| `/chapters/deep-dive-overview/` | Multiple Act 6 chapters |
| All 34 chapters | Sidebar, MobileNav, prev/next nav, cross-links |

**Verdict:** PARTIAL FAIL -- The `/faq/` page is orphaned. It exists in the sitemap but is not linked from any navigation element (Header, Footer, MobileNav).

**Recommendation:** Add FAQ link to footer or header navigation.

---

## Summary of Findings

### Passing

| Item | Status | Notes |
|------|--------|-------|
| Root metadata | PASS | Title template, OG, Twitter, canonical, robots |
| Per-chapter metadata | PASS | All 34 chapters with custom title, description, keywords |
| Structured data | PASS | ScholarlyArticle, FAQPage, BreadcrumbList, Dataset, WebSite |
| Heading hierarchy | PASS | Single h1 per page, logical nesting |
| Sitemap | PASS | All pages included, git-based lastModified |
| Robots | PASS | All bots allowed, AI bots explicitly listed |
| llms.txt | PASS | Present and well-structured |
| llms-full.txt | PASS | Present (needs update to match current chapters) |
| data-dictionary.json | PASS | Machine-readable schema reference |
| Static export | PASS | Full HTML output, no auth barriers |
| AI bot access | PASS | Proactively AI-friendly |
| Header nav | PASS | Clean, accessible, sticky |
| Footer | PASS | Functional with attribution |
| Breadcrumb | PASS | Accessible, on all chapter pages |
| Mobile nav | PASS | Complete with all chapters |
| Chapter sidebar | PASS | Fixed left, full listing |
| Chapter TOC | PASS | Desktop fixed + mobile collapsible |
| Prev/Next nav | PASS | Sequential chapter navigation |
| Reading progress | PASS | Progress bar + back-to-top |
| Accessibility | PASS | Skip-to-content, aria-labels, focus rings |
| Cross-chapter linking | PASS | Rich internal link network |
| External links | PASS | Properly attributed |

### Failing or Needs Attention

| Item | Status | Priority | Action Required |
|------|--------|----------|-----------------|
| **Favicon missing** | FAIL | HIGH | Add favicon.ico + apple-touch-icon.png |
| **OG images missing** | FAIL | HIGH | Generate OG images for all 34 chapter slugs |
| **Trailing slash inconsistency** | FAIL | MEDIUM | Add trailing slash to ~80+ in-content chapter links |
| **FAQ page orphaned** | FAIL | MEDIUM | Add /faq/ link to Header or Footer |
| **llms-full.txt outdated** | WARN | LOW | Update to match current 34-chapter structure |
| **Dual robots.txt** | WARN | LOW | Remove `public/robots.txt` (dynamic `robots.ts` takes precedence) |
