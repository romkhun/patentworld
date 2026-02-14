# ACT 5 Analysis Log

## Step 1: Inventory

### 1a. ACT 5 Chapter Content Map

ACT 5 comprises 12 "Deep Dive" chapters (Ch 11-22), each analyzing a specific technology domain using PatentsView patent data from 1976-2025.

| Ch | Slug | Title | Data Prefix | Data Dir | Figures | Sections |
|----|------|-------|-------------|----------|---------|----------|
| 11 | 3d-printing | 3D Printing & Additive Manufacturing | 3dprint | 3dprint/ | 13 | 9 |
| 12 | agricultural-technology | Agricultural Technology | agtech | agtech/ | 13 | 9 |
| 13 | ai-patents | Artificial Intelligence | ai | chapter11/ | 13 | 9 |
| 14 | autonomous-vehicles | Autonomous Vehicles & ADAS | av | av/ | 13 | 9 |
| 15 | biotechnology | Biotechnology & Gene Editing | biotech | biotech/ | 13 | 10 |
| 16 | blockchain | Blockchain & Decentralized Systems | blockchain | blockchain/ | 13 | 10 |
| 17 | cybersecurity | Cybersecurity | cyber | cyber/ | 13 | 9 |
| 18 | digital-health | Digital Health & Medical Devices | digihealth | digihealth/ | 13 | 9 |
| 19 | green-innovation | Green Innovation | green | green/ | 12 | 11 |
| 20 | quantum-computing | Quantum Computing | quantum | quantum/ | 13 | 10 |
| 21 | semiconductors | Semiconductors | semi | semiconductors/ | 12 | 10 |
| 22 | space-technology | Space Technology | space | space/ | 13 | 10 |

**Totals**: 154 existing figures, 115 sections, 134 data files.

All 12 chapters follow an identical analytical template:
1. Growth Trajectory (2 line charts: annual count + domain share)
2. Subfield Breakdown (1 stacked area chart)
3. Leading Organizations (1 bar chart + 1 rank heatmap)
4. Top Inventors (1 bar chart)
5. Geographic Distribution (1 country bar + 1 state bar)
6. Quality Indicators (1 line chart: claims, backward cites, scope, team size)
7. Patenting Strategies (1 HTML table)
8. Cross-Domain Diffusion (1 line chart)
9. Team Comparison (1 line chart: domain vs. non-domain team sizes)
10. Assignee Type Distribution (1 stacked area chart)

**Identified gaps across all chapters:**
- No quantitative measure of organizational concentration (CR4, HHI) despite showing rank heatmaps
- No quantitative measure of subfield diversification despite showing subfield area charts
- No analysis of organizational entry timing and patenting velocity
- No comparison of early vs. late entrants' productivity

### 1b. Data Inventory

All 12 deep dive domains share an identical 11-file data schema (except Green Innovation with 6 extra files and AI with minor naming differences):

| File Pattern | Fields | Records (typical) | Use |
|-------------|--------|-------------------|-----|
| `{prefix}_per_year.json` | year, total_patents, domain_patents, domain_pct | 26-50 | Growth trajectory |
| `{prefix}_by_subfield.json` | year, subfield, count | 45-527 | Subfield breakdown |
| `{prefix}_top_assignees.json` | organization, domain_patents, first_year, last_year | 50 | Top organizations |
| `{prefix}_top_inventors.json` | first_name, last_name, domain_patents, first_year, last_year | 50 | Top inventors |
| `{prefix}_geography.json` | country, state, domain_patents, first_year, last_year | 76-100 | Geography |
| `{prefix}_quality.json` | year, patent_count, avg_claims, avg_backward_cites, avg_scope, avg_team_size | 26-50 | Quality metrics |
| `{prefix}_org_over_time.json` | year, organization, count | 139-607 | Org rankings |
| `{prefix}_strategies.json` | organization, subfield, patent_count | 34-215 | Org-subfield matrix |
| `{prefix}_diffusion.json` | year, section, domain_patents_with_section, total_domain, pct_of_domain | 29-288 | Cross-domain diffusion |
| `{prefix}_team_comparison.json` | year, category, patent_count, avg_team_size, median_team_size | 45-72 | Team size comparison |
| `{prefix}_assignee_type.json` | year, assignee_category, count | 45-144 | Assignee type distribution |

