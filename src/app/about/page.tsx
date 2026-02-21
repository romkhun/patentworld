import type { Metadata } from 'next';
import Link from 'next/link';
import { CHAPTERS, ACT_GROUPINGS } from '@/lib/constants';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: '9.36M US Patents Analyzed: Data & Methodology',
  description: 'PatentWorld analyzes 9.36M US patents (1976\u20132025) from PatentsView. Learn about data sources, methodology, and limitations.',
  openGraph: {
    type: 'website',
    title: '9.36M US Patents Analyzed: Data & Methodology | PatentWorld',
    description: 'PatentWorld analyzes 9.36M US patents (1976\u20132025) from PatentsView. Learn about data sources, methodology, and key metrics.',
    url: `${BASE_URL}/about/`,
    siteName: 'PatentWorld',
    images: [{ url: `${BASE_URL}/og/home.png`, width: 1200, height: 630, alt: 'About PatentWorld' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '9.36M US Patents Analyzed: Data & Methodology | PatentWorld',
    description: 'PatentWorld analyzes 9.36M US patents (1976\u20132025) from PatentsView. Learn about data sources, methodology, and key metrics.',
    images: [`${BASE_URL}/og/home.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/about/`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const TOC_ITEMS = [
  { id: 'author', label: 'Author' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'data', label: 'Data Source' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'citation', label: 'Citation' },
  { id: 'license', label: 'License' },
];

const ABOUT_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'PatentWorld Analytical Dataset',
    description:
      'Derived analytics from USPTO PatentsView covering U.S. patents 1976\u20132025. Interactive analysis of 9.36 million US patents with data on inventors, assignees, technology classifications, citations, and geography.',
    url: `${BASE_URL}/about/`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: '1976/2025',
    spatialCoverage: 'United States',
    datePublished: '2026',
    creator: {
      '@type': 'Person',
      name: 'Saerom (Ronnie) Lee',
      jobTitle: 'Assistant Professor of Management',
      affiliation: {
        '@type': 'Organization',
        name: 'The Wharton School, University of Pennsylvania',
      },
    },
    sourceOrganization: {
      '@type': 'Organization',
      name: 'USPTO PatentsView',
      url: 'https://patentsview.org',
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: BASE_URL,
    },
    isBasedOn: {
      '@type': 'Dataset',
      name: 'PatentsView',
      url: 'https://patentsview.org',
      description: 'Patent data platform supported by the USPTO.',
    },
    variableMeasured: [
      'Patent grants per year',
      'Forward citations',
      'Patent originality',
      'Patent generality',
      'Grant lag (pendency)',
      'Herfindahl-Hirschman Index (HHI)',
      'Inventor team size',
      'CPC technology classifications',
      'Geographic location of inventors',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE_URL}/about/` },
    ],
  },
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <JsonLd data={ABOUT_JSONLD} />

      <h1 className="font-serif text-4xl font-bold tracking-tight">About PatentWorld</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        By{' '}
        <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Saerom (Ronnie) Lee
        </a>
        , The Wharton School, University of Pennsylvania
      </p>

      {/* Mini Table of Contents */}
      <nav className="mt-6 flex flex-wrap gap-x-1 text-sm text-muted-foreground" aria-label="Page sections">
        {TOC_ITEMS.map((item, i) => (
          <span key={item.id}>
            {i > 0 && <span className="mr-1" aria-hidden="true">&middot;</span>}
            <a href={`#${item.id}`} className="inline-block py-0.5 underline underline-offset-2 hover:text-foreground transition-colors">
              {item.label}
            </a>
          </span>
        ))}
      </nav>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">

        {/* 1. Opening paragraph */}
        <p>
          PatentWorld is an interactive data exploration platform that presents 50 years
          of United States patent activity through quantitative visualizations. The project
          aims to render the complex dynamics of the patent system accessible to students,
          researchers, policymakers, and the broader public through rigorous, data-driven analysis.
        </p>

        {/* 2. About the Author */}
        <section id="author">
          <h2 className="font-serif text-2xl font-bold pt-4">About the Author</h2>
          <p>
            <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-foreground transition-colors">Saerom (Ronnie) Lee</a> is an Assistant Professor of Management
            at The Wharton School, University of Pennsylvania. His research examines
            organizational design, human capital acquisition, startup scaling, and
            high-growth entrepreneurship. Additional information is available on his{' '}
            <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              personal website
            </a>.
            Correspondence:{' '}
            <a href="mailto:saeroms@upenn.edu" className="underline underline-offset-2 hover:text-foreground transition-colors">
              saeroms@upenn.edu
            </a>
            . Feedback, collaboration inquiries, and suggestions are welcome.
          </p>
        </section>

        {/* 3. Chapter Overview */}
        <section id="chapters">
          <h2 className="font-serif text-2xl font-bold pt-4">Chapters</h2>
          <p>
            PatentWorld presents {CHAPTERS.length} chapters organized into six acts, each examining a different
            dimension of the US patent system.
          </p>
          <div className="mt-4 space-y-4">
            {ACT_GROUPINGS.map((act) => {
              const actChapters = act.chapters.map(
                (n) => CHAPTERS.find((c) => c.number === n)!
              );
              return (
                <div key={act.act}>
                  <h3 className="text-sm font-semibold">
                    Act {act.act}: {act.title}
                    <span className="ml-2 font-normal text-muted-foreground">&mdash; {act.subtitle}</span>
                  </h3>
                  <ul className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2 pl-4 text-sm text-muted-foreground">
                    {actChapters.map((ch) => (
                      <li key={ch.slug}>
                        <Link
                          href={`/chapters/${ch.slug}/`}
                          className="inline-block py-0.5 hover:text-foreground transition-colors"
                        >
                          {ch.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Data Source & Attribution */}
        <section id="data">
          <h2 className="font-serif text-2xl font-bold pt-4">Data Source &amp; Attribution</h2>
          <p>
            All data are derived from{' '}
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              PatentsView
            </a>
            , a patent data platform supported by the United States Patent and Trademark
            Office (USPTO). The dataset covers 9.36 million granted patents from 1976 to 2025.
            PatentsView provides disambiguated and linked patent data covering:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Disambiguated inventor and assignee identities</li>
            <li>Cooperative Patent Classification (CPC) technology categories</li>
            <li>WIPO technology field classifications</li>
            <li>Geographic location data for inventors</li>
            <li>Patent citation networks</li>
            <li>Government interest statements</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Data source: USPTO PatentsView bulk data download, accessed February 2026.
            Temporal coverage: January 1976 &ndash; September 2025.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Data attribution: PatentsView (
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              patentsview.org
            </a>
            ), USPTO. PatentsView is a tool built to increase the usability and transparency of US
            patent data. The database is derived from the USPTO examination and granting
            of patents.
          </p>
        </section>

        {/* 5. Methodology */}
        <section id="methodology">
          <h2 className="font-serif text-2xl font-bold pt-4">Methodology</h2>
          <p>
            Raw data were obtained as tab-separated value (TSV) files from PatentsView&apos;s
            bulk data downloads. These files were processed using DuckDB, an analytical SQL
            database engine, and Polars (Python) to compute aggregated statistics for each visualization.
            The analysis encompasses all USPTO-granted patents from January 1976 through
            September 2025, including utility, design, plant, and reissue patents.
          </p>
          <p>
            Principal data processing steps include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Joining patent records with inventor, assignee, location, and classification data</li>
            <li>Aggregating by year, technology category, geography, and organization</li>
            <li>Computing derived metrics: citation counts, team sizes, concentration ratios, diversity indices</li>
            <li>Filtering to primary classifications (sequence = 0) to avoid double-counting</li>
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">
            For detailed metric definitions, the standard quality metrics suite, disambiguation
            reliability details, and data limitations, see the{' '}
            <Link href="/methodology/#definitions" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Methodology page
            </Link>. For known data limitations, see the{' '}
            <Link href="/methodology/#limitations" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Limitations section
            </Link>.
          </p>
        </section>

        {/* 6. Suggested Citation */}
        <section id="citation">
          <h2 className="font-serif text-2xl font-bold pt-4">Suggested Citation</h2>
          <p className="rounded-lg border bg-muted/30 p-4 font-mono text-sm">
            Lee, Saerom (Ronnie). 2026. &ldquo;PatentWorld: 50 Years of US Patent Data.&rdquo;
            The Wharton School, University of Pennsylvania.
            Available at: https://patentworld.vercel.app/
          </p>
        </section>

        {/* License */}
        <section id="license">
          <h2 className="font-serif text-2xl font-bold pt-4">License</h2>
          <p>
            The text, visualizations, and derived datasets on PatentWorld are licensed under{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Creative Commons Attribution 4.0 International (CC BY 4.0)
            </a>
            . You are free to share and adapt the material for any purpose, provided appropriate
            credit is given. The underlying patent data are provided by the USPTO via PatentsView
            and are in the public domain.
          </p>
        </section>

        {/* 8. Technical Details (collapsed) */}
        <details className="rounded-lg border bg-muted/20 mt-6">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold hover:text-foreground transition-colors">
            Technical Details
          </summary>
          <div className="px-5 pb-5 space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">Technology</h3>
              <p>
                The platform is built with Next.js 14 and employs Recharts for interactive
                visualizations. All data are pre-computed and served as static JSON files,
                requiring no backend server. The interface uses Tailwind CSS with dark and light
                theme support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI-Assisted Development</h3>
              <p>
                The data analyses, visualizations, and platform development for PatentWorld
                were conducted with the assistance of{' '}
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
                  Claude AI
                </a>{' '}
                (Anthropic). Claude was employed for data pipeline development, statistical
                computations, analytical writing, and front-end implementation. All analytical
                findings and interpretations were reviewed for accuracy and scholarly rigor.
              </p>
            </div>
          </div>
        </details>
      </div>
    </article>
  );
}
