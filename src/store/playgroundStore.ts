import { create } from 'zustand';
import {
  GeneratorMode,
  GeneratorConfig,
  ArtboardDimensions,
  Point2D,
} from '../engine/core/types';
import {
  DEFAULT_WAVEFORMS,
  DEFAULT_LOOPS,
  DEFAULT_BRANCHES,
  DEFAULT_INTERFERENCE,
  DEFAULT_CONTOURS,
  DEFAULT_CONNECTIONS,
  DEFAULT_DIMENSIONS,
  PARAM_DEFINITIONS,
} from './defaults';
import { PRESETS, PresetItem } from './presets';
import { PALETTES } from './palettes';
import { createRandom } from '../engine/core/random';

interface HistorySnapshot {
  mode: GeneratorMode;
  config: GeneratorConfig;
  seed: number;
  paletteId: string;
}

export interface PlaygroundState {
  // Core state
  mode: GeneratorMode;
  configs: {
    waveforms: typeof DEFAULT_WAVEFORMS;
    loops: typeof DEFAULT_LOOPS;
    branches: typeof DEFAULT_BRANCHES;
    interference: typeof DEFAULT_INTERFERENCE;
    contours: typeof DEFAULT_CONTOURS;
    connections: typeof DEFAULT_CONNECTIONS;
  };
  seed: number;
  paletteId: string;
  dimensions: ArtboardDimensions;
  transparentBackground: boolean;
  showGuides: boolean;

  // Viewport / canvas navigation
  zoom: number;
  pan: Point2D;

  // Presets and locks
  activePresetId: string | null;
  lockedParams: Record<string, boolean>;
  isPaletteLocked: boolean;

  // Animation
  animation: {
    isPlaying: boolean;
    speed: number;
    time: number;
  };

  // History stack for undo / redo
  history: {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
  };

  // Actions
  setMode: (mode: GeneratorMode) => void;
  updateParam: (key: string, value: any) => void;
  setSeed: (seed: number) => void;
  rollSeed: () => void;
  setPaletteId: (id: string) => void;
  setDimensions: (dim: ArtboardDimensions) => void;
  toggleGuides: () => void;
  toggleTransparent: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point2D) => void;
  resetView: () => void;
  loadPreset: (preset: PresetItem) => void;
  toggleLockParam: (paramKey: string) => void;
  toggleLockPalette: () => void;
  randomizeAll: () => void;
  randomizeGeometryOnly: () => void;
  randomizePaletteOnly: () => void;
  resetCurrentMode: () => void;
  undo: () => void;
  redo: () => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
  resetAnimation: () => void;
  toggleAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationTime: (time: number) => void;
  tickAnimation: (deltaTimeSec: number) => void;
  getActiveConfig: () => GeneratorConfig;
  setConfigForMode: (mode: GeneratorMode, config: Partial<GeneratorConfig>) => void;
}

