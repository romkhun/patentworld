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
  const { data: comebackData } = useChapterData<ComebackInventor[]>('company/comeback_inventors.json');

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
        subtitle="Demographic composition, career trajectories, and productivity patterns among patent inventors"
      />

      <KeyFindings>
        <li>Average patent team size increased from about 1.7 inventors in the late 1970s to over 3 by 2025, while the solo-inventor share declined from above 50% to under 25%.</li>
        <li>The female share of inventor instances has risen steadily but remains below 15%, indicating a persistent gender gap in patented innovation.</li>
        <li>The most prolific inventors hold thousands of patents each, concentrated in electronics and computing fields, and the top 5% of inventors account for a growing share of total output.</li>
        <li>The share of patents including first-time inventors has declined, suggesting the patent system increasingly favors experienced, repeat inventors within organizations.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Behind the corporate assignees profiled in Chapter 3 stands a workforce of named inventors whose demographic composition and career patterns have transformed over five decades. The most consequential structural shift has been the transition from solo to team-based invention, reflecting the growing interdisciplinarity of technologies such as semiconductors, software, and biotechnology. This collaborative turn has coincided with an increasing concentration of output among a small cadre of prolific, repeat inventors, many affiliated with the East Asian electronics firms that now lead global patenting. At the same time, progress on gender diversity has been measurable but slow, with female representation varying widely across technology fields in patterns that mirror the composition of STEM educational pipelines. The declining prevalence of first-time inventors on patent filings raises important questions about barriers to entry, a theme that connects to the geographic concentration examined in Chapter 5.
        </p>
      </aside>

      <Narrative>
        <p>
          Every patent lists at least one inventor. Over the past five decades,
          the process of invention has become increasingly collaborative, as solo inventors have yielded
          to larger teams and the gender composition of the inventor workforce
          has shifted gradually. <StatCallout value={topInventorName} /> holds the record
          for the most patents granted to a single inventor.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-team-size"
        title="Average Patent Team Size Increased from 1.7 to Over 3 Inventors, 1976–2025"
        subtitle="Average team size, solo-inventor share, and large-team (5+) share per patent, tracking the shift from solo to collaborative invention, 1976–2025"
        caption="This chart displays three concurrent trends in inventor team composition: average team size per patent, the percentage of solo-inventor patents, and the share of large-team (5+ inventor) patents. The most prominent pattern is the steady rise in average team size alongside a corresponding decline in solo invention from above 50% to under 25%."
        insight="The transition from solo invention to team-based research and development constitutes one of the defining structural shifts in modern innovation, reflecting the increasing complexity and interdisciplinarity of technology development."
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
          Average team size increased from approximately 1.7 inventors per patent in
          the late 1970s to over 3 by 2025. The share of solo-inventor patents has
          declined substantially, while patents listing five or more inventors have become
          increasingly prevalent, a pattern consistent with the growing complexity and interdisciplinarity
          of contemporary technological development.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The transition from solo to team invention mirrors broader trends in science and engineering.
          The solo-inventor share declined from above 50% to under 25%, while the share of patents listing five or more
          inventors has grown more than eightfold, from about 2.5% to over 21%. This pattern suggests that contemporary technologies increasingly
          require diverse expertise that exceeds the capacity of any individual inventor.
        </p>
      </KeyInsight>

      <SectionDivider label="Gender" />

      <ChartContainer
        id="fig-inventors-female-share"
        title="Female Inventor Share Rose Steadily from 2.8% to 14.9%, 1976–2025"
        subtitle="Percentage of inventor-patent instances attributed to female inventors, measured annually, 1976–2025"
        caption="This chart tracks the percentage of inventor-patent instances attributed to female inventors over time. The data demonstrate a consistent upward trend from approximately 3% in the late 1970s, though the female share has not yet reached 15% as of the most recent data."
        insight="The persistent gender gap in patenting appears to reflect broader systemic barriers in STEM fields, spanning educational pipelines, workplace culture, and institutional support structures."
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
          Progress on gender diversity in patenting has been measurable but gradual. Despite decades of
          initiatives to broaden participation in STEM, the female share of inventors on US
          patents remains well below parity. At the observed rate of change, achieving equal
          representation would require several additional decades.
        </p>
      </Narrative>

      {genderBySector.length > 0 && (
        <ChartContainer
          id="fig-inventors-gender-by-sector"
          title="Chemistry Leads Female Inventor Representation at 14.6%; Mechanical Engineering Lowest at 5.4%"
          subtitle="Female inventor share by WIPO technology sector, showing cross-sector variation in gender representation"
          caption="This chart displays the percentage of inventor instances attributed to female inventors across WIPO technology sectors. Chemistry and pharmaceuticals exhibit the highest female representation, while electrical and mechanical engineering demonstrate the lowest shares."
          insight="The cross-sector variation in gender diversity closely mirrors the composition of STEM degree programs, suggesting that educational pipeline differences constitute a primary driver of the gender gap in patenting."
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
          Female representation among US patent inventors has increased steadily but remains below 15%.
          Chemistry and pharmaceutical fields exhibit the highest gender diversity, while electrical engineering
          and mechanical engineering demonstrate the lowest representation -- a pattern that closely mirrors the gender
          composition of STEM degree programs.
        </p>
      </KeyInsight>

      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-inventors-prolific-ranking"
        title="The Most Prolific Inventor Holds 6,709 Patents; Top 100 Each Exceed 760"
        subtitle="Top 100 inventors ranked by total utility patents granted, 1976–2025"
        caption="This chart ranks inventors by total utility patents granted from 1976 to 2025. The distribution is heavily right-skewed, with the top-ranked inventors holding thousands of patents each, predominantly in electronics and semiconductor fields."
        insight="The concentration of patents among a small number of prolific inventors raises questions regarding whether the patent system disproportionately rewards institutional resources rather than individual inventive capacity."
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
          The most prolific inventors are disproportionately concentrated in electronics and
          semiconductor fields, where rapid design iteration and modular innovation facilitate
          high patent output. Many of the top-ranked inventors are associated with large
          Japanese and Korean electronics firms that emphasize systematic patent generation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-first-time-entries"
        title="Annual First-Time Inventor Entries Rose from 35,000 to a Peak of 140,490 in 2019"
        subtitle="Number of inventors filing their first US patent each year, measuring new entrant inflow, 1976–2025"
        caption="This chart displays the number of inventors filing their first US patent in each year. The data indicate a sustained upward trend, with annual first-time entries rising from approximately 35,000–59,000 in the late 1970s to peaks exceeding 140,000 in recent years."
        insight="The sustained inflow of new inventors serves as an indicator of the innovation ecosystem's capacity for renewal, demonstrating continued broadening of the inventor base despite increasing specialization."
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
          The flow of new inventors into the patent system has expanded substantially,
          reaching its highest levels in recent years. This growth reflects both the expansion of technology
          industries and the increasing globalization of research and development, as inventors from
          around the world file patents through the US system.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          While the number of new inventors entering the patent system has grown substantially,
          patent grants have grown even faster (5.3-fold versus 2.8-fold since 1980), indicating that rising team sizes and repeat
          inventors drive much of the expansion. This growing base of first-time inventors
          indicates continued inflows of new talent and perspectives into the innovation ecosystem.
        </p>
      </KeyInsight>

      {/* ── New deep analyses ── */}

      <SectionDivider label="Inventor Impact" />

      <Narrative>
        <p>
          Prolificacy does not necessarily correspond to impact. <GlossaryTooltip term="forward citations">Forward citations</GlossaryTooltip> --
          the frequency with which an inventor&apos;s patents are cited by subsequent patents -- indicate whether their
          innovations serve as <StatCallout value="foundational contributions" /> to future inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-citation-impact"
        title="Citation Impact Ranges from 1 to 965 Avg Citations Among the 100 Most Prolific Inventors"
        subtitle="Average and median forward citations per patent for the top 100 most prolific inventors, based on patents granted through 2020"
        caption="This chart presents the average and median forward citations per patent for the top 100 most prolific inventors, limited to patents granted through 2020. The data reveal substantial variation in citation impact, with some high-volume inventors averaging fewer than 10 citations per patent while others exceed 50."
        insight="Prolificacy and citation impact constitute distinct dimensions of inventor performance. Some high-volume inventors generate modest per-patent citations, while others achieve disproportionate influence, suggesting that patent quantity and quality are only weakly correlated at the individual level."
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
          Prolificacy and impact constitute distinct dimensions of performance. Some inventors with
          fewer total patents generate substantially higher citation impact per patent,
          suggesting a more pronounced influence on their respective fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Career Longevity" />

      <Narrative>
        <p>
          Career survival curves indicate the fraction of inventors who entered the patent system in each 5-year cohort and continue
          patenting over subsequent years, thereby revealing patterns of <StatCallout value="persistence and attrition" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-career-survival"
        title="Only 37–51% of Inventors Survive Past Five Career Years; Attrition Is Steepest Early"
        subtitle="Percentage of inventors remaining active at each career year, stratified by 5-year entry cohort, measuring career persistence"
        caption="This chart displays the percentage of inventors remaining active (with at least one additional patent) at each career year, stratified by 5-year entry cohort. The steep initial decline indicates substantial attrition, with approximately 38–43% of inventors not filing a second patent, while those who persist beyond the first few years tend to maintain extended careers."
        insight="The steep initial decline in survival rates indicates that a substantial minority of inventors patent only once. Those who persist beyond the first few years tend to sustain long, productive careers, suggesting a bimodal distribution of inventor engagement."
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
          single-patent inventors who do not return to the system (reflected in the steep initial
          decline), and a smaller group of persistent innovators who remain active for decades.
          This pattern is consistent across all entry cohorts, suggesting a fundamental
          structural division between occasional and career inventors.
        </p>
      </KeyInsight>

      <SectionDivider label="Superstar Inventor Concentration" />
      <Narrative>
        <p>
          Tracking the concentration of patenting activity among the top 1% and top 5% of inventors
          by cumulative patent count reveals whether innovation output is becoming more concentrated
          or more broadly distributed over time.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-superstar-concentration"
        title="The Top 5% of Inventors Grew from 26% to 60% of Annual Patent Output, 1976–2025"
        subtitle="Annual share of patents attributable to the top 1% and top 5% of inventors by cumulative patent count, 1976–2025"
        caption="This chart tracks the percentage of patents each year attributable to the top 1% and top 5% of inventors by cumulative patent count. The upward trend in both series indicates increasing concentration of patent output among a small cohort of repeat inventors."
        insight="Rising concentration of patents among top inventors suggests that innovation output is increasingly driven by professional, repeat inventors rather than occasional contributors."
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
          Superstar concentration has increased substantially over the period studied. The top 5%
          of inventors account for a growing share of total patent output, suggesting
          that patenting is increasingly the domain of repeat, professional inventors
          rather than occasional contributors. This pattern parallels analogous trends in academic publishing
          and other knowledge-intensive fields.
        </p>
      </KeyInsight>

      <SectionDivider label="The Decline of Solo Invention" />
      <Narrative>
        <p>
          The lone inventor working independently remains a prominent cultural archetype. The data, however,
          reveal a sustained structural shift in the nature of innovation toward
          team-based approaches.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-solo-decline"
        title="Solo-Inventor Patents Declined from Over 50% to Under 25% of All Grants, 1976–2025"
        subtitle="Percentage of utility patents listing a single named inventor, measuring the structural shift toward collaborative invention, 1976–2025"
        caption="This chart displays the percentage of utility patents listing a single named inventor. The persistent downward trend from above 50% in the late 1970s to under 25% by 2025 demonstrates the structural shift toward collaborative invention."
        insight="The decline of solo invention underscores the extent to which modern technology development demands diverse, interdisciplinary expertise that exceeds the capacity of any single individual."
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
          Solo invention declined from over half of all patents in the
          late 1970s to a distinct minority by 2025. The complexity of modern technology
          increasingly requires diverse expertise that exceeds the scope of individual mastery. Nevertheless,
          solo inventors persist in certain fields, particularly in areas such as Textiles and Fixed
          Constructions, where individual practitioners and architects continue to innovate
          independently.
        </p>
      </KeyInsight>

      <SectionDivider label="First-Time Inventors" />
      <Narrative>
        <p>
          A central question concerns whether the patent system continues to attract new entrants
          or is increasingly dominated by repeat filers. The following analysis tracks the share of patents each year that include at
          least one inventor filing for the first time.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-first-time-share"
        title="The Share of Patents Including a First-Time Inventor Fell from 71% to 26%, 1977–2025"
        subtitle="Percentage of patents each year listing at least one first-time inventor, measuring newcomer prevalence, 1977–2025"
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
          Despite the growing prevalence of repeat inventors, a substantial share of patents
          each year continues to include at least one first-time filer. This sustained inflow of first-time
          inventors remains important for the renewal capacity of the innovation system, ensuring that
          new perspectives and ideas continue to enter the patent landscape.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventor Mobility" />
      <Narrative>
        <p>
          A comparison of forward citation counts for mobile inventors (those who have patented
          at multiple organizations) versus non-mobile inventors indicates whether career
          mobility is associated with higher innovation quality.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-mobility-rate"
        title="Inventor Mobility Rates Rose from 50% in the 1980s to 60% in the 2000s"
        subtitle="Percentage of prolific inventors (5+ patents per decade) who patented at multiple organizations, by decade"
        caption="This chart displays the percentage of prolific inventors (those with 5 or more patents per decade) who patented at multiple organizations. The upward trend across decades indicates growing inter-organizational mobility among active inventors."
        insight="Rising inventor mobility is consistent with the growing fluidity of the technology labor market, where career transitions between organizations appear to serve as channels for knowledge transfer."
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
          their non-mobile counterparts. This finding is consistent with the hypothesis that exposure to multiple organizational
          contexts enriches an inventor&apos;s knowledge base and contributes to more impactful
          innovations. The mobility rate has also increased over time, reflecting the growing
          fluidity of the technology labor market.
        </p>
      </KeyInsight>

      <SectionDivider label="The Gender Innovation Gap" />
      <Narrative>
        <p>
          Disaggregated analysis beyond aggregate gender trends reveals substantive differences in
          the technology areas where women innovate, the performance of gender-diverse teams, and the variation in female
          participation across technology fields.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-gender-by-cpc"
        title="Female Inventor Shares Range from 10.6% (Fixed Constructions) to 31.2% (Chemistry) Across CPC Sections"
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
          Female inventor participation has increased across all technology areas, though
          significant disparities persist. Chemistry &amp; Metallurgy and Human Necessities exhibit the
          highest female inventor shares, while Electricity and Mechanical Engineering demonstrate
          the lowest representation. Gender-diverse teams produce patents with citation impact comparable to
          or exceeding that of all-male teams, suggesting that diversity in inventor teams
          may contribute to innovation quality as well as equity.
        </p>
      </KeyInsight>

      <SectionDivider label="Serial Inventors and Single-Patent Filers" />

      <Narrative>
        <p>
          Segmenting inventors by total patent count reveals a markedly skewed distribution:
          a plurality of inventors (43%) file only a single patent, while a small group of prolific inventors
          with 100 or more patents accounts for a disproportionate share of total output.
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
        id="fig-inventors-segment-shares"
        title="12% of Inventors (Prolific, Superstar, and Mega) Produce 61% of Total Patent Output"
        subtitle="Patent share vs. inventor share by productivity segment (One-Hit, Occasional, Prolific, Superstar, Mega), measuring output concentration"
        caption="This chart compares the share of total patents produced by each inventor segment against the share of inventors in that segment. The data demonstrate extreme skewness: single-patent inventors constitute the largest segment by headcount but contribute a comparatively small share of total output."
        insight="A small group of prolific and mega-inventors produces a disproportionate share of all patents, while a plurality of inventors file only once. This extreme skewness mirrors broader patterns of productivity inequality observed in scientific publishing and other creative fields."
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
        id="fig-inventors-one-hit-trend"
        title="The Share of Single-Patent Inventors Dipped from 40% in the Early 1980s to 36% in the 2000s Before Rising to 45% by 2020"
        subtitle="Percentage of active inventors each year who have filed exactly one patent, tracking the prevalence of one-time filers over time"
        caption="This chart displays the percentage of active inventors each year who have filed exactly one patent in the dataset. The gradual decline suggests increasing professionalization of patenting activity over the study period."
        insight="The declining share of single-patent inventors suggests that patenting has become increasingly concentrated among repeat filers, a pattern consistent with the growing complexity and cost of navigating the patent system."
        loading={stL}
      >
        <PWLineChart
          data={segTrend ?? []}
          xKey="year"
          lines={[{ key: 'one_hit_pct', name: 'Single-Patent Inventor Share (%)', color: CHART_COLORS[3] }]}
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The skewed distribution of inventive output has important implications for innovation
          policy. If a small number of prolific inventors drive a disproportionate share of
          patenting activity, policies that support inventor retention, mobility, and productivity
          may have disproportionate effects on the overall innovation system.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventor Career Trajectories" />

      <Narrative>
        <p>
          Tracking inventors with at least
          5 patents enables reconstruction of the typical <StatCallout value="career productivity curve" /> --
          from the first patent through peak output and eventual decline. These curves exhibit
          consistent patterns in how inventive careers develop across cohorts and technology fields.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-career-curve"
        title="Inventor Productivity Rises from 1.4 to 2.1 Patents per Year in Early Career Before Plateauing"
        subtitle="Average and median patents per year at each career year for inventors with 5+ lifetime patents, measuring productivity trajectory"
        caption="This chart presents average patents per year at each career year (years since first patent) for inventors with 5 or more lifetime patents. Productivity rises steeply in the first five career years, then plateaus at approximately 2.1–2.3 patents per year through the remainder of the career, with substantial variation across individuals."
        insight="Inventor productivity rises steeply in the first five career years, then plateaus without significant decline. The wide interquartile range indicates substantial heterogeneity: some inventors sustain high output for decades while others taper off within a few years."
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
        id="fig-inventors-career-duration"
        title="Most Prolific Inventor Careers Span 5–15 Years, with a Long Tail Exceeding 30 Years"
        subtitle="Distribution of career durations (years between first and last patent) for inventors with 5+ patents"
        caption="This chart displays the distribution of career durations (years between first and last patent) for inventors with 5 or more patents. The modal duration falls between 5 and 15 years, though a notable long tail of inventors maintains careers exceeding 30 years."
        insight="The majority of prolific inventor careers span 5 to 15 years, though a long tail of inventors sustain careers exceeding 30 years. These extended careers are disproportionately concentrated in pharmaceutical and semiconductor firms."
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
          An important dimension of inventor careers concerns whether individuals become more specialized or more general over time. Using the{' '}
          <GlossaryTooltip term="Shannon entropy">Shannon entropy</GlossaryTooltip> of
          each inventor&apos;s CPC section distribution, prolific inventors (those with 10 or more patents) are classified
          as <StatCallout value="specialists, moderates, or generalists" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-specialization"
        title="The Share of Specialist Inventors Rose from 20% in the 1970s to 48% in the 2020s"
        subtitle="Share of prolific inventors (10+ patents) classified as specialist, moderate, or generalist by Shannon entropy, by entry decade"
        caption="This chart displays the share of prolific inventors (those with 10 or more patents) classified as specialist, moderate, or generalist by the decade of their first patent. The proportion of specialists has risen over time, while generalists have declined as a share of the total."
        insight="The increasing share of specialist inventors is consistent with the growing complexity and depth of modern technology fields. Nevertheless, generalists who span multiple CPC sections remain a persistent minority across all decades."
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
          A subset of inventors exhibit extended absences from the patent record before resuming patenting activity.
          These &quot;comeback&quot; inventors -- those with gaps of 5 or more years between patents --
          provide insights into <StatCallout value="career interruptions and reinventions" />.
        </p>
      </Narrative>

      {comebackData && comebackData.length > 0 && (() => {
        const totalCount = comebackData.reduce((s: number, d: any) => s + d.count, 0);
        const wtdAssignee = comebackData.reduce((s: number, d: any) => s + d.changed_assignee_pct * d.count, 0) / totalCount;
        const wtdCpc = comebackData.reduce((s: number, d: any) => s + d.changed_cpc_pct * d.count, 0) / totalCount;
        const wtdPatents = comebackData.reduce((s: number, d: any) => s + d.avg_patents_after * d.count, 0) / totalCount;
        return (
        <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Comeback Inventors</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{wtdAssignee.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Changed Employer</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{wtdCpc.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Changed Tech Field</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{wtdPatents.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg Patents After Return</div>
          </div>
        </div>
        );
      })()}

      <Narrative>
        Having examined the demographic composition, career trajectories, and productivity patterns of patent inventors, the subsequent chapter addresses the geography of innovation.
        The spatial distribution of patent activity is markedly uneven: a small number of cities, states, and countries account for a disproportionate share of output, and inventor mobility creates important channels for knowledge diffusion between these hubs.
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
