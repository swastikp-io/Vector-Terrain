export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface CubicBezier {
  p0: Point2D;
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
}

export type Polyline = Point2D[];

export type PathCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x: number; y: number }
  | { type: 'C'; cp1x: number; cp1y: number; cp2x: number; cp2y: number; x: number; y: number }
  | { type: 'Q'; cpx: number; cpy: number; x: number; y: number }
  | { type: 'Z' };

export interface VectorPath {
  id: string;
  commands: PathCommand[];
  strokeColor?: string;
  strokeWidth?: number;
  strokeRoughness?: number;
  strokeOpacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeCap?: 'round' | 'square' | 'butt';
  strokeJoin?: 'round' | 'bevel' | 'miter';
  strokeDashArray?: number[];
  closed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ArtboardDimensions {
  width: number;
  height: number;
  aspectRatioLabel?: string;
}

export type GeneratorMode =
  | 'waveforms'
  | 'loops'
  | 'branches'
  | 'interference'
  | 'contours'
  | 'connections';

export interface BaseGeneratorConfig {
  mode: GeneratorMode;
  strokeRoughness?: number;
}

// MODE 1: WAVEFORMS
export interface WaveformsConfig extends BaseGeneratorConfig {
  mode: 'waveforms';
  lineCount: number;
  amplitude: number;
  frequency: number;
  phaseOffset: number;
  verticalSpacing: number;
  horizontalSpacing: number;
  curvature: number;
  distortion: number;
  splitMergeStrength: number;
  transitionRegions: number;
  strokeWidth: number;
  strokeRoughness: number;
}

// MODE 2: LOOPS
export interface LoopsConfig extends BaseGeneratorConfig {
  mode: 'loops';
  loopCount: number;
  loopWidth: number;
  loopHeight: number;
  horizontalSpacing: number;
  verticalOffset: number;
  rotation: number;
  overlap: number;
  phase: number;
  symmetry: boolean;
  connectConsecutive: boolean;
  strokeWidth: number;
  strokeRoughness: number;
}

// MODE 3: BRANCHES
export interface BranchesConfig extends BaseGeneratorConfig {
  mode: 'branches';
  initialLineCount: number;
  branchCount: number;
  branchAngle: number;
  splitPosition: number;
  mergePosition: number;
  curvature: number;
  spacing: number;
  transitionSmoothness: number;
  strokeWidth: number;
  strokeRoughness: number;
}

// MODE 4: INTERFERENCE
export interface InterferenceConfig extends BaseGeneratorConfig {
  mode: 'interference';
  frequencyX: number;
  frequencyY: number;
  phase: number;
  symmetry: number;
  repetitions: number;
  distortion: number;
  scale: number;
  rotation: number;
  strokeWidth: number;
  strokeRoughness: number;
}

// MODE 5: CONTOURS
export interface ContoursConfig extends BaseGeneratorConfig {
  mode: 'contours';
  contourCount: number;
  fieldScale: number;
  noiseIntensity: number;
  noiseFrequency: number;
  lineSpacing: number;
  fieldDeformation: number;
  radialInfluence: number;
  gridResolution: number;
  strokeWidth: number;
  strokeRoughness: number;
}

// MODE 6: CONNECTIONS
export interface ConnectionsConfig extends BaseGeneratorConfig {
  mode: 'connections';
  nodeCount: number;
  connectionCount: number;
  pathCurvature: number;
  connectionDensity: number;
  showLabels: boolean;
  nodeSize: number;
  layoutStyle: 'radial' | 'grid' | 'organic' | 'layered';
  strokeWidth: number;
  strokeRoughness: number;
}

export type GeneratorConfig =
  | WaveformsConfig
  | LoopsConfig
  | BranchesConfig
  | InterferenceConfig
  | ContoursConfig
  | ConnectionsConfig;

export interface PaletteConfig {
  id: string;
  name: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  colors: string[];
  mode: 'monochrome' | 'dual' | 'multi';
}

export interface GeometryStats {
  pathCount: number;
  segmentCount: number;
  bounds: BoundingBox;
}

export interface GeometryResult {
  paths: VectorPath[];
  dimensions: ArtboardDimensions;
  seed: number;
  mode: GeneratorMode;
  generationTimeMs: number;
  stats: GeometryStats;
  metadata?: Record<string, unknown>;
}

export interface AnimationExportProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  elapsedSec: number;
  remainingSec: number;
}

export interface ExportConfig {
  format: 'svg' | 'png' | 'pdf' | 'webm' | 'mp4';
  width: number;
  height: number;
  scale: number;
  transparentBackground: boolean;
  backgroundColor: string;
  filename: string;
  durationSec?: number;
  fps?: number;
  speed?: number;
  videoBitrate?: number;
  onProgress?: (progress: AnimationExportProgress) => void;
  abortSignal?: AbortSignal;
}

export interface IGenerator<T extends GeneratorConfig = GeneratorConfig> {
  mode: GeneratorMode;
  generate(
    config: T,
    seed: number,
    dimensions: ArtboardDimensions,
    palette: PaletteConfig,
    time?: number
  ): GeometryResult;
}
