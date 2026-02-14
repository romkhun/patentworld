'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import chartTheme from '@/lib/chartTheme';

interface PWRadarChartProps {
  data: { dimension: string; [company: string]: number | string }[];
  companies: string[];
  colors?: Record<string, string>;
}

export function PWRadarChart({
  data,
  companies,
  colors,
}: PWRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid
          stroke="hsl(var(--border))"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
          tickCount={5}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: any, name: any) => [
            `${Number(value).toFixed(0)}`,
            name,
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: chartTheme.fontSize.legend }}
          iconType="circle"
          iconSize={8}
        />
        {companies.map((company, i) => (
          <Radar
            key={company}
            name={company}
            dataKey={company}
            stroke={colors?.[company] ?? CHART_COLORS[i % CHART_COLORS.length]}
            fill={colors?.[company] ?? CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fillOpacity: 0.8 }}
            isAnimationActive={false}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
