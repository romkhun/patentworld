import { ReactNode } from 'react';

interface StatGridProps {
  children: ReactNode;
}

export function StatGrid({ children }: StatGridProps) {
  return (
    <div className="my-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {children}
    </div>
  );
}
