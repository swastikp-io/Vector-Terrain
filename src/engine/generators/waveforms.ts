import {
  WaveformsConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  VectorPath,
  Point2D,
} from '../core/types';
import { createRandom } from '../core/random';
import { catmullRomToCommands, calculateGeometryBounds } from '../core/geometry';
import { resolvePathColor } from '../../store/palettes';
import { clamp } from '../core/math';

export function generateWaveforms(
  config: WaveformsConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  const startTime = performance.now();
  const rng = createRandom(seed);
  const { width, height } = dimensions;

  const lineCount = Math.max(2, Math.floor(config.lineCount));
  const amplitude = config.amplitude;
  const frequency = config.frequency;
  const phaseOffset = config.phaseOffset;
  const curvature = config.curvature;
  const distortion = config.distortion;
  const splitMergeStrength = config.splitMergeStrength;
  const transitionRegions = Math.max(1, Math.floor(config.transitionRegions));

  const paths: VectorPath[] = [];

  const marginX = width * 0.08;
  const marginY = height * 0.12;
  const usableWidth = width - marginX * 2;
  const usableHeight = height - marginY * 2;

  const totalBandHeight = Math.min(usableHeight, lineCount * config.verticalSpacing);
  const startY = (height - totalBandHeight) / 2;

  const steps = 70;

  for (let i = 0; i < lineCount; i++) {
    const normIndex = lineCount > 1 ? (i / (lineCount - 1)) * 2 - 1 : 0; // -1 to +1
    const baseLineY = startY + (i / Math.max(1, lineCount - 1)) * totalBandHeight;
    const points: Point2D[] = [];

    // Individual line frequency & phase variations
    const linePhase = phaseOffset + i * 0.22 + time * 1.5;
    const lineNoiseSeed = i * 0.37;

    for (let s = 0; s <= steps; s++) {
      const u = s / steps; // 0 to 1
      const x = marginX + u * usableWidth;

      // Envelope: parallel at ends (u = 0 and u = 1), active in transition regions
      const envelope = Math.sin(u * Math.PI) * Math.pow(Math.sin(u * Math.PI * transitionRegions), 2);
      const mainWave = Math.sin(u * Math.PI * 2 * frequency + linePhase) * amplitude;

      // Curvature & harmonic distortion
      const harmonic = Math.cos(u * Math.PI * 4 * frequency + linePhase * 0.5) * (amplitude * 0.35 * curvature);

      // Noise turbulence
      const noiseVal = distortion > 0 ? rng.noise2D(u * 3 + lineNoiseSeed, time * 0.5) * amplitude * distortion : 0;

      // Split & merge effect: curves expand outward and pinch inward
      const pinchFactor = Math.sin(u * Math.PI * transitionRegions * 2 + time);
      const splitOffset = normIndex * splitMergeStrength * 60 * pinchFactor;

      const y = baseLineY + (mainWave + harmonic + noiseVal) * envelope + splitOffset * Math.sin(u * Math.PI);

      points.push({
        x: clamp(x, 0, width),
        y: clamp(y, 0, height),
      });
    }

    const commands = catmullRomToCommands(points, false, 0.9);
    const color = resolvePathColor(palette, i, lineCount);

    paths.push({
      id: `waveform-${i}`,
      commands,
      strokeColor: color,
      strokeWidth: config.strokeWidth,
      strokeRoughness: config.strokeRoughness,
      strokeOpacity: 0.88,
      strokeCap: 'round',
      strokeJoin: 'round',
      closed: false,
    });
  }

  const bounds = calculateGeometryBounds(paths);

  return {
    paths,
    dimensions,
    seed,
    mode: 'waveforms',
    generationTimeMs: performance.now() - startTime,
    stats: {
      pathCount: paths.length,
      segmentCount: paths.length * steps,
      bounds,
    },
    metadata: { lineCount, transitionRegions, amplitude },
  };
}
