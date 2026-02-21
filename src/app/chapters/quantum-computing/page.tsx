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
import { CHART_COLORS, CPC_SECTION_COLORS, QUANTUM_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { QUANTUM_EVENTS } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion, DomainEntrantIncumbent,
  DomainQualityBifurcation, QuantumSemiDependence,
  Act6DomainFilingVsGrant,
} from '@/lib/types';

export default function Chapter20() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('quantum/quantum_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('quantum/quantum_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('quantum/quantum_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('quantum/quantum_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('quantum/quantum_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('quantum/quantum_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('quantum/quantum_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('quantum/quantum_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('quantum/quantum_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('quantum/quantum_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('quantum/quantum_assignee_type.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('quantum/quantum_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('quantum/quantum_quality_bifurcation.json');
  const { data: semiDep, loading: sdL } = useChapterData<QuantumSemiDependence[]>('quantum/quantum_semiconductor_dependence.json');
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

  // Compute rank data for heatmap (from 2005 onward, where quantum activity is meaningful)
  const orgRankData = useMemo(() => {
    if (!orgOverTime) return [];
    const years = [...new Set(orgOverTime.map((d) => d.year))].sort().filter((y) => y >= 2005);
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
    const filing = filingVsGrant.filter((d) => d.domain === 'Quantum' && d.series === 'filing_year');
    const grant = filingVsGrant.filter((d) => d.domain === 'Quantum' && d.series === 'grant_year');
    const filingMap = Object.fromEntries(filing.map((d) => [d.year, d.count]));
    const grantMap = Object.fromEntries(grant.map((d) => [d.year, d.count]));
    const years = [...new Set([...filing.map((d) => d.year), ...grant.map((d) => d.year)])].sort();
    return years.map((year) => ({ year, filings: filingMap[year] ?? 0, grants: grantMap[year] ?? 0 }));
  }, [filingVsGrant]);

  return (
    <div>
      <ChapterHeader
        number={32}
        title="Quantum Computing"
        subtitle="From theoretical foundations to practical hardware"
      />
      <MeasurementSidebar slug="quantum-computing" />

      <KeyFindings>
        <li>Quantum computing patents have grown rapidly from a very small base since the mid-2010s, coinciding with the transition from theoretical physics research to engineering-oriented hardware and software development.</li>
        <li>IBM, Google, D-Wave, and Microsoft dominate quantum computing patenting, investing heavily in superconducting qubits, trapped ions, and software toolchains.</li>
        <li>Error correction remains a central challenge, and patents in error correction and other quantum computing subfields have expanded substantially as the field moves toward fault-tolerant quantum computation.</li>
        <li>Despite small absolute volumes compared to other technology domains, quantum computing patents span multiple CPC sections, suggesting broad potential applications across industries.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Quantum computing emerged from the intersection of quantum mechanics and computer science, with Richard Feynman&apos;s 1982 proposal for quantum simulation marking an intellectual starting point. For decades the field remained largely theoretical, but the 2010s brought a marked shift toward practical hardware implementations. The patent record captures the transition: early filings focused on physical realizations and quantum algorithms, while recent activity is dominated by physical realizations -- superconducting circuits, trapped-ion systems, and photonic architectures -- alongside a growing body of work on quantum error correction. Google&apos;s 2019 quantum supremacy demonstration accelerated both corporate investment and patenting activity. Today, a small number of major technology firms are competing to build fault-tolerant quantum computers, and their patent strategies reveal divergent bets on competing hardware approaches. Although quantum computing patents remain a small fraction of total patent activity, their rapid growth trajectory and cross-domain reach suggest a technology approaching broader industrial relevance, with implications explored further in the organizational analysis of <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Assignee Composition</Link>.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/green-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">green innovation</Link> and the patent system&apos;s response to climate technology across energy, transport, and industrial production, this chapter turns to quantum computing, a domain at the opposite end of the maturity spectrum — small in volume but growing rapidly as hardware implementations move from theory to engineering.
        </p>
        <p>
          Quantum computing represents one of the most technically demanding frontiers in
          computing. This chapter examines the trajectory of <StatCallout value="quantum computing patents" /> --
          from early algorithmic breakthroughs through the hardware competition among major technology
          firms to the current effort toward error-corrected, fault-tolerant machines.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Quantum computing patent activity serves as an indicator of the field&apos;s
          maturation from theoretical research to engineering discipline. The rapid growth
          in patent filings since 2015 coincides with advances in qubit coherence
          times, gate fidelities, and the emergence of cloud-based quantum computing platforms,
          suggesting a transition from primarily academic research to industrial capability building.
        </p>
      </KeyInsight>

      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-quantum-patents-annual-count"
        subtitle="Annual count of utility patents classified under quantum computing-related CPC codes, tracking the growth trajectory of quantum computing patenting."
        title="Quantum Computing Patent Filings Have Grown Rapidly From a Small Base, Reflecting the Field's Transition to Engineering"
        caption="Annual count of utility patents classified under quantum computing-related CPC codes, 1990-2025. The most prominent pattern is the sharp acceleration beginning around 2018, coinciding with advances in superconducting qubit hardware and Google's quantum supremacy announcement in 2019. Grant year shown. Application dates are typically 2–3 years earlier."
        insight="The growth in quantum computing patents coincides with increased corporate investment in quantum hardware and software, following milestones in qubit performance and error correction demonstrated in the late 2010s."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Quantum Computing Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={QUANTUM_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Quantum computing patent filings have exhibited rapid growth since the mid-2010s,
          coinciding with advances in superconducting qubit hardware, trapped-ion systems, and the
          development of quantum software toolchains. Although the absolute volume remains
          small relative to established technology domains such as artificial intelligence
          or semiconductors, the growth rate suggests substantial corporate commitment to
          quantum technologies.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-quantum-patents-share"
        subtitle="Quantum computing patents as a percentage of all utility patents, showing the growing but still modest share of inventive effort directed at quantum technologies."
        title="Quantum Computing's Share of Total Patents Remains Small but Is Rising, Indicating Growing Allocation of R&D Resources"
        caption="Percentage of all utility patents classified under quantum computing-related CPC codes. The upward trend, while starting from a very low base, indicates a genuine reallocation of inventive effort toward quantum technologies."
        insight="The growing share of quantum patents among all patents demonstrates that quantum growth is not merely tracking overall patent expansion; rather, it reflects deliberate investment by technology firms in quantum capabilities."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Quantum Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={QUANTUM_EVENTS}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-quantum-entrant-incumbent"
        title="Quantum Computing Patenting Is Increasingly Shaped by New Entrants as the Field Matures"
        subtitle="Annual patent counts decomposed by entrants (first patent in domain that year) versus incumbents."
        caption="Entrants are assignees filing their first quantum computing patent in a given year. Incumbents had at least one prior-year patent. Grant year shown."
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

      <SectionDivider label="Quantum Computing Subfields" />

      <ChartContainer
        id="fig-quantum-patents-subfields"
        subtitle="Patent counts by quantum computing subfield (algorithms, physical realizations, error correction, and related subfields) over time, based on specific CPC group codes."
        title="Physical Realizations Leads in Volume While All Quantum Subfields Have Grown Rapidly"
        caption="Patent counts by quantum computing subfield over time. The data reveal a shift from theoretical algorithm patents toward physical realizations and error correction, reflecting the field's maturation from theory to engineering."
        insight="The shift toward physical realizations and error correction patents coincides with the field's transition from algorithmic theory to practical hardware engineering in the 2010s."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: QUANTUM_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={QUANTUM_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of quantum computing patents has evolved substantially. Early filings
          focused on physical realizations and quantum algorithms, and physical realizations
          continues to lead in absolute volume. However, Other Quantum Computing and Quantum
          Programming have shown the highest growth rates by ratio, while error correction
          has also expanded rapidly. This diversification reflects the field&apos;s movement
          toward building practical, fault-tolerant quantum computers, with error correction
          emerging as perhaps the single most critical technical challenge.
        </p>
      </KeyInsight>

      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-quantum-patents-top-assignees"
        subtitle="Organizations ranked by total quantum computing patent count, showing concentration among a small number of technology firms."
        title="IBM, Google, D-Wave, and Microsoft Lead Quantum Computing Patenting, Reflecting the Capital-Intensive Nature of Quantum R&D"
        caption="Organizations ranked by total quantum computing patents, 1990-2025. The data indicate strong concentration among a handful of large technology firms that have made significant investments in quantum hardware and software."
        insight="The dominance of a small group of major technology firms in quantum computing patenting reflects the substantial capital requirements of quantum hardware research, which demands cryogenic infrastructure, specialized fabrication, and large physics and engineering teams."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Quantum Computing Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top quantum computing patent holders as a data table"
        headers={['Organization', 'Quantum Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by quantum computing patent count. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Quantum computing patent leadership is concentrated among a small number of firms
          with the resources to sustain long-horizon research programs. IBM has maintained a
          leading position through its decades-long investment in quantum information science,
          while Google&apos;s entry -- culminating in its 2019 quantum supremacy demonstration --
          substantially expanded the company&apos;s patent portfolio. D-Wave&apos;s strong third-place
          position reflects its early and sustained work in quantum annealing, and Microsoft has pursued
          its own hardware and software approaches. The presence of Northrop Grumman (#9)
          among the top assignees underscores the strategic significance of quantum computing.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-quantum-semi-dependence"
        title="A Declining Share of Quantum Computing Entrants Have Prior Semiconductor Experience"
        subtitle="Percentage of quantum computing assignees with prior semiconductor patents, by 5-year entry cohort."
        caption="Prior semiconductor experience measured by whether the assignee filed at least one H01L/H10 patent before their first quantum computing patent. Declining share suggests quantum is attracting new entrants from software and cloud computing rather than traditional semiconductor firms."
        loading={sdL}
      >
        <PWBarChart
          data={semiDep ?? []}
          xKey="cohort"
          bars={[{ key: 'pct_with_semi', name: '% With Semiconductor Experience', color: CHART_COLORS[0] }]}
          yLabel="% of Entrants"
        />
      </ChartContainer>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-quantum-patents-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by quantum computing patent grants from 2005 to 2025, with darker cells indicating higher rank."
          title="Organizational Rankings in Quantum Computing Have Shifted Rapidly as New Entrants Scaled Investment After 2015"
          caption="Annual ranking of the top 15 organizations by quantum computing patent grants, 2005-2025. Darker cells indicate higher rank (more patents). The data reveal rapid reshuffling as firms scaled quantum research programs following hardware breakthroughs."
          insight="The rapid reshuffling of organizational rankings since 2015 reflects the competitive dynamics of a nascent field, where sustained investment and hardware breakthroughs can quickly alter the competitive landscape."
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
          The organizational rankings reveal a field in flux. Unlike more established technology
          domains where leadership positions are relatively stable, quantum computing has seen
          significant reshuffling as new entrants scaled their research operations. The
          concentration of activity among a small cohort of well-resourced firms suggests that
          quantum computing remains in a pre-competitive phase where patent portfolios are being
          built in anticipation of future commercial applications rather than to protect
          current products.
        </p>
      </KeyInsight>

      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-quantum-patents-top-inventors"
        subtitle="Primary inventors ranked by total quantum computing patent count, illustrating the concentration of expertise in a small research community."
        title="Quantum Computing Patenting Is Concentrated Among a Small Cohort of Prolific Inventors at Leading Technology Firms"
        caption="Primary inventors ranked by total quantum computing patents. The distribution exhibits pronounced concentration, reflecting the highly specialized nature of quantum computing research and the small size of the global quantum workforce."
        insight="The concentration of quantum patents among a small number of inventors reflects the specialized expertise required in quantum physics, cryogenics, and quantum information theory -- skills that remain scarce in the global labor market."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Quantum Computing Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific quantum computing inventors are typically affiliated with the
          leading technology firms and national laboratories that dominate the organizational
          rankings. The pronounced concentration of patenting among a small number of individuals
          reflects the highly specialized nature of quantum computing research, which requires
          deep expertise in quantum physics, cryogenic engineering, and quantum information
          theory -- skills that remain scarce in the global labor market.
        </p>
      </KeyInsight>

      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-quantum-patents-by-country"
        subtitle="Countries ranked by total quantum computing patents based on primary inventor location, showing geographic distribution of quantum innovation."
        title="The United States Leads in Quantum Computing Patents, With Significant Contributions From Canada, Japan, and China"
        caption="Countries ranked by total quantum computing patents based on primary inventor location. The United States maintains a substantial lead, while the presence of Canada, Japan, China, and Israel reflects the global nature of quantum research investment."
        insight="The geographic distribution of quantum patents reflects the concentration of quantum research in countries with strong physics traditions and substantial government funding for quantum technologies."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Quantum Computing Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of quantum computing patents reveals the dominant role of
          the United States, supported by substantial government funding through agencies such
          as the National Science Foundation, DARPA, and the Department of Energy. Canada&apos;s
          strong presence reflects the influence of the Perimeter Institute and D-Wave Systems,
          a pioneer in quantum annealing. China&apos;s growing share is consistent with its
          national quantum technology initiative, while Japan&apos;s contributions build on its
          long-standing strengths in semiconductor and materials science research. Israel
          rounds out the top five, reflecting its active quantum technology sector.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-quantum-patents-by-state"
        subtitle="US states ranked by total quantum computing patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California and New York Lead US Quantum Computing Patenting, Reflecting Proximity to Major Corporate and Academic Research Centers"
        caption="US states ranked by total quantum computing patents based on primary inventor location. The clustering of quantum innovation in California, New York, and a few other states reflects the location of major corporate research labs and university quantum programs."
        insight="The geographic concentration of quantum patents in a few states reflects the importance of proximity to major corporate research laboratories and university quantum computing programs."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Quantum Computing Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, quantum computing patenting is concentrated in states that
          host major corporate research laboratories and university quantum programs.
          California&apos;s lead reflects the presence of Google&apos;s quantum AI laboratory,
          IBM&apos;s West Coast research operations, and numerous quantum startups. New York
          benefits from IBM&apos;s primary quantum computing division at the Thomas J. Watson
          Research Center. The geographic clustering suggests strong agglomeration effects
          in quantum computing, where proximity to specialized talent and infrastructure
          creates self-reinforcing concentrations of inventive activity.
        </p>
      </KeyInsight>

      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-quantum-patents-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for quantum computing patents by year, measuring quality trends."
        title="Quantum Computing Technology Scope Peaked in 2020 Before Declining, Suggesting Increasing Specialization"
        caption="Average claims, backward citations, and technology scope for quantum computing patents by year. Technology scope peaked around 2020 before declining, suggesting that after a period of broadening interdisciplinarity, quantum patents have become more specialized."
        insight="Technology scope in quantum patents peaked around 2020 and has since declined, suggesting that after an initial period of broad interdisciplinary exploration, the field is increasingly focusing on more specialized technical challenges."
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
          referenceLines={QUANTUM_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Quantum computing patents exhibit distinctive quality characteristics. Technology scope
          peaked around 2020 before declining, suggesting that after an initial period of broad
          interdisciplinary exploration spanning <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses in physics,
          electrical engineering, and computer science, the field has become more specialized.
          Backward citation patterns indicate an expanding knowledge base, as quantum computing
          draws on advances in materials science, cryogenics, and control systems alongside
          core quantum information theory.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-quantum-quality-bifurcation"
        title="Quantum Computing Maintained High Top-Decile Citation Share, Consistent With a Frontier Domain"
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

      <SectionDivider label="Team Size Comparison" />

      <Narrative>
        <p>
          Quantum computing patents have generally involved larger inventor teams than non-quantum
          patents in recent years, though the gap has narrowed to near-zero. The comparison illustrates the
          capital-intensive, team-based nature of quantum research relative to the broader
          patent system.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-quantum-patents-team-comparison"
        subtitle="Average inventors per patent for quantum versus non-quantum utility patents by year, showing the team size gap between the two categories."
        title="Quantum Patents Generally Involve Larger Teams Than Non-Quantum Patents, Though the Gap Has Converged in Recent Years"
        caption="Average number of inventors per patent for quantum computing versus non-quantum utility patents. The data indicate that quantum patents have generally involved larger teams in recent years, though the gap has narrowed to near-zero by 2023-2025."
        insight="Quantum computing patents have generally involved larger teams than non-quantum patents, though the gap has converged in recent years, reflecting the collaborative yet increasingly efficient nature of quantum research."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Quantum', name: 'Quantum Patents', color: CHART_COLORS[0] },
            { key: 'Non-Quantum', name: 'Non-Quantum Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      <SectionDivider label="Assignee Type Distribution" />

      <ChartContainer
        id="fig-quantum-patents-assignee-type"
        subtitle="Distribution of quantum computing patents by assignee type (corporate, government, individual) over time."
        title="Corporate Assignees Dominate Quantum Computing Patents"
        caption="Distribution of quantum computing patent assignees by type over time. Corporate assignees account for over 98% of quantum patents, with government entities and individual inventors making up the remainder."
        insight="Corporate assignees overwhelmingly dominate quantum computing patenting, accounting for over 98% of filings. Government entities contribute 1.2% and individual inventors 0.2%."
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
          Corporate assignees account for over 98% of quantum computing patents, with
          government entities contributing 1.2% and individual inventors 0.2%.
          While several universities appear among top individual assignees, the aggregate
          university share is minimal -- there is no separate &quot;University&quot; category in the
          assignee type data. The pronounced corporate dominance reflects the capital-intensive
          nature of quantum computing research, which requires cryogenic infrastructure,
          specialized fabrication facilities, and large multidisciplinary teams that are
          most readily sustained within major technology firms.
        </p>
      </KeyInsight>

      <SectionDivider label="Quantum Computing Strategies" />

      <Narrative>
        <p>
          The leading quantum computing patent holders pursue markedly different hardware and
          software strategies. Some firms concentrate on superconducting qubit architectures,
          while others invest in trapped ions, topological approaches, or quantum software
          and algorithms. A comparison of subfield portfolios across major holders reveals
          where each organization concentrates its inventive effort and identifies areas of
          strategic differentiation.
        </p>
      </Narrative>

      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Quantum Patents</th>
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
          The strategy table reveals divergent bets among the leading quantum computing patent
          holders. IBM has built the broadest portfolio, spanning algorithms, physical
          realizations, and error correction. Google maintains a broad portfolio spanning
          physical realizations, quantum algorithms, error correction, and other quantum
          computing approaches. Microsoft&apos;s portfolio emphasizes quantum algorithms and
          error correction, alongside physical realizations. Intel, though a smaller quantum
          patent holder, focuses primarily on physical realizations. These strategic
          differences suggest that the field has not yet converged on a dominant hardware
          paradigm.
        </p>
      </KeyInsight>

      <SectionDivider label="Cross-Domain Diffusion" />

      <Narrative>
        <p>
          Although quantum computing remains a relatively young technology domain, its patents
          increasingly co-occur with CPC codes from other technology areas. Tracking this
          cross-domain diffusion provides insight into the expanding application space of
          quantum technologies, from cryptography and materials simulation to optimization
          and machine learning.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-quantum-patents-diffusion"
        subtitle="Percentage of quantum computing patents co-classified with other CPC sections, measuring quantum technology's diffusion into adjacent domains."
        title="Quantum Computing Patents Show Growing Co-Occurrence With Electricity and Physics CPC Sections, Indicating Hardware Maturation"
        caption="Percentage of quantum computing patents that also carry CPC codes from each non-quantum section. Rising lines indicate quantum technology diffusing into that sector. The co-occurrence with Electricity (H) reflects quantum hardware's deep ties to electrical engineering, while connections to other sections suggest broadening applications."
        insight="The growing co-occurrence of quantum patents with diverse CPC sections suggests that quantum computing is beginning to diffuse beyond pure physics into adjacent application domains, though the pattern remains more concentrated than for established general-purpose technologies such as AI."
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
            yLabel="% of Quantum Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={QUANTUM_EVENTS}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Quantum computing patents show a growing pattern of cross-domain diffusion, though
          it remains more concentrated than for established general-purpose technologies such
          as artificial intelligence. The strong co-occurrence with Electricity (H) reflects
          the deep ties between quantum hardware and electrical engineering, while the growing
          sporadic co-occurrence with Chemistry and Metallurgy (C), typically below 2%, suggests
          limited but present connections to materials science applications. The pattern is consistent with quantum
          computing&apos;s potential as a future general-purpose technology that has not yet
          reached the diffusion levels of more mature domains.
        </p>
      </KeyInsight>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-quantum-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in quantum computing patenting."
        title="Top-4 Concentration in Quantum Computing Patents Declined From 76.9% in 2003 to 28.4% by 2025"
        caption="CR4 computed as the sum of the top 4 organizations' annual patent counts divided by total quantum patents. The extremely high early concentration reflects the field's origin in a handful of corporate and government research labs. The decline to 28% by 2025, while still the highest among mature ACT 6 domains, indicates broadening participation."
        insight="Quantum computing's high residual concentration (28%) is consistent with the enormous capital requirements for quantum hardware research, which limit participation to well-funded organizations with access to cryogenic facilities and specialized fabrication capabilities."
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
        id="fig-quantum-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across quantum computing subfields."
        title="Quantum Computing Subfield Diversity Increased From 0.78 in 2006 to 0.95 by 2025, Reflecting the Field's Broadening Technical Scope"
        caption="Normalized Shannon entropy (H/ln(N)) ranges from 0 (all activity in one subfield) to 1 (perfectly even distribution). The increase from 0.78 to 0.95 indicates a shift from predominantly physical realizations to a balanced distribution across quantum algorithms, error correction, quantum networking, and hybrid classical-quantum systems."
        insight="The high entropy by 2025 suggests that quantum computing has matured beyond the hardware-only phase into a multi-layered technology stack, with significant inventive activity at the algorithm, software, and application layers."
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
        id="fig-quantum-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a quantum computing patent."
        title="Quantum Computing 2020s Entrants Average 6.0 Patents per Year, Similar to 2010s Entrants at 5.9"
        caption="Mean patents per active year for top quantum organizations grouped by entry decade. Only cohorts with three or more organizations are shown. The 1990s cohort (2 organizations: IBM and D-Wave) does not meet the minimum threshold and is excluded, though those early entrants averaged 11.0 patents per year. Among qualifying cohorts (2000s, 2010s, 2020s), velocity has remained relatively stable, suggesting that the field's rapid growth reflects breadth of participation rather than intensification by individual firms."
        insight="The relatively stable velocity across the 2000s, 2010s, and 2020s cohorts suggests that quantum computing's growth reflects primarily new entrants rather than increased per-firm productivity. The 1990s cohort (2 organizations, excluded for small sample size) had much higher velocity, reflecting the pioneering scale of IBM and D-Wave."
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
        Having documented the growth of quantum computing in the patent system, the trajectory of this field illustrates how foundational physics research can transition into an engineering discipline with broad industrial potential. The organizational strategies behind quantum patenting are explored further in <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Assignee Composition</Link>, while the relationship between quantum computing and semiconductor innovation is examined in the <Link href="/chapters/semiconductors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Semiconductors</Link> chapter.
      </Narrative>

      <ChartContainer
        id="fig-quantum-filing-vs-grant"
        title="Quantum Filing Peaked at 579 in 2021 While Grants Reached 660 in 2024 — Rapid Growth on a Small Base"
        subtitle="Annual patent filings versus grants for quantum computing, showing the field's recent acceleration."
        caption="Quantum computing exhibits rapid recent growth in both filings and grants, though from a very small base. The filing-to-grant lag reflects both the technical complexity of quantum patent examination and the rapid expansion of filings after 2017. Grants surpassed the filing peak in 2024, reflecting the processing of the 2019-2021 filing surge."
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
        learned={["Quantum computing remains the most concentrated technology domain, with top-four firms holding 28.4% in 2025, down from 76.9% in 2003.", "It is the only domain where early entrants (1990s cohort) patent faster than later entrants, reflecting high hardware IP barriers to entry."]}
        falsifiable="If high concentration reflects genuine technical barriers rather than strategic patent thickets, then new entrants should produce patents with lower scope and fewer claims than incumbents."
        nextAnalysis={{ label: "Semiconductors", description: "The silicon foundation of modern technology — the only domain with rising concentration", href: "/chapters/semiconductors" }}
      />

      <DataNote>
        Quantum computing patents are identified using CPC classifications G06N10 (quantum
        computing algorithms and architectures) and H01L39 (superconducting devices). A patent
        is classified as quantum computing-related if any of its CPC codes fall within
        these groups. Note: G06N10 patents are also counted in the AI domain (which uses
        the broader G06N prefix), and H01L39 patents overlap with the semiconductor domain. Subfield classifications are based on more
        specific CPC group codes. Strategy data show patent counts per quantum sub-area for
        the top assignees. Cross-domain diffusion measures co-occurrence of quantum CPC codes
        with other CPC sections.
      </DataNote>

      <RelatedChapters currentChapter={32} />
      <ChapterNavigation currentChapter={32} />
    </div>
  );
}
