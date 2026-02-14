'use client';

import { useMemo, useState, useCallback } from 'react';
import { ribbon, chordDirected } from 'd3-chord';
import { arc as d3Arc } from 'd3-shape';
import { descending } from 'd3-array';
import { TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface ChordNode {
  name: string;
  color: string;
}

interface PWChordDiagramProps {
  nodes: ChordNode[];
  matrix: number[][];
  width?: number;
  height?: number;
  ariaLabel?: string;
}

export function PWChordDiagram({
  nodes,
  matrix,
  width = 700,
  height = 700,
  ariaLabel,
}: PWChordDiagramProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  const outerRadius = Math.min(width, height) / 2 - 40;
  const innerRadius = outerRadius - 20;

  const chordLayout = useMemo(() => {
    return chordDirected()
      .padAngle(0.04)
      .sortSubgroups(descending)(matrix);
  }, [matrix]);

  const arcGenerator = useMemo(() => {
    return d3Arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
  }, [innerRadius, outerRadius]);

  const ribbonGenerator = useMemo(() => {
    return ribbon<any, any>().radius(innerRadius);
  }, [innerRadius]);

  const handleArcHover = useCallback(
    (index: number | null, e?: React.MouseEvent) => {
      setHoveredIndex(index);
      if (index !== null && e) {
        const total = matrix[index].reduce((s, v) => s + v, 0);
        const received = matrix.reduce((s, row) => s + row[index], 0);
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          content: `${nodes[index].name}\nCitations given: ${formatCompact(total)}\nCitations received: ${formatCompact(received)}`,
        });
      } else {
        setTooltip(null);
      }
    },
    [matrix, nodes]
  );

  const handleRibbonHover = useCallback(
    (source: number, target: number, value: number, e?: React.MouseEvent) => {
      if (e) {
        const reverseValue = matrix[target]?.[source] ?? 0;
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          content: `${nodes[source].name} → ${nodes[target].name}: ${formatCompact(value)}\n${nodes[target].name} → ${nodes[source].name}: ${formatCompact(reverseValue)}`,
        });
      }
    },
    [matrix, nodes]
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
        className="w-full h-full"
        style={{ maxWidth: width, maxHeight: height }}
        role="img"
        aria-label={ariaLabel ?? `Chord diagram showing relationships between ${nodes.map(n => n.name).join(', ')}`}
      >
        {/* Arcs (outer ring) */}
        {chordLayout.groups.map((group) => {
          const isHighlighted =
            hoveredIndex === null || hoveredIndex === group.index;
          return (
            <g key={`arc-${group.index}`}>
              <path
                d={arcGenerator(group) ?? ''}
                fill={nodes[group.index]?.color ?? '#888'}
                fillOpacity={isHighlighted ? 0.9 : 0.2}
                stroke="hsl(var(--background))"
                strokeWidth={1}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
                onMouseEnter={(e) => handleArcHover(group.index, e)}
                onMouseMove={(e) => handleArcHover(group.index, e)}
                onMouseLeave={() => handleArcHover(null)}
              />
              {/* Labels */}
              {group.endAngle - group.startAngle > 0.08 && (
                <text
                  transform={(() => {
                    const angle =
                      ((group.startAngle + group.endAngle) / 2 * 180) /
                        Math.PI -
                      90;
                    const radius = outerRadius + 8;
                    return `rotate(${angle}) translate(${radius},0) ${angle > 90 ? 'rotate(180)' : ''}`;
                  })()}
                  textAnchor={
                    ((group.startAngle + group.endAngle) / 2 * 180) /
                      Math.PI -
                      90 >
                    90
                      ? 'end'
                      : 'start'
                  }
                  fontSize={9}
                  fill="hsl(var(--foreground))"
                  fillOpacity={isHighlighted ? 0.9 : 0.3}
                  style={{ transition: 'fill-opacity 0.2s' }}
                >
                  {(nodes[group.index]?.name ?? '').length > 16
                    ? (nodes[group.index]?.name ?? '').slice(0, 14) + '...'
                    : nodes[group.index]?.name ?? ''}
                </text>
              )}
            </g>
          );
        })}
        {/* Ribbons */}
        {chordLayout.map((ch, i) => {
          const isHighlighted =
            hoveredIndex === null ||
            hoveredIndex === ch.source.index ||
            hoveredIndex === ch.target.index;
          return (
            <path
              key={`ribbon-${i}`}
              d={ribbonGenerator(ch) ?? ''}
              fill={nodes[ch.source.index]?.color ?? '#888'}
              fillOpacity={isHighlighted ? 0.5 : 0.05}
              stroke={isHighlighted ? 'hsl(var(--foreground) / 0.15)' : 'none'}
              strokeWidth={0.5}
              style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
              onMouseEnter={(e) =>
                handleRibbonHover(
                  ch.source.index,
                  ch.target.index,
                  ch.source.value,
                  e
                )
              }
              onMouseMove={(e) =>
                handleRibbonHover(
                  ch.source.index,
                  ch.target.index,
                  ch.source.value,
                  e
                )
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </svg>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 rounded-lg border bg-card px-3 py-2 text-sm shadow-md"
          style={{
            ...TOOLTIP_STYLE,
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            maxWidth: 280,
            whiteSpace: 'pre-line',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
