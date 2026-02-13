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
import { CHART_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  AIPatentsPerYear, AIBySubfield, AITopAssignee,
  AITopInventor, AIGeography, AIQuality, AIOrgOverTime,
  AIStrategy, AIGPTDiffusion, AITeamComparison, AIAssigneeType,
} from '@/lib/types';

const SUBFIELD_COLORS: Record<string, string> = {
  'Neural Networks / Deep Learning': CHART_COLORS[0],
  'Machine Learning': CHART_COLORS[1],
  'Pattern Recognition': CHART_COLORS[2],
  'Computer Vision': CHART_COLORS[3],
  'Natural Language Processing': CHART_COLORS[4],
  'Speech Recognition': CHART_COLORS[5],
  'Knowledge-Based Systems': CHART_COLORS[6],
  'Probabilistic / Fuzzy': CHART_COLORS[7],
  'Quantum Computing': CHART_COLORS[8],
  'Other Computational Models': CHART_COLORS[9],
  'Other AI': '#94a3b8',
};

export default function Chapter11() {
  const { data: perYear, loading: pyL } = useChapterData<AIPatentsPerYear[]>('chapter11/ai_patents_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<AIBySubfield[]>('chapter11/ai_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<AITopAssignee[]>('chapter11/ai_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<AITopInventor[]>('chapter11/ai_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<AIGeography[]>('chapter11/ai_geography.json');
  const { data: quality, loading: qL } = useChapterData<AIQuality[]>('chapter11/ai_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<AIOrgOverTime[]>('chapter11/ai_org_over_time.json');
  const { data: aiStrategies, loading: asL } = useChapterData<AIStrategy[]>('chapter11/ai_strategies.json');
  const { data: aiGptDiffusion, loading: agdL } = useChapterData<AIGPTDiffusion[]>('chapter11/ai_gpt_diffusion.json');
  const { data: aiTeam, loading: atcL } = useChapterData<AITeamComparison[]>('chapter11/ai_team_comparison.json');
  const { data: aiAssignType, loading: aatL } = useChapterData<AIAssigneeType[]>('chapter11/ai_assignee_type.json');

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
      label: d.organization.length > 30 ? d.organization.slice(0, 27) + '...' : d.organization,
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
      let short = org;
      if (org === 'International Business Machines Corporation') short = 'IBM';
      else if (org === 'SAMSUNG ELECTRONICS CO., LTD.') short = 'Samsung';
      else if (org === 'FUJITSU LIMITED') short = 'Fujitsu';
      else if (org === 'SONY GROUP CORPORATION') short = 'Sony';
      else if (org === 'Canon Kabushiki Kaisha') short = 'Canon';
      else if (org === 'Kabushiki Kaisha Toshiba') short = 'Toshiba';
      else if (org === 'NEC CORPORATION') short = 'NEC';
      else if (org === 'Intel Corporation') short = 'Intel';
      else if (org === 'Microsoft Corporation') short = 'Microsoft (Corp)';
      else if (org === 'MICROSOFT TECHNOLOGY LICENSING, LLC') short = 'Microsoft (Licensing)';
      else if (org === 'AMAZON TECHNOLOGIES, INC.') short = 'Amazon';
      else if (org === 'CAPITAL ONE SERVICES, LLC') short = 'Capital One';
      else if (org === 'Google LLC') short = 'Google';
      else if (org === 'Apple Inc.') short = 'Apple';
      else if (org === 'Adobe Inc.') short = 'Adobe';
      else if (org.length > 20) short = org.slice(0, 18) + '...';
      map[org] = short;
    });
    return map;
  }, [orgOverTime]);

  // Compute rank data for bump chart (from 2000 onward, where AI activity is meaningful)
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
      countryMap[d.country] = (countryMap[d.country] || 0) + d.ai_patents;
    });
    return Object.entries(countryMap)
      .map(([country, ai_patents]) => ({ country, ai_patents }))
      .sort((a, b) => b.ai_patents - a.ai_patents)
      .slice(0, 30);
  }, [geography]);

  const geoState = useMemo(() => {
    if (!geography) return [];
    return geography
      .filter((d) => d.country === 'US' && d.state)
      .sort((a, b) => b.ai_patents - a.ai_patents)
      .slice(0, 30)
      .map((d) => ({ state: d.state, ai_patents: d.ai_patents }));
  }, [geography]);

  const strategyOrgs = useMemo(() => {
    if (!aiStrategies) return [];
    const orgs = [...new Set(aiStrategies.map(d => d.organization))];
    return orgs.map(org => ({
      organization: org,
      subfields: aiStrategies.filter(d => d.organization === org).sort((a, b) => b.patent_count - a.patent_count),
    })).sort((a, b) => {
      const aTotal = a.subfields.reduce((s, d) => s + d.patent_count, 0);
      const bTotal = b.subfields.reduce((s, d) => s + d.patent_count, 0);
      return bTotal - aTotal;
    });
  }, [aiStrategies]);

  const { gptPivot, gptSections } = useMemo(() => {
    if (!aiGptDiffusion) return { gptPivot: [], gptSections: [] };
    const sections = [...new Set(aiGptDiffusion.map(d => d.section))].sort();
    const years = [...new Set(aiGptDiffusion.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      aiGptDiffusion.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.pct_of_ai;
      });
      return row;
    });
    return { gptPivot: pivoted, gptSections: sections };
  }, [aiGptDiffusion]);

  const teamComparisonPivot = useMemo(() => {
    if (!aiTeam) return [];
    const years = [...new Set(aiTeam.map(d => d.year))].sort();
    return years.map(year => {
      const row: Record<string, unknown> = { year };
      aiTeam.filter(d => d.year === year).forEach(d => {
        row[d.category] = d.avg_team_size;
      });
      return row;
    });
  }, [aiTeam]);

  const { assigneeTypePivot, assigneeTypeNames } = useMemo(() => {
    if (!aiAssignType) return { assigneeTypePivot: [], assigneeTypeNames: [] };
    const categories = [...new Set(aiAssignType.map(d => d.assignee_category))];
    const years = [...new Set(aiAssignType.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      aiAssignType.filter(d => d.year === year).forEach(d => {
        row[d.assignee_category] = d.count;
      });
      return row;
    });
    return { assigneeTypePivot: pivoted, assigneeTypeNames: categories };
  }, [aiAssignType]);

  return (
    <div>
      <ChapterHeader
        number={11}
        title="Artificial Intelligence"
        subtitle="The rise of AI in the patent system"
      />

      <KeyFindings>
        <li>AI patent filings have grown exponentially since 2010, driven by breakthroughs in deep learning and the expansion of AI applications across industries.</li>
        <li>The composition of AI patents has shifted from expert systems and rule-based approaches in the 1990s to machine learning, neural networks, and generative AI today.</li>
        <li>A small number of large technology firms dominate AI patenting, with IBM, Samsung, Google, and Microsoft leading in volume.</li>
        <li>AI patents span multiple technology domains, reflecting AI&apos;s nature as a general-purpose technology with applications across virtually every industry.</li>
      </KeyFindings>

      <Narrative>
        <p>
          Artificial intelligence has undergone a remarkable transformation from a niche
          academic pursuit to one of the most active domains in the US patent system.
          This chapter examines the trajectory of <StatCallout value="AI-related patents" /> --
          from early expert systems and symbolic reasoning through the machine learning
          revolution to the current era of deep learning and generative models.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          AI patent activity serves as a leading indicator of technological investment and
          capability building. The exponential growth in AI patenting since 2012 coincides
          with the deep learning breakthrough, reflecting a fundamental shift in how firms
          approach innovation in computing, healthcare, transportation, and virtually every
          other sector of the economy.
        </p>
      </KeyInsight>

      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        title="AI Patent Activity Over Time"
        caption="Annual count and share of utility patents classified under AI-related CPC codes (G06N, G06F18, G06V, G10L15, G06F40), 1976-2025."
        insight="The exponential growth in AI patents mirrors the broader AI boom, driven by advances in deep learning frameworks, GPU computing, and large-scale data availability."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'ai_patents', name: 'AI Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2008, 2014, 2020] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AI patent filings have grown exponentially since the early 2010s, driven by
          advances in deep learning, the availability of large-scale training data, and
          increased computational power through GPUs and specialized hardware. The growth
          rate substantially exceeds that of the overall patent system, indicating a
          disproportionate concentration of R&D investment in AI technologies.
        </p>
      </KeyInsight>

      <ChartContainer
        title="AI Patent Share of Total Patents"
        caption="Percentage of all utility patents classified under AI-related CPC codes."
        insight="AI's growing share of all patents demonstrates that the AI boom is not merely tracking overall patent growth — it represents a genuine reallocation of inventive effort toward AI technologies."
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'ai_pct', name: 'AI Share (%)', color: CHART_COLORS[3] },
          ]}
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2008, 2014, 2020] })}
        />
      </ChartContainer>

      <SectionDivider label="AI Subfields" />

      <ChartContainer
        title="AI Patent Activity by Subfield"
        caption="Patent counts by AI subfield over time, based on CPC classifications. Neural networks/deep learning and machine learning have driven the recent surge."
        insight="The shift from expert systems to deep learning reflects fundamental changes in AI methodology — from hand-crafted rules to data-driven pattern recognition."
        loading={sfL}
        height={650}
      >
        <PWAreaChart
          data={subfieldPivot}
          xKey="year"
          areas={subfieldNames.map((name) => ({
            key: name,
            name,
            color: SUBFIELD_COLORS[name] ?? CHART_COLORS[0],
          }))}
          stacked
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2008, 2014, 2020] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of AI patents has shifted dramatically over time. Early AI patenting
          was dominated by knowledge-based systems and pattern recognition. Since 2012, neural
          networks and deep learning have become the dominant subfield, reflecting the paradigm
          shift catalyzed by breakthroughs in convolutional and recurrent architectures. Computer
          vision and natural language processing have also experienced rapid growth as deep
          learning methods proved transformative in these domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Organizations" />

      <ChartContainer
        title="Leading Organizations in AI Patenting"
        caption="Organizations ranked by total AI-related patents, 1976-2025."
        insight="The dominance of large tech firms in AI patenting reflects the resource-intensive nature of AI R&D, which requires massive datasets, computing infrastructure, and specialized talent."
        loading={taL}
        height={1400}
      >
        <PWBarChart
          data={assigneeData}
          xKey="label"
          bars={[{ key: 'ai_patents', name: 'AI Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AI patent leadership reflects a concentration among large technology firms with
          substantial computational infrastructure and data assets. The prominence of both
          established technology companies (IBM, Microsoft, Google) and Asian electronics
          conglomerates (Samsung, LG, Sony) reveals the global nature of the AI patent race.
          The organizational landscape also reflects the significant role of corporate research
          laboratories in advancing fundamental AI capabilities.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          title="Top Organizations: Rank Over Time"
          caption="Annual ranking of the top 15 organizations by AI patent grants, 2000-2025. Darker cells indicate higher rank (more patents). Hover over a row to highlight."
          insight="The rapid convergence of multiple firms at the top since 2012 reflects the intensifying competitive race in AI capabilities, as the deep learning revolution drew major investment from firms across technology sectors."
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
          The rank race reveals dramatic shifts in organizational dominance. IBM held the
          top position unchallenged for decades, but the 2010s saw a rapid convergence as
          Google, Samsung, Microsoft, Amazon, and Apple scaled their AI research operations
          in response to the deep learning revolution. The emergence of non-traditional
          technology firms like Capital One signals the expanding application of AI beyond
          core technology sectors, while the convergence of multiple firms at the top
          reflects an intensifying competitive race in AI capabilities.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventors" />

      <ChartContainer
        title="Most Prolific AI Inventors"
        caption="Primary inventors ranked by total AI-related patents, 1976-2025."
        insight="The concentration of AI patenting among a small cohort of prolific inventors mirrors the broader 'superstar' pattern in innovation, where a few highly productive individuals account for a disproportionate share of output."
        loading={tiL}
        height={1400}
      >
        <PWBarChart
          data={inventorData}
          xKey="label"
          bars={[{ key: 'ai_patents', name: 'AI Patents', color: CHART_COLORS[4] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The most prolific AI inventors typically work at large technology firms with
          dedicated AI research divisions. The concentration of AI patenting among a
          relatively small cohort of highly productive inventors mirrors the broader
          pattern of skewed productivity distributions observed across the patent system,
          though the degree of concentration may be even more pronounced in AI given the
          specialized expertise required.
        </p>
      </KeyInsight>

      <SectionDivider label="Geography" />

      <ChartContainer
        title="AI Patents by Country"
        caption="Countries ranked by total AI-related patents based on primary inventor location."
        insight="The US lead in AI patenting reflects its concentration of major AI research labs and tech firms, but the strong showing of Japan and South Korea highlights Asia's significant investment in AI-driven electronics and consumer technology."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoCountry}
          xKey="country"
          bars={[{ key: 'ai_patents', name: 'AI Patents', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The geographic distribution of AI patents reveals the dominant role of the United
          States, Japan, and South Korea in AI innovation. The United States maintains a
          substantial lead, driven by the concentration of major AI research laboratories
          and technology firms. The strong presence of East Asian economies reflects their
          investments in electronics, semiconductors, and consumer technology -- sectors
          where AI capabilities have become increasingly central to product differentiation.
        </p>
      </KeyInsight>

      <ChartContainer
        title="AI Patents by US State"
        caption="US states ranked by total AI-related patents based on primary inventor location."
        insight="California's dominance in AI patents reflects powerful agglomeration effects — proximity to talent pools, venture capital, and established AI research communities creates a self-reinforcing concentration of innovation."
        loading={geoL}
        height={900}
      >
        <PWBarChart
          data={geoState}
          xKey="state"
          bars={[{ key: 'ai_patents', name: 'AI Patents', color: CHART_COLORS[3] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Within the United States, AI patenting is heavily concentrated in California,
          consistent with the state&apos;s dominance of the broader technology sector.
          The clustering of AI innovation in a small number of technology hubs reflects
          the importance of proximity to talent pools, venture capital, and established
          AI research communities -- agglomeration effects that are particularly pronounced
          in knowledge-intensive fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Quality Indicators" />

      <ChartContainer
        title="AI Patent Quality Over Time"
        caption="Average claims, backward citations, technology scope, and team size for AI-related patents by year."
        insight="Rising backward citations and technology scope suggest AI patents are becoming more interconnected and interdisciplinary, reflecting AI's expanding role as a general-purpose technology."
        loading={qL}
      >
        <PWLineChart
          data={quality ?? []}
          xKey="year"
          lines={[
            { key: 'avg_claims', name: 'Avg Claims', color: CHART_COLORS[0] },
            { key: 'avg_backward_cites', name: 'Avg Backward Citations', color: CHART_COLORS[2] },
            { key: 'avg_scope', name: 'Avg Scope (CPC Subclasses)', color: CHART_COLORS[4] },
          ]}
          yLabel="Count"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2008, 2014, 2020] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AI patents exhibit distinctive quality characteristics relative to the broader
          patent system. The growing number of backward citations reflects the increasingly
          interconnected nature of AI research, while the expanding technology scope indicates
          that AI inventions are becoming more interdisciplinary -- spanning multiple <GlossaryTooltip term="CPC">CPC</GlossaryTooltip>{' '}
          subclasses as AI methods find applications across diverse technology domains.
        </p>
      </KeyInsight>

      <ChartContainer
        title="AI Patent Team Size Over Time"
        caption="Average number of inventors per AI-related patent by year."
        insight="Growing team sizes reflect the increasing complexity of AI research, which now requires expertise spanning machine learning, domain knowledge, hardware optimization, and software engineering."
        loading={qL}
      >
        <PWLineChart
          data={quality ?? []}
          xKey="year"
          lines={[
            { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[5] },
          ]}
          yLabel="Inventors"
          yFormatter={(v) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2008, 2014, 2020] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The growing team size for AI patents reflects the increasing complexity and
          interdisciplinarity of AI research. Modern AI systems require expertise across
          multiple domains -- machine learning, domain-specific knowledge, hardware
          optimization, and software engineering -- necessitating larger and more diverse
          research teams.
        </p>
      </KeyInsight>

      <SectionDivider label="AI Patenting Strategies" />
      <Narrative>
        <p>
          The top AI patent holders pursue very different strategies. Some focus deeply
          on neural networks and deep learning, while others spread their portfolios across
          computer vision, NLP, and other sub-areas. Comparing AI sub-field portfolios across
          major players reveals where each company is placing its bets and where white
          spaces exist.
        </p>
      </Narrative>
      {strategyOrgs.length > 0 && (
        <div className="max-w-4xl mx-auto my-8 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Organization</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Top Sub-Areas</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total AI Patents</th>
              </tr>
            </thead>
            <tbody>
              {strategyOrgs.slice(0, 15).map((org, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium text-sm">{org.organization.length > 30 ? org.organization.slice(0, 27) + '...' : org.organization}</td>
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
          IBM leads in total AI patents but with a portfolio emphasizing knowledge-based
          systems from its early AI era. Samsung and Google have built massive deep learning
          portfolios. The most interesting strategic differences emerge in newer sub-areas:
          NLP and speech recognition are more concentrated among a few players, while
          computer vision is broadly contested. White spaces in quantum computing suggest
          potential for early movers.
        </p>
      </KeyInsight>

      <SectionDivider label="AI as a General Purpose Technology" />
      <Narrative>
        <p>
          A hallmark of general purpose technologies (GPTs) is that they diffuse into
          many sectors of the economy. By tracking how often AI-classified patents also
          carry CPC codes from non-AI technology areas (excluding Section G which contains
          AI), we can measure AI&apos;s spread into healthcare, manufacturing, chemistry,
          and other domains.
        </p>
      </Narrative>
      <ChartContainer
        title="AI Patent Co-Occurrence with Other Technology Areas"
        caption="Percentage of AI patents that also carry CPC codes from each non-AI section (G excluded). Rising lines indicate AI diffusing into that sector."
        insight="AI's presence across multiple CPC sections confirms its status as a general-purpose technology, similar to electricity or computing in earlier eras. The rising co-occurrence with healthcare and manufacturing signals AI's expanding real-world impact."
        loading={agdL}
      >
        {gptPivot.length > 0 && (
          <PWLineChart
            data={gptPivot}
            xKey="year"
            lines={gptSections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="% of AI Patents"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2008, 2014, 2020] })}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          AI is increasingly behaving like a general purpose technology. The share of AI
          patents co-classified with Human Necessities (A) — encompassing healthcare and
          biomedical applications — has risen dramatically, reflecting the AI revolution
          in medical imaging, drug discovery, and diagnostics. Co-occurrence with Electricity
          (H) reflects AI&apos;s integration with hardware and telecommunications. The broad
          upward trend across most sections confirms that AI is no longer a niche computing
          technology but a transformative force across the entire innovation landscape.
        </p>
      </KeyInsight>

      <SectionDivider label="AI's Inventor Problem" />

      <Narrative>
        <p>
          AI patents increasingly involve larger teams and corporate assignees, reflecting the
          capital-intensive nature of modern AI research. The average AI patent lists more
          inventors than non-AI patents, and the gap has widened over time — raising questions
          about individual attribution in an era of large-scale collaborative AI development.
        </p>
      </Narrative>

      <ChartContainer
        title="Team Size: AI vs. Non-AI Patents"
        caption="Average number of inventors per patent for AI-related vs. non-AI utility patents, 1976–2025."
        insight="AI patents consistently have larger teams than non-AI patents, and the gap has widened since 2010. This reflects the increasing complexity of AI systems, which require expertise spanning machine learning, domain knowledge, hardware, and software engineering."
        loading={atcL}
      >
        <PWLineChart
          data={teamComparisonPivot}
          xKey="year"
          lines={[
            { key: 'AI', name: 'AI Patents', color: CHART_COLORS[0] },
            { key: 'Non-AI', name: 'Non-AI Patents', color: CHART_COLORS[3] },
          ]}
          yLabel="Avg Team Size"
          yFormatter={(v: number) => v.toFixed(1)}
        />
      </ChartContainer>

      <ChartContainer
        title="AI Patent Assignee Types Over Time"
        caption="Distribution of AI patent assignees by type (corporate, university, government, individual) over time."
        insight="Corporate assignees have dominated AI patenting throughout its history, but the corporate share has intensified since 2010 as large tech companies built massive AI research divisions. University AI patenting has grown in absolute terms but declined as a share."
        loading={aatL}
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
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The growing team sizes and corporate dominance in AI patenting predates the DABUS
          debate about AI-as-inventor, but underscores how individual attribution in AI innovation
          is becoming more diffuse. As AI systems require increasingly large and multidisciplinary
          teams, the traditional model of named inventors on patents may struggle to capture the
          true nature of collaborative AI development.
        </p>
      </KeyInsight>

      <DataNote>
        AI patents are identified using CPC classifications: G06N (computational models
        including neural networks and machine learning), G06F18 (pattern recognition),
        G06V (image/video recognition), G10L15 (speech recognition), and G06F40
        (natural language processing). A patent is classified as AI-related if any of
        its CPC codes fall within these categories. Subfield classifications are based
        on more specific CPC group codes within G06N. AI patenting strategies show patent counts per AI sub-area for the top 20 assignees. AI as GPT measures co-occurrence of AI CPC codes with non-AI CPC sections (Section G excluded since it contains AI classifications).
      </DataNote>

      <RelatedChapters currentChapter={11} />
      <ChapterNavigation currentChapter={11} />
    </div>
  );
}
