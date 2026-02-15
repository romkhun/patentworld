import type { Metadata } from 'next';
import Link from 'next/link';
import { CHAPTERS, ACT_GROUPINGS } from '@/lib/constants';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: '9.36M US Patents Analyzed: Data & Methodology',
  description: 'PatentWorld analyzes 9.36M US patents (1976\u20132025) from PatentsView. Learn about data sources, methodology, limitations, and FAQs.',
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

const FAQ_ITEMS = [
  {
    question: 'How many US patents have been granted since 1976?',
    answer: 'The USPTO granted 9.36 million patents between 1976 and 2025. Annual grants increased from 70,000 in 1976 to a peak of 393,000 in 2019, a five-fold increase over five decades.',
  },
  {
    question: 'Which company holds the most US patents?',
    answer: 'IBM leads all organizations with 161,888 cumulative US patent grants, followed by Samsung (157,906) and Canon (88,742). The top 100 firms collectively hold 32-39% of all corporate patents.',
  },
  {
    question: 'How long does it take to obtain a US patent?',
    answer: 'The median time from application filing to patent grant (pendency) peaked at 3.6 years (1,317 days) in 2010 before declining to 2.4 years (875 days) in 2023. Grant lag varies substantially by technology area, with software and biotechnology patents typically taking longer than mechanical inventions.',
  },
  {
    question: 'What are the fastest-growing patent technology areas?',
    answer: 'CPC sections G (Physics) and H (Electricity) have grown from 27% of all US patents in 1976 to 57.3% by 2024. Within these sections, artificial intelligence, semiconductor design, and wireless communications have exhibited the strongest growth rates since 2012.',
  },
  {
    question: 'Is artificial intelligence patenting increasing?',
    answer: 'AI patent grants grew 5.7-fold from 5,201 in 2012 to 29,624 in 2023, reaching 9.4% of all patent grants. The acceleration began after breakthroughs in deep neural networks in 2012 and intensified further with the emergence of generative AI technologies after 2020.',
  },
  {
    question: 'What is the gender gap in US patenting?',
    answer: 'Women represent 14.9% of all US patent inventors as of 2025, up from 2.8% in 1976. The gap remains substantial across virtually all technology sectors, with the narrowest gaps in chemistry and biotechnology.',
  },
  {
    question: 'Which countries file the most US patents?',
    answer: 'The United States accounts for the largest share of US patent grants, followed by Japan, South Korea, China, and Germany. Foreign-origin patents now constitute over 50% of all US grants, reflecting the global nature of innovation. China has been the most rapidly growing source of US patents since 2010.',
  },
  {
    question: 'How has patent quality changed over time?',
    answer: 'Average 5-year forward citations peaked at 6.4 in 2019, up from 2.5 in 1976. Average claims per patent rose from 9.4 to 16.6 over the same period. Originality increased from 0.09 to 0.25, while generality declined from 0.28 to 0.15, indicating that patents draw on more diverse sources but are cited in more specialized contexts.',
  },
  {
    question: 'What was the impact of the America Invents Act?',
    answer: 'The America Invents Act (AIA) of 2011 was the most consequential US patent reform since the 1952 Patent Act. It shifted the US from a first-to-invent to a first-to-file system, created new post-grant review proceedings, and expanded prior art definitions. Inter partes review has since become a major mechanism for challenging patent validity.',
  },
  {
    question: 'How many patents does the average inventor hold?',
    answer: 'The top 12% of inventors by lifetime output produce 61% of all patent grants. The most prolific inventor, Shunpei Yamazaki, holds 6,709 US patents. A small fraction of inventors (less than 1%) hold more than 50 patents, and these prolific inventors account for a disproportionate share of total patent output.',
  },
];

const TOC_ITEMS = [
  { id: 'author', label: 'Author' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'data', label: 'Data Source' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'faq', label: 'FAQ' },
  { id: 'citation', label: 'Citation' },
];

