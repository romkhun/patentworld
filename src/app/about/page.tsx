import type { Metadata } from 'next';
import Link from 'next/link';
import { CHAPTERS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About PatentWorld — Data, Methodology & Sources',
  description: 'Data sources, methodology, and analytical approach for PatentWorld. Built on 9.36 million US patents from PatentsView / USPTO, covering 1976 to 2025.',
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
    answer: 'Computing and electronics have grown from approximately 12–15% of all US patents in 1976 to approximately 33–40% by 2025. Within this broad category, artificial intelligence, semiconductor design, and wireless communications have exhibited the strongest growth rates in recent years.',
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
    answer: 'The United States accounts for the largest share of US patent grants, followed by Japan, South Korea, China, and Germany. Foreign-origin patents now constitute over 50% of all US grants, reflecting the global nature of innovation. China has been the fastest-growing source of US patents since 2010.',
  },
  {
    question: 'How has patent quality changed over time?',
    answer: 'Median forward citations (a common proxy for patent quality) declined approximately 40% as patent volume increased substantially. However, originality and generality scores have remained relatively stable, and the patents in the upper tail of the citation distribution continue to receive high citation counts, suggesting that the average has declined while top-quality innovation persists.',
  },
  {
    question: 'What was the impact of the America Invents Act?',
    answer: 'The America Invents Act (AIA) of 2011 was the most significant US patent reform in decades. It shifted the US from a first-to-invent to a first-to-file system, created new post-grant review proceedings, and expanded prior art definitions. Inter partes review has since become a major mechanism for challenging patent validity.',
  },
  {
    question: 'How many patents does the average inventor hold?',
    answer: 'The majority of patent inventors hold only one or two patents. The median inventor has approximately 2 patents, while the mean is higher due to prolific inventors. A small fraction of inventors (less than 1%) hold more than 50 patents, and these prolific inventors account for a disproportionate share of total patent output.',
  },
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
    name: 'PatentWorld — US Patent Data (1976–2025)',
    description:
      'Interactive analysis of 9.36 million US utility patents covering 50 years of US patent data, with data on inventors, assignees, technology classifications, citations, and geography.',
    url: 'https://patentworld.vercel.app/about/',
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
      <FAQJsonLd />

      <h1 className="font-serif text-4xl font-bold tracking-tight">About PatentWorld</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        By{' '}
        <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Saerom (Ronnie) Lee
        </a>
        , The Wharton School, University of Pennsylvania
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <p>
          PatentWorld is an interactive data exploration platform that presents 50 years
          of United States patent activity through quantitative visualizations. The project
          aims to render the complex dynamics of the patent system accessible to students,
          researchers, policymakers, and the broader public through rigorous, data-driven analysis.
        </p>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">About the Author</h2>
          <p>
            <strong><a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">Saerom (Ronnie) Lee</a></strong> is an Assistant Professor of Management
            at The Wharton School, University of Pennsylvania. His research examines
            organizational design, human capital allocation, and the scaling of high-growth
            ventures. Additional information is available on his{' '}
            <a href="https://www.saeromlee.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              faculty page
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

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Explore the Chapters</h2>
          <p>PatentWorld is organized into {CHAPTERS.length} chapters, each examining a different dimension of the US patent system:</p>
          <ol className="list-decimal pl-6 space-y-1 mt-2">
            {CHAPTERS.map((ch) => (
              <li key={ch.slug}>
                <Link href={`/chapters/${ch.slug}`} className="underline underline-offset-2 hover:text-foreground transition-colors">
                  {ch.title}
                </Link>
                {' '}&mdash; {ch.description}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Data Source</h2>
          <p>
            All data are derived from{' '}
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
            The platform is built with Next.js 14 and employs Recharts for interactive
            visualizations. All data are pre-computed and served as static JSON files,
            requiring no backend server. The interface uses Tailwind CSS with dark and light
            theme support.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">AI-Assisted Development</h2>
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
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Frequently Asked Questions</h2>
          <dl className="space-y-6 mt-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-l-2 border-primary/20 pl-4">
                <dt className="font-semibold text-foreground">{item.question}</dt>
                <dd className="mt-1 text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold pt-4">Suggested Citation</h2>
          <p className="rounded-lg border bg-muted/30 p-4 font-mono text-sm">
            Lee, Saerom (Ronnie). 2025. &ldquo;PatentWorld: 50 Years of US Patent Innovation.&rdquo;
            The Wharton School, University of Pennsylvania. Available at: https://patentworld.vercel.app/
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
