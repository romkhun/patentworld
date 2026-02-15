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
import type { GovFundedPerYear, GovAgency } from '@/lib/types';

export default function SystemPublicInvestmentChapter() {
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
        number={7}
        title="Public Investment"
        subtitle="Government funding and the Bayh-Dole Act"
      />

      <KeyFindings>
        <li>Government-funded patents rose from 1,294 in 1980 to 8,359 in 2019, a trend associated with the 1980 Bayh-Dole Act.</li>
        <li>HHS/NIH leads with 55,587 patents, followed by Defense (43,736) and Energy (33,994).</li>
        <li>Government-funded patents are often associated with higher citation impact in the academic literature.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Government-funded patenting expanded substantially after the 1980 <GlossaryTooltip term="Bayh-Dole Act">Bayh-Dole Act</GlossaryTooltip>, which permitted universities and small businesses to retain patent rights on federally funded inventions. Government-acknowledged patents grew from 1,294 in 1980 to a peak of 8,359 in 2019. Federal agencies — particularly HHS/NIH, the Department of Defense, and the Department of Energy — continue to fund research that generates thousands of patents each year, representing foundational technologies that enable subsequent waves of commercial innovation. Research in the academic literature suggests that government-funded patents tend to be associated with higher citation impact, supporting the role of public R&D investment in generating foundational knowledge.
        </p>
      </aside>

      <Narrative>
        <p>
          A key dimension of the patent landscape concerns the role of government funding in generating patented inventions. While earlier chapters characterized the overall volume, quality, and technological composition of US patents, the source of funding for the underlying research reveals a distinct and consequential pattern. Public investment in research and development has long served as a catalyst for innovation, and the patent system provides a window into the scale and distribution of that investment.
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
          Federal agencies — particularly the Department of Health and Human Services/National Institutes of Health, the Department
          of Defense, and the Department of Energy — fund research that results
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

      <Narrative>
        This chapter concludes ACT 1: The System, which has examined the US patent landscape from overall volume and quality through technology fields, convergence, legal frameworks, and public investment. The next act shifts focus from the system level to the organizations that operate within it. <Link href="/chapters/org-composition" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Chapter 8: Assignee Composition</Link> opens ACT 2: The Organizations by examining the corporate, foreign, and country-level composition of patent assignees.
      </Narrative>

      <DataNote>
        All data are drawn from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025. Government
        interest is identified through the g_gov_interest table.
      </DataNote>

      <RelatedChapters currentChapter={7} />
      <ChapterNavigation currentChapter={7} />
    </div>
  );
}
