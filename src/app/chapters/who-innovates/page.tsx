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
import { PWBumpChart } from '@/components/charts/PWBumpChart';
import { PWNetworkGraph } from '@/components/charts/PWNetworkGraph';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type {
  AssigneeTypePerYear, TopAssignee, OrgOverTime, DomesticVsForeign, Concentration,
  NetworkData, FirmCitationImpact, FirmTechEvolution,
} from '@/lib/types';

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
  const { data: network, loading: netL } = useChapterData<NetworkData>('chapter3/firm_collaboration_network.json');
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');

  const [selectedOrg, setSelectedOrg] = useState<string>('');

  const typePivot = useMemo(() => types ? pivotByCategory(types) : [], [types]);
  const categories = useMemo(() => types ? [...new Set(types.map((d) => d.category))] : [], [types]);
  const originPivot = useMemo(() => dvf ? pivotByOrigin(dvf) : [], [dvf]);

  const topOrgs = useMemo(() => {
    if (!top) return [];
    return top.slice(0, 25).map((d) => ({
      ...d,
      label: d.organization.length > 30 ? d.organization.slice(0, 27) + '...' : d.organization,
    }));
  }, [top]);

  const topOrgName = top?.[0]?.organization ?? 'IBM';

  // Citation impact: top 30 by avg
  const citData = useMemo(() => {
    if (!citImpact) return [];
    return citImpact.slice(0, 30).map((d) => ({
      ...d,
      label: d.organization.length > 28 ? d.organization.slice(0, 25) + '...' : d.organization,
    }));
  }, [citImpact]);

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

  return (
    <div>
      <ChapterHeader
        number={3}
        title="Who Innovates?"
        subtitle="The organizations driving patent activity"
      />

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
        />
      </ChartContainer>

      <ChartContainer
        title="Top 25 Patent-Holding Organizations"
        caption="Ranked by total utility patents granted, 1976-2025."
        loading={topL}
        height={600}
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

      {orgsTime && orgsTime.length > 0 && (
        <ChartContainer
          title="Top Organizations: Rank Over Time"
          caption="Annual ranking of the top patent-holding organizations by yearly grant count."
          loading={orgL}
          height={500}
        >
          <PWBumpChart
            data={orgsTime.filter((d) => d.rank <= 15)}
            nameKey="organization"
            yearKey="year"
            rankKey="rank"
            maxRank={15}
          />
        </ChartContainer>
      )}

      <ChartContainer
        title="US vs Foreign Assignees"
        caption="Patents by US-based vs foreign-based primary assignees."
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
        />
      </ChartContainer>

      <ChartContainer
        title="Patent Concentration"
        caption="Share of all corporate patents held by the top 10, 50, and 100 organizations, by 5-year period."
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

      {/* ── New deep analyses ── */}

      <SectionDivider label="Citation Impact" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s true influence. Forward
          citations -- how often a firm&apos;s patents are cited by subsequent inventions -- reveal
          the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        title="Citation Impact: Top 30 Organizations"
        caption="Average and median forward citations per patent for the top 30 patent holders. Limited to patents granted through 2020 for citation accumulation."
        loading={citL}
        height={600}
      >
        <PWBarChart
          data={citData}
          xKey="label"
          bars={[
            { key: 'avg_citations_received', name: 'Avg Citations', color: CHART_COLORS[0] },
            { key: 'median_citations_received', name: 'Median Citations', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
          yLabel="Citations"
        />
      </ChartContainer>

      <SectionDivider label="Collaboration Network" />

      <Narrative>
        <p>
          Innovation does not happen in isolation. Many patents list multiple assignee organizations,
          revealing patterns of <StatCallout value="cross-firm collaboration" />. The network below
          shows which top patent holders frequently co-patent together.
        </p>
      </Narrative>

      <ChartContainer
        title="Co-Patenting Network"
        caption="Co-patenting network among top 50 patent holders. Node size = total patents; edges = shared patents (≥5)."
        loading={netL}
        height={500}
      >
        {network ? (
          <PWNetworkGraph
            nodes={network.nodes}
            edges={network.edges}
            nodeColor={CHART_COLORS[0]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Cross-firm collaboration is concentrated among companies in related technology domains.
          Electronics giants, pharmaceutical companies, and automotive firms each form distinct
          clusters within the co-patenting network.
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
        loading={tevL}
        height={400}
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

      <DataNote>
        Assignee data uses disambiguated identities from PatentsView. Primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Citation impact uses forward citations for patents granted through 2020.
        Co-patenting identifies patents with 2+ distinct organizational assignees.
      </DataNote>

      <ChapterNavigation currentChapter={3} />
    </div>
  );
}
