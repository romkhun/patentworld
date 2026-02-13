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
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWChoroplethMap } from '@/components/charts/PWChoroplethMap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { StateSummary, CountryPerYear, TopCity, StateSpecialization } from '@/lib/types';

function pivotCountries(data: CountryPerYear[], topN: number = 8) {
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

export default function Chapter4() {
  const { data: states, loading: stL } = useChapterData<StateSummary[]>('chapter4/us_states_summary.json');
  const { data: countries, loading: coL } = useChapterData<CountryPerYear[]>('chapter4/countries_per_year.json');
  const { data: cities, loading: ciL } = useChapterData<TopCity[]>('chapter4/top_cities.json');
  const { data: spec, loading: spL } = useChapterData<StateSpecialization[]>('chapter4/state_specialization.json');

  const topStates = useMemo(() => {
    if (!states) return [];
    return states.slice(0, 25).map((d) => ({
      ...d,
      label: d.state,
    }));
  }, [states]);

  const topCities = useMemo(() => {
    if (!cities) return [];
    return cities.slice(0, 25).map((d) => ({
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
    const stateMap: Record<string, any> = {};
    spec.forEach((d) => {
      if (!stateMap[d.state]) stateMap[d.state] = { state: d.state, total: 0 };
      stateMap[d.state][d.section] = d.count;
      stateMap[d.state].total += d.count;
    });
    return Object.values(stateMap)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 20);
  }, [spec]);

  const statePatentMap = useMemo(() => {
    if (!states) return {};
    const map: Record<string, number> = {};
    states.forEach((d) => { map[d.state] = d.total_patents; });
    return map;
  }, [states]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');
  const topStateName = states?.[0]?.state ?? 'California';

  return (
    <div>
      <ChapterHeader
        number={4}
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
        height={480}
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
        title="Top 25 US States by Patent Count"
        caption="Total utility patents by primary inventor state, 1976-2025."
        loading={stL}
        height={600}
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

      <SectionDivider label="City Level" />

      <ChartContainer
        title="Top 25 US Cities for Patents"
        caption="Total utility patents by primary inventor city, 1976-2025."
        loading={ciL}
        height={600}
      >
        <PWBarChart
          data={topCities}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

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

      {specByState.length > 0 && (
        <ChartContainer
          title="State Technology Specialization"
          caption="CPC technology section distribution for the top 20 states by total patents."
          loading={spL}
          height={500}
        >
          <PWAreaChart
            data={specByState}
            xKey="state"
            areas={sectionKeys.map((key) => ({
              key,
              name: `${key}: ${CPC_SECTION_NAMES[key]}`,
              color: CPC_SECTION_COLORS[key],
            }))}
            stackedPercent
          />
        </ChartContainer>
      )}

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
      </DataNote>

      <ChapterNavigation currentChapter={4} />
    </div>
  );
}
