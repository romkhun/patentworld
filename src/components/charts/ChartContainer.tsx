'use client';

import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  caption?: string;
  height?: number;
  loading?: boolean;
  children: ReactNode;
}

export function ChartContainer({ title, caption, height = 400, loading, children }: ChartContainerProps) {
  return (
    <div className="my-10 rounded-lg border bg-card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      {loading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-pulse text-sm text-muted-foreground">Loading data...</div>
        </div>
      ) : (
        <div style={{ height }} className="w-full">
          {children}
        </div>
      )}
      {caption && (
        <p className="mt-3 text-xs text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}
