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
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type {
  TeamSizePerYear, ProlificInventor, InventorEntry,
  StarInventorImpact, InventorLongevity,
  SuperstarConcentration, SoloInventorTrend, SoloInventorBySection,
  FirstTimeInventor, InventorMobilityCitation, InventorMobilityByDecade,
  GenderByTech, GenderTeamQuality, GenderSectionTrend,
  InventorSegment, InventorSegmentTrend,
  InventorCareerCurve, InventorCareerDuration, InventorDrift, ComebackInventor,
} from '@/lib/types';
import { formatCompact } from '@/lib/formatters';

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
  const { data: superstar, loading: ssL } = useChapterData<SuperstarConcentration[]>('chapter5/superstar_concentration.json');
  const { data: solo, loading: soloL } = useChapterData<SoloInventorTrend[]>('chapter5/solo_inventors.json');
  useChapterData<SoloInventorBySection[]>('chapter5/solo_inventors_by_section.json');
  const { data: firstTime, loading: ftL } = useChapterData<FirstTimeInventor[]>('chapter5/first_time_inventors.json');
  const { data: mobility } = useChapterData<InventorMobilityCitation[]>('chapter5/inventor_mobility.json');
  const { data: mobilityByDecade, loading: mbdL } = useChapterData<InventorMobilityByDecade[]>('chapter5/inventor_mobility_by_decade.json');
  useChapterData<GenderByTech[]>('chapter5/gender_by_tech.json');
  const { data: genderTeamQuality } = useChapterData<GenderTeamQuality[]>('chapter5/gender_team_quality.json');
  const { data: genderSectionTrend, loading: gstL } = useChapterData<GenderSectionTrend[]>('chapter5/gender_section_trend.json');
  const { data: segments, loading: segL } = useChapterData<InventorSegment[]>('chapter5/inventor_segments.json');
  const { data: segTrend, loading: stL } = useChapterData<InventorSegmentTrend[]>('chapter5/inventor_segments_trend.json');

  // D1, D2, D3: Inventor career analyses
  const { data: careerData, loading: cdL } = useChapterData<{ curves: InventorCareerCurve[]; durations: InventorCareerDuration[] }>('company/inventor_careers.json');
  const { data: driftData, loading: drL } = useChapterData<InventorDrift[]>('company/inventor_drift.json');
  const { data: comebackData, loading: cbL } = useChapterData<ComebackInventor[]>('company/comeback_inventors.json');

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
        number={4}
        title="The Inventors"
        subtitle="The people behind the patents"
      />

      <KeyFindings>
        <li>Inventor team sizes have grown dramatically — the average patent now lists 2-3 inventors, up from predominantly solo inventions in the 1970s.</li>
        <li>Women&apos;s share of patents has increased but remains below 15%, indicating a persistent gender gap in patented innovation.</li>
        <li>The most prolific inventors hold hundreds of patents each, concentrated in electronics and computing fields.</li>
        <li>First-time inventor rates have declined, suggesting the patent system increasingly favors experienced, repeat inventors within organizations.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Average patent team size has grown from roughly 1.5 inventors in the late 1970s to over 2.5 today, while the solo-inventor share has fallen from over 50% to under 20%. Women&apos;s share of inventor instances has increased but remains below 15%, with chemistry and pharma leading and electrical engineering lagging. The top 5% of inventors account for a growing share of total output, and mobile inventors who move between organizations consistently produce higher-citation patents than their non-mobile peers.
        </p>
      </aside>

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
        insight="The shift from solo invention to team-based R&D is one of the defining trends of modern innovation, reflecting the increasing complexity of technology."
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
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
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
        insight="The persistent gender gap in patenting reflects broader systemic barriers in STEM fields, from educational pipelines to workplace culture."
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
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
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
          insight="Gender diversity varies significantly across technology sectors, with chemistry and pharmaceuticals leading while electrical and mechanical engineering lag behind."
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
        insight="The concentration of patents among a small number of prolific inventors raises questions about whether the patent system rewards individual genius or institutional resources."
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
        insight="The steady inflow of new inventors is a barometer for the health of the innovation ecosystem, indicating continued broadening of the inventor base despite increasing specialization."
        loading={enL}
      >
        <PWAreaChart
          data={entry ?? []}
          xKey="year"
          areas={[{ key: 'new_inventors', name: 'New Inventors', color: CHART_COLORS[1] }]}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
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
          Being prolific does not necessarily mean being impactful. <GlossaryTooltip term="forward citations">Forward citations</GlossaryTooltip> --
          how often an inventor&apos;s patents are cited by others -- reveal whether their
          innovations serve as <StatCallout value="building blocks" /> for future inventions.
        </p>
      </Narrative>

      <ChartContainer
        title="Star Inventor Impact by Citation Average"
        caption="Average and median forward citations per patent for the top 100 prolific inventors. Limited to patents granted through 2020."
        insight="Prolificacy and impact are distinct dimensions of inventor performance. Some high-volume inventors generate modest citations per patent, while others achieve exceptional influence with fewer patents."
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
        insight="The steep initial drop in survival curves reveals that most inventors patent only once. Those who persist beyond the first few years tend to have long, productive careers."
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

      <SectionDivider label="Superstar Inventor Concentration" />
      <Narrative>
        <p>
          What share of all patents comes from the most prolific inventors? Tracking the
          concentration of patenting activity among the top 1% and top 5% of inventors
          by cumulative patent count reveals whether innovation is becoming more or less
          democratized over time.
        </p>
      </Narrative>
      <ChartContainer
        title="Share of Patents by Top Inventors"
        caption="Percentage of patents each year from the top 1% and top 5% of inventors (by cumulative patent count)."
        insight="Rising concentration of patents among top inventors suggests that innovation is increasingly driven by professional, repeat inventors rather than one-time contributors."
        loading={ssL}
      >
        {superstar && (
          <PWLineChart
            data={superstar}
            xKey="year"
            lines={[
              { key: 'top1pct_share', name: 'Top 1% Share', color: CHART_COLORS[0] },
              { key: 'top5pct_share', name: 'Top 5% Share', color: CHART_COLORS[1] },
            ]}
            yLabel="Share (%)"
            yFormatter={(v: number) => `${v.toFixed(0)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Superstar concentration has increased substantially over the decades. The top 5%
          of inventors now account for a growing share of total patent output, suggesting
          that patenting is increasingly the province of repeat, professional inventors
          rather than one-time innovators. This parallels trends in academic publishing
          and other knowledge-intensive fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Solo Inventors: An Endangered Species?" />
      <Narrative>
        <p>
          The lone inventor working in a garage is a powerful cultural archetype. But is
          solo invention actually disappearing? Tracking the share of patents with a
          single inventor reveals how the nature of innovation has shifted toward
          team-based approaches.
        </p>
      </Narrative>
      <ChartContainer
        title="Solo Inventor Share Over Time"
        caption="Percentage of utility patents with a single named inventor."
        insight="The decline of solo invention underscores how modern technology development increasingly demands diverse, interdisciplinary expertise that no single person can provide."
        loading={soloL}
      >
        {solo && (
          <PWLineChart
            data={solo}
            xKey="year"
            lines={[
              { key: 'solo_pct', name: 'Solo Inventor Share (%)', color: CHART_COLORS[3] },
            ]}
            yLabel="Share (%)"
            yFormatter={(v: number) => `${v.toFixed(0)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Solo invention has declined dramatically from over half of all patents in the
          late 1970s to a small minority today. The complexity of modern technology
          increasingly requires diverse expertise that no single person can master. Yet
          solo inventors persist, particularly in areas like Textiles and Fixed
          Constructions where individual craftspeople and architects continue to innovate
          independently.
        </p>
      </KeyInsight>

      <SectionDivider label="First-Time Inventors" />
      <Narrative>
        <p>
          Is the patent system bringing in fresh talent, or is it increasingly dominated
          by repeat players? We track the share of patents each year that include at
          least one inventor filing for the first time.
        </p>
      </Narrative>
      <ChartContainer
        title="Share of Patents with First-Time Inventors"
        caption="Percentage of patents each year with at least one inventor who has never appeared on a prior patent."
        insight="The declining share of first-time inventors suggests the patent system increasingly favors experienced, repeat inventors, raising questions about barriers to entry for newcomers."
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
          Despite the growing dominance of repeat inventors, a substantial share of patents
          each year still includes at least one newcomer. This pipeline of first-time
          inventors is critical for the health of the innovation system, ensuring that
          fresh perspectives and new ideas continue to enter the patent landscape.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventor Mobility" />
      <Narrative>
        <p>
          Do inventors who move between organizations produce higher-impact work?
          Comparing forward citation counts for mobile inventors (those who have patented
          at multiple organizations) versus non-mobile inventors reveals whether career
          mobility is associated with innovation quality.
        </p>
      </Narrative>
      <ChartContainer
        title="Inventor Mobility Rate by Decade"
        caption="Percentage of prolific inventors (5+ patents per decade) who patented at multiple organizations."
        insight="Rising inventor mobility reflects the growing fluidity of the technology labor market, where career moves between organizations serve as channels for knowledge transfer."
        loading={mbdL}
      >
        {mobilityByDecade && (
          <PWLineChart
            data={mobilityByDecade}
            xKey="decade_label"
            lines={[
              { key: 'mobility_rate', name: 'Mobility Rate (%)', color: CHART_COLORS[5] },
            ]}
            yLabel="Rate (%)"
            yFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
        )}
      </ChartContainer>
      {mobility && mobility.length > 0 && (
        <div className="max-w-2xl mx-auto my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Group</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Patents</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Avg Citations</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Median Citations</th>
              </tr>
            </thead>
            <tbody>
              {mobility.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium">{row.mobility}</td>
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
          Mobile inventors consistently produce patents with higher citation impact than
          their non-mobile peers. This suggests that exposure to multiple organizational
          contexts enriches an inventor&apos;s knowledge base and leads to more impactful
          innovations. The mobility rate has increased over time, driven by the growing
          fluidity of the technology labor market.
        </p>
      </KeyInsight>

      <SectionDivider label="The Gender Innovation Gap" />
      <Narrative>
        <p>
          Beyond overall gender trends, deeper analysis reveals important differences in
          where women innovate, how gender-diverse teams perform, and how female
          participation varies across technology fields.
        </p>
      </Narrative>
      <ChartContainer
        title="Female Inventor Share by Technology Area"
        caption="Percentage of inventors who are female, by CPC section, in 5-year periods."
        insight="The technology-specific gender gap mirrors the composition of STEM degree pipelines. Fields with higher female enrollment — chemistry, life sciences — show higher female inventor representation."
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
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Avg Citations</th>
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
          Female inventor participation has grown across all technology areas, but
          significant gaps remain. Chemistry &amp; Metallurgy and Human Necessities show the
          highest female inventor shares, while Electricity and Mechanical Engineering lag
          behind. Gender-diverse teams produce patents with citation impact comparable to
          or exceeding all-male teams, suggesting that diversity in inventor teams is
          not just an equity issue but an innovation imperative.
        </p>
      </KeyInsight>

      <SectionDivider label="Serial Inventors vs. One-Hit Wonders" />

      <Narrative>
        <p>
          How much of the patent stock is produced by repeat inventors versus one-time filers?
          Segmenting inventors by their total patent count reveals a highly skewed distribution:
          most inventors file only a single patent, but a small group of prolific &quot;mega-inventors&quot;
          accounts for a disproportionate share of total output.
        </p>
      </Narrative>

      {segments && (
        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Segment</th>
                <th className="py-2 pr-4 text-right font-medium">Inventors</th>
                <th className="py-2 pr-4 text-right font-medium">Total Patents</th>
                <th className="py-2 pr-4 text-right font-medium">Avg Patents</th>
                <th className="py-2 pr-4 text-right font-medium">Inventor Share</th>
                <th className="py-2 text-right font-medium">Patent Share</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.segment} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">{s.segment}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{formatCompact(s.inventor_count)}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{formatCompact(s.total_patents)}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{s.avg_patents.toFixed(1)}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{s.inventor_share.toFixed(1)}%</td>
                  <td className="py-2 text-right font-mono text-xs">{s.patent_share.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            Inventors segmented by total career patent count: One-Hit (1), Occasional (2–9), Prolific (10–49), Superstar (50–99), Mega (100+).
          </figcaption>
        </div>
      )}

      <ChartContainer
        title="Patent Share by Inventor Segment"
        caption="Share of total patents produced by each inventor segment."
        insight="A small group of prolific and mega-inventors produces a disproportionate share of all patents, while the majority of inventors file only once. This extreme skewness mirrors broader patterns of productivity inequality in creative work."
        loading={segL}
        height={350}
      >
        <PWBarChart
          data={segments ?? []}
          xKey="segment"
          bars={[
            { key: 'patent_share', name: 'Patent Share (%)', color: CHART_COLORS[4] },
            { key: 'inventor_share', name: 'Inventor Share (%)', color: CHART_COLORS[0] },
          ]}
          yFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </ChartContainer>

      <ChartContainer
        title="One-Hit Wonder Share Over Time"
        caption="Percentage of active inventors each year who have filed exactly one patent in the dataset. Declining share suggests increasing professionalization of patenting."
        insight="The share of one-hit wonder inventors has fluctuated over time but shows a gradual decline, suggesting that patenting is becoming more concentrated among repeat filers as the patent system grows more complex and costly to navigate."
        loading={stL}
      >
        <PWLineChart
          data={segTrend ?? []}
          xKey="year"
          lines={[{ key: 'one_hit_pct', name: 'One-Hit Wonder Share (%)', color: CHART_COLORS[3] }]}
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The skewed distribution of inventive output has important implications for innovation
          policy. If a small number of prolific inventors drive a disproportionate share of
          patenting activity, policies that support inventor retention, mobility, and productivity
          may have outsized effects on the overall innovation system.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventor Career Trajectories" />

      <Narrative>
        <p>
          How does inventive productivity evolve over a career? By tracking inventors with at least
          5 patents, we can reconstruct the typical <StatCallout value="career productivity curve" /> --
          from the first patent through peak output and eventual decline. These curves reveal
          universal patterns in how inventive careers unfold.
        </p>
      </Narrative>

      <ChartContainer
        title="Average Productivity by Career Year"
        caption="Average patents per year at each career year (years since first patent) for inventors with 5+ lifetime patents. Shaded band shows 25th–75th percentile range."
        insight="Inventor productivity typically peaks 5–10 years into a career, then gradually declines. The wide interquartile range suggests enormous heterogeneity — some inventors sustain high output for decades while others taper off quickly."
        loading={cdL}
      >
        {careerData?.curves ? (
          <PWLineChart
            data={careerData.curves.filter(d => d.career_year <= 35)}
            xKey="career_year"
            lines={[
              { key: 'avg_patents', name: 'Average', color: CHART_COLORS[0] },
              { key: 'median_patents', name: 'Median', color: CHART_COLORS[2] },
            ]}
            xLabel="Career Year"
            yLabel="Patents per Year"
            yFormatter={(v) => v.toFixed(1)}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        title="Career Duration Distribution"
        caption="Distribution of career durations (years between first and last patent) for inventors with 5+ patents."
        insight="Most prolific inventor careers span 5–15 years, but a long tail of inventors sustain 30+ year careers. These ultra-long careers are disproportionately found in pharmaceutical and semiconductor companies."
        loading={cdL}
        height={400}
      >
        {careerData?.durations ? (
          <PWBarChart
            data={careerData.durations.filter(d => d.duration <= 40)}
            xKey="duration"
            bars={[{ key: 'count', name: 'Inventors', color: CHART_COLORS[4] }]}
            xLabel="Career Duration (years)"
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Technology Specialization vs. Generalism" />

      <Narrative>
        <p>
          Do inventors become more specialized or more general over time? Using the{' '}
          <GlossaryTooltip term="Shannon entropy">Shannon entropy</GlossaryTooltip> of
          each inventor&apos;s CPC section distribution, we classify prolific inventors (10+ patents)
          as <StatCallout value="specialists, moderates, or generalists" />.
        </p>
      </Narrative>

      <ChartContainer
        title="Inventor Specialization by Decade"
        caption="Share of prolific inventors (10+ patents) classified as specialist, moderate, or generalist by the decade of their first patent."
        insight="The share of specialist inventors has increased over time, consistent with the growing complexity and depth of modern technology fields. However, generalists — inventors who span multiple CPC sections — remain a persistent minority."
        loading={drL}
      >
        {driftData ? (
          <PWAreaChart
            data={driftData}
            xKey="decade"
            areas={[
              { key: 'specialist_pct', name: 'Specialist', color: CHART_COLORS[0] },
              { key: 'moderate_pct', name: 'Moderate', color: CHART_COLORS[2] },
              { key: 'generalist_pct', name: 'Generalist', color: CHART_COLORS[4] },
            ]}
            stacked
            yLabel="Share (%)"
            yFormatter={(v) => `${v.toFixed(0)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Comeback Inventors" />

      <Narrative>
        <p>
          Some inventors disappear from the patent record for years, only to return with new
          inventions. These &quot;comeback&quot; inventors — with gaps of 5+ years between patents —
          offer insights into <StatCallout value="career interruptions and reinventions" />.
        </p>
      </Narrative>

      <ChartContainer
        title="Comeback Inventors by Gap Duration"
        caption="Number of inventors returning to patenting after gaps of 5+ years, by gap length."
        insight="Most comebacks occur after 5–7 year gaps, with the number declining sharply for longer absences. Notably, a significant fraction of returning inventors change both their employer and technology field, suggesting these gaps often coincide with career pivots."
        loading={cbL}
        height={400}
      >
        {comebackData ? (
          <PWBarChart
            data={comebackData}
            xKey="gap_years"
            bars={[{ key: 'count', name: 'Comeback Inventors', color: CHART_COLORS[5] }]}
            xLabel="Gap Duration (years)"
          />
        ) : <div />}
      </ChartContainer>

      {comebackData && comebackData.length > 0 && (
        <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{comebackData.reduce((s, d) => s + d.count, 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Comeback Inventors</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{comebackData[0]?.changed_assignee_pct?.toFixed(0) ?? '—'}%</div>
            <div className="text-xs text-muted-foreground mt-1">Changed Employer</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{comebackData[0]?.changed_cpc_pct?.toFixed(0) ?? '—'}%</div>
            <div className="text-xs text-muted-foreground mt-1">Changed Tech Field</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{comebackData[0]?.avg_patents_after?.toFixed(1) ?? '—'}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg Patents After Return</div>
          </div>
        </div>
      )}

      <Narrative>
        Having explored the people behind the patents -- their teams, careers, and demographics -- the next chapter examines where these inventors are located.
        The geography of innovation is far from uniform: a handful of cities, states, and countries account for a disproportionate share of patent output, and inventor mobility creates critical channels for knowledge diffusion between these hubs.
      </Narrative>

      <DataNote>
        Gender data is based on PatentsView gender attribution using first names.
        Team size counts all listed inventors per patent. Inventor disambiguation
        is provided by PatentsView. Citation impact uses forward citations for
        patents granted through 2020. Career longevity tracks the span from first
        to last patent year per inventor. Superstar concentration is computed using cumulative patent counts per inventor. Solo inventor analysis uses the inventor count per patent. First-time inventors are identified by their earliest patent filing date. Inventor mobility measures distinct assignee organizations per prolific inventor. Gender analysis uses PatentsView&apos;s gender_code field. Career curves and specialization analysis use inventors with 5+ and 10+ patents respectively. Comeback inventors are those with gaps of 5+ years between consecutive patents.
      </DataNote>

      <RelatedChapters currentChapter={4} />
      <ChapterNavigation currentChapter={4} />
    </div>
  );
}
