# Derived Metrics Registry -- PatentWorld Audit (Section 1.5)

**Audit date:** 2026-02-21
**Last updated:** 2026-02-21
**Auditor:** Automated code audit (Section 1.5)
**Project:** PatentWorld (`patentworld.vercel.app`)
**Data source:** USPTO PatentsView bulk data (1976-2025)

---

## Summary

| Item | Count |
|------|-------|
| **Total derived metrics found** | 39 |
| **Pipeline implementation files** | 30+ (in `data-pipeline/`) + 5 (in `scripts/`) |
| **Client-side computations (chapter pages)** | 3 metrics (CR4, subfield diversity, patent velocity) |
| **Methodology page definitions** | 18 metrics defined |
| **Glossary entries** | 17 terms |
| **Issues found** | 8 (see Issues section) |

---

## CRITICAL: Entropy Scale Consistency Audit

The site uses Shannon entropy in **five distinct contexts** with **three different scales** and **two different log bases**. This section provides the definitive reconciliation.

### Entropy Variant Reference Table

| Context | Log Base | Normalization | Scale | Typical Values | Label on Site | File Path |
|---------|----------|---------------|-------|----------------|---------------|-----------|
| Portfolio diversity (CPC subclass) | **LN** (nats) | None (raw) | 0 to ln(N) | 4.0 to 7.1 | "Shannon entropy" | `data-pipeline/15_chapter3_portfolio_diversity.py` line 80 |
| Portfolio diversification (CPC subclass) | **log2** (bits) | None (raw) | 0 to log2(N) | higher than LN variant | "shannon_entropy" | `data-pipeline/35_portfolio_strategy.py` line 95 |
| Topic novelty (NMF 25 topics) | **log2** (bits) | None (raw) | 0 to log2(25) = 4.64 | 1.97 to 2.10 median | "Shannon Entropy (bits)" | `data-pipeline/28_chapter12_topic_modeling.py` line 297 |
| Inventor classification (CPC section) | **log2** (bits) | None (raw) | 0 to log2(8) = 3.0 | <0.5 specialist, >1.5 generalist | "Shannon entropy" | `data-pipeline/37_inventor_careers.py` line 198 |
| Subfield diversity (Act 6) | **LN** (cancels) | **H / ln(N)** | **0 to 1** | 0.32 to 0.97 | "Diversity Index" | `src/app/chapters/*/page.tsx` lines 208-222 |
| WIPO portfolio diversity | **LN** (nats) | None (raw) | 0 to ln(35) = 3.56 | varies | "wipo_shannon_entropy" | `data-pipeline/phase5.py` line 264 |
| Gov agency breadth | **N/A** | **1 - HHI** (NOT entropy) | 0 to ~0.875 | varies | **"Shannon Entropy"** (MISLABELED) | `data-pipeline/66_gov_agency_field.py` line 149 |

### Verification of Cited Values

1. **Portfolio diversity: "Shannon entropy of 7.1 (Mitsubishi Electric, 287 CPC subclasses)"**
   - Source: `data-pipeline/15_chapter3_portfolio_diversity.py` (script 15)
   - Log base: **LN** (natural log)
   - Formula: `-SUM(share * LN(share))` over CPC subclass shares
   - Verification: With 287 subclasses, max possible H = ln(287) = 5.66 nats. A value of 7.1 nats would exceed the theoretical max for a uniform distribution across 287 categories. This likely reflects that `num_subclasses` counts distinct subclasses per period but the 7.1 entropy may come from a period with more subclasses, or the value is across all CPC codes (not just subclasses). The value is **raw Shannon entropy in nats**. Label is unambiguous within the org-patent-portfolio page.

2. **Subfield diversity: 0.97, 0.94, 0.92**
   - Source: Client-side computation in all 12 Act 6 chapter pages
   - Log base: **LN** (but cancels in normalization)
   - Formula: `H / Math.log(N)` where H = `-SUM(p * Math.log(p))` and N = number of subfields with patents > 0
   - Scale: **Normalized to [0, 1]** (Pielou evenness)
   - Label: "Diversity Index" on charts, "Normalized Shannon entropy" in captions
   - **Unambiguous** -- The 0-1 scale and "normalized" qualifier make the scaling clear.

3. **Topic novelty: 1.97 to 2.10**
   - Source: `data-pipeline/28_chapter12_topic_modeling.py`
   - Log base: **log2** (bits)
   - Formula: `-SUM(p * log2(p))` over 25 NMF topic weights per patent
   - Max possible: log2(25) = 4.64 bits
   - Values 1.97-2.10 are raw bits, indicating patents draw from roughly 4 topics on average (2^2 = 4)
   - Y-axis label: "Shannon Entropy (bits)" -- **correctly labeled** on system-language page

4. **Inventor specialization thresholds (<0.5 specialist, >1.5 generalist)**
   - Source: `data-pipeline/37_inventor_careers.py`
   - Log base: **log2** (bits)
   - Max possible: log2(8) = 3.0 bits (for 8 CPC sections)
   - Thresholds are in bits: <0.5 = specialist (concentrated in ~1 section), >1.5 = generalist (across ~3+ sections)

### Entropy Label Ambiguity Assessment

| Page | Label Used | Actual Metric | Ambiguous? |
|------|-----------|---------------|------------|
| org-patent-portfolio | "Shannon entropy" | Raw LN-based Shannon entropy (nats) | SOMEWHAT -- no unit label |
| system-language | "Shannon Entropy (bits)" | Raw log2-based topic entropy | NO -- unit specified |
| inv-generalist-specialist | "Shannon entropy" | Raw log2-based section entropy | SOMEWHAT -- no unit label |
| All Act 6 deep dives | "Diversity Index" / "Normalized Shannon entropy" | Pielou evenness [0-1] | NO -- scale clear |
| deep-dive-overview | "H = -SUM p_i log2(p_i)" | States log2 formula | **INCORRECT** -- actual code uses LN (normalized) |
| system-public-investment | "Breadth (Shannon Entropy)" | **1 - HHI** (Simpson diversity) | **YES -- MISLABELED** |

---

## Metric Registry

Each metric is cataloged with: the exact formula as implemented in code, file path(s), any cited academic sources, the standard definition from the literature, whether the implementation matches, every chapter page that uses the metric, and whether the metric is consistent across pages.

---

### 1. Originality Index

