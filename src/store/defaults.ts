import {
  WaveformsConfig,
  LoopsConfig,
  BranchesConfig,
  InterferenceConfig,
  ContoursConfig,
  ConnectionsConfig,
  ArtboardDimensions,
} from '../engine/core/types';

export const DEFAULT_DIMENSIONS: ArtboardDimensions = {
  width: 1000,
  height: 1000,
  aspectRatioLabel: '1:1 Square',
};

export const ASPECT_RATIOS: { label: string; width: number; height: number }[] = [
  { label: '1:1 Square', width: 1000, height: 1000 },
  { label: '4:5 Editorial Portrait', width: 800, height: 1000 },
  { label: '16:9 Cinema Wide', width: 1200, height: 675 },
  { label: '9:16 Story Mobile', width: 675, height: 1200 },
  { label: '3:2 Classic Print', width: 1200, height: 800 },
];

export const DEFAULT_WAVEFORMS: WaveformsConfig = {
  mode: 'waveforms',
  lineCount: 18,
  amplitude: 65,
  frequency: 2.2,
  phaseOffset: 0,
  verticalSpacing: 18,
  horizontalSpacing: 0,
  curvature: 0.85,
  distortion: 0.15,
  splitMergeStrength: 0.45,
  transitionRegions: 2,
  strokeWidth: 1.5,
};

export const DEFAULT_LOOPS: LoopsConfig = {
  mode: 'loops',
  loopCount: 12,
  loopWidth: 180,
  loopHeight: 220,
  horizontalSpacing: 45,
  verticalOffset: 30,
  rotation: 12,
  overlap: 0.35,
  phase: 0,
  symmetry: true,
  connectConsecutive: false,
  strokeWidth: 1.5,
};

export const DEFAULT_BRANCHES: BranchesConfig = {
  mode: 'branches',
  initialLineCount: 2,
  branchCount: 6,
  branchAngle: 35,
  splitPosition: 0.28,
  mergePosition: 0.72,
  curvature: 0.6,
  spacing: 24,
  transitionSmoothness: 0.85,
  strokeWidth: 1.5,
};

export const DEFAULT_INTERFERENCE: InterferenceConfig = {
  mode: 'interference',
  frequencyX: 3,
  frequencyY: 4,
  phase: 0.4,
  symmetry: 4,
  repetitions: 8,
  distortion: 0.15,
  scale: 0.85,
  rotation: 0,
  strokeWidth: 1.25,
};

export const DEFAULT_CONTOURS: ContoursConfig = {
  mode: 'contours',
  contourCount: 16,
  fieldScale: 1.4,
  noiseIntensity: 1.2,
  noiseFrequency: 0.008,
  lineSpacing: 12,
  fieldDeformation: 0.35,
  radialInfluence: 0.4,
  gridResolution: 42,
  strokeWidth: 1.5,
};

export const DEFAULT_CONNECTIONS: ConnectionsConfig = {
  mode: 'connections',
  nodeCount: 18,
  connectionCount: 32,
  pathCurvature: 0.45,
  connectionDensity: 0.75,
  showLabels: true,
  nodeSize: 9,
  layoutStyle: 'organic',
  strokeWidth: 1.5,
};

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  type: 'range' | 'boolean' | 'select';
  options?: string[];
}

