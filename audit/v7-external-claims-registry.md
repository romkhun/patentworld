# PatentWorld v7 Audit -- External Claims Registry

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** External claims categorization and verification
**Baseline:** `audit/external-claims-registry.md` (v6, 175 claims)

---

## Method

External factual assertions -- claims not derived from the site's own PatentsView data analysis -- were extracted from all chapter and non-chapter pages and categorized by type.

## Category Summary

| Category | Count | Description |
|----------|-------|-------------|
| LAW | 21 | Patent statutes, regulations, effective dates |
| CASE | 13 | Court decisions, holdings, case citations |
| POLICY | 8 | Patent office policies, institutional changes |
| INSTITUTION | 24 | Facts about organizations, companies, agencies |
| TECHNOLOGY_CONTEXT | 47 | Claims about technologies, dates, milestones |
| COMPARATIVE | 2 | Data compared to external benchmarks |
| HISTORY | 13 | Historical events, dates, legislative histories |
| DEFINITION | 2 | Legal or technical term definitions |
| METHODOLOGY | 6 | References to established methods |
| CITATION | 45 | Academic papers, books, reports |
| **TOTAL** | **181** | |

## v6 Baseline

The v6 audit (`audit/external-claims-registry.md`) catalogued 175 claims. The v7 audit identified 6 additional claims from pages updated since v6 (FAQ additions, About page expansions), bringing the total to 181.

## Patent Law Timeline

The Patent Law chapter (`system-patent-law/page.tsx`) contains 21 legislative and judicial events spanning 1980--2025:

1. Bayh-Dole Act (1980)
2. Stevenson-Wydler Act (1980)
3. Federal Circuit Created (1982)
4. Hatch-Waxman Act (1984)
5. TRIPS Agreement (1994)
6. GATT Patent Term Change (1995)
7. State Street Bank v. Signature (1998)
8. American Inventors Protection Act (1999)
9. USPTO 21st Century Strategic Plan (2003)
10. eBay v. MercExchange (2006)
11. KSR v. Teleflex (2007)
12. Bilski v. Kappos (2010)
13. America Invents Act (2011)
14. AIA First-to-File Effective (2013)
15. Myriad Genetics (2013)
16. Alice Corp. v. CLS Bank (2014)
17. TC Heartland v. Kraft Foods (2017)
18. Oil States v. Greene's Energy (2018)
19. SAS Institute v. Iancu (2018)
20. Executive Order on Competition (2021)
21. Proposed PREVAIL Act & PERA (2025)

In v6, 5 Patent Law date errors were corrected. The remaining 16/21 events were verified in v6 against authoritative sources (Congress.gov, Justia, Wikipedia). The v7 audit re-confirmed all 21/21 events as accurate.

## Verification Status

Full verification results are documented in `audit/v7-external-claims-verification.md`. Overall accuracy: 175/181 full matches (96.7%), 5 minor notes (2.8%), 1 mismatch (0.6%).

The single mismatch (Azoulay et al. 2019 journal citation) was identified in v6 and flagged for correction.

---

Status: COMPLETE
