# Track C1: Derived Metrics Verification

**Auditor:** Claude Opus 4.6
**Date:** 2026-02-20
**Scope:** Originality, Generality, Shannon Entropy, HHI/Concentration, Blockbuster Rate, Gender Inference, NLP/Topic Modeling

---

## 1. Originality & Generality

### Academic Definitions

- **Originality** (Trajtenberg, Henderson, Jaffe 1997): `1 - HHI` of the distribution of backward citations across technology classes. A patent citing prior art from many different technology classes is more "original."
- **Generality** (Hall, Jaffe, Trajtenberg 2001): `1 - HHI` of the distribution of forward citations across technology classes. A patent cited by subsequent patents in many different classes has broader applicability.

### Implementation in Code

**Primary script:** `data-pipeline/60_originality_generality_filtered.py` (lines 42-98)
**Earlier script:** `data-pipeline/11_chapter9_patent_quality.py` (lines 108-185)

Both scripts implement identical logic:

```sql
-- Originality (backward citations)
LEFT(cpc.cpc_section, 1) AS section     -- CPC SECTION level (A-H)
cpc.cpc_sequence = 0                     -- Primary classification only for cited patent
SUM(POWER(CAST(cnt AS DOUBLE) / total, 2)) AS hhi   -- Herfindahl formula
WHERE total >= 2                         -- Require at least 2 backward citations
1.0 - bh.hhi                           -- Originality = 1 - HHI

-- Generality (forward citations)
Same formula but on forward citation CPC section distribution
WHERE total >= 2                         -- Require at least 2 forward citations
WHERE py.year <= 2020                   -- Generality truncated to avoid citation window bias
```

### Formula Comparison: Code vs. Literature

| Aspect | Literature | Code | Match? |
|--------|-----------|------|--------|
| Formula | `1 - SUM(s_i^2)` | `1 - SUM(POWER(cnt/total, 2))` | YES |
| Classification level | Varies (NBER categories, IPC subclasses) | CPC section (A-H, 8 categories) | ACCEPTABLE but COARSE |
| Minimum citations | Typically 2+ | `total >= 2` | YES |
| Denominator | Total citations in class distribution | `SUM(cnt) OVER (PARTITION BY patent_id)` | YES -- correct window function |
| Forward citation truncation | Required | Generality limited to year <= 2020 | YES |

### Issues Found

1. **COARSE CLASSIFICATION LEVEL (MINOR):** The code uses CPC *section* (8 categories: A-H) rather than CPC subclass (~670 categories) or CPC group. The original Trajtenberg/Henderson/Jaffe papers used NBER technology sub-categories (36 categories). Using only 8 sections means:
   - Maximum possible originality/generality value = `1 - 1/8 = 0.875` (if perfectly even across all 8 sections)
   - Most patents will have low values because 8 bins is coarse
   - The methodology page says "CPC sections" which matches the code
   - System-wide averages (0.09 to 0.25 for originality) are consistent with using coarse sections

2. **CPC SEQUENCE = 0 FOR CITED PATENTS (ACCEPTABLE):** The code joins citations to the *primary* CPC classification (`cpc_sequence = 0`) of the cited/citing patent. This is a reasonable simplification -- each cited patent contributes one section. The original papers used all classifications.

3. **NO HALL-JAFFE-TRAJTENBERG CORRECTION (MINOR):** Hall, Jaffe & Trajtenberg (2001) proposed a bias correction for small-sample HHI: `HHI_corrected = (n/(n-1)) * HHI - 1/(n-1)` for patents with few citations. The code does not apply this correction. The `total >= 2` filter partially mitigates this, but for patents with exactly 2-3 citations, the uncorrected HHI has an upward bias. This means originality/generality are slightly *understated* for patents with few citations.

### Disclosure Status

