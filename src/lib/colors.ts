// Okabe-Ito colorblind-safe palette (primary)
export const CHART_COLORS = [
  '#0072B2',  // Blue
  '#E69F00',  // Orange
  '#009E73',  // Green
  '#CC79A7',  // Pink
  '#56B4E9',  // Light Blue
  '#D55E00',  // Red-Orange
  '#332288',  // Indigo
  '#882255',  // Wine
  '#999999',  // Gray
];

// 15 colorblind-safe colors for bump charts and multi-line displays
export const BUMP_COLORS = [
  '#0072B2',  // Blue
  '#D55E00',  // Red-Orange
  '#009E73',  // Green
  '#E69F00',  // Orange
  '#332288',  // Indigo
  '#56B4E9',  // Light Blue
  '#CC79A7',  // Pink
  '#882255',  // Wine
  '#44AA99',  // Teal
  '#AA4499',  // Magenta
  '#117733',  // Forest
  '#88CCEE',  // Cyan
  '#DDCC77',  // Sand
  '#661100',  // Dark Red
  '#999999',  // Gray
];

export const CPC_SECTION_COLORS: Record<string, string> = {
  A: '#0072B2',  // Blue — Human Necessities
  B: '#E69F00',  // Orange — Operations & Transport
  C: '#009E73',  // Green — Chemistry & Metallurgy
  D: '#CC79A7',  // Pink — Textiles & Paper
  E: '#882255',  // Wine — Fixed Constructions
  F: '#D55E00',  // Red-Orange — Mechanical Engineering
  G: '#56B4E9',  // Light Blue — Physics
  H: '#332288',  // Indigo — Electricity
  Y: '#999999',  // Gray — Cross-Sectional
};

export const WIPO_SECTOR_COLORS: Record<string, string> = {
  'Electrical engineering': '#0072B2',
  'Instruments': '#009E73',
  'Chemistry': '#E69F00',
  'Mechanical engineering': '#D55E00',
  'Other fields': '#CC79A7',
};

// 25 colorblind-safe colors for topic modeling scatter plots
export const TOPIC_COLORS = [
  '#0072B2',  // Blue
  '#D55E00',  // Red-Orange
  '#009E73',  // Green
  '#E69F00',  // Orange
  '#332288',  // Indigo
  '#56B4E9',  // Light Blue
  '#CC79A7',  // Pink
  '#882255',  // Wine
  '#44AA99',  // Teal
  '#AA4499',  // Magenta
  '#117733',  // Forest
  '#88CCEE',  // Cyan
  '#DDCC77',  // Sand
  '#661100',  // Dark Red
  '#999999',  // Gray
  '#CC6677',  // Rose
  '#1D6996',  // Steel Blue
  '#73AF48',  // Leaf Green
  '#E6550D',  // Burnt Orange
  '#6F4070',  // Plum
  '#38A6A5',  // Sea Green
  '#EDAD08',  // Gold
  '#8C564B',  // Brown
  '#17BECF',  // Cerulean
  '#F0E442',  // Yellow
];

// Green innovation sub-category colors
export const GREEN_CATEGORY_COLORS: Record<string, string> = {
  'Renewable Energy': '#009E73',
  'Batteries & Storage': '#E69F00',
  'Other Energy': '#56B4E9',
  'Transportation / EVs': '#332288',
  'Carbon Capture': '#44AA99',
  'Industrial Production': '#D55E00',
  'Buildings': '#CC79A7',
  'Waste Management': '#882255',
  'Smart Grids': '#0072B2',
  'Other Green': '#999999',
};

// Country colors for assignee origin charts
export const COUNTRY_COLORS: Record<string, string> = {
  'United States': '#0072B2',
  'Japan': '#D55E00',
  'South Korea': '#009E73',
  'China': '#E69F00',
  'Germany': '#332288',
  'Rest of Europe': '#56B4E9',
  'Rest of World': '#999999',
};

