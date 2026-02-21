# Glossary, Error/Loading States, and Small-Sample Warnings Audit

Generated: 2026-02-21

---

## 1. Glossary Completeness (Section 1.9.7)

### 1.1 Defined Glossary Terms

The glossary at `src/lib/glossary.ts` defines **30 terms**:

| # | Key | Term |
|---|-----|------|
| 1 | `CPC` | Cooperative Patent Classification |
| 2 | `forward citations` | Forward citations |
| 3 | `grant lag` | Grant lag |
| 4 | `assignee` | Assignee |
| 5 | `utility patent` | Utility patent |
| 6 | `design patent` | Design patent |
| 7 | `HHI` | Herfindahl-Hirschman Index |
| 8 | `originality` | Originality |
| 9 | `generality` | Generality |
| 10 | `patent thicket` | Patent thicket |
| 11 | `PatentsView` | PatentsView |
| 12 | `WIPO` | WIPO |
| 13 | `Bayh-Dole Act` | Bayh-Dole Act |
| 14 | `AIA` | America Invents Act |
| 15 | `Alice decision` | Alice decision |
| 16 | `topic modeling` | Topic modeling |
| 17 | `TF-IDF` | TF-IDF |
| 18 | `NMF` | NMF |
| 19 | `UMAP` | UMAP |
| 20 | `Shannon entropy` | Shannon entropy |
| 21 | `Jensen-Shannon divergence` | Jensen-Shannon divergence |
| 22 | `cosine similarity` | Cosine similarity |
| 23 | `citation half-life` | Citation half-life |
| 24 | `talent flow` | Talent flow |
| 25 | `k-means clustering` | K-means clustering |
| 26 | `radar chart` | Radar chart |
| 27 | `chord diagram` | Chord diagram |
| 28 | `Sankey diagram` | Sankey diagram |
| 29 | `Y02` | Y02 |
| 30 | `green patents` | Green patents |
| 31 | `WIPO technology fields` | WIPO technology fields |

### 1.2 GlossaryTooltip Usage Across Chapters

**22 chapter pages** use `<GlossaryTooltip>`. The following terms are actively tooltipped:

| Term | Chapters Using It |
|------|-------------------|
| `CPC` | system-patent-quality, system-convergence, cybersecurity, ai-patents, semiconductors, quantum-computing, autonomous-vehicles, agricultural-technology |
| `forward citations` | system-patent-quality, org-patent-quality, inv-top-inventors |
| `green patents` | green-innovation |
| `Y02` | green-innovation |
| `design patent` | org-patent-count |
| `utility patent` | system-patent-count |
| `grant lag` | system-patent-count |
| `originality` | system-patent-quality |
| `generality` | system-patent-quality |
| `Bayh-Dole Act` | system-public-investment, system-patent-law |
| `Alice decision` | system-patent-law |
| `AIA` | system-patent-law |
| `topic modeling` | system-language |
| `TF-IDF` | system-language |
| `NMF` | system-language |
| `UMAP` | system-language, org-patent-portfolio |
| `Shannon entropy` | org-patent-portfolio, inv-generalist-specialist |
| `Jensen-Shannon divergence` | org-patent-portfolio |
| `cosine similarity` | org-patent-portfolio |
| `talent flow` | mech-inventors |
| `Sankey diagram` | mech-inventors |
| `chord diagram` | mech-organizations |
| `citation half-life` | org-patent-quality |
| `blockbuster rate` | org-patent-quality |
| `dud rate` | org-patent-quality |
| `terminal disclaimer` | system-patent-law |

### 1.3 FINDING: GlossaryTooltip Terms Missing from Glossary

Three terms are used in `<GlossaryTooltip>` but have **no corresponding entry** in `GLOSSARY`:

| Missing Term | File | Line |
|-------------|------|------|
| **`blockbuster rate`** | `org-patent-quality/page.tsx` | 185 |
| **`dud rate`** | `org-patent-quality/page.tsx` | 185 |
| **`terminal disclaimer`** | `system-patent-law/page.tsx` | 689 |

**Impact:** The `GlossaryTooltip` component has a graceful fallback -- when `GLOSSARY[term]` is undefined, it renders `{children ?? term}` without any tooltip. So these three terms render as plain text with no tooltip popup, silently failing. Users see the text but get no definition on hover.

### 1.4 FINDING: Technical Terms in Narrative Text Without Glossary Tooltips

The following terms appear in chapter narrative text but are **not defined in the glossary** and **not wrapped in GlossaryTooltip**:

