'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWSmallMultiples } from '@/components/charts/PWSmallMultiples';
import { PWBubbleScatter } from '@/components/charts/PWBubbleScatter';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { PWTrajectoryScatter } from '@/components/charts/PWTrajectoryScatter';
import dynamic from 'next/dynamic';
const PWNetworkGraph = dynamic(() => import('@/components/charts/PWNetworkGraph').then(m => ({ default: m.PWNetworkGraph })), { ssr: false, loading: () => <div /> });
const PWChordDiagram = dynamic(() => import('@/components/charts/PWChordDiagram').then(m => ({ default: m.PWChordDiagram })), { ssr: false, loading: () => <div /> });
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import Link from 'next/link';
import { CHART_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { cleanOrgName } from '@/lib/orgNames';
import { formatCompact } from '@/lib/formatters';
import type {
  FirmExplorationYear, FirmExplorationTrajectory,
  FirmLifecyclePoint,
  FirmAmbidexterityRecord, FirmGiniYear,
  NetworkData,
  CorporateCitationFlow, TechLeadership,
  ExplorationTrajectoryPoint,
} from '@/lib/types';

export default function MechOrganizationsChapter() {
  /* ── Section A data hooks ── */
  const { data: firmExploration, loading: feL } = useChapterData<Record<string, FirmExplorationYear[]>>('company/firm_exploration_scores.json');
  const { data: explTrajectories, loading: etL } = useChapterData<Record<string, FirmExplorationTrajectory[]>>('company/firm_exploration_trajectories.json');
  const { data: lifecycleData, loading: lcL } = useChapterData<{ firms: Record<string, FirmLifecyclePoint[]>; system_average: FirmLifecyclePoint[] }>('company/firm_exploration_lifecycle.json');
  const { data: ambidexterity, loading: amL } = useChapterData<FirmAmbidexterityRecord[]>('company/firm_ambidexterity_quality.json');
  const { data: firmGini, loading: fgL } = useChapterData<Record<string, FirmGiniYear[]>>('company/firm_quality_gini.json');

  /* ── Analysis 3: Exploration trajectory ── */
  const { data: explTraj, loading: etL3 } = useChapterData<Record<string, ExplorationTrajectoryPoint[]>>('chapter5/exploration_exploitation_trajectory.json');

  /* ── Section B data hooks ── */
  const { data: firmNetwork, loading: fnL } = useChapterData<NetworkData>('chapter3/firm_collaboration_network.json');
  const { data: citationFlows, loading: cfL } = useChapterData<CorporateCitationFlow[]>('company/corporate_citation_network.json');
  const { data: techLeadership } = useChapterData<TechLeadership[]>('company/tech_leadership.json');

  /* ── State ── */
  const [selectedExplFirm, setSelectedExplFirm] = useState<string>('IBM');
  const [selectedDecade, setSelectedDecade] = useState<string | number | null>(null);

  /* ── Section A computations ── */
  const explCompanies = useMemo(() => firmExploration ? Object.keys(firmExploration).sort() : [], [firmExploration]);
  const selectedExplData = useMemo(() => firmExploration?.[selectedExplFirm] ?? [], [firmExploration, selectedExplFirm]);

  const explTrajPanels = useMemo(() => {
    if (!explTrajectories) return [];
    return Object.entries(explTrajectories).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.exploration_share })),
    }));
  }, [explTrajectories]);

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

  const giniPanels = useMemo(() => {
    if (!firmGini) return [];
    return Object.entries(firmGini).map(([name, data]) => ({
      name,
      data: data.map(d => ({ x: d.year, y: d.gini })),
    }));
  }, [firmGini]);

  /* ── Analysis 3: Exploration trajectory datasets ── */
  const trajectoryDatasets = useMemo(() => {
    if (!explTraj) return [];
    return Object.entries(explTraj).map(([firm, points], i) => ({
      name: firm,
      points: points
        .filter(p => p.exploration_index != null)
        .map(p => ({
          x: p.exploration_index as number,
          y: p.self_citation_rate as number,
          label: firm,
          period: p.period,
        })),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [explTraj]);

  /* ── Section B computations ── */
  const decades = useMemo(() => {
    if (!citationFlows) return [];
    return [...new Set(citationFlows.map(f => f.decade))].sort();
  }, [citationFlows]);

  const effectiveDecade = selectedDecade ?? (decades.length > 0 ? decades[decades.length - 1] : null);

  const chordData = useMemo(() => {
    if (!citationFlows || effectiveDecade == null) return null;
    const decadeFlows = citationFlows.filter(f => String(f.decade) === String(effectiveDecade));
    if (decadeFlows.length === 0) return null;
    const companies = [...new Set([...decadeFlows.map(f => f.source), ...decadeFlows.map(f => f.target)])];
    const idxMap: Record<string, number> = {};
    companies.forEach((c, i) => { idxMap[c] = i; });
    const matrix = companies.map(() => companies.map(() => 0));
    decadeFlows.forEach(f => {
      const si = idxMap[f.source];
      const ti = idxMap[f.target];
      if (si !== undefined && ti !== undefined) matrix[si][ti] = f.citation_count;
    });
    const nodes = companies.map((c, i) => ({ name: c, color: BUMP_COLORS[i % BUMP_COLORS.length] }));
    return { nodes, matrix };
  }, [citationFlows, effectiveDecade]);

  return (
    <div>
      <ChapterHeader
        number={20}
        title="Organizational Mechanics"
        subtitle="Within-firm exploration, exploitation, and inter-firm knowledge flows"
      />
      <MeasurementSidebar slug="mech-organizations" />

      <KeyFindings>
        <li>11 of 20 major filers keep exploration below 5%, with a median exploration share of 2.9%, indicating that the vast majority of patenting activity deepens established technology domains.</li>
        <li>New-subclass exploration scores decay from 1.0 to 0.087 within 5 years of entry, showing that firms transition rapidly from search to exploitation in newly entered technology areas.</li>
        <li>Balanced firms (those maintaining a mix of exploration and exploitation) average a 2.51% blockbuster rate, 2.3 times higher than specialized firms, indicating that ambidexterity correlates with high-impact invention.</li>
        <li>Within-firm citation Gini coefficients rose from 0.5 to above 0.8 for most large filers, signaling growing reliance on a small number of blockbuster patents for citation impact.</li>
        <li>618 organizations form distinct industry clusters in the co-patenting network, with electronics, pharmaceutical, and automotive firms each constituting dense communities.</li>
        <li>Corporate citation flows among the top 30 filers reveal asymmetric knowledge dependencies, with certain firms functioning as knowledge producers and others as integrators.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Most large patent filers are overwhelmingly exploitative, with 11 of 20 keeping exploration below 5%. When firms do enter new domains, exploration scores decay from 1.0 to below 0.1 within 5 years -- yet balanced firms that maintain ambidexterity produce blockbuster patents at 2.3 times the rate of specialized firms. Inter-firm knowledge flows, mapped through co-patenting networks and directed citation flows among the top 30 filers, reveal asymmetric dependencies that shift by decade and cluster by industry.
        </p>
      </aside>

      <Narrative>
        <p>
          This chapter examines two complementary dimensions of organizational innovation mechanics. The first half applies March&apos;s (1991) exploration/exploitation framework to patent data, revealing how firms balance the search for new technology domains against the deepening of established ones -- and how this balance shapes innovation outcomes including blockbuster patent production and quality concentration. The second half maps the inter-firm knowledge flows that connect organizations through co-patenting relationships and directed citation networks, exposing the structural dependencies that shape the corporate innovation landscape.
        </p>
      </Narrative>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION A: Within-Firm Exploration and Exploitation
          ══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="A — Within-Firm Exploration and Exploitation" />

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
          exploration score averages these three indicators on a 0-1 scale.
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
        id="fig-mech-org-exploration-score"
        subtitle="Composite exploration score and its three components (technology newness, citation newness, external sourcing) for the selected firm by year."
        title={`${selectedExplFirm}'s Exploration Score Averages ${selectedExplData.length > 0 ? (selectedExplData.reduce((s, d) => s + d.mean_exploration, 0) / selectedExplData.length).toFixed(2) : '—'} Across ${selectedExplData.length > 0 ? selectedExplData.length : '...'} Years of Patenting`}
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
        id="fig-mech-org-exploration-share"
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

      <ChartContainer
        id="fig-mech-org-exploration-trajectories"
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
          competencies over exploration of new domains.
        </p>
      </KeyInsight>

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
        id="fig-mech-org-exploration-decay"
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
        id="fig-mech-org-ambidexterity"
        subtitle="Ambidexterity index vs. blockbuster rate for top-50 assignees across 5-year windows, measuring whether balanced firms produce more high-impact patents."
        title="Balanced Firms Average a 2.51% Blockbuster Rate, 2.3x Higher Than Specialized Firms"
        caption="Each dot represents one firm in one 5-year window (top 50 assignees, 1980-2019). X-axis: ambidexterity index. Y-axis: blockbuster rate (% of patents in top 1% of year x CPC cohort). Only firm-periods with >=50 patents shown."
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
          exploitative, with exploration shares typically below 5%. The exploration decay curves show that even when
          firms do enter new technology areas, they transition to exploitation rapidly -- typically within
          5 years of entry. Yet balanced firms that maintain ambidexterity produce blockbuster patents at more than twice the rate of specialized firms.
        </p>
      </KeyInsight>

      {/* ── Within-Firm Quality Concentration ── */}

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
        id="fig-mech-org-firm-gini"
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

      {/* ══════════════════════════════════════════════════════════════════
          SECTION B: Inter-Firm Knowledge Flow
          ══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="B — Inter-Firm Knowledge Flow" />

      {/* ── Organizational Co-Patenting ── */}

      <SectionDivider label="Organizational Co-Patenting" />

      <Narrative>
        <p>
          When two or more organizations appear as assignees on the same patent, this indicates a
          substantive collaborative relationship -- joint research ventures, licensing agreements,
          or cross-firm R&D partnerships. The network below maps these{' '}
          <StatCallout value="co-patenting relationships" /> among organizations with significant
          collaboration ties.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-mech-org-firm-network"
        subtitle="Co-patenting network among organizations, with node size representing patent count and edge width indicating shared patents."
        title="618 Organizations Form Distinct Industry Clusters in the Co-Patenting Network"
        caption="Co-patenting network among organizations with significant collaboration ties. Node size represents total patent count; edge width indicates the number of shared patents. The network exhibits dense intra-industry clustering with sparse inter-industry connections."
        insight="The prevalence of co-patenting is consistent with the growing complexity of innovation and increasing inter-firm collaboration in technology development."
        loading={fnL}
        height={900}
        wide
      >
        {firmNetwork?.nodes && firmNetwork?.edges ? (
          <PWNetworkGraph
            nodes={firmNetwork.nodes.map((n: any) => ({ ...n, name: cleanOrgName(n.name) }))}
            edges={firmNetwork.edges}
            nodeColor={CHART_COLORS[0]}
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The co-patenting network exhibits distinct industry clusters. Electronics firms (Samsung,
          LG, Sony) form a dense cluster, pharmaceutical companies (Pfizer, Novartis) cluster
          separately, and automotive firms (Toyota, Honda, Ford) constitute their own community. Bridge
          organizations that span multiple clusters -- often large conglomerates such as GE or Siemens
          -- appear to serve disproportionate roles in cross-industry knowledge transfer.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The network exhibits a clear core-periphery structure. A dense core of highly
          connected major patent holders occupies the center, while specialized firms and
          research institutions are positioned at the periphery with fewer but often strategically
          important connections. This structure reflects the hierarchical nature of
          industrial R&D, in which large firms anchor collaborative ecosystems.
        </p>
      </Narrative>

      {/* ── Citation Networks ── */}

      <SectionDivider label="Citation Networks" />

      <Narrative>
        <p>
          The pattern of inter-firm patent citations reveals structural knowledge dependencies. The{' '}
          <GlossaryTooltip term="chord diagram">chord diagram</GlossaryTooltip> below maps directed
          citation flows among the most prolific patent-filing organizations. Wider ribbons indicate a greater volume of
          citations flowing from one firm to another, illustrating{' '}
          <StatCallout value="knowledge dependencies" /> across the corporate landscape.
        </p>
      </Narrative>

      <div className="my-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Decade:</span>
        <div className="flex gap-1.5 flex-wrap">
          {decades.map(d => (
            <button
              key={String(d)}
              onClick={() => setSelectedDecade(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${String(effectiveDecade) === String(d) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {String(d)}s
            </button>
          ))}
        </div>
      </div>

      <ChartContainer
        id="fig-mech-org-corporate-citation-flows"
        subtitle="Directed citation flows among the top 30 patent filers shown as a chord diagram, with ribbon width proportional to citation volume."
        title={`Corporate Citation Flows Among Top 30 Filers Reveal Asymmetric Knowledge Dependencies${effectiveDecade != null ? ` (${effectiveDecade}s)` : ''}`}
        caption="Directed citation flows between the most prolific patent filers. Arc size represents total citations; ribbon width indicates flow volume. Certain firms function primarily as knowledge producers (heavily cited yet citing few peers), whereas others serve as integrators (drawing broadly from multiple sources)."
        insight="Citation flows reveal asymmetric knowledge dependencies. Certain firms function primarily as knowledge producers (heavily cited yet citing few peers), whereas others operate as integrators (drawing broadly from multiple sources)."
        loading={cfL}
        height={700}
        wide
      >
        {chordData ? (
          <PWChordDiagram
            nodes={chordData.nodes}
            matrix={chordData.matrix}
          />
        ) : <div />}
      </ChartContainer>

      <Narrative>
        <p>
          Within each technology area, a small number of firms consistently receive the most citations
          from peers. These constitute the <StatCallout value="technology leaders" /> whose patents
          form the foundation for subsequent innovation.
        </p>
      </Narrative>

      {techLeadership && (
        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Window</th>
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 font-medium">Rank</th>
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 text-right font-medium">Citations Received</th>
              </tr>
            </thead>
            <tbody>
              {techLeadership.filter(t => t.rank <= 3).slice(0, 50).map((t, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-xs">{t.window}</td>
                  <td className="py-2 pr-4">{t.section}: {CPC_SECTION_NAMES[t.section] ?? t.section}</td>
                  <td className="py-2 pr-4 font-mono">#{t.rank}</td>
                  <td className="py-2 pr-4 font-medium">{t.company}</td>
                  <td className="py-2 text-right font-mono text-xs">{formatCompact(t.citations_received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          Analysis 3: Exploration–Exploitation Trajectories
          ══════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Exploration–Exploitation Trajectories" />

      <Narrative>
        <p>
          The preceding analyses characterize exploration and exploitation as static shares or decay
          curves, but firms&apos; strategies evolve dynamically over time. By plotting each firm&apos;s
          exploration index (cosine distance from its prior CPC centroid) against its self-citation
          rate across successive 5-year windows, the trajectory scatter reveals how organizations
          navigate the exploration-exploitation trade-off over decades. Some firms trace stable
          orbits -- consistently exploitative or consistently exploratory -- while others undergo
          dramatic strategic pivots, shifting from deep exploitation to broad exploration or vice
          versa. These trajectories illuminate the path-dependent nature of corporate innovation
          strategy, where each period&apos;s positioning constrains the feasible moves in the next.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-mech-org-exploration-trajectory"
        subtitle="Each firm's exploration index plotted against self-citation rate across 5-year windows, with arrows tracing strategic evolution over time."
        title="Top Firms Trace Distinctive Exploration–Exploitation Paths Over Time"
        caption="Each point represents one firm in one 5-year window. The x-axis measures the exploration index (cosine distance from the firm's prior CPC centroid), while the y-axis measures the self-citation rate. Arrows connect successive periods for each firm, revealing how exploration strategies evolve. Firms in the upper-left quadrant are exploitative and self-referential; those in the lower-right are exploratory and externally oriented."
        insight="Firms exhibit highly heterogeneous trajectories: some remain anchored in exploitation with high self-citation rates, while others progressively shift toward broader exploration. The divergence of trajectories suggests that firm-level innovation strategy is shaped by path-dependent organizational capabilities rather than converging toward a common optimum."
        loading={etL3}
        badgeProps={{ outcomeWindow: '5y', outcomeThrough: 2020 }}
        height={500}
        wide
      >
        {trajectoryDatasets.length > 0 ? (
          <PWTrajectoryScatter
            datasets={trajectoryDatasets}
            xLabel="Exploration Index (cosine distance from prior CPC centroid)"
            yLabel="Self-Citation Rate"
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          The trajectory scatter reveals that top patent filers follow markedly different
          exploration-exploitation paths over time. Rather than converging toward a single
          optimal balance, firms trace distinctive orbits shaped by their technological
          histories and organizational capabilities -- underscoring that innovation strategy
          is path-dependent and that the exploration-exploitation trade-off manifests
          differently across corporate contexts.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The organizational mechanics documented across this chapter -- from the overwhelming exploitation bias and rapid exploration decay to the co-patenting clusters and asymmetric citation dependencies -- paint a nuanced picture of how firms navigate the innovation landscape. While most organizations deepen established domains, the minority that maintain ambidexterity produce blockbuster patents at more than twice the rate of specialized firms, even as within-firm quality concentration continues to rise. These firm-level patterns set the stage for the next chapter, <Link href="/chapters/mech-inventors" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Inventor Mechanics</Link>, which shifts from organizational strategies to the individual inventors and collaborative networks that ultimately produce the patents.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "11 of 20 major filers keep exploration below 5%, with a median exploration share of 2.9%, confirming the exploitation bias predicted by organizational theory.",
          "Balanced firms maintaining ambidexterity produce blockbuster patents at 2.3 times the rate of specialized firms.",
        ]}
        falsifiable="If ambidexterity causally improves innovation outcomes, then firms that exogenously increase their exploration (e.g., through acquisitions in new domains) should see subsequent blockbuster rate improvements."
        nextAnalysis={{
          label: "Inventor Mechanics",
          description: "Co-invention networks, bridge inventors, and the impact of inter-firm mobility on productivity",
          href: "/chapters/mech-inventors",
        }}
      />

      <DataNote>
        Exploration scores combine technology newness, citation newness, and external knowledge
        sourcing on a 0-1 scale; patents scoring above 0.6 are classified as exploratory, below
        0.4 as exploitative. The composite score averages the three indicators. Exploration
        trajectories track the share of exploratory patents per year for the 20 largest filers.
        Exploration decay tracks mean exploration scores by years since entry into a new CPC
        subclass. The ambidexterity index equals 1 minus the absolute difference between
        exploration and exploitation shares; it ranges from 0 (pure specialist) to 1 (perfect
        balance). Blockbuster rate measures the share of patents in the top 1% of their year
        by CPC section cohort. Within-firm quality Gini applies the Gini coefficient to 5-year
        forward citations within each firm&apos;s annual patent cohort. Co-patenting identifies
        patents with 2+ distinct organizational assignees. Corporate citation flows aggregate
        all citations between pairs of the top 30 assignees per decade. Technology leadership
        ranks firms by total citations received within each CPC section per time window.
        Exploration-exploitation trajectories plot the cosine distance from each firm&apos;s prior
        CPC centroid (exploration index) against the self-citation rate across 5-year windows.
        Assignee data employ disambiguated identities from PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={20} />
      <ChapterNavigation currentChapter={20} />
    </div>
  );
}
