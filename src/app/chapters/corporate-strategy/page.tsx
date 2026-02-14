'use client';

import { useEffect, useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const PWSankeyDiagram = dynamic(() => import('@/components/charts/PWSankeyDiagram').then(m => ({ default: m.PWSankeyDiagram })), { ssr: false, loading: () => <div /> });
import { PWRadarChart } from '@/components/charts/PWRadarChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWScatterChart } from '@/components/charts/PWScatterChart';

import { CHART_COLORS, BUMP_COLORS, INDUSTRY_COLORS } from '@/lib/colors';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type { TalentFlowData, PortfolioOverlapPoint, StrategyProfile, CorporateSpeed } from '@/lib/types';

export default function Chapter26() {
  const { data: talentFlows, loading: tfL } = useChapterData<TalentFlowData>('company/talent_flows.json');
  const { data: portfolioOverlap, loading: poL } = useChapterData<PortfolioOverlapPoint[]>('company/portfolio_overlap.json');
  const { data: strategyProfiles, loading: spL } = useChapterData<StrategyProfile[]>('company/strategy_profiles.json');
  const { data: corpSpeed, loading: csL } = useChapterData<CorporateSpeed[]>('company/corporate_speed.json');

  const [radarCompanies, setRadarCompanies] = useState<string[]>([]);
  const [strategyViewMode, setStrategyViewMode] = useState<'radar' | 'bar'>('radar');

  // Build radar chart data from strategy profiles
  const radarData = useMemo((): { dimension: string; [company: string]: number | string }[] => {
    if (!strategyProfiles || radarCompanies.length === 0) return [];
    const dimensions = ['breadth', 'depth', 'defensiveness', 'influence', 'science_intensity', 'speed', 'collaboration', 'freshness'];
    return dimensions.map(dim => {
      const row: { dimension: string; [company: string]: number | string } = { dimension: dim.replace('_', ' ') };
      radarCompanies.forEach(c => {
        const profile = strategyProfiles.find(p => p.company === c);
        if (profile) row[c] = profile[dim as keyof StrategyProfile] as number;
      });
      return row;
    });
  }, [strategyProfiles, radarCompanies]);

  // Bar chart data for strategy profiles
  const strategyBarData = useMemo(() => {
    if (!radarData || radarData.length === 0) return [];
    return radarData.map(row => {
      const barRow: Record<string, any> = { dimension: row.dimension };
      radarCompanies.forEach(c => { barRow[c] = row[c]; });
      return barRow;
    });
  }, [radarData, radarCompanies]);

  // Initialize radar companies to first 2 when data loads
  useEffect(() => {
    if (strategyProfiles && strategyProfiles.length >= 2 && radarCompanies.length === 0) {
      setRadarCompanies([strategyProfiles[0].company, strategyProfiles[1].company]);
    }
  }, [strategyProfiles, radarCompanies.length]);

  const overlapIndustries = useMemo(() => {
    if (!portfolioOverlap) return [];
    return [...new Set(portfolioOverlap.map(p => p.industry))];
  }, [portfolioOverlap]);

  // Pivot corporate speed for line chart: top 8 companies
  const speedPivot = useMemo(() => {
    if (!corpSpeed) return { data: [] as any[], companies: [] as string[] };
    const companyCounts: Record<string, number> = {};
    corpSpeed.forEach(d => { companyCounts[d.company] = (companyCounts[d.company] ?? 0) + d.patent_count; });
    const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c]) => c);
    const years = [...new Set(corpSpeed.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      corpSpeed.filter(d => d.year === year && topCompanies.includes(d.company)).forEach(d => {
        row[d.company] = d.median_grant_lag_days;
      });
      return row;
    });
    return { data: pivoted, companies: topCompanies };
  }, [corpSpeed]);

  return (
    <div>
      <ChapterHeader
        number={26}
        title="Corporate Strategy"
        subtitle="Talent flows, portfolio similarity, and innovation strategy dimensions"
      />

      <KeyFindings>
        <li>143,524 inventor movements flow among 50 major patent-filing organizations, with large technology companies tending to be net talent importers.</li>
        <li>248 companies cluster into 8 industries by patent portfolio similarity, though technology conglomerates occupy positions at the intersection of multiple clusters.</li>
        <li>Corporate innovation strategies diverge across eight normalized dimensions, with some firms emphasizing breadth and collaboration while others optimize for depth and defensiveness.</li>
        <li>Grant lag spans 439 to 1,482 days across the top 8 patent filers, reflecting differences in technology composition and prosecution strategy.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The movement of 143,524 inventors among the top 50 assignees constitutes a parallel knowledge-diffusion channel beyond formal co-patenting ties. Patent portfolio similarity mapping reveals 8 distinct industry clusters, while radar-chart strategy profiles show that individual firms occupy markedly different positions along dimensions such as breadth, speed, and science intensity. Grant lag varies from 439 to 1,482 days across top filers, reflecting technology-specific pendency patterns.
        </p>
      </aside>

      <Narrative>
        <p>
          Beyond the formal structure of co-patenting networks and international collaboration, the innovation
          ecosystem is shaped by how companies position themselves strategically. This chapter examines three
          complementary lenses on corporate innovation strategy: the flow of inventors between organizations,
          the competitive proximity of patent portfolios, and multi-dimensional strategy profiles that
          characterize how different firms approach innovation.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Corporate innovation strategy manifests not only in what companies patent, but in how they
          recruit talent, how their portfolios relate to competitors, and how they balance breadth against
          depth, speed against defensiveness. These strategic dimensions provide a richer picture of
          competitive positioning than patent counts alone.
        </p>
      </KeyInsight>

      <SectionDivider label="Talent Flows Between Companies" />

      <Narrative>
        <p>
          When inventors file patents at different organizations over their careers, they generate{' '}
          <GlossaryTooltip term="talent flow">talent flows</GlossaryTooltip> that transfer
          knowledge between companies. The{' '}
          <GlossaryTooltip term="Sankey diagram">Sankey diagram</GlossaryTooltip> below maps
          these inventor movements between major patent filers.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-collaboration-talent-flows"
        subtitle="Inventor movements between top 50 patent-filing organizations, based on consecutive patents with different assignees within 5 years."
        title="143,524 Inventor Movements Flow Among 50 Major Patent-Filing Organizations"
        caption="Movement of inventors between top patent-filing organizations, based on consecutive patents with different assignees (gap of 5 years or fewer). Blue nodes indicate net talent importers; red nodes indicate net exporters. The bidirectional nature of many flows suggests active talent cycling within industry clusters."
        insight="Large technology companies tend to be net talent importers, drawing inventors from smaller firms and universities. The bidirectional nature of many flows is consistent with active talent cycling within industry clusters."
        loading={tfL}
        height={700}
        wide
      >
        {talentFlows?.nodes && talentFlows?.links ? (
          <PWSankeyDiagram
            nodes={talentFlows.nodes}
            links={talentFlows.links}
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Competitive Proximity Map" />

      <Narrative>
        <p>
          The degree of similarity among corporate patent portfolios can be quantified by computing{' '}
          <GlossaryTooltip term="cosine similarity">cosine similarity</GlossaryTooltip> between
          CPC subclass distributions and projecting the results via{' '}
          <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip>, yielding a two-dimensional representation of the
          competitive landscape of innovation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-collaboration-portfolio-overlap"
        subtitle="UMAP projection of patent portfolio similarity among 248 companies, with proximity reflecting cosine similarity of CPC subclass distributions."
        title="248 Companies Cluster into 8 Industries by Patent Portfolio Similarity"
        caption="Each point represents a company; proximity reflects similarity in CPC subclass distributions, and color indicates industry cluster. Technology conglomerates occupy positions at the intersection of multiple clusters, reflecting diversified portfolio strategies."
        insight="Companies cluster by industry, though the boundaries are increasingly blurred. Technology conglomerates occupy positions at the intersection of multiple clusters, reflecting diversified portfolio strategies."
        loading={poL}
      >
        {portfolioOverlap ? (
          <PWScatterChart
            data={portfolioOverlap}
            xKey="x"
            yKey="y"
            colorKey="industry"
            nameKey="company"
            categories={overlapIndustries}
            colors={overlapIndustries.map(i => INDUSTRY_COLORS[i] ?? '#999999')}
            tooltipFields={[
              { key: 'company', label: 'Company' },
              { key: 'industry', label: 'Industry' },
              { key: 'top_cpc', label: 'Top CPC' },
            ]}
            xLabel="UMAP-1"
            yLabel="UMAP-2"
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Innovation Strategy Profiles" />

      <Narrative>
        <p>
          Each company pursues a distinctive innovation strategy that can be characterized across
          multiple dimensions. The <GlossaryTooltip term="radar chart">radar chart</GlossaryTooltip> below
          compares <StatCallout value="strategy profiles" /> across eight dimensions for the
          most prolific patent filers.
        </p>
      </Narrative>

      {strategyProfiles && (
        <div className="my-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Compare:</span>
          {strategyProfiles.slice(0, 15).map(p => (
            <button
              key={p.company}
              onClick={() => {
                setRadarCompanies(prev =>
                  prev.includes(p.company)
                    ? prev.filter(c => c !== p.company)
                    : prev.length < 3
                    ? [...prev, p.company]
                    : [...prev.slice(1), p.company]
                );
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                radarCompanies.includes(p.company)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {p.company}
            </button>
          ))}
        </div>
      )}

      <div className="my-2 flex items-center gap-2 max-w-[960px] mx-auto">
        <span className="text-sm text-muted-foreground">View:</span>
        <button
          onClick={() => setStrategyViewMode('radar')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${strategyViewMode === 'radar' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          Radar
        </button>
        <button
          onClick={() => setStrategyViewMode('bar')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${strategyViewMode === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          Bar
        </button>
      </div>

      <ChartContainer
        id="fig-collaboration-strategy-profiles"
        subtitle="Eight-dimensional innovation strategy profiles for top assignees, with each dimension normalized to a 0-100 scale for comparison."
        title="Corporate Innovation Strategies Diverge Across Eight Normalized Dimensions for 30 Top Assignees, with Scores Spanning 0 to 100"
        caption="Eight-dimensional strategy profile comparing selected companies, with all dimensions normalized to a 0-100 scale across the top 30 assignees. Divergent profiles indicate distinct strategic orientations between diversified conglomerates and focused technology leaders."
        insight="Companies exhibit distinctive strategy profiles. Some emphasize breadth and collaboration (diversified conglomerates), while others optimize for depth and defensiveness (focused technology leaders)."
        loading={spL}
        height={500}
        interactive
        statusText={`Showing ${strategyViewMode} view for ${radarCompanies.join(', ') || 'no companies'}`}
      >
        {radarData.length > 0 ? (
          strategyViewMode === 'radar' ? (
            <PWRadarChart
              data={radarData}
              companies={radarCompanies}
            />
          ) : (
            <PWBarChart
              data={strategyBarData}
              xKey="dimension"
              bars={radarCompanies.map((c, i) => ({
                key: c,
                name: c,
                color: CHART_COLORS[i % CHART_COLORS.length],
              }))}
              yLabel="Score (0-100)"
            />
          )
        ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Select companies above to compare</div>}
      </ChartContainer>

      <SectionDivider label="Corporate Innovation Speed" />

      <Narrative>
        <p>
          The speed at which different companies progress from application to{' '}
          <GlossaryTooltip term="grant lag">patent grant</GlossaryTooltip> varies considerably
          across firms, reflecting both the technological complexity of their filings and their patent
          prosecution strategies.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-collaboration-corporate-speed"
        subtitle="Median days from application to patent grant for the top 8 filers by year, reflecting technology-specific pendency patterns."
        title="Grant Lag Spans 439 to 1,482 Days Across Top 8 Patent Filers"
        caption="Median number of days from application filing to patent grant for the top patent filers, by year. Software and electronics-focused firms tend to exhibit longer pendency periods, while companies filing primarily in mechanical and design categories demonstrate shorter grant lags."
        insight="Grant lag patterns reflect both the technology composition of a company's portfolio and its patent prosecution efficiency. Companies filing primarily in software and electronics tend to face longer pendency, whereas mechanical and design patents tend to proceed more rapidly."
        loading={csL}
      >
        {speedPivot.data.length > 0 ? (
          <PWLineChart
            data={speedPivot.data}
            xKey="year"
            lines={speedPivot.companies.map((c, i) => ({
              key: c,
              name: c,
              color: BUMP_COLORS[i % BUMP_COLORS.length],
            }))}
            yLabel="Median Days to Grant"
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2011] })}
          />
        ) : <div />}
      </ChartContainer>

      <Narrative>
        The preceding chapters mapped where innovation occurs and how its participants collaborate. The analysis now shifts from the structure of the innovation system to its mechanics: how knowledge flows through citations, how patent output accelerates and converges, and how patent quality is measured.
        <Link href="/chapters/citation-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent citations</Link> -- the formal references linking new inventions to prior art -- reveal the underlying structure of how knowledge accumulates, diffuses, and shapes the direction of technological progress.
      </Narrative>

      <DataNote>
        Talent flows track inventor movements between assignees based on consecutive patent filings with gap of 5 years or fewer. Portfolio overlap uses cosine similarity of CPC subclass distributions projected to 2D via UMAP. Strategy profiles normalize 8 innovation dimensions to a 0-100 scale across the top 30 assignees. Grant lag measures median days from application filing to patent grant.
      </DataNote>

      <RelatedChapters currentChapter={26} />
      <ChapterNavigation currentChapter={26} />
    </div>
  );
}
