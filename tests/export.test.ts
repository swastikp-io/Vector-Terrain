import { describe, it, expect } from 'vitest';
import { renderToSvgString, commandsToSvgPathData } from '../src/engine/renderers/svgRenderer';
import { generateGeometry } from '../src/engine/generators';
import { DEFAULT_WAVEFORMS, DEFAULT_DIMENSIONS } from '../src/store/defaults';
import { PALETTES } from '../src/store/palettes';

describe('Export Pipeline Tests', () => {
  const geometry = generateGeometry(
    DEFAULT_WAVEFORMS,
    42,
    DEFAULT_DIMENSIONS,
    PALETTES[0]
  );

  it('generates valid standalone SVG XML markup', () => {
    const svg = renderToSvgString(geometry, {
      includeBackground: true,
      backgroundColor: '#0c0d0e',
      width: 1000,
      height: 1000,
    });

    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 1000 1000"');
    expect(svg).toContain('width="1000"');
    expect(svg).toContain('height="1000"');
    expect(svg).toContain('<rect width="100%" height="100%" fill="#0c0d0e" />');
    expect(svg).toContain('<g id="layer-artwork" fill="none">');
    expect(svg).toContain('</svg>');
  });

  it('omits background rect when transparent background is requested', () => {
    const svg = renderToSvgString(geometry, {
      includeBackground: false,
    });

    expect(svg).not.toContain('<rect width="100%" height="100%"');
    expect(svg).toContain('<g id="layer-artwork"');
  });

  it('serializes path commands with precision formatting', () => {
    const cmdStr = commandsToSvgPathData([
      { type: 'M', x: 10.12345, y: 20.98765 },
      {
        type: 'C',
        cp1x: 12.345,
        cp1y: 23.456,
        cp2x: 34.567,
        cp2y: 45.678,
        x: 50.111,
        y: 60.222,
      },
      { type: 'Z' },
    ], 2);

    expect(cmdStr).toBe('M 10.12 20.99 C 12.35 23.46 34.57 45.68 50.11 60.22 Z');
  });

  it('embeds generation metadata in SVG desc element', () => {
    const svg = renderToSvgString(geometry);
    expect(svg).toContain(`Mode: ${geometry.mode}`);
    expect(svg).toContain(`Seed: ${geometry.seed}`);
  });
});
