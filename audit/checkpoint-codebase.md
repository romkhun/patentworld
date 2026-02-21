# Checkpoint: Codebase Mapping (Group 1)

**Status:** COMPLETE
**Date:** 2026-02-21

## §1.1 — Map the Codebase
- Next.js 14 App Router with `output: 'export'` (SSG), `trailingSlash: true`
- 34 chapter pages under `src/app/chapters/[slug]/page.tsx`
- Recharts visualization library
- Static data served from `public/data/` (JSON files)
- Vercel deployment (auto-deploys on push to main)
- No deprecated content structures found — single 34-chapter/6-Act taxonomy confirmed

## §1.2 — Data Source Registry
- Deliverable: `audit/data-source-registry.md` (65 KB)
- PatentsView data accessed February 2026, coverage 1976–Sep 2025
- Single source of truth: `DATA_ACCESS_DATE` in `src/lib/constants.ts`

## §1.3 — Page and Visualization Inventory
- Deliverable: `audit/page-inventory.md` (29 KB)
- Deliverable: `audit/figure-manifest.csv` (155 KB)
- 34 chapter pages, 458 visualizations confirmed
- Non-chapter pages: homepage, explore, methodology, about, FAQ

## §1.4 — Technology Domain Definition Registry
- Deliverable: `audit/technology-domain-definitions.md` (34 KB)
- 12 Deep Dive domains catalogued with CPC code definitions

## §1.5 — Derived Metrics Registry
- Deliverable: `audit/derived-metrics-registry.md` (52 KB)
- All entropy scales disambiguated (Shannon vs Simpson diversity)
- Government breadth metric corrected from "Shannon Entropy" to "1 − HHI"
