import type { Metadata } from 'next';
import { HERO_STATS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about US patent data, top patent holders, grant timelines, and technology trends — drawn from analysis of 9.36 million US patents (1976-2025).',
  openGraph: {
    type: 'website',
    title: 'FAQ | PatentWorld',
    description: 'Answers to common questions about US patent data, top patent holders, grant timelines, and technology trends.',
    url: 'https://patentworld.vercel.app/faq/',
    siteName: 'PatentWorld',
    images: [{ url: 'https://patentworld.vercel.app/og/home.png', width: 1200, height: 630, alt: 'PatentWorld FAQ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | PatentWorld',
    description: 'Answers to common questions about US patent data, top patent holders, grant timelines, and technology trends.',
    images: ['https://patentworld.vercel.app/og/home.png'],
  },
  alternates: {
    canonical: 'https://patentworld.vercel.app/faq/',
  },
};

const FAQ_ITEMS = [
  {
    question: 'How many US patents have been granted since 1976?',
    answer: `The USPTO granted approximately ${HERO_STATS.totalPatents} utility, design, plant, and reissue patents between 1976 and 2025. Annual grants grew from approximately 70,000 in the late 1970s to over 350,000 in recent years, representing a roughly five-fold increase over five decades.`,
  },
  {
    question: 'Which company has the most US patents?',
    answer: 'IBM holds the largest US patent portfolio over the 1976-2025 period, followed by Samsung and Canon. The top 10 assignees collectively account for approximately 15% of all US patent grants. Foreign-headquartered assignees surpassed US-based assignees in annual grant volume around 2007.',
  },
  {
    question: 'How long does it take to obtain a US patent?',
    answer: 'The median time from patent application filing to grant (patent pendency) peaked above 3 years in the late 2000s. Since then, pendency has generally declined to approximately 2 years, though it varies substantially by technology area and examiner workload.',
  },
  {
    question: 'What are the fastest-growing patent technology areas?',
    answer: 'Computing and electronics technologies (CPC sections G and H) have exhibited the most substantial growth, rising from approximately 10% to over 55% of all annual patent grants between 1976 and 2025. Within these, artificial intelligence, semiconductor, and software-related classifications have grown particularly rapidly since 2012.',
  },
  {
    question: 'Is AI patenting increasing?',
    answer: 'AI-related patent filings grew approximately six-fold during the deep learning era, from approximately 5,200 in 2012 to nearly 30,000 by 2023. Neural network and deep learning approaches have become the dominant AI patent category, surpassing earlier subfields including computer vision and knowledge-based systems.',
  },
  {
    question: 'What is the gender gap in US patenting?',
    answer: 'Female inventor representation on US patents has risen steadily but remains below 15% of all inventor instances. Average patent team size has approximately doubled from 1.8 to 3.5 inventors over the study period, but the gender composition of these teams has evolved gradually.',
  },
  {
    question: 'Which countries\' inventors file the most US patents?',
    answer: 'While the United States remains the largest source of US patent inventors, Japan, South Korea, China, and Germany are major contributors. Foreign-origin patents have increased substantially, with international co-invention growing from approximately 2% to approaching 10% of all patents.',
  },
  {
    question: 'How has patent quality changed over time?',
    answer: 'Median forward citations (a common quality proxy) have declined approximately 40% since the early 2000s as patent volume increased. However, patent originality (diversity of cited prior art) has increased, while generality (breadth of citing patents) has declined, indicating more specialized knowledge flows.',
  },
  {
    question: 'What data source does PatentWorld use?',
    answer: 'PatentWorld uses data from PatentsView (patentsview.org), a platform maintained by the USPTO that provides detailed data on US patent grants, inventors, assignees, technology classifications (CPC), citations, and geographic locations. The dataset covers patents granted from 1976 through 2025.',
  },
  {
    question: 'Who created PatentWorld?',
    answer: 'PatentWorld was created by Saerom (Ronnie) Lee, Assistant Professor of Management at The Wharton School, University of Pennsylvania. The project provides interactive visualizations and analysis of US patent data for academic, policy, and public audiences.',
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

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
          Lee, Saerom. 2025. &ldquo;PatentWorld: 50 Years of US Patent Data.&rdquo; The Wharton School, University of Pennsylvania.{' '}
          <a href="https://patentworld.vercel.app" className="text-primary hover:underline">
            https://patentworld.vercel.app
          </a>
        </p>
      </div>
    </div>
  );
}