- **Methodology page** (`src/app/methodology/page.tsx`, lines 447-458): Correctly describes originality as `1 - SUM(s_i^2)` where `s_i` is share of backward citations in CPC section *i*. Accurately says "CPC section." Does NOT mention the HJT small-sample correction is omitted.
- **Chapter page** (`src/app/chapters/system-patent-quality/page.tsx`, lines 503-510): Correctly references Trajtenberg, Henderson, and Jaffe (1997). Correctly describes what originality and generality measure.
- **Data note** (line 835): "Originality and generality use the Herfindahl-based measures of Trajtenberg, Henderson, and Jaffe (1997)." -- Accurate.

### Verdict: PASS with minor notes
The implementation faithfully reproduces the standard 1-HHI formula. The coarse CPC-section level is a defensible choice disclosed in the methodology. The omission of the HJT small-sample correction is standard in applied work but should be noted.

---

## 2. Shannon Entropy

### Implementations Found

There are **four distinct implementations** using different logarithm bases:

| Script | Context | Log Base | Normalized? |
|--------|---------|----------|-------------|
| `28_chapter12_topic_modeling.py` (line 297) | Topic novelty | `log2` (bits) | NO |
| `35_portfolio_strategy.py` (line 95) | Portfolio diversification | `log2` (bits) | NO |
| `37_inventor_careers.py` (line 198) | Generalist/specialist classification | `log2` (bits) | NO |
| `15_chapter3_portfolio_diversity.py` (line 80) | Portfolio diversity | `LN` (nats) | NO |
| `phase5.py` (line 264) | WIPO portfolio diversity | `LN` (nats) | NO |

### Formula Details

**Topic novelty (script 28):**
```python
# Normalize W to probability distributions per patent
W_prob = W / W_sum
# Shannon entropy: -sum(p * log2(p)) where p > 0
entropy[mask] -= W_prob[mask, i] * np.log2(W_prob[mask, i])
```

**Portfolio diversification (script 35):**
```python
probs = counts / total
entropy = -np.sum(probs * np.log2(probs))
```

**Portfolio diversity (script 15, SQL):**
```sql
ROUND(-SUM(share * LN(share)), 3) AS shannon_entropy
```

### Issues Found

1. **INCONSISTENT LOG BASE (MEDIUM):** Two scripts use `log2` (topic modeling, portfolio strategy, inventor careers) while two scripts use natural log `LN` (portfolio diversity, WIPO diversity). This means entropy values across these different analyses are NOT directly comparable:
   - `H_log2 = H_ln / ln(2)` (values in bits are ~1.44x values in nats)
   - If a user compares portfolio diversity from chapter 3 (nats) with portfolio diversification from the company profiles (bits), they would get different scales

2. **NO NORMALIZATION (MINOR):** The methodology page states: "Often reported as *normalized entropy* (H / ln N), which scales the result to a 0-1 range." However, NONE of the implementations actually normalize. Raw entropy depends on the number of categories, making cross-context comparisons less interpretable. For topic modeling (25 topics), max entropy = log2(25) = 4.64 bits. For CPC sections (8 categories), max entropy = log2(8) = 3.0 bits.

3. **METHODOLOGY PAGE DISCREPANCY (MINOR):** The methodology page (line 469) says: `H = -SUM(p_i * ln(p_i))` using natural log. But the topic modeling implementation and most Python implementations use `log2`. The chapter page (system-language) labels the Y-axis as "Shannon Entropy (bits)" which implies log2 -- this is correct for the topic modeling script but inconsistent with the methodology page formula.

### Disclosure Status

- **Methodology page** (line 469): States `ln(p_i)` (natural log) formula. Mentions normalized entropy as an option. Does not specify which log base is used in practice.
- **Chapter page** (system-language, line 419): Y-axis labeled "Shannon Entropy (bits)" -- correct for log2.
- **DataNote** (system-language, line 501): "Novelty is measured as Shannon entropy of the NMF topic weight vector." -- Correct.

