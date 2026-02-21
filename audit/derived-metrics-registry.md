# Derived Metrics Registry -- PatentWorld Audit (Section 1.5)

**Audit date:** 2026-02-21
**Auditor:** Automated code audit (Section 1.5)
**Project:** PatentWorld (`patentworld.vercel.app`)
**Data source:** USPTO PatentsView bulk data (1976-2025)

---

## Summary

| Item | Count |
|------|-------|
| **Total derived metrics found** | 30 |
| **Pipeline implementation files** | 24+ (in `data-pipeline/`) + 5 (in `scripts/`) |
| **Client-side computations (chapter pages)** | 3 metrics (CR4, subfield diversity, patent velocity) |
| **Methodology page definitions** | 18 metrics defined |
| **Glossary entries** | 17 terms |
| **Issues found** | 5 (see Issues section) |

---

## Metric Registry

Each metric is cataloged with: the exact formula as implemented in code, file path(s), any cited academic sources, the standard definition from the literature, whether the implementation matches, and every chapter page that uses the metric.

---

### 1. Originality Index

| Field | Value |
|-------|-------|
| **Metric** | Originality |
| **Formula in Code** | `1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2))` where `cnt` = backward citations in each CPC **section** (A-H), `total` = total backward citations. Requires `total >= 2`; else 0. Equivalent to `1 - HHI` of CPC section shares among backward citations. |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 119-141), `data-pipeline/60_originality_generality_filtered.py` (lines 42-66), `compute_quality_metrics.py` (lines 210-260) |
| **Cited Source (if any)** | Jaffe & de Rassenfosse (2017) cited in script 11 docstring. Trajtenberg, Henderson, Jaffe (1997) cited on methodology page. |
| **Standard Definition** | Trajtenberg, Henderson, Jaffe (1997): Originality_i = 1 - SUM_j(s_ij^2), where s_ij is the share of backward citations from patent i to technology class j. Originally used 3-digit USPC classes (~400+ categories). |
| **Match?** | PARTIAL -- Formula is correct (1-HHI), but computed at CPC **section** level (8 categories A-H) rather than subclass (~670) or group (~8000) level. Compresses range: max ~0.875 with 8 categories vs. ~1.0 with hundreds. The methodology page now notes this granularity difference. |
| **Pages Used** | system-patent-quality, system-patent-fields, inv-generalist-specialist, faq, about, methodology |

---

### 2. Generality Index

| Field | Value |
|-------|-------|
| **Metric** | Generality |
| **Formula in Code** | `1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2))` where `cnt` = forward citations **from** each CPC section, `total` = total forward citations. Requires `total >= 2`. Limited to patents granted <= 2020 (5-year citation window). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 147-174), `data-pipeline/60_originality_generality_filtered.py` (lines 73-97), `compute_quality_metrics.py` (lines 265-315) |
| **Cited Source (if any)** | Hall, Jaffe, Trajtenberg (2001) cited on methodology page. |
| **Standard Definition** | Hall, Jaffe, Trajtenberg (2001): Generality_i = 1 - SUM_j(s_ij^2), where s_ij is the share of forward citations received by patent i from technology class j. |
| **Match?** | PARTIAL -- Same section-level granularity limitation as originality. Methodology page notes the absence of the HJT small-sample correction, which may introduce upward bias for patents with very few citations. |
| **Pages Used** | system-patent-quality, system-patent-fields, inv-generalist-specialist, faq, about, methodology |

---

### 3. Shannon Entropy (Portfolio Diversity)

| Field | Value |
|-------|-------|
| **Metric** | Shannon Entropy / Portfolio Diversity |
| **Formula in Code** | **Variant A (natural log):** `ROUND(-SUM(share * LN(share)), 3)` over CPC subclass shares per org per 5-year period (script 15). **Variant B (log2):** `H = -np.sum(probs * np.log2(probs))` per org per year (script 35). **Variant C (log2):** `entropy -= W_prob[mask, i] * np.log2(W_prob[mask, i])` for NMF topic entropy (script 28). **Variant D (client-side, natural log, normalized):** `H = -SUM(p * Math.log(p)); entropy = H / Math.log(N)` in Act 6 chapter pages. |
| **File Path** | `data-pipeline/15_chapter3_portfolio_diversity.py` (line 80: LN), `data-pipeline/35_portfolio_strategy.py` (line 95: log2), `data-pipeline/37_inventor_careers.py` (line 198: log2), `data-pipeline/28_chapter12_topic_modeling.py` (line 297: log2), `src/app/chapters/*/page.tsx` (client-side: LN, normalized) |
| **Cited Source (if any)** | None cited explicitly. Shannon (1948) is the standard reference. |
| **Standard Definition** | Shannon (1948): H = -SUM(p_i * log(p_i)). Log base determines units: LN = nats, log2 = bits, log10 = hartleys. All bases are valid; choice is conventional. |
| **Match?** | YES (any log base is valid), but INCONSISTENT across scripts. Script 15 uses LN; scripts 35, 37, 28 use log2. Client-side Act 6 pages use LN (normalized by log(N)). LN-based values are ~69.3% of log2-based values. Methodology page now documents both bases. |
| **Pages Used** | org-patent-portfolio, system-language, inv-generalist-specialist, deep-dive-overview, all 12 Act 6 deep dives (client-side normalized), methodology, about |

---

### 4. Normalized Subfield Diversity (Client-Side)

| Field | Value |
|-------|-------|
| **Metric** | Subfield Diversity (Normalized Shannon Entropy) |
| **Formula in Code** | `H = -yearData.reduce((s, d) => { const p = d.count / total; return s + p * Math.log(p); }, 0); entropy = +(H / Math.log(N)).toFixed(3)` -- Shannon entropy using natural log, normalized by log(N) to yield range [0,1]. |
| **File Path** | `src/app/chapters/3d-printing/page.tsx` (lines 208-222), and identically in all 12 Act 6 deep-dive chapter pages (semiconductors, ai-patents, biotechnology, blockchain, green-innovation, agricultural-technology, cybersecurity, autonomous-vehicles, space-technology, quantum-computing, digital-health) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Normalized entropy E = H / H_max = H / log(N), sometimes called evenness in ecology (Pielou 1966). Ranges from 0 (all activity in one category) to 1 (perfectly even distribution). |
| **Match?** | YES -- Standard normalization. Uses natural log for both numerator and denominator, so log base cancels. |
| **Pages Used** | All 12 Act 6 deep-dive chapter pages |

