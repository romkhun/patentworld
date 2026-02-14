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
  'Other Computational Models': '#44AA99',
  'Other AI': '#999999',
};

export default function Chapter11() {
  const { data: perYear, loading: pyL } = useChapterData<AIPatentsPerYear[]>('chapter11/ai_patents_per_year.json');
  const { data: bySubfield, loading: sfL } = useChapterData<AIBySubfield[]>('chapter11/ai_by_subfield.json');
  const { data: topAssignees, loading: taL } = useChapterData<AITopAssignee[]>('chapter11/ai_top_assignees.json');
  const { data: topInventors, loading: tiL } = useChapterData<AITopInventor[]>('chapter11/ai_top_inventors.json');
  const { data: geography, loading: geoL } = useChapterData<AIGeography[]>('chapter11/ai_geography.json');
  const { data: quality, loading: qL } = useChapterData<AIQuality[]>('chapter11/ai_quality.json');
  const { data: orgOverTime, loading: ootL } = useChapterData<AIOrgOverTime[]>('chapter11/ai_org_over_time.json');
  const { data: aiStrategies } = useChapterData<AIStrategy[]>('chapter11/ai_strategies.json');
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
        subtitle="The growth of AI-related patenting activity in the United States"
      />

      <KeyFindings>
        <li>AI patent filings have exhibited exponential growth since 2010, driven by advances in deep learning and the expansion of AI applications across industries.</li>
        <li>The composition of AI patents has shifted from expert systems and rule-based approaches in the 1990s to machine learning, neural networks, and generative AI today.</li>
        <li>A small number of large technology firms dominate AI patenting, with IBM, Google, Samsung, and Microsoft leading in volume.</li>
        <li>AI patents span multiple technology domains, consistent with the characterization of AI as a general-purpose technology with applications across nearly every industry.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The trajectory of AI patenting reflects a broader transformation in the structure of American innovation, one in which a single methodological breakthrough -- the deep learning revolution of the early 2010s -- reshaped inventive activity across virtually every sector of the economy. What began as a niche area of computing has become a focal point of corporate R&amp;D strategy, with a handful of resource-rich firms building portfolios that increasingly bridge healthcare, manufacturing, and telecommunications. The widening gap in inventor team sizes between AI and non-AI patents, combined with the geographic concentration of activity in California, suggests that AI innovation is becoming both more collaborative and more spatially clustered than the patent system as a whole -- a pattern that carries significant implications for the distribution of technological capability examined further in the company-level analysis of Chapter 14.
        </p>
      </aside>

      <Narrative>
        <p>
          Artificial intelligence has evolved from a specialized academic pursuit to one of
          the most active domains in the United States patent system. This chapter examines
          the trajectory of <StatCallout value="AI-related patents" /> -- from early expert
          systems and symbolic reasoning through the machine learning transformation to the
          current era of deep learning and generative models.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          AI patent activity serves as a leading indicator of technological investment and
          capability building. The exponential growth in AI patenting since 2012 coincides
          with advances in deep learning, reflecting a fundamental shift in how firms
          approach innovation in computing, healthcare, transportation, and nearly every
          other sector of the economy.
        </p>
      </KeyInsight>

      <SectionDivider label="Growth Trajectory" />

      <ChartContainer
        id="fig-ai-patents-annual-count"
        subtitle="Annual count of utility patents classified under AI-related CPC codes (G06N, G06F18, G06V, G10L15, G06F40), tracking the growth trajectory of AI patenting."
        title="AI Patent Filings Grew from 5,201 in 2012 to 29,624 in 2023, a 5.7x Increase Driven by Deep Learning Advances"
        caption="Annual count and share of utility patents classified under AI-related CPC codes (G06N, G06F18, G06V, G10L15, G06F40), 1976-2025. The most prominent pattern is the exponential increase beginning around 2012, coinciding with advances in deep learning frameworks and GPU computing."
        insight="The exponential growth in AI patents mirrors the broader expansion of AI capabilities, driven by advances in deep learning frameworks, GPU computing, and large-scale data availability."
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
          AI patent filings have exhibited exponential growth since the early 2010s, driven
          by advances in deep learning, the availability of large-scale training data, and
          increased computational power through GPUs and specialized hardware. The growth
          rate substantially exceeds that of the overall patent system, suggesting a
          disproportionate concentration of R&D investment in AI technologies.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-ai-patents-share"
        subtitle="AI patents as a percentage of all utility patents, showing the growing reallocation of inventive effort toward AI technologies."
        title="AI's Share of Total Patents Rose from 0.15% in 1976 to 9.4% in 2023, Indicating a Reallocation of Inventive Effort"
        caption="Percentage of all utility patents classified under AI-related CPC codes. The upward trend indicates that AI patenting growth is not merely tracking overall patent growth but represents a disproportionate concentration of inventive effort."
        insight="The growing share of AI patents among all patents demonstrates that AI growth is not merely tracking overall patent expansion; rather, it suggests a genuine reallocation of inventive effort toward AI technologies."
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
        id="fig-ai-patents-subfields"
        subtitle="Patent counts by AI subfield (neural networks, machine learning, NLP, etc.) over time, based on specific CPC group codes within G06N."
        title="Neural Networks / Deep Learning Patents Surged from 175 in 2012 to 10,467 in 2023, Displacing Knowledge-Based Systems as the Dominant AI Subfield"
        caption="Patent counts by AI subfield over time, based on CPC classifications. The data reveal that neural networks/deep learning and machine learning have driven the recent growth, displacing knowledge-based systems that dominated through the 1990s."
        insight="The shift from expert systems to deep learning reflects fundamental changes in AI methodology, moving from hand-crafted rules to data-driven pattern recognition."
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
          The composition of AI patents has shifted substantially over time. Early AI patenting
          was dominated by knowledge-based systems and pattern recognition. Since 2012, neural
          networks and deep learning have become the dominant subfield, reflecting the
          methodological transformation catalyzed by advances in convolutional and recurrent
          architectures. Computer vision and natural language processing have also experienced
          rapid growth as deep learning methods demonstrated considerable effectiveness in
          these domains.
        </p>
      </KeyInsight>

      <SectionDivider label="Organizations" />

      <ChartContainer
        id="fig-ai-patents-top-assignees"
        subtitle="Organizations ranked by total AI-related patent count from 1976 to 2025, showing concentration among large technology firms."
        title="IBM (16,781), Google (7,775), and Samsung (6,195) Lead in Total AI Patent Volume, Reflecting the Resource-Intensive Nature of AI R&D"
        caption="Organizations ranked by total AI-related patents, 1976-2025. The data indicate a concentration among large technology firms with substantial computational infrastructure and data assets."
        insight="The dominance of large technology firms in AI patenting reflects the resource-intensive nature of AI R&D, which requires large-scale datasets, computing infrastructure, and specialized talent."
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
          conglomerates (Samsung, LG, Sony) indicates the global nature of AI patent
          competition. The organizational landscape also reflects the significant role of
          corporate research laboratories in advancing fundamental AI capabilities.
        </p>
      </KeyInsight>

      {orgRankData.length > 0 && (
        <ChartContainer
          id="fig-ai-patents-org-rankings"
          subtitle="Annual ranking of the top 15 organizations by AI patent grants from 2000 to 2025, with darker cells indicating higher rank."
          title="7 Firms Exceeded 400 AI Patents in 2024, Up From 1 in 2000, as Multiple Firms Converged at the Top After 2012"
          caption="Annual ranking of the top 15 organizations by AI patent grants, 2000-2025. Darker cells indicate higher rank (more patents). The data reveal rapid convergence of multiple firms since 2012 as advances in deep learning attracted investment from across technology sectors."
          insight="The rapid convergence of multiple firms at the top since 2012 reflects intensifying competitive dynamics in AI capabilities, as the deep learning transformation attracted substantial investment from firms across technology sectors."
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
          The ranking data reveal substantial shifts in organizational dominance. IBM held the
          top position largely unchallenged for decades; however, the 2010s exhibited rapid
          convergence as Google, Samsung, Microsoft, Amazon, and Apple scaled their AI
          research operations in response to advances in deep learning. The emergence of
          non-traditional technology firms such as Capital One signals the expanding
          application of AI beyond core technology sectors, while the convergence of
          multiple firms at the top suggests intensifying competitive dynamics in AI
          capabilities.
        </p>
      </KeyInsight>

      <SectionDivider label="Inventors" />

      <ChartContainer
        id="fig-ai-patents-top-inventors"
        subtitle="Primary inventors ranked by total AI-related patent count from 1976 to 2025, illustrating the skewed distribution of individual output."
        title="The Top 10 AI Inventors Hold 1,943 Patents, Accounting for 35% of Output Among the Most Prolific Cohort"
        caption="Primary inventors ranked by total AI-related patents, 1976-2025. The distribution exhibits pronounced skewness, with a small number of highly productive individuals accounting for a disproportionate share of total AI patent output."
        insight="The concentration of AI patenting among a small cohort of prolific inventors mirrors the broader superstar pattern in innovation, where a few highly productive individuals account for a disproportionate share of output."
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
          The most prolific AI inventors are typically affiliated with large technology firms
          that maintain dedicated AI research divisions. The concentration of AI patenting
          among a relatively small cohort of highly productive inventors mirrors the broader
          pattern of skewed productivity distributions observed across the patent system,
          though the degree of concentration appears to be more pronounced in AI, likely
          reflecting the specialized expertise required.
        </p>
      </KeyInsight>

      <SectionDivider label="Geography" />

      <ChartContainer
        id="fig-ai-patents-by-country"
        subtitle="Countries ranked by total AI-related patents based on primary inventor location, showing geographic distribution of AI innovation."
        title="The United States Accounts for 56% of Global AI Patents, Followed by Japan at 12% and China at 6%"
        caption="Countries ranked by total AI-related patents based on primary inventor location. The United States maintains a substantial lead, while the strong presence of Japan, China, and South Korea indicates significant Asian investment in AI-driven electronics and consumer technology."
        insight="The United States lead in AI patenting reflects its concentration of major AI research laboratories and technology firms, while the strong presence of Japan, China, and South Korea indicates substantial Asian investment in AI-driven electronics and consumer technology."
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
          States, Japan, China, and South Korea in AI innovation. The United States maintains a
          substantial lead, driven by the concentration of major AI research laboratories
          and technology firms. The strong presence of East Asian economies reflects their
          investments in electronics, semiconductors, and consumer technology -- sectors
          where AI capabilities have become increasingly central to product differentiation.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-ai-patents-by-state"
        subtitle="US states ranked by total AI-related patents based on primary inventor location, highlighting geographic clustering within the United States."
        title="California Produces 38% of US AI Patents, Reflecting Strong Agglomeration Effects"
        caption="US states ranked by total AI-related patents based on primary inventor location. California's substantial lead is consistent with agglomeration effects, where proximity to talent pools, venture capital, and established AI research communities creates a self-reinforcing concentration of innovation."
        insight="California's dominance in AI patents is consistent with strong agglomeration effects: proximity to talent pools, venture capital, and established AI research communities creates a self-reinforcing concentration of innovation."
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
        id="fig-ai-patents-quality"
        subtitle="Average claims, backward citations, and technology scope (CPC subclasses) for AI patents by year, measuring quality trends."
        title="AI Patent Technology Scope Rose from 1.69 in 1990 to 3.21 in 2023, Suggesting Growing Interdisciplinarity"
        caption="Average claims, backward citations, and technology scope for AI-related patents by year. The most notable pattern is the upward trend in backward citations and technology scope, suggesting that AI patents are becoming increasingly interconnected and interdisciplinary."
        insight="Rising backward citations and technology scope suggest that AI patents are becoming more interconnected and interdisciplinary, consistent with the expanding role of AI as a general-purpose technology."
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
        id="fig-ai-patents-team-size"
        subtitle="Average number of named inventors per AI-related patent by year, reflecting the growing complexity and multidisciplinarity of AI research."
        title="Average AI Patent Team Size Grew from 2.0 in 1976 to 3.5 in 2025, Indicating Growing Research Complexity"
        caption="Average number of inventors per AI-related patent by year. The upward trend is consistent with the interpretation that modern AI research requires expertise spanning machine learning, domain knowledge, hardware optimization, and software engineering."
        insight="Growing team sizes reflect the increasing complexity of AI research, which now necessitates expertise spanning machine learning, domain knowledge, hardware optimization, and software engineering."
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
          The leading AI patent holders pursue markedly different strategies. Certain firms
          concentrate on neural networks and deep learning, while others distribute their
          portfolios across computer vision, natural language processing, and other subfields.
          A comparison of AI subfield portfolios across major holders reveals where each
          organization concentrates its inventive effort and identifies areas that remain
          relatively underexplored.
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
          IBM leads in total AI patents, though its portfolio emphasizes knowledge-based
          systems from its earlier period of AI investment. Samsung and Google have built
          substantial deep learning portfolios. The most notable strategic differences emerge
          in newer subfields: natural language processing and speech recognition are more
          concentrated among a small number of organizations, while computer vision is broadly
          contested. The relative scarcity of quantum computing patents may represent an
          area of opportunity for early entrants.
        </p>
      </KeyInsight>

      <SectionDivider label="AI as a General Purpose Technology" />
      <Narrative>
        <p>
          A defining characteristic of general-purpose technologies (GPTs) is their diffusion
          into multiple sectors of the economy. By tracking how frequently AI-classified
          patents also carry CPC codes from non-AI technology areas (excluding Section G,
          which contains AI), it is possible to measure the spread of AI into healthcare,
          manufacturing, chemistry, and other domains.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-ai-patents-gpt-diffusion"
        subtitle="Percentage of AI patents co-classified with non-AI CPC sections, measuring AI's diffusion into healthcare, manufacturing, and other domains."
        title="AI Patent Co-Occurrence with Manufacturing CPC Codes Rose from 4% to 11%, and Healthcare from 4% to 9%, Since 1990"
        caption="Percentage of AI patents that also carry CPC codes from each non-AI section (G excluded). Rising lines indicate AI diffusing into that sector. The most notable pattern is the increasing co-occurrence with Human Necessities (Section A, encompassing healthcare) and Performing Operations (Section B, encompassing manufacturing)."
        insight="The presence of AI across multiple CPC sections is consistent with its characterization as a general-purpose technology, comparable to electricity or computing in earlier eras. The rising co-occurrence with healthcare and manufacturing CPC codes suggests expanding real-world applications of AI."
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
          AI increasingly exhibits the characteristics of a general-purpose technology. The
          share of AI patents co-classified with Human Necessities (A), encompassing healthcare
          and biomedical applications, has risen substantially, reflecting the growing
          application of AI in medical imaging, drug discovery, and diagnostics. Co-occurrence
          with Electricity (H) reflects the integration of AI with hardware and
          telecommunications. The broad upward trend across most sections suggests that AI
          has evolved beyond a specialized computing technology to become a pervasive element
          of the broader innovation landscape.
        </p>
      </KeyInsight>

      <SectionDivider label="The Attribution Challenge in AI Patenting" />

      <Narrative>
        <p>
          AI patents increasingly involve larger inventor teams and corporate assignees,
          reflecting the capital-intensive nature of modern AI research. The average AI patent
          lists more inventors than non-AI patents, and this disparity has widened over time,
          raising questions about individual attribution in an era of large-scale collaborative
          AI development.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-ai-patents-team-comparison"
        subtitle="Average inventors per patent for AI vs. non-AI utility patents by year, showing the widening complexity gap between the two categories."
        title="AI Patents Consistently Involve Larger Teams Than Non-AI Patents, With the Gap Widening from 0.08 to 0.31 Inventors Since 2010"
        caption="Average number of inventors per patent for AI-related vs. non-AI utility patents, 1976–2025. The data indicate that AI patents consistently involve larger teams, and the gap has widened since 2010, reflecting the increasing complexity of AI systems."
        insight="AI patents consistently involve larger teams than non-AI patents, and the gap has widened since 2010. This pattern reflects the increasing complexity of AI systems, which require expertise spanning machine learning, domain knowledge, hardware, and software engineering."
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
        id="fig-ai-patents-assignee-type"
        subtitle="Distribution of AI patents by assignee type (corporate, university, government, individual) over time, showing the intensifying corporate share."
        title="Corporate Assignees Account for 99% of AI Patents, With Volume Growing 8x Since 2010"
        caption="Distribution of AI patent assignees by type (corporate, university, government, individual) over time. The data reveal that the corporate share has intensified since 2010 as large technology firms expanded their AI research divisions, while university AI patenting has grown in absolute terms but declined as a proportion."
        insight="Corporate assignees have dominated AI patenting throughout its history, and the corporate share has intensified since 2010 as large technology companies expanded their AI research divisions. University AI patenting has grown in absolute terms but has declined as a share."
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
          The growth in team sizes and corporate dominance in AI patenting predates the DABUS
          debate regarding AI-as-inventor, yet underscores the extent to which individual
          attribution in AI innovation is becoming more diffuse. As AI systems require
          increasingly large and multidisciplinary teams, the traditional model of named
          inventors on patents may prove insufficient to capture the collaborative nature of
          modern AI development.
        </p>
      </KeyInsight>

      <Narrative>
        Having documented the growth of artificial intelligence in the patent system, the following chapter examines another consequential technology domain: green innovation. As with AI, clean technology patents have grown rapidly and are increasingly converging with other fields, including artificial intelligence itself.
      </Narrative>

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
