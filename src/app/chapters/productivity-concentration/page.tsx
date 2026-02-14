'use client';

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
import { CHART_COLORS } from '@/lib/colors';
import type {
  SuperstarConcentration,
  InventorSegment, InventorSegmentTrend,
  InventorDrift,
} from '@/lib/types';
import Link from 'next/link';
import { formatCompact } from '@/lib/formatters';

export default function ProductivityConcentration() {
  const { data: superstar, loading: ssL } = useChapterData<SuperstarConcentration[]>('chapter5/superstar_concentration.json');
  const { data: segments, loading: segL } = useChapterData<InventorSegment[]>('chapter5/inventor_segments.json');
  const { data: segTrend, loading: stL } = useChapterData<InventorSegmentTrend[]>('chapter5/inventor_segments_trend.json');
  const { data: driftData, loading: drL } = useChapterData<InventorDrift[]>('company/inventor_drift.json');

  return (
    <div>
      <ChapterHeader
        number={19}
        title="Productivity Concentration"
        subtitle="Distribution of inventive output across inventor segments"
      />

      <KeyFindings>
        <li>Just 12% of inventors (Prolific, Superstar, and Mega segments) produce 61% of total patent output, while 43% of inventors file only a single patent.</li>
        <li>The top 5% of inventors by cumulative patent count grew from accounting for 26% to 60% of annual patent output between 1976 and 2025.</li>
        <li>The share of specialist inventors rose from 20% in the 1970s to 48% in the 2020s, while generalists declined as a share of the total.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Innovation output is extremely concentrated: 12% of inventors produce 61% of all patents, while 43% of inventors file only once. The top 5% of inventors grew from 26% to 60% of annual output over five decades. Specialization has also intensified, with the share of specialist inventors rising from 20% to 48%, consistent with the growing depth and complexity of modern technology fields.
        </p>
      </aside>

      <Narrative>
        <p>
          The preceding chapter on <Link href="/chapters/inventor-productivity" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Inventor Productivity</Link> examined
          team size trends and the most prolific individual inventors. This chapter broadens the lens to
          examine how inventive output is distributed across the full population of inventors, revealing
          a markedly skewed distribution with important implications for innovation policy.
        </p>
        <p>
          Segmenting inventors by total patent count and tracking the concentration of output over time
          shows that patenting is increasingly the domain of repeat, professional inventors. A final
          dimension concerns the breadth of technological focus, as the share of specialist inventors
          has risen steadily at the expense of generalists.
        </p>
      </Narrative>

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

      <ChartContainer
        id="fig-inventors-one-hit-trend"
        title="The Share of Single-Patent Inventors Dipped from 40% in the Early 1980s to 36% in the 2000s Before Rising to 45% by 2020"
        subtitle="Percentage of active inventors each year who have filed exactly one patent, tracking the prevalence of one-time filers over time"
        caption="This chart displays the percentage of active inventors each year who have filed exactly one patent in the dataset. The gradual decline suggests increasing professionalization of patenting activity over the study period."
        insight="The declining share of single-patent inventors from 40% to 36% before rising to 45% indicates that patenting concentration among repeat filers has fluctuated over time, potentially reflecting changing costs and complexity of navigating the patent system."
        loading={stL}
      >
        <PWLineChart
          data={segTrend ?? []}
          xKey="year"
          lines={[{ key: 'one_hit_pct', name: 'Single-Patent Inventor Share (%)', color: CHART_COLORS[3] }]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </ChartContainer>

      <SectionDivider label="Superstar Inventor Concentration" />
      <Narrative>
        <p>
          The skewed distribution of individual productivity raises a broader structural question:
          is innovation output becoming more concentrated among a small elite, or more broadly distributed
          over time? Tracking the share of patents attributable to the top 1% and top 5% of inventors
          by cumulative patent count provides an answer.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-inventors-superstar-concentration"
        title="The Top 5% of Inventors Grew from 26% to 60% of Annual Patent Output, 1976-2025"
        subtitle="Annual share of patents attributable to the top 1% and top 5% of inventors by cumulative patent count, 1976-2025"
        caption="This chart tracks the percentage of patents each year attributable to the top 1% and top 5% of inventors by cumulative patent count. The upward trend in both series indicates increasing concentration of patent output among a small cohort of repeat inventors."
        insight="Rising concentration of patents among top inventors indicates that innovation output is increasingly driven by professional, repeat inventors rather than occasional contributors."
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
          The skewed distribution of inventive output has important implications for innovation
          policy. The top 5% of inventors account for a growing share of total patent output,
          and this concentration has increased substantially over the study period. Patenting is
          increasingly the domain of repeat, professional inventors, a pattern that parallels analogous trends in academic publishing
          and other knowledge-intensive fields. Policies that support inventor retention, mobility, and productivity
          may therefore have disproportionate effects on the overall innovation system.
        </p>
      </KeyInsight>

      <SectionDivider label="Technology Specialization vs. Generalism" />

      <Narrative>
        <p>
          A final dimension of what inventors do concerns the breadth of their technological focus. Using the{' '}
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
            yFormatter={(v) => `${v}%`}
            yDomain={[0, 100]}
          />
        ) : <div />}
      </ChartContainer>

      <Narrative>
        <p>
          The concentration and specialization patterns documented here describe what inventors produce; the next chapter, <Link href="/chapters/career-trajectories" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Career Trajectories</Link>, examines how inventor careers unfold over time, including survival patterns, productivity arcs, and inter-organizational mobility.
        </p>
      </Narrative>

      <DataNote>
        Superstar concentration is computed using cumulative patent counts per inventor.
        Inventor segments are classified by total career patent count: One-Hit (1), Occasional (2-9),
        Prolific (10-49), Superstar (50-99), Mega (100+). Specialization analysis uses
        inventors with 10+ patents and classifies them by Shannon entropy of CPC section distribution.
      </DataNote>

      <RelatedChapters currentChapter={19} />
      <ChapterNavigation currentChapter={19} />
    </div>
  );
}
