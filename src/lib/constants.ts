export const SITE_NAME = 'PatentWorld';
export const SITE_DESCRIPTION = 'An interactive exploration of 9.36 million US patents spanning 50 years of global innovation.';

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
    subtitle: '50 years of global invention in 9.36 million US patents',
    description: 'How has the pace and nature of patenting changed since 1976?',
    relatedChapters: [2, 8, 9],
  },
  {
    number: 2,
    slug: 'the-technology-revolution',
    title: 'The Technology Revolution',
    subtitle: 'The shifting frontiers of technology',
    description: 'Which technologies are rising, and which are fading?',
    relatedChapters: [1, 7, 11, 12],
  },

  {
    number: 3,
    slug: 'who-innovates',
    title: 'Who Innovates?',
    subtitle: 'The organizations driving patent activity',
    description: 'From IBM to Samsung: who holds the patents, and how has that changed?',
    relatedChapters: [4, 6, 9, 14],
  },
  {
    number: 4,
    slug: 'the-inventors',
    title: 'The Inventors',
    subtitle: 'The people behind the patents',
    description: 'Team sizes, gender trends, and the most prolific inventors.',
    relatedChapters: [3, 5, 6, 14],
  },
  {
    number: 5,
    slug: 'the-geography-of-innovation',
    title: 'The Geography of Innovation',
    subtitle: 'Where ideas are born',
    description: 'Innovation hubs from Silicon Valley to Shenzhen.',
    relatedChapters: [4, 6, 8],
  },
  {
    number: 6,
    slug: 'collaboration-networks',
    title: 'Collaboration Networks',
    subtitle: 'The web of co-invention and co-patenting',
    description: 'How do firms and inventors collaborate? Network analysis reveals the hidden structure of innovation.',
    relatedChapters: [4, 5, 7, 14],
  },
  {
    number: 7,
    slug: 'the-knowledge-network',
    title: 'The Knowledge Network',
    subtitle: 'How ideas build on ideas',
    description: 'Citations, government funding, and the flow of knowledge.',
    relatedChapters: [2, 9, 10, 12],
  },
  {
    number: 8,
    slug: 'innovation-dynamics',
    title: 'Innovation Dynamics',
    subtitle: 'The tempo and trajectory of invention',
    description: 'Grant lag, cross-domain convergence, global collaboration, and the velocity of innovation.',
    relatedChapters: [1, 5, 9],
  },
  {
    number: 9,
    slug: 'patent-quality',
    title: 'Patent Quality',
    subtitle: 'Measuring the value and impact of inventions',
    description: 'Forward citations, originality, generality, and other dimensions of patent quality over 50 years.',
    relatedChapters: [1, 7, 10],
  },
  {
    number: 10,
    slug: 'patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'The rules that shape innovation',
    description: 'Major legislation, Supreme Court decisions, and policy changes that have shaped the US patent system.',
    relatedChapters: [7, 9, 11],
  },
  {
    number: 11,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'The rise of AI in the patent system',
    description: 'How AI patenting has evolved from early expert systems to the deep learning and generative AI era.',
    relatedChapters: [2, 4, 10, 12],
  },
  {
    number: 12,
    slug: 'green-innovation',
    title: 'The Green Innovation Race',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Green patents grew from a trickle to a torrent. Who leads the race to decarbonize, and where is AI meeting climate?',
    relatedChapters: [2, 5, 11, 13],
  },
  {
    number: 13,
    slug: 'the-language-of-innovation',
    title: 'The Language of Innovation',
    subtitle: 'What patents talk about and how it has changed',
    description: 'Topic modeling and semantic analysis of 9.36 million patent abstracts reveals emerging themes, technology convergence, and the novelty of invention.',
    relatedChapters: [2, 7, 12],
  },
  {
    number: 14,
    slug: 'company-profiles',
    title: 'Company Innovation Profiles',
    subtitle: 'Interactive dashboards for 100 major patent filers',
    description: 'Deep-dive into the innovation trajectories, portfolio strategies, and competitive positioning of the world\'s most prolific patent filers.',
    relatedChapters: [3, 4, 6],
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
  chapters: 14,
  visualizations: 121,
};
