'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

const FIPS_TO_ABBREV: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
};

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming',
};

const COLOR_STEPS = [
  'hsl(221, 70%, 94%)',
  'hsl(221, 70%, 84%)',
  'hsl(221, 70%, 74%)',
  'hsl(221, 70%, 64%)',
  'hsl(221, 70%, 54%)',
  'hsl(221, 70%, 44%)',
  'hsl(221, 70%, 34%)',
];

interface PWChoroplethMapProps {
  data: Record<string, number>;
  valueLabel?: string;
  valueFormatter?: (v: number) => string;
}

function formatDefault(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}

export function PWChoroplethMap({
  data,
  valueLabel = 'Patents',
  valueFormatter = formatDefault,
}: PWChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topo, setTopo] = useState<Topology | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/geo/us-states.json`)
      .then((res) => res.json())
      .then((json) => setTopo(json as Topology));
  }, []);

  const values = useMemo(() => Object.values(data), [data]);
  const colorScale = useMemo(() => {
    if (values.length === 0) return scaleQuantize<string>().domain([0, 1]).range(COLOR_STEPS);
    const max = Math.max(...values);
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const niceMax = Math.ceil(max / magnitude) * magnitude;
    return scaleQuantize<string>().domain([0, niceMax]).range(COLOR_STEPS);
  }, [values]);

  const features = useMemo(() => {
    if (!topo) return [];
    const geom = topo.objects.states as GeometryCollection;
    return topojson.feature(topo, geom).features;
  }, [topo]);

  const projection = useMemo(() => geoAlbersUsa().scale(1100).translate([480, 300]), []);
  const pathGen = useMemo(() => geoPath().projection(projection), [projection]);

  const handleMouseMove = useCallback((e: React.MouseEvent, abbrev: string, value: number | undefined) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      content: `${STATE_NAMES[abbrev] ?? abbrev}: ${value != null ? valueFormatter(value) : 'N/A'}`,
    });
  }, [valueFormatter]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (!topo) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading map...</div>;

  const [minVal, maxVal] = colorScale.domain();

  return (
    <div className="relative w-full h-full flex flex-col">
      <svg ref={svgRef} viewBox="0 0 960 600" className="w-full flex-1">
        {features.map((feature) => {
          const fips = String(feature.id).padStart(2, '0');
          const abbrev = FIPS_TO_ABBREV[fips];
          const value = abbrev ? data[abbrev] : undefined;
          const fill = value != null ? colorScale(value) : 'hsl(var(--muted))';
          return (
            <path
              key={feature.id}
              d={pathGen(feature) ?? ''}
              fill={fill}
              stroke="hsl(var(--background))"
              strokeWidth={0.8}
              className="transition-opacity hover:opacity-80 cursor-pointer"
              onMouseMove={(e) => handleMouseMove(e, abbrev ?? '', value)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 rounded-md border bg-card px-3 py-1.5 text-sm shadow-md"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.content}
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center justify-center gap-1 mt-2 mb-4 shrink-0">
        <span className="text-xs text-muted-foreground">{valueFormatter(minVal)}</span>
        {COLOR_STEPS.map((color, i) => (
          <div key={i} className="w-8 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span className="text-xs text-muted-foreground">{valueFormatter(maxVal)}</span>
        <span className="ml-2 text-xs text-muted-foreground">{valueLabel}</span>
      </div>
    </div>
  );
}
