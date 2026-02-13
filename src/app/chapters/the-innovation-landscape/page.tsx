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

  const totalPatents = hero ? formatCompact(hero.total_patents) : '9.36M';
  const peakYear = hero?.peak_year ?? 2020;
  const peakCount = hero ? formatCompact(hero.peak_year_count) : '389K';

  return (
    <div>
      <ChapterHeader
        number={1}
        title="The Innovation Landscape"
        subtitle="50 years of global invention in 9.36 million US patents"
      />

      <StatGrid>
        <StatCard value={totalPatents} label="Total Patents" />
        <StatCard value="50" label="Years (1976-2025)" />
        <StatCard value={`${peakYear}`} label="Peak Year" />
        <StatCard value={peakCount} label={`Grants in ${peakYear}`} />
      </StatGrid>

      <Narrative>
        <p>
          Between 1976 and 2025, the United States Patent and Trademark Office granted{' '}
          <StatCallout value={totalPatents} /> patents. This half-century of innovation
          encompasses everything from the personal computer revolution to the rise of
          artificial intelligence.
        </p>
      </Narrative>

      <ChartContainer
        title="Patent Grants Over Time"
        caption="Annual patent grants by type, 1976-2025. Utility patents represent inventions; design patents protect ornamental appearance. Source: PatentsView."
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
        />
      </ChartContainer>

      <Narrative>
        <p>
          Patent grants have grown dramatically, from roughly 70,000 per year in the late
          1970s to over 350,000 per year in recent times. Utility patents -- which protect
          new inventions and processes -- make up over 90% of all grants. Design patents,
          protecting ornamental designs, have also seen steady growth.
        </p>
        <p>
          The growth has not been steady. The 2008 financial crisis caused a notable dip,
          and patent office backlogs have created year-to-year volatility. But the overall
          trajectory is clear: more people and organizations are seeking patent protection
          for their inventions than ever before.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The patent system has expanded roughly fivefold in half a century. This reflects not just more
          invention but a fundamental shift in how firms compete -- intellectual property has become a
          central strategic asset across virtually every industry.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Patent Complexity: Claims Per Patent"
        caption="Average and median number of claims per utility patent. More claims generally indicate more complex inventions."
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
          Patents have become significantly more complex over time. The average number
          of claims per patent has increased steadily, reflecting the growing sophistication
          of inventions and the strategic importance of broad patent coverage. Each claim
          defines a specific aspect of the invention that is legally protected.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The widening gap between average and median claims reveals a skewed distribution: a growing
          number of patents contain very large claim sets, suggesting that some applicants pursue
          deliberately broad protection strategies to build patent thickets.
        </p>
      </KeyInsight>

      <ChartContainer
        title="Time from Filing to Grant"
        caption="Average and median days between patent application filing and grant, converted to years."
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
        />
      </ChartContainer>

      <Narrative>
        <p>
          The time it takes for a patent to go from application to grant has fluctuated
          considerably. In the early 2000s, growing backlogs pushed average pendency times
          to over 3 years. The USPTO has made efforts to reduce these times, but the
          increasing complexity of technology and the sheer volume of applications continue
          to challenge the system.
        </p>
      </Narrative>

      <DataNote>
        All data comes from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025.
      </DataNote>

      <ChapterNavigation currentChapter={1} />
    </div>
  );
}
