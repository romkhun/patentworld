export interface ReferenceEvent {
  x: number;
  label: string;
  color?: string;
}

export const PATENT_EVENTS: ReferenceEvent[] = [
  { x: 1980, label: 'Bayh-Dole Act', color: '#6366f1' },
  { x: 1995, label: 'TRIPS Agreement', color: '#8b5cf6' },
  { x: 2001, label: 'Dot-com bust', color: '#ef4444' },
  { x: 2008, label: 'Financial crisis', color: '#ef4444' },
  { x: 2011, label: 'America Invents Act', color: '#6366f1' },
  { x: 2014, label: 'Alice Corp. decision', color: '#f59e0b' },
  { x: 2020, label: 'COVID-19', color: '#ef4444' },
];

export const GREEN_EVENTS: ReferenceEvent[] = [
  { x: 1997, label: 'Kyoto Protocol', color: '#22c55e' },
  { x: 2015, label: 'Paris Agreement', color: '#22c55e' },
  { x: 2022, label: 'Inflation Reduction Act', color: '#6366f1' },
];

export const SEMI_EVENTS: ReferenceEvent[] = [
  { x: 2000, label: 'Dot-com bust', color: '#ef4444' },
  { x: 2011, label: 'America Invents Act', color: '#6366f1' },
  { x: 2022, label: 'CHIPS Act', color: '#6366f1' },
];

export const QUANTUM_EVENTS: ReferenceEvent[] = [
  { x: 2019, label: 'Quantum supremacy', color: '#8b5cf6' },
  { x: 2023, label: 'Quantum error correction', color: '#8b5cf6' },
];

export const CYBER_EVENTS: ReferenceEvent[] = [
  { x: 2013, label: 'Snowden leaks', color: '#ef4444' },
  { x: 2017, label: 'WannaCry / GDPR', color: '#ef4444' },
  { x: 2020, label: 'SolarWinds hack', color: '#ef4444' },
];

export const BIOTECH_EVENTS: ReferenceEvent[] = [
  { x: 1980, label: 'Bayh-Dole Act', color: '#6366f1' },
  { x: 2003, label: 'Human Genome complete', color: '#8b5cf6' },
  { x: 2012, label: 'CRISPR published', color: '#22c55e' },
  { x: 2020, label: 'mRNA vaccines', color: '#22c55e' },
];

export const DIGIHEALTH_EVENTS: ReferenceEvent[] = [
  { x: 2009, label: 'HITECH Act', color: '#6366f1' },
  { x: 2020, label: 'COVID-19 / telemedicine', color: '#ef4444' },
];

export const AGTECH_EVENTS: ReferenceEvent[] = [
  { x: 1996, label: 'GM crops adopted', color: '#22c55e' },
  { x: 2012, label: 'Precision ag boom', color: '#22c55e' },
];

export const AV_EVENTS: ReferenceEvent[] = [
  { x: 2009, label: 'Google self-driving start', color: '#8b5cf6' },
  { x: 2016, label: 'Tesla Autopilot crash', color: '#ef4444' },
  { x: 2020, label: 'Waymo public launch', color: '#22c55e' },
];

export const SPACE_EVENTS: ReferenceEvent[] = [
  { x: 2002, label: 'SpaceX founded', color: '#8b5cf6' },
  { x: 2015, label: 'Falcon 9 landing', color: '#22c55e' },
  { x: 2020, label: 'Crew Dragon launch', color: '#22c55e' },
];

export const PRINT3D_EVENTS: ReferenceEvent[] = [
  { x: 2009, label: 'FDM patent expires', color: '#8b5cf6' },
  { x: 2014, label: 'Desktop 3D printing boom', color: '#22c55e' },
];

export const BLOCKCHAIN_EVENTS: ReferenceEvent[] = [
  { x: 2009, label: 'Bitcoin whitepaper', color: '#8b5cf6' },
  { x: 2015, label: 'Ethereum launch', color: '#8b5cf6' },
  { x: 2021, label: 'Crypto / NFT peak', color: '#ef4444' },
];

/** Filter events to only those within the data range and relevant to a topic */
export function filterEvents(
  events: ReferenceEvent[],
  opts?: { minX?: number; maxX?: number; only?: number[] }
): ReferenceEvent[] {
  let filtered = events;
  if (opts?.only) {
    const set = new Set(opts.only);
    filtered = filtered.filter((e) => set.has(e.x));
  }
  if (opts?.minX != null) {
    filtered = filtered.filter((e) => e.x >= opts.minX!);
  }
  if (opts?.maxX != null) {
    filtered = filtered.filter((e) => e.x <= opts.maxX!);
  }
  return filtered;
}
