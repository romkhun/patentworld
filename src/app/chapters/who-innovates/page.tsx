'use client';

import { useMemo } from 'react';
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
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import type { AssigneeTypePerYear, TopAssignee, OrgOverTime, DomesticVsForeign, Concentration } from '@/lib/types';

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
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <DataNote>
        Assignee data uses disambiguated identities from PatentsView. Primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
      </DataNote>

      <ChapterNavigation currentChapter={3} />
    </div>
  );
}
