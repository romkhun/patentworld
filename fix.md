# Claude Code Prompt: Audit, Verify, and Optimize patentworld.vercel.app

You are auditing and improving the website https://patentworld.vercel.app/. This is an academic/professional site presenting patent and innovation research. Accuracy is paramount — any errors will severely undermine the author's reputation and credibility. Every claim, figure, reference, and description on this site must be 100% accurate.

## Before You Begin

1. Explore the full project structure (routing, content files, components, config, assets, styles). Identify the tech stack (framework, styling, deployment).
2. Read every page's source files to understand the content, structure, and conventions.
3. Create a file called `AUDIT_LOG.md` in the project root. After each phase, append a summary of all changes made, all items flagged for the author's review, and the reason for each flag. This is the author's primary record of your work.
4. Run the dev server. If there are build errors that prevent the site from running, fix them immediately before proceeding — you need a working site to audit.

Execute the phases below in order. After each phase, append your summary to `AUDIT_LOG.md` and confirm before proceeding.

---

## PHASE 1: Content Accuracy Audit (HIGHEST PRIORITY)

Go through every page. When in doubt about any claim, do NOT guess and do NOT silently remove it — add it to `AUDIT_LOG.md` under a "FLAGGED FOR AUTHOR REVIEW" section with the page name, the specific claim, and why you are uncertain.

### 1a. Takeaways, Captions, and Descriptions

- Read every takeaway, figure caption, section description, and summary statement.
- Verify each claim is directly and precisely supported by the data or figure it references. Compare the claim against the actual data values in the source code (data files, chart configs, etc.).
- Revise any claim that overstates, exaggerates, or extrapolates beyond what the data shows. Soften the language to match the data precisely (e.g., change "X dominates" to "X leads" if the margin is modest). Only fully remove a claim if it is outright false and cannot be revised to be accurate.
- Ensure captions describe exactly what the figure depicts — no more, no less.
- Replace vague language (e.g., "significant increase") with specific figures from the data where available (e.g., "a 23% increase from 2010 to 2020").

### 1b. Paper References and Citations

For every referenced academic paper or study:

- Use web search to verify the paper exists and that the citation details (authors, year, title, journal) are correct. If you cannot verify a paper via web search, flag it in `AUDIT_LOG.md` for the author to verify manually — do not remove it.
- Verify the site's summary of the paper is precise and faithful to the paper's actual findings. The summary must reflect what the paper actually concludes, not a loose paraphrase. If the summary overstates or mischaracterizes the paper's findings, revise it.
- Remove any reference where the paper only tangentially relates to the claim it supports (e.g., the paper merely mentions the topic in passing or in a literature review rather than directly studying it). Log the removal and the reason in `AUDIT_LOG.md`.

### 1c. Legal and Policy References (Additional Criteria)

The criteria in 1b apply to all papers. For papers cited specifically in connection with a legal or policy change, apply these additional checks:

- Verify the date and description of the legal/policy change itself is accurate.
- Confirm the cited paper was published AFTER the legal/policy change occurred. A paper published before the policy change cannot study its effects. If the paper predates the policy, remove the citation and log it.
- Confirm the paper's core research question or analysis is about the specific legal/policy change — not that the paper merely mentions the policy in passing, in its introduction, or in a literature review. If the paper does not directly examine the policy, remove the citation and log it.

### 1d. Data and Statistical Claims

- Cross-check every specific number, percentage, date, and ranking stated in text against the underlying data in the source code (data files, JSON, chart configurations).
- Ensure no figures or data points are misrepresented in the surrounding text.
- Verify that comparative claims (e.g., "X leads," "Y increased by Z%") match the actual data. If a number in the text does not match the data source, correct the text to match the data.

---

## PHASE 2: Tone and Language

Review all text on every page — including any text revised in Phase 1 — for academic, formal, and professional tone.

