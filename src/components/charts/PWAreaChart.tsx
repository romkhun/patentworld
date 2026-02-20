'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, ReferenceLine,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import chartTheme from '@/lib/chartTheme';
import type { ReferenceEvent } from '@/lib/referenceEvents';

interface PWAreaChartProps {
  data: any[];
  xKey: string;
  areas: { key: string; name: string; color?: string }[];
  stacked?: boolean;
  stackedPercent?: boolean;
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
  yDomain?: [number, number];
  referenceLines?: ReferenceEvent[];
}

export function PWAreaChart({ data, xKey, areas, stacked = false, stackedPercent = false, xLabel, yLabel, yFormatter, yDomain, referenceLines }: PWAreaChartProps) {
  const isStacked = stacked || stackedPercent;

  // For stacked charts, reverse legend order so it matches visual stacking (top of stack = top of legend)
  const reversedLegendPayload = useMemo(() => {
    if (!isStacked) return undefined;
    return [...areas].reverse().map((area, i) => {
      const origIdx = areas.length - 1 - i;
      return {
        value: area.name,
        type: 'circle' as const,
        id: area.key,
        color: area.color ?? CHART_COLORS[origIdx % CHART_COLORS.length],
      };
    });
  }, [areas, isStacked]);

  const processedData = useMemo(() => stackedPercent ? data.map((d) => {
    const total = areas.reduce((s, a) => s + (Number(d[a.key]) || 0), 0);
    if (total === 0) return d;
    const row: Record<string, unknown> = { [xKey]: d[xKey] };
    areas.forEach((a) => { row[a.key] = ((Number(d[a.key]) || 0) / total) * 100; });
    return row;
  }) : data, [data, xKey, areas, stackedPercent]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={processedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          {areas.map((area, i) => {
            const color = area.color ?? CHART_COLORS[i % CHART_COLORS.length];
            const safeKey = area.key.replace(/[^a-zA-Z0-9]/g, '_');
            return (
              <linearGradient key={area.key} id={`gradient-${safeKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        >
          {xLabel && (
            <Label
              value={xLabel}
              position="insideBottom"
              offset={-2}
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel, fontFamily: chartTheme.fontFamily }}
            />
          )}
        </XAxis>
        <YAxis
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={false}
          tickFormatter={stackedPercent ? (v) => `${Number(v).toFixed(0)}%` : (yFormatter ?? formatCompact)}
          width={60}
          domain={stackedPercent ? [0, 100] : (yDomain ?? undefined)}
          allowDataOverflow={stackedPercent || yDomain ? true : undefined}
          ticks={stackedPercent ? [0, 20, 40, 60, 80, 100] : undefined}
        >
          {yLabel && (
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel, fontFamily: chartTheme.fontFamily }}
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
          wrapperStyle={{ paddingTop: 8, fontSize: chartTheme.fontSize.legend, fontFamily: chartTheme.fontFamily }}
          iconType="circle"
          iconSize={8}
          {...(reversedLegendPayload ? { payload: reversedLegendPayload as any } : {})}
        />
        {referenceLines?.map((ref) => (
          <ReferenceLine
            key={ref.x}
            x={ref.x}
            stroke={ref.color ?? '#9ca3af'}
            strokeDasharray="4 4"
            label={{ value: ref.label, position: 'top', fontSize: chartTheme.fontSize.tickLabel, fill: ref.color ?? '#9ca3af' }}
          />
        ))}
        {areas.map((area, i) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stackId={stacked || stackedPercent ? 'stack' : undefined}
            fill={`url(#gradient-${area.key.replace(/[^a-zA-Z0-9]/g, '_')})`}
            stroke={area.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={1}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
