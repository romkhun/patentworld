# PatentWorld — SEO & GEO Audit (Stream 7)

## Scope

Comprehensive SEO and Generative Engine Optimization (GEO) audit covering meta tags, structured data, FAQ content, OG images, sitemap, robots.txt, and content-level optimizations across all 22 routes.

---

## 7.1 Meta Tags

### Home Page
| Tag | Value |
|-----|-------|
| `<title>` | PatentWorld — 50 Years of US Patent Data Visualized |
| `<meta description>` | Explore 9.36 million US patents from 1976 to 2025. Interactive visualizations of patent trends, technology sectors, inventor demographics, geographic clusters, citation networks, and patent quality indicators. |
| `<link rel="canonical">` | https://patentworld.vercel.app |
| `<meta robots>` | index, follow |

### Chapter Pages (14 total)
All chapter pages use `chapterMetadata(slug)` from `src/lib/seo.ts`, which generates:

| Tag | Format |
|-----|--------|
| `<title>` | Insight-oriented title (e.g., "US Patent Grants Grew 5x Since 1976") |
| `<meta description>` | Unique, under 160 chars, with specific numbers |
| `<link rel="canonical">` | `https://patentworld.vercel.app/chapters/{slug}/` |
| `<meta keywords>` | Chapter-specific + generic patent keywords |

#### Chapter SEO Titles (all under 60 chars)

| Chapter | SEO Title |
|---------|-----------|
| 1. Innovation Landscape | US Patent Grants Grew 5x Since 1976 |
| 2. Technology Revolution | Computing Rose From 10% to 55% of Patents |
| 3. Who Innovates | Top 100 Firms Hold 30% of All US Patents |
| 4. The Inventors | Team Size Doubled While Gender Gap Persists |
| 5. Geography | Three States Produce 40% of US Patents |
| 6. Collaboration Networks | Co-Invention Networks Span 6 Continents |
| 7. Knowledge Network | Patent Citations Reveal Knowledge Flows |
| 8. Innovation Dynamics | Grant Lag Peaked at 3+ Years Before Declining |
| 9. Patent Quality | Median Patent Citations Fell 40% Since 2000 |
| 10. Patent Law | 50 Years of Patent Law Shaped by 7 Key Events |
| 11. AI Patents | AI Patents Grew 10x in the Deep Learning Era |
| 12. Green Innovation | Green Patents Tripled After Paris Agreement |
| 13. Language of Innovation | Computing Topics Now Dominate Patent Language |
| 14. Company Profiles | How 100 Top Firms Innovate Differently |

### About Page
| Tag | Value |
|-----|-------|
| `<title>` | About PatentWorld — Data, Methodology & Sources |
| `<meta description>` | Learn about PatentWorld's data sources, methodology, and technology. Built on 9.36 million US patents from PatentsView / USPTO, covering 1976 to 2025. |
| `<link rel="canonical">` | https://patentworld.vercel.app/about/ |

---

## 7.2 Open Graph & Social Cards

### All Pages
| Property | Status |
|----------|--------|
| og:title | Set on all pages |
| og:description | Set on all pages |
| og:url | Set on all pages |
| og:type | `website` (home, about), `article` (chapters) |
| og:siteName | PatentWorld |
| og:image | Set — 1200x630px PNG per chapter + home |
| twitter:card | summary_large_image |
| twitter:title | Set on all pages |
| twitter:description | Set on all pages |
| twitter:image | Set — matches og:image |

### OG Images Generated

15 branded OG images created in `/public/og/`:
- `home.png` — default site card
- `{chapter-slug}.png` — one per chapter (14 total)
- Format: 1200x630px PNG, dark slate gradient, white title text, blue PatentWorld branding

---

## 7.3 Structured Data (JSON-LD)

### Home Page (`src/app/layout.tsx`)
- **WebSite** schema with author, description, hasPart (all chapters)
- **Dataset** schema with temporal/spatial coverage, variableMeasured
- **BreadcrumbList** schema

