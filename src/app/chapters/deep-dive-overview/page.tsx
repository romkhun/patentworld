'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { PWSparkline } from '@/components/charts/PWSparkline';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { DataNote } from '@/components/chapter/DataNote';
import { CHART_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import Link from 'next/link';
import type {
  Act6DomainSummary,
  Act6TimeSeries,
  Act6QualityPeriod,
  Act6Spillover,
  Act6ContinuationRate,
  Act6DomainFilingVsGrant,
} from '@/lib/types';

const DOMAIN_CHAPTERS: Record<string, { slug: string; title: string }> = {
  '3D Printing':   { slug: '3d-printing', title: '3D Printing & Additive Manufacturing' },
  'AgTech':        { slug: 'agricultural-technology', title: 'Agricultural Technology' },
  'AI':            { slug: 'ai-patents', title: 'Artificial Intelligence' },
  'AV':            { slug: 'autonomous-vehicles', title: 'Autonomous Vehicles & ADAS' },
  'Biotech':       { slug: 'biotechnology', title: 'Biotechnology & Gene Editing' },
  'Blockchain':    { slug: 'blockchain', title: 'Blockchain & Decentralized Systems' },
  'Cyber':         { slug: 'cybersecurity', title: 'Cybersecurity' },
  'DigiHealth':    { slug: 'digital-health', title: 'Digital Health & Medical Devices' },
  'Green':         { slug: 'green-innovation', title: 'Green Innovation' },
  'Quantum':       { slug: 'quantum-computing', title: 'Quantum Computing' },
  'Semiconductor': { slug: 'semiconductors', title: 'Semiconductors' },
  'Space':         { slug: 'space-technology', title: 'Space Technology' },
};

export default function DeepDiveOverview() {
  const { data: comparison, loading: compL } = useChapterData<Act6DomainSummary[]>('act6/act6_comparison.json');
  const { data: timeseries, loading: tsL } = useChapterData<Act6TimeSeries[]>('act6/act6_timeseries.json');
  const { data: quality, loading: qL } = useChapterData<Act6QualityPeriod[]>('act6/act6_quality.json');
  const { data: spillover, loading: spL } = useChapterData<Act6Spillover[]>('act6/act6_spillover.json');
  const { data: continuationRates, loading: crL } = useChapterData<Act6ContinuationRate[]>('act6/act6_continuation_rates.json');
  const { data: filingVsGrant, loading: fgL } = useChapterData<Act6DomainFilingVsGrant[]>('act6/act6_domain_filing_vs_grant.json');

  // Sort domains by total patents for bar chart
  const sortedDomains = useMemo(() => {
    if (!comparison) return [];
    return [...comparison].sort((a, b) => b.total_patents - a.total_patents);
  }, [comparison]);

  // Bar chart data
  const barData = useMemo(() => {
    return sortedDomains.map((d) => ({
      domain: d.domain,
      total_patents: d.total_patents,
    }));
  }, [sortedDomains]);

  // Sparkline data keyed by domain short name (e.g. "AI", "Biotech")
  const domainSparkData = useMemo(() => {
    if (!timeseries) return {} as Record<string, { x: number; y: number }[]>;
    const grouped: Record<string, { x: number; y: number }[]> = {};
    for (const d of timeseries) {
      if (d.year < 1990) continue;
      if (!grouped[d.domain]) grouped[d.domain] = [];
      grouped[d.domain].push({ x: d.year, y: d.count });
    }
    // Sort each domain's data by year
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => a.x - b.x);
    }
    return grouped;
  }, [timeseries]);

  // Small-multiples panels
  const panels = useMemo(() => {
    if (!timeseries) return [];
    const domains = [...new Set(timeseries.map((d) => d.domain))];
    return domains.map((domain) => ({
      name: domain,
      data: timeseries
        .filter((d) => d.domain === domain && d.year >= 1990)
        .map((d) => ({ x: d.year, y: d.count })),
    }));
  }, [timeseries]);

  // Quality comparison (latest period 2020)
  const qualityBar = useMemo(() => {
    if (!quality) return [];
    return quality
      .filter((d) => d.period === 2020)
      .map((d) => ({
        domain: d.domain,
        mean_citations: d.mean_citations,
        mean_claims: d.mean_claims,
        mean_scope: d.mean_scope,
      }))
      .sort((a, b) => b.mean_citations - a.mean_citations);
  }, [quality]);

  // Top spillover pairs for scatter/table
  const topSpillovers = useMemo(() => {
    if (!spillover) return [];
    return [...spillover]
      .filter((d) => d.observed >= 10)
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 30)
      .map((d) => ({
        pair: `${d.domain_a} × ${d.domain_b}`,
        observed: d.observed,
        expected: d.expected,
        lift: d.lift,
        domain_a: d.domain_a,
        domain_b: d.domain_b,
      }));
  }, [spillover]);

  // Continuation rates sorted descending by share
  const continuationBar = useMemo(() => {
    if (!continuationRates) return [];
    return [...continuationRates].sort((a, b) => b.continuation_share_pct - a.continuation_share_pct);
  }, [continuationRates]);

  // Filing-vs-grant small-multiples panels
  const filingGrantPanels = useMemo(() => {
    if (!filingVsGrant) return [];
    const domains = [...new Set(filingVsGrant.map((d) => d.domain))];
    return domains.map((domain) => {
      const filingData = filingVsGrant
        .filter((d) => d.domain === domain && d.series === 'filing_year' && d.year >= 1990)
        .map((d) => ({ x: d.year, y: d.count }));
      const grantData = filingVsGrant
        .filter((d) => d.domain === domain && d.series === 'grant_year' && d.year >= 1990)
        .map((d) => ({ x: d.year, y: d.count, ref: d.count }));
      // Merge into a single array with filing as y and grant as ref
      const years = [...new Set([...filingData.map((d) => d.x), ...grantData.map((d) => d.x)])].sort();
      const filingMap = Object.fromEntries(filingData.map((d) => [d.x, d.y]));
      const grantMap = Object.fromEntries(grantData.map((d) => [d.x, d.y]));
      return {
        name: domain,
        data: years.map((year) => ({
          x: year,
          y: filingMap[year] ?? 0,
          ref: grantMap[year] ?? 0,
        })),
      };
    });
  }, [filingVsGrant]);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
          ACT 6 — Deep Dives
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Cross-Domain Comparison
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A comparative view of twelve technology domains, covering total patent volumes,
          growth trajectories, quality benchmarks, and cross-domain spillover.
        </p>
      </header>

      {/* ── Methods Section ──────────────────────────────────────────────── */}
      <section id="methods" className="mb-12 rounded-lg border bg-card p-6">
        <h2 className="font-serif text-xl font-semibold mb-4">ACT 6 Methods</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The twelve ACT 6 Deep Dive chapters share a common analytical framework. The following
          metrics are used consistently across all domain analyses:
        </p>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold">Four-Firm Concentration Ratio (CR4)</dt>
            <dd className="text-muted-foreground mt-1">
              The combined patent share of the four largest assignees in a given domain-year.
              Higher values indicate greater organizational concentration. CR4 above 40% is
              conventionally considered moderately concentrated; above 60% is highly concentrated.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Shannon Entropy (Technology Diversity)</dt>
            <dd className="text-muted-foreground mt-1">
              Shannon entropy of the subfield distribution within a domain:
              H = −Σ p<sub>i</sub> log₂(p<sub>i</sub>), where p<sub>i</sub> is the share of
              patents in subfield i. Higher entropy indicates greater diversity across subfields.
              A domain with patents evenly split across 8 subfields would have H ≈ 3.0.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Technology Velocity (Entry Cohort Productivity)</dt>
            <dd className="text-muted-foreground mt-1">
              Average annual patents per assignee, computed by entry-decade cohort. Assignees
              are classified by the decade of their first patent in the domain. Higher velocity
              among later cohorts suggests that open-source diffusion or lower barriers to entry
              enable faster innovation.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">International Share</dt>
            <dd className="text-muted-foreground mt-1">
              The percentage of domain patents whose primary inventor is located outside the
              United States. Based on the disambiguated location of the first-listed inventor.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Academic Share</dt>
            <dd className="text-muted-foreground mt-1">
              The percentage of domain patents assigned to universities or research institutions,
              identified via the PatentsView assignee-type classification (types other than
              corporate or individual).
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Domain Index ─────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-semibold mb-4">Domain Chapters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(DOMAIN_CHAPTERS).map(([key, info]) => (
            <Link
              key={key}
              href={`/chapters/${info.slug}`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors flex flex-col gap-1"
            >
              <span>{info.title}</span>
              <PWSparkline data={domainSparkData[key] ?? []} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Figure 1: Patent Volume by Domain ────────────────────────────── */}
      <SectionDivider label="Patent Volume" />

      <ChartContainer
        id="fig-act6-volume"
        title="Green Innovation and Semiconductors Dominate ACT 6 Patent Volumes"
        subtitle="Total utility patents per domain (all years), ordered by volume."
        caption="Green innovation (Y02/Y04S) and semiconductors (H01L/H10) each exceed 400,000 patents. AI, cybersecurity, and digital health form a middle tier at 150,000–260,000. Quantum computing and blockchain remain niche domains."
        loading={compL}
      >
        <PWBarChart
          data={barData}
          xKey="domain"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
          yFormatter={formatCompact}
        />
      </ChartContainer>

      {/* ── Figure 2: Small-Multiples Time Series ────────────────────────── */}
      <ChartContainer
        id="fig-act6-timeseries"
        title="Growth Trajectories Vary Sharply Across Domains"
        subtitle="Annual patent count per domain, 1990–2025. Each panel is independently scaled."
        caption="Semiconductors and biotech show mature, plateau-shaped curves. AI, blockchain, and quantum display exponential recent growth. Green and cyber peaked around 2019–2020 and have since plateaued."
        loading={tsL}
        flexHeight
      >
        <PWSmallMultiples
          panels={panels}
          xLabel="Year"
          yLabel="Patents"
          yFormatter={formatCompact}
          columns={4}
        />
      </ChartContainer>

      <KeyInsight>
        The twelve domains span four orders of magnitude in patent volume — from
        Quantum Computing (3,166 total patents) to Green Innovation (618,404). This
        extreme variation means that concentration metrics (like CR4) must be interpreted
        relative to domain size: a 30% CR4 in quantum computing (where the top four firms
        hold ~1,000 patents total) reflects a fundamentally different competitive landscape
        than the same 30% in semiconductors.
      </KeyInsight>

      {/* ── Figure 3: Quality Comparison ──────────────────────────────────── */}
      <SectionDivider label="Quality Benchmarks" />

      <ChartContainer
        id="fig-act6-quality"
        title="Digital Health Patents Lead in Citation Impact; Quantum Leads in Claims"
        subtitle="Mean forward citations (5-year), claims, and CPC scope for patents granted 2020–2024."
        caption="Quality metrics reveal distinct innovation profiles: digital health patents receive the most citations (5.75 mean), quantum computing patents have the most claims (19.34 mean), and 3D printing patents have the widest technological scope (4.63 mean CPC codes)."
        loading={qL}
      >
        <PWBarChart
          data={qualityBar}
          xKey="domain"
          bars={[
            { key: 'mean_citations', name: 'Mean Citations (5yr)', color: CHART_COLORS[0] },
            { key: 'mean_claims', name: 'Mean Claims', color: CHART_COLORS[1] },
            { key: 'mean_scope', name: 'Mean Scope', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
        />
      </ChartContainer>

      {/* ── Figure 4: Spillover Table ────────────────────────────────────── */}
      <SectionDivider label="Cross-Domain Spillover" />

      <div className="mb-8">
        <h3 className="font-serif text-lg font-semibold mb-2">
          Co-Classification Lift Between Domain Pairs
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Lift = Observed / Expected co-occurrence of CPC codes from two domains on the same
          patent. A lift of 2.0 means patents are twice as likely to carry both domains&apos;
          codes as random chance would predict. Pairs with fewer than 10 co-occurring patents
          are excluded.
        </p>
        {spL ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Domain Pair</th>
                  <th className="px-3 py-2 text-right font-medium">Observed</th>
                  <th className="px-3 py-2 text-right font-medium">Expected</th>
                  <th className="px-3 py-2 text-right font-medium">Lift</th>
                </tr>
              </thead>
              <tbody>
                {topSpillovers.map((row) => (
                  <tr key={row.pair} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-1.5">{row.pair}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{row.observed.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{row.expected.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-medium">
                      {row.lift.toFixed(2)}×
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <KeyInsight>
        The highest spillover lifts appear between technologically adjacent domains.
        Cyber × Blockchain, AI × Quantum, and AI × AV exhibit lifts well above
        1.0, indicating that inventors working in one domain are disproportionately likely
        to also file patents in the related domain. Green innovation shows broad but low-lift
        connections across many domains, consistent with its role as a cross-cutting
        classification applied alongside primary technology codes.
      </KeyInsight>

      {/* ── Figure 5: Continuation Rates by Domain ──────────────────────── */}
      <SectionDivider label="Continuation Filing Rates" />

      <ChartContainer
        id="fig-act6-continuation-rates"
        title="Biotech Leads Domain Continuation Filing at 48.9% — Nearly Double the AgTech Rate of 25.2%"
        subtitle="Share of patents with continuation, division, or CIP related filings by domain"
        caption="Continuation filing rates vary substantially across domains. Biotechnology's 48.9% rate reflects the regulatory complexity and long development timelines of life sciences patents, where continuation filings are used to extend protection across related claims. Agricultural technology's 25.2% rate is the lowest, consistent with more straightforward patent protection strategies in precision agriculture."
        loading={crL}
      >
        <PWBarChart
          data={continuationBar}
          xKey="domain"
          bars={[{ key: 'continuation_share_pct', name: 'Continuation Share (%)', color: CHART_COLORS[3] }]}
          layout="vertical"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        Continuation filing rates reveal fundamental differences in patent strategy across technology
        domains. Biotechnology (48.9%), digital health (44.3%), and blockchain (40.0%) exhibit the
        highest continuation rates, reflecting the need for layered patent protection in fields with
        long development timelines, evolving regulatory landscapes, or rapidly shifting technology
        standards. At the other end, agricultural technology (25.2%) and 3D printing (28.5%) show
        lower rates, suggesting more straightforward paths from invention to commercialization.
      </KeyInsight>

      {/* ── Figure 6: Filing vs Grant Trends by Domain ──────────────────── */}
      <SectionDivider label="Filing versus Grant Timelines" />

      <ChartContainer
        id="fig-act6-filing-vs-grant"
        title="Filing-to-Grant Lag Varies Across Domains, With AI and Green Showing the Widest Gaps"
        subtitle="Annual patent filings (solid) versus grants (dashed) per domain, 1990–2025. Each panel is independently scaled."
        caption="The gap between filing and grant curves reflects patent examination backlogs and processing times. AI and green innovation show substantial filing-grant lags during peak growth years (2015–2020), while mature domains like semiconductors show tighter alignment. Blockchain's filing decline after 2019 is visible before the grant peak, indicating a multi-year pipeline of pending applications."
        loading={fgL}
        flexHeight
      >
        <PWSmallMultiples
          panels={filingGrantPanels}
          xLabel="Year"
          yLabel="Patents"
          yFormatter={formatCompact}
          columns={4}
          referenceLabel="Grants (dashed) versus Filings (solid)"
        />
      </ChartContainer>

      <KeyInsight>
        The filing-versus-grant comparison reveals important temporal dynamics in technology
        patenting. In rapidly growing domains like AI and cybersecurity, filing curves peak
        years before grant curves, creating a substantial pipeline of pending applications.
        This lag means that patent statistics based solely on grant year may understate the
        true pace of innovation during boom periods and overstate it during slowdowns. Blockchain
        is particularly notable: filings peaked around 2019 and declined sharply, but grants
        continued climbing through 2022, reflecting the multi-year examination pipeline.
      </KeyInsight>

      {/* ── Data Note ────────────────────────────────────────────────────── */}
      <DataNote>
        <p>
          All domain definitions use CPC (Cooperative Patent Classification) codes as defined in
          the individual deep-dive chapters. Patent counts use grant year from PatentsView. Quality
          metrics are computed from <code>patent_master.parquet</code>, which joins g_patent,
          g_cpc_current, g_inventor_disambiguated, g_assignee_disambiguated, and g_us_patent_citation.
          Forward citations use a 5-year window from grant date. Spillover lift is computed as
          observed co-classification divided by expected co-classification under independence
          (product of marginal domain shares). Source: PatentsView / USPTO (1976–2025).
        </p>
      </DataNote>
    </article>
  );
}
