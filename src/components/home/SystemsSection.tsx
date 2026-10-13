import React, { useMemo } from 'react';
import { generateGeometry } from '../../engine/generators';
import { commandsToSvgPathData } from '../../engine/renderers/svgRenderer';
import {
  DEFAULT_WAVEFORMS,
  DEFAULT_CONTOURS,
  DEFAULT_LOOPS,
  DEFAULT_BRANCHES,
} from '../../store/defaults';
import { GeneratorMode } from '../../engine/core/types';

interface SystemsSectionProps {
  onSelectSystem: (mode: GeneratorMode, seed?: number) => void;
}

export const SystemsSection: React.FC<SystemsSectionProps> = ({ onSelectSystem }) => {
  // Generate real procedural vector art for each system using the generator engine
  const systems = useMemo(() => {
    // System 1: Flow Fields (Waveforms)
    const geom1 = generateGeometry(
      {
        ...DEFAULT_WAVEFORMS,
        lineCount: 22,
        amplitude: 75,
        frequency: 2.8,
        distortion: 0.35,
        splitMergeStrength: 0.6,
        strokeWidth: 1.25,
      },
      7314,
      { width: 500, height: 350 },
      {
        id: 'flow-mono',
        name: 'Flow Monochrome',
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#555555',
        accent: '#222222',
        colors: ['#000000', '#222222', '#555555'],
        mode: 'monochrome',
      }
    );

    // System 2: Noise Landscapes (Contours)
    const geom2 = generateGeometry(
      {
        ...DEFAULT_CONTOURS,
        contourCount: 24,
        noiseIntensity: 1.6,
        lineSpacing: 10,
        radialInfluence: 0.6,
        strokeWidth: 1.2,
      },
      4921,
      { width: 500, height: 350 },
      {
        id: 'contours-mono',
        name: 'Contours Monochrome',
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#555555',
        accent: '#222222',
        colors: ['#000000', '#333333', '#666666'],
        mode: 'monochrome',
      }
    );

    // System 3: Geometric Systems (Loops)
    const geom3 = generateGeometry(
      {
        ...DEFAULT_LOOPS,
        loopCount: 16,
        loopWidth: 160,
        loopHeight: 210,
        horizontalSpacing: 35,
        rotation: 22,
        overlap: 0.5,
        symmetry: true,
        strokeWidth: 1.2,
      },
      1802,
      { width: 500, height: 350 },
      {
        id: 'loops-mono',
        name: 'Loops Monochrome',
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#555555',
        accent: '#222222',
        colors: ['#000000', '#333333', '#555555'],
        mode: 'monochrome',
      }
    );

    // System 4: Organic Forms (Branches)
    const geom4 = generateGeometry(
      {
        ...DEFAULT_BRANCHES,
        initialLineCount: 3,
        branchCount: 8,
        branchAngle: 42,
        splitPosition: 0.22,
        mergePosition: 0.78,
        curvature: 0.85,
        strokeWidth: 1.2,
      },
      9381,
      { width: 500, height: 350 },
      {
        id: 'branches-mono',
        name: 'Branches Monochrome',
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#555555',
        accent: '#222222',
        colors: ['#000000', '#333333', '#666666'],
        mode: 'monochrome',
      }
    );

    return [
      {
        id: '01',
        title: 'System 01 — Flow Fields',
        category: 'VECTOR / MOTION',
        mode: 'waveforms' as GeneratorMode,
        seed: 7314,
        description: 'Follow invisible forces through space.',
        geometry: geom1,
        span: 'lg:col-span-7',
      },
      {
        id: '02',
        title: 'System 02 — Noise Landscapes',
        category: 'TERRAIN / NOISE',
        mode: 'contours' as GeneratorMode,
        seed: 4921,
        description: 'Build landscapes from mathematical uncertainty.',
        geometry: geom2,
        span: 'lg:col-span-5',
      },
      {
        id: '03',
        title: 'System 03 — Geometric Systems',
        category: 'GEOMETRY / RECURSION',
        mode: 'loops' as GeneratorMode,
        seed: 1802,
        description: 'Find structure in repetition.',
        geometry: geom3,
        span: 'lg:col-span-5',
      },
      {
        id: '04',
        title: 'System 04 — Organic Forms',
        category: 'GROWTH / ORGANIC',
        mode: 'branches' as GeneratorMode,
        seed: 9381,
        description: 'Let simple rules create complex forms.',
        geometry: geom4,
        span: 'lg:col-span-7',
      },
    ];
  }, []);

  return (
    <section id="systems" className="relative py-28 bg-white text-black border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight font-display text-black">
              Different rules.<br />
              <span className="text-[#888888]">Different worlds.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#666666] font-mono leading-relaxed">
            Each system begins with a set of parameters. The result is never quite the same.
            Explore algorithmic vectors shaped by real mathematical functions.
          </p>
        </div>

        {/* Asymmetrical Systems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {systems.map((sys) => {
            return (
              <div
                key={sys.id}
                onClick={() => onSelectSystem(sys.mode, sys.seed)}
                className={`group cursor-pointer relative bg-[#F7F7F7] border border-[#E5E5E5] hover:border-black transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm ${sys.span}`}
              >
                {/* Visual Artwork Canvas Box */}
                <div className="relative w-full h-64 sm:h-72 md:h-80 bg-white overflow-hidden border-b border-[#E5E5E5] flex items-center justify-center p-4">
                  {/* Subtle technical background grid */}
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #F0F0F0 1px, transparent 1px), linear-gradient(to bottom, #F0F0F0 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Procedural Vector Artwork Render in pure monochrome */}
                  <svg
                    viewBox="0 0 500 350"
                    className="w-full h-full object-contain relative z-10 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  >
                    {sys.geometry.paths.map((path, idx) => {
                      const d = commandsToSvgPathData(path.commands);
                      const stroke =
                        idx % 3 === 0
                          ? '#000000'
                          : idx % 2 === 0
                          ? '#222222'
                          : '#666666';
                      return (
                        <path
                          key={path.id || idx}
                          d={d}
                          fill="none"
                          stroke={stroke}
                          strokeWidth={path.strokeWidth || 1.3}
                          strokeOpacity={idx % 4 === 0 ? 0.95 : 0.65}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300 group-hover:stroke-opacity-100"
                        />
                      );
                    })}
                  </svg>

                  {/* Corner Badge */}
                  <div className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-wider text-[#666666] bg-white/95 px-2 py-1 border border-[#E5E5E5]">
                    SEED: {sys.seed}
                  </div>
                </div>

                {/* Card Content & Action */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 bg-[#F7F7F7]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] tracking-widest uppercase text-[#888888]">
                        {sys.category}
                      </span>
                      <span className="font-mono text-xs text-[#666666] group-hover:text-black transition-colors">
                        MODE: {sys.mode.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-light font-display text-black mb-2 transition-colors">
                      {sys.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-6 font-mono">
                      {sys.description}
                    </p>
                  </div>

                  {/* Telemetry Info */}
                  <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#888888]">
                    <span>{sys.category}</span>
                    <span>
                      {sys.geometry.stats.pathCount} PATHS / {sys.geometry.stats.segmentCount} SEGS
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
