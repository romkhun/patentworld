import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: 'Data Dictionary & Methodology',
  description: 'PatentWorld methodology: patent universe definitions, temporal coverage (1976-2025), geography basis, CPC field classification, metric definitions (originality, generality, HHI, exploration composite, green patents, AI patents), data processing, disambiguation, and limitations.',
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
  { id: 'data-processing', label: 'Data Processing' },
  { id: 'definitions', label: 'Metric Definitions' },
  { id: 'disambiguation', label: 'Disambiguation' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'terminology', label: 'Terminology' },
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
  {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: 'PatentWorld Data Catalog',
    description:
      'Analytical datasets derived from USPTO PatentsView bulk data, covering 9.36 million US patents (1976-2025).',
    url: `${BASE_URL}/methodology/`,
    provider: {
      '@type': 'Organization',
      name: 'USPTO PatentsView',
      url: 'https://patentsview.org',
    },
    dataset: {
      '@type': 'Dataset',
      name: 'US Patent Data (1976-2025)',
      description:
        'Analysis of 9.36 million US patents from PatentsView, covering technology classifications, inventor demographics, geographic distribution, citation networks, and patent quality indicators.',
      temporalCoverage: '1976/2025',
      spatialCoverage: 'United States',
      variableMeasured: [
        'Patent grants per year',
        'Technology classifications (CPC, WIPO)',
        'Inventor demographics and collaboration',
        'Geographic distribution',
        'Citation networks and patent quality',
        'Team composition',
        'Organizational portfolios',
      ],
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${BASE_URL}/data/`,
      },
    },
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

        {/* ── 1. Patent Universe ────────────────────────────────────────────── */}
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

        {/* ── 2. Temporal Coverage ──────────────────────────────────────────── */}
        <section id="temporal-coverage">
          <h2 className="font-serif text-2xl font-bold pt-4">Temporal Coverage</h2>
          <p>
            The dataset spans <strong>January 1976 through September 2025</strong>. The start date
            corresponds to the earliest systematically available digital patent records in the
            PatentsView database. All time-series analyses use <strong>grant year</strong> unless
            otherwise noted.
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
            subject to right-truncation bias because many applications filed after 2022 remain pending
            and have not yet been granted. Chapters that use filing-year data note this limitation.
          </p>
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-semibold">Grant year vs. filing year</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Grant year:</strong> The year the USPTO issued the patent. Default time axis throughout PatentWorld.</li>
              <li><strong>Filing year:</strong> The year the earliest US application was filed. Typically 2&ndash;3 years before grant. Subject to right-truncation for recent years.</li>
              <li><strong>Implication:</strong> Trends by filing year lead grant-year trends by the average pendency period. Filing-year counts for 2023&ndash;2025 are incomplete.</li>
            </ul>
          </div>
        </section>

        {/* ── 3. Geography Basis ────────────────────────────────────────────── */}
        <section id="geography">
          <h2 className="font-serif text-2xl font-bold pt-4">Geography Basis</h2>
          <p>
            Geographic analyses use two distinct bases, depending on the chapter and research question:
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Inventor country</dt>
              <dd className="text-muted-foreground mt-1">
                The country of residence of the patent&apos;s inventor(s), as recorded in PatentsView&apos;s
                disambiguated inventor-location data. This basis captures <em>where inventive
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

          <h3 className="font-serif text-lg font-semibold mt-6">Counting Methods</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Fractional counting</dt>
              <dd className="text-muted-foreground">When a patent has multiple inventors in different countries, each country receives equal fractional credit (1/<em>n</em> for <em>n</em> countries). Used for geographic analyses of inventor location.</dd>
            </div>
            <div>
              <dt className="font-semibold">Whole counting</dt>
              <dd className="text-muted-foreground">Each country with at least one inventor on a patent receives full credit (count of 1). Used when measuring co-invention and international collaboration, where the focus is on participation rather than proportional attribution.</dd>
            </div>
          </dl>
        </section>

        {/* ── 4. Field Classification ──────────────────────────────────────── */}
        <section id="field-classification">
          <h2 className="font-serif text-2xl font-bold pt-4">Field Classification</h2>
          <p>
            PatentWorld uses several complementary approaches to classify patents by technology area:
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">CPC Sections</h3>
          <p>
            The Cooperative Patent Classification (CPC) system is a hierarchical classification jointly
            managed by the USPTO and the European Patent Office (EPO). PatentWorld uses CPC section
            as the primary technology grouping throughout Acts 1&ndash;5. The CPC was formally
            introduced in 2013; historical patents were retrospectively reclassified.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold">Section</th>
                  <th className="text-left py-2 px-3 font-semibold">Name</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Example Subclasses</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">A</td><td className="py-1.5 px-3">Human Necessities</td><td className="py-1.5 px-3">Agriculture, food, health, sports</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">B</td><td className="py-1.5 px-3">Performing Operations; Transporting</td><td className="py-1.5 px-3">Shaping, printing, vehicles, nano-tech</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">C</td><td className="py-1.5 px-3">Chemistry; Metallurgy</td><td className="py-1.5 px-3">Organic chemistry, materials, biotech</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">D</td><td className="py-1.5 px-3">Textiles; Paper</td><td className="py-1.5 px-3">Yarns, weaving, papermaking</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">E</td><td className="py-1.5 px-3">Fixed Constructions</td><td className="py-1.5 px-3">Buildings, earth drilling, mining</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">F</td><td className="py-1.5 px-3">Mechanical Engineering; Lighting; Heating; Weapons</td><td className="py-1.5 px-3">Engines, pumps, ventilation</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">G</td><td className="py-1.5 px-3">Physics</td><td className="py-1.5 px-3">Instruments, computing, optics, nuclear</td></tr>
                <tr className="border-b border-border/50"><td className="py-1.5 px-3 font-medium text-foreground">H</td><td className="py-1.5 px-3">Electricity</td><td className="py-1.5 px-3">Semiconductors, circuits, communications</td></tr>
                <tr><td className="py-1.5 px-3 font-medium text-foreground">Y</td><td className="py-1.5 px-3">Cross-Sectional Technologies</td><td className="py-1.5 px-3">Y02 (climate tech), Y04S (smart grids), Y10S/Y10T (legacy)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Section Y is a tagging section applied alongside primary A&ndash;H classifications. Y02 and
            Y04S codes are used to identify green patents. Because Y codes are secondary tags, they
            are excluded from multi-section convergence analyses to avoid double-counting.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">WIPO Technology Sectors</h3>
          <p className="text-sm text-muted-foreground">
            The World Intellectual Property Organization (WIPO) groups patents into 35 technology fields
            across 5 sectors: Electrical Engineering, Instruments, Chemistry, Mechanical Engineering,
            and Other Fields. PatentWorld uses WIPO sectors primarily in the{' '}
            <Link href="/chapters/inv-gender/" className="underline underline-offset-2 hover:text-foreground transition-colors">gender</Link> and{' '}
            <Link href="/chapters/inv-generalist-specialist/" className="underline underline-offset-2 hover:text-foreground transition-colors">generalist-specialist</Link> chapters.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">NMF Topic Model</h3>
          <p>
            The{' '}
            <Link href="/chapters/system-language/" className="underline underline-offset-2 hover:text-foreground transition-colors">Language of Innovation</Link> chapter
            applies Non-Negative Matrix Factorization (NMF) topic modeling to 8.45 million patent
            abstracts to discover 25 data-driven technology themes. Unlike CPC, which relies on
            examiner-assigned codes, the NMF topic model extracts thematic structure directly from
            patent text using TF-IDF vectorization followed by matrix decomposition.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Act 6 Domain Definitions</h3>
          <p>
            Act 6 deep-dive chapters define domain-specific patent universes using curated sets
            of CPC subclasses. The specific codes used are documented in each chapter&apos;s
            measurement details panel. Two domains are defined here because they appear across
            multiple chapters:
          </p>
          <dl className="mt-3 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Green patents</dt>
              <dd className="text-muted-foreground mt-1">
                Patents classified under CPC codes <strong>Y02</strong> (technologies for climate
                change mitigation) or <strong>Y04S</strong> (smart grids). Sub-categories: Y02E
                (energy generation), Y02T (transportation/EVs), Y02C (carbon capture), Y02B
                (buildings), Y02P (industrial production), Y02W (waste management). See the{' '}
                <Link href="/chapters/green-innovation/" className="underline underline-offset-2 hover:text-foreground transition-colors">green innovation</Link> chapter.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">AI patents</dt>
              <dd className="text-muted-foreground mt-1">
                Patents classified under CPC subclass <strong>G06N</strong> (computing arrangements
                based on specific computational models, including neural networks, genetic algorithms,
                and knowledge-based systems) plus additional AI-related codes: G06F18 (pattern
                recognition), G06V (image/video recognition), G10L15 (speech recognition), and
                G06F40 (natural language processing). See the{' '}
                <Link href="/chapters/ai-patents/" className="underline underline-offset-2 hover:text-foreground transition-colors">AI patents</Link> chapter.
              </dd>
            </div>
          </dl>
        </section>

        {/* ── 5. Data Processing ───────────────────────────────────────────── */}
        <section id="data-processing">
          <h2 className="font-serif text-2xl font-bold pt-4">Data Processing</h2>
          <p>
            Raw data were obtained as tab-separated value (TSV) files from PatentsView&apos;s
            bulk data downloads. These files were processed using DuckDB, an analytical SQL
            database engine, and Polars (Python) to compute aggregated statistics for each
            visualization. The analysis encompasses all USPTO-granted patents from January 1976
            through September 2025.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Processing Pipeline</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Joining patent records with inventor, assignee, location, and classification tables</li>
            <li>Aggregating by year, technology category, geography, and organization</li>
            <li>Computing derived metrics: citation counts, team sizes, concentration ratios, diversity indices</li>
            <li>Filtering to <strong>primary classifications</strong> (CPC sequence = 0) to avoid double-counting patents that are assigned to multiple CPC codes</li>
            <li>Exporting pre-computed JSON files for each visualization (no backend server; all data are static)</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-6">Counting Conventions</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Primary classification (sequence = 0)</dt>
              <dd className="text-muted-foreground">Each patent is assigned multiple CPC codes. The code with sequence = 0 is the examiner-designated primary classification. PatentWorld uses the primary classification for technology-field analyses to avoid counting a single patent multiple times across sections.</dd>
            </div>
            <div>
              <dt className="font-semibold">Filing route</dt>
              <dd className="text-muted-foreground">Patents are classified by prosecution path: <em>domestic</em> (filed directly at the USPTO by US applicants), <em>PCT</em> (filed via the Patent Cooperation Treaty and entering the US national phase), or <em>direct foreign</em> (filed directly at the USPTO by foreign applicants without using the PCT). The{' '}
                <Link href="/chapters/org-composition/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational composition</Link> chapter analyzes trends by filing route.</dd>
            </div>
            <div>
              <dt className="font-semibold">Gender inference</dt>
              <dd className="text-muted-foreground">Inventor gender is inferred from first names using PatentsView&apos;s gender_code field (M/F). This name-based inference does not capture non-binary identities and may misclassify individuals whose names are ambiguous or culturally variable.</dd>
            </div>
          </dl>
        </section>

        {/* ── 6. Metric Definitions ────────────────────────────────────────── */}
        <section id="definitions">
          <h2 className="font-serif text-2xl font-bold pt-4">Metric Definitions</h2>
          <p>
            The following metrics are used throughout PatentWorld. Definitions are standardized
            across chapters to enable cross-chapter comparisons. Metrics are grouped by category.
          </p>

          {/* ─── 6a. Citation Metrics ─── */}
          <h3 className="font-serif text-lg font-semibold mt-6">Citation Metrics</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Forward citations (5-year)</dt>
              <dd className="text-muted-foreground">Number of subsequent patents citing a given patent within 5 years of grant. The 5-year window is standard in the patent analytics literature as a balance between measurement completeness and recency. Subject to truncation bias for patents granted after 2020, which have not yet accumulated a full 5-year citation window.</dd>
            </div>
            <div>
              <dt className="font-semibold">Backward citations</dt>
              <dd className="text-muted-foreground">Number of prior patents cited by a given patent. Reflects the extent to which the invention builds on existing prior art. Higher counts may indicate more incremental innovation or more thorough prosecution.</dd>
            </div>
            <div>
              <dt className="font-semibold">Self-citation rate</dt>
              <dd className="text-muted-foreground">Fraction of a patent&apos;s backward citations directed to patents held by the same assignee. Higher values indicate greater internal knowledge reuse. In multi-assignee contexts, a citation is counted as a self-citation if any assignee on the citing patent matches any assignee on the cited patent.</dd>
            </div>
            <div>
              <dt className="font-semibold">Non-patent literature (NPL) citations</dt>
              <dd className="text-muted-foreground">Citations to academic papers, technical standards, and other non-patent sources. Higher NPL citation rates indicate stronger ties to scientific research, and are particularly prevalent in biotechnology and pharmaceutical patents.</dd>
            </div>
            <div>
              <dt className="font-semibold">Cohort normalization</dt>
              <dd className="text-muted-foreground">A patent&apos;s citation count divided by the mean citation count of all patents in the same grant-year &times; CPC section cohort. A value of 1.0 indicates average impact for that cohort; values above 1.0 indicate above-average impact. Cohort normalization controls for both temporal and field-specific citation patterns.</dd>
            </div>
            <div>
              <dt className="font-semibold">Citation half-life</dt>
              <dd className="text-muted-foreground">The time it takes for a patent (or a firm&apos;s patent portfolio) to accumulate half of its total forward citations. Shorter half-lives indicate more immediately impactful inventions; longer half-lives suggest foundational work whose influence emerges gradually.</dd>
            </div>
          </dl>

          {/* ─── 6b. Quality & Scope Metrics ─── */}
          <h3 className="font-serif text-lg font-semibold mt-6">Quality &amp; Scope</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Claims per patent</dt>
              <dd className="text-muted-foreground">Total number of independent and dependent claims in a patent. Measures the scope of legal protection sought. Higher claim counts generally indicate broader or more detailed protection.</dd>
            </div>
            <div>
              <dt className="font-semibold">Patent scope</dt>
              <dd className="text-muted-foreground">Number of distinct CPC subclasses assigned to each patent. Measures the technological breadth of the invention. A patent classified under many subclasses spans a wider range of technical applications.</dd>
            </div>
            <div>
              <dt className="font-semibold">Grant lag (pendency)</dt>
              <dd className="text-muted-foreground">Number of days between patent application filing date and grant date. Measures prosecution speed at the USPTO. Grant lag varies substantially by technology area, with software and biotechnology patents typically taking longer than mechanical inventions.</dd>
            </div>
            <div>
              <dt className="font-semibold">Team size</dt>
              <dd className="text-muted-foreground">Number of disambiguated inventors listed on a patent. Used to measure the collaborative intensity of inventive activity. Average team size has increased from approximately 1.8 inventors per patent in 1976 to 3.2 in 2024.</dd>
            </div>
            <div>
              <dt className="font-semibold">Blockbuster patent</dt>
              <dd className="text-muted-foreground">A patent in the top 1% of 5-year forward citations within its grant-year &times; CPC section cohort. Under uniform quality, 1% of patents in any group would be blockbusters; rates above 1% indicate disproportionate high-impact output.</dd>
            </div>
            <div>
              <dt className="font-semibold">Sleeping beauty patent</dt>
              <dd className="text-muted-foreground">A patent that receives few or no citations for an extended period after grant before experiencing a sudden surge of recognition. Identified using citation time-profile analysis: a patent qualifies if its early citation accumulation rate is significantly below its eventual steady-state rate, followed by an acceleration that brings cumulative citations well above the cohort average. Relevant in the{' '}
                <Link href="/chapters/system-patent-quality/" className="underline underline-offset-2 hover:text-foreground transition-colors">patent quality</Link> and{' '}
                <Link href="/chapters/org-patent-quality/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational patent quality</Link> chapters.</dd>
            </div>
          </dl>

          {/* ─── 6c. Diversity & Concentration ─── */}
          <h3 className="font-serif text-lg font-semibold mt-6">Diversity &amp; Concentration</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Originality</dt>
              <dd className="text-muted-foreground">Measures the breadth of a patent&apos;s backward citations across CPC sections. Computed as 1 minus the Herfindahl-Hirschman Index of the CPC section distribution among backward citations:</dd>
              <dd className="mt-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm">
                Originality = 1 &minus; &Sigma; s<sub>i</sub><sup>2</sup>
              </dd>
              <dd className="mt-2 text-muted-foreground">where s<sub>i</sub> is the share of backward citations in CPC section <em>i</em>. Range: 0 (all citations from one section) to ~1 (citations spread evenly across sections). Higher values indicate the patent synthesizes knowledge from more diverse technological domains. Note: PatentWorld computes these indices over CPC sections (8 categories), which compresses the range relative to the finer-grained NBER technology subcategories (~36 categories) used in Trajtenberg, Henderson, and Jaffe (1997). The Hall, Jaffe, and Trajtenberg (2001) small-sample correction is not applied, which may introduce upward bias for patents with very few citations.</dd>
            </div>
            <div>
              <dt className="font-semibold">Generality</dt>
              <dd className="text-muted-foreground">Measures how broadly a patent is cited across CPC sections. Computed identically to originality but using <em>forward</em> citations instead of backward citations. Range: 0 (all citing patents in one section) to ~1 (cited across many sections). Higher values indicate wider downstream influence. The same caveats regarding CPC section granularity and the absence of small-sample correction apply.</dd>
            </div>
            <div>
              <dt className="font-semibold">Herfindahl-Hirschman Index (HHI)</dt>
              <dd className="text-muted-foreground">A measure of concentration computed as:</dd>
              <dd className="mt-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm">
                HHI = &Sigma; s<sub>i</sub><sup>2</sup> &times; 10,000
              </dd>
              <dd className="mt-2 text-muted-foreground">where s<sub>i</sub> is the market share (or category share) of entity <em>i</em>, expressed as a decimal. The index ranges from near 0 (highly fragmented) to 10,000 (monopoly). The US DOJ/FTC (2010 Horizontal Merger Guidelines) classify markets as unconcentrated (&lt;1,500), moderately concentrated (1,500&ndash;2,500), or highly concentrated (&gt;2,500). In PatentWorld, HHI is used to measure assignee concentration within technology fields and geographic regions.</dd>
            </div>
            <div>
              <dt className="font-semibold">Shannon entropy</dt>
              <dd className="text-muted-foreground">H = &minus;&Sigma; p<sub>i</sub> log(p<sub>i</sub>) over category shares, where the logarithm base determines the unit. PatentWorld uses log<sub>2</sub> (bits) for topic modeling and inventor specialization analyses, and natural log (nats) for CPC portfolio diversity. Higher values indicate more even distribution across categories. The absolute value depends on both the number of categories and the log base used, so entropy values from different analyses are not directly comparable without normalization.</dd>
            </div>
            <div>
              <dt className="font-semibold">Gini coefficient</dt>
              <dd className="text-muted-foreground">A measure of statistical dispersion ranging from 0 (perfect equality) to 1 (maximum inequality). In PatentWorld, used to measure concentration of citations across patents (via Lorenz curves) and quality distribution within technology fields and organizations. Values above 0.8 indicate high concentration.</dd>
            </div>
            <div>
              <dt className="font-semibold">Concentration ratios (CR4, CR10)</dt>
              <dd className="text-muted-foreground">CR4 is the combined patent share of the four largest organizations in a domain; CR10 is the share of the ten largest. Used in Act 6 deep-dive chapters to measure organizational concentration within technology domains. Higher values indicate a more concentrated competitive landscape.</dd>
            </div>
          </dl>

          {/* ─── 6d. Innovation Strategy Metrics ─── */}
          <h3 className="font-serif text-lg font-semibold mt-6">Innovation Strategy</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Exploration composite</dt>
              <dd className="text-muted-foreground">Measures the degree to which a patent represents exploratory (as opposed to exploitative) innovation. Equally weighted average of three normalized sub-scores:</dd>
              <dd>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Technology newness:</strong> Whether the patent uses CPC subclasses that are new to the assignee&apos;s historical portfolio.</li>
                  <li><strong>Citation newness:</strong> Whether the patent cites prior art not previously cited by the assignee&apos;s other patents.</li>
                  <li><strong>External sourcing:</strong> Whether the patent&apos;s backward citations come predominantly from patents held by other organizations rather than the assignee&apos;s own prior patents.</li>
                </ul>
              </dd>
              <dd className="mt-2 text-muted-foreground">Each sub-score is normalized to a 0&ndash;1 scale. Patents scoring above <strong>0.6</strong> are classified as <em>exploratory</em>; those below 0.6 as <em>exploitative</em>. Used in the{' '}
                <Link href="/chapters/mech-organizations/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational mechanics</Link> chapter and Act 6 deep dives.</dd>
            </div>
            <div>
              <dt className="font-semibold">Ambidexterity index</dt>
              <dd className="text-muted-foreground">Measures an organization&apos;s balance between exploration and exploitation. Computed as 1 minus the absolute deviation of the exploration share from 50%. Values near 1.0 indicate a balanced firm that pursues both exploratory and exploitative innovation in roughly equal measure; values near 0 indicate a specialist firm focused predominantly on one strategy. Used in the{' '}
                <Link href="/chapters/mech-organizations/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational mechanics</Link> chapter.</dd>
            </div>
            <div>
              <dt className="font-semibold">Inventor mobility (talent flow)</dt>
              <dd className="text-muted-foreground">The movement of inventors between organizations, tracked by consecutive patent filings with different assignees. Net talent flow reveals which organizations are gaining versus losing inventive talent. A positive net flow indicates a firm is attracting more inventors than it is losing. Used in the{' '}
                <Link href="/chapters/mech-inventors/" className="underline underline-offset-2 hover:text-foreground transition-colors">inventor mechanics</Link> chapter.</dd>
            </div>
            <div>
              <dt className="font-semibold">Generalist vs. specialist inventors</dt>
              <dd className="text-muted-foreground">Inventors are classified based on the technological diversity of their patent portfolios. Generalists hold patents spanning multiple CPC sections; specialists concentrate in one or few sections. The{' '}
                <Link href="/chapters/inv-generalist-specialist/" className="underline underline-offset-2 hover:text-foreground transition-colors">generalist-specialist</Link> chapter measures this using entropy-based diversity scores across each inventor&apos;s CPC section distribution.</dd>
            </div>
          </dl>

          {/* ─── 6e. Standard Quality Metrics Suite ─── */}
          <h3 className="font-serif text-lg font-semibold mt-6">Standard Quality Metrics Suite</h3>
          <p className="text-sm text-muted-foreground">
            Chapters across multiple acts present a consistent set of seven patent quality metrics,
            computed for different grouping variables (by technology field, by assignee, by inventor
            category, by geography). These are: <strong>patent count</strong>, <strong>claims per patent</strong>,{' '}
            <strong>patent scope</strong>, <strong>forward citations</strong>, <strong>backward citations</strong>,{' '}
            <strong>self-citation rate</strong>, and <strong>grant lag</strong>. Each is defined individually above.
            When these seven metrics appear together, they enable direct cross-chapter comparisons
            of patent quality across different analytical dimensions.
          </p>
        </section>

        {/* ── 7. Disambiguation Reliability ──────────────────────────────── */}
        <section id="disambiguation">
          <h2 className="font-serif text-2xl font-bold pt-4">Disambiguation Reliability</h2>
          <p>
            PatentsView uses machine learning algorithms to disambiguate inventor and assignee
            identities across patent records. This disambiguation is essential for analyses of
            inventor productivity, mobility, and organizational patenting patterns, but it
            introduces potential errors:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li><strong>Splitting errors:</strong> A single inventor is assigned multiple disambiguated IDs, leading to <em>undercounting</em> of individual productivity. Most likely for inventors who change institutions or name spellings.</li>
            <li><strong>Lumping errors:</strong> Two distinct inventors are assigned the same ID, leading to <em>overcounting</em> of individual productivity. Most likely for inventors with common names.</li>
            <li><strong>Assignee disambiguation:</strong> Corporate name changes, mergers, and subsidiaries create particular challenges. A single entity may appear under multiple names, or distinct entities may be incorrectly merged.</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Chapters that rely heavily on disambiguated identities &mdash; including{' '}
            <Link href="/chapters/inv-top-inventors/" className="underline underline-offset-2 hover:text-foreground transition-colors">top inventors</Link>,{' '}
            <Link href="/chapters/inv-serial-new/" className="underline underline-offset-2 hover:text-foreground transition-colors">serial vs. new inventors</Link>,{' '}
            <Link href="/chapters/mech-inventors/" className="underline underline-offset-2 hover:text-foreground transition-colors">inventor mechanics</Link>, and{' '}
            <Link href="/chapters/mech-organizations/" className="underline underline-offset-2 hover:text-foreground transition-colors">organizational mechanics</Link> &mdash;
            note this limitation in their measurement details panel.
          </p>
        </section>

        {/* ── 8. Data Limitations ────────────────────────────────────────── */}
        <section id="limitations">
          <h2 className="font-serif text-2xl font-bold pt-4">Data Limitations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Granted patents only:</strong> The dataset includes only granted patents, not applications that were abandoned or rejected. This introduces survivorship bias &mdash; the analysis cannot measure inventive activity that does not result in a grant.</li>
            <li><strong>US patents only:</strong> The analysis covers patents granted by the USPTO. It does not include patents filed only at foreign patent offices (EPO, JPO, CNIPA, KIPO, etc.). Firms that patent primarily abroad may appear to have lower patent output in this dataset than their true inventive activity warrants.</li>
            <li><strong>Citation truncation:</strong> Recently granted patents have had less time to accumulate forward citations, creating a right-truncation bias in citation-based metrics. Five-year forward citation counts are unreliable for patents granted after 2020. Cohort normalization mitigates but does not eliminate this bias.</li>
            <li><strong>Inventor disambiguation:</strong> PatentsView uses algorithmic disambiguation to link inventor records across patents. Some errors in matching (lumping) or splitting inventor identities may exist. See <a href="#disambiguation" className="underline underline-offset-2 hover:text-foreground transition-colors">Disambiguation Reliability</a> above.</li>
            <li><strong>Classification changes:</strong> The CPC system was introduced in 2013, replacing the earlier USPC system. Historical patents were retrospectively reclassified, but some inconsistencies may remain, particularly for patents from the 1970s&ndash;1980s.</li>
            <li><strong>Gender inference:</strong> Inventor gender is inferred from first names and may not reflect actual gender identity. Non-binary identities are not captured. Accuracy varies by cultural context and name ambiguity.</li>
            <li><strong>Partial year (2025):</strong> Data for 2025 covers grants through September only. Annual totals and rates for 2025 are not directly comparable to full-year figures without adjustment.</li>
            <li><strong>Assignee coverage:</strong> Not all patents have assignee records in PatentsView. Unassigned patents are excluded from organizational analyses, which may undercount individual inventor and small-entity patenting.</li>
          </ul>
        </section>

        {/* ── 8b. Terminology Conventions ─────────────────────────────── */}
        <section id="terminology">
          <h2 className="font-serif text-2xl font-bold pt-4">Terminology Conventions</h2>
          <p>
            PatentWorld uses certain terms interchangeably in narrative text; this section
            defines each term precisely to avoid ambiguity.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-6">Entity Terms</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Assignee / organization / firm / company</dt>
              <dd className="text-muted-foreground"><strong>Assignee</strong> is used in technical and data-processing contexts (the entity recorded in PatentsView&apos;s assignee table). <strong>Organization</strong> is the broadest term, encompassing corporations, universities, and government agencies. <strong>Firm</strong> and <strong>company</strong> are used when the discussion is restricted to corporate assignees.</dd>
            </div>
            <div>
              <dt className="font-semibold">Patent / grant / filing</dt>
              <dd className="text-muted-foreground"><strong>Patent</strong> refers to a granted patent in most contexts. <strong>Grant</strong> emphasizes the issued status (vs. pending application). <strong>Filing</strong> refers to the application stage or, in country-of-origin analyses, to patents originating from a specific jurisdiction.</dd>
            </div>
          </dl>

          <h3 className="font-serif text-lg font-semibold mt-6">Technology Taxonomy</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Domain / field / class / subclass</dt>
              <dd className="text-muted-foreground"><strong>Domain</strong> refers to a broad technology area (e.g., &ldquo;AI,&rdquo; &ldquo;green innovation&rdquo;) typically defined by a curated set of CPC codes. <strong>Field</strong> is used for WIPO technology fields (35 categories). <strong>Section</strong> refers to CPC top-level sections (A&ndash;H, Y). <strong>Class</strong> and <strong>subclass</strong> refer to progressively finer levels of the CPC hierarchy (e.g., G06 is a class; G06N is a subclass). There are 8 CPC sections, approximately 130 classes, and approximately 670 subclasses in active use.</dd>
            </div>
            <div>
              <dt className="font-semibold">Patent share vs. market share</dt>
              <dd className="text-muted-foreground"><strong>Patent share</strong> (preferred) refers to the fraction of patents held by an entity or group within a defined universe. PatentWorld avoids the term &ldquo;market share&rdquo; in the patent context because patents represent inventive output rather than product-market revenue.</dd>
            </div>
          </dl>
        </section>

        {/* ── 9. Data Source ─────────────────────────────────────────────── */}
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
            <li><strong>g_location_disambiguated:</strong> Geocoded inventor and assignee locations</li>
            <li><strong>g_gov_interest:</strong> Government interest statements identifying federally funded research</li>
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
            For information about the author, chapter structure, and frequently asked questions, see
            the{' '}
            <Link href="/about/" className="underline underline-offset-2 hover:text-foreground transition-colors">
              About page
            </Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
