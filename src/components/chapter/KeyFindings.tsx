'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface KeyFindingsProps {
  children: ReactNode;
}

export function KeyFindings({ children }: KeyFindingsProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <aside
      ref={ref}
      aria-label="Key findings from PatentWorld"
      className={`fade-in-section my-8 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 p-5 dark:bg-blue-950/20 ${inView ? 'is-visible' : ''}`}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
        Key Findings
      </h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
        {children}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Source: PatentWorld.
      </p>
    </aside>
  );
}
