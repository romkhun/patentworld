'use client';

import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  CitationsPerYear, CitationLagTrend,
  QualityTrend,
} from '@/lib/types';

export default function CitationDynamics() {
  // Forward Citations (from old Patent Quality chapter)
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');

  // Backward Citations (from old Knowledge Network chapter)
  const { data: cites, loading: ciL } = useChapterData<CitationsPerYear[]>('chapter6/citations_per_year.json');

  // Citation Lag (from old Knowledge Network chapter)
  const { data: lagTrend, loading: ltL } = useChapterData<CitationLagTrend[]>('chapter6/citation_lag_trend.json');

  return (
    <div>
      <ChapterHeader
        number={27}
        title="Citation Dynamics"
        subtitle="Forward and backward citation trends and citation lag"
      />

      <KeyFindings>
        <li>Average <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> per patent have increased over time, though median citations remain flat, indicating growing skewness in the citation distribution.</li>
        <li>Backward citations per patent rose from 4.9 in 1976 to 21.3 in 2023, reflecting the expanding body of prior art that new inventions must acknowledge.</li>
        <li>Citation lag has grown from approximately 2.9 years in 1980 to over 16.2 years by 2025, reflecting the expanding body of prior art that newer patents must reference.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Average forward citations per patent rose from 2.5 to a peak of 6.4 in 2019 within 5-year windows, yet the median oscillated between 2 and 3, revealing a highly skewed distribution. Backward citations climbed from 4.9 in 1976 to 21.3 in 2023, and citation lag expanded from 2.9 years in 1980 to 16.2 years by 2025, indicating that the cumulative stock of prior art now demands far deeper backward searches than it once did.
        </p>
      </aside>

      <Narrative>
        <p>
          Patents differ substantially in their technological and economic significance. Although patent counts measure the <em>quantity</em> of
          innovation, forward and backward citation patterns provide a window into patent{' '}
          <StatCallout value="quality" /> and the evolving structure of knowledge networks. This chapter
          examines three fundamental dimensions of citation dynamics: the downstream impact captured by
          forward citations, the expanding base of prior art reflected in backward citations, and the
          growing temporal reach of citation lag.
        </p>
        <p>
          Forward citations -- the frequency with which a patent is cited by subsequent inventions -- constitute the
          most widely employed indicator of patent quality in the economics of innovation literature. A patent
          that receives numerous forward citations has produced knowledge that subsequent inventors deemed sufficiently
          valuable to build upon. Meanwhile, backward citations and citation lag reveal how the stock of prior
          art has grown and how far back in time contemporary patents must reach to acknowledge it.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Patent quality is inherently multidimensional. Forward citations capture downstream
          impact, backward citations measure the breadth of prior art inputs, and citation lag
          reveals the temporal depth of the knowledge base. Together, these indicators illuminate
          how the structure of knowledge flows has evolved over five decades.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Citation Impact (Forward Citations) */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Citation Impact" />

      <ChartContainer
        id="fig-patent-quality-forward-citations"
        subtitle="Average and median forward citations received within 5 years of grant, by grant year. The gap between the two measures reveals the skewness of the citation distribution."
        title="Average Forward Citations per Patent Rose from 2.5 to a Peak of 6.4 in 2019 While the Median Oscillated Between 2 and 3, Revealing Growing Skewness"
        caption="This chart displays average and median forward citations received within 5 years of grant, by grant year (limited to patents through 2020). The persistent gap between average and median reveals a highly skewed distribution, with most patents receiving modest citations whereas a small fraction becomes heavily cited."
        loading={trL}
        insight="The increase in average citations alongside relatively flat median citations indicates growing skewness: a small fraction of patents captures a disproportionate share of total citations."
      >
        <PWLineChart
          data={(trends ?? []).filter((d) => d.year <= 2020)}
          xKey="year"
          lines={[
            { key: 'avg_forward_cites_5yr', name: 'Average Forward Citations (5yr)', color: CHART_COLORS[0] },
            { key: 'median_forward_cites_5yr', name: 'Median Forward Citations (5yr)', color: CHART_COLORS[2] },
          ]}
          yLabel="Citations"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Forward citations -- the frequency with which a patent is cited by subsequent inventions -- constitute the
          most widely employed indicator of patent quality in the economics of innovation literature. A patent
          that receives numerous forward citations has produced knowledge that subsequent inventors deemed sufficiently
          valuable to build upon.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Forward citation counts have increased substantially over time, reflecting the expanding
          body of searchable prior art, growing interconnection between technology domains, and
          more thorough patent examination. The persistent gap between average and median reveals
          a highly skewed distribution: most patents receive modest citations, whereas a small
          fraction becomes heavily cited &quot;landmark&quot; inventions.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Backward Citations */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Backward Citations" />

      <ChartContainer
        id="fig-patent-quality-backward-citations"
        subtitle="Average and median backward citation counts per utility patent by grant year, showing the expanding knowledge base over time."
        title="Average Backward Citations Per Patent Rose From 4.9 in 1976 to 21.3 in 2023"
        caption="Average and median number of US patent citations per utility patent, by grant year. The widening gap between mean and median indicates a growing right tail of heavily cited patents."
        loading={ciL}
        insight="The growth in backward citations is consistent with both the expanding knowledge base and changes in patent office practices that encourage more thorough prior art disclosure."
      >
        <PWLineChart
          data={cites ?? []}
          xKey="year"
          lines={[
            { key: 'avg_citations', name: 'Average', color: CHART_COLORS[0] },
            { key: 'median_citations', name: 'Median', color: CHART_COLORS[2] },
          ]}
          yLabel="Citations"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The average number of backward citations per patent has grown substantially over the
          decades, reflecting the expanding body of prior art that new inventions must
          acknowledge. Patents increasingly build on larger bodies of prior art, with the average rising
          from approximately 5 in the 1970s to around 19-21 in recent years. The gap between average and median
          suggests a long tail of heavily-cited patents, a pattern consistent with both the expanding universe of
          prior art and more thorough examination and disclosure requirements.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The widening divergence between mean and median backward citations constitutes a notable structural feature of
          the knowledge network. Although the median patent cites a modest number of prior art references, a growing
          tail of patents with extensive backward citations elevates the mean. This pattern is consistent with both the
          expanding universe of searchable prior art and evolving patent office practices
          that encourage more thorough prior art disclosure.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Citation Lag */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Citation Lag" />

      <ChartContainer
        id="fig-patent-quality-citation-lag"
        subtitle="Average and median time in years between a cited patent's grant date and the citing patent's grant date, by year."
        title="Citation Lag Grew From 2.9 Years in 1980 to 16.2 Years in 2025"
        caption="Average and median time (in years) between a cited patent's grant date and the citing patent's grant date. The average citation lag has increased from approximately 3 years in the early 1980s to over 16 years in the most recent period."
        loading={ltL}
        insight="The lengthening citation lag is consistent with foundational knowledge having an increasingly long useful life, with modern patents reaching further back in time to reference prior art."
      >
        <PWLineChart
          data={lagTrend ?? []}
          xKey="year"
          lines={[
            { key: 'avg_lag_years', name: 'Average Lag', color: CHART_COLORS[0] },
            { key: 'median_lag_years', name: 'Median Lag', color: CHART_COLORS[2] },
          ]}
          yLabel="Years"
          yFormatter={(v) => `${v.toFixed(1)}y`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The citation lag -- the temporal distance over which patents cite prior art -- has increased steadily,
          indicating that the useful life of patented knowledge continues to extend. Contemporary
          patents draw on an increasingly expansive base of prior art, reaching further back in time
          than patents of earlier decades.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The lengthening citation lag -- from approximately 3 years in the early 1980s to over 16 years
          in the most recent period -- is consistent with the expanding body of relevant prior art requiring newer patents
          to reach further back in time. This widening temporal window is associated with both the cumulative
          nature of technological progress and the increasing searchability of prior art databases.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the dynamics of citation flows -- forward impact, backward depth, and temporal lag -- the next chapter turns to the structural characteristics of patents themselves. <Link href="/chapters/patent-scope" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent Scope</Link> analyzes how claim counts, CPC breadth, and cross-domain convergence have evolved, providing a complementary view of how the nature of patented inventions has changed over five decades.
      </Narrative>

      <DataNote>
        Quality indicators computed from PatentsView data following the framework of Jaffe and
        de Rassenfosse (2017). Forward citations use a 5-year window and are limited to
        patents granted through 2020 for citation accumulation. Backward citation counts include all
        US patent citations per utility patent. Citation lag is measured as the time between the cited
        patent&apos;s grant date and the citing patent&apos;s grant date.
      </DataNote>

      <RelatedChapters currentChapter={27} />
      <ChapterNavigation currentChapter={27} />
    </div>
  );
}
