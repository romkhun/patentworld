# Concentration Level vs. Trend Paradox Audit (Section 1.6.18)

**Audit date:** 2026-02-21
**Scope:** All 12 Deep Dive domains (ACT 6, chapters 23-34)
**Data source:** `public/data/{domain}/*_org_over_time.json` + `*_per_year.json`
**Method:** CR4 = sum of top-4 organizations' annual patent counts / total domain patents per year

---

## 1. Latest-Year CR4 Ranking (Absolute Level)

| Rank | Domain                   | Latest CR4   | Year | Domain Volume |
|-----:|:-------------------------|-------------:|-----:|--------------:|
|    1 | Agricultural Technology  |       32.8%  | 2025 |         2,421 |
|    2 | Semiconductors           |       32.0%  | 2025 |        16,121 |
|    3 | Quantum Computing        |       28.4%  | 2025 |           563 |
|    4 | Blockchain               |       15.4%  | 2025 |           449 |
|    5 | Space Technology         |       14.4%  | 2025 |           835 |
|    6 | Autonomous Vehicles      |       12.7%  | 2025 |         4,175 |
|    7 | AI Patents               |       10.9%  | 2025 |        21,376 |
|    8 | Cybersecurity            |        9.4%  | 2025 |        12,761 |
|    9 | 3D Printing              |        8.1%  | 2025 |         2,012 |
|   10 | Digital Health           |        6.8%  | 2025 |         9,369 |
|   11 | Green Innovation         |        5.7%  | 2025 |        21,208 |
|   12 | Biotechnology            |        4.6%  | 2025 |         4,223 |

**Finding:** Agricultural technology (32.8%) holds the highest absolute CR4 in 2025, followed closely by semiconductors (32.0%), then quantum computing (28.4%). These are the ONLY three domains above the 25% threshold.

---

## 2. Trend Analysis: Overall and Recent

| Domain                   | Earliest CR4  | Latest CR4 | Overall Delta | Recent 5yr Delta | Trend Classification     |
|:-------------------------|:--------------|:-----------|:--------------|:-----------------|:-------------------------|
| Agricultural Technology  | 2.2% (1976)   | 32.8% (2025)| +30.6 pp     | +8.5 pp          | RISING overall, RISING recent |
| Semiconductors           | 13.1% (1976)  | 32.0% (2025)| +18.9 pp     | +4.8 pp          | RISING overall, RISING recent |
| Quantum Computing        | 76.9% (2003)  | 28.4% (2025)| -48.5 pp     | -19.1 pp         | DECLINING overall and recent |
| Blockchain               | 10.0% (2006)  | 15.4% (2025)| +5.4 pp      | -5.9 pp          | RISING overall, DECLINING recent |
| Space Technology         | 19.4% (1976)  | 14.4% (2025)| -5.0 pp      | -3.2 pp          | DECLINING overall and recent |
| Autonomous Vehicles      | 5.3% (1990)   | 12.7% (2025)| +7.4 pp      | +1.1 pp          | RISING overall, STABLE recent |
| AI Patents               | 13.5% (1976)  | 10.9% (2025)| -2.6 pp      | -6.0 pp          | STABLE overall, DECLINING recent |
| Cybersecurity            | 25.0% (1976)  | 9.4% (2025) | -15.6 pp     | -3.1 pp          | DECLINING overall and recent |
| 3D Printing              | 5.6% (1990)   | 8.1% (2025) | +2.5 pp      | -6.8 pp          | STABLE overall, DECLINING recent |
| Digital Health           | 5.8% (1976)   | 6.8% (2025) | +1.0 pp      | -2.0 pp          | STABLE overall and recent |
| Green Innovation         | 4.7% (1976)   | 5.7% (2025) | +1.0 pp      | -2.7 pp          | STABLE overall, slightly declining recent |
| Biotechnology            | 1.4% (1976)   | 4.6% (2025) | +3.2 pp      | -1.1 pp          | STABLE overall and recent |

---

## 3. Sustained Consolidation Test

To test "sustained consolidation," CR4 was compared across three periods:

