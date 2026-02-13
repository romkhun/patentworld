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

      <KeyFindings>
        <li>The US patent system granted 9.36 million patents between 1976 and 2025 — a roughly fivefold increase in annual output over five decades.</li>
        <li>Utility patents account for over 90% of all grants, with design patents growing as a secondary category.</li>
        <li>Patent complexity has risen steadily: average claims per patent have increased, indicating broader protection strategies.</li>
        <li>Grant lag — the time from filing to grant — peaked above 3 years in the early 2000s, creating uncertainty during a period of rapid technological change.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The USPTO granted 9.36 million patents from 1976 to 2025, with annual output growing roughly fivefold from 70,000 in the late 1970s to over 350,000 in recent years. Utility patents make up over 90% of all grants. Grant pendency peaked above 3 years in the early 2000s, and the widening gap between average and median claims per patent signals a rise in broad, defensive patenting strategies.
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
          <StatCallout value={totalPatents} /> patents. This half-century of innovation
          encompasses everything from the personal computer revolution to the rise of
          artificial intelligence.
        </p>
      </Narrative>

      <ChartContainer
        title="Patent Grants Over Time"
        caption="Annual patent grants by type, 1976-2025. Utility patents represent inventions; design patents protect ornamental appearance. Source: PatentsView."
        insight="The fivefold growth in annual patent grants since 1976 reflects both more invention and the growing strategic importance of intellectual property. The 2008 dip and 2020 COVID disruption are visible in the data."
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
          Patent grants have grown dramatically, from roughly 70,000 per year in the late
          1970s to over 350,000 per year in recent times. <GlossaryTooltip term="utility patent">Utility patents</GlossaryTooltip> -- which protect
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
        insight="The widening gap between average and median claims suggests a growing subset of patents with very broad claim sets — a pattern consistent with defensive patenting and patent thicket strategies."
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
        insight="Patent pendency functions as a hidden cost of innovation. The 2000s spike coincided with the computing and telecom boom, when timely patent review mattered most for fast-moving industries."
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
          The time it takes for a patent to go from application to grant has fluctuated
          considerably. In the early 2000s, growing backlogs pushed average pendency times
          to over 3 years. The USPTO has made efforts to reduce these times, but the
          increasing complexity of technology and the sheer volume of applications continue
          to challenge the system.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Patent pendency functions as a hidden tax on innovation. Every additional year of
          delay extends the period of uncertainty for both the applicant and potential
          competitors, distorting investment decisions. The pendency spike of the early 2000s
          coincided with a period of rapid technological change in computing and
          telecommunications -- precisely when timely patent review mattered most.
        </p>
      </KeyInsight>

      <Narrative>
        Having explored the overall scale and trajectory of US patent activity over five decades, the next chapter examines which technologies have driven this growth.
        The fivefold expansion in patent output masks dramatic shifts in the composition of innovation -- from chemistry and mechanical engineering toward computing, semiconductors, and digital communication.
      </Narrative>

      <DataNote>
        All data comes from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025.
      </DataNote>

      <RelatedChapters currentChapter={1} />
      <ChapterNavigation currentChapter={1} />
    </div>
  );
}
