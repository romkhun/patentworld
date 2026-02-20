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
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import type {
  FirstTimeInventor,
  InventorEntry,
  InventorSegment,
  InventorLongevity,
  InventorCareerCurve,
  InventorCareerDuration,
  ComebackInventor,
} from '@/lib/types';
import Link from 'next/link';
import { DescriptiveGapNote } from '@/components/chapter/DescriptiveGapNote';

export default function InvSerialNewChapter() {
  /* ── data hooks ────────────────────────────────────────────────── */
  const { data: firstTime, loading: ftL } = useChapterData<FirstTimeInventor[]>('chapter5/first_time_inventors.json');
  const { data: entry, loading: enL } = useChapterData<InventorEntry[]>('chapter5/inventor_entry.json');
  const { data: segments, loading: segL } = useChapterData<InventorSegment[]>('chapter5/inventor_segments.json');
  const { data: longevity, loading: lgL } = useChapterData<InventorLongevity[]>('chapter5/inventor_longevity.json');
  const { data: careerData, loading: cdL } = useChapterData<{ curves: InventorCareerCurve[]; durations: InventorCareerDuration[] }>('company/inventor_careers.json');
  const { data: comebackData } = useChapterData<ComebackInventor[]>('company/comeback_inventors.json');
  const { data: qualityByExp, loading: qbL } = useChapterData<any[]>('computed/quality_by_experience.json');
  const { data: productivityByExp, loading: pbL } = useChapterData<any[]>('computed/inventor_productivity_by_experience.json');

  /* ── derived: longevity pivot ──────────────────────────────────── */
  const longevityCohorts = useMemo(() => {
    if (!longevity) return { data: [], cohorts: [] };
    const cohorts = [...new Set(longevity.map((d) => d.cohort))].sort();
    const maxLen = Math.max(...longevity.map((d) => d.career_length));
    const data = [];
    for (let cl = 0; cl <= maxLen; cl++) {
      const row: Record<string, number | string> = { career_length: cl };
      cohorts.forEach((cohort) => {
        const found = longevity.find((d) => d.cohort === cohort && d.career_length === cl);
        if (found) row[cohort] = found.survival_pct;
      });
      data.push(row);
    }
    return { data, cohorts };
  }, [longevity]);

  /* ── pivot helper for serial vs. new-entrant charts ─────────── */
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
    data: pivotData(qualityByExp, 'avg_forward_citations'),
    xKey: 'year',
    citationKeys: ['serial', 'new_entrant'],
    yLabel: 'Avg. Forward Citations',
  });

  return (
    <div>
      <ChapterHeader
        number={15}
        title="Serial Inventors vs. New Entrants"
        subtitle="Career patterns, serial innovation, and inventor survival"
      />
      <MeasurementSidebar slug="inv-serial-new" />

      <KeyFindings>
        <li>Annual first-time inventor entries rose from 35,126 in 1979 to a peak of 140,490 in 2019, yet the share of patents including a first-time inventor fell from 71% to 26%.</li>
        <li>Just 12% of inventors (Prolific, Superstar, and Mega segments) produce 61% of total patent output, while 43% of inventors file only a single patent.</li>
        <li>Only 37-51% of inventors survive past five career years, with attrition steepest in the earliest years, revealing a bimodal population of one-time filers and persistent career inventors.</li>
        <li>Inventor productivity rises from 1.4 to 2.1 patents per year in early career before plateauing, with the majority of prolific careers spanning 5-15 years and a long tail exceeding 30 years.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The patent system is shaped by a fundamental tension between continuity and renewal. The absolute number of first-time
          inventors peaked at 140,490 in 2019, but their share of total patent activity has declined from 71% to 26%, indicating the
          system increasingly favors experienced, repeat filers. A small elite of serial inventors produces a disproportionate share of
          all output, while career survival curves reveal that most inventors patent only once. For those who persist, productivity
          rises steeply in early career years before plateauing, and a subset of &quot;comeback&quot; inventors return after extended absences,
          often with new employers and new technology fields.
        </p>
      </aside>

      <Narrative>
        <p>
          Understanding who invents -- and who persists as an inventor -- is central to understanding the innovation system.
          This chapter brings together several dimensions of inventor experience: the flow of new entrants, the dominance of
          serial inventors, career survival and productivity trajectories, and the phenomenon of inventor comebacks after
          extended absences. Together, these patterns reveal a system in which a small, persistent core of repeat inventors
          accounts for an outsized share of patent output, even as new talent continues to enter the system each year.
        </p>
      </Narrative>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION A: New Entrants (from inventor-demographics)
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider label="New Entrants" />

      <Narrative>
        <p>
          Beyond the aggregate growth in patenting, tracking both the absolute number of first-time filers and their share of total patent activity reveals
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

      {/* ═══════════════════════════════════════════════════════════════
          SECTION B: Serial Inventors and Single-Patent Filers (from productivity-concentration)
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Serial Inventors and Single-Patent Filers" />

      <Narrative>
        <p>
          The distribution of inventor productivity extends well beyond the most prolific individuals.
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
                <th className="py-2 pr-4 text-right font-medium">Average Patents</th>
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
            Inventors segmented by total career patent count: One-Hit (1), Occasional (2-9), Prolific (10-49), Superstar (50-99), Mega (100+).
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
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The skewed distribution of inventive output has important implications for the composition of the inventor workforce.
          The 43% of inventors who file only a single patent represent a large pool of one-time contributors, while the 12%
          of prolific, superstar, and mega inventors produce 61% of all patents. This concentration means that policies
          affecting the retention and productivity of serial inventors have disproportionate effects on the overall innovation system.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION C: Career Longevity (from career-trajectories)
          ═══════════════════════════════════════════════════════════════ */}

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

      {/* ═══════════════════════════════════════════════════════════════
          SECTION D: Inventor Career Trajectories (from career-trajectories)
          ═══════════════════════════════════════════════════════════════ */}

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

      <KeyInsight>
        <p>
          The career trajectory data paint a consistent picture: inventor productivity rises steeply
          in early career years, then plateaus without significant decline. The majority of prolific
          careers span 5-15 years, though a long tail of inventors sustains output for more than three
          decades. These patterns underscore the importance of the early career period in shaping
          long-term inventive output.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION E: Comeback Inventors (from career-trajectories)
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Comeback Inventors" />

      <Narrative>
        <p>
          A subset of inventors exhibit extended absences from the patent record before resuming patenting activity.
          These &quot;comeback&quot; inventors -- those with gaps of 5 or more years between patents --
          provide insights into <StatCallout value="career interruptions and reinventions" />.
        </p>
      </Narrative>

      {comebackData && comebackData.length > 0 && (() => {
        const totalCount = comebackData.reduce((s: number, d: ComebackInventor) => s + d.count, 0);
        const wtdAssignee = comebackData.reduce((s: number, d: ComebackInventor) => s + d.changed_assignee_pct * d.count, 0) / totalCount;
        const wtdCpc = comebackData.reduce((s: number, d: ComebackInventor) => s + d.changed_cpc_pct * d.count, 0) / totalCount;
        const wtdPatents = comebackData.reduce((s: number, d: ComebackInventor) => s + d.avg_patents_after * d.count, 0) / totalCount;
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

      <KeyInsight>
        <p>
          Comeback inventors demonstrate that career exits from the patent system are not always permanent.
          A meaningful share of returning inventors change both their employer and technology field upon return,
          suggesting that career interruptions often coincide with broader professional reinventions rather than
          simple resumptions of prior work.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION F: Quality Metrics — Serial Inventors vs. New Entrants
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Quality Metrics — Serial Inventors vs. New Entrants" />

      <Narrative>
        <p>
          Do experienced serial inventors produce higher-quality patents than new entrants? Comparing
          quality metrics across experience levels reveals whether the concentration of output among
          serial inventors is accompanied by a corresponding concentration of innovation quality.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-quality-exp-fwd-cites"
        title="Serial Inventors Consistently Earn More Forward Citations Than New Entrants"
        subtitle="Average forward citations per patent by inventor experience group, 1976-2025"
        caption="Average forward citations per patent by inventor experience group, 1976-2025. Recent years are affected by citation truncation; 2015 values offer the most reliable comparison. Data: PatentsView."
        insight="Serial inventors' patents attract more citations throughout the period, suggesting that experience confers an advantage in producing impactful inventions."
        loading={qbL}
        controls={fwdCitControls}
      >
        <PWLineChart
          data={fwdCitData ?? []}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel={fwdCitYLabel}
          truncationYear={2018}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-claims"
        title="Serial Inventors File Patents with Substantially More Claims"
        subtitle="Average number of claims per patent by inventor experience group, 1976-2025"
        caption="This chart compares the average claim count per patent between serial inventors and new entrants. Claim count serves as a proxy for patent breadth."
        insight="The persistent gap in claim counts suggests serial inventors draft broader patents, potentially reflecting greater familiarity with patent prosecution strategy."
        loading={qbL}
      >
        <PWLineChart
          data={pivotData(qualityByExp, 'avg_num_claims')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg Number of Claims"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-scope"
        title="Serial Inventors Patent Across a Wider Technology Scope"
        subtitle="Average technology scope (distinct CPC subclasses) per patent by experience group, 1976-2025"
        caption="This chart compares the average technology scope of patents filed by serial inventors versus new entrants. Scope measures the number of distinct technology classes assigned to each patent."
        insight="The broader scope of serial inventor patents reflects their tendency to work across multiple technology domains, leveraging cross-disciplinary knowledge accumulated over longer careers."
        loading={qbL}
      >
        <PWLineChart
          data={pivotData(qualityByExp, 'avg_scope')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg Scope"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-originality"
        title="Originality Scores Converge Between Serial and New-Entrant Inventors"
        subtitle="Average originality score per patent by experience group, 1976-2025"
        caption="This chart compares the average originality score (diversity of backward citation sources) for patents from serial inventors versus new entrants."
        insight="The near-convergence in originality scores suggests that while serial inventors produce more impactful patents by citation count, new entrants draw from comparably diverse knowledge bases."
        loading={qbL}
      >
        <PWLineChart
          data={pivotData(qualityByExp, 'avg_originality')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg Originality"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-generality"
        title="Patent Generality Has Declined for Both Groups Since the Mid-1990s"
        subtitle="Average generality score per patent by experience group, 1976-2025"
        caption="This chart compares the average generality score (diversity of forward citation destinations) for patents from serial inventors versus new entrants."
        insight="The declining generality for both groups reflects increasing technological specialization, with patents being cited within narrower technology domains over time."
        loading={qbL}
      >
        <PWLineChart
          data={pivotData(qualityByExp, 'avg_generality')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg Generality"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-self-cite"
        title="Serial Inventors Self-Cite at 4-5x the Rate of New Entrants"
        subtitle="Average self-citation rate per patent by experience group, 1976-2025"
        caption="This chart compares the average self-citation rate (share of backward citations to the inventor's own prior patents) for serial versus new-entrant inventors."
        insight="The large self-citation gap is structurally expected -- serial inventors have a larger body of prior work to reference -- but it also suggests they build more cumulatively on their own research trajectories."
        loading={qbL}
      >
        <PWLineChart
          data={pivotData(qualityByExp, 'avg_self_citation_rate')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Self-Citation Rate (%)"
          yFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-grant-lag"
        title="Grant Lag Rose for Both Groups Through 2010 Before Partially Recovering"
        subtitle="Average days from application to grant by experience group, 1976-2025"
        caption="This chart compares the average grant lag (days from filing to patent grant) for patents by serial inventors and new entrants."
        insight="The parallel trajectories indicate that prosecution delays affect both groups similarly, driven by USPTO workload rather than inventor experience level."
        loading={qbL}
      >
        <PWLineChart
          data={pivotData(qualityByExp, 'avg_grant_lag_days')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg Grant Lag (Days)"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quality-exp-productivity"
        title="Serial Inventors Produce 1.8 Times the Patents per Person as New Entrants"
        subtitle="Average patents per inventor per year by experience group, 1976-2025"
        caption="This chart compares the average number of patents filed per inventor per year for serial inventors versus new entrants."
        insight="The 1.8:1 productivity ratio has been stable over five decades, indicating a persistent structural difference in patenting intensity between experience groups."
        loading={pbL}
      >
        <PWLineChart
          data={pivotData(productivityByExp, 'avg_patents_per_inventor')}
          xKey="year"
          lines={[
            { key: 'serial', name: 'Serial Inventors', color: CHART_COLORS[0] },
            { key: 'new_entrant', name: 'New Entrants', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg Patents per Inventor"
          yFormatter={(v: number) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The quality metrics reveal that the serial inventor advantage extends well beyond volume. Serial inventors
          earn more forward citations, file broader claims, and patent across wider technology scopes. However,
          originality scores are comparable between groups, suggesting that new entrants draw from equally diverse
          knowledge bases. The most striking divergence is in self-citation rates, where serial inventors cite their
          own prior work at 4-5x the rate of newcomers, reflecting cumulative, path-dependent innovation trajectories.
        </p>
      </KeyInsight>

      <DescriptiveGapNote variant="serial-new" />

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING
          ═══════════════════════════════════════════════════════════════ */}

      <Narrative>
        <p>
          The patterns documented here -- rising new-entrant inflow alongside declining newcomer prevalence,
          extreme concentration of output among serial inventors, bimodal career survival, and the persistence
          of comeback inventors -- reveal a patent system increasingly shaped by a professional, repeat-inventor
          core. The next chapter, <Link href="/chapters/inv-gender" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Gender and Patenting</Link>,
          examines how these career and productivity patterns differ across gender lines, including the
          gender innovation gap and the quality implications of team composition.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "Annual first-time inventor entries peaked at 140,490 in 2019, but only 37-51% of inventors survive past five career years.",
          "Productivity rises from 1.4 to 2.1 patents per year as inventors gain experience, suggesting learning-by-doing effects.",
        ]}
        falsifiable="If rising productivity reflects learning rather than survivor bias, then inventors who remain active should show productivity gains even within the same firm and technology domain."
        nextAnalysis={{
          label: "Gender and Patenting",
          description: "The gender innovation gap — composition, trends, and quality differences",
          href: "/chapters/inv-gender",
        }}
      />

      <DataNote>
        First-time inventors are identified by their earliest patent filing date.
        Inventor segments are classified by total career patent count: One-Hit (1), Occasional (2-9),
        Prolific (10-49), Superstar (50-99), Mega (100+). Career longevity tracks the span from first
        to last patent year per inventor. Career curves use inventors with 5+ patents. Comeback inventors
        are those with gaps of 5+ years between consecutive patents.
      </DataNote>

      <RelatedChapters currentChapter={15} />
      <ChapterNavigation currentChapter={15} />
    </div>
  );
}
