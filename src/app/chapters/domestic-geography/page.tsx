'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import dynamic from 'next/dynamic';
const PWChoroplethMap = dynamic(() => import('@/components/charts/PWChoroplethMap').then(m => ({ default: m.PWChoroplethMap })), { ssr: false });
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { RankingTable } from '@/components/chapter/RankingTable';
import Link from 'next/link';
import type { StateSummary, StateSpecialization } from '@/lib/types';

export default function DomesticGeographyChapter() {
  const { data: states, loading: stL } = useChapterData<StateSummary[]>('chapter4/us_states_summary.json');
  const { data: spec, loading: spL } = useChapterData<StateSpecialization[]>('chapter4/state_specialization.json');

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

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');
  const topStateName = states?.[0]?.state ?? 'California';

  return (
    <div>
      <ChapterHeader
        number={21}
        title="Domestic Geography"
        subtitle="State-level patent concentration and technology specialization"
      />

      <KeyFindings>
        <li>Patent activity is disproportionately concentrated geographically: the top five US states (California, Texas, New York, Massachusetts, and Michigan) account for approximately 46% of all grants.</li>
        <li>California alone accounts for 23.6% of all US patent grants, producing more patents (992,708) than the bottom 30 states and territories combined (314,664).</li>
        <li>States exhibit distinctive technology specialization profiles: Michigan devotes 20.1% of its patents to Mechanical Engineering compared to California&apos;s 65.1% concentration in Physics and Electricity.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Patent activity concentrates in a handful of coastal states, with California alone producing 992,708 patents -- exceeding the bottom 30 states and territories combined. The top five states account for approximately 46% of all US patent grants, and each has developed distinctive technology specialization profiles shaped by regional industry, universities, and talent pools.
        </p>
      </aside>

      <Narrative>
        <p>
          Innovation activity is not evenly distributed across geographic space. Within the United States, a small number of states and metropolitan areas account for the majority of patent output. This chapter examines the domestic geography of innovation at the state level, including cumulative rankings and technology specialization profiles.
        </p>
        <p>
          The concentration documented here reflects the co-location of technology firms, research universities, and venture capital in a small number of self-reinforcing innovation ecosystems. These patterns of geographic clustering have strengthened rather than diminished over the digital era, suggesting that physical proximity continues to confer substantial advantages in the innovation process.
        </p>
      </Narrative>

      {/* --- Region / State-Level --- */}
      <SectionDivider label="State and Regional Patterns" />

      <Narrative>
        <p>
          Within the United States, patent activity concentrates in a small number of states and metropolitan areas. The following sections examine this domestic geography at the state level, including cumulative rankings and technology specialization patterns.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-geography-state-choropleth"
        subtitle="Total utility patents by primary inventor state (1976-2025), displayed as a choropleth map with darker shading for higher counts."
        title="Patent Activity Concentrates on the Coasts, with California's 992,708 Patents Exceeding the Bottom 30 States and Territories Combined (314,664)"
        caption="This choropleth map displays total utility patents by primary inventor state from 1976 to 2025, with darker shading indicating higher patent counts. The coastal concentration is pronounced, with California, New York, and Texas exhibiting the highest totals."
        insight="The coastal concentration of patent activity is associated with the co-location of technology firms, research universities, and venture capital in a small number of self-reinforcing innovation ecosystems."
        loading={stL}
        height={650}
      >
        <PWChoroplethMap data={statePatentMap} valueLabel="Patents" />
      </ChartContainer>

      <KeyInsight>
        <p>
          Innovation activity is disproportionately concentrated in coastal states. California alone accounts for more
          patents than the bottom 30 states and territories combined, indicating the predominant role of Silicon Valley
          in US patenting activity.
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

      <SectionDivider label="Technology Specialization" />

      {specByState.length > 0 && (
        <ChartContainer
          id="fig-geography-state-specialization"
          subtitle="CPC technology section distribution by state, shown as 100% stacked bars to reveal distinctive regional specialization patterns."
          title="States Exhibit Distinctive Technology Profiles: Michigan Devotes 20.1% to Mechanical Engineering vs. California's 65.1% in Physics and Electricity"
          caption="This chart displays the CPC technology section distribution for all states by total patents, with each bar summing to 100%. States with pharmaceutical hubs show elevated Chemistry shares, while technology-oriented states concentrate in Electricity and Physics."
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
            yFormatter={(v) => `${v}%`}
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

      <Narrative>
        <p>
          The state-level patterns documented here reveal pronounced geographic concentration and distinctive technology specialization across the United States. The next chapter, <Link href="/chapters/cities-and-mobility" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Cities & Mobility</Link>, examines these patterns at a finer geographic scale, revealing even more extreme concentration at the city level along with temporal trends and inventor mobility patterns that illuminate how talent circulates across domestic innovation ecosystems.
        </p>
      </Narrative>

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        State specialization uses CPC technology section classifications.
      </DataNote>

      <RelatedChapters currentChapter={21} />
      <ChapterNavigation currentChapter={21} />
    </div>
  );
}
