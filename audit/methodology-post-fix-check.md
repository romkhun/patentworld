# Track C — Methodology Post-Fix Check

**Date:** 2026-02-21
**Method:** Re-verification of 5 most critical Track C fixes

---

## Critical Fix 1: Portfolio Clustering (C-12)

**Before:** "hierarchical agglomerative clustering with Ward's minimum-variance linkage and cosine distance"
**After:** "rule-based industry assignment heuristic on dominant CPC section and top subclass"

### Verification
- Searched `org-patent-portfolio/page.tsx` for "agglomerative", "Ward", "clustering algorithm": **0 matches**
- DataNote now correctly describes: "rule-based heuristic on each company's dominant CPC section and top subclass (e.g., H01L → Semiconductor, B60 → Automotive), not statistical clustering"
- Pipeline script `40_portfolio_strategy_profiles.py` lines 161-185 confirm `assign_industry()` is a simple if/elif chain
- **Status: ✅ Correctly fixed**

## Critical Fix 2: Pivot Window Size (C-13)

**Before:** "consecutive 5-year windows"
**After:** "consecutive 3-year windows"

### Verification
- Searched `org-patent-portfolio/page.tsx` for "5-year": **0 matches**
- Searched for "3-year": **found in 4 locations** (KeyFindings, subtitle, caption, DataNote)
- Pipeline script `35_portfolio_strategy.py` line 157-158: `end = start + 2` confirms 3-year windows
- **Status: ✅ Correctly fixed**

## Critical Fix 3: Pivot Threshold (C-14)

**Before:** "90th percentile threshold across all firm-windows"
**After:** "95th percentile per-company threshold"

### Verification
- Searched `org-patent-portfolio/page.tsx` for "90th": **0 matches**
- Found "95th percentile per-company" in KeyFindings and caption
- Pipeline script line 209: `threshold = float(np.percentile(jsd_vals, 95))` — per-company loop confirms per-company calculation
- **Status: ✅ Correctly fixed**

## Critical Fix 4: Company Count (C-15)

**Before:** "248 companies"
**After:** "50 companies (248 company-decade observations)"

### Verification
- Searched for standalone "248 companies" without "company-decade": **0 matches**
- Found "50 companies" in 6 locations (KeyFindings, Executive Summary, chart title, subtitle, InsightRecap, DataNote)
- Pipeline script line 254: `log(f" Total: {len(overlap_records)} company-decade records")` confirms these are company-decade observations
- **Status: ✅ Correctly fixed**

## Critical Fix 5: Entropy Formula (C-1/C-6)

**Before:** Methodology page said "natural logarithm (ln)" for all entropy calculations
**After:** "log₂ for topic modeling (bits), natural logarithm (ln) for portfolio diversity (nats)"

### Verification
- Methodology page text confirmed: specifies both log bases with context
- Topic modeling script (28) uses `np.log2()`
- Portfolio scripts (35, 37) use `LN()` in SQL / `math.log()` in Python
- **Status: ✅ Correctly fixed**

---

## Summary

**5/5 critical Track C fixes verified correct.** All methodology descriptions now accurately reflect the implemented code.
