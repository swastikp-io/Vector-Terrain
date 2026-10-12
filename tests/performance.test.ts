import { describe, it, expect } from 'vitest';
import { generateGeometry } from '../src/engine/generators';
import {
  DEFAULT_WAVEFORMS,
  DEFAULT_LOOPS,
  DEFAULT_BRANCHES,
  DEFAULT_INTERFERENCE,
  DEFAULT_CONTOURS,
  DEFAULT_CONNECTIONS,
  DEFAULT_DIMENSIONS,
} from '../src/store/defaults';
import { PALETTES } from '../src/store/palettes';

describe('Performance Benchmarks', () => {
  const palette = PALETTES[0];
  const seed = 12345;

  // JIT warm-up pass before measuring
  generateGeometry(DEFAULT_WAVEFORMS, seed, DEFAULT_DIMENSIONS, palette);

  it('Mode 1: Waveforms completes high-density generation under 250ms', () => {
    const config = { ...DEFAULT_WAVEFORMS, lineCount: 40 };
    const t0 = performance.now();
    const result = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette);
    const elapsed = performance.now() - t0;

    expect(result.paths.length).toBe(40);
    expect(elapsed).toBeLessThan(250);
  });

  it('Mode 2: Loops completes generation under 250ms', () => {
    const config = { ...DEFAULT_LOOPS, loopCount: 30 };
    const t0 = performance.now();
    const result = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette);
    const elapsed = performance.now() - t0;

    expect(result.paths.length).toBe(30);
    expect(elapsed).toBeLessThan(250);
  });

  it('Mode 3: Branches completes generation under 250ms', () => {
    const config = { ...DEFAULT_BRANCHES, initialLineCount: 4, branchCount: 10 };
    const t0 = performance.now();
    const result = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette);
    const elapsed = performance.now() - t0;

    expect(result.paths.length).toBe(40);
    expect(elapsed).toBeLessThan(250);
  });

  it('Mode 4: Interference completes generation under 250ms', () => {
    const config = { ...DEFAULT_INTERFERENCE, repetitions: 20, symmetry: 4 };
    const t0 = performance.now();
    const result = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette);
    const elapsed = performance.now() - t0;

    expect(result.paths.length).toBe(80);
    expect(elapsed).toBeLessThan(250);
  });

  it('Mode 5: Contours completes high-res marching squares under 250ms', () => {
    const config = { ...DEFAULT_CONTOURS, gridResolution: 40, contourCount: 16 };
    const t0 = performance.now();
    const result = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette);
    const elapsed = performance.now() - t0;

    expect(result.paths.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(250);
  });

  it('Mode 6: Connections completes generation under 250ms', () => {
    const config = { ...DEFAULT_CONNECTIONS, nodeCount: 35, connectionCount: 60 };
    const t0 = performance.now();
    const result = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette);
    const elapsed = performance.now() - t0;

    expect(result.paths.length).toBeGreaterThan(50);
    expect(elapsed).toBeLessThan(250);
  });
});