// Industry colors for portfolio overlap scatter and company analysis
export const INDUSTRY_COLORS: Record<string, string> = {
  'Technology': '#0072B2',
  'Pharma / Biotech': '#009E73',
  'Automotive': '#E69F00',
  'Electronics': '#332288',
  'Chemicals / Materials': '#56B4E9',
  'Industrial / Conglomerate': '#D55E00',
  'Telecommunications': '#CC79A7',
  'Semiconductor': '#882255',
  'Energy': '#44AA99',
  'Other': '#999999',
};

// Consistent entity-to-color map for top assignees across all chapters
export const ENTITY_COLORS: Record<string, string> = {
  'IBM': '#0072B2',
  'Samsung': '#E69F00',
  'Canon': '#009E73',
  'Microsoft': '#CC79A7',
  'Intel': '#56B4E9',
  'Apple': '#D55E00',
  'Google': '#332288',
  'Qualcomm': '#882255',
  'Sony': '#44AA99',
  'TSMC': '#AA4499',
  'LG': '#117733',
  'Huawei': '#88CCEE',
  'Boeing': '#DDCC77',
  'GE': '#661100',
  'Toyota': '#999999',
};

// ── Deep Dive Domain Sub-category Colors ────────────────────────────────────

export const SEMI_SUBFIELD_COLORS: Record<string, string> = {
  'Manufacturing Processes': '#0072B2',
  'Integrated Circuits': '#E69F00',
  'Semiconductor Devices': '#009E73',
  'Packaging & Interconnects': '#CC79A7',
  'Assemblies & Modules': '#56B4E9',
  'Photovoltaic Cells': '#D55E00',
  'LEDs & Optoelectronics': '#332288',
  'Organic Semiconductors': '#882255',
  'Other Solid-State Devices': '#44AA99',
  'Other Semiconductor': '#999999',
};

export const QUANTUM_SUBFIELD_COLORS: Record<string, string> = {
  'Quantum Algorithms': '#0072B2',
  'Physical Realizations': '#E69F00',
  'Quantum Annealing': '#009E73',
  'Error Correction': '#CC79A7',
  'Quantum Programming': '#56B4E9',
  'Other Quantum Computing': '#D55E00',
  'Superconducting Devices': '#332288',
  'Other Quantum': '#999999',
};

export const CYBER_SUBFIELD_COLORS: Record<string, string> = {
  'Cryptography': '#0072B2',
  'Authentication & Access Control': '#E69F00',
  'Network Security': '#009E73',
  'Data Protection': '#CC79A7',
  'System Security': '#56B4E9',
  'Other Computer Security': '#D55E00',
  'Other Cybersecurity': '#999999',
};

export const BIOTECH_SUBFIELD_COLORS: Record<string, string> = {
  'Gene Editing & Modification': '#0072B2',
  'Expression Vectors': '#E69F00',
  'Recombinant DNA': '#009E73',
  'Enzyme Engineering': '#CC79A7',
  'Nucleic Acid Detection': '#56B4E9',
  'Other Genetic Engineering': '#D55E00',
  'Other Biotech': '#999999',
};

export const DIGIHEALTH_SUBFIELD_COLORS: Record<string, string> = {
  'Vital Signs Monitoring': '#0072B2',
  'Diagnostic Imaging': '#E69F00',
  'Physiological Signals': '#009E73',
  'Other Patient Monitoring': '#CC79A7',
  'Electronic Health Records': '#56B4E9',
  'Clinical Decision Support': '#D55E00',
  'Medical Imaging Informatics': '#332288',
  'Healthcare IT Infrastructure': '#882255',
  'Biomedical Data Analytics': '#44AA99',
  'Other Health Informatics': '#AA4499',
  'Surgical Robotics': '#117733',
  'Other Digital Health': '#999999',
};

export const AGTECH_SUBFIELD_COLORS: Record<string, string> = {
  'Soil Working & Tillage': '#0072B2',
  'Planting & Sowing': '#E69F00',
  'Horticulture & Forestry': '#009E73',
  'Plant Breeding & Biocides': '#CC79A7',
  'Precision Agriculture': '#56B4E9',
  'Other AgTech': '#999999',
};

