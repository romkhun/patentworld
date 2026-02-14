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

import { CHART_COLORS, CPC_SECTION_COLORS, BUMP_COLORS } from '@/lib/colors';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { CoInventionRate, CoInventionBySection, IntlCollaboration } from '@/lib/types';

export default function Chapter25() {
  const { data: coInvention, loading: ciL } = useChapterData<CoInventionRate[]>('chapter6/co_invention_rates.json');
  const { data: coInventionBySec, loading: cisL } = useChapterData<CoInventionBySection[]>('chapter6/co_invention_us_china_by_section.json');
  const { data: intlCollab, loading: icL } = useChapterData<IntlCollaboration[]>('chapter7/intl_collaboration.json');

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
        number={25}
        title="International Collaboration"
        subtitle="Cross-border co-invention rates and bilateral dynamics"
      />

      <KeyFindings>
        <li>International co-invention increased from approximately 2% of patents in the 1980s to reaching 10% in recent years, with the most rapid growth occurring during the 2010s.</li>
        <li>US-China co-invention rates have grown substantially, surpassing 2% by 2025, though growth rates moderated across certain technology areas amid trade tensions and export controls.</li>
        <li>US-China co-invention grew from 77 patents in 2000 to 2,749 in 2024, led by Electricity (H) and Physics (G), while Chemistry (C) declined by roughly a third between 2020 and 2023.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          International co-invention has expanded from roughly 2% of all patents in the 1980s to 10% in recent years, driven by the globalization of corporate R&D and increasing talent mobility. The US-China co-invention corridor grew from 77 patents in 2000 to 2,749 in 2024, although chemistry-related collaboration declined by approximately one-third between 2020 and 2023 amid tightening export controls.
        </p>
      </aside>

      <Narrative>
        <p>
          The geography of collaborative invention has become increasingly international over the past four decades.
          As multinational firms distribute their research activities across multiple countries and communication
          technology reduces the transaction costs of cross-border teamwork, the share of patents listing inventors
          from two or more countries has grown steadily. This chapter examines both the broad trend toward international
          co-invention and the specific dynamics of the US-China collaboration corridor.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          International collaboration patterns reflect both the globalization of corporate R&D and the
          geopolitical context in which innovation occurs. While cross-border co-invention has increased
          broadly, bilateral dynamics between specific country pairs -- particularly the United States and
          China -- reveal the interplay of economic integration, talent mobility, and policy constraints.
        </p>
      </KeyInsight>

      <SectionDivider label="Global Collaboration" />

      <ChartContainer
        id="fig-collaboration-intl-collaboration"
        subtitle="Annual count and percentage of patents listing inventors from two or more countries, tracking the growth of cross-border co-invention."
        title="International Co-Invention Increased from Approximately 2% in the 1980s to Reaching 10% of All Patents"
        caption="This chart displays the annual count and percentage of patents listing inventors from two or more countries. International co-invention has increased from approximately 2% of all patents in the 1980s to reaching 10% in recent years, with the most rapid growth occurring during the 2010s."
        loading={icL}
        insight="The growth of international co-invention is consistent with both the globalization of corporate R&D and the increasing mobility of scientific talent."
      >
        <PWLineChart
          data={intlCollab ?? []}
          xKey="year"
          lines={[
            { key: 'intl_collab_count', name: 'International Collaboration Patents', color: CHART_COLORS[0], yAxisId: 'left' },
            { key: 'intl_collab_pct', name: 'International Collaboration %', color: CHART_COLORS[2], yAxisId: 'right' },
          ]}
          yLabel="Number of Patents"
          rightYLabel="Share (%)"
          rightYFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={filterEvents(PATENT_EVENTS, { only: [1995, 2008, 2011] })}
        />
      </ChartContainer>

      <Narrative>
        <p>
          The growth of international collaboration in patenting is consistent with the globalization
          of corporate R&D. Multinational firms increasingly distribute their research
          activities across multiple countries, utilizing local talent pools and regulatory
          environments. The result is an expanding network of cross-border co-invention that
          transcends traditional national innovation systems.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          International collaboration has increased from approximately 2% of patents in the 1980s to reaching 10%
          in recent years. This trend is consistent with the expansion of multinational R&D operations, global talent mobility,
          and the increasing feasibility of remote scientific collaboration. The rate of growth accelerated
          in the 2000s as communication technology reduced the transaction costs of cross-border teamwork.
        </p>
      </KeyInsight>

      <SectionDivider label="US-China Collaboration Dynamics" />

      <Narrative>
        <p>
          International co-invention rates -- the share of US patents with inventors from
          multiple countries -- illuminate the evolving geography of collaborative innovation.
          US-China co-invention has grown substantially from near zero in the 1990s to over
          2% by 2025, though growth rates moderated across certain technology areas amid
          trade tensions, entity list restrictions, and tightening export controls.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-collaboration-co-invention-rates"
        subtitle="Share of US patents co-invented with each partner country (1976-2025), measured as the percentage with at least one US and one foreign inventor."
        title="US-China Co-Invention Rates Have Grown Substantially, Surpassing 2% by 2025"
        caption="Share of US patents co-invented with each partner country, 1976-2025. A co-invented patent includes at least one inventor in the US and at least one in the partner country. US-China co-invention has grown substantially since China's WTO accession in 2001, reaching over 2% by 2025."
        insight="US-China co-invention has grown substantially since China's WTO accession in 2001, reaching over 2% by 2025, though growth rates have moderated in some technology areas. US-India collaboration has also emerged as a growing pathway."
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
        id="fig-collaboration-us-china-by-section"
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
          The US-China co-invention data indicate substantial growth across most technology areas,
          though growth rates moderated in certain sectors in recent years.
          The broad-based nature of this collaboration suggests deeply integrated research ties
          that span multiple technology domains, even as policy tensions have introduced new
          uncertainties into the relationship.
        </p>
      </KeyInsight>

      <Narrative>
        Beyond cross-border collaboration patterns, the movement of inventors between organizations and the strategic positioning of corporate patent portfolios reveal additional dimensions of innovation dynamics. The next chapter examines{' '}
        <Link href="/chapters/corporate-strategy" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">corporate strategy</Link>{' '}
        through talent flows, portfolio similarity, and multi-dimensional innovation profiles.
      </Narrative>

      <DataNote>
        International co-invention identifies patents listing inventors from two or more countries.
        Co-invention rates measure the share of US patents with at least one US and one foreign inventor.
        US-China co-invention counts are disaggregated by CPC section based on the primary classification
        of each patent.
      </DataNote>

      <RelatedChapters currentChapter={25} />
      <ChapterNavigation currentChapter={25} />
    </div>
  );
}
