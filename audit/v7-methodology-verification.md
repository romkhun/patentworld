# PatentWorld v7 Audit -- Methodology Verification (Track C)

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** Track C methodology verification
**Baseline:** `audit/derived-metrics-registry.md` (v6, 39 derived metrics catalogued)

---

## Method

All derived metrics were traced from their computation in `data-pipeline/` scripts through to their display on chapter pages and the Methodology page. Definitions were compared against standard academic references.

## Track C Results Summary

### Entropy Scales Disambiguated (v6 fix, confirmed in v7)

The site uses Shannon entropy in 5 distinct contexts with 3 different scales and 2 different log bases:

| Context | Log Base | Scale | Typical Values | Label Ambiguous? |
|---------|----------|-------|----------------|-----------------|
| Portfolio diversity (CPC subclass) | LN (nats) | Raw | 4.0--7.1 | Somewhat (no unit label) |
| Topic novelty (NMF 25 topics) | log2 (bits) | Raw | 1.97--2.10 | No -- unit specified |
| Inventor specialization (CPC section) | log2 (bits) | Raw | <0.5 specialist, >1.5 generalist | Somewhat |
| Subfield diversity (Act 6) | LN (cancels) | Normalized [0,1] | 0.32--0.97 | No -- "Diversity Index" label |
| Gov agency breadth | N/A | 1-HHI (NOT entropy) | varies | YES -- mislabeled as "Shannon Entropy" |

The v6 audit identified and addressed entropy label ambiguities. The Methodology page now provides context for the different entropy scales used.

### Blockbuster Cohort Standardized

The "blockbuster" patent definition (top 1% of forward citations within grant-year cohort, 5-year window) is consistently applied across all chapters that reference it. The org-patent-quality chapter and all 12 deep-dive chapters use the same threshold.

### Gender Inference Disclosed

- Name-based gender inference methodology disclosed on the inv-gender chapter page (`inv-gender/page.tsx:614--616`).
- Error rate acknowledgment present: "Accuracy of name-based gender inference varies by cultural and geographic context, with higher error rates for names common in East Asian, South Asian, and other non-Western naming traditions."
- **H2 fix (v7):** Confounder disclosure added to homepage card and JSON-LD description in `constants.ts:134`. Measurement limitation note now accompanies all gender citation comparisons.

### Modified Gini Undefined (H6, DEFERRED)

- The org-patent-count chapter uses a "modified Gini" coefficient that produces values outside the standard [0,1] range (e.g., -0.069).
- The Methodology page defines the standard Gini coefficient but does not define the "modified" variant.
- **Deferred:** Requires a formal mathematical definition with formula, domain specification, and interpretation guide.

### Measurement Config Fixed (C2)

- `chapterMeasurementConfig.ts:11` previously stated "Utility patents only" for system-patent-count.
- The actual data includes all patent types (utility, design, plant, reissue) totaling 9.36M.
- **Fixed:** Changed to "All patent types."

### Other Metrics Verified

| Metric | Implementation Match | Consistent Across Pages |
|--------|---------------------|------------------------|
| Originality (1-HHI) | Partial -- CPC section level, not subclass | YES |
| Generality (1-HHI) | Partial -- CPC section level | YES |
| Forward citations (5-year window) | Standard | YES |
| CR4 (top-4 concentration) | Standard | YES |
| Pielou evenness (normalized entropy) | Standard | YES |
| Patent velocity (patents/year) | Standard | YES |

---

Status: COMPLETE
