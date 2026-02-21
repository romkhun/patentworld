# Track C — Derived Metrics Verification (§1.8.1)

**Date:** 2026-02-21
**Method:** Code review of pipeline scripts + comparison against academic literature

---

## 1. Originality Index

| Field | Detail |
|-------|--------|
| **Name on site** | Originality |
| **Formula (code)** | `1 - HHI` of backward citation CPC sections. `HHI = Σ sᵢ²` where sᵢ = share of backward citations in CPC section i |
| **File path** | `data-pipeline/computed/03_originality.py`, SQL in `data-pipeline/15_quality_metrics.py` |
| **Cited source** | Trajtenberg, Henderson, Jaffe (1997) |
| **Standard definition** | 1 - Σ sᵢ² where sᵢ = share of citations in NBER technology category i |
| **Match?** | Partial — formula structure correct but uses CPC sections (8 categories) instead of NBER categories (~36). Compresses range toward 0. |
| **Pages used** | system-patent-quality, org-patent-quality, all 12 Deep Dives, methodology |
| **Consistent?** | Yes — same computation everywhere |
| **Disclosure** | ✅ Methodology page notes CPC section granularity and compressed range (C-4). HJT small-sample correction not applied (C-5, disclosed). |

## 2. Generality Index

| Field | Detail |
|-------|--------|
| **Name on site** | Generality |
| **Formula (code)** | `1 - HHI` of forward citation CPC sections |
| **File path** | `data-pipeline/computed/04_generality.py`, SQL in `data-pipeline/15_quality_metrics.py` |
| **Cited source** | Hall, Jaffe, Trajtenberg (2001) |
| **Standard definition** | 1 - Σ sᵢ² where sᵢ = share of forward citations in technology category i |
| **Match?** | Same partial match as originality (CPC sections vs. NBER categories) |
| **Pages used** | system-patent-quality, org-patent-quality, Deep Dives, methodology |
| **Consistent?** | Yes |
| **Disclosure** | ✅ Same as originality |

## 3. Shannon Entropy

| Field | Detail |
|-------|--------|
| **Name on site** | Shannon entropy, diversity, novelty (median entropy) |
| **Formula (code)** | `H = -Σ pᵢ log(pᵢ)` — log₂ in topic modeling (script 28), ln in portfolio analysis (scripts 35, 37, 15) |
| **File path** | `data-pipeline/28_nlp_topics.py` (log₂), `data-pipeline/35_portfolio_strategy.py` (ln), `data-pipeline/37_domain_utils.py` (ln) |
| **Cited source** | Shannon (1948) |
| **Standard definition** | H = -Σ pᵢ log(pᵢ); log base is convention (log₂ = bits, ln = nats) |
| **Match?** | ✅ Yes — both log bases are valid. The issue was inconsistency across analyses without disclosure. |
| **Pages used** | system-language (log₂), org-patent-portfolio (ln), all 12 Deep Dives (ln), methodology |
| **Consistent?** | Yes within each usage context; different log bases between topic modeling and portfolio analysis |
| **Disclosure** | ✅ Methodology page specifies log₂ for topics, ln for portfolios (C-1, C-6, C-7) |

## 4. Herfindahl-Hirschman Index (HHI)

| Field | Detail |
|-------|--------|
| **Name on site** | HHI, concentration |
| **Formula (code)** | `Σ sᵢ² × 10,000` where sᵢ are market shares as proportions |
| **File path** | `data-pipeline/35_portfolio_strategy.py`, `data-pipeline/37_domain_utils.py` |
| **Cited source** | Standard DOJ/FTC convention |
| **Standard definition** | Σ sᵢ² × 10,000 (scaled) or Σ sᵢ² (unscaled) |
| **Match?** | ✅ Correct |
| **Pages used** | All Deep Dives, org-patent-portfolio, methodology |
| **Consistent?** | Yes |

## 5. Blockbuster Rate

| Field | Detail |
|-------|--------|
| **Name on site** | Blockbuster rate, blockbuster patent rate |
| **Formula (code)** | Share of patents in top 1% of 5-year forward citations within grant-year × CPC section cohort |
| **File path** | `data-pipeline/computed/05_blockbuster.py`, `data-pipeline/41_firm_quality.py`, `data-pipeline/65_domain_quality.py` |
| **Cited source** | Implicit (top-percentile citation threshold) |
| **Standard definition** | Various thresholds used in literature (1%, 5%, 10%); cohort normalization is standard |
| **Match?** | ✅ — 1% threshold within year×section cohort is a defensible choice |
| **Pages used** | org-patent-quality, all 12 Deep Dives |
| **Consistent?** | Yes — all visible pages use 5-year, 1% threshold. Script 11 also computes lifetime-based "breakthrough" but that file is never loaded by any page. |