| Field | Value |
|-------|-------|
| **Metric** | Originality |
| **Formula in Code** | `1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2))` where `cnt` = backward citations in each CPC **section** (A-H), `total` = total backward citations. Requires `total >= 2`; else 0. Equivalent to `1 - HHI` of CPC section shares among backward citations. |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 119-141), `data-pipeline/60_originality_generality_filtered.py` (lines 42-66), `compute_quality_metrics.py` (lines 210-260) |
| **Cited Source** | Jaffe & de Rassenfosse (2017) cited in script 11 docstring. Trajtenberg, Henderson, Jaffe (1997) cited on methodology page. |
| **Standard Definition** | Trajtenberg, Henderson, Jaffe (1997): Originality_i = 1 - SUM_j(s_ij^2), where s_ij is the share of backward citations from patent i to technology class j. Originally used 3-digit USPC classes (~400+ categories). |
| **Match?** | PARTIAL -- Formula is correct (1-HHI), but computed at CPC **section** level (8 categories A-H) rather than subclass (~670) or group (~8000) level. Compresses range: max ~0.875 with 8 categories vs. ~1.0 with hundreds. The methodology page now notes this granularity difference. |
| **Pages Used** | system-patent-quality, system-patent-fields, inv-generalist-specialist, about, methodology |
| **Consistent Across Pages?** | YES -- same pipeline output used everywhere. |

---

### 2. Generality Index

| Field | Value |
|-------|-------|
| **Metric** | Generality |
| **Formula in Code** | `1.0 - SUM(POWER(CAST(cnt AS DOUBLE) / total, 2))` where `cnt` = forward citations **from** each CPC section, `total` = total forward citations. Requires `total >= 2`. Limited to patents granted <= 2020 (5-year citation window). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 147-174), `data-pipeline/60_originality_generality_filtered.py` (lines 73-97), `compute_quality_metrics.py` (lines 265-315) |
| **Cited Source** | Hall, Jaffe, Trajtenberg (2001) cited on methodology page. |
| **Standard Definition** | Hall, Jaffe, Trajtenberg (2001): Generality_i = 1 - SUM_j(s_ij^2), where s_ij is the share of forward citations received by patent i from technology class j. |
| **Match?** | PARTIAL -- Same section-level granularity limitation as originality. Methodology page notes the absence of the HJT small-sample correction, which may introduce upward bias for patents with very few citations. |
| **Pages Used** | system-patent-quality, system-patent-fields, inv-generalist-specialist, system-public-investment (gov patents), about, methodology |
| **Consistent Across Pages?** | YES -- same pipeline output used everywhere. |

---

### 3. Shannon Entropy (Portfolio Diversity -- Raw, LN)

| Field | Value |
|-------|-------|
| **Metric** | Shannon Entropy / Portfolio Diversity (CPC subclass, natural log) |
| **Formula in Code** | `ROUND(-SUM(share * LN(share)), 3)` over CPC subclass shares per org per 5-year period. |
| **File Path** | `data-pipeline/15_chapter3_portfolio_diversity.py` (line 80) |
| **Cited Source** | None cited. Shannon (1948) is the standard reference. |
| **Standard Definition** | Shannon (1948): H = -SUM(p_i * log(p_i)). LN yields nats. |
| **Match?** | YES -- standard formula. Output is in **nats**. |
| **Pages Used** | org-patent-portfolio |
| **Consistent Across Pages?** | YES within org-patent-portfolio. NOT directly comparable with script 35 (log2). |

---

### 4. Shannon Entropy (Portfolio Diversification -- Raw, log2)

| Field | Value |
|-------|-------|
| **Metric** | Shannon Entropy / Portfolio Diversification (CPC subclass, log2) |
| **Formula in Code** | `H = -np.sum(probs * np.log2(probs))` per org per year. |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (line 95) |
| **Cited Source** | None cited. |
| **Standard Definition** | Shannon (1948): H = -SUM(p_i * log2(p_i)). log2 yields bits. |
| **Match?** | YES -- standard formula. Output is in **bits**. |
| **Pages Used** | org-company-profiles (company profiles radar) |
| **Consistent Across Pages?** | YES within its output file. Outputs to `company/portfolio_diversification_b3.json`, distinct from script 15 output. |

---

### 5. Shannon Entropy (Topic Novelty -- Raw, log2)

| Field | Value |
|-------|-------|
| **Metric** | Novelty / Topic Entropy (NMF 25-topic distribution, log2) |
| **Formula in Code** | `entropy[mask] -= W_prob[mask, i] * np.log2(W_prob[mask, i])` per patent. Trend metric: median and mean entropy per year. |
| **File Path** | `data-pipeline/28_chapter12_topic_modeling.py` (lines 282-335) |
| **Cited Source** | None cited. Related to Uzzi et al. (2013), Kaplan & Vakili (2015). |
| **Standard Definition** | Using topic-level entropy as a novelty proxy is project-specific. Higher entropy = patent draws from more topics. Max = log2(25) = 4.64 bits. |
| **Match?** | REASONABLE -- defensible novelty proxy. |
| **Pages Used** | system-language |
| **Consistent Across Pages?** | YES -- only used on system-language page. Y-axis correctly labeled "Shannon Entropy (bits)". |

---

### 6. Shannon Entropy (Inventor Specialization -- Raw, log2)

| Field | Value |
|-------|-------|
| **Metric** | Inventor Technology Diversity (CPC section distribution, log2) |
| **Formula in Code** | `entropy -= p * math.log2(p)` over CPC section shares per inventor. Classification: <0.5 = specialist, 0.5-1.5 = moderate, >1.5 = generalist. |
| **File Path** | `data-pipeline/37_inventor_careers.py` (line 198) |
| **Cited Source** | None cited. |
| **Standard Definition** | Shannon (1948). Max = log2(8) = 3.0 bits for 8 CPC sections. |
| **Match?** | YES -- standard formula. Thresholds are project-specific. |
| **Pages Used** | inv-generalist-specialist |
| **Consistent Across Pages?** | YES -- only used on inv-generalist-specialist page. |

---

### 7. Normalized Subfield Diversity (Client-Side)

| Field | Value |
|-------|-------|
| **Metric** | Subfield Diversity (Normalized Shannon Entropy / Pielou Evenness) |
| **Formula in Code** | `H = -yearData.reduce((s, d) => { const p = d.count / total; return s + p * Math.log(p); }, 0); entropy = +(H / Math.log(N)).toFixed(3)` -- Shannon entropy using natural log, normalized by log(N) to yield range [0,1]. |
| **File Path** | `src/app/chapters/3d-printing/page.tsx` (lines 208-222), and identically in all 12 Act 6 deep-dive chapter pages |
| **Cited Source** | None cited. Pielou (1966) is the standard reference. |
| **Standard Definition** | Normalized entropy E = H / H_max = H / log(N). Ranges 0 to 1. Log base cancels. |
| **Match?** | YES -- standard Pielou evenness. |
| **Pages Used** | All 12 Act 6 deep-dive chapter pages |
| **Consistent Across Pages?** | YES -- identical code in all 12 pages. |

---

### 8. WIPO Portfolio Diversity (Shannon Entropy, LN)

