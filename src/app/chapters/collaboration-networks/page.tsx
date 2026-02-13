'use client';

import { useMemo } from 'react';
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

import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { NetworkData, CoInventionRate, CoInventionBySection } from '@/lib/types';

export default function Chapter6() {
  const { data: firmNetwork, loading: fnL } = useChapterData<NetworkData>('chapter3/firm_collaboration_network.json');
  const { data: inventorNetwork, loading: inL } = useChapterData<NetworkData>('chapter5/inventor_collaboration_network.json');
  const { data: coInvention, loading: ciL } = useChapterData<CoInventionRate[]>('chapter6/co_invention_rates.json');
  const { data: coInventionBySec, loading: cisL } = useChapterData<CoInventionBySection[]>('chapter6/co_invention_us_china_by_section.json');

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

      <DataNote>
        Co-patenting identifies patents with 2+ distinct organizational assignees. Co-invention
        identifies inventors who share multiple patents. Edge weights represent the number of
        shared patents. Only connections above significance thresholds are shown to reduce visual
        clutter.
      </DataNote>

      <RelatedChapters currentChapter={6} />
      <ChapterNavigation currentChapter={6} />
    </div>
  );
}
