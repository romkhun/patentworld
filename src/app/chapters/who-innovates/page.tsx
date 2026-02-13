'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import Link from 'next/link';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type {
  AssigneeTypePerYear, TopAssignee, OrgOverTime, DomesticVsForeign, Concentration,
  FirmCitationImpact, FirmTechEvolution,
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

export default function Chapter3() {
  const { data: types, loading: typL } = useChapterData<AssigneeTypePerYear[]>('chapter3/assignee_types_per_year.json');
  const { data: top, loading: topL } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: orgsTime, loading: orgL } = useChapterData<OrgOverTime[]>('chapter3/top_orgs_over_time.json');
  const { data: dvf, loading: dvfL } = useChapterData<DomesticVsForeign[]>('chapter3/domestic_vs_foreign.json');
  const { data: conc, loading: concL } = useChapterData<Concentration[]>('chapter3/concentration.json');
  const { data: citImpact, loading: citL } = useChapterData<FirmCitationImpact[]>('chapter3/firm_citation_impact.json');
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');

  const [selectedOrg, setSelectedOrg] = useState<string>('');

  const typePivot = useMemo(() => types ? pivotByCategory(types) : [], [types]);
  const categories = useMemo(() => types ? [...new Set(types.map((d) => d.category))] : [], [types]);
  const originPivot = useMemo(() => dvf ? pivotByOrigin(dvf) : [], [dvf]);

  const topOrgs = useMemo(() => {
    if (!top) return [];
    return top.map((d) => ({
      ...d,
      label: d.organization.length > 30 ? d.organization.slice(0, 27) + '...' : d.organization,
    }));
  }, [top]);

  const topOrgName = top?.[0]?.organization ?? 'IBM';

  const citData = useMemo(() => {
    if (!citImpact) return [];
    return citImpact.map((d) => ({
      ...d,
      label: d.organization.length > 28 ? d.organization.slice(0, 25) + '...' : d.organization,
    }));
  }, [citImpact]);

  // Company output over time line chart
  const { orgOutputPivot, orgOutputNames } = useMemo(() => {
    if (!orgsTime) return { orgOutputPivot: [], orgOutputNames: [] };
    const top10 = [...new Set(orgsTime.filter((d) => d.rank <= 10).map((d) => d.organization))].slice(0, 10);
    const years = [...new Set(orgsTime.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: any = { year };
      orgsTime.filter((d) => d.year === year && top10.includes(d.organization))
        .forEach((d) => { row[d.organization] = d.count; });
      return row;
    });
    return { orgOutputPivot: pivoted, orgOutputNames: top10 };
  }, [orgsTime]);

  // Tech evolution: list of orgs and pivoted data for selected org
  const techOrgList = useMemo(() => {
    if (!techEvo) return [];
    return [...new Set(techEvo.map((d) => d.organization))];
  }, [techEvo]);

  const activeOrg = selectedOrg || techOrgList[0] || '';

  const techEvoPivot = useMemo(() => {
    if (!techEvo || !activeOrg) return [];
    const orgData = techEvo.filter((d) => d.organization === activeOrg);
    const periods = [...new Set(orgData.map((d) => d.period))].sort();
    return periods.map((period) => {
      const row: any = { period };
      orgData.filter((d) => d.period === period).forEach((d) => {
        row[d.section] = d.count;
      });
      return row;
    });
  }, [techEvo, activeOrg]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  return (
    <div>
      <ChapterHeader
        number={3}
        title="Who Innovates?"
        subtitle="The organizations driving patent activity"
      />

      <Narrative>
        <p>
          Patents are overwhelmingly held by corporations. Over the decades, the share of
          patents assigned to companies has grown steadily, while individual inventors
          have become a smaller fraction. <StatCallout value={topOrgName} /> leads all
          organizations in total patent grants.
        </p>
      </Narrative>

      <ChartContainer
        title="Assignee Types Over Time"
        caption="Share of utility patents by assignee category (primary assignee)."
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
        />
      </ChartContainer>

      <Narrative>
        <p>
          The corporatization of patenting is one of the most striking long-term trends. In the
          late 1970s, individual inventors and government entities held meaningful shares of
          patent grants. Today, large corporations dominate overwhelmingly.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The Bayh-Dole Act of 1980 enabled universities and small businesses to patent
          federally-funded inventions, contributing to a surge in institutional patenting. But
          the dominant story is the rise of corporate R&D: as patent portfolios became strategic
          assets for cross-licensing, defensive protection, and competitive signaling, large
          firms invested heavily in systematic patent generation.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Patent-Holding Organizations"
        caption="Ranked by total utility patents granted, 1976-2025."
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

      <Narrative>
        <p>
          The leaderboard is dominated by technology giants and Asian electronics firms.
          Companies like Samsung, Canon, and LG have risen dramatically since the 1990s,
          challenging the traditional dominance of American firms like IBM and General Electric.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Asian electronics firms account for over half of the top 25 patent holders. Samsung alone
          surpassed IBM in annual patent grants in the 2010s, reflecting the globalization of technology
          leadership and the strategic importance of patent portfolios in international competition.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The rank heatmap below reveals distinct eras of organizational dominance. Some firms
          have maintained top positions for decades, while others have risen rapidly or faded
          as their core technologies evolved.
        </p>
      </Narrative>

      {orgsTime && orgsTime.length > 0 && (
        <ChartContainer
          title="Top Organizations: Rank Over Time"
          caption="Rank heatmap showing how the top 15 patent-holding organizations have shifted in annual grant rankings. Darker cells = higher rank."
          loading={orgL}
          height={850}
        >
          <PWRankHeatmap
            data={orgsTime.filter((d) => d.rank <= 15)}
            nameKey="organization"
            yearKey="year"
            rankKey="rank"
            maxRank={15}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The heatmap reveals three distinct eras: the GE/IBM dominance of the 1970s-80s, the
          rise of Japanese electronics firms (Canon, Hitachi, Toshiba) in the 1980s-90s, and
          the Korean ascendancy (Samsung, LG) since the 2000s. These shifts reflect broader
          geopolitical changes in technology leadership and R&D investment.
        </p>
      </KeyInsight>

      {orgOutputPivot.length > 0 && (
        <ChartContainer
          title="Patent Output Trajectories: Top Organizations"
          caption="Annual patent grants for the 10 historically top-ranked organizations, showing the rise and fall of different firms over five decades."
          loading={orgL}
        >
          <PWLineChart
            data={orgOutputPivot}
            xKey="year"
            lines={orgOutputNames.map((name, i) => ({
              key: name,
              name: name.length > 25 ? name.slice(0, 22) + '...' : name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            yLabel="Patents"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The patent output trajectories of leading organizations reveal striking divergence
          over time. While IBM maintained consistently high output for decades before declining,
          Samsung and Canon demonstrated rapid growth trajectories from the 1980s onward. These
          patterns reflect fundamental differences in corporate R&D strategies, from IBM&apos;s shift
          toward services to Samsung&apos;s aggressive technology diversification.
        </p>
      </KeyInsight>

      <ChartContainer
        title="US vs Foreign Assignees"
        caption="Patents by US-based vs foreign-based primary assignees."
        loading={dvfL}
      >
        <PWLineChart
          data={originPivot}
          xKey="year"
          lines={[
            { key: 'US', name: 'US', color: CHART_COLORS[0] },
            { key: 'Foreign', name: 'Foreign', color: CHART_COLORS[3] },
          ]}
          yLabel="Patents"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The foreign share of US patent grants has converged toward parity with domestic
          filers. This convergence reflects the globalization of R&D: multinational firms
          file strategically in the US regardless of headquarter location, and the US patent
          system has become the de facto global standard for protecting high-value inventions.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Patent Concentration"
        caption="Share of all corporate patents held by the top 10, 50, and 100 organizations, by 5-year period."
        loading={concL}
      >
        <PWLineChart
          data={conc ?? []}
          xKey="period"
          lines={[
            { key: 'top10_share', name: 'Top 10', color: CHART_COLORS[0] },
            { key: 'top50_share', name: 'Top 50', color: CHART_COLORS[1] },
            { key: 'top100_share', name: 'Top 100', color: CHART_COLORS[2] },
          ]}
          yLabel="Share %"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent concentration has been remarkably stable: the top 100 organizations consistently
          hold roughly a quarter of all corporate patents. This suggests that while new players emerge,
          the patent system remains dominated by large, well-resourced entities that invest heavily
          in R&D.
        </p>
      </KeyInsight>

      {/* ── New deep analyses ── */}

      <SectionDivider label="Citation Impact" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s true influence. Forward
          citations -- how often a firm&apos;s patents are cited by subsequent inventions -- reveal
          the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        title="Citation Impact by Organization"
        caption="Average and median forward citations per patent for major patent holders. Limited to patents granted through 2020 for citation accumulation."
        loading={citL}
        height={900}
      >
        <PWBarChart
          data={citData}
          xKey="label"
          bars={[
            { key: 'avg_citations_received', name: 'Average Citations', color: CHART_COLORS[0] },
            { key: 'median_citations_received', name: 'Median Citations', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
          yLabel="Citations"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The gap between average and median citations is telling: most firms produce patents
          with modest citation impact, but a few generate highly cited inventions that pull the
          average upward. Firms with high average-to-median ratios have &quot;hit-driven&quot;
          portfolios -- a few breakthrough patents amid many routine ones -- while firms with
          closer average and median values produce more consistently impactful work.
        </p>
      </KeyInsight>

      <div className="my-8 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Collaboration network analysis has moved to its own dedicated chapter.{' '}
        <Link href="/chapters/collaboration-networks/" className="text-primary underline underline-offset-2 hover:text-primary/80">
          See Chapter 8: Collaboration Networks &rarr;
        </Link>
      </div>

      <SectionDivider label="Technology Portfolios" />

      <Narrative>
        <p>
          The technology focus of major patent holders evolves over time. Some organizations
          have <StatCallout value="diversified" /> their portfolios, while others have become
          more specialized. Select an organization below to see how its technology mix has shifted.
        </p>
      </Narrative>

      {techOrgList.length > 0 && (
        <div className="my-4">
          <label htmlFor="org-select" className="mr-2 text-sm font-medium">
            Organization:
          </label>
          <select
            id="org-select"
            value={activeOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="rounded-md border bg-card px-3 py-1.5 text-sm"
          >
            {techOrgList.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
      )}

      <ChartContainer
        title={`Technology Portfolio: ${activeOrg || 'Loading...'}`}
        caption="CPC technology section shares by 5-year period. Shows how the organization's innovation portfolio has evolved."
        loading={tevL}
      >
        <PWAreaChart
          data={techEvoPivot}
          xKey="period"
          areas={sectionKeys.map((key) => ({
            key,
            name: `${key}: ${CPC_SECTION_NAMES[key]}`,
            color: CPC_SECTION_COLORS[key],
          }))}
          stackedPercent
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Technology portfolio shifts reveal strategic pivots. When a firm&apos;s patent mix
          changes rapidly -- as when Samsung shifted from mechanical to electronics patents in
          the 1990s, or when pharmaceutical firms expanded into biotech -- it signals deliberate
          reorientation of R&D investment toward emerging market opportunities.
        </p>
      </KeyInsight>

      <DataNote>
        Assignee data uses disambiguated identities from PatentsView. Primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Citation impact uses forward citations for patents granted through 2020.
        Co-patenting identifies patents with 2+ distinct organizational assignees.
      </DataNote>

      <ChapterNavigation currentChapter={3} />
    </div>
  );
}
