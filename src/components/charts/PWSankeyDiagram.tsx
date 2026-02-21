'use client';

import { useMemo, useState } from 'react';
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
  SankeyNode,
  SankeyLink,
} from 'd3-sankey';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
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

    // d3-sankey requires a DAG. Resolve bidirectional pairs into net flows,
    // then break any remaining cycles via DFS back-edge removal.
    const linkMap = new Map<string, { source: number; target: number; value: number }>();
    for (const l of inputLinks) {
      const fwdKey = `${l.source}->${l.target}`;
      const revKey = `${l.target}->${l.source}`;
      if (linkMap.has(revKey)) {
        const rev = linkMap.get(revKey)!;
        const net = rev.value - l.value;
        if (net > 0) {
          rev.value = net;
        } else if (net < 0) {
          linkMap.delete(revKey);
          linkMap.set(fwdKey, { source: l.source, target: l.target, value: -net });
        } else {
          linkMap.delete(revKey);
        }
      } else {
        linkMap.set(fwdKey, { source: l.source, target: l.target, value: l.value });
      }
    }
    let acyclicLinks = Array.from(linkMap.values()).filter(l => l.value > 0 && l.source !== l.target);

    // Break remaining cycles: DFS to find and remove back edges (smallest value first)
    const adj: Record<number, { target: number; key: string }[]> = {};
    const edgeByKey = new Map<string, typeof acyclicLinks[0]>();
    for (const l of acyclicLinks) {
      const key = `${l.source}->${l.target}`;
      edgeByKey.set(key, l);
      (adj[l.source] ??= []).push({ target: l.target, key });
    }
    const removed = new Set<string>();
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color: Record<number, number> = {};
    function dfs(u: number) {
      color[u] = GRAY;
      for (const { target: v, key } of adj[u] ?? []) {
        if (removed.has(key)) continue;
        if (color[v] === GRAY) {
          removed.add(key); // back edge — break cycle
        } else if ((color[v] ?? WHITE) === WHITE) {
          dfs(v);
        }
      }
      color[u] = BLACK;
    }
    const allNodes = new Set<number>();
    acyclicLinks.forEach(l => { allNodes.add(l.source); allNodes.add(l.target); });
    for (const n of allNodes) {
      if ((color[n] ?? WHITE) === WHITE) dfs(n);
    }
    if (removed.size > 0) {
      acyclicLinks = acyclicLinks.filter(l => !removed.has(`${l.source}->${l.target}`));
    }

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
      links: acyclicLinks.map((l) => ({ ...l })),
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
    if (nf > 0) return CHART_COLORS[0]; // net importer — blue
    if (nf < 0) return CHART_COLORS[5]; // net exporter — red-orange
    return 'hsl(var(--muted-foreground))';
  };

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        aria-hidden="true"
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
