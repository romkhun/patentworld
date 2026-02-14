'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
import { CHART_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  OriginalityGenerality, SelfCitationRate,
  SleepingBeauty, QualityByCountry,
} from '@/lib/types';

export default function KnowledgeFlowIndicators() {
  // Originality & Generality (from old Patent Quality chapter)
  const { data: origGen, loading: ogL } = useChapterData<OriginalityGenerality[]>('chapter9/originality_generality.json');

  // Self-Citation (from old Patent Quality chapter)
  const { data: selfCite, loading: scL } = useChapterData<SelfCitationRate[]>('chapter9/self_citation_rate.json');

  // Sleeping Beauties (from old Patent Quality chapter)
  const { data: sleepingBeauties } = useChapterData<SleepingBeauty[]>('chapter9/sleeping_beauties.json');

  // Quality by Country (from old Patent Quality chapter)
  const { data: qualByCountry, loading: qcL } = useChapterData<QualityByCountry[]>('chapter9/quality_by_country.json');

  const latestDecadeCountry = useMemo(() => {
    if (!qualByCountry) return [];
    const maxDecade = Math.max(...qualByCountry.map(d => d.decade));
    return qualByCountry
      .filter(d => d.decade === maxDecade)
      .sort((a, b) => b.avg_claims - a.avg_claims)
      .slice(0, 15);
  }, [qualByCountry]);

  return (
    <div>
      <ChapterHeader
        number={29}
        title="Knowledge Flow Indicators"
        subtitle="Originality, generality, and self-citation rate patterns"
      />

      <KeyFindings>
        <li>Patent <GlossaryTooltip term="originality">originality</GlossaryTooltip> has increased from 0.09 to 0.25 while <GlossaryTooltip term="generality">generality</GlossaryTooltip> declined from 0.28 to 0.15, indicating diverging knowledge flows: broader inputs have not translated into correspondingly broader downstream applicability.</li>
        <li>Average self-citation rates declined from 35% in 1976 to 10.5% by 2010, with a modest rebound to 13-16% in the 2020s.</li>
        <li>Sleeping beauty patents are overwhelmingly concentrated in Human Necessities (94% of identified cases), challenging assumptions about short citation windows for impact assessment.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The originality index climbed from 0.09 to 0.25, indicating more interdisciplinary innovation, yet the generality index fell from 0.28 to 0.15, revealing that broader knowledge inputs have not translated into correspondingly broader downstream applicability. Self-citation rates declined from 35% to approximately 10.5% as firms broadened their knowledge inputs, and the United States leads with 164,000 patents and 18.4 average claims in the 2020s.
        </p>
      </aside>

      <Narrative>
        <p>
          Beyond the structural dimensions of citation counts and patent scope, a set of qualitative
          indicators captures the <em>directionality</em> and <em>diversity</em> of knowledge flows in the
          patent system. This chapter examines three such dimensions: the originality and generality
          indices that measure how broadly a patent draws on and contributes to diverse fields, self-citation
          patterns that reveal firms&apos; knowledge accumulation strategies, and cross-country comparisons
          that contextualize these metrics globally.
        </p>
        <p>
          These indicators, grounded in the framework of Trajtenberg, Henderson, and Jaffe (1997) and
          extended by Jaffe and de Rassenfosse (2017), provide a nuanced view of how knowledge flows
          through the patent system -- not merely how much is cited, but what kinds of knowledge are
          synthesized and how broadly the resulting inventions are applied.
        </p>
      </Narrative>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Originality & Generality */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Originality & Generality" />

      <Narrative>
        <p>
          The <StatCallout value="originality" /> index (Trajtenberg, Henderson, and Jaffe, 1997)
          measures the diversity of a patent&apos;s technology sources -- a patent that cites
          prior art across many different CPC sections is more &quot;original&quot; than one citing
          only its own field. The <StatCallout value="generality" /> index measures the
          converse: the diversity of citing patents, capturing whether an invention has
          broad applicability across fields.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-quality-originality-generality"
        subtitle="Average originality (diversity of backward citation fields) and generality (diversity of forward citation fields), measured as 1 minus the HHI of CPC sections."
        title="Originality Rose from 0.09 to 0.25 While Generality Fell from 0.28 to 0.15, Indicating Diverging Knowledge Flows"
        caption="This chart displays average originality (1 minus the HHI of backward citation CPC sections) and generality (1 minus the HHI of forward citation CPC sections) by year. Higher values indicate greater diversity. Originality has increased over time, reflecting more interdisciplinary innovation, whereas generality has declined."
        loading={ogL}
        insight="Rising originality scores indicate that contemporary inventions increasingly synthesize knowledge from diverse technology fields, a pattern consistent with growing interdisciplinary research."
      >
        <PWLineChart
          data={origGen ?? []}
          xKey="year"
          lines={[
            { key: 'avg_originality', name: 'Originality', color: CHART_COLORS[0] },
            { key: 'avg_generality', name: 'Generality', color: CHART_COLORS[3] },
          ]}
          yLabel="Index (0-1)"
          yFormatter={(v) => v.toFixed(2)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Originality has trended upward over time, indicating that patents increasingly
          draw on diverse knowledge sources. By contrast, generality has declined, indicating that
          although inventions draw on broader inputs, their downstream applications have become more
          concentrated within specific fields. This divergence shows that interdisciplinary
          inputs do not necessarily translate into broad downstream applicability.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Self-Citation Patterns */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Self-Citation Patterns" />

      <ChartContainer
        id="fig-patent-quality-self-citation-rate"
        subtitle="Average and median self-citation rate per patent (fraction of backward citations to the same assignee's earlier patents), by year."
        title="Average Self-Citation Rates Declined from 35% in 1976 to 10.5% by 2010, Then Rebounding to 13-16% in the 2020s"
        caption="This chart displays the average self-citation rate per patent (the fraction of backward citations directed to patents held by the same assignee), by year. Changes in self-citation rates over time may reflect shifts between exploration of new domains and exploitation of established competencies."
        loading={scL}
        insight="Self-citation patterns indicate knowledge accumulation strategies within firms, with temporal changes potentially reflecting shifts between exploration of new domains and exploitation of established competencies."
      >
        <PWLineChart
          data={selfCite ?? []}
          xKey="year"
          lines={[
            { key: 'avg_self_cite_rate', name: 'Average Self-Citation Rate', color: CHART_COLORS[5] },
            { key: 'median_self_cite_rate', name: 'Median Self-Citation Rate', color: CHART_COLORS[6] },
          ]}
          yLabel="Self-Citation Rate"
          yFormatter={(v) => `${(v * 100).toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Self-citation patterns indicate knowledge accumulation strategies within firms.
          Organizations that consistently cite their own prior patents are building on
          internal knowledge stocks, a characteristic of cumulative innovation within technological
          trajectories. The long-term decline in self-citation rates from 35% to approximately 10%
          may reflect the broadening of knowledge inputs alongside the growing accessibility of
          external prior art, though the modest rebound in the 2020s warrants continued observation.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Sleeping Beauty Patents */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Sleeping Beauty Patents" />

      <Narrative>
        <p>
          Certain patents receive minimal attention for years, only to be &quot;rediscovered&quot; when
          technology develops sufficiently. These &quot;sleeping beauties&quot; received fewer than 2 citations
          per year during their first 10 years, then experienced a citation burst of 10 or more citations
          within a 3-year window. Such patents represent inventions that preceded the technology necessary for their practical application.
        </p>
      </Narrative>

      {sleepingBeauties && sleepingBeauties.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Top Sleeping Beauty Patents</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Patent ID</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Year</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Section</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Early Citations</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Burst Citations</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Burst Year</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Citations</th>
              </tr>
            </thead>
            <tbody>
              {sleepingBeauties.slice(0, 20).map((sb, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3 font-mono text-xs">{sb.patent_id}</td>
                  <td className="text-center py-2 px-3">{sb.grant_year}</td>
                  <td className="text-center py-2 px-3">{sb.section}</td>
                  <td className="text-right py-2 px-3 font-mono">{sb.early_cites}</td>
                  <td className="text-right py-2 px-3 font-mono font-semibold">{sb.burst_citations}</td>
                  <td className="text-right py-2 px-3">+{sb.burst_year_after_grant} years</td>
                  <td className="text-right py-2 px-3 font-mono">{formatCompact(sb.total_fwd_cites)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <KeyInsight>
        <p>
          Sleeping beauty patents are overwhelmingly concentrated in Human Necessities (Section A), which accounts for 94% of identified cases. In this domain, fundamental discoveries may require decades to find
          practical applications. The existence of these dormant-then-resurgent patents
          challenges the assumption that citation impact can be adequately assessed within a short
          window following grant, and suggests that the patent system occasionally captures
          inventions of enduring significance.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Quality vs. Quantity by Country */}
      {/* ------------------------------------------------------------------ */}

      <SectionDivider label="Quality vs. Quantity by Country" />

      <Narrative>
        <p>
          The relationship between patent quantity and quality across countries warrants examination. Comparing average patent claims
          -- a rough proxy for patent scope -- across countries indicates that volume and quality
          do not necessarily correspond.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-quality-claims-by-country"
        subtitle="Average claims per patent by primary assignee country for the most recent decade, comparing patent scope across origins."
        title="The United States Leads with 164,000 Patents and 18.4 Average Claims in the 2020s, While China's 19,200 Patents Average 14.7 Claims"
        caption="This chart displays the average number of claims per patent by primary assignee country for the most recent decade. Higher claim counts generally indicate broader patent scope. The United States leads in both volume and average claims, whereas rapidly growing patent origins such as China exhibit lower average claims."
        insight="Countries with smaller patent portfolios occasionally achieve higher average claim counts, suggesting a quality-oriented approach. The lower average claims from rapidly growing patent origins such as China are consistent with research on early-stage patent system development."
        loading={qcL}
        height={550}
      >
        <PWBarChart
          data={latestDecadeCountry}
          xKey="country"
          bars={[{ key: 'avg_claims', name: 'Average Claims', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <Narrative>
        The preceding sections examined knowledge flow indicators across multiple dimensions -- originality, generality, self-citation, sleeping beauties, and cross-country comparisons. Together with the citation dynamics and patent scope analyses in the preceding chapters, these indicators demonstrate that patent quality is multidimensional and that trends in different dimensions do not always move in parallel. The subsequent chapters provide deep dives into specific domains, beginning with <Link href="/chapters/innovation-tempo" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Innovation Tempo</Link>, which examines the pace and rhythm of inventive activity across technology fields.
      </Narrative>

      <DataNote>
        Quality indicators computed from PatentsView data following the framework of Jaffe and
        de Rassenfosse (2017). Originality and generality
        use the Herfindahl-based measures of Trajtenberg, Henderson, and Jaffe (1997).
        Self-citation rate is measured as the fraction of backward citations directed to patents
        held by the same assignee. Sleeping beauty patents are identified as those with fewer than
        2 citations per year in their first 10 years followed by a burst of 10+ citations in a
        3-year window. Quality by country uses average claims per patent by primary assignee country
        for the most recent decade.
      </DataNote>

      <RelatedChapters currentChapter={29} />
      <ChapterNavigation currentChapter={29} />
    </div>
  );
}
