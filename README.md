# CODEX // Procedural Vector Art Playground

An editorial, high-performance procedural vector art playground built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **p5.js**.

Designed around the principle of **clean mathematical vector geometry generation independent of the rendering target**, CODEX produces structured path data that renders seamlessly to both interactive p5.js preview surfaces and clean, production-ready, resolution-independent SVG, PNG, and PDF exports.

---

## Key Features

- **Decoupled Procedural Geometry Engine**: Mathematical curves (cubic Béziers, Catmull–Rom splines, parametric Lissajous, and Marching Squares isocontours) are computed as structured `VectorPath` objects rather than canvas-bound bitmap strokes.
- **Six Parametric Generator Systems**:
  1. **Waveforms**: Families of parallel flowing curves with transition regions, braiding convergence, and harmonic frequency shifts.
  2. **Loops**: Overlapping sinusoidal and elliptical orbital ribbons with axial symmetry and continuous path chaining.
  3. **Branches**: Geometrically controlled multi-trunk divergence into wide deltas and smooth convergence without arbitrary intersections.
  4. **Interference**: Harmonograph and Lissajous parametric equations producing moiré optical vibrations and rotational symmetry rosettes.
  5. **Contours**: Topographic vector isocontours extracted from multi-octave scalar noise fields using an optimized $O(N)$ spatial bucket Marching Squares algorithm.
  6. **Connections**: Schematic network topology with curved cubic Bézier traces, concentric node terminals, and technical telemetry glyphs.
- **Deterministic Seed Architecture**: Mulberry32 & SplitMix32 pseudo-random number generation guarantee identical compositions for any given seed and parameter set.
- **Curated Editorial Palettes**: Monochrome Dark, Monochrome Light, Cobalt & White, Violet & Cream, Forest & Ivory, Editorial Spectrum, and Blueprint Cyan.
- **Export Pipeline**:
  - **SVG**: Primary vector output with precise Bézier path data, clean XML markup, stable IDs, and transparency options.
  - **PNG**: Direct offscreen canvas rendering at 1×, 2× (Retina), or 4× (4K Print) resolutions without screenshot distortion.
  - **PDF**: True vector PDF document generation using jsPDF with native curve primitives.
- **Viewport Canvas**: Interactive pan & zoom stage, artboard guides toggle, transparent checkerboard mat, and responsive resize handling.
- **Motion & Animation Engine**: Deterministic animation clock with phase modulation and speed controls (0.5×, 1×, 2×).
- **Preset Catalog**: 18 pre-configured curated presets (3 per generator mode).

---

## Architecture Overview

```
src/
├── app/
│   └── App.tsx               # Main application layout, keyboard listeners & geometry bindings
├── components/
│   ├── canvas/
│   │   └── ArtboardCanvas.tsx # Lifecycle-safe p5.js React canvas with pan/zoom navigation
│   ├── layout/
│   │   ├── TopBar.tsx         # Header with preset picker, history, animation, and export triggers
│   │   ├── Sidebar.tsx        # Responsive controls drawer with dynamic parameter sliders
│   │   └── StatusBar.tsx      # Bottom telemetry bar with seed, timings, and path counts
│   └── export/
│       └── ExportModal.tsx    # Modal dialog for SVG, PNG, and PDF vector exports
├── engine/
│   ├── core/
│   │   ├── types.ts           # Central TypeScript types (VectorPath, GeometryResult, Configs)
│   │   ├── math.ts            # Vector math, lerp, easing, clamping, and safety checks
│   │   ├── geometry.ts        # Cubic Bézier evaluation, Catmull-Rom splines, bounding boxes
│   │   └── random.ts          # Mulberry32 seeded PRNG and 2D smooth gradient noise
│   ├── generators/
│   │   ├── index.ts           # Unified generator dispatcher
│   │   ├── waveforms.ts       # Mode 1: Parallel waving curves and braided transitions
│   │   ├── loops.ts           # Mode 2: Elliptical and orbital loop ribbons
│   │   ├── branches.ts        # Mode 3: Geometrically controlled stream divergence
│   │   ├── interference.ts    # Mode 4: Parametric Lissajous and moiré rosettes
│   │   ├── contours.ts        # Mode 5: Fast Marching Squares isocontour extraction
│   │   └── connections.ts     # Mode 6: Networked nodes and curved Bézier circuit bus
│   ├── renderers/
│   │   ├── p5Renderer.ts      # p5.js preview renderer using native drawingContext
│   │   ├── svgRenderer.ts     # Pure SVG XML serializer with precision formatting
│   │   └── canvasRenderer.ts  # HTML5 Canvas 2D surface renderer for high-res PNG export
│   └── export/
│       ├── index.ts           # Unified export coordinator
│       ├── svgExport.ts       # Standalone SVG document exporter
│       ├── pngExport.ts       # Multi-resolution raster exporter
│       └── pdfExport.ts       # Vector PDF exporter using jsPDF
├── store/
│   ├── playgroundStore.ts     # Central Zustand state store with undo/redo and parameter locking
│   ├── defaults.ts            # Default configurations, aspect ratios, and parameter schemas
│   ├── palettes.ts            # Curated color palettes and theme color resolvers
│   └── presets.ts             # 18 curated composition presets
├── utils/
│   └── download.ts            # Browser blob & file download helpers
└── styles/
    └── index.css              # Editorial dark mode styles, custom sliders, and scrollbars
```