### Verdict: PASS with noted inconsistencies
The entropy formula is mathematically correct in all implementations. The mixed use of log2 vs. ln across scripts is a minor inconsistency that does not affect within-analysis correctness, but cross-analysis comparisons of raw entropy values would be misleading. The methodology page formula (ln) does not match the most prominent implementation (log2 in topic modeling).

---

## 3. HHI / Concentration

### Implementations Found

| Script | Context | Share Basis | Scale |
|--------|---------|-------------|-------|
| `14_chapter10_patent_law.py` (line 67) | Assignee concentration by CPC section | Percentage (0-100) | 0-10,000 |
| `35_portfolio_strategy.py` (line 268) | Patent concentration by section/year | Percentage (0-100) | 0-10,000 |
| `02_chapter2_technology.py` (line 138) | Tech diversity (1-HHI) | Fraction (0-1) | 0-1 |
| `60_originality_generality_filtered.py` | Originality/Generality | Fraction (0-1) | 0-1 |

### Formula Details

**Patent law HHI (script 14):**
```sql
SUM(POWER(100.0 * pso.patents / pst.total_patents, 2)) AS hhi
-- Shares as percentages: HHI ranges 0-10,000
```

**Portfolio strategy HHI (script 35):**
```python
shares_pct = (counts / total) * 100.0
hhi = float(np.sum(shares_pct ** 2))
# Shares as percentages: HHI ranges 0-10,000
```

**Tech diversity HHI (script 02):**
```sql
SUM(POWER(sc.cnt * 1.0 / yt.total, 2)) AS hhi
-- Shares as fractions: HHI ranges 0-1
```

**Concentration ratios (script 35):**
```python
# C4 = sum of top 4 shares (as percentage)
top4_shares = np.sort(shares_pct)[-4:]
c4 = float(np.sum(top4_shares))
```

### Issues Found

1. **DUAL SCALE CONVENTION (MINOR):** HHI is computed on two different scales depending on context:
   - Market concentration analyses (scripts 14, 35): HHI on 0-10,000 scale (DOJ/FTC standard)
   - Diversity indices (scripts 02, 60): HHI on 0-1 scale (fraction-based)
   - This is actually standard practice -- market concentration uses 0-10,000, diversity indices use 0-1

2. **CR4 vs. HHI CORRECTLY DISTINGUISHED:** The code correctly implements CR4 as the sum of the top 4 shares (a concentration ratio), distinct from HHI (sum of ALL squared shares). The methodology page (line 477) correctly defines "CR4 is the combined patent share of the four largest organizations."

### Disclosure Status

- **Methodology page** (lines 461-466): Correctly defines HHI with the 10,000 multiplier: `HHI = SUM(s_i^2) x 10,000`. References DOJ/FTC thresholds (unconcentrated < 1,500, moderate 1,500-2,500, highly concentrated > 2,500).
- The methodology page formula uses `x 10,000` which matches the market concentration implementations (scripts 14, 35). The diversity-index implementations (scripts 02, 60) use 0-1 scale and compute `1 - HHI` for diversity. This is a standard dual convention.

### Verdict: PASS
HHI and CR4 are correctly implemented. The dual-scale convention (0-10,000 for market concentration, 0-1 for diversity indices) is standard and appropriate for the respective contexts.

---

## 4. Blockbuster Rate

### Implementations Found

| Script | Definition | Threshold | Cohort |
|--------|-----------|-----------|--------|
| `11_chapter9_patent_quality.py` (line 310) | Breakthrough patents | Top 1% (`PERCENT_RANK >= 0.99`) | grant_year x CPC section |
| `65_blockbuster_lorenz.py` (line 33) | Blockbuster patents | Top 1% (`PERCENT_RANK >= 0.99`) | grant_year x CPC section |
| `41_firm_quality_distribution.py` (line 150) | Blockbuster rate | Top 1% (`PERCENTILE_CONT(0.99)` threshold) | year x CPC section |

### Formula Details

