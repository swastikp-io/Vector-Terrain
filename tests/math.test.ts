import { describe, it, expect } from 'vitest';
import {
  vecAdd,
  vecSub,
  vecScale,
  vecDist,
  vecNormalize,
  vecRotate,
  lerp,
  clamp,
  easeInOutQuad,
} from '../src/engine/core/math';

describe('Math utilities', () => {
  it('performs vector addition and subtraction', () => {
    const a = { x: 10, y: 20 };
    const b = { x: 5, y: -2 };
    expect(vecAdd(a, b)).toEqual({ x: 15, y: 18 });
    expect(vecSub(a, b)).toEqual({ x: 5, y: 22 });
  });

  it('performs vector scaling', () => {
    const v = { x: 3, y: -4 };
    expect(vecScale(v, 2.5)).toEqual({ x: 7.5, y: -10 });
  });

  it('calculates Euclidean distance', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    expect(vecDist(a, b)).toBeCloseTo(5);
  });

  it('safely normalizes non-zero and zero vectors', () => {
    const v = { x: 3, y: 4 };
    const normalized = vecNormalize(v);
    expect(normalized.x).toBeCloseTo(0.6);
    expect(normalized.y).toBeCloseTo(0.8);

    const zero = { x: 0, y: 0 };
    expect(vecNormalize(zero)).toEqual({ x: 0, y: 0 });
  });

  it('rotates vector around origin', () => {
    const v = { x: 1, y: 0 };
    const rotated = vecRotate(v, Math.PI / 2);
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);
  });

  it('performs lerp and clamp properly', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('evaluates easing curves within [0, 1]', () => {
    expect(easeInOutQuad(0)).toBe(0);
    expect(easeInOutQuad(0.5)).toBe(0.5);
    expect(easeInOutQuad(1)).toBe(1);
  });
});
