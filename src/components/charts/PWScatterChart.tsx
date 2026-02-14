'use client';

import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis, ReferenceLine,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface PWScatterChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  colorKey: string;
  nameKey?: string;
  categories: string[];
  colors?: string[];
  tooltipFields?: { key: string; label: string }[];
  xLabel?: string;
  yLabel?: string;
  xFormatter?: (v: number) => string;
  yFormatter?: (v: number) => string;
  showMeanLines?: boolean;
}

export function PWScatterChart({
  data, xKey, yKey, colorKey, nameKey, categories, colors, tooltipFields, xLabel, yLabel, xFormatter, yFormatter, showMeanLines = false,
}: PWScatterChartProps) {
  const fmtX = xFormatter ?? formatCompact;
  const fmtY = yFormatter ?? formatCompact;
  const colorPalette = colors ?? CHART_COLORS;

  const grouped = categories.map((cat, i) => ({
    name: cat,
    data: data.filter((d) => String(d[colorKey]) === cat),
    color: colorPalette[i % colorPalette.length],
  }));

  // Compute mean values for crosshair reference lines
  const means = useMemo(() => {
    if (!showMeanLines || data.length === 0) return null;
    const xVals = data.map((d) => Number(d[xKey]) || 0);
    const yVals = data.map((d) => Number(d[yKey]) || 0);
    return {
      x: xVals.reduce((a, b) => a + b, 0) / xVals.length,
      y: yVals.reduce((a, b) => a + b, 0) / yVals.length,
    };
  }, [showMeanLines, data, xKey, yKey]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
        <XAxis
          dataKey={xKey}
          type="number"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v) => fmtX(v)}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          name={xLabel ?? xKey}
          label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 13, fill: 'hsl(var(--muted-foreground))' } : undefined}
          domain={['auto', 'auto']}
        />
        <YAxis
          dataKey={yKey}
          type="number"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v) => fmtY(v)}
          tickLine={false}
          axisLine={false}
          width={60}
          name={yLabel ?? yKey}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fontSize: 13, fill: 'hsl(var(--muted-foreground))' } : undefined}
          domain={['auto', 'auto']}
        />
        <ZAxis range={[20, 20]} />
        {means && (
          <>
            <ReferenceLine x={means.x} stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={means.y} stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={1} />
          </>
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            if (!d) return null;
            return (
              <div style={TOOLTIP_STYLE}>
                {nameKey && d[nameKey] && (
                  <div className="font-semibold text-sm mb-1">{d[nameKey]}</div>
                )}
                {tooltipFields?.map(({ key, label }) => (
                  <div key={key} className="text-xs text-muted-foreground">
                    {label}: {typeof d[key] === 'number' ? d[key].toLocaleString() : d[key]}
                  </div>
                ))}
                {!tooltipFields && (
                  <>
                    <div className="text-xs text-muted-foreground">{colorKey}: {d[colorKey]}</div>
                    <div className="text-xs text-muted-foreground">{xLabel ?? xKey}: {typeof d[xKey] === 'number' ? fmtX(d[xKey]) : d[xKey]}</div>
                    <div className="text-xs text-muted-foreground">{yLabel ?? yKey}: {typeof d[yKey] === 'number' ? fmtY(d[yKey]) : d[yKey]}</div>
                  </>
                )}
              </div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
          iconType="circle"
          iconSize={8}
        />
        {grouped.map((group) => (
          <Scatter
            key={group.name}
            name={group.name}
            data={group.data}
            fill={group.color}
            fillOpacity={data.length > 200 ? 0.4 : 0.7}
            isAnimationActive={false}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
