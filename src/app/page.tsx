import type { Metadata } from 'next';
import HomeContent from './HomeContent';

const BASE_URL = 'https://patentworld.vercel.app';

export const metadata: Metadata = {
  title: 'PatentWorld \u2014 50 Years of US Patent Data',
  description: 'Interactive analysis of 9.36 million US patents (1976\u20132025) from PatentsView. Annual grants grew more than five-fold; computing and electronics rose from 27% to 57% of all grants.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    title: 'PatentWorld \u2014 50 Years of US Patent Data',
    description: 'Interactive analysis of 9.36M US patents (1976\u20132025). Annual grants grew more than five-fold; computing and electronics rose from 27% to 57% of all grants.',
    url: BASE_URL,
    siteName: 'PatentWorld',
    images: [{ url: `${BASE_URL}/og/home.png`, width: 1200, height: 630, alt: 'PatentWorld \u2014 50 Years of US Patent Data' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatentWorld \u2014 50 Years of US Patent Data',
    description: 'Interactive analysis of 9.36M US patents (1976\u20132025). Annual grants grew more than five-fold; computing and electronics rose from 27% to 57% of all grants.',
    images: [`${BASE_URL}/og/home.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
};

export default function Page() {
  return <HomeContent />;
}
