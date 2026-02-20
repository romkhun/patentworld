# Claude Code Prompt: Audit, Verify, and Optimize patentworld.vercel.app

You are auditing and improving the website https://patentworld.vercel.app/. This is an academic/professional site presenting patent and innovation research by a Wharton School faculty member. **Accuracy is paramount** — any errors will severely undermine the author's reputation and credibility. Every claim, figure, reference, and description must be verifiably correct.

## Site Architecture

**6-ACT, 34-chapter architecture:**

```
ACT 1 – The System (7 chapters: 1.1–1.7)
ACT 2 – The Organizations (5 chapters: 2.1–2.5)
ACT 3 – The Inventors (5 chapters: 3.1–3.5)
ACT 4 – The Geography (2 chapters: 4.1–4.2)
ACT 5 – The Mechanics (3 chapters: 5.1–5.3)
ACT 6 – Deep Dives (12 chapters: 6.1–6.12)
```

**Tech stack:** Next.js 14 App Router with static export, Recharts chart library, Tailwind CSS, deployed on Vercel. Chapter pages at `src/app/chapters/[slug]/page.tsx`. Chapter registry in `src/lib/constants.ts` (CHAPTERS array, ACT_GROUPINGS). Data loaded via `useChapterData<T[]>('chapterN/file.json')` hook from `public/data/`.

**Current state (as of commit 660e9e19):**
- 460 visualizations across 44 static pages
- `npx tsc --noEmit` passes with zero errors
- `npm run build` passes with zero errors
- Zero ESLint warnings

---

## GENERAL GUIDELINES

- **Accuracy is the top priority.** Every claim, figure, and caption must be precisely supported by the data. Do not overstate, speculate, or extrapolate. Never fabricate, invent, or assume information.
- **When uncertain, flag — do not guess or remove.** Add uncertain items to `AUDIT_LOG.md` under "FLAGGED FOR AUTHOR REVIEW."
- **Do not introduce new claims or interpretations** beyond what the data shows. Exception: you may replace vague language with specific numbers from the data.
- **Match existing codebase conventions** for component patterns, data format, and project structure.
- **Maintain the author's voice and academic tone.** Target register: *Management Science*, *American Economic Review*, *Research Policy*.
- **The primary audience** is researchers, policymakers, and industry professionals.

---

## WORK COMPLETED ACROSS ALL PRIOR SESSIONS

The following work has been completed across 10+ sessions executing fix.md, fix_2.md, fix_3.md, new_analysis.md, new_analysis_2.md, new_analysis_3.md, and new_analysis_4.md. **Do not redo completed work. Build on it.**

### Original 10-Phase Audit (fix.md / fix_2.md / fix_3.md)
- **Phase 1 (Bug Fixes):** Console errors fixed, hero counters verified, prev/next links verified for all 34 chapters, data integrity pass, company profiles (5 of 6 views — 6th requires network data pipeline).
- **Phase 2 (Content Accuracy):** Numerical claims verified across all chapters, Patent Law references audited (7-test protocol, 9 papers removed), terminology corrections ("American innovation" → "US patents"), precision language audit.
- **Phase 3 (Tone):** All informal language replaced (surged→increased substantially, exploded→expanded rapidly, dramatic→substantial, etc.), contractions expanded, hedging language evaluated, chart titles converted to declarative findings with verified numbers.
- **Phase 4 (Visualization Quality):** Legends, axis labels, color palette, chart loading fallbacks reviewed.
- **Phase 5 (Content Organization):** Within-chapter structure (Key Findings → Executive Summary → figures → InsightRecap), ACT 5 reordered, cross-references, InsightRecap panels at end of every chapter, Act bridge transitions.
- **Phase 6 (Titles):** All titles audited and revised to insight-oriented declarative sentences.
- **Phase 7 (Navigation):** Prev/next links verified, chapter card descriptions finding-first, reading progress indicator.
- **Phase 8 (About Page):** Author bio, methodology, suggested citation, measurement definitions.
- **Phase 9 (SEO):** Meta tags, Open Graph, JSON-LD, sitemap.ts, robots.ts (allows all bots including AI), FAQ page with FAQPage schema.
- **Phase 10 (Final QA):** Build verification, page-by-page checklist, spot-checks completed.

