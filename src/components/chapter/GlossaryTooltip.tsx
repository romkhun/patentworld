'use client';

import { useState, useCallback } from 'react';
import { GLOSSARY } from '@/lib/glossary';

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => {
    setTimeout(() => setVisible(false), 200);
  }, []);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setVisible(false);
  }, []);

  const entry = GLOSSARY[term];
  if (!entry) return <>{children ?? term}</>;

  const tooltipId = `glossary-${term.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <span className="relative inline" onMouseEnter={show} onMouseLeave={hide}>
      <span
        role="term"
        tabIndex={0}
        aria-describedby={tooltipId}
        onFocus={show}
        onBlur={hide}
        onKeyDown={handleKeyDown}
        className="cursor-help border-b border-dashed border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
      >
        {children ?? entry.term}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg transition-opacity ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <span className="block text-muted-foreground">{entry.definition}</span>
      </span>
    </span>
  );
}
