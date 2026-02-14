'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { RankingTable } from '@/components/chapter/RankingTable';
import Link from 'next/link';
import { PWSeriesSelector } from '@/components/charts/PWSeriesSelector';
import { CHART_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  TopAssignee, OrgOverTime,
} from '@/lib/types';

export default function FirmRankings() {
  const { data: top, loading: topL } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: orgsTime, loading: orgL } = useChapterData<OrgOverTime[]>('chapter3/top_orgs_over_time.json');

  const [selectedOrgSeries, setSelectedOrgSeries] = useState<Set<string>>(new Set());

  const topOrgs = useMemo(() => {
    if (!top) return [];
    return top.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [top]);

  const topOrgName = top?.[0]?.organization ? cleanOrgName(top[0].organization) : 'IBM';

  // Company output over time line chart
  const { orgOutputPivot, orgOutputNames } = useMemo(() => {
    if (!orgsTime) return { orgOutputPivot: [], orgOutputNames: [] };
    const totals = new Map<string, number>();
    orgsTime.forEach((d) => {
      totals.set(d.organization, (totals.get(d.organization) ?? 0) + d.count);
    });
    const top10 = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([org]) => org);
    const top10Clean = top10.map((org) => cleanOrgName(org));
    const years = [...new Set(orgsTime.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: any = { year };
      orgsTime.filter((d) => d.year === year && top10.includes(d.organization))
        .forEach((d) => { row[cleanOrgName(d.organization)] = d.count; });
      return row;
    });
    if (top10Clean.length > 0 && selectedOrgSeries.size === 0) {
      setTimeout(() => setSelectedOrgSeries(new Set(top10Clean.slice(0, 5))), 0);
    }
    return { orgOutputPivot: pivoted, orgOutputNames: top10Clean };
  }, [orgsTime, selectedOrgSeries.size]);

  return (
    <div>
      <ChapterHeader
        number={9}
        title="Firm Grant Rankings"
        subtitle="Patent output rankings and trajectories of leading organizations"
      />

      <KeyFindings>
        <li>IBM leads with 161,888 cumulative utility patent grants, but Samsung trails by fewer than 4,000 patents and has surpassed IBM in annual output since 2007.</li>
        <li>GE held rank 1 for six consecutive years (1980-1985) before Japanese and then Korean firms rose to dominance, reflecting three distinct eras of organizational leadership.</li>
        <li>Samsung peaked at 9,716 annual grants in 2024, overtaking IBM which peaked at 9,257 in 2019, illustrating divergent corporate patent strategies.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          IBM leads all organizations with 161,888 cumulative patent grants, but Samsung has narrowed the gap to fewer than 4,000 patents. The rank heatmap reveals three distinct eras of organizational leadership -- GE dominance in the early 1980s, the rise of Japanese electronics firms in the 1990s, and the ascendancy of Korean firms since the 2000s. Samsung peaked at 9,716 annual grants in 2024, reflecting the globalization of technology leadership.
        </p>
      </aside>

      <Narrative>
        <p>
          While the <Link href="/chapters/assignee-landscape" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">previous chapter</Link> examined the system-level composition of patent assignees, this chapter focuses on the individual organizations that drive these aggregate patterns. The cumulative rankings, annual trajectories, and sequential transitions in leadership reveal how corporate patent strategies have evolved over five decades.
        </p>
        <p>
          The rankings are dominated by technology firms and Asian corporations. Organizations such as Samsung, Canon, and LG have risen substantially since the 1990s, challenging the traditional dominance of US-based firms such as {topOrgName} and General Electric. Asian firms now account for over half of the top 25 patent holders.
        </p>
      </Narrative>

      {/* ── Cumulative Rankings ── */}

      <ChartContainer
        id="fig-firm-rankings-top-assignees"
        title="IBM Leads With 161,888 Cumulative Grants, but Samsung Trails by Fewer Than 4,000 Patents"
        subtitle="Top organizations ranked by cumulative utility patent grants, 1976-2025"
        caption="Organizations ranked by total utility patents granted, 1976-2025. Japanese and Korean firms occupy a majority of the top positions alongside US-based technology firms."
        insight="The ranking demonstrates the global nature of US patent activity. Japanese and Korean firms compete directly with US-based technology firms for the leading positions, reflecting the internationalization of technology-intensive industries."
        loading={topL}
        height={1400}
      >
        <PWBarChart
          data={topOrgs}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top assignees as a data table"
        headers={['Organization', 'Total Patents']}
        rows={(top ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.total_patents])}
        caption="Top 15 organizations by cumulative utility patent grants, 1976-2025. Source: PatentsView."
      />

      <Narrative>
        <p>
          The ranking is dominated by technology firms and Asian corporations.
          Organizations such as Samsung, Canon, and LG have risen substantially since the 1990s,
          challenging the traditional dominance of US-based firms such as IBM and General Electric.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Asian firms account for over half of the top 25 patent holders. Samsung first surpassed
          IBM in annual patent grants in 2007, a shift that reflects the globalization of technology
          leadership and the strategic importance of patent portfolios in international competition.
        </p>
      </KeyInsight>

      {/* ── Rank Heatmap ── */}

      <Narrative>
        <p>
          The rank heatmap below reveals distinct eras of organizational dominance. Certain firms
          have maintained leading positions for decades, while others have ascended or declined
          as their core technologies evolved.
        </p>
      </Narrative>

      {orgsTime && orgsTime.length > 0 && (
        <ChartContainer
          id="fig-firm-rankings-rank-heatmap"
          title="GE Held Rank 1 for 6 Consecutive Years (1980-1985) Before Japanese and Korean Firms Rose to Dominance"
          subtitle="Annual grant rankings of the top 15 patent-holding organizations, with darker cells indicating higher rank, 1976-2025"
          caption="Rank heatmap depicting the annual grant rankings of the top 15 patent-holding organizations over time. Darker cells indicate higher rank. The visualization reveals sequential transitions in organizational leadership from US-based to Japanese to Korean firms."
          insight="Three distinct eras are evident: GE dominance (1970s-80s), the rise of Japanese electronics firms (1980s-90s), and the ascendancy of Korean firms (2000s-present). These shifts correspond to broader geopolitical changes in R&amp;D investment patterns."
          loading={orgL}
          height={850}
        >
          <PWRankHeatmap
            data={orgsTime.filter((d) => d.rank <= 15).map((d) => ({ ...d, organization: cleanOrgName(d.organization) }))}
            nameKey="organization"
            yearKey="year"
            rankKey="rank"
            maxRank={15}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The heatmap indicates three distinct eras: GE dominance of the 1970s-80s, the
          rise of Japanese electronics firms (Canon, Hitachi, Toshiba) in the 1980s-90s, and
          the ascendancy of Korean firms (Samsung, LG) since the 2000s. These transitions reflect broader
          geopolitical shifts in technology leadership and R&amp;D investment.
        </p>
      </KeyInsight>

      {/* ── Output Trajectories ── */}

      {orgOutputPivot.length > 0 && (
        <>
          <PWSeriesSelector
            items={orgOutputNames.map((name, i) => ({
              key: name,
              name: name.length > 25 ? name.slice(0, 22) + '...' : name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            selected={selectedOrgSeries}
            onChange={setSelectedOrgSeries}
            defaultCount={5}
          />
          <ChartContainer
            id="fig-firm-rankings-org-output-trends"
            title="Samsung Peaked at 9,716 Annual Grants in 2024, Overtaking IBM Which Peaked at 9,257 in 2019"
            subtitle="Annual patent grants for the 10 historically top-ranked organizations, with selectable series, 1976-2025"
            caption="Annual patent grants for the 10 historically top-ranked organizations, 1976-2025. The data reveal divergent trajectories, with certain firms exhibiting sustained growth and others demonstrating gradual decline over the five-decade period."
            insight="The divergence between IBM's declining trajectory and Samsung's sustained ascent illustrates how corporate patent strategies differ. IBM shifted toward services while Samsung invested extensively in hardware and electronics R&amp;D."
            loading={orgL}
            interactive
            statusText={`Showing ${selectedOrgSeries.size} of ${orgOutputNames.length} organizations`}
          >
            <PWLineChart
              data={orgOutputPivot}
              xKey="year"
              lines={orgOutputNames
                .filter((name) => selectedOrgSeries.has(name))
                .map((name, _i) => ({
                  key: name,
                  name: name.length > 25 ? name.slice(0, 22) + '...' : name,
                  color: CHART_COLORS[orgOutputNames.indexOf(name) % CHART_COLORS.length],
                }))}
              yLabel="Number of Patents"
            />
          </ChartContainer>
        </>
      )}

      <KeyInsight>
        <p>
          The patent output trajectories of leading organizations reveal substantial divergence
          over time. While IBM maintained consistently high output for decades before declining,
          Samsung and Canon demonstrated sustained growth trajectories from the 1980s onward. These
          patterns reflect fundamental differences in corporate R&amp;D strategies, from IBM&apos;s shift
          toward services to Samsung&apos;s extensive technology diversification.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The firm grant rankings reveal a patent system in which leadership is dynamic and contested. IBM&apos;s cumulative dominance is narrowing as Samsung closes the gap, and the sequential transitions from US to Japanese to Korean leadership illustrate how corporate patent strategies evolve in response to broader technological and geopolitical forces. The <Link href="/chapters/market-concentration" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> examines the structural concentration of patenting among these elite organizations, design patent leadership, and the question of how few firms survive at the top across multiple decades.
        </p>
      </Narrative>

      <DataNote>
        Assignee data employ disambiguated identities from PatentsView. The primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Rankings are based on cumulative utility patent grants, 1976-2025. The rank heatmap
        tracks the top 15 organizations by annual grant count. Organization names are cleaned
        and standardized for display purposes.
      </DataNote>

      <RelatedChapters currentChapter={9} />
      <ChapterNavigation currentChapter={9} />
    </div>
  );
}