---

### 5. Herfindahl-Hirschman Index (HHI)

| Field | Value |
|-------|-------|
| **Metric** | HHI (Herfindahl-Hirschman Index) |
| **Formula in Code** | `shares_pct = (counts / total) * 100.0; hhi = float(np.sum(shares_pct ** 2))` -- shares expressed as percentages (0-100), yielding HHI range 0-10,000. Also in script 75: `SUM(POWER(cnt/total, 2))` for AI CPC section concentration (decimal shares, range 0-1). |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (lines 264-268), `data-pipeline/75_act6_enrichments.py` (lines 60-79) |
| **Cited Source (if any)** | US DOJ/FTC (2010 Horizontal Merger Guidelines) cited on methodology page. |
| **Standard Definition** | Herfindahl (1950), Hirschman (1945): HHI = SUM(s_i^2). DOJ convention uses percentage shares (0-100), range 0-10,000. Academic convention often uses decimal shares (0-1), range 0-1. |
| **Match?** | YES -- Script 35 uses percentage-based convention (0-10,000) matching DOJ standards. Script 75 (AI HHI) uses decimal shares (0-1). Both are valid; different scaling conventions. Methodology page specifies percentage convention with x10,000 multiplier. |
| **Pages Used** | system-patent-fields, inv-top-inventors, inv-gender, inv-generalist-specialist, inv-team-size, ai-patents, methodology |

---

### 6. Concentration Ratio (CR4 / CR10)

| Field | Value |
|-------|-------|
| **Metric** | CR4, CR10 (Concentration Ratio) |
| **Formula in Code** | **Pipeline:** `top4_shares = np.sort(shares_pct)[-4:]; c4 = float(np.sum(top4_shares))` with percentage shares. **Client-side:** `top4 = yearOrgs.slice(0,4).reduce((s,d) => s+d.count, 0); cr4 = +(top4/total*100).toFixed(1)` in all Act 6 chapter pages. |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (lines 271-272), `src/app/chapters/3d-printing/page.tsx` (lines 196-206), and identically in all 12 Act 6 deep-dive chapter pages |
| **Cited Source (if any)** | None cited explicitly. Standard industrial organization metric. |
| **Standard Definition** | CR_n = sum of market shares of the n largest firms. Standard IO economics measure. |
| **Match?** | YES |
| **Pages Used** | All 12 Act 6 deep-dive chapters (client-side CR4), org-patent-count, org-composition, geo-domestic, geo-international, deep-dive-overview |

---

### 7. Citation Half-Life

| Field | Value |
|-------|-------|
| **Metric** | Citation Half-Life / Technology Half-Life |
| **Formula in Code** | **Script 24:** Cumulative citation percentage over years-after-grant; half-life = year where cumulative reaches 50%, with **linear interpolation** between adjacent years. **Script 68:** `MIN(cite_lag) WHERE cum_cites >= total_cites * 0.5 AND total_cites >= 5`, then median per CPC section. |
| **File Path** | `data-pipeline/24_chapter2_technology_halflife.py` (lines 54-80), `data-pipeline/68_sleeping_beauty_halflife.py` (lines 73-103) |
| **Cited Source (if any)** | None cited. Standard bibliometric concept. |
| **Standard Definition** | Burton & Kebler (1960): Half-life of literature = median age of cited references. Patent application: time for 50% of total forward citations to accumulate. |
| **Match?** | YES -- Both implementations use the standard 50th-percentile cumulative approach. Script 24 uses interpolation for smoother results; script 68 uses discrete minimum lag year. |
| **Pages Used** | system-patent-fields, system-patent-quality, org-patent-quality, mech-organizations, methodology |

---

### 8. Blockbuster Rate (Breakthrough Patents)

| Field | Value |
|-------|-------|
| **Metric** | Blockbuster Patent / Breakthrough Patent / Blockbuster Rate |
| **Formula in Code** | **Script 11:** `PERCENT_RANK() OVER (PARTITION BY year, tech_section ORDER BY fwd_cites) >= 0.99` = top 1% within (year x CPC section). **Script 41/65:** `PERCENTILE_CONT(0.99)` threshold within (year x CPC section) using 5-year forward cites. **scripts/compute_quality.py:** 75th percentile across ALL patents in a year (DIFFERENT -- broader definition). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 308-321), `data-pipeline/41_firm_quality_distribution.py` (lines 123-213), `data-pipeline/65_blockbuster_lorenz.py` (lines 22-49), `scripts/compute_quality.py` (lines 132-149) |
| **Cited Source (if any)** | None cited. Related to Scherer (1965) on patent value skewness. |
| **Standard Definition** | No single standard. Common thresholds: top 1% (Trajtenberg 1990), top 5% (Jaffe & Trajtenberg 2002), top 10% (Harhoff et al. 1999). |
| **Match?** | YES for top-1% definition (scripts 11, 41, 65). scripts/compute_quality.py uses 75th percentile -- much broader, appears to be an earlier/alternative version. |
| **Pages Used** | system-patent-quality, org-patent-quality, org-patent-count, org-company-profiles, mech-organizations, inv-top-inventors, all 12 Act 6 deep dives, methodology |

---

### 9. Top-Decile Share (Quality Bifurcation)

