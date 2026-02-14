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
import { PWFanChart } from '@/components/charts/PWFanChart';
import { PWBubbleScatter } from '@/components/charts/PWBubbleScatter';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { RankingTable } from '@/components/chapter/RankingTable';
import Link from 'next/link';
import { PWSeriesSelector } from '@/components/charts/PWSeriesSelector';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS, COUNTRY_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  AssigneeTypePerYear, TopAssignee, OrgOverTime, DomesticVsForeign, Concentration,
  FirmCitationImpact, FirmTechEvolution, NonUSBySection,
  DesignPatentTrend, DesignTopFiler,
} from '@/lib/types';
import type { PortfolioDiversity, NetworkMetricsByDecade, BridgeInventor } from '@/lib/types';
import type { FirmQualityYear, FirmClaimsYear, FirmQualityScatter } from '@/lib/types';

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

export default function Chapter5() {
  const { data: types, loading: typL } = useChapterData<AssigneeTypePerYear[]>('chapter3/assignee_types_per_year.json');
  const { data: top, loading: topL } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: orgsTime, loading: orgL } = useChapterData<OrgOverTime[]>('chapter3/top_orgs_over_time.json');
  const { data: dvf, loading: dvfL } = useChapterData<DomesticVsForeign[]>('chapter3/domestic_vs_foreign.json');
  const { data: conc, loading: concL } = useChapterData<Concentration[]>('chapter3/concentration.json');
  const { data: citImpact, loading: citL } = useChapterData<FirmCitationImpact[]>('chapter3/firm_citation_impact.json');
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');
  const { data: diversity, loading: divL } = useChapterData<PortfolioDiversity[]>('chapter3/portfolio_diversity.json');
  const { data: networkMetrics, loading: nmL } = useChapterData<NetworkMetricsByDecade[]>('chapter3/network_metrics_by_decade.json');
  const { data: bridgeInventors } = useChapterData<BridgeInventor[]>('chapter3/bridge_inventors.json');
  const { data: nonUS, loading: nuL } = useChapterData<NonUSBySection[]>('chapter3/non_us_by_section.json');
  const { data: firmQuality, loading: fqL } = useChapterData<Record<string, FirmQualityYear[]>>('company/firm_quality_distribution.json');
  const { data: firmClaims, loading: fcmL } = useChapterData<Record<string, FirmClaimsYear[]>>('company/firm_claims_distribution.json');
  const { data: firmScatter, loading: fsL } = useChapterData<FirmQualityScatter[]>('company/firm_quality_scatter.json');
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[]; top_filers: DesignTopFiler[] }>('company/design_patents.json');

  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedQualityFirm, setSelectedQualityFirm] = useState<string>('IBM');
  const [selectedOrgSeries, setSelectedOrgSeries] = useState<Set<string>>(new Set());
  const [selectedDivSeries, setSelectedDivSeries] = useState<Set<string>>(new Set());

  const typePivot = useMemo(() => types ? pivotByCategory(types) : [], [types]);
  const categories = useMemo(() => types ? [...new Set(types.map((d) => d.category))] : [], [types]);
  const originPivot = useMemo(() => dvf ? pivotByOrigin(dvf) : [], [dvf]);

  const topOrgs = useMemo(() => {
    if (!top) return [];
    return top.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [top]);

  const topOrgName = top?.[0]?.organization ? cleanOrgName(top[0].organization) : 'IBM';

  const citData = useMemo(() => {
    if (!citImpact) return [];
    return citImpact.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [citImpact]);

  // Company output over time line chart
  const { orgOutputPivot, orgOutputNames } = useMemo(() => {
    if (!orgsTime) return { orgOutputPivot: [], orgOutputNames: [] };
    // Select top 10 organizations by total patent count (not by insertion order)
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
    // Initialize series selector on first load
    if (top10Clean.length > 0 && selectedOrgSeries.size === 0) {
      setTimeout(() => setSelectedOrgSeries(new Set(top10Clean.slice(0, 5))), 0);
    }
    return { orgOutputPivot: pivoted, orgOutputNames: top10Clean };
  }, [orgsTime, selectedOrgSeries.size]);

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
      // Clean period labels: "1976.0-1980.0" -> "1976-1980"
      const cleanPeriod = String(period).replace(/\.0/g, '');
      const row: any = { period: cleanPeriod };
      orgData.filter((d) => d.period === period).forEach((d) => {
        row[d.section] = d.count;
      });
      return row;
    });
  }, [techEvo, activeOrg]);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  const { diversityPivot, diversityOrgs } = useMemo(() => {
    if (!diversity) return { diversityPivot: [], diversityOrgs: [] };
    const orgs = [...new Set(diversity.map(d => cleanOrgName(d.organization)))];
    const periods = [...new Set(diversity.map(d => d.period))].sort();
    const pivoted = periods.map(period => {
      const row: Record<string, any> = { period };
      diversity.filter(d => d.period === period).forEach(d => {
        row[cleanOrgName(d.organization)] = d.shannon_entropy;
      });
      return row;
    });
    if (orgs.length > 0 && selectedDivSeries.size === 0) {
      setTimeout(() => setSelectedDivSeries(new Set(orgs.slice(0, 5))), 0);
    }
    return { diversityPivot: pivoted, diversityOrgs: orgs };
  }, [diversity, selectedDivSeries.size]);

  const { nonUSPivot, nonUSCountryAreas } = useMemo(() => {
    if (!nonUS) return { nonUSPivot: [], nonUSCountryAreas: [] };
    const countries = [...new Set(nonUS.map(d => d.country))];
    const years = [...new Set(nonUS.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      nonUS.filter(d => d.year === year).forEach(d => { row[d.country] = (row[d.country] as number || 0) + d.count; });
      return row;
    });
    // Order by total descending
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

  const qualityCompanies = useMemo(() => firmQuality ? Object.keys(firmQuality).sort() : [], [firmQuality]);
  const selectedQualityData = useMemo(() => firmQuality?.[selectedQualityFirm] ?? [], [firmQuality, selectedQualityFirm]);
  const selectedClaimsData = useMemo(() => firmClaims?.[selectedQualityFirm] ?? [], [firmClaims, selectedQualityFirm]);
  const scatterData = useMemo(() => {
    if (!firmScatter) return [];
    return firmScatter.map(d => ({
      company: d.company,
      x: d.blockbuster_rate,
      y: d.dud_rate,
      size: d.patent_count,
      section: d.primary_section,
    }));
  }, [firmScatter]);

  return (
    <div>
      <ChapterHeader
        number={5}
        title="Who Innovates?"
        subtitle="The organizations driving patent activity"
      />

      <KeyFindings>
        <li>Corporations hold the substantial majority of US patents, with individual inventors comprising a diminishing fraction of annual grants.</li>
        <li>Asian firms (Samsung, Canon, LG) now account for over half of the top 25 patent holders, reflecting the globalization of technology leadership.</li>
        <li>Patent concentration has remained relatively stable: the top 100 organizations consistently hold roughly a third of all corporate patents.</li>
        <li>Foreign <GlossaryTooltip term="assignee">assignees</GlossaryTooltip> surpassed US-based assignees around 2007 and now account for the majority of patent grants, driven by multinational R&amp;D strategies.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The digital transformation described in <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Technology Revolution</Link> has reshaped not only which technologies are patented but also which organizations produce them. Over five decades, individual inventors have given way to large corporate assignees whose patent portfolios serve as strategic instruments for cross-licensing, defensive protection, and competitive signaling. The organizational leadership of the patent system has passed through three distinct eras, from American industrial conglomerates such as General Electric, through Japanese electronics firms including Canon and Hitachi, to the present dominance of Korean multinationals, a succession that mirrors broader geopolitical shifts in research and development investment. Notably, while the national origin of leading assignees has shifted decisively toward East Asia, the structural concentration of patenting among elite organizations has remained remarkably stable across the entire period, suggesting that scale-dependent barriers to large-volume patenting persist regardless of geography. These patterns set the stage for <Link href="/chapters/the-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Inventors</Link>, which examines the individual inventors behind these organizational outputs.
        </p>
      </aside>

      <Narrative>
        <p>
          The substantial majority of patents are held by corporations. Over the decades, the share of
          patents assigned to companies has grown steadily, while individual inventors
          constitute a progressively smaller fraction. <StatCallout value={topOrgName} /> leads all
          organizations in cumulative patent grants.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-who-innovates-assignee-types"
        title="Corporate Assignees Grew From 94% to 99% of US Patent Grants Between 1976 and 2024"
        subtitle="Share of utility patents by assignee category (corporate, individual, government, university), measured as percentage of annual grants, 1976–2025"
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
          late 1970s, individual inventors and government entities held meaningful shares of
          patent grants. In recent years, large corporations account for the substantial majority of all grants.
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

      <ChartContainer
        id="fig-who-innovates-top-assignees"
        title="IBM Leads With 161,888 Cumulative Grants, but Samsung Trails by Fewer Than 4,000 Patents"
        subtitle="Top organizations ranked by cumulative utility patent grants, 1976–2025"
        caption="Organizations ranked by total utility patents granted, 1976-2025. Japanese and Korean firms occupy a majority of the top positions alongside American technology firms."
        insight="The ranking demonstrates the global nature of US patent activity. Japanese and Korean firms compete directly with American technology firms for the leading positions, reflecting the internationalization of technology-intensive industries."
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
        caption="Top 15 organizations by cumulative utility patent grants, 1976–2025. Source: PatentsView."
      />

      <Narrative>
        <p>
          The ranking is dominated by technology firms and Asian corporations.
          Organizations such as Samsung, Canon, and LG have risen substantially since the 1990s,
          challenging the traditional dominance of American firms such as IBM and General Electric.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Asian firms account for over half of the top 25 patent holders. Samsung first surpassed
          IBM in annual patent grants in 2007, a shift that reflects the globalization of technology
          leadership and the strategic importance of patent portfolios in international competition.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The rank heatmap below reveals distinct eras of organizational dominance. Certain firms
          have maintained leading positions for decades, while others have ascended or declined
          as their core technologies evolved.
        </p>
      </Narrative>

      {orgsTime && orgsTime.length > 0 && (
        <ChartContainer
          id="fig-who-innovates-rank-heatmap"
          title="GE Held Rank 1 for 6 Consecutive Years (1980-1985) Before Japanese and Korean Firms Rose to Dominance"
          subtitle="Annual grant rankings of the top 15 patent-holding organizations, with darker cells indicating higher rank, 1976–2025"
          caption="Rank heatmap depicting the annual grant rankings of the top 15 patent-holding organizations over time. Darker cells indicate higher rank. The visualization reveals sequential transitions in organizational leadership from American to Japanese to Korean firms."
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
            id="fig-who-innovates-org-output-trends"
            title="Samsung Peaked at 9,716 Annual Grants in 2024, Overtaking IBM Which Peaked at 9,257 in 2019"
            subtitle="Annual patent grants for the 10 historically top-ranked organizations, with selectable series, 1976–2025"
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

      <ChartContainer
        id="fig-who-innovates-domestic-vs-foreign"
        title="Foreign Assignees Surpassed US-Based Assignees Around 2007 and Reached 54.5% of Grants by 2024"
        subtitle="Annual patent grants by US-based versus foreign-based primary assignees, 1976–2025"
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

      <ChartContainer
        id="fig-who-innovates-concentration"
        title="The Top 100 Organizations Hold 32-39% of Corporate Patents, a Share That Has Narrowed Since the 2010s"
        subtitle="Share of corporate patents held by the top 10, 50, and 100 organizations, measured by 5-year period, 1976–2025"
        caption="Share of all corporate patents held by the top 10, 50, and 100 organizations, by 5-year period. The relative stability of these concentration ratios across decades suggests persistent structural features of the patent system."
        insight="Despite the entry of new organizations, the patent landscape remains dominated by large, well-resourced entities that invest systematically in R&amp;D. The stability of concentration ratios is consistent with the presence of substantial barriers to large-scale patenting."
        loading={concL}
      >
        <PWLineChart
          data={conc ?? []}
          xKey="period"
          lines={[
            { key: 'top10_share', name: 'Top 10', color: CHART_COLORS[0] },
            { key: 'top50_share', name: 'Top 50', color: CHART_COLORS[1], dashPattern: '8 4' },
            { key: 'top100_share', name: 'Top 100', color: CHART_COLORS[2], dashPattern: '2 4' },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent concentration has remained relatively stable: the top 100 organizations consistently
          hold roughly a third of all corporate patents. This pattern suggests that while new entrants emerge,
          the patent system remains dominated by large, well-resourced entities that invest substantially
          in R&amp;D.
        </p>
      </KeyInsight>

      {/* ── New deep analyses ── */}

      <SectionDivider label="Citation Impact" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s technological influence. <GlossaryTooltip term="forward citations">Forward
          citations</GlossaryTooltip>, which measure how frequently a firm&apos;s patents are cited by subsequent inventions, provide
          a complementary indicator of the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-who-innovates-citation-impact"
        title="Microsoft Leads in Average Citations (30.7) While IBM's 5.6x Average-to-Median Ratio Reveals a Highly Skewed Portfolio"
        subtitle="Average and median forward citations per patent for major assignees, based on patents granted through 2020"
        caption="Average and median forward citations per patent for major patent holders, limited to patents granted through 2020 to allow for citation accumulation. Organizations with large average-to-median ratios exhibit skewed citation distributions indicative of a small number of highly cited patents."
        insight="The divergence between average and median citations distinguishes portfolios characterized by a few highly cited patents (high average, lower median) from those with more uniformly impactful output."
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
          The divergence between average and median citations is informative: most firms produce patents
          with modest citation impact, while a small number generate highly cited inventions that elevate the
          mean. Firms with high average-to-median ratios exhibit skewed citation distributions,
          characterized by a few highly cited patents alongside many of lower impact. Firms with
          closer average and median values, by contrast, produce more uniformly impactful output.
        </p>
      </KeyInsight>

      <SectionDivider label="Technology Portfolios" />

      <Narrative>
        <p>
          The technology focus of major patent holders evolves over time. Certain organizations
          have <StatCallout value="diversified" /> their portfolios, while others have become
          more specialized. An organization may be selected below to examine how its technology composition has shifted.
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
              <option key={org} value={org}>{cleanOrgName(org)}</option>
            ))}
          </select>
        </div>
      )}

      <ChartContainer
        id="fig-who-innovates-tech-evolution"
        title={`${activeOrg ? cleanOrgName(activeOrg) : 'Loading...'}: Technology Portfolio Composition Across 8 CPC Sections by 5-Year Period (1976-2025)`}
        subtitle="CPC section share of patents by 5-year period for the selected organization, showing technology portfolio evolution"
        caption="CPC technology section shares by 5-year period. The chart illustrates how the selected organization's innovation portfolio has evolved across technology domains."
        insight="Substantial shifts in a firm's technology composition, such as Samsung's expansion of its already electronics-dominated portfolio into new technology areas, indicate deliberate strategic reorientation of R&amp;D investment."
        loading={tevL}
        interactive={true}
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
          xLabel="Period"
          yLabel="Share (%)"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Technology portfolio shifts indicate strategic reorientation. When a firm&apos;s patent composition
          changes substantially, as observed when Samsung expanded its already electronics-dominated portfolio into new technology areas
          in the 1990s, or when pharmaceutical firms expanded into biotechnology, it suggests deliberate
          reallocation of R&amp;D investment toward emerging market opportunities.
        </p>
      </KeyInsight>

      <SectionDivider label="Patent Portfolio Diversity" />
      <Narrative>
        <p>
          Whether leading firms are broadening or narrowing their innovation focus can be assessed through
          patent portfolio diversity. Each organization&apos;s diversity is measured using Shannon entropy across CPC
          technology subclasses. Higher entropy indicates a more diverse portfolio spanning
          many technology areas, while lower entropy indicates specialization in a limited number of domains.
        </p>
      </Narrative>
      <PWSeriesSelector
        items={diversityOrgs.slice(0, 10).map((org, i) => ({
          key: org,
          name: org,
          color: BUMP_COLORS[i % BUMP_COLORS.length],
        }))}
        selected={selectedDivSeries}
        onChange={setSelectedDivSeries}
        defaultCount={5}
      />
      <ChartContainer
        id="fig-who-innovates-portfolio-diversity"
        title="Portfolio Diversity Rose Across Leading Firms, With Mitsubishi Electric Reaching a Peak Entropy of 4.9"
        subtitle="Shannon entropy of CPC subclass distribution per 5-year period for leading assignees, measuring technology portfolio breadth"
        caption="Shannon entropy across CPC subclasses per 5-year period for leading assignees. Higher values indicate broader technology portfolios. The general upward trajectory across most organizations suggests a trend toward greater technological breadth."
        insight="The upward trend in portfolio diversity suggests that competitive advantage may increasingly require spanning multiple technology domains rather than maintaining deep specialization in a single area."
        loading={divL}
        interactive
        statusText={`Showing ${selectedDivSeries.size} of ${diversityOrgs.slice(0, 10).length} organizations`}
      >
        <PWLineChart
          data={diversityPivot}
          xKey="period"
          lines={diversityOrgs.slice(0, 10)
            .filter((org) => selectedDivSeries.has(org))
            .map((org) => ({
              key: org,
              name: org,
              color: BUMP_COLORS[diversityOrgs.indexOf(org) % BUMP_COLORS.length],
            }))}
          yLabel="Shannon Entropy"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>
      <KeyInsight>
        <p>
          Most leading patentees have steadily increased their portfolio diversity over time,
          reflecting a trend toward broader technology strategies. Samsung and IBM exhibit
          particularly high entropy, consistent with their presence across electronics,
          software, and hardware. By contrast, pharmaceutical companies tend to maintain
          more focused portfolios. The general upward trend suggests that competitive
          advantage may increasingly require spanning multiple technology domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Collaboration Network Structure" />
      <Narrative>
        <p>
          The structure of innovation collaboration has evolved considerably over the study period.
          By analyzing co-inventor relationships as a network, it is possible to measure the connectedness
          of the innovation ecosystem. The average degree (number of collaborators per inventor) and network
          density indicate whether innovation is becoming more or less collaborative over time.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-who-innovates-collaboration-network"
        title="Average Inventor Degree Rose 2.5x, From 2.7 in the 1980s to 6.8 in the 2020s"
        subtitle="Average co-inventors per inventor and average team size by decade, measuring collaboration network connectivity"
        caption="Summary statistics of the inventor collaboration network by decade. Average degree measures the typical number of co-inventors per active inventor. Both metrics exhibit sustained increases, indicating a progressively more collaborative innovation ecosystem."
        insight="Rising average inventor degree reflects both larger team sizes and more extensive cross-organizational collaboration, resulting in a more interconnected innovation network over time."
        loading={nmL}
      >
        {networkMetrics && (
          <PWLineChart
            data={networkMetrics}
            xKey="decade_label"
            lines={[
              { key: 'avg_degree', name: 'Average Co-Inventors (Degree)', color: CHART_COLORS[0] },
              { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[1], dashPattern: '8 4' },
            ]}
            yLabel="Average per Inventor"
            yFormatter={(v: number) => v.toFixed(1)}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          The innovation network has become substantially more interconnected. Average inventor
          degree has risen steadily since the 1980s, reflecting both larger team sizes and more
          extensive cross-organizational collaboration. This &quot;small world&quot; property suggests that knowledge
          may diffuse more rapidly through the network, and is consistent with the broader trend
          toward team-based rather than individual invention.
        </p>
      </KeyInsight>

      <SectionDivider label="Bridge Inventors" />
      <Narrative>
        <p>
          Certain inventors serve as critical bridges connecting otherwise separate organizations
          and technology communities. These &quot;bridge inventors&quot; have patented at three or more
          distinct organizations, potentially facilitating the transfer of knowledge and practices between firms.
        </p>
      </Narrative>
      {bridgeInventors && bridgeInventors.length > 0 && (
        <div className="max-w-3xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Inventor</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Organizations</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Patents</th>
              </tr>
            </thead>
            <tbody>
              {bridgeInventors.slice(0, 15).map((inv, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3">{inv.first_name} {inv.last_name}</td>
                  <td className="text-right py-2 px-3 font-mono">{inv.num_orgs}</td>
                  <td className="text-right py-2 px-3 font-mono">{inv.total_patents.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <KeyInsight>
        <p>
          Bridge inventors who span multiple organizations appear to play a disproportionate role in the
          innovation ecosystem. Their movement between firms creates channels for knowledge
          transfer that would not exist through patent citations alone, which may help explain why
          geographic and organizational proximity are significant factors in innovation diffusion.
        </p>
      </KeyInsight>

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
        id="fig-who-innovates-non-us-assignees"
        title="Japan Accounts for 1.4 Million US Patents Since 1976, With South Korea (359K) and China (222K) Rising Rapidly"
        subtitle="Annual patent grants by primary assignee country/region, showing successive waves of international entry, 1976–2025"
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

      <SectionDivider label="Design Patent Leadership" />

      <Narrative>
        <p>
          Beyond utility patents, <GlossaryTooltip term="design patent">design patents</GlossaryTooltip> have
          become an increasingly important element of corporate intellectual property strategy.
          The organizations that lead in design patent filings reveal how firms leverage ornamental
          and aesthetic innovation as a competitive tool, particularly in consumer electronics,
          automotive, and fashion industries where product appearance is a key differentiator.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-who-innovates-design-top-filers"
        subtitle="Organizations ranked by total design patents granted, showing which firms lead in design-driven intellectual property."
        title="Samsung (13,094), Nike (9,189), and LG (6,720) Lead Design Patent Filings Among Consumer Electronics and Automotive Firms"
        caption="This chart displays the organizations with the most design patents granted across all years. Consumer electronics manufacturers and automotive companies account for the majority of top design patent filers."
        loading={deL}
        height={500}
      >
        {designData?.top_filers ? (
          <PWBarChart
            data={designData.top_filers.slice(0, 20)}
            xKey="company"
            bars={[{ key: 'design_patents', name: 'Design Patents', color: CHART_COLORS[3] }]}
            layout="vertical"
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Innovation Quality Profiles" />

      <Narrative>
        <p>
          Aggregate statistics such as average forward citations conceal the shape of each
          firm&apos;s quality distribution. A company with a median of 1 citation and a 99th
          percentile of 200 is a fundamentally different innovator than one with a median of 1
          and a 99th percentile of 10, even if their averages are similar. The fan charts below
          reveal how each firm&apos;s citation distribution evolves over time.
        </p>
      </Narrative>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a company:</div>
        <PWCompanySelector
          companies={qualityCompanies}
          selected={selectedQualityFirm}
          onSelect={setSelectedQualityFirm}
        />
      </div>

      <ChartContainer
        id="fig-who-innovates-quality-fan"
        title={`${selectedQualityFirm}: 35 of 48 Top Firms Saw Median Forward Citations Fall to Zero by 2019`}
        subtitle={`5-year forward citation percentiles (P10–P90) for ${selectedQualityFirm} patents by grant year, with company selector`}
        caption={`5-year forward citation percentiles for ${selectedQualityFirm} patents by grant year (1976–2019). Bands show P25–P75 (dark) and P10–P90 (light). Solid line = median; dashed gray = system-wide median. Only years with ≥10 patents shown.`}
        insight="The width of the fan reveals the dispersion of quality within the firm's portfolio. A widening gap between the median and upper percentiles indicates increasing reliance on a small fraction of high-impact patents."
        loading={fqL}
        height={400}
        wide
        interactive={true}
      >
        <PWFanChart
          data={selectedQualityData}
          yLabel="5-Year Forward Citations"
          showMean
        />
      </ChartContainer>

      <ChartContainer
        id="fig-who-innovates-blockbuster-dud"
        title={`${selectedQualityFirm}: Blockbuster Rate (Top 1% Patents) and Dud Rate (Zero Citations) Over Time`}
        subtitle={`Annual share of top-1% blockbuster patents and zero-citation dud patents for ${selectedQualityFirm}, with company selector`}
        caption={`Annual blockbuster rate (patents in top 1% of year × CPC section cohort, blue) and dud rate (zero 5-year forward citations, red) for ${selectedQualityFirm}. Dashed line at 1% marks the expected blockbuster rate under uniform quality.`}
        loading={fqL}
        height={300}
        wide
        interactive={true}
      >
        {selectedQualityData.length > 0 ? (
          <PWLineChart
            data={selectedQualityData.map(d => ({
              year: d.year,
              blockbuster_rate: +(d.blockbuster_rate * 100).toFixed(2),
              dud_rate: +(d.dud_rate * 100).toFixed(2),
            }))}
            xKey="year"
            lines={[
              { key: 'blockbuster_rate', name: 'Blockbuster Rate (%)', color: CHART_COLORS[0] },
              { key: 'dud_rate', name: 'Dud Rate (%)', color: CHART_COLORS[3], dashPattern: '8 4' },
            ]}
            yLabel="Share of Patents (%)"
            yFormatter={(v) => `${v}%`}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-who-innovates-claims-distribution"
        title={`${selectedQualityFirm}: Claim Count Distribution by Grant Year (1976-2025)`}
        subtitle={`Claim count percentiles (P25–P75) for ${selectedQualityFirm} patents by grant year, with company selector`}
        caption={`Claim count percentiles for ${selectedQualityFirm} patents by grant year. Bands show P25–P75 (dark). Dashed gray = system-wide median claims.`}
        loading={fcmL}
        height={350}
        wide
        interactive={true}
      >
        <PWFanChart
          data={selectedClaimsData}
          yLabel="Number of Claims"
          showP10P90={false}
          color={CHART_COLORS[1]}
        />
      </ChartContainer>

      <SectionDivider label="Firm Quality Typology" />

      <Narrative>
        <p>
          Plotting each firm&apos;s blockbuster rate against its dud rate for the most recent
          complete decade (2010–2019) reveals distinct innovation strategies. Firms in the
          upper-right produce both high-impact breakthroughs and many zero-citation patents — a
          high-variance strategy. Firms in the lower-right achieve high blockbuster rates with
          few duds, the hallmark of consistent quality.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-who-innovates-quality-scatter"
        title="Amazon's 6.7% Blockbuster Rate Dwarfs the Field, While 18 of 50 Firms Exceed a 50% Dud Rate (2010-2019)"
        subtitle="Blockbuster rate vs. dud rate for the top 50 assignees (2010–2019), with bubble size proportional to patent count and color by primary CPC section"
        caption="Each bubble represents one of the top 50 assignees in the decade 2010–2019. X-axis: share of patents in the top 1% of their year × CPC section cohort. Y-axis: share of patents receiving zero 5-year forward citations. Bubble size: total patents. Color: primary CPC section."
        insight={`Amazon occupies the lower-right quadrant with a blockbuster rate of 6.7% and a dud rate of 18.3%, classifying it as a consistent high-impact innovator. By contrast, several Japanese electronics firms cluster in the upper-left with blockbuster rates below 0.2% and dud rates above 50%.`}
        loading={fsL}
        height={500}
        wide
      >
        <PWBubbleScatter
          data={scatterData}
          xLabel="Blockbuster Rate (%)"
          yLabel="Dud Rate (%)"
          xMidline={1}
          yMidline={40}
          quadrants={[
            { position: 'top-right', label: 'High-Variance' },
            { position: 'bottom-right', label: 'Consistent Stars' },
            { position: 'top-left', label: 'Underperformers' },
            { position: 'bottom-left', label: 'Steady Contributors' },
          ]}
          labeledPoints={['Amazon', 'Apple', 'Google', 'Cisco', 'AT&T', 'TSMC', 'Ford', 'Microsoft']}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The quality typology scatter reveals that technology sector alone does not determine innovation strategy.
          Within the same CPC section, firms exhibit substantially different blockbuster-to-dud ratios,
          suggesting that organizational factors — R&amp;D investment concentration, inventor incentive
          structures, and portfolio management decisions — play a significant role in shaping the quality
          distribution of a firm&apos;s patent output.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the organizations driving patent activity at the aggregate level, the <Link href="/chapters/company-profiles" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> disaggregates these trends to the firm level, constructing interactive innovation profiles for 100 major patent filers.
        The trajectory archetypes, portfolio strategies, and quality distributions revealed at the company level provide the bridge between the macro patterns documented here and the individual inventors examined in <Link href="/chapters/the-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Inventors</Link>.
      </Narrative>

      <DataNote>
        Assignee data employ disambiguated identities from PatentsView. The primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Citation impact is calculated using forward citations for patents granted through 2020.
        Co-patenting identifies patents with 2+ distinct organizational assignees.
        Portfolio diversity is measured using Shannon entropy across CPC subclasses per 5-year period. Network metrics are computed from co-inventor relationships on shared patents.
      </DataNote>

      <RelatedChapters currentChapter={5} />
      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
