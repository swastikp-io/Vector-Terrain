import {
  Point2D,
  CubicBezier,
  Polyline,
  PathCommand,
  VectorPath,
  BoundingBox,
  ArtboardDimensions,
} from './types';
import {
  vecDist,
  vecRotate,
  safePoint,
  isSafePoint,
  clamp,
} from './math';

/**
 * Evaluates a point on a cubic Bézier curve at parameter t in [0, 1].
 */
export function evaluateCubicBezier(curve: CubicBezier, t: number): Point2D {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      mt3 * curve.p0.x +
      3 * mt2 * t * curve.p1.x +
      3 * mt * t2 * curve.p2.x +
      t3 * curve.p3.x,
    y:
      mt3 * curve.p0.y +
      3 * mt2 * t * curve.p1.y +
      3 * mt * t2 * curve.p2.y +
      t3 * curve.p3.y,
  };
}

/**
 * Evaluates the tangent/derivative vector of a cubic Bézier at parameter t.
 */
export function cubicBezierDerivative(curve: CubicBezier, t: number): Point2D {
  const mt = 1 - t;
  const a = 3 * mt * mt;
  const b = 6 * mt * t;
  const c = 3 * t * t;

  return {
    x: a * (curve.p1.x - curve.p0.x) + b * (curve.p2.x - curve.p1.x) + c * (curve.p3.x - curve.p2.x),
    y: a * (curve.p1.y - curve.p0.y) + b * (curve.p2.y - curve.p1.y) + c * (curve.p3.y - curve.p2.y),
  };
}

/**
 * Subdivides a cubic Bézier curve at parameter t using de Casteljau's algorithm.
 */
