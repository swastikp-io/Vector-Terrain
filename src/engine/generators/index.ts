import {
  GeneratorConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  GeneratorMode,
} from '../core/types';
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
  switch (config.mode) {
    case 'waveforms':
      return generateWaveforms(config, seed, dimensions, palette, time);
    case 'loops':
      return generateLoops(config, seed, dimensions, palette, time);
    case 'branches':
      return generateBranches(config, seed, dimensions, palette, time);
    case 'interference':
      return generateInterference(config, seed, dimensions, palette, time);
    case 'contours':
      return generateContours(config, seed, dimensions, palette, time);
    case 'connections':
      return generateConnections(config, seed, dimensions, palette, time);
    default:
      throw new Error(`Unknown generator mode: ${(config as any).mode}`);
  }
}
