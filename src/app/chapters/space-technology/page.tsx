'use client';

import { useMemo } from 'react';
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
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { RankingTable } from '@/components/chapter/RankingTable';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import Link from 'next/link';
import { cleanOrgName } from '@/lib/orgNames';
import { CHART_COLORS, CPC_SECTION_COLORS, SPACE_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { SPACE_EVENTS } from '@/lib/referenceEvents';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
} from '@/lib/types';

export default function Chapter22() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('space/space_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('space/space_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('space/space_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('space/space_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('space/space_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('space/space_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('space/space_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('space/space_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('space/space_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('space/space_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('space/space_assignee_type.json');

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

  return (
    <div>
      <ChapterHeader
        number={34}
        title="Space Technology"
        subtitle="Patenting the final frontier"
      />
      <MeasurementSidebar slug="space-technology" />

      <KeyFindings>
        <li>Space technology patenting has experienced growth since 2015, coinciding with the emergence of commercial space ventures and shifting the competitive landscape that was previously dominated by traditional defense contractors.</li>
        <li>Space communications and other spacecraft constitute the largest subfields, followed by propulsion systems, reflecting the growing economic importance of orbital infrastructure for global connectivity.</li>
        <li>Boeing, ViaSat, and Hughes Network Systems lead in space patent volume, followed by Lockheed Martin, though the competitive landscape has broadened as commercial space firms scale their IP portfolios.</li>
        <li>Space patents span multiple technology domains, with increasing co-classification in electronics, physics, and mechanical engineering, consistent with the multidisciplinary nature of spacecraft systems.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Space technology patenting reflects one of the most consequential transformations in US industrial patenting: the shift from a government-dominated endeavor to a commercially driven ecosystem. For decades, space patents were the province of a small number of aerospace and defense contractors working under NASA and Department of Defense contracts. The founding of SpaceX in 2002 and the subsequent demonstration of reusable rocket technology catalyzed a broader commercial space movement that has reshaped the competitive landscape. Satellite design and space communications now constitute the largest subfields, driven by ambitious constellation programs such as Starlink that aim to provide global broadband connectivity. Propulsion systems and attitude control represent core engineering challenges where patent activity remains concentrated among firms with deep systems integration expertise. The balance between government and commercial patenting has shifted decisively toward the private sector, a pattern with significant implications for the future trajectory of space industrialization.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/autonomous-vehicles" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">autonomous vehicles</Link> and the convergence of AI, sensor fusion, and systems engineering in self-driving technology, this chapter turns to space technology, where many of the same navigation and autonomy challenges are extended to the orbital domain.
        </p>
        <p>
          Space technology has undergone a fundamental transformation over the past two decades,
          evolving from a government-dominated sector to one of the most dynamic arenas of
          commercial innovation. This chapter examines the trajectory of space-related patents,
          from traditional aerospace engineering through the advent of reusable rockets to the
          current era of satellite mega-constellations and commercial space stations.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Space patent activity serves as an indicator of the commercial space transformation. After
          a decline in the late 2000s, the acceleration in space-related patenting since around
          2015 coincides with the maturation of private launch providers and satellite broadband
          programs, suggesting a shift in how the aerospace industry approaches innovation --
          from cost-plus government contracts to commercially competitive technology development.
        </p>
      </KeyInsight>

      {/* ── Section 1: Growth Trajectory ─────────────────────────────────── */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-space-annual-count"
        subtitle="Annual count of utility patents classified under space technology CPC codes, tracking the growth trajectory of space-related patenting."
        title="Space Patent Filings Have Grown Substantially Since 2015, Reflecting the Commercialization of the Space Industry"
        caption="Annual count and share of utility patents classified under space technology CPC codes, 1976-2025. After a decline in the late 2000s, the most prominent pattern is the acceleration beginning around 2015, coinciding with the maturation of commercial launch providers and satellite broadband programs."
        insight="The growth in space patents coincides with the broader commercialization of the space industry, including reusable launch vehicles, satellite constellations, and increasing private-sector investment."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Space Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={SPACE_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Space patent filings declined in the late 2000s before resuming growth in the early
          2010s, with acceleration beginning around 2015. This growth coincides with the entry
          of commercially oriented firms into launch services, satellite manufacturing, and space
          communications. The acceleration following key milestones in reusable rocket technology
          suggests a possible relationship between demonstrated technical feasibility and increased
          investment in space-related R&D.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-space-share"
        subtitle="Space patents as a percentage of all utility patents, showing the evolving allocation of inventive effort toward space technologies."
        title="Space Technology's Share of Total Patents Has Risen, Indicating Growing Reallocation of Inventive Effort"
        caption="Percentage of all utility patents classified under space technology CPC codes. The upward trend indicates that space patenting growth is not merely tracking overall patent growth but represents a genuine reallocation of inventive effort toward orbital and launch technologies."
        insight="The growing share of space patents among all patents demonstrates that space technology growth represents a real reallocation of inventive effort, not merely an artifact of overall patent expansion."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Space Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={SPACE_EVENTS}
        />
      </ChartContainer>

      {/* ── Section 2: Subfields ──────────────────────────────────────────── */}
      <SectionDivider label="Space Technology Subfields" />

      <ChartContainer
        id="fig-space-subfields"
        subtitle="Patent counts by space technology subfield (satellite design, propulsion, communications, etc.) over time."
        title="Space Communications and Other Spacecraft Constitute the Largest Subfields, Followed by Propulsion Systems"
        caption="Patent counts by space technology subfield over time, based on CPC classifications. The data reveal that space communications and other spacecraft categories have driven recent growth, followed by propulsion systems, reflecting the economic importance of orbital infrastructure for global connectivity."
        insight="The dominance of space communications patents coincides with the commercial evolution of the space industry -- from exploration-driven missions to revenue-generating orbital services such as satellite broadband."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: SPACE_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={SPACE_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of space patents has shifted substantially over time. Space
          communications and other spacecraft constitute the largest subfields, followed by
          propulsion systems. Traditional subfields such as attitude control continue to represent
          core engineering challenges. The dominance of communications patents reflects the growing
          importance of orbital infrastructure for telecommunications, Earth observation, and global
          connectivity initiatives such as Starlink and Project Kuiper.
        </p>
      </KeyInsight>

      {/* ── Section 3: Organizations ──────────────────────────────────────── */}
      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-space-top-assignees"
        subtitle="Organizations ranked by total space-related patent count from 1976 to 2025, showing concentration among aerospace and defense firms."
        title="Boeing, ViaSat, and Hughes Network Systems Lead in Total Space Patent Volume, Reflecting the Importance of Satellite Communications"
        caption="Organizations ranked by total space-related patents, 1976-2025. The data indicate a concentration among traditional aerospace and defense contractors, though commercial space entrants have been scaling their portfolios in recent years."
        insight="The dominance of traditional aerospace firms in space patenting reflects the historical role of government contracts in funding space R&D, though commercial entrants are beginning to reshape the competitive landscape."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Space Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top space patent holders as a data table"
        headers={['Organization', 'Space Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by space-related patent count, 1976-2025. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Space patent leadership reflects a mix of traditional aerospace firms and satellite
          communications specialists. Boeing leads in total volume, followed by ViaSat and
          Hughes Network Systems -- both of which built large portfolios through satellite
          broadband innovation. Lockheed Martin also maintains a substantial presence, drawing
          on deep systems integration capabilities in launch vehicles and satellite platforms. The emergence of commercially oriented firms
          in lower ranking positions signals a potential long-term shift in the competitive
          landscape as private-sector investment in space technology continues to grow.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-space-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by space patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="Organizational Rankings Have Shifted as Commercial Space Firms Challenge Traditional Aerospace Leaders"
          caption="Annual ranking of the top 15 organizations by space patent grants, 2000-2025. Darker cells indicate higher rank (more patents). The data reveal the entry of new competitors alongside traditional defense contractors, reflecting the broadening commercial space ecosystem."
          insight="The ranking dynamics reveal the gradual entry of commercial space firms alongside traditional defense contractors, reflecting the transformation of the space industry from a government-dominated sector to a mixed commercial-government ecosystem."
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
          The ranking data reveal notable shifts in organizational dominance over time. Traditional
          aerospace primes maintained top positions through the 2000s, but the 2010s exhibited
          increasing competition as commercial space firms scaled their operations and patent
          portfolios. The consolidation of defense contractors (such as the formation of Northrop
          Grumman through mergers) and the entry of technology companies into the satellite
          communications sector have reshaped the competitive dynamics of space-related patenting.
        </p>
      </KeyInsight>

      {/* ── Section 4: Inventors ──────────────────────────────────────────── */}
      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-space-top-inventors"
        subtitle="Primary inventors ranked by total space-related patent count from 1976 to 2025, illustrating the distribution of individual output."
        title="The Most Prolific Space Inventors Are Concentrated Among a Small Number of Aerospace Engineers"
        caption="Primary inventors ranked by total space-related patents, 1976-2025. The distribution exhibits pronounced skewness, with a small number of highly productive individuals accounting for a disproportionate share of total space patent output."
        insight="The concentration of space patenting among a small cohort of prolific inventors reflects the highly specialized nature of spacecraft engineering, where deep domain expertise in orbital mechanics, materials science, and systems integration is essential."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Space Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific space inventors are typically affiliated with large aerospace and
          defense firms that maintain dedicated space technology divisions. The concentration of
          space patenting among a relatively small cohort of highly productive inventors reflects
          the specialized expertise required in spacecraft engineering -- knowledge of orbital
          mechanics, radiation-hardened electronics, thermal management, and life support systems
          that takes years to accumulate and is difficult to transfer across organizations.
        </p>
      </KeyInsight>

      {/* ── Section 5: Geography ──────────────────────────────────────────── */}
      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-space-by-country"
        subtitle="Countries ranked by total space-related patents based on primary inventor location, showing geographic distribution of space innovation."
        title="The United States Dominates Space Patenting by Inventor Nationality, Reflecting Its Leadership in Both Government and Commercial Space Programs"
        caption="Countries ranked by total space-related patents based on primary inventor location. The United States maintains a substantial lead, with significant contributions from France, Japan, and Germany reflecting their national space agencies and aerospace industries."
        insight="The United States lead in space patenting reflects its concentration of major aerospace firms, NASA research centers, and the growing commercial space ecosystem, while European and Japanese contributions reflect their respective national space programs."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Space Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of space patents reveals the dominant role of the United
          States, supported by both its government space programs and the commercial space sector.
          France, Japan, and Germany maintain significant positions, driven by their national
          space agencies (CNES, JAXA, DLR) and aerospace industries (Airbus, Thales, Mitsubishi
          Heavy Industries). The relatively limited presence of China in US patent filings likely
          understates its actual space technology capabilities, as Chinese firms and agencies
          tend to file domestically rather than in the US patent system.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-space-by-state"
        subtitle="US states ranked by total space-related patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California and Maryland Lead US Space Patenting, Reflecting Aerospace and Defense Industry Clustering"
        caption="US states ranked by total space-related patents based on primary inventor location. California leads by a wide margin, followed by Maryland -- home to major defense contractors and NASA's Goddard Space Flight Center. Arizona, Washington, and Texas round out the top five."
        insight="The geographic clustering of space patents in California and Maryland reflects the concentration of aerospace and defense facilities, NASA research centers, and satellite communications firms in these states."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Space Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, space patenting is concentrated in states with established
          aerospace clusters. California leads by a wide margin, driven by the presence of
          Boeing Satellite Systems, numerous satellite communications firms, and NASA&apos;s Jet
          Propulsion Laboratory. Maryland ranks second, anchored by major defense contractors
          and NASA&apos;s Goddard Space Flight Center. Colorado, home to Lockheed Martin Space,
          United Launch Alliance, and Ball Aerospace, ranks seventh. The clustering of space
          innovation in a relatively small number of states reflects the importance of proximity
          to defense customers, NASA centers, and specialized talent pools.
        </p>
      </KeyInsight>

      {/* ── Section 6: Quality Indicators ─────────────────────────────────── */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-space-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for space patents by year, measuring quality trends."
        title="Space Patent Technology Scope Has Risen Over Time, Reflecting the Growing Interdisciplinarity of Spacecraft Systems"
        caption="Average claims, backward citations, and technology scope for space-related patents by year. The upward trend in technology scope suggests that space patents are becoming increasingly interdisciplinary, spanning electronics, materials science, and communications."
        insight="Rising technology scope in space patents reflects the interdisciplinary nature of modern spacecraft systems, which integrate advances in electronics, materials science, propulsion, and communications."
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
          referenceLines={SPACE_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Space patents exhibit distinctive quality characteristics relative to the broader
          patent system. Average backward citations peaked around 2011 and have declined
          substantially since, a pattern consistent with the broader shift toward more narrowly
          targeted prior art searches as the field has matured. The expanding technology scope
          indicates that space inventions are becoming more
          interdisciplinary, spanning multiple CPC subclasses as spacecraft systems integrate
          advances in electronics, materials science, propulsion, and telecommunications.
        </p>
      </KeyInsight>

      {/* ── Section 7: Strategies ─────────────────────────────────────────── */}
      <SectionDivider label="Space Patenting Strategies" />

      <Narrative>
        <p>
          The leading space patent holders pursue markedly different strategies. Some firms
          concentrate on satellite design and communications, while others distribute their
          portfolios across propulsion systems, attitude control, and re-entry technologies.
          A comparison of subfield portfolios across major holders reveals where each
          organization concentrates its inventive effort and identifies areas of strategic
          differentiation.
        </p>
      </Narrative>

      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Space Patents</th>
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
          The strategic portfolios of leading space patent holders reveal distinct areas of
          specialization. Boeing and Lockheed Martin maintain broad portfolios spanning satellite
          design, propulsion, and space communications, consistent with their role as prime
          contractors for both government and commercial programs. ViaSat and Hughes Network
          Systems have concentrated heavily on space communications, reflecting their focus on
          satellite broadband technology. The most notable strategic differences emerge in
          space communications more broadly, where firms
          building satellite constellation infrastructure have concentrated their inventive effort
          on antenna design, signal processing, and inter-satellite links.
        </p>
      </KeyInsight>

      {/* ── Section 8: Cross-Domain Diffusion ─────────────────────────────── */}
      <SectionDivider label="Space Technology Diffusion Across Domains" />

      <Narrative>
        <p>
          Space technology has historically served as a source of spillover innovations for
          other sectors. By tracking how frequently space-classified patents also carry CPC codes
          from non-space technology areas, it is possible to measure the diffusion of space
          innovations into electronics, physics, mechanical engineering, and other domains.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-space-diffusion"
        subtitle="Percentage of space patents co-classified with non-space CPC sections, measuring the diffusion of space technology into other domains."
        title="Space Patents Show Increasing Co-Classification With Electronics and Physics, Reflecting Cross-Domain Technology Transfer"
        caption="Percentage of space patents that also carry CPC codes from each non-space CPC section. Rising lines indicate space technology diffusing into that sector. The most notable pattern is the increasing co-occurrence with Electricity (Section H) and Physics (Section G), consistent with the growing importance of electronics and sensing systems in modern spacecraft."
        insight="The presence of space patents across multiple CPC sections reflects the multidisciplinary nature of spacecraft engineering and the diffusion of space-derived innovations into terrestrial applications in electronics, materials, and communications."
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
            yLabel="% of Space Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={SPACE_EVENTS}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Space technology exhibits substantial cross-domain diffusion, consistent with its
          role as a source of spillover innovations for terrestrial industries. The increasing
          co-classification with Electricity (H) reflects the growing importance of power
          systems, telecommunications, and electronic subsystems in modern spacecraft. Co-occurrence
          with Physics (G) captures the integration of sensing, imaging, and computational
          technologies. The broad presence of space patents across multiple CPC sections underscores
          the multidisciplinary nature of spacecraft engineering and the potential for space-derived
          innovations to find applications in healthcare, manufacturing, and consumer electronics.
        </p>
      </KeyInsight>

      {/* ── Section 9: Team Comparison ────────────────────────────────────── */}
      <SectionDivider label="The Collaborative Nature of Space Innovation" />

      <Narrative>
        <p>
          Space patents historically involved smaller inventor teams than non-space patents for
          most of the period studied. However, space patent team sizes have recently converged
          with and slightly exceeded non-space averages in 2024-2025, reflecting the growing
          systems complexity of modern spacecraft engineering and the increasing multidisciplinary
          collaboration required in contemporary space technology development.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-space-team-comparison"
        subtitle="Average inventors per patent for space vs. non-space utility patents by year, showing recent convergence."
        title="Space Patent Team Sizes Have Recently Converged With Non-Space Averages"
        caption="Average number of inventors per patent for space-related vs. non-space utility patents, 1976-2025. Space patents historically involved smaller teams than non-space patents for most of this period, with convergence occurring only in recent years (2024-2025)."
        insight="Space patent team sizes were historically smaller than non-space patents but have recently converged, with space teams slightly exceeding non-space averages only in 2024-2025 as spacecraft systems have grown more complex."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Space', name: 'Space Patents', color: CHART_COLORS[0] },
            { key: 'Non-Space', name: 'Non-Space Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      {/* ── Section 10: Assignee Type ────────────────────────────────────── */}
      <SectionDivider label="Government vs. Commercial Balance" />

      <Narrative>
        <p>
          The distribution of space patents by assignee type reveals the evolving balance between
          government, corporate, and university contributors to space innovation. While government
          agencies and their contractors historically dominated space patenting, the commercial
          space transition has shifted this balance decisively toward private-sector assignees.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-space-assignee-type"
        subtitle="Distribution of space patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Increasingly Dominate Space Patenting as the Industry Shifts Toward Commercial Activity"
        caption="Distribution of space patent assignees by type (corporate, university, government, individual) over time. The data reveal that the corporate share has intensified as commercial space companies have expanded their R&D activities, while government-affiliated patenting has grown in absolute terms but declined as a proportion."
        insight="The shift from government-dominated to commercially driven space patenting reflects the broader transformation of the space industry, where private-sector investment now exceeds government funding for many categories of space technology development."
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
          The evolution of assignee types in space patenting reflects the broader transformation
          of the space industry. Corporate assignees have increasingly dominated as commercial
          space companies have expanded their R&amp;D activities beyond traditional government
          contracting. University space patenting peaked in the early 2000s and has remained
          minimal, with activity concentrated in areas such as CubeSat technology and space
          science instrumentation. The declining government share,
          measured as a proportion rather than in absolute terms, illustrates the shift from
          a model in which the government was the primary driver of space innovation to one in
          which the private sector increasingly leads technology development.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />

      <ChartContainer
        id="fig-space-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in space technology patenting."
        title="Top-4 Concentration in Space Technology Patents Fluctuated Between 4.9% and 36.7%, Reflecting the Sector's Transition From Government to Commercial Innovation"
        caption="CR4 computed as the sum of the top 4 organizations' annual patent counts divided by total space patents. The wide fluctuation reflects structural shifts: early government-funded concentration, a fragmented middle period, and recent reconsolidation as SpaceX, Boeing, and satellite communication firms scaled patent portfolios."
        insight="The space sector's concentration dynamics are unique among ACT 6 domains, reflecting the fundamental tension between government-funded basic research (distributed across contractors) and commercial space ventures (consolidated among a few well-funded firms)."
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
        id="fig-space-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across space technology subfields."
        title="Space Technology Subfield Diversity Fluctuated Between 0.69 and 0.93, With Recent Decline Suggesting Increasing Specialization"
        caption="Normalized Shannon entropy (H/ln(N)) ranges from 0 (all activity in one subfield) to 1 (perfectly even distribution). The fluctuation reflects shifting emphasis: early diversity across communications, propulsion, and guidance gave way to increasing specialization, with satellite communications dominating recent patenting."
        insight="The recent entropy decline contrasts with most ACT 6 domains where diversity increased, suggesting that space technology is concentrating around satellite communications and LEO constellation systems at the expense of traditional propulsion and guidance subfields."
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
        id="fig-space-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a space technology patent."
        title="Space Technology Patenting Velocity Has Remained Relatively Stable Across Entry Cohorts, Averaging 4-8 Patents per Year"
        caption="Mean patents per active year for top space organizations grouped by entry decade. Unlike domains where velocity increased substantially for later entrants, space technology shows relatively stable per-year patenting rates, reflecting the domain's high technical barriers and long development cycles."
        insight="The stable velocity across cohorts distinguishes space from most other ACT 6 domains and is consistent with the fundamental physics constraints on spacecraft innovation, where development cycles of 5-10 years limit the rate at which any organization can patent productively."
        loading={taL}
      >
        <PWBarChart
          data={velocityData}
          xKey="decade"
          bars={[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]}
          yLabel="Mean Patents / Year"
        />
      </ChartContainer>

      {/* ── Section 11: Conclusion ────────────────────────────────────────── */}
      <Narrative>
        <p>
          The trajectory of space technology patenting documents one of the most significant
          structural transformations in US patenting: the commercialization of space.
          From the dominance of traditional aerospace contractors to the emergence of
          commercially driven firms building reusable rockets and satellite mega-constellations,
          the patent record captures a fundamental shift in how space technology is developed,
          funded, and deployed. As satellite communications become central to global connectivity
          and commercial space stations enter development, the pace of space-related patenting
          appears likely to accelerate further.
        </p>
        <p>
          The next chapter examines <Link href="/chapters/3d-printing" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">3D printing and additive manufacturing</Link>, a domain where aerospace applications have been among the earliest and most consequential use cases for production-grade metal printing technologies.
        </p>
      </Narrative>

      <InsightRecap
        learned={["Space technology top-four concentration fluctuated between 4.9% and 36.7%, the widest range among all domains, reflecting the government-to-commercial transition.", "Satellite communications now dominates space technology patenting, with Boeing, ViaSat, and Lockheed Martin as leading filers."]}
        falsifiable="If the commercial space transition drove deconcentration, then the entry of SpaceX and other NewSpace firms should correlate with declining top-four share in launch and propulsion subfields."
        nextAnalysis={{ label: "Patent Count", description: "Return to the beginning — how has the overall patent system evolved across all the dimensions explored?", href: "/chapters/system-patent-count" }}
      />

      <DataNote>
        Space patents are identified using CPC classifications related to spacecraft and
        satellite technology, including B64G (cosmonautics and vehicles or equipment therefor),
        H04B7/185 (space-based communication links), and related codes. Subfield classifications
        are based on more specific CPC group codes: B64G1/10 (satellite design), B64G1/22-1/40
        (propulsion systems), B64G1/24 (attitude control and life support), B64G1/62 (re-entry
        systems), B64G1/66 (arrangements for landing), and H04B7/185 (space communications).
        Patenting strategies show patent counts per subfield for the top assignees. Cross-domain
        diffusion measures co-occurrence of space CPC codes with other CPC sections.
      </DataNote>

      <RelatedChapters currentChapter={34} />
      <ChapterNavigation currentChapter={34} />
    </div>
  );
}
