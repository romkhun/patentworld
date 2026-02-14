'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface SmallMultiplesProps {
  panels: {
    name: string;
    data: { x: number; y: number; ref?: number }[];
  }[];
  xLabel?: string;
  yLabel?: string;
  yFormatter?: (v: number) => string;
  referenceLine?: number;
  referenceLabel?: string;
  columns?: number;
  color?: string;
}

export function PWSmallMultiples({
  panels,
  xLabel,
  yLabel,
  yFormatter,
  referenceLine,
  referenceLabel,
  columns = 4,
  color = CHART_COLORS[0],
}: SmallMultiplesProps) {
  const fmt = yFormatter ?? formatCompact;

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {panels.map((panel) => (
        <div key={panel.name} className="rounded-lg border bg-card/50 p-3">
          <div className="mb-2 text-xs font-medium truncate" title={panel.name}>
            {panel.name}
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={panel.data} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="x"
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={3}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={fmt}
                  width={32}
                  tickCount={3}
                />
                <Tooltip
                  contentStyle={{ ...TOOLTIP_STYLE, fontSize: '12px', padding: '6px 10px' }}
                  formatter={(value: any) => [fmt(Number(value)), yLabel ?? 'Value']}
                  labelFormatter={(label) => `${xLabel ?? 'Year'}: ${label}`}
                />
                {referenceLine !== undefined && (
                  <ReferenceLine
                    y={referenceLine}
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                )}
                {/* System reference line from data */}
                {panel.data[0]?.ref !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="ref"
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    dot={false}
                    legendType="none"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
      {referenceLabel && (
        <div className="col-span-full text-xs text-muted-foreground mt-1">
          Dashed gray line: {referenceLabel}
        </div>
      )}
    </div>
  );
}
