import type { Metadata } from 'next';
import { CHAPTERS } from './constants';

const BASE_URL = 'https://patentworld.vercel.app';

const CHAPTER_KEYWORDS: Record<string, string[]> = {
  // ACT 1: The System
  'system-patent-count': ['patent trends', 'USPTO statistics', 'patent grants per year', 'innovation trends', 'US patent data', 'patent growth', 'grant pendency'],
  'system-patent-quality': ['patent claims', 'forward citations', 'backward citations', 'patent scope', 'originality', 'generality', 'self-citation', 'sleeping beauty patents', 'citation lag'],
  'system-patent-fields': ['CPC classification', 'technology sectors', 'WIPO fields', 'patent technology trends', 'CPC sections', 'technology dynamics', 'technology lifecycle', 'HHI concentration'],
  'system-convergence': ['technology convergence', 'cross-section patents', 'multi-section patents', 'cross-domain convergence', 'CPC breadth'],
  'system-language': ['topic modeling patents', 'patent text analysis', 'NLP patents', 'semantic analysis', 'patent abstracts', 'innovation themes', 'patent novelty', 'emerging technologies'],
  'system-patent-law': ['patent law', 'Bayh-Dole Act', 'America Invents Act', 'Alice Corp', 'patent reform', 'Supreme Court patent', 'patent policy', 'patent legislation'],
  'system-public-investment': ['government funded patents', 'Bayh-Dole Act', 'NIH patents', 'federal research patents', 'public investment', 'government R&D'],
  // ACT 2: The Organizations
  'org-composition': ['corporate patents', 'foreign assignees', 'patent assignees', 'country patent filings', 'Japan patents', 'domestic vs foreign patents'],
  'org-patent-count': ['top patent holders', 'IBM patents', 'Samsung patents', 'GE patents', 'patent leader rankings', 'annual patent grants by company', 'design patents', 'firm survival'],
  'org-patent-quality': ['patent citations by firm', 'blockbuster patents', 'patent quality by company', 'citation impact firms', 'patent claims by firm', 'citation half-life', 'sleeping beauty patents'],
  'org-patent-portfolio': ['patent portfolio diversity', 'Shannon entropy patents', 'technology pivot', 'JSD divergence', 'corporate diversification', 'competitive proximity'],
  'org-company-profiles': ['company patent portfolio', 'corporate innovation strategy', 'company innovation dashboard', 'patent portfolio analysis'],
  // ACT 3: The Inventors
  'inv-top-inventors': ['superstar inventors', 'prolific inventors', 'inventor segments', 'productivity distribution', 'patent output concentration', 'inventor citation impact'],
  'inv-generalist-specialist': ['specialist inventors', 'generalist inventors', 'technology specialization', 'inventor diversity', 'CPC breadth inventors'],
  'inv-serial-new': ['serial inventors', 'first-time inventors', 'inventor careers', 'career survival', 'inventor attrition', 'comeback inventors', 'new entrants'],
  'inv-gender': ['gender gap patents', 'women in patenting', 'female inventors', 'inventor demographics', 'gender innovation gap'],
  'inv-team-size': ['team size innovation', 'solo inventors', 'collaborative turn', 'patent team collaboration', 'team size quality'],
  // ACT 4: The Geography
  'geo-domestic': ['Silicon Valley patents', 'patent geography', 'state patent activity', 'California patents', 'geographic concentration', 'patent cities', 'San Jose patents'],
  'geo-international': ['international patents', 'cross-border inventors', 'Japan patent filings', 'global inventor mobility', 'international assignees', 'quality by country'],
  // ACT 5: The Mechanics
  'mech-organizations': ['exploration exploitation', 'new technology patents', 'technological exploration', 'citation networks', 'inter-firm citations', 'corporate knowledge flows'],
  'mech-inventors': ['co-invention networks', 'co-patenting', 'collaboration networks', 'inventor mobility', 'talent flows', 'bridge inventors', 'inventor migration'],
  'mech-geography': ['international co-invention', 'US-China patents', 'cross-border collaboration', 'bilateral co-invention', 'innovation diffusion'],
  // ACT 6: Deep Dives
  'ai-patents': ['AI patents', 'artificial intelligence patents', 'machine learning patents', 'deep learning patents', 'generative AI', 'AI innovation'],
  'green-innovation': ['green patents', 'climate technology patents', 'renewable energy patents', 'carbon capture patents', 'clean technology', 'green AI', 'Y02 CPC codes', 'environmental innovation'],
  'semiconductors': ['semiconductor patents', 'chip patents', 'integrated circuit patents', 'TSMC patents', 'Intel patents', 'Samsung semiconductor', 'H01L CPC'],
  'quantum-computing': ['quantum computing patents', 'quantum algorithms', 'quantum hardware', 'superconducting qubits', 'IBM quantum', 'Google quantum'],
  'cybersecurity': ['cybersecurity patents', 'cryptography patents', 'network security patents', 'authentication patents', 'data protection patents'],
  'biotechnology': ['biotech patents', 'gene editing patents', 'CRISPR patents', 'recombinant DNA', 'enzyme engineering', 'nucleic acid detection'],
  'digital-health': ['digital health patents', 'medical device patents', 'patient monitoring', 'health informatics', 'surgical robotics', 'telemedicine'],
  'agricultural-technology': ['agricultural technology patents', 'precision agriculture', 'plant breeding patents', 'farm technology', 'agtech patents'],
  'autonomous-vehicles': ['autonomous vehicle patents', 'self-driving car patents', 'ADAS patents', 'lidar patents', 'path planning patents', 'Waymo patents'],
  'space-technology': ['space technology patents', 'satellite patents', 'spacecraft patents', 'SpaceX patents', 'rocket propulsion patents'],
  '3d-printing': ['3D printing patents', 'additive manufacturing patents', 'metal 3D printing', 'polymer 3D printing', 'Stratasys patents', '3D Systems patents'],
  'blockchain': ['blockchain patents', 'cryptocurrency patents', 'distributed ledger patents', 'smart contract patents', 'digital currency patents'],
};

