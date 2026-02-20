'use client';

import { useState, useMemo } from 'react';

import { formatCompact } from '@/lib/formatters';

interface PWValueHeatmapProps {
  data: Record<string, any>[];
  rowKey: string;
  colKey: string;
  valueKey: string;
  rowLabels?: Record<string, string>;
  colLabels?: Record<string, string>;
  colorScale?: [string, string];
  valueFormatter?: (v: number) => string;
  rowLabel?: string;
  colLabel?: string;
}

function interpolateColor(color1: string, color2: string, t: number): string {
  const hex = (s: string) => parseInt(s, 16);
  const r1 = hex(color1.slice(1, 3)), g1 = hex(color1.slice(3, 5)), b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3)), g2 = hex(color2.slice(3, 5)), b2 = hex(color2.slice(5, 7));
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export function PWValueHeatmap({
  data,
  rowKey,
  colKey,
  valueKey,
  rowLabels = {},
  colLabels = {},
  colorScale = ['#f0f4ff', '#0072B2'],
  valueFormatter = formatCompact,
  rowLabel,
  colLabel,
}: PWValueHeatmapProps) {
  const [hovered, setHovered] = useState<{ row: string; col: string } | null>(null);

  const { rows, cols, valueMap, minVal, maxVal } = useMemo(() => {
    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    const vMap: Record<string, number> = {};
    let min = Infinity, max = -Infinity;
    for (const d of data) {
      const r = String(d[rowKey]);
      const c = String(d[colKey]);
      const v = Number(d[valueKey]);
      rowSet.add(r);
      colSet.add(c);
      vMap[`${r}|${c}`] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return {
      rows: Array.from(rowSet).sort(),
      cols: Array.from(colSet).sort(),
      valueMap: vMap,
      minVal: min,
      maxVal: max,
    };
  }, [data, rowKey, colKey, valueKey]);

  const getColor = (v: number | undefined) => {
    if (v == null || maxVal === minVal) return colorScale[0];
    const t = Math.pow((v - minVal) / (maxVal - minVal), 0.6);
    return interpolateColor(colorScale[0], colorScale[1], t);
  };

  return (
    <div className="w-full overflow-x-auto">
      {colLabel && (
        <div className="mb-1 text-center text-[11px] font-medium text-muted-foreground">{colLabel}</div>
      )}
      <div className="flex">
        {rowLabel && (
          <div className="mr-1 flex items-center">
            <span className="text-[11px] font-medium text-muted-foreground [writing-mode:vertical-lr] rotate-180">{rowLabel}</span>
          </div>
        )}
        <table className="w-full border-collapse text-xs" role="grid">
          <thead>
            <tr>
              <th className="p-1 text-right text-[10px] font-medium text-muted-foreground" />
              {cols.map((c) => (
                <th key={c} className="p-1 text-center text-[10px] font-medium text-muted-foreground">
                  {colLabels[c] ?? c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r}>
                <td className="pr-2 text-right text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  {rowLabels[r] ?? r}
                </td>
                {cols.map((c) => {
                  const val = valueMap[`${r}|${c}`];
                  const isHovered = hovered?.row === r && hovered?.col === c;
                  return (
                    <td
                      key={c}
                      className={`relative cursor-default border border-background p-0 text-center transition-all ${isHovered ? 'ring-2 ring-primary z-10' : ''}`}
                      style={{ backgroundColor: getColor(val) }}
                      onMouseEnter={() => setHovered({ row: r, col: c })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className="flex h-8 items-center justify-center text-[10px]" style={{ color: val != null && (val - minVal) / (maxVal - minVal) > 0.5 ? '#fff' : 'inherit' }}>
                        {val != null ? valueFormatter(val) : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Tooltip */}
      {hovered && (
        <div className="mt-2 text-xs text-muted-foreground">
          {rowLabels[hovered.row] ?? hovered.row} × {colLabels[hovered.col] ?? hovered.col}: <strong>{valueFormatter(valueMap[`${hovered.row}|${hovered.col}`] ?? 0)}</strong>
        </div>
      )}
      {/* Legend */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{valueFormatter(minVal)}</span>
        <div className="h-2 w-24 rounded" style={{ background: `linear-gradient(90deg, ${colorScale[0]}, ${colorScale[1]})` }} />
        <span>{valueFormatter(maxVal)}</span>
      </div>
    </div>
  );
}
