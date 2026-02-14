'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Label, ReferenceLine,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import chartTheme from '@/lib/chartTheme';

interface PWBarChartProps {
  data: any[];
  xKey: string;
  bars: { key: string; name: string; color?: string }[];
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
  colorByValue?: boolean;
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
  xDomain?: [number, number];
  showAvgLine?: boolean;
}

export function PWBarChart({
  data, xKey, bars, layout = 'horizontal', stacked = false, colorByValue = false, xLabel, yLabel, yFormatter, xDomain, showAvgLine = false,
}: PWBarChartProps) {
  const isVertical = layout === 'vertical';
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute left margin for vertical bars based on longest label
  const labelWidth = useMemo(() => isVertical
    ? Math.min(
        260,
        Math.max(
          110,
          ...data.map((d) => {
            const label = String(d[xKey] ?? '');
            return label.length * 6.8 + 16;
          })
        )
      )
    : 10, [isVertical, data, xKey]);

  // Compute average for reference line
  const avgValue = useMemo(() => {
    if (!showAvgLine || bars.length === 0) return undefined;
    const key = bars[0].key;
    const vals = data.map((d) => Number(d[key]) || 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [showAvgLine, data, bars]);

  // For stacked bar charts, reverse legend order so it matches visual stacking (top of stack = top of legend)
  const reversedLegendPayload = useMemo(() => {
    if (!stacked) return undefined;
    return [...bars].reverse().map((bar, i) => {
      const origIdx = bars.length - 1 - i;
      return {
        value: bar.name,
        type: 'circle' as const,
        id: bar.key,
        color: bar.color ?? CHART_COLORS[origIdx % CHART_COLORS.length],
      };
    });
  }, [bars, stacked]);

  const handleBarEnter = useCallback((_: any, idx: number) => setHoveredIdx(idx), []);
  const handleBarLeave = useCallback(() => setHoveredIdx(null), []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={isVertical ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: isVertical ? labelWidth + 10 : 10, bottom: 5 }}
        barCategoryGap={isVertical ? '20%' : '15%'}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} horizontal={!isVertical} vertical={isVertical} />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={yFormatter ?? formatCompact}
              domain={xDomain}
              allowDataOverflow={!!xDomain}
              ticks={xDomain ? [0, 20, 40, 60, 80, 100] : undefined}
            >
              {yLabel && (
                <Label
                  value={yLabel}
                  position="insideBottom"
                  offset={-2}
                  style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel, fontFamily: chartTheme.fontFamily }}
                />
              )}
            </XAxis>
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
              tickLine={false}
              axisLine={false}
              width={labelWidth}
            >
              {xLabel && (
                <Label
                  value={xLabel}
                  angle={-90}
                  position="insideLeft"
                  style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel, fontFamily: chartTheme.fontFamily }}
                  offset={-5}
                />
              )}
            </YAxis>
            {avgValue !== undefined && (
              <ReferenceLine x={avgValue} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: 'Average', position: 'top', fontSize: 11, fill: '#9ca3af' }} />
            )}
          </>
        ) : (
          <>
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
            {avgValue !== undefined && (
              <ReferenceLine y={avgValue} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: 'Average', position: 'right', fontSize: 11, fill: '#9ca3af' }} />
            )}
          </>
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'hsl(var(--muted-foreground) / 0.08)' }}
          formatter={(value: any, name: any) => [
            yFormatter ? yFormatter(Number(value)) : formatCompact(Number(value)),
            name,
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: chartTheme.fontSize.legend, fontFamily: chartTheme.fontFamily }}
          iconType="circle"
          iconSize={8}
          {...(reversedLegendPayload ? { payload: reversedLegendPayload as any } : {})}
        />
        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            isAnimationActive={false}
            onMouseEnter={handleBarEnter}
            onMouseLeave={handleBarLeave}
          >
            {colorByValue && data.map((_, idx) => (
              <Cell
                key={idx}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                fillOpacity={hoveredIdx !== null && hoveredIdx !== idx ? 0.5 : 1}
              />
            ))}
            {!colorByValue && data.map((_, idx) => (
              <Cell
                key={idx}
                fillOpacity={hoveredIdx !== null && hoveredIdx !== idx ? 0.7 : 1}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
