'use client';

import { useEffect, useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWNetworkGraph } from '@/components/charts/PWNetworkGraph';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';

import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS, INDUSTRY_COLORS } from '@/lib/colors';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { PWSankeyDiagram } from '@/components/charts/PWSankeyDiagram';
import { PWRadarChart } from '@/components/charts/PWRadarChart';
import { PWScatterChart } from '@/components/charts/PWScatterChart';
import type {
  NetworkData, CoInventionRate, CoInventionBySection,
  TalentFlowData, PortfolioOverlapPoint, StrategyProfile, CorporateSpeed,
} from '@/lib/types';

export default function Chapter6() {
  const { data: firmNetwork, loading: fnL } = useChapterData<NetworkData>('chapter3/firm_collaboration_network.json');
  const { data: inventorNetwork, loading: inL } = useChapterData<NetworkData>('chapter5/inventor_collaboration_network.json');
  const { data: coInvention, loading: ciL } = useChapterData<CoInventionRate[]>('chapter6/co_invention_rates.json');
  const { data: coInventionBySec, loading: cisL } = useChapterData<CoInventionBySection[]>('chapter6/co_invention_us_china_by_section.json');

  // F1, F2, F3, F4: Talent flows and strategy
  const { data: talentFlows, loading: tfL } = useChapterData<TalentFlowData>('company/talent_flows.json');
  const { data: portfolioOverlap, loading: poL } = useChapterData<PortfolioOverlapPoint[]>('company/portfolio_overlap.json');
  const { data: strategyProfiles, loading: spL } = useChapterData<StrategyProfile[]>('company/strategy_profiles.json');
  const { data: corpSpeed, loading: csL } = useChapterData<CorporateSpeed[]>('company/corporate_speed.json');

  const [radarCompanies, setRadarCompanies] = useState<string[]>([]);

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

  // Pivot corporate speed for line chart: top 10 companies
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

  const { coInventionPivot, coInventionPartners } = useMemo(() => {
    if (!coInvention) return { coInventionPivot: [], coInventionPartners: [] };
    const partners = [...new Set(coInvention.map(d => d.partner))];
    const years = [...new Set(coInvention.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      coInvention.filter(d => d.year === year).forEach(d => {
        row[d.partner] = d.co_invention_rate;
      });
      return row;
    });
    return { coInventionPivot: pivoted, coInventionPartners: partners };
  }, [coInvention]);

  const { usChinaSecPivot, usChinaSections } = useMemo(() => {
    if (!coInventionBySec) return { usChinaSecPivot: [], usChinaSections: [] };
    const sections = [...new Set(coInventionBySec.map(d => d.section))].sort();
    const years = [...new Set(coInventionBySec.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      coInventionBySec.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.us_cn_count;
      });
      return row;
    });
    return { usChinaSecPivot: pivoted, usChinaSections: sections };
  }, [coInventionBySec]);

  return (
    <div>
      <ChapterHeader
        number={6}
        title="Collaboration Networks"
        subtitle="Structural analysis of co-invention and co-patenting networks"
      />

      <KeyFindings>
        <li>Cross-organizational co-patenting has increased substantially, with a growing share of patents listing inventors from multiple institutions.</li>
        <li>International collaboration on patents has exhibited steady growth, particularly between US, European, and East Asian inventors.</li>
        <li>Inventor migration between organizations creates knowledge transfer channels that citation analysis alone does not capture.</li>
        <li>The co-invention network has become increasingly interconnected, which appears to facilitate faster diffusion of knowledge across the innovation ecosystem.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The structure of collaborative patenting reveals distinct industry clusters -- electronics firms, pharmaceutical companies, and automotive manufacturers each form dense communities linked by sparse but strategically important inter-cluster bridges. Geopolitically, the US-China co-invention corridor expanded from near zero in the 1990s to over 2% of US patents by 2025, although chemistry-related collaboration declined by roughly a third between 2020 and 2023 amid tightening export controls. Beyond these formal co-patenting ties, the movement of 143,524 inventors among the top 50 assignees constitutes a parallel knowledge-diffusion channel that supplements the citation-based flows analyzed in Chapter 7, while radar-chart strategy profiles show that individual firms occupy markedly different positions along dimensions such as breadth, speed, and science intensity.
        </p>
      </aside>

      <Narrative>
        <p>
          Innovation rarely occurs in isolation. Patents frequently list multiple <GlossaryTooltip term="assignee">assignees</GlossaryTooltip> or
          inventors from different organizations, revealing an extensive network of{' '}
          <StatCallout value="collaborative relationships" />. Network analysis elucidates the
          underlying structure of these connections -- which organizations co-patent together, which
          inventors form long-term collaborative teams, and how these networks have influenced the
          direction of technological progress.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Network structure reveals patterns that aggregate counts alone do not capture. The clustering of
          collaborators into technology-specific communities, the emergence of bridge organizations
          that connect otherwise separate clusters, and the persistence of long-term collaborative
          ties all provide substantive insights into the mechanisms through which innovation operates in practice.
        </p>
      </KeyInsight>

      <SectionDivider label="Organizational Co-Patenting" />

      <Narrative>
        <p>
          When two or more organizations appear as assignees on the same patent, this indicates a
          substantive collaborative relationship -- joint research ventures, licensing agreements,
          or cross-firm R&D partnerships. The network below maps these{' '}
          <StatCallout value="co-patenting relationships" /> among organizations with significant
          collaboration ties.
        </p>
      </Narrative>

      <ChartContainer
        title="618 Organizations Form Distinct Industry Clusters in the Co-Patenting Network"
        caption="Co-patenting network among organizations with significant collaboration ties. Node size represents total patent count; edge width indicates the number of shared patents. The network exhibits dense intra-industry clustering with sparse inter-industry connections."
        insight="The prevalence of co-patenting is consistent with both the growing complexity of innovation and the strategic importance of inter-firm collaboration in technology development."
        loading={fnL}
        height={900}
        wide
      >
        {firmNetwork ? (
          <PWNetworkGraph
            nodes={firmNetwork.nodes}
            edges={firmNetwork.edges}
            nodeColor={CHART_COLORS[0]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The co-patenting network exhibits distinct industry clusters. Electronics firms (Samsung,
          LG, Sony) form a dense cluster, pharmaceutical companies (Pfizer, Merck, Novartis) cluster
          separately, and automotive firms (Toyota, Honda, Ford) constitute their own community. Bridge
          organizations that span multiple clusters -- often large conglomerates such as GE or Siemens
          -- appear to serve disproportionate roles in cross-industry knowledge transfer.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The network exhibits a clear core-periphery structure. A dense core of highly
          connected major patent holders occupies the center, while specialized firms and
          research institutions are positioned at the periphery with fewer but often strategically
          important connections. This structure reflects the hierarchical nature of
          industrial R&D, in which large firms anchor collaborative ecosystems.
        </p>
      </Narrative>

      <SectionDivider label="Inventor Co-Invention" />

      <Narrative>
        <p>
          In addition to organizational partnerships, individual inventors form collaborative
          networks. When the same inventors repeatedly appear together on patents, this indicates
          stable <StatCallout value="research teams" /> that persist across projects and years.
          These co-invention ties constitute some of the most productive relationships in the
          innovation ecosystem.
        </p>
      </Narrative>

      <ChartContainer
        title="632 Prolific Inventors Form 1,236 Co-Invention Ties in Fragmented Team Clusters"
        caption="Co-invention network among inventors with significant collaboration ties. Edges represent shared patents; node size indicates total patent count. The network is more fragmented than the organizational co-patenting network, with many small, tightly connected teams."
        insight="The increasing connectivity of the co-invention network suggests that knowledge may diffuse more rapidly, though it may simultaneously create path dependencies in innovation direction."
        loading={inL}
        height={900}
        wide
      >
        {inventorNetwork ? (
          <PWNetworkGraph
            nodes={inventorNetwork.nodes}
            edges={inventorNetwork.edges}
            nodeColor={CHART_COLORS[4]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Inventor collaboration networks tend to be more fragmented than organizational
          networks, comprising many small, closely connected teams that operate in relative isolation. The most
          stable long-term collaborations -- pairs or trios of inventors who co-patent over
          decades -- are concentrated in fields such as semiconductors and pharmaceuticals, where
          deep domain expertise and established laboratory relationships confer durable advantages.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          A comparison of the two networks reveals a fundamental asymmetry: organizational co-patenting
          networks are relatively dense and interconnected (many firms co-patent with many others),
          while inventor networks are sparser and more clustered (inventors tend to operate within
          small, stable teams). This asymmetry suggests that cross-firm collaboration is driven more by
          institutional partnerships than by individual inventor relationships.
        </p>
      </Narrative>

      <SectionDivider label="The US-China Decoupling" />

      <Narrative>
        <p>
          International co-invention rates -- the share of US patents with inventors from
          multiple countries -- illuminate the evolving geography of collaborative innovation.
          US-China co-invention has grown substantially from near zero in the 1990s to over
          2% by 2025, though growth rates moderated across certain technology areas amid
          trade tensions, entity list restrictions, and tightening export controls.
        </p>
      </Narrative>

      <ChartContainer
        title="US-China Co-Invention Rates Have Grown Substantially, Surpassing 2% by 2025"
        caption="Share of US patents co-invented with each partner country, 1976-2025. A co-invented patent includes at least one inventor in the US and at least one in the partner country. US-China co-invention has grown substantially since China's WTO accession in 2001, reaching over 2% by 2025."
        insight="US-China co-invention has grown substantially since China's WTO accession in 2001, reaching over 2% by 2025, though growth rates moderated in some technology areas. US-India collaboration has also emerged as a growing pathway."
        loading={ciL}
      >
        <PWLineChart
          data={coInventionPivot}
          xKey="year"
          lines={coInventionPartners.map((p, i) => ({
            key: p,
            name: `US-${p}`,
            color: BUMP_COLORS[i % BUMP_COLORS.length],
          }))}
          yLabel="Co-invention Rate (%)"
          yFormatter={(v: number) => `${v.toFixed(2)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <ChartContainer
        title="US-China Co-Invention Grew from 77 Patents in 2000 to 2,749 in 2024, Led by Electricity (H) and Physics (G)"
        caption="Annual count of US patents co-invented with Chinese inventors, disaggregated by CPC section. All CPC sections have grown over time, though growth rates moderated across some technology areas in recent years."
        insight="US-China collaboration has grown across most CPC technology sections. While growth rates moderated in some areas in recent years, most sections continued to expand, though chemistry (C) experienced a decline of approximately 33% between 2020 and 2023, reflecting evolving US-China research dynamics."
        loading={cisL}
        height={500}
      >
        <PWAreaChart
          data={usChinaSecPivot}
          xKey="year"
          areas={usChinaSections.map(s => ({
            key: s,
            name: `${s}: ${CPC_SECTION_NAMES[s] ?? s}`,
            color: CPC_SECTION_COLORS[s] ?? CHART_COLORS[0],
          }))}
          stacked
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The US-China co-invention data indicate substantial growth across most technology areas,
          though growth rates moderated in certain sectors in recent years.
          The broad-based nature of this collaboration suggests deeply integrated research ties
          that span multiple technology domains, even as policy tensions have introduced new
          uncertainties into the relationship.
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
        title="143,524 Inventor Movements Flow Among 50 Major Patent-Filing Organizations"
        caption="Movement of inventors between top patent-filing organizations, based on consecutive patents with different assignees (gap of 5 years or fewer). Blue nodes indicate net talent importers; red nodes indicate net exporters. The bidirectional nature of many flows suggests active talent cycling within industry clusters."
        insight="Large technology companies tend to be net talent importers, drawing inventors from smaller firms and universities. The bidirectional nature of many flows is consistent with active talent cycling within industry clusters."
        loading={tfL}
        height={700}
        wide
      >
        {talentFlows ? (
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

      <ChartContainer
        title="Corporate Innovation Strategies Diverge Across Eight Normalized Dimensions for 30 Top Assignees, with Scores Spanning 0 to 100"
        caption="Eight-dimensional strategy profile comparing selected companies, with all dimensions normalized to a 0-100 scale across the top 30 assignees. Divergent profiles indicate distinct strategic orientations between diversified conglomerates and focused technology leaders."
        insight="Companies exhibit distinctive strategy profiles. Some emphasize breadth and collaboration (diversified conglomerates), while others optimize for depth and defensiveness (focused technology leaders)."
        loading={spL}
        height={500}
      >
        {radarData.length > 0 ? (
          <PWRadarChart
            data={radarData}
            companies={radarCompanies}
          />
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
        The preceding analysis demonstrates how inventors and organizations collaborate; the subsequent chapter traces the knowledge flows that these connections enable.
        Patent citations -- the formal references linking new inventions to prior art -- reveal the underlying structure of how knowledge accumulates, diffuses, and shapes the direction of technological progress.
      </Narrative>

      <DataNote>
        Co-patenting identifies patents with 2+ distinct organizational assignees. Co-invention
        identifies inventors who share multiple patents. Edge weights represent the number of
        shared patents. Only connections above significance thresholds are shown to reduce visual
        clutter. Talent flows track inventor movements between assignees based on consecutive patent filings with gap ≤ 5 years. Portfolio overlap uses cosine similarity of CPC subclass distributions projected to 2D via UMAP. Strategy profiles normalize 8 innovation dimensions to a 0–100 scale across the top 30 assignees.
      </DataNote>

      <RelatedChapters currentChapter={6} />
      <ChapterNavigation currentChapter={6} />
    </div>
  );
}
