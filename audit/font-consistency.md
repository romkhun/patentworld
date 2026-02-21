# Font Consistency Audit

**Date:** 2026-02-21
**Source:** Consolidated from audit-report.md (Section 3.18) and code-level-audit.md (Section 1.9.12)

---

## Summary

| Metric | Value |
|--------|-------|
| Font families in use | 3 |
| Font loading method | `next/font/google` (self-hosted, no external CDN) |
| `display: swap` configured | Yes (all 3 fonts) |
| Fallback stacks present | Yes (all 3 fonts) |
| Rogue `font-family` overrides found | 0 |
| Pages verified | All 34 chapter pages + non-chapter pages |

---

## Font Configuration

### Font Imports (`src/app/layout.tsx`)

Three Google Fonts are loaded via `next/font/google` and applied to the `<html>` element:

```tsx
<html className={`${playfair.variable} ${jakarta.variable} ${jetbrains.variable}`}>
```

| Font | CSS Variable | Tailwind Class | Role |
|------|-------------|----------------|------|
| Playfair Display | `--font-playfair` | `font-serif` | Headings (h1-h6) |
| Plus Jakarta Sans | `--font-jakarta` | `font-sans` | Body text |
| JetBrains Mono | `--font-jetbrains` | `font-mono` | Code and data labels |

### Tailwind Configuration (`tailwind.config.ts`)

```ts
fontFamily: {
  serif: ['var(--font-playfair)', 'Georgia', 'serif'],
  sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-jetbrains)', 'monospace'],
},
```

All three font families have sensible fallback stacks for graceful degradation before web fonts load.

---

## Chart Theme Integration

### `src/lib/chartTheme.ts`

The chart theme centralizes the font reference for all SVG text and Recharts props:

```ts
export const fontFamily = 'var(--font-jakarta)';
```

All chart components reference `chartTheme.fontFamily` for consistent typography within visualizations. Verified in: PWBarChart, PWLineChart, PWAreaChart, PWLollipopChart, PWCoefficientPlot, PWLorenzCurve, PWTrajectoryScatter, PWChoroplethMap, PWTreemap, PWSlopeChart, and others.

### `src/lib/colors.ts` (Tooltip Style)

The shared tooltip style also references the centralized variable:

```ts
fontFamily: 'var(--font-jakarta)',
```

---

## Verification

| Check | Result |
|-------|--------|
| Inline `fontFamily` overrides in `.tsx` files | None found -- all reference `chartTheme.fontFamily` |
| Raw font-family strings in `.tsx` files | None found |
| CSS `font-family` outside Tailwind config | None found (only `globals.css` loaded via layout; no additional `font-family` declarations) |
| External Google Fonts CDN imports (`<link>` tags) | None found -- all fonts self-hosted via `next/font` |
| `display: swap` | Configured by default in `next/font/google` for all 3 fonts |
| Consistent across all 34 chapter pages | Yes -- all chapter pages inherit from root `layout.tsx` |
| Consistent on non-chapter pages (About, Methodology, Explore, FAQ) | Yes -- same root layout applies |

---

## Font Licenses

All three fonts are open source:

| Font | License |
|------|---------|
| Playfair Display | SIL Open Font License (OFL) 1.1 |
| Plus Jakarta Sans | SIL Open Font License (OFL) 1.1 |
| JetBrains Mono | SIL Open Font License (OFL) 1.1 |

---

## Status: PASS