| Term | Occurrences | Example Chapters |
|------|-------------|------------------|
| **prior art** | ~35 occurrences | system-patent-quality, system-patent-fields, inv-team-size, inv-generalist-specialist, blockchain, space-technology, many others |
| **claim count** | ~30 occurrences | system-patent-quality, system-patent-fields, geo-domestic, geo-international, org-patent-quality, inv-serial-new |
| **patent family** | ~5 occurrences | system-patent-law, org-patent-count |
| **continuation patent / continuation filing** | ~8 occurrences | org-patent-count, system-patent-count, deep-dive-overview |
| **prosecution history / prosecution strategy** | ~5 occurrences | inv-serial-new, org-patent-quality |
| **inter partes review** | ~8 occurrences | system-patent-law |
| **patent portfolio** | ~50+ occurrences | Nearly every chapter |
| **technology class** | ~20 occurrences | system-patent-fields, inv-team-size, inv-generalist-specialist |
| **subfield diversity** | ~12 occurrences | All deep-dive chapters |
| **Herfindahl** (in captions, not as HHI) | ~12 occurrences | inv-team-size, inv-gender, inv-generalist-specialist, system-patent-fields |
| **provisional application** | 0 | Not used in any chapter |
| **blockbuster rate** (outside tooltip) | ~25 occurrences | mech-organizations, org-patent-quality, org-company-profiles |

### 1.5 Chapters Without Any GlossaryTooltip Usage

**13 of 35 chapter pages** use no glossary tooltips at all:

1. `deep-dive-overview/page.tsx`
2. `geo-domestic/page.tsx`
3. `geo-international/page.tsx`
4. `inv-gender/page.tsx`
5. `inv-serial-new/page.tsx`
6. `inv-team-size/page.tsx`
7. `mech-geography/page.tsx`
8. `org-composition/page.tsx`
9. `org-company-profiles/page.tsx`
10. `digital-health/page.tsx`
11. `biotechnology/page.tsx`
12. `blockchain/page.tsx`
13. `3d-printing/page.tsx`
14. `space-technology/page.tsx`

### 1.6 Glossary Recommendations

**Priority 1 -- Add missing glossary definitions (terms already tooltipped but undefined):**
- `blockbuster rate` -- "The share of a firm's patents that rank in the top 1% of their year x CPC section cohort by forward citations. A blockbuster rate above 1% indicates disproportionate high-impact output."
- `dud rate` -- "The share of a firm's patents receiving zero forward citations within 5 years of grant. High dud rates indicate a large proportion of patents with no measurable downstream impact."
- `terminal disclaimer` -- "A mechanism by which a patent owner voluntarily limits a patent's enforceable life to match that of a related patent, typically filed to overcome a double-patenting rejection during prosecution."

**Priority 2 -- Add glossary definitions for frequently used technical terms:**
- `prior art` -- Appears ~35 times across many chapters
- `claim count` -- Appears ~30 times
- `continuation patent` -- Appears ~8 times
- `inter partes review` -- Appears ~8 times
- `patent portfolio` -- Extremely common but may be considered too general

**Priority 3 -- Add GlossaryTooltip wrappers to chapters currently lacking them:**
- Several deep-dive chapters (digital-health, biotechnology, blockchain, 3d-printing, space-technology) use terms like CPC, forward citations, and originality in narrative text without wrapping them in GlossaryTooltip.

---

## 2. Error/Loading States (Section 1.9.8)

### 2.1 useChapterData Hook Analysis

**File:** `src/hooks/useChapterData.ts`

The hook provides a clean three-state return: `{ data, loading, error }`.

**Strengths:**
- Returns `loading: boolean` and `error: string | null` alongside `data`
- Has a proper try/catch via `.catch()` on the fetch promise
- Validates HTTP status codes (`if (!res.ok) throw new Error(...)`)
- Implements an in-memory cache (`Map<string, any>`) to prevent re-fetching
- Uses a `cancelled` flag to prevent state updates on unmounted components
- Error message includes the file path and HTTP status code

**Assessment: WELL IMPLEMENTED.** The hook itself handles loading, error, and cache states correctly.

### 2.2 ChartContainer Loading State

**File:** `src/components/charts/ChartContainer.tsx`

**Strengths:**
- Has a dedicated loading state with an animated skeleton placeholder (faux bar chart with pulse animation)
- Uses `useInView` to defer rendering until the chart scrolls into view (`loading || !inView`)
- Provides proper `aria-label={Loading chart: ${title}}` for screen readers
- Includes a `<noscript>` fallback for non-JS environments
- Shows "Loading visualization..." text during loading

**Assessment: WELL IMPLEMENTED.** The loading skeleton is visually polished and accessible.

