'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { StatCard } from '@/components/chapter/StatCard';
import { StatGrid } from '@/components/chapter/StatGrid';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { formatCompact } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/colors';
import type { PatentsPerYear, ClaimsPerYear, GrantLag, HeroStats } from '@/lib/types';

function pivotByType(data: PatentsPerYear[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => {
      row[d.patent_type] = d.count;
    });
    return row;
  });
}

export default function Chapter1() {
  const { data: ppy, loading: ppyL } = useChapterData<PatentsPerYear[]>('chapter1/patents_per_year.json');
  const { data: claims, loading: clL } = useChapterData<ClaimsPerYear[]>('chapter1/claims_per_year.json');
  const { data: lag, loading: lagL } = useChapterData<GrantLag[]>('chapter1/grant_lag.json');
  const { data: hero } = useChapterData<HeroStats>('chapter1/hero_stats.json');

  const pivotedPatents = useMemo(() => ppy ? pivotByType(ppy) : [], [ppy]);

  const totalPatents = hero ? formatCompact(hero.total_patents) : '9.4M';
  const peakYear = hero?.peak_year ?? 2019;
  const peakCount = hero ? formatCompact(hero.peak_year_count) : '393K';

  return (
    <div>
      <ChapterHeader
        number={1}
        title="The Innovation Landscape"
        subtitle="Five decades of inventive activity documented in over 9.3 million US patents"
      />

      <KeyFindings>
        <li>The US patent system granted over 9.3 million patents between 1976 and 2025 — a roughly fivefold increase in annual output over five decades.</li>
        <li>Utility patents account for over 90% of all grants, with design patents growing as a secondary category.</li>
        <li>Patent complexity has risen substantially: average claims per patent rose from the 1970s through the mid-2000s before leveling off.</li>
        <li>Grant lag — the time from filing to grant — peaked near four years around 2010, creating uncertainty during a period of rapid technological change.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The USPTO granted over 9.3 million patents from 1976 to 2025, with annual output growing roughly fivefold from 65,000–70,000 in the late 1970s to over 350,000 in recent years. Utility patents constitute over 90% of all grants. Grant pendency peaked near four years around 2010, and the shifting relationship between average and median claims per patent — with the median surpassing the average by the mid-2010s — indicates evolving patent drafting strategies.
        </p>
      </aside>

      <StatGrid>
        <StatCard value={totalPatents} label="Total Patents" />
        <StatCard value="50" label="Years (1976-2025)" />
        <StatCard value={`${peakYear}`} label="Peak Year" />
        <StatCard value={peakCount} label={`Grants in ${peakYear}`} />
      </StatGrid>

      <Narrative>
        <p>
          Between 1976 and 2025, the United States Patent and Trademark Office granted{' '}
          <StatCallout value={totalPatents} /> patents. This half-century of data encompasses
          the personal computer revolution, the expansion of biotechnology, the rise of the
          internet economy, and the emergence of artificial intelligence as a general-purpose technology.
        </p>
      </Narrative>

      <ChartContainer
        title="Annual Patent Grants Increased Five-Fold, 1976–2025"
        caption="Annual patent grants by type, 1976–2025. Utility patents, which protect novel inventions and processes, account for over 90% of all grants. Design patents, covering ornamental appearance, constitute the principal secondary category. Data: PatentsView / USPTO."
        insight="The five-fold expansion in annual patent grants since 1976 reflects both increased inventive activity and the growing strategic importance of intellectual property protection. Notable disruptions include the 2008 financial crisis and the 2020 COVID-19 pandemic."
        loading={ppyL}
      >
        <PWAreaChart
          data={pivotedPatents}
          xKey="year"
          areas={[
            { key: 'utility', name: 'Utility', color: CHART_COLORS[0] },
            { key: 'design', name: 'Design', color: CHART_COLORS[1] },
            { key: 'plant', name: 'Plant', color: CHART_COLORS[2] },
            { key: 'reissue', name: 'Reissue', color: CHART_COLORS[3] },
          ]}
          stacked
          yLabel="Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Annual patent grants increased from approximately 65,000–70,000 in the late
          1970s to over 350,000 in recent years. <GlossaryTooltip term="utility patent">Utility patents</GlossaryTooltip> — which protect
          novel inventions and processes — constitute over 90% of all grants. Design patents,
          which cover ornamental appearance, have also exhibited sustained growth.
        </p>
        <p>
          This expansion has not been monotonic. The 2008 financial crisis produced a
          visible contraction, and patent office backlogs have introduced year-to-year
          volatility. Nevertheless, the long-term trajectory indicates that an increasing
          number of individuals and organizations are seeking patent protection as
          intellectual property assumes greater strategic importance.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The approximately five-fold expansion of the patent system over half a century reflects
          not merely increased inventive output but a structural shift in competitive strategy.
          Intellectual property has become a central strategic asset across virtually every
          technology-intensive industry.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Patent Claim Counts Rose Substantially from the 1970s Through the Mid-2000s Before Leveling Off"
        caption="Average and median number of claims per utility patent, 1976–2025. The relationship between mean and median has shifted over time; by the mid-2010s, the median surpassed the average, suggesting a compression of the upper tail."
        insight="The relationship between average and median claims per patent has shifted over time; by the mid-2010s, the median surpassed the average, suggesting a compression of the upper tail."
        loading={clL}
      >
        <PWLineChart
          data={claims ?? []}
          xKey="year"
          lines={[
            { key: 'avg_claims', name: 'Average Claims', color: CHART_COLORS[0] },
            { key: 'median_claims', name: 'Median Claims', color: CHART_COLORS[2] },
          ]}
          yLabel="Claims"
          yFormatter={(v) => v.toFixed(0)}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Patent complexity, as measured by claim counts, rose substantially from the 1970s through the mid-2000s before leveling off. Each claim defines a specific element of the invention that
          receives legal protection. The initial upward trend in average claims per patent reflected
          both the growing technical sophistication of inventions and the strategic incentive
          for applicants to secure broad coverage, though the gap between average and median claims initially widened but has recently reversed, with the median surpassing the average by the mid-2010s.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The relationship between average and median claims has evolved: the gap initially widened as a subset of patents pursued very large claim sets, but by the mid-2010s the median surpassed the average, indicating a compression of the upper tail and a more uniform distribution of claim counts across patents.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Grant Pendency Peaked Near Four Years Around 2010"
        caption="Average and median grant lag (time from application filing to patent issuance), 1976–2025, expressed in years. The late-2000s peak coincided with a surge in computing and telecommunications filings."
        insight="Grant pendency represents a significant cost of the patent system. Extended review periods create prolonged uncertainty for both applicants and potential competitors, distorting investment and commercialization decisions."
        loading={lagL}
      >
        <PWLineChart
          data={(lag ?? []).map((d) => ({
            ...d,
            avg_lag_years: d.avg_lag_days / 365.25,
            median_lag_years: d.median_lag_days / 365.25,
          }))}
          xKey="year"
          lines={[
            { key: 'avg_lag_years', name: 'Average', color: CHART_COLORS[0] },
            { key: 'median_lag_years', name: 'Median', color: CHART_COLORS[2] },
          ]}
          yLabel="Years"
          yFormatter={(v) => `${v.toFixed(1)}y`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2011] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          <GlossaryTooltip term="grant lag">Grant lag</GlossaryTooltip> — the elapsed time between patent application
          and issuance — has varied considerably over the study period. During the late 2000s,
          growing examination backlogs pushed average pendency near four years, peaking at 3.82 years in 2010. The USPTO has
          subsequently undertaken initiatives to reduce processing times; however, the increasing
          technical complexity of applications and sustained filing volumes continue to strain
          the examination system.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Extended patent pendency imposes costs on innovation activity. Each additional year
          of delay prolongs the period of legal uncertainty for both applicants and potential
          competitors, with implications for investment and commercialization decisions. The
          pendency spike of the late 2000s coincided with a period of rapid technological
          change in computing and telecommunications — precisely when timely patent review
          was most consequential.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the overall scale and trajectory of US patent activity over five decades, the next chapter identifies which technologies have driven this growth.
        The fivefold expansion in patent output masks substantial shifts in the composition of innovation, from chemistry and mechanical engineering toward computing, semiconductors, and digital communication.
      </Narrative>

      <DataNote>
        All data are drawn from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025.
      </DataNote>

      <RelatedChapters currentChapter={1} />
      <ChapterNavigation currentChapter={1} />
    </div>
  );
}
