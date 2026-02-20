# Claude Code Prompt: Audit, Verify, and Optimize patentworld.vercel.app

You are auditing and improving the website https://patentworld.vercel.app/. This is an academic/professional site presenting patent and innovation research by a Wharton School faculty member. **Accuracy is paramount** — any errors will severely undermine the author's reputation and credibility. Every claim, figure, reference, and description must be verifiably correct.

## Site Architecture

**6-ACT, 34-chapter architecture:**

```
ACT 1 – The System (7 chapters: 1.1–1.7)
ACT 2 – The Organizations (5 chapters: 2.1–2.5)
ACT 3 – The Inventors (5 chapters: 3.1–3.5)
ACT 4 – The Geography (2 chapters: 4.1–4.2)
ACT 5 – The Mechanics (3 chapters: 5.1–5.3)
ACT 6 – Deep Dives (12 chapters: 6.1–6.12)
```

**Tech stack:** Next.js 14 App Router with static export, Recharts chart library, Tailwind CSS, deployed on Vercel. Chapter pages at `src/app/chapters/[slug]/page.tsx`. Chapter registry in `src/lib/constants.ts` (CHAPTERS array, ACT_GROUPINGS). Data loaded via `useChapterData<T[]>('chapterN/file.json')` hook from `public/data/`.

**Current state (as of commit e548c966):**
- 458 ChartContainers in chapters + 1 homepage = 459 visualizations
- `npx tsc --noEmit` passes with zero errors
- `npm run build` passes with zero errors
- Zero ESLint warnings

---

## GENERAL GUIDELINES

- **Accuracy is the top priority.** Every claim, figure, and caption must be precisely supported by the data. Do not overstate, speculate, or extrapolate. Never fabricate, invent, or assume information.
- **When uncertain, flag — do not guess or remove.** Add uncertain items to `AUDIT_LOG.md` under "FLAGGED FOR AUTHOR REVIEW."
- **Do not introduce new claims or interpretations** beyond what the data shows. Exception: you may replace vague language with specific numbers from the data.
- **Match existing codebase conventions** for component patterns, data format, and project structure.
- **Maintain the author's voice and academic tone.** Target register: *Management Science*, *American Economic Review*, *Research Policy*.
- **The primary audience** is researchers, policymakers, and industry professionals.

---

## LANGUAGE AND STYLE RULES (MANDATORY)

These rules apply to ALL text across the entire site — titles, subtitles, captions, insights, narrative prose, key findings, executive summaries, and tooltips.

### Rule 1: Do not use "this" or "that" as a noun/pronoun
- **BAD:** "This is consistent with", "This reflects", "This chart displays", "because of this", "that indicates"
- **GOOD:** "The pattern is consistent with", "The trend reflects", "The figure displays", "due to the narrow scope", "the finding indicates"
- **OK (determiner before noun):** "this chapter", "this pattern", "that metric", "this period"
- For captions starting with "This chart...": replace with "The figure..." or restructure to lead with the finding

### Rule 2: Do not use abbreviations unless 100% necessary
- "e.g." → "for example" or "such as"
- "i.e." → "that is" or restructure
- "etc." → list items explicitly or use "and other" / "among others"
- "vs." → "versus" or "compared with"
- "approx." → "approximately"
- **Exceptions:** Standard acronyms (CPC, USPTO, AI, HHI, PCT, WIPO, R&D, IoT) are acceptable

### Rule 3: Academic, formal, professional tone
- No contractions: "don't" → "do not", "it's" → "it is" (unless possessive "its")
- No informal adverbs: "clearly" → remove or "is evident", "essentially" → "nearly" or remove, "basically" → remove, "dramatically" → "substantially" or "markedly"
- No informal intensifiers: "exploded" → "expanded rapidly", "surged" → "increased substantially", "skyrocketed" → "grew rapidly", "massive" → "substantial", "huge" → "large", "tiny" → "small"

### Rule 4: Use cleaned assignee names
- Use short, cleaned names in all hardcoded text: "Samsung" not "SAMSUNG ELECTRONICS CO., LTD."
- For runtime data, apply `cleanOrgName()` from `src/lib/orgNames.ts`
- Do not create duplicate name-cleaning functions — use the centralized utility

