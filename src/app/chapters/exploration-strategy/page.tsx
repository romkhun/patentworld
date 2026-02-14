'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import Link from 'next/link';
import { CHART_COLORS } from '@/lib/colors';
import type {
  FirmExplorationYear, FirmExplorationTrajectory,
} from '@/lib/types';

export default function ExplorationStrategy() {
  const { data: firmExploration, loading: feL } = useChapterData<Record<string, FirmExplorationYear[]>>('company/firm_exploration_scores.json');
  const { data: explTrajectories, loading: etL } = useChapterData<Record<string, FirmExplorationTrajectory[]>>('company/firm_exploration_trajectories.json');

  const [selectedExplFirm, setSelectedExplFirm] = useState<string>('IBM');

  const explCompanies = useMemo(() => firmExploration ? Object.keys(firmExploration).sort() : [], [firmExploration]);
  const selectedExplData = useMemo(() => firmExploration?.[selectedExplFirm] ?? [], [firmExploration, selectedExplFirm]);

  const explTrajPanels = useMemo(() => {
    if (!explTrajectories) return [];
    return Object.entries(explTrajectories).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.exploration_share })),
    }));
  }, [explTrajectories]);

  return (
    <div>
      <ChapterHeader
        number={15}
        title="Exploration & Exploitation"
        subtitle="Technological exploration scores and exploitation strategies of top filers"
      />

      <KeyFindings>
        <li>11 of 20 major filers keep exploration below 5%, with a median exploration share of 2.9%, indicating that the vast majority of patenting activity deepens established technology domains.</li>
        <li>The composite exploration score decomposes into three indicators -- technology newness, citation newness, and external knowledge sourcing -- revealing which dimension of exploration drives changes over time.</li>
        <li>Most large patent filers are overwhelmingly exploitative, consistent with the theoretical prediction that established organizations favor deepening existing competencies over entering new domains.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Applying March&apos;s (1991) exploration/exploitation framework to patent data reveals that 11 of 20 major filers keep exploration below 5%, with a median share of just 2.9%. The composite exploration score -- averaging technology newness, citation newness, and external knowledge sourcing on a 0-1 scale -- shows that most large firms are overwhelmingly exploitative, deepening established domains rather than entering new ones.
        </p>
      </aside>

      <Narrative>
        <p>
          The exploration/exploitation framework (March, 1991) provides a powerful lens for examining whether firms are entering new technology domains or deepening established ones. This chapter scores every patent from a top-50 assignee on three indicators: technology newness (whether the firm has prior presence in the patent&apos;s CPC subclass), citation newness (whether backward citations point to unfamiliar technology areas), and external knowledge sourcing (the inverse of self-citation rate). The composite exploration score averages these three indicators on a 0-1 scale.
        </p>
        <p>
          Building on the inter-firm knowledge flows documented in <Link href="/chapters/knowledge-flows" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Knowledge Flows</Link>, this analysis shifts from the relationships between firms to the strategic choices within firms. The interactive charts below allow examination of exploration scores and exploitation shares for individual companies, while the small multiples panel reveals systematic patterns across the 20 largest filers.
        </p>
      </Narrative>

      {/* ── Exploration and Exploitation ── */}

      <SectionDivider label="Exploration and Exploitation" />

      <Narrative>
        <p>
          The exploration/exploitation framework (March, 1991) provides a lens for examining
          whether firms are entering new technology domains (exploration) or deepening established
          ones (exploitation). Each patent from a top-50 assignee is scored on three indicators:
          technology newness (whether the firm has prior presence in the patent&apos;s CPC subclass),
          citation newness (whether backward citations point to unfamiliar technology areas),
          and external knowledge sourcing (the inverse of self-citation rate). The composite
          exploration score averages these three indicators on a 0–1 scale.
        </p>
      </Narrative>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a company:</div>
        <PWCompanySelector
          companies={explCompanies}
          selected={selectedExplFirm}
          onSelect={setSelectedExplFirm}
        />
      </div>

      <ChartContainer
        id="fig-exploration-strategy-exploration-score"
        subtitle="Composite exploration score and its three components (technology newness, citation newness, external sourcing) for the selected firm by year."
        title={`${selectedExplFirm}'s Exploration Score Averages ${selectedExplData.length > 0 ? (selectedExplData.reduce((s, d) => s + d.mean_exploration, 0) / selectedExplData.length).toFixed(2) : '—'} Across ${selectedExplData.length} Years of Patenting`}
        caption={`Mean exploration score and its three component indicators for ${selectedExplFirm} by year. The composite score (blue) averages technology newness, citation newness, and external knowledge sourcing (1 - self-citation rate). Higher values indicate more exploratory behavior.`}
        insight="Decomposing the composite score into its three indicators reveals which dimension of exploration is driving changes over time — whether the firm is entering new technology areas, citing unfamiliar prior art, or drawing on external knowledge."
        loading={feL}
        height={350}
        wide
      >
        {selectedExplData.length > 0 ? (
          <PWLineChart
            data={selectedExplData}
            xKey="year"
            lines={[
              { key: 'mean_exploration', name: 'Composite Score', color: CHART_COLORS[0] },
              { key: 'mean_tech_newness', name: 'Technology Newness', color: CHART_COLORS[1] },
              { key: 'mean_citation_newness', name: 'Citation Newness', color: CHART_COLORS[2] },
              { key: 'mean_external_score', name: 'External Sourcing', color: CHART_COLORS[5] },
            ]}
            yLabel="Score (0–1)"
            yFormatter={(v) => v.toFixed(2)}
          />
        ) : <div />}
      </ChartContainer>

      <ChartContainer
        id="fig-exploration-strategy-exploration-share"
        subtitle="Share of the selected firm's annual patents classified as exploratory, ambidextrous, or exploitative, shown as a 100% stacked area."
        title={`${selectedExplFirm} Devotes ${selectedExplData.length > 0 ? (selectedExplData[selectedExplData.length - 1].exploitation_share * 100).toFixed(0) : '—'}% of Recent Patents to Exploitation Over Exploration`}
        caption={`Share of ${selectedExplFirm}'s annual patents classified as exploratory (score > 0.6), exploitative (score < 0.4), or ambidextrous (0.4–0.6). Dashed gray = system-wide mean exploration score.`}
        loading={feL}
        height={300}
        wide
      >
        {selectedExplData.length > 0 ? (
          <PWAreaChart
            data={selectedExplData.map(d => ({
              year: d.year,
              Exploratory: +(d.exploration_share * 100).toFixed(1),
              Ambidextrous: +(d.ambidexterity_share * 100).toFixed(1),
              Exploitative: +(d.exploitation_share * 100).toFixed(1),
            }))}
            xKey="year"
            areas={[
              { key: 'Exploratory', name: 'Exploratory (>0.6)', color: CHART_COLORS[0] },
              { key: 'Ambidextrous', name: 'Ambidextrous (0.4–0.6)', color: CHART_COLORS[2] },
              { key: 'Exploitative', name: 'Exploitative (<0.4)', color: CHART_COLORS[3] },
            ]}
            stackedPercent
            yLabel="Share (%)"
          />
        ) : <div />}
      </ChartContainer>

      {/* ── Cross-Firm Exploration Trajectories ── */}

      <SectionDivider label="Cross-Firm Exploration Trajectories" />

      <ChartContainer
        id="fig-exploration-strategy-exploration-trajectories"
        subtitle="Exploration share (% of exploratory patents) over time for 20 major filers, displayed as small multiples sorted by most recent share."
        title="11 of 20 Major Filers Keep Exploration Below 5%, with a Median Share of 2.9%"
        caption="Each panel shows one firm's exploration share (% of patents classified as exploratory) over time. Firms are sorted by most recent exploration share, descending. Exploration is defined as a composite score above 0.6 based on technology newness, citation newness, and external knowledge sourcing."
        insight="Most large patent filers maintain exploration shares below 5%, indicating that the vast majority of their patenting activity deepens established technology domains rather than entering new ones."
        loading={etL}
        height={900}
        flexHeight
        wide
      >
        <PWSmallMultiples
          panels={explTrajPanels}
          xLabel="Year"
          yLabel="Exploration %"
          yFormatter={(v) => `${v.toFixed(0)}%`}
          columns={4}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The exploration/exploitation analysis reveals that most large patent filers are overwhelmingly
          exploitative, with exploration shares typically below 5%. This is consistent with the theoretical
          prediction that large, established organizations tend to favor exploitation of existing
          competencies over exploration of new domains. The question of whether this exploitation-heavy
          strategy produces better or worse innovation outcomes is examined in the next chapter.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The strong exploitation bias documented here raises a critical question: does exploration produce higher-quality patents, or are firms rational to concentrate on established domains? The <Link href="/chapters/exploration-outcomes" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> examines the exploration quality premium, exploration score decay curves, and the relationship between ambidexterity and blockbuster patent production.
        </p>
      </Narrative>

      <DataNote>
        Exploration scores combine technology newness, citation newness, and external knowledge
        sourcing on a 0-1 scale; patents scoring above 0.6 are classified as exploratory, below
        0.4 as exploitative. The composite score averages the three indicators. Exploration
        trajectories track the share of exploratory patents per year for the 20 largest filers.
        Assignee data employ disambiguated identities from PatentsView. The primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
      </DataNote>

      <RelatedChapters currentChapter={15} />
      <ChapterNavigation currentChapter={15} />
    </div>
  );
}