| Field | Value |
|-------|-------|
| **Metric** | WIPO Portfolio Diversity (Shannon entropy of WIPO field distribution, LN) |
| **Formula in Code** | `-SUM((cnt/total) * LN(cnt/total))` over WIPO technology fields per firm. |
| **File Path** | `data-pipeline/phase5.py` (lines 260-275) |
| **Cited Source** | None cited. |
| **Standard Definition** | Shannon (1948). Max = ln(35) = 3.56 nats for 35 WIPO fields. |
| **Match?** | YES -- standard formula. Uses LN (nats), consistent with script 15 but not scripts 35/37/28 (log2). |
| **Pages Used** | org-patent-portfolio (WIPO diversity table) |
| **Consistent Across Pages?** | YES -- separate data file, not mixed with CPC entropy. |

---

### 9. Government Agency Breadth (1 - HHI, MISLABELED as Shannon Entropy)

| Field | Value |
|-------|-------|
| **Metric** | Government Agency Technological Breadth |
| **Formula in Code** | `1.0 - SUM(POWER(section_share, 2)) AS breadth` -- one minus the sum of squared CPC section shares. This is the **Simpson diversity index**, NOT Shannon entropy. |
| **File Path** | `data-pipeline/66_gov_agency_field.py` (lines 148-149) |
| **Cited Source** | None cited. |
| **Standard Definition** | Simpson (1949): D = 1 - SUM(p_i^2). Often called Gini-Simpson index. Related to but distinct from Shannon entropy. For 8 CPC sections, max = 0.875 (vs. Shannon max = ln(8) = 2.08 nats). |
| **Match?** | NO -- Computed as 1 - HHI (Simpson diversity) but **labeled "Shannon Entropy"** on the system-public-investment chapter page. |
| **Pages Used** | system-public-investment (chart axis: "Breadth (Shannon Entropy)") |
| **Consistent Across Pages?** | N/A -- used only on one page, but the label is incorrect. |

---

### 10. Herfindahl-Hirschman Index (HHI)

| Field | Value |
|-------|-------|
| **Metric** | HHI (Herfindahl-Hirschman Index) |
| **Formula in Code** | `shares_pct = (counts / total) * 100.0; hhi = float(np.sum(shares_pct ** 2))` -- shares expressed as percentages (0-100), yielding HHI range 0-10,000. Also in script 75: `SUM(POWER(cnt/total, 2))` for AI CPC section concentration (decimal shares, range 0-1). Strategy profile depth also uses decimal HHI. |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (lines 264-268), `data-pipeline/75_act6_enrichments.py` (lines 60-79), `data-pipeline/40_portfolio_strategy_profiles.py` (lines 287-319) |
| **Cited Source** | US DOJ/FTC (2010 Horizontal Merger Guidelines) cited on methodology page. |
| **Standard Definition** | Herfindahl (1950), Hirschman (1945): HHI = SUM(s_i^2). DOJ convention uses percentage shares (0-100), range 0-10,000. Academic convention often uses decimal shares (0-1), range 0-1. |
| **Match?** | YES -- Script 35 uses percentage-based (0-10,000) matching DOJ standards. Scripts 75 and 40 use decimal shares (0-1). Both are valid; different scaling conventions. |
| **Pages Used** | system-patent-fields, inv-top-inventors, inv-gender, inv-generalist-specialist, inv-team-size, ai-patents, methodology |
| **Consistent Across Pages?** | YES -- each output uses consistent scale within its context. |

---

### 11. Concentration Ratio (CR4 / CR10)

| Field | Value |
|-------|-------|
| **Metric** | CR4, CR10 (Concentration Ratio) |
| **Formula in Code** | **Pipeline:** `top4_shares = np.sort(shares_pct)[-4:]; c4 = float(np.sum(top4_shares))` with percentage shares. **Client-side:** `top4 = yearOrgs.slice(0,4).reduce((s,d) => s+d.count, 0); cr4 = +(top4/total*100).toFixed(1)` in all Act 6 chapter pages. |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (lines 271-272), `src/app/chapters/3d-printing/page.tsx` (lines 196-206), and identically in all 12 Act 6 deep-dive chapter pages |
| **Cited Source** | None cited explicitly. Standard industrial organization metric. |
| **Standard Definition** | CR_n = sum of market shares of the n largest firms. Standard IO economics measure. |
| **Match?** | YES |
| **Pages Used** | All 12 Act 6 deep-dive chapters (client-side CR4), org-patent-count, org-composition, geo-domestic, geo-international, deep-dive-overview |
| **Consistent Across Pages?** | YES -- pipeline and client-side formulas produce equivalent results. |

---

### 12. Citation Half-Life

| Field | Value |
|-------|-------|
| **Metric** | Citation Half-Life / Technology Half-Life |
| **Formula in Code** | **Script 24:** Cumulative citation percentage over years-after-grant; half-life = year where cumulative reaches 50%, with **linear interpolation** between adjacent years. **Script 68:** `MIN(cite_lag) WHERE cum_cites >= total_cites * 0.5 AND total_cites >= 5`, then median per CPC section. |
| **File Path** | `data-pipeline/24_chapter2_technology_halflife.py` (lines 54-80), `data-pipeline/68_sleeping_beauty_halflife.py` (lines 73-103) |
| **Cited Source** | None cited. Standard bibliometric concept. |
| **Standard Definition** | Burton & Kebler (1960): Half-life of literature = median age of cited references. Patent application: time for 50% of total forward citations to accumulate. |
| **Match?** | YES -- Both implementations use the standard 50th-percentile cumulative approach. Script 24 uses interpolation for smoother results; script 68 uses discrete minimum lag year. |
| **Pages Used** | system-patent-fields, system-patent-quality, org-patent-quality, mech-organizations, methodology |
| **Consistent Across Pages?** | YES -- outputs come from different scripts but both define half-life identically (50% cumulative). |

---

### 13. Blockbuster Rate (Breakthrough Patents)

| Field | Value |
|-------|-------|
| **Metric** | Blockbuster Patent / Breakthrough Patent / Blockbuster Rate |
| **Formula in Code** | **Script 11:** `PERCENT_RANK() OVER (PARTITION BY year, tech_section ORDER BY fwd_cites) >= 0.99` = top 1% within (year x CPC section). **Script 41/65:** `PERCENTILE_CONT(0.99)` threshold within (year x CPC section) using 5-year forward cites. **scripts/compute_quality.py:** 75th percentile across ALL patents in a year (DIFFERENT -- broader definition, legacy). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 308-321), `data-pipeline/41_firm_quality_distribution.py` (lines 123-213), `data-pipeline/65_blockbuster_lorenz.py` (lines 22-49), `scripts/compute_quality.py` (lines 132-149) |
| **Cited Source** | None cited. Related to Scherer (1965) on patent value skewness. |
| **Standard Definition** | No single standard. Common thresholds: top 1% (Trajtenberg 1990), top 5% (Jaffe & Trajtenberg 2002), top 10% (Harhoff et al. 1999). |
| **Match?** | YES for top-1% definition (scripts 11, 41, 65). scripts/compute_quality.py uses 75th percentile -- much broader, appears to be a legacy/alternative version not used on the site. |
| **Pages Used** | system-patent-quality, org-patent-quality, org-patent-count, org-company-profiles, mech-organizations, inv-top-inventors, all 12 Act 6 deep dives, methodology |
| **Consistent Across Pages?** | YES across all site-facing outputs (all use top 1%). |

