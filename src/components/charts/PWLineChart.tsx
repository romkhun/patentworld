'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface PWLineChartProps {
  data: any[];
  xKey: string;
  lines: { key: string; name: string; color?: string }[];
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
}

export function PWLineChart({ data, xKey, lines, yFormatter }: PWLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          formatter={(value: any, name: any) => [
            yFormatter ? yFormatter(Number(value)) : formatCompact(Number(value)),
            name,
          ]}
        />
        {lines.length > 1 && <Legend />}
        {lines.map((line, i) => {
          const color = line.color ?? CHART_COLORS[i % CHART_COLORS.length];
          return (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: color }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
