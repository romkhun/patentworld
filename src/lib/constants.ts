export const SITE_NAME = 'PatentWorld';
export const SITE_DESCRIPTION = 'An interactive exploration of 9.36 million US patents (utility, design, plant, and reissue) granted from 1976 to 2025, covering technology classifications, inventor demographics, geographic distribution, citation networks, and patent quality indicators.';

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
    description: 'Annual US patent grants (all types) increased more than five-fold from approximately 70,000 in 1976 to 374,000 in 2024, peaking at 393,000 (all types) in 2019. Average (mean) grant pendency peaked at 3.8 years in 2010 before moderating.',
  },
  {
    number: 2,
    slug: 'system-patent-quality',
    title: 'Patent Quality',
    subtitle: 'Claims, scope, citations, originality, and knowledge flow indicators',
    description: 'Average claims per patent doubled from 9.4 to a peak of 18.9 in 2005. Forward citations rose to a peak of 6.4 in 2019. System-wide originality rose from 0.09 to 0.25 (section-level averages reached 0.45-0.55 by the 2020s) while generality fell from 0.28 to 0.15.',
  },
  {
    number: 3,
    slug: 'system-patent-fields',
    title: 'Patent Fields',
    subtitle: 'Technology classes, field-level dynamics, and quality by technology area',
    description: 'CPC sections G and H gained 30 percentage points of share over five decades, rising from 27% to 57% of all grants. The fastest digital technology classes grew by more than 1,000%. Patent grant concentration by assignee remains below conventional thresholds across CPC sections.',
  },
  {
    number: 4,
    slug: 'system-convergence',
    title: 'Convergence',
    subtitle: 'Cross-domain technology convergence',
    description: 'Multi-section patents rose from 21% to 40% of all grants by 2024. The G-H convergence pair rose from 12.5% to 37.5% of cross-section patents between 1976-1995 and 2011-2025.',
  },
  {
    number: 5,
    slug: 'system-language',
    title: 'The Language of Innovation',
    subtitle: 'Semantic analysis of 8.45 million patent abstracts',
    description: 'Computing and semiconductor topics grew from 12% to 33% of all patents since 1976. Patent novelty (median entropy) rose 6.6% from 1.97 to 2.10, with an upward trend since the late 1980s.',
  },
  {
    number: 6,
    slug: 'system-patent-law',
    title: 'Patent Law & Policy',
    subtitle: 'Legislation and jurisprudence shaping the patent system',
    description: 'The Alice decision (2014) curtailed software patent eligibility, while the AIA (2011) was the most significant reform since 1952. Twenty-one legislative and judicial events from 1980 to 2025 show measurable effects on filing patterns within one to two years.',
  },
  {
    number: 7,
    slug: 'system-public-investment',
    title: 'Public Investment',
    subtitle: 'Government funding and the Bayh-Dole Act',
    description: 'Government-funded patents rose from 1,294 in 1980 to 8,359 in 2019 after the Bayh-Dole Act. HHS/NIH leads with 55,587 patents, followed by Defense (43,736) and Energy (33,994).',
  },
  // ── ACT 2: The Organizations ──
  {
    number: 8,
    slug: 'org-composition',
    title: 'Assignee Composition',
    subtitle: 'Corporate, foreign, and country-level composition of patent assignees',
    description: 'Corporate assignees grew from 94% to 99% of US patent grants. Foreign assignees surpassed US-based assignees around 2007. Japan accounts for 1.45 million US patents since 1976.',
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
    description: '50 companies (248 company-decade observations) cluster into 8 industry groups by patent portfolio similarity. Portfolio diversity rose across leading firms, with Mitsubishi Electric reaching a peak Shannon entropy of 6.7 across 229 CPC subclasses. 51 technology pivots detected across 20 companies, which can precede strategic shifts that later become publicly visible.',
  },
  {
    number: 12,
    slug: 'org-company-profiles',
    title: 'Interactive Company Profiles',
    subtitle: 'Unified patent histories, portfolios, quality trends, and strategy profiles',
    description: 'Interactive dashboards for each organization across five analytical dimensions: output trajectories, technology portfolios, citation quality, innovation strategy radar, and grant lag trends. Search and compare any assignee in the dataset.',
  },
  // ── ACT 3: The Inventors ──
  {
    number: 13,
    slug: 'inv-top-inventors',
    title: 'Top Inventors',
    subtitle: 'Superstar concentration, prolific inventors, and citation impact',
    description: 'The top 5% of inventors (by cumulative output) account for 63.2% of all patents. Their annual share rose from 26% to 60% between 1976 and 2025. The most prolific inventor holds 6,709 patents. Citation impact ranges from 10 to 965 average citations among top 100.',
  },
  {
    number: 14,
    slug: 'inv-generalist-specialist',
    title: 'Generalist vs. Specialist',
    subtitle: 'Technology specialization patterns and quality differences',
    description: 'Specialist inventors rose from 20% to 48% of the inventor workforce. Generalists earn 9.3 forward citations per patent vs. 8.2 for specialists and score 0.212 on originality vs. 0.165.',
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
    description: 'Female inventor share rose from 2.8% in 1976 to 14.9% in 2025 (through September). All-male teams average 14.2 forward citations, mixed-gender teams 12.6, and all-female teams 9.5. Chemistry leads cumulative female representation at 14.6% (1976-2025), reaching 23.4% in the most recent period.',
  },
  {
    number: 17,
    slug: 'inv-team-size',
    title: 'Team Size and Collaboration',
    subtitle: 'The collaborative turn and team size effects on quality',
    description: 'Average patent team size increased from 1.7 to 3.2 inventors, while the solo-inventor share fell from 58% to 23% by 2025. Teams of 7+ average 16.7 claims per patent vs. 11.6 for solo inventors.',
  },
  // ── ACT 4: The Geography ──
  {
    number: 18,
    slug: 'geo-domestic',
    title: 'Domestic Geography',
    subtitle: 'State-level and city-level patent concentration and quality',
    description: 'California accounts for 23.6% of all US patent grants, producing 992,708 patents -- more than the bottom 30 states combined. States exhibit distinctive specialization: Michigan devotes 20.1% to Mechanical Engineering vs. California\'s 65.1% in Physics and Electricity.',
  },
  {
    number: 19,
    slug: 'geo-international',
    title: 'International Geography',
    subtitle: 'Cross-border patterns and country-level quality metrics',
    description: 'Japan leads foreign filings with 1.45 million US patents, while China grew from 299 filings in 2000 to 30,695 in 2024. The US leads with approximately 164,000 patents granted cumulatively during the 2020s (by assignee country) and 18.4 average claims, while rapidly growing origins exhibit lower claims, suggesting a quality-quantity tradeoff.',
  },
  // ── ACT 5: The Mechanics ──
  {
    number: 20,
    slug: 'mech-organizations',
    title: 'Organizational Mechanics',
    subtitle: 'Within-firm exploration, exploitation, and inter-firm knowledge flows',
    description: '11 of 20 major filers keep exploration below 5%. Balanced firms produce blockbusters at 2.3x the rate of specialists. 618 organizations form distinct industry clusters in the co-patenting network.',
  },
  {
    number: 21,
    slug: 'mech-inventors',
    title: 'Inventor Mechanics',
    subtitle: 'Co-invention networks, bridge inventors, and inter-firm mobility',
    description: '632 prolific inventors form 1,236 co-invention ties. 143,524 inventor movements (consecutive patents at different assignees within 5 years) flow among 50 organizations. International mobility rose from 1.3% to 5.1%, with the US involved in 77.6% of all cross-border flows.',
  },
  {
    number: 22,
    slug: 'mech-geography',
    title: 'Geographic Mechanics',
    subtitle: 'Cross-border collaboration and innovation diffusion',
    description: 'International co-invention increased from 1.0% in 1976 to 10.0% in 2025 (through September). US-China co-invention grew from 77 patents in 2000 to 2,749 in 2024.',
  },
  // ── ACT 6: Deep Dives (existing, routes unchanged) ──
  {
    number: 23,
    slug: '3d-printing',
    title: '3D Printing & Additive Manufacturing',
    subtitle: 'Layer-by-layer revolution in manufacturing',
    description: 'Top-four-firm concentration in 3D printing patents declined from 36% in 2005 to 11% by 2024, as the expiration of key FDM patents in 2009 opened the field to broad-based competition. Later entrants (2010s cohort) patent at 11.2 patents per year compared to 8.3 for 1990s entrants.',
  },
  {
    number: 24,
    slug: 'agricultural-technology',
    title: 'Agricultural Technology',
    subtitle: 'Innovation feeding a growing world',
    description: 'Agricultural technology patent velocity nearly quadrupled from 7.4 patents per year (1970s entrants) to 32.9 (2000s entrants), coinciding with the precision agriculture revolution. Top-four concentration declined from 46.7% in 2014 to 32.8% by 2025.',
  },
  {
    number: 25,
    slug: 'ai-patents',
    title: 'Artificial Intelligence',
    subtitle: 'AI patenting from expert systems to deep learning',
    description: 'AI patent grants grew 5.7-fold from 5,201 in 2012 to 29,624 in 2023, reaching 9.4% of all US patent grants. IBM leads with 16,781 AI patents, followed by Google (7,775) and Samsung (6,195).',
  },
  {
    number: 26,
    slug: 'autonomous-vehicles',
    title: 'Autonomous Vehicles & ADAS',
    subtitle: 'The race toward self-driving transportation',
    description: 'Autonomous vehicle patent velocity rose from 15.9 patents per year (1990s entrants) to 28.6 (2010s entrants), a 1.8-fold increase. Subfield diversity reached near-maximum entropy of 0.97 by 2025. Toyota, Honda, Ford, and Waymo lead the field.',
  },
  {
    number: 27,
    slug: 'biotechnology',
    title: 'Biotechnology & Gene Editing',
    subtitle: 'Engineering life at the molecular level',
    description: 'Biotechnology achieved the lowest top-four concentration among all advanced technology domains studied, declining from 13.5% in 2007 to 4.6% by 2025. Subfield diversity tripled from 0.32 in 1976 to 0.94 by 2025, reflecting successive waves from recombinant DNA to CRISPR-Cas9.',
  },
  {
    number: 28,
    slug: 'blockchain',
    title: 'Blockchain & Decentralized Systems',
    subtitle: 'Distributed trust in the digital economy',
    description: 'Blockchain patent filings peaked in 2022 and subsequently declined, the only advanced technology domain in the study to reverse course. Top-four concentration rose to 26.3% during the 2018 boom before declining to 14.0% by 2024.',
  },
  {
    number: 29,
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Defending digital infrastructure through innovation',
    description: 'Cybersecurity top-four concentration declined from 32.4% in 1980 to 9.4% by 2025, reflecting broad-based entry across the field. Patent velocity reached 105.8 patents per year for 2010s entrants, a 1.4-fold increase over 1970s entrants. Network security surpassed cryptography as the dominant subfield around 2003.',
  },
  {
    number: 30,
    slug: 'digital-health',
    title: 'Digital Health & Medical Devices',
    subtitle: 'Technology transforming healthcare delivery',
    description: 'Digital health patent velocity jumped 3.4-fold from 22.5 patents per year (1970s entrants) to 77.5 (2010s entrants). Philips (2,909 patents), Medtronic (2,302), and Intuitive Surgical (1,994) lead the field. Subfield diversity rose from 0.48 in 1976 to 0.92 by 2025.',
  },
  {
    number: 31,
    slug: 'green-innovation',
    title: 'Green Innovation',
    subtitle: 'Climate technology patents from niche to mainstream',
    description: 'Green patents show a 1.8-fold velocity increase from 1970s to 2000s entrants (68 to 122 patents per year). Battery and EV patents reached 7,363 and 5,818 grants respectively by 2024, surpassing renewable energy at 3,453. Samsung (13,771), Toyota (12,636), and GE (10,812) lead.',
  },
  {
    number: 32,
    slug: 'quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'From theoretical foundations to practical hardware',
    description: 'Quantum computing remains the most concentrated advanced technology domain, with the top four firms holding 28.4% of patents in 2025 (through September), down from 76.9% in 2003. It is the only domain where early entrants (1990s cohort) patent faster than later entrants, reflecting high hardware IP barriers.',
  },
  {
    number: 33,
    slug: 'semiconductors',
    title: 'Semiconductors',
    subtitle: 'The silicon foundation of modern technology',
    description: 'Semiconductor patents uniquely exhibit rising concentration, with top-four-firm share increasing from 11.3% in 1977 to 32.6% in 2023 — the only advanced technology domain showing sustained consolidation. Entry velocity plateaued at 197 patents per year for both 1990s and 2010s cohorts.',
  },
  {
    number: 34,
    slug: 'space-technology',
    title: 'Space Technology',
    subtitle: 'Patenting the final frontier',
    description: 'Space technology top-four concentration fluctuated between 4.9% and 36.7%, the widest range among all domains studied, reflecting the transition from government-dominated to commercial-driven innovation. Boeing, ViaSat, and Lockheed Martin lead, with satellite communications now the dominant subfield.',
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
  { act: 6, title: 'Deep Dives', subtitle: 'Established and emerging technology domains', chapters: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34] },
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
  visualizations: 458,
};
