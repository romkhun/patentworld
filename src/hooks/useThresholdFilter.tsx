'use client';

import { useState, useMemo, type ReactNode } from 'react';

type Threshold = 'all' | 'gte5' | 'gte10';

const THRESHOLD_LABELS: Record<Threshold, string> = {
  all: 'All patents',
  gte5: '≥ 5 citations',
  gte10: '≥ 10 citations',
};

interface UseThresholdFilterOptions<T> {
  data: T[] | null;
  thresholdKey: string;
}

/**
 * Three-way toggle for filtering originality/generality data by citation threshold.
 */
export function useThresholdFilter<T extends Record<string, any>>({ data, thresholdKey }: UseThresholdFilterOptions<T>) {
  const [threshold, setThreshold] = useState<Threshold>('all');

  const filteredData = useMemo(() => {
    if (!data) return null;
    return data.filter((row) => row[thresholdKey] === threshold);
  }, [data, threshold, thresholdKey]);

  const controls: ReactNode = (
    <div className="flex gap-1" role="radiogroup" aria-label="Citation threshold filter">
      {(Object.entries(THRESHOLD_LABELS) as [Threshold, string][]).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setThreshold(key)}
          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
            threshold === key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
          }`}
          role="radio"
          aria-checked={threshold === key}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return { data: filteredData, threshold, controls };
}
