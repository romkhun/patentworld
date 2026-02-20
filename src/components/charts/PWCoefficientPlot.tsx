'use client';

import { useMemo } from 'react';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ErrorBar, Cell, Label,
} from 'recharts';
import chartTheme from '@/lib/chartTheme';

interface CoefficientEntry {
  category: string;
  coefficient: number;
  se: number;
  ci_lower: number;
  ci_upper: number;
}

interface PWCoefficientPlotProps {
  data: CoefficientEntry[];
  xLabel?: string;
  yLabel?: string;
  referenceCategory?: string;
  colors?: string[];
}

export function PWCoefficientPlot({
  data,
  xLabel = 'Coefficient (cohort-normalized citations)',
  yLabel,
  referenceCategory = 'Solo',
  colors = CHART_COLORS,
}: PWCoefficientPlotProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      errorBarLower: d.coefficient - d.ci_lower,
      errorBarUpper: d.ci_upper - d.coefficient,
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 80, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        >
          {xLabel && (
            <Label
              value={xLabel}
              position="insideBottom"
              offset={-8}
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontFamily: chartTheme.fontFamily }}
            />
          )}
        </XAxis>
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))', fontFamily: chartTheme.fontFamily }}
          tickLine={false}
          axisLine={false}
          width={70}
        >
          {yLabel && (
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontFamily: chartTheme.fontFamily }}
              offset={-5}
            />
          )}
        </YAxis>
        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.6} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          content={(props: any) => {
            const d = props?.payload?.[0]?.payload;
            if (!d) return null;
            return (
              <div style={TOOLTIP_STYLE}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.category}</p>
                <p style={{ margin: '2px 0' }}>Coefficient [95% CI]: {d.coefficient.toFixed(4)} [{d.ci_lower.toFixed(4)}, {d.ci_upper.toFixed(4)}]</p>
              </div>
            );
          }}
        />
        <Bar dataKey="coefficient" isAnimationActive={false} barSize={18}>
          {chartData.map((entry, i) => (
            <Cell
              key={entry.category}
              fill={entry.category === referenceCategory ? 'hsl(var(--muted-foreground))' : colors[i % colors.length]}
              fillOpacity={entry.category === referenceCategory ? 0.3 : 0.8}
            />
          ))}
          <ErrorBar
            dataKey="errorBarUpper"
            width={6}
            strokeWidth={1.5}
            stroke="hsl(var(--foreground))"
            direction="x"
          />
          <ErrorBar
            dataKey="errorBarLower"
            width={6}
            strokeWidth={1.5}
            stroke="hsl(var(--foreground))"
            direction="x"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
