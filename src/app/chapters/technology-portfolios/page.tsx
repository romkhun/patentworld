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
import { PWSeriesSelector } from '@/components/charts/PWSeriesSelector';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  FirmTechEvolution,
  PortfolioDiversity,
  PortfolioDiversificationB3,
  PivotDetection,
} from '@/lib/types';

export default function TechnologyPortfolios() {
  /* ── Data hooks ── */
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');
  const { data: diversity, loading: divL } = useChapterData<PortfolioDiversity[]>('chapter3/portfolio_diversity.json');
  const { data: diversification, loading: diL } = useChapterData<PortfolioDiversificationB3[]>('company/portfolio_diversification_b3.json');
  const { data: pivots, loading: pvL } = useChapterData<PivotDetection[]>('company/pivot_detection.json');

  /* ── State ── */
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedDivSeries, setSelectedDivSeries] = useState<Set<string>>(new Set());

  /* ── Constants ── */
  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  /* ── Computations: Tech evolution (Figure 8) ── */
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
      const cleanPeriod = String(period).replace(/\.0/g, '');
      const row: any = { period: cleanPeriod };
      orgData.filter((d) => d.period === period).forEach((d) => {
        row[d.section] = d.count;
      });
      return row;
    });
  }, [techEvo, activeOrg]);

  /* ── Computations: Portfolio diversity (Figure 9) ── */
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

  /* ── Computations: Portfolio diversification B3 (Figure 17) ── */
  const { divPivot, divCompanies } = useMemo(() => {
    if (!diversification) return { divPivot: [], divCompanies: [] };
    const companies = [...new Set(diversification.map((d) => d.company))];
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

  /* ── Computations: Pivot detection (Figure 18) ── */
  const pivotCompanyList = useMemo(() => {
    if (!pivots) return [];
    return [...new Set(pivots.map((p) => p.company))].sort();
  }, [pivots]);

  const activePivotCompany = pivotCompanyList[0] ?? '';

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

  return (
    <div>
      <ChapterHeader
        number={12}
        title="Technology Portfolios"
        subtitle="How firms distribute innovation across technology domains and detect strategic pivots"
      />

      <KeyFindings>
        <li>Technology portfolio composition evolves substantially over time, with firms such as Samsung expanding from electronics-dominated portfolios into new CPC sections in the 1990s.</li>
        <li>Portfolio diversity rose across leading firms, with Mitsubishi Electric reaching a peak Shannon entropy of 4.9 across CPC subclasses, indicating broad technology coverage.</li>
        <li>Mitsubishi Electric leads 50 firms with Shannon entropy of 6.7 across 229 CPC subclasses, while Jensen-Shannon divergence analysis flags 51 detected pivots across 20 companies.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          This chapter examines how major patent holders distribute their innovation across technology domains and whether their portfolios are broadening or narrowing over time. Shannon entropy measurements reveal that most leading firms have steadily diversified, with Mitsubishi Electric reaching entropy of 6.7 across 229 CPC subclasses. Jensen-Shannon divergence analysis detects 51 technology pivots across 20 companies, often years before strategic shifts become publicly visible.
        </p>
      </aside>

      <Narrative>
        <p>
          The <Link href="/chapters/firm-citation-quality" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">previous chapter</Link> examined the quality distribution of firm patent portfolios through citation impact analysis. This chapter shifts from quality to composition, examining <StatCallout value="how firms allocate their innovation" /> across technology domains and whether those allocations change over time.
        </p>
        <p>
          Two complementary approaches are employed. First, technology portfolio composition charts reveal the CPC section distribution of each firm&apos;s patents over time, showing whether firms are broadening into new areas or deepening existing strengths. Second, Shannon entropy and Jensen-Shannon divergence provide quantitative measures of portfolio breadth and the magnitude of strategic pivots, enabling systematic comparison across dozens of firms and time periods.
        </p>
      </Narrative>

      {/* ── Technology Portfolios ── */}

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
        id="fig-technology-portfolios-tech-evolution"
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

      {/* ── Patent Portfolio Diversity ── */}

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
        id="fig-technology-portfolios-portfolio-diversity"
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

      {/* ── Portfolio Diversification ── */}

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
        id="fig-technology-portfolios-diversification"
        subtitle="Shannon entropy across CPC subclasses over time for the 10 most diversified firms, measuring portfolio breadth."
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

      <KeyInsight>
        <p>
          Portfolio diversification is not simply a function of company size. Some mid-sized
          filers achieve particularly high entropy through deliberate cross-domain R&amp;D strategies,
          while some of the largest filers maintain focused portfolios. The relationship between
          diversification and citation impact suggests that breadth and quality can coexist:
          companies with diverse portfolios do not necessarily sacrifice depth for coverage.
        </p>
      </KeyInsight>

      {/* ── Technology Pivot Detection ── */}

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
          id="fig-technology-portfolios-pivot-detection"
          subtitle="Jensen-Shannon divergence between consecutive 5-year CPC distribution windows, with spikes indicating significant portfolio reorientation."
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

      {/* ── Closing ── */}

      <Narrative>
        <p>
          Technology portfolio analysis reveals that firms pursue fundamentally different diversification strategies, and that portfolio shifts detected through Jensen-Shannon divergence often anticipate major business transformations. The next chapter, <Link href="/chapters/company-profiles" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Company Profiles</Link>, provides interactive dashboards for individual companies, combining patent output, technology portfolios, citation impact, team composition, and breadth of innovation into comprehensive firm-level profiles.
        </p>
      </Narrative>

      <DataNote>
        Technology portfolio composition uses CPC section-level classification for patents
        aggregated by 5-year period. Shannon entropy is computed across CPC subclasses per
        period for each organization. Portfolio diversification (B3) tracks entropy over time
        for the top 50 filers. Technology pivot detection uses Jensen-Shannon divergence between
        consecutive 5-year windows of CPC subclass distributions; a pivot is flagged when JSD
        exceeds the 90th percentile threshold across all firm-windows. Source: PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={12} />
      <ChapterNavigation currentChapter={12} />
    </div>
  );
}
