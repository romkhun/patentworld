'use client';

import { useMemo } from 'react';
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
import type { SectorPerYear, CPCSectionPerYear, CPCClassChange, TechDiversity, CPCTreemapEntry, TechnologyHalfLife, TechnologyDecayCurve, TechnologySCurve } from '@/lib/types';

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

export default function Chapter2() {
  const { data: sectors, loading: secL } = useChapterData<SectorPerYear[]>('chapter2/wipo_sectors_per_year.json');
  const { data: cpcSections, loading: cpcL } = useChapterData<CPCSectionPerYear[]>('chapter2/cpc_sections_per_year.json');
  const { data: cpcChange, loading: chgL } = useChapterData<(CPCClassChange & { direction: string })[]>('chapter2/cpc_class_change.json');
  const { data: diversity, loading: divL } = useChapterData<TechDiversity[]>('chapter2/tech_diversity.json');
  const { data: treemap, loading: tmL } = useChapterData<CPCTreemapEntry[]>('chapter2/cpc_treemap.json');
  const { data: halfLife, loading: hlL } = useChapterData<TechnologyHalfLife[]>('chapter2/technology_halflife.json');
  const { data: decayCurves, loading: dcL } = useChapterData<TechnologyDecayCurve[]>('chapter2/technology_decay_curves.json');
  const { data: scurves, loading: scL } = useChapterData<TechnologySCurve[]>('chapter2/technology_scurves.json');

  const sectorPivot = useMemo(() => sectors ? pivotBySector(sectors) : [], [sectors]);
  const sectionPivot = useMemo(() => cpcSections ? pivotBySection(cpcSections) : [], [cpcSections]);

  const sectorNames = useMemo(() => {
    if (!sectors) return [];
    return [...new Set(sectors.map((d) => d.sector))];
  }, [sectors]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

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

  return (
    <div>
      <ChapterHeader
        number={2}
        title="The Technology Revolution"
        subtitle="The shifting frontiers of technology"
      />

      <KeyFindings>
        <li>Electrical engineering overtook chemistry as the dominant patent sector in the early 1990s, marking the transition from the chemical-pharmaceutical era to the digital era.</li>
        <li><GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections G (Physics) and H (Electricity) now account for nearly 48% of all patent grants, up from 30% in the 1970s.</li>
        <li>The fastest-growing technology classes are concentrated in digital technologies (data processing, digital communication), while analog-era classes (typewriters, photographic processes) are declining.</li>
        <li>Despite the digital surge, overall technology diversity has remained stable — new fields are growing without fully displacing established ones.</li>
      </KeyFindings>

      <Narrative>
        <p>
          The composition of patents tells the story of technological change. Over five
          decades, the balance of innovation has shifted dramatically from traditional
          industries like chemistry and mechanical engineering toward{' '}
          <StatCallout value="electrical engineering and computing" />.
        </p>
      </Narrative>

      <ChartContainer
        title="WIPO Technology Sectors Over Time"
        caption="Patent grants by WIPO sector (primary classification), 1976-2025."
        insight="The 1990s crossover where electrical engineering surpassed chemistry represents one of the most significant structural shifts in the history of patenting, driven by the computing and telecommunications revolutions."
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
          yLabel="Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Electrical engineering has seen explosive growth, driven by the computing,
          telecommunications, and semiconductor revolutions. Chemistry, once the dominant
          sector, has grown more slowly. Mechanical engineering and instruments have
          maintained steady contributions.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Electrical engineering overtook chemistry as the dominant patent sector in the early 1990s
          and has accelerated since. This crossover marks the transition from the chemical-pharmaceutical
          era of innovation to the digital era -- one of the most significant structural shifts in
          the history of patenting.
        </p>
      </KeyInsight>

      <ChartContainer
        title="CPC Technology Sections: Share Over Time"
        caption="Share of utility patents by CPC section (primary classification). Sections: A=Human Necessities, B=Operations, C=Chemistry, D=Textiles, E=Construction, F=Mechanical, G=Physics, H=Electricity."
        insight="The 100% stacked view makes relative shifts visible. Digital technology sections (G, H) have gained nearly 18 percentage points of share over five decades, while chemistry and operations have contracted proportionally."
        loading={cpcL}
        height={650}
      >
        <PWAreaChart
          data={sectionPivot}
          xKey="year"
          areas={sectionKeys.map((key) => ({
            key,
            name: `${key}: ${CPC_SECTION_NAMES[key]}`,
            color: CPC_SECTION_COLORS[key],
          }))}
          stackedPercent
        />
      </ChartContainer>

      <Narrative>
        <p>
          The 100% stacked view reveals the relative shifts more clearly. Section H
          (Electricity) and G (Physics) -- which cover computing, semiconductors, optics,
          and measurement -- have grown from roughly 30% of patents in the 1970s to over
          45% today. Meanwhile, traditional sections like C (Chemistry) and B (Operations)
          have seen their share decline.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Sections G (Physics) and H (Electricity) have grown from roughly 30% of patents in the
          1970s to nearly 48% today. This structural shift reflects the economy-wide digital
          transformation: computing, semiconductors, and telecommunications technologies now
          pervade virtually every industry, from manufacturing to healthcare.
        </p>
      </KeyInsight>

      {treemap && treemap.length > 0 && (
        <ChartContainer
          title="Technology Landscape: CPC Class Treemap"
          caption="Proportional breakdown of patents by CPC technology class. Each rectangle's area represents the number of patents in that class. Colors correspond to CPC sections."
          insight="Within each CPC section, patent activity is heavily concentrated in a few dominant classes — digital communication and computing dominate Electricity, while pharmaceutical and organic chemistry lead Chemistry."
          loading={tmL}
          height={850}
        >
          <PWTreemap data={treemap} />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The treemap reveals that within each CPC section, patent activity is heavily concentrated
          in a few dominant classes. In Electricity (H), digital communication and computing
          classes dwarf all others, while in Chemistry (C), pharmaceutical and organic chemistry
          classes lead.
        </p>
      </KeyInsight>

      <SectionDivider label="Structural Change" />

      {changeData.length > 0 && (
        <ChartContainer
          title="Fastest Growing and Declining Technology Classes"
          caption="Percent change in patent counts: 2000-2010 vs. 2015-2025. Fastest growing (positive) and declining (negative) CPC classes with at least 100 patents in each period."
          insight="The creative destruction of the digital revolution is visible here: entire categories of analog-era invention have been rendered obsolete as their digital replacements surge ahead."
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
          The magnitude of these structural shifts is striking. The fastest-growing classes
          show increases of several hundred percent, while declining classes have contracted
          by similar margins. These are not small adjustments at the margin -- they represent
          fundamental reorientation of inventive activity.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The growing classes are dominated by digital technologies (data processing, digital
          communication, image analysis), while declining classes tend to involve analog-era
          technologies (typewriters, photographic processes, traditional printing). This
          reflects the creative destruction of the digital revolution: entire categories of
          invention have been rendered obsolete as their digital replacements surge ahead.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Technology Diversity Index"
        caption="1 minus the Herfindahl-Hirschman Index of CPC section concentration. Higher values indicate more diverse technology output."
        insight="Despite the explosive growth of electrical engineering, the patent system's technology mix has not narrowed dramatically. Innovation continues broadly across established fields."
        loading={divL}
      >
        <PWLineChart
          data={diversity ?? []}
          xKey="year"
          lines={[{ key: 'diversity_index', name: 'Diversity Index', color: CHART_COLORS[0] }]}
          yFormatter={(v) => v.toFixed(3)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Despite the explosive growth of electrical engineering, overall technology diversity has
          remained relatively stable. Innovation is not narrowing to a single domain -- rather,
          established fields continue to produce patents even as new digital technologies surge ahead.
        </p>
      </KeyInsight>

      <SectionDivider label="The Half-Life of Technology" />
      <Narrative>
        <p>
          How quickly does a technology become obsolete? By measuring when a patent
          receives the bulk of its forward citations, we can estimate the &quot;half-life&quot;
          of knowledge in each technology area — the time it takes for 50% of all
          citations to accumulate. Shorter half-lives indicate rapidly evolving fields;
          longer ones suggest foundational knowledge with lasting relevance.
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
        title="Citation Decay Curves by Technology Area"
        caption="Distribution of forward citations by years after grant. Each line shows what percentage of a technology area's total citations arrive in each year."
        insight="Fast-moving fields like computing (H) and physics (G) have short citation half-lives, meaning knowledge becomes obsolete quickly. Chemistry and pharma innovations remain relevant for much longer."
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
          Electricity (H) and Physics (G) patents have the shortest half-lives,
          consistent with the rapid innovation cycles in computing and electronics where
          today&apos;s breakthrough quickly becomes tomorrow&apos;s baseline. Chemistry (C) and
          Human Necessities (A) show the longest half-lives, reflecting the enduring
          relevance of pharmaceutical and chemical innovations that take years to develop
          and often represent fundamental scientific advances with lasting impact.
        </p>
      </KeyInsight>

      <SectionDivider label="Technology Life Cycle S-Curves" />
      <Narrative>
        <p>
          Fitting logistic S-curves to cumulative patent counts by CPC section reveals where
          each technology sits in its innovation lifecycle. Mature technologies like mechanical
          engineering and chemistry show slowing growth rates, while computing-related sections
          continue their steep ascent.
        </p>
      </Narrative>

      <ChartContainer
        title="Technology Maturity by CPC Section"
        caption="Percentage of estimated carrying capacity (K) reached by each CPC section, based on logistic S-curve fit to cumulative patent counts 1976–2025."
        insight="Textiles (D) and Fixed Constructions (E) have reached over 70% of their estimated carrying capacity, suggesting maturation. Physics (G) and Electricity (H) — home to computing, AI, and semiconductors — still have significant room to grow."
        loading={scL}
        height={400}
      >
        <PWBarChart
          data={scurveData}
          xKey="section"
          bars={[{ key: 'current_pct_of_K', name: 'Maturity (% of K)', color: CHART_COLORS[1] }]}
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
          The S-curve analysis reveals a patent system in transition. Traditional engineering
          fields are approaching saturation, while computing and electronics continue their
          exponential expansion. The cross-sectional class Y (which includes green and AI tags)
          remains in early growth — consistent with these technologies&apos; recent emergence as
          major patenting categories.
        </p>
      </KeyInsight>

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent
        and WIPO technology fields mapped from IPC codes. Technology half-life is computed as the time until 50% of cumulative forward citations are received, based on patents granted 1976-2010 with citations tracked through 2025.
      </DataNote>

      <RelatedChapters currentChapter={2} />
      <ChapterNavigation currentChapter={2} />
    </div>
  );
}