| Field | Value |
|-------|-------|
| **Metric** | Top-Decile Share / Quality Bifurcation |
| **Formula in Code** | `PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY fwd_cite_5y) AS p90_threshold` per (grant_year x cpc_section); then `100.0 * SUM(CASE WHEN fwd_cite_5y >= p90_threshold THEN 1 ELSE 0 END) / COUNT(*)` per domain x 5-year period. Values >10% indicate disproportionate high-quality output. |
| **File Path** | `data-pipeline/74_quality_bifurcation.py` (lines 36-86) |
| **Cited Source (if any)** | None cited. Related to bifurcation/inequality literature. |
| **Standard Definition** | Top decile share = fraction of a subset's items exceeding the system-wide 90th percentile. Standard measure of distributional inequality. |
| **Match?** | YES |
| **Pages Used** | All 12 Act 6 deep-dive chapters, system-public-investment |

---

### 10. Dud Rate (Zero-Citation Patents)

| Field | Value |
|-------|-------|
| **Metric** | Dud Rate / Zero-Citation Patents |
| **Formula in Code** | `CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) = 0 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*)` -- fraction of patents with zero 5-year forward citations. |
| **File Path** | `data-pipeline/41_firm_quality_distribution.py` (line 184), `scripts/compute_quality.py` (line 148) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Proportion of patents receiving zero forward citations within a fixed window. Standard in patent quality literature. |
| **Match?** | YES |
| **Pages Used** | org-patent-quality, org-company-profiles, system-patent-fields |

---

### 11. Exploration Composite Score

| Field | Value |
|-------|-------|
| **Metric** | Exploration Composite / Exploration Score / Exploration Index |
| **Formula in Code** | Average of 3 sub-scores (each 0-1): **(1) Technology newness:** `1.0` if firm has 0 prior patents in same CPC subclass (5-year lookback), linearly decreasing to `0.0` at 10+ prior. `max(0.0, 1.0 - prior_count / 10.0)`. **(2) Citation newness:** share of backward citations pointing to CPC sections where firm has <5 patents in prior 5 years. **(3) External sourcing:** `1.0 - self_citation_rate` (default 0.5 if no citations). Composite = `(tech + citation + external) / 3.0`. Exploratory if >0.6, exploitative if <0.4, ambidextrous if 0.4-0.6. |
| **File Path** | `data-pipeline/42_firm_exploration_exploitation.py` (lines 95-246) |
| **Cited Source (if any)** | None cited. Conceptually based on March (1991) exploration-exploitation framework. |
| **Standard Definition** | March (1991) introduced the exploration-exploitation dichotomy. Benner & Tushman (2003), He & Wong (2004) operationalized for patent data. No single standard formula; the 3-indicator composite is project-specific. |
| **Match?** | REASONABLE -- Sub-indicators are sensible operationalizations. The 0/10 linear scale for technology newness and <5 threshold for citation newness are project-specific choices. |
| **Pages Used** | mech-organizations, methodology |

---

### 12. Ambidexterity Index

| Field | Value |
|-------|-------|
| **Metric** | Ambidexterity Index |
| **Formula in Code** | `1.0 - abs(exploration_share - exploitation_share)` where exploration_share = fraction of patents with composite >0.6, exploitation_share = fraction <0.4. |
| **File Path** | `data-pipeline/44_firm_ambidexterity_quality.py` (lines 161-164) |
| **Cited Source (if any)** | None cited. Related to Tushman & O'Reilly (1996), He & Wong (2004). |
| **Standard Definition** | He & Wong (2004) measure ambidexterity as interaction between exploration and exploitation. No single standard formula; absolute-deviation approach is one common operationalization. |
| **Match?** | REASONABLE -- Simple and interpretable. Some scholars prefer multiplicative (exploration x exploitation) formulations. |
| **Pages Used** | mech-organizations, methodology |

---

### 13. Self-Citation Rate

| Field | Value |
|-------|-------|
| **Metric** | Self-Citation Rate |
| **Formula in Code** | `CAST(SUM(is_self_cite) AS DOUBLE) / COUNT(*)` where `is_self_cite = CASE WHEN pa1.org = pa2.org THEN 1 ELSE 0 END` -- exact string match on `disambig_assignee_organization` for primary assignee (sequence=0). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 187-230), `data-pipeline/42_firm_exploration_exploitation.py` (lines 145-163) |
| **Cited Source (if any)** | None cited. Standard patent analytics metric. |
| **Standard Definition** | Hall, Jaffe, Trajtenberg (2001): Self-citation when citing and cited patent share the same assignee. |
| **Match?** | YES -- Uses primary assignee match, which is standard. |
| **Pages Used** | system-patent-quality, mech-organizations |

---

### 14. Cohort-Normalized Citations

| Field | Value |
|-------|-------|
| **Metric** | Cohort Normalization / Cohort-Normalized Citations |
| **Formula in Code** | `patent.fwd_cite_5y / cohort_mean` where `cohort_mean = AVG(fwd_cite_5y) GROUP BY grant_year, cpc_section`. Value of 1.0 = average impact for cohort. |
| **File Path** | `data-pipeline/59_cohort_normalization.py` (lines 50-62), `data-pipeline/64_team_size_coefficients.py` (lines 46-52) |
| **Cited Source (if any)** | None cited. Standard approach; see Waltman & van Eck (2012). |
| **Standard Definition** | Divide patent citations by cohort mean (or median) to control for field- and time-specific citation patterns. Mean-based is most common. |
| **Match?** | YES -- Uses mean-based normalization by (grant_year x CPC section). |
| **Pages Used** | system-patent-quality, org-patent-count, org-composition, inv-team-size, system-public-investment |

---

### 15. Composite Quality Index (Z-Score)

| Field | Value |
|-------|-------|
| **Metric** | Composite Quality Index |
| **Formula in Code** | Z-score each of 4 components using global mean/std: `z_cites = (fwd_cites_5yr - mean) / std`, `z_claims = (num_claims - mean) / std`, `z_scope = (patent_scope - mean) / std`, `z_lag = -(lag_days - mean) / std` (inverted: shorter lag = higher quality). Composite = `(z_cites + z_claims + z_scope + z_lag) / 4`. |
| **File Path** | `data-pipeline/18_chapter9_composite_quality.py` (lines 71-97) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Lanjouw & Schankerman (2004) use factor analysis on claims, citations, family size, backward citations. Equal-weight Z-score averaging is simpler but conceptually similar. |
| **Match?** | REASONABLE -- Equal-weight Z-score is simpler than factor analysis. Grant lag inversion is appropriate. No standard exists for exact component selection. |
| **Pages Used** | system-convergence |

