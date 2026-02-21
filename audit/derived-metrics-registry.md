# Derived Metrics Registry -- PatentWorld Audit

**Audit date:** 2026-02-20
**Auditor:** Automated code audit
**Project:** PatentWorld (patentworld.vercel.app)
**Data source:** USPTO PatentsView bulk data (1976-2025)

---

## Summary

| Item | Count |
|------|-------|
| **Total derived metrics found** | 26 |
| **Pipeline implementation files** | 24 (in `data-pipeline/`) + 5 (in `scripts/`) |
| **Page files referencing metrics** | 40+ (in `src/app/chapters/`) |
| **Methodology page definitions** | 18 metrics defined |
| **Glossary entries** | 17 terms |
| **Issues found** | 5 (see Issues section) |

---

## Metric Registry

### 1. Originality Index

| Field | Value |
|-------|-------|
| **Name on site** | Originality |
| **Formula (code)** | `1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2))` where `cnt` = backward citations in each CPC section, `total` = total backward citations. Requires `total >= 2`. |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 119-141), `data-pipeline/60_originality_generality_filtered.py` (lines 42-66) |
| **Methodology page** | "Originality = 1 - SUM(s_i^2) where s_i is the share of backward citations in CPC section i." |
| **Academic source (on site)** | Jaffe & de Rassenfosse (2017) cited in script 11 docstring. Not explicitly citing Trajtenberg, Henderson, Jaffe (1997) by name on the page. |
| **Standard definition** | Trajtenberg, Henderson, Jaffe (1997): Originality_i = 1 - SUM_j (s_ij^2), where s_ij is the share of citations made by patent i to patents in technology class j. Originally used USPC classes. |
| **Matches literature?** | PARTIAL -- The formula is correct (1 - HHI), but computed at CPC **section** level (8 categories: A-H) rather than CPC **subclass** level (~670 categories). Using section-level granularity compresses the originality range significantly (max ~0.88 with 8 sections vs. theoretical max ~1.0 with hundreds of subclasses). THJ (1997) used 3-digit USPC codes (~400+ categories). |
| **Pages used** | system-patent-quality, system-patent-fields, inv-generalist-specialist, faq, about, methodology |
| **Consistent?** | YES -- Same section-level formula used in both script 11 and script 60. Script 60 adds citation-count thresholds (>=5, >=10) as robustness checks. |

---

### 2. Generality Index

| Field | Value |
|-------|-------|
| **Name on site** | Generality |
| **Formula (code)** | `1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2))` where `cnt` = forward citations from each CPC section, `total` = total forward citations. Requires `total >= 2`. Generality limited to patents granted <= 2020 (5-year citation window). |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 147-174), `data-pipeline/60_originality_generality_filtered.py` (lines 73-97) |
| **Methodology page** | "Computed identically to originality but using forward citations instead of backward citations." |
| **Academic source (on site)** | Hall, Jaffe, Trajtenberg (2001) implied but not explicitly cited on the page. |
| **Standard definition** | Hall, Jaffe, Trajtenberg (2001): Generality_i = 1 - SUM_j (s_ij^2), where s_ij is the share of forward citations received by patent i from patents in technology class j. |
| **Matches literature?** | PARTIAL -- Same section-level granularity issue as originality. Uses CPC section (8 categories) rather than finer-grained classification. |
| **Pages used** | system-patent-quality, system-patent-fields, inv-generalist-specialist, faq, about, methodology |
| **Consistent?** | YES -- Same formula in scripts 11 and 60. |

---

### 3. Shannon Entropy (Portfolio Diversity)

| Field | Value |
|-------|-------|
| **Name on site** | Shannon entropy, Portfolio diversity |
| **Formula (code)** | **Variant A (natural log):** `ROUND(-SUM(share * LN(share)), 3)` in script 15 (chapter3 portfolio_diversity). **Variant B (log base 2):** `H = -sum(p_i * log2(p_i))` in scripts 35 (portfolio_diversification_b3) and 37 (inventor_drift). **Variant C (log base 2):** `entropy[mask] -= W_prob[mask, i] * np.log2(W_prob[mask, i])` in script 28 (topic novelty). |
| **Code files** | `data-pipeline/15_chapter3_portfolio_diversity.py` (line 80: `LN`), `data-pipeline/35_portfolio_strategy.py` (line 95: `np.log2`), `data-pipeline/37_inventor_careers.py` (line 198: `math.log2`), `data-pipeline/28_chapter12_topic_modeling.py` (line 297: `np.log2`) |
| **Methodology page** | "H = -SUM(p_i ln(p_i)) over category shares." (uses `ln`, i.e., natural log) |
| **Academic source (on site)** | None cited explicitly. Shannon (1948) is the standard reference. |
| **Standard definition** | Shannon (1948): H = -SUM(p_i log(p_i)). The choice of logarithm base determines the unit: natural log = nats, log2 = bits, log10 = hartleys. All are valid; base choice is conventional. |
| **Matches literature?** | YES (any log base is valid), but INCONSISTENT across scripts |
| **Pages used** | org-patent-portfolio, system-language, inv-generalist-specialist, deep-dive-overview, methodology, about (all Act 6 deep dives for domain entropy) |
| **Consistent?** | **NO** -- Script 15 uses natural log (`LN`), while scripts 35, 37, and 28 use log base 2 (`log2`). This means entropy values from script 15 and script 35 are NOT directly comparable. ln(x) = log2(x) * ln(2) = log2(x) * 0.6931, so LN-based values are ~69.3% of log2-based values. The methodology page states `ln` but most implementations use `log2`. |

