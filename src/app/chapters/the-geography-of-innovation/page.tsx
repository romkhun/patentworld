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
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { StateSummary, CountryPerYear, TopCity, StateSpecialization, StatePerYear, InventorFlow, InventorMobilityTrend, InnovationDiffusionEntry, RegionalSpecialization } from '@/lib/types';

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
  const { data: diffusion } = useChapterData<InnovationDiffusionEntry[]>('chapter4/innovation_diffusion.json');
  const { data: regionalSpec } = useChapterData<RegionalSpecialization[]>('chapter4/regional_specialization.json');

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

  const diffusionSummary = useMemo(() => {
    if (!diffusion) return [];
    // Top cities per tech area per period
    const periods = [...new Set(diffusion.map(d => d.period))].sort();
    const techAreas = [...new Set(diffusion.map(d => d.tech_area))].sort();
    return techAreas.map(tech => ({
      tech_area: tech,
      periods: periods.map(period => {
        const entries = diffusion.filter(d => d.tech_area === tech && d.period === period);
        return {
          period,
          total_cities: entries.length,
          total_patents: entries.reduce((s, d) => s + d.patent_count, 0),
        };
      }),
    }));
  }, [diffusion]);

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
        number={5}
        title="The Geography of Innovation"
        subtitle="Where patents come from"
      />

      <KeyFindings>
        <li>Patent activity is heavily concentrated in a few US states — California, Texas, and New York account for a disproportionate share of all grants.</li>
        <li>Japan, South Korea, and Germany are the leading foreign sources of US patents, reflecting their strong national innovation systems.</li>
        <li>Geographic concentration of patenting has increased over time, with innovation hubs like Silicon Valley and the Boston-Cambridge corridor pulling further ahead.</li>
        <li>China&apos;s share of US patents has grown rapidly since the 2000s, though it started from a very low base.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The top 5 US states (California, New York, Texas, New Jersey, Massachusetts) account for over 50% of all patent grants. California alone produces more patents than the bottom 30 states combined. Internationally, Japan, South Korea, and Germany lead foreign filings, while China&apos;s share has surged since the 2000s. At the city level, innovation is even more concentrated: San Jose, San Francisco, and New York dominate, and regional specialization patterns -- like Detroit in mechanical engineering and San Diego in biotech -- have proven remarkably persistent.
        </p>
      </aside>

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
        insight="The coastal concentration of patent activity reflects the clustering of technology firms, research universities, and venture capital in a handful of innovation ecosystems."
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
        insight="California alone accounts for roughly one-fifth of all US patent activity, driven by the Silicon Valley ecosystem of venture capital, universities, and tech firms."
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
          insight="California's accelerating divergence from other states since the 1990s reflects the compounding advantages of Silicon Valley's innovation ecosystem."
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
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
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
        insight="City-level data reveals even more extreme concentration than state-level figures, with a handful of tech hubs accounting for a vastly disproportionate share of national innovation output."
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
        insight="Japan's dominant position reflects decades of corporate R&D investment, while South Korea's rapid rise mirrors Samsung and LG's aggressive patent strategies."
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
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
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
          insight="The geographic concentration of innovation creates self-reinforcing cycles — talent, capital, and knowledge spillovers cluster in established hubs with distinctive technology specializations."
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
          insight="Inventor mobility is a critical mechanism for knowledge diffusion, carrying tacit knowledge and professional networks from one innovation hub to another."
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
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
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
          insight="The dominant migration corridors reveal the gravitational pull of major technology clusters, with California as both the largest source and destination of inventor talent."
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
          insight="The United States serves as the primary global hub for inventor migration, connecting East Asian, European, and other innovation ecosystems through flows of talented researchers."
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

      <SectionDivider label="Innovation Diffusion" />
      <Narrative>
        <p>
          How do new technologies spread geographically from early hubs to secondary cities?
          Tracking patent activity in AI, Biotech &amp; Pharma, and Clean Energy across cities
          reveals the diffusion pattern: innovations typically emerge in a few pioneering
          locations before spreading as knowledge and talent disperse.
        </p>
      </Narrative>
      {diffusionSummary.length > 0 && (
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
          All three technology areas show a clear diffusion pattern: early concentration in
          a handful of pioneering cities followed by geographic spread. AI patenting was
          heavily concentrated in Silicon Valley and a few East Coast hubs in the 1990s but
          has since spread to dozens of cities worldwide. Biotech shows a similar pattern
          anchored by Boston, San Francisco, and San Diego. Clean energy patenting remains
          more geographically dispersed, reflecting the diverse nature of renewable
          technologies.
        </p>
      </KeyInsight>

      <SectionDivider label="Regional Specialization" />
      <Narrative>
        <p>
          Which cities punch above their weight in specific technologies? The Location
          Quotient (LQ) measures a city&apos;s relative specialization: an LQ above 1 means the
          city has a higher share of that technology than the national average. High LQ
          values reveal distinctive innovation ecosystems.
        </p>
      </Narrative>
      {topSpecializations.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Most Specialized Innovation Hubs (2010-2025, LQ &ge; 1.5)</h3>
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
          Regional specialization reveals the distinctive innovation DNA of American cities.
          Detroit&apos;s mechanical engineering specialization reflects its automotive heritage.
          San Diego stands out for Human Necessities (biotech/pharma) alongside its military
          technology base. Research Triangle cities in North Carolina show strong chemistry
          specialization. These patterns suggest that innovation ecosystems develop persistent
          comparative advantages shaped by local industry, universities, and talent pools.
        </p>
      </KeyInsight>

      <Narrative>
        Having explored where innovation happens, the next chapter examines how inventors and organizations connect across these geographic boundaries.
        The collaboration networks that link inventors, firms, and countries are the channels through which knowledge flows -- and their structure reveals whether the innovation ecosystem is becoming more interconnected or more fragmented.
      </Narrative>

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        Inventor mobility is inferred from changes in reported location between sequential
        patents by the same disambiguated inventor. Innovation diffusion tracks patent activity in AI, Biotech & Pharma, and Clean Energy across cities with 5+ patents per period. Regional specialization uses Location Quotient (LQ) computed for US cities with 500+ patents (2010-2025).
      </DataNote>

      <RelatedChapters currentChapter={5} />
      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
