# ACT 6 Deep Dives — Implementation Log

## Date: 2026-02-20

## Overview

This log documents the ACT 6 Deep Dives fixes, consistency improvements, and analytical enrichments implemented across the 12 technology domain chapters (chapters 23-34) and a new cross-domain overview page.

---

## Phase 1: Data Pipeline Scripts

Four new DuckDB pipeline scripts were created and executed successfully:

### `72_act6_cross_domain.py`
- **Purpose**: Cross-domain comparison data for all 12 domains
- **Outputs**:
  - `public/data/act6/act6_comparison.json` (12 domain summaries with total patents, recent 5yr, CAGR, share, quality metrics)
  - `public/data/act6/act6_timeseries.json` (annual patent counts per domain, 1976-2025)
  - `public/data/act6/act6_quality.json` (mean citations, claims, scope per domain × 5yr period)
  - `public/data/act6/act6_spillover.json` (co-classification lift between domain pairs)

### `73_entrant_incumbent.py`
- **Purpose**: Growth decomposition — entrant vs. incumbent assignees per domain × year
- **Outputs**: 12 files, one per domain (`{domain_slug}_entrant_incumbent.json`)
- **Method**: Assignees classified as "entrant" on the year of their first patent in the domain

### `74_quality_bifurcation.py`
- **Purpose**: Top-decile citation share over time per domain
- **Outputs**: 12 files, one per domain (`{domain_slug}_quality_bifurcation.json`)
- **Method**: System-wide p90 forward-citation thresholds computed per (grant_year × cpc_section), then domain patents evaluated against these thresholds

### `75_act6_enrichments.py`
- **Purpose**: Chapter-specific analyses bundled in one script
- **Outputs**:
  - `chapter11/ai_gpt_kpi.json` — Distinct CPC sections + HHI for AI patents by year
  - `green/green_ev_battery_coupling.json` — EV-battery co-classification lift within green patents
  - `quantum/quantum_semiconductor_dependence.json` — Quantum assignees with prior semiconductor experience
  - `act6/systems_complexity.json` — Team size + claims indexed to system baseline for 3D/space/AV
  - `blockchain/blockchain_hype_cycle.json` — One-and-done entrant share by cohort year
  - `digihealth/digihealth_regulatory_split.json` — Med-device vs Big Tech patent share

---

## Phase 2: ACT 6 Overview Page

- **Route**: `/chapters/deep-dive-overview` (standalone, not in CHAPTERS array to avoid renumbering)
- **Content**:
  - Methods section (`id="methods"`) defining CR4, Shannon entropy, technology velocity, international share, academic share
  - Domain chapter link grid (12 domains)
  - Figure 1: Horizontal bar chart — total patents by domain
  - Figure 2: Small-multiples grid — annual time series per domain (1990-2025)
  - Figure 3: Grouped bar chart — quality metrics (citations, claims, scope) by domain
  - Figure 4: Spillover table — co-classification lift between domain pairs

### Types Added (`src/lib/types.ts`)
- `Act6DomainSummary`, `Act6TimeSeries`, `Act6QualityPeriod`, `Act6Spillover`
- `DomainEntrantIncumbent`, `DomainQualityBifurcation`
- `AiGptKpi`, `GreenEvBatteryCoupling`, `QuantumSemiDependence`
- `SystemsComplexity`, `BlockchainHypeCycle`, `DigihealthRegulatorySplit`

---

## Phase 3: Bridge Text + Cross-References

### Bridge Text Corrections
All 12 chapters had their "Having examined..." introductory text corrected to reference the correct previous chapter per alphabetical nav order:

| Chapter | Prev (nav order) | Bridge now references |
|---------|------------------|-----------------------|
| 23: 3D Printing | 22: mech-geography | geographic mechanics of innovation (ACT 5) |
| 24: AgTech | 23: 3d-printing | 3D printing |
| 25: AI | 24: agricultural-technology | agricultural technology |
| 26: AV | 25: ai-patents | artificial intelligence |
| 27: Biotech | 26: autonomous-vehicles | autonomous vehicles |
| 28: Blockchain | 27: biotechnology | biotechnology |
| 29: Cyber | 28: blockchain | blockchain |
| 30: DigiHealth | 29: cybersecurity | cybersecurity |
| 31: Green | 30: digital-health | digital health |
| 32: Quantum | 31: green-innovation | green innovation |
| 33: Semi | 32: quantum-computing | quantum computing |
| 34: Space | 33: semiconductors | semiconductors |

### "Next Chapter Examines" Removal
All forward-looking "The next chapter examines..." sentences were removed from all 12 chapters. Navigation buttons handle chapter sequencing.

### ACT 6 Overview Cross-References
All 12 chapters now include a cross-reference link after the "Analytical Deep Dives" section divider:
> "For metric definitions and cross-domain comparisons, see the ACT 6 Overview."

---

## Phase 4: Event-Causality Rigor

### Grant-Year Annotations
All 12 chapters received the following annotation appended to their first volume chart caption:
> "Grant year shown. Application dates are typically 2-3 years earlier."

---

## Phase 5: Enrichment Charts

### Universal Enrichments (all 12 chapters)
1. **Entrant vs. Incumbent Stacked Area Chart** — PWAreaChart showing annual patent decomposition by entrant (first domain patent that year) vs. incumbent assignees
2. **Quality Bifurcation Line Chart** — PWLineChart showing top-decile citation share over time (5-year periods)

### Chapter-Specific Enrichments
| Chapter | Chart | Data Source |
|---------|-------|-------------|
| AI | GPT KPI dual-line (CPC section diversity + HHI) | `ai_gpt_kpi.json` |
| Blockchain | Hype cycle (one-and-done entrant share) | `blockchain_hype_cycle.json` |
| Digital Health | Regulatory split (Med Device vs Big Tech vs Other) | `digihealth_regulatory_split.json` |
| Green Innovation | EV-Battery coupling lift | `green_ev_battery_coupling.json` |
| Quantum Computing | Semiconductor dependence (% with prior semi patents) | `quantum_semiconductor_dependence.json` |

---

## Infeasible Analyses

| Analysis | Reason | Status |
|----------|--------|--------|
| Blockchain text search (patent abstracts) | Patent abstracts not available in pipeline | INFEASIBLE |
| Cybersecurity formal event study | Application-year data has corrupt values (e.g., "1074-08-14") | PARTIALLY FEASIBLE — deferred |
| Inventor mobility across domains | Complex multi-join, high compute, lower priority | DEFERRED |

---

## Files Created
- `data-pipeline/72_act6_cross_domain.py`
- `data-pipeline/73_entrant_incumbent.py`
- `data-pipeline/74_quality_bifurcation.py`
- `data-pipeline/75_act6_enrichments.py`
- `src/app/chapters/deep-dive-overview/page.tsx`
- `src/app/chapters/deep-dive-overview/layout.tsx`
- `public/data/act6/*.json` (8 files)
- `public/data/{12 domains}/*_entrant_incumbent.json` (12 files)
- `public/data/{12 domains}/*_quality_bifurcation.json` (12 files)
- Domain-specific enrichment JSON files (6 files)
- `ACT6_LOG.md` (this file)

## Files Modified
- `src/lib/types.ts` (12 new interfaces)
- 12 ACT 6 chapter `page.tsx` files (bridge text, annotations, cross-refs, enrichment charts)

## Build Status
- `npm run build`: 44/44 pages generated, zero errors
- `npx tsc --noEmit`: zero errors