---

## Installation & Development

### Prerequisites

- Node.js `v20+` or `v24+`
- npm `v10+`

### Setup Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated Vitest test suite
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Toggle motion animation play / pause |
| `r` | Roll seed (generate new variation) |
| `Ctrl+Z` / `Cmd+Z` | Undo last parameter change |
| `Ctrl+Y` / `Cmd+Shift+Z` | Redo parameter change |
| `e` | Open Export artwork dialog |
| `1` – `6` | Switch between the 6 generator modes |

---

## Generator Modes & Parameters

### 1. Waveforms
- **Line Density** (`4` – `50`): Number of parallel ribbons.
- **Wave Amplitude** (`10` – `180`): Peak displacement of waves.
- **Wave Frequency** (`0.5` – `6.0`): Spatial oscillation cycles.
- **Harmonic Curvature** (`0.1` – `2.0`): Secondary harmonic distortion.
- **Turbulent Flow** (`0.0` – `0.8`): Organic noise perturbation.
- **Braid Convergence** (`0.0` – `1.0`): Pinch strength converging lines into dense braids.
- **Transition Zones** (`1` – `5`): Frequency of wave burst regions between parallel states.

### 2. Loops
- **Loop Count** (`3` – `35`): Repetition of orbital curves.
- **Loop Width & Height** (`60` – `400`): Elliptical axis proportions.
- **Orbit Spacing** (`10` – `90`): Horizontal center displacement.
- **Axial Rotation** (`0°` – `180°`): Angle of loop orientation.
- **Continuous Ribbon** (Boolean): Links consecutive loops into one unbroken spline path.
- **Alternating Symmetry** (Boolean): Inverts alternating loop orientations.

### 3. Branches
- **Trunk Streams** (`1` – `6`): Number of incoming primary parallel channels.
- **Branches per Trunk** (`2` – `14`): Multiplier of branched tributaries.
- **Divergence Point** (`15%` – `45%`): Horizontal start of branching.
- **Convergence Point** (`55%` – `85%`): Horizontal reunion back into trunks.
- **Stream Expansion** (`10` – `50`): Lateral spread of the branched fan.
- **Transition Curve** (`0.2` – `1.0`): Smoothness factor of Bézier S-curves.

### 4. Interference
- **Harmonic X & Y** (`1` – `12`): Frequency ratios of parametric Lissajous equations.
- **Radial Symmetry** (`1` – `8`): Rotational symmetry multiplier.
- **Moiré Echoes** (`2` – `30`): Number of concentric phase-shifted curve repetitions.
- **Harmonic Tension** (`0.0` – `0.6`): Non-linear curve warping.

### 5. Contours
- **Contour Iso-levels** (`4` – `30`): Density of elevation levels extracted.
- **Topographic Scale** (`0.5` – `3.5`): Zoom factor of underlying scalar field.
- **Turbulent Field** (`0.2` – `2.2`): Octave noise amplitude.
- **Field Shear** (`0.0` – `0.8`): Harmonic directional stretching.
- **Radial Falloff** (`0.0` – `1.0`): Centered circular field mask.
- **Grid Fidelity** (`24` – `60`): Internal Marching Squares cell resolution.

### 6. Connections
- **Network Terminals** (`6` – `40`): Number of node stations.
- **Bus Circuits** (`4` – `80`): Number of curved connection traces.
- **Traced Curvature** (`0.0` – `1.0`): Perpendicular bulge of connecting cubic Béziers.
- **Topology Style**: `organic`, `radial`, `grid`, or `layered`.
- **Telemetry Glyphs** (Boolean): Toggles engineering tick marks and index annotations.

---

## Testing & Quality Assurance

The codebase includes an automated test suite powered by **Vitest**:

```bash
npm test
```

- **`tests/math.test.ts`**: Vector algebra, normalization, rotations, distance, and easing curves.
- **`tests/random.test.ts`**: Deterministic PRNG sequences, range boundaries, gaussian distribution, and 2D gradient noise.
- **`tests/geometry.test.ts`**: Cubic Bézier evaluation, de Casteljau subdivision, Catmull-Rom spline continuity, and bounding boxes.
- **`tests/generators.test.ts`**: Verifies all 6 generator modes produce valid geometry and deterministic outputs.
- **`tests/store.test.ts`**: Preset loading, parameter locking, randomization bounds, and undo/redo stacks.
- **`tests/export.test.ts`**: SVG XML formatting, coordinate precision, metadata embedding, and transparency.
- **`tests/performance.test.ts`**: Generation benchmarks verifying all modes generate under 75ms in high-density stress tests.

---

## License

MIT License. Designed and built as an editorial procedural creative coding instrument.
