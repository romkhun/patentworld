import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'PatentWorld: US Patent Trends & Innovation Data',
  description: 'Explore 9.36 million US patents from 1976 to 2025. Interactive visualizations of patent trends, AI patents, technology sectors, inventor demographics, gender gap, geographic clusters, citation networks, grant lag, and patent quality indicators.',
  alternates: {
    canonical: 'https://patentworld.vercel.app',
  },
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many US patents have been granted since 1976?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The USPTO has granted approximately 9.36 million utility patents from 1976 to 2025, growing from about 70,000 per year to over 350,000 per year.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which technology sectors have the most US patents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Electricity (CPC Section H) and Physics (Section G) dominate modern patenting, reflecting the digital transformation. Together they account for over 50% of recent grants, driven by software, semiconductors, and telecommunications innovations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who holds the most US patents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IBM has historically led US patent grants for decades. Samsung, Canon, Intel, and other technology firms are also among the top holders. The landscape has shifted significantly with the rise of Asian firms.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is PatentsView?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PatentsView is a patent data platform supported by the United States Patent and Trademark Office (USPTO) that provides disambiguated and linked patent data covering inventors, assignees, classifications, locations, and citations.',
      },
    },
    {
      '@type': 'Question',
      name: 'How has the geography of US patent innovation changed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'California accounts for the largest share of US patent output, with Silicon Valley serving as the leading innovation cluster. Internationally, Japan accounted for the largest share of foreign-origin US patents in the 1980s and 1990s, while South Korea, China, and Taiwan have grown substantially since 2000.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to get a US patent?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Average grant lag is approximately 3 years (about 1,100 days), varying by technology area. Electrical and software patents tend to have longer pendency than mechanical inventions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the fastest-growing patent technology areas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Computing, semiconductors, and AI have exhibited the most substantial growth. AI patent filings have increased approximately six-fold since 2010, driven by advances in deep learning.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is AI patenting growing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI-related patent filings have grown substantially, particularly since 2012. IBM, Samsung, Google, and Microsoft are among the leading AI patent filers. AI-related claims now appear across virtually every technology domain.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the gender gap in patenting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Women represent a growing but still small share of patent inventors. The share of women inventors has increased from under 5% in the 1970s to approximately 15-20% in recent years, with higher representation in chemistry and biotech than electronics.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which countries file the most US patents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After the United States, Japan, South Korea, Germany, and China are the leading countries of origin for US patent inventors. China\'s share has increased substantially since 2010.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <HomeContent />
    </>
  );
}
