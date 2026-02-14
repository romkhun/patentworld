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
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import dynamic from 'next/dynamic';
const PWChordDiagram = dynamic(() => import('@/components/charts/PWChordDiagram').then(m => ({ default: m.PWChordDiagram })), { ssr: false, loading: () => <div /> });
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
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS, COUNTRY_COLORS, ARCHETYPE_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { cleanOrgName } from '@/lib/orgNames';
import { formatCompact } from '@/lib/formatters';
import type {
  AssigneeTypePerYear, TopAssignee, OrgOverTime, DomesticVsForeign, Concentration,
  FirmCitationImpact, FirmTechEvolution, NonUSBySection,
  DesignPatentTrend, DesignTopFiler,
  PortfolioDiversity,
  FirmQualityYear, FirmClaimsYear, FirmQualityScatter,
  CompanyProfile, TrajectoryArchetype, CorporateMortality,
  PortfolioDiversificationB3, PivotDetection,
  CorporateCitationFlow, TechLeadership, CitationHalfLife,
  CorpDiversification,
  FirmExplorationYear, FirmExplorationScatter, FirmExplorationTrajectory,
  FirmLifecyclePoint, FirmAmbidexterityRecord,
  SelfCitationByAssignee, FirmGiniYear,
} from '@/lib/types';

const CPC_SECTIONS = Object.keys(CPC_SECTION_NAMES);

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

