'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface StatGridProps {
  children: ReactNode;
}

export function StatGrid({ children }: StatGridProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`fade-in-section my-8 grid grid-cols-2 gap-4 sm:grid-cols-4 ${inView ? 'is-visible' : ''}`}
    >
      {children}
    </div>
  );
}
