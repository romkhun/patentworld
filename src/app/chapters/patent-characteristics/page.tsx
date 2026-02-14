'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS, CPC_SECTION_COLORS, WIPO_SECTOR_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type {
  ClaimsBySection,
  QualityBySector,
  CompositeQualityIndex,
  SelfCitationBySection,
} from '@/lib/types';

export default function PatentCharacteristics() {
  // Claims by CPC section (from Innovation Dynamics)
  const { data: claimsData, loading: clL } = useChapterData<{ by_section: ClaimsBySection[] }>('company/claims_analysis.json');

  // Quality by WIPO sector (from Patent Quality)
  const { data: bySector, loading: bsL } = useChapterData<QualityBySector[]>('chapter9/quality_by_sector.json');

  // Composite quality index by CPC section (from Patent Quality)
  const { data: compositeQuality, loading: cqL } = useChapterData<CompositeQualityIndex[]>('chapter9/composite_quality_index.json');

  // Self-citation by CPC section (from Patent Quality)
  const { data: selfCiteSec } = useChapterData<SelfCitationBySection[]>('chapter9/self_citation_by_section.json');

  // ── Pivot: Claims by Section ──
  const claimsSectionPivot = useMemo(() => {
    if (!claimsData?.by_section) return { data: [] as any[], decades: [] as string[] };
    const decades = [...new Set(claimsData.by_section.map(d => d.decade))].sort();
    const sections = [...new Set(claimsData.by_section.map(d => d.section))].sort();
    const pivoted = decades.map(decade => {
      const row: Record<string, any> = { decade };
      claimsData.by_section.filter(d => d.decade === decade).forEach(d => {
        row[d.section] = d.median_claims;
      });
      return row;
    });
    return { data: pivoted, decades: sections };
  }, [claimsData]);

  // ── Pivot: Quality by WIPO Sector ──
  const { sectorPivot, sectorNames } = useMemo(() => {
    if (!bySector) return { sectorPivot: [], sectorNames: [] };
    const sectors = [...new Set(bySector.map((d) => d.sector))];
    const periods = [...new Set(bySector.map((d) => d.period))].sort();
    const pivoted = periods.map((period) => {
      const row: any = { period };
      bySector.filter((d) => d.period === period).forEach((d) => {
        row[d.sector] = d.avg_claims;
      });
      return row;
    });
    return { sectorPivot: pivoted, sectorNames: sectors };
  }, [bySector]);

  // ── Pivot: Composite Quality Index ──
  const { compositeQualityPivot, compositeQualitySections } = useMemo(() => {
    if (!compositeQuality) return { compositeQualityPivot: [], compositeQualitySections: [] };
    const sections = [...new Set(compositeQuality.map(d => d.section))].sort();
    const years = [...new Set(compositeQuality.map(d => d.year))].sort((a, b) => a - b);
    const pivoted = years.map(year => {
      const row: Record<string, any> = { year };
      compositeQuality.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.composite_index;
      });
      return row;
    });
    return { compositeQualityPivot: pivoted, compositeQualitySections: sections };
  }, [compositeQuality]);

  return (
    <div>
      <ChapterHeader
        number={31}
        title="Patent Characteristics"
        subtitle="Claim complexity and composite quality across technology areas"
      />

      <KeyFindings>
        <li>Claims increased across all technology areas, with Physics (G) leading at a median of 19 and Electricity (H) at 18 in the 2020s.</li>
        <li>Instruments patents peaked at 19.8 average claims (2001-2005) while Mechanical Engineering rose from 9.3 to 14.9, reflecting broad increases across sectors.</li>
        <li>Composite quality index indicates Chemistry maintaining the highest scores, with Human Necessities (A) rising to second and Electronics (H) and Physics (G) moving from negative to positive Z-scores since the 1990s.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Patent characteristics vary substantially across technology fields. Claim counts have increased across all CPC sections, with Physics leading at 19 median claims and instruments patents peaking at 19.8 average claims. A composite Z-score index aggregating citations, claims, scope, and grant speed shows Chemistry patents consistently scoring highest, while Electronics and Physics rose from negative to positive composite territory since the 1990s.
        </p>
      </aside>

      <Narrative>
        <p>
          The characteristics of patents -- their claim complexity, quality indicators, and
          self-citation patterns -- vary systematically across technology fields. These differences
          reflect both the underlying nature of innovation in each domain and the evolving strategies
          that patent applicants employ across fields.
        </p>
        <p>
          This chapter examines claim counts by <GlossaryTooltip term="CPC">CPC</GlossaryTooltip> section
          and <GlossaryTooltip term="WIPO">WIPO</GlossaryTooltip> technology sector, a composite quality
          index that aggregates multiple quality dimensions, and self-citation patterns that reveal how
          firms accumulate knowledge within specific technology areas. Together, these metrics provide a
          comprehensive view of how patent characteristics differ across the major technology domains.
        </p>
      </Narrative>

      {/* ── Section 1: Claims by Technology Area ── */}
      <SectionDivider label="Claims by Technology Area" />

      <Narrative>
        <p>
          The number of claims in a patent defines the scope of legal protection. Trends in
          claim counts by technology area reveal how patent strategy has evolved across fields,
          with increases across all technology areas reflecting a broad trend toward more detailed patent
          drafting regardless of domain.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-sector-dynamics-claims-by-section"
        subtitle="Median claim count by CPC technology section and decade, showing increases in patent drafting complexity across fields."
        title="Claim Counts Have Increased Across All Technology Areas, with Physics (G) Leading at a Median of 19 and Electricity (H) at 18 in the 2020s"
        caption="This chart displays the median claim count by CPC section and decade. Claim counts have increased across all technology areas, with the range widening from 1 to 4 across decades, reflecting diverging patent drafting complexity across fields."
        loading={clL}
      >
        {claimsSectionPivot.data.length > 0 ? (
          <PWLineChart
            data={claimsSectionPivot.data}
            xKey="decade"
            lines={claimsSectionPivot.decades.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Median Claims"
          />
        ) : <div />}
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent complexity, as measured by average claims per patent, varies considerably
          across technology sectors. Electrical engineering and instruments patents tend to have the most
          claims in recent decades, reflecting the detailed and layered claim structures characteristic of
          software and electronics inventions. The increase in claim counts across all sectors in recent decades
          reflects a broad trend toward more complex patent drafting strategies, though the range
          across sectors has widened rather than narrowed.
        </p>
      </KeyInsight>

      {/* ── Section 2: Quality Across Sectors (WIPO) ── */}
      <SectionDivider label="Quality Across Sectors" />

      <ChartContainer
        id="fig-sector-dynamics-quality-by-sector"
        subtitle="Average number of claims per patent by WIPO technology sector, computed in 5-year periods to illustrate cross-sector trends."
        title="Instruments Patents Peaked at 19.8 Average Claims (2001-2005) While Mechanical Engineering Rose from 9.3 to 14.9, Reflecting Broad Increases Across Sectors"
        caption="This chart displays the average claims per patent by WIPO sector over 5-year periods. Electrical engineering and instruments patents tend to have the most claims in recent decades. Claim counts have increased across all sectors, though the range has widened over time."
        loading={bsL}
        insight="Electrical engineering patents tend to exhibit higher citation impact per patent than Chemistry patents, a pattern consistent with rapid innovation cycles and dense citation networks in computing and electronics."
      >
        <PWLineChart
          data={sectorPivot}
          xKey="period"
          lines={sectorNames.map((name) => ({
            key: name,
            name,
            color: WIPO_SECTOR_COLORS[name] ?? CHART_COLORS[0],
          }))}
          yLabel="Average Claims Per Patent"
          yFormatter={(v) => v.toFixed(1)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Quality metrics vary substantially across technology sectors; electrical engineering
          patents tend to receive more citations per patent than Chemistry patents (e.g., 2016-2020: Electrical=5.20 vs. Chemistry=4.37).
          Patent complexity, as measured by average claims per patent, varies considerably
          across WIPO technology sectors, with instruments and electrical engineering patents
          exhibiting the highest claim counts in recent periods.
        </p>
      </KeyInsight>

      {/* ── Section 3: Composite Quality Index ── */}
      <SectionDivider label="Composite Quality Index" />

      <Narrative>
        <p>
          Individual quality metrics each capture one dimension of patent value. Combining
          forward citations, claims count, technology scope, and grant speed into a single
          Z-score normalized composite index enables tracking of overall patent quality trends
          across technology areas. Positive values indicate above-average quality; negative
          values indicate below-average quality.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-sector-dynamics-composite-index"
        subtitle="Z-score normalized composite of forward citations, claims, scope, and grant speed by CPC section. Values above 0 indicate above-average quality."
        title="Chemistry (C) Patents Maintain the Highest Composite Quality Scores, with Human Necessities (A) Rising to Second in Recent Years, While Electronics (H) and Physics (G) Rose from Negative to Positive Z-Scores Since the 1990s"
        caption="This chart displays a Z-score normalized composite index of forward citations (5-year window), claims, scope, and grant speed by CPC section. Values above 0 indicate above-average quality. Chemistry (C) patents consistently score highest, with Human Necessities (A) rising to second in recent years, whereas Electronics (H) and Physics (G) have improved from negative to positive composite scores since the 1990s."
        loading={cqL}
        insight="Composite quality has improved across most technology areas since the 1990s, with Chemistry maintaining the highest scores throughout and Human Necessities rising to second in recent years."
      >
        {compositeQualityPivot.length > 0 && (
          <PWLineChart
            data={compositeQualityPivot}
            xKey="year"
            lines={compositeQualitySections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Composite Index (Z-score)"
            yFormatter={(v: number) => v.toFixed(2)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2014] })}
          />
        )}
      </ChartContainer>

      <KeyInsight>
        <p>
          The composite quality index reveals diverging trajectories across technology areas.
          Chemistry patents have maintained consistently the highest composite
          quality, driven by strong forward citation rates and broad scope, with Human Necessities rising to second in recent years. Electronics and
          Physics patenting has exhibited improving average quality since the 1990s, with composite
          scores rising from negative to positive territory. The overall upward trend since
          the 1990s suggests that patent quality has improved alongside growing volume.
        </p>
      </KeyInsight>

      {/* ── Section 4: Self-Citation by Section ── */}
      <SectionDivider label="Self-Citation by Technology Area" />

      <Narrative>
        <p>
          Self-citation patterns reveal meaningful differences in how sectors accumulate
          knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation
          rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s
          previous work.
        </p>
      </Narrative>

      {selfCiteSec && (
        <div className="my-12 overflow-x-auto">
          <h3 className="mb-4 font-sans text-base font-semibold tracking-tight text-muted-foreground">
            Self-Citation Rates by CPC Section and Decade
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 font-medium">Decade</th>
                <th className="py-2 pr-4 text-right font-medium">Total Citations</th>
                <th className="py-2 pr-4 text-right font-medium">Self-Citations</th>
                <th className="py-2 text-right font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {selfCiteSec.map((d, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 font-medium">{d.section}</td>
                  <td className="py-1.5 pr-4">{d.decade}s</td>
                  <td className="py-1.5 pr-4 text-right font-mono text-xs">{formatCompact(d.total_citations)}</td>
                  <td className="py-1.5 pr-4 text-right font-mono text-xs">{formatCompact(d.self_citations)}</td>
                  <td className="py-1.5 text-right font-mono text-xs">{d.self_cite_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            Self-citation rate = (self-citations / total citations) for patents in each CPC section and decade.
            A self-citation occurs when the citing and cited patents share the same primary assignee.
          </figcaption>
        </div>
      )}

      <KeyInsight>
        <p>
          Self-citation patterns reveal meaningful differences in how firms and sectors accumulate
          knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation
          rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s
          previous work. However, these rates may also signal strategic behavior, as firms cite their own
          patents to construct defensive thickets that may raise barriers to entry for competitors.
        </p>
      </KeyInsight>

      <Narrative>
        This chapter has demonstrated that patent characteristics are not uniform across technology fields. Claim complexity, composite quality, and self-citation patterns all vary systematically by sector, reflecting the underlying nature of innovation in each domain. These sector-specific patterns provide essential context for interpreting the <Link href="/chapters/3d-printing" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">deep-dive analyses</Link> that follow, where domain-specific metrics prove especially relevant for distinguishing genuine innovation from volume growth.
      </Narrative>

      <DataNote>
        Claims analysis uses the patent_num_claims field from g_patent for utility patents only, aggregated by CPC section and decade. Quality by WIPO sector uses average claims per patent computed in 5-year periods. The composite quality index combines Z-score normalized forward citations (5-year window), claims count, technology scope, and grant speed (inverted) by CPC section and year. Self-citation rates are computed as the fraction of backward citations directed to patents held by the same assignee, aggregated by CPC section and decade.
      </DataNote>

      <RelatedChapters currentChapter={31} />
      <ChapterNavigation currentChapter={31} />
    </div>
  );
}
