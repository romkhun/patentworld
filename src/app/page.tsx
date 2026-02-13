import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'PatentWorld — 50 Years of Global Innovation in US Patents',
  description: 'Explore 9.36 million US patents from 1976 to 2025. Interactive visualizations of patent trends, technology sectors, inventor demographics, geographic clusters, citation networks, and patent quality indicators.',
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
        text: 'California dominates US patent output, with Silicon Valley as the leading innovation hub. Internationally, Japan dominated foreign patenting in the 1980s-90s, while South Korea, China, and Taiwan have surged since 2000.',
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
