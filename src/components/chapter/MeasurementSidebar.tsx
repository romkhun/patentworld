'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { CHAPTER_MEASUREMENTS } from '@/lib/chapterMeasurementConfig';

interface MeasurementSidebarProps {
  slug: string;
}

export function MeasurementSidebar({ slug }: MeasurementSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = CHAPTER_MEASUREMENTS[slug];

  if (!config) return null;

  const items = [
    { label: 'Data vintage', value: config.dataVintage },
    { label: 'Taxonomy', value: config.taxonomy },
    config.outcomeWindow ? { label: 'Citation window', value: config.outcomeWindow } : null,
    config.outcomeThrough ? { label: 'Outcome through', value: String(config.outcomeThrough) } : null,
    config.normalization ? { label: 'Normalization', value: config.normalization } : null,
    config.notes ? { label: 'Notes', value: config.notes } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <aside className="my-4 rounded-lg border border-border/60 bg-muted/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={isOpen}
      >
        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="uppercase tracking-wider">Measurement details</span>
        <span className="ml-auto">
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-border/40 px-4 py-3">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            {items.map((item) => (
              <div key={item.label} className="contents">
                <dt className="font-medium text-muted-foreground">{item.label}</dt>
                <dd className="text-foreground/80">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 pt-2 border-t border-border/40">
            <Link href="/about/#definitions" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
              View all measurement definitions
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
