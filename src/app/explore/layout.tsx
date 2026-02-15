import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: 'Search 9.36M Patents by Assignee & Technology',
  description: 'Interactive search of 9.36M US patents (1976-2025) by assignee, inventor, CPC class, and WIPO field. Browse top 100 organizations and prolific inventors.',
  alternates: {
    canonical: `${BASE_URL}/explore/`,
  },
  openGraph: {
    type: 'website',
    title: 'Search 9.36M Patents by Assignee & Technology | PatentWorld',
    description: 'Interactive search of 9.36M US patents (1976-2025) by assignee, inventor, CPC class, and WIPO field.',
    url: `${BASE_URL}/explore/`,
    siteName: 'PatentWorld',
    images: [{ url: `${BASE_URL}/og/home.png`, width: 1200, height: 630, alt: 'PatentWorld Explore' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search 9.36M Patents by Assignee & Technology | PatentWorld',
    description: 'Interactive search of 9.36M US patents (1976-2025) by assignee, inventor, CPC class, and WIPO field.',
    images: [`${BASE_URL}/og/home.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Explore', item: `${BASE_URL}/explore/` },
  ],
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={BREADCRUMB_JSONLD} />
      {children}
    </>
  );
}
