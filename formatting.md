# PatentWorld — Comprehensive Audit, Company-Level Analysis, and Site-Wide Polish

## Context

PatentWorld is a Next.js site deployed on Vercel at https://patentworld.vercel.app/ that analyzes 50 years of US patent data (9.36M patents, 1976–2025) sourced from [PatentsView](https://patentsview.org). The site is authored by **Saerom (Ronnie) Lee, Assistant Professor of Management, The Wharton School, University of Pennsylvania**. His research focuses on organizational design, human capital, startup scaling, and high-growth entrepreneurship.

**Tech stack**: Next.js, React, D3.js / Recharts (confirm by inspecting `package.json`), Tailwind CSS, static JSON/CSV data files.

**Before writing any code**: Read the full codebase — `package.json`, component structure, data pipeline, chart library, color palette, styling conventions, and every chapter page — to understand existing patterns. All new work must follow these conventions exactly.

---

## Execution Order

Execute these work streams in the following sequence. Each depends on the previous being complete.

```
STREAM 1: Codebase Inventory & Bug Fixes         ← Establish a clean, working baseline
    ↓
STREAM 2: Accuracy Audit                         ← Fix all factual errors before rewriting text
    ↓
STREAM 3: Academic Tone Rewrite                   ← Rewrite all text to formal academic register
    ↓
STREAM 4: Company-Level Analysis (new content)    ← Add substantial new analyses
    ↓
STREAM 5: Chapter & Section Reorganization        ← Reorder everything for logical narrative flow
    ↓
STREAM 6: Visualization Improvements             ← Polish all charts (including new ones from Stream 4)
    ↓
STREAM 7: SEO & GenAI Optimization               ← Add meta tags, structured data, TL;DRs (after final content)
    ↓
STREAM 8: Performance Optimization               ← Optimize last, after all content is finalized
```

---

## STREAM 1: Codebase Inventory & Bug Fixes

### 1.1 Build & Compilation

