import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CHAPTERS } from '@/lib/constants';

interface ChapterNavigationProps {
  currentChapter: number;
}

export function ChapterNavigation({ currentChapter }: ChapterNavigationProps) {
  const prev = CHAPTERS.find((c) => c.number === currentChapter - 1);
  const next = CHAPTERS.find((c) => c.number === currentChapter + 1);

  return (
    <div className="mt-16 flex items-stretch gap-4">
      {prev ? (
        <Link
          href={`/chapters/${prev.slug}/`}
          className="flex flex-1 items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="text-right flex-1">
            <div className="text-xs text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/chapters/${next.slug}/`}
          className="flex flex-1 items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
        >
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Next</div>
            <div className="text-sm font-medium">{next.title}</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      ) : (
        <Link
          href="/explore/"
          className="flex flex-1 items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
        >
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Continue</div>
            <div className="text-sm font-medium">Explore the Data</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
}