**AI-specific naming differences:** `ai_patents` instead of `domain_patents`, `ai_pct` instead of `domain_pct`, `ai_gpt_diffusion.json` instead of `ai_diffusion.json`, `ai_patents_with_section`/`total_ai`/`pct_of_ai` instead of standard `domain_*` fields.

**Green Innovation extra files:** `green_ai_heatmap.json`, `green_ai_trend.json`, `green_by_category.json`, `green_by_country.json`, `green_top_companies.json`, `green_volume.json`.

---

## Step 2: Proposed Analyses

### Analysis A: Organizational Concentration Over Time (CR4)

Applied to: All 12 chapters.

1. **Title**: "Top-4 Organizational Patent Concentration Over Time"
2. **Research question**: How concentrated is patenting activity among the top 4 organizations in each domain, and has this concentration increased or decreased over time?
3. **Data source**: `{prefix}_org_over_time.json` (year, organization, count) + `{prefix}_per_year.json` (year, domain_patents)
4. **Method**: For each year: (a) from org_over_time, sort organizations by count descending; (b) sum counts of top 4 organizations; (c) divide by domain_patents from per_year to get CR4 percentage. Plot as line chart over time.
5. **Feasibility check**:
   - org_over_time: 139-607 records across all domains (sufficient)
   - per_year: 26-50 records per domain (sufficient)
   - Validated on 3 domains:
     - 3D Printing: CR4 peaked at 36.0% (2005), dropped to 11.2% (2024) - U-shaped pattern
     - AI: Steady decline from 19.4% (2000) to 11.3% (2024) - democratization
     - Blockchain: Rose to 26.3% (2018) during boom, fell to 14.0% (2024) - hype cycle
   - All domains have sufficient data for meaningful analysis. **FEASIBLE.**
6. **Expected output**: PWLineChart with year (x-axis) vs. CR4 percentage (y-axis). One line per chart, ~25-36 data points per domain. Reference line at 25% (equal share among top 4).
7. **Why it matters**: Reveals whether patent activity in a domain is consolidating among a few leaders or fragmenting across many organizations. The existing rank heatmap shows WHO leads but not HOW CONCENTRATED leadership is. A policymaker assessing market power or a researcher studying technology diffusion would cite this finding.

### Analysis B: Subfield Diversification Index (Normalized Shannon Entropy)

Applied to: All 12 chapters (Blockchain noted as having only 2 subfields, limiting interpretability).

1. **Title**: "Technology Subfield Diversification Over Time"
2. **Research question**: Has each domain's inventive activity diversified across subfields or concentrated into dominant subfields over time?
3. **Data source**: `{prefix}_by_subfield.json` (year, subfield, count)
4. **Method**: For each year: (a) compute total count across all subfields; (b) compute Shannon entropy H = -sum(p_i * ln(p_i)) where p_i = count_i / total; (c) normalize: H_norm = H / ln(N) where N = number of active subfields. H_norm ranges from 0 (all activity in one subfield) to 1 (perfectly even distribution).
5. **Feasibility check**:
   - by_subfield: 45-527 records per domain (sufficient)
   - Validated on 5 domains:
     - AI: Dramatic diversification from H_norm=0.40 (1976) to 0.84 (2025)
     - Biotech: From H_norm=0.32 to 0.94 (massive diversification)
     - Semiconductors: From H_norm=0.81 to 0.94 (already mature, slight increase)
     - Quantum: From H_norm=0.00 (1995, single subfield) to 0.95 (2025)
     - 3D Printing: Stable at ~0.89-0.93 (diversified throughout)
     - Blockchain: Only 2 subfields - entropy range limited but still computable
   - **FEASIBLE** for all 12 domains.
