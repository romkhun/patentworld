'use client';

import { useMemo, useState } from 'react';
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
  SankeyNode,
  SankeyLink,
} from 'd3-sankey';
import { TOOLTIP_STYLE } from '@/lib/colors';
import { formatCompact } from '@/lib/formatters';

interface SankeyNodeInput {
  name: string;
}

interface SankeyLinkInput {
  source: number;
  target: number;
  value: number;
}

interface PWSankeyDiagramProps {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
  width?: number;
  height?: number;
  ariaLabel?: string;
}

type SNode = SankeyNode<SankeyNodeInput, SankeyLinkInput>;
type SLink = SankeyLink<SankeyNodeInput, SankeyLinkInput>;

export function PWSankeyDiagram({
  nodes: inputNodes,
  links: inputLinks,
  width = 900,
  height = 600,
  ariaLabel,
}: PWSankeyDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  const { nodes, links } = useMemo(() => {
    if (inputNodes.length === 0 || inputLinks.length === 0)
      return { nodes: [] as SNode[], links: [] as SLink[] };

    const sankeyLayout = d3Sankey<SankeyNodeInput, SankeyLinkInput>()
      .nodeId(((d: any, i: number) => i) as any)
      .nodeWidth(16)
      .nodePadding(12)
      .nodeAlign(sankeyJustify)
      .extent([
        [20, 20],
        [width - 20, height - 20],
      ]);

    const graph = sankeyLayout({
      nodes: inputNodes.map((n) => ({ ...n })),
      links: inputLinks.map((l) => ({ ...l })),
    });

    return { nodes: graph.nodes, links: graph.links };
  }, [inputNodes, inputLinks, width, height]);

  const linkPath = sankeyLinkHorizontal();

  // Compute net flow per node for coloring
  const netFlow = useMemo(() => {
    const flows: Record<number, number> = {};
    inputLinks.forEach((l) => {
      flows[l.source] = (flows[l.source] ?? 0) - l.value;
      flows[l.target] = (flows[l.target] ?? 0) + l.value;
    });
    return flows;
  }, [inputLinks]);

  const nodeColor = (index: number) => {
    const nf = netFlow[index] ?? 0;
    if (nf > 0) return 'hsl(221, 83%, 53%)'; // net importer — blue
    if (nf < 0) return 'hsl(0, 84%, 60%)'; // net exporter — red
    return 'hsl(var(--muted-foreground))';
  };

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        role="img"
        aria-label={ariaLabel ?? `Sankey diagram showing flows between ${inputNodes.map(n => n.name).join(', ')}`}
      >
        {/* Links */}
        {links.map((link, i) => {
          const sourceIdx =
            typeof link.source === 'object'
              ? (link.source as SNode).index ?? 0
              : link.source;
          const targetIdx =
            typeof link.target === 'object'
              ? (link.target as SNode).index ?? 0
              : link.target;
          const isHighlighted =
            hoveredNode === null ||
            hoveredNode === sourceIdx ||
            hoveredNode === targetIdx;
          return (
            <path
              key={`link-${i}`}
              d={linkPath(link as any) ?? ''}
              fill="none"
              stroke={nodeColor(sourceIdx)}
              strokeWidth={Math.max(1, (link as any).width ?? 1)}
              strokeOpacity={isHighlighted ? 0.35 : 0.05}
              style={{ transition: 'stroke-opacity 0.2s' }}
              onMouseEnter={(e) => {
                const sName =
                  typeof link.source === 'object'
                    ? (link.source as SNode).name
                    : inputNodes[link.source as number]?.name;
                const tName =
                  typeof link.target === 'object'
                    ? (link.target as SNode).name
                    : inputNodes[link.target as number]?.name;
                setTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  content: `${sName} → ${tName}\n${formatCompact(link.value)} inventors`,
                });
              }}
              onMouseMove={(e) =>
                setTooltip((prev) =>
                  prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                )
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node, i) => {
          const x0 = (node as any).x0 ?? 0;
          const x1 = (node as any).x1 ?? 0;
          const y0 = (node as any).y0 ?? 0;
          const y1 = (node as any).y1 ?? 0;
          const isHighlighted = hoveredNode === null || hoveredNode === i;
          return (
            <g key={`node-${i}`}>
              <rect
                x={x0}
                y={y0}
                width={x1 - x0}
                height={Math.max(1, y1 - y0)}
                fill={nodeColor(i)}
                fillOpacity={isHighlighted ? 0.9 : 0.3}
                rx={2}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
                onMouseEnter={(e) => {
                  setHoveredNode(i);
                  const nf = netFlow[i] ?? 0;
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    content: `${node.name}\nNet flow: ${nf > 0 ? '+' : ''}${formatCompact(nf)} inventors`,
                  });
                }}
                onMouseMove={(e) =>
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                  )
                }
                onMouseLeave={() => {
                  setHoveredNode(null);
                  setTooltip(null);
                }}
              />
              {/* Label */}
              {y1 - y0 > 14 && (
                <text
                  x={x0 < width / 2 ? x1 + 6 : x0 - 6}
                  y={(y0 + y1) / 2}
                  textAnchor={x0 < width / 2 ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="hsl(var(--foreground))"
                  fillOpacity={isHighlighted ? 0.9 : 0.4}
                  style={{ transition: 'fill-opacity 0.2s' }}
                >
                  {node.name.length > 20
                    ? node.name.slice(0, 18) + '...'
                    : node.name}
                </text>
              )}
            </g>
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
