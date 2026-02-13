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
import Link from 'next/link';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import type {
  TeamSizePerYear, ProlificInventor, InventorEntry,
  StarInventorImpact, InventorLongevity,
} from '@/lib/types';

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

export default function Chapter4() {
  const { data: team, loading: tmL } = useChapterData<TeamSizePerYear[]>('chapter5/team_size_per_year.json');
  const { data: gender, loading: gnL } = useChapterData<GenderRow[]>('chapter5/gender_per_year.json');
  const { data: genderSector, loading: gsL } = useChapterData<GenderSectorRow[]>('chapter5/gender_by_sector.json');
  const { data: prolific, loading: prL } = useChapterData<ProlificInventor[]>('chapter5/prolific_inventors.json');
  const { data: entry, loading: enL } = useChapterData<InventorEntry[]>('chapter5/inventor_entry.json');
  const { data: starImpact, loading: siL } = useChapterData<StarInventorImpact[]>('chapter5/star_inventor_impact.json');
  const { data: longevity, loading: lgL } = useChapterData<InventorLongevity[]>('chapter5/inventor_longevity.json');

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
    return prolific.map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`.trim(),
    }));
  }, [prolific]);

  const topInventorName = prolific?.[0]
    ? `${prolific[0].first_name} ${prolific[0].last_name}`.trim()
    : 'Shunpei Yamazaki';

  const starData = useMemo(() => {
    if (!starImpact) return [];
    return starImpact.slice(0, 100).map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`.trim(),
    }));
  }, [starImpact]);

  // Longevity: pivot to line chart format
  const longevityCohorts = useMemo(() => {
    if (!longevity) return { data: [], cohorts: [] };
    const cohorts = [...new Set(longevity.map((d) => d.cohort))].sort();
    const maxLen = Math.max(...longevity.map((d) => d.career_length));
    const data = [];
    for (let cl = 0; cl <= maxLen; cl++) {
      const row: any = { career_length: cl };
      cohorts.forEach((cohort) => {
        const entry = longevity.find((d) => d.cohort === cohort && d.career_length === cl);
        if (entry) row[cohort] = entry.survival_pct;
      });
      data.push(row);
    }
    return { data, cohorts };
  }, [longevity]);

  return (
    <div>
      <ChapterHeader
        number={4}
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
        caption="Average team size, solo-inventor share, and large-team (5+) share. Values share the same y-axis."
        loading={tmL}
      >
        <PWLineChart
          data={team ?? []}
          xKey="year"
          lines={[
            { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[0] },
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

      <KeyInsight>
        <p>
          The shift from solo to team invention mirrors broader trends in science and engineering.
          The solo-inventor share has fallen from over 50% to under 20%, while patents with five or more
          inventors have tripled. Complex modern technologies increasingly require diverse expertise
          that no single inventor can provide.
        </p>
      </KeyInsight>

      <SectionDivider label="Gender" />

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
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Progress on gender diversity in patenting has been real but slow. Despite decades of
          initiatives to broaden participation in STEM, the female share of inventors on US
          patents remains well below parity. At the current rate of change, achieving equal
          representation would take many more decades.
        </p>
      </Narrative>

      {genderBySector.length > 0 && (
        <ChartContainer
          title="Female Inventor Share by WIPO Sector"
          caption="Percentage of inventor instances that are female, by technology sector."
          loading={gsL}
          height={500}
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

      <KeyInsight>
        <p>
          Female representation among US patent inventors has grown steadily but remains below 15%.
          Chemistry and pharmaceutical fields lead in gender diversity, while electrical engineering
          and mechanical engineering lag behind -- a pattern that closely mirrors the gender
          composition of STEM degree programs.
        </p>
      </KeyInsight>

      <SectionDivider label="Top Inventors" />

      <ChartContainer
        title="Most Prolific Inventors"
        caption="Inventors ranked by total utility patents granted, 1976-2025."
        loading={prL}
        height={1800}
      >
        <PWBarChart
          data={topInventors}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <Narrative>
        <p>
          The most prolific inventors are overwhelmingly concentrated in electronics and
          semiconductor fields, where rapid design iteration and modular innovation enable
          extraordinarily high patent output. Many top inventors are associated with large
          Japanese and Korean electronics firms that emphasize systematic patent generation.
        </p>
      </Narrative>

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

      <KeyInsight>
        <p>
          The number of new inventors entering the patent system each year has outpaced the
          growth in patent grants, suggesting that the inventor base is broadening even as
          individual patent output varies widely. This expanding base of first-time inventors
          is a healthy sign for the innovation ecosystem, indicating continued inflows of
          fresh talent and new ideas.
        </p>
      </KeyInsight>

      {/* ── New deep analyses ── */}

      <SectionDivider label="Inventor Impact" />

      <Narrative>
        <p>
          Being prolific does not necessarily mean being impactful. Forward citations --
          how often an inventor&apos;s patents are cited by others -- reveal whether their
          innovations serve as <StatCallout value="building blocks" /> for future inventions.
        </p>
      </Narrative>

      <ChartContainer
        title="Star Inventor Impact by Citation Average"
        caption="Average and median forward citations per patent for the top 100 prolific inventors. Limited to patents granted through 2020."
        loading={siL}
        height={1800}
      >
        <PWBarChart
          data={starData}
          xKey="label"
          bars={[
            { key: 'avg_citations', name: 'Average Citations', color: CHART_COLORS[0] },
            { key: 'median_citations', name: 'Median Citations', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
          yLabel="Citations"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Being prolific and being impactful are not the same thing. Some inventors with
          fewer total patents generate significantly higher citation impact per patent,
          suggesting deeper influence on their fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Career Longevity" />

      <Narrative>
        <p>
          How long do inventors remain active in the patent system? Career survival curves
          show what fraction of inventors who entered in each 5-year cohort continue
          patenting over time -- revealing patterns of <StatCallout value="persistence and attrition" />.
        </p>
      </Narrative>

      <ChartContainer
        title="Inventor Career Survival by Entry Cohort"
        caption="Percentage of inventors still active (with at least one patent) at each career length, by 5-year entry cohort."
        loading={lgL}
      >
        <PWLineChart
          data={longevityCohorts.data}
          xKey="career_length"
          lines={longevityCohorts.cohorts.map((cohort, i) => ({
            key: cohort,
            name: cohort,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          xLabel="Career Length (Years)"
          yLabel="Survival %"
          yFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The survival curves reveal a bimodal inventor population: a large group of
          &quot;one-shot&quot; inventors who patent once and never return (the steep initial
          drop), and a smaller group of persistent innovators who remain active for decades.
          This pattern is consistent across all entry cohorts, suggesting a fundamental
          division between occasional and career inventors.
        </p>
      </KeyInsight>

      <div className="my-8 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Inventor collaboration network analysis has moved to its own dedicated chapter.{' '}
        <Link href="/chapters/collaboration-networks/" className="text-primary underline underline-offset-2 hover:text-primary/80">
          See Chapter 6: Collaboration Networks &rarr;
        </Link>
      </div>

      <DataNote>
        Gender data is based on PatentsView gender attribution using first names.
        Team size counts all listed inventors per patent. Inventor disambiguation
        is provided by PatentsView. Citation impact uses forward citations for
        patents granted through 2020. Career longevity tracks the span from first
        to last patent year per inventor.
      </DataNote>

      <ChapterNavigation currentChapter={4} />
    </div>
  );
}