### Coherence and Interpretive Scaffolding
- Release-blocker rendering bugs fixed
- DescriptiveGapNote caveats on group-comparison figures
- CompetingExplanations at ambiguous findings (5 chapters)
- ConcentrationPanel in 4 chapters
- MeasurementSidebar on all 34 chapters
- DataBadge on all figures via ChartContainer
- Cohort normalization toggle on forward-citation figures
- Originality/generality filter toggle
- TaxonomyCrossNote at technology share passages
- SkewnessExplainer in Ch 1.2

### ACT 6 Deep Dives Enrichment
- Green Innovation rendering bug fixed
- Registry-driven navigation, ACT 6 Overview dashboard
- Centralized metric definitions, event-causality lag checks
- Entrant vs. incumbent decomposition, quality bifurcation, domain-specific enrichments

### new_analysis_4.md (39 PatentsView Analyses)
- 33 of 39 analyses completed (6 skipped: g_examiner, g_patent_abstract, g_foreign_citation, g_attorney missing)
- 46 JSON data files generated, 59 new charts integrated
- HERO_STATS.visualizations updated (459 chapter + 1 homepage = 460 total)
- PWValueHeatmap component added

### Post-Analysis Audit (fix.md final execution)
- 59 chart titles verified against JSON data (3 mismatches fixed: NPL 2.7x, CR4 11.7%, gender 16.5%)
- Tone sweep: 30 edits across 12 files
- Hero stats verified: 460 visualizations (459 chapter + 1 homepage), 9.36M patents, 50 years, 34 chapters
- HomeContent.tsx: "over 40%" → "57%"
- 6 chapter descriptions updated to finding-first format (Ch 6, 7, 13, 19, 20, 21)
- Ch 7 InsightRecap stale numbers corrected
- ESLint: all unused imports removed
- Navigation: 34/34 correct prev/next links
- Cross-stat consistency: all key statistics consistent site-wide
- 24 untracked files committed (8 components/hooks + 16 JSON data files)

---

## PHASE 1: Fixes (All Completed)

### 1a. Standardize "fivefold" vs "five-fold" — COMPLETED (commit 660e9e19)

Two instances used "fivefold" (one word) while 10+ used "five-fold" (hyphenated). Both standardized to "five-fold":
- `src/app/chapters/inv-team-size/page.tsx` — "fivefold increase" → "five-fold increase"
- `src/app/chapters/system-patent-count/page.tsx` — "fivefold increase" → "five-fold increase"

### 1b. Hedging Language — Final Disposition

The following "approximately" / "roughly" instances were evaluated in prior sessions and determined to be **appropriate hedges** (genuine uncertainty or describing general patterns). Document as reviewed:

| File | Text | Disposition |
|------|------|-------------|
| `mech-inventors:589` | "approximately two years" | KEEP — recovery time is genuinely approximate |
| `inv-generalist-specialist:140` | "roughly one in five" | KEEP — approximate share description |
| `system-language:397` | "approximately equally" | KEEP — describing topic distribution |
| `inv-team-size:240` | "roughly doubled" | KEEP — describing general trend |
| `inv-team-size:274` | "approximately" + number | KEEP — approximate threshold |
| `mech-geography:175` | "approximately one-third" | KEEP — decline estimate |
| `mech-organizations:643` | "approximately" | KEEP — genuine approximation |

No action needed — all are legitimate hedges.

---

## PHASE 2: Unused Data Files Documentation

### 2a. Confirmed Unused JSON Files (do not delete)

These files exist in `public/data/` but are not referenced by any component. Flagged for author awareness:

| File | Status |
|------|--------|
| `act6/act6_npl_by_domain.json` | UNUSED — no chart references it |
| `computed/cohort_normalized_by_assignee.json` | UNUSED — intermediate pipeline output |
| `computed/cohort_normalized_by_geography.json` | UNUSED — intermediate pipeline output |
| `computed/cohort_normalized_by_inventor_group.json` | UNUSED — intermediate pipeline output |
| `computed/cohort_normalized_by_teamsize.json` | UNUSED — intermediate pipeline output |

---

## PHASE 3: Final Build Verification

### 3a. TypeScript and Build

1. Run `npx tsc --noEmit` — must be zero errors
2. Run `npm run build` — must be zero errors
3. Verify zero ESLint warnings

### 3b. Cross-Stat Final Check

Verify these key statistics appear identically everywhere:
- "9.36" (total patents)
- "161,888" (IBM cumulative)
- "five-fold" (growth multiple — now standardized)
- "460" (visualizations count)
- "34" (chapters count)
- "57%" (computing/electronics share)
- "14.9%" (female inventor share)
- "23.6%" (California patent share)

