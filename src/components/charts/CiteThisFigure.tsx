'use client';

import { useState, useCallback } from 'react';

interface CiteThisFigureProps {
  title: string;
  figureId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function CiteThisFigure({ title, figureId }: CiteThisFigureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'apa' | 'bibtex'>('apa');

  const slug = figureId ?? `fig-${slugify(title)}`;
  const accessedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const stableUrl = `${baseUrl}#${slug}`;

  const apaCitation = `Lee, Saerom (Ronnie). 2026. "${title}." In PatentWorld: 50 Years of US Patent Data. The Wharton School, University of Pennsylvania. ${stableUrl}. Accessed ${accessedDate}. Data source: United States Patent and Trademark Office (USPTO) via PatentsView (accessed February 2026).`;

  const bibtexSlug = slug.replace(/-/g, '_');
  const bibtexCitation = `@misc{lee2026patentworld_${bibtexSlug},
  author = {Lee, Saerom (Ronnie)},
  title = {${title}},
  year = {2026},
  howpublished = {PatentWorld: 50 Years of US Patent Data},
  institution = {The Wharton School, University of Pennsylvania},
  url = {${stableUrl}},
  note = {Data source: USPTO via PatentsView. Accessed ${accessedDate}}
}`;

  const currentCitation = format === 'apa' ? apaCitation : bibtexCitation;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentCitation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentCitation]);

  if (!isOpen) {
    return (
      <div className="mt-3 pt-3 border-t border-border/40">
        <button
          onClick={() => setIsOpen(true)}
          className="block text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
          aria-expanded={isOpen}
        >
          Cite this figure
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/40">
    <div className="rounded-md border border-border bg-muted/30 p-4 max-w-[700px] animate-in fade-in slide-in-from-top-1 duration-200" onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          <button
            onClick={() => setFormat('apa')}
            className={`text-xs px-2 py-1 rounded ${format === 'apa' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            APA
          </button>
          <button
            onClick={() => setFormat('bibtex')}
            className={`text-xs px-2 py-1 rounded ${format === 'bibtex' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            BibTeX
          </button>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
          aria-label="Close citation"
        >
          Close
        </button>
      </div>
      <pre className="text-xs leading-relaxed text-foreground/80 font-mono whitespace-pre-wrap break-words bg-background/50 rounded p-3 border border-border/50">
        {currentCitation}
      </pre>
      <button
        onClick={handleCopy}
        aria-live="polite"
        className="mt-2 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors"
      >
        {copied ? 'Copied' : 'Copy citation'}
      </button>
    </div>
    </div>
  );
}