export const PARAM_DEFINITIONS: Record<string, ParamDef[]> = {
  waveforms: [
    { key: 'lineCount', label: 'Line Density', min: 4, max: 50, step: 1, type: 'range' },
    { key: 'amplitude', label: 'Wave Amplitude', min: 10, max: 180, step: 1, type: 'range' },
    { key: 'frequency', label: 'Wave Frequency', min: 0.5, max: 6.0, step: 0.1, type: 'range' },
    { key: 'phaseOffset', label: 'Phase Shift', min: 0, max: 6.28, step: 0.05, type: 'range' },
    { key: 'verticalSpacing', label: 'Vertical Spread', min: 5, max: 40, step: 1, type: 'range' },
    { key: 'curvature', label: 'Harmonic Curvature', min: 0.1, max: 2.0, step: 0.05, type: 'range' },
    { key: 'distortion', label: 'Turbulent Flow', min: 0, max: 0.8, step: 0.02, type: 'range' },
    { key: 'splitMergeStrength', label: 'Braid Convergence', min: 0, max: 1.0, step: 0.05, type: 'range' },
    { key: 'transitionRegions', label: 'Transition Zones', min: 1, max: 5, step: 1, type: 'range' },
    { key: 'strokeWidth', label: 'Stroke Weight', min: 0.5, max: 6, step: 0.25, type: 'range' },
  ],
  loops: [
    { key: 'loopCount', label: 'Loop Count', min: 3, max: 35, step: 1, type: 'range' },
    { key: 'loopWidth', label: 'Loop Width', min: 60, max: 350, step: 5, type: 'range' },
    { key: 'loopHeight', label: 'Loop Height', min: 80, max: 400, step: 5, type: 'range' },
    { key: 'horizontalSpacing', label: 'Orbit Spacing', min: 10, max: 90, step: 2, type: 'range' },
    { key: 'verticalOffset', label: 'Wave Offset', min: 0, max: 120, step: 2, type: 'range' },
    { key: 'rotation', label: 'Axial Rotation', min: 0, max: 180, step: 1, type: 'range' },
    { key: 'overlap', label: 'Overlap Density', min: 0, max: 0.85, step: 0.05, type: 'range' },
    { key: 'phase', label: 'Phase Offset', min: 0, max: 6.28, step: 0.05, type: 'range' },
    { key: 'symmetry', label: 'Alternating Symmetry', min: 0, max: 1, step: 1, type: 'boolean' },
    { key: 'connectConsecutive', label: 'Continuous Ribbon', min: 0, max: 1, step: 1, type: 'boolean' },
    { key: 'strokeWidth', label: 'Stroke Weight', min: 0.5, max: 6, step: 0.25, type: 'range' },
  ],
  branches: [
    { key: 'initialLineCount', label: 'Trunk Streams', min: 1, max: 6, step: 1, type: 'range' },
    { key: 'branchCount', label: 'Branches per Trunk', min: 2, max: 14, step: 1, type: 'range' },
    { key: 'splitPosition', label: 'Divergence Point', min: 0.15, max: 0.45, step: 0.01, type: 'range' },
    { key: 'mergePosition', label: 'Convergence Point', min: 0.55, max: 0.85, step: 0.01, type: 'range' },
    { key: 'curvature', label: 'Wave Amplitude', min: 0, max: 1.5, step: 0.05, type: 'range' },
    { key: 'spacing', label: 'Stream Expansion', min: 10, max: 50, step: 1, type: 'range' },
    { key: 'transitionSmoothness', label: 'Transition Curve', min: 0.2, max: 1.0, step: 0.05, type: 'range' },
    { key: 'strokeWidth', label: 'Stroke Weight', min: 0.5, max: 6, step: 0.25, type: 'range' },
  ],
  interference: [
    { key: 'frequencyX', label: 'Harmonic X', min: 1, max: 12, step: 1, type: 'range' },
    { key: 'frequencyY', label: 'Harmonic Y', min: 1, max: 12, step: 1, type: 'range' },
    { key: 'phase', label: 'Phase Angle', min: 0, max: 6.28, step: 0.05, type: 'range' },
    { key: 'symmetry', label: 'Radial Symmetry', min: 1, max: 8, step: 1, type: 'range' },
    { key: 'repetitions', label: 'Moiré Echoes', min: 2, max: 30, step: 1, type: 'range' },
    { key: 'distortion', label: 'Harmonic Tension', min: 0, max: 0.6, step: 0.02, type: 'range' },
    { key: 'scale', label: 'Field Scale', min: 0.4, max: 1.3, step: 0.05, type: 'range' },
    { key: 'rotation', label: 'Base Rotation', min: 0, max: 360, step: 5, type: 'range' },
    { key: 'strokeWidth', label: 'Stroke Weight', min: 0.5, max: 5, step: 0.25, type: 'range' },
  ],
  contours: [
    { key: 'contourCount', label: 'Contour Iso-levels', min: 4, max: 30, step: 1, type: 'range' },
    { key: 'fieldScale', label: 'Topographic Scale', min: 0.5, max: 3.5, step: 0.1, type: 'range' },
    { key: 'noiseIntensity', label: 'Turbulent Field', min: 0.2, max: 2.2, step: 0.1, type: 'range' },
    { key: 'fieldDeformation', label: 'Field Shear', min: 0, max: 0.8, step: 0.05, type: 'range' },
    { key: 'radialInfluence', label: 'Radial Falloff', min: 0, max: 1.0, step: 0.05, type: 'range' },
    { key: 'gridResolution', label: 'Grid Fidelity', min: 24, max: 60, step: 2, type: 'range' },
    { key: 'strokeWidth', label: 'Stroke Weight', min: 0.5, max: 5, step: 0.25, type: 'range' },
  ],
  connections: [
    { key: 'nodeCount', label: 'Network Terminals', min: 6, max: 40, step: 1, type: 'range' },
    { key: 'connectionCount', label: 'Bus Circuits', min: 4, max: 80, step: 2, type: 'range' },
    { key: 'pathCurvature', label: 'Traced Curvature', min: 0, max: 1.0, step: 0.05, type: 'range' },
    { key: 'nodeSize', label: 'Terminal Radius', min: 4, max: 18, step: 1, type: 'range' },
    {
      key: 'layoutStyle',
      label: 'Topology Style',
      min: 0,
      max: 3,
      step: 1,
      type: 'select',
      options: ['organic', 'radial', 'grid', 'layered'],
    },
    { key: 'showLabels', label: 'Telemetry Glyphs', min: 0, max: 1, step: 1, type: 'boolean' },
    { key: 'strokeWidth', label: 'Stroke Weight', min: 0.5, max: 5, step: 0.25, type: 'range' },
  ],
};
