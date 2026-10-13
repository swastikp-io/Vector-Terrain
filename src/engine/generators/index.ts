import {
  GeneratorConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  GeneratorMode,
} from '../core/types';
import { applyStrokeRoughness, calculateGeometryBounds } from '../core/geometry';
import { generateWaveforms } from './waveforms';
import { generateLoops } from './loops';
import { generateBranches } from './branches';
import { generateInterference } from './interference';
import { generateContours } from './contours';
import { generateConnections } from './connections';

export {
  generateWaveforms,
  generateLoops,
  generateBranches,
  generateInterference,
  generateContours,
  generateConnections,
};

export function generateGeometry(
  config: GeneratorConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  let result: GeometryResult;

  switch (config.mode) {
    case 'waveforms':
      result = generateWaveforms(config, seed, dimensions, palette, time);
      break;
    case 'loops':
      result = generateLoops(config, seed, dimensions, palette, time);
      break;
    case 'branches':
      result = generateBranches(config, seed, dimensions, palette, time);
      break;
    case 'interference':
      result = generateInterference(config, seed, dimensions, palette, time);
      break;
    case 'contours':
      result = generateContours(config, seed, dimensions, palette, time);
      break;
    case 'connections':
      result = generateConnections(config, seed, dimensions, palette, time);
      break;
    default:
      throw new Error(`Unknown generator mode: ${(config as any).mode}`);
  }

  const roughness = config.strokeRoughness ?? 0;
  if (roughness > 0 && result.paths && result.paths.length > 0) {
    result.paths = applyStrokeRoughness(result.paths, roughness, seed, dimensions);
    result.stats.bounds = calculateGeometryBounds(result.paths);
    result.stats.segmentCount = result.paths.reduce(
      (acc, p) => acc + (p.commands?.length || 0),
      0
    );
  }

  return result;
}
