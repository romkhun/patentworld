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
    relatedChapters: [2, 11, 12],
  },
  {
    number: 2,
    slug: 'the-technology-revolution',
    title: 'The Technology Revolution',
    subtitle: 'The shifting frontiers of technology',
    description: 'Electrical engineering rose from 18% to over 45% of all patents while textiles and paper declined to near-zero, reflecting a fundamental structural transformation in US patenting.',
    relatedChapters: [1, 3, 10, 23],
  },
  {
    number: 3,
    slug: 'the-language-of-innovation',
    title: 'The Language of Innovation',
    subtitle: 'Semantic analysis of 8.45 million patent abstracts',
    description: 'NMF topic modeling reveals that computing and semiconductor topics grew from 12% to over 33% of all patents, while patent novelty has risen steadily since the 1990s.',
    relatedChapters: [2, 10, 24],
  },
  {
    number: 4,
    slug: 'patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'Legislation and jurisprudence shaping the patent system',
    description: 'Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021), each linked to empirical research on their effects.',
    relatedChapters: [10, 12, 23],
  },
  // ── Act 2: The Actors ──
  {
    number: 5,
    slug: 'who-innovates',
    title: 'Who Innovates?',
    subtitle: 'The organizations driving patent activity',
    description: 'Foreign assignees surpassed US-based assignees around 2007 and now account for the majority of grants, while the top 100 organizations hold roughly one-third of all corporate patents.',
    relatedChapters: [6, 7, 9, 12],
  },
  {
    number: 6,
    slug: 'company-profiles',
    title: 'Company Innovation Profiles',
    subtitle: 'Interactive dashboards for 100 major patent filers',
    description: 'Only a small fraction of top-50 patent filers survived in the rankings across all five decades, with trajectory archetypes revealing distinct rise, peak, and decline patterns.',
    relatedChapters: [5, 7, 9],
  },
  {
    number: 7,
    slug: 'the-inventors',
    title: 'The Inventors',
    subtitle: 'Demographic composition and career trajectories',
    description: 'Average patent team size increased from 1.7 to over 3 inventors, while the female share of inventor instances rose steadily but remains below 15%.',
    relatedChapters: [5, 6, 8, 9],
  },
  // ── Act 3: The Structure ──
  {
    number: 8,
    slug: 'the-geography-of-innovation',
    title: 'The Geography of Innovation',
    subtitle: 'Spatial concentration and inventor mobility',
    description: 'California accounts for nearly one-quarter of all US patent grants, producing more patents than the bottom 30 states combined.',
    relatedChapters: [7, 9, 11],
  },
  {
    number: 9,
    slug: 'collaboration-networks',
    title: 'Collaboration Networks',
    subtitle: 'Co-invention, citation flows, and talent mobility',
    description: 'Cross-organizational co-patenting forms distinct industry clusters, and US-China co-invention rates grew from near-zero to over 2% by 2025.',
    relatedChapters: [6, 7, 8, 10],
  },
  // ── Act 4: The Mechanics ──
  {
    number: 10,
    slug: 'the-knowledge-network',
    title: 'The Knowledge Network',
    subtitle: 'Citation patterns, knowledge diffusion, and public funding',
    description: 'Average citation lag increased from approximately 3 years in the 1980s to over 16 years, reflecting the expanding body of relevant prior art.',
    relatedChapters: [2, 4, 12, 24],
  },
  {
    number: 11,
    slug: 'innovation-dynamics',
    title: 'Innovation Dynamics',
    subtitle: 'The tempo and trajectory of technological change',
    description: 'Grant lags peaked above 3.5 years in the late 2000s, and corporate technology portfolios reveal distinct diversification strategies among leading firms.',
    relatedChapters: [1, 8, 12],
  },
  {
    number: 12,
    slug: 'patent-quality',
    title: 'Patent Quality',
    subtitle: 'Measuring the value and impact of inventions',
    description: 'Average claims per patent increased by 76% since the 1970s, and originality has trended upward while generality declined, indicating diverging knowledge flow patterns.',
    relatedChapters: [1, 4, 10],
  },
  // ── Act 5: Deep Dives ──
  {
    number: 13,
    slug: 'semiconductors',
    title: 'Semiconductors',
    subtitle: 'The silicon foundation of modern technology',
    description: 'Semiconductor patents span manufacturing processes, integrated circuit design, packaging, and optoelectronics, with concentration among East Asian and US firms.',
    relatedChapters: [2, 14, 15, 23],
  },
  {
    number: 14,
    slug: 'quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'From theoretical foundations to practical hardware',
    description: 'Quantum computing patents have grown rapidly since 2015, encompassing algorithms, physical realizations, error correction, and superconducting devices.',
    relatedChapters: [13, 15, 23],
  },
  {
    number: 15,
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Defending digital infrastructure through innovation',
    description: 'Cybersecurity patents span cryptography, authentication, network security, and data protection, with growth accelerating alongside increasing digital threats.',
    relatedChapters: [14, 22, 23],
  },
  {
    number: 16,
    slug: 'biotechnology',
    title: 'Biotechnology & Gene Editing',
    subtitle: 'Engineering life at the molecular level',
    description: 'Biotechnology patents cover gene editing, recombinant DNA, enzyme engineering, and nucleic acid detection, with CRISPR driving a new wave of activity.',
    relatedChapters: [17, 18, 24],
  },
  {
    number: 17,
    slug: 'digital-health',
    title: 'Digital Health & Medical Devices',
    subtitle: 'Technology transforming healthcare delivery',
    description: 'Digital health patents encompass patient monitoring, health informatics, clinical decision support, and surgical robotics, bridging medicine and computing.',
    relatedChapters: [16, 18, 23],
  },
  {
    number: 18,
    slug: 'agricultural-technology',
    title: 'Agricultural Technology',
    subtitle: 'Innovation feeding a growing world',
    description: 'Agricultural technology patents cover soil working, planting, horticulture, plant breeding, and precision agriculture, reflecting the modernization of farming.',
    relatedChapters: [16, 17, 24],
  },
  {
    number: 19,
    slug: 'autonomous-vehicles',
    title: 'Autonomous Vehicles & ADAS',
    subtitle: 'The race toward self-driving transportation',
    description: 'Autonomous vehicle patents span driving systems, navigation, path planning, and scene understanding, with automotive and technology firms competing intensely.',
    relatedChapters: [13, 20, 23, 24],
  },
  {
    number: 20,
    slug: 'space-technology',
    title: 'Space Technology',
    subtitle: 'Patenting the final frontier',
    description: 'Space technology patents cover spacecraft design, propulsion systems, satellite communications, and re-entry systems, reflecting renewed commercial interest in space.',
    relatedChapters: [13, 19, 21],
  },
  {
    number: 21,
    slug: '3d-printing',
    title: '3D Printing & Additive Manufacturing',
    subtitle: 'Layer-by-layer revolution in manufacturing',
    description: 'Additive manufacturing patents span polymer and metal 3D printing, equipment design, materials science, and product applications across industries.',
    relatedChapters: [13, 19, 20],
  },
  {
    number: 22,
    slug: 'blockchain',
    title: 'Blockchain & Decentralized Systems',
    subtitle: 'Distributed trust in the digital economy',
    description: 'Blockchain patents cover distributed ledger technology, consensus mechanisms, and cryptocurrency, representing one of the most hyped emerging domains.',
    relatedChapters: [15, 23],
  },
  {
    number: 23,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'AI patenting from expert systems to deep learning',
    description: 'AI patent filings grew exponentially after 2012, with neural networks and deep learning displacing knowledge-based systems as the dominant methodology.',
    relatedChapters: [2, 13, 15, 24],
  },
  {
    number: 24,
    slug: 'green-innovation',
    title: 'The Green Innovation Race',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Battery, storage, and EV patents surpassed renewable energy as the dominant green sub-category, with South Korea emerging as a leading filer.',
    relatedChapters: [2, 18, 19, 23],
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
  { act: 2, title: 'The Actors', subtitle: 'Organizations and inventors driving innovation', chapters: [5, 6, 7] },
  { act: 3, title: 'The Structure', subtitle: 'Where innovation happens and how it connects', chapters: [8, 9] },
  { act: 4, title: 'The Mechanics', subtitle: 'Knowledge flows, dynamics, and quality', chapters: [10, 11, 12] },
  { act: 5, title: 'Deep Dives', subtitle: 'Emerging fields and frontier technologies', chapters: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
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
  chapters: 24,
  visualizations: 237,
};