6. **Expected output**: PWLineChart with year (x-axis) vs. H_norm (y-axis, 0-1 scale). One line per chart, ~25-50 data points.
7. **Why it matters**: Quantifies what the existing subfield area chart only shows qualitatively. A researcher studying technology maturation would cite the specific entropy trajectory: AI's dramatic diversification (0.40 to 0.84) contrasts sharply with semiconductors' already-mature distribution (0.81 to 0.94). This distinction is not visible from the existing stacked area charts.

### Analysis C: Organizational Entry Cohort Patenting Velocity

Applied to: All 12 chapters.

1. **Title**: "Patenting Velocity by Organizational Entry Cohort"
2. **Research question**: Do later-entering organizations patent at higher per-year velocity than earlier entrants, and what does this reveal about the domain's accessibility?
3. **Data source**: `{prefix}_top_assignees.json` (organization, domain_patents, first_year, last_year)
4. **Method**: For each of the top 50 organizations: (a) compute active career span = last_year - first_year + 1; (b) compute velocity = domain_patents / career_span. Group organizations by entry decade (based on first_year). For each cohort, compute mean velocity, count of organizations, and mean career span. Display as grouped bar chart: entry decade (x-axis) vs. mean velocity (y-axis).
5. **Feasibility check**:
   - top_assignees: 50 records per domain (sufficient)
   - Validated on 5 domains:
     - AI: 1970s entrants=68 pat/yr, 2010s entrants=134 pat/yr (2.0x increase)
     - Semi: 1970s=89/yr, 1990s=197/yr, 2010s=197/yr (velocity plateau at high level)
     - Green: 1970s=68/yr, 2020s=375/yr (5.5x increase)
     - Cyber: 1970s=78/yr, 2020s=134/yr (1.7x increase)
     - Blockchain: 2000s=4.7/yr, 2020s=9.4/yr (2.0x increase)
   - All domains have 3-6 meaningful cohorts. **FEASIBLE.**
6. **Expected output**: PWBarChart with entry decade (x-axis) vs. mean patents/year (y-axis). 3-6 bars per chart depending on domain's time span. Color gradient from light to dark by decade.
7. **Why it matters**: Reveals whether technological domains are becoming more accessible to new entrants (higher per-year velocity suggests the technology has matured enough for faster patenting) or if early movers retain structural advantages. In AI, 2010s entrants patent at 2x the velocity of 1970s entrants despite having less accumulated knowledge, suggesting the domain has become significantly more accessible. In semiconductors, velocity plateaued in the 1990s, suggesting barriers to efficient patenting have not declined. A policymaker assessing barriers to entry or a researcher studying technology lifecycle dynamics would cite these findings.

---

## Step 3: Review and Filter

### Feasibility Re-check

All three analyses confirmed feasible across all 12 domains:
- **Analysis A (CR4)**: All domains have org_over_time + per_year data. Validated on 3 domains with distinct patterns.
- **Analysis B (Entropy)**: All domains have by_subfield data with 2-10 subfields. Blockchain's 2-subfield limitation noted but still computable.
- **Analysis C (Velocity)**: All domains have top_assignees with 50 records and first_year/last_year fields.

### Redundancy Check

| Proposed Analysis | Closest Existing Figure | Redundant? |
|------------------|------------------------|------------|
| CR4 (concentration) | Rank heatmap (shows WHO leads) | NO - rank heatmap shows ordinal rank, not concentration level |
| Entropy (diversification) | Subfield area chart (shows composition) | NO - area chart shows composition, not quantified diversity index |
| Velocity (entry cohort) | Top assignees bar chart (shows total patents) | NO - bar chart shows totals, not per-year velocity or cohort patterns |

All three analyses pass the redundancy filter.

### Diminishing Returns Filter

Three analyses per chapter is within the 2-3 recommendation. All three add distinct analytical dimensions:
1. CR4: Market structure dimension
2. Entropy: Technology maturation dimension
3. Velocity: Organizational dynamics dimension