---

### 4. Herfindahl-Hirschman Index (HHI)

| Field | Value |
|-------|-------|
| **Name on site** | HHI, Herfindahl-Hirschman Index, Concentration |
| **Formula (code)** | `shares_pct = (counts / total) * 100.0; hhi = float(np.sum(shares_pct ** 2))` in script 35. Shares expressed as percentages (0-100), yielding HHI range 0-10,000. |
| **Code files** | `data-pipeline/35_portfolio_strategy.py` (lines 264-268) |
| **Methodology page** | "HHI = SUM(s_i^2) x 10,000 where s_i is the market share expressed as a decimal." |
| **Academic source (on site)** | US DOJ/FTC (2010 Horizontal Merger Guidelines) classification cited on methodology page. |
| **Standard definition** | Herfindahl (1950), Hirschman (1945): HHI = SUM(s_i^2). If s_i in decimals (0-1), range is 0-1. If s_i in percentages (0-100), range is 0-10,000. DOJ convention uses percentage-based (0-10,000). |
| **Matches literature?** | YES -- Uses percentage-based shares (0-100), yielding standard 0-10,000 range matching DOJ convention. |
| **Pages used** | system-patent-fields, inv-top-inventors, inv-gender, inv-generalist-specialist, inv-team-size, ai-patents, methodology |
| **Consistent?** | YES -- The HHI in script 35 (patent_concentration.json) uses percentage shares consistently. Note: the originality/generality metric uses 1-HHI with decimal shares (0-1), which is a different application but internally consistent. |

---

### 5. Concentration Ratio (C4 / CR4 / CR10)

| Field | Value |
|-------|-------|
| **Name on site** | C4, CR4, CR10, Concentration ratio |
| **Formula (code)** | `top4_shares = np.sort(shares_pct)[-4:]; c4 = float(np.sum(top4_shares))` where `shares_pct` are percentage shares. |
| **Code files** | `data-pipeline/35_portfolio_strategy.py` (lines 271-272) |
| **Methodology page** | "CR4 is the combined patent share of the four largest organizations in a domain; CR10 is the share of the ten largest." |
| **Academic source (on site)** | None cited explicitly. Standard industrial organization metric. |
| **Standard definition** | CR_n = sum of market shares of the n largest firms. Standard measure in industrial organization economics. |
| **Matches literature?** | YES |
| **Pages used** | All Act 6 deep-dive chapters (semiconductors, ai-patents, biotech, etc.), org-patent-count, org-composition, geo-domestic, geo-international, deep-dive-overview |
| **Consistent?** | YES |

---

### 6. Citation Half-Life

| Field | Value |
|-------|-------|
| **Name on site** | Citation half-life, Technology half-life |
| **Formula (code)** | **Script 24 (technology_halflife):** Cumulative citation percentage over years-after-grant; half-life = year where cumulative reaches 50%, with linear interpolation. **Script 68 (sleeping_beauty_halflife):** `MIN(cite_lag) WHERE cum_cites >= total_cites * 0.5 AND total_cites >= 5`, then median across patents per CPC section. |
| **Code files** | `data-pipeline/24_chapter2_technology_halflife.py` (lines 54-80), `data-pipeline/68_sleeping_beauty_halflife.py` (lines 73-103) |
| **Methodology page** | "The time it takes for a patent (or a firm's patent portfolio) to accumulate half of its total forward citations." |
| **Academic source (on site)** | None cited. Standard bibliometric concept. |
| **Standard definition** | Burton & Kebler (1960): Half-life of literature = median age of cited references. Applied to patents: time for 50% of total forward citations to accumulate. |
| **Matches literature?** | YES -- Both implementations use the standard 50th-percentile cumulative citations approach. |
| **Pages used** | system-patent-fields, system-patent-quality, org-patent-quality, mech-organizations, methodology |
| **Consistent?** | MOSTLY -- Script 24 uses interpolation for smoother estimates; script 68 uses discrete minimum lag year. Slight numerical differences expected but conceptually identical. |

---

### 7. Blockbuster Rate (Breakthrough Patents)

