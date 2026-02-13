'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import { CHART_COLORS } from '@/lib/colors';
import type { NetworkNode, NetworkEdge } from '@/lib/types';

interface PWNetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  nodeColor?: string;
}

interface SimNode extends SimulationNodeDatum, NetworkNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  weight: number;
}

interface TooltipState {
  x: number;
  y: number;
  node: SimNode;
}

export function PWNetworkGraph({
  nodes,
  edges,
  nodeColor = CHART_COLORS[0],
}: PWNetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  // Responsive sizing
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

  // Scales
  const maxPatents = Math.max(...nodes.map((n) => n.patents), 1);
  const maxWeight = Math.max(...edges.map((e) => e.weight), 1);

  const radiusScale = (patents: number) => {
    return 4 + 26 * Math.sqrt(patents / maxPatents);
  };
  const widthScale = (weight: number) => {
    return 0.5 + 2.5 * (weight / maxWeight);
  };
  const labelThreshold = radiusScale(maxPatents * 0.08);

  // Build and run simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simN: SimNode[] = nodes.map((n) => ({ ...n }));
    const simL: SimLink[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
    }));

    const sim = forceSimulation<SimNode>(simN)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simL)
          .id((d) => d.id)
          .distance(100)
          .strength((d) => 0.3 + 0.7 * (d.weight / maxWeight))
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => radiusScale(d.patents) + 2))
      .alphaDecay(0.02);

    simulationRef.current = sim;

    // Throttled update at ~15fps
    let lastUpdate = 0;
    sim.on('tick', () => {
      const now = performance.now();
      if (now - lastUpdate > 66) {
        lastUpdate = now;
        setSimNodes([...simN]);
        setSimLinks([...simL]);
      }
    });

    sim.on('end', () => {
      setSimNodes([...simN]);
      setSimLinks([...simL]);
    });

    return () => {
      sim.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, dimensions.width, dimensions.height]);

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, node: SimNode) => {
      e.preventDefault();
      setDraggedId(node.id);
      const sim = simulationRef.current;
      if (sim) {
        sim.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedId) return;
      const sim = simulationRef.current;
      if (!sim) return;
      const svg = (e.target as Element).closest('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = simNodes.find((n) => n.id === draggedId);
      if (node) {
        node.fx = x;
        node.fy = y;
      }
    },
    [draggedId, simNodes]
  );

  const handleMouseUp = useCallback(() => {
    if (!draggedId) return;
    const sim = simulationRef.current;
    if (sim) {
      sim.alphaTarget(0);
    }
    setDraggedId(null);
  }, [draggedId]);

  // Connected set for hover highlighting
  const connectedIds = new Set<string>();
  if (hoveredId) {
    connectedIds.add(hoveredId);
    edges.forEach((e) => {
      if (e.source === hoveredId) connectedIds.add(e.target);
      if (e.target === hoveredId) connectedIds.add(e.source);
    });
  }

  const connectionCount: Record<string, number> = {};
  edges.forEach((e) => {
    connectionCount[e.source] = (connectionCount[e.source] || 0) + 1;
    connectionCount[e.target] = (connectionCount[e.target] || 0) + 1;
  });

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setTooltip(null);
          setHoveredId(null);
        }}
        style={{ cursor: draggedId ? 'grabbing' : 'default' }}
      >
        {/* Edges */}
        {simLinks.map((link, i) => {
          const s = link.source as SimNode;
          const t = link.target as SimNode;
          if (!s.x || !t.x) return null;
          const isConnected =
            !hoveredId ||
            (connectedIds.has(s.id) && connectedIds.has(t.id));
          return (
            <line
              key={`edge-${i}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={widthScale(link.weight)}
              strokeOpacity={isConnected ? 0.4 : 0.06}
            />
          );
        })}
        {/* Nodes */}
        {simNodes.map((node) => {
          const r = radiusScale(node.patents);
          const isConnected = !hoveredId || connectedIds.has(node.id);
          return (
            <g key={node.id}>
              <circle
                cx={node.x ?? 0}
                cy={node.y ?? 0}
                r={r}
                fill={nodeColor}
                fillOpacity={isConnected ? 0.8 : 0.12}
                stroke={hoveredId === node.id ? '#fff' : nodeColor}
                strokeWidth={hoveredId === node.id ? 2 : 1}
                strokeOpacity={isConnected ? 1 : 0.2}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onMouseEnter={() => {
                  if (!draggedId) {
                    setHoveredId(node.id);
                    setTooltip({
                      x: (node.x ?? 0) + r + 8,
                      y: (node.y ?? 0) - 10,
                      node,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (!draggedId) {
                    setHoveredId(null);
                    setTooltip(null);
                  }
                }}
              />
              {r > labelThreshold && (
                <text
                  x={node.x ?? 0}
                  y={(node.y ?? 0) + r + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={isConnected ? 0.9 : 0.15}
                  pointerEvents="none"
                >
                  {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg border bg-card px-3 py-2 text-sm shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            maxWidth: 220,
          }}
        >
          <div className="font-semibold">{tooltip.node.name}</div>
          <div className="text-muted-foreground text-xs mt-1">
            {tooltip.node.patents.toLocaleString()} patents
          </div>
          <div className="text-muted-foreground text-xs">
            {connectionCount[tooltip.node.id] ?? 0} connections
          </div>
        </div>
      )}
    </div>
  );
}
