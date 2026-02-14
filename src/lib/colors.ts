export const CHART_COLORS = [
  'hsl(221, 83%, 53%)',   // Blue
  'hsl(142, 71%, 45%)',   // Green
  'hsl(38, 92%, 50%)',    // Amber
  'hsl(0, 84%, 60%)',     // Red
  'hsl(262, 83%, 58%)',   // Purple
  'hsl(187, 92%, 41%)',   // Teal
  'hsl(25, 95%, 53%)',    // Orange
  'hsl(340, 82%, 52%)',   // Pink
  'hsl(199, 89%, 48%)',   // Sky
];

// 15 maximally distinct colors for bump charts and other multi-line displays
export const BUMP_COLORS = [
  'hsl(221, 83%, 53%)',   // Blue
  'hsl(0, 84%, 60%)',     // Red
  'hsl(142, 71%, 45%)',   // Green
  'hsl(38, 92%, 50%)',    // Amber
  'hsl(262, 83%, 58%)',   // Purple
  'hsl(187, 92%, 41%)',   // Teal
  'hsl(340, 82%, 52%)',   // Pink
  'hsl(25, 95%, 53%)',    // Orange
  'hsl(165, 70%, 36%)',   // Dark Cyan
  'hsl(300, 55%, 50%)',   // Magenta
  'hsl(55, 80%, 44%)',    // Olive
  'hsl(199, 89%, 48%)',   // Sky
  'hsl(15, 70%, 45%)',    // Brown
  'hsl(280, 50%, 65%)',   // Lavender
  'hsl(100, 60%, 40%)',   // Forest
];


export const CPC_SECTION_COLORS: Record<string, string> = {
  A: CHART_COLORS[0],
  B: CHART_COLORS[1],
  C: CHART_COLORS[2],
  D: CHART_COLORS[3],
  E: CHART_COLORS[4],
  F: CHART_COLORS[5],
  G: CHART_COLORS[6],
  H: CHART_COLORS[7],
  Y: CHART_COLORS[8],
};

export const WIPO_SECTOR_COLORS: Record<string, string> = {
  'Electrical engineering': CHART_COLORS[0],
  'Instruments': CHART_COLORS[1],
  'Chemistry': CHART_COLORS[2],
  'Mechanical engineering': CHART_COLORS[5],
  'Other fields': CHART_COLORS[4],
};

// 25 maximally distinct colors for topic modeling scatter plots
export const TOPIC_COLORS = [
  'hsl(221, 83%, 53%)',   // Blue
  'hsl(0, 84%, 60%)',     // Red
  'hsl(142, 71%, 45%)',   // Green
  'hsl(38, 92%, 50%)',    // Amber
  'hsl(262, 83%, 58%)',   // Purple
  'hsl(187, 92%, 41%)',   // Teal
  'hsl(340, 82%, 52%)',   // Pink
  'hsl(25, 95%, 53%)',    // Orange
  'hsl(165, 70%, 36%)',   // Dark Cyan
  'hsl(300, 55%, 50%)',   // Magenta
  'hsl(55, 80%, 44%)',    // Olive
  'hsl(199, 89%, 48%)',   // Sky
  'hsl(15, 70%, 45%)',    // Brown
  'hsl(280, 50%, 65%)',   // Lavender
  'hsl(100, 60%, 40%)',   // Forest
  'hsl(45, 90%, 45%)',    // Gold
  'hsl(330, 70%, 40%)',   // Maroon
  'hsl(170, 80%, 35%)',   // Sea Green
  'hsl(210, 60%, 70%)',   // Light Blue
  'hsl(350, 60%, 55%)',   // Rose
  'hsl(120, 40%, 55%)',   // Sage
  'hsl(270, 70%, 50%)',   // Violet
  'hsl(30, 80%, 55%)',    // Tangerine
  'hsl(190, 70%, 50%)',   // Cerulean
  'hsl(80, 65%, 45%)',    // Chartreuse
];

// Green innovation sub-category colors
export const GREEN_CATEGORY_COLORS: Record<string, string> = {
  'Renewable Energy': 'hsl(142, 71%, 45%)',
  'Batteries & Storage': 'hsl(38, 92%, 50%)',
  'Other Energy': 'hsl(199, 89%, 48%)',
  'Transportation / EVs': 'hsl(262, 83%, 58%)',
  'Carbon Capture': 'hsl(187, 92%, 41%)',
  'Industrial Production': 'hsl(25, 95%, 53%)',
  'Buildings': 'hsl(340, 82%, 52%)',
  'Waste Management': 'hsl(55, 80%, 44%)',
  'Smart Grids': 'hsl(0, 84%, 60%)',
  'Other Green': '#94a3b8',
};

// Country colors for assignee origin charts
export const COUNTRY_COLORS: Record<string, string> = {
  'United States': 'hsl(221, 83%, 53%)',
  'Japan': 'hsl(0, 84%, 60%)',
  'South Korea': 'hsl(142, 71%, 45%)',
  'China': 'hsl(38, 92%, 50%)',
  'Germany': 'hsl(262, 83%, 58%)',
  'Rest of Europe': 'hsl(187, 92%, 41%)',
  'Rest of World': '#94a3b8',
};

// Industry colors for portfolio overlap scatter and company analysis
export const INDUSTRY_COLORS: Record<string, string> = {
  'Technology': 'hsl(221, 83%, 53%)',
  'Pharma / Biotech': 'hsl(142, 71%, 45%)',
  'Automotive': 'hsl(38, 92%, 50%)',
  'Electronics': 'hsl(262, 83%, 58%)',
  'Chemicals / Materials': 'hsl(187, 92%, 41%)',
  'Industrial / Conglomerate': 'hsl(25, 95%, 53%)',
  'Telecommunications': 'hsl(340, 82%, 52%)',
  'Semiconductor': 'hsl(199, 89%, 48%)',
  'Energy': 'hsl(55, 80%, 44%)',
  'Other': '#94a3b8',
};

// Trajectory archetype colors for company innovation profiles
export const ARCHETYPE_COLORS: Record<string, string> = {
  'Steady Climber': 'hsl(221, 83%, 53%)',
  'Boom & Bust': 'hsl(0, 84%, 60%)',
  'Late Bloomer': 'hsl(142, 71%, 45%)',
  'Fading Giant': 'hsl(38, 92%, 50%)',
  'Volatile': 'hsl(262, 83%, 58%)',
  'Plateau': 'hsl(187, 92%, 41%)',
};

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '14px',
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