export function subdivideCubicBezier(
  curve: CubicBezier,
  t = 0.5
): [CubicBezier, CubicBezier] {
  const p0 = curve.p0;
  const p1 = curve.p1;
  const p2 = curve.p2;
  const p3 = curve.p3;

  const q0 = { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
  const q1 = { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
  const q2 = { x: p2.x + (p3.x - p2.x) * t, y: p2.y + (p3.y - p2.y) * t };

  const r0 = { x: q0.x + (q1.x - q0.x) * t, y: q0.y + (q1.y - q0.y) * t };
  const r1 = { x: q1.x + (q2.x - q1.x) * t, y: q1.y + (q2.y - q1.y) * t };

  const s = { x: r0.x + (r1.x - r0.x) * t, y: r0.y + (r1.y - r0.y) * t };

  const left: CubicBezier = { p0, p1: q0, p2: r0, p3: s };
  const right: CubicBezier = { p0: s, p1: r1, p2: q2, p3 };

  return [left, right];
}

/**
 * Samples a cubic Bézier curve into a sequence of points.
 */
export function sampleCubicBezier(curve: CubicBezier, samples = 24): Point2D[] {
  const count = Math.max(2, samples);
  const points: Point2D[] = [];
  for (let i = 0; i <= count; i++) {
    points.push(evaluateCubicBezier(curve, i / count));
  }
  return points;
}

/**
 * Converts Catmull-Rom spline control points to equivalent Cubic Bézier segments.
 */
export function catmullRomToBeziers(
  points: Point2D[],
  closed = false,
  tension = 1.0
): CubicBezier[] {
  if (points.length < 2) return [];

  const pts: Point2D[] = [...points];
  if (closed) {
    pts.unshift(points[points.length - 1]);
    pts.push(points[0]);
    pts.push(points[1]);
  } else {
    // Duplicate start and end to form ghost endpoints
    pts.unshift(points[0]);
    pts.push(points[points.length - 1]);
  }

  const beziers: CubicBezier[] = [];
  const alpha = 6 * tension;

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    const cp1: Point2D = {
      x: p1.x + (p2.x - p0.x) / alpha,
      y: p1.y + (p2.y - p0.y) / alpha,
    };
    const cp2: Point2D = {
      x: p2.x - (p3.x - p1.x) / alpha,
      y: p2.y - (p3.y - p1.y) / alpha,
    };

    beziers.push({
      p0: safePoint(p1),
      p1: safePoint(cp1),
      p2: safePoint(cp2),
      p3: safePoint(p2),
    });
  }

  return beziers;
}

/**
 * Converts Catmull-Rom control points directly into smooth PathCommands.
 */
export function catmullRomToCommands(
  points: Point2D[],
  closed = false,
  tension = 1.0
): PathCommand[] {
  if (points.length < 2) return [];
  const beziers = catmullRomToBeziers(points, closed, tension);
  return beziersToCommands(beziers, closed);
}

/**
 * Converts a sequence of Cubic Bézier curves into PathCommands.
 */
export function beziersToCommands(
  beziers: CubicBezier[],
  closed = false
): PathCommand[] {
  if (beziers.length === 0) return [];

  const commands: PathCommand[] = [
    { type: 'M', x: beziers[0].p0.x, y: beziers[0].p0.y },
  ];

  for (const b of beziers) {
    commands.push({
      type: 'C',
      cp1x: b.p1.x,
      cp1y: b.p1.y,
      cp2x: b.p2.x,
      cp2y: b.p2.y,
      x: b.p3.x,
      y: b.p3.y,
    });
  }

  if (closed) {
    commands.push({ type: 'Z' });
  }

  return commands;
}

/**
 * Converts a polyline into PathCommands.
 */
export function polylineToCommands(
  points: Polyline,
  closed = false
): PathCommand[] {
  if (!points || points.length === 0) return [];

  const valid = points.filter(isSafePoint);
  if (valid.length === 0) return [];

  const commands: PathCommand[] = [{ type: 'M', x: valid[0].x, y: valid[0].y }];

  for (let i = 1; i < valid.length; i++) {
    commands.push({ type: 'L', x: valid[i].x, y: valid[i].y });
  }

  if (closed) {
    commands.push({ type: 'Z' });
  }

  return commands;
}

/**
 * Samples PathCommands into a polyline approximation for collision / bounds.
 */
export function commandsToPolyline(
  commands: PathCommand[],
  bezierSamples = 16
): Point2D[] {
  const points: Point2D[] = [];
  let current: Point2D = { x: 0, y: 0 };

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        current = { x: cmd.x, y: cmd.y };
        points.push(current);
        break;
      case 'L':
        current = { x: cmd.x, y: cmd.y };
        points.push(current);
        break;
      case 'C': {
        const curve: CubicBezier = {
          p0: current,
          p1: { x: cmd.cp1x, y: cmd.cp1y },
          p2: { x: cmd.cp2x, y: cmd.cp2y },
          p3: { x: cmd.x, y: cmd.y },
        };
        const sampled = sampleCubicBezier(curve, bezierSamples);
        points.push(...sampled.slice(1));
        current = { x: cmd.x, y: cmd.y };
        break;
      }
      case 'Q': {
        // Convert quadratic to cubic Bézier
        const cp1x = current.x + (2 / 3) * (cmd.cpx - current.x);
        const cp1y = current.y + (2 / 3) * (cmd.cpy - current.y);
        const cp2x = cmd.x + (2 / 3) * (cmd.cpx - cmd.x);
        const cp2y = cmd.y + (2 / 3) * (cmd.cpy - cmd.y);
        const curve: CubicBezier = {
          p0: current,
          p1: { x: cp1x, y: cp1y },
          p2: { x: cp2x, y: cp2y },
          p3: { x: cmd.x, y: cmd.y },
        };
        const sampled = sampleCubicBezier(curve, bezierSamples);
        points.push(...sampled.slice(1));
        current = { x: cmd.x, y: cmd.y };
        break;
      }
      case 'Z':
        if (points.length > 0) {
          points.push({ ...points[0] });
        }
        break;
    }
  }

  return points;
}

/**
 * Calculates accurate bounding box for a Cubic Bézier curve using derivative extrema.
 */
