import { PathCommand, VectorPath, GeometryResult, ArtboardDimensions } from '../core/types';

export interface SvgRenderOptions {
  includeBackground?: boolean;
  backgroundColor?: string;
  precision?: number;
  width?: number;
  height?: number;
  title?: string;
}

/**
 * Converts PathCommands to SVG path 'd' string with precision control.
 */
export function commandsToSvgPathData(
  commands: PathCommand[],
  precision = 2
): string {
  const round = (n: number) => Number(n.toFixed(precision));

  return commands
    .map((cmd) => {
      switch (cmd.type) {
        case 'M':
          return `M ${round(cmd.x)} ${round(cmd.y)}`;
        case 'L':
          return `L ${round(cmd.x)} ${round(cmd.y)}`;
        case 'C':
          return `C ${round(cmd.cp1x)} ${round(cmd.cp1y)} ${round(cmd.cp2x)} ${round(cmd.cp2y)} ${round(cmd.x)} ${round(cmd.y)}`;
        case 'Q':
          return `Q ${round(cmd.cpx)} ${round(cmd.cpy)} ${round(cmd.x)} ${round(cmd.y)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}

/**
 * Converts a single VectorPath into an SVG `<path>` XML element string.
 */
export function renderPathToSvgElement(
  path: VectorPath,
  defaultStroke = '#ffffff',
  precision = 2
): string {
  const d = commandsToSvgPathData(path.commands, precision);
  if (!d) return '';

  const stroke = path.strokeColor || defaultStroke;
  const strokeWidth = path.strokeWidth ?? 1.5;
  const strokeOpacity = path.strokeOpacity ?? 1;
  const fill = path.fillColor || 'none';
  const fillOpacity = path.fillOpacity ?? (path.fillColor ? 1 : 0);
  const strokeCap = path.strokeCap || 'round';
  const strokeJoin = path.strokeJoin || 'round';
  const dashArray = path.strokeDashArray?.length
    ? `stroke-dasharray="${path.strokeDashArray.join(' ')}"`
    : '';

  return `  <path id="${path.id}" d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOpacity}" stroke-linecap="${strokeCap}" stroke-linejoin="${strokeJoin}" fill="${fill}" fill-opacity="${fillOpacity}" ${dashArray} />`;
}

/**
 * Renders a full GeometryResult into a clean, standalone, valid SVG document.
 */
export function renderToSvgString(
  result: GeometryResult,
  options: SvgRenderOptions = {}
): string {
  const {
    includeBackground = true,
    backgroundColor = '#0c0d0e',
    precision = 2,
    width = result.dimensions.width,
    height = result.dimensions.height,
    title = 'Vector Terrain',
  } = options;

  const viewBox = `0 0 ${result.dimensions.width} ${result.dimensions.height}`;

  const pathsSvg = result.paths
    .map((p) => renderPathToSvgElement(p, '#ffffff', precision))
    .filter(Boolean)
    .join('\n');

  const backgroundSvg = includeBackground
    ? `  <!-- Background -->\n  <rect width="100%" height="100%" fill="${backgroundColor}" />\n`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
  <title>${title}</title>
  <desc>Mode: ${result.mode} | Seed: ${result.seed} | Generated: ${new Date().toISOString()}</desc>
  <defs />
${backgroundSvg}  <!-- Vector Paths (Count: ${result.paths.length}) -->
  <g id="layer-artwork" fill="none">
${pathsSvg}
  </g>
</svg>`;
}
