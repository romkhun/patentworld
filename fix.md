# Claude Code Prompt: Audit, Verify, and Optimize patentworld.vercel.app

You are auditing and improving the website https://patentworld.vercel.app/. This is an academic/professional site presenting patent and innovation research. **Accuracy is paramount** — any errors will severely undermine the author's reputation and credibility. Every claim, figure, reference, and description on this site must be 100% accurate.

---

## GENERAL GUIDELINES (Apply Throughout All Phases)

These principles apply to every phase. Do not wait until a specific phase to follow them.

- **Accuracy is the top priority.** Every analysis, figure, takeaway, and caption must be precisely supported by the data. Do not overstate, speculate, or extrapolate. Never fabricate, invent, or assume information.
- **When uncertain, flag — do not guess or silently remove.** Add uncertain items to `AUDIT_LOG.md` under "FLAGGED FOR AUTHOR REVIEW" with the page name, the specific claim, and the reason for uncertainty.
- **When a claim is partially correct but overstated,** revise it to be precisely accurate rather than removing it entirely. Only remove claims that are outright false and cannot be salvaged.
- **Match existing conventions exactly:** same chart library, color palette, component patterns, data file format, caption style, takeaway format, and academic tone. When uncertain, find an existing example in the codebase and replicate it.
- **Maintain the author's voice and academic tone** throughout all revisions.
- **Phases are sequential and cumulative.** Later phases must preserve all fixes from earlier phases. If a later phase's instruction conflicts with an earlier phase's completed work, the earlier phase's work takes precedence.
- **Logging:** After completing each phase, append a summary to `AUDIT_LOG.md` listing all changes made, all items flagged for author review, and the reason for each flag or change. Confirm the summary is complete before proceeding to the next phase.
- **The primary audience** is researchers, policymakers, and industry professionals.

---

## BEFORE YOU BEGIN

Complete these setup steps in order before starting any phase.

1. **Install dependencies.** Run the project's package install command (check for `package-lock.json` → `npm install`, `yarn.lock` → `yarn install`, `pnpm-lock.yaml` → `pnpm install`). Resolve any install errors before proceeding.
2. **Explore the project structure.** Examine routing, content files, components, config, assets, and styles. Identify the tech stack (framework, styling, deployment target). Read every page's source files to understand the content, structure, and naming conventions.
3. **Create `AUDIT_LOG.md`** in the project root. This file is the author's primary record of all changes and flagged items. It will be appended to after each phase.
4. **Start the dev server** (e.g., `npm run dev`). If there are build errors that prevent the site from running, fix them immediately — you need a working site to audit. Log any build fixes in `AUDIT_LOG.md`.

---

## PHASE 1: Content Accuracy Audit

This is the highest-priority phase. Go through every page.

### 1a. Takeaways, Captions, and Descriptions

- Read every takeaway, figure caption, section description, and summary statement.
- **Verify each claim against the actual data values in the source code** (data files, JSON, chart configurations). The claim must be directly and precisely supported by the data or figure it references.
- **Revise overstated claims** to match the data precisely. For example, change "X dominates" to "X leads" if the margin is modest. Only fully remove a claim if it is outright false and cannot be revised to be accurate.
- **Replace vague language with specific figures from the data** where available. For example, change "significant increase" to "a 23% increase from 2010 to 2020."
- Ensure captions describe exactly what the figure depicts — no more, no less.

### 1b. Paper References and Citations

For every referenced academic paper or study:

1. **Verify the paper exists.** Use web search to confirm the paper is real and that citation details (authors, year, title, journal) are correct.
   - If you **can** find the paper but some citation details are wrong, correct them.
   - If you **cannot** find the paper at all via web search, flag it in `AUDIT_LOG.md` for the author to verify manually. **Do not remove it.**
2. **Verify the site's summary is faithful to the paper's actual findings.** The summary must reflect what the paper actually concludes — not a loose paraphrase. If the summary overstates or mischaracterizes the paper's findings, revise it.
3. **Check relevance.** If the paper only tangentially relates to the claim it supports (e.g., the paper merely mentions the topic in passing or in a literature review rather than directly studying it), remove the citation and log the removal and reason in `AUDIT_LOG.md`.

### 1c. Legal and Policy References (Additional Criteria)

All criteria from 1b apply to every paper. For papers cited **specifically in connection with a legal or policy change**, apply these additional checks:

