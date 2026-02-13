'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface PWAreaChartProps {
  data: any[];
  xKey: string;
  areas: { key: string; name: string; color?: string }[];
  stacked?: boolean;
  stackedPercent?: boolean;
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
}

export function PWAreaChart({ data, xKey, areas, stacked = false, stackedPercent = false, xLabel, yLabel, yFormatter }: PWAreaChartProps) {
  const processedData = stackedPercent ? data.map((d) => {
    const total = areas.reduce((s, a) => s + (Number(d[a.key]) || 0), 0);
    if (total === 0) return d;
    const row: any = { [xKey]: d[xKey] };
    areas.forEach((a) => { row[a.key] = ((Number(d[a.key]) || 0) / total) * 100; });
    return row;
  }) : data;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={processedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          {areas.map((area, i) => {
            const color = area.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        >
          {xLabel && (
            <Label
              value={xLabel}
              position="insideBottom"
              offset={-2}
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
          )}
        </XAxis>
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={stackedPercent ? (v) => `${v}%` : (yFormatter ?? formatCompact)}
          width={60}
          domain={stackedPercent ? [0, 100] : undefined}
          allowDataOverflow={stackedPercent || undefined}
          ticks={stackedPercent ? [0, 20, 40, 60, 80, 100] : undefined}
        >
          {yLabel && (
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              offset={-5}
            />
          )}
        </YAxis>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: any, name: any) => [
            stackedPercent ? `${Number(value).toFixed(1)}%` : (yFormatter ? yFormatter(Number(value)) : formatCompact(Number(value))),
            name,
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
          iconType="circle"
          iconSize={8}
        />
        {areas.map((area, i) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stackId={stacked || stackedPercent ? 'stack' : undefined}
            fill={`url(#gradient-${area.key})`}
            stroke={area.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