| Field | Value |
|-------|-------|
| **Name on site** | Blockbuster patent, Breakthrough patent, Blockbuster rate |
| **Formula (code)** | **Script 11:** `PERCENT_RANK() OVER (PARTITION BY year, tech_section ORDER BY fwd_cites) AS pctl; pctl >= 0.99` = top 1% by forward citations within (grant_year x CPC section). **Script 41/65:** Same top 1% threshold (`p99_threshold`) using `PERCENTILE_CONT(0.99)`. **Script compute_quality.py:** Uses top 75th percentile (`all_p75`) for blockbuster -- DIFFERENT. |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 308-321), `data-pipeline/41_firm_quality_distribution.py` (lines 123-213), `data-pipeline/65_blockbuster_lorenz.py` (lines 22-49), `scripts/compute_quality.py` (lines 132-149) |
| **Methodology page** | "A patent in the top 1% of 5-year forward citations within its grant-year x CPC section cohort." |
| **Academic source (on site)** | None cited explicitly. Related to Scherer (1965) on skewness of patent value distributions. |
| **Standard definition** | No single standard. Various thresholds used in literature: top 1% (Trajtenberg 1990), top 5% (Jaffe & Trajtenberg 2002), top 10% (Harhoff et al. 1999). |
| **Matches literature?** | YES -- Top 1% is a commonly used threshold. |
| **Pages used** | system-patent-quality, org-patent-quality, org-patent-count, org-company-profiles, mech-organizations, inv-top-inventors, all Act 6 deep dives, methodology |
| **Consistent?** | **PARTIALLY** -- Most pipeline scripts use top 1% within (year x section). However, `scripts/compute_quality.py` uses the 75th percentile of ALL patents in the year (line 134), which is a different and much broader definition. This script appears to be an alternative/earlier version. The main pipeline (scripts 11, 41, 65) is consistent at top 1%. |

---

### 8. Top-Decile Share (Quality Bifurcation)

| Field | Value |
|-------|-------|
| **Name on site** | Top-decile share, Quality bifurcation |
| **Formula (code)** | `PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY fwd_cite_5y) AS p90_threshold` per (grant_year x cpc_section); then `100.0 * SUM(CASE WHEN fwd_cite_5y >= p90_threshold THEN 1 ELSE 0 END) / COUNT(*)` per domain x 5-year period. |
| **Code files** | `data-pipeline/74_quality_bifurcation.py` (lines 36-86) |
| **Academic source (on site)** | None cited. Related to bifurcation/inequality literature in innovation studies. |
| **Standard definition** | Top decile share = fraction of a subset's patents exceeding the system-wide 90th percentile. Values >10% indicate disproportionate high-quality output. |
| **Matches literature?** | YES |
| **Pages used** | All 12 Act 6 deep-dive chapters, system-public-investment |
| **Consistent?** | YES |

---

### 9. Dud Rate

| Field | Value |
|-------|-------|
| **Name on site** | Dud rate, Zero-citation patents |
| **Formula (code)** | `CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) = 0 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*)` -- fraction of patents with zero 5-year forward citations. |
| **Code files** | `data-pipeline/41_firm_quality_distribution.py` (line 184), `scripts/compute_quality.py` (line 148) |
| **Academic source (on site)** | None cited. |
| **Standard definition** | Proportion of patents receiving zero forward citations within a fixed window. Common in patent quality literature. |
| **Matches literature?** | YES |
| **Pages used** | org-patent-quality, org-company-profiles, system-patent-fields |
| **Consistent?** | YES |

---

### 10. Exploration Composite Score

| Field | Value |
|-------|-------|
| **Name on site** | Exploration composite, Exploration score, Exploration index |
| **Formula (code)** | Average of 3 sub-scores (each 0-1): **(1) Technology newness:** 1.0 if firm has 0 prior patents in same CPC subclass (5-year lookback), linearly decreasing to 0.0 at 10+ prior patents. **(2) Citation newness:** share of backward citations pointing to CPC sections where firm has <5 patents in prior 5 years. **(3) External sourcing:** 1 - self-citation rate. Composite = (tech_newness + citation_newness + external_score) / 3.0. Exploratory if >0.6, exploitative if <0.4. |
| **Code files** | `data-pipeline/42_firm_exploration_exploitation.py` (lines 95-246) |
| **Methodology page** | "Equally weighted average of three normalized sub-scores: Technology newness, Citation newness, External sourcing." Threshold: ">0.6 = exploratory; below 0.6 = exploitative" (note: methodology page says "below 0.6" but code uses "<0.4" for exploitation, with 0.4-0.6 as ambidextrous). |
| **Academic source (on site)** | None cited explicitly. Conceptually based on March (1991) exploration-exploitation framework. |
| **Standard definition** | March (1991) introduced the exploration-exploitation dichotomy. Benner & Tushman (2003), He & Wong (2004) operationalized it for patent data. No single standard formula exists; the three-indicator composite is a project-specific construction. |
| **Matches literature?** | REASONABLE -- The three sub-indicators are sensible operationalizations. The 0/10 linear scale for technology newness and the <5 threshold for citation newness are project-specific choices without direct literature precedent. |
| **Pages used** | mech-organizations, methodology |
| **Consistent?** | MOSTLY -- Script 42 uses full 3-indicator composite. Script 44 (ambidexterity) uses simplified single-indicator (technology newness only) for computational speed. Script 62 uses cosine distance from prior CPC centroid as an alternative exploration measure. These are three different operationalizations. |

---

### 11. Ambidexterity Index

| Field | Value |
|-------|-------|
| **Name on site** | Ambidexterity index |
| **Formula (code)** | `1.0 - ABS(exploration_share - exploitation_share)` where exploration_share = fraction of patents with exploration score >0.6, exploitation_share = fraction <0.4. |
| **Code files** | `data-pipeline/44_firm_ambidexterity_quality.py` (lines 161-164) |
| **Methodology page** | "1 minus the absolute deviation of the exploration share from 50%." |
| **Academic source (on site)** | None cited. Related to Tushman & O'Reilly (1996), He & Wong (2004) on organizational ambidexterity. |
| **Standard definition** | He & Wong (2004) measure ambidexterity as the interaction between exploration and exploitation. No single standard formula. The absolute-deviation approach is one common operationalization. |
| **Matches literature?** | REASONABLE -- A simple and interpretable measure, though some scholars prefer multiplicative (exploration x exploitation) or other formulations. |
| **Pages used** | mech-organizations, methodology |
| **Consistent?** | YES |