### Rule 5: CPC sections must show full names
- All CPC section references in charts, legends, and text must include full names
- Standard format: `${section}: ${CPC_SECTION_NAMES[section]}` (colon separator)
- Use `CPC_SECTION_NAMES` from `src/lib/constants.ts` — do not abbreviate ("Chemistry" not "Chemistry & Metallurgy")

### Rule 6: Minimize chart-caption gap
- ChartContainer caption and insight use `mt-2` (not `mt-4`)
- All Recharts Legend components use `paddingTop: 8` (not 12)

---

## WORK COMPLETED ACROSS ALL PRIOR SESSIONS

The following work has been completed across 10+ sessions. **Do not redo completed work. Build on it.**

### Original 10-Phase Audit (fix.md / fix_2.md / fix_3.md)
- **Phase 1 (Bug Fixes):** Console errors fixed, hero counters verified, prev/next links verified for all 34 chapters, data integrity pass.
- **Phase 2 (Content Accuracy):** Numerical claims verified across all chapters, Patent Law references audited, terminology corrections.
- **Phase 3 (Tone):** Informal language replaced, contractions expanded, hedging evaluated, chart titles converted to declarative findings.
- **Phase 4 (Visualization Quality):** Legends, axis labels, color palette, chart loading fallbacks reviewed.
- **Phase 5 (Content Organization):** Within-chapter structure, ACT 5 reordered, cross-references, InsightRecap panels, Act bridge transitions.
- **Phase 6 (Titles):** All titles audited and revised to insight-oriented declarative sentences.
- **Phase 7 (Navigation):** Prev/next links verified, chapter card descriptions finding-first.
- **Phase 8 (About Page):** Author bio, methodology, suggested citation, measurement definitions.
- **Phase 9 (SEO):** Meta tags, Open Graph, JSON-LD, sitemap.ts, robots.ts, FAQ page.
- **Phase 10 (Final QA):** Build verification, page-by-page checklist, spot-checks completed.

### Visualization Polish (commits aa4711a4, e548c966)
- Formatters expanded (formatCount, formatPercent, formatIndex, formatYear)
- Sequential/diverging scales, categorical palettes added to colors.ts
- PWLollipopChart, PWSlopeChart, PWSparkline components created
- Brush prop added to PWLineChart, enabled on 5 key time-series charts
- ACT 6 overview sparklines added
- Chart-caption gap tightened (mt-4 → mt-2, paddingTop 12 → 8)

### Language Fixes (commits 570688bf, 80fb7b2e, e548c966)
- 13 language edits across 10 files (informal adverbs, abbreviations, "this"/"that" pronouns)
- Cohort-normalized citation intensity heatmap removed from system-patent-quality
- PWScatterChart categoryLabels prop added, applied to Sleeping Beauties chart
- InsightRecap heading: "What Would Challenge This" → "What Would Challenge the Findings"

---

## PHASE 1: Caption and Insight "This" Pronoun Sweep

**71 remaining instances** of "This chart/table/map/pattern..." in captions and insights across 20+ chapters. Each must be rewritten to eliminate "This" as a pronoun.

### Replacement pattern for captions:
- "This chart displays X" → "The figure displays X"
- "This chart tracks X" → "The figure tracks X"
- "This chart compares X" → "The figure compares X"
- "This chart presents X" → "The figure presents X"
- "This chart ranks X" → "The figure ranks X"
- "This choropleth map displays X" → "The choropleth map displays X"
- "This table reports X" → "The table reports X"
- "This map displays X" → "The map displays X"

### Replacement pattern for insights:
- "This pattern is consistent with X" → "The pattern is consistent with X"

### Files requiring caption/insight fixes (all under `src/app/chapters/`):

| Chapter | Approximate count |
|---------|------------------|
| `geo-domestic/page.tsx` | 8 |
| `geo-international/page.tsx` | 4 |
| `inv-gender/page.tsx` | 5 |
| `inv-generalist-specialist/page.tsx` | 2 |
| `inv-serial-new/page.tsx` | 12 |
| `inv-team-size/page.tsx` | 5 |
| `inv-top-inventors/page.tsx` | 5 |
| `mech-geography/page.tsx` | 2 |
| `mech-inventors/page.tsx` | 5 |
| `mech-organizations/page.tsx` | 1 |
| `org-patent-count/page.tsx` | 1 |
| `org-patent-portfolio/page.tsx` | 1 |
| `org-patent-quality/page.tsx` | 1 |
| `system-convergence/page.tsx` | 4 |
| `system-patent-fields/page.tsx` | 8 |
| `system-patent-law/page.tsx` | 1 |
| `system-patent-quality/page.tsx` | 5 |