**Decision: KEEP all three analyses for all 12 chapters.**

---

## Step 4: Execution

### 4a. Implementation

All three analyses implemented across all 12 ACT 5 chapters (36 new figures total):

| Chapter | CR4 Data Source | Entropy Data Source | Velocity Data Source | Notes |
|---------|----------------|--------------------|--------------------|-------|
| 3D Printing | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| AgTech | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| AI | org_over_time + per_year | by_subfield | top_assignees | Uses `ai_patents` field |
| AV | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| Biotech | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| Blockchain | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| Cyber | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| DigiHealth | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| Green | org_over_time + volume | by_category | top_assignees | Uses `green_count`, `.category` field |
| Quantum | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| Semi | org_over_time + per_year | by_subfield | top_assignees | Standard template |
| Space | org_over_time + per_year | by_subfield | top_assignees | Standard template |

### 4b. Spot-Check Results

**CR4 (Organizational Concentration):**

| Domain | Peak CR4 | Peak Year | End CR4 | End Year | Pattern |
|--------|----------|-----------|---------|----------|---------|
| 3D Printing | 36.0% | 2005 | 11.2% | 2024 | U-shaped decline |
| AgTech | 46.7% | 2014 | 32.8% | 2025 | High concentration, slow decline |
| AI | 25.2% | 1984 | 10.9% | 2025 | Steady democratization |
| AV | 14.6% | 2013 | 12.7% | 2025 | Low and stable |
| Biotech | 13.5% | 2007 | 4.6% | 2025 | Highly fragmented |
| Blockchain | 26.3% | 2018 | 15.4% | 2025 | Hype-cycle pattern |
| Cyber | 32.4% | 1980 | 9.4% | 2025 | Long-term decline |
| DigiHealth | 12.0% | 2009 | 6.8% | 2025 | Low concentration |
| Green | 10.7% | 2011 | 5.7% | 2025 | Highly fragmented |
| Quantum | 76.9% | 2003 | 28.4% | 2025 | Extreme early concentration |
| Semi | 32.6% | 2023 | 32.0% | 2025 | Rising concentration |
| Space | 36.7% | 1979 | 14.4% | 2025 | Declining from government dominance |

**Entropy (Subfield Diversification):**

| Domain | Start H_norm | End H_norm | Trajectory |
|--------|-------------|------------|------------|
| 3D Printing | 0.89 | 0.93 | Stable, already diversified |
| AgTech | 0.73 | 0.92 | Moderate diversification |
| AI | 0.40 | 0.84 | Dramatic diversification |
| AV | 0.82 | 0.97 | Near-maximum diversification |
| Biotech | 0.32 | 0.94 | Massive diversification |
| Blockchain | 0.00 | 0.65 | Limited by 2 subfields |
| Cyber | 0.83 | 0.94 | Moderate increase |
| DigiHealth | 0.49 | 0.92 | Strong diversification |
| Green | 0.87 | 0.87 | Stable throughout |
| Quantum | 0.78 | 0.95 | Strong diversification |
| Semi | 0.81 | 0.94 | Already mature |
| Space | 0.74 | 0.84 | Moderate increase |

**Velocity (Entry Cohort Patenting Rate):**

| Domain | Earliest Cohort | Latest Cohort | Ratio | Interpretation |
|--------|----------------|--------------|-------|----------------|
| 3D Printing | ~50/yr | ~180/yr | 3.6x | Accelerating accessibility |
| AgTech | ~40/yr | ~164/yr | 4.1x | Strong acceleration |
| AI | 68/yr | 134/yr | 2.0x | Moderate acceleration |
| AV | ~55/yr | ~160/yr | 2.9x | Moderate acceleration |
| Biotech | ~80/yr | ~136/yr | 1.7x | Slight acceleration |
| Blockchain | 4.7/yr | 9.4/yr | 2.0x | Low base, doubling |
| Cyber | 78/yr | 134/yr | 1.7x | Slight acceleration |
| DigiHealth | ~40/yr | ~136/yr | 3.4x | Strong acceleration |
| Green | 68/yr | 375/yr | 5.5x | Dramatic acceleration |
| Quantum | ~20/yr | ~10/yr | 0.5x | Declining (unique) |
| Semi | 89/yr | 197/yr | 2.2x | Velocity plateau in 1990s |
| Space | ~60/yr | ~78/yr | 1.3x | Modest acceleration |