**Chapter 9 breakthrough patents (script 11):**
```sql
PERCENT_RANK() OVER (PARTITION BY year, tech_section ORDER BY fwd_cites) AS pctl
...
SUM(CASE WHEN pctl >= 0.99 THEN 1 ELSE 0 END) AS breakthrough_count
-- Uses total forward citations (uncapped), partitioned by year x CPC section
```

**Blockbuster Lorenz (script 65):**
```sql
PERCENT_RANK() OVER (PARTITION BY grant_year, cpc_section ORDER BY fwd_cite_5y) AS pctl
...
SUM(CASE WHEN pctl >= 0.99 THEN 1 ELSE 0 END) AS blockbuster_count
-- Uses 5-year forward citations, partitioned by year x CPC section
```

**Firm quality distribution (script 41):**
```sql
PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY fwd_cites) AS p99_threshold
...
SUM(CASE WHEN fwd_cites >= bt.p99_threshold THEN 1 ELSE 0 END) / COUNT(*)
-- Uses 5-year forward citations, threshold computed per year x section
```

### Issues Found

1. **INCONSISTENT CITATION MEASURE (MEDIUM):** Script 11 (breakthrough_patents.json) uses *total lifetime* forward citations (`COALESCE(fc.fwd_cites, 0)` -- all forward citations ever), while scripts 41 and 65 use *5-year forward citations*. This means:
   - The "breakthrough patents" in chapter 9 are defined differently from "blockbuster patents" in the firm-level analysis
   - The chapter 9 breakthrough rate will be influenced by citation age effects (older patents accumulate more lifetime citations)

2. **PERCENT_RANK vs. PERCENTILE_CONT (MINOR):** Scripts 11 and 65 use `PERCENT_RANK() >= 0.99` while script 41 uses `PERCENTILE_CONT(0.99)` as a threshold. These can yield slightly different sets of patents:
   - `PERCENT_RANK` ranks each patent within its cohort (fraction of values below)
   - `PERCENTILE_CONT` finds the value at the 99th percentile
   - With ties at the 99th percentile boundary, these methods can include different numbers of patents

3. **WITHIN-YEAR AND WITHIN-FIELD (CORRECT):** All implementations correctly partition by both year and CPC section, controlling for temporal and field-specific citation norms. This is the standard approach.

### Disclosure Status

- **Methodology page** (lines 433-435): "A patent in the top 1% of 5-year forward citations within its grant-year x CPC section cohort." -- Matches scripts 41 and 65.
- **Chapter page** (system-patent-quality, line 113): References the breakthrough patent analysis which uses lifetime citations, creating a slight mismatch with the methodology page definition.
- The `DataNote` on the quality chapter page does not clarify the lifetime vs. 5-year distinction for breakthrough patents specifically.

### Verdict: PASS with noted inconsistency
The blockbuster/breakthrough definition is consistently top 1% within year x CPC section, which is standard. The citation window inconsistency between lifetime (chapter 9 breakthrough) and 5-year (firm-level blockbuster) should be disclosed more clearly.

---

## 5. Gender Inference

### Method Used

**Script:** `data-pipeline/25_chapter5_gender_deep.py`

The code uses PatentsView's built-in `gender_code` field from the `g_inventor_disambiguated` table:

```sql
CASE WHEN i.gender_code = 'M' THEN 'Male'
     WHEN i.gender_code = 'F' THEN 'Female'
     ELSE 'Unknown' END AS gender
...
WHERE i.gender_code IN ('M', 'F')
```

**Method:** PatentsView's `gender_code` field, which is derived from first-name-based gender inference. The project does NOT use an independent gender inference library (like `gender-guesser`, `genderize.io`, or an ML model). It relies entirely on PatentsView's pre-computed field.

### Team Gender Composition

Script 25 defines team composition (lines 66-84):
```sql
male_count + female_count >= team_size * 0.8  -- Require 80% gender-identifiable inventors
CASE
  WHEN female_count = 0 THEN 'All Male'
  WHEN male_count = 0 THEN 'All Female'
  ELSE 'Mixed Gender'
END
```

