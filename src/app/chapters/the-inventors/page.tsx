'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import type { TeamSizePerYear, ProlificInventor, InventorEntry } from '@/lib/types';

interface GenderRow {
  year: number;
  gender: string;
  count: number;
}

interface GenderSectorRow {
  sector: string;
  gender: string;
  count: number;
}

function pivotGender(data: GenderRow[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.gender] = d.count; });
    const m = row['M'] || 0;
    const f = row['F'] || 0;
    row['female_pct'] = m + f > 0 ? (100 * f / (m + f)) : 0;
    return row;
  });
}

export default function Chapter5() {
  const { data: team, loading: tmL } = useChapterData<TeamSizePerYear[]>('chapter5/team_size_per_year.json');
  const { data: gender, loading: gnL } = useChapterData<GenderRow[]>('chapter5/gender_per_year.json');
  const { data: genderSector, loading: gsL } = useChapterData<GenderSectorRow[]>('chapter5/gender_by_sector.json');
  const { data: prolific, loading: prL } = useChapterData<ProlificInventor[]>('chapter5/prolific_inventors.json');
  const { data: entry, loading: enL } = useChapterData<InventorEntry[]>('chapter5/inventor_entry.json');

  const genderPivot = useMemo(() => gender ? pivotGender(gender) : [], [gender]);

  const genderBySector = useMemo(() => {
    if (!genderSector) return [];
    const sectorMap: Record<string, any> = {};
    genderSector.forEach((d) => {
      if (!sectorMap[d.sector]) sectorMap[d.sector] = { sector: d.sector };
      sectorMap[d.sector][d.gender] = d.count;
    });
    return Object.values(sectorMap).map((row: any) => {
      const m = row['M'] || 0;
      const f = row['F'] || 0;
      return { ...row, female_pct: m + f > 0 ? +(100 * f / (m + f)).toFixed(1) : 0 };
    }).sort((a: any, b: any) => b.female_pct - a.female_pct);
  }, [genderSector]);

  const topInventors = useMemo(() => {
    if (!prolific) return [];
    return prolific.slice(0, 30).map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`.trim(),
    }));
  }, [prolific]);

  const topInventorName = prolific?.[0]
    ? `${prolific[0].first_name} ${prolific[0].last_name}`.trim()
    : 'Shunpei Yamazaki';

  return (
    <div>
      <ChapterHeader
        number={5}
        title="The Inventors"
        subtitle="The people behind the patents"
      />

      <Narrative>
        <p>
          Behind every patent is at least one inventor. Over the past five decades,
          inventing has become increasingly collaborative. Solo inventors have given
          way to larger teams, and the gender composition of the inventor workforce
          has slowly shifted. <StatCallout value={topInventorName} /> holds the record
          for most patents granted to a single inventor.
        </p>
      </Narrative>

      <ChartContainer
        title="Team Size Over Time"
        caption="Average inventor team size and percentage of solo vs. large (5+) team patents."
        loading={tmL}
      >
        <PWLineChart
          data={team ?? []}
          xKey="year"
          lines={[
            { key: 'avg_team_size', name: 'Avg Team Size', color: CHART_COLORS[0] },
            { key: 'solo_pct', name: 'Solo %', color: CHART_COLORS[2] },
            { key: 'large_team_pct', name: 'Large Team (5+) %', color: CHART_COLORS[3] },
          ]}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The average team size has grown from roughly 1.5 inventors per patent in
          the late 1970s to over 2.5 today. The share of solo-inventor patents has
          dropped considerably, while patents with five or more inventors have become
          more common -- reflecting the increasing complexity and interdisciplinarity
          of modern innovation.
        </p>
      </Narrative>

      <ChartContainer
        title="Female Inventor Share Over Time"
        caption="Percentage of inventor-patent instances attributed to female inventors."
        loading={gnL}
      >
        <PWLineChart
          data={genderPivot}
          xKey="year"
          lines={[
            { key: 'female_pct', name: 'Female %', color: CHART_COLORS[4] },
          ]}
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      {genderBySector.length > 0 && (
        <ChartContainer
          title="Female Inventor Share by WIPO Sector"
          caption="Percentage of inventor instances that are female, by technology sector."
          loading={gsL}
          height={300}
        >
          <PWBarChart
            data={genderBySector}
            xKey="sector"
            bars={[{ key: 'female_pct', name: 'Female %', color: CHART_COLORS[4] }]}
            layout="vertical"
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        </ChartContainer>
      )}

      <ChartContainer
        title="Most Prolific Inventors"
        caption="Top 30 inventors by total utility patents granted, 1976-2025."
        loading={prL}
        height={600}
      >
        <PWBarChart
          data={topInventors}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <ChartContainer
        title="New Inventors Entering the System"
        caption="Number of inventors filing their first US patent each year."
        loading={enL}
      >
        <PWAreaChart
          data={entry ?? []}
          xKey="year"
          areas={[{ key: 'new_inventors', name: 'New Inventors', color: CHART_COLORS[1] }]}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The flow of new inventors into the patent system has grown dramatically,
          peaking in recent years. This reflects both the expansion of technology
          industries and the increasing globalization of R&D, as inventors from
          around the world file patents through the US system.
        </p>
      </Narrative>

      <DataNote>
        Gender data is based on PatentsView gender attribution using first names.
        Team size counts all listed inventors per patent. Inventor disambiguation
        is provided by PatentsView.
      </DataNote>

      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
