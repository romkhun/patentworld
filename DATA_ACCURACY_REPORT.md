# PatentWorld — Data Accuracy Report

## Executive Summary

A comprehensive audit of all 40 data pipeline scripts, 107 JSON data files, and 14+ frontend page components was conducted. The audit examined data loading, filtering, aggregation, citation direction, CPC handling, period binning, and output validation through systematic code review and spot-checks against actual data.

### Overall Assessment: **Data is substantially correct**

The vast majority of computations produce accurate results. Citation direction — the most critical and error-prone aspect of patent data analysis — is **correct in every script**. CPC handling follows appropriate patterns (primary CPC for classification, all CPC for breadth). Year boundaries and patent type filters are consistently applied.

However, **a systematic period-binning bug** affects 8 scripts, and **one critical forward-citation window bug** affects company profiles. These are documented below with recommended fixes.

---

## Error Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **HIGH** | 5 | Period binning bug (8 scripts), bridge inventor artifacts, forward citation window |
| **MEDIUM** | 9 | Label ambiguity, missing data fields, double-counting, z-score methodology |
| **LOW** | 20+ | Float types, cosmetic labels, upstream data quality, proxy limitations |

### The Period Binning Bug (HIGH — 8 scripts)

**Root cause**: In DuckDB, integer `/` returns a float. `(1976 / 5) * 5` evaluates to `1976.0`, not `1975`. The pattern `CAST((yr / N) * N AS INTEGER)` therefore maps each year to itself instead of producing discrete N-year bins.

**Fix**: Use `FLOOR(yr / N) * N` or `(yr // N) * N` (integer floor division).

**Affected scripts and outputs**:
| Script | Output | Expected Bins | Actual |
|--------|--------|---------------|--------|
| 14_chapter10_patent_law.py | hhi_by_section.json | ~80 records (10 periods × 8 sections) | 400 records (50 years × 8 sections) |
| 15_chapter3_portfolio_diversity.py | portfolio_diversity.json | ~250 records | 1,103 records |
| 17_chapter7_citation_lag.py | citation_lag_by_section.json | ~40 records (5 decades × 8 sections) | 328 records |
| 19_chapter8_friction_maps.py | friction_map.json | ~80 records | 400 records |
| 20_chapter5_inventor_mobility.py | inventor_mobility_by_decade.json | ~5 records | 41 records |
| 25_chapter5_gender_deep.py | gender_section_trend.json | ~80 records | 400 records |
| 26_chapter4_diffusion.py | innovation_diffusion.json | ~6K records | ~29K records |
| 27_chapter6_network_deep.py | network_metrics_by_decade.json | ~5 records | 41 records |

**Frontend impact**: All affected visualizations still render correctly because the chart components handle arbitrary data lengths. The data is simply more granular than intended (per-year instead of per-period). Values are individually correct — only the grouping granularity is wrong. No directional errors or wrong totals result from this bug.

**Note**: Scripts 30, 36, 38, 40 correctly use `FLOOR()` and are unaffected.

### Forward Citation 5-Year Window Bug (HIGH — script 32)

**In `32_company_profiles.py`**: The 5-year forward citation window filter is applied on a LEFT JOIN's ON clause. When a citing patent falls outside the window, the LEFT JOIN produces NULL but the citation row from the first join survives. `COUNT(cit.patent_id)` counts ALL forward citations regardless of timing.

**Impact**: `median_citations_5yr` in `company_profiles.json` measures total forward citations, not 5-year window citations. This inflates citation metrics for all 100 company profiles.

**Fix required**: Restructure the query to apply the 5-year filter as a WHERE clause with NULL handling, or use a pre-filtered CTE.

---

## Verified Statistics

The following key statistics were spot-checked against raw JSON data files and confirmed accurate:

