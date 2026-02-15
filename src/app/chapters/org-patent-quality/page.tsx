'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { useCitationNormalization } from '@/hooks/useCitationNormalization';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWBubbleScatter } from '@/components/charts/PWBubbleScatter';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { PWFanChart } from '@/components/charts/PWFanChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import { CHART_COLORS, ENTITY_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  FirmCitationImpact,
  FirmQualityYear, FirmQualityScatter,
  CitationHalfLife, SelfCitationByAssignee,
} from '@/lib/types';

/* ── Helpers for quality_by_company charts ── */

/** Return the top N company names by total patent_count */
const getTopCompanies = (raw: any[] | null, n = 5): string[] => {
  if (!raw) return [];
  const totals: Record<string, number> = {};
  for (const r of raw) {
    totals[r.group] = (totals[r.group] || 0) + (r.patent_count || 0);
  }
  return Object.entries(totals)
    .filter(([name]) => name && name !== 'null' && name !== 'None')
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name);
};

/** Pivot long-form data into { year, [company1]: val, [company2]: val, ... } */
const pivotCompanyMetric = (
  raw: any[] | null,
  metric: string,
  companies: string[],
) => {
  if (!raw) return [];
  const filtered = raw.filter((r) => companies.includes(r.group));
  const byYear: Record<number, any> = {};
  for (const r of filtered) {
    if (!byYear[r.year]) byYear[r.year] = { year: r.year };
    byYear[r.year][r.group] = r[metric];
  }
  return Object.values(byYear).sort((a: any, b: any) => a.year - b.year);
};

/** Abbreviate long PatentsView company names for chart legends */
const shortName = (name: string): string => {
  if (name.includes('International Business Machines')) return 'IBM';
  if (name.includes('SAMSUNG')) return 'Samsung';
  if (name.includes('Canon')) return 'Canon';
  if (name.includes('General Electric')) return 'GE';
  if (name.includes('Microsoft')) return 'Microsoft';
  if (name.includes('Intel')) return 'Intel';
  if (name.includes('Apple')) return 'Apple';
  if (name.includes('Qualcomm')) return 'Qualcomm';
  if (name.includes('Google')) return 'Google';
  if (name.includes('SONY')) return 'Sony';
  if (name.includes('FUJITSU')) return 'Fujitsu';
  if (name.includes('LG ELEC')) return 'LG';
  if (name.includes('HITACHI')) return 'Hitachi';
  if (name.includes('Toshiba')) return 'Toshiba';
  if (name.includes('Huawei')) return 'Huawei';
  if (name.length > 25) return name.substring(0, 22) + '...';
  return name;
};

/** Map a full company name to an ENTITY_COLORS key, falling back to CHART_COLORS */
const companyColor = (name: string, idx: number): string => {
  const short = shortName(name);
  return ENTITY_COLORS[short] ?? CHART_COLORS[idx % CHART_COLORS.length];
};

