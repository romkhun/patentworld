# Track C — Methodology Verification Report

**Date:** 2026-02-21
**Method:** Code review against academic literature and pipeline scripts

---

## 1. Derived Metric Formula Audit

### 1.1 Originality Index
- **Code implementation:** `1 - HHI` of backward citation CPC sections (8 categories)
- **Academic reference:** Trajtenberg, Henderson, Jaffe (1997) — 1 minus HHI of backward citation NBER technology categories (~36)
- **Match:** Partial. Formula structure correct but uses CPC sections (8) instead of NBER categories (~36). This compresses the range toward 0 (less variation with fewer categories).
- **Disclosure added:** Methodology page now notes CPC section granularity and compressed range.
- **HJT correction:** Hall, Jaffe, Trajtenberg (2001) proposed a small-sample correction: `O_adj = O * n/(n-1)` to adjust for the mechanical relationship between HHI and sample size. Not implemented in code.
- **Disclosure added:** Methodology page notes HJT correction is not applied.
- **Status:** ✅ Documented (C-4, C-5)

### 1.2 Generality Index
- **Code implementation:** `1 - HHI` of forward citation CPC sections
- **Academic reference:** Hall, Jaffe, Trajtenberg (2001) — same formula as originality but on forward citations
- **Match:** Same granularity note as originality.
- **Status:** ✅ Documented (C-4, C-5)

### 1.3 Shannon Entropy
- **Code implementations:**
  - Topic modeling (script 28): `log₂`
  - Portfolio diversity (scripts 35, 37): `ln` (natural log)
  - Phase 5 network metrics (script 15): `LN` (SQL)
- **Academic reference:** Shannon (1948) — H = -Σ pᵢ log(pᵢ). Log base is a convention (log₂ = bits, ln = nats, log₁₀ = hartleys).
- **Match:** Both log bases are mathematically valid; the issue was inconsistency across analyses.
- **Disclosure added:** Methodology page specifies log₂ for topics, ln for portfolios. Values are not directly comparable across analyses.
- **Status:** ✅ Fixed (C-1, C-6, C-7)

### 1.4 HHI (Herfindahl-Hirschman Index)
- **Code implementation:** `Σ sᵢ² × 10,000` where sᵢ are market shares as proportions
- **Standard definition:** Same formula; 10,000 scaling is the DOJ/FTC convention
- **Match:** ✅ Correct
- **Status:** ✅ Verified

### 1.5 Blockbuster Rate
- **Code implementation:** Share of patents in top 1% of 5-year forward citations within grant-year × CPC section cohort
- **Visible pages:** All chapters using blockbuster rate use this 5-year, cohort-normalized definition
- **Note:** Script 11 also generates `breakthrough_patents.json` using lifetime citations, but this file is never loaded by any chapter page.
- **Match:** ✅ Consistent across all visible pages
- **Status:** ✅ Verified (C-2)

### 1.6 CR4 (Four-Firm Concentration Ratio)
- **Code implementation:** Sum of top 4 organizations' annual patent counts ÷ total domain patents
- **Standard definition:** Same formula (standard industrial organization metric)
- **Match:** ✅ Correct
- **Status:** ✅ Verified

### 1.7 Exploration Score
- **Code implementation:** Share of patents in CPC classes new to the firm in prior 5-year window
- **Academic reference:** March (1991) exploration-exploitation framework
- **Match:** ✅ Implementation is a standard operationalization
- **Status:** ✅ Verified

### 1.8 Grant Lag
- **Code implementation:** Days between filing_date and patent_date
- **Data caveat:** PatentsView filing_date has some corrupt values (e.g., "1074-08-14")
- **Match:** ✅ Correct (with date validation)
- **Status:** ✅ Verified

---

## 2. Gender Inference Methodology

- **Method:** PatentsView `gender_code` field (name-based inference by PatentsView)
- **Disclosure:** MeasurementSidebar now says "gender_code" (was incorrectly "male_flag")
- **Ethnic/geographic bias:** Added note about higher error rates for non-Western names
- **Confidence threshold:** PatentsView handles internally; site uses their classification
- **Status:** ✅ Fixed (C-10, C-11)

---

## 3. NLP / Topic Modeling

- **Algorithm:** Non-negative Matrix Factorization (NMF)
- **Corpus:** 8.45 million patent abstracts
- **K=25 topics:** Selected based on interpretability, not data-driven coherence metric
- **UMAP:** Sample size is 15,000 (600 per topic), not 5,000 as originally stated
- **Disclosures added:** K=25 interpretability rationale, UMAP sample size corrected
- **Status:** ✅ Fixed (C-3, C-8, C-9)

