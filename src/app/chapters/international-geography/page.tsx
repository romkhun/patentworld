'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import dynamic from 'next/dynamic';
const PWWorldFlowMap = dynamic(() => import('@/components/charts/PWWorldFlowMap').then(m => ({ default: m.PWWorldFlowMap })), { ssr: false });
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { PWSeriesSelector } from '@/components/charts/PWSeriesSelector';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import Link from 'next/link';
import type { CountryPerYear, InventorFlow, InventorMobilityTrend } from '@/lib/types';

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

export default function InternationalGeographyChapter() {
  const { data: countries, loading: coL } = useChapterData<CountryPerYear[]>('chapter4/countries_per_year.json');
  const { data: countryFlows, loading: cfL } = useChapterData<InventorFlow[]>('chapter4/inventor_country_flows.json');
  const { data: mobilityTrend, loading: mtL } = useChapterData<InventorMobilityTrend[]>('chapter4/inventor_mobility_trend.json');

  const [selectedCountrySeries, setSelectedCountrySeries] = useState<Set<string>>(new Set());

  const { pivoted: countryPivot, countries: topCountryNames } = useMemo(() => {
    if (!countries) return { pivoted: [], countries: [] };
    const result = pivotCountries(countries);
    if (result.countries.length > 0 && selectedCountrySeries.size === 0) {
      setTimeout(() => setSelectedCountrySeries(new Set(result.countries.slice(0, 5))), 0);
    }
    return result;
  }, [countries, selectedCountrySeries.size]);

  return (
    <div>
      <ChapterHeader
        number={23}
        title="International Geography"
        subtitle="Cross-border mobility and international patent filing trends"
      />

      <KeyFindings>
        <li>International inventor mobility rose from 1.3% in 1980 to 5.1% in 2024, surpassing domestic interstate mobility rates of 3.5%.</li>
        <li>Japan leads foreign patent filings with 1.45 million US patents, while China grew from 299 filings in 2000 to 30,695 in 2024, reflecting a fundamental shift in global inventive activity.</li>
        <li>The United States is involved in 77.6% of all international inventor migration flows (509,639 of 656,397 moves), functioning as the central hub connecting innovation ecosystems worldwide.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          International inventor mobility has risen from 1.3% to 5.1% over four decades, now surpassing domestic interstate rates. Japan leads foreign filings with 1.45 million US patents, but China&apos;s explosive growth -- from 299 filings in 2000 to 30,695 in 2024 -- has transformed the competitive landscape. The United States sits at the center of 77.6% of all cross-border inventor migration, serving as the global nexus for the circulation of inventive talent.
        </p>
      </aside>

      <Narrative>
        <p>
          The domestic concentration documented in <Link href="/chapters/domestic-geography" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Domestic Geography</Link> and <Link href="/chapters/cities-and-mobility" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Cities & Mobility</Link> is paralleled by a transformation in the international origins of US patent filings. Successive waves of foreign filings from Japan, South Korea, and more recently China have reshaped the composition of the US patent system, while cross-border inventor mobility has increased steadily over the study period.
        </p>
        <p>
          This chapter examines the international dimension of innovation geography through two lenses: country-level filing trends that reveal the evolving composition of foreign patent activity, and inventor mobility patterns that illuminate how researchers and engineers move across national borders, carrying knowledge and professional networks between innovation ecosystems.
        </p>
      </Narrative>

      {/* --- International Inventor Mobility Trend --- */}
      <SectionDivider label="International Inventor Mobility" />

      <Narrative>
        <p>
          Inventor mobility data reveal how researchers and engineers move across national borders over the course of their careers. International mobility rates have risen steadily and now surpass domestic interstate rates, reflecting the increasingly global nature of innovation talent flows.
        </p>
      </Narrative>

      {mobilityTrend && mobilityTrend.length > 0 && (
        <ChartContainer
          id="fig-geography-inventor-mobility-trend"
          subtitle="Domestic and international inventor mobility rates over time, measured as the share of patents filed by inventors who changed location since their prior patent."
          title="International Inventor Mobility Rose from 1.3% (1980) to 5.1% (2024), Surpassing Domestic Rates of 3.5%"
          caption="This chart displays the percentage of patents filed by inventors who relocated from a different state or country since their previous patent. Both domestic (interstate) and international mobility rates exhibit upward trends over the study period."
          insight="Inventor mobility represents a potential mechanism for knowledge diffusion, as mobile inventors may carry tacit knowledge and professional networks from one region to another."
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
          careers, a significant minority relocates between countries, carrying
          knowledge and professional networks with them. International mobility has surpassed domestic interstate mobility in recent years, reflecting the increasingly global circulation of inventive talent.
        </p>
      </KeyInsight>

      {/* --- Country-Level Filing Trends --- */}
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
        title="Japan Leads Foreign Patent Filings with 1.45 Million, While China Grew from 299 (2000) to 30,695 (2024)"
        caption="This chart displays annual utility patent grants by primary inventor country for the top 15 countries by total output. Japan maintained the largest foreign share through the 1990s, while South Korea and China have demonstrated the most pronounced growth in the 2000s and 2010s respectively."
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
          increased their filings. By the late 2000s, foreign-origin inventors accounted
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

      {/* --- Global Inventor Migration Flows --- */}
      <SectionDivider label="Global Inventor Migration Flows" />

      <Narrative>
        <p>
          Beyond country-level filing volumes, the map below visualizes the dominant cross-border migration corridors that connect national innovation ecosystems. The United States emerges as the central node, linking East Asian, European, and other innovation systems through flows of researchers and engineers.
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
        Having examined the spatial distribution of innovation -- both domestic concentration patterns and international filing and mobility trends -- the subsequent chapter investigates how inventors and organizations connect across these geographic boundaries through <Link href="/chapters/network-structure" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Collaboration Networks</Link>.
        These networks constitute the channels through which knowledge flows, and their structure, explored further in <Link href="/chapters/citation-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent Quality</Link>, indicates whether the innovation ecosystem is becoming more interconnected or more fragmented over time.
      </Narrative>

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        Inventor mobility is inferred from changes in reported location between sequential
        patents by the same disambiguated inventor. International flows track cross-border moves based on sequential patents filed from different countries.
      </DataNote>

      <RelatedChapters currentChapter={23} />
      <ChapterNavigation currentChapter={23} />
    </div>
  );
}