---

### 16. Gini Coefficient

| Field | Value |
|-------|-------|
| **Metric** | Gini Coefficient |
| **Formula in Code** | **Script 41 (direct formula):** `(2 * np.sum(index * vals) - (n + 1) * vals.sum()) / (n * vals.sum())` where vals are sorted citation counts and index = 1..n. **Script 65 (trapezoidal):** `Gini = 1 - 2 * np.trapz(y, x)` from Lorenz curve cumulative shares. |
| **File Path** | `data-pipeline/41_firm_quality_distribution.py` (lines 228-235), `data-pipeline/65_blockbuster_lorenz.py` (lines 71-101), `scripts/compute_quality.py` (lines 96-104) |
| **Cited Source (if any)** | None cited. Standard econometric measure. |
| **Standard Definition** | Gini (1912): Area between Lorenz curve and line of equality, normalized to [0,1]. 0 = perfect equality, 1 = maximum inequality. |
| **Match?** | YES -- Both direct formula and Lorenz-based trapezoidal approaches are standard and mathematically equivalent. |
| **Pages Used** | org-patent-count, org-patent-quality, org-company-profiles, mech-organizations, inv-top-inventors, geo-domestic, org-composition, cybersecurity, methodology |

---

### 17. Lorenz Curve

| Field | Value |
|-------|-------|
| **Metric** | Lorenz Curve |
| **Formula in Code** | `sorted_vals = np.sort(vals); cum = np.cumsum(sorted_vals) / np.sum(sorted_vals); x = np.arange(1, n+1) / n` -- cumulative share of patents (x-axis) vs. cumulative share of blockbusters/citations (y-axis), sorted ascending. |
| **File Path** | `data-pipeline/65_blockbuster_lorenz.py` (lines 71-101) |
| **Cited Source (if any)** | None cited. Standard econometric visualization. |
| **Standard Definition** | Lorenz (1905): Plot cumulative share of population (x) against cumulative share of outcome (y), sorted from poorest to richest. |
| **Match?** | YES |
| **Pages Used** | org-patent-count, org-patent-quality, inv-top-inventors |

---

### 18. Patent Scope

| Field | Value |
|-------|-------|
| **Metric** | Patent Scope |
| **Formula in Code** | `COUNT(DISTINCT LEFT(cpc_subclass, 4)) AS patent_scope` (script 11) or `COUNT(DISTINCT cpc_subclass) AS patent_scope` (scripts 18, 41). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 55-58), `data-pipeline/18_chapter9_composite_quality.py` (lines 44-49), `data-pipeline/41_firm_quality_distribution.py` (lines 96-101) |
| **Cited Source (if any)** | Lerner (1994) cited on methodology page. |
| **Standard Definition** | Lerner (1994): Count of distinct IPC/CPC classes assigned to a patent. Measures technological breadth. |
| **Match?** | YES -- CPC subclass count is consistent with modern practice. Note: Script 11 uses `LEFT(cpc_subclass, 4)` (first 4 chars) while scripts 18/41 use full subclass string. These are likely equivalent since CPC subclass codes are typically 4 characters (e.g., "H01L"). |
| **Pages Used** | system-patent-quality, system-patent-fields, org-patent-quality, methodology |

---

### 19. Grant Lag (Pendency)

| Field | Value |
|-------|-------|
| **Metric** | Grant Lag / Pendency |
| **Formula in Code** | `DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) AS grant_lag_days`. Filtered for 0-10,950 day range (0-30 years) to exclude corrupt records. |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 65-71), `data-pipeline/18_chapter9_composite_quality.py` (lines 51-56), `compute_quality_metrics.py` (lines 320-350) |
| **Cited Source (if any)** | None cited. Standard USPTO metric. |
| **Standard Definition** | Filing-to-grant interval in days. Standard measure of patent office processing time. |
| **Match?** | YES |
| **Pages Used** | system-patent-quality, methodology |

---

### 20. Forward Citations (5-Year Window)

| Field | Value |
|-------|-------|
| **Metric** | 5-Year Forward Citations |
| **Formula in Code** | Count of citing patents where `DATEDIFF('day', cited.patent_date, citing.patent_date) <= 1826` (~5 years = 5 * 365.25 = 1826.25 days). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 43-53), `data-pipeline/41_firm_quality_distribution.py` (lines 106-119), and 15+ additional pipeline scripts |
| **Cited Source (if any)** | None cited explicitly. Standard window; see Hall, Jaffe, Trajtenberg (2001). |
| **Standard Definition** | Count of forward citations accumulated within a fixed post-grant window. 5-year is standard; some studies use 3 or 7 years. |
| **Match?** | YES -- 1826-day window used consistently across all scripts. |
| **Pages Used** | Nearly all chapters involving quality metrics (system-patent-quality, org-patent-quality, org-patent-count, inv-team-size, inv-gender, inv-top-inventors, inv-serial-new, etc.) |

---

### 21. CAGR (Compound Annual Growth Rate)

| Field | Value |
|-------|-------|
| **Metric** | CAGR |
| **Formula in Code** | `POWER(CAST(yr.n_late AS DOUBLE) / yr.n_early, 0.2) - 1` where `n_late` = patent count 2020-2024, `n_early` = patent count 2015-2019. Exponent 0.2 = 1/5 for 5-year CAGR. |
| **File Path** | `data-pipeline/72_act6_cross_domain.py` (lines 88-90) |
| **Cited Source (if any)** | None cited. Standard financial/growth metric. |
| **Standard Definition** | CAGR = (V_final / V_initial)^(1/n) - 1, where n = number of periods. |
| **Match?** | YES |
| **Pages Used** | deep-dive-overview, Act 6 cross-domain comparisons |

---

### 22. Innovation Velocity (YoY Growth)