### 2.3 FINDING: Error State Not Propagated to UI in Most Chapters

**Critical gap:** The `useChapterData` hook returns an `error` field, but **no chapter page destructures or uses it**. Every chapter uses the pattern:

```tsx
const { data: someData, loading: someL } = useChapterData<SomeType>('path/to/file.json');
```

The `error` field is silently discarded. If a JSON file fails to load (404, network error), the chapter will:
1. Show loading state briefly
2. Then render with `data = null` and `loading = false`
3. Charts will either show nothing or crash

**Exception:** `org-company-profiles/page.tsx` is the ONLY chapter that handles empty/error states comprehensively:
- `NoDataPlaceholder` component for per-section empty states
- Explicit error state when company list is empty after loading
- Loading text with descriptive message
- Empty state when no company is selected

### 2.4 Loading State Handling in Chapters

Most chapters pass `loading` to `ChartContainer`:

```tsx
<ChartContainer title="..." loading={pyL || sfL}>
```

This is effective because ChartContainer shows its skeleton when `loading` is true. However, narrative text sections that derive computed values from data (e.g., `{formatCompact(totalGreen)}`) will show fallback values or potentially crash if data is null.

### 2.5 Empty-State Handling

| Pattern | Coverage |
|---------|----------|
| ChartContainer skeleton (loading) | All chapters via ChartContainer |
| Null-data guards (`data && ...`) | Partial -- many charts use `data ?? []` patterns |
| NoDataPlaceholder component | Only `org-company-profiles` |
| Empty array checks (`.length === 0`) | Scattered: org-company-profiles, mech-organizations, system-language, system-convergence, mech-inventors |
| Error message display | Only `org-company-profiles` |

### 2.6 Map Components Loading

Two map components have their own loading states:
- `PWWorldFlowMap.tsx:293` -- "Loading map..." text while topology loads
- `PWChoroplethMap.tsx:126` -- "Loading map..." text while topology loads

### 2.7 Error/Loading Recommendations

**Priority 1 -- Add error state rendering:**
Create a shared `ErrorState` component and use it alongside loading checks:
```tsx
const { data, loading, error } = useChapterData<T>('path.json');
if (error) return <ErrorBanner message={error} />;
```

**Priority 2 -- Add empty-state handling to all chapters:**
Currently only `org-company-profiles` has proper empty-state handling. Other chapters should guard against `data === null` after loading completes without error.

**Priority 3 -- Add global error boundary:**
No `error.tsx` or React ErrorBoundary was found in the chapters layout. A chapter-level error boundary would prevent individual data loading failures from crashing the entire page.

---

## 3. Small-Sample Warnings (Section 1.9.11)

### 3.1 Existing Small-Sample Disclosures

Only **2 instances** of explicit small-sample warnings were found across all chapters:

1. **green-innovation/page.tsx:837** -- Velocity cohort insight:
   > "...though the small sample sizes for the 2010s (1 organization) and 2020s (2 organizations) cohorts prevent reliable velocity estimates for the most recent entrants."

2. **quantum-computing/page.tsx:859** -- Velocity cohort insight:
   > "The 1990s cohort (2 organizations, excluded for small sample size) had much higher velocity..."

3. **inv-top-inventors/page.tsx:517** -- Caveat about gender estimation:
   > "**Caveat:** This estimate relies on exact first-name and last-name matching..."
   (This is a methodology caveat rather than a small-sample warning per se.)

### 3.2 FINDING: Deep-Dive Chapters Lack Early-Year Small-N Warnings

The 10 deep-dive technology domain chapters cover fields that were nascent or nonexistent before 2000:

| Chapter | Domain | First Significant Patents | Early-Year Warning? |
|---------|--------|--------------------------|---------------------|
| `ai-patents` | AI | ~1985, rapid growth after 2012 | NO |
| `quantum-computing` | Quantum | ~1998, growth after 2015 | Partial (1990s cohort noted) |
| `blockchain` | Blockchain | ~2012 | NO |
| `cybersecurity` | Cybersecurity | ~1990 | NO |
| `digital-health` | Digital Health | ~1990 | NO |
| `autonomous-vehicles` | AV | ~1995 | NO |
| `semiconductors` | Semiconductors | 1976 (established) | N/A |
| `space-technology` | Space | 1976 (established) | NO |
| `agricultural-technology` | AgTech | 1976 (established) | NO |
| `3d-printing` | 3D Printing | ~1985, growth after 2012 | NO |
| `green-innovation` | Green | ~1976, growth after 2005 | Partial (velocity cohort) |
| `biotechnology` | Biotech | ~1980 | NO |

