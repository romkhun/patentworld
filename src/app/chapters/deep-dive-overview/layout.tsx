import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: 'ACT 6 Overview — Cross-Domain Comparison | PatentWorld',
  description:
    'A comparative overview of twelve technology domains examined in the ACT 6 Deep Dives, with shared metric definitions, volume comparisons, quality benchmarks, and cross-domain spillover analysis.',
  keywords: ['technology domains', 'cross-domain comparison', 'patent analysis', 'deep dive', 'AI patents', 'green innovation', 'semiconductors', 'quantum computing'],
  openGraph: {
    type: 'article',
    title: 'ACT 6 Overview — Cross-Domain Comparison | PatentWorld',
    description: 'A comparative overview of twelve technology domains examined in the ACT 6 Deep Dives, with shared metric definitions, volume comparisons, quality benchmarks, and cross-domain spillover analysis.',
    url: `${BASE_URL}/chapters/deep-dive-overview/`,
    siteName: 'PatentWorld',
    images: [{
      url: `${BASE_URL}/og/deep-dive-overview.png`,
      width: 1200,
      height: 630,
      alt: 'ACT 6 Overview — Cross-Domain Comparison — PatentWorld',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACT 6 Overview — Cross-Domain Comparison | PatentWorld',
    description: 'A comparative overview of twelve technology domains examined in the ACT 6 Deep Dives, with shared metric definitions, volume comparisons, quality benchmarks, and cross-domain spillover analysis.',
    images: [`${BASE_URL}/og/deep-dive-overview.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/chapters/deep-dive-overview/`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'ScholarlyArticle',
          headline: 'ACT 6 Overview — Cross-Domain Comparison',
          description: 'A comparative overview of twelve technology domains examined in the ACT 6 Deep Dives, with shared metric definitions, volume comparisons, quality benchmarks, and cross-domain spillover analysis.',
          author: {
            '@type': 'Person',
            name: 'Saerom (Ronnie) Lee',
            jobTitle: 'Assistant Professor of Management',
            affiliation: {
              '@type': 'Organization',
              name: 'The Wharton School, University of Pennsylvania',
            },
          },
          publisher: {
            '@type': 'Organization',
            name: 'University of Pennsylvania',
            url: 'https://www.upenn.edu',
          },
          datePublished: '2026-01-01',
          dateModified: '2026-02-14',
          mainEntityOfPage: `${BASE_URL}/chapters/deep-dive-overview/`,
          image: `${BASE_URL}/og/deep-dive-overview.png`,
          isPartOf: {
            '@type': 'WebSite',
            name: 'PatentWorld',
            url: BASE_URL,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Act 6: Deep Dives', item: `${BASE_URL}/#chapters` },
            { '@type': 'ListItem', position: 3, name: 'Cross-Domain Comparison', item: `${BASE_URL}/chapters/deep-dive-overview/` },
          ],
        },
      ]} />
      {children}
    </>
  );
}