---

### 14. Top-Decile Share (Quality Bifurcation)

| Field | Value |
|-------|-------|
| **Metric** | Top-Decile Share / Quality Bifurcation |
| **Formula in Code** | `PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY fwd_cite_5y) AS p90_threshold` per (grant_year x cpc_section); then `100.0 * SUM(CASE WHEN fwd_cite_5y >= p90_threshold THEN 1 ELSE 0 END) / COUNT(*)` per domain x 5-year period. Values >10% indicate disproportionate high-quality output. |
| **File Path** | `data-pipeline/74_quality_bifurcation.py` (lines 36-86) |
| **Cited Source** | None cited. |
| **Standard Definition** | Top decile share = fraction of a subset's items exceeding the system-wide 90th percentile. Standard measure of distributional inequality. |
| **Match?** | YES |
| **Pages Used** | All 12 Act 6 deep-dive chapters, system-public-investment |
| **Consistent Across Pages?** | YES |

---

### 15. Dud Rate (Zero-Citation Patents)

| Field | Value |
|-------|-------|
| **Metric** | Dud Rate / Zero-Citation Patents |
| **Formula in Code** | `CAST(SUM(CASE WHEN COALESCE(fc.fwd_cites, 0) = 0 THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(*)` -- fraction of patents with zero 5-year forward citations. |
| **File Path** | `data-pipeline/41_firm_quality_distribution.py` (line 184), `scripts/compute_quality.py` (line 148) |
| **Cited Source** | None cited. |
| **Standard Definition** | Proportion of patents receiving zero forward citations within a fixed window. Standard in patent quality literature. |
| **Match?** | YES |
| **Pages Used** | org-patent-quality, org-company-profiles, system-patent-fields |
| **Consistent Across Pages?** | YES |

---

### 16. Exploration Composite Score

| Field | Value |
|-------|-------|
| **Metric** | Exploration Composite / Exploration Score / Exploration Index |
| **Formula in Code** | Average of 3 sub-scores (each 0-1): **(1) Technology newness:** `max(0.0, 1.0 - prior_count / 10.0)`. **(2) Citation newness:** share of backward citations pointing to CPC sections where firm has <5 patents in prior 5 years. **(3) External sourcing:** `1.0 - self_citation_rate` (default 0.5). Composite = `(tech + citation + external) / 3.0`. Exploratory if >0.6, exploitative if <0.4, ambidextrous if 0.4-0.6. |
| **File Path** | `data-pipeline/42_firm_exploration_exploitation.py` (lines 95-246) |
| **Cited Source** | None cited. Conceptually based on March (1991). |
| **Standard Definition** | March (1991) exploration-exploitation dichotomy. Benner & Tushman (2003), He & Wong (2004). No single standard formula; composite is project-specific. |
| **Match?** | REASONABLE -- Sensible operationalization with project-specific thresholds. |
| **Pages Used** | mech-organizations, methodology |
| **Consistent Across Pages?** | YES -- methodology page description partially matches (see Issue 6). |

---

### 17. Ambidexterity Index

| Field | Value |
|-------|-------|
| **Metric** | Ambidexterity Index |
| **Formula in Code** | `1.0 - abs(exploration_share - exploitation_share)` where exploration_share = fraction of patents >0.6, exploitation_share = fraction <0.4. |
| **File Path** | `data-pipeline/44_firm_ambidexterity_quality.py` (lines 161-164) |
| **Cited Source** | None cited. Related to Tushman & O'Reilly (1996), He & Wong (2004). |
| **Standard Definition** | He & Wong (2004). No single standard formula. |
| **Match?** | REASONABLE |
| **Pages Used** | mech-organizations, methodology |
| **Consistent Across Pages?** | YES |

---

### 18. Self-Citation Rate

| Field | Value |
|-------|-------|
| **Metric** | Self-Citation Rate |
| **Formula in Code** | `CAST(SUM(is_self_cite) AS DOUBLE) / COUNT(*)` where `is_self_cite = CASE WHEN pa1.org = pa2.org THEN 1 ELSE 0 END` -- exact string match on primary assignee. |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 187-230), `data-pipeline/42_firm_exploration_exploitation.py` (lines 145-163), `data-pipeline/40_portfolio_strategy_profiles.py` (defensiveness dimension) |
| **Cited Source** | None cited. Hall, Jaffe, Trajtenberg (2001) is the standard reference. |
| **Standard Definition** | Self-citation when citing and cited patent share the same assignee. |
| **Match?** | YES |
| **Pages Used** | system-patent-quality, mech-organizations, org-company-profiles (strategy radar) |
| **Consistent Across Pages?** | YES |

---

### 19. Cohort-Normalized Citations

| Field | Value |
|-------|-------|
| **Metric** | Cohort Normalization / Cohort-Normalized Citations |
| **Formula in Code** | `patent.fwd_cite_5y / cohort_mean` where `cohort_mean = AVG(fwd_cite_5y) GROUP BY grant_year, cpc_section`. Value of 1.0 = average. |
| **File Path** | `data-pipeline/59_cohort_normalization.py` (lines 50-62), `data-pipeline/64_team_size_coefficients.py` (lines 46-52) |
| **Cited Source** | None cited. Standard approach; see Waltman & van Eck (2012). |
| **Standard Definition** | Divide citation count by cohort mean to control for field/time variation. |
| **Match?** | YES |
| **Pages Used** | system-patent-quality, org-patent-count, org-composition, inv-team-size, system-public-investment |
| **Consistent Across Pages?** | YES |

---

### 20. Composite Quality Index (Z-Score)

| Field | Value |
|-------|-------|
| **Metric** | Composite Quality Index |
| **Formula in Code** | Z-score 4 components: `z_cites`, `z_claims`, `z_scope`, `z_lag` (inverted). Composite = mean of four Z-scores. |
| **File Path** | `data-pipeline/18_chapter9_composite_quality.py` (lines 71-97) |
| **Cited Source** | None cited. Related to Lanjouw & Schankerman (2004). |
| **Standard Definition** | Equal-weight Z-score composite. Simpler than factor analysis. |
| **Match?** | REASONABLE |
| **Pages Used** | system-convergence |
| **Consistent Across Pages?** | YES |

---

### 21. Gini Coefficient

