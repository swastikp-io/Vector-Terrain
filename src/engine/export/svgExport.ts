import { GeometryResult, ExportConfig, PaletteConfig } from '../core/types';
import { renderToSvgString } from '../renderers/svgRenderer';
import { downloadStringAsFile } from '../../utils/download';

export function exportToSvg(
  result: GeometryResult,
  config: ExportConfig,
  palette: PaletteConfig
): void {
  const svgContent = renderToSvgString(result, {
    includeBackground: !config.transparentBackground,
    backgroundColor: config.backgroundColor || palette.background,
    width: config.width * config.scale,
    height: config.height * config.scale,
    title: `Procedural Vector Art - ${result.mode.toUpperCase()} (Seed: ${result.seed})`,
  });

  const filename = config.filename.endsWith('.svg')
    ? config.filename
    : `${config.filename}.svg`;

  downloadStringAsFile(svgContent, filename, 'image/svg+xml;charset=utf-8');
}
