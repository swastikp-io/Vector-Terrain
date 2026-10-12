import {
  ContoursConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  VectorPath,
  Point2D,
  Polyline,
} from '../core/types';
import { createRandom } from '../core/random';
import { catmullRomToCommands, calculateGeometryBounds } from '../core/geometry';
import { resolvePathColor } from '../../store/palettes';
import { clamp, lerp } from '../core/math';

interface LineSegment {
  p1: Point2D;
  p2: Point2D;
}

export function generateContours(
  config: ContoursConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  const startTime = performance.now();
  const rng = createRandom(seed);
  const { width, height } = dimensions;

  const contourCount = Math.max(3, Math.min(40, Math.floor(config.contourCount)));
  const fieldScale = config.fieldScale;
  const noiseIntensity = config.noiseIntensity;
  const noiseFreq = config.noiseFrequency;
  const fieldDeformation = config.fieldDeformation;
  const radialInfluence = config.radialInfluence;
  const gridRes = Math.max(20, Math.min(70, Math.floor(config.gridResolution)));

  const cols = gridRes;
  const rows = Math.round((gridRes * height) / width);
  const cellW = width / (cols - 1);
  const cellH = height / (rows - 1);

  // Evaluate 2D scalar field
  const field: number[][] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.hypot(centerX, centerY);

  let minVal = Infinity;
  let maxVal = -Infinity;

  for (let r = 0; r < rows; r++) {
    field[r] = [];
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;

      const nx = (x / width) * 4 * fieldScale;
      const ny = (y / height) * 4 * fieldScale;

      // Primary noise + harmonic
      const n1 = rng.noise2D(nx * noiseFreq * 100, ny * noiseFreq * 100 + time * 0.2);
      const n2 = rng.noise2D(nx * noiseFreq * 200 + 10.5, ny * noiseFreq * 200 + time * 0.3) * 0.5;
      const totalNoise = (n1 + n2) * noiseIntensity;

      // Radial influence
      const distFromCenter = Math.hypot(x - centerX, y - centerY) / maxRadius;
      const radial = (1 - distFromCenter) * radialInfluence * 1.5;

      // Field deformation
      const def = fieldDeformation * Math.sin(x * 0.015 + y * 0.015);

      const val = totalNoise + radial + def;
      field[r][c] = val;
      minVal = Math.min(minVal, val);
      maxVal = Math.max(maxVal, val);
    }
  }

  // Normalize field to [0, 1]
  const valRange = maxVal - minVal || 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      field[r][c] = (field[r][c] - minVal) / valRange;
    }
  }

  // Marching squares isocontour extraction
  const paths: VectorPath[] = [];

  for (let k = 0; k < contourCount; k++) {
    // Isovalue evenly distributed with lineSpacing factor
    const iso = 0.08 + (k / (contourCount + 1)) * 0.84;
    const segments: LineSegment[] = [];

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const x0 = c * cellW;
        const x1 = (c + 1) * cellW;
        const y0 = r * cellH;
        const y1 = (r + 1) * cellH;

        // Corners: TL, TR, BR, BL
        const vTL = field[r][c];
        const vTR = field[r][c + 1];
        const vBR = field[r + 1][c + 1];
        const vBL = field[r + 1][c];

        let cellIndex = 0;
        if (vTL >= iso) cellIndex |= 1;
        if (vTR >= iso) cellIndex |= 2;
        if (vBR >= iso) cellIndex |= 4;
        if (vBL >= iso) cellIndex |= 8;

        if (cellIndex === 0 || cellIndex === 15) continue;

        // Linear interpolation along edges
        const top: Point2D = {
          x: lerp(x0, x1, (iso - vTL) / (vTR - vTL || 1e-6)),
          y: y0,
        };
        const right: Point2D = {
          x: x1,
          y: lerp(y0, y1, (iso - vTR) / (vBR - vTR || 1e-6)),
        };
        const bottom: Point2D = {
          x: lerp(x0, x1, (iso - vBL) / (vBR - vBL || 1e-6)),
          y: y1,
        };
        const left: Point2D = {
          x: x0,
          y: lerp(y0, y1, (iso - vTL) / (vBL - vTL || 1e-6)),
        };

        switch (cellIndex) {
          case 1:
          case 14:
            segments.push({ p1: top, p2: left });
            break;
          case 2:
          case 13:
            segments.push({ p1: top, p2: right });
            break;
          case 3:
          case 12:
            segments.push({ p1: left, p2: right });
            break;
          case 4:
          case 11:
            segments.push({ p1: right, p2: bottom });
            break;
          case 5:
            segments.push({ p1: top, p2: right });
            segments.push({ p1: bottom, p2: left });
            break;
          case 6:
          case 9:
            segments.push({ p1: top, p2: bottom });
            break;
          case 7:
          case 8:
            segments.push({ p1: left, p2: bottom });
            break;
          case 10:
            segments.push({ p1: top, p2: left });
            segments.push({ p1: right, p2: bottom });
            break;
        }
      }
    }

    // Assemble segments into polylines
    const chains = assembleSegments(segments);

    chains.forEach((chain, chainIdx) => {
      if (chain.length < 3) return;
      const commands = catmullRomToCommands(chain, false, 0.85);
      const color = resolvePathColor(palette, k, contourCount);

      paths.push({
        id: `contour-${k}-${chainIdx}`,
        commands,
        strokeColor: color,
        strokeWidth: config.strokeWidth,
        strokeOpacity: 0.88,
        strokeCap: 'round',
        strokeJoin: 'round',
        closed: false,
      });
    });
  }

  const bounds = calculateGeometryBounds(paths);

  return {
    paths,
    dimensions,
    seed,
    mode: 'contours',
    generationTimeMs: performance.now() - startTime,
    stats: {
      pathCount: paths.length,
      segmentCount: paths.length * 20,
      bounds,
    },
    metadata: { contourCount, gridResolution: gridRes },
  };
}