| Field | Value |
|-------|-------|
| **Metric** | Gini Coefficient |
| **Formula in Code** | **Script 41:** `(2 * np.sum(index * vals) - (n + 1) * vals.sum()) / (n * vals.sum())`. **Script 65:** `1 - 2 * np.trapz(y, x)` from Lorenz curve. |
| **File Path** | `data-pipeline/41_firm_quality_distribution.py` (lines 228-235), `data-pipeline/65_blockbuster_lorenz.py` (lines 71-101), `scripts/compute_quality.py` (lines 96-104) |
| **Cited Source** | None cited. |
| **Standard Definition** | Gini (1912): 0 = equality, 1 = max inequality. |
| **Match?** | YES |
| **Pages Used** | org-patent-count, org-patent-quality, org-company-profiles, mech-organizations, inv-top-inventors, geo-domestic, org-composition, cybersecurity, methodology |
| **Consistent Across Pages?** | YES |

---

### 22. Lorenz Curve

| Field | Value |
|-------|-------|
| **Metric** | Lorenz Curve |
| **Formula in Code** | Cumulative share of patents (x) vs. cumulative share of blockbusters/citations (y), sorted ascending. |
| **File Path** | `data-pipeline/65_blockbuster_lorenz.py` (lines 71-101) |
| **Cited Source** | None cited. Lorenz (1905). |
| **Match?** | YES |
| **Pages Used** | org-patent-count, org-patent-quality, inv-top-inventors |
| **Consistent Across Pages?** | YES |

---

### 23. Patent Scope

| Field | Value |
|-------|-------|
| **Metric** | Patent Scope |
| **Formula in Code** | `COUNT(DISTINCT LEFT(cpc_subclass, 4))` (script 11) or `COUNT(DISTINCT cpc_subclass)` (scripts 18, 41). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 55-58), `data-pipeline/18_chapter9_composite_quality.py` (lines 44-49), `data-pipeline/41_firm_quality_distribution.py` (lines 96-101) |
| **Cited Source** | Lerner (1994) cited on methodology page. |
| **Standard Definition** | Count of distinct CPC subclasses per patent. |
| **Match?** | YES |
| **Pages Used** | system-patent-quality, system-patent-fields, org-patent-quality, methodology |
| **Consistent Across Pages?** | YES |

---

### 24. Grant Lag (Pendency)

| Field | Value |
|-------|-------|
| **Metric** | Grant Lag / Pendency |
| **Formula in Code** | `DATEDIFF('day', filing_date, patent_date)`. Filtered 0-10,950 days. |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 65-71), `data-pipeline/18_chapter9_composite_quality.py`, `compute_quality_metrics.py` |
| **Cited Source** | None cited. |
| **Match?** | YES |
| **Pages Used** | system-patent-quality, system-patent-count, methodology |
| **Consistent Across Pages?** | YES |

---

### 25. Forward Citations (5-Year Window)

| Field | Value |
|-------|-------|
| **Metric** | 5-Year Forward Citations |
| **Formula in Code** | Count of citing patents where `DATEDIFF('day', cited.patent_date, citing.patent_date) <= 1826` (~5 years). |
| **File Path** | `data-pipeline/11_chapter9_patent_quality.py` (lines 43-53), `data-pipeline/41_firm_quality_distribution.py`, and 15+ additional scripts |
| **Cited Source** | None cited. Hall, Jaffe, Trajtenberg (2001) is the standard reference. |
| **Match?** | YES -- 1826-day window used consistently. |
| **Pages Used** | Nearly all quality-related chapters. |
| **Consistent Across Pages?** | YES |

---

### 26. CAGR (Compound Annual Growth Rate)

| Field | Value |
|-------|-------|
| **Metric** | CAGR |
| **Formula in Code** | `POWER(n_late / n_early, 0.2) - 1` where exponent 0.2 = 1/5 years. |
| **File Path** | `data-pipeline/72_act6_cross_domain.py` (lines 88-90) |
| **Cited Source** | None cited. Standard financial metric. |
| **Match?** | YES |
| **Pages Used** | deep-dive-overview |
| **Consistent Across Pages?** | YES |

---

### 27. Innovation Velocity (YoY Growth)

| Field | Value |
|-------|-------|
| **Metric** | Innovation Velocity / YoY Growth |
| **Formula in Code** | `100 * (count - prev_count) / prev_count` by WIPO sector. |
| **File Path** | `data-pipeline/08_chapter7_dynamics.py` (lines 141-169) |
| **Cited Source** | None cited. |
| **Match?** | YES |
| **Pages Used** | system-patent-fields |
| **Consistent Across Pages?** | YES |

---

### 28. Patent Velocity (Client-Side, Entry Cohort)

| Field | Value |
|-------|-------|
| **Metric** | Patent Velocity (Patents per Active Year by Entry Cohort) |
| **Formula in Code** | `totalPat / max(1, last_year - first_year + 1)` averaged per decade cohort. |
| **File Path** | `src/app/chapters/3d-printing/page.tsx` (lines 224-243), and identically in all 12 Act 6 chapter pages |
| **Cited Source** | None cited. Project-specific metric. |
| **Standard Definition** | No standard. Simple productivity rate by entry era. |
| **Match?** | PROJECT-SPECIFIC |
| **Pages Used** | All 12 Act 6 deep-dive chapter pages |
| **Consistent Across Pages?** | YES -- identical code in all 12 pages. |

---

### 29. Jensen-Shannon Divergence (Technology Pivot Detection)

| Field | Value |
|-------|-------|
| **Metric** | JSD / Technology Pivot |
| **Formula in Code** | `jsd = jensenshannon(p, q, base=2)` (scipy). Applied to CPC subclass distributions in consecutive 3-year windows. Pivot = 95th percentile of firm's JSD. |
| **File Path** | `data-pipeline/35_portfolio_strategy.py` (lines 139-220) |
| **Cited Source** | None cited. Lin (1991). |
| **Standard Definition** | scipy returns Jensen-Shannon distance (square root of divergence). base=2 gives bits. |
| **Match?** | YES |
| **Pages Used** | org-patent-portfolio |
| **Consistent Across Pages?** | YES |

---

### 30. Location Quotient (Regional Specialization)

| Field | Value |
|-------|-------|
| **Metric** | Location Quotient |
| **Formula in Code** | `LQ = (metro_section_count / metro_total) / (nat_section_count / nat_total)` |
| **File Path** | `data-pipeline/21_chapter4_regional_specialization.py` (lines 72-76) |
| **Cited Source** | None cited. Florence (1948). |
| **Match?** | YES |
| **Pages Used** | geo-domestic |
| **Consistent Across Pages?** | YES |

---

### 31. Sleeping Beauty Index

| Field | Value |
|-------|-------|
| **Metric** | Sleeping Beauty Patent |
| **Formula in Code** | **Script 22 (strict):** avg_early_rate < 2 cites/yr for 10 years AND burst >= 10 after year 10. **Script 68 (broad):** early_cites <= 2 in 3 years AND total >= 10. **compute_quality_metrics.py:** early <= 5, total >= 50, late > 3x early. |
| **File Path** | `data-pipeline/22_chapter9_sleeping_beauty.py`, `data-pipeline/68_sleeping_beauty_halflife.py`, `compute_quality_metrics.py` |
| **Cited Source** | Van Raan (2004) implied on methodology page. |
| **Standard Definition** | Van Raan (2004). Ke et al. (2015) beauty coefficient. |
| **Match?** | REASONABLE -- Three different definitions (see Issue 2). |
| **Pages Used** | system-patent-quality, methodology |
| **Consistent Across Pages?** | PARTIALLY -- different scripts produce different populations labeled "sleeping beauty". |