| Field | Value |
|-------|-------|
| **Metric** | Innovation Velocity / YoY Growth |
| **Formula in Code** | `100 * (count - prev_count) / prev_count` -- year-over-year percentage growth by WIPO sector. Computed via SQL window function: `LAG(count) OVER (PARTITION BY sector ORDER BY year)`. |
| **File Path** | `data-pipeline/08_chapter7_dynamics.py` (lines 141-169) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Year-over-year percentage change. Standard time-series growth measure. |
| **Match?** | YES |
| **Pages Used** | system-patent-fields |

---

### 23. Novelty (Topic Entropy)

| Field | Value |
|-------|-------|
| **Metric** | Novelty / Topic Entropy / Novelty Score |
| **Formula in Code** | Shannon entropy of NMF topic distribution per patent: `entropy[mask] -= W_prob[mask, i] * np.log2(W_prob[mask, i])` where `W_prob` is the normalized NMF weight matrix. Uses log2. Trend metric: median and mean entropy per year. |
| **File Path** | `data-pipeline/28_chapter12_topic_modeling.py` (lines 282-335) |
| **Cited Source (if any)** | None cited for novelty interpretation. |
| **Standard Definition** | Using topic-level entropy as a novelty proxy is project-specific. Related to Uzzi et al. (2013) on atypical combinations and Kaplan & Vakili (2015) on patent text novelty. Higher entropy = patent spans more topics. |
| **Match?** | REASONABLE -- Defensible as a novelty proxy but not a standard metric. High entropy could indicate novelty or vagueness. |
| **Pages Used** | system-language |

---

### 24. Patent Velocity (Client-Side)

| Field | Value |
|-------|-------|
| **Metric** | Patent Velocity (Patents per Active Year by Entry Cohort) |
| **Formula in Code** | `totalPat / max(1, last_year - first_year + 1)` averaged across firms within each entry decade cohort. Cohort defined by `decStart = Math.floor(d.first_year / 10) * 10`. Requires `count >= 3` firms per cohort. |
| **File Path** | `src/app/chapters/3d-printing/page.tsx` (lines 224-243), and identically in all 12 Act 6 deep-dive chapter pages |
| **Cited Source (if any)** | None cited. Project-specific metric. |
| **Standard Definition** | No standard definition. Patent velocity (patents/year) is a simple productivity measure, but the decade-cohort averaging is project-specific. |
| **Match?** | PROJECT-SPECIFIC -- No direct literature analog. The metric measures average firm patenting intensity by entry era. |
| **Pages Used** | All 12 Act 6 deep-dive chapter pages |

---

### 25. Jensen-Shannon Divergence (Technology Pivot Detection)

| Field | Value |
|-------|-------|
| **Metric** | Jensen-Shannon Divergence / JSD / Technology Pivot |
| **Formula in Code** | `jsd = jensenshannon(p, q, base=2)` using `scipy.spatial.distance.jensenshannon`. Applied to CPC subclass probability distributions in consecutive 3-year windows per firm. Pivot flagged at 95th percentile of a company's JSD values. |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (lines 139-220) |
| **Cited Source (if any)** | None cited explicitly. |
| **Standard Definition** | Lin (1991): JSD(P\|\|Q) = 0.5*KL(P\|\|M) + 0.5*KL(Q\|\|M) where M = 0.5*(P+Q). scipy returns the square root (Jensen-Shannon distance/metric). base=2 gives bits. |
| **Match?** | YES -- scipy's implementation returns the metric (square root of divergence), which is standard. |
| **Pages Used** | org-patent-portfolio |

---

### 26. Location Quotient (Regional Specialization)

| Field | Value |
|-------|-------|
| **Metric** | Location Quotient / Regional Specialization |
| **Formula in Code** | `LQ = (metro_section_count / metro_total) / (nat_section_count / nat_total)` -- metro area's share in a CPC section divided by national share in that section. |
| **File Path** | `data-pipeline/21_chapter4_regional_specialization.py` (lines 72-76) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Florence (1948): LQ = (local share of industry X) / (national share of industry X). LQ > 1 indicates specialization. Standard in economic geography. |
| **Match?** | YES |
| **Pages Used** | geo-domestic |

---

### 27. Sleeping Beauty Index

| Field | Value |
|-------|-------|
| **Metric** | Sleeping Beauty Patent |
| **Formula in Code** | **Script 22 (strict):** `avg_early_rate < 2` citations/year for first 10 years AND `max_burst >= 10` citations in a 3-year window after year 10. **Script 68 (broad):** `early_cites <= 2` in first 3 years AND `total_cites >= 10`. **compute_quality_metrics.py:** `year <= 2015 AND early_cites <= 5 AND forward_citations >= 50 AND late_cites > early_cites * 3`. |
| **File Path** | `data-pipeline/22_chapter9_sleeping_beauty.py` (lines 45-93), `data-pipeline/68_sleeping_beauty_halflife.py` (lines 47-66), `compute_quality_metrics.py` (lines 420-450) |
| **Cited Source (if any)** | van Raan (2004) implied on methodology page. |
| **Standard Definition** | Van Raan (2004): Publication unnoticed for long time, then sudden attention. Ke et al. (2015) proposed quantitative "beauty coefficient." No standard threshold. |
| **Match?** | REASONABLE -- Thresholds are defensible but simpler than beauty coefficient. Three different definitions exist across scripts (see Issues). |
| **Pages Used** | system-patent-quality, methodology |

---

### 28. Cosine Distance (Exploration Trajectory)

| Field | Value |
|-------|-------|
| **Metric** | Exploration Index (Cosine Distance) |
| **Formula in Code** | `dot = sum(v1[k] * v2[k]); mag1 = sqrt(sum(v**2)); mag2 = sqrt(sum(v**2)); cosine_dist = 1.0 - dot / (mag1 * mag2)` -- cosine distance between CPC subclass count vectors for consecutive 5-year periods per firm. |
| **File Path** | `data-pipeline/62_exploration_trajectory.py` (lines 110-118) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Cosine distance = 1 - cosine similarity. Standard in IR and NLP. Applied to patent CPC vectors to measure portfolio shift. See Breschi, Lissoni & Malerba (2003) on technological coherence. |
| **Match?** | REASONABLE -- Valid operationalization of exploration. Distinct from the 3-indicator composite in script 42. |
| **Pages Used** | mech-organizations |

