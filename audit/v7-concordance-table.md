# PatentWorld v7 Audit -- Concordance Table (Phase 3, Section 3.4)

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** 12 key statistics verified across homepage card, chapter page, SEO description, and JSON-LD

---

## Method

Statistics that appear in 3 or more locations across the site were tracked in a concordance table. Each value was verified against the underlying data files in `public/data/`.

## Concordance Table

| # | Statistic | Homepage Card | Chapter Page | SEO Description | JSON-LD | Data Value | Consistent? |
|---|-----------|-------------|-------------|----------------|---------|------------|-------------|
| 1 | 9.36M total patents | Hero stat | Ch1 body | Site description | Dataset description | 9,361,444 | YES |
| 2 | ~70,000 in 1976 | Hero text | Ch1 body | -- | FAQ | 70,941 | YES |
| 3 | 374,000 in 2024 | Hero text | Ch1 body | -- | FAQ | 373,852 | YES |
| 4 | Five-fold increase | Hero text | Ch1 body | -- | FAQ | 5.27x | YES |
| 5 | 27% to 57% G+H share | Hero text | Ch3 body | -- | -- | 27.0% to 57.3% | YES |
| 6 | IBM 161,888 | Card (Ch9) | Ch9 body | Ch9 SEO | FAQ JSON-LD | 161,888 | YES |
| 7 | Japan 1.45M | Card (Ch8, Ch19) | Ch8, Ch19 body | Ch8 SEO | -- | 1,448,180 | YES |
| 8 | NIH/HHS 55,587 | Card (Ch7) | Ch7 body | Ch7 SEO | -- | 55,587 | YES |
| 9 | Female 2.8% to 14.9% | Card (Ch16) | Ch16 body | Ch16 SEO | -- | Exact | YES |
| 10 | Team size 1.7 to 3.2 | Card (Ch17) | Ch17 body | Ch17 SEO | -- | Exact | YES |
| 11 | CA 23.6% share | Card (Ch18) | Ch18 body | Ch18 SEO | -- | 23.6% | YES |
| 12 | AI 5.7-fold growth | Card (Ch25) | Ch25 body | Ch25 SEO | -- | 5,201 to 29,624 = 5.7x | YES |

## Verification Notes

- **All 12 statistics are consistent** across all locations where they appear.
- The `--` entries indicate the statistic does not appear in that specific location (not all stats appear in all four columns).
- Data values are from the JSON files in `public/data/` and were verified in Phase 1 (Track A data accuracy).

## Key Fixes That Affected Concordance

| Fix | Impact on Concordance |
|-----|----------------------|
| C1 (JSON-LD denominator) | Row 1: Ensured "9.36M" in JSON-LD Dataset description matches "all patent types" denominator used in hero and chapters |
| C2 (measurement config) | Row 1: Ensured system-patent-count measurement notes match actual denominator |
| H2 (gender confounder) | Row 9: Confounder disclosure now accompanies the 14.2/12.6/9.5 citation comparison wherever it appears |

## Conclusion

All 12 concordance values are consistent across their respective locations. No conflicts detected.

---

Status: COMPLETE
