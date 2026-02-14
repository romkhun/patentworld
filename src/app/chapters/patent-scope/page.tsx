'use client';

import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  QualityTrend,
  CrossDomain,
  ClaimsAnalysis,
} from '@/lib/types';

export default function PatentScope() {
  // Patent Claims (from old Innovation Dynamics chapter)
  const { data: claimsData, loading: clL } = useChapterData<{ trends: ClaimsAnalysis[] }>('company/claims_analysis.json');

  // Scope & Breadth (from old Patent Quality chapter)
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');

  // Cross-Domain Convergence (from old Innovation Dynamics chapter)
  const { data: crossDomain, loading: cdL } = useChapterData<CrossDomain[]>('chapter7/cross_domain.json');

  return (
    <div>
      <ChapterHeader
        number={28}
        title="Patent Scope"
        subtitle="Claim counts, CPC breadth, and cross-domain convergence"
      />

      <KeyFindings>
        <li>Median patent claims doubled from 8 to 18 between 1976 and 2025, reflecting increasingly sophisticated patent drafting strategies and broader legal scope.</li>
        <li>Average patent scope grew from 1.8 to nearly 2.5 <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses per patent, indicating growing technological interdisciplinarity.</li>
        <li>Multi-section patents rose from 21% to 41% of all grants, signaling increasing technological convergence across once-separate domains.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Patent scope has expanded along multiple dimensions since the 1970s. Median claims doubled from 8 to 18, average CPC subclasses per patent grew from 1.8 to nearly 2.5, and multi-section patents rose from 21% to 41% of all grants. These trends are consistent with the convergence of once-separate technology domains and the growing complexity of patent drafting strategies.
        </p>
      </aside>

      <Narrative>
        <p>
          Beyond citation-based measures, the structural characteristics of patents themselves reveal
          important trends in innovation. The number of claims in a patent defines the scope of legal
          protection, while technology classifications capture the breadth of inventive activity across
          domains. This chapter examines three complementary dimensions of patent scope: claim counts,
          CPC subclass breadth, and cross-domain convergence.
        </p>
        <p>
          Together, these indicators demonstrate that contemporary patents are not merely more numerous
          than their predecessors -- they are structurally broader, covering more legal ground and spanning
          more technology domains. This evolution reflects both changes in patent drafting strategy and the
          fundamental nature of modern invention, which increasingly occurs at the intersection of
          multiple fields.
        </p>
      </Narrative>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Patent Claims */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Patent Claims" />

      <Narrative>
        <p>
          The number of claims in a patent defines the scope of legal protection. Trends in
          claim counts reveal how patent strategy has evolved -- from relatively concise early
          patents to the <StatCallout value="claim-intensive patents" /> of the contemporary era.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-quality-claims-trends"
        subtitle="Median and 90th percentile claim counts for utility patents by grant year, measuring the evolution of patent scope over time."
        title="Median Claims Doubled from 8 to 18 (1976-2025) While the 90th Percentile Declined from Its Peak of 35 in 2005 to 21 by 2025"
        caption="This chart displays the median and 90th percentile claim counts for utility patents by grant year. The gap between median and 90th percentile widened through the mid-2000s (peak gap of 19 in 2005) but has since narrowed substantially to 3 by 2025, indicating that the most extreme claim inflation has moderated."
        insight="The increase in claim counts is consistent with more sophisticated patent drafting strategies and broader claim scopes, particularly in software and biotechnology fields."
        loading={clL}
      >
        {claimsData?.trends ? (
          <PWLineChart
            data={claimsData.trends}
            xKey="year"
            lines={[
              { key: 'median_claims', name: 'Median Claims', color: CHART_COLORS[0] },
              { key: 'p90_claims', name: '90th Percentile', color: CHART_COLORS[3] },
            ]}
            yLabel="Number of Claims"
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The doubling of median claims from 8 to 18 over five decades reflects the growing complexity
          of patent drafting strategies. The decline of the 90th percentile from its 2005 peak suggests
          that the most extreme claim inflation has moderated, potentially in response to judicial
          and administrative scrutiny of overly broad patent claims.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Scope & Breadth */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Scope & Breadth" />

      <ChartContainer
        id="fig-patent-quality-scope"
        subtitle="Average and median number of distinct CPC subclasses assigned per patent, measuring technological breadth over time."
        title="Average Patent Scope Grew from 1.8 to Nearly 2.5 CPC Subclasses as Technologies Became More Interdisciplinary"
        caption="This chart displays the average and median number of distinct CPC subclasses per patent, measuring technological breadth. The steady increase indicates growing convergence of once-separate technology domains, particularly in areas such as IoT, biotechnology, and AI."
        loading={trL}
        insight="Broadening patent scope is consistent with the convergence of once-separate technology domains, with contemporary inventions in areas such as IoT, biotechnology, and AI spanning multiple classification categories."
      >
        <PWLineChart
          data={trends ?? []}
          xKey="year"
          lines={[
            { key: 'avg_scope', name: 'Average Scope (CPC Subclasses)', color: CHART_COLORS[4] },
            { key: 'median_scope', name: 'Median Scope', color: CHART_COLORS[6] },
          ]}
          yLabel="CPC Subclasses"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent scope has broadened as technologies become more interdisciplinary. The number
          of distinct CPC subclasses assigned to each patent has increased steadily, indicating
          the convergence of once-separate technology domains. Contemporary inventions in areas such as
          IoT, biotechnology, and AI inherently span multiple classification categories.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Cross-Domain Convergence */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Cross-Domain Convergence" />

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

      <Narrative>
        Having examined how patent scope has expanded across claims, CPC breadth, and cross-domain convergence, the next chapter turns to the qualitative dimensions of knowledge flows. <Link href="/chapters/knowledge-flow-indicators" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Knowledge Flow Indicators</Link> analyzes originality, generality, and self-citation patterns to reveal how the directionality and diversity of knowledge exchange have evolved.
      </Narrative>

      <DataNote>
        Claims analysis uses the patent_num_claims field from g_patent for utility patents only.
        Scope is measured as the number of distinct CPC subclasses assigned per patent.
        Cross-domain analysis counts distinct CPC sections per patent (excluding section Y).
        All data computed from PatentsView following the framework of Jaffe and de Rassenfosse (2017).
      </DataNote>

      <RelatedChapters currentChapter={28} />
      <ChapterNavigation currentChapter={28} />
    </div>
  );
}