export const AV_SUBFIELD_COLORS: Record<string, string> = {
  'Autonomous Driving Systems': '#0072B2',
  'Navigation & Path Planning': '#E69F00',
  'Vehicle Control': '#009E73',
  'Scene Understanding': '#CC79A7',
  'Other AV': '#999999',
};

export const SPACE_SUBFIELD_COLORS: Record<string, string> = {
  'Satellite Design': '#0072B2',
  'Propulsion Systems': '#E69F00',
  'Attitude Control & Life Support': '#009E73',
  'Re-Entry Systems': '#CC79A7',
  'Arrangements for Landing': '#56B4E9',
  'Space Communications': '#D55E00',
  'Other Spacecraft': '#332288',
  'Other Space': '#999999',
};

export const PRINT3D_SUBFIELD_COLORS: Record<string, string> = {
  'AM Processes': '#0072B2',
  'AM Equipment': '#E69F00',
  'AM Auxiliary Operations': '#009E73',
  'AM Data Handling': '#CC79A7',
  'AM Materials': '#56B4E9',
  'AM Products': '#D55E00',
  'Polymer Additive Manufacturing': '#332288',
  'Metal Additive Manufacturing': '#882255',
  'Other 3D Printing': '#999999',
};

export const BLOCKCHAIN_SUBFIELD_COLORS: Record<string, string> = {
  'Distributed Ledger & Consensus': '#0072B2',
  'Cryptocurrency & Digital Money': '#E69F00',
  'Other Blockchain': '#999999',
};

// ── Sequential & Diverging Scales (discrete stops) ─────────────────────────

/**
 * Viridis 9-stop sequential scale (perceptually uniform, colorblind-safe).
 * Use for heatmaps, choropleths, and any magnitude-encoding visualization.
 */
export const SEQUENTIAL_SCALE = [
  '#440154', // lowest value
  '#482878',
  '#3e4989',
  '#31688e',
  '#26828e',
  '#1f9e89',
  '#35b779',
  '#6ece58',
  '#fde725', // highest value
] as const;

/**
 * Blue-to-orange diverging scale (colorblind-safe).
 * Use for signed change (positive/negative) centered at zero.
 */
export const DIVERGING_SCALE = [
  '#2166ac', // most negative
  '#4393c3',
  '#92c5de',
  '#d1e5f0',
  '#f7f7f7', // zero / neutral
  '#fddbc7',
  '#f4a582',
  '#d6604d',
  '#b2182b', // most positive
] as const;

// ── Additional Categorical Mappings ────────────────────────────────────────

export const PATENT_TYPE_COLORS: Record<string, string> = {
  'Utility': '#0072B2',
  'Design': '#E69F00',
  'Plant': '#009E73',
  'Reissue': '#999999',
};

export const ASSIGNEE_TYPE_COLORS: Record<string, string> = {
  'Corporate': '#0072B2',
  'Individual': '#E69F00',
  'University': '#009E73',
  'Government': '#D55E00',
  'Other': '#999999',
};

export const FILING_ROUTE_COLORS: Record<string, string> = {
  'PCT': '#0072B2',
  'Direct Foreign': '#E69F00',
  'Domestic': '#009E73',
};

// Geographic region colors for world flow maps
export const REGION_COLORS: Record<string, string> = {
  'Americas': '#0072B2',
  'Europe': '#009E73',
  'East Asia': '#E69F00',
  'South Asia': '#332288',
  'Oceania': '#CC79A7',
  'Middle East': '#D55E00',
  'Africa': '#44AA99',
};

/** Look up CPC section color with fallback to gray. */
export function getCpcColor(section: string): string {
  const key = section.charAt(0).toUpperCase();
  return CPC_SECTION_COLORS[key] ?? '#999999';
}

// ── Tooltip ────────────────────────────────────────────────────────────────

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'var(--font-jakarta)',
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
