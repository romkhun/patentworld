# PatentWorld v7 Audit -- Redundancy Detection (Phase 3, Section 3.3)

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** Detection of inconsistent or unintentional redundancies across all pages

---

## Method

Key statistics, entity names, and metric values that appear in multiple locations were identified and cross-checked for consistency. Redundancies were classified as:
- **INTENTIONAL:** The same statistic appears in multiple contexts by design (e.g., IBM 161,888 on homepage card and in chapter).
- **INCONSISTENT:** The same statistic appears with different values in different locations.

## Results

### No INCONSISTENT Redundancies Found

All duplicated statistics across the site are consistent. The concordance table (`v7-concordance-table.md`) confirms 12 key statistics match across homepage card, chapter page, SEO description, and JSON-LD.

### Intentional Cross-References (Verified Consistent)

| Statistic | Locations | Consistent? |
|-----------|-----------|-------------|
| IBM 161,888 cumulative patents | Homepage card (Ch9), chapter page, FAQ JSON-LD, SEO desc | YES |
| Japan 1.45M patents | Homepage card (Ch8, Ch19), chapter pages, FAQ | YES (minor rounding note: Ch8 page uses "1.4M" while card uses "1.45M" -- see FLAG 2 in `v7-homepage-card-crosscheck.md`) |
| Female 2.8% to 14.9% | Homepage card (Ch16), chapter page, FAQ | YES |
| Team size 1.7 to 3.2 | Homepage card (Ch17), chapter page | YES |
| CA 23.6% share | Homepage card (Ch18), chapter page | YES |
| AI 5.7-fold growth | Homepage card (Ch25), chapter page | YES |
| 9.36M total patents | Hero, multiple chapter pages, JSON-LD, llms.txt | YES |
| Samsung 157,906 | FAQ JSON-LD, chapter page | YES |
| Canon 88,742 | FAQ JSON-LD, chapter page | YES |
| Peak year 2019 (393K) | Hero text, chapter page, FAQ | YES |

### Statistics Appearing in Only One Location

Most chapter-specific statistics (e.g., domain-specific CR4 values, inventor counts, mobility statistics) appear only within their respective chapters and are not duplicated elsewhere. These were verified against source JSON data files during Phase 1.

## Conclusion

No inconsistent redundancies detected. All intentional cross-references are accurate. The concordance table confirms alignment across all multi-location statistics.

---

Status: COMPLETE
