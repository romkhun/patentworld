export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

/**
 * Format patent/citation/inventor counts.
 * Axis: abbreviated (300K, 1.2M). Tooltip: full precision with separators (300,000).
 */
export function formatCount(value: number, context: 'axis' | 'tooltip' = 'tooltip'): string {
  if (context === 'axis') return formatCompact(value);
  return Math.round(value).toLocaleString('en-US');
}

/**
 * Format percentages. Auto-detects 0-1 range vs 0-100 range.
 * Values ≤1.5 in absolute value are treated as fractions (0.15 → 15.0%).
 */
export function formatPercent(
  value: number,
  decimals: number = 1,
  context: 'axis' | 'tooltip' = 'tooltip',
): string {
  const pct = Math.abs(value) <= 1.5 ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Format index values (HHI, Gini, correlation, entropy).
 */
export function formatIndex(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format year values — no thousands separator.
 */
export function formatYear(value: number): string {
  return String(Math.round(value));
}

/**
 * Convert a lowercase or mixed-case string to Title Case.
 * e.g. "cited by applicant" → "Cited by Applicant"
 */
export function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