- Replace informal, colloquial, or casual language with formal equivalents. Examples: "a lot" → "substantially"; "big" → "considerable"; "shows" → "demonstrates" or "illustrates" (where appropriate); "got" → "obtained" or "received."
- Remove hyperbolic or promotional language (e.g., "groundbreaking," "revolutionary," "game-changing") unless directly quoting a source.
- Ensure consistent terminology throughout the site. For example, do not alternate between "patents" and "filings" if they refer to different things; if they refer to the same thing, pick one and use it consistently. Document any terminology standardization decisions in `AUDIT_LOG.md`.
- Use precise hedging where appropriate: "suggests" rather than "proves"; "is associated with" rather than "causes" — unless the cited evidence establishes causation.
- Do not over-formalize to the point of stiffness. The text should be professional and accessible to policymakers, researchers, and industry professionals.

---

## PHASE 3: Figure and Visualization Quality

Review every figure, chart, and graph in the source code. Run the dev server and visually inspect each figure at desktop (1440px), tablet (768px), and mobile (375px) widths.

### 3a. Legends and Labels

- No legend should overlap with the chart area, axes, data points, or caption. If overlap exists, reposition the legend (e.g., move it below the chart or to a non-overlapping area).
- Items in legends must be in a logical order. Use the order that best matches the chart type: by descending value for bar/pie charts, matching the visual stacking order for stacked charts, chronological for time series, or alphabetical if no other order applies.
- Axis labels must not display unnecessary decimal places (e.g., display "2,000" not "2,000.00"; "10%" not "10.000%"). Remove trailing zeros after the decimal point.
- Axis labels and tick marks must be fully readable — not truncated, overlapping, or cut off at any viewport size.

### 3b. Visual Clarity

- Ensure sufficient color contrast between data series so the chart is readable, including for users with common color vision deficiencies.
- Verify axes are labeled with units where applicable (e.g., "Patents (thousands)" not just "Patents").
- Ensure consistent styling (font family, font sizes, color palette) across all figures site-wide.
- Remove chartjunk: unnecessary gridlines, borders, 3D effects, or decorative elements that do not aid comprehension.

### 3c. Responsiveness

- Verify figures render without overflow, cropping, or overlap at desktop, tablet, and mobile widths.
- Verify interactive elements (tooltips, hover states) work correctly if present.

Note: Figure caption accuracy was already addressed in Phase 1a. Do not re-audit caption text here — focus on visual and layout issues only.

---

## PHASE 4: Content Organization and Flow

Review the structure of the entire site for logical progression. When reordering content, preserve all accuracy fixes from Phase 1, tone fixes from Phase 2, and visualization fixes from Phase 3. Do not undo earlier work.

### 4a. Within Each Page

- Sections should progress logically: foundational concepts before advanced analysis, historical context before current state, broad overview before detailed breakdown.
- Each figure should appear immediately after or adjacent to the text that discusses it, not separated by unrelated content.
- Reorder sections and figures within pages where the current sequence is illogical. Log every reordering in `AUDIT_LOG.md` with the rationale.

### 4b. Across Pages Within Each ACT

- Pages within an ACT should build on each other in a coherent sequence.
- Reorder pages within an ACT if a different sequence would be more logical. Log any reordering with rationale.
- If substantially similar content appears on multiple pages, consolidate it in the most logical location. Replace the duplicate with a brief cross-reference (e.g., "See Chapter X for details on..."). Log every consolidation.

### 4c. Across ACTs

- Verify the ACT sequence provides a logical narrative arc.
- Ensure any cross-references between ACTs are accurate and point to the correct pages/sections after all reordering.

---

## PHASE 5: SEO, GenAI Optimization, and Performance

### 5a. Technical SEO

- Ensure every page has a unique, descriptive `<title>` tag and `<meta name="description">` that accurately summarizes the page content.
- Implement or verify Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card meta tags on every page.
- Create or update `sitemap.xml` listing all pages. Create or update `robots.txt` to allow crawling.
- Implement structured data (JSON-LD) where appropriate: `WebSite` schema on the homepage, `Article` or `ScholarlyArticle` on content pages, `BreadcrumbList` on all pages.
- Set canonical URLs on all pages. Ensure consistent URL format (decide on trailing slash or no trailing slash and apply uniformly).

### 5b. GenAI Optimization

The goal is to make the site's content easily parseable and citable by LLM-based search engines and AI assistants.

