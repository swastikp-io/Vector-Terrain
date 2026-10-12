import {
  BranchesConfig,
  GeometryResult,
  ArtboardDimensions,
  PaletteConfig,
  VectorPath,
  PathCommand,
} from '../core/types';
import { createRandom } from '../core/random';
import { calculateGeometryBounds } from '../core/geometry';
import { resolvePathColor } from '../../store/palettes';
import { clamp } from '../core/math';

export function generateBranches(
  config: BranchesConfig,
  seed: number,
  dimensions: ArtboardDimensions,
  palette: PaletteConfig,
  time = 0
): GeometryResult {
  const startTime = performance.now();
  const rng = createRandom(seed);
  const { width, height } = dimensions;

  const initialLineCount = Math.max(1, Math.floor(config.initialLineCount));
  const branchCount = Math.max(2, Math.floor(config.branchCount));
  const splitPos = clamp(config.splitPosition, 0.1, 0.45);
  const mergePos = clamp(config.mergePosition, 0.55, 0.9);
  const curvature = config.curvature;
  const spacing = config.spacing;
  const smoothness = clamp(config.transitionSmoothness, 0.1, 1.0);

  const paths: VectorPath[] = [];

  const marginX = width * 0.08;
  const usableWidth = width - marginX * 2;
  const centerY = height / 2;

  const xStart = marginX;
  const xSplit = marginX + usableWidth * splitPos;
  const xMerge = marginX + usableWidth * mergePos;
  const xEnd = width - marginX;

  const totalLines = initialLineCount * branchCount;
  let pathIndex = 0;

  for (let trunkIdx = 0; trunkIdx < initialLineCount; trunkIdx++) {
    const trunkNorm = initialLineCount > 1 ? (trunkIdx / (initialLineCount - 1)) * 2 - 1 : 0;
    const safeMarginY = height * 0.05;
    const trunkBaseY = clamp(centerY + trunkNorm * (initialLineCount * 18), safeMarginY, height - safeMarginY);

    for (let b = 0; b < branchCount; b++) {
      const branchNorm = (b / (branchCount - 1)) * 2 - 1; // -1 to +1
      // Target expanded Y position during the branch zone
      const branchFanY = trunkBaseY + branchNorm * (branchCount * spacing * 0.5);

      // Add controlled wave undulation during the expanded zone
      const waveOffset = Math.sin(b * 0.8 + time + trunkIdx) * (curvature * 25);
      const branchMidY = clamp(branchFanY + waveOffset, safeMarginY, height - safeMarginY);

      // Construct continuous smooth cubic Bézier stream
      // 1. Initial parallel segment: (xStart, trunkBaseY) -> (xSplit, trunkBaseY)
      // 2. Split S-curve: (xSplit, trunkBaseY) -> (xMid1, branchMidY)
      // 3. Central flowing segment: (xMid1, branchMidY) -> (xMid2, branchMidY)
      // 4. Merge S-curve: (xMid2, branchMidY) -> (xMerge, trunkBaseY)
      // 5. Final parallel segment: (xMerge, trunkBaseY) -> (xEnd, trunkBaseY)

      const splitTransitionWidth = (xMerge - xSplit) * (0.35 * smoothness);
      const xBranchStart = xSplit + splitTransitionWidth;
      const xBranchEnd = xMerge - splitTransitionWidth;

      const cpDistance = splitTransitionWidth * 0.55;

      const commands: PathCommand[] = [
        { type: 'M', x: xStart, y: trunkBaseY },
        { type: 'L', x: xSplit, y: trunkBaseY },
        // Smooth S-curve to branch
        {
          type: 'C',
          cp1x: xSplit + cpDistance,
          cp1y: trunkBaseY,
          cp2x: xBranchStart - cpDistance,
          cp2y: branchMidY,
          x: xBranchStart,
          y: branchMidY,
        },
        // Central branch run
        { type: 'L', x: xBranchEnd, y: branchMidY },
        // Smooth merge back
        {
          type: 'C',
          cp1x: xBranchEnd + cpDistance,
          cp1y: branchMidY,
          cp2x: xMerge - cpDistance,
          cp2y: trunkBaseY,
          x: xMerge,
          y: trunkBaseY,
        },
        // Final parallel run
        { type: 'L', x: xEnd, y: trunkBaseY },
      ];

      const color = resolvePathColor(palette, pathIndex, totalLines);

      paths.push({
        id: `branch-${trunkIdx}-${b}`,
        commands,
        strokeColor: color,
        strokeWidth: config.strokeWidth,
        strokeOpacity: 0.9,
        strokeCap: 'round',
        strokeJoin: 'round',
        closed: false,
      });

      pathIndex++;
    }
  }

  const bounds = calculateGeometryBounds(paths);

  return {
    paths,
    dimensions,
    seed,
    mode: 'branches',
    generationTimeMs: performance.now() - startTime,
    stats: {
      pathCount: paths.length,
      segmentCount: paths.length * 5,
      bounds,
    },
    metadata: { initialLineCount, branchCount, splitPos, mergePos },
  };
}
