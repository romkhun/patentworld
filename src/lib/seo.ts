import type { Metadata } from 'next';
import { CHAPTERS } from './constants';

const BASE_URL = 'https://patentworld.vercel.app';

const CHAPTER_KEYWORDS: Record<string, string[]> = {
  // Act 1: The System
  'patent-volume': ['patent trends', 'USPTO statistics', 'patent grants per year', 'innovation trends', 'US patent data', 'patent growth', 'design patents', 'patent claims'],
  'patent-process': ['grant pendency', 'patent examination', 'government funded patents', 'Bayh-Dole Act', 'NIH patents', 'federal research patents'],
  'technology-fields': ['CPC classification', 'technology sectors', 'WIPO fields', 'patent technology trends', 'CPC sections', 'electrical engineering patents'],
  'technology-dynamics': ['technology S-curve', 'patent growth rates', 'technology diversity', 'technology lifecycle', 'fast-growing technology classes'],
  'cross-field-convergence': ['technology convergence', 'cross-section patents', 'HHI concentration', 'citation half-life', 'examination friction', 'grant lag by sector'],
  'the-language-of-innovation': ['topic modeling patents', 'patent text analysis', 'NLP patents', 'semantic analysis', 'patent abstracts', 'innovation themes', 'patent novelty', 'emerging technologies'],
  'patent-law': ['patent law', 'Bayh-Dole Act', 'America Invents Act', 'Alice Corp', 'patent reform', 'Supreme Court patent', 'patent policy', 'patent legislation'],
  // Act 2: The Actors
  'assignee-landscape': ['corporate patents', 'foreign assignees', 'patent assignees', 'country patent filings', 'Japan patents', 'domestic vs foreign patents'],
  'firm-rankings': ['top patent holders', 'IBM patents', 'Samsung patents', 'GE patents', 'patent leader rankings', 'annual patent grants by company'],
  'market-concentration': ['patent concentration', 'design patents', 'firm survival', 'top 100 patent filers', 'market structure patents'],
  'firm-citation-quality': ['patent citations by firm', 'blockbuster patents', 'patent quality by company', 'citation impact firms', 'patent claims by firm'],
  'technology-portfolios': ['patent portfolio diversity', 'Shannon entropy patents', 'technology pivot', 'JSD divergence', 'corporate diversification'],
  'company-profiles': ['company patent portfolio', 'corporate innovation strategy', 'company innovation dashboard', 'patent portfolio analysis'],
  'knowledge-flows': ['citation networks', 'inter-firm citations', 'citation half-life', 'self-citation rate', 'corporate knowledge flows'],
  'exploration-strategy': ['exploration exploitation', 'new technology patents', 'technological exploration', 'exploitation strategy', 'firm innovation strategy'],
  'exploration-outcomes': ['ambidexterity patents', 'blockbuster rate', 'citation Gini', 'exploration quality premium', 'exploration decay'],
  'inventor-demographics': ['patent inventors', 'gender gap patents', 'women in patenting', 'first-time inventors', 'inventor demographics'],
  'inventor-productivity': ['team size innovation', 'prolific inventors', 'inventor citation impact', 'patent team collaboration'],
  'productivity-concentration': ['superstar inventors', 'inventor segments', 'productivity distribution', 'specialist inventors', 'patent output concentration'],
  'career-trajectories': ['inventor careers', 'inventor mobility', 'career survival', 'inventor attrition', 'inter-firm mobility'],
  // Act 3: The Structure
  'domestic-geography': ['Silicon Valley patents', 'patent geography', 'state patent activity', 'California patents', 'geographic concentration'],
  'cities-and-mobility': ['patent cities', 'San Jose patents', 'inventor migration', 'interstate mobility', 'innovation clusters'],
  'international-geography': ['international patents', 'cross-border inventors', 'Japan patent filings', 'global inventor mobility', 'international assignees'],
  'network-structure': ['co-invention networks', 'co-patenting', 'collaboration networks', 'inventor degree centrality'],
  'international-collaboration': ['international co-invention', 'US-China patents', 'cross-border collaboration', 'bilateral co-invention'],
  'corporate-strategy': ['talent flows', 'inventor migration firms', 'portfolio similarity', 'innovation strategy dimensions', 'corporate patent strategy'],
  // Act 4: The Mechanics
  'citation-dynamics': ['forward citations', 'backward citations', 'citation lag', 'citation trends', 'patent impact'],
  'patent-scope': ['patent claims', 'CPC breadth', 'multi-section patents', 'patent scope', 'cross-domain convergence'],
  'knowledge-flow-indicators': ['patent originality', 'patent generality', 'self-citation rate', 'knowledge flow patterns'],
  'innovation-tempo': ['innovation velocity', 'citation decay', 'examination friction', 'grant lag by sector', 'patenting speed'],
  'patent-characteristics': ['claims by technology', 'composite quality index', 'CPC section analysis', 'patent quality by field'],
  // Act 5: Deep Dives
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
  // Act 1
  'patent-volume': 'US Patent Grants Grew 5x Since 1976',
  'patent-process': 'Patent Pendency Peaked at 3.8 Years in 2010',
  'technology-fields': 'Computing Rose From 10% to 55% of Patents',
  'technology-dynamics': 'Digital Tech Classes Grew Over 1,000%',
  'cross-field-convergence': 'G-H Convergence Pair Tripled to 37.5%',
  'the-language-of-innovation': 'Computing Topics Now Dominate Patent Language',
  'patent-law': '50 Years of Patent Law Shaped by 7 Key Events',
  // Act 2
  'assignee-landscape': 'Foreign Assignees Surpassed US Filers in 2007',
  'firm-rankings': 'IBM Leads with 161,888 Cumulative Grants',
  'market-concentration': 'Top 100 Firms Hold 32-39% of Patents',
  'firm-citation-quality': 'Amazon Leads with 6.7% Blockbuster Rate',
  'technology-portfolios': 'Firm Portfolio Diversity Rose Across Decades',
  'company-profiles': 'Interactive Company Innovation Profiles',
  'knowledge-flows': 'Citation Half-Lives Range 6.3 to 18.6 Years',
  'exploration-strategy': '11 of 20 Major Filers Keep Exploration Below 5%',
  'exploration-outcomes': 'Balanced Firms Average 2.51% Blockbuster Rate',
  'inventor-demographics': 'Female Inventor Share Rose from 2.8% to 14.9%',
  'inventor-productivity': 'Team Size Grew from 1.7 to Over 3 Inventors',
  'productivity-concentration': 'Top 5% Inventors Produce 60% of Output',
  'career-trajectories': 'Half of Inventors Exit Within Five Years',
  // Act 3
  'domestic-geography': 'California Holds 23.6% of All US Patents',
  'cities-and-mobility': 'San Jose, San Diego, Austin Lead US Cities',
  'international-geography': 'Japan Leads Foreign Filings with 1.45M Patents',
  'network-structure': '618 Firms Form Industry Co-Patenting Clusters',
  'international-collaboration': 'US-China Co-Invention Surpassed 2% by 2025',
  'corporate-strategy': '143,524 Inventor Moves Among 50 Top Firms',
  // Act 4
  'citation-dynamics': 'Citation Lag Grew from 2.9 to 16.2 Years',
  'patent-scope': 'Multi-Section Patents Rose from 21% to 41%',
  'knowledge-flow-indicators': 'Originality Rose While Generality Declined',
  'innovation-tempo': 'Physics Patents Have Shortest Citation Half-Lives',
  'patent-characteristics': 'Chemistry Leads in Composite Quality Score',
  // Act 5
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
  // Act 1
  'patent-volume': 'US patent grants grew from 70K to 350K annually. Design patents fluctuated between 6-14% of grants. Average claims doubled from 9.4 to 18.9.',
  'patent-process': 'Grant pendency peaked at 3.8 years in 2010. Government-funded patents rose after Bayh-Dole, led by HHS/NIH with 55,587 patents.',
  'technology-fields': 'Electrical engineering grew 15x from 10,404 to 150,702 patents. CPC sections G and H gained 30 percentage points of share over five decades.',
  'technology-dynamics': 'The fastest digital tech classes grew over 1,000% while declining classes contracted 84%. Technology diversity declined before stabilizing at 0.789.',
  'cross-field-convergence': 'The G-H convergence pair rose from 12.5% to 37.5% of cross-section patents. Patent markets remain unconcentrated across all CPC sections.',
  'the-language-of-innovation': 'NLP topic modeling of 9.36M patent abstracts reveals computing dominance. Explore how the language of innovation has evolved over 50 years.',
  'patent-law': 'From Bayh-Dole (1980) to Alice Corp. (2014), seven landmark events reshaped US patent law. Interactive timeline with data on how each event affected patenting.',
  // Act 2
  'assignee-landscape': 'Corporate assignees grew from 94% to 99% of grants. Foreign assignees surpassed US-based filers in 2007. Japan accounts for 1.4M US patents.',
  'firm-rankings': 'IBM leads with 161,888 cumulative grants. GE held rank 1 for six consecutive years (1980-1985). Samsung peaked at 9,716 annual grants in 2024.',
  'market-concentration': 'The top 100 organizations hold 32-39% of corporate patents. Samsung leads design patents. Only 9 of 50 top filers survived all five decades.',
  'firm-citation-quality': 'Microsoft leads in average citations at 30.7. 35 of 48 top firms saw median forward citations decline. Amazon holds the highest blockbuster rate.',
  'technology-portfolios': 'Portfolio diversity rose across leading firms. Shannon entropy and JSD scores reveal technology pivot patterns among major patent assignees.',
  'company-profiles': 'Interactive profiles showing annual output, technology composition, citation impact, team dynamics, and CPC breadth for individual companies.',
  'knowledge-flows': 'Citation flows among top 30 filers reveal industry clusters. Citation half-lives range from 6.3 to 18.6 years. Self-citation rates vary widely.',
  'exploration-strategy': '11 of 20 major filers keep exploration below 5%. New-subclass exploration scores decay from 1.0 to 0.087 within five years of entry.',
  'exploration-outcomes': 'Balanced firms average a 2.51% blockbuster rate, 2.3x above median. Within-firm citation Gini coefficients rose from 0.5 to above 0.8.',
  'inventor-demographics': 'Female inventor share rose from 2.8% to 14.9%. Annual first-time inventor entries peaked at 140,490 in 2019. Newcomer share fell from 71% to 26%.',
  'inventor-productivity': 'Average team size grew from 1.7 to over 3 inventors. The most prolific inventor holds 6,709 patents. Citation impact ranges widely among top inventors.',
  'productivity-concentration': '12% of inventors produce 61% of total output. The top 5% grew from 26% to 60% of annual output. Specialist inventors rose from 20% to 48%.',
  'career-trajectories': 'Only 37-51% of inventors survive past five career years. Productivity rises from 1.4 to 2.1 before plateauing. Mobility peaked at 60% in the 2000s.',
  // Act 3
  'domestic-geography': 'California accounts for 23.6% of all US patent grants, more than the bottom 30 states combined. States exhibit distinctive technology profiles.',
  'cities-and-mobility': 'San Jose, San Diego, and Austin lead all US cities in patenting. California accounts for 54.9% of all interstate inventor migration.',
  'international-geography': 'International inventor mobility rose from 1.3% to 5.1%. Japan leads foreign filings with 1.45M patents. US involved in 77.6% of global inventor flows.',
  'network-structure': '618 organizations form industry clusters in co-patenting. 632 prolific inventors form 1,236 ties. Average inventor degree rose 2.5x since the 1980s.',
  'international-collaboration': 'International co-invention rose from 2% to 10%. US-China co-invention grew from 77 patents in 2000 to 2,749 in 2024, surpassing 2% by 2025.',
  'corporate-strategy': '143,524 inventor moves among 50 major firms. 248 companies cluster into 8 industries by portfolio similarity. Innovation strategies diverge across 8 dimensions.',
  // Act 4
  'citation-dynamics': 'Forward citations rose from 2.5 to 6.4. Backward citations rose from 4.9 to 21.3. Citation lag grew from 2.9 years in 1980 to 16.2 years in 2025.',
  'patent-scope': 'Median claims doubled from 8 to 18. Patent scope grew from 1.8 to 2.5 CPC subclasses. Multi-section patents rose from 21% to 41% of all grants.',
  'knowledge-flow-indicators': 'Originality rose from 0.09 to 0.25 while generality fell from 0.28 to 0.15. Self-citation rates declined from 35% to 10.5% by 2010.',
  'innovation-tempo': 'Physics and electricity patents have the shortest citation half-lives at 10.7 and 11.2 years. Patenting growth is highly correlated across five WIPO sectors.',
  'patent-characteristics': 'Claims increased across all areas with physics leading at 19. Chemistry has the highest composite quality. Instruments peaked at 19.8 average claims.',
  // Act 5
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
  'blockchain': 'Blockchain patents cover distributed ledger and cryptocurrency technology. Explore one of the most hyped domains in the patent system.',
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
