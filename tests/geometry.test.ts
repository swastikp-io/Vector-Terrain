import { describe, it, expect } from 'vitest';
import {
  evaluateCubicBezier,
  subdivideCubicBezier,
  sampleCubicBezier,
  catmullRomToBeziers,
  polylineToCommands,
  commandsToPolyline,
  calculateBezierBounds,
} from '../src/engine/core/geometry';
import { commandsToSvgPathData } from '../src/engine/renderers/svgRenderer';

describe('Geometry utilities', () => {
  const curve = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 100 },
    p2: { x: 100, y: 100 },
    p3: { x: 100, y: 0 },
  };

  it('evaluates cubic Bézier endpoints and midpoint', () => {
    const start = evaluateCubicBezier(curve, 0);
    const end = evaluateCubicBezier(curve, 1);
    const mid = evaluateCubicBezier(curve, 0.5);

    expect(start).toEqual({ x: 0, y: 0 });
    expect(end).toEqual({ x: 100, y: 0 });
    expect(mid.x).toBeCloseTo(50);
    expect(mid.y).toBeCloseTo(75);
  });

  it('subdivides curve into two exact halves', () => {
    const [left, right] = subdivideCubicBezier(curve, 0.5);

    expect(left.p0).toEqual(curve.p0);
    expect(right.p3).toEqual(curve.p3);
    expect(left.p3).toEqual(right.p0);

    const midOriginal = evaluateCubicBezier(curve, 0.5);
    expect(left.p3.x).toBeCloseTo(midOriginal.x);
    expect(left.p3.y).toBeCloseTo(midOriginal.y);
  });

  it('samples cubic Bézier curves accurately', () => {
    const samples = sampleCubicBezier(curve, 10);
    expect(samples.length).toBe(11);
    expect(samples[0]).toEqual({ x: 0, y: 0 });
    expect(samples[10]).toEqual({ x: 100, y: 0 });
  });

  it('converts Catmull-Rom spline points to continuous cubic Béziers', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 50 },
      { x: 150, y: 120 },
    ];
    const beziers = catmullRomToBeziers(points);
    expect(beziers.length).toBe(points.length - 1);
    expect(beziers[0].p0).toEqual(points[0]);
    expect(beziers[beziers.length - 1].p3).toEqual(points[points.length - 1]);
  });

  it('calculates true Bézier bounding box', () => {
    const bounds = calculateBezierBounds(curve);
    expect(bounds.minX).toBeCloseTo(0);
    expect(bounds.maxX).toBeCloseTo(100);
    expect(bounds.minY).toBeCloseTo(0);
    expect(bounds.maxY).toBeCloseTo(75);
  });

  it('formats SVG path commands cleanly', () => {
    const commands = polylineToCommands([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ]);
    const svgPath = commandsToSvgPathData(commands);
    expect(svgPath).toBe('M 10 20 L 30 40');
  });
});
