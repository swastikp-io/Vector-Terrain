import { GeometryResult, ExportConfig, PaletteConfig, GeneratorConfig } from '../core/types';
import { exportToSvg } from './svgExport';
import { exportToPng } from './pngExport';
import { exportToPdf } from './pdfExport';
import { exportToAnimation, AnimationExportOptions } from './animationExport';

export * from './svgExport';
export * from './pngExport';
export * from './pdfExport';
export * from './animationExport';

export async function executeExport(
  result: GeometryResult,
  config: ExportConfig,
  palette: PaletteConfig,
  generatorContext?: {
    activeConfig: GeneratorConfig;
    seed: number;
  }
): Promise<Blob | void> {
  switch (config.format) {
    case 'svg':
      exportToSvg(result, config, palette);
      break;
    case 'png':
      await exportToPng(result, config, palette);
      break;
    case 'pdf':
      exportToPdf(result, config, palette);
      break;
    case 'webm':
    case 'mp4':
      if (!generatorContext) {
        throw new Error('Animation export requires generator configuration context.');
      }
      return await exportToAnimation({
        config: generatorContext.activeConfig,
        seed: generatorContext.seed,
        dimensions: result.dimensions,
        palette,
        exportConfig: config,
      });
    default:
      throw new Error(`Unsupported export format: ${(config as any).format}`);
  }
}
