'use client';

import { useMemo, useState } from 'react';
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
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { PWBubbleScatter } from '@/components/charts/PWBubbleScatter';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
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
  DesignPatentTrend,
  DesignTopFiler,
  ClaimsAnalysis,
  ClaimsBySection,
  ClaimMonster,
  FirmExplorationYear,
  FirmExplorationScatter,
  FirmExplorationTrajectory,
  FirmLifecyclePoint,
  FirmAmbidexterityRecord,
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

  // E1, E2: Design patents and claims
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[]; top_filers: DesignTopFiler[] }>('company/design_patents.json');
  const { data: claimsData, loading: clL } = useChapterData<{ trends: ClaimsAnalysis[]; by_section: ClaimsBySection[]; claim_monsters: ClaimMonster[] }>('company/claims_analysis.json');

  // Exploration/exploitation data
  const { data: firmExploration, loading: feL } = useChapterData<Record<string, FirmExplorationYear[]>>('company/firm_exploration_scores.json');
  const { data: explScatter, loading: esL } = useChapterData<FirmExplorationScatter[]>('company/firm_exploration_scatter.json');
  const { data: explTrajectories, loading: etL } = useChapterData<Record<string, FirmExplorationTrajectory[]>>('company/firm_exploration_trajectories.json');
  const { data: lifecycleData, loading: lcL } = useChapterData<{ firms: Record<string, FirmLifecyclePoint[]>; system_average: FirmLifecyclePoint[] }>('company/firm_exploration_lifecycle.json');
  const { data: ambidexterity, loading: amL } = useChapterData<FirmAmbidexterityRecord[]>('company/firm_ambidexterity_quality.json');

  const [selectedExplFirm, setSelectedExplFirm] = useState<string>('IBM');

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

  const explCompanies = useMemo(() => firmExploration ? Object.keys(firmExploration).sort() : [], [firmExploration]);
  const selectedExplData = useMemo(() => firmExploration?.[selectedExplFirm] ?? [], [firmExploration, selectedExplFirm]);

  const explTrajPanels = useMemo(() => {
    if (!explTrajectories) return [];
    return Object.entries(explTrajectories).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.exploration_share })),
    }));
  }, [explTrajectories]);

  const lifecyclePanels = useMemo(() => {
    if (!lifecycleData?.firms) return [];
    return Object.entries(lifecycleData.firms).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.relative_year, y: d.mean_exploration, ref: d.system_mean })),
    }));
  }, [lifecycleData]);

  const explScatterData = useMemo(() => {
    if (!explScatter) return [];
    return explScatter.map(d => ({
      company: d.company,
      x: d.exploration_share,
      y: d.quality_premium,
      size: d.patent_count,
      section: d.primary_section,
    }));
  }, [explScatter]);

  const ambidexterityScatterData = useMemo(() => {
    if (!ambidexterity) return [];
    return ambidexterity.map(d => ({
      company: d.company,
      x: d.ambidexterity_index,
      y: d.blockbuster_rate,
      size: d.patent_count,
      section: 'G',
      window: d.window,
    }));
  }, [ambidexterity]);

  return (
    <div>
      <ChapterHeader
        number={8}
        title="Innovation Dynamics"
        subtitle="The tempo and trajectory of technological change"
      />

      <KeyFindings>
        <li><GlossaryTooltip term="grant lag">Grant lag</GlossaryTooltip> varies significantly by technology sector; software and electronics patents exhibit longer pendency times than mechanical inventions.</li>
        <li>Cross-domain innovation has intensified, with patents increasingly spanning multiple technology classifications.</li>
        <li>International collaboration on patents has grown steadily, particularly between the United States, Europe, and East Asia.</li>
        <li>Innovation velocity, as measured by the rate of knowledge diffusion through citations, appears to have accelerated in digital technology fields.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The tempo and trajectory of innovation have shifted in tandem: examination backlogs that pushed average pendency beyond 3.5 years in the late 2000s were subsequently reduced by USPTO hiring initiatives and the AIA reforms discussed in Patent Law &amp; Policy, yet technology-specific friction persists, with chemistry patents routinely requiring the longest examination durations. Simultaneously, the share of patents spanning three or more CPC sections rose from 21% to 41% of all grants between 1976 and 2020, and the proportion listing inventors from multiple countries climbed from roughly 2% to over 10%, together signaling that innovation is becoming both more interdisciplinary and more geographically distributed. Design patents have outpaced utility patent growth since the 2000s -- led by Samsung, Nike, and LG Electronics -- while an exploration/exploitation analysis reveals that most large filers devote fewer than 5% of their patents to genuinely new technology domains, underscoring the tension between incremental deepening and frontier search that the quality metrics in Patent Quality will further illuminate.
        </p>
      </aside>

      <Narrative>
        <p>
          Beyond the question of what is patented and by whom, the <StatCallout value="dynamics of innovation" /> --
          its speed, breadth, and collaborative nature -- reveal underlying structural patterns. The
          duration from application to grant, the degree of technological convergence across
          traditional boundaries, and the extent of international collaboration each illuminate
          distinct dimensions of the innovation process.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-dynamics-grant-lag-by-sector"
        subtitle="Average days from application filing to patent grant by WIPO technology sector across 5-year periods."
        title="Chemistry and Electrical Engineering Patents Exhibit the Longest Grant Lags, Exceeding 3.5 Years in the Late 2000s"
        caption="This chart displays the average number of days from application filing to patent grant, disaggregated by WIPO technology sector across 5-year periods. Chemistry and electrical engineering patents exhibit the longest pendency in the late 2000s, with both peaking above 1,300 days."
        loading={glL}
        insight="Technology-specific backlogs appear to reflect both the complexity of patent examination in certain fields and the USPTO's resource allocation decisions."
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
          The duration from application to grant varies by technology sector and has fluctuated
          considerably over the decades. Patent office backlogs, examination complexity,
          and policy reforms each contribute to observable shifts in the grant lag trajectory.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Grant lags reveal the institutional constraints on innovation. The late 2000s backlog
          elevated average pendency beyond 3.5 years; subsequent USPTO reforms reduced
          these durations. Chemistry and electrical engineering patents exhibit the longest
          examination periods in the late 2000s, a pattern consistent with the substantial volume and complexity of prior art in
          these fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Convergence" />

      <ChartContainer
        id="fig-innovation-dynamics-cross-domain"
        subtitle="Annual patent counts by number of CPC sections spanned (1, 2, or 3+), shown as a stacked area to illustrate growing cross-domain convergence."
        title="Multi-Section Patents Rose from 21% to 41% of All Grants (1976-2020), Indicating Increasing Technological Convergence"
        caption="This chart presents the number of patents classified in a single CPC section, two sections, or three or more sections (excluding Y), displayed as a stacked area. The proportion of patents spanning multiple sections has increased over time, with three-or-more-section patents exhibiting the most pronounced growth."
        loading={cdL}
        height={500}
        insight="The rising share of cross-domain innovation suggests that technological boundaries are increasingly permeable, with inventions more frequently occurring at the intersection of multiple fields."
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
          The share of patents spanning multiple <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> sections has increased over time, indicating
          growing <StatCallout value="technological convergence" />. Contemporary inventions
          increasingly draw on knowledge from multiple domains, a characteristic of the digital era
          in which software, electronics, and traditional engineering fields intersect.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The rise of multi-domain patents is consistent with a structural shift in the nature of
          invention. Technologies such as autonomous vehicles, wearable health monitors, and
          smart materials inherently span traditional boundaries between physics, chemistry,
          and engineering, conferring an advantage upon organizations capable of integrating diverse expertise.
        </p>
      </KeyInsight>

      <SectionDivider label="Global Collaboration" />

      <ChartContainer
        id="fig-innovation-dynamics-intl-collaboration"
        subtitle="Annual count and percentage of patents listing inventors from two or more countries, tracking the growth of cross-border co-invention."
        title="International Co-Invention Increased from Approximately 2% in the 1980s to 10% of All Patents"
        caption="This chart displays the annual count and percentage of patents listing inventors from two or more countries. International co-invention has increased from approximately 2% of all patents in the 1980s to over 10% in recent years, with the most rapid growth occurring during the 2000s."
        loading={icL}
        insight="The growth of international co-invention is consistent with both the globalization of corporate R&D and the increasing mobility of scientific talent."
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
          The growth of international collaboration in patenting is consistent with the globalization
          of corporate R&D. Multinational firms increasingly distribute their research
          activities across multiple countries, utilizing local talent pools and regulatory
          environments. The result is an expanding network of cross-border co-invention that
          transcends traditional national innovation systems.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          International collaboration has increased from approximately 2% of patents in the 1980s to 10%
          in recent years. This trend is consistent with the expansion of multinational R&D operations, global talent mobility,
          and the increasing feasibility of remote scientific collaboration. The rate of growth accelerated
          in the 2000s as communication technology reduced the transaction costs of cross-border teamwork.
        </p>
      </KeyInsight>

      <SectionDivider label="Corporate Technology Portfolios" />

      {corpDivLate.length > 0 && (
        <ChartContainer
          id="fig-innovation-dynamics-corp-diversification"
          subtitle="Distribution of patent grants across CPC technology sections for the ten largest assignees (2001-2025), shown as stacked bars."
          title="IBM (88,600 G-Section Patents) and Samsung (79,400 H-Section Patents) Maintain the Most Diversified Technology Portfolios Among the Top Ten Patent Holders (2001-2025)"
          caption="This chart displays the distribution of patent grants across CPC technology sections for the ten largest patent holders in the 2001-2025 period. IBM and Samsung exhibit the broadest portfolio diversification, spanning physics, electricity, and chemistry, whereas firms such as Intel concentrate in semiconductor-related classifications."
          loading={cpL}
          height={650}
          insight="Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings, as the most persistent leaders maintain diversified technology portfolios."
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
          The technology portfolios of major patent holders illustrate how firms diversify their
          innovation across fields. IBM and Samsung maintain broadly diversified portfolios spanning
          physics, electricity, and chemistry, whereas firms such as Intel concentrate predominantly in
          semiconductor-related physics and electricity classifications.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings.
          The most persistent leaders -- IBM, Samsung, Canon -- maintain diversified technology
          portfolios, whereas more specialized firms tend to rise and fall with the trajectories
          of their core technology domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Velocity" />

      <ChartContainer
        id="fig-innovation-dynamics-velocity"
        subtitle="Year-over-year percentage change in patent grants by WIPO technology sector, revealing synchronized cyclical patterns."
        title="Patenting Growth Rates Are Highly Correlated Across Five Sectors, with Synchronized Declines of 7-18% During the 2001 and 2008 Downturns"
        caption="This chart presents the annual percentage change in patent grants by WIPO technology sector. All sectors exhibit synchronized responses to macroeconomic conditions, though electrical engineering has demonstrated consistently stronger growth momentum since the 1990s."
        loading={vlL}
        insight="The correlation of growth rates across sectors suggests that macroeconomic conditions and patent policy exert stronger influence on patenting rates than sector-specific technology cycles."
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
          tend to co-move in response to macroeconomic conditions and patent policy changes,
          though electrical engineering has consistently exhibited stronger growth momentum since the 1990s.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Innovation velocity is highly correlated across sectors, suggesting that macroeconomic
          conditions and patent policy are stronger determinants of patenting rates than sector-specific
          technology cycles. The synchronized declines during the early 2000s dot-com contraction and the 2008
          financial crisis are particularly instructive.
        </p>
      </KeyInsight>

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
        id="fig-innovation-dynamics-friction-map"
        subtitle="Median time from application filing to patent grant by CPC section and 5-year period, measuring technology-specific examination friction."
        title="Chemistry (C) Patents Consistently Exhibit the Longest Examination Durations, with a Median of 1,278 Days in the 2010-2014 Period"
        caption="This chart presents the median time from application filing to patent grant, disaggregated by CPC section and 5-year period. Chemistry and Human Necessities patents consistently exhibit the longest pendency, with all technology areas peaking around 2010-2014 before declining following USPTO reforms."
        loading={fmL}
        insight="Examination duration patterns reveal the institutional constraints that shape innovation timelines, with technology-specific backlogs reflecting the USPTO's resource allocation across its technology centers."
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
          Examination duration increased substantially across all technology areas through
          the 2000s, peaking in the 2010-2014 period as the USPTO contended with a considerable backlog.
          The AIA reforms and USPTO hiring initiatives contributed to reduced pendency in subsequent
          years. Chemistry (C) patents consistently exhibit the longest
          examination durations, a pattern consistent with the complexity of chemical and biomedical
          examination. The financial crisis of 2008-2009 did not reduce filing rates sufficiently to
          alleviate the backlog, which continued growing until systemic reforms took effect.
        </p>
      </KeyInsight>

      <SectionDivider label="Design vs. Utility Patents" />

      <Narrative>
        <p>
          Whereas utility patents protect functional inventions, <GlossaryTooltip term="design patent">design patents</GlossaryTooltip> protect
          ornamental appearance. The balance between these two types reflects shifting
          innovation strategies -- from purely engineering-oriented approaches to <StatCallout value="design-driven innovation" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-dynamics-design-trends"
        subtitle="Annual utility and design patent counts with design share on the right axis, tracking the shift toward design-driven innovation."
        title="Design Patent Share Grew from 6% in the Early 1980s to 13% by 2024, Outpacing Utility Patent Growth"
        caption="This chart displays annual counts of utility and design patents, with design patent share on the right axis. Design patents have exhibited higher growth rates than utility patents since the 2000s, driven by consumer electronics, automotive design, and fashion industries."
        insight="The increasing share of design patents suggests a structural shift in corporate innovation strategy toward design-driven product differentiation, with Samsung, Nike, and LG Electronics among the leading filers."
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
            yLabel="Patent Count"
            rightYLabel="Design Share (%)"
            rightYFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-innovation-dynamics-design-top-filers"
        subtitle="Organizations ranked by total design patents granted, showing which firms lead in design-driven intellectual property."
        title="Samsung (13,094), Nike (9,189), and LG (6,720) Lead Design Patent Filings Among Consumer Electronics and Automotive Firms"
        caption="This chart displays the organizations with the most design patents granted across all years. Consumer electronics manufacturers and automotive companies account for the majority of top design patent filers."
        loading={deL}
        height={500}
      >
        {designData?.top_filers ? (
          <PWBarChart
            data={designData.top_filers.slice(0, 20)}
            xKey="company"
            bars={[{ key: 'design_patents', name: 'Design Patents', color: CHART_COLORS[3] }]}
            layout="vertical"
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Patent Claims Analysis" />

      <Narrative>
        <p>
          The number of claims in a patent defines the scope of legal protection. Trends in
          claim counts reveal how patent strategy has evolved -- from relatively concise early
          patents to the <StatCallout value="claim-intensive patents" /> of the contemporary era.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-dynamics-claims-trends"
        subtitle="Median and 90th percentile claim counts for utility patents by grant year, measuring the evolution of patent scope over time."
        title="Median Claims Doubled from 8 to 18 (1976-2025) While the 90th Percentile Declined from Its Peak of 35 in 2005 to 21 by 2025"
        caption="This chart displays the median and 90th percentile claim counts for utility patents by grant year. The widening gap between median and 90th percentile values indicates that claim inflation is concentrated in the upper tail of the distribution, particularly in software and biotechnology patents."
        insight="The increase in claim counts is consistent with more sophisticated patent drafting strategies and broader claim scopes, particularly in software and biotechnology fields."
        loading={clL}
      >
        {claimsData?.trends ? (
          <PWLineChart
            data={claimsData.trends}
            xKey="year"
            lines={[
              { key: 'median_claims', name: 'Median Claims', color: CHART_COLORS[0] },
              { key: 'p90_claims', name: '90th Percentile', color: CHART_COLORS[3] },
            ]}
            yLabel="Number of Claims"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-innovation-dynamics-claims-by-section"
        subtitle="Median claim count by CPC technology section and decade, showing convergence in patent drafting practices across fields."
        title="Claim Counts Have Converged Across Technology Areas, with Physics (G) Leading at a Median of 19 and Electricity (H) at 18 in the 2020s"
        caption="This chart displays the median claim count by CPC section and decade. Claim counts have increased across all technology areas, with convergence in recent decades suggesting a broad trend toward more detailed patent drafting regardless of field."
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

      <SectionDivider label="Exploration and Exploitation" />

      <Narrative>
        <p>
          The exploration/exploitation framework (March, 1991) provides a lens for examining
          whether firms are entering new technology domains (exploration) or deepening established
          ones (exploitation). Each patent from a top-50 assignee is scored on three indicators:
          technology newness (whether the firm has prior presence in the patent&apos;s CPC subclass),
          citation newness (whether backward citations point to unfamiliar technology areas),
          and external knowledge sourcing (the inverse of self-citation rate). The composite
          exploration score averages these three indicators on a 0–1 scale.
        </p>
      </Narrative>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a company:</div>
        <PWCompanySelector
          companies={explCompanies}
          selected={selectedExplFirm}
          onSelect={setSelectedExplFirm}
        />
      </div>

      <ChartContainer
        id="fig-innovation-dynamics-exploration-score"
        subtitle="Composite exploration score and its three components (technology newness, citation newness, external sourcing) for the selected firm by year."
        title={`${selectedExplFirm}'s Exploration Score Averages ${selectedExplData.length > 0 ? (selectedExplData.reduce((s, d) => s + d.mean_exploration, 0) / selectedExplData.length).toFixed(2) : '—'} Across ${selectedExplData.length} Years of Patenting`}
        caption={`Mean exploration score and its three component indicators for ${selectedExplFirm} by year. The composite score (blue) averages technology newness, citation newness, and external knowledge sourcing (1 - self-citation rate). Higher values indicate more exploratory behavior.`}
        insight="Decomposing the composite score into its three indicators reveals which dimension of exploration is driving changes over time — whether the firm is entering new technology areas, citing unfamiliar prior art, or drawing on external knowledge."
        loading={feL}
        height={350}
        wide
      >
        {selectedExplData.length > 0 ? (
          <PWLineChart
            data={selectedExplData}
            xKey="year"
            lines={[
              { key: 'mean_exploration', name: 'Composite Score', color: CHART_COLORS[0] },
              { key: 'mean_tech_newness', name: 'Technology Newness', color: CHART_COLORS[1] },
              { key: 'mean_citation_newness', name: 'Citation Newness', color: CHART_COLORS[2] },
              { key: 'mean_external_score', name: 'External Sourcing', color: CHART_COLORS[5] },
            ]}
            yLabel="Score (0–1)"
            yFormatter={(v) => v.toFixed(2)}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-innovation-dynamics-exploration-share"
        subtitle="Share of the selected firm's annual patents classified as exploratory, ambidextrous, or exploitative, shown as a 100% stacked area."
        title={`${selectedExplFirm} Devotes ${selectedExplData.length > 0 ? (selectedExplData[selectedExplData.length - 1].exploitation_share * 100).toFixed(0) : '—'}% of Recent Patents to Exploitation Over Exploration`}
        caption={`Share of ${selectedExplFirm}'s annual patents classified as exploratory (score > 0.6), exploitative (score < 0.4), or ambidextrous (0.4–0.6). Dashed gray = system-wide mean exploration score.`}
        loading={feL}
        height={300}
        wide
      >
        {selectedExplData.length > 0 ? (
          <PWAreaChart
            data={selectedExplData.map(d => ({
              year: d.year,
              Exploratory: +(d.exploration_share * 100).toFixed(1),
              Ambidextrous: +(d.ambidexterity_share * 100).toFixed(1),
              Exploitative: +(d.exploitation_share * 100).toFixed(1),
            }))}
            xKey="year"
            areas={[
              { key: 'Exploratory', name: 'Exploratory (>0.6)', color: CHART_COLORS[0] },
              { key: 'Ambidextrous', name: 'Ambidextrous (0.4–0.6)', color: CHART_COLORS[2] },
              { key: 'Exploitative', name: 'Exploitative (<0.4)', color: CHART_COLORS[3] },
            ]}
            stackedPercent
            yLabel="Share (%)"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-innovation-dynamics-exploration-trajectories"
        subtitle="Exploration share (% of exploratory patents) over time for 20 major filers, displayed as small multiples sorted by most recent share."
        title="11 of 20 Major Filers Keep Exploration Below 5%, with a Median Share of 3.3%"
        caption="Each panel shows one firm's exploration share (% of patents classified as exploratory) over time. Firms are sorted by most recent exploration share, descending. Exploration is defined as a composite score above 0.6 based on technology newness, citation newness, and external knowledge sourcing."
        insight="Most large patent filers maintain exploration shares below 5%, indicating that the vast majority of their patenting activity deepens established technology domains rather than entering new ones."
        loading={etL}
        height={500}
        wide
      >
        <PWSmallMultiples
          panels={explTrajPanels}
          xLabel="Year"
          yLabel="Exploration %"
          yFormatter={(v) => `${v.toFixed(0)}%`}
          columns={4}
        />
      </ChartContainer>

      <SectionDivider label="Returns to Technological Exploration" />

      <Narrative>
        <p>
          The central analytical question is whether exploration produces higher-quality patents.
          For each firm in the most recent complete decade, the scatter below plots exploration
          share against the exploration quality premium — the difference in median 5-year forward
          citations between exploratory and exploitative patents. Firms in the upper-right quadrant
          are &ldquo;rewarded explorers&rdquo; whose forays into new domains yield higher-impact inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-dynamics-exploration-quality"
        subtitle="Exploration share vs. quality premium (median citation difference) for top-50 assignees, with bubble size proportional to patent count."
        title="Only 4 of 49 Top Filers Show a Positive Exploration Quality Premium (2010–2019)"
        caption="Each bubble represents one top-50 assignee. X-axis: share of patents classified as exploratory. Y-axis: exploration quality premium (median citations of exploratory patents minus median citations of exploitative patents). Bubble size: total patents. Color: primary CPC section. Only firms with ≥20 exploratory and ≥20 exploitative patents shown."
        loading={esL}
        height={450}
        wide
      >
        <PWBubbleScatter
          data={explScatterData}
          xLabel="Exploration Share (%)"
          yLabel="Quality Premium (citations)"
          xFormatter={(v) => `${v.toFixed(1)}%`}
          yFormatter={(v) => v.toFixed(1)}
          xMidline={3}
          yMidline={0}
        />
      </ChartContainer>

      <SectionDivider label="Exploration Decay Curves" />

      <Narrative>
        <p>
          When a firm enters a new technology area, does its exploration score in that area
          decline over time as it transitions from search to exploitation? The decay curves below
          track the mean exploration score by years since entry, averaged across all technology
          subclasses in which each firm holds at least 20 patents.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-dynamics-exploration-decay"
        subtitle="Average exploration score by years since entry into a new CPC subclass, shown as small multiples with system-wide average as reference."
        title="New-Subclass Exploration Scores Decay from 1.0 to 0.087 Within 5 Years of Entry"
        caption="Each panel shows one firm's average exploration score by years since entry into a new CPC subclass. Dashed gray = system-wide average. The typical firm's exploration score falls sharply within 5 years, but the rate of decay varies considerably across organizations."
        insight="On average, a firm's exploration score in a newly entered technology subclass declines from 1.0 at entry to below 0.1 within 5 years. Some firms maintain higher exploration scores for longer periods, suggesting a more sustained period of search and experimentation."
        loading={lcL}
        height={500}
        wide
      >
        <PWSmallMultiples
          panels={lifecyclePanels}
          xLabel="Years Since Entry"
          yLabel="Score"
          yFormatter={(v) => v.toFixed(2)}
          columns={5}
          color={CHART_COLORS[4]}
        />
      </ChartContainer>

      <SectionDivider label="Ambidexterity and Performance" />

      <Narrative>
        <p>
          Do firms that maintain a balance between exploration and exploitation produce
          higher-quality patent portfolios? The ambidexterity index (1 minus the absolute
          difference between exploration and exploitation shares) ranges from 0 (pure explorer or
          exploiter) to 1 (perfect 50/50 balance). The scatter below plots this index against
          the firm&apos;s blockbuster rate for each 5-year window since 1980.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-dynamics-ambidexterity"
        subtitle="Ambidexterity index vs. blockbuster rate for top-50 assignees across 5-year windows, measuring whether balanced firms produce more high-impact patents."
        title="Balanced Firms Average a 2.51% Blockbuster Rate, 2.3x Higher Than Specialized Firms"
        caption="Each dot represents one firm in one 5-year window (top 50 assignees, 1980–2019). X-axis: ambidexterity index. Y-axis: blockbuster rate (% of patents in top 1% of year × CPC cohort). Only firm-periods with ≥50 patents shown."
        loading={amL}
        height={400}
        wide
      >
        {ambidexterityScatterData.length > 0 ? (
          <PWBubbleScatter
            data={ambidexterityScatterData}
            xLabel="Ambidexterity Index"
            yLabel="Blockbuster Rate (%)"
            xFormatter={(v) => v.toFixed(2)}
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The exploration/exploitation analysis reveals that most large patent filers are overwhelmingly
          exploitative, with exploration shares typically below 5%. This is consistent with the theoretical
          prediction that large, established organizations tend to favor exploitation of existing
          competencies over exploration of new domains. The exploration decay curves show that even when
          firms do enter new technology areas, they transition to exploitation rapidly — typically within
          5 years of entry.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the dynamics of innovation -- its speed, convergence, collaborative nature, and the balance between exploration and exploitation -- the subsequent chapter addresses the measurement of patent quality and impact.
        Understanding velocity, scope, and strategic orientation establishes the foundation for a central question: whether an increase in patent volume corresponds to an increase in patent quality.
      </Narrative>

      <DataNote>
        Grant lag uses the difference between patent grant date and application filing date.
        Cross-domain analysis counts distinct CPC sections per patent (excluding section Y).
        International collaboration identifies patents with inventors in 2+ different countries. Examination duration is measured as the time from application filing date to patent grant date, aggregated by CPC section and 5-year period. Design patent analysis includes all patent types. Claims analysis uses the patent_num_claims field from g_patent for utility patents only.
      </DataNote>

      <RelatedChapters currentChapter={8} />
      <ChapterNavigation currentChapter={8} />
    </div>
  );
}
