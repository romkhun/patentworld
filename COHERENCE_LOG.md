# Coherence Log — Internal Coherence, De-Duplication, and Interpretive Scaffolding

Date: 2026-02-20

---

## Phase 0: Release-Blocker Bug Fixes

| Bug | File | Issue | Fix |
|-----|------|-------|-----|
| 0a | `mech-organizations/page.tsx` | `(${effectiveDecade ?? ''}s)` rendered "(s)" when null | Conditional: only show decade suffix when non-null |
| 0b | `mech-organizations/page.tsx` | `selectedExplData.length` showed "0 Years" | Guard: show `'...'` when length is 0 |
| 0c | `org-company-profiles/page.tsx` (×3) | `activeYears ?? ''` rendered empty string | Changed fallback to `'...'` |
| 0d | `system-language/page.tsx` | `totalPatents` defaulted to 0 → "0 patent abstracts" | Hardcoded fallback `8450000` |
| 0e | `system-patent-count/page.tsx` | Fallback showed `'9.4M'` | Changed to `'9.36M'` |

---

## Phase 1: New Components (4)

| Component | Purpose | Pattern |
|-----------|---------|---------|
| `DescriptiveGapNote.tsx` | Collapsible confounder warning (amber, AlertTriangle) | Collapsible (SkewnessExplainer) |
| `CompetingExplanations.tsx` | Collapsible alternative explanations panel (violet) | Collapsible (SkewnessExplainer) |
| `InsightRecap.tsx` | End-of-chapter recap: takeaways, falsifiable claim, next link (green) | Non-collapsible (KeyFindings) |
| `ConcentrationPanel.tsx` | Top-1%, Top-5%, Gini stat panel | Non-collapsible (KeyInsight) |

---

## Phase 2: About Page + Measurement Infrastructure

- **Definitions section** (`about/page.tsx`): Added `<section id="definitions">` with 12 metric definitions (forward citations 5y, backward citations, originality, generality, self-citations, claims, scope, grant lag, Shannon entropy, HHI, cohort normalization, blockbuster)
- **Disambiguation reliability** (`about/page.tsx`): Added subsection explaining splitting/lumping errors in inventor disambiguation
- **TOC update** (`about/page.tsx`): Added "Definitions" entry
- **MeasurementSidebar** link: Added "View all measurement definitions" link to `/about/#definitions`
- **Disambiguation notes** (`chapterMeasurementConfig.ts`): Added notes for `inv-top-inventors`, `inv-serial-new`, `mech-inventors`
- **Interdisciplinarity 2×2** (`system-convergence/page.tsx`): Added conceptual table (scope × convergence) with 4 quadrants

---

## Phase 3: Chapter Text Edits

### Section 1 (Citation Consistency)
- Audited citation headlines — all already use mature cohort data (2020 or earlier)

### Section 2 (Denominator Labels)
- No changes needed; geography chapters already specify denominators

### Section 3 (DescriptiveGapNote Placement)
Placed in 6 chapters:
- `inv-gender` (variant: gender, alwaysVisible)
- `inv-team-size` (variant: team-size)
- `geo-international` (variant: international)
- `inv-top-inventors` (variant: top-inventors)
- `inv-generalist-specialist` (variant: team-size)
- `org-composition` (variant: international)

### Section 5 (CompetingExplanations Placement)
Placed in 4 locations:
- `system-patent-quality` ×2 (forward citations rising; originality/generality divergence)
- `system-patent-fields` (G/H section dominance)
- `inv-gender` (persistent gender gap)

### Section 6 (ConcentrationPanel + Entropy)
- `org-patent-count`: ConcentrationPanel (top1=15.2, top5=28.4, gini=0.891)
- Entropy definitions: no redundant definitions found to strip

### Section 7 (Act Bridges)
- **ACT 2→3** (`org-company-profiles`): Strengthened bridge paragraph with explicit conceptual transition
- **ACT 5→6** (`mech-geography`): Strengthened bridge with specific channel references (inter-firm, inventor mobility, cross-border)
- **ACT 1→2, 3→4, 4→5**: Already strong, no changes needed

### Section 9 (Patent Count Standardization)
- All references already use "9.36 million" — no changes needed

### Section 10 (Digital Transformation Prose)
- "Digital transformation" only in `system-patent-fields` (appropriate location) — no redundancy
- Added reconciliation KeyInsight to `system-language` linking CPC-based convergence (Ch 4) and text-based topics (Ch 5)

