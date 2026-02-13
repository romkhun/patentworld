'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type {
  AssigneeTypePerYear, TopAssignee, OrgOverTime, DomesticVsForeign, Concentration,
  FirmCitationImpact, FirmTechEvolution,
} from '@/lib/types';
import type { PortfolioDiversity, NetworkMetricsByDecade, BridgeInventor } from '@/lib/types';

function pivotByCategory(data: AssigneeTypePerYear[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.category] = d.count; });
    return row;
  });
}

function pivotByOrigin(data: DomesticVsForeign[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.origin] = d.count; });
    return row;
  });
}

export default function Chapter3() {
  const { data: types, loading: typL } = useChapterData<AssigneeTypePerYear[]>('chapter3/assignee_types_per_year.json');
  const { data: top, loading: topL } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: orgsTime, loading: orgL } = useChapterData<OrgOverTime[]>('chapter3/top_orgs_over_time.json');
  const { data: dvf, loading: dvfL } = useChapterData<DomesticVsForeign[]>('chapter3/domestic_vs_foreign.json');
  const { data: conc, loading: concL } = useChapterData<Concentration[]>('chapter3/concentration.json');
  const { data: citImpact, loading: citL } = useChapterData<FirmCitationImpact[]>('chapter3/firm_citation_impact.json');
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');
  const { data: diversity, loading: divL } = useChapterData<PortfolioDiversity[]>('chapter3/portfolio_diversity.json');
  const { data: networkMetrics, loading: nmL } = useChapterData<NetworkMetricsByDecade[]>('chapter3/network_metrics_by_decade.json');
  const { data: bridgeInventors, loading: biL } = useChapterData<BridgeInventor[]>('chapter3/bridge_inventors.json');

  const [selectedOrg, setSelectedOrg] = useState<string>('');

  const typePivot = useMemo(() => types ? pivotByCategory(types) : [], [types]);
  const categories = useMemo(() => types ? [...new Set(types.map((d) => d.category))] : [], [types]);
  const originPivot = useMemo(() => dvf ? pivotByOrigin(dvf) : [], [dvf]);

  const topOrgs = useMemo(() => {
    if (!top) return [];
    return top.map((d) => ({
      ...d,
      label: d.organization.length > 30 ? d.organization.slice(0, 27) + '...' : d.organization,
    }));
  }, [top]);

  const topOrgName = top?.[0]?.organization ?? 'IBM';

  const citData = useMemo(() => {
    if (!citImpact) return [];
    return citImpact.map((d) => ({
      ...d,
      label: d.organization.length > 28 ? d.organization.slice(0, 25) + '...' : d.organization,
    }));
  }, [citImpact]);

  // Company output over time line chart
  const { orgOutputPivot, orgOutputNames } = useMemo(() => {
    if (!orgsTime) return { orgOutputPivot: [], orgOutputNames: [] };
    const top10 = [...new Set(orgsTime.filter((d) => d.rank <= 10).map((d) => d.organization))].slice(0, 10);
    const years = [...new Set(orgsTime.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: any = { year };
      orgsTime.filter((d) => d.year === year && top10.includes(d.organization))
        .forEach((d) => { row[d.organization] = d.count; });
      return row;
    });
    return { orgOutputPivot: pivoted, orgOutputNames: top10 };
  }, [orgsTime]);

  // Tech evolution: list of orgs and pivoted data for selected org
  const techOrgList = useMemo(() => {
    if (!techEvo) return [];
    return [...new Set(techEvo.map((d) => d.organization))];
  }, [techEvo]);

  const activeOrg = selectedOrg || techOrgList[0] || '';

  const techEvoPivot = useMemo(() => {
    if (!techEvo || !activeOrg) return [];
    const orgData = techEvo.filter((d) => d.organization === activeOrg);
    const periods = [...new Set(orgData.map((d) => d.period))].sort();
    return periods.map((period) => {
      const row: any = { period };
      orgData.filter((d) => d.period === period).forEach((d) => {
        row[d.section] = d.count;
      });
      return row;
    });
  }, [techEvo, activeOrg]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  const { diversityPivot, diversityOrgs } = useMemo(() => {
    if (!diversity) return { diversityPivot: [], diversityOrgs: [] };
    const orgs = [...new Set(diversity.map(d => d.organization))];
    const periods = [...new Set(diversity.map(d => d.period))].sort();
    const pivoted = periods.map(period => {
      const row: Record<string, any> = { period };
      diversity.filter(d => d.period === period).forEach(d => {
        row[d.organization] = d.shannon_entropy;
      });
      return row;
    });
    return { diversityPivot: pivoted, diversityOrgs: orgs };
  }, [diversity]);

  return (
    <div>
      <ChapterHeader
        number={3}
        title="Who Innovates?"
        subtitle="The organizations driving patent activity"
      />

      <KeyFindings>
        <li>Corporations hold the overwhelming majority of US patents, with individual inventors shrinking to a tiny fraction of annual grants.</li>
        <li>Asian electronics firms (Samsung, Canon, LG) now account for over half of the top 25 patent holders, reflecting the globalization of technology leadership.</li>
        <li>Patent concentration has been remarkably stable: the top 100 organizations consistently hold roughly a quarter of all corporate patents.</li>
        <li>Foreign <GlossaryTooltip term="assignee">assignees</GlossaryTooltip> have nearly reached parity with US-based assignees in patent grants, driven by multinational R&amp;D strategies.</li>
      </KeyFindings>

      <Narrative>
        <p>
          Patents are overwhelmingly held by corporations. Over the decades, the share of
          patents assigned to companies has grown steadily, while individual inventors
          have become a smaller fraction. <StatCallout value={topOrgName} /> leads all
          organizations in total patent grants.
        </p>
      </Narrative>

      <ChartContainer
        title="Assignee Types Over Time"
        caption="Share of utility patents by assignee category (primary assignee)."
        insight="The Bayh-Dole Act (1980) enabled university patenting, but the dominant trend is the rise of corporate R&D as patent portfolios became strategic assets for licensing and competitive signaling."
        loading={typL}
      >
        <PWAreaChart
          data={typePivot}
          xKey="year"
          areas={categories.map((cat, i) => ({
            key: cat,
            name: cat,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          stackedPercent
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 1995] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The corporatization of patenting is one of the most striking long-term trends. In the
          late 1970s, individual inventors and government entities held meaningful shares of
          patent grants. Today, large corporations dominate overwhelmingly.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The Bayh-Dole Act of 1980 enabled universities and small businesses to patent
          federally-funded inventions, contributing to a surge in institutional patenting. But
          the dominant story is the rise of corporate R&D: as patent portfolios became strategic
          assets for cross-licensing, defensive protection, and competitive signaling, large
          firms invested heavily in systematic patent generation.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Patent-Holding Organizations"
        caption="Ranked by total utility patents granted, 1976-2025."
        insight="The leaderboard reveals the global nature of US patent activity — Japanese and Korean electronics firms compete directly with American tech giants for the top positions."
        loading={topL}
        height={1400}
      >
        <PWBarChart
          data={topOrgs}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <Narrative>
        <p>
          The leaderboard is dominated by technology giants and Asian electronics firms.
          Companies like Samsung, Canon, and LG have risen dramatically since the 1990s,
          challenging the traditional dominance of American firms like IBM and General Electric.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Asian electronics firms account for over half of the top 25 patent holders. Samsung alone
          surpassed IBM in annual patent grants in the 2010s, reflecting the globalization of technology
          leadership and the strategic importance of patent portfolios in international competition.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The rank heatmap below reveals distinct eras of organizational dominance. Some firms
          have maintained top positions for decades, while others have risen rapidly or faded
          as their core technologies evolved.
        </p>
      </Narrative>

      {orgsTime && orgsTime.length > 0 && (
        <ChartContainer
          title="Top Organizations: Rank Over Time"
          caption="Rank heatmap showing how the top 15 patent-holding organizations have shifted in annual grant rankings. Darker cells = higher rank."
          insight="Three distinct eras emerge: GE/IBM dominance (1970s-80s), the rise of Japanese electronics (1980s-90s), and the Korean ascendancy (2000s-present). These shifts mirror broader geopolitical changes in R&D investment."
          loading={orgL}
          height={850}
        >
          <PWRankHeatmap
            data={orgsTime.filter((d) => d.rank <= 15)}
            nameKey="organization"
            yearKey="year"
            rankKey="rank"
            maxRank={15}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The heatmap reveals three distinct eras: the GE/IBM dominance of the 1970s-80s, the
          rise of Japanese electronics firms (Canon, Hitachi, Toshiba) in the 1980s-90s, and
          the Korean ascendancy (Samsung, LG) since the 2000s. These shifts reflect broader
          geopolitical changes in technology leadership and R&D investment.
        </p>
      </KeyInsight>

      {orgOutputPivot.length > 0 && (
        <ChartContainer
          title="Patent Output Trajectories: Top Organizations"
          caption="Annual patent grants for the 10 historically top-ranked organizations, showing the rise and fall of different firms over five decades."
          insight="IBM's gradual decline and Samsung's rapid ascent illustrate how corporate patent strategies diverge — IBM shifted toward services while Samsung invested aggressively in hardware and electronics R&D."
          loading={orgL}
        >
          <PWLineChart
            data={orgOutputPivot}
            xKey="year"
            lines={orgOutputNames.map((name, i) => ({
              key: name,
              name: name.length > 25 ? name.slice(0, 22) + '...' : name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            yLabel="Patents"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The patent output trajectories of leading organizations reveal striking divergence
          over time. While IBM maintained consistently high output for decades before declining,
          Samsung and Canon demonstrated rapid growth trajectories from the 1980s onward. These
          patterns reflect fundamental differences in corporate R&D strategies, from IBM&apos;s shift
          toward services to Samsung&apos;s aggressive technology diversification.
        </p>
      </KeyInsight>

      <ChartContainer
        title="US vs Foreign Assignees"
        caption="Patents by US-based vs foreign-based primary assignees."
        insight="The convergence toward parity reflects the globalization of R&D. The US patent system serves as the de facto global standard for protecting high-value inventions regardless of assignee nationality."
        loading={dvfL}
      >
        <PWLineChart
          data={originPivot}
          xKey="year"
          lines={[
            { key: 'US', name: 'US', color: CHART_COLORS[0] },
            { key: 'Foreign', name: 'Foreign', color: CHART_COLORS[3] },
          ]}
          yLabel="Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 1995, 2008] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The foreign share of US patent grants has converged toward parity with domestic
          filers. This convergence reflects the globalization of R&D: multinational firms
          file strategically in the US regardless of headquarter location, and the US patent
          system has become the de facto global standard for protecting high-value inventions.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Patent Concentration"
        caption="Share of all corporate patents held by the top 10, 50, and 100 organizations, by 5-year period."
        insight="Despite new entrants, the patent landscape remains dominated by large, well-resourced organizations that invest systematically in R&D."
        loading={concL}
      >
        <PWLineChart
          data={conc ?? []}
          xKey="period"
          lines={[
            { key: 'top10_share', name: 'Top 10', color: CHART_COLORS[0] },
            { key: 'top50_share', name: 'Top 50', color: CHART_COLORS[1] },
            { key: 'top100_share', name: 'Top 100', color: CHART_COLORS[2] },
          ]}
          yLabel="Share %"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent concentration has been remarkably stable: the top 100 organizations consistently
          hold roughly a quarter of all corporate patents. This suggests that while new players emerge,
          the patent system remains dominated by large, well-resourced entities that invest heavily
          in R&D.
        </p>
      </KeyInsight>

      {/* ── New deep analyses ── */}

      <SectionDivider label="Citation Impact" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s true influence. <GlossaryTooltip term="forward citations">Forward
          citations</GlossaryTooltip> -- how often a firm&apos;s patents are cited by subsequent inventions -- reveal
          the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        title="Citation Impact by Organization"
        caption="Average and median forward citations per patent for major patent holders. Limited to patents granted through 2020 for citation accumulation."
        insight="The gap between average and median citations distinguishes 'hit-driven' portfolios (high average, lower median) from consistently impactful innovators."
        loading={citL}
        height={900}
      >
        <PWBarChart
          data={citData}
          xKey="label"
          bars={[
            { key: 'avg_citations_received', name: 'Average Citations', color: CHART_COLORS[0] },
            { key: 'median_citations_received', name: 'Median Citations', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
          yLabel="Citations"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The gap between average and median citations is telling: most firms produce patents
          with modest citation impact, but a few generate highly cited inventions that pull the
          average upward. Firms with high average-to-median ratios have &quot;hit-driven&quot;
          portfolios -- a few breakthrough patents amid many routine ones -- while firms with
          closer average and median values produce more consistently impactful work.
        </p>
      </KeyInsight>

      <SectionDivider label="Technology Portfolios" />

      <Narrative>
        <p>
          The technology focus of major patent holders evolves over time. Some organizations
          have <StatCallout value="diversified" /> their portfolios, while others have become
          more specialized. Select an organization below to see how its technology mix has shifted.
        </p>
      </Narrative>

      {techOrgList.length > 0 && (
        <div className="my-4">
          <label htmlFor="org-select" className="mr-2 text-sm font-medium">
            Organization:
          </label>
          <select
            id="org-select"
            value={activeOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="rounded-md border bg-card px-3 py-1.5 text-sm"
          >
            {techOrgList.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
      )}

      <ChartContainer
        title={`Technology Portfolio: ${activeOrg || 'Loading...'}`}
        caption="CPC technology section shares by 5-year period. Shows how the organization's innovation portfolio has evolved."
        insight="Rapid shifts in a firm's technology mix — like Samsung's pivot from mechanical to electronics — signal deliberate strategic reorientation of R&D investment."
        loading={tevL}
      >
        <PWAreaChart
          data={techEvoPivot}
          xKey="period"
          areas={sectionKeys.map((key) => ({
            key,
            name: `${key}: ${CPC_SECTION_NAMES[key]}`,
            color: CPC_SECTION_COLORS[key],
          }))}
          stackedPercent
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Technology portfolio shifts reveal strategic pivots. When a firm&apos;s patent mix
          changes rapidly -- as when Samsung shifted from mechanical to electronics patents in
          the 1990s, or when pharmaceutical firms expanded into biotech -- it signals deliberate
          reorientation of R&D investment toward emerging market opportunities.
        </p>
      </KeyInsight>

      <SectionDivider label="Patent Portfolio Diversity" />
      <Narrative>
        <p>
          Are leading companies broadening or narrowing their innovation focus? We measure
          each organization&apos;s patent portfolio diversity using Shannon entropy across CPC
          technology subclasses. Higher entropy indicates a more diverse portfolio spanning
          many technology areas, while lower entropy signals specialization in a few domains.
        </p>
      </Narrative>
      <ChartContainer
        title="Portfolio Diversity (Shannon Entropy) for Top Assignees"
        caption="Shannon entropy across CPC subclasses per 5-year period. Higher values indicate broader technology portfolios."
        insight="The general upward trend in portfolio diversity suggests competitive advantage increasingly requires spanning multiple technology domains rather than deep specialization."
        loading={divL}
      >
        <PWLineChart
          data={diversityPivot}
          xKey="period"
          lines={diversityOrgs.slice(0, 10).map((org, i) => ({
            key: org,
            name: org.length > 25 ? org.slice(0, 22) + '...' : org,
            color: BUMP_COLORS[i % BUMP_COLORS.length],
          }))}
          yLabel="Shannon Entropy"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>
      <KeyInsight>
        <p>
          Most top patentees have steadily increased their portfolio diversity over time,
          reflecting a trend toward broader technology strategies. Samsung and IBM show
          particularly high entropy, consistent with their presence across electronics,
          software, and hardware. In contrast, pharmaceutical companies tend to maintain
          more focused portfolios. The general upward trend suggests that competitive
          advantage increasingly requires spanning multiple technology domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Collaboration Network Structure" />
      <Narrative>
        <p>
          How has the structure of innovation collaboration evolved? By analyzing co-inventor
          relationships as a network, we can measure how connected the innovation ecosystem is.
          The average degree (number of collaborators per inventor) and network density reveal
          whether innovation is becoming more or less collaborative over time.
        </p>
      </Narrative>
      <ChartContainer
        title="Co-Invention Network Metrics by Decade"
        caption="Summary statistics of the inventor collaboration network. Average degree measures the typical number of co-inventors per active inventor."
        insight="Rising average inventor degree reflects both larger team sizes and more extensive cross-organizational collaboration, creating a more interconnected innovation ecosystem."
        loading={nmL}
      >
        {networkMetrics && (
          <PWLineChart
            data={networkMetrics}
            xKey="decade_label"
            lines={[
              { key: 'avg_degree', name: 'Avg Co-Inventors (Degree)', color: CHART_COLORS[0] },
              { key: 'avg_team_size', name: 'Avg Team Size', color: CHART_COLORS[1] },
            ]}
            yLabel="Count"
            yFormatter={(v: number) => v.toFixed(1)}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          The innovation network has become dramatically more interconnected. Average inventor
          degree has risen sharply since the 1980s, reflecting both larger team sizes and more
          extensive cross-organizational collaboration. This &quot;small world&quot; effect means knowledge
          can diffuse faster through the network, but also raises questions about whether the
          era of the lone inventor is truly over.
        </p>
      </KeyInsight>

      <SectionDivider label="Bridge Inventors" />
      <Narrative>
        <p>
          Some inventors serve as critical bridges connecting otherwise separate organizations
          and technology communities. These &quot;bridge inventors&quot; have patented at three or more
          distinct organizations, potentially transferring knowledge and practices between firms.
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
          Bridge inventors who span multiple organizations play an outsized role in the
          innovation ecosystem. Their movement between firms creates channels for knowledge
          transfer that would not exist through patent citations alone, helping explain why
          geographic and organizational proximity matter so much for innovation.
        </p>
      </KeyInsight>

      <DataNote>
        Assignee data uses disambiguated identities from PatentsView. Primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Citation impact uses forward citations for patents granted through 2020.
        Co-patenting identifies patents with 2+ distinct organizational assignees.
        Portfolio diversity is measured using Shannon entropy across CPC subclasses per 5-year period. Network metrics are computed from co-inventor relationships on shared patents.
      </DataNote>

      <RelatedChapters currentChapter={3} />
      <ChapterNavigation currentChapter={3} />
    </div>
  );
}
