# Quality & Exploration Analysis Log

## Summary

Implemented two analytically rich frameworks computed at the company level over time, building on existing PatentsView data and pipeline infrastructure.

---

## Analysis Group 1: Firm-Level Quality Distribution Over Time

### Pipeline Script
- **`41_firm_quality_distribution.py`** — Computes all Group 1 metrics per (firm x year) for the top 50 assignees.

### Data Files Generated
| File | Size | Contents |
|------|------|----------|
| `firm_quality_distribution.json` | 293 KB | Citation percentiles (p10-p99), mean, blockbuster rate, dud rate, Gini, system median per (firm x year) |
| `firm_claims_distribution.json` | 170 KB | Claims percentiles (p25-p90), mean, system median per (firm x year) |
| `firm_scope_distribution.json` | 146 KB | CPC scope percentiles (p50-p90), mean, system median per (firm x year) |
| `firm_quality_scatter.json` | 5 KB | Blockbuster rate, dud rate, patent count, primary CPC section per firm (2010-2019) |
| `firm_quality_gini.json` | 19 KB | Gini coefficient trajectories for top 20 firms by recent Gini |

### Spot-Check Results (>=5)

1. **IBM 1976**: p50=2.0, p90=6.0, blockbuster=3.9%, dud=21.0%, gini=0.54
2. **IBM 2015**: p50=1.0, p90=5.0, blockbuster=0.4%, dud=48.8%, gini=0.76
3. **Amazon (2010-2019)**: blockbuster=6.68%, dud=18.28% — Consistent star (high blockbuster, low dud)
4. **Apple (2010-2019)**: blockbuster=3.30%, dud=31.14% — High-variance innovator
5. **Mitsubishi Electric (2010-2019)**: blockbuster=0.09%, dud=54.38% — Underperformer
6. **Google (2010-2019)**: blockbuster=2.57%, dud=28.65% — High-variance innovator
7. **Samsung (2010-2019)**: blockbuster=0.36% — Among lowest despite largest portfolio

### Verified Takeaways
- IBM's within-portfolio citation Gini rose from 0.54 in 1976 to 0.76 in 2015, indicating that its citation impact became significantly more concentrated over four decades.
- Amazon occupies the "consistent star" quadrant with a blockbuster rate of 6.7% (6.7x the expected 1% rate) and a dud rate of only 18.3%.
- Several Japanese electronics firms (Fujitsu, Brother Industries, Mitsubishi Electric) cluster in the "underperformer" quadrant with blockbuster rates below 0.2% and dud rates above 50%.

### Visualizations Added (to Who Innovates?, Ch. 3)
| # | Type | Description |
|---|------|-------------|
| 1a | Fan Chart (interactive) | Forward citation distribution with company dropdown |
| 1b | Line Chart | Blockbuster and dud rates over time per company |
| 1d | Fan Chart (interactive) | Claims distribution with company dropdown |
| 1c | Bubble Scatter | Quality typology: blockbuster vs. dud rate (2010-2019) |

### Visualization Added (to Patent Quality, Ch. 9)
| # | Type | Description |
|---|------|-------------|
| 1f | Small Multiples | Gini coefficient trajectories for 20 firms |

---

## Analysis Group 2: Firm-Level Exploration vs. Exploitation Over Time

### Pipeline Scripts
- **`42_firm_exploration_exploitation.py`** — Computes all Group 2 metrics per (firm x year): exploration scores, share decomposition, quality premium.
- **`43_firm_exploration_lifecycle.py`** — Computes exploration decay curves per (firm x CPC subclass x relative year).
- **`44_firm_ambidexterity_quality.py`** — Computes ambidexterity index and blockbuster rate per (firm x 5-year window).

### Data Files Generated
| File | Size | Contents |
|------|------|----------|
| `firm_exploration_scores.json` | 575 KB | Exploration composite and component scores, shares, quality premium per (firm x year) |
| `firm_exploration_scatter.json` | 5 KB | Exploration share, quality premium per firm (2010-2019) |
| `firm_exploration_trajectories.json` | 30 KB | Exploration share trajectories for top 20 firms |
| `firm_exploration_lifecycle.json` | 17 KB | Decay curves for 15 firms + system average |
| `firm_ambidexterity_quality.json` | 59 KB | Ambidexterity index, blockbuster rate per (firm x 5-year window) |

