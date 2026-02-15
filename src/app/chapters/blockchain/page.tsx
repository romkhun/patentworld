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
import { CHART_COLORS, BLOCKCHAIN_SUBFIELD_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { BLOCKCHAIN_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { RankingTable } from '@/components/chapter/RankingTable';
import { cleanOrgName } from '@/lib/orgNames';
import Link from 'next/link';
import type {
  DomainPerYear, DomainBySubfield, DomainTopAssignee,
  DomainOrgOverTime, DomainTopInventor, DomainGeography,
  DomainQuality, DomainTeamComparison, DomainAssigneeType,
  DomainStrategy, DomainDiffusion,
} from '@/lib/types';

export default function Chapter16() {
  const { data: perYear, loading: pyL } = useChapterData<DomainPerYear[]>('blockchain/blockchain_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<DomainBySubfield[]>('blockchain/blockchain_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<DomainTopAssignee[]>('blockchain/blockchain_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<DomainTopInventor[]>('blockchain/blockchain_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<DomainGeography[]>('blockchain/blockchain_geography.json');
  const { data: quality, loading: qL } = useChapterData<DomainQuality[]>('blockchain/blockchain_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<DomainOrgOverTime[]>('blockchain/blockchain_org_over_time.json');
  const { data: strategies } = useChapterData<DomainStrategy[]>('blockchain/blockchain_strategies.json');
  const { data: diffusion, loading: diffL } = useChapterData<DomainDiffusion[]>('blockchain/blockchain_diffusion.json');
  const { data: teamComparison, loading: tcL } = useChapterData<DomainTeamComparison[]>('blockchain/blockchain_team_comparison.json');
  const { data: assigneeType, loading: atL } = useChapterData<DomainAssigneeType[]>('blockchain/blockchain_assignee_type.json');

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

  // Compute rank data for heatmap (from 2014 onward, where blockchain activity is meaningful)
  const orgRankData = useMemo(() => {
    if (!orgOverTime) return [];
    const years = [...new Set(orgOverTime.map((d) => d.year))].sort().filter((y) => y >= 2014);
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
        number={28}
        title="Blockchain & Decentralized Systems"
        subtitle="Distributed trust in the digital economy"
      />

      <KeyFindings>
        <li>Blockchain represents one of the smallest technology domains in the patent system, yet its rapid growth between 2016 and 2021 offers a compelling case study of how hype cycles manifest in patenting behavior.</li>
        <li>The field is dominated by only two subfields -- distributed ledger and cryptocurrency -- reflecting the narrow range of CPC codes that define the domain.</li>
        <li>IBM, Intel, and Alibaba-affiliated entities lead in blockchain patent volume, illustrating the mix of technology firms and financial services companies investing in the space.</li>
        <li>Patent filings peaked in 2022 and have since declined, a pattern that corresponds with the broader cryptocurrency market correction.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Blockchain patenting offers a unique window into how the patent system responds to technology hype cycles. The Bitcoin whitepaper of 2009 planted the seed, but it was the broader blockchain narrative -- smart contracts after Ethereum&apos;s 2015 launch, the ICO boom of 2017, and the NFT/DeFi surge of 2021 -- that drove a rapid increase in patent filings. Despite its relatively small absolute volume compared to domains like <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link> or <Link href="/chapters/semiconductors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">semiconductors</Link>, blockchain patenting is instructive precisely because of this compactness: the data clearly reveal the acceleration, peak, and contraction of inventive activity in response to market sentiment. The notable presence of financial services firms among top assignees distinguishes blockchain from other technology domains and underscores its origins as a challenge to traditional financial intermediation.
        </p>
      </aside>

      <Narrative>
        <p>
          Having examined <Link href="/chapters/3d-printing" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">3D printing</Link> and how the expiration of foundational patents triggered a wave of follow-on innovation, this chapter turns to blockchain, a domain where patent filing activity has tracked speculative market cycles with unusual fidelity.
        </p>
        <p>
          Blockchain technology -- originally conceived as the infrastructure underlying Bitcoin --
          has evolved into a broader class of distributed ledger and decentralized consensus systems.
          This chapter examines how patenting activity in blockchain-related technologies has tracked
          one of the most pronounced hype cycles in recent technology history, from the Bitcoin
          whitepaper in 2009 through the NFT and DeFi peaks of 2021 and the subsequent contraction.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          As the smallest domain by patent volume in this study, blockchain offers an unusually
          clear illustration of how speculative enthusiasm translates into inventive activity.
          The rapid rise and subsequent decline in filings track the broader cryptocurrency
          market cycle with notable fidelity, raising questions about the extent to which
          patent filings in emerging technologies are driven by genuine technical progress
          versus market-driven incentives.
        </p>
      </KeyInsight>

      {/* ── Section 1: Growth Trajectory ── */}
      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-blockchain-annual-count"
        subtitle="Annual count of utility patents classified under blockchain-related CPC codes, tracking the growth and contraction of blockchain patenting."
        title="Blockchain Patent Filings Increased Rapidly After 2016, Peaked in 2022, and Declined With the Crypto Market Correction"
        caption="Annual count and share of utility patents classified under blockchain-related CPC codes, illustrating the pronounced hype-cycle pattern. The acceleration beginning in 2016 coincides with increasing enterprise interest in distributed ledger technology and the ICO boom of 2017."
        insight="The boom-and-bust pattern in blockchain patents closely mirrors the cryptocurrency market cycle, suggesting that patent filing behavior in this domain is unusually sensitive to market sentiment."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_patents', name: 'Blockchain Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Number of Patents"
          referenceLines={BLOCKCHAIN_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The trajectory of blockchain patenting is distinctive among technology domains. Unlike
          AI or semiconductors, which exhibit sustained growth, blockchain patents
          followed a rise-peak-decline pattern. The inflection point around 2016 is associated with
          the emergence of enterprise blockchain platforms and the Ethereum smart contract
          ecosystem. Filings declined after 2022 as crypto market valuations fell and corporate enthusiasm waned.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-blockchain-share"
        subtitle="Blockchain patents as a percentage of all utility patents, showing the domain's still-small but rapidly changing share of total inventive activity."
        title="Blockchain's Share of Total Patents Rose Rapidly After 2016 Before Plateauing, Reflecting Its Niche but Volatile Status"
        caption="Percentage of all utility patents classified under blockchain-related CPC codes. Even at its peak, blockchain represents a small fraction of total patenting, underscoring the domain's niche character despite disproportionate media attention."
        insight="Blockchain's share of total patents remains small even at peak levels, highlighting the disconnect between the domain's media prominence and its actual footprint in the patent system."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'domain_pct', name: 'Blockchain Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={BLOCKCHAIN_EVENTS}
        />
      </ChartContainer>

      {/* ── Section 2: Subfields ── */}
      <SectionDivider label="Blockchain Subfields" />

      <ChartContainer
        id="fig-blockchain-subfields"
        subtitle="Patent counts by blockchain subfield over time, based on CPC group codes within blockchain-related classifications."
        title="Distributed Ledger Patents Dominate, With Cryptocurrency as a Secondary but Growing Subfield"
        caption="Patent counts by blockchain subfield over time. The narrow CPC classification scheme yields only two primary subfields -- distributed ledger and consensus technologies versus cryptocurrency and digital money -- reflecting the relatively young and undifferentiated nature of blockchain as a patent domain."
        insight="The limited number of blockchain subfields reflects the narrow CPC classification structure for this emerging domain, in contrast to more mature fields like AI or biotechnology that have developed extensive taxonomies."
        loading={sfL}
        height={500}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: BLOCKCHAIN_SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={BLOCKCHAIN_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The blockchain patent landscape is concentrated in just two subfields, a
          characteristic that distinguishes it from more mature technology domains. Distributed
          ledger and consensus mechanism patents form the dominant category, encompassing the
          core infrastructure of blockchain systems. Cryptocurrency and digital money patents
          constitute a secondary stream. The limited taxonomic differentiation reflects both
          the relative youth of the field and the challenges of classifying a technology whose
          applications continue to evolve.
        </p>
      </KeyInsight>

      {/* ── Section 3: Organizations ── */}
      <SectionDivider label="Leading Organizations" />

      <ChartContainer
        id="fig-blockchain-top-assignees"
        subtitle="Organizations ranked by total blockchain-related patent count, showing concentration among technology firms and financial services companies."
        title="IBM, Intel, and Alibaba-Affiliated Entities Lead Blockchain Patenting, With Financial Services Firms Also Active"
        caption="Organizations ranked by total blockchain-related patents. The presence of both technology firms (IBM, Intel, Alibaba) and financial services companies (Capital One, Wells Fargo) among active filers distinguishes blockchain from other technology domains and reflects the technology's origins in financial disruption."
        insight="The mix of technology firms and financial services companies among top blockchain patent holders is unique among technology domains, reflecting blockchain's dual identity as both a computing infrastructure and a financial technology."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Blockchain Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top blockchain patent holders as a data table"
        headers={['Organization', 'Blockchain Patents']}
        rows={(topAssignees ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.domain_patents])}
        caption="Top 15 organizations by blockchain-related patent count. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          The organizational landscape of blockchain patenting is distinctive in several respects.
          IBM&apos;s leadership reflects its early investment in Hyperledger and enterprise blockchain
          platforms. Intel&apos;s strong second-place position underscores the hardware and
          cryptographic infrastructure dimensions of blockchain technology. Alibaba-affiliated
          entities mirror the Chinese technology sector&apos;s aggressive blockchain strategy,
          particularly in supply chain and payment applications. The presence of Capital One,
          Wells Fargo, Bank of America, and Mastercard among the financial institutions with
          notable blockchain patent activity is unusual for a technology domain and underscores
          blockchain&apos;s roots as a challenge to traditional financial intermediation. This mix
          of technology and finance is not observed in domains like AI, semiconductors, or
          biotechnology.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-blockchain-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by blockchain patent grants from 2014 onward, with darker cells indicating higher rank."
          title="Organizational Rankings in Blockchain Patenting Have Shifted Rapidly, Reflecting the Domain's Youth and Volatility"
          caption="Annual ranking of the top 15 organizations by blockchain patent grants, 2014 onward. Darker cells indicate higher rank (more patents). The data reveal significant year-to-year volatility in organizational rankings, consistent with a nascent domain where competitive positions are not yet entrenched."
          insight="The high volatility in organizational rankings distinguishes blockchain from more established domains where leadership positions are relatively stable, suggesting that competitive positions in blockchain IP are still forming."
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
            yearInterval={1}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The organizational ranking data reveal a level of volatility unusual among technology
          domains. Unlike AI patenting, where IBM held the top position for decades, blockchain
          leadership positions have shifted rapidly as different firms enter and exit the space
          in response to market conditions. This instability is consistent with the interpretation
          that blockchain remains a nascent domain where durable competitive advantages in
          intellectual property have not yet been established.
        </p>
      </KeyInsight>

      {/* ── Section 4: Inventors ── */}
      <SectionDivider label="Top Inventors" />

      <ChartContainer
        id="fig-blockchain-top-inventors"
        subtitle="Primary inventors ranked by total blockchain-related patent count, illustrating the distribution of individual inventive output."
        title="The Most Prolific Blockchain Inventors Are Concentrated Among a Small Number of Firms"
        caption="Primary inventors ranked by total blockchain-related patents. The distribution is heavily skewed, with top inventors typically affiliated with the leading organizational patent holders."
        insight="The concentration of prolific blockchain inventors within a few organizations mirrors the broader pattern of corporate-driven innovation in emerging technology domains."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'domain_patents', name: 'Blockchain Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The inventor landscape in blockchain patenting exhibits the familiar skewed distribution
          seen in other technology domains, but with an important distinction: the top blockchain
          inventors are predominantly affiliated with a small number of organizations, reflecting
          the corporate-driven nature of blockchain IP strategy. Unlike fields with a longer
          academic tradition, individual blockchain inventors rarely file independently, suggesting
          that blockchain patenting is primarily an enterprise activity rather than an academic or
          individual pursuit.
        </p>
      </KeyInsight>

      {/* ── Section 5: Geography ── */}
      <SectionDivider label="Geographic Distribution" />

      <ChartContainer
        id="fig-blockchain-by-country"
        subtitle="Countries ranked by total blockchain-related patents based on primary inventor location, showing geographic distribution."
        title="The United States and China Lead Blockchain Patenting"
        caption="Countries ranked by total blockchain-related patents based on primary inventor location. The United States and China lead, reflecting the concentration of both cryptocurrency development and enterprise blockchain investment in these two economies."
        insight="The US-China concentration in blockchain patenting reflects both countries' large technology sectors and contrasting regulatory approaches to cryptocurrency and distributed ledger technology."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'domain_patents', name: 'Blockchain Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of blockchain patents reveals a strong US-China concentration
          that reflects the two economies&apos; divergent approaches to the technology. The United
          States has been the primary locus of cryptocurrency innovation and decentralized finance,
          while China has pursued enterprise blockchain applications, particularly in supply chain
          management and digital payments, even as it restricted cryptocurrency trading. The
          relatively weaker presence of European and Japanese inventors distinguishes blockchain
          from other technology domains where these regions are more prominent.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-blockchain-by-state"
        subtitle="US states ranked by total blockchain-related patents based on primary inventor location, highlighting geographic clustering."
        title="California Leads US Blockchain Patenting, With Texas, Massachusetts, and Washington Also Prominent"
        caption="US states ranked by total blockchain-related patents based on primary inventor location. California's lead is consistent with broader technology sector patterns. Texas, Massachusetts, and Washington rank ahead of New York, suggesting that general technology hubs play a larger role than financial centers in blockchain patenting."
        insight="The geographic distribution of blockchain patenting more closely follows general technology sector patterns than financial center geography, with California, Texas, Massachusetts, and Washington leading."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'domain_patents', name: 'Blockchain Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, blockchain patenting follows the familiar pattern of California
          leadership. Texas, Massachusetts, and Washington rank among the top states, ahead of
          New York, suggesting that blockchain patenting is driven more by general technology
          sector activity than by proximity to financial centers. While financial services firms
          do file blockchain patents, the geographic distribution aligns more closely with
          broader technology hub patterns than with a finance-driven narrative.
        </p>
      </KeyInsight>

      {/* ── Section 6: Quality Indicators ── */}
      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        id="fig-blockchain-quality"
        subtitle="Average claims, backward citations, and technology scope for blockchain patents by year, measuring quality trends."
        title="Blockchain Patent Quality Indicators Show Variability Consistent With a Young, Rapidly Evolving Domain"
        caption="Average claims, backward citations, and technology scope for blockchain-related patents by year. The variability in these metrics reflects the domain's youth and the evolving nature of blockchain inventions."
        insight="Quality metrics in blockchain patents exhibit greater variability than in mature domains, consistent with the rapid experimentation and unclear boundaries that characterize early-stage technology fields."
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
          referenceLines={BLOCKCHAIN_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Blockchain patent quality indicators exhibit patterns consistent with a young, rapidly
          evolving domain. The variability in backward citations and technology scope reflects the
          challenge of prior art identification in a field where much of the foundational work
          occurred outside the traditional academic and patent literature -- in open-source
          codebases, white papers, and cryptocurrency forums. As the domain matures, these
          metrics may stabilize.
        </p>
      </KeyInsight>

      {/* ── Section 7: Patenting Strategies ── */}
      <SectionDivider label="Blockchain Patenting Strategies" />
      <Narrative>
        <p>
          Despite the domain&apos;s small overall size, the leading blockchain patent holders
          pursue discernibly different strategies. Some firms concentrate on core distributed
          ledger infrastructure, while others focus on cryptocurrency and digital payment
          applications. The limited number of subfields makes strategic differentiation more
          difficult to observe than in broader domains, but the data reveal meaningful variation
          in portfolio composition.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total Blockchain Patents</th>
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
          IBM&apos;s blockchain portfolio emphasizes distributed ledger infrastructure, consistent
          with its investment in the Hyperledger framework and enterprise blockchain consulting.
          Alibaba&apos;s portfolio reflects a broader approach spanning both ledger technology and
          digital payment applications. Financial services firms like Mastercard and Bank of America
          tend to concentrate more heavily on cryptocurrency and payment-related patents, reflecting
          their strategic interest in maintaining relevance as blockchain threatens traditional
          payment rails. The limited subfield differentiation means that competitive positioning
          in blockchain IP depends more on volume and timing than on portfolio breadth.
        </p>
      </KeyInsight>

      {/* ── Section 8: Cross-Domain Diffusion ── */}
      <SectionDivider label="Blockchain as Cross-Cutting Technology" />
      <Narrative>
        <p>
          Although blockchain originated in the financial technology space, its proponents have
          long argued that the technology has applications spanning supply chain management,
          healthcare records, digital identity, and other domains. By tracking how frequently
          blockchain-classified patents also carry CPC codes from other technology areas, it is
          possible to assess the extent to which blockchain is diffusing beyond its financial
          origins.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-blockchain-diffusion"
        subtitle="Percentage of blockchain patents co-classified with other CPC sections, measuring blockchain's diffusion into adjacent technology domains."
        title="Blockchain Patents Show Co-Occurrence With Human Necessities and Performing Operations Sections, but Limited Spread Into Other Domains"
        caption="Percentage of blockchain patents that also carry CPC codes from each non-blockchain section. The data show co-occurrence primarily with Sections A (Human Necessities), B (Performing Operations/Transporting), E (Fixed Constructions), and F (Mechanical Engineering). Unlike AI, which has diffused broadly across multiple technology areas, blockchain's cross-domain reach remains relatively limited."
        insight="Blockchain's cross-domain diffusion is concentrated in Human Necessities (Section A) and Performing Operations (Section B), suggesting applications in areas like supply chain and commerce rather than the broad general-purpose reach seen in AI."
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
            yLabel="% of Blockchain Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={filterEvents(BLOCKCHAIN_EVENTS, { only: [2009, 2015, 2021] })}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          The cross-domain diffusion data suggest that blockchain has not yet achieved the
          general-purpose technology status that its most enthusiastic proponents have predicted.
          Blockchain patents co-occur primarily with Human Necessities (Section A) and Performing
          Operations/Transporting (Section B) CPC sections, reflecting applications in areas
          such as supply chain management, commerce, and transactional operations. The breadth
          of diffusion is substantially narrower than what is observed for AI. This relatively
          focused spread suggests that blockchain&apos;s applications remain concentrated in
          commerce-adjacent and operational niches rather than extending broadly into diverse
          technology sectors.
        </p>
      </KeyInsight>

      {/* ── Section 9: Team Comparison ── */}
      <SectionDivider label="Team Composition" />

      <Narrative>
        <p>
          Comparing inventor team sizes for blockchain patents versus non-blockchain patents
          reveals that blockchain teams are generally smaller.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-blockchain-team-comparison"
        subtitle="Average inventors per patent for blockchain vs. non-blockchain utility patents by year, showing relative team complexity."
        title="Blockchain Patent Teams Are Generally Smaller Than Non-Blockchain Averages"
        caption="Average number of inventors per patent for blockchain-related vs. non-blockchain utility patents. Blockchain teams are generally smaller than non-blockchain patent teams, distinguishing blockchain from domains like AI where specialized patents tend to involve larger teams."
        insight="The persistently smaller team sizes for blockchain patents may reflect the domain's software-centric nature and its roots in cryptography and distributed systems, which require fewer collaborators than hardware-intensive or laboratory-based fields."
        loading={tcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'Blockchain', name: 'Blockchain Patents', color: CHART_COLORS[0] },
            { key: 'Non-Blockchain', name: 'Non-Blockchain Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Average Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      {/* ── Section 10: Assignee Types ── */}
      <ChartContainer
        id="fig-blockchain-assignee-type"
        subtitle="Distribution of blockchain patents by assignee type (corporate, university, government, individual) over time."
        title="Corporate Assignees Dominate Blockchain Patenting, With Minimal University or Government Participation"
        caption="Distribution of blockchain patent assignees by type over time. The overwhelming corporate share is consistent with blockchain's emergence as an enterprise and fintech technology, with relatively little academic or government involvement compared to domains like AI or biotechnology."
        insight="The near-total corporate dominance of blockchain patenting is notable even compared to other corporate-heavy domains, reflecting the technology's commercial origins and the limited role of academic blockchain research."
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
          The near-total corporate dominance of blockchain patenting is notable even when
          compared to other corporate-heavy technology domains. University and government
          participation is minimal, reflecting the fact that blockchain emerged from the
          cryptocurrency community rather than from traditional academic computer science
          research. This contrasts sharply with AI, where universities have played a significant
          role in early-stage research, and with biotechnology, where government-funded research
          contributes substantially to the patent pipeline.
        </p>
      </KeyInsight>

      {/* ── Section 11: Hype Cycle Reflection ── */}
      <SectionDivider label="The Hype Cycle in Patent Data" />

      <Narrative>
        <p>
          Blockchain patenting provides perhaps the clearest case study in the dataset of how
          hype cycles manifest in the patent system. The Bitcoin whitepaper of 2009 sparked
          initial interest. Ethereum&apos;s launch in 2015 expanded the conceptual scope of
          blockchain beyond cryptocurrency to programmable smart contracts. The ICO boom of
          2017 and the NFT/DeFi peak of 2021 drove successive waves of patent filings. The
          subsequent decline tracks the broader crypto market correction. This pattern raises
          important questions about the relationship between patent filing incentives and
          genuine technological progress -- questions that extend beyond blockchain to other
          emerging technology domains examined elsewhere in this study.
        </p>
      </Narrative>

      <Narrative>
        Having documented the trajectory of blockchain patenting and its distinctive hype-cycle dynamics, the following chapter examines <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link>, a domain that shares blockchain&apos;s rapid growth but exhibits a more sustained trajectory. The organizational strategies behind blockchain patenting are explored further in <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>.
        The next chapter turns to <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link>, the largest technology domain by patent volume in this study, where the growth trajectory has proven more durable than blockchain&apos;s and where cross-domain diffusion reaches into nearly every other field examined in ACT 6.
      </Narrative>

      {/* ── Analytical Deep Dives ─────────────────────────────────────── */}
      <SectionDivider label="Analytical Deep Dives" />

      <ChartContainer
        id="fig-blockchain-cr4"
        subtitle="Share of annual domain patents held by the four largest organizations, measuring organizational concentration in blockchain patenting."
        title="Top-4 Concentration in Blockchain Patents Rose to 26.3% During the 2018 Boom Before Declining to 14.0% by 2024"
        caption="CR4 computed as the sum of the top 4 organizations&apos; annual patent counts divided by total domain patents. The concentration spike during 2018-2020 reflects aggressive patenting by IBM, Alibaba-affiliated entities, and financial services firms during the cryptocurrency boom."
        insight="The hype-cycle pattern in blockchain concentration mirrors the domain&apos;s broader patent trajectory: rapid consolidation during speculative enthusiasm followed by fragmentation as the market corrected and enterprise blockchain applications diversified the competitive landscape."
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
        id="fig-blockchain-entropy"
        subtitle="Normalized Shannon entropy of subfield patent distributions, measuring how evenly inventive activity is spread across blockchain subfields."
        title="Blockchain Subfield Diversity Remains Constrained by the Domain&apos;s Narrow CPC Classification, With Entropy Reaching 0.65 Across 2 Subfields"
        caption="Normalized Shannon entropy of blockchain subfield distributions. Unlike domains such as AI (10 subfields) or semiconductors (7 subfields), blockchain is classified under only 2 CPC subfields (distributed ledger and cryptocurrency), limiting the diversity index&apos;s range. The 0.65 value indicates moderate but not extreme concentration."
        insight="The narrow subfield structure distinguishes blockchain from other ACT 6 domains and may reflect the CPC system&apos;s lag in creating detailed classifications for emerging technologies, rather than an inherent lack of technological diversity within blockchain systems."
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
        id="fig-blockchain-velocity"
        subtitle="Mean patents per active year for top organizations grouped by the decade in which they first filed a blockchain patent."
        title="Recent Blockchain Entrants Patent at Higher Velocity: 2020s Cohort Averages 9.4 Patents per Year Versus 4.7 for 2000s Entrants"
        caption="Mean patents per active year for top blockchain organizations grouped by entry decade. The 2.0x increase reflects the maturation of enterprise blockchain platforms and the growing sophistication of DeFi and smart contract patent strategies."
        insight="The 2010s cohort&apos;s lower velocity (3.8/yr) relative to both earlier and later cohorts reflects the many speculative entrants during the initial cryptocurrency boom who filed few patents before exiting the space."
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
        Blockchain patents are identified using CPC classifications for distributed ledger
        technology, consensus mechanisms, and cryptocurrency-related inventions. A patent is
        classified as blockchain-related if any of its CPC codes fall within these categories.
        Subfield classifications distinguish between distributed ledger and consensus technologies
        versus cryptocurrency and digital money applications. Due to the narrow range of CPC codes
        that define this domain, blockchain represents the smallest technology area by patent volume
        in this study. Patenting strategies show patent counts per blockchain sub-area for the top
        assignees. Cross-domain diffusion measures co-occurrence of blockchain CPC codes with other
        CPC sections.
      </DataNote>

      <RelatedChapters currentChapter={28} />
      <ChapterNavigation currentChapter={28} />
    </div>
  );
}
