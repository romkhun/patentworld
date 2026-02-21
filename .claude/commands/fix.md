# PatentWorld — Academic Reference Audit for Patent Law & Policy Chapter

## Objective

Conduct a rigorous audit of every academic paper referenced in the Patent Law & Policy chapter of PatentWorld. This audit has three components:

1. **Research**: For each legal or policy change discussed in the chapter, conduct an extensive search for high-quality academic papers from a defined set of top economics and management journals that empirically examine that specific legal/policy change.
2. **Relevance verification**: For every paper currently cited in the chapter, verify that (a) it is published in one of the listed journals, (b) it specifically examines the legal/policy change it is listed under, and (c) it is a published article (not a working paper). Remove any paper that fails any of these three tests.
3. **Summary accuracy**: For every paper that passes the relevance check, verify that the chapter's summary accurately represents the paper's research question, methodology, and findings. Correct any inaccurate summaries.

---

## Strict Inclusion Criteria

### Eligible Journals — Exhaustive List

Only papers published in the following journals may be cited in the chapter. **No exceptions.**

**Economics (Top 5):**
1. American Economic Review (AER)
2. Quarterly Journal of Economics (QJE)
3. Journal of Political Economy (JPE)
4. Review of Economic Studies (REStud / RES)
5. Econometrica

**Economics (Field Journals):**
6. American Economic Journal: Economic Policy (AEJ: Policy)
7. American Economic Journal: Applied Economics (AEJ: Applied)
8. American Economic Journal: Microeconomics (AEJ: Micro)
9. Review of Economics and Statistics (REStat)
10. RAND Journal of Economics
11. Journal of the European Economic Association (JEEA)
12. Journal of Law and Economics
13. Journal of Law, Economics, and Organization
14. Journal of Financial Economics (JFE)
15. Review of Financial Studies (RFS)
16. Journal of Finance

**Management & Strategy:**
17. Management Science
18. Organization Science
19. Administrative Science Quarterly (ASQ)
20. Strategic Management Journal (SMJ)
21. Academy of Management Journal (AMJ)

**Innovation & Science Policy:**
23. Research Policy

### Excluded — Do NOT Cite Any of the Following

**Unpublished work of any kind:**
- NBER Working Papers (even if by prominent authors)
- SSRN preprints or working papers
- CEPR Discussion Papers
- University working paper series (e.g., Harvard Business School Working Papers, Stanford GSB Research Papers)
- Federal Reserve working papers or discussion papers
- Conference papers or proceedings not subsequently published in a listed journal
- Dissertations or theses
- Papers listed only on an author's personal website without a published journal version

**Published but not in listed journals:**
- Law reviews (e.g., Stanford Law Review, Yale Law Journal, Harvard Law Review) — even if they contain empirical analysis
- Practitioner publications (e.g., Harvard Business Review, MIT Sloan Management Review)
- Books or book chapters
- Government reports (e.g., USPTO Economic Working Papers, FTC reports, GAO reports)
- Trade publications or industry reports
- Blog posts, op-eds, or news articles
- Non-peer-reviewed outlets

**How to handle borderline cases:**
- If a paper exists as both an NBER Working Paper and a published journal article in a listed journal, cite **only** the published journal version with the journal's URL. Do not mention or link to the NBER version.
- If a paper has been published in a journal not on the list, do not cite it regardless of its quality or citation count.
- If you can only find a working paper version and cannot confirm publication in a listed journal, do **not** include it.

---

### Hyperlink Requirement

Every cited paper must include a **direct hyperlink to the paper on the journal's own website**. This means the URL domain must be one of the following (or the journal's actual domain):

