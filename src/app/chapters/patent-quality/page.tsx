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
import { CHART_COLORS, WIPO_SECTOR_COLORS } from '@/lib/colors';
import type {
  QualityTrend, OriginalityGenerality, SelfCitationRate,
  QualityBySector, BreakthroughPatent,
} from '@/lib/types';

export default function Chapter9() {
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');
  const { data: origGen, loading: ogL } = useChapterData<OriginalityGenerality[]>('chapter9/originality_generality.json');
  const { data: selfCite, loading: scL } = useChapterData<SelfCitationRate[]>('chapter9/self_citation_rate.json');
  const { data: bySector, loading: bsL } = useChapterData<QualityBySector[]>('chapter9/quality_by_sector.json');
  const { data: breakthrough, loading: btL } = useChapterData<BreakthroughPatent[]>('chapter9/breakthrough_patents.json');

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

  return (
    <div>
      <ChapterHeader
        number={9}
        title="Patent Quality"
        subtitle="Measuring the value and impact of inventions"
      />

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
      >
        <PWLineChart
          data={breakthrough ?? []}
          xKey="year"
          lines={[
            { key: 'breakthrough_pct', name: 'Breakthrough Rate (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(2)}%`}
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

      <DataNote>
        Quality indicators computed from PatentsView data following the framework of Jaffe &
        de Rassenfosse (2017). Forward citations use a 5-year window and are limited to
        patents granted through 2020 for citation accumulation. Originality and generality
        use the Herfindahl-based measures of Trajtenberg, Henderson, & Jaffe (1997).
        Breakthrough patents are defined as the top 1% of forward citations within each
        year-technology cohort.
      </DataNote>

      <ChapterNavigation currentChapter={9} />
    </div>
  );
}
