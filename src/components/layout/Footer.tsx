import Link from 'next/link';

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
              className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
            >
              PatentsView
            </a>
            {' '}(USPTO), accessed Feb 2026. Coverage: 1976&ndash;Sep 2025.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/methodology/" className="inline-block py-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Methodology</Link>
            <Link href="/about/" className="inline-block py-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">About</Link>
            <Link href="/explore/" className="inline-block py-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Explore</Link>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Saerom (Ronnie) Lee. Content licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">CC BY 4.0</a>.
        </p>
      </div>
    </footer>
  );
}