/**
 * Fast O(N) spatial map chaining of raw segments into continuous polylines.
 */
function assembleSegments(segments: LineSegment[], tolerance = 3.0): Polyline[] {
  if (segments.length === 0) return [];

  const keyOf = (p: Point2D) =>
    `${Math.round(p.x / tolerance)}_${Math.round(p.y / tolerance)}`;

  interface SegmentRef {
    p1: Point2D;
    p2: Point2D;
    used: boolean;
  }

  const refs: SegmentRef[] = segments.map((s) => ({
    p1: s.p1,
    p2: s.p2,
    used: false,
  }));
  const pointMap = new Map<string, number[]>();

  for (let i = 0; i < refs.length; i++) {
    const k1 = keyOf(refs[i].p1);
    const k2 = keyOf(refs[i].p2);
    if (!pointMap.has(k1)) pointMap.set(k1, []);
    if (!pointMap.has(k2)) pointMap.set(k2, []);
    pointMap.get(k1)!.push(i);
    pointMap.get(k2)!.push(i);
  }

  const chains: Polyline[] = [];

  for (let i = 0; i < refs.length; i++) {
    if (refs[i].used) continue;
    refs[i].used = true;

    const chain: Point2D[] = [refs[i].p1, refs[i].p2];

    // Extend tail
    let searching = true;
    while (searching) {
      searching = false;
      const tail = chain[chain.length - 1];
      const neighbors = pointMap.get(keyOf(tail)) || [];
      for (const idx of neighbors) {
        if (!refs[idx].used) {
          const seg = refs[idx];
          if (Math.hypot(seg.p1.x - tail.x, seg.p1.y - tail.y) <= tolerance) {
            seg.used = true;
            chain.push(seg.p2);
            searching = true;
            break;
          } else if (Math.hypot(seg.p2.x - tail.x, seg.p2.y - tail.y) <= tolerance) {
            seg.used = true;
            chain.push(seg.p1);
            searching = true;
            break;
          }
        }
      }
    }

    // Extend head
    searching = true;
    while (searching) {
      searching = false;
      const head = chain[0];
      const neighbors = pointMap.get(keyOf(head)) || [];
      for (const idx of neighbors) {
        if (!refs[idx].used) {
          const seg = refs[idx];
          if (Math.hypot(seg.p2.x - head.x, seg.p2.y - head.y) <= tolerance) {
            seg.used = true;
            chain.unshift(seg.p1);
            searching = true;
            break;
          } else if (Math.hypot(seg.p1.x - head.x, seg.p1.y - head.y) <= tolerance) {
            seg.used = true;
            chain.unshift(seg.p2);
            searching = true;
            break;
          }
        }
      }
    }

    if (chain.length > 2) {
      chains.push(chain);
    }
  }

  return chains;
}