---

### 29. Shift-Share Decomposition (Convergence)

| Field | Value |
|-------|-------|
| **Metric** | Shift-Share Decomposition (Within-Firm vs. Between-Firm) |
| **Formula in Code** | **Within-firm:** `SUM(share_t-1 * (rate_t - rate_t-1))` -- change in multi-section rate holding composition constant. **Between-firm:** `SUM((share_t - share_t-1) * rate_t-1)` -- change in composition holding rates constant. Where `share` = firm's patent count / total, `rate` = firm's multi-section patent share. Also includes **near/far convergence:** baseline co-occurrence from 1976-1985; Q75 threshold = near, Q25 = far. |
| **File Path** | `data-pipeline/61_convergence_decomposition.py` (lines 42-103) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Laspeyres/shift-share decomposition (Dunn 1960): Total change = within-group + between-group (structural) + interaction. Implementation omits interaction term (common simplification). |
| **Match?** | MOSTLY -- Standard shift-share without interaction term. Omitting interaction is a standard simplification. |
| **Pages Used** | system-convergence |

---

### 30. Additional Domain-Specific Metrics

The following metrics are domain-specific enrichments computed in `data-pipeline/75_act6_enrichments.py`:

#### 30a. EV-Battery Coupling Lift

| Field | Value |
|-------|-------|
| **Metric** | EV-Battery Coupling Lift |
| **Formula in Code** | `lift = P(EV AND Battery) / (P(EV) * P(Battery))` = `(green_ev_battery / total_green) / ((green_ev / total_green) * (green_battery / total_green))`. Lift > 1 indicates positive association. |
| **File Path** | `data-pipeline/75_act6_enrichments.py` (lines 87-136) |
| **Cited Source (if any)** | None cited. Standard association rule metric. |
| **Standard Definition** | Association rule lift (Agrawal et al. 1993): Lift(A,B) = P(A AND B) / (P(A) * P(B)). Standard in data mining. |
| **Match?** | YES |
| **Pages Used** | green-innovation |

#### 30b. Systems Complexity Index

| Field | Value |
|-------|-------|
| **Metric** | Systems Complexity Index |
| **Formula in Code** | `team_size_index = domain_avg_team_size / system_avg_team_size; claims_index = domain_avg_claims / system_avg_claims`. Each indexed to system-wide baseline. |
| **File Path** | `data-pipeline/75_act6_enrichments.py` (lines 240-249) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | No standard definition. Project-specific ratio indexing domain metrics to system baseline. |
| **Match?** | PROJECT-SPECIFIC |
| **Pages Used** | 3d-printing, space-technology, autonomous-vehicles |

#### 30c. Interdisciplinarity Composite

| Field | Value |
|-------|-------|
| **Metric** | Interdisciplinarity Composite Index |
| **Formula in Code** | Z-score composite of 3 measures: mean CPC subclasses per patent (scope), mean CPC sections per patent, and multi-section share (%). Each Z-scored using 5-year-period means/stddevs. Composite = average of 3 Z-scores. |
| **File Path** | `data-pipeline/67_interdisciplinarity_trend.py` (lines 24-63) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Stirling (2007): variety x balance x disparity. Porter & Rafols (2009): Rao-Stirling diversity. This implementation captures variety and balance but not disparity. |
| **Match?** | REASONABLE -- Captures two of three Stirling dimensions. |
| **Pages Used** | system-convergence |

#### 30d. Inventor Survival Rate

| Field | Value |
|-------|-------|
| **Metric** | Inventor Survival / Career Survival Curves |
| **Formula in Code** | `survival_pct = 100.0 * (cohort_inventors['career_length'] >= cl).sum() / total` per 5-year entry cohort, for each career_length cl. `career_length = last_patent_year - first_patent_year`. |
| **File Path** | `data-pipeline/10_chapter5_inventor_deep.py` (lines 76-116) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Kaplan-Meier survival adapted for inventor careers. Subject to right-censoring for recent cohorts. |
| **Match?** | REASONABLE -- Simple survival curves without censoring adjustment. More sophisticated studies use Cox proportional hazards. |
| **Pages Used** | inv-top-inventors, inv-serial-new, inv-generalist-specialist, org-patent-count |

#### 30e. Corporate Survival Rate

| Field | Value |
|-------|-------|
| **Metric** | Corporate Survival / Corporate Mortality |
| **Formula in Code** | `rate = 100.0 * len(survivors) / len(prev_set)` where `survivors` = top-50 firms in decade D-1 that remain in top-50 in decade D. |
| **File Path** | `data-pipeline/34_corporate_mortality.py` (lines 100-124) |
| **Cited Source (if any)** | None cited. Related to Cefis & Orsenigo (2001). |
| **Standard Definition** | Fraction of incumbents retaining top-N status across periods. Standard in innovation persistence literature. |
| **Match?** | YES |
| **Pages Used** | org-patent-count |

#### 30f. Entrant vs. Incumbent Classification

| Field | Value |
|-------|-------|
| **Metric** | Entrant vs. Incumbent Decomposition |
| **Formula in Code** | `entrant` = assignee whose first domain patent is in the current year; `incumbent` = assignee with prior domain patents. Share of domain patents from each type computed per year. |
| **File Path** | `data-pipeline/73_entrant_incumbent.py` (lines 30-80) |
| **Cited Source (if any)** | None cited. |
| **Standard Definition** | Standard IO decomposition. Related to Aghion et al. (2009) on entry and innovation. |
| **Match?** | YES |
| **Pages Used** | All 12 Act 6 deep-dive chapters |

---

## Detailed Formula Variant Analysis

### Shannon Entropy: Log Base Inconsistency