---

### 12. Self-Citation Rate

| Field | Value |
|-------|-------|
| **Name on site** | Self-citation rate |
| **Formula (code)** | `CAST(SUM(is_self_cite) AS DOUBLE) / COUNT(*)` where `is_self_cite = CASE WHEN pa1.org = pa2.org THEN 1 ELSE 0 END` -- exact string match on disambig_assignee_organization for sequence 0 assignee. |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 187-230), `data-pipeline/42_firm_exploration_exploitation.py` (lines 145-163) |
| **Methodology page** | "Fraction of a patent's backward citations directed to patents held by the same assignee." |
| **Academic source (on site)** | None cited explicitly. Standard metric in patent analytics. |
| **Standard definition** | Hall, Jaffe, Trajtenberg (2001): self-citation when citing and cited patent share the same assignee. |
| **Matches literature?** | YES -- Uses primary assignee (sequence=0) match, which is standard. |
| **Pages used** | system-patent-quality, mech-organizations |
| **Consistent?** | YES |

---

### 13. Cohort-Normalized Citations

| Field | Value |
|-------|-------|
| **Name on site** | Cohort normalization, Cohort-normalized citations |
| **Formula (code)** | `patent.fwd_cite_5y / cohort_mean` where `cohort_mean = AVG(fwd_cite_5y) GROUP BY grant_year, cpc_section`. Value of 1.0 = average impact for cohort. |
| **Code files** | `data-pipeline/59_cohort_normalization.py` (lines 50-62), `data-pipeline/64_team_size_coefficients.py` (lines 46-52) |
| **Methodology page** | "A patent's citation count divided by the mean citation count of all patents in the same grant-year x CPC section cohort." |
| **Academic source (on site)** | None cited explicitly. Standard approach in bibliometrics; see Waltman & van Eck (2012). |
| **Standard definition** | Divide patent citations by cohort mean (or median) to account for field- and time-specific citation patterns. |
| **Matches literature?** | YES -- Uses mean-based normalization, which is the most common approach. Some literature prefers median normalization. |
| **Pages used** | system-patent-quality, org-patent-count, org-composition, inv-team-size, system-public-investment |
| **Consistent?** | YES |

---

### 14. Composite Quality Index (Z-Score)

| Field | Value |
|-------|-------|
| **Name on site** | Composite quality index |
| **Formula (code)** | Z-score each of 4 components (forward citations, claims, scope, grant lag) using global mean/std. Invert grant lag (negative Z). Composite = (z_cites + z_claims + z_scope + z_lag) / 4. |
| **Code files** | `data-pipeline/18_chapter9_composite_quality.py` (lines 71-97) |
| **Academic source (on site)** | None cited. |
| **Standard definition** | No single standard. Various composite quality indices exist; e.g., Lanjouw & Schankerman (2004) use factor analysis on claims, citations, family size, and backward citations. |
| **Matches literature?** | REASONABLE -- Equal-weight Z-score averaging is simpler than factor analysis but conceptually similar. The choice to invert grant lag is appropriate (shorter lag = higher quality). |
| **Pages used** | system-convergence |
| **Consistent?** | YES |

---

### 15. Gini Coefficient

| Field | Value |
|-------|-------|
| **Name on site** | Gini coefficient |
| **Formula (code)** | `(2 * np.sum(index * vals) - (n + 1) * vals.sum()) / (n * vals.sum())` where vals are sorted citation counts and index = 1..n. |
| **Code files** | `data-pipeline/41_firm_quality_distribution.py` (lines 228-235), `data-pipeline/65_blockbuster_lorenz.py` (lines 71-101, trapezoidal rule), `scripts/compute_quality.py` (lines 96-104) |
| **Methodology page** | "A measure of statistical dispersion ranging from 0 (perfect equality) to 1 (maximum inequality)." |
| **Academic source (on site)** | None cited. Standard econometric measure. |
| **Standard definition** | Gini (1912): Area between Lorenz curve and line of equality, normalized to 0-1. |
| **Matches literature?** | YES -- Both the direct formula (script 41) and Lorenz-based trapezoidal method (script 65) are standard. |
| **Pages used** | org-patent-count, org-patent-quality, org-company-profiles, mech-organizations, inv-top-inventors, geo-domestic, org-composition, cybersecurity, methodology |
| **Consistent?** | YES -- Two different but mathematically equivalent implementations. |

---

### 16. Patent Scope

