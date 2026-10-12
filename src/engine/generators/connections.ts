import {
  ConnectionsConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  VectorPath,
  Point2D,
  PathCommand,
} from '../core/types';
import { createRandom } from '../core/random';
import { calculateGeometryBounds } from '../core/geometry';
import { resolvePathColor } from '../../store/palettes';
import { clamp, vecDist } from '../core/math';

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  radius: number;
  label: string;
}

export function generateConnections(
  config: ConnectionsConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  const startTime = performance.now();
  const rng = createRandom(seed);
  const { width, height } = dimensions;

  const nodeCount = Math.max(4, Math.min(60, Math.floor(config.nodeCount)));
  const connectionCount = Math.max(2, Math.min(120, Math.floor(config.connectionCount)));
  const curvature = config.pathCurvature;
  const layoutStyle = config.layoutStyle || 'organic';
  const showLabels = config.showLabels;
  const nodeSize = config.nodeSize;

  const marginX = width * 0.12;
  const marginY = height * 0.12;
  const usableWidth = width - marginX * 2;
  const usableHeight = height - marginY * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Generate node positions
  const nodes: NetworkNode[] = [];

  for (let i = 0; i < nodeCount; i++) {
    let px = centerX;
    let py = centerY;

    if (layoutStyle === 'radial') {
      const ringCount = 8;
      const ring = Math.floor(i / ringCount) + 1;
      const maxRings = Math.max(1, Math.ceil(nodeCount / ringCount));
      const angle = ((i % ringCount) / ringCount) * Math.PI * 2 + ring * 0.4 + time * 0.2;
      const maxUsableRad = Math.min(usableWidth, usableHeight) * 0.46;
      const rad = (ring / (maxRings + 0.4)) * maxUsableRad;
      px = centerX + Math.cos(angle) * rad;
      py = centerY + Math.sin(angle) * rad;
    } else if (layoutStyle === 'grid') {
      const cols = Math.ceil(Math.sqrt(nodeCount));
      const rows = Math.ceil(nodeCount / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = rng.range(-8, 8);
      const jitterY = rng.range(-8, 8);
      px = marginX + (cols > 1 ? (col / (cols - 1)) * usableWidth : usableWidth / 2) + jitterX;
      py = marginY + (rows > 1 ? (row / (rows - 1)) * usableHeight : usableHeight / 2) + jitterY;
    } else if (layoutStyle === 'layered') {
      const layerCount = 4;
      const nodesPerLayer = Math.ceil(nodeCount / layerCount);
      const layer = Math.min(layerCount - 1, Math.floor(i / nodesPerLayer));
      const inLayerIdx = i % nodesPerLayer;
      const layerX = marginX + (layerCount > 1 ? (layer / (layerCount - 1)) * usableWidth : usableWidth / 2);
      const layerY = marginY + (nodesPerLayer > 1 ? (inLayerIdx / (nodesPerLayer - 1)) * usableHeight : usableHeight / 2) + rng.range(-6, 6);
      px = layerX;
      py = layerY;
    } else {
      // Organic
      px = marginX + rng.next() * usableWidth;
      py = marginY + rng.next() * usableHeight;
      // Slight orbit motion
      px += Math.cos(time + i) * 6;
      py += Math.sin(time + i * 1.3) * 6;
    }

    const safePadX = Math.max(nodeSize + 16, marginX * 0.6);
    const safePadY = Math.max(nodeSize + 16, marginY * 0.6);

    nodes.push({
      id: i,
      x: clamp(px, safePadX, width - safePadX),
      y: clamp(py, safePadY, height - safePadY),
      radius: nodeSize * (0.8 + rng.next() * 0.5),
      label: `ND-${(i + 1).toString().padStart(2, '0')}`,
    });
  }

  const paths: VectorPath[] = [];

  // 2. Form connections between nodes
  // Prefer connections between nearer nodes
  interface CandidateEdge {
    u: number;
    v: number;
    dist: number;
  }
  const candidates: CandidateEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      candidates.push({
        u: i,
        v: j,
        dist: vecDist(nodes[i], nodes[j]),
      });
    }
  }

  // Sort by distance with slight deterministic shuffling
  candidates.sort((a, b) => a.dist - b.dist + (rng.next() - 0.5) * 80);
  const selectedEdges = candidates.slice(0, connectionCount);

  // Build curved cubic Bézier paths for connections
  selectedEdges.forEach((edge, edgeIdx) => {
    const na = nodes[edge.u];
    const nb = nodes[edge.v];

    const dx = nb.x - na.x;
    const dy = nb.y - na.y;
    const chordLen = Math.hypot(dx, dy);

    // Normal vector perpendicular to chord
    const nx = -dy / (chordLen || 1);
    const ny = dx / (chordLen || 1);

    // Lateral curve offset
    const curveSign = edgeIdx % 2 === 0 ? 1 : -1;
    const lateralDist = curvature * chordLen * 0.35 * curveSign;

    const pad = 4;
    const cp1x = clamp(na.x + dx * 0.33 + nx * lateralDist, pad, width - pad);
    const cp1y = clamp(na.y + dy * 0.33 + ny * lateralDist, pad, height - pad);
    const cp2x = clamp(na.x + dx * 0.67 + nx * lateralDist, pad, width - pad);
    const cp2y = clamp(na.y + dy * 0.67 + ny * lateralDist, pad, height - pad);

    const commands: PathCommand[] = [
      { type: 'M', x: na.x, y: na.y },
      { type: 'C', cp1x, cp1y, cp2x, cp2y, x: nb.x, y: nb.y },
    ];

    const color = resolvePathColor(palette, edgeIdx, selectedEdges.length);

    paths.push({
      id: `conn-edge-${edgeIdx}`,
      commands,
      strokeColor: color,
      strokeWidth: config.strokeWidth,
      strokeOpacity: 0.8,
      strokeCap: 'round',
      strokeJoin: 'round',
      closed: false,
    });
  });

  // 3. Render Node Rings and Terminals
  nodes.forEach((node, nodeIdx) => {
    const r = node.radius;
    // Approximating circle via 4 cubic Bézier arcs
    const k = 0.5522847498 * r;
    const commands: PathCommand[] = [
      { type: 'M', x: node.x, y: node.y - r },
      {
        type: 'C',
        cp1x: node.x + k,
        cp1y: node.y - r,
        cp2x: node.x + r,
        cp2y: node.y - k,
        x: node.x + r,
        y: node.y,
      },
      {
        type: 'C',
        cp1x: node.x + r,
        cp1y: node.y + k,
        cp2x: node.x + k,
        cp2y: node.y + r,
        x: node.x,
        y: node.y + r,
      },
      {
        type: 'C',
        cp1x: node.x - k,
        cp1y: node.y + r,
        cp2x: node.x - r,
        cp2y: node.y + k,
        x: node.x - r,
        y: node.y,
      },
      {
        type: 'C',
        cp1x: node.x - r,
        cp1y: node.y - k,
        cp2x: node.x - k,
        cp2y: node.y - r,
        x: node.x,
        y: node.y - r,
      },
      { type: 'Z' },
    ];

    paths.push({
      id: `node-ring-${nodeIdx}`,
      commands,
      strokeColor: palette.primary,
      strokeWidth: config.strokeWidth * 1.25,
      strokeOpacity: 0.95,
      fillColor: palette.background,
      fillOpacity: 0.85,
      closed: true,
    });

    // Inner core dot
    const dotR = Math.max(1.5, r * 0.35);
    const dk = 0.5522847498 * dotR;
    const dotCommands: PathCommand[] = [
      { type: 'M', x: node.x, y: node.y - dotR },
      {
        type: 'C',
        cp1x: node.x + dk,
        cp1y: node.y - dotR,
        cp2x: node.x + dotR,
        cp2y: node.y - dk,
        x: node.x + dotR,
        y: node.y,
      },
      {
        type: 'C',
        cp1x: node.x + dotR,
        cp1y: node.y + dk,
        cp2x: node.x + dk,
        cp2y: node.y + dotR,
        x: node.x,
        y: node.y + dotR,
      },
      {
        type: 'C',
        cp1x: node.x - dk,
        cp1y: node.y + dotR,
        cp2x: node.x - dotR,
        cp2y: node.y + dk,
        x: node.x - dotR,
        y: node.y,
      },
      {
        type: 'C',
        cp1x: node.x - dotR,
        cp1y: node.y - dk,
        cp2x: node.x - dk,
        cp2y: node.y - dotR,
        x: node.x,
        y: node.y - dotR,
      },
      { type: 'Z' },
    ];

    paths.push({
      id: `node-core-${nodeIdx}`,
      commands: dotCommands,
      strokeColor: palette.secondary || palette.primary,
      strokeWidth: 1,
      fillColor: palette.secondary || palette.primary,
      fillOpacity: 0.9,
      closed: true,
    });

    // Technical crosshair / label ticks if requested
    if (showLabels) {
      const tickLen = 5;
      const tickX1 = Math.min(width - 2, node.x + r + 2);
      const tickX2 = Math.min(width - 2, node.x + r + 2 + tickLen);
      paths.push({
        id: `node-tick-${nodeIdx}`,
        commands: [
          { type: 'M', x: tickX1, y: node.y },
          { type: 'L', x: tickX2, y: node.y },
        ],
        strokeColor: palette.secondary,
        strokeWidth: 1,
        strokeOpacity: 0.6,
        closed: false,
      });
    }
  });

  const bounds = calculateGeometryBounds(paths);

  return {
    paths,
    dimensions,
    seed,
    mode: 'connections',
    generationTimeMs: performance.now() - startTime,
    stats: {
      pathCount: paths.length,
      segmentCount: paths.length * 4,
      bounds,
    },
    metadata: { nodeCount, connectionCount, layoutStyle },
  };
}
