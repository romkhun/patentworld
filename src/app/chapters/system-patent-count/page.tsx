'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { StatCard } from '@/components/chapter/StatCard';
import { StatGrid } from '@/components/chapter/StatGrid';
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
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { DataNote } from '@/components/chapter/DataNote';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import type { PatentsPerYear, HeroStats, GrantLag } from '@/lib/types';

interface FilingVsGrant {
  series: string;
  year: number;
  count: number;
}

interface PendencyByFiling {
  year: number;
  avg_pendency_years: number;
  median_pendency_years: number;
  patent_count: number;
}

interface ContinuationChain {
  year: number;
  total_patents: number;
  originals: number;
  continuations: number;
  divisions: number;
  cips: number;
  related_filings: number;
  related_share_pct: number;
}

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

export default function SystemPatentCountChapter() {
  const { data: ppy, loading: ppyL } = useChapterData<PatentsPerYear[]>('chapter1/patents_per_year.json');
  const { data: hero } = useChapterData<HeroStats>('chapter1/hero_stats.json');
  const { data: lag, loading: lagL } = useChapterData<GrantLag[]>('chapter1/grant_lag.json');
  const { data: filingVsGrant, loading: fvgL } = useChapterData<FilingVsGrant[]>('chapter1/filing_vs_grant_year.json');
  const { data: pendency, loading: penL } = useChapterData<PendencyByFiling[]>('chapter1/pendency_by_filing_year.json');
  const { data: contChains, loading: ccL } = useChapterData<ContinuationChain[]>('chapter1/continuation_chains.json');

  const pivotedPatents = useMemo(() => ppy ? pivotByType(ppy) : [], [ppy]);

  const pivotedFilingVsGrant = useMemo(() => {
    if (!filingVsGrant) return [];
    const years = [...new Set(filingVsGrant.map((d) => d.year))].sort();
    return years.map((year) => {
      const filing = filingVsGrant.find((d) => d.year === year && d.series === 'filing_year');
      const grant = filingVsGrant.find((d) => d.year === year && d.series === 'grant_year');
      return {
        year,
        filing_count: filing?.count ?? null,
        grant_count: grant?.count ?? null,
      };
    });
  }, [filingVsGrant]);

  const totalPatents = hero ? formatCompact(hero.total_patents) : '9.36M';
  const peakYear = hero?.peak_year ?? 2019;
  const peakCount = hero ? formatCompact(hero.peak_year_count) : '393K';

  return (
    <div>
      <ChapterHeader
        number={1}
        title="Patent Count"
        subtitle="Annual patent volume and grant pendency"
      />
      <MeasurementSidebar slug="system-patent-count" />

      <KeyFindings>
        <li>The US patent system granted 9.36 million patents (utility, design, plant, and reissue combined) between 1976 and 2025 — a more than five-fold increase in annual output over five decades.</li>
        <li>Utility patents account for over 90% of all grants, while design patents constitute the principal secondary category.</li>
        <li>Grant lag — the time from filing to grant — peaked at 3.8 years (average) in 2010 (measured by grant year), creating uncertainty during a period of rapid technological change in computing and telecommunications. By filing year, median pendency peaked at 3.8 years in 2006.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Half a century of USPTO data reveals a patent system that has expanded substantially in scale. What began as an annual output of 66,000 grants per year (average, 1976–1979) had escalated to 374,000 by 2024, an expansion driven overwhelmingly by utility patents and coinciding with successive waves of technological transformation from personal computing through artificial intelligence. This growth has not come without friction: prolonged examination backlogs during the late 2000s imposed years of legal uncertainty on applicants at precisely the moment when computing and telecommunications innovation was accelerating most rapidly. Average (mean) grant pendency peaked at 3.8 years in 2010 (measured by grant year) before the USPTO undertook initiatives to reduce processing times.
        </p>
      </aside>

      {/* ── Total Patent Volume ── */}

      <StatGrid>
        <StatCard value={totalPatents} label="Total Patents (All Types)" />
        <StatCard value="50" label="Years (1976–2025)" />
        <StatCard value={`${peakYear}`} label="Peak Year" />
        <StatCard value={peakCount} label={`Grants in ${peakYear} (all types)`} />
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
        insight="The more than five-fold expansion in annual patent grants since 1976 reflects both increased inventive activity and the growing strategic importance of intellectual property protection. Broader economic cycles are reflected in patent output, with utility grants declining in 2005 and again in 2007 and a broader decline in 2021–2023 following the 2019 peak."
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
          Annual patent grants averaged 66,000 per year (average, 1976–1979),
          rising to 374,000 by 2024. <GlossaryTooltip term="utility patent">Utility patents</GlossaryTooltip> — which protect
          novel inventions and processes — constitute over 90% of all grants. Design patents,
          which cover ornamental appearance, have also exhibited sustained growth.
        </p>
        <p>
          This expansion has not been monotonic. Broader economic cycles are reflected in patent output, with utility grants declining in 2005 and again in 2007, and patent office backlogs have introduced year-to-year
          volatility. Nevertheless, the long-term trajectory indicates that an increasing
          number of individuals and <Link href="/chapters/org-composition/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">organizations</Link> are seeking patent protection as
          intellectual property assumes greater strategic importance.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The more than five-fold expansion of the patent system over half a century reflects
          not merely increased inventive output but a structural shift in competitive strategy.
          Intellectual property has become a central strategic asset across virtually every
          technology-intensive industry.
        </p>
      </KeyInsight>

      {/* ── Grant Pendency ── */}

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
          brush
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

      {/* ── Analysis 1: Filing vs Grant Year ── */}

      <SectionDivider label="Filing versus Grant Year" />

      <Narrative>
        <p>
          Counting patents by filing year versus grant year yields fundamentally different pictures of innovative activity. Filing-year counts capture when applications entered the system, while grant-year counts reflect when the USPTO completed examination. The gap between these two series reveals the lag and backlog dynamics inherent in the patent system.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-filing-vs-grant"
        title="Utility Patent Filing-Year Counts Peaked at 349,093 in 2019, Matching the Grant-Year Peak of 355,923 in the Same Year"
        subtitle="Utility patent counts by filing year versus grant year, 1976–2025"
        caption="Filing-year counts understate recent activity because many applications remain pending. The sharp drop in filing-year counts after 2019 reflects the truncation bias of pending applications, not a decline in filing activity."
        insight="The divergence between filing and grant year trends reveals that recent filing-year declines are an artifact of examination lag — applications filed in recent years have not yet been granted, creating the appearance of decline."
        loading={fvgL}
      >
        <PWLineChart
          data={pivotedFilingVsGrant}
          xKey="year"
          lines={[
            { key: 'filing_count', name: 'By Filing Year', color: CHART_COLORS[0] },
            { key: 'grant_count', name: 'By Grant Year', color: CHART_COLORS[5], dashPattern: '8 4' },
          ]}
          yLabel="Number of Patents"
          referenceLines={[
            { x: 2019, label: 'Filing & Grant Peak', color: '#6366f1' },
          ]}
        />
      </ChartContainer>

      {/* ── Analysis 1b: Pendency Trend ── */}

      <ChartContainer
        id="fig-pendency-trend"
        title="Median Time from Filing to Grant Rose from 1.6 Years, Peaking at 3.8 Years in 2006 Before Declining"
        subtitle="Median pendency in years by filing year, 1976–2022"
        caption="Pendency is measured from the filing date of the earliest US application in the family. Recent filing years have incomplete data due to pending applications, which is why the series ends at 2022."
        insight="The pendency peak in the mid-2000s coincided with the surge in computing and telecommunications filings, creating years of legal uncertainty for applicants in precisely the fastest-moving technology domains."
        loading={penL}
      >
        <PWLineChart
          data={pendency ?? []}
          xKey="year"
          lines={[
            { key: 'median_pendency_years', name: 'Median Pendency', color: CHART_COLORS[0] },
            { key: 'avg_pendency_years', name: 'Average Pendency', color: CHART_COLORS[2] },
          ]}
          yLabel="Years"
          yFormatter={(v) => `${v.toFixed(1)}y`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008, 2011] })}
        />
      </ChartContainer>

      {/* ── Analysis 2: Continuation Chains ── */}

      <SectionDivider label="Continuation & Related Filings" />

      <Narrative>
        <p>
          Beyond the overall volume and pendency of patents, the structure of patent filings has changed substantially. The rise of continuation applications, divisionals, and continuation-in-part (CIP) filings reflects a strategic shift in how applicants use the patent system — not merely to protect individual inventions, but to build layered portfolios of related claims.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-continuation-stacked"
        title="96.3% of 2024 Patents Had Related Filings (Data Available from 2002) — Continuation Use Has Increased Substantially"
        subtitle="Patent grants by filing type, 1976–2025"
        caption="Related filings include continuations, divisionals, and continuation-in-part (CIP) applications. The 0% related filing share for 1976–2001 reflects a data limitation: the PatentsView g_us_related_documents table does not capture continuation relationships for patents granted before 2002, not an actual absence of related filings."
        insight="The near-complete dominance of continuation-related patents by the 2020s indicates that the patent system has evolved from protecting discrete inventions to enabling layered, portfolio-based IP strategies."
        loading={ccL}
      >
        <PWAreaChart
          data={contChains ?? []}
          xKey="year"
          areas={[
            { key: 'originals', name: 'Originals', color: CHART_COLORS[0] },
            { key: 'continuations', name: 'Continuations', color: CHART_COLORS[1] },
            { key: 'divisions', name: 'Divisions', color: CHART_COLORS[2] },
            { key: 'cips', name: 'CIPs', color: CHART_COLORS[3] },
          ]}
          stacked
          yLabel="Number of Patents"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-continuation-share"
        title="Related Filing Share Rose from 36% in 2002 to 96% by 2024 as Continuation Strategies Became Universal"
        subtitle="Share of annual grants with continuation, division, or CIP filings, 2002–2025"
        caption="The share is computed only from 2002 onward due to the data limitation noted above. The rapid ascent from 36% to above 95% in under a decade reflects both genuine strategic adoption and the phased availability of related-document data."
        insight="Related filings are prevalent in observed data from 2002 onward, suggesting that analyzing patents in isolation may miss important context."
        loading={ccL}
      >
        <PWLineChart
          data={(contChains ?? []).filter((d) => d.year >= 2002)}
          xKey="year"
          lines={[
            { key: 'related_share_pct', name: 'Related Filing Share (%)', color: CHART_COLORS[5] },
          ]}
          yLabel="Percent"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      {/* ── Chapter Closing ── */}

      <Narrative>
        Having examined the overall scale of US patent activity and the examination timelines that shape it, the next chapter explores <Link href="/chapters/system-patent-quality/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">patent quality and complexity</Link> — including claim complexity, citation patterns, and technological scope.
      </Narrative>

      <InsightRecap
        learned={[
          "The US patent system granted 9.36 million patents (all types) between 1976 and 2025, with annual output increasing more than five-fold from 70,941 in 1976 to over 370,000.",
          "Average (mean) grant pendency peaked at 3.8 years in 2010 before declining to 2.7 years by 2023, reflecting USPTO capacity adjustments.",
        ]}
        falsifiable="If the USPTO's capacity constraints drove the pendency peak, then future surges in application volume should reproduce the pattern — pendency should rise again when filings outpace examiner hiring."
        nextAnalysis={{
          label: "Patent Quality",
          description: "Are more patents better patents? Claims, citations, and originality metrics over time",
          href: "/chapters/system-patent-quality/",
        }}
      />

      <DataNote>
        All data are drawn from PatentsView (patentsview.org), covering granted US patents
        from January 1976 through September 2025.
      </DataNote>

      <RelatedChapters currentChapter={1} />
      <ChapterNavigation currentChapter={1} />
    </div>
  );
}
