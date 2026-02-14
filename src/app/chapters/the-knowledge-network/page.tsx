'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
import dynamic from 'next/dynamic';
const PWChordDiagram = dynamic(() => import('@/components/charts/PWChordDiagram').then(m => ({ default: m.PWChordDiagram })), { ssr: false });
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
  useChapterData<CitationLagTrend[]>('chapter6/citation_lag_trend.json');
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
        subtitle="Citation networks, knowledge diffusion, and the role of public funding"
      />

      <KeyFindings>
        <li>Patent citations have grown substantially -- the average patent now cites considerably more prior art than in the 1970s, reflecting denser knowledge networks.</li>
        <li>Government-funded patents receive more <GlossaryTooltip term="forward citations">forward citations</GlossaryTooltip> on average, suggesting that public R&D investment generates higher-impact innovations.</li>
        <li>Cross-technology citation flows have intensified, with patents increasingly building on knowledge from distant fields.</li>
        <li>Citation patterns indicate that knowledge diffuses across geographic and organizational boundaries more readily than in earlier decades.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Over five decades the temporal reach of patent citations has stretched dramatically -- from a median lag of roughly 3 years in the early 1980s to over 16 years by 2025 -- indicating that the cumulative stock of prior art now demands far deeper backward searches than it once did. Public funding channels, catalyzed by the Bayh-Dole Act of 1980 and led by HHS/NIH, the Department of Defense, and the Department of Energy, account for a disproportionate share of high-impact foundational knowledge, complementing the collaboration networks documented in <Link href="/chapters/collaboration-networks" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Collaboration Networks</Link>. At the corporate level, directed citation flows among the top 30 assignees reveal asymmetric knowledge dependencies: certain firms function primarily as knowledge producers while others operate as integrators drawing broadly from multiple sources, a structural pattern that parallels the talent-flow asymmetries observed in the preceding chapter.
        </p>
      </aside>

      <Narrative>
        <p>
          Each patent is situated within an extensive web of prior art. Citations connect new inventions
          to the knowledge upon which they build, forming a dense network of technological
          lineage. The citation system further illuminates the role of government funding in
          supporting <StatCallout value="foundational research" /> that subsequently serves as
          the basis for commercial innovation.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-knowledge-network-citations-per-patent"
        subtitle="Average and median backward citation counts per utility patent by grant year, showing the expanding knowledge base over time."
        title="Average Backward Citations Per Patent Rose From 4.9 in 1976 to 21.3 in 2023"
        caption="Average and median number of US patent citations per utility patent, by grant year. The widening gap between mean and median indicates a growing right tail of heavily cited patents."
        loading={ciL}
        insight="The growth in backward citations reflects both the expanding knowledge base and changes in patent office practices that encourage more thorough prior art disclosure."
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
          The widening divergence between mean and median citations constitutes a notable structural feature of
          the knowledge network. Although the median patent receives modest citation counts, a growing
          tail of highly cited &quot;landmark&quot; patents elevates the mean. This
          increasing skewness suggests that the distribution of inventive value is becoming
          more concentrated over time, with a small number of breakthrough inventions generating disproportionate
          downstream impact.
        </p>
      </KeyInsight>

      <SectionDivider label="Citation Patterns" />

      <ChartContainer
        id="fig-knowledge-network-citation-lag"
        subtitle="Average and median time in years between a cited patent's grant date and the citing patent's grant date, by year."
        title="Citation Lag Grew From 2.9 Years in 1980 to 16.2 Years in 2025"
        caption="Average and median time (in years) between a cited patent's grant date and the citing patent's grant date. The average citation lag has increased from approximately 3 years in the early 1980s to over 16 years in the most recent period."
        loading={laL}
        insight="The lengthening citation lag indicates that foundational knowledge has an increasingly long useful life, with modern patents reaching further back in time to reference prior art."
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
          The citation lag -- the temporal distance over which patents cite prior art -- has increased steadily,
          indicating that the useful life of patented knowledge continues to extend. Contemporary
          patents draw on an increasingly expansive base of prior art.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          The lengthening citation lag -- from approximately 3 years in the early 1980s to over 16 years
          in the most recent period -- indicates that the expanding body of relevant prior art requires newer patents
          to reach further back in time. This widening temporal window reflects both the cumulative
          nature of technological progress and the increasing searchability of prior art databases.
        </p>
      </KeyInsight>

      <SectionDivider label="Government Funding" />

      <ChartContainer
        id="fig-knowledge-network-gov-funded"
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
        id="fig-knowledge-network-gov-agencies"
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

      <SectionDivider label="Citation Lag by Technology Area" />
      <ChartContainer
        id="fig-knowledge-network-lag-by-section"
        subtitle="Median citation lag in years by CPC technology section and decade, revealing technology-specific differences in knowledge accumulation speed."
        title="Physics and Electricity Show 11-Year Median Lag in the 2020s vs. 17 Years for Chemistry"
        caption="Median citation lag in years by CPC section and decade. Physics (G) and Electricity (H), which encompass computing and electronics, demonstrate consistently shorter lags than Chemistry (C) and Human Necessities (A), reflecting faster innovation cycles in digital technologies."
        loading={clsL}
        insight="The increasing density of the citation network indicates that modern inventions build on a broader base of prior knowledge, which appears to accelerate the pace of cumulative innovation."
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
          Citation lag has increased over time, reflecting the expanding body of relevant
          prior art that newer patents must reference. The growth in lag has been most pronounced
          since the 2000s, as the cumulative stock of patented knowledge has grown substantially.
          Technology areas such as Physics and Electricity tend to exhibit shorter citation lags,
          consistent with rapid innovation cycles in <Link href="/chapters/the-technology-revolution" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">computing and electronics</Link>, whereas
          Chemistry and Human Necessities (including pharmaceuticals) demonstrate longer lags,
          reflecting the extended development timelines characteristic of those fields.
        </p>
      </KeyInsight>

      <SectionDivider label="Corporate Citation Flows" />

      <Narrative>
        <p>
          The pattern of inter-firm patent citations reveals structural knowledge dependencies. The{' '}
          <GlossaryTooltip term="chord diagram">chord diagram</GlossaryTooltip> below maps directed
          citation flows among the most prolific patent-filing organizations. Wider ribbons indicate a greater volume of
          citations flowing from one firm to another, illustrating{' '}
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
        id="fig-knowledge-network-corporate-citation-flows"
        subtitle="Directed citation flows among the top 30 patent filers shown as a chord diagram, with ribbon width proportional to citation volume."
        title={`Corporate Citation Flows Among Top 30 Filers Reveal Asymmetric Knowledge Dependencies (${selectedDecade})`}
        caption="Directed citation flows between the most prolific patent filers. Arc size represents total citations; ribbon width indicates flow volume. Certain firms function primarily as knowledge producers (heavily cited yet citing few peers), whereas others serve as integrators (drawing broadly from multiple sources)."
        insight="Citation flows reveal asymmetric knowledge dependencies. Certain firms function primarily as knowledge producers (heavily cited yet citing few peers), whereas others operate as integrators (drawing broadly from multiple sources)."
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
          Within each technology area, a small number of firms consistently receive the most citations
          from peers. These constitute the <StatCallout value="technology leaders" /> whose patents
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
          The rate at which a firm&apos;s patents accumulate citations varies considerably. The{' '}
          <GlossaryTooltip term="citation half-life">citation half-life</GlossaryTooltip> -- the
          time required to accumulate 50% of total citations -- distinguishes firms whose patents
          have <StatCallout value="immediate versus foundational impact" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-knowledge-network-citation-half-life"
        subtitle="Years until a firm's patents accumulate 50% of total forward citations, using patents 15+ years old to ensure complete citation windows."
        title="Citation Half-Lives Range From 6.3 Years (Huawei) to 14.3 Years (US Air Force)"
        caption="Years until a firm's patents accumulate 50% of their total forward citations. Only patents 15 or more years old are included to ensure a complete citation window. Pharmaceutical and chemical firms demonstrate longer half-lives, whereas electronics and IT firms exhibit shorter ones."
        insight="Pharmaceutical and chemical firms tend to exhibit longer citation half-lives, reflecting the gradual accumulation of citations in science-intensive fields. Electronics and IT firms demonstrate shorter half-lives, with citations peaking shortly after grant."
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

      <Narrative>
        The knowledge network reveals the underlying structure of cumulative innovation. Citation patterns, government funding pathways, and technology leadership transitions collectively demonstrate that innovation is an inherently social and cumulative process. The <Link href="/chapters/innovation-dynamics" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> examines the dynamics of the innovation process itself, including the tempo of patent examination, cross-domain convergence, and the velocity of technological change.
      </Narrative>

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
