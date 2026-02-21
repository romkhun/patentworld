# Required Edits to Patent Law Chapter

## File: `/home/saerom/projects/patentworld/src/app/chapters/patent-law/page.tsx`

---

## EDIT 1: Bayh-Dole Act (1980) - Line ~45-48
### ACTION: DELETE entire entry

```typescript
      {
        citation: 'Hvide, H. K., & Jones, B. F. (2018). University innovation and the professor's privilege. American Economic Review, 108(7), 1860–1898. https://doi.org/10.1257/aer.20160284',
        summary: 'Studying Norway's 2003 abolition of the "professor's privilege" (moving to a Bayh-Dole–like model where universities hold IP rights), the authors find a 50 percent decline in both entrepreneurship and patenting rates by university researchers, with quality measures also declining—providing causal evidence on the effects of Bayh-Dole–style IP regimes.',
      },
```

**Reason:** Studies Norway's 2003 reform, not 1980 U.S. Bayh-Dole Act. Fails Test 4 (direct examination).

---

## EDIT 2: TRIPS Agreement (1994) - Line ~122-124
### ACTION: DELETE entry

```typescript
      {
        citation: 'Helpman, E. (1993). Innovation, imitation, and intellectual property rights. Econometrica, 61(6), 1247–1280. https://doi.org/10.2307/2951642',
        summary: 'In a dynamic general equilibrium framework where the North invents and the South imitates, strengthening IPR in the South does not necessarily improve global or Southern welfare. The effects depend on the balance of terms-of-trade, production composition, and product availability channels.',
      },
```

**Reason:** Published 1993, BEFORE TRIPS (1994). Theory paper, not empirical study of TRIPS. Fails Tests 3 & 4.

---

## EDIT 3: TRIPS Agreement (1994) - Line ~125-128
### ACTION: DELETE entry

```typescript
      {
        citation: 'Grossman, G. M., & Lai, E. L.-C. (2004). International protection of intellectual property. American Economic Review, 94(5), 1635–1653. https://doi.org/10.1257/0002828043052312',
        summary: 'Non-cooperative equilibria generally provide inadequate IP protection from the perspective of world welfare. Harmonization of patent policies (as pursued through TRIPS) is neither necessary nor sufficient for global efficiency.',
      },
```

**Reason:** Theoretical model, not empirical study of TRIPS effects. Fails Test 4.

---

## EDIT 4: TRIPS Agreement (1994) - Line ~141-144
### ACTION: DELETE entry

```typescript
      {
        citation: 'Moser, P. (2005). How do patent laws influence innovation? Evidence from nineteenth-century world's fairs. American Economic Review, 95(4), 1214–1236. https://doi.org/10.1257/0002828054825501',
        summary: 'Countries without patent laws produced as many innovations as those with them, but innovation was concentrated in sectors where secrecy provided protection. Patent laws channel innovation toward patent-sensitive industries rather than increasing overall innovation.',
      },
```

**Reason:** Studies 19th century patent laws, not TRIPS. Fails Test 4.

---

## EDIT 5: State Street Bank (1998) - Line ~173-176
### ACTION: DELETE entry

```typescript
      {
        citation: 'Lerner, J. (2002). 150 years of patent protection. American Economic Review, 92(2), 221–225. https://doi.org/10.1257/000282802320189294',
        summary: 'Examining 177 patent policy changes across 60 countries over 150 years, strengthening patent protection (including expanding patentable subject matter) has few positive effects on domestic patent applications.',
      },
```

**Reason:** Cross-country study of 150 years, not specific to State Street decision. Fails Test 4.

---

## EDIT 6: Bilski v. Kappos (2010) - Lines ~257-265
### ACTION: DELETE all entries and ADD "No Study" notice

