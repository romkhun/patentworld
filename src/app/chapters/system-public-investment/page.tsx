'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Label,
} from 'recharts';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { MeasurementSidebar } from '@/components/chapter/MeasurementSidebar';
import { Narrative } from '@/components/chapter/Narrative';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWValueHeatmap } from '@/components/charts/PWValueHeatmap';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { DataNote } from '@/components/chapter/DataNote';
import { InsightRecap } from '@/components/chapter/InsightRecap';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import chartTheme from '@/lib/chartTheme';
import type { GovFundedPerYear, GovAgency, GovAgencyField, GovAgencyBreadthDepth, GovImpactComparison, TopGovernmentContract } from '@/lib/types';

export default function SystemPublicInvestmentChapter() {
  const { data: gov, loading: goL } = useChapterData<GovFundedPerYear[]>('chapter6/gov_funded_per_year.json');
  const { data: agencies, loading: agL } = useChapterData<GovAgency[]>('chapter6/gov_agencies.json');
  const { data: agencyField, loading: afL } = useChapterData<GovAgencyField[]>('chapter1/gov_agency_field_matrix.json');
  const { data: agencyBreadth, loading: abL } = useChapterData<GovAgencyBreadthDepth[]>('chapter1/gov_agency_breadth_depth.json');
  const { data: govImpact, loading: giL } = useChapterData<GovImpactComparison[]>('chapter1/gov_impact_comparison.json');
  const { data: govContracts, loading: gcL } = useChapterData<TopGovernmentContract[]>('chapter7/top_government_contracts.json');

  const topAgencies = useMemo(() => {
    if (!agencies) return [];
    return agencies.map((d) => ({
      ...d,
      label: d.agency.length > 40 ? d.agency.slice(0, 37) + '...' : d.agency,
    }));
  }, [agencies]);

  const scatterData = useMemo(() => {
    if (!agencyBreadth) return [];
    return agencyBreadth
      .filter((d) => d.depth != null)
      .map((d) => ({
        agency: d.agency.length > 35 ? d.agency.slice(0, 32) + '...' : d.agency,
        x: d.breadth,
        y: d.depth as number,
        size: d.total_patents,
        n_sections: d.n_sections,
      }));
  }, [agencyBreadth]);

  const topContracts = useMemo(() => {
    if (!govContracts) return [];
    return govContracts.slice(0, 30).map((d) => ({
      ...d,
      label: `${d.contract_award_number} (${d.agency.length > 25 ? d.agency.slice(0, 22) + '...' : d.agency})`,
    }));
  }, [govContracts]);

  return (
    <div>
      <ChapterHeader
        number={7}
        title="Public Investment"
        subtitle="Government funding and the Bayh-Dole Act"
      />

      <MeasurementSidebar slug="system-public-investment" />

      <KeyFindings>
        <li>Government-funded patents rose from 1,294 in 1980 to 8,359 in 2019, a trend associated with the 1980 Bayh-Dole Act.</li>
        <li>HHS/NIH leads with 55,587 patents, followed by Defense (43,736) and Energy (33,994).</li>
        <li>Government-funded patents slightly outperform non-funded patents on cohort-normalized citation impact, as shown in the cohort-normalized comparison below, consistent with findings in the academic literature (Azoulay et al., 2019, <em>JPE</em>; Mowery et al., 2001, <em>Research Policy</em>).</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Government-funded patenting expanded substantially after the 1980 <GlossaryTooltip term="Bayh-Dole Act">Bayh-Dole Act</GlossaryTooltip>, which permitted universities and small businesses to retain patent rights on federally funded inventions. Government-acknowledged patents grew from 1,294 in 1980 to a peak of 8,359 in 2019. Federal agencies — particularly HHS/NIH, the Department of Defense, and the Department of Energy — continue to fund research that generates thousands of patents each year, representing foundational technologies that enable subsequent waves of commercial innovation. Research in the academic literature suggests that government-funded patents tend to be associated with higher citation impact (Azoulay, Graff Zivin, Li, &amp; Sampat, 2019; Jaffe &amp; Lerner, 2001; Mowery, Nelson, Sampat, &amp; Ziedonis, 2001; Sampat, 2006), supporting the role of public R&amp;D investment in generating foundational knowledge.
        </p>
      </aside>

      <Narrative>
        <p>
          A key dimension of the patent landscape concerns the role of government funding in generating patented inventions. While earlier chapters characterized the overall volume, quality, and technological composition of US patents, the source of funding for the underlying research reveals a distinct and consequential pattern. Public investment in research and development is widely regarded as a contributor to innovation ecosystems, and the patent system provides a window into the scale and distribution of that investment.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-innovation-landscape-gov-funded"
        subtitle="Annual count of utility patents acknowledging government funding interest, tracking patenting trends following the 1980 Bayh-Dole Act."
        title="Government-Funded Patents Rose From 1,294 in 1980 to 8,359 in 2019 After the Bayh-Dole Act"
        caption="Number of utility patents acknowledging government funding interest, by year. A marked increase is evident after the 1980 Bayh-Dole Act, which permitted universities and small businesses to retain patent rights on federally funded inventions."
        loading={goL}
        insight="Government-funded patents are often associated with higher citation impact in the academic literature (e.g., Azoulay et al., 2019; Jaffe & Lerner, 2001, RAND Journal of Economics; Mowery et al., 2001, Research Policy 30(1), 99-119; Sampat, 2006, Research Policy 35(6), 772-789), supporting the role of public R&D investment in generating foundational innovations. This interpretation is drawn from prior research rather than directly computed from the PatentsView data used in this chapter."
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
          in thousands of patents each year. These government-interest patents
          are often associated with foundational technologies that precede subsequent
          commercial innovation.
        </p>
      </Narrative>

      <KeyInsight>
        <p>
          Government-funded patents are often associated with higher citation impact in the academic literature,
          suggesting that public research investments generate foundational knowledge that
          serves as a critical input for downstream commercial innovation. This interpretation is drawn from prior research rather than directly computed from the PatentsView data used in this chapter. Key studies documenting the impact of public R&amp;D on private-sector patenting include Azoulay, Graff Zivin, Li, and Sampat (2019), &quot;Public R&amp;D Investments and Private-sector Patenting,&quot; <em>Review of Economic Studies</em> 86(1), 117-152; Jaffe, A.B. and Lerner, J. (2001), &quot;Reinventing Public R&amp;D: Patent Policy and the Commercialization of National Laboratory Technologies,&quot; <em>RAND Journal of Economics</em>; Mowery, D.C., Nelson, R.R., Sampat, B.N., and Ziedonis, A.A. (2001), &quot;The growth of patenting and licensing by U.S. universities,&quot; <em>Research Policy</em> 30(1), 99-119; and Sampat, B.N. (2006), &quot;Patenting and US academic research in the 20th century,&quot; <em>Research Policy</em> 35(6), 772-789.
        </p>
      </KeyInsight>

      {/* ── Analysis 7: Government Agency × Technology Field ─────────────── */}

      <SectionDivider label="Agency × Technology Field Matrix" />

      <Narrative>
        <p>
          Beyond aggregate patent counts, the <em>technological composition</em> of each agency&apos;s
          portfolio reveals how federal funding priorities map onto the CPC classification system.
          Some agencies concentrate their funding in a narrow set of technology fields — the
          Department of Energy, for example, is heavily weighted toward Chemistry &amp; Metallurgy
          (Section C) and Physics (Section G) — while others, such as the Department of Defense,
          spread funding across a broader spectrum of sections. The heatmap below decomposes each
          agency&apos;s patent portfolio by CPC section, revealing both expected specializations and
          surprising cross-field reach.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-gov-agency-field-matrix"
        title="Federal Agencies Differ Markedly in Their Technology Field Portfolios"
        subtitle="Agency × CPC section matrix of patent counts. Each cell shows the number of government-interest patents in a given agency–field combination."
        caption="Heatmap of government-interest patent counts by federal agency and CPC section. Darker cells indicate higher patent concentrations, revealing each agency's technology field specialization."
        loading={afL}
        badgeProps={{ asOf: 'PatentsView 2025-Q1', taxonomy: 'CPC', normalization: 'Cohort×field' }}
        height={500}
        flexHeight
      >
        <PWValueHeatmap
          data={agencyField ?? []}
          rowKey="agency"
          colKey="section"
          valueKey="patent_count"
          colLabels={CPC_SECTION_NAMES}
          rowLabel="Federal Agency"
          colLabel="CPC Section"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Federal agencies exhibit sharply distinct technology portfolios. Health-oriented agencies
          concentrate in Human Necessities (Section A) and Chemistry (Section C), while Defense
          and Energy spread across Physics (Section G), Electricity (Section H), and Operations &amp;
          Transport (Section B). This specialization pattern reflects each agency&apos;s statutory
          mission and highlights how public R&amp;D investment channels innovation into specific
          technological corridors.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-gov-agency-breadth-depth"
        title="Agencies Face a Breadth-Depth Tradeoff in Technology Portfolios"
        subtitle="Each bubble represents a federal agency. X-axis: technological breadth (Shannon entropy across CPC sections). Y-axis: depth (mean cohort-normalized citations). Bubble size: total patents."
        caption="Scatter plot of agency breadth (Shannon entropy across CPC sections) versus depth (mean cohort-normalized 5-year forward citations). Bubble size is proportional to total patent count. Agencies with broader portfolios may trade off citation impact per patent."
        loading={abL}
        height={500}
        insight="Agencies that spread funding across many technology fields tend to achieve lower mean citation depth per patent, suggesting a breadth-depth tradeoff in public R&D portfolio strategy."
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="x"
              type="number"
              tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={['auto', 'auto']}
            >
              <Label
                value="Breadth (Shannon Entropy)"
                position="insideBottom"
                offset={-10}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel }}
              />
            </XAxis>
            <YAxis
              dataKey="y"
              type="number"
              tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={60}
              domain={['auto', 'auto']}
            >
              <Label
                value="Depth (Mean Norm. Citations)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel }}
              />
            </YAxis>
            <ZAxis dataKey="size" range={[60, 600]} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div style={TOOLTIP_STYLE}>
                    <div className="font-semibold text-sm mb-1">{d.agency}</div>
                    <div className="text-xs text-muted-foreground">Breadth: {d.x.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Depth: {d.y.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Patents: {d.size.toLocaleString('en-US')}</div>
                    <div className="text-xs text-muted-foreground">CPC sections: {d.n_sections}</div>
                  </div>
                );
              }}
            />
            <Scatter
              name="Federal Agencies"
              data={scatterData}
              fill={CHART_COLORS[5]}
              fillOpacity={0.7}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>

      <KeyInsight>
        <p>
          Agencies that fund research across many CPC sections — such as the Department of Defense,
          which spans electronics, materials, and mechanical engineering — tend to show lower mean
          cohort-normalized citation depth per patent. By contrast, agencies with narrower portfolios,
          such as HHS/NIH, achieve higher average citation impact, consistent with a breadth-depth
          tradeoff in public R&amp;D investment strategy. This tradeoff echoes findings in the
          corporate innovation literature, where firms that diversify across too many technology
          fields may dilute their inventive focus.
        </p>
      </KeyInsight>

      <ChartContainer
        id="fig-gov-impact-comparison"
        title="Government-Funded Patents Slightly Outperform on Normalized Impact"
        subtitle="Cohort-normalized citations and top-percentile shares: government-funded versus non-funded patents, 1980–2020"
        loading={giL}
      >
        <PWBarChart
          data={govImpact ?? []}
          xKey="funding_status"
          bars={[
            { key: 'mean_normalized', name: 'Average Normalized Citations', color: CHART_COLORS[5] },
            { key: 'top_decile_share', name: 'Top-Decile Share (%)', color: CHART_COLORS[0] },
            { key: 'top_1pct_share', name: 'Top-1% Share (%)', color: CHART_COLORS[3] },
          ]}
        />
      </ChartContainer>

      {/* ── Analysis 16: Government Contract Patent Concentration ─────── */}

      <SectionDivider label="Government Contract Patent Concentration" />

      <Narrative>
        <p>
          Beyond agency-level aggregates, individual government contracts reveal where public R&amp;D
          investment concentrates most heavily. A small number of large-scale contracts — predominantly
          from the Department of Energy&apos;s national laboratory system — account for thousands of
          patents each, reflecting the long-term, mission-oriented nature of federally funded research.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-gov-contract-concentration"
        title="Department of Energy Contract DE-AC04-94AL85000 Leads With 2,152 Patents, Consistent With National Laboratory Dominance"
        subtitle="Top 30 government contracts ranked by total patent count, color-coded by sponsoring federal agency."
        caption="Government contracts ranked by total associated patent grants. The Department of Energy dominates the top positions, with contracts supporting Sandia, Lawrence Livermore, and Argonne National Laboratories generating the largest patent portfolios."
        loading={gcL}
        height={900}
        insight="The concentration of government-funded patents in a small number of DOE national laboratory contracts underscores the role of sustained, large-scale federal investment in generating foundational technologies."
      >
        <PWBarChart
          data={topContracts}
          xKey="label"
          bars={[{ key: 'patent_count', name: 'Patents', color: CHART_COLORS[5] }]}
          layout="vertical"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The top government contracts are overwhelmingly Department of Energy awards supporting
          national laboratories. Contract DE-AC04-94AL85000 (Sandia National Laboratories) leads
          with 2,152 patents, followed by W-7405-ENG-48 (Lawrence Livermore) with 1,869 patents.
          This concentration reflects the long-term, mission-oriented nature of DOE research
          programs, which generate cumulative patent portfolios spanning decades.
        </p>
      </KeyInsight>

      <InsightRecap
        learned={[
          "Government-funded patents rose from 1,294 in 1980 to 8,359 in 2019, with HHS/NIH leading at 55,587 cumulative patents.",
          "Public investment in patented R&D spans all major technology domains, with agency portfolios exhibiting distinct breadth-depth tradeoffs.",
        ]}
        falsifiable="If government funding genuinely improves patent quality, then funded patents should show higher cohort-normalized citation impact even after controlling for inventor quality and institutional resources."
        nextAnalysis={{
          label: "Assignee Composition",
          description: "Who files patents — the corporate, foreign, and institutional landscape of assignees",
          href: "/chapters/org-composition",
        }}
      />

      <Narrative>
        This chapter concludes ACT 1: The System, which has examined the US patent landscape from overall volume and quality through technology fields, convergence, legal frameworks, and public investment. The next act shifts focus from the system level to the organizations that operate within it. <Link href="/chapters/org-composition/" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Chapter 8: Assignee Composition</Link> opens ACT 2: The Organizations by examining the corporate, foreign, and country-level composition of patent assignees.
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