The 80% threshold means a team of 5 where 1 inventor has unknown gender (4/5 = 80%) is included, but a team of 5 where 2 have unknown gender (3/5 = 60%) is excluded.

### Issues Found

1. **RELIANCE ON PATENTSVIEW FIELD (ACCEPTABLE):** Using PatentsView's `gender_code` is the standard approach in patent analytics. PatentsView uses first-name-based inference, which has known limitations for names common in East Asian, South Asian, and other non-Western cultures.

2. **NO INDEPENDENT VALIDATION (MINOR):** The project does not cross-validate PatentsView's gender assignment against any other source. The coverage rate (what percentage of inventors have M/F vs. null gender_code) is not disclosed.

3. **BINARY GENDER ONLY (DISCLOSED):** The code filters to `gender_code IN ('M', 'F')`, excluding all inventors with null, unknown, or non-binary gender codes. This is disclosed.

### Disclosure Status

- **Methodology page** (line 371): "Inventor gender is inferred from first names using PatentsView's gender_code field (M/F). This name-based inference does not capture non-binary identities and may misclassify individuals whose names are ambiguous or culturally variable." -- **Good disclosure.**
- **Methodology page** (line 561): Lists "Gender inference: Inventor gender is inferred from first names and may not reflect actual gender identity. Non-binary identities are not captured. Accuracy varies by cultural context and name ambiguity." -- **Good.**
- **Chapter page** (inv-gender, line 361-363): "Gender is inferred from inventor first names using the methodology in PatentsView and does not capture non-binary identities." -- **Adequate.**
- **DataNote** (inv-gender, lines 611-614): "Gender data is based on PatentsView gender attribution using first names. Non-binary identities are not captured by the name-based inference methodology." -- **Adequate.**
- **MeasurementSidebar** (chapterMeasurementConfig.ts, line 89): "Gender inferred from inventor first names using PatentsView male_flag." -- Uses "male_flag" terminology instead of "gender_code" which is slightly inaccurate but not misleading.
- **DescriptiveGapNote** and **CompetingExplanations** components provide additional context about interpreting gender gaps (visible on the chapter page).

### Ethnic/Geographic Bias Disclosure

- The methodology page mentions "culturally variable" names.
- The chapter page does NOT explicitly call out the known higher error rate for East Asian names (a well-documented limitation of name-based gender inference). However, the CompetingExplanations component on the chapter page discusses "field composition" as a competing explanation, which indirectly addresses this.

### Verdict: PASS
Gender inference method is standard and limitations are disclosed in multiple locations. The methodology page provides appropriate caveats about cultural variability and binary limitation. The ethnic/geographic bias of name-based inference could be disclosed more explicitly, but the existing language ("culturally variable") covers the concern.

---

## 6. NLP/Topic Modeling

### Implementation Details

**Script:** `data-pipeline/28_chapter12_topic_modeling.py`

| Parameter | Value | Notes |
|-----------|-------|-------|
| Algorithm | NMF (Non-Negative Matrix Factorization) | `sklearn.decomposition.NMF` |
| Input representation | TF-IDF | `sklearn.feature_extraction.text.TfidfVectorizer` |
| Corpus | Patent abstracts | 8.45M utility patent abstracts, length > 50 chars |
| Number of topics (K) | 25 | Hard-coded |
| TF-IDF features | 10,000 | `max_features=10_000` |
| TF-IDF n-grams | (1, 2) | Unigrams and bigrams |
| TF-IDF min_df | 50 | Minimum document frequency |
| TF-IDF max_df | 0.5 | Maximum document frequency (50%) |
| TF-IDF sublinear | True | `log(1 + tf)` weighting |
| NMF init | `nndsvd` | SVD-based initialization |
| NMF solver | `mu` | Multiplicative update |
| NMF max_iter | 200 | Maximum iterations |
| NMF beta_loss | `frobenius` | Standard loss function |
| NMF random_state | 42 | Reproducible |
| UMAP sample | 15,000 (600 per topic) | Stratified |
| UMAP n_neighbors | 15 | Default |
| UMAP min_dist | 0.1 | Default |
| UMAP metric | cosine | Appropriate for text |