| Field | Value |
|-------|-------|
| **Name on site** | Patent scope |
| **Formula (code)** | `COUNT(DISTINCT LEFT(cpc_subclass, 4)) AS patent_scope` (script 11) or `COUNT(DISTINCT cpc_subclass) AS patent_scope` (script 18) or `COUNT(DISTINCT cpc.cpc_subclass) AS scope` (script 41). |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 55-58), `data-pipeline/18_chapter9_composite_quality.py` (lines 44-49), `data-pipeline/41_firm_quality_distribution.py` (lines 96-101) |
| **Methodology page** | "Number of distinct CPC subclasses assigned to each patent." |
| **Academic source (on site)** | Lerner (1994) introduced patent scope measurement. |
| **Standard definition** | Lerner (1994): Count of distinct IPC/CPC classes. Some authors use subclass level, others use group level. |
| **Matches literature?** | YES -- Uses CPC subclass count, consistent with modern practice. |
| **Pages used** | system-patent-quality, system-patent-fields, org-patent-quality, methodology |
| **Consistent?** | **MOSTLY** -- Script 11 uses `LEFT(cpc_subclass, 4)` (truncates to first 4 chars) while scripts 18 and 41 use full `cpc_subclass`. Since CPC subclass codes are typically 4 characters (e.g., "H01L"), this is likely equivalent, but could differ for subclasses with longer codes. |

---

### 17. Grant Lag (Pendency)

| Field | Value |
|-------|-------|
| **Name on site** | Grant lag, Pendency |
| **Formula (code)** | `DATEDIFF('day', CAST(a.filing_date AS DATE), CAST(p.patent_date AS DATE)) AS grant_lag_days` |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 65-71), `data-pipeline/18_chapter9_composite_quality.py` (lines 51-56) |
| **Methodology page** | "Number of days between patent application filing date and grant date." |
| **Academic source (on site)** | None cited. Standard USPTO metric. |
| **Standard definition** | Filing-to-grant interval in days. Standard measure of patent office processing time. |
| **Matches literature?** | YES |
| **Pages used** | system-patent-quality, methodology |
| **Consistent?** | YES |

---

### 18. Forward Citations (5-Year)

| Field | Value |
|-------|-------|
| **Name on site** | Forward citations (5-year), 5-year forward citations |
| **Formula (code)** | Count of citing patents where `DATEDIFF('day', cited.patent_date, citing.patent_date) <= 1826` (approximately 5 years = 5 * 365.25 = 1826.25 days). |
| **Code files** | `data-pipeline/11_chapter9_patent_quality.py` (lines 43-53), `data-pipeline/41_firm_quality_distribution.py` (lines 106-119), and many others |
| **Methodology page** | "Number of subsequent patents citing a given patent within 5 years of grant." |
| **Academic source (on site)** | None cited explicitly. Standard window; see Hall, Jaffe, Trajtenberg (2001). |
| **Standard definition** | Count of forward citations accumulated within a fixed window post-grant. 5-year is standard; some studies use 3-year or 7-year windows. |
| **Matches literature?** | YES |
| **Pages used** | Nearly all chapters involving quality metrics |
| **Consistent?** | YES -- 1826-day window used consistently across all scripts. |

---

### 19. CAGR (Compound Annual Growth Rate)

| Field | Value |
|-------|-------|
| **Name on site** | CAGR, Growth rate |
| **Formula (code)** | `POWER(CAST(yr.n_late AS DOUBLE) / yr.n_early, 0.2) - 1` where n_late = count for 2020-2024, n_early = count for 2015-2019. Exponent 0.2 = 1/5 for 5-year CAGR. |
| **Code files** | `data-pipeline/72_act6_cross_domain.py` (lines 88-90) |
| **Academic source (on site)** | None cited. Standard financial/growth metric. |
| **Standard definition** | CAGR = (V_final / V_initial)^(1/n) - 1, where n = number of periods. |
| **Matches literature?** | YES |
| **Pages used** | Act 6 deep-dive overview and comparison pages |
| **Consistent?** | YES |

---

### 20. Novelty (Topic Entropy)

| Field | Value |
|-------|-------|
| **Name on site** | Novelty, Topic entropy, Novelty score |
| **Formula (code)** | Shannon entropy of NMF topic distribution per patent: `H = -sum(p_i * log2(p_i))` where p_i is the normalized weight of topic i in the patent's topic vector. Uses log2. |
| **Code files** | `data-pipeline/28_chapter12_topic_modeling.py` (lines 282-335) |
| **Academic source (on site)** | None cited explicitly for the novelty interpretation. |
| **Standard definition** | Novelty measured via topic entropy is project-specific. Related to Uzzi et al. (2013) "atypical combinations" and Kaplan & Vakili (2015) on novelty in patent text. Entropy is a proxy for how many topics a patent spans. |
| **Matches literature?** | REASONABLE -- Using topic-level entropy as a novelty proxy is defensible but not a standard metric in the literature. Higher entropy means the patent spans more topics, which could indicate either novelty or vagueness. |
| **Pages used** | system-language |
| **Consistent?** | YES (single implementation) |

---

### 21. Jensen-Shannon Divergence (Technology Pivot Detection)

| Field | Value |
|-------|-------|
| **Name on site** | Jensen-Shannon divergence, JSD, Technology pivot |
| **Formula (code)** | `jsd = jensenshannon(p, q, base=2)` using scipy. Applied to CPC subclass probability distributions in consecutive 3-year windows. Pivot flagged at 95th percentile of a company's JSD values. |
| **Code files** | `data-pipeline/35_portfolio_strategy.py` (lines 139-220) |
| **Academic source (on site)** | None cited explicitly. |
| **Standard definition** | Lin (1991): JSD(P||Q) = 0.5 * KL(P||M) + 0.5 * KL(Q||M) where M = 0.5*(P+Q). Square root gives the Jensen-Shannon distance (metric). scipy returns the distance (square root of divergence). |
| **Matches literature?** | YES -- scipy.spatial.distance.jensenshannon returns the JSD metric (square root). Base=2 gives bits. |
| **Pages used** | org-patent-portfolio |
| **Consistent?** | YES |

