'use client';

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';

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
}

export function PWScatterChart({
  data, xKey, yKey, colorKey, nameKey, categories, colors, tooltipFields, xLabel, yLabel,
}: PWScatterChartProps) {
  const colorPalette = colors ?? CHART_COLORS;

  const grouped = categories.map((cat, i) => ({
    name: cat,
    data: data.filter((d) => String(d[colorKey]) === cat),
    color: colorPalette[i % colorPalette.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey={xKey}
          type="number"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          name={xLabel ?? xKey}
          domain={['auto', 'auto']}
        />
        <YAxis
          dataKey={yKey}
          type="number"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          width={60}
          name={yLabel ?? yKey}
          domain={['auto', 'auto']}
        />
        <ZAxis range={[20, 20]} />
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
                    {label}: {d[key]}
                  </div>
                ))}
                {!tooltipFields && (
                  <>
                    <div className="text-xs text-muted-foreground">{colorKey}: {d[colorKey]}</div>
                    <div className="text-xs text-muted-foreground">{xKey}: {d[xKey]}</div>
                    <div className="text-xs text-muted-foreground">{yKey}: {d[yKey]}</div>
                  </>
                )}
              </div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 11 }}
          iconType="circle"
          iconSize={6}
        />
        {grouped.map((group) => (
          <Scatter
            key={group.name}
            name={group.name}
            data={group.data}
            fill={group.color}
            fillOpacity={0.7}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
