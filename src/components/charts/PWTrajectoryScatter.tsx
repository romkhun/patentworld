'use client';

import { useState } from 'react';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ZAxis,
} from 'recharts';
import chartTheme from '@/lib/chartTheme';

interface TrajectoryPoint {
  x: number;
  y: number;
  label: string;
  period?: string;
}

interface TrajectoryDataset {
  name: string;
  points: TrajectoryPoint[];
  color?: string;
}

interface PWTrajectoryScatterProps {
  datasets: TrajectoryDataset[];
  xLabel?: string;
  yLabel?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  showArrows?: boolean;
}

export function PWTrajectoryScatter({
  datasets,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  showArrows = true,
}: PWTrajectoryScatterProps) {
  const [hoveredFirm, setHoveredFirm] = useState<string | null>(null);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
        <XAxis
          type="number"
          dataKey="x"
          domain={xDomain}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        >
          {xLabel && (
            <Label
              value={xLabel}
              position="insideBottom"
              offset={-12}
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontFamily: chartTheme.fontFamily }}
            />
          )}
        </XAxis>
        <YAxis
          type="number"
          dataKey="y"
          domain={yDomain}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={false}
          width={60}
        >
          {yLabel && (
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontFamily: chartTheme.fontFamily }}
              offset={-5}
            />
          )}
        </YAxis>
        <ZAxis range={[40, 40]} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          content={(props: any) => {
            const { payload } = props;
            if (!payload || payload.length === 0) return null;
            const d = payload[0]?.payload;
            if (!d) return null;
            return (
              <div style={TOOLTIP_STYLE}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.label}</p>
                {d.period && <p style={{ color: 'hsl(var(--muted-foreground))', margin: '2px 0' }}>Period: {d.period}</p>}
                <p style={{ margin: '2px 0' }}>X: {d.x?.toFixed(4)}</p>
                <p style={{ margin: '2px 0' }}>Y: {d.y?.toFixed(4)}</p>
              </div>
            );
          }}
        />
        {/* Render arrows as custom SVG elements */}
        {showArrows && (
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" fillOpacity={0.5} />
            </marker>
          </defs>
        )}
        {datasets.map((ds, i) => {
          const color = ds.color ?? CHART_COLORS[i % CHART_COLORS.length];
          const isDimmed = hoveredFirm !== null && hoveredFirm !== ds.name;
          return (
            <Scatter
              key={ds.name}
              name={ds.name}
              data={ds.points}
              fill={color}
              fillOpacity={isDimmed ? 0.15 : 0.8}
              strokeOpacity={isDimmed ? 0.15 : 1}
              isAnimationActive={false}
              onMouseEnter={() => setHoveredFirm(ds.name)}
              onMouseLeave={() => setHoveredFirm(null)}
            />
          );
        })}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
