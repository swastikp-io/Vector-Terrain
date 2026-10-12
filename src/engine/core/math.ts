import { Point2D } from './types';

export function isSafeNumber(n: number): boolean {
  return typeof n === 'number' && Number.isFinite(n) && !Number.isNaN(n);
}

export function safeCoordinate(val: number, fallback = 0): number {
  return isSafeNumber(val) ? val : fallback;
}

export function isSafePoint(p: Point2D): boolean {
  return Boolean(p && isSafeNumber(p.x) && isSafeNumber(p.y));
}

export function safePoint(p: Point2D, fallback: Point2D = { x: 0, y: 0 }): Point2D {
  return {
    x: safeCoordinate(p?.x, fallback.x),
    y: safeCoordinate(p?.y, fallback.y),
  };
}

export function vecAdd(a: Point2D, b: Point2D): Point2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(a: Point2D, b: Point2D): Point2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecScale(v: Point2D, s: number): Point2D {
  return { x: v.x * s, y: v.y * s };
}

export function vecDot(a: Point2D, b: Point2D): number {
  return a.x * b.x + a.y * b.y;
}

export function vecCross(a: Point2D, b: Point2D): number {
  return a.x * b.y - a.y * b.x;
}

export function vecDistSq(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function vecDist(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function vecLength(v: Point2D): number {
  return Math.hypot(v.x, v.y);
}

export function vecNormalize(v: Point2D): Point2D {
  const len = vecLength(v);
  if (len < 1e-9) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / len, y: v.y / len };
}

export function vecAngle(v: Point2D): number {
  return Math.atan2(v.y, v.x);
}

export function vecFromAngle(angleRad: number, length = 1): Point2D {
  return {
    x: Math.cos(angleRad) * length,
    y: Math.sin(angleRad) * length,
  };
}

export function vecRotate(v: Point2D, angleRad: number, origin: Point2D = { x: 0, y: 0 }): Point2D {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = v.x - origin.x;
  const dy = v.y - origin.y;
  return {
    x: origin.x + (dx * cos - dy * sin),
    y: origin.y + (dx * sin + dy * cos),
  };
}

export function vecLerp(a: Point2D, b: Point2D, t: number): Point2D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
