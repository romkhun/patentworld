'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const VARIANT_TEXT: Record<string, { title: string; body: string }> = {
  gender: {
    title: 'Why can\'t we infer causation from the gender gap?',
    body: 'The observed differences between male- and female-named inventors reflect selection, field composition, institutional barriers, and career-stage effects in addition to any direct gender effect. Women are concentrated in life sciences and underrepresented in electrical engineering, and they entered the patent system later on average. Without controlling for these confounders, the gap in citation outcomes is descriptive, not causal.',
  },
  'team-size': {
    title: 'Why can\'t we infer causation from team-size differences?',
    body: 'Larger teams tend to work on more complex, better-funded projects in higher-citation fields. The positive association between team size and citation impact may reflect project selection (better projects attract bigger teams) rather than a direct productivity effect of collaboration. Firm size, funding source, and technology domain are important confounders.',
  },
  international: {
    title: 'Why can\'t we infer causation from cross-country differences?',
    body: 'National differences in patent quality reflect patent office practices, legal environments, industry composition, and R&D investment levels. Countries specialize in different technology domains with different citation norms. Higher citation rates for one country\'s patents do not imply that its inventors are more productive absent controls for field, firm, and cohort effects.',
  },
  'top-inventors': {
    title: 'Why can\'t we infer causation from superstar inventor patterns?',
    body: 'Prolific inventors work at elite firms, in high-citation fields, and with larger teams. Their outsized citation impact may reflect institutional advantages (access to resources, networks, and complementary talent) rather than individual ability alone. Survivorship bias also plays a role: we observe inventors who remained prolific, not those who left patenting.',
  },
};

interface DescriptiveGapNoteProps {
  variant: 'gender' | 'team-size' | 'international' | 'top-inventors';
  alwaysVisible?: boolean;
}

export function DescriptiveGapNote({ variant, alwaysVisible = false }: DescriptiveGapNoteProps) {
  const [isOpen, setIsOpen] = useState(alwaysVisible);
  const content = VARIANT_TEXT[variant];
  if (!content) return null;

  if (alwaysVisible) {
    return (
      <aside className="my-6 rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground/90">{content.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">{content.body}</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="my-6 rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground/90 transition-colors hover:bg-amber-50/80 dark:hover:bg-amber-950/30"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>{content.title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-amber-500/20 px-4 py-3">
          <p className="text-sm leading-relaxed text-foreground/80">{content.body}</p>
        </div>
      )}
    </aside>
  );
}
