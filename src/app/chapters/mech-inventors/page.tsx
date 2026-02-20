'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PWNetworkGraph = dynamic(
  () => import('@/components/charts/PWNetworkGraph').then(m => ({ default: m.PWNetworkGraph })),
  { ssr: false, loading: () => <div /> }
);
const PWSankeyDiagram = dynamic(
  () => import('@/components/charts/PWSankeyDiagram').then(m => ({ default: m.PWSankeyDiagram })),
  { ssr: false, loading: () => <div /> }
);
const PWWorldFlowMap = dynamic(
  () => import('@/components/charts/PWWorldFlowMap').then(m => ({ default: m.PWWorldFlowMap })),
  { ssr: false }
);

import type {
  NetworkData,
  NetworkMetricsByDecade,
  BridgeInventor,
  TalentFlowData,
  InventorFlow,
  InventorMobilityTrend,
  MobilityEventData,
  BridgeCentralityQuintile,
} from '@/lib/types';

export default function MechInventorsChapter() {
  // Section A: Interpersonal Collaborations
  const { data: inventorNetwork, loading: inL } = useChapterData<NetworkData>('chapter5/inventor_collaboration_network.json');
  const { data: networkMetrics, loading: nmL } = useChapterData<NetworkMetricsByDecade[]>('chapter3/network_metrics_by_decade.json');
  const { data: bridgeInventors } = useChapterData<BridgeInventor[]>('chapter3/bridge_inventors.json');

  // Section B: Inter-Firm Mobility
  const { data: talentFlows, loading: tfL } = useChapterData<TalentFlowData>('company/talent_flows.json');
  const { data: mobilityTrend, loading: mtL } = useChapterData<InventorMobilityTrend[]>('chapter4/inventor_mobility_trend.json');
  const { data: stateFlows, loading: sfL } = useChapterData<InventorFlow[]>('chapter4/inventor_state_flows.json');
  const { data: countryFlows, loading: cfL } = useChapterData<InventorFlow[]>('chapter4/inventor_country_flows.json');

  // Analysis 4: Inventor Mobility Event Study
  const { data: mobilityEvent, loading: meL } = useChapterData<MobilityEventData>('chapter5/inventor_mobility_event_study.json');

  // Bridge Centrality
  const { data: bridgeCentrality, loading: bcL } = useChapterData<BridgeCentralityQuintile[]>('chapter5/bridge_centrality.json');

  // Analysis 35: International Inventor Mobility
  const { data: intlMobility, loading: imL } = useChapterData<any[]>('chapter21/inventor_international_mobility.json');
  const { data: mobilityFlows, loading: mfL } = useChapterData<any[]>('chapter21/inventor_mobility_flows.json');

  const topStateFlows = useMemo(() => {
    if (!stateFlows) return [];
    return stateFlows.slice(0, 30).map((d) => ({
      ...d,
      label: `${d.from_state} → ${d.to_state}`,
    }));
  }, [stateFlows]);

  // Net flow summary: top importers and exporters from talent flow nodes
  const { topImporters, topExporters } = useMemo(() => {
    if (!talentFlows?.nodes) return { topImporters: [] as { name: string; net_flow: number }[], topExporters: [] as { name: string; net_flow: number }[] };
    const sorted = [...talentFlows.nodes].sort((a, b) => b.net_flow - a.net_flow);
    return {
      topImporters: sorted.filter(n => n.net_flow > 0).slice(0, 10),
      topExporters: sorted.filter(n => n.net_flow < 0).slice(-10).reverse().sort((a, b) => a.net_flow - b.net_flow),
    };
  }, [talentFlows]);

  // International Sankey: convert country flow records to Sankey nodes + links
  const internationalSankey = useMemo(() => {
    if (!countryFlows || countryFlows.length === 0) return null;
    const topFlows = [...countryFlows].sort((a, b) => b.flow_count - a.flow_count).slice(0, 30);
    const countrySet = new Set<string>();
    topFlows.forEach(f => { countrySet.add(f.from_country!); countrySet.add(f.to_country!); });
    const countries = [...countrySet];

    // Compute net_flow for each country
    const netMap = new Map<string, number>();
    countries.forEach(c => netMap.set(c, 0));
    topFlows.forEach(f => {
      netMap.set(f.to_country!, (netMap.get(f.to_country!) ?? 0) + f.flow_count);
      netMap.set(f.from_country!, (netMap.get(f.from_country!) ?? 0) - f.flow_count);
    });

    const sankeyNodes = countries.map(c => ({ name: c, net_flow: netMap.get(c) ?? 0 }));
    const sankeyLinks = topFlows
      .map(f => ({
        source: countries.indexOf(f.from_country!),
        target: countries.indexOf(f.to_country!),
        value: f.flow_count,
      }))
      .filter(l => l.source !== l.target && l.source >= 0 && l.target >= 0);

    return { nodes: sankeyNodes, links: sankeyLinks };
  }, [countryFlows]);

  // Analysis 35: Top mobility flows
  const topMobilityFlows = useMemo(() => {
    if (!mobilityFlows) return [];
    return mobilityFlows.slice(0, 20).map((d: any) => ({
      ...d,
      label: `${d.from_country} \u2192 ${d.to_country}`,
    }));
  }, [mobilityFlows]);

  // Analysis 4: Pivot by_direction data for multi-line chart
  const mobilityByDirectionData = useMemo(() => {
    if (!mobilityEvent?.by_direction) return [];
    const directions = [...new Set(mobilityEvent.by_direction.map(d => d.direction))];
    const years = [...new Set(mobilityEvent.by_direction.map(d => d.relative_year))].sort((a, b) => a - b);
    return years.map(year => {
      const row: Record<string, number> = { relative_year: year };
      directions.forEach(dir => {
        const match = mobilityEvent.by_direction.find(d => d.direction === dir && d.relative_year === year);
        const key = dir.toLowerCase().replace(/[\s-]+/g, '_');
        row[`${key}_mean`] = match?.mean_fwd_cite_5y ?? 0;
      });
      return row;
    });
  }, [mobilityEvent]);

  const directionLines = useMemo(() => {
    if (!mobilityEvent?.by_direction) return [];
    const directions = [...new Set(mobilityEvent.by_direction.map(d => d.direction))];
    return directions.map((dir, i) => {
      const key = dir.toLowerCase().replace(/[\s-]+/g, '_');
      return {
        key: `${key}_mean`,
        name: `${dir}`,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
  }, [mobilityEvent]);

  return (
    <div>
      <ChapterHeader
        number={21}
        title="Inventor Mechanics"
        subtitle="Co-invention networks, bridge inventors, and inter-firm mobility"
      />
      <MeasurementSidebar slug="mech-inventors" />

      <KeyFindings>
        <li>632 prolific inventors form 1,236 co-invention ties in a fragmented network of small, tightly connected teams.</li>
        <li>Average inventor degree rose 2.5 times, from 2.7 in the 1980s to 6.8 in the 2020s, reflecting a progressively more collaborative innovation ecosystem.</li>
        <li>143,524 inventor movements flow among 50 major patent-filing organizations, with large technology companies tending to be net talent importers.</li>
        <li>International inventor mobility rose from 1.3% in 1980 to 5.1% in 2024, surpassing domestic interstate mobility rates of 3.5%.</li>
        <li>The United States is involved in 77.6% of all international inventor migration flows (509,639 of 656,397 moves).</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Individual inventors form fragmented co-invention networks of small, tightly connected teams, while bridge inventors who span 30 or more organizations create potential channels for cross-firm knowledge transfer. Average co-inventor counts have risen 2.5x since the 1980s, reflecting a sustained shift toward team-based invention. Beyond collaboration, the movement of 143,524 inventors among the top 50 assignees constitutes a parallel knowledge-diffusion channel, and international inventor mobility -- now surpassing domestic rates -- positions the United States at the center of 77.6% of all cross-border inventor flows.
        </p>
      </aside>

      <Narrative>
        <p>
          Innovation is shaped not only by what is patented but by the people who patent it -- how inventors collaborate, how they move between firms, and how they migrate across borders. This chapter examines the interpersonal and inter-firm dimensions of inventor activity: the co-invention networks that reveal stable research teams, the bridge inventors who connect otherwise separate organizations, and the mobility patterns through which talent and tacit knowledge circulate across firms, states, and countries.
        </p>
      </Narrative>

      {/* ================================================================== */}
      {/* SECTION A: Interpersonal Collaborations                            */}
      {/* ================================================================== */}

      <SectionDivider label="Inventor Co-Invention" />

      <Narrative>
        <p>
          In addition to organizational partnerships, individual inventors form collaborative
          networks. When the same inventors repeatedly appear together on patents, the pattern indicates
          stable <StatCallout value="research teams" /> that persist across projects and years.
          These co-invention ties constitute some of the most productive relationships in the
          innovation ecosystem.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-collaboration-inventor-network"
        subtitle="Co-invention network among prolific inventors, with edges representing shared patents and node size indicating total patent count."
        title="632 Prolific Inventors Form 1,236 Co-Invention Ties in Fragmented Team Clusters"
        caption="Co-invention network among inventors with significant collaboration ties. Edges represent shared patents; node size indicates total patent count. The network is more fragmented than the organizational co-patenting network, with many small, tightly connected teams."
        insight="The increasing connectivity of the co-invention network is consistent with potentially faster knowledge diffusion, though it may simultaneously create path dependencies in innovation direction."
        loading={inL}
        height={900}
        wide
      >
        {inventorNetwork?.nodes && inventorNetwork?.edges ? (
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

      <SectionDivider label="Collaboration Network Structure" />

      <Narrative>
        <p>
          The structure of innovation collaboration has evolved considerably over the study period.
          By analyzing co-inventor relationships as a network, it is possible to measure the connectedness
          of the innovation ecosystem. The average degree (number of collaborators per inventor) and network
          density indicate whether innovation is becoming more or less collaborative over time.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-collaboration-network-metrics"
        title="Average Inventor Degree Rose 2.5x, From 2.7 in the 1980s to 6.8 in the 2020s"
        subtitle="Average co-inventors per inventor and average team size by decade, measuring collaboration network connectivity"
        caption="Summary statistics of the inventor collaboration network by decade. Average degree measures the typical number of co-inventors per active inventor. Both metrics exhibit sustained increases, indicating a progressively more collaborative innovation ecosystem."
        insight="Rising average inventor degree reflects both larger team sizes and more extensive cross-organizational collaboration, resulting in a more interconnected innovation network over time."
        loading={nmL}
      >
        {networkMetrics && (
          <PWLineChart
            data={networkMetrics}
            xKey="decade_label"
            lines={[
              { key: 'avg_degree', name: 'Average Co-Inventors (Degree)', color: CHART_COLORS[0] },
              { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[1], dashPattern: '8 4' },
            ]}
            yLabel="Average per Inventor"
            yFormatter={(v: number) => v.toFixed(1)}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          The innovation network has become substantially more interconnected. Average inventor
          degree has risen steadily since the 1980s, reflecting both larger team sizes and more
          extensive cross-organizational collaboration. This &quot;small world&quot; property suggests that knowledge
          may diffuse more rapidly through the network, and is consistent with the broader trend
          toward team-based rather than individual invention.
        </p>
      </KeyInsight>

      <SectionDivider label="Bridge Inventors" />

      <Narrative>
        <p>
          Certain inventors serve as critical bridges connecting otherwise separate organizations
          and technology communities. These &quot;bridge inventors&quot; have patented at 30 or more
          distinct organizations, potentially facilitating the transfer of knowledge and practices between firms.
        </p>
      </Narrative>

      {bridgeInventors && bridgeInventors.length > 0 && (
        <div className="max-w-3xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Inventor</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Organizations</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Patents</th>
              </tr>
            </thead>
            <tbody>
              {bridgeInventors.slice(0, 15).map((inv, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3">{inv.first_name} {inv.last_name}</td>
                  <td className="text-right py-2 px-3 font-mono">{inv.num_orgs}</td>
                  <td className="text-right py-2 px-3 font-mono">{inv.total_patents.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <KeyInsight>
        <p>
          Bridge inventors who span multiple organizations may play a disproportionate role in the
          innovation ecosystem. Their movement between firms creates potential channels for knowledge
          transfer beyond patent citations alone, which may help explain observed patterns in which
          geographic and organizational proximity are associated with innovation diffusion.
        </p>
      </KeyInsight>

      {/* ================================================================== */}
      {/* SECTION B: Inter-Firm Mobility                                     */}
      {/* ================================================================== */}

      <SectionDivider label="Inter-Firm Mobility" />

      <Narrative>
        <p>
          Beyond the structure of co-invention networks, the movement of inventors between organizations, across state lines, and across national borders constitutes a parallel channel for knowledge diffusion. Tracking these mobility patterns reveals how talent and tacit knowledge circulate through the innovation ecosystem.
        </p>
      </Narrative>

      {/* --- B.i: Talent Flows Between Companies --- */}
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

      {(topImporters.length > 0 || topExporters.length > 0) && (
        <ChartContainer
          id="fig-net-talent-flow-summary"
          title="Microsoft Is the Largest Net Talent Exporter With 6,629 Net Inventor Departures, While Panasonic Leads Net Imports at 3,015"
          caption="Inventor mobility is inferred from tracking disambiguated inventor IDs across sequential patent assignments, not from HR data. Net flow is the difference between inventors entering and leaving each organization."
          flexHeight
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4">
            {/* Top 10 Net Importers */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Top 10 Net Importers</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Net Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {topImporters.map((node, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-2">{cleanOrgName(node.name)}</td>
                      <td className="text-right py-2 px-2 font-mono text-emerald-600">+{node.net_flow.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Top 10 Net Exporters */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Top 10 Net Exporters</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Net Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {topExporters.map((node, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-2">{cleanOrgName(node.name)}</td>
                      <td className="text-right py-2 px-2 font-mono text-red-500">{node.net_flow.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ChartContainer>
      )}

      {/* --- B.ii: International Inventor Mobility --- */}
      <SectionDivider label="International Inventor Mobility" />

      <Narrative>
        <p>
          Inventor mobility data reveal how researchers and engineers move across national borders over the course of their careers. International mobility rates have risen steadily and now surpass domestic interstate rates, reflecting the increasingly global nature of innovation talent flows.
        </p>
      </Narrative>

      {mobilityTrend && mobilityTrend.length > 0 && (
        <ChartContainer
          id="fig-geography-inventor-mobility-trend"
          subtitle="Domestic and international inventor mobility rates over time, measured as the share of patents filed by inventors who changed location since their prior patent."
          title="International Inventor Mobility Rose from 1.3% (1980) to 5.1% (2024), Surpassing Domestic Rates of 3.5%"
          caption="The figure displays the percentage of patents filed by inventors who relocated from a different state or country since their previous patent. Both domestic (interstate) and international mobility rates exhibit upward trends over the study period."
          insight="Inventor mobility represents a potential mechanism for knowledge diffusion, as mobile inventors may carry tacit knowledge and professional networks from one region to another."
          loading={mtL}
        >
          <PWLineChart
            data={mobilityTrend}
            xKey="year"
            lines={[
              { key: 'domestic_mobility_pct', name: 'Domestic Mobility (% Interstate)', color: CHART_COLORS[0] },
              { key: 'intl_mobility_pct', name: 'International Mobility (%)', color: CHART_COLORS[3], dashPattern: '8 4' },
            ]}
            yLabel="Mobility Rate (%)"
            yFormatter={(v) => `${v.toFixed(1)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          Inventor mobility patterns illuminate the dynamic nature of innovation geography.
          While the majority of inventors remain in the same location throughout their patenting
          careers, a significant minority relocates between countries, carrying
          knowledge and professional networks with them. International mobility has surpassed domestic interstate mobility in recent years, reflecting the increasingly global circulation of inventive talent.
        </p>
      </KeyInsight>

      {/* --- B.iii: Domestic Inventor Mobility --- */}
      <SectionDivider label="Domestic Inventor Mobility" />

      <Narrative>
        <p>
          The static snapshots of state and city patent output presented above capture where innovation occurs, but not how inventors move across these domestic regions over the course of their careers. Tracking individual inventors across their patent histories reveals patterns of{' '}
          <StatCallout value="geographic mobility" /> -- the manner in which innovators relocate between states, carrying tacit knowledge and professional networks with them.
        </p>
      </Narrative>

      {topStateFlows.length > 0 && (
        <ChartContainer
          id="fig-geography-state-flows"
          subtitle="Top 30 state-to-state inventor migration corridors, measured by sequential patents filed from different states."
          title="California Accounts for 54.9% of All Interstate Inventor Migration, with 127,466 Inflows and 118,630 Outflows"
          caption="The figure displays the most common state-to-state inventor moves, based on sequential patents filed from different states. California-linked corridors dominate, reflecting the state's role as the primary hub for inventor talent flows."
          insight="The dominant migration corridors reveal the gravitational pull of major technology clusters, with California functioning as both the largest source and destination of inventor talent."
          loading={sfL}
          height={900}
        >
          <PWBarChart
            data={topStateFlows}
            xKey="label"
            bars={[{ key: 'flow_count', name: 'Moves', color: CHART_COLORS[0] }]}
            layout="vertical"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The dominant domestic migration corridors reflect the gravitational pull of major
          technology clusters. California functions as both the largest source and destination
          of inventor migration within the United States, with corridors linking it to Texas, New York, and Washington among the most heavily traveled. These flows suggest that the same agglomeration forces driving geographic concentration also shape the pathways through which inventor talent circulates across the country.
        </p>
      </KeyInsight>

      {/* --- B.iv: Global Inventor Migration Flows --- */}
      <SectionDivider label="Global Inventor Migration Flows" />

      <Narrative>
        <p>
          Beyond country-level filing volumes, the map below visualizes the dominant cross-border migration corridors that connect national innovation ecosystems. The United States emerges as the central node, linking East Asian, European, and other innovation systems through flows of researchers and engineers.
        </p>
      </Narrative>

      {countryFlows && countryFlows.length > 0 && (
        <ChartContainer
          id="fig-geography-global-flows"
          subtitle="Global inventor migration flows between countries, with arc width proportional to the volume of moves and country shading indicating total movement."
          title="The United States Is Involved in 77.6% of All International Inventor Migration Flows (509,639 of 656,397 Moves)"
          caption="The map displays global inventor migration flows between countries, with arc width representing the volume of moves and country shading indicating total inventor movement. The United States emerges as the central node, connecting East Asian, European, and other innovation ecosystems."
          insight="The United States functions as the primary global hub for inventor migration, connecting East Asian, European, and other innovation ecosystems through flows of researchers and engineers."
          loading={cfL}
          height={650}
          wide
        >
          <PWWorldFlowMap data={countryFlows} maxFlows={25} />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          Internationally, the United States serves as the primary hub connecting inventors from East Asia,
          Europe, and other regions. Its involvement in more than three-quarters of all cross-border inventor moves underscores
          its role not only as a destination for global talent but also as a gateway through which knowledge circulates among
          national innovation systems. These mobility patterns complement the domestic flows above, illustrating
          how the US patent system functions as both a legal institution and a nexus for the global circulation of inventive talent.
        </p>
      </KeyInsight>

      {internationalSankey && (
        <ChartContainer
          id="fig-international-talent-sankey"
          title="The United States Dominates International Inventor Flows, Appearing in 77.6% of All Cross-Border Migration Corridors"
          subtitle="Top 30 country-to-country inventor migration corridors by flow volume, showing dominant US bilateral patterns."
          caption="Inventor mobility is inferred by tracking disambiguated inventor IDs that appear on patents filed from different countries on sequential patent filings. This approach captures cross-border knowledge transfer but may overcount moves by prolific international collaborators."
          insight="The US serves as a global hub for inventor mobility, with substantial bilateral flows to and from China, Japan, the United Kingdom, Canada, and Germany. Cross-border inventor migration increased from 1.3% to 5.1% by 2024 of all patenting inventors."
          loading={cfL}
          height={700}
          wide
        >
          <PWSankeyDiagram
            nodes={internationalSankey.nodes}
            links={internationalSankey.links}
          />
        </ChartContainer>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          Analysis 4: Inventor Mobility Event Study
          ══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Inventor Mobility: Event-Study Evidence" />

      <Narrative>
        <p>
          The preceding sections document the volume and direction of inventor mobility, but do not
          address its consequences for individual productivity. An event-study design isolates the
          impact of firm moves by tracking each inventor&apos;s output from t-5 to t+5 years
          relative to the move event. By centering outcomes on the move year, this approach
          controls for secular trends and life-cycle effects, revealing how the disruption of
          changing organizational context affects citation impact. The panel includes inventors
          who moved exactly once between top-50 assignees, with at least two patents in both
          the pre- and post-move windows.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventor-mobility-event-overall"
        subtitle="Mean 5-year forward citations by year relative to firm move (t=0), with 95% confidence interval, for inventors who moved once between top-50 assignees."
        title="Citation Impact Dips at the Time of Move, Then Recovers Within 2 Years"
        caption="Event-study design tracking inventor citation impact from t-5 to t+5 around a firm move. The shaded band represents the 95% confidence interval. The dip at t=0 reflects the disruption of changing organizational context; the recovery by t+2 suggests that mobile inventors adapt quickly and may benefit from access to new knowledge and resources."
        insight="The transient dip in citation impact around the move year, followed by full recovery within two years, suggests that inter-firm mobility entails short-term costs but does not permanently impair inventor productivity -- and may ultimately enhance it through exposure to new organizational knowledge."
        loading={meL}
        badgeProps={{ outcomeWindow: '5y' }}
        height={400}
        wide
      >
        {(mobilityEvent?.overall ?? []).length > 0 ? (
          <PWLineChart
            data={mobilityEvent?.overall ?? []}
            xKey="relative_year"
            lines={[
              { key: 'mean_fwd_cite_5y', name: 'Mean 5-Year Forward Citations', color: CHART_COLORS[0] },
            ]}
            bands={[{ upperKey: 'ci_upper_cites', lowerKey: 'ci_lower_cites', color: CHART_COLORS[0] }]}
            yLabel="Mean 5-Year Forward Citations"
            xLabel="Years Relative to Move"
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The event-study reveals a distinctive V-shaped pattern: inventor citation impact dips
          at the time of the firm move, reflecting the disruption of established routines and
          collaborative networks, but recovers within approximately two years. This transient
          cost is consistent with the hypothesis that inter-firm mobility requires an adjustment
          period during which inventors rebuild their knowledge networks and adapt to new
          organizational contexts.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-inventor-mobility-event-direction"
        subtitle="Mean 5-year forward citations by year relative to move, stratified by move direction (up to higher-quality firm, lateral, or down to lower-quality firm)."
        title="Moves to Higher-Quality Firms Produce Larger Post-Move Citation Gains"
        caption="Event-study results stratified by the direction of the move relative to firm quality (measured by mean citation impact). Moves to higher-quality firms show the largest post-move gains, while moves to lower-quality firms exhibit a more muted recovery, suggesting that organizational context shapes inventor productivity."
        insight="The direction of the move matters: inventors who move to higher-quality firms experience the largest post-move citation gains, indicating that organizational resources and peer quality amplify individual inventor productivity."
        loading={meL}
        height={400}
        wide
      >
        {mobilityByDirectionData.length > 0 ? (
          <PWLineChart
            data={mobilityByDirectionData}
            xKey="relative_year"
            lines={directionLines}
            yLabel="Mean 5-Year Forward Citations"
            xLabel="Years Relative to Move"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-bridge-centrality"
        title="Network Position and Citation Impact Among Top Inventors"
        subtitle="Mean 5-year citations and degree centrality by quintile, top-5K most prolific inventors"
        loading={bcL}
      >
        <PWBarChart
          data={bridgeCentrality ?? []}
          xKey="centrality_label"
          bars={[
            { key: 'mean_citations', name: 'Mean Citations (5yr)', color: CHART_COLORS[0] },
            { key: 'mean_degree', name: 'Mean Degree Centrality', color: CHART_COLORS[4] },
          ]}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Stratifying by move direction reveals that organizational context is a first-order
          determinant of inventor productivity. Moves to higher-quality firms produce the largest
          post-move citation gains, while moves to lower-quality firms show a more muted recovery.
          This asymmetry suggests that access to better resources, stronger peer networks, and
          more productive organizational routines amplifies individual inventive output -- a finding
          with implications for both firm talent strategy and innovation policy.
        </p>
      </KeyInsight>

      {/* ================================================================== */}
      {/* Analysis 35: International Inventor Mobility Deep Dive             */}
      {/* ================================================================== */}

      <SectionDivider label="International Mobility: Rates and Flows" />

      <Narrative>
        <p>
          A deeper look at international inventor mobility reveals both the aggregate rate of cross-border movement over time and the specific bilateral corridors through which inventors circulate. The following analyses track the share of inventors who change country across successive 5-year windows and identify the dominant country-pair flows.
        </p>
      </Narrative>

      {intlMobility && intlMobility.length > 0 && (
        <ChartContainer
          id="fig-mech-inventors-intl-mobility-rate"
          subtitle="International inventor mobility rate by 5-year period, measured as the share of active inventors who changed country between successive patents."
          title="International Inventor Mobility Peaked at 20.2% in the 1980s Before Declining to 8.9% in the 2020s"
          caption="The figure displays the share of active patent inventors who filed from a different country than their previous patent, aggregated in 5-year windows. The decline in the mobility rate from ~20% in the early periods to ~9% in the 2020s may reflect the growing size of the inventor population (denominator effect) rather than a decrease in absolute cross-border movement."
          insight="The declining mobility rate likely reflects the rapid growth of the total inventor population rather than reduced international movement, as the absolute number of mobile inventors has continued to increase even as the rate has fallen."
          loading={imL}
        >
          <PWLineChart
            data={intlMobility}
            xKey="period_start"
            lines={[{ key: 'mobility_rate', name: 'Mobility Rate (%)', color: CHART_COLORS[3] }]}
            yLabel="Mobility Rate (%)"
            yFormatter={(v) => `${(v as number).toFixed(1)}%`}
          />
        </ChartContainer>
      )}

      {topMobilityFlows.length > 0 && (
        <ChartContainer
          id="fig-mech-inventors-top-mobility-flows"
          subtitle="Top 20 country-to-country inventor migration corridors by total move count."
          title="US-China Inventor Flows Dominate International Mobility with 100,934 Bidirectional Moves"
          caption="The figure displays the top 20 unidirectional inventor migration corridors, measured by the number of inventors who filed sequential patents from different countries. The US-China corridor dominates with 52,143 moves from US to China and 48,791 from China to US. US-South Korea (22,246 bidirectional), India-US (20,568), and US-Japan (18,644) follow."
          insight="The dominance of the US-China corridor in inventor mobility flows reflects the deep integration of US and Chinese innovation ecosystems, with nearly balanced bidirectional flows suggesting reciprocal talent circulation rather than one-way brain drain."
          loading={mfL}
          height={700}
        >
          <PWBarChart
            data={topMobilityFlows}
            xKey="label"
            bars={[{ key: 'move_count', name: 'Inventor Moves', color: CHART_COLORS[3] }]}
            layout="vertical"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The bilateral inventor flow data reveal that US-China mobility is nearly balanced, with 52,143 moves from US to China and 48,791 from China to US. This approximate symmetry suggests reciprocal talent circulation rather than unidirectional brain drain, and highlights the deep integration of these two innovation ecosystems. The Taiwan-China corridor (16,917 bidirectional moves) further underscores the interconnected nature of East Asian innovation networks.
        </p>
      </KeyInsight>

      {/* ================================================================== */}
      {/* Closing                                                            */}
      {/* ================================================================== */}

      <Narrative>
        The collaboration networks and mobility patterns documented in this chapter reveal the human infrastructure of innovation -- the teams, bridges, and talent flows through which knowledge circulates. The next chapter,{' '}
        <Link href="/chapters/mech-geography" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Geography Mechanics</Link>,
        examines the spatial dimensions of these dynamics: how innovation clusters form, how they evolve over time, and how geographic proximity shapes the direction of technological progress.
      </Narrative>

      <InsightRecap
        learned={[
          "632 prolific inventors form 1,236 co-invention ties, creating a dense knowledge-sharing network among the most productive patent holders.",
          "143,524 inventor movements flow among 50 major organizations, with California accounting for 54.9% of interstate inventor migration.",
        ]}
        falsifiable="If inventor mobility transfers knowledge between firms, then the receiving firm's patent quality in the mover's technology area should increase after the move, controlling for pre-existing trends."
        nextAnalysis={{
          label: "Geographic Mechanics",
          description: "Cross-border collaboration networks and the geography of knowledge diffusion",
          href: "/chapters/mech-geography",
        }}
      />

      <DataNote>
        Co-invention identifies inventors who share multiple patents. Edge weights represent the number of shared patents. Only connections above significance thresholds are shown to reduce visual clutter. Bridge inventors are those who have patented at 30 or more distinct organizations. Talent flows track inventor movements between assignees based on consecutive patent filings with a gap of 5 years or fewer. Inventor mobility is inferred from changes in reported location between sequential patents by the same disambiguated inventor. International flows track cross-border moves based on sequential patents filed from different countries. The inventor mobility event study tracks 5-year forward citations from t-5 to t+5 around firm moves for inventors who moved exactly once between top-50 assignees; confidence intervals are computed via clustered standard errors at the inventor level. Move direction is classified by comparing the mean citation impact of the origin and destination firms.
      </DataNote>

      <RelatedChapters currentChapter={21} />
      <ChapterNavigation currentChapter={21} />
    </div>
  );
}
