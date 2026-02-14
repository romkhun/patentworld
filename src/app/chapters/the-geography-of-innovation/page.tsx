'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import dynamic from 'next/dynamic';
const PWChoroplethMap = dynamic(() => import('@/components/charts/PWChoroplethMap').then(m => ({ default: m.PWChoroplethMap })), { ssr: false });
const PWWorldFlowMap = dynamic(() => import('@/components/charts/PWWorldFlowMap').then(m => ({ default: m.PWWorldFlowMap })), { ssr: false });
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PWSeriesSelector } from '@/components/charts/PWSeriesSelector';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { RankingTable } from '@/components/chapter/RankingTable';
import Link from 'next/link';
import type { StateSummary, CountryPerYear, TopCity, StateSpecialization, StatePerYear, InventorFlow, InventorMobilityTrend, RegionalSpecialization } from '@/lib/types';

function pivotCountries(data: CountryPerYear[], topN: number = 15) {
  const totals: Record<string, number> = {};
  data.forEach((d) => { totals[d.country] = (totals[d.country] || 0) + d.count; });
  const topCountries = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([c]) => c);

  const years = [...new Set(data.map((d) => d.year))].sort();
  return {
    pivoted: years.map((year) => {
      const row: any = { year };
      data.filter((d) => d.year === year && topCountries.includes(d.country))
        .forEach((d) => { row[d.country] = d.count; });
      return row;
    }),
    countries: topCountries,
  };
}

