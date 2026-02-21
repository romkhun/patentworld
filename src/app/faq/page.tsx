import type { Metadata } from 'next';
import { HERO_STATS } from '@/lib/constants';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: 'Top 10 Patent FAQs: IBM, AI Growth & Gender Gap',
  description: 'Get answers on US patent trends: IBM leads with 161K+ patents, AI filings grew 5.7x since 2012, women remain at 14.9% of inventors. Data from 9.36M patents (1976-2025).',
  openGraph: {
    type: 'website',
    title: 'Top 10 Patent FAQs: IBM, AI Growth & Gender Gap | PatentWorld',
    description: 'Get answers on US patent trends: IBM leads with 161K+ patents, AI filings grew 5.7x, women at 14.9% of inventors. Data from 9.36M patents.',
    url: `${BASE_URL}/faq/`,
    siteName: 'PatentWorld',
    images: [{ url: `${BASE_URL}/og/home.png`, width: 1200, height: 630, alt: 'PatentWorld FAQ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top 10 Patent FAQs: IBM, AI Growth & Gender Gap | PatentWorld',
    description: 'Get answers on US patent trends: IBM leads with 161K+ patents, AI filings grew 5.7x, women at 14.9% of inventors. Data from 9.36M patents.',
    images: [`${BASE_URL}/og/home.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/faq/`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const FAQ_ITEMS = [
  {
    question: 'How many US patents have been granted since 1976?',
    answer: `The USPTO granted ${HERO_STATS.totalPatents} utility, design, plant, and reissue patents between 1976 and 2025. Annual grants grew from approximately 70,000 in 1976 to a peak of 393,000 in 2019, a more than five-fold increase over five decades. Recent annual volume has stabilized at 314,000-326,000 grants per year.`,
  },
  {
    question: 'Which company has the most US patents?',
    answer: 'IBM leads all organizations with 161,888 cumulative US patent grants over the 1976-2025 period, followed by Samsung Electronics (157,906) and Canon (88,742). The top 10 assignees collectively hold 8% of all grants. Foreign-headquartered assignees first surpassed US-based assignees in annual grant volume in 2004, and the gap has widened since 2007.',
  },
  {
    question: 'How long does it take to obtain a US patent?',
    answer: 'The median time from application filing to grant (patent pendency) peaked at 3.6 years (median) (1,317 days) in 2010. Pendency has since declined substantially, reaching 2.4 years (875 days) in 2023, though it rose slightly to 2.6 years (959 days) in 2024. Pendency varies substantially by technology area and examiner workload.',
  },
  {
    question: 'What are the fastest-growing patent technology areas?',
    answer: 'Physics (CPC section G) and Electricity (section H) have exhibited the most substantial growth, rising from 27.0% to 57.3% of all annual patent grants between 1976 and 2024. In absolute terms, sections G and H grew from 19,000 combined grants in 1976 to 185,600 in 2024. Artificial intelligence, semiconductor, and software-related classifications within these sections have grown particularly rapidly since 2012.',
  },
  {
    question: 'Is AI patenting increasing?',
    answer: 'AI-related patent grants grew 5.7-fold during the deep learning era, from 5,201 in 2012 to 29,624 in 2023, reaching 9.4% of all patent grants. Computer vision (12,093 patents in 2023), neural networks and deep learning (10,467), and machine learning (9,444) are now the three largest AI subfields. AI patenting has broadly plateaued at 29,000 grants per year since 2022.',
  },
  {
    question: 'What is the gender gap in US patenting?',
    answer: 'Female inventor representation has risen from 2.8% in 1976 to 14.9% in 2025 (through September), but a substantial gender gap persists. Average patent team size has nearly doubled from 1.7 to 3.2 inventors over this period. Quality metrics show nuanced differences: all-female inventor teams tend to file fewer claims (10.6 vs. 14.5 for all-male teams in 2024) but have received higher forward citations in some recent years.',
  },
  {
    question: 'Which countries\' inventors file the most US patents?',
    answer: 'The United States leads with 4.21 million inventor-attributed patents (1976-2025), followed by Japan (1.45 million), Germany (494,000), South Korea (365,000), and China (260,000). Foreign-origin patents surpassed US-origin patents in annual volume around 2007. International co-invention rose from 1.0% of all patents in 1976 to 10.0% in 2025 (through September), reflecting increasingly globalized R&D.',
  },
  {
    question: 'How has patent quality changed over time?',
    answer: 'Average 5-year forward citations (a common quality proxy) peaked at 6.4 in 2019, up from 2.5 in 1976. Average claims per patent rose from 9.4 to 16.6 over the same period. Patent originality (diversity of cited prior art) increased from 0.09 to 0.25, while generality (breadth of citing patents) declined from 0.28 to 0.15, indicating that patents draw on more diverse sources but are cited in more specialized contexts.',
  },
  {
    question: 'Do top inventors produce higher-quality patents?',
    answer: 'Yes. The top 5% of inventors (by cumulative output) account for 63.2% of all patents, and their annual share rose from 26% to 60% between 1976 and 2025. Their patents receive higher average forward citations (15.0 vs. 13.0 for other inventors) with more claims (15.1 vs. 12.3) and broader scope (2.14 vs. 1.98). Separately, the top 12% by lifetime segment (Prolific, Superstar, and Mega) produce 61% of total grants. The most prolific inventor, Shunpei Yamazaki, holds 6,709 US patents spanning 1980-2025.',
  },
  {
    question: 'How does patent quality differ across US states?',
    answer: 'California dominates US patenting with 23.6% of all state-attributed grants (992,708 patents), followed by Texas (6.9%), New York (6.6%), Massachusetts (4.6%), and Michigan (4.3%). In terms of quality, California leads major states with an average of 5.23 forward citations per patent (2020 data), followed by Massachusetts (4.70), Colorado (4.39), and Michigan (4.38). Patent quality varies substantially even among top-patenting states.',
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${BASE_URL}/faq/` },
          ],
        },
      ]} />

      <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-4 text-muted-foreground">
        Common questions about US patent data, trends, and the PatentWorld project, addressed using findings from analysis of {HERO_STATS.totalPatents} US patents (1976-2025).
      </p>

      <div className="mt-12 divide-y divide-border">
        {FAQ_ITEMS.map((item, i) => (
          <details key={i} className="group py-6">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold leading-snug">
              <span className="pr-4">{item.question}</span>
              <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-lg border bg-muted/30 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Suggested Citation</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Lee, Saerom (Ronnie). 2026. &ldquo;PatentWorld: 50 Years of US Patent Data.&rdquo; The Wharton School, University of Pennsylvania. Available at:{' '}
          <a href="https://patentworld.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://patentworld.vercel.app
          </a>
        </p>
      </div>
    </div>
  );
}
