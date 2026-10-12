import { describe, it, expect } from 'vitest';
import { usePlaygroundStore } from '../src/store/playgroundStore';
import { generateGeometry } from '../src/engine/generators';
import { getPaletteById, PALETTES } from '../src/store/palettes';
import { DEFAULT_DIMENSIONS } from '../src/store/defaults';
import { GeneratorMode } from '../src/engine/core/types';

describe('Regression & Optimization Tests', () => {
  it('default palette is monochrome-dark with dark background and white stroke', () => {
    const store = usePlaygroundStore.getState();
    const defaultPalette = getPaletteById(store.paletteId);
    expect(defaultPalette.id).toBe('monochrome-dark');
    expect(defaultPalette.background).toBe('#0c0d0e');
    expect(defaultPalette.primary).toBe('#ffffff');
  });

  it('switching generator modes smoothly isolates configurations and resets animation', () => {
    const store = usePlaygroundStore.getState();
    store.playAnimation();
    expect(usePlaygroundStore.getState().animation.isPlaying).toBe(true);

    const modes: GeneratorMode[] = [
      'waveforms',
      'loops',
      'branches',
      'interference',
      'contours',
      'connections',
    ];

    for (const m of modes) {
      store.setMode(m);
      const state = usePlaygroundStore.getState();
      expect(state.mode).toBe(m);
      // Switching modes resets animation to prevent running orphaned loops
      expect(state.animation.isPlaying).toBe(false);
      expect(state.animation.time).toBe(0);

      // Verify that active configuration matches the mode
      const activeConfig = state.configs[m];
      expect(activeConfig.mode).toBe(m);
    }
  });

  it('preserves customized parameters when returning to a previous mode', () => {
    const store = usePlaygroundStore.getState();
    store.setMode('waveforms');
    store.updateParam('lineCount', 47);
    expect(usePlaygroundStore.getState().configs.waveforms.lineCount).toBe(47);

    // Switch to loops and change loops
    store.setMode('loops');
    store.updateParam('loopCount', 19);
    expect(usePlaygroundStore.getState().configs.loops.loopCount).toBe(19);

    // Return to waveforms
    store.setMode('waveforms');
    expect(usePlaygroundStore.getState().configs.waveforms.lineCount).toBe(47);
  });

  it('animation controls update playback and time state accurately', () => {
    const store = usePlaygroundStore.getState();
    store.playAnimation();
    expect(usePlaygroundStore.getState().animation.isPlaying).toBe(true);

    store.pauseAnimation();
    expect(usePlaygroundStore.getState().animation.isPlaying).toBe(false);

    store.setAnimationTime(4.5);
    expect(usePlaygroundStore.getState().animation.time).toBe(4.5);

    store.resetAnimation();
    expect(usePlaygroundStore.getState().animation.isPlaying).toBe(false);
    expect(usePlaygroundStore.getState().animation.time).toBe(0);
  });

  it('deterministic geometry generation across time frames for all 6 modes', () => {
    const store = usePlaygroundStore.getState();
    const palette = PALETTES[0];
    const seed = 42;
    const time = 1.25;

    const modes: GeneratorMode[] = [
      'waveforms',
      'loops',
      'branches',
      'interference',
      'contours',
      'connections',
    ];

    for (const m of modes) {
      const config = store.configs[m];
      const g1 = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette, time);
      const g2 = generateGeometry(config, seed, DEFAULT_DIMENSIONS, palette, time);

      expect(g1.paths.length).toBe(g2.paths.length);
      expect(g1.paths[0].commands).toEqual(g2.paths[0].commands);
      expect(Number.isFinite(g1.stats.bounds.width)).toBe(true);
      expect(Number.isFinite(g1.stats.bounds.height)).toBe(true);
      expect(g1.stats.bounds.minX).toBeGreaterThanOrEqual(-100);
    }
  });
});
