'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { geoNaturalEarth1, geoPath, geoInterpolate, GeoProjection } from 'd3-geo';
import { scaleQuantize, scaleLinear } from 'd3-scale';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { REGION_COLORS } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

// ISO 3166-1 numeric -> alpha-2 mapping for major countries
const NUM_TO_ALPHA2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '024': 'AO', '032': 'AR', '036': 'AU',
  '040': 'AT', '050': 'BD', '056': 'BE', '076': 'BR', '100': 'BG', '104': 'MM',
  '112': 'BY', '116': 'KH', '120': 'CM', '124': 'CA', '144': 'LK', '152': 'CL',
  '156': 'CN', '158': 'TW', '170': 'CO', '188': 'CR', '191': 'HR', '192': 'CU',
  '196': 'CY', '203': 'CZ', '208': 'DK', '214': 'DO', '218': 'EC', '818': 'EG',
  '233': 'EE', '231': 'ET', '246': 'FI', '250': 'FR', '276': 'DE', '288': 'GH',
  '300': 'GR', '320': 'GT', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN',
  '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT',
  '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR',
  '414': 'KW', '422': 'LB', '434': 'LY', '440': 'LT', '442': 'LU', '458': 'MY',
  '484': 'MX', '504': 'MA', '508': 'MZ', '528': 'NL', '554': 'NZ', '566': 'NG',
  '578': 'NO', '586': 'PK', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT',
  '634': 'QA', '642': 'RO', '643': 'RU', '682': 'SA', '686': 'SN', '688': 'RS',
  '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI', '710': 'ZA', '724': 'ES',
  '752': 'SE', '756': 'CH', '760': 'SY', '764': 'TH', '780': 'TT', '784': 'AE',
  '788': 'TN', '792': 'TR', '800': 'UG', '804': 'UA', '826': 'GB', '834': 'TZ',
  '840': 'US', '858': 'UY', '862': 'VE', '887': 'YE', '894': 'ZM',
};

// Country display names
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil',
  GB: 'United Kingdom', FR: 'France', DE: 'Germany', IT: 'Italy',
  ES: 'Spain', NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  AT: 'Austria', IE: 'Ireland', PL: 'Poland', CZ: 'Czechia',
  HU: 'Hungary', RU: 'Russia',
  CN: 'China', JP: 'Japan', KR: 'South Korea', TW: 'Taiwan',
  IN: 'India', SG: 'Singapore', MY: 'Malaysia',
  AU: 'Australia', NZ: 'New Zealand',
  IL: 'Israel', TR: 'Turkey', SA: 'Saudi Arabia', IR: 'Iran',
  ZA: 'South Africa', UG: 'Uganda', CM: 'Cameroon',
  PE: 'Peru',
};

// Approximate centroids (lon, lat) for countries in the flow data
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [-98, 39], CA: [-106, 56], MX: [-102, 23], BR: [-53, -10],
  GB: [-2, 54], FR: [2, 47], DE: [10, 51], IT: [12, 42],
  ES: [-4, 40], NL: [5.3, 52.1], BE: [4.5, 50.8], CH: [8.2, 46.8],
  SE: [15, 62], NO: [8, 61], DK: [10, 56], FI: [26, 64],
  AT: [14, 47.5], IE: [-8, 53.5], PL: [19, 52], CZ: [15, 50],
  HU: [19, 47], RU: [40, 55],
  CN: [104, 35], JP: [138, 36], KR: [128, 36], TW: [121, 24],
  IN: [79, 22], SG: [104, 1.3], MY: [102, 4],
  AU: [134, -25], NZ: [174, -41],
  IL: [35, 31.5], TR: [35, 39], SA: [45, 24], IR: [53, 32],
  ZA: [25, -29], UG: [32, 1], CM: [12, 6],
  PE: [-75, -10],
};

// Region mapping for arc coloring
const REGION_MAP: Record<string, string> = {
  US: 'Americas', CA: 'Americas', MX: 'Americas', BR: 'Americas', PE: 'Americas',
  GB: 'Europe', FR: 'Europe', DE: 'Europe', IT: 'Europe', ES: 'Europe',
  NL: 'Europe', BE: 'Europe', CH: 'Europe', SE: 'Europe', NO: 'Europe',
  DK: 'Europe', FI: 'Europe', AT: 'Europe', IE: 'Europe', PL: 'Europe',
  CZ: 'Europe', HU: 'Europe', RU: 'Europe',
  CN: 'East Asia', JP: 'East Asia', KR: 'East Asia', TW: 'East Asia',
  IN: 'South Asia', SG: 'South Asia', MY: 'South Asia',
  AU: 'Oceania', NZ: 'Oceania',
  IL: 'Middle East', TR: 'Middle East', SA: 'Middle East', IR: 'Middle East',
  ZA: 'Africa', UG: 'Africa', CM: 'Africa',
};

