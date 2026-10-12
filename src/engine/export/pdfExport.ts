import { jsPDF } from 'jspdf';
import { GeometryResult, ExportConfig, PaletteConfig } from '../core/types';

function parseHexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return [r, g, b];
  }
  return [255, 255, 255];
}

export function exportToPdf(
  result: GeometryResult,
  config: ExportConfig,
  palette: PaletteConfig
): void {
  const width = result.dimensions.width;
  const height = result.dimensions.height;
  const orientation = width > height ? 'landscape' : 'portrait';

  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: [width, height],
    compress: true,
  });

  // Background rect
  if (!config.transparentBackground) {
    const [bgR, bgG, bgB] = parseHexToRgb(config.backgroundColor || palette.background);
    doc.setFillColor(bgR, bgG, bgB);
    doc.rect(0, 0, width, height, 'F');
  }

  // Draw vector paths
  for (const path of result.paths) {
    if (!path.commands || path.commands.length === 0) continue;

    const strokeColor = path.strokeColor || '#ffffff';
    const [sr, sg, sb] = parseHexToRgb(strokeColor);
    doc.setDrawColor(sr, sg, sb);
    doc.setLineWidth(path.strokeWidth ?? 1.5);

    let hasStarted = false;
    for (const cmd of path.commands) {
      switch (cmd.type) {
        case 'M':
          doc.moveTo(cmd.x, cmd.y);
          hasStarted = true;
          break;
        case 'L':
          if (!hasStarted) {
            doc.moveTo(cmd.x, cmd.y);
            hasStarted = true;
          } else {
            doc.lineTo(cmd.x, cmd.y);
          }
          break;
        case 'C':
          if (!hasStarted) {
            doc.moveTo(cmd.x, cmd.y);
            hasStarted = true;
          } else {
            doc.curveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y);
          }
          break;
        case 'Z':
          doc.close();
          break;
      }
    }

    doc.stroke();
  }

  const filename = config.filename.endsWith('.pdf')
    ? config.filename
    : `${config.filename}.pdf`;

  doc.save(filename);
}
