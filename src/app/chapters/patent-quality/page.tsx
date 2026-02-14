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
import { PWAreaChart } from '@/components/charts/PWAreaChart';
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
  CitationsPerYear, CitationLagTrend,
  QualityTrend, OriginalityGenerality, SelfCitationRate,
  SleepingBeauty, QualityByCountry,
  CrossDomain,
  ClaimsAnalysis,
} from '@/lib/types';

export default function PatentQuality() {
  // Citation Impact & Scope (from old Patent Quality chapter)
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');

  // Backward Citations (from old Knowledge Network chapter)
  const { data: cites, loading: ciL } = useChapterData<CitationsPerYear[]>('chapter6/citations_per_year.json');

  // Citation Lag (from old Knowledge Network chapter)
  const { data: lagTrend, loading: ltL } = useChapterData<CitationLagTrend[]>('chapter6/citation_lag_trend.json');

  // Patent Claims (from old Innovation Dynamics chapter)
  const { data: claimsData, loading: clL } = useChapterData<{ trends: ClaimsAnalysis[] }>('company/claims_analysis.json');

  // Cross-Domain Convergence (from old Innovation Dynamics chapter)
  const { data: crossDomain, loading: cdL } = useChapterData<CrossDomain[]>('chapter7/cross_domain.json');

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
        number={9}
        title="Patent Quality"
        subtitle="Measuring the value, impact, and characteristics of patented inventions"
      />

      <KeyFindings>
        <li>Average <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> per patent have increased over time, though median citations remain flat, indicating growing skewness in the citation distribution.</li>
        <li>Citation lag has grown from approximately 3 years to over 16 years, reflecting the expanding body of prior art that newer patents must reference.</li>
        <li>Patent <GlossaryTooltip term="originality">originality</GlossaryTooltip> has increased while <GlossaryTooltip term="generality">generality</GlossaryTooltip> declined, indicating diverging knowledge flows: broader inputs have not translated into correspondingly broader downstream applicability.</li>
        <li>Multi-section patents rose from 21% to 41% of all grants, signaling increasing technological convergence across once-separate domains.</li>
        <li>Sleeping beauty patents are overwhelmingly concentrated in Human Necessities (94% of identified cases), challenging assumptions about short citation windows for impact assessment.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Multiple dimensions of patent quality have moved in distinct directions since the 1970s. Average forward citations per patent rose from 2.5 to a peak of 6.4 in 2019 within 5-year windows, yet the median oscillated between 2 and 3, revealing a highly skewed distribution in which a small fraction of patents captures a disproportionate share of total citations. Citation lag -- the temporal distance over which patents reference prior art -- expanded from approximately 3 years in the early 1980s to over 16 years by 2025, indicating that the cumulative stock of prior art now demands far deeper backward searches than it once did. The originality index climbed from 0.09 to 0.25, indicating more interdisciplinary innovation, yet the generality index fell from 0.28 to 0.15, revealing that broader knowledge inputs have not translated into correspondingly broader downstream applicability. Patent scope broadened as average CPC subclasses per patent grew from 1.8 to nearly 2.5, and multi-section patents rose from 21% to 41% of all grants, consistent with the convergence of once-separate technology domains. Sleeping beauty patents -- dormant for a decade or more before experiencing citation bursts -- are concentrated overwhelmingly in Human Necessities (94% of identified cases), challenging the assumption that short citation windows suffice for impact assessment.
        </p>
      </aside>

      <Narrative>
        <p>
          Patents differ substantially in their technological and economic significance. Although patent counts measure the <em>quantity</em> of
          innovation, researchers have developed a comprehensive set of indicators to assess patent{' '}
          <StatCallout value="quality" /> -- the technological significance, breadth, and
          downstream impact of individual inventions. This chapter draws on the framework
          established by Jaffe and de Rassenfosse (2017) to examine how multiple dimensions of
          patent quality have evolved over five decades of United States patenting.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Patent quality is inherently multidimensional. Forward citations capture downstream
          impact, claims measure legal scope, technology classifications reveal breadth, and
          originality and generality indices measure how a patent draws on and contributes to
          diverse knowledge domains. No single indicator is sufficient; together, they provide
          a nuanced characterization of inventive value.
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
        insight="The increase in average citations alongside flat median citations indicates growing skewness: a small fraction of patents captures a disproportionate share of total citations."
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
        insight="The growth in backward citations reflects both the expanding knowledge base and changes in patent office practices that encourage more thorough prior art disclosure."
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
          tail of patents with extensive backward citations elevates the mean. This trend reflects both the
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
        insight="The lengthening citation lag indicates that foundational knowledge has an increasingly long useful life, with modern patents reaching further back in time to reference prior art."
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
          in the most recent period -- indicates that the expanding body of relevant prior art requires newer patents
          to reach further back in time. This widening temporal window reflects both the cumulative
          nature of technological progress and the increasing searchability of prior art databases.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Patent Claims */}
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
      {/* 5. Scope & Breadth */}
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
      {/* 6. Cross-Domain Convergence */}
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
          and engineering, conferring an advantage upon organizations capable of integrating diverse expertise.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Originality & Generality */}
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
          draw on diverse knowledge sources. By contrast, generality has declined, suggesting that
          although inventions draw on broader inputs, their downstream applications have become more
          concentrated within specific fields. This divergence indicates that interdisciplinary
          inputs do not necessarily translate into broad downstream applicability.
        </p>
      </KeyInsight>

      {/* ------------------------------------------------------------------ */}
      {/* 8. Self-Citation Patterns */}
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
      {/* 9. Sleeping Beauty Patents */}
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
      {/* 10. Quality vs. Quantity by Country */}
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
        The preceding sections examined patent-level quality metrics across multiple dimensions -- citations, claims, scope, originality, and generality. Together, these indicators demonstrate that patent quality is multidimensional and that trends in different dimensions do not always move in parallel. The subsequent chapters provide deep dives into specific domains, beginning with <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link>, one of the most rapidly growing areas of patenting activity, where these quality metrics prove especially relevant for distinguishing genuine innovation from the accelerating volume of AI-related filings.
      </Narrative>

      <DataNote>
        Quality indicators computed from PatentsView data following the framework of Jaffe and
        de Rassenfosse (2017). Forward citations use a 5-year window and are limited to
        patents granted through 2020 for citation accumulation. Backward citation counts include all
        US patent citations per utility patent. Citation lag is measured as the time between the cited
        patent&apos;s grant date and the citing patent&apos;s grant date. Originality and generality
        use the Herfindahl-based measures of Trajtenberg, Henderson, and Jaffe (1997).
        Claims analysis uses the patent_num_claims field from g_patent for utility patents only.
        Cross-domain analysis counts distinct CPC sections per patent (excluding section Y).
        Sleeping beauty patents are identified as those with fewer than 2 citations per year in their
        first 10 years followed by a burst of 10+ citations in a 3-year window.
      </DataNote>

      <RelatedChapters currentChapter={9} />
      <ChapterNavigation currentChapter={9} />
    </div>
  );
}
