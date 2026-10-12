import { describe, it, expect } from 'vitest';
import { generateGeometry } from '../src/engine/generators';
import { PALETTES } from '../src/store/palettes';
import {
  WaveformsConfig,
  LoopsConfig,
  BranchesConfig,
  InterferenceConfig,
  ContoursConfig,
  ConnectionsConfig,
  ArtboardDimensions,
} from '../src/engine/core/types';

describe('All Six Generator Modes', () => {
  const dimensions: ArtboardDimensions = { width: 1000, height: 1000 };
  const palette = PALETTES[0];
  const seed = 42;

  it('Mode 1: Waveforms produces valid deterministic paths', () => {
    const config: WaveformsConfig = {
      mode: 'waveforms',
      lineCount: 12,
      amplitude: 50,
      frequency: 2,
      phaseOffset: 0,
      verticalSpacing: 20,
      horizontalSpacing: 0,
      curvature: 0.8,
      distortion: 0.2,
      splitMergeStrength: 0.4,
      transitionRegions: 2,
      strokeWidth: 2,
    };

    const res1 = generateGeometry(config, seed, dimensions, palette);
    const res2 = generateGeometry(config, seed, dimensions, palette);

    expect(res1.paths.length).toBe(12);
    expect(res1.paths[0].commands.length).toBeGreaterThan(10);
    expect(res1.paths[0].commands).toEqual(res2.paths[0].commands);
  });

  it('Mode 2: Loops produces valid deterministic paths', () => {
    const config: LoopsConfig = {
      mode: 'loops',
      loopCount: 8,
      loopWidth: 150,
      loopHeight: 180,
      horizontalSpacing: 40,
      verticalOffset: 20,
      rotation: 15,
      overlap: 0.3,
      phase: 0,
      symmetry: true,
      connectConsecutive: false,
      strokeWidth: 2,
    };

    const res = generateGeometry(config, seed, dimensions, palette);
    expect(res.paths.length).toBe(8);
    expect(res.paths[0].closed).toBe(true);
  });

  it('Mode 3: Branches produces geometrically controlled division', () => {
    const config: BranchesConfig = {
      mode: 'branches',
      initialLineCount: 2,
      branchCount: 4,
      branchAngle: 30,
      splitPosition: 0.3,
      mergePosition: 0.7,
      curvature: 0.5,
      spacing: 25,
      transitionSmoothness: 0.8,
      strokeWidth: 1.5,
    };

    const res = generateGeometry(config, seed, dimensions, palette);
    expect(res.paths.length).toBe(8); // 2 trunks * 4 branches
    expect(res.paths[0].commands.length).toBe(6); // M, L, C, L, C, L
  });

  it('Mode 4: Interference produces parametric Lissajous curves', () => {
    const config: InterferenceConfig = {
      mode: 'interference',
      frequencyX: 3,
      frequencyY: 4,
      phase: 0.5,
      symmetry: 4,
      repetitions: 6,
      distortion: 0.1,
      scale: 0.8,
      rotation: 0,
      strokeWidth: 1.5,
    };

    const res = generateGeometry(config, seed, dimensions, palette);
    expect(res.paths.length).toBe(24); // 6 rep * 4 sym
  });

  it('Mode 5: Contours extracts isocontour lines via marching squares', () => {
    const config: ContoursConfig = {
      mode: 'contours',
      contourCount: 8,
      fieldScale: 1.2,
      noiseIntensity: 1.0,
      noiseFrequency: 0.01,
      lineSpacing: 10,
      fieldDeformation: 0.3,
      radialInfluence: 0.5,
      gridResolution: 30,
      strokeWidth: 1.5,
    };

    const res = generateGeometry(config, seed, dimensions, palette);
    expect(res.paths.length).toBeGreaterThan(0);
    expect(res.stats.pathCount).toBeGreaterThan(0);
  });

  it('Mode 6: Connections generates networked node diagrams', () => {
    const config: ConnectionsConfig = {
      mode: 'connections',
      nodeCount: 10,
      connectionCount: 15,
      pathCurvature: 0.4,
      connectionDensity: 0.7,
      showLabels: true,
      nodeSize: 8,
      layoutStyle: 'organic',
      strokeWidth: 1.5,
    };

    const res = generateGeometry(config, seed, dimensions, palette);
    expect(res.paths.length).toBeGreaterThan(15);
  });

  it('Mode 6: Connections keeps all layouts strictly within designated canvas space', () => {
    const layoutStyles: Array<'organic' | 'radial' | 'grid' | 'layered'> = [
      'organic',
      'radial',
      'grid',
      'layered',
    ];

    for (const style of layoutStyles) {
      const config: ConnectionsConfig = {
        mode: 'connections',
        nodeCount: 36,
        connectionCount: 40,
        pathCurvature: 0.8,
        connectionDensity: 0.8,
        showLabels: true,
        nodeSize: 12,
        layoutStyle: style,
        strokeWidth: 2,
      };

      const res = generateGeometry(config, seed, dimensions, palette);
      const bounds = res.stats.bounds;

      // Ensure every layout remains strictly within [0, width] and [0, height]
      expect(bounds.minX).toBeGreaterThanOrEqual(0);
      expect(bounds.minY).toBeGreaterThanOrEqual(0);
      expect(bounds.maxX).toBeLessThanOrEqual(dimensions.width);
      expect(bounds.maxY).toBeLessThanOrEqual(dimensions.height);
    }
  });
});
