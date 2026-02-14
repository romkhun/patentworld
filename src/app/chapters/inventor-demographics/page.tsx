'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type {
  InventorEntry,
  FirstTimeInventor,
  GenderTeamQuality, GenderSectionTrend,
} from '@/lib/types';
import Link from 'next/link';

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

export default function InventorDemographics() {
  const { data: gender, loading: gnL } = useChapterData<GenderRow[]>('chapter5/gender_per_year.json');
  const { data: genderSector, loading: gsL } = useChapterData<GenderSectorRow[]>('chapter5/gender_by_sector.json');
  const { data: entry, loading: enL } = useChapterData<InventorEntry[]>('chapter5/inventor_entry.json');
  const { data: firstTime, loading: ftL } = useChapterData<FirstTimeInventor[]>('chapter5/first_time_inventors.json');
  const { data: genderTeamQuality } = useChapterData<GenderTeamQuality[]>('chapter5/gender_team_quality.json');
  const { data: genderSectionTrend, loading: gstL } = useChapterData<GenderSectionTrend[]>('chapter5/gender_section_trend.json');

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

  const { genderTrendPivot, genderTrendSections } = useMemo(() => {
    if (!genderSectionTrend) return { genderTrendPivot: [], genderTrendSections: [] };
    const sections = [...new Set(genderSectionTrend.map(d => d.section))].sort();
    const periods = [...new Set(genderSectionTrend.map(d => d.period))].sort();
    const pivoted = periods.map(period => {
      const row: Record<string, any> = { period };
      genderSectionTrend.filter(d => d.period === period).forEach(d => {
        row[d.section] = d.female_pct;
      });
      return row;
    });
    return { genderTrendPivot: pivoted, genderTrendSections: sections };
  }, [genderSectionTrend]);

  return (
    <div>
      <ChapterHeader
        number={17}
        title="Inventor Demographics"
        subtitle="Gender composition and new-entrant dynamics of the inventor workforce"
      />

      <KeyFindings>
        <li>The female share of inventor instances has risen steadily from 2.8% in 1976 to 14.9% in 2025, but remains well below parity with substantial variation across technology fields.</li>
        <li>Chemistry leads female inventor representation at 14.6%, while Mechanical Engineering is lowest at 5.4%, closely mirroring STEM educational pipeline composition.</li>
        <li>Annual first-time inventor entries rose from 35,126 in 1979 to a peak of 140,490 in 2019, yet the share of patents including a first-time inventor fell from 71% to 26%.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Female inventor representation has increased 5.3-fold from 2.8% to 14.9% over five decades, with Chemistry and Human Necessities leading and Mechanical Engineering lagging. The absolute number of first-time inventors peaked at 140,490 in 2019, but their share of total patent activity has declined from 71% to 26%, indicating the system increasingly favors experienced, repeat filers.
        </p>
      </aside>

      <Narrative>
        <p>
          Every patent lists at least one inventor. Over the past five decades,
          the inventor workforce has shifted in composition, productivity, and career dynamics.
          This chapter examines the demographic profile of inventors -- their gender composition
          and the flow of new entrants -- revealing who participates in the patent system and how
          that population has changed over time.
        </p>
        <p>
          Progress on gender diversity has been measurable but slow, with female representation varying
          widely across technology fields in patterns that mirror the composition of STEM educational
          pipelines. Meanwhile, the declining prevalence of first-time inventors raises important
          questions about barriers to entry and the increasing professionalization of patenting.
        </p>
      </Narrative>

      <SectionDivider label="Gender Composition" />

      <ChartContainer
        id="fig-inventors-female-share"
        title="Female Inventor Share Rose Steadily from 2.8% in 1976 to 14.9% in 2025"
        subtitle="Percentage of inventor-patent instances attributed to female inventors, measured annually, 1976-2025"
        caption="This chart tracks the percentage of inventor-patent instances attributed to female inventors over time. The data demonstrate a consistent upward trend from 2.8% in 1976 to 14.9% in 2025, an increase of 5.3-fold over the study period."
        insight="The persistent gender gap in patenting reflects broader systemic barriers in STEM fields, spanning educational pipelines, workplace culture, and institutional support structures."
        loading={gnL}
      >
        <PWLineChart
          data={genderPivot}
          xKey="year"
          lines={[
            { key: 'female_pct', name: 'Female %', color: CHART_COLORS[4] },
          ]}
          yLabel="Female Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Progress on gender diversity in patenting has been measurable but gradual. The female share
          increased from 2.8% in 1976 to 14.9% in 2025. Despite decades of initiatives to broaden
          participation in STEM, the female share of inventors on US patents remains well below parity.
          At the observed rate of change, achieving equal representation would require several additional decades.
        </p>
      </Narrative>

      {genderBySector.length > 0 && (
        <ChartContainer
          id="fig-inventors-gender-by-sector"
          title="Chemistry Leads Female Inventor Representation at 14.6%; Mechanical Engineering Lowest at 5.4%"
          subtitle="Female inventor share by WIPO technology sector, showing cross-sector variation in gender representation"
          caption="This chart displays the percentage of inventor instances attributed to female inventors across WIPO technology sectors. Chemistry and pharmaceuticals exhibit the highest female representation, while mechanical engineering and other fields demonstrate the lowest shares."
          insight="The cross-sector variation in gender diversity closely mirrors the composition of STEM degree programs, indicating that educational pipeline differences are strongly associated with the gender gap in patenting."
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
          Female representation among US patent inventors has increased steadily from 2.8% to 14.9%.
          Chemistry and pharmaceutical fields exhibit the highest gender diversity, while mechanical engineering
          and other fields demonstrate the lowest representation -- a pattern that closely mirrors the gender
          composition of STEM degree programs.
        </p>
      </KeyInsight>

      <SectionDivider label="The Gender Innovation Gap" />
      <Narrative>
        <p>
          Disaggregating further beyond aggregate gender trends reveals substantive differences in
          the technology areas where women innovate and the performance of gender-diverse teams.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-gender-by-cpc"
        title="Female Inventor Shares Range from 8.2% (Fixed Constructions) to 23.4% (Chemistry) Across CPC Sections"
        subtitle="Female inventor share by CPC section and 5-year period, showing technology-specific gender variation over time"
        caption="This chart displays the percentage of inventors who are female within each CPC section, measured in 5-year periods. Chemistry and Human Necessities consistently exhibit the highest female representation, while Electricity and Mechanical Engineering demonstrate the lowest."
        insight="The technology-specific gender gap mirrors the composition of STEM degree pipelines. Fields with higher female enrollment, such as chemistry and life sciences, demonstrate correspondingly higher female inventor representation."
        loading={gstL}
      >
        {genderTrendPivot.length > 0 && (
          <PWLineChart
            data={genderTrendPivot}
            xKey="period"
            lines={genderTrendSections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Female Share (%)"
            yFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
        )}
      </ChartContainer>
      {genderTeamQuality && genderTeamQuality.length > 0 && (
        <div className="max-w-2xl mx-auto my-6">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Patent Quality by Team Gender Composition (2000-2020)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Team Composition</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Patents</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Average Citations</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Median Citations</th>
              </tr>
            </thead>
            <tbody>
              {genderTeamQuality.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium">{row.team_gender}</td>
                  <td className="text-right py-2 px-3 font-mono">{row.patent_count.toLocaleString()}</td>
                  <td className="text-right py-2 px-3 font-mono">{row.avg_citations.toFixed(1)}</td>
                  <td className="text-right py-2 px-3 font-mono">{row.median_citations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <KeyInsight>
        <p>
          Female inventor participation has increased across all technology areas, though
          significant disparities persist. Chemistry &amp; Metallurgy and Human Necessities exhibit the
          highest female inventor shares, while Electricity and Mechanical Engineering demonstrate
          the lowest representation. All-male teams produce the highest average citation impact (14.2 citations), followed by mixed-gender teams (12.6) and all-female teams (9.5), indicating that team composition correlates with citation outcomes in complex ways.
        </p>
      </KeyInsight>

      <SectionDivider label="New Entrants" />

      <Narrative>
        <p>
          Beyond gender composition, the flow of new entrants into the patent system shapes who the inventor workforce is at any given time.
          Tracking both the absolute number of first-time filers and their share of total patent activity reveals
          whether the system continues to attract new talent or is increasingly dominated by repeat inventors.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-first-time-entries"
        title="Annual First-Time Inventor Entries Rose from 35,126 in 1979 to a Peak of 140,490 in 2019"
        subtitle="Number of inventors filing their first US patent each year, measuring new entrant inflow, 1976-2025"
        caption="This chart displays the number of inventors filing their first US patent in each year. The data indicate a sustained upward trend, with annual first-time entries rising from 35,126 in 1979 to a peak of 140,490 in 2019."
        insight="The sustained inflow of new inventors serves as an indicator of the innovation ecosystem's capacity for renewal, demonstrating continued broadening of the inventor base despite increasing specialization."
        loading={enL}
      >
        <PWAreaChart
          data={entry ?? []}
          xKey="year"
          areas={[{ key: 'new_inventors', name: 'New Inventors', color: CHART_COLORS[1] }]}
          yLabel="Number of Inventors"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The flow of new inventors into the patent system has expanded substantially,
          reaching its highest levels in the late 2010s. This growth reflects both the expansion of technology
          industries and the increasing globalization of research and development, as inventors from
          around the world file patents through the US system.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-first-time-share"
        title="The Share of Patents Including a First-Time Inventor Fell from 71% to 26%, 1977-2025"
        subtitle="Percentage of patents each year listing at least one first-time inventor, measuring newcomer prevalence, 1977-2025"
        caption="This chart displays the percentage of patents each year listing at least one inventor who has not appeared on a prior patent. The downward trend suggests a growing concentration of patenting activity among experienced, repeat inventors."
        insight="The declining share of first-time inventors suggests the patent system increasingly favors experienced, repeat filers, raising questions regarding potential barriers to entry for newcomers."
        loading={ftL}
      >
        {firstTime && (
          <PWLineChart
            data={firstTime}
            xKey="year"
            lines={[
              { key: 'debut_pct', name: 'Has First-Time Inventor (%)', color: CHART_COLORS[4] },
            ]}
            yLabel="Share (%)"
            yFormatter={(v: number) => `${v.toFixed(0)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          While the absolute number of new inventors entering the patent system has grown substantially,
          patent grants have grown even faster (5.3-fold versus 2.8-fold since 1980, as of 2024), and the share of
          patents including a first-time inventor has declined from 71% to 26%. This divergence indicates that rising team sizes and repeat
          inventors drive much of the expansion, even as the continued inflow of first-time
          inventors sustains the renewal capacity of the innovation ecosystem.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The demographic patterns documented here -- rising but uneven gender diversity and a declining share of newcomers -- set the stage for understanding what these inventors actually produce. The next chapter, <Link href="/chapters/inventor-productivity" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Inventor Productivity</Link>, examines team size trends, prolific inventors, and the relationship between patent volume and citation impact.
        </p>
      </Narrative>

      <DataNote>
        Gender data is based on PatentsView gender attribution using first names.
        First-time inventors are identified by their earliest patent filing date.
        Gender analysis uses PatentsView&apos;s gender_code field.
      </DataNote>

      <RelatedChapters currentChapter={17} />
      <ChapterNavigation currentChapter={17} />
    </div>
  );
}
