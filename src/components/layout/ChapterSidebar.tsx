'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CHAPTERS } from '@/lib/constants';
import { clsx } from 'clsx';

export function ChapterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background overflow-y-auto p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Chapters
      </div>
      <nav className="flex flex-col gap-0.5">
        {CHAPTERS.map((ch) => {
          const href = `/chapters/${ch.slug}/`;
          const isActive = pathname === href || pathname === `/chapters/${ch.slug}`;
          return (
            <Link
              key={ch.slug}
              href={href}
              className={clsx(
                'flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
                {String(ch.number).padStart(2, '0')}
              </span>
              <span>{ch.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
