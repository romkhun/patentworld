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
import { CHART_COLORS, CPC_SECTION_COLORS, CYBER_SUBFIELD_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { CYBER_EVENTS } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
} from '@/lib/types';

export default function Chapter17() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('cyber/cyber_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('cyber/cyber_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('cyber/cyber_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('cyber/cyber_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('cyber/cyber_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('cyber/cyber_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('cyber/cyber_org_over_time.json');
  const { data: cyberStrategies } = useChapterData<DomainStrategy[]>('cyber/cyber_strategies.json');
  const { data: cyberDiffusion, loading: cdL } = useChapterData<DomainDiffusion[]>('cyber/cyber_diffusion.json');
  const { data: cyberTeam, loading: ctcL } = useChapterData<DomainTeamComparison[]>('cyber/cyber_team_comparison.json');
  const { data: cyberAssignType, loading: catL } = useChapterData<DomainAssigneeType[]>('cyber/cyber_assignee_type.json');

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

  // Compute rank data for bump chart (from 2000 onward, where cybersecurity activity is meaningful)
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
    if (!cyberStrategies) return [];
    const orgs = [...new Set(cyberStrategies.map(d => d.organization))];
    return orgs.map(org => ({
      organization: org,
      subfields: cyberStrategies.filter(d => d.organization === org).sort((a, b) => b.patent_count - a.patent_count),
    })).sort((a, b) => {
      const aTotal = a.subfields.reduce((s, d) => s + d.patent_count, 0);
      const bTotal = b.subfields.reduce((s, d) => s + d.patent_count, 0);
      return bTotal - aTotal;
    });
  }, [cyberStrategies]);

  const { diffusionPivot, diffusionSections } = useMemo(() => {
    if (!cyberDiffusion) return { diffusionPivot: [], diffusionSections: [] };
    const sections = [...new Set(cyberDiffusion.map(d => d.section))].sort();
    const years = [...new Set(cyberDiffusion.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      cyberDiffusion.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.pct_of_domain;
      });
      return row;
    });
    return { diffusionPivot: pivoted, diffusionSections: sections };
  }, [cyberDiffusion]);

  const teamComparisonPivot = useMemo(() => {
    if (!cyberTeam) return [];
    const years = [...new Set(cyberTeam.map(d => d.year))].sort();
    return years.map(year => {
      const row: Record<string, unknown> = { year };
      cyberTeam.filter(d => d.year === year).forEach(d => {
        row[d.category] = d.avg_team_size;
      });
      return row;
    });
  }, [cyberTeam]);

  const { assigneeTypePivot, assigneeTypeNames } = useMemo(() => {
    if (!cyberAssignType) return { assigneeTypePivot: [], assigneeTypeNames: [] };
    const categories = [...new Set(cyberAssignType.map(d => d.assignee_category))];
    const years = [...new Set(cyberAssignType.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      cyberAssignType.filter(d => d.year === year).forEach(d => {
        row[d.assignee_category] = d.count;
      });
      return row;
    });
    return { assigneeTypePivot: pivoted, assigneeTypeNames: categories };
  }, [cyberAssignType]);

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
        number={29}
        title="Cybersecurity"
        subtitle="Defending digital infrastructure through innovation"
      />

      <KeyFindings>
        <li>Cybersecurity patent filings have grown alongside the expansion of the digital economy, with notable acceleration in filings observed following major data breaches and ransomware campaigns such as the Snowden disclosures (2013), WannaCry (2017), and SolarWinds (2020).</li>
        <li>Network security constitutes the largest cybersecurity subfield by patent volume, having surpassed cryptography around 2003, coinciding with the expansion of cloud computing and distributed network architectures.</li>
        <li>Data protection, system security, and authentication technologies have all exhibited rapid growth rates, particularly since the mid-2010s, coinciding with the proliferation of cloud computing, mobile devices, and zero-trust security architectures.</li>
        <li>A small number of large technology firms -- IBM, Intel, Microsoft, and Cisco -- dominate cybersecurity patenting, reflecting the capital-intensive nature of security R&D and the strategic importance of defensive patent portfolios.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Cybersecurity patenting traces the intensifying contest between digital defenders and threat actors, a dynamic that has intensified with each successive wave of connectivity -- from the early internet era through cloud computing to the current landscape of IoT and AI-driven attacks. The patent record reveals not merely growth in volume but a structural transformation: early cryptographic methods have been surpassed by network security, which now constitutes the largest subfield, alongside rapid growth in authentication and data protection, each responding to distinct threat vectors. The organizational landscape is shaped by the same concentration dynamics observed in <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link>, with a handful of resource-rich firms building expansive patent portfolios that serve both defensive and strategic purposes. Landmark events -- the Snowden disclosures of 2013, the WannaCry ransomware campaign of 2017, and the SolarWinds supply-chain compromise of 2020 -- appear as inflection points in the data, each triggering measurable surges in patenting activity that reflect the broader pattern of threat-driven innovation documented throughout the <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Sector Dynamics</Link> chapter.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/quantum-computing" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">quantum computing</Link> patenting and its implications for future cryptographic systems, this chapter turns to cybersecurity, a domain whose reliance on encryption and authentication makes it directly sensitive to advances in quantum hardware.
        </p>
        <p>
          As the digital economy has expanded, so too has the attack surface that threatens it.
          Cybersecurity -- the protection of networks, systems, and data from unauthorized access
          and malicious exploitation -- has become one of the most active domains in the United
          States patent system. This chapter examines the trajectory of{' '}
          <StatCallout value="cybersecurity-related patents" />, from early cryptographic methods
          through the current era of network defense, zero-trust architectures, and AI-driven
          threat detection.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Cybersecurity patent activity serves as an indicator of evolving security priorities.
          Measurable increases in patenting activity have been observed following major security
          incidents such as the Snowden disclosures (2013), WannaCry ransomware campaign (2017),
          and SolarWinds attack (2020). The growth trajectory coincides with both the expanding
          digital economy and regulatory responses such as GDPR and sector-specific compliance
          requirements.
        </p>
      </KeyInsight>

      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-cyber-patents-annual-count"
        subtitle="Annual count of utility patents classified under cybersecurity-related CPC codes, tracking the growth trajectory of cybersecurity patenting."
        title="Cybersecurity Patent Filings Grew Rapidly Since the Early 2000s, Driven by Data Breaches, Ransomware, and Regulatory Compliance"
        caption="Annual count of utility patents classified under cybersecurity-related CPC codes, 1976-2025. The most prominent pattern is the sustained growth beginning in the early 2000s, with notable acceleration observed following the Snowden disclosures (2013) and the SolarWinds attack (2020)."
        insight="The growth in cybersecurity patents coincides with the expansion of the digital economy, with acceleration observed following major security incidents such as the Snowden disclosures (2013), WannaCry ransomware campaign (2017), and SolarWinds attack (2020)."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Cybersecurity Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={CYBER_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Cybersecurity patent filings have grown substantially since the early 2000s, with
          acceleration observed following high-profile security incidents and regulatory changes.
          Notable growth in encryption and privacy-related patents occurred following the Snowden
          revelations of 2013, while continued growth in data protection patents coincided with the
          WannaCry ransomware campaign of 2017 and the European Union&apos;s General Data Protection
          Regulation. Growth in system integrity and zero-trust security patents continued following
          the SolarWinds supply-chain attack of 2020.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-cyber-patents-share"
        subtitle="Cybersecurity patents as a percentage of all utility patents, showing the growing reallocation of inventive effort toward security technologies."
        title="Cybersecurity's Share of Total Patents Has Risen Steadily, Indicating a Structural Reallocation of Inventive Effort Toward Security"
        caption="Percentage of all utility patents classified under cybersecurity-related CPC codes. The upward trend indicates that cybersecurity patenting growth is not merely tracking overall patent growth but represents a genuine reallocation of inventive effort."
        insight="The growing share of cybersecurity patents among all patents demonstrates that security innovation is outpacing overall patent growth, reflecting the growing strategic importance of digital defense."
        loading={pyL}
      >
        <PWLineChart
          data={(perYear ?? []).map(d => ({
            ...d,
            domain_pct: d.total_patents > 0 ? (d.domain_patents / d.total_patents) * 100 : 0,
          }))}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Cybersecurity Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={CYBER_EVENTS}
        />
      </ChartContainer>

      <SectionDivider label="Cybersecurity Subfields" />

      <ChartContainer
        id="fig-cyber-patents-subfields"
        subtitle="Patent counts by cybersecurity subfield (cryptography, authentication, network security, etc.) over time, based on specific CPC group codes."
        title="Network Security Is the Largest Subfield, Having Surpassed Cryptography in the Early 2000s, While Data Protection and Authentication Have Also Grown Rapidly"
        caption="Patent counts by cybersecurity subfield over time, based on CPC classifications. Network security surpassed cryptography around 2003 and has been the dominant subfield since, while data protection, authentication, and system security have all experienced rapid growth."
        insight="The diversification of cybersecurity subfields coincides with the expanding attack surface: as digital systems have grown more complex, the defensive patent landscape has broadened from encryption-centric approaches to encompass network defense, identity management, and data protection."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: CYBER_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={CYBER_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of cybersecurity patents has diversified substantially over time.
          Cryptography -- encompassing encryption algorithms, key management, and secure
          communication protocols -- was the largest subfield through the early 2000s, reflecting
          the foundational role of encryption in digital security. Network security surpassed
          cryptography around 2003 and has been the dominant subfield since, driven by the
          expansion of cloud computing and distributed architectures. Data protection,
          authentication, and system security have all grown rapidly, particularly since the
          mid-2010s, reflecting the adoption of multi-factor authentication, zero-trust
          frameworks, and data privacy regulations.
        </p>
      </KeyInsight>

      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-cyber-patents-top-assignees"
        subtitle="Organizations ranked by total cybersecurity-related patent count, showing concentration among large technology and defense firms."
        title="IBM, Intel, Microsoft, and Cisco Lead in Total Cybersecurity Patent Volume, Reflecting the Resource-Intensive Nature of Security R&D"
        caption="Organizations ranked by total cybersecurity-related patents. The data indicate a concentration among large technology firms with dedicated security research divisions, reflecting the substantial investment required to develop and maintain defensive technologies."
        insight="The dominance of large technology firms in cybersecurity patenting reflects the resource-intensive nature of security R&D, which requires deep expertise in cryptography, network protocols, and threat intelligence, as well as access to large-scale operational data."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Cybersecurity Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top cybersecurity patent holders as a data table"
        headers={['Organization', 'Cybersecurity Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by cybersecurity-related patent count. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Cybersecurity patent leadership reflects a concentration among firms with
          established security research divisions and large-scale enterprise customer bases.
          IBM&apos;s leading position extends from its decades-long investment in cryptographic
          research, including foundational contributions to the Data Encryption Standard and
          subsequent algorithms. Microsoft, Cisco, and Symantec (now part of Broadcom) each
          bring distinct strengths: Microsoft in operating system and cloud security, Cisco
          in network infrastructure defense, and Symantec in endpoint protection and threat
          detection. The presence of telecommunications firms and defense contractors further
          underscores the strategic importance of cybersecurity across multiple sectors.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-cyber-patents-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by cybersecurity patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="Organizational Rankings Have Shifted as Cloud Security and Enterprise Software Firms Expanded Their Patent Portfolios After 2010"
          caption="Annual ranking of the top 15 organizations by cybersecurity patent grants, 2000-2025. Darker cells indicate higher rank (more patents). The data reveal increasing competition among technology firms as cybersecurity has become a critical differentiator in enterprise software and cloud services."
          insight="The ranking dynamics reveal the growing strategic importance of cybersecurity patents, with cloud and enterprise software firms expanding their security portfolios to compete with traditional security-focused companies."
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
          The organizational ranking data reveal considerable flux in cybersecurity patent
          leadership. While IBM has maintained a dominant position throughout most of the
          period, the 2010s witnessed the rapid ascent of cloud-native security firms and
          the expansion of enterprise software companies into cybersecurity. The emergence
          of firms such as Amazon and Google in the rankings reflects the growing
          importance of cloud infrastructure security, while the presence of financial
          services firms signals the sector-specific demand for security innovation driven
          by regulatory compliance and the high cost of data breaches.
        </p>
      </KeyInsight>

      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-cyber-patents-top-inventors"
        subtitle="Primary inventors ranked by total cybersecurity-related patent count, illustrating the skewed distribution of individual output."
        title="The Most Prolific Cybersecurity Inventors Are Concentrated at Major Technology Firms With Dedicated Security Research Divisions"
        caption="Primary inventors ranked by total cybersecurity-related patents. The distribution exhibits pronounced skewness, with a small number of highly productive individuals accounting for a disproportionate share of total cybersecurity patent output."
        insight="The concentration of cybersecurity patenting among a small cohort of prolific inventors reflects the deep specialization required in areas such as cryptographic algorithm design, network protocol security, and threat analysis."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Cybersecurity Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific cybersecurity inventors are typically affiliated with large
          technology firms that maintain dedicated security research divisions. The
          concentration of output among a relatively small cohort reflects the deep
          specialization required in cryptographic algorithm design, network protocol
          security, and threat analysis -- fields where extensive domain expertise is a
          prerequisite for meaningful innovation. The skewed productivity distribution
          mirrors patterns observed across the broader patent system, though the degree
          of specialization in cybersecurity may be particularly pronounced.
        </p>
      </KeyInsight>

      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-cyber-patents-by-country"
        subtitle="Countries ranked by total cybersecurity-related patents based on primary inventor location, showing geographic distribution of security innovation."
        title="The United States Dominates Cybersecurity Patenting, With Significant Contributions From Japan, China, India, and Israel"
        caption="Countries ranked by total cybersecurity-related patents based on primary inventor location. The United States maintains a substantial lead, while the presence of Israel reflects that nation's well-documented specialization in cybersecurity innovation."
        insight="The geographic distribution of cybersecurity patents reflects the concentration of major technology firms and security research laboratories in the United States, while Israel's strong presence relative to its size underscores its recognized specialization in defensive and offensive cyber capabilities."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Cybersecurity Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of cybersecurity patents reveals the dominant role of the
          United States, driven by the concentration of major technology firms, defense
          contractors, and security research laboratories. The strong presence of Israel, despite
          its comparatively small economy, reflects that nation&apos;s well-documented
          specialization in cybersecurity -- a strength rooted in national security priorities
          and a robust military-to-technology pipeline. Japan, China, and India also contribute
          substantially, with China and India ranking among the top five non-US contributors.
          South Korea and Germany contribute through their large electronics and
          telecommunications sectors.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-cyber-patents-by-state"
        subtitle="US states ranked by total cybersecurity-related patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California Leads US Cybersecurity Patenting, With Significant Clusters in the Washington DC Corridor and Texas"
        caption="US states ranked by total cybersecurity-related patents based on primary inventor location. California's lead is consistent with Silicon Valley's concentration of technology firms, while the strong showing of Virginia and Maryland reflects the proximity of defense contractors and intelligence agencies to Washington, DC."
        insight="The geographic clustering of cybersecurity patents in California, the DC corridor, and Texas reflects the dual nature of cybersecurity innovation -- driven both by commercial technology firms and by defense and intelligence sector demand."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Cybersecurity Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, cybersecurity patenting exhibits a distinctive geographic
          pattern that reflects the dual sources of security innovation. California leads,
          consistent with the concentration of major technology firms in Silicon Valley and
          the broader Bay Area ecosystem. The strong presence of Virginia and Maryland reflects
          the Washington, DC corridor&apos;s concentration of defense contractors, intelligence
          agencies, and government-adjacent security firms -- a pattern that distinguishes
          cybersecurity from most other technology domains, where the DC region plays a
          smaller role.
        </p>
      </KeyInsight>

      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-cyber-patents-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for cybersecurity patents by year, measuring quality trends."
        title="Cybersecurity Patent Technology Scope Has Generally Increased, Particularly Since 2014, Suggesting Growing Interdisciplinarity"
        caption="Average claims, backward citations, and technology scope for cybersecurity-related patents by year. The upward trend in technology scope suggests that cybersecurity patents are becoming increasingly interdisciplinary, spanning multiple CPC subclasses as security capabilities are integrated across diverse technology systems."
        insight="Rising technology scope indicates that cybersecurity patents increasingly span multiple technology domains, consistent with the integration of security features into networking, cloud computing, IoT, and enterprise software."
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
          referenceLines={CYBER_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Cybersecurity patents exhibit distinctive quality characteristics. Backward
          citations rose through the early 2010s before declining in recent years, a pattern
          consistent with broader trends in patent citation practices. The earlier rise reflected
          the increasingly interconnected nature of security research, where new defensive
          technologies build upon established cryptographic foundations and network protocols. The
          expanding technology scope indicates that cybersecurity inventions are becoming
          more interdisciplinary, spanning multiple{' '}
          <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> subclasses as security
          capabilities are integrated into diverse technology systems -- from cloud
          infrastructure to medical devices to autonomous vehicles.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-cyber-patents-team-size"
        subtitle="Average number of named inventors per cybersecurity-related patent by year, reflecting the growing complexity of security research."
        title="Average Cybersecurity Patent Team Size Has Grown Steadily, Indicating Increasing Research Complexity and Multidisciplinarity"
        caption="Average number of inventors per cybersecurity-related patent by year. The upward trend is consistent with the interpretation that modern cybersecurity research requires expertise spanning cryptography, software engineering, network architecture, and domain-specific knowledge."
        insight="Growing team sizes reflect the increasing complexity of cybersecurity research, which now requires expertise spanning cryptography, software engineering, network architecture, and domain-specific threat intelligence."
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
          referenceLines={CYBER_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The growing team size for cybersecurity patents reflects the increasing complexity
          and interdisciplinarity of security research. Modern cybersecurity systems require
          expertise across multiple domains -- cryptography, software engineering, network
          architecture, threat intelligence, and regulatory compliance -- necessitating
          larger and more diverse research teams. This trend parallels the broader pattern
          observed across technology-intensive patents, as documented in the{' '}
          <Link href="/chapters/mech-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">collaboration networks</Link> chapter.
        </p>
      </KeyInsight>

      <SectionDivider label="Cybersecurity Patenting Strategies" />
      <Narrative>
        <p>
          The leading cybersecurity patent holders pursue markedly different strategies.
          Certain firms concentrate on cryptographic methods and data protection, while others
          distribute their portfolios across network security, authentication, and system
          security. A comparison of subfield portfolios across major holders reveals where each
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
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Cybersecurity Patents</th>
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
          The strategic differences among leading cybersecurity patent holders reflect their
          distinct market positions and technical strengths. IBM&apos;s portfolio emphasizes
          network security and data protection, consistent with its enterprise security
          services and cloud infrastructure business. Microsoft&apos;s patents concentrate
          on network security and data protection, reflecting the security requirements of
          its cloud platform and productivity suite. Cisco&apos;s focus on network security
          aligns with its core networking infrastructure business. Intel&apos;s strength in
          system security reflects its hardware-level security capabilities. These strategic divergences suggest that
          cybersecurity patent portfolios serve both defensive and product-differentiation
          purposes.
        </p>
      </KeyInsight>

      <SectionDivider label="Cross-Domain Diffusion" />
      <Narrative>
        <p>
          Cybersecurity is increasingly embedded across multiple technology domains rather than
          existing as an isolated specialty. By tracking how frequently cybersecurity-classified
          patents also carry CPC codes from other technology areas, it is possible to measure the
          diffusion of security capabilities into healthcare, manufacturing, telecommunications,
          and other sectors.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-cyber-patents-diffusion"
        subtitle="Percentage of cybersecurity patents co-classified with other CPC sections, measuring the diffusion of security technologies across sectors."
        title="Cybersecurity Patents Show Increasing Co-Occurrence With Operations, Human Necessities, and Other CPC Sections"
        caption="Percentage of cybersecurity patents that also carry CPC codes from other sections. Rising lines indicate cybersecurity diffusing into that sector. The most notable pattern is the increasing co-occurrence with Operations &amp; Transport (Section B) and Human Necessities (Section A, encompassing healthcare)."
        insight="The rising co-occurrence of cybersecurity patents with other CPC sections reflects the pervasive integration of security capabilities across technology domains, consistent with cybersecurity's evolution from a standalone discipline to an embedded requirement of modern digital systems."
        loading={cdL}
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
            yLabel="% of Cybersecurity Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={CYBER_EVENTS}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Cybersecurity increasingly exhibits the characteristics of a pervasive technology that
          is embedded across diverse domains. The co-occurrence of cybersecurity patents with
          Operations &amp; Transport (B) reflects the integration of security with logistics,
          manufacturing, and transportation systems. Growing co-occurrence with Human
          Necessities (A) indicates the expansion of security requirements into healthcare
          and medical devices, driven by regulatory mandates such as HIPAA and the growing
          digitization of health records. The broad upward trend across most sections suggests
          that cybersecurity has evolved beyond a standalone computing discipline to become an
          essential component of virtually every technology system.
        </p>
      </KeyInsight>

      <SectionDivider label="Team Composition and Attribution" />

      <Narrative>
        <p>
          Cybersecurity patents increasingly involve larger inventor teams and corporate assignees,
          reflecting the multidisciplinary nature of modern security research. Average team sizes
          for cybersecurity patents have tracked closely with non-cybersecurity patents, with
          both exhibiting an upward trend that reflects the broader shift toward collaborative
          invention.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-cyber-patents-team-comparison"
        subtitle="Average inventors per patent for cybersecurity vs. non-cybersecurity utility patents by year, showing comparative team size dynamics."
        title="Cybersecurity and Non-Cybersecurity Patent Team Sizes Have Both Grown Steadily, Tracking Closely Over Time"
        caption="Average number of inventors per patent for cybersecurity-related vs. non-cybersecurity utility patents. Both categories show a similar upward trend, reflecting the broader shift toward collaborative research across all technology domains."
        insight="Cybersecurity patent team sizes have tracked closely with non-cybersecurity patents, both exhibiting steady growth that reflects the increasing complexity and multidisciplinary nature of modern invention."
        loading={ctcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Cyber', name: 'Cybersecurity Patents', color: CHART_COLORS[0] },
            { key: 'Non-Cyber', name: 'Non-Cybersecurity Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-cyber-patents-assignee-type"
        subtitle="Distribution of cybersecurity patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Dominate Cybersecurity Patenting, With the Corporate Share Increasing as Security Has Become a Strategic Priority"
        caption="Distribution of cybersecurity patent assignees by type (corporate, university, government, individual) over time. The data reveal that corporate assignees account for the vast majority of cybersecurity patents, with the corporate share increasing since 2010 as firms expanded their security research divisions."
        insight="The dominance of corporate assignees in cybersecurity patenting reflects the strategic and commercial value of security technologies, while the relatively modest university share suggests that cybersecurity innovation is driven primarily by applied research within industry settings."
        loading={catL}
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
          The growing team sizes and corporate dominance in cybersecurity patenting reflect the
          applied, multidisciplinary nature of security research. Unlike certain academic fields
          where individual contributors can make foundational contributions, modern cybersecurity
          innovation typically requires teams that combine expertise in cryptography, network
          engineering, software development, and threat intelligence. The relatively modest
          share of university patents, compared to the AI domain, suggests that cybersecurity
          innovation is driven primarily by the operational demands of enterprise customers and
          the strategic imperatives of technology firms competing in security-sensitive markets.
        </p>
      </KeyInsight>

      <Narrative>
        Having documented the growth of cybersecurity in the patent system, the trajectory of security innovation illuminates broader patterns in how the technology sector responds to evolving threats. The organizational strategies behind cybersecurity patenting are explored further in <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>, while the convergence of security and artificial intelligence reflects dynamics examined in the <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">AI patents</Link> chapter. The next chapter examines <Link href="/chapters/biotechnology" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">biotechnology and gene editing</Link>, a domain where data security and privacy concerns intersect with the protection of genomic information and patient health records.
      </Narrative>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />

      <ChartContainer
        id="fig-cyber-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in cybersecurity patenting."
        title="Top-4 Concentration in Cybersecurity Patents Declined From 32.4% in 1980 to 9.4% by 2025, Reflecting the Sector&apos;s Expansion"
        caption="CR4 computed as the sum of the top 4 organizations&apos; annual patent counts divided by total cybersecurity patents. The early high concentration reflects IBM&apos;s pioneering role in cryptographic research (including DES). The steady decline mirrors the expansion of cybersecurity into network security, cloud security, and endpoint protection."
        insight="The concentration trajectory is consistent with cybersecurity&apos;s evolution from a specialized cryptographic discipline dominated by a few research labs to a broad security sector where threat diversity ensures no single organization can dominate."
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
        id="fig-cyber-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across cybersecurity subfields."
        title="Cybersecurity Subfield Diversity Increased From 0.83 in 1978 to 0.94 by 2025, Reflecting Broadening Threat Landscapes"
        caption="Normalized Shannon entropy of cybersecurity subfield patent distributions. The increase from 0.83 to 0.94 reflects the transition from cryptography-dominated patenting to a balanced distribution across network security, data protection, authentication, and access control."
        insight="The high starting entropy of 0.83 suggests cybersecurity was already relatively diversified by the late 1970s, unlike AI or biotechnology which started from narrow bases. The further increase reflects the proliferation of new attack vectors and corresponding defensive innovations."
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
        id="fig-cyber-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a cybersecurity patent."
        title="Later Cybersecurity Entrants Patent at Modestly Higher Velocity: 2010s Cohort Averages 105.8 Patents per Year Versus 77.9 for 1970s Entrants"
        caption="Mean patents per active year for top cybersecurity organizations grouped by entry decade. The 1.7x increase from 1970s to 2020s entrants is moderate, reflecting the domain&apos;s sustained high barriers to entry due to the specialized expertise required for security research."
        insight="The velocity dip for 1980s entrants (44.1/yr) is notable, suggesting that mid-period entrants during the personal computing era patented less intensively than both early cryptographic pioneers and later cloud-security specialists."
        loading={taL}
      >
        <PWBarChart
          data={velocityData}
          xKey="decade"
          bars={[{ key: 'velocity', name: 'Patents per Year', color: CHART_COLORS[1] }]}
          yLabel="Mean Patents / Year"
        />
      </ChartContainer>

      <DataNote>
        Cybersecurity patents are identified using CPC classifications related to
        cryptographic mechanisms (H04L9), security arrangements for computer systems (G06F21),
        network security protocols (H04L63), data protection (G06F21/60-62), and related
        security classifications. A patent is classified as cybersecurity-related if any of
        its CPC codes fall within these categories. Subfield classifications are based on
        more specific CPC group codes that distinguish cryptography, authentication and access
        control, network security, data protection, and system security. Strategy analysis
        shows patent counts per cybersecurity sub-area for the top organizations. Cross-domain
        diffusion measures co-occurrence of cybersecurity CPC codes with other CPC sections.
        Source: PatentsView / USPTO.
      </DataNote>

      <RelatedChapters currentChapter={29} />
      <ChapterNavigation currentChapter={29} />
    </div>
  );
}
