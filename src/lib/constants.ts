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
  {
    number: 1,
    slug: 'the-innovation-landscape',
    title: 'The Innovation Landscape',
    subtitle: '9.36 million US patents granted from 1976 to 2025',
    description: 'Annual US patent grants increased five-fold from approximately 70,000 in 1976 to over 350,000 in 2024, driven primarily by computing and electronics technologies.',
    relatedChapters: [2, 8, 9],
  },
  {
    number: 2,
    slug: 'the-technology-revolution',
    title: 'The Technology Revolution',
    subtitle: 'The shifting frontiers of technology',
    description: 'Electrical engineering rose from 18% to over 45% of all patents while textiles and paper declined to near-zero, reflecting a fundamental structural transformation in US patenting.',
    relatedChapters: [1, 7, 11, 12],
  },
  {
    number: 3,
    slug: 'who-innovates',
    title: 'Who Innovates?',
    subtitle: 'The organizations driving patent activity',
    description: 'Foreign assignees surpassed US-based assignees around 2007 and now account for the majority of grants, while the top 100 organizations hold roughly one-third of all corporate patents.',
    relatedChapters: [4, 6, 9, 14],
  },
  {
    number: 4,
    slug: 'the-inventors',
    title: 'The Inventors',
    subtitle: 'Demographic composition and career trajectories',
    description: 'Average patent team size increased from 1.7 to over 3 inventors, while the female share of inventor instances rose steadily but remains below 15%.',
    relatedChapters: [3, 5, 6, 14],
  },
  {
    number: 5,
    slug: 'the-geography-of-innovation',
    title: 'The Geography of Innovation',
    subtitle: 'Spatial concentration and inventor mobility',
    description: 'California accounts for nearly one-quarter of all US patent grants, producing more patents than the bottom 30 states combined.',
    relatedChapters: [4, 6, 8],
  },
  {
    number: 6,
    slug: 'collaboration-networks',
    title: 'Collaboration Networks',
    subtitle: 'Co-invention, citation flows, and talent mobility',
    description: 'Cross-organizational co-patenting forms distinct industry clusters, and US-China co-invention rates grew from near-zero to over 2% by 2025.',
    relatedChapters: [4, 5, 7, 14],
  },
  {
    number: 7,
    slug: 'the-knowledge-network',
    title: 'The Knowledge Network',
    subtitle: 'Citation patterns, knowledge diffusion, and public funding',
    description: 'Average citation lag increased from approximately 3 years in the 1980s to over 16 years, reflecting the expanding body of relevant prior art.',
    relatedChapters: [2, 9, 10, 12],
  },
  {
    number: 8,
    slug: 'innovation-dynamics',
    title: 'Innovation Dynamics',
    subtitle: 'The tempo and trajectory of technological change',
    description: 'Grant lags peaked above 3.5 years in the late 2000s, and international co-invention increased from approximately 2% to over 10% of all patents.',
    relatedChapters: [1, 5, 9],
  },
  {
    number: 9,
    slug: 'patent-quality',
    title: 'Patent Quality',
    subtitle: 'Measuring the value and impact of inventions',
    description: 'Average claims per patent increased by 76% since the 1970s, and originality has trended upward while generality declined, indicating diverging knowledge flow patterns.',
    relatedChapters: [1, 7, 10],
  },
  {
    number: 10,
    slug: 'patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'Legislation and jurisprudence shaping the patent system',
    description: 'Twenty-one major legislative acts and Supreme Court decisions from the Bayh-Dole Act (1980) to Arthrex (2021), each linked to empirical research on their effects.',
    relatedChapters: [7, 9, 11],
  },
  {
    number: 11,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'AI patenting from expert systems to deep learning',
    description: 'AI patent filings grew exponentially after 2012, with neural networks and deep learning displacing knowledge-based systems as the dominant methodology.',
    relatedChapters: [2, 4, 10, 12],
  },
  {
    number: 12,
    slug: 'green-innovation',
    title: 'The Green Innovation Race',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Battery, storage, and EV patents surpassed renewable energy as the dominant green sub-category, with South Korea emerging as a leading filer.',
    relatedChapters: [2, 5, 11, 13],
  },
  {
    number: 13,
    slug: 'the-language-of-innovation',
    title: 'The Language of Innovation',
    subtitle: 'Semantic analysis of 8.45 million patent abstracts',
    description: 'NMF topic modeling reveals that computing and semiconductor topics grew from 12% to over 33% of all patents, while patent novelty has risen steadily since the 1990s.',
    relatedChapters: [2, 7, 12],
  },
  {
    number: 14,
    slug: 'company-profiles',
    title: 'Company Innovation Profiles',
    subtitle: 'Interactive dashboards for 100 major patent filers',
    description: 'Only a small fraction of top-50 patent filers survived in the rankings across all five decades, with trajectory archetypes revealing distinct rise, peak, and decline patterns.',
    relatedChapters: [3, 4, 6],
  },
];

export interface ActGrouping {
  act: number;
  title: string;
  subtitle: string;
  chapters: number[];
}

export const ACT_GROUPINGS: ActGrouping[] = [
  { act: 1, title: 'The System', subtitle: 'How the patent landscape took shape', chapters: [1, 2] },
  { act: 2, title: 'The Actors', subtitle: 'Organizations and inventors driving innovation', chapters: [3, 4] },
  { act: 3, title: 'The Structure', subtitle: 'Where innovation happens and how it connects', chapters: [5, 6] },
  { act: 4, title: 'The Mechanics', subtitle: 'Knowledge flows, dynamics, and quality', chapters: [7, 8, 9] },
  { act: 5, title: 'Context & Deep Dives', subtitle: 'Policy, emerging fields, and company profiles', chapters: [10, 11, 12, 13, 14] },
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
  chapters: 14,
  visualizations: 127,
};
