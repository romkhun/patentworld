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
import { CHART_COLORS, CPC_SECTION_COLORS, PRINT3D_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { PRINT3D_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import Link from 'next/link';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
  DomainEntrantIncumbent, DomainQualityBifurcation,
} from '@/lib/types';

export default function Chapter11() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('3dprint/3dprint_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('3dprint/3dprint_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('3dprint/3dprint_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('3dprint/3dprint_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('3dprint/3dprint_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('3dprint/3dprint_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('3dprint/3dprint_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('3dprint/3dprint_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('3dprint/3dprint_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('3dprint/3dprint_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('3dprint/3dprint_assignee_type.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('3dprint/3dprint_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('3dprint/3dprint_quality_bifurcation.json');

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

  return (
    <div>
      <ChapterHeader
        number={23}
        title="3D Printing & Additive Manufacturing"
        subtitle="Layer-by-layer transformation in manufacturing"
      />
      <MeasurementSidebar slug="3d-printing" />

      <KeyFindings>
        <li>3D printing patent filings have grown substantially since 2000, with notable acceleration after the expiration of key FDM patents in 2009.</li>
        <li>The technology has bifurcated into distinct tracks: polymer additive manufacturing (B29C64) for prototyping and consumer applications, and metal additive manufacturing (B22F10) for production-grade aerospace and medical components.</li>
        <li>HP, General Electric, Stratasys, and Boeing lead the 3D printing patent landscape, though their strategies differ markedly across AM processes, equipment, and materials.</li>
        <li>The introduction of the B33Y CPC classification specifically for additive manufacturing reflects the field&apos;s maturation into a recognized technology domain with distinct inventive activity.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Additive manufacturing has transitioned from a rapid prototyping curiosity to a production-grade manufacturing technology with applications spanning aerospace, medical devices, automotive, and consumer products. The patent record traces this evolution from the foundational stereolithography patents of the 1980s through the desktop 3D printing expansion triggered by FDM patent expirations, to the current era of metal AM and multi-material systems. The divergence between polymer and metal AM patent trajectories, combined with the entry of industrial conglomerates like GE and HP, signals a technology reaching inflection points in both capability and commercial viability. The organizational dynamics examined here connect to the broader manufacturing innovation patterns analyzed in <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Technology Revolution</Link>.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined the geographic mechanics of innovation in the previous act, this chapter opens ACT 6 with 3D printing, a manufacturing technology whose patent landscape reveals how foundational patent expirations can democratize an entire field and whose earliest production-grade applications emerged in aerospace before spreading to consumer and industrial markets.
        </p>
        <p>
          3D printing, more formally known as additive manufacturing (AM), builds objects
          layer by layer from digital models -- a fundamental departure from the subtractive
          machining and formative molding that have dominated manufacturing for centuries.
          This chapter examines the patent landscape of AM technologies, tracing their
          evolution from early stereolithography systems through the desktop printing boom
          to today&apos;s production-grade metal AM systems.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The additive manufacturing patent record reveals a technology undergoing a critical
          transition: from prototyping tool to production method. The expiration of foundational
          FDM patents in 2009 catalyzed a wave of innovation in desktop systems, while
          concurrent advances in metal powder bed fusion and directed energy deposition have
          opened pathways to end-use part production in aerospace and medical applications.
        </p>
      </KeyInsight>

      {/* ── Section 1: Growth Trajectory ────────────────────────────────── */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-3dprint-annual-count"
        subtitle="Annual count of utility patents classified under additive manufacturing CPC codes (B33Y, B29C64, B22F10), tracking the growth trajectory of 3D printing patenting."
        title="3D Printing Patent Filings Grew Substantially Since 2000, With Acceleration After the 2009 FDM Patent Expiration"
        caption="Annual count and share of utility patents classified under additive manufacturing CPC codes, 1990-2025. The sharp acceleration after 2009 coincides with the expiration of Stratasys's foundational FDM patent, which opened the technology to widespread adoption and new entrants. Grant year shown. Application dates are typically 2–3 years earlier."
        insight="The growth in 3D printing patents is associated with the broader expansion of additive manufacturing, coinciding with patent expirations, falling hardware costs, and expanding material capabilities."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: '3D Printing Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={filterEvents(PRINT3D_EVENTS)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The growth trajectory of 3D printing patents exhibits two distinct phases. The
          first, spanning the 1990s through 2009, shows steady but moderate patenting
          concentrated among a small number of pioneering firms. The second, beginning around
          the 2009 FDM patent expiration and accelerating through the desktop 3D printing
          period of 2013-2014, shows an inflection point coinciding with expansion by new entrants, open-source
          communities, and industrial manufacturers.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-3dprint-share"
        subtitle="3D printing patents as a percentage of all utility patents, showing the growing allocation of inventive effort toward additive manufacturing."
        title="AM's Share of Total Patents Has Risen Steadily, Reflecting a Genuine Reallocation of Manufacturing R&D Toward Additive Processes"
        caption="Percentage of all utility patents classified under additive manufacturing CPC codes. The upward trend indicates that AM patenting growth reflects a real shift in manufacturing innovation priorities, not merely growth tracking the overall patent system."
        insight="The growing share of AM patents suggests that additive manufacturing is capturing an increasing fraction of total manufacturing R&D effort, consistent with its expanding role in production workflows."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'AM Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PRINT3D_EVENTS)}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-3dprint-entrant-incumbent"
        title="3D Printing Growth Is Driven Primarily by New Entrants After the 2009 FDM Patent Expiration"
        subtitle="Annual patent counts decomposed by entrants (first patent in domain that year) vs. incumbents."
        caption="Entrants are assignees filing their first 3D printing patent in a given year. Incumbents had at least one prior-year patent. Grant year shown."
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

      {/* ── Section 2: AM Subfields ────────────────────────────────────── */}
      <SectionDivider label="AM Subfields" />

      <ChartContainer
        id="fig-3dprint-subfields"
        subtitle="Patent counts by AM subfield (processes, equipment, materials, polymer AM, metal AM) over time, based on CPC group codes within B33Y, B29C64, and B22F10."
        title="AM Processes and Polymer AM Dominate Filing Volume, While Metal AM and AM Auxiliary Operations Have Emerged as Rapidly Growing Subfields"
        caption="Patent counts by additive manufacturing subfield over time. AM processes and polymer AM (B29C64) represent the largest established categories, while metal AM (B22F10) has grown rapidly since 2015, reflecting the technology's expansion into production-grade applications in aerospace and medical devices."
        insight="The bifurcation between polymer and metal AM reflects two distinct technology trajectories: polymer AM serving prototyping and consumer markets, while metal AM targets high-value production applications."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: PRINT3D_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={filterEvents(PRINT3D_EVENTS)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The subfield composition of 3D printing patents reveals the technology&apos;s
          evolving focus. AM processes -- covering the core methods of fused deposition
          modeling, stereolithography, selective laser sintering, and powder bed fusion --
          constitute the largest category, reflecting ongoing innovation in fundamental
          build techniques. Polymer additive manufacturing (B29C64) and metal additive
          manufacturing (B22F10) represent distinct technology tracks with different
          material science challenges, equipment requirements, and application domains.
          The rapid growth of metal AM since 2015 signals the technology&apos;s transition
          from prototyping to production-grade part manufacturing.
        </p>
      </KeyInsight>

      {/* ── Section 3: Organizations ───────────────────────────────────── */}
      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-3dprint-top-assignees"
        subtitle="Organizations ranked by total 3D printing patent count, showing concentration among AM specialists and industrial conglomerates."
        title="HP and General Electric Lead in AM Patent Volume, Followed by Stratasys, Boeing, 3D Systems, and Xerox"
        caption="Organizations ranked by total additive manufacturing patents. The leadership of HP and GE alongside AM-native firms (Stratasys, 3D Systems) and aerospace companies (Boeing) reflects the technology's dual trajectory as both a standalone industry and an embedded manufacturing capability."
        insight="The co-existence of AM specialists and diversified industrial firms at the top of the patent rankings reflects additive manufacturing's dual identity: a standalone technology sector and an embedded capability within broader manufacturing systems."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: '3D Printing Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top 3D printing patent holders as a data table"
        headers={['Organization', '3D Printing Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by additive manufacturing patent count. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          The organizational landscape of 3D printing patents reflects the technology&apos;s
          maturation from a niche prototyping market to a strategically important manufacturing
          capability. HP and General Electric lead in total AM patent volume, followed by
          AM-native firms such as Stratasys and 3D Systems that built early patent portfolios
          around foundational process technologies. The presence of aerospace firms (Boeing) and
          materials and manufacturing firms (Xerox, Raytheon Technologies) among top patent holders
          underscores the expanding application base for additive manufacturing.
        </p>
      </KeyInsight>

      {/* ── Section 4: Organization Rankings Over Time ──────────────────── */}
      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-3dprint-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by 3D printing patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="The AM Patent Landscape Has Shifted From Dominance by Pioneers to a Multi-Player Field as Industrial Firms Entered After 2012"
          caption="Annual ranking of the top 15 organizations by additive manufacturing patent grants, 2000-2025. Darker cells indicate higher rank. The data reveal the transition from a field dominated by AM pioneers (Stratasys, 3D Systems) to an increasingly competitive landscape with entry by HP, GE, and other industrial conglomerates."
          insight="The entry of industrial conglomerates into the top AM patent rankings after 2012 reflects a strategic reassessment of additive manufacturing's production potential, moving beyond prototyping into direct manufacturing applications."
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
          The ranking data reveal a structural transformation in AM patent leadership. Through
          the 2000s, Stratasys and 3D Systems held largely unchallenged positions at the top,
          reflecting their roles as the foundational firms in FDM and stereolithography,
          respectively. The 2010s witnessed rapid entry by HP, GE, Siemens, and other
          industrial firms whose manufacturing expertise and customer relationships
          positioned them to accelerate AM adoption in production environments. This shift
          from AM-specialist dominance to industrial-conglomerate competition signals the
          technology&apos;s maturation beyond its prototyping origins.
        </p>
      </KeyInsight>

      {/* ── Section 5: Inventors ───────────────────────────────────────── */}
      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-3dprint-top-inventors"
        subtitle="Primary inventors ranked by total 3D printing patent count, illustrating the concentration of AM inventive output among key individuals."
        title="The Most Prolific AM Inventors Are Concentrated at Pioneer Firms, Reflecting the Deep Technical Expertise Required for Process Innovation"
        caption="Primary inventors ranked by total additive manufacturing patents. The distribution exhibits pronounced skewness, with the most prolific inventors typically affiliated with AM-native firms where they contributed to foundational process and materials innovations."
        insight="The concentration of AM patents among inventors at pioneer firms reflects the deep, specialized expertise required for additive manufacturing process development, where material science, thermal dynamics, and precision engineering intersect."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: '3D Printing Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific 3D printing inventors are typically affiliated with AM-native
          firms where they contributed to foundational innovations in process technology,
          materials formulation, and equipment design. The highly skewed distribution of
          inventor productivity reflects the specialized nature of AM innovation, which
          requires deep expertise at the intersection of materials science, thermal
          dynamics, mechanical engineering, and software control systems. The presence of
          inventors from both AM specialists and industrial conglomerates indicates the
          broadening organizational base for AM expertise.
        </p>
      </KeyInsight>

      {/* ── Section 6: Geography ───────────────────────────────────────── */}
      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-3dprint-by-country"
        subtitle="Countries ranked by total 3D printing patents based on primary inventor location, showing the geographic distribution of AM innovation."
        title="The United States Leads in AM Patenting, With Germany, Japan, and China as Major Contributors Reflecting Distinct Manufacturing Traditions"
        caption="Countries ranked by total additive manufacturing patents based on primary inventor location. The United States maintains the leading position, while the strong presence of Germany and Japan reflects their advanced manufacturing traditions, and China's growing share indicates rapid expansion of AM capabilities."
        insight="The geographic distribution of AM patents reflects the alignment between additive manufacturing innovation and existing manufacturing strength, with the United States, Germany, and Japan leveraging their industrial bases to drive AM development."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: '3D Printing Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of 3D printing patents reflects the intersection of
          additive manufacturing innovation with existing manufacturing strength. The United
          States leads, driven by the headquarters of Stratasys, 3D Systems, GE Additive,
          and HP. Germany&apos;s strong position reflects its engineering and precision
          manufacturing tradition, with firms like EOS, SLM Solutions, and Siemens. Japan
          contributes through its materials science and electronics manufacturing
          capabilities, while China&apos;s growing share indicates the rapid expansion of
          AM research and production capacity.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-3dprint-by-state"
        subtitle="US states ranked by total 3D printing patents based on primary inventor location, highlighting geographic clustering of AM innovation."
        title="California, Massachusetts, and New York Lead US 3D Printing Patenting, Followed by Ohio, Texas, and Connecticut"
        caption="US states ranked by total additive manufacturing patents based on primary inventor location. The geographic clustering reflects the locations of major AM firms and their proximity to manufacturing customer bases in aerospace, medical devices, and automotive."
        insight="The clustering of AM patents in manufacturing-intensive states contrasts with the Silicon Valley concentration seen in software-oriented technology domains, reflecting additive manufacturing's ties to physical production infrastructure."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: '3D Printing Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, AM patenting clusters in states with strong manufacturing
          and R&amp;D infrastructure rather than following the Silicon Valley-centric pattern
          observed in software-oriented technology domains. This geographic distribution
          reflects the physical nature of additive manufacturing innovation, which depends
          on proximity to materials testing facilities, machine shops, and end-user
          manufacturing operations in aerospace, medical devices, and automotive sectors.
        </p>
      </KeyInsight>

      {/* ── Section 7: Quality Indicators ──────────────────────────────── */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-3dprint-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for 3D printing patents by year, measuring quality trends."
        title="AM Patent Technology Scope Has Increased Over the Long Term, Reflecting the Growing Interdisciplinarity of Additive Manufacturing Innovation"
        caption="Average claims, backward citations, and technology scope for additive manufacturing patents by year. The rising technology scope indicates that AM patents increasingly span multiple CPC subclasses, consistent with the interdisciplinary nature of AM systems that integrate materials science, mechanical engineering, and software control."
        insight="The expanding technology scope of AM patents reflects the interdisciplinary nature of additive manufacturing, which requires simultaneous innovation in materials, process control, equipment design, and software."
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
          referenceLines={filterEvents(PRINT3D_EVENTS)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AM patents exhibit distinctive quality characteristics. Backward citations peaked around 2013 and have since declined,
          while technology scope has shown a long-term increase. The expanding technology
          scope -- measured by the number of distinct CPC subclasses per patent -- confirms
          that AM inventions increasingly bridge multiple technology domains, consistent with
          the systems-level complexity of modern additive manufacturing platforms.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-3dprint-quality-bifurcation"
        title="3D Printing Top-Decile Citation Share Has Declined as the Field Expanded"
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

      {/* ── Section 8: AM Patent Strategies ────────────────────────────── */}
      <SectionDivider label="AM Patenting Strategies" />
      <Narrative>
        <p>
          The leading AM patent holders pursue markedly different strategies. Some firms
          concentrate on process innovations, while others emphasize equipment design,
          materials formulation, or application-specific AM products. A comparison of AM
          subfield portfolios across major holders reveals where each organization
          concentrates its inventive effort and identifies areas of strategic differentiation.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total AM Patents</th>
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
          Strategic differences among AM patent leaders reflect their origins and market
          positions. AM-native firms like Stratasys and 3D Systems maintain broad portfolios
          spanning processes, equipment, and materials, consistent with their roles as
          vertically integrated platform providers. Industrial entrants like GE and HP
          concentrate on specific process categories aligned with their target applications --
          metal AM for aerospace in GE&apos;s case, multi-jet fusion for production
          plastics in HP&apos;s. Materials companies focus on AM-specific material
          formulations, while aerospace firms emphasize application-specific innovations in
          design for AM and part qualification.
        </p>
      </KeyInsight>

      {/* ── Section 9: Cross-Domain Diffusion ──────────────────────────── */}
      <SectionDivider label="AM as a Cross-Domain Technology" />
      <Narrative>
        <p>
          A defining characteristic of additive manufacturing is its application across
          diverse industries. By tracking how frequently AM-classified patents also carry
          CPC codes from non-AM technology areas, it is possible to measure the spread of
          3D printing into aerospace, healthcare, automotive, and other domains.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-3dprint-diffusion"
        subtitle="Percentage of AM patents co-classified with other CPC sections, measuring 3D printing's diffusion into healthcare, aerospace, and other domains."
        title="AM Patent Co-Occurrence With Healthcare and Transportation CPC Codes Has Risen Substantially, Indicating Expanding Real-World Applications"
        caption="Percentage of additive manufacturing patents co-classified with each non-AM CPC section. Rising lines indicate AM diffusing into that sector. The increasing co-occurrence with Human Necessities (Section A, encompassing medical devices) and Performing Operations (Section B, encompassing machining and manufacturing) reflects AM's expanding production applications."
        insight="The co-occurrence of AM patents with medical device and aerospace CPC codes reflects additive manufacturing's growing role in producing end-use parts for high-value applications, moving beyond its origins as a prototyping technology."
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
            yLabel="% of AM Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={filterEvents(PRINT3D_EVENTS)}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Additive manufacturing increasingly exhibits the characteristics of a cross-domain
          technology. The rising co-classification of AM patents with Human Necessities
          (Section A) reflects the growing use of 3D printing in medical implants, surgical
          guides, dental prosthetics, and bioprinting. Co-occurrence with Performing
          Operations and Transporting (Section B) captures AM&apos;s integration with
          traditional manufacturing and aerospace applications. The broad upward trend
          across multiple CPC sections confirms that additive manufacturing is expanding
          well beyond its origins as a standalone prototyping technique to become an
          embedded capability within diverse industrial workflows.
        </p>
      </KeyInsight>

      {/* ── Section 10: Team Comparison ─────────────────────────────────── */}
      <SectionDivider label="Team Structure in AM Innovation" />

      <Narrative>
        <p>
          AM patents have generally involved larger inventor teams compared to non-AM patents,
          reflecting the multidisciplinary nature of additive manufacturing systems that
          integrate materials science, process engineering, and software control. While the
          gap narrowed and briefly reversed during 2016-2018, it has widened again in recent
          years, highlighting the growing collaborative demands of AM innovation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-3dprint-team-comparison"
        subtitle="Average inventors per patent for 3D printing vs. non-3D printing utility patents by year, showing the complexity gap between the two categories."
        title="AM Patent Team Sizes Have Generally Exceeded Non-AM Averages, With Recent Widening"
        caption="Average number of inventors per patent for additive manufacturing vs. non-AM utility patents by year. AM patents have generally involved larger teams, though the gap narrowed and briefly reversed during 2016-2018 before widening again in recent years, reflecting the evolving multidisciplinary demands of additive manufacturing."
        insight="The team size gap between AM and non-AM patents reflects the systems-level complexity of additive manufacturing, which requires concurrent innovation across materials, processes, equipment, and software."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: '3DPrint', name: '3D Printing Patents', color: CHART_COLORS[0] },
            { key: 'Non-3DPrint', name: 'Non-3D Printing Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      {/* ── Section 11: Assignee Type ──────────────────────────────────── */}
      <ChartContainer
        id="fig-3dprint-assignee-type"
        subtitle="Distribution of 3D printing patents by assignee type (corporate, university, government, individual) over time, showing the evolving institutional composition."
        title="Corporate Assignees Dominate AM Patenting, Though University Contributions Have Grown in Absolute Terms as AM Research Expanded"
        caption="Distribution of additive manufacturing patent assignees by type over time. Corporate assignees have consistently dominated, with their share intensifying as industrial firms entered the field after 2012. University AM patenting has grown in absolute terms, reflecting the expansion of academic AM research programs."
        insight="The dominance of corporate assignees in AM patenting reflects the capital-intensive nature of additive manufacturing R&D, which requires access to expensive equipment, specialized materials, and production-scale testing facilities."
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
          The institutional composition of AM patenting reflects the technology&apos;s
          capital-intensive nature. Corporate assignees dominate, driven by the substantial
          equipment, materials, and testing infrastructure required for AM innovation.
          University contributions have grown as academic AM research programs expanded,
          particularly in metal AM processes and bioprinting, though universities represent
          a smaller share of total AM patents compared to fields like biotechnology where
          federal research funding plays a larger role. The growing corporate share since
          2012 coincides with the entry of large industrial firms that brought existing
          manufacturing R&amp;D capabilities to bear on additive manufacturing.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-3dprint-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in 3D printing patenting."
        title="Top-4 Concentration in 3D Printing Patents Peaked at 36% in 2005 Before Declining to 11% by 2024"
        caption="CR4 (four-firm concentration ratio) computed as the sum of the top 4 organizations' annual patent counts divided by total domain patents. The 2005 peak reflects Micron Technology's dominance during its semiconductor-adjacent AM activity. Post-2009, the domain fragmented as FDM patent expirations enabled widespread entry."
        insight="The declining concentration ratio suggests that 3D printing patenting has become increasingly accessible, with the top 4 organizations accounting for a diminishing share of total activity despite their absolute patent counts increasing."
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
        id="fig-3dprint-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across 3D printing subfields."
        title="3D Printing Subfield Diversity Remained High Throughout Its History, Ranging From 0.80 to 0.95"
        caption="Normalized Shannon entropy (H/ln(N)) ranges from 0 (all activity in one subfield) to 1 (perfectly even distribution). Values consistently above 0.85 indicate that AM innovation has been broadly distributed across equipment, processes, materials, products, and data handling subfields, with a brief dip to 0.80 in 2014 as polymer AM expanded."
        insight="Unlike domains such as AI, which diversified substantially from a narrow base, 3D printing has maintained broad subfield diversity throughout its history, suggesting that the technology has always required simultaneous advances across multiple technical dimensions."
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
        id="fig-3dprint-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a 3D printing patent."
        title="Later Entrants to 3D Printing Patent at Higher Annual Velocity: 2010s Cohort Averages 11.2 Patents per Year Versus 8.3 for 1990s Entrants"
        caption="Patenting velocity is computed as total domain patents divided by active career span (last year minus first year plus one) for each organization, then averaged by entry decade cohort. Only cohorts with three or more organizations are shown. The increasing velocity suggests that later entrants are more productive per year of activity."
        insight="The rising velocity across entry cohorts is consistent with the technology maturing and becoming more accessible: later entrants can build on established knowledge and standardized processes rather than investing in foundational R&amp;D."
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
        Having examined the patent landscape of additive manufacturing, the following chapters explore other technology domains where similar patterns of growth, organizational competition, and cross-domain diffusion are unfolding. The manufacturing innovation dynamics documented here connect to the broader analysis in <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Technology Revolution</Link>, while organizational strategies are examined further in <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>.
      </Narrative>

      <InsightRecap
        learned={["Top-four-firm concentration in 3D printing patents declined from 36% in 2005 to 11% by 2024, driven by the expiration of key FDM patents in 2009.", "Later entrants (2010s cohort) patent at 11.2 patents per year compared to 8.3 for 1990s entrants, suggesting that open-source knowledge diffusion accelerated innovation."]}
        falsifiable="If the FDM patent expiration causally democratized the field, then concentration should have declined discontinuously around 2009 rather than gradually."
        nextAnalysis={{ label: "Agricultural Technology", description: "How precision agriculture and biotechnology are transforming food production patents", href: "/chapters/agricultural-technology" }}
      />

      <DataNote>
        3D printing patents are identified using CPC classifications: B33Y (additive
        manufacturing, the dedicated classification for AM technologies), B29C64 (additive
        manufacturing of polymeric materials), and B22F10 (additive manufacturing of
        metallic materials). A patent is classified as AM-related if any of its CPC codes
        fall within these categories. Subfield classifications are based on more specific
        CPC group codes within these categories. AM patenting strategies show patent
        counts per AM sub-area for the top assignees. Cross-domain diffusion measures
        co-occurrence of AM CPC codes with other CPC sections.
      </DataNote>

      <RelatedChapters currentChapter={23} />
      <ChapterNavigation currentChapter={23} />
    </div>
  );
}