**Key concern:** Chapters like `blockchain` (virtually no patents before 2012), `quantum-computing` (minimal before 2005), and `3d-printing` (sparse before 2010) show data going back to 1976 in their charts. Early-year data points represent extremely small samples (often single-digit patent counts) that can produce volatile percentages and misleading trends, but no warnings alert readers.

### 3.3 Partial-Year 2025 Disclosure

**Layout-level disclosure (GOOD):** The chapters layout at `src/app/chapters/layout.tsx:17` includes a footer note:
> "Data coverage: January 1976 through September 2025. All 2025 figures reflect partial-year data."

**Chapter-level disclosure (INCONSISTENT):**

| Disclosure Pattern | Chapters | Count |
|-------------------|----------|-------|
| Explicit "(through September)" in text/titles | inv-gender, mech-geography, system-patent-count, system-patent-quality, inv-team-size, system-public-investment | 7 chapters |
| "1976-2025" in captions without partial-year note | 26 chapters (184 occurrences) | 26 chapters |
| Code-level exclusion of 2025 (filtering out distorted data) | system-patent-law (lines 383, 433) | 1 chapter |

**184 occurrences** of "1976-2025" appear in chapter captions and subtitles without noting that 2025 is partial. While the layout footer provides a blanket disclosure, readers examining individual charts may not see it.

### 3.4 FINDING: No Systematic Partial-Year Marker on Charts

Charts that display 2025 data do not have a visual marker (e.g., dashed line, lighter bar, asterisk) to distinguish the partial 2025 data point from full-year data. The only safeguard is the layout footer.

### 3.5 Small-Sample Recommendations

**Priority 1 -- Add small-N warnings to deep-dive chapters with emerging tech:**
- `blockchain` (pre-2012 data)
- `quantum-computing` (pre-2005 data)
- `3d-printing` (pre-2010 data)
- `ai-patents` (pre-2000 data)
- `autonomous-vehicles` (pre-2000 data)

These chapters should include a note in their methodology section or early narrative text, e.g.:
> "Note: Patent counts in the early years of this domain are small (often fewer than 50 per year), and percentages derived from these counts may exhibit high volatility."

**Priority 2 -- Standardize 2025 partial-year disclosure:**
Either:
- Add "(through September)" consistently to all chart captions mentioning 2025, OR
- Add a visual marker on 2025 data points in all time-series charts (e.g., dashed bar, lighter opacity, asterisk)

**Priority 3 -- Add small-sample warnings to velocity/cohort analyses:**
Several deep-dive chapters show organizational velocity by entry cohort. When cohorts have fewer than 5 organizations, the velocity estimate is unreliable. Only `green-innovation` and `quantum-computing` currently note this.

---

## Summary of Findings

### Critical Issues

| # | Section | Finding | Severity |
|---|---------|---------|----------|
| 1 | Glossary | 3 GlossaryTooltip terms (`blockbuster rate`, `dud rate`, `terminal disclaimer`) are used but undefined -- tooltips silently fail | **HIGH** |
| 2 | Error States | `error` from useChapterData is never consumed by any chapter page (except org-company-profiles) | **HIGH** |
| 3 | Small-Sample | 5+ deep-dive chapters lack early-year small-N warnings for nascent technology domains | **MEDIUM** |

### Moderate Issues

| # | Section | Finding | Severity |
|---|---------|---------|----------|
| 4 | Glossary | 13 of 35 chapters use no GlossaryTooltip at all | **MEDIUM** |
| 5 | Glossary | High-frequency terms like "prior art" (~35 uses), "claim count" (~30 uses), "patent portfolio" (50+ uses) are not in the glossary | **MEDIUM** |
| 6 | Error States | No global error boundary for chapter pages | **MEDIUM** |
| 7 | Small-Sample | 184 occurrences of "1976-2025" without partial-year annotation; only 7 chapters use "(through September)" inline | **MEDIUM** |

### Strengths

| # | Section | Strength |
|---|---------|----------|
| 1 | Error States | `useChapterData` hook properly returns loading/error/data with cache |
| 2 | Error States | `ChartContainer` has polished loading skeleton with accessibility |
| 3 | Error States | `org-company-profiles` demonstrates excellent empty/error state patterns |
| 4 | Small-Sample | Layout footer provides blanket 2025 partial-year disclosure |
| 5 | Glossary | GlossaryTooltip has graceful fallback (renders plain text when term not found) |
| 6 | Small-Sample | 2 deep-dive chapters explicitly note small sample sizes in velocity cohorts |