export default function OrgPatentQualityChapter() {
  /* ── Data hooks ── */
  const { data: firmScatter, loading: fsL } = useChapterData<FirmQualityScatter[]>('company/firm_quality_scatter.json');
  const { data: firmQuality, loading: fqL } = useChapterData<Record<string, FirmQualityYear[]>>('company/firm_quality_distribution.json');
  const { data: citImpact, loading: citL } = useChapterData<FirmCitationImpact[]>('chapter3/firm_citation_impact.json');
  const { data: selfCiteAssignee, loading: scaL } = useChapterData<SelfCitationByAssignee[]>('chapter9/self_citation_by_assignee.json');
  const { data: citationHalfLife, loading: chlL } = useChapterData<CitationHalfLife[]>('company/citation_half_life.json');
  const { data: qualityByCompany, loading: qbcL } = useChapterData<any[]>('computed/quality_by_company.json');

  /* ── State ── */
  const [selectedQualityFirm, setSelectedQualityFirm] = useState<string>('IBM');

  /* ── Computations ── */
  const citData = useMemo(() => {
    if (!citImpact) return [];
    return citImpact.map((d) => ({
      ...d,
      label: cleanOrgName(d.organization),
    }));
  }, [citImpact]);

  const qualityCompanies = useMemo(() => firmQuality ? Object.keys(firmQuality).sort() : [], [firmQuality]);
  const selectedQualityData = useMemo(() => firmQuality?.[selectedQualityFirm] ?? [], [firmQuality, selectedQualityFirm]);

  const scatterData = useMemo(() => {
    if (!firmScatter) return [];
    return firmScatter.map(d => ({
      company: d.company,
      x: d.blockbuster_rate,
      y: d.dud_rate,
      size: d.patent_count,
      section: d.primary_section,
    }));
  }, [firmScatter]);

  /* ── Quality-by-company derived data ── */
  const topCompanies = useMemo(() => getTopCompanies(qualityByCompany, 5), [qualityByCompany]);
  const companyLines = useMemo(
    () => topCompanies.map((name, i) => ({
      key: name,
      name: shortName(name),
      color: companyColor(name, i),
    })),
    [topCompanies],
  );

  const companyFwdCitePivot = useMemo(
    () => pivotCompanyMetric(qualityByCompany, 'avg_forward_citations', topCompanies),
    [qualityByCompany, topCompanies],
  );
  const { data: normalizedCompanyFwdCite, yLabel: companyFwdCiteYLabel, controls: controlsCompanyFwdCite } = useCitationNormalization({
    data: companyFwdCitePivot,
    xKey: 'year',
    citationKeys: ['avg_forward_citations'],
    yLabel: 'Avg Forward Citations',
  });

  return (
    <div>
      <ChapterHeader
        number={10}
        title="Organizational Patent Quality"
        subtitle="Citation impact, blockbuster patents, self-citation dynamics, and quality metrics across leading patent holders"
      />

      <KeyFindings>
        <li>Amazon&apos;s 6.7% blockbuster rate leads the field for 2010-2019, while 18 of 50 firms exceed a 50% dud rate, revealing sharply divergent quality strategies.</li>
        <li>Microsoft leads in average forward citations (30.7) while IBM&apos;s 5.6x average-to-median ratio reveals a highly skewed portfolio with a few highly cited patents alongside many incremental ones.</li>
        <li>Canon (47.6%), TSMC (38.4%), and Micron (25.3%) exhibit the highest self-citation rates among top assignees, reflecting deep cumulative R&amp;D programs.</li>
        <li>Citation half-lives range from 6.3 years (Huawei) to 14.3 years (US Air Force), with pharmaceutical firms exhibiting longer half-lives than electronics and IT firms.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Patent quantity alone does not capture an organization&apos;s technological influence. This chapter brings together four complementary quality lenses -- blockbuster-versus-dud typologies, forward citation distributions, self-citation patterns, and citation half-lives -- to reveal how leading firms differ not just in the volume of patents they produce, but in the impact, durability, and cumulative nature of their innovation portfolios.
        </p>
      </aside>

      <Narrative>
        <p>
          While <Link href="/chapters/org-patent-count" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Organizational Patent Counts</Link> examined the volume of corporate patenting, raw patent counts tell only part of the story. Two firms with identical output levels can differ substantially in the quality and influence of their inventions. This chapter consolidates the <StatCallout value="quality dimensions" /> of organizational patenting: from blockbuster rates and citation impact to self-citation behavior and the temporal durability of a firm&apos;s knowledge contributions.
        </p>
        <p>
          The analysis employs four complementary approaches: a blockbuster-versus-dud typology that classifies firms by the tails of their quality distributions; average and median forward citations to capture central tendency and skewness; self-citation rates that distinguish cumulative internal R&amp;D from broad external knowledge sourcing; and citation half-lives that measure how quickly a firm&apos;s patents accumulate their influence.
        </p>
      </Narrative>

      {/* ── Section A: Quality Typology ── */}

      <SectionDivider label="Quality Typology" />

      <Narrative>
        <p>
          Plotting each firm&apos;s <GlossaryTooltip term="blockbuster rate">blockbuster rate</GlossaryTooltip> against its <GlossaryTooltip term="dud rate">dud rate</GlossaryTooltip> for the most recent
          complete decade (2010-2019) reveals distinct innovation strategies. Firms in the
          upper-right produce both high-impact breakthroughs and many zero-citation patents -- a
          high-variance strategy. Firms in the lower-right achieve high blockbuster rates with
          few duds, the hallmark of consistent quality.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-org-patent-quality-quality-scatter"
        title="Amazon's 6.7% Blockbuster Rate Leads the Field, While 18 of 50 Firms Exceed a 50% Dud Rate (2010-2019)"
        subtitle="Blockbuster rate vs. dud rate for the top 50 assignees (2010-2019), with bubble size proportional to patent count and color by primary CPC section"
        caption="Each bubble represents one of the top 50 assignees in the decade 2010-2019. X-axis: share of patents in the top 1% of their year x CPC section cohort. Y-axis: share of patents receiving zero 5-year forward citations. Bubble size: total patents. Color: primary CPC section."
        insight={`Amazon occupies the lower-right quadrant with a blockbuster rate of 6.7% and a dud rate of 18.3%, classifying it as a consistent high-impact innovator. By contrast, several firms, predominantly Japanese electronics companies, cluster in the upper-left with blockbuster rates below 0.2% and dud rates above 50%.`}
        loading={fsL}
        height={500}
        wide
      >
        <PWBubbleScatter
          data={scatterData}
          xLabel="Blockbuster Rate (%)"
          yLabel="Dud Rate (%)"
          xMidline={1}
          yMidline={40}
          quadrants={[
            { position: 'top-right', label: 'High-Variance' },
            { position: 'bottom-right', label: 'Consistent Stars' },
            { position: 'top-left', label: 'Underperformers' },
            { position: 'bottom-left', label: 'Steady Contributors' },
          ]}
          labeledPoints={['Amazon', 'Apple', 'Google', 'Cisco', 'AT&T', 'TSMC', 'Ford', 'Microsoft']}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The quality typology scatter reveals that technology sector alone does not determine innovation strategy.
          Within the same CPC section, firms exhibit substantially different blockbuster-to-dud ratios,
          suggesting that organizational factors -- R&amp;D investment concentration, inventor incentive
          structures, and portfolio management decisions -- contribute meaningfully to shaping the quality
          distribution of a firm&apos;s patent output.
        </p>
      </KeyInsight>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a company:</div>
        <PWCompanySelector
          companies={qualityCompanies}
          selected={selectedQualityFirm}
          onSelect={setSelectedQualityFirm}
        />
      </div>

      <ChartContainer
        id="fig-org-patent-quality-quality-fan"
        title={`${selectedQualityFirm}: 35 of 48 Top Firms Saw Median Forward Citations Fall to Zero by 2019`}
        subtitle={`5-year forward citation percentiles (P10-P90) for ${selectedQualityFirm} patents by grant year, with company selector`}
        caption={`5-year forward citation percentiles for ${selectedQualityFirm} patents by grant year (1976-2019). Bands show P25-P75 (dark) and P10-P90 (light). Solid line = median; dashed gray = system-wide median. Only years with >=10 patents shown.`}
        insight="The width of the fan reveals the dispersion of quality within the firm's portfolio. A widening gap between the median and upper percentiles indicates increasing reliance on a small fraction of high-impact patents."
        loading={fqL}
        height={400}
        wide
        interactive={true}
      >
        <PWFanChart
          data={selectedQualityData}
          yLabel="5-Year Forward Citations"
          showMean
        />
      </ChartContainer>

      <ChartContainer
        id="fig-org-patent-quality-blockbuster-dud"
        title={`${selectedQualityFirm}: Blockbuster Rate (Top 1% Patents) and Dud Rate (Zero Citations) Over Time`}
        subtitle={`Annual share of top-1% blockbuster patents and zero-citation dud patents for ${selectedQualityFirm}, with company selector`}
        caption={`Annual blockbuster rate (patents in top 1% of year x CPC section cohort, blue) and dud rate (zero 5-year forward citations, red) for ${selectedQualityFirm}. Dashed line at 1% marks the expected blockbuster rate under uniform quality.`}
        insight="Diverging blockbuster and dud rate trajectories over time reveal shifts in a firm's innovation strategy, distinguishing periods of breakthrough-oriented R&D from phases of incremental or defensive patenting."
        loading={fqL}
        height={300}
        wide
        interactive={true}
      >
        {selectedQualityData.length > 0 ? (
          <PWLineChart
            data={selectedQualityData.map(d => ({
              year: d.year,
              blockbuster_rate: +(d.blockbuster_rate * 100).toFixed(2),
              dud_rate: +(d.dud_rate * 100).toFixed(2),
            }))}
            xKey="year"
            lines={[
              { key: 'blockbuster_rate', name: 'Blockbuster Rate (%)', color: CHART_COLORS[0] },
              { key: 'dud_rate', name: 'Dud Rate (%)', color: CHART_COLORS[3], dashPattern: '8 4' },
            ]}
            yLabel="Share of Patents (%)"
            yFormatter={(v) => `${v}%`}
          />
        ) : <div />}
      </ChartContainer>

      {/* ── Section B: Forward Citations ── */}

      <SectionDivider label="Forward Citations" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s technological influence. <GlossaryTooltip term="forward citations">Forward
          citations</GlossaryTooltip>, which measure how frequently a firm&apos;s patents are cited by subsequent inventions, provide
          a complementary indicator of the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-org-patent-quality-citation-impact"
        title="Microsoft Leads in Average Citations (30.7) While IBM's 5.6x Average-to-Median Ratio Reveals a Highly Skewed Portfolio"
        subtitle="Average and median forward citations per patent for major assignees, based on patents granted through 2020"
        caption="Average and median forward citations per patent for major patent holders, limited to patents granted through 2020 to allow for citation accumulation. Organizations with large average-to-median ratios exhibit skewed citation distributions indicative of a small number of highly cited patents."
        insight="The divergence between average and median citations distinguishes portfolios characterized by a few highly cited patents (high average, lower median) from those with more uniformly impactful output."
        loading={citL}
        height={900}
      >
        <PWBarChart
          data={citData}
          xKey="label"
          bars={[
            { key: 'avg_citations_received', name: 'Average Citations', color: CHART_COLORS[0] },
            { key: 'median_citations_received', name: 'Median Citations', color: CHART_COLORS[2] },
          ]}
          layout="vertical"
          yLabel="Citations"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          The divergence between average and median citations is informative: most firms produce patents
          with modest citation impact, while a small number generate highly cited inventions that elevate the
          mean. Firms with high average-to-median ratios exhibit skewed citation distributions,
          characterized by a few highly cited patents alongside many of lower impact. Firms with
          closer average and median values, by contrast, produce more uniformly impactful output.
        </p>
      </KeyInsight>

      {/* ── Section C: Self-Citations ── */}

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
        id="fig-org-patent-quality-self-citation-by-assignee"
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

      <KeyInsight>
        <p>
          The variation in self-citation rates across top filers distinguishes firms that build cumulatively
          on internal prior art from those that draw broadly on external knowledge. Canon&apos;s 47.6%
          self-citation rate reflects decades of iterative improvement in imaging technology, while firms
          with lower rates may rely more heavily on integrating knowledge from diverse external sources.
        </p>
      </KeyInsight>

      {/* ── Section D: Citation Half-Lives ── */}

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
        id="fig-org-patent-quality-citation-half-life"
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

      <KeyInsight>
        <p>
          The nearly threefold variation in citation half-lives across leading organizations reflects fundamental
          differences in the nature of their innovations. Science-intensive firms produce patents with slow-burning,
          foundational influence, while fast-cycle technology firms generate impact that peaks shortly after grant.
          This distinction has implications for how firms should evaluate the long-term return on their R&amp;D investments.
        </p>
      </KeyInsight>

      {/* ── Quality Metrics by Company ── */}
      <SectionDivider label="Quality Metrics Across Leading Organizations" />
      <Narrative>
        <p>
          Beyond citation impact and blockbuster rates, patent quality can be assessed through claims complexity, technological scope, and examination timelines across leading organizations.
        </p>
      </Narrative>
      <ChartContainer
        id="fig-org-patent-quality-fwd-citations-by-company"
        title="IBM and Samsung Led in Average Forward Citations Through the 1990s, but Convergence Narrowed the Gap by 2015"
        subtitle="Average forward citations per patent per year for the top 5 assignees by total patent count"
        caption="Average 5-year forward citations per patent for the five most prolific assignees, plotted annually from 1976 to the most recent complete citation window. Declining averages across all firms reflect system-wide citation dilution as the patent population expands."
        insight="The long-run convergence in forward citations suggests that scale alone does not sustain citation advantage -- as portfolios grow, average impact per patent tends to regress toward the system-wide mean."
        loading={qbcL}
        height={400}
        wide
        controls={controlsCompanyFwdCite}
      >
        <PWLineChart
          data={normalizedCompanyFwdCite ?? []}
          xKey="year"
          lines={companyLines}
          yLabel={companyFwdCiteYLabel}
          truncationYear={2018}
        />
      </ChartContainer>

      <ChartContainer
        id="fig-org-patent-quality-claims-by-company"
        title="Claim Counts Rose Across All Top Filers, With Samsung and Canon Converging on IBM by the 2010s"
        subtitle="Average number of claims per patent per year for the top 5 assignees by total patent count"
        caption="Average number of claims per patent for the five most prolific assignees, plotted annually. Rising claim counts reflect a system-wide trend toward broader patent drafting, with notable firm-level variation."
        insight="The universal rise in claim counts indicates broader patent drafting strategies across all leading firms, likely driven by changes in prosecution practice and competitive pressure to secure wider protection."
        loading={qbcL}
        height={400}
        wide
      >
        <PWLineChart
          data={pivotCompanyMetric(qualityByCompany, 'avg_num_claims', topCompanies)}
          xKey="year"
          lines={companyLines}
          yLabel="Avg Claims per Patent"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-org-patent-quality-originality-by-company"
        title="Patent Originality Scores Rose Sharply After 1980 and Stabilized Near 0.5 for Most Leading Firms"
        subtitle="Average originality score (diversity of backward citation sources) per year for the top 5 assignees"
        caption="Average originality score for the five most prolific assignees, plotted annually. Originality measures the diversity of technology classes cited by each patent's backward references, with higher values indicating broader knowledge sourcing."
        insight="The convergence of originality scores near 0.5 across diverse firms suggests a common shift toward drawing on broader prior art bases, regardless of a firm's primary technology domain."
        loading={qbcL}
        height={400}
        wide
      >
        <PWLineChart
          data={pivotCompanyMetric(qualityByCompany, 'avg_originality', topCompanies)}
          xKey="year"
          lines={companyLines}
          yLabel="Avg Originality Score"
        />
      </ChartContainer>

      <ChartContainer
        id="fig-org-patent-quality-grant-lag-by-company"
        title="Grant Lag Doubled From ~600 Days to Over 1,200 Days Before Declining After USPTO Reforms"
        subtitle="Average days from filing to grant per year for the top 5 assignees by total patent count"
        caption="Average grant lag (days from application filing to patent grant) for the five most prolific assignees, plotted annually. The rise and subsequent decline reflect USPTO examination backlog dynamics and procedural reforms."
        insight="The parallel trajectories across firms indicate that grant lag is driven primarily by USPTO capacity and policy rather than firm-specific prosecution strategies, though Japanese firms historically faced slightly longer waits."
        loading={qbcL}
        height={400}
        wide
      >
        <PWLineChart
          data={pivotCompanyMetric(qualityByCompany, 'avg_grant_lag_days', topCompanies)}
          xKey="year"
          lines={companyLines}
          yLabel="Avg Grant Lag (Days)"
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          Across four quality dimensions, the top five patent filers exhibit parallel trajectories:
          forward citations decline system-wide, claim counts rise universally, originality scores converge,
          and grant lag follows USPTO capacity cycles. These shared trends suggest that macro-level forces --
          citation dilution, prosecution norms, and examination backlogs -- shape patent quality metrics at
          least as strongly as firm-specific R&amp;D strategies. The remaining firm-level variation, however,
          reveals meaningful differences in portfolio composition and drafting practices.
        </p>
      </KeyInsight>

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The quality analysis reveals that large patent portfolios mask enormous heterogeneity in impact. Blockbuster rates, forward citation distributions, self-citation patterns, and citation half-lives each expose a different dimension of organizational innovation strategy. The next chapter, <Link href="/chapters/org-patent-portfolio" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Organizational Patent Portfolios</Link>, examines how firms distribute their innovation across technology domains and whether portfolio diversification strategies correlate with sustained leadership.
        </p>
      </Narrative>

      <DataNote>
        Citation impact is calculated using forward citations for patents granted through 2020
        to allow for sufficient citation accumulation. Fan charts show percentile distributions
        (P10, P25, median, P75, P90) for firms with at least 10 patents per grant year.
        Blockbuster rate measures the share of patents in the top 1% of their year x CPC section
        cohort. Dud rate measures the share of patents receiving zero 5-year forward citations.
        Self-citation rate measures the fraction of backward citations directed to the same assignee.
        Citation half-life uses patents granted before 2010 to ensure at least 15 years of citation
        accumulation. The quality scatter uses the most recent complete decade (2010-2019) to ensure
        complete citation windows. Organization names are disambiguated identities from PatentsView.
      </DataNote>

      <RelatedChapters currentChapter={10} />
      <ChapterNavigation currentChapter={10} />
    </div>
  );
}
