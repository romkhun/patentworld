export const SITE_NAME = 'PatentWorld';
export const SITE_DESCRIPTION = 'An interactive exploration of 9.36 million US patents granted from 1976 to 2025, covering technology classifications, inventor demographics, geographic distribution, citation networks, and patent quality indicators.';

export interface ChapterMeta {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  relatedChapters?: number[];
}

export const CHAPTERS: ChapterMeta[] = [
  // ── Act 1: The System ──
  {
    number: 1,
    slug: 'patent-volume',
    title: 'Patent Volume & Composition',
    subtitle: 'Growth, types, and complexity of US patent grants',
    description: 'Annual US patent grants increased five-fold from approximately 70,000 in 1976 to over 350,000 in 2024. Design patent share fluctuated between 6% and 14%, and average claims per patent doubled from 9.4 to 18.9.',
  },
  {
    number: 2,
    slug: 'patent-process',
    title: 'Patent Process & Public Investment',
    subtitle: 'Grant pendency and the role of government funding',
    description: 'Grant pendency peaked at 3.8 years in 2010 before moderating. Government-funded patents rose substantially after the Bayh-Dole Act, with HHS/NIH leading at 55,587 patents.',
  },
  {
    number: 3,
    slug: 'technology-fields',
    title: 'Technology Fields',
    subtitle: 'How CPC sections and WIPO sectors compose the patent landscape',
    description: 'Electrical engineering grew nearly 15-fold from 10,404 patents in 1976 to 150,702 in 2024. CPC sections G and H gained roughly 30 percentage points of share over five decades.',
  },
  {
    number: 4,
    slug: 'technology-dynamics',
    title: 'Technology Dynamics',
    subtitle: 'Growth, decline, and lifecycle maturity of technology classes',
    description: 'The fastest-growing digital technology classes grew by over 1,000% while declining classes contracted by nearly 84%. Technology diversity declined from 0.848 in 1984 to 0.777 in 2009 before stabilizing.',
  },
  {
    number: 5,
    slug: 'cross-field-convergence',
    title: 'Cross-Field Convergence',
    subtitle: 'Technology overlap, concentration, and field-specific metrics',
    description: 'The G-H convergence pair rose from 12.5% to 37.5% of cross-section patents. Patent markets remain unconcentrated across all CPC sections, with HHI values well below the 1,500 threshold.',
  },
  {
    number: 6,
    slug: 'the-language-of-innovation',
    title: 'The Language of Innovation',
    subtitle: 'Semantic analysis of 8.45 million patent abstracts',
    description: 'NMF topic modeling reveals that computing and semiconductor topics grew from 12% to over 33% of all patents, while patent novelty has risen steadily since the 1990s.',
  },
  {
    number: 7,
    slug: 'patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'Legislation and jurisprudence shaping the patent system',
    description: 'Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021), each linked to empirical research on their effects.',
  },
  // ── Act 2: The Actors ──
  {
    number: 8,
    slug: 'assignee-landscape',
    title: 'The Assignee Landscape',
    subtitle: 'Corporate, foreign, and country-level composition of patent assignees',
    description: 'Corporate assignees grew from 94% to 99% of US patent grants. Foreign assignees surpassed US-based assignees around 2007. Japan accounts for 1.4 million US patents since 1976.',
  },
  {
    number: 9,
    slug: 'firm-rankings',
    title: 'Firm Grant Rankings',
    subtitle: 'Patent output rankings and trajectories of leading organizations',
    description: 'IBM leads with 161,888 cumulative grants. GE held rank 1 for six consecutive years in the early 1980s. Samsung peaked at 9,716 annual grants in 2024.',
  },
  {
    number: 10,
    slug: 'market-concentration',
    title: 'Market Concentration',
    subtitle: 'Patenting concentration, design patents, and firm survival',
    description: 'The top 100 organizations hold 32-39% of corporate patents. Samsung leads design patents with 13,094. Only 9 of 50 top filers survived all five decades.',
  },
  {
    number: 11,
    slug: 'firm-citation-quality',
    title: 'Firm Citation Quality',
    subtitle: 'Citation impact, blockbuster patents, and claim patterns across top filers',
    description: 'Microsoft leads in average citations at 30.7. Among 48 top firms, 35 saw median forward citations decline. Amazon holds the highest blockbuster rate at 6.7%.',
  },
  {
    number: 12,
    slug: 'technology-portfolios',
    title: 'Technology Portfolios',
    subtitle: 'Diversification, entropy, and portfolio transitions of major assignees',
    description: 'Portfolio diversity rose across leading firms, with Microsoft and Samsung showing the greatest diversification. JSD scores identify major strategic portfolio shifts.',
  },
  {
    number: 13,
    slug: 'company-profiles',
    title: 'Company Profiles',
    subtitle: 'Individual company patent histories, portfolios, and quality trends',
    description: 'Interactive profiles showing annual output, technology composition, citation impact, team dynamics, and CPC breadth for individual companies.',
  },
  {
    number: 14,
    slug: 'knowledge-flows',
    title: 'Knowledge Flows',
    subtitle: 'Inter-firm citation networks, half-lives, and self-citation dynamics',
    description: 'Corporate citation flows among top 30 filers reveal industry clusters. Citation half-lives range from 6.3 years (Huawei) to 18.6 years. Self-citation patterns vary widely.',
  },
  {
    number: 15,
    slug: 'exploration-strategy',
    title: 'Exploration & Exploitation',
    subtitle: 'Technological exploration scores and exploitation strategies of top filers',
    description: '11 of 20 major filers keep exploration below 5% with a median share of 2.9%. New-subclass exploration scores decay from 1.0 to 0.087 within five years of entry.',
  },
  {
    number: 16,
    slug: 'exploration-outcomes',
    title: 'Exploration Outcomes',
    subtitle: 'Exploration quality premiums, score decay, and ambidexterity effects',
    description: 'Balanced firms average a 2.51% blockbuster rate, 2.3 times above the overall median. Within-firm citation Gini coefficients rose from 0.5 to above 0.8 for most large filers.',
  },
  {
    number: 17,
    slug: 'inventor-demographics',
    title: 'Inventor Demographics',
    subtitle: 'Gender composition and new-entrant dynamics of the inventor workforce',
    description: 'Female inventor share rose from 2.8% in 1976 to 14.9% in 2025. Annual first-time inventor entries peaked at 140,490 in 2019 before moderating.',
  },
  {
    number: 18,
    slug: 'inventor-productivity',
    title: 'Inventor Productivity',
    subtitle: 'Team size, prolific inventors, and citation impact',
    description: 'Average patent team size increased from 1.7 to over 3 inventors. The most prolific inventor holds 6,709 patents. Citation impact ranges widely among top inventors.',
  },
  {
    number: 19,
    slug: 'productivity-concentration',
    title: 'Productivity Concentration',
    subtitle: 'Distribution of inventive output across inventor segments',
    description: '12% of inventors produce 61% of total patent output. The top 5% of inventors grew from 26% to 60% of annual output. Specialist inventors rose from 20% to 48%.',
  },
  {
    number: 20,
    slug: 'career-trajectories',
    title: 'Career Trajectories',
    subtitle: 'Career survival, productivity trajectories, and inter-firm mobility',
    description: 'Only 37-51% of inventors survive past five career years. Productivity rises from 1.4 to 2.1 patents per year before plateauing. Mobility rates peaked at 60% in the 2000s.',
  },
  // ── Act 3: The Structure ──
  {
    number: 21,
    slug: 'domestic-geography',
    title: 'Domestic Geography',
    subtitle: 'State-level patent concentration and technology specialization',
    description: 'California accounts for 23.6% of all US patent grants, producing more patents than the bottom 30 states combined. States exhibit distinctive technology profiles across CPC sections.',
  },
  {
    number: 22,
    slug: 'cities-and-mobility',
    title: 'Cities & Mobility',
    subtitle: 'City-level innovation clusters and inventor migration patterns',
    description: 'San Jose, San Diego, and Austin lead all US cities in patenting. California accounts for 54.9% of all interstate inventor migration.',
  },
  {
    number: 23,
    slug: 'international-geography',
    title: 'International Geography',
    subtitle: 'Cross-border mobility and international patent filing trends',
    description: 'International inventor mobility rose from 1.3% to 5.1%. Japan leads foreign filings with 1.45 million US patents. The US is involved in 77.6% of all international inventor migration.',
  },
  {
    number: 24,
    slug: 'network-structure',
    title: 'Network Structure',
    subtitle: 'Co-patenting and co-invention network topology',
    description: '618 organizations form distinct industry clusters in co-patenting. 632 prolific inventors form 1,236 co-invention ties. Average inventor degree rose 2.5 times from the 1980s to the 2020s.',
  },
  {
    number: 25,
    slug: 'international-collaboration',
    title: 'International Collaboration',
    subtitle: 'Cross-border co-invention rates and bilateral dynamics',
    description: 'International co-invention increased from approximately 2% in the 1980s to reaching 10%. US-China co-invention rates surpassed 2% by 2025, growing from 77 patents in 2000 to 2,749 in 2024.',
  },
  {
    number: 26,
    slug: 'corporate-strategy',
    title: 'Corporate Strategy',
    subtitle: 'Talent flows, portfolio similarity, and innovation strategy dimensions',
    description: '143,524 inventor movements flow among 50 major organizations. 248 companies cluster into 8 industries by patent portfolio similarity. Innovation strategies diverge across eight dimensions.',
  },
  // ── Act 4: The Mechanics ──
  {
    number: 27,
    slug: 'citation-dynamics',
    title: 'Citation Dynamics',
    subtitle: 'Forward and backward citation trends and citation lag',
    description: 'Average forward citations rose from 2.5 to a peak of 6.4 in 2019. Backward citations rose from 4.9 to 21.3. Citation lag grew from 2.9 years in 1980 to 16.2 years in 2025.',
  },
  {
    number: 28,
    slug: 'patent-scope',
    title: 'Patent Scope',
    subtitle: 'Claim counts, CPC breadth, and cross-domain convergence',
    description: 'Median claims doubled from 8 to 18 between 1976 and 2025. Average patent scope grew from 1.8 to nearly 2.5 CPC subclasses. Multi-section patents rose from 21% to 41% of all grants.',
  },
  {
    number: 29,
    slug: 'knowledge-flow-indicators',
    title: 'Knowledge Flow Indicators',
    subtitle: 'Originality, generality, and self-citation rate patterns',
    description: 'Originality rose from 0.09 to 0.25 while generality fell from 0.28 to 0.15, indicating diverging knowledge flows. Average self-citation rates declined from 35% to 10.5% by 2010.',
  },
  {
    number: 30,
    slug: 'innovation-tempo',
    title: 'Innovation Tempo',
    subtitle: 'Citation decay, patenting velocity, and examination friction across fields',
    description: 'Physics and electricity patents exhibit the shortest citation half-lives at 10.7 and 11.2 years. Patenting growth rates are highly correlated across five WIPO sectors.',
  },
  {
    number: 31,
    slug: 'patent-characteristics',
    title: 'Patent Characteristics',
    subtitle: 'Claim complexity and composite quality across technology areas',
    description: 'Claims increased across all areas with physics leading at 19 median claims. Chemistry exhibits the highest composite quality score. Instruments peaked at 19.8 average claims.',
  },
  // ── Act 5: Deep Dives ──
  {
    number: 32,
    slug: '3d-printing',
    title: '3D Printing & Additive Manufacturing',
    subtitle: 'Layer-by-layer revolution in manufacturing',
    description: 'Additive manufacturing patents span polymer and metal 3D printing, equipment design, materials science, and product applications across industries.',
  },
  {
    number: 33,
    slug: 'agricultural-technology',
    title: 'Agricultural Technology',
    subtitle: 'Innovation feeding a growing world',
    description: 'Agricultural technology patents cover soil working, planting, horticulture, plant breeding, and precision agriculture, reflecting the modernization of farming.',
  },
  {
    number: 34,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'AI patenting from expert systems to deep learning',
    description: 'AI patent filings grew exponentially after 2012, with neural networks and deep learning displacing knowledge-based systems as the dominant methodology.',
  },
  {
    number: 35,
    slug: 'autonomous-vehicles',
    title: 'Autonomous Vehicles & ADAS',
    subtitle: 'The race toward self-driving transportation',
    description: 'Autonomous vehicle patents span driving systems, navigation, path planning, and scene understanding, with automotive and technology firms competing intensely.',
  },
  {
    number: 36,
    slug: 'biotechnology',
    title: 'Biotechnology & Gene Editing',
    subtitle: 'Engineering life at the molecular level',
    description: 'Biotechnology patents cover gene editing, recombinant DNA, enzyme engineering, and nucleic acid detection, with CRISPR driving a new wave of activity.',
  },
  {
    number: 37,
    slug: 'blockchain',
    title: 'Blockchain & Decentralized Systems',
    subtitle: 'Distributed trust in the digital economy',
    description: 'Blockchain patents cover distributed ledger technology, consensus mechanisms, and cryptocurrency, representing one of the most hyped emerging domains.',
  },
  {
    number: 38,
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Defending digital infrastructure through innovation',
    description: 'Cybersecurity patents span cryptography, authentication, network security, and data protection, with growth accelerating alongside increasing digital threats.',
  },
  {
    number: 39,
    slug: 'digital-health',
    title: 'Digital Health & Medical Devices',
    subtitle: 'Technology transforming healthcare delivery',
    description: 'Digital health patents encompass patient monitoring, health informatics, clinical decision support, and surgical robotics, bridging medicine and computing.',
  },
  {
    number: 40,
    slug: 'green-innovation',
    title: 'Green Innovation',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Battery, storage, and EV patents surpassed renewable energy as the dominant green sub-category, with South Korea emerging as a leading filer.',
  },
  {
    number: 41,
    slug: 'quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'From theoretical foundations to practical hardware',
    description: 'Quantum computing patents have grown rapidly since 2015, encompassing algorithms, physical realizations, error correction, and superconducting devices.',
  },
  {
    number: 42,
    slug: 'semiconductors',
    title: 'Semiconductors',
    subtitle: 'The silicon foundation of modern technology',
    description: 'Semiconductor patents span manufacturing processes, integrated circuit design, packaging, and optoelectronics, with concentration among East Asian and US firms.',
  },
  {
    number: 43,
    slug: 'space-technology',
    title: 'Space Technology',
    subtitle: 'Patenting the final frontier',
    description: 'Space technology patents cover spacecraft design, propulsion systems, satellite communications, and re-entry systems, reflecting renewed commercial interest in space.',
  },
];

