import {
  LoopsConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  VectorPath,
  Point2D,
} from '../core/types';
import { createRandom } from '../core/random';
import { catmullRomToCommands, calculateGeometryBounds } from '../core/geometry';
import { resolvePathColor } from '../../store/palettes';
import { vecRotate, clamp } from '../core/math';

export function generateLoops(
  config: LoopsConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  const startTime = performance.now();
  const rng = createRandom(seed);
  const { width, height } = dimensions;

  const loopCount = Math.max(2, Math.floor(config.loopCount));
  const loopWidth = config.loopWidth;
  const loopHeight = config.loopHeight;
  const spacingX = config.horizontalSpacing;
  const verticalOffset = config.verticalOffset;
  const rotationBase = (config.rotation * Math.PI) / 180;
  const overlap = config.overlap;
  const phase = config.phase + time;
  const symmetry = config.symmetry;
  const connectConsecutive = config.connectConsecutive;

  const paths: VectorPath[] = [];

  const totalWidth = (loopCount - 1) * spacingX * (1 - overlap * 0.5);
  const startX = (width - totalWidth) / 2;
  const centerY = height / 2;

  const stepsPerLoop = 60;
  const connectedPoints: Point2D[] = [];

  for (let i = 0; i < loopCount; i++) {
    const loopX = startX + i * spacingX * (1 - overlap * 0.5);
    const waveY = Math.sin(i * 0.45 + phase) * verticalOffset;
    const center = { x: loopX, y: centerY + waveY };

    const loopRot = rotationBase + (symmetry && i % 2 === 1 ? -1 : 1) * (i * 0.08);
    const loopPoints: Point2D[] = [];

    // Parametric elliptical orbital loop
    for (let s = 0; s < stepsPerLoop; s++) {
      const theta = (s / stepsPerLoop) * Math.PI * 2;
      // Slight figure-8 or tear distortion
      const radiusX = (loopWidth / 2) * (1 + 0.15 * Math.sin(theta * 2));
      const radiusY = (loopHeight / 2) * (1 + 0.1 * Math.cos(theta * 3));

      const rawPt: Point2D = {
        x: Math.cos(theta) * radiusX,
        y: Math.sin(theta) * radiusY,
      };

      const rotated = vecRotate(rawPt, loopRot);
      const finalPt = {
        x: clamp(center.x + rotated.x, 0, width),
        y: clamp(center.y + rotated.y, 0, height),
      };

      loopPoints.push(finalPt);
    }

    if (connectConsecutive) {
      connectedPoints.push(...loopPoints);
    } else {
      const commands = catmullRomToCommands(loopPoints, true, 1.0);
      const color = resolvePathColor(palette, i, loopCount);

      paths.push({
        id: `loop-${i}`,
        commands,
        strokeColor: color,
        strokeWidth: config.strokeWidth,
        strokeOpacity: 0.9,
        strokeCap: 'round',
        strokeJoin: 'round',
        closed: true,
      });
    }
  }

  if (connectConsecutive && connectedPoints.length > 0) {
    const commands = catmullRomToCommands(connectedPoints, false, 0.9);
    paths.push({
      id: 'loop-continuous-0',
      commands,
      strokeColor: palette.primary,
      strokeWidth: config.strokeWidth,
      strokeOpacity: 0.92,
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
    mode: 'loops',
    generationTimeMs: performance.now() - startTime,
    stats: {
      pathCount: paths.length,
      segmentCount: paths.length * stepsPerLoop,
      bounds,
    },
    metadata: { loopCount, connectConsecutive, symmetry },
  };
}
