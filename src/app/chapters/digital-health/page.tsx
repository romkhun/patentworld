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
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { RankingTable } from '@/components/chapter/RankingTable';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { cleanOrgName } from '@/lib/orgNames';
import { CHART_COLORS, CPC_SECTION_COLORS, DIGIHEALTH_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { DIGIHEALTH_EVENTS } from '@/lib/referenceEvents';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
  DomainEntrantIncumbent, DomainQualityBifurcation,
  DigihealthRegulatorySplit,
} from '@/lib/types';

export default function Chapter18() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('digihealth/digihealth_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('digihealth/digihealth_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('digihealth/digihealth_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('digihealth/digihealth_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('digihealth/digihealth_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('digihealth/digihealth_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('digihealth/digihealth_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('digihealth/digihealth_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('digihealth/digihealth_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('digihealth/digihealth_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('digihealth/digihealth_assignee_type.json');
  const { data: entrantIncumbent, loading: eiL } = useChapterData<DomainEntrantIncumbent[]>('digihealth/digihealth_entrant_incumbent.json');
  const { data: qualityBif, loading: qbL } = useChapterData<DomainQualityBifurcation[]>('digihealth/digihealth_quality_bifurcation.json');
  const { data: regSplit, loading: rsL } = useChapterData<DigihealthRegulatorySplit[]>('digihealth/digihealth_regulatory_split.json');

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

  // Pivot entrant/incumbent data
  const eiPivot = useMemo(() => {
    if (!entrantIncumbent) return [];
    return entrantIncumbent.map((d) => ({ year: d.year, Entrant: d.entrant_count, Incumbent: d.incumbent_count }));
  }, [entrantIncumbent]);

  const regSplitPivot = useMemo(() => {
    if (!regSplit) return [];
    const years = [...new Set(regSplit.map(d => d.year))].sort();
    return years.map(year => {
      const row: any = { year };
      regSplit.filter(d => d.year === year).forEach(d => { row[d.category] = d.patent_count; });
      return row;
    });
  }, [regSplit]);

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
        number={30}
        title="Digital Health & Medical Devices"
        subtitle="Technology transforming healthcare delivery"
      />
      <MeasurementSidebar slug="digital-health" />

      <KeyFindings>
        <li>Digital health patent filings have grown substantially since 2009, with notable growth following the 2009 HITECH Act&apos;s mandate for electronic health record adoption and the 2020 COVID-19 pandemic, which coincided with rapid expansion of telemedicine adoption.</li>
        <li>Patient monitoring -- encompassing vital signs, diagnostic imaging, and physiological signals -- constitutes the largest subfield, reflecting the centrality of continuous data capture to modern healthcare.</li>
        <li>Surgical robotics, led by Intuitive Surgical (1,994 patents) and the da Vinci platform, has emerged as one of the fastest-growing subfields, with substantial growth in minimally invasive procedure technologies.</li>
        <li>Health informatics and clinical decision support are increasingly integrated with artificial intelligence, driving a convergence between digital health and machine learning technologies.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Digital health sits at the intersection of medicine and computing, encompassing technologies that range from bedside patient monitors to cloud-based clinical decision support systems. The trajectory of digital health patenting has been shaped by two significant developments: the 2009 HITECH Act, which mandated electronic health record adoption and catalyzed a wave of health IT investment, and the COVID-19 pandemic, which compressed years of telemedicine adoption into months. The organizational landscape is dominated by medical device firms such as Philips, Medtronic, and Intuitive Surgical, alongside technology companies including IBM and Samsung -- yet the growing role of AI in clinical decision support is drawing even more technology firms into the domain, a convergence explored further in the chapter on <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Artificial Intelligence</Link>. Surgical robotics represents an active frontier, where Intuitive Surgical&apos;s da Vinci system has demonstrated how patent-protected platforms can reshape surgical disciplines.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/cybersecurity" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">cybersecurity</Link> and the escalating arms race between digital threats and defensive innovation, this chapter turns to digital health, a domain where data security considerations increasingly intersect with patient monitoring and clinical decision support.
        </p>
        <p>
          Digital health bridges the worlds of medicine and computing, encompassing a broad
          range of technologies designed to capture, analyze, and act upon health-related data.
          This chapter traces the evolution of digital health patenting -- from early patient
          monitoring devices through the electronic health records revolution to the current
          era of AI-driven clinical decision support and robotic surgery.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Digital health patent activity serves as an indicator of technological
          transformation in healthcare delivery. The acceleration of filings observed following the
          HITECH Act and the COVID-19 pandemic coincides with regulatory mandates and public
          health emergencies that have been associated with increased innovation activity in
          healthcare technology.
        </p>
      </KeyInsight>

      {/* ── Section 1: Growth Trajectory ─────────────────────────────────── */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-digihealth-annual-count"
        subtitle="Annual count of utility patents classified under digital health CPC codes, tracking the growth trajectory of digital health patenting."
        title="Digital Health Patent Filings Have Grown Substantially Since 2009, Driven by the HITECH Act and COVID-19 Pandemic"
        caption="Annual count and share of utility patents classified under digital health CPC codes, 1976-2025. The two most prominent inflection points coincide with the 2009 HITECH Act, which mandated EHR adoption, and the 2020 COVID-19 pandemic, which was followed by rapid expansion of telemedicine and remote monitoring adoption. Grant year shown. Application dates are typically 2–3 years earlier."
        insight="The growth trajectory of digital health patents coincides with regulatory mandates (HITECH Act), public health emergencies (COVID-19), and advances in sensor technology, wireless connectivity, and cloud computing."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Digital Health Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={DIGIHEALTH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Digital health patent filings exhibit two distinct acceleration phases. The first
          followed the 2009 HITECH Act, which allocated billions in incentive payments for
          electronic health record adoption, coinciding with increased investment in health IT
          infrastructure. The second began in 2020, coinciding with the COVID-19 pandemic and rapid
          deployment of telemedicine, remote patient monitoring, and digital diagnostics during
          2020-2021.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-digihealth-share"
        subtitle="Digital health patents as a percentage of all utility patents, showing the growing allocation of inventive effort toward healthcare technology."
        title="Digital Health&apos;s Share of Total Patents Has Risen Steadily, Indicating a Genuine Reallocation of Inventive Effort"
        caption="Percentage of all utility patents classified under digital health CPC codes. The upward trend indicates that digital health patenting growth is not merely tracking overall patent expansion but represents a disproportionate concentration of inventive effort in healthcare technology."
        insight="The growing share of digital health patents among all patents demonstrates a genuine reallocation of inventive effort toward healthcare technology, driven by regulatory incentives, demographic trends, and the digitization of clinical workflows."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Digital Health Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={DIGIHEALTH_EVENTS}
        />
      </ChartContainer>

      {/* ── Section 2: Subfields ─────────────────────────────────────────── */}
      <SectionDivider label="Digital Health Subfields" />

      <ChartContainer
        id="fig-digihealth-subfields"
        subtitle="Patent counts by digital health subfield (patient monitoring, health informatics, surgical robotics, etc.) over time."
        title="Patient Monitoring Dominates Digital Health Patenting, While Surgical Robotics and Health Informatics Are the Fastest-Growing Subfields"
        caption="Patent counts by digital health subfield over time. Patient monitoring -- encompassing vital signs, diagnostic imaging, and physiological signals -- constitutes the largest category. Surgical robotics and health informatics have exhibited the most rapid growth in recent years."
        insight="The shift toward health informatics and surgical robotics coincides with a broader transformation from passive data capture to active clinical decision-making, as AI and robotic technologies have enabled more sophisticated clinical interventions."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: DIGIHEALTH_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={DIGIHEALTH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of digital health patents reveals the evolving priorities of healthcare
          technology. Patient monitoring has long been the dominant subfield, reflecting the
          foundational importance of continuous physiological data capture. More recently,
          surgical robotics -- led by platforms such as Intuitive Surgical&apos;s da Vinci system
          -- has emerged as a rapidly growing category, while health informatics and clinical
          decision support have expanded in tandem with advances in artificial intelligence and
          machine learning.
        </p>
      </KeyInsight>

      {/* ── Section 3: Organizations ─────────────────────────────────────── */}
      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-digihealth-top-assignees"
        subtitle="Organizations ranked by total digital health patent count, showing concentration among established medical device and healthcare technology firms."
        title="Philips, Medtronic, Intuitive Surgical, and Covidien Lead in Digital Health Patent Volume"
        caption="Organizations ranked by total digital health patents. The data indicate a concentration among established medical device manufacturers and diversified healthcare technology conglomerates, reflecting the capital-intensive nature of medical device R&D and the regulatory barriers to entry."
        insight="The dominance of established medical device firms reflects the substantial regulatory, clinical validation, and manufacturing requirements that characterize healthcare technology innovation."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Digital Health Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top digital health patent holders as a data table"
        headers={['Organization', 'Digital Health Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by digital health patent count, 1976-2025. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Digital health patent leadership reflects a concentration among firms with deep
          expertise in medical device engineering, clinical workflows, and regulatory
          compliance. Philips (2,909 patents), Medtronic (2,302), Intuitive Surgical (1,994),
          and Covidien (1,880) lead in total patent volume, while technology companies such as
          IBM and Samsung also rank among the top holders. The presence of both medical device
          firms and technology companies indicates the cross-disciplinary nature of competition
          in digital health innovation.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-digihealth-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by digital health patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="Organizational Leadership in Digital Health Has Shifted as Technology Firms Enter the Medical Device Space"
          caption="Annual ranking of the top 15 organizations by digital health patent grants, 2000-2025. Darker cells indicate higher rank (more patents). The data reveal shifts in competitive positioning as traditional medical device firms face growing competition from technology companies expanding into healthcare."
          insight="The evolving rankings reflect the ongoing convergence of medical device expertise and digital technology capabilities, as firms compete to define the future of connected healthcare."
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
          The ranking data reveal important shifts in organizational dominance. Traditional
          medical device leaders such as Medtronic and Philips have maintained strong positions,
          but the emergence of technology-oriented firms in the rankings reflects the growing
          importance of software, connectivity, and data analytics in healthcare. The
          convergence of medical device expertise with digital technology capabilities is
          reshaping competitive dynamics in ways that parallel the broader transformation
          documented in the chapter on the <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">technology revolution</Link>.
        </p>
      </KeyInsight>

      {/* ── Section 4: Inventors ──────────────────────────────────────────── */}
      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-digihealth-top-inventors"
        subtitle="Primary inventors ranked by total digital health patent count, illustrating the distribution of individual inventive output."
        title="The Most Prolific Digital Health Inventors Are Typically Affiliated With Major Medical Device Firms"
        caption="Primary inventors ranked by total digital health patents. The distribution exhibits pronounced skewness, with a small number of highly productive individuals -- often associated with leading medical device companies -- accounting for a disproportionate share of output."
        insight="The concentration of digital health patenting among a small cohort of prolific inventors mirrors the broader superstar pattern in innovation, amplified by the specialized clinical and engineering expertise required in medical technology."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Digital Health Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific digital health inventors are typically affiliated with established
          medical device firms that maintain dedicated R&D divisions spanning hardware
          engineering, signal processing, and clinical validation. The specialized knowledge
          required to navigate both technological and regulatory challenges in healthcare
          creates high barriers to entry for individual inventors, reinforcing the concentration
          of output among experienced teams at major organizations.
        </p>
      </KeyInsight>

      {/* ── Section 5: Geography ──────────────────────────────────────────── */}
      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-digihealth-by-country"
        subtitle="Countries ranked by total digital health patents based on primary inventor location, showing geographic distribution of healthcare technology innovation."
        title="The United States Leads in Digital Health Patents, With Israel, South Korea, and Japan as Notable Contributors"
        caption="Countries ranked by total digital health patents based on primary inventor location. The United States maintains a substantial lead, while Israel, South Korea, Japan, and the Netherlands reflect the global distribution of medical device and health technology R&D."
        insight="The geographic distribution of digital health patents reflects both the concentration of major medical device headquarters and the distributed nature of clinical research partnerships across advanced economies."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Digital Health Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of digital health patents reveals the dominant role of
          the United States, supported by its concentration of major healthcare systems,
          medical device firms, and academic medical centers. Israel and South Korea rank
          prominently, reflecting their active health technology sectors and medical device
          industries. Japan and the Netherlands (home to Philips) also contribute substantially,
          while Germany&apos;s position reflects Siemens&apos;s medical technology operations.
          This distribution differs from the AI patent landscape, where East Asian electronics
          firms play a more prominent role.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-digihealth-by-state"
        subtitle="US states ranked by total digital health patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California and Massachusetts Lead US Digital Health Patenting, Reflecting Medical Device and Health IT Industry Clusters"
        caption="US states ranked by total digital health patents based on primary inventor location. California&apos;s lead reflects Silicon Valley&apos;s health technology ecosystem, while Massachusetts&apos;s strong second-place position is driven by its concentration of medical device firms, health IT companies, and academic medical centers."
        insight="The geographic clustering of digital health patents in California and Massachusetts reflects distinct innovation ecosystems: Silicon Valley&apos;s technology-driven health startups and Boston&apos;s established medical device and health IT corridor."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Digital Health Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, digital health patenting is concentrated in California
          and Massachusetts -- the two leading states by a substantial margin. California&apos;s
          leadership reflects the Silicon Valley health technology corridor, where
          software-driven approaches to clinical decision support and telemedicine predominate.
          Massachusetts ranks second, driven by its concentration of medical device firms,
          health IT companies, and the academic medical centers of the Boston corridor.
          Minnesota, ranked third, benefits from the Minneapolis-St. Paul medical device
          cluster anchored by Medtronic, while New York rounds out the top four.
        </p>
      </KeyInsight>

      {/* ── Section 6: Quality Indicators ─────────────────────────────────── */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-digihealth-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for digital health patents by year, measuring quality trends."
        title="Digital Health Patent Technology Scope Has Risen Over Time, Reflecting Growing Interdisciplinarity Across Medical and Computing Domains"
        caption="Average claims, backward citations, and technology scope for digital health patents by year. The upward trend in technology scope suggests that digital health patents increasingly span multiple CPC subclasses, consistent with the interdisciplinary nature of healthcare technology."
        insight="Rising technology scope reflects the interdisciplinary nature of digital health, where innovations increasingly bridge medical device engineering, signal processing, software, and clinical science."
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
          referenceLines={DIGIHEALTH_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Digital health patents exhibit distinctive quality characteristics. The growing
          number of backward citations reflects the increasingly interconnected nature of
          healthcare technology research, drawing on prior art from medical devices, computing,
          and clinical science. The expanding technology scope indicates that digital health
          inventions are becoming more interdisciplinary, spanning multiple CPC subclasses as
          innovations integrate hardware, software, and clinical methodologies.
        </p>
      </KeyInsight>

      {/* ── Section 7: Digital Health Strategies ──────────────────────────── */}
      <SectionDivider label="Digital Health Patenting Strategies" />

      <Narrative>
        <p>
          The leading digital health patent holders pursue different strategies.
          Certain firms concentrate on patient monitoring hardware, while others emphasize
          health informatics and clinical decision support. A comparison of subfield portfolios
          across major holders reveals where each organization concentrates its inventive
          effort and identifies areas of emerging competition.
        </p>
      </Narrative>

      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Digital Health Patents</th>
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
          Strategic differences among leading organizations reflect their distinct competitive
          positions. Medtronic&apos;s portfolio emphasizes vital signs monitoring and
          physiological signals, consistent with its implantable device heritage. Philips and
          GE Healthcare maintain broad portfolios spanning diagnostic imaging and health
          informatics. Siemens concentrates on medical imaging informatics and healthcare IT
          infrastructure. The emergence of surgical robotics as a distinct strategic focus --
          particularly for Intuitive Surgical -- illustrates how patent-protected platforms
          can define new categories of medical intervention.
        </p>
      </KeyInsight>

      {/* ── Section 8: Cross-Domain Diffusion ─────────────────────────────── */}
      <SectionDivider label="Digital Health as a Cross-Domain Technology" />

      <Narrative>
        <p>
          A defining characteristic of digital health is its diffusion across multiple
          technology domains. By tracking how frequently digital health patents also carry CPC
          codes from other technology areas, it is possible to measure the spread of healthcare
          technology into computing, chemistry, and other sectors -- and conversely, the
          adoption of external technologies within healthcare.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-digihealth-diffusion"
        subtitle="Percentage of digital health patents co-classified with other CPC sections, measuring cross-domain technology integration."
        title="Digital Health Patents Show Growing Co-Occurrence With Electricity and Performing Operations CPC Codes, Reflecting Deepening Technology Integration"
        caption="Percentage of digital health patents that also carry CPC codes from each non-primary section. Rising lines indicate increasing integration between digital health and that technology sector. The most notable pattern is the growing co-occurrence with Electricity (Section H, encompassing electronic circuits and communication) and Performing Operations (Section B, encompassing surgical instruments and transporting)."
        insight="The cross-domain diffusion of digital health patents is consistent with its characterization as an integrative technology that draws on computing, materials science, and clinical methodologies to deliver healthcare innovations."
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
            yLabel="% of Digital Health Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={DIGIHEALTH_EVENTS}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Digital health increasingly exhibits the characteristics of a cross-domain
          technology. The highest co-occurrence is with Electricity (Section H), which
          encompasses electronic circuits, communication, and electric signaling -- reflecting
          the deep integration of electronic systems into medical devices. Performing Operations
          (Section B), covering surgical instruments and mechanical processes, is also strongly
          represented. Co-occurrence with Chemistry (Section C) indicates connections to
          pharmaceutical and biochemical technologies. This pattern of broad diffusion suggests
          that digital health innovation is not confined to a single technology silo but draws
          on -- and contributes to -- advances across multiple sectors of the economy.
        </p>
      </KeyInsight>

      {/* ── Section 9: Team Comparison ────────────────────────────────────── */}
      <SectionDivider label="The Complexity of Digital Health Innovation" />

      <Narrative>
        <p>
          Since the mid-1990s, digital health patents have involved more inventors per patent
          than non-digital-health patents, and this gap has widened over time as the complexity
          of integrating clinical, engineering, and regulatory requirements has grown. Corporate
          assignees dominate, reflecting the multidisciplinary nature of modern healthcare
          technology.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-digihealth-team-comparison"
        subtitle="Average inventors per patent for digital health vs. non-digital-health utility patents by year, showing the complexity gap between the two categories."
        title="Since the Mid-1990s, Digital Health Patents Have Involved Larger Teams Than Non-Digital-Health Patents"
        caption="Average number of inventors per patent for digital health vs. non-digital-health utility patents, 1976-2025. Before the mid-1990s, digital health team sizes were comparable to or slightly smaller than non-digital-health patents. Since then, digital health teams have grown larger, reflecting the increasing need for expertise spanning biomedical engineering, software development, clinical science, and regulatory affairs."
        insight="Since the mid-1990s, digital health patents have involved larger teams than non-digital-health patents, a pattern that reflects the growing multidisciplinary demands of integrating clinical knowledge, engineering expertise, and regulatory compliance."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'DigiHealth', name: 'Digital Health Patents', color: CHART_COLORS[0] },
            { key: 'Non-DigiHealth', name: 'Non-Digital-Health Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      {/* ── Section 10: Assignee Type ─────────────────────────────────────── */}
      <ChartContainer
        id="fig-digihealth-assignee-type"
        subtitle="Distribution of digital health patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Dominate Digital Health Patenting, With Growing University Contributions in Health Informatics"
        caption="Distribution of digital health patent assignees by type over time. Corporate assignees have dominated throughout, consistent with the capital-intensive requirements of medical device R&D. University contributions have grown in absolute terms, particularly in health informatics and clinical decision support."
        insight="The corporate dominance of digital health patenting reflects the substantial capital, regulatory expertise, and clinical validation infrastructure required to bring medical technologies to market."
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
          The growth in team sizes and corporate dominance in digital health patenting
          underscores the resource-intensive nature of healthcare technology innovation.
          Unlike software-centric technology domains where individual inventors and startups
          can make disproportionate contributions, medical device innovation requires substantial
          investment in clinical trials, regulatory submissions, and manufacturing -- creating
          structural advantages for large, established organizations with existing
          relationships with healthcare systems and regulatory agencies.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-digihealth-regulatory-split"
        title="Traditional Medical Device Firms Dominate Digital Health Patenting, but Big Tech Is Growing"
        subtitle="Patent counts by assignee category: traditional med-device firms, Big Tech entrants, and all others."
        caption="Med-device category includes Medtronic, Becton Dickinson, Boston Scientific, Stryker, Siemens Healthineers, Philips, Abbott, Edwards, Baxter, Intuitive Surgical. Big Tech includes Apple, Google, Microsoft, Amazon, Samsung, Meta."
        loading={rsL}
      >
        <PWAreaChart
          data={regSplitPivot}
          xKey="year"
          areas={[
            { key: 'Med Device', name: 'Med Device', color: CHART_COLORS[0] },
            { key: 'Big Tech', name: 'Big Tech', color: CHART_COLORS[1] },
            { key: 'Other', name: 'Other', color: CHART_COLORS[3] },
          ]}
          stacked
          yLabel="Patents"
        />
      </ChartContainer>

      {/* ── Section 11: Closing Narrative ─────────────────────────────────── */}
      <Narrative>
        <p>
          Having documented the growth of digital health in the patent system, the analysis
          reveals a domain undergoing rapid transformation. The convergence of patient
          monitoring hardware with AI-driven clinical decision support, the expansion of
          telemedicine catalyzed by the COVID-19 pandemic, and the growth of surgical robotics
          collectively point toward a future in which the boundaries between medical devices
          and computing platforms become increasingly indistinct. The organizational strategies
          documented here are explored further in{' '}
          <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">
            Firm Innovation
          </Link>, while the broader relationship between digital health and artificial
          intelligence is examined in the chapter on{' '}
          <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">
            Artificial Intelligence
          </Link>.
        </p>
      </Narrative>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />
      <p className="text-sm text-muted-foreground mt-4">
        For metric definitions and cross-domain comparisons, see the <Link href="/chapters/deep-dive-overview" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">ACT 6 Overview</Link>.
      </p>

      <ChartContainer
        id="fig-digihealth-entrant-incumbent"
        title="Digital Health Patent Growth Is Driven Primarily by Incumbent Medical Device and Technology Firms"
        subtitle="Annual patent counts decomposed by entrants (first patent in domain that year) vs. incumbents."
        caption="Entrants are assignees filing their first digital health patent in a given year. Incumbents had at least one prior-year patent. Grant year shown."
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
        id="fig-digihealth-quality-bifurcation"
        title="Digital Health Top-Decile Citation Share Remained Relatively Stable Despite Volume Growth"
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
        id="fig-digihealth-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in digital health patenting."
        title="Top-4 Concentration in Digital Health Patents Peaked at 12.0% in 2009 Before Declining to 6.8% by 2025"
        caption="CR4 computed as the sum of the top 4 organizations&apos; annual patent counts divided by total digital health patents. The moderate peak reflects Philips and Medtronic&apos;s early dominance, while the decline coincides with technology firms entering the medical device space after the HITECH Act."
        insight="Digital health&apos;s low concentration is consistent with the sector&apos;s fragmented competitive landscape, where medical device incumbents, technology firms, and academic medical centers each contribute significant but non-dominant patent volumes."
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
        id="fig-digihealth-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across digital health subfields."
        title="Digital Health Subfield Diversity Rose From 0.49 in 1976 to 0.92 by 2025, Reflecting the Convergence of Medical and Computing Domains"
        caption="Normalized Shannon entropy of digital health subfield patent distributions. The increase from 0.49 to 0.92 reflects the evolution from narrow patient monitoring devices to a broad ecosystem spanning surgical robotics, health informatics, telemedicine, wearable diagnostics, and AI-assisted imaging."
        insight="The diversification trajectory is consistent with digital health&apos;s transition from standalone medical devices to integrated systems requiring expertise across electronics, software, biomaterials, and clinical science."
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
        id="fig-digihealth-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a digital health patent."
        title="Later Digital Health Entrants Patent at Substantially Higher Velocity: 2010s Cohort Averages 77.5 Patents per Year Versus 22.5 for 1970s Entrants"
        caption="Mean patents per active year for top digital health organizations grouped by entry decade. The 3.4x increase from 1970s to 2010s cohorts reflects the acceleration of digital health patenting driven by the HITECH Act, smartphone proliferation, and COVID-19."
        insight="The sharp velocity increase for 2010s entrants coincides with the convergence of consumer electronics and medical devices, where technology firms like Apple and Google brought aggressive patent strategies to the health domain."
        loading={taL}
      >
        <PWBarChart
          data={velocityData}
          xKey="decade"
          bars={[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]}
          yLabel="Mean Patents / Year"
        />
      </ChartContainer>

      <InsightRecap
        learned={["Digital health patent velocity jumped 3.4-fold from 22.5 patents/year (1970s entrants) to 77.5 (2010s entrants).", "Philips (2,909 patents), Medtronic (2,302), and Intuitive Surgical (1,994) lead the field, with subfield diversity rising from 0.49 to 0.92."]}
        falsifiable="If the velocity increase reflects genuine health-tech convergence, then digital health patents should increasingly span both medical (A61) and computing (G06) CPC subclasses."
        nextAnalysis={{ label: "Green Innovation", description: "Climate technology patents from niche to mainstream — batteries, EVs, and renewables", href: "/chapters/green-innovation" }}
      />

      <DataNote>
        Digital health patents are identified using CPC classifications spanning patient
        monitoring (A61B5), diagnostic imaging (A61B6, A61B8), electronic health records
        (G16H10), clinical decision support (G16H50), health informatics (G16H), surgical
        robotics (A61B34), and related medical device codes. Subfield classifications are
        based on specific CPC group codes within these categories. A patent is classified
        as digital health if any of its CPC codes fall within these classifications. Team
        comparison data compare average inventor counts for digital health vs. non-digital-health
        utility patents. Strategy data show patent counts per subfield for the top assignees.
        Cross-domain diffusion measures co-occurrence of digital health CPC codes with other
        CPC sections. Source: PatentsView / USPTO.
      </DataNote>

      <RelatedChapters currentChapter={30} />
      <ChapterNavigation currentChapter={30} />
    </div>
  );
}
