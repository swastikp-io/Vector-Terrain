# Vector Terrain // Procedural Vector Art Playground

An editorial, high-performance procedural vector art playground and motion design studio built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **HTML5 Canvas 2D**.

Designed around the principle of **clean mathematical vector geometry generation independent of the rendering target**, **Vector Terrain** produces structured path data that renders in real time and exports directly to production-ready **SVG**, high-resolution **PNG**, vector **PDF**, and animated **WebM / MP4** motion graphics.

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
- **Monochrome Dark Design System**:
  - Deep `#0c0d0e` canvas backdrop with high-contrast `#ffffff` vector strokes and neutral accents.
  - Floating, borderless transparent top navigation bar with rounded control islands.
  - Curated palettes including Monochrome Dark, Monochrome Light, and custom themes.
- **Motion & Animation Engine**:
  - Real-time 60 FPS animation loop with deterministic phase modulation.
  - Multi-speed playback controls (0.5×, 1.0×, 1.5×, 2.0×) and timeline reset.
- **Multi-Format Export Pipeline**:
  - **SVG**: Primary lossless vector output with clean XML markup, stable IDs, and transparency options.
  - **PNG**: Direct offscreen canvas rasterization at 1× (Standard), 2× (Retina HD), or 3× (Ultra 4K).
  - **PDF**: True vector PDF documents using jsPDF with native Bézier curve primitives.
  - **Animated Video (WebM / MP4)**: Frame-by-frame canvas recording up to 15 seconds at 30 or 60 FPS with progress telemetry and bitrate optimization.
- **Authentication & Persistence**:
  - Supabase session management with email authentication and protected studio routing.
  - Curated preset library and persistent parameter state via Zustand.
- **Editorial Showcase Home Page**:
  - Multi-section generative design archive with interactive live previews and responsive navigation.

---

## Architecture Overview

```
src/
├── App.tsx                     # Main application layout, view switching & shortcut bindings
├── components/
│   ├── auth/
│   │   └── AuthPage.tsx        # Supabase sign-in and sign-up dialogs
│   ├── canvas/
│   │   └── ArtboardCanvas.tsx  # Lifecycle-safe HTML5 Canvas 2D renderer with guide overlay
│   ├── common/
│   │   └── ErrorBoundary.tsx   # React error boundary with dark mode recovery fallback
│   ├── export/
│   │   └── ExportModal.tsx     # Modern multi-format dialog for SVG, PNG, PDF & Video
│   ├── home/
│   │   ├── HomePage.tsx        # Public editorial landing page
│   │   ├── Navbar.tsx          # Editorial navigation bar
│   │   ├── HeroSection.tsx     # Kinetic generative headline
│   │   ├── SystemsSection.tsx  # Showcase of the 6 procedural systems
│   │   ├── InteractivePreview.tsx # Live embedded mini playground
│   │   ├── GallerySection.tsx  # Selected computational print archive
│   │   └── Footer.tsx          # Colophon and release metadata
│   └── layout/
│       ├── TopBar.tsx          # Floating transparent navigation bar with motion controls
│       ├── Sidebar.tsx         # Tabbed controls drawer (Parameters, Palette, Seed)
│       └── StatusBar.tsx       # Bottom telemetry bar with timing and geometry stats
├── engine/
│   ├── core/
│   │   ├── types.ts            # Central types (VectorPath, GeometryResult, ExportConfig)
│   │   ├── math.ts             # Vector algebra, lerp, easing, and safety clamps
│   │   ├── geometry.ts         # Cubic Bézier evaluation, Catmull-Rom splines, bounding boxes
│   │   └── random.ts           # Mulberry32 seeded PRNG and smooth gradient noise
│   ├── generators/
│   │   ├── index.ts            # Unified generator dispatcher
│   │   ├── waveforms.ts        # Mode 1: Parallel waving curves and braided transitions
│   │   ├── loops.ts            # Mode 2: Elliptical and orbital loop ribbons
│   │   ├── branches.ts         # Mode 3: Stream divergence and tributary reconvergence
│   │   ├── interference.ts     # Mode 4: Parametric Lissajous and moiré rosettes
│   │   ├── contours.ts         # Mode 5: Fast Marching Squares isocontour extraction
│   │   └── connections.ts      # Mode 6: Networked nodes and curved circuit bus
│   ├── renderers/
│   │   ├── svgRenderer.ts      # Pure SVG XML serializer with precision formatting
│   │   └── canvasRenderer.ts   # Offscreen Canvas 2D surface renderer
│   └── export/
│       ├── index.ts            # Unified export coordinator
│       ├── svgExport.ts        # SVG file exporter
│       ├── pngExport.ts        # Multi-resolution raster exporter
│       ├── pdfExport.ts        # Vector PDF exporter using jsPDF
│       └── animationExport.ts  # Frame-accurate WebM/MP4 MediaRecorder video pipeline
├── lib/
│   └── supabase.ts             # Supabase client initialization and authentication helpers
├── store/
│   ├── playgroundStore.ts      # Central Zustand state store with undo/redo history
│   ├── defaults.ts             # Default configurations, aspect ratios, and parameter schemas
│   ├── palettes.ts             # Curated color palettes with Monochrome Dark defaults
│   └── presets.ts              # Curated composition presets
├── utils/
│   └── download.ts             # Browser blob and media download helpers
└── index.css                   # Tailwind CSS v4 styling, custom range sliders & dark theme
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

# Start Vite development server
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
| `1` – `6` | Switch between generator modes |

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

The codebase includes an automated test suite powered by **Vitest** (55 tests across 10 test files):

```bash
npm test
```

- **`tests/math.test.ts`**: Vector algebra, normalization, rotations, distance, and easing curves.
- **`tests/random.test.ts`**: Deterministic PRNG sequences, range boundaries, gaussian distribution, and 2D gradient noise.
- **`tests/geometry.test.ts`**: Cubic Bézier evaluation, de Casteljau subdivision, Catmull-Rom spline continuity, and bounding boxes.
- **`tests/generators.test.ts`**: Verifies all 6 generator modes produce valid geometry and deterministic outputs.
- **`tests/store.test.ts`**: Preset loading, parameter locking, randomization bounds, and undo/redo stacks.
- **`tests/export.test.ts`**: SVG XML formatting, coordinate precision, metadata embedding, and transparency.
- **`tests/animationExport.test.ts`**: Frame sequencing, duration calculations, bitrate configuration, and abort controller signals.
- **`tests/auth.test.ts`**: Authentication validation, error handling, credential sanitization, and session state.
- **`tests/regression.test.ts`**: Monochrome dark defaults, generator isolation, and parameter preservation.
- **`tests/performance.test.ts`**: Generation benchmarks verifying all modes generate under 75ms in high-density stress tests.

---

## License

MIT License. Designed and built as an editorial procedural creative coding instrument.