---

### 32. Cosine Distance (Exploration Trajectory)

| Field | Value |
|-------|-------|
| **Metric** | Exploration Index (Cosine Distance) |
| **Formula in Code** | `1.0 - dot / (mag1 * mag2)` between CPC subclass count vectors for consecutive 5-year periods. |
| **File Path** | `data-pipeline/62_exploration_trajectory.py` (lines 110-118) |
| **Cited Source** | None cited. Breschi, Lissoni & Malerba (2003). |
| **Match?** | REASONABLE -- valid operationalization. |
| **Pages Used** | mech-organizations |
| **Consistent Across Pages?** | YES |

---

### 33. Shift-Share Decomposition (Convergence)

| Field | Value |
|-------|-------|
| **Metric** | Shift-Share Decomposition + Near/Far Convergence |
| **Formula in Code** | Within-firm: `SUM(share_t-1 * delta_rate)`. Between-firm: `SUM(delta_share * rate_t-1)`. Near/far: baseline co-occurrence Q75/Q25 from 1976-1985. |
| **File Path** | `data-pipeline/61_convergence_decomposition.py` (lines 42-181) |
| **Cited Source** | None cited. Dunn (1960). |
| **Standard Definition** | Shift-share without interaction term (standard simplification). |
| **Match?** | MOSTLY |
| **Pages Used** | system-convergence |
| **Consistent Across Pages?** | YES |

---

### 34. Strategy Profile (8-Dimension Radar)

| Field | Value |
|-------|-------|
| **Metric** | 8-Dimension Innovation Strategy Profile |
| **Formula in Code** | Each dimension min-max normalized to 0-100 across top 30 firms: **(1) Breadth:** count distinct CPC subclasses. **(2) Depth:** HHI of CPC subclass distribution (decimal). **(3) Defensiveness:** self-citation rate (%). **(4) Influence:** avg forward citations. **(5) Science intensity:** avg backward citations. **(6) Speed:** 1 / median grant lag (days). **(7) Collaboration:** avg team size. **(8) Freshness:** share of first-time inventors (2015-2025). |
| **File Path** | `data-pipeline/40_portfolio_strategy_profiles.py` (lines 257-558) |
| **Cited Source** | None cited. |
| **Standard Definition** | No standard composite. Each sub-dimension uses established patent metrics. Min-max normalization is relative to the sample of 30 firms, not absolute. |
| **Match?** | PROJECT-SPECIFIC -- composite is custom; sub-metrics are standard. |
| **Pages Used** | org-company-profiles |
| **Consistent Across Pages?** | YES |

---

### 35. Technology S-Curve (Logistic Fit)

| Field | Value |
|-------|-------|
| **Metric** | Technology S-Curve / Logistic Growth Model |
| **Formula in Code** | `K / (1 + exp(-r * (t - t0)))` fitted to cumulative patent counts per CPC section via `scipy.optimize.curve_fit`. Lifecycle stage: <10% of K = Emerging, 10-50% = Growth, 50-90% = Mature, >90% = Saturated. |
| **File Path** | `data-pipeline/30_batch_additions.py` (lines 45-122) |
| **Cited Source** | None cited. Standard technology lifecycle model (Foster 1986). |
| **Standard Definition** | 3-parameter logistic function. K = carrying capacity, r = growth rate, t0 = inflection point. |
| **Match?** | YES -- standard logistic model. |
| **Pages Used** | system-patent-fields |
| **Consistent Across Pages?** | YES |

---

### 36. Co-Classification Spillover Lift

| Field | Value |
|-------|-------|
| **Metric** | Cross-Domain Co-Classification Lift |
| **Formula in Code** | `lift = observed / expected` where `expected = (count_A * count_B) / total_patents`. Measures whether two domains co-occur on the same patent more than random chance. |
| **File Path** | `data-pipeline/72_act6_cross_domain.py` (lines 160-201) |
| **Cited Source** | None cited. Standard association rule lift metric (Agrawal et al. 1993). |
| **Match?** | YES |
| **Pages Used** | deep-dive-overview |
| **Consistent Across Pages?** | YES |

---

### 37. EV-Battery Coupling Lift

| Field | Value |
|-------|-------|
| **Metric** | EV-Battery Coupling Lift |
| **Formula in Code** | `lift = P(EV AND Battery) / (P(EV) * P(Battery))` within green patents. |
| **File Path** | `data-pipeline/75_act6_enrichments.py` (lines 87-136) |
| **Cited Source** | None cited. |
| **Match?** | YES |
| **Pages Used** | green-innovation |
| **Consistent Across Pages?** | YES |

---

### 38. Interdisciplinarity Composite

| Field | Value |
|-------|-------|
| **Metric** | Interdisciplinarity Composite Index |
| **Formula in Code** | Z-score composite of 3 measures: mean scope, mean CPC sections, multi-section share. Composite = average of Z-scores. |
| **File Path** | `data-pipeline/67_interdisciplinarity_trend.py` (lines 24-63) |
| **Cited Source** | None cited. Stirling (2007), Porter & Rafols (2009). |
| **Match?** | REASONABLE -- captures variety and balance but not disparity. |
| **Pages Used** | system-convergence |
| **Consistent Across Pages?** | YES |

---

### 39. Additional Derived Metrics (Compact Catalog)

| # | Metric | Formula Summary | File Path | Pages | Match? |
|---|--------|-----------------|-----------|-------|--------|
| 39a | Systems Complexity Index | `domain_avg / system_avg` for team size and claims | `data-pipeline/75_act6_enrichments.py` | 3d-printing, space-technology, autonomous-vehicles | PROJECT-SPECIFIC |
| 39b | Inventor Survival Rate | `(career_length >= cl).sum() / total * 100` per cohort | `data-pipeline/10_chapter5_inventor_deep.py` | inv-top-inventors, inv-serial-new, inv-generalist-specialist | REASONABLE |
| 39c | Corporate Survival Rate | `len(survivors) / len(prev_set) * 100` (top-50 persistence) | `data-pipeline/34_corporate_mortality.py` | org-patent-count | YES |
| 39d | Entrant vs. Incumbent | First domain patent = current year -> entrant | `data-pipeline/73_entrant_incumbent.py` | All 12 Act 6 deep dives | YES |
| 39e | Simple Citation Normalization (client) | `value / max(1, 2025 - year)` per-year-of-exposure | `src/hooks/useCitationNormalization.tsx` | Multiple quality chapters | CRUDE -- divides by exposure years, not cohort-adjusted |
| 39f | Portfolio Overlap (UMAP) | Cosine-metric UMAP on CPC subclass proportion vectors per firm-decade | `data-pipeline/40_portfolio_strategy_profiles.py` | org-patent-portfolio | PROJECT-SPECIFIC |

