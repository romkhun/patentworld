'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import type { CitationsPerYear, CitationLag, GovFundedPerYear, GovAgency } from '@/lib/types';

interface CategoryRow {
  year: number;
  category: string;
  count: number;
}

function pivotByCategory(data: CategoryRow[]) {
  const years = [...new Set(data.map((d) => d.year))].sort();
  return years.map((year) => {
    const row: any = { year };
    data.filter((d) => d.year === year).forEach((d) => { row[d.category] = d.count; });
    return row;
  });
}

export default function Chapter6() {
  const { data: cites, loading: ciL } = useChapterData<CitationsPerYear[]>('chapter6/citations_per_year.json');
  const { data: cats, loading: caL } = useChapterData<CategoryRow[]>('chapter6/citation_categories.json');
  const { data: lag, loading: laL } = useChapterData<CitationLag[]>('chapter6/citation_lag.json');
  const { data: gov, loading: goL } = useChapterData<GovFundedPerYear[]>('chapter6/gov_funded_per_year.json');
  const { data: agencies, loading: agL } = useChapterData<GovAgency[]>('chapter6/gov_agencies.json');

  const catPivot = useMemo(() => cats ? pivotByCategory(cats) : [], [cats]);
  const catKeys = useMemo(() => {
    if (!cats) return [];
    return [...new Set(cats.map((d) => d.category))];
  }, [cats]);

  const topAgencies = useMemo(() => {
    if (!agencies) return [];
    return agencies.slice(0, 20).map((d) => ({
      ...d,
      label: d.agency.length > 40 ? d.agency.slice(0, 37) + '...' : d.agency,
    }));
  }, [agencies]);

  const lagYears = useMemo(() => {
    if (!lag) return [];
    return lag.map((d) => ({
      ...d,
      avg_lag_years: d.avg_lag_days / 365.25,
      median_lag_years: d.median_lag_days / 365.25,
    }));
  }, [lag]);

  return (
    <div>
      <ChapterHeader
        number={6}
        title="The Knowledge Network"
        subtitle="How patents build on prior knowledge"
      />

      <Narrative>
        <p>
          Every patent sits within a web of prior art. Citations connect new inventions
          to the knowledge they build upon, creating a vast network of technological
          lineage. The citation system also reveals the role of government funding in
          driving <StatCallout value="foundational research" /> that later becomes
          the basis for commercial innovation.
        </p>
      </Narrative>

      <ChartContainer
        title="Citations Per Patent Over Time"
        caption="Average and median number of US patent citations per utility patent, by grant year."
        loading={ciL}
      >
        <PWLineChart
          data={cites ?? []}
          xKey="year"
          lines={[
            { key: 'avg_citations', name: 'Average', color: CHART_COLORS[0] },
            { key: 'median_citations', name: 'Median', color: CHART_COLORS[2] },
          ]}
          yLabel="Citations"
          yFormatter={(v) => v.toFixed(1)}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The average number of citations per patent has grown substantially over the
          decades, reflecting the expanding body of prior art that new inventions must
          acknowledge. The gap between average and median suggests a long tail of
          heavily-cited patents.
        </p>
      </Narrative>

      {catPivot.length > 0 && (
        <ChartContainer
          title="Citation Categories Over Time"
          caption="Citation counts by category (e.g., cited by examiner, cited by applicant) per year."
          loading={caL}
        >
          <PWAreaChart
            data={catPivot}
            xKey="year"
            areas={catKeys.map((cat, i) => ({
              key: cat,
              name: cat,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
            stacked
          />
        </ChartContainer>
      )}

      <SectionDivider label="Citation Patterns" />

      <ChartContainer
        title="Citation Lag"
        caption="Average and median time (in years) between a cited patent's date and the citing patent's grant date."
        loading={laL}
      >
        <PWLineChart
          data={lagYears}
          xKey="year"
          lines={[
            { key: 'avg_lag_years', name: 'Average Lag', color: CHART_COLORS[0] },
            { key: 'median_lag_years', name: 'Median Lag', color: CHART_COLORS[2] },
          ]}
          yLabel="Years"
          yFormatter={(v) => `${v.toFixed(1)}y`}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The citation lag -- how far back in time patents cite -- has been growing,
          indicating that the useful life of patented knowledge is extending. Modern
          patents draw on an increasingly deep well of prior art.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The growing citation lag suggests that foundational knowledge has an increasingly
          long useful life. Patents today draw on prior art from an ever-widening time window,
          reflecting the cumulative nature of technological progress.
        </p>
      </KeyInsight>

      <SectionDivider label="Government Funding" />

      <ChartContainer
        title="Government-Funded Patents Over Time"
        caption="Number of utility patents acknowledging government funding interest, by year."
        loading={goL}
      >
        <PWLineChart
          data={gov ?? []}
          xKey="year"
          lines={[
            { key: 'count', name: 'Gov-Funded Patents', color: CHART_COLORS[5] },
          ]}
        />
      </ChartContainer>

      <ChartContainer
        title="Top Government Funding Agencies"
        caption="Agencies with the most associated patents (all time)."
        loading={agL}
        height={500}
      >
        <PWBarChart
          data={topAgencies}
          xKey="label"
          bars={[{ key: 'total_patents', name: 'Patents', color: CHART_COLORS[5] }]}
          layout="vertical"
        />
      </ChartContainer>

      <Narrative>
        <p>
          Government agencies -- particularly the Department of Defense, the Department
          of Energy, and the National Institutes of Health -- fund research that leads
          to thousands of patents each year. These government-interest patents often
          represent foundational technologies that enable subsequent waves of
          commercial innovation.
        </p>
      </Narrative>

      <DataNote>
        Citation data from PatentsView includes US patent citations only. Government
        interest is identified through the g_gov_interest table. Citation categories
        and lag calculations exclude records with missing dates.
      </DataNote>

      <ChapterNavigation currentChapter={6} />
    </div>
  );
}
