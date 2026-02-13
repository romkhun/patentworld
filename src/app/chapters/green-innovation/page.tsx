'use client';

import { useMemo } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWAreaChart } from '@/components/charts/PWAreaChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { GREEN_EVENTS } from '@/lib/referenceEvents';
import { CHART_COLORS, GREEN_CATEGORY_COLORS, COUNTRY_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import type {
  GreenVolume, GreenByCategory, GreenByCountry,
  GreenTopCompany, GreenAITrend, GreenAIHeatmap,
} from '@/lib/types';

export default function Chapter12() {
  const { data: volume, loading: volL } = useChapterData<GreenVolume[]>('green/green_volume.json');
  const { data: byCategory, loading: catL } = useChapterData<GreenByCategory[]>('green/green_by_category.json');
  const { data: byCountry, loading: ctyL } = useChapterData<GreenByCountry[]>('green/green_by_country.json');
  const { data: topCompanies, loading: coL } = useChapterData<GreenTopCompany[]>('green/green_top_companies.json');
  const { data: aiTrend, loading: aiTL } = useChapterData<GreenAITrend[]>('green/green_ai_trend.json');
  const { data: aiHeatmap, loading: aiHL } = useChapterData<GreenAIHeatmap[]>('green/green_ai_heatmap.json');

  // Pivot category data for stacked area chart
  const { categoryPivot, categoryAreas } = useMemo(() => {
    if (!byCategory) return { categoryPivot: [], categoryAreas: [] };
    const categories = [...new Set(byCategory.map((d) => d.category))].sort();
    const years = [...new Set(byCategory.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      byCategory
        .filter((d) => d.year === year)
        .forEach((d) => { row[d.category] = d.count; });
      return row;
    });
    const areas = categories.map((cat) => ({
      key: cat,
      name: cat,
      color: GREEN_CATEGORY_COLORS[cat] ?? '#94a3b8',
    }));
    return { categoryPivot: pivoted, categoryAreas: areas };
  }, [byCategory]);

  // Pivot country data for stacked area chart
  const { countryPivot, countryAreas } = useMemo(() => {
    if (!byCountry) return { countryPivot: [], countryAreas: [] };
    const countries = [...new Set(byCountry.map((d) => d.country))];
    const years = [...new Set(byCountry.map((d) => d.year))].sort();
    const pivoted = years.map((year) => {
      const row: Record<string, unknown> = { year };
      byCountry
        .filter((d) => d.year === year)
        .forEach((d) => { row[d.country] = d.count; });
      return row;
    });
    // Order countries by total volume descending
    const countryTotals = countries.map((c) => ({
      country: c,
      total: byCountry.filter((d) => d.country === c).reduce((s, d) => s + d.count, 0),
    })).sort((a, b) => b.total - a.total);
    const areas = countryTotals.map((c) => ({
      key: c.country,
      name: c.country,
      color: COUNTRY_COLORS[c.country] ?? '#94a3b8',
    }));
    return { countryPivot: pivoted, countryAreas: areas };
  }, [byCountry]);

  // Top companies bar data: deduplicate to unique orgs with total_green, sorted descending
  const companyBarData = useMemo(() => {
    if (!topCompanies) return [];
    const orgMap = new Map<string, { organization: string; total_green: number; label: string }>();
    topCompanies.forEach((d) => {
      if (!orgMap.has(d.organization)) {
        let label = d.organization;
        if (label === 'TOYOTA JIDOSHA KABUSHIKI KAISHA') label = 'Toyota';
        else if (label === 'SAMSUNG ELECTRONICS CO., LTD.') label = 'Samsung';
        else if (label === 'General Electric Company') label = 'General Electric';
        else if (label === 'Ford Global Technologies, LLC') label = 'Ford';
        else if (label === 'GM GLOBAL TECHNOLOGY OPERATIONS LLC') label = 'General Motors';
        else if (label === 'HONDA MOTOR CO., LTD.') label = 'Honda';
        else if (label === 'Intel Corporation') label = 'Intel';
        else if (label === 'International Business Machines Corporation') label = 'IBM';
        else if (label === 'HYUNDAI MOTOR COMPANY') label = 'Hyundai';
        else if (label === 'HITACHI, LTD.') label = 'Hitachi';
        else if (label === 'QUALCOMM Incorporated') label = 'Qualcomm';
        else if (label === 'Mitsubishi Electric Corporation') label = 'Mitsubishi Electric';
        else if (label === 'LG CHEM, LTD.') label = 'LG Chem';
        else if (label === 'LG ELECTRONICS INC.') label = 'LG Electronics';
        else if (label === 'Nissan Motor Co., Ltd.') label = 'Nissan';
        else if (label === 'Robert Bosch GmbH') label = 'Bosch';
        else if (label === 'Kabushiki Kaisha Toshiba') label = 'Toshiba';
        else if (label === 'Siemens Aktiengesellschaft') label = 'Siemens';
        else if (label === 'UNITED TECHNOLOGIES CORPORATION') label = 'United Technologies';
        else if (label === 'The Boeing Company') label = 'Boeing';
        else if (label.length > 25) label = label.slice(0, 22) + '...';
        orgMap.set(d.organization, { organization: d.organization, total_green: d.total_green, label });
      }
    });
    return [...orgMap.values()].sort((a, b) => b.total_green - a.total_green);
  }, [topCompanies]);

  // Green AI heatmap: pivot into matrix format for bar chart
  const { heatmapData, aiSubfields } = useMemo(() => {
    if (!aiHeatmap) return { heatmapData: [], aiSubfields: [] };
    const subfields = [...new Set(aiHeatmap.map((d) => d.ai_subfield))];
    const greenCats = [...new Set(aiHeatmap.map((d) => d.green_category))];
    // Sort green categories by total count
    const catTotals = greenCats.map((cat) => ({
      cat,
      total: aiHeatmap.filter((d) => d.green_category === cat).reduce((s, d) => s + d.count, 0),
    })).sort((a, b) => b.total - a.total);
    const data = catTotals.map(({ cat }) => {
      const row: Record<string, unknown> = { category: cat };
      aiHeatmap.filter((d) => d.green_category === cat).forEach((d) => {
        row[d.ai_subfield] = d.count;
      });
      return row;
    });
    return { heatmapData: data, aiSubfields: subfields };
  }, [aiHeatmap]);

  // Summary stats
  const peakYear = volume ? volume.reduce((best, d) => d.green_count > best.green_count ? d : best, volume[0]) : null;
  const totalGreen = volume ? volume.reduce((s, d) => s + d.green_count, 0) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ChapterHeader
        number={11}
        title="The Green Innovation Race"
        subtitle="Climate technology patents from niche to mainstream"
      />

      <KeyFindings>
        <li>
          <GlossaryTooltip term="green patents">Green patents</GlossaryTooltip> — those classified under <GlossaryTooltip term="Y02">Y02/Y04S</GlossaryTooltip> codes — total {formatCompact(totalGreen)} over 50 years, peaking at {peakYear ? formatCompact(peakYear.green_count) : '—'} in {peakYear?.year ?? '—'}.
        </li>
        <li>Batteries &amp; storage, transportation/EVs, and renewable energy are the fastest-growing green sub-categories, with sharp acceleration after the 2015 Paris Agreement.</li>
        <li>Japan historically dominated green patenting through Toyota and Honda, but Samsung, Hyundai, and General Electric have closed the gap in recent years.</li>
        <li>AI is increasingly applied to climate problems — patents at the intersection of green technology and artificial intelligence have surged since 2015.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Green patents grew from roughly 3,000 per year in the late 1970s to over 30,000 annually by the early 2020s, now representing about 10% of all utility patents. Samsung and Toyota lead with over 10,000 green patents each; automotive firms (Toyota, GM, Ford, Honda, Hyundai) dominate thanks to vehicle electrification. Green-AI patents -- at the intersection of Y02/Y04S and AI CPC codes -- have surged from near zero before 2010, with machine learning applied to energy optimization, materials discovery, and autonomous EV navigation.
        </p>
      </aside>

      <Narrative>
        <p>
          Climate change has become one of the defining challenges of the 21st century, and the patent
          system offers a unique window into humanity&apos;s technological response. This chapter tracks
          the rise of green innovation through patents classified under the CPC&apos;s <GlossaryTooltip term="Y02">Y02</GlossaryTooltip> and Y04S
          codes — covering everything from solar panels and wind turbines to electric vehicles,
          carbon capture, and smart grids.
        </p>
      </Narrative>

      {/* ── Section 1: Green Patent Volume ─────────────────────────────────── */}
      <SectionDivider label="Green Patent Volume Over 50 Years" />

      <Narrative>
        <p>
          Green patent filings grew from about 3,000 per year in the late 1970s to over 30,000 per year
          by the early 2020s. The sharpest acceleration followed the 2015 Paris Agreement, with batteries
          and EVs leading the surge. Green patents now represent approximately 10% of all utility patents
          granted each year.
        </p>
      </Narrative>

      <ChartContainer
        title="Green Patent Volume and Share"
        caption={`Annual count of utility patents with at least one Y02/Y04S CPC code, 1976–2025. Green patents peaked at ${peakYear ? formatCompact(peakYear.green_count) : '—'} in ${peakYear?.year ?? '—'}, representing ~${peakYear?.green_pct.toFixed(1) ?? '—'}% of all utility patents.`}
        insight="Green patenting has grown from a niche activity to roughly one in ten US patents, reflecting massive corporate and government investment in climate technology. The growth trajectory mirrors — and in some periods exceeds — the broader expansion of the patent system."
        loading={volL}
      >
        <PWLineChart
          data={volume ?? []}
          xKey="year"
          lines={[
            { key: 'green_count', name: 'Green Patents', color: CHART_COLORS[1] },
            { key: 'green_pct', name: 'Green Share (%)', color: CHART_COLORS[3], yAxisId: 'right' },
          ]}
          yLabel="Patents"
          rightYLabel="Share (%)"
          rightYFormatter={(v) => `${v.toFixed(1)}%`}
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      {/* ── Section 2: Technology Breakdown ────────────────────────────────── */}
      <SectionDivider label="Green Technology Breakdown" />

      <Narrative>
        <p>
          Not all green technologies have followed the same trajectory. Renewable energy generation
          (solar and wind) led the early growth, but batteries, energy storage, and transportation
          (particularly electric vehicles) have emerged as the dominant categories in recent years.
          Carbon capture remains a smaller but rapidly growing segment.
        </p>
      </Narrative>

      <ChartContainer
        title="Green Patents by Technology Sub-Category"
        caption="Annual patent counts by green technology sub-category (Y02/Y04S CPC sub-codes), 1976–2025."
        insight="The green patent portfolio has diversified dramatically. While renewable energy generation once dominated, the 2010s saw an explosion in battery/storage and EV patents — reflecting the electrification of transportation as the new frontier of clean technology."
        loading={catL}
        height={550}
        wide
      >
        <PWAreaChart
          data={categoryPivot}
          xKey="year"
          areas={categoryAreas}
          stacked
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The composition of green innovation has shifted substantially over time. Renewable energy
          patents — led by solar and wind technologies — dominated through the 2000s. But since 2010,
          batteries &amp; energy storage and transportation/EVs have become the fastest-growing segments,
          driven by plummeting battery costs, automaker electrification strategies, and supportive policies
          like the Inflation Reduction Act.
        </p>
      </KeyInsight>

      {/* ── Section 3: Who Leads the Green Race ───────────────────────────── */}
      <SectionDivider label="Who Leads the Green Race?" />

      <Narrative>
        <p>
          Japan historically dominated green patenting, led by Toyota and Honda in automotive
          technologies and Panasonic and Toshiba in energy systems. In recent years, South Korean
          firms (Samsung, LG, Hyundai) have surged, while US companies like General Electric and
          Ford have maintained strong positions.
        </p>
      </Narrative>

      <ChartContainer
        title="Green Patents by Assignee Country"
        caption="Annual green patent counts by primary assignee country/region, 1976–2025."
        insight="Japan's early lead in green patenting reflects its pioneering investment in hybrid vehicles and energy efficiency. South Korea's recent surge — driven by Samsung, LG, and Hyundai — shows how the competitive landscape is shifting as battery and EV technologies become central to the green transition."
        loading={ctyL}
        height={500}
        wide
      >
        <PWAreaChart
          data={countryPivot}
          xKey="year"
          areas={countryAreas}
          stacked
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      <ChartContainer
        title="Top 20 Green Patent Holders"
        caption="Organizations ranked by total green patent count (Y02/Y04S classifications), 1976–2025."
        insight="The top green patent holders are dominated by automotive and electronics conglomerates — companies with massive R&D budgets and the engineering capabilities to tackle energy, transportation, and industrial decarbonization at scale."
        loading={coL}
        height={700}
      >
        <PWBarChart
          data={companyBarData}
          xKey="label"
          bars={[{ key: 'total_green', name: 'Green Patents', color: CHART_COLORS[1] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Samsung and Toyota lead the green patent race with over 10,000 patents each. The dominance
          of automotive companies (Toyota, GM, Ford, Honda, Hyundai, Nissan, Bosch) reflects the
          centrality of vehicle electrification to the clean energy transition. Electronics and
          industrial conglomerates (Samsung, GE, Hitachi, Siemens, Toshiba) bring expertise in
          power systems, batteries, and smart grid infrastructure.
        </p>
      </KeyInsight>

      {/* ── Section 4: Green AI ───────────────────────────────────────────── */}
      <SectionDivider label="Green AI — Where Climate Meets Artificial Intelligence" />

      <Narrative>
        <p>
          AI is increasingly being applied to climate problems — particularly in energy grid optimization,
          industrial process control, and transportation logistics. Patents classified under both green
          (Y02/Y04S) and AI-related CPC codes represent a growing intersection of two transformative
          technology domains.
        </p>
      </Narrative>

      <ChartContainer
        title="Green AI Patent Trend"
        caption="Annual count of patents classified under both Y02/Y04S (green) and AI-related CPC codes (G06N, G06F18, G06V, G10L15, G06F40), 1976–2025."
        insight="Green AI patents have surged from near zero before 2010 to a rapidly growing category, as machine learning and neural networks are applied to energy optimization, materials discovery, climate modeling, and autonomous vehicle navigation."
        loading={aiTL}
      >
        <PWLineChart
          data={aiTrend ?? []}
          xKey="year"
          lines={[
            { key: 'green_ai_count', name: 'Green AI Patents', color: CHART_COLORS[1] },
          ]}
          yLabel="Patents"
          referenceLines={GREEN_EVENTS}
        />
      </ChartContainer>

      <ChartContainer
        title="Green Technology × AI Subfield"
        caption="Patent counts at the intersection of green sub-categories and AI subfields. Only combinations with more than 5 patents shown."
        insight="Industrial production and smart grids are the green categories most intensively adopting AI, with machine learning and neural networks as the dominant AI techniques. Computer vision plays a growing role in quality control for renewable energy manufacturing."
        loading={aiHL}
        height={450}
      >
        <PWBarChart
          data={heatmapData}
          xKey="category"
          bars={aiSubfields.map((sf, i) => ({
            key: sf,
            name: sf,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          stacked
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The convergence of AI and green technology represents one of the most promising frontiers
          in the patent landscape. Machine learning techniques are being applied to optimize renewable
          energy generation, improve battery chemistry through materials informatics, enhance smart
          grid efficiency, and develop autonomous electric vehicles. As both AI capabilities and
          climate urgency continue to grow, this intersection is likely to accelerate further.
        </p>
      </KeyInsight>

      <Narrative>
        Having traced the rise of green innovation from niche to mainstream, the next chapter examines another transformative technology domain: artificial intelligence.
        Like clean technology, AI has grown explosively in the patent system and is increasingly converging with other fields -- including green technology itself.
      </Narrative>

      <DataNote>
        <p>
          <GlossaryTooltip term="green patents">Green patents</GlossaryTooltip> are identified using
          CPC classifications Y02 (climate change mitigation technologies) and Y04S (smart grids).
          Sub-categories are mapped from Y02 sub-codes: Y02E10 → Renewable Energy, Y02E60 → Batteries &amp; Storage,
          Y02T → Transportation/EVs, Y02C → Carbon Capture, Y02P → Industrial Production, Y02B → Buildings,
          Y02W → Waste Management, Y04S → Smart Grids. AI patents use the same identification methodology
          as Chapter 11 (G06N, G06F18, G06V, G10L15, G06F40). Country attribution is based on the
          primary assignee&apos;s location. Source: PatentsView / USPTO.
        </p>
      </DataNote>

      <RelatedChapters currentChapter={11} />
      <ChapterNavigation currentChapter={11} />
    </div>
  );
}