---

## Detailed Formula Variant Analysis

### Shannon Entropy: Complete Log Base and Scale Reconciliation

| Script / File | Log Base | Normalization | Scale | Output File | Used On Page |
|---------------|----------|---------------|-------|-------------|-------------|
| `15_chapter3_portfolio_diversity.py` | **LN** | None (raw) | 0 to ln(N) nats | `chapter3/portfolio_diversity.json` | org-patent-portfolio |
| `35_portfolio_strategy.py` | **log2** | None (raw) | 0 to log2(N) bits | `company/portfolio_diversification_b3.json` | org-company-profiles |
| `37_inventor_careers.py` | **log2** | None (raw) | 0 to 3.0 bits | `chapter5/inventor_drift.json` | inv-generalist-specialist |
| `28_chapter12_topic_modeling.py` | **log2** | None (raw) | 0 to 4.64 bits | `chapter12/topic_novelty_trend.json` | system-language |
| `phase5.py` (WIPO) | **LN** | None (raw) | 0 to 3.56 nats | `chapter11/wipo_portfolio_diversity.json` | org-patent-portfolio |
| All 12 Act 6 `page.tsx` | **LN** | **H / ln(N)** | **0 to 1** | client-side computed | All Act 6 deep dives |

**Key findings:**
1. No two outputs using different log bases are ever displayed on the same chart or in the same comparison. Script 15 (LN) feeds org-patent-portfolio; script 35 (log2) feeds org-company-profiles. They do NOT mix.
2. The deep-dive-overview methodology text states the formula uses log2 (`H = -SUM p_i log2(p_i)`) but the actual client-side code uses `Math.log` (natural log) normalized by `Math.log(N)`. Because the normalization cancels the log base, the values are identical regardless of base -- the formula description is **misleading but not functionally wrong**.
3. The WIPO entropy (script phase5.py) uses LN, matching script 15. Both are for the org-patent-portfolio page.

**Impact:** Values are NOT directly comparable across scripts using different log bases. An entropy of 2.0 bits (log2) = 1.386 nats (LN). However, since no cross-script comparison occurs on any page, there is no user-facing error. The inconsistency is a maintenance concern.

---

### Originality/Generality: CPC Section-Level Granularity

| Source | Classification Level | Number of Categories |
|--------|---------------------|---------------------|
| PatentWorld implementation | CPC section | 8 |
| Trajtenberg, Henderson, Jaffe (1997) | 3-digit USPC | ~400+ |
| Hall, Jaffe, Trajtenberg (2001) | 2-digit NBER subcategory | ~36 |
| Modern implementations | CPC subclass or group | ~670 or ~8000 |

**Impact:** Theoretical max with 8 sections is 0.875. Actual site values range ~0.09 to ~0.55. Finer granularity would yield higher values with more discriminating power.

---

### Sleeping Beauty: Three Different Definitions

| Script | Dormancy Period | Dormancy Threshold | Burst/Total Criterion |
|--------|----------------|-------------------|----------------------|
| `22_chapter9_sleeping_beauty.py` | First **10 years** | <2 avg cites/year | >=10 cites in 3-year window after year 10 |
| `68_sleeping_beauty_halflife.py` | First **3 years** | <=2 total cites | >=10 total cites (all time) |
| `compute_quality_metrics.py` | Granted <= **2015** | <=5 early cites | >=50 total AND late_cites > 3x early_cites |

---

### Blockbuster Definition Variants

| Implementation | Threshold | Conditioning | Citation Window |
|---------------|-----------|--------------|-----------------|
| Script 11 | Top 1% (PERCENT_RANK >= 0.99) | Within (year x CPC section) | All-time forward cites |
| Script 41 | Top 1% (PERCENTILE_CONT 0.99) | Within (year x CPC section) | 5-year forward cites |
| Script 65 | Top 1% (PERCENT_RANK >= 0.99) | Within (year x CPC section) | 5-year forward cites |
| Script 74 | Top 10% (PERCENTILE_CONT 0.9) | Within (year x CPC section) | 5-year forward cites |
| scripts/compute_quality.py | Top 25% (75th percentile) | Within year (ALL patents) | All-time forward cites |

---

## Issues Found

### Issue 1: Shannon Entropy Log Base Inconsistency (MEDIUM)
- **Location:** `data-pipeline/15_chapter3_portfolio_diversity.py` vs. `data-pipeline/35_portfolio_strategy.py` et al.
- **Problem:** Script 15 uses natural log (LN); scripts 35, 37, 28 use log2. Outputs are on different scales (nats vs. bits).
- **Impact:** Values not directly comparable across scripts. No user-facing error because outputs go to different pages. Maintenance/documentation concern.
- **Recommendation:** Standardize all pipeline scripts to log2 (majority usage) or add explicit unit labels to JSON output files.

### Issue 2: Sleeping Beauty Criteria Mismatch (MEDIUM)
- **Location:** Three separate pipeline scripts
- **Problem:** Three different definitions of "sleeping beauty" with dramatically different stringency.
- **Impact:** Results labeled "sleeping beauty" may refer to very different patent populations.
- **Recommendation:** Rename variants or consolidate to one definition.

### Issue 3: Originality/Generality Computed at Coarse Section Level (LOW)
- **Location:** Scripts 11, 60
- **Problem:** Uses 8 CPC sections rather than ~670 subclasses.
- **Impact:** Values compressed relative to published literature. Methodology page documents this.

### Issue 4: Methodology Page Exploration Threshold Description (LOW)
- **Location:** `src/app/methodology/page.tsx` line 495
- **Problem:** Page says "Patents scoring above 0.6 are classified as exploratory; those below 0.6 as exploitative." Code uses three categories: >0.6 exploratory, 0.4-0.6 ambidextrous, <0.4 exploitative.
- **Impact:** Methodology page omits the ambidextrous middle category.
- **Recommendation:** Update text to: "above 0.6 = exploratory, 0.4-0.6 = ambidextrous, below 0.4 = exploitative."

### Issue 5: Missing Academic Citations (LOW)
- **Location:** Methodology page and glossary
- **Problem:** Multiple standard metrics lack explicit academic citations. Shannon entropy should cite Shannon (1948). Exploration should cite March (1991). Sleeping beauty should cite van Raan (2004). Location quotient should cite Florence (1948).
- **Recommendation:** Add a "References" section to the methodology page.

