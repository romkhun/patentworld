'use client';

import { useEffect } from 'react';

export default function ChapterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Chapter error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h2 className="font-serif text-2xl font-bold">Something went wrong</h2>
      <p className="mt-3 text-muted-foreground">
        This chapter encountered an error while loading. Please try again or return to the home page.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