| Domain                   | Early (00-05) | Mid (10-15) | Late (20-25) | E->M    | M->L     | Sustained Rising? |
|:-------------------------|:-------------|:-----------|:-----------|:--------|:---------|:------------------|
| **Semiconductors**       | 18.1%        | 17.2%      | 29.2%      | -0.9 pp | +12.1 pp | **PARTIAL** -- flat in early-to-mid, sharp rise mid-to-late |
| **Autonomous Vehicles**  | 6.1%         | 12.2%      | 12.5%      | +6.0 pp | +0.3 pp  | **YES** -- both intervals positive, but recent gains negligible |
| Agricultural Technology  | 18.9%        | 43.6%      | 26.2%      | +24.7 pp| -17.4 pp | NO -- rose then fell |
| Blockchain               | N/A          | 13.6%      | 17.0%      | --      | +3.4 pp  | Partial (too few data points) |
| All others               | --           | --         | --         | Various | Various  | NO               |

**Key finding:** The claim that semiconductors is "the only domain showing sustained consolidation" is **partially defensible but imprecise**:

- Semiconductors does show the clearest sustained *rising* trend since ~2010 (from ~15% to ~32%), which is unique in magnitude among all 12 domains.
- However, the trend is NOT strictly "sustained" from 1977 onward. The CR4 was flat or modestly declining from 1977-2010 (hovering around 13-20%), then rose sharply 2010-2025. A more precise statement would be: "the only domain showing sustained consolidation since 2010."
- Autonomous vehicles also show a mild but genuine sustained rising CR4 (from 6.1% early-2000s to 12.5% 2020s), though at a much lower absolute level and with modest recent gains.

---

## 4. Specific Claim Verification

### 4.1 Agricultural Technology Card
**Card text:** "Top-four concentration declined from 46.7% in 2014 to 32.8% by 2025."
- **Numbers verified:** 46.7% in 2014 matches data exactly. 32.8% in 2025 matches exactly.
- **Framing issue:** The card describes the trend as **declining from peak**. This is accurate. But the card does NOT mention that agricultural technology has the **highest absolute concentration** in 2025 (32.8%). A reader seeing "declined" may infer that ag-tech is becoming less concentrated, without realizing it still sits at the top of the ranking.
- **Severity: LOW** -- the numbers are correct, and describing a decline from peak is defensible. However, the card omits the comparative ranking context.

### 4.2 Semiconductors Card
**Card text:** "top-four-firm share increasing from 11.3% in 1977 to 32.6% in 2023 -- the only advanced technology domain showing sustained consolidation."
- **Numbers verified:** 11.3% in 1977 and 32.6% in 2023 match data exactly.
- **"Only domain" claim:** This is **largely defensible** but requires qualification:
  - Semiconductors is the only domain where CR4 in the most recent period (2020-2025) significantly exceeds CR4 in the earliest period AND shows a consistent upward trend in the 2010s-2020s.
  - Autonomous vehicles also shows mild sustained rising concentration but at much lower levels (6% -> 13%) with negligible recent gains.
  - Agricultural technology rose dramatically (2% -> 47%) but then declined (47% -> 33%), so the overall trajectory is inverted-U, not sustained consolidation.
- **Temporal precision:** The claim implies continuous increase from 1977 to 2023. In reality, semiconductor CR4 was roughly flat from 1977-2010 (11-20% range) and then rose sharply post-2010. Saying "sustained" overstates the duration of the trend.
- **Severity: MEDIUM** -- the superlative "only domain" is approximately correct but imprecise. The rise was not truly "sustained" over the full 1977-2023 period.

### 4.3 Quantum Computing Card
**Card text:** "remains among the most concentrated advanced technology domains alongside agricultural technology, with the top four firms holding 28.4% of patents in 2025 (through September), down from 76.9% in 2003."
- **Numbers verified:** 76.9% in 2003 and 28.4% in 2025 match data exactly.
- **"Most concentrated" claim:** This is **accurate** -- at 28.4%, quantum computing ranks #3 in latest-year CR4, behind agricultural technology (32.8%) and semiconductors (32.0%). All three stand well above the next domain (blockchain at 15.4%).
- **"Alongside agricultural technology" claim:** **Accurate but incomplete** -- semiconductors at 32.0% is actually between agricultural technology and quantum computing. The text fails to mention semiconductors in this grouping.
- **Level vs. trend confusion:** The card effectively communicates BOTH the absolute level (28.4%, among the highest) and the trend (declining from 76.9%). This is the best-written card among the three for disambiguating level from trend.
- **Severity: LOW** -- mostly clear, but omitting semiconductors from the "alongside" comparison creates a misleading pair.