1. Run `npm run build` (or the project's build command). Fix **every** error and warning:
   - TypeScript errors
   - ESLint warnings and errors
   - Next.js build warnings (missing `key` props, unused imports, missing alt text, deprecated APIs)
   - Deprecation warnings from any dependency
2. The build must complete with **zero errors and zero warnings**. Repeat until clean.

### 1.2 Runtime & Console Errors

For every page on the site (home, all 11 chapters, about, explore), open in a browser environment and check for:
- JavaScript runtime errors
- Failed network requests (404s, 500s for data files, images, fonts)
- React warnings (missing keys, state updates on unmounted components, hydration mismatches)
- Rendering errors (charts failing to render, empty containers, loading spinners that never resolve)

Fix every error. Add null guards, defensive checks, and fallback states where data may be missing or malformed.

### 1.3 Navigation & Links

1. Verify every link on every page:
   - All chapter links on the home page point to the correct chapter and work.
   - All "Previous Chapter / Next Chapter" links at chapter bottoms work and point correctly.
   - Navigation links (logo/home, Explore, About) all work.
   - All external links (PatentsView, mailto:saeroms@upenn.edu, www.saeromlee.com) work and open in new tabs.
   - No broken links (404 destinations) anywhere.
2. Verify the home page hero counters animate correctly:
   - "9.36M Patents" — confirm this matches the actual data total.
   - "50 Years" — confirm the data spans 1976–2025 (49 full years of grants; if the site rounds to 50, that is acceptable if stated as "approximately 50 years" or "spanning 1976–2025").
   - Chapter count — must match the actual number of chapter pages.
   - Visualization count — must match the actual number of charts/figures across all chapters.

### 1.4 Visual & Layout Bugs

Check every page at 375px (mobile), 768px (tablet), and 1440px (desktop) for:
- Overlapping text or elements
- Charts overflowing their containers or having horizontal scroll
- Text truncation or cutoff
- Legends or labels overlapping chart data
- Tooltips that overflow the viewport
- Navigation menu issues on mobile (doesn't open, doesn't close, overlaps content)
- Any page element causing unwanted horizontal scroll on mobile

Fix all issues found.

### 1.5 Data Integrity

For every chart:
- Confirm the chart renders with actual data (no empty charts, no NaN/undefined/Infinity values).
- Confirm the year range matches expectations (1976–2025, not ending early or starting late).
- Confirm obvious trends make sense (patent volume generally increasing over the full period; no sudden drops to zero in non-final years).
- Spot-check 3 specific data points per chapter by computing them from the raw data files.

### 1.6 Deliverable

Create `BUGFIX_LOG.md` in the project root documenting every bug found and fix applied.

---

## STREAM 2: Accuracy Audit of All Takeaways, Captions & Descriptions

### 2.1 Instructions

Systematically review **every** piece of text on the site that makes a factual claim — chapter narratives, chart titles, chart annotations/captions, key findings boxes, summary statistics, hero stats, and the About page — and verify each claim against the actual underlying data files.

### 2.2 Process

For each chapter page:

1. **Extract every factual claim** — any sentence referencing a number, trend, ranking, comparison, date, percentage, or named entity (e.g., "IBM has the most patents", "patenting grew 5x", "the top technology area is computing").
2. **Cross-reference against the data.** Locate the relevant JSON/CSV data file, load it, and compute the actual value. Compare the claim to the computed value.
3. **Classify each claim**:
   - **WRONG**: The stated number, ranking, or trend is factually incorrect given the data. **Must be fixed immediately.**
   - **STALE**: The number was likely correct for an earlier data snapshot but does not match the current data files. **Must be updated.**
   - **IMPRECISE**: The claim is directionally correct but uses vague language where specific figures would be more informative and authoritative (e.g., "grew significantly" when the data shows 4.7x). **Replace with specific numbers.**
   - **UNSUPPORTED**: The claim makes a causal or interpretive leap not directly supported by the data (e.g., "this was caused by..." when the data only shows correlation). **Add qualifying language** ("suggesting," "consistent with," "coinciding with").
   - **OK**: Accurate and well-supported.

4. **Fix all WRONG and STALE items** in the source files. For IMPRECISE items, substitute specific figures. For UNSUPPORTED items, add qualifiers.

### 2.3 Specific Items to Verify

**Home page**:
- "9.36M Patents" — recount from the data.
- "50 Years" — verify the actual year range in the data.
- Chapter count and visualization count — count the actual pages and charts.

**All chapters — verify these categories of claims**:
- All rankings ("the largest," "the most prolific," "the top technology area") — re-rank from the data.
- All trend claims ("has increased since," "declined after," "peaked in") — verify direction, timing, and magnitude.
- All specific numbers (patent counts, percentages, growth rates, team sizes) — recompute from data files.
- All historical event correlations ("the 2008 recession caused a dip," "the AIA led to...") — verify the data actually shows the described pattern at the described time. If a claimed dip or inflection does not appear, remove or qualify.

**Patent Law & Policy chapter** — verify all legislative and case-law references against these known dates:
- Bayh-Dole Act: 1980
- Federal Courts Improvement Act (created CAFC): 1982
- Hatch-Waxman Act: 1984
- Uruguay Round Agreements Act / TRIPS: 1994 (effective 1995; changed patent term to 20 years from filing date)
- American Inventors Protection Act: 1999
- eBay v. MercExchange: 2006
- KSR v. Teleflex: 2007
- Bilski v. Kappos: 2010
- America Invents Act (AIA): Enacted September 2011; major provisions effective 2012–2013
- Mayo Collaborative Services v. Prometheus Laboratories: 2012
- Association for Molecular Pathology v. Myriad Genetics: 2013
- Alice Corp. v. CLS Bank International: 2014
- TC Heartland v. Kraft Foods: 2017
- Arthrex v. United States: 2021

### 2.4 Deliverable

Create `ACCURACY_AUDIT.md` in the project root documenting every claim checked, its status, the correct value, and the fix applied.

---

## STREAM 3: Academic Tone Rewrite

### 3.1 Objective

Rewrite **all** narrative text, chapter introductions, section headings, chart captions, annotations, key findings boxes, and the About page in a **formal, academic, professional register** befitting a publication by a Wharton School professor. The current text may contain informal, colloquial, or conversational phrasing. Every sentence must be rewritten to meet the standards below.

### 3.2 Tone Standards

**DO use:**
- Third-person perspective ("The data reveal..." not "We see..." or "You'll notice...").
- Formal academic vocabulary ("demonstrates," "exhibits," "indicates," "suggests," "constitutes," "comprises," "warrants examination").
- Precise, hedged claims with appropriate epistemological qualifiers ("suggests," "is consistent with," "appears to," "this pattern may reflect").
- Passive constructions where appropriate to maintain objectivity ("Patents were classified by..." rather than "We classified patents by...").
- Complete, well-structured sentences — no fragments, no rhetorical questions used as headers (see exceptions below).
- Formal transitional phrases ("Furthermore," "By contrast," "Notably," "This finding is consistent with..." — not "Also," "But," "Interestingly," "What's more").

**DO NOT use any of the following**:
- Colloquial or informal expressions: "a lot," "tons of," "huge," "game-changer," "skyrocketed," "exploded," "took off," "ramped up," "the lion's share," "the elephant in the room," "a sea change," "a mixed bag," "the big picture," "bottom line," "at the end of the day," "a whole new ballgame," "no surprise," "it turns out," "the real story," "shaking up," "doubling down," "plays a key role," "it's worth noting," "arguably"
- Journalistic or marketing language: "revolutionary," "groundbreaking," "unprecedented" (unless literally true and supported), "stunning," "remarkable," "dramatic" (overused — replace with specific magnitudes), "game-changing," "cutting-edge"
- Conversational filler: "So," "Now," "Let's look at," "Here's the thing," "What does this mean?", "The takeaway is," "Think of it as," "In other words"
- Contractions: "don't" → "do not," "it's" → "it is," "hasn't" → "has not"
- Second-person address: "you" or "your" (replace with "the reader," "one," or passive constructions, or simply remove)
- First-person plural as informal shorthand: "Let's dive in," "We can see that," "As we mentioned" (replace with "As noted in Chapter X," "The preceding analysis demonstrated," etc.)
- Exclamation marks
- Emojis or decorative characters
- Rhetorical questions used merely for effect (e.g., "But does more mean better?" — rewrite as "Whether increased volume corresponds to improved quality remains an open question."). Note: Rhetorical questions are acceptable as **chapter or section titles only** (e.g., "Who Innovates?" as a chapter title is appropriate).
- Clichés: "tip of the iceberg," "a perfect storm," "double-edged sword," "silver bullet," "a wake-up call," "paradigm shift" (unless used in its precise Kuhnian sense)

### 3.3 Specific Rewriting Patterns

| Informal / Colloquial | Academic / Formal Replacement |
|---|---|
| "Patent numbers skyrocketed after 2000" | "Patent grant volumes increased substantially following 2000, rising from X to Y" |
| "IBM is the undisputed king of patents" | "IBM has maintained the largest patent portfolio among all assignees throughout the study period" |
| "China has been catching up fast" | "China-origin patents have exhibited rapid growth, with the share of patents listing Chinese inventors increasing from X% in 2000 to Y% by 2025" |
| "The gender gap is still huge" | "A pronounced gender disparity persists, with female inventors representing only X% of all listed inventors as of 2025" |
| "Things really changed after Alice" | "The Alice Corp. v. CLS Bank International (2014) decision introduced a more stringent test for patent-eligible subject matter under 35 U.S.C. § 101, resulting in a measurable decline in software patent grant rates" |
| "Team sizes have blown up" | "Average team size per patent has increased from X inventors in 1976 to Y inventors by 2025" |
| "The data tells an interesting story" | [Delete. Replace with the actual finding.] |
| "Let's take a closer look" | [Delete. Simply present the analysis.] |
| "It's no secret that..." | [Delete. State the fact directly.] |
| "Not surprisingly, ..." | [Delete. State the fact directly, or use "Consistent with prior literature, ..."] |

### 3.4 Section and Chart Title Standards

- **Chapter titles**: May use rhetorical questions sparingly ("Who Innovates?") but should generally be descriptive.
- **Section headings**: Should be descriptive noun phrases or declarative statements, not questions or exclamations. E.g., "Growth in Patent Volume, 1976–2025" not "How Many Patents Are We Talking About?"
- **Chart titles**: Should be **insight-oriented declarative sentences** with specific data. E.g., "Annual Patent Grants Increased Five-Fold Between 1976 and 2025" not "Patents Over Time."
- **Chart captions/annotations**: Must be complete sentences in formal register. Every caption must (a) describe what the chart shows, (b) identify the most important pattern, and (c) provide the specific numbers supporting that pattern.

### 3.5 About Page

Rewrite the About page to follow academic conventions:
- **Author bio**: Third-person, listing institutional affiliation, research areas, and a link to the author's faculty page (www.saeromlee.com). Do not use casual language. Example: "Saerom (Ronnie) Lee is an Assistant Professor of Management at The Wharton School, University of Pennsylvania. His research examines organizational design, human capital allocation, and the scaling of high-growth ventures."
- **Methodology section**: Describe the data source (PatentsView), the scope of analysis (all USPTO-granted patents 1976–2025), the key tables used, and any data processing decisions (e.g., how design patents are handled, how inventor disambiguation is used). Write as you would for a working paper's data section.
- **Citation**: Provide a suggested citation format for the site: "Lee, Saerom (Ronnie). 2025. 'PatentWorld: 50 Years of US Patent Innovation.' The Wharton School, University of Pennsylvania. Available at: https://patentworld.vercel.app/"

### 3.6 Process

1. Read every text element on every page.
2. Flag every instance of informal, colloquial, or non-academic language.
3. Rewrite every flagged instance following the standards above.
4. Re-read all rewritten text to ensure it flows naturally — formal does not mean stilted or overwrought. Aim for the register of a top-tier management or economics journal (e.g., *Management Science*, *American Economic Review*, *Research Policy*).
5. Ensure all rewritten chart captions still accurately describe the chart's content.

### 3.7 Deliverable

All text changes applied directly to source files. Create `TONE_AUDIT.md` listing every substantive rewrite made.

---

## STREAM 4: Company-Level Analyses (New Content)

### 4.1 Overview

Add substantial company-level analytical depth to the site. This is the most important new content addition. The existing "Who Innovates?" chapter discusses assignees at a surface level (rankings, totals). The new content should transform this into a rigorous longitudinal analysis of corporate innovation strategy.

All heavy computation must be **precomputed in Python/Node scripts** and stored as static JSON files. No heavy computation in the browser. All new visualizations must use the existing chart library and styling conventions.

### 4.2 New Analyses to Add

**Add the following analyses. If the data to support them already exists in the project's data files, use it. If new data must be precomputed, write the preprocessing script and document it. If the existing PatentsView data files in the project do not contain sufficient information for a given analysis, skip that analysis and note it in the deliverable log rather than inventing data.**

#### 4.2.1 Innovation Trajectory Profiles (add to Who Innovates? or new Company Profiles chapter)

For each of the top 50 assignees by total patent count, compute and display the following metrics per year:
- Patent grant count
- Number of unique CPC subclasses (technology breadth)
- Number of unique inventors
- Average team size per patent
- Median forward citations (5-year window), if citation data permits
- Share of self-citations, if computable

**Visualization**: An interactive company selector (dropdown with search) that displays synchronized time-series panels for the selected company: annual patent volume (bar chart), technology breadth (line chart), and team size (line chart), all sharing the same x-axis (year). If data supports it, add a stacked area of CPC section distribution showing how the company's technology mix has shifted.

**Caption template** (adapt per company with actual data): "IBM's annual patent output peaked at [X] grants in [year], with its technology portfolio spanning [Y] distinct CPC subclasses. Average team size increased from [A] inventors per patent in the 1980s to [B] by the 2020s, reflecting a broader industry trend toward collaborative invention."

#### 4.2.2 Rise, Peak, and Decline — Trajectory Archetypes

For the top 100–200 assignees, normalize each company's annual patent count as a percentage of its own peak year (0–100%). Cluster the resulting time series (using k-means or a simpler heuristic) into trajectory archetypes:
- **Sustained grower**: Near-monotonically rising (e.g., Samsung, TSMC)
- **Peak and plateau**: Rapid growth then leveling (e.g., Microsoft)
- **Peak and decline**: Rose then fell substantially (e.g., Kodak, Motorola)
- **Rebounder**: Declined then recovered (e.g., Apple)
- **Steady state**: Relatively flat output over decades (e.g., 3M, Procter & Gamble)
- **Late bloomer**: Minimal early activity then rapid growth (e.g., Huawei, BOE Technology)

**Visualization**: A gallery showing the 6 archetype categories. Each card displays the archetype name, a representative silhouette curve, and the number of companies classified into it. An expanded view overlays the normalized curves for all companies in the selected archetype.

**Caption**: "Among the 100 largest patent filers of the 1990s, [X] have subsequently declined below 50 percent of their peak annual output. The most prevalent trajectory archetype is [type], indicating that most firms reach a natural innovation ceiling rather than experiencing abrupt decline."

#### 4.2.3 Corporate Innovation Mortality

For every company that ranked among the top 50 assignees in any given decade (1976–1985, 1986–1995, 1996–2005, 2006–2015, 2016–2025), track whether they retained that position in subsequent decades.

Compute:
- Decade-over-decade survival rate in the top 50
- Median tenure (in decades) in the top 50 before exiting
- Number of new entrants per decade
- The short list of companies continuously in the top 50 across all five decades

**Visualization**: A bump chart (or animated rank chart) showing rank positions of the top 50 companies across the five decades. Highlight new entrants (green) and departures (red). If animation is complex, a static small-multiples version showing each decade's top 20 side by side is acceptable.

**Caption**: "Only [X] companies have remained among the 50 most prolific patent filers across all five decades since 1976. The median tenure in the top 50 is [Y] decades. The 2010s exhibited the highest rate of turnover, with [Z] new entrants — predominantly firms headquartered in East Asia — displacing established American and Japanese assignees."

#### 4.2.4 Technology Portfolio Diversification

For each of the top 30 assignees, compute a diversification index (Shannon entropy across CPC sections) per year.

**Visualization**: Small multiples of entropy over time for the top 20 companies. Supplement with a scatter plot: x-axis = diversification (entropy), y-axis = average citation quality, each dot = one company.

**Caption**: "Samsung and LG exhibit the highest portfolio diversification among top assignees, spanning electronics, semiconductors, chemicals, and display technology. Pharmaceutical firms such as Pfizer and Merck maintain highly focused portfolios concentrated in a single CPC section. No clear linear relationship between diversification and citation-based quality is observed."

#### 4.2.5 Technology Pivot Detection

For the top 50 assignees, compute the CPC section distribution (share vector) for rolling 3-year windows. Compute the Jensen-Shannon divergence between consecutive windows. Flag windows where JSD exceeds the company's 95th-percentile divergence score — these represent technology pivots.

**Visualization**: For the 10–15 companies with the most prominent detected pivots, show a stacked area chart of CPC section distribution over time, with vertical dashed lines at pivot points. Include a tooltip at each pivot listing the CPC categories that gained and lost share.

**Caption example**: "Amazon's most pronounced technology pivot occurred between 2012 and 2016, during which cloud computing and machine learning classifications grew from [X]% to [Y]% of the firm's annual filings, while e-commerce and logistics classifications declined from [A]% to [B]%. This shift coincides with the period in which Amazon Web Services became the company's primary source of operating income."

#### 4.2.6 Corporate Citation Network

Build a directed citation flow network between the top 30 companies: when Company A's patent cites Company B's patent, record a knowledge flow from B to A.

Compute:
- Total citation flows between all pairs
- Net citation balance per company (net citations received minus net citations given)
- The most asymmetric pairs (one side cites the other far more than the reverse)

**Visualization**: A chord diagram or an adjacency matrix heatmap showing citation flows among the top 20 companies. Color by net direction. Include a table of the top 10 most asymmetric citation pairs.

**Caption**: "IBM is the largest net exporter of cited knowledge in the US patent system — its patents are cited by other major assignees substantially more frequently than it cites theirs. Samsung and Apple exhibit a notably asymmetric citation relationship: Samsung cites Apple patents [X] times more frequently than the reverse, despite Samsung's larger overall portfolio."

#### 4.2.7 Talent Flow Network

Using disambiguated inventor IDs, track when an inventor's patents appear under different assignees over time. When an inventor's assignee changes between consecutive patents (with a gap of no more than 5 years), record a talent flow from the old assignee to the new one.

**Visualization**: A Sankey diagram or flow matrix of the top 30 companies, with flow width proportional to the number of inventors who moved. Alternatively, a bar chart of top 30 companies sorted by net talent flow (positive = net importer, negative = net exporter).

**Caption**: "Google is the largest net importer of inventor talent from other top-50 firms. The most active bilateral talent exchange occurs between [Company A] and [Company B], with [Y] inventors moving between them over the study period. Inventors who move between firms produce patents with [higher/comparable/lower] average forward citation counts relative to their pre-move output."

#### 4.2.8 Defensive vs. Offensive Patent Strategy Profiles

For each of the top 20 assignees, compute normalized (0–100) scores on the following dimensions:
1. **Breadth**: Shannon entropy across CPC sections
2. **Defensiveness**: Self-citation rate × average continuation family size × average claim count (normalized)
3. **Influence**: Average forward citations received from other assignees (excluding self-citations)
4. **Science intensity**: Average non-patent literature (NPL) citation count per patent, if `g_other_reference` data is available
5. **Speed**: Inverse of median grant lag
6. **Collaboration**: Average co-inventor team size

**Visualization**: Radar/spider chart for the top 10 companies, with a selector to compare 2–3 companies side by side.

**Caption**: "Samsung and IBM exhibit the most defense-oriented profiles, characterized by elevated self-citation rates and large continuation families. University assignees such as MIT and Stanford demonstrate the most science-intensive profiles, with non-patent literature citation rates exceeding [Z] references per patent."

#### 4.2.9 Design Patent Ecosystem

Separate design patents from utility patents using the `patent_type` field. Track design patent volume alongside utility patents over time. Identify the top 20 design patent filers.

**Visualization**: Dual-axis chart — utility patents (bars, left axis) and design patents (line, right axis) over time. Supplementary horizontal bar chart of top 20 design patent assignees.

**Caption**: "Design patent grants increased from approximately [X] per year in 1976 to over [Y] per year by 2024, with their share of total grants rising from [A]% to [B]%. Apple, Samsung, and Nike rank among the most prolific design patent filers, reflecting the increasing strategic importance of product aesthetics and user-interface design."

#### 4.2.10 The Claims Economy

Using the `num_claims` field, track median and 90th-percentile claim counts per patent over time. Break down by CPC section.

**Visualization**: Line chart of median and 90th-percentile claims over time. Heatmap of median claims by CPC section × decade.

**Caption**: "The median US patent contained [X] claims in 1980; by 2024 this figure had risen to [Y], representing a [Z]-fold increase. This trend reflects the professionalization of patent prosecution and the increasing use of broad claim structures for defensive purposes. Software and business-method patents exhibit the highest median claim counts at [W] claims per patent."

### 4.3 Implementation Notes

- **Data availability**: Before implementing each analysis, verify the required data fields exist in the project's data files. If the data does not support a particular analysis, note this in the deliverable and skip to the next.
- **Company name mapping**: Create a `company_name_mapping.json` that maps PatentsView's raw disambiguated assignee names to clean display names (e.g., "INTERNATIONAL BUSINESS MACHINES CORPORATION" → "IBM"). Reuse this mapping across all company-level analyses.
- **Preprocessing scripts**: Write Python or Node scripts for any heavy computation. Store outputs as static JSON in the project's data directory. Document each script's inputs, outputs, and purpose.
- **Chart library**: Use the same chart library and styling conventions as the existing chapters. Match the existing color palette, tooltip style, and responsive behavior.
- **Placement**: Company-level analyses may be added as new sections within the existing "Who Innovates?" chapter, or organized as a new dedicated chapter ("Company Innovation Profiles") if the content volume warrants it. Use your judgment based on the amount of content produced.

### 4.4 Deliverable

`COMPANY_ANALYSIS_LOG.md` documenting: which analyses were implemented, which were skipped (and why), data sources used, preprocessing scripts created, and location of all new components.

---

## STREAM 5: Chapter & Section Reorganization

### 5.1 Recommended Chapter Ordering

Reorder the site's chapters to follow this narrative arc, which progresses from broad descriptive overview to deep analytical examination to thematic deep dives:

**Act I — The System (What is the US patent system, and how has it evolved?)**
1. **The Innovation Landscape** — Overall volume, growth, and structural trends in patenting.
2. **The Technology Revolution** — Decomposition of patent activity by technology classification.

**Act II — The Actors (Who participates in the system?)**
3. **Who Innovates?** — Organizational-level analysis: companies, universities, government, individuals.
4. **The Inventors** — Individual-level analysis: team sizes, gender composition, career patterns.

**Act III — The Structure (Where and how is innovation organized?)**
5. **The Geography of Innovation** — Spatial distribution of inventive activity.
6. **Collaboration Networks** — Relational structure: co-invention, institutional partnerships.

**Act IV — The Mechanics (How does the system function internally?)**
7. **The Knowledge Network** — Citation flows, government funding, knowledge diffusion.
8. **Innovation Dynamics** — Grant lag, cross-domain convergence, velocity of innovation.
9. **Patent Quality** — Measurement of patent value: citations, originality, generality.

**Act V — Institutional Context & Thematic Deep Dives**
10. **Patent Law & Policy** — Legislative and judicial forces shaping the system.
11. **Artificial Intelligence** — Thematic deep dive into AI patenting.
12. **Company Innovation Profiles** — Interactive exploratory tool (if created in Stream 4). Place last as it is exploratory rather than narrative.

### 5.2 Update All Navigation

After reordering:
- Update the home page chapter grid to reflect the new order.
- Update the main navigation / Explore page.
- Update all "Previous Chapter / Next Chapter" links at the bottom of each chapter.
- Verify every link after reordering.

### 5.3 Within-Chapter Section Ordering

For each chapter, ensure sections follow this progression:

1. **Chapter introduction**: A 2–3 paragraph overview summarizing the chapter's scope and key findings. This section opens with a bolded or visually distinguished **TL;DR** block (2–3 sentences with the most important, specific findings).
2. **Broad overview visualization**: The simplest, highest-level chart (e.g., total patent volume over time).
3. **Primary decomposition**: Break down the overview by the most important dimension (technology area, country, assignee type).
4. **Secondary decompositions and comparisons**: Additional breakdowns, rankings, side-by-side analyses.
5. **Analytical deep dives**: More complex analyses (networks, composite indices, correlations, S-curves).
6. **Concluding summary**: A brief paragraph summarizing the chapter's principal findings and connecting to the next chapter with a 1–2 sentence transition (e.g., "Having examined which technologies are ascendant, the following chapter investigates the organizations driving this innovation.").

If any chapter currently places a complex analysis before its simpler overview, reorder the sections. Move network graphs, composite indices, and multivariate analyses after bar charts, trend lines, and rankings.

### 5.4 Within-Section Figure Ordering

Within each section, figures must progress from broadest to most specific:
1. Aggregated overview (e.g., total over time)
2. Most important decomposition
3. Secondary decompositions
4. Detailed/granular views (tables, individual profiles)

If any section displays a detailed view before its overview, swap them.

### 5.5 Cross-References

After reordering:
- Add 1–2 sentence **forward references** at the end of each chapter connecting to the next chapter's topic.
- Add **backward references** where analyses in later chapters build on or extend earlier findings (e.g., "As demonstrated in Chapter 2, computing-related patent classifications have grown at the fastest rate — the present analysis examines citation quality within these high-growth areas.").
- Ensure cross-references use chapter titles, not chapter numbers, for robustness.

### 5.6 Deliverable

`REORGANIZATION_LOG.md` documenting the previous order, the new order, all sections and figures that were moved, and all cross-references added.

---

## STREAM 6: Visualization Improvements

### 6.1 Universal Standards (Apply to ALL Charts)

**Typography & Labels**:
- All axis labels must use plain language with units (e.g., "Patent Grants (thousands)", "Share of Total (%)", "Year"). Never display raw variable names.
- Chart titles must be **insight-oriented declarative sentences** — not generic labels. E.g., "Annual Patent Grants Increased Five-Fold, 1976–2025" not "Patent Count by Year."
- Font size minimum: 12px for axis tick labels, 14px for axis titles, 16px for chart titles.
- Number formatting: thousands separators (1,000), millions abbreviated ("1.2M"), percentages to one decimal place.

**Colors & Accessibility**:
- Enforce a single consistent color palette across the entire site. Audit every chart for palette consistency.
- Verify the palette is colorblind-safe (test with Okabe-Ito or ColorBrewer qualitative sets). If it is not, replace it.
- Never encode meaning using red/green alone. Add secondary encoding (pattern, shape, or direct labels).
- Minimum 4.5:1 contrast ratio for all text rendered on charts.

**Interactions & Tooltips**:
- Every data-bearing chart must display a tooltip on hover showing exact values.
- Tooltips must be styled consistently site-wide (same font, background, border, padding).
- Tooltips must not overflow viewport edges, especially on mobile.
- All interactive controls (filters, dropdowns, toggles) must provide visual feedback on interaction.

**Responsive Design**:
- Every chart must be legible and functional at 375px width.
- Long axis labels must wrap or abbreviate on narrow screens.
- Legends must reposition below the chart on mobile (not overlap data).
- Touch targets for all interactive elements: minimum 44×44px.

**Annotations & Reference Lines**:
- Every time-series chart should include 2–4 subtle vertical reference lines for the most relevant historical events (recessions, major legislation, technology milestones). Use dashed lines with small rotated labels.
- Every chart must have an **interpretive caption** below it: 2–3 formal sentences explaining the key pattern and its significance, with specific numbers.

### 6.2 Chart-Type-Specific Standards

**Line charts**: If more than 5–6 overlapping lines, switch to small multiples or provide a toggle to show/hide series. Use direct end-of-line labels in addition to (or instead of) a separate legend.

**Bar charts**: Sort by value (descending) unless chronological order is semantically important. Use horizontal bars when labels exceed 3 words. Ensure consistent bar spacing.

**Stacked area/bar charts**: Maintain consistent stacking order across the time axis. Place the most significant category at the bottom. Provide a "view as percentage" toggle where absolute totals vary dramatically.

**Maps**: Use Albers equal-area conic for US maps, an appropriate projection for world maps. Include a legend. Prevent dot overlap at low zoom via clustering or aggregation.

**Heatmaps**: Sequential color scale for single-direction data, diverging for data with a meaningful midpoint. Include labeled color legend. Ensure all row/column labels are readable.

**Network/Chord diagrams**: Apply collision detection or force-directed label placement to prevent overlaps. Provide zoom/pan. Include a legend for node size and edge width.

### 6.3 Process

1. Inventory every chart on the site (chapter, chart title, chart type).
2. Evaluate each against the standards above; note deficiencies.
3. Fix all issues. Priority: broken/misleading > inaccessible > inconsistent > suboptimal.
4. Visually verify each chart at 375px, 768px, and 1440px after fixes.

### 6.4 Deliverable

`VISUALIZATION_AUDIT.md` listing every chart reviewed, issues found, and fixes applied.

---

## STREAM 7: SEO & Generative AI (GEO) Optimization

### 7.1 Meta Tags (Every Page)

- **`<title>`**: Unique, under 60 characters, keyword-rich. Format: `[Insight-Oriented Title] | PatentWorld`
  - Home: `PatentWorld — 50 Years of US Patent Data Visualized`
  - Chapter example: `US Patent Grants Grew 5x Since 1976 | PatentWorld`
  - About: `Methodology and Data Sources | PatentWorld`
- **`<meta name="description">`**: Unique, under 160 characters, with specific numbers.
  - Example: `Interactive analysis of 9.36M US patents (1976–2025). Explore trends in technology, company portfolios, inventor demographics, and geographic concentration.`
- **`<link rel="canonical">`**: On every page.
- **`<meta name="robots" content="index, follow">`**: On all content pages.

### 7.2 Open Graph & Social Cards (Every Page)

- `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (article for chapters, website for home).
- `twitter:card` = summary_large_image, `twitter:title`, `twitter:description`, `twitter:image`.
- **og:image**: For each chapter, create a static 1200×630px branded card with the chapter title and one key statistic. Store in `/public/og/`. If programmatic generation is infeasible, use a template with text overlay.

### 7.3 Structured Data (JSON-LD)

Add to every page:

**Home page**: `WebSite` + `Dataset` schemas (see below).
**Every chapter page**: `Article` schema.
**About page**: `Dataset` schema.
**FAQ page/section**: `FAQPage` schema.

```json
// WebSite (home page)
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PatentWorld",
  "url": "https://patentworld.vercel.app",
  "description": "Interactive exploration of 50 years of US patent data from PatentsView",
  "author": {
    "@type": "Person",
    "name": "Saerom (Ronnie) Lee",
    "jobTitle": "Assistant Professor of Management",
    "affiliation": {
      "@type": "Organization",
      "name": "The Wharton School, University of Pennsylvania"
    },
    "url": "https://www.saeromlee.com"
  }
}