const MAX_HISTORY = 30;

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  mode: 'waveforms',
  configs: {
    waveforms: { ...DEFAULT_WAVEFORMS },
    loops: { ...DEFAULT_LOOPS },
    branches: { ...DEFAULT_BRANCHES },
    interference: { ...DEFAULT_INTERFERENCE },
    contours: { ...DEFAULT_CONTOURS },
    connections: { ...DEFAULT_CONNECTIONS },
  },
  seed: 1042,
  paletteId: 'monochrome-light',
  dimensions: { ...DEFAULT_DIMENSIONS },
  transparentBackground: false,
  showGuides: true,

  zoom: 1.0,
  pan: { x: 0, y: 0 },

  activePresetId: 'wf-braided-stream',
  lockedParams: {},
  isPaletteLocked: false,

  animation: {
    isPlaying: false,
    speed: 1.0,
    time: 0,
  },

  history: {
    past: [],
    future: [],
  },

  getActiveConfig: () => {
    const state = get();
    return state.configs[state.mode];
  },

  setConfigForMode: (mode, config) => {
    set((s) => ({
      mode,
      configs: {
        ...s.configs,
        [mode]: {
          ...s.configs[mode],
          ...config,
        },
      },
      activePresetId: null,
    }));
  },

  setMode: (newMode) => {
    const state = get();
    if (state.mode === newMode) {
      if (state.animation.isPlaying) {
        set((s) => ({
          animation: { ...s.animation, isPlaying: false, time: 0 },
        }));
      }
      return;
    }

    // Check if preset available for this mode
    const modePresets = PRESETS.filter((p) => p.mode === newMode);
    const defaultPreset = modePresets[0];

    set((s) => ({
      mode: newMode,
      activePresetId: defaultPreset ? defaultPreset.id : null,
      animation: {
        ...s.animation,
        isPlaying: false,
        time: 0,
      },
      history: {
        past: [
          ...s.history.past.slice(-MAX_HISTORY),
          {
            mode: s.mode,
            config: { ...s.configs[s.mode] },
            seed: s.seed,
            paletteId: s.paletteId,
          },
        ],
        future: [],
      },
    }));
  },

  updateParam: (key, value) => {
    const state = get();
    const currentMode = state.mode;
    const currentModeConfig = state.configs[currentMode];

    set((s) => ({
      configs: {
        ...s.configs,
        [currentMode]: {
          ...currentModeConfig,
          [key]: value,
        },
      },
      activePresetId: null, // cleared when user tweaks custom
    }));
  },

  setSeed: (seed) => {
    const s = get();
    set({
      seed: Math.floor(seed),
      activePresetId: null,
      history: {
        past: [
          ...s.history.past.slice(-MAX_HISTORY),
          {
            mode: s.mode,
            config: { ...s.configs[s.mode] },
            seed: s.seed,
            paletteId: s.paletteId,
          },
        ],
        future: [],
      },
    });
  },

  rollSeed: () => {
    const nextSeed = Math.floor(Math.random() * 900000) + 100000;
    get().setSeed(nextSeed);
  },

  setPaletteId: (id) => {
    set({ paletteId: id });
  },

  setDimensions: (dim) => {
    set({ dimensions: dim });
  },

  toggleGuides: () => {
    set((s) => ({ showGuides: !s.showGuides }));
  },

  toggleTransparent: () => {
    set((s) => ({ transparentBackground: !s.transparentBackground }));
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.2, Math.min(3.5, zoom)) });
  },

  setPan: (pan) => {
    set({ pan });
  },

  resetView: () => {
    set({ zoom: 1.0, pan: { x: 0, y: 0 } });
  },

  loadPreset: (preset) => {
    const s = get();
    const snapshot: HistorySnapshot = {
      mode: s.mode,
      config: { ...s.configs[s.mode] },
      seed: s.seed,
      paletteId: s.paletteId,
    };

    set({
      mode: preset.mode,
      configs: {
        ...s.configs,
        [preset.mode]: { ...preset.config },
      },
      seed: preset.seed,
      paletteId: preset.paletteId,
      dimensions: { ...preset.dimensions },
      activePresetId: preset.id,
      history: {
        past: [...s.history.past.slice(-MAX_HISTORY), snapshot],
        future: [],
      },
    });
  },

  toggleLockParam: (paramKey) => {
    set((s) => ({
      lockedParams: {
        ...s.lockedParams,
        [paramKey]: !s.lockedParams[paramKey],
      },
    }));
  },

  toggleLockPalette: () => {
    set((s) => ({ isPaletteLocked: !s.isPaletteLocked }));
  },

  randomizeAll: () => {
    const state = get();
    state.randomizeGeometryOnly();
    if (!state.isPaletteLocked) {
      state.randomizePaletteOnly();
    }
  },

  randomizeGeometryOnly: () => {
    const state = get();
    const mode = state.mode;
    const defs = PARAM_DEFINITIONS[mode] || [];
    const currentConfig = { ...state.configs[mode] };
    const rng = createRandom(Date.now() ^ (state.seed * 31));

    // Update only unlocked parameters within their defined boundaries
    for (const def of defs) {
      if (state.lockedParams[`${mode}.${def.key}`] || state.lockedParams[def.key]) {
        continue;
      }

      if (def.type === 'range') {
        const rnd = def.min + rng.next() * (def.max - def.min);
        // snap to step
        const stepped = Math.round(rnd / def.step) * def.step;
        (currentConfig as any)[def.key] = Number(stepped.toFixed(2));
      } else if (def.type === 'boolean') {
        (currentConfig as any)[def.key] = rng.boolean(0.5);
      } else if (def.type === 'select' && def.options) {
        (currentConfig as any)[def.key] = rng.choice(def.options);
      }
    }

    const nextSeed = rng.int(1000, 999999);

    set((s) => ({
      configs: {
        ...s.configs,
        [mode]: currentConfig,
      },
      seed: nextSeed,
      activePresetId: null,
      history: {
        past: [
          ...s.history.past.slice(-MAX_HISTORY),
          {
            mode: s.mode,
            config: { ...s.configs[s.mode] },
            seed: s.seed,
            paletteId: s.paletteId,
          },
        ],
        future: [],
      },
    }));
  },

  randomizePaletteOnly: () => {
    const state = get();
    if (state.isPaletteLocked) return;
    const available = PALETTES.filter((p) => p.id !== state.paletteId);
    if (available.length > 0) {
      const chosen = available[Math.floor(Math.random() * available.length)];
      set({ paletteId: chosen.id });
    }
  },

  resetCurrentMode: () => {
    const state = get();
    const mode = state.mode;
    let defConfig: GeneratorConfig;
    switch (mode) {
      case 'waveforms':
        defConfig = { ...DEFAULT_WAVEFORMS };
        break;
      case 'loops':
        defConfig = { ...DEFAULT_LOOPS };
        break;
      case 'branches':
        defConfig = { ...DEFAULT_BRANCHES };
        break;
      case 'interference':
        defConfig = { ...DEFAULT_INTERFERENCE };
        break;
      case 'contours':
        defConfig = { ...DEFAULT_CONTOURS };
        break;
      case 'connections':
        defConfig = { ...DEFAULT_CONNECTIONS };
        break;
    }

    set((s) => ({
      configs: {
        ...s.configs,
        [mode]: defConfig,
      },
      activePresetId: null,
    }));
  },

  undo: () => {
    const s = get();
    if (s.history.past.length === 0) return;

    const previous = s.history.past[s.history.past.length - 1];
    const newPast = s.history.past.slice(0, -1);

    const currentSnapshot: HistorySnapshot = {
      mode: s.mode,
      config: { ...s.configs[s.mode] },
      seed: s.seed,
      paletteId: s.paletteId,
    };

    set({
      mode: previous.mode,
      configs: {
        ...s.configs,
        [previous.mode]: { ...previous.config },
      },
      seed: previous.seed,
      paletteId: previous.paletteId,
      activePresetId: null,
      history: {
        past: newPast,
        future: [currentSnapshot, ...s.history.future.slice(0, MAX_HISTORY)],
      },
    });
  },

  redo: () => {
    const s = get();
    if (s.history.future.length === 0) return;

    const next = s.history.future[0];
    const newFuture = s.history.future.slice(1);

    const currentSnapshot: HistorySnapshot = {
      mode: s.mode,
      config: { ...s.configs[s.mode] },
      seed: s.seed,
      paletteId: s.paletteId,
    };

    set({
      mode: next.mode,
      configs: {
        ...s.configs,
        [next.mode]: { ...next.config },
      },
      seed: next.seed,
      paletteId: next.paletteId,
      activePresetId: null,
      history: {
        past: [...s.history.past, currentSnapshot],
        future: newFuture,
      },
    });
  },

  playAnimation: () => {
    set((s) => ({
      animation: { ...s.animation, isPlaying: true },
    }));
  },

  pauseAnimation: () => {
    set((s) => ({
      animation: { ...s.animation, isPlaying: false },
    }));
  },

  resetAnimation: () => {
    set((s) => ({
      animation: { ...s.animation, isPlaying: false, time: 0 },
    }));
  },

  toggleAnimation: () => {
    set((s) => ({
      animation: {
        ...s.animation,
        isPlaying: !s.animation.isPlaying,
      },
    }));
  },

  setAnimationSpeed: (speed) => {
    set((s) => ({
      animation: {
        ...s.animation,
        speed: Math.max(0.1, Math.min(4.0, speed)),
      },
    }));
  },

  setAnimationTime: (time) => {
    set((s) => ({
      animation: {
        ...s.animation,
        time,
      },
    }));
  },

  tickAnimation: (deltaTimeSec) => {
    set((s) => ({
      animation: {
        ...s.animation,
        time: s.animation.time + deltaTimeSec * s.animation.speed,
      },
    }));
  },
}));
