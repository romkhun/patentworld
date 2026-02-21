'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWScatterChart } from '@/components/charts/PWScatterChart';
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { TOPIC_COLORS, CHART_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { formatCompact } from '@/lib/formatters';
import type {
  TopicDefinition, TopicPrevalence, TopicCPCMatrix,
  TopicUMAPPoint, TopicNoveltyTrend, TopicNoveltyPatent,
} from '@/lib/types';

export default function Chapter3() {
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

  const [topicView, setTopicView] = useState<'stacked' | 'multiples'>('stacked');

  // Small multiples data for top 8 topics + Other
  const { topicPanels, topicPanelColors } = useMemo(() => {
    if (!prevalence || !definitions) return { topicPanels: [], topicPanelColors: [] };
    const sorted = [...definitions].sort((a, b) => b.patent_count - a.patent_count);
    const top8 = sorted.slice(0, 8);
    const otherIds = new Set(sorted.slice(8).map((t) => t.id));
    const years = [...new Set(prevalence.map((d) => d.year))].sort();

    const panels = top8.map((t) => ({
      name: t.name,
      data: years.map((year) => {
        const entry = prevalence.find((d) => d.year === year && d.topic === t.id);
        return { x: year, y: entry?.share ?? 0 };
      }),
    }));
    // "Other" panel: sum of remaining topics
    panels.push({
      name: 'Other (17 topics)',
      data: years.map((year) => {
        const otherShare = prevalence
          .filter((d) => d.year === year && otherIds.has(d.topic))
          .reduce((s, d) => s + (d.share ?? 0), 0);
        return { x: year, y: otherShare };
      }),
    });
    const colors = top8.map((t) => TOPIC_COLORS[t.id % TOPIC_COLORS.length]);
    colors.push('#9ca3af');
    return { topicPanels: panels, topicPanelColors: colors };
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

  // Cluster centroids for UMAP overlay labels (top 8 topics only)
  const umapCentroids = useMemo(() => {
    if (!umapData || !definitions || umapData.length === 0) return [];
    const sorted = [...definitions].sort((a, b) => b.patent_count - a.patent_count);
    const top8Names = new Set(sorted.slice(0, 8).map((t) => t.name));
    // Compute bounding box
    const xs = umapData.map((d) => d.x);
    const ys = umapData.map((d) => d.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    // Group by topic, compute mean position, convert to percentage
    const byTopic = new Map<string, { sx: number; sy: number; n: number }>();
    umapData.forEach((d) => {
      if (!top8Names.has(d.topic_name)) return;
      const entry = byTopic.get(d.topic_name) ?? { sx: 0, sy: 0, n: 0 };
      entry.sx += d.x;
      entry.sy += d.y;
      entry.n += 1;
      byTopic.set(d.topic_name, entry);
    });
    return Array.from(byTopic.entries()).map(([name, { sx, sy, n }]) => ({
      name,
      cx: ((sx / n - xMin) / (xMax - xMin)) * 100,
      cy: ((sy / n - yMin) / (yMax - yMin)) * 100,
    }));
  }, [umapData, definitions]);

  // Summary stats
  const totalPatents = definitions
    ? definitions.reduce((s, d) => s + d.patent_count, 0)
    : 8450000;

  return (
    <div>
      <ChapterHeader
        number={5}
        title="The Language of Innovation"
        subtitle="Semantic analysis of 8.45 million patent abstracts"
      />
      <MeasurementSidebar slug="system-language" />

      <KeyFindings>
        <li>
          <GlossaryTooltip term="topic modeling">Topic modeling</GlossaryTooltip> of {formatCompact(totalPatents)} patent abstracts reveals 25 distinct technology themes spanning computing, chemistry, biotechnology, and engineering.
        </li>
        <li>Computing and semiconductor-related topics have grown from 12% to 33% of all patents since 1976, mirroring the digital revolution.</li>
        <li>Patents that span multiple topics — measured by Shannon entropy — tend to be the most novel inventions, often sitting at the intersection of technologies.</li>
        <li>The semantic landscape of patents, visualized via <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip>, reveals clear clustering by technology area with growing overlap between computational and scientific domains.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Beneath the formal CPC classification system examined in earlier chapters lies a complementary thematic structure recoverable only through the language of patent abstracts themselves. The application of unsupervised text analysis to five decades of filings reveals that US patenting has undergone a pronounced reorientation toward <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">digital and computational domains</Link> -- a shift visible not only in patent counts but in the vocabulary inventors use to describe their work. Perhaps most notable is the overall rise in thematic diversity at the individual patent level: inventions that blend language from traditionally separate fields have become markedly more common, suggesting that the boundaries between technology domains documented in <Link href="/chapters/system-patent-quality" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent Quality</Link> and <Link href="/chapters/system-patent-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Patent Fields</Link> are growing more permeable over time. The semantic geography of these patents, when projected into two dimensions, makes visible the clustering and overlap that aggregate statistics alone cannot convey.
        </p>
      </aside>

      <Narrative>
        <p>
          8.45 million patent abstracts provide a rich corpus for examining the thematic structure of US patenting activity. By applying <GlossaryTooltip term="NMF">NMF</GlossaryTooltip> topic
          modeling to every utility patent abstract filed with the USPTO since 1976, this analysis uncovers the latent themes of
          US patenting. Using <GlossaryTooltip term="TF-IDF">TF-IDF</GlossaryTooltip> to convert raw text into numerical
          features, and non-negative matrix factorization to discover 25 latent topics, the results indicate which themes
          are rising, which are declining, and how they correspond to the formal technology classification system.
        </p>
      </Narrative>

      {/* ── Section: Emerging Themes ──────────────────────────────────────── */}
      <SectionDivider label="Topic Trends Over Time" />

      <Narrative>
        <p>
          The stacked area chart below illustrates how the share of each topic has evolved over time. Computing,
          semiconductor, and communications topics have expanded substantially, while traditional mechanical
          and chemical engineering topics have experienced a decline in relative share, though not necessarily
          in absolute volume.
        </p>
      </Narrative>

      <div className="my-4 flex items-center gap-2 max-w-[960px] mx-auto" role="group" aria-label="Chart view toggle">
        <span className="text-sm text-muted-foreground">View:</span>
        <button
          onClick={() => setTopicView('stacked')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${topicView === 'stacked' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          Stacked %
        </button>
        <span className="text-muted-foreground/30" aria-hidden="true">|</span>
        <button
          onClick={() => setTopicView('multiples')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${topicView === 'multiples' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          Small Multiples
        </button>
      </div>

      <ChartContainer
        id="fig-language-innovation-topic-prevalence"
        subtitle="Share of patents belonging to each of 25 NMF-derived topics by year, revealing the shift toward computing and digital technology themes."
        title="Computing and Semiconductor Topics Grew From 12% to 33% of All Patents Since 1976"
        caption="Share of patents belonging to each of 25 NMF-derived topics, 1976–2025, sorted by total patent count. The most prominent trend is the expansion of computing, semiconductor, and communications topics, which grew from 12% to 33% of the total."
        insight="The language of innovation has shifted decisively toward computing and digital technology over 50 years. Topics related to software, semiconductors, and wireless communications now dominate patent abstracts."
        loading={prevL || defL}
        height={topicView === 'multiples' ? 550 : 650}
        wide
        interactive
        statusText={topicView === 'multiples' ? 'Showing top 8 topics + Other as small multiples' : 'Showing all 25 topics as stacked percentage'}
      >
        {topicView === 'stacked' ? (
          <PWAreaChart
            data={prevalencePivot}
            xKey="year"
            areas={topicAreas}
            stackedPercent
            yLabel="Share (%)"
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008] })}
          />
        ) : (
          <PWSmallMultiples
            panels={topicPanels}
            xLabel="Year"
            yLabel="Share (%)"
            yFormatter={(v) => `${v.toFixed(0)}%`}
            columns={3}
            panelColors={topicPanelColors}
          />
        )}
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
      <SectionDivider label="Topic Map" />

      <Narrative>
        <p>
          To visualize the full semantic landscape of patents, a stratified sample of 5,000 patents is projected
          from high-dimensional TF-IDF space into two dimensions using UMAP. Each point represents a patent,
          colored by its dominant topic. Clusters indicate families of related inventions, and overlapping regions
          suggest technology convergence. Note that the axes of a UMAP projection are unitless — only the relative
          distances and clustering patterns are interpretable, not the absolute positions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-language-innovation-umap"
        subtitle="UMAP projection of 5,000 patent abstracts from TF-IDF space into 2D, colored by dominant topic, revealing semantic clustering and overlap."
        title="UMAP Projection of 5,000 Patents Reveals 25 Distinct Technology Clusters With Meaningful Spatial Relationships"
        caption="5,000 patents projected into 2D via UMAP on TF-IDF vectors (200 per topic, stratified). Each point represents one patent, colored by dominant topic. UMAP axes are unitless projections — only the relative distances between points are meaningful, not the absolute positions. Source: PatentsView / USPTO."
        insight="The UMAP projection reveals clear topic clusters with meaningful spatial relationships: computing and electronics topics cluster together, while chemistry and biotechnology form a distinct neighborhood. Patents bridging clusters often represent the most novel cross-domain inventions."
        loading={umapL || defL}
        height={650}
        wide
      >
        <div className="relative w-full h-full">
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
            hideAxes
            hideGrid
          />
          {/* Cluster centroid labels */}
          {umapCentroids.map(({ name, cx, cy }) => (
            <div
              key={name}
              className="absolute pointer-events-none text-[10px] font-medium text-muted-foreground/70 whitespace-nowrap"
              style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
            >
              {name}
            </div>
          ))}
        </div>
      </ChartContainer>

      <KeyInsight>
        <p>
          The semantic map indicates that the boundaries between technology domains are not sharp lines
          but rather diffuse gradients. Patents in the overlapping regions, where computing meets biology
          or where materials science meets electronics, often appear to represent the leading edge of
          interdisciplinary innovation.
        </p>
      </KeyInsight>

      {/* ── Section: Topics and Technology ────────────────────────────────── */}
      <SectionDivider label="Topics Across Technology Sections" />

      <Narrative>
        <p>
          The relationship between discovered topics and the formal CPC classification system warrants examination. The chart below
          cross-tabulates the eight most prevalent topics against CPC sections. Some topics align
          closely with a single CPC section (for example, chemistry-related topics correspond to Section C), while
          others, particularly computing, span multiple sections.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-language-innovation-topic-cpc"
        subtitle="Share of patents in each CPC section belonging to the top 8 NMF topics, cross-tabulating text-derived themes with formal classification."
        title="Computing-Related Topics Appear Across All 8 CPC Sections, Confirming Their General-Purpose Nature"
        caption="Share (%) of patents in each CPC section belonging to each of the top 8 topics, ordered A through H. The most notable pattern is that computing and data-processing topics appear across nearly all sections, suggesting that digital technology has become a general-purpose innovation platform."
        insight="Topics related to computing and data processing appear across nearly all CPC sections, consistent with the characterization of digital technology as a general-purpose innovation platform that pervades virtually every industry."
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
          The degree to which contemporary patents differ from those of earlier decades constitutes an important empirical question. This analysis measures novelty as the Shannon
          entropy of each patent&apos;s topic distribution: patents that draw approximately equally from many topics
          (high entropy) are more thematically diverse, and may be considered more novel, than patents concentrated
          in a single topic (low entropy).
        </p>
      </Narrative>

      <ChartContainer
        id="fig-language-innovation-novelty"
        subtitle="Median and average Shannon entropy of patent topic distributions by year, measuring thematic diversity as a proxy for novelty."
        title="Patent Novelty Rose 6.6% From 1976 to 2025 (Median Entropy 1.97 to 2.10), With an Upward Trend Since the Late 1980s Despite a Dip From 2004 to 2014"
        caption="Median and average Shannon entropy of patent topic distributions by year; higher entropy indicates more thematically diverse patents. The upward trend since the late 1980s suggests that modern inventions increasingly combine ideas from multiple technology domains, though a dip between 2004 and 2014 preceded acceleration in the late 2010s."
        insight="Patent novelty has trended upward since the late 1980s, though with a notable dip between 2004 and 2014, suggesting that modern inventions increasingly combine ideas from multiple technology domains. This trend accelerated in the late 2010s, coinciding with the rise of AI and other general-purpose technologies."
        loading={novTL}
      >
        <PWLineChart
          data={noveltyTrend ?? []}
          xKey="year"
          lines={[
            { key: 'median_entropy', name: 'Median Entropy', color: CHART_COLORS[0] },
            { key: 'avg_entropy', name: 'Average Entropy', color: CHART_COLORS[2], dashPattern: '8 4' },
          ]}
          yLabel="Shannon Entropy (bits)"
          yFormatter={(v) => v.toFixed(2)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2014] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Rising entropy suggests that the boundaries between technology domains are becoming
          more porous. The most novel patents, those scoring highest on entropy, tend to
          be situated at the intersection of multiple topics, combining language from computing -- including the <Link href="/chapters/ai-patents" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">artificial intelligence</Link> vocabulary that has become increasingly prevalent --
          biology, chemistry, and engineering in ways that were uncommon only a few decades ago.
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
        Having uncovered the latent thematic structure of patent language, the analysis turns next to the <Link href="/chapters/system-patent-law" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">legal and policy framework</Link> governing the patent system.
        The topics and trends identified in this chapter provide essential context for understanding how legislative and judicial decisions have shaped the direction and character of US patenting activity.
      </Narrative>

      <KeyInsight>
        <p>
          The semantic analysis in this chapter and the CPC-based convergence analysis in <Link href="/chapters/system-convergence" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Chapter 4</Link> measure interdisciplinarity through complementary lenses. CPC classifications capture formal taxonomy overlap, while topic modeling recovers latent thematic structure from the language inventors use. Both approaches confirm the same directional trend: technology domains are converging. The topic-based analysis adds nuance by revealing <em>which</em> specific themes are driving convergence and how the vocabulary of innovation itself has shifted toward computational and cross-domain language.
        </p>
      </KeyInsight>

      <InsightRecap
        learned={[
          "Topic modeling of 8.45 million abstracts reveals 25 distinct technology themes, with computing topics growing from 12% to 33% of all patents.",
          "Patents spanning multiple topics tend to be the most novel inventions, as measured by Shannon entropy of topic distributions.",
        ]}
        falsifiable="If cross-topic patents are genuinely more novel rather than just broader in scope, they should accumulate more forward citations even after controlling for the number of CPC sections spanned."
        nextAnalysis={{
          label: "Patent Law & Policy",
          description: "How legislation and Supreme Court decisions have shaped the patent landscape",
          href: "/chapters/system-patent-law",
        }}
      />

      <DataNote>
        <p>
          This analysis uses <GlossaryTooltip term="TF-IDF">TF-IDF</GlossaryTooltip> vectorization (10,000 features,
          unigrams + bigrams) and <GlossaryTooltip term="NMF">NMF</GlossaryTooltip> with K=25 components on {formatCompact(totalPatents)} patent
          abstracts from 1976–2025. The number of topics (K=25) was selected based on
          interpretability of the resulting topic clusters rather than a formal model selection
          criterion such as coherence or perplexity. The <GlossaryTooltip term="UMAP">UMAP</GlossaryTooltip> projection uses a
          stratified sample of 5,000 patents (200 per topic) with cosine distance. Novelty is measured as Shannon
          entropy of the NMF topic weight vector. Topic names are auto-generated from the top-weighted terms and may
          not perfectly capture all nuances of each topic cluster. Source: PatentsView / USPTO.
        </p>
      </DataNote>

      <RelatedChapters currentChapter={5} />
      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
