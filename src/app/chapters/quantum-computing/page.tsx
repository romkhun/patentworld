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
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { QUANTUM_EVENTS } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
} from '@/lib/types';

export default function Chapter14() {
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

  return (
    <div>
      <ChapterHeader
        number={14}
        title="Quantum Computing"
        subtitle="From theoretical foundations to practical hardware"
      />

      <KeyFindings>
        <li>Quantum computing patents have grown rapidly from a very small base, reflecting the transition from theoretical physics to engineering-oriented hardware and software development.</li>
        <li>IBM, Google, Intel, and Microsoft dominate quantum computing patenting, investing heavily in superconducting qubits, trapped ions, and software toolchains.</li>
        <li>Error correction remains a central challenge, and patents in this subfield have grown disproportionately as the field moves toward fault-tolerant quantum computation.</li>
        <li>Despite small absolute volumes compared to other technology domains, quantum computing patents span multiple CPC sections, suggesting broad potential applications across industries.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Quantum computing emerged from the intersection of quantum mechanics and computer science, with Richard Feynman&apos;s 1982 proposal for quantum simulation marking an intellectual starting point. For decades the field remained largely theoretical, but the 2010s brought a dramatic shift toward practical hardware implementations. The patent record captures this transition vividly: early filings focused on quantum algorithms and theoretical models, while recent activity is dominated by physical realizations -- superconducting circuits, trapped-ion systems, and photonic architectures -- alongside a growing body of work on quantum error correction. Google&apos;s 2019 quantum supremacy demonstration accelerated both corporate investment and patenting activity. Today, a small number of technology giants are racing to build fault-tolerant quantum computers, and their patent strategies reveal divergent bets on competing hardware approaches. Although quantum computing patents remain a tiny fraction of total patent activity, their rapid growth trajectory and cross-domain reach suggest a technology on the cusp of broader industrial relevance, with implications explored further in the organizational analysis of <Link href="/chapters/company-profiles" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Company Innovation Profiles</Link>.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/semiconductors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">semiconductor</Link> patenting trends and the silicon foundation of modern computing, this chapter turns to the closely related field of quantum computing, where advances in qubit hardware depend on the same fabrication expertise documented in the preceding chapter.
        </p>
        <p>
          Quantum computing represents one of the most ambitious frontiers in the history of
          computing. This chapter examines the trajectory of <StatCallout value="quantum computing patents" /> --
          from early algorithmic breakthroughs through the hardware race among technology
          giants to the current push toward error-corrected, fault-tolerant machines.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Quantum computing patent activity serves as a leading indicator of the field&apos;s
          maturation from theoretical curiosity to engineering discipline. The rapid growth
          in patent filings since 2015 coincides with significant advances in qubit coherence
          times, gate fidelities, and the emergence of cloud-based quantum computing platforms,
          reflecting a transition from academic research to industrial capability building.
        </p>
      </KeyInsight>

      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-quantum-patents-annual-count"
        subtitle="Annual count of utility patents classified under quantum computing-related CPC codes, tracking the growth trajectory of quantum computing patenting."
        title="Quantum Computing Patent Filings Have Grown Rapidly From a Small Base, Reflecting the Field's Transition to Engineering"
        caption="Annual count of utility patents classified under quantum computing-related CPC codes, 1990-2025. The most prominent pattern is the sharp acceleration beginning around 2015, coinciding with advances in superconducting qubit hardware and Google's quantum supremacy announcement in 2019."
        insight="The exponential growth in quantum computing patents mirrors increased corporate investment in quantum hardware and software, driven by milestones in qubit performance and error correction."
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
          driven by advances in superconducting qubit hardware, trapped-ion systems, and the
          development of quantum software toolchains. Although the absolute volume remains
          small relative to established technology domains such as artificial intelligence
          or semiconductors, the growth rate signals substantial corporate commitment to
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
          yFormatter={(v) => `${v.toFixed(2)}%`}
          referenceLines={QUANTUM_EVENTS}
        />
      </ChartContainer>

      <SectionDivider label="Subfields" />

      <ChartContainer
        id="fig-quantum-patents-subfields"
        subtitle="Patent counts by quantum computing subfield (algorithms, physical realizations, error correction, etc.) over time, based on specific CPC group codes."
        title="Physical Realizations and Error Correction Have Emerged as the Fastest-Growing Quantum Computing Subfields"
        caption="Patent counts by quantum computing subfield over time. The data reveal a shift from theoretical algorithm patents toward physical realizations and error correction, reflecting the field's maturation from theory to engineering."
        insight="The shift toward physical realizations and error correction patents reflects the field's transition from algorithmic theory to practical hardware engineering."
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
          concentrated on quantum algorithms and theoretical models, but the recent surge is
          dominated by physical realizations -- superconducting circuits, trapped ions, and
          photonic systems -- alongside a rapidly growing body of work on quantum error
          correction. This shift from theory to engineering reflects the field&apos;s movement
          toward building practical, fault-tolerant quantum computers, with error correction
          emerging as perhaps the single most critical technical challenge.
        </p>
      </KeyInsight>

      <SectionDivider label="Organizations" />

      <ChartContainer
        id="fig-quantum-patents-top-assignees"
        subtitle="Organizations ranked by total quantum computing patent count, showing concentration among a small number of technology firms."
        title="IBM, Google, Intel, and Microsoft Lead Quantum Computing Patenting, Reflecting the Capital-Intensive Nature of Quantum R&D"
        caption="Organizations ranked by total quantum computing patents, 1990-2025. The data indicate strong concentration among a handful of large technology firms that have made significant investments in quantum hardware and software."
        insight="The dominance of a small group of technology giants in quantum computing patenting reflects the extraordinary capital requirements of quantum hardware research, which demands cryogenic infrastructure, specialized fabrication, and large physics and engineering teams."
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
          rapidly elevated the company&apos;s patent portfolio. Intel and Microsoft have pursued
          alternative hardware approaches (silicon spin qubits and topological qubits,
          respectively), and their patent filings reflect these distinctive technical strategies.
          The presence of defense contractors and national laboratories in the rankings
          underscores the strategic significance of quantum computing.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-quantum-patents-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by quantum computing patent grants from 2005 to 2025, with darker cells indicating higher rank."
          title="Organizational Rankings in Quantum Computing Have Shifted Rapidly as New Entrants Scaled Investment After 2015"
          caption="Annual ranking of the top 15 organizations by quantum computing patent grants, 2005-2025. Darker cells indicate higher rank (more patents). The data reveal rapid reshuffling as firms scaled quantum research programs following hardware breakthroughs."
          insight="The rapid reshuffling of organizational rankings since 2015 reflects the competitive dynamics of a nascent field, where sustained investment and hardware breakthroughs can quickly alter the competitive landscape."
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
          The organizational rankings reveal a field in flux. Unlike more established technology
          domains where leadership positions are relatively stable, quantum computing has seen
          significant reshuffling as new entrants scaled their research operations. The
          concentration of activity among a small cohort of well-resourced firms suggests that
          quantum computing remains in a pre-competitive phase where patent portfolios are being
          built in anticipation of future commercial applications rather than to protect
          current products.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventors" />

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
          rankings. The extreme concentration of patenting among a small number of individuals
          reflects the highly specialized nature of quantum computing research, which requires
          deep expertise in quantum physics, cryogenic engineering, and quantum information
          theory -- skills that remain scarce in the global labor market.
        </p>
      </KeyInsight>

      <SectionDivider label="Geography" />

      <ChartContainer
        id="fig-quantum-patents-by-country"
        subtitle="Countries ranked by total quantum computing patents based on primary inventor location, showing geographic distribution of quantum innovation."
        title="The United States Leads in Quantum Computing Patents, With Significant Contributions From Japan, Canada, and China"
        caption="Countries ranked by total quantum computing patents based on primary inventor location. The United States maintains a substantial lead, while the presence of Canada, Japan, and China reflects the global nature of quantum research investment."
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
          long-standing strengths in semiconductor and materials science research.
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
        title="Quantum Computing Patents Show Rising Technology Scope, Reflecting Growing Interdisciplinarity as the Field Matures"
        caption="Average claims, backward citations, and technology scope for quantum computing patents by year. The rising technology scope suggests that quantum patents are becoming increasingly interdisciplinary, spanning physics, electrical engineering, and computer science."
        insight="Rising technology scope in quantum patents reflects the growing interdisciplinarity of quantum computing, which bridges fundamental physics, materials science, electrical engineering, and computer science."
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
          Quantum computing patents exhibit distinctive quality characteristics. The growing
          technology scope reflects the inherently interdisciplinary nature of quantum computing,
          which spans <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses in physics,
          electrical engineering, and computer science. Backward citation patterns indicate an
          expanding knowledge base, as quantum computing draws on advances in materials science,
          cryogenics, and control systems alongside core quantum information theory.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-quantum-patents-team-size"
        subtitle="Average number of named inventors per quantum computing patent by year, reflecting the collaborative nature of quantum research."
        title="Quantum Computing Patent Teams Are Large and Growing, Reflecting the Multidisciplinary Expertise Required"
        caption="Average number of inventors per quantum computing patent by year. The consistently large team sizes reflect the extraordinary range of expertise required, spanning quantum physics, cryogenic engineering, microwave electronics, and software development."
        insight="Growing team sizes reflect the increasing complexity of quantum computing systems, which require expertise spanning quantum physics, cryogenic engineering, microwave electronics, materials science, and software development."
        loading={qL}
      >
        <PWLineChart
          data={quality ?? []}
          xKey="year"
          lines={[
            { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[5] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={QUANTUM_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The large and growing team sizes for quantum computing patents underscore the
          extraordinary range of expertise required to advance the field. Building a quantum
          computer demands contributions from quantum physicists, cryogenic engineers,
          microwave electronics specialists, materials scientists, and software developers --
          a breadth of expertise that necessitates large, multidisciplinary research teams
          and is reflected in the patent record.
        </p>
      </KeyInsight>

      <SectionDivider label="Team Size Comparison" />

      <Narrative>
        <p>
          Quantum computing patents consistently involve larger inventor teams than non-quantum
          patents, and this gap has widened over time. The comparison illustrates the
          capital-intensive, team-based nature of quantum research relative to the broader
          patent system.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-quantum-patents-team-comparison"
        subtitle="Average inventors per patent for quantum vs. non-quantum utility patents by year, showing the team size gap between the two categories."
        title="Quantum Patents Consistently Involve Larger Teams Than Non-Quantum Patents, Reflecting the Field's Collaborative Research Model"
        caption="Average number of inventors per patent for quantum computing vs. non-quantum utility patents. The data indicate that quantum patents consistently involve larger teams, reflecting the multidisciplinary expertise required for quantum computing research."
        insight="Quantum computing patents consistently involve larger teams than non-quantum patents, reflecting the collaborative, multidisciplinary nature of quantum research that requires physicists, engineers, and computer scientists working together."
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
        subtitle="Distribution of quantum computing patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Dominate Quantum Computing Patenting, Though Universities Play a Larger Role Than in Most Technology Domains"
        caption="Distribution of quantum computing patent assignees by type over time. Corporate assignees have intensified their share since 2015, though university and government laboratory contributions remain more significant than in many other technology domains, reflecting quantum computing's roots in academic and government-funded research."
        insight="While corporate assignees have come to dominate quantum computing patenting, the relatively large share of university and government patents reflects the field's origins in academic physics and sustained public investment in quantum research."
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
          The assignee type distribution in quantum computing patents reveals a notable
          distinction from other technology domains: universities and government laboratories
          account for a larger share of total filings, reflecting the field&apos;s origins in
          academic physics and sustained public investment through agencies such as the
          National Science Foundation and the Department of Energy. However, the corporate
          share has grown rapidly since 2015 as technology firms scaled their quantum
          research programs, suggesting a gradual transition from publicly funded exploration
          to commercially motivated development.
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
          realizations, and error correction. Google&apos;s filings are concentrated in
          superconducting qubit hardware and quantum algorithms, consistent with its pursuit
          of quantum supremacy. Microsoft&apos;s portfolio reflects its distinctive bet on
          topological qubits, while Intel&apos;s filings emphasize silicon-based approaches
          that leverage its existing semiconductor fabrication expertise. These strategic
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
          connections to Chemistry and Metallurgy (C) suggest expanding applications in
          materials simulation and drug discovery. The pattern is consistent with quantum
          computing&apos;s potential as a future general-purpose technology that has not yet
          reached the diffusion levels of more mature domains.
        </p>
      </KeyInsight>

      <Narrative>
        Having documented the growth of quantum computing in the patent system, the trajectory of this field illustrates how foundational physics research can transition into an engineering discipline with broad industrial potential. The organizational strategies behind quantum patenting are explored further in <Link href="/chapters/company-profiles" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Company Innovation Profiles</Link>, while the relationship between quantum computing and semiconductor innovation is examined in the <Link href="/chapters/semiconductors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Semiconductors</Link> chapter. The next chapter examines <Link href="/chapters/cybersecurity" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">cybersecurity</Link>, a domain where quantum computing poses both a fundamental threat to existing cryptographic systems and a potential source of new post-quantum security methods.
      </Narrative>

      <DataNote>
        Quantum computing patents are identified using CPC classifications related to quantum
        computing hardware, algorithms, error correction, and related technologies. A patent
        is classified as quantum computing-related if any of its CPC codes fall within the
        relevant quantum computing categories. Subfield classifications are based on more
        specific CPC group codes. Strategy data show patent counts per quantum sub-area for
        the top assignees. Cross-domain diffusion measures co-occurrence of quantum CPC codes
        with other CPC sections.
      </DataNote>

      <RelatedChapters currentChapter={14} />
      <ChapterNavigation currentChapter={14} />
    </div>
  );
}