---

## PHASE 4: Commit and Deploy

After all phases pass:

1. Stage all modified files
2. Commit with descriptive message
3. Verify `npm run build` one final time
4. Push to origin/main
5. Deploy to Vercel production

---

## PHASE 5: Visualization Polish (from visualization.md)

### Existing Infrastructure Assessment

The following infrastructure already exists and should be extended (not replaced):

| Component | File | Status |
|-----------|------|--------|
| Okabe-Ito categorical palette | `src/lib/colors.ts` | DONE — CHART_COLORS, CPC_SECTION_COLORS, COUNTRY_COLORS, INDUSTRY_COLORS, ENTITY_COLORS, 10+ domain palettes |
| Sequential/diverging scales | `src/lib/chartTheme.ts` | DONE — sequentialScale(), divergingScale(), sequentialStops() |
| Typography constants | `src/lib/chartTheme.ts` | DONE — fontSize, fontSizeMobile, fontWeight |
| Time annotations | `src/components/charts/TimeAnnotations.tsx` | DONE — 5 events (dotcom, gfc, aia, alice, covid) |
| Domain-specific events | `src/lib/referenceEvents.ts` | DONE — PATENT_EVENTS + 10 domain arrays |
| Bump chart component | `src/components/charts/PWBumpChart.tsx` | DONE — full implementation |
| Basic number formatter | `src/lib/formatters.ts` | PARTIAL — only formatCompact |

### Execution Order: 7 → 1 → 2 → 10 → 5 → 4 → 9 → 6 → 3 → 8

---

### 5.7. Upgrade 7: Consistent Number Formatting — IMPLEMENT

**Current state:** Only `formatCompact(n)` exists in `src/lib/formatters.ts` (6 lines).

**Action:**
1. Expand `src/lib/formatters.ts` with:
   - `formatCount(value, context: 'axis' | 'tooltip')` — abbreviated for axes (300K), full for tooltips (300,000)
   - `formatPercent(value, decimals, context)` — auto-detect 0-1 vs 0-100 range, always show "X.Y%"
   - `formatIndex(value, decimals)` — for HHI, Gini, correlation
   - `formatYear(value)` — no thousands separator
2. Update default `yFormatter` in PW chart wrapper components to use these formatters
3. Verify no "2,014" for years, no "0.152" for 15.2%, no unnecessary decimals on integers

---

### 5.1. Upgrade 1: Perceptually Uniform Sequential Palette — ENHANCE

**Current state:** `chartTheme.ts` has `sequentialScale(t)` using HSL approximation (white → dark blue). `PWValueHeatmap` and `PWRankHeatmap` use this.

**Action:**
1. Add viridis 9-stop discrete array `SEQUENTIAL_SCALE` to `src/lib/colors.ts` for charts that need discrete stops
2. Add blue-to-orange `DIVERGING_SCALE` 9-stop array to `src/lib/colors.ts`
3. Verify all heatmaps use centralized scales — spot-check PWValueHeatmap and PWRankHeatmap
4. Ensure every heatmap has a labeled color legend with min/max values

---

### 5.2. Upgrade 2: Fixed Categorical Color Mapping — ENHANCE

**Current state:** `colors.ts` already has CPC_SECTION_COLORS (9), COUNTRY_COLORS (7), INDUSTRY_COLORS (10), ENTITY_COLORS (15), plus 10 domain subfield palettes. All use Okabe-Ito base.

**Action:**
1. Add missing mappings: `PATENT_TYPE_COLORS`, `ASSIGNEE_TYPE_COLORS`, `FILING_ROUTE_COLORS`
2. Add `getCpcColor(section)` helper
3. Handle CPC section D yellow-on-white: add 1px dark border or substitute with `#B8860B` (DarkGoldenrod)
4. Spot-check 3 CPC-colored charts across different chapters for consistency

---

### 5.10. Upgrade 10: Standardized Aspect Ratios — IMPLEMENT

**Current state:** ChartContainer defaults to `height: 600px`. No standardized aspect ratios.

**Action:**
1. Add `CHART_ASPECT_RATIOS` to `src/lib/chartTheme.ts`:
   - timeSeries: 3 (3:1), horizontalBar: 0.67 (2:3), heatmap: 1 (square), scatter: 1, slopeOrBump: 1.5
