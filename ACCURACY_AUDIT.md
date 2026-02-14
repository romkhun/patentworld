# PatentWorld — Accuracy Audit (Stream 2)

**Date**: 2026-02-14
**Scope**: All 14 chapters, Home page, About page — every factual claim verified against underlying JSON data files.

---

## Summary

| Category | Count |
|----------|-------|
| WRONG | 24 |
| IMPRECISE | 18 |
| STALE | 3 |
| UNSUPPORTED | 6 |
| OK | ~100+ |

---

## CHAPTER 1: The Innovation Landscape

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 1.1 | "9.36 million" (subtitle, Key Findings, TL;DR) | STALE | `formatCompact(9361444)` = "9.4M" but text hardcodes "9.36M" | Changed hardcoded text to "over 9.3 million" for consistency |
| 1.2 | "50 years" / "1976-2025" | OK | 50 calendar year-values confirmed | — |
| 1.3 | Peak year 2019, 393K | OK | hero_stats.json confirms 392,618 → "393K" | — |
| 1.4 | "roughly fivefold increase" | OK | Late 1970s avg 64,297 → recent avg 361,454 = 5.6x | — |
| 1.5 | "Utility patents account for over 90%" | OK | 8,451,545 / 9,361,444 = 90.3% | — |
| 1.6 | "approximately 70,000 in the late 1970s" | IMPRECISE | 1977=69,820, 1978=70,586, 1979=52,484; avg ~64,000 | Changed to "approximately 65,000–70,000" |
| 1.7 | "over 350,000 in recent years" | OK | 2019-2024 all exceed 350K | — |
| 1.8 | "median surpassed average by the 2020s" | **WRONG** | Crossover occurred in **2016** | Changed to "by the mid-2010s" |
| 1.9 | "Grant lag peaked near four years around 2010" | OK | 2010: 3.82 years | — |

## CHAPTER 2: The Technology Revolution

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 2.1 | "Chemistry, once the dominant sector" | **WRONG** | Mechanical engineering was #1 1976–1994, not Chemistry | Rewritten: "EE rose to overtake first chemistry, then mechanical engineering" |
| 2.2 | "EE surpassed chemistry as the dominant sector ~1994" | **WRONG** | Chemistry was #2, not dominant; EE surpassed ME in 1995 to lead | Fixed to describe correct hierarchy |
| 2.3 | "several hundred percent" growth | IMPRECISE | Actual range +1,103% to +3,700% (several thousand) | Changed to "over one thousand percent" |
| 2.4 | "typewriters and photographic processes" as declining classes | **UNSUPPORTED** | Not in cpc_class_change.json data; actual declines are semiconductor/digital | Replaced with actual declining class descriptions |
| 2.5 | "declining classes contracted by comparable margins" | **WRONG** | Max decline -83.9% vs max growth +3,700% | Removed "comparable margins" language |
| 2.6 | "diversity declined from the 1970s through 2009" | IMPRECISE | Flat 1976-1987; decline began late 1980s | Changed to "from its mid-1980s peak" |

## CHAPTER 3: Who Innovates?

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 3.1 | "Samsung shifted from mechanical to electronics in the 1990s" | **WRONG** | Samsung was always H/G dominated from its first patents | Rewritten to reflect actual portfolio evolution |
| 3.2 | "foreign approximately 54–55% in the 2020s" | IMPRECISE | Range 50.5%–55.6%, avg 53% | Changed to "approximately 51–56%, averaging 53%" |
| 3.3 | "Samsung surpassed IBM during the 2010s" | STALE | First surpassed in 2007, permanent lead from 2021 | Changed to "Samsung first surpassed IBM in 2007" |
| 3.4 | "GE/IBM dominance (1970s-80s)" | IMPRECISE | IBM was ranked 3rd–8th; GE alone dominated | Changed to "GE dominance" |
| 3.5 | Top 100 "consistently roughly a third" | IMPRECISE | Range 31.8%–38.6%; latest 31.8% | Added range context |

## CHAPTER 4: The Inventors

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 4.1 | "under 20,000 in the late 1970s" (inventor entries) | **WRONG** | Actually 35,126–58,610 | Changed to "approximately 35,000–59,000" |
| 4.2 | "new inventors outpaced patent grants" | **WRONG** | Patents grew 5.3x vs inventors 2.8x (reversed) | Reversed the comparison |
| 4.3 | "majority of inventors file only a single patent" | **WRONG** | 43.3%, not >50% | Changed to "plurality" (43%) |
| 4.4 | "Productivity Peaks at Career Years 5-10 Before Declining" | **WRONG** | Data shows continuous slow rise through year 35+ | Rewritten: "rises steeply in early career, then plateaus" |
| 4.5 | "Most Inventors Patent Only Once" (section title) | IMPRECISE | 57-62% survive past year 1 | Reworded to "substantial attrition" |

## CHAPTER 5: The Geography of Innovation

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 5.1 | "Germany maintained a strong second position" | STALE | Germany dropped to #3 (2015), #4 (2020) | Updated with correct trajectory |
| 5.2 | CA "approximately one-quarter" | IMPRECISE | 23.6%, not 25% | Changed to "nearly one-quarter (23.6%)" |
| 5.3 | Regional specialization "proven notably persistent" | UNSUPPORTED | Only single-period data | Added qualifier "in the available data" |

