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
import { CHART_COLORS, AGTECH_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { CPC_SECTION_COLORS } from '@/lib/colors';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { AGTECH_EVENTS } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
  DomainEntrantIncumbent, DomainQualityBifurcation,
  Act6DomainFilingVsGrant,
} from '@/lib/types';

export default function Chapter12() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('agtech/agtech_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('agtech/agtech_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('agtech/agtech_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('agtech/agtech_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('agtech/agtech_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('agtech/agtech_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('agtech/agtech_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('agtech/agtech_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('agtech/agtech_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('agtech/agtech_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('agtech/agtech_assignee_type.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('agtech/agtech_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('agtech/agtech_quality_bifurcation.json');
  const { data: filingVsGrant, loading: fgL } = useChapterData<Act6DomainFilingVsGrant[]>('act6/act6_domain_filing_vs_grant.json');

  // Pivot entrant/incumbent data
  const eiPivot = useMemo(() => {
    if (!entrantIncumbent) return [];
    return entrantIncumbent.map((d) => ({ year: d.year, Entrant: d.entrant_count, Incumbent: d.incumbent_count }));
  }, [entrantIncumbent]);

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
    if (!strategies) return [];
    const orgs = [...new Set(strategies.map(d => d.organization))];
    return orgs.map(org => ({
      organization: org,
      subfields: strategies.filter(d => d.organization === org).sort((a, b) => b.patent_count - a.patent_count),
    })).sort((a, b) => {
      const aTotal = a.subfields.reduce((s, d) => s + d.patent_count, 0);
      const bTotal = b.subfields.reduce((s, d) => s + d.patent_count, 0);
      return bTotal - aTotal;
    });
  }, [strategies]);

  const { diffusionPivot, diffusionSections } = useMemo(() => {
    if (!diffusion) return { diffusionPivot: [], diffusionSections: [] };
    const sections = [...new Set(diffusion.map(d => d.section))].sort();
    const years = [...new Set(diffusion.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      diffusion.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.pct_of_domain;
      });
      return row;
    });
    return { diffusionPivot: pivoted, diffusionSections: sections };
  }, [diffusion]);

  const teamComparisonPivot = useMemo(() => {
    if (!teamComparison) return [];
    const years = [...new Set(teamComparison.map(d => d.year))].sort();
    return years.map(year => {
      const row: Record<string, unknown> = { year };
      teamComparison.filter(d => d.year === year).forEach(d => {
        row[d.category] = d.avg_team_size;
      });
      return row;
    });
  }, [teamComparison]);

  const { assigneeTypePivot, assigneeTypeNames } = useMemo(() => {
    if (!assigneeType) return { assigneeTypePivot: [], assigneeTypeNames: [] };
    const categories = [...new Set(assigneeType.map(d => d.assignee_category))];
    const years = [...new Set(assigneeType.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      assigneeType.filter(d => d.year === year).forEach(d => {
        row[d.assignee_category] = d.count;
      });
      return row;
    });
    return { assigneeTypePivot: pivoted, assigneeTypeNames: categories };
  }, [assigneeType]);

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
    const filing = filingVsGrant.filter((d) => d.domain === 'AgTech' && d.series === 'filing_year');
    const grant = filingVsGrant.filter((d) => d.domain === 'AgTech' && d.series === 'grant_year');
    const filingMap = Object.fromEntries(filing.map((d) => [d.year, d.count]));
    const grantMap = Object.fromEntries(grant.map((d) => [d.year, d.count]));
    const years = [...new Set([...filing.map((d) => d.year), ...grant.map((d) => d.year)])].sort();
    return years.map((year) => ({ year, filings: filingMap[year] ?? 0, grants: grantMap[year] ?? 0 }));
  }, [filingVsGrant]);

  return (
    <div>
      <ChapterHeader
        number={24}
        title="Agricultural Technology"
        subtitle="Innovation feeding a growing world"
      />
      <MeasurementSidebar slug="agricultural-technology" />

      <KeyFindings>
        <li>Agricultural technology patenting reflects one of the oldest areas of continuous innovation in the US patent system, with soil working, planting, and horticulture patents tracing back to the earliest decades of patent records.</li>
        <li>Horticulture and forestry and plant breeding dominate patent volume, while precision agriculture -- though still small in absolute terms -- is among the fastest-growing subfields, driven by GPS, sensors, and AI integration.</li>
        <li>A small number of major agribusiness firms -- Pioneer Hi-Bred, Monsanto, Deere &amp; Company, and Syngenta -- dominate agricultural patent portfolios, reflecting the capital-intensive nature of agricultural R&amp;D.</li>
        <li>Recent patent activity in drought-resistant crops, sustainable farming methods, and resource-efficient technologies is associated with increasing focus on climate resilience.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Agriculture is one of the oldest areas of innovation in the patent system, yet it remains one of the most dynamic. The trajectory of agricultural technology patents reveals a sector undergoing a fundamental transformation -- from the mechanization-era patents for soil working and planting equipment that dominated the twentieth century to the precision agriculture, biotechnology, and data-driven farming technologies that define the twenty-first. The adoption of genetically modified crops beginning in 1996 marked a substantial structural change, shifting the center of agricultural innovation from mechanical engineering to molecular biology and plant science. Today, the convergence of GPS, remote sensing, machine learning, and genomics is creating a new generation of agricultural patents that bridge traditional farming with digital technology. The organizational landscape is led by Pioneer Hi-Bred and Monsanto in seed and plant science, alongside Deere &amp; Company in agricultural equipment, with patent strategies explored further in <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/3d-printing" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">3D printing</Link> and the role of patent expirations in democratizing manufacturing technology, this chapter turns to agricultural technology, a domain where biological and digital innovations are reshaping food production through precision agriculture and biotechnology.
        </p>
        <p>
          Agriculture is one of the oldest areas of innovation in the United States patent
          system. From the earliest mechanical plows and seed drills to modern precision
          farming platforms, <StatCallout value="agricultural technology patents" /> trace
          the arc of how humanity feeds itself. This chapter examines the evolution of
          agricultural patenting -- from traditional mechanization through the biotechnology
          revolution to the emerging era of data-driven farming.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Agricultural patent activity serves as a lens into the modernization of food
          production. The shift from mechanical to biological and digital innovation reflects
          broader transformations in how agricultural research is conducted, who conducts it,
          and what problems it seeks to solve -- from increasing yield through mechanization
          to optimizing resource use through precision agriculture and developing climate-resilient
          crops through biotechnology.
        </p>
      </KeyInsight>

      {/* ── Section 1: Growth Trajectory ── */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-agtech-annual-count"
        subtitle="Annual count of utility patents classified under agricultural technology CPC codes, tracking the growth trajectory of agricultural patenting."
        title="Agricultural Patent Filings Reflect Steady Growth With Accelerations Following GM Crop Adoption and the Precision Agriculture Expansion"
        caption="Annual count and share of utility patents classified under agricultural technology CPC codes, 1976-2025. The data reveal sustained growth with notable accelerations following the introduction of genetically modified crops in 1996 and the precision agriculture expansion accelerating markedly from 2018. Grant year shown. Application dates are typically 2–3 years earlier."
        insight="Agricultural patent growth reflects the sector's ongoing transformation from mechanization to biotechnology and digital farming, with each technological wave generating new categories of inventive activity."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'AgTech Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={AGTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Agricultural patent filings exhibit long-term growth with notable shifts
          around major technological developments. The introduction of genetically modified crops in
          1996 coincided with increased plant breeding and biocide-related patents, while the
          precision agriculture expansion accelerating from 2018 is associated with increased GPS, sensor,
          and data-analytics patent activity. These successive waves
          reflect the sector&apos;s capacity to absorb innovations from adjacent fields --
          molecular biology, electronics, and computing -- and adapt them to the specific
          challenges of food production.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-agtech-share"
        subtitle="Agricultural patents as a percentage of all utility patents, showing the evolving allocation of inventive effort toward agricultural technologies."
        title="Agricultural Technology's Share of Total Patents Has Fluctuated, Reflecting Shifting R&D Priorities Across Decades"
        caption="Percentage of all utility patents classified under agricultural technology CPC codes. Fluctuations in share reflect both changes in agricultural R&D investment and the growth of other technology sectors that expand the overall patent base."
        insight="The share of agricultural patents reveals how agricultural innovation competes for attention with other technology domains, with periods of relative growth often coinciding with major policy or scientific breakthroughs."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'AgTech Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={AGTECH_EVENTS}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-agtech-entrant-incumbent"
        title="Agricultural Technology Patenting Shows Steady Incumbent Dominance With Gradual Entrant Growth"
        subtitle="Annual patent counts decomposed by entrants (first patent in domain that year) versus incumbents."
        caption="Entrants are assignees filing their first agricultural technology patent in a given year. Incumbents had at least one prior-year patent. Grant year shown."
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

      {/* ── Section 2: Subfields ── */}
      <SectionDivider label="Agricultural Subfields" />

      <ChartContainer
        id="fig-agtech-subfields"
        subtitle="Patent counts by agricultural subfield (soil working, planting, horticulture, plant breeding, precision agriculture) over time."
        title="Horticulture & Forestry and Plant Breeding Dominate Volume, While Precision Agriculture Emerges as the Fastest-Growing Subfield"
        caption="Patent counts by agricultural subfield over time. Horticulture and forestry and plant breeding account for the largest share of agricultural patents, reflecting their breadth and commercial importance. Precision agriculture, though smaller in absolute terms, has exhibited rapid growth since 2012."
        insight="The subfield composition reveals agriculture's dual nature: a mature sector with deep roots in mechanical innovation and a frontier domain where digital technologies are creating entirely new categories of invention."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: AGTECH_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={AGTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of agricultural patents reflects the sector&apos;s layered history.
          Soil working and planting patents -- the legacy of the mechanization era -- remain
          substantial but have plateaued. Horticulture and forestry patents, encompassing
          greenhouse technologies, irrigation systems, and tree cultivation, represent the
          largest subfield by volume. Plant breeding and biocides have grown substantially
          since the adoption of genetically modified crops in 1996. Precision agriculture (G06Q50/02) -- encompassing GPS-guided equipment, sensor
          networks, variable-rate application, and AI-driven crop management -- remains small
          in absolute terms but is among the fastest-growing subfields, signaling a
          technological transition that may fundamentally reshape agricultural innovation.
        </p>
      </KeyInsight>

      {/* ── Section 3: Organizations ── */}
      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-agtech-top-assignees"
        subtitle="Organizations ranked by total agricultural technology patent count, showing concentration among major agribusiness firms."
        title="Pioneer Hi-Bred, Monsanto, and Deere & Company Lead in AgTech Patent Volume"
        caption="Organizations ranked by total agricultural technology patents. The data indicate a concentration among large agribusiness firms with vertically integrated operations spanning equipment manufacturing, seed development, and crop protection chemicals."
        insight="The dominance of a small number of major agribusiness firms reflects the capital-intensive nature of agricultural R&D, which requires long development cycles, regulatory approvals, and extensive field testing."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'AgTech Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top agricultural patent holders as a data table"
        headers={['Organization', 'AgTech Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by agricultural technology patent count. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Agricultural patent leadership reveals a sector dominated by seed science and
          equipment manufacturing firms. Pioneer Hi-Bred and Monsanto
          Technology lead in total agricultural patent volume, reflecting the substantial
          scale of investment in plant breeding and genetically modified seed development.
          Deere &amp; Company (1,805) follows through its deep portfolio in agricultural
          equipment and, increasingly, precision agriculture technologies. CNH Industrial
          and Seminis Vegetable Seeds round out the top five. The presence of both equipment
          manufacturers and life science companies at the top of the rankings reflects the
          dual nature of agricultural innovation: mechanical and biological. The Monsanto-Bayer
          merger in 2018 consolidated substantial agricultural patent portfolios, a pattern
          of industry consolidation that has reshaped the competitive landscape.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-agtech-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by agricultural patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="Organizational Rankings Reveal Shifting Competitive Dynamics as Consolidation Reshapes the Agricultural Patent Landscape"
          caption="Annual ranking of the top 15 organizations by agricultural patent grants, 2000-2025. Darker cells indicate higher rank (more patents). The data reveal the effects of industry consolidation, with mergers and acquisitions reshaping rankings over time."
          insight="The rank heatmap captures how mergers and strategic R&D investments have reshaped agricultural patent leadership, with Deere's sustained dominance contrasting with the turbulence caused by consolidation among seed and chemical companies."
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
          The ranking data illustrate the effects of industry consolidation on agricultural
          patent leadership. Pioneer Hi-Bred and Monsanto have maintained dominant positions
          through sustained investment in seed science and plant breeding, while Deere &amp;
          Company has held a consistent top-tier position through investment in both mechanical
          and digital agricultural technologies. The merger activity among seed and chemical
          companies -- including Dow-DuPont, ChemChina-Syngenta, and Bayer-Monsanto -- has
          reshaped the competitive landscape, concentrating patent portfolios among fewer but
          larger entities. While some technology companies appear in the broader rankings,
          their agricultural patent volumes remain modest compared to the dominant agribusiness
          firms.
        </p>
      </KeyInsight>

      {/* ── Section 4: Inventors ── */}
      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-agtech-top-inventors"
        subtitle="Primary inventors ranked by total agricultural technology patent count, illustrating the distribution of individual inventive output."
        title="The Most Prolific Agricultural Inventors Are Concentrated in Plant Breeding, Equipment Design, and Precision Agriculture"
        caption="Primary inventors ranked by total agricultural technology patents. The distribution reflects the specialized nature of agricultural innovation, with prolific inventors typically associated with major agribusiness firms and concentrated in specific subfields."
        insight="The concentration of agricultural patents among a small number of prolific inventors reflects the specialized expertise required for plant breeding, equipment engineering, and precision agriculture systems."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'AgTech Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific agricultural inventors are typically affiliated with major
          agribusiness firms and specialize in specific subfields. Plant breeders at seed
          companies, mechanical engineers at equipment manufacturers, and precision agriculture
          specialists account for a disproportionate share of total agricultural patent output.
          The concentration of inventive activity among a relatively small cohort reflects the
          specialized expertise and long development cycles characteristic of agricultural
          innovation, where a single seed variety or equipment design may require years of
          field testing before patent filing.
        </p>
      </KeyInsight>

      {/* ── Section 5: Geography ── */}
      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-agtech-by-country"
        subtitle="Countries ranked by total agricultural technology patents based on primary inventor location, showing geographic distribution of agricultural innovation."
        title="The United States Leads in Agricultural Patent Volume, Followed by Major Agricultural Economies in Europe and Asia"
        caption="Countries ranked by total agricultural technology patents based on primary inventor location. The United States maintains a substantial lead, while the presence of European and Asian agricultural economies reflects the global nature of food production challenges."
        insight="The geographic distribution of agricultural patents mirrors the global structure of agribusiness, with major patent-holding countries corresponding to nations with large agricultural sectors and established agrochemical and seed industries."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'AgTech Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of agricultural patents reflects the global structure
          of agribusiness. The United States leads, driven by the concentration of major
          agricultural equipment manufacturers, seed companies, and agrochemical firms.
          Canada ranks as a prominent contributor, reflecting its substantial agricultural
          sector and agribusiness R&amp;D activity. Germany and the Netherlands hold notable
          portfolios through agricultural equipment and seed companies, while Japan&apos;s
          presence reflects its investment in agricultural machinery and controlled-environment
          agriculture. The geographic patterns indicate that agricultural patent leadership
          correlates closely with the presence of large agribusiness firms and major
          agricultural economies rather than with any single factor alone.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-agtech-by-state"
        subtitle="US states ranked by total agricultural technology patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="Agricultural Patent Activity Clusters in States With Major Agribusiness Headquarters and Agricultural Research Universities"
        caption="US states ranked by total agricultural technology patents based on primary inventor location. The clustering pattern reflects the location of major agribusiness corporate headquarters and land-grant universities with agricultural research programs."
        insight="Unlike technology patents, which concentrate in coastal hubs, agricultural patents reflect the location of agribusiness headquarters and land-grant universities, creating a distinctive geography of innovation."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'AgTech Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, agricultural patent activity exhibits a distinctive
          geographic pattern that differs substantially from technology patents. Rather than
          concentrating in coastal technology hubs, agricultural patents cluster in states
          with major agribusiness headquarters. Iowa and Illinois lead, reflecting the presence of major seed
          companies and agricultural equipment manufacturers, followed by California and other states
          with significant agricultural sectors.
          This pattern reflects the importance of proximity to agricultural production, field
          testing infrastructure, and the legacy of the Morrill Act&apos;s land-grant
          university system in shaping agricultural R&amp;D capacity.
        </p>
      </KeyInsight>

      {/* ── Section 6: Quality Indicators ── */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-agtech-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for agricultural patents by year, measuring quality trends."
        title="Agricultural Patent Quality Indicators Reveal Growing Complexity and Interdisciplinarity, Particularly Since the Precision Agriculture Era"
        caption="Average claims, backward citations, and technology scope for agricultural patents by year. The upward trend in technology scope reflects the increasing interdisciplinarity of agricultural innovation as digital, biological, and mechanical technologies converge."
        insight="Rising technology scope in agricultural patents signals the convergence of previously distinct technology domains -- mechanical engineering, biology, and computing -- within a single class of inventions."
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
          referenceLines={AGTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Agricultural patent quality indicators reveal an increasingly complex and
          interdisciplinary inventive landscape. The growth in technology scope --
          measuring the number of distinct <GlossaryTooltip term="CPC">CPC</GlossaryTooltip>{' '}
          subclasses per patent -- reflects the convergence of mechanical, biological, and
          digital technologies within agricultural inventions. A modern precision agriculture
          patent may simultaneously reference soil science, GPS navigation, sensor technology,
          and data analytics, a breadth that earlier agricultural patents, typically confined
          to mechanical engineering, did not exhibit.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-agtech-quality-bifurcation"
        title="Agricultural Technology Maintained Stable Top-Decile Citation Share Over Time"
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

      {/* ── Section 7: Patenting Strategies ── */}
      <SectionDivider label="AgTech Patenting Strategies" />
      <Narrative>
        <p>
          The leading agricultural patent holders pursue distinct strategies that reflect
          their positions in the agricultural value chain. Equipment manufacturers concentrate
          on soil working, planting, and precision agriculture, while life science companies
          focus on plant breeding and crop protection. Comparing subfield portfolios across
          major holders reveals where each organization concentrates its inventive effort
          and identifies emerging areas of competitive overlap.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total AgTech Patents</th>
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
          The strategy table reveals the distinct competitive positions of agricultural
          patent leaders. Pioneer Hi-Bred&apos;s portfolio is concentrated in plant breeding
          and horticulture, reflecting its heritage as the leading hybrid seed company.
          Monsanto&apos;s portfolio bridges seed genetics and herbicide tolerance -- a dual
          strategy that has been central to the genetically modified crop business model.
          Deere &amp; Company&apos;s portfolio spans soil working, planting, and precision
          agriculture, reflecting its evolution from a traditional equipment manufacturer
          to a technology-driven agricultural platform. The growing overlap between equipment
          and life science companies in precision agriculture suggests an emerging area of
          competitive convergence.
        </p>
      </KeyInsight>

      {/* ── Section 8: Cross-Domain Diffusion ── */}
      <SectionDivider label="Agricultural Technology Diffusion" />
      <Narrative>
        <p>
          Agricultural innovation increasingly draws on technologies from other sectors.
          By tracking how frequently agricultural patents also carry CPC codes from non-agricultural
          technology areas, it is possible to measure the diffusion of digital, chemical, and
          mechanical innovations into farming. This cross-domain flow reflects agriculture&apos;s
          growing integration with the broader technology landscape.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-agtech-diffusion"
        subtitle="Percentage of agricultural patents co-classified with non-agricultural CPC sections, measuring technology diffusion into farming."
        title="Agricultural Patents Show Dominant Co-Classification With Physics, Followed by Chemistry, Reflecting Cross-Domain Convergence"
        caption="Percentage of agricultural patents that also carry CPC codes from each non-agricultural section. Rising lines indicate growing technology convergence. The most notable pattern is the dominant co-occurrence with Physics (Section G, encompassing sensors, data processing, and computing), followed by Chemistry (Section C, encompassing crop protection and biochemistry)."
        insight="The cross-domain diffusion of agricultural patents reveals how farming is becoming a technology-integration challenge, where innovations in chemistry, computing, and engineering converge in the field."
        loading={diffL}
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
            yLabel="% of AgTech Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={AGTECH_EVENTS}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Agricultural patents increasingly exhibit cross-domain characteristics. Physics
          (Section G) is the dominant co-occurring section, reaching nearly 29% of agricultural
          patents in recent years, reflecting the deep incorporation of sensors, data processing,
          computing technologies, and optical systems into agricultural systems -- a trend that
          has accelerated with the precision agriculture movement. Chemistry (Section C) is
          the second most prominent co-occurring section, reflecting the integration of crop
          protection chemicals and fertilizer technology with agricultural invention. The
          connection to Human Necessities (Section A) encompasses food processing and animal
          husbandry technologies that extend the agricultural value chain beyond the farm gate.
          Collectively, these patterns indicate that agricultural technology is evolving from
          a self-contained domain into a nexus of cross-disciplinary innovation.
        </p>
      </KeyInsight>

      {/* ── Section 9: Team Comparison ── */}
      <SectionDivider label="Team Size: AgTech versus Non-AgTech" />

      <Narrative>
        <p>
          Agricultural patents have involved growing inventor teams over time, though they
          remain consistently smaller than non-agricultural patent teams. Comparing team sizes
          between agricultural and non-agricultural patents reveals that agricultural innovation,
          while becoming more collaborative, has not yet reached the team sizes typical of other
          technology domains.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-agtech-team-comparison"
        subtitle="Average inventors per patent for AgTech versus non-AgTech utility patents by year, comparing collaborative intensity."
        title="Agricultural Patent Teams Remain Smaller Than Non-AgTech Averages but Are Gradually Converging"
        caption="Average number of inventors per patent for agricultural versus non-agricultural utility patents, 1976-2025. Agricultural patent teams have consistently been smaller than non-AgTech teams, though the gap has narrowed over time as agricultural innovation becomes increasingly multidisciplinary."
        insight="Agricultural patent teams remain consistently smaller than non-AgTech averages, reflecting the sector's historical roots in individual mechanical invention, though the gap is narrowing as precision agriculture and biotechnology demand larger collaborative teams."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'AgTech', name: 'AgTech Patents', color: CHART_COLORS[0] },
            { key: 'Non-AgTech', name: 'Non-AgTech Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      {/* ── Section 10: Assignee Type ── */}
      <ChartContainer
        id="fig-agtech-assignee-type"
        subtitle="Distribution of agricultural patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Dominate Agricultural Patenting, With University and Government Contributions Reflecting the Land-Grant Legacy"
        caption="Distribution of agricultural patent assignees by type over time. Corporate assignees dominate, but the presence of universities and government entities reflects the enduring role of the land-grant university system and public agricultural research institutions."
        insight="The assignee type distribution reveals the public-private structure of agricultural R&D, where corporate investment in commercial technologies is complemented by university and government contributions to fundamental crop science and sustainable farming practices."
        loading={atL}
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
          The assignee type distribution for agricultural patents differs from many other
          technology domains in a noteworthy respect: the sustained presence of universities
          and government entities. This pattern reflects the legacy of the land-grant
          university system established by the Morrill Act of 1862 and the ongoing role of
          the United States Department of Agriculture and state agricultural experiment
          stations in agricultural research. While corporate assignees dominate overall
          volume -- particularly in commercially valuable areas such as seed genetics and
          crop protection -- public institutions continue to contribute fundamental research
          in soil science, sustainable farming, and crop adaptation to changing climate
          conditions.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-agtech-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in agricultural technology patenting."
        title="Top-4 Concentration in Agricultural Technology Patents Peaked at 46.7% in 2014 Before Declining to 32.8% by 2025"
        caption="CR4 (four-firm concentration ratio) computed as the sum of the top 4 organizations' annual patent counts divided by total domain patents. The 2014 peak reflects the dominance of large agricultural conglomerates. Concentration has decreased modestly as biotechnology and precision agriculture attracted new entrants."
        insight="Agricultural technology exhibits the highest peak organizational concentration among ACT 6 domains, consistent with the capital-intensive nature of agricultural R&amp;D and the dominance of vertically integrated seed and agrochemical firms."
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
        id="fig-agtech-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across agricultural technology subfields."
        title="Agricultural Technology Subfield Diversity Increased From 0.73 in 1976 to 0.92 by 2025, Reflecting Broadening Innovation"
        caption="Normalized Shannon entropy of subfield patent distributions. The steady increase from 0.73 to above 0.90 indicates that agricultural patenting has diversified from a narrow base of plant genetics into precision agriculture, soil science, and agricultural biotechnology."
        insight="The diversification trajectory is consistent with the agricultural sector's transition from chemical-intensive to data-driven farming, with new subfields emerging around sensors, automation, and genetic engineering."
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
        id="fig-agtech-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed an agricultural technology patent."
        title="Later Entrants to Agricultural Technology Patent at Higher Annual Velocity: 2000s Cohort Averages 32.9 Patents per Year Versus 7.4 for 1970s Entrants"
        caption="Mean patents per active year for top organizations grouped by entry decade. Only cohorts with three or more organizations are shown. The 4.4x velocity increase from 1970s to 2000s entrants suggests the domain has become significantly more accessible to productive patenting."
        insight="The rising velocity across cohorts is consistent with agricultural technology maturing as a patenting domain, with standardized CPC classifications and established prior art facilitating faster patent prosecution for later entrants."
        loading={taL}
      >
        <PWBarChart
          data={velocityData}
          xKey="decade"
          bars={[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]}
          yLabel="Mean Patents / Year"
        />
      </ChartContainer>

      {/* ── Section 11: Closing Narrative ── */}
      <Narrative>
        <p>
          Agricultural technology patenting reveals a sector at a crossroads. The
          mechanization legacy -- soil working and planting patents that trace back to the
          earliest decades of the patent system -- continues to evolve, but the center of
          gravity is shifting toward biological and digital technologies. Climate change is
          driving renewed urgency in drought-resistant crop development, water-efficient
          irrigation, and sustainable farming practices. The convergence of precision
          agriculture with <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link> and <Link href="/chapters/biotechnology" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">biotechnology</Link> suggests that
          future agricultural patents will increasingly bridge the farm, the laboratory, and the data center, reflecting a convergence of precision agriculture, biotechnology, and data science.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-agtech-filing-vs-grant"
        title="AgTech Filings Peaked in 2019 at 3,351 While Grants Peaked at 2,980 in 2020 — the Tightest Lag Among ACT 6 Domains"
        subtitle="Annual patent filings versus grants for agricultural technology, showing the filing-to-grant pipeline."
        caption="Agricultural technology exhibits one of the tightest filing-to-grant lags among ACT 6 domains, with grant peaks closely following filing peaks. This pattern reflects relatively shorter examination times for agricultural patents compared to software-heavy domains."
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
        learned={["Agricultural technology patent velocity nearly quadrupled from 7.4 patents per year (1970s entrants) to 32.9 (2000s entrants), driven by the precision agriculture revolution.", "Top-four concentration declined from 46.7% in 2014 to 32.8% by 2025, reflecting broader entry into agricultural innovation."]}
        falsifiable="If precision agriculture drove the velocity increase, then patents in GPS/sensor subclasses should show faster growth than traditional agricultural chemistry patents."
        nextAnalysis={{ label: "Artificial Intelligence", description: "AI patenting from expert systems to deep learning — the fastest-growing technology domain", href: "/chapters/ai-patents" }}
      />

      <DataNote>
        Agricultural technology patents are identified using CPC classifications for soil
        working (A01B), planting and sowing (A01C), horticulture and forestry (A01G), plant
        breeding and biocides (A01H, A01N), and precision agriculture (G06Q50/02). A patent
        is classified as agricultural technology if any of its CPC codes fall within these
        categories. Subfield classifications are based on primary CPC group codes. The
        strategy table shows patent counts per agricultural sub-area for the top assignees.
        Cross-domain diffusion measures co-occurrence of agricultural CPC codes with other
        CPC sections. Team comparison uses the categories &quot;AgTech&quot; and
        &quot;Non-AgTech&quot; based on patent classification.
      </DataNote>

      <RelatedChapters currentChapter={24} />
      <ChapterNavigation currentChapter={24} />
    </div>
  );
}
