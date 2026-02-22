'use client';

import type { DataBadgeProps } from '@/lib/types';

export function DataBadge({ asOf, outcomeWindow, outcomeThrough, normalization, taxonomy }: DataBadgeProps) {
  const badges: { label: string; value: string }[] = [];

  if (asOf) badges.push({ label: 'Source', value: asOf });
  if (outcomeWindow) badges.push({ label: 'Citation Window', value: outcomeWindow });
  if (outcomeThrough) badges.push({ label: 'Citations Through', value: String(outcomeThrough) });
  if (normalization) badges.push({ label: 'Normalization', value: normalization });
  if (taxonomy) badges.push({ label: 'Classification', value: taxonomy });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Data methodology badges">
      {badges.map((b) => (
        <span
          key={b.label}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          <span className="font-semibold uppercase tracking-wider">{b.label}</span>
          <span className="text-foreground/70">{b.value}</span>
        </span>
      ))}
    </div>
  );
}
