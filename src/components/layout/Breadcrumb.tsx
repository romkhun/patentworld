'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CHAPTERS } from '@/lib/constants';

export function Breadcrumb() {
  const pathname = usePathname();
  const slug = pathname.replace(/^\/chapters\//, '').replace(/\/$/, '');
  const chapter = CHAPTERS.find((c) => c.slug === slug);

  if (!chapter) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1">
        <li>
          <Link href="/" className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-md">Home</Link>
        </li>
        <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
        <li aria-current="page" className="text-foreground font-medium truncate">
          {chapter.title}
        </li>
      </ol>
    </nav>
  );
}
