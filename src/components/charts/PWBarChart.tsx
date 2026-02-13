'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface PWBarChartProps {
  data: any[];
  xKey: string;
  bars: { key: string; name: string; color?: string }[];
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
  colorByValue?: boolean;
  yFormatter?: (v: number) => string;
}

export function PWBarChart({
  data, xKey, bars, layout = 'horizontal', stacked = false, colorByValue = false, yFormatter,
}: PWBarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={isVertical ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: isVertical ? 120 : 10, bottom: 5 }}
        barCategoryGap={isVertical ? '20%' : '15%'}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={yFormatter ?? formatCompact}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yFormatter ?? formatCompact}
              width={60}
            />
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
        {bars.length > 1 && <Legend />}
        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          >
            {colorByValue && data.map((_, idx) => (
              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
