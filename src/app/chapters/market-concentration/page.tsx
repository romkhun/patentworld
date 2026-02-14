'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWRankHeatmap } from '@/components/charts/PWRankHeatmap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { RankingTable } from '@/components/chapter/RankingTable';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import { CHART_COLORS } from '@/lib/colors';
import type {
  Concentration,
  DesignPatentTrend, DesignTopFiler,
  CompanyProfile, CorporateMortality,
} from '@/lib/types';

export default function MarketConcentration() {
  const { data: conc, loading: concL } = useChapterData<Concentration[]>('chapter3/concentration.json');
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[]; top_filers: DesignTopFiler[] }>('company/design_patents.json');
  const { data: profiles } = useChapterData<CompanyProfile[]>('company/company_profiles.json');
  const { data: mortality, loading: moL } = useChapterData<CorporateMortality>('company/corporate_mortality.json');

  /* Corporate mortality */
  const mortalityHeatmapData = useMemo(() => {
    if (!mortality) return [];
    const rows: { company: string; year: number; rank: number }[] = [];
    mortality.decades.forEach((dec: any) => {
      const yr = typeof dec.start_year === 'number' ? dec.start_year : parseInt(dec.decade, 10);
      dec.companies.forEach((c: any) => {
        rows.push({ company: c.company, year: yr, rank: c.rank });
      });
    });
    return rows;
  }, [mortality]);

  const continuousCount = mortality?.continuous_companies?.length ?? 0;
  const continuousNames = useMemo(() => {
    if (!mortality?.continuous_companies) return [];
    return mortality.continuous_companies.map((c: any) =>
      typeof c === 'string' ? c : c.company ?? String(c)
    );
  }, [mortality]);

  return (
    <div>
      <ChapterHeader
        number={10}
        title="Market Concentration"
        subtitle="Patenting concentration, design patents, and firm survival"
      />

      <KeyFindings>
        <li>The top 100 organizations consistently hold 32-39% of all corporate patents, a concentration ratio that has remained remarkably stable across five decades despite the entry of new organizations.</li>
        <li>Samsung (13,094), Nike (9,189), and LG (6,720) lead design patent filings, revealing how consumer electronics and fashion firms leverage ornamental innovation as a competitive tool.</li>
        <li>Only 9 of 50 top patent filers survived all five decades in the top rankings, an 18% cumulative survival rate that underscores the extraordinary volatility of innovation leadership.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The patent system exhibits persistent structural concentration: the top 100 organizations hold 32-39% of corporate patents, a ratio that has narrowed only modestly since the 2010s. Design patents add an important dimension, with Samsung (13,094), Nike (9,189), and LG (6,720) leading filings. Perhaps most strikingly, only 9 of 50 top patent filers have maintained a continuous top-50 presence across all five decades, revealing that sustained innovation leadership is exceptionally rare.
        </p>
      </aside>

      <Narrative>
        <p>
          The <Link href="/chapters/firm-rankings" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">previous chapter</Link> documented the cumulative rankings and output trajectories of leading patent-holding organizations. This chapter examines the structural features that underlie those rankings: the degree of concentration among elite organizations, the role of design patents as a distinct dimension of intellectual property strategy, and the question of how few firms manage to sustain their position at the top across multiple decades.
        </p>
        <p>
          These patterns reveal that while the specific organizations at the top change considerably over time, the structural concentration of the patent system itself remains remarkably stable, suggesting that scale-dependent barriers to large-volume patenting persist regardless of geography or technology era.
        </p>
      </Narrative>

      {/* ── Concentration ── */}

      <ChartContainer
        id="fig-market-concentration-concentration"
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

      {/* ── Design Patent Leadership ── */}

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
        id="fig-market-concentration-design-top-filers"
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

      {/* ── Corporate Mortality ── */}

      <SectionDivider label="Corporate Mortality" />

      <Narrative>
        <p>
          The persistence of corporate patent leadership over extended time horizons represents
          a central question in the study of innovation. The rank heatmap below tracks corporate
          presence in the top patent rankings across five decades, revealing the
          considerable <StatCallout value="volatility of innovation leadership" />.
        </p>
      </Narrative>

      {mortality && (
        <div className="my-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Continuous Survivors</div>
            <div className="mt-1 text-2xl font-bold">{continuousCount}</div>
            <div className="text-xs text-muted-foreground">companies in top 50 every decade</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Decades Tracked</div>
            <div className="mt-1 text-2xl font-bold">{mortality.decades.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Survival Rates</div>
            <div className="mt-1 space-y-1">
              {(Array.isArray(mortality.survival_rates) ? mortality.survival_rates : []).slice(0, 3).map((sr: any, i: number) => (
                <div key={i} className="text-xs">
                  <span className="text-muted-foreground">{sr.from_decade}&rarr;{sr.to_decade}:</span>{' '}
                  <span className="font-mono font-medium">{sr.survival_rate?.toFixed(0) ?? '?'}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ChartContainer
        id="fig-market-concentration-mortality-heatmap"
        subtitle="Rank heatmap of top patent-holding companies across five decades, with darker cells indicating higher rank (more patents)."
        title="Only 9 of 50 Top Patent Filers Survived All 5 Decades, an 18% Cumulative Survival Rate"
        caption="Rank heatmap showing how top patent-holding companies shifted in ranking across decades. Darker cells indicate higher rank (more patents). The most notable pattern is the high degree of turnover, with most firms that dominated one era being displaced by new entrants in the next."
        insight="The high turnover in top rankings demonstrates that sustained innovation leadership is exceptionally rare. Most firms that dominated one era were displaced by new entrants in the subsequent decade."
        loading={moL}
        height={900}
      >
        {mortalityHeatmapData.length > 0 ? (
          <PWRankHeatmap
            data={mortalityHeatmapData}
            nameKey="company"
            yearKey="year"
            rankKey="rank"
            maxRank={50}
            yearInterval={10}
          />
        ) : <div />}
      </ChartContainer>

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

      <RankingTable
        title="View top companies by total patents as a data table"
        headers={['Company', 'Total Patents', 'Peak Year']}
        rows={(profiles ?? [])
          .map(p => ({
            company: p.company,
            total: p.years.reduce((s, y) => s + y.patent_count, 0),
            peak: p.years.reduce((best, y) => y.patent_count > best.patent_count ? y : best, p.years[0])?.year ?? 0,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 15)
          .map(d => [d.company, d.total, d.peak])}
        caption="Top 15 companies by total utility patents from company profiles dataset. Source: PatentsView."
      />

      <KeyInsight>
        <p>
          Innovation leadership appears to be considerably more volatile than commonly assumed. Only a small number of
          companies have maintained a top-50 patent ranking across all five decades. The remainder
          have either risen, fallen, or been replaced entirely, a pattern that underscores
          the persistent pace of technological change and the difficulty of sustaining corporate
          R&amp;D investment over extended time horizons.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          Market concentration analysis reveals a paradox at the heart of the patent system: while the specific organizations at the top turn over considerably from decade to decade, the structural concentration of patenting among elite organizations has remained remarkably stable. Design patents add an important dimension, showing that firms such as Samsung and Nike pursue ornamental innovation alongside utility patents as part of a comprehensive intellectual property strategy. The rarity of sustained leadership -- only 9 of 50 top filers surviving all five decades -- underscores how difficult it is for any single organization to remain at the frontier of technological change. The <Link href="/chapters/firm-citation-quality" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> examines the citation quality and innovation impact of these leading firms in greater detail.
        </p>
      </Narrative>

      <DataNote>
        Concentration ratios are computed from disambiguated assignee data using the primary assignee
        (sequence 0) per patent. The top 10, 50, and 100 shares are calculated as the fraction of
        all corporate patents held by those organizations per 5-year period. Design patent rankings
        use total design patents granted across all years. Corporate mortality tracks presence in
        the top 50 patent filers per decade (1976-2025). Survival rates measure the fraction of
        top-50 firms in one decade that remain in the top 50 in the subsequent decade. Company
        profiles are constructed from PatentsView data for the top 100 patent filers by total
        utility patent count, 1976-2025.
      </DataNote>

      <RelatedChapters currentChapter={10} />
      <ChapterNavigation currentChapter={10} />
    </div>
  );
}
