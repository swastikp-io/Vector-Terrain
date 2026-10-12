import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowUpRight, Shuffle, Play, Pause, Maximize2 } from 'lucide-react';
import { generateGeometry } from '../../engine/generators';
import { commandsToSvgPathData } from '../../engine/renderers/svgRenderer';
import { GeneratorMode, GeneratorConfig } from '../../engine/core/types';
import {
  DEFAULT_WAVEFORMS,
  DEFAULT_LOOPS,
  DEFAULT_BRANCHES,
  DEFAULT_CONTOURS,
  DEFAULT_INTERFERENCE,
  DEFAULT_CONNECTIONS,
} from '../../store/defaults';

interface InteractivePreviewProps {
  onOpenFullPlayground: (configOverrides?: {
    mode: GeneratorMode;
    seed: number;
    config?: any;
  }) => void;
}

const MODES: { id: GeneratorMode; label: string }[] = [
  { id: 'waveforms', label: 'Waveforms' },
  { id: 'loops', label: 'Loops' },
  { id: 'contours', label: 'Contours' },
  { id: 'branches', label: 'Branches' },
  { id: 'interference', label: 'Interference' },
  { id: 'connections', label: 'Connections' },
];

export const InteractivePreview: React.FC<InteractivePreviewProps> = ({
  onOpenFullPlayground,
}) => {
  const [mode, setMode] = useState<GeneratorMode>('waveforms');
  const [seed, setSeed] = useState<number>(54128);
  const [complexity, setComplexity] = useState<number>(24);
  const [distortion, setDistortion] = useState<number>(0.35);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animTime, setAnimTime] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Check intersection so animation pauses when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Animation Loop for live motion
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isVisibleRef.current) {
        setAnimTime((prev) => (prev + dt * 0.8) % 1000);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Build active config according to mode and slider values
  const activeConfig = useMemo<GeneratorConfig>(() => {
    switch (mode) {
      case 'waveforms':
        return {
          ...DEFAULT_WAVEFORMS,
          lineCount: Math.round(complexity),
          distortion: distortion,
          amplitude: 50 + distortion * 80,
          frequency: 1.8 + distortion * 2.5,
        };
      case 'loops':
        return {
          ...DEFAULT_LOOPS,
          loopCount: Math.round(complexity * 0.7),
          rotation: 10 + distortion * 45,
          overlap: distortion,
        };
      case 'contours':
        return {
          ...DEFAULT_CONTOURS,
          contourCount: Math.round(complexity * 0.9),
          noiseIntensity: 0.8 + distortion * 1.8,
          fieldDeformation: distortion,
        };
      case 'branches':
        return {
          ...DEFAULT_BRANCHES,
          branchCount: Math.min(10, Math.round(complexity * 0.35)),
          branchAngle: 25 + distortion * 45,
          curvature: distortion,
        };
      case 'interference':
        return {
          ...DEFAULT_INTERFERENCE,
          repetitions: Math.round(complexity * 0.5),
          distortion: distortion,
          frequencyX: 2 + Math.round(distortion * 4),
        };
      case 'connections':
        return {
          ...DEFAULT_CONNECTIONS,
          nodeCount: Math.round(complexity * 0.8),
          connectionCount: Math.round(complexity * 1.4),
          pathCurvature: distortion,
        };
    }
  }, [mode, complexity, distortion]);

  // Generate procedural geometry in strict monochrome
  const geometry = useMemo(() => {
    return generateGeometry(
      activeConfig,
      seed,
      { width: 800, height: 600 },
      {
        id: 'preview-mono',
        name: 'Monochrome Preview',
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#555555',
        accent: '#222222',
        colors: ['#000000', '#222222', '#444444', '#666666'],
        mode: 'monochrome',
      },
      animTime
    );
  }, [activeConfig, seed, animTime]);

  const handleRollSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 900000) + 10000);
  }, []);

  const handleLaunchFull = () => {
    onOpenFullPlayground({
      mode,
      seed,
      config: activeConfig,
    });
  };

  return (
    <section
      id="experiment"
      ref={containerRef}
      className="relative py-28 bg-white text-black border-b border-[#E5E5E5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black" />
              03 / LIVE EXPERIMENT
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight font-display text-black">
              Change a rule.<br />
              <span className="text-[#888888]">Change everything.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchFull}
              className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-neutral-800 text-white font-mono text-xs uppercase font-semibold tracking-wider transition-all duration-200 shadow-sm"
            >
              Open Vector Terrain
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Playground Interface Box */}
        <div className="border border-[#E5E5E5] bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-sm">
          {/* Main Artwork Canvas Display (8 Cols on Desktop) */}
          <div className="lg:col-span-8 relative bg-white min-h-[380px] sm:min-h-[460px] lg:min-h-[580px] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#E5E5E5] p-4 sm:p-8 overflow-hidden">
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #E5E5E5 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Live SVG Vector Rendering in pure monochrome */}
            <svg
              viewBox="0 0 800 600"
              className="w-full h-full max-h-[540px] object-contain relative z-10 transition-transform duration-200"
            >
              {geometry.paths.map((p, idx) => {
                const d = commandsToSvgPathData(p.commands);
                const stroke =
                  idx % 3 === 0
                    ? '#000000'
                    : idx % 2 === 0
                    ? '#222222'
                    : '#666666';
                return (
                  <path
                    key={p.id || idx}
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={p.strokeWidth || 1.35}
                    strokeOpacity={idx % 3 === 0 ? 0.95 : 0.65}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </svg>

            {/* Telemetry Floating Overlays */}
            <div className="absolute top-4 left-4 font-mono text-[11px] text-[#666666] flex items-center gap-2 bg-white/95 px-3 py-1.5 border border-[#E5E5E5]">
              <span className="w-2 h-2 rounded-none bg-black" />
              <span>
                REALTIME / {geometry.stats.pathCount} PATHS / {geometry.stats.segmentCount} SEGS
              </span>
            </div>

            <div className="absolute bottom-4 left-4 font-mono text-[11px] text-[#666666] bg-white/95 px-3 py-1.5 border border-[#E5E5E5]">
              SEED: <span className="text-black font-semibold">{seed}</span>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="font-mono text-xs uppercase px-3 py-1.5 bg-white hover:bg-[#F0F0F0] border border-[#E5E5E5] text-black flex items-center gap-1.5 transition-colors"
                title={isPlaying ? 'Pause Animation' : 'Resume Animation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleLaunchFull}
                className="font-mono text-xs uppercase px-3 py-1.5 bg-white hover:bg-[#F0F0F0] border border-[#E5E5E5] text-black flex items-center gap-1.5 transition-colors"
                title="Expand to Vector Terrain"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Controls Sidebar (4 Cols on Desktop) */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#F7F7F7]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#666666]">
                  Engine Parameters
                </span>
                <span className="font-mono text-[10px] text-black uppercase tracking-wider bg-white px-2 py-0.5 border border-[#E5E5E5]">
                  Interactive
                </span>
              </div>

              {/* Mode Selector */}
              <div className="mb-6">
                <label className="block font-mono text-xs uppercase text-[#666666] mb-2.5">
                  Generator Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`font-mono text-xs uppercase py-2 px-3 text-left border transition-all duration-150 ${
                        mode === m.id
                          ? 'border-black bg-black text-white font-semibold'
                          : 'border-[#E5E5E5] bg-white text-[#666666] hover:text-black hover:border-black'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-xs uppercase text-[#666666]">
                    Density / Complexity
                  </label>
                  <span className="font-mono text-xs text-black font-semibold">
                    {Math.round(complexity)}
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="1"
                  value={complexity}
                  onChange={(e) => setComplexity(parseFloat(e.target.value))}
                  className="w-full accent-black bg-[#E5E5E5] h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Distortion / Motion Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-xs uppercase text-[#666666]">
                    Distortion / Field Force
                  </label>
                  <span className="font-mono text-xs text-black font-semibold">
                    {distortion.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={distortion}
                  onChange={(e) => setDistortion(parseFloat(e.target.value))}
                  className="w-full accent-black bg-[#E5E5E5] h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Seed Control Button */}
              <div className="mb-6">
                <button
                  onClick={handleRollSeed}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-[#F0F0F0] border border-[#E5E5E5] hover:border-black text-black font-mono text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5 text-black" />
                  Regenerate Seed
                </button>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="pt-6 border-t border-[#E5E5E5]">
              <p className="font-mono text-xs text-[#666666] leading-relaxed mb-4">
                This preview runs the exact procedural engine used inside the studio. Open the full workspace for high-resolution vector and video exports.
              </p>
              <button
                onClick={handleLaunchFull}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-mono text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                Launch Studio Workspace
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
