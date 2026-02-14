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
  const { ref, inView } = useInView({ threshold: 0.05, rootMargin: '200px' });

  return (
    <figure
      ref={ref}
      role="figure"
      aria-label={ariaLabel ?? title}
      className={`fade-in-section relative my-16 rounded-lg border bg-card p-4 sm:p-6 overflow-hidden max-w-[960px] mx-auto ${wide ? '-mx-4 lg:-mx-8 !max-w-none' : ''} ${inView ? 'is-visible' : ''}`}
    >
      {/* Colored top-border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-5)))' }}
        aria-hidden="true"
      />
      <h3 className="mb-4 font-sans text-[15px] font-semibold leading-snug tracking-tight text-foreground/90">{title}</h3>
      {loading || !inView ? (
        <div
          className="chart-container-inner flex flex-col gap-3 justify-center"
          aria-label="Loading chart"
          style={{ height, minHeight: 250 }}
        >
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <div className="chart-container-inner w-full" style={{ height, minHeight: 250 }}>
          {children}
        </div>
      )}
      {caption && (
        <figcaption className="mt-4 text-[13px] leading-relaxed text-muted-foreground/80">{caption}</figcaption>
      )}
      {insight && (
        <div className="mt-4 border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-foreground/80">
          {insight}
        </div>
      )}
    </figure>
  );
}
