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
import { formatCompact } from '@/lib/formatters';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  ClaimsPerYear,
  ClaimsAnalysis,
  QualityTrend,
  CitationsPerYear,
  CitationLagTrend,
  OriginalityGenerality,
  SelfCitationRate,
  SleepingBeauty,
} from '@/lib/types';

export default function SystemPatentQualityChapter() {
  const { data: claims, loading: clL } = useChapterData<ClaimsPerYear[]>('chapter1/claims_per_year.json');
  const { data: claimsData, loading: clL2 } = useChapterData<{ trends: ClaimsAnalysis[] }>('company/claims_analysis.json');
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');
  const { data: cites, loading: ciL } = useChapterData<CitationsPerYear[]>('chapter6/citations_per_year.json');
  const { data: lagTrend, loading: ltL } = useChapterData<CitationLagTrend[]>('chapter6/citation_lag_trend.json');
  const { data: origGen, loading: ogL } = useChapterData<OriginalityGenerality[]>('chapter9/originality_generality.json');
  const { data: selfCite, loading: scL } = useChapterData<SelfCitationRate[]>('chapter9/self_citation_rate.json');
  const { data: sleepingBeauties } = useChapterData<SleepingBeauty[]>('chapter9/sleeping_beauties.json');

  return (
    <div>
      <ChapterHeader
        number={2}
        title="Patent Quality"
        subtitle="Claims, scope, citations, originality, and knowledge flow indicators"
      />

      <KeyFindings>
        <li>Average claims per patent doubled from 9.4 in 1976 to a peak of 18.9 in 2005, with a notable median-mean inversion by the mid-2010s suggesting a compression of the upper tail of claim distributions.</li>
        <li>Average patent scope grew from 1.8 to nearly 2.5 <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses per patent, indicating growing technological interdisciplinarity and convergence of once-separate domains.</li>
        <li>Average <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> per patent rose from 2.5 to a peak of 6.4 in 2019 within 5-year windows, yet the median oscillated between 2 and 3, revealing a highly skewed distribution where a small fraction of patents captures disproportionate impact.</li>
        <li>Patent <GlossaryTooltip term="originality">originality</GlossaryTooltip> increased from 0.09 to 0.25 while <GlossaryTooltip term="generality">generality</GlossaryTooltip> declined from 0.28 to 0.15, indicating that broader knowledge inputs have not translated into correspondingly broader downstream applicability.</li>
        <li>Sleeping beauty patents -- inventions that lay dormant for years before experiencing citation bursts -- are overwhelmingly concentrated in Human Necessities (94% of identified cases), challenging assumptions about short citation windows for impact assessment.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Patent quality is inherently multidimensional, and its evolution over five decades reveals diverging trends across different indicators. Claim counts doubled before leveling off, scope broadened as technologies became more interdisciplinary, and forward citations grew increasingly skewed. Meanwhile, originality rose as inventions drew on more diverse knowledge inputs, yet generality fell as downstream applications became more concentrated. Self-citation rates declined from 35% to approximately 10% before rebounding modestly, and citation lag expanded from 3 to over 16 years as the cumulative stock of prior art deepened. Together, these patterns demonstrate that the patent system has become simultaneously more complex, more interconnected, and more unequal in the distribution of impact.
        </p>
      </aside>

      <Narrative>
        <p>
          Measuring the quality of patents is among the most consequential -- and most contested -- challenges in the economics of innovation. Unlike patent counts, which capture the <em>quantity</em> of inventive activity, quality indicators attempt to measure how significant, broad, and influential individual inventions are. No single metric suffices: claim structures reveal the legal scope of protection, classification breadth captures technological interdisciplinarity, forward citations measure downstream impact, and knowledge flow indicators such as originality and generality illuminate the diversity of inputs and outputs in the inventive process.
        </p>
        <p>
          This chapter synthesizes eight complementary dimensions of patent quality, drawing together evidence from claim analysis, scope measurement, citation dynamics, and knowledge flow indicators. The patterns that emerge are not always consistent -- quality trends in one dimension do not necessarily parallel trends in another -- but together they provide a multifaceted portrait of how the nature and significance of patented inventions has evolved from the late 1970s through the present.
        </p>
      </Narrative>

      {/* ================================================================== */}
      {/* 1. Patent Complexity & Claims                                      */}
      {/* ================================================================== */}

      <SectionDivider label="Patent Complexity & Claims" />

      <Narrative>
        <p>
          Beyond the growth in patent volume and the shifting composition across types, the internal structure of patents themselves has evolved. Patent complexity, as measured by claim counts, provides a window into how applicants have sought to define and protect their inventions over time.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-claims-per-patent"
        title="Average Claims per Patent Doubled from 9.4 in 1976 to a Peak of 18.9 in 2005"
        subtitle="Average and median number of claims per utility patent, measuring patent scope and complexity over time, 1976–2025"
        caption="Average and median number of claims per utility patent, 1976–2025. The relationship between mean and median has shifted over time; by the mid-2010s, the median surpassed the average, suggesting a compression of the upper tail."
        insight="The relationship between average and median claims per patent has shifted over time; by the mid-2010s, the median surpassed the average, suggesting a compression of the upper tail."
        loading={clL}
      >
        <PWLineChart
          data={claims ?? []}
          xKey="year"
          lines={[
            { key: 'avg_claims', name: 'Average Claims', color: CHART_COLORS[0] },
            { key: 'median_claims', name: 'Median Claims', color: CHART_COLORS[2] },
          ]}
          yLabel="Claims"
          yFormatter={(v) => v.toFixed(0)}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Each claim defines a specific element of the invention that
          receives legal protection. The initial upward trend in average claims per patent reflected
          both the growing technical sophistication of inventions and the strategic incentive
          for applicants to secure broad coverage, though the gap between average and median claims initially widened but has recently reversed, with the median surpassing the average by the mid-2010s.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The relationship between average and median claims has evolved: the gap initially widened as a subset of patents pursued substantially larger claim sets, but by the mid-2010s the median surpassed the average, indicating a compression of the upper tail and a more uniform distribution of claim counts across patents.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Examining the distribution more closely -- particularly at the extremes -- reveals how the upper tail of claim counts has shifted relative to the median over the same period.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-quality-claims-trends"
        subtitle="Median and 90th percentile claim counts for utility patents by grant year, measuring the evolution of patent scope over time."
        title="Median Claims Doubled from 8 to 18 (1976-2025) While the 90th Percentile Declined from Its Peak of 35 in 2005 to 21 by 2025"
        caption="This chart displays the median and 90th percentile claim counts for utility patents by grant year. The gap between median and 90th percentile widened through the mid-2000s (peak gap of 19 in 2005) but has since narrowed substantially to 3 by 2025, indicating that the most extreme claim inflation has moderated."
        insight="The increase in claim counts is consistent with more sophisticated patent drafting strategies and broader claim scopes, particularly in software and biotechnology fields."
        loading={clL2}
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

      {/* ================================================================== */}
      {/* 2. Scope & Breadth                                                 */}
      {/* ================================================================== */}

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

      <Narrative>
        <p>
          Patent scope has broadened as technologies become more interdisciplinary. The number
          of distinct <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses assigned to each patent has increased steadily, indicating
          the convergence of once-separate technology domains. Contemporary inventions in areas such as
          IoT, biotechnology, and AI inherently span multiple classification categories.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Patent scope has broadened as technologies become more interdisciplinary. The number
          of distinct CPC subclasses assigned to each patent has increased steadily, indicating
          the convergence of once-separate technology domains. Contemporary inventions in areas such as
          IoT, biotechnology, and AI inherently span multiple classification categories.
        </p>
      </KeyInsight>

      {/* ================================================================== */}
      {/* 3. Forward Citations                                               */}
      {/* ================================================================== */}

      <SectionDivider label="Forward Citations" />

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

      {/* ================================================================== */}
      {/* 4. Backward Citations                                              */}
      {/* ================================================================== */}

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

      {/* ================================================================== */}
      {/* 5. Self-Citation Patterns                                          */}
      {/* ================================================================== */}

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

      <Narrative>
        <p>
          Self-citation rates -- the fraction of backward citations directed to patents held by the same assignee -- provide a window into how firms balance internal knowledge accumulation with external knowledge absorption. Organizations that consistently cite their own prior patents are building on
          internal knowledge stocks, a characteristic of cumulative innovation within technological
          trajectories.
        </p>
      </Narrative>

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

      {/* ================================================================== */}
      {/* 6. Citation Lag                                                    */}
      {/* ================================================================== */}

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

      {/* ================================================================== */}
      {/* 7. Originality & Generality                                        */}
      {/* ================================================================== */}

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

      {/* ================================================================== */}
      {/* 8. Sleeping Beauty Patents                                         */}
      {/* ================================================================== */}

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

      {/* ================================================================== */}
      {/* Closing                                                            */}
      {/* ================================================================== */}

      <Narrative>
        Having examined patent quality across eight complementary dimensions -- from claim complexity and scope breadth through citation dynamics, self-citation patterns, originality, generality, and sleeping beauty patents -- the next chapter turns to the <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">technological composition of patent activity</Link>. Where this chapter asked <em>how good</em> patents are, the next asks <em>what fields</em> they cover and how the distribution of inventive effort across technology domains has shifted over five decades.
      </Narrative>

      <DataNote>
        Claims analysis uses the patent_num_claims field from g_patent for utility patents only.
        Scope is measured as the number of distinct CPC subclasses assigned per patent.
        Forward citations use a 5-year window and are limited to patents granted through 2020 for citation accumulation.
        Backward citation counts include all US patent citations per utility patent.
        Citation lag is measured as the time between the cited patent&apos;s grant date and the citing patent&apos;s grant date.
        Originality and generality use the Herfindahl-based measures of Trajtenberg, Henderson, and Jaffe (1997).
        Self-citation rate is the fraction of backward citations directed to patents held by the same assignee.
        Sleeping beauty patents are identified as those with fewer than 2 citations per year in their first 10 years followed by a burst of 10+ citations in a 3-year window.
        All data computed from PatentsView following the framework of Jaffe and de Rassenfosse (2017).
      </DataNote>

      <RelatedChapters currentChapter={2} />
      <ChapterNavigation currentChapter={2} />
    </div>
  );
}
