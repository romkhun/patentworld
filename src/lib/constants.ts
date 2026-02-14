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
    slug: 'the-innovation-landscape',
    title: 'The Innovation Landscape',
    subtitle: '9.36 million US patents granted from 1976 to 2025',
    description: 'Annual US patent grants increased five-fold from approximately 70,000 in 1976 to over 350,000 in 2024, driven primarily by computing and electronics technologies.',
    relatedChapters: [2, 9, 10],
  },
  {
    number: 2,
    slug: 'the-technology-revolution',
    title: 'The Technology Revolution',
    subtitle: 'The shifting frontiers of technology',
    description: 'Electrical engineering rose from 18% to over 45% of all patents while textiles and paper declined to near-zero, reflecting a fundamental structural transformation in US patenting.',
    relatedChapters: [1, 3, 9, 13],
  },
  {
    number: 3,
    slug: 'the-language-of-innovation',
    title: 'The Language of Innovation',
    subtitle: 'Semantic analysis of 8.45 million patent abstracts',
    description: 'NMF topic modeling reveals that computing and semiconductor topics grew from 12% to over 33% of all patents, while patent novelty has risen steadily since the 1990s.',
    relatedChapters: [2, 9, 19],
  },
  {
    number: 4,
    slug: 'patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'Legislation and jurisprudence shaping the patent system',
    description: 'Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021), each linked to empirical research on their effects.',
    relatedChapters: [9, 10, 13],
  },
  // ── Act 2: The Actors ──
  {
    number: 5,
    slug: 'firm-innovation',
    title: 'Firm Innovation',
    subtitle: 'Corporate patent strategies, organizational leadership, and company innovation profiles',
    description: 'Foreign assignees surpassed US-based assignees around 2007, the top 100 organizations hold roughly one-third of all corporate patents, and trajectory archetypes reveal distinct rise, peak, and decline patterns.',
    relatedChapters: [6, 8, 9],
  },
  {
    number: 6,
    slug: 'the-inventors',
    title: 'The Inventors',
    subtitle: 'Demographic composition and career trajectories',
    description: 'Average patent team size increased from 1.7 to over 3 inventors, while the female share of inventor instances rose steadily but remains below 15%.',
    relatedChapters: [5, 7, 8],
  },
  // ── Act 3: The Structure ──
  {
    number: 7,
    slug: 'the-geography-of-innovation',
    title: 'The Geography of Innovation',
    subtitle: 'Spatial concentration and inventor mobility',
    description: 'California accounts for nearly one-quarter of all US patent grants, producing more patents than the bottom 30 states combined.',
    relatedChapters: [6, 8, 10],
  },
  {
    number: 8,
    slug: 'collaboration-networks',
    title: 'Collaboration Networks',
    subtitle: 'Co-invention, citation flows, and talent mobility',
    description: 'Cross-organizational co-patenting forms distinct industry clusters, and US-China co-invention rates grew from near-zero to over 2% by 2025.',
    relatedChapters: [5, 6, 7, 9],
  },
  // ── Act 4: The Mechanics ──
  {
    number: 9,
    slug: 'patent-quality',
    title: 'Patent Quality',
    subtitle: 'Measuring the value, impact, and characteristics of patented inventions',
    description: 'Forward citations exhibit growing skewness, citation lag has expanded from 3 to 16 years, and originality has risen while generality declined, indicating diverging knowledge flows.',
    relatedChapters: [1, 2, 10],
  },
  {
    number: 10,
    slug: 'sector-dynamics',
    title: 'Sector Dynamics',
    subtitle: 'How innovation metrics vary across technology fields',
    description: 'Citation lag, examination friction, claims, and composite quality vary substantially across CPC sections and WIPO sectors, revealing distinct dynamics for each technology field.',
    relatedChapters: [2, 9],
  },
  // ── Act 5: Deep Dives ──
  {
    number: 11,
    slug: '3d-printing',
    title: '3D Printing & Additive Manufacturing',
    subtitle: 'Layer-by-layer revolution in manufacturing',
    description: 'Additive manufacturing patents span polymer and metal 3D printing, equipment design, materials science, and product applications across industries.',
    relatedChapters: [21, 14, 22],
  },
  {
    number: 12,
    slug: 'agricultural-technology',
    title: 'Agricultural Technology',
    subtitle: 'Innovation feeding a growing world',
    description: 'Agricultural technology patents cover soil working, planting, horticulture, plant breeding, and precision agriculture, reflecting the modernization of farming.',
    relatedChapters: [15, 18, 19],
  },
  {
    number: 13,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'AI patenting from expert systems to deep learning',
    description: 'AI patent filings grew exponentially after 2012, with neural networks and deep learning displacing knowledge-based systems as the dominant methodology.',
    relatedChapters: [2, 21, 17, 19],
  },
  {
    number: 14,
    slug: 'autonomous-vehicles',
    title: 'Autonomous Vehicles & ADAS',
    subtitle: 'The race toward self-driving transportation',
    description: 'Autonomous vehicle patents span driving systems, navigation, path planning, and scene understanding, with automotive and technology firms competing intensely.',
    relatedChapters: [21, 22, 13, 19],
  },
  {
    number: 15,
    slug: 'biotechnology',
    title: 'Biotechnology & Gene Editing',
    subtitle: 'Engineering life at the molecular level',
    description: 'Biotechnology patents cover gene editing, recombinant DNA, enzyme engineering, and nucleic acid detection, with CRISPR driving a new wave of activity.',
    relatedChapters: [18, 12, 19],
  },
  {
    number: 16,
    slug: 'blockchain',
    title: 'Blockchain & Decentralized Systems',
    subtitle: 'Distributed trust in the digital economy',
    description: 'Blockchain patents cover distributed ledger technology, consensus mechanisms, and cryptocurrency, representing one of the most hyped emerging domains.',
    relatedChapters: [17, 13],
  },
  {
    number: 17,
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Defending digital infrastructure through innovation',
    description: 'Cybersecurity patents span cryptography, authentication, network security, and data protection, with growth accelerating alongside increasing digital threats.',
    relatedChapters: [20, 16, 13],
  },
  {
    number: 18,
    slug: 'digital-health',
    title: 'Digital Health & Medical Devices',
    subtitle: 'Technology transforming healthcare delivery',
    description: 'Digital health patents encompass patient monitoring, health informatics, clinical decision support, and surgical robotics, bridging medicine and computing.',
    relatedChapters: [15, 12, 13],
  },
  {
    number: 19,
    slug: 'green-innovation',
    title: 'Green Innovation',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Battery, storage, and EV patents surpassed renewable energy as the dominant green sub-category, with South Korea emerging as a leading filer.',
    relatedChapters: [2, 12, 14, 13],
  },
  {
    number: 20,
    slug: 'quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'From theoretical foundations to practical hardware',
    description: 'Quantum computing patents have grown rapidly since 2015, encompassing algorithms, physical realizations, error correction, and superconducting devices.',
    relatedChapters: [21, 17, 13],
  },
  {
    number: 21,
    slug: 'semiconductors',
    title: 'Semiconductors',
    subtitle: 'The silicon foundation of modern technology',
    description: 'Semiconductor patents span manufacturing processes, integrated circuit design, packaging, and optoelectronics, with concentration among East Asian and US firms.',
    relatedChapters: [2, 20, 17, 13],
  },
  {
    number: 22,
    slug: 'space-technology',
    title: 'Space Technology',
    subtitle: 'Patenting the final frontier',
    description: 'Space technology patents cover spacecraft design, propulsion systems, satellite communications, and re-entry systems, reflecting renewed commercial interest in space.',
    relatedChapters: [21, 14, 11],
  },
];

export interface ActGrouping {
  act: number;
  title: string;
  subtitle: string;
  chapters: number[];
}

export const ACT_GROUPINGS: ActGrouping[] = [
  { act: 1, title: 'The System', subtitle: 'How the patent landscape took shape', chapters: [1, 2, 3, 4] },
  { act: 2, title: 'The Actors', subtitle: 'Organizations and inventors driving innovation', chapters: [5, 6] },
  { act: 3, title: 'The Structure', subtitle: 'Where innovation happens and how it connects', chapters: [7, 8] },
  { act: 4, title: 'The Mechanics', subtitle: 'Knowledge flows, dynamics, and quality', chapters: [9, 10] },
  { act: 5, title: 'Deep Dives', subtitle: 'Emerging fields and frontier technologies', chapters: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] },
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
  chapters: 22,
  visualizations: 540,
};
