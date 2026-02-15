import type { Metadata } from 'next';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: '9.36M US Patents Analyzed: Data & Methodology',
  description: 'PatentWorld analyzes 9.36M US patents (1976-2025) from PatentsView. Learn about data sources, methodology, metrics (citations, HHI, CPC), and FAQs.',
  openGraph: {
    type: 'website',
    title: '9.36M US Patents Analyzed: Data & Methodology | PatentWorld',
    description: 'PatentWorld analyzes 9.36M US patents (1976-2025) from PatentsView. Learn about data sources, methodology, and key metrics.',
    url: `${BASE_URL}/about/`,
    siteName: 'PatentWorld',
    images: [{ url: `${BASE_URL}/og/home.png`, width: 1200, height: 630, alt: 'About PatentWorld' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '9.36M US Patents Analyzed: Data & Methodology | PatentWorld',
    description: 'PatentWorld analyzes 9.36M US patents (1976-2025) from PatentsView. Learn about data sources, methodology, and key metrics.',
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
    answer: 'The USPTO granted approximately 9.36 million patents between 1976 and 2025. Annual grants increased from approximately 70,000 in the late 1970s to over 350,000 per year by the 2020s, representing a five-fold increase over five decades.',
  },
  {
    question: 'Which company holds the most US patents?',
    answer: 'IBM has been the most prolific US patent filer for most of the past three decades, consistently ranking first or second in annual grants. Samsung, Canon, Intel, and TSMC are among the other top patent holders. The top 100 firms collectively hold approximately 30% of all US patents.',
  },
  {
    question: 'How long does it take to obtain a US patent?',
    answer: 'The average time from application filing to patent grant (grant lag or pendency) peaked above 3 years in the early 2010s before declining to approximately 2 years by the 2020s. Grant lag varies substantially by technology area, with software and biotechnology patents typically taking longer than mechanical inventions.',
  },
  {
    question: 'What are the fastest-growing patent technology areas?',
    answer: 'Computing and electronics have grown from approximately 12\u201315% of all US patents in 1976 to approximately 33\u201340% by 2025. Within this broad category, artificial intelligence, semiconductor design, and wireless communications have exhibited the strongest growth rates in recent years.',
  },
  {
    question: 'Is artificial intelligence patenting increasing?',
    answer: 'AI patent filings grew approximately six-fold during the deep learning era (2012-2025). The acceleration began after breakthroughs in deep neural networks around 2012 and intensified further with the emergence of generative AI technologies after 2020.',
  },
  {
    question: 'What is the gender gap in US patenting?',
    answer: 'Women represent approximately 15% of all US patent inventors as of the most recent data. While the share has grown from under 5% in the 1970s, the gap remains substantial across virtually all technology sectors, with the narrowest gaps in chemistry and biotechnology.',
  },
  {
    question: 'Which countries file the most US patents?',
    answer: 'The United States accounts for the largest share of US patent grants, followed by Japan, South Korea, China, and Germany. Foreign-origin patents now constitute over 50% of all US grants, reflecting the global nature of innovation. China has been the most rapidly growing source of US patents since 2010.',
  },
  {
    question: 'How has patent quality changed over time?',
    answer: 'Median forward citations (a common proxy for patent quality) declined approximately 40% as patent volume increased substantially. However, originality and generality scores have remained relatively stable, and the patents in the upper tail of the citation distribution continue to receive high citation counts, suggesting that the average has declined while top-quality innovation persists.',
  },
  {
    question: 'What was the impact of the America Invents Act?',
    answer: 'The America Invents Act (AIA) of 2011 was the most consequential US patent reform since the 1952 Patent Act. It shifted the US from a first-to-invent to a first-to-file system, created new post-grant review proceedings, and expanded prior art definitions. Inter partes review has since become a major mechanism for challenging patent validity.',
  },
  {
    question: 'How many patents does the average inventor hold?',
    answer: 'The majority of patent inventors hold only one or two patents. The median inventor has approximately 2 patents, while the mean is higher due to prolific inventors. A small fraction of inventors (less than 1%) hold more than 50 patents, and these prolific inventors account for a disproportionate share of total patent output.',
  },
];

const TOC_ITEMS = [
  { id: 'author', label: 'Author' },
  { id: 'data-methodology', label: 'Data & Methodology' },
  { id: 'faq', label: 'FAQ' },
  { id: 'citation', label: 'Citation' },
];

function FAQJsonLd() {
  const jsonLd = {
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function DatasetJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'PatentWorld \u2014 US Patent Data (1976\u20132025)',
    description:
      'Interactive analysis of 9.36 million US utility patents covering 50 years of US patent data, with data on inventors, assignees, technology classifications, citations, and geography.',
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE_URL}/about/` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <DatasetJsonLd />
      <FAQJsonLd />
      <BreadcrumbJsonLd />

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
        <p>
          PatentWorld is an interactive data exploration platform that presents 50 years
          of United States patent activity through quantitative visualizations. The project
          aims to render the complex dynamics of the patent system accessible to students,
          researchers, policymakers, and the broader public through rigorous, data-driven analysis.
        </p>

        {/* ── About the Author ── */}
        <section id="author">
          <h2 className="font-serif text-2xl font-bold pt-4">About the Author</h2>
          <p>
            <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-foreground transition-colors">Saerom (Ronnie) Lee</a> is an Assistant Professor of Management
            at The Wharton School, University of Pennsylvania. His research examines
            organizational design, human capital acquisition, startup scaling, and
            high-growth entrepreneurship. Additional information is available on his{' '}
            <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              personal website
            </a>. PatentWorld was developed to provide a rigorous, interactive platform
            for examining half a century of US patent data.
          </p>
          <p>
            Correspondence:{' '}
            <a href="mailto:saeroms@upenn.edu" className="underline underline-offset-2 hover:text-foreground transition-colors">
              saeroms@upenn.edu
            </a>
            . Feedback, collaboration inquiries, and suggestions are welcome.
          </p>
        </section>

        {/* ── Data & Methodology ── */}
        <section id="data-methodology">
          <h2 className="font-serif text-2xl font-bold pt-4">Data &amp; Methodology</h2>

          <h3 className="font-serif text-lg font-semibold mt-6">Data Source</h3>
          <p>
            All data are derived from{' '}
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              PatentsView
            </a>
            , a patent data platform supported by the United States Patent and Trademark
            Office (USPTO). PatentsView provides disambiguated and linked patent data covering:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>9.36 million granted patents (1976&ndash;2025)</li>
            <li>Disambiguated inventor and assignee identities</li>
            <li>Cooperative Patent Classification (CPC) technology categories</li>
            <li>WIPO technology field classifications</li>
            <li>Geographic location data for inventors</li>
            <li>Patent citation networks</li>
            <li>Government interest statements</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-6">Methodology</h3>
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

        {/* ── FAQ Accordion ── */}
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

        {/* ── Citation & Attribution ── */}
        <section id="citation">
          <h2 className="font-serif text-2xl font-bold pt-4">Citation &amp; Attribution</h2>
          <p className="rounded-lg border bg-muted/30 p-4 font-mono text-sm">
            Lee, Saerom (Ronnie). 2025. &ldquo;PatentWorld: 50 Years of US Patent Data.&rdquo;
            The Wharton School, University of Pennsylvania.
            Available at: https://patentworld.vercel.app/
          </p>
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

        {/* ── Technical Details (collapsible) ── */}
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
