'use client';

import { useInView } from '@/hooks/useInView';

interface ConcentrationPanelProps {
  outcome: string;
  entity: string;
  top1: number;
  top5: number;
  gini: number;
  top1Label?: string;
  top5Label?: string;
}

export function ConcentrationPanel({ outcome, entity, top1, top5, gini, top1Label, top5Label }: ConcentrationPanelProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <aside
      ref={ref}
      aria-label={`Concentration statistics for ${outcome}`}
      className={`fade-in-section my-6 rounded-lg border border-slate-300/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-900/30 ${inView ? 'is-visible' : ''}`}
    >
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {outcome} Concentration Among {entity}
      </h4>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold tabular-nums">{top1.toFixed(1)}%</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{top1Label ?? 'Top 1% Share'}</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{top5.toFixed(1)}%</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{top5Label ?? 'Top 5% Share'}</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{gini.toFixed(3)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Gini Coefficient</div>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70">
        Share figures indicate the percentage of total {outcome.toLowerCase()} held by the top 1% and top 5% of {entity.toLowerCase()} respectively. The Gini coefficient ranges from 0 (perfectly equal distribution) to 1 (maximum concentration).
      </p>
    </aside>
  );
}
