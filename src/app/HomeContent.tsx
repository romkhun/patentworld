'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { CHAPTERS, HERO_STATS, ACT_GROUPINGS } from '@/lib/constants';
import { useInView } from '@/hooks/useInView';

function useCountUp(end: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
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

function CounterStat({ target, label, suffix, decimals, trigger }: {
  target: number; label: string; suffix?: string; decimals?: number; trigger: boolean;
}) {
  const count = useCountUp(decimals ? target * 100 : target, 1500, trigger);
  const display = decimals ? (count / 100).toFixed(decimals) : count.toLocaleString();
  const fallback = decimals ? target.toFixed(decimals) : target.toLocaleString();

  return (
    <div className="text-center">
      <div className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
        {trigger ? display : fallback}{suffix ?? ''}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const { ref: statsRef, inView: statsVisible } = useInView({ threshold: 0.2 });

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
            An interactive exploration of {HERO_STATS.totalPatents} US patents granted from 1976 to 2025,
            examining technology classifications, inventor demographics, geographic distribution,
            citation networks, and patent quality indicators.
          </p>

          <div ref={statsRef} className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <CounterStat target={9.36} label="Patents" suffix="M" decimals={2} trigger={statsVisible} />
            <CounterStat target={HERO_STATS.yearsCovered} label="Years" trigger={statsVisible} />
            <CounterStat target={HERO_STATS.chapters} label="Chapters" trigger={statsVisible} />
            <CounterStat target={HERO_STATS.visualizations} label="Visualizations" trigger={statsVisible} />
          </div>

          <div className="mt-12">
            <Link
              href={`/chapters/${CHAPTERS[0].slug}/`}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Start Reading <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Chapter Cards */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 font-serif text-2xl font-bold">Explore the Data</h2>
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
                  <p className="text-sm text-muted-foreground">{act.subtitle}</p>
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
      </section>

      {/* Data Overview */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <h2 className="mb-4 font-serif text-2xl font-bold">About the Data</h2>
          <p className="max-w-prose text-muted-foreground">
            PatentWorld examines every patent granted by the United States Patent and Trademark
            Office (USPTO) from 1976 to 2025. The data are derived from{' '}
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              PatentsView
            </a>
            , a platform supported by the USPTO that disambiguates and links patent data.
            The analysis covers 9.36 million US patents, their inventors, assignees, technology
            classifications, geographic origins, and citation networks.
          </p>
          <Link
            href="/about/"
            className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
          >
            Data sources and methodology <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
