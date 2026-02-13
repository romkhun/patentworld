'use client';

import { useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Text,
} from 'recharts';
import { BUMP_COLORS, TOOLTIP_STYLE } from '@/lib/colors';

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

function EndLabel({ viewBox, value, color, highlighted, onEnter, onLeave }: any) {
  if (!viewBox || viewBox.y == null) return null;
  return (
    <Text
      x={(viewBox.x ?? 0) + 8}
      y={viewBox.y}
      fill={color}
      fontSize={11}
      fontWeight={highlighted ? 700 : 500}
      dominantBaseline="central"
      textAnchor="start"
      style={{ cursor: 'pointer' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {value && value.length > 22 ? value.slice(0, 20) + '...' : value}
    </Text>
  );
}

export function PWBumpChart({ data, nameKey, yearKey, rankKey, maxRank = 15 }: PWBumpChartProps) {
  const [highlightedName, setHighlightedName] = useState<string | null>(null);

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

  const truncate = (s: string) => s.length > 28 ? s.slice(0, 25) + '...' : s;

  const lastYear = years[years.length - 1];

  const handleEnter = useCallback((name: string) => setHighlightedName(name), []);
  const handleLeave = useCallback(() => setHighlightedName(null), []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={pivoted} margin={{ top: 5, right: 160, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
        />
        <YAxis
          reversed
          domain={[1, maxRank]}
          ticks={Array.from({ length: maxRank }, (_, i) => i + 1)}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Rank', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
        />
        <Tooltip
          contentStyle={{ ...TOOLTIP_STYLE, maxWidth: '320px', fontSize: '12px' }}
          formatter={(value: any, name: any) => [
            value ? `#${value}` : 'N/A',
            truncate(String(name ?? '')),
          ]}
        />
        {names.map((name, i) => {
          const color = BUMP_COLORS[i % BUMP_COLORS.length];
          const lastEntry = data.find((d) => d[yearKey] === lastYear && d[nameKey] === name);
          const isHighlighted = highlightedName === name;
          const isDimmed = highlightedName !== null && !isHighlighted;
          return (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={isHighlighted ? 4 : (isDimmed ? 1.5 : 2.5)}
              strokeOpacity={isDimmed ? 0.12 : 1}
              dot={false}
              connectNulls={false}
              activeDot={isDimmed ? false : { r: 5, stroke: '#fff', strokeWidth: 2, fill: color }}
            >
              {lastEntry && (
                <Label
                  position="right"
                  content={
                    <EndLabel
                      value={name}
                      color={isDimmed ? 'hsl(var(--muted-foreground))' : color}
                      highlighted={isHighlighted}
                      onEnter={() => handleEnter(name)}
                      onLeave={handleLeave}
                    />
                  }
                />
              )}
            </Line>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
