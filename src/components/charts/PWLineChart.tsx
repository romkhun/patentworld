'use client';

import { useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, ReferenceLine, ReferenceArea, Text, Area, Brush,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import chartTheme from '@/lib/chartTheme';
import type { ReferenceEvent } from '@/lib/referenceEvents';
import { timeAnnotations, type TimeEventKey } from './TimeAnnotations';

interface LineConfig {
  key: string;
  name: string;
  color?: string;
  yAxisId?: 'left' | 'right';
  dashPattern?: string;
}

interface BandConfig {
  upperKey: string;
  lowerKey: string;
  color?: string;
  opacity?: number;
}

interface PWLineChartProps {
  data: any[];
  xKey: string;
  lines: LineConfig[];
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
  yDomain?: [number, number];
  rightYLabel?: string;
  rightYFormatter?: (v: number) => string;
  referenceLines?: ReferenceEvent[];
  annotations?: TimeEventKey[];
  showEndLabels?: boolean;
  truncationYear?: number;
  bands?: BandConfig[];
  brush?: boolean;
}

export function PWLineChart({ data, xKey, lines, xLabel, yLabel, yFormatter, yDomain, rightYLabel, rightYFormatter, referenceLines, annotations, showEndLabels, truncationYear, bands, brush }: PWLineChartProps) {
  const hasRightAxis = lines.some((l) => l.yAxisId === 'right');
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  const handleLegendEnter = useCallback((o: any) => {
    setHoveredLine(o.dataKey ?? o.value);
  }, []);
  const handleLegendLeave = useCallback(() => {
    setHoveredLine(null);
  }, []);

  const rightMargin = showEndLabels ? 100 : (hasRightAxis ? 10 : 10);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: rightMargin, left: 10, bottom: 5 }}>
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
          yAxisId="left"
          domain={yDomain}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
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
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel, fontFamily: chartTheme.fontFamily }}
              offset={-5}
            />
          )}
        </YAxis>
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
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
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel, fontFamily: chartTheme.fontFamily }}
                offset={-5}
              />
            )}
          </YAxis>
        )}
        {truncationYear != null && data.length > 0 && (
          <ReferenceArea
            x1={truncationYear}
            x2={data[data.length - 1]?.[xKey]}
            yAxisId="left"
            fill="currentColor"
            fillOpacity={0.04}
            strokeOpacity={0}
          />
        )}
        {truncationYear != null && (
          <ReferenceLine
            x={truncationYear}
            yAxisId="left"
            stroke="#999"
            strokeDasharray="6 4"
            label={{ value: 'Citation data incomplete', position: 'insideTopRight', fontSize: 10, fill: '#999' }}
          />
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          formatter={(value: any, name: any) => {
            const line = lines.find((l) => l.name === name);
            const fmt = line?.yAxisId === 'right' ? (rightYFormatter ?? formatCompact) : (yFormatter ?? formatCompact);
            return [fmt(Number(value)), name];
          }}
          content={truncationYear != null ? (props: any) => {
            const { payload, label } = props;
            if (!payload || payload.length === 0) return null;
            const yr = Number(label);
            const inTruncation = yr >= truncationYear;
            return (
              <div style={{ ...TOOLTIP_STYLE }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                {payload.map((entry: any, i: number) => {
                  const line = lines.find((l) => l.key === entry.dataKey || l.name === entry.name);
                  const fmt = line?.yAxisId === 'right' ? (rightYFormatter ?? formatCompact) : (yFormatter ?? formatCompact);
                  return (
                    <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
                      {entry.name}: {fmt(Number(entry.value))}
                    </p>
                  );
                })}
                {inTruncation && (
                  <p style={{ fontSize: 11, color: '#999', marginTop: 6, borderTop: '1px solid hsl(var(--border))', paddingTop: 4 }}>
                    ⚠ Citation counts for patents granted after {truncationYear} are subject to truncation: these patents have had fewer years to accumulate citations.
                  </p>
                )}
              </div>
            );
          } : undefined}
        />
        {brush && data.length > 15 && (
          <Brush
            dataKey={xKey}
            height={40}
            startIndex={Math.max(0, data.length - 15)}
            stroke="hsl(var(--border))"
            fill="hsl(var(--card))"
            tickFormatter={(v) => String(v)}
          />
        )}
        <Legend
          wrapperStyle={{ paddingTop: 8, fontSize: chartTheme.fontSize.legend, fontFamily: chartTheme.fontFamily }}
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
            label={{ value: ref.label, position: 'top', fontSize: chartTheme.fontSize.tickLabel, fill: ref.color ?? '#9ca3af' }}
          />
        ))}
        {bands?.map((band, i) => (
          <Area
            key={`band-${i}`}
            dataKey={band.upperKey}
            stroke="none"
            fill={band.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={band.opacity ?? 0.15}
            yAxisId="left"
            isAnimationActive={false}
            baseLine={data.map((d) => d[band.lowerKey] ?? 0)}
            type="monotone"
          />
        ))}
        {lines.map((line, i) => {
          const color = line.color ?? CHART_COLORS[i % CHART_COLORS.length];
          const isHovered = hoveredLine === line.key || hoveredLine === line.name;
          const isDimmed = hoveredLine !== null && !isHovered;
          const lastDataPoint = data && data.length > 0 ? data[data.length - 1] : null;
          return (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={color}
              strokeWidth={isHovered ? 4 : 2}
              strokeOpacity={isDimmed ? 0.15 : 1}
              strokeDasharray={line.dashPattern}
              dot={false}
              activeDot={isDimmed ? false : { r: 5, stroke: '#fff', strokeWidth: 2, fill: color }}
              yAxisId={line.yAxisId ?? 'left'}
              isAnimationActive={false}
            >
              {showEndLabels && lastDataPoint?.[line.key] != null && (
                <Label
                  position="right"
                  content={({ viewBox }: any) => {
                    if (!viewBox || viewBox.y == null) return null;
                    const label = line.name.length > 16 ? line.name.slice(0, 14) + '...' : line.name;
                    return (
                      <Text
                        x={(viewBox.x ?? 0) + 8}
                        y={viewBox.y}
                        fill={isDimmed ? 'hsl(var(--muted-foreground))' : color}
                        fontSize={chartTheme.fontSize.annotation}
                        fontWeight={isHovered ? chartTheme.fontWeight.title : chartTheme.fontWeight.regular}
                        dominantBaseline="central"
                        textAnchor="start"
                      >
                        {label}
                      </Text>
                    );
                  }}
                />
              )}
            </Line>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