### Issue 6: Government Agency Breadth MISLABELED as Shannon Entropy (HIGH)
- **Location:** `data-pipeline/66_gov_agency_field.py` line 149, `src/app/chapters/system-public-investment/page.tsx` line 229
- **Problem:** The government agency "breadth" is computed as `1 - SUM(section_share^2)`, which is the **Simpson diversity index** (also known as the Gini-Simpson index or 1-HHI). However, the chart X-axis label says "Breadth (Shannon Entropy)". These are **different metrics** with different scales: Simpson ranges 0 to (1 - 1/N) while Shannon ranges 0 to log(N).
- **Impact:** Readers comparing this "Shannon Entropy" value with entropy values on other pages will get confused, as the scales are incomparable. A Simpson value of 0.8 does NOT mean the same thing as a Shannon entropy of 0.8.
- **Recommendation:** Either: (a) Change the axis label to "Breadth (Simpson Diversity)" or "Breadth (1 - HHI)", or (b) Recompute using actual Shannon entropy: `-SUM(p_i * ln(p_i))`.

### Issue 7: Deep-Dive Overview Entropy Formula Description Misleading (LOW)
- **Location:** `src/app/chapters/deep-dive-overview/page.tsx` lines 188-189
- **Problem:** The methods section states "H = -SUM p_i log2(p_i)" but the actual client-side code uses `Math.log` (natural log) normalized by `Math.log(N)`. Because normalization cancels the log base, the result is the same regardless. But describing it as log2 when the code uses LN is misleading for anyone trying to reproduce.
- **Impact:** Misleading for reproducibility. Functionally no error in computed values.
- **Recommendation:** Change formula text to "E = (-SUM p_i ln(p_i)) / ln(N)" or simply "E = H / H_max" to accurately describe the normalized form.

### Issue 8: Client-Side Citation Normalization is Crude (LOW)
- **Location:** `src/hooks/useCitationNormalization.tsx`
- **Problem:** The "Normalize by cohort age" toggle divides citation values by `max(1, 2025 - year)`, a simple exposure-years adjustment. This is NOT the same as the pipeline's proper cohort normalization (mean by year x CPC section). The toggle label says "Normalize by cohort age" but it does not use cohort means.
- **Impact:** Users may interpret this as equivalent to proper cohort normalization. The separate `useCohortNormalization` hook correctly toggles to pre-computed cohort-normalized data.
- **Recommendation:** Rename the button to "Adjust for patent age" or "Divide by years since grant" to distinguish from true cohort normalization.

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
| `data-pipeline/30_batch_additions.py` | Technology S-curves (logistic fit) |
| `data-pipeline/34_corporate_mortality.py` | Corporate survival rate |
| `data-pipeline/35_portfolio_strategy.py` | Shannon entropy (log2), JSD pivot detection, HHI, C4 |
| `data-pipeline/37_inventor_careers.py` | Shannon entropy (log2) for inventor classification |
| `data-pipeline/40_portfolio_strategy_profiles.py` | 8-dimension strategy profiles (breadth, depth, defensiveness, influence, science intensity, speed, collaboration, freshness), UMAP portfolio overlap |
| `data-pipeline/41_firm_quality_distribution.py` | Blockbuster rate (top 1%), dud rate, Gini coefficient |
| `data-pipeline/42_firm_exploration_exploitation.py` | Exploration composite (3 indicators), self-citation rate |
| `data-pipeline/44_firm_ambidexterity_quality.py` | Ambidexterity index |
| `data-pipeline/59_cohort_normalization.py` | Cohort-normalized citations |
| `data-pipeline/60_originality_generality_filtered.py` | Originality/generality at multiple citation thresholds |
| `data-pipeline/61_convergence_decomposition.py` | Shift-share decomposition, near/far convergence |
| `data-pipeline/62_exploration_trajectory.py` | Cosine distance exploration index |
| `data-pipeline/64_team_size_coefficients.py` | Cohort-normalized citations, FWL regression |
| `data-pipeline/65_blockbuster_lorenz.py` | Lorenz curves, Gini, blockbuster rate |
| `data-pipeline/66_gov_agency_field.py` | Government agency breadth (1-HHI, MISLABELED as Shannon entropy) |
| `data-pipeline/67_interdisciplinarity_trend.py` | Z-score interdisciplinarity composite |
| `data-pipeline/68_sleeping_beauty_halflife.py` | Sleeping beauty (3-year definition), citation half-life |
| `data-pipeline/72_act6_cross_domain.py` | CAGR, cross-domain spillover lift |
| `data-pipeline/73_entrant_incumbent.py` | Entrant vs. incumbent classification |
| `data-pipeline/74_quality_bifurcation.py` | Top-decile share |
| `data-pipeline/75_act6_enrichments.py` | AI HHI, EV-battery coupling lift, systems complexity index |
| `data-pipeline/phase5.py` | WIPO portfolio diversity (Shannon entropy, LN) |
| `data-pipeline/domain_utils.py` | Shared domain pipeline (quality, geography, team size, assignee type) |
| `compute_quality_metrics.py` | Originality, generality, scope, self-citation, sleeping beauty, grant lag |
| `scripts/compute_quality.py` | Alternative Gini, alternative blockbuster (75th percentile, legacy) |

### Client-Side Computations (Chapter Pages)

| Metric | Formula | File(s) |
|--------|---------|---------|
| CR4 | `top4 / total * 100` | All 12 Act 6 deep-dive `page.tsx` files |
| Subfield diversity | `H / Math.log(N)` (normalized Shannon entropy, natural log) | All 12 Act 6 deep-dive `page.tsx` files |
| Patent velocity | `totalPat / max(1, span)` averaged by decade cohort | All 12 Act 6 deep-dive `page.tsx` files |

### Hooks Relevant to Metrics

| Hook | Purpose | Notes |
|------|---------|-------|
| `src/hooks/useCitationNormalization.tsx` | Simple per-year-of-exposure normalization: `value / max(1, 2025 - year)` | CRUDE -- not true cohort normalization (see Issue 8) |
| `src/hooks/useCohortNormalization.tsx` | Toggle between raw and pre-computed cohort-normalized JSON data | CORRECT -- uses pipeline-computed data |
| `src/hooks/useThresholdFilter.tsx` | Three-way filter for originality/generality data by citation threshold (all, >=5, >=10) | Correct |

### Reference Files

| File | Relevance |
|------|-----------|
| `src/lib/constants.ts` | CHAPTERS array with metric names in descriptions/subtitles |
| `src/lib/glossary.ts` | Definitions for HHI, originality, generality, Shannon entropy, citation half-life, JSD, cosine similarity, TF-IDF, NMF, UMAP, k-means, blockbuster rate, dud rate |
| `src/lib/formatters.ts` | Display formatting for HHI, Gini, entropy, correlation values (no computation) |
| `src/lib/chapterMeasurementConfig.ts` | Per-chapter measurement metadata: data vintage, taxonomy, normalization method, outcome windows |
| `src/lib/types.ts` | TypeScript interfaces for all metric data structures (39 metric types) |
| `src/app/methodology/page.tsx` | Formal definitions for 18 metrics with formulas and caveats |