### How K = 25 Was Chosen

The script hard-codes `n_components=25`. There is no evidence in the code of:
- Coherence score optimization
- Perplexity analysis
- Topic coherence evaluation at multiple K values
- Elbow method or silhouette analysis

The choice of K = 25 appears to be a researcher judgment call rather than a data-driven selection.

### Topic Labeling

Topics are labeled through a combination of:
1. **Curated names** (lines 129-155): A manually created dictionary `CURATED_TOPIC_NAMES` maps topic indices to human-readable names (e.g., 0 -> "Mechanical Structures", 1 -> "Computing & Networks").
2. **Auto-naming fallback** (lines 157-162): If no curated name exists, the top 3 words are joined.
3. The curated names were assigned by inspecting the top 15 words per topic.

### Issues Found

1. **K SELECTION NOT DATA-DRIVEN (MEDIUM):** The number of topics (25) is not justified by model selection criteria. Standard practice in topic modeling is to evaluate multiple K values using coherence metrics. With 8.45M documents, K = 25 produces coarse topics. This is disclosed as a fixed choice but the rationale is not documented.

2. **NMF vs. OTHER METHODS (ACCEPTABLE):** NMF is a reasonable choice for large corpora where LDA would be computationally expensive. NMF tends to produce more interpretable topics than LDA for patent text. BERTopic was not used (likely due to memory/compute constraints with 8.45M documents and 16 GB VRAM).

3. **NO TOPIC COHERENCE METRICS (MINOR):** The script logs reconstruction error and iteration count but does not compute standard topic coherence metrics (C_V, UMass, NPMI). This makes it difficult to assess topic quality objectively.

4. **CURATED TOPIC NAMES (ACCEPTABLE):** Manual topic naming is standard practice. The top words are preserved in the JSON output, allowing readers to judge naming quality. The chapter page displays both the curated name and top 8 words.

5. **TOPIC ASSIGNMENT METHOD:** Each patent is assigned to its dominant topic via `argmax(W)` (line 117). This is a hard assignment -- each patent belongs to exactly one topic. The entropy calculation later uses the full weight vector W, which is appropriate for measuring thematic diversity.

6. **UMAP SAMPLE SIZE DISCREPANCY:** The chapter page (system-language, lines 300-316) refers to "5,000 patents" in the narrative but the code samples 15,000 (600 per topic). The DataNote says "stratified sample of 5,000 patents (200 per topic)" which is also inconsistent with the code's 600 per topic / 15,000 total.

### Disclosure Status

- **Methodology page** (lines 296-304): "Non-Negative Matrix Factorization (NMF) topic modeling to 8.45 million patent abstracts to discover 25 data-driven technology themes. Unlike CPC, which relies on examiner-assigned codes, the NMF topic model extracts thematic structure directly from patent text using TF-IDF vectorization followed by matrix decomposition." -- Accurate.
- **Chapter page** (system-language, lines 187-193): Describes TF-IDF + NMF with 25 topics. Adequate.
- **DataNote** (system-language, lines 496-504): Specifies "10,000 features, unigrams + bigrams," "NMF with 25 components," UMAP with "cosine distance." Says "5,000 patents (200 per topic)" which contradicts the code (15,000 / 600 per topic).

### Verdict: PASS with noted issues
The NMF implementation is technically sound and well-parameterized. The main issues are: (a) K = 25 is not data-driven, (b) the UMAP sample size description on the chapter page and DataNote is inconsistent with the code, and (c) no topic coherence metrics are computed.

---

## Summary of Issues

### Critical Issues
None.

### Medium Issues

