'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface ChartContainerProps {
  title: string;
  caption?: string;
  height?: number;
  loading?: boolean;
  children: ReactNode;
}

export function ChartContainer({ title, caption, height = 500, loading, children }: ChartContainerProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`fade-in-section relative my-10 rounded-lg border bg-card p-4 sm:p-6 overflow-hidden ${inView ? 'is-visible' : ''}`}
    >
      {/* Colored top-border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-5)))' }}
      />
      <h3 className="mb-4 text-lg font-semibold tracking-tight">{title}</h3>
      {loading ? (
        <div className="flex flex-col gap-3 justify-center" style={{ height }}>
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <div style={{ height }} className="w-full">
          {children}
        </div>
      )}
      {caption && (
        <p className="mt-4 text-sm text-muted-foreground/80">{caption}</p>
      )}
    </div>
  );
}