### 4.4 Quantum Computing Chapter Page
**Caption text (fig-quantum-cr4):** "concentration remains among the highest of the ACT 6 domains alongside agricultural technology (33%)"
- The 33% figure for agricultural technology is approximately correct (32.8%), but interestingly, the chapter **also omits semiconductors (32.0%)** from this comparison, even though semiconductors has a nearly identical CR4 to agricultural technology.
- **Next chapter link:** The quantum page links to semiconductors with description "the only domain with rising concentration" -- this is consistent with the semiconductor card claim and provides the level-vs-trend distinction implicitly.

### 4.5 Biotechnology Card
**Card text:** "achieved the lowest top-four concentration among all advanced technology domains studied, declining from 13.5% in 2007 to 4.6% by 2025"
- **Numbers verified:** 13.5% in 2007 and 4.6% in 2025 match exactly.
- **"Lowest" claim:** **Confirmed** -- biotechnology at 4.6% is the lowest in 2025 among all 12 domains.
- **Severity: NONE** -- fully accurate.

### 4.6 3D Printing Card
**Card text:** "declined from 36% in 2005 to 11% by 2024"
- **Numbers verified:** 36.0% in 2005 and 11.2% in 2024 match (11% rounded). **Accurate.**

### 4.7 Cybersecurity Card
**Card text:** "declined from 32.4% in 1980 to 9.4% by 2025"
- **Numbers verified:** Both match exactly. **Accurate.**

### 4.8 Blockchain Card
**Card text:** "rose to 26.3% during the 2018 boom before declining to 14.0% by 2024"
- **Numbers verified:** Both match exactly. **Accurate.**

### 4.9 Space Technology Card
**Card text:** "fluctuated between 4.9% and 36.7%"
- **Numbers verified:** Min is 4.9% (1982), max is 36.7% (1979). **Accurate.**

---

## 5. The Semantic Collision: Level vs. Trend

The core paradox identified in the audit request is the potential reader confusion among three cards:

| Domain          | Card Emphasis        | What Reader Might Infer  | Actual Position               |
|:----------------|:---------------------|:-------------------------|:------------------------------|
| Ag-Tech         | "declined from 46.7% to 32.8%" | Becoming less concentrated | #1 highest absolute level in 2025 |
| Semiconductors  | "only domain showing sustained consolidation" | Must be the most concentrated | #2 absolute level; strongest *trend* |
| Quantum         | "among the most concentrated... alongside ag-tech" | Similar to ag-tech level | #3 absolute level; rapidly declining |

### Does "most concentrated" specify which dimension?

- **Agricultural Technology:** Card does NOT use the phrase "most concentrated." It only describes a decline from peak. The chapter page says "highest peak organizational concentration among ACT 6 domains" -- referring to the historical peak (46.7%), not the current level.
- **Semiconductors:** Card says "only domain showing sustained consolidation." The chapter page title says "Sustained Consolidation Trend." Both focus on TREND, not absolute level. However, by calling it "sustained consolidation," readers may infer that semiconductors is the most concentrated.
- **Quantum Computing:** Card says "most concentrated... alongside agricultural technology." The chapter page caption says "among the highest of the ACT 6 domains alongside agricultural technology (33%)." Both focus on LEVEL, specifically omitting the trend dimension (which is sharply declining).

**Conclusion:** The cards are NOT creating a true contradiction -- they are emphasizing different dimensions (level vs. trend) -- but they fail to make this distinction explicit, which creates a **semantic collision** for readers comparing cards side-by-side.

---

## 6. Factual Issues Found

