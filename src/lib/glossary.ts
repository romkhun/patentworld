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
  'Shannon entropy': {
    term: 'Shannon entropy',
    definition:
      'A measure of diversity or uncertainty in a distribution. Higher entropy means a more evenly spread portfolio across technology classes; lower entropy means concentration in fewer areas.',
  },
  'Jensen-Shannon divergence': {
    term: 'Jensen-Shannon divergence',
    definition:
      'A symmetric measure of the difference between two probability distributions. Used here to detect technology portfolio pivots by comparing a company\'s CPC distribution across consecutive time windows.',
  },
  'cosine similarity': {
    term: 'cosine similarity',
    definition:
      'A measure of similarity between two vectors based on the angle between them. Values range from 0 (completely different) to 1 (identical). Used to compare patent portfolio compositions between companies.',
  },
  'citation half-life': {
    term: 'citation half-life',
    definition:
      'The time it takes for a company\'s patents to accumulate half of their total forward citations. Shorter half-lives indicate more immediately impactful inventions; longer half-lives suggest foundational work.',
  },
  'talent flow': {
    term: 'talent flow',
    definition:
      'The movement of inventors between organizations, tracked by consecutive patent filings with different assignees. Net talent flow reveals which companies are gaining vs. losing inventive talent.',
  },
  'k-means clustering': {
    term: 'k-means clustering',
    definition:
      'An unsupervised machine learning algorithm that partitions data into k groups by minimizing within-cluster distances. Used here to classify company innovation trajectories into archetypes.',
  },
  'radar chart': {
    term: 'radar chart',
    definition:
      'A multi-dimensional chart that plots values along multiple axes radiating from a center point. Useful for comparing strategy profiles across several dimensions simultaneously.',
  },
  'chord diagram': {
    term: 'chord diagram',
    definition:
      'A circular visualization showing flows or connections between entities. Arcs represent entities; ribbons connecting them represent directed flows (e.g., citation flows between companies).',
  },
  'Sankey diagram': {
    term: 'Sankey diagram',
    definition:
      'A flow diagram where the width of links is proportional to the quantity of flow. Used here to visualize inventor talent flows between companies.',
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
  'WIPO technology fields': {
    term: 'WIPO technology fields',
    definition:
      'A classification of patents into 35 technology fields grouped into 5 sectors: Electrical engineering, Instruments, Chemistry, Mechanical engineering, and Other fields.',
  },
  'blockbuster rate': {
    term: 'blockbuster rate',
    definition:
      'The share of an entity\'s patents that fall in the top 1% of forward citations within their grant-year \u00d7 CPC section cohort. Rates above 1% indicate disproportionate high-impact output.',
  },
  'dud rate': {
    term: 'dud rate',
    definition:
      'The share of an entity\'s patents that receive zero forward citations within five years of grant. Higher dud rates indicate a larger proportion of patents with no measurable downstream impact.',
  },
  'terminal disclaimer': {
    term: 'terminal disclaimer',
    definition:
      'A legal mechanism in which a patent owner voluntarily shortens a patent\'s term to match a related earlier patent, typically to overcome an obviousness-type double patenting rejection. Terminal disclaimers tie the enforceability of the later patent to the earlier one.',
  },
  'prior art': {
    term: 'prior art',
    definition:
      'Any evidence that an invention was already known before a patent application was filed. Includes earlier patents, published papers, products, and public demonstrations. Patent examiners cite prior art to assess novelty and non-obviousness.',
  },
  'claim count': {
    term: 'claim count',
    definition:
      'The total number of independent and dependent claims in a patent. Measures the scope of legal protection sought. Higher claim counts generally indicate broader or more detailed protection.',
  },
  'continuation patent': {
    term: 'continuation patent',
    definition:
      'A patent application filed by the same applicant that claims priority from an earlier (parent) application. Continuations allow applicants to pursue additional claims based on the same specification, often extending patent family protection over time.',
  },
  'inter partes review': {
    term: 'inter partes review',
    definition:
      'A trial proceeding at the Patent Trial and Appeal Board (PTAB) to challenge the validity of an issued patent based on prior art. Introduced by the America Invents Act (2011), IPR has become a major mechanism for patent challenges.',
  },
  'patent portfolio': {
    term: 'patent portfolio',
    definition:
      'The collection of all patents held by an entity (company, university, or individual). Portfolio analysis examines the technological breadth, citation impact, and strategic positioning of an organization\'s patent holdings.',
  },
  'CPC section': {
    term: 'CPC section',
    definition:
      'The broadest level of the Cooperative Patent Classification hierarchy, denoted by a single letter (A through H, plus Y). There are 8 primary sections (e.g., G = Physics, H = Electricity) and the cross-sectional tagging section Y.',
  },
  'CPC class': {
    term: 'CPC class',
    definition:
      'The second level of the CPC hierarchy, denoted by the section letter followed by two digits (e.g., G06 = Computing; Calculating). There are approximately 130 active CPC classes.',
  },
  'CPC subclass': {
    term: 'CPC subclass',
    definition:
      'The third level of the CPC hierarchy, denoted by the class code followed by one or more letters (e.g., G06N = Computing arrangements based on specific computational models). There are approximately 670 active CPC subclasses.',
  },
};
