# PatentWorld -- Chapter & Section Reorganization Log

## Chapter Reordering

### Previous Order
| # | Slug | Title |
|---|------|-------|
| 1 | the-innovation-landscape | The Innovation Landscape |
| 2 | the-technology-revolution | The Technology Revolution |
| 3 | who-innovates | Who Innovates? |
| 4 | the-inventors | The Inventors |
| 5 | the-geography-of-innovation | The Geography of Innovation |
| 6 | collaboration-networks | Collaboration Networks |
| 7 | the-knowledge-network | The Knowledge Network |
| 8 | innovation-dynamics | Innovation Dynamics |
| 9 | patent-quality | Patent Quality |
| 10 | patent-law | Patent Law & Policy |
| **11** | **green-innovation** | **The Green Innovation Race** |
| **12** | **ai-patents** | **Artificial Intelligence** |
| 13 | the-language-of-innovation | The Language of Innovation |
| 14 | company-profiles | Company Innovation Profiles |

### New Order
| # | Slug | Title | Act |
|---|------|-------|-----|
| 1 | the-innovation-landscape | The Innovation Landscape | I: The System |
| 2 | the-technology-revolution | The Technology Revolution | I: The System |
| 3 | who-innovates | Who Innovates? | II: The Actors |
| 4 | the-inventors | The Inventors | II: The Actors |
| 5 | the-geography-of-innovation | The Geography of Innovation | III: The Structure |
| 6 | collaboration-networks | Collaboration Networks | III: The Structure |
| 7 | the-knowledge-network | The Knowledge Network | IV: The Mechanics |
| 8 | innovation-dynamics | Innovation Dynamics | IV: The Mechanics |
| 9 | patent-quality | Patent Quality | IV: The Mechanics |
| 10 | patent-law | Patent Law & Policy | V: Deep Dives |
| **11** | **ai-patents** | **Artificial Intelligence** | **V: Deep Dives** |
| **12** | **green-innovation** | **The Green Innovation Race** | **V: Deep Dives** |
| 13 | the-language-of-innovation | The Language of Innovation | V: Deep Dives |
| 14 | company-profiles | Company Innovation Profiles | V: Exploratory |

