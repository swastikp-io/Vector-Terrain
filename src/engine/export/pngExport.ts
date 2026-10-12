import { GeometryResult, ExportConfig, PaletteConfig } from '../core/types';
import { renderGeometryToCanvas } from '../renderers/canvasRenderer';
import { downloadBlob } from '../../utils/download';

export async function exportToPng(
  result: GeometryResult,
  config: ExportConfig,
  palette: PaletteConfig
): Promise<void> {
  const canvas = renderGeometryToCanvas(result, {
    scale: config.scale,
    transparentBackground: config.transparentBackground,
    backgroundColor: config.backgroundColor || palette.background,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate PNG blob from canvas'));
          return;
        }
        const filename = config.filename.endsWith('.png')
          ? config.filename
          : `${config.filename}.png`;

        downloadBlob(blob, filename);
        resolve();
      },
      'image/png',
      1.0
    );
  });
}
