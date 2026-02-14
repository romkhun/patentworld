'use client';

import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import dynamic from 'next/dynamic';
const PWNetworkGraph = dynamic(() => import('@/components/charts/PWNetworkGraph').then(m => ({ default: m.PWNetworkGraph })), { ssr: false, loading: () => <div /> });
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';

import { CHART_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import type { NetworkData, NetworkMetricsByDecade, BridgeInventor } from '@/lib/types';

export default function Chapter24() {
  const { data: firmNetwork, loading: fnL } = useChapterData<NetworkData>('chapter3/firm_collaboration_network.json');
  const { data: inventorNetwork, loading: inL } = useChapterData<NetworkData>('chapter5/inventor_collaboration_network.json');
  const { data: networkMetrics, loading: nmL } = useChapterData<NetworkMetricsByDecade[]>('chapter3/network_metrics_by_decade.json');
  const { data: bridgeInventors } = useChapterData<BridgeInventor[]>('chapter3/bridge_inventors.json');

  return (
    <div>
      <ChapterHeader
        number={24}
        title="Network Structure"
        subtitle="Co-patenting and co-invention network topology"
      />

      <KeyFindings>
        <li>618 organizations form distinct industry clusters in the co-patenting network, with electronics, pharmaceutical, and automotive firms each constituting dense communities.</li>
        <li>632 prolific inventors form 1,236 co-invention ties in a more fragmented network of small, tightly connected teams.</li>
        <li>Average inventor degree rose 2.5 times, from 2.7 in the 1980s to 6.8 in the 2020s, reflecting a progressively more collaborative innovation ecosystem.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Co-patenting networks reveal distinct industry clusters -- electronics firms, pharmaceutical companies, and automotive manufacturers each form dense communities linked by sparse but strategically important inter-cluster bridges. Inventor collaboration networks are more fragmented, comprising small, stable teams rather than broad interconnections. Over the past four decades, the average number of co-inventors per inventor has risen 2.5 times, indicating a sustained shift toward team-based invention.
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
        id="fig-collaboration-firm-network"
        subtitle="Co-patenting network among organizations, with node size representing patent count and edge width indicating shared patents."
        title="618 Organizations Form Distinct Industry Clusters in the Co-Patenting Network"
        caption="Co-patenting network among organizations with significant collaboration ties. Node size represents total patent count; edge width indicates the number of shared patents. The network exhibits dense intra-industry clustering with sparse inter-industry connections."
        insight="The prevalence of co-patenting is consistent with the growing complexity of innovation and increasing inter-firm collaboration in technology development."
        loading={fnL}
        height={900}
        wide
      >
        {firmNetwork?.nodes && firmNetwork?.edges ? (
          <PWNetworkGraph
            nodes={firmNetwork.nodes.map((n: any) => ({ ...n, name: cleanOrgName(n.name) }))}
            edges={firmNetwork.edges}
            nodeColor={CHART_COLORS[0]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The co-patenting network exhibits distinct industry clusters. Electronics firms (Samsung,
          LG, Sony) form a dense cluster, pharmaceutical companies (Pfizer, Novartis) cluster
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

      <Narrative>
        <p>
          A comparison of the two networks reveals a fundamental asymmetry: organizational co-patenting
          networks are relatively dense and interconnected (many firms co-patent with many others),
          while inventor networks are sparser and more clustered (inventors tend to operate within
          small, stable teams). This asymmetry suggests that cross-firm collaboration is driven more by
          institutional partnerships than by individual inventor relationships.
        </p>
      </Narrative>

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

      <Narrative>
        Beyond the structure of domestic collaboration networks, a growing share of patents involve inventors from multiple countries. The next chapter examines{' '}
        <Link href="/chapters/international-collaboration" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">international collaboration</Link>{' '}
        dynamics, including the rise of cross-border co-invention and the evolving US-China collaboration corridor.
      </Narrative>

      <DataNote>
        Co-patenting identifies patents with 2+ distinct organizational assignees. Co-invention
        identifies inventors who share multiple patents. Edge weights represent the number of
        shared patents. Only connections above significance thresholds are shown to reduce visual
        clutter. Bridge inventors are those who have patented at 30 or more distinct organizations.
      </DataNote>

      <RelatedChapters currentChapter={24} />
      <ChapterNavigation currentChapter={24} />
    </div>
  );
}
