'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import Link from 'next/link';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, COUNTRY_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  AssigneeTypePerYear, TopAssignee, DomesticVsForeign,
  NonUSBySection,
} from '@/lib/types';

function pivotByCategory(data: AssigneeTypePerYear[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.category] = d.count; });
    return row;
  });
}

function pivotByOrigin(data: DomesticVsForeign[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.origin] = d.count; });
    return row;
  });
}

export default function AssigneeLandscape() {
  const { data: types, loading: typL } = useChapterData<AssigneeTypePerYear[]>('chapter3/assignee_types_per_year.json');
  const { data: top } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: dvf, loading: dvfL } = useChapterData<DomesticVsForeign[]>('chapter3/domestic_vs_foreign.json');
  const { data: nonUS, loading: nuL } = useChapterData<NonUSBySection[]>('chapter3/non_us_by_section.json');

  const typePivot = useMemo(() => types ? pivotByCategory(types) : [], [types]);
  const categories = useMemo(() => types ? [...new Set(types.map((d) => d.category))] : [], [types]);
  const originPivot = useMemo(() => dvf ? pivotByOrigin(dvf) : [], [dvf]);

  const topOrgName = top?.[0]?.organization ? cleanOrgName(top[0].organization) : 'IBM';

  const { nonUSPivot, nonUSCountryAreas } = useMemo(() => {
    if (!nonUS) return { nonUSPivot: [], nonUSCountryAreas: [] };
    const countries = [...new Set(nonUS.map(d => d.country))];
    const years = [...new Set(nonUS.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      nonUS.filter(d => d.year === year).forEach(d => { row[d.country] = (row[d.country] as number || 0) + d.count; });
      return row;
    });
    const totals = countries.map(c => ({
      country: c,
      total: nonUS.filter(d => d.country === c).reduce((s, d) => s + d.count, 0),
    })).sort((a, b) => b.total - a.total);
    const areas = totals.map(c => ({
      key: c.country,
      name: c.country,
      color: COUNTRY_COLORS[c.country] ?? '#999999',
    }));
    return { nonUSPivot: pivoted, nonUSCountryAreas: areas };
  }, [nonUS]);

  return (
    <div>
      <ChapterHeader
        number={8}
        title="The Assignee Landscape"
        subtitle="Corporate, foreign, and country-level composition of patent assignees"
      />

      <KeyFindings>
        <li>Corporations hold the substantial majority of US patents, growing from 94% to 99% of annual grants between 1976 and 2024, while individual inventors constitute a progressively smaller fraction.</li>
        <li>Foreign assignees surpassed US-based assignees around 2007 and now account for approximately 53% of patent grants in the 2020s, reflecting the globalization of R&amp;D.</li>
        <li>Japan accounts for 1.4 million US patents since 1976, with South Korea (359K) and China (222K) rising rapidly as successive waves of international entry reshape the patent system.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Corporate assignees now account for 99% of US patent grants, up from 94% in 1976. Foreign assignees surpassed domestic filers around 2007, driven by Japan (1.4 million cumulative patents), South Korea, and China. The US patent system has become the de facto global standard for protecting high-value inventions regardless of assignee nationality.
        </p>
      </aside>

      <Narrative>
        <p>
          The composition of patent assignees reveals fundamental shifts in who participates in the US patent system. Over five decades, three interrelated trends have reshaped the landscape: the progressive corporatization of patenting, the transition from domestic to foreign-majority filings, and the sequential entry of new national origins led by Japan, South Korea, and China. These structural changes reflect broader geopolitical shifts in research and development investment and the internationalization of technology-intensive industries.
        </p>
        <p>
          This chapter examines the system-level composition of patent assignees, from the dominance of corporate entities to the geographic rebalancing of the patent system. The <Link href="/chapters/firm-rankings" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> turns to the individual firm rankings and output trajectories that underlie these aggregate patterns.
        </p>
      </Narrative>

      {/* ── Corporatization of Patenting ── */}

      <Narrative>
        <p>
          The substantial majority of patents are held by corporations. Over the decades, the share of
          patents assigned to companies has grown steadily, while individual inventors
          constitute a progressively smaller fraction. <StatCallout value={topOrgName} /> leads all
          organizations in cumulative patent grants.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-assignee-landscape-assignee-types"
        title="Corporate Assignees Grew From 94% to 99% of US Patent Grants Between 1976 and 2024"
        subtitle="Share of utility patents by assignee category (corporate, individual, government, university), measured as percentage of annual grants, 1976-2025"
        caption="Share of utility patents by assignee category (primary assignee), 1976-2025. Corporate entities have progressively expanded their share, while individual inventors and government entities have declined proportionally."
        insight="The Bayh-Dole Act (1980) enabled university patenting, but the predominant trend is the rise of corporate R&amp;D as patent portfolios became strategic assets for cross-licensing and competitive signaling."
        loading={typL}
      >
        <PWAreaChart
          data={typePivot}
          xKey="year"
          areas={categories.map((cat, i) => ({
            key: cat,
            name: cat,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          stackedPercent
          yLabel="Share of Patents (%)"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 1995] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The corporatization of patenting constitutes one of the most pronounced long-term trends. In the
          late 1970s, government entities held a modest share (~4%) of
          patent grants. By the 2020s, large corporations account for the substantial majority of all grants.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The Bayh-Dole Act of 1980 enabled universities and small businesses to patent
          federally funded inventions, contributing to increased institutional patenting. However,
          the predominant trend is the rise of corporate R&amp;D: as patent portfolios became strategic
          assets for cross-licensing, defensive protection, and competitive signaling, large
          firms invested substantially in systematic patent generation.
        </p>
      </KeyInsight>

      {/* ── Domestic vs. Foreign ── */}

      <SectionDivider label="Domestic vs. Foreign Assignees" />

      <ChartContainer
        id="fig-assignee-landscape-domestic-vs-foreign"
        title="Foreign Assignees Surpassed US-Based Assignees Around 2007 and Reached 54.5% of Grants by 2024"
        subtitle="Annual patent grants by US-based versus foreign-based primary assignees, 1976-2025"
        caption="Patent grants by US-based versus foreign-based primary assignees, 1976-2025. Foreign assignees surpassed US-based assignees around 2007 and now account for approximately 51-56% of grants in the 2020s."
        insight="The shift to a foreign-majority patent system reflects the globalization of R&amp;D. The US patent system functions as the de facto global standard for protecting high-value inventions regardless of assignee nationality."
        loading={dvfL}
      >
        <PWLineChart
          data={originPivot}
          xKey="year"
          lines={[
            { key: 'US', name: 'US', color: CHART_COLORS[0] },
            { key: 'Foreign', name: 'Foreign', color: CHART_COLORS[3], dashPattern: '8 4' },
          ]}
          yLabel="Number of Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 1995, 2008] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Foreign assignees surpassed US-based assignees around 2007 and now account for the
          majority of patent grants, averaging approximately 53% in the 2020s. This shift reflects the globalization of R&amp;D: multinational firms
          file strategically in the US regardless of headquarter location, and the US patent
          system has become the de facto global standard for protecting high-value inventions.
        </p>
      </KeyInsight>

      {/* ── The Rise of Non-US Assignees ── */}

      <SectionDivider label="The Rise of Non-US Assignees" />

      <Narrative>
        <p>
          The national origin of US patent holders has shifted substantially over five decades.
          In the late 1970s, over 60% of US utility patents were granted to domestic assignees.
          By the 2020s, that share had declined to below half, with foreign assignees averaging approximately 53% and the largest increases
          attributable to South Korean and Chinese assignees, particularly in electronics and telecommunications.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-assignee-landscape-non-us-assignees"
        title="Japan Accounts for 1.4 Million US Patents Since 1976, With South Korea (359K) and China (222K) Rising Rapidly"
        subtitle="Annual patent grants by primary assignee country/region, showing successive waves of international entry, 1976-2025"
        caption="Annual patent grants by primary assignee country/region, 1976-2025. Categories: United States, Japan, South Korea, China, Germany, Rest of Europe, Rest of World. The stacked area chart reveals sequential waves of international entry into the US patent system."
        insight="Japan drove the first wave of non-US patenting in the 1980s-90s, particularly in automotive and electronics. South Korea emerged as a major presence in the 2000s, while China's share has grown rapidly since 2010, concentrated primarily in telecommunications and computing."
        loading={nuL}
        height={500}
        wide
      >
        <PWAreaChart
          data={nonUSPivot}
          xKey="year"
          areas={nonUSCountryAreas}
          stacked
          yLabel="Number of Patents"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The internationalization of US patents reflects the globalization of R&amp;D.
          While the US remains the single largest origin country, the combined share of
          East Asian economies (Japan, South Korea, China) now exceeds the US share in
          several technology areas. This shift has been most pronounced in semiconductors
          and display technology, where Korean and Japanese firms hold dominant positions.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The assignee landscape has undergone a structural transformation over five decades. Corporate entities now dominate patenting, foreign assignees have surpassed domestic filers, and sequential waves of international entry have reshaped the geographic composition of the patent system. These system-level trends set the stage for examining the <Link href="/chapters/firm-rankings" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">individual firm rankings and output trajectories</Link> that drive the aggregate patterns documented here.
        </p>
      </Narrative>

      <DataNote>
        Assignee data employ disambiguated identities from PatentsView. The primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Country of origin is determined by the primary assignee&apos;s location. Non-US breakdown
        uses CPC section-level classification aggregated by assignee country. All figures
        cover utility patents granted 1976-2025.
      </DataNote>

      <RelatedChapters currentChapter={8} />
      <ChapterNavigation currentChapter={8} />
    </div>
  );
}