const ABOUT_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'PatentWorld \u2014 US Patent Data (1976\u20132025)',
    description:
      'Interactive analysis of 9.36 million US patents covering 50 years of US patent data, with data on inventors, assignees, technology classifications, citations, and geography.',
    url: `${BASE_URL}/about/`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: '1976/2025',
    spatialCoverage: 'United States',
    creator: {
      '@type': 'Person',
      name: 'Saerom (Ronnie) Lee',
      jobTitle: 'Assistant Professor of Management',
      affiliation: {
        '@type': 'Organization',
        name: 'The Wharton School, University of Pennsylvania',
      },
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
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
            <a href={`#${item.id}`} className="underline underline-offset-2 hover:text-foreground transition-colors">
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
                  <ul className="mt-1 grid gap-x-4 gap-y-0.5 sm:grid-cols-2 pl-4 text-sm text-muted-foreground">
                    {actChapters.map((ch) => (
                      <li key={ch.slug}>
                        <Link
                          href={`/chapters/${ch.slug}/`}
                          className="hover:text-foreground transition-colors"
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
            Data attribution: PatentsView (
            <a href="https://www.patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              www.patentsview.org
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
            database engine, to compute aggregated statistics for each visualization.
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

          <h3 className="font-serif text-lg font-semibold mt-6">Standard Quality Metrics Suite</h3>
          <p>
            Chapters across multiple acts present a consistent set of seven patent quality metrics,
            computed for different grouping variables (by technology field, by assignee, by inventor
            category, by geography). These metrics enable cross-chapter comparisons:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Patent count:</strong> Number of granted patents in the group per year.</li>
            <li><strong>Claims per patent:</strong> Number of independent and dependent claims, measuring the scope of legal protection sought.</li>
            <li><strong>Patent scope:</strong> Number of distinct CPC subclasses assigned to each patent, measuring technological breadth.</li>
            <li><strong>Forward citations:</strong> Number of subsequent patents citing a given patent, a widely used proxy for technological impact. Subject to truncation bias for recently granted patents.</li>
            <li><strong>Backward citations:</strong> Number of prior patents cited by a given patent, reflecting the extent to which the invention builds on prior art.</li>
            <li><strong>Self-citation rate:</strong> Fraction of backward citations directed to the citing entity&apos;s own prior patents, indicating internal knowledge reuse.</li>
            <li><strong>Grant lag:</strong> Number of days between patent application filing and grant, measuring prosecution speed.</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-6">Data Limitations</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Granted patents only:</strong> The dataset includes only granted patents, not applications that were abandoned or rejected. This introduces survivorship bias.</li>
            <li><strong>US patents only:</strong> The analysis covers patents granted by the USPTO. It does not include patents filed only at foreign patent offices (EPO, JPO, CNIPA, etc.).</li>
            <li><strong>Inventor disambiguation:</strong> PatentsView uses algorithmic disambiguation to link inventor records across patents. Some errors in matching or splitting inventor identities may exist.</li>
            <li><strong>Citation truncation:</strong> Recently granted patents have had less time to accumulate forward citations, creating a right-truncation bias in citation-based metrics.</li>
            <li><strong>Classification changes:</strong> The CPC system was introduced in 2013, replacing the earlier USPC system. Historical patents were retrospectively reclassified, but some inconsistencies may remain.</li>
            <li><strong>Gender inference:</strong> Inventor gender is inferred from first names and may not reflect actual gender identity. Non-binary identities are not captured.</li>
          </ul>
        </section>

        {/* 6. FAQ Accordion */}
        <section id="faq">
          <h2 className="font-serif text-2xl font-bold pt-4">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-border">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold leading-snug">
                  <span className="pr-4">{item.question}</span>
                  <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 7. Suggested Citation */}
        <section id="citation">
          <h2 className="font-serif text-2xl font-bold pt-4">Suggested Citation</h2>
          <p className="rounded-lg border bg-muted/30 p-4 font-mono text-sm">
            Lee, Saerom (Ronnie). 2025. &ldquo;PatentWorld: 50 Years of US Patent Data.&rdquo;
            The Wharton School, University of Pennsylvania.
            Available at: https://patentworld.vercel.app/
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
