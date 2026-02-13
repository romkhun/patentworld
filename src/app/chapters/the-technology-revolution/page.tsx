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
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { SectorPerYear, CPCSectionPerYear, CPCClassChange, TechDiversity, CPCTreemapEntry } from '@/lib/types';

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
  const { data: cpcChange, loading: chgL } = useChapterData<{ growing: CPCClassChange[]; declining: CPCClassChange[] }>('chapter2/cpc_class_change.json');
  const { data: diversity, loading: divL } = useChapterData<TechDiversity[]>('chapter2/tech_diversity.json');
  const { data: treemap, loading: tmL } = useChapterData<CPCTreemapEntry[]>('chapter2/cpc_treemap.json');

  const sectorPivot = useMemo(() => sectors ? pivotBySector(sectors) : [], [sectors]);
  const sectionPivot = useMemo(() => cpcSections ? pivotBySection(cpcSections) : [], [cpcSections]);

  const sectorNames = useMemo(() => {
    if (!sectors) return [];
    return [...new Set(sectors.map((d) => d.sector))];
  }, [sectors]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  const changeData = useMemo(() => {
    if (!cpcChange) return [];
    const growing = (cpcChange.growing || []).slice(0, 15).map((d) => ({
      label: `${d.cpc_class}: ${d.title?.slice(0, 35)}`,
      pct_change: d.pct_change,
    }));
    const declining = (cpcChange.declining || []).slice(0, 15).map((d) => ({
      label: `${d.cpc_class}: ${d.title?.slice(0, 35)}`,
      pct_change: d.pct_change,
    }));
    return [...growing, ...declining.reverse()];
  }, [cpcChange]);

  return (
    <div>
      <ChapterHeader
        number={2}
        title="The Technology Revolution"
        subtitle="The shifting frontiers of technology"
      />

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
          caption="Percent change in patent counts: 2000-2010 vs. 2015-2025. Top 15 growing (positive) and declining (negative) CPC classes."
          loading={chgL}
          height={850}
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

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent
        and WIPO technology fields mapped from IPC codes.
      </DataNote>

      <ChapterNavigation currentChapter={2} />
    </div>
  );
}
