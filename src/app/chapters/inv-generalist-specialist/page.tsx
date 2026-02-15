'use client';

import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { CHART_COLORS } from '@/lib/colors';
import type { InventorDrift } from '@/lib/types';
import Link from 'next/link';

export default function InvGeneralistSpecialistChapter() {
  const { data: driftData, loading: drL } = useChapterData<InventorDrift[]>('company/inventor_drift.json');
  const { data: qualitySpec, loading: qsL } = useChapterData<any[]>('computed/quality_by_specialization.json');
  const { data: prodSpec, loading: psL } = useChapterData<any[]>('computed/inventor_productivity_by_specialization.json');

  const pivotData = (raw: any[] | null, metric: string) => {
    if (!raw) return [];
    const byYear: Record<number, any> = {};
    for (const r of raw) {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.group] = r[metric];
    }
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  };

  return (
    <div>
      <ChapterHeader
        number={14}
        title="Generalist vs. Specialist"
        subtitle="Technology specialization patterns and quality differences"
      />

      <KeyFindings>
        <li>The share of specialist inventors rose from 20% in the 1970s to 48% in the 2020s, while the share of generalists declined correspondingly.</li>
        <li>Specialization trends are consistent with the growing depth and complexity of modern technology fields, requiring deeper expertise within narrower domains.</li>
        <li>Despite the specialist trend, generalists who span multiple CPC sections remain a persistent minority across all decades.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Innovation is increasingly the domain of specialist inventors: their share rose from 20% to 48% over five decades, while generalists declined. Yet generalists persist as a meaningful minority, and the quality implications of this shift warrant systematic investigation.
        </p>
      </aside>

      <Narrative>
        <p>
          The preceding chapter on <Link href="/chapters/inv-top-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Top Inventors</Link> examined
          superstar concentration and the most prolific individual inventors. This chapter narrows the focus
          to the breadth of technological engagement: are today&apos;s inventors becoming more specialized, or do
          generalists who span multiple technology domains remain competitive?
        </p>
        <p>
          Understanding the balance between specialization and generalism matters for innovation policy.
          Specialist inventors may drive incremental advances within established fields, while generalists
          may facilitate cross-domain knowledge transfer and combinatorial invention. This chapter first
          documents the long-run shift toward specialization, then systematically compares
          quality metrics between the two groups.
        </p>
      </Narrative>

      {/* ── Section A: Technology Specialization vs. Generalism ── */}
      <SectionDivider label="Technology Specialization vs. Generalism" />

      <Narrative>
        <p>
          Using the{' '}
          <GlossaryTooltip term="Shannon entropy">Shannon entropy</GlossaryTooltip> of
          each inventor&apos;s CPC section distribution, prolific inventors (those with 10 or more patents) are classified
          as <StatCallout value="specialists, moderates, or generalists" />.
          Specialists concentrate their patents within a single CPC section, generalists spread activity across
          multiple sections, and moderates fall in between.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-specialization-trend"
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

      <KeyInsight>
        <p>
          The steady rise of specialist inventors from 20% to 48% of the prolific inventor workforce
          reflects a broader structural trend in modern innovation. As technology fields grow more complex
          and knowledge-intensive, inventors increasingly concentrate their efforts within narrower domains.
          Yet the persistence of generalists — accounting for roughly one in five prolific inventors even in
          the most recent decade — suggests that cross-domain breadth continues to offer value in the
          patent system.
        </p>
      </KeyInsight>

      {/* ── Section B: Quality Metrics — Generalist vs. Specialist ── */}
      <SectionDivider label="Quality Metrics: Generalist vs. Specialist Inventors" />
      <Narrative>
        <p>
          The rise of specialist inventors raises an important question: does specialization improve patent quality? This section compares quality indicators between generalist and specialist inventors over time.
        </p>
      </Narrative>
      {/* B.i — Forward Citations */}
      <ChartContainer
        id="fig-spec-fwd-citations"
        title="Generalists Achieve Higher Forward Citation Counts Than Specialists"
        subtitle="Average forward citations per patent by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_forward_citations')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Forward Citations"
        />
      </ChartContainer>

      {/* B.ii — Claims */}
      <ChartContainer
        id="fig-spec-claims"
        title="Specialist Patents Contain Slightly More Claims on Average"
        subtitle="Average number of claims per patent by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_num_claims')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Claims"
        />
      </ChartContainer>

      {/* B.iii — Scope */}
      <ChartContainer
        id="fig-spec-scope"
        title="Generalist Patents Span More CPC Subclasses Than Specialist Patents"
        subtitle="Average patent scope (CPC subclass count) by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_scope')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. CPC Subclasses"
        />
      </ChartContainer>

      {/* B.iv — Originality */}
      <ChartContainer
        id="fig-spec-originality"
        title="Generalists Draw on More Diverse Prior Art Than Specialists"
        subtitle="Average originality index by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_originality')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Originality Index"
        />
      </ChartContainer>

      {/* B.v — Generality */}
      <ChartContainer
        id="fig-spec-generality"
        title="Generalist Patents Are Cited Across a Wider Range of Fields"
        subtitle="Average generality index by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_generality')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Generality Index"
        />
      </ChartContainer>

      {/* B.vi — Self-Citation Rate */}
      <ChartContainer
        id="fig-spec-self-citation"
        title="Specialists Exhibit Higher Self-Citation Rates Than Generalists"
        subtitle="Average self-citation rate by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_self_citation_rate')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Self-Citation Rate"
          yFormatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </ChartContainer>

      {/* B.vii — Grant Lag */}
      <ChartContainer
        id="fig-spec-grant-lag"
        title="Grant Lag Has Converged Between Generalists and Specialists Over Time"
        subtitle="Average grant lag in days by inventor type, 1976-2025"
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualitySpec, 'avg_grant_lag_days')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Grant Lag (days)"
        />
      </ChartContainer>

      {/* B.viii — Productivity */}
      <ChartContainer
        id="fig-spec-productivity"
        title="Specialists Are More Productive Than Generalists in Patents per Inventor"
        subtitle="Average patents per inventor by type, 1976-2025"
        loading={psL}
        height={400}
      >
        <PWLineChart
          data={pivotData(prodSpec, 'avg_patents_per_inventor')}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel="Avg. Patents per Inventor"
        />
      </ChartContainer>

      <Narrative>
        <p>
          The specialization trends documented here describe the breadth of inventors&apos; technological
          focus; the next chapter, <Link href="/chapters/inv-serial-new" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Serial Inventors vs. New Entrants</Link>,
          examines career dynamics including inventor entry, survival, and attrition patterns over time.
        </p>
      </Narrative>

      <DataNote>
        Specialization analysis uses inventors with 10 or more patents and classifies them by Shannon entropy
        of their CPC section distribution. Specialists concentrate their patents within a single CPC section,
        generalists spread activity across multiple sections, and moderates fall in between. Quality metrics
        in Section B are computed from forward citations, claims, scope, originality, generality,
        self-citation rate, grant lag, and inventor productivity.
      </DataNote>

      <RelatedChapters currentChapter={14} />
      <ChapterNavigation currentChapter={14} />
    </div>
  );
}