### Body text "this" instances:
- `inv-team-size/page.tsx:440` — "To address this, the following analysis..." → "To address the limitation, the following analysis..."
- `org-patent-count/page.tsx:136` — "this chapter focuses on" → "the chapter focuses on"
- `system-patent-fields/page.tsx:462` — insight containing "This pattern" → "The pattern"

**Execution:** Replace all "This chart" → "The figure", "This table" → "The table", "This map" → "The map", "This choropleth" → "The choropleth", "This pattern" → "The pattern" across all caption= and insight= props. Then fix specific body-text instances.

---

## PHASE 2: CPC Section Name Standardization

### 2a. Fix abbreviated CPC names in system-patent-fields

File: `src/app/chapters/system-patent-fields/page.tsx` (around line 267-269)

The `cpcQualityNames` object uses abbreviated names inconsistent with `CPC_SECTION_NAMES`:
```
B: 'B – Operations/Transport'   →  B: 'B: Operations & Transport'
C: 'C – Chemistry'              →  C: 'C: Chemistry & Metallurgy'
D: 'D – Textiles/Paper'         →  D: 'D: Textiles & Paper'
F: 'F – Mechanical Eng.'        →  F: 'F: Mechanical Engineering'
```

Replace with: `Object.fromEntries(Object.entries(CPC_SECTION_NAMES).map(([k, v]) => [k, \`${k}: ${v}\`]))`

### 2b. Standardize separator format

The site uses mixed separators for CPC section labels:
- Most chapters use colon: `${section}: ${name}`
- system-patent-quality uses en-dash: `${s} – ${name}`
- Some use em-dash: `${s} — ${name}`
- inv-team-size uses hyphen: `${s} - ${name}`

**Standardize all to colon format:** `${section}: ${name}`

---

## PHASE 3: Duplicate Name-Cleaning Function

File: `src/app/chapters/org-patent-quality/page.tsx` (lines 68-85)

Contains a custom `shortName()` function that duplicates `cleanOrgName()` from `src/lib/orgNames.ts`. Replace:
1. Import `cleanOrgName` from `@/lib/orgNames`
2. Replace all calls to `shortName(x)` with `cleanOrgName(x)`
3. Delete the `shortName()` function

---

## PHASE 4: Remaining Abbreviation and Informal Language Scan

After Phase 1 fixes, verify zero remaining instances of:
- "e.g." (unless inside a technical term or formula)
- "i.e."
- "etc."
- "vs." (use "versus" or "compared with")
- Contractions ("don't", "doesn't", "isn't", etc.)
- Informal adverbs ("clearly", "obviously", "essentially", "basically", "dramatically")
- Informal intensifiers ("exploded", "surged", "skyrocketed", "massive", "huge", "tiny")

---

## PHASE 5: HERO_STATS Verification

- 458 ChartContainer instances in chapters (verified by grep)
- +1 homepage visualization
- = 459 total → HERO_STATS.visualizations must equal 459
- Current value: 459 ✓ (no change needed)

---

## PHASE 6: Build, Commit, and Deploy

After all phases pass:

1. Run `npx tsc --noEmit` — must be zero errors
2. Run `npm run build` — must be zero errors
3. Verify cross-stat consistency: "9.36M", "161,888", "five-fold", "459", "34", "57%", "14.9%", "23.6%"
4. Stage all modified files
5. Commit with descriptive message
6. Push to origin/main
7. Deploy to Vercel production

---

## FLAGGED FOR AUTHOR REVIEW (Not Actionable Without Author Input)

1. **6th Company Profile View** (Ch 2.5): "Intra-Firm Co-Invention Network Metrics" not implemented.
2. **Network Metrics Sections** in ACT 5 chapters: missing data files.
3. **robots.txt AI Bot Policy**: Currently allows all AI bots. Author should review.
4. **Sitemap Submission**: Submit sitemap to Google Search Console and Bing Webmaster Tools.
5. **5 Unused JSON Files**: Listed in prior sessions. Author should decide whether to keep or remove.
