'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  GrantLagBySector,
  CrossDomain,
  IntlCollaboration,
  CorpDiversification,
  InnovationVelocity,
  FrictionMapEntry,
} from '@/lib/types';

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

export default function Chapter8() {
  const { data: grantLag, loading: glL } = useChapterData<GrantLagBySector[]>('chapter7/grant_lag_by_sector.json');
  const { data: crossDomain, loading: cdL } = useChapterData<CrossDomain[]>('chapter7/cross_domain.json');
  const { data: intlCollab, loading: icL } = useChapterData<IntlCollaboration[]>('chapter7/intl_collaboration.json');
  const { data: corpDiv, loading: cpL } = useChapterData<CorpDiversification[]>('chapter7/corp_diversification.json');
  const { data: velocity, loading: vlL } = useChapterData<InnovationVelocity[]>('chapter7/innovation_velocity.json');
  const { data: frictionMap, loading: fmL } = useChapterData<FrictionMapEntry[]>('chapter7/friction_map.json');

  const lagPivot = useMemo(() => grantLag ? pivotGrantLag(grantLag) : [], [grantLag]);
  const sectorNames = useMemo(() => {
    if (!grantLag) return [];
    return [...new Set(grantLag.map((d) => d.sector))];
  }, [grantLag]);

  const velocityPivot = useMemo(() => velocity ? pivotVelocity(velocity) : [], [velocity]);
  const velocitySectors = useMemo(() => {
    if (!velocity) return [];
    return [...new Set(velocity.map((d) => d.sector))];
  }, [velocity]);

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

  const corpDivLate = useMemo(() => {
    if (!corpDiv) return [];
    const orgs = [...new Set(corpDiv.map((d) => d.organization))];
    return orgs.map((org) => {
      const row: any = { organization: org.length > 20 ? org.slice(0, 18) + '...' : org };
      let total = 0;
      corpDiv.filter((d) => d.organization === org && d.era === 'late').forEach((d) => {
        row[d.section] = d.count;
        total += d.count;
      });
      row._total = total;
      return row;
    }).sort((a: any, b: any) => b._total - a._total);
  }, [corpDiv]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  return (
    <div>
      <ChapterHeader
        number={8}
        title="Innovation Dynamics"
        subtitle="The tempo and trajectory of invention"
      />

      <KeyFindings>
        <li><GlossaryTooltip term="grant lag">Grant lag</GlossaryTooltip> varies significantly by technology sector — software and electronics patents face longer pendency times than mechanical inventions.</li>
        <li>Cross-domain innovation has intensified, with patents increasingly spanning multiple technology classifications.</li>
        <li>International collaboration on patents has grown steadily, particularly between the US, Europe, and East Asia.</li>
        <li>Innovation velocity — measured by the speed of knowledge diffusion through citations — has accelerated in digital technology fields.</li>
      </KeyFindings>

      <Narrative>
        <p>
          Beyond what is patented and by whom, the <StatCallout value="dynamics of innovation" /> --
          its speed, breadth, and collaborative nature -- reveal deeper patterns. How long does it
          take for an invention to move from application to grant? Are technologies converging across
          traditional boundaries? Is innovation becoming more international?
        </p>
      </Narrative>

      <ChartContainer
        title="Grant Lag by Technology Sector (5-Year Periods)"
        caption="Average days from application filing to patent grant, by WIPO sector."
        loading={glL}
        insight="Technology-specific backlogs reflect both the complexity of patent examination in certain fields and the USPTO's resource allocation challenges."
      >
        <PWLineChart
          data={lagPivot}
          xKey="period"
          lines={sectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Days"
          yFormatter={(v) => `${Math.round(v / 365.25 * 10) / 10}y`}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The time from application to grant varies by technology sector and has fluctuated
          significantly over the decades. Patent office backlogs, examination complexity,
          and policy reforms all leave their mark on the grant lag curve.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Grant lags reveal the institutional bottlenecks of innovation. The early 2000s backlog
          crisis pushed average pendency past 3.5 years, but USPTO reforms have since reduced
          wait times. Electrical engineering and instruments patents consistently face the longest
          examinations, reflecting the sheer volume and complexity of prior art in fast-moving
          digital technology fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Convergence" />

      <ChartContainer
        title="Cross-Domain Innovation: Patents Spanning Multiple Technology Sections"
        caption="Number of patents classified in a single section, two sections, or three or more CPC sections (excluding Y). Stacked from bottom: Single Section, Two Sections, Three+ Sections."
        loading={cdL}
        height={500}
        insight="Rising cross-domain innovation suggests that technological boundaries are blurring, with breakthroughs increasingly occurring at the intersection of multiple fields."
      >
        <PWAreaChart
          data={crossDomain ?? []}
          xKey="year"
          areas={[
            { key: 'single_section', name: 'Single Section', color: CHART_COLORS[0] },
            { key: 'two_sections', name: 'Two Sections', color: CHART_COLORS[2] },
            { key: 'three_plus_sections', name: 'Three+ Sections', color: CHART_COLORS[3] },
          ]}
          stacked
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2011] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The share of patents spanning multiple <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections has grown over time, reflecting
          increasing <StatCallout value="technological convergence" />. Modern inventions
          increasingly draw on knowledge from multiple domains -- a hallmark of the digital age
          where software, electronics, and traditional engineering intersect.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The rise of multi-domain patents signals a fundamental change in the nature of
          invention. Technologies like autonomous vehicles, wearable health monitors, and
          smart materials inherently span traditional boundaries between physics, chemistry,
          and engineering -- rewarding organizations that can integrate diverse expertise.
        </p>
      </KeyInsight>

      <SectionDivider label="Global Collaboration" />

      <ChartContainer
        title="International Collaboration in Patenting"
        caption="Patents with inventors from two or more countries: annual count and percentage of all patents."
        loading={icL}
        insight="The growth of international co-invention reflects both the globalization of corporate R&D and the increasing mobility of scientific talent."
      >
        <PWLineChart
          data={intlCollab ?? []}
          xKey="year"
          lines={[
            { key: 'intl_collab_count', name: 'International Collaboration Patents', color: CHART_COLORS[0], yAxisId: 'left' },
            { key: 'intl_collab_pct', name: 'International Collaboration %', color: CHART_COLORS[2], yAxisId: 'right' },
          ]}
          yLabel="Patents"
          rightYLabel="Percent"
          rightYFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2011] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The growth of international collaboration in patenting reflects the globalization
          of corporate R&D. Multinational firms increasingly distribute their research
          activities across multiple countries, leveraging local talent pools and regulatory
          environments. The result is a growing web of cross-border co-invention that
          transcends traditional national innovation systems.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          International collaboration has grown from under 5% of patents in the 1980s to over 10%
          today. This reflects the rise of multinational R&D operations, global talent mobility,
          and the increasing ease of remote scientific collaboration. The trend accelerated sharply
          in the 2000s as communication technology reduced the friction of cross-border teamwork.
        </p>
      </KeyInsight>

      <SectionDivider label="Corporate Technology Portfolios" />

      {corpDivLate.length > 0 && (
        <ChartContainer
          title="Top 10 Organizations: Technology Portfolio (2001-2025)"
          caption="Distribution of patent grants across CPC technology sections for the top 10 patent holders."
          loading={cpL}
          height={650}
          insight="Portfolio breadth correlates with firm longevity at the top of the patent rankings, as the most persistent leaders maintain diversified technology portfolios."
        >
          <PWBarChart
            data={corpDivLate}
            xKey="organization"
            bars={sectionKeys.map((key) => ({
              key,
              name: `${key}: ${CPC_SECTION_NAMES[key]}`,
              color: CPC_SECTION_COLORS[key],
            }))}
            layout="vertical"
            stacked
          />
        </ChartContainer>
      )}

      <Narrative>
        <p>
          The technology portfolios of major patent holders reveal how companies diversify their
          innovation across fields. IBM and Samsung maintain broadly diversified portfolios spanning
          physics, electricity, and chemistry, while companies like Intel concentrate heavily in
          semiconductor-related physics and electricity classes.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Portfolio breadth correlates with firm longevity at the top of the patent rankings.
          The most persistent leaders -- IBM, Samsung, Canon -- have diversified technology
          portfolios, while more specialized firms tend to rise and fall with the fortunes
          of their core technology domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Velocity" />

      <ChartContainer
        title="Innovation Velocity: Year-over-Year Growth by Sector"
        caption="Annual percentage change in patent grants by WIPO sector."
        loading={vlL}
        insight="Faster citation accumulation in digital fields confirms the accelerating pace of knowledge creation and obsolescence in computing and electronics."
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

      <Narrative>
        <p>
          Year-over-year growth rates reveal the cyclical nature of patenting activity. All sectors
          tend to move together in response to macroeconomic conditions and patent policy changes,
          but electrical engineering has consistently shown stronger growth momentum since the 1990s.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Innovation velocity is highly correlated across sectors, suggesting that macroeconomic
          conditions and patent policy are stronger drivers of patenting rates than sector-specific
          technology cycles. The synchronized dips during the early 2000s dot-com bust and the 2008
          financial crisis are particularly striking.
        </p>
      </KeyInsight>

      <SectionDivider label="Patent Examination Friction" />
      <Narrative>
        <p>
          Not all technologies move through the patent office at the same speed. The
          &quot;friction map&quot; reveals which technology areas systematically face longer
          examination times, measured as the median duration from filing to grant.
          These differences reflect both the complexity of examination and USPTO resource
          allocation across technology centers.
        </p>
      </Narrative>
      <ChartContainer
        title="Median Examination Duration by Technology Area"
        caption="Median time from application filing to patent grant, by CPC section and 5-year period."
        loading={fmL}
        insight="Examination duration patterns reveal the institutional friction that shapes innovation timelines, with technology-specific backlogs reflecting USPTO resource allocation across its technology centers."
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
            yFormatter={(v: number) => v.toFixed(1)}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Examination duration increased dramatically across all technology areas through
          the 2000s, peaking around 2010-2014 as the USPTO struggled with a massive backlog.
          The AIA reforms and USPTO hiring initiatives helped reduce pendency in subsequent
          years. Physics (G) and Electricity (H) patents consistently face the longest
          examination times, reflecting the complexity and volume of software and electronics
          applications. The financial crisis of 2008-09 did not reduce filing rates enough to
          ease the backlog, which continued growing until systemic reforms took effect.
        </p>
      </KeyInsight>

      <DataNote>
        Grant lag uses the difference between patent grant date and application filing date.
        Cross-domain analysis counts distinct CPC sections per patent (excluding section Y).
        International collaboration identifies patents with inventors in 2+ different countries. Examination duration is measured as the time from application filing date to patent grant date, aggregated by CPC section and 5-year period.
      </DataNote>

      <RelatedChapters currentChapter={8} />
      <ChapterNavigation currentChapter={8} />
    </div>
  );
}