---

### 22. Location Quotient (Regional Specialization)

| Field | Value |
|-------|-------|
| **Name on site** | Location quotient, Regional specialization |
| **Formula (code)** | `LQ = (metro_section_count / metro_total) / (nat_section_count / nat_total)` |
| **Code files** | `data-pipeline/21_chapter4_regional_specialization.py` (lines 72-76) |
| **Academic source (on site)** | None cited explicitly. |
| **Standard definition** | Florence (1948): LQ = (local share of industry X) / (national share of industry X). LQ > 1 indicates specialization. Standard in economic geography. |
| **Matches literature?** | YES |
| **Pages used** | geo-domestic |
| **Consistent?** | YES |

---

### 23. Sleeping Beauty Index

| Field | Value |
|-------|-------|
| **Name on site** | Sleeping beauty patent |
| **Formula (code)** | **Script 22:** avg_early_rate < 2 citations/year for first 10 years AND max burst >= 10 citations in a 3-year window after year 10. **Script 68:** early_cites <= 2 in first 3 years AND total_cites >= 10. |
| **Code files** | `data-pipeline/22_chapter9_sleeping_beauty.py` (lines 45-93), `data-pipeline/68_sleeping_beauty_halflife.py` (lines 47-66) |
| **Methodology page** | "A patent that receives few or no citations for an extended period after grant before experiencing a sudden surge of recognition." |
| **Academic source (on site)** | None cited explicitly. Related to van Raan (2004) "sleeping beauties in science." |
| **Standard definition** | Van Raan (2004): A publication that goes unnoticed for a long time and then suddenly attracts attention. No standard quantitative threshold. Ke et al. (2015) proposed the "beauty coefficient" (B = sum over time of (expected_citations - actual_citations) / max_citations). |
| **Matches literature?** | REASONABLE -- The criteria are defensible but use simpler thresholds than the formal beauty coefficient. Two scripts use different definitions (see below). |
| **Pages used** | system-patent-quality, methodology |
| **Consistent?** | **NO** -- Script 22 requires <2 avg citations/year for first **10 years** with burst of >=10 in 3-year window after year 10. Script 68 requires <=2 citations in first **3 years** with >=10 total citations. These are substantially different criteria -- script 22 is much stricter (10-year dormancy), while script 68 identifies a broader set (3-year dormancy). |

---

### 24. Cosine Distance (Exploration Trajectory)

| Field | Value |
|-------|-------|
| **Name on site** | Exploration index (cosine distance) |
| **Formula (code)** | `cosine_dist = 1.0 - dot(v1, v2) / (mag(v1) * mag(v2))` where v1 and v2 are CPC subclass count vectors for consecutive 5-year periods. |
| **Code files** | `data-pipeline/62_exploration_trajectory.py` (lines 110-118) |
| **Academic source (on site)** | None cited. |
| **Standard definition** | Cosine distance = 1 - cosine similarity. Standard in information retrieval and NLP. Applied to patent classification vectors to measure technology portfolio shifts. |
| **Matches literature?** | REASONABLE -- Using cosine distance between CPC vectors is a valid operationalization of exploration. See also Breschi, Lissoni & Malerba (2003) on technological coherence. |
| **Pages used** | mech-organizations |
| **Consistent?** | YES (single implementation, distinct from composite exploration score in script 42) |

---

### 25. Inventor Survival Rate (Career Longevity)

| Field | Value |
|-------|-------|
| **Name on site** | Inventor survival, Career survival curves, Inventor longevity |
| **Formula (code)** | `survival_pct = 100.0 * (cohort_inventors['career_length'] >= cl).sum() / total` per 5-year entry cohort, for each career_length cl. Career_length = last_patent_year - first_patent_year. |
| **Code files** | `data-pipeline/10_chapter5_inventor_deep.py` (lines 76-116) |
| **Academic source (on site)** | None cited explicitly. |
| **Standard definition** | Kaplan-Meier survival analysis adapted for inventor careers. Measures fraction of a cohort still active after N years. Subject to right-censoring for recent cohorts. |
| **Matches literature?** | REASONABLE -- Simple survival curves without censoring adjustment. More sophisticated studies use Cox proportional hazards. Right-censoring bias noted implicitly (max career bounded by 2025 - cohort_start). |
| **Pages used** | inv-top-inventors, inv-serial-new, inv-generalist-specialist, org-patent-count |
| **Consistent?** | YES |

---

### 26. Shift-Share Decomposition (Convergence)

