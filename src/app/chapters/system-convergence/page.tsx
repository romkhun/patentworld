'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWConvergenceMatrix } from '@/components/charts/PWConvergenceMatrix';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { CHART_COLORS } from '@/lib/colors';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type { CrossDomain, ConvergenceEntry } from '@/lib/types';

export default function SystemConvergenceChapter() {
  // Cross-domain convergence (area chart from patent-scope)
  const { data: crossDomain, loading: cdL } = useChapterData<CrossDomain[]>('chapter7/cross_domain.json');

  // Convergence matrix (from cross-field-convergence)
  const { data: convergenceData, loading: conL } = useChapterData<ConvergenceEntry[]>('chapter10/convergence_matrix.json');

  const convergenceEras = useMemo(() => {
    if (!convergenceData) return [];
    return [...new Set(convergenceData.map((d) => d.era))].sort();
  }, [convergenceData]);

  return (
    <div>
      <ChapterHeader
        number={4}
        title="Convergence"
        subtitle="Cross-domain technology convergence"
      />

      <KeyFindings>
        <li>Multi-section patents rose from 21% to 41% of all grants between 1976 and 2025, signaling increasing technological convergence across once-separate domains.</li>
        <li>The G-H (Physics-Electricity) convergence pair rose from 12.5% to 37.5% of all cross-section patents between 1976-1995 and 2011-2025, reflecting intensifying cross-field integration.</li>
        <li>Increasing cross-pollination of technology domains indicates that the boundaries between fields are becoming more permeable, with inventions more frequently occurring at the intersection of multiple disciplines.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Technology domains that were once largely separate have become increasingly intertwined. Multi-section patents rose from 21% to 41% of all grants, while the G-H (Physics-Electricity) convergence pair surged from 12.5% to 37.5% of cross-section patents. These patterns reflect a fundamental structural shift: modern invention increasingly occurs at the intersection of multiple fields, driven by the pervasiveness of digital technology and the growing interdisciplinarity of research.
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

      {/* ── Closing Transition ── */}

      <Narrative>
        The first four chapters established how the patent system grew, which technology fields fueled that expansion, and how those fields increasingly converge across once-separate domains. The analysis now turns to the language of patents themselves. The shift from chemistry to digital technology is visible not only in formal classification codes but in the words inventors use to describe their work. <Link href="/chapters/system-language" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Language of Innovation</Link> applies unsupervised text analysis to five decades of patent abstracts to uncover the latent thematic structure of US patenting.
      </Narrative>

      <DataNote>
        Cross-domain analysis counts distinct CPC sections per patent (excluding section Y).
        Technology convergence measures the co-occurrence of CPC section pairs on multi-section patents by era.
        All data computed from PatentsView following the framework of Jaffe and de Rassenfosse (2017).
      </DataNote>

      <RelatedChapters currentChapter={4} />
      <ChapterNavigation currentChapter={4} />
    </div>
  );
}
