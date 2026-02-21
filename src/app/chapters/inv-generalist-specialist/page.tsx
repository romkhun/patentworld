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
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { CHART_COLORS } from '@/lib/colors';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import type { InventorDrift } from '@/lib/types';

/* ── Local row types for new analyses ─────────────────────────── */

interface NplByInventorType {
  inventor_type: string;
  patent_count: number;
  avg_npl: number;
  median_npl: number;
}
import Link from 'next/link';
import { DescriptiveGapNote } from '@/components/chapter/DescriptiveGapNote';

export default function InvGeneralistSpecialistChapter() {
  const { data: driftData, loading: drL } = useChapterData<InventorDrift[]>('company/inventor_drift.json');
  const { data: qualitySpec, loading: qsL } = useChapterData<any[]>('computed/quality_by_specialization.json');
  const { data: prodSpec, loading: psL } = useChapterData<any[]>('computed/inventor_productivity_by_specialization.json');
  const { data: nplByType, loading: nplL } = useChapterData<NplByInventorType[]>('chapter14/npl_by_inventor_type.json');

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
    data: pivotData(qualitySpec, 'avg_forward_citations'),
    xKey: 'year',
    citationKeys: ['specialist', 'generalist'],
    yLabel: 'Average Forward Citations',
  });

  return (
    <div>
      <ChapterHeader
        number={14}
        title="Generalist versus Specialist"
        subtitle="Technology specialization patterns and quality differences"
      />
      <MeasurementSidebar slug="inv-generalist-specialist" />

      <KeyFindings>
        <li>The share of specialist inventors rose from 20% in the 1970s to 48% in the 2020s, while the share of generalists declined correspondingly.</li>
        <li>Specialization trends are consistent with the growing depth and complexity of modern technology fields, requiring deeper expertise within narrower domains.</li>
        <li>Despite the specialist trend, generalists who span multiple CPC sections remain a persistent minority across all decades.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Innovation is increasingly the domain of specialist inventors: their share rose from 20% to 48% over five decades, while generalists declined. Yet generalists persist as a meaningful minority, and the quality implications of this shift warrant systematic investigation.
        </p>
      </aside>

      <Narrative>
        <p>
          The preceding chapter on <Link href="/chapters/inv-top-inventors/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Top Inventors</Link> examined
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

      {/* ── Section A: Technology Specialization versus Generalism ── */}
      <SectionDivider label="Technology Specialization versus Generalism" />

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
        caption="The figure displays the share of prolific inventors (those with 10 or more patents) classified as specialist, moderate, or generalist by the decade of their first patent. The proportion of specialists has risen over time, while generalists have declined as a share of the total."
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
            yFormatter={(v) => `${Number(v).toFixed(1)}%`}
            yDomain={[0, 100]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The steady rise of specialist inventors from 20% to 48% of the prolific inventor workforce
          reflects a broader structural trend in modern innovation. As technology fields grow more complex
          and knowledge-intensive, inventors increasingly concentrate their efforts within narrower domains.
          Yet the persistence of generalists — accounting for roughly one in twenty prolific inventors in
          the most recent decade — suggests that cross-domain breadth continues to offer value in the
          patent system.
        </p>
      </KeyInsight>

      <DescriptiveGapNote variant="team-size" />

      {/* ── Section B: Quality Metrics — Generalist versus Specialist ── */}
      <SectionDivider label="Quality Metrics: Generalist versus Specialist Inventors" />
      <Narrative>
        <p>
          The rise of specialist inventors raises an important question: does specialization improve patent quality? This section compares quality indicators between generalist and specialist inventors over time.
        </p>
      </Narrative>
      {/* B.i — Forward Citations */}
      <ChartContainer
        id="fig-spec-fwd-citations"
        title="Generalists Earned 9.3 Forward Citations Per Patent versus 8.2 for Specialists (2015)"
        subtitle="Average forward citations per patent by inventor type, 1976-2025"
        caption="Average forward citations per patent by inventor specialization type, 1976-2025. Recent years are affected by citation truncation; 2015 values offer the most reliable comparison. Data: PatentsView."
        loading={qsL}
        height={400}
        controls={fwdCitControls}
      >
        <PWLineChart
          data={fwdCitData ?? []}
          xKey="year"
          lines={[
            { key: 'specialist', name: 'Specialists', color: CHART_COLORS[0] },
            { key: 'generalist', name: 'Generalists', color: CHART_COLORS[1] },
          ]}
          yLabel={fwdCitYLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      {/* B.ii — Claims */}
      <ChartContainer
        id="fig-spec-claims"
        title="Specialists Average 15.2 Claims Per Patent versus 14.3 for Generalists (2024)"
        subtitle="Average number of claims per patent by inventor type, 1976-2025"
        caption="Average number of claims per patent by inventor specialization type, 1976-2024. Specialists consistently file patents with slightly more claims, suggesting more detailed claim structures. Data: PatentsView."
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
          yLabel="Average Claims"
        />
      </ChartContainer>

      {/* B.iii — Scope */}
      <ChartContainer
        id="fig-spec-scope"
        title="Generalist Patents Span 2.51 CPC Subclasses versus 2.22 for Specialists (2024)"
        subtitle="Average patent scope (CPC subclass count) by inventor type, 1976-2025"
        caption="Average number of distinct CPC subclasses per patent by inventor specialization type, 1976-2024. The persistent gap indicates that generalist patents span broader technological coverage. Data: PatentsView."
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
          yLabel="Average CPC Subclasses"
        />
      </ChartContainer>

      {/* B.iv — Originality */}
      <ChartContainer
        id="fig-spec-originality"
        title="Generalists Score 0.212 on the Originality Index versus 0.165 for Specialists (2024)"
        subtitle="Average originality index by inventor type, 1976-2025"
        caption="Average originality index (Herfindahl-based diversity of backward citation sources) per patent by inventor specialization type, 1976-2024. Generalists consistently draw on more technologically diverse prior art. Data: PatentsView."
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
          yLabel="Average Originality Index"
        />
      </ChartContainer>

      {/* B.v — Generality */}
      <ChartContainer
        id="fig-spec-generality"
        title="Generalist Patents Score 0.040 on Generality versus 0.024 for Specialists (2024)"
        subtitle="Average generality index by inventor type, 1976-2025"
        caption="Average generality index (Herfindahl-based diversity of forward citation recipients) per patent by inventor specialization type, 1976-2024. Higher generality among generalist patents indicates broader downstream influence across technology fields. Data: PatentsView."
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
          yLabel="Average Generality Index"
        />
      </ChartContainer>

      {/* B.vi — Self-Citation Rate */}
      <ChartContainer
        id="fig-spec-self-citation"
        title="Generalists Self-Cite at 13.7% versus 10.7% for Specialists (2024)"
        subtitle="Average self-citation rate by inventor type, 1976-2025"
        caption="Average share of backward citations that reference the same assignee's prior patents, by inventor specialization type, 1976-2024. Generalists' higher self-citation rate may reflect broader engagement with their organization's patent portfolio. Data: PatentsView."
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
          yLabel="Average Self-Citation Rate"
          yFormatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </ChartContainer>

      {/* B.vii — Grant Lag */}
      <ChartContainer
        id="fig-spec-grant-lag"
        title="Specialists Wait 1,011 Days for Grant versus 973 for Generalists (2024)"
        subtitle="Average grant lag in days by inventor type, 1976-2025"
        caption="Average number of days between patent filing and grant by inventor specialization type, 1976-2024. The gap has narrowed considerably from earlier decades when specialists faced substantially longer prosecution times. Data: PatentsView."
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
          yLabel="Average Grant Lag (days)"
        />
      </ChartContainer>

      {/* B.viii — Productivity */}
      <ChartContainer
        id="fig-spec-productivity"
        title="Specialists Are More Productive Than Generalists in Patents per Inventor"
        subtitle="Average patents per inventor by type, 1976-2025"
        caption="Average number of patents per inventor per year by specialization type, 1976-2025. Specialists consistently have higher per-capita patent output, consistent with the efficiency gains of focused domain expertise. Data: PatentsView."
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
          yLabel="Average Patents per Inventor"
        />
      </ChartContainer>

      {/* ── Section C: Science Linkage by Inventor Type ── */}
      <SectionDivider label="Science Linkage by Inventor Type" />

      <Narrative>
        <p>
          Non-patent literature (NPL) citations in a patent&apos;s references provide a measure of
          the extent to which an invention draws on scientific knowledge. Comparing NPL citation
          rates between specialist and generalist inventors reveals whether deeper domain focus
          corresponds to greater reliance on the scientific literature.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-npl-by-inventor-type"
        title="Specialist Inventors Cite 12.3 Non-Patent References on Average versus 10.9 for Generalists"
        subtitle="Average and median non-patent literature (NPL) citations per patent by inventor type (specialist versus generalist), among prolific inventors with 10+ patents"
        caption="The figure compares the average non-patent literature citation count per patent between specialist and generalist inventors. Specialists cite slightly more scientific literature per patent on average, though the median for both groups is 1, reflecting the highly skewed distribution of NPL citations."
        insight="The higher average NPL citation count for specialists suggests that deeper domain focus is associated with greater engagement with the scientific literature, though the skewed distribution (median of 1 for both groups) indicates that most patents cite very few non-patent references regardless of inventor type."
        loading={nplL}
      >
        {nplByType && (
          <PWBarChart
            data={nplByType.map(d => ({
              ...d,
              label: d.inventor_type.charAt(0).toUpperCase() + d.inventor_type.slice(1),
            }))}
            xKey="label"
            bars={[
              { key: 'avg_npl', name: 'Average NPL Citations', color: CHART_COLORS[0] },
              { key: 'median_npl', name: 'Median NPL Citations', color: CHART_COLORS[2] },
            ]}
            yLabel="NPL Citations per Patent"
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Specialist inventors cite non-patent literature at a slightly higher rate than
          generalists (12.3 versus 10.9 average NPL citations per patent), consistent with the
          interpretation that deeper domain focus is associated with greater reliance on scientific
          knowledge. However, the median for both groups is just 1, indicating that most patents
          cite very few non-patent references regardless of inventor type. The science linkage
          gap between specialists and generalists is modest and attributable to the right tail of the
          distribution.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The specialization trends documented here describe the breadth of inventors&apos; technological
          focus; the next chapter, <Link href="/chapters/inv-serial-new/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Serial Inventors versus New Entrants</Link>,
          examines career dynamics including inventor entry, survival, and attrition patterns over time.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "Specialist inventors rose from 20% to 48% of the inventor workforce, reflecting the growing technical complexity of innovation.",
          "Generalists earn 9.3 forward citations per patent versus 8.2 for specialists and score higher on originality (0.212 versus 0.165).",
        ]}
        falsifiable="If generalist advantage in citations reflects genuine breadth rather than selection into high-citation fields, then the gap should persist within technology domains."
        nextAnalysis={{
          label: "Serial versus New Inventors",
          description: "Career patterns, inventor survival rates, and the productivity lifecycle of patent inventors",
          href: "/chapters/inv-serial-new",
        }}
      />

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
