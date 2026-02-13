export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h1 className="font-serif text-4xl font-bold tracking-tight">About PatentWorld</h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <p>
          PatentWorld is an interactive data exploration project that visualizes 50 years
          of American innovation through patent data. Our goal is to make the rich,
          complex world of patents accessible and engaging through data-driven storytelling.
        </p>

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
          <li>9.36 million granted patents (1976-2025)</li>
          <li>Disambiguated inventor and assignee identities</li>
          <li>Cooperative Patent Classification (CPC) technology categories</li>
          <li>WIPO technology field classifications</li>
          <li>Geographic location data for inventors</li>
          <li>Patent citation networks</li>
          <li>Government interest statements</li>
        </ul>

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

        <h2 className="font-serif text-2xl font-bold pt-4">Technology</h2>
        <p>
          The website is built with Next.js 14 and uses Recharts for interactive
          visualizations. All data is pre-computed and served as static JSON files,
          requiring no backend server. The design uses Tailwind CSS with dark/light
          theme support.
        </p>

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
      </div>
    </div>
  );
}
