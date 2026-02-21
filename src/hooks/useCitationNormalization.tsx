'use client';

import { useState, useMemo, useCallback, type ReactNode } from 'react';

const CURRENT_YEAR = 2026;

interface UseCitationNormalizationOptions {
  data: any[] | null;
  xKey: string;
  citationKeys: string[];
  yLabel: string;
}

export function useCitationNormalization({ data, xKey, citationKeys, yLabel }: UseCitationNormalizationOptions) {
  const [isNormalized, setIsNormalized] = useState(false);

  const toggle = useCallback(() => setIsNormalized((prev) => !prev), []);

  const normalizedData = useMemo(() => {
    if (!data || !isNormalized) return data;
    return data.map((row) => {
      const year = Number(row[xKey]);
      const exposure = Math.max(1, CURRENT_YEAR - year);
      const updated: Record<string, any> = { ...row };
      for (const key of citationKeys) {
        if (updated[key] != null) {
          updated[key] = Number(updated[key]) / exposure;
        }
      }
      return updated;
    });
  }, [data, isNormalized, xKey, citationKeys]);

  const normalizedYLabel = isNormalized ? `${yLabel} per Year of Exposure` : yLabel;

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
      Normalize by exposure years
    </button>
  );

  return { data: normalizedData, yLabel: normalizedYLabel, controls, isNormalized };
}