1. **Verify the legal/policy change itself.** Confirm the date and description of the legal/policy change are accurate using web search.
2. **Check chronological validity.** Confirm the cited paper was published **after** the legal/policy change occurred. A paper published before the policy change cannot study its effects. If the paper predates the policy, remove the citation and log it.
3. **Check direct examination.** Confirm the paper's core research question or analysis is about the specific legal/policy change — not that it merely mentions the policy in passing, in its introduction, or in a literature review. If the paper does not directly examine the policy's effects, remove the citation and log it.

### 1d. Data and Statistical Claims

- Cross-check **every** specific number, percentage, date, and ranking stated in text against the underlying data in the source code.
- If a number in the text does not match the data source, **correct the text to match the data.**
- Verify that comparative claims (e.g., "X leads," "Y increased by Z%") are consistent with the actual data values.

---

## PHASE 2: Tone and Language

Review all text on every page — including any text revised in Phase 1 — for academic, formal, and professional tone.

- **Replace informal or casual language with formal equivalents.** Examples: "a lot" → "substantially"; "big" → "considerable"; "shows" → "demonstrates" or "illustrates"; "got" → "obtained" or "received."
- **Remove hyperbolic or promotional language** (e.g., "groundbreaking," "revolutionary," "game-changing") unless directly quoting a source.
- **Standardize terminology.** If the site alternates between terms that refer to the same concept (e.g., "patents" and "filings" when both mean the same thing), pick one and use it consistently. If the terms have distinct meanings, ensure they are used correctly throughout. Document all terminology standardization decisions in `AUDIT_LOG.md`.
- **Use precise hedging where appropriate:** "suggests" rather than "proves"; "is associated with" rather than "causes" — unless the cited evidence establishes causation.
- **Do not over-formalize.** The text should be professional and accessible, not stiff or stilted.

---

## PHASE 3: Figure and Visualization Quality

Review every figure, chart, and graph in the source code.

> **Scope note:** Figure caption *accuracy* was handled in Phase 1a. This phase focuses on visual quality, layout, and responsiveness only.

### 3a. Legends and Labels

- **No legend overlap.** If a legend overlaps with the chart area, axes, data points, or caption, reposition it (e.g., move it below the chart).
- **Logical legend order.** Use descending value for bar/pie charts, visual stacking order for stacked charts, chronological for time series, or alphabetical if no other order applies.
- **Clean axis labels.** Remove unnecessary decimal places (display "2,000" not "2,000.00"; "10%" not "10.000%"). Labels and tick marks must be fully readable — not truncated, overlapping, or cut off.
- **Use Consistent Cleaned Organization Names Across All Figures.** Some figures use cleaned/shortened names for organizations (e.g., "Samsung", "IBM", "Canon"), while others display the raw uncleaned names from PatentsView (e.g., "SAMSUNG ELECTRONICS CO., LTD.", "INTERNATIONAL BUSINESS MACHINES CORPORATION", "CANON KABUSHIKI KAISHA"). Audit all figures, legends, labels, tooltips, and annotations across the entire site. Ensure every figure uses the same set of cleaned, human-readable short names for organizations. If a name-mapping/cleaning function or lookup table already exists in the codebase, apply it universally. If not, create one and apply it to all figures.

### 3b. Visual Clarity

- Ensure sufficient color contrast between data series, including for common color vision deficiencies.
- Verify axes are labeled with units where applicable (e.g., "Patents (thousands)" not just "Patents").
- Ensure consistent styling (font family, font sizes, color palette) across all figures site-wide.
- Remove chartjunk: unnecessary gridlines, borders, 3D effects, or decorative elements.

### 3c. Responsiveness

- Check that figures render without overflow, cropping, or overlap at the following widths: desktop (~1440px), tablet (~768px), and mobile (~375px). Use browser dev tools or resize the viewport to test.
- If interactive elements (tooltips, hover states) are present, verify they function correctly.

---

## PHASE 4: Content Organization and Flow

Review the structure of the entire site for logical progression. **Preserve all fixes from Phases 1–3 when reordering content.**

### 4a. Within Each Page

- Sections should progress logically: foundational concepts before advanced analysis, historical context before current state, broad overview before detailed breakdown.
- Each figure should appear immediately after or adjacent to the text that discusses it, not separated by unrelated content.
- Reorder sections and figures within pages where the current sequence is illogical. Log every reordering in `AUDIT_LOG.md` with the rationale.

### 4b. Across Pages Within Each ACT

- Pages within an ACT should build on each other in a coherent sequence.
- Reorder pages within an ACT if a different sequence would be more logical. Log any reordering with rationale.
- **Consolidate duplicates.** If substantially similar content appears on multiple pages, consolidate it in the most logical location. Replace the duplicate with a brief cross-reference (e.g., "See [Chapter Title] for details on..."). Log every consolidation.