// Dataset (home or about page)
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "PatentWorld US Patent Analysis",
  "description": "Analysis of 9.36 million US patents granted 1976–2025",
  "temporalCoverage": "1976/2025",
  "spatialCoverage": "United States",
  "creator": { "@type": "Person", "name": "Saerom (Ronnie) Lee" },
  "provider": { "@type": "Organization", "name": "PatentsView (USPTO)" }
}

// Article (each chapter)
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Chapter Title]",
  "author": { "@type": "Person", "name": "Saerom (Ronnie) Lee" },
  "publisher": { "@type": "Organization", "name": "PatentWorld" },
  "datePublished": "[ISO date]",
  "dateModified": "[ISO date]",
  "mainEntityOfPage": "[canonical URL]"
}
```

### 7.4 FAQ Page

Create an FAQ page (or section on the About page) with `FAQPage` schema answering 8–10 commonly searched questions with specific numbers from the data:

1. "How many US patents have been granted since 1976?"
2. "Which company holds the most US patents?"
3. "How long does it take to obtain a US patent?"
4. "What are the fastest-growing patent technology areas?"
5. "Is artificial intelligence patenting increasing?"
6. "What is the gender gap in US patenting?"
7. "Which countries file the most US patents?"
8. "How has patent quality changed over time?"
9. "What was the impact of the America Invents Act?"
10. "How many patents does the average inventor hold?"

Answer each in 2–4 sentences with specific numbers. These are high-value targets for LLM extraction.

### 7.5 Sitemap & Robots

**sitemap.xml**: Generate listing all pages with `<lastmod>` dates. If Next.js has a sitemap plugin, use it; otherwise create manually.

**robots.txt**:
```
User-agent: *
Allow: /
Sitemap: https://patentworld.vercel.app/sitemap.xml

# AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /
```

### 7.6 Content-Level GEO Optimization

**TL;DR blocks**: Every chapter must open with a visually distinguished TL;DR block containing 2–3 sentences with the chapter's most important findings, stated declaratively with specific numbers. This is the highest-priority content for LLM extraction.

**Chart data in HTML**: For every chart, add at least one of:
- A `<figcaption>` with a complete-sentence description of the chart's key finding.
- A `<table>` (can be visually hidden with `sr-only` class but must be in the DOM) with the top 5–10 data values.
- An `aria-label` on the chart container with a text description.

LLMs cannot interpret SVG/canvas chart content; they depend entirely on surrounding HTML text.

**Rankings as HTML lists**: Ensure all "top N" rankings are rendered as HTML `<ol>` or `<table>` elements in addition to being visualized in charts. Ranked content is disproportionately extracted by LLMs.

**Consistent entity naming**: Audit all text for inconsistent terminology. Standardize: "US patents" (not alternating with "American patents"), "PatentsView" (one word, capital V), and consistent company name formatting.

**Heading hierarchy**: Every page must have exactly one `<h1>`, followed by `<h2>` sections, `<h3>` subsections. No skipped heading levels.

**Internal linking**: Every chapter must contain 2–3 cross-references to other chapters using descriptive anchor text (e.g., "as discussed in the Patent Quality analysis" linking to the Patent Quality chapter — not "click here" or "see more").

### 7.7 Deliverable

`SEO_AUDIT.md` documenting all meta tags added/updated, structured data implemented, FAQ content, and GEO optimizations applied.

---

## STREAM 8: Performance Optimization

### 8.1 Targets

- **Lighthouse Performance score ≥ 90** on home page and 3 representative chapter pages.
- **Core Web Vitals passing**: LCP < 2.5s, INP < 200ms, CLS < 0.1.

### 8.2 Static Rendering

Ensure every chapter page uses static generation (`getStaticProps` or the App Router equivalent) so all narrative text, chart captions, and TL;DR summaries are present in the raw HTML served to crawlers. Verify by viewing the page source — if text is missing from the HTML and only appears after JavaScript executes, fix the rendering strategy.

### 8.3 Lazy Loading

Every chart below the initial viewport must use dynamic imports (`next/dynamic` with `{ ssr: false }`) or `IntersectionObserver`-based lazy loading. Charts should not load or execute until they are near the viewport.

### 8.4 Asset Optimization

- Use `next/image` for all static images. Serve in WebP. Set explicit `width` and `height`.
- Use `next/font` for custom fonts. Subset to Latin if the font file is large.
- Code-split heavy chart libraries (D3, Recharts) — they should only be in the bundles of components that use them, not the main entry point.
- If any JSON data file exceeds 500KB: split into per-chart files, trim float precision, or move to on-demand loading.

### 8.5 Layout Stability (CLS)

- Every chart container must have an explicit height or aspect-ratio before the chart renders to prevent layout shift.
- All images and embedded elements must have explicit dimensions.
- Fonts must use `font-display: swap`.

### 8.6 Interactivity (INP)

- All chart interactions must respond in < 100ms.
- Debounce rapid interactions (time sliders, search inputs).
- Avoid blocking the main thread during animations; use `requestAnimationFrame`.

### 8.7 Process

1. Run Lighthouse on home page + 3 chapters. Record baseline scores.
2. Apply optimizations.
3. Re-run Lighthouse. Iterate until ≥ 90 performance and all CWV passing.

### 8.8 Deliverable

`PERFORMANCE_AUDIT.md` with before/after Lighthouse scores and all optimizations applied.

---

## Master Deliverables Checklist

After completing all eight streams, the project must contain:

- [ ] `BUGFIX_LOG.md` — All bugs found and fixes applied
- [ ] `ACCURACY_AUDIT.md` — Every factual claim verified with status and corrections
- [ ] `TONE_AUDIT.md` — All informal-to-formal rewrites documented
- [ ] `COMPANY_ANALYSIS_LOG.md` — Company-level analyses implemented, skipped analyses noted
- [ ] `REORGANIZATION_LOG.md` — Previous vs. new ordering, all moves documented
- [ ] `VISUALIZATION_AUDIT.md` — Every chart reviewed and improved
- [ ] `SEO_AUDIT.md` — All SEO/GEO optimizations documented
- [ ] `PERFORMANCE_AUDIT.md` — Before/after Lighthouse scores
- [ ] `sitemap.xml` — Complete sitemap
- [ ] Updated `robots.txt` with AI crawler permissions
- [ ] JSON-LD structured data on every page
- [ ] FAQ page or section with `FAQPage` schema
- [ ] OG images for each chapter in `/public/og/`
- [ ] Zero build errors and zero build warnings
- [ ] Zero console errors on any page
- [ ] All text in formal academic register — zero colloquialisms
- [ ] All chart captions verified accurate against data
- [ ] Chapters reordered per the recommended narrative arc
- [ ] Previous/Next chapter links updated
- [ ] TL;DR summaries on every chapter
- [ ] `<figcaption>` or hidden `<table>` on every chart
- [ ] Company-level analyses added with interactive visualizations
- [ ] Company name mapping file created and used consistently
- [ ] Lighthouse performance ≥ 90 on tested pages
- [ ] All Core Web Vitals passing