## 6. CR4 (Four-Firm Concentration Ratio)

| Field | Detail |
|-------|--------|
| **Name on site** | CR4, top-four concentration, four-firm concentration ratio |
| **Formula (code)** | Sum of top 4 organizations' annual patent counts ÷ total domain patents |
| **File path** | `data-pipeline/37_domain_utils.py` (shared across all 12 Deep Dives) |
| **Cited source** | Standard industrial organization metric |
| **Standard definition** | CR4 = Σ(s₁ + s₂ + s₃ + s₄) where sᵢ = market share of firm i |
| **Match?** | ✅ Correct |
| **Pages used** | All 12 Deep Dives, deep-dive-overview |
| **Consistent?** | Yes — shared code path via domain_utils.py |

## 7. Exploration Score

| Field | Detail |
|-------|--------|
| **Name on site** | Exploration score, exploration vs. exploitation |
| **Formula (code)** | Share of patents in CPC classes new to the firm in prior 5-year window |
| **File path** | `data-pipeline/20_exploration_exploitation.py` |
| **Cited source** | March (1991) exploration-exploitation framework |
| **Standard definition** | Operationalized variously; new-class entry rate is a standard measure |
| **Match?** | ✅ Implementation is a standard operationalization |
| **Pages used** | mech-organizations |
| **Consistent?** | Yes (single usage) |

## 8. Grant Lag

| Field | Detail |
|-------|--------|
| **Name on site** | Grant lag, pendency |
| **Formula (code)** | `patent_date - filing_date` in days, converted to years |
| **File path** | `data-pipeline/01_patent_counts.py` |
| **Cited source** | N/A (standard measure) |
| **Standard definition** | Time between patent application filing and grant |
| **Match?** | ✅ Correct |
| **Pages used** | system-patent-count, org-company-profiles, all Deep Dives |
| **Consistent?** | Yes |
| **Note** | PatentsView filing_date has some corrupt values (e.g., "1074-08-14"). Pipeline validates date ranges. |

## 9. Cohort-Normalized Citations

| Field | Detail |
|-------|--------|
| **Name on site** | Cohort-normalized citations, normalized forward citations |
| **Formula (code)** | Patent citations ÷ mean citations in same grant-year × CPC section |
| **File path** | `data-pipeline/computed/02_cohort_norm.py` |
| **Cited source** | Standard bibliometric normalization |
| **Standard definition** | Citations ÷ expected citations for same year-field cohort |
| **Match?** | ✅ Correct |
| **Pages used** | system-patent-quality, org-patent-quality, geo-international, all Deep Dives |
| **Consistent?** | Yes |

## 10. Patent Velocity

| Field | Detail |
|-------|--------|
| **Name on site** | Patent velocity, patents per active year |
| **Formula (code)** | Total patents ÷ years active (from first to last patent year) |
| **File path** | `data-pipeline/37_domain_utils.py` |
| **Cited source** | N/A (descriptive measure) |
| **Standard definition** | N/A — site-specific operationalization |
| **Match?** | ✅ Clear and defensible |
| **Pages used** | All 12 Deep Dives |
| **Consistent?** | Yes — shared code path |

---

## Summary

| Metric | Code vs. Literature | Status |
|--------|-------------------|--------|
| Originality | Partial match (CPC sections vs. NBER) | ✅ Disclosed |
| Generality | Partial match (CPC sections vs. NBER) | ✅ Disclosed |
| Shannon Entropy | Correct (dual log bases documented) | ✅ Disclosed |
| HHI | ✅ Correct | ✅ Verified |
| Blockbuster Rate | ✅ Correct (1%, 5-year, cohort-normalized) | ✅ Verified |
| CR4 | ✅ Correct | ✅ Verified |
| Exploration Score | ✅ Correct | ✅ Verified |
| Grant Lag | ✅ Correct | ✅ Verified |
| Cohort-Normalized Citations | ✅ Correct | ✅ Verified |
| Patent Velocity | ✅ Correct | ✅ Verified |

**10 metrics verified. 7 fully correct, 3 with documented deviations (all disclosed on methodology page).**
