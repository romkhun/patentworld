import type { Metadata } from 'next';
import { CHAPTERS } from './constants';

const BASE_URL = 'https://patentworld.vercel.app';

const CHAPTER_KEYWORDS: Record<string, string[]> = {
  'the-innovation-landscape': ['patent trends', 'USPTO statistics', 'patent grants per year', 'innovation trends', 'US patent data', 'patent growth'],
  'the-technology-revolution': ['CPC classification', 'technology sectors', 'WIPO fields', 'software patents', 'biotech patents', 'emerging technologies', 'patent technology trends'],
  'who-innovates': ['top patent holders', 'IBM patents', 'Samsung patents', 'corporate patenting', 'university patents', 'patent assignees', 'patent concentration'],
  'the-inventors': ['patent inventors', 'team size innovation', 'gender gap patents', 'prolific inventors', 'inventor demographics', 'women in patenting'],
  'collaboration-networks': ['co-invention networks', 'patent collaboration', 'inventor migration', 'co-patenting', 'international collaboration', 'R&D networks'],
  'the-geography-of-innovation': ['Silicon Valley patents', 'patent geography', 'innovation hubs', 'state patent activity', 'international patent origins', 'geographic concentration'],
  'the-knowledge-network': ['patent citations', 'knowledge flows', 'government funded patents', 'citation networks', 'technology spillovers', 'patent references'],
  'innovation-dynamics': ['grant lag', 'patent pendency', 'cross-domain innovation', 'international collaboration', 'innovation velocity', 'technology convergence'],
  'patent-quality': ['patent quality', 'forward citations', 'patent originality', 'patent generality', 'citation impact', 'patent value'],
  'patent-law': ['patent law', 'Bayh-Dole Act', 'America Invents Act', 'Alice Corp', 'patent reform', 'Supreme Court patent', 'patent policy', 'patent legislation'],
  'ai-patents': ['AI patents', 'artificial intelligence patents', 'machine learning patents', 'deep learning patents', 'generative AI', 'AI innovation'],
  'green-innovation': ['green patents', 'climate technology patents', 'renewable energy patents', 'carbon capture patents', 'clean technology', 'green AI', 'Y02 CPC codes', 'environmental innovation'],
  'the-language-of-innovation': ['topic modeling patents', 'patent text analysis', 'NLP patents', 'semantic analysis', 'patent abstracts', 'innovation themes', 'patent novelty', 'emerging technologies'],
};

export function chapterMetadata(slug: string): Metadata {
  const ch = CHAPTERS.find((c) => c.slug === slug);
  if (!ch) return {};

  const title = `${ch.title} — Chapter ${ch.number}`;
  const description = `${ch.subtitle}. ${ch.description} Interactive data visualizations of US patent trends from 1976 to 2025.`;
  const keywords = CHAPTER_KEYWORDS[slug] ?? [];

  return {
    title,
    description,
    keywords: ['patents', 'innovation', 'USPTO', 'patent data', ...keywords],
    openGraph: {
      type: 'article',
      title: `${ch.title} | PatentWorld`,
      description,
      url: `${BASE_URL}/chapters/${ch.slug}/`,
      siteName: 'PatentWorld',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ch.title} | PatentWorld`,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/chapters/${ch.slug}/`,
    },
  };
}

export function chapterJsonLd(slug: string): object[] | null {
  const ch = CHAPTERS.find((c) => c.slug === slug);
  if (!ch) return null;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: ch.title,
      description: `${ch.subtitle}. ${ch.description}`,
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
      datePublished: '2025-01-01',
      dateModified: '2025-06-01',
      mainEntityOfPage: `${BASE_URL}/chapters/${ch.slug}/`,
      keywords: CHAPTER_KEYWORDS[slug]?.join(', '),
      isPartOf: {
        '@type': 'WebSite',
        name: 'PatentWorld',
        url: BASE_URL,
      },
      about: {
        '@type': 'Dataset',
        name: 'US Patent Data (1976-2025)',
        description: 'Analysis of 9.36 million US utility patents from PatentsView / USPTO.',
        temporalCoverage: '1976/2025',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: ch.title, item: `${BASE_URL}/chapters/${ch.slug}/` },
      ],
    },
  ];
}
