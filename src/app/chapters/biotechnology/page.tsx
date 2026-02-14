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
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import Link from 'next/link';
import { CHART_COLORS, CPC_SECTION_COLORS, BIOTECH_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { BIOTECH_EVENTS } from '@/lib/referenceEvents';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
} from '@/lib/types';

export default function Chapter14() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('biotech/biotech_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('biotech/biotech_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('biotech/biotech_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('biotech/biotech_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('biotech/biotech_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('biotech/biotech_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('biotech/biotech_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('biotech/biotech_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('biotech/biotech_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('biotech/biotech_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('biotech/biotech_assignee_type.json');

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
        title="Biotechnology &amp; Gene Editing"
        subtitle="Engineering life at the molecular level"
      />

      <KeyFindings>
        <li>Biotechnology patenting has grown substantially since the 1980s, catalyzed by the Bayh-Dole Act (1980) which enabled universities to patent federally funded inventions and transformed academic research into a pipeline for commercial biotechnology.</li>
        <li>The completion of the Human Genome Project in 2003 and the publication of CRISPR-Cas9 gene editing in 2012 represent inflection points that reshaped the composition of biotech patents, shifting activity toward genomic technologies and precision gene editing.</li>
        <li>Unlike AI patenting, which is dominated by technology firms, biotech patents are concentrated among research universities (University of California, Harvard, Stanford), agricultural biotech firms (Monsanto, Pioneer Hi-Bred, DuPont), and enzyme companies (Novozymes), reflecting the distinct institutional structure of life sciences innovation.</li>
        <li>The rapid development and patenting of mRNA vaccine technology during the COVID-19 pandemic demonstrated the capacity of the biotech patent system to respond to public health emergencies at a notably accelerated pace.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Biotechnology patenting in the United States reflects a half-century transformation in
          how society harnesses molecular biology for commercial and therapeutic purposes. The
          Bayh-Dole Act of 1980 enabled a substantial expansion of university-originated patents, while
          the completion of the Human Genome Project in 2003 and the discovery of CRISPR-Cas9
          gene editing in 2012 catalyzed successive waves of inventive activity. The institutional
          landscape of biotech patenting differs markedly from domains such as artificial
          intelligence: research universities, agricultural biotech firms, enzyme companies, and
          life sciences tools makers play prominent roles, and the ethical and regulatory dimensions of gene editing technology
          create unique constraints on how patents translate into products. The COVID-19 pandemic
          further demonstrated the strategic importance of biotech patent portfolios, as mRNA
          vaccine technology moved from laboratory concept to global deployment in under a year.
          This chapter traces the growth, composition, and organizational structure of biotechnology
          patenting across the full span of the modern patent system.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/cybersecurity" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">cybersecurity</Link> patenting and the defense of digital infrastructure, this chapter shifts from the digital domain to the life sciences, where biotechnology patents address a fundamentally different set of challenges in molecular biology and genetic engineering.
        </p>
        <p>
          Biotechnology occupies a distinctive position within the patent system. Unlike most
          technology domains where the path from invention to commercialization is relatively
          direct, biotech patents frequently emerge from basic scientific research conducted at
          universities and government laboratories, traverse lengthy regulatory approval processes,
          and raise profound ethical questions about the boundaries of patentable subject matter.
          This chapter examines the trajectory of biotechnology and gene editing patents -- from
          the recombinant DNA revolution of the 1970s through the genomic era and the current
          frontier of precision gene editing.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Biotechnology patent activity serves as a barometer of the life sciences innovation
          ecosystem. The field has been shaped by a series of landmark scientific breakthroughs --
          recombinant DNA technology, polymerase chain reaction, the Human Genome Project, and
          CRISPR-Cas9 -- each of which generated distinctive waves of patenting activity. The
          interplay between academic discovery, commercial development, and regulatory oversight
          makes biotech patenting uniquely complex among technology domains.
        </p>
      </KeyInsight>

      {/* == Section 1: Growth Trajectory ====================================== */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-biotech-annual-count"
        subtitle="Annual count of utility patents classified under biotechnology-related CPC codes, tracking the growth trajectory of biotech patenting."
        title="Biotechnology Patent Filings Have Grown Substantially Since the 1980s, With Notable Fluctuations"
        caption="Annual count of utility patents classified under biotechnology-related CPC codes, 1976-2025. The growth trajectory reflects successive waves driven by the Bayh-Dole Act (1980), the Human Genome Project completion (2003), and the CRISPR-Cas9 publication (2012)."
        insight="The sustained growth of biotech patents reflects the expanding commercial potential of molecular biology, with each major scientific breakthrough triggering a new wave of inventive activity."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Biotech Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={BIOTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Biotechnology patent filings have exhibited substantial growth since the early 1980s, with a notable dip in the early 2000s,
          when the Bayh-Dole Act enabled universities to patent inventions arising from federally
          funded research. This legislative change was consequential for the life sciences,
          creating a direct pathway from academic laboratories to commercial development. The
          completion of the Human Genome Project in 2003 accelerated genomic patenting, while the
          publication of CRISPR-Cas9 gene editing technology in 2012 opened a new
          frontier of precision genetic engineering.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-biotech-share"
        subtitle="Biotech patents as a percentage of all utility patents, showing the evolving weight of life sciences in the innovation system."
        title="Biotechnology's Share of Total Patents Reflects the Growing Centrality of Life Sciences Innovation"
        caption="Percentage of all utility patents classified under biotechnology-related CPC codes. Biotech's share rose to approximately 2.1% in the late 1990s before settling in the 1.6-1.8% range in recent years, reflecting how molecular biology has become a stable but significant component of the patent system."
        insight="The growing share of biotech patents among all patents demonstrates that life sciences innovation is not merely tracking overall patent expansion but represents a genuine structural shift in the composition of American inventive activity."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Biotech Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={BIOTECH_EVENTS}
        />
      </ChartContainer>

      {/* == Section 2: Subfields ============================================= */}
      <SectionDivider label="Biotech Subfields" />

      <ChartContainer
        id="fig-biotech-subfields"
        subtitle="Patent counts by biotechnology subfield (gene editing, recombinant DNA, enzyme engineering, etc.) over time, based on CPC classifications."
        title="Recombinant DNA and Expression Vectors Have Shown the Strongest Growth Since 2012"
        caption="Patent counts by biotechnology subfield over time, based on CPC classifications. The data reveal strong growth in recombinant DNA (+156%) and expression vectors (+109%) since 2012, alongside the emergence of gene editing and nucleic acid detection methods."
        insight="The subfield composition of biotech patents has shifted substantially since 2012, with recombinant DNA technology continuing to grow -- more than tripling since 2012 -- while gene editing and expression vector technologies have also expanded considerably."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: BIOTECH_SUBFIELD_COLORS[name] ?? '#999999',
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={BIOTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of biotechnology patents has evolved substantially over the past five
          decades. Early biotech patenting was dominated by enzyme engineering -- the most active subfield in the field&apos;s earliest years. Since 2012, gene
          editing and modification patents have expanded rapidly, driven by the development of CRISPR-Cas9 technology, which
          made precise genomic alterations faster, cheaper, and more accessible. Enzyme engineering
          and nucleic acid detection have also experienced considerable growth, reflecting advances
          in directed evolution (recognized by the 2018 Nobel Prize in Chemistry) and the
          proliferation of PCR-based and next-generation sequencing diagnostic platforms,
          particularly during the COVID-19 pandemic.
        </p>
      </KeyInsight>

      {/* == Section 3: Organizations ========================================= */}
      <SectionDivider label="Organizations" />

      <ChartContainer
        id="fig-biotech-top-assignees"
        subtitle="Organizations ranked by total biotechnology patent count, showing the institutional landscape of life sciences innovation."
        title="Research Universities and Agricultural Biotech Firms Dominate Biotechnology Patenting"
        caption="Organizations ranked by total biotechnology-related patents, 1976-2025. The data reveal a distinctive institutional mix: research universities (University of California, Harvard, Stanford), agricultural biotech firms (Monsanto, Pioneer Hi-Bred, DuPont), and enzyme companies (Novozymes) dominate the rankings, reflecting the diverse origins of biotech innovation."
        insight="The organizational landscape of biotech patenting differs markedly from AI, where large technology firms dominate. In biotechnology, research universities, agricultural biotech firms, enzyme companies, and life sciences tools makers are the major patent holders, reflecting the field's diverse institutional roots."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Biotech Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top biotech patent holders as a data table"
        headers={['Organization', 'Biotech Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by biotechnology patent count, 1976-2025. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          The leading biotechnology patent holders reflect the distinctive institutional structure
          of life sciences innovation. Unlike artificial intelligence, where technology corporations
          overwhelmingly dominate, biotech patenting features a notably diverse organizational
          landscape. Agricultural biotech firms such as Monsanto, Pioneer Hi-Bred, and DuPont are
          among the top patent holders, alongside enzyme companies like Novozymes. Research
          universities -- empowered by the Bayh-Dole Act -- hold prominent positions, with the
          University of California ranking first overall, and Harvard and Stanford also in the top ten.
          This mix of agricultural biotech, life sciences tools companies, and academic institutions
          is a defining feature of the biotech innovation ecosystem, with technology transfer
          offices serving as critical intermediaries between academic discovery and commercial
          application.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-biotech-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by biotechnology patent grants, with darker cells indicating higher rank."
          title="Organizational Leadership in Biotech Patenting Has Shifted as Gene Editing and mRNA Technologies Reshaped Competitive Dynamics"
          caption="Annual ranking of the top 15 organizations by biotechnology patent grants, 1990-2025. Darker cells indicate higher rank (more patents). The data reveal how successive technological waves -- genomics, gene editing, and mRNA -- have altered the competitive landscape of biotech patenting."
          insight="The organizational rankings reveal dynamic competition in biotech patenting, with pharmaceutical incumbents facing challenges from specialized biotechnology firms and research-intensive universities as new technologies reshape the field."
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
          The ranking data illustrate how successive technological breakthroughs have reshaped
          organizational leadership in biotech patenting. The completion of the Human Genome Project
          catalyzed a wave of genomic patenting that benefited firms positioned in sequencing and
          diagnostics. The CRISPR revolution after 2012 created new competitive dynamics, with
          specialized gene editing companies and academic institutions claiming significant patent
          positions. The COVID-19 pandemic further disrupted rankings as mRNA platform companies
          rapidly expanded their patent portfolios. These shifts underscore how, in biotechnology,
          scientific breakthroughs can rapidly alter the organizational hierarchy of innovation.
        </p>
      </KeyInsight>

      {/* == Section 4: Inventors ============================================= */}
      <SectionDivider label="Inventors" />

      <ChartContainer
        id="fig-biotech-top-inventors"
        subtitle="Primary inventors ranked by total biotechnology patent count, illustrating the distribution of individual inventive output in the life sciences."
        title="The Most Prolific Biotech Inventors Reflect the Field's Deep Connection to Academic Research and Pharmaceutical R&D"
        caption="Primary inventors ranked by total biotechnology-related patents, 1976-2025. The distribution reveals that prolific biotech inventors are frequently affiliated with universities and pharmaceutical firms, reflecting the academic origins of many biotech breakthroughs."
        insight="The concentration of biotech patenting among prolific inventors affiliated with universities and pharmaceutical companies highlights the field's dependence on deep scientific expertise and long-term research programs."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Biotech Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific biotechnology inventors are characteristically affiliated with
          research universities and pharmaceutical companies that maintain long-term programs in
          genetic engineering, molecular biology, and drug development. Unlike AI, where the most
          productive inventors tend to cluster in corporate research laboratories of technology
          firms, biotech invention exhibits a stronger connection to academic science. Many of the
          leading biotech inventors hold joint appointments as university faculty and industry
          consultants, embodying the dual institutional structure that defines life sciences
          innovation.
        </p>
      </KeyInsight>

      {/* == Section 5: Geography ============================================= */}
      <SectionDivider label="Geography" />

      <ChartContainer
        id="fig-biotech-by-country"
        subtitle="Countries ranked by total biotechnology patents based on primary inventor location, showing the geographic distribution of biotech innovation."
        title="The United States Leads in Biotech Patenting, With Significant Contributions From Japan, Germany, and Emerging Asian Economies"
        caption="Countries ranked by total biotechnology-related patents based on primary inventor location. The United States maintains a substantial lead, reflecting its extensive network of research universities, NIH-funded research, and pharmaceutical industry concentration."
        insight="The geographic distribution of biotech patents reflects the importance of national research funding infrastructure, regulatory frameworks, and the concentration of pharmaceutical and life sciences firms."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Biotech Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of biotechnology patents reveals the dominant role of the
          United States, which benefits from the world&apos;s largest biomedical research
          funding apparatus through the National Institutes of Health, a dense network of
          research universities, and the concentration of major life sciences firms. Japan and
          Germany maintain strong positions reflecting their historical strengths in chemical
          and pharmaceutical engineering. The United Kingdom and France also rank prominently,
          ahead of China and South Korea, reflecting Europe&apos;s deep life sciences research
          tradition. The growing presence of China and South Korea in biotech patenting signals
          the expansion of life sciences capabilities in East Asia, driven by substantial
          government investment in genomics and biomanufacturing.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-biotech-by-state"
        subtitle="US states ranked by total biotechnology patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="Biotech Patenting Clusters in States With Major Research Universities and Pharmaceutical Industry Presence"
        caption="US states ranked by total biotechnology-related patents based on primary inventor location. The data reflect the co-location of research universities, NIH-funded medical centers, pharmaceutical companies, and venture capital that characterizes leading biotech hubs."
        insight="The state-level distribution of biotech patents reveals distinct clusters driven by the co-location of research universities, teaching hospitals, pharmaceutical firms, and venture capital -- the key ingredients of the biotech innovation ecosystem."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Biotech Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, biotechnology patenting clusters in states that combine
          leading research universities, NIH-funded medical centers, life sciences industry
          headquarters, and venture capital availability. California and Massachusetts are
          particularly prominent, reflecting the Bay Area biotech corridor and the Boston-Cambridge
          life sciences cluster. Iowa ranks sixth nationally, driven by Pioneer Hi-Bred&apos;s
          agricultural biotechnology headquarters, illustrating the significant role of crop
          science in biotech patenting. New Jersey benefits from its historical concentration
          of pharmaceutical and life sciences companies, while states such as Maryland and North
          Carolina have developed growing biotech ecosystems anchored by research triangle
          institutions and federal research facilities.
        </p>
      </KeyInsight>

      {/* == Section 6: Quality Indicators ===================================== */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-biotech-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for biotechnology patents by year, measuring quality trends."
        title="Biotech Patent Quality Indicators Reveal Growing Complexity and Interdisciplinarity Over Time"
        caption="Average claims, backward citations, and technology scope for biotechnology-related patents by year. The trends suggest that biotech patents have become more complex and interconnected, consistent with the expanding intersection of molecular biology with informatics, engineering, and clinical science."
        insight="Rising backward citations and technology scope suggest that biotech patents are becoming increasingly interconnected and interdisciplinary, reflecting the convergence of molecular biology with computational methods, materials science, and clinical applications."
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
          referenceLines={BIOTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Biotechnology patents exhibit distinctive quality characteristics. The growing number
          of backward citations reflects the increasingly interconnected nature of life sciences
          research, where inventions build upon extensive prior art spanning molecular biology,
          biochemistry, pharmacology, and clinical medicine. The expanding technology scope
          indicates that biotech inventions increasingly span multiple CPC subclasses, consistent
          with the convergence of biological engineering with computational methods, materials
          science, and medical device technology. The trend in claim counts reflects evolving
          patent drafting strategies in the life sciences, where applicants must navigate
          complex patentability requirements for biological subject matter.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-biotech-team-size"
        subtitle="Average number of named inventors per biotechnology patent by year, reflecting the collaborative nature of life sciences research."
        title="Biotech Patent Team Sizes Have Grown Steadily, Reflecting the Multidisciplinary Nature of Modern Life Sciences Research"
        caption="Average number of inventors per biotechnology-related patent by year. The upward trend is consistent with the growing complexity of biotech research, which requires expertise spanning molecular biology, bioinformatics, clinical science, and regulatory affairs."
        insight="Growing team sizes in biotech patents reflect the increasingly multidisciplinary nature of life sciences innovation, where successful inventions require collaboration across molecular biology, bioinformatics, chemistry, and clinical expertise."
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
          referenceLines={BIOTECH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The growing team size for biotechnology patents reflects the increasingly
          multidisciplinary nature of life sciences research. Modern biotech inventions frequently
          require collaboration among molecular biologists, bioinformaticians, chemical engineers,
          clinicians, and regulatory specialists. The Bayh-Dole Act further encouraged
          collaborative teams by incentivizing university-industry partnerships, while the
          complexity of gene editing technologies and mRNA platforms has necessitated even larger
          and more diverse research groups.
        </p>
      </KeyInsight>

      {/* == Section 7: Patenting Strategies =================================== */}
      <SectionDivider label="Biotech Patenting Strategies" />
      <Narrative>
        <p>
          The leading biotechnology patent holders pursue distinct strategic approaches. Some
          organizations concentrate heavily on gene editing and modification technologies, while
          others maintain diversified portfolios spanning recombinant DNA, enzyme engineering, and
          nucleic acid detection. A comparison of subfield portfolios across major holders reveals
          the strategic choices that define each organization&apos;s approach to biotech innovation
          and identifies subfields where competitive intensity is highest.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Biotech Patents</th>
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
          The strategic portfolios of leading biotech patent holders reveal distinctive
          organizational approaches. Agricultural biotech firms concentrate heavily on &quot;Other Genetic Engineering&quot; -- Monsanto holds 1,729 patents and Pioneer Hi-Bred 1,326 patents in this subfield alone, reflecting their focus on crop trait engineering. Research universities often hold stronger positions in gene
          editing and fundamental genetic engineering methods, reflecting their role as originators
          of basic scientific breakthroughs. Specialized biotechnology firms frequently focus on
          narrow but high-value niches such as enzyme engineering or nucleic acid detection
          platforms. The diversity of strategic approaches across organizations underscores the
          breadth of the biotechnology field and the multiple pathways through which inventive
          effort can create commercial value.
        </p>
      </KeyInsight>

      {/* == Section 8: Cross-Domain Diffusion ================================= */}
      <SectionDivider label="Biotech as a Platform Technology" />
      <Narrative>
        <p>
          A defining characteristic of platform technologies is their diffusion into multiple
          sectors of the economy. By tracking how frequently biotechnology-classified patents also
          carry CPC codes from non-biotech technology areas, it is possible to measure the spread
          of biotech methods into healthcare delivery, agriculture, industrial chemistry, and
          other domains. The breadth of this diffusion provides evidence for biotechnology&apos;s
          role as a foundational technology with applications far beyond its immediate field.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-biotech-diffusion"
        subtitle="Percentage of biotech patents co-classified with non-biotech CPC sections, measuring biotechnology's diffusion into healthcare, agriculture, and industry."
        title="Biotechnology Patents Show Increasing Co-Classification With Healthcare, Physics, and Agricultural CPC Codes"
        caption="Percentage of biotechnology patents that also carry CPC codes from each non-biotech CPC section. Rising lines indicate biotech methods diffusing into that sector. The most prominent pattern is the strong and growing co-occurrence with Human Necessities (Section A, encompassing healthcare and agriculture) and Physics (Section G, encompassing measurement and testing technologies)."
        insight="The co-classification of biotech patents with healthcare (Section A) and physics (Section G) CPC codes reflects the fundamental role of molecular biology in drug development, agriculture, diagnostics, and measurement technologies. The growing co-occurrence with other sections suggests expanding applications of biotech methods across the economy."
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
            yLabel="% of Biotech Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={BIOTECH_EVENTS}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Biotechnology exhibits the characteristics of a platform technology with broad
          applicability across the economy. The strong co-classification with Human Necessities
          (Section A) reflects biotech&apos;s deep connections to healthcare, pharmaceuticals,
          and agriculture -- the sectors where genetic engineering has had its most significant
          impact. The substantial co-occurrence with Physics (Section G, encompassing measurement and
          testing technologies) reflects the importance of analytical and diagnostic instrumentation
          in the field, while growing connections to other sections
          suggest that biotech methods are increasingly being applied to industrial processes,
          materials science, and environmental remediation. This cross-domain diffusion pattern
          supports the characterization of biotechnology as a general-purpose technology whose
          influence extends well beyond the life sciences.
        </p>
      </KeyInsight>

      {/* == Section 9: Team Comparison ======================================== */}
      <SectionDivider label="The Collaborative Structure of Biotech Innovation" />

      <Narrative>
        <p>
          Biotechnology patents increasingly involve larger inventor teams, reflecting the
          multidisciplinary nature of modern life sciences research. Comparing team sizes between
          biotech and non-biotech patents reveals how the collaborative demands of genetic
          engineering, clinical trials, and regulatory compliance shape the structure of inventive
          activity in the life sciences.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-biotech-team-comparison"
        subtitle="Average inventors per patent for biotech vs. non-biotech utility patents by year, showing the widening collaboration gap."
        title="Biotech Patents Consistently Involve Larger Teams Than Non-Biotech Patents, Reflecting the Multidisciplinary Demands of Life Sciences"
        caption="Average number of inventors per patent for biotechnology-related vs. non-biotech utility patents, 1976-2025. The data indicate that biotech patents have consistently involved larger teams, and the gap has widened as the complexity of genetic engineering, genomics, and clinical development has increased."
        insight="Biotech patents consistently involve larger teams than non-biotech patents, and the gap has widened over time. This pattern reflects the inherent multidisciplinarity of life sciences innovation, which requires collaboration across molecular biology, chemistry, clinical medicine, and increasingly computational science."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Biotech', name: 'Biotech Patents', color: CHART_COLORS[0] },
            { key: 'Non-Biotech', name: 'Non-Biotech Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      {/* == Section 10: Assignee Types ======================================== */}
      <ChartContainer
        id="fig-biotech-assignee-type"
        subtitle="Distribution of biotech patents by assignee type (corporate, university, government, individual) over time, revealing the distinctive institutional mix."
        title="Corporate Assignees Dominate Aggregate Biotech Patent Counts, Though Individual Universities Rank Highly"
        caption="Distribution of biotechnology patent assignees by type (corporate, university, government, individual) over time. Corporate assignees account for 96-98% of biotech patents in the aggregate categorization. Notably, while individual universities such as the University of California (#1 overall), Harvard (#8), and Stanford (#10) rank among the top assignees, the aggregate &quot;University/Other&quot; category remains small, suggesting many university-originated patents may be assigned to corporate licensees."
        insight="The assignee type distribution reveals an apparent paradox: while individual universities rank among the top biotech patent holders, the aggregate University/Other category accounts for less than 1% of patents. This disconnect likely reflects the practice of assigning university-originated inventions to corporate licensees and spin-off companies."
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
          The distribution of biotechnology patents by assignee type reveals an instructive
          disconnect. Corporate assignees account for 96-98% of biotech patents in the aggregate
          data, yet individual universities rank among the very top assignees -- the University of
          California holds the most biotech patents of any organization, and Harvard and Stanford
          both appear in the top ten. This apparent paradox likely reflects the common practice
          whereby university-originated inventions are assigned to corporate licensees, spin-off
          companies, or joint ventures, causing them to appear as corporate patents in aggregate
          categorizations. The Bayh-Dole Act&apos;s impact on academic patenting may thus be
          understated by aggregate assignee type data, as many commercially significant biotech
          inventions originate in university laboratories but are ultimately held by corporate entities.
        </p>
      </KeyInsight>

      {/* == Section 11: Ethical and Regulatory Dimensions ==================== */}
      <SectionDivider label="Ethical and Regulatory Considerations" />

      <Narrative>
        <p>
          Biotechnology and gene editing patents occupy a unique position at the intersection of
          innovation policy, bioethics, and public health regulation. The Supreme Court&apos;s
          decision in Association for Molecular Pathology v. Myriad Genetics (2013) established
          that naturally occurring DNA sequences cannot be patented, while synthetic cDNA
          remains patentable -- a distinction that continues to shape patent strategy in genomics.
          The ongoing CRISPR patent dispute between the Broad Institute and the University of
          California illustrates how foundational biotech patents can become the subject of
          protracted legal battles with billions of dollars in commercial value at stake.
        </p>
        <p>
          Gene editing technologies raise particularly acute ethical questions. The ability to
          modify human germline cells -- changes that would be inherited by future generations --
          has prompted international calls for moratoriums and regulatory frameworks that have no
          parallel in other technology domains. These ethical and regulatory dimensions create
          unique constraints on how biotech patents translate into products and therapies,
          distinguishing the field from domains such as artificial intelligence or semiconductors
          where the path from patent to market is less encumbered by ethical oversight.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The ethical and regulatory landscape surrounding biotechnology patents creates both
          constraints and incentives that shape inventive activity in distinctive ways. Patent
          exclusivity provides the economic incentive necessary to justify the substantial
          investment required for drug development and clinical trials -- a process that typically
          costs over a billion dollars and spans more than a decade. At the same time, the
          patentability of biological materials remains subject to evolving legal standards and
          ethical considerations that have no direct analogue in other technology domains. The
          tension between incentivizing innovation and ensuring equitable access to
          life-saving technologies -- exemplified by debates over mRNA vaccine patents during the
          COVID-19 pandemic -- remains one of the most consequential policy questions in the
          modern patent system. The next chapter examines <Link href="/chapters/digital-health" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">digital health and medical devices</Link>, a domain where biotechnology innovations increasingly converge with computing and sensor technologies to transform healthcare delivery.
        </p>
      </KeyInsight>

      <DataNote>
        Biotechnology patents are identified using CPC classifications related to genetic
        engineering and molecular biology, including C12N (microorganisms, enzymes, and mutation
        or genetic engineering), C12Q (measuring or testing involving enzymes or
        microorganisms), and related codes. Subfield classifications distinguish gene editing
        and modification, expression vectors, recombinant DNA, enzyme engineering, nucleic acid
        detection, and other genetic engineering categories. A patent is classified as
        biotechnology-related if any of its CPC codes fall within these categories. Geographic
        attribution is based on the primary inventor&apos;s location. Strategy data show patent
        counts per biotech sub-area for the top assignees. Diffusion analysis measures
        co-occurrence of biotech CPC codes with non-biotech CPC sections. Source: PatentsView / USPTO.
      </DataNote>

      <RelatedChapters currentChapter={14} />
      <ChapterNavigation currentChapter={14} />
    </div>
  );
}
