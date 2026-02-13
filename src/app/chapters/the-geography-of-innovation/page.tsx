'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWChoroplethMap } from '@/components/charts/PWChoroplethMap';
import { PWWorldFlowMap } from '@/components/charts/PWWorldFlowMap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { StateSummary, CountryPerYear, TopCity, StateSpecialization, StatePerYear, InventorFlow, InventorMobilityTrend } from '@/lib/types';

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

export default function Chapter6() {
  const { data: states, loading: stL } = useChapterData<StateSummary[]>('chapter4/us_states_summary.json');
  const { data: countries, loading: coL } = useChapterData<CountryPerYear[]>('chapter4/countries_per_year.json');
  const { data: cities, loading: ciL } = useChapterData<TopCity[]>('chapter4/top_cities.json');
  const { data: spec, loading: spL } = useChapterData<StateSpecialization[]>('chapter4/state_specialization.json');
  const { data: statesPerYear, loading: spyL } = useChapterData<StatePerYear[]>('chapter4/us_states_per_year.json');
  const { data: stateFlows, loading: sfL } = useChapterData<InventorFlow[]>('chapter4/inventor_state_flows.json');
  const { data: countryFlows, loading: cfL } = useChapterData<InventorFlow[]>('chapter4/inventor_country_flows.json');
  const { data: mobilityTrend, loading: mtL } = useChapterData<InventorMobilityTrend[]>('chapter4/inventor_mobility_trend.json');

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
    return pivotCountries(countries);
  }, [countries]);

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

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');
  const topStateName = states?.[0]?.state ?? 'California';

  return (
    <div>
      <ChapterHeader
        number={5}
        title="The Geography of Innovation"
        subtitle="Where patents come from"
      />

      <Narrative>
        <p>
          Innovation is not evenly distributed. A handful of states dominate US patent
          output, with <StatCallout value={topStateName} /> leading by a wide margin.
          Internationally, the landscape has shifted dramatically as Asian economies
          have become major sources of US patent filings.
        </p>
      </Narrative>

      <ChartContainer
        title="US Patent Activity by State"
        caption="Total utility patents by primary inventor state, 1976-2025. Darker shading indicates higher patent counts."
        loading={stL}
        height={650}
      >
        <PWChoroplethMap data={statePatentMap} valueLabel="Patents" />
      </ChartContainer>

      <KeyInsight>
        <p>
          Innovation is heavily concentrated on the coasts. California alone accounts for more
          patents than the bottom 30 states combined, reflecting Silicon Valley&apos;s outsized role
          in the US innovation ecosystem.
        </p>
      </KeyInsight>

      <SectionDivider label="State Rankings" />

      <ChartContainer
        title="US States by Patent Count"
        caption="Total utility patents by primary inventor state, 1976-2025."
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

      <Narrative>
        <p>
          California, the home of Silicon Valley, accounts for more US patents than
          any other state. Other technology hubs -- New York, Texas, New Jersey, and
          Massachusetts -- round out the top five. The concentration reflects the
          clustering of technology companies and research universities.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The top five states (California, New York, Texas, New Jersey, Massachusetts) account
          for more than 50% of all US patents. This extreme concentration reflects the self-
          reinforcing nature of innovation clusters: skilled workers, venture capital, research
          universities, and corporate R&D labs co-locate, creating ecosystems that are difficult
          for other regions to replicate.
        </p>
      </KeyInsight>

      {stateTimePivot.length > 0 && (
        <ChartContainer
          title="Top States: Patent Output Over Time"
          caption="Annual patent grants for the 10 leading states by total output, 1976-2025."
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
            yLabel="Patents"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The time-series trajectories of state-level patent output reveal divergent growth
          patterns. California&apos;s patent output has grown at a substantially faster rate
          than other states since the 1990s, driven by the expansion of Silicon Valley and
          the broader California technology ecosystem. Texas and Washington have also
          demonstrated strong growth, reflecting the emergence of new technology clusters
          in Austin, Dallas, and Seattle.
        </p>
      </KeyInsight>

      <SectionDivider label="City Level" />

      <ChartContainer
        title="US Cities by Patent Count"
        caption="Total utility patents by primary inventor city, 1976-2025."
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
          At the city level, the concentration is even more extreme. A handful of tech hubs --
          San Jose, San Francisco, New York, Los Angeles, and Houston -- dominate patent output.
          These cities have maintained their positions for decades, suggesting that geographic
          clustering in innovation is highly persistent.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The persistence of geographic clustering challenges the assumption that digital
          communication would distribute innovation more evenly. Despite remote work and
          global connectivity, physical proximity to other innovators, investors, and
          specialized labor markets continues to provide powerful advantages in the innovation
          process.
        </p>
      </KeyInsight>

      <SectionDivider label="International" />

      <ChartContainer
        title="Top Countries: Patents Over Time"
        caption="Annual utility patent grants by primary inventor country (top 8 countries by total)."
        loading={coL}
      >
        <PWLineChart
          data={countryPivot}
          xKey="year"
          lines={topCountryNames.map((name, i) => ({
            key: name,
            name,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          yLabel="Patents"
        />
      </ChartContainer>

      <Narrative>
        <p>
          The United States has seen its share of its own patents decline over the decades
          as inventors from Japan, South Korea, Germany, and China have dramatically
          increased their patent filings. By the 2010s, foreign-origin inventors accounted
          for more than half of all US patent grants.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The US patent system has become a truly global institution. Japan dominated foreign filings
          through the 1990s, but South Korea and China have emerged as major forces in the 2000s
          and 2010s respectively. China&apos;s rapid rise in particular signals a fundamental
          shift in global innovation capacity.
        </p>
      </KeyInsight>

      {specByState.length > 0 && (
        <ChartContainer
          title="State Technology Specialization"
          caption="CPC technology section distribution for all states by total patents. Each bar totals 100%."
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
            yFormatter={(v) => `${v}%`}
            xDomain={[0, 100]}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          State technology specialization reflects regional industrial strengths. States with
          major pharmaceutical hubs (New Jersey, Connecticut) show higher Chemistry shares,
          while traditional manufacturing states lean toward Mechanical Engineering. California
          and Washington show strong Electricity and Physics concentrations, reflecting
          Silicon Valley and the Pacific Northwest tech corridor.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventor Mobility" />

      <Narrative>
        <p>
          Beyond static snapshots of where patents originate, tracking individual inventors
          across their patent histories reveals patterns of{' '}
          <StatCallout value="geographic mobility" /> -- how innovators move between states
          and countries over their careers.
        </p>
      </Narrative>

      {mobilityTrend && mobilityTrend.length > 0 && (
        <ChartContainer
          title="Inventor Mobility Rate Over Time"
          caption="Percentage of patents filed by inventors who have moved from a different state or country since their previous patent."
          loading={mtL}
        >
          <PWLineChart
            data={mobilityTrend}
            xKey="year"
            lines={[
              { key: 'domestic_mobility_pct', name: 'Domestic Mobility (% Interstate)', color: CHART_COLORS[0] },
              { key: 'intl_mobility_pct', name: 'International Mobility (%)', color: CHART_COLORS[3] },
            ]}
            yLabel="Percent"
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          Inventor mobility patterns reveal the dynamic nature of innovation geography.
          While most inventors remain in the same location throughout their patenting
          careers, a significant minority moves between states or countries, carrying
          knowledge and professional networks with them. This geographic diffusion of
          human capital plays a critical role in spreading innovation capabilities
          beyond established technology hubs.
        </p>
      </KeyInsight>

      {topStateFlows.length > 0 && (
        <ChartContainer
          title="Interstate Inventor Migration Flows"
          caption="Most common state-to-state moves by inventors, based on sequential patents filed from different states."
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

      {countryFlows && countryFlows.length > 0 && (
        <ChartContainer
          title="International Inventor Migration Flows"
          caption="Global map of inventor migration between countries. Arc width represents volume of moves. Countries colored by total inventor movement. Hover over arcs or countries for details."
          loading={cfL}
          height={650}
          wide
        >
          <PWWorldFlowMap data={countryFlows} maxFlows={25} />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The dominant migration corridors reflect the gravitational pull of major
          technology clusters. California is both the largest source and destination
          of inventor migration within the United States, while internationally, the
          United States serves as the primary hub connecting inventors from East Asia,
          Europe, and other regions.
        </p>
      </KeyInsight>

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        Inventor mobility is inferred from changes in reported location between sequential
        patents by the same disambiguated inventor.
      </DataNote>

      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
