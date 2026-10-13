import {
  InterferenceConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  VectorPath,
  Point2D,
} from '../core/types';
import { catmullRomToCommands, calculateGeometryBounds } from '../core/geometry';
import { resolvePathColor } from '../../store/palettes';
import { vecRotate, clamp } from '../core/math';

export function generateInterference(
  config: InterferenceConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  const startTime = performance.now();
  const { width, height } = dimensions;

  const freqX = config.frequencyX;
  const freqY = config.frequencyY;
  const basePhase = config.phase + time;
  const symmetry = Math.max(1, Math.min(8, Math.floor(config.symmetry)));
  const repetitions = Math.max(1, Math.min(60, Math.floor(config.repetitions)));
  const distortion = config.distortion;
  const scale = config.scale;
  const baseRot = (config.rotation * Math.PI) / 180;

  const center: Point2D = { x: width / 2, y: height / 2 };
  const baseRadius = (Math.min(width, height) / 2) * 0.78 * scale;

  const paths: VectorPath[] = [];
  const stepsPerCurve = 140;

  let pathIdx = 0;
  const totalPaths = repetitions * symmetry;

  for (let r = 0; r < repetitions; r++) {
    const tRep = repetitions > 1 ? r / (repetitions - 1) : 0;
    const repPhase = basePhase + tRep * Math.PI * 1.5;
    const repRadius = baseRadius * (0.35 + 0.65 * (1 - tRep * 0.4));

    const rawPoints: Point2D[] = [];

    for (let s = 0; s <= stepsPerCurve; s++) {
      const theta = (s / stepsPerCurve) * Math.PI * 2;

      // Lissajous equations with harmonic distortion
      const xHarmonic = Math.cos(theta * freqX + repPhase);
      const yHarmonic = Math.sin(theta * freqY);

      const distVal = distortion * Math.sin(theta * 6 + repPhase * 2);

      const px = (xHarmonic + distVal * 0.25) * repRadius;
      const py = (yHarmonic + distVal * 0.25) * repRadius;

      rawPoints.push({ x: px, y: py });
    }

    // Apply symmetry rotations
    for (let sym = 0; sym < symmetry; sym++) {
      const symAngle = baseRot + (sym * Math.PI * 2) / symmetry;

      const transformedPoints: Point2D[] = rawPoints.map((pt) => {
        const rot = vecRotate(pt, symAngle);
        return {
          x: clamp(center.x + rot.x, 0, width),
          y: clamp(center.y + rot.y, 0, height),
        };
      });

      const commands = catmullRomToCommands(transformedPoints, true, 1.0);
      const color = resolvePathColor(palette, pathIdx, totalPaths);

      paths.push({
        id: `interference-${r}-${sym}`,
        commands,
        strokeColor: color,
        strokeWidth: config.strokeWidth,
        strokeRoughness: config.strokeRoughness,
        strokeOpacity: 0.85,
        strokeCap: 'round',
        strokeJoin: 'round',
        closed: true,
      });

      pathIdx++;
    }
  }

  const bounds = calculateGeometryBounds(paths);

  return {
    paths,
    dimensions,
    seed,
    mode: 'interference',
    generationTimeMs: performance.now() - startTime,
    stats: {
      pathCount: paths.length,
      segmentCount: paths.length * stepsPerCurve,
      bounds,
    },
    metadata: { repetitions, symmetry, freqX, freqY },
  };
}