| Journal | Acceptable URL Domain |
|---|---|
| AER, AEJ journals | `www.aeaweb.org/articles` or `doi.org` resolving to AEA |
| QJE | `academic.oup.com/qje` |
| JPE | `www.journals.uchicago.edu/journal/jpe` |
| REStud | `academic.oup.com/restud` |
| Econometrica | `www.econometricsociety.org` or `onlinelibrary.wiley.com/journal/14680262` |
| REStat | `direct.mit.edu/rest` |
| RAND Journal of Economics | `onlinelibrary.wiley.com/journal/17562171` |
| JEEA | `academic.oup.com/jeea` |
| J. Law & Economics | `www.journals.uchicago.edu/journal/jle` |
| J. Law, Econ. & Organization | `academic.oup.com/jleo` |
| JFE | `www.sciencedirect.com/journal/journal-of-financial-economics` |
| RFS | `academic.oup.com/rfs` |
| J. Finance | `onlinelibrary.wiley.com/journal/15406261` |
| Management Science | `pubsonline.informs.org/journal/mnsc` |
| Organization Science | `pubsonline.informs.org/journal/orsc` |
| ASQ | `journals.sagepub.com/home/asq` |
| SMJ | `onlinelibrary.wiley.com/journal/10970266` |
| AMJ | `journals.aom.org/journal/amj` |
| AMR | `journals.aom.org/journal/amr` |
| Research Policy | `www.sciencedirect.com/journal/research-policy` |

**How to obtain the URL:**
1. Search for the paper's exact title on the journal's website or via `doi.org/[DOI]`.
2. The URL should resolve to the paper's abstract or landing page on the journal site.
3. A DOI link (e.g., `https://doi.org/10.1257/aer.20151398`) is acceptable because it redirects to the journal's page.
4. **Not acceptable**: Google Scholar links, SSRN links, NBER links, ResearchGate links, author's personal website links, university repository links, or PDF download links from unofficial sources.

If you cannot find a journal-website URL for a paper, **do not include it** — this likely means the paper is not actually published in the claimed journal.

---

## Step 0: Read the Current Chapter

1. Locate the Patent Law & Policy chapter in the codebase. Read the full source file.

2. Extract a structured inventory of every legal/policy change discussed. For each, record:
   - **Policy name** (e.g., "America Invents Act")
   - **Year enacted or decided**
   - **Brief description** as stated in the chapter
   - **All academic papers currently cited**, including: author(s), title, journal, year, summary text, and any URL currently provided

3. Save this inventory to `PATENT_LAW_REFERENCE_INVENTORY.md`.

---

## Step 1: Research — Find Published Papers for Each Policy Change

For each legal/policy change in the chapter, search for empirical academic papers published in the listed journals.

### 1.1 Policy Changes to Research

The chapter likely covers some or all of the following:

**Legislation:**
- **Bayh-Dole Act (1980)**: Universities and small businesses retain ownership of federally funded inventions.
- **Federal Courts Improvement Act (1982)**: Created the CAFC for centralized patent appeals.
- **Hatch-Waxman Act (1984)**: Generic drug competition framework and patent term restoration.
- **Uruguay Round / TRIPS (1994, effective 1995)**: Patent term changed to 20 years from filing.
- **American Inventors Protection Act (1999)**: Required 18-month publication of applications.
- **America Invents Act (AIA, 2011)**: First-to-file, inter partes review, post-grant review.

**Supreme Court Decisions:**
- **eBay v. MercExchange (2006)**: Four-factor test for injunctions.
- **KSR v. Teleflex (2007)**: Broadened obviousness standard.
- **Bilski v. Kappos (2010)**: Narrowed business method eligibility.
- **Mayo v. Prometheus (2012)**: Two-step test for natural phenomena eligibility.
- **Myriad Genetics (2013)**: Natural DNA not patent-eligible; cDNA is.
- **Alice v. CLS Bank (2014)**: Raised the bar for software/abstract idea eligibility.
- **TC Heartland v. Kraft Foods (2017)**: Restricted patent venue.
- **Oil States v. Greene's Energy (2018)**: Upheld IPR constitutionality.
- **Arthrex v. United States (2021)**: PTAB judges unconstitutionally appointed.

### 1.2 Search Strategy

For each policy change, conduct multiple searches:

```
# Search pattern 1: Policy + journal
"America Invents Act" "American Economic Review"
"Alice" patent eligibility "Quarterly Journal of Economics"
"inter partes review" "Management Science"
Bayh-Dole university patents "Journal of Political Economy"

# Search pattern 2: Policy + causal identification
"first to file" "difference in differences" patent
"Alice" "regression discontinuity" patent 101
patent injunction eBay "instrumental variable"

# Search pattern 3: Known patent economists + policy
Galasso Schankerman patent invalidation
Sampat Williams Bayh-Dole university
Lerner patent reform
Cockburn MacGarvie Alice software patent
Graham Marco AIA first-to-file
Farre-Mensa Hegde patent examination
Hegde Luo patent publication
Autor Dorn patents China

# Search pattern 4: Google Scholar with journal filter
"America Invents Act" source:"American Economic Review"
"patent reform" source:"Quarterly Journal of Economics"
"patent eligibility" source:"Management Science"
```

