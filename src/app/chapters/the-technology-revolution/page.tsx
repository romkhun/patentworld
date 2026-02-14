'use client';

import { useMemo, useState } from 'react';
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
import { PWTreemap } from '@/components/charts/PWTreemap';
import { PWConvergenceMatrix } from '@/components/charts/PWConvergenceMatrix';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import type { SectorPerYear, CPCSectionPerYear, CPCClassChange, TechDiversity, CPCTreemapEntry, TechnologyHalfLife, TechnologyDecayCurve, TechnologySCurve, HHIBySection, ConvergenceEntry, GrantLagBySector } from '@/lib/types';

function pivotBySector(data: SectorPerYear[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.sector] = d.count; });
    return row;
  });
}

function pivotBySection(data: CPCSectionPerYear[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.section] = d.count; });
    return row;
  });
}

function pivotGrantLag(data: GrantLagBySector[]) {
  const periods = [...new Set(data.map((d) => d.period))].sort();
  return periods.map((period) => {
    const row: any = { period: `${period}s` };
    data.filter((d) => d.period === period).forEach((d) => {
      row[d.sector] = d.avg_lag_days;
    });
    return row;
  });
}

export default function Chapter2() {
  const { data: sectors, loading: secL } = useChapterData<SectorPerYear[]>('chapter2/wipo_sectors_per_year.json');
  const { data: cpcSections, loading: cpcL } = useChapterData<CPCSectionPerYear[]>('chapter2/cpc_sections_per_year.json');
  const { data: cpcChange, loading: chgL } = useChapterData<(CPCClassChange & { direction: string })[]>('chapter2/cpc_class_change.json');
  const { data: diversity, loading: divL } = useChapterData<TechDiversity[]>('chapter2/tech_diversity.json');
  const { data: treemap, loading: tmL } = useChapterData<CPCTreemapEntry[]>('chapter2/cpc_treemap.json');
  const { data: halfLife } = useChapterData<TechnologyHalfLife[]>('chapter2/technology_halflife.json');
  const { data: decayCurves, loading: dcL } = useChapterData<TechnologyDecayCurve[]>('chapter2/technology_decay_curves.json');
  const { data: scurves, loading: scL } = useChapterData<TechnologySCurve[]>('chapter2/technology_scurves.json');
  const { data: hhiData, loading: hhiL } = useChapterData<HHIBySection[]>('chapter10/hhi_by_section.json');
  const { data: convergenceData, loading: conL } = useChapterData<ConvergenceEntry[]>('chapter10/convergence_matrix.json');
  const { data: grantLag, loading: glL } = useChapterData<GrantLagBySector[]>('chapter7/grant_lag_by_sector.json');

  const [cpcStackedPercent, setCpcStackedPercent] = useState(true);

  const sectorPivot = useMemo(() => sectors ? pivotBySector(sectors) : [], [sectors]);
  const sectionPivot = useMemo(() => cpcSections ? pivotBySection(cpcSections) : [], [cpcSections]);

  const sectorNames = useMemo(() => {
    if (!sectors) return [];
    return [...new Set(sectors.map((d) => d.sector))];
  }, [sectors]);

  // CPC sections: merge D (Textiles) into "Other" for 7-category limit
  const mainSectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y' && k !== 'D');
  const sectionPivotMerged = useMemo(() => sectionPivot.map((row: any) => {
    const merged = { ...row, Other: (row['D'] ?? 0) + (row['Y'] ?? 0) };
    return merged;
  }), [sectionPivot]);

  const changeData = useMemo(() => {
    if (!cpcChange) return [];
    const fmtLabel = (d: CPCClassChange & { direction: string }) => {
      const title = (d.title ?? d.class_name ?? '').slice(0, 42);
      return `${d.cpc_class} \u2013 ${title}`;
    };
    const growing = cpcChange
      .filter((d) => d.direction === 'growing')
      .sort((a, b) => b.pct_change - a.pct_change)
      .map((d) => ({
        label: fmtLabel(d),
        pct_change: d.pct_change,
      }));
    const declining = cpcChange
      .filter((d) => d.direction === 'declining')
      .sort((a, b) => a.pct_change - b.pct_change)
      .map((d) => ({
        label: fmtLabel(d),
        pct_change: d.pct_change,
      }));
    return [...growing, ...declining.reverse()];
  }, [cpcChange]);

  const { decayPivot, decaySections } = useMemo(() => {
    if (!decayCurves) return { decayPivot: [], decaySections: [] };
    const sections = [...new Set(decayCurves.map(d => d.section))].sort();
    const years = [...new Set(decayCurves.map(d => d.years_after))].sort((a, b) => a - b);
    const pivoted = years.map(yr => {
      const row: Record<string, any> = { years_after: yr };
      decayCurves.filter(d => d.years_after === yr).forEach(d => {
        row[d.section] = d.pct_of_total;
      });
      return row;
    });
    return { decayPivot: pivoted, decaySections: sections };
  }, [decayCurves]);

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

  // Pivot HHI data: one line per CPC section over time
  const hhiPivot = useMemo(() => {
    if (!hhiData) return [];
    const periods = [...new Set(hhiData.map((d) => d.period))].sort();
    return periods.map((period) => {
      const row: Record<string, any> = { period };
      hhiData.filter((d) => d.period === period).forEach((d) => {
        row[d.section] = d.hhi;
      });
      return row;
    });
  }, [hhiData]);

  const hhiSections = useMemo(() => {
    if (!hhiData) return [];
    return [...new Set(hhiData.filter((d) => d.section !== 'Overall').map((d) => d.section))].sort();
  }, [hhiData]);

  const convergenceEras = useMemo(() => {
    if (!convergenceData) return [];
    return [...new Set(convergenceData.map((d) => d.era))].sort();
  }, [convergenceData]);

  const lagPivot = useMemo(() => grantLag ? pivotGrantLag(grantLag) : [], [grantLag]);
  const grantLagSectorNames = useMemo(() => {
    if (!grantLag) return [];
    return [...new Set(grantLag.map((d) => d.sector))];
  }, [grantLag]);

  return (
    <div>
      <ChapterHeader
        number={2}
        title="The Technology Revolution"
        subtitle="Structural shifts in the composition of patented technology, 1976-2025"
      />

      <KeyFindings>
        <li>Electrical engineering rose from the third-largest sector to surpass first chemistry (1994) and then mechanical engineering (1995), becoming the dominant patent sector and marking the transition to the digital era.</li>
        <li><GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections G (Physics) and H (Electricity) now constitute over 57% of all patent grants, an increase from about 27% in the 1970s.</li>
        <li>The fastest-growing technology classes are concentrated in digital technologies (data processing, digital communication), with growth rates exceeding 1,000%, while the most rapidly declining classes have contracted by nearly 84%.</li>
        <li>Technology diversity declined substantially from its 1984 peak through 2009 as digital technologies concentrated activity, then stabilized at a lower level.</li>
        <li>The G-H (Physics-Electricity) convergence pair rose from 12.5% to 37.5% of all cross-section patents between 1976-1995 and 2011-2025, reflecting intensifying cross-field integration.</li>
        <li>Despite concentration in digital fields, patent markets remain unconcentrated across all CPC sections, with HHI values well below the 1,500 threshold.</li>
        <li>Citation half-lives vary by nearly five years across technology fields, with Electricity (H) at 10.7 years and Human Necessities (A) at 15.6 years, revealing substantially different rates of knowledge obsolescence.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The fivefold expansion in patent output documented in <Link href="/chapters/the-innovation-landscape" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Innovation Landscape</Link> masks a fundamental realignment in the composition of US patenting. A pair of mid-1990s crossover events, in which electrical engineering overtook both chemistry and mechanical engineering in annual grant volume, signaled the transition from the mechanical-chemical era to the digital era. The consequences of this transition have been far-reaching: technology classes centered on data processing and digital communication have expanded by orders of magnitude, while analog-era categories have contracted sharply, a pattern consistent with Schumpeterian creative destruction operating at a rapid pace. The resulting concentration of inventive activity in computing-related fields has measurably reduced the diversity of the patent portfolio. At the same time, traditional technology boundaries have become increasingly permeable, with the Physics-Electricity convergence pair now accounting for over a third of all cross-section patents. Yet patent markets remain unconcentrated across all technology sectors, and field-specific metrics such as citation half-lives and grant lags reveal markedly different innovation dynamics across domains. These structural shifts also shape the organizational landscape examined in <Link href="/chapters/firm-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>.
        </p>
      </aside>

      {/* ── Section 1: Overview of Technology Fields ── */}

      <Narrative>
        <p>
          The composition of patent grants reflects the trajectory of technological change. Over five
          decades, the balance of inventive activity has shifted substantially from traditional
          industries such as chemistry and mechanical engineering toward{' '}
          <StatCallout value="electrical engineering and computing" />.
          This section surveys the landscape at two complementary levels of granularity: the five WIPO
          technology sectors and the eight primary CPC classification sections.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-technology-revolution-wipo-sectors"
        title="Electrical Engineering Grew Nearly 15-Fold from 10,404 Patents in 1976 to 150,702 in 2024"
        subtitle="Annual patent grants by WIPO technology sector, showing the structural crossover from chemistry and mechanical engineering to electrical engineering, 1976–2025"
        caption="Patent grants by WIPO sector (primary classification), 1976-2025. The data reveal a structural crossover around the mid-1990s, with electrical engineering overtaking first chemistry (1994) and then mechanical engineering (1995) to become the leading sector."
        insight="The mid-1990s crossover in which electrical engineering surpassed first chemistry and then mechanical engineering constitutes one of the most significant structural shifts in the history of patenting, driven by advances in computing and telecommunications."
        loading={secL}
      >
        <PWLineChart
          data={sectorPivot}
          xKey="year"
          lines={sectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Number of Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Electrical engineering exhibits rapid growth, driven by advances in computing,
          telecommunications, and semiconductor technologies. Chemistry, once the second-largest
          sector, has grown at a comparatively slower rate. Mechanical engineering and instruments have
          maintained steady contributions throughout the period.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Electrical engineering rose to surpass first chemistry (1994) and then mechanical engineering (1995),
          becoming the dominant patent sector. This crossover marks the transition from the mechanical-chemical
          era of innovation to the digital era, representing one of the most consequential structural shifts in
          the history of patenting.
        </p>
      </KeyInsight>

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
        id="fig-technology-revolution-cpc-sections"
        title="CPC Sections G and H Gained Roughly 30 Percentage Points of Share Over Five Decades"
        subtitle="Share of utility patents by CPC section, toggling between percentage share and absolute count views, 1976–2025"
        caption="Share of utility patents by CPC section (primary classification), 1976-2025. Sections: A=Human Necessities, B=Operations, C=Chemistry, D=Textiles, E=Construction, F=Mechanical, G=Physics, H=Electricity. The stacked area visualization reveals a sustained reallocation of patent activity toward digital technology sections."
        insight="Digital technology sections (G, H) gained roughly 30 percentage points of share over five decades, while chemistry and operations contracted proportionally. This redistribution is consistent with the economy-wide shift toward information-intensive industries."
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
          The proportional view reveals relative shifts with greater clarity. Section H
          (Electricity) and G (Physics), which encompass computing, semiconductors, optics,
          and measurement, have grown from about 27% of patents in the 1970s to over
          57% by the 2020s. By contrast, traditional sections such as C (Chemistry) and B (Operations)
          have experienced a proportional decline in share.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Sections G (Physics) and H (Electricity) have grown from about 27% of patents in the
          1970s to over 57% by the 2020s. This structural shift reflects the economy-wide digital
          transformation: computing, semiconductors, and telecommunications technologies now
          pervade virtually every industry, from manufacturing to healthcare.
        </p>
      </KeyInsight>

      {treemap && treemap.length > 0 && (
        <ChartContainer
          id="fig-technology-revolution-cpc-treemap"
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

      <KeyInsight>
        <p>
          The treemap demonstrates that within each CPC section, patent activity is concentrated
          in a small number of dominant classes. In Electricity (H), digital communication and computing
          classes account for the largest share, while in Chemistry (C), organic chemistry
          classes constitute the leading subfields.
        </p>
      </KeyInsight>

      {/* ── Section 2: Trends by Field ── */}

      <SectionDivider label="Structural Change and Growth Dynamics" />

      <Narrative>
        <p>
          The overview of technology fields reveals a system transformed by the digital transition. This
          section examines the dynamics of that transformation in greater detail: which specific technology
          classes have grown or declined most substantially, how overall diversity has responded to the
          concentration of activity in digital fields, and where each technology domain stands within its
          innovation lifecycle.
        </p>
      </Narrative>

      {changeData.length > 0 && (
        <ChartContainer
          id="fig-technology-revolution-cpc-class-change"
          title="The Fastest-Growing Digital Technology Classes Grew by Over 1,000% While Declining Classes Contracted by Nearly 84%"
          subtitle="Percentage change in patent counts by CPC class, comparing 2000–2010 to 2015–2025, for classes with 100+ patents in each period"
          caption="Percent change in patent counts comparing 2000-2010 to 2015-2025, for CPC classes with at least 100 patents in each period. The fastest-growing classes are concentrated in digital technologies, while the most rapidly declining classes include both older digital standards and specialized semiconductor processes."
          insight="This pattern is consistent with Schumpeterian creative destruction: entire categories of analog-era invention have been rendered obsolete as digital replacements have expanded. The magnitude of these shifts indicates a fundamental reorientation of inventive activity."
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

      <Narrative>
        <p>
          The magnitude of these structural shifts is substantial. The fastest-growing classes
          exhibit increases exceeding 1,000%, while declining classes have contracted
          by nearly 84%. These figures do not represent marginal adjustments; rather, they indicate
          a fundamental reorientation of inventive activity across technology domains.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The growing classes are dominated by digital technologies (data processing, digital
          communication, image analysis), while declining classes include both superseded digital standards and specialized semiconductor
          processes. This pattern
          is consistent with the process of creative destruction associated with the digital transition:
          entire categories of invention have been rendered obsolete as their digital replacements
          have expanded.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-technology-revolution-diversity-index"
        title="Technology Diversity Declined from 0.848 in 1984 to 0.777 in 2009 Before Stabilizing at 0.789 by 2025"
        subtitle="Technology diversity index (1 minus HHI of CPC section concentration), where higher values indicate more diverse patent output, 1976–2025"
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
          Technology diversity declined substantially from its 1984 peak through 2009 as digital technologies concentrated
          patent activity in sections G and H. Since then, diversity has stabilized at a lower level, indicating
          that while the concentration shift has not reversed, it has at least ceased accelerating.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The diversity decline raises a natural question: are certain technology domains approaching
          saturation while others continue to expand? Fitting logistic S-curves to cumulative patent counts
          by CPC section provides an estimate of where each field stands within its innovation lifecycle.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-technology-revolution-scurve-maturity"
        title="Textiles Has Reached Over 97% of Estimated Carrying Capacity While Computing Sections Continue to Grow"
        subtitle="Percentage of estimated logistic carrying capacity reached by each CPC section, measuring technology lifecycle maturity, 1976–2025"
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
            Logistic S-curve parameters fitted to cumulative patent counts per CPC section (1976–2025). K = carrying capacity, lifecycle stage based on percentage of K reached.
          </figcaption>
        </div>
      )}

      <KeyInsight>
        <p>
          The S-curve analysis indicates a patent system in transition. Traditional engineering
          fields appear to be approaching saturation, while computing and electronics continue their
          rapid expansion. It should be noted that cross-sectional class Y (which includes green technology and AI tags)
          is excluded from the S-curve analysis because its tagging conventions differ from primary CPC sections.
        </p>
      </KeyInsight>

      {/* ── Section 3: Cross-Field Dynamics ── */}

      <SectionDivider label="Cross-Field Dynamics" />

      <Narrative>
        <p>
          The preceding analysis examined each technology field in relative isolation. Yet the boundaries
          between fields are not fixed: as digital technology has become pervasive, inventions increasingly
          span multiple CPC sections, and the question of whether any single field has become dominated by
          a small number of actors takes on greater significance. This section examines these cross-field
          dynamics through two complementary lenses: technology convergence and market concentration.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-technology-revolution-convergence-matrix"
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

      <KeyInsight>
        <p>
          The G-H (Physics-Electricity) pair has dominated convergence from the late 1990s onward, reflecting
          the deep integration of computing, electronics, and physics. In the earliest era (1976-1995), B-C (Operations-Chemistry) and A-C (Human Necessities-Chemistry) pairs led convergence, but the pattern shifted
          substantially: in 2011-2025, G-H convergence has intensified as digital technology permeates
          an increasing number of domains. The growing overlap between A (Human Necessities) and G (Physics)
          in the 2011-2025 period is consistent with the rise of health technology and biomedical electronics.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Given the increasing convergence of technology fields and the dominance of a few CPC sections,
          it is natural to ask whether certain technology areas are becoming dominated by a small number
          of large entities. The Herfindahl-Hirschman Index (HHI) measures market concentration by summing
          the squared market shares of all firms in a sector. On the standard DOJ/FTC scale,{' '}
          <StatCallout value="below 1,500" /> indicates an unconcentrated market,{' '}
          <StatCallout value="1,500-2,500" /> is moderately concentrated, and{' '}
          <StatCallout value="above 2,500" /> is highly concentrated.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-technology-revolution-hhi-by-section"
        subtitle="Herfindahl-Hirschman Index (HHI) of patent assignee concentration within each CPC section, computed in 5-year periods."
        title="Patent Markets Remain Unconcentrated Across All CPC Sections, with HHI Values Well Below the 1,500 Threshold"
        caption="This chart displays the Herfindahl-Hirschman Index (HHI) for patent assignees within each CPC section, computed in 5-year periods. Higher values indicate greater concentration. All technology sectors remain well below the 1,500 threshold for moderate concentration, with Textiles and Paper (D) exhibiting the highest values since 2010."
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
          Patent markets across all technology sectors remain unconcentrated, with HHI
          values well below the 1,500 threshold. This pattern reflects the broad base of inventors and
          organizations participating in the patent system. Even in Electricity (H) and Physics (G) --
          the sections most associated with large technology firms -- concentration remains low,
          though certain sections exhibit modest increases since 2010. In that period, Textiles and Paper (D) has exhibited the highest concentration, consistent with its smaller inventor base and more
          specialized industrial structure.
        </p>
      </KeyInsight>

      {/* ── Section 4: Field-Specific Metrics ── */}

      <SectionDivider label="Field-Specific Metrics" />

      <Narrative>
        <p>
          The structural overview, growth dynamics, and cross-field patterns examined thus far describe
          the broad contours of technological change. This final section turns to metrics that characterize
          individual technology fields: the rate at which knowledge becomes obsolete, as measured by
          citation half-lives, and the duration of the patent examination process, which varies substantially
          across technology sectors.
        </p>
      </Narrative>

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
        id="fig-technology-revolution-citation-decay"
        title="Electricity (H) and Physics (G) Patents Exhibit the Shortest Citation Half-Lives at 10.7 and 11.2 Years, vs. 15.6 Years for Human Necessities (A)"
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
          Electricity (H) and Physics (G) patents exhibit the shortest half-lives,
          consistent with the rapid innovation cycles in computing and electronics in which
          current advances are quickly superseded by subsequent developments. Human Necessities (A) and
          Fixed Constructions (E) show the longest half-lives, reflecting the enduring
          relevance of innovations in these domains that often represent fundamental advances with lasting impact.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Knowledge obsolescence rates are complemented by examination pendency as a second
          field-specific metric. The duration from application filing to patent grant varies substantially
          across technology sectors, reflecting differences in examination complexity, prior art volume,
          and USPTO resource allocation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-technology-revolution-grant-lag-by-sector"
        subtitle="Average days from application filing to patent grant by WIPO technology sector across 5-year periods."
        title="Chemistry, Electrical Engineering, and Instruments Patents Exhibit Among the Longest Grant Lags, Exceeding 3.5 Years in the Late 2000s"
        caption="This chart displays the average number of days from application filing to patent grant, disaggregated by WIPO technology sector across 5-year periods. Chemistry and electrical engineering patents exhibit the longest pendency in the late 2000s, with both peaking above 1,300 days."
        loading={glL}
        insight="Technology-specific backlogs appear to reflect both the complexity of patent examination in certain fields and the USPTO's resource allocation decisions."
      >
        <PWLineChart
          data={lagPivot}
          xKey="period"
          lines={grantLagSectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Years"
          yFormatter={(v) => `${Math.round(v / 365.25 * 10) / 10}`}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The duration from application to grant has fluctuated
          considerably over the decades. Patent office backlogs, examination complexity,
          and policy reforms each contribute to observable shifts in the grant lag trajectory.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Grant lags reveal the institutional constraints on innovation. The late 2000s backlog
          elevated pendency beyond 3.5 years for leading sectors; subsequent USPTO reforms reduced
          these durations. Chemistry and electrical engineering patents exhibit the longest
          examination periods in the late 2000s, a pattern consistent with the substantial volume and complexity of prior art in
          these fields.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        The first two chapters established how the patent system grew and which technologies fueled that expansion. The analysis now turns to the language of patents themselves, examining how the vocabulary of invention has evolved alongside these structural shifts.
        The shift from chemistry to digital technology is visible not only in formal classification codes but in the words inventors use to describe their work. The <Link href="/chapters/the-language-of-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> applies unsupervised text analysis to five decades of patent abstracts to uncover the latent thematic structure of US patenting.
      </Narrative>

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent
        and WIPO technology fields mapped from IPC codes. Technology half-life is computed as the time until 50% of cumulative forward citations are received, based on patents granted 1976-2010 with citations tracked through 2025. Market concentration (HHI) is computed within each CPC section by assignee market share in 5-year windows. Technology convergence measures the co-occurrence of CPC section pairs on multi-section patents by era. Grant lag is measured as the average days from application filing to patent grant by WIPO sector in 5-year periods.
      </DataNote>

      <RelatedChapters currentChapter={2} />
      <ChapterNavigation currentChapter={2} />
    </div>
  );
}
