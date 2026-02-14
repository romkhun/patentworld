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

// Trajectory archetype colors for company innovation profiles
export const ARCHETYPE_COLORS: Record<string, string> = {
  'Steady Climber': '#0072B2',
  'Boom & Bust': '#D55E00',
  'Late Bloomer': '#009E73',
  'Fading Giant': '#E69F00',
  'Volatile': '#332288',
  'Plateau': '#56B4E9',
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

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '14px',
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
