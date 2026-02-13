'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Text,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';

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

function EndLabel({ viewBox, value, color }: any) {
  if (!viewBox || viewBox.y == null) return null;
  return (
    <Text
      x={(viewBox.x ?? 0) + 8}
      y={viewBox.y}
      fill={color}
      fontSize={10}
      dominantBaseline="central"
      textAnchor="start"
    >
      {value && value.length > 20 ? value.slice(0, 18) + '...' : value}
    </Text>
  );
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

  // Get last rank for each name to determine which have data at the end
  const lastYear = years[years.length - 1];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={pivoted} margin={{ top: 5, right: 140, left: 10, bottom: 5 }}>
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
          contentStyle={{ ...TOOLTIP_STYLE, maxWidth: '300px', fontSize: '12px' }}
          formatter={(value: any, name: any) => [
            value ? `#${value}` : 'N/A',
            truncate(String(name ?? '')),
          ]}
        />
        {names.map((name, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length];
          const lastEntry = data.find((d) => d[yearKey] === lastYear && d[nameKey] === name);
          return (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            >
              {lastEntry && (
                <Label
                  position="right"
                  content={<EndLabel value={name} color={color} />}
                />
              )}
            </Line>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
