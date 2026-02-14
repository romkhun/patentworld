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
import type { CompanyProfile } from '@/lib/types';

const CPC_SECTIONS = Object.keys(CPC_SECTION_NAMES);

export default function CompanyProfiles() {
  /* ── Data hooks ── */
  const { data: profiles, loading: prL } = useChapterData<CompanyProfile[]>('company/company_profiles.json');

  /* ── State ── */
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  /* ── Computations ── */
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

  return (
    <div>
      <ChapterHeader
        number={13}
        title="Company Profiles"
        subtitle="Interactive innovation dashboards for major patent-holding companies"
      />

      <KeyFindings>
        <li>Interactive profiles spanning patent output, technology portfolio, citation impact, team composition, and CPC breadth provide a comprehensive innovation fingerprint for each of the top 100 patent filers.</li>
        <li>Company profiles reveal distinct strategic signatures: some firms exhibit rapid portfolio expansion across many technology domains, while others maintain deep but narrow portfolios.</li>
        <li>The relationship between patent volume, citation impact, and technology breadth provides a nuanced perspective on each firm&apos;s approach to R&amp;D investment.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          This chapter provides interactive company dashboards combining five dimensions of innovation for each of the top 100 patent filers. Annual patent output reveals growth phases and strategic shifts; CPC section distributions track technology portfolio evolution; median forward citations measure research influence; team size and inventor counts indicate R&amp;D investment trends; and CPC subclass breadth tracks diversification over time.
        </p>
      </aside>

      <Narrative>
        <p>
          The <Link href="/chapters/technology-portfolios" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">previous chapter</Link> examined technology portfolio composition and diversification at an aggregate level across leading firms. This chapter provides interactive company-level dashboards that combine five dimensions of innovation into a comprehensive <StatCallout value="strategic fingerprint" /> for each organization.
        </p>
        <p>
          Each dashboard presents patent output, technology portfolio evolution, citation impact, team composition, and breadth of innovation over time. Together, these dimensions reveal how individual firms navigate the innovation landscape -- whether they pursue broad diversification or deep specialization, whether their citation impact is rising or declining, and how their inventor teams are evolving.
        </p>
      </Narrative>

      {/* ── Interactive Company Profiles ── */}

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
        id="fig-company-profiles-annual-output"
        subtitle="Utility patents granted per year for the selected company, showing growth phases and strategic shifts over time."
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
            yLabel="Number of Patents"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-company-profiles-cpc-distribution"
        subtitle="CPC section distribution over time for the selected company, showing how the technology portfolio has evolved."
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
            yLabel="Share (%)"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-company-profiles-citations"
        subtitle="Median 5-year forward citations per patent over time for the selected company, tracking research influence and impact trends."
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
        id="fig-company-profiles-team-size"
        subtitle="Average team size and total active inventors over time for the selected company, indicating R&D investment and specialization trends."
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
              { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[1] },
              { key: 'inventor_count', name: 'Inventor Count', color: CHART_COLORS[3], yAxisId: 'right' },
            ]}
            yLabel="Team Size"
            rightYLabel="Number of Inventors"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-company-profiles-cpc-breadth"
        subtitle="Number of distinct CPC subclasses with patent activity each year for the selected company, measuring portfolio diversification."
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

      {/* ── Closing ── */}

      <Narrative>
        <p>
          These company profiles provide the foundation for understanding individual firm strategies within the broader innovation landscape. The interactive dashboards reveal that no single metric captures the complexity of corporate innovation -- volume, quality, breadth, and team composition each contribute to a firm&apos;s strategic fingerprint. The <Link href="/chapters/inventor-demographics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> turns from organizational profiles to the individual inventors behind these corporate outputs, examining how team structures, career trajectories, and demographic composition shape the direction and quality of innovation.
        </p>
      </Narrative>

      <DataNote>
        Company profiles are constructed from PatentsView data for the top 100 patent filers by
        total utility patent count, 1976-2025. Annual patent counts, CPC distributions, median
        5-year forward citations, average team sizes, inventor counts, and CPC subclass breadth
        are computed for each year in which the company has at least one patent grant. CPC
        distribution uses the primary CPC classification of each patent. Citation data is limited
        to patents granted through 2020 to allow for 5-year citation accumulation. Team size
        reflects the number of named inventors per patent. CPC breadth counts the number of
        distinct CPC subclasses represented in a company&apos;s patent portfolio for each year.
      </DataNote>

      <RelatedChapters currentChapter={13} />
      <ChapterNavigation currentChapter={13} />
    </div>
  );
}
