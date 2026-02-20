'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWConvergenceMatrix } from '@/components/charts/PWConvergenceMatrix';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { CHART_COLORS } from '@/lib/colors';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CompetingExplanations } from '@/components/chapter/CompetingExplanations';
import type { CrossDomain, ConvergenceEntry, ConvergenceDecomp, ConvergenceNearFar, ConvergenceTopAssignee, InterdisciplinarityTrend } from '@/lib/types';

interface IPCvsCPCConvergence {
  year: number;
  total_patents: number;
  ipc_multi_section_pct: number;
  cpc_multi_section_pct: number;
}

export default function SystemConvergenceChapter() {
  // Cross-domain convergence (area chart from patent-scope)
  const { data: crossDomain, loading: cdL } = useChapterData<CrossDomain[]>('chapter7/cross_domain.json');

  // Convergence matrix (from cross-field-convergence)
  const { data: convergenceData, loading: conL } = useChapterData<ConvergenceEntry[]>('chapter10/convergence_matrix.json');

  // Analysis 2: Convergence decomposition
  const { data: decomp, loading: dcL } = useChapterData<ConvergenceDecomp[]>('chapter10/convergence_decomposition.json');
  const { data: nearFar, loading: nfL } = useChapterData<ConvergenceNearFar[]>('chapter10/convergence_near_far.json');
  const { data: convTopAssignees, loading: ctaL } = useChapterData<ConvergenceTopAssignee[]>('chapter10/convergence_top_assignees.json');
  const { data: interTrend, loading: itL } = useChapterData<InterdisciplinarityTrend[]>('chapter10/interdisciplinarity_unified.json');

  // Analysis 11: CPC vs IPC convergence robustness check
  const { data: ipcVsCpc, loading: ivcL } = useChapterData<IPCvsCPCConvergence[]>('chapter4/ipc_vs_cpc_convergence.json');

  const convergenceEras = useMemo(() => {
    if (!convergenceData) return [];
    return [...new Set(convergenceData.map((d) => d.era))].sort();
  }, [convergenceData]);

  // Pivot near/far data: one row per year with near_share_pct and far_share_pct columns
  const nearFarPivot = useMemo(() => {
    if (!nearFar) return [];
    const years = [...new Set(nearFar.map((d) => d.year))].sort();
    return years.map((year) => {
      const row: Record<string, unknown> = { year };
      nearFar
        .filter((d) => d.year === year)
        .forEach((d) => {
          if (d.distance_type === 'near') row['near_share_pct'] = d.share_pct;
          if (d.distance_type === 'far') row['far_share_pct'] = d.share_pct;
        });
      return row;
    });
  }, [nearFar]);

  // Pivot top assignees: one row per year with a column per firm (top 5 only)
  const { topAssigneePivot, topFirms } = useMemo(() => {
    if (!convTopAssignees) return { topAssigneePivot: [], topFirms: [] };
    // Determine top 5 firms by total multi_count
    const firmTotals = new Map<string, number>();
    convTopAssignees.forEach((d) => {
      firmTotals.set(d.firm, (firmTotals.get(d.firm) ?? 0) + d.multi_count);
    });
    const sorted = [...firmTotals.entries()].sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5).map(([firm]) => firm);
    // Pivot
    const years = [...new Set(convTopAssignees.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      convTopAssignees
        .filter((d) => d.year === year && top5.includes(d.firm))
        .forEach((d) => {
          row[d.firm] = d.multi_count;
        });
      return row;
    });
    return { topAssigneePivot: pivoted, topFirms: top5 };
  }, [convTopAssignees]);

  return (
    <div>
      <ChapterHeader
        number={4}
        title="Convergence"
        subtitle="Cross-domain technology convergence"
      />
      <MeasurementSidebar slug="system-convergence" />

      <KeyFindings>
        <li>Multi-section patents rose from 21% to 41% of all grants between 1976 and 2025, signaling increasing technological convergence across once-separate domains.</li>
        <li>The G-H (Physics-Electricity) convergence pair rose from 12.5% to 37.5% of all cross-section patents between 1976-1995 and 2011-2025, reflecting intensifying cross-field integration.</li>
        <li>Increasing cross-pollination of technology domains indicates that the boundaries between fields are becoming more permeable, with inventions more frequently occurring at the intersection of multiple disciplines.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Technology domains that were once largely separate have become increasingly intertwined. Multi-section patents rose from 21% to 41% of all grants, while the G-H (Physics-Electricity) convergence pair grew from 12.5% to 37.5% of cross-section patents. These patterns reflect a fundamental structural shift: modern invention increasingly occurs at the intersection of multiple fields, driven by the pervasiveness of digital technology and the growing interdisciplinarity of research.
        </p>
      </aside>

      <Narrative>
        <p>
          The <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">preceding chapter</Link> examined how patent activity distributes across <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> technology fields and how those fields have grown at different rates. Yet the boundaries between technology fields are not fixed. As digital technology has become pervasive, inventions increasingly span multiple CPC sections, and once-separate domains have become deeply intertwined.
        </p>
        <p>
          This chapter examines cross-domain convergence from two complementary perspectives: the aggregate trend toward multi-section patents, which captures the overall rate of convergence, and the specific pairs of CPC sections that drive that convergence, which reveals where technology boundaries are most permeable. Together, these measures demonstrate that the patent system is no longer a collection of independent silos but an increasingly interconnected network of technological activity.
        </p>
      </Narrative>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Convergence Matrix */}
      {/* ------------------------------------------------------------------ */}

      <ChartContainer
        id="fig-cross-field-convergence-matrix"
        subtitle="Percentage of multi-section patents spanning each CPC section pair by era, measuring how technology boundaries have become more permeable."
        title="The G-H (Physics-Electricity) Convergence Pair Rose from 12.5% to 37.5% of All Cross-Section Patents Between 1976-1995 and 2011-2025"
        caption="This chart displays the percentage of multi-section patents that span each pair of CPC sections, by era. The G-H (Physics-Electricity) pair consistently dominates convergence, and its share has increased substantially in the 2011-2025 period as digital technology has permeated additional domains."
        insight="Technology boundaries appear increasingly permeable over time, with the Physics-Electricity convergence intensifying as digital technology extends across domains. This increasing cross-pollination has implications for patent scope and examination complexity."
        loading={conL}
        height={700}
      >
        {convergenceData && convergenceEras.length > 0 && (
          <PWConvergenceMatrix data={convergenceData} eras={convergenceEras} />
        )}
      </ChartContainer>

      <Narrative>
        <p>
          The convergence matrix reveals that cross-field integration is not uniformly distributed. The G-H (Physics-Electricity) pair has dominated convergence from the late 1990s onward, reflecting the deep integration of computing, electronics, and physics that characterizes the digital era. In the earliest period (1976-1995), B-C (Operations-Chemistry) and A-C (Human Necessities-Chemistry) pairs led convergence, but the pattern shifted substantially as digital technology became pervasive.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The G-H (Physics-Electricity) pair has dominated convergence from the late 1990s onward, reflecting
          the deep integration of computing, electronics, and physics. In the earliest era (1976-1995), B-C (Operations-Chemistry) and A-C (Human Necessities-Chemistry) pairs led convergence, but the pattern shifted
          substantially: in 2011-2025, G-H convergence has intensified as digital technology permeates
          an increasing number of domains. The growing overlap between A (Human Necessities) and G (Physics)
          in the 2011-2025 period is consistent with the rise of health technology and biomedical electronics.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Cross-Domain Area Chart */}
      {/* ------------------------------------------------------------------ */}

      <ChartContainer
        id="fig-patent-quality-cross-domain"
        subtitle="Annual patent counts by number of CPC sections spanned (1, 2, or 3+), shown as a stacked area to illustrate growing cross-domain convergence."
        title="Multi-Section Patents Rose from 21% to 41% of All Grants (1976-2025), Indicating Increasing Technological Convergence"
        caption="This chart presents the number of patents classified in a single CPC section, two sections, or three or more sections (excluding Y), displayed as a stacked area. The proportion of patents spanning multiple sections has increased over time, with three-or-more-section patents exhibiting the most pronounced growth."
        loading={cdL}
        height={500}
        insight="The rising share of cross-domain innovation suggests that technological boundaries are increasingly permeable, with inventions more frequently occurring at the intersection of multiple fields."
      >
        <PWAreaChart
          data={crossDomain ?? []}
          xKey="year"
          areas={[
            { key: 'single_section', name: 'Single Section', color: CHART_COLORS[0] },
            { key: 'two_sections', name: 'Two Sections', color: CHART_COLORS[2] },
            { key: 'three_plus_sections', name: 'Three+ Sections', color: CHART_COLORS[3] },
          ]}
          yLabel="Share of Patents (%)"
          stacked
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2011] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The share of patents spanning multiple <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections has increased over time, indicating
          growing <StatCallout value="technological convergence" />. Contemporary inventions
          increasingly draw on knowledge from multiple domains, a characteristic of the digital era
          in which software, electronics, and traditional engineering fields intersect.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The rise of multi-domain patents is consistent with a structural shift in the nature of
          invention. Technologies such as autonomous vehicles, wearable health monitors, and
          smart materials inherently span traditional boundaries between physics, chemistry,
          and engineering, potentially conferring an advantage upon organizations capable of integrating diverse expertise.
        </p>
      </KeyInsight>

      <CompetingExplanations
        finding="rising share of multi-section patents"
        explanations={[
          'AI and digital technologies may function as general-purpose technologies that naturally span traditional classification boundaries',
          'CPC reclassification updates may retroactively assign additional sections to older patents, inflating apparent convergence',
          'Deliberate corporate diversification strategies may drive firms to file patents spanning multiple technology domains',
          'Increasing complexity of modern inventions may inherently require components from multiple technology fields',
        ]}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 3. Convergence Decomposition: Within-Firm vs. Between-Firm */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Within-Firm vs. Between-Firm Convergence" />

      <Narrative>
        <p>
          The aggregate rise in multi-section patenting can be decomposed into two distinct sources using a shift-share framework. <em>Within-firm</em> convergence captures the extent to which individual organizations have broadened their technological scope over time, filing patents that span more CPC sections than they did previously. <em>Between-firm</em> convergence reflects compositional shifts in the population of patentees -- for instance, the growing share of firms that are inherently multi-domain (such as large technology conglomerates) relative to single-domain specialists. Understanding whether convergence is driven primarily by firms individually expanding their technological breadth or by structural changes in the composition of patenting organizations has important implications for innovation policy and competitive strategy.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-convergence-decomposition"
        subtitle="Shift-share decomposition of the multi-section patent rate into within-firm technological broadening and between-firm compositional change."
        title="Within-Firm Technological Breadth Drives Most of the Convergence Trend"
        caption="The left axis shows the overall multi-section patent rate over time, while the right axis decomposes the year-over-year change into within-firm and between-firm components. The within-firm component consistently exceeds the between-firm component, indicating that convergence is predominantly driven by individual organizations expanding their technological scope rather than by compositional shifts in the population of patentees."
        insight="The dominance of the within-firm component suggests that convergence is not merely an artifact of changing firm composition but reflects a genuine broadening of organizational technological capabilities over time."
        loading={dcL}
        height={500}
      >
        <PWLineChart
          data={decomp ?? []}
          xKey="year"
          lines={[
            { key: 'overall_multi_rate', name: 'Overall Multi-Section Rate', color: CHART_COLORS[0] },
            { key: 'within_firm', name: 'Within-Firm Component', color: CHART_COLORS[1], yAxisId: 'right' },
            { key: 'between_firm', name: 'Between-Firm Component', color: CHART_COLORS[3], yAxisId: 'right' },
          ]}
          yLabel="Multi-Section Rate (%)"
          rightYLabel="Decomposition Component"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          rightYFormatter={(v) => v.toFixed(3)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The shift-share decomposition reveals that within-firm technological broadening accounts for the majority of the convergence trend. Organizations are individually expanding the number of CPC sections their patents span, rather than the aggregate trend being driven by a changing mix of firm types. This finding suggests that convergence reflects a genuine strategic shift in how firms approach innovation -- increasingly drawing on knowledge and techniques from adjacent and distant technology fields to solve problems that were once addressed within narrower disciplinary boundaries.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Near vs. Far Field Convergence */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Near vs. Far Field Convergence" />

      <ChartContainer
        id="fig-convergence-near-far"
        subtitle="Share of multi-section patents involving near-field (adjacent CPC sections) vs. far-field (distant CPC sections) combinations over time."
        title="Near-Field Combinations Dominate But Far-Field Convergence Is Growing Faster"
        caption="This chart tracks the share of multi-section patents classified as near-field (spanning closely related CPC sections) versus far-field (spanning distant or traditionally unrelated sections). While near-field convergence accounts for the majority of cross-domain activity, far-field convergence has grown at a faster rate, suggesting that increasingly radical combinations of technology domains are becoming more common."
        insight="The accelerating growth of far-field convergence indicates that inventors are increasingly bridging distant technology domains, a pattern consistent with the hypothesis that the most novel innovations arise at the intersection of previously unconnected fields."
        loading={nfL}
        height={500}
      >
        <PWLineChart
          data={nearFarPivot}
          xKey="year"
          lines={[
            { key: 'near_share_pct', name: 'Near-Field Share (%)', color: CHART_COLORS[0] },
            { key: 'far_share_pct', name: 'Far-Field Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share of Multi-Section Patents (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          While near-field convergence -- combinations of closely related technology domains such as Physics and Electricity -- continues to account for the largest share of multi-section patents, far-field convergence has been growing at a notably faster rate. This acceleration of distant-field combinations is consistent with the emergence of fundamentally interdisciplinary technologies (such as bioelectronics, computational chemistry, and AI-driven materials science) that require integration of knowledge from traditionally separate scientific and engineering traditions. The growing share of far-field convergence suggests that the innovation frontier is increasingly defined by the ability to bridge distant knowledge domains.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Top Assignees in Multi-Section Patenting */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Top Assignees in Multi-Section Patenting" />

      <ChartContainer
        id="fig-convergence-top-assignees"
        subtitle="Annual multi-section patent counts for the five organizations with the highest total multi-section patent output."
        title="Leading Organizations Account for a Growing Share of Multi-Section Patents"
        caption="This chart tracks the annual volume of multi-section patents filed by the top five assignees ranked by cumulative multi-section patent count. The trajectories reveal which organizations have most aggressively expanded their technological breadth over time and how the concentration of convergent innovation among leading firms has evolved."
        insight="The concentration of multi-section patenting among a small number of large technology firms suggests that organizational scale and breadth of R&D capability are important enablers of cross-domain innovation."
        loading={ctaL}
        height={500}
      >
        <PWLineChart
          data={topAssigneePivot}
          xKey="year"
          lines={topFirms.map((firm, i) => ({
            key: firm,
            name: firm,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          yLabel="Multi-Section Patents"
          showEndLabels
        />
      </ChartContainer>

      <ChartContainer
        id="fig-interdisciplinarity-composite"
        title="Interdisciplinarity Has Increased Substantially Since 2014"
        subtitle="Z-scored composite index: mean scope, CPC sections per patent, and multi-section share, 1976–2024"
        loading={itL}
      >
        <PWLineChart
          data={interTrend ?? []}
          xKey="year"
          lines={[
            { key: 'z_composite', name: 'Composite Index (z-score)', color: CHART_COLORS[0] },
            { key: 'z_scope', name: 'Scope', color: CHART_COLORS[2], dashPattern: '8 4' },
            { key: 'z_multi_section', name: 'Multi-Section Share', color: CHART_COLORS[4], dashPattern: '4 4' },
          ]}
          yLabel="Z-Score"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          A small number of large organizations dominate multi-section patenting, and their share has generally increased over time. These firms -- typically large technology conglomerates with diversified R&D portfolios -- are disproportionately responsible for bridging technology domains. Their scale enables them to maintain research programs across multiple CPC sections simultaneously, facilitating the kind of cross-pollination that produces convergent inventions. This concentration has implications for competition policy: if cross-domain innovation increasingly requires the scale and scope of a major technology firm, barriers to entry for smaller or more specialized organizations may be rising.
        </p>
      </KeyInsight>

      {/* ── Conceptual Framework: Scope vs. Convergence ── */}

      <SectionDivider label="Conceptual Framework: Scope vs. Convergence" />

      <Narrative>
        <p>
          Interdisciplinarity in patenting can be decomposed along two distinct dimensions:
          <strong> scope</strong> (how many technology domains a single patent spans) and
          <strong> convergence</strong> (how frequently patents combine specific pairs of domains).
          These dimensions capture different aspects of cross-domain innovation and have distinct
          implications for the complexity and novelty of inventions.
        </p>
      </Narrative>

      <div className="my-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-border">
          <thead>
            <tr>
              <th className="border border-border bg-muted/50 p-3"></th>
              <th className="border border-border bg-muted/50 p-3 text-center font-semibold">Low Convergence<br /><span className="font-normal text-xs text-muted-foreground">Rare section pairs</span></th>
              <th className="border border-border bg-muted/50 p-3 text-center font-semibold">High Convergence<br /><span className="font-normal text-xs text-muted-foreground">Common section pairs</span></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border bg-muted/50 p-3 font-semibold">Narrow Scope<br /><span className="font-normal text-xs text-muted-foreground">1-2 CPC sections</span></td>
              <td className="border border-border p-3 text-center"><strong>Specialized</strong><br /><span className="text-xs text-muted-foreground">Traditional single-domain patents (e.g., mechanical engineering)</span></td>
              <td className="border border-border p-3 text-center"><strong>Incremental Bridge</strong><br /><span className="text-xs text-muted-foreground">Routine cross-domain (e.g., Physics+Electricity in electronics)</span></td>
            </tr>
            <tr>
              <td className="border border-border bg-muted/50 p-3 font-semibold">Broad Scope<br /><span className="font-normal text-xs text-muted-foreground">3+ CPC sections</span></td>
              <td className="border border-border p-3 text-center"><strong>Radical Recombination</strong><br /><span className="text-xs text-muted-foreground">Novel combinations of distant fields (e.g., bio+computation+materials)</span></td>
              <td className="border border-border p-3 text-center"><strong>Platform Innovation</strong><br /><span className="text-xs text-muted-foreground">Broad-scope patents in established convergence zones (e.g., IoT spanning G+H+B+F)</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <KeyInsight>
        <p>
          The 2&times;2 framework clarifies that not all interdisciplinary patents are alike. A patent spanning Physics and Electricity (high convergence, narrow scope) represents routine cross-domain activity, while a patent combining biotechnology, computation, and materials science (low convergence, broad scope) represents radical recombination. The data show that the fastest-growing category is broad-scope patents in established convergence zones -- platform innovations that integrate multiple well-trodden cross-domain pathways.
        </p>
      </KeyInsight>

      {/* ── Robustness: CPC vs IPC Convergence ── */}

      <SectionDivider label="Robustness Check: CPC vs. IPC Convergence" />

      <Narrative>
        <p>
          A natural concern with the convergence findings is whether they reflect genuine technological change or artifacts of the CPC classification system. To assess robustness, this section compares multi-section patent rates under both the <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> and the older <GlossaryTooltip term="IPC">IPC</GlossaryTooltip> classification systems. If the convergence trend is driven by CPC-specific reclassification or taxonomy changes, it should not appear under IPC.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-convergence-cpc-vs-ipc"
        title="Multi-Section Patent Share Shows Consistent Trends Under CPC (20.7% to 40.2%) and IPC (7.5% to 34.1%)"
        subtitle="Share of patents classified in multiple technology sections by year, comparing CPC and IPC classification systems"
        caption="The CPC multi-section rate (solid) and IPC multi-section rate (dashed) both show sustained increases over time, though at different absolute levels due to differences in classification granularity and coverage. The IPC series shows a gap during 2002-2004 when IPC data is sparse in PatentsView. Both systems confirm the convergence trend, indicating that the finding is robust to taxonomy choice."
        insight="Both classification systems show the same convergence trend, confirming the finding is robust to taxonomy choice."
        loading={ivcL}
      >
        {ipcVsCpc && ipcVsCpc.length > 0 ? (
          <PWLineChart
            data={ipcVsCpc}
            xKey="year"
            lines={[
              { key: 'cpc_multi_section_pct', name: 'CPC Multi-Section (%)', color: CHART_COLORS[0] },
              { key: 'ipc_multi_section_pct', name: 'IPC Multi-Section (%)', color: CHART_COLORS[3], dashPattern: '8 4' },
            ]}
            yLabel="Multi-Section Share (%)"
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Both classification systems show the same convergence trend, confirming that the finding is robust to taxonomy choice. The CPC system reports higher absolute multi-section rates (20.7% in 1976 rising to 40.2% by 2024) because CPC assigns more classification codes per patent than IPC. Under IPC, the multi-section rate rose from 7.5% to 34.1% over the same period. The parallel trajectories provide strong evidence that the rise in cross-domain patenting reflects genuine technological change rather than a classification artifact.
        </p>
      </KeyInsight>

      {/* ── Closing Transition ── */}

      <Narrative>
        The first four chapters established how the patent system grew, which technology fields fueled that expansion, and how those fields increasingly converge across once-separate domains. The analysis now turns to the language of patents themselves. The shift from chemistry to digital technology is visible not only in formal classification codes but in the words inventors use to describe their work. <Link href="/chapters/system-language" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Language of Innovation</Link> applies unsupervised text analysis to five decades of patent abstracts to uncover the latent thematic structure of US patenting.
      </Narrative>

      <InsightRecap
        learned={[
          "Multi-section patents rose from 21% to 41% of all grants, signaling increasing technological convergence across once-separate domains.",
          "The G-H (Physics-Electricity) convergence pair grew from 12.5% to 37.5% of cross-section patents between 1976-1995 and 2011-2025.",
        ]}
        falsifiable="If convergence is driven by genuine interdisciplinarity rather than CPC reclassification artifacts, then text-based measures of thematic overlap (Chapter 5) should confirm the same trend."
        nextAnalysis={{
          label: "The Language of Innovation",
          description: "Semantic analysis reveals the latent thematic structure beneath formal classification codes",
          href: "/chapters/system-language",
        }}
      />

      <DataNote>
        Cross-domain analysis counts distinct CPC sections per patent (excluding section Y).
        Technology convergence measures the co-occurrence of CPC section pairs on multi-section patents by era.
        Convergence decomposition uses a shift-share framework to separate within-firm technological broadening from between-firm compositional change.
        Near-field and far-field classification is based on the taxonomic distance between CPC sections.
        All data computed from PatentsView following the framework of Jaffe and de Rassenfosse (2017).
      </DataNote>

      <RelatedChapters currentChapter={4} />
      <ChapterNavigation currentChapter={4} />
    </div>
  );
}
