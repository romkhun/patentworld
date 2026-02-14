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
  const { data: halfLife } = useChapterData<TechnologyHalfLife[]>('chapter2/technology_halflife.json');
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
        subtitle="Structural shifts in the composition of patented technology, 1976-2025"
      />

      <KeyFindings>
        <li>Electrical engineering rose from the smallest sector to surpass first chemistry (1994) and then mechanical engineering (1995), becoming the dominant patent sector and marking the transition to the digital era.</li>
        <li><GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections G (Physics) and H (Electricity) now constitute over 57% of all patent grants, an increase from about 27% in the 1970s.</li>
        <li>The fastest-growing technology classes are concentrated in digital technologies (data processing, digital communication), with growth rates exceeding 1,000%, while the most rapidly declining classes have contracted by up to 84%.</li>
        <li>Technology diversity declined substantially from its mid-1980s peak through 2009 as digital technologies concentrated activity, then stabilized at a lower level.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The fivefold expansion in patent output documented in Chapter 1 masks a fundamental realignment in the composition of American invention. A pair of mid-1990s crossover events, in which electrical engineering overtook both chemistry and mechanical engineering in annual grant volume, signaled the transition from the mechanical-chemical era to the digital era. The consequences of this transition have been far-reaching: technology classes centered on data processing and digital communication have expanded by orders of magnitude, while analog-era categories have contracted sharply, a pattern consistent with Schumpeterian creative destruction operating at an unprecedented pace. The resulting concentration of inventive activity in computing-related fields has measurably reduced the diversity of the patent portfolio, a structural shift that also shapes the organizational landscape examined in Chapter 3.
        </p>
      </aside>

      <Narrative>
        <p>
          The composition of patent grants reflects the trajectory of technological change. Over five
          decades, the balance of inventive activity has shifted substantially from traditional
          industries such as chemistry and mechanical engineering toward{' '}
          <StatCallout value="electrical engineering and computing" />.
        </p>
      </Narrative>

      <ChartContainer
        title="Electrical Engineering Grew 14-Fold from 10,404 Patents in 1976 to 150,702 in 2024"
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
          yLabel="Patents"
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

      <ChartContainer
        title="CPC Sections G and H Gained Roughly 30 Percentage Points of Share Over Five Decades"
        caption="Share of utility patents by CPC section (primary classification), 1976-2025. Sections: A=Human Necessities, B=Operations, C=Chemistry, D=Textiles, E=Construction, F=Mechanical, G=Physics, H=Electricity. The stacked area visualization reveals a sustained reallocation of patent activity toward digital technology sections."
        insight="Digital technology sections (G, H) gained roughly 30 percentage points of share over five decades, while chemistry and operations contracted proportionally. This redistribution is consistent with the economy-wide shift toward information-intensive industries."
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
          The proportional view reveals relative shifts with greater clarity. Section H
          (Electricity) and G (Physics), which encompass computing, semiconductors, optics,
          and measurement, have grown from about 27% of patents in the 1970s to over
          57% in recent years. By contrast, traditional sections such as C (Chemistry) and B (Operations)
          have experienced a proportional decline in share.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Sections G (Physics) and H (Electricity) have grown from about 27% of patents in the
          1970s to over 57% in recent years. This structural shift reflects the economy-wide digital
          transformation: computing, semiconductors, and telecommunications technologies now
          pervade virtually every industry, from manufacturing to healthcare.
        </p>
      </KeyInsight>

      {treemap && treemap.length > 0 && (
        <ChartContainer
          title="The Top 3 CPC Classes Account for 30-42% of Patents in Most Sections, Revealing Concentrated Innovation"
          caption="Proportional breakdown of patents by CPC technology class. Each rectangle represents the volume of patents in that class, with colors corresponding to CPC sections. Digital communication and computing dominate section H (Electricity), while pharmaceutical and organic chemistry lead section C (Chemistry)."
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
          classes account for the largest share, while in Chemistry (C), pharmaceutical and organic chemistry
          classes constitute the leading subfields.
        </p>
      </KeyInsight>

      <SectionDivider label="Structural Change" />

      {changeData.length > 0 && (
        <ChartContainer
          title="The Fastest-Growing Digital Technology Classes Grew by Over 1,000% While Declining Classes Contracted by Up to 84%"
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
          by up to 84%. These figures do not represent marginal adjustments; rather, they indicate
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
        title="Technology Diversity Declined from 0.848 in 1984 to 0.777 in 2009 Before Stabilizing at 0.789 by 2025"
        caption="1 minus the Herfindahl-Hirschman Index of CPC section concentration, 1976-2025. Higher values indicate more diverse technology output. The index declined substantially as digital technologies concentrated activity, then stabilized after 2009."
        insight="Technology diversity declined substantially from its mid-1980s peak through 2009 as digital technologies concentrated patent activity in sections G and H. The index then stabilized at a lower level, suggesting that while the concentration shift has halted, it has not reversed."
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
          Technology diversity declined substantially from its mid-1980s peak through 2009 as digital technologies concentrated
          patent activity in sections G and H. Since then, diversity has stabilized at a lower level, indicating
          that while the concentration shift has not reversed, it has at least ceased accelerating.
        </p>
      </KeyInsight>

      <SectionDivider label="The Half-Life of Technology" />
      <Narrative>
        <p>
          The rate at which a technology becomes obsolete can be measured through citation dynamics.
          By examining when a patent receives the majority of its forward citations, it is possible to
          estimate the &quot;half-life&quot; of knowledge in each technology area, defined as the time required
          for 50% of all citations to accumulate. Shorter half-lives indicate rapidly evolving fields,
          while longer half-lives suggest foundational knowledge with lasting relevance.
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
        title="Electricity (H) and Physics (G) Patents Exhibit the Shortest Citation Half-Lives at 10.7 and 11.2 Years, vs. 15.6 Years for Human Necessities (A)"
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

      <SectionDivider label="Technology Life Cycle S-Curves" />
      <Narrative>
        <p>
          Fitting logistic S-curves to cumulative patent counts by CPC section indicates where
          each technology domain resides within its innovation lifecycle. Mature technologies such as mechanical
          engineering and chemistry exhibit decelerating growth rates, while computing-related sections
          continue along a steep upward trajectory.
        </p>
      </Narrative>

      <ChartContainer
        title="Textiles Has Reached Over 97% of Estimated Carrying Capacity While Computing Sections Continue to Grow"
        caption="Percentage of estimated carrying capacity (K) reached by each CPC section, based on logistic S-curve fit to cumulative patent counts, 1976-2025. Higher values indicate greater technological maturity as measured by proximity to the estimated saturation point."
        insight="Textiles (D) has reached over 97% of estimated carrying capacity, while Fixed Constructions (E) is approaching 60%, suggesting maturation. Physics (G) and Electricity (H), which encompass computing, AI, and semiconductors, appear to retain substantial growth potential."
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
          The S-curve analysis indicates a patent system in transition. Traditional engineering
          fields appear to be approaching saturation, while computing and electronics continue their
          rapid expansion. It should be noted that cross-sectional class Y (which includes green technology and AI tags)
          is excluded from the S-curve analysis because its tagging conventions differ from primary CPC sections.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the technologies that have driven the growth in patent activity, the following chapter investigates the organizations responsible for this output.
        The shift from chemistry to digital technology has reshaped not only the composition of patent grants but also the organizational landscape of innovation, from American industrial conglomerates to Asian firms.
      </Narrative>

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent
        and WIPO technology fields mapped from IPC codes. Technology half-life is computed as the time until 50% of cumulative forward citations are received, based on patents granted 1976-2010 with citations tracked through 2025.
      </DataNote>

      <RelatedChapters currentChapter={2} />
      <ChapterNavigation currentChapter={2} />
    </div>
  );
}
