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
  // ── ACT 1: The System ──
  {
    number: 1,
    slug: 'system-patent-count',
    title: 'Patent Count',
    subtitle: 'Annual patent volume and grant pendency',
    description: 'Annual US patent grants increased five-fold from approximately 70,000 in 1976 to over 350,000 in 2024. Grant pendency peaked at 3.8 years in 2010 before moderating.',
  },
  {
    number: 2,
    slug: 'system-patent-quality',
    title: 'Patent Quality',
    subtitle: 'Claims, scope, citations, originality, and knowledge flow indicators',
    description: 'Average claims per patent doubled from 9.4 to 18.9. Forward citations rose to a peak of 6.4 in 2019. Originality rose from 0.09 to 0.25 while generality fell from 0.28 to 0.15.',
  },
  {
    number: 3,
    slug: 'system-patent-fields',
    title: 'Patent Fields',
    subtitle: 'Technology classes, field-level dynamics, and quality by technology area',
    description: 'CPC sections G and H gained roughly 30 percentage points of share over five decades. The fastest digital technology classes grew by over 1,000%. Patent markets remain unconcentrated across CPC sections.',
  },
  {
    number: 4,
    slug: 'system-convergence',
    title: 'Convergence',
    subtitle: 'Cross-domain technology convergence',
    description: 'Multi-section patents rose from 21% to 41% of all grants. The G-H convergence pair rose from 12.5% to 37.5% of cross-section patents between 1976-1995 and 2011-2025.',
  },
  {
    number: 5,
    slug: 'system-language',
    title: 'The Language of Innovation',
    subtitle: 'Semantic analysis of 8.45 million patent abstracts',
    description: 'NMF topic modeling reveals that computing and semiconductor topics grew from 12% to over 33% of all patents, while patent novelty has risen steadily since the 1990s.',
  },
  {
    number: 6,
    slug: 'system-patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'Legislation and jurisprudence shaping the patent system',
    description: 'Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021), each linked to empirical research on their effects.',
  },
  {
    number: 7,
    slug: 'system-public-investment',
    title: 'Public Investment',
    subtitle: 'Government funding and the Bayh-Dole Act',
    description: 'Government-funded patents rose from 1,269 in 1976 to a peak of 6,457 in 2015. HHS/NIH leads with 55,587 government-funded patents.',
  },
  // ── ACT 2: The Organizations ──
  {
    number: 8,
    slug: 'org-composition',
    title: 'Assignee Composition',
    subtitle: 'Corporate, foreign, and country-level composition of patent assignees',
    description: 'Corporate assignees grew from 94% to 99% of US patent grants. Foreign assignees surpassed US-based assignees around 2007. Japan accounts for 1.4 million US patents since 1976.',
  },
  {
    number: 9,
    slug: 'org-patent-count',
    title: 'Organizational Patent Count',
    subtitle: 'Patent output rankings and trajectories of leading organizations',
    description: 'IBM leads with 161,888 cumulative grants. Samsung peaked at 9,716 annual grants in 2024. The top 100 organizations hold 32-39% of corporate patents.',
  },
  {
    number: 10,
    slug: 'org-patent-quality',
    title: 'Organizational Patent Quality',
    subtitle: 'Citation impact, blockbuster patents, and quality metrics across top filers',
    description: 'Amazon holds the highest blockbuster rate at 6.7%. Microsoft leads in average citations at 30.7. Citation half-lives range from 6.3 years (Huawei) to 14.3 years.',
  },
  {
    number: 11,
    slug: 'org-patent-portfolio',
    title: 'Patent Portfolio',
    subtitle: 'Diversification, competitive proximity, and portfolio transitions',
    description: 'Portfolio diversity rose across leading firms. 248 companies cluster into 8 industries by patent portfolio similarity. JSD scores identify major strategic portfolio shifts.',
  },
  {
    number: 12,
    slug: 'org-company-profiles',
    title: 'Interactive Company Profiles',
    subtitle: 'Unified patent histories, portfolios, quality trends, and strategy profiles',
    description: 'Interactive profiles combining annual output, technology composition, citation impact, innovation strategy, and portfolio analysis for individual companies.',
  },
  // ── ACT 3: The Inventors ──
  {
    number: 13,
    slug: 'inv-top-inventors',
    title: 'Top Inventors',
    subtitle: 'Superstar concentration, prolific inventors, and citation impact',
    description: '12% of inventors produce 61% of total patent output. The most prolific inventor holds 6,709 patents. Citation impact ranges widely among top inventors.',
  },
  {
    number: 14,
    slug: 'inv-generalist-specialist',
    title: 'Generalist vs. Specialist',
    subtitle: 'Technology specialization patterns and quality differences',
    description: 'Specialist inventors rose from 20% to 48% of the inventor workforce. Quality metrics differ systematically between generalist and specialist inventors.',
  },
  {
    number: 15,
    slug: 'inv-serial-new',
    title: 'Serial Inventors vs. New Entrants',
    subtitle: 'Career patterns, serial innovation, and inventor survival',
    description: 'Annual first-time inventor entries peaked at 140,490 in 2019. Only 37-51% of inventors survive past five career years. Productivity rises from 1.4 to 2.1 patents per year.',
  },
  {
    number: 16,
    slug: 'inv-gender',
    title: 'Gender and Patenting',
    subtitle: 'Gender composition and the gender innovation gap',
    description: 'Female inventor share rose from 2.8% in 1976 to 14.9% in 2025. Quality metrics reveal systematic differences between women and men inventors.',
  },
  {
    number: 17,
    slug: 'inv-team-size',
    title: 'Team Size and Collaboration',
    subtitle: 'The collaborative turn and team size effects on quality',
    description: 'Average patent team size increased from 1.7 to over 3 inventors. Quality metrics differ systematically across solo inventors, small teams, and large teams.',
  },
  // ── ACT 4: The Geography ──
  {
    number: 18,
    slug: 'geo-domestic',
    title: 'Domestic Geography',
    subtitle: 'State-level and city-level patent concentration and quality',
    description: 'California accounts for 23.6% of all US patent grants. San Jose, San Diego, and Austin lead all US cities. Quality metrics vary substantially across states and cities.',
  },
  {
    number: 19,
    slug: 'geo-international',
    title: 'International Geography',
    subtitle: 'Cross-border patterns and country-level quality metrics',
    description: 'International inventor mobility rose from 1.3% to 5.1%. Japan leads foreign filings with 1.45 million US patents. Quality metrics differ systematically across countries.',
  },
  // ── ACT 5: The Mechanics ──
  {
    number: 20,
    slug: 'mech-organizations',
    title: 'Organizational Mechanics',
    subtitle: 'Within-firm exploration, exploitation, and inter-firm knowledge flows',
    description: '11 of 20 major filers keep exploration below 5%. New-subclass exploration scores decay from 1.0 to 0.087. Corporate citation flows reveal distinct industry clusters.',
  },
  {
    number: 21,
    slug: 'mech-inventors',
    title: 'Inventor Mechanics',
    subtitle: 'Co-invention networks, bridge inventors, and inter-firm mobility',
    description: '632 prolific inventors form 1,236 co-invention ties. 143,524 inventor movements flow among 50 major organizations. California accounts for 54.9% of interstate migration.',
  },
  {
    number: 22,
    slug: 'mech-geography',
    title: 'Geographic Mechanics',
    subtitle: 'Cross-border collaboration and innovation diffusion',
    description: 'International co-invention increased from approximately 2% to 10%. US-China co-invention grew from 77 patents in 2000 to 2,749 in 2024.',
  },
  // ── ACT 6: Deep Dives (existing, routes unchanged) ──
  {
    number: 23,
    slug: '3d-printing',
    title: '3D Printing & Additive Manufacturing',
    subtitle: 'Layer-by-layer revolution in manufacturing',
    description: 'Additive manufacturing patents span polymer and metal 3D printing, equipment design, materials science, and product applications across industries.',
  },
  {
    number: 24,
    slug: 'agricultural-technology',
    title: 'Agricultural Technology',
    subtitle: 'Innovation feeding a growing world',
    description: 'Agricultural technology patents cover soil working, planting, horticulture, plant breeding, and precision agriculture, reflecting the modernization of farming.',
  },
  {
    number: 25,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'AI patenting from expert systems to deep learning',
    description: 'AI patent filings grew exponentially after 2012, with neural networks and deep learning displacing knowledge-based systems as the dominant methodology.',
  },
  {
    number: 26,
    slug: 'autonomous-vehicles',
    title: 'Autonomous Vehicles & ADAS',
    subtitle: 'The race toward self-driving transportation',
    description: 'Autonomous vehicle patents span driving systems, navigation, path planning, and scene understanding, with automotive and technology firms competing intensely.',
  },
  {
    number: 27,
    slug: 'biotechnology',
    title: 'Biotechnology & Gene Editing',
    subtitle: 'Engineering life at the molecular level',
    description: 'Biotechnology patents cover gene editing, recombinant DNA, enzyme engineering, and nucleic acid detection, with CRISPR driving a new wave of activity.',
  },
  {
    number: 28,
    slug: 'blockchain',
    title: 'Blockchain & Decentralized Systems',
    subtitle: 'Distributed trust in the digital economy',
    description: 'Blockchain patents cover distributed ledger technology, consensus mechanisms, and cryptocurrency, representing one of the most hyped emerging domains.',
  },
  {
    number: 29,
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Defending digital infrastructure through innovation',
    description: 'Cybersecurity patents span cryptography, authentication, network security, and data protection, with growth accelerating alongside increasing digital threats.',
  },
  {
    number: 30,
    slug: 'digital-health',
    title: 'Digital Health & Medical Devices',
    subtitle: 'Technology transforming healthcare delivery',
    description: 'Digital health patents encompass patient monitoring, health informatics, clinical decision support, and surgical robotics, bridging medicine and computing.',
  },
  {
    number: 31,
    slug: 'green-innovation',
    title: 'Green Innovation',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Battery, storage, and EV patents surpassed renewable energy as the dominant green sub-category, with South Korea emerging as a leading filer.',
  },
  {
    number: 32,
    slug: 'quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'From theoretical foundations to practical hardware',
    description: 'Quantum computing patents have grown rapidly since 2015, encompassing algorithms, physical realizations, error correction, and superconducting devices.',
  },
  {
    number: 33,
    slug: 'semiconductors',
    title: 'Semiconductors',
    subtitle: 'The silicon foundation of modern technology',
    description: 'Semiconductor patents span manufacturing processes, integrated circuit design, packaging, and optoelectronics, with concentration among East Asian and US firms.',
  },
  {
    number: 34,
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
  { act: 2, title: 'The Organizations', subtitle: 'Firms and institutions driving innovation', chapters: [8, 9, 10, 11, 12] },
  { act: 3, title: 'The Inventors', subtitle: 'Who invents and how they differ', chapters: [13, 14, 15, 16, 17] },
  { act: 4, title: 'The Geography', subtitle: 'Where innovation happens', chapters: [18, 19] },
  { act: 5, title: 'The Mechanics', subtitle: 'How knowledge flows through organizations, inventors, and places', chapters: [20, 21, 22] },
  { act: 6, title: 'Deep Dives', subtitle: 'Emerging fields and frontier technologies', chapters: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34] },
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
  chapters: 34,
  visualizations: 359,
};