| Script | Log Base | Context | Output Units |
|--------|----------|---------|--------------|
| `15_chapter3_portfolio_diversity.py` | **LN** (natural log) | Portfolio diversity for top 25 assignees | **nats** |
| `35_portfolio_strategy.py` | **log2** | Portfolio diversification for top 50 assignees | **bits** |
| `37_inventor_careers.py` | **log2** | Inventor technology drift classification | **bits** |
| `28_chapter12_topic_modeling.py` | **log2** | Topic novelty (NMF entropy) | **bits** |
| Act 6 chapter pages (client-side) | **LN** (normalized by log(N)) | Subfield diversity | **unitless [0,1]** |

**Impact:** An entropy value of 2.0 bits (log2) = 1.386 nats (LN). Scripts 15 and 35 output to different JSON files (`chapter3/portfolio_diversity.json` vs. `company/portfolio_diversification_b3.json`), so they are not mixed in the same chart. Client-side Act 6 entropy is normalized by log(N), making it unitless (0-1) regardless of log base. The methodology page now documents both bases.

**Recommendation:** Standardize all pipeline scripts to one log base (log2 is majority usage). Update methodology page if changed.

---

### Originality/Generality: CPC Section-Level Granularity

The code computes originality and generality at **CPC section level** (8 categories: A through H), using the primary CPC assignment (sequence=0) of each cited/citing patent.

| Source | Classification Level | Number of Categories |
|--------|---------------------|---------------------|
| PatentWorld implementation | CPC section | 8 |
| Trajtenberg, Henderson, Jaffe (1997) | 3-digit USPC | ~400+ |
| Hall, Jaffe, Trajtenberg (2001) | 2-digit NBER subcategory | ~36 |
| Modern implementations | CPC subclass or group | ~670 or ~8000 |

**Impact:** Theoretical max with 8 sections is 0.875. Actual site values range ~0.09 to ~0.55. Finer granularity would yield higher values with more discriminating power. Values are internally consistent but not comparable with published studies. The methodology page now notes this granularity difference.

---

### Sleeping Beauty: Three Different Definitions

| Script | Dormancy Period | Dormancy Threshold | Burst/Total Criterion |
|--------|----------------|-------------------|----------------------|
| `22_chapter9_sleeping_beauty.py` | First **10 years** | <2 avg cites/year | >=10 cites in 3-year window after year 10 |
| `68_sleeping_beauty_halflife.py` | First **3 years** | <=2 total cites | >=10 total cites (all time) |
| `compute_quality_metrics.py` | Granted <= **2015** | <=5 early cites | >=50 total AND late_cites > 3x early_cites |

**Impact:** Script 22 identifies rare "true" sleeping beauties with long dormancy. Script 68 identifies broader "late bloomers." `compute_quality_metrics.py` uses the most stringent absolute threshold (>=50 citations). All output to different files but share the "sleeping beauty" label.

---

### Blockbuster Definition Variants

| Implementation | Threshold | Conditioning | Citation Window |
|---------------|-----------|--------------|-----------------|
| Script 11 (breakthrough_patents) | Top 1% (PERCENT_RANK >= 0.99) | Within (year x CPC section) | All-time forward cites |
| Script 41 (firm_quality) | Top 1% (PERCENTILE_CONT 0.99) | Within (year x CPC section) | 5-year forward cites |
| Script 65 (blockbuster_lorenz) | Top 1% (PERCENT_RANK >= 0.99) | Within (year x CPC section) | 5-year forward cites |
| Script 74 (quality_bifurcation) | Top 10% (PERCENTILE_CONT 0.9) | Within (year x CPC section) | 5-year forward cites |
| scripts/compute_quality.py | Top 25% (75th percentile) | Within year (ALL patents) | All-time forward cites |

**Impact:** Script 74 intentionally uses top 10% (labeled "top-decile"). `scripts/compute_quality.py` uses 75th percentile across all patents -- a much broader definition from an earlier/alternative version. The main pipeline (scripts 11, 41, 65) is consistent at top 1%.

---

## Issues Found

### Issue 1: Shannon Entropy Log Base Inconsistency (MEDIUM)
- **Location:** `data-pipeline/15_chapter3_portfolio_diversity.py` vs. `data-pipeline/35_portfolio_strategy.py` et al.
- **Problem:** Script 15 uses natural log (LN); scripts 35, 37, 28 use log2. Outputs are on different scales (nats vs. bits).
- **Impact:** Values not directly comparable across scripts. Methodology page now documents both but pipeline should ideally standardize.
- **Recommendation:** Standardize all pipeline scripts to log2 (majority usage) or add explicit unit labels to JSON output files.

### Issue 2: Sleeping Beauty Criteria Mismatch (MEDIUM)
- **Location:** `data-pipeline/22_chapter9_sleeping_beauty.py` vs. `data-pipeline/68_sleeping_beauty_halflife.py` vs. `compute_quality_metrics.py`
- **Problem:** Three different definitions of "sleeping beauty" with dramatically different stringency (3-year vs. 10-year dormancy, 10 vs. 50 citation thresholds).
- **Impact:** Results labeled "sleeping beauty" may refer to very different patent populations.
- **Recommendation:** Rename variants (e.g., "delayed recognition patents" vs. "sleeping beauty patents" vs. "dormant breakthroughs") or consolidate to one definition.

### Issue 3: Originality/Generality Computed at Coarse Section Level (LOW)
- **Location:** `data-pipeline/11_chapter9_patent_quality.py`, `data-pipeline/60_originality_generality_filtered.py`
- **Problem:** Uses 8 CPC sections (A-H) rather than ~670 CPC subclasses. Published literature typically uses finer granularity.
- **Impact:** Values compressed relative to literature benchmarks.
- **Status:** Methodology page now documents this limitation. Consider adding subclass-level variant for comparison.

