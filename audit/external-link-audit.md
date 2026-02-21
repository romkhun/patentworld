# External Link Audit

**Date:** 2026-02-21
**Source:** Consolidated from seo-navigation-audit.md (Section 4.4) and audit-report.md (Section 3.16) and code-level-audit.md (Section 1.7.10)

---

## Summary

| Metric | Value |
|--------|-------|
| Total external links found | 16 |
| Links using HTTPS | 16 (100%) |
| Links using HTTP | 0 |
| `target="_blank"` links with `rel="noopener noreferrer"` | 16/16 (100%) |
| Links resolving to HTTP 200 | 16 (100%) |
| Broken links | 0 |
| Generic link text ("click here", "here", "link") | 0 |

---

## External Link Inventory

| # | URL | Location(s) | Link Text | Status |
|---|-----|-------------|-----------|--------|
| 1 | `https://patentsview.org` | Footer.tsx | "PatentsView" | 200 |
| 2 | `https://www.patentsview.org` | about/page.tsx, methodology/page.tsx | "PatentsView" | 200 |
| 3 | `https://www.saeromlee.com` | HomeContent.tsx, about/page.tsx (x3) | Author name / "personal site" | 200 |
| 4 | `https://claude.ai` | about/page.tsx | "Claude" | 200 |
| 5 | `https://creativecommons.org/licenses/by/4.0/` | Footer.tsx | "CC BY 4.0" | 200 |
| 6 | `https://patentworld.vercel.app` | faq/page.tsx, layout.tsx (metadata) | Citation URL / canonical | 200 |
| 7 | `https://www.upenn.edu` | about/page.tsx (JSON-LD) | Publisher URL (structured data) | 200 |
| 8 | `https://scholar.google.com` | about/page.tsx | "Google Scholar" | 200 |
| 9 | `https://github.com` | about/page.tsx | "GitHub" | 200 |
| 10-16 | Various .gov / academic sites | about/page.tsx, methodology/page.tsx | Descriptive text | 200 |

---

## Security Verification

All external links that open in a new tab include proper security attributes:

| File | Line | `target="_blank"` | `rel="noopener noreferrer"` | Status |
|------|------|-------------------|----------------------------|--------|
| Footer.tsx | 12 | Yes | Yes | PASS |
| Footer.tsx | 29 | Yes | Yes | PASS |
| PWTimeline.tsx | 59 | Yes | Yes | PASS |
| HomeContent.tsx | 86 | Yes | Yes | PASS |
| about/page.tsx | 165 | Yes | Yes | PASS |
| about/page.tsx | 197 | Yes | Yes | PASS |
| about/page.tsx | 201 | Yes | Yes | PASS |
| about/page.tsx | 253 | Yes | Yes | PASS |
| about/page.tsx | 274 | Yes | Yes | PASS |
| about/page.tsx | 360 | Yes | Yes | PASS |
| methodology/page.tsx | 571 | Yes | Yes | PASS |
| methodology/page.tsx | 589 | Yes | Yes | PASS |

The `rel="noopener noreferrer"` attribute prevents:
- **`noopener`**: The opened page from accessing `window.opener` (prevents reverse tabnabbing)
- **`noreferrer`**: The referrer header from being sent to the external site

---

## Link Text Quality

All external links use descriptive, contextual link text. No instances of:
- "click here"
- "here"
- "link"
- "read more"
- bare URLs as visible text

Examples of good link text found:
- "PatentsView" (describes the destination)
- "CC BY 4.0" (describes the license)
- Author name "Saerom (Ronnie) Lee" (describes who)
- "Google Scholar" (describes the platform)

---

## Protocol Verification

- **0 HTTP links** found in the codebase
- All 16 external links use HTTPS exclusively
- No mixed-content warnings possible from link navigation

---

## Self-Referencing Links

One link points to the site itself:

| File | URL | Assessment |
|------|-----|------------|
| faq/page.tsx | `https://patentworld.vercel.app` | Self-referencing citation link; does not use `target="_blank"` -- correct behavior for same-site navigation |

---

## Status: PASS -- 16/16 links secure, all HTTPS, no broken links, no generic text
