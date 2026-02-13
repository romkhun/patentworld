'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import { CHART_COLORS } from '@/lib/colors';
import type { NetworkNode, NetworkEdge } from '@/lib/types';

interface PWNetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  nodeColor?: string;
  ariaLabel?: string;
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
  ariaLabel,
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
  const [simulationDone, setSimulationDone] = useState(false);
  const hasAutoFitted = useRef(false);

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

  // Scale node radii
  const radiusScale = useCallback((patents: number) => {
    const maxR = nodeCount > 100 ? 18 : nodeCount > 50 ? 22 : 28;
    const minR = nodeCount > 100 ? 1.5 : 2.5;
    return minR + (maxR - minR) * Math.sqrt(patents / maxPatents);
  }, [nodeCount, maxPatents]);

  const widthScale = useCallback((weight: number) => {
    return 0.15 + 1.8 * Math.sqrt(weight / maxWeight);
  }, [maxWeight]);

  // Connection counts
  const connectionCount = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach((e) => {
      counts[e.source] = (counts[e.source] || 0) + 1;
      counts[e.target] = (counts[e.target] || 0) + 1;
    });
    return counts;
  }, [edges]);

  // Max connections for color intensity
  const maxConnections = useMemo(() => {
    const vals = Object.values(connectionCount);
    return Math.max(...vals, 1);
  }, [connectionCount]);

  // Node opacity based on degree (more connections = more prominent)
  const nodeOpacity = useCallback((nodeId: string) => {
    const conn = connectionCount[nodeId] ?? 0;
    return 0.4 + 0.6 * Math.sqrt(conn / maxConnections);
  }, [connectionCount, maxConnections]);

  // Label threshold: show labels for top nodes by degree
  const labelThreshold = useMemo(() => {
    const sorted = Object.values(connectionCount).sort((a, b) => b - a);
    // Show labels for top ~5% or at least top 10 nodes
    const idx = Math.min(Math.max(10, Math.floor(sorted.length * 0.05)), sorted.length - 1);
    return sorted[idx] ?? 1;
  }, [connectionCount]);

  // Auto-fit: compute zoom/pan to show all nodes
  const fitToView = useCallback(() => {
    if (simNodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    simNodes.forEach((n) => {
      const r = radiusScale(n.patents);
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      minX = Math.min(minX, x - r);
      maxX = Math.max(maxX, x + r);
      minY = Math.min(minY, y - r);
      maxY = Math.max(maxY, y + r);
    });

    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    if (bboxW <= 0 || bboxH <= 0) return;

    const padding = 40;
    const availW = dimensions.width - padding * 2;
    const availH = dimensions.height - padding * 2;
    const newZoom = Math.min(availW / bboxW, availH / bboxH, 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = dimensions.width / 2 - centerX * newZoom;
    const newPanY = dimensions.height / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [simNodes, dimensions, radiusScale]);

  // Auto-fit when simulation completes
  useEffect(() => {
    if (simulationDone && !hasAutoFitted.current && simNodes.length > 0) {
      hasAutoFitted.current = true;
      fitToView();
    }
  }, [simulationDone, simNodes, fitToView]);

  // Build and run simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    setSimulationDone(false);
    hasAutoFitted.current = false;

    const simN: SimNode[] = nodes.map((n) => ({ ...n }));
    const nodeIds = new Set(simN.map((n) => n.id));
    const simL: SimLink[] = edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      }));

    // Tighter force parameters: clusters close together but no overlap
    const chargeStrength = nodeCount > 100 ? -60 : nodeCount > 50 ? -100 : -150;
    const linkDist = nodeCount > 100 ? 30 : nodeCount > 50 ? 45 : 60;
    const gravityStrength = nodeCount > 100 ? 0.08 : 0.06;

    const sim = forceSimulation<SimNode>(simN)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simL)
          .id((d) => d.id)
          .distance(linkDist)
          .strength((d) => 0.4 + 0.6 * (d.weight / maxWeight))
      )
      .force('charge', forceManyBody().strength(chargeStrength).distanceMax(300))
      .force('center', forceCenter(0, 0).strength(0.5))
      .force('x', forceX<SimNode>(0).strength(gravityStrength))
      .force('y', forceY<SimNode>(0).strength(gravityStrength))
      .force('collide', forceCollide<SimNode>().radius((d) => radiusScale(d.patents) + 0.5).strength(0.7))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

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
      setSimulationDone(true);
    });

    return () => {
      sim.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Drag handlers — convert screen coords to graph coords
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, node: SimNode) => {
      e.preventDefault();
      e.stopPropagation();
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
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      // Convert screen coordinates to graph coordinates
      const graphX = (screenX - pan.x) / zoom;
      const graphY = (screenY - pan.y) / zoom;
      const node = simNodes.find((n) => n.id === draggedId);
      if (node) {
        node.fx = graphX;
        node.fy = graphY;
      }
    },
    [draggedId, simNodes, zoom, pan]
  );

  const handleMouseUp = useCallback(() => {
    if (!draggedId) return;
    const sim = simulationRef.current;
    if (sim) {
      sim.alphaTarget(0);
      const node = simNodes.find((n) => n.id === draggedId);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
    }
    setDraggedId(null);
  }, [draggedId, simNodes]);

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

  // Connected edges for hover highlighting
  const connectedEdges = useMemo(() => {
    const edgeSet = new Set<string>();
    if (hoveredId) {
      edges.forEach((e) => {
        if (e.source === hoveredId || e.target === hoveredId) {
          edgeSet.add(`${e.source}-${e.target}`);
        }
      });
    }
    return edgeSet;
  }, [hoveredId, edges]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = (e.target as Element).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => {
      const newZoom = Math.min(8, Math.max(0.05, prevZoom * delta));
      // Zoom toward mouse position
      setPan((prevPan) => ({
        x: mouseX - (mouseX - prevPan.x) * (newZoom / prevZoom),
        y: mouseY - (mouseY - prevPan.y) * (newZoom / prevZoom),
      }));
      return newZoom;
    });
  }, []);

  // Pan with any click on background or shift+click
  const handleBgMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning if clicking on background (not a node)
    if ((e.target as Element).closest('circle')) return;
    if (e.button === 0 || e.button === 1) {
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

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        <button
          onClick={() => {
            setZoom((z) => Math.min(8, z * 1.3));
          }}
          className="w-8 h-8 rounded border bg-card text-foreground flex items-center justify-center hover:bg-muted text-lg font-bold"
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            setZoom((z) => Math.max(0.05, z / 1.3));
          }}
          className="w-8 h-8 rounded border bg-card text-foreground flex items-center justify-center hover:bg-muted text-lg font-bold"
          title="Zoom out"
          aria-label="Zoom out"
        >
          &minus;
        </button>
        <button
          onClick={fitToView}
          className="w-8 h-8 rounded border bg-card text-foreground flex items-center justify-center hover:bg-muted text-xs"
          title="Fit to view"
          aria-label="Fit to view"
        >
          Fit
        </button>
      </div>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        role="img"
        aria-label={ariaLabel ?? `Network graph with ${nodes.length} nodes and ${edges.length} connections`}
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
        style={{ cursor: isPanning ? 'move' : draggedId ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {/* Edges */}
        {simLinks.map((link, i) => {
          const s = link.source as SimNode;
          const t = link.target as SimNode;
          if (s.x == null || t.x == null || s.y == null || t.y == null) return null;
          const edgeKey = `${s.id}-${t.id}`;
          const isHighlighted = hoveredId ? connectedEdges.has(edgeKey) : false;
          const isDimmed = hoveredId && !isHighlighted;
          return (
            <line
              key={`edge-${i}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={isHighlighted ? nodeColor : 'hsl(var(--muted-foreground))'}
              strokeWidth={isHighlighted ? widthScale(link.weight) * 1.5 : widthScale(link.weight)}
              strokeOpacity={isDimmed ? 0.03 : isHighlighted ? 0.6 : 0.15}
            />
          );
        })}
        {/* Nodes */}
        {simNodes.map((node) => {
          const r = radiusScale(node.patents);
          const isConnected = !hoveredId || connectedIds.has(node.id);
          const isHovered = hoveredId === node.id;
          const degree = connectionCount[node.id] ?? 0;
          const showLabel = degree >= labelThreshold || isHovered || (hoveredId && connectedIds.has(node.id));
          return (
            <g key={node.id}>
              {/* Glow ring on hover */}
              {isHovered && (
                <circle
                  cx={node.x ?? 0}
                  cy={node.y ?? 0}
                  r={r + 4}
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              )}
              <circle
                cx={node.x ?? 0}
                cy={node.y ?? 0}
                r={r}
                fill={nodeColor}
                fillOpacity={isConnected ? nodeOpacity(node.id) : 0.04}
                stroke={isHovered ? '#fff' : 'none'}
                strokeWidth={isHovered ? 1.5 : 0}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onMouseEnter={() => {
                  if (!draggedId) {
                    setHoveredId(node.id);
                    setTooltip({
                      x: (node.x ?? 0) * zoom + pan.x + r * zoom + 10,
                      y: (node.y ?? 0) * zoom + pan.y - 10,
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
              {showLabel && (
                <text
                  x={node.x ?? 0}
                  y={(node.y ?? 0) + r + (isHovered ? 12 : 10)}
                  textAnchor="middle"
                  fontSize={isHovered ? 10 : 7}
                  fontWeight={isHovered ? 600 : 400}
                  fill="hsl(var(--foreground))"
                  fillOpacity={isConnected ? (isHovered ? 1 : 0.7) : 0.08}
                  pointerEvents="none"
                  style={{ textShadow: '0 0 3px hsl(var(--background)), 0 0 3px hsl(var(--background))' }}
                >
                  {node.name.length > 24 ? node.name.slice(0, 22) + '...' : node.name}
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
            left: Math.min(tooltip.x, dimensions.width - 250),
            top: Math.max(tooltip.y, 10),
            maxWidth: 260,
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
