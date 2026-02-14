# ACT 5 Expansion — 10 New Deep Dive Chapters

## Summary
Expanded ACT 5 ("Deep Dives") from 2 existing chapters (AI Patents, Green Innovation) to 12 total by adding 10 new technology domain deep dives. Each chapter follows an 11-analysis template using PatentsView data.

## Final Chapter Order

| Ch# | Domain | Slug | Data Dir | Rationale |
|-----|--------|------|----------|-----------|
| 13 | Semiconductors | semiconductors | semiconductors/ | Foundational, high-volume, contextualizes quantum |
| 14 | Quantum Computing | quantum-computing | quantum/ | Related to semiconductors, emerging field |
| 15 | Cybersecurity | cybersecurity | cyber/ | Digital tech, high-volume |
| 16 | Biotechnology & Gene Editing | biotechnology | biotech/ | Established domain, different sector |
| 17 | Digital Health & Medical Devices | digital-health | digihealth/ | Related to biotech |
| 18 | Agricultural Technology | agricultural-technology | agtech/ | Related to biotech/health sector |
| 19 | Autonomous Vehicles & ADAS | autonomous-vehicles | av/ | Cross-industry convergence |
| 20 | Space Technology | space-technology | space/ | Related hardware/sensors |
| 21 | 3D Printing / Additive Manufacturing | 3d-printing | 3dprint/ | Cross-sector manufacturing |
| 22 | Blockchain & Decentralized Systems | blockchain | blockchain/ | Hype cycle, lower volume |
| 23 | Artificial Intelligence (existing) | ai-patents | chapter11/ | General-purpose, touches all domains |
| 24 | The Green Innovation Race (existing) | green-innovation | green/ | Culminating chapter on climate |

## Analysis Template (per chapter)

All 12 ACT 5 chapters follow an 11-analysis template:

1. Annual patent counts + share (`{slug}_per_year.json`)
2. Sub-category/subfield breakdown (`{slug}_by_subfield.json`)
3. Top 50 assignees (`{slug}_top_assignees.json`)
4. Org rankings heatmap (`{slug}_org_over_time.json`)
5. Top 50 inventors (`{slug}_top_inventors.json`)
6. Geographic distribution (`{slug}_geography.json`)
7. Quality indicators (`{slug}_quality.json`)
8. Team size comparison (`{slug}_team_comparison.json`)
9. Assignee type distribution (`{slug}_assignee_type.json`)
10. Strategy/portfolio table (`{slug}_strategies.json`)
11. Cross-domain diffusion (`{slug}_diffusion.json`)

## Analysis Matrix (Phase 3a)

| Analysis | Semi | Quantum | Cyber | Biotech | DigiHealth | AgTech | AV | Space | 3DPrint | Blockchain | AI | Green |
|----------|------|---------|-------|---------|------------|--------|-----|-------|---------|------------|-----|-------|
| 1. Annual counts + share | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 2. Subfield breakdown | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 3. Top assignees | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 4. Org rankings heatmap | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 5. Top inventors | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 6. Geography | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 7. Quality indicators | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 8. Team size comparison | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 9. Assignee type | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 10. Strategy table | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 11. Cross-domain diffusion | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **Domain-specific** | | | | | | | | | | | GPT diffusion | Green-AI trend + heatmap |

## CPC Codes Used Per Domain

| Domain | CPC Filter | Patents | Date Range |
|--------|-----------|---------|------------|
| Semiconductors | H01L, H10N, H10K | 445,144 | 1976-2025 |
| Quantum Computing | G06N10%, H01L39% | 3,166 | 1990-2025 |
| Cybersecurity | G06F21%, H04L9%, H04L63% | 228,483 | 1976-2025 |
| Biotechnology | C12N15%, C12N9%, C12Q1/68% | 119,675 | 1976-2025 |
| Digital Health | A61B5%, G16H, A61B34% | 163,719 | 1976-2025 |
| Agricultural Technology | A01B, A01C, A01G, A01H, G06Q50/02% | 56,386 | 1976-2025 |
| Autonomous Vehicles | B60W60%, G05D1%, G06V20/56% | 47,481 | 1990-2025 |
| Space Technology | B64G, H04B7/185% | 16,294 | 1976-2025 |
| 3D Printing | B33Y, B29C64%, B22F10% | 25,334 | 1990-2025 |
| Blockchain | H04L9/0643%, G06Q20/0655% | 5,775 | 2000-2025 |
| AI (existing) | G06N%, G06F18%, G06V, G10L15%, G06F40% | — | 1976-2025 |
| Green Innovation (existing) | Y02%, Y04S% | — | 1976-2025 |

