'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { CHART_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import type { CPCClassChange, TechDiversity, TechnologySCurve } from '@/lib/types';

export default function Chapter4() {
  const { data: cpcChange, loading: chgL } = useChapterData<(CPCClassChange & { direction: string })[]>('chapter2/cpc_class_change.json');
  const { data: diversity, loading: divL } = useChapterData<TechDiversity[]>('chapter2/tech_diversity.json');
  const { data: scurves, loading: scL } = useChapterData<TechnologySCurve[]>('chapter2/technology_scurves.json');

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
        number={4}
        title="Technology Dynamics"
        subtitle="Growth, decline, and lifecycle maturity of technology classes, 1976-2025"
      />

      <KeyFindings>
        <li>The fastest-growing technology classes are concentrated in digital technologies (data processing, digital communication), with growth rates exceeding 1,000%, while the most rapidly declining classes have contracted by nearly 84%.</li>
        <li>Technology diversity declined substantially from its 1984 peak (0.848) through 2009 (0.777) as digital technologies concentrated activity, then stabilized at a lower level of 0.789 by 2025.</li>
        <li>Textiles (D) has reached over 97% of estimated carrying capacity, while Physics (G) and Electricity (H) retain substantial growth potential, indicating a patent system in transition.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The fastest-growing digital technology classes expanded by over 1,000% while declining classes contracted by nearly 84%, a pattern consistent with Schumpeterian creative destruction operating at rapid pace. Technology diversity declined from 0.848 in 1984 to 0.777 in 2009 before stabilizing at 0.789 by 2025, as digital fields concentrated inventive activity. S-curve analysis reveals that traditional engineering fields approach saturation while computing and electronics retain substantial growth potential.
        </p>
      </aside>

      <Narrative>
        <p>
          The <Link href="/chapters/technology-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">overview of technology fields</Link> reveals a system transformed by the digital transition. This
          chapter examines the dynamics of that transformation in greater detail: which specific technology
          classes have grown or declined most substantially, how overall diversity has responded to the
          concentration of activity in digital fields, and where each technology domain stands within its
          innovation lifecycle.
        </p>
        <p>
          The magnitude of structural shifts across technology classes is not merely incremental; entire categories of analog-era invention have been rendered obsolete as digital replacements have expanded. At the same time, the diversity of the patent portfolio has contracted measurably, raising questions about the long-term balance of inventive activity.
        </p>
        <p>
          Understanding these dynamics provides essential context for the cross-field convergence patterns examined in the <Link href="/chapters/cross-field-convergence" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">next chapter</Link>.
        </p>
      </Narrative>

      {changeData.length > 0 && (
        <ChartContainer
          id="fig-technology-dynamics-cpc-class-change"
          title="The Fastest-Growing Digital Technology Classes Grew by Over 1,000% While Declining Classes Contracted by Nearly 84%"
          subtitle="Percentage change in patent counts by CPC class, comparing 2000-2010 to 2015-2025, for classes with 100+ patents in each period"
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

      <SectionDivider label="Diversity and Lifecycle Maturity" />

      <ChartContainer
        id="fig-technology-dynamics-diversity-index"
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
        id="fig-technology-dynamics-scurve-maturity"
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
          The S-curve analysis indicates a patent system in transition. Traditional engineering
          fields appear to be approaching saturation, while computing and electronics continue their
          rapid expansion. It should be noted that cross-sectional class Y (which includes green technology and AI tags)
          is excluded from the S-curve analysis because its tagging conventions differ from primary CPC sections.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        The dynamics of growth, decline, and lifecycle maturity examined in this chapter reveal a patent system undergoing fundamental structural change. The concentration of inventive activity in digital fields has reduced portfolio diversity, while S-curve analysis suggests that traditional fields approach saturation as computing-related domains continue expanding. These patterns raise natural questions about how technology fields interact and whether increasing concentration has led to market dominance. The <Link href="/chapters/cross-field-convergence" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">next chapter</Link> examines cross-field convergence, market concentration, and field-specific metrics including citation half-lives and grant lags.
      </Narrative>

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent.
        Growth rates compare patent counts in 2000-2010 to 2015-2025 for CPC classes with at least 100 patents in each period. The diversity index is computed as 1 minus the Herfindahl-Hirschman Index of CPC section concentration. S-curve parameters are fitted using logistic regression on cumulative patent counts per CPC section (1976-2025).
      </DataNote>

      <RelatedChapters currentChapter={4} />
      <ChapterNavigation currentChapter={4} />
    </div>
  );
}