/** Insight-oriented page titles (under 60 chars for SEO) */
const CHAPTER_SEO_TITLES: Record<string, string> = {
  // ACT 1
  'system-patent-count': 'US Patent Grants Grew 5x Since 1976',
  'system-patent-quality': 'Patent Claims Doubled; Citations Rose to 6.4',
  'system-patent-fields': 'CPC Sections G and H Rose From 27% to 57%',
  'system-convergence': 'Multi-Section Patents Rose from 21% to 41%',
  'system-language': 'Computing Topics Now Dominate Patent Language',
  'system-patent-law': '50 Years of Patent Law Shaped by 7 Key Events',
  'system-public-investment': 'NIH Leads Government Patents with 55,587',
  // ACT 2
  'org-composition': 'Foreign Assignees Surpassed US Filers in 2007',
  'org-patent-count': 'IBM Leads with 161,888 Cumulative Grants',
  'org-patent-quality': 'Amazon Leads with 6.7% Blockbuster Rate',
  'org-patent-portfolio': 'Firm Portfolio Diversity Rose Across Decades',
  'org-company-profiles': 'Interactive Company Innovation Profiles',
  // ACT 3
  'inv-top-inventors': 'Top 5% Inventors Produce 60% of Output',
  'inv-generalist-specialist': 'Specialist Inventors Rose from 20% to 48%',
  'inv-serial-new': 'Half of Inventors Exit Within Five Years',
  'inv-gender': 'Female Inventor Share Rose from 2.8% to 14.9%',
  'inv-team-size': 'Team Size Grew from 1.7 to 3.2 Inventors',
  // ACT 4
  'geo-domestic': 'California Holds 23.6% of All US Patents',
  'geo-international': 'Japan Leads Foreign Filings with 1.45M Patents',
  // ACT 5
  'mech-organizations': '11 of 20 Major Filers Keep Exploration Below 5%',
  'mech-inventors': '143,524 Inventor Moves Among 50 Top Firms',
  'mech-geography': 'US-China Co-Invention Surpassed 2% by 2025',
  // ACT 6
  'ai-patents': 'AI Patents Grew 10x in the Deep Learning Era',
  'green-innovation': 'Green Patents Tripled After Paris Agreement',
  'semiconductors': 'Semiconductor Patents Drive the Silicon Age',
  'quantum-computing': 'Quantum Computing Patents Surged After 2015',
  'cybersecurity': 'Cybersecurity Patents Grew With Digital Threats',
  'biotechnology': 'Biotech Patents Transformed by Gene Editing',
  'digital-health': 'Digital Health Patents Bridge Medicine and Tech',
  'agricultural-technology': 'AgTech Patents Modernize Global Farming',
  'autonomous-vehicles': 'AV Patents Accelerated in the 2010s',
  'space-technology': 'Space Patents Reflect Commercial Frontier',
  '3d-printing': '3D Printing Patents Grew 20x Since 2000',
  'blockchain': 'Blockchain Patents Track a Hype Cycle',
};

