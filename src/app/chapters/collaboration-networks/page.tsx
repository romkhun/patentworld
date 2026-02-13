'use client';

import { useMemo, useState } from 'react';
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
  useMemo(() => {
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
        subtitle="The web of co-invention and co-patenting"
      />

      <KeyFindings>
        <li>Cross-organizational co-patenting has increased dramatically, with more patents listing inventors from multiple institutions.</li>
        <li>International collaboration on patents has grown steadily, particularly between US, European, and East Asian inventors.</li>
        <li>Inventor migration between organizations creates knowledge transfer channels that citations alone cannot capture.</li>
        <li>The co-invention network has become increasingly interconnected, enabling faster diffusion of knowledge across the innovation ecosystem.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Cross-organizational co-patenting has risen sharply, with distinct industry clusters visible in the network -- electronics giants, pharmaceutical firms, and automotive companies each form dense collaborative communities. US-China co-invention grew from near zero in the 1990s to a peak around 2017-2018 before plateauing amid trade tensions, with semiconductors and AI most affected. Talent flows between major firms create knowledge transfer channels beyond formal citations, and companies show distinctive innovation strategy fingerprints across dimensions like breadth, speed, and collaboration intensity.
        </p>
      </aside>

      <Narrative>
        <p>
          Innovation rarely happens in isolation. Patents frequently list multiple <GlossaryTooltip term="assignee">assignees</GlossaryTooltip> or
          inventors from different organizations, revealing a rich tapestry of{' '}
          <StatCallout value="collaborative relationships" />. Network analysis uncovers the
          hidden structure of these connections -- which organizations co-patent together, which
          inventors form long-term collaborative teams, and how these networks have shaped the
          direction of technological progress.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Network structure reveals hidden patterns that simple counts cannot. The clustering of
          collaborators into technology-specific communities, the emergence of bridge organizations
          that connect otherwise separate clusters, and the persistence of long-term collaborative
          ties all provide deep insights into how innovation actually works in practice.
        </p>
      </KeyInsight>

      <SectionDivider label="Organizational Co-Patenting" />

      <Narrative>
        <p>
          When two or more organizations appear as assignees on the same patent, it signals a
          substantive collaborative relationship -- joint research ventures, licensing agreements,
          or cross-firm R&D partnerships. The network below maps these{' '}
          <StatCallout value="co-patenting relationships" /> among organizations with significant
          collaboration ties.
        </p>
      </Narrative>

      <ChartContainer
        title="Co-Patenting Network (All Organizations)"
        caption="Co-patenting network among organizations with significant collaboration ties. Node size = total patents; edge width = shared patents. Hover over nodes for details; drag to reposition."
        insight="The rise of co-patenting reflects both the growing complexity of innovation and strategic inter-firm collaboration in technology development."
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
          The co-patenting network reveals distinct industry clusters. Electronics giants (Samsung,
          LG, Sony) form a dense cluster, pharmaceutical companies (Pfizer, Merck, Novartis) cluster
          separately, and automotive firms (Toyota, Honda, Ford) form their own community. Bridge
          organizations that span multiple clusters -- often large conglomerates like GE or Siemens
          -- play outsized roles in cross-industry knowledge transfer.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The network exhibits a clear core-periphery structure. A dense core of highly
          connected major patent holders sits at the center, while specialized firms and
          research institutions occupy the periphery with fewer but often strategically
          important connections. This structure reflects the hierarchical nature of
          industrial R&D, where large firms anchor collaborative ecosystems.
        </p>
      </Narrative>

      <SectionDivider label="Inventor Co-Invention" />

      <Narrative>
        <p>
          Beyond organizational partnerships, individual inventors also form collaborative
          networks. When the same inventors repeatedly appear together on patents, it reveals
          stable <StatCallout value="research teams" /> that persist across projects and years.
          These co-invention ties represent some of the most productive relationships in the
          innovation ecosystem.
        </p>
      </Narrative>

      <ChartContainer
        title="Co-Invention Network (All Inventors)"
        caption="Co-invention network among inventors with significant collaboration ties. Edges = shared patents. Node size = total patents. Hover over nodes for details; drag to reposition."
        insight="The increasing connectivity of the co-invention network means knowledge can diffuse faster, but may also create path dependencies in innovation direction."
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
          networks, with many small, tight-knit teams working in relative isolation. The most
          stable long-term collaborations -- pairs or trios of inventors who co-patent over
          decades -- are concentrated in fields like semiconductors and pharmaceuticals where
          deep domain expertise and established lab relationships provide durable advantages.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Comparing the two networks reveals a fundamental asymmetry: organizational co-patenting
          networks are relatively dense and interconnected (many firms co-patent with many others),
          while inventor networks are sparser and more clustered (inventors tend to work within
          small, stable teams). This suggests that cross-firm collaboration is driven more by
          institutional partnerships than by individual inventor relationships.
        </p>
      </Narrative>

      <SectionDivider label="The US-China Decoupling" />

      <Narrative>
        <p>
          International co-invention rates — the share of US patents with inventors from
          multiple countries — reveal the evolving geography of collaborative innovation.
          US-China co-invention grew steadily from near zero in the 1990s to a peak around
          2017–2018, coinciding with trade tensions, entity list restrictions, and
          tightening export controls. The pattern is sharpest in semiconductors and AI.
        </p>
      </Narrative>

      <ChartContainer
        title="US Co-Invention Rates by Partner Country"
        caption="Share of US patents co-invented with each partner country, 1976–2025. A co-invented patent has at least one inventor in the US and at least one in the partner country."
        insight="US-China co-invention grew rapidly after China's WTO entry in 2001 but flattened around 2018, coinciding with trade tensions and technology restrictions. US-India collaboration has emerged as a growing alternative."
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
        />
      </ChartContainer>

      <ChartContainer
        title="US-China Co-Invention by Technology Area"
        caption="Annual count of US patents co-invented with Chinese inventors, by CPC section."
        insight="The US-China collaboration pattern varies dramatically by technology. Electricity (H) and Physics (G) — which include semiconductors, AI, and telecommunications — show the most pronounced flattening, consistent with targeted technology restrictions in sensitive areas."
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
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The US-China co-invention data reveals a nuanced picture of technological decoupling.
          While overall collaboration rates have plateaued, the pattern varies by technology area.
          Semiconductor and AI collaboration appears most affected by restrictions, while
          collaboration in life sciences and materials has been more resilient. This selective
          decoupling may reshape global innovation networks in the coming decade.
        </p>
      </KeyInsight>

      <SectionDivider label="Talent Flows Between Companies" />

      <Narrative>
        <p>
          When inventors file patents at different organizations over their careers, they create{' '}
          <GlossaryTooltip term="talent flow">talent flows</GlossaryTooltip> that transfer
          knowledge between companies. The{' '}
          <GlossaryTooltip term="Sankey diagram">Sankey diagram</GlossaryTooltip> below maps
          these inventor movements between major patent filers.
        </p>
      </Narrative>

      <ChartContainer
        title="Inventor Talent Flows"
        caption="Movement of inventors between top patent-filing organizations, based on consecutive patents with different assignees (gap ≤ 5 years). Blue = net talent importer; red = net exporter."
        insight="Large technology companies tend to be net talent importers, drawing inventors from smaller firms and universities. The bidirectional nature of many flows suggests active talent cycling within industry clusters."
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
          How similar are companies&apos; patent portfolios? By computing{' '}
          <GlossaryTooltip term="cosine similarity">cosine similarity</GlossaryTooltip> between
          CPC subclass distributions and projecting with{' '}
          <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip>, we can visualize the
          competitive landscape of innovation.
        </p>
      </Narrative>

      <ChartContainer
        title="Patent Portfolio Proximity (UMAP)"
        caption="Each dot represents a company. Proximity reflects similarity in CPC subclass distributions. Color indicates industry cluster."
        insight="Companies cluster by industry, but the boundaries are increasingly blurred. Technology conglomerates sit at the intersection of multiple clusters, reflecting diversified portfolio strategies."
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
            colors={overlapIndustries.map(i => INDUSTRY_COLORS[i] ?? '#94a3b8')}
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
          Each company pursues a distinct innovation strategy that can be characterized across
          multiple dimensions. The <GlossaryTooltip term="radar chart">radar chart</GlossaryTooltip> below
          compares <StatCallout value="strategy profiles" /> across 8 dimensions for the
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
        title="Innovation Strategy Radar"
        caption="Eight-dimensional strategy profile comparing selected companies. All dimensions normalized to 0–100 scale across the top 30 assignees."
        insight="Companies show distinctive strategy fingerprints. Some emphasize breadth and collaboration (diversified conglomerates), while others optimize for depth and defensiveness (focused technology leaders)."
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
          How quickly do different companies move from application to{' '}
          <GlossaryTooltip term="grant lag">patent grant</GlossaryTooltip>? Innovation speed
          varies dramatically across firms, reflecting both technology complexity and patent
          prosecution strategy.
        </p>
      </Narrative>

      <ChartContainer
        title="Median Grant Lag by Company Over Time"
        caption="Median days from application filing to patent grant for the top patent filers, by year."
        insight="Grant lag patterns reflect both the technology mix of a company's portfolio and its patent prosecution efficiency. Companies filing primarily in software and electronics face longer pendency, while mechanical and design patents move faster."
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
          />
        ) : <div />}
      </ChartContainer>

      <Narrative>
        Having explored how inventors and organizations collaborate, the next chapter traces the knowledge flows that these connections enable.
        Patent citations -- the formal references linking new inventions to prior art -- reveal the deeper structure of how knowledge accumulates, diffuses, and shapes the direction of technological progress.
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
