'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
          <BarChart3 className="h-5 w-5" />
          PatentWorld
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-4 md:flex">
          <Link
            href="/explore/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Explore
          </Link>
          <Link
            href="/methodology/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Methodology
          </Link>
          <Link
            href="/about/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
