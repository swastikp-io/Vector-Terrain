import { PaletteConfig } from '../engine/core/types';

export const PALETTES: PaletteConfig[] = [
  {
    id: 'monochrome-dark',
    name: 'Monochrome Dark',
    background: '#0c0d0e',
    primary: '#ffffff',
    secondary: '#8e919a',
    accent: '#d4d4d8',
    colors: ['#ffffff', '#a1a1aa', '#71717a', '#52525b', '#e4e4e7'],
    mode: 'monochrome',
  },
  {
    id: 'monochrome-light',
    name: 'Monochrome Light',
    background: '#ffffff',
    primary: '#000000',
    secondary: '#555555',
    accent: '#222222',
    colors: ['#000000', '#222222', '#444444', '#666666', '#888888'],
    mode: 'monochrome',
  },
];

export function getPaletteById(id: string): PaletteConfig {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}

export function resolvePathColor(
  palette: PaletteConfig,
  index: number,
  total: number
): string {
  if (palette.mode === 'monochrome') {
    return palette.primary;
  }
  if (palette.mode === 'dual') {
    return index % 2 === 0 ? palette.primary : palette.secondary;
  }
  // multi
  const colorIndex = index % palette.colors.length;
  return palette.colors[colorIndex];
}