| Field | Value |
|-------|-------|
| **Name on site** | Within-firm vs between-firm decomposition, Shift-share |
| **Formula (code)** | **Within-firm:** `SUM((share_t-1) * (rate_t - rate_t-1))`. **Between-firm:** `SUM((share_t - share_t-1) * rate_t-1)`. Where share = firm's patent count / total, rate = firm's multi-section patent share. |
| **Code files** | `data-pipeline/61_convergence_decomposition.py` (lines 42-103) |
| **Academic source (on site)** | None cited explicitly. |
| **Standard definition** | Laspeyres/shift-share decomposition (Dunn 1960): Total change = within-group change + between-group (structural) change + interaction. The implementation omits the interaction term. |
| **Matches literature?** | MOSTLY -- Standard shift-share without interaction term. The omitted interaction term is a common simplification. |
| **Pages used** | system-convergence |
| **Consistent?** | YES |

---

### 27. Interdisciplinarity Composite Index

| Field | Value |
|-------|-------|
| **Name on site** | Interdisciplinarity index |
| **Formula (code)** | Z-score composite of 3 measures: mean CPC subclasses per patent (scope), mean CPC sections per patent, and multi-section share (%). Composite = average of 3 Z-scores. |
| **Code files** | `data-pipeline/67_interdisciplinarity_trend.py` (lines 24-63) |
| **Academic source (on site)** | None cited. |
| **Standard definition** | Various measures exist: Stirling (2007) proposes variety x balance x disparity. Porter & Rafols (2009) use Rao-Stirling diversity. This implementation is simpler but captures related dimensions. |
| **Matches literature?** | REASONABLE -- Captures variety and balance dimensions but not disparity (how different the categories are). |
| **Pages used** | system-convergence |
| **Consistent?** | YES |

---

### 28. Corporate Survival Rate

| Field | Value |
|-------|-------|
| **Name on site** | Survival rate, Corporate mortality |
| **Formula (code)** | `rate = 100.0 * len(survivors) / len(prev_set)` where survivors = top-50 firms in decade D-1 that remain in top-50 in decade D. |
| **Code files** | `data-pipeline/34_corporate_mortality.py` (lines 100-124) |
| **Academic source (on site)** | None cited. |
| **Standard definition** | Fraction of incumbents retaining top-N status across periods. Related to innovation persistence literature (Cefis & Orsenigo 2001). |
| **Matches literature?** | YES |
| **Pages used** | org-patent-count |
| **Consistent?** | YES |

---

## Detailed Formula Variant Analysis

### Shannon Entropy: Log Base Inconsistency

| Script | Log Base | Context | Example Output |
|--------|----------|---------|----------------|
| `15_chapter3_portfolio_diversity.py` | **LN** (natural log) | Portfolio diversity for top 25 assignees | Produces values in **nats** |
| `35_portfolio_strategy.py` | **log2** | Portfolio diversification for top 50 assignees | Produces values in **bits** |
| `37_inventor_careers.py` | **log2** | Inventor technology drift classification | Produces values in **bits** |
| `28_chapter12_topic_modeling.py` | **log2** | Topic novelty (NMF entropy) | Produces values in **bits** |

**Impact:** An entropy value of 2.0 bits (log2) = 1.386 nats (LN). If the two outputs are ever compared directly (e.g., script 15's portfolio diversity vs. script 35's portfolio diversification), the values will not be on the same scale. Script 15 outputs to `chapter3/portfolio_diversity.json` and script 35 outputs to `company/portfolio_diversification_b3.json` -- different files, so they are not mixed in the same chart. However, the methodology page says `ln` while most implementations use `log2`.

**Recommendation:** Standardize to one logarithm base. Log2 (bits) is more common in information theory; LN (nats) is more common in physics and some economics literature. Update the methodology page to match whichever base is chosen.

---

### Originality/Generality: Granularity Level

The code computes originality and generality at **CPC section level** (8 categories: A through H), using the primary CPC assignment (sequence=0) of each cited/citing patent.

**In the literature:**
- Trajtenberg, Henderson, Jaffe (1997) used **3-digit USPC technology classes** (~400+ categories)
- Hall, Jaffe, Trajtenberg (2001) used **2-digit NBER technology subcategories** (~36 categories)
- Modern implementations often use **CPC subclass** (~670 categories) or **CPC group** (~8000 categories)

**Impact:** With only 8 categories, the theoretical maximum originality/generality is `1 - 8*(1/8)^2 = 0.875`. Actual values on the site range from ~0.09 to ~0.55 (section-level averages). Using finer granularity would yield higher values and more discriminating power. The site's values are internally consistent and interpretable, but cannot be directly compared with published values from studies using different classification levels.

---

### Blockbuster Definition Variants

| Implementation | Threshold | Conditioning | Window |
|---------------|-----------|--------------|--------|
| Script 11 (breakthrough_patents) | Top 1% (PERCENT_RANK >= 0.99) | Within (year x CPC section) | All-time forward cites |
| Script 41 (firm_quality) | Top 1% (PERCENTILE_CONT 0.99) | Within (year x CPC section) | 5-year forward cites |
| Script 65 (blockbuster_lorenz) | Top 1% (PERCENT_RANK >= 0.99) | Within (year x CPC section) | 5-year forward cites |
| Script 74 (quality_bifurcation) | Top 10% (PERCENTILE_CONT 0.9) | Within (year x CPC section) | 5-year forward cites |
| scripts/compute_quality.py | Top 25% (75th percentile) | Within year (ALL patents) | All-time forward cites |

