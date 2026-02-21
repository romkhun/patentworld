import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: 'Data Dictionary & Methodology',
  description: 'PatentWorld methodology: patent universe definitions, temporal coverage (1976-2025), geography basis, CPC field classification, key metrics (originality, exploration, sleeping beauty, HHI, green patents), and data sources.',
  openGraph: {
    type: 'website',
    title: 'Data Dictionary & Methodology | PatentWorld',
    description: 'Definitions, measurement choices, and data sources behind PatentWorld\'s analysis of 9.36 million US patents.',
    url: `${BASE_URL}/methodology/`,
    siteName: 'PatentWorld',
    images: [{ url: `${BASE_URL}/og/home.png`, width: 1200, height: 630, alt: 'PatentWorld Methodology' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Dictionary & Methodology | PatentWorld',
    description: 'Definitions, measurement choices, and data sources behind PatentWorld\'s analysis of 9.36 million US patents.',
    images: [`${BASE_URL}/og/home.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/methodology/`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const TOC_ITEMS = [
  { id: 'patent-universe', label: 'Patent Universe' },
  { id: 'temporal-coverage', label: 'Temporal Coverage' },
  { id: 'geography', label: 'Geography Basis' },
  { id: 'field-classification', label: 'Field Classification' },
  { id: 'key-metrics', label: 'Key Metrics' },
  { id: 'quality-metrics', label: 'Quality Metrics Suite' },
  { id: 'definitions', label: 'Definitions' },
  { id: 'disambiguation', label: 'Disambiguation' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'data-source', label: 'Data Source' },
];

const METHODOLOGY_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'PatentWorld Data Dictionary & Methodology',
    description:
      'Definitions, measurement choices, and data sources behind PatentWorld\'s analysis of 9.36 million US patents (1976-2025).',
    url: `${BASE_URL}/methodology/`,
    author: {
      '@type': 'Person',
      name: 'Saerom (Ronnie) Lee',
      jobTitle: 'Assistant Professor of Management',
      affiliation: {
        '@type': 'Organization',
        name: 'The Wharton School, University of Pennsylvania',
      },
    },
    datePublished: '2025-01-01',
    dateModified: '2026-02-20',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PatentWorld',
      url: BASE_URL,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Methodology', item: `${BASE_URL}/methodology/` },
    ],
  },
];

export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <JsonLd data={METHODOLOGY_JSONLD} />

      <h1 className="font-serif text-4xl font-bold tracking-tight">Data Dictionary &amp; Methodology</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Definitions, measurement choices, and data sources behind PatentWorld.
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

        {/* 1. Patent Universe */}
        <section id="patent-universe">
          <h2 className="font-serif text-2xl font-bold pt-4">Patent Universe</h2>
          <p>
            PatentWorld covers <strong>9.36 million</strong> patents granted by the United States Patent
            and Trademark Office (USPTO), encompassing all patent types: utility, design, plant, and
            reissue. Utility patents account for over 90% of all grants and represent the primary unit
            of analysis throughout most chapters.
          </p>
          <p className="mt-3">
            When chapters restrict analysis to <strong>utility patents only</strong>, the universe is
            approximately <strong>8.45 million</strong> patents. Design patents (covering ornamental
            appearance), plant patents, and reissue patents are included in aggregate counts but are
            excluded from most quality-metric analyses because their claim structures, citation
            patterns, and examination processes differ materially from utility patents.
          </p>
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-semibold">All types vs. utility only</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>All types:</strong> 9.36 million patents (utility + design + plant + reissue)</li>
              <li><strong>Utility only:</strong> ~8.45 million patents</li>
              <li><strong>Difference:</strong> ~910,000 patents, predominantly design patents</li>
            </ul>
          </div>
        </section>

        {/* 2. Temporal Coverage */}
        <section id="temporal-coverage">
          <h2 className="font-serif text-2xl font-bold pt-4">Temporal Coverage</h2>
          <p>
            The dataset spans <strong>January 1976 through September 2025</strong>. The start date
            corresponds to the earliest systematically available digital patent records in the
            PatentsView database. All time-series analyses use grant year unless otherwise noted.
          </p>
          <p className="mt-3">
            <strong>2025 is a partial year.</strong> Data for 2025 covers only grants issued through
            September 2025. Annual totals for 2025 should not be directly compared with full-year
            figures from prior years without appropriate adjustment. Where feasible, chapters note
            this truncation explicitly.
          </p>
          <p className="mt-3">
            Several analyses also present data by <strong>filing year</strong> (the date of the
            earliest US application in the patent family). Filing-year counts for recent years are
            subject to right-truncation bias because many applications remain pending at any given
            point. Chapters that use filing-year data note this limitation.
          </p>
        </section>

        {/* 3. Geography Basis */}
        <section id="geography">
          <h2 className="font-serif text-2xl font-bold pt-4">Geography Basis</h2>
          <p>
            Geographic analyses throughout PatentWorld use two distinct bases, depending on the
            chapter and research question:
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Inventor country</dt>
              <dd className="text-muted-foreground mt-1">
                The country of residence of the patent&apos;s inventor(s), as recorded in PatentsView&apos;s
                disambiguated inventor-location data. When a patent has multiple inventors in
                different countries, fractional counting (each inventor&apos;s country receives equal
                credit) is used unless otherwise noted. This basis captures <em>where inventive
                work occurs</em> and is used in the{' '}
                <Link href="/chapters/geo-domestic/" className="underline underline-offset-2 hover:text-foreground transition-colors">domestic geography</Link>,{' '}
                <Link href="/chapters/geo-international/" className="underline underline-offset-2 hover:text-foreground transition-colors">international geography</Link>, and{' '}
                <Link href="/chapters/mech-geography/" className="underline underline-offset-2 hover:text-foreground transition-colors">geographic mechanics</Link> chapters.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Assignee country</dt>
              <dd className="text-muted-foreground mt-1">
                The country associated with the patent&apos;s assignee (the entity that owns the
                patent rights). This basis captures <em>where IP ownership resides</em> and is used
                in the{' '}
                <Link href="/chapters/org-composition/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational composition</Link> chapter
                and in the Act 6 deep-dive chapters when analyzing geographic patterns by
                assignee.
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            These two bases can yield different results. A patent invented in Germany but assigned
            to a US corporation would be counted under Germany (inventor basis) or the United
            States (assignee basis). Chapters specify which basis is used.
          </p>
        </section>

        {/* 4. Field Classification */}
        <section id="field-classification">
          <h2 className="font-serif text-2xl font-bold pt-4">Field Classification</h2>
          <p>
            PatentWorld uses two complementary approaches to classify patents by technology area:
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Cooperative Patent Classification (CPC) sections</dt>
              <dd className="text-muted-foreground mt-1">
                The CPC system is a hierarchical classification jointly managed by the USPTO and the
                European Patent Office (EPO). It organizes patents into eight top-level sections
                (A through H and Y) and progressively finer subclasses. PatentWorld uses CPC section
                as the primary technology grouping throughout Acts 1-5. Section-level classification
                provides a consistent, stable taxonomy across the full 1976-2025 period, although
                the CPC was formally introduced in 2013 and historical patents were retrospectively
                reclassified.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Non-Negative Matrix Factorization (NMF) topic model</dt>
              <dd className="text-muted-foreground mt-1">
                The{' '}
                <Link href="/chapters/system-language/" className="underline underline-offset-2 hover:text-foreground transition-colors">Language of Innovation</Link> chapter
                applies NMF topic modeling to 8.45 million patent abstracts to discover 25
                data-driven technology themes. Unlike CPC, which relies on examiner-assigned codes,
                the NMF topic model extracts thematic structure directly from patent text using
                term frequency-inverse document frequency (TF-IDF) vectorization followed by
                matrix decomposition. This approach reveals latent technology themes that may
                cross-cut formal classification boundaries.
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            Act 6 deep-dive chapters define domain-specific patent universes using curated sets
            of CPC subclasses relevant to each technology domain (e.g., AI, biotechnology,
            semiconductors). The specific CPC codes used are documented in each chapter&apos;s
            measurement details panel.
          </p>
        </section>

        {/* 5. Key Metrics */}
        <section id="key-metrics">
          <h2 className="font-serif text-2xl font-bold pt-4">Key Metrics</h2>

          <h3 className="font-serif text-lg font-semibold mt-6">Originality Score</h3>
          <p>
            Originality measures the breadth of a patent&apos;s backward citations across CPC
            sections. It is computed as 1 minus the Herfindahl-Hirschman Index (HHI) of the CPC
            section distribution among a patent&apos;s backward citations:
          </p>
          <p className="mt-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm">
            Originality = 1 - &Sigma; s<sub>i</sub><sup>2</sup>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            where s<sub>i</sub> is the share of backward citations in CPC section <em>i</em>. A patent
            that cites prior art exclusively from one CPC section has originality 0; a patent that
            draws equally from all sections approaches 1. This metric captures the degree to which
            an invention synthesizes knowledge from diverse technological domains.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Exploration Composite</h3>
          <p>
            The exploration composite score measures the degree to which a patent represents
            exploratory (as opposed to exploitative) innovation. It is the equally weighted average
            of three normalized sub-scores:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
            <li><strong>Technology newness:</strong> Whether the patent uses CPC subclasses that are new to the assignee&apos;s historical portfolio.</li>
            <li><strong>Citation newness:</strong> Whether the patent cites prior art that is new to the assignee (not previously cited by the assignee&apos;s other patents).</li>
            <li><strong>External sourcing:</strong> Whether the patent&apos;s backward citations come predominantly from patents held by other organizations rather than the assignee&apos;s own prior patents.</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            Each sub-score is normalized to a 0-1 scale, and the composite is their arithmetic mean.
            Patents scoring above <strong>0.6</strong> are classified as <em>exploratory</em>; those
            below 0.6 are classified as <em>exploitative</em>. This threshold is used in the{' '}
            <Link href="/chapters/mech-organizations/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational mechanics</Link> chapter
            and throughout Act 6 deep dives.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Sleeping Beauty Detection</h3>
          <p>
            Sleeping beauty patents are patents that receive few or no citations for an extended
            period after grant before experiencing a sudden surge of recognition. These delayed-recognition
            patents are identified using a citation time-profile analysis: a patent qualifies as
            a sleeping beauty if it accumulates citations at a rate significantly below its
            eventual steady-state rate during its first several years, followed by an acceleration
            that brings its cumulative citations well above the cohort average.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sleeping beauties are particularly relevant in the{' '}
            <Link href="/chapters/system-patent-quality/" className="underline underline-offset-2 hover:text-foreground transition-colors">patent quality</Link> and{' '}
            <Link href="/chapters/org-patent-quality/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational patent quality</Link> chapters,
            where they illustrate how standard citation windows may miss patents whose
            technological significance is recognized only after a considerable delay.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Herfindahl-Hirschman Index (HHI)</h3>
          <p>
            The Herfindahl-Hirschman Index measures concentration. It is computed as:
          </p>
          <p className="mt-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm">
            HHI = &Sigma; s<sub>i</sub><sup>2</sup> &times; 10,000
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            where s<sub>i</sub> is the market share (or category share) of entity <em>i</em>, expressed
            as a decimal. The index ranges from near 0 (highly fragmented) to 10,000 (monopoly).
            The US Department of Justice and Federal Trade Commission (2010 Horizontal Merger
            Guidelines) classify markets as unconcentrated (&lt;1,500), moderately concentrated
            (1,500-2,500), or highly concentrated (&gt;2,500). In PatentWorld, HHI is used to
            measure assignee concentration within technology fields and geographic regions.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Green Patent Definition</h3>
          <p>
            Green patents are defined as patents classified under CPC codes <strong>Y02</strong> (technologies
            for climate change mitigation) or <strong>Y04S</strong> (smart grids). The Y02 section
            includes sub-categories for:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
            <li><strong>Y02E:</strong> Reduction of greenhouse gas emissions related to energy generation, transmission, or distribution (solar, wind, hydro, nuclear, fuel cells)</li>
            <li><strong>Y02T:</strong> Climate change mitigation technologies related to transportation (electric vehicles, hybrid vehicles, aerodynamics)</li>
            <li><strong>Y02C:</strong> Capture, storage, sequestration, or disposal of greenhouse gases</li>
            <li><strong>Y02B:</strong> Climate change mitigation technologies related to buildings (insulation, lighting, HVAC)</li>
            <li><strong>Y02P:</strong> Climate change mitigation technologies in the production or processing of goods</li>
            <li><strong>Y02W:</strong> Climate change mitigation technologies related to wastewater treatment or waste management</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            This definition follows standard practice in the patent analytics literature. The{' '}
            <Link href="/chapters/green-innovation/" className="underline underline-offset-2 hover:text-foreground transition-colors">green innovation</Link> chapter
            provides detailed analysis of trends, geography, and organizational dynamics within
            this patent universe.
          </p>
        </section>

        {/* 6. Standard Quality Metrics Suite */}
        <section id="quality-metrics">
          <h2 className="font-serif text-2xl font-bold pt-4">Standard Quality Metrics Suite</h2>
          <p>
            Chapters across multiple acts present a consistent set of seven patent quality metrics,
            computed for different grouping variables (by technology field, by assignee, by inventor
            category, by geography). These metrics enable cross-chapter comparisons:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li><strong>Patent count:</strong> Number of granted patents in the group per year.</li>
            <li><strong>Claims per patent:</strong> Number of independent and dependent claims, measuring the scope of legal protection sought.</li>
            <li><strong>Patent scope:</strong> Number of distinct CPC subclasses assigned to each patent, measuring technological breadth.</li>
            <li><strong>Forward citations:</strong> Number of subsequent patents citing a given patent, a widely used proxy for technological impact. Subject to truncation bias for recently granted patents.</li>
            <li><strong>Backward citations:</strong> Number of prior patents cited by a given patent, reflecting the extent to which the invention builds on prior art.</li>
            <li><strong>Self-citation rate:</strong> Fraction of backward citations directed to the citing entity&apos;s own prior patents, indicating internal knowledge reuse.</li>
            <li><strong>Grant lag:</strong> Number of days between patent application filing and grant, measuring prosecution speed.</li>
          </ul>
        </section>

        {/* 7. Measurement Definitions */}
        <section id="definitions">
          <h2 className="font-serif text-2xl font-bold pt-4">Measurement Definitions</h2>
          <p>
            The following metrics are used throughout PatentWorld. Definitions are standardized
            across chapters to enable cross-chapter comparisons.
          </p>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Forward citations (5-year)</dt>
              <dd className="text-muted-foreground">Number of subsequent patents citing a given patent within 5 years of grant. A widely used proxy for technological impact. Subject to truncation bias for patents granted after 2020.</dd>
            </div>
            <div>
              <dt className="font-semibold">Backward citations</dt>
              <dd className="text-muted-foreground">Number of prior patents cited by a given patent. Reflects the extent to which the invention builds on existing prior art.</dd>
            </div>
            <div>
              <dt className="font-semibold">Originality</dt>
              <dd className="text-muted-foreground">1 minus the HHI of CPC sections among a patent&apos;s backward citations. Higher values indicate the patent draws from more diverse technology sources. Range: 0 (all citations from one section) to ~1 (citations spread evenly across sections).</dd>
            </div>
            <div>
              <dt className="font-semibold">Generality</dt>
              <dd className="text-muted-foreground">1 minus the HHI of CPC sections among a patent&apos;s forward citations. Higher values indicate the patent is cited by a broader range of technology fields. Range: 0 (all citing patents in one section) to ~1 (cited across many sections).</dd>
            </div>
            <div>
              <dt className="font-semibold">Self-citation rate</dt>
              <dd className="text-muted-foreground">Fraction of backward citations directed to the same assignee&apos;s own prior patents. Higher values indicate greater internal knowledge reuse.</dd>
            </div>
            <div>
              <dt className="font-semibold">Claims per patent</dt>
              <dd className="text-muted-foreground">Total number of independent and dependent claims in a patent. Measures the scope of legal protection sought.</dd>
            </div>
            <div>
              <dt className="font-semibold">Patent scope</dt>
              <dd className="text-muted-foreground">Number of distinct CPC subclasses assigned to each patent. Measures technological breadth of the invention.</dd>
            </div>
            <div>
              <dt className="font-semibold">Grant lag</dt>
              <dd className="text-muted-foreground">Number of days between patent application filing date and grant date. Measures prosecution speed and USPTO pendency.</dd>
            </div>
            <div>
              <dt className="font-semibold">Shannon entropy</dt>
              <dd className="text-muted-foreground">-&Sigma; p<sub>i</sub> ln(p<sub>i</sub>) over category shares. Used to measure diversity of technology portfolios, geographic concentration, and topic distributions. Higher values indicate more even distribution.</dd>
            </div>
            <div>
              <dt className="font-semibold">Herfindahl-Hirschman Index (HHI)</dt>
              <dd className="text-muted-foreground">&Sigma; s<sub>i</sub><sup>2</sup> where s<sub>i</sub> is the market (or category) share. Range: 0 (perfect competition) to 10,000 (monopoly). DOJ/FTC 2010 Horizontal Merger Guidelines classify markets as unconcentrated (&lt;1,500), moderately concentrated (1,500&ndash;2,500), or highly concentrated (&gt;2,500).</dd>
            </div>
            <div>
              <dt className="font-semibold">Cohort normalization</dt>
              <dd className="text-muted-foreground">Dividing a patent&apos;s citation count by the mean of its grant-year &times; CPC section cohort. A value of 1.0 means average impact for that cohort; values above 1.0 indicate above-average impact.</dd>
            </div>
            <div>
              <dt className="font-semibold">Blockbuster patent</dt>
              <dd className="text-muted-foreground">A patent in the top 1% of 5-year forward citations within its grant-year &times; CPC section cohort. Under uniform quality, 1% of patents would be blockbusters; rates above 1% indicate disproportionate high-impact output.</dd>
            </div>
          </dl>
        </section>

        {/* 8. Disambiguation Reliability */}
        <section id="disambiguation">
          <h2 className="font-serif text-2xl font-bold pt-4">Disambiguation Reliability</h2>
          <p>
            PatentsView uses machine learning algorithms to disambiguate inventor and assignee
            identities across patent records. This disambiguation is essential for analyses of
            inventor productivity, mobility, and organizational patenting patterns, but it
            introduces potential errors:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li><strong>Splitting errors:</strong> A single inventor may be assigned multiple disambiguated IDs, leading to undercounting of individual productivity.</li>
            <li><strong>Lumping errors:</strong> Two distinct inventors may be assigned the same ID, leading to overcounting of individual productivity.</li>
            <li><strong>Assignee disambiguation:</strong> Corporate name changes, mergers, and subsidiaries create particular challenges. A single entity may appear under multiple names, or distinct entities may be incorrectly merged.</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Chapters that rely heavily on disambiguated identities (inventor rankings, serial vs.
            new inventors, inventor mobility, organizational mechanics) note this limitation in
            their measurement details panel.
          </p>
        </section>

        {/* 9. Data Limitations */}
        <section id="limitations">
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

        {/* 10. Data Source */}
        <section id="data-source">
          <h2 className="font-serif text-2xl font-bold pt-4">Data Source</h2>
          <p>
            All data are derived from{' '}
            <a href="https://patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              PatentsView
            </a>
            , a patent data platform supported by the United States Patent and Trademark Office
            (USPTO). The bulk data files were accessed in <strong>January 2025</strong>. Key tables
            used include:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1 text-sm">
            <li><strong>g_patent:</strong> 9.36 million patent records with grant dates, types, and filing information</li>
            <li><strong>g_cpc_current:</strong> 58 million CPC classification assignments</li>
            <li><strong>g_inventor_disambiguated:</strong> 24 million disambiguated inventor records</li>
            <li><strong>g_us_patent_citation:</strong> 151 million citation relationships</li>
            <li><strong>g_assignee_disambiguated:</strong> 8.7 million assignee records</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Data attribution: PatentsView (
            <a href="https://www.patentsview.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-chart-1">
              www.patentsview.org
            </a>
            ), USPTO. PatentsView is a tool built to increase the usability and transparency of US
            patent data. The database is derived from the USPTO examination and granting of patents.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            For additional details on processing methodology, see the{' '}
            <Link href="/about/#methodology" className="underline underline-offset-2 hover:text-foreground transition-colors">
              About page
            </Link>.
            Disambiguation reliability and data limitations are documented{' '}
            <a href="#disambiguation" className="underline underline-offset-2 hover:text-foreground transition-colors">above</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
