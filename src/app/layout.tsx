import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReadingProgress } from '@/components/layout/ReadingProgress';
import { BackToTop } from '@/components/layout/BackToTop';
import { JsonLd } from '@/components/JsonLd';
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
    default: 'PatentWorld \u2014 50 Years of US Patent Data',
    template: '%s | PatentWorld',
  },
  description: 'Interactive analysis of 9.36 million US patents (1976\u20132025) from PatentsView. Annual grants grew more than five-fold; computing and electronics rose from 27% to 57% of all grants.',
  keywords: ['patents', 'innovation', 'USPTO', 'patent data', 'patent analytics', 'technology trends', 'patent visualization', 'PatentsView', 'patent quality', 'patent citations', 'US patents', 'patent statistics'],
  authors: [{ name: 'Saerom (Ronnie) Lee', url: 'https://www.saeromlee.com' }],
  openGraph: {
    type: 'website',
    title: 'PatentWorld \u2014 50 Years of US Patent Data',
    description: 'Interactive analysis of 9.36M US patents (1976\u20132025). Annual grants grew more than five-fold; computing and electronics rose from 27% to 57% of all grants.',
    siteName: 'PatentWorld',
    url: 'https://patentworld.vercel.app',
    images: [{
      url: 'https://patentworld.vercel.app/og/home.png',
      width: 1200,
      height: 630,
      alt: 'PatentWorld \u2014 50 Years of US Patent Data',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatentWorld \u2014 50 Years of US Patent Data',
    description: 'Interactive analysis of 9.36M US patents (1976\u20132025). Annual grants grew more than five-fold; computing and electronics rose from 27% to 57% of all grants.',
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
        <meta name="google-site-verification" content="El4nzV7RYgAGJl6KI74cX-Hj3LNkzQamTYyudkoF0es" />
        <meta name="msvalidate.01" content="AFA1EA03BEF26C7EAF46830EC6A92A41" />
        <JsonLd data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'PatentWorld',
            description: 'Interactive exploration of 9.36 million US patents granted by the USPTO from 1976 to 2025.',
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
              description: 'Analysis of 9.36 million US patents from PatentsView, covering technology classifications, inventor demographics, geographic distribution, citation networks, and patent quality indicators.',
              creator: { '@type': 'Organization', name: 'USPTO / PatentsView' },
              temporalCoverage: '1976/2025',
              spatialCoverage: 'United States',
              variableMeasured: [
                'Patent grants per year',
                'Technology classifications (CPC)',
                'Inventor demographics and collaboration',
                'Geographic distribution',
                'Citation networks and patent quality',
              ],
            },
            hasPart: CHAPTERS.map((ch) => ({
              '@type': 'ScholarlyArticle',
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
        ]} />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-1 focus:left-1 focus:z-[80] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm">
            Skip to content
          </a>
          <ReadingProgress />
          <Header />
          <main id="main-content" className="min-h-screen">{children}</main>
          <BackToTop />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
