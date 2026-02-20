'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { GREEN_EVENTS } from '@/lib/referenceEvents';
import { CHART_COLORS, GREEN_CATEGORY_COLORS, COUNTRY_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  GreenVolume, GreenByCategory, GreenByCountry,
  GreenTopCompany, GreenAITrend, GreenAIHeatmap,
  DomainTopAssignee, DomainTopInventor, DomainOrgOverTime, DomainQuality,
  DomainTeamComparison, DomainAssigneeType, DomainStrategy,
  DomainDiffusion,
  DomainEntrantIncumbent, DomainQualityBifurcation,
  GreenEvBatteryCoupling,
  Act6DomainFilingVsGrant,
} from '@/lib/types';

export default function Chapter19() {
  const { data: volume, loading: volL } = useChapterData<GreenVolume[]>('green/green_volume.json');
  const { data: byCategory, loading: catL } = useChapterData<GreenByCategory[]>('green/green_by_category.json');
  const { data: byCountry, loading: ctyL } = useChapterData<GreenByCountry[]>('green/green_by_country.json');
  const { data: topCompanies, loading: coL } = useChapterData<GreenTopCompany[]>('green/green_top_companies.json');
  const { data: aiTrend, loading: aiTL } = useChapterData<GreenAITrend[]>('green/green_ai_trend.json');
  const { data: aiHeatmap, loading: aiHL } = useChapterData<GreenAIHeatmap[]>('green/green_ai_heatmap.json');

  // New harmonized analyses
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('green/green_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('green/green_top_inventors.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('green/green_org_over_time.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('green/green_quality.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('green/green_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('green/green_assignee_type.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('green/green_strategies.json');
  const { data: diffusion, loading: dfL } = useChapterData<DomainDiffusion[]>('green/green_diffusion.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('green/green_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('green/green_quality_bifurcation.json');
  const { data: evBattery, loading: evbL } = useChapterData<GreenEvBatteryCoupling[]>('green/green_ev_battery_coupling.json');
  const { data: filingVsGrant, loading: fgL } = useChapterData<Act6DomainFilingVsGrant[]>('act6/act6_domain_filing_vs_grant.json');

  // Pivot category data for stacked area chart
  const { categoryPivot, categoryAreas } = useMemo(() => {
    if (!byCategory) return { categoryPivot: [], categoryAreas: [] };
    const categories = [...new Set(byCategory.map((d) => d.category))].sort();
    const years = [...new Set(byCategory.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      byCategory
        .filter((d) => d.year === year)
        .forEach((d) => { row[d.category] = d.count; });
      return row;
    });
    const areas = categories.map((cat) => ({
      key: cat,
      name: cat,
      color: GREEN_CATEGORY_COLORS[cat] ?? '#999999',
    }));
    return { categoryPivot: pivoted, categoryAreas: areas };
  }, [byCategory]);

  // Pivot country data for stacked area chart
  const { countryPivot, countryAreas } = useMemo(() => {
    if (!byCountry) return { countryPivot: [], countryAreas: [] };
    const countries = [...new Set(byCountry.map((d) => d.country))];
    const years = [...new Set(byCountry.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      byCountry
        .filter((d) => d.year === year)
        .forEach((d) => { row[d.country] = d.count; });
      return row;
    });
    // Order countries by total volume descending
    const countryTotals = countries.map((c) => ({
      country: c,
      total: byCountry.filter((d) => d.country === c).reduce((s, d) => s + d.count, 0),
    })).sort((a, b) => b.total - a.total);
    const areas = countryTotals.map((c) => ({
      key: c.country,
      name: c.country,
      color: COUNTRY_COLORS[c.country] ?? '#999999',
    }));
    return { countryPivot: pivoted, countryAreas: areas };
  }, [byCountry]);

  // Top companies bar data: deduplicate to unique orgs with total_green, sorted descending
  const companyBarData = useMemo(() => {
    if (!topCompanies) return [];
    const orgMap = new Map<string, { organization: string; total_green: number; label: string }>();
    topCompanies.forEach((d) => {
      if (!orgMap.has(d.organization)) {
        orgMap.set(d.organization, { organization: d.organization, total_green: d.total_green, label: cleanOrgName(d.organization) });
      }
    });
    return [...orgMap.values()].sort((a, b) => b.total_green - a.total_green);
  }, [topCompanies]);

  // Green AI heatmap: pivot into matrix format for bar chart
  const { heatmapData, aiSubfields } = useMemo(() => {
    if (!aiHeatmap) return { heatmapData: [], aiSubfields: [] };
    const subfields = [...new Set(aiHeatmap.map((d) => d.ai_subfield))];
    const greenCats = [...new Set(aiHeatmap.map((d) => d.green_category))];
    // Sort green categories by total count
    const catTotals = greenCats.map((cat) => ({
      cat,
      total: aiHeatmap.filter((d) => d.green_category === cat).reduce((s, d) => s + d.count, 0),
    })).sort((a, b) => b.total - a.total);
    const data = catTotals.map(({ cat }) => {
      const row: Record<string, unknown> = { category: cat };
      aiHeatmap.filter((d) => d.green_category === cat).forEach((d) => {
        row[d.ai_subfield] = d.count;
      });
      return row;
    });
    return { heatmapData: data, aiSubfields: subfields };
  }, [aiHeatmap]);

  // Inventor bar data
  const inventorData = useMemo(() => {
    if (!topInventors) return [];
    return topInventors.slice(0, 25).map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`,
    }));
  }, [topInventors]);

  // Org rank data
  const orgRankData = useMemo(() => {
    if (!orgOverTime) return [];
    const filtered = orgOverTime.filter((d) => d.year >= 2000);
    const years = [...new Set(filtered.map((d) => d.year))];
    const ranked: { year: number; organization: string; count: number; rank: number }[] = [];
    years.forEach((year) => {
      const yearData = filtered.filter((d) => d.year === year).sort((a, b) => b.count - a.count);
      yearData.forEach((d, i) => {
        ranked.push({ year: d.year, organization: cleanOrgName(d.organization), count: d.count, rank: i + 1 });
      });
    });
    return ranked;
  }, [orgOverTime]);

  // Strategy table
  const strategyOrgs = useMemo(() => {
    if (!strategies) return [];
    const orgMap = new Map<string, { organization: string; total: number; subfields: { subfield: string; count: number }[] }>();
    strategies.forEach((d) => {
      const existing = orgMap.get(d.organization);
      if (existing) {
        existing.total += d.patent_count;
        existing.subfields.push({ subfield: d.subfield, count: d.patent_count });
      } else {
        orgMap.set(d.organization, { organization: d.organization, total: d.patent_count, subfields: [{ subfield: d.subfield, count: d.patent_count }] });
      }
    });
    return [...orgMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 15)
      .map((o) => ({ ...o, subfields: o.subfields.sort((a, b) => b.count - a.count).slice(0, 3) }));
  }, [strategies]);

  // Diffusion pivot
  const { diffusionPivot, diffusionSections } = useMemo(() => {
    if (!diffusion) return { diffusionPivot: [], diffusionSections: [] as string[] };
    const sections = [...new Set(diffusion.map((d) => d.section))].sort();
    const years = [...new Set(diffusion.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      diffusion.filter((d) => d.year === year).forEach((d) => { row[d.section] = d.pct_of_domain; });
      return row;
    });
    return { diffusionPivot: pivoted, diffusionSections: sections };
  }, [diffusion]);

  // Team comparison pivot
  const teamComparisonPivot = useMemo(() => {
    if (!teamComparison) return [];
    const years = [...new Set(teamComparison.map((d) => d.year))].sort();
    return years.map((year) => {
      const row: Record<string, unknown> = { year };
      teamComparison.filter((d) => d.year === year).forEach((d) => { row[d.category] = d.avg_team_size; });
      return row;
    });
  }, [teamComparison]);

  // Assignee type pivot
  const { assigneeTypePivot, assigneeTypeNames } = useMemo(() => {
    if (!assigneeType) return { assigneeTypePivot: [], assigneeTypeNames: [] as string[] };
    const names = [...new Set(assigneeType.map((d) => d.assignee_category))].sort();
    const years = [...new Set(assigneeType.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      assigneeType.filter((d) => d.year === year).forEach((d) => { row[d.assignee_category] = d.count; });
      return row;
    });
    return { assigneeTypePivot: pivoted, assigneeTypeNames: names };
  }, [assigneeType]);

  // Pivot entrant/incumbent data
  const eiPivot = useMemo(() => {
    if (!entrantIncumbent) return [];
    return entrantIncumbent.map((d) => ({ year: d.year, Entrant: d.entrant_count, Incumbent: d.incumbent_count }));
  }, [entrantIncumbent]);

  // ── Analytical Deep Dive computations ──────────────────────────────
  const cr4Data = useMemo(() => {
    if (!orgOverTime || !volume) return [];
    const pyMap = Object.fromEntries(volume.map(d => [d.year, d.green_count]));
    const years = [...new Set(orgOverTime.map(d => d.year))].sort();
    return years.map(year => {
      const yearOrgs = orgOverTime.filter(d => d.year === year).sort((a, b) => b.count - a.count);
      const top4 = yearOrgs.slice(0, 4).reduce((s, d) => s + d.count, 0);
      const total = pyMap[year] || 1;
      return { year, cr4: +(top4 / total * 100).toFixed(1) };
    }).filter(d => d.cr4 > 0);
  }, [orgOverTime, volume]);

  const entropyData = useMemo(() => {
    if (!byCategory) return [];
    const years = [...new Set(byCategory.map(d => d.year))].sort();
    return years.map(year => {
      const yearData = byCategory.filter(d => d.year === year && d.count > 0);
      const total = yearData.reduce((s, d) => s + d.count, 0);
      const N = yearData.length;
      if (total === 0 || N <= 1) return { year, entropy: 0 };
      const H = -yearData.reduce((s, d) => {
        const p = d.count / total;
        return s + p * Math.log(p);
      }, 0);
      return { year, entropy: +(H / Math.log(N)).toFixed(3) };
    }).filter(d => d.entropy > 0);
  }, [byCategory]);

  const velocityData = useMemo(() => {
    if (!topAssignees) return [];
    const cohorts: Record<string, { count: number; totalPat: number; totalSpan: number }> = {};
    topAssignees.forEach(d => {
      const decStart = Math.floor(d.first_year / 10) * 10;
      const label = `${decStart}s`;
      if (!(label in cohorts)) cohorts[label] = { count: 0, totalPat: 0, totalSpan: 0 };
      cohorts[label].count++;
      cohorts[label].totalPat += d.domain_patents;
      cohorts[label].totalSpan += Math.max(1, d.last_year - d.first_year + 1);
    });
    return Object.entries(cohorts)
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([, d]) => d.count >= 3)
      .map(([decade, d]) => ({
        decade,
        velocity: +(d.totalPat / d.totalSpan).toFixed(1),
        count: d.count,
      }));
  }, [topAssignees]);

  // Summary stats
  const peakYear = volume ? volume.reduce((best, d) => d.green_count > best.green_count ? d : best, volume[0]) : null;
  const totalGreen = volume ? volume.reduce((s, d) => s + d.green_count, 0) : 0;

  const filingGrantPivot = useMemo(() => {
    if (!filingVsGrant) return [];
    const filing = filingVsGrant.filter((d) => d.domain === 'Green' && d.series === 'filing_year');
    const grant = filingVsGrant.filter((d) => d.domain === 'Green' && d.series === 'grant_year');
    const filingMap = Object.fromEntries(filing.map((d) => [d.year, d.count]));
    const grantMap = Object.fromEntries(grant.map((d) => [d.year, d.count]));
    const years = [...new Set([...filing.map((d) => d.year), ...grant.map((d) => d.year)])].sort();
    return years.map((year) => ({ year, filings: filingMap[year] ?? 0, grants: grantMap[year] ?? 0 }));
  }, [filingVsGrant]);

  return (
    <div>
      <ChapterHeader
        number={31}
        title="Green Innovation"
        subtitle="Climate technology patents from niche to mainstream"
      />
      <MeasurementSidebar slug="green-innovation" />

      <KeyFindings>
        <li>
          <GlossaryTooltip term="green patents">Green patents</GlossaryTooltip> — those classified under <GlossaryTooltip term="Y02">Y02/Y04S</GlossaryTooltip> codes — total {totalGreen > 0 ? formatCompact(totalGreen) : '457K'} over 50 years, peaking at {peakYear ? formatCompact(peakYear.green_count) : '35,693'} in {peakYear?.year ?? '2019'}.
        </li>
        <li>Batteries and storage, transportation and electric vehicles, and renewable energy have exhibited continued growth in patent filings since the 2015 Paris Agreement, with batteries/storage reaching 7,363 patents and transportation/EVs reaching 5,818 patents by 2024.</li>
        <li>Japan has historically been the second-largest green patent filer, led by Toyota (12,636 total patents) and Honda (5,807); South Korea&apos;s annual green patent count grew from 174 in 2005 to 2,989 by 2024, reaching 67% of Japan&apos;s 2024 count (4,455).</li>
        <li>Patents at the intersection of green technology and AI grew from 41 in 2010 to 1,238 in 2023 (a 30-fold increase), with the most rapid growth occurring after 2015.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Climate technology has undergone a structural transformation within the patent system, evolving from a peripheral category of activity into nearly one of every ten utility patents granted annually. The internal composition of green patenting has shifted decisively: whereas renewable energy generation led the early expansion, the electrification of transportation and advances in battery chemistry have become the primary engines of growth -- a shift that aligns with the policy acceleration observed after the 2015 Paris Agreement and the broader <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent Fields</Link> reshaping patenting activity. The organizational landscape reveals a notable convergence between East Asian electronics conglomerates and Western industrial incumbents, each leveraging distinct strengths in energy systems, materials science, and vehicle engineering. Of particular significance, the emerging intersection of artificial intelligence with climate technology, documented in the preceding chapter on <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">AI patents</Link>, points toward a new frontier in which computational methods amplify the pace of clean energy innovation.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/digital-health" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">digital health</Link> and the convergence of medical devices with health informatics, this chapter turns to green innovation, a domain that spans the broadest range of technology areas in ACT 6 and whose growth trajectory is increasingly intertwined with AI-driven optimization.
        </p>
        <p>
          Climate change constitutes one of the defining challenges of the 21st century, and the
          patent system provides a valuable lens through which to observe the technological
          response. This chapter traces the growth of green innovation through patents classified
          under the CPC&apos;s <GlossaryTooltip term="Y02">Y02</GlossaryTooltip> and Y04S codes, encompassing solar panels, wind turbines,
          electric vehicles, carbon capture, and smart grids.
        </p>
      </Narrative>

      {/* ── Section 1: Green Patent Volume ─────────────────────────────────── */}
      <SectionDivider label="Green Patent Volume Over 50 Years" />

      <Narrative>
        <p>
          Green patent filings increased from 3,000 per year in the late 1970s to
          30,000 per year by the early 2020s (peaking at 35,693 in 2019). Patent filings
          continued to grow following the 2015 Paris Agreement, with batteries and electric vehicles
          exhibiting particularly strong growth. Green patents represented 9-10% of
          all utility patents granted annually during 2015-2024.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-innovation-volume"
        subtitle="Annual count and share of utility patents with at least one Y02/Y04S CPC code, tracking the growth of climate technology patenting."
        title={`Green Patent Volume Rose to ${peakYear ? formatCompact(peakYear.green_count) : '35,693'} by ${peakYear?.year ?? '2019'}, Reaching ${peakYear?.green_pct?.toFixed(1) ?? '9.6'}% of All Utility Patents`}
        caption={`Annual count of utility patents with at least one Y02/Y04S CPC code, 1976–2025. The most prominent pattern is the sustained upward trajectory, with green patents peaking at ${peakYear ? formatCompact(peakYear.green_count) : '35,693'} in ${peakYear?.year ?? '2019'}, representing ${peakYear?.green_pct?.toFixed(1) ?? '9.6'}% of all utility patents. Grant year shown. Application dates are typically 2–3 years earlier.`}
        insight="Green patenting has evolved from a specialized activity to nearly one in ten US patents, reflecting substantial corporate and government investment in climate technology. The growth trajectory mirrors, and in certain periods exceeds, the broader expansion of the patent system."
        loading={volL}
      >
        <PWLineChart
          data={volume ?? []}
          xKey="year"
          lines={[
            { key: 'green_count', name: 'Green Patents', color: CHART_COLORS[1] },
            { key: 'green_pct', name: 'Green Share (%)', color: CHART_COLORS[3], yAxisId: 'right' },
          ]}
          yLabel="Number of Patents"
          rightYLabel="Share (%)"
          rightYFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      {/* ── Section 2: Technology Breakdown ────────────────────────────────── */}
      <SectionDivider label="Green Technology Breakdown" />

      <Narrative>
        <p>
          Green technologies have not followed a uniform growth trajectory. Renewable energy
          generation (solar and wind) led the early expansion, but batteries/storage and
          transportation (particularly electric vehicles) have grown to become the largest categories
          in recent years, with batteries/storage reaching 7,363 patents and transportation/EVs
          reaching 5,818 patents in 2024, compared to 3,453 renewable energy patents. Carbon capture
          remains a smaller category at 374 patents in 2024.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-innovation-by-category"
        subtitle="Annual patent counts by green technology sub-category (renewable energy, batteries, EVs, carbon capture, and related categories) based on Y02/Y04S sub-codes."
        title="Battery, Storage, and EV Patents Surpassed Renewable Energy After 2010, Reaching 7,363 and 5,818 versus 3,453 by 2024"
        caption="Annual patent counts by green technology sub-category (Y02/Y04S CPC sub-codes), 1976–2025. Battery/storage and transportation patents overtook renewable energy generation as the leading sub-categories during the 2010s, with battery/storage reaching 7,363 patents and transportation/EVs reaching 5,818 patents by 2024, compared to 3,453 renewable energy patents."
        insight="The green patent portfolio has diversified substantially. While renewable energy generation dominated through the 2000s, the 2010s exhibited considerable growth in battery/storage and electric vehicle patents, coinciding with the electrification of transportation and declining battery costs."
        loading={catL}
        height={550}
        wide
      >
        <PWAreaChart
          data={categoryPivot}
          xKey="year"
          areas={categoryAreas}
          stacked
          yLabel="Number of Patents"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of green innovation has shifted substantially over time. Renewable energy
          patents, led by solar and wind technologies, dominated through the 2000s. Since 2010, however,
          batteries/storage and transportation/EVs have grown substantially, with batteries/storage
          reaching 7,363 patents and transportation/EVs reaching 5,818 patents by 2024, surpassing
          renewable energy&apos;s 3,453 patents. This growth coincided with declining battery costs,
          automaker electrification strategies, and supportive policies such as the Inflation Reduction Act.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-green-ev-battery"
        title="EV-Battery Co-Classification Lift Reveals Increasing Technology Integration"
        subtitle="Lift of co-occurrence between EV (B60L/B60W) and battery (H01M/H02J) CPC codes among green patents."
        caption="Lift above 1.0 means EV and battery patents co-occur more often than random chance on the same green patent. Rising lift indicates tighter technological coupling between electric vehicle drivetrains and energy storage systems."
        loading={evbL}
      >
        <PWLineChart
          data={evBattery ?? []}
          xKey="year"
          lines={[{ key: 'lift', name: 'EV-Battery Lift', color: CHART_COLORS[2] }]}
          yLabel="Lift"
        />
      </ChartContainer>

      {/* ── Section 3: Who Leads the Green Race ───────────────────────────── */}
      <SectionDivider label="Leading Organizations in Green Patenting" />

      <Narrative>
        <p>
          Japan has historically been the second-largest green patent filer, led by Toyota (12,636 total
          patents) and Honda (5,807) in automotive technologies and Mitsubishi Electric and Toshiba in
          energy systems. South Korea&apos;s annual green patent count grew from 174 in 2005 to 2,989 by 2024
          (reaching 67% of Japan&apos;s 2024 count of 4,455), driven by Samsung (13,771 total patents), LG,
          and Hyundai (4,888). US firms such as General Electric (10,812) and Ford (7,383) have maintained
          strong positions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-innovation-by-country"
        subtitle="Annual green patent counts by primary assignee country, showing the shifting competitive landscape of climate technology innovation."
        title="South Korea's Green Patents Grew From 174 in 2005 to 2,989 by 2024, Reaching 67% of Japan's Annual Count"
        caption="Annual green patent counts by primary assignee country/region, 1976–2025. South Korea's annual count grew from 174 in 2005 to 2,989 by 2024, reaching 67% of Japan's 2024 count (4,455), driven by Samsung, LG, and Hyundai."
        insight="Japan's early lead in green patenting reflects its substantial early investment in hybrid vehicles and energy efficiency. South Korea's growth from 174 annual patents in 2005 to 2,989 in 2024 coincides with the rise of Samsung (13,771 total patents), LG, and Hyundai (4,888) in battery and electric vehicle technologies."
        loading={ctyL}
        height={500}
        wide
      >
        <PWAreaChart
          data={countryPivot}
          xKey="year"
          areas={countryAreas}
          stacked
          yLabel="Number of Patents"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-green-innovation-top-companies"
        subtitle="Organizations ranked by total green patent count (Y02/Y04S classifications) from 1976 to 2025, dominated by automotive and electronics firms."
        title="Samsung (13,771), Toyota (12,636), and GE (10,812) Lead the Top 20 Green Patent Holders"
        caption="Organizations ranked by total green patent count (Y02/Y04S classifications), 1976-2025. The data indicate that automotive firms and electronics conglomerates account for the majority of the top 20 positions, with Samsung, Toyota, and General Electric each exceeding 10,000 green patents."
        insight="The leading green patent holders are predominantly automotive and electronics conglomerates -- organizations with substantial R&D budgets and the engineering capabilities to address energy, transportation, and industrial decarbonization at scale."
        loading={coL}
        height={700}
      >
        <PWBarChart
          data={companyBarData}
          xKey="label"
          bars={[{ key: 'total_green', name: 'Green Patents', color: CHART_COLORS[1] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Samsung, Toyota, and General Electric each lead in green patent volume with over
          10,000 patents. The prominence of automotive companies (Toyota, GM, Ford, Honda,
          Hyundai, Nissan, Bosch) reflects the centrality of vehicle electrification to the
          clean energy transition. Electronics and industrial conglomerates (Samsung, GE,
          Hitachi, Siemens, Toshiba) contribute expertise in power systems, batteries, and
          smart grid infrastructure.
        </p>
      </KeyInsight>

      {/* ── Organization Rankings Over Time ────────────────────────────────── */}
      <SectionDivider label="Organization Rankings Over Time" />

      <Narrative>
        <p>
          The competitive landscape of green patenting has shifted substantially over the past two decades.
          Traditional energy firms and early-moving automakers established initial leadership positions, but
          electronics conglomerates and newer entrants have risen rapidly, reflecting the broadening of green
          innovation beyond energy generation into batteries, vehicles, and digital infrastructure.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-org-rankings"
        subtitle="Annual patent rank of leading green technology organizations from 2000 to 2025, showing competitive dynamics."
        title="Green Patent Leadership Has Shifted as Electronics Firms Entered the Top Ranks Alongside Traditional Auto and Energy Companies"
        caption="Annual patent rank of leading organizations in green technology, 2000-2025. The heatmap reveals how Samsung, LG, and Hyundai rose to challenge the longstanding dominance of Japanese and US-based incumbents."
        insight="The entry of Korean electronics conglomerates into the top ranks of green patenting after 2010 reflects the strategic importance of battery technology and electric vehicles in reshaping the competitive landscape."
        loading={ootL}
        height={500}
        wide
      >
        <PWRankHeatmap
          data={orgRankData}
          nameKey="organization"
          yearKey="year"
          rankKey="rank"
          maxRank={15}
          yearInterval={2}
        />
      </ChartContainer>

      {/* ── Top Inventors ──────────────────────────────────────────────────── */}
      <SectionDivider label="Top Green Patent Inventors" />

      <Narrative>
        <p>
          Individual inventors in the green technology space reflect the breadth of the field, spanning
          automotive engineers, battery chemists, power electronics specialists, and solar cell researchers.
          The most prolific inventors tend to be associated with major corporate R&amp;D laboratories.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-top-inventors"
        subtitle="Most prolific individual inventors in green technology patents, ranked by total patent count."
        title="Top Green Patent Inventors Span Automotive, Battery, and Energy Systems Engineering"
        caption="Inventors ranked by total green patent count (Y02/Y04S classifications), 1976-2025. The leading inventors are predominantly associated with major automotive and electronics firms."
        loading={tiL}
        height={600}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Green Patents', color: CHART_COLORS[1] }]}
          layout="vertical"
        />
      </ChartContainer>

      {/* ── Quality Indicators ─────────────────────────────────────────────── */}
      <SectionDivider label="Green Patent Quality Indicators" />

      <Narrative>
        <p>
          Quality metrics for green patents provide insight into the depth and breadth of climate
          technology innovation. Average claims counts, backward citations, and technology scope
          indicate whether green patents are becoming more complex and better integrated with prior art.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-quality"
        subtitle="Average claims, backward citations, and CPC scope for green patents over time."
        title="Green Patents Show Increasing Complexity as Measured by Claims and Technology Scope"
        caption="Quality indicators for green patents over time, 1976-2025. Rising average claims and scope suggest that green innovations are becoming more complex and spanning multiple technology areas."
        loading={qL}
      >
        <PWLineChart
          data={quality ?? []}
          xKey="year"
          lines={[
            { key: 'avg_claims', name: 'Average Claims', color: CHART_COLORS[0] },
            { key: 'avg_backward_cites', name: 'Average Backward Citations', color: CHART_COLORS[2] },
            { key: 'avg_scope', name: 'Average Scope (CPC Subclasses)', color: CHART_COLORS[4] },
          ]}
          yLabel="Average Value"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      {/* ── Team Size Comparison ───────────────────────────────────────────── */}
      <SectionDivider label="Team Size: Green versus Non-Green Patents" />

      <ChartContainer
        id="fig-green-team-comparison"
        subtitle="Average team size for green versus non-green patents over time, measuring the collaborative intensity of climate technology R&D."
        title="Green Patent Teams Have Grown Larger Than Non-Green Counterparts"
        caption="Average number of inventors per patent for green and non-green patents, 1990-2025. Green patents consistently involve larger inventor teams, reflecting the interdisciplinary nature of climate technology."
        insight="The consistently larger team sizes for green patents suggest that climate technology innovation draws on multiple disciplines -- materials science, electrical engineering, chemistry, and software -- requiring collaborative approaches."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Green', name: 'Green Patents', color: CHART_COLORS[1] },
            { key: 'Non-Green', name: 'Non-Green Patents', color: CHART_COLORS[5] },
          ]}
          yLabel="Average Team Size"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      {/* ── Assignee Type Distribution ─────────────────────────────────────── */}
      <SectionDivider label="Assignee Type Distribution" />

      <ChartContainer
        id="fig-green-assignee-type"
        subtitle="Distribution of green patents by assignee type over time, showing the balance between corporate, government, university, and individual innovators."
        title="Corporate Assignees Dominate Green Patenting, but University Contributions Are Growing"
        caption="Annual green patent counts by assignee type, 1990-2025. Corporate assignees account for the vast majority of green patents, but university and government contributions have increased in absolute terms."
        loading={atL}
        height={500}
        wide
      >
        <PWAreaChart
          data={assigneeTypePivot}
          xKey="year"
          areas={assigneeTypeNames.map((name, i) => ({
            key: name,
            name,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      {/* ── Strategy Table ─────────────────────────────────────────────────── */}
      {strategyOrgs.length > 0 && (
        <>
          <SectionDivider label="Green Patenting Strategies" />

          <Narrative>
            <p>
              Leading green patent holders pursue distinct technology strategies. Some focus heavily on a
              single sub-category (such as Toyota on transportation/EVs), while others maintain broader
              portfolios spanning renewable energy, batteries, and industrial production.
            </p>
          </Narrative>

          <div className="my-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Organization</th>
                  <th className="text-right py-2 px-3 font-semibold">Total Patents</th>
                  <th className="text-left py-2 px-3 font-semibold">Top Sub-Categories</th>
                </tr>
              </thead>
              <tbody>
                {strategyOrgs.map((org, i) => (
                  <tr key={i} className="border-b border-muted/50 hover:bg-muted/20">
                    <td className="py-2 px-3 font-medium">{cleanOrgName(org.organization)}</td>
                    <td className="py-2 px-3 text-right">{org.total.toLocaleString()}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {org.subfields.map((s) => `${s.subfield} (${s.count.toLocaleString()})`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Cross-Domain Diffusion ─────────────────────────────────────────── */}
      <SectionDivider label="Cross-Domain Diffusion of Green Technology" />

      <Narrative>
        <p>
          Green patents are by nature cross-cutting -- Y02/Y04S codes are applied alongside primary
          CPC codes from other technology sections. Tracking co-classification patterns reveals how
          green innovation diffuses across electricity, chemistry, mechanical engineering, and physics.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-diffusion"
        subtitle="Percentage of green patents co-classified with other CPC sections, measuring the diffusion of climate technology across technology domains."
        title="Green Patents Show Deepening Integration with Electricity and Chemistry Domains"
        caption="Percentage of green patents co-classified with each non-Y CPC section, 1990-2025. The high co-occurrence with Electricity (H) and Chemistry/Metallurgy (C) reflects the central role of energy conversion and materials science in climate technology."
        insight="Green patents are deeply embedded in electrical engineering and chemistry, reflecting the fundamental nature of climate technology as an applied fusion of these disciplines rather than a standalone technology domain."
        loading={dfL}
        wide
      >
        <PWLineChart
          data={diffusionPivot}
          xKey="year"
          lines={diffusionSections.map((section) => ({
            key: section,
            name: CPC_SECTION_NAMES[section] ?? section,
            color: CPC_SECTION_COLORS[section] ?? '#999999',
          }))}
          yLabel="% of Green Patents"
          yFormatter={(v) => `${Number(v).toFixed(0)}%`}
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      {/* ── Section 4: Green AI ───────────────────────────────────────────── */}
      <SectionDivider label="Green AI — Where Climate Meets Artificial Intelligence" />

      <Narrative>
        <p>
          AI is increasingly applied to climate-related challenges, particularly in energy grid
          optimization, industrial process control, and transportation logistics. Patents
          classified under both green (Y02/Y04S) and AI-related CPC codes represent a growing
          intersection of two consequential technology domains.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-green-innovation-ai-trend"
        subtitle="Annual count of patents co-classified under both green (Y02/Y04S) and AI-related CPC codes, tracking the intersection of climate and AI technologies."
        title="Green-AI Patents Grew 30-Fold From 41 in 2010 to 1,238 in 2023"
        caption="Annual count of patents classified under both Y02/Y04S (green) and AI-related CPC codes (G06N, G06F18, G06V, G10L15, G06F40), 1976–2025. Green-AI patents grew from 41 in 2010 to 1,238 in 2023 (a 30-fold increase), with the most prominent growth beginning around 2015, coinciding with advances in machine learning and neural network methods."
        insight="Green-AI patents grew from 41 in 2010 to 1,238 in 2023, coinciding with the application of machine learning and neural network methods to energy optimization, materials discovery, climate modeling, and autonomous vehicle navigation."
        loading={aiTL}
      >
        <PWLineChart
          data={aiTrend ?? []}
          xKey="year"
          lines={[
            { key: 'green_ai_count', name: 'Green AI Patents', color: CHART_COLORS[1] },
          ]}
          yLabel="Number of Patents"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-green-innovation-ai-heatmap"
        subtitle="Patent counts at the intersection of green sub-categories and AI subfields, showing which climate domains most intensively adopt AI techniques."
        title="Industrial Production (3,114) and Smart Grids (2,245) Exhibit the Highest AI Adoption Among Green Sub-Categories"
        caption="Patent counts at the intersection of green sub-categories and AI subfields; only combinations with more than 5 patents are shown. The data indicate that industrial production and smart grids represent the green categories most intensively adopting AI, with machine learning and neural networks as the dominant techniques."
        insight="Industrial production and smart grids constitute the green categories most intensively adopting AI, with machine learning and neural networks as the predominant AI techniques. Computer vision appears to play a growing role in quality control for renewable energy manufacturing."
        loading={aiHL}
        height={450}
      >
        <PWBarChart
          data={heatmapData}
          xKey="category"
          bars={aiSubfields.map((sf, i) => ({
            key: sf,
            name: sf,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          stacked
          layout="vertical"
          yLabel="Number of Patents"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The convergence of AI and green technology has expanded substantially, with green-AI patents
          growing from 41 in 2010 to 1,238 in 2023 (a 30-fold increase). Machine learning techniques
          are being applied to optimize renewable energy generation, improve battery chemistry through
          materials informatics, enhance smart grid efficiency, and develop autonomous electric vehicles.
          The growth trajectory suggests this intersection may continue to expand as AI capabilities
          advance and climate policy imperatives intensify.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-green-entrant-incumbent"
        title="Green Innovation Shows Broad-Based Growth With Strong Entrant Contributions"
        subtitle="Annual patent counts decomposed by entrants (first patent in domain that year) versus incumbents."
        caption="Entrants are assignees filing their first green patent in a given year. Incumbents had at least one prior-year patent. Grant year shown."
        loading={eiL}
      >
        <PWAreaChart
          data={eiPivot}
          xKey="year"
          areas={[
            { key: 'Incumbent', name: 'Incumbent', color: CHART_COLORS[0] },
            { key: 'Entrant', name: 'Entrant', color: CHART_COLORS[4] },
          ]}
          stacked
          yLabel="Patents"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-green-quality-bifurcation"
        title="Green Innovation Top-Decile Citation Share Has Declined Modestly as Volume Expanded"
        subtitle="Share of domain patents in the top decile of system-wide forward citations by grant year × CPC section."
        caption="Top decile computed relative to all utility patents in the same grant year and primary CPC section. Rising share indicates domain quality outpacing the system; falling share indicates dilution."
        loading={qbL}
      >
        <PWLineChart
          data={qualityBif ?? []}
          xKey="period"
          lines={[{ key: 'top_decile_share', name: 'Top-Decile Share (%)', color: CHART_COLORS[2] }]}
          yLabel="% in Top Decile"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-green-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in green patenting."
        title="Top-4 Concentration in Green Patents Peaked at 10.7% in 2011 Before Declining to 5.7% by 2025"
        caption="CR4 computed as the sum of the top 4 organizations' annual green patent counts divided by total green patents. The low peak concentration of 10.7% reflects the broad competitive landscape spanning automotive, energy, electronics, and chemical firms."
        insight="Green innovation exhibits among the lowest organizational concentration of any ACT 6 domain, consistent with its status as a policy-driven technology area where government incentives and regulatory mandates encourage broad participation rather than concentration."
        loading={ootL || volL}
      >
        <PWLineChart
          data={cr4Data}
          xKey="year"
          lines={[{ key: 'cr4', name: 'Top-4 Share (%)', color: CHART_COLORS[0] }]}
          yLabel="CR4 (%)"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-green-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across green technology subfields."
        title="Green Innovation Subfield Diversity Has Remained Stable at 0.86-0.90 Throughout Its 50-Year History"
        caption="Normalized Shannon entropy (H/ln(N)) ranges from 0 (all activity in one subfield) to 1 (perfectly even distribution). The high and stable entropy (ranging from 0.86 to 0.90) indicates that green innovation has always been distributed across battery, solar, wind, EV, and energy efficiency subfields without significant concentration shifts."
        insight="The stability of green subfield diversity contrasts with domains like AI and biotechnology, which diversified substantially from narrow bases. Green innovation appears to have emerged as an inherently multi-technology domain from its inception."
        loading={catL}
      >
        <PWLineChart
          data={entropyData}
          xKey="year"
          lines={[{ key: 'entropy', name: 'Diversity Index', color: CHART_COLORS[2] }]}
          yLabel="Normalized Entropy"
          yDomain={[0, 1]}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-green-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a green patent."
        title="Green Innovation Shows Rising Velocity Across Cohorts: 2000s Entrants Average 122 Patents per Year Versus 68 for 1970s Entrants"
        caption="Mean patents per active year for top green organizations grouped by entry decade. Only cohorts with three or more organizations are shown. The 2010s cohort (1 organization) and 2020s cohort (2 organizations) do not meet the minimum threshold and are excluded. Among qualifying cohorts, the velocity increase from the 1970s to 2000s reflects the acceleration of climate technology patenting driven by government subsidies, ESG mandates, and the Paris Agreement."
        insight="The velocity increase from the 1970s to 2000s cohort is consistent with green innovation becoming substantially more accessible to productive patenting, though the small sample sizes for the 2010s (1 organization) and 2020s (2 organizations) cohorts prevent reliable velocity estimates for the most recent entrants."
        loading={taL}
      >
        <PWBarChart
          data={velocityData}
          xKey="decade"
          bars={[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]}
          yLabel="Mean Patents / Year"
        />
      </ChartContainer>

      <Narrative>
        This chapter concludes PatentWorld&apos;s examination of 50 years of US patent innovation. From the <Link href="/chapters/system-patent-count" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">broad contours of the innovation landscape</Link> to the specific domains of AI and green technology, the preceding chapters have traced how the patent system has evolved in structure, geography, and character. The convergence of artificial intelligence and climate technology examined here represents a significant frontier of contemporary innovation -- a domain where the patterns documented throughout this book come together in the service of addressing global challenges.
        Across the twelve technology domains examined in ACT 6 -- from <Link href="/chapters/semiconductors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">semiconductors</Link> and <Link href="/chapters/quantum-computing" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">quantum computing</Link> through <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link> and green innovation -- several cross-cutting themes emerge: the concentration of patent activity among a small number of resource-intensive firms, the accelerating convergence of formerly distinct technology fields, and the growing role of international competition in shaping domestic innovation trajectories. These domain-level patterns reinforce and extend the structural insights developed in the preceding acts, confirming that the US patent system is simultaneously becoming more specialized in its technical content and more interconnected in its organizational and geographic character.
      </Narrative>

      <ChartContainer
        id="fig-green-filing-vs-grant"
        title="Green Innovation Filings and Grants Both Peaked Near 2019 at 34,133 and 35,693 Respectively"
        subtitle="Annual patent filings versus grants for green innovation, showing the tightest filing-grant alignment among large ACT 6 domains."
        caption="Green innovation is unique among large ACT 6 domains in showing near-simultaneous filing and grant peaks. This alignment likely reflects the maturity of green technology patent examination at the USPTO, combined with the steady policy-driven demand for climate technology IP."
        loading={fgL}
      >
        <PWLineChart
          data={filingGrantPivot}
          xKey="year"
          lines={[
            { key: 'filings', name: 'Filings', color: CHART_COLORS[0] },
            { key: 'grants', name: 'Grants', color: CHART_COLORS[3] },
          ]}
          yLabel="Number of Patents"
        />
      </ChartContainer>

      <InsightRecap
        learned={["Green patents show a 1.8-fold velocity increase from 1970s entrants (68 patents per year) to 2000s entrants (122 patents per year), reflecting accelerating clean technology innovation.", "Battery and EV patents reached 7,363 and 5,818 grants respectively by 2024, surpassing renewable energy at 3,453."]}
        falsifiable="If green patent growth is driven by policy incentives (IRA, EU Green Deal) rather than technology push, then patent filings should show discontinuous increases following major policy announcements."
        nextAnalysis={{ label: "Quantum Computing", description: "From theoretical foundations to practical hardware — the most concentrated technology domain", href: "/chapters/quantum-computing" }}
      />

      <DataNote>
        <p>
          <GlossaryTooltip term="green patents">Green patents</GlossaryTooltip> are identified using
          CPC classifications Y02 (climate change mitigation technologies) and Y04S (smart grids).
          Sub-categories are mapped from Y02 sub-codes: Y02E10 → Renewable Energy, Y02E60 → Batteries &amp; Storage,
          Y02T → Transportation/EVs, Y02C → Carbon Capture, Y02P → Industrial Production, Y02B → Buildings,
          Y02W → Waste Management, Y04S → Smart Grids. AI patents use the same identification methodology
          as the Artificial Intelligence chapter (G06N, G06F18, G06V, G10L15, G06F40). Country attribution is based on the
          primary assignee&apos;s location. Source: PatentsView / USPTO.
        </p>
      </DataNote>

      <RelatedChapters currentChapter={31} />
      <ChapterNavigation currentChapter={31} />
    </div>
  );
}