export interface SubGroup {
  title: string;
  chapters: number[];
}

export interface ActGrouping {
  act: number;
  title: string;
  subtitle: string;
  chapters: number[];
  subgroups?: SubGroup[];
}

export const ACT_GROUPINGS: ActGrouping[] = [
  { act: 1, title: 'The System', subtitle: 'How the patent landscape took shape', chapters: [1, 2, 3, 4, 5, 6, 7] },
  {
    act: 2, title: 'The Actors', subtitle: 'Organizations and inventors driving innovation', chapters: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    subgroups: [
      { title: 'The Organizations', chapters: [8, 9, 10, 11, 12, 13, 14, 15, 16] },
      { title: 'The Inventors', chapters: [17, 18, 19, 20] },
    ],
  },
  { act: 3, title: 'The Structure', subtitle: 'Where innovation happens and how it connects', chapters: [21, 22, 23, 24, 25, 26] },
  { act: 4, title: 'The Mechanics', subtitle: 'Knowledge flows, dynamics, and quality', chapters: [27, 28, 29, 30, 31] },
  { act: 5, title: 'Deep Dives', subtitle: 'Emerging fields and frontier technologies', chapters: [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43] },
];

export const CPC_SECTION_NAMES: Record<string, string> = {
  A: 'Human Necessities',
  B: 'Operations & Transport',
  C: 'Chemistry & Metallurgy',
  D: 'Textiles & Paper',
  E: 'Fixed Constructions',
  F: 'Mechanical Engineering',
  G: 'Physics',
  H: 'Electricity',
  Y: 'Cross-Sectional',
};

export const HERO_STATS = {
  totalPatents: '9.36M',
  yearsCovered: 50,
  startYear: 1976,
  endYear: 2025,
  chapters: 43,
  visualizations: 295,
};
