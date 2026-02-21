'use client';

import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { CiteThisFigure } from './CiteThisFigure';
import { DataBadge } from '@/components/chapter/DataBadge';
import type { DataBadgeProps } from '@/lib/types';

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
  flexHeight?: boolean;
  controls?: ReactNode;
  badgeProps?: DataBadgeProps;
  children: ReactNode;
}

export function ChartContainer({ title, subtitle, caption, insight, height = 600, loading, wide, ariaLabel, id, interactive, statusText, flexHeight, controls, badgeProps, children }: ChartContainerProps) {
  const { ref, inView } = useInView({ threshold: 0.05, rootMargin: '200px' });
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <figure
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={`fade-in-section relative my-16 rounded-lg border bg-card p-4 sm:p-6 overflow-hidden max-w-[960px] mx-auto ${wide ? '-mx-4 lg:-mx-8 !max-w-none' : ''} ${inView ? 'is-visible' : ''}`}
    >
      {/* Colored top-border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-5)))' }}
        aria-hidden="true"
      />
      <h3 id={headingId} className="mb-1 font-sans text-base font-bold leading-snug tracking-tight text-foreground/90">{title}</h3>
      {subtitle && (
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
      {(controls || badgeProps) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {badgeProps ? <DataBadge {...badgeProps} /> : <div />}
          {controls && <div className="flex justify-end">{controls}</div>}
        </div>
      )}
      {loading || !inView ? (
        <div
          className="chart-container-inner relative flex items-end justify-center overflow-hidden"
          role="img"
          aria-label={`Loading chart: ${title}`}
          style={flexHeight ? { minHeight: height } : { height, minHeight: 250 }}
        >
          {/* Static chart-like placeholder: faux axes + bar silhouettes */}
          <div className="absolute inset-0 flex items-end px-12 pb-10 pt-8" aria-hidden="true">
            {/* Y-axis line */}
            <div className="absolute left-10 top-6 bottom-8 w-px bg-muted-foreground/15" />
            {/* X-axis line */}
            <div className="absolute left-10 right-6 bottom-8 h-px bg-muted-foreground/15" />
            {/* Faux data bars */}
            <div className="flex items-end gap-[3%] w-full h-full">
              {[35, 45, 50, 60, 72, 68, 80, 75, 65, 55, 40, 30].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-muted/60 animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
          <p className="relative z-10 mb-4 text-xs text-muted-foreground/50">Loading visualization…</p>
          <noscript>
            <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-8 text-center">
              This interactive chart requires JavaScript. {caption ?? subtitle ?? title}
            </p>
          </noscript>
        </div>
      ) : (
        <div
          className="chart-container-inner w-full animate-in fade-in duration-200"
          style={flexHeight ? { minHeight: height } : { height, minHeight: 250 }}
          role={interactive ? 'group' : 'img'}
          aria-label={ariaLabel ?? undefined}
          aria-labelledby={!ariaLabel ? headingId : undefined}
        >
          {children}
        </div>
      )}
      {interactive && statusText && (
        <p className="sr-only" aria-live="polite">{statusText}</p>
      )}
      {caption && (
        <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground/80">{caption}</figcaption>
      )}
      {insight && (
        <div className="mt-2 border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-foreground/80">
          {insight}
        </div>
      )}
      <CiteThisFigure title={title} figureId={id} />
    </figure>
  );
}
