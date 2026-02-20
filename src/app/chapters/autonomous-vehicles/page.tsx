'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS, AV_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { AV_EVENTS } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion, DomainEntrantIncumbent,
  DomainQualityBifurcation,
  Act6DomainFilingVsGrant,
} from '@/lib/types';

export default function Chapter14() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('av/av_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('av/av_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('av/av_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('av/av_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('av/av_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('av/av_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('av/av_org_over_time.json');
  const { data: avStrategies } = useChapterData<DomainStrategy[]>('av/av_strategies.json');
  const { data: avDiffusion, loading: adL } = useChapterData<DomainDiffusion[]>('av/av_diffusion.json');
  const { data: avTeam, loading: atcL } = useChapterData<DomainTeamComparison[]>('av/av_team_comparison.json');
  const { data: avAssignType, loading: aatL } = useChapterData<DomainAssigneeType[]>('av/av_assignee_type.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('av/av_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('av/av_quality_bifurcation.json');
  const { data: filingVsGrant, loading: fgL } = useChapterData<Act6DomainFilingVsGrant[]>('act6/act6_domain_filing_vs_grant.json');

  // Pivot subfield data for stacked area chart
  const { subfieldPivot, subfieldNames } = useMemo(() => {
    if (!bySubfield) return { subfieldPivot: [], subfieldNames: [] };
    const subfields = [...new Set(bySubfield.map((d) => d.subfield))];
    const years = [...new Set(bySubfield.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: any = { year };
      bySubfield.filter((d) => d.year === year).forEach((d) => {
        row[d.subfield] = d.count;
      });
      return row;
    });
    return { subfieldPivot: pivoted, subfieldNames: subfields };
  }, [bySubfield]);

  const assigneeData = useMemo(() => {
    if (!topAssignees) return [];
    return topAssignees.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [topAssignees]);

  const inventorData = useMemo(() => {
    if (!topInventors) return [];
    return topInventors.map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`.trim(),
    }));
  }, [topInventors]);

  // Shared short display names for organizations
  const orgNameMap = useMemo(() => {
    if (!orgOverTime) return {};
    const map: Record<string, string> = {};
    const orgNames = [...new Set(orgOverTime.map((d) => d.organization))];
    orgNames.forEach((org) => {
      map[org] = cleanOrgName(org);
    });
    return map;
  }, [orgOverTime]);

  // Compute rank data for bump chart
  const orgRankData = useMemo(() => {
    if (!orgOverTime) return [];
    const years = [...new Set(orgOverTime.map((d) => d.year))].sort().filter((y) => y >= 2000);
    const ranked: { organization: string; year: number; rank: number }[] = [];
    years.forEach((year) => {
      const yearData = orgOverTime
        .filter((d) => d.year === year && d.count > 0)
        .sort((a, b) => b.count - a.count);
      yearData.forEach((d, i) => {
        if (i < 15) {
          ranked.push({
            organization: orgNameMap[d.organization] ?? d.organization,
            year,
            rank: i + 1,
          });
        }
      });
    });
    return ranked;
  }, [orgOverTime, orgNameMap]);

  const geoCountry = useMemo(() => {
    if (!geography) return [];
    const countryMap: Record<string, number> = {};
    geography.forEach((d) => {
      countryMap[d.country] = (countryMap[d.country] || 0) + d.domain_patents;
    });
    return Object.entries(countryMap)
      .map(([country, domain_patents]) => ({ country, domain_patents }))
      .sort((a, b) => b.domain_patents - a.domain_patents)
      .slice(0, 30);
  }, [geography]);

  const geoState = useMemo(() => {
    if (!geography) return [];
    return geography
      .filter((d) => d.country === 'US' && d.state)
      .sort((a, b) => b.domain_patents - a.domain_patents)
      .slice(0, 30)
      .map((d) => ({ state: d.state, domain_patents: d.domain_patents }));
  }, [geography]);

  const strategyOrgs = useMemo(() => {
    if (!avStrategies) return [];
    const orgs = [...new Set(avStrategies.map(d => d.organization))];
    return orgs.map(org => ({
      organization: org,
      subfields: avStrategies.filter(d => d.organization === org).sort((a, b) => b.patent_count - a.patent_count),
    })).sort((a, b) => {
      const aTotal = a.subfields.reduce((s, d) => s + d.patent_count, 0);
      const bTotal = b.subfields.reduce((s, d) => s + d.patent_count, 0);
      return bTotal - aTotal;
    });
  }, [avStrategies]);

  const { diffusionPivot, diffusionSections } = useMemo(() => {
    if (!avDiffusion) return { diffusionPivot: [], diffusionSections: [] };
    const sections = [...new Set(avDiffusion.map(d => d.section))].sort();
    const years = [...new Set(avDiffusion.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      avDiffusion.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.pct_of_domain;
      });
      return row;
    });
    return { diffusionPivot: pivoted, diffusionSections: sections };
  }, [avDiffusion]);

  const teamComparisonPivot = useMemo(() => {
    if (!avTeam) return [];
    const years = [...new Set(avTeam.map(d => d.year))].sort();
    return years.map(year => {
      const row: Record<string, unknown> = { year };
      avTeam.filter(d => d.year === year).forEach(d => {
        row[d.category] = d.avg_team_size;
      });
      return row;
    });
  }, [avTeam]);

  const { assigneeTypePivot, assigneeTypeNames } = useMemo(() => {
    if (!avAssignType) return { assigneeTypePivot: [], assigneeTypeNames: [] };
    const categories = [...new Set(avAssignType.map(d => d.assignee_category))];
    const years = [...new Set(avAssignType.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      avAssignType.filter(d => d.year === year).forEach(d => {
        row[d.assignee_category] = d.count;
      });
      return row;
    });
    return { assigneeTypePivot: pivoted, assigneeTypeNames: categories };
  }, [avAssignType]);

  const eiPivot = useMemo(() => {
    if (!entrantIncumbent) return [];
    return entrantIncumbent.map((d) => ({ year: d.year, Entrant: d.entrant_count, Incumbent: d.incumbent_count }));
  }, [entrantIncumbent]);

  // ── Analytical Deep Dive computations ──────────────────────────────
  const cr4Data = useMemo(() => {
    if (!orgOverTime || !perYear) return [];
    const pyMap = Object.fromEntries(perYear.map(d => [d.year, d.domain_patents]));
    const years = [...new Set(orgOverTime.map(d => d.year))].sort();
    return years.map(year => {
      const yearOrgs = orgOverTime.filter(d => d.year === year).sort((a, b) => b.count - a.count);
      const top4 = yearOrgs.slice(0, 4).reduce((s, d) => s + d.count, 0);
      const total = pyMap[year] || 1;
      return { year, cr4: +(top4 / total * 100).toFixed(1) };
    }).filter(d => d.cr4 > 0);
  }, [orgOverTime, perYear]);

  const entropyData = useMemo(() => {
    if (!bySubfield) return [];
    const years = [...new Set(bySubfield.map(d => d.year))].sort();
    return years.map(year => {
      const yearData = bySubfield.filter(d => d.year === year && d.count > 0);
      const total = yearData.reduce((s, d) => s + d.count, 0);
      const N = yearData.length;
      if (total === 0 || N <= 1) return { year, entropy: 0 };
      const H = -yearData.reduce((s, d) => {
        const p = d.count / total;
        return s + p * Math.log(p);
      }, 0);
      return { year, entropy: +(H / Math.log(N)).toFixed(3) };
    }).filter(d => d.entropy > 0);
  }, [bySubfield]);

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

  const filingGrantPivot = useMemo(() => {
    if (!filingVsGrant) return [];
    const filing = filingVsGrant.filter((d) => d.domain === 'AV' && d.series === 'filing_year');
    const grant = filingVsGrant.filter((d) => d.domain === 'AV' && d.series === 'grant_year');
    const filingMap = Object.fromEntries(filing.map((d) => [d.year, d.count]));
    const grantMap = Object.fromEntries(grant.map((d) => [d.year, d.count]));
    const years = [...new Set([...filing.map((d) => d.year), ...grant.map((d) => d.year)])].sort();
    return years.map((year) => ({ year, filings: filingMap[year] ?? 0, grants: grantMap[year] ?? 0 }));
  }, [filingVsGrant]);

  return (
    <div>
      <ChapterHeader
        number={26}
        title="Autonomous Vehicles & ADAS"
        subtitle="The race toward self-driving transportation"
      />
      <MeasurementSidebar slug="autonomous-vehicles" />

      <KeyFindings>
        <li>Autonomous vehicle patent filings increased rapidly in the 2010s, coinciding with competition between established automakers and technology companies entering the transportation sector.</li>
        <li>Navigation and path planning constitutes the largest AV subfield, reflecting the central engineering challenge of route optimization and real-time autonomous decision-making.</li>
        <li>The competitive landscape spans traditional automakers (Toyota, Honda, Ford, GM), technology firms (Google/Waymo), and other technology companies, each pursuing distinct technical strategies.</li>
        <li>Scene understanding -- computer vision applied to driving environments -- has emerged as one of the fastest-growing subfields, associated with advances in deep learning and sensor fusion.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The pursuit of autonomous driving represents one of the most capital-intensive and technically demanding innovation races in modern history. What began with Google&apos;s self-driving project in 2009 has grown into a global competition involving automakers, technology companies, sensor manufacturers, and ride-hailing platforms, each building patent portfolios that reflect fundamentally different technical approaches. The debate between lidar-based and camera-based perception systems -- exemplified by Waymo and Tesla respectively -- is evident in the patent data, as does the growing convergence of <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link>, advanced sensor technology, and automotive engineering. The 2016 Tesla Autopilot crash and subsequent safety debates have not slowed patent activity but have shifted its composition, with an increasing share of filings addressing redundancy, fail-safe mechanisms, and human-machine interaction -- patterns consistent with the broader maturation of the field documented in the <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">technology revolution</Link> chapter.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link> and its role as a general-purpose technology across the patent system, this chapter turns to autonomous vehicles, a domain where AI-driven perception and decision-making systems constitute the core of inventive activity.
        </p>
        <p>
          Autonomous vehicles and advanced driver-assistance systems (ADAS) represent a convergence
          of artificial intelligence, sensor technology, and automotive engineering. This chapter
          traces the patent landscape of <StatCallout value="self-driving technology" /> -- from
          early cruise control and lane-keeping systems through the current era of fully autonomous
          driving platforms and robotaxis.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          AV patent activity serves as a barometer of the broader race toward autonomous
          transportation. The exponential growth in AV-related patenting since 2012 reflects
          the convergence of advances in deep learning, lidar and camera technology, and
          high-definition mapping -- enabling capabilities that were considered decades away
          only a generation earlier.
        </p>
      </KeyInsight>

      {/* -- Section 1: Growth Trajectory --------------------------------------- */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-av-annual-count"
        subtitle="Annual count of utility patents classified under AV-related CPC codes, tracking the growth trajectory of autonomous vehicle patenting."
        title="AV Patent Filings Increased Rapidly Through the 2010s, Driven by the Entry of Technology Companies Into the Transportation Sector"
        caption="Annual count and share of utility patents classified under AV-related CPC codes (G05D1, B60W, G08G), 1976-2025. The most prominent pattern is the sharp acceleration beginning around 2012, coinciding with Google's self-driving project gaining visibility and traditional automakers responding with their own AV R&D programs. Grant year shown. Application dates are typically 2–3 years earlier."
        insight="The exponential growth in AV patents mirrors the broader industry transformation, driven by advances in AI, sensor miniaturization, and the entry of well-capitalized technology firms into the transportation sector."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'AV Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={AV_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AV patent filings exhibited substantial growth through the 2010s, associated with the
          entry of technology companies such as Google, Apple, and Uber into the transportation
          sector. This growth exceeded the rate of overall patent expansion,
          indicating a reallocation of inventive effort toward autonomous driving
          technologies.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-av-entrant-incumbent"
        title="Autonomous Vehicle Patent Growth Is Driven by Both New Entrants and Expanding Incumbents"
        subtitle="Annual patent counts from entrant and incumbent assignees in the autonomous vehicle domain."
        caption="Entrants are organizations filing their first AV patent in a given year; incumbents are those with prior filings."
        loading={eiL}
      >
        <PWAreaChart
          data={eiPivot}
          xKey="year"
          areas={[
            { key: 'Entrant', name: 'Entrant', color: CHART_COLORS[1] },
            { key: 'Incumbent', name: 'Incumbent', color: CHART_COLORS[0] },
          ]}
          stacked
          yLabel="Number of Patents"
        />
      </ChartContainer>

      {/* -- Section 2: AV Share of All Patents --------------------------------- */}
      <ChartContainer
        id="fig-av-share"
        subtitle="AV patents as a percentage of all utility patents, showing the growing allocation of inventive effort toward autonomous driving."
        title="AV Patents as a Share of Total Filings Rose Substantially After 2012, Reflecting Intensifying Investment"
        caption="Percentage of all utility patents classified under AV-related CPC codes. The upward trend indicates that AV patenting growth represents a disproportionate concentration of inventive effort, not merely tracking overall patent expansion."
        insight="The growing share of AV patents among all filings demonstrates that autonomous vehicle innovation is not merely keeping pace with overall patent growth but represents a genuine shift in R&D priorities across both automotive and technology sectors."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'AV Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={AV_EVENTS}
        />
      </ChartContainer>

      {/* -- Section 3: AV Subfields ------------------------------------------- */}
      <SectionDivider label="AV Subfields" />

      <ChartContainer
        id="fig-av-subfields"
        subtitle="Patent counts by AV subfield (vehicle control, navigation, scene understanding, and related subfields) over time, based on specific CPC group codes."
        title="Navigation and Path Planning Dominates AV Patenting, While Scene Understanding Has Emerged as the Fastest-Growing Subfield"
        caption="Patent counts by AV subfield over time, based on CPC classifications. Navigation and path planning has consistently been the largest subfield, reflecting the central engineering challenge of route optimization and real-time decision-making. Scene understanding -- encompassing computer vision applied to driving environments -- has grown rapidly since 2015 as deep learning methods improved object detection and semantic segmentation."
        insight="The dominance of navigation and path planning patents reflects the fundamental challenge of autonomous driving: route optimization and real-time decision-making. The rapid growth of scene understanding patents signals increasing sophistication in how AV systems perceive their environment."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: AV_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={AV_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of AV patents reveals the multidisciplinary nature of autonomous
          driving. Navigation and path planning constitutes the largest subfield, addressing
          route optimization and real-time decision-making. Vehicle control -- encompassing
          steering, braking, and acceleration algorithms -- represents another major category. Scene understanding, which applies
          computer vision and deep learning to interpret driving environments, has been the
          fastest-growing subfield since 2015, reflecting advances in object detection,
          semantic segmentation, and sensor fusion that underpin modern ADAS and autonomous
          driving systems.
        </p>
      </KeyInsight>

      {/* -- Section 4: Top Organizations -------------------------------------- */}
      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-av-top-assignees"
        subtitle="Organizations ranked by total AV-related patent count, showing concentration among automakers and technology firms."
        title="Toyota, Honda, Ford, Waymo, and GM Lead in AV Patent Volume, Reflecting the Dual Nature of the Autonomous Vehicle Race"
        caption="Organizations ranked by total AV-related patents, 1976-2025. The data indicate a distinctive competitive landscape where traditional automakers and technology companies compete directly, each leveraging distinct capabilities in vehicle engineering and artificial intelligence."
        insight="The AV patent landscape uniquely bridges two industries: traditional automakers bring decades of vehicle engineering expertise while technology firms contribute AI, sensor fusion, and software capabilities -- creating a competitive dynamic unlike any other technology domain."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'AV Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top AV patent holders as a data table"
        headers={['Organization', 'AV Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by AV-related patent count, 1976-2025. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          The organizational landscape of AV patenting reflects the convergence of two
          historically distinct industries. Traditional automakers -- Toyota, Ford, GM, Honda,
          and Hyundai -- leverage their expertise in vehicle dynamics, safety systems, and
          manufacturing scale. Technology companies -- Google/Waymo, Amazon/Zoox, and LG Electronics -- bring
          capabilities in artificial intelligence, computer vision, and high-definition mapping.
          The presence of both types of organizations among the top patent holders underscores
          the multidisciplinary nature of autonomous driving, requiring the integration of
          mechanical engineering, sensor technology, and software at a level of complexity that
          few other technology domains demand.
        </p>
      </KeyInsight>

      {/* -- Section 5: Organization Rankings Over Time ------------------------- */}
      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-av-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by AV patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="Multiple Technology and Automotive Firms Converged at the Top of AV Rankings After 2012"
          caption="Annual ranking of the top 15 organizations by AV patent grants, 2000-2025. Darker cells indicate higher rank (more patents). The data reveal a competitive landscape that intensified substantially after 2012 as technology companies entered the autonomous driving space."
          insight="The ranking data reveal a transformation in competitive dynamics: whereas traditional automakers dominated AV patenting through the 2000s, technology companies rapidly ascended after 2012, creating a more contested and dynamic competitive landscape."
          loading={ootL}
          height={600}
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
      )}

      <KeyInsight>
        <p>
          The ranking data reveal a structural shift in AV patent leadership. Through the
          2000s, traditional automakers such as Toyota and GM held the top positions largely
          unchallenged. The 2010s exhibited rapid convergence as Google/Waymo, Zoox, Amazon, and other
          technology firms scaled their autonomous driving programs. This intensifying
          competition is consistent with the characterization of autonomous driving as a
          technology domain where incumbency in automotive manufacturing does not guarantee
          leadership -- a pattern that distinguishes AV from most other transportation-related
          patent categories.
        </p>
      </KeyInsight>

      {/* -- Section 6: Top Inventors ------------------------------------------ */}
      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-av-top-inventors"
        subtitle="Primary inventors ranked by total AV-related patent count, illustrating the skewed distribution of individual output."
        title="A Small Cohort of Prolific Inventors Accounts for a Disproportionate Share of AV Patent Output"
        caption="Primary inventors ranked by total AV-related patents, 1976-2025. The distribution exhibits pronounced skewness, with a small number of highly productive individuals -- many affiliated with major automakers or technology firms -- accounting for a large share of total AV patent output."
        insight="The concentration of AV patenting among a small cohort of prolific inventors reflects the deep specialization required in autonomous systems engineering, where expertise in sensor fusion, control theory, and machine learning must be combined within individual inventive contributions."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'AV Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific AV inventors are typically affiliated with organizations that
          maintain dedicated autonomous driving divisions. The concentration of AV patenting
          among a relatively small cohort mirrors the broader pattern of skewed productivity
          distributions observed across the patent system. However, the degree of concentration
          appears particularly pronounced in autonomous vehicles, likely reflecting the
          specialized expertise required in control systems, sensor fusion, and real-time
          decision-making algorithms.
        </p>
      </KeyInsight>

      {/* -- Section 7: Geography ---------------------------------------------- */}
      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-av-geography-country"
        subtitle="Countries ranked by total AV-related patents based on primary inventor location, showing geographic distribution of AV innovation."
        title="The United States Leads in AV Patent Volume, Followed by Japan, Germany, and South Korea"
        caption="Countries ranked by total AV-related patents based on primary inventor location. The United States maintains a substantial lead, while the strong presence of Japan, Germany, and South Korea reflects the global nature of automotive and autonomous driving innovation."
        insight="The geographic distribution of AV patents reflects the intersection of two industrial clusters: the United States leads through its technology sector concentration, while Japan, Germany, and South Korea contribute through their established automotive industries."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'AV Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of AV patents reveals the intersection of two major
          industrial clusters. The United States leads, driven by technology companies in
          Silicon Valley and Detroit&apos;s automotive R&amp;D infrastructure. Japan&apos;s
          strong presence reflects Toyota, Honda, and Nissan&apos;s longstanding investments
          in driver-assistance technology. Germany&apos;s position is anchored by BMW,
          Daimler/Mercedes-Benz, and Bosch, while South Korea&apos;s contribution reflects
          Hyundai and Samsung&apos;s growing autonomous vehicle programs.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-av-geography-state"
        subtitle="US states ranked by total AV-related patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California and Michigan Dominate US AV Patenting, Reflecting the Convergence of Tech and Auto Industries"
        caption="US states ranked by total AV-related patents based on primary inventor location. California's lead reflects Silicon Valley's technology firms (Waymo, Tesla, Uber ATG), while Michigan's prominence reflects Detroit's automotive R&D heritage -- illustrating how AV innovation bridges two geographic clusters."
        insight="The dual concentration in California and Michigan illustrates the unique nature of AV innovation: it requires the convergence of Silicon Valley's AI and software capabilities with Detroit's automotive engineering expertise."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'AV Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, AV patenting is concentrated in California and Michigan,
          reflecting the two pillars of the autonomous vehicle industry. California&apos;s
          leadership is driven by Silicon Valley technology companies -- Waymo, Tesla, Cruise,
          and numerous startups -- while Michigan&apos;s prominence reflects the Detroit
          automotive ecosystem, including GM, Ford, and their extensive supplier networks.
          This dual concentration distinguishes AV from most other technology domains examined
          in this book, where California typically dominates more decisively.
        </p>
      </KeyInsight>

      {/* -- Section 8: Quality Indicators ------------------------------------- */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-av-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for AV patents by year, measuring quality trends."
        title="AV Patent Technology Scope Has Expanded Substantially, Reflecting the Growing Interdisciplinarity of Autonomous Driving"
        caption="Average claims, backward citations, and technology scope for AV-related patents by year. The upward trend in technology scope reflects the inherently interdisciplinary nature of autonomous driving, which spans vehicle control, computer vision, communications, and mechanical engineering."
        insight="Rising technology scope indicates that AV patents increasingly bridge multiple CPC subclasses, consistent with autonomous driving requiring the integration of AI, sensor technology, communications, and mechanical engineering."
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
          yLabel="Average per Patent"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={AV_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AV patents exhibit distinctive quality characteristics. Average backward citations
          peaked around 2013 and have declined substantially since, a pattern consistent with
          the broader shift toward more narrowly targeted prior art searches as the field has
          matured. The expanding technology scope indicates that AV
          inventions are inherently interdisciplinary, spanning multiple{' '}
          <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses as autonomous systems
          require the integration of diverse technical capabilities.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-av-quality-bifurcation"
        title="Autonomous Vehicle Top-Decile Citation Share Has Declined Amid Rapid Volume Growth"
        subtitle="Share of AV patents in the top decile of forward citations, by grant year."
        caption="Top-decile citation share measures the proportion of domain patents that rank in the top 10% of all patents by forward citations received."
        loading={qbL}
      >
        <PWLineChart
          data={qualityBif ?? []}
          xKey="period"
          lines={[{ key: 'top_decile_share', name: 'Top-Decile Share (%)', color: CHART_COLORS[2] }]}
          yLabel="Top-Decile Share (%)"
        />
      </ChartContainer>

      {/* -- Section 9: AV Patenting Strategies -------------------------------- */}
      <SectionDivider label="AV Patenting Strategies" />
      <Narrative>
        <p>
          The leading AV patent holders pursue markedly different technical strategies. Some
          organizations concentrate on vehicle control and path planning -- reflecting an
          automotive engineering approach -- while others invest heavily in scene understanding
          and perception -- reflecting a computer science orientation. The lidar-versus-camera
          debate, exemplified by Waymo&apos;s multi-sensor approach and Tesla&apos;s
          camera-centric strategy, manifests in the patent portfolios of the leading firms.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total AV Patents</th>
              </tr>
            </thead>
            <tbody>
              {strategyOrgs.slice(0, 15).map((org, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium text-sm">{cleanOrgName(org.organization)}</td>
                  <td className="py-2 px-2">
                    {org.subfields.slice(0, 3).map((sf, j) => (
                      <span key={j} className="inline-block mr-2 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {sf.subfield}: {sf.patent_count.toLocaleString()}
                      </span>
                    ))}
                  </td>
                  <td className="text-right py-2 px-2 font-mono font-semibold">{org.subfields.reduce((s, d) => s + d.patent_count, 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <KeyInsight>
        <p>
          The strategic differences among leading AV patent holders reflect fundamentally
          different technical philosophies, though all top organizations focus primarily on
          navigation and path planning. Traditional automakers such as Toyota and Ford
          complement their navigation portfolios with vehicle control patents, leveraging
          their engineering heritage in vehicle dynamics and safety systems. Technology firms
          such as Waymo have built portfolios emphasizing scene understanding and autonomous
          driving systems alongside navigation, reflecting their strengths in AI and software.
          The relative balance between these subfields within each organization&apos;s portfolio
          reveals whether its approach to autonomous driving is rooted in automotive engineering
          or computer science -- a distinction that may ultimately determine competitive
          outcomes as the industry matures.
        </p>
      </KeyInsight>

      {/* -- Section 10: Cross-Domain Diffusion -------------------------------- */}
      <SectionDivider label="AV as a Convergent Technology" />
      <Narrative>
        <p>
          Autonomous driving is inherently a convergent technology, drawing on advances in
          artificial intelligence, telecommunications, semiconductor design, and mechanical
          engineering. By tracking how frequently AV-classified patents also carry CPC codes
          from other technology areas, it is possible to measure the extent to which autonomous
          vehicle innovation bridges traditional disciplinary boundaries.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-av-diffusion"
        subtitle="Percentage of AV patents co-classified with other CPC sections, measuring the technology's cross-domain reach."
        title="AV Patent Co-Occurrence With AI, Telecommunications, and Mechanical Engineering CPC Codes Has Increased Substantially"
        caption="Percentage of AV patents that also carry CPC codes from each non-AV CPC section. Rising lines indicate AV technology diffusing into or drawing upon that sector. The most notable pattern is the increasing co-occurrence with Physics (Section G, encompassing AI and sensors) and Electricity (Section H, encompassing telecommunications)."
        insight="The cross-domain reach of AV patents confirms the convergent nature of autonomous driving technology, which bridges AI, telecommunications, sensor engineering, and mechanical systems in ways that distinguish it from most other technology domains."
        loading={adL}
      >
        {diffusionPivot.length > 0 && (
          <PWLineChart
            data={diffusionPivot}
            xKey="year"
            lines={diffusionSections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="% of AV Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={AV_EVENTS}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          AV patents increasingly co-occur with CPC codes spanning multiple technology
          sections, confirming the convergent nature of autonomous driving. The rising
          co-occurrence with Physics (Section G) reflects the integration of AI, computer
          vision, and sensor technologies. The co-occurrence with Electricity (Section H)
          captures the telecommunications and vehicle-to-everything (V2X) communication
          dimensions of autonomous driving. The breadth of cross-domain connections
          distinguishes AV from more narrowly defined technology fields and underscores
          why autonomous driving has attracted investment from such a diverse range of
          organizations.
        </p>
      </KeyInsight>

      {/* -- Section 11: Team Comparison and Assignee Types --------------------- */}
      <SectionDivider label="The Collaborative Nature of AV Innovation" />

      <Narrative>
        <p>
          Autonomous vehicle patent team sizes were generally smaller than non-AV patents
          through the 2010s but have converged in recent years, reaching nearly equal
          levels by 2025. This convergence reflects the maturation of AV technology, as
          autonomous systems have grown more sophisticated and attracted larger multidisciplinary
          teams integrating perception, planning, and control expertise.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-av-team-comparison"
        subtitle="Average inventors per patent for AV versus non-AV utility patents by year, showing convergence in recent years."
        title="AV Patent Team Sizes Have Converged With Non-AV Teams in Recent Years"
        caption="Average number of inventors per patent for AV-related versus non-AV utility patents, 1976-2025. AV patent team sizes were generally smaller than non-AV patents through the 2010s but have converged in recent years, reaching nearly equal levels by 2025."
        insight="AV patent team sizes were historically smaller than non-AV patents but have converged in recent years, reaching parity by 2025 as autonomous driving systems have matured and attracted larger multidisciplinary teams."
        loading={atcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'AV', name: 'AV Patents', color: CHART_COLORS[0] },
            { key: 'Non-AV', name: 'Non-AV Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-av-assignee-type"
        subtitle="Distribution of AV patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Dominate AV Patenting, With Technology Firms Driving Recent Growth"
        caption="Distribution of AV patent assignees by type (corporate, university, government, individual) over time. The data reveal overwhelming corporate dominance, reflecting the capital-intensive nature of autonomous vehicle R&D, which requires extensive testing infrastructure, sensor hardware, and large engineering teams."
        insight="Corporate assignees dominate AV patenting to an even greater degree than in most technology domains, reflecting the substantial capital requirements of autonomous vehicle development -- from testing fleets to simulation infrastructure to regulatory compliance."
        loading={aatL}
        height={500}
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
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The growth in team sizes and corporate dominance in AV patenting reflects the
          substantial resource requirements of autonomous vehicle development. Unlike many
          software-driven technology domains, autonomous driving demands physical testing
          infrastructure, specialized sensor hardware, regulatory engagement, and large
          multidisciplinary teams spanning mechanical engineering, electrical engineering,
          computer science, and safety engineering. The relative absence of university and
          individual inventors among AV patent holders -- more pronounced than in{' '}
          <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">AI patenting</Link>{' '}
          generally -- underscores the capital-intensive nature of this technology domain.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-av-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in autonomous vehicle patenting."
        title="Top-4 Concentration in Autonomous Vehicle Patents Peaked at 14.6% in 2013 and Stabilized Near 12.7% by 2025"
        caption="CR4 computed as the sum of the top 4 organizations' annual patent counts divided by total AV domain patents. The moderate and relatively stable concentration reflects the dual-industry nature of AV innovation, with both automotive incumbents and technology firms contributing significant patent volumes."
        insight="The moderate concentration level distinguishes autonomous vehicles from domains like agricultural technology (CR4 peak 47%) or blockchain (CR4 peak 26%), reflecting the unusually broad competitive landscape spanning traditional automakers and technology firms."
        loading={ootL || pyL}
      >
        <PWLineChart
          data={cr4Data}
          xKey="year"
          lines={[{ key: 'cr4', name: 'Top-4 Share (%)', color: CHART_COLORS[0] }]}
          yLabel="CR4 (%)"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-av-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across autonomous vehicle subfields."
        title="AV Subfield Diversity Increased From 0.82 in 1990 to 0.97 by 2025, Reflecting the Growing Interdisciplinarity of Autonomous Driving"
        caption="Normalized Shannon entropy of AV subfield patent distributions. The increase from 0.82 to 0.97 indicates a shift from predominantly navigation-focused patenting to a balanced distribution across path planning, scene understanding, sensor fusion, and V2X communication."
        insight="The near-maximum entropy value of 0.97 by 2025 suggests that AV innovation has matured into a truly multidisciplinary endeavor requiring simultaneous advances across all subfields, consistent with the systems-level complexity of autonomous driving."
        loading={sfL}
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
        id="fig-av-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed an autonomous vehicle patent."
        title="Later AV Entrants Patent at Higher Velocity: 2010s Cohort Averages 28.6 Patents per Year Versus 15.9 for 1990s Entrants"
        caption="Mean patents per active year for top AV organizations grouped by entry decade. The 1.8x velocity increase reflects the acceleration of AV patenting after Google's self-driving car project (2009) and Tesla's Autopilot development demonstrated commercial viability."
        insight="The velocity increase is consistent with the AV domain's transition from exploratory research to production engineering, with later entrants deploying larger patent teams and benefiting from standardized testing frameworks and regulatory clarity."
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
        Having documented the patent landscape of autonomous vehicles and advanced
        driver-assistance systems, this chapter illustrates how the convergence of AI, sensor
        technology, and automotive engineering has created one of the most dynamic and
        capital-intensive innovation races in the modern patent system. The organizational
        strategies behind AV patenting are explored further in{' '}
        <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>,
        while the AI foundations that underpin autonomous driving are examined in the{' '}
        <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Artificial Intelligence</Link> chapter.
      </Narrative>

      <ChartContainer
        id="fig-av-filing-vs-grant"
        title="AV Filings Peaked at 5,260 in 2019 While Grants Reached 5,300 in 2024 — a 5-Year Examination Lag"
        subtitle="Annual patent filings versus grants for autonomous vehicles, showing the filing-to-grant pipeline."
        caption="Autonomous vehicle patents exhibit a substantial filing-to-grant lag, with filings peaking in 2019 while grants continued rising through 2024. The growing divergence reflects both the technical complexity of AV patent examination and the surge of applications during the 2016-2019 autonomous vehicle investment boom."
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
        learned={["Autonomous vehicle patent velocity rose from 15.9 patents/year (1990s entrants) to 28.6 (2010s entrants), a 1.8-fold increase.", "Subfield diversity reached near-maximum entropy of 0.97 by 2025, indicating that AV innovation now spans virtually all relevant technology domains."]}
        falsifiable="If subfield diversification reflects genuine technology maturation, then AV patents spanning more subfields should correlate with higher citation impact."
        nextAnalysis={{ label: "Biotechnology", description: "From recombinant DNA to CRISPR — engineering life at the molecular level", href: "/chapters/biotechnology" }}
      />

      <DataNote>
        AV patents are identified using CPC classifications: G05D1 (control of position,
        course, or altitude of land, water, air, or space vehicles), B60W (conjoint control
        of vehicle sub-units), and G08G (traffic control systems). A patent is classified as
        AV-related if any of its CPC codes fall within these categories. Subfield
        classifications are based on more specific CPC group codes: Autonomous Driving Systems
        encompasses core self-driving architectures, Vehicle Control covers steering, braking,
        and acceleration algorithms, Navigation &amp; Path Planning addresses route optimization
        and decision-making, and Scene Understanding captures computer vision applied to driving
        environments. AV patenting strategies show patent counts per AV sub-area for the top
        assignees. The diffusion analysis measures co-occurrence of AV CPC codes with other CPC
        sections. Source: PatentsView / USPTO.
      </DataNote>

      <RelatedChapters currentChapter={26} />
      <ChapterNavigation currentChapter={26} />
    </div>
  );
}