### Rationale
Chapters 11 and 12 were swapped to match the recommended narrative arc in Formatting.md. AI Patents (formerly #12) moves to #11 as the first thematic deep dive, since it connects most directly to Patent Law & Policy (the preceding chapter) through patent eligibility questions raised by Alice Corp. v. CLS Bank. Green Innovation (formerly #11) moves to #12, maintaining the domain-specific deep dive flow.

---

## Files Modified

### Core Configuration
- **`src/lib/constants.ts`**: Swapped chapter entries for green-innovation (#11->#12) and ai-patents (#12->#11); updated all relatedChapters arrays referencing 11 or 12
- **`src/components/chapter/ChapterHeader.tsx`**: Swapped gradient colors for chapters 11 and 12
- **`src/lib/types.ts`**: Updated chapter number comments

### Chapter Pages -- Number Updates
- **`src/app/chapters/ai-patents/page.tsx`**: ChapterHeader number={12}->{11}, ChapterNavigation/RelatedChapters currentChapter={12}->{11}
- **`src/app/chapters/green-innovation/page.tsx`**: ChapterHeader number={11}->{12}, ChapterNavigation/RelatedChapters currentChapter={11}->{12}; changed "Chapter 11" text reference to "the Artificial Intelligence chapter"

### Chapter Pages -- Transition Updates
- **`src/app/chapters/patent-law/page.tsx`**: Transition updated from "green innovation" to "artificial intelligence" (AI is now the next chapter)
- **`src/app/chapters/ai-patents/page.tsx`**: Transition updated from "language of innovation" to "green innovation" (Green is now the next chapter)
- **`src/app/chapters/green-innovation/page.tsx`**: Transition updated from "artificial intelligence" to "language of innovation"

### Related Chapters Updates (constants.ts)
| Chapter | Previous relatedChapters | New relatedChapters | Reason |
|---------|------------------------|--------------------|---------|
| 7 (Knowledge Network) | [2, 9, 10, 11] | [2, 9, 10, 12] | 11 was Green (now 12) |
| 10 (Patent Law) | [7, 9, 12] | [7, 9, 11] | 12 was AI (now 11) |
| 11 (AI, was 12) | [2, 4, 10, 11] | [2, 4, 10, 12] | 11 was Green (now 12) |
| 12 (Green, was 11) | [2, 5, 12, 13] | [2, 5, 11, 13] | 12 was AI (now 11) |
| 13 (Language) | [2, 7, 11] | [2, 7, 12] | 11 was Green (now 12) |

---

## TL;DR Label Fixes

| Chapter | Previous Label | New Label | File |
|---------|---------------|-----------|------|
| 4 (The Inventors) | "Chapter Summary" | "TL;DR" | the-inventors/page.tsx:165 |
| 5 (Geography) | "Chapter Summary" | "TL;DR" | the-geography-of-innovation/page.tsx:176 |

---

## Transition / Cross-Reference Additions

| Chapter | Change |
|---------|--------|
| 7 (Knowledge Network) | Added concluding transition paragraph pointing to Innovation Dynamics (was missing) |
| 10 (Patent Law) | Updated transition: "green innovation" -> "artificial intelligence" |
| 11 (AI Patents) | Updated transition: "language of innovation" -> "green innovation" |
| 12 (Green Innovation) | Updated transition: "artificial intelligence" -> "language of innovation" |

---

## Within-Chapter Section Reordering

### Chapter 14 (Company Innovation Profiles) -- MAJOR RESTRUCTURE

**Previous section order:**
1. A1: Interactive Company Profiles (individual dashboards)
2. A2: Innovation Trajectory Archetypes
3. A3: Corporate Mortality
4. B1: Portfolio Diversification
5. B2: Technology Pivot Detection
6. B3: Patent Market Concentration

**New section order (broad-to-specific progression):**
1. A3: Corporate Mortality (broad overview -- who are the top filers across decades?)
2. A2: Innovation Trajectory Archetypes (primary decomposition -- what patterns emerge?)
3. B1: Portfolio Diversification (secondary decomposition -- how do firms differ?)
4. B3: Patent Market Concentration (secondary decomposition -- how concentrated is each sector?)
5. B2: Technology Pivot Detection (analytical deep dive -- when do firms shift strategy?)
6. A1: Interactive Company Profiles (interactive deep dive -- explore individual companies)

**Rationale:** The original order placed the interactive company selector first, which is the most granular view. The reorganized order follows the required section progression: broad aggregate overview -> patterns -> decompositions -> analytical deep dives -> interactive exploration. Users now encounter the macro landscape before drilling into individual companies.

---

## Section Order Audit Summary

| Chapter | TL;DR Present | Section Order | Transition | Notes |
|---------|:---:|:---:|:---:|-------|
| 1. Innovation Landscape | Yes | Correct | Yes | KeyFindings + TL;DR both present |
| 2. Technology Revolution | Yes | Correct | Yes | Deep dives (half-life, S-curves) properly at end |
| 3. Who Innovates? | Yes | Correct | Yes | Deep dives after decompositions |
| 4. The Inventors | **Fixed** | Acceptable | Yes | Fixed "Chapter Summary" -> "TL;DR" |
| 5. Geography | **Fixed** | Acceptable | Yes | Fixed "Chapter Summary" -> "TL;DR" |
| 6. Collaboration Networks | Yes | Correct | Yes | Well-structured |
| 7. Knowledge Network | Yes | Correct | **Added** | Added missing transition paragraph |
| 8. Innovation Dynamics | Yes | Correct | Yes | Well-structured |
| 9. Patent Quality | Yes | Correct | Yes | Minor: two self-citation sections (progressive deepening) |
| 10. Patent Law & Policy | Yes | Correct | **Updated** | Transition updated for chapter swap |
| 11. AI Patents | Yes | Correct | **Updated** | Transition updated for chapter swap |
| 12. Green Innovation | Yes | Correct | **Updated** | Transition updated for chapter swap |
| 13. Language of Innovation | Yes | Correct | Yes | Well-structured |
| 14. Company Profiles | Yes | **Restructured** | Yes | Major reorder (see above) |

---

## Navigation Verification

All navigation is driven by the `CHAPTERS` array in `constants.ts`:
- **Home page chapter grid**: Renders from CHAPTERS array in order -- automatically updated
- **Chapter sidebar**: Uses CHAPTERS array -- automatically updated
- **Previous/Next navigation**: Uses `c.number === currentChapter +/- 1` -- works correctly with swapped numbers
- **Related Chapters**: Uses chapter numbers from relatedChapters arrays -- all updated
- **SEO metadata**: Uses chapter slug lookup -- unaffected by number swap

---

## Build Verification

```
npm run build -> Compiled successfully
All 22 routes prerendered as static content
No TypeScript errors, no runtime errors
```

---

*Reorganization completed 2026-02-13. Chapters reordered, section ordering audited, transitions updated, TL;DR labels fixed.*
