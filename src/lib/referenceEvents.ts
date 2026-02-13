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