| # | Metric | Issue | Impact |
|---|--------|-------|--------|
| 1 | Entropy | Inconsistent log base: `log2` in 3 scripts, `LN` in 2 scripts | Cross-analysis comparisons of raw entropy values would be misleading |
| 2 | Blockbuster | Script 11 uses lifetime citations; scripts 41/65 use 5-year citations | "Breakthrough" and "blockbuster" are defined differently |
| 3 | NLP | K = 25 topics chosen without model selection criteria | Topic granularity is an unjustified researcher choice |

### Minor Issues

| # | Metric | Issue | Impact |
|---|--------|-------|--------|
| 4 | Originality | CPC section (8 categories) is coarser than literature standard (~36 NBER categories) | Low absolute values; interpretation is correct |
| 5 | Originality | HJT small-sample correction not applied | Slight understatement for low-citation patents |
| 6 | Entropy | Methodology page says `ln()` but main implementation uses `log2` | Documentation mismatch |
| 7 | Entropy | No normalization despite methodology page mentioning it | Raw values not bounded 0-1 |
| 8 | NLP | UMAP sample size: code = 15,000 / chapter page = 5,000 | Factual discrepancy in narrative |
| 9 | NLP | No topic coherence metrics reported | Quality of topics not objectively assessed |
| 10 | Gender | MeasurementSidebar says "male_flag" but field is "gender_code" | Minor terminology inaccuracy |
| 11 | Gender | Ethnic/geographic inference bias not explicitly disclosed | Known limitation of name-based methods |

### Items That Are Correct

- Originality and generality formulas match Trajtenberg/Henderson/Jaffe (1997) and Hall/Jaffe/Trajtenberg (2001)
- HHI implementations use correct mathematical formula on appropriate scales
- CR4 correctly computed as sum of top 4 shares (not HHI of top 4)
- Blockbuster threshold consistently top 1% within year x CPC section
- Gender inference uses standard PatentsView field with adequate limitation disclosures
- NMF topic modeling is technically sound with appropriate parameters
- Methodology page provides comprehensive, mostly accurate metric definitions
- Generality correctly truncated at 2020 to avoid citation window bias

---

## Files Examined

### Pipeline Scripts
- `/home/saerom/projects/patentworld/data-pipeline/60_originality_generality_filtered.py`
- `/home/saerom/projects/patentworld/data-pipeline/11_chapter9_patent_quality.py`
- `/home/saerom/projects/patentworld/data-pipeline/18_chapter9_composite_quality.py`
- `/home/saerom/projects/patentworld/data-pipeline/65_blockbuster_lorenz.py`
- `/home/saerom/projects/patentworld/data-pipeline/25_chapter5_gender_deep.py`
- `/home/saerom/projects/patentworld/data-pipeline/28_chapter12_topic_modeling.py`
- `/home/saerom/projects/patentworld/data-pipeline/14_chapter10_patent_law.py`
- `/home/saerom/projects/patentworld/data-pipeline/35_portfolio_strategy.py`
- `/home/saerom/projects/patentworld/data-pipeline/15_chapter3_portfolio_diversity.py`
- `/home/saerom/projects/patentworld/data-pipeline/41_firm_quality_distribution.py`
- `/home/saerom/projects/patentworld/data-pipeline/37_inventor_careers.py`
- `/home/saerom/projects/patentworld/data-pipeline/02_chapter2_technology.py`
- `/home/saerom/projects/patentworld/data-pipeline/phase5.py`

### Frontend Pages
- `/home/saerom/projects/patentworld/src/app/methodology/page.tsx`
- `/home/saerom/projects/patentworld/src/app/chapters/system-patent-quality/page.tsx`
- `/home/saerom/projects/patentworld/src/app/chapters/system-language/page.tsx`
- `/home/saerom/projects/patentworld/src/app/chapters/inv-gender/page.tsx`
- `/home/saerom/projects/patentworld/src/lib/chapterMeasurementConfig.ts`