### 1.3 Verification Protocol for Each Paper Found

**This protocol is mandatory for every paper. Do not skip any step.**

1. **Search for the exact paper title** in quotes on Google Scholar or the journal website.

2. **Confirm publication in a listed journal.** Verify the journal name is exactly one of the 23 journals in the eligible list. If the paper appears only as a working paper (NBER, SSRN, etc.) with no published journal version, **discard it immediately**.

3. **Obtain the journal-website URL.** Navigate to the paper's page on the journal's own website (not Google Scholar, not SSRN, not the author's homepage). Copy the URL. If you cannot find a journal-website URL, **discard the paper** — it is likely not published in the claimed journal.

4. **Read the abstract** on the journal page. Confirm:
   - The paper empirically examines the specific policy change you are researching (not merely mentioning it).
   - The authors, title, year, volume, and issue match your records.

5. **Record all details.** Only after completing steps 1–4, record the paper with all required fields.

### 1.4 Required Fields for Each Paper

```markdown
### [Authors] ([Year])
- **Title**: "[Exact title]"
- **Journal**: [Full journal name]
- **Publication details**: [Year], Vol. [X], No. [Y], pp. [A]–[B]
- **URL**: [Direct link to paper on journal website or DOI link]
- **Policy change examined**: [Specific policy change]
- **Research question**: [1–2 sentences]
- **Methodology**: [Empirical approach: DiD, RD, IV, event study, structural, descriptive]
- **Key finding**: [2–3 sentences summarizing the main result]
- **Relevance**: HIGH (primary focus is this policy change) / MEDIUM (examines this policy change as one of several topics)
- **Verification**: [How confirmed — e.g., "Abstract read on journal website at [URL]"]
```

**Discard any paper where any of the following is true:**
- Cannot confirm publication in a listed journal
- Cannot obtain a journal-website URL
- Cannot read the abstract to confirm relevance
- The paper is a working paper, preprint, discussion paper, or "forthcoming"
- The paper studies a different policy change than the one being researched
- The paper merely mentions the policy change without empirically examining it

### 1.5 Deliverable

Create `PATENT_LAW_PAPERS_RESEARCH.md` organized by policy change. Include only papers that passed the full verification protocol. At the end of each policy change section, note:

```markdown
**Papers discarded during research:**
- [Author] ([Year]), "[Title]" — Reason: [e.g., "NBER Working Paper only; no published journal version found," "Published in Stanford Law Review, not a listed journal," "Studies patent trolls generally, does not specifically examine the AIA"]
```

---

## Step 2: Verify Relevance of Currently Cited Papers

For every paper currently cited in the chapter, apply the following three-gate test. A paper must pass **all three gates** to remain.

### Gate 1: Publication Verification

- Search for the paper by title on Google Scholar and the claimed journal's website.
- **Is the paper published in one of the 23 listed journals?**
  - If YES → proceed to Gate 2.
  - If NO (published in unlisted journal, or only exists as working paper/preprint) → **REMOVE. Record reason.**
  - If CANNOT FIND (no evidence the paper exists at all) → **REMOVE. Record as "Paper not found; likely does not exist."**

- **Can you obtain a direct URL on the journal's website?**
  - If YES → record it. Proceed to Gate 2.
  - If NO → **REMOVE. If the journal URL cannot be found, the publication claim is unverified.**

### Gate 2: Relevance Verification

- Read the paper's abstract on the journal website.
- **Does the paper specifically and empirically examine the policy change it is cited under?**
  - If YES (primary or substantial focus) → proceed to Gate 3.
  - If PARTIALLY (mentions the policy change but studies something broader) → **REMOVE from this policy section.** Check if it fits under a different policy change in the chapter; if so, move it. If not, remove entirely.
  - If NO (does not study this policy change) → **REMOVE.**

### Gate 3: Summary Accuracy (handled in Step 3)

Papers that pass Gates 1 and 2 proceed to Step 3 for summary verification.

### 2.1 Common Reasons for Removal

Document the specific reason for every removal:

| Reason Code | Description |
|---|---|
| `NOT_PUBLISHED` | Paper exists only as a working paper, preprint, or SSRN upload; no published journal version in a listed journal found |
| `WRONG_JOURNAL` | Paper is published but not in one of the 23 listed journals |
| `NOT_FOUND` | No evidence the paper exists (likely a fabricated or hallucinated citation) |
| `WRONG_POLICY` | Paper does not study the policy change it is cited under |
| `TANGENTIAL` | Paper mentions the policy change but does not empirically examine it |
| `NO_URL` | Cannot locate the paper on any journal website; publication claim unverified |
| `DUPLICATE` | Same paper cited more than once |

### 2.2 Deliverable

Create `PATENT_LAW_CITATION_VERIFICATION.md`:

```markdown
## [Policy Change Name]

### Paper: "[Title]" by [Authors] ([Claimed Journal], [Year])
- **Gate 1 — Published in listed journal?**: YES / NO
  - Search method: [how you searched]
  - Journal URL found: [URL or "None found"]
  - If NO, reason: [NOT_PUBLISHED / WRONG_JOURNAL / NOT_FOUND / NO_URL]
- **Gate 2 — Relevant to this policy change?**: YES / PARTIALLY / NO
  - Abstract summary: [1–2 sentences on what the paper actually studies]
  - If not relevant, reason: [WRONG_POLICY / TANGENTIAL]
- **Action**: KEEP / REMOVE
- **Removal reason code**: [if removed]
```

---

## Step 3: Verify Summary Accuracy

For every paper that passed Gates 1 and 2, verify the accuracy of its summary in the chapter.

### 3.1 Verification Process

For each paper:

1. **Read the abstract and, if accessible, the introduction and conclusion** on the journal website (using the URL obtained in Step 2).

2. **Compare the chapter's summary to the paper's actual content.** Check for:

   **Factual errors:**
   - Incorrect research question
   - Incorrect methodology described (e.g., claims "difference-in-differences" when paper uses "event study")
   - Incorrect direction of findings (e.g., "increased" when paper found "decreased")
   - Incorrect magnitude (e.g., "50% increase" when paper found "25% increase")
   - Incorrect data or sample described
   - Wrong author names or year

   **Mischaracterization:**
   - Overstating findings ("proves" when paper says "suggests")
   - Cherry-picking a secondary result while ignoring the main finding
   - Attributing findings from a different paper
   - Omitting crucial caveats or boundary conditions

3. **Classify accuracy:**
   - **ACCURATE**: Summary correctly represents question, method, and findings.
   - **MOSTLY ACCURATE**: Directionally correct with minor imprecisions. Correct with small edits.
   - **INACCURATE**: Contains a factual error about findings, methodology, or question. Must be rewritten.
   - **FABRICATED**: Describes findings that do not appear in the paper. Must be completely rewritten.

### 3.2 Summary Writing Standards

All summaries (corrected or new) must follow this format:

**Length**: 2–4 sentences.

**Structure**:
1. [Authors] ([Year]) [verb: examine / study / investigate / analyze] [specific policy change], using [methodology] and [data description].
2. They [verb: find / document / estimate / provide evidence] that [main result with direction and, if available, magnitude].
3. [Optional: additional finding, important caveat, or mechanism identified].

**Hedging language** (match to the paper's own confidence):
- Strong causal claims with credible identification: "find that," "show that"
- Suggestive evidence: "provide evidence that," "find evidence consistent with"
- Descriptive findings: "document that," "observe that"
- Specific magnitudes: "estimate a [X] percent [increase/decrease] in..."
- **Never use**: "prove," "demonstrate conclusively," "definitively show"

**Mandatory elements**:
- The specific policy change studied
- The empirical methodology (named, not vague — "difference-in-differences" not "statistical analysis")
- The direction of the main finding
- The journal name and year at the end

**Example of a correct summary:**

> Galasso and Schankerman (2015) examine the effect of patent invalidation on subsequent innovation, exploiting the quasi-random assignment of judges at the Federal Circuit as a source of exogenous variation. They find that patent invalidation leads to a 50 percent increase in citations to the focal patent's technology area, with the effect concentrated in fields characterized by fragmented patent ownership such as computers and electronics.
> — *Quarterly Journal of Economics*, 2015

**The journal URL must appear as a hyperlink** either on the paper title, the journal name, or as a standalone link. Format in the chapter's source code as:

```jsx
// Example format — adapt to match the chapter's existing code style
<p>
  Galasso and Schankerman (2015) examine the effect of patent invalidation...
  — <a href="https://doi.org/10.1093/qje/qju029" target="_blank" rel="noopener noreferrer">
    <em>Quarterly Journal of Economics</em>, 2015
  </a>
</p>
```

### 3.3 Deliverable

Create `PATENT_LAW_SUMMARY_VERIFICATION.md`:

```markdown
## [Policy Change Name]

### Paper: "[Title]" by [Authors]
- **Journal URL**: [URL]
- **Current summary in chapter**: "[exact text]"
- **Abstract on journal website**: "[key sentences from actual abstract]"
- **Accuracy classification**: ACCURATE / MOSTLY ACCURATE / INACCURATE / FABRICATED
- **Errors found**: [specific issues]
- **Corrected summary**: "[rewritten text, if needed]"
- **Corrected URL**: [journal-website URL to embed]
```

---

## Step 4: Update the Chapter

### 4.1 Remove All Ineligible Papers

Remove every paper that:
- Failed Gate 1 (not published in a listed journal, or cannot verify publication)
- Failed Gate 2 (does not specifically examine the policy change)
- Is a working paper, preprint, or unpublished manuscript
- Has no verifiable journal-website URL

### 4.2 Add Verified New Papers

For each policy change, add the most important newly found papers from Step 1. Prioritize:
1. Papers from the top-5 economics journals (AER, QJE, JPE, REStud, Econometrica).
2. Papers from field journals with the strongest causal identification.
3. Papers from management journals (Management Science, SMJ, AMJ, ASQ, Organization Science).
4. Highly-cited papers over less-cited ones.
5. More recent papers over older ones when studying the same policy change, unless the older paper is seminal.

**Target density**:
- Major policy changes (AIA, Alice, Bayh-Dole, CAFC, eBay): 2–5 papers each
- Moderate policy changes (KSR, TC Heartland, Mayo, Myriad): 1–3 papers each
- Minor or recent policy changes (Bilski, Oil States, Arthrex, AIPA): 0–2 papers each

If no published empirical study from the listed journals exists for a given policy change, state this explicitly in the chapter: "To date, no empirical study of this decision's effects has been published in a leading economics or management journal." This is an honest and informative statement — do not fill the gap with tangentially related papers.

### 4.3 Correct All Summaries

Replace every INACCURATE or FABRICATED summary with the corrected version from Step 3.

### 4.4 Add Hyperlinks

For every paper cited in the updated chapter, ensure a clickable hyperlink to the journal website is present. The link should:
- Open in a new tab (`target="_blank"`)
- Include `rel="noopener noreferrer"` for security
- Point to the paper's landing page on the journal's website (abstract page), not a PDF
- Use DOI links (`https://doi.org/...`) where available, as these are permanent

Verify every hyperlink by fetching the URL and confirming it resolves to the correct paper.

### 4.5 Consistent Reference Formatting

All references must follow a uniform format throughout the chapter. Use this template:

**In the chapter text:**
```
[Summary of 2–4 sentences describing the paper's question, method, and findings.]
— [Authors] ([Year]). "[Title]." *[Journal Name]*, [Vol]([Issue]), [Pages]. [Hyperlink]
```

Example:
```
Galasso and Schankerman (2015) examine the effect of patent invalidation on 
subsequent innovation, exploiting quasi-random judge assignment at the Federal 
Circuit. They find that invalidation increases follow-on citations by approximately 
50 percent, with effects concentrated in fields with fragmented ownership.
— Galasso, A., & Schankerman, M. (2015). "Patents and Cumulative Innovation: 
Causal Evidence from the Courts." *Quarterly Journal of Economics*, 130(1), 317–369.
https://doi.org/10.1093/qje/qju029
```

### 4.6 Final Quality Control

After all updates, verify:
- [ ] Every cited paper is published in one of the 23 listed journals — no exceptions
- [ ] Zero working papers, preprints, or unpublished manuscripts remain
- [ ] Every cited paper has a functional hyperlink to the journal website
- [ ] Every hyperlink resolves to the correct paper (test each one)
- [ ] Every paper is cited under the correct policy change
- [ ] Every summary accurately represents the paper's findings (per Step 3)
- [ ] No paper appears more than once in the chapter
- [ ] Reference formatting is consistent throughout
- [ ] The narrative remains coherent after all additions and removals
- [ ] Policy changes with no eligible papers explicitly state this

---

## Step 5: Create Verified Reference Table

Create `PATENT_LAW_VERIFIED_REFERENCES.md`:

```markdown
# Verified Academic References — Patent Law & Policy Chapter
Last verified: [date]

## Summary
- Total papers cited: [N]
- Papers in top-5 economics journals: [N]
- Papers in field economics journals: [N]
- Papers in management journals: [N]
- Policy changes with no eligible papers: [list]
- Papers removed during audit: [N]
- Papers added during audit: [N]

## Reference Table

| # | Policy Change | Authors | Year | Title | Journal | Vol(Issue) | Pages | URL | Verified |
|---|---|---|---|---|---|---|---|---|---|
| 1 | AIA (2011) | [authors] | [year] | [title] | [journal] | [vol(issue)] | [pp] | [journal URL] | ✅ |
| 2 | Alice (2014) | [authors] | [year] | [title] | [journal] | [vol(issue)] | [pp] | [journal URL] | ✅ |
| ... | | | | | | | | | |

## Papers Removed During Audit

| # | Previously Under | Authors | Year | Title | Claimed Journal | Removal Reason |
|---|---|---|---|---|---|---|
| 1 | [policy] | [authors] | [year] | [title] | [journal] | [reason code] |
| ... | | | | | | |
```

---

## Critical Rules

1. **Never fabricate a paper.** If you cannot find a relevant published paper for a policy change, state this honestly. A Wharton professor's academic reputation depends on citation accuracy. A gap is infinitely preferable to a fabricated or unverifiable citation.

2. **Never fabricate bibliographic details.** If you find a real paper but cannot confirm its volume, issue, or page numbers, mark those fields as "[details unverified]" rather than guessing.

3. **Never include unpublished work.** No NBER working papers, no SSRN preprints, no conference papers, no dissertations — regardless of author prestige or citation count. If it is not published in a listed journal, it does not appear in the chapter.

4. **Never include a paper without a journal-website URL.** The URL serves as proof of publication. If you cannot find the paper on the journal's own website, the publication claim is unverified and the paper must be excluded.

5. **Always verify through web search.** For every paper — currently cited or newly found — confirm its existence, journal, and content by searching the web. Do not rely on training data alone.

6. **Err on the side of removal.** If there is any doubt about a paper's publication status, relevance, or summary accuracy, remove it or flag it for manual review. The author can always add it back after verification.

7. **Preserve the author's narrative intent.** When removing papers, ensure the surrounding text still makes sense. If removing a paper creates a gap in the narrative, either (a) replace it with a verified paper making a similar point, or (b) revise the narrative text to not depend on the removed citation.

---

## Deliverables Summary

| File | Content |
|---|---|
| `PATENT_LAW_REFERENCE_INVENTORY.md` | Current state: every policy change and its currently cited papers |
| `PATENT_LAW_PAPERS_RESEARCH.md` | Newly found papers per policy change with full verification details and journal URLs |
| `PATENT_LAW_CITATION_VERIFICATION.md` | Gate 1 + Gate 2 results for every currently cited paper |
| `PATENT_LAW_SUMMARY_VERIFICATION.md` | Accuracy classification and corrected summaries for all retained papers |
| `PATENT_LAW_VERIFIED_REFERENCES.md` | Final reference table with URLs, removal log, and summary statistics |
| Updated chapter source file | All changes applied: removals, additions, corrected summaries, hyperlinks |