### 4c. Across ACTs

- Verify the ACT sequence provides a logical narrative arc.
- After any reordering, ensure all cross-references between ACTs are accurate and point to the correct pages/sections.
- **No content should be duplicated:** no section or figure should appear in more than one chapter.

---

## PHASE 5: Titles

### 5a. Audit All Existing Titles

Build a complete inventory in a new file called `TITLE_REVISIONS.md` with the following structure:

```
## ACT 1: [Current ACT Title]
### Chapter: [Current Chapter Title]
- Section: [Current Section Title] — [Assessment]
- Section: [Current Section Title] — [Assessment]
...
```

For each title (ACT, chapter, or section), assign one of these assessments:

- **Vague or generic:** Could apply to almost anything (e.g., "Overview," "Results"). A reader scanning the table of contents cannot tell what the section covers.
- **Inconsistent format:** Follows a different grammatical pattern, length, or style than its peers at the same level.
- **Missing key information:** Does not mention the specific subject, metric, or finding it covers.
- **Redundant with parent:** Restates its parent ACT or chapter title without adding specificity.
- **Inconsistent terminology:** Uses a different term than other titles for the same concept (e.g., "Firms" vs. "Companies" vs. "Assignees").
- **OK — no change needed.**

### 5b. Define Naming Conventions

Before proposing any new titles, establish explicit conventions for each level by examining the best existing titles on the site. Log the conventions in `TITLE_REVISIONS.md` under a "NAMING CONVENTIONS" section.

**ACT Titles:** Define the grammatical structure, approximate length (2–4 words), and tone. Derive the pattern from existing ACT titles.

**Chapter Titles:** Concise (2–5 words). Must clearly identify the chapter's subject. Consistent grammatical structure across all chapters. Derive the pattern from the dominant existing pattern.

**Section Titles:** Specific enough that a reader knows what the section covers without reading the body text. Prefer finding-driven or topic-driven titles over generic labels (e.g., "Top 10 Assignees Hold 12% of All Patents" is better than "Top Assignees"). However, introductory or transitional sections may use short descriptive titles (e.g., "Data and Methods"). Aim for 4–10 words. Use a consistent grammatical structure within each chapter.

### 5c. Propose New Titles

For every title flagged with a problem in 5a, propose a new title that:

1. Follows the conventions from 5b.
2. Resolves the specific problem(s) flagged.
3. Accurately describes the content — do not make it more specific or dramatic than the content supports.
4. Uses consistent terminology site-wide.

Log each proposed change in `TITLE_REVISIONS.md`:

```
### [Level]: [Old Title] → [New Title]
- Problem(s): [what was wrong]
- Rationale: [why the new title is better]
```

**Do not change titles marked "OK" in 5a.**

Before implementing, review the full list of proposed changes and check for internal consistency, distinctiveness (no two titles at the same level too similar), and accuracy.

### 5d. Implement Title Changes

Apply all proposed title changes from 5c. For each changed title, update it in **every location** where it appears. Specifically:

**ACT titles:** Navigation sidebar, table of contents, ACT landing/index pages, config files, page headers, breadcrumbs, cross-references on other pages.

