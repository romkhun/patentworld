export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  CPC: {
    term: 'CPC',
    definition:
      'Cooperative Patent Classification — a hierarchical system jointly managed by the USPTO and EPO that categorizes patents by technology area (e.g., H = Electricity, G = Physics).',
  },
  'forward citations': {
    term: 'forward citations',
    definition:
      'The number of times a patent is cited by later patents. A widely used proxy for patent impact and technological importance.',
  },
  'grant lag': {
    term: 'grant lag',
    definition:
      'The time (usually in days or years) between a patent application filing date and the date the patent is granted. Also called patent pendency.',
  },
  assignee: {
    term: 'assignee',
    definition:
      'The entity (corporation, university, government, or individual) that owns the rights to a patent.',
  },
  'utility patent': {
    term: 'utility patent',
    definition:
      'A patent granted for a new and useful process, machine, manufacture, or composition of matter. The most common patent type, representing over 90% of US grants.',
  },
  'design patent': {
    term: 'design patent',
    definition:
      'A patent granted for a new, original, and ornamental design for an article of manufacture. Protects appearance, not function.',
  },
  HHI: {
    term: 'HHI',
    definition:
      'Herfindahl-Hirschman Index — a measure of market concentration calculated as the sum of squared shares. Ranges from 0 (fragmented) to 10,000 (monopoly).',
  },
  originality: {
    term: 'originality',
    definition:
      'A patent-level metric measuring how broadly a patent draws on prior art across different technology classes. Higher originality = more diverse knowledge sources.',
  },
  generality: {
    term: 'generality',
    definition:
      'A patent-level metric measuring how broadly a patent is cited across different technology classes. Higher generality = wider downstream influence.',
  },
  'patent thicket': {
    term: 'patent thicket',
    definition:
      'A dense web of overlapping patent rights that competitors must navigate, often used as a strategic barrier to entry.',
  },
  PatentsView: {
    term: 'PatentsView',
    definition:
      'A patent data platform supported by the USPTO that provides disambiguated inventor, assignee, and citation data for US patents.',
  },
  WIPO: {
    term: 'WIPO',
    definition:
      'World Intellectual Property Organization — a UN agency that administers international IP treaties and provides technology field classifications for patents.',
  },
  'Bayh-Dole Act': {
    term: 'Bayh-Dole Act',
    definition:
      'A 1980 US law that allowed universities and small businesses to retain patent rights from federally funded research, spurring academic patenting.',
  },
  AIA: {
    term: 'AIA',
    definition:
      'America Invents Act (2011) — the most significant reform of the US patent system since 1952, switching from first-to-invent to first-inventor-to-file.',
  },
  'Alice decision': {
    term: 'Alice decision',
    definition:
      'Alice Corp. v. CLS Bank (2014) — a Supreme Court ruling that significantly restricted patent eligibility for software and business method patents.',
  },
  'topic modeling': {
    term: 'topic modeling',
    definition:
      'A machine learning technique that discovers abstract "topics" in a collection of documents by identifying clusters of frequently co-occurring words.',
  },
  'TF-IDF': {
    term: 'TF-IDF',
    definition:
      'Term Frequency–Inverse Document Frequency — a numerical statistic that reflects how important a word is to a document relative to a larger collection. Common words are down-weighted.',
  },
  NMF: {
    term: 'NMF',
    definition:
      'Non-negative Matrix Factorization — a matrix decomposition method used for topic modeling that produces interpretable, additive topic representations.',
  },
  UMAP: {
    term: 'UMAP',
    definition:
      'Uniform Manifold Approximation and Projection — a dimensionality reduction technique that preserves both local and global structure, used to visualize high-dimensional data in 2D.',
  },
  'Y02': {
    term: 'Y02',
    definition:
      'A CPC classification section for technologies related to climate change mitigation. Sub-categories include renewable energy (Y02E), transportation (Y02T), carbon capture (Y02C), buildings (Y02B), and industrial production (Y02P).',
  },
  'green patents': {
    term: 'green patents',
    definition:
      'Patents classified under CPC codes Y02 (climate change mitigation) or Y04S (smart grids), covering technologies from solar and wind energy to electric vehicles and carbon capture.',
  },
};
