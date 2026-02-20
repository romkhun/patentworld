'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWTreemap } from '@/components/charts/PWTreemap';
import { PWValueHeatmap } from '@/components/charts/PWValueHeatmap';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { CompetingExplanations } from '@/components/chapter/CompetingExplanations';
import { CHART_COLORS, CPC_SECTION_COLORS, WIPO_SECTOR_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  DesignPatentTrend,
  CPCSectionPerYear,
  CPCTreemapEntry,
  CPCClassChange,
  TechDiversity,
  TechnologySCurve,
  HHIBySection,
  InnovationVelocity,
  FrictionMapEntry,
  CitationLagBySection,
  TechnologyHalfLife,
  TechnologyDecayCurve,
  QualityBySector,
  ClaimsBySection,
  SelfCitationBySection,
} from '@/lib/types';

/* ── Utility: pivot CPCSectionPerYear into one row per year with section keys ── */
function pivotBySection(data: CPCSectionPerYear[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: Record<string, any> = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.section] = d.count; });
    return row;
  });
}

/* ── Utility: pivot InnovationVelocity by WIPO sector ── */
function pivotVelocity(data: InnovationVelocity[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: Record<string, any> = { year };
    data.filter((d) => d.year === year && d.yoy_growth_pct != null).forEach((d) => {
      row[d.sector] = d.yoy_growth_pct;
    });
    return row;
  });
}

