'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

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

  // Adaptive scales based on network size
  const nodeCount = nodes.length;
  const maxPatents = Math.max(...nodes.map((n) => n.patents), 1);
  const maxWeight = Math.max(...edges.map((e) => e.weight), 1);

  // Scale node radii: smaller for large networks
  const radiusScale = useCallback((patents: number) => {
    const maxR = nodeCount > 100 ? 20 : nodeCount > 50 ? 24 : 30;
    const minR = nodeCount > 100 ? 2 : 3;
    return minR + (maxR - minR) * Math.sqrt(patents / maxPatents);
  }, [nodeCount, maxPatents]);

  const widthScale = (weight: number) => {
    return 0.3 + 2.5 * (weight / maxWeight);
  };
  const labelThreshold = radiusScale(maxPatents * (nodeCount > 100 ? 0.15 : 0.06));

  // Connection counts
  const connectionCount = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach((e) => {
      counts[e.source] = (counts[e.source] || 0) + 1;
      counts[e.target] = (counts[e.target] || 0) + 1;
    });
    return counts;
  }, [edges]);

  // Build and run simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simN: SimNode[] = nodes.map((n) => ({ ...n }));
    const simL: SimLink[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
    }));

    // Adaptive force parameters
    const chargeStrength = nodeCount > 100 ? -120 : nodeCount > 50 ? -180 : -200;
    const linkDistance = nodeCount > 100 ? 60 : nodeCount > 50 ? 80 : 100;

    const sim = forceSimulation<SimNode>(simN)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simL)
          .id((d) => d.id)
          .distance(linkDistance)
          .strength((d) => 0.3 + 0.7 * (d.weight / maxWeight))
      )
      .force('charge', forceManyBody().strength(chargeStrength))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => radiusScale(d.patents) + 1))
      .alphaDecay(0.015);

    simulationRef.current = sim;

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
  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    if (hoveredId) {
      ids.add(hoveredId);
      edges.forEach((e) => {
        if (e.source === hoveredId) ids.add(e.target);
        if (e.target === hoveredId) ids.add(e.source);
      });
    }
    return ids;
  }, [hoveredId, edges]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(5, Math.max(0.2, z * delta)));
  }, []);

  // Pan with middle-click or shift+click on background
  const handleBgMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
        y: panStartRef.current.panY + (e.clientY - panStartRef.current.y),
      });
    }
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(5, z * 1.3))}
          className="w-8 h-8 rounded border bg-card text-foreground flex items-center justify-center hover:bg-muted text-lg font-bold"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z / 1.3))}
          className="w-8 h-8 rounded border bg-card text-foreground flex items-center justify-center hover:bg-muted text-lg font-bold"
          title="Zoom out"
        >
          &minus;
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 rounded border bg-card text-foreground flex items-center justify-center hover:bg-muted text-xs"
          title="Reset view"
        >
          1:1
        </button>
      </div>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleBgMouseDown}
        onMouseMove={(e) => {
          handlePanMove(e);
          handleMouseMove(e);
        }}
        onMouseUp={() => {
          handlePanEnd();
          handleMouseUp();
        }}
        onMouseLeave={() => {
          handlePanEnd();
          handleMouseUp();
          setTooltip(null);
          setHoveredId(null);
        }}
        style={{ cursor: isPanning ? 'move' : draggedId ? 'grabbing' : 'default' }}
      >
        <g transform={`translate(${pan.x + dimensions.width / 2 * (1 - zoom)}, ${pan.y + dimensions.height / 2 * (1 - zoom)}) scale(${zoom})`}>
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
              strokeOpacity={isConnected ? 0.35 : 0.04}
            />
          );
        })}
        {/* Nodes */}
        {simNodes.map((node) => {
          const r = radiusScale(node.patents);
          const isConnected = !hoveredId || connectedIds.has(node.id);
          const isHovered = hoveredId === node.id;
          return (
            <g key={node.id}>
              <circle
                cx={node.x ?? 0}
                cy={node.y ?? 0}
                r={r}
                fill={nodeColor}
                fillOpacity={isConnected ? 0.8 : 0.08}
                stroke={isHovered ? '#fff' : nodeColor}
                strokeWidth={isHovered ? 2.5 : 1}
                strokeOpacity={isConnected ? 1 : 0.15}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onMouseEnter={() => {
                  if (!draggedId) {
                    setHoveredId(node.id);
                    setTooltip({
                      x: (node.x ?? 0) * zoom + pan.x + dimensions.width / 2 * (1 - zoom) + r + 8,
                      y: (node.y ?? 0) * zoom + pan.y + dimensions.height / 2 * (1 - zoom) - 10,
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
              {(r > labelThreshold || (hoveredId && connectedIds.has(node.id))) && (
                <text
                  x={node.x ?? 0}
                  y={(node.y ?? 0) + r + 11}
                  textAnchor="middle"
                  fontSize={isHovered ? 10 : 8}
                  fontWeight={isHovered ? 600 : 400}
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={isConnected ? 0.9 : 0.12}
                  pointerEvents="none"
                >
                  {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                </text>
              )}
            </g>
          );
        })}
        </g>
      </svg>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg border bg-card px-3 py-2 text-sm shadow-md"
          style={{
            left: Math.min(tooltip.x, dimensions.width - 230),
            top: Math.max(tooltip.y, 10),
            maxWidth: 240,
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
