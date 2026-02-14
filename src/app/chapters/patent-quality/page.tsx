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
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  QualityTrend, OriginalityGenerality, SelfCitationRate,
  QualityBySector, BreakthroughPatent,
  CompositeQualityIndex, SleepingBeauty,
  QualityByCountry, SelfCitationByAssignee, SelfCitationBySection,
  FirmGiniYear,
} from '@/lib/types';

export default function Chapter9() {
  const { data: trends, loading: trL } = useChapterData<QualityTrend[]>('chapter9/quality_trends.json');
  const { data: origGen, loading: ogL } = useChapterData<OriginalityGenerality[]>('chapter9/originality_generality.json');
  const { data: selfCite, loading: scL } = useChapterData<SelfCitationRate[]>('chapter9/self_citation_rate.json');
  const { data: bySector, loading: bsL } = useChapterData<QualityBySector[]>('chapter9/quality_by_sector.json');
  useChapterData<BreakthroughPatent[]>('chapter9/breakthrough_patents.json');
  const { data: compositeQuality, loading: cqL } = useChapterData<CompositeQualityIndex[]>('chapter9/composite_quality_index.json');
  const { data: sleepingBeauties } = useChapterData<SleepingBeauty[]>('chapter9/sleeping_beauties.json');
  const { data: qualByCountry, loading: qcL } = useChapterData<QualityByCountry[]>('chapter9/quality_by_country.json');
  const { data: selfCiteAssignee, loading: scaL } = useChapterData<SelfCitationByAssignee[]>('chapter9/self_citation_by_assignee.json');
  const { data: selfCiteSec } = useChapterData<SelfCitationBySection[]>('chapter9/self_citation_by_section.json');
  const { data: firmGini, loading: fgL } = useChapterData<Record<string, FirmGiniYear[]>>('company/firm_quality_gini.json');

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

  const latestDecadeCountry = useMemo(() => {
    if (!qualByCountry) return [];
    const maxDecade = Math.max(...qualByCountry.map(d => d.decade));
    return qualByCountry
      .filter(d => d.decade === maxDecade)
      .sort((a, b) => b.avg_claims - a.avg_claims)
      .slice(0, 15);
  }, [qualByCountry]);

  const giniPanels = useMemo(() => {
    if (!firmGini) return [];
    return Object.entries(firmGini).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.gini })),
    }));
  }, [firmGini]);

  return (
    <div>
      <ChapterHeader
        number={9}
        title="Patent Quality"
        subtitle="Measuring the value and impact of patented inventions"
      />

      <KeyFindings>
        <li>Average <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> per patent have increased over time, though median citations remain flat, indicating growing skewness in the citation distribution.</li>
        <li>Patent <GlossaryTooltip term="originality">originality</GlossaryTooltip> -- the breadth of prior art drawn upon -- has increased, suggesting more interdisciplinary innovation.</li>
        <li>Patent <GlossaryTooltip term="generality">generality</GlossaryTooltip> -- the breadth of downstream citing fields -- exhibits technology-specific patterns, with foundational inventions scoring highest.</li>
        <li>Quality metrics vary substantially across technology sectors; biotechnology and pharmaceutical patents tend to receive more citations per patent than electronics patents.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Multiple quality dimensions have moved in distinct directions since the 1970s: average claims per patent rose roughly 76% (from approximately 9.5 to 17) alongside the <Link href="/chapters/the-innovation-landscape" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">fivefold volume growth</Link>, backward citations quadrupled, and the originality index climbed from 0.09 to 0.25 -- yet the generality index fell from 0.28 to 0.15, revealing that broader knowledge inputs have not translated into correspondingly broader downstream applicability. A composite Z-score index aggregating citations, claims, scope, and grant speed shows Chemistry and Human Necessities patents consistently scoring highest, while Electronics and Physics patents have risen from negative to positive composite territory since the 1990s, a trajectory consistent with the accelerating innovation velocity documented in <Link href="/chapters/innovation-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Innovation Dynamics</Link>. Sleeping beauty patents -- dormant for a decade or more before experiencing citation bursts -- are concentrated overwhelmingly in Human Necessities (94% of identified cases), challenging the assumption that short citation windows suffice for impact assessment and reinforcing the sector-specific quality patterns that pervade the data.
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

      <SectionDivider label="Citation Impact" />

      <ChartContainer
        id="fig-patent-quality-forward-citations"
        subtitle="Average and median forward citations received within 5 years of grant, by grant year. The gap between the two measures reveals the skewness of the citation distribution."
        title="Average Forward Citations per Patent Rose from 2.5 to 6.4 While the Median Remained at 2, Revealing Growing Skewness"
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

      <ChartContainer
        id="fig-patent-quality-backward-citations"
        subtitle="Average and median backward citations (references to prior art) per utility patent by year, reflecting the expanding body of searchable prior art."
        title="Backward Citations Per Patent Have Increased from Approximately 5 in the 1970s to Around 20 in Recent Years"
        caption="This chart displays average and median backward citations (references to prior art) per utility patent from 1976 to 2025. The consistent upward trend reflects the expanding universe of searchable prior art and increasingly thorough examination and disclosure requirements."
        loading={trL}
        insight="The growing body of backward citations is consistent with the expanding universe of prior art and more thorough examination and disclosure requirements over time."
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
          backward citations has increased from approximately 5 in the 1970s to around 20 in recent years,
          a trend consistent with both the expanding universe of prior art and more thorough examination
          and disclosure requirements. This pattern has implications for the originality index,
          as broader citation bases tend to span more technology domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Scope & Breadth" />

      <ChartContainer
        id="fig-patent-quality-scope"
        subtitle="Average and median number of distinct CPC subclasses assigned per patent, measuring technological breadth over time."
        title="Average Patent Scope Grew from 1.8 to 2.5 CPC Subclasses as Technologies Became More Interdisciplinary"
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

      <SectionDivider label="Self-Citation" />

      <ChartContainer
        id="fig-patent-quality-self-citation-rate"
        subtitle="Average and median self-citation rate per patent (fraction of backward citations to the same assignee's earlier patents), by year."
        title="Average Self-Citation Rates Declined from 35% in 1976 to 10.5% by 2010, Then Rebounded to 15% by the 2020s"
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
          trajectories. Changes in self-citation rates over time may reflect shifts in
          corporate R&D strategy, from exploration of new domains to exploitation of
          established competencies.
        </p>
      </KeyInsight>

      <SectionDivider label="Quality Across Sectors" />

      <ChartContainer
        id="fig-patent-quality-claims-by-sector"
        subtitle="Average number of claims per patent by WIPO technology sector, computed in 5-year periods to show cross-sector convergence trends."
        title="Instruments Patents Peaked at 19.8 Average Claims (2001-2005) While Mechanical Engineering Rose from 9.3 to 14.9, Driving Cross-Sector Convergence"
        caption="This chart displays the average claims per patent by WIPO sector over 5-year periods. Electrical engineering and instruments patents tend to have the most claims in recent decades. The convergence of claim counts across sectors suggests a broad trend toward more detailed patent drafting."
        loading={bsL}
        insight="Biotechnology and pharmaceutical patents tend to exhibit higher citation impact per patent, a pattern consistent with the slower but more impactful nature of pharmaceutical innovation."
      >
        <PWLineChart
          data={sectorPivot}
          xKey="period"
          lines={sectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Average Claims Per Patent"
          yFormatter={(v) => v.toFixed(1)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent complexity, as measured by average claims per patent, varies considerably
          across technology sectors. Electrical engineering and instruments patents tend to have the most
          claims in recent decades, reflecting the detailed and layered claim structures characteristic of
          software and electronics inventions. The convergence of claim counts across sectors in recent decades
          suggests a broad trend toward more complex patent drafting strategies irrespective
          of technology domain.
        </p>
      </KeyInsight>

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
                  <td className="text-right py-2 px-3 font-mono">{sb.total_fwd_cites.toLocaleString()}</td>
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

      <SectionDivider label="Composite Quality Index" />
      <Narrative>
        <p>
          Individual quality metrics each capture one dimension of patent value. Combining
          forward citations, claims count, technology scope, and grant speed into a single
          Z-score normalized composite index enables tracking of overall patent quality trends
          across technology areas. Positive values indicate above-average quality; negative
          values indicate below-average quality.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-patent-quality-composite-index"
        subtitle="Z-score normalized composite of forward citations, claims, scope, and grant speed by CPC section. Values above 0 indicate above-average quality."
        title="Chemistry (C) and Human Necessities (A) Patents Maintain the Highest Composite Quality Scores, While Electronics (H) and Physics (G) Rose from Negative to Positive Z-Scores Since the 1990s"
        caption="This chart displays a Z-score normalized composite index of forward citations (5-year window), claims, scope, and grant speed by CPC section. Values above 0 indicate above-average quality. Chemistry (C) and Human Necessities (A) patents consistently score highest, whereas Electronics (H) and Physics (G) have improved from negative to positive composite scores since the 1990s."
        loading={cqL}
        insight="Composite quality has improved across most technology areas since the 1990s, with Chemistry and Human Necessities maintaining the highest scores throughout."
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
          quality, driven by strong forward citation rates and broad scope. Electronics and
          Physics patenting has exhibited improving average quality since the 1990s, with composite
          scores rising from negative to positive territory. The overall upward trend since
          the 1990s suggests that patent quality has improved alongside growing volume.
        </p>
      </KeyInsight>

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

      <SectionDivider label="Self-Citation and Corporate Knowledge Recycling" />

      <Narrative>
        <p>
          Self-citations, in which a firm cites its own earlier patents, reveal the extent
          to which organizations build upon their own knowledge base. Elevated self-citation rates may indicate
          deep, cumulative R&D programs, but may also reflect strategic behavior intended to construct
          defensive patent thickets.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-quality-self-citation-by-assignee"
        subtitle="Self-citation rate (fraction of backward citations to same assignee) for the 20 most-cited assignees, revealing knowledge recycling patterns."
        title="Canon (47.6%), TSMC (38.4%), and Micron (25.3%) Exhibit the Highest Self-Citation Rates Among Top Assignees"
        caption="This chart displays the fraction of all backward citations that are self-citations (citing the same assignee's earlier patents), for the 20 most-cited assignees. Firms with deep, cumulative R&D programs, including IBM, Samsung, and semiconductor manufacturers, exhibit the highest self-citation rates."
        insight="Elevated self-citation rates among firms with cumulative R&D programs are consistent with long-term knowledge building on internal prior art, though strategic considerations may also contribute."
        loading={scaL}
        height={700}
      >
        <PWBarChart
          data={(selfCiteAssignee ?? []).map(d => ({
            ...d,
            label: cleanOrgName(d.organization),
            self_cite_pct: d.self_cite_rate * 100,
          }))}
          xKey="label"
          bars={[{ key: 'self_cite_pct', name: 'Self-Citation Rate (%)', color: CHART_COLORS[6] }]}
          layout="vertical"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      {selfCiteSec && (
        <div className="my-12 overflow-x-auto">
          <h3 className="mb-4 font-sans text-base font-semibold tracking-tight text-muted-foreground">
            Self-Citation Rates by CPC Section and Decade
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 font-medium">Decade</th>
                <th className="py-2 pr-4 text-right font-medium">Total Citations</th>
                <th className="py-2 pr-4 text-right font-medium">Self-Citations</th>
                <th className="py-2 text-right font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {selfCiteSec.map((d, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 font-medium">{d.section}</td>
                  <td className="py-1.5 pr-4">{d.decade}s</td>
                  <td className="py-1.5 pr-4 text-right font-mono text-xs">{formatCompact(d.total_citations)}</td>
                  <td className="py-1.5 pr-4 text-right font-mono text-xs">{formatCompact(d.self_citations)}</td>
                  <td className="py-1.5 text-right font-mono text-xs">{(d.self_cite_rate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            Self-citation rate = (self-citations / total citations) for patents in each CPC section and decade.
            A self-citation occurs when the citing and cited patents share the same primary assignee.
          </figcaption>
        </div>
      )}

      <KeyInsight>
        <p>
          Self-citation patterns reveal meaningful differences in how firms and sectors accumulate
          knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation
          rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s
          previous work. Nevertheless, these rates may also signal strategic behavior, as firms cite their own
          patents to construct defensive thickets that raise barriers to entry for competitors.
        </p>
      </KeyInsight>

      <SectionDivider label="Within-Firm Quality Concentration" />

      <Narrative>
        <p>
          The Gini coefficient, applied to forward citations within each firm&apos;s annual patent
          cohort, measures how concentrated a firm&apos;s citation impact is across its portfolio.
          A Gini near 1.0 indicates that virtually all citation impact is concentrated in a
          handful of patents; near 0.0 indicates impact is evenly distributed. A rising Gini
          signals increasing dependence on a small number of high-impact inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-quality-firm-gini"
        subtitle="Gini coefficient of forward citations within each firm's annual patent cohort, measuring how concentrated citation impact is across the portfolio."
        title="Within-Firm Citation Gini Coefficients Rose from 0.5 to Above 0.8 for Most Large Filers, Signaling Growing Reliance on Blockbuster Patents"
        caption="Each panel shows one firm's citation Gini coefficient by year (top 20 firms by recent Gini). Higher values indicate more concentrated citation impact within the firm's patent portfolio."
        insight="Most large patent filers exhibit Gini coefficients between 0.6 and 0.9, indicating that a small fraction of each firm's patents accounts for the majority of citation impact. Several firms show rising Gini trajectories, consistent with increasing reliance on blockbuster inventions."
        loading={fgL}
        height={850}
        wide
      >
        <PWSmallMultiples
          panels={giniPanels}
          xLabel="Year"
          yLabel="Gini"
          yFormatter={(v) => v.toFixed(2)}
          columns={4}
          color={CHART_COLORS[4]}
        />
      </ChartContainer>

      <Narrative>
        The preceding chapters examined the mechanics of innovation: knowledge flows through citations, the tempo and convergence of patent activity, and the measurement of patent quality. The remaining chapters provide context and deep dives into specific domains.
        The analysis begins with the <Link href="/chapters/patent-law" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">legal and policy framework</Link> that shapes the patent system itself, where rules governing patentability, examination, and enforcement exert substantial influence on both the quality and quantity of innovation.
      </Narrative>

      <DataNote>
        Quality indicators computed from PatentsView data following the framework of Jaffe and
        de Rassenfosse (2017). Forward citations use a 5-year window and are limited to
        patents granted through 2020 for citation accumulation. Originality and generality
        use the Herfindahl-based measures of Trajtenberg, Henderson, and Jaffe (1997).
        Breakthrough patents are defined as the top 1% of forward citations within each
        year-technology cohort. The composite quality index combines Z-score normalized forward citations (5-year window), claims count, technology scope, and grant speed (inverted). Sleeping beauty patents are identified as those with fewer than 2 citations per year in their first 10 years followed by a burst of 10+ citations in a 3-year window.
      </DataNote>

      <RelatedChapters currentChapter={9} />
      <ChapterNavigation currentChapter={9} />
    </div>
  );
}