- Ensure each page has a concise, factual summary (2–3 sentences) near the top of the page content that an AI system could extract as a snippet.
- Use descriptive, self-contained section headings that communicate the finding (e.g., "Patent Filings Tripled Between 2000 and 2020" rather than "Results" or "Findings").
- Ensure all key data points, findings, and statistics are stated in plain text in the HTML — not only embedded inside chart images or SVGs. Data that exists only in a non-text visual format is invisible to AI crawlers.

### 5c. Content SEO

- Ensure page URLs are descriptive and keyword-rich (e.g., `/patent-filing-trends` not `/chapter-3`).
- Ensure heading tags (h1–h3) include terms that researchers and policymakers would search for.
- Add internal links between related pages where they would help the reader and strengthen the site's topical structure. (This complements the cross-references added in Phase 4b — Phase 4 addressed consolidation of duplicate content; here, add navigational links between distinct but related topics.)

### 5d. Performance

- Optimize Largest Contentful Paint (LCP): lazy-load below-fold images and figures, preload critical above-fold assets, optimize font loading (use `font-display: swap` or preload key fonts).
- Minimize Cumulative Layout Shift (CLS): set explicit `width` and `height` (or `aspect-ratio`) on all images, figures, and embeds.
- Optimize Interaction to Next Paint (INP): defer non-critical JavaScript, minimize main-thread blocking.
- Compress and convert images to modern formats (WebP or AVIF) where the build pipeline supports it.
- Remove unused CSS, JavaScript, and dependencies from the bundle.
- Implement code splitting if the framework supports it and it is not already in place.

### 5e. Accessibility

- Ensure all images and figures have meaningful `alt` text that describes the content (not just "figure" or "chart").
- Verify heading hierarchy: one `h1` per page, then `h2`, `h3`, etc. with no skipped levels.
- Check that text and interactive elements meet WCAG AA color contrast ratios (4.5:1 for normal text, 3:1 for large text).
- Ensure the site is fully navigable via keyboard (Tab, Enter, Escape).

---

## PHASE 6: Navigation

Verify all navigation elements are correct and functional after the changes made in Phases 1–5.

- Sidebar, table of contents, and all navigation menus must accurately reflect the current page order and ACT structure.
- Breadcrumbs must be present and correct on every page.
- Previous/next page links (if present) must follow the correct sequence.
- All internal links site-wide must resolve to valid pages (no 404s). Test every internal link.
- Test all navigation elements at mobile viewport widths.
- For long pages, ensure "jump to section" or anchor links exist and work correctly.

---

## PHASE 7: Bug Fixes and Final QA

### 7a. Errors

- Fix all browser console errors, warnings, and runtime exceptions.
- Fix any rendering issues visible in Chrome and Firefox (these are the two browsers you can test in the dev environment).
- Fix any framework-specific issues (e.g., hydration mismatches, SSR/SSG errors) if applicable.

### 7b. Code Cleanup

- Remove unused files, components, styles, and dependencies from the codebase.
- Consolidate duplicated logic into shared utilities or components.

### 7c. Final Build Verification

- Run the production build (`npm run build` or equivalent). It must complete with zero errors. Warnings should be resolved where possible.
- Run the linter and type checker if configured. Fix all errors; resolve warnings where reasonable.
- Start the production build locally and spot-check several pages to confirm correct rendering.

### 7d. Final AUDIT_LOG Review

- Review `AUDIT_LOG.md` for completeness. Ensure every change and every flagged item across all phases is logged.
- Add a final summary section to `AUDIT_LOG.md` listing: total changes made, total items flagged for author review, and any known remaining issues.

---

## General Guidelines

- ACCURACY IS THE TOP PRIORITY. Never fabricate, invent, or assume information. If you cannot verify something, flag it in `AUDIT_LOG.md` for the author — do not guess.
- When a claim is partially correct but overstated, revise it to be precisely accurate rather than removing it entirely. Only remove claims that are outright false and cannot be salvaged.
- Do not introduce new claims, findings, statistics, or interpretations that are not already present in the source material.
- Maintain the author's voice and academic tone throughout all revisions.
- When phases overlap in scope (e.g., both Phase 4 and Phase 5c mention cross-references), the earlier phase handles the content/structural concern and the later phase handles the technical/SEO implementation. Do not redo work that was already completed correctly.