### 6.1 Semiconductor "sustained" is an overstatement (MEDIUM)
- **Location:** Semiconductor card description in `src/lib/constants.ts` line 249; semiconductor chapter InsightRecap at line 900; chapter title at line 826
- **Issue:** CR4 was flat from 1977-2010, then rose sharply 2010-2025. Calling the full 1977-2023 trajectory "sustained consolidation" overstates the duration.
- **Suggested fix:** "...top-four-firm share increasing from 11.3% in 1977 to 32.6% in 2023, with the consolidation trend accelerating after 2010 -- the only advanced technology domain showing rising concentration over the past 15 years."

### 6.2 Quantum "alongside agricultural technology" omits semiconductors (LOW)
- **Location:** Quantum card description in `src/lib/constants.ts` line 242; quantum chapter caption at line 829
- **Issue:** Semiconductors (32.0%) sits between agricultural technology (32.8%) and quantum computing (28.4%), but is omitted from the "alongside" comparison.
- **Suggested fix:** "...the most concentrated advanced technology domains alongside agricultural technology (33%) and semiconductors (32%)..."

### 6.3 Agricultural Technology card lacks comparative context (LOW)
- **Location:** Agricultural technology card description in `src/lib/constants.ts` line 186
- **Issue:** The card describes decline from peak but does not note that ag-tech still has the HIGHEST absolute CR4 in 2025.
- **Suggested fix:** No change required if the reader has access to cross-domain comparison in the Deep Dive Overview. However, adding a clause like "...while remaining the most concentrated domain in absolute terms" would aid standalone readability.

### 6.4 Autonomous vehicles also shows mild rising concentration (INFORMATIONAL)
- **Location:** Not mentioned in any card or chapter
- **Issue:** AV CR4 rose from 5.3% (1990) to 12.7% (2025), with sustained gains across all periods. This contradicts the "only domain" claim for semiconductors, though the AV rise is at much lower absolute levels and with smaller magnitude.

---

## 7. Data Quality Notes

- **2025 is partial data (through September).** All 12 domains use 2025 as latest year. Partial-year data may distort CR4 if top firms patent earlier/later in the calendar year. Agricultural technology's spike from 22.2% (2024) to 32.8% (2025) is notably large for a partial year and may reflect timing effects.
- **Small sample domains.** Quantum computing (563 patents in 2025) and blockchain (449 patents) have small enough populations that a single organization's filing batch can swing CR4 by several percentage points.
- **The Deep Dive Overview page (line 274-281) correctly warns** that CR4 must be interpreted relative to domain size, noting that "a 30% CR4 in quantum computing...reflects a fundamentally different competitive landscape than the same 30% in semiconductors." This is an important contextual caveat.

---

## 8. Summary Verdicts

| Check | Result | Severity |
|:------|:-------|:---------|
| Which domain truly has the HIGHEST absolute concentration? | Agricultural Technology (32.8% in 2025) | Confirmed |
| Which domain(s) show sustained RISING concentration? | Semiconductors (primary); Autonomous Vehicles (mild) | Confirmed with qualification |
| Does "most concentrated" on any card specify which dimension? | Quantum card says "most concentrated" (level); Semiconductor card says "sustained consolidation" (trend); Ag-tech card says "declined from peak" (trend). No card explicitly distinguishes level from trend. | **GAP** |
| Is the "only domain" claim for semiconductors strictly true? | **Approximately true** but imprecise. AV also shows mild rising CR4. The semiconductor rise is not truly "sustained" from 1977; it began ~2010. | **MEDIUM** |
| Do cards create semantic collision? | **Yes.** Three different framing strategies (decline-from-peak, rising-trend, high-level) are used without a shared vocabulary for distinguishing absolute level from directional trend. | **MEDIUM** |

---

## 9. Recommended Actions

1. **Add a parenthetical to the semiconductor card** clarifying the trend period: "particularly since 2010" or "accelerating after 2010."
2. **Include semiconductors in the quantum computing "alongside" comparison** to avoid the misleading pair of quantum + ag-tech without mentioning the domain between them.
3. **Consider adding a cross-domain CR4 comparison chart** in the Deep Dive Overview that ranks all 12 domains by both latest-year CR4 and CR4 change over time, making the level-vs-trend distinction visual.
4. **Flag 2025 partial-year data** more prominently in CR4 charts for domains where the partial year shows unusual values (e.g., ag-tech jumping from 22.2% to 32.8%).