### Issue 4: Methodology Page Exploration Threshold Description (LOW)
- **Location:** `src/app/methodology/page.tsx` line 494
- **Problem:** Page says "Patents scoring above 0.6 are classified as exploratory; those below 0.6 as exploitative." Code uses three categories: >0.6 exploratory, 0.4-0.6 ambidextrous, <0.4 exploitative.
- **Impact:** Methodology page omits the ambidextrous middle category.
- **Recommendation:** Update text to: "above 0.6 = exploratory, 0.4-0.6 = ambidextrous, below 0.4 = exploitative."

### Issue 5: Missing Academic Citations (LOW)
- **Location:** Methodology page and glossary
- **Problem:** Several well-known metrics lack explicit academic citations:
  - Originality: Trajtenberg, Henderson, Jaffe (1997) -- now cited on methodology page
  - Generality: Hall, Jaffe, Trajtenberg (2001) -- now cited on methodology page
  - Shannon entropy: Should cite Shannon (1948)
  - Exploration/exploitation: Should cite March (1991)
  - Sleeping beauty: Should cite van Raan (2004)
  - Location quotient: Should cite Florence (1948)
  - Gini coefficient: Should cite Gini (1912)
- **Impact:** Academic credibility and reproducibility.
- **Recommendation:** Add a "References" section to the methodology page.

---

## Complete File Index

### Pipeline Scripts Computing Derived Metrics

| Script | Metrics Computed |
|--------|-----------------|
| `data-pipeline/08_chapter7_dynamics.py` | Innovation velocity (YoY growth) |
| `data-pipeline/10_chapter5_inventor_deep.py` | Inventor survival curves |
| `data-pipeline/11_chapter9_patent_quality.py` | Forward/backward citations, claims, scope, grant lag, originality, generality, self-citation rate, breakthrough patents (top 1%) |
| `data-pipeline/15_chapter3_portfolio_diversity.py` | Shannon entropy (LN base) for portfolio diversity |
| `data-pipeline/18_chapter9_composite_quality.py` | Z-score composite quality index |
| `data-pipeline/21_chapter4_regional_specialization.py` | Location quotient |
| `data-pipeline/22_chapter9_sleeping_beauty.py` | Sleeping beauty (10-year dormancy definition) |
| `data-pipeline/24_chapter2_technology_halflife.py` | Citation half-life (with interpolation) |
| `data-pipeline/28_chapter12_topic_modeling.py` | Topic entropy / novelty (log2 base) |
| `data-pipeline/34_corporate_mortality.py` | Corporate survival rate |
| `data-pipeline/35_portfolio_strategy.py` | Shannon entropy (log2), JSD pivot detection, HHI, C4 |
| `data-pipeline/37_inventor_careers.py` | Shannon entropy (log2) for inventor classification |
| `data-pipeline/41_firm_quality_distribution.py` | Blockbuster rate (top 1%), dud rate, Gini coefficient |
| `data-pipeline/42_firm_exploration_exploitation.py` | Exploration composite (3 indicators), self-citation rate |
| `data-pipeline/44_firm_ambidexterity_quality.py` | Ambidexterity index |
| `data-pipeline/59_cohort_normalization.py` | Cohort-normalized citations |
| `data-pipeline/60_originality_generality_filtered.py` | Originality/generality at multiple citation thresholds |
| `data-pipeline/61_convergence_decomposition.py` | Shift-share decomposition, near/far convergence |
| `data-pipeline/62_exploration_trajectory.py` | Cosine distance exploration index |
| `data-pipeline/64_team_size_coefficients.py` | Cohort-normalized citations, FWL regression |
| `data-pipeline/65_blockbuster_lorenz.py` | Lorenz curves, Gini, blockbuster rate |
| `data-pipeline/67_interdisciplinarity_trend.py` | Z-score interdisciplinarity composite |
| `data-pipeline/68_sleeping_beauty_halflife.py` | Sleeping beauty (3-year definition), citation half-life |
| `data-pipeline/72_act6_cross_domain.py` | CAGR |
| `data-pipeline/73_entrant_incumbent.py` | Entrant vs. incumbent classification |
| `data-pipeline/74_quality_bifurcation.py` | Top-decile share |
| `data-pipeline/75_act6_enrichments.py` | AI HHI, EV-battery coupling lift, systems complexity index |
| `data-pipeline/domain_utils.py` | Shared domain pipeline (quality, geography, team size, assignee type) |
| `compute_quality_metrics.py` | Originality, generality, scope, self-citation, sleeping beauty, grant lag |
| `scripts/compute_quality.py` | Alternative Gini, alternative blockbuster (75th percentile) |

### Client-Side Computations (Chapter Pages)

| Metric | Formula | File(s) |
|--------|---------|---------|
| CR4 | `top4 / total * 100` | All 12 Act 6 deep-dive `page.tsx` files |
| Subfield diversity | `H / Math.log(N)` (normalized Shannon entropy, natural log) | All 12 Act 6 deep-dive `page.tsx` files |
| Patent velocity | `totalPat / max(1, span)` averaged by decade cohort | All 12 Act 6 deep-dive `page.tsx` files |

### Hooks Relevant to Metrics

| Hook | Purpose |
|------|---------|
| `src/hooks/useCitationNormalization.tsx` | Simple per-year-of-exposure normalization: `value / max(1, 2025 - year)` |
| `src/hooks/useCohortNormalization.tsx` | Toggle between raw and pre-computed cohort-normalized JSON data |
| `src/hooks/useThresholdFilter.tsx` | Three-way filter for originality/generality data by citation threshold (all, >=5, >=10) |

### Reference Files

| File | Relevance |
|------|-----------|
| `src/lib/constants.ts` | CHAPTERS array with metric names in descriptions/subtitles |
| `src/lib/glossary.ts` | Definitions for HHI, originality, generality, Shannon entropy, citation half-life, JSD, cosine similarity, TF-IDF, NMF, UMAP, k-means |
| `src/lib/formatters.ts` | Display formatting for HHI, Gini, entropy, correlation values (no computation) |
| `src/lib/chapterMeasurementConfig.ts` | Per-chapter measurement metadata: data vintage, taxonomy, normalization method, outcome windows |
| `src/app/methodology/page.tsx` | Formal definitions for 18 metrics with formulas and caveats |
