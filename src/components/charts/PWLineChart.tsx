'use client';

import { useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, ReferenceLine,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import type { ReferenceEvent } from '@/lib/referenceEvents';
import { timeAnnotations, type TimeEventKey } from './TimeAnnotations';

interface LineConfig {
  key: string;
  name: string;
  color?: string;
  yAxisId?: 'left' | 'right';
}

interface PWLineChartProps {
  data: any[];
  xKey: string;
  lines: LineConfig[];
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
  rightYLabel?: string;
  rightYFormatter?: (v: number) => string;
  referenceLines?: ReferenceEvent[];
  annotations?: TimeEventKey[];
}

export function PWLineChart({ data, xKey, lines, xLabel, yLabel, yFormatter, rightYLabel, rightYFormatter, referenceLines, annotations }: PWLineChartProps) {
  const hasRightAxis = lines.some((l) => l.yAxisId === 'right');
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  const handleLegendEnter = useCallback((o: any) => {
    setHoveredLine(o.dataKey ?? o.value);
  }, []);
  const handleLegendLeave = useCallback(() => {
    setHoveredLine(null);
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: hasRightAxis ? 10 : 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
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
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
            />
          )}
        </XAxis>
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yFormatter ?? formatCompact}
          width={60}
        >
          {yLabel && (
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
              offset={-5}
            />
          )}
        </YAxis>
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={rightYFormatter ?? formatCompact}
            width={60}
          >
            {rightYLabel && (
              <Label
                value={rightYLabel}
                angle={90}
                position="insideRight"
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
                offset={-5}
              />
            )}
          </YAxis>
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          formatter={(value: any, name: any) => {
            const line = lines.find((l) => l.name === name);
            const fmt = line?.yAxisId === 'right' ? (rightYFormatter ?? formatCompact) : (yFormatter ?? formatCompact);
            return [fmt(Number(value)), name];
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
          iconType="circle"
          iconSize={8}
          onMouseEnter={handleLegendEnter}
          onMouseLeave={handleLegendLeave}
        />
        {annotations && timeAnnotations(annotations)}
        {referenceLines?.map((ref) => (
          <ReferenceLine
            key={ref.x}
            x={ref.x}
            yAxisId="left"
            stroke={ref.color ?? '#9ca3af'}
            strokeDasharray="4 4"
            label={{ value: ref.label, position: 'top', fontSize: 11, fill: ref.color ?? '#9ca3af' }}
          />
        ))}
        {lines.map((line, i) => {
          const color = line.color ?? CHART_COLORS[i % CHART_COLORS.length];
          const isHovered = hoveredLine === line.key || hoveredLine === line.name;
          const isDimmed = hoveredLine !== null && !isHovered;
          return (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={color}
              strokeWidth={isHovered ? 3 : 2}
              strokeOpacity={isDimmed ? 0.2 : 1}
              dot={false}
              activeDot={isDimmed ? false : { r: 5, stroke: '#fff', strokeWidth: 2, fill: color }}
              yAxisId={line.yAxisId ?? 'left'}
              isAnimationActive={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
