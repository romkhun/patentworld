'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWConvergenceMatrix } from '@/components/charts/PWConvergenceMatrix';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { CHART_COLORS, WIPO_SECTOR_COLORS, CPC_SECTION_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { TechnologyHalfLife, TechnologyDecayCurve, HHIBySection, ConvergenceEntry, GrantLagBySector } from '@/lib/types';

function pivotGrantLag(data: GrantLagBySector[]) {
  const periods = [...new Set(data.map((d) => d.period))].sort();
  return periods.map((period) => {
    const row: any = { period: `${period}s` };
    data.filter((d) => d.period === period).forEach((d) => {
      row[d.sector] = d.avg_lag_days;
    });
    return row;
  });
}

export default function Chapter5() {
  const { data: halfLife } = useChapterData<TechnologyHalfLife[]>('chapter2/technology_halflife.json');
  const { data: decayCurves, loading: dcL } = useChapterData<TechnologyDecayCurve[]>('chapter2/technology_decay_curves.json');
  const { data: hhiData, loading: hhiL } = useChapterData<HHIBySection[]>('chapter10/hhi_by_section.json');
  const { data: convergenceData, loading: conL } = useChapterData<ConvergenceEntry[]>('chapter10/convergence_matrix.json');
  const { data: grantLag, loading: glL } = useChapterData<GrantLagBySector[]>('chapter7/grant_lag_by_sector.json');

  const { decayPivot, decaySections } = useMemo(() => {
    if (!decayCurves) return { decayPivot: [], decaySections: [] };
    const sections = [...new Set(decayCurves.map(d => d.section))].sort();
    const years = [...new Set(decayCurves.map(d => d.years_after))].sort((a, b) => a - b);
    const pivoted = years.map(yr => {
      const row: Record<string, any> = { years_after: yr };
      decayCurves.filter(d => d.years_after === yr).forEach(d => {
        row[d.section] = d.pct_of_total;
      });
      return row;
    });
    return { decayPivot: pivoted, decaySections: sections };
  }, [decayCurves]);

  // Pivot HHI data: one line per CPC section over time
  const hhiPivot = useMemo(() => {
    if (!hhiData) return [];
    const periods = [...new Set(hhiData.map((d) => d.period))].sort();
    return periods.map((period) => {
      const row: Record<string, any> = { period };
      hhiData.filter((d) => d.period === period).forEach((d) => {
        row[d.section] = d.hhi;
      });
      return row;
    });
  }, [hhiData]);

  const hhiSections = useMemo(() => {
    if (!hhiData) return [];
    return [...new Set(hhiData.filter((d) => d.section !== 'Overall').map((d) => d.section))].sort();
  }, [hhiData]);

  const convergenceEras = useMemo(() => {
    if (!convergenceData) return [];
    return [...new Set(convergenceData.map((d) => d.era))].sort();
  }, [convergenceData]);

  const lagPivot = useMemo(() => grantLag ? pivotGrantLag(grantLag) : [], [grantLag]);
  const grantLagSectorNames = useMemo(() => {
    if (!grantLag) return [];
    return [...new Set(grantLag.map((d) => d.sector))];
  }, [grantLag]);

  return (
    <div>
      <ChapterHeader
        number={5}
        title="Cross-Field Convergence"
        subtitle="Technology overlap, concentration, and field-specific metrics, 1976-2025"
      />

      <KeyFindings>
        <li>The G-H (Physics-Electricity) convergence pair rose from 12.5% to 37.5% of all cross-section patents between 1976-1995 and 2011-2025, reflecting intensifying cross-field integration.</li>
        <li>Despite concentration in digital fields, patent markets remain unconcentrated across all CPC sections, with HHI values well below the 1,500 threshold.</li>
        <li>Citation half-lives vary by nearly five years across technology fields, with Electricity (H) at 10.7 years and Human Necessities (A) at 15.6 years, revealing substantially different rates of knowledge obsolescence.</li>
        <li>Grant lags peaked above 3.5 years for leading sectors in the late 2000s, with chemistry and electrical engineering exhibiting the longest examination periods.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The G-H (Physics-Electricity) convergence pair rose from 12.5% to 37.5% of all cross-section patents between 1976-1995 and 2011-2025, as digital technology has become increasingly pervasive across domains. Despite this concentration, patent markets remain unconcentrated across all CPC sections, with HHI values well below antitrust thresholds. Field-specific metrics reveal substantially different innovation dynamics: citation half-lives range from 10.7 years (Electricity) to 15.6 years (Human Necessities), while grant lags peaked above 3.5 years in the late 2000s before moderating.
        </p>
      </aside>

      <Narrative>
        <p>
          The <Link href="/chapters/technology-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">field-level overview</Link> and <Link href="/chapters/technology-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">growth dynamics</Link> examined in the preceding chapters describe each technology field largely in isolation. Yet the boundaries between fields are not fixed: as digital technology has become pervasive, inventions increasingly span multiple CPC sections, and the question of whether any single field has become dominated by a small number of actors takes on greater significance.
        </p>
        <p>
          This chapter examines cross-field dynamics through multiple complementary lenses: technology convergence patterns, market concentration by sector, citation half-lives that reveal knowledge obsolescence rates, and grant lag variations across technology fields.
        </p>
        <p>
          These structural shifts also shape the organizational landscape examined in <Link href="/chapters/assignee-landscape" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link> and the semantic patterns explored in <Link href="/chapters/the-language-of-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Language of Innovation</Link>.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-cross-field-convergence-matrix"
        subtitle="Percentage of multi-section patents spanning each CPC section pair by era, measuring how technology boundaries have become more permeable."
        title="The G-H (Physics-Electricity) Convergence Pair Rose from 12.5% to 37.5% of All Cross-Section Patents Between 1976-1995 and 2011-2025"
        caption="This chart displays the percentage of multi-section patents that span each pair of CPC sections, by era. The G-H (Physics-Electricity) pair consistently dominates convergence, and its share has increased substantially in the 2011-2025 period as digital technology has permeated additional domains."
        insight="Technology boundaries appear increasingly permeable over time, with the Physics-Electricity convergence intensifying as digital technology extends across domains. This increasing cross-pollination has implications for patent scope and examination complexity."
        loading={conL}
        height={700}
      >
        {convergenceData && convergenceEras.length > 0 && (
          <PWConvergenceMatrix data={convergenceData} eras={convergenceEras} />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          The G-H (Physics-Electricity) pair has dominated convergence from the late 1990s onward, reflecting
          the deep integration of computing, electronics, and physics. In the earliest era (1976-1995), B-C (Operations-Chemistry) and A-C (Human Necessities-Chemistry) pairs led convergence, but the pattern shifted
          substantially: in 2011-2025, G-H convergence has intensified as digital technology permeates
          an increasing number of domains. The growing overlap between A (Human Necessities) and G (Physics)
          in the 2011-2025 period is consistent with the rise of health technology and biomedical electronics.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Given the increasing convergence of technology fields and the dominance of a few CPC sections,
          it is natural to ask whether certain technology areas are becoming dominated by a small number
          of large entities. The Herfindahl-Hirschman Index (HHI) measures market concentration by summing
          the squared market shares of all firms in a sector. On the standard DOJ/FTC scale,{' '}
          <StatCallout value="below 1,500" /> indicates an unconcentrated market,{' '}
          <StatCallout value="1,500-2,500" /> is moderately concentrated, and{' '}
          <StatCallout value="above 2,500" /> is highly concentrated.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-cross-field-hhi-by-section"
        subtitle="Herfindahl-Hirschman Index (HHI) of patent assignee concentration within each CPC section, computed in 5-year periods."
        title="Patent Markets Remain Unconcentrated Across All CPC Sections, with HHI Values Well Below the 1,500 Threshold"
        caption="This chart displays the Herfindahl-Hirschman Index (HHI) for patent assignees within each CPC section, computed in 5-year periods. Higher values indicate greater concentration. All technology sectors remain well below the 1,500 threshold for moderate concentration, with Textiles and Paper (D) exhibiting the highest values since 2010."
        insight="Notwithstanding concerns about market power in technology, patent markets remain unconcentrated across all sectors. The broad base of innovators maintains concentration well below antitrust thresholds even in areas associated with large firms."
        loading={hhiL}
      >
        <PWLineChart
          data={hhiPivot}
          xKey="period"
          lines={hhiSections.map((section) => ({
            key: section,
            name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
            color: CPC_SECTION_COLORS[section],
          }))}
          yLabel="HHI"
          yFormatter={(v: number) => v.toLocaleString()}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent markets across all technology sectors remain unconcentrated, with HHI
          values well below the 1,500 threshold. This pattern reflects the broad base of inventors and
          organizations participating in the patent system. Even in Electricity (H) and Physics (G) --
          the sections most associated with large technology firms -- concentration remains low,
          though certain sections exhibit modest increases since 2010. In that period, Textiles and Paper (D) has exhibited the highest concentration, consistent with its smaller inventor base and more
          specialized industrial structure.
        </p>
      </KeyInsight>

      {/* ── Section: Field-Specific Metrics ── */}

      <SectionDivider label="Field-Specific Metrics" />

      <Narrative>
        <p>
          The structural overview, growth dynamics, and cross-field patterns examined thus far describe
          the broad contours of technological change. This section turns to metrics that characterize
          individual technology fields: the rate at which knowledge becomes obsolete, as measured by
          citation half-lives, and the duration of the patent examination process, which varies substantially
          across technology sectors.
        </p>
      </Narrative>

      {halfLife && halfLife.length > 0 && (
        <div className="max-w-2xl mx-auto my-8">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">Citation Half-Life by Technology Area</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">CPC Section</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Half-Life (years)</th>
              </tr>
            </thead>
            <tbody>
              {[...halfLife].sort((a, b) => (a.half_life_years ?? 0) - (b.half_life_years ?? 0)).map((hl, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-3">{hl.section}: {CPC_SECTION_NAMES[hl.section] ?? hl.section}</td>
                  <td className="text-right py-2 px-3 font-mono font-semibold">{hl.half_life_years?.toFixed(1) ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ChartContainer
        id="fig-cross-field-citation-decay"
        title="Electricity (H) and Physics (G) Patents Exhibit the Shortest Citation Half-Lives at 10.7 and 11.2 Years, vs. 15.6 Years for Human Necessities (A)"
        subtitle="Percentage of total forward citations received at each post-grant year, by CPC section, measuring knowledge obsolescence rates"
        caption="Distribution of forward citations by years after grant, by CPC section. Each line indicates the percentage of a technology area's total citations arriving in each post-grant year. Sections H (Electricity) and G (Physics) exhibit the steepest early peaks, while Chemistry (C) and Human Necessities (A) demonstrate more gradual accumulation."
        insight="Rapidly evolving fields such as computing (H) and physics (G) exhibit short citation half-lives, indicating that knowledge in these domains becomes superseded more quickly. Chemistry and pharmaceutical innovations, by contrast, maintain relevance over substantially longer periods."
        loading={dcL}
      >
        {decayPivot.length > 0 && (
          <PWLineChart
            data={decayPivot}
            xKey="years_after"
            lines={decaySections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            xLabel="Years After Grant"
            yLabel="% of Total Citations"
            yFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          Electricity (H) and Physics (G) patents exhibit the shortest half-lives,
          consistent with the rapid innovation cycles in computing and electronics in which
          current advances are quickly superseded by subsequent developments. Human Necessities (A) and
          Fixed Constructions (E) show the longest half-lives, reflecting the enduring
          relevance of innovations in these domains that often represent fundamental advances with lasting impact.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Knowledge obsolescence rates are complemented by examination pendency as a second
          field-specific metric. The duration from application filing to patent grant varies substantially
          across technology sectors, reflecting differences in examination complexity, prior art volume,
          and USPTO resource allocation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-cross-field-grant-lag-by-sector"
        subtitle="Average days from application filing to patent grant by WIPO technology sector across 5-year periods."
        title="Chemistry, Electrical Engineering, and Instruments Patents Exhibit Among the Longest Grant Lags, Exceeding 3.5 Years in the Late 2000s"
        caption="This chart displays the average number of days from application filing to patent grant, disaggregated by WIPO technology sector across 5-year periods. Chemistry and electrical engineering patents exhibit the longest pendency in the late 2000s, with both peaking above 1,300 days."
        loading={glL}
        insight="Technology-specific backlogs appear to reflect both the complexity of patent examination in certain fields and the USPTO's resource allocation decisions."
      >
        <PWLineChart
          data={lagPivot}
          xKey="period"
          lines={grantLagSectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Years"
          yFormatter={(v) => `${Math.round(v / 365.25 * 10) / 10}`}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The duration from application to grant has fluctuated
          considerably over the decades. Patent office backlogs, examination complexity,
          and policy reforms each contribute to observable shifts in the grant lag trajectory.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Grant lags reveal the institutional constraints on innovation. The late 2000s backlog
          elevated pendency beyond 3.5 years for leading sectors; subsequent USPTO reforms reduced
          these durations. Chemistry and electrical engineering patents exhibit the longest
          examination periods in the late 2000s, a pattern consistent with the substantial volume and complexity of prior art in
          these fields.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        The first five chapters established how the patent system grew, which technologies fueled that expansion, how growth dynamics reshaped the portfolio, and how fields increasingly converge while maintaining unconcentrated market structures. The analysis now turns to the language of patents themselves, examining how the vocabulary of invention has evolved alongside these structural shifts.
        The shift from chemistry to digital technology is visible not only in formal classification codes but in the words inventors use to describe their work. The <Link href="/chapters/the-language-of-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> applies unsupervised text analysis to five decades of patent abstracts to uncover the latent thematic structure of US patenting.
      </Narrative>

      <DataNote>
        Technology classifications use the primary CPC section (sequence 0) for each patent
        and WIPO technology fields mapped from IPC codes. Technology half-life is computed as the time until 50% of cumulative forward citations are received, based on patents granted 1976-2010 with citations tracked through 2025. Market concentration (HHI) is computed within each CPC section by assignee market share in 5-year windows. Technology convergence measures the co-occurrence of CPC section pairs on multi-section patents by era. Grant lag is measured as the average days from application filing to patent grant by WIPO sector in 5-year periods.
      </DataNote>

      <RelatedChapters currentChapter={5} />
      <ChapterNavigation currentChapter={5} />
    </div>
  );
}
