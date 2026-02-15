'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import type {
  GenderByTech,
  GenderTeamQuality,
  GenderSectionTrend,
} from '@/lib/types';
import Link from 'next/link';

/* ── Local row types (match the JSON shapes) ─────────────────────────── */

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

/* ── Utility: pivot gender-per-year into one row per year ──────────── */

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

/* ── Page Component ─────────────────────────────────────────────────── */

export default function InvGenderChapter() {
  /* ── data hooks ── */
  const { data: gender, loading: gnL } = useChapterData<GenderRow[]>('chapter5/gender_per_year.json');
  const { data: genderSector, loading: gsL } = useChapterData<GenderSectorRow[]>('chapter5/gender_by_sector.json');
  const { data: genderByTech, loading: gbtL } = useChapterData<GenderByTech[]>('chapter5/gender_by_tech.json');
  const { data: genderSectionTrend, loading: gstL } = useChapterData<GenderSectionTrend[]>('chapter5/gender_section_trend.json');
  const { data: genderTeamQuality } = useChapterData<GenderTeamQuality[]>('chapter5/gender_team_quality.json');
  const { data: qualityByGender, loading: qgL } = useChapterData<any[]>('computed/quality_by_gender.json');
  const { data: prodByGender, loading: pgL } = useChapterData<any[]>('computed/inventor_productivity_by_gender.json');

  /* ── derived data ── */
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

  const genderByTechPivot = useMemo(() => {
    if (!genderByTech) return [];
    const sectionMap: Record<string, any> = {};
    genderByTech.forEach((d) => {
      if (!sectionMap[d.section]) sectionMap[d.section] = { section: d.section };
      sectionMap[d.section][d.gender] = d.count;
    });
    return Object.values(sectionMap).map((row: any) => {
      const m = row['Male'] || 0;
      const f = row['Female'] || 0;
      return {
        ...row,
        section: `${row.section}: ${CPC_SECTION_NAMES[row.section] ?? row.section}`,
        female_pct: m + f > 0 ? +(100 * f / (m + f)).toFixed(1) : 0,
      };
    }).sort((a: any, b: any) => b.female_pct - a.female_pct);
  }, [genderByTech]);

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

  /* ── pivot helper for quality/productivity charts ──────────── */
  const pivotData = (raw: any[] | null, metric: string) => {
    if (!raw) return [];
    const byYear: Record<number, any> = {};
    for (const r of raw) {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.group] = r[metric];
    }
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  };

  const { data: fwdCitData, yLabel: fwdCitYLabel, controls: fwdCitControls } = useCitationNormalization({
    data: pivotData(qualityByGender, 'avg_forward_citations'),
    xKey: 'year',
    citationKeys: ['all_female', 'all_male', 'mixed'],
    yLabel: 'Avg. Forward Citations',
  });

  /* ── render ── */
  return (
    <div>
      <ChapterHeader
        number={16}
        title="Gender and Patenting"
        subtitle="Gender composition and the gender innovation gap"
      />

      <KeyFindings>
        <li>The female share of inventor instances has risen steadily from 2.8% in 1976 to 14.9% in 2025, but remains well below parity with substantial variation across technology fields.</li>
        <li>Chemistry leads female inventor representation at 14.6%, while Mechanical Engineering is lowest at 5.4%, closely mirroring STEM educational pipeline composition.</li>
        <li>All-male teams produce the highest average citation impact (14.2 citations), followed by mixed-gender teams (12.6) and all-female teams (9.5), indicating that team composition correlates with citation outcomes in complex ways.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Female inventor representation has increased 5.3-fold from 2.8% to 14.9% over five decades, with Chemistry and Human Necessities leading and Mechanical Engineering lagging. All-male teams receive the highest average citations, followed by mixed-gender teams and all-female teams, suggesting team composition correlates with citation outcomes in ways that reflect both systemic and structural factors.
        </p>
      </aside>

      <Narrative>
        <p>
          Gender is one of the most fundamental dimensions along which the inventor workforce
          can be disaggregated. This chapter examines how female participation in patenting
          has evolved over time, how it varies across technology fields, and what differences
          emerge in patent quality by team gender composition.
        </p>
        <p>
          Progress on gender diversity has been measurable but slow, with female representation varying
          widely across technology fields in patterns that mirror the composition of STEM educational
          pipelines. Understanding these patterns is essential to evaluating the inclusiveness and
          representativeness of the patent system.
        </p>
      </Narrative>

      {/* ── Section A: Gender Composition ── */}
      <SectionDivider label="Gender Composition" />

      <ChartContainer
        id="fig-gender-female-share"
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
          id="fig-gender-by-sector"
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

      {genderByTechPivot.length > 0 && (
        <ChartContainer
          id="fig-gender-by-cpc-section"
          title="Female Inventor Share Ranges from 8.2% to 23.4% Across CPC Sections"
          subtitle="Female inventor share by CPC technology section, aggregated over the full study period"
          caption="This chart displays the percentage of inventor instances attributed to female inventors across CPC technology sections. Chemistry and Human Necessities exhibit the highest female representation, while Fixed Constructions and Mechanical Engineering demonstrate the lowest shares."
          insight="CPC-level analysis confirms the same pipeline-driven pattern seen at the WIPO sector level, with life-science-adjacent fields consistently attracting higher female participation."
          loading={gbtL}
          height={500}
        >
          <PWBarChart
            data={genderByTechPivot}
            xKey="section"
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

      {/* ── Section B: The Gender Innovation Gap ── */}
      <SectionDivider label="The Gender Innovation Gap" />

      <Narrative>
        <p>
          Disaggregating further beyond aggregate gender trends reveals substantive differences in
          the technology areas where women innovate and the performance of gender-diverse teams.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-gender-by-cpc-trend"
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

      {/* ── Section C: Quality Metrics — Women vs. Men ── */}
      <SectionDivider label="Quality Metrics: Women vs. Men Inventors" />
      <Narrative>
        <p>
          Gender is inferred from inventor first names using the methodology in PatentsView and does not capture non-binary identities. The following quality indicators compare patents by the gender composition of inventor teams over time.
        </p>
      </Narrative>
      <Narrative>
        <p>
          The following charts compare seven patent quality indicators and one productivity measure
          across team gender compositions over time. All-female teams, all-male teams, and
          mixed-gender teams are tracked separately using data from PatentsView, while individual
          inventor productivity is compared between female and male inventors.
        </p>
      </Narrative>

      {/* C.i — Forward Citations */}
      <ChartContainer
        id="fig-gender-fwd-citations"
        title="All-Female Teams Average 1.06 Forward Citations in 2024, Double the 0.51 for All-Male Teams"
        subtitle="Average forward citations per patent by team gender composition, 1976-2025"
        caption="Average forward citations received per patent by team gender composition, 1976-2024. Recent years are truncated due to citation lag. Data: PatentsView."
        loading={qgL}
        height={400}
        controls={fwdCitControls}
      >
        <PWLineChart
          data={fwdCitData ?? []}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel={fwdCitYLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      {/* C.ii — Claims */}
      <ChartContainer
        id="fig-gender-claims"
        title="Mixed-Gender Teams File Patents with 16.0 Claims on Average, vs. 10.6 for All-Female Teams"
        subtitle="Average number of claims per patent by team gender composition, 1976-2025"
        caption="Average number of claims per patent by team gender composition, 1976-2024. Mixed-gender teams consistently file the broadest claims. Data: PatentsView."
        loading={qgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByGender, 'avg_num_claims')}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel="Avg. Claims"
        />
      </ChartContainer>

      {/* C.iii — Scope */}
      <ChartContainer
        id="fig-gender-scope"
        title="Mixed-Gender Teams Average 2.49 CPC Subclasses per Patent, vs. 2.29 for All-Female Teams"
        subtitle="Average patent scope (CPC subclass count) by team gender composition, 1976-2025"
        caption="Average number of distinct CPC subclasses per patent by team gender composition, 1976-2024. Higher values indicate broader technological scope. Data: PatentsView."
        loading={qgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByGender, 'avg_scope')}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel="Avg. CPC Subclasses"
        />
      </ChartContainer>

      {/* C.iv — Originality */}
      <ChartContainer
        id="fig-gender-originality"
        title="All-Male Teams Score 0.198 on Originality, Above Mixed Teams' 0.195 and All-Female Teams' 0.157"
        subtitle="Average originality index by team gender composition, 1976-2025"
        caption="Average originality index (Herfindahl-based dispersion of backward citation technology classes) by team gender composition, 1976-2024. Data: PatentsView."
        loading={qgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByGender, 'avg_originality')}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel="Avg. Originality Index"
        />
      </ChartContainer>

      {/* C.v — Generality */}
      <ChartContainer
        id="fig-gender-generality"
        title="Mixed-Gender Teams Score 0.037 on Generality, Nearly Double All-Female Teams' 0.022"
        subtitle="Average generality index by team gender composition, 1976-2025"
        caption="Average generality index (Herfindahl-based dispersion of forward citation technology classes) by team gender composition, 1976-2024. Data: PatentsView."
        loading={qgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByGender, 'avg_generality')}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel="Avg. Generality Index"
        />
      </ChartContainer>

      {/* C.vi — Self-Citation Rate */}
      <ChartContainer
        id="fig-gender-self-citation"
        title="Mixed-Gender Teams Self-Cite at 15.7%, vs. 12.0% for All-Male and 9.9% for All-Female Teams"
        subtitle="Average self-citation rate by team gender composition, 1976-2025"
        caption="Average self-citation rate (share of backward citations to the same assignee's patents) by team gender composition, 1976-2024. Data: PatentsView."
        loading={qgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByGender, 'avg_self_citation_rate')}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel="Avg. Self-Citation Rate"
          yFormatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </ChartContainer>

      {/* C.vii — Grant Lag */}
      <ChartContainer
        id="fig-gender-grant-lag"
        title="Mixed-Gender Teams Wait 1,027 Days for Grant, vs. 886 Days for All-Female Teams"
        subtitle="Average grant lag in days by team gender composition, 1976-2025"
        caption="Average number of days from filing to grant by team gender composition, 1976-2024. Grant lag has increased for all groups over time. Data: PatentsView."
        loading={qgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByGender, 'avg_grant_lag_days')}
          xKey="year"
          lines={[
            { key: 'all_female', name: 'All-Female Teams', color: CHART_COLORS[0] },
            { key: 'all_male', name: 'All-Male Teams', color: CHART_COLORS[1] },
            { key: 'mixed', name: 'Mixed-Gender Teams', color: CHART_COLORS[2] },
          ]}
          yLabel="Avg. Grant Lag (days)"
        />
      </ChartContainer>

      {/* C.viii — Inventor Productivity */}
      <ChartContainer
        id="fig-gender-productivity"
        title="Male Inventors Are Consistently More Productive Than Female Inventors"
        subtitle="Average patents per inventor by gender, 1976-2025"
        caption="Average number of patents per inventor by gender, 1976-2024. Productivity is measured as career patent count divided by active years. Data: PatentsView."
        loading={pgL}
        height={400}
      >
        <PWLineChart
          data={pivotData(prodByGender, 'avg_patents_per_inventor')}
          xKey="year"
          lines={[
            { key: 'female', name: 'Female Inventors', color: CHART_COLORS[0] },
            { key: 'male', name: 'Male Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Patents per Inventor"
        />
      </ChartContainer>

      {/* ── Closing transition ── */}
      <Narrative>
        <p>
          The gender composition of the inventor workforce reveals persistent disparities across technology
          fields and meaningful differences in patent quality by team composition. The next chapter, <Link href="/chapters/inv-team-size" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Team Size and Collaboration</Link>, examines how team structures have evolved over time and how team size relates to patent quality and innovation outcomes.
        </p>
      </Narrative>

      <DataNote>
        Gender data is based on PatentsView gender attribution using first names.
        Gender analysis uses PatentsView&apos;s gender_code field.
        Non-binary identities are not captured by the name-based inference methodology.
      </DataNote>

      <RelatedChapters currentChapter={16} />
      <ChapterNavigation currentChapter={16} />
    </div>
  );
}
