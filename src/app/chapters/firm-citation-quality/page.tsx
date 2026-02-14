'use client';

import { useMemo, useState } from 'react';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWBarChart } from '@/components/charts/PWBarChart';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { PWFanChart } from '@/components/charts/PWFanChart';
import { PWBubbleScatter } from '@/components/charts/PWBubbleScatter';
import { PWCompanySelector } from '@/components/charts/PWCompanySelector';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import Link from 'next/link';
import { CHART_COLORS } from '@/lib/colors';
import { cleanOrgName } from '@/lib/orgNames';
import type {
  FirmCitationImpact,
  FirmQualityYear, FirmClaimsYear, FirmQualityScatter,
} from '@/lib/types';

export default function FirmCitationQuality() {
  /* ── Data hooks ── */
  const { data: citImpact, loading: citL } = useChapterData<FirmCitationImpact[]>('chapter3/firm_citation_impact.json');
  const { data: firmQuality, loading: fqL } = useChapterData<Record<string, FirmQualityYear[]>>('company/firm_quality_distribution.json');
  const { data: firmClaims, loading: fcmL } = useChapterData<Record<string, FirmClaimsYear[]>>('company/firm_claims_distribution.json');
  const { data: firmScatter, loading: fsL } = useChapterData<FirmQualityScatter[]>('company/firm_quality_scatter.json');

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
  const selectedClaimsData = useMemo(() => firmClaims?.[selectedQualityFirm] ?? [], [firmClaims, selectedQualityFirm]);
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

  return (
    <div>
      <ChapterHeader
        number={11}
        title="Firm Citation Quality"
        subtitle="Citation impact distributions, blockbuster rates, and quality typologies across major patent holders"
      />

      <KeyFindings>
        <li>Microsoft leads in average forward citations (30.7) while IBM&apos;s 5.6x average-to-median ratio reveals a highly skewed portfolio with a few transformative patents alongside many incremental ones.</li>
        <li>35 of 48 top firms saw median forward citations fall to zero by 2019, indicating that most large filers produce a majority of patents that receive no citations within five years.</li>
        <li>Amazon&apos;s 6.7% blockbuster rate leads the field for 2010-2019, while 18 of 50 firms exceed a 50% dud rate, revealing sharply divergent quality strategies.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
        <p className="text-sm leading-relaxed">
          Patent quantity alone does not capture an organization&apos;s technological influence. This chapter examines how forward citations, blockbuster rates, and dud rates distinguish fundamentally different innovation strategies among the largest patent holders. Microsoft leads in average citations at 30.7, but the real story lies in the distributions: 35 of 48 top firms saw median citations fall to zero by 2019, and Amazon&apos;s 6.7% blockbuster rate stands far above most competitors.
        </p>
      </aside>

      <Narrative>
        <p>
          While <Link href="/chapters/assignee-landscape" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Firm Innovation</Link> examined the volume and organizational patterns of corporate patenting, raw patent counts tell only part of the story. Two firms with identical output levels can differ dramatically in the quality and influence of their inventions. This chapter moves beyond quantity to examine the <StatCallout value="citation impact distributions" /> that distinguish high-impact innovators from volume-oriented filers.
        </p>
        <p>
          The analysis employs three complementary lenses: average and median forward citations to capture central tendency and skewness, fan charts of citation percentiles to reveal the full distributional shape over time, and a blockbuster-versus-dud typology that classifies firms by the tails of their quality distributions. Together, these measures provide a nuanced portrait of how each firm&apos;s patent portfolio generates technological influence.
        </p>
      </Narrative>

      {/* ── Citation Impact ── */}

      <SectionDivider label="Citation Impact" />

      <Narrative>
        <p>
          Patent quantity alone does not capture an organization&apos;s technological influence. <GlossaryTooltip term="forward citations">Forward
          citations</GlossaryTooltip>, which measure how frequently a firm&apos;s patents are cited by subsequent inventions, provide
          a complementary indicator of the <StatCallout value="impact and influence" /> of their innovations.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-citation-quality-citation-impact"
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

      {/* ── Innovation Quality Profiles ── */}

      <SectionDivider label="Innovation Quality Profiles" />

      <Narrative>
        <p>
          Aggregate statistics such as average forward citations conceal the shape of each
          firm&apos;s quality distribution. A company with a median of 1 citation and a 99th
          percentile of 200 is a fundamentally different innovator than one with a median of 1
          and a 99th percentile of 10, even if their averages are similar. The fan charts below
          reveal how each firm&apos;s citation distribution evolves over time.
        </p>
      </Narrative>

      <div className="mb-6">
        <div className="text-sm font-medium mb-2">Select a company:</div>
        <PWCompanySelector
          companies={qualityCompanies}
          selected={selectedQualityFirm}
          onSelect={setSelectedQualityFirm}
        />
      </div>

      <ChartContainer
        id="fig-firm-citation-quality-quality-fan"
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
        id="fig-firm-citation-quality-blockbuster-dud"
        title={`${selectedQualityFirm}: Blockbuster Rate (Top 1% Patents) and Dud Rate (Zero Citations) Over Time`}
        subtitle={`Annual share of top-1% blockbuster patents and zero-citation dud patents for ${selectedQualityFirm}, with company selector`}
        caption={`Annual blockbuster rate (patents in top 1% of year x CPC section cohort, blue) and dud rate (zero 5-year forward citations, red) for ${selectedQualityFirm}. Dashed line at 1% marks the expected blockbuster rate under uniform quality.`}
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

      <ChartContainer
        id="fig-firm-citation-quality-claims-distribution"
        title={`${selectedQualityFirm}: Claim Count Distribution by Grant Year (1976-2025)`}
        subtitle={`Claim count percentiles (P25-P75) for ${selectedQualityFirm} patents by grant year, with company selector`}
        caption={`Claim count percentiles for ${selectedQualityFirm} patents by grant year. Bands show P25-P75 (dark). Dashed gray = system-wide median claims.`}
        loading={fcmL}
        height={350}
        wide
        interactive={true}
      >
        <PWFanChart
          data={selectedClaimsData}
          yLabel="Number of Claims"
          showP10P90={false}
          color={CHART_COLORS[1]}
        />
      </ChartContainer>

      {/* ── Firm Quality Typology ── */}

      <SectionDivider label="Quality Typology" />

      <Narrative>
        <p>
          Plotting each firm&apos;s blockbuster rate against its dud rate for the most recent
          complete decade (2010-2019) reveals distinct innovation strategies. Firms in the
          upper-right produce both high-impact breakthroughs and many zero-citation patents -- a
          high-variance strategy. Firms in the lower-right achieve high blockbuster rates with
          few duds, the hallmark of consistent quality.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-firm-citation-quality-quality-scatter"
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

      {/* ── Closing ── */}

      <Narrative>
        <p>
          The citation quality analysis reveals that large patent portfolios mask enormous heterogeneity in impact. The next chapter, <Link href="/chapters/technology-portfolios" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">Technology Portfolios</Link>, examines how firms distribute their innovation across technology domains and whether portfolio diversification strategies correlate with sustained leadership.
        </p>
      </Narrative>

      <DataNote>
        Citation impact is calculated using forward citations for patents granted through 2020
        to allow for sufficient citation accumulation. Fan charts show percentile distributions
        (P10, P25, median, P75, P90) for firms with at least 10 patents per grant year.
        Blockbuster rate measures the share of patents in the top 1% of their year x CPC section
        cohort. Dud rate measures the share of patents receiving zero 5-year forward citations.
        Claim count distributions use the number of independent and dependent claims as recorded
        at grant. The quality scatter uses the most recent complete decade (2010-2019) to ensure
        complete citation windows.
      </DataNote>

      <RelatedChapters currentChapter={11} />
      <ChapterNavigation currentChapter={11} />
    </div>
  );
}
