'use client';

import { ReactNode } from 'react';
import { Lightbulb } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface KeyInsightProps {
  children: ReactNode;
}

export function KeyInsight({ children }: KeyInsightProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <aside
      ref={ref}
      aria-label="Key insight"
      className={`fade-in-section my-8 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20 ${inView ? 'is-visible' : ''}`}
    >
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}
