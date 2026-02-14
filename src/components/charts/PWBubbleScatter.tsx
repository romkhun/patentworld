'use client';

import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis,
  ReferenceLine, Label, Customized,
} from 'recharts';
import { CPC_SECTION_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import chartTheme from '@/lib/chartTheme';

interface BubbleDataPoint {
  company: string;
  x: number;
  y: number;
  size: number;
  section: string;
}

interface QuadrantLabel {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  label: string;
}

interface PWBubbleScatterProps {
  data: BubbleDataPoint[];
  xLabel: string;
  yLabel: string;
  xFormatter?: (v: number) => string;
  yFormatter?: (v: number) => string;
  xMidline?: number;
  yMidline?: number;
  quadrants?: QuadrantLabel[];
  labeledPoints?: string[];
}

export function PWBubbleScatter({
  data,
  xLabel,
  yLabel,
  xFormatter = (v) => `${v}%`,
  yFormatter = (v) => `${v}%`,
  xMidline,
  yMidline,
  quadrants: _quadrants,
  labeledPoints,
}: PWBubbleScatterProps) {
  const sections = useMemo(() => [...new Set(data.map((d) => d.section))].sort(), [data]);

  const grouped = useMemo(
    () => sections.map((section) => ({
      section,
      data: data.filter((d) => d.section === section),
      color: CPC_SECTION_COLORS[section] ?? '#999999',
    })),
    [data, sections]
  );

  const maxSize = data.length > 0 ? Math.max(...data.map((d) => d.size)) : 1;
  const minSize = data.length > 0 ? Math.min(...data.map((d) => d.size)) : 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
        <XAxis
          dataKey="x"
          type="number"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={xFormatter}
          domain={['auto', 'auto']}
        >
          <Label
            value={xLabel}
            position="insideBottom"
            offset={-5}
            style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel }}
          />
        </XAxis>
        <YAxis
          dataKey="y"
          type="number"
          tick={{ fontSize: chartTheme.fontSize.tickLabel, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yFormatter}
          width={60}
          domain={['auto', 'auto']}
        >
          <Label
            value={yLabel}
            angle={-90}
            position="insideLeft"
            offset={10}
            style={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartTheme.fontSize.axisLabel, fontWeight: chartTheme.fontWeight.axisLabel }}
          />
        </YAxis>
        <ZAxis
          dataKey="size"
          range={[40, 400]}
          domain={[minSize, maxSize]}
        />

        {xMidline !== undefined && (
          <ReferenceLine x={xMidline} stroke="#9ca3af" strokeDasharray="6 3" />
        )}
        {yMidline !== undefined && (
          <ReferenceLine y={yMidline} stroke="#9ca3af" strokeDasharray="6 3" />
        )}

        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            if (!d) return null;
            return (
              <div style={TOOLTIP_STYLE}>
                <div className="font-semibold text-sm mb-1">{d.company}</div>
                <div className="text-xs text-muted-foreground">{xLabel}: {xFormatter(d.x)}</div>
                <div className="text-xs text-muted-foreground">{yLabel}: {yFormatter(d.y)}</div>
                <div className="text-xs text-muted-foreground">Patents: {d.size.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  Section: {d.section} ({CPC_SECTION_NAMES[d.section] ?? d.section})
                </div>
              </div>
            );
          }}
        />

        {grouped.map((group) => (
          <Scatter
            key={group.section}
            name={`${group.section}: ${CPC_SECTION_NAMES[group.section] ?? group.section}`}
            data={group.data}
            fill={group.color}
            fillOpacity={0.7}
            isAnimationActive={false}
          />
        ))}

        {labeledPoints && labeledPoints.length > 0 && (
          <Customized
            component={(props: any) => {
              const xAxis = props.xAxisMap?.[0] ?? Object.values(props.xAxisMap ?? {})[0];
              const yAxis = props.yAxisMap?.[0] ?? Object.values(props.yAxisMap ?? {})[0];
              if (!xAxis?.scale || !yAxis?.scale) return null;
              const labelSet = new Set(labeledPoints);
              return (
                <g>
                  {data
                    .filter((d) => labelSet.has(d.company))
                    .map((d) => {
                      const cx = xAxis.scale(d.x);
                      const cy = yAxis.scale(d.y);
                      if (cx == null || cy == null || isNaN(cx) || isNaN(cy)) return null;
                      return (
                        <text
                          key={d.company}
                          x={cx + 10}
                          y={cy - 8}
                          fontSize={11}
                          fill="hsl(var(--foreground))"
                          pointerEvents="none"
                        >
                          {d.company}
                        </text>
                      );
                    })}
                </g>
              );
            }}
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
