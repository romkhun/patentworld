'use client';

import { useState } from 'react';

export interface ResearchCitation {
  citation: string;
  summary: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  category: 'Legislation' | 'Court' | 'Policy' | 'International';
  description: string;
  research?: ResearchCitation[];
}

interface PWTimelineProps {
  events: TimelineEvent[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Legislation: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  Court: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  Policy: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
  },
  International: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
};

/** Render text with URLs auto-linked */
function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s,)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors not-italic"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function PWTimeline({ events }: PWTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 text-xs">
        {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span className="text-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative ml-4 sm:ml-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />

        {events.map((event, i) => {
          const colors = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Legislation;
          const isExpanded = expandedIndex === i;
          const showYear = i === 0 || events[i - 1].year !== event.year;

          return (
            <div key={i} className="relative pl-8 pb-6 group">
              {/* Dot on timeline */}
              <div
                className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-background ${colors.dot} -translate-x-[5px] transition-transform group-hover:scale-125`}
              />

              {/* Year label */}
              {showYear && (
                <div className="text-xs font-mono font-semibold text-muted-foreground mb-1">
                  {event.year}
                </div>
              )}

              {/* Event card */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                aria-expanded={isExpanded}
                aria-controls={`timeline-event-${i}`}
                className={`w-full text-left rounded-lg border p-3 sm:p-4 transition-all ${colors.border} ${isExpanded ? colors.bg : 'hover:bg-accent/50'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {event.category}
                      </span>
                      <h3 className="text-sm font-semibold">{event.title}</h3>
                    </div>
                    {isExpanded && (
                      <div id={`timeline-event-${i}`}>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                          {event.description}
                        </p>
                        {event.research && event.research.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Research</p>
                            {event.research.map((r, ri) => (
                              <div key={ri} className="text-sm">
                                <p className="leading-relaxed text-foreground/80">{r.summary}</p>
                                <p className="mt-1 text-xs text-muted-foreground italic"><LinkifiedText text={r.citation} /></p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-muted-foreground text-xs mt-0.5">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
