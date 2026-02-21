'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';
import chartTheme from '@/lib/chartTheme';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface SlopeItem {
  label: string;
  value1: number;
  value2: number;
  color?: string;
}

interface PWSlopeChartProps {
  data: SlopeItem[];
  period1Label: string;
  period2Label: string;
  valueFormatter?: (v: number) => string;
}

/* ------------------------------------------------------------------ */
/*  Tooltip component                                                   */
/* ------------------------------------------------------------------ */

interface TooltipInfo {
  x: number;
  y: number;
  item: SlopeItem;
  color: string;
}

function SlopeTooltip({
  info,
  period1Label,
  period2Label,
  formatter,
}: {
  info: TooltipInfo;
  period1Label: string;
  period2Label: string;
  formatter: (v: number) => string;
}) {
  const change = info.item.value2 - info.item.value1;
  const sign = change >= 0 ? '+' : '';
  return (
    <div
      style={{
        ...TOOLTIP_STYLE,
        position: 'absolute',
        left: info.x,
        top: info.y,
        transform: 'translate(-50%, -110%)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontWeight: chartTheme.fontWeight.title,
          fontSize: chartTheme.fontSize.tooltip,
          fontFamily: chartTheme.fontFamily,
          color: info.color,
          marginBottom: 4,
        }}
      >
        {info.item.label}
      </div>
      <div
        style={{
          fontSize: chartTheme.fontSize.tooltip,
          fontFamily: chartTheme.fontFamily,
          color: 'hsl(var(--foreground))',
          lineHeight: 1.5,
        }}
      >
        <div>{period1Label}: {formatter(info.item.value1)}</div>
        <div>{period2Label}: {formatter(info.item.value2)}</div>
        <div style={{ color: change >= 0 ? '#009E73' : '#D55E00', fontWeight: chartTheme.fontWeight.axisLabel }}>
          Change: {sign}{formatter(change)}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function PWSlopeChart({
  data,
  period1Label,
  period2Label,
  valueFormatter,
}: PWSlopeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const fmt = valueFormatter ?? formatCompact;

  // Responsive sizing via ResizeObserver (same pattern as PWNetworkGraph)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width, height } = dimensions;

  // Compute Y-scale domain from all values
  const { minVal, maxVal } = useMemo(() => {
    if (data.length === 0) return { minVal: 0, maxVal: 1 };
    const allValues = data.flatMap((d) => [d.value1, d.value2]);
    return {
      minVal: Math.min(...allValues),
      maxVal: Math.max(...allValues),
    };
  }, [data]);

  // Assign colors to each item
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.forEach((item, i) => {
      map[item.label] = item.color ?? CHART_COLORS[i % CHART_COLORS.length];
    });
    return map;
  }, [data]);

  // Layout constants
  const marginTop = 36;
  const marginBottom = 16;
  const leftColPct = 0.20;
  const centerPct = 0.60;

  const centerLeft = width * leftColPct;
  const centerRight = width * (leftColPct + centerPct);

  const plotTop = marginTop;
  const plotBottom = height - marginBottom;
  const range = maxVal - minVal || 1;

  // Y scale: highest value at top, lowest at bottom
  const yScale = useCallback(
    (value: number): number => {
      const t = (value - minVal) / range;
      return plotBottom - t * (plotBottom - plotTop);
    },
    [minVal, range, plotTop, plotBottom],
  );

  const handleMouseEnter = useCallback(
    (label: string, x: number, y: number, item: SlopeItem, color: string) => {
      setHoveredLabel(label);
      setTooltip({ x, y, item, color });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredLabel(null);
    setTooltip(null);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <svg
        width={width}
        height={height}
        style={{ fontFamily: chartTheme.fontFamily }}
        aria-hidden="true"
      >
        {/* Period header labels */}
        <text
          x={centerLeft}
          y={20}
          textAnchor="end"
          fontSize={chartTheme.fontSize.axisLabel}
          fontWeight={chartTheme.fontWeight.axisLabel}
          fill="hsl(var(--muted-foreground))"
        >
          {period1Label}
        </text>
        <text
          x={centerRight}
          y={20}
          textAnchor="start"
          fontSize={chartTheme.fontSize.axisLabel}
          fontWeight={chartTheme.fontWeight.axisLabel}
          fill="hsl(var(--muted-foreground))"
        >
          {period2Label}
        </text>

        {/* Vertical axis lines */}
        <line
          x1={centerLeft}
          y1={plotTop}
          x2={centerLeft}
          y2={plotBottom}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        <line
          x1={centerRight}
          y1={plotTop}
          x2={centerRight}
          y2={plotBottom}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />

        {/* Slope lines, dots, and labels for each data item */}
        {data.map((item) => {
          const color = colorMap[item.label];
          const isHovered = hoveredLabel === item.label;
          const isDimmed = hoveredLabel !== null && !isHovered;
          const y1 = yScale(item.value1);
          const y2 = yScale(item.value2);
          const opacity = isDimmed ? 0.2 : 1;
          const strokeW = isHovered ? 3 : 2;

          return (
            <g key={item.label}>
              {/* Connecting line */}
              <line
                x1={centerLeft}
                y1={y1}
                x2={centerRight}
                y2={y2}
                stroke={color}
                strokeWidth={strokeW}
                opacity={opacity}
                style={{ transition: 'opacity 0.15s, stroke-width 0.15s' }}
              />
              {/* Left dot */}
              <circle
                cx={centerLeft}
                cy={y1}
                r={5}
                fill={color}
                opacity={opacity}
                style={{ transition: 'opacity 0.15s' }}
              />
              {/* Right dot */}
              <circle
                cx={centerRight}
                cy={y2}
                r={5}
                fill={color}
                opacity={opacity}
                style={{ transition: 'opacity 0.15s' }}
              />

              {/* Left label + value */}
              <text
                x={centerLeft - 10}
                y={y1}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={chartTheme.fontSize.tickLabel}
                fontWeight={isHovered ? chartTheme.fontWeight.title : chartTheme.fontWeight.regular}
                fill={isDimmed ? 'hsl(var(--muted-foreground))' : color}
                opacity={isDimmed ? 0.4 : 1}
                style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGTextElement).ownerSVGElement?.getBoundingClientRect();
                  const offsetX = rect ? e.clientX - rect.left : centerLeft;
                  const offsetY = rect ? e.clientY - rect.top : y1;
                  handleMouseEnter(item.label, offsetX, offsetY, item, color);
                }}
                onMouseLeave={handleMouseLeave}
              >
                {item.label}  {fmt(item.value1)}
              </text>

              {/* Right label + value */}
              <text
                x={centerRight + 10}
                y={y2}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={chartTheme.fontSize.tickLabel}
                fontWeight={isHovered ? chartTheme.fontWeight.title : chartTheme.fontWeight.regular}
                fill={isDimmed ? 'hsl(var(--muted-foreground))' : color}
                opacity={isDimmed ? 0.4 : 1}
                style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGTextElement).ownerSVGElement?.getBoundingClientRect();
                  const offsetX = rect ? e.clientX - rect.left : centerRight;
                  const offsetY = rect ? e.clientY - rect.top : y2;
                  handleMouseEnter(item.label, offsetX, offsetY, item, color);
                }}
                onMouseLeave={handleMouseLeave}
              >
                {fmt(item.value2)}  {item.label}
              </text>

              {/* Invisible wider hit area for the line */}
              <line
                x1={centerLeft}
                y1={y1}
                x2={centerRight}
                y2={y2}
                stroke="transparent"
                strokeWidth={12}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGLineElement).ownerSVGElement?.getBoundingClientRect();
                  const offsetX = rect ? e.clientX - rect.left : (centerLeft + centerRight) / 2;
                  const offsetY = rect ? e.clientY - rect.top : (y1 + y2) / 2;
                  handleMouseEnter(item.label, offsetX, offsetY, item, color);
                }}
                onMouseMove={(e) => {
                  const rect = (e.target as SVGLineElement).ownerSVGElement?.getBoundingClientRect();
                  const offsetX = rect ? e.clientX - rect.left : (centerLeft + centerRight) / 2;
                  const offsetY = rect ? e.clientY - rect.top : (y1 + y2) / 2;
                  handleMouseEnter(item.label, offsetX, offsetY, item, color);
                }}
                onMouseLeave={handleMouseLeave}
              />
            </g>
          );
        })}
      </svg>

      {/* Custom tooltip rendered outside SVG for proper layering */}
      {tooltip && (
        <SlopeTooltip
          info={tooltip}
          period1Label={period1Label}
          period2Label={period2Label}
          formatter={fmt}
        />
      )}
    </div>
  );
}
