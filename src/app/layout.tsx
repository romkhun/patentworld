import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
    default: 'PatentWorld - 50 Years of Global Innovation in US Patents',
    template: '%s | PatentWorld',
  },
  description: 'Explore 9.36 million US patents from 1976 to 2025. Interactive visualizations of patent trends, technology sectors, inventor demographics, geographic clusters, citation networks, and patent quality indicators.',
  keywords: ['patents', 'innovation', 'USPTO', 'patent data', 'patent analytics', 'technology trends', 'patent visualization', 'PatentsView', 'patent quality', 'patent citations', 'US patents', 'patent statistics'],
  authors: [{ name: 'PatentWorld' }],
  openGraph: {
    type: 'website',
    title: 'PatentWorld - 50 Years of Global Innovation',
    description: 'Explore 9.36 million US patents from 1976 to 2025 through interactive data visualizations covering technology trends, inventor demographics, geographic clusters, and patent quality.',
    siteName: 'PatentWorld',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatentWorld - 50 Years of Global Innovation',
    description: 'Explore 9.36 million US patents from 1976 to 2025 through interactive data visualizations.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'PatentWorld',
              description: 'An interactive exploration of 9.36 million US patents spanning 50 years of global innovation.',
              url: 'https://patentworld.vercel.app',
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
            }),
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