**Chapter titles:** All the same locations as ACT titles, plus: `<title>` tag, meta descriptions (`og:title`, `og:description`), previous/next link labels on adjacent chapters, and URL slugs **only if** the current slug matches the old title. If you change a slug: add a redirect from the old URL to the new URL (using the project's existing redirect mechanism) and update all internal links to the old URL.

**Section titles:** The section heading, any anchor IDs derived from the title, all internal links targeting that anchor (search the full codebase), and any in-page navigation menus. If you change an anchor ID, keep the old anchor ID as a hidden element so any external links still resolve.

### 5e. Terminology Standardization Pass

After all titles are updated, do a final pass across the entire site — titles, body text, captions, and takeaways — to standardize the key terms chosen in 5b/5c. For example, if you standardized chapter titles on "assignees" instead of "firms" or "companies," check that body text within those chapters uses the same term (unless the context specifically requires the other term). **This pass is limited to terminology alignment only. Do not rewrite body text for other reasons.**

---

## PHASE 6: SEO, GenAI Optimization, and Performance

### 6a. Technical SEO

- Ensure every page has a unique, descriptive `<title>` tag and `<meta name="description">` that accurately summarizes the page content.
- Implement or verify Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card meta tags on every page.
- Create or update `sitemap.xml` listing all pages. Create or update `robots.txt` to allow crawling.
- Implement structured data (JSON-LD) where appropriate: `WebSite` schema on the homepage, `Article` or `ScholarlyArticle` on content pages, `BreadcrumbList` on all pages.
- Set canonical URLs on all pages. Ensure a consistent URL format (choose trailing slash or no trailing slash, and apply uniformly).

### 6b. GenAI Optimization

Make the site's content easily parseable and citable by LLM-based search engines and AI assistants.

- Ensure each page has a concise, factual summary (2–3 sentences) near the top that an AI system could extract as a snippet.
- Ensure section headings are descriptive and self-contained (this should already be the case after Phase 5; verify here).
- Ensure all key data points, findings, and statistics are stated in plain text in the HTML — not only embedded inside chart images or SVGs. Data in non-text visual formats is invisible to AI crawlers.

### 6c. Content SEO

- Ensure page URLs are descriptive and keyword-rich (e.g., `/patent-filing-trends` not `/chapter-3`). (This overlaps with slug changes in Phase 5d; here, address any URLs not already updated.)
- Ensure heading tags (`h1`–`h3`) include terms that researchers and policymakers would search for.
- Add internal links between related pages where they would help the reader and strengthen topical structure. (Phase 4b addressed consolidation of *duplicate* content; here, add navigational links between *distinct but related* topics.)

### 6d. Performance

- **LCP:** Lazy-load below-fold images and figures. Preload critical above-fold assets. Use `font-display: swap` or preload key fonts.
- **CLS:** Set explicit `width` and `height` (or `aspect-ratio`) on all images, figures, and embeds.
- **INP:** Defer non-critical JavaScript. Minimize main-thread blocking.
- Compress and convert images to modern formats (WebP or AVIF) where the build pipeline supports it.
- Remove unused CSS, JavaScript, and dependencies from the bundle.
- Implement code splitting if the framework supports it and it is not already in place.

### 6e. Accessibility

- All images and figures must have meaningful `alt` text that describes the content (not just "figure" or "chart").
- Verify heading hierarchy: one `h1` per page, then `h2`, `h3`, etc. with no skipped levels.
- Check that text and interactive elements meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
- Ensure the site is fully navigable via keyboard (Tab, Enter, Escape).

---

## PHASE 7: Navigation

Verify all navigation elements are correct and functional after all changes made in Phases 1–6.

- Sidebar, table of contents, and all navigation menus must accurately reflect the current page order, titles, and ACT structure.
- Breadcrumbs must be present and correct on every page.
- Previous/next page links (if present) must follow the correct sequence with correct labels.
- **Test every internal link site-wide.** Use a script or automated check (e.g., a grep/find for all internal `href` values and verify each resolves to a valid page). Fix any broken links (404s).
- Table of contents must be complete and accurate.
- Test all navigation elements at mobile viewport widths.
- For long pages, verify that "jump to section" or anchor links exist and work correctly.

---

## PHASE 8: About the Author

Replace the current "About the Author" content with the following text exactly:

> Saerom (Ronnie) Lee is an Assistant Professor of Management at The Wharton School, University of Pennsylvania. His research examines organizational design, human capital acquisition, startup scaling, and high-growth entrepreneurship. Additional information is available on his personal website. PatentWorld was developed to provide a rigorous, interactive platform for examining half a century of US patent data. Correspondence: saeroms@upenn.edu. Feedback, collaboration inquiries, and suggestions are welcome.

Apply the following hyperlinks:

- Link the text **"Saerom (Ronnie) Lee"** to `https://www.saeromlee.com`
- Link the text **"personal website"** to `https://www.saeromlee.com`

---

## PHASE 9: Bug Fixes and Final QA

### 9a. Errors

- Fix all browser console errors, warnings, and runtime exceptions.
- Fix any rendering issues visible when testing the site.
- Fix any framework-specific issues (e.g., hydration mismatches, SSR/SSG errors) if applicable.
- Confirm all figures render correctly, all text is properly formatted, and transitions between sections read naturally.

### 9b. Code Cleanup

- Remove unused files, components, styles, and dependencies from the codebase.
- Consolidate duplicated logic into shared utilities or components.

### 9c. Final Build Verification

- Run the production build (`npm run build` or equivalent). It must complete with **zero errors**. Resolve warnings where possible.
- Run the linter and type checker if configured. Fix all errors; resolve warnings where reasonable.
- Start the production build locally and spot-check several pages to confirm correct rendering.

### 9d. Final AUDIT_LOG Review

- Review `AUDIT_LOG.md` for completeness. Ensure every change and every flagged item across all phases is logged.
- Add a final summary section listing: total changes made, total items flagged for author review, and any known remaining issues.