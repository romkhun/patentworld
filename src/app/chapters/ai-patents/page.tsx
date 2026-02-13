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
import { PWBumpChart } from '@/components/charts/PWBumpChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import type {
  AIPatentsPerYear, AIBySubfield, AITopAssignee,
  AITopInventor, AIGeography, AIQuality, AIOrgOverTime,
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

  return (
    <div>
      <ChapterHeader
        number={11}
        title="Artificial Intelligence"
        subtitle="The rise of AI in the patent system"
      />

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
        loading={pyL}
      >
        <PWLineChart
          data={perYear ?? []}
          xKey="year"
          lines={[
            { key: 'ai_patents', name: 'AI Patents', color: CHART_COLORS[0] },
          ]}
          yLabel="Patents"
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
        />
      </ChartContainer>

      <SectionDivider label="AI Subfields" />

      <ChartContainer
        title="AI Patent Activity by Subfield"
        caption="Patent counts by AI subfield over time, based on CPC classifications. Neural networks/deep learning and machine learning have driven the recent surge."
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
          caption="Annual ranking of the top 15 organizations by AI patent grants, 2000-2025. Hover over any line or label to highlight an organization's trajectory. Lower rank = more AI patents that year."
          loading={ootL}
          height={750}
          wide
        >
          <PWBumpChart
            data={orgRankData}
            nameKey="organization"
            yearKey="year"
            rankKey="rank"
            maxRank={15}
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
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          AI patents exhibit distinctive quality characteristics relative to the broader
          patent system. The growing number of backward citations reflects the increasingly
          interconnected nature of AI research, while the expanding technology scope indicates
          that AI inventions are becoming more interdisciplinary -- spanning multiple CPC
          subclasses as AI methods find applications across diverse technology domains.
        </p>
      </KeyInsight>

      <ChartContainer
        title="AI Patent Team Size Over Time"
        caption="Average number of inventors per AI-related patent by year."
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

      <DataNote>
        AI patents are identified using CPC classifications: G06N (computational models
        including neural networks and machine learning), G06F18 (pattern recognition),
        G06V (image/video recognition), G10L15 (speech recognition), and G06F40
        (natural language processing). A patent is classified as AI-related if any of
        its CPC codes fall within these categories. Subfield classifications are based
        on more specific CPC group codes within G06N.
      </DataNote>

      <ChapterNavigation currentChapter={11} />
    </div>
  );
}
