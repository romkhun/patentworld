'use client';

import { useMemo } from 'react';
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
import { CHART_COLORS, CPC_SECTION_COLORS, SEMI_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { SEMI_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { cleanOrgName } from '@/lib/orgNames';
import Link from 'next/link';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainTopInventor, DomainGeography, DomainQuality, DomainOrgOverTime,
  DomainStrategy, DomainDiffusion, DomainTeamComparison, DomainAssigneeType,
  DomainEntrantIncumbent, DomainQualityBifurcation,
  Act6DomainFilingVsGrant,
} from '@/lib/types';

export default function Chapter21() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('semiconductors/semi_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('semiconductors/semi_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('semiconductors/semi_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('semiconductors/semi_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('semiconductors/semi_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('semiconductors/semi_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('semiconductors/semi_org_over_time.json');
  const { data: semiStrategies } = useChapterData<DomainStrategy[]>('semiconductors/semi_strategies.json');
  const { data: semiDiffusion, loading: sdL } = useChapterData<DomainDiffusion[]>('semiconductors/semi_diffusion.json');
  const { data: semiTeam, loading: stcL } = useChapterData<DomainTeamComparison[]>('semiconductors/semi_team_comparison.json');
  const { data: semiAssignType, loading: satL } = useChapterData<DomainAssigneeType[]>('semiconductors/semi_assignee_type.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('semiconductors/semi_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('semiconductors/semi_quality_bifurcation.json');
  const { data: filingVsGrant, loading: fgL } = useChapterData<Act6DomainFilingVsGrant[]>('act6/act6_domain_filing_vs_grant.json');

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

  // Shared short display names for organizations (using centralized cleanOrgName)
  const orgNameMap = useMemo(() => {
    if (!orgOverTime) return {};
    const map: Record<string, string> = {};
    const orgNames = [...new Set(orgOverTime.map((d) => d.organization))];
    orgNames.forEach((org) => {
      map[org] = cleanOrgName(org);
    });
    return map;
  }, [orgOverTime]);

  // Compute rank data for heatmap (from 1990 onward, where semiconductor activity is well-established)
  const orgRankData = useMemo(() => {
    if (!orgOverTime) return [];
    const years = [...new Set(orgOverTime.map((d) => d.year))].sort().filter((y) => y >= 1990);
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
    if (!semiStrategies) return [];
    const orgs = [...new Set(semiStrategies.map(d => d.organization))];
    return orgs.map(org => ({
      organization: org,
      subfields: semiStrategies.filter(d => d.organization === org).sort((a, b) => b.patent_count - a.patent_count),
    })).sort((a, b) => {
      const aTotal = a.subfields.reduce((s, d) => s + d.patent_count, 0);
      const bTotal = b.subfields.reduce((s, d) => s + d.patent_count, 0);
      return bTotal - aTotal;
    });
  }, [semiStrategies]);

  const { diffusionPivot, diffusionSections } = useMemo(() => {
    if (!semiDiffusion) return { diffusionPivot: [], diffusionSections: [] };
    const sections = [...new Set(semiDiffusion.map(d => d.section))].sort();
    const years = [...new Set(semiDiffusion.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      semiDiffusion.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.pct_of_domain;
      });
      return row;
    });
    return { diffusionPivot: pivoted, diffusionSections: sections };
  }, [semiDiffusion]);

  const teamComparisonPivot = useMemo(() => {
    if (!semiTeam) return [];
    const years = [...new Set(semiTeam.map(d => d.year))].sort();
    return years.map(year => {
      const row: Record<string, unknown> = { year };
      semiTeam.filter(d => d.year === year).forEach(d => {
        row[d.category] = d.avg_team_size;
      });
      return row;
    });
  }, [semiTeam]);

  const { assigneeTypePivot, assigneeTypeNames } = useMemo(() => {
    if (!semiAssignType) return { assigneeTypePivot: [], assigneeTypeNames: [] };
    const categories = [...new Set(semiAssignType.map(d => d.assignee_category))];
    const years = [...new Set(semiAssignType.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      semiAssignType.filter(d => d.year === year).forEach(d => {
        row[d.assignee_category] = d.count;
      });
      return row;
    });
    return { assigneeTypePivot: pivoted, assigneeTypeNames: categories };
  }, [semiAssignType]);

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
    const filing = filingVsGrant.filter((d) => d.domain === 'Semiconductor' && d.series === 'filing_year');
    const grant = filingVsGrant.filter((d) => d.domain === 'Semiconductor' && d.series === 'grant_year');
    const filingMap = Object.fromEntries(filing.map((d) => [d.year, d.count]));
    const grantMap = Object.fromEntries(grant.map((d) => [d.year, d.count]));
    const years = [...new Set([...filing.map((d) => d.year), ...grant.map((d) => d.year)])].sort();
    return years.map((year) => ({ year, filings: filingMap[year] ?? 0, grants: grantMap[year] ?? 0 }));
  }, [filingVsGrant]);

  return (
    <div>
      <ChapterHeader
        number={33}
        title="Semiconductors"
        subtitle="The silicon foundation of modern technology"
      />
      <MeasurementSidebar slug="semiconductors" />

      <KeyFindings>
        <li>Semiconductor patents are among the most heavily filed in the US patent system, with CPC class H01L representing one of the single largest concentrations of patenting activity across all technology domains.</li>
        <li>Manufacturing processes and semiconductor devices account for the majority of semiconductor patent filings, reflecting the capital-intensive nature of fabrication and the competitive dynamics of chip architecture.</li>
        <li>East Asian firms -- Samsung and TSMC -- have emerged as dominant patent holders alongside US-based incumbents such as IBM and Micron, illustrating the global nature of semiconductor competition.</li>
        <li>Organic semiconductors and packaging and interconnects represent rapidly growing subfields within semiconductor patenting, reflecting the industry&apos;s expansion beyond traditional device architectures.</li>
        <li>The CHIPS and Science Act of 2022 represents the most significant US policy intervention in semiconductor manufacturing in decades, with potential implications for the geographic distribution of future patenting activity.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Semiconductors constitute the physical substrate upon which virtually all modern computing, communication, and sensing technologies depend. The trajectory of semiconductor patenting reveals an industry defined by sustained process miniaturization, substantial capital requirements, and growing international competition. What began as a predominantly US-based enterprise has become a globally distributed innovation system, with East Asian firms now holding prominent positions in patent volume across multiple subfields. The passage of the CHIPS Act in 2022 signals a renewed US policy commitment to domestic semiconductor manufacturing -- an intervention whose effects on the geography and composition of semiconductor patenting will unfold over the coming decade. The organizational strategies behind semiconductor patenting are explored further in the company-level analysis of <Link href="/chapters/org-composition/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Assignee Composition</Link>.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/quantum-computing/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">quantum computing</Link> and the emerging competition to build fault-tolerant quantum hardware, this chapter turns to semiconductors, the foundational technology domain whose fabrication expertise underpins both classical and quantum computing.
        </p>
        <p>
          The semiconductor industry occupies a unique position in the modern innovation
          landscape. As the foundational technology enabling computing, telecommunications,
          automotive electronics, and an expanding universe of connected devices, semiconductors
          represent one of the most <StatCallout value="capital-intensive" /> and
          patent-dense fields in the United States patent system. This chapter examines
          the evolution of semiconductor-related patenting -- from the early days of
          discrete transistors and basic integrated circuits through the current era of
          advanced process nodes, 3D packaging, and heterogeneous integration.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Semiconductor patent activity serves as a barometer of technological investment
          in the hardware layer that underpins the entire digital economy. The sustained
          high volume of semiconductor patents reflects both the capital intensity of
          fabrication R&amp;D and the competitive pressure to advance process nodes, improve
          energy efficiency, and develop new device architectures for emerging applications
          such as AI accelerators and power electronics.
        </p>
      </KeyInsight>

      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-semi-patents-annual-count"
        subtitle="Annual count of utility patents classified under semiconductor-related CPC codes (H01L), tracking the growth trajectory of semiconductor patenting."
        title="Semiconductor Patent Filings Reflect Decades of Sustained Investment in Fabrication and Device Innovation"
        caption="Annual count and share of utility patents classified under semiconductor-related CPC codes (H01L), 1976-2025. H01L is one of the most heavily used CPC classes in the entire patent system, corresponding to the substantial R&D investment required to advance semiconductor manufacturing. Grant year shown. Application dates are typically 2–3 years earlier."
        insight="The sustained volume of semiconductor patents corresponds to the continued pace of process node advancement, where each new process node requires billions of dollars in R&D investment and is associated with thousands of patent filings."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Semiconductor Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={filterEvents(SEMI_EVENTS, { only: [2000, 2011, 2022] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Semiconductor patent filings have maintained consistently high volumes over
          several decades, reflecting the sustained capital investment required to push
          the boundaries of transistor density, power efficiency, and manufacturing yield.
          Unlike many technology domains that exhibit sudden exponential growth,
          semiconductor patent volume stabilized at 6-7% of all utility patents after
          rapid growth through the 1990s and 2000s.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-semi-patents-share"
        subtitle="Semiconductor patents as a percentage of all utility patents, showing the evolving weight of semiconductor innovation within the broader patent system."
        title="Semiconductor's Share of Total Patents Reveals the Shifting Weight of Hardware Innovation in the Patent System"
        caption="Percentage of all utility patents classified under semiconductor-related CPC codes. Changes in this share reflect the relative pace of semiconductor innovation compared to the broader patent system, including periods of expansion associated with new device types and periods of relative stability."
        insight="The semiconductor share of total patents captures the evolving balance between hardware and software innovation in the patent system, with fluctuations reflecting both industry cycles and shifts in inventive focus."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Semiconductor Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(SEMI_EVENTS, { only: [2000, 2011, 2022] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-semi-entrant-incumbent"
        title="Semiconductor Patenting Shows Sustained Incumbent Dominance With Limited New Entry"
        subtitle="Annual patent counts decomposed by entrants (first patent in domain that year) versus incumbents."
        caption="Entrants are assignees filing their first semiconductor patent in a given year. Incumbents had at least one prior-year patent. Grant year shown."
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

      <SectionDivider label="Semiconductor Subfields" />

      <ChartContainer
        id="fig-semi-patents-subfields"
        subtitle="Patent counts by semiconductor subfield (manufacturing processes, semiconductor devices, organic semiconductors, and packaging) over time, based on specific CPC group codes within H01L."
        title="Manufacturing Processes and Semiconductor Devices Dominate Semiconductor Patenting, With Organic Semiconductors and Packaging Emerging as Growing Subfields"
        caption="Patent counts by semiconductor subfield over time, based on CPC classifications within H01L. Manufacturing processes and semiconductor devices have historically dominated, while organic semiconductors and packaging and interconnects have grown substantially, reflecting the industry's expansion into new device architectures and advanced packaging techniques."
        insight="The subfield composition reveals the dual nature of semiconductor innovation: sustained investment in core manufacturing processes and semiconductor devices alongside the growth of application-driven subfields such as organic semiconductors and packaging and interconnects."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: SEMI_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={filterEvents(SEMI_EVENTS, { only: [2000, 2011, 2022] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of semiconductor patents reflects the industry&apos;s dual focus
          on advancing core manufacturing capabilities and expanding into new application
          domains. Manufacturing processes -- encompassing lithography, etching, deposition,
          and planarization -- remain the largest subfield, consistent with the substantial
          engineering effort required at each new process node. Semiconductor Devices
          constitutes the second major category. The notable growth in organic semiconductors
          and packaging and interconnects reflects the industry&apos;s expansion into new
          device architectures and advanced integration techniques, demonstrating how
          semiconductor innovation responds to evolving technology requirements.
        </p>
      </KeyInsight>

      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-semi-patents-top-assignees"
        subtitle="Organizations ranked by total semiconductor-related patent count from 1976 to 2025, showing concentration among integrated device manufacturers and foundries."
        title="Samsung, TSMC, and IBM Lead in Total Semiconductor Patent Volume"
        caption="Organizations ranked by total semiconductor-related patents, 1976-2025. The data reveal a mix of East Asian and US-based firms at the top, with integrated device manufacturers, pure-play foundries, and fabless design houses all represented."
        insight="The dominance of both East Asian and US-based firms in semiconductor patenting reflects the globally distributed nature of the semiconductor supply chain, where design, fabrication, and packaging are often performed by different organizations in different countries."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Semiconductor Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top semiconductor patent holders as a data table"
        headers={['Organization', 'Semiconductor Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by semiconductor-related patent count, 1976-2025. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Semiconductor patent leadership reflects the vertically integrated and globally
          distributed nature of the chip industry. Samsung, which operates both memory
          and logic fabrication, maintains a leading position. TSMC, the world&apos;s
          largest pure-play foundry, has built an extensive patent portfolio around
          advanced manufacturing processes. IBM and Micron rank among the largest US-based
          semiconductor patent holders, with IBM emphasizing semiconductor devices and
          Micron focusing on manufacturing processes and memory technology. The presence of Japanese firms (Toshiba,
          Sony) and other Korean firms (SK Hynix, LG) underscores the deeply international
          character of semiconductor competition.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-semi-patents-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by semiconductor patent grants from 1990 to 2025, with darker cells indicating higher rank."
          title="Organizational Rankings in Semiconductor Patents Reveal Shifting Competitive Dynamics Between US and East Asian Firms"
          caption="Annual ranking of the top 15 organizations by semiconductor patent grants, 1990-2025. Darker cells indicate higher rank (more patents). The data reveal the rise of East Asian firms, particularly Samsung and TSMC, alongside the sustained presence of US-based and Japanese incumbents."
          insight="The ranking dynamics reveal a long-term shift in semiconductor patent leadership from US-based and Japanese firms toward Korean and Taiwanese organizations, reflecting the geographic migration of advanced manufacturing capacity."
          loading={ootL}
          height={600}
          flexHeight
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
          The organizational ranking data reveal a long-term shift in semiconductor patent
          leadership. Japanese firms such as Toshiba and Mitsubishi Electric held dominant
          positions through the 1990s and early 2000s, reflecting Japan&apos;s earlier
          prominence in memory manufacturing. The subsequent rise of Samsung and TSMC
          mirrors the broader migration of advanced fabrication capacity to South Korea
          and Taiwan. Intel has maintained a consistently high rank throughout, reflecting
          its sustained investment in both process technology and architecture innovation.
          The emergence of firms like Micron and Applied Materials in the rankings
          highlights the importance of both memory manufacturing and semiconductor
          equipment in the patent landscape.
        </p>
      </KeyInsight>

      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-semi-patents-top-inventors"
        subtitle="Primary inventors ranked by total semiconductor-related patent count from 1976 to 2025, illustrating the skewed distribution of individual output."
        title="The Most Prolific Semiconductor Inventors Hold Hundreds of Patents, Consistent With Deep Specialization in Process and Device Engineering"
        caption="Primary inventors ranked by total semiconductor-related patents, 1976-2025. The distribution exhibits pronounced skewness, with a small number of highly productive individuals accounting for a disproportionate share of total semiconductor patent output."
        insight="The concentration of semiconductor patenting among a small cohort of prolific inventors reflects the deep specialization required in process engineering, device physics, and circuit design -- fields where decades of accumulated expertise translate into sustained inventive productivity."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Semiconductor Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific semiconductor inventors are typically affiliated with major
          integrated device manufacturers or foundries, where sustained investment in
          process R&amp;D creates opportunities for extensive patenting over multi-decade
          careers. The skewed distribution of individual output reflects the deep
          specialization required in semiconductor process engineering and device physics,
          where mastery of specific techniques such as lithography, thin-film deposition,
          or transistor architecture enables repeated inventive contributions at the
          frontier of manufacturing capability.
        </p>
      </KeyInsight>

      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-semi-patents-by-country"
        subtitle="Countries ranked by total semiconductor-related patents based on primary inventor location, showing geographic distribution of semiconductor innovation."
        title="The United States, Japan, South Korea, and Taiwan Account for the Majority of Semiconductor Patents, Consistent With the Geographic Concentration of Fabrication Capacity"
        caption="Countries ranked by total semiconductor-related patents based on primary inventor location. The geographic distribution closely mirrors the location of major fabrication facilities, with the United States, Japan, South Korea, and Taiwan dominating."
        insight="The geographic distribution of semiconductor patents closely tracks the location of advanced fabrication facilities, underscoring the tight coupling between manufacturing presence and patenting activity in this capital-intensive industry."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Semiconductor Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of semiconductor patents reflects the concentration
          of advanced fabrication capacity in a small number of countries. The United States
          maintains a strong position anchored by firms such as IBM, Micron, and
          Intel, as well as the research operations of foreign firms on US soil. Japan&apos;s
          substantial patent share reflects its historical strength in memory and materials,
          while South Korea and Taiwan&apos;s prominence corresponds directly to the
          manufacturing operations of Samsung, SK Hynix, and TSMC. The CHIPS Act&apos;s
          incentives for domestic fabrication may alter this geographic distribution in
          the coming years.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-semi-patents-by-state"
        subtitle="US states ranked by total semiconductor-related patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California, New York, and Texas Lead US Semiconductor Patenting"
        caption="US states ranked by total semiconductor-related patents based on primary inventor location. The distribution reflects the location of major fabrication facilities (Oregon, Arizona, Texas) and design centers (California), as well as corporate headquarters and R&D laboratories."
        insight="The state-level distribution of semiconductor patents reflects both fabrication site locations and design center clusters, with California's dominance reflecting its concentration of fabless design firms and corporate R&D laboratories."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Semiconductor Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, semiconductor patenting is concentrated in states that
          host major fabrication facilities and design centers. California leads, driven
          by the concentration of fabless design firms, corporate R&amp;D laboratories, and
          the headquarters of companies such as Intel, Qualcomm, and Applied Materials.
          Texas, Oregon, and Arizona reflect the location of major fabs operated by Intel,
          Samsung, and TSMC. The geographic pattern underscores the importance of physical
          manufacturing infrastructure in shaping local patenting activity -- a dynamic
          that the CHIPS Act aims to expand by incentivizing new fab construction across
          additional states.
        </p>
      </KeyInsight>

      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-semi-patents-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for semiconductor patents by year, measuring quality trends."
        title="Semiconductor Patent Quality Indicators Reveal Growing Complexity and Interdisciplinarity Over Time"
        caption="Average claims, backward citations, and technology scope for semiconductor-related patents by year. The rise-and-fall pattern in backward citations — peaking around 2012 before declining — alongside modest increases in technology scope suggest that semiconductor patents reflect shifting citation practices and growing interconnection with adjacent fields."
        insight="Backward citations peaked around 2012 before declining, consistent with broader shifts in citation practices, while expanding technology scope indicates that semiconductor innovation is becoming more interconnected with adjacent domains, reflecting the industry's shift toward systems-level integration and heterogeneous architectures."
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
          referenceLines={filterEvents(SEMI_EVENTS, { only: [2000, 2011, 2022] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Semiconductor patents exhibit distinctive quality characteristics that reflect the
          engineering complexity of the field. Backward citations rose through the early 2010s
          before declining, a pattern consistent with broader shifts in citation practices, though the
          earlier rise reflected the increasingly dense web of prior art in an industry where
          each new advance builds incrementally on a vast body of existing knowledge. The
          expanding technology scope suggests that semiconductor patents are becoming more
          interdisciplinary -- spanning multiple <GlossaryTooltip term="CPC">CPC</GlossaryTooltip>{' '}
          subclasses as chip technology integrates with packaging, software, and
          systems-level design considerations.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-semi-quality-bifurcation"
        title="Semiconductor Patents Show Declining Top-Decile Citation Share, Consistent With Field Maturation"
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

      <SectionDivider label="Team Composition" />

      <ChartContainer
        id="fig-semi-patents-team-comparison"
        subtitle="Average inventors per patent for semiconductor versus non-semiconductor utility patents by year, showing the complexity gap between the two categories."
        title="Semiconductor Patents Consistently Involve Larger Teams Than Non-Semiconductor Patents, Consistent With the Collaborative Nature of Fab R&D"
        caption="Average number of inventors per patent for semiconductor-related versus non-semiconductor utility patents, 1976-2025. The data indicate that semiconductor patents consistently involve larger teams, reflecting the collaborative, multidisciplinary nature of semiconductor process development."
        insight="Semiconductor patents involve larger inventor teams than non-semiconductor patents, consistent with the multidisciplinary nature of fabrication R&D, which requires expertise in materials science, physics, chemistry, and electrical engineering."
        loading={stcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Semiconductor', name: 'Semiconductor Patents', color: CHART_COLORS[0] },
            { key: 'Non-Semiconductor', name: 'Non-Semiconductor Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The team size comparison reveals that semiconductor patents consistently involve
          more inventors than non-semiconductor patents. This pattern reflects the
          multidisciplinary nature of semiconductor R&amp;D, which requires expertise spanning
          materials science, device physics, process chemistry, electrical engineering, and
          increasingly, software and systems architecture. The persistent gap
          suggests that semiconductor innovation is becoming more collaborative, likely
          reflecting the growing complexity of advanced process nodes and the integration
          of multiple technology layers in modern chip designs.
        </p>
      </KeyInsight>

      <SectionDivider label="Assignee Type Distribution" />

      <ChartContainer
        id="fig-semi-patents-assignee-type"
        subtitle="Distribution of semiconductor patents by assignee type (corporate, university, government, individual) over time, showing the growing corporate share."
        title="Corporate Assignees Overwhelmingly Dominate Semiconductor Patenting, Consistent With the Capital-Intensive Nature of the Industry"
        caption="Distribution of semiconductor patent assignees by type (corporate, university, government, individual) over time. The data reveal that corporate assignees account for the vast majority of semiconductor patents, consistent with the substantial capital requirements of semiconductor fabrication and the central role of corporate R&D laboratories."
        insight="The pronounced corporate dominance in semiconductor patenting reflects the capital-intensive nature of the industry, where building and operating a leading-edge fab requires investments exceeding $20 billion."
        loading={satL}
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
          Corporate assignees account for 99% of semiconductor patents,
          more so than in many other technology domains. This concentration reflects the
          capital-intensive nature of the semiconductor industry, where building a
          leading-edge fabrication facility requires investments exceeding $20 billion.
          University semiconductor patenting peaked in the early 2000s and has since declined;
          what remains is concentrated primarily in emerging areas such as organic semiconductors
          and novel device architectures, but constitutes a small fraction of total activity. The negligible share of individual
          inventors underscores the institutional nature of semiconductor innovation.
        </p>
      </KeyInsight>

      <SectionDivider label="Semiconductor Patenting Strategies" />
      <Narrative>
        <p>
          The leading semiconductor patent holders pursue different strategies,
          shaped by their position in the supply chain. Integrated device manufacturers
          such as Samsung and Intel patent broadly across manufacturing processes, IC design,
          and packaging. Pure-play foundries like TSMC concentrate on process technology.
          Fabless design firms such as Qualcomm focus on circuit architecture and
          system-on-chip innovations. A comparison of subfield portfolios across major
          holders reveals where each organization concentrates its inventive effort.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Semiconductor Patents</th>
              </tr>
            </thead>
            <tbody>
              {strategyOrgs.slice(0, 15).map((org, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium text-sm">{cleanOrgName(org.organization)}</td>
                  <td className="py-2 px-2">
                    {org.subfields.slice(0, 3).map((sf, j) => (
                      <span key={j} className="inline-block mr-2 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {sf.subfield}: {sf.patent_count.toLocaleString('en-US')}
                      </span>
                    ))}
                  </td>
                  <td className="text-right py-2 px-2 font-mono font-semibold">{org.subfields.reduce((s, d) => s + d.patent_count, 0).toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <KeyInsight>
        <p>
          The strategy table reveals clear differentiation among the top semiconductor
          patent holders. Samsung maintains the broadest portfolio, with substantial
          patent counts across organic semiconductors, manufacturing processes, and packaging
          and interconnects. TSMC&apos;s portfolio is heavily concentrated in manufacturing processes,
          consistent with its pure-play foundry model. Intel&apos;s portfolio emphasizes
          packaging and interconnects alongside manufacturing processes and semiconductor
          devices. The growing presence of organic semiconductor patents among firms
          such as LG Display and Samsung highlights the diversification of semiconductor
          innovation beyond traditional computing applications.
        </p>
      </KeyInsight>

      <SectionDivider label="Cross-Domain Diffusion" />
      <Narrative>
        <p>
          Semiconductors, as a foundational technology, are deeply embedded across
          multiple sectors of the economy. By tracking how frequently semiconductor-classified
          patents also carry CPC codes from other technology areas, it is possible to measure
          the integration of semiconductor innovation with computing, telecommunications,
          healthcare devices, and other application domains.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-semi-patents-diffusion"
        subtitle="Percentage of semiconductor patents co-classified with other CPC sections, measuring semiconductor technology's integration across domains."
        title="Semiconductor Patent Co-Classification With Other CPC Sections Reveals Deep Integration Across Computing, Telecommunications, and Manufacturing"
        caption="Percentage of semiconductor patents that also carry CPC codes from other sections. Rising lines indicate growing integration of semiconductor technology with that sector. The pattern reflects the foundational role of semiconductors in enabling innovation across virtually every technology domain."
        insight="The broad co-classification of semiconductor patents across multiple CPC sections confirms the foundational nature of semiconductor technology, which enables and constrains innovation in computing, telecommunications, healthcare, and manufacturing."
        loading={sdL}
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
            yLabel="% of Semiconductor Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={filterEvents(SEMI_EVENTS, { only: [2000, 2011, 2022] })}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          The cross-domain diffusion data are consistent with the foundational nature of semiconductor
          technology. Semiconductor patents exhibit substantial co-classification with
          Physics (G), Chemistry (C), and Performing Operations and Transporting (B),
          reflecting the tight integration of chip technology with measurement, optics,
          materials science, and manufacturing techniques. The presence of co-classification
          with Human Necessities (A) reflects the expanding role of semiconductors in
          medical devices and biosensors. The breadth of semiconductor diffusion across CPC sections
          underscores why disruptions to the semiconductor supply chain -- as experienced
          during the 2020-2021 chip shortage -- have cascading effects across the entire
          economy.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-semi-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in semiconductor patenting."
        title="Top-4 Concentration in Semiconductor Patents Rose From 11.3% in 1977 to 32.6% in 2023, a Sustained Consolidation Trend"
        caption="CR4 computed as the sum of the top 4 organizations' annual patent counts divided by total semiconductor patents. Unlike most ACT 6 domains where concentration declined, semiconductors show sustained consolidation, led by Samsung, TSMC, and other East Asian firms scaling patent portfolios."
        insight="The rising concentration in semiconductors is unique among ACT 6 domains and is consistent with the industry's increasing capital intensity: fabrication facilities now cost $10-20 billion, creating structural barriers that concentrate innovative activity among a diminishing number of firms capable of leading-edge manufacturing."
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
        id="fig-semi-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across semiconductor subfields."
        title="Semiconductor Subfield Diversity Has Remained High and Stable at 0.79-0.95, Consistent With the Industry's Mature Technical Breadth"
        caption="Normalized Shannon entropy (H/ln(N)) ranges from 0 (all activity in one subfield) to 1 (perfectly even distribution). The consistently high values indicate that semiconductor innovation has been broadly distributed across manufacturing processes, device architectures, packaging, organic semiconductors, and testing throughout the study period."
        insight="The stability of semiconductor subfield diversity at high entropy levels is consistent with a mature industry where innovation occurs simultaneously across all technical dimensions, from lithographic processes to packaging and interconnect technologies."
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
        id="fig-semi-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a semiconductor patent."
        title="Semiconductor Patenting Velocity Peaked for 1990s Entrants at 197 Patents per Year, Consistent With the Golden Age of East Asian Fab Investment"
        caption="Mean patents per active year for top semiconductor organizations grouped by entry decade. The 1990s cohort's peak velocity reflects the rapid scaling of Samsung, TSMC, and other East Asian firms that entered semiconductor patenting during the DRAM and foundry expansion era."
        insight="The plateau of velocity at 197 patents per year for both 1990s and 2010s entrants suggests a structural ceiling on organizational patenting capacity in semiconductors, possibly reflecting the finite number of novel process and device innovations achievable per year."
        loading={taL}
      >
        <PWBarChart
          data={velocityData}
          xKey="decade"
          bars={[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]}
          yLabel="Average Patents per Year"
        />
      </ChartContainer>

      <Narrative>
        Having documented the landscape of semiconductor patenting, the analysis
        demonstrates the foundational role of chip technology in the broader innovation
        system. The organizational strategies behind semiconductor portfolios are explored
        further in <Link href="/chapters/org-composition/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Assignee Composition</Link>,
        while the interaction between semiconductor and artificial intelligence patents is
        examined in <Link href="/chapters/ai-patents/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Artificial Intelligence</Link>.
      </Narrative>

      <ChartContainer
        id="fig-semi-filing-vs-grant"
        title="Semiconductor Filings Peaked at 24,463 in 2019 While Grants Reached 22,511 in 2020 — the Shortest Lag Among Large Domains"
        subtitle="Annual patent filings versus grants for semiconductors, showing the mature examination pipeline."
        caption="Semiconductors exhibit the tightest filing-to-grant alignment among large ACT 6 domains, with filing and grant peaks separated by only one year. The alignment reflects the mature and well-established examination processes for semiconductor patents at the USPTO, a domain with decades of prior art and classification history."
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
        learned={["Semiconductor patents uniquely exhibit rising concentration, with top-four share increasing from 11.3% to 32.6% — the only domain showing sustained consolidation.", "Entry velocity plateaued at 197 patents/year for both 1990s and 2010s cohorts, suggesting that scale barriers have stabilized."]}
        falsifiable="If rising concentration reflects genuine scale economies in semiconductor R&D, then smaller firms' citation impact should be declining relative to the top four."
        nextAnalysis={{ label: "Space Technology", description: "Patenting the final frontier — from government-dominated to commercial-driven innovation", href: "/chapters/space-technology" }}
      />

      <DataNote>
        Semiconductor patents are identified using CPC classifications H01L (semiconductor
        devices, processes, and related solid-state technology), H10N (other solid-state
        devices including thermoelectric and piezoelectric), and H10K (organic solid-state
        devices). Together these cover integrated circuits, LEDs, photovoltaic cells,
        thermoelectric devices, and organic semiconductors. A patent is classified as
        semiconductor-related if any of its CPC codes fall within these subclasses.
        Subfield classifications are based on more specific CPC group codes within H01L,
        mapped to broader categories such as Manufacturing Processes, Semiconductor Devices,
        Organic Semiconductors, Packaging &amp; Interconnects, Assemblies &amp; Modules, and
        Other Solid-State Devices. Semiconductor patenting strategies show patent counts
        per subfield for the top assignees. Cross-domain diffusion measures co-occurrence
        of semiconductor CPC codes with other CPC sections (Section H excluded since it
        contains the core semiconductor classifications).
      </DataNote>

      <RelatedChapters currentChapter={33} />
      <ChapterNavigation currentChapter={33} />
    </div>
  );
}
