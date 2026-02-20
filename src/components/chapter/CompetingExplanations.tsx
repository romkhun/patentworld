'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CompetingExplanationsProps {
  finding: string;
  explanations: string[];
}

export function CompetingExplanations({ finding, explanations }: CompetingExplanationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="my-6 rounded-lg border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground/90 transition-colors hover:bg-violet-50/80 dark:hover:bg-violet-950/30"
        aria-expanded={isOpen}
      >
        <span>Competing explanations: {finding}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-violet-500/20 px-4 py-3">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/80">
            {explanations.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ol>
        </div>
      )}
    </aside>
  );
}