export default function Chapter7() {
  const { data: states, loading: stL } = useChapterData<StateSummary[]>('chapter4/us_states_summary.json');
  const { data: countries, loading: coL } = useChapterData<CountryPerYear[]>('chapter4/countries_per_year.json');
  const { data: cities, loading: ciL } = useChapterData<TopCity[]>('chapter4/top_cities.json');
  const { data: spec, loading: spL } = useChapterData<StateSpecialization[]>('chapter4/state_specialization.json');
  const { data: statesPerYear, loading: spyL } = useChapterData<StatePerYear[]>('chapter4/us_states_per_year.json');
  const { data: stateFlows, loading: sfL } = useChapterData<InventorFlow[]>('chapter4/inventor_state_flows.json');
  const { data: countryFlows, loading: cfL } = useChapterData<InventorFlow[]>('chapter4/inventor_country_flows.json');
  const { data: mobilityTrend, loading: mtL } = useChapterData<InventorMobilityTrend[]>('chapter4/inventor_mobility_trend.json');
  const { data: diffusionSummary } = useChapterData<{ tech_area: string; periods: { period: string; total_cities: number; total_patents: number }[] }[]>('chapter4/innovation_diffusion_summary.json');
  const { data: regionalSpec } = useChapterData<RegionalSpecialization[]>('chapter4/regional_specialization.json');

  const [selectedCountrySeries, setSelectedCountrySeries] = useState<Set<string>>(new Set());

  const topStates = useMemo(() => {
    if (!states) return [];
    return states.map((d) => ({
      ...d,
      label: d.state,
    }));
  }, [states]);

  const topCities = useMemo(() => {
    if (!cities) return [];
    return cities.map((d) => ({
      ...d,
      label: `${d.city}, ${d.state}`,
    }));
  }, [cities]);

  const { pivoted: countryPivot, countries: topCountryNames } = useMemo(() => {
    if (!countries) return { pivoted: [], countries: [] };
    const result = pivotCountries(countries);
    if (result.countries.length > 0 && selectedCountrySeries.size === 0) {
      setTimeout(() => setSelectedCountrySeries(new Set(result.countries.slice(0, 5))), 0);
    }
    return result;
  }, [countries, selectedCountrySeries.size]);

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

  const topStateFlows = useMemo(() => {
    if (!stateFlows) return [];
    return stateFlows.slice(0, 30).map((d) => ({
      ...d,
      label: `${d.from_state} → ${d.to_state}`,
    }));
  }, [stateFlows]);

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

  // diffusionSummary is precomputed in the JSON file (no client-side aggregation needed)

  const topSpecializations = useMemo(() => {
    if (!regionalSpec) return [];
    return [...regionalSpec]
      .filter(d => d.location_quotient >= 1.5)
      .sort((a, b) => b.location_quotient - a.location_quotient)
      .slice(0, 30);
  }, [regionalSpec]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');
  const topStateName = states?.[0]?.state ?? 'California';

  return (
    <div>
      <ChapterHeader
        number={7}
        title="The Geography of Innovation"
        subtitle="Spatial distribution, concentration, and mobility patterns in US patent activity"
      />

      <KeyFindings>
        <li>Patent activity is disproportionately concentrated geographically: the top five US states (California, Texas, New York, Massachusetts, and Michigan) account for approximately 46% of all grants, and city-level analysis reveals even more extreme concentration.</li>
        <li>Geographic concentration has intensified over time, with regions such as the San Francisco Bay Area and the Boston-Cambridge corridor demonstrating accelerating divergence from other regions, while distinctive technology specializations exhibit strong path dependence.</li>
        <li>Japan, Germany, and South Korea constitute the leading foreign sources of US patents, with China&apos;s share increasing substantially since the 2000s, transforming the US patent system into a de facto global institution.</li>
        <li>Inventor mobility -- both domestic and international -- has increased over the study period, with the United States functioning as the central hub for 77.6% of all international inventor migration flows.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The organizational and inventor-level concentration documented in <Link href="/chapters/firm-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link> and <Link href="/chapters/the-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Inventors</Link> has a pronounced spatial dimension: inventive activity clusters in a small number of self-reinforcing ecosystems where skilled labor, venture capital, research universities, and corporate laboratories co-locate. This chapter examines the geography of innovation through two complementary lenses. Within the United States, a handful of coastal states generate a disproportionate share of all output, with California alone exceeding the combined total of the bottom thirty states and territories -- a gap that has widened rather than narrowed over the digital era. City-level analysis reveals that this concentration is even more extreme at finer geographic scales, with distinctive regional specializations, from Detroit in automotive-related mechanical engineering to San Diego in wireless and semiconductor technology, exhibiting strong path dependence that digital connectivity has done little to erode. Turning to the international dimension, successive waves of filings from Japan, South Korea, and more recently China have transformed the US patent system into a de facto global institution, while inventor mobility data reveal that the United States serves as the central node connecting innovation ecosystems worldwide.
        </p>
      </aside>

      <Narrative>
        <p>
          Innovation activity is not evenly distributed across geographic space. This chapter proceeds in two parts: first examining the domestic landscape, where a small number of states and cities account for the majority of US patent output, and then turning to the international dimension, where the evolving composition of foreign filings and cross-border inventor mobility reveal the increasingly global character of the US patent system.
        </p>
      </Narrative>

      {/* ================================================================
          DOMESTIC (US) ANALYSIS
          ================================================================ */}
      <SectionDivider label="Domestic (US) Analysis" />

      <Narrative>
        <p>
          Within the United States, patent activity concentrates in a small number of states and metropolitan areas. The following sections examine this domestic geography at the state and city level, including cumulative rankings, temporal trends, technology specialization profiles, and the diffusion of emerging technologies across cities.
        </p>
      </Narrative>

      {/* --- Region / State-Level --- */}
      <SectionDivider label="State and Regional Patterns" />

      <ChartContainer
        id="fig-geography-state-choropleth"
        subtitle="Total utility patents by primary inventor state (1976-2025), displayed as a choropleth map with darker shading for higher counts."
        title="Patent Activity Concentrates on the Coasts, with California's 992,708 Patents Exceeding the Bottom 30 States and Territories Combined (314,664)"
        caption="This choropleth map displays total utility patents by primary inventor state from 1976 to 2025, with darker shading indicating higher patent counts. The coastal concentration is pronounced, with California, New York, and Texas exhibiting the highest totals."
        insight="The coastal concentration of patent activity reflects the co-location of technology firms, research universities, and venture capital in a small number of self-reinforcing innovation ecosystems."
        loading={stL}
        height={650}
      >
        <PWChoroplethMap data={statePatentMap} valueLabel="Patents" />
      </ChartContainer>

      <KeyInsight>
        <p>
          Innovation activity is disproportionately concentrated in coastal states. California alone accounts for more
          patents than the bottom 30 states and territories combined, reflecting the predominant role of Silicon Valley
          in the US innovation ecosystem.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-geography-state-rankings"
        subtitle="US states ranked by total utility patents from primary inventors (1976-2025)."
        title="California Accounts for Nearly One-Quarter (23.6%) of All US Patent Grants, 1976-2025"
        caption="This chart ranks US states by total utility patents attributed to primary inventors from 1976 to 2025. California leads by a substantial margin, followed by Texas, New York, Massachusetts, and Michigan."
        insight="California accounts for nearly one-quarter (23.6%) of all US patent activity, a concentration driven by the Silicon Valley ecosystem of venture capital, research universities, and technology firms."
        loading={stL}
        height={1200}
      >
        <PWBarChart
          data={topStates}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top states as a data table"
        headers={['State', 'Total Patents']}
        rows={(states ?? []).slice(0, 15).map(d => [d.state, d.total_patents])}
        caption="Top 15 US states by total utility patents, 1976-2025. Source: PatentsView."
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
          for approximately 46% of all US patents. This pronounced concentration reflects the self-reinforcing
          nature of innovation clusters: skilled workers, venture capital, research
          universities, and corporate research laboratories co-locate, creating ecosystems that are difficult
          for other regions to replicate.
        </p>
      </KeyInsight>

      {stateTimePivot.length > 0 && (
        <ChartContainer
          id="fig-geography-state-trends"
          subtitle="Annual patent grants for the top 10 states by total output, showing diverging trajectories over time."
          title="California's Patent Output Has Diverged Sharply from Other Leading States, Reaching 4.0x Texas by 2024"
          caption="This chart displays annual patent grants for the 10 leading states by total output from 1976 to 2025. California exhibits an accelerating divergence from the second-ranked state beginning in the early 1990s, with the gap widening in each subsequent decade."
          insight="California's accelerating divergence from other states since the 1990s is consistent with the compounding advantages characteristic of self-reinforcing innovation ecosystems."
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
          than that of other states since the 1990s, driven by the expansion of Silicon Valley and
          the broader California technology ecosystem. Texas and Washington have also
          demonstrated strong growth, reflecting the emergence of technology clusters
          in Austin, Dallas, and Seattle.
        </p>
      </KeyInsight>

      {specByState.length > 0 && (
        <ChartContainer
          id="fig-geography-state-specialization"
          subtitle="CPC technology section distribution by state, shown as 100% stacked bars to reveal distinctive regional specialization patterns."
          title="States Exhibit Distinctive Technology Profiles: Michigan Devotes 20.1% to Mechanical Engineering vs. California's 65.1% in Physics and Electricity"
          caption="This chart displays the CPC technology section distribution for all states by total patents, with each bar summing to 100%. States with pharmaceutical hubs show elevated Chemistry shares, while technology-oriented states concentrate in Electricity and Physics."
          insight="Geographic concentration of innovation creates self-reinforcing cycles, as talent, capital, and knowledge spillovers cluster in established hubs that develop distinctive technology specializations aligned with regional industry structures."
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
            yFormatter={(v) => `${v}%`}
            xDomain={[0, 100]}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          State technology specialization reflects regional industrial strengths. States with
          major pharmaceutical hubs (New Jersey, Connecticut) exhibit higher Chemistry shares,
          while traditional manufacturing states demonstrate stronger Mechanical Engineering concentrations. California
          and Washington show elevated Electricity and Physics shares, reflecting
          the influence of Silicon Valley and the Pacific Northwest technology corridor.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Moving from the state level to the city level reveals even more pronounced concentration patterns. The following analyses examine city-level rankings, the geographic diffusion of emerging technologies across metropolitan areas, and the distinctive specialization profiles that characterize individual cities.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-geography-city-rankings"
        subtitle="US cities ranked by total utility patents from primary inventors (1976-2025), revealing finer-grained concentration patterns."
        title="San Jose (96,068), San Diego (70,186), and Austin (53,595) Lead All US Cities in Total Patent Output"
        caption="This chart ranks US cities by total utility patents attributed to primary inventors from 1976 to 2025. City-level data reveal concentration patterns that are even more pronounced than state-level figures, with the top five cities accounting for a disproportionate share of national output."
        insight="City-level data reveal more pronounced geographic concentration than state-level figures, with a small number of technology hubs accounting for a disproportionate share of national innovation output."
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
          San Jose, San Diego, Austin, San Francisco, and Houston -- account for the largest shares of patent output.
          These cities have maintained their leading positions for decades, suggesting that geographic
          clustering in innovation exhibits strong path dependence.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The persistence of geographic clustering challenges the expectation that digital
          communication technologies would distribute innovation activity more evenly. Despite the expansion of remote work and
          global connectivity, physical proximity to other innovators, investors, and
          specialized labor markets appears to continue conferring substantial advantages in the innovation
          process.
        </p>
      </KeyInsight>

      <SectionDivider label="Innovation Diffusion" />
      <Narrative>
        <p>
          Tracking patent activity in AI, Biotech &amp; Pharma, and Clean Energy across cities
          reveals a consistent diffusion pattern: innovations typically originate in a small number of pioneering
          locations before spreading geographically as knowledge and talent disperse to secondary hubs.
        </p>
      </Narrative>
      {diffusionSummary && diffusionSummary.length > 0 && (
        <div className="max-w-3xl mx-auto my-8">
          {diffusionSummary.map((tech) => (
            <div key={tech.tech_area} className="mb-6">
              <h3 className="text-sm font-semibold mb-2">{tech.tech_area}</h3>
              <div className="flex gap-4 overflow-x-auto text-xs">
                {tech.periods.filter(p => p.total_patents > 0).map((p) => (
                  <div key={p.period} className="flex-shrink-0 text-center px-3 py-2 rounded-lg bg-muted/50">
                    <div className="font-mono font-medium">{p.period}</div>
                    <div className="text-muted-foreground">{p.total_cities} cities</div>
                    <div className="font-semibold">{p.total_patents.toLocaleString()} patents</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <KeyInsight>
        <p>
          All three technology areas exhibit a consistent diffusion pattern: early concentration in
          a small number of pioneering cities followed by geographic spread. AI patenting was
          predominantly concentrated in Silicon Valley and several East Coast hubs in the 1990s but
          has since spread to dozens of cities worldwide. Biotech demonstrates a similar pattern
          anchored by Boston, San Francisco, and San Diego. Clean energy patenting remains
          more geographically dispersed, reflecting the heterogeneous nature of renewable
          technologies.
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
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Regions with High Patent Concentration (2010-2025, LQ &ge; 1.5)</h3>
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
                  <td className="text-right py-2 px-3 font-mono">{rs.metro_section_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <KeyInsight>
        <p>
          Regional specialization reveals the distinctive innovation profiles of American cities.
          Detroit&apos;s mechanical engineering concentration reflects its automotive heritage.
          San Diego exhibits a pronounced concentration in Electricity, reflecting its semiconductor and wireless technology base. Research Triangle cities in North Carolina demonstrate strong chemistry
          specialization. These patterns suggest that innovation ecosystems develop persistent
          comparative advantages shaped by local industry, universities, and talent pools.
        </p>
      </KeyInsight>

      {/* --- Domestic Inventor-Level --- */}
      <SectionDivider label="Domestic Inventor Mobility" />

      <Narrative>
        <p>
          The static snapshots of state and city patent output presented above capture where innovation occurs, but not how inventors move across these domestic regions over the course of their careers. Tracking individual inventors across their patent histories reveals patterns of{' '}
          <StatCallout value="geographic mobility" /> -- the manner in which innovators relocate between states, carrying tacit knowledge and professional networks with them.
        </p>
      </Narrative>

      {mobilityTrend && mobilityTrend.length > 0 && (
        <ChartContainer
          id="fig-geography-inventor-mobility-trend"
          subtitle="Domestic and international inventor mobility rates over time, measured as the share of patents filed by inventors who changed location since their prior patent."
          title="International Inventor Mobility Rose from 1.3% (1980) to 5.1% (2024), Surpassing Domestic Rates of 3.5%"
          caption="This chart displays the percentage of patents filed by inventors who relocated from a different state or country since their previous patent. Both domestic (interstate) and international mobility rates exhibit upward trends over the study period."
          insight="Inventor mobility constitutes an important mechanism for knowledge diffusion, as mobile inventors carry tacit knowledge and professional networks from one region of concentrated inventive activity to another."
          loading={mtL}
        >
          <PWLineChart
            data={mobilityTrend}
            xKey="year"
            lines={[
              { key: 'domestic_mobility_pct', name: 'Domestic Mobility (% Interstate)', color: CHART_COLORS[0] },
              { key: 'intl_mobility_pct', name: 'International Mobility (%)', color: CHART_COLORS[3], dashPattern: '8 4' },
            ]}
            yLabel="Mobility Rate (%)"
            yFormatter={(v) => `${v.toFixed(1)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          Inventor mobility patterns illuminate the dynamic nature of innovation geography.
          While the majority of inventors remain in the same location throughout their patenting
          careers, a significant minority relocates between states, carrying
          knowledge and professional networks with them. This geographic diffusion of
          human capital appears to serve an important function in extending innovation capabilities
          beyond established technology hubs. Notably, international mobility has surpassed domestic interstate mobility in recent years, a trend examined further in the international analysis below.
        </p>
      </KeyInsight>

      {topStateFlows.length > 0 && (
        <ChartContainer
          id="fig-geography-state-flows"
          subtitle="Top 30 state-to-state inventor migration corridors, measured by sequential patents filed from different states."
          title="California Accounts for 54.9% of All Interstate Inventor Migration, with 127,466 Inflows and 118,630 Outflows"
          caption="This chart displays the most common state-to-state inventor moves, based on sequential patents filed from different states. California-linked corridors dominate, reflecting the state's role as the primary hub for inventor talent flows."
          insight="The dominant migration corridors reveal the gravitational pull of major technology clusters, with California functioning as both the largest source and destination of inventor talent."
          loading={sfL}
          height={900}
        >
          <PWBarChart
            data={topStateFlows}
            xKey="label"
            bars={[{ key: 'flow_count', name: 'Moves', color: CHART_COLORS[0] }]}
            layout="vertical"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The dominant domestic migration corridors reflect the gravitational pull of major
          technology clusters. California functions as both the largest source and destination
          of inventor migration within the United States, with corridors linking it to Texas, New York, and Washington among the most heavily traveled. These flows suggest that the same agglomeration forces driving geographic concentration also shape the pathways through which inventor talent circulates across the country.
        </p>
      </KeyInsight>

      {/* ================================================================
          INTERNATIONAL ANALYSIS
          ================================================================ */}
      <SectionDivider label="International Analysis" />

      <Narrative>
        <p>
          The domestic concentration documented above is paralleled by a transformation in the international origins of US patent filings. The same globalization of assignee origin observed in <Link href="/chapters/firm-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link> manifests geographically, as successive waves of foreign filings have reshaped the composition of the US patent system. The following sections examine country-level filing trends and international inventor mobility patterns.
        </p>
      </Narrative>

      {/* --- Country-Level --- */}
      <SectionDivider label="Country-Level Filing Trends" />

      <PWSeriesSelector
        items={topCountryNames.map((name, i) => ({
          key: name,
          name,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))}
        selected={selectedCountrySeries}
        onChange={setSelectedCountrySeries}
        defaultCount={5}
      />
      <ChartContainer
        id="fig-geography-country-trends"
        subtitle="Annual US patent grants by primary inventor country for the top 15 countries, showing the evolving international composition of filings."
        title="Japan Leads Foreign Patent Filings with 1.45 Million, While China Surged from 299 (2000) to 30,695 (2024)"
        caption="This chart displays annual utility patent grants by primary inventor country for the top 8 countries by total output. Japan maintained the largest foreign share through the 1990s, while South Korea and China have demonstrated the most pronounced growth in the 2000s and 2010s respectively."
        insight="Japan's leading position among foreign filers reflects decades of sustained corporate research and development investment, while South Korea's rise is consistent with the expansion of firms such as Samsung and LG into global patent markets."
        loading={coL}
        interactive
        statusText={`Showing ${selectedCountrySeries.size} of ${topCountryNames.length} countries`}
      >
        <PWLineChart
          data={countryPivot}
          xKey="year"
          lines={topCountryNames
            .filter((name) => selectedCountrySeries.has(name))
            .map((name) => ({
              key: name,
              name,
              color: CHART_COLORS[topCountryNames.indexOf(name) % CHART_COLORS.length],
            }))}
          yLabel="Number of Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The share of domestically originated patents in the United States has declined over the decades
          as inventors from Japan, Germany, South Korea, and China have substantially
          increased their filings. By the 2010s, foreign-origin inventors accounted
          for more than half of all US patent grants.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The US patent system has evolved into a global institution. Japan dominated foreign filings
          through the 1990s, and Germany held the second position among foreign filers through the 2000s before being surpassed by South Korea (around 2011-2015) and China (2019). South Korea and China have emerged as significant contributors in the 2000s
          and 2010s respectively. China&apos;s sustained growth in US patent filings is indicative of a fundamental
          shift in inventive activity as reflected in US patent filings.
        </p>
      </KeyInsight>

      {/* --- International Inventor-Level --- */}
      <SectionDivider label="International Inventor Mobility" />

      <Narrative>
        <p>
          Beyond country-level filing volumes, inventor mobility data reveal how researchers and engineers move across national borders over the course of their careers. As noted in the domestic mobility analysis above, international mobility rates have risen steadily and now surpass domestic interstate rates. The following map visualizes the dominant cross-border migration corridors that connect national innovation ecosystems.
        </p>
      </Narrative>

      {countryFlows && countryFlows.length > 0 && (
        <ChartContainer
          id="fig-geography-global-flows"
          subtitle="Global inventor migration flows between countries, with arc width proportional to the volume of moves and country shading indicating total movement."
          title="The United States Is Involved in 77.6% of All International Inventor Migration Flows (509,639 of 656,397 Moves)"
          caption="This map displays global inventor migration flows between countries, with arc width representing the volume of moves and country shading indicating total inventor movement. The United States emerges as the central node, connecting East Asian, European, and other innovation ecosystems."
          insight="The United States functions as the primary global hub for inventor migration, connecting East Asian, European, and other innovation ecosystems through flows of researchers and engineers."
          loading={cfL}
          height={650}
          wide
        >
          <PWWorldFlowMap data={countryFlows} maxFlows={25} />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          Internationally, the United States serves as the primary hub connecting inventors from East Asia,
          Europe, and other regions. Its involvement in more than three-quarters of all cross-border inventor moves underscores
          its role not only as a destination for global talent but also as a gateway through which knowledge circulates among
          national innovation systems. These mobility patterns complement the country-level filing trends above, illustrating
          how the US patent system functions as both a legal institution and a nexus for the global circulation of inventive talent.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the spatial distribution of innovation -- both domestic concentration patterns and international filing and mobility trends -- the subsequent chapter investigates how inventors and organizations connect across these geographic boundaries through <Link href="/chapters/collaboration-networks" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Collaboration Networks</Link>.
        These networks constitute the channels through which knowledge flows, and their structure, explored further in <Link href="/chapters/patent-quality" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent Quality</Link>, indicates whether the innovation ecosystem is becoming more interconnected or more fragmented over time.
      </Narrative>

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        Inventor mobility is inferred from changes in reported location between sequential
        patents by the same disambiguated inventor. Innovation diffusion tracks patent activity in AI, Biotech & Pharma, and Clean Energy across cities with 5+ patents per period. Regional specialization uses Location Quotient (LQ) computed for US cities with 500+ patents (2010-2025).
      </DataNote>

      <RelatedChapters currentChapter={7} />
      <ChapterNavigation currentChapter={7} />
    </div>
  );
}