export default function SystemPatentFieldsChapter() {
  /* ── Data hooks ── */

  // Section A: Design versus Utility
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[] }>('company/design_patents.json');

  // Section B.i: CPC section composition (area chart)
  const { data: cpcSections, loading: cpcL } = useChapterData<CPCSectionPerYear[]>('chapter2/cpc_sections_per_year.json');

  // Section B.ii: CPC class change (diverging bar)
  const { data: cpcChange, loading: chgL } = useChapterData<(CPCClassChange & { direction: string })[]>('chapter2/cpc_class_change.json');

  // Section B.iii: HHI by CPC section
  const { data: hhiData, loading: hhiL } = useChapterData<HHIBySection[]>('chapter10/hhi_by_section.json');

  // Section B.iv: Technology diversity
  const { data: diversity, loading: divL } = useChapterData<TechDiversity[]>('chapter2/tech_diversity.json');

  // Section B.v: Innovation velocity
  const { data: velocity, loading: vlL } = useChapterData<InnovationVelocity[]>('chapter7/innovation_velocity.json');

  // Section B.vi: Patent examination friction
  const { data: frictionMap, loading: fmL } = useChapterData<FrictionMapEntry[]>('chapter7/friction_map.json');

  // Section B.vii: Technology S-curves
  const { data: scurves, loading: scL } = useChapterData<TechnologySCurve[]>('chapter2/technology_scurves.json');

  // Section B.ix: Citation lag by technology area
  const { data: citeLagBySection, loading: clsL } = useChapterData<CitationLagBySection[]>('chapter6/citation_lag_by_section.json');

  // Section B.x: Citation half-lives & decay curves (from cross-field-convergence)
  const { data: halfLife } = useChapterData<TechnologyHalfLife[]>('chapter2/technology_halflife.json');
  const { data: decayCurves, loading: dcL } = useChapterData<TechnologyDecayCurve[]>('chapter2/technology_decay_curves.json');

  // Section C: Treemap
  const { data: treemap, loading: tmL } = useChapterData<CPCTreemapEntry[]>('chapter2/cpc_treemap.json');

  // Section D: Claims by section, quality by sector, self-citation
  const { data: claimsData, loading: claimL } = useChapterData<{ by_section: ClaimsBySection[] }>('company/claims_analysis.json');
  const { data: bySector, loading: bsL } = useChapterData<QualityBySector[]>('chapter9/quality_by_sector.json');
  const { data: selfCiteSec } = useChapterData<SelfCitationBySection[]>('chapter9/self_citation_by_section.json');

  // Section D.ii-D.iv: Quality metrics by CPC section
  const { data: qualityCpc, loading: qcL } = useChapterData<any[]>('computed/quality_by_cpc_section.json');

  // Section E: CPC Reclassification (Analysis 9)
  const { data: reclassByDecade, loading: rcDecL } = useChapterData<{ decade: number; total_patents: number; reclassified: number; reclass_rate_pct: number }[]>('chapter3/cpc_reclassification_by_decade.json');
  const { data: reclassFlows, loading: rcFlL } = useChapterData<{ from_section: string; to_section: string; count: number }[]>('chapter3/cpc_reclassification_flows.json');

  // Section F: WIPO Sector Shares & Growth (Analysis 10)
  const { data: wipoShares, loading: wsL } = useChapterData<{ year: number; sector: string; patent_count: number }[]>('chapter3/wipo_sector_shares.json');
  const { data: wipoGrowth, loading: wgL } = useChapterData<{ field: string; count_early: number; count_late: number; growth_pct: number; total: number }[]>('chapter3/wipo_field_growth.json');

  /* ── Toggle state for CPC area chart ── */
  const [cpcStackedPercent, setCpcStackedPercent] = useState(true);

  /* ── Pivots ── */

  // B.i: CPC section pivot (merge D into Other)
  const sectionPivot = useMemo(() => cpcSections ? pivotBySection(cpcSections) : [], [cpcSections]);
  const mainSectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y' && k !== 'D');
  const sectionPivotMerged = useMemo(() => sectionPivot.map((row: Record<string, any>) => {
    const merged = { ...row, Other: (row['D'] ?? 0) + (row['Y'] ?? 0) };
    return merged;
  }), [sectionPivot]);

  // B.ii: CPC class change data
  const changeData = useMemo(() => {
    if (!cpcChange) return [];
    const fmtLabel = (d: CPCClassChange & { direction: string }) => {
      const title = (d.title ?? d.class_name ?? '').slice(0, 42);
      return `${d.cpc_class} \u2013 ${title}`;
    };
    const growing = cpcChange
      .filter((d) => d.direction === 'growing')
      .sort((a, b) => b.pct_change - a.pct_change)
      .map((d) => ({ label: fmtLabel(d), pct_change: d.pct_change }));
    const declining = cpcChange
      .filter((d) => d.direction === 'declining')
      .sort((a, b) => a.pct_change - b.pct_change)
      .map((d) => ({ label: fmtLabel(d), pct_change: d.pct_change }));
    return [...growing, ...declining.reverse()];
  }, [cpcChange]);

  // B.iii: HHI pivot
  const hhiPivot = useMemo(() => {
    if (!hhiData) return [];
    const periods = [...new Set(hhiData.map((d) => d.period))].sort();
    return periods.map((period) => {
      const row: Record<string, any> = { period };
      hhiData.filter((d) => d.period === period).forEach((d) => { row[d.section] = d.hhi; });
      return row;
    });
  }, [hhiData]);

  const hhiSections = useMemo(() => {
    if (!hhiData) return [];
    return [...new Set(hhiData.filter((d) => d.section !== 'Overall').map((d) => d.section))].sort();
  }, [hhiData]);

  // B.v: Innovation velocity pivot
  const velocityPivot = useMemo(() => velocity ? pivotVelocity(velocity) : [], [velocity]);
  const velocitySectors = useMemo(() => {
    if (!velocity) return [];
    return [...new Set(velocity.map((d) => d.sector))];
  }, [velocity]);

  // B.vi: Examination friction pivot
  const { frictionPivot, frictionSections } = useMemo(() => {
    if (!frictionMap) return { frictionPivot: [], frictionSections: [] };
    const sections = [...new Set(frictionMap.map(d => d.section))].sort();
    const periods = [...new Set(frictionMap.map(d => d.period))].sort();
    const pivoted = periods.map(period => {
      const row: Record<string, any> = { period };
      frictionMap.filter(d => d.period === period).forEach(d => { row[d.section] = d.median_lag_years; });
      return row;
    });
    return { frictionPivot: pivoted, frictionSections: sections };
  }, [frictionMap]);

  // B.vii: S-curve summary
  const scurveData = useMemo(() => {
    if (!scurves) return [];
    return scurves.map(d => ({
      section: `${d.section}: ${d.section_name}`,
      lifecycle_stage: d.lifecycle_stage,
      cumulative_total: d.cumulative_total,
      current_growth_rate: d.current_growth_rate,
      recent_5yr_volume: d.recent_5yr_volume,
      current_pct_of_K: d.current_pct_of_K,
    }));
  }, [scurves]);

  // B.ix: Citation lag by section pivot
  const { lagBySectionPivot, lagSections } = useMemo(() => {
    if (!citeLagBySection) return { lagBySectionPivot: [], lagSections: [] };
    const sections = [...new Set(citeLagBySection.map(d => d.section))].sort();
    const decades = [...new Set(citeLagBySection.map(d => d.decade_label))].sort();
    const pivoted = decades.map(decade => {
      const row: Record<string, any> = { decade };
      citeLagBySection.filter(d => d.decade_label === decade).forEach(d => { row[d.section] = d.median_lag_years; });
      return row;
    });
    return { lagBySectionPivot: pivoted, lagSections: sections };
  }, [citeLagBySection]);

  // B.x: Citation decay curves pivot
  const { decayPivot, decaySections } = useMemo(() => {
    if (!decayCurves) return { decayPivot: [], decaySections: [] };
    const sections = [...new Set(decayCurves.map(d => d.section))].sort();
    const years = [...new Set(decayCurves.map(d => d.years_after))].sort((a, b) => a - b);
    const pivoted = years.map(yr => {
      const row: Record<string, any> = { years_after: yr };
      decayCurves.filter(d => d.years_after === yr).forEach(d => { row[d.section] = d.pct_of_total; });
      return row;
    });
    return { decayPivot: pivoted, decaySections: sections };
  }, [decayCurves]);

  // D.i: Claims by section pivot
  const claimsSectionPivot = useMemo(() => {
    if (!claimsData?.by_section) return { data: [] as Record<string, any>[], decades: [] as string[] };
    const decades = [...new Set(claimsData.by_section.map(d => d.decade))].sort();
    const sections = [...new Set(claimsData.by_section.map(d => d.section))].sort();
    const pivoted = decades.map(decade => {
      const row: Record<string, any> = { decade };
      claimsData.by_section.filter(d => d.decade === decade).forEach(d => { row[d.section] = d.median_claims; });
      return row;
    });
    return { data: pivoted, decades: sections };
  }, [claimsData]);

  // D.i: Quality by WIPO sector pivot
  const { sectorPivot, sectorNames } = useMemo(() => {
    if (!bySector) return { sectorPivot: [], sectorNames: [] };
    const sectors = [...new Set(bySector.map((d) => d.sector))];
    const periods = [...new Set(bySector.map((d) => d.period))].sort();
    const pivoted = periods.map((period) => {
      const row: Record<string, any> = { period };
      bySector.filter((d) => d.period === period).forEach((d) => { row[d.sector] = d.avg_claims; });
      return row;
    });
    return { sectorPivot: pivoted, sectorNames: sectors };
  }, [bySector]);

  /* ── Pivot: quality_by_cpc_section (generic by-group pivot) ── */
  const pivotData = (raw: any[] | null, metric: string) => {
    if (!raw) return [];
    const byYear: Record<number, any> = {};
    for (const r of raw) {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.group] = r[metric];
    }
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  };

  const cpcQualityNames: Record<string, string> = Object.fromEntries(
    Object.entries(CPC_SECTION_NAMES).map(([k, v]) => [k, `${k}: ${v}`])
  );
  const cpcQualitySections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cpcQualityLines = cpcQualitySections.map((s) => ({
    key: s,
    name: cpcQualityNames[s],
    color: CPC_SECTION_COLORS[s],
  }));

  // E: Reclassification flow data formatted for heatmap
  const reclassFlowData = useMemo(() => reclassFlows ?? [], [reclassFlows]);

  // F: WIPO sector shares pivot (one row per year with sector columns)
  const wipoSharesPivot = useMemo(() => {
    if (!wipoShares) return [];
    const years = [...new Set(wipoShares.map(d => d.year))].sort();
    return years.map(year => {
      const row: Record<string, any> = { year };
      wipoShares.filter(d => d.year === year).forEach(d => { row[d.sector] = d.patent_count; });
      return row;
    });
  }, [wipoShares]);

  const wipoSectorNames = useMemo(() => {
    if (!wipoShares) return [];
    return [...new Set(wipoShares.map(d => d.sector))];
  }, [wipoShares]);

  // F: WIPO field growth top 10 for horizontal bar
  const wipoGrowthTop10 = useMemo(() => {
    if (!wipoGrowth) return [];
    return [...wipoGrowth].sort((a, b) => b.growth_pct - a.growth_pct).slice(0, 10);
  }, [wipoGrowth]);

  const fwdCitePivot = useMemo(() => pivotData(qualityCpc, 'avg_forward_citations'), [qualityCpc]);
  const { data: fwdCiteNormalized, yLabel: fwdCiteYLabel, controls: fwdCiteControls } = useCitationNormalization({
    data: fwdCitePivot,
    xKey: 'year',
    citationKeys: ['avg_forward_citations'],
    yLabel: 'Avg Forward Citations',
  });
  const originalityPivot = useMemo(() => pivotData(qualityCpc, 'avg_originality'), [qualityCpc]);
  const generalityPivot = useMemo(() => pivotData(qualityCpc, 'avg_generality'), [qualityCpc]);
  const scopePivot = useMemo(() => pivotData(qualityCpc, 'avg_scope'), [qualityCpc]);

  return (
    <div>
      <ChapterHeader
        number={3}
        title="Patent Fields"
        subtitle="Technology classes, field-level dynamics, and quality by technology area"
      />
      <MeasurementSidebar slug="system-patent-fields" />

      <KeyFindings>
        <li>Design patent share has fluctuated between 6% and 14% since the late 1970s, with peaks in 2008 and 2025, reflecting a structural shift toward design-driven product differentiation.</li>
        <li>CPC sections G (Physics) and H (Electricity) gained 30 percentage points of share over five decades, now constituting 57.3% of all patent grants.</li>
        <li>The fastest-growing digital technology classes expanded by over 1,000%, while declining classes contracted by nearly 84%, consistent with Schumpeterian creative destruction.</li>
        <li>Patent markets remain unconcentrated across all CPC sections, with HHI values well below the 1,500 threshold despite concentration in digital fields.</li>
        <li>Technology diversity declined from 0.848 in 1984 to 0.777 in 2009 before stabilizing at 0.789 by 2025.</li>
        <li>Electricity (H) and Physics (G) patents exhibit the shortest citation half-lives at 10.7 and 11.2 years, while Human Necessities (A) reaches 15.6 years.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          This chapter provides a comprehensive examination of patent fields: from the balance between design and utility patents, through the CPC section-level composition that reveals the digital transformation, to class-level dynamics showing which technology areas are growing or declining most rapidly. Market concentration remains low across all technology sectors even as digital fields dominate output. Technology diversity has contracted, S-curve analysis reveals fields at different lifecycle stages, and field-specific metrics such as citation half-lives and examination friction vary substantially across domains. Quality indicators including claim complexity and self-citation patterns round out the field-level picture.
        </p>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION A: DESIGN VS. UTILITY PATENTS
          ═══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="A — Design versus Utility Patents" />

      <Narrative>
        <p>
          The stacked area charts throughout this report reveal that design patents constitute the principal secondary category after utility patents. A closer examination of the balance between these two types illustrates how innovation strategies have shifted over the decades — from purely engineering-oriented approaches to <StatCallout value="design-driven innovation" />. Whereas utility patents protect functional inventions, <GlossaryTooltip term="design patent">design patents</GlossaryTooltip> protect ornamental appearance.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-design-trends"
        subtitle="Annual utility and design patent counts with design share on the right axis, tracking the shift toward design-driven innovation."
        title="Design Patent Share Has Fluctuated Between 6% and 14%, With Peaks in 2008 and 2025"
        caption="The figure displays annual counts of utility and design patents, with design patent share on the right axis. Design patents have exhibited higher growth rates than utility patents since the 2000s, driven by growth in consumer electronics, automotive design, and fashion-related filings."
        insight="The increasing share of design patents suggests a structural shift in innovation strategy toward design-driven product differentiation, reflecting broader economic trends in which aesthetic and user-experience considerations have become central to competitive advantage."
        loading={deL}
      >
        {designData?.trends ? (
          <PWLineChart
            data={designData.trends}
            xKey="year"
            lines={[
              { key: 'utility_count', name: 'Utility Patents', color: CHART_COLORS[0] },
              { key: 'design_count', name: 'Design Patents', color: CHART_COLORS[3] },
              { key: 'design_share', name: 'Design Share (%)', color: CHART_COLORS[4], yAxisId: 'right' },
            ]}
            yLabel="Number of Patents"
            rightYLabel="Design Share (%)"
            rightYFormatter={(v) => `${v.toFixed(1)}%`}
            brush
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Design patent share peaked at nearly 14% in 2008, declined to 7% by 2014, and returned to 14% by 2025. This pattern reflects a broader strategic turn toward design-driven product differentiation, particularly in consumer electronics, automotive design, and fashion-related industries.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION B: CLASS COMPOSITION
          ═══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="B — Class Composition" />

      <Narrative>
        <p>
          The composition of patent grants by technology class reflects the trajectory of technological change. Over five decades, the balance of inventive activity has shifted substantially from traditional industries such as chemistry and mechanical engineering toward <StatCallout value="electrical engineering and computing" />. This section surveys the landscape through ten complementary lenses: section-level share, class-level growth, market concentration, technology diversity, innovation velocity, examination friction, lifecycle maturity, field-specific metrics, citation lag, and citation half-lives.
        </p>
      </Narrative>

      {/* ── B.i: CPC Sections G and H ── */}

      <div className="my-2 flex items-center gap-2 max-w-[960px] mx-auto">
        <span className="text-sm text-muted-foreground">View:</span>
        <button
          onClick={() => setCpcStackedPercent(true)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${cpcStackedPercent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          Share (%)
        </button>
        <button
          onClick={() => setCpcStackedPercent(false)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!cpcStackedPercent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          Count
        </button>
      </div>

      <ChartContainer
        id="fig-patent-fields-cpc-sections"
        title="CPC Sections G and H Gained 30 Percentage Points of Share Over Five Decades"
        subtitle="Share of utility patents by CPC section, toggling between percentage share and absolute count views, 1976-2025"
        caption="Share of utility patents by CPC section (primary classification), 1976-2025. Sections: A=Human Necessities, B=Operations, C=Chemistry, D=Textiles, E=Construction, F=Mechanical, G=Physics, H=Electricity. The stacked area visualization reveals a sustained reallocation of patent activity toward digital technology sections."
        insight="Digital technology sections (G, H) gained 30 percentage points of share over five decades, while chemistry and operations contracted proportionally. This redistribution is consistent with the economy-wide shift toward information-intensive industries."
        loading={cpcL}
        height={650}
        interactive
        statusText={cpcStackedPercent ? 'Showing percentage share' : 'Showing patent counts'}
      >
        <PWAreaChart
          data={sectionPivotMerged}
          xKey="year"
          areas={[...mainSectionKeys.map((key) => ({
            key,
            name: `${key}: ${CPC_SECTION_NAMES[key]}`,
            color: CPC_SECTION_COLORS[key],
          })), { key: 'Other', name: 'Other (D, Y)', color: '#9ca3af' }]}
          stacked={!cpcStackedPercent}
          stackedPercent={cpcStackedPercent}
          yLabel={cpcStackedPercent ? 'Share (%)' : 'Number of Patents'}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The proportional view reveals relative shifts with greater clarity. Section H (Electricity) and G (Physics), which encompass computing, semiconductors, optics, and measurement, have grown from about 27% of patents in the 1970s to over 57% by the 2020s. By contrast, traditional sections such as C (Chemistry) and B (Operations) have experienced a proportional decline in share.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Sections G (Physics) and H (Electricity) have grown from about 27% of patents in the 1970s to over 57% by the 2020s. This structural shift reflects the economy-wide digital transformation: computing, semiconductors, and telecommunications technologies now pervade virtually every industry, from manufacturing to healthcare.
        </p>
      </KeyInsight>

      <CompetingExplanations
        finding="Why did Physics and Electricity dominate patent growth?"
        explanations={['The digital revolution created genuinely new invention opportunities in computing, telecommunications, and electronics.', 'Software patentability expanded after State Street Bank (1998), inflating patent counts in G/H sections.', 'Compositional shift: R&D investment shifted from chemicals and mechanical engineering toward IT.']}
      />

      {/* ── B.ii: Fastest-Growing Digital Technology Classes ── */}

      {changeData.length > 0 && (
        <ChartContainer
          id="fig-patent-fields-cpc-class-change"
          title="The Fastest-Growing Digital Technology Classes Grew by Over 1,000% While Declining Classes Contracted by Nearly 84%"
          subtitle="Percentage change in patent counts by CPC class, comparing 2000-2010 to 2015-2025, for classes with 100+ patents in each period"
          caption="Percent change in patent counts comparing 2000-2010 to 2015-2025, for CPC classes with at least 100 patents in each period. The fastest-growing classes are concentrated in digital technologies, while the most rapidly declining classes include both older digital standards and specialized semiconductor processes."
          insight="The pattern is consistent with Schumpeterian creative destruction: entire categories of analog-era invention have been rendered obsolete as digital replacements have expanded. The magnitude of these shifts indicates a fundamental reorientation of inventive activity."
          loading={chgL}
          height={900}
        >
          <PWBarChart
            data={changeData}
            xKey="label"
            bars={[{ key: 'pct_change', name: '% Change' }]}
            layout="vertical"
            yFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The growing classes are dominated by digital technologies (data processing, digital communication, image analysis), while declining classes include both superseded digital standards and specialized semiconductor processes. This pattern is consistent with the process of creative destruction associated with the digital transition: entire categories of invention have been rendered obsolete as their digital replacements have expanded.
        </p>
      </KeyInsight>

      {/* ── B.iii: HHI by Section ── */}

      <Narrative>
        <p>
          Given the increasing convergence of technology fields and the dominance of a few CPC sections, it is natural to ask whether certain technology areas are becoming dominated by a small number of large entities. The Herfindahl-Hirschman Index (HHI) measures market concentration by summing the squared market shares of all firms in a sector. On the standard DOJ/FTC scale, <StatCallout value="below 1,500" /> indicates an unconcentrated market, <StatCallout value="1,500-2,500" /> is moderately concentrated, and <StatCallout value="above 2,500" /> is highly concentrated.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-hhi-by-section"
        subtitle="Herfindahl-Hirschman Index (HHI) of patent assignee concentration within each CPC section, computed in 5-year periods."
        title="Patent Markets Remain Unconcentrated Across All CPC Sections, with HHI Values Well Below 1,500"
        caption="The figure displays the Herfindahl-Hirschman Index (HHI) for patent assignees within each CPC section, computed in 5-year periods. Higher values indicate greater concentration. All technology sectors remain well below the 1,500 threshold for moderate concentration."
        insight="Notwithstanding concerns about market power in technology, patent markets remain unconcentrated across all sectors. The broad base of innovators maintains concentration well below antitrust thresholds even in areas associated with large firms."
        loading={hhiL}
      >
        <PWLineChart
          data={hhiPivot}
          xKey="period"
          lines={hhiSections.map((section) => ({
            key: section,
            name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
            color: CPC_SECTION_COLORS[section],
          }))}
          yLabel="HHI"
          yFormatter={(v: number) => v.toLocaleString()}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent markets across all technology sectors remain unconcentrated, with HHI values well below the 1,500 threshold. Even in Electricity (H) and Physics (G) -- the sections most associated with large technology firms -- concentration remains low, though Textiles and Paper (D) has exhibited the highest concentration since 2010, consistent with its smaller inventor base and more specialized industrial structure.
        </p>
      </KeyInsight>

      {/* ── B.iv: Technology Diversity ── */}

      <ChartContainer
        id="fig-patent-fields-diversity-index"
        title="Technology Diversity Declined from 0.848 in 1984 to 0.777 in 2009 Before Stabilizing at 0.789 by 2025"
        subtitle="Technology diversity index (1 minus HHI of CPC section concentration), where higher values indicate more diverse patent output, 1976-2025"
        caption="1 minus the Herfindahl-Hirschman Index of CPC section concentration, 1976-2025. Higher values indicate more diverse technology output. The index declined substantially as digital technologies concentrated activity, then stabilized after 2009."
        insight="Technology diversity declined substantially from its 1984 peak through 2009 as digital technologies concentrated patent activity in sections G and H. The index then stabilized at a lower level, suggesting that while the concentration shift has halted, it has not reversed."
        loading={divL}
      >
        <PWLineChart
          data={diversity ?? []}
          xKey="year"
          lines={[{ key: 'diversity_index', name: 'Diversity Index', color: CHART_COLORS[0] }]}
          yLabel="Diversity Index"
          yFormatter={(v) => v.toFixed(2)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Technology diversity declined substantially from its 1984 peak through 2009 as digital technologies concentrated patent activity in sections G and H. Since then, diversity has stabilized at a lower level, indicating that while the concentration shift has not reversed, it has at least ceased accelerating.
        </p>
      </KeyInsight>

      {/* ── B.v: Innovation Velocity ── */}

      <Narrative>
        <p>
          Year-over-year growth rates reveal the cyclical nature of patenting activity. All sectors tend to co-move in response to macroeconomic conditions and patent policy changes, though electrical engineering has consistently exhibited stronger growth momentum since the 1990s.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-velocity"
        subtitle="Year-over-year percentage change in patent grants by WIPO technology sector, revealing synchronized cyclical patterns."
        title="Patenting Growth Rates Are Highly Correlated Across Five Sectors, with Synchronized Declines Following the Dot-Com Bust (2004-2005) and Financial Crisis (2007)"
        caption="The figure presents the annual percentage change in patent grants by WIPO technology sector. All sectors exhibit synchronized responses to macroeconomic conditions, though electrical engineering has demonstrated consistently stronger growth momentum since the 1990s."
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
          Innovation velocity is highly correlated across sectors, suggesting that macroeconomic conditions and patent policy are stronger determinants of patenting rates than sector-specific technology cycles. The synchronized declines during the early 2000s dot-com contraction and the 2008 financial crisis are particularly instructive.
        </p>
      </KeyInsight>

      {/* ── B.vi: Patent Examination Friction ── */}

      <Narrative>
        <p>
          Technologies do not proceed through the patent office at uniform speed. The &quot;friction map&quot; identifies which technology areas systematically exhibit longer examination durations, measured as the median time from filing to grant. These differences appear to reflect both the complexity of examination and the USPTO&apos;s resource allocation across technology centers.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-friction-map"
        subtitle="Median time from application filing to patent grant by CPC section and 5-year period, measuring technology-specific examination friction."
        title="Since the Mid-2000s, Chemistry (C) and Textiles & Paper (D) Patents Have Exhibited the Longest Examination Durations, with a Median of 1,278 Days in the 2010-2014 Period"
        caption="The figure presents the median time from application filing to patent grant, disaggregated by CPC section and 5-year period. Since the mid-2000s, Chemistry and Human Necessities patents have exhibited the longest pendency, with all technology areas peaking around 2010-2014 before declining following USPTO reforms."
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
          Examination duration increased substantially across all technology areas through the 2000s, peaking in the 2010-2014 period as the USPTO contended with a considerable backlog. The AIA reforms and USPTO hiring initiatives contributed to reduced pendency in subsequent years. Since the mid-2000s, Chemistry (C) patents have exhibited the longest examination durations, consistent with the complexity of chemical and biomedical examination.
        </p>
      </KeyInsight>

      {/* ── B.vii: S-Curve Lifecycle Maturity ── */}

      <Narrative>
        <p>
          The diversity decline raises a natural question: are certain technology domains approaching saturation while others continue to expand? Fitting logistic S-curves to cumulative patent counts by CPC section provides an estimate of where each field stands within its innovation lifecycle.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-scurve-maturity"
        title="Textiles Has Reached Over 97% of Estimated Carrying Capacity While Computing Sections Continue to Grow"
        subtitle="Percentage of estimated logistic carrying capacity reached by each CPC section, measuring technology lifecycle maturity, 1976-2025"
        caption="Percentage of estimated carrying capacity (K) reached by each CPC section, based on logistic S-curve fit to cumulative patent counts, 1976-2025. Higher values indicate greater technological maturity as measured by proximity to the estimated saturation point."
        insight="Textiles (D) has reached over 97% of estimated carrying capacity, while Fixed Constructions (E) is at nearly 60%, suggesting maturation. Physics (G) and Electricity (H), which encompass computing, AI, and semiconductors, appear to retain substantial growth potential."
        loading={scL}
        height={400}
      >
        <PWBarChart
          data={scurveData}
          xKey="section"
          bars={[{ key: 'current_pct_of_K', name: 'Maturity (% of K)', color: CHART_COLORS[1] }]}
          yLabel="Carrying Capacity (%)"
        />
      </ChartContainer>

      {scurves && (
        <div className="my-12 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 font-medium">Stage</th>
                <th className="py-2 pr-4 text-right font-medium">Cumulative</th>
                <th className="py-2 pr-4 text-right font-medium">Recent 5yr</th>
                <th className="py-2 text-right font-medium">% of K</th>
              </tr>
            </thead>
            <tbody>
              {scurves.map((d) => (
                <tr key={d.section} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">{d.section}: {d.section_name}</td>
                  <td className="py-2 pr-4">{d.lifecycle_stage}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{formatCompact(d.cumulative_total)}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{formatCompact(d.recent_5yr_volume)}</td>
                  <td className="py-2 text-right font-mono text-xs">{d.current_pct_of_K.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            Logistic S-curve parameters fitted to cumulative patent counts per CPC section (1976-2025). K = carrying capacity, lifecycle stage based on percentage of K reached.
          </figcaption>
        </div>
      )}

      <KeyInsight>
        <p>
          The S-curve analysis indicates a patent system in transition. Traditional engineering fields appear to be approaching saturation, while computing and electronics continue their rapid expansion. Cross-sectional class Y (which includes green technology and AI tags) is excluded from the S-curve analysis because its tagging conventions differ from primary CPC sections.
        </p>
      </KeyInsight>

      {/* ── B.viii: Field-Specific Metrics (Grant Lag by Sector from cross-field-convergence) ── */}

      <Narrative>
        <p>
          The structural overview, growth dynamics, and cross-field patterns examined thus far describe the broad contours of technological change. Knowledge obsolescence rates and examination pendency provide complementary field-specific metrics that characterize individual technology fields.
        </p>
      </Narrative>

      {/* ── B.ix: Citation Lag by Technology Area ── */}

      <ChartContainer
        id="fig-patent-fields-citation-lag-by-section"
        subtitle="Median citation lag in years by CPC technology section and decade, revealing technology-specific differences in knowledge accumulation speed."
        title="Physics and Electricity Show 11-Year Median Lag in the 2020s versus 17 Years for Chemistry"
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
          Citation lag has increased over time, consistent with the expanding body of relevant prior art that newer patents must reference. Technology areas such as Physics and Electricity tend to exhibit shorter citation lags, consistent with rapid innovation cycles in computing and electronics, whereas Chemistry and Human Necessities (including pharmaceuticals) demonstrate longer lags, consistent with the extended development timelines characteristic of those fields.
        </p>
      </KeyInsight>

      {/* ── B.x: Citation Half-Lives and Decay Curves ── */}

      {halfLife && halfLife.length > 0 && (
        <div className="max-w-2xl mx-auto my-8">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Citation Half-Life by Technology Area</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">CPC Section</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Half-Life (years)</th>
              </tr>
            </thead>
            <tbody>
              {[...halfLife].sort((a, b) => (a.half_life_years ?? 0) - (b.half_life_years ?? 0)).map((hl, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3">{hl.section}: {CPC_SECTION_NAMES[hl.section] ?? hl.section}</td>
                  <td className="text-right py-2 px-3 font-mono font-semibold">{hl.half_life_years?.toFixed(1) ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ChartContainer
        id="fig-patent-fields-citation-decay"
        title="Electricity (H) and Physics (G) Patents Exhibit the Shortest Citation Half-Lives at 10.7 and 11.2 Years"
        subtitle="Percentage of total forward citations received at each post-grant year, by CPC section, measuring knowledge obsolescence rates"
        caption="Distribution of forward citations by years after grant, by CPC section. Each line indicates the percentage of a technology area's total citations arriving in each post-grant year. Sections H (Electricity) and G (Physics) exhibit the steepest early peaks, while Chemistry (C) and Human Necessities (A) demonstrate more gradual accumulation."
        insight="Rapidly evolving fields such as computing (H) and physics (G) exhibit short citation half-lives, indicating that knowledge in these domains becomes superseded more quickly. Chemistry and pharmaceutical innovations, by contrast, maintain relevance over substantially longer periods."
        loading={dcL}
      >
        {decayPivot.length > 0 && (
          <PWLineChart
            data={decayPivot}
            xKey="years_after"
            lines={decaySections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            xLabel="Years After Grant"
            yLabel="% of Total Citations"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Electricity (H) and Physics (G) patents exhibit the shortest half-lives, consistent with the rapid innovation cycles in computing and electronics in which current advances are quickly superseded by subsequent developments. Human Necessities (A) and Fixed Constructions (E) show the longest half-lives, reflecting the enduring relevance of innovations in these domains.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION C: SUBCLASS COMPOSITION
          ═══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="C — Subclass Composition" />

      <Narrative>
        <p>
          While section-level analysis reveals the broad digital transformation, the within-section class structure shows where inventive activity concentrates. The treemap below displays patent volume by CPC technology class, sized by total grants and colored by CPC section, revealing the dominant subfields that drive output within each broader domain.
        </p>
      </Narrative>

      {/* ── C.i: CPC Treemap ── */}

      {treemap && treemap.length > 0 && (
        <ChartContainer
          id="fig-patent-fields-cpc-treemap"
          title="The Top 3 CPC Classes Account for 15-42% of Patents Across Sections, Revealing Concentrated Innovation"
          subtitle="Proportional treemap of patent volume by CPC technology class, sized by total grants and colored by CPC section"
          caption="Proportional breakdown of patents by CPC technology class. Each rectangle represents the volume of patents in that class, with colors corresponding to CPC sections. Digital communication and computing dominate section H (Electricity), while organic chemistry classes lead section C (Chemistry)."
          insight="Within each CPC section, patent activity is concentrated in a small number of dominant classes. This concentration pattern suggests that a limited set of technology subfields drives the majority of inventive output within each broader domain."
          loading={tmL}
          height={850}
        >
          <PWTreemap data={treemap} />
        </ChartContainer>
      )}

      {/* ── C.ii: Concentration narrative ── */}

      <KeyInsight>
        <p>
          The treemap demonstrates that within each CPC section, patent activity is concentrated in a small number of dominant classes. In Electricity (H), digital communication and computing classes account for the largest share, while in Chemistry (C), organic chemistry classes constitute the leading subfields. Across all sections, the top 3 CPC classes account for 15-42% of patents, indicating that a limited set of technology subfields drives the majority of inventive output.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION D: QUALITY BY TECHNOLOGY FIELD
          ═══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="D — Quality by Technology Field" />

      <Narrative>
        <p>
          The characteristics of patents -- their claim complexity, quality indicators, and self-citation patterns -- vary systematically across technology fields. These differences reflect both the underlying nature of innovation in each domain and the evolving strategies that patent applicants employ across fields. This section examines claim counts by <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> section and <GlossaryTooltip term="WIPO">WIPO</GlossaryTooltip> technology sector, and self-citation patterns that reveal how firms accumulate knowledge within specific technology areas.
        </p>
      </Narrative>

      {/* ── D.i: Claims by Technology Area ── */}

      <Narrative>
        <p>
          The number of claims in a patent defines the scope of legal protection. Trends in claim counts by technology area reveal how patent strategy has evolved across fields, with increases across all technology areas reflecting a broad trend toward more detailed patent drafting regardless of domain.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-claims-by-section"
        subtitle="Median claim count by CPC technology section and decade, showing increases in patent drafting complexity across fields."
        title="Claim Counts Have Increased Across All Technology Areas, with Physics (G) Leading at a Median of 19 and Electricity (H) at 18 in the 2020s"
        caption="The figure displays the median claim count by CPC section and decade. Claim counts have increased across all technology areas, with the range widening from 1 to 4 across decades, reflecting diverging patent drafting complexity across fields."
        loading={claimL}
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

      <ChartContainer
        id="fig-patent-fields-quality-by-sector"
        subtitle="Average number of claims per patent by WIPO technology sector, computed in 5-year periods to illustrate cross-sector trends."
        title="Instruments Patents Peaked at 19.8 Average Claims (2001-2005) While Mechanical Engineering Rose from 9.3 to 14.9, Reflecting Broad Increases Across Sectors"
        caption="The figure displays the average claims per patent by WIPO sector over 5-year periods. Electrical engineering and instruments patents tend to have the most claims in recent decades. Claim counts have increased across all sectors, though the range has widened over time."
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
          Patent complexity, as measured by claim counts, varies considerably across technology sectors. Electrical engineering and instruments patents tend to have the most claims in recent decades, reflecting the detailed and layered claim structures characteristic of software and electronics inventions. The increase in claim counts across all sectors reflects a broad trend toward more complex patent drafting strategies, though the range across sectors has widened rather than narrowed.
        </p>
      </KeyInsight>

      {/* ── D.ii through D.iv: Quality Metrics by CPC Section ── */}

      <Narrative>
        <p>
          Beyond claim counts, patent quality can be assessed through citation impact, originality, generality, and scope. Forward citations measure the influence a patent exerts on subsequent inventions. <GlossaryTooltip term="originality">Originality</GlossaryTooltip> captures how broadly a patent draws on prior art from diverse technology classes, while <GlossaryTooltip term="generality">generality</GlossaryTooltip> measures how broadly a patent is cited across different classes. Scope, measured by the number of distinct CPC subclasses assigned to a patent, indicates the breadth of technological coverage. Together, these metrics reveal systematic differences in innovation character across technology domains.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-fwd-citations-by-cpc"
        title="Human Necessities (A) and Fixed Constructions (E) Patents Attracted the Highest Forward Citations in Early Decades, Converging Across Sections by the 2020s"
        subtitle="Average forward citations per patent by CPC section, 1976-2025, showing how citation impact has evolved and converged across technology domains."
        caption="Average number of forward citations received per patent, disaggregated by CPC section and year. Early decades show large inter-section variation, with Human Necessities (A) and Fixed Constructions (E) leading. By the 2020s, citation counts converge substantially as the patent corpus expands and citation practices mature."
        insight="The convergence in forward citations across technology sections is consistent with the densification of citation networks and the maturation of the patent system. Early-era patents in smaller fields attracted disproportionate citations relative to later cohorts."
        loading={qcL}
        controls={fwdCiteControls}
      >
        <PWLineChart
          data={fwdCiteNormalized ?? []}
          xKey="year"
          lines={cpcQualityLines}
          yLabel={fwdCiteYLabel}
          yFormatter={(v: number) => v.toFixed(1)}
          truncationYear={2018}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-patent-fields-originality-by-cpc"
        title="Patent Originality Rose Steeply from Near-Zero in the 1970s to 0.45-0.55 Across All Sections by the 2020s"
        subtitle="Average originality index by CPC section, 1976-2025, measuring the diversity of technology classes cited in backward references."
        caption="Average originality index per patent by CPC section and year. Originality measures the Herfindahl-based diversity of CPC classes in a patent's backward citations. The near-universal rise from zero in the 1970s to 0.45-0.55 by the 2020s reflects increasingly cross-disciplinary inventive activity."
        insight="The broad increase in originality across all sections indicates that modern patents draw on prior art from a wider range of technology classes, consistent with increasing technological convergence and interdisciplinary research."
        loading={qcL}
      >
        <PWLineChart
          data={originalityPivot}
          xKey="year"
          lines={cpcQualityLines}
          yLabel="Avg Originality"
          yFormatter={(v: number) => v.toFixed(2)}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-patent-fields-generality-by-cpc"
        title="Generality Has Remained Stable at 0.25-0.45, with Operations (B) and Fixed Constructions (E) Consistently the Most General"
        subtitle="Average generality index by CPC section, 1976-2025, measuring how broadly each section's patents are cited across technology classes."
        caption="Average generality index per patent by CPC section and year. Generality measures the Herfindahl-based diversity of CPC classes in a patent's forward citations. Unlike originality, generality has remained relatively stable over time, indicating that the breadth of a patent's downstream impact is more intrinsic to its technology domain."
        insight="The stability of generality over time suggests that certain technology areas -- particularly Operations (B) and Fixed Constructions (E) -- produce innovations with inherently broader applicability across fields, a pattern that has persisted for five decades."
        loading={qcL}
      >
        <PWLineChart
          data={generalityPivot}
          xKey="year"
          lines={cpcQualityLines}
          yLabel="Avg Generality"
          yFormatter={(v: number) => v.toFixed(2)}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-patent-fields-scope-by-cpc"
        title="Patent Scope Expanded from 1.5-2.0 Subclasses in the 1970s to 2.5-3.5 by the 2020s, Led by Mechanical Engineering (F)"
        subtitle="Average scope (number of distinct CPC subclasses) per patent by CPC section, 1976-2025, measuring the breadth of technological coverage."
        caption="Average number of distinct CPC subclasses assigned to each patent, by CPC section and year. Scope captures the breadth of a patent's technological coverage. The steady increase across all sections reflects more detailed classification practices and the growing complexity of modern inventions."
        insight="The expansion of patent scope across all sections is consistent with both the increasing technical complexity of inventions and the USPTO's more granular classification scheme. Mechanical Engineering (F) and Operations (B) patents tend to span the most subclasses, reflecting their inherently cross-cutting nature."
        loading={qcL}
      >
        <PWLineChart
          data={scopePivot}
          xKey="year"
          lines={cpcQualityLines}
          yLabel="Avg Scope (Subclasses)"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Quality metrics reveal that patent innovation has become increasingly cross-disciplinary. Originality indices rose from near zero in the 1970s to 0.45-0.55 across all technology domains, indicating that modern patents draw from a substantially broader base of prior art. Forward citation counts, which initially varied widely across sections, have converged as the patent corpus has expanded. Meanwhile, generality has remained relatively stable, suggesting that the breadth of downstream impact is intrinsic to each technology domain rather than a product of system-wide trends.
        </p>
      </KeyInsight>

      {/* ── D.v: Self-Citation by Technology Area ── */}

      <Narrative>
        <p>
          Self-citation patterns reveal meaningful differences in how sectors accumulate knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s previous work.
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
          Self-citation patterns reveal meaningful differences in how firms and sectors accumulate knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s previous work. However, these rates may also signal strategic behavior, as firms cite their own patents to construct defensive thickets that may raise barriers to entry for competitors.
        </p>
      </KeyInsight>

      {/* Quality by CPC section charts (D.ii-D.iv) are rendered above the self-citation table */}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION E: CPC RECLASSIFICATION (Analysis 9)
          ═══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="E — CPC Reclassification" />

      <Narrative>
        <p>
          Classification systems are not static. The USPTO periodically reclassifies patents into different CPC sections as taxonomy evolves. Examining the rate and direction of reclassification provides insight into how the CPC system adapts to shifting technological boundaries and whether reclassification patterns align with the convergence trends identified in earlier sections.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-reclass-rate"
        title="4% of Patents Granted in the 2010s Were Later Reclassified to a Different CPC Section"
        subtitle="CPC reclassification rate by decade, measuring the share of patents whose primary CPC section changed between issue and current classification"
        caption="Reclassification data only available for patents with both cpc_at_issue and current CPC records (2010s-2020s). The reclassification rate is computed as the share of patents whose primary CPC section at issue differs from the current primary CPC section."
        insight="The stability of the reclassification rate at 4% across both decades suggests that taxonomy evolution proceeds at a constant pace, even as the technological landscape undergoes rapid structural change."
        loading={rcDecL}
      >
        {reclassByDecade && reclassByDecade.length > 0 ? (
          <PWBarChart
            data={reclassByDecade.map(d => ({ decade: `${d.decade}s`, reclass_rate_pct: d.reclass_rate_pct }))}
            xKey="decade"
            bars={[{ key: 'reclass_rate_pct', name: 'Reclassification Rate (%)', color: CHART_COLORS[0] }]}
            yLabel="Reclassification Rate (%)"
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-patent-fields-reclass-flows"
        title="The Largest Reclassification Flow Is from Section H (Electricity) to G (Physics), with 42,790 Patents Reclassified"
        subtitle="CPC section-to-section reclassification flows, showing the number of patents reclassified from one primary section to another"
        caption="Heatmap of reclassification flows between CPC sections. Each cell represents the number of patents whose primary CPC section changed from the row section to the column section. The dominant H-to-G flow is consistent with the evolving boundary between electronics and computing-related physics."
        insight="The dominant H-to-G flow reflects the ongoing renegotiation of the boundary between electronics (H) and computing/physics (G), consistent with the convergence of these fields documented in earlier sections."
        loading={rcFlL}
        height={550}
      >
        {reclassFlowData.length > 0 ? (
          <PWValueHeatmap
            data={reclassFlowData}
            rowKey="from_section"
            colKey="to_section"
            valueKey="count"
            rowLabel="From Section"
            colLabel="To Section"
            valueFormatter={(v) => formatCompact(v)}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The reclassification flow matrix reveals that the largest movement of patents is from Section H (Electricity) to Section G (Physics), with over 42,000 patents reclassified. The pattern is consistent with the well-documented convergence of electronics and computing-related physics. The reverse flow (G to H) accounts for 14,115 patents, and other significant flows include C to A (Chemistry to Human Necessities, 7,902 patents), reflecting the growth of pharmaceutical and biomedical applications of chemistry.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION F: WIPO TECHNOLOGY SECTORS (Analysis 10)
          ═══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="F — WIPO Technology Sectors" />

      <Narrative>
        <p>
          While CPC sections provide one lens for examining technology composition, the <GlossaryTooltip term="WIPO">WIPO</GlossaryTooltip> technology classification offers an alternative taxonomy organized around five broad sectors: Chemistry, Electrical engineering, Instruments, Mechanical engineering, and Other fields. Tracking the evolution of these sector shares and identifying the fastest-growing WIPO fields provides a complementary perspective on the structural transformation of patent activity.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-fields-wipo-sector-shares"
        title="Electrical Engineering Grew from 14% to 41% of Patent Grants, Surpassing All Other WIPO Sectors by the Late 1990s"
        subtitle="Stacked area chart of patent counts by WIPO technology sector, 1976-2025, showing the structural shift toward electrical engineering"
        caption="Annual patent counts by WIPO technology sector. Electrical engineering, which encompasses computing, telecommunications, and semiconductors, has grown from a minority share in the 1970s to the dominant sector by the late 1990s, consistent with the CPC-level trends documented in Section B."
        insight="The WIPO sector view confirms the structural transformation visible in the CPC data: electrical engineering now accounts for the largest share of patent output, reflecting the economy-wide digital transition."
        loading={wsL}
        height={550}
      >
        {wipoSharesPivot.length > 0 ? (
          <PWAreaChart
            data={wipoSharesPivot}
            xKey="year"
            areas={wipoSectorNames.map((name, i) => ({
              key: name,
              name,
              color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[i % CHART_COLORS.length],
            }))}
            stacked
            yLabel="Number of Patents"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-patent-fields-wipo-field-growth"
        title="IT Methods for Management Grew by 5,675% While Computer Technology and Digital Communication Each Exceeded 1,600%"
        subtitle="Top 10 fastest-growing WIPO technology fields by percentage growth, comparing 1976-1995 to 2006-2025 patent counts"
        caption="Percentage growth in patent counts by WIPO technology field, comparing the early period (1976-1995) to the late period (2006-2025). The fastest-growing fields are concentrated in digital and computing-related technologies, consistent with the structural shift documented throughout this chapter."
        insight="The fastest-growing fields are overwhelmingly digital: IT methods for management, computer technology, and digital communication lead by wide margins. This concentration of growth in a small number of fields explains the declining technology diversity documented in Section B."
        loading={wgL}
        height={550}
      >
        {wipoGrowthTop10.length > 0 ? (
          <PWBarChart
            data={wipoGrowthTop10}
            xKey="field"
            bars={[{ key: 'growth_pct', name: 'Growth (%)', color: CHART_COLORS[2] }]}
            layout="vertical"
            yLabel="Growth (%)"
            yFormatter={(v) => `${v.toLocaleString()}%`}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The WIPO field-level growth data confirm that the digital transformation is concentrated in a small number of technology fields. IT methods for management, which barely existed in the early period with only 1,347 patents, grew by 5,675% to nearly 78,000 patents in the later period. Computer technology and digital communication each exceeded 1,600% growth. By contrast, traditional fields such as macromolecular chemistry and textile machines grew by under 40%, consistent with the technology diversity decline and S-curve maturation patterns documented in earlier sections.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════════
          CHAPTER CLOSING
          ═══════════════════════════════════════════════════════════════════════ */}

      <Narrative>
        This chapter has provided a comprehensive examination of patent fields: from the balance between design and utility patents, through the CPC section-level composition revealing the digital transformation, to class-level dynamics showing creative destruction across technology areas. Market concentration remains low, technology diversity has stabilized after contraction, and field-specific metrics reveal substantially different innovation dynamics across domains. Having mapped the field-level structure, the <Link href="/chapters/system-convergence" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">next chapter</Link> examines how technology fields increasingly converge, with patents spanning multiple CPC sections and the boundaries between domains becoming more permeable over time.
      </Narrative>

      <InsightRecap
        learned={[
          "CPC sections G (Physics) and H (Electricity) gained 30 percentage points of share, rising from 27% to 57% of all grants.",
          "Patent markets remain unconcentrated across CPC sections, with no single section exceeding 35% share.",
        ]}
        falsifiable="If the G/H shift reflects genuine invention rather than expanded software patentability, then the trend should survive controlling for the State Street Bank (1998) and Alice (2014) decisions."
        nextAnalysis={{
          label: "Convergence",
          description: "How technology domains that were once separate have become intertwined",
          href: "/chapters/system-convergence",
        }}
      />

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent and WIPO technology fields mapped from IPC codes. Growth rates compare patent counts in 2000-2010 to 2015-2025 for CPC classes with at least 100 patents in each period. The diversity index is computed as 1 minus the Herfindahl-Hirschman Index of CPC section concentration. S-curve parameters are fitted using logistic regression on cumulative patent counts per CPC section (1976-2025). Market concentration (HHI) is computed within each CPC section by assignee market share in 5-year windows. Citation lag uses median lag in years between cited and citing patent grant dates. Technology half-life is computed as the time until 50% of cumulative forward citations are received. Self-citation rates are computed as the fraction of backward citations directed to patents held by the same assignee.
      </DataNote>

      <RelatedChapters currentChapter={3} />
      <ChapterNavigation currentChapter={3} />
    </div>
  );
}
