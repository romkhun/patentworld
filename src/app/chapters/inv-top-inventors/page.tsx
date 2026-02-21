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
import { PWLollipopChart } from '@/components/charts/PWLollipopChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { RankingTable } from '@/components/chapter/RankingTable';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import type {
  SuperstarConcentration,
  ProlificInventor,
  StarInventorImpact,
} from '@/lib/types';

/* ── Local row types for new analyses ─────────────────────────── */

interface ExaminerInventorOverlap {
  unique_examiner_names: number;
  unique_inventor_names: number;
  name_matches: number;
}

interface MultiTypeInventor {
  career_length_bin: string;
  total_inventors: number;
  multi_type: number;
  multi_type_pct: number;
}
import Link from 'next/link';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import { DescriptiveGapNote } from '@/components/chapter/DescriptiveGapNote';
import { ConcentrationPanel } from '@/components/chapter/ConcentrationPanel';

export default function InvTopInventorsChapter() {
  /* ── data hooks ── */
  const { data: superstar, loading: ssL } =
    useChapterData<SuperstarConcentration[]>('chapter5/superstar_concentration.json');
  const { data: prolific, loading: prL } =
    useChapterData<ProlificInventor[]>('chapter5/prolific_inventors.json');
  const { data: starImpact, loading: siL } =
    useChapterData<StarInventorImpact[]>('chapter5/star_inventor_impact.json');
  const { data: qualityRank, loading: qrL } =
    useChapterData<any[]>('computed/quality_by_inventor_rank.json');
  const { data: prodRank } =
    useChapterData<any[]>('computed/inventor_productivity_by_rank.json');
  const { data: examinerOverlap, loading: eoL } =
    useChapterData<ExaminerInventorOverlap[]>('chapter13/examiner_inventor_overlap.json');
  const { data: multiType, loading: mtL } =
    useChapterData<MultiTypeInventor[]>('chapter13/multi_type_inventors.json');

  /* ── derived data ── */
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
    data: pivotData(qualityRank, 'avg_forward_citations'),
    xKey: 'year',
    citationKeys: ['top_inventor', 'other_inventor'],
    yLabel: 'Average Forward Citations',
  });

  return (
    <div>
      <ChapterHeader
        number={13}
        title="Top Inventors"
        subtitle="Superstar concentration, prolific inventors, and citation impact"
      />
      <MeasurementSidebar slug="inv-top-inventors" />

      <KeyFindings>
        <li>
          The top 5% of inventors (by cumulative output) account for 63.2% of all patents.
          Their annual share rose from 26% to 60% between 1976 and 2025, indicating rising
          concentration among repeat inventors.
        </li>
        <li>
          The most prolific inventor, {topInventorName}, holds 6,709 patents, and the top 100
          inventors each exceed 760 patents, predominantly concentrated in electronics and
          semiconductor fields.
        </li>
        <li>
          Citation impact among the 100 highest-citation inventors ranges from approximately 10 to 965 average
          citations per patent, demonstrating that prolificacy and impact are distinct dimensions
          of inventor performance.
        </li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Executive Summary
        </h2>
        <p className="text-sm leading-relaxed">
          Innovation output is increasingly concentrated among a small elite of repeat
          inventors. The top 5% (by cumulative output) account for 63.2% of all patents, with
          their annual share rising from 26% to 60% over five decades. The single most prolific
          inventor holds 6,709 patents. Yet prolificacy and citation impact are only weakly
          correlated — some high-volume filers average fewer than 10 citations per patent
          while others exceed 900.
        </p>
      </aside>

      <Narrative>
        <p>
          This chapter consolidates the evidence on top inventors — their growing concentration
          of patent output, their individual rankings, and the distinction between quantity and
          quality. Together, these perspectives illuminate the outsized role that a small cohort
          of professional inventors plays in the modern innovation system.
        </p>
      </Narrative>

      {/* ── Section A: Superstar Inventor Concentration ── */}
      <SectionDivider label="Superstar Inventor Concentration" />

      <Narrative>
        <p>
          The skewed distribution of individual productivity raises a broader structural question:
          is patent output becoming more concentrated among a small elite, or more broadly
          distributed over time? Tracking the share of patents attributable to the top 1% and
          top 5% of inventors by cumulative patent count provides an answer.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-superstar-concentration"
        title="The Top 5% of Inventors (by Cumulative Output) Account for 63.2% of All Patents; Annual Share Rose from 26% to 60%"
        subtitle="Annual share of patents attributable to the top 1% and top 5% of inventors by cumulative patent count, 1976–2025"
        caption="The figure tracks the percentage of patents each year attributable to the top 1% and top 5% of inventors by cumulative patent count. The upward trend in both series indicates increasing concentration of patent output among a small cohort of repeat inventors."
        insight="Rising concentration of patents among top inventors indicates that patent output is increasingly concentrated among professional, repeat inventors rather than occasional contributors."
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
          and the degree of concentration has increased substantially over the study period. Patenting is
          increasingly the domain of repeat, professional inventors, a pattern that parallels
          analogous trends in academic publishing and other knowledge-intensive fields. Policies
          that support inventor retention, mobility, and productivity may therefore have
          disproportionate effects on the overall innovation system.
        </p>
      </KeyInsight>

      <ConcentrationPanel outcome="Patent Output" entity="Inventors" top1={27.8} top5={63.2} gini={0.856} />

      <DescriptiveGapNote variant="top-inventors" />

      {/* ── Section B: Top Inventors (Number of Patents) ── */}
      <SectionDivider label="Top Inventors" />

      <Narrative>
        <p>
          Within this increasingly collaborative landscape, a small number of individuals are
          distinguished by their exceptionally high volume of patent output.{' '}
          <StatCallout value={topInventorName} /> holds the record for the most patents granted
          to a single inventor, but prolificacy alone does not fully characterize inventor
          performance.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-prolific-ranking"
        title="The Most Prolific Inventor Holds 6,709 Patents; Top 100 Each Exceed 760"
        subtitle="Top 100 inventors ranked by total utility patents granted, 1976–2025"
        caption="The figure ranks inventors by total utility patents granted from 1976 to 2025. The distribution is heavily right-skewed, with the top-ranked inventors holding thousands of patents each, predominantly in electronics and semiconductor fields."
        insight="The concentration of patents among a small number of prolific inventors raises questions regarding whether the patent system disproportionately rewards institutional resources rather than individual inventive capacity."
        loading={prL}
        height={1800}
      >
        <PWLollipopChart
          data={topInventors}
          xKey="label"
          valueKey="total_patents"
          valueName="Total Patents"
          color={CHART_COLORS[0]}
        />
      </ChartContainer>

      <RankingTable
        title="View top inventors as a data table"
        headers={['Inventor', 'Total Patents']}
        rows={(prolific ?? []).slice(0, 15).map((d) => [
          `${d.first_name} ${d.last_name}`.trim(),
          d.total_patents,
        ])}
        caption="Top 15 inventors by cumulative utility patent grants, 1976–2025. Source: PatentsView."
      />

      <Narrative>
        <p>
          The most prolific inventors are disproportionately concentrated in electronics and
          semiconductor fields, where rapid design iteration and modular innovation facilitate
          high patent output. Many of the top-ranked inventors are associated with large
          Japanese and Korean electronics firms that emphasize systematic patent generation.
        </p>
      </Narrative>

      {/* ── Section C: Inventor Impact ── */}
      <SectionDivider label="Inventor Impact" />

      <Narrative>
        <p>
          Prolificacy does not necessarily correspond to impact.{' '}
          <GlossaryTooltip term="forward citations">Forward citations</GlossaryTooltip> --
          the frequency with which an inventor&apos;s patents are cited by subsequent patents --
          indicate whether their innovations serve as{' '}
          <StatCallout value="foundational contributions" /> to future inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-citation-impact"
        title="Citation Impact Ranges from Approximately 10 to 965 Average Citations Among the 100 Highest-Citation Inventors"
        subtitle="Average and median forward citations per patent for the top 100 highest-citation inventors among prolific filers, based on patents granted through 2020"
        caption="The figure presents the average and median forward citations per patent for the top 100 highest-citation inventors among prolific filers, limited to patents granted through 2020. The data reveal substantial variation in citation impact, with some high-volume inventors averaging fewer than 10 citations per patent while others exceed 900."
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
          Prolificacy and impact constitute distinct dimensions of performance. Some inventors
          with fewer total patents generate substantially higher citation impact per patent,
          suggesting a more pronounced influence on their respective fields.
        </p>
      </KeyInsight>

      {/* ── Section D: Quality Metrics — Top Inventors versus Other ── */}
      <SectionDivider label="Quality Metrics: Top Inventors versus Other Inventors" />
      <Narrative>
        <p>
          This section compares quality indicators between prolific (top 12% by cumulative patent count) and other inventors
          over time, revealing how sustained patenting experience correlates with patent quality.
          The metrics span productivity, citation impact, claim breadth, technological scope,
          originality and generality of knowledge flows, self-citation behavior, and administrative
          grant lag. Together, these dimensions provide a multifaceted picture of whether top
          inventors produce not just more patents, but meaningfully different ones.
        </p>
      </Narrative>
      {/* D.i: Productivity — Avg patents per inventor */}
      <ChartContainer
        id="fig-productivity-by-rank"
        title="Top Inventors Average More Patents Per Year Than Other Inventors"
        subtitle="Average patents per inventor per year by rank, 1976–2025"
        caption="Average number of patents per inventor per year, comparing top-ranked inventors (top 12% by cumulative patent count, the computation threshold for the quality-by-rank analysis) to all others, 1976–2025. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(prodRank, 'avg_patents_per_inventor')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Patents per Inventor"
        />
      </ChartContainer>

      {/* D.ii: Forward Citations */}
      <ChartContainer
        id="fig-top-inv-fwd-citations"
        title="Top Inventors Earned 9.8 Forward Citations Per Patent versus 5.7 for Others (2015)"
        subtitle="Average forward citations per patent by inventor rank, 1976–2025"
        caption="Average forward citations per patent by inventor rank, 1976–2025. Recent years are affected by citation truncation; 2015 values offer the most reliable comparison. Data: PatentsView."
        height={400}
        loading={qrL}
        controls={fwdCitControls}
      >
        <PWLineChart
          data={fwdCitData ?? []}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel={fwdCitYLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      {/* D.iii: Claims */}
      <ChartContainer
        id="fig-top-inv-claims"
        title="Top Inventors' Patents Average 15.2 Claims versus 12.7 for Others (2024)"
        subtitle="Average number of claims per patent by inventor rank, 1976–2025"
        caption="Average number of claims per patent by inventor rank, 1976–2024. Higher claim counts may reflect broader patent scope or more complex inventions. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(qualityRank, 'avg_num_claims')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Claims"
        />
      </ChartContainer>

      {/* D.iv: Scope */}
      <ChartContainer
        id="fig-top-inv-scope"
        title="Top Inventor Patents Span 2.42 CPC Subclasses versus 2.37 for Others (2024)"
        subtitle="Average CPC subclasses per patent by inventor rank, 1976–2025"
        caption="Average number of distinct CPC subclasses per patent by inventor rank, 1976–2024. A higher scope indicates broader technological coverage within a single patent. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(qualityRank, 'avg_scope')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average CPC Subclasses"
        />
      </ChartContainer>

      {/* D.v: Originality */}
      <ChartContainer
        id="fig-top-inv-originality"
        title="Top Inventors Score 0.197 on the Originality Index versus 0.190 for Others (2024)"
        subtitle="Average originality index per patent by inventor rank, 1976–2025"
        caption="Average originality index (Herfindahl-based diversity of backward citation sources) per patent by inventor rank, 1976–2024. Higher values indicate citations drawn from more diverse technology classes. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(qualityRank, 'avg_originality')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Originality Index"
        />
      </ChartContainer>

      {/* D.vi: Generality */}
      <ChartContainer
        id="fig-top-inv-generality"
        title="Top Inventor Patents Score 0.035 on Generality versus 0.031 for Others (2024)"
        subtitle="Average generality index per patent by inventor rank, 1976–2025"
        caption="Average generality index (Herfindahl-based diversity of forward citation recipients) per patent by inventor rank, 1976–2024. Higher values indicate that a patent's influence spans more diverse technology fields. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(qualityRank, 'avg_generality')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Generality Index"
        />
      </ChartContainer>

      {/* D.vii: Self-Citation Rate */}
      <ChartContainer
        id="fig-top-inv-self-citation"
        title="Top Inventors Self-Cite at 15.0% versus 5.5% for Others (2024)"
        subtitle="Average self-citation rate per patent by inventor rank, 1976–2025"
        caption="Average share of backward citations that reference the same assignee's prior patents, by inventor rank, 1976–2024. Higher self-citation rates among top inventors may reflect deeper corporate patent portfolios. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(qualityRank, 'avg_self_citation_rate')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Self-Citation Rate"
          yFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
        />
      </ChartContainer>

      {/* D.viii: Grant Lag */}
      <ChartContainer
        id="fig-top-inv-grant-lag"
        title="Grant Lag Nearly Identical: 985 Days for Top Inventors versus 989 for Others (2024)"
        subtitle="Average grant lag in days per patent by inventor rank, 1976–2025"
        caption="Average number of days between patent filing and grant by inventor rank, 1976–2024. The convergence in grant lag suggests that prosecution timelines are driven more by USPTO capacity than inventor characteristics. Data: PatentsView."
        height={400}
        loading={qrL}
      >
        <PWLineChart
          data={pivotData(qualityRank, 'avg_grant_lag_days')}
          xKey="year"
          lines={[
            { key: 'top_inventor', name: 'Top Inventors', color: CHART_COLORS[0] },
            { key: 'other_inventor', name: 'Other Inventors', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Grant Lag (days)"
        />
      </ChartContainer>

      {/* ── Section E: Examiner-Inventor Overlap ── */}
      <SectionDivider label="Examiner-Inventor Overlap" />

      <Narrative>
        <p>
          A natural question is whether individuals who serve as USPTO patent examiners also
          appear in the inventor record. Using name matching — an inherently imprecise method --
          we estimate an upper bound on the number of individuals who have appeared in both roles.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-examiner-inventor-overlap"
        title="An Estimated 5,785 Individuals Appear as Both Patent Examiner and Inventor — an Upper Bound Based on Name Matching"
        subtitle="Count of unique names appearing in both the examiner and inventor records, based on exact first-name and last-name matching"
        caption="The table reports the number of unique names found in both the patent examiner and inventor records. Because name matching does not use disambiguated identifiers, this figure represents an upper bound that likely includes false positives from common names."
        insight="Even under generous name-matching assumptions, the overlap between examiners and inventors is small relative to the 4.1 million unique inventor names in the database."
        loading={eoL}
      >
        {examinerOverlap && examinerOverlap.length > 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-lg w-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Metric</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3">Unique Examiner Names</td>
                    <td className="text-right py-2 px-3 font-mono">{examinerOverlap[0].unique_examiner_names.toLocaleString('en-US')}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3">Unique Inventor Names</td>
                    <td className="text-right py-2 px-3 font-mono">{examinerOverlap[0].unique_inventor_names.toLocaleString('en-US')}</td>
                  </tr>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <td className="py-2 px-3 font-semibold">Name Matches (Upper Bound)</td>
                    <td className="text-right py-2 px-3 font-mono font-semibold">{examinerOverlap[0].name_matches.toLocaleString('en-US')}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                <strong>Caveat:</strong> This estimate relies on exact first-name and last-name matching and
                does not use disambiguated inventor or examiner identifiers. Common names will produce false
                positives, making this a likely overcount. The true overlap is almost certainly smaller than
                5,785 individuals.
              </p>
            </div>
          </div>
        )}
      </ChartContainer>

      {/* ── Section F: Multi-Type Inventor Trajectories ── */}
      <SectionDivider label="Multi-Type Inventor Trajectories" />

      <Narrative>
        <p>
          Beyond individual prolificacy, some inventors patent under multiple institution types
          over their careers — for example, filing patents through both a corporation and a
          university. The prevalence of such multi-type trajectories increases sharply with
          career length, suggesting that inventor mobility across institutional boundaries is a
          common feature of long patenting careers.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-multi-type-inventors"
        title="30.7% of Inventors with 10+ Patents Have Patented Under Multiple Institution Types"
        subtitle="Share of inventors who have patented under more than one assignee type (such as corporation and university), by career length bin"
        caption="The figure displays the percentage of inventors who have filed patents under more than one assignee type over their career, grouped by career length (number of patents). Multi-type patenting is negligible among single-patent inventors but rises to 30.7% among those with 10 or more patents."
        insight="The prevalence of multi-type inventor trajectories among prolific inventors suggests that institutional mobility — between firms, universities, and government — is a common feature of sustained patenting careers."
        loading={mtL}
      >
        {multiType && (
          <PWBarChart
            data={multiType.filter(d => d.career_length_bin !== '1').map(d => ({
              ...d,
              label: `${d.career_length_bin} patents`,
              multi_type_pct: d.multi_type_pct,
            }))}
            xKey="label"
            bars={[{ key: 'multi_type_pct', name: 'Multi-Type %', color: CHART_COLORS[0] }]}
            yLabel="Share (%)"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Multi-type inventor trajectories — where an individual patents under more than one
          institution type — are concentrated among prolific inventors. Only 8.4% of inventors
          with 2-4 patents have multi-type careers, rising to 18.4% for those with 5-9 patents
          and 30.7% for those with 10 or more. This pattern indicates that institutional mobility
          is closely linked to sustained inventive output.
        </p>
      </KeyInsight>

      {/* ── Closing Transition ── */}
      <Narrative>
        <p>
          The concentration and impact patterns documented here characterize the most prolific
          inventors as a group; the next chapter,{' '}
          <Link
            href="/chapters/inv-generalist-specialist/"
            className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors"
          >
            Generalist versus Specialist Inventors
          </Link>
          , examines whether these top inventors tend toward deep specialization or broad
          technological range, and how the balance between generalism and specialization has
          shifted over time.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "The top 5% of inventors (by cumulative output) account for 63.2% of all patents; their annual share rose from 26% to 60%, indicating extreme and increasing concentration of inventive output.",
          "The most prolific inventor, Shunpei Yamazaki, holds 6,709 US patents — nearly nine times the output of the median prolific inventor in the top 100.",
        ]}
        falsifiable="If superstar concentration reflects individual talent rather than institutional resources, then prolific inventors should maintain high citation impact even when they change employers."
        nextAnalysis={{
          label: "Generalist versus Specialist",
          description: "How technology specialization patterns affect patent quality and citation impact",
          href: "/chapters/inv-generalist-specialist/",
        }}
      />

      <DataNote>
        Superstar concentration is computed using cumulative patent counts per inventor.
        The top inventors ranking uses total career utility patents granted, 1976–2025.
        Citation impact uses forward citations for patents granted through 2020.
        Inventor disambiguation is provided by PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={13} />
      <ChapterNavigation currentChapter={13} />
    </div>
  );
}
