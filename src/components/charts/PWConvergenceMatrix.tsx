'use client';

import { useState, useMemo } from 'react';
import { TOOLTIP_STYLE } from '@/lib/colors';
import chartTheme from '@/lib/chartTheme';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import type { ConvergenceEntry } from '@/lib/types';

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface PWConvergenceMatrixProps {
  data: ConvergenceEntry[];
  eras: string[];
}

export function PWConvergenceMatrix({ data, eras }: PWConvergenceMatrixProps) {
  const [selectedEra, setSelectedEra] = useState(eras[eras.length - 1]);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null);

  const eraData = useMemo(() => {
    const map = new Map<string, ConvergenceEntry>();
    data
      .filter((d) => d.era === selectedEra)
      .forEach((d) => {
        map.set(`${d.section_row}-${d.section_col}`, d);
        // Mirror: fill both directions for the symmetric matrix
        map.set(`${d.section_col}-${d.section_row}`, { ...d, section_row: d.section_col, section_col: d.section_row });
      });
    return map;
  }, [data, selectedEra]);

  const maxPct = useMemo(() => {
    let max = 0;
    eraData.forEach((d) => { if (d.co_occurrence_pct > max) max = d.co_occurrence_pct; });
    return max;
  }, [eraData]);

  const getColor = (pct: number) => {
    if (pct === 0) return 'hsl(var(--muted) / 0.3)';
    const t = Math.pow(pct / maxPct, 0.6); // slight gamma for better visual spread
    return chartTheme.sequentialScale(t);
  };

  const getCellEntry = (row: string, col: string) => {
    if (row === col) return null;
    return eraData.get(`${row}-${col}`) ?? null;
  };

  const tooltipEntry = hoveredCell ? getCellEntry(hoveredCell.row, hoveredCell.col) : null;

  return (
    <div className="w-full">
      {/* Era selector tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        {eras.map((era) => (
          <button
            key={era}
            onClick={() => setSelectedEra(era)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedEra === era
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {era}
          </button>
        ))}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>
              <th className="w-10 h-10" />
              {SECTIONS.map((s) => (
                <th
                  key={s}
                  className="text-center text-xs font-medium text-muted-foreground px-1 pb-2"
                  style={{ minWidth: 56 }}
                >
                  <div className="font-bold text-foreground">{s}</div>
                  <div className="text-[10px] leading-tight">{CPC_SECTION_NAMES[s]?.split(' ')[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((row) => (
              <tr key={row}>
                <td className="text-right pr-2 text-xs font-medium text-muted-foreground" style={{ minWidth: 56 }}>
                  <span className="font-bold text-foreground">{row}</span>{' '}
                  <span className="text-[10px]">{CPC_SECTION_NAMES[row]?.split(' ')[0]}</span>
                </td>
                {SECTIONS.map((col) => {
                  const entry = getCellEntry(row, col);
                  const isDiagonal = row === col;
                  return (
                    <td
                      key={col}
                      className="relative text-center transition-all"
                      style={{
                        width: 56,
                        height: 56,
                        padding: 2,
                      }}
                      onMouseEnter={() => !isDiagonal && setHoveredCell({ row, col })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div
                        className="w-full h-full rounded-md flex items-center justify-center text-xs font-medium transition-all"
                        style={{
                          backgroundColor: isDiagonal
                            ? 'hsl(var(--muted) / 0.15)'
                            : getColor(entry?.co_occurrence_pct ?? 0),
                          color: isDiagonal
                            ? 'transparent'
                            : chartTheme.textColorForHsl(getColor(entry?.co_occurrence_pct ?? 0)),
                          border: hoveredCell?.row === row && hoveredCell?.col === col
                            ? '2px solid hsl(var(--primary))'
                            : '1px solid transparent',
                        }}
                      >
                        {!isDiagonal && entry ? `${entry.co_occurrence_pct.toFixed(1)}%` : isDiagonal ? '—' : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip / detail panel */}
      {tooltipEntry && (
        <div className="mt-4 text-center text-sm text-muted-foreground" style={TOOLTIP_STYLE}>
          <span className="font-semibold text-foreground">
            {CPC_SECTION_NAMES[tooltipEntry.section_row]} × {CPC_SECTION_NAMES[tooltipEntry.section_col]}
          </span>
          : {tooltipEntry.co_occurrence_pct.toFixed(2)}% of multi-section patents
          ({tooltipEntry.patent_count.toLocaleString('en-US')} patents)
        </div>
      )}

      {/* Color legend */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Low overlap</span>
        <div className="flex h-3">
          {[0.05, 0.15, 0.3, 0.5, 0.7, 0.9].map((t) => (
            <div
              key={t}
              className="w-6 h-full"
              style={{ backgroundColor: getColor(t * maxPct) }}
            />
          ))}
        </div>
        <span>High overlap</span>
      </div>
    </div>
  );
}