---

## 4. Network Analysis and Clustering

### 4.1 Portfolio Competitive Proximity (CRITICAL FIX)
- **Page claimed:** "hierarchical agglomerative clustering with Ward's minimum-variance linkage and cosine distance"
- **Actual code:** `assign_industry()` heuristic function in `40_portfolio_strategy_profiles.py` (lines 161-185). Maps dominant CPC section to industry label (e.g., H → Electronics, H01L → Semiconductor, A → Pharma/Biotech, G → Technology).
- **No sklearn clustering used at all.** The claim was fabricated.
- **Fix:** Replaced all references with "rule-based industry assignment heuristic on dominant CPC section and top subclass"
- **Count:** "248 companies" are actually 50 companies × ~5 decades = 248 company-decade observations
- **UMAP:** Correctly described (cosine metric, n_neighbors=10, min_dist=0.3, random_state=42)
- **Status:** ✅ CRITICAL FIX applied (C-12, C-15)

### 4.2 Co-invention Networks
- **Construction:** Co-appearance on same patent among top 50 firms' inventors
- **Metrics:** 632 prolific inventors, 1,236 co-invention ties — from data
- **Status:** ✅ Verified

---

## 5. Technology Pivot Detection (CRITICAL FIX)

- **Page claimed:** "consecutive 5-year windows" with "90th percentile threshold across all firm-windows"
- **Actual code** (`35_portfolio_strategy.py`):
  - Windows: 3-year (start to start+2), NOT 5-year
  - Threshold: 95th percentile per company (line 209: `np.percentile(jsd_vals, 95)`), NOT 90th across all
- **JSD computation:** Correctly uses `scipy.spatial.distance.jensenshannon(p, q, base=2)`
- **Fix:** Changed all references to "3-year windows" and "95th percentile per-company threshold"
- **Status:** ✅ CRITICAL FIX applied (C-13, C-14)

---

## 6. Technology Domain Definitions

All 12 Deep Dive domains use shared `domain_utils.py` framework. CPC-based definitions verified against pipeline scripts:

| Domain | CPC Codes | Page Disclosure | Overlaps Disclosed |
|--------|-----------|-----------------|-------------------|
| AI | G06N, G06F18, G06V, G10L15, G06F40 | ✅ | ✅ (Quantum, AV) |
| 3D Printing | B29C64, B33Y, B22F10 | ✅ | None |
| Agricultural Tech | A01B, A01C, A01G, A01H, G06Q50/02 | ✅ (A01N exclusion explained) | None |
| Autonomous Vehicles | B60W60, G05D1, G06V20/56 | ✅ (corrected from G08G/B60W) | ✅ (AI) |
| Biotechnology | C12N15, C12N9, C12Q1/68 | ✅ (specific codes listed) | None |
| Blockchain | H04L9/0643, G06Q20/06 | ✅ | ✅ (Cybersecurity) |
| Cybersecurity | H04L9, G06F21, H04L63 | ✅ | ✅ (Blockchain) |
| Digital Health | A61B5, G16H, A61B34 | ✅ (A61B6/A61B8 exclusion explained) | None |
| Green Innovation | Y02 (all subclasses) | ✅ | None |
| Quantum Computing | G06N10, H01L39 | ✅ (specific codes, overlap note) | ✅ (AI, Semi) |
| Semiconductors | H01L, H10N, H10K | ✅ (H10N/H10K added) | ✅ (Quantum) |
| Space Technology | B64G, H01Q (satellite) | ✅ | None |

---

## Summary

| Category | Items | Correct | Fixed | Status |
|----------|-------|---------|-------|--------|
| Derived metrics (8) | 8 | 5 correct, 3 documented | 3 (entropy, originality, generality) | ✅ All addressed |
| Gender inference | 1 | Partially | 2 fixes (terminology, bias note) | ✅ Fixed |
| NLP/topic model | 1 | Partially | 3 fixes (K, UMAP, coherence) | ✅ Fixed |
| Clustering | 1 | **FABRICATED** | 2 critical fixes (method, count) | ✅ Fixed |
| Pivot detection | 1 | Incorrect params | 2 critical fixes (windows, threshold) | ✅ Fixed |
| Domain definitions | 12 | 6 with disclosure issues | 6 fixes + 4 overlap disclosures | ✅ All fixed |

**Total: 15 issues identified, 15 fixed.**
