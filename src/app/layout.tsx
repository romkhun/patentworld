import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CHAPTERS } from '@/lib/constants';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PatentWorld — 50 Years of US Patent Data Visualized',
    template: '%s | PatentWorld',
  },
  description: 'Explore 9.36 million US patents from 1976 to 2025. Interactive visualizations of patent trends, technology sectors, inventor demographics, geographic clusters, citation networks, and patent quality indicators.',
  keywords: ['patents', 'innovation', 'USPTO', 'patent data', 'patent analytics', 'technology trends', 'patent visualization', 'PatentsView', 'patent quality', 'patent citations', 'US patents', 'patent statistics'],
  authors: [{ name: 'Saerom (Ronnie) Lee', url: 'https://www.saeromlee.com' }],
  openGraph: {
    type: 'website',
    title: 'PatentWorld — 50 Years of US Patent Data Visualized',
    description: 'Interactive analysis of 9.36M US patents (1976-2025). Explore trends in technology, company portfolios, inventor demographics, and geographic concentration.',
    siteName: 'PatentWorld',
    url: 'https://patentworld.vercel.app',
    images: [{
      url: 'https://patentworld.vercel.app/og/home.png',
      width: 1200,
      height: 630,
      alt: 'PatentWorld — 50 Years of US Patent Data Visualized',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatentWorld — 50 Years of US Patent Data Visualized',
    description: 'Interactive analysis of 9.36M US patents (1976-2025). Explore trends in technology, company portfolios, inventor demographics, and geographic concentration.',
    images: ['https://patentworld.vercel.app/og/home.png'],
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
  alternates: {
    canonical: 'https://patentworld.vercel.app',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'PatentWorld',
                description: 'An interactive exploration of 9.36 million US patents spanning 50 years of global innovation.',
                url: 'https://patentworld.vercel.app',
                author: {
                  '@type': 'Person',
                  name: 'Saerom (Ronnie) Lee',
                  jobTitle: 'Assistant Professor of Management',
                  affiliation: {
                    '@type': 'Organization',
                    name: 'The Wharton School, University of Pennsylvania',
                  },
                  url: 'https://www.saeromlee.com',
                },
                about: {
                  '@type': 'Dataset',
                  name: 'US Patent Data (1976-2025)',
                  description: 'Comprehensive analysis of 9.36 million US utility patents from PatentsView, covering technology classifications, inventor demographics, geographic distribution, citation networks, and patent quality indicators.',
                  creator: { '@type': 'Organization', name: 'USPTO / PatentsView' },
                  temporalCoverage: '1976/2025',
                  spatialCoverage: 'Global',
                  variableMeasured: [
                    'Patent grants per year',
                    'Technology classifications (CPC)',
                    'Inventor demographics and collaboration',
                    'Geographic distribution',
                    'Citation networks and patent quality',
                  ],
                },
                hasPart: CHAPTERS.map((ch) => ({
                  '@type': 'Article',
                  name: ch.title,
                  description: ch.description,
                  url: `https://patentworld.vercel.app/chapters/${ch.slug}/`,
                  position: ch.number,
                })),
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patentworld.vercel.app' },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