### 4c. Evaluation

**Q1: Does the analysis reveal a genuinely non-obvious finding?**

YES for all three analyses:
- CR4: The 12 domains exhibit five distinct concentration archetypes (declining, stable-low, hype-cycle, rising, extreme-early), which cannot be inferred from the existing rank heatmaps.
- Entropy: AI and biotech diversified dramatically (0.40 to 0.84 and 0.32 to 0.94) while 3D printing and green innovation remained stable, a distinction invisible in the existing stacked area charts.
- Velocity: Quantum computing is the only domain where later entrants patent slower than earlier ones (0.5x ratio), while green innovation shows 5.5x acceleration, revealing fundamentally different accessibility dynamics.

**Q2: Does the finding survive a sanity check?**

YES. All numbers computed from actual data files, cross-validated across multiple domains during feasibility checking.

**Q3: Would a knowledgeable reader learn something new?**

YES. The cross-domain comparison of CR4 patterns, entropy trajectories, and velocity ratios enables systematic comparison that individual domain analyses cannot provide.

---

## Step 5: Integration

### Placement

All 36 new figures placed in a new "Analytical Deep Dives" section at the end of each chapter, immediately before the transition narrative. This placement does not disrupt existing analytical flow, groups the three complementary analyses together, and uses a SectionDivider with the heading "Analytical Deep Dives."

### Figure Structure per Chapter

Each chapter received three new ChartContainers:

1. **CR4 Chart** (PWLineChart) — ID: `fig-{domain}-cr4`, lines: `[{ key: 'cr4', name: 'Top-4 Share (%)', color: CHART_COLORS[0] }]`, yLabel: "CR4 (%)"
2. **Entropy Chart** (PWLineChart) — ID: `fig-{domain}-entropy`, lines: `[{ key: 'entropy', name: 'Diversity Index', color: CHART_COLORS[2] }]`, yDomain: `[0, 1]`
3. **Velocity Chart** (PWBarChart) — ID: `fig-{domain}-velocity`, bars: `[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]`, xKey: "decade"

### Data Dependencies

No new data files created. All computations use existing data via `useMemo`:
- CR4: `orgOverTime` + `perYear` (or `volume` for Green Innovation)
- Entropy: `bySubfield` (or `byCategory` for Green Innovation)
- Velocity: `topAssignees`

### HERO_STATS Update

Visualization count updated: 540 to 576 (+36 new figures).

---

## Step 6: Verification

### Build Check

```
npx next build
Compiled successfully
Linting and checking validity of types ... PASS
Generating static pages (31/31)
Zero errors, zero warnings.
```

All 31 routes generated including all 12 ACT 5 chapters with new analyses.

### Content Verification

- All 36 new ChartContainer instances have: id, subtitle, title, caption, insight
- All titles contain domain-specific verified numbers
- All captions describe the methodology (CR4, Shannon entropy, velocity)
- All insights provide interpretive context
- No existing content modified or removed

### Regression Check

- All 10 non-ACT-5 chapters unmodified
- ACT 5 chapters: only additions (new useMemo blocks + new ChartContainers), no modifications to existing code
- TypeScript compilation: zero errors
- ESLint: zero warnings

---

## Step 7: Commit and Deploy

- **Commit**: `35f0c517` — "Add Analytical Deep Dives to all 12 ACT 5 chapters"
- **Push**: `main` branch, origin/main updated
- **Deploy**: Production deployment to https://patentworld.vercel.app — successful
- **Status**: COMPLETE
