'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLollipopChart } from '@/components/charts/PWLollipopChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import dynamic from 'next/dynamic';
const PWChoroplethMap = dynamic(() => import('@/components/charts/PWChoroplethMap').then(m => ({ default: m.PWChoroplethMap })), { ssr: false });
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import { RankingTable } from '@/components/chapter/RankingTable';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import Link from 'next/link';
import { DescriptiveGapNote } from '@/components/chapter/DescriptiveGapNote';
import { ConcentrationPanel } from '@/components/chapter/ConcentrationPanel';
import type { StateSummary, StateSpecialization, StatePerYear, TopCity, RegionalSpecialization } from '@/lib/types';

export default function GeoDomesticChapter() {
  // Section A: State-Level (Static)
  const { data: states, loading: stL } = useChapterData<StateSummary[]>('chapter4/us_states_summary.json');
  const { data: spec, loading: spL } = useChapterData<StateSpecialization[]>('chapter4/state_specialization.json');

  // Section B: State-Level (Dynamic)
  const { data: statesPerYear, loading: spyL } = useChapterData<StatePerYear[]>('chapter4/us_states_per_year.json');

  // Section C: City-Level (Static)
  const { data: cities, loading: ciL } = useChapterData<TopCity[]>('chapter4/top_cities.json');
  const { data: regionalSpec } = useChapterData<RegionalSpecialization[]>('chapter4/regional_specialization.json');

  // Quality metrics
  const { data: qualityByState, loading: qsL } = useChapterData<any[]>('computed/quality_by_state.json');
  const { data: qualityByCity, loading: qcL } = useChapterData<any[]>('computed/quality_by_city.json');
  const { data: topStatesRank } = useChapterData<string[]>('computed/top_states.json');
  const { data: topCitiesRank } = useChapterData<string[]>('computed/top_cities.json');

  // Section D: County-Level and Innovation Clusters (Analysis 30, 31)
  const { data: topCounties, loading: tcL } = useChapterData<any[]>('chapter18/top_counties.json');
  const { data: countyConcentration, loading: ccL } = useChapterData<any[]>('chapter18/county_concentration_over_time.json');

  // ── Section A derived data ──

  const topStates = useMemo(() => {
    if (!states) return [];
    return states.map((d) => ({
      ...d,
      label: d.state,
    }));
  }, [states]);

  const specByState = useMemo(() => {
    if (!spec) return [];
    const sKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');
    const stateMap: Record<string, any> = {};
    spec.forEach((d) => {
      if (!stateMap[d.state]) stateMap[d.state] = { state: d.state, total: 0 };
      stateMap[d.state][d.section] = d.count;
      stateMap[d.state].total += d.count;
    });
    // Convert to percentages for 100% stacked bar
    return Object.values(stateMap)
      .sort((a: any, b: any) => b.total - a.total)
      .map((row: any) => {
        const pctRow: any = { state: row.state };
        sKeys.forEach((key) => {
          pctRow[key] = row.total > 0 ? +((100 * (row[key] || 0)) / row.total).toFixed(1) : 0;
        });
        return pctRow;
      });
  }, [spec]);

  const statePatentMap = useMemo(() => {
    if (!states) return {};
    const map: Record<string, number> = {};
    states.forEach((d) => { map[d.state] = d.total_patents; });
    return map;
  }, [states]);

  // ── Section B derived data ──

  const { stateTimePivot, stateTimeNames } = useMemo(() => {
    if (!statesPerYear) return { stateTimePivot: [], stateTimeNames: [] };
    const totals: Record<string, number> = {};
    statesPerYear.forEach((d) => { totals[d.state] = (totals[d.state] || 0) + d.count; });
    const topStateNames = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([s]) => s);
    const years = [...new Set(statesPerYear.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: any = { year };
      statesPerYear.filter((d) => d.year === year && topStateNames.includes(d.state))
        .forEach((d) => { row[d.state] = d.count; });
      return row;
    });
    return { stateTimePivot: pivoted, stateTimeNames: topStateNames };
  }, [statesPerYear]);

  // ── Section C derived data ──

  const topCities = useMemo(() => {
    if (!cities) return [];
    return cities.map((d) => ({
      ...d,
      label: `${d.city}, ${d.state}`,
    }));
  }, [cities]);

  const topSpecializations = useMemo(() => {
    if (!regionalSpec) return [];
    return [...regionalSpec]
      .filter(d => d.location_quotient >= 1.5)
      .sort((a, b) => b.location_quotient - a.location_quotient)
      .slice(0, 30);
  }, [regionalSpec]);

  // ── Section D derived data ──

  const topCountiesChart = useMemo(() => {
    if (!topCounties) return [];
    return topCounties.slice(0, 20).map((d: any) => ({
      ...d,
      label: d.county_state,
    }));
  }, [topCounties]);

  const topCountiesTotal = useMemo(() => {
    if (!topCounties) return 0;
    return topCounties.reduce((sum: number, d: any) => sum + d.patent_count, 0);
  }, [topCounties]);

  const top5CountiesShare = useMemo(() => {
    if (!topCounties || topCountiesTotal === 0) return 0;
    const top5Sum = topCounties.slice(0, 5).reduce((sum: number, d: any) => sum + d.patent_count, 0);
    return +((top5Sum / topCountiesTotal) * 100).toFixed(1);
  }, [topCounties, topCountiesTotal]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');
  const topStateName = states?.[0]?.state ?? 'California';

  // ── Quality metric helpers ──

  const pivotData = (raw: any[] | null, metric: string) => {
    if (!raw) return [];
    const byYear: Record<number, any> = {};
    for (const r of raw) {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.group] = r[metric];
    }
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  };

  const stateColors = [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2], CHART_COLORS[3], CHART_COLORS[4]];
  const topStatesForChart = topStatesRank?.slice(0, 5) ?? [];
  const stateLines = topStatesForChart.map((s: string, i: number) => ({ key: s, name: s, color: stateColors[i] }));

  const cityColors = [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2], CHART_COLORS[3], CHART_COLORS[4]];
  const topCitiesForChart = topCitiesRank?.slice(0, 5) ?? [];
  const cityLines = topCitiesForChart.map((c: string, i: number) => ({ key: c, name: c, color: cityColors[i] }));

  // Citation truncation normalization for forward-citation charts
  const stateNorm = useCitationNormalization({
    data: qualityByState,
    xKey: 'year',
    citationKeys: ['avg_forward_citations'],
    yLabel: 'Average Forward Citations',
  });
  const cityNorm = useCitationNormalization({
    data: qualityByCity,
    xKey: 'year',
    citationKeys: ['avg_forward_citations'],
    yLabel: 'Average Forward Citations',
  });

  return (
    <div>
      <ChapterHeader
        number={18}
        title="Domestic Geography"
        subtitle="State-level and city-level patent concentration and quality"
      />
      <MeasurementSidebar slug="geo-domestic" />

      <KeyFindings>
        <li>Patent activity is disproportionately concentrated geographically: the top five US states (California, Texas, New York, Massachusetts, and Michigan) account for 46% of all utility patent grants.</li>
        <li>California alone accounts for 23.6% of all US utility patent grants, producing more patents (992,708) than the bottom 30 states and territories combined (314,664).</li>
        <li>States exhibit distinctive technology specialization profiles: Michigan devotes 20.1% of its patents to Mechanical Engineering compared to California&apos;s 65.1% concentration in Physics and Electricity.</li>
        <li>City-level data reveal even more pronounced geographic concentration, with San Jose (96,068), San Diego (70,186), and Austin (53,595) leading all US cities in total patent output.</li>
        <li>California&apos;s patent output has diverged sharply from other leading states, reaching 4.0x Texas by 2024, reflecting the accelerating growth of the Silicon Valley ecosystem.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Patent activity concentrates in a handful of coastal states, with California alone producing 992,708 patents — exceeding the bottom 30 states and territories combined. The top five states account for 46% of all US patent grants, and each has developed distinctive technology specialization profiles shaped by regional industry, universities, and talent pools. City-level analysis reveals even more extreme innovation concentration, with San Jose, San Diego, and Austin leading all US cities. California&apos;s patent output has diverged sharply from other states since the 1990s, reaching 4.0x Texas by 2024.
        </p>
      </aside>

      <Narrative>
        <p>
          Innovation activity is not evenly distributed across geographic space. Within the United States, a small number of states and metropolitan areas account for the majority of patent output. This chapter examines the domestic geography of innovation at both the state and city levels, including cumulative rankings, technology specialization profiles, temporal trends, and regional quality metrics.
        </p>
        <p>
          The concentration documented here is consistent with agglomeration mechanisms proposed in the literature (e.g., Marshall 1890; Krugman 1991), where the co-location of technology firms, research universities, and venture capital in a small number of innovation ecosystems may generate self-reinforcing dynamics. These patterns of geographic clustering have strengthened rather than diminished over the digital era, suggesting that agglomeration forces continue to shape the geography of innovation despite advances in remote collaboration.
        </p>
      </Narrative>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section A: State-Level (Static)                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="State and Regional Patterns" />

      <Narrative>
        <p>
          Within the United States, patent activity concentrates in a small number of states and metropolitan areas. The following sections examine this domestic geography at the state level, including cumulative rankings and technology specialization patterns.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-geography-state-choropleth"
        subtitle="Total utility patents by primary inventor state (1976–2025), displayed as a choropleth map with darker shading for higher counts."
        title="Patent Activity Concentrates on the Coasts, with California's 992,708 Patents Exceeding the Bottom 30 States and Territories Combined (314,664)"
        caption="The choropleth map displays total utility patents by primary inventor state from 1976 to 2025, with darker shading indicating higher patent counts. The coastal concentration is pronounced, with California, New York, and Texas exhibiting the highest totals."
        insight="The coastal concentration of patent activity is consistent with agglomeration economies, where the co-location of technology firms, research universities, and venture capital may create self-reinforcing dynamics (Marshall 1890; Krugman 1991)."
        loading={stL}
        height={650}
      >
        <PWChoroplethMap data={statePatentMap} valueLabel="Patents" />
      </ChartContainer>

      <KeyInsight>
        <p>
          Innovation activity is disproportionately concentrated in coastal states. California alone accounts for more
          patents than the bottom 30 states and territories combined, reflecting the concentration of semiconductor,
          software, and biotechnology firms across the state&apos;s major metropolitan areas.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-geography-state-rankings"
        subtitle="US states ranked by total utility patents from primary inventors (1976–2025)."
        title="California Accounts for Nearly One-Quarter (23.6%) of All US Patent Grants, 1976–2025"
        caption="The figure ranks US states by total utility patents attributed to primary inventors from 1976 to 2025. California leads by a substantial margin, followed by Texas, New York, Massachusetts, and Michigan."
        insight="California accounts for nearly one-quarter (23.6%) of all US patent activity, a concentration reflecting the Silicon Valley ecosystem of venture capital, research universities, and technology firms."
        loading={stL}
        height={1200}
      >
        <PWLollipopChart
          data={topStates}
          xKey="label"
          valueKey="total_patents"
          valueName="Total Patents"
          color={CHART_COLORS[0]}
        />
      </ChartContainer>

      <RankingTable
        title="View top states as a data table"
        headers={['State', 'Total Patents']}
        rows={(states ?? []).slice(0, 15).map(d => [d.state, d.total_patents])}
        caption="Top 15 US states by total utility patents, 1976–2025. Source: PatentsView."
      />

      <Narrative>
        <p>
          California, home to Silicon Valley, accounts for more US patents than
          any other state, with <StatCallout value={topStateName} /> leading by a substantial margin. Texas, New York, Massachusetts, and
          Michigan round out the top five. This concentration reflects the
          co-location of technology companies and research universities in regions of concentrated inventive activity.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The top five states (California, Texas, New York, Massachusetts, and Michigan) account
          for 46% of all US patents. This pronounced concentration reflects the self-reinforcing
          nature of innovation clusters: skilled workers, venture capital, research
          universities, and corporate research laboratories co-locate, creating ecosystems that are difficult
          for other regions to replicate.
        </p>
      </KeyInsight>

      <ConcentrationPanel outcome="Patent Grants" entity="States" top1={23.6} top5={46.0} gini={0.731} top1Label="Top 1 State Share" top5Label="Top 5 States Share" />

      <DescriptiveGapNote variant="domestic" />

      <SectionDivider label="Technology Specialization" />

      {specByState.length > 0 && (
        <ChartContainer
          id="fig-geography-state-specialization"
          subtitle="CPC technology section distribution by state, shown as 100% stacked bars to reveal distinctive regional specialization patterns."
          title="States Exhibit Distinctive Technology Profiles: Michigan Devotes 20.1% to Mechanical Engineering versus California's 65.1% in Physics and Electricity"
          caption="The figure displays the CPC technology section distribution for all states by total patents, with each bar summing to 100%. States with pharmaceutical hubs show elevated Chemistry shares, while technology-oriented states concentrate in Electricity and Physics."
          insight="Geographic concentration of innovation is associated with self-reinforcing patterns, as talent, capital, and knowledge spillovers cluster in established hubs that develop distinctive technology specializations aligned with regional industry structures."
          loading={spL}
          height={1200}
        >
          <PWBarChart
            data={specByState}
            xKey="state"
            bars={sectionKeys.map((key) => ({
              key,
              name: `${key}: ${CPC_SECTION_NAMES[key]}`,
              color: CPC_SECTION_COLORS[key],
            }))}
            layout="vertical"
            stacked
            yLabel="Share (%)"
            yFormatter={(v) => `${Number(v).toFixed(1)}%`}
            xDomain={[0, 100]}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          State technology specialization reflects regional industrial strengths. States with
          major pharmaceutical hubs (particularly New Jersey and Delaware) exhibit higher Chemistry shares,
          while traditional manufacturing states demonstrate stronger Mechanical Engineering concentrations. California
          and Washington show elevated Electricity and Physics shares, reflecting
          the influence of Silicon Valley and the Pacific Northwest technology corridor.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section B: State-Level (Dynamic)                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="State Temporal Trends" />

      {stateTimePivot.length > 0 && (
        <ChartContainer
          id="fig-geography-state-trends"
          subtitle="Annual patent grants for the top 10 states by total output, showing diverging trajectories over time."
          title="California's Patent Output Has Diverged Sharply from Other Leading States, Reaching 4.0x Texas by 2024"
          caption="The figure displays annual patent grants for the 10 leading states by total output from 1976 to 2025. California exhibits an accelerating divergence from the second-ranked state beginning in the mid-1990s, with the gap widening in each subsequent decade."
          insight="California's accelerating divergence from other states since the 1990s is consistent with patterns described in the agglomeration economics literature, though the specific mechanisms driving this concentration are not directly testable from patent data alone."
          loading={spyL}
        >
          <PWLineChart
            data={stateTimePivot}
            xKey="year"
            lines={stateTimeNames.map((name, i) => ({
              key: name,
              name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            yLabel="Number of Patents"
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The time-series trajectories of state-level patent output reveal divergent growth
          patterns. California&apos;s patent output has increased at a substantially faster rate
          than that of other states since the 1990s, reflecting the expansion of Silicon Valley and
          the broader California technology ecosystem. Texas and Washington have also
          demonstrated strong growth, reflecting the emergence of technology clusters
          in Austin, Dallas, and Seattle.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section B-ext: Quality Metrics — By US State                      */}
      {/* Data: computed/quality_by_state.json                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Quality Metrics — By US State" />

      <Narrative>
        <p>
          Beyond patent volume, states differ systematically in the quality characteristics of their patent output. The following charts compare the top US states across four quality dimensions over time, revealing how regional innovation ecosystems produce patents with distinctive quality profiles.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-geography-state-forward-citations"
        subtitle="Average forward citations per patent for the top 5 states by total output, 1976–2025."
        title="California and Massachusetts Patents Attract More Forward Citations, Consistent With Higher Downstream Impact"
        caption="Average forward citations per patent by year for the five leading US states. Higher values indicate greater downstream influence on subsequent inventions."
        insight="Forward citation rates vary meaningfully across states, suggesting that geographic ecosystems differ not only in the volume but also in the downstream impact of their patent output."
        loading={qsL}
        height={400}
        controls={stateNorm.controls}
      >
        <PWLineChart
          data={pivotData(stateNorm.data, 'avg_forward_citations')}
          xKey="year"
          lines={stateLines}
          yLabel={stateNorm.yLabel}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          truncationYear={2018}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-geography-state-claims"
        subtitle="Average number of claims per patent for the top 5 states by total output, 1976–2025."
        title="Claim Counts Have Risen Across All Leading States, with Texas and California Leading the Expansion"
        caption="Average number of claims per patent by year for the five leading US states. Rising claim counts across all states reflect a system-wide trend toward broader patent scope."
        insight="The secular increase in claim counts is a system-wide phenomenon, but leading innovation states tend to file patents with modestly higher claim counts, consistent with more complex inventions."
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByState, 'avg_num_claims')}
          xKey="year"
          lines={stateLines}
          yLabel="Average Claims"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-geography-state-originality"
        subtitle="Average originality score for the top 5 states by total output, 1976–2025."
        title="Originality Scores Converge Across Leading States, Suggesting Increasingly Interdisciplinary Innovation"
        caption="Average originality score per patent by year for the five leading US states. Originality measures the breadth of technology classes cited by each patent."
        insight="Rising originality scores across all leading states indicate that innovation is becoming more interdisciplinary, drawing on increasingly diverse prior art."
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByState, 'avg_originality')}
          xKey="year"
          lines={stateLines}
          yLabel="Average Originality"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-geography-state-grant-lag"
        subtitle="Average grant lag in days for the top 5 states by total output, 1976–2025."
        title="Grant Lag Varies Modestly Across States, Tracking USPTO Examination Capacity Rather Than Regional Differences"
        caption="Average grant lag (filing to issue, in days) by year for the five leading US states. Grant lag is driven primarily by USPTO capacity and technology complexity rather than inventor geography."
        insight="The relatively uniform grant lag across states indicates that examination delays are driven primarily by USPTO capacity constraints and technology complexity rather than by geographic factors."
        loading={qsL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByState, 'avg_grant_lag_days')}
          xKey="year"
          lines={stateLines}
          yLabel="Average Grant Lag (Days)"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section C: City-Level (Static)                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="City-Level Rankings" />

      <Narrative>
        <p>
          Moving from the state level to the city level reveals even more pronounced concentration patterns. The following analyses examine city-level rankings, the geographic diffusion of emerging technologies across metropolitan areas, and the distinctive specialization profiles that characterize individual cities.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-geography-city-rankings"
        subtitle="US cities ranked by total utility patents from primary inventors (1976–2025), revealing finer-grained concentration patterns."
        title="San Jose (96,068), San Diego (70,186), and Austin (53,595) Lead All US Cities in Total Patent Output"
        caption="The figure ranks US cities by total utility patents attributed to primary inventors from 1976 to 2025. City-level data reveal concentration patterns that are even more pronounced than state-level figures, with the top five cities accounting for a disproportionate share of national output."
        insight="City-level data reveal more pronounced geographic concentration than state-level figures, with a small number of technology hubs accounting for a disproportionate share of national patent output."
        loading={ciL}
        height={1400}
      >
        <PWBarChart
          data={topCities}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <Narrative>
        <p>
          At the city level, geographic concentration is more pronounced still. A small number of technology hubs --
          San Jose, San Diego, Austin, San Francisco, and Houston — account for the largest shares of patent output.
          These cities have maintained their leading positions for decades, suggesting that geographic
          clustering in innovation exhibits strong path dependence.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The persistence of geographic clustering challenges the expectation that digital
          communication technologies would distribute innovation activity more evenly. Despite the expansion of remote work and
          global connectivity, patent activity remains highly concentrated geographically, a pattern consistent with continued agglomeration effects in innovation-intensive industries.
        </p>
      </KeyInsight>

      <SectionDivider label="Regional Specialization" />

      <Narrative>
        <p>
          The Location Quotient (LQ) measures a city&apos;s relative specialization in a given technology area: an LQ above 1 indicates that the
          city accounts for a higher share of that technology than the national average. Elevated LQ
          values indicate distinctive innovation ecosystems with pronounced comparative advantages.
        </p>
      </Narrative>

      {topSpecializations.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Regions with High Patent Concentration (2010–2025, LQ &ge; 1.5)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">City</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">State</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Section</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Location Quotient</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Patents</th>
              </tr>
            </thead>
            <tbody>
              {topSpecializations.map((rs, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3">{rs.city}</td>
                  <td className="text-center py-2 px-3">{rs.state}</td>
                  <td className="text-center py-2 px-3">{rs.section}: {CPC_SECTION_NAMES[rs.section] ?? ''}</td>
                  <td className="text-right py-2 px-3 font-mono font-semibold">{rs.location_quotient.toFixed(2)}</td>
                  <td className="text-right py-2 px-3 font-mono">{rs.metro_section_count.toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <KeyInsight>
        <p>
          Regional specialization reveals the distinctive innovation profiles of US cities.
          Detroit&apos;s automotive-related technologies concentration reflects its automotive heritage.
          San Diego exhibits a pronounced concentration in Electricity, reflecting its semiconductor and wireless technology base. Durham and Chapel Hill demonstrate strong chemistry
          specialization. These patterns suggest that innovation ecosystems develop persistent
          comparative advantages shaped by local industry, universities, and talent pools.
        </p>
      </KeyInsight>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section C-ext: Quality Metrics — By US City                       */}
      {/* Data: computed/quality_by_city.json                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Quality Metrics — By US City" />

      <Narrative>
        <p>
          Just as states differ in quality profiles, city-level analysis reveals even finer-grained variation in patent quality characteristics. The following charts compare the top US cities across four quality dimensions over time, illuminating how local innovation ecosystems shape the quality of their patent output.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-geography-city-forward-citations"
        subtitle="Average forward citations per patent for the top 5 cities by total output, 1976–2025."
        title="Silicon Valley Cities Attract Substantially More Forward Citations Than Other Regions with High Patent Concentration"
        caption="Average forward citations per patent by year for the five leading US cities. Higher values indicate greater downstream influence on subsequent inventions."
        insight="The elevated forward citation rates of Silicon Valley cities suggest that geographic proximity to the densest innovation cluster confers advantages in producing high-impact inventions."
        loading={qcL}
        height={400}
        controls={cityNorm.controls}
      >
        <PWLineChart
          data={pivotData(cityNorm.data, 'avg_forward_citations')}
          xKey="year"
          lines={cityLines}
          yLabel={cityNorm.yLabel}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          truncationYear={2018}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-geography-city-claims"
        subtitle="Average number of claims per patent for the top 5 cities by total output, 1976–2025."
        title="Claim Counts Have Expanded Across All Leading Cities, Consistent With System-Wide Scope Expansion"
        caption="Average number of claims per patent by year for the five leading US cities. Rising claim counts reflect broader patent scope across all major regions with high patent concentration."
        insight="The secular rise in claim counts is evident across all leading cities, indicating that the trend toward broader patent scope is a system-wide phenomenon rather than a city-specific strategy."
        loading={qcL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByCity, 'avg_num_claims')}
          xKey="year"
          lines={cityLines}
          yLabel="Average Claims"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-geography-city-originality"
        subtitle="Average originality score for the top 5 cities by total output, 1976–2025."
        title="Originality Scores Rise Across All Leading Cities as Innovation Becomes More Interdisciplinary"
        caption="Average originality score per patent by year for the five leading US cities. Originality measures the breadth of technology classes cited by each patent."
        insight="Rising originality in leading cities is consistent with the increasingly interdisciplinary nature of innovation in dense technology clusters, where knowledge spillovers across fields are more readily available."
        loading={qcL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByCity, 'avg_originality')}
          xKey="year"
          lines={cityLines}
          yLabel="Average Originality"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-geography-city-grant-lag"
        subtitle="Average grant lag in days for the top 5 cities by total output, 1976–2025."
        title="Grant Lag Follows Similar Trajectories Across Leading Cities, Consistent With USPTO Capacity"
        caption="Average grant lag (filing to issue, in days) by year for the five leading US cities. The similar trajectories suggest that examination delay reflects patent office capacity rather than city-level factors."
        insight="The convergence of grant lag across cities reinforces that examination timelines are determined primarily by USPTO workload and technology complexity rather than by geographic origin of the application."
        loading={qcL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByCity, 'avg_grant_lag_days')}
          xKey="year"
          lines={cityLines}
          yLabel="Average Grant Lag (Days)"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section D: County-Level and Innovation Clusters (Analysis 30, 31) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="County-Level Patent Concentration" />

      <Narrative>
        <p>
          Drilling below the city level to US counties reveals even finer-grained concentration patterns. County-level data capture the precise administrative geographies in which patent activity clusters, highlighting the dominance of a small number of technology-intensive counties in overall US patent output.
        </p>
      </Narrative>

      {topCountiesChart.length > 0 && (
        <ChartContainer
          id="fig-geography-top-counties"
          subtitle="Top 20 US counties by total utility patents from primary inventors (1976–2025)."
          title={`Santa Clara County Leads with 327,700 Patents — Five Counties Account for ${top5CountiesShare}% of Top-50 County Output`}
          caption="The figure ranks the top 20 US counties by total utility patents attributed to primary inventors from 1976 to 2025. Santa Clara County (home to Silicon Valley) leads by a wide margin, followed by Los Angeles, King (Seattle), San Diego, and Alameda counties."
          insight="County-level data reveal that patent concentration is even more pronounced than state-level figures suggest, with Santa Clara County alone producing nearly three times the output of the second-ranked county."
          loading={tcL}
          height={700}
        >
          <PWBarChart
            data={topCountiesChart}
            xKey="label"
            bars={[{ key: 'patent_count', name: 'Total Patents', color: CHART_COLORS[0] }]}
            layout="vertical"
          />
        </ChartContainer>
      )}

      {countyConcentration && countyConcentration.length > 0 && (
        <ChartContainer
          id="fig-geography-county-concentration"
          subtitle="Share of US patents concentrated in the top 50 counties by 5-year period, measuring geographic concentration over time."
          title="Top-50 County Concentration Rose from 43.3% in 1990 to 56.8% in 2020, Indicating Increasing Geographic Clustering"
          caption="The figure tracks the share of total US patents accounted for by the top 50 counties over successive 5-year periods. The steady increase from 43.3% in 1990 to 56.8% by 2020 indicates that patent activity has become more rather than less geographically concentrated over time."
          insight="The rising concentration of patents in the top 50 counties is consistent with the strengthening of agglomeration economies in leading technology hubs over the digital era."
          loading={ccL}
        >
          <PWLineChart
            data={countyConcentration}
            xKey="period"
            lines={[{ key: 'top50_share_pct', name: 'Top 50 Counties Share (%)', color: CHART_COLORS[0] }]}
            yLabel="Share of US Patents (%)"
            yFormatter={(v) => `${(v as number).toFixed(1)}%`}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The increasing concentration of patent output in the top 50 counties — rising from 43.3% in 1990 to 56.8% by 2020 — challenges the expectation that digital communication would distribute innovation more broadly. Instead, geographic clustering has intensified, consistent with the self-reinforcing nature of agglomeration economies in technology-intensive regions.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The state-level and city-level patterns documented here reveal pronounced geographic concentration and distinctive technology specialization across the United States. The next chapter, <Link href="/chapters/geo-international/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">International Geography</Link>, extends this analysis across national borders, examining how foreign filings and international inventor mobility have transformed the US patent system into a global institution.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "California accounts for 23.6% of all US patent grants, producing 992,708 patents — more than the bottom 30 states combined.",
          "States exhibit distinctive specialization: Michigan devotes 20.1% of patents to Mechanical Engineering versus California's 65.1% in Physics and Electricity.",
        ]}
        falsifiable="If geographic concentration reflects agglomeration economies rather than mere population density, then patent-per-capita rates should be highest in clusters (Silicon Valley, Boston) even after controlling for industry composition."
        nextAnalysis={{
          label: "International Geography",
          description: "Cross-border patenting patterns and how national innovation systems compare",
          href: "/chapters/geo-international/",
        }}
      />

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        State specialization uses CPC technology section classifications. City-level rankings
        include all cities with patent activity. Regional specialization uses Location Quotient (LQ)
        computed for US cities with 500+ patents (2010–2025). Quality metrics are computed from
        computed/quality_by_state.json and computed/quality_by_city.json.
      </DataNote>

      <RelatedChapters currentChapter={18} />
      <ChapterNavigation currentChapter={18} />
    </div>
  );
}
