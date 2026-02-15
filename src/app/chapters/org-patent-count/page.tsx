'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { RankingTable } from '@/components/chapter/RankingTable';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import { PWSeriesSelector } from '@/components/charts/PWSeriesSelector';
import { CHART_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  TopAssignee, OrgOverTime, Concentration,
  DesignPatentTrend, DesignTopFiler,
  CorporateMortality,
} from '@/lib/types';

export default function OrgPatentCountChapter() {
  // ── Data hooks ──
  const { data: top, loading: topL } = useChapterData<TopAssignee[]>('chapter3/top_assignees.json');
  const { data: orgsTime, loading: orgL } = useChapterData<OrgOverTime[]>('chapter3/top_orgs_over_time.json');
  const { data: conc, loading: concL } = useChapterData<Concentration[]>('chapter3/concentration.json');
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[]; top_filers: DesignTopFiler[] }>('company/design_patents.json');
  const { data: mortality } = useChapterData<CorporateMortality>('company/corporate_mortality.json');

  const [selectedOrgSeries, setSelectedOrgSeries] = useState<Set<string>>(new Set());

  // ── Derived: cumulative utility patent rankings ──
  const topOrgs = useMemo(() => {
    if (!top) return [];
    return top.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [top]);

  const topOrgName = top?.[0]?.organization ? cleanOrgName(top[0].organization) : 'IBM';

  // ── Derived: annual output trajectories for top 10 ──
  const { orgOutputPivot, orgOutputNames } = useMemo(() => {
    if (!orgsTime) return { orgOutputPivot: [], orgOutputNames: [] };
    const totals = new Map<string, number>();
    orgsTime.forEach((d) => {
      totals.set(d.organization, (totals.get(d.organization) ?? 0) + d.count);
    });
    const top10 = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([org]) => org);
    const top10Clean = top10.map((org) => cleanOrgName(org));
    const years = [...new Set(orgsTime.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      orgsTime.filter((d) => d.year === year && top10.includes(d.organization))
        .forEach((d) => { row[cleanOrgName(d.organization)] = d.count; });
      return row;
    });
    if (top10Clean.length > 0 && selectedOrgSeries.size === 0) {
      setTimeout(() => setSelectedOrgSeries(new Set(top10Clean.slice(0, 5))), 0);
    }
    return { orgOutputPivot: pivoted, orgOutputNames: top10Clean };
  }, [orgsTime, selectedOrgSeries.size]);

  // ── Derived: companies in top 50 every decade ──
  const continuousNames = useMemo(() => {
    if (!mortality?.continuous_companies) return [];
    return mortality.continuous_companies.map((c: unknown) =>
      typeof c === 'string' ? c : (c as Record<string, string>).company ?? String(c)
    );
  }, [mortality]);

  return (
    <div>
      <ChapterHeader
        number={9}
        title="Organizational Patent Count"
        subtitle="Patent output rankings and trajectories of leading organizations"
      />

      <KeyFindings>
        <li>IBM leads with 161,888 cumulative utility patent grants, but Samsung trails by fewer than 4,000 patents and has surpassed IBM in annual output since 2007.</li>
        <li>Samsung (13,094), Nike (9,189), and LG (6,720) lead design patent filings, revealing how consumer electronics and fashion firms leverage ornamental innovation as a competitive tool.</li>
        <li>The top 100 organizations consistently hold 32-39% of all corporate patents, a concentration ratio that has remained remarkably stable across five decades despite the entry of new organizations.</li>
        <li>Samsung peaked at 9,716 annual grants in 2024, overtaking IBM which peaked at 9,257 in 2019, illustrating divergent corporate patent strategies.</li>
        <li>Only 9 of 50 top patent filers survived all five decades in the top rankings, an 18% cumulative survival rate that underscores the extraordinary volatility of innovation leadership.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          IBM leads all organizations with 161,888 cumulative patent grants, but Samsung has narrowed the gap to fewer than 4,000 patents. Design patents add an important dimension, with Samsung (13,094), Nike (9,189), and LG (6,720) leading filings. The top 100 organizations consistently hold 32-39% of corporate patents. Samsung peaked at 9,716 annual grants in 2024, reflecting the globalization of technology leadership. Perhaps most strikingly, only 9 of 50 top patent filers have maintained a continuous top-50 presence across all five decades, revealing that sustained innovation leadership is exceptionally rare.
        </p>
      </aside>

      <Narrative>
        <p>
          While the <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">previous chapter</Link> examined the system-level composition of patent assignees, this chapter focuses on the individual organizations that drive these aggregate patterns. The cumulative rankings, annual trajectories, and sequential transitions in leadership reveal how corporate patent strategies have evolved over five decades.
        </p>
        <p>
          The rankings are dominated by technology firms and Asian corporations. Organizations such as Samsung, Canon, and LG have risen substantially since the 1990s, challenging the traditional dominance of US-based firms such as {topOrgName} and General Electric. Asian firms now account for over half of the top 25 patent holders.
        </p>
      </Narrative>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION A: STATIC RANKINGS
          ══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Static Rankings" />

      {/* ── A.i: Utility Patent Rankings ── */}

      <ChartContainer
        id="fig-org-patent-count-top-assignees"
        title="IBM Leads With 161,888 Cumulative Grants, but Samsung Trails by Fewer Than 4,000 Patents"
        subtitle="Top organizations ranked by cumulative utility patent grants, 1976-2025"
        caption="Organizations ranked by total utility patents granted, 1976-2025. Japanese and Korean firms occupy a majority of the top positions alongside US-based technology firms."
        insight="The ranking demonstrates the global nature of US patent activity. Japanese and Korean firms compete directly with US-based technology firms for the leading positions, reflecting the internationalization of technology-intensive industries."
        loading={topL}
        height={1400}
      >
        <PWBarChart
          data={topOrgs}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Total Patents', color: CHART_COLORS[0] }]}
          layout="vertical"
        />
      </ChartContainer>

      <RankingTable
        title="View top assignees as a data table"
        headers={['Organization', 'Total Patents']}
        rows={(top ?? []).slice(0, 15).map(d => [cleanOrgName(d.organization), d.total_patents])}
        caption="Top 15 organizations by cumulative utility patent grants, 1976-2025. Source: PatentsView."
      />

      <Narrative>
        <p>
          The ranking is dominated by technology firms and Asian corporations.
          Organizations such as Samsung, Canon, and LG have risen substantially since the 1990s,
          challenging the traditional dominance of US-based firms such as IBM and General Electric.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Asian firms account for over half of the top 25 patent holders. Samsung first surpassed
          IBM in annual patent grants in 2007, a shift that reflects the globalization of technology
          leadership and the strategic importance of patent portfolios in international competition.
        </p>
      </KeyInsight>

      {/* ── A.ii: Design Patent Rankings ── */}

      <SectionDivider label="Design Patent Leadership" />

      <Narrative>
        <p>
          Beyond utility patents, <GlossaryTooltip term="design patent">design patents</GlossaryTooltip> have
          become an increasingly important element of corporate intellectual property strategy.
          The organizations that lead in design patent filings reveal how firms leverage ornamental
          and aesthetic innovation as a competitive tool, particularly in consumer electronics,
          automotive, and fashion industries where product appearance is a key differentiator.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-org-patent-count-design-top-filers"
        subtitle="Organizations ranked by total design patents granted, showing which firms lead in design-driven intellectual property."
        title="Samsung (13,094), Nike (9,189), and LG (6,720) Lead Design Patent Filings Among Consumer Electronics and Automotive Firms"
        caption="This chart displays the organizations with the most design patents granted across all years. Consumer electronics manufacturers and automotive companies account for the majority of top design patent filers."
        loading={deL}
        height={500}
      >
        {designData?.top_filers ? (
          <PWBarChart
            data={designData.top_filers.slice(0, 20)}
            xKey="company"
            bars={[{ key: 'design_patents', name: 'Design Patents', color: CHART_COLORS[3] }]}
            layout="vertical"
          />
        ) : <div />}
      </ChartContainer>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION B: DYNAMIC TRENDS
          ══════════════════════════════════════════════════════════════════════ */}

      <SectionDivider label="Dynamic Trends" />

      {/* ── B.i: Concentration Over Time ── */}

      <ChartContainer
        id="fig-org-patent-count-concentration"
        title="The Top 100 Organizations Hold 32-39% of Corporate Patents, a Share That Has Narrowed Since the 2010s"
        subtitle="Share of corporate patents held by the top 10, 50, and 100 organizations, measured by 5-year period, 1976-2025"
        caption="Share of all corporate patents held by the top 10, 50, and 100 organizations, by 5-year period. The relative stability of these concentration ratios across decades suggests persistent structural features of the patent system."
        insight="Despite the entry of new organizations, the patent landscape remains dominated by large, well-resourced entities that invest systematically in R&amp;D. The stability of concentration ratios is consistent with the presence of substantial barriers to large-scale patenting."
        loading={concL}
      >
        <PWLineChart
          data={conc ?? []}
          xKey="period"
          lines={[
            { key: 'top10_share', name: 'Top 10', color: CHART_COLORS[0] },
            { key: 'top50_share', name: 'Top 50', color: CHART_COLORS[1], dashPattern: '8 4' },
            { key: 'top100_share', name: 'Top 100', color: CHART_COLORS[2], dashPattern: '2 4' },
          ]}
          yLabel="Share (%)"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Patent concentration has remained relatively stable: the top 100 organizations consistently
          hold roughly a third of all corporate patents. This pattern suggests that while new entrants emerge,
          the patent system remains dominated by large, well-resourced entities that invest substantially
          in R&amp;D.
        </p>
      </KeyInsight>

      {/* ── B.ii: Annual Output Trajectories ── */}

      {orgOutputPivot.length > 0 && (
        <>
          <PWSeriesSelector
            items={orgOutputNames.map((name, i) => ({
              key: name,
              name: name.length > 25 ? name.slice(0, 22) + '...' : name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            selected={selectedOrgSeries}
            onChange={setSelectedOrgSeries}
            defaultCount={5}
          />
          <ChartContainer
            id="fig-org-patent-count-org-output-trends"
            title="Samsung Peaked at 9,716 Annual Grants in 2024, Overtaking IBM Which Peaked at 9,257 in 2019"
            subtitle="Annual patent grants for the 10 historically top-ranked organizations, with selectable series, 1976-2025"
            caption="Annual patent grants for the 10 historically top-ranked organizations, 1976-2025. The data reveal divergent trajectories, with certain firms exhibiting sustained growth and others demonstrating gradual decline over the five-decade period."
            insight="The divergence between IBM's declining trajectory and Samsung's sustained ascent illustrates how corporate patent strategies differ. IBM shifted toward services while Samsung invested extensively in hardware and electronics R&amp;D."
            loading={orgL}
            interactive
            statusText={`Showing ${selectedOrgSeries.size} of ${orgOutputNames.length} organizations`}
          >
            <PWLineChart
              data={orgOutputPivot}
              xKey="year"
              lines={orgOutputNames
                .filter((name) => selectedOrgSeries.has(name))
                .map((name) => ({
                  key: name,
                  name: name.length > 25 ? name.slice(0, 22) + '...' : name,
                  color: CHART_COLORS[orgOutputNames.indexOf(name) % CHART_COLORS.length],
                }))}
              yLabel="Number of Patents"
            />
          </ChartContainer>
        </>
      )}

      <KeyInsight>
        <p>
          The patent output trajectories of leading organizations reveal substantial divergence
          over time. While IBM maintained consistently high output for decades before declining,
          Samsung and Canon demonstrated sustained growth trajectories from the 1980s onward. These
          patterns reflect fundamental differences in corporate R&amp;D strategies, from IBM&apos;s shift
          toward services to Samsung&apos;s extensive technology diversification.
        </p>
      </KeyInsight>

      {/* ── B.iii: Companies in Top 50 Every Decade ── */}

      {continuousNames.length > 0 && (
        <div className="max-w-2xl mx-auto my-6">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">
            Companies in the Top 50 Every Decade
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {continuousNames.map((name: string) => (
              <span key={name} className="rounded-full border bg-card px-3 py-1 text-xs font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <KeyInsight>
        <p>
          Innovation leadership appears to be considerably more volatile than commonly assumed. Only a small number of
          companies have maintained a top-50 patent ranking across all five decades. The remainder
          have either risen, fallen, or been replaced entirely, a pattern that underscores
          the persistent pace of technological change and the difficulty of sustaining corporate
          R&amp;D investment over extended time horizons.
        </p>
      </KeyInsight>

      {/* ══════════════════════════════════════════════════════════════════════
          CLOSING
          ══════════════════════════════════════════════════════════════════════ */}

      <Narrative>
        <p>
          The organizational patent count reveals a system in which leadership is dynamic and contested. IBM&apos;s cumulative dominance is narrowing as Samsung closes the gap, while design patent rankings add a distinct dimension where consumer-facing firms such as Nike and LG emerge alongside electronics giants. The structural concentration of patenting among elite organizations has remained remarkably stable at 32-39%, suggesting that scale-dependent barriers to large-volume patenting persist regardless of geography or technology era. Perhaps most strikingly, only 9 of 50 top filers have maintained their position across all five decades, underscoring how difficult it is for any single organization to remain at the frontier of technological change. The <Link href="/chapters/org-patent-quality" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> examines the citation quality and innovation impact of these leading firms in greater detail.
        </p>
      </Narrative>

      <DataNote>
        Assignee data employ disambiguated identities from PatentsView. The primary assignee
        (sequence 0) is used to avoid double-counting patents with multiple assignees.
        Rankings are based on cumulative utility patent grants, 1976-2025. Concentration ratios
        are computed as the fraction of all corporate patents held by the top 10, 50, and 100
        organizations per 5-year period. Design patent rankings use total design patents granted
        across all years. Corporate mortality tracks presence in the top 50 patent filers per decade
        (1976-2025). Organization names are cleaned and standardized for display purposes.
      </DataNote>

      <RelatedChapters currentChapter={9} />
      <ChapterNavigation currentChapter={9} />
    </div>
  );
}
