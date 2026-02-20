'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { CHAPTERS, HERO_STATS, ACT_GROUPINGS } from '@/lib/constants';
import { useInView } from '@/hooks/useInView';
import { useChapterData } from '@/hooks/useChapterData';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { CHART_COLORS } from '@/lib/colors';
import type { PatentsPerYear } from '@/lib/types';

function useCountUp(end: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(end);
  const hasTriggered = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger || hasTriggered.current) return;
    hasTriggered.current = true;
    setValue(0);
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, trigger]);

  return value;
}

function CounterStat({ target, label, suffix, decimals }: {
  target: number; label: string; suffix?: string; decimals?: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const count = useCountUp(decimals ? target * 100 : target, 1500, inView);
  const display = decimals ? (count / 100).toFixed(decimals) : count.toLocaleString();

  return (
    <div className="text-center" ref={ref}>
      <div className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
        {display}{suffix ?? ''}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function pivotByType(data: PatentsPerYear[] | null) {
  if (!data) return [];
  const byYear: Record<number, Record<string, number>> = {};
  for (const d of data) {
    if (!byYear[d.year]) byYear[d.year] = { year: d.year };
    byYear[d.year][d.patent_type] = d.count;
  }
  return Object.values(byYear).sort((a, b) => a.year - b.year);
}

export default function HomePage() {
  const { data: patentData, loading: patentLoading } = useChapterData<PatentsPerYear[]>('chapter1/patents_per_year.json');
  const pivotedPatents = useMemo(() => pivotByType(patentData), [patentData]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-32 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            An Interactive Data Exploration
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-7xl">
            Patent<span className="text-chart-1">World</span>
          </h1>
          <p className="mx-auto mt-4 text-sm text-muted-foreground">
            By{' '}
            <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Saerom (Ronnie) Lee
            </a>
            , The Wharton School, University of Pennsylvania
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            An interactive exploration of {HERO_STATS.totalPatents} US patents granted by the USPTO from 1976 to 2025 (2025 data through September).
            Annual grants increased more than five-fold over this period, from 70,000 in 1976 to 374,000 in 2024,
            as computing and electronics (CPC sections G and H) rose from 27% to 57% of all grants.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <CounterStat target={9.36} label="Patents (all types)" suffix="M" decimals={2} />
            <CounterStat target={HERO_STATS.yearsCovered} label="Years" />
            <CounterStat target={HERO_STATS.chapters} label="Chapters" />
            <CounterStat target={HERO_STATS.visualizations} label="Visualizations" />
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/chapters/${CHAPTERS[0].slug}/`}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Start Reading <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#chapters"
              className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Browse All Chapters
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Visualization */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <ChartContainer
          id="fig-homepage-patent-volume"
          title="50 Years of US Patent Grants"
          subtitle="Annual patent grants by type, 1976&ndash;2025. Utility patents account for over 90% of all grants."
          loading={patentLoading}
        >
          <PWAreaChart
            data={pivotedPatents}
            xKey="year"
            areas={[
              { key: 'utility', name: 'Utility', color: CHART_COLORS[0] },
              { key: 'design', name: 'Design', color: CHART_COLORS[1] },
              { key: 'plant', name: 'Plant', color: CHART_COLORS[2] },
              { key: 'reissue', name: 'Reissue', color: CHART_COLORS[3] },
            ]}
            stacked
            yLabel="Number of Patents"
          />
        </ChartContainer>
        <div className="mt-4 text-center">
          <Link
            href="/chapters/system-patent-count/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            See the full analysis <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Chapter Cards */}
      <section id="chapters" className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-bold">Explore by Act</h2>
            <Link
              href="/explore/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Explore the Data <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-12">
            {ACT_GROUPINGS.map((act) => {
              const actChapters = act.chapters.map(
                (n) => CHAPTERS.find((c) => c.number === n)!
              );
              return (
                <div key={act.act}>
                  <div className="mb-4">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Act {act.act}
                    </div>
                    <h3 className="font-serif text-xl font-semibold">{act.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {act.subtitle} &middot; {act.chapters.length} chapters
                    </p>
                  </div>
                  {act.subgroups ? (
                    act.subgroups.map((sg) => {
                      const sgChapters = sg.chapters.map(
                        (n) => CHAPTERS.find((c) => c.number === n)!
                      );
                      return (
                        <div key={sg.title} className="mb-6 last:mb-0">
                          <h4 className="mb-3 text-sm font-semibold text-muted-foreground">{sg.title}</h4>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {sgChapters.map((ch) => (
                              <Link
                                key={ch.slug}
                                href={`/chapters/${ch.slug}/`}
                                className="group rounded-lg border bg-card p-6 hover:border-foreground/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <h4 className="font-serif text-lg font-semibold group-hover:text-chart-1 transition-colors">
                                  {ch.title}
                                </h4>
                                <p className="mt-2 text-sm text-muted-foreground">{ch.description}</p>
                                <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                  Explore <ArrowRight className="h-3 w-3" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {actChapters.map((ch) => (
                        <Link
                          key={ch.slug}
                          href={`/chapters/${ch.slug}/`}
                          className="group rounded-lg border bg-card p-6 hover:border-foreground/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <h4 className="font-serif text-lg font-semibold group-hover:text-chart-1 transition-colors">
                            {ch.title}
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground">{ch.description}</p>
                          <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Explore <ArrowRight className="h-3 w-3" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
