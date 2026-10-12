import { GeometryResult, VectorPath } from '../core/types';

export interface CanvasRenderOptions {
  scale?: number;
  transparentBackground?: boolean;
  backgroundColor?: string;
}

/**
 * Draws a VectorPath onto a standard CanvasRenderingContext2D.
 */
export function drawPathToCanvasContext(
  ctx: CanvasRenderingContext2D,
  path: VectorPath
): void {
  if (!path.commands || path.commands.length === 0) return;

  ctx.save();

  if (path.strokeColor && (path.strokeWidth ?? 1) > 0) {
    ctx.strokeStyle = path.strokeColor;
    ctx.lineWidth = path.strokeWidth ?? 1.5;
    ctx.globalAlpha = path.strokeOpacity ?? 1;
    ctx.lineCap = path.strokeCap || 'round';
    ctx.lineJoin = path.strokeJoin || 'round';
    if (path.strokeDashArray?.length) {
      ctx.setLineDash(path.strokeDashArray);
    }
  }

  ctx.beginPath();
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'M':
        ctx.moveTo(cmd.x, cmd.y);
        break;
      case 'L':
        ctx.lineTo(cmd.x, cmd.y);
        break;
      case 'C':
        ctx.bezierCurveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y);
        break;
      case 'Q':
        ctx.quadraticCurveTo(cmd.cpx, cmd.cpy, cmd.x, cmd.y);
        break;
      case 'Z':
        ctx.closePath();
        break;
    }
  }

  if (path.closed) {
    ctx.closePath();
  }

  if (path.fillColor && path.fillColor !== 'none') {
    ctx.fillStyle = path.fillColor;
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = path.fillOpacity ?? 1;
    ctx.fill();
    ctx.globalAlpha = oldAlpha;
  }

  if (path.strokeColor && (path.strokeWidth ?? 1) > 0) {
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Renders GeometryResult onto an offscreen canvas at specified scale.
 */
export function renderGeometryToCanvas(
  result: GeometryResult,
  options: CanvasRenderOptions = {}
): HTMLCanvasElement {
  const scale = options.scale ?? 1;
  const width = Math.round(result.dimensions.width * scale);
  const height = Math.round(result.dimensions.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context');
  }

  // Handle background
  if (!options.transparentBackground) {
    ctx.fillStyle = options.backgroundColor || '#0c0d0e';
    ctx.fillRect(0, 0, width, height);
  }

  // Scale context
  ctx.scale(scale, scale);

  for (const path of result.paths) {
    drawPathToCanvasContext(ctx, path);
  }

  return canvas;
}