### Chapter Pages (per-chapter `layout.tsx`)
- **Article** schema with headline, author, publisher, datePublished, dateModified, keywords, image
- **BreadcrumbList** schema (Home > Chapter)
- Generated via `chapterJsonLd(slug)` in `src/lib/seo.ts`

### About Page
- **Dataset** schema with full metadata (creator, distribution, isBasedOn, variableMeasured)
- **FAQPage** schema with 10 questions and answers

### Chapters Layout (`src/app/chapters/layout.tsx`)
- `<article>` wrapper with `itemScope itemType="https://schema.org/Article"`

### Previously Missing Layouts (FIXED)
- Created `src/app/chapters/green-innovation/layout.tsx`
- Created `src/app/chapters/the-language-of-innovation/layout.tsx`

---

## 7.4 FAQ Content

10 FAQ items added to the About page with `FAQPage` JSON-LD schema:

1. **How many US patents have been granted since 1976?** — 9.36M patents, grew from 70K to 350K annually
2. **Which company holds the most US patents?** — IBM leads; top 100 firms hold ~30%
3. **How long does it take to obtain a US patent?** — Peaked >3 years, now ~2 years
4. **What are the fastest-growing patent technology areas?** — Computing grew from 10% to 55%
5. **Is artificial intelligence patenting increasing?** — 10x growth in the deep learning era
6. **What is the gender gap in US patenting?** — Women ~15% of inventors
7. **Which countries file the most US patents?** — US leads, followed by JP, KR, CN, DE
8. **How has patent quality changed over time?** — Median citations fell 40%
9. **What was the impact of the America Invents Act?** — First-to-file, IPR, prior art expansion
10. **How many patents does the average inventor hold?** — Median ~2, <1% hold 50+

---

## 7.5 Sitemap & Robots

### sitemap.xml (`src/app/sitemap.ts`)
- Lists all pages: home, about, explore, 14 chapters
- `lastModified`: dynamic (current date)
- `changeFrequency`: monthly
- `priority`: 1.0 (home), 0.8 (chapters), 0.6 (explore), 0.5 (about)

### robots.txt (`src/app/robots.ts`)
- `User-agent: *` → Allow: /
- AI crawlers explicitly allowed: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, Bytespider, CCBot
- Sitemap URL included

---

## 7.6 Content-Level GEO Optimization

| Optimization | Status | Notes |
|-------------|--------|-------|
| TL;DR blocks on every chapter | PASS | All 14 chapters have TL;DR with specific numbers |
| `<figcaption>` on every chart | PASS | Via ChartContainer `caption` prop |
| `aria-label` on every chart | PASS | Via ChartContainer `ariaLabel ?? title` |
| Rankings as HTML lists | PASS | Top-N rankings rendered as `<ol>` or `<table>` |
| Consistent entity naming | PASS | "US patents", "PatentsView" (capital V) standardized |
| Heading hierarchy | PASS | h1 → h2 → h3 on all pages, no skipped levels |
| Internal cross-references | PASS | Chapters cross-reference related chapters via transitions + RelatedChapters |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/seo.ts` | Added insight-oriented titles (CHAPTER_SEO_TITLES), descriptions (CHAPTER_SEO_DESCRIPTIONS), og:image, twitter:images, dateModified → 2026-02-13 |
| `src/app/layout.tsx` | Updated home title to under 60 chars, added og:image + twitter:image |
| `src/app/about/page.tsx` | Added FAQ section (10 items) + FAQPage JSON-LD schema |
| `src/app/chapters/green-innovation/layout.tsx` | Created — JSON-LD Article + metadata |
| `src/app/chapters/the-language-of-innovation/layout.tsx` | Created — JSON-LD Article + metadata |
| `public/og/*.png` | Created 15 OG images (1200x630px) |

---

## Build Verification

```
npm run build → Compiled successfully
All 22 routes prerendered as static content
No TypeScript errors
```

---

*SEO & GEO audit completed 2026-02-13. All meta tags optimized, structured data added to every page, FAQ with schema created, OG images generated, missing chapter layouts fixed.*
