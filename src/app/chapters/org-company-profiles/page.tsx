'use client';

import { useEffect, useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWFanChart } from '@/components/charts/PWFanChart';
import { PWRadarChart } from '@/components/charts/PWRadarChart';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import Link from 'next/link';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import type {
  CompanyProfile,
  StrategyProfile,
  CorporateSpeed,
  FirmQualityYear,
  FirmClaimsYear,
  FirmTechEvolution,
} from '@/lib/types';

const CPC_SECTIONS = Object.keys(CPC_SECTION_NAMES);

/* ── Helper: "No data" placeholder ── */
function NoDataPlaceholder({ company, section }: { company: string; section: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-sm text-muted-foreground">
      No {section} data available for <span className="ml-1 font-medium">{company}</span>.
    </div>
  );
}

export default function OrgCompanyProfilesChapter() {
  /* ═══════════════════════════════════════════════════════
   *  DATA HOOKS
   * ═══════════════════════════════════════════════════════ */
  const { data: profiles, loading: prL } = useChapterData<CompanyProfile[]>('company/company_profiles.json');
  const { data: strategyProfiles, loading: spL } = useChapterData<StrategyProfile[]>('company/strategy_profiles.json');
  const { data: corporateSpeed, loading: csL } = useChapterData<CorporateSpeed[]>('company/corporate_speed.json');
  const { data: firmQuality, loading: fqL } = useChapterData<Record<string, FirmQualityYear[]>>('company/firm_quality_distribution.json');
  const { data: firmClaims, loading: fcmL } = useChapterData<Record<string, FirmClaimsYear[]>>('company/firm_claims_distribution.json');
  const { data: nameMapping, loading: nmL } = useChapterData<Record<string, string>>('company/company_name_mapping.json');
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');

  /* ═══════════════════════════════════════════════════════
   *  SHARED STATE
   * ═══════════════════════════════════════════════════════ */
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  /* Strategy section local state */
  const [strategyViewMode, setStrategyViewMode] = useState<'radar' | 'bar'>('radar');
  const [strategyCompare, setStrategyCompare] = useState<string[]>([]);

  /* ═══════════════════════════════════════════════════════
   *  UNION COMPANY LIST
   * ═══════════════════════════════════════════════════════ */
  const companyList = useMemo(() => {
    const names = new Set<string>();
    if (profiles) profiles.forEach((p) => names.add(p.company));
    if (strategyProfiles) strategyProfiles.forEach((p) => names.add(p.company));
    if (corporateSpeed) corporateSpeed.forEach((p) => names.add(p.company));
    if (firmQuality) Object.keys(firmQuality).forEach((k) => names.add(k));
    if (firmClaims) Object.keys(firmClaims).forEach((k) => names.add(k));
    return [...names].sort();
  }, [profiles, strategyProfiles, corporateSpeed, firmQuality, firmClaims]);

  const activeCompany = selectedCompany || companyList[0] || '';

  /* Reverse name mapping: clean -> raw (for tech evolution lookup) */
  const reverseNameMap = useMemo(() => {
    if (!nameMapping) return {};
    const rev: Record<string, string> = {};
    for (const [raw, clean] of Object.entries(nameMapping)) {
      rev[clean] = raw;
    }
    return rev;
  }, [nameMapping]);

  /* ═══════════════════════════════════════════════════════
   *  SECTION 1: COMPANY PROFILES
   * ═══════════════════════════════════════════════════════ */
  const companyData = useMemo(() => {
    if (!profiles || !activeCompany) return null;
    return profiles.find((p) => p.company === activeCompany) ?? null;
  }, [profiles, activeCompany]);

  const companySummary = useMemo(() => {
    if (!companyData) return null;
    const years = companyData.years;
    if (years.length === 0) return null;
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

  const annualPatentData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({ year: y.year, patent_count: y.patent_count }));
  }, [companyData]);

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

  const citationsData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({
      year: y.year,
      median_citations_5yr: y.median_citations_5yr,
    }));
  }, [companyData]);

  const teamInventorData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({
      year: y.year,
      avg_team_size: y.avg_team_size,
      inventor_count: y.inventor_count,
    }));
  }, [companyData]);

  const cpcBreadthData = useMemo(() => {
    if (!companyData) return [];
    return companyData.years.map((y) => ({
      year: y.year,
      cpc_breadth: y.cpc_breadth,
    }));
  }, [companyData]);

  /* ═══════════════════════════════════════════════════════
   *  SECTION 2: INNOVATION STRATEGY PROFILES
   * ═══════════════════════════════════════════════════════ */
  const hasStrategyData = useMemo(() => {
    if (!strategyProfiles || !activeCompany) return false;
    return strategyProfiles.some((p) => p.company === activeCompany);
  }, [strategyProfiles, activeCompany]);

  /* Initialize comparison companies: active + one other */
  useEffect(() => {
    if (strategyProfiles && activeCompany && strategyCompare.length === 0) {
      const others = strategyProfiles
        .map((p) => p.company)
        .filter((c) => c !== activeCompany);
      setStrategyCompare([activeCompany, ...(others.length > 0 ? [others[0]] : [])]);
    }
  }, [strategyProfiles, activeCompany, strategyCompare.length]);

  /* Always include the activeCompany in comparison */
  const effectiveStrategyCompare = useMemo(() => {
    if (!hasStrategyData) return strategyCompare;
    if (strategyCompare.includes(activeCompany)) return strategyCompare;
    return [activeCompany, ...strategyCompare.slice(0, 2)];
  }, [strategyCompare, activeCompany, hasStrategyData]);

  const strategyDimensions = ['breadth', 'depth', 'defensiveness', 'influence', 'science_intensity', 'speed', 'collaboration', 'freshness'];

  const radarData = useMemo((): { dimension: string; [company: string]: number | string }[] => {
    if (!strategyProfiles || effectiveStrategyCompare.length === 0) return [];
    return strategyDimensions.map((dim) => {
      const row: { dimension: string; [company: string]: number | string } = {
        dimension: dim.replace('_', ' '),
      };
      effectiveStrategyCompare.forEach((c) => {
        const profile = strategyProfiles.find((p) => p.company === c);
        if (profile) row[c] = profile[dim as keyof StrategyProfile] as number;
      });
      return row;
    });
  }, [strategyProfiles, effectiveStrategyCompare]);

  const strategyBarData = useMemo(() => {
    if (!radarData || radarData.length === 0) return [];
    return radarData.map((row) => {
      const barRow: Record<string, number | string> = { dimension: row.dimension };
      effectiveStrategyCompare.forEach((c) => {
        barRow[c] = row[c];
      });
      return barRow;
    });
  }, [radarData, effectiveStrategyCompare]);

  const strategyCompanyList = useMemo(() => {
    if (!strategyProfiles) return [];
    return strategyProfiles.map((p) => p.company);
  }, [strategyProfiles]);

  /* ═══════════════════════════════════════════════════════
   *  SECTION 3: CORPORATE INNOVATION SPEED
   * ═══════════════════════════════════════════════════════ */
  const speedData = useMemo(() => {
    if (!corporateSpeed || !activeCompany) return [];
    return corporateSpeed
      .filter((d) => d.company === activeCompany)
      .sort((a, b) => a.year - b.year)
      .map((d) => ({
        year: d.year,
        avg_grant_lag_days: d.avg_grant_lag_days,
        median_grant_lag_days: d.median_grant_lag_days,
        patent_count: d.patent_count,
      }));
  }, [corporateSpeed, activeCompany]);

  const hasSpeedData = speedData.length > 0;

  const speedSummary = useMemo(() => {
    if (speedData.length === 0) return null;
    const latest = speedData[speedData.length - 1];
    const min = speedData.reduce((best, d) => (d.median_grant_lag_days < best.median_grant_lag_days ? d : best), speedData[0]);
    const max = speedData.reduce((worst, d) => (d.median_grant_lag_days > worst.median_grant_lag_days ? d : worst), speedData[0]);
    return {
      latestMedian: Math.round(latest.median_grant_lag_days),
      minMedian: Math.round(min.median_grant_lag_days),
      minYear: min.year,
      maxMedian: Math.round(max.median_grant_lag_days),
      maxYear: max.year,
    };
  }, [speedData]);

  /* ═══════════════════════════════════════════════════════
   *  SECTION 4: INNOVATION QUALITY PROFILES
   * ═══════════════════════════════════════════════════════ */
  const hasQualityData = useMemo(() => {
    if (!firmQuality || !activeCompany) return false;
    return activeCompany in firmQuality;
  }, [firmQuality, activeCompany]);

  const selectedQualityData = useMemo(
    () => firmQuality?.[activeCompany] ?? [],
    [firmQuality, activeCompany],
  );

  const selectedClaimsData = useMemo(
    () => firmClaims?.[activeCompany] ?? [],
    [firmClaims, activeCompany],
  );

  const hasClaimsData = selectedClaimsData.length > 0;

  /* ═══════════════════════════════════════════════════════
   *  SECTION 5: TECHNOLOGY PORTFOLIOS
   * ═══════════════════════════════════════════════════════ */
  const sectionKeys = useMemo(
    () => Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y'),
    [],
  );

  /* Look up the raw org name for the active company */
  const rawOrgName = useMemo(() => {
    if (!activeCompany) return '';
    return reverseNameMap[activeCompany] ?? '';
  }, [activeCompany, reverseNameMap]);

  /* List of available orgs in tech evolution dataset */
  const techOrgSet = useMemo(() => {
    if (!techEvo) return new Set<string>();
    return new Set(techEvo.map((d) => d.organization));
  }, [techEvo]);

  const hasTechEvoData = useMemo(() => {
    if (!rawOrgName) return false;
    return techOrgSet.has(rawOrgName);
  }, [rawOrgName, techOrgSet]);

  const techEvoPivot = useMemo(() => {
    if (!techEvo || !rawOrgName || !hasTechEvoData) return [];
    const orgData = techEvo.filter((d) => d.organization === rawOrgName);
    const periods = [...new Set(orgData.map((d) => d.period))].sort();
    return periods.map((period) => {
      const cleanPeriod = String(period).replace(/\.0/g, '');
      const row: Record<string, number | string> = { period: cleanPeriod };
      orgData
        .filter((d) => d.period === period)
        .forEach((d) => {
          row[d.section] = d.count;
        });
      return row;
    });
  }, [techEvo, rawOrgName, hasTechEvoData]);

  /* ═══════════════════════════════════════════════════════
   *  LOADING INDICATOR
   * ═══════════════════════════════════════════════════════ */
  const anyLoading = prL || spL || csL || fqL || fcmL || nmL || tevL;

  /* ═══════════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════════ */
  return (
    <div>
      <ChapterHeader
        number={12}
        title="Interactive Company Profiles"
        subtitle="Unified patent histories, portfolios, quality trends, and strategy profiles"
      />

      <KeyFindings>
        <li>Interactive profiles spanning patent output, technology portfolio, citation impact, innovation strategy, and grant speed provide a comprehensive innovation fingerprint for each of the top patent filers.</li>
        <li>Company profiles reveal distinct strategic signatures: some firms exhibit rapid portfolio expansion across many technology domains, while others maintain deep but narrow portfolios.</li>
        <li>The relationship between patent volume, citation impact, technology breadth, and innovation speed provides a nuanced perspective on each firm&apos;s approach to R&amp;D investment.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          This chapter provides unified interactive company dashboards combining five dimensions of innovation for each of the top patent filers. Select a company below to explore its annual patent output, CPC technology composition, citation quality distribution, innovation strategy profile, and patent prosecution speed -- all in a single view.
        </p>
      </aside>

      <Narrative>
        <p>
          The preceding chapters examined <Link href="/chapters/org-patent-count" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">organizational patent output</Link>, <Link href="/chapters/org-patent-quality" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">quality metrics</Link>, and <Link href="/chapters/org-patent-portfolio" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">portfolio composition</Link> as separate analytical dimensions. This chapter integrates those perspectives into a single interactive dashboard for each company, providing a <StatCallout value="comprehensive innovation fingerprint" /> that reveals how patent volume, quality, strategic orientation, and prosecution speed interrelate within individual organizations.
        </p>
        <p>
          Each dashboard presents five views: annual patent output and summary statistics, technology portfolio evolution through CPC distributions, innovation quality through citation fan charts and blockbuster rates, multi-dimensional strategy profiles, and patent prosecution speed through grant lag trends. Together, these views enable direct comparison of how individual firms navigate the innovation landscape.
        </p>
      </Narrative>

      {/* ════════════════════════════════════════════════════
       *  SHARED COMPANY SELECTOR
       * ════════════════════════════════════════════════════ */}

      <div className="sticky top-0 z-20 -mx-4 bg-background/95 px-4 py-4 backdrop-blur-sm border-b mb-6">
        <div className="flex items-center gap-3 max-w-[960px] mx-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Company:</span>
          {companyList.length > 0 ? (
            <PWCompanySelector
              companies={companyList}
              selected={activeCompany}
              onSelect={setSelectedCompany}
            />
          ) : (
            <span className="text-sm text-muted-foreground">Loading companies...</span>
          )}
          {anyLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">Loading data...</span>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
       *  SECTION 1: COMPANY PROFILES
       * ════════════════════════════════════════════════════ */}

      <SectionDivider label="Patent Output & Team Composition" />

      <Narrative>
        <p>
          The first dimension of each company&apos;s innovation fingerprint is its raw patent output trajectory.
          Annual patent counts reveal growth phases, strategic shifts, and the influence of economic cycles
          on corporate R&amp;D output. Summary statistics provide context for the scale and duration of
          each firm&apos;s patent activity.
        </p>
      </Narrative>

      {companyData ? (
        <>
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
            id="fig-org-profiles-annual-output"
            subtitle="Utility patents granted per year for the selected company, showing growth phases and strategic shifts over time."
            title={`${activeCompany} Annual Patent Output Across ${companySummary?.activeYears ?? ''} Active Years, Peaking at ${companySummary ? formatCompact(companySummary.peakCount) : '...'} in ${companySummary?.peakYear ?? '...'}`}
            caption="Utility patents granted per year for the selected company. Annual patent counts indicate growth phases, strategic shifts, and the influence of economic cycles on corporate R&D output."
            insight="Annual patent counts reveal growth phases, strategic shifts, and the influence of economic cycles on corporate R&D output."
            loading={prL}
          >
            <PWBarChart
              data={annualPatentData}
              xKey="year"
              bars={[{ key: 'patent_count', name: 'Patents', color: CHART_COLORS[0] }]}
              yLabel="Number of Patents"
            />
          </ChartContainer>

          <ChartContainer
            id="fig-org-profiles-cpc-distribution"
            subtitle="CPC section distribution over time for the selected company, showing how the technology portfolio has evolved."
            title={`${activeCompany} Technology Portfolio Spans 8 CPC Sections From ${companySummary?.firstYear ?? '...'} to ${companySummary?.lastYear ?? '...'}`}
            caption="CPC section distribution over time illustrating how the company's technology focus has evolved. Shifts in the distribution signal strategic pivots."
            insight="Shifts in the CPC distribution signal strategic pivots: a growing share in Section H (Electricity) or G (Physics) often indicates a transition toward digital and computing technologies."
            loading={prL}
          >
            <PWAreaChart
              data={cpcDistributionData}
              xKey="year"
              areas={CPC_SECTIONS.map((sec) => ({
                key: sec,
                name: `${sec}: ${CPC_SECTION_NAMES[sec]}`,
                color: CPC_SECTION_COLORS[sec],
              }))}
              stackedPercent
              yLabel="Share (%)"
            />
          </ChartContainer>

          <ChartContainer
            id="fig-org-profiles-citations"
            subtitle="Median 5-year forward citations per patent over time for the selected company."
            title={`${activeCompany} Median 5-Year Forward Citations Track Research Influence Over ${companySummary?.activeYears ?? ''} Years`}
            caption="Median 5-year forward citations per patent over time. Citation trends indicate whether a company's patents are becoming more or less influential."
            insight="Citation trends indicate whether a company's patents are becoming more or less influential. Declining citations despite rising volume may suggest a shift toward defensive or incremental patenting."
            loading={prL}
          >
            <PWLineChart
              data={citationsData}
              xKey="year"
              lines={[
                { key: 'median_citations_5yr', name: 'Median Citations (5yr)', color: CHART_COLORS[0] },
              ]}
              yLabel="Citations"
              referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
            />
          </ChartContainer>

          <ChartContainer
            id="fig-org-profiles-team-size"
            subtitle="Average team size and total active inventors over time for the selected company."
            title={`${activeCompany} Team Size and Inventor Pool Show R&D Investment Trends From ${companySummary?.firstYear ?? '...'} to ${companySummary?.lastYear ?? '...'}`}
            caption="Average team size (left axis) and total active inventors (right axis) over time. Growing team sizes alongside expanding inventor pools suggest increasing R&D investment."
            insight="Growing team sizes alongside expanding inventor pools suggest increasing R&D investment, while rising team sizes with stable inventor counts indicate deepening specialization."
            loading={prL}
          >
            <PWLineChart
              data={teamInventorData}
              xKey="year"
              lines={[
                { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[1] },
                { key: 'inventor_count', name: 'Inventor Count', color: CHART_COLORS[3], yAxisId: 'right' },
              ]}
              yLabel="Team Size"
              rightYLabel="Number of Inventors"
            />
          </ChartContainer>

          <ChartContainer
            id="fig-org-profiles-cpc-breadth"
            subtitle="Number of distinct CPC subclasses with patent activity each year for the selected company."
            title={`${activeCompany} CPC Subclass Breadth Tracks Diversification Over ${companySummary?.activeYears ?? ''} Active Years`}
            caption="Number of distinct CPC subclasses with patent activity each year. Rising CPC breadth indicates diversification across more technology domains."
            insight="Rising CPC breadth indicates that a company is diversifying its innovation portfolio across more technology domains, while declining breadth suggests increasing specialization."
            loading={prL}
          >
            <PWLineChart
              data={cpcBreadthData}
              xKey="year"
              lines={[
                { key: 'cpc_breadth', name: 'CPC Breadth', color: CHART_COLORS[4] },
              ]}
              yLabel="Distinct Subclasses"
              referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
            />
          </ChartContainer>
        </>
      ) : (
        !prL && <NoDataPlaceholder company={activeCompany} section="patent output" />
      )}

      {/* ════════════════════════════════════════════════════
       *  SECTION 2: TECHNOLOGY PORTFOLIO EVOLUTION
       * ════════════════════════════════════════════════════ */}

      <SectionDivider label="Technology Portfolio Evolution" />

      <Narrative>
        <p>
          Beyond annual CPC distributions, technology portfolio composition can be examined at a
          coarser 5-year period level to reveal longer-term structural shifts in a company&apos;s
          innovation strategy. Substantial changes in composition indicate deliberate reorientation
          of R&amp;D investment toward emerging opportunities.
        </p>
      </Narrative>

      {hasTechEvoData ? (
        <ChartContainer
          id="fig-org-profiles-tech-evolution"
          title={`${activeCompany}: Technology Portfolio Composition Across 8 CPC Sections by 5-Year Period`}
          subtitle="CPC section share of patents by 5-year period for the selected organization, showing technology portfolio evolution"
          caption="CPC technology section shares by 5-year period. The chart illustrates how the selected organization's innovation portfolio has evolved across technology domains."
          insight="Substantial shifts in a firm's technology composition indicate deliberate strategic reorientation of R&D investment."
          loading={tevL || nmL}
          interactive
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
      ) : (
        !tevL && !nmL && <NoDataPlaceholder company={activeCompany} section="technology portfolio evolution" />
      )}

      {/* ════════════════════════════════════════════════════
       *  SECTION 3: INNOVATION QUALITY PROFILES
       * ════════════════════════════════════════════════════ */}

      <SectionDivider label="Innovation Quality Profiles" />

      <Narrative>
        <p>
          Aggregate statistics such as average forward citations conceal the shape of each
          firm&apos;s quality distribution. Fan charts reveal how each firm&apos;s citation distribution
          evolves over time, while blockbuster and dud rates classify the tails of the quality
          distribution.
        </p>
      </Narrative>

      {hasQualityData ? (
        <>
          <ChartContainer
            id="fig-org-profiles-quality-fan"
            title={`${activeCompany}: 5-Year Forward Citation Distribution Over Time`}
            subtitle={`5-year forward citation percentiles (P10-P90) for ${activeCompany} patents by grant year`}
            caption={`5-year forward citation percentiles for ${activeCompany} patents by grant year (1976-2019). Bands show P25-P75 (dark) and P10-P90 (light). Solid line = median; dashed gray = system-wide median.`}
            insight="The width of the fan reveals the dispersion of quality within the firm's portfolio. A widening gap between the median and upper percentiles indicates increasing reliance on a small fraction of high-impact patents."
            loading={fqL}
            height={400}
            wide
            interactive
          >
            <PWFanChart
              data={selectedQualityData}
              yLabel="5-Year Forward Citations"
              showMean
            />
          </ChartContainer>

          <ChartContainer
            id="fig-org-profiles-blockbuster-dud"
            title={`${activeCompany}: Blockbuster Rate (Top 1% Patents) and Dud Rate (Zero Citations) Over Time`}
            subtitle={`Annual share of top-1% blockbuster patents and zero-citation dud patents for ${activeCompany}`}
            caption={`Annual blockbuster rate (patents in top 1% of year x CPC section cohort, blue) and dud rate (zero 5-year forward citations, red) for ${activeCompany}. Dashed line at 1% marks the expected blockbuster rate under uniform quality.`}
            insight="Diverging blockbuster and dud rate trajectories over time reveal shifts in a firm's innovation strategy, distinguishing periods of breakthrough-oriented R&D from phases of incremental or defensive patenting."
            loading={fqL}
            height={300}
            wide
            interactive
          >
            {selectedQualityData.length > 0 ? (
              <PWLineChart
                data={selectedQualityData.map((d) => ({
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
                yFormatter={(v: number) => `${v}%`}
              />
            ) : (
              <div />
            )}
          </ChartContainer>
        </>
      ) : (
        !fqL && <NoDataPlaceholder company={activeCompany} section="innovation quality" />
      )}

      {hasClaimsData ? (
        <ChartContainer
          id="fig-org-profiles-claims-distribution"
          title={`${activeCompany}: Claim Count Distribution by Grant Year`}
          subtitle={`Claim count percentiles (P25-P75) for ${activeCompany} patents by grant year`}
          caption={`Claim count percentiles for ${activeCompany} patents by grant year. Bands show P25-P75 (dark). Dashed gray = system-wide median claims.`}
          loading={fcmL}
          height={350}
          wide
          interactive
        >
          <PWFanChart
            data={selectedClaimsData}
            yLabel="Number of Claims"
            showP10P90={false}
            color={CHART_COLORS[1]}
          />
        </ChartContainer>
      ) : (
        !fcmL && !fqL && <NoDataPlaceholder company={activeCompany} section="claims distribution" />
      )}

      {/* ════════════════════════════════════════════════════
       *  SECTION 4: INNOVATION STRATEGY PROFILES
       * ════════════════════════════════════════════════════ */}

      <SectionDivider label="Innovation Strategy Profile" />

      <Narrative>
        <p>
          Each company pursues a distinctive innovation strategy that can be characterized across
          multiple dimensions. The radar chart below compares <StatCallout value="strategy profiles" /> across
          eight dimensions for top patent filers. Toggle the view between radar and bar formats,
          and select additional companies for comparison.
        </p>
      </Narrative>

      {hasStrategyData ? (
        <>
          {strategyProfiles && (
            <div className="my-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Compare with:</span>
              {strategyCompanyList
                .filter((c) => c !== activeCompany)
                .slice(0, 14)
                .map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setStrategyCompare((prev) =>
                        prev.includes(c)
                          ? prev.filter((x) => x !== c)
                          : prev.length < 3
                            ? [...prev, c]
                            : [...prev.slice(1), c],
                      );
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      effectiveStrategyCompare.includes(c)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {c}
                  </button>
                ))}
            </div>
          )}

          <div className="my-2 flex items-center gap-2 max-w-[960px] mx-auto">
            <span className="text-sm text-muted-foreground">View:</span>
            <button
              onClick={() => setStrategyViewMode('radar')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                strategyViewMode === 'radar'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => setStrategyViewMode('bar')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                strategyViewMode === 'bar'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Bar
            </button>
          </div>

          <ChartContainer
            id="fig-org-profiles-strategy"
            subtitle="Eight-dimensional innovation strategy profiles, with each dimension normalized to a 0-100 scale for comparison."
            title={`${activeCompany} Innovation Strategy Profile Across Eight Dimensions`}
            caption="Eight-dimensional strategy profile comparing selected companies, with all dimensions normalized to a 0-100 scale. Divergent profiles indicate distinct strategic orientations."
            insight="Companies exhibit distinctive strategy profiles. Some emphasize breadth and collaboration (diversified conglomerates), while others optimize for depth and defensiveness (focused technology leaders)."
            loading={spL}
            height={500}
            interactive
            statusText={`Showing ${strategyViewMode} view for ${effectiveStrategyCompare.join(', ') || 'no companies'}`}
          >
            {radarData.length > 0 ? (
              strategyViewMode === 'radar' ? (
                <PWRadarChart
                  data={radarData}
                  companies={effectiveStrategyCompare}
                />
              ) : (
                <PWBarChart
                  data={strategyBarData}
                  xKey="dimension"
                  bars={effectiveStrategyCompare.map((c, i) => ({
                    key: c,
                    name: c,
                    color: CHART_COLORS[i % CHART_COLORS.length],
                  }))}
                  yLabel="Score (0-100)"
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Select companies above to compare
              </div>
            )}
          </ChartContainer>
        </>
      ) : (
        !spL && <NoDataPlaceholder company={activeCompany} section="innovation strategy" />
      )}

      {/* ════════════════════════════════════════════════════
       *  SECTION 5: CORPORATE INNOVATION SPEED
       * ════════════════════════════════════════════════════ */}

      <SectionDivider label="Corporate Innovation Speed" />

      <Narrative>
        <p>
          The time between patent application filing and grant -- the <StatCallout value="grant lag" /> --
          varies substantially across companies and over time. Grant lag reflects differences in technology
          composition, prosecution strategy, and USPTO pendency patterns.
        </p>
      </Narrative>

      {hasSpeedData ? (
        <>
          {speedSummary && (
            <div className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Latest Median Grant Lag</div>
                <div className="mt-1 text-2xl font-bold">{formatCompact(speedSummary.latestMedian)} days</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Fastest (Median)</div>
                <div className="mt-1 text-2xl font-bold">{formatCompact(speedSummary.minMedian)} days <span className="text-sm font-normal text-muted-foreground">({speedSummary.minYear})</span></div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Slowest (Median)</div>
                <div className="mt-1 text-2xl font-bold">{formatCompact(speedSummary.maxMedian)} days <span className="text-sm font-normal text-muted-foreground">({speedSummary.maxYear})</span></div>
              </div>
            </div>
          )}

          <ChartContainer
            id="fig-org-profiles-grant-lag"
            title={`${activeCompany} Grant Lag Spans ${speedSummary ? formatCompact(speedSummary.minMedian) : '...'} to ${speedSummary ? formatCompact(speedSummary.maxMedian) : '...'} Days (Median)`}
            subtitle={`Average and median grant lag in days for ${activeCompany} patents by grant year`}
            caption={`Average and median days from application filing to patent grant for ${activeCompany}. Variations reflect technology composition, prosecution complexity, and USPTO pendency trends.`}
            insight="Grant lag differences reflect technology-specific pendency patterns and prosecution strategy. Companies filing in fast-examining art units (software, business methods) may see shorter lags than those in complex domains (chemistry, biotech)."
            loading={csL}
          >
            <PWLineChart
              data={speedData}
              xKey="year"
              lines={[
                { key: 'median_grant_lag_days', name: 'Median Grant Lag', color: CHART_COLORS[0] },
                { key: 'avg_grant_lag_days', name: 'Average Grant Lag', color: CHART_COLORS[2], dashPattern: '6 3' },
              ]}
              yLabel="Days"
              referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
            />
          </ChartContainer>

          <ChartContainer
            id="fig-org-profiles-annual-patents-speed"
            title={`${activeCompany} Annual Patent Count (Grant Lag Context)`}
            subtitle={`Number of patents granted per year for ${activeCompany}, providing volume context for grant lag trends`}
            caption="Patent count per year provides context for grant lag trends: rising volume with stable lag suggests efficient prosecution."
            insight="Rising patent volume with stable or declining grant lag suggests increasingly efficient prosecution strategy or favorable art unit assignments."
            loading={csL}
          >
            <PWBarChart
              data={speedData}
              xKey="year"
              bars={[{ key: 'patent_count', name: 'Patents', color: CHART_COLORS[4] }]}
              yLabel="Number of Patents"
            />
          </ChartContainer>
        </>
      ) : (
        !csL && <NoDataPlaceholder company={activeCompany} section="innovation speed" />
      )}

      {/* ════════════════════════════════════════════════════
       *  KEY INSIGHT & CLOSING
       * ════════════════════════════════════════════════════ */}

      <KeyInsight>
        <p>
          Company innovation profiles reveal distinct strategic signatures across all five dimensions.
          Some firms, such as Samsung, exhibit rapid portfolio expansion across many technology domains with
          high grant speeds, while others, particularly pharmaceutical companies, maintain deep but narrow
          portfolios with higher citation impact. The relationship between patent volume, citation quality,
          technology breadth, strategic orientation, and prosecution speed provides a nuanced perspective
          on each firm&apos;s approach to R&amp;D investment that cannot be captured by any single metric.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          These company profiles complete ACT 2 of the analysis, which examined organizations as the
          institutional actors in the innovation system. The interactive dashboards reveal that no single
          metric captures the complexity of corporate innovation -- volume, quality, breadth, strategy,
          and speed each contribute to a firm&apos;s strategic fingerprint. ACT 3 now turns from
          organizations to the individual inventors who produce these patents. The{' '}
          <Link href="/chapters/inv-top-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">
            following chapter
          </Link>{' '}
          examines how superstar concentration, prolific inventors, and citation impact patterns shape
          the landscape of individual inventive contributions.
        </p>
      </Narrative>

      <DataNote>
        Company profiles are constructed from PatentsView data for the top patent filers by total utility
        patent count, 1976-2025. Annual patent counts, CPC distributions, median 5-year forward citations,
        average team sizes, inventor counts, and CPC subclass breadth are computed for each year in which the
        company has at least one patent grant. Citation data is limited to patents granted through 2020 to allow
        for 5-year citation accumulation. Strategy profiles normalize 8 innovation dimensions to a 0-100 scale
        across the top 30 assignees. Grant lag measures median days from application filing to patent grant.
        Fan charts show citation percentile distributions (P10, P25, median, P75, P90) for firms with at least
        10 patents per grant year. Blockbuster rate measures the share of patents in the top 1% of their year
        x CPC section cohort. Technology evolution uses CPC section-level classification aggregated by 5-year
        period. Company name mapping links formal legal entity names to short display names.
      </DataNote>

      <RelatedChapters currentChapter={12} />
      <ChapterNavigation currentChapter={12} />
    </div>
  );
}