| Statistic | Value | Source | Status |
|-----------|-------|--------|--------|
| Total patents (all types) | 9,361,444 | hero_stats.json | OK |
| Peak year | 2019 (392,618) | hero_stats.json | OK |
| Utility patents 1976 | 70,199 | patents_per_year.json | OK |
| Grant lag peak | 3.82 years (2010) | grant_lag.json | OK |
| CPC G+H share recent | 57.7% | cpc_sections_per_year.json | OK |
| CPC G+H share 1970s | 27.6% | cpc_sections_per_year.json | OK |
| G+H gain | 30.0 pp | Computed | OK |
| Team size 1976 | 1.7 | team_size_per_year.json | OK |
| Team size 2025 | 3.22 | team_size_per_year.json | OK |
| Solo inventor share | 23.5% (2025) | solo_inventors.json | OK |
| Top inventor | Yamazaki (6,709) | prolific_inventors.json | OK |
| #1 state | California (992,708) | us_states_summary.json | OK |
| Top 5 states share | 46.0% of US-state total | us_states_summary.json | OK |
| #1 city | San Jose (96,068) | top_cities.json | OK |
| IBM #1 assignee | 161,888 patents | top_assignees.json | OK |
| Foreign surpassed domestic | 2020 | domestic_vs_foreign.json | OK |
| Top-100 share | 31–37% across periods | concentration.json | OK |
| Citation lag trend | **INCREASING** 2.91→16.24 yr | citation_lag_trend.json | OK |
| Forward citations 5yr | **INCREASING** 2.53→6.40 | quality_trends.json | OK |
| Generality | **DECLINING** 0.28→0.17 | originality_generality.json | OK |
| Composite quality | **INCREASING** -0.23→+0.16 | composite_quality_index.json | OK |
| #1 gov agency | HHS (55,587) | gov_agencies.json | OK |
| AI #1 filer | IBM (16,781) | ai_top_assignees.json | OK |
| Green #1 filer | Samsung (13,771) | green_top_companies.json | OK |
| Technology half-life (H) | 10.7 years | technology_halflife.json | OK |
| Technology half-life (A) | 15.6 years | technology_halflife.json | OK |
| US-China co-invention | 2.11% (2025) | co_invention_rates (batch) | OK |
| Canon self-citation rate | 47.6% | self_citation_analysis (batch) | OK |
| NMF topics processed | 8.45M abstracts | topic_definitions.json | OK |
| Green patent share | ~10% (2023) | green_volume.json | OK |
| Corporate survival rate | 64.5% avg | corporate_mortality.json | OK |

### Critical Directional Claims — ALL VERIFIED CORRECT

The three claims that required directional reversal in Stream 2 accuracy audit have been re-verified:

1. **Citation lag INCREASING** (Ch7) — Confirmed: avg_lag_years rises from 2.91 (1980) to 16.24 (2025)
2. **Forward citations INCREASING** (Ch9) — Confirmed: avg_forward_cites_5yr rises from 2.53 (1976) to 6.40 (2019)
3. **Generality DECLINING** (Ch9) — Confirmed: avg_generality falls from 0.28 (1976) to 0.17 (2019)

---

## Inline Transformation Fixes Applied

| Fix | File | Description |
|-----|------|-------------|
| Null guard on assignee | innovation-dynamics/page.tsx:522 | `m.assignee?.length` → proper null check with fallback |
| Weighted comeback stats | the-inventors/page.tsx:840-857 | Changed from `comebackData[0]` to weighted average across all gap cohorts |
| useMemo→useEffect | collaboration-networks/page.tsx:59-63 | Replaced side-effectful `useMemo` with proper `useEffect` |
| Optional chaining | green-innovation/page.tsx:184-185 | `peakYear?.green_pct.toFixed(1)` → `peakYear?.green_pct?.toFixed(1)` |

---

## Remaining Risks

### Data Quality (Upstream PatentsView)
- **Inventor disambiguation**: Common names (particularly East Asian) may be incorrectly merged or split. Bridge inventor analysis (script 27) is particularly affected.
- **Gender inference**: Probabilistic name-based model has systematic errors for non-Western names and gender-ambiguous names.
- **Marshall Islands anomaly**: 10K+ patents attributed to MH state, likely a location disambiguation error.
- **Assignee type classification**: Some universities/government labs may be misclassified.

### Methodological Limitations
- **First-inventor location**: All geographic analyses use `inventor_sequence=0`, capturing only the first listed inventor's location. Multi-location teams are underrepresented.
- **5-year citation windows**: Forward citations within 5 years of grant systematically undercount citations for recent patents (right-truncation). All scripts appropriately cap analysis at 2020.
- **Composite quality z-scores**: Using global means/stddevs across 1976–2020 means secular trends inflate recent years' composite index. This is a methodological choice, not a bug.
- **Self-citation via assignee name matching**: Organizational name changes (e.g., "Google Inc." → "Google LLC") or subsidiary variations could affect self-citation rates.

### Frontend
- **Unmemoized inline transforms**: Some `useMemo`-wrapped transforms in JSX could benefit from optimization, but have no correctness impact.
- **Variable naming**: `decades` variable in innovation-dynamics holds section names — cosmetic only.

---

## Build Verification

```
npm run build → ✓ Compiled successfully
All 22 routes prerendered as static content
No TypeScript errors, no runtime errors
```

---

## Recommendations

### Priority 1 (Should fix before publication)
1. Fix forward citation 5-year window in script 32 and regenerate `company_profiles.json`
2. Fix period binning in scripts 14, 15, 17, 19, 20, 25, 26, 27 using `FLOOR()` and regenerate affected JSON files

### Priority 2 (Improve accuracy)
3. Add patent_type filter to top-N identification in scripts 35, 36
4. Fix superstar concentration double-counting in script 16
5. Add warning labels to applications_vs_grants for recent years (script 14)

### Priority 3 (Nice to have)
6. Fix name mapping artifacts ("Deere &", "Merck &") in script 31
7. Add G06T to AI class definitions in script 12
8. Document first-inventor limitation in geographic analyses
9. Filter or caveat bridge inventor data quality issues

---

*Audit completed 2026-02-14. All 40 pipeline scripts reviewed, 107 JSON files validated, 30+ critical statistics spot-checked.*
