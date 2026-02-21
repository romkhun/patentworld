'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { CHART_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { DescriptiveGapNote } from '@/components/chapter/DescriptiveGapNote';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import type { CountryPerYear, QualityByCountry } from '@/lib/types';

export default function GeoInternationalChapter() {
  /* ── Data loading ── */
  const { data: countriesPerYear, loading: cpyL } = useChapterData<CountryPerYear[]>('chapter4/countries_per_year.json');
  const { data: qualByCountry, loading: qcL } = useChapterData<QualityByCountry[]>('chapter9/quality_by_country.json');
  const { data: qualByDomIntl, loading: qdiL } = useChapterData<any[]>('computed/quality_by_domestic_intl.json');
  const { data: qualByCountryTs, loading: qctL } = useChapterData<any[]>('computed/quality_by_country.json');
  const { data: topCountries } = useChapterData<string[]>('computed/top_countries.json');

  // Analysis 32, 33: Priority country composition and PCT usage
  const { data: priorityCountryComp, loading: pccL } = useChapterData<any[]>('chapter19/priority_country_composition.json');
  const { data: pctShareByCountry, loading: pctL } = useChapterData<any[]>('chapter19/pct_share_by_country.json');

  // Global innovation clusters (ranked cities by patent output)
  const { data: innovationClusters, loading: clL } = useChapterData<any[]>('chapter18/innovation_clusters.json');

  /* ── Pivot helper: reshape [{year, group, metric}] -> [{year, group1: val, group2: val}] ── */
  const pivotData = (raw: any[] | null, metric: string) => {
    if (!raw) return [];
    const byYear: Record<number, any> = {};
    for (const r of raw) {
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.group] = r[metric];
    }
    return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
  };

  /* ── Country-level chart helpers ── */
  const topClustersChart = useMemo(() => {
    if (!innovationClusters) return [];
    return innovationClusters.slice(0, 30).map((d: any) => ({
      ...d,
      label: d.location,
    }));
  }, [innovationClusters]);

  const countryColors = [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2], CHART_COLORS[3], CHART_COLORS[4]];
  const topCountriesForChart = topCountries?.slice(0, 5) ?? [];
  const countryLines = topCountriesForChart.map((c: string, i: number) => ({ key: c, name: c, color: countryColors[i] }));

  // Citation truncation normalization for forward-citation charts
  const domIntlNorm = useCitationNormalization({
    data: qualByDomIntl,
    xKey: 'year',
    citationKeys: ['avg_forward_citations'],
    yLabel: 'Average Forward Citations',
  });
  const countryNorm = useCitationNormalization({
    data: qualByCountryTs,
    xKey: 'year',
    citationKeys: ['avg_forward_citations'],
    yLabel: 'Average Forward Citations',
  });

  /* ── Country filing trends: pivot top countries into line-chart format ── */
  const { countryTimePivot, countryTimeNames } = useMemo(() => {
    if (!countriesPerYear) return { countryTimePivot: [], countryTimeNames: [] };
    const totals: Record<string, number> = {};
    countriesPerYear.forEach((d) => { totals[d.country] = (totals[d.country] || 0) + d.count; });
    const topCountryNames = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([c]) => c);
    const years = [...new Set(countriesPerYear.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, number> = { year };
      countriesPerYear
        .filter((d) => d.year === year && topCountryNames.includes(d.country))
        .forEach((d) => { row[d.country] = d.count; });
      return row;
    });
    return { countryTimePivot: pivoted, countryTimeNames: topCountryNames };
  }, [countriesPerYear]);

  /* ── Quality versus Quantity by Country: latest decade ── */
  const latestDecadeCountry = useMemo(() => {
    if (!qualByCountry) return [];
    const maxDecade = Math.max(...qualByCountry.map(d => d.decade));
    return qualByCountry
      .filter(d => d.decade === maxDecade)
      .sort((a, b) => b.avg_claims - a.avg_claims)
      .slice(0, 15);
  }, [qualByCountry]);

  /* ── Analysis 32: Priority Country Composition pivot ── */
  const { priorityPivot, priorityCountryNames } = useMemo(() => {
    if (!priorityCountryComp) return { priorityPivot: [], priorityCountryNames: [] };
    const countryTotals: Record<string, number> = {};
    priorityCountryComp.forEach((d: any) => {
      countryTotals[d.priority_country] = (countryTotals[d.priority_country] || 0) + d.count;
    });
    const topPriorityCountries = Object.entries(countryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([c]) => c);
    const years = [...new Set(priorityCountryComp.map((d: any) => d.year))].sort((a: number, b: number) => a - b);
    const pivoted = years.map((year: number) => {
      const row: Record<string, number> = { year };
      priorityCountryComp
        .filter((d: any) => d.year === year && topPriorityCountries.includes(d.priority_country))
        .forEach((d: any) => { row[d.priority_country] = d.count; });
      return row;
    });
    return { priorityPivot: pivoted, priorityCountryNames: topPriorityCountries };
  }, [priorityCountryComp]);

  /* ── Analysis 33: PCT Share by Country pivot ── */
  const { pctPivot, pctCountryNames } = useMemo(() => {
    if (!pctShareByCountry) return { pctPivot: [], pctCountryNames: [] };
    const countries = [...new Set(pctShareByCountry.map((d: any) => d.country))];
    const years = [...new Set(pctShareByCountry.map((d: any) => d.year))].sort((a: number, b: number) => a - b);
    const pivoted = years.map((year: number) => {
      const row: Record<string, number> = { year };
      pctShareByCountry
        .filter((d: any) => d.year === year)
        .forEach((d: any) => { row[d.country] = d.pct_share; });
      return row;
    });
    return { pctPivot: pivoted, pctCountryNames: countries };
  }, [pctShareByCountry]);

  return (
    <div>
      <ChapterHeader
        number={19}
        title="International Geography"
        subtitle="Cross-border filing patterns and country-level quality metrics"
      />
      <MeasurementSidebar slug="geo-international" />

      <KeyFindings>
        <li>Japan leads foreign patent filings with 1.45 million US patents, while China grew from 299 filings in 2000 to 30,695 in 2024, reflecting a fundamental shift in global patent filing activity as measured by USPTO grants.</li>
        <li>The United States leads with approximately 164,000 patents granted cumulatively during the 2020s (by primary assignee country, summed across 2020–2024), averaging roughly 33,000 per year, with 18.4 average claims per patent, while countries with rapidly growing patent volumes tend to exhibit lower average claim counts, a pattern observed across several fast-growing origins that may reflect differences in patent drafting conventions or technology field composition.</li>
        <li>US-domestic patents and international patents differ systematically in quality indicators, reflecting differences in institutional contexts, research traditions, and strategic filing behavior.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Successive waves of foreign filings from Japan, South Korea, and China have reshaped the composition of the US patent system. Japan dominates foreign filings with 1.45 million US patents, while China&apos;s growth from 299 filings in 2000 to 30,695 in 2024 represents a substantial shift in the international composition of US patent filings. Countries with smaller portfolios occasionally achieve higher average claim counts, while countries with rapidly growing patent volumes tend to exhibit lower average claim counts, a pattern that may reflect different patent drafting conventions, technology field composition, or examination practices.
        </p>
      </aside>

      <Narrative>
        <p>
          The domestic concentration documented in <Link href="/chapters/geo-domestic/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Domestic Geography</Link> is paralleled by a transformation in the international origins of US patent filings. Successive waves of foreign filings from Japan, South Korea, and more recently China have reshaped the composition of the US patent system, while the relationship between patent volume and quality varies substantially across countries.
        </p>
        <p>
          This chapter examines the international dimension of innovation geography through three lenses: how domestic and international patents may differ in quality indicators, how patent quality and quantity relate across countries, and how country-level filing trends reveal the evolving composition of foreign patent activity in the US system.
        </p>
      </Narrative>

      {/* ── Section A: Domestic versus International Quality ── */}
      <SectionDivider label="Domestic versus International Patent Quality" />
      <Narrative>
        <p>
          US-domestic patents (where all listed inventors reside in the United States) and international patents (with at least one non-US inventor) differ systematically in quality indicators, reflecting differences in institutional contexts, research traditions, and strategic filing behavior.
        </p>
      </Narrative>
      {/* A.i — Forward Citations */}
      <ChartContainer
        id="fig-geo-intl-dom-fwd-citations"
        title="Domestic Patents Average 12.9 Forward Citations versus 5.8 for International-Origin in 2015"
        subtitle="Average forward citations per patent by domestic versus international inventor teams, 1976–2025"
        caption="Average forward citations per patent comparing domestic and international-origin patents, 1976–2025. The 2015 cohort is used for the headline comparison because recent years suffer from citation truncation. Data: PatentsView."
        loading={qdiL}
        height={400}
        controls={domIntlNorm.controls}
      >
        <PWLineChart
          data={pivotData(domIntlNorm.data, 'avg_forward_citations')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel={domIntlNorm.yLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      {/* A.ii — Claim Count */}
      <ChartContainer
        id="fig-geo-intl-dom-claims"
        title="Domestic-Origin Patents Average 16.6 Claims versus 13.4 for International-Origin in 2024"
        subtitle="Average number of claims per patent by domestic versus international inventor teams, 1976–2025"
        caption="Average number of claims per patent comparing domestic and international-origin patents, 1976–2024. Domestic patents have consistently contained more claims, with the gap widening since the mid-1990s. Data: PatentsView."
        loading={qdiL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByDomIntl, 'avg_num_claims')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Claims"
        />
      </ChartContainer>

      {/* A.iii — Scope */}
      <ChartContainer
        id="fig-geo-intl-dom-scope"
        title="Domestic Patents Span 2.47 CPC Subclasses versus 2.36 for International-Origin in 2024"
        subtitle="Average patent scope (CPC subclass count) by domestic versus international inventor teams, 1976–2025"
        caption="Average number of distinct CPC subclasses per patent comparing domestic and international-origin patents, 1976–2024. Both groups have seen scope rise steadily since the late 1990s. Data: PatentsView."
        loading={qdiL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByDomIntl, 'avg_scope')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel="Average CPC Subclasses"
        />
      </ChartContainer>

      {/* A.iv — Originality */}
      <ChartContainer
        id="fig-geo-intl-dom-originality"
        title="Domestic Patents Score 0.236 on Originality versus 0.165 for International-Origin in 2024"
        subtitle="Average originality index by domestic versus international inventor teams, 1976–2025"
        caption="Average originality index per patent comparing domestic and international-origin patents, 1976–2024. Higher values indicate citations drawn from a wider range of technology classes. Data: PatentsView."
        loading={qdiL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByDomIntl, 'avg_originality')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Originality Index"
        />
      </ChartContainer>

      {/* A.v — Generality */}
      <ChartContainer
        id="fig-geo-intl-dom-generality"
        title="Domestic Patents Score 0.045 on Generality versus 0.024 for International-Origin in 2024"
        subtitle="Average generality index by domestic versus international inventor teams, 1976–2025"
        caption="Average generality index per patent comparing domestic and international-origin patents, 1976–2024. Higher values indicate the patent is cited by a broader range of downstream technology fields. Data: PatentsView."
        loading={qdiL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByDomIntl, 'avg_generality')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Generality Index"
        />
      </ChartContainer>

      {/* A.vi — Self-Citation Rate */}
      <ChartContainer
        id="fig-geo-intl-dom-self-citation"
        title="Domestic Patents Self-Cite at 13.2% versus 12.4% for International-Origin in 2024, After Decades of International Leading"
        subtitle="Average self-citation rate by domestic versus international inventor teams, 1976–2025"
        caption="Average self-citation rate per patent comparing domestic and international-origin patents, 1976–2024. International teams exhibited higher self-citation rates through most of the period, but the rates have converged in recent years. Data: PatentsView."
        loading={qdiL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByDomIntl, 'avg_self_citation_rate')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Self-Citation Rate"
          yFormatter={(v) => `${((v as number) * 100).toFixed(1)}%`}
        />
      </ChartContainer>

      {/* A.vii — Grant Lag */}
      <ChartContainer
        id="fig-geo-intl-dom-grant-lag"
        title="International Patents Wait 1,021 Days for Grant versus 929 Days for Domestic in 2024"
        subtitle="Average grant lag in days by domestic versus international inventor teams, 1976–2025"
        caption="Average grant lag (filing to issue, in days) comparing domestic and international-origin patents, 1976–2024. International patents consistently face longer examination times, reflecting cross-border filing complexity. Data: PatentsView."
        loading={qdiL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByDomIntl, 'avg_grant_lag_days')}
          xKey="year"
          lines={[
            { key: 'domestic', name: 'Domestic Teams', color: CHART_COLORS[0] },
            { key: 'international', name: 'International Teams', color: CHART_COLORS[1] },
          ]}
          yLabel="Average Grant Lag (days)"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The comparison of domestic and international patents across multiple quality dimensions illuminates the extent to which the growing internationalization of the US patent system has affected the distribution of patent quality. These patterns reveal differences in filing strategies, research intensity, and the types of inventions that cross national borders to enter the US system.
        </p>
      </KeyInsight>

      <DescriptiveGapNote variant="international" />

      {/* ── Section B: By Country ── */}
      <SectionDivider label="Patent Quality and Filing Patterns by Country" />

      <Narrative>
        <p>
          The relationship between patent quantity and quality across countries warrants examination. Comparing average patent claims — a rough proxy for patent scope — across countries indicates that volume and quality do not necessarily correspond. Meanwhile, country-level filing trends over time reveal the evolving composition of foreign patent activity in the US system.
        </p>
      </Narrative>

      {/* B.i: Quality versus Quantity by Country (moved from knowledge-flow-indicators) */}
      <ChartContainer
        id="fig-geo-intl-claims-by-country"
        subtitle="Average claims per patent by primary assignee country for the most recent decade, comparing patent scope across origins."
        title="The United States Leads with 164,000 Patents Granted Cumulatively During the 2020s (2020–2024, by Assignee Country) and 18.4 Average Claims, While China's 19,200 Patents Average 14.7 Claims"
        caption="The figure displays the average number of claims per patent by primary assignee country for the most recent decade. Average claim counts vary across countries, reflecting differences in patent drafting conventions, technology field composition, and examination practices. Claim count is a measure of patent scope, not a direct quality indicator."
        insight="Countries with smaller patent portfolios occasionally achieve higher average claim counts. The lower average claims from countries with rapidly growing patent volumes may reflect differences in patent drafting conventions, technology composition, or strategic filing approaches."
        loading={qcL}
        height={550}
      >
        <PWBarChart
          data={latestDecadeCountry}
          xKey="country"
          bars={[{ key: 'avg_claims', name: 'Average Claims', color: CHART_COLORS[2] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The cross-country comparison reveals that patent volume and average claim counts do not necessarily align. Countries with smaller portfolios occasionally achieve higher average claim counts, a pattern that may reflect technology field composition, patent drafting conventions, or examination practices. The lower average claims from countries with rapidly growing patent volumes, including China, parallel patterns observed in other countries during periods of rapid patent volume growth.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          Beyond the snapshot comparison above, tracking quality metrics over time for the top patent-filing countries reveals how national innovation systems have evolved. The following charts compare the top five countries across four key quality indicators, showing long-run trends in citation impact, patent scope, research originality, and examination timelines.
        </p>
      </Narrative>

      {/* B.ii — Forward Citations by Country */}
      <ChartContainer
        id="fig-geo-intl-country-fwd-citations"
        title="US Patents Average 12.9 Forward Citations in 2015, More Than Double Japan's 3.5"
        subtitle="Average forward citations per patent for the top 5 filing countries, 1976–2025"
        caption="Average forward citations per patent for the top 5 filing countries by inventor location, 1976–2025. The 2015 cohort is used for the headline comparison because recent years suffer from citation truncation. Data: PatentsView."
        loading={qctL}
        height={400}
        controls={countryNorm.controls}
      >
        <PWLineChart
          data={pivotData(countryNorm.data, 'avg_forward_citations')}
          xKey="year"
          lines={countryLines}
          yLabel={countryNorm.yLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      {/* B.iii — Claim Count Trends by Country */}
      <ChartContainer
        id="fig-geo-intl-country-claims"
        title="US Patents Average 16.7 Claims in 2024, versus 14.8 for Germany and 9.8 for China"
        subtitle="Average number of claims per patent for the top 5 filing countries, 1976–2025"
        caption="Average number of claims per patent for the top 5 filing countries by inventor location, 1976–2024. US patents consistently contain more claims than those from other major filing countries. Data: PatentsView."
        loading={qctL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByCountryTs, 'avg_num_claims')}
          xKey="year"
          lines={countryLines}
          yLabel="Average Claims"
        />
      </ChartContainer>

      {/* B.iv — Originality by Country */}
      <ChartContainer
        id="fig-geo-intl-country-originality"
        title="US Patents Score 0.234 on Originality in 2024, Nearly Double China's 0.118"
        subtitle="Average originality index for the top 5 filing countries, 1976–2025"
        caption="Average originality index per patent for the top 5 filing countries by inventor location, 1976–2024. Higher values indicate citations drawn from a wider range of technology classes. Data: PatentsView."
        loading={qctL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByCountryTs, 'avg_originality')}
          xKey="year"
          lines={countryLines}
          yLabel="Average Originality Index"
        />
      </ChartContainer>

      {/* B.v — Grant Lag by Country */}
      <ChartContainer
        id="fig-geo-intl-country-grant-lag"
        title="German Filers Wait 1,217 Days for Grant in 2024, versus 932 Days for US Domestic"
        subtitle="Average grant lag in days for the top 5 filing countries, 1976–2025"
        caption="Average grant lag (filing to issue, in days) for the top 5 filing countries by inventor location, 1976–2024. Grant lag has risen across all countries, with non-US filers consistently facing longer waits. Data: PatentsView."
        loading={qctL}
        height={400}
      >
        <PWLineChart
          data={pivotData(qualByCountryTs, 'avg_grant_lag_days')}
          xKey="year"
          lines={countryLines}
          yLabel="Average Grant Lag (days)"
        />
      </ChartContainer>

      {/* ── Country-Level Filing Trends (from international-geography) ── */}
      <SectionDivider label="Country-Level Filing Trends" />

      <Narrative>
        <p>
          Beyond quality metrics, the volume and trajectory of patent filings from different countries reveal the shifting composition of foreign inventive activity within the US patent system. Japan, long the dominant foreign filer, has been joined by South Korea and China as major sources of patent applications, while European countries have maintained steady but less rapidly growing filing volumes.
        </p>
      </Narrative>

      {countryTimePivot.length > 0 && (
        <ChartContainer
          id="fig-geo-intl-country-filing-trends"
          subtitle="Annual patent grants by inventor country for the top 10 foreign filing countries, 1976–2024."
          title="Japan Leads Foreign Filings with 1.45M US Patents, While China Grew from 299 (2000) to 30,695 (2024)"
          caption="The figure displays annual patent grant counts for the top 10 countries by inventor location. Japan has dominated foreign filings throughout the study period, while South Korea and China have exhibited rapid growth since the 2000s, fundamentally reshaping the composition of foreign patent activity in the US system."
          insight="Successive waves of foreign patent filings — first from Japan, then South Korea, and most recently China — have progressively diversified the international composition of the US patent system."
          loading={cpyL}
        >
          <PWLineChart
            data={countryTimePivot}
            xKey="year"
            lines={countryTimeNames.map((name, i) => ({
              key: name,
              name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            yLabel="Patents Granted"
            yFormatter={(v) => formatCompact(v as number)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The trajectory of country-level filing reveals distinct phases in the internationalization of the US patent system. Japan&apos;s sustained dominance in foreign filings, South Korea&apos;s rapid ascent through the 1990s and 2000s, and China&apos;s rapid recent growth together illustrate how successive waves of industrialization and technology development translate into patent activity in the world&apos;s largest innovation market.
        </p>
      </KeyInsight>

      {/* ── Section C: Priority Country Composition and PCT Usage (Analysis 32, 33) ── */}
      <SectionDivider label="Priority Country Composition" />

      <Narrative>
        <p>
          The priority country of a patent reveals where the invention was first filed, providing a complementary lens to inventor location. Tracking priority country composition over time illuminates the shifting national origins of inventions entering the US patent system, including the rapid rise of East Asian filing activity.
        </p>
      </Narrative>

      {priorityPivot.length > 0 && (
        <ChartContainer
          id="fig-geo-intl-priority-country-composition"
          subtitle="Annual patent counts by priority country for the top 8 filing origins, 1976–2025."
          title="US Priority Filings Declined from 70% to 60% of Grants as China Rose from 53 (1993) to 25,029 (2024)"
          caption="The figure displays annual patent grant counts by priority country for the top 8 filing origins. The US remains the dominant priority country but its share has declined steadily as Japan, South Korea, and more recently China have expanded their filing volumes. China surpassed several European countries to become the third-largest priority country by 2021."
          insight="The shifting composition of priority countries reflects the globalization of inventive activity, with East Asian economies accounting for an increasing share of the inventions entering the US patent system."
          loading={pccL}
        >
          <PWLineChart
            data={priorityPivot}
            xKey="year"
            lines={priorityCountryNames.map((name: string, i: number) => ({
              key: name,
              name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            yLabel="Patents Granted"
            yFormatter={(v) => formatCompact(v as number)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The priority country composition reveals a structural shift in the origins of US patent grants. While the United States remains the dominant priority country, its share has declined from 70% in the 1970s to 60% by 2024. China&apos;s rise as a priority country — from just 53 filings in 1993 to over 25,000 by 2024 — represents one of the most significant shifts in the history of the US patent system.
        </p>
      </KeyInsight>

      <SectionDivider label="PCT Route Usage by Country" />

      <Narrative>
        <p>
          The Patent Cooperation Treaty (PCT) route provides a standardized international filing pathway. The share of a country&apos;s US patent filings that enter via the PCT route reveals differences in filing strategies across national innovation systems. Higher PCT usage generally indicates greater reliance on international filing pathways.
        </p>
      </Narrative>

      {pctPivot.length > 0 && (
        <ChartContainer
          id="fig-geo-intl-pct-share-by-country"
          subtitle="PCT route share by country for major filing origins, 1990–2025."
          title="France Leads PCT Usage at 53–57%, While China's PCT Share Rose from 0% to 35% in Two Decades"
          caption="The figure displays the share of each country's US patent filings that entered via the PCT route. European countries (France, Germany, UK) exhibit consistently high PCT usage reflecting their reliance on international filing pathways. China's PCT share rose from near zero in the early 2000s to over 35% by 2024, reflecting the rapid internationalization of Chinese patent strategy."
          insight="PCT usage patterns reflect national filing strategies: European and East Asian filers rely heavily on the PCT route, while US domestic filers use it less frequently, consistent with direct filing at the home office."
          loading={pctL}
        >
          <PWLineChart
            data={pctPivot}
            xKey="year"
            lines={pctCountryNames.map((name: string, i: number) => ({
              key: name,
              name,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            yLabel="PCT Share (%)"
            yFormatter={(v) => `${(v as number).toFixed(1)}%`}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          PCT filing strategies vary substantially across countries and have evolved over time. China&apos;s rapid increase in PCT usage — from negligible levels in the 1990s to over 35% by 2024 — reflects both the growing sophistication of Chinese patent strategy and the increasing globalization of Chinese R&D activities. The contrast with Taiwan, which exhibits very low PCT usage reflecting differences in treaty access and international patent-system participation, underscores how political and institutional factors shape international filing behavior.
        </p>
      </KeyInsight>

      <SectionDivider label="Global Innovation Clusters" />

      <Narrative>
        <p>
          Extending the geographic lens beyond national aggregates, innovation clusters worldwide exhibit similarly pronounced concentration patterns. The following analysis ranks global cities by their total patent output in the US patent system, revealing which metropolitan areas function as the primary engines of patented invention worldwide.
        </p>
      </Narrative>

      {topClustersChart.length > 0 && (
        <ChartContainer
          id="fig-geography-innovation-clusters"
          subtitle="Top 30 global cities by total utility patents in the US patent system (1976–2025)."
          title="Tokyo Leads Global Innovation Clusters with 263,010 Patents, Followed by Yokohama (196,841) and Seoul (102,646)"
          caption="The figure ranks the top 30 global cities by total utility patents filed in the US patent system from 1976 to 2025. Japanese cities dominate the top positions, consistent with Japan's long history as the leading foreign filer. US cities (San Jose, San Diego, Austin) and East Asian hubs (Seoul, Beijing, Taipei) also feature prominently."
          insight="The global innovation cluster landscape is dominated by East Asian and US West Coast cities, consistent with the concentration of electronics, semiconductor, and software R&D in these regions."
          loading={clL}
          height={1000}
        >
          <PWBarChart
            data={topClustersChart}
            xKey="label"
            bars={[{ key: 'patent_count', name: 'Total Patents', color: CHART_COLORS[2] }]}
            layout="vertical"
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The global innovation cluster rankings reveal that the Tokyo metropolitan area — spanning Tokyo, Yokohama, and Kawasaki — constitutes the single largest concentration of US patent activity outside the United States. Combined, these three Japanese cities account for over 521,000 patents, underscoring the depth of Japan&apos;s contribution to the US patent system.
        </p>
      </KeyInsight>

      <Narrative>
        <p>
          The international filing patterns and quality metrics documented in this chapter complete the geographic analysis of the US patent system. Having examined where innovation happens — from state-level domestic concentration to global filing patterns and cross-country quality comparisons — the narrative turns to <em>how</em> knowledge flows through the system. The next act, <Link href="/chapters/mech-organizations/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Mechanics</Link>, investigates the organizational, individual, and geographic channels through which knowledge circulates, beginning with <Link href="/chapters/mech-organizations/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Organizational Mechanics</Link> and the within-firm dynamics of exploration, exploitation, and inter-firm knowledge flows.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "Japan leads foreign filings with 1.45 million US patents, while China grew from 299 filings in 2000 to 30,695 in 2024.",
          "Domestic-origin patents average 12.9 forward citations versus 5.8 for international-origin (2015 cohort), though field composition explains much of this gap.",
        ]}
        falsifiable="If the domestic citation advantage reflects home-country bias rather than genuine quality differences, then the gap should narrow for patents in globally competitive fields like semiconductors and pharmaceuticals."
        nextAnalysis={{
          label: "Organizational Mechanics",
          description: "How firms balance exploration and exploitation, and how knowledge flows between organizations",
          href: "/chapters/mech-organizations/",
        }}
      />

      <DataNote>
        Geographic data uses the primary inventor (sequence 0) location from PatentsView
        disambiguated records. Only utility patents with valid location data are included.
        Country-level filing trends are based on inventor country of residence. Quality by country
        uses average claims per patent by primary assignee country for the most recent decade.
        Domestic versus international classification assigns patents based on whether all listed
        inventors reside in the United States (domestic) or at least one inventor resides outside
        the United States (international).
      </DataNote>

      <RelatedChapters currentChapter={19} />
      <ChapterNavigation currentChapter={19} />
    </div>
  );
}