## Gaps Filled in Existing Chapters (Phase 3b)

### Green Innovation (Chapter 24)
Added 7 missing analyses to harmonize with the 11-analysis template:
- `green_top_inventors.json` — Top 50 inventors
- `green_org_over_time.json` — Organization rankings over time
- `green_quality.json` — Quality indicators (claims, citations, scope)
- `green_team_comparison.json` — Team size comparison (Green vs. Non-Green)
- `green_assignee_type.json` — Assignee type distribution
- `green_strategies.json` — Strategy/portfolio table
- `green_diffusion.json` — Cross-domain diffusion

Pipeline script: `data-pipeline/57_green_supplement.py`
Page updated: `src/app/chapters/green-innovation/page.tsx` (7 new sections added)

### AI Patents (Chapter 23)
Already had 11 analyses — no gaps to fill. Domain-specific analysis (GPT diffusion) retained.

## Standardized Section Order (Phase 3c)

All 12 chapters follow this section order:
1. ChapterHeader + KeyFindings + Executive Summary
2. Growth Trajectory (annual count + share)
3. Subfield/Sub-category Breakdown
4. Top Organizations (bar chart + ranking table)
5. Organization Rankings Heatmap
6. Top Inventors
7. Geography (countries + US states)
8. Quality Indicators
9. Team Size Comparison
10. Assignee Type Distribution
11. Strategy Table
12. Cross-Domain Diffusion
13. Domain-specific analyses (if applicable)
14. DataNote + RelatedChapters + ChapterNavigation

## Domains Flagged for Author Review

- **Quantum Computing** (3,166 patents): Smallest established domain. All analyses pass but some sub-analyses have thin data.
- **Blockchain** (5,775 patents): Second-smallest domain. Only 2 subfields due to narrow CPC codes (H04L9/0643, G06Q20/0655).

## Files Created

### Data Pipeline Scripts
- `data-pipeline/domain_utils.py` — Shared pipeline module
- `data-pipeline/47_semiconductors.py`
- `data-pipeline/48_quantum_computing.py`
- `data-pipeline/49_biotechnology.py`
- `data-pipeline/50_autonomous_vehicles.py`
- `data-pipeline/51_space_technology.py`
- `data-pipeline/52_cybersecurity.py`
- `data-pipeline/53_agricultural_technology.py`
- `data-pipeline/54_digital_health.py`
- `data-pipeline/55_3d_printing.py`
- `data-pipeline/56_blockchain.py`
- `data-pipeline/57_green_supplement.py`

### Data Files Generated
110 JSON files for new chapters (11 per domain × 10 domains) + 7 supplementary files for Green Innovation = 117 new JSON files total.

### Chapter Pages
10 new chapter directories, each with `page.tsx` + `layout.tsx`:
- `src/app/chapters/semiconductors/` (732 lines)
- `src/app/chapters/quantum-computing/` (736 lines)
- `src/app/chapters/cybersecurity/` (752 lines)
- `src/app/chapters/biotechnology/` (809 lines)
- `src/app/chapters/digital-health/` (754 lines)
- `src/app/chapters/agricultural-technology/` (776 lines)
- `src/app/chapters/autonomous-vehicles/` (745 lines)
- `src/app/chapters/space-technology/` (755 lines)
- `src/app/chapters/3d-printing/` (748 lines)
- `src/app/chapters/blockchain/` (741 lines)

## Files Modified
- `src/lib/constants.ts` — 10 new chapter entries, updated ACT_GROUPINGS, HERO_STATS
- `src/lib/types.ts` — 11 generic Domain* TypeScript interfaces
- `src/lib/seo.ts` — SEO metadata for 10 new chapters
- `src/lib/colors.ts` — 10 subfield color maps
- `src/lib/referenceEvents.ts` — 10 domain-specific event arrays
- `src/components/chapter/ChapterHeader.tsx` — Extended gradient colors to chapters 15-24
- `src/app/chapters/ai-patents/page.tsx` — Renumbered 13→23
- `src/app/chapters/green-innovation/page.tsx` — Renumbered 14→24, added 7 new analysis sections

## Build Verification (Phase 5d)
- `npm run build` completes with zero errors and zero warnings
- All 33 pages generate successfully as static content
- TypeScript compilation passes cleanly
- ESLint passes cleanly
