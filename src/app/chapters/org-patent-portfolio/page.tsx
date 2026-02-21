'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWScatterChart } from '@/components/charts/PWScatterChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import Link from 'next/link';
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS, INDUSTRY_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { cleanOrgName } from '@/lib/orgNames';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  PortfolioOverlapPoint,
  PortfolioDiversificationB3,
  CorpDiversification,
  PivotDetection,
  WIPOPortfolioDiversity,
} from '@/lib/types';

export default function OrgPatentPortfolioChapter() {
  /* ── Data hooks ── */
  const { data: portfolioOverlap, loading: poL } = useChapterData<PortfolioOverlapPoint[]>('company/portfolio_overlap.json');
  const { data: diversification, loading: diL } = useChapterData<PortfolioDiversificationB3[]>('company/portfolio_diversification_b3.json');
  const { data: corpDiv, loading: cpL } = useChapterData<CorpDiversification[]>('chapter7/corp_diversification.json');
  const { data: pivots, loading: pvL } = useChapterData<PivotDetection[]>('company/pivot_detection.json');
  const { data: wipoDiversity, loading: wdL } = useChapterData<WIPOPortfolioDiversity[]>('chapter11/wipo_portfolio_diversity.json');

  /* ── Constants ── */
  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  /* ── Section a: Competitive Proximity Map ── */
  const overlapIndustries = useMemo(() => {
    if (!portfolioOverlap) return [];
    return [...new Set(portfolioOverlap.map(p => p.industry))];
  }, [portfolioOverlap]);

  /* ── Section b: Portfolio Diversification ── */
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

  /* ── Section c: Corporate Technology Portfolios ── */
  const corpDivLate = useMemo(() => {
    if (!corpDiv) return [];
    const orgs = [...new Set(corpDiv.map((d) => d.organization))];
    return orgs.map((org) => {
      const row: any = { organization: cleanOrgName(org) };
      let total = 0;
      corpDiv.filter((d) => d.organization === org && d.era === 'late').forEach((d) => {
        row[d.section] = d.count;
        total += d.count;
      });
      row._total = total;
      return row;
    }).sort((a: any, b: any) => b._total - a._total);
  }, [corpDiv]);

  /* ── Section d: Technology Pivot Detection ── */
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

  const wipoDiversityBars = useMemo(() => {
    if (!wipoDiversity) return [];
    return wipoDiversity.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [wipoDiversity]);

  return (
    <div>
      <ChapterHeader
        number={11}
        title="Patent Portfolio"
        subtitle="Diversification, competitive proximity, and portfolio transitions"
      />
      <MeasurementSidebar slug="org-patent-portfolio" />

      <KeyFindings>
        <li>50 companies across six decades (248 company-decade observations) cluster into 8 industry groups by patent portfolio similarity, with technology conglomerates occupying positions at the intersection of multiple groups. Industry labels are assigned using a rule-based heuristic on each company&apos;s dominant <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> section and top subclass.</li>
        <li>Portfolio diversity rose across leading firms, with Mitsubishi Electric reaching a peak Shannon entropy of 7.1 across 287 CPC subclasses, indicating broad technology coverage.</li>
        <li>IBM (88,600 G-section patents) and Samsung (79,400 H-section patents) maintain the most diversified technology portfolios among the top ten patent holders.</li>
        <li>Jensen-Shannon divergence analysis (comparing CPC distributions across consecutive 3-year windows, with pivots flagged above the 95th percentile per-company threshold) identifies 51 detected pivots across 20 companies, which can precede strategic shifts that later become publicly visible.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Patent portfolio analysis reveals that 50 companies (248 company-decade observations) cluster into 8 industry groups by CPC distribution similarity, though technology conglomerates straddle multiple groups. Shannon entropy measurements show that most leading firms have steadily diversified, with Mitsubishi Electric reaching entropy of 7.1 across 287 CPC subclasses. Corporate technology portfolios confirm that the most persistent leaders maintain broad CPC coverage, while Jensen-Shannon divergence analysis detects 51 technology pivots across 20 companies, which can precede strategic shifts that later become publicly visible.
        </p>
      </aside>

      <Narrative>
        <p>
          This chapter examines four complementary perspectives on how firms manage their patent portfolios:
          competitive proximity mapping reveals which firms occupy similar technology space, Shannon entropy
          tracks portfolio diversification over time, stacked CPC distributions illustrate how the largest
          filers distribute innovation across technology domains, and Jensen-Shannon divergence detects
          strategic pivots in portfolio composition. Together, these analyses provide a comprehensive view of
          corporate technology positioning and portfolio evolution.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Patent portfolio structure reveals corporate strategy in ways that aggregate counts cannot.
          Two firms with identical patent volumes can occupy entirely different positions in the technology
          landscape, pursue contrasting diversification strategies, and undergo portfolio shifts that
          anticipate major business transformations.
        </p>
      </KeyInsight>

      {/* ── Section a: Competitive Proximity Map ── */}

      <SectionDivider label="Competitive Proximity Map" />

      <Narrative>
        <p>
          The degree of similarity among corporate patent portfolios can be quantified by computing{' '}
          <GlossaryTooltip term="cosine similarity">cosine similarity</GlossaryTooltip> between
          CPC subclass distributions and projecting the results via{' '}
          <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip>, yielding a two-dimensional representation of the
          competitive landscape of innovation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-portfolio-competitive-proximity"
        subtitle="UMAP projection of patent portfolio similarity among 50 companies (248 company-decade observations), with proximity reflecting cosine similarity of CPC subclass distributions."
        title="50 Companies Cluster into 8 Industry Groups by Patent Portfolio Similarity"
        caption="Each point represents a company-decade observation; proximity reflects similarity in CPC subclass distributions, and color indicates industry group. Industry labels are assigned using a rule-based heuristic on each company's dominant CPC section and top subclass. UMAP projection uses cosine metric with n_neighbors=10. Technology conglomerates occupy positions at the intersection of multiple groups, reflecting diversified portfolio strategies."
        insight="Companies cluster by industry, though the boundaries are increasingly blurred. Technology conglomerates occupy positions at the intersection of multiple clusters, reflecting diversified portfolio strategies."
        loading={poL}
      >
        {portfolioOverlap ? (
          <PWScatterChart
            data={portfolioOverlap}
            xKey="x"
            yKey="y"
            colorKey="industry"
            nameKey="company"
            categories={overlapIndustries}
            colors={overlapIndustries.map(i => INDUSTRY_COLORS[i] ?? '#999999')}
            tooltipFields={[
              { key: 'company', label: 'Company' },
              { key: 'industry', label: 'Industry' },
              { key: 'top_cpc', label: 'Top CPC' },
            ]}
            xLabel="UMAP-1"
            yLabel="UMAP-2"
          />
        ) : <div />}
      </ChartContainer>

      {/* ── Section b: Portfolio Diversification ── */}

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
        id="fig-patent-portfolio-diversification"
        subtitle="Shannon entropy across CPC subclasses over time for the 10 most diversified firms, measuring portfolio breadth."
        title="Mitsubishi Electric Leads 50 Firms With Shannon Entropy of 7.1 Across 287 CPC Subclasses"
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

      {/* ── Section c: Corporate Technology Portfolios ── */}

      <SectionDivider label="Corporate Technology Portfolios" />

      <Narrative>
        <p>
          The technology portfolios of major patent holders illustrate how firms diversify their
          innovation across fields. The stacked bar chart below shows the distribution of patent
          grants across <StatCallout value="CPC technology sections" /> for the ten largest
          assignees, revealing the breadth or concentration of each firm&apos;s portfolio.
        </p>
      </Narrative>

      {corpDivLate.length > 0 && (
        <ChartContainer
          id="fig-patent-portfolio-corp-diversification"
          subtitle="Distribution of patent grants across CPC technology sections for the ten largest assignees (2001–2025), shown as stacked bars."
          title="IBM (88,600 G-Section Patents) and Samsung (79,400 H-Section Patents) Maintain the Most Diversified Technology Portfolios Among the Top Ten Patent Holders (2001–2025)"
          caption="The figure displays the distribution of patent grants across CPC technology sections for the ten largest patent holders in the 2001–2025 period. IBM and Samsung exhibit the broadest portfolio diversification, spanning physics, electricity, and chemistry, whereas firms such as Intel concentrate in semiconductor-related classifications."
          loading={cpL}
          height={650}
          insight="Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings, as the most persistent leaders maintain diversified technology portfolios."
        >
          <PWBarChart
            data={corpDivLate}
            xKey="organization"
            bars={sectionKeys.map((key) => ({
              key,
              name: `${key}: ${CPC_SECTION_NAMES[key]}`,
              color: CPC_SECTION_COLORS[key],
            }))}
            layout="vertical"
            stacked
            yLabel="Number of Patents"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings.
          The most persistent leaders — IBM, Samsung, Canon — maintain diversified technology
          portfolios, whereas more specialized firms tend to rise and fall with the trajectories
          of their core technology domains.
        </p>
      </KeyInsight>

      {/* ── Section d: Technology Pivot Detection ── */}

      <SectionDivider label="Technology Pivot Detection" />

      <Narrative>
        <p>
          Technology pivots occur when a company&apos;s patent portfolio shifts significantly
          between consecutive time windows. Using <GlossaryTooltip term="Jensen-Shannon divergence">Jensen-Shannon
          divergence</GlossaryTooltip> (JSD) to measure the distance between CPC distributions
          across windows, it is possible to detect and characterize these pivots, which can precede
          business strategy announcements.
        </p>
      </Narrative>

      {pivotCompanyData.length > 0 && (
        <ChartContainer
          id="fig-patent-portfolio-pivot-detection"
          subtitle="Jensen-Shannon divergence between consecutive 3-year CPC distribution windows, with spikes indicating significant portfolio reorientation."
          title={`${activePivotCompany} JSD Scores Flag Portfolio Shifts Among 51 Detected Pivots Across 20 Companies`}
          caption="Jensen-Shannon divergence between consecutive 3-year windows. Higher values indicate larger shifts in technology portfolio composition. Pivots are flagged when JSD exceeds the 95th percentile of each company's own distribution. Spikes correspond to periods when the company's innovation strategy underwent significant reorientation."
          insight="Elevated JSD scores identify periods when a company's innovation strategy underwent significant reorientation, often associated with acquisitions, market shifts, or deliberate R&D pivots."
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
          may serve as a potential indicator of corporate strategy.
        </p>
      </KeyInsight>

      {/* ── Section e: WIPO Portfolio Diversity ── */}

      <SectionDivider label="WIPO Portfolio Diversity" />

      <Narrative>
        <p>
          While CPC-based entropy captures granular subclass-level diversity, the WIPO technology
          classification offers a complementary perspective organized around 35 technology fields.
          WIPO-level Shannon entropy measures how evenly a firm distributes its patents across
          these broader technology domains, distinguishing diversified conglomerates from
          narrowly focused specialists.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-portfolio-wipo-diversity"
        title="US Air Force Leads WIPO Diversity at 3.14 Entropy Across 35 Fields, While Ericsson Concentrates at 1.40"
        subtitle="50 firms ranked by Shannon entropy across WIPO technology fields, measuring breadth of patent portfolio at the technology domain level"
        caption="Firms ranked by Shannon entropy computed across 35 WIPO technology fields. Higher entropy indicates a more evenly distributed portfolio across technology domains. Government and industrial conglomerates lead, while telecommunications and semiconductor firms concentrate in fewer fields."
        insight="The WIPO-level entropy ranking reveals a striking contrast between diversified industrial conglomerates (US Air Force, Mitsubishi Electric, GE) and focused technology firms (Ericsson, Cisco, Huawei), reflecting fundamentally different innovation strategies."
        loading={wdL}
        height={1400}
      >
        <PWBarChart
          data={wipoDiversityBars}
          xKey="label"
          bars={[{ key: 'wipo_shannon_entropy', name: 'Shannon Entropy (WIPO)', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          WIPO-level portfolio diversity reveals a more than twofold range in Shannon entropy across
          the top 50 patent holders — from 3.14 (US Air Force, spanning all 35 WIPO fields) down to
          1.40 (Ericsson, concentrated in telecommunications). This pattern is consistent with the
          CPC-based analysis but highlights how mission-driven organizations (defense, national labs)
          and industrial conglomerates (Mitsubishi Electric, GE, Hitachi) achieve the broadest
          technology coverage, while firms with focused competitive strategies maintain deliberately
          narrow portfolios.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          Portfolio analysis reveals that firms pursue fundamentally different diversification strategies, and that portfolio shifts detected through Jensen-Shannon divergence often anticipate major business transformations. The next chapter, <Link href="/chapters/org-company-profiles/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Interactive Company Profiles</Link>, combines patent output, technology portfolios, citation impact, and innovation strategy into comprehensive firm-level dashboards.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "50 companies (248 company-decade observations) cluster into 8 industry groups by patent portfolio similarity, revealing that technology strategy is structured by industry boundaries.",
          "51 technology pivots were detected across 20 companies, which can precede strategic shifts that later become publicly visible.",
        ]}
        falsifiable="If patent portfolio pivots predict corporate strategy changes, then firms showing CPC composition shifts should subsequently announce corresponding business unit expansions or acquisitions."
        nextAnalysis={{
          label: "Interactive Company Profiles",
          description: "Unified dashboards integrating output, quality, portfolio, strategy, and speed for each firm",
          href: "/chapters/org-company-profiles/",
        }}
      />

      <DataNote>
        Competitive proximity uses cosine similarity of CPC subclass distributions projected to 2D via UMAP (cosine metric, n_neighbors=10, min_dist=0.3) for 50 companies across six decades (248 company-decade observations). The 8 industry labels are assigned using a rule-based heuristic on each company&apos;s dominant CPC section and top subclass (e.g., H01L → Semiconductor, B60 → Automotive), not statistical clustering. Portfolio diversification tracks Shannon entropy across CPC subclasses per period for the top 50 filers. Corporate technology portfolios use CPC section-level classification for the late period (2001–2025). Technology pivot detection uses Jensen-Shannon divergence between consecutive 3-year windows of CPC subclass distributions; a pivot is flagged when JSD exceeds the 95th percentile of that company&apos;s own JSD distribution, yielding 51 detected pivots across 20 companies. Source: PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={11} />
      <ChapterNavigation currentChapter={11} />
    </div>
  );
}
