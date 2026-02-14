'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS, WIPO_SECTOR_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  CitationLagBySection,
  InnovationVelocity,
  FrictionMapEntry,
  ClaimsBySection,
  QualityBySector,
  CompositeQualityIndex,
  SelfCitationBySection,
} from '@/lib/types';

function pivotVelocity(data: InnovationVelocity[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year && d.yoy_growth_pct != null).forEach((d) => {
      row[d.sector] = d.yoy_growth_pct;
    });
    return row;
  });
}

export default function SectorDynamics() {
  // Citation lag by technology section (from Knowledge Network)
  const { data: citeLagBySection, loading: clsL } = useChapterData<CitationLagBySection[]>('chapter6/citation_lag_by_section.json');

  // Innovation velocity by WIPO sector (from Innovation Dynamics)
  const { data: velocity, loading: vlL } = useChapterData<InnovationVelocity[]>('chapter7/innovation_velocity.json');

  // Examination friction map (from Innovation Dynamics)
  const { data: frictionMap, loading: fmL } = useChapterData<FrictionMapEntry[]>('chapter7/friction_map.json');

  // Claims by CPC section (from Innovation Dynamics)
  const { data: claimsData, loading: clL } = useChapterData<{ by_section: ClaimsBySection[] }>('company/claims_analysis.json');

  // Quality by WIPO sector (from Patent Quality)
  const { data: bySector, loading: bsL } = useChapterData<QualityBySector[]>('chapter9/quality_by_sector.json');

  // Composite quality index by CPC section (from Patent Quality)
  const { data: compositeQuality, loading: cqL } = useChapterData<CompositeQualityIndex[]>('chapter9/composite_quality_index.json');

  // Self-citation by CPC section (from Patent Quality)
  const { data: selfCiteSec } = useChapterData<SelfCitationBySection[]>('chapter9/self_citation_by_section.json');

  // ── Pivot: Citation Lag by Section ──
  const { lagBySectionPivot, lagSections } = useMemo(() => {
    if (!citeLagBySection) return { lagBySectionPivot: [], lagSections: [] };
    const sections = [...new Set(citeLagBySection.map(d => d.section))].sort();
    const decades = [...new Set(citeLagBySection.map(d => d.decade_label))].sort();
    const pivoted = decades.map(decade => {
      const row: Record<string, any> = { decade };
      citeLagBySection.filter(d => d.decade_label === decade).forEach(d => {
        row[d.section] = d.median_lag_years;
      });
      return row;
    });
    return { lagBySectionPivot: pivoted, lagSections: sections };
  }, [citeLagBySection]);

  // ── Pivot: Innovation Velocity ──
  const velocityPivot = useMemo(() => velocity ? pivotVelocity(velocity) : [], [velocity]);
  const velocitySectors = useMemo(() => {
    if (!velocity) return [];
    return [...new Set(velocity.map((d) => d.sector))];
  }, [velocity]);

  // ── Pivot: Examination Friction ──
  const { frictionPivot, frictionSections } = useMemo(() => {
    if (!frictionMap) return { frictionPivot: [], frictionSections: [] };
    const sections = [...new Set(frictionMap.map(d => d.section))].sort();
    const periods = [...new Set(frictionMap.map(d => d.period))].sort();
    const pivoted = periods.map(period => {
      const row: Record<string, any> = { period };
      frictionMap.filter(d => d.period === period).forEach(d => {
        row[d.section] = d.median_lag_years;
      });
      return row;
    });
    return { frictionPivot: pivoted, frictionSections: sections };
  }, [frictionMap]);

  // ── Pivot: Claims by Section ──
  const claimsSectionPivot = useMemo(() => {
    if (!claimsData?.by_section) return { data: [] as any[], decades: [] as string[] };
    const decades = [...new Set(claimsData.by_section.map(d => d.decade))].sort();
    const sections = [...new Set(claimsData.by_section.map(d => d.section))].sort();
    const pivoted = decades.map(decade => {
      const row: Record<string, any> = { decade };
      claimsData.by_section.filter(d => d.decade === decade).forEach(d => {
        row[d.section] = d.median_claims;
      });
      return row;
    });
    return { data: pivoted, decades: sections };
  }, [claimsData]);

  // ── Pivot: Quality by WIPO Sector ──
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

  // ── Pivot: Composite Quality Index ──
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
        number={10}
        title="Sector Dynamics"
        subtitle="How innovation metrics vary across technology fields"
      />

      <KeyFindings>
        <li>Citation lag varies by technology: Physics/Electricity exhibit 11-year median lag vs. 17 years for Chemistry in the 2020s.</li>
        <li>Innovation velocity is correlated across sectors, with synchronized declines during economic downturns.</li>
        <li>Since the mid-2000s, Chemistry patents have exhibited the longest examination durations.</li>
        <li>Composite quality index indicates Chemistry maintaining the highest scores, with Human Necessities rising to second in recent years.</li>
        <li>Claims have increased across all technology areas in recent decades.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Innovation metrics vary substantially across technology fields, revealing distinct dynamics for each sector. Citation lag, examination friction, and quality indicators all exhibit technology-specific patterns that reflect the underlying nature of innovation in different domains. Physics and Electricity patents exhibit shorter citation lags and faster examination times, consistent with rapid innovation cycles in <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">computing and electronics</Link>, whereas Chemistry and Human Necessities demonstrate longer lags and extended pendency, reflecting the complex development timelines characteristic of those fields. A composite Z-score index aggregating citations, claims, scope, and grant speed indicates Chemistry patents consistently scoring highest, with Human Necessities rising to second in recent years, while Electronics and Physics patents have risen from negative to positive composite territory since the 1990s, a trajectory consistent with the accelerating innovation velocity documented across all sectors.
        </p>
      </aside>

      <Narrative>
        <p>
          Patent metrics are not uniform across technology fields. The speed at which knowledge
          diffuses, the time required for patent examination, the scope of patent claims, and the
          composite quality of inventions all vary systematically by technology area. This chapter
          collects sector-level analyses from across the patent system, providing a comprehensive
          view of how innovation dynamics differ across the major technology domains defined by
          the <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> classification and{' '}
          <GlossaryTooltip term="WIPO">WIPO</GlossaryTooltip> technology sectors.
        </p>
      </Narrative>

      {/* ── Section 1: Citation Lag by Technology Area ── */}
      <SectionDivider label="Citation Lag by Technology Area" />

      <ChartContainer
        id="fig-sector-dynamics-citation-lag-by-section"
        subtitle="Median citation lag in years by CPC technology section and decade, revealing technology-specific differences in knowledge accumulation speed."
        title="Physics and Electricity Show 11-Year Median Lag in the 2020s vs. 17 Years for Chemistry"
        caption="Median citation lag in years by CPC section and decade. Physics (G) and Electricity (H), which encompass computing and electronics, demonstrate consistently shorter lags than Chemistry (C) and Human Necessities (A), reflecting faster innovation cycles in digital technologies."
        loading={clsL}
        insight="The increasing density of the citation network indicates that modern inventions build on a broader base of prior knowledge, which is consistent with an accelerating pace of cumulative innovation."
      >
        {lagBySectionPivot.length > 0 && (
          <PWLineChart
            data={lagBySectionPivot}
            xKey="decade"
            lines={lagSections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Median Lag (years)"
            yFormatter={(v: number) => v.toFixed(1)}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Citation lag has increased over time, consistent with the expanding body of relevant
          prior art that newer patents must reference. The growth in lag has been most pronounced
          since the 2000s, as the cumulative stock of patented knowledge has grown substantially.
          Technology areas such as Physics and Electricity tend to exhibit shorter citation lags,
          consistent with rapid innovation cycles in <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">computing and electronics</Link>, whereas
          Chemistry and Human Necessities (including pharmaceuticals) demonstrate longer lags,
          consistent with the extended development timelines characteristic of those fields.
        </p>
      </KeyInsight>

      {/* ── Section 2: Innovation Velocity ── */}
      <SectionDivider label="Innovation Velocity" />

      <Narrative>
        <p>
          Year-over-year growth rates reveal the cyclical nature of patenting activity. All sectors
          tend to co-move in response to macroeconomic conditions and patent policy changes,
          though electrical engineering has consistently exhibited stronger growth momentum since the 1990s.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-sector-dynamics-velocity"
        subtitle="Year-over-year percentage change in patent grants by WIPO technology sector, revealing synchronized cyclical patterns."
        title="Patenting Growth Rates Are Highly Correlated Across Five Sectors, with Synchronized Declines Following the Dot-Com Bust (2004-2005) and Financial Crisis (2007)"
        caption="This chart presents the annual percentage change in patent grants by WIPO technology sector. All sectors exhibit synchronized responses to macroeconomic conditions, though electrical engineering has demonstrated consistently stronger growth momentum since the 1990s."
        loading={vlL}
        insight="The correlation of growth rates across sectors is consistent with macroeconomic conditions and patent policy exerting stronger influence on patenting rates than sector-specific technology cycles."
      >
        <PWLineChart
          data={velocityPivot}
          xKey="year"
          lines={velocitySectors.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Year-over-Year %"
          yFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2011] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Innovation velocity is highly correlated across sectors, suggesting that macroeconomic
          conditions and patent policy are stronger determinants of patenting rates than sector-specific
          technology cycles. The synchronized declines during the early 2000s dot-com contraction and the 2008
          financial crisis are particularly instructive.
        </p>
      </KeyInsight>

      {/* ── Section 3: Patent Examination Friction ── */}
      <SectionDivider label="Patent Examination Friction" />

      <Narrative>
        <p>
          Technologies do not proceed through the patent office at uniform speed. The
          &quot;friction map&quot; identifies which technology areas systematically exhibit longer
          examination durations, measured as the median time from filing to grant.
          These differences appear to reflect both the complexity of examination and the USPTO&apos;s resource
          allocation across technology centers.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-sector-dynamics-friction-map"
        subtitle="Median time from application filing to patent grant by CPC section and 5-year period, measuring technology-specific examination friction."
        title="Since the Mid-2000s, Chemistry (C) Patents Have Exhibited the Longest Examination Durations, with a Median of 1,293 Days in the 2010-2014 Period"
        caption="This chart presents the median time from application filing to patent grant, disaggregated by CPC section and 5-year period. Since the mid-2000s, Chemistry and Human Necessities patents have exhibited the longest pendency, with all technology areas peaking around 2010-2014 before declining following USPTO reforms."
        loading={fmL}
        insight="Examination duration patterns are consistent with institutional constraints that shape innovation timelines, with technology-specific backlogs associated with the USPTO's resource allocation across its technology centers."
      >
        {frictionPivot.length > 0 && (
          <PWLineChart
            data={frictionPivot}
            xKey="period"
            lines={frictionSections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Median Years to Grant"
            yDomain={[0, 4]}
            yFormatter={(v: number) => v.toFixed(0)}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Examination duration increased substantially across all technology areas through
          the 2000s, peaking in the 2010-2014 period as the USPTO contended with a considerable backlog.
          The AIA reforms and USPTO hiring initiatives contributed to reduced pendency in subsequent
          years. Since the mid-2000s, Chemistry (C) patents have exhibited the longest
          examination durations, a pattern consistent with the complexity of chemical and biomedical
          examination. The financial crisis of 2008-2009 did not reduce filing rates sufficiently to
          alleviate the backlog, which continued growing until systemic reforms took effect.
        </p>
      </KeyInsight>

      {/* ── Section 4: Claims by Technology Area ── */}
      <SectionDivider label="Claims by Technology Area" />

      <Narrative>
        <p>
          The number of claims in a patent defines the scope of legal protection. Trends in
          claim counts by technology area reveal how patent strategy has evolved across fields,
          with increases across all technology areas reflecting a broad trend toward more detailed patent
          drafting regardless of domain.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-sector-dynamics-claims-by-section"
        subtitle="Median claim count by CPC technology section and decade, showing increases in patent drafting complexity across fields."
        title="Claim Counts Have Increased Across All Technology Areas, with Physics (G) Leading at a Median of 19 and Electricity (H) at 18 in the 2020s"
        caption="This chart displays the median claim count by CPC section and decade. Claim counts have increased across all technology areas, with the range widening from 1 to 4 across decades, reflecting diverging patent drafting complexity across fields."
        loading={clL}
      >
        {claimsSectionPivot.data.length > 0 ? (
          <PWLineChart
            data={claimsSectionPivot.data}
            xKey="decade"
            lines={claimsSectionPivot.decades.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Median Claims"
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent complexity, as measured by average claims per patent, varies considerably
          across technology sectors. Electrical engineering and instruments patents tend to have the most
          claims in recent decades, reflecting the detailed and layered claim structures characteristic of
          software and electronics inventions. The increase in claim counts across all sectors in recent decades
          reflects a broad trend toward more complex patent drafting strategies, though the range
          across sectors has widened rather than narrowed.
        </p>
      </KeyInsight>

      {/* ── Section 5: Quality Across Sectors (WIPO) ── */}
      <SectionDivider label="Quality Across Sectors" />

      <ChartContainer
        id="fig-sector-dynamics-quality-by-sector"
        subtitle="Average number of claims per patent by WIPO technology sector, computed in 5-year periods to illustrate cross-sector trends."
        title="Instruments Patents Peaked at 19.8 Average Claims (2001-2005) While Mechanical Engineering Rose from 9.3 to 14.9, Reflecting Broad Increases Across Sectors"
        caption="This chart displays the average claims per patent by WIPO sector over 5-year periods. Electrical engineering and instruments patents tend to have the most claims in recent decades. Claim counts have increased across all sectors, though the range has widened over time."
        loading={bsL}
        insight="Electrical engineering patents tend to exhibit higher citation impact per patent than Chemistry patents, a pattern consistent with rapid innovation cycles and dense citation networks in computing and electronics."
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
          Quality metrics vary substantially across technology sectors; electrical engineering
          patents tend to receive more citations per patent than Chemistry patents (e.g., 2016-2020: Electrical=5.20 vs. Chemistry=4.37).
          Patent complexity, as measured by average claims per patent, varies considerably
          across WIPO technology sectors, with instruments and electrical engineering patents
          exhibiting the highest claim counts in recent periods.
        </p>
      </KeyInsight>

      {/* ── Section 6: Composite Quality Index ── */}
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
        id="fig-sector-dynamics-composite-index"
        subtitle="Z-score normalized composite of forward citations, claims, scope, and grant speed by CPC section. Values above 0 indicate above-average quality."
        title="Chemistry (C) Patents Maintain the Highest Composite Quality Scores, with Human Necessities (A) Rising to Second in Recent Years, While Electronics (H) and Physics (G) Rose from Negative to Positive Z-Scores Since the 1990s"
        caption="This chart displays a Z-score normalized composite index of forward citations (5-year window), claims, scope, and grant speed by CPC section. Values above 0 indicate above-average quality. Chemistry (C) patents consistently score highest, with Human Necessities (A) rising to second in recent years, whereas Electronics (H) and Physics (G) have improved from negative to positive composite scores since the 1990s."
        loading={cqL}
        insight="Composite quality has improved across most technology areas since the 1990s, with Chemistry maintaining the highest scores throughout and Human Necessities rising to second in recent years."
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
          Chemistry patents have maintained consistently the highest composite
          quality, driven by strong forward citation rates and broad scope, with Human Necessities rising to second in recent years. Electronics and
          Physics patenting has exhibited improving average quality since the 1990s, with composite
          scores rising from negative to positive territory. The overall upward trend since
          the 1990s suggests that patent quality has improved alongside growing volume.
        </p>
      </KeyInsight>

      {/* ── Section 7: Self-Citation by Section ── */}
      <SectionDivider label="Self-Citation by Technology Area" />

      <Narrative>
        <p>
          Self-citation patterns reveal meaningful differences in how sectors accumulate
          knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation
          rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s
          previous work.
        </p>
      </Narrative>

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
                  <td className="py-1.5 text-right font-mono text-xs">{d.self_cite_rate.toFixed(1)}%</td>
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
          previous work. However, these rates may also signal strategic behavior, as firms cite their own
          patents to construct defensive thickets that may raise barriers to entry for competitors.
        </p>
      </KeyInsight>

      <Narrative>
        This chapter has demonstrated that innovation metrics are not uniform across technology fields. Citation lag, examination friction, claim complexity, and composite quality all vary systematically by sector, reflecting the underlying nature of innovation in each domain. These sector-specific patterns provide essential context for interpreting the <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">deep-dive analyses</Link> that follow, where domain-specific metrics prove especially relevant for distinguishing genuine innovation from volume growth.
      </Narrative>

      <DataNote>
        Citation lag by section uses median lag in years between cited and citing patent grant dates, aggregated by CPC section and decade. Innovation velocity is computed as year-over-year percentage change in patent grants by WIPO technology sector. Examination friction is measured as the median time from application filing date to patent grant date, aggregated by CPC section and 5-year period. Claims analysis uses the patent_num_claims field from g_patent for utility patents only, aggregated by CPC section and decade. Quality by WIPO sector uses average claims per patent computed in 5-year periods. The composite quality index combines Z-score normalized forward citations (5-year window), claims count, technology scope, and grant speed (inverted) by CPC section and year. Self-citation rates are computed as the fraction of backward citations directed to patents held by the same assignee, aggregated by CPC section and decade.
      </DataNote>

      <RelatedChapters currentChapter={10} />
      <ChapterNavigation currentChapter={10} />
    </div>
  );
}
