# Checkpoint: Global Cross-Page Checks (Group 10)

**Status:** COMPLETE
**Date:** 2026-02-21

## Cross-Page Consistency (§1.6.17)
- IBM 161,888: consistent across org-patent-count and org-company-profiles
- Japan 1.45 million: consistent across org-composition and geo-international
- Data provenance: single source of truth via constants.ts
- Denominator (utility vs all types): standardized per statistic

## Sensitivity Review (§1.9)
- Deliverable: audit/sensitivity-screening.md (29 KB)
- Gender framing neutralized
- International comparisons neutral
- Causal language replaced with associative
- Confounder disclosures added

## Acronym Audit (§1.9.5)
- USPTO added to glossary.ts
- CPC wrapped in GlossaryTooltip on 11 eligible pages
- NLP, HHI, NIH, HHS expanded at first use
- 325 date range hyphens → en-dashes across 34 chapters

## Terminology Consistency (§1.9.6)
- Deliverable: audit/terminology-consistency.md (19 KB)

## SEO & GenAI (§1.13, §1.14)
- JSON-LD with disambiguatingDescription on all pages
- llms.txt, llms-full.txt, data-dictionary.json present
- robots.txt, sitemap.xml verified
- Favicon and web manifest present
- OG images: 100% coverage via CHAPTER_OG_IMAGE mapping

## Accessibility (§1.12)
- Noscript fallbacks on all charts
- ARIA labels on chart containers
- Skip-to-content on every page
- Escape key handlers on MobileNav, CiteThisFigure, GlossaryTooltip
- SVG aria-hidden conflicts resolved
- prefers-reduced-motion query added

## Link Audit (§1.15)
- All internal navigation links verified
- External links verified (PatentsView, saeromlee.com, CC BY 4.0)
- MeasurementSidebar anchor fixed: /about/#definitions → /methodology/#definitions
- Trailing slashes added to all InsightRecap hrefs and deep-dive-overview links

## Locale Independence
- All bare .toLocaleString() replaced with .toLocaleString('en-US')
- formatCompact() updated with explicit 'en-US' locale
