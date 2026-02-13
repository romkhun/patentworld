'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { CHAPTERS, HERO_STATS } from '@/lib/constants';

function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-32 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            An Interactive Data Exploration
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-7xl">
            Patent<span className="text-chart-1">World</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Explore 50 years of American innovation through {HERO_STATS.totalPatents} patents.
            From the microchip revolution to the AI era, discover how technology, geography,
            and human ingenuity have shaped the world.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <AnimatedStat value={HERO_STATS.totalPatents} label="Patents" />
            <AnimatedStat value={`${HERO_STATS.yearsCovered}`} label="Years" />
            <AnimatedStat value={`${HERO_STATS.chapters}`} label="Chapters" />
            <AnimatedStat value={`${HERO_STATS.visualizations}`} label="Visualizations" />
          </div>

          <div className="mt-12">
            <Link
              href={`/chapters/${CHAPTERS[0].slug}/`}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Start Reading <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Chapter Cards */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 font-serif text-2xl font-bold">Chapters</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch) => (
            <Link
              key={ch.slug}
              href={`/chapters/${ch.slug}/`}
              className="group rounded-lg border bg-card p-6 hover:border-foreground/20 transition-colors"
            >
              <div className="mb-2 font-mono text-xs text-muted-foreground">
                Chapter {String(ch.number).padStart(2, '0')}
              </div>
              <h3 className="font-serif text-lg font-semibold group-hover:text-chart-1 transition-colors">
                {ch.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{ch.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Read chapter <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Data Overview */}
      <section className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <h2 className="mb-4 font-serif text-2xl font-bold">About the Data</h2>
          <p className="max-w-prose text-muted-foreground">
            PatentWorld analyzes every patent granted by the United States Patent and Trademark
            Office (USPTO) from 1976 to 2025. The data comes from{' '}
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              PatentsView
            </a>
            , a platform supported by the USPTO that disambiguates and links patent data.
            Our analysis covers 9.36 million patents, their inventors, assignees, technology
            classifications, geographic origins, and citation networks.
          </p>
          <Link
            href="/about/"
            className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Learn more about our methodology <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