### Section 11 (HHI Thresholds + Citations)
- HHI thresholds already correct per 2023 DOJ/FTC guidelines (1,500/2,500)
- No existing academic citations in `system-public-investment` to update

### Section 12 (Interdisciplinarity 2×2)
- Added to `system-convergence` (see Phase 2)

---

## Phase 4: InsightRecap for All 34 Chapters

Added `<InsightRecap>` component to every chapter, placed between closing `</Narrative>` and `<DataNote>`. Each contains:
- 2 key takeaways with verified numbers from the chapter's data
- 1 falsifiable hypothesis
- 1 next-analysis link (forming a chain through all 34 chapters)

| ACT | Chapters | Count |
|-----|----------|-------|
| ACT 1 | system-patent-count → system-public-investment | 7 |
| ACT 2 | org-composition → org-company-profiles | 5 |
| ACT 3 | inv-top-inventors → inv-team-size | 5 |
| ACT 4–5 | geo-domestic → mech-geography | 5 |
| ACT 6a | 3d-printing → blockchain | 6 |
| ACT 6b | cybersecurity → space-technology | 6 |

---

## Phase 5: Data Pipeline (5 New Analyses)

| Script | Output | Rows | Description |
|--------|--------|------|-------------|
| `67_interdisciplinarity_trend.py` | `chapter10/interdisciplinarity_unified.json` | 49 | Z-scored composite: scope, CPC sections, multi-section share (1976–2024) |
| `68_sleeping_beauty_halflife.py` | `computed/sleeping_beauty_halflife.json` | 8 | Sleeping beauty rate + citation half-life by CPC section |
| `69_gov_interest_impact.py` | `chapter1/gov_impact_comparison.json` | 2 | Gov-funded vs non-funded: normalized citations, top-decile/1% shares |
| `70_alice_event_study.py` | `chapter10/alice_event_study.json` | 26 | Software vs control patents indexed to 2013, 2008–2020 |
| `71_bridge_inventor_centrality.py` | `chapter5/bridge_centrality.json` | 5 | Degree centrality quintiles for top-5K prolific inventors |

### Chart Visualizations Added

| Data | Chart Type | Chapter Page |
|------|-----------|--------------|
| Interdisciplinarity trend | PWLineChart (3 z-score lines) | `system-convergence` |
| Sleeping beauty × half-life | PWScatterChart (8 CPC sections) | `system-patent-quality` |
| Gov impact comparison | PWBarChart (grouped, 3 metrics) | `system-public-investment` |
| Alice event study | PWLineChart (4 lines + reference line) | `system-patent-law` |
| Bridge centrality | PWBarChart (grouped, citations + degree) | `mech-inventors` |

### TypeScript Types Added (`types.ts`)

- `InterdisciplinarityTrend`
- `SleepingBeautyHalflife`
- `GovImpactComparison`
- `AliceEventStudy`
- `BridgeCentralityQuintile`

---

## Files Created

- `src/components/chapter/DescriptiveGapNote.tsx`
- `src/components/chapter/CompetingExplanations.tsx`
- `src/components/chapter/InsightRecap.tsx`
- `src/components/chapter/ConcentrationPanel.tsx`
- `data-pipeline/67_interdisciplinarity_trend.py`
- `data-pipeline/68_sleeping_beauty_halflife.py`
- `data-pipeline/69_gov_interest_impact.py`
- `data-pipeline/70_alice_event_study.py`
- `data-pipeline/71_bridge_inventor_centrality.py`
- `public/data/chapter10/interdisciplinarity_unified.json`
- `public/data/computed/sleeping_beauty_halflife.json`
- `public/data/chapter1/gov_impact_comparison.json`
- `public/data/chapter10/alice_event_study.json`
- `public/data/chapter5/bridge_centrality.json`
- `COHERENCE_LOG.md`

## Files Modified

- `src/app/about/page.tsx` (definitions, disambiguation, TOC)
- `src/components/chapter/MeasurementSidebar.tsx` (definitions link)
- `src/lib/chapterMeasurementConfig.ts` (disambiguation notes)
- `src/lib/types.ts` (5 new interfaces)
- 34 chapter `page.tsx` files (InsightRecap + various per-section edits)
