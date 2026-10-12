import { describe, it, expect } from 'vitest';
import { usePlaygroundStore } from '../src/store/playgroundStore';
import { PRESETS } from '../src/store/presets';
import { PARAM_DEFINITIONS } from '../src/store/defaults';

describe('Playground Store & Presets', () => {
  it('loads preset configuration, seed, and dimensions accurately', () => {
    const store = usePlaygroundStore.getState();
    const preset = PRESETS.find((p) => p.id === 'wf-braided-stream')!;

    store.loadPreset(preset);

    const updated = usePlaygroundStore.getState();
    expect(updated.mode).toBe('waveforms');
    expect(updated.seed).toBe(preset.seed);
    expect(updated.paletteId).toBe(preset.paletteId);
    expect(updated.activePresetId).toBe('wf-braided-stream');
    expect(updated.configs.waveforms.lineCount).toBe((preset.config as any).lineCount);
  });

  it('preserves locked parameters during randomization', () => {
    const store = usePlaygroundStore.getState();
    store.updateParam('lineCount', 33);
    store.toggleLockParam('lineCount');

    expect(usePlaygroundStore.getState().lockedParams['lineCount']).toBe(true);

    store.randomizeGeometryOnly();

    const after = usePlaygroundStore.getState();
    expect(after.configs.waveforms.lineCount).toBe(33); // Locked param untouched!
  });

  it('keeps randomized values within defined schema bounds', () => {
    const store = usePlaygroundStore.getState();
    // unlock all
    usePlaygroundStore.setState({ lockedParams: {} });

    for (let i = 0; i < 10; i++) {
      store.randomizeGeometryOnly();
      const current = usePlaygroundStore.getState();
      const defs = PARAM_DEFINITIONS[current.mode];

      defs.forEach((def) => {
        if (def.type === 'range') {
          const val = (current.configs[current.mode] as any)[def.key];
          expect(val).toBeGreaterThanOrEqual(def.min);
          expect(val).toBeLessThanOrEqual(def.max);
        }
      });
    }
  });

  it('supports undo and redo of parameter updates', () => {
    const store = usePlaygroundStore.getState();
    const initialSeed = 555;
    store.setSeed(initialSeed);

    store.setSeed(999);
    expect(usePlaygroundStore.getState().seed).toBe(999);

    store.undo();
    expect(usePlaygroundStore.getState().seed).toBe(initialSeed);

    store.redo();
    expect(usePlaygroundStore.getState().seed).toBe(999);
  });
});
