'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Label, ReferenceLine,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import chartTheme from '@/lib/chartTheme';

interface PWLollipopChartProps {
  data: any[];
  xKey: string;          // category key (displayed on y-axis)
  valueKey: string;      // value key (displayed on x-axis)
  valueName?: string;    // display name for legend/tooltip
  color?: string;        // single accent color
  colorByValue?: boolean; // use CHART_COLORS per row
  xLabel?: string;       // x-axis label (value axis)
  yLabel?: string;       // y-axis label (category axis)
  yFormatter?: (v: number) => string;
  showAvgLine?: boolean;
}

/* Custom bar shape: thin stem line + circle dot at the data value */
const LollipopShape = (props: any) => {
  const { x, y, width, height, fill, fillOpacity } = props;
  const dotRadius = 5;
  const dotX = x + width;
  const stemY = y + height / 2;
  return (
    <g>
      <line
        x1={x}
        y1={stemY}
        x2={dotX}
        y2={stemY}
        stroke={fill}
        strokeWidth={1.5}
        strokeOpacity={fillOpacity ?? 1}
      />
      <circle
        cx={dotX}
        cy={stemY}
        r={dotRadius}
        fill={fill}
        fillOpacity={fillOpacity ?? 1}
      />
    </g>
  );
};

export function PWLollipopChart({
  data, xKey, valueKey, valueName, color, colorByValue = false, xLabel, yLabel, yFormatter, showAvgLine = false,
}: PWLollipopChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Sort data descending by valueKey
  const sortedData = useMemo(
    () => [...data].sort((a, b) => (Number(b[valueKey]) || 0) - (Number(a[valueKey]) || 0)),
    [data, valueKey],
  );

  // Compute left margin for vertical layout based on longest label
  const labelWidth = useMemo(
    () =>
      Math.min(
        260,
        Math.max(
          110,
          ...sortedData.map((d) => {
            const label = String(d[xKey] ?? '');
            return label.length * 6.8 + 16;
          }),
        ),
      ),
    [sortedData, xKey],
  );

  // Compute average for reference line
  const avgValue = useMemo(() => {
    if (!showAvgLine) return undefined;
    const vals = sortedData.map((d) => Number(d[valueKey]) || 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
  }, [showAvgLine, sortedData, valueKey]);

  const accentColor = color ?? CHART_COLORS[0];
  const displayName = valueName ?? valueKey;

  const handleBarEnter = useCallback((_: any, idx: number) => setHoveredIdx(idx), []);
  const handleBarLeave = useCallback(() => setHoveredIdx(null), []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 10, left: labelWidth + 10, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical />
        <XAxis
          type="number"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={yFormatter ?? formatCompact}
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
          type="category"
          dataKey={xKey}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={false}
          width={labelWidth}
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
          <ReferenceLine x={avgValue} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: 'Average', position: 'top', fontSize: chartTheme.fontSize.tickLabel, fill: '#9ca3af' }} />
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'hsl(var(--muted-foreground) / 0.08)' }}
          formatter={(value: any) => [
            yFormatter ? yFormatter(Number(value)) : formatCompact(Number(value)),
            displayName,
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: chartTheme.fontSize.legend, fontFamily: chartTheme.fontFamily }}
          iconType="circle"
          iconSize={8}
          {...{ payload: [{ value: displayName, type: 'circle' as const, id: valueKey, color: colorByValue ? CHART_COLORS[0] : accentColor }] as any }}
        />
        <Bar
          dataKey={valueKey}
          name={displayName}
          fill={accentColor}
          barSize={2}
          shape={<LollipopShape />}
          isAnimationActive={false}
          onMouseEnter={handleBarEnter}
          onMouseLeave={handleBarLeave}
        >
          {colorByValue && sortedData.map((_, idx) => (
            <Cell
              key={idx}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              fillOpacity={hoveredIdx !== null && hoveredIdx !== idx ? 0.35 : 1}
            />
          ))}
          {!colorByValue && sortedData.map((_, idx) => (
            <Cell
              key={idx}
              fillOpacity={hoveredIdx !== null && hoveredIdx !== idx ? 0.35 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
