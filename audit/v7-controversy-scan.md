# PatentWorld v7 Audit -- Controversy & Sensitivity Scan (Phase 2, Section 2.3)

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6 (automated comprehensive audit)
**Scope:** All 34 chapters + support pages scanned for D1--D8 sensitivity categories
**Baseline:** `audit/sensitivity-screening.md` (v6, 47 items across 6 categories)

---

## D-Category Definitions

| Code | Category | Description |
|------|----------|-------------|
| D1 | Gender Framing | Normative language around gender gaps; missing confounder disclosures |
| D2 | Geopolitical | Loaded country comparisons; sovereignty-sensitive language |
| D3 | Normative Terminology | Proprietary frameworks used without attribution; loaded terms |
| D4 | Causal/Policy Claims | Causal language from observational data; unhedged policy attributions |
| D5 | Loaded Terminology | "Dominance," "lagging," and similar evaluative language |
| D6 | Metric Conflation | Equating patents with innovation; denominator ambiguity |
| D7 | Revealing/Characterizing | Language that characterizes nations or entities in potentially controversial ways |
| D8 | Measurement Limitation | Undisclosed inference errors; missing confidence intervals |

## Addressed Items (7)

| ID | Category | Location | Issue | Fix Applied |
|----|----------|----------|-------|-------------|
| H1 | D2, D7 | `constants.ts:156` (geo-international) | "quality-quantity tradeoff" characterizing countries | Rewritten to "differences in observed patent-document characteristics across countries of origin" |
| H2 | D1, D8 | `constants.ts:134` (inv-gender) | Gender citation comparison without confounder disclosure | Added confounder disclosure: "These differences are substantially confounded by field composition." Added measurement limitation note. |
| H3 | D2 | `mech-inventors:681,696` | "deep integration" of US-China innovation | Changed to "high bilateral mobility volumes" |
| H4 | D4 | `geo-domestic:217,238` | "self-reinforcing" causal claim without literature citations | Added Marshall 1890, Krugman 1991 citations; hedged to "consistent with agglomeration mechanisms proposed in the literature" |
| H5 | D3 | `seo.ts:90` (blockchain) | "Hype Cycle" in SEO title (Gartner proprietary framework) | Changed to "Boom-Bust Pattern" |
| M8 | D4, D6 | `system-patent-law:462` | "transformed university patenting" -- causal verb for Bayh-Dole | Changed to "was followed by growth in university patenting" |
| -- | D7 | `constants.ts` (org-patent-count) | "revealing how" / "reflects globalization" interpretive framing | Verified neutral phrasing in current text; no further action needed |

## Deferred Item (1)

| ID | Category | Location | Issue | Reason for Deferral |
|----|----------|----------|-------|-------------------|
| H6 | D6 | Methodology page | "Modified Gini" coefficient undefined; produces negative values | Requires formal mathematical definition with formula, domain, and interpretation. Needs domain expert input. |

## v6 Baseline Comparison

The v6 audit identified 47 sensitivity items across 6 categories (D1:7, D2:10, D3:6, D4:11, D5:5, D6:8). The v7 audit addressed the most consequential items from this inventory:

- D1 (Gender): H2 confounder disclosure added.
- D2 (Geopolitical): H1 quality-quantity reframed; H3 deep integration reframed.
- D3 (Normative): H5 hype cycle SEO title fixed.
- D4 (Causal): H4 self-reinforcing hedged with literature; M8 Bayh-Dole "transformed" reframed.
- D6 (Metric Conflation): C1/C2 denominator consistency fixed.

Lower-severity items from the v6 inventory remain as-is where the existing hedging language was deemed adequate.

---

Status: COMPLETE
