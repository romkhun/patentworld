'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import chartTheme from '@/lib/chartTheme';

interface FanChartDataPoint {
  year: number;
  p10?: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p99?: number;
  mean?: number;
  system_median?: number;
}

interface PWFanChartProps {
  data: FanChartDataPoint[];
  yLabel?: string;
  yFormatter?: (v: number) => string;
  showP10P90?: boolean;
  showMean?: boolean;
  showSystemMedian?: boolean;
  color?: string;
}

export function PWFanChart({
  data,
  yLabel,
  yFormatter,
  showP10P90 = true,
  showMean = false,
  showSystemMedian = true,
  color = CHART_COLORS[0],
}: PWFanChartProps) {
  const fmt = yFormatter ?? formatCompact;

  // Transform data for stacked areas (bands)
  const chartData = data.map((d) => ({
    year: d.year,
    // Outer band: p10-p25 (bottom) and p75-p90 (top)
    p10_to_p25: showP10P90 ? (d.p25 - (d.p10 ?? d.p25)) : 0,
    p25_to_p50: d.p50 - d.p25,
    p50_to_p75: d.p75 - d.p50,
    p75_to_p90: showP10P90 ? (d.p90 - d.p75) : 0,
    // Baseline (offset)
    baseline: showP10P90 ? (d.p10 ?? d.p25) : d.p25,
    // Reference lines
    p50: d.p50,
    mean: d.mean,
    system_median: d.system_median,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmt}
          width={60}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel }, offset: -5 } : undefined}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = data.find((item) => item.year === label);
            if (!d) return null;
            return (
              <div style={TOOLTIP_STYLE}>
                <div className="font-semibold text-sm mb-1">{label}</div>
                {d.p99 !== undefined && <div className="text-xs text-muted-foreground">P99: {fmt(d.p99)}</div>}
                <div className="text-xs text-muted-foreground">P90: {fmt(d.p90)}</div>
                <div className="text-xs text-muted-foreground">P75: {fmt(d.p75)}</div>
                <div className="text-xs font-medium">Median: {fmt(d.p50)}</div>
                <div className="text-xs text-muted-foreground">P25: {fmt(d.p25)}</div>
                {d.p10 !== undefined && <div className="text-xs text-muted-foreground">P10: {fmt(d.p10)}</div>}
                {d.mean !== undefined && <div className="text-xs text-muted-foreground">Mean: {fmt(d.mean)}</div>}
                {d.system_median !== undefined && <div className="text-xs text-muted-foreground mt-1 border-t pt-1">System Median: {fmt(d.system_median)}</div>}
              </div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: chartTheme.fontSize.legend }}
          iconType="circle"
          iconSize={8}
        />

        {/* Invisible baseline to offset the stacked areas */}
        <Area
          type="monotone"
          dataKey="baseline"
          stackId="fan"
          fill="transparent"
          stroke="transparent"
          legendType="none"
          isAnimationActive={false}
        />

        {/* P10-P25 band (lightest) */}
        {showP10P90 && (
          <Area
            type="monotone"
            dataKey="p10_to_p25"
            stackId="fan"
            fill={color}
            fillOpacity={0.08}
            stroke="transparent"
            name="P10–P90"
          isAnimationActive={false}
          />
        )}

        {/* P25-P50 band */}
        <Area
          type="monotone"
          dataKey="p25_to_p50"
          stackId="fan"
          fill={color}
          fillOpacity={showP10P90 ? 0.2 : 0.15}
          stroke="transparent"
          name="P25–P75"
          isAnimationActive={false}
        />

        {/* P50-P75 band */}
        <Area
          type="monotone"
          dataKey="p50_to_p75"
          stackId="fan"
          fill={color}
          fillOpacity={showP10P90 ? 0.2 : 0.15}
          stroke="transparent"
          legendType="none"
          isAnimationActive={false}
        />

        {/* P75-P90 band (lightest) */}
        {showP10P90 && (
          <Area
            type="monotone"
            dataKey="p75_to_p90"
            stackId="fan"
            fill={color}
            fillOpacity={0.08}
            stroke="transparent"
            legendType="none"
          />
        )}

        {/* Median line */}
        <Line
          type="monotone"
          dataKey="p50"
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          name="Median"
          isAnimationActive={false}
        />

        {/* Mean line */}
        {showMean && (
          <Line
            type="monotone"
            dataKey="mean"
            stroke={CHART_COLORS[3]}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Mean"
            isAnimationActive={false}
          />
        )}

        {/* System median reference */}
        {showSystemMedian && (
          <Line
            type="monotone"
            dataKey="system_median"
            stroke="#9ca3af"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            name="System Median"
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
