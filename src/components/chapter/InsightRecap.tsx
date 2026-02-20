'use client';

import Link from 'next/link';
import { CheckCircle2, FlaskConical, ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface InsightRecapProps {
  learned: string[];
  falsifiable: string;
  nextAnalysis: {
    label: string;
    description: string;
    href: string;
  };
}

export function InsightRecap({ learned, falsifiable, nextAnalysis }: InsightRecapProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <aside
      ref={ref}
      aria-label="Chapter recap"
      className={`fade-in-section my-8 rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 p-5 dark:bg-emerald-950/20 ${inView ? 'is-visible' : ''}`}
    >
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        Chapter Recap
      </h3>

      {/* Key Takeaways */}
      <div className="mb-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Key Takeaways
        </h4>
        <ul className="space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
          {learned.map((item, i) => (
            <li key={i} className="list-disc">{item}</li>
          ))}
        </ul>
      </div>

      {/* What Would Challenge the Findings */}
      <div className="mb-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <FlaskConical className="h-3.5 w-3.5" />
          What Would Challenge the Findings
        </h4>
        <p className="pl-5 text-sm leading-relaxed text-foreground/80">{falsifiable}</p>
      </div>

      {/* Next Analysis */}
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <ArrowRight className="h-3.5 w-3.5" />
          Next Analysis
        </h4>
        <Link
          href={nextAnalysis.href}
          className="group ml-5 flex items-center gap-2 text-sm text-emerald-700 underline decoration-emerald-500/30 hover:decoration-emerald-500 dark:text-emerald-400"
        >
          <span><strong>{nextAnalysis.label}</strong>: {nextAnalysis.description}</span>
        </Link>
      </div>
    </aside>
  );
}
