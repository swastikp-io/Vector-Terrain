import type p5 from 'p5';
import { GeometryResult, VectorPath } from '../core/types';
import { drawPathToCanvasContext } from './canvasRenderer';

export interface P5RenderOptions {
  showArtboardBounds?: boolean;
  clearOnly?: boolean;
  showGuides?: boolean;
}

/**
 * Draws a single VectorPath on a p5 canvas using its native 2D drawingContext.
 */
export function drawPathToP5(p: p5, path: VectorPath): void {
  if (!path.commands || path.commands.length === 0) return;
  const ctx = (p as any).drawingContext as CanvasRenderingContext2D;
  if (!ctx) return;

  drawPathToCanvasContext(ctx, path);
}

/**
 * Renders complete GeometryResult to p5 instance.
 */
export function renderGeometryToP5(
  p: p5,
  result: GeometryResult,
  options: P5RenderOptions = {}
): void {
  if (!result || !result.paths) return;

  for (const path of result.paths) {
    drawPathToP5(p, path);
  }

  if (options.showGuides) {
    const ctx = (p as any).drawingContext as CanvasRenderingContext2D | null | undefined;
    if (ctx) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(0, 0, result.dimensions.width, result.dimensions.height);
      ctx.restore();
    }
  }
}
