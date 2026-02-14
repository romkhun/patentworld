'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CHAPTERS, ACT_GROUPINGS } from '@/lib/constants';
import { clsx } from 'clsx';

export function ChapterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background overflow-y-auto p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Chapters
      </div>
      <nav className="flex flex-col gap-0.5">
        {ACT_GROUPINGS.map((act) => {
          const actChapters = act.chapters.map(
            (n) => CHAPTERS.find((c) => c.number === n)!
          );
          const renderChapterLink = (ch: typeof actChapters[0]) => {
                const href = `/chapters/${ch.slug}/`;
                const isActive = pathname === href || pathname === `/chapters/${ch.slug}`;
                return (
                  <Link
                    key={ch.slug}
                    href={href}
                    className={clsx(
                      'flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
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
              };
          return (
            <div key={act.act}>
              <div className="mt-4 first:mt-0 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Act {act.act} — {act.title}
              </div>
              {act.subgroups ? (
                act.subgroups.map((sg) => {
                  const sgChapters = sg.chapters.map(
                    (n) => CHAPTERS.find((c) => c.number === n)!
                  );
                  return (
                    <div key={sg.title}>
                      <div className="mt-2 mb-0.5 px-3 text-[10px] font-medium italic text-muted-foreground/50">
                        {sg.title}
                      </div>
                      {sgChapters.map(renderChapterLink)}
                    </div>
                  );
                })
              ) : (
                actChapters.map(renderChapterLink)
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
