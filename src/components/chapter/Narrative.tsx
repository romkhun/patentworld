'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface NarrativeProps {
  children: ReactNode;
}

export function Narrative({ children }: NarrativeProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className={`fade-in-section prose-custom my-8 max-w-prose text-lg leading-relaxed text-foreground/90 ${inView ? 'is-visible' : ''}`}
    >
      {children}
    </section>
  );
}
