'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
import { PWBarChart } from '@/components/charts/PWBarChart';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { formatCompact } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/colors';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import type { PatentsPerYear, ClaimsPerYear, GrantLag, HeroStats, DesignPatentTrend, GovFundedPerYear, GovAgency } from '@/lib/types';

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
  const { data: designData, loading: deL } = useChapterData<{ trends: DesignPatentTrend[] }>('company/design_patents.json');
  const { data: gov, loading: goL } = useChapterData<GovFundedPerYear[]>('chapter6/gov_funded_per_year.json');
  const { data: agencies, loading: agL } = useChapterData<GovAgency[]>('chapter6/gov_agencies.json');

  const pivotedPatents = useMemo(() => ppy ? pivotByType(ppy) : [], [ppy]);

  const topAgencies = useMemo(() => {
    if (!agencies) return [];
    return agencies.map((d) => ({
      ...d,
      label: d.agency.length > 40 ? d.agency.slice(0, 37) + '...' : d.agency,
    }));
  }, [agencies]);

  const totalPatents = hero ? formatCompact(hero.total_patents) : '9.4M';
  const peakYear = hero?.peak_year ?? 2019;
  const peakCount = hero ? formatCompact(hero.peak_year_count) : '393K';

  return (
    <div>
      <ChapterHeader
        number={1}
        title="The Innovation Landscape"
        subtitle="Five decades of inventive activity documented in over 9.36 million US patents"
      />

      <KeyFindings>
        <li>The US patent system granted over 9.36 million patents between 1976 and 2025 — a roughly fivefold increase in annual output over five decades.</li>
        <li>Utility patents account for over 90% of all grants, while design patents have grown from roughly 6% to 13% of annual output — a structural shift toward design-driven innovation.</li>
        <li>Patent complexity has risen substantially: average claims per patent doubled from the 1970s through the mid-2000s before leveling off, with a notable median-mean inversion by the mid-2010s.</li>
        <li>Grant lag — the time from filing to grant — peaked near four years around 2010, creating uncertainty during a period of rapid technological change.</li>
        <li>Government-funded patents rose markedly after the 1980 Bayh-Dole Act, with HHS/NIH, Defense, and Energy leading federal patent portfolios.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Half a century of USPTO data reveals a patent system that has expanded dramatically in scale while simultaneously growing more complex in structure. What began as an annual output of roughly 65,000 grants per year by the late 1970s had escalated to more than 350,000 by the 2020s, an expansion driven overwhelmingly by utility patents and coinciding with successive waves of technological transformation from personal computing through artificial intelligence. Within this overall growth, the composition of patent types has shifted: design patents have doubled their share from roughly 6% to 13%, reflecting a broader strategic turn toward design-driven product differentiation. This growth has not come without friction: prolonged examination backlogs during the late 2000s imposed years of legal uncertainty on applicants at precisely the moment when computing and telecommunications innovation was accelerating most rapidly, a tension explored further in <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">The Technology Revolution</Link>. Meanwhile, the evolution of patent claim structures, including a notable inversion in which median claims overtook the average by the mid-2010s, points to shifting drafting strategies that merit attention from both practitioners and policymakers. The chapter concludes with an examination of government-funded patenting, which expanded substantially after the 1980 Bayh-Dole Act and continues to represent a significant share of foundational innovations.
        </p>
      </aside>

      {/* ── Broad Patent Landscape Overview ── */}

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

      {/* ── Trends Over Time: Annual Grants ── */}

      <ChartContainer
        id="fig-innovation-landscape-annual-grants"
        title="Annual US Patent Grants Grew from 70,941 in 1976 to 392,618 in 2019 Before Moderating"
        subtitle="Total patents granted annually by the USPTO, broken down by patent type (utility, design, plant, reissue), 1976–2025"
        caption="Annual patent grants by type, 1976–2025. Utility patents, which protect novel inventions and processes, account for over 90% of all grants. Design patents, covering ornamental appearance, constitute the principal secondary category. Data: PatentsView / USPTO."
        insight="The five-fold expansion in annual patent grants since 1976 reflects both increased inventive activity and the growing strategic importance of intellectual property protection. Broader economic cycles are reflected in patent output, with utility grants declining temporarily around 2007-2008 and the 2020 COVID-19 pandemic producing a visible dip."
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
          yLabel="Number of Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2020] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          Annual patent grants averaged roughly 65,000 per year in the late
          1970s, rising to over 350,000 in recent years. <GlossaryTooltip term="utility patent">Utility patents</GlossaryTooltip> — which protect
          novel inventions and processes — constitute over 90% of all grants. Design patents,
          which cover ornamental appearance, have also exhibited sustained growth.
        </p>
        <p>
          This expansion has not been monotonic. Broader economic cycles are reflected in patent output, with utility grants declining temporarily around 2007–2008, and patent office backlogs have introduced year-to-year
          volatility. Nevertheless, the long-term trajectory indicates that an increasing
          number of individuals and <Link href="/chapters/firm-innovation" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">organizations</Link> are seeking patent protection as
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

      {/* ── Breakdown by Patent Type: Design vs. Utility ── */}

      <SectionDivider label="Design vs. Utility Patents" />

      <Narrative>
        <p>
          The stacked area chart above reveals that design patents constitute the principal secondary category after utility patents. A closer examination of the balance between these two types illustrates how innovation strategies have shifted over the decades — from purely engineering-oriented approaches to <StatCallout value="design-driven innovation" />. Whereas utility patents protect functional inventions, <GlossaryTooltip term="design patent">design patents</GlossaryTooltip> protect
          ornamental appearance.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-design-trends"
        subtitle="Annual utility and design patent counts with design share on the right axis, tracking the shift toward design-driven innovation."
        title="Design Patent Share Grew from 6% in the Early 1980s to Approximately 13% by 2024, Outpacing Utility Patent Growth"
        caption="This chart displays annual counts of utility and design patents, with design patent share on the right axis. Design patents have exhibited higher growth rates than utility patents since the 2000s, driven by growth in consumer electronics, automotive design, and fashion-related filings."
        insight="The increasing share of design patents suggests a structural shift in innovation strategy toward design-driven product differentiation, reflecting broader economic trends in which aesthetic and user-experience considerations have become central to competitive advantage."
        loading={deL}
      >
        {designData?.trends ? (
          <PWLineChart
            data={designData.trends}
            xKey="year"
            lines={[
              { key: 'utility_count', name: 'Utility Patents', color: CHART_COLORS[0] },
              { key: 'design_count', name: 'Design Patents', color: CHART_COLORS[3] },
              { key: 'design_share', name: 'Design Share (%)', color: CHART_COLORS[4], yAxisId: 'right' },
            ]}
            yLabel="Number of Patents"
            rightYLabel="Design Share (%)"
            rightYFormatter={(v) => `${v.toFixed(1)}%`}
          />
        ) : <div />}
      </ChartContainer>

      {/* ── Patent Complexity: Claims per Patent ── */}

      <SectionDivider label="Patent Complexity" />

      <Narrative>
        <p>
          Beyond the growth in patent volume and the shifting composition across types, the internal structure of patents themselves has evolved. Patent complexity, as measured by claim counts, provides a window into how applicants have sought to define and protect their inventions over time.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-claims-per-patent"
        title="Average Claims per Patent Doubled from 9.4 in 1976 to a Peak of 18.9 in 2005"
        subtitle="Average and median number of claims per utility patent, measuring patent scope and complexity over time, 1976–2025"
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
          Each claim defines a specific element of the invention that
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
          A final dimension of the patent landscape concerns the role of government funding in generating patented inventions. While the preceding sections have characterized the system in terms of volume, type, complexity, and processing time, the source of funding for the underlying research reveals a distinct and consequential pattern.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-gov-funded"
        subtitle="Annual count of utility patents acknowledging government funding interest, tracking the impact of the 1980 Bayh-Dole Act."
        title="Government-Funded Patents Rose From 1,294 in 1980 to 8,359 in 2019 After the Bayh-Dole Act"
        caption="Number of utility patents acknowledging government funding interest, by year. A marked increase is evident after the 1980 Bayh-Dole Act, which permitted universities and small businesses to retain patent rights on federally funded inventions."
        loading={goL}
        insight="Government-funded patents consistently exhibit higher citation impact than privately funded patents, supporting the role of public R&D investment in generating foundational innovations."
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
          patents is evident in the data, with recent years exhibiting further growth as
          federal R&D budgets have expanded.
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
          Government-funded patents exhibit disproportionately high citation impact: they
          tend to receive substantially more forward citations than privately funded patents,
          suggesting that public research investments generate foundational knowledge that
          serves as a critical input for downstream commercial innovation.
        </p>
      </KeyInsight>

      {/* ── Chapter Closing ── */}

      <Narrative>
        Having examined the overall scale, composition, complexity, and funding sources of US patent activity over five decades, the next chapter identifies which <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">technologies have driven this growth</Link>.
        The fivefold expansion in patent output masks substantial shifts in the composition of innovation, from chemistry and mechanical engineering toward computing, semiconductors, and digital communication.
      </Narrative>

      <DataNote>
        All data are drawn from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025. Government
        interest is identified through the g_gov_interest table.
      </DataNote>

      <RelatedChapters currentChapter={1} />
      <ChapterNavigation currentChapter={1} />
    </div>
  );
}
