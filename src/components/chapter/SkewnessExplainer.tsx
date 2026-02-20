'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SkewnessExplainerProps {
  metric?: string;
}

export function SkewnessExplainer({ metric = 'forward citations' }: SkewnessExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="my-6 rounded-lg border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground/90 transition-colors hover:bg-blue-50/80 dark:hover:bg-blue-950/30"
        aria-expanded={isOpen}
      >
        <span>Why do means and medians diverge for {metric}?</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-blue-500/20 px-4 py-3">
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground/80 sm:flex-row sm:gap-6">
            {/* SVG distribution diagram */}
            <svg viewBox="0 0 200 100" className="w-full max-w-[200px] shrink-0" aria-label="Right-skewed distribution">
              <defs>
                <linearGradient id="skew-grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Distribution curve */}
              <path
                d="M10,90 Q30,88 50,20 Q70,60 100,75 Q140,85 190,89 L190,90 Z"
                fill="url(#skew-grad)"
                stroke="hsl(var(--chart-1))"
                strokeWidth="1.5"
              />
              {/* Median line */}
              <line x1="55" y1="15" x2="55" y2="90" stroke="hsl(var(--chart-2))" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="55" y="12" textAnchor="middle" fontSize="8" fill="hsl(var(--chart-2))">Median</text>
              {/* Mean line */}
              <line x1="90" y1="15" x2="90" y2="90" stroke="hsl(var(--chart-5))" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="90" y="12" textAnchor="middle" fontSize="8" fill="hsl(var(--chart-5))">Mean</text>
              {/* Right tail label */}
              <text x="150" y="80" fontSize="7" fill="hsl(var(--muted-foreground))" opacity="0.7">long tail →</text>
            </svg>
            <div className="space-y-2">
              <p>
                Patent {metric} follow a <strong>right-skewed</strong> distribution: most patents receive few citations, while a small fraction receive very many.
              </p>
              <p>
                The <strong>mean</strong> is pulled upward by blockbuster patents in the long tail, while the <strong>median</strong> reflects the typical patent. When these diverge, it signals increasing inequality in citation outcomes.
              </p>
              <p className="text-xs text-muted-foreground">
                This is why we report both mean and median throughout, and use cohort normalization (dividing by the grant-year × field average) to make comparisons across time and technology meaningful.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
