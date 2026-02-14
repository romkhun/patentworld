'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS } from '@/lib/colors';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { DataNote } from '@/components/chapter/DataNote';
import type { GrantLag, GovFundedPerYear, GovAgency } from '@/lib/types';

export default function PatentProcessChapter() {
  const { data: lag, loading: lagL } = useChapterData<GrantLag[]>('chapter1/grant_lag.json');
  const { data: gov, loading: goL } = useChapterData<GovFundedPerYear[]>('chapter6/gov_funded_per_year.json');
  const { data: agencies, loading: agL } = useChapterData<GovAgency[]>('chapter6/gov_agencies.json');

  const topAgencies = useMemo(() => {
    if (!agencies) return [];
    return agencies.map((d) => ({
      ...d,
      label: d.agency.length > 40 ? d.agency.slice(0, 37) + '...' : d.agency,
    }));
  }, [agencies]);

  return (
    <div>
      <ChapterHeader
        number={2}
        title="Patent Process & Public Investment"
        subtitle="Grant pendency and the role of government funding in the US patent system"
      />

      <KeyFindings>
        <li>Grant lag — the time from filing to grant — peaked at 3.8 years in 2010, creating uncertainty during a period of rapid technological change in computing and telecommunications.</li>
        <li>Government-funded patents rose substantially from the early 1990s onward, a trend often attributed in part to the 1980 Bayh-Dole Act, growing from 1,294 in 1980 to 8,359 in 2019.</li>
        <li>HHS/NIH leads federal patent portfolios with 55,587 patents, followed by Defense (43,736) and Energy (33,994), representing foundational technologies that enable subsequent waves of commercial innovation.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          The fivefold expansion of the patent system documented in the <Link href="/chapters/patent-volume" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">preceding chapter</Link> has not come without friction. Prolonged examination backlogs during the late 2000s imposed years of legal uncertainty on applicants at precisely the moment when computing and telecommunications innovation was accelerating most rapidly. Average grant pendency peaked at 3.8 years in 2010 before the USPTO undertook initiatives to reduce processing times. Meanwhile, government-funded patenting expanded substantially after the 1980 Bayh-Dole Act, which permitted universities and small businesses to retain patent rights on federally funded inventions. Federal agencies — particularly HHS/NIH, the Department of Defense, and the Department of Energy — continue to fund research that generates thousands of patents each year, representing foundational technologies that enable subsequent waves of commercial innovation.
        </p>
      </aside>

      {/* ── Patent Process: Grant Pendency ── */}

      <SectionDivider label="Grant Pendency" />

      <Narrative>
        <p>
          The growing volume of patent applications has placed sustained pressure on the examination process. <GlossaryTooltip term="grant lag">Grant lag</GlossaryTooltip> — the elapsed time between patent application
          and issuance — offers a direct measure of how well the patent office has kept pace with demand.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-grant-lag"
        title="Grant Pendency Peaked at 3.8 Years in 2010, Up from 1.2 Years in 1976"
        subtitle="Average and median time from patent application filing to grant, measured in years, 1976–2025"
        caption="Average and median grant lag (time from application filing to patent issuance), 1976–2025, expressed in years. The late-2000s peak coincided with a surge in computing and telecommunications filings."
        insight="Grant pendency represents a considerable cost of the patent system. Extended review periods create prolonged uncertainty for both applicants and potential competitors, distorting investment and commercialization decisions."
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
          During the late 2000s,
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

      {/* ── Breakdown by Funding Source: Government Funding ── */}

      <SectionDivider label="Government Funding" />

      <Narrative>
        <p>
          A further dimension of the patent landscape concerns the role of government funding in generating patented inventions. While the preceding section characterized examination timelines, the source of funding for the underlying research reveals a distinct and consequential pattern.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-gov-funded"
        subtitle="Annual count of utility patents acknowledging government funding interest, tracking the impact of the 1980 Bayh-Dole Act."
        title="Government-Funded Patents Rose From 1,294 in 1980 to 8,359 in 2019 After the Bayh-Dole Act"
        caption="Number of utility patents acknowledging government funding interest, by year. A marked increase is evident after the 1980 Bayh-Dole Act, which permitted universities and small businesses to retain patent rights on federally funded inventions."
        loading={goL}
        insight="Government-funded patents are often associated with higher citation impact in the academic literature, supporting the role of public R&D investment in generating foundational innovations. This interpretation is drawn from prior research rather than directly computed from the PatentsView data used in this chapter."
      >
        <PWLineChart
          data={gov ?? []}
          xKey="year"
          lines={[
            { key: 'count', name: 'Government-Funded Patents', color: CHART_COLORS[5] },
          ]}
          yLabel="Number of Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The <GlossaryTooltip term="Bayh-Dole Act">Bayh-Dole Act</GlossaryTooltip> of 1980 fundamentally altered the landscape of government-funded
          patenting by permitting universities and small businesses to retain rights to inventions
          developed with federal support. The resulting acceleration in government-acknowledged
          patents is evident in the data, though government-funded patent counts have declined somewhat since their 2019 peak of 8,359.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-gov-agencies"
        subtitle="Federal agencies ranked by total number of associated government-interest patents across all years."
        title="HHS/NIH Leads With 55,587 Patents, Followed by Defense (43,736) and Energy (33,994)"
        caption="Federal agencies ranked by total number of associated patents (all time). The Department of Health and Human Services/NIH, Department of Defense, and Department of Energy account for the largest share of government-interest patents."
        loading={agL}
        height={750}
        insight="Federal agencies such as NIH/HHS, the DoD, and DOE fund research that leads to thousands of patents, often representing foundational technologies that enable subsequent waves of commercial innovation."
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
          Federal agencies -- particularly the Department of Health and Human Services/National Institutes of Health, the Department
          of Defense, and the Department of Energy -- fund research that results
          in thousands of patents each year. These government-interest patents frequently
          represent foundational technologies that enable subsequent waves of
          commercial innovation.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Government-funded patents are often associated with higher citation impact in the academic literature,
          suggesting that public research investments generate foundational knowledge that
          serves as a critical input for downstream commercial innovation. This interpretation is drawn from prior research rather than directly computed from the PatentsView data used in this chapter.
        </p>
      </KeyInsight>

      {/* ── Chapter Closing ── */}

      <Narrative>
        Having examined the patent examination process and the role of government funding in shaping the innovation landscape, the next chapter identifies which <Link href="/chapters/technology-fields" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">technology fields have driven this growth</Link>.
        The fivefold expansion in patent output masks substantial shifts in the composition of innovation, from chemistry and mechanical engineering toward computing, semiconductors, and digital communication.
      </Narrative>

      <DataNote>
        All data are drawn from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025. Government
        interest is identified through the g_gov_interest table.
      </DataNote>

      <RelatedChapters currentChapter={2} />
      <ChapterNavigation currentChapter={2} />
    </div>
  );
}