## CHAPTER 6: Collaboration Networks

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 6.1 | "US-China Has Grown Across All Technology Sectors" | **WRONG** | Chemistry (C) declined 305→205 (2020-2023) | Changed to "most technology sectors" |
| 6.2 | "grown continuously" for US-China | IMPRECISE | 11 years of decline including 2023 | Changed to "grown substantially" |
| 6.3 | "all sections continued to expand" | **WRONG** | Chemistry contracted ~33% 2020-2023 | Replaced with accurate description |

## CHAPTER 7: The Knowledge Network

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 7.1 | Citation lag ~3 years to >16 years | OK | 2.91→16.24 confirmed | — |
| 7.2 | "NIH" in title (data says HHS) | IMPRECISE | Minor; HHS is the agency name | Kept as NIH for clarity (common usage) |

## CHAPTER 8: Innovation Dynamics

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 8.1 | "Chemistry and Instruments Exhibit Longest Grant Lags, Exceeding 3.5 Years" | **WRONG** | Instruments was 3.12y; EE was 3.56y (the actual #2) | Changed to "Chemistry and Electrical Engineering" |
| 8.2 | "Both Median and 90th Percentile Have Increased Since 1990s" | **WRONG** | P90 peaked at 35 (2005), declined to 21 (2025) | Rewrote to note P90 decline |
| 8.3 | "Chemistry and Human Necessities Leading" in claims | **WRONG** | G (19) and H (18) lead, not C (15) and A (17) | Changed to Physics and Electricity |
| 8.4 | Design patent leaders "Apple, Samsung, and Nike" | IMPRECISE | Actual: Samsung #1, Nike #2, LG #3, Apple #4 | Fixed ordering |
| 8.5 | Intl collaboration "over 10%" | IMPRECISE | Exactly 10.0% in 2025 | Changed to "reaching 10%" |

## CHAPTER 9: Patent Quality

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 9.1 | "sleeping beauties especially prevalent in Chemistry and Physics" | **WRONG** | 47/50 are Section A (Human Necessities); C and G have zero | Corrected to Human Necessities |
| 9.2 | Self-citation title "IBM, Samsung, and Semiconductor Firms" | **WRONG** | Canon #1 (47.6%), TSMC #2 (38.4%); IBM #5, Samsung #7 | Changed to Canon, TSMC, Micron |
| 9.3 | Claims increase "approximately 70%" | IMPRECISE | Actually 76.4% (9.41→16.60) | Changed to "approximately 76%" |
| 9.4 | "about 10 to about 17" | IMPRECISE | 9.41→16.60; "about 9.5" more precise | Changed to "about 9.5 to about 17" |

## CHAPTER 10: Patent Law & Policy

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 10.1 | "G-H dominates convergence across all eras" | **WRONG** | G-H was #3 (12.48%) in 1976-1995; B-C was #1 | Changed to "since the mid-1990s" |
| 10.2 | TRIPS patent term change | IMPRECISE | Duplicated with GATT entry | Deduplicated |

## CHAPTER 11: Artificial Intelligence

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 11.1 | AI leaders "IBM, Samsung, Google" ordering | IMPRECISE | Correct: IBM, Google, Samsung | Fixed ordering |
| 11.2 | "Followed by Japan and South Korea" | **WRONG** | China (#3 with 15,596) omitted | Added China |

## CHAPTER 12: Green Innovation

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 12.1 | "Japan historically dominated" | IMPRECISE | Samsung (KR) leads overall | Added nuance |

## CHAPTER 13: The Language of Innovation

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 13.1 | "under 10% to over 30%" computing share | **WRONG** | ~12% to ~33% (6-topic) | Changed to "approximately 12% to over 33%" |

## CHAPTER 14: Company Profiles

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| 14.1 | "Plateau companies such as Samsung" | **WRONG** | No "Plateau" archetype; Samsung is "Late Bloomer (3)" | Fixed archetype names |
| 14.2 | "ranging from Plateau to Fading Giants" | **WRONG** | Archetypes: Late Bloomer (3 variants), Steady Climber, Boom & Bust (2 variants) | Fixed |
| 14.3 | Header "100" vs trajectory "200" mismatch | IMPRECISE | Profiles=100, trajectories=200 | Clarified both numbers |

## About Page

| # | Claim | Verdict | Issue | Fix |
|---|-------|---------|-------|-----|
| A.1 | "AI filings grew approximately 10-fold" | **WRONG** | Actual: 5.7x peak (2012→2023) | Changed to "approximately six-fold" |
| A.2 | "Computing 10% to over 55%" | **WRONG** | ~12-15% to ~33-40% | Changed to match data |

---

## Methodology

Each claim was verified by:
1. Extracting the factual assertion from the page.tsx source code
2. Loading the corresponding JSON data file from `public/data/`
3. Computing the actual value using Python/Node.js
4. Classifying discrepancies as WRONG, STALE, IMPRECISE, or UNSUPPORTED
5. Applying corrections to the source code

All fixes were applied directly to the chapter page.tsx files.
