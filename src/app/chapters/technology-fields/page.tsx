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
import { PWTreemap } from '@/components/charts/PWTreemap';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { SectorPerYear, CPCSectionPerYear, CPCTreemapEntry } from '@/lib/types';

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

export default function Chapter3() {
  const { data: sectors, loading: secL } = useChapterData<SectorPerYear[]>('chapter2/wipo_sectors_per_year.json');
  const { data: cpcSections, loading: cpcL } = useChapterData<CPCSectionPerYear[]>('chapter2/cpc_sections_per_year.json');
  const { data: treemap, loading: tmL } = useChapterData<CPCTreemapEntry[]>('chapter2/cpc_treemap.json');

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

  return (
    <div>
      <ChapterHeader
        number={3}
        title="Technology Fields"
        subtitle="How CPC sections and WIPO sectors compose the patent landscape, 1976-2025"
      />

      <KeyFindings>
        <li>Electrical engineering rose from the third-largest sector to surpass first chemistry (1994) and then mechanical engineering (1995), becoming the dominant patent sector and marking the transition to the digital era.</li>
        <li><GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections G (Physics) and H (Electricity) now constitute over 57% of all patent grants, an increase from about 27% in the 1970s.</li>
        <li>Within each CPC section, patent activity is concentrated in a small number of dominant classes, with the top 3 classes accounting for 15-42% of patents across sections.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Electrical engineering grew nearly 15-fold from 10,404 patents in 1976 to 150,702 in 2024, overtaking both chemistry and mechanical engineering in the mid-1990s to become the dominant patent sector. CPC sections G (Physics) and H (Electricity) now account for over 57% of all patent grants, up from about 27% in the 1970s, reflecting the economy-wide digital transformation. Within each section, a small number of technology classes drive the majority of inventive output.
        </p>
      </aside>

      <Narrative>
        <p>
          The composition of patent grants reflects the trajectory of technological change. Over five
          decades, the balance of inventive activity has shifted substantially from traditional
          industries such as chemistry and mechanical engineering toward{' '}
          <StatCallout value="electrical engineering and computing" />.
          This chapter surveys the landscape at two complementary levels of granularity: the five WIPO
          technology sectors and the eight primary CPC classification sections.
        </p>
        <p>
          A pair of mid-1990s crossover events, in which electrical engineering overtook both chemistry and mechanical engineering in annual grant volume, signaled the transition from the mechanical-chemical era to the digital era. The consequences of this transition have been far-reaching, reshaping the composition of the entire patent portfolio.
        </p>
        <p>
          Understanding the field-level structure of patenting provides essential context for the growth dynamics examined in <Link href="/chapters/technology-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Technology Dynamics</Link> and the cross-field convergence patterns explored in <Link href="/chapters/cross-field-convergence" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Cross-Field Convergence</Link>.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-technology-fields-wipo-sectors"
        title="Electrical Engineering Grew Nearly 15-Fold from 10,404 Patents in 1976 to 150,702 in 2024"
        subtitle="Annual patent grants by WIPO technology sector, showing the structural crossover from chemistry and mechanical engineering to electrical engineering, 1976-2025"
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
        id="fig-technology-fields-cpc-sections"
        title="CPC Sections G and H Gained Roughly 30 Percentage Points of Share Over Five Decades"
        subtitle="Share of utility patents by CPC section, toggling between percentage share and absolute count views, 1976-2025"
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
          id="fig-technology-fields-cpc-treemap"
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

      {/* ── Closing ── */}

      <Narrative>
        The field-level overview reveals a patent system transformed by the digital transition: electrical engineering now dominates, CPC sections G and H account for over half of all grants, and within each section, a handful of classes drive the bulk of inventive output. These structural patterns raise natural questions about the dynamics of growth and decline within specific technology classes, the diversity of the overall portfolio, and the lifecycle maturity of different fields. The <Link href="/chapters/technology-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">next chapter</Link> examines these dynamics in detail.
      </Narrative>

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent
        and WIPO technology fields mapped from IPC codes. The treemap displays patent volume by CPC technology class, sized by total grants and colored by CPC section.
      </DataNote>

      <RelatedChapters currentChapter={3} />
      <ChapterNavigation currentChapter={3} />
    </div>
  );
}
