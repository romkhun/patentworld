'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { useChapterData } from '@/hooks/useChapterData';

interface UseCohortNormalizationOptions {
  /** Raw data (non-normalized) */
  rawDataPath: string;
  /** Cohort-normalized data path */
  normalizedDataPath: string;
}

/**
 * Toggle between raw and cohort-normalized citation data files.
 * Returns the currently active data, a toggle control, and the normalization state.
 */
export function useCohortNormalization<T>({ rawDataPath, normalizedDataPath }: UseCohortNormalizationOptions) {
  const [isNormalized, setIsNormalized] = useState(false);

  const { data: rawData, loading: rawLoading } = useChapterData<T[]>(rawDataPath);
  const { data: normData, loading: normLoading } = useChapterData<T[]>(normalizedDataPath);

  const toggle = useCallback(() => setIsNormalized((prev) => !prev), []);

  const data = isNormalized ? normData : rawData;
  const loading = isNormalized ? normLoading : rawLoading;

  const controls: ReactNode = (
    <button
      onClick={toggle}
      className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
        isNormalized
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
      }`}
      aria-pressed={isNormalized}
    >
      {isNormalized ? 'Cohort-normalized' : 'Raw counts'}
    </button>
  );

  return { data, loading, controls, isNormalized };
}
