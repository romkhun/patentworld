import type { Metadata } from 'next';
import { CHAPTERS } from './constants';

const BASE_URL = 'https://patentworld.vercel.app';

const CHAPTER_KEYWORDS: Record<string, string[]> = {
  'the-innovation-landscape': ['patent trends', 'USPTO statistics', 'patent grants per year', 'innovation trends', 'US patent data', 'patent growth'],
  'the-technology-revolution': ['CPC classification', 'technology sectors', 'WIPO fields', 'software patents', 'biotech patents', 'emerging technologies', 'patent technology trends'],
  'who-innovates': ['top patent holders', 'IBM patents', 'Samsung patents', 'corporate patenting', 'university patents', 'patent assignees', 'patent concentration'],
  'the-inventors': ['patent inventors', 'team size innovation', 'gender gap patents', 'prolific inventors', 'inventor demographics', 'women in patenting'],
  'collaboration-networks': ['co-invention networks', 'patent collaboration', 'inventor migration', 'co-patenting', 'international collaboration', 'R&D networks'],
  'the-geography-of-innovation': ['Silicon Valley patents', 'patent geography', 'patent concentration regions', 'state patent activity', 'international patent origins', 'geographic concentration'],
  'the-knowledge-network': ['patent citations', 'knowledge flows', 'government funded patents', 'citation networks', 'technology spillovers', 'patent references'],
  'innovation-dynamics': ['grant lag', 'patent pendency', 'cross-domain innovation', 'international collaboration', 'innovation velocity', 'technology convergence'],
  'patent-quality': ['patent quality', 'forward citations', 'patent originality', 'patent generality', 'citation impact', 'patent value'],
  'patent-law': ['patent law', 'Bayh-Dole Act', 'America Invents Act', 'Alice Corp', 'patent reform', 'Supreme Court patent', 'patent policy', 'patent legislation'],
  'ai-patents': ['AI patents', 'artificial intelligence patents', 'machine learning patents', 'deep learning patents', 'generative AI', 'AI innovation'],
  'green-innovation': ['green patents', 'climate technology patents', 'renewable energy patents', 'carbon capture patents', 'clean technology', 'green AI', 'Y02 CPC codes', 'environmental innovation'],
  'the-language-of-innovation': ['topic modeling patents', 'patent text analysis', 'NLP patents', 'semantic analysis', 'patent abstracts', 'innovation themes', 'patent novelty', 'emerging technologies'],
  'company-profiles': ['company patent portfolio', 'corporate innovation strategy', 'patent portfolio analysis', 'technology pivot', 'citation network', 'talent flow', 'radar chart', 'company innovation dashboard', 'patent assignee analysis'],
};

/** Insight-oriented page titles (under 60 chars for SEO) */
const CHAPTER_SEO_TITLES: Record<string, string> = {
  'the-innovation-landscape': 'US Patent Grants Grew 5x Since 1976',
  'the-technology-revolution': 'Computing Rose From 10% to 55% of Patents',
  'who-innovates': 'Top 100 Firms Hold 30% of All US Patents',
  'the-inventors': 'Team Size Doubled While Gender Gap Persists',
  'collaboration-networks': 'Co-Invention Networks Span 6 Continents',
  'the-geography-of-innovation': 'Three States Produce 40% of US Patents',
  'the-knowledge-network': 'Patent Citations Reveal Knowledge Flows',
  'innovation-dynamics': 'Grant Lag Peaked at 3+ Years Before Declining',
  'patent-quality': 'Median Patent Citations Fell 40% Since 2000',
  'patent-law': '50 Years of Patent Law Shaped by 7 Key Events',
  'ai-patents': 'AI Patents Grew 10x in the Deep Learning Era',
  'green-innovation': 'Green Patents Tripled After Paris Agreement',
  'the-language-of-innovation': 'Computing Topics Now Dominate Patent Language',
  'company-profiles': 'How 100 Top Firms Innovate Differently',
};

