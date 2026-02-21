'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { CHAPTERS, ACT_GROUPINGS } from '@/lib/constants';
import { clsx } from 'clsx';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-background border-l shadow-lg overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-serif font-bold">PatentWorld</span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  pathname === '/'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                Home
              </Link>
              <Link
                href="/explore/"
                onClick={() => setOpen(false)}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  pathname?.startsWith('/explore')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                Explore
              </Link>
              <Link
                href="/methodology/"
                onClick={() => setOpen(false)}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  pathname?.startsWith('/methodology')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                Methodology
              </Link>
              <Link
                href="/about/"
                onClick={() => setOpen(false)}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  pathname?.startsWith('/about')
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                About
              </Link>
            </div>

            <div className="px-4 py-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Chapters
              </div>
              <div className="space-y-0.5">
                {ACT_GROUPINGS.map((act) => {
                  const actChapters = act.chapters.map(
                    (n) => CHAPTERS.find((c) => c.number === n)!
                  );
                  return (
                    <div key={act.act}>
                      <div className="mt-3 first:mt-0 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
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
                              {sgChapters.map((ch) => {
                                const href = `/chapters/${ch.slug}/`;
                                const isActive = pathname === href || pathname === `/chapters/${ch.slug}`;
                                return (
                                  <Link
                                    key={ch.slug}
                                    href={href}
                                    onClick={() => setOpen(false)}
                                    className={clsx(
                                      'flex items-start gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                      isActive
                                        ? 'bg-accent text-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-accent/50'
                                    )}
                                  >
                                    <span className="shrink-0 font-mono text-xs text-muted-foreground mt-0.5">
                                      {String(ch.number).padStart(2, '0')}
                                    </span>
                                    <span>{ch.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          );
                        })
                      ) : (
                        actChapters.map((ch) => {
                          const href = `/chapters/${ch.slug}/`;
                          const isActive = pathname === href || pathname === `/chapters/${ch.slug}`;
                          return (
                            <Link
                              key={ch.slug}
                              href={href}
                              onClick={() => setOpen(false)}
                              className={clsx(
                                'flex items-start gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                isActive
                                  ? 'bg-accent text-foreground font-medium'
                                  : 'text-muted-foreground hover:bg-accent/50'
                              )}
                            >
                              <span className="shrink-0 font-mono text-xs text-muted-foreground mt-0.5">
                                {String(ch.number).padStart(2, '0')}
                              </span>
                              <span>{ch.title}</span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