2. Update ChartContainer to accept an `aspectRatio` prop as alternative to fixed height
3. Apply via `aspect` prop on `ResponsiveContainer` where beneficial

---

### 5.5. Upgrade 5: Lollipop Charts for 20+ Entry Rankings — IMPLEMENT

**Current state:** No lollipop component. 16+ horizontal bar charts with 20+ entries identified.

**Action:**
1. Create `src/components/charts/PWLollipopChart.tsx`:
   - Horizontal orientation, circle (6px) + thin line (1px), category labels left-aligned
   - Value labels right of dot, descending sort by default
   - Color: single accent or categorical mapping
   - Responsive: top 20 on mobile with "Show all" button
2. Convert qualifying horizontal bar charts with 20+ entries
3. Spot-check 5 entries per converted chart

---

### 5.4. Upgrade 4: Slope Charts for Two-Period Comparisons — IMPLEMENT

**Current state:** No slope chart component.

**Action:**
1. Create `src/components/charts/PWSlopeChart.tsx`:
   - Left/right axes for two periods, connecting lines, labels at both ends
   - Hover highlight, sort toggle
   - Use categorical mapping from Upgrade 2 where applicable
2. Identify qualifying figures (5–20 categories at exactly 2 time points)
3. Convert qualifying figures, verify data fidelity

---

### 5.9. Upgrade 9: Bump Charts — ALREADY IMPLEMENTED

**Current state:** `PWBumpChart.tsx` exists with full implementation. 12 PWRankHeatmap instances exist for domain rankings.

**Action:** Verify existing bump chart meets spec (hover-highlight, click-pin, labels both ends, top 5 in color). No additional work expected.

---

### 5.6. Upgrade 6: Focus + Context Brushing — IMPLEMENT

**Current state:** No brushing. 28 files with 30+ year time series.

**Action:**
1. Add Recharts `<Brush>` to 10-15 most data-dense time-series charts
2. Default window: most recent 15 years
3. Brush dimensions: 40-50px overview below main chart
4. Target charts: annual grants (Ch 1.1), CPC section trends (Ch 1.3), forward citations (Ch 1.2), female inventor share (Ch 3.4), team size (Ch 3.5), international co-invention (Ch 4.2/5.3)

---

### 5.3. Upgrade 3: Policy Event Annotations — ENHANCE

**Current state:** `TimeAnnotations.tsx` has 5 events. `referenceEvents.ts` has PATENT_EVENTS (7) + domain arrays. Both exist independently.

**Action:**
1. Expand `POLICY_EVENTS` in `referenceEvents.ts` to include: Federal Circuit (1982), State Street Bank (1998), AIPA (2000), KSR v. Teleflex (2007), AIA FITF (2013), TC Heartland (2017)
2. Add a per-chart "Policy events" toggle (default OFF for ≤20yr, ON for >30yr)
3. Apply to qualifying time-series charts (≥15 years, calendar year x-axis, patent system metric)

---

### 5.8. Upgrade 8: ACT 6 Overview Sparklines — IMPLEMENT IF DATA EXISTS

**Current state:** ACT 6 overview (`deep-dive-overview/page.tsx`) has 5 charts + domain index grid. No sparklines.

**Action:**
1. Check if per-domain annual patent data exists in `public/data/act6/`
2. If yes: build inline sparkline (80-120px × 20-30px, no axes, normalized to own min/max)
3. If no: log as INFEASIBLE and skip

---

## FLAGGED FOR AUTHOR REVIEW (Not Actionable Without Author Input)

These items were identified during prior audit sessions and require author decisions:

1. **6th Company Profile View** (Ch 2.5): "Intra-Firm Co-Invention Network Metrics" is not implemented. Requires running additional data pipeline scripts to generate `intra_firm_network_metrics_5yr.json`, `org_copatenting_network_metrics_5yr.json`, `inventor_coinvention_network_metrics_5yr.json`.

2. **Network Metrics Sections** in ACT 5 chapters: Ch 5.1 (inter-firm co-patenting), Ch 5.2 (co-invention network), Ch 5.3 (co-patenting + co-invention network) — missing data files.

3. **robots.txt AI Bot Policy**: Currently allows all AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, CCBot). Author should review whether to block AI training crawlers.

4. **Sitemap Submission**: After deployment, submit sitemap to Google Search Console and Bing Webmaster Tools.

5. **5 Unused JSON Files**: Listed in Phase 2a above. Author should decide whether to keep or remove.
