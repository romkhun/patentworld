'use client';

import { useMemo, useState } from 'react';
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
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PWChordDiagram } from '@/components/charts/PWChordDiagram';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { formatCompact } from '@/lib/formatters';
import type {
  CitationsPerYear, CitationLag, GovFundedPerYear, GovAgency, CitationLagTrend, CitationLagBySection,
  CorporateCitationFlow, TechLeadership, CitationHalfLife,
} from '@/lib/types';

export default function Chapter7() {
  const { data: cites, loading: ciL } = useChapterData<CitationsPerYear[]>('chapter6/citations_per_year.json');
  const { data: lag, loading: laL } = useChapterData<CitationLag[]>('chapter6/citation_lag.json');
  const { data: gov, loading: goL } = useChapterData<GovFundedPerYear[]>('chapter6/gov_funded_per_year.json');
  const { data: agencies, loading: agL } = useChapterData<GovAgency[]>('chapter6/gov_agencies.json');
  const { data: citeLagTrend, loading: cltL } = useChapterData<CitationLagTrend[]>('chapter6/citation_lag_trend.json');
  const { data: citeLagBySection, loading: clsL } = useChapterData<CitationLagBySection[]>('chapter6/citation_lag_by_section.json');

  // C1, C2, C3: Corporate citation analyses
  const { data: citationFlows, loading: cfL } = useChapterData<CorporateCitationFlow[]>('company/corporate_citation_network.json');
  const { data: techLeadership } = useChapterData<TechLeadership[]>('company/tech_leadership.json');
  const { data: citationHalfLife, loading: chlL } = useChapterData<CitationHalfLife[]>('company/citation_half_life.json');

  const [selectedDecade, setSelectedDecade] = useState('2016-2025');

  // Build chord diagram data from citation flows
  const chordData = useMemo(() => {
    if (!citationFlows) return null;
    const decadeFlows = citationFlows.filter(f => f.decade === selectedDecade);
    if (decadeFlows.length === 0) return null;
    const companies = [...new Set([...decadeFlows.map(f => f.source), ...decadeFlows.map(f => f.target)])];
    const idxMap: Record<string, number> = {};
    companies.forEach((c, i) => { idxMap[c] = i; });
    const matrix = companies.map(() => companies.map(() => 0));
    decadeFlows.forEach(f => {
      const si = idxMap[f.source];
      const ti = idxMap[f.target];
      if (si !== undefined && ti !== undefined) matrix[si][ti] = f.citation_count;
    });
    const nodes = companies.map((c, i) => ({ name: c, color: BUMP_COLORS[i % BUMP_COLORS.length] }));
    return { nodes, matrix };
  }, [citationFlows, selectedDecade]);

  const decades = useMemo(() => {
    if (!citationFlows) return [];
    return [...new Set(citationFlows.map(f => f.decade))].sort();
  }, [citationFlows]);

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

  const { lagBySectionPivot, lagSections } = useMemo(() => {
    if (!citeLagBySection) return { lagBySectionPivot: [], lagSections: [] };
    const sections = [...new Set(citeLagBySection.map(d => d.section))].sort();
    const decades = [...new Set(citeLagBySection.map(d => d.decade_label))].sort();
    const pivoted = decades.map(decade => {
      const row: Record<string, any> = { decade };
      citeLagBySection.filter(d => d.decade_label === decade).forEach(d => {
        row[d.section] = d.median_lag_years;
      });
      return row;
    });
    return { lagBySectionPivot: pivoted, lagSections: sections };
  }, [citeLagBySection]);

  return (
    <div>
      <ChapterHeader
        number={7}
        title="The Knowledge Network"
        subtitle="How patents build on prior knowledge"
      />

      <KeyFindings>
        <li>Patent citations have grown exponentially — the average patent now cites significantly more prior art than in the 1970s, reflecting denser knowledge networks.</li>
        <li>Government-funded patents receive more <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> on average, suggesting that public R&D investment generates higher-impact innovations.</li>
        <li>Cross-technology citation flows have intensified, with patents increasingly building on knowledge from distant fields.</li>
        <li>Citation patterns reveal that knowledge diffuses across geographic and organizational boundaries more readily than in earlier decades.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          The average citation lag now reaches back over 10 years, up from roughly 7 years in the 1980s, reflecting an expanding base of relevant prior art. Government-funded patents -- driven by the Bayh-Dole Act of 1980 -- receive substantially more forward citations than privately funded patents, with the Department of Defense, Department of Energy, and NIH as the top funding agencies. Citation lag has generally decreased over time, suggesting faster knowledge diffusion, while corporate citation flows reveal asymmetric knowledge dependencies among the top patent filers.
        </p>
      </aside>

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
        insight="The growth in backward citations reflects both the expanding knowledge base and changes in patent office practices encouraging more thorough prior art disclosure."
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
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
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
        insight="The lengthening citation lag shows that foundational knowledge has an increasingly long useful life, with modern patents reaching further back in time to reference prior art."
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
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
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
        insight="Government-funded patents consistently outperform private patents in citation impact, validating the role of public R&D investment in generating foundational innovations."
      >
        <PWLineChart
          data={gov ?? []}
          xKey="year"
          lines={[
            { key: 'count', name: 'Government-Funded Patents', color: CHART_COLORS[5] },
          ]}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The <GlossaryTooltip term="Bayh-Dole Act">Bayh-Dole Act</GlossaryTooltip> of 1980 fundamentally changed the landscape of government-funded
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
        insight="Federal agencies like DoD, DOE, and NIH fund research that leads to thousands of patents, often representing foundational technologies enabling subsequent waves of commercial innovation."
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

      <SectionDivider label="Citation Lag Analysis" />
      <Narrative>
        <p>
          How quickly does knowledge flow through the patent system? The citation lag --
          the time between when a patent is granted and when it is cited by a subsequent
          patent -- measures the speed of knowledge diffusion. Shorter lags suggest faster
          uptake of ideas, while longer lags may indicate foundational work that takes
          years to be recognized.
        </p>
      </Narrative>
      <ChartContainer
        title="Median Citation Lag Over Time"
        caption="Median time (in years) between a cited patent's grant date and the citing patent's grant date."
        loading={cltL}
        insight="The declining citation lag suggests knowledge is flowing faster through the patent system, likely driven by digital search tools that make prior art easier to discover."
      >
        {citeLagTrend && (
          <PWLineChart
            data={citeLagTrend}
            xKey="year"
            lines={[
              { key: 'median_lag_years', name: 'Median Citation Lag (years)', color: CHART_COLORS[0] },
              { key: 'avg_lag_years', name: 'Average Citation Lag (years)', color: CHART_COLORS[2] },
            ]}
            yLabel="Years"
            yFormatter={(v: number) => v.toFixed(1)}
            referenceLines={filterEvents(PATENT_EVENTS, { only: [1980, 2001, 2008] })}
          />
        )}
      </ChartContainer>
      <ChartContainer
        title="Median Citation Lag by Technology Area"
        caption="Median citation lag in years by CPC section and decade."
        loading={clsL}
        insight="The increasing density of the citation network means that modern inventions build on a broader base of prior knowledge, accelerating the pace of cumulative innovation."
      >
        {lagBySectionPivot.length > 0 && (
          <PWLineChart
            data={lagBySectionPivot}
            xKey="decade"
            lines={lagSections.map(section => ({
              key: section,
              name: `${section}: ${CPC_SECTION_NAMES[section] ?? section}`,
              color: CPC_SECTION_COLORS[section],
            }))}
            yLabel="Median Lag (years)"
            yFormatter={(v: number) => v.toFixed(1)}
          />
        )}
      </ChartContainer>
      <KeyInsight>
        <p>
          Citation lag has generally decreased over time, suggesting that knowledge is
          flowing faster through the patent system. The decline accelerated in the 2000s,
          likely driven by digital search tools that make prior art easier to discover.
          Technology areas like Physics and Electricity tend to have shorter citation lags,
          consistent with rapid innovation cycles in computing and electronics, while
          Chemistry and Human Necessities (including pharmaceuticals) show longer lags
          reflecting the extended development timelines in those fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Corporate Citation Flows" />

      <Narrative>
        <p>
          How do major companies cite each other&apos;s patents? The{' '}
          <GlossaryTooltip term="chord diagram">chord diagram</GlossaryTooltip> below maps directed
          citation flows between the top patent-filing organizations. Wider ribbons indicate more
          citations flowing from one company to another, revealing{' '}
          <StatCallout value="knowledge dependencies" /> across the corporate landscape.
        </p>
      </Narrative>

      <div className="my-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Decade:</span>
        <div className="flex gap-1.5 flex-wrap">
          {decades.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDecade(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedDecade === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer
        title={`Corporate Citation Network (${selectedDecade})`}
        caption="Directed citation flows between top patent filers. Arc size = total citations. Ribbon width = flow volume. Hover for details."
        insight="Citation flows reveal asymmetric knowledge dependencies. Some companies are primarily knowledge producers (heavily cited but cite few peers), while others are integrators (drawing broadly from multiple sources)."
        loading={cfL}
        height={700}
        wide
      >
        {chordData ? (
          <PWChordDiagram
            nodes={chordData.nodes}
            matrix={chordData.matrix}
          />
        ) : <div />}
      </ChartContainer>

      <SectionDivider label="Technology Citation Leaders" />

      <Narrative>
        <p>
          Within each technology area, a few companies consistently receive the most citations
          from peers — these are the <StatCallout value="technology leaders" /> whose patents
          form the foundation for subsequent innovation.
        </p>
      </Narrative>

      {techLeadership && (
        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Window</th>
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 font-medium">Rank</th>
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 text-right font-medium">Citations Received</th>
              </tr>
            </thead>
            <tbody>
              {techLeadership.filter(t => t.rank <= 3).slice(0, 50).map((t, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-xs">{t.window}</td>
                  <td className="py-2 pr-4">{t.section}: {CPC_SECTION_NAMES[t.section] ?? t.section}</td>
                  <td className="py-2 pr-4 font-mono">#{t.rank}</td>
                  <td className="py-2 pr-4 font-medium">{t.company}</td>
                  <td className="py-2 text-right font-mono text-xs">{formatCompact(t.citations_received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionDivider label="Citation Half-Life" />

      <Narrative>
        <p>
          How quickly do a company&apos;s patents accumulate their citations? The{' '}
          <GlossaryTooltip term="citation half-life">citation half-life</GlossaryTooltip> — the
          time to accumulate 50% of total citations — distinguishes companies whose patents
          have <StatCallout value="immediate vs. foundational impact" />.
        </p>
      </Narrative>

      <ChartContainer
        title="Citation Half-Life by Company"
        caption="Years until a company's patents accumulate 50% of their total forward citations. Only patents 15+ years old are included to ensure a full citation window."
        insight="Pharmaceutical and chemical companies tend to have longer citation half-lives, reflecting the slow but steady accumulation of citations in science-intensive fields. Electronics and IT companies show shorter half-lives, with citations peaking shortly after grant."
        loading={chlL}
        height={600}
      >
        {citationHalfLife ? (
          <PWBarChart
            data={citationHalfLife.sort((a, b) => b.half_life_years - a.half_life_years).slice(0, 30)}
            xKey="company"
            bars={[{ key: 'half_life_years', name: 'Half-Life (years)', color: CHART_COLORS[6] }]}
            layout="vertical"
            yLabel="Years"
          />
        ) : <div />}
      </ChartContainer>

      <DataNote>
        Citation data from PatentsView includes US patent citations only. Government
        interest is identified through the g_gov_interest table. Citation categories
        and lag calculations exclude records with missing dates. Citation lag is measured as the time between the cited patent&apos;s grant date and the citing patent&apos;s grant date. Corporate citation flows aggregate all citations between pairs of the top 30 assignees per decade. Citation half-life uses patents granted before 2010 to ensure at least 15 years of citation accumulation.
      </DataNote>

      <RelatedChapters currentChapter={7} />
      <ChapterNavigation currentChapter={7} />
    </div>
  );
}
