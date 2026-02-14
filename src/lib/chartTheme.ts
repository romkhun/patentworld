/**
 * chartTheme.ts — Centralized chart typography, colors, and scale utilities.
 *
 * Categorical palette: 7 WCAG 1.4.11-passing colors (≥3:1 on white).
 * Sequential / diverging scales for heatmaps & choropleths.
 * Font size + weight constants matching the spec table.
 */

/* ------------------------------------------------------------------ */
/*  Font                                                                */
/* ------------------------------------------------------------------ */

export const fontFamily = 'var(--font-jakarta)';

/** Desktop font sizes (px) */
export const fontSize = {
  title: 16,
  subtitle: 13,
  axisLabel: 12,
  tickLabel: 12,
  tooltip: 13,
  caption: 12,
  legend: 12,
  smallMultiplesTick: 11,
  annotation: 11,
} as const;

/** Mobile overrides (≤767px) */
export const fontSizeMobile = {
  title: 15,
  subtitle: 12,
  axisLabel: 11,
  tickLabel: 11,
  tooltip: 12,
  caption: 11,
  legend: 11,
  smallMultiplesTick: 10,
  annotation: 10,
} as const;

/** Font weights — three tiers only */
export const fontWeight = {
  title: 700,
  axisLabel: 500,
  regular: 400,
} as const;

/* ------------------------------------------------------------------ */
/*  Categorical colors (WCAG 1.4.11 ≥ 3 : 1 on white)                 */
/* ------------------------------------------------------------------ */

export const categoricalColors = [
  '#0072B2', // blue        (5.19:1)
  '#D55E00', // vermillion  (3.87:1)
  '#009E73', // green       (3.42:1)
  '#882255', // wine        (8.73:1)
  '#332288', // indigo      (12.17:1)
  '#CC79A7', // pink        (3.06:1 — use ≥2px stroke)
  '#000000', // black       (21.00:1)
] as const;

export const otherColor = '#9ca3af'; // gray-400, 3.84:1 on white

/* ------------------------------------------------------------------ */
/*  Sequential scale (white → dark blue)                                */
/* ------------------------------------------------------------------ */

/**
 * Attempt perceptually-linear lightness ramp via OKLCH-like
 * interpolation approximated in HSL (hue 221°, saturation 83%).
 *
 * @param t  0 = lightest (white-ish), 1 = darkest (deep blue)
 */
export function sequentialScale(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  // Lightness range: 96% (near white) → 25% (deep blue)
  const lightness = 96 - clamped * 71;
  // Saturation ramps up as we go darker for perceptual uniformity
  const saturation = 30 + clamped * 53; // 30% → 83%
  return `hsl(221, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}

/** Sample the sequential scale into N discrete stops. */
export function sequentialStops(n: number): string[] {
  return Array.from({ length: n }, (_, i) => sequentialScale(i / (n - 1)));
}

/* ------------------------------------------------------------------ */
/*  Diverging scale (blue → white → red)                                */
/* ------------------------------------------------------------------ */

/**
 * @param t  -1 = saturated blue, 0 = white, +1 = saturated red
 */
export function divergingScale(t: number): string {
  const clamped = Math.max(-1, Math.min(1, t));
  const abs = Math.abs(clamped);
  const lightness = 96 - abs * 52; // 96% (center) → 44%
  const hue = clamped < 0 ? 221 : 4; // blue vs red
  const saturation = 30 + abs * 53;
  return `hsl(${hue}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}

/* ------------------------------------------------------------------ */
/*  Text color for background (luminance-based)                         */
/* ------------------------------------------------------------------ */

/**
 * Returns '#fff' or 'hsl(var(--foreground))' depending on background
 * luminance. Pass hex (#RRGGBB) or computed RGB values.
 */
export function textColorForBg(hexOrR: string | number, g?: number, b?: number): string {
  let r: number;
  if (typeof hexOrR === 'string') {
    const hex = hexOrR.replace('#', '');
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    r = hexOrR;
  }
  // Relative luminance (sRGB)
  const lum = 0.2126 * (r / 255) + 0.7152 * ((g ?? 0) / 255) + 0.0722 * ((b ?? 0) / 255);
  return lum > 0.45 ? 'hsl(var(--foreground))' : '#fff';
}

/** Convenience: parse an HSL string like "hsl(221, 83%, 45%)" and test luminance. */
export function textColorForHsl(hslStr: string): string {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return 'hsl(var(--foreground))';
  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  // HSL → approximate luminance via lightness
  // Rough but sufficient: dark if l < 0.55 accounting for saturation
  const effectiveL = l + (1 - s) * (0.5 - l) * 0.3;
  return effectiveL > 0.52 ? 'hsl(var(--foreground))' : '#fff';
}

/* ------------------------------------------------------------------ */
/*  Convenience re-export as default namespace                          */
/* ------------------------------------------------------------------ */

const chartTheme = {
  fontFamily,
  fontSize,
  fontSizeMobile,
  fontWeight,
  categoricalColors,
  otherColor,
  sequentialScale,
  sequentialStops,
  divergingScale,
  textColorForBg,
  textColorForHsl,
} as const;

export default chartTheme;