export default function FirmInnovation() {
  /* ── Part 1 data: General firm-level trends (from who-innovates) ── */
  const { data: types, loading: typL } = useChapterData<AssigneeTypePerYear[]>('chapter3/assignee_types_per_year.json');
  const { data: top, loading: topL } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: orgsTime, loading: orgL } = useChapterData<OrgOverTime[]>('chapter3/top_orgs_over_time.json');
  const { data: dvf, loading: dvfL } = useChapterData<DomesticVsForeign[]>('chapter3/domestic_vs_foreign.json');
  const { data: conc, loading: concL } = useChapterData<Concentration[]>('chapter3/concentration.json');
  const { data: citImpact, loading: citL } = useChapterData<FirmCitationImpact[]>('chapter3/firm_citation_impact.json');
  const { data: techEvo, loading: tevL } = useChapterData<FirmTechEvolution[]>('chapter3/firm_tech_evolution.json');
  const { data: diversity, loading: divL } = useChapterData<PortfolioDiversity[]>('chapter3/portfolio_diversity.json');
  const { data: nonUS, loading: nuL } = useChapterData<NonUSBySection[]>('chapter3/non_us_by_section.json');
  const { data: firmQuality, loading: fqL } = useChapterData<Record<string, FirmQualityYear[]>>('company/firm_quality_distribution.json');
  const { data: firmClaims, loading: fcmL } = useChapterData<Record<string, FirmClaimsYear[]>>('company/firm_claims_distribution.json');
  const { data: firmScatter, loading: fsL } = useChapterData<FirmQualityScatter[]>('company/firm_quality_scatter.json');
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[]; top_filers: DesignTopFiler[] }>('company/design_patents.json');

  /* ── Part 2 data: Detailed firm profiles (from company-profiles) ── */
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

  /* ── Part 3 data: Knowledge flows, exploration, quality (from knowledge-network, innovation-dynamics, patent-quality) ── */
  const { data: citationFlows, loading: cfL } = useChapterData<CorporateCitationFlow[]>('company/corporate_citation_network.json');
  const { data: techLeadership } = useChapterData<TechLeadership[]>('company/tech_leadership.json');
  const { data: citationHalfLife, loading: chlL } = useChapterData<CitationHalfLife[]>('company/citation_half_life.json');
  const { data: corpDiv, loading: cpL } = useChapterData<CorpDiversification[]>('chapter7/corp_diversification.json');
  const { data: firmExploration, loading: feL } = useChapterData<Record<string, FirmExplorationYear[]>>('company/firm_exploration_scores.json');
  const { data: explScatter, loading: esL } = useChapterData<FirmExplorationScatter[]>('company/firm_exploration_scatter.json');
  const { data: explTrajectories, loading: etL } = useChapterData<Record<string, FirmExplorationTrajectory[]>>('company/firm_exploration_trajectories.json');
  const { data: lifecycleData, loading: lcL } = useChapterData<{ firms: Record<string, FirmLifecyclePoint[]>; system_average: FirmLifecyclePoint[] }>('company/firm_exploration_lifecycle.json');
  const { data: ambidexterity, loading: amL } = useChapterData<FirmAmbidexterityRecord[]>('company/firm_ambidexterity_quality.json');
  const { data: selfCiteAssignee, loading: scaL } = useChapterData<SelfCitationByAssignee[]>('chapter9/self_citation_by_assignee.json');
  const { data: firmGini, loading: fgL } = useChapterData<Record<string, FirmGiniYear[]>>('company/firm_quality_gini.json');

  /* ── Part 1 state ── */
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedQualityFirm, setSelectedQualityFirm] = useState<string>('IBM');
  const [selectedOrgSeries, setSelectedOrgSeries] = useState<Set<string>>(new Set());
  const [selectedDivSeries, setSelectedDivSeries] = useState<Set<string>>(new Set());

  /* ── Part 2 state ── */
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('All');

  /* ── Part 3 state ── */
  const [selectedDecade, setSelectedDecade] = useState<string | number | null>(null);
  const [selectedExplFirm, setSelectedExplFirm] = useState<string>('IBM');

  /* ── Part 1 computations ── */
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

  /* ── Part 2 computations: Company profiles ── */
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

  /* Trajectory archetypes */
  const archetypeNames = useMemo(() => {
    if (!trajectories) return [];
    return [...new Set(trajectories.map((t) => t.archetype))];
  }, [trajectories]);

  const archetypeGroups = useMemo(() => {
    if (!trajectories) return [];
    const baseNameOf = (n: string) => n.replace(/\s*\(\d+\)$/, '');
    const baseNames = [...new Set(archetypeNames.map(baseNameOf))];
    return baseNames.map((baseName) => {
      const variantNames = archetypeNames.filter((n) => baseNameOf(n) === baseName);
      const members = trajectories.filter((t) => variantNames.includes(t.archetype));
      const seriesLen = members[0]?.normalized_series?.length ?? 0;
      const centroid: number[] = [];
      for (let i = 0; i < seriesLen; i++) {
        const avg = members.reduce((s, m) => s + (m.normalized_series[i] ?? 0), 0) / members.length;
        centroid.push(avg);
      }
      return { name: baseName, count: members.length, classCount: variantNames.length, centroid, companies: members };
    });
  }, [trajectories, archetypeNames]);

  const filteredTrajectories = useMemo(() => {
    if (!trajectories) return [];
    if (archetypeFilter === 'All') return trajectories;
    const baseNameOf = (n: string) => n.replace(/\s*\(\d+\)$/, '');
    return trajectories.filter((t) => baseNameOf(t.archetype) === archetypeFilter);
  }, [trajectories, archetypeFilter]);

  /* Corporate mortality */
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

  /* Portfolio diversification (B3 version) */
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

  /* Pivot detection */
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

  /* ── Part 3 computations: Knowledge flows, exploration, quality ── */

  // Corporate citation flows (chord diagram)
  const decades = useMemo(() => {
    if (!citationFlows) return [];
    return [...new Set(citationFlows.map(f => f.decade))].sort();
  }, [citationFlows]);

  const effectiveDecade = selectedDecade ?? (decades.length > 0 ? decades[decades.length - 1] : null);

  const chordData = useMemo(() => {
    if (!citationFlows || effectiveDecade == null) return null;
    const decadeFlows = citationFlows.filter(f => String(f.decade) === String(effectiveDecade));
    if (decadeFlows.length === 0) return null;
    const companies = [...new Set([...decadeFlows.map(f => f.source), ...decadeFlows.map(f => f.target)])];
    const idxMap: Record<string, number> = {};
    companies.forEach((c, i) => { idxMap[c] = i; });
    const matrix = companies.map(() => companies.map(() => 0));
    decadeFlows.forEach(f => {
      const si = idxMap[f.source];
      const ti = idxMap[f.target];
      if (si !== undefined && ti !== undefined) matrix[si][ti] = f.citation_count;
    });
    const nodes = companies.map((c, i) => ({ name: c, color: BUMP_COLORS[i % BUMP_COLORS.length] }));
    return { nodes, matrix };
  }, [citationFlows, effectiveDecade]);

  // Corporate technology portfolios (stacked bar)
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

  // Exploration/exploitation
  const explCompanies = useMemo(() => firmExploration ? Object.keys(firmExploration).sort() : [], [firmExploration]);
  const selectedExplData = useMemo(() => firmExploration?.[selectedExplFirm] ?? [], [firmExploration, selectedExplFirm]);

  const explTrajPanels = useMemo(() => {
    if (!explTrajectories) return [];
    return Object.entries(explTrajectories).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.exploration_share })),
    }));
  }, [explTrajectories]);

  const lifecyclePanels = useMemo(() => {
    if (!lifecycleData?.firms) return [];
    return Object.entries(lifecycleData.firms).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.relative_year, y: d.mean_exploration, ref: d.system_mean })),
    }));
  }, [lifecycleData]);

  const explScatterData = useMemo(() => {
    if (!explScatter) return [];
    return explScatter.map(d => ({
      company: d.company,
      x: d.exploration_share,
      y: d.quality_premium,
      size: d.patent_count,
      section: d.primary_section,
    }));
  }, [explScatter]);

  const ambidexterityScatterData = useMemo(() => {
    if (!ambidexterity) return [];
    return ambidexterity.map(d => ({
      company: d.company,
      x: d.ambidexterity_index,
      y: d.blockbuster_rate,
      size: d.patent_count,
      section: 'G',
      window: d.window,
    }));
  }, [ambidexterity]);

  // Within-firm quality Gini
  const giniPanels = useMemo(() => {
    if (!firmGini) return [];
    return Object.entries(firmGini).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.gini })),
    }));
  }, [firmGini]);

  return (
    <div>
      <ChapterHeader
        number={5}
        title="Firm Innovation"
        subtitle="Corporate patent strategies, organizational leadership, and company innovation profiles"
      />

      <KeyFindings>
        <li>Corporations hold the substantial majority of US patents, with Asian firms (Samsung, Canon, LG) now accounting for over half of the top 25 patent holders, reflecting the globalization of technology leadership.</li>
        <li>Foreign assignees surpassed US-based assignees around 2007 and now account for the majority of patent grants, driven by multinational R&amp;D strategies.</li>
        <li>Three broad trajectory archetypes (with six sub-variants) emerge from patent output histories, ranging from Steady Climbers to Boom &amp; Bust patterns, revealing characteristic lifecycle patterns of corporate innovation.</li>
        <li>Only a small fraction of top patent filers have maintained a continuous top-50 presence across all five decades, underscoring the volatility of innovation leadership.</li>
        <li>Technology pivots, detected through shifts in patent portfolio composition, often precede major business transformations and can serve as early-warning indicators of corporate strategy changes.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The digital transformation described in <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Technology Revolution</Link> has reshaped not only which technologies are patented but also which organizations produce them. Over five decades, individual inventors have given way to large corporate assignees whose patent portfolios serve as strategic instruments for cross-licensing, defensive protection, and competitive signaling. The organizational leadership of the patent system has passed through three distinct eras, from American industrial conglomerates such as General Electric, through Japanese electronics firms including Canon and Hitachi, to the present dominance of Korean multinationals, a succession that mirrors broader geopolitical shifts in research and development investment. Notably, while the national origin of leading assignees has shifted decisively toward East Asia, the structural concentration of patenting among elite organizations has remained stable across the entire period, suggesting that scale-dependent barriers to large-volume patenting persist regardless of geography. When these aggregate trends are disaggregated to the firm level, a distinct picture of strategic heterogeneity emerges: the 100 largest patent filers follow sharply divergent innovation trajectories, and the rarity of sustained leadership across multiple decades underscores how difficult it is for any single organization to remain at the frontier of technological change. Portfolio analysis reveals that firms navigate this challenge through fundamentally different approaches -- some pursue broad diversification across technology domains, while others concentrate resources in narrow areas of deep expertise -- and the ability to detect strategic reorientation through shifts in patent portfolio composition, often years before such changes become apparent in product markets, suggests that the patent record functions as an early-warning system for corporate transformation. These patterns set the stage for <Link href="/chapters/the-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Inventors</Link>, which examines the individual inventors behind these organizational outputs.
        </p>
      </aside>

      {/* ════════════════════════════════════════════════════════════════════════
          PART 1: General Firm-Level Trends and Aggregate Statistics
          ════════════════════════════════════════════════════════════════════════ */}

      <Narrative>
        <p>
          The substantial majority of patents are held by corporations. Over the decades, the share of
          patents assigned to companies has grown steadily, while individual inventors
          constitute a progressively smaller fraction. <StatCallout value={topOrgName} /> leads all
          organizations in cumulative patent grants.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-assignee-types"
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

      <ChartContainer
        id="fig-firm-innovation-top-assignees"
        title="IBM Leads With 161,888 Cumulative Grants, but Samsung Trails by Fewer Than 4,000 Patents"
        subtitle="Top organizations ranked by cumulative utility patent grants, 1976-2025"
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
        caption="Top 15 organizations by cumulative utility patent grants, 1976-2025. Source: PatentsView."
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
          id="fig-firm-innovation-rank-heatmap"
          title="GE Held Rank 1 for 6 Consecutive Years (1980-1985) Before Japanese and Korean Firms Rose to Dominance"
          subtitle="Annual grant rankings of the top 15 patent-holding organizations, with darker cells indicating higher rank, 1976-2025"
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
            id="fig-firm-innovation-org-output-trends"
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

      <ChartContainer
        id="fig-firm-innovation-domestic-vs-foreign"
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

      <ChartContainer
        id="fig-firm-innovation-concentration"
        title="The Top 100 Organizations Hold 32-39% of Corporate Patents, a Share That Has Narrowed Since the 2010s"
        subtitle="Share of corporate patents held by the top 10, 50, and 100 organizations, measured by 5-year period, 1976-2025"
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

      {/* ── Citation Impact ── */}

      <SectionDivider label="Citation Impact" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s technological influence. <GlossaryTooltip term="forward citations">Forward
          citations</GlossaryTooltip>, which measure how frequently a firm&apos;s patents are cited by subsequent inventions, provide
          a complementary indicator of the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-citation-impact"
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
        id="fig-firm-innovation-tech-evolution"
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
        id="fig-firm-innovation-portfolio-diversity"
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
        id="fig-firm-innovation-non-us-assignees"
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

      {/* ── Design Patent Leadership ── */}

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
        id="fig-firm-innovation-design-top-filers"
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

      {/* ── Innovation Quality Profiles ── */}

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
        id="fig-firm-innovation-quality-fan"
        title={`${selectedQualityFirm}: 35 of 48 Top Firms Saw Median Forward Citations Fall to Zero by 2019`}
        subtitle={`5-year forward citation percentiles (P10-P90) for ${selectedQualityFirm} patents by grant year, with company selector`}
        caption={`5-year forward citation percentiles for ${selectedQualityFirm} patents by grant year (1976-2019). Bands show P25-P75 (dark) and P10-P90 (light). Solid line = median; dashed gray = system-wide median. Only years with >=10 patents shown.`}
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
        id="fig-firm-innovation-blockbuster-dud"
        title={`${selectedQualityFirm}: Blockbuster Rate (Top 1% Patents) and Dud Rate (Zero Citations) Over Time`}
        subtitle={`Annual share of top-1% blockbuster patents and zero-citation dud patents for ${selectedQualityFirm}, with company selector`}
        caption={`Annual blockbuster rate (patents in top 1% of year x CPC section cohort, blue) and dud rate (zero 5-year forward citations, red) for ${selectedQualityFirm}. Dashed line at 1% marks the expected blockbuster rate under uniform quality.`}
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
        id="fig-firm-innovation-claims-distribution"
        title={`${selectedQualityFirm}: Claim Count Distribution by Grant Year (1976-2025)`}
        subtitle={`Claim count percentiles (P25-P75) for ${selectedQualityFirm} patents by grant year, with company selector`}
        caption={`Claim count percentiles for ${selectedQualityFirm} patents by grant year. Bands show P25-P75 (dark). Dashed gray = system-wide median claims.`}
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

      {/* ── Firm Quality Typology ── */}

      <SectionDivider label="Firm Quality Typology" />

      <Narrative>
        <p>
          Plotting each firm&apos;s blockbuster rate against its dud rate for the most recent
          complete decade (2010-2019) reveals distinct innovation strategies. Firms in the
          upper-right produce both high-impact breakthroughs and many zero-citation patents -- a
          high-variance strategy. Firms in the lower-right achieve high blockbuster rates with
          few duds, the hallmark of consistent quality.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-quality-scatter"
        title="Amazon's 6.7% Blockbuster Rate Leads the Field, While 18 of 50 Firms Exceed a 50% Dud Rate (2010-2019)"
        subtitle="Blockbuster rate vs. dud rate for the top 50 assignees (2010-2019), with bubble size proportional to patent count and color by primary CPC section"
        caption="Each bubble represents one of the top 50 assignees in the decade 2010-2019. X-axis: share of patents in the top 1% of their year x CPC section cohort. Y-axis: share of patents receiving zero 5-year forward citations. Bubble size: total patents. Color: primary CPC section."
        insight={`Amazon occupies the lower-right quadrant with a blockbuster rate of 6.7% and a dud rate of 18.3%, classifying it as a consistent high-impact innovator. By contrast, several firms, predominantly Japanese electronics companies, cluster in the upper-left with blockbuster rates below 0.2% and dud rates above 50%.`}
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
          suggesting that organizational factors -- R&amp;D investment concentration, inventor incentive
          structures, and portfolio management decisions -- contribute meaningfully to shaping the quality
          distribution of a firm&apos;s patent output.
        </p>
      </KeyInsight>

      {/* ════════════════════════════════════════════════════════════════════════
          PART 2: Detailed Firm Profiles and Company Breakdowns
          ════════════════════════════════════════════════════════════════════════ */}

      {/* ── Corporate Mortality ── */}

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
        id="fig-firm-innovation-mortality-heatmap"
        subtitle="Rank heatmap of top patent-holding companies across five decades, with darker cells indicating higher rank (more patents)."
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

      <RankingTable
        title="View top companies by total patents as a data table"
        headers={['Company', 'Total Patents', 'Peak Year']}
        rows={(profiles ?? [])
          .map(p => ({
            company: p.company,
            total: p.years.reduce((s, y) => s + y.patent_count, 0),
            peak: p.years.reduce((best, y) => y.patent_count > best.patent_count ? y : best, p.years[0])?.year ?? 0,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 15)
          .map(d => [d.company, d.total, d.peak])}
        caption="Top 15 companies by total utility patents from company profiles dataset. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Innovation leadership appears to be considerably more volatile than commonly assumed. Only a small number of
          companies have maintained a top-50 patent ranking across all five decades. The remainder
          have either risen, fallen, or been replaced entirely, a pattern that underscores
          the persistent pace of technological change and the difficulty of sustaining corporate
          R&amp;D investment over extended time horizons.
        </p>
      </KeyInsight>

      {/* ── Innovation Trajectory Archetypes ── */}

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
              <div className="mt-1 text-xs text-muted-foreground">{group.count} companies &middot; {group.classCount} {group.classCount === 1 ? 'class' : 'classes'}</div>
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
              {archetypeGroups.map((group) => (
                <option key={group.name} value={group.name}>{group.name}</option>
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
                      {(() => {
                        const baseName = t.archetype.replace(/\s*\(\d+\)$/, '');
                        return (
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${ARCHETYPE_COLORS[baseName] ?? ARCHETYPE_COLORS[t.archetype] ?? CHART_COLORS[0]}20`,
                              color: ARCHETYPE_COLORS[baseName] ?? ARCHETYPE_COLORS[t.archetype] ?? CHART_COLORS[0],
                            }}
                          >
                            {baseName}
                          </span>
                        );
                      })()}
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
        id="fig-firm-innovation-diversification"
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
          id="fig-firm-innovation-pivot-detection"
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
        id="fig-firm-innovation-annual-output"
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
        id="fig-firm-innovation-cpc-distribution"
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
        id="fig-firm-innovation-citations"
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
        id="fig-firm-innovation-team-size"
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
        id="fig-firm-innovation-cpc-breadth"
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

      {/* ════════════════════════════════════════════════════════════════════════
          PART 3: Knowledge Flows, Exploration/Exploitation, Quality Concentration
          ════════════════════════════════════════════════════════════════════════ */}

      {/* ── Knowledge Flows & Citations ── */}

      <SectionDivider label="Knowledge Flows & Citations" />

      <Narrative>
        <p>
          The pattern of inter-firm patent citations reveals structural knowledge dependencies. The{' '}
          <GlossaryTooltip term="chord diagram">chord diagram</GlossaryTooltip> below maps directed
          citation flows among the most prolific patent-filing organizations. Wider ribbons indicate a greater volume of
          citations flowing from one firm to another, illustrating{' '}
          <StatCallout value="knowledge dependencies" /> across the corporate landscape.
        </p>
      </Narrative>

      <div className="my-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Decade:</span>
        <div className="flex gap-1.5 flex-wrap">
          {decades.map(d => (
            <button
              key={String(d)}
              onClick={() => setSelectedDecade(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${String(effectiveDecade) === String(d) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {String(d)}s
            </button>
          ))}
        </div>
      </div>

      <ChartContainer
        id="fig-firm-innovation-corporate-citation-flows"
        subtitle="Directed citation flows among the top 30 patent filers shown as a chord diagram, with ribbon width proportional to citation volume."
        title={`Corporate Citation Flows Among Top 30 Filers Reveal Asymmetric Knowledge Dependencies (${effectiveDecade ?? ''}s)`}
        caption="Directed citation flows between the most prolific patent filers. Arc size represents total citations; ribbon width indicates flow volume. Certain firms function primarily as knowledge producers (heavily cited yet citing few peers), whereas others serve as integrators (drawing broadly from multiple sources)."
        insight="Citation flows reveal asymmetric knowledge dependencies. Certain firms function primarily as knowledge producers (heavily cited yet citing few peers), whereas others operate as integrators (drawing broadly from multiple sources)."
        loading={cfL}
        height={700}
        wide
      >
        {chordData ? (
          <PWChordDiagram
            nodes={chordData.nodes}
            matrix={chordData.matrix}
          />
        ) : <div />}
      </ChartContainer>

      <Narrative>
        <p>
          Within each technology area, a small number of firms consistently receive the most citations
          from peers. These constitute the <StatCallout value="technology leaders" /> whose patents
          form the foundation for subsequent innovation.
        </p>
      </Narrative>

      {techLeadership && (
        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Window</th>
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 font-medium">Rank</th>
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 text-right font-medium">Citations Received</th>
              </tr>
            </thead>
            <tbody>
              {techLeadership.filter(t => t.rank <= 3).slice(0, 50).map((t, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-xs">{t.window}</td>
                  <td className="py-2 pr-4">{t.section}: {CPC_SECTION_NAMES[t.section] ?? t.section}</td>
                  <td className="py-2 pr-4 font-mono">#{t.rank}</td>
                  <td className="py-2 pr-4 font-medium">{t.company}</td>
                  <td className="py-2 text-right font-mono text-xs">{formatCompact(t.citations_received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Narrative>
        <p>
          The rate at which a firm&apos;s patents accumulate citations varies considerably. The{' '}
          <GlossaryTooltip term="citation half-life">citation half-life</GlossaryTooltip> -- the
          time required to accumulate 50% of total citations -- distinguishes firms whose patents
          have <StatCallout value="immediate versus foundational impact" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-citation-half-life"
        subtitle="Years until a firm's patents accumulate 50% of total forward citations, using patents 15+ years old to ensure complete citation windows."
        title="Citation Half-Lives Range From 6.3 Years (Huawei) to 14.3 Years (US Air Force)"
        caption="Years until a firm's patents accumulate 50% of their total forward citations. Only patents 15 or more years old are included to ensure a complete citation window. Pharmaceutical and chemical firms demonstrate longer half-lives, whereas electronics and IT firms exhibit shorter ones."
        insight="Pharmaceutical and chemical firms tend to exhibit longer citation half-lives, reflecting the gradual accumulation of citations in science-intensive fields. Electronics and IT firms demonstrate shorter half-lives, with citations peaking shortly after grant."
        loading={chlL}
        height={600}
      >
        {citationHalfLife ? (
          <PWBarChart
            data={citationHalfLife.sort((a, b) => b.half_life_years - a.half_life_years).slice(0, 30)}
            xKey="company"
            bars={[{ key: 'half_life_years', name: 'Half-Life (years)', color: CHART_COLORS[6] }]}
            layout="vertical"
            yLabel="Years"
          />
        ) : <div />}
      </ChartContainer>

      {/* ── Corporate Technology Portfolios ── */}

      <SectionDivider label="Corporate Technology Portfolios" />

      {corpDivLate.length > 0 && (
        <ChartContainer
          id="fig-firm-innovation-corp-diversification"
          subtitle="Distribution of patent grants across CPC technology sections for the ten largest assignees (2001-2025), shown as stacked bars."
          title="IBM (88,600 G-Section Patents) and Samsung (79,400 H-Section Patents) Maintain the Most Diversified Technology Portfolios Among the Top Ten Patent Holders (2001-2025)"
          caption="This chart displays the distribution of patent grants across CPC technology sections for the ten largest patent holders in the 2001-2025 period. IBM and Samsung exhibit the broadest portfolio diversification, spanning physics, electricity, and chemistry, whereas firms such as Intel concentrate in semiconductor-related classifications."
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

      <Narrative>
        <p>
          The technology portfolios of major patent holders illustrate how firms diversify their
          innovation across fields. IBM and Samsung maintain broadly diversified portfolios spanning
          physics, electricity, and chemistry, whereas firms such as Intel concentrate predominantly in
          semiconductor-related physics and electricity classifications.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings.
          The most persistent leaders -- IBM, Samsung, Canon -- maintain diversified technology
          portfolios, whereas more specialized firms tend to rise and fall with the trajectories
          of their core technology domains.
        </p>
      </KeyInsight>

      {/* ── Exploration and Exploitation ── */}

      <SectionDivider label="Exploration and Exploitation" />

      <Narrative>
        <p>
          The exploration/exploitation framework (March, 1991) provides a lens for examining
          whether firms are entering new technology domains (exploration) or deepening established
          ones (exploitation). Each patent from a top-50 assignee is scored on three indicators:
          technology newness (whether the firm has prior presence in the patent&apos;s CPC subclass),
          citation newness (whether backward citations point to unfamiliar technology areas),
          and external knowledge sourcing (the inverse of self-citation rate). The composite
          exploration score averages these three indicators on a 0–1 scale.
        </p>
      </Narrative>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a company:</div>
        <PWCompanySelector
          companies={explCompanies}
          selected={selectedExplFirm}
          onSelect={setSelectedExplFirm}
        />
      </div>

      <ChartContainer
        id="fig-firm-innovation-exploration-score"
        subtitle="Composite exploration score and its three components (technology newness, citation newness, external sourcing) for the selected firm by year."
        title={`${selectedExplFirm}'s Exploration Score Averages ${selectedExplData.length > 0 ? (selectedExplData.reduce((s, d) => s + d.mean_exploration, 0) / selectedExplData.length).toFixed(2) : '—'} Across ${selectedExplData.length} Years of Patenting`}
        caption={`Mean exploration score and its three component indicators for ${selectedExplFirm} by year. The composite score (blue) averages technology newness, citation newness, and external knowledge sourcing (1 - self-citation rate). Higher values indicate more exploratory behavior.`}
        insight="Decomposing the composite score into its three indicators reveals which dimension of exploration is driving changes over time — whether the firm is entering new technology areas, citing unfamiliar prior art, or drawing on external knowledge."
        loading={feL}
        height={350}
        wide
      >
        {selectedExplData.length > 0 ? (
          <PWLineChart
            data={selectedExplData}
            xKey="year"
            lines={[
              { key: 'mean_exploration', name: 'Composite Score', color: CHART_COLORS[0] },
              { key: 'mean_tech_newness', name: 'Technology Newness', color: CHART_COLORS[1] },
              { key: 'mean_citation_newness', name: 'Citation Newness', color: CHART_COLORS[2] },
              { key: 'mean_external_score', name: 'External Sourcing', color: CHART_COLORS[5] },
            ]}
            yLabel="Score (0–1)"
            yFormatter={(v) => v.toFixed(2)}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-firm-innovation-exploration-share"
        subtitle="Share of the selected firm's annual patents classified as exploratory, ambidextrous, or exploitative, shown as a 100% stacked area."
        title={`${selectedExplFirm} Devotes ${selectedExplData.length > 0 ? (selectedExplData[selectedExplData.length - 1].exploitation_share * 100).toFixed(0) : '—'}% of Recent Patents to Exploitation Over Exploration`}
        caption={`Share of ${selectedExplFirm}'s annual patents classified as exploratory (score > 0.6), exploitative (score < 0.4), or ambidextrous (0.4–0.6). Dashed gray = system-wide mean exploration score.`}
        loading={feL}
        height={300}
        wide
      >
        {selectedExplData.length > 0 ? (
          <PWAreaChart
            data={selectedExplData.map(d => ({
              year: d.year,
              Exploratory: +(d.exploration_share * 100).toFixed(1),
              Ambidextrous: +(d.ambidexterity_share * 100).toFixed(1),
              Exploitative: +(d.exploitation_share * 100).toFixed(1),
            }))}
            xKey="year"
            areas={[
              { key: 'Exploratory', name: 'Exploratory (>0.6)', color: CHART_COLORS[0] },
              { key: 'Ambidextrous', name: 'Ambidextrous (0.4–0.6)', color: CHART_COLORS[2] },
              { key: 'Exploitative', name: 'Exploitative (<0.4)', color: CHART_COLORS[3] },
            ]}
            stackedPercent
            yLabel="Share (%)"
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-firm-innovation-exploration-trajectories"
        subtitle="Exploration share (% of exploratory patents) over time for 20 major filers, displayed as small multiples sorted by most recent share."
        title="11 of 20 Major Filers Keep Exploration Below 5%, with a Median Share of 2.9%"
        caption="Each panel shows one firm's exploration share (% of patents classified as exploratory) over time. Firms are sorted by most recent exploration share, descending. Exploration is defined as a composite score above 0.6 based on technology newness, citation newness, and external knowledge sourcing."
        insight="Most large patent filers maintain exploration shares below 5%, indicating that the vast majority of their patenting activity deepens established technology domains rather than entering new ones."
        loading={etL}
        height={850}
        wide
      >
        <PWSmallMultiples
          panels={explTrajPanels}
          xLabel="Year"
          yLabel="Exploration %"
          yFormatter={(v) => `${v.toFixed(0)}%`}
          columns={4}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The central analytical question is whether exploration produces higher-quality patents.
          For each firm in the most recent complete decade, the scatter below plots exploration
          share against the exploration quality premium — the difference in median 5-year forward
          citations between exploratory and exploitative patents. Firms in the upper-right quadrant
          are &ldquo;rewarded explorers&rdquo; whose forays into new domains yield higher-impact inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-exploration-quality"
        subtitle="Exploration share vs. quality premium (median citation difference) for top-50 assignees, with bubble size proportional to patent count."
        title="Only 4 of 49 Top Filers Show a Positive Exploration Quality Premium (2010–2019)"
        caption="Each bubble represents one top-50 assignee. X-axis: share of patents classified as exploratory. Y-axis: exploration quality premium (median citations of exploratory patents minus median citations of exploitative patents). Bubble size: total patents. Color: primary CPC section. Only firms with ≥20 exploratory and ≥20 exploitative patents shown."
        loading={esL}
        height={450}
        wide
      >
        <PWBubbleScatter
          data={explScatterData}
          xLabel="Exploration Share (%)"
          yLabel="Quality Premium (citations)"
          xFormatter={(v) => `${v.toFixed(1)}%`}
          yFormatter={(v) => v.toFixed(1)}
          xMidline={3}
          yMidline={0}
        />
      </ChartContainer>

      <Narrative>
        <p>
          When a firm enters a new technology area, does its exploration score in that area
          decline over time as it transitions from search to exploitation? The decay curves below
          track the mean exploration score by years since entry, averaged across all technology
          subclasses in which each firm holds at least 20 patents.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-exploration-decay"
        subtitle="Average exploration score by years since entry into a new CPC subclass, shown as small multiples with system-wide average as reference."
        title="New-Subclass Exploration Scores Decay from 1.0 to 0.087 Within 5 Years of Entry"
        caption="Each panel shows one firm's average exploration score by years since entry into a new CPC subclass. Dashed gray = system-wide average. The typical firm's exploration score falls sharply within 5 years, but the rate of decay varies considerably across organizations."
        insight="On average, a firm's exploration score in a newly entered technology subclass declines from 1.0 at entry to below 0.1 within 5 years. Some firms maintain higher exploration scores for longer periods, suggesting a more sustained period of search and experimentation."
        loading={lcL}
        height={850}
        wide
      >
        <PWSmallMultiples
          panels={lifecyclePanels}
          xLabel="Years Since Entry"
          yLabel="Score"
          yFormatter={(v) => v.toFixed(2)}
          columns={5}
          color={CHART_COLORS[4]}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Do firms that maintain a balance between exploration and exploitation produce
          higher-quality patent portfolios? The ambidexterity index (1 minus the absolute
          difference between exploration and exploitation shares) ranges from 0 (pure explorer or
          exploiter) to 1 (perfect 50/50 balance). The scatter below plots this index against
          the firm&apos;s blockbuster rate for each 5-year window since 1980.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-ambidexterity"
        subtitle="Ambidexterity index vs. blockbuster rate for top-50 assignees across 5-year windows, measuring whether balanced firms produce more high-impact patents."
        title="Balanced Firms Average a 2.51% Blockbuster Rate, 2.3x Higher Than Specialized Firms"
        caption="Each dot represents one firm in one 5-year window (top 50 assignees, 1980–2019). X-axis: ambidexterity index. Y-axis: blockbuster rate (% of patents in top 1% of year × CPC cohort). Only firm-periods with ≥50 patents shown."
        loading={amL}
        height={400}
        wide
      >
        {ambidexterityScatterData.length > 0 ? (
          <PWBubbleScatter
            data={ambidexterityScatterData}
            xLabel="Ambidexterity Index"
            yLabel="Blockbuster Rate (%)"
            xFormatter={(v) => v.toFixed(2)}
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The exploration/exploitation analysis reveals that most large patent filers are overwhelmingly
          exploitative, with exploration shares typically below 5%. This is consistent with the theoretical
          prediction that large, established organizations tend to favor exploitation of existing
          competencies over exploration of new domains. The exploration decay curves show that even when
          firms do enter new technology areas, they transition to exploitation rapidly — typically within
          5 years of entry.
        </p>
      </KeyInsight>

      {/* ── Quality Concentration ── */}

      <SectionDivider label="Quality Concentration" />

      <Narrative>
        <p>
          Self-citation patterns reveal meaningful differences in how firms accumulate
          knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation
          rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s
          previous work.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-self-citation-by-assignee"
        subtitle="Self-citation rate (fraction of backward citations to same assignee) for the 20 most-cited assignees, revealing knowledge recycling patterns."
        title="Canon (47.6%), TSMC (38.4%), and Micron (25.3%) Exhibit the Highest Self-Citation Rates Among Top Assignees"
        caption="This chart displays the fraction of all backward citations that are self-citations (citing the same assignee's earlier patents), for the 20 most-cited assignees. Canon (47.6%), TSMC (38.4%), and Micron (25.3%) exhibit the highest self-citation rates, reflecting deep cumulative R&D programs in imaging and semiconductor technologies."
        insight="Elevated self-citation rates among firms with cumulative R&D programs are consistent with long-term knowledge building on internal prior art, though strategic considerations may also contribute."
        loading={scaL}
        height={700}
      >
        <PWBarChart
          data={(selfCiteAssignee ?? []).map(d => ({
            ...d,
            label: cleanOrgName(d.organization),
            self_cite_pct: d.self_cite_rate,
          }))}
          xKey="label"
          bars={[{ key: 'self_cite_pct', name: 'Self-Citation Rate (%)', color: CHART_COLORS[6] }]}
          layout="vertical"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The Gini coefficient, applied to forward citations within each firm&apos;s annual patent
          cohort, measures how concentrated a firm&apos;s citation impact is across its portfolio.
          A Gini near 1.0 indicates that virtually all citation impact is concentrated in a
          handful of patents; near 0.0 indicates impact is evenly distributed. A rising Gini
          signals increasing dependence on a small number of high-impact inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-innovation-firm-gini"
        subtitle="Gini coefficient of forward citations within each firm's annual patent cohort, measuring how concentrated citation impact is across the portfolio."
        title="Within-Firm Citation Gini Coefficients Rose from 0.5 to Above 0.8 for Most Large Filers, Signaling Growing Reliance on Blockbuster Patents"
        caption="Each panel shows one firm's citation Gini coefficient by year (top 20 firms by recent Gini). Higher values indicate more concentrated citation impact within the firm's patent portfolio."
        insight="Most large patent filers exhibit Gini coefficients between 0.6 and 0.9, indicating that a small fraction of each firm's patents accounts for the majority of citation impact. Several firms show rising Gini trajectories, consistent with increasing reliance on blockbuster inventions."
        loading={fgL}
        height={850}
        wide
      >
        <PWSmallMultiples
          panels={giniPanels}
          xLabel="Year"
          yLabel="Gini"
          yFormatter={(v) => v.toFixed(2)}
          columns={4}
          color={CHART_COLORS[4]}
        />
      </ChartContainer>

      {/* ── Closing ── */}

      <Narrative>
        Having examined corporate innovation strategies at the firm level -- from aggregate organizational trends and quality distributions to detailed company profiles, trajectory archetypes, and technology pivots -- the <Link href="/chapters/the-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> turns to the individual inventors behind these organizational outputs. While corporations file the patents, it is the inventors -- through their team structures, career trajectories, and demographic composition -- who ultimately shape the direction and quality of innovation.
      </Narrative>

      <DataNote>
        Assignee data employ disambiguated identities from PatentsView. The primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Citation impact is calculated using forward citations for patents granted through 2020.
        Portfolio diversity is measured using Shannon entropy across CPC subclasses per 5-year period.
        Company profiles are constructed from PatentsView data for the top 100 patent filers by
        total utility patent count, 1976-2025. CPC distribution uses the primary CPC classification
        of each patent. Trajectory archetypes are computed via time-series clustering of
        normalized annual patent counts. Corporate mortality tracks presence in the top 50 per
        decade. Technology pivots use Jensen-Shannon divergence between consecutive 5-year
        windows of CPC distributions. Corporate citation flows aggregate all citations between
        pairs of the top 30 assignees per decade. Citation half-life uses patents granted before
        2010 to ensure at least 15 years of citation accumulation. Corporate technology portfolios
        use CPC section-level classification for the late period (2001-2025). Exploration scores
        combine technology newness, citation newness, and external knowledge sourcing on a 0-1
        scale; patents scoring above 0.6 are classified as exploratory, below 0.4 as exploitative.
        Self-citation rates measure the fraction of backward citations directed to the same
        assignee. Within-firm quality Gini applies the Gini coefficient to 5-year forward
        citations within each firm&apos;s annual patent cohort.
      </DataNote>

      <RelatedChapters currentChapter={5} />
      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
