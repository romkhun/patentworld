# Copyright, License, and Attribution Audit

**Date:** 2026-02-21
**Source:** Consolidated from audit-report.md (Section 3.17) and code-level-audit.md (Section 1.9.10)

---

## Summary

| Check | Status |
|-------|--------|
| Copyright notice in Footer | PASS |
| CC BY 4.0 license in Footer | PASS |
| CC BY 4.0 license on About page | PASS |
| PatentsView attribution in Footer | PASS |
| PatentsView attribution on About page | PASS |
| PatentsView attribution on Methodology page | PASS |
| Font licenses (all open source) | PASS |
| npm dependency licenses (no GPL-only conflicts) | PASS |

---

## Copyright Notice

**File:** `src/components/layout/Footer.tsx`

The footer displays a dynamic copyright notice:

```tsx
© {new Date().getFullYear()} Saerom (Ronnie) Lee. Content licensed under CC BY 4.0.
```

The year updates automatically. The CC BY 4.0 text links to `https://creativecommons.org/licenses/by/4.0/`.

---

## CC BY 4.0 License

### Footer
- Visible text: "Content licensed under CC BY 4.0" with external link to Creative Commons
- Link attributes: `target="_blank"`, `rel="noopener noreferrer"`

### About Page (`src/app/about/page.tsx`)
- Dedicated License section with visible CC BY 4.0 text (added in Phase 2B, item DA-5)
- JSON-LD structured data (line 94): `"license": "https://creativecommons.org/licenses/by/4.0/"`

---

## PatentsView Attribution

Attribution for the underlying USPTO/PatentsView data appears in three locations:

| Location | Text |
|----------|------|
| **Footer** (`src/components/layout/Footer.tsx`) | "Data from PatentsView (USPTO), accessed Feb 2026. Coverage: 1976-Sep 2025." with external link |
| **About page** (`src/app/about/page.tsx`) | Data Source & Attribution section with PatentsView links |
| **Methodology page** (`src/app/methodology/page.tsx`) | PatentsView data attribution text with links (lines 571, 588-589) |

All PatentsView external links use `target="_blank"` with `rel="noopener noreferrer"`.

---

## Font Licenses

All three fonts are loaded via `next/font/google` in `src/app/layout.tsx`. No external CDN imports.

| Font | License | Usage |
|------|---------|-------|
| Playfair Display | SIL Open Font License (OFL) 1.1 | Headings (h1-h6) |
| Plus Jakarta Sans | SIL Open Font License (OFL) 1.1 | Body text |
| JetBrains Mono | SIL Open Font License (OFL) 1.1 | Code and data labels |

All three fonts are fully open source under the OFL, which permits free use, modification, and redistribution in both commercial and non-commercial projects.

---

## npm Dependency Licenses

All npm dependencies were checked for license compatibility:

- No GPL-only packages found
- No AGPL packages found
- All dependencies use permissive licenses (MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause)
- `package.json` declares `"license": "ISC"` for the project code itself

**Note:** The ISC license (in `package.json`) applies to the source code, while CC BY 4.0 (declared in the About page and Footer) applies to the published content and visualizations. This dual-license arrangement is standard for data-driven web projects.

---

## Status: PASS