export function calculateBezierBounds(curve: CubicBezier): BoundingBox {
  const xRoots = findBezierExtremaRoots(
    curve.p0.x,
    curve.p1.x,
    curve.p2.x,
    curve.p3.x
  );
  const yRoots = findBezierExtremaRoots(
    curve.p0.y,
    curve.p1.y,
    curve.p2.y,
    curve.p3.y
  );

  const testT = [0, 1, ...xRoots, ...yRoots];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const t of testT) {
    if (t >= 0 && t <= 1) {
      const pt = evaluateCubicBezier(curve, t);
      minX = Math.min(minX, pt.x);
      minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x);
      maxY = Math.max(maxY, pt.y);
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

function findBezierExtremaRoots(
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number[] {
  const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
  const b = 6 * (p0 - 2 * p1 + p2);
  const c = 3 * (-p0 + p1);

  if (Math.abs(a) < 1e-9) {
    if (Math.abs(b) < 1e-9) return [];
    const t = -c / b;
    return t >= 0 && t <= 1 ? [t] : [];
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b + sqrtDisc) / (2 * a);
  const t2 = (-b - sqrtDisc) / (2 * a);

  const roots: number[] = [];
  if (t1 >= 0 && t1 <= 1) roots.push(t1);
  if (t2 >= 0 && t2 <= 1) roots.push(t2);
  return roots;
}

/**
 * Calculates bounding box of a sequence of points.
 */
export function calculatePolylineBounds(points: Point2D[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (isSafePoint(p)) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates bounding box for a VectorPath directly from commands without point array allocations.
 */
export function calculatePathBounds(path: VectorPath): BoundingBox {
  if (!path.commands || path.commands.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < path.commands.length; i++) {
    const cmd = path.commands[i];
    switch (cmd.type) {
      case 'M':
      case 'L':
        if (cmd.x < minX) minX = cmd.x;
        if (cmd.x > maxX) maxX = cmd.x;
        if (cmd.y < minY) minY = cmd.y;
        if (cmd.y > maxY) maxY = cmd.y;
        break;
      case 'C':
        // The convex hull of Bézier control points encloses the curve
        if (cmd.cp1x < minX) minX = cmd.cp1x;
        if (cmd.cp1x > maxX) maxX = cmd.cp1x;
        if (cmd.cp1y < minY) minY = cmd.cp1y;
        if (cmd.cp1y > maxY) maxY = cmd.cp1y;
        if (cmd.cp2x < minX) minX = cmd.cp2x;
        if (cmd.cp2x > maxX) maxX = cmd.cp2x;
        if (cmd.cp2y < minY) minY = cmd.cp2y;
        if (cmd.cp2y > maxY) maxY = cmd.cp2y;
        if (cmd.x < minX) minX = cmd.x;
        if (cmd.x > maxX) maxX = cmd.x;
        if (cmd.y < minY) minY = cmd.y;
        if (cmd.y > maxY) maxY = cmd.y;
        break;
      case 'Q':
        if (cmd.cpx < minX) minX = cmd.cpx;
        if (cmd.cpx > maxX) maxX = cmd.cpx;
        if (cmd.cpy < minY) minY = cmd.cpy;
        if (cmd.cpy > maxY) maxY = cmd.cpy;
        if (cmd.x < minX) minX = cmd.x;
        if (cmd.x > maxX) maxX = cmd.x;
        if (cmd.y < minY) minY = cmd.y;
        if (cmd.y > maxY) maxY = cmd.y;
        break;
      case 'Z':
        break;
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates overall bounding box for a collection of VectorPaths with zero allocations.
 */
export function calculateGeometryBounds(paths: VectorPath[]): BoundingBox {
  if (paths.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let p = 0; p < paths.length; p++) {
    const commands = paths[p].commands;
    if (!commands) continue;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      switch (cmd.type) {
        case 'M':
        case 'L':
          if (cmd.x < minX) minX = cmd.x;
          if (cmd.x > maxX) maxX = cmd.x;
          if (cmd.y < minY) minY = cmd.y;
          if (cmd.y > maxY) maxY = cmd.y;
          break;
        case 'C':
          if (cmd.cp1x < minX) minX = cmd.cp1x;
          if (cmd.cp1x > maxX) maxX = cmd.cp1x;
          if (cmd.cp1y < minY) minY = cmd.cp1y;
          if (cmd.cp1y > maxY) maxY = cmd.cp1y;
          if (cmd.cp2x < minX) minX = cmd.cp2x;
          if (cmd.cp2x > maxX) maxX = cmd.cp2x;
          if (cmd.cp2y < minY) minY = cmd.cp2y;
          if (cmd.cp2y > maxY) maxY = cmd.cp2y;
          if (cmd.x < minX) minX = cmd.x;
          if (cmd.x > maxX) maxX = cmd.x;
          if (cmd.y < minY) minY = cmd.y;
          if (cmd.y > maxY) maxY = cmd.y;
          break;
        case 'Q':
          if (cmd.cpx < minX) minX = cmd.cpx;
          if (cmd.cpx > maxX) maxX = cmd.cpx;
          if (cmd.cpy < minY) minY = cmd.cpy;
          if (cmd.cpy > maxY) maxY = cmd.cpy;
          if (cmd.x < minX) minX = cmd.x;
          if (cmd.x > maxX) maxX = cmd.x;
          if (cmd.y < minY) minY = cmd.y;
          if (cmd.y > maxY) maxY = cmd.y;
          break;
        case 'Z':
          break;
      }
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Transforms path commands using a generic point transform function.
 */
export function transformCommands(
  commands: PathCommand[],
  transform: (p: Point2D) => Point2D
): PathCommand[] {
  return commands.map((cmd) => {
    switch (cmd.type) {
      case 'M': {
        const p = transform({ x: cmd.x, y: cmd.y });
        return { type: 'M', x: p.x, y: p.y };
      }
      case 'L': {
        const p = transform({ x: cmd.x, y: cmd.y });
        return { type: 'L', x: p.x, y: p.y };
      }
      case 'C': {
        const cp1 = transform({ x: cmd.cp1x, y: cmd.cp1y });
        const cp2 = transform({ x: cmd.cp2x, y: cmd.cp2y });
        const p = transform({ x: cmd.x, y: cmd.y });
        return {
          type: 'C',
          cp1x: cp1.x,
          cp1y: cp1.y,
          cp2x: cp2.x,
          cp2y: cp2.y,
          x: p.x,
          y: p.y,
        };
      }
      case 'Q': {
        const cp = transform({ x: cmd.cpx, y: cmd.cpy });
        const p = transform({ x: cmd.x, y: cmd.y });
        return { type: 'Q', cpx: cp.x, cpy: cp.y, x: p.x, y: p.y };
      }
      case 'Z':
        return { type: 'Z' };
    }
  });
}

/**
 * Scales a VectorPath around an origin point.
 */
export function scalePath(
  path: VectorPath,
  sx: number,
  sy: number,
  origin: Point2D = { x: 0, y: 0 }
): VectorPath {
  return {
    ...path,
    commands: transformCommands(path.commands, (p) => ({
      x: origin.x + (p.x - origin.x) * sx,
      y: origin.y + (p.y - origin.y) * sy,
    })),
  };
}

/**
 * Translates a VectorPath by (dx, dy).
 */
export function translatePath(
  path: VectorPath,
  dx: number,
  dy: number
): VectorPath {
  return {
    ...path,
    commands: transformCommands(path.commands, (p) => ({
      x: p.x + dx,
      y: p.y + dy,
    })),
  };
}

/**
 * Rotates a VectorPath around an origin point.
 */
export function rotatePath(
  path: VectorPath,
  angleRad: number,
  origin: Point2D = { x: 0, y: 0 }
): VectorPath {
  return {
    ...path,
    commands: transformCommands(path.commands, (p) => vecRotate(p, angleRad, origin)),
  };
}

/**
 * Clips/clamps points of path to artboard margin bounds to prevent extreme runaway coords.
 */
export function clampPathToBounds(
  path: VectorPath,
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
): VectorPath {
  return {
    ...path,
    commands: transformCommands(path.commands, (p) => ({
      x: clamp(p.x, bounds.minX, bounds.maxX),
      y: clamp(p.y, bounds.minY, bounds.maxY),
    })),
  };
}
