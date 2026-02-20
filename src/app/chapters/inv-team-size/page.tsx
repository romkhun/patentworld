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
import { PWCoefficientPlot } from '@/components/charts/PWCoefficientPlot';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import type {
  TeamSizePerYear,
  SoloInventorTrend,
  SoloInventorBySection,
  TeamSizeCoeffData,
} from '@/lib/types';
import Link from 'next/link';
import { DescriptiveGapNote } from '@/components/chapter/DescriptiveGapNote';
import { CompetingExplanations } from '@/components/chapter/CompetingExplanations';

export default function InvTeamSizeChapter() {
  /* ── data hooks ── */
  const { data: team, loading: tmL } =
    useChapterData<TeamSizePerYear[]>('chapter5/team_size_per_year.json');
  const { data: solo, loading: soL } =
    useChapterData<SoloInventorTrend[]>('chapter5/solo_inventors.json');
  const { data: soloBySection, loading: sbsL } =
    useChapterData<SoloInventorBySection[]>('chapter5/solo_inventors_by_section.json');
  const { data: qualityByTeam, loading: qtL } =
    useChapterData<any[]>('computed/quality_by_team_size.json');
  const { data: prodByTeam, loading: ptL } =
    useChapterData<any[]>('computed/inventor_productivity_by_team_size.json');
  const { data: teamCoeffs, loading: tcL } =
    useChapterData<TeamSizeCoeffData>('chapter3/team_size_coefficients.json');

  /* ── derived data ── */
  const soloBySectionLabeled = useMemo(() => {
    if (!soloBySection) return [];
    return soloBySection.map((d) => ({
      ...d,
      label: `${d.section} - ${CPC_SECTION_NAMES[d.section] ?? d.section}`,
    }));
  }, [soloBySection]);

  /* ── pivot helper for team-size quality charts ── */
  const pivotData = (raw: any[] | null, metric: string) => {
    if (!raw) return [];
    const byYear: Record<number, any> = {};
    for (const r of raw) {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.group] = r[metric];
    }
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  };

  const { data: fwdCitData, yLabel: fwdCitYLabel, controls: fwdCitControls } = useCitationNormalization({
    data: pivotData(qualityByTeam, 'avg_forward_citations'),
    xKey: 'year',
    citationKeys: ['Solo', '2-3', '4-6', '7+'],
    yLabel: 'Avg. Forward Citations',
  });

  /* ── shared line config for team-size charts ── */
  const teamLines = [
    { key: 'Solo', name: 'Solo Inventor', color: CHART_COLORS[0] },
    { key: '2-3', name: '2-3 Inventors', color: CHART_COLORS[1] },
    { key: '4-6', name: '4-6 Inventors', color: CHART_COLORS[2] },
    { key: '7+', name: '7+ Inventors', color: CHART_COLORS[3] },
  ];

  /* ── by-decade coefficient data: group into per-decade arrays ── */
  const decadeGroups = useMemo(() => {
    if (!teamCoeffs?.by_decade) return [];
    const grouped: Record<string, { category: string; coefficient: number; se: number; ci_lower: number; ci_upper: number }[]> = {};
    for (const d of teamCoeffs.by_decade) {
      if (!grouped[d.decade]) grouped[d.decade] = [];
      grouped[d.decade].push({
        category: d.category,
        coefficient: d.coefficient,
        se: d.se,
        ci_lower: d.ci_lower,
        ci_upper: d.ci_upper,
      });
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([decade, coefficients]) => ({ decade, coefficients }));
  }, [teamCoeffs]);

  return (
    <div>
      <ChapterHeader
        number={17}
        title="Team Size and Collaboration"
        subtitle="The collaborative turn and team size effects on quality"
      />
      <MeasurementSidebar slug="inv-team-size" />

      <KeyFindings>
        <li>
          Average patent team size increased from 1.7 inventors per patent in
          1976 to 3.2 by 2025, while the solo-inventor share declined from 58%
          to 24%.
        </li>
        <li>
          The share of patents listing five or more inventors has grown more than eightfold,
          from 2.5% to 21%, reflecting the increasing complexity and
          interdisciplinarity of contemporary technology development.
        </li>
        <li>
          Solo invention rates vary substantially across technology fields: chemistry and
          metallurgy (CPC Section C) has the lowest solo-inventor share at 13%, while fixed
          constructions (Section E) retains the highest at nearly 39%.
        </li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Executive Summary
        </h2>
        <p className="text-sm leading-relaxed">
          The transition from solo to team-based invention is one of the defining structural
          shifts in modern innovation: average team size rose from 1.7 to over 3 inventors per
          patent, while the solo share fell from above 50% to under 25%. Chemistry and
          biotech-adjacent fields have the lowest solo rates, while traditional mechanical
          fields retain higher shares of individual invention. Quality metrics across team
          size categories reveal how collaboration relates to patent characteristics.
        </p>
      </aside>

      <Narrative>
        <p>
          The previous chapter,{' '}
          <Link
            href="/chapters/inv-gender"
            className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors"
          >
            Gender and Patenting
          </Link>
          , examined how gender composition in patenting has evolved. This chapter turns to the
          structural organization of inventive activity itself: the shift from solo to
          team-based patenting, the distribution of solo invention across technology fields,
          and the relationship between team size and patent quality.
        </p>
        <p>
          The most consequential structural shift in modern invention has been the transition
          from individual to collaborative patenting, reflecting the growing complexity and
          interdisciplinarity of contemporary technology development. This chapter traces that
          shift and explores whether team composition correlates with measurable differences
          in patent quality.
        </p>
      </Narrative>

      {/* ── Section A: The Collaborative Turn ── */}
      <SectionDivider label="The Collaborative Turn" />

      <ChartContainer
        id="fig-team-size-trend"
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
            { key: 'solo_pct', name: 'Solo %', color: CHART_COLORS[2], yAxisId: 'left' },
            { key: 'large_team_pct', name: 'Large Team (5+) %', color: CHART_COLORS[3], yAxisId: 'left' },
            { key: 'avg_team_size', name: 'Average Team Size', color: CHART_COLORS[0], yAxisId: 'right' },
          ]}
          yLabel="Percentage (%)"
          yFormatter={(v) => `${v.toFixed(0)}%`}
          rightYLabel="Average Team Size"
          rightYFormatter={(v) => v.toFixed(1)}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Average team size increased from <StatCallout value="1.7" /> inventors
          per patent in 1976 to <StatCallout value="3.2" /> by 2025. The share of
          solo-inventor patents has declined substantially, while patents listing five or more
          inventors have become increasingly prevalent.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The transition from solo to team invention mirrors broader trends in science and
          engineering. The solo-inventor share declined from 58% to 24%, while the
          share of patents listing five or more inventors has grown more than eightfold, from
          2.5% to 21%. This pattern suggests that contemporary technologies
          increasingly require diverse expertise that exceeds the capacity of any individual
          inventor.
        </p>
      </KeyInsight>

      <DescriptiveGapNote variant="team-size" />

      <ChartContainer
        id="fig-solo-inventor-trend"
        title="Solo Inventor Patents Declined from 58% to 23% of All Grants, 1976-2025"
        subtitle="Annual count of solo-inventor patents and their share of total patent grants, 1976-2025"
        caption="This chart tracks the annual number of solo-inventor patents alongside their declining share of total patent output. While the absolute number of solo patents has grown modestly, the share has fallen steadily as team-based patents grew far more rapidly."
        insight="Solo invention has not disappeared in absolute terms -- solo patent counts have roughly doubled -- but the collaborative mode has expanded far more rapidly, reducing the solo share from a majority to under a quarter of all grants."
        loading={soL}
      >
        <PWLineChart
          data={solo ?? []}
          xKey="year"
          lines={[
            { key: 'solo_pct', name: 'Solo %', color: CHART_COLORS[0] },
          ]}
          yLabel="Solo Inventor Share (%)"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-solo-by-section"
        title="Solo Invention Rates Vary Widely Across Technology Fields"
        subtitle="Share of solo-inventor patents by CPC section, 1976-2025"
        caption="This chart compares the solo-inventor share across CPC technology sections. Fields requiring complex laboratory or multidisciplinary approaches (such as Chemistry and Electricity) show markedly lower solo rates than traditional mechanical and construction fields."
        insight="The variation in solo-inventor rates across technology fields reflects the differing knowledge requirements of each domain. Laboratory-intensive fields like chemistry and biotechnology rely more heavily on team-based approaches."
        loading={sbsL}
      >
        <PWBarChart
          data={soloBySectionLabeled}
          xKey="label"
          bars={[{ key: 'solo_pct', name: 'Solo %', color: CHART_COLORS[0] }]}
          layout="vertical"
          yLabel="Solo Inventor Share (%)"
        />
      </ChartContainer>

      <Narrative>
        <p>
          Solo invention rates vary substantially across technology fields. Chemistry and
          metallurgy (CPC Section C) has the lowest solo-inventor share at approximately{' '}
          <StatCallout value="13%" />, reflecting the laboratory-intensive, multidisciplinary
          nature of chemical and pharmaceutical innovation. Fixed constructions (Section E)
          retains the highest solo share at nearly <StatCallout value="39%" />, consistent with
          fields where individual craftsmen and small-firm inventors remain more prevalent.
          Physics (Section G) and Electricity (Section H), the two largest and fastest-growing
          technology domains, both exhibit solo rates below 26%.
        </p>
      </Narrative>

      {/* ── Section B: Quality Metrics — By Team Size ── */}
      <SectionDivider label="Quality Metrics by Team Size" />
      <Narrative>
        <p>
          Team size categories are defined as: Solo (1 inventor), Small (2-3 inventors),
          Medium (4-6 inventors), and Large (7+ inventors). The following quality indicators
          reveal how team composition correlates with patent characteristics.
        </p>
      </Narrative>
      {/* B.i — Forward Citations */}
      <ChartContainer
        id="fig-team-fwd-citations"
        title="Solo Inventors Average 0.88 Forward Citations in 2024, More Than Double the 0.32 for Teams of 4-6"
        subtitle="Average forward citations per patent by team size category, 1976-2025"
        caption="Average forward citations received per patent by team size category, 1976-2024. Recent years are truncated due to citation lag. Data: PatentsView."
        loading={qtL}
        height={400}
        controls={fwdCitControls}
      >
        <PWLineChart
          data={fwdCitData ?? []}
          xKey="year"
          lines={teamLines}
          yLabel={fwdCitYLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      {/* B.ii — Claims */}
      <ChartContainer
        id="fig-team-claims"
        title="Teams of 7+ Average 16.7 Claims per Patent, vs. 11.6 for Solo Inventors"
        subtitle="Average number of claims per patent by team size category, 1976-2025"
        caption="Average number of claims per patent by team size category, 1976-2024. Larger teams consistently file patents with more claims. Data: PatentsView."
        loading={qtL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByTeam, 'avg_num_claims')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. Claims"
        />
      </ChartContainer>

      {/* B.iii — Scope */}
      <ChartContainer
        id="fig-team-scope"
        title="Teams of 7+ Span 2.58 CPC Subclasses on Average, vs. 2.30 for Solo Inventors"
        subtitle="Average patent scope (CPC subclass count) by team size category, 1976-2025"
        caption="Average number of distinct CPC subclasses per patent by team size category, 1976-2024. Higher values indicate broader technological scope. Data: PatentsView."
        loading={qtL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByTeam, 'avg_scope')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. CPC Subclasses"
        />
      </ChartContainer>

      {/* B.iv — Originality */}
      <ChartContainer
        id="fig-team-originality"
        title="Multi-Inventor Teams Draw on More Diverse Prior Art Sources"
        subtitle="Average originality index by team size category, 1976-2025"
        caption="Average originality index (Herfindahl-based dispersion of backward citation technology classes) by team size category, 1976-2024. Data: PatentsView."
        loading={qtL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByTeam, 'avg_originality')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. Originality Index"
        />
      </ChartContainer>

      {/* B.v — Generality */}
      <ChartContainer
        id="fig-team-generality"
        title="Team Size Shows Little Differentiation in Citation Generality"
        subtitle="Average generality index by team size category, 1976-2025"
        caption="Average generality index (Herfindahl-based dispersion of forward citation technology classes) by team size category, 1976-2024. Data: PatentsView."
        loading={qtL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByTeam, 'avg_generality')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. Generality Index"
        />
      </ChartContainer>

      {/* B.vi — Self-Citation Rate */}
      <ChartContainer
        id="fig-team-self-citation"
        title="Teams of 7+ Self-Cite at 16.8%, Nearly Double Solo Inventors' 8.8%"
        subtitle="Average self-citation rate by team size category, 1976-2025"
        caption="Average self-citation rate (share of backward citations to the same assignee's patents) by team size category, 1976-2024. Data: PatentsView."
        loading={qtL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByTeam, 'avg_self_citation_rate')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. Self-Citation Rate"
          yFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
        />
      </ChartContainer>

      {/* B.vii — Grant Lag */}
      <ChartContainer
        id="fig-team-grant-lag"
        title="Teams of 4-6 Wait 1,024 Days for Grant, vs. 905 Days for Solo Inventors"
        subtitle="Average grant lag in days by team size category, 1976-2025"
        caption="Average number of days from filing to grant by team size category, 1976-2024. Grant lag generally increases with team size. Data: PatentsView."
        loading={qtL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualityByTeam, 'avg_grant_lag_days')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. Grant Lag (days)"
        />
      </ChartContainer>

      {/* B.viii — Inventor Productivity */}
      <ChartContainer
        id="fig-team-productivity"
        title="Mid-Size Teams (4-6) Show the Highest Per-Inventor Patent Productivity"
        subtitle="Average patents per inventor by team size category, 1976-2025"
        caption="Average number of patents per inventor by team size category, 1976-2024. Productivity is measured as career patent count divided by active years. Data: PatentsView."
        loading={ptL}
        height={400}
      >
        <PWLineChart
          data={pivotData(prodByTeam, 'avg_patents_per_inventor')}
          xKey="year"
          lines={teamLines}
          yLabel="Avg. Patents per Inventor"
        />
      </ChartContainer>

      {/* ── Section C: Regression Analysis — Team Size Coefficients ── */}
      <SectionDivider label="Team Size and Citation Impact: Regression Evidence" />

      <Narrative>
        <p>
          The descriptive quality comparisons above reveal suggestive patterns but cannot
          isolate the independent effect of team size from confounding factors such as
          technology field, grant year, and assignee characteristics. To address this, the
          following analysis applies a Frisch-Waugh-Lovell (FWL) OLS regression that demeans
          cohort-normalized 5-year forward citations within grant year, CPC section, and
          assignee-size groups. Team size dummies (2-3, 4-6, 7+ inventors) are estimated
          relative to the solo-inventor baseline, with standard errors clustered at the
          assignee level.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-team-size-coefficients"
        title="Larger Teams Produce Higher Cohort-Normalized Citations, Even After Controlling for Field and Year"
        subtitle="FWL OLS coefficients for team size dummies relative to solo inventors, with 95% confidence intervals clustered by assignee."
        caption="Each bar represents the marginal effect of team size (relative to solo inventors) on cohort-normalized 5-year forward citations, after absorbing year × CPC section × assignee-size fixed effects. Error bars show 95% confidence intervals with standard errors clustered at the assignee level."
        loading={tcL}
        badgeProps={{ asOf: 'PatentsView 2025-Q1', outcomeWindow: '5y', outcomeThrough: 2020, normalization: 'Cohort×field×assignee' }}
        height={300}
      >
        <PWCoefficientPlot
          data={teamCoeffs?.main_coefficients ?? []}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Even after controlling for grant year, technology field, and assignee size, larger
          teams produce patents with significantly higher cohort-normalized citation impact.
          The positive coefficients increase monotonically with team size, confirming that the
          team-size premium is not simply an artifact of compositional differences across
          fields or time periods.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-team-size-by-decade"
        title="The Team-Size Premium Has Grown Over Time, Especially for Large Teams"
        subtitle="By-decade OLS coefficients for team size dummies relative to solo inventors, with 95% confidence intervals clustered by assignee."
        caption="Each panel shows FWL OLS coefficients estimated separately for each decade. The growing magnitude of the 7+ team coefficient over successive decades indicates that the citation premium for large teams has strengthened over time."
        loading={tcL}
        badgeProps={{ asOf: 'PatentsView 2025-Q1', outcomeWindow: '5y', outcomeThrough: 2020, normalization: 'Cohort×field×assignee' }}
        height={400}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 h-full">
          {decadeGroups.map((group) => (
            <div key={group.decade} className="flex flex-col">
              <h4 className="mb-1 text-center text-xs font-semibold text-muted-foreground">
                {group.decade}
              </h4>
              <div className="flex-1" style={{ minHeight: 140 }}>
                <PWCoefficientPlot
                  data={group.coefficients}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>

      <KeyInsight>
        <p>
          The team-size citation premium has not been constant: it has grown substantially
          across decades, with the largest gains accruing to teams of 7 or more inventors.
          This pattern is consistent with the hypothesis that the increasing complexity of
          modern technology rewards larger, more diverse teams -- and that the returns to
          collaboration have risen over time rather than diminished.
        </p>
      </KeyInsight>

      <CompetingExplanations
        finding="positive association between team size and citation impact"
        explanations={[
          'Larger teams pool diverse knowledge and skills, producing more novel combinations that attract citations',
          'High-potential projects may attract larger teams, creating a selection effect rather than a direct team-size benefit',
          'Teams generate more self-citations through continued collaboration on related follow-up patents',
          'Institutional prestige effects may drive both team formation and citation accumulation (Matthew effect)',
        ]}
      />

      {/* ── Closing Transition ── */}
      <Narrative>
        <p>
          The team-based structure of modern invention documented in this chapter concludes
          ACT 3: The Inventors. Having examined who invents -- from top inventors and
          specialization patterns to career trajectories, gender composition, and team
          structure -- the analysis now shifts to <em>where</em> innovation happens. ACT 4:
          The Geography begins with{' '}
          <Link
            href="/chapters/geo-domestic"
            className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors"
          >
            Domestic Geography
          </Link>
          , which maps the concentration of patent activity across US states and cities,
          revealing the spatial clustering that shapes patenting activity in the United States.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "Average patent team size increased from 1.7 to 3.2 inventors, while the solo-inventor share fell from 58% to 24%.",
          "Teams of 7+ average 16.7 claims per patent vs. 11.6 for solo inventors, indicating that larger teams produce broader patent protection.",
        ]}
        falsifiable="If team size causally increases patent quality rather than reflecting project selection, then exogenous team expansions (e.g., due to firm mergers) should produce citation gains."
        nextAnalysis={{
          label: "Domestic Geography",
          description: "Where in the United States does patenting concentrate, and how does location affect quality?",
          href: "/chapters/geo-domestic",
        }}
      />

      <DataNote>
        Team size counts all listed inventors per patent. Solo inventor share is computed as
        the percentage of patents with exactly one listed inventor. CPC section-level solo
        rates use the primary CPC classification of each patent. Inventor disambiguation is
        provided by PatentsView. The regression analysis uses Frisch-Waugh-Lovell OLS with
        cohort-normalized 5-year forward citations as the dependent variable, demeaning within
        grant year × CPC section × assignee-size groups, with standard errors clustered at
        the assignee level.
      </DataNote>

      <RelatedChapters currentChapter={17} />
      <ChapterNavigation currentChapter={17} />
    </div>
  );
}