/** Insight-oriented meta descriptions (under 160 chars) */
const CHAPTER_SEO_DESCRIPTIONS: Record<string, string> = {
  // ACT 1
  'system-patent-count': 'US patent grants grew from 70K to 374K annually. Grant pendency peaked at 3.8 years in 2010 before moderating to current levels.',
  'system-patent-quality': 'Average claims doubled from 9.4 to 18.9. Forward citations peaked at 6.4. Originality rose from 0.09 to 0.25 while generality fell from 0.28 to 0.15.',
  'system-patent-fields': 'CPC sections G and H gained 30 percentage points of share. Fastest digital classes grew 1,000%. Patent markets remain unconcentrated across all CPC sections.',
  'system-convergence': 'Multi-section patents rose from 21% to 41% of all grants. The G-H convergence pair rose from 12.5% to 37.5% of cross-section patents.',
  'system-language': 'NLP topic modeling of 9.36M patent abstracts reveals computing dominance. Explore how the language of innovation has evolved over 50 years.',
  'system-patent-law': 'From Bayh-Dole (1980) to Alice Corp. (2014), seven landmark events reshaped US patent law. Interactive timeline with data on how each event affected patenting.',
  'system-public-investment': 'Government-funded patents rose from 1,294 in 1980 to 8,359 in 2019 after the Bayh-Dole Act. HHS/NIH leads with 55,587 government-funded patents.',
  // ACT 2
  'org-composition': 'Corporate assignees grew from 94% to 99% of grants. Foreign assignees surpassed US-based filers in 2007. Japan accounts for 1.4M US patents.',
  'org-patent-count': 'IBM leads with 161,888 cumulative grants. Samsung peaked at 9,716 in 2024. Top 100 organizations hold 32-39% of corporate patents.',
  'org-patent-quality': 'Amazon leads with 6.7% blockbuster rate. Microsoft leads in average citations at 30.7. Citation half-lives range from 6.3 to 14.3 years across firms.',
  'org-patent-portfolio': 'Portfolio diversity rose across leading firms. 248 companies cluster into 8 industries by portfolio similarity. JSD identifies strategic portfolio shifts.',
  'org-company-profiles': 'Interactive profiles combining annual output, technology composition, citation impact, innovation strategy, and portfolio analysis for individual companies.',
  // ACT 3
  'inv-top-inventors': '12% of inventors produce 61% of total output. The top 5% grew from 26% to 60% of annual output. The most prolific inventor holds 6,709 patents.',
  'inv-generalist-specialist': 'Specialist inventors rose from 20% to 48% of the inventor workforce. Quality metrics differ systematically between generalists and specialists.',
  'inv-serial-new': 'First-time inventor entries peaked at 140,490 in 2019. Only 37-51% survive past five years. Productivity rises from 1.4 to 2.1 before plateauing.',
  'inv-gender': 'Female inventor share rose from 2.8% to 14.9%. Quality metrics reveal systematic gender differences across claims, citations, and scope.',
  'inv-team-size': 'Average team size grew from 1.7 to 3.2 inventors. Quality metrics differ systematically across solo inventors, small teams, and large teams.',
  // ACT 4
  'geo-domestic': 'California accounts for 23.6% of all US patents. San Jose, San Diego, and Austin lead all US cities. Quality metrics vary across states and cities.',
  'geo-international': 'International inventor mobility rose from 1.3% to 5.1%. Japan leads foreign filings with 1.45M patents. Quality differs systematically across countries.',
  // ACT 5
  'mech-organizations': '11 of 20 major filers keep exploration below 5%. Exploration scores decay from 1.0 to 0.087. Corporate citation flows reveal industry clusters.',
  'mech-inventors': '632 prolific inventors form 1,236 co-invention ties. 143,524 inventor movements among 50 firms. California holds 54.9% of interstate migration.',
  'mech-geography': 'International co-invention rose from 1.0% to 10.0%. US-China co-invention grew from 77 patents in 2000 to 2,749 in 2024.',
  // ACT 6
  'ai-patents': 'AI patent filings grew 10x during the deep learning era (2012-2025). Explore trends in machine learning, NLP, and computer vision patenting by company and country.',
  'green-innovation': 'Green patents tripled after the 2015 Paris Agreement. Explore renewable energy, carbon capture, and EV patent trends across 50 years of climate technology.',
  'semiconductors': 'Semiconductor patents span IC design, packaging, manufacturing, and optoelectronics. Explore how TSMC, Samsung, and Intel compete in the silicon age.',
  'quantum-computing': 'Quantum computing patents surged after 2015, covering algorithms, hardware, error correction. Explore IBM, Google, and emerging players in quantum innovation.',
  'cybersecurity': 'Cybersecurity patents span cryptography, authentication, and network security. Explore how digital threats drive patenting in data protection and system security.',
  'biotechnology': 'Biotechnology patents cover gene editing, CRISPR, enzyme engineering, and nucleic acid detection. Explore 50 years of molecular biology innovation.',
  'digital-health': 'Digital health patents bridge medicine and computing, from patient monitoring to surgical robotics. Explore health informatics and medical device innovation.',
  'agricultural-technology': 'Agricultural technology patents span precision agriculture, plant breeding, and soil science. Explore how innovation is modernizing global food production.',
  'autonomous-vehicles': 'Autonomous vehicle patents cover driving systems, navigation, and scene understanding. Explore the AV patent race among automotive and technology firms.',
  'space-technology': 'Space technology patents span spacecraft design, propulsion, and satellite communications. Explore the patent landscape of the new commercial space era.',
  '3d-printing': 'Additive manufacturing patents grew 20x since 2000, spanning polymer and metal 3D printing. Explore equipment, materials, and application patents.',
  'blockchain': 'Blockchain patents cover distributed ledger and cryptocurrency technology. Filings peaked in 2022, the only advanced domain to reverse course.',
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
      '@type': 'ScholarlyArticle',
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
      dateModified: '2026-02-14',
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