**DELETE:**
```typescript
    research: [
      {
        citation: 'Cockburn, I. M., & MacGarvie, M. J. (2011). Entry and patenting in the software industry. Management Science, 57(5), 915–933. https://doi.org/10.1287/mnsc.1110.1321',
        summary: 'Expanded software and business method patentability created barriers to entry. The holding in Bilski v. Kappos narrowed business method patent eligibility from the broad State Street standard, addressing the deterrent effects on new firm entry documented in this study.',
      },
      {
        citation: 'Hegde, D., Ljungqvist, A., & Raj, M. (2022). Quick or broad patents? Evidence from U.S. startups. The Review of Financial Studies, 35(6), 2705–2742. https://doi.org/10.1093/rfs/hhab097',
        summary: 'Broader patent scope increases a startup's future growth but imposes negative externalities on rivals' innovation. As the holding in Bilski v. Kappos narrowed the scope of business method patents, the findings illuminate the tradeoffs in patent eligibility decisions.',
      },
    ],
```

**REPLACE WITH:**
```typescript
    research: [
      {
        citation: 'No empirical study of this decision's effects has been identified in a leading peer-reviewed journal.',
        summary: '',
      },
    ],
```

**Reason:** Cockburn & MacGarvie (2011) studies 1990-2004, not Bilski. Hegde et al (2022) is general patent scope study, not Bilski-specific. Both fail Test 4.

---

## EDIT 7: AIA First-Inventor-to-File (2013) - Lines ~300-305
### ACTION: DELETE entry and ADD "No Study" notice

**DELETE:**
```typescript
    research: [
      {
        citation: 'Lerner, J. (2009). The empirical impact of intellectual property rights on innovation: Puzzles and clues. American Economic Review, 99(2), 343–348. https://doi.org/10.1257/aer.99.2.343',
        summary: 'Examining major patent policy shifts across 60 nations over 150 years, there is little evidence that changes such as first-to-file vs. first-to-invent meaningfully alter domestic research investments.',
      },
    ],
```

**REPLACE WITH:**
```typescript
    research: [
      {
        citation: 'No empirical study of this provision's effects has been identified in a leading peer-reviewed journal.',
        summary: '',
      },
    ],
```

**Reason:** Published 2009, BEFORE 2013 implementation. Studies 60 nations over 150 years, not AIA specifically. Fails Tests 3 & 4.

---

## EDIT 8: Alice Corp. v. CLS Bank (2014) - Lines ~333-336
### ACTION: DELETE entry

```typescript
      {
        citation: 'Cockburn, I. M., & MacGarvie, M. J. (2011). Entry and patenting in the software industry. Management Science, 57(5), 915–933. https://doi.org/10.1287/mnsc.1110.1321',
        summary: 'Expanded software patentability had created significant entry barriers—a 10% increase in relevant patents reduces entry by 3–8%. The holding in Alice Corp. v. CLS Bank International substantially restricted abstract-idea software patents, addressing these innovation costs.',
      },
```

**Reason:** Published 2011, BEFORE Alice (2014). Studies 1990-2004 period. Fails Tests 3 & 4.

**Note:** Keep this paper under State Street (1998) where it's appropriately cited.

---

## SUMMARY

**Total Edits:** 8 sections, 9 paper citations removed

**Sections with "No Study" notices added:** 2
- Bilski v. Kappos (2010)
- AIA First-Inventor-to-File (2013)

**Papers completely removed from chapter:**
1. Hvide & Jones (2018)
2. Helpman (1993)
3. Grossman & Lai (2004)
4. Moser (2005) [from TRIPS]
5. Lerner (2002)
6. Lerner (2009)
7. Hegde, Ljungqvist & Raj (2022) [from Bilski]

**Papers removed from one section but kept in others:**
- Cockburn & MacGarvie (2011) - Removed from Bilski and Alice, kept under State Street

**Papers remaining:** 44 verified peer-reviewed studies

---

## IMPLEMENTATION NOTES

Due to Unicode character encoding in the source file (using \u2019 for apostrophes, \u2013 for en-dashes, etc.), manual editing may be required. The exact character sequences must match the file's encoding.

Alternatively, use a find-and-replace tool that can handle Unicode, or edit the file in an IDE that displays the actual characters rather than escape sequences.

Each deletion should also check for and remove any trailing commas that would result in syntax errors.
