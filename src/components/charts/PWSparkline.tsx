'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface PWSparklineProps {
  data: { x: number; y: number }[];
  color?: string;
  width?: number;
  height?: number;
}

export function PWSparkline({ data, color = '#0072B2', width = 100, height = 24 }: PWSparklineProps) {
  if (!data || data.length < 2) return null;

  // Normalize to 0-1 range for shape-only display
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const range = maxY - minY || 1;
  const normalized = data.map(d => ({ x: d.x, y: (d.y - minY) / range }));

  return (
    <div style={{ width, height, display: 'inline-block' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={normalized} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
