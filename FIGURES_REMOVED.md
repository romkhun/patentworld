# Figures Removed — Stream 4 Deliverable

## Summary

5 figures removed across 4 chapters. Each met one or more of the removal criteria:
1. **No key takeaway** — caption restates axis labels
2. **Redundant** — same information in a better figure elsewhere
3. **Trivially obvious** — confirms something requiring no data to know
4. **Uninterpretable** — too complex or cluttered
5. **Insufficient data** — only 2–3 data points; better as a sentence

---

## Figures Removed

### 1. Chapter 9 (Patent Quality): Claims Per Patent Chart
- **Title**: "Average Claims Per Patent Have Increased from Approximately 9.5 to Approximately 17 Since the 1970s"
- **Type**: PWLineChart (avg and median claims per patent, 1976–2025)
- **Removal Reason**: **Redundant** — identical data and chart already presented in Chapter 1 ("The Innovation Landscape"), Chart 1.2. The claims growth narrative is preserved in the Chapter 9 executive summary text.
- **Section removed**: SectionDivider "Claims & Complexity" + ChartContainer + KeyInsight
- **Surrounding text impact**: Chapter 9 executive summary already mentions the 76% increase; no narrative gap created.

### 2. Chapter 9 (Patent Quality): Breakthrough Patent Rate Chart
- **Title**: "The Breakthrough Patent Rate Fluctuates Around 1%, with Variation Indicating Shifts in the Citation Distribution"
- **Type**: PWLineChart (% of patents in top 1% citation cohort, 1976–2020)
- **Removal Reason**: **No key takeaway / Trivially obvious** — by definition, the "top 1%" rate is approximately 1%. The chart's only variation is noise around a fixed threshold. The narrative text already acknowledged this circularity ("By definition, breakthrough patents represent the top 1%...consequently, the rate remains near 1%.").
- **Section removed**: SectionDivider "Breakthrough Inventions" + ChartContainer + KeyInsight
- **Surrounding text impact**: None; the concept of breakthrough patents is discussed in the forward citations section.

### 3. Chapter 7 (The Knowledge Network): Median Citation Lag Trend Chart
- **Title**: "Median Citation Lag Has Increased as Patents Reference an Expanding Body of Prior Art"
- **Type**: PWLineChart (median and avg citation lag in years, by year)
- **Removal Reason**: **Redundant** — essentially duplicates Chart 7.2 ("Citation Lag Has Lengthened as Patents Reference Increasingly Older Prior Art"), which already shows average and median lag with the same trend and insight. The sectoral breakdown chart (Chart 7.6, "Physics and Electricity Exhibit Shorter Citation Lags") was retained as it provides distinct analytical value.
- **Section removed**: SectionDivider "Citation Lag Analysis" + narrative + ChartContainer
- **Surrounding text impact**: The lag analysis narrative was absorbed into the preceding section; the sectoral chart now follows directly.

### 4. Chapter 8 (Innovation Dynamics): Claim Monsters Table
- **Title**: "Claim Monsters" (table of top 15 patents by claim count)
- **Type**: HTML table with patent ID, year, claims, tech area, assignee
- **Removal Reason**: **Insufficient data / No key takeaway** — anecdotal list of extreme examples with no aggregated insight. The phenomenon of claim-intensive patents is already discussed in the claims analysis charts above (Charts 8.9 and 8.10), which provide analytical context.
- **Section removed**: Conditional table rendering block + its preceding narrative
- **Surrounding text impact**: None; the chapter transition narrative remains.

### 5. Chapter 4 (The Inventors): Comeback Inventor Gap Distribution Chart
- **Title**: "Most Inventor Comebacks Occur After Gaps of 5–7 Years, Declining Sharply for Longer Absences"
- **Type**: PWBarChart (histogram of inventor comeback counts by gap duration)
- **Removal Reason**: **Trivially obvious** — the distribution showing that more comebacks occur at shorter gaps than longer gaps is self-evident. The stat cards immediately following the chart (total comeback inventors, % changed employer, % changed tech field, avg patents after return) provide the actionable, non-obvious findings about career transitions.
- **Section removed**: ChartContainer only (stat cards retained)
- **Surrounding text impact**: None; the narrative and stat cards remain.

---

## Figures Evaluated and Retained

The following figures were flagged during evaluation but retained after consideration:

| Figure | Chapter | Reason Retained |
|--------|---------|-----------------|
| Bridge Inventors Table | Ch 3 | Provides specific named examples supporting the mobility narrative |
| Solo-Inventor Trend (4.9) | Ch 4 | Distinct emphasis from team size chart (4.1); focuses on solo trajectory |
| Single-Patent Inventors (4.16) | Ch 4 | Complements first-time inventor analysis (4.10) with different metric |
| State Bar Chart (5.2) | Ch 5 | Complements choropleth map (5.1) with precise values and rankings |
| Grant Lag by Company (6.8) | Ch 6 | Provides company-level context not available in Ch 8 sector-level charts |
| Technology Citation Leaders Table (7.8) | Ch 7 | Reference data supporting chord diagram narrative |
| Design Patent Filers (8.8) | Ch 8 | Company detail not available in trend chart (8.7) |
| Backward Citations (9.3) | Ch 9 | Quality chapter context distinct from knowledge network chapter (7.1) |
| Sleeping Beauty Table | Ch 9 | Exemplifies the phenomenon discussed in narrative |
| Quality by Country (9.11) | Ch 9 | International quality comparison not available elsewhere |
| Self-Citation by Section Table | Ch 9 | Supports assignee-level chart with sectoral context |
| AI Share Chart (11.2) | Ch 11 | Clearer dedicated view vs. dual-axis in 11.1 |
| AI Team Size (11.10) | Ch 11 | Supports collaboration narrative with AI-specific data |
| AI Corporate Dominance (11.14) | Ch 11 | Provides assignee-type composition not available elsewhere |
| Top 50 Novel Patents Table | Ch 13 | Reference data supporting entropy analysis |

---

## Impact on Visualization Count

- **Before removal**: ~120+ charts/visualizations
- **After removal**: ~115+ charts/visualizations
- **Net reduction**: 5 figures
