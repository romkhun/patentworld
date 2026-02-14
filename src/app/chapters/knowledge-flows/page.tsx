'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import dynamic from 'next/dynamic';
const PWChordDiagram = dynamic(() => import('@/components/charts/PWChordDiagram').then(m => ({ default: m.PWChordDiagram })), { ssr: false, loading: () => <div /> });
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { cleanOrgName } from '@/lib/orgNames';
import { formatCompact } from '@/lib/formatters';
import type {
  CorporateCitationFlow, TechLeadership, CitationHalfLife,
  CorpDiversification, SelfCitationByAssignee,
} from '@/lib/types';

export default function KnowledgeFlows() {
  const { data: citationFlows, loading: cfL } = useChapterData<CorporateCitationFlow[]>('company/corporate_citation_network.json');
  const { data: techLeadership } = useChapterData<TechLeadership[]>('company/tech_leadership.json');
  const { data: citationHalfLife, loading: chlL } = useChapterData<CitationHalfLife[]>('company/citation_half_life.json');
  const { data: corpDiv, loading: cpL } = useChapterData<CorpDiversification[]>('chapter7/corp_diversification.json');
  const { data: selfCiteAssignee, loading: scaL } = useChapterData<SelfCitationByAssignee[]>('chapter9/self_citation_by_assignee.json');

  const [selectedDecade, setSelectedDecade] = useState<string | number | null>(null);

  const sectionKeys = Object.keys(CPC_SECTION_NAMES).filter((k) => k !== 'Y');

  // Corporate citation flows (chord diagram)
  const decades = useMemo(() => {
    if (!citationFlows) return [];
    return [...new Set(citationFlows.map(f => f.decade))].sort();
  }, [citationFlows]);

  const effectiveDecade = selectedDecade ?? (decades.length > 0 ? decades[decades.length - 1] : null);

  const chordData = useMemo(() => {
    if (!citationFlows || effectiveDecade == null) return null;
    const decadeFlows = citationFlows.filter(f => String(f.decade) === String(effectiveDecade));
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
  }, [citationFlows, effectiveDecade]);

  // Corporate technology portfolios (stacked bar)
  const corpDivLate = useMemo(() => {
    if (!corpDiv) return [];
    const orgs = [...new Set(corpDiv.map((d) => d.organization))];
    return orgs.map((org) => {
      const row: any = { organization: cleanOrgName(org) };
      let total = 0;
      corpDiv.filter((d) => d.organization === org && d.era === 'late').forEach((d) => {
        row[d.section] = d.count;
        total += d.count;
      });
      row._total = total;
      return row;
    }).sort((a: any, b: any) => b._total - a._total);
  }, [corpDiv]);

  return (
    <div>
      <ChapterHeader
        number={14}
        title="Knowledge Flows"
        subtitle="Inter-firm citation networks, half-lives, and self-citation dynamics"
      />

      <KeyFindings>
        <li>Corporate citation flows among the top 30 filers reveal asymmetric knowledge dependencies, with certain firms functioning as knowledge producers and others as integrators.</li>
        <li>Citation half-lives range from 6.3 years (Huawei) to 14.3 years (US Air Force), with pharmaceutical firms exhibiting longer half-lives than electronics and IT firms.</li>
        <li>IBM (88,600 G-section patents) and Samsung (79,400 H-section patents) maintain the most diversified technology portfolios among the top ten patent holders.</li>
        <li>Canon (47.6%), TSMC (38.4%), and Micron (25.3%) exhibit the highest self-citation rates, reflecting deep cumulative R&amp;D programs in imaging and semiconductor technologies.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Citation flows among the 30 largest patent filers expose asymmetric knowledge dependencies that shift by decade, with citation half-lives ranging from 6.3 years for fast-cycle electronics firms to over 14 years for science-intensive organizations. Self-citation rates vary from under 5% to nearly 48%, distinguishing firms that build cumulatively on internal prior art from those that draw broadly on external knowledge.
        </p>
      </aside>

      <Narrative>
        <p>
          The pattern of inter-firm patent citations reveals structural knowledge dependencies that are not visible in aggregate patent counts alone. When Samsung cites an IBM patent, it signals a flow of technical knowledge from one organization to another -- and when these flows are aggregated across thousands of patents, they expose the architecture of corporate knowledge exchange. This chapter maps those flows, measures the temporal dynamics of citation accumulation, examines how firms distribute their innovation across technology domains, and quantifies self-citation patterns that distinguish cumulative internal R&amp;D from broad external knowledge sourcing.
        </p>
        <p>
          Building on the firm-level innovation profiles established in <Link href="/chapters/assignee-landscape" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link>, the analysis here shifts from individual firm characteristics to the relationships between firms. The <GlossaryTooltip term="chord diagram">chord diagram</GlossaryTooltip> below maps directed citation flows among the most prolific patent filers, while subsequent figures examine citation half-lives, technology portfolio composition, and self-citation dynamics.
        </p>
      </Narrative>

      {/* ── Citation Networks ── */}

      <SectionDivider label="Citation Networks" />

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
              key={String(d)}
              onClick={() => setSelectedDecade(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${String(effectiveDecade) === String(d) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {String(d)}s
            </button>
          ))}
        </div>
      </div>

      <ChartContainer
        id="fig-knowledge-flows-corporate-citation-flows"
        subtitle="Directed citation flows among the top 30 patent filers shown as a chord diagram, with ribbon width proportional to citation volume."
        title={`Corporate Citation Flows Among Top 30 Filers Reveal Asymmetric Knowledge Dependencies (${effectiveDecade ?? ''}s)`}
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

      {/* ── Citation Half-Lives ── */}

      <SectionDivider label="Citation Half-Lives" />

      <Narrative>
        <p>
          The rate at which a firm&apos;s patents accumulate citations varies considerably. The{' '}
          <GlossaryTooltip term="citation half-life">citation half-life</GlossaryTooltip> -- the
          time required to accumulate 50% of total citations -- distinguishes firms whose patents
          have <StatCallout value="immediate versus foundational impact" />.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-knowledge-flows-citation-half-life"
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

      {/* ── Corporate Technology Portfolios ── */}

      <SectionDivider label="Corporate Technology Portfolios" />

      {corpDivLate.length > 0 && (
        <ChartContainer
          id="fig-knowledge-flows-corp-diversification"
          subtitle="Distribution of patent grants across CPC technology sections for the ten largest assignees (2001-2025), shown as stacked bars."
          title="IBM (88,600 G-Section Patents) and Samsung (79,400 H-Section Patents) Maintain the Most Diversified Technology Portfolios Among the Top Ten Patent Holders (2001-2025)"
          caption="This chart displays the distribution of patent grants across CPC technology sections for the ten largest patent holders in the 2001-2025 period. IBM and Samsung exhibit the broadest portfolio diversification, spanning physics, electricity, and chemistry, whereas firms such as Intel concentrate in semiconductor-related classifications."
          loading={cpL}
          height={650}
          insight="Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings, as the most persistent leaders maintain diversified technology portfolios."
        >
          <PWBarChart
            data={corpDivLate}
            xKey="organization"
            bars={sectionKeys.map((key) => ({
              key,
              name: `${key}: ${CPC_SECTION_NAMES[key]}`,
              color: CPC_SECTION_COLORS[key],
            }))}
            layout="vertical"
            stacked
            yLabel="Number of Patents"
          />
        </ChartContainer>
      )}

      <Narrative>
        <p>
          The technology portfolios of major patent holders illustrate how firms diversify their
          innovation across fields. IBM and Samsung maintain broadly diversified portfolios spanning
          physics, electricity, and chemistry, whereas firms such as Intel concentrate predominantly in
          semiconductor-related physics and electricity classifications.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Portfolio breadth appears to correlate with firm longevity at the top of the patent rankings.
          The most persistent leaders -- IBM, Samsung, Canon -- maintain diversified technology
          portfolios, whereas more specialized firms tend to rise and fall with the trajectories
          of their core technology domains.
        </p>
      </KeyInsight>

      {/* ── Quality Concentration: Self-Citation ── */}

      <SectionDivider label="Self-Citation Patterns" />

      <Narrative>
        <p>
          Self-citation patterns reveal meaningful differences in how firms accumulate
          knowledge. In patent-dense fields such as semiconductors and electronics, elevated self-citation
          rates may reflect genuine cumulative innovation, with each patent building upon the firm&apos;s
          previous work.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-knowledge-flows-self-citation-by-assignee"
        subtitle="Self-citation rate (fraction of backward citations to same assignee) for the 20 most-cited assignees, revealing knowledge recycling patterns."
        title="Canon (47.6%), TSMC (38.4%), and Micron (25.3%) Exhibit the Highest Self-Citation Rates Among Top Assignees"
        caption="This chart displays the fraction of all backward citations that are self-citations (citing the same assignee's earlier patents), for the 20 most-cited assignees. Canon (47.6%), TSMC (38.4%), and Micron (25.3%) exhibit the highest self-citation rates, reflecting deep cumulative R&D programs in imaging and semiconductor technologies."
        insight="Elevated self-citation rates among firms with cumulative R&D programs are consistent with long-term knowledge building on internal prior art, though strategic considerations may also contribute."
        loading={scaL}
        height={700}
      >
        <PWBarChart
          data={(selfCiteAssignee ?? []).map(d => ({
            ...d,
            label: cleanOrgName(d.organization),
            self_cite_pct: d.self_cite_rate,
          }))}
          xKey="label"
          bars={[{ key: 'self_cite_pct', name: 'Self-Citation Rate (%)', color: CHART_COLORS[6] }]}
          layout="vertical"
          yFormatter={(v) => `${v.toFixed(1)}%`}
        />
      </ChartContainer>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The knowledge flow patterns documented here -- from asymmetric citation dependencies and varying citation half-lives to divergent self-citation strategies -- reveal that inter-firm knowledge exchange is highly structured rather than random. These structural dependencies set the stage for the next chapter, <Link href="/chapters/exploration-strategy" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Exploration &amp; Exploitation</Link>, which examines whether firms are entering new technology domains or deepening established ones, and how these strategic choices shape innovation outcomes.
        </p>
      </Narrative>

      <DataNote>
        Corporate citation flows aggregate all citations between pairs of the top 30 assignees per
        decade. Technology leadership ranks firms by total citations received within each CPC section
        per time window. Citation half-life uses patents granted before 2010 to ensure at least 15
        years of citation accumulation. Corporate technology portfolios use CPC section-level
        classification for the late period (2001-2025). Self-citation rates measure the fraction of
        backward citations directed to the same assignee. Organization names are disambiguated
        identities from PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={14} />
      <ChapterNavigation currentChapter={14} />
    </div>
  );
}
