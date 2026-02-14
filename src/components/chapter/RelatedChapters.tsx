'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { CHAPTERS } from '@/lib/constants';
import { useInView } from '@/hooks/useInView';

interface RelatedChaptersProps {
  currentChapter: number;
}

export function RelatedChapters({ currentChapter }: RelatedChaptersProps) {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const current = CHAPTERS.find((c) => c.number === currentChapter);
  if (!current?.relatedChapters?.length) return null;

  const related = current.relatedChapters
    .map((num) => CHAPTERS.find((c) => c.number === num))
    .filter(Boolean);

  if (related.length === 0) return null;

  return (
    <nav
      ref={ref}
      aria-label="Related chapters"
      className={`fade-in-section mt-16 ${inView ? 'is-visible' : ''}`}
    >
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Related Chapters
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((ch) => (
          <Link
            key={ch!.number}
            href={`/chapters/${ch!.slug}/`}
            className="rounded-lg border p-4 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="text-xs font-mono text-muted-foreground">
              Chapter {String(ch!.number).padStart(2, '0')}
            </div>
            <div className="mt-1 text-sm font-medium">{ch!.title}</div>
            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {ch!.description}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
