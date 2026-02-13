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
import { PWScatterChart } from '@/components/charts/PWScatterChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { TOPIC_COLORS, CHART_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import type {
  TopicDefinition, TopicPrevalence, TopicCPCMatrix,
  TopicUMAPPoint, TopicNoveltyTrend, TopicNoveltyPatent,
} from '@/lib/types';

export default function Chapter13() {
  const { data: definitions, loading: defL } = useChapterData<TopicDefinition[]>('chapter12/topic_definitions.json');
  const { data: prevalence, loading: prevL } = useChapterData<TopicPrevalence[]>('chapter12/topic_prevalence.json');
  const { data: cpcMatrix, loading: cpcL } = useChapterData<TopicCPCMatrix[]>('chapter12/topic_cpc_matrix.json');
  const { data: umapData, loading: umapL } = useChapterData<TopicUMAPPoint[]>('chapter12/topic_umap.json');
  const { data: noveltyTrend, loading: novTL } = useChapterData<TopicNoveltyTrend[]>('chapter12/topic_novelty_trend.json');
  const { data: noveltyTop } = useChapterData<TopicNoveltyPatent[]>('chapter12/topic_novelty_top.json');

  // Pivot prevalence data: year → { year, topic0: share, topic1: share, ... }
  const { prevalencePivot, topicAreas } = useMemo(() => {
    if (!prevalence || !definitions) return { prevalencePivot: [], topicAreas: [] };
    const years = [...new Set(prevalence.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      prevalence
        .filter((d) => d.year === year)
        .forEach((d) => { row[`topic_${d.topic}`] = d.share; });
      return row;
    });
    // Sort topics by total patent count descending for legend order
    const sorted = [...definitions].sort((a, b) => b.patent_count - a.patent_count);
    const areas = sorted.map((t) => ({
      key: `topic_${t.id}`,
      name: t.name,
      color: TOPIC_COLORS[t.id % TOPIC_COLORS.length],
    }));
    return { prevalencePivot: pivoted, topicAreas: areas };
  }, [prevalence, definitions]);

  // Prepare CPC × Topic data: for top 8 topics (by patent count), show share per CPC section
  const { cpcBarData, cpcBarTopics } = useMemo(() => {
    if (!cpcMatrix || !definitions) return { cpcBarData: [], cpcBarTopics: [] };
    // Get top 8 topics by patent count
    const sorted = [...definitions].sort((a, b) => b.patent_count - a.patent_count);
    const top8 = sorted.slice(0, 8);
    const sections = Object.keys(CPC_SECTION_NAMES).filter((s) => s !== 'Y');
    const data = sections.map((section) => {
      const row: Record<string, unknown> = {
        section: `${section}: ${CPC_SECTION_NAMES[section]}`,
      };
      top8.forEach((t) => {
        const entry = cpcMatrix.find(
          (m) => m.section === section && m.topic === t.id
        );
        row[`topic_${t.id}`] = entry?.share ?? 0;
      });
      return row;
    });
    const bars = top8.map((t) => ({
      key: `topic_${t.id}`,
      name: t.name,
      color: TOPIC_COLORS[t.id % TOPIC_COLORS.length],
    }));
    return { cpcBarData: data, cpcBarTopics: bars };
  }, [cpcMatrix, definitions]);

  // UMAP scatter categories
  const umapCategories = useMemo(() => {
    if (!definitions) return [];
    return definitions.map((t) => t.name);
  }, [definitions]);

  // Summary stats
  const totalPatents = definitions
    ? definitions.reduce((s, d) => s + d.patent_count, 0)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ChapterHeader
        number={13}
        title="The Language of Innovation"
        subtitle="What patents talk about and how it has changed"
      />

      <KeyFindings>
        <li>
          <GlossaryTooltip term="topic modeling">Topic modeling</GlossaryTooltip> of {formatCompact(totalPatents)} patent abstracts reveals 25 distinct technology themes spanning computing, chemistry, biotechnology, and engineering.
        </li>
        <li>Computing and semiconductor-related topics have grown from under 10% to over 30% of all patents since 1976, mirroring the digital revolution.</li>
        <li>Patents that span multiple topics — measured by Shannon entropy — tend to be the most novel inventions, often sitting at the intersection of technologies.</li>
        <li>The semantic landscape of patents, visualized via <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip>, shows clear clustering by technology area with growing overlap between computational and scientific domains.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          NMF topic modeling on {formatCompact(totalPatents)} patent abstracts (1976-2025) reveals 25 latent themes; computing and semiconductor topics grew from under 10% to over 30% of all patents. A UMAP projection of 15,000 patents shows clear clustering by technology area with meaningful spatial relationships. Patent novelty -- measured by Shannon entropy of topic distributions -- has risen steadily since the 1990s, with the highest-entropy patents sitting at the intersection of computing, biology, chemistry, and engineering.
        </p>
      </aside>

      <Narrative>
        <p>
          What do 9.36 million patents actually talk about? By applying <GlossaryTooltip term="NMF">NMF</GlossaryTooltip> topic
          modeling to every patent abstract filed with the USPTO since 1976, we can uncover the hidden themes of American
          innovation. Using <GlossaryTooltip term="TF-IDF">TF-IDF</GlossaryTooltip> to convert raw text into numerical
          features, and non-negative matrix factorization to discover 25 latent topics, this analysis reveals which themes
          are rising, which are declining, and how they map onto the formal technology classification system.
        </p>
      </Narrative>

      {/* ── Section: Emerging Themes ──────────────────────────────────────── */}
      <SectionDivider label="Emerging Themes" />

      <Narrative>
        <p>
          The stacked area chart below shows how the share of each topic has evolved over time. Computing,
          semiconductor, and communications topics have expanded dramatically, while traditional mechanical
          and chemical engineering topics have seen their relative share decline — though not necessarily
          in absolute volume.
        </p>
      </Narrative>

      <ChartContainer
        title="Topic Prevalence Over Time"
        caption="Share of patents belonging to each of 25 NMF-derived topics, 1976–2025. Topics sorted by total patent count."
        insight="The language of innovation has shifted decisively toward computing and digital technology over 50 years. Topics related to software, semiconductors, and wireless communications now dominate patent abstracts."
        loading={prevL || defL}
        height={650}
        wide
      >
        <PWAreaChart
          data={prevalencePivot}
          xKey="year"
          areas={topicAreas}
          stackedPercent
        />
      </ChartContainer>

      {/* Topic definitions table */}
      {definitions && (
        <div className="my-12 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Topic</th>
                <th className="py-2 pr-4 font-medium">Top Words</th>
                <th className="py-2 text-right font-medium">Patents</th>
              </tr>
            </thead>
            <tbody>
              {[...definitions]
                .sort((a, b) => b.patent_count - a.patent_count)
                .map((t) => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="py-2 pr-4">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: TOPIC_COLORS[t.id % TOPIC_COLORS.length] }}
                      />
                    </td>
                    <td className="py-2 pr-4 font-medium whitespace-nowrap">{t.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs">
                      {t.top_words.slice(0, 8).join(', ')}
                    </td>
                    <td className="py-2 text-right font-mono text-xs">
                      {formatCompact(t.patent_count)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            25 topics discovered by NMF topic modeling on {formatCompact(totalPatents)} patent abstracts.
            Topics are automatically named from their top-weighted terms.
          </figcaption>
        </div>
      )}

      {/* ── Section: The Patent Landscape ────────────────────────────────── */}
      <SectionDivider label="The Patent Landscape" />

      <Narrative>
        <p>
          To visualize the full semantic landscape of patents, we project a stratified sample of 15,000 patents
          from high-dimensional TF-IDF space into two dimensions using UMAP. Each dot represents a patent,
          colored by its dominant topic. Clusters reveal families of related inventions; overlapping regions
          reveal technology convergence.
        </p>
      </Narrative>

      <ChartContainer
        title="Semantic Map of Patents (UMAP)"
        caption="15,000 patents projected into 2D via UMAP on TF-IDF vectors (600 per topic, stratified). Each dot = one patent, colored by dominant topic."
        insight="The UMAP projection reveals clear topic clusters with meaningful spatial relationships — computing and electronics topics cluster together, while chemistry and biotech form their own neighborhood. Bridging patents between clusters often represent the most novel cross-domain inventions."
        loading={umapL || defL}
        height={650}
        wide
      >
        <PWScatterChart
          data={umapData ?? []}
          xKey="x"
          yKey="y"
          colorKey="topic_name"
          nameKey="patent_id"
          categories={umapCategories}
          colors={TOPIC_COLORS}
          tooltipFields={[
            { key: 'topic_name', label: 'Topic' },
            { key: 'year', label: 'Year' },
            { key: 'section', label: 'CPC Section' },
            { key: 'patent_id', label: 'Patent' },
          ]}
          xLabel="UMAP-1"
          yLabel="UMAP-2"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The semantic map reveals that the boundaries between technology domains are not sharp lines
          but fuzzy gradients. Patents in the overlapping regions — where computing meets biology,
          or where materials science meets electronics — often represent the cutting edge of
          interdisciplinary innovation.
        </p>
      </KeyInsight>

      {/* ── Section: Topics and Technology ────────────────────────────────── */}
      <SectionDivider label="Topics and Technology" />

      <Narrative>
        <p>
          How do the discovered topics map onto the formal CPC classification system? The chart below
          cross-tabulates the top 8 most prevalent topics against CPC sections. Some topics align
          closely with a single CPC section (e.g., chemistry-related topics map to section C), while
          others — especially computing — span multiple sections.
        </p>
      </Narrative>

      <ChartContainer
        title="Topic Distribution by CPC Section"
        caption="Share (%) of patents in each CPC section belonging to each of the top 8 topics. Sections ordered A–H."
        insight="Topics related to computing and data processing appear across nearly all CPC sections, confirming that digital technology has become a general-purpose innovation platform that pervades every industry."
        loading={cpcL || defL}
        height={500}
      >
        <PWBarChart
          data={cpcBarData}
          xKey="section"
          bars={cpcBarTopics}
          stacked
          yFormatter={(v) => `${v.toFixed(0)}%`}
          yLabel="Share (%)"
        />
      </ChartContainer>

      {/* ── Section: Novelty ─────────────────────────────────────────────── */}
      <SectionDivider label="Novelty" />

      <Narrative>
        <p>
          How novel are today&apos;s patents compared to decades past? We measure novelty as the Shannon
          entropy of each patent&apos;s topic distribution: patents that draw roughly equally from many topics
          (high entropy) are more thematically diverse — and arguably more novel — than patents concentrated
          in a single topic (low entropy).
        </p>
      </Narrative>

      <ChartContainer
        title="Patent Novelty Over Time"
        caption="Median and average Shannon entropy of patent topic distributions by year. Higher entropy = more thematically diverse patents."
        insight="Patent novelty has risen steadily since the 1990s, suggesting that modern inventions increasingly combine ideas from multiple technology domains. This trend accelerated in the 2010s, coinciding with the rise of AI and other general-purpose technologies."
        loading={novTL}
      >
        <PWLineChart
          data={noveltyTrend ?? []}
          xKey="year"
          lines={[
            { key: 'median_entropy', name: 'Median Entropy', color: CHART_COLORS[0] },
            { key: 'avg_entropy', name: 'Average Entropy', color: CHART_COLORS[2] },
          ]}
          yLabel="Shannon Entropy (bits)"
          yFormatter={(v) => v.toFixed(2)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Rising entropy suggests that the boundaries between technology domains are becoming
          more porous. The most novel patents — those scoring highest on entropy — tend to
          sit at the intersection of multiple topics, combining language from computing,
          biology, chemistry, and engineering in ways that would have been rare just a few decades ago.
        </p>
      </KeyInsight>

      {/* Top 50 most novel patents table */}
      {noveltyTop && (
        <div className="my-12 overflow-x-auto">
          <h3 className="mb-4 font-sans text-base font-semibold tracking-tight text-muted-foreground">
            Top 50 Most Novel Patents (Highest Entropy)
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Patent ID</th>
                <th className="py-2 pr-4 font-medium">Year</th>
                <th className="py-2 pr-4 font-medium">CPC</th>
                <th className="py-2 pr-4 font-medium">Topic</th>
                <th className="py-2 text-right font-medium">Entropy</th>
              </tr>
            </thead>
            <tbody>
              {noveltyTop.map((p, i) => (
                <tr key={p.patent_id} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-1.5 pr-4 font-mono text-xs">{p.patent_id}</td>
                  <td className="py-1.5 pr-4">{p.year}</td>
                  <td className="py-1.5 pr-4">{p.section}</td>
                  <td className="py-1.5 pr-4 text-xs">{p.topic_name}</td>
                  <td className="py-1.5 text-right font-mono text-xs">{p.entropy.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            Patents with the highest Shannon entropy across 25 topic dimensions — indicating they draw
            language from the widest range of technology themes.
          </figcaption>
        </div>
      )}

      <Narrative>
        Having uncovered the hidden thematic structure of patent language, the final chapter zooms in to the company level -- building interactive innovation profiles for 100 major patent filers.
        The topics and trends identified here provide the foundation for understanding how individual firms have navigated the evolving technology landscape.
      </Narrative>

      <DataNote>
        <p>
          This analysis uses <GlossaryTooltip term="TF-IDF">TF-IDF</GlossaryTooltip> vectorization (10,000 features,
          unigrams + bigrams) and <GlossaryTooltip term="NMF">NMF</GlossaryTooltip> with 25 components on {formatCompact(totalPatents)} patent
          abstracts from 1976–2025. The <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip> projection uses a
          stratified sample of 15,000 patents (600 per topic) with cosine distance. Novelty is measured as Shannon
          entropy of the NMF topic weight vector. Topic names are auto-generated from the top-weighted terms and may
          not perfectly capture all nuances of each topic cluster. Source: PatentsView / USPTO.
        </p>
      </DataNote>

      <RelatedChapters currentChapter={13} />
      <ChapterNavigation currentChapter={13} />
    </div>
  );
}
