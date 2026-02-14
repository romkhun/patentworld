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
import { CPC_SECTION_COLORS, WIPO_SECTOR_COLORS, CHART_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  CitationLagBySection,
  InnovationVelocity,
  FrictionMapEntry,
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

export default function InnovationTempo() {
  // Citation lag by technology section (from Knowledge Network)
  const { data: citeLagBySection, loading: clsL } = useChapterData<CitationLagBySection[]>('chapter6/citation_lag_by_section.json');

  // Innovation velocity by WIPO sector (from Innovation Dynamics)
  const { data: velocity, loading: vlL } = useChapterData<InnovationVelocity[]>('chapter7/innovation_velocity.json');

  // Examination friction map (from Innovation Dynamics)
  const { data: frictionMap, loading: fmL } = useChapterData<FrictionMapEntry[]>('chapter7/friction_map.json');

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

  return (
    <div>
      <ChapterHeader
        number={30}
        title="Innovation Tempo"
        subtitle="Citation decay, patenting velocity, and examination friction across fields"
      />

      <KeyFindings>
        <li>Citation lag varies by technology: Physics/Electricity exhibit 11-year median lag vs. 17 years for Chemistry in the 2020s.</li>
        <li>Innovation velocity is correlated across sectors, with synchronized declines during economic downturns.</li>
        <li>Since the mid-2000s, Chemistry patents have exhibited the longest examination durations, peaking at 1,293 days median in the 2010-2014 period.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Innovation does not move at the same speed across all technology fields. Physics and Electricity patents exhibit an 11-year median citation lag versus 17 years for Chemistry, reflecting fundamentally different knowledge diffusion rates. Patenting growth rates are highly correlated across all five WIPO sectors, with synchronized declines following the dot-com bust and 2008 financial crisis, while Chemistry patents face the longest examination durations at a 1,293-day median during the 2010-2014 peak.
        </p>
      </aside>

      <Narrative>
        <p>
          Patent metrics are not uniform across technology fields. The speed at which knowledge
          diffuses, the rate at which new patents are filed, and the time required for patent
          examination all vary systematically by technology area. This chapter examines three
          dimensions of innovation tempo: citation lag, patenting velocity, and examination
          friction, each disaggregated by <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> section
          or <GlossaryTooltip term="WIPO">WIPO</GlossaryTooltip> technology sector.
        </p>
        <p>
          These tempo differences reflect the underlying nature of innovation in each domain.
          Rapid innovation cycles in <Link href="/chapters/technology-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">computing and electronics</Link> translate to shorter citation
          lags and faster knowledge diffusion, whereas the complex development timelines
          characteristic of chemistry and pharmaceuticals produce longer lags and extended
          examination durations.
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
          consistent with rapid innovation cycles in <Link href="/chapters/technology-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">computing and electronics</Link>, whereas
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

      <Narrative>
        Innovation tempo varies substantially across technology fields, with citation lag, patenting velocity, and examination friction all exhibiting sector-specific patterns. These differences reflect the underlying nature of innovation in each domain and the institutional constraints of the patent system. The <Link href="/chapters/patent-characteristics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">next chapter</Link> examines how patent characteristics such as claim complexity and composite quality vary across these same technology areas.
      </Narrative>

      <DataNote>
        Citation lag by section uses median lag in years between cited and citing patent grant dates, aggregated by CPC section and decade. Innovation velocity is computed as year-over-year percentage change in patent grants by WIPO technology sector. Examination friction is measured as the median time from application filing date to patent grant date, aggregated by CPC section and 5-year period.
      </DataNote>

      <RelatedChapters currentChapter={30} />
      <ChapterNavigation currentChapter={30} />
    </div>
  );
}