### Exploration Score Definition
Each patent is scored on three indicators (0 = exploitation, 1 = exploration):
1. **Technology Newness**: Linear interpolation based on firm's prior 5-year patent count in the same CPC subclass (0 prior = 1.0, >=10 prior = 0.0)
2. **Citation Newness**: Share of backward citations pointing to CPC sections where the firm has <5 patents in prior 5 years
3. **External Knowledge Sourcing**: 1 - self-citation rate

**Composite**: Simple average of three indicators. Exploratory: >0.6, Exploitative: <0.4, Ambidextrous: 0.4-0.6.

### Spot-Check Results (>=5)

1. **IBM 1990**: mean_exploration=0.289, exploration_share=1.5%, exploitation_share=91.5%
2. **IBM 2015**: mean_exploration=0.266, exploration_share=0.5%, exploitation_share=98.2%
3. **Microsoft (Licensing) (2010-2019)**: exploration_share=17.2% — Most exploratory large-portfolio filer
4. **Samsung (2010-2019)**: exploration_share=0.36% — Among most exploitative
5. **System average decay**: exploration score falls from 1.0 at entry to 0.087 by year 5 and 0.045 by year 10
6. **HP Development (2000-2004)**: ambidexterity_index=0.996, blockbuster_rate=1.15%
7. **Amazon (2005-2009)**: ambidexterity_index=0.986, blockbuster_rate=4.17%

### Verified Takeaways
- Most top-50 assignees maintain exploration shares below 5%, indicating that the vast majority of their patenting deepens established technology domains.
- The typical firm's exploration score in a newly entered subclass declines from 1.0 at entry to below 0.1 within 5 years, reflecting a rapid exploration-to-exploitation transition.
- IBM is among the most exploitative firms with an exploration share of only 0.41% in 2010-2019.
- Microsoft (Licensing) is the most exploratory large filer at 17.2% exploration share, likely reflecting its diversified patent licensing portfolio.

### Visualizations Added (to Innovation Dynamics, Ch. 8)
| # | Type | Description |
|---|------|-------------|
| 2a | Line Chart (interactive) | Exploration score and 3 component indicators per company |
| 2a' | Stacked Area (interactive) | Exploration/exploitation/ambidextrous share per company |
| 2b | Small Multiples | Exploration share trajectories for 20 firms |
| 2c | Bubble Scatter | Exploration share vs. quality premium (2010-2019) |
| 2d | Small Multiples | Exploration decay curves for 15 firms |
| 2e | Bubble Scatter | Ambidexterity index vs. blockbuster rate |

---

## New Chart Components Created
| Component | File | Description |
|-----------|------|-------------|
| PWFanChart | `src/components/charts/PWFanChart.tsx` | Stacked area bands for percentile distributions with median line and system reference |
| PWSmallMultiples | `src/components/charts/PWSmallMultiples.tsx` | Grid of small line charts, one per firm, with optional reference lines |
| PWBubbleScatter | `src/components/charts/PWBubbleScatter.tsx` | Scatter chart with bubble size encoding and CPC section coloring |

---

## Data Validation
- All 10 JSON output files checked for NaN, null, Infinity — none found
- Citation window truncation: analysis limited to patents granted through 2019 (5-year forward window extends to 2024 data)
- Blockbuster threshold: top 1% within year x CPC section cohort
- Gini coefficient validated: firms with concentrated citation impact show Gini near 0.8+
- Self-citation correctly computed using disambiguated assignee organizations
- Minimum sample sizes enforced: >=10 patents per firm-year, >=50 patents per firm-period for scatter, >=20 exploratory AND exploitative patents for quality premium

## Build Verification
- `npx next build`: 22/22 pages, zero errors
- Only pre-existing warning: `cbL` unused in the-inventors/page.tsx

## Visualization Count Update
- Previous: 117
- Added: 11 ChartContainers (plus 1 additional breakdown chart)
- New total: 128