**Impact:** Script 74 uses a different threshold (top 10% = "top decile") which is intentional and labeled differently. However, `scripts/compute_quality.py` uses the 75th percentile across ALL patents in a year (no CPC conditioning), producing a fundamentally different and much broader definition. This script appears to be an alternative/superseded version.

---

### Sleeping Beauty: Two Different Definitions

| Script | Dormancy Period | Dormancy Threshold | Burst Criterion |
|--------|----------------|-------------------|-----------------|
| 22_chapter9_sleeping_beauty.py | First 10 years | <2 avg cites/year | >=10 cites in 3-year window after year 10 |
| 68_sleeping_beauty_halflife.py | First 3 years | <=2 total cites | >=10 total cites (all time) |

**Impact:** Script 22 identifies very rare "true" sleeping beauties with long dormancy periods. Script 68 identifies a much broader set of "late bloomers." Both are used in different contexts and output to different files, but both are called "sleeping beauties" on the site.

---

## Issues Found

### Issue 1: Shannon Entropy Log Base Inconsistency (MEDIUM)
- **Location:** `data-pipeline/15_chapter3_portfolio_diversity.py` vs. `data-pipeline/35_portfolio_strategy.py`
- **Problem:** Script 15 uses natural log (LN), scripts 35/37/28 use log2. Methodology page says "ln."
- **Impact:** Values from different scripts are on different scales (nats vs. bits).
- **Recommendation:** Standardize all to log2 (majority usage) and update methodology page text.

### Issue 2: Sleeping Beauty Criteria Mismatch (MEDIUM)
- **Location:** `data-pipeline/22_chapter9_sleeping_beauty.py` vs. `data-pipeline/68_sleeping_beauty_halflife.py`
- **Problem:** Two different definitions of "sleeping beauty" -- 10-year dormancy vs. 3-year dormancy.
- **Impact:** Results labeled "sleeping beauty" may refer to very different patent populations.
- **Recommendation:** Rename one metric (e.g., "delayed recognition patents" vs. "sleeping beauty patents") or add explicit labels distinguishing the two criteria.

### Issue 3: Originality/Generality Computed at Coarse Section Level (LOW)
- **Location:** `data-pipeline/11_chapter9_patent_quality.py`, `data-pipeline/60_originality_generality_filtered.py`
- **Problem:** Uses 8 CPC sections (A-H) rather than ~670 CPC subclasses. Published literature typically uses finer granularity.
- **Impact:** Values are compressed relative to literature benchmarks. The methodology page does not note this is section-level.
- **Recommendation:** Add a note to the methodology page stating that originality/generality are computed at the CPC section level. Consider adding a subclass-level variant for comparison.

### Issue 4: Methodology Page Exploration Threshold Description (LOW)
- **Location:** `src/app/methodology/page.tsx` line 494
- **Problem:** Page says "Patents scoring above 0.6 are classified as exploratory; those below 0.6 as exploitative." Code uses three categories: >0.6 = exploratory, 0.4-0.6 = ambidextrous, <0.4 = exploitative.
- **Impact:** The methodology page omits the ambidextrous middle category.
- **Recommendation:** Update text to: "above 0.6 = exploratory, 0.4-0.6 = ambidextrous, below 0.4 = exploitative."

### Issue 5: Missing Academic Citations (LOW)
- **Location:** Methodology page and glossary
- **Problem:** Several well-known metrics lack explicit academic citations:
  - Originality: Should cite Trajtenberg, Henderson, Jaffe (1997)
  - Generality: Should cite Hall, Jaffe, Trajtenberg (2001)
  - Shannon entropy: Should cite Shannon (1948)
  - Exploration/exploitation: Should cite March (1991)
  - Sleeping beauty: Should cite van Raan (2004)
  - Location quotient: Should cite Florence (1948)
- **Impact:** Academic credibility and reproducibility.
- **Recommendation:** Add a "References" section to the methodology page.

---

## Complete File Index

### Pipeline Scripts Computing Derived Metrics

| Script | Metrics Computed |
|--------|-----------------|
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
| `data-pipeline/42_firm_exploration_exploitation.py` | Exploration composite (3 indicators) |
| `data-pipeline/44_firm_ambidexterity_quality.py` | Ambidexterity index |
| `data-pipeline/59_cohort_normalization.py` | Cohort-normalized citations |
| `data-pipeline/60_originality_generality_filtered.py` | Originality/generality at multiple thresholds |
| `data-pipeline/61_convergence_decomposition.py` | Shift-share decomposition |
| `data-pipeline/62_exploration_trajectory.py` | Cosine distance exploration index |
| `data-pipeline/64_team_size_coefficients.py` | Cohort-normalized citations, FWL regression |
| `data-pipeline/65_blockbuster_lorenz.py` | Lorenz curves, Gini, blockbuster rate |
| `data-pipeline/67_interdisciplinarity_trend.py` | Z-score interdisciplinarity composite |
| `data-pipeline/68_sleeping_beauty_halflife.py` | Sleeping beauty (3-year definition), citation half-life |
| `data-pipeline/72_act6_cross_domain.py` | CAGR |
| `data-pipeline/74_quality_bifurcation.py` | Top-decile share |
| `data-pipeline/10_chapter5_inventor_deep.py` | Inventor survival curves |
| `scripts/compute_quality.py` | Alternative Gini, alternative blockbuster (75th pctl) |
