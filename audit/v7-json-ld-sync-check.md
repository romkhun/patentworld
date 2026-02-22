# PatentWorld v7 Audit -- JSON-LD Synchronization Check

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** JSON-LD structured data synchronization with page content

---

## Method

JSON-LD structured data was examined across:
1. `src/lib/seo.ts` -- generates ScholarlyArticle, Dataset, WebSite, and BreadcrumbList structured data.
2. `src/app/layout.tsx` -- embeds site-level JSON-LD (Dataset, WebSite).
3. `src/app/page.tsx` -- homepage FAQ JSON-LD.
4. `src/lib/constants.ts` -- CHAPTERS array (single source of truth for descriptions).

## Single Source of Truth

The `hasPart` array in the JSON-LD Dataset is generated programmatically from the CHAPTERS array in `constants.ts`. This ensures that:
- All 34 chapter descriptions in JSON-LD match the homepage card descriptions.
- Any update to a chapter description in `constants.ts` automatically propagates to JSON-LD.
- No manual synchronization is required.

## Verification Results

### All 34 Descriptions Match

Each CHAPTERS entry's `description` field is used for both:
- The homepage card text (rendered in `HomeContent.tsx`).
- The `hasPart` descriptions in the JSON-LD Dataset (generated in `seo.ts`).

All 34 descriptions were confirmed to match between these two locations.

### Key Fixes Propagated

| Fix | Propagation Verified |
|-----|---------------------|
| C1: Denominator correction | `seo.ts:255` now reads "US patents (utility, design, plant, and reissue)" -- matches SITE_DESCRIPTION in `constants.ts` |
| H1: Quality-quantity reframe | `constants.ts:156` updated; change propagates to both homepage card and JSON-LD `hasPart` |
| H2: Gender confounder disclosure | `constants.ts:134` updated; confounder disclosure appears in both homepage card and JSON-LD |
| H5: Blockchain SEO title | `seo.ts:90` updated from "Hype Cycle" to "Boom-Bust Pattern"; affects only SEO title, not JSON-LD body |
| H7: Anchor fix | `seo.ts:267` BreadcrumbList now uses `/#chapters` instead of `/#acts` |

### JSON-LD Structure

| Type | Location | Verified |
|------|----------|----------|
| WebSite | `layout.tsx` | Name, URL, publisher, entity disambiguation for UK journal -- all correct |
| Dataset | `seo.ts` | Description matches SITE_DESCRIPTION; `hasPart` generated from CHAPTERS array |
| BreadcrumbList | `seo.ts` | 3-level breadcrumb (Home > Chapters > Chapter); anchor `/#chapters` resolves |
| ScholarlyArticle | `seo.ts` (per chapter) | Title, description, author, datePublished, isPartOf -- all correct |
| FAQPage | `page.tsx` (homepage) | 6 FAQ items; statistics verified (9.36M, 393K, IBM 161,888, etc.) |

### Entity Disambiguation

The WebSite JSON-LD includes a `sameAs` property with the Wikidata entity for the University of Pennsylvania, distinguishing the author institution from other entities with similar names (e.g., the UK journal "Patent World").

## Conclusion

JSON-LD structured data is synchronized with page content via the single source of truth in `constants.ts`. All 34 descriptions match chapter Key Findings. Denominator correction, confounder disclosures, and neutral language have all propagated correctly.

---

Status: COMPLETE