/** Insight-oriented meta descriptions (under 160 chars) */
const CHAPTER_SEO_DESCRIPTIONS: Record<string, string> = {
  'the-innovation-landscape': 'Interactive analysis of 9.36M US patents (1976-2025). Patent grants grew from 70K to 350K annually. Explore trends by technology, assignee type, and era.',
  'the-technology-revolution': 'Computing and electronics rose from 10% to over 55% of all US patents. Explore technology sector evolution, S-curves, and half-life analysis across 9.36M patents.',
  'who-innovates': 'IBM, Samsung, and Canon lead US patenting. The top 100 firms hold 30% of all patents. Interactive analysis of corporate, university, and individual patenting patterns.',
  'the-inventors': 'Average patent team size doubled from 1.8 to 3.5 inventors. Women still represent only 15% of inventors. Explore demographics, career paths, and collaboration patterns.',
  'collaboration-networks': 'US-China co-invention doubled in the 2010s. Explore inventor migration, corporate talent flows, and international collaboration networks across 9.36M patents.',
  'the-geography-of-innovation': 'California, New York, and Texas produce 40% of US patents. Explore geographic concentration, regions of concentrated patent activity, and international assignee origins.',
  'the-knowledge-network': 'Patent citations map knowledge flows across technology domains. Government-funded patents receive 50% more citations. Explore citation networks and spillovers.',
  'innovation-dynamics': 'Patent grant lag peaked above 3 years before declining to 2 years. Explore pendency trends, cross-domain convergence, and innovation velocity across 50 years.',
  'patent-quality': 'Median forward citations fell 40% as patent volume increased rapidly. Explore patent quality metrics including originality, generality, and citation impact over 50 years.',
  'patent-law': 'From Bayh-Dole (1980) to Alice Corp. (2014), seven landmark events reshaped US patent law. Interactive timeline with data on how each event affected patenting.',
  'ai-patents': 'AI patent filings grew 10x during the deep learning era (2012-2025). Explore trends in machine learning, NLP, and computer vision patenting by company and country.',
  'green-innovation': 'Green patents tripled after the 2015 Paris Agreement. Explore renewable energy, carbon capture, and EV patent trends across 50 years of climate technology.',
  'the-language-of-innovation': 'NLP topic modeling of 9.36M patent abstracts reveals computing dominance. Explore how the language of innovation has evolved over 50 years.',
  'company-profiles': 'Interactive dashboards for 100 top patent filers. Compare portfolio strategies, technology pivots, citation impact, and innovation trajectories across companies.',
};

export function chapterMetadata(slug: string): Metadata {
  const ch = CHAPTERS.find((c) => c.slug === slug);
  if (!ch) return {};

  const title = CHAPTER_SEO_TITLES[slug] ?? `${ch.title} — Chapter ${ch.number}`;
  const description = CHAPTER_SEO_DESCRIPTIONS[slug] ?? `${ch.subtitle}. ${ch.description} Interactive data visualizations of US patent trends from 1976 to 2025.`;
  const keywords = CHAPTER_KEYWORDS[slug] ?? [];

  return {
    title,
    description,
    keywords: ['patents', 'innovation', 'USPTO', 'patent data', ...keywords],
    openGraph: {
      type: 'article',
      title: `${CHAPTER_SEO_TITLES[slug] ?? ch.title} | PatentWorld`,
      description,
      url: `${BASE_URL}/chapters/${ch.slug}/`,
      siteName: 'PatentWorld',
      images: [{
        url: `${BASE_URL}/og/${ch.slug}.png`,
        width: 1200,
        height: 630,
        alt: `${ch.title} — PatentWorld`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${CHAPTER_SEO_TITLES[slug] ?? ch.title} | PatentWorld`,
      description,
      images: [`${BASE_URL}/og/${ch.slug}.png`],
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
      headline: CHAPTER_SEO_TITLES[slug] ?? ch.title,
      description: CHAPTER_SEO_DESCRIPTIONS[slug] ?? `${ch.subtitle}. ${ch.description}`,
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
      dateModified: '2026-02-13',
      mainEntityOfPage: `${BASE_URL}/chapters/${ch.slug}/`,
      image: `${BASE_URL}/og/${ch.slug}.png`,
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
