'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWScatterChart } from '@/components/charts/PWScatterChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { CHART_COLORS, CPC_SECTION_COLORS, ARCHETYPE_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { formatCompact } from '@/lib/formatters';
import type {
  CompanyProfile,
  TrajectoryArchetype,
  CorporateMortality,
  PortfolioDiversificationB3,
  PivotDetection,
  PatentConcentration,
} from '@/lib/types';

const CPC_SECTIONS = Object.keys(CPC_SECTION_NAMES);

export default function Chapter14() {
  /* ── Data loading ── */
  const { data: profiles, loading: prL } = useChapterData<CompanyProfile[]>('company/company_profiles.json');
  const { data: trajRaw } = useChapterData<{ companies: TrajectoryArchetype[] } | TrajectoryArchetype[]>('company/trajectory_archetypes.json');
  const trajectories = useMemo(() => {
    if (!trajRaw) return null;
    if (Array.isArray(trajRaw)) return trajRaw;
    return trajRaw.companies ?? null;
  }, [trajRaw]);
  const { data: mortality, loading: moL } = useChapterData<CorporateMortality>('company/corporate_mortality.json');
  const { data: diversification, loading: diL } = useChapterData<PortfolioDiversificationB3[]>('company/portfolio_diversification_b3.json');
  const { data: pivots, loading: pvL } = useChapterData<PivotDetection[]>('company/pivot_detection.json');
  const { data: concentration, loading: coL } = useChapterData<PatentConcentration[]>('company/patent_concentration.json');

  /* ── State ── */
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('All');

  /* ── A1: Company list and selected profile ── */
  const companyList = useMemo(() => {
    if (!profiles) return [];
    return profiles.map((p) => p.company).sort();
  }, [profiles]);

  const activeCompany = selectedCompany || companyList[0] || '';

  const companyData = useMemo(() => {
    if (!profiles || !activeCompany) return null;
    return profiles.find((p) => p.company === activeCompany) ?? null;
  }, [profiles, activeCompany]);

  const companySummary = useMemo(() => {
    if (!companyData) return null;
    const years = companyData.years;
    const totalPatents = years.reduce((s, y) => s + y.patent_count, 0);
    const peakYear = years.reduce((best, y) => (y.patent_count > best.patent_count ? y : best), years[0]);
    return {
      totalPatents,
      activeYears: years.length,
      peakYear: peakYear.year,
      peakCount: peakYear.patent_count,
      firstYear: years[0]?.year,
      lastYear: years[years.length - 1]?.year,
    };
  }, [companyData]);

  /* A1: Annual patent counts */
  const annualPatentData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({ year: y.year, patent_count: y.patent_count }));
  }, [companyData]);

  /* A1: CPC distribution stacked area */
  const cpcDistributionData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => {
      const row: Record<string, number> = { year: y.year };
      CPC_SECTIONS.forEach((sec) => {
        row[sec] = y.cpc_distribution?.[sec] ?? 0;
      });
      return row;
    });
  }, [companyData]);

  /* A1: Citations over time */
  const citationsData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({
      year: y.year,
      median_citations_5yr: y.median_citations_5yr,
    }));
  }, [companyData]);

  /* A1: Team size + inventor count dual axis */
  const teamInventorData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({
      year: y.year,
      avg_team_size: y.avg_team_size,
      inventor_count: y.inventor_count,
    }));
  }, [companyData]);

  /* A1: CPC breadth over time */
  const cpcBreadthData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({
      year: y.year,
      cpc_breadth: y.cpc_breadth,
    }));
  }, [companyData]);

  /* ── A2: Trajectory archetypes ── */
  const archetypeNames = useMemo(() => {
    if (!trajectories) return [];
    return [...new Set(trajectories.map((t) => t.archetype))];
  }, [trajectories]);

  const archetypeGroups = useMemo(() => {
    if (!trajectories) return [];
    return archetypeNames.map((name) => {
      const members = trajectories.filter((t) => t.archetype === name);
      // Build a representative centroid normalized series
      const seriesLen = members[0]?.normalized_series?.length ?? 0;
      const centroid: number[] = [];
      for (let i = 0; i < seriesLen; i++) {
        const avg = members.reduce((s, m) => s + (m.normalized_series[i] ?? 0), 0) / members.length;
        centroid.push(avg);
      }
      return { name, count: members.length, centroid, companies: members };
    });
  }, [trajectories, archetypeNames]);

  const filteredTrajectories = useMemo(() => {
    if (!trajectories) return [];
    if (archetypeFilter === 'All') return trajectories;
    return trajectories.filter((t) => t.archetype === archetypeFilter);
  }, [trajectories, archetypeFilter]);

  /* ── A3: Corporate mortality ── */
  const mortalityHeatmapData = useMemo(() => {
    if (!mortality) return [];
    const rows: { company: string; year: number; rank: number }[] = [];
    mortality.decades.forEach((dec: any) => {
      const yr = typeof dec.start_year === 'number' ? dec.start_year : parseInt(dec.decade, 10);
      dec.companies.forEach((c: any) => {
        rows.push({ company: c.company, year: yr, rank: c.rank });
      });
    });
    return rows;
  }, [mortality]);

  const continuousCount = mortality?.continuous_companies?.length ?? 0;
  const continuousNames = useMemo(() => {
    if (!mortality?.continuous_companies) return [];
    return mortality.continuous_companies.map((c: any) =>
      typeof c === 'string' ? c : c.company ?? String(c)
    );
  }, [mortality]);

  /* ── B1: Portfolio diversification ── */
  const { divPivot, divCompanies } = useMemo(() => {
    if (!diversification) return { divPivot: [], divCompanies: [] };
    const companies = [...new Set(diversification.map((d) => d.company))];
    // Pick top 10 by latest entropy
    const latestYear = Math.max(...diversification.map((d) => d.year));
    const topCompanies = companies
      .map((c) => {
        const latest = diversification.find((d) => d.company === c && d.year === latestYear);
        return { company: c, entropy: latest?.shannon_entropy ?? 0 };
      })
      .sort((a, b) => b.entropy - a.entropy)
      .slice(0, 10)
      .map((d) => d.company);

    const years = [...new Set(diversification.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, any> = { year };
      diversification
        .filter((d) => d.year === year && topCompanies.includes(d.company))
        .forEach((d) => { row[d.company] = d.shannon_entropy; });
      return row;
    });
    return { divPivot: pivoted, divCompanies: topCompanies };
  }, [diversification]);

  const diversityScatterData = useMemo(() => {
    if (!diversification || !profiles) return [];
    const latestYear = Math.max(...diversification.map((d) => d.year));
    return diversification
      .filter((d) => d.year === latestYear)
      .map((d) => {
        const profile = profiles.find((p) => p.company === d.company);
        const latestMetrics = profile?.years?.[profile.years.length - 1];
        return {
          company: d.company,
          shannon_entropy: d.shannon_entropy,
          median_citations_5yr: latestMetrics?.median_citations_5yr ?? 0,
          category: d.shannon_entropy > 2.5 ? 'Diversified' : d.shannon_entropy > 1.5 ? 'Moderate' : 'Focused',
        };
      });
  }, [diversification, profiles]);

  const diversityCategories = useMemo(() => {
    return [...new Set(diversityScatterData.map((d) => d.category))].sort();
  }, [diversityScatterData]);

  /* ── B2: Pivot detection ── */
  const pivotCompanyList = useMemo(() => {
    if (!pivots) return [];
    return [...new Set(pivots.map((p) => p.company))].sort();
  }, [pivots]);

  const activePivotCompany = activeCompany && pivotCompanyList.includes(activeCompany)
    ? activeCompany
    : pivotCompanyList[0] ?? '';

  const detectedPivots = useMemo(() => {
    if (!pivots) return [];
    return pivots.filter((p) => p.is_pivot).sort((a, b) => b.jsd - a.jsd);
  }, [pivots]);

  const pivotCompanyData = useMemo(() => {
    if (!pivots || !activePivotCompany) return [];
    return pivots
      .filter((p) => p.company === activePivotCompany)
      .sort((a, b) => a.window_start - b.window_start);
  }, [pivots, activePivotCompany]);

  /* ── B3: Concentration index ── */
  const { concPivot, concSections } = useMemo(() => {
    if (!concentration) return { concPivot: [], concSections: [] };
    const sections = [...new Set(concentration.map((d) => d.section))].sort();
    const years = [...new Set(concentration.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, any> = { year };
      concentration
        .filter((d) => d.year === year)
        .forEach((d) => { row[d.section] = d.hhi; });
      return row;
    });
    return { concPivot: pivoted, concSections: sections };
  }, [concentration]);

  return (
    <div>
      <ChapterHeader
        number={14}
        title="Company Innovation Profiles"
        subtitle="Interactive dashboards for 100 major patent filers"
      />

      <KeyFindings>
        <li>Corporate patent strategies vary substantially: some firms maintain broad, diversified portfolios while others concentrate in narrow technology niches.</li>
        <li>Six distinct trajectory archetypes emerge from patent output histories, ranging from Steady Climbers to Boom &amp; Bust patterns, revealing characteristic lifecycle patterns of corporate innovation.</li>
        <li>Only a small fraction of top patent filers have maintained a continuous top-50 presence across all five decades, underscoring the volatility of innovation leadership.</li>
        <li>Technology pivots, defined as sudden shifts in a company&apos;s patent portfolio, often precede major business transformations and can be detected years in advance through CPC distribution analysis.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          When the aggregate trends examined in preceding chapters -- the rise of AI, the expansion of green technology, the growing interdisciplinarity of patent language -- are disaggregated to the firm level, a striking picture of strategic heterogeneity emerges. The 100 largest patent filers follow sharply divergent innovation trajectories, and the rarity of sustained leadership across multiple decades underscores how difficult it is for any single organization to remain at the frontier of technological change. Portfolio analysis reveals that firms navigate this challenge through fundamentally different approaches: some pursue broad diversification across technology domains, while others concentrate resources in narrow areas of deep expertise, with no clear penalty in citation impact for either strategy. The ability to detect strategic reorientation through shifts in patent portfolio composition -- often years before such changes become apparent in product markets -- suggests that the patent record functions as an early-warning system for corporate transformation, connecting the macro-level patterns of earlier chapters to the micro-level decisions of individual firms.
        </p>
      </aside>

      {/* ── Section A3: Corporate Mortality (broad overview) ── */}
      <SectionDivider label="Corporate Mortality" />

      <Narrative>
        <p>
          The persistence of corporate patent leadership over extended time horizons represents
          a central question in the study of innovation. The rank heatmap below tracks corporate
          presence in the top patent rankings across five decades, revealing the
          considerable <StatCallout value="volatility of innovation leadership" />.
        </p>
      </Narrative>

      {mortality && (
        <div className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Continuous Survivors</div>
            <div className="mt-1 text-2xl font-bold">{continuousCount}</div>
            <div className="text-xs text-muted-foreground">companies in top 50 every decade</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Decades Tracked</div>
            <div className="mt-1 text-2xl font-bold">{mortality.decades.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Survival Rates</div>
            <div className="mt-1 space-y-1">
              {(Array.isArray(mortality.survival_rates) ? mortality.survival_rates : []).slice(0, 3).map((sr: any, i: number) => (
                <div key={i} className="text-xs">
                  <span className="text-muted-foreground">{sr.from_decade}&rarr;{sr.to_decade}:</span>{' '}
                  <span className="font-mono font-medium">{sr.survival_rate?.toFixed(0) ?? '?'}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ChartContainer
        title="Only 9 of 50 Top Patent Filers Survived All 5 Decades, an 18% Cumulative Survival Rate"
        caption="Rank heatmap showing how top patent-holding companies shifted in ranking across decades. Darker cells indicate higher rank (more patents). The most notable pattern is the high degree of turnover, with most firms that dominated one era being displaced by new entrants in the next."
        insight="The high turnover in top rankings demonstrates that sustained innovation leadership is exceptionally rare. Most firms that dominated one era were displaced by new entrants in the subsequent decade."
        loading={moL}
        height={900}
      >
        {mortalityHeatmapData.length > 0 ? (
          <PWRankHeatmap
            data={mortalityHeatmapData}
            nameKey="company"
            yearKey="year"
            rankKey="rank"
            maxRank={50}
            yearInterval={10}
          />
        ) : <div />}
      </ChartContainer>

      {continuousNames.length > 0 && (
        <div className="max-w-2xl mx-auto my-6">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">
            Companies in the Top 50 Every Decade
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {continuousNames.map((name: string) => (
              <span key={name} className="rounded-full border bg-card px-3 py-1 text-xs font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <KeyInsight>
        <p>
          Innovation leadership appears to be considerably more volatile than commonly assumed. Only a small number of
          companies have maintained a top-50 patent ranking across all five decades. The remainder
          have either risen, fallen, or been replaced entirely, a pattern that underscores
          the persistent pace of technological change and the difficulty of sustaining corporate
          R&amp;D investment over extended time horizons.
        </p>
      </KeyInsight>

      {/* ── Section A2: Trajectory Archetypes (primary decomposition) ── */}
      <SectionDivider label="Innovation Trajectory Archetypes" />

      <Narrative>
        <p>
          By analyzing the normalized patent output trajectories of the 200 largest filers,
          six distinct <StatCallout value="archetypes" /> emerge. Each archetype captures a
          characteristic pattern of innovation growth, decline, or stability that reflects
          the underlying corporate strategy and market dynamics.
        </p>
      </Narrative>

      {archetypeGroups.length > 0 && (
        <div className="my-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {archetypeGroups.map((group) => (
            <div
              key={group.name}
              className="rounded-lg border bg-card p-4"
              style={{ borderLeftColor: ARCHETYPE_COLORS[group.name] ?? CHART_COLORS[0], borderLeftWidth: 4 }}
            >
              <div className="text-sm font-semibold" style={{ color: ARCHETYPE_COLORS[group.name] }}>
                {group.name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{group.count} companies</div>
              <div className="mt-2 h-16">
                {group.centroid.length > 0 && (
                  <PWLineChart
                    data={group.centroid.map((v, i) => ({ idx: i, value: v }))}
                    xKey="idx"
                    lines={[{ key: 'value', name: group.name, color: ARCHETYPE_COLORS[group.name] ?? CHART_COLORS[0] }]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Narrative>
        <p>
          The table below lists all companies with their archetype classification. The
          filter allows focus on a specific trajectory pattern, facilitating exploration of which firms share
          similar innovation dynamics.
        </p>
      </Narrative>

      {trajectories && trajectories.length > 0 && (
        <>
          <div className="my-4">
            <label htmlFor="archetype-filter" className="mr-2 text-sm font-medium">
              Filter by archetype:
            </label>
            <select
              id="archetype-filter"
              value={archetypeFilter}
              onChange={(e) => setArchetypeFilter(e.target.value)}
              className="rounded-md border bg-card px-3 py-1.5 text-sm"
            >
              <option value="All">All Archetypes</option>
              {archetypeNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="max-w-4xl mx-auto my-6 overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Archetype</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Peak Year</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Peak Count</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Current Count</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrajectories.map((t) => (
                  <tr key={t.company} className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium">{t.company}</td>
                    <td className="py-2 px-3">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${ARCHETYPE_COLORS[t.archetype] ?? CHART_COLORS[0]}20`,
                          color: ARCHETYPE_COLORS[t.archetype] ?? CHART_COLORS[0],
                        }}
                      >
                        {t.archetype}
                      </span>
                    </td>
                    <td className="text-right py-2 px-3 font-mono">{t.peak_year}</td>
                    <td className="text-right py-2 px-3 font-mono">{formatCompact(t.peak_count)}</td>
                    <td className="text-right py-2 px-3 font-mono">{formatCompact(t.current_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <KeyInsight>
        <p>
          The trajectory archetypes indicate that corporate innovation rarely follows a simple
          growth curve. &quot;Late Bloomer&quot; companies such as Samsung exhibit rapid growth after an extended
          period of lower activity, while &quot;Boom &amp; Bust&quot; firms experience pronounced peaks followed by sharp declines,
          often tied to the rise and fall of specific technology markets. &quot;Steady Climbers&quot;
          demonstrate consistent, sustained growth in patent output over extended periods.
        </p>
      </KeyInsight>

      {/* ── Section B1: Portfolio Diversification (secondary decomposition) ── */}
      <SectionDivider label="Portfolio Diversification" />

      <Narrative>
        <p>
          The degree of portfolio diversification among major filers varies substantially. <GlossaryTooltip term="Shannon entropy">Shannon
          entropy</GlossaryTooltip> across CPC subclasses measures whether a company distributes its
          innovation across many technology areas or concentrates in a few domains.
          Higher entropy indicates a broader, more diversified portfolio.
        </p>
      </Narrative>

      <ChartContainer
        title="Mitsubishi Electric Leads 50 Firms With Shannon Entropy of 6.7 Across 229 CPC Subclasses"
        caption="Shannon entropy across CPC subclasses over time for the 10 most diversified patent filers. The data indicate that technology conglomerates maintain the highest portfolio diversity, while pharmaceutical firms tend toward focused specialization."
        insight="Technology conglomerates such as Samsung and Hitachi maintain the highest portfolio diversity, while pharmaceutical firms tend toward focused specialization, reflecting fundamentally different innovation strategies."
        loading={diL}
      >
        {divPivot.length > 0 ? (
          <PWLineChart
            data={divPivot}
            xKey="year"
            lines={divCompanies.map((company, i) => ({
              key: company,
              name: company.length > 25 ? company.slice(0, 22) + '...' : company,
              color: BUMP_COLORS[i % BUMP_COLORS.length],
            }))}
            yLabel="Shannon Entropy"
            yFormatter={(v: number) => v.toFixed(1)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        title="Across 47 Companies, Entropy Ranges From 3.1 to 6.7 With No Clear Citation Trade-Off"
        caption="Shannon entropy (x-axis) vs. median 5-year forward citations (y-axis) for the latest period. Each point represents a company. The scatter indicates no simple trade-off between breadth and quality, as some highly diversified firms also achieve strong citation impact."
        insight="The scatter plot reveals no simple trade-off between breadth and quality: some highly diversified firms also achieve strong citation impact, suggesting that diversification and research excellence are not mutually exclusive."
        loading={diL || prL}
      >
        {diversityScatterData.length > 0 ? (
          <PWScatterChart
            data={diversityScatterData}
            xKey="shannon_entropy"
            yKey="median_citations_5yr"
            colorKey="category"
            nameKey="company"
            categories={diversityCategories}
            xLabel="Shannon Entropy"
            yLabel="Median Citations (5yr)"
            tooltipFields={[
              { key: 'company', label: 'Company' },
              { key: 'shannon_entropy', label: 'Entropy' },
              { key: 'median_citations_5yr', label: 'Median Citations' },
            ]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Portfolio diversification is not simply a function of company size. Some mid-sized
          filers achieve particularly high entropy through deliberate cross-domain R&amp;D strategies,
          while some of the largest filers maintain focused portfolios. The relationship between
          diversification and citation impact suggests that breadth and quality can coexist:
          companies with diverse portfolios do not necessarily sacrifice depth for coverage.
        </p>
      </KeyInsight>

      {/* ── Section B3: Patent Market Concentration (secondary decomposition) ── */}
      <SectionDivider label="Patent Market Concentration" />

      <Narrative>
        <p>
          The concentration of patent activity within each technology sector provides insight into competitive dynamics. The <GlossaryTooltip term="HHI">Herfindahl-Hirschman
          Index</GlossaryTooltip> (HHI) measures the degree to which patenting in a CPC section is
          dominated by a few large filers versus distributed across many organizations. Higher HHI
          indicates greater concentration.
        </p>
      </Narrative>

      <ChartContainer
        title="Section H (Electricity) Maintains the Second-Highest HHI at 102 While Section D Surged to 150 by 2025"
        caption="Herfindahl-Hirschman Index for each CPC technology section over time. Higher values indicate greater concentration of patent activity among fewer firms. The most notable pattern is the rising concentration in Sections H (Electricity) and G (Physics), while more applied fields such as E (Fixed Constructions) remain comparatively fragmented."
        insight="Rising concentration in Sections H (Electricity) and G (Physics) reflects the dominance of a few technology firms, while more applied fields such as E (Fixed Constructions) remain fragmented across many smaller filers."
        loading={coL}
        wide
      >
        {concPivot.length > 0 ? (
          <PWLineChart
            data={concPivot}
            xKey="year"
            lines={concSections.map((sec) => ({
              key: sec,
              name: `${sec}: ${CPC_SECTION_NAMES[sec] ?? sec}`,
              color: CPC_SECTION_COLORS[sec],
            }))}
            yLabel="HHI"
            yFormatter={(v: number) => v.toFixed(4)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2011] })}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent market concentration varies substantially across technology sectors and has
          evolved considerably over time. Sectors dominated by large-scale electronics and
          computing firms exhibit the highest concentration, while more traditional fields remain
          comparatively fragmented. The trend toward rising concentration in high-technology
          sectors raises important questions about competitive dynamics and whether the patent
          system may be reinforcing the market power of dominant firms.
        </p>
      </KeyInsight>

      {/* ── Section B2: Technology Pivot Detection (analytical deep dive) ── */}
      <SectionDivider label="Technology Pivot Detection" />

      <Narrative>
        <p>
          Technology pivots occur when a company&apos;s patent portfolio shifts significantly
          between consecutive time windows. Using <GlossaryTooltip term="Jensen-Shannon divergence">Jensen-Shannon
          divergence</GlossaryTooltip> (JSD) to measure the distance between CPC distributions
          across windows, it is possible to detect and characterize these pivots, often years before they
          become visible in business strategy announcements.
        </p>
      </Narrative>

      {pivotCompanyData.length > 0 && (
        <ChartContainer
          title={`${activePivotCompany} JSD Scores Flag Portfolio Shifts Among 51 Detected Pivots Across 20 Companies`}
          caption="Jensen-Shannon divergence between consecutive 5-year windows. Higher values indicate larger shifts in technology portfolio composition. Spikes in JSD correspond to periods when the company's innovation strategy underwent significant reorientation."
          insight="Elevated JSD scores identify periods when a company's innovation strategy underwent significant reorientation, often driven by acquisitions, market shifts, or deliberate R&D pivots."
          loading={pvL}
        >
          <PWBarChart
            data={pivotCompanyData.map((p) => ({
              window: `${p.window_start}-${p.window_end}`,
              jsd: p.jsd,
              is_pivot: p.is_pivot ? 1 : 0,
            }))}
            xKey="window"
            bars={[{ key: 'jsd', name: 'JSD Score', color: CHART_COLORS[4] }]}
            yLabel="Jensen-Shannon Divergence"
          />
        </ChartContainer>
      )}

      {detectedPivots.length > 0 && (
        <div className="max-w-4xl mx-auto my-6 overflow-x-auto max-h-96 overflow-y-auto">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">
            Detected Technology Pivots (All Companies)
          </h3>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Company</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Window</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">JSD</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Top Gaining CPC</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Top Losing CPC</th>
              </tr>
            </thead>
            <tbody>
              {detectedPivots.slice(0, 30).map((p, i) => (
                <tr key={`${p.company}-${p.window_start}-${i}`} className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium">{p.company}</td>
                  <td className="py-2 px-3 font-mono text-xs">{p.window_start}&ndash;{p.window_end}</td>
                  <td className="text-right py-2 px-3 font-mono">{p.jsd.toFixed(3)}</td>
                  <td className="py-2 px-3 text-xs">{p.top_gaining_cpc}</td>
                  <td className="py-2 px-3 text-xs">{p.top_losing_cpc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <KeyInsight>
        <p>
          Technology pivot detection suggests that major corporate transformations often begin
          in the patent portfolio years before they become visible in product announcements or
          financial reports. The highest JSD scores correspond to well-documented strategic shifts,
          such as IBM&apos;s transition from hardware to services, or Nokia&apos;s pivot from mobile
          hardware to telecommunications infrastructure. These findings indicate that patent portfolio analysis
          may serve as a leading indicator of corporate strategy.
        </p>
      </KeyInsight>

      {/* ── Section A1: Interactive Company Profiles (interactive deep dive) ── */}
      <SectionDivider label="Interactive Company Profiles" />

      <Narrative>
        <p>
          The selector below provides access to the complete innovation profile for each company. Each dashboard
          presents patent output, technology portfolio evolution, citation impact, team composition,
          and breadth of innovation over time. These profiles reveal the <StatCallout value="strategic fingerprint" /> of
          each organization&apos;s R&amp;D investment.
        </p>
      </Narrative>

      {companyList.length > 0 && (
        <div className="my-6 flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Company:</span>
          <PWCompanySelector
            companies={companyList}
            selected={activeCompany}
            onSelect={setSelectedCompany}
          />
        </div>
      )}

      {companySummary && (
        <div className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Total Patents</div>
            <div className="mt-1 text-2xl font-bold">{formatCompact(companySummary.totalPatents)}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Active Years</div>
            <div className="mt-1 text-2xl font-bold">{companySummary.firstYear}&ndash;{companySummary.lastYear}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Peak Year</div>
            <div className="mt-1 text-2xl font-bold">{companySummary.peakYear}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Peak Output</div>
            <div className="mt-1 text-2xl font-bold">{formatCompact(companySummary.peakCount)}</div>
          </div>
        </div>
      )}

      <ChartContainer
        title={`${activeCompany || 'Loading...'} Annual Patent Output Across ${companySummary?.activeYears ?? ''} Active Years, Peaking at ${companySummary ? formatCompact(companySummary.peakCount) : '...'} in ${companySummary?.peakYear ?? '...'}`}
        caption="Utility patents granted per year for the selected company. Annual patent counts indicate growth phases, strategic shifts, and the influence of economic cycles on corporate R&D output."
        insight="Annual patent counts reveal growth phases, strategic shifts, and the influence of economic cycles on corporate R&D output."
        loading={prL}
      >
        {companyData ? (
          <PWBarChart
            data={annualPatentData}
            xKey="year"
            bars={[{ key: 'patent_count', name: 'Patents', color: CHART_COLORS[0] }]}
            yLabel="Patents"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        title={`${activeCompany || 'Loading...'} Technology Portfolio Spans 8 CPC Sections From ${companySummary?.firstYear ?? '...'} to ${companySummary?.lastYear ?? '...'}`}
        caption="CPC section distribution over time illustrating how the company's technology focus has evolved. Shifts in the distribution signal strategic pivots; a growing share in Section H (Electricity) or G (Physics) often indicates a move toward digital and computing technologies."
        insight="Shifts in the CPC distribution signal strategic pivots: a growing share in Section H (Electricity) or G (Physics) often indicates a transition toward digital and computing technologies."
        loading={prL}
      >
        {companyData ? (
          <PWAreaChart
            data={cpcDistributionData}
            xKey="year"
            areas={CPC_SECTIONS.map((sec) => ({
              key: sec,
              name: `${sec}: ${CPC_SECTION_NAMES[sec]}`,
              color: CPC_SECTION_COLORS[sec],
            }))}
            stackedPercent
            yLabel="Share"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        title={`${activeCompany || 'Loading...'} Median 5-Year Forward Citations Track Research Influence Over ${companySummary?.activeYears ?? ''} Years`}
        caption="Median 5-year forward citations per patent over time. Citation trends indicate whether a company's patents are becoming more or less influential; declining citations despite rising volume may suggest a shift toward defensive or incremental patenting."
        insight="Citation trends indicate whether a company's patents are becoming more or less influential. Declining citations despite rising volume may suggest a shift toward defensive or incremental patenting."
        loading={prL}
      >
        {companyData ? (
          <PWLineChart
            data={citationsData}
            xKey="year"
            lines={[
              { key: 'median_citations_5yr', name: 'Median Citations (5yr)', color: CHART_COLORS[0] },
            ]}
            yLabel="Citations"
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        title={`${activeCompany || 'Loading...'} Team Size and Inventor Pool Show R&D Investment Trends From ${companySummary?.firstYear ?? '...'} to ${companySummary?.lastYear ?? '...'}`}
        caption="Average team size (left axis) and total active inventors (right axis) over time. Growing team sizes alongside expanding inventor pools suggest increasing R&D investment, while rising team sizes with stable inventor counts indicate deepening specialization."
        insight="Growing team sizes alongside expanding inventor pools suggest increasing R&D investment, while rising team sizes with stable inventor counts indicate deepening specialization."
        loading={prL}
      >
        {companyData ? (
          <PWLineChart
            data={teamInventorData}
            xKey="year"
            lines={[
              { key: 'avg_team_size', name: 'Avg Team Size', color: CHART_COLORS[1] },
              { key: 'inventor_count', name: 'Inventor Count', color: CHART_COLORS[3], yAxisId: 'right' },
            ]}
            yLabel="Team Size"
            rightYLabel="Inventors"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        title={`${activeCompany || 'Loading...'} CPC Subclass Breadth Tracks Diversification Over ${companySummary?.activeYears ?? ''} Active Years`}
        caption="Number of distinct CPC subclasses with patent activity each year. Rising CPC breadth indicates diversification of the innovation portfolio across more technology domains, while declining breadth suggests increasing specialization."
        insight="Rising CPC breadth indicates that a company is diversifying its innovation portfolio across more technology domains, while declining breadth suggests increasing specialization."
        loading={prL}
      >
        {companyData ? (
          <PWLineChart
            data={cpcBreadthData}
            xKey="year"
            lines={[
              { key: 'cpc_breadth', name: 'CPC Breadth', color: CHART_COLORS[4] },
            ]}
            yLabel="Distinct Subclasses"
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Company innovation profiles reveal distinct strategic signatures. Some firms, such as Samsung,
          exhibit rapid portfolio expansion across many technology domains, while others, particularly pharmaceutical
          companies, maintain deep but narrow portfolios. The relationship between patent volume,
          citation impact, and technology breadth provides a nuanced perspective on each firm&apos;s
          approach to R&amp;D investment.
        </p>
      </KeyInsight>

      <Narrative>
        This chapter concludes PatentWorld&apos;s examination of 50 years of US patent innovation.
      </Narrative>

      <DataNote>
        Company profiles are constructed from PatentsView data for the top 100 patent filers by
        total utility patent count, 1976-2025. CPC distribution uses the primary CPC classification
        of each patent. Trajectory archetypes are computed via time-series clustering of
        normalized annual patent counts. Corporate mortality tracks presence in the top 50 per
        decade. Shannon entropy is computed across CPC subclasses. Technology pivots use
        Jensen-Shannon divergence between consecutive 5-year windows of CPC distributions.
        Patent concentration (HHI) is computed at the CPC section level using assignee patent
        shares.
      </DataNote>

      <RelatedChapters currentChapter={14} />
      <ChapterNavigation currentChapter={14} />
    </div>
  );
}
