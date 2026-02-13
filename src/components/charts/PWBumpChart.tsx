'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/colors';

interface BumpChartEntry {
  year: number;
  [org: string]: number;
}

interface PWBumpChartProps {
  data: any[];
  nameKey: string;
  yearKey: string;
  rankKey: string;
  maxRank?: number;
}

export function PWBumpChart({ data, nameKey, yearKey, rankKey, maxRank = 20 }: PWBumpChartProps) {
  // Pivot data: each year becomes a row, each org gets a column with rank value
  const names = [...new Set(data.map((d) => d[nameKey]))];
  const years = [...new Set(data.map((d) => d[yearKey]))].sort((a, b) => a - b);

  const pivoted: BumpChartEntry[] = years.map((year) => {
    const row: any = { year };
    names.forEach((name) => {
      const entry = data.find((d) => d[yearKey] === year && d[nameKey] === name);
      row[name] = entry ? entry[rankKey] : null;
    });
    return row;
  });

  // Truncate long org names
  const truncate = (s: string) => s.length > 25 ? s.slice(0, 22) + '...' : s;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={pivoted} margin={{ top: 5, right: 120, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
        />
        <YAxis
          reversed
          domain={[1, maxRank]}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Rank', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '300px',
          }}
          formatter={(value: any, name: any) => [
            value ? `#${value}` : 'N/A',
            truncate(String(name ?? '')),
          ]}
        />
        {names.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
