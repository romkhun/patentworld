'use client';

import { useMemo } from 'react';
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
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  QualityTrend, OriginalityGenerality, SelfCitationRate,
  QualityBySector, BreakthroughPatent,
  CompositeQualityIndex, SleepingBeauty,
} from '@/lib/types';

export default function Chapter9() {
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');
  const { data: origGen, loading: ogL } = useChapterData<OriginalityGenerality[]>('chapter9/originality_generality.json');
  const { data: selfCite, loading: scL } = useChapterData<SelfCitationRate[]>('chapter9/self_citation_rate.json');
  const { data: bySector, loading: bsL } = useChapterData<QualityBySector[]>('chapter9/quality_by_sector.json');
  const { data: breakthrough, loading: btL } = useChapterData<BreakthroughPatent[]>('chapter9/breakthrough_patents.json');
  const { data: compositeQuality, loading: cqL } = useChapterData<CompositeQualityIndex[]>('chapter9/composite_quality_index.json');
  const { data: sleepingBeauties, loading: sbL } = useChapterData<SleepingBeauty[]>('chapter9/sleeping_beauties.json');

  // Pivot quality by sector for line chart
  const { sectorPivot, sectorNames } = useMemo(() => {
    if (!bySector) return { sectorPivot: [], sectorNames: [] };
    const sectors = [...new Set(bySector.map((d) => d.sector))];
    const periods = [...new Set(bySector.map((d) => d.period))].sort();
    const pivoted = periods.map((period) => {
      const row: any = { period };
      bySector.filter((d) => d.period === period).forEach((d) => {
        row[d.sector] = d.avg_claims;
      });
      return row;
    });
    return { sectorPivot: pivoted, sectorNames: sectors };
  }, [bySector]);

  const { compositeQualityPivot, compositeQualitySections } = useMemo(() => {
    if (!compositeQuality) return { compositeQualityPivot: [], compositeQualitySections: [] };
    const sections = [...new Set(compositeQuality.map(d => d.section))].sort();
    const years = [...new Set(compositeQuality.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      compositeQuality.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.composite_index;
      });
      return row;
    });
    return { compositeQualityPivot: pivoted, compositeQualitySections: sections };
  }, [compositeQuality]);

  return (
    <div>
      <ChapterHeader
        number={9}
        title="Patent Quality"
        subtitle="Measuring the value and impact of inventions"
      />

      <KeyFindings>
        <li>Average <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> per patent have declined over time, partly due to the expanding volume of patents diluting citation counts.</li>
        <li>Patent <GlossaryTooltip term="originality">originality</GlossaryTooltip> — how broadly a patent draws on diverse prior art — has increased, suggesting more interdisciplinary innovation.</li>
        <li>Patent <GlossaryTooltip term="generality">generality</GlossaryTooltip> — how broadly a patent is cited across fields — shows technology-specific patterns, with foundational inventions scoring highest.</li>
        <li>Quality metrics vary substantially across technology sectors, with biotech and pharma patents tending to receive more citations per patent than electronics.</li>
      </KeyFindings>

      <Narrative>
        <p>
          Not all patents are created equal. While patent counts measure the <em>quantity</em> of
          innovation, researchers have developed a rich set of indicators to assess patent{' '}
          <StatCallout value="quality" /> -- the technological significance, breadth, and
          downstream impact of individual inventions. This chapter draws on the framework
          established by Jaffe & de Rassenfosse (2017) to examine how multiple dimensions of
          patent quality have evolved over five decades of US patenting.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Patent quality is inherently multidimensional. Forward citations capture downstream
          impact, claims measure legal scope, technology classifications reveal breadth, and
          originality and generality indices measure how a patent draws on and contributes to
          diverse knowledge domains. No single indicator is sufficient -- together, they paint
          a nuanced picture of inventive value.
        </p>
      </KeyInsight>

      <SectionDivider label="Claims & Complexity" />

      <ChartContainer
        title="Claims Per Patent Over Time"
        caption="Average and median number of claims per utility patent, 1976-2025. Claims define the legally protected boundaries of an invention."
        loading={trL}
        insight="The doubling of average claims since the 1970s reflects both increasing invention complexity and strategic behavior by applicants seeking broader legal protection."
      >
        <PWLineChart
          data={trends ?? []}
          xKey="year"
          lines={[
            { key: 'avg_claims', name: 'Average Claims', color: CHART_COLORS[0] },
            { key: 'median_claims', name: 'Median Claims', color: CHART_COLORS[2] },
          ]}
          yLabel="Claims"
          yFormatter={(v) => v.toFixed(0)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The average number of claims per patent has roughly doubled since the 1970s. This
          reflects both increasing invention complexity and strategic behavior by applicants
          seeking broader protection. The widening gap between mean and median indicates that
          a growing tail of patents with very large claim sets is pulling the average upward --
          consistent with the &quot;patent thicket&quot; hypothesis where firms use dense webs of
          overlapping claims to create defensive barriers.
        </p>
      </KeyInsight>

      <SectionDivider label="Citation Impact" />

      <ChartContainer
        title="Citation Impact Over Time"
        caption="Average and median forward citations received within 5 years of grant, by grant year (limited to patents through 2020)."
        loading={trL}
        insight="The decline in average citations partly reflects citation dilution — more patents means each individual patent receives a smaller share of total citations."
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
          Forward citations -- how often a patent is cited by subsequent inventions -- are the
          most widely used indicator of patent quality in the economics literature. A patent
          that receives many forward citations has produced knowledge that others found valuable
          enough to build upon.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Forward citation counts have increased dramatically over time, reflecting the expanding
          body of searchable prior art, growing interconnection between technology domains, and
          more thorough patent examination. The persistent gap between average and median reveals
          a highly skewed distribution: most patents receive modest citation, while a small
          fraction becomes heavily cited &quot;landmark&quot; inventions.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Backward Citations Over Time"
        caption="Average and median backward citations (references to prior art) per utility patent, 1976-2025."
        loading={trL}
        insight="The growing body of backward citations reflects the expanding universe of prior art and more thorough examination and disclosure requirements over time."
      >
        <PWLineChart
          data={trends ?? []}
          xKey="year"
          lines={[
            { key: 'avg_backward_cites', name: 'Average Backward Citations', color: CHART_COLORS[3] },
            { key: 'median_backward_cites', name: 'Median Backward Citations', color: CHART_COLORS[5] },
          ]}
          yLabel="Citations"
          yFormatter={(v) => v.toFixed(0)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patents increasingly build on larger bodies of prior art. The average number of
          backward citations has grown from under 10 in the 1970s to over 20 in recent years,
          reflecting both the expanding universe of prior art and more thorough examination
          and disclosure requirements. This trend has implications for the originality index,
          as broader citation bases tend to span more technology domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Scope & Breadth" />

      <ChartContainer
        title="Patent Scope Over Time"
        caption="Average and median number of distinct CPC subclasses per patent, measuring technological breadth."
        loading={trL}
        insight="Broadening patent scope reflects the convergence of once-separate technology domains, with modern inventions in areas like IoT, biotech, and AI spanning multiple classification categories."
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
          of distinct CPC subclasses assigned to each patent has increased steadily, reflecting
          the convergence of once-separate technology domains. Modern inventions in areas like
          IoT, biotech, and AI inherently span multiple classification categories.
        </p>
      </KeyInsight>

      <SectionDivider label="Originality & Generality" />

      <Narrative>
        <p>
          The <StatCallout value="originality" /> index (Trajtenberg, Henderson, & Jaffe 1997)
          measures how diverse the technology sources of a patent are -- a patent that cites
          prior art across many different CPC sections is more &quot;original&quot; than one citing
          only its own field. The <StatCallout value="generality" /> index measures the
          reverse: how diverse the citing patents are, capturing whether an invention has
          broad applicability across fields.
        </p>
      </Narrative>

      <ChartContainer
        title="Originality and Generality Indices"
        caption="Average originality (1 - HHI of backward citation CPC sections) and generality (1 - HHI of forward citation CPC sections) by year. Higher = more diverse."
        loading={ogL}
        insight="Rising originality scores indicate that modern inventions increasingly synthesize knowledge from diverse technology fields, consistent with growing interdisciplinary research."
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
          Both originality and generality have trended upward over time, confirming that
          patents are increasingly drawing on diverse knowledge sources and contributing to
          diverse downstream applications. This is consistent with the broader trend toward
          technological convergence and interdisciplinary innovation observed in other
          chapters. The parallel movement of both indices suggests that the innovation
          ecosystem as a whole is becoming more interconnected.
        </p>
      </KeyInsight>

      <SectionDivider label="Self-Citation" />

      <ChartContainer
        title="Self-Citation Rate Over Time"
        caption="Average self-citation rate per patent (fraction of backward citations to patents held by the same assignee), by year."
        loading={scL}
        insight="Self-citation patterns reveal knowledge accumulation strategies within firms, with changes over time reflecting shifts between exploration of new domains and exploitation of established competencies."
      >
        <PWLineChart
          data={selfCite ?? []}
          xKey="year"
          lines={[
            { key: 'avg_self_cite_rate', name: 'Average Self-Citation Rate', color: CHART_COLORS[5] },
            { key: 'median_self_cite_rate', name: 'Median Self-Citation Rate', color: CHART_COLORS[6] },
          ]}
          yLabel="Rate"
          yFormatter={(v) => `${(v * 100).toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Self-citation patterns reveal knowledge accumulation strategies within firms.
          Organizations that consistently cite their own prior patents are building on
          internal knowledge stocks -- a sign of cumulative innovation within technological
          trajectories. Changes in self-citation rates over time can reflect shifts in
          corporate R&D strategy, from exploration of new domains to exploitation of
          established competencies.
        </p>
      </KeyInsight>

      <SectionDivider label="Breakthrough Inventions" />

      <ChartContainer
        title="Breakthrough Patent Rate"
        caption="Percentage of patents in the top 1% of forward citations within their year-technology cohort, 1976-2020."
        loading={btL}
        insight="Variation in the breakthrough rate over time reveals whether the right tail of the citation distribution is shifting, indicating changes in how concentrated inventive impact is among top patents."
      >
        <PWLineChart
          data={breakthrough ?? []}
          xKey="year"
          lines={[
            { key: 'breakthrough_pct', name: 'Breakthrough Rate (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(2)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          By definition, breakthrough patents represent the top 1% within each year-technology
          cohort, so the rate hovers near 1%. However, variation over time reveals whether
          the quality distribution is shifting. Periods with rates slightly above 1% suggest
          that the right tail of the citation distribution is getting heavier -- meaning that
          top inventions are becoming even more disproportionately impactful relative to
          average patents.
        </p>
      </KeyInsight>

      <SectionDivider label="Quality Across Sectors" />

      <ChartContainer
        title="Patent Complexity by Technology Sector"
        caption="Average claims per patent by WIPO sector over 5-year periods. Shows how patent complexity varies across technology domains."
        loading={bsL}
        insight="Biotech and pharma patents tend to have higher citation impact per patent, reflecting the slower but more impactful nature of pharmaceutical innovation."
      >
        <PWLineChart
          data={sectorPivot}
          xKey="period"
          lines={sectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Avg Claims Per Patent"
          yFormatter={(v) => v.toFixed(1)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent complexity, as measured by average claims per patent, varies significantly
          across technology sectors. Chemistry and pharmaceutical patents tend to have more
          claims, reflecting the detailed chemical compound and process claims typical of
          these fields. The convergence of claim counts across sectors in recent decades
          suggests a broad trend toward more complex patent drafting strategies regardless
          of technology domain.
        </p>
      </KeyInsight>

      <SectionDivider label="Sleeping Beauty Patents" />
      <Narrative>
        <p>
          Some patents receive little attention for years, only to be &quot;rediscovered&quot; when
          technology catches up. These &quot;sleeping beauties&quot; received fewer than 2 citations
          per year for their first 10 years, then experienced a burst of 10+ citations
          in a 3-year window. They represent ideas that were ahead of their time.
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
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Early Cites</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Burst Cites</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Burst Year</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Cites</th>
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
                  <td className="text-right py-2 px-3">+{sb.burst_year_after_grant}yr</td>
                  <td className="text-right py-2 px-3 font-mono">{sb.total_fwd_cites.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <KeyInsight>
        <p>
          Sleeping beauty patents span many technology areas but are especially common in
          Chemistry and Physics, where fundamental discoveries may take decades to find
          practical applications. The existence of these dormant-then-explosive patents
          challenges the assumption that citation impact can be assessed within a short
          window after grant, and suggests that the patent system occasionally captures
          genuinely visionary inventions.
        </p>
      </KeyInsight>

      <SectionDivider label="Composite Quality Index" />
      <Narrative>
        <p>
          Individual quality metrics each capture one dimension of patent value. By combining
          forward citations, claims count, technology scope, and grant speed into a single
          Z-score normalized composite index, we can track overall patent quality trends
          across technology areas. Positive values indicate above-average quality; negative
          values indicate below-average.
        </p>
      </Narrative>
      <ChartContainer
        title="Composite Patent Quality Index by Technology Area"
        caption="Z-score normalized composite of forward citations (5yr), claims, scope, and grant speed. Values above 0 = above average."
        loading={cqL}
        insight="Patents with high generality scores represent foundational innovations that influence many downstream technology areas, while the overall downward trend may reflect the system granting more patents of lower individual impact."
      >
        {compositeQualityPivot.length > 0 && (
          <PWLineChart
            data={compositeQualityPivot}
            xKey="year"
            lines={compositeQualitySections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Composite Index (Z-score)"
            yFormatter={(v: number) => v.toFixed(2)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          The composite quality index reveals diverging trajectories across technology areas.
          Chemistry and Human Necessities patents have maintained consistently higher composite
          quality, driven by strong forward citation rates and broad scope. Meanwhile, the
          explosive growth in Electronics and Physics patenting has been accompanied by declining
          average quality, consistent with concerns about patent thickets in those domains.
          The overall downward trend since the 1990s may reflect the system granting more
          patents of lower individual impact.
        </p>
      </KeyInsight>

      <DataNote>
        Quality indicators computed from PatentsView data following the framework of Jaffe &
        de Rassenfosse (2017). Forward citations use a 5-year window and are limited to
        patents granted through 2020 for citation accumulation. Originality and generality
        use the Herfindahl-based measures of Trajtenberg, Henderson, & Jaffe (1997).
        Breakthrough patents are defined as the top 1% of forward citations within each
        year-technology cohort. The composite quality index combines Z-score normalized forward citations (5-year window), claims count, technology scope, and grant speed (inverted). Sleeping beauty patents are identified as those with fewer than 2 citations per year in their first 10 years followed by a burst of 10+ citations in a 3-year window.
      </DataNote>

      <RelatedChapters currentChapter={9} />
      <ChapterNavigation currentChapter={9} />
    </div>
  );
}
