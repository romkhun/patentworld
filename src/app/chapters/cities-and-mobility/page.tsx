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
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import Link from 'next/link';
import type { TopCity, StatePerYear, InventorFlow, RegionalSpecialization } from '@/lib/types';

export default function CitiesAndMobilityChapter() {
  const { data: cities, loading: ciL } = useChapterData<TopCity[]>('chapter4/top_cities.json');
  const { data: statesPerYear, loading: spyL } = useChapterData<StatePerYear[]>('chapter4/us_states_per_year.json');
  const { data: stateFlows, loading: sfL } = useChapterData<InventorFlow[]>('chapter4/inventor_state_flows.json');
  const { data: diffusionSummary } = useChapterData<{ tech_area: string; periods: { period: string; total_cities: number; total_patents: number }[] }[]>('chapter4/innovation_diffusion_summary.json');
  const { data: regionalSpec } = useChapterData<RegionalSpecialization[]>('chapter4/regional_specialization.json');

  const topCities = useMemo(() => {
    if (!cities) return [];
    return cities.map((d) => ({
      ...d,
      label: `${d.city}, ${d.state}`,
    }));
  }, [cities]);

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

  const topStateFlows = useMemo(() => {
    if (!stateFlows) return [];
    return stateFlows.slice(0, 30).map((d) => ({
      ...d,
      label: `${d.from_state} → ${d.to_state}`,
    }));
  }, [stateFlows]);

  const topSpecializations = useMemo(() => {
    if (!regionalSpec) return [];
    return [...regionalSpec]
      .filter(d => d.location_quotient >= 1.5)
      .sort((a, b) => b.location_quotient - a.location_quotient)
      .slice(0, 30);
  }, [regionalSpec]);

  return (
    <div>
      <ChapterHeader
        number={22}
        title="Cities & Mobility"
        subtitle="City-level innovation clusters and inventor migration patterns"
      />

      <KeyFindings>
        <li>City-level data reveal even more pronounced geographic concentration than state-level figures, with San Jose (96,068), San Diego (70,186), and Austin (53,595) leading all US cities in total patent output.</li>
        <li>California&apos;s patent output has diverged sharply from other leading states, reaching 4.0x Texas by 2024, driven by the accelerating growth of the Silicon Valley ecosystem.</li>
        <li>California accounts for 54.9% of all interstate inventor migration, with 127,466 inflows and 118,630 outflows, functioning as both the largest source and destination of inventor talent.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          City-level analysis reveals even more extreme innovation concentration than state-level data, with San Jose, San Diego, and Austin leading all US cities. California&apos;s patent output has diverged sharply from other states since the 1990s, reaching 4.0x Texas by 2024. Interstate inventor migration corridors show California at the center, accounting for 54.9% of all domestic inventor moves.
        </p>
      </aside>

      <Narrative>
        <p>
          The state-level concentration documented in <Link href="/chapters/domestic-geography" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Domestic Geography</Link> becomes even more pronounced at finer geographic scales. City-level analysis reveals that a small number of technology hubs account for a disproportionate share of national innovation output, with distinctive regional specializations exhibiting strong path dependence.
        </p>
        <p>
          Beyond static snapshots of where innovation occurs, temporal trends reveal accelerating divergence between leading and trailing states, while inventor mobility data illuminate how talent circulates across domestic innovation ecosystems. These patterns of geographic clustering, diffusion, and mobility shape the channels through which knowledge flows across the United States.
        </p>
      </Narrative>

      {/* --- State Temporal Trends --- */}
      <SectionDivider label="State Temporal Trends" />

      {stateTimePivot.length > 0 && (
        <ChartContainer
          id="fig-geography-state-trends"
          subtitle="Annual patent grants for the top 10 states by total output, showing diverging trajectories over time."
          title="California's Patent Output Has Diverged Sharply from Other Leading States, Reaching 4.0x Texas by 2024"
          caption="This chart displays annual patent grants for the 10 leading states by total output from 1976 to 2025. California exhibits an accelerating divergence from the second-ranked state beginning in the mid-1990s, with the gap widening in each subsequent decade."
          insight="California's accelerating divergence from other states since the 1990s is consistent with compounding advantages observed in self-reinforcing innovation ecosystems."
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

      {/* --- City-Level Rankings --- */}
      <SectionDivider label="City-Level Rankings" />

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
          Regional specialization reveals the distinctive innovation profiles of US cities.
          Detroit&apos;s automotive-related technologies concentration reflects its automotive heritage.
          San Diego exhibits a pronounced concentration in Electricity, reflecting its semiconductor and wireless technology base. Durham and Chapel Hill demonstrate strong chemistry
          specialization. These patterns suggest that innovation ecosystems develop persistent
          comparative advantages shaped by local industry, universities, and talent pools.
        </p>
      </KeyInsight>

      {/* --- Domestic Inventor Mobility --- */}
      <SectionDivider label="Domestic Inventor Mobility" />

      <Narrative>
        <p>
          The static snapshots of state and city patent output presented above capture where innovation occurs, but not how inventors move across these domestic regions over the course of their careers. Tracking individual inventors across their patent histories reveals patterns of{' '}
          <StatCallout value="geographic mobility" /> -- the manner in which innovators relocate between states, carrying tacit knowledge and professional networks with them.
        </p>
      </Narrative>

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

      <Narrative>
        <p>
          The city-level concentration and domestic mobility patterns documented here reveal the fine-grained geography of US innovation. The next chapter, <Link href="/chapters/international-geography" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">International Geography</Link>, extends this analysis across national borders, examining how foreign filings and international inventor mobility have transformed the US patent system into a global institution.
        </p>
      </Narrative>

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        Inventor mobility is inferred from changes in reported location between sequential
        patents by the same disambiguated inventor. Innovation diffusion tracks patent activity in AI, Biotech & Pharma, and Clean Energy across cities with 5+ patents per period. Regional specialization uses Location Quotient (LQ) computed for US cities with 500+ patents (2010-2025).
      </DataNote>

      <RelatedChapters currentChapter={22} />
      <ChapterNavigation currentChapter={22} />
    </div>
  );
}
