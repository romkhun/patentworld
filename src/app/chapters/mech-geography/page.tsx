'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import Link from 'next/link';

import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { CoInventionRate, CoInventionBySection, IntlCollaboration } from '@/lib/types';

export default function MechGeographyChapter() {
  // ── Data hooks ────────────────────────────────────────────────────────
  const { data: intlCollab, loading: icL } = useChapterData<IntlCollaboration[]>('chapter7/intl_collaboration.json');
  const { data: coInvention, loading: ciL } = useChapterData<CoInventionRate[]>('chapter6/co_invention_rates.json');
  const { data: coInventionBySec, loading: cisL } = useChapterData<CoInventionBySection[]>('chapter6/co_invention_us_china_by_section.json');
  const { data: diffusionSummary } = useChapterData<{ tech_area: string; periods: { period: string; total_cities: number; total_patents: number }[] }[]>('chapter4/innovation_diffusion_summary.json');

  // Analysis 36: Citation Localization
  const { data: citationLocalization, loading: clcL } = useChapterData<any[]>('chapter22/citation_localization.json');

  // ── Derived state: co-invention rates pivot ───────────────────────────
  const { coInventionPivot, coInventionPartners } = useMemo(() => {
    if (!coInvention) return { coInventionPivot: [], coInventionPartners: [] };
    const partners = [...new Set(coInvention.map(d => d.partner))];
    const years = [...new Set(coInvention.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      coInvention.filter(d => d.year === year).forEach(d => {
        row[d.partner] = d.co_invention_rate;
      });
      return row;
    });
    return { coInventionPivot: pivoted, coInventionPartners: partners };
  }, [coInvention]);

  // ── Derived state: US-China by section pivot ──────────────────────────
  const { usChinaSecPivot, usChinaSections } = useMemo(() => {
    if (!coInventionBySec) return { usChinaSecPivot: [], usChinaSections: [] };
    const sections = [...new Set(coInventionBySec.map(d => d.section))].sort();
    const years = [...new Set(coInventionBySec.map(d => d.year))].sort();
    const pivoted = years.map(year => {
      const row: Record<string, unknown> = { year };
      coInventionBySec.filter(d => d.year === year).forEach(d => {
        row[d.section] = d.us_cn_count;
      });
      return row;
    });
    return { usChinaSecPivot: pivoted, usChinaSections: sections };
  }, [coInventionBySec]);

  return (
    <div>
      <ChapterHeader
        number={22}
        title="Geographic Mechanics"
        subtitle="Cross-border collaboration and innovation diffusion"
      />
      <MeasurementSidebar slug="mech-geography" />

      <KeyFindings>
        <li>International co-invention increased from 1.0% of patents in 1976 to 10.0% in 2025 (through September), reflecting the globalization of corporate R&D and increasing talent mobility.</li>
        <li>US-China co-invention rates have grown substantially, surpassing 2% by 2025 (through September), though growth rates moderated in certain technology areas after 2018.</li>
        <li>Innovation in AI, Biotech, and Clean Energy exhibits a consistent diffusion pattern: early concentration in a small number of pioneering cities followed by geographic spread to secondary hubs.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          This chapter examines how innovation moves across borders and diffuses across cities. International co-invention has grown from 1.0% of all patents in 1976 to 10.0% by 2025 (through September), with the US-China corridor expanding from 77 patents in 2000 to 2,749 in 2024. At the city level, emerging technologies consistently originate in a small number of pioneering locations before spreading geographically as knowledge and talent disperse.
        </p>
      </aside>

      <Narrative>
        <p>
          The geography of collaborative invention operates at multiple scales. At the international level, cross-border co-invention has expanded steadily as multinational firms distribute their research activities across countries and communication technology reduces the friction of remote collaboration. At the bilateral level, specific country-pair corridors — particularly the United States and China — reveal how economic integration, talent mobility, and policy constraints interact. And at the city level, the diffusion of emerging technologies traces a recurring pattern from concentrated origins to broader geographic spread.
        </p>
        <p>
          This chapter brings together these geographic dimensions, drawing on cross-border collaboration data, bilateral co-invention rates, and city-level technology diffusion to map the spatial mechanics of innovation.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Geographic mechanics operate across scales: international collaboration patterns reflect the globalization of corporate R&D and geopolitical context, bilateral dynamics between specific country pairs reveal the interplay of economic integration and policy constraints, and city-level diffusion patterns show how technologies spread from pioneering hubs to secondary locations over time.
        </p>
      </KeyInsight>

      {/* ── Section 1: Domestic versus International ─────────────────────────── */}
      <SectionDivider label="Domestic versus International" />

      <ChartContainer
        id="fig-mech-geo-intl-collaboration"
        subtitle="Annual count and percentage of patents listing inventors from two or more countries, tracking the growth of cross-border co-invention."
        title="International Co-Invention Increased from 1.0% in 1976 to 10.0% of All Patents by 2025 (through September)"
        caption="The figure displays the annual count and percentage of patents listing inventors from two or more countries. International co-invention has increased from 1.0% of all patents in 1976 to 10.0% by 2025 (through September), with the most rapid growth occurring during the 2010s."
        loading={icL}
        insight="The growth of international co-invention is consistent with both the globalization of corporate R&D and the increasing mobility of scientific talent."
      >
        <PWLineChart
          data={intlCollab ?? []}
          xKey="year"
          lines={[
            { key: 'intl_collab_count', name: 'International Collaboration Patents', color: CHART_COLORS[0], yAxisId: 'left' },
            { key: 'intl_collab_pct', name: 'International Collaboration Share (%)', color: CHART_COLORS[2], yAxisId: 'right' },
          ]}
          yLabel="Number of Patents"
          rightYLabel="Share (%)"
          rightYFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2011] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The growth of international collaboration in patenting is consistent with the globalization of corporate R&D. Multinational firms increasingly distribute their research activities across multiple countries, utilizing local talent pools and regulatory environments. The result is an expanding network of cross-border co-invention that transcends traditional national innovation systems.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          International collaboration has increased from 1.0% of patents in 1976 to 10.0% by 2025 (through September). This trend is consistent with the expansion of multinational R&D operations, global talent mobility, and the increasing feasibility of remote scientific collaboration. The rate of growth accelerated in the 2000s as communication technology reduced the transaction costs of cross-border teamwork.
        </p>
      </KeyInsight>

      {/* ── Section 2: By Country ─────────────────────────────────────────── */}
      <SectionDivider label="By Country" />

      <Narrative>
        <p>
          International co-invention rates — the share of US patents with inventors from multiple countries — illuminate the evolving geography of collaborative innovation. US-China co-invention has grown substantially from near zero in the 1990s to over 2% by 2025 (through September), though growth rates moderated in certain technology areas after 2018, coinciding with new US export control regulations and entity list restrictions.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-mech-geo-co-invention-rates"
        subtitle="Share of US patents co-invented with each partner country (1976–2025), measured as the percentage with at least one US and one foreign inventor."
        title="US-China Co-Invention Rates Have Grown Substantially, Surpassing 2% by 2025 (through September)"
        caption="Share of US patents co-invented with each partner country, 1976–2025. A co-invented patent includes at least one inventor in the US and at least one in the partner country. US-China co-invention has grown substantially since China's WTO accession in 2001, reaching over 2% by 2025 (through September)."
        insight="US-China co-invention has grown substantially since China's WTO accession in 2001, reaching over 2% by 2025 (through September), though growth rates have moderated in some technology areas. US-India collaboration has also emerged as a growing pathway."
        loading={ciL}
      >
        <PWLineChart
          data={coInventionPivot}
          xKey="year"
          lines={coInventionPartners.map((p, i) => ({
            key: p,
            name: `US-${p}`,
            color: BUMP_COLORS[i % BUMP_COLORS.length],
          }))}
          yLabel="Co-invention Rate (%)"
          yFormatter={(v: number) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2001, 2008] })}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-mech-geo-us-china-by-section"
        subtitle="Annual count of US-China co-invented patents broken down by CPC technology section, shown as a stacked area chart."
        title="US-China Co-Invention Grew from 77 Patents in 2000 to 2,749 in 2024, Led by Electricity (H) and Physics (G)"
        caption="Annual count of US patents co-invented with Chinese inventors, disaggregated by CPC section. All CPC sections have grown over time, though growth rates moderated across some technology areas in recent years."
        insight="US-China collaboration has grown across most CPC technology sections. Growth trajectories varied by technology area, with Electricity (H) and Operations &amp; Transport (B) continuing to grow while Chemistry (C) declined by approximately one-third between 2020 and 2023."
        loading={cisL}
        height={500}
      >
        <PWAreaChart
          data={usChinaSecPivot}
          xKey="year"
          areas={usChinaSections.map(s => ({
            key: s,
            name: `${s}: ${CPC_SECTION_NAMES[s] ?? s}`,
            color: CPC_SECTION_COLORS[s] ?? CHART_COLORS[0],
          }))}
          stacked
          yLabel="Number of Patents"
          referenceLines={filterEvents(PATENT_EVENTS, { only: [2001, 2008] })}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The US-China co-invention data indicate substantial growth across most technology areas, though growth rates moderated in certain sectors after 2018, coinciding with new export control regulations and entity list restrictions. The broad-based nature of this collaboration suggests deeply integrated research ties that span multiple technology domains, even as export control and entity list changes after 2018 have introduced new constraints on cross-border collaboration.
        </p>
      </KeyInsight>

      {/* ── Section 3: By City ────────────────────────────────────────────── */}
      <SectionDivider label="By City" />

      <Narrative>
        <p>
          Tracking patent activity in AI, Biotech &amp; Pharma, and Clean Energy across cities reveals a consistent diffusion pattern: innovations typically originate in a small number of pioneering locations before spreading geographically as knowledge and talent disperse to secondary hubs.
        </p>
      </Narrative>

      {diffusionSummary && diffusionSummary.length > 0 && (
        <div className="max-w-3xl mx-auto my-8">
          {diffusionSummary.map((tech) => (
            <div key={tech.tech_area} className="mb-6">
              <h3 className="text-sm font-semibold mb-2">{tech.tech_area}</h3>
              <div className="flex gap-4 overflow-x-auto text-xs">
                {tech.periods.filter(p => p.total_patents > 0).map((p) => (
                  <div key={p.period} className="flex-shrink-0 text-center px-3 py-2 rounded-lg bg-muted/50">
                    <div className="font-mono font-medium">{p.period}</div>
                    <div className="text-muted-foreground">{p.total_cities} cities</div>
                    <div className="font-semibold">{p.total_patents.toLocaleString('en-US')} patents</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <KeyInsight>
        <p>
          All three technology areas exhibit a consistent diffusion pattern: early concentration in a small number of pioneering cities followed by geographic spread. AI patenting was predominantly concentrated in Silicon Valley and several East Coast hubs in the 1990s but has since spread to dozens of cities worldwide. Biotech demonstrates a similar pattern anchored by Boston, San Francisco, and San Diego. Clean energy patenting remains more geographically dispersed, reflecting the heterogeneous nature of renewable technologies.
        </p>
      </KeyInsight>

      {/* ── Analysis 36: Citation Localization ────────────────────────────── */}
      <SectionDivider label="Citation Localization" />

      <Narrative>
        <p>
          Citation localization measures the degree to which patents cite other patents from the same country. A high same-country citation share indicates persistent home-country bias in knowledge flows, while a declining share would suggest increasing internationalization of the knowledge base that inventors draw upon.
        </p>
      </Narrative>

      {citationLocalization && citationLocalization.length > 0 && (
        <ChartContainer
          id="fig-mech-geo-citation-localization"
          subtitle="Share of patent citation pairs where citing and cited patents originate from the same country, by 5-year period."
          title="Home-Country Citation Bias Remains Persistent at 58–64%, Despite Rising International Collaboration"
          caption="The figure displays the share of citation pairs where both the citing and cited patents originate from the same country, tracked over successive 5-year periods. Despite the substantial increase in international collaboration documented elsewhere, home-country citation bias has remained stable at 58–64% throughout the study period, suggesting that geographic proximity continues to shape knowledge flows."
          insight="The persistence of home-country citation bias at 58–64% despite rising international collaboration suggests that geographic and institutional proximity continues to exert a strong influence on the direction of knowledge flows, even in an increasingly globalized innovation system."
          loading={clcL}
        >
          <PWLineChart
            data={citationLocalization}
            xKey="period"
            lines={[{ key: 'same_country_pct', name: 'Same-Country Citation Share (%)', color: CHART_COLORS[0] }]}
            yLabel="Same-Country Citation Share (%)"
            yFormatter={(v) => `${(v as number).toFixed(1)}%`}
          />
        </ChartContainer>
      )}

      <KeyInsight>
        <p>
          The stable home-country citation bias — hovering between 58% and 64% across five decades — is one of the most notable findings in the geography of knowledge flows. Despite the substantial increase in international co-invention (from 1% to 10% of patents) and the globalization of corporate R&D, inventors continue to cite patents from their own country at the same rate as in the 1980s. This persistence suggests that tacit knowledge, language, institutional proximity, and local knowledge networks continue to shape how inventors identify and build upon prior art.
        </p>
      </KeyInsight>

      {/* ── Closing Transition ────────────────────────────────────────────── */}
      <Narrative>
        <p>
          The cross-border collaboration and innovation diffusion patterns documented in this chapter
          complete ACT 5: The Mechanics, which traced how knowledge flows through the innovation system
          at the organizational, individual, and geographic levels. Chapters 20&ndash;22 revealed that
          knowledge transfer operates through distinct but interconnected channels — inter-firm citation
          networks, inventor mobility and collaboration ties, and cross-border co-invention corridors --
          each shaping how ideas propagate from their origins to new applications and locations.
        </p>
        <p>
          ACT 6 shifts from these system-wide perspectives to{' '}
          <Link href="/chapters/deep-dive-overview/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">deep dives</Link>{' '}
          into specific technology domains — from 3D printing and agricultural technology to AI,
          autonomous vehicles, biotechnology, and beyond. Each deep dive applies the analytical
          frameworks developed across the preceding five acts to a single field, revealing how
          domain-specific dynamics interact with the broader structural patterns documented here.
        </p>
      </Narrative>

      <InsightRecap
        learned={[
          "International co-invention increased from 1.0% in 1976 to 10.0% in 2025 (through September), reflecting the globalization of R&D activity.",
          "US-China co-invention grew from 77 patents in 2000 to 2,749 in 2024, making it one of the fastest-growing bilateral research corridors.",
        ]}
        falsifiable="If cross-border co-invention reflects genuine knowledge complementarities rather than cost arbitrage, then internationally co-invented patents should have higher citation impact than purely domestic patents in the same technology and year."
        nextAnalysis={{
          label: "3D Printing",
          description: "The first of twelve technology deep dives — how additive manufacturing moved from niche to mainstream",
          href: "/chapters/3d-printing/",
        }}
      />

      <DataNote>
        International co-invention identifies patents listing inventors from two or more countries. Co-invention rates measure the share of US patents with at least one US and one foreign inventor. US-China co-invention counts are disaggregated by CPC section based on the primary classification of each patent. Innovation diffusion tracks patent activity in AI, Biotech &amp; Pharma, and Clean Energy across cities with 5+ patents per period.
      </DataNote>

      <RelatedChapters currentChapter={22} />
      <ChapterNavigation currentChapter={22} />
    </div>
  );
}
