'use client';

import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label,
} from 'recharts';
import chartTheme from '@/lib/chartTheme';

interface LorenzPoint {
  cum_patent_share: number;
  cum_blockbuster_share: number;
}

interface LorenzDataset {
  label: string;
  points: LorenzPoint[];
  gini: number;
  color?: string;
}

interface PWLorenzCurveProps {
  datasets: LorenzDataset[];
  xLabel?: string;
  yLabel?: string;
}

export function PWLorenzCurve({
  datasets,
  xLabel = 'Cumulative share of patents',
  yLabel = 'Cumulative share of blockbusters',
}: PWLorenzCurveProps) {
  // Merge datasets into a common array keyed by cum_patent_share
  // We'll use separate Line components for each dataset
  // Create a unified x-axis from 0 to 1
  const equalityLine = Array.from({ length: 21 }, (_, i) => ({
    x: i / 20,
    equality: i / 20,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
        <XAxis
          dataKey="cum_patent_share"
          type="number"
          domain={[0, 1]}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
        >
          <Label
            value={xLabel}
            position="insideBottom"
            offset={-12}
            style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontFamily: chartTheme.fontFamily }}
          />
        </XAxis>
        <YAxis
          type="number"
          domain={[0, 1]}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          width={50}
        >
          <Label
            value={yLabel}
            angle={-90}
            position="insideLeft"
            style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontFamily: chartTheme.fontFamily }}
            offset={-5}
          />
        </YAxis>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number | undefined, name: string | undefined) => [`${((value ?? 0) * 100).toFixed(1)}%`, name ?? '']}
          labelFormatter={(v: any) => `Patent share: ${((v as number) * 100).toFixed(1)}%`}
        />
        {/* 45-degree equality line */}
        <Line
          data={equalityLine}
          dataKey="equality"
          name="Perfect equality"
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="6 4"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
        />
        {/* Lorenz curves for each dataset */}
        {datasets.map((ds, i) => (
          <Line
            key={ds.label}
            data={ds.points}
            dataKey="cum_blockbuster_share"
            name={`${ds.label} (Gini: ${ds.gini.toFixed(3)})`}
            stroke={ds.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
