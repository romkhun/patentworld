'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  caption?: string;
  insight?: string;
  height?: number;
  loading?: boolean;
  wide?: boolean;
  ariaLabel?: string;
  id?: string;
  interactive?: boolean;
  statusText?: string;
  children: ReactNode;
}

export function ChartContainer({ title, subtitle, caption, insight, height = 600, loading, wide, ariaLabel, id, interactive, statusText, children }: ChartContainerProps) {
  const { ref, inView } = useInView({ threshold: 0.05, rootMargin: '200px' });

  return (
    <figure
      ref={ref}
      id={id}
      aria-label={ariaLabel ?? title}
      className={`fade-in-section relative my-16 rounded-lg border bg-card p-4 sm:p-6 overflow-hidden max-w-[960px] mx-auto ${wide ? '-mx-4 lg:-mx-8 !max-w-none' : ''} ${inView ? 'is-visible' : ''}`}
    >
      {/* Colored top-border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-5)))' }}
        aria-hidden="true"
      />
      <h3 className="mb-1 font-sans text-base font-bold leading-snug tracking-tight text-foreground/90">{title}</h3>
      {subtitle && (
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
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
        <div
          className="chart-container-inner w-full"
          style={{ height, minHeight: 250 }}
          role={interactive ? 'group' : 'img'}
          aria-label={ariaLabel ?? title}
        >
          {children}
        </div>
      )}
      {interactive && statusText && (
        <p className="sr-only" aria-live="polite">{statusText}</p>
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
