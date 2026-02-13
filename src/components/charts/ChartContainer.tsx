'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface ChartContainerProps {
  title: string;
  caption?: string;
  insight?: string;
  height?: number;
  loading?: boolean;
  wide?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

export function ChartContainer({ title, caption, insight, height = 600, loading, wide, ariaLabel, children }: ChartContainerProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <figure
      ref={ref}
      role="figure"
      aria-label={ariaLabel ?? title}
      className={`fade-in-section relative my-16 rounded-lg border bg-card p-4 sm:p-6 overflow-hidden ${wide ? '-mx-4 lg:-mx-8' : ''} ${inView ? 'is-visible' : ''}`}
    >
      {/* Colored top-border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-5)))' }}
        aria-hidden="true"
      />
      <h3 className="mb-4 font-sans text-base font-semibold tracking-tight text-muted-foreground">{title}</h3>
      {loading ? (
        <div className="flex flex-col gap-3 justify-center" aria-label="Loading chart" style={{ height }}>
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
        <figcaption className="mt-6 text-sm text-muted-foreground/80">{caption}</figcaption>
      )}
      {insight && (
        <div className="mt-4 border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-foreground/80">
          {insight}
        </div>
      )}
    </figure>
  );
}
