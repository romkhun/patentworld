'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CHAPTERS, ACT_GROUPINGS } from '@/lib/constants';

export function Breadcrumb() {
  const pathname = usePathname();
  const slug = pathname.replace(/^\/chapters\//, '').replace(/\/$/, '');
  const chapter = CHAPTERS.find((c) => c.slug === slug);

  if (!chapter) return null;

  const act = ACT_GROUPINGS.find((a) => a.chapters.includes(chapter.number));

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1 flex-wrap">
        <li className="flex items-center gap-1">
          <Link href="/" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-md">Home</Link>
        </li>
        {act && (
          <li className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">Act {act.act}: {act.title}</span>
          </li>
        )}
        <li className="flex items-center gap-1" aria-current="page">
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="text-foreground font-medium truncate">{chapter.title}</span>
        </li>
      </ol>
    </nav>
  );
}
