'use client';

import { GLOSSARY } from '@/lib/glossary';

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const entry = GLOSSARY[term];
  if (!entry) return <>{children ?? term}</>;

  const tooltipId = `glossary-${term.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <span className="group relative inline">
      <span
        role="term"
        tabIndex={0}
        aria-describedby={tooltipId}
        className="cursor-help border-b border-dashed border-muted-foreground/50"
      >
        {children ?? entry.term}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="block text-muted-foreground">{entry.definition}</span>
      </span>
    </span>
  );
}
