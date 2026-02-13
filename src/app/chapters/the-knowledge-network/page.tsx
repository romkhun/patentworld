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
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { CHART_COLORS } from '@/lib/colors';
import type { CitationsPerYear, CitationLag, GovFundedPerYear, GovAgency } from '@/lib/types';

export default function Chapter6() {
  const { data: cites, loading: ciL } = useChapterData<CitationsPerYear[]>('chapter6/citations_per_year.json');
  const { data: lag, loading: laL } = useChapterData<CitationLag[]>('chapter6/citation_lag.json');
  const { data: gov, loading: goL } = useChapterData<GovFundedPerYear[]>('chapter6/gov_funded_per_year.json');
  const { data: agencies, loading: agL } = useChapterData<GovAgency[]>('chapter6/gov_agencies.json');

  const topAgencies = useMemo(() => {
    if (!agencies) return [];
    return agencies.map((d) => ({
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

      <KeyInsight>
        <p>
          The growing gap between mean and median citations is a key structural feature of
          the knowledge network. While the median patent receives modest citation, a growing
          tail of highly-cited &quot;landmark&quot; patents drives the mean upward. This
          increasing skewness suggests that the distribution of inventive value is becoming
          more unequal over time -- a few breakthrough inventions generate disproportionate
          downstream impact.
        </p>
      </KeyInsight>

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
          long useful life. The average citation now reaches back over 10 years, compared to
          roughly 7 years in the 1980s. This widening time window reflects both the cumulative
          nature of technological progress and the expanding searchability of prior art databases.
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
            { key: 'count', name: 'Government-Funded Patents', color: CHART_COLORS[5] },
          ]}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The Bayh-Dole Act of 1980 fundamentally changed the landscape of government-funded
          patenting by allowing universities and small businesses to retain rights to inventions
          developed with federal support. The resulting acceleration in government-acknowledged
          patents is clearly visible in the data, with recent years showing further growth as
          federal R&D budgets have expanded.
        </p>
      </Narrative>

      <ChartContainer
        title="Top Government Funding Agencies"
        caption="Agencies with the most associated patents (all time)."
        loading={agL}
        height={750}
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

      <KeyInsight>
        <p>
          Government-funded patents exhibit disproportionately high citation impact: they
          tend to receive substantially more forward citations than privately funded patents,
          suggesting that public research investments generate foundational knowledge that
          serves as a critical input for downstream commercial innovation.
        </p>
      </KeyInsight>

      <DataNote>
        Citation data from PatentsView includes US patent citations only. Government
        interest is identified through the g_gov_interest table. Citation categories
        and lag calculations exclude records with missing dates.
      </DataNote>

      <ChapterNavigation currentChapter={6} />
    </div>
  );
}
