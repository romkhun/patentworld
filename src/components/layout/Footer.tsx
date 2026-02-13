import Link from 'next/link';
import { HERO_STATS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Data from{' '}
            <a
              href="https://patentsview.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              PatentsView
            </a>
            {' '}(USPTO). {HERO_STATS.totalPatents} US patents, {HERO_STATS.startYear}-{HERO_STATS.endYear}.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/about/" className="hover:text-foreground">About</Link>
            <Link href="/explore/" className="hover:text-foreground">Explore</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
