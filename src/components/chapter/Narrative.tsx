import { ReactNode } from 'react';

interface NarrativeProps {
  children: ReactNode;
}

export function Narrative({ children }: NarrativeProps) {
  return (
    <div className="prose-custom my-8 max-w-prose text-base leading-relaxed text-foreground/90">
      {children}
    </div>
  );
}
