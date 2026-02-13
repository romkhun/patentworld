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

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '14px',
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
