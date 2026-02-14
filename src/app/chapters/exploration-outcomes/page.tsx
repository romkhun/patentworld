'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBubbleScatter } from '@/components/charts/PWBubbleScatter';
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import Link from 'next/link';
import { CHART_COLORS } from '@/lib/colors';
import type {
  FirmExplorationScatter, FirmLifecyclePoint,
  FirmAmbidexterityRecord, FirmGiniYear,
} from '@/lib/types';

export default function ExplorationOutcomes() {
  const { data: explScatter, loading: esL } = useChapterData<FirmExplorationScatter[]>('company/firm_exploration_scatter.json');
  const { data: lifecycleData, loading: lcL } = useChapterData<{ firms: Record<string, FirmLifecyclePoint[]>; system_average: FirmLifecyclePoint[] }>('company/firm_exploration_lifecycle.json');
  const { data: ambidexterity, loading: amL } = useChapterData<FirmAmbidexterityRecord[]>('company/firm_ambidexterity_quality.json');
  const { data: firmGini, loading: fgL } = useChapterData<Record<string, FirmGiniYear[]>>('company/firm_quality_gini.json');

  const explScatterData = useMemo(() => {
    if (!explScatter) return [];
    return explScatter.map(d => ({
      company: d.company,
      x: d.exploration_share,
      y: d.quality_premium,
      size: d.patent_count,
      section: d.primary_section,
    }));
  }, [explScatter]);

  const lifecyclePanels = useMemo(() => {
    if (!lifecycleData?.firms) return [];
    return Object.entries(lifecycleData.firms).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.relative_year, y: d.mean_exploration, ref: d.system_mean })),
    }));
  }, [lifecycleData]);

  const ambidexterityScatterData = useMemo(() => {
    if (!ambidexterity) return [];
    return ambidexterity.map(d => ({
      company: d.company,
      x: d.ambidexterity_index,
      y: d.blockbuster_rate,
      size: d.patent_count,
      section: 'G',
      window: d.window,
    }));
  }, [ambidexterity]);

  // Within-firm quality Gini
  const giniPanels = useMemo(() => {
    if (!firmGini) return [];
    return Object.entries(firmGini).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.gini })),
    }));
  }, [firmGini]);

  return (
    <div>
      <ChapterHeader
        number={16}
        title="Exploration Outcomes"
        subtitle="Exploration quality premiums, score decay, and ambidexterity effects"
      />

      <KeyFindings>
        <li>Only 4 of 49 top filers show a positive exploration quality premium in the 2010-2019 decade, suggesting that exploration does not reliably produce higher-impact patents for most firms.</li>
        <li>Balanced firms (those maintaining a mix of exploration and exploitation) average a 2.51% blockbuster rate, 2.3 times higher than specialized firms, indicating that ambidexterity correlates with high-impact invention.</li>
        <li>New-subclass exploration scores decay from 1.0 to 0.087 within 5 years of entry, showing that firms transition rapidly from search to exploitation in newly entered technology areas.</li>
        <li>Within-firm citation Gini coefficients rose from 0.5 to above 0.8 for most large filers, signaling growing reliance on a small number of blockbuster patents for citation impact.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Only 4 of 49 top filers earn a positive exploration quality premium, yet balanced firms that maintain ambidexterity average a 2.51% blockbuster rate -- 2.3 times the rate of specialized firms. Within-firm citation Gini coefficients rose from 0.5 to above 0.8 for most large filers, revealing that innovation impact is increasingly concentrated in a small fraction of each portfolio.
        </p>
      </aside>

      <Narrative>
        <p>
          The previous chapter established that most large patent filers are overwhelmingly exploitative, with exploration shares typically below 5%. This chapter asks the critical follow-up question: does exploration actually produce higher-quality patents? By plotting exploration share against the quality premium -- the difference in median forward citations between exploratory and exploitative patents -- the analysis reveals whether firms that venture into new domains are rewarded with higher-impact inventions.
        </p>
        <p>
          Beyond the exploration quality premium, this chapter examines exploration score decay (how quickly firms transition from search to exploitation in newly entered technology areas), the relationship between ambidexterity and blockbuster patent production, and the concentration of citation impact within firm portfolios as measured by Gini coefficients.
        </p>
      </Narrative>

      {/* ── Exploration Quality Premium ── */}

      <SectionDivider label="Exploration Quality Premium" />

      <Narrative>
        <p>
          The central analytical question is whether exploration produces higher-quality patents.
          For each firm in the most recent complete decade, the scatter below plots exploration
          share against the exploration quality premium — the difference in median 5-year forward
          citations between exploratory and exploitative patents. Firms in the upper-right quadrant
          are &ldquo;rewarded explorers&rdquo; whose forays into new domains yield higher-impact inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-exploration-outcomes-exploration-quality"
        subtitle="Exploration share vs. quality premium (median citation difference) for top-50 assignees, with bubble size proportional to patent count."
        title="Only 4 of 49 Top Filers Show a Positive Exploration Quality Premium (2010–2019)"
        caption="Each bubble represents one top-50 assignee. X-axis: share of patents classified as exploratory. Y-axis: exploration quality premium (median citations of exploratory patents minus median citations of exploitative patents). Bubble size: total patents. Color: primary CPC section. Only firms with ≥20 exploratory and ≥20 exploitative patents shown."
        loading={esL}
        height={450}
        wide
      >
        <PWBubbleScatter
          data={explScatterData}
          xLabel="Exploration Share (%)"
          yLabel="Quality Premium (citations)"
          xFormatter={(v) => `${v.toFixed(1)}%`}
          yFormatter={(v) => v.toFixed(1)}
          xMidline={3}
          yMidline={0}
        />
      </ChartContainer>

      {/* ── Exploration Score Decay ── */}

      <SectionDivider label="Exploration Score Decay" />

      <Narrative>
        <p>
          When a firm enters a new technology area, does its exploration score in that area
          decline over time as it transitions from search to exploitation? The decay curves below
          track the mean exploration score by years since entry, averaged across all technology
          subclasses in which each firm holds at least 20 patents.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-exploration-outcomes-exploration-decay"
        subtitle="Average exploration score by years since entry into a new CPC subclass, shown as small multiples with system-wide average as reference."
        title="New-Subclass Exploration Scores Decay from 1.0 to 0.087 Within 5 Years of Entry"
        caption="Each panel shows one firm's average exploration score by years since entry into a new CPC subclass. Dashed gray = system-wide average. The typical firm's exploration score falls sharply within 5 years, but the rate of decay varies considerably across organizations."
        insight="On average, a firm's exploration score in a newly entered technology subclass declines from 1.0 at entry to below 0.1 within 5 years. Some firms maintain higher exploration scores for longer periods, suggesting a more sustained period of search and experimentation."
        loading={lcL}
        height={550}
        flexHeight
        wide
      >
        <PWSmallMultiples
          panels={lifecyclePanels}
          xLabel="Years Since Entry"
          yLabel="Score"
          yFormatter={(v) => v.toFixed(2)}
          columns={5}
          color={CHART_COLORS[4]}
        />
      </ChartContainer>

      {/* ── Ambidexterity and Blockbusters ── */}

      <SectionDivider label="Ambidexterity and Blockbusters" />

      <Narrative>
        <p>
          Do firms that maintain a balance between exploration and exploitation produce
          higher-quality patent portfolios? The ambidexterity index (1 minus the absolute
          difference between exploration and exploitation shares) ranges from 0 (pure explorer or
          exploiter) to 1 (perfect 50/50 balance). The scatter below plots this index against
          the firm&apos;s blockbuster rate for each 5-year window since 1980.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-exploration-outcomes-ambidexterity"
        subtitle="Ambidexterity index vs. blockbuster rate for top-50 assignees across 5-year windows, measuring whether balanced firms produce more high-impact patents."
        title="Balanced Firms Average a 2.51% Blockbuster Rate, 2.3x Higher Than Specialized Firms"
        caption="Each dot represents one firm in one 5-year window (top 50 assignees, 1980–2019). X-axis: ambidexterity index. Y-axis: blockbuster rate (% of patents in top 1% of year × CPC cohort). Only firm-periods with ≥50 patents shown."
        loading={amL}
        height={400}
        wide
      >
        {ambidexterityScatterData.length > 0 ? (
          <PWBubbleScatter
            data={ambidexterityScatterData}
            xLabel="Ambidexterity Index"
            yLabel="Blockbuster Rate (%)"
            xFormatter={(v) => v.toFixed(2)}
            yFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The exploration/exploitation analysis reveals that most large patent filers are overwhelmingly
          exploitative, with exploration shares typically below 5%. This is consistent with the theoretical
          prediction that large, established organizations tend to favor exploitation of existing
          competencies over exploration of new domains. The exploration decay curves show that even when
          firms do enter new technology areas, they transition to exploitation rapidly — typically within
          5 years of entry.
        </p>
      </KeyInsight>

      {/* ── Quality Concentration: Gini ── */}

      <SectionDivider label="Within-Firm Quality Concentration" />

      <Narrative>
        <p>
          The Gini coefficient, applied to forward citations within each firm&apos;s annual patent
          cohort, measures how concentrated a firm&apos;s citation impact is across its portfolio.
          A Gini near 1.0 indicates that virtually all citation impact is concentrated in a
          handful of patents; near 0.0 indicates impact is evenly distributed. A rising Gini
          signals increasing dependence on a small number of high-impact inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-exploration-outcomes-firm-gini"
        subtitle="Gini coefficient of forward citations within each firm's annual patent cohort, measuring how concentrated citation impact is across the portfolio."
        title="Within-Firm Citation Gini Coefficients Rose from 0.5 to Above 0.8 for Most Large Filers, Signaling Growing Reliance on Blockbuster Patents"
        caption="Each panel shows one firm's citation Gini coefficient by year (top 20 firms by recent Gini). Higher values indicate more concentrated citation impact within the firm's patent portfolio."
        insight="Most large patent filers exhibit Gini coefficients between 0.6 and 0.9, indicating that a small fraction of each firm's patents accounts for the majority of citation impact. Several firms show rising Gini trajectories, consistent with increasing reliance on blockbuster inventions."
        loading={fgL}
        height={900}
        flexHeight
        wide
      >
        <PWSmallMultiples
          panels={giniPanels}
          xLabel="Year"
          yLabel="Gini"
          yFormatter={(v) => v.toFixed(2)}
          columns={4}
          color={CHART_COLORS[4]}
        />
      </ChartContainer>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The patterns documented across this chapter and the preceding exploration analysis paint a nuanced picture of corporate innovation strategy. While most firms are overwhelmingly exploitative, the minority that maintain a balance between exploration and exploitation produce blockbuster patents at more than twice the rate of specialized firms. Yet within-firm citation Gini coefficients continue to rise, suggesting that even balanced portfolios are increasingly reliant on a small fraction of high-impact inventions. These firm-level patterns connect to the broader dynamics examined in <Link href="/chapters/inventor-demographics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Inventors</Link>, which turns from organizational strategies to the individual inventors who ultimately produce the patents.
        </p>
      </Narrative>

      <DataNote>
        Exploration scores combine technology newness, citation newness, and external knowledge
        sourcing on a 0-1 scale; patents scoring above 0.6 are classified as exploratory, below
        0.4 as exploitative. The exploration quality premium measures the difference in median
        5-year forward citations between exploratory and exploitative patents for each firm.
        Exploration decay tracks mean exploration scores by years since entry into a new CPC
        subclass. The ambidexterity index equals 1 minus the absolute difference between
        exploration and exploitation shares; it ranges from 0 (pure specialist) to 1 (perfect
        balance). Blockbuster rate measures the share of patents in the top 1% of their year
        by CPC section cohort. Within-firm quality Gini applies the Gini coefficient to 5-year
        forward citations within each firm&apos;s annual patent cohort. Assignee data employ
        disambiguated identities from PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={16} />
      <ChapterNavigation currentChapter={16} />
    </div>
  );
}