function getRegionColor(countryCode: string): string {
  const region = REGION_MAP[countryCode];
  return region ? (REGION_COLORS[region] ?? '#999999') : '#999999';
}

interface FlowEntry {
  from_country?: string;
  to_country?: string;
  flow_count: number;
}

interface PWWorldFlowMapProps {
  data: FlowEntry[];
  maxFlows?: number;
}

const COLOR_STEPS = [
  'hsl(202, 70%, 94%)',
  'hsl(202, 70%, 84%)',
  'hsl(202, 70%, 74%)',
  'hsl(202, 70%, 62%)',
  'hsl(202, 70%, 50%)',
  'hsl(202, 70%, 38%)',
];

export function PWWorldFlowMap({ data, maxFlows = 20 }: PWWorldFlowMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topo, setTopo] = useState<Topology | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/geo/world-110m.json`)
      .then((res) => res.json())
      .then((json) => setTopo(json as Topology));
  }, []);

  const projection = useMemo(() =>
    geoNaturalEarth1().scale(160).translate([480, 300]) as GeoProjection,
  []);
  const pathGen = useMemo(() => geoPath().projection(projection), [projection]);

  // Filter to only entries with both country fields
  const validData = useMemo(() =>
    data.filter((d): d is FlowEntry & { from_country: string; to_country: string } =>
      !!d.from_country && !!d.to_country
    ), [data]);

  // Compute total flows per country for coloring
  const countryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    validData.forEach((d) => {
      totals[d.from_country] = (totals[d.from_country] || 0) + d.flow_count;
      totals[d.to_country] = (totals[d.to_country] || 0) + d.flow_count;
    });
    return totals;
  }, [validData]);

  const colorScale = useMemo(() => {
    const vals = Object.values(countryTotals);
    if (vals.length === 0) return scaleQuantize<string>().domain([0, 1]).range(COLOR_STEPS);
    const max = Math.max(...vals);
    return scaleQuantize<string>().domain([0, max]).range(COLOR_STEPS);
  }, [countryTotals]);

  const features = useMemo(() => {
    if (!topo) return [];
    const geom = topo.objects.countries as GeometryCollection;
    return topojson.feature(topo, geom).features;
  }, [topo]);

  // Top flows for arc rendering
  const topFlows = useMemo(() => {
    return validData
      .filter((d) => COUNTRY_CENTROIDS[d.from_country] && COUNTRY_CENTROIDS[d.to_country])
      .slice(0, maxFlows);
  }, [validData, maxFlows]);

  const maxFlow = useMemo(() => {
    if (topFlows.length === 0) return 1;
    return Math.max(...topFlows.map((d) => d.flow_count));
  }, [topFlows]);

  // Scale for centroid dot radius
  const dotScale = useMemo(() => {
    const vals = Object.values(countryTotals);
    if (vals.length === 0) return scaleLinear().domain([0, 1]).range([2, 8]);
    return scaleLinear().domain([0, Math.max(...vals)]).range([2.5, 9]);
  }, [countryTotals]);

  // Countries that appear in flows (for rendering dots and labels)
  const flowCountries = useMemo(() => {
    const set = new Set<string>();
    topFlows.forEach((d) => {
      set.add(d.from_country);
      set.add(d.to_country);
    });
    return [...set].filter((c) => COUNTRY_CENTROIDS[c]);
  }, [topFlows]);

  // Top N countries by total flow for labels
  const labelCountries = useMemo(() => {
    return flowCountries
      .map((c) => ({ code: c, total: countryTotals[c] || 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((d) => d.code);
  }, [flowCountries, countryTotals]);

  // Track which country pairs have both directions to offset them
  const pairDirections = useMemo(() => {
    const pairs = new Set<string>();
    topFlows.forEach((f) => {
      const key = [f.from_country, f.to_country].sort().join('-');
      pairs.add(key);
    });
    const bidir = new Set<string>();
    topFlows.forEach((f) => {
      const rev = topFlows.find((r) => r.from_country === f.to_country && r.to_country === f.from_country);
      if (rev) bidir.add([f.from_country, f.to_country].sort().join('-'));
    });
    return bidir;
  }, [topFlows]);

  // Generate arc paths using great circle interpolation, offset bidirectional flows
  const arcPaths = useMemo(() => {
    return topFlows.map((flow) => {
      const from = COUNTRY_CENTROIDS[flow.from_country];
      const to = COUNTRY_CENTROIDS[flow.to_country];
      if (!from || !to) return null;
      const interp = geoInterpolate(from, to);
      const steps = 60;
      const points: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const pt = interp(t);
        const projected = projection(pt);
        if (projected) points.push(projected);
      }
      if (points.length < 2) return null;

      // Offset bidirectional flows perpendicular to the path
      const pairKey = [flow.from_country, flow.to_country].sort().join('-');
      const isBidir = pairDirections.has(pairKey);
      if (isBidir) {
        const isFirst = flow.from_country < flow.to_country;
        const offsetPx = isFirst ? 3 : -3;
        for (let i = 0; i < points.length; i++) {
          // Compute perpendicular direction at each point
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(points.length - 1, i + 1)];
          const dx = next[0] - prev[0];
          const dy = next[1] - prev[1];
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          points[i] = [points[i][0] + (-dy / len) * offsetPx, points[i][1] + (dx / len) * offsetPx];
        }
      }

      let d = `M${points[0][0]},${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L${points[i][0]},${points[i][1]}`;
      }
      const ratio = flow.flow_count / maxFlow;
      const sqrtRatio = Math.sqrt(ratio);
      const width = 1.2 + sqrtRatio * 6;
      const opacity = 0.25 + sqrtRatio * 0.65;
      const color = getRegionColor(flow.from_country);
      const destColor = getRegionColor(flow.to_country);
      return { d, width, opacity, flow, from_country: flow.from_country, to_country: flow.to_country, color, destColor };
    }).filter(Boolean) as { d: string; width: number; opacity: number; flow: FlowEntry; from_country: string; to_country: string; color: string; destColor: string }[];
  }, [topFlows, maxFlow, projection, pairDirections]);

  const handleMouseMove = useCallback((e: React.MouseEvent, abbrev: string) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const total = countryTotals[abbrev];
    if (total == null) return;
    const name = COUNTRY_NAMES[abbrev] || abbrev;
    const fmt = formatCompact(total);
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      content: `${name}: ${fmt} inventor moves`,
    });
    setHoveredCountry(abbrev);
  }, [countryTotals]);

  const handleArcHover = useCallback((e: React.MouseEvent, flow: FlowEntry) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const fromName = COUNTRY_NAMES[flow.from_country ?? ''] || flow.from_country;
    const toName = COUNTRY_NAMES[flow.to_country ?? ''] || flow.to_country;
    const fmt = formatCompact(flow.flow_count);
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      content: `${fromName} → ${toName}: ${fmt} moves`,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredCountry(null);
  }, []);

  if (!topo) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading map...</div>;

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex-1 min-h-0 relative">
        <svg ref={svgRef} viewBox="0 0 960 600" className="w-full h-full">
          <defs>
            {/* Per-region arrowhead markers */}
            {Object.entries(REGION_COLORS).map(([region, color]) => (
              <marker
                key={region}
                id={`arrow-${region.replace(/\s/g, '-')}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 8 5 L 0 8 Z" fill={color} fillOpacity={0.8} />
              </marker>
            ))}
            {/* Fallback arrowhead */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 Z" fill="#999999" fillOpacity={0.8} />
            </marker>
            {/* Glow filter for highlighted arcs */}
            <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Per-arc gradients from source to destination region color */}
            {arcPaths.map((arc, i) => {
              const fromPt = COUNTRY_CENTROIDS[arc.from_country];
              const toPt = COUNTRY_CENTROIDS[arc.to_country];
              if (!fromPt || !toPt) return null;
              const p1 = projection(fromPt);
              const p2 = projection(toPt);
              if (!p1 || !p2) return null;
              return (
                <linearGradient
                  key={`grad-${i}`}
                  id={`arc-grad-${i}`}
                  x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={arc.color} />
                  <stop offset="100%" stopColor={arc.destColor} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Country fills */}
          {features.map((feature) => {
            const numId = String(feature.id).padStart(3, '0');
            const alpha2 = NUM_TO_ALPHA2[numId];
            const total = alpha2 ? countryTotals[alpha2] : undefined;
            const fill = total != null ? colorScale(total) : 'hsl(var(--muted) / 0.3)';
            const isHovered = hoveredCountry === alpha2;
            const isConnected = hoveredCountry && alpha2 && topFlows.some(
              (f) => (f.from_country === hoveredCountry && f.to_country === alpha2) ||
                     (f.to_country === hoveredCountry && f.from_country === alpha2)
            );
            const dimmed = hoveredCountry && !isHovered && !isConnected && total != null;
            return (
              <path
                key={feature.id}
                d={pathGen(feature) ?? ''}
                fill={fill}
                stroke="hsl(var(--background))"
                strokeWidth={isHovered ? 1.5 : 0.5}
                opacity={dimmed ? 0.4 : 1}
                className="cursor-pointer"
                style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                onMouseMove={(e) => alpha2 && handleMouseMove(e, alpha2)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* Flow arcs - sorted so largest flows render on top */}
          {[...arcPaths]
            .map((arc, origIdx) => ({ arc, origIdx }))
            .sort((a, b) => a.arc.flow.flow_count - b.arc.flow.flow_count)
            .map(({ arc, origIdx }) => {
            const connected = hoveredCountry &&
              (arc.from_country === hoveredCountry || arc.to_country === hoveredCountry);
            const dimmed = hoveredCountry && !connected;
            const region = REGION_MAP[arc.from_country] ?? 'default';
            const markerId = `arrow-${region.replace(/\s/g, '-')}`;
            const useGradient = arc.color !== arc.destColor;
            return (
              <path
                key={origIdx}
                d={arc.d}
                fill="none"
                stroke={useGradient ? `url(#arc-grad-${origIdx})` : arc.color}
                strokeWidth={connected ? arc.width * 1.5 : arc.width}
                strokeOpacity={dimmed ? 0.08 : arc.opacity}
                strokeLinecap="round"
                markerEnd={`url(#${markerId})`}
                filter={connected ? 'url(#arc-glow)' : undefined}
                className="cursor-pointer"
                style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
                onMouseMove={(e) => handleArcHover(e, arc.flow)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* Country centroid dots */}
          {flowCountries.map((code) => {
            const centroid = COUNTRY_CENTROIDS[code];
            if (!centroid) return null;
            const projected = projection(centroid);
            if (!projected) return null;
            const total = countryTotals[code] || 0;
            const r = dotScale(total) as number;
            const isHovered = hoveredCountry === code;
            const connected = hoveredCountry && topFlows.some(
              (f) => (f.from_country === hoveredCountry && f.to_country === code) ||
                     (f.to_country === hoveredCountry && f.from_country === code)
            );
            const dimmed = hoveredCountry && !isHovered && !connected;
            return (
              <circle
                key={code}
                cx={projected[0]}
                cy={projected[1]}
                r={isHovered ? r * 1.4 : r}
                fill="#0072B2"
                fillOpacity={dimmed ? 0.2 : 0.85}
                stroke="hsl(var(--background))"
                strokeWidth={isHovered ? 1.5 : 0.8}
                className="cursor-pointer"
                style={{ transition: 'r 0.2s, fill-opacity 0.2s' }}
                onMouseMove={(e) => handleMouseMove(e, code)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* Country labels for top nodes */}
          {labelCountries.map((code) => {
            const centroid = COUNTRY_CENTROIDS[code];
            if (!centroid) return null;
            const projected = projection(centroid);
            if (!projected) return null;
            const total = countryTotals[code] || 0;
            const r = dotScale(total) as number;
            return (
              <text
                key={`label-${code}`}
                x={projected[0]}
                y={projected[1] - r - 3}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="hsl(var(--foreground))"
                fillOpacity={0.75}
                className="pointer-events-none select-none"
              >
                {code}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 rounded-md border bg-card px-3 py-1.5 text-sm shadow-md"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
          >
            {tooltip.content}
          </div>
        )}
      </div>

      {/* Legend - outside the SVG area with spacing */}
      <div className="flex flex-col items-center gap-2 pt-4 pb-2 text-xs text-muted-foreground">
        {/* Country fill scale */}
        <div className="flex items-center gap-1">
          <span>Low</span>
          {COLOR_STEPS.map((color, i) => (
            <div key={i} className="w-6 h-3 rounded-sm border border-border/30" style={{ backgroundColor: color }} />
          ))}
          <span>High</span>
          <span className="ml-1 opacity-70">(total moves)</span>
        </div>
        {/* Regional flow colors */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="font-medium">Flow origin:</span>
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1">
              <svg width="20" height="8" viewBox="0 0 20 8">
                <line x1="1" y1="4" x2="15" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <polygon points="15,1.5 20,4 15,6.5" fill={color} fillOpacity={0.8} />
              </svg>
              <span>{region}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
