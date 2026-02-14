'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import type {
  TeamSizePerYear, ProlificInventor,
  StarInventorImpact,
} from '@/lib/types';
import { RankingTable } from '@/components/chapter/RankingTable';
import Link from 'next/link';

export default function InventorProductivity() {
  const { data: team, loading: tmL } = useChapterData<TeamSizePerYear[]>('chapter5/team_size_per_year.json');
  const { data: prolific, loading: prL } = useChapterData<ProlificInventor[]>('chapter5/prolific_inventors.json');
  const { data: starImpact, loading: siL } = useChapterData<StarInventorImpact[]>('chapter5/star_inventor_impact.json');

  const topInventors = useMemo(() => {
    if (!prolific) return [];
    return prolific.map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`.trim(),
    }));
  }, [prolific]);

  const topInventorName = prolific?.[0]
    ? `${prolific[0].first_name} ${prolific[0].last_name}`.trim()
    : 'Shunpei Yamazaki';

  const starData = useMemo(() => {
    if (!starImpact) return [];
    return starImpact.slice(0, 100).map((d) => ({
      ...d,
      label: `${d.first_name} ${d.last_name}`.trim(),
    }));
  }, [starImpact]);

  return (
    <div>
      <ChapterHeader
        number={18}
        title="Inventor Productivity"
        subtitle="Team size, prolific inventors, and citation impact"
      />

      <KeyFindings>
        <li>Average patent team size increased from approximately 1.7 inventors per patent in the late 1970s to over 3 by 2025, while the solo-inventor share declined from above 50% to under 25%.</li>
        <li>The most prolific inventor, {topInventorName}, holds 6,709 patents, and the top 100 inventors each exceed 760 patents, predominantly concentrated in electronics and semiconductor fields.</li>
        <li>Citation impact among the 100 most prolific inventors ranges from 10 to 965 average citations per patent, demonstrating that prolificacy and impact are distinct dimensions of inventor performance.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The transition from solo to team-based invention is one of the defining structural shifts in modern innovation: average team size rose from 1.7 to over 3 inventors per patent, while the solo share fell from above 50% to under 25%. The most prolific inventor holds 6,709 patents, but prolificacy and citation impact are only weakly correlated -- some high-volume filers average fewer than 10 citations per patent while others exceed 900.
        </p>
      </aside>

      <Narrative>
        <p>
          Having established the demographic profile of inventors in <Link href="/chapters/inventor-demographics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Inventor Demographics</Link>,
          this chapter turns to what they produce. The most consequential structural shift in modern
          invention has been the transition from solo to team-based patenting, reflecting the growing
          complexity and interdisciplinarity of contemporary technology development.
        </p>
        <p>
          Beyond team structure, the distribution of individual output reveals stark contrasts:
          a small number of individuals are distinguished by exceptionally high patent volumes,
          but prolificacy does not necessarily correspond to citation impact.
        </p>
      </Narrative>

      <SectionDivider label="The Collaborative Turn" />

      <ChartContainer
        id="fig-inventors-team-size"
        title="Average Patent Team Size Increased from 1.7 to Over 3 Inventors, 1976-2025"
        subtitle="Average team size, solo-inventor share, and large-team (5+) share per patent, tracking the shift from solo to collaborative invention, 1976-2025"
        caption="This chart displays three concurrent trends in inventor team composition: average team size per patent, the percentage of solo-inventor patents, and the share of large-team (5+ inventor) patents. The most prominent pattern is the steady rise in average team size alongside a corresponding decline in solo invention from above 50% to under 25%."
        insight="The transition from solo invention to team-based research and development constitutes one of the defining structural shifts in modern innovation, reflecting the increasing complexity and interdisciplinarity of technology development."
        loading={tmL}
      >
        <PWLineChart
          data={team ?? []}
          xKey="year"
          lines={[
            { key: 'solo_pct', name: 'Solo %', color: CHART_COLORS[2] },
            { key: 'large_team_pct', name: 'Large Team (5+) %', color: CHART_COLORS[3] },
            { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[0] },
          ]}
          yLabel="Percentage / Team Size"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Average team size increased from approximately 1.7 inventors per patent in
          the late 1970s to over 3 by 2025. The share of solo-inventor patents has
          declined substantially, while patents listing five or more inventors have become
          increasingly prevalent.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The transition from solo to team invention mirrors broader trends in science and engineering.
          The solo-inventor share declined from above 50% to under 25%, while the share of patents listing five or more
          inventors has grown more than eightfold, from about 2.5% to over 21%. This pattern suggests that contemporary technologies increasingly
          require diverse expertise that exceeds the capacity of any individual inventor.
        </p>
      </KeyInsight>

      <SectionDivider label="Top Inventors" />

      <Narrative>
        <p>
          Within this increasingly collaborative landscape, a small number of individuals are distinguished by their
          exceptionally high volume of patent output. <StatCallout value={topInventorName} /> holds the record
          for the most patents granted to a single inventor, but prolificacy alone does not fully characterize
          inventor performance.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-prolific-ranking"
        title="The Most Prolific Inventor Holds 6,709 Patents; Top 100 Each Exceed 760"
        subtitle="Top 100 inventors ranked by total utility patents granted, 1976-2025"
        caption="This chart ranks inventors by total utility patents granted from 1976 to 2025. The distribution is heavily right-skewed, with the top-ranked inventors holding thousands of patents each, predominantly in electronics and semiconductor fields."
        insight="The concentration of patents among a small number of prolific inventors raises questions regarding whether the patent system disproportionately rewards institutional resources rather than individual inventive capacity."
        loading={prL}
        height={1800}
      >
        <PWBarChart
          data={topInventors}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top inventors as a data table"
        headers={['Inventor', 'Total Patents']}
        rows={(prolific ?? []).slice(0, 15).map(d => [`${d.first_name} ${d.last_name}`.trim(), d.total_patents])}
        caption="Top 15 inventors by cumulative utility patent grants, 1976-2025. Source: PatentsView."
      />

      <Narrative>
        <p>
          The most prolific inventors are disproportionately concentrated in electronics and
          semiconductor fields, where rapid design iteration and modular innovation facilitate
          high patent output. Many of the top-ranked inventors are associated with large
          Japanese and Korean electronics firms that emphasize systematic patent generation.
        </p>
      </Narrative>

      <SectionDivider label="Inventor Impact" />

      <Narrative>
        <p>
          Prolificacy does not necessarily correspond to impact. <GlossaryTooltip term="forward citations">Forward citations</GlossaryTooltip> --
          the frequency with which an inventor&apos;s patents are cited by subsequent patents -- indicate whether their
          innovations serve as <StatCallout value="foundational contributions" /> to future inventions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-inventors-citation-impact"
        title="Citation Impact Ranges from 10 to 965 Average Citations Among the 100 Most Prolific Inventors"
        subtitle="Average and median forward citations per patent for the top 100 highest-citation inventors among prolific filers, based on patents granted through 2020"
        caption="This chart presents the average and median forward citations per patent for the top 100 most prolific inventors, limited to patents granted through 2020. The data reveal substantial variation in citation impact, with some high-volume inventors averaging fewer than 10 citations per patent while others exceed 50."
        insight="Prolificacy and citation impact constitute distinct dimensions of inventor performance. Some high-volume inventors generate modest per-patent citations, while others achieve disproportionate influence, suggesting that patent quantity and quality are only weakly correlated at the individual level."
        loading={siL}
        height={1800}
      >
        <PWBarChart
          data={starData}
          xKey="label"
          bars={[
            { key: 'avg_citations', name: 'Average Citations', color: CHART_COLORS[0] },
            { key: 'median_citations', name: 'Median Citations', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
          yLabel="Citations"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Prolificacy and impact constitute distinct dimensions of performance. Some inventors with
          fewer total patents generate substantially higher citation impact per patent,
          suggesting a more pronounced influence on their respective fields.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The patterns of team-based invention and individual prolificacy documented here raise a natural question: how is inventive output distributed across the full inventor population? The next chapter, <Link href="/chapters/productivity-concentration" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Productivity Concentration</Link>, examines the skewed distribution of patent output and the growing dominance of repeat inventors.
        </p>
      </Narrative>

      <DataNote>
        Team size counts all listed inventors per patent. Inventor disambiguation
        is provided by PatentsView. Citation impact uses forward citations for
        patents granted through 2020.
      </DataNote>

      <RelatedChapters currentChapter={18} />
      <ChapterNavigation currentChapter={18} />
    </div>
  );
}
