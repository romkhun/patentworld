'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { CHART_COLORS } from '@/lib/colors';
import type {
  InventorLongevity,
  InventorMobilityCitation, InventorMobilityByDecade,
  InventorCareerCurve, InventorCareerDuration,
  ComebackInventor,
} from '@/lib/types';
import Link from 'next/link';

export default function CareerTrajectories() {
  const { data: longevity, loading: lgL } = useChapterData<InventorLongevity[]>('chapter5/inventor_longevity.json');
  const { data: mobility } = useChapterData<InventorMobilityCitation[]>('chapter5/inventor_mobility.json');
  const { data: mobilityByDecade, loading: mbdL } = useChapterData<InventorMobilityByDecade[]>('chapter5/inventor_mobility_by_decade.json');
  const { data: careerData, loading: cdL } = useChapterData<{ curves: InventorCareerCurve[]; durations: InventorCareerDuration[] }>('company/inventor_careers.json');
  const { data: comebackData } = useChapterData<ComebackInventor[]>('company/comeback_inventors.json');

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
        number={20}
        title="Career Trajectories"
        subtitle="Career survival, productivity trajectories, and inter-firm mobility"
      />

      <KeyFindings>
        <li>Only 37-51% of inventors survive past five career years, with attrition steepest in the earliest years, revealing a bimodal population of one-time filers and persistent career inventors.</li>
        <li>Inventor productivity rises from 1.4 to 2.1 patents per year in early career before plateauing, with the majority of prolific careers spanning 5-15 years and a long tail exceeding 30 years.</li>
        <li>Inventor mobility rates rose from 50% in the 1980s to 60% in the 2000s before declining to 51% in the 2020s, and mobile inventors consistently produce higher-impact patents.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Inventor careers follow a bimodal pattern: a large group patents only once, while persistent inventors sustain careers spanning 5-15 years on average, with productivity peaking early at 2.1 patents per year before plateauing. Mobility between organizations rose from 50% to 60% before moderating, and mobile inventors consistently generate higher citation impact, suggesting that cross-organizational exposure enriches inventive output.
        </p>
      </aside>

      <Narrative>
        <p>
          The preceding chapters established who inventors are, what they produce, and how output
          is concentrated. This chapter turns to how inventor careers unfold over time -- from initial
          entry through peak productivity, organizational mobility, and eventual exit or return.
        </p>
        <p>
          Career survival curves reveal that a substantial minority of inventors patent only once,
          while those who persist beyond the first few years tend to maintain extended, productive
          careers. Mobility between organizations has increased over time and is consistently
          associated with higher-impact innovation.
        </p>
      </Narrative>

      <SectionDivider label="Career Longevity" />

      <Narrative>
        <p>
          Career survival curves indicate the fraction of inventors who entered the patent system in each 5-year cohort and continue
          patenting over subsequent years, thereby revealing patterns of <StatCallout value="persistence and attrition" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-career-survival"
        title="Only 37-51% of Inventors Survive Past Five Career Years; Attrition Is Steepest Early"
        subtitle="Percentage of inventors remaining active at each career year, stratified by 5-year entry cohort, measuring career persistence"
        caption="This chart displays the percentage of inventors remaining active (with at least one additional patent) at each career year, stratified by 5-year entry cohort. The steep initial decline indicates substantial attrition, with approximately 37-43% of inventors not filing a second patent, while those who persist beyond the first few years tend to maintain extended careers."
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
          yLabel="Survival Rate (%)"
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

      <SectionDivider label="Inventor Career Trajectories" />

      <Narrative>
        <p>
          For those inventors who persist, tracking their productivity over time reveals the shape of the typical
          career arc. Focusing on inventors with at least
          5 patents enables reconstruction of the <StatCallout value="career productivity curve" /> --
          from the first patent through peak output and eventual decline.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-career-curve"
        title="Inventor Productivity Rises from 1.4 to 2.1 Patents per Year in Early Career Before Plateauing"
        subtitle="Average and median patents per year at each career year for inventors with 5+ lifetime patents, measuring productivity trajectory"
        caption="This chart presents average patents per year at each career year (years since first patent) for inventors with 5 or more lifetime patents. Productivity rises steeply in the first five career years, then plateaus at approximately 2.1-2.3 patents per year through the remainder of the career, with substantial variation across individuals."
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
        title="Most Prolific Inventor Careers Span 5-15 Years, with a Long Tail Exceeding 30 Years"
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
            yLabel="Number of Inventors"
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Inventor Mobility" />
      <Narrative>
        <p>
          Career trajectories are shaped not only by persistence and productivity but also by movement between
          organizations. A comparison of forward citation counts for mobile inventors (those who have patented
          at multiple organizations) versus non-mobile inventors indicates whether career
          mobility is associated with higher innovation quality.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-mobility-rate"
        title="Inventor Mobility Rates Rose from 50% in the 1980s to 60% in the 2000s Before Declining to 51% in the 2020s"
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
            yLabel="Mobility Rate (%)"
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
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Average Citations</th>
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

      <SectionDivider label="Comeback Inventors" />

      <Narrative>
        <p>
          A final dimension of inventor mobility concerns movement not across organizations but across time.
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
            <div className="text-xs text-muted-foreground mt-1">Changed Technology Field</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold">{wtdPatents.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground mt-1">Average Patents After Return</div>
          </div>
        </div>
        );
      })()}

      <Narrative>
        The individual-level patterns documented across these inventor chapters -- from demographic composition through productivity, concentration, and career dynamics -- connect to broader structural dimensions of the innovation system.
        The spatial distribution of patent activity is markedly uneven, as documented in <Link href="/chapters/domestic-geography" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Geography of Innovation</Link>, and the <Link href="/chapters/network-structure" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Collaboration Networks</Link> that link inventors and organizations across these locations reveal how knowledge flows through the system.
      </Narrative>

      <DataNote>
        Career longevity tracks the span from first to last patent year per inventor.
        Inventor mobility measures distinct assignee organizations per prolific inventor.
        Career curves use inventors with 5+ patents. Comeback inventors are those with gaps
        of 5+ years between consecutive patents. Citation impact uses forward citations for
        patents granted through 2020.
      </DataNote>

      <RelatedChapters currentChapter={20} />
      <ChapterNavigation currentChapter={20} />
    </div>
  );
}
