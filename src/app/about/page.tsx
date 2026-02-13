import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PatentWorld — Data, Methodology & Sources',
  description: 'Learn about PatentWorld\'s data sources, methodology, and technology. Built on 9.36 million US patents from PatentsView / USPTO, covering 1976 to 2025.',
  openGraph: {
    type: 'website',
    title: 'About PatentWorld',
    description: 'Data sources, methodology, and technology behind the interactive patent data exploration.',
    url: 'https://patentworld.vercel.app/about/',
    siteName: 'PatentWorld',
  },
  alternates: {
    canonical: 'https://patentworld.vercel.app/about/',
  },
};

function DatasetJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'PatentWorld — US Patent Data (1976–2025)',
    description:
      'Interactive analysis of 9.36 million US utility patents covering 50 years of global innovation, with data on inventors, assignees, technology classifications, citations, and geography.',
    url: 'https://patentworld.vercel.app/about/',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: '1976/2025',
    spatialCoverage: 'United States',
    creator: {
      '@type': 'Person',
      name: 'Saerom (Ronnie) Lee',
      affiliation: {
        '@type': 'Organization',
        name: 'The Wharton School, University of Pennsylvania',
      },
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: 'https://patentworld.vercel.app/',
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

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <DatasetJsonLd />

      <h1 className="font-serif text-4xl font-bold tracking-tight">About PatentWorld</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        By{' '}
        <a href="mailto:saeroms@upenn.edu" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Saerom (Ronnie) Lee
        </a>
        , The Wharton School, University of Pennsylvania
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <p>
          PatentWorld is an interactive data exploration project that visualizes 50 years
          of global innovation through US patent data. Our goal is to make the rich,
          complex world of patents accessible and engaging through data-driven storytelling.
        </p>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Author</h2>
          <p>
            <strong>Saerom (Ronnie) Lee</strong> is an Assistant Professor of Management
            at the Wharton School. His research focuses on organizational design,
            organizational structure, human capital, startup scaling, and high-growth
            entrepreneurship. PatentWorld is a data
            visualization project that makes half a century of US patent data accessible
            to researchers, policymakers, and the public.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Data Source</h2>
          <p>
            All data comes from{' '}
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              PatentsView
            </a>
            , a patent data platform supported by the United States Patent and Trademark
            Office (USPTO). PatentsView provides disambiguated and linked patent data covering:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>9.36 million granted patents (1976–2025)</li>
            <li>Disambiguated inventor and assignee identities</li>
            <li>Cooperative Patent Classification (CPC) technology categories</li>
            <li>WIPO technology field classifications</li>
            <li>Geographic location data for inventors</li>
            <li>Patent citation networks</li>
            <li>Government interest statements</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Key Metrics Defined</h2>
          <dl className="space-y-4 pl-2">
            <div>
              <dt className="font-semibold">Forward Citations</dt>
              <dd className="text-muted-foreground">The number of times a patent is cited by later patents. Widely used as a proxy for patent impact and technological importance.</dd>
            </div>
            <div>
              <dt className="font-semibold">Originality</dt>
              <dd className="text-muted-foreground">Measures how broadly a patent draws on prior art across different technology classes. Based on a Herfindahl index of backward citation classes. Higher values indicate more diverse knowledge sources.</dd>
            </div>
            <div>
              <dt className="font-semibold">Generality</dt>
              <dd className="text-muted-foreground">Measures how broadly a patent is cited across different technology classes. Based on a Herfindahl index of forward citation classes. Higher values indicate wider downstream influence.</dd>
            </div>
            <div>
              <dt className="font-semibold">Grant Lag (Pendency)</dt>
              <dd className="text-muted-foreground">The time between a patent application filing date and the date the patent is granted, measured in days or years.</dd>
            </div>
            <div>
              <dt className="font-semibold">Herfindahl-Hirschman Index (HHI)</dt>
              <dd className="text-muted-foreground">A measure of market concentration calculated as the sum of squared market shares. Ranges from 0 (perfectly fragmented) to 10,000 (monopoly).</dd>
            </div>
            <div>
              <dt className="font-semibold">CPC (Cooperative Patent Classification)</dt>
              <dd className="text-muted-foreground">A hierarchical classification system jointly managed by the USPTO and EPO. Sections include A (Human Necessities) through H (Electricity), plus Y (Cross-Sectional).</dd>
            </div>
            <div>
              <dt className="font-semibold">WIPO Technology Fields</dt>
              <dd className="text-muted-foreground">A classification of patents into 35 technology fields grouped into 5 sectors: Electrical engineering, Instruments, Chemistry, Mechanical engineering, and Other fields.</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Methodology</h2>
          <p>
            Raw data was downloaded as tab-separated value (TSV) files from PatentsView&apos;s
            bulk data downloads. We processed these files using DuckDB, an analytical SQL
            database engine, to compute aggregated statistics for each visualization.
          </p>
          <p>
            Key processing steps include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Joining patent records with inventor, assignee, location, and classification data</li>
            <li>Aggregating by year, technology category, geography, and organization</li>
            <li>Computing derived metrics: citation counts, team sizes, concentration ratios, diversity indices</li>
            <li>Filtering to primary classifications (sequence = 0) to avoid double-counting</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Data Limitations</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Granted patents only:</strong> The dataset includes only granted patents, not applications that were abandoned or rejected. This introduces survivorship bias.</li>
            <li><strong>US patents only:</strong> The analysis covers patents granted by the USPTO. It does not include patents filed only at foreign patent offices (EPO, JPO, CNIPA, etc.).</li>
            <li><strong>Inventor disambiguation:</strong> PatentsView uses algorithmic disambiguation to link inventor records across patents. Some errors in matching or splitting inventor identities may exist.</li>
            <li><strong>Citation truncation:</strong> Recently granted patents have had less time to accumulate forward citations, creating a right-truncation bias in citation-based metrics.</li>
            <li><strong>Classification changes:</strong> The CPC system was introduced in 2013, replacing the earlier USPC system. Historical patents were retrospectively reclassified, but some inconsistencies may remain.</li>
            <li><strong>Gender inference:</strong> Inventor gender is inferred from first names and may not reflect actual gender identity. Non-binary identities are not captured.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Technology</h2>
          <p>
            The website is built with Next.js 14 and uses Recharts for interactive
            visualizations. All data is pre-computed and served as static JSON files,
            requiring no backend server. The design uses Tailwind CSS with dark/light
            theme support.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">AI-Assisted Development</h2>
          <p>
            The data analyses, visualizations, and website development for PatentWorld
            were conducted with the assistance of{' '}
            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              Claude AI
            </a>{' '}
            (Anthropic). Claude was used for data pipeline development, statistical
            computations, analytical writing, and front-end implementation. All analytical
            insights and interpretations were reviewed for accuracy and scholarly rigor.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Attribution</h2>
          <p>
            Data attribution: PatentsView (
            <a href="https://www.patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              www.patentsview.org
            </a>
            ), USPTO.
          </p>
          <p className="text-sm text-muted-foreground">
            PatentsView is a tool built to increase the usability and transparency of US
            patent data. The database is derived from the USPTO examination and granting
            of patents.
          </p>
        </section>
      </div>
    </article>
  );
}
