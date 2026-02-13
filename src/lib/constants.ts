export const SITE_NAME = 'PatentWorld';
export const SITE_DESCRIPTION = 'An interactive exploration of 9.36 million US patents spanning 50 years of American innovation.';

export interface ChapterMeta {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
}

export const CHAPTERS: ChapterMeta[] = [
  {
    number: 1,
    slug: 'the-innovation-landscape',
    title: 'The Innovation Landscape',
    subtitle: '50 years of American invention in 9.36 million patents',
    description: 'How has the pace and nature of patenting changed since 1976?',
  },
  {
    number: 2,
    slug: 'the-technology-revolution',
    title: 'The Technology Revolution',
    subtitle: 'The shifting frontiers of technology',
    description: 'Which technologies are rising, and which are fading?',
  },
  {
    number: 3,
    slug: 'who-innovates',
    title: 'Who Innovates?',
    subtitle: 'The organizations driving patent activity',
    description: 'From IBM to Samsung: who holds the patents, and how has that changed?',
  },
  {
    number: 4,
    slug: 'the-geography-of-innovation',
    title: 'The Geography of Innovation',
    subtitle: 'Where ideas are born',
    description: 'Innovation hubs from Silicon Valley to Shenzhen.',
  },
  {
    number: 5,
    slug: 'the-inventors',
    title: 'The Inventors',
    subtitle: 'The people behind the patents',
    description: 'Team sizes, gender trends, and the most prolific inventors.',
  },
  {
    number: 6,
    slug: 'the-knowledge-network',
    title: 'The Knowledge Network',
    subtitle: 'How ideas build on ideas',
    description: 'Citations, government funding, and the flow of knowledge.',
  },
  {
    number: 7,
    slug: 'innovation-dynamics',
    title: 'Innovation Dynamics',
    subtitle: 'The tempo and trajectory of invention',
    description: 'Grant lag, cross-domain convergence, global collaboration, and the velocity of innovation.',
  },
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
  chapters: 7,
  visualizations: 40,
};
