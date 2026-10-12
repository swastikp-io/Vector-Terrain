import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface EditorialSectionProps {
  onOpenPlayground: () => void;
}

export const EditorialSection: React.FC<EditorialSectionProps> = ({ onOpenPlayground }) => {
  return (
    <section
      id="statement"
      className="relative w-full bg-black text-white py-20 sm:py-28 border-b border-[#222222] overflow-hidden select-none"
    >
      {/* Background Typewriter / ASCII Pattern Grid (Inverted white-on-black digital zine texture) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] font-mono text-[11px] leading-4 select-none overflow-hidden p-6 tracking-widest text-white">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap overflow-hidden">
            : - : = - - = = = = = - - - = = = = = = = = = = = = = = = = = = = = = = = =
            + = = = = - - - - = = = = = = = = = = : : : : : : : : : : : : : : : : : :
            : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : : :
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Copy (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-[#A0A0A0] mb-6">
              <span className="w-1.5 h-1.5 bg-white" />
              <span>A DIFFERENT KIND OF CANVAS</span>
            </div>

            <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.02] tracking-tight text-white mb-8">
              Not another<br />
              design tool.<br />
              <span className="font-semibold text-white">
                A system for<br />
                discovering forms.
              </span>
            </h2>

            <p className="text-base sm:text-lg font-sans text-[#A0A0A0] leading-relaxed max-w-lg mb-10">
              Start with simple rules. Introduce noise, repetition, distortion, and time.
              Find the compositions you couldn’t have planned.
            </p>

            <div className="flex items-center gap-4 pt-6 border-t border-[#222222]">
              <button
                onClick={onOpenPlayground}
                className="group flex items-center gap-2 px-5 py-3 bg-white hover:bg-neutral-200 text-black font-mono text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-sm font-semibold"
              >
                <span>OPEN VECTOR TERRAIN</span>
                <ArrowUpRight
                  size={14}
                  className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>

              <div className="text-xs font-mono text-[#777777] tracking-wide">
                <span>EST. 2026 // VECTOR LAB</span>
              </div>
            </div>
          </div>

          {/* Right Collage Poster Layer (6 Cols — Inverted High-Contrast Editorial Collage) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Background Layer 1: Code snippet panel */}
            <div className="absolute -top-6 -left-6 w-52 sm:w-60 bg-[#141414] border border-[#333333] p-3 font-mono text-[9px] sm:text-[10px] leading-tight text-white shadow-[4px_4px_0px_#222222] z-0 hidden sm:block">
              <div className="text-[8px] text-[#777777] pb-1 border-b border-[#282828] mb-1.5">
                // PARAMETRIC_FIELD.TS
              </div>
              <div className="text-[#999999]">var r, t, n, i;</div>
              <div className="text-[#999999]">function vectorField(x, y) &#123;</div>
              <div className="pl-2 text-[#DDDDDD]">const dx = Math.sin(y * 0.05);</div>
              <div className="pl-2 text-[#DDDDDD]">const dy = Math.cos(x * 0.05);</div>
              <div className="pl-2 text-[#DDDDDD]">return [dx, dy];</div>
              <div className="text-[#999999]">&#125;</div>
            </div>

            {/* Background Layer 2: Inverted monochrome technical swatch */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-white border border-white shadow-[4px_4px_0px_#222222] z-0 flex items-center justify-center p-2 text-black font-mono text-[9px] uppercase tracking-widest text-center font-semibold">
              SYSTEM DISCOVERY
            </div>

            {/* Central Inverted Computational Poster */}
            <div className="relative z-10 w-full max-w-md bg-[#111111] text-white border border-[#333333] shadow-[8px_8px_0px_rgba(255,255,255,0.06)] p-6 sm:p-8">
              {/* Header inside poster */}
              <div className="border-b border-[#252525] pb-4 mb-6 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#888888] uppercase">
                <span className="text-white font-bold">STUDY 009</span>
                <span>HARMONIC MATRIX</span>
              </div>

              {/* Generative Vector Insect / Lattice Artwork built from mathematical curves */}
              <div className="w-full h-56 sm:h-64 flex items-center justify-center bg-[#181818] border border-[#2e2e2e] relative overflow-hidden mb-6 p-4">
                <svg
                  viewBox="0 0 300 240"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="dot-grid-inverted" width="12" height="12" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.8" fill="#2d2d2d" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dot-grid-inverted)" />

                  {/* Symmetrical Parametric Wing Curves in pure white */}
                  {Array.from({ length: 14 }).map((_, i) => {
                    const factor = (i + 1) * 7.5;
                    return (
                      <g key={i}>
                        <path
                          d={`M 150 120 C ${150 - factor} ${50 - factor * 0.4}, ${150 - factor * 2} ${100 + factor * 0.8}, 150 200`}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth={i % 3 === 0 ? 1.3 : 0.8}
                          opacity={i % 2 === 0 ? 0.92 : 0.45}
                        />
                        <path
                          d={`M 150 120 C ${150 + factor} ${50 - factor * 0.4}, ${150 + factor * 2} ${100 + factor * 0.8}, 150 200`}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth={i % 3 === 0 ? 1.3 : 0.8}
                          opacity={i % 2 === 0 ? 0.92 : 0.45}
                        />
                      </g>
                    );
                  })}

                  {/* Center Core Spindle */}
                  <line x1="150" y1="30" x2="150" y2="210" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="150" cy="50" r="3.5" fill="#FFFFFF" />
                  <circle cx="150" cy="120" r="2.5" fill="#FFFFFF" />
                  <circle cx="150" cy="180" r="2" fill="#FFFFFF" />
                </svg>

                {/* Subtitle inside poster artwork */}
                <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#888888] uppercase tracking-wider bg-black/90 px-1.5 py-0.5 border border-[#2e2e2e]">
                  FORM DISCOVERY #09
                </div>
              </div>

              {/* Lower Poster Caption */}
              <p className="text-xs font-mono text-[#A0A0A0] leading-relaxed mb-4">
                Generates self-intersecting symmetry lattices from harmonic sine-phase superposition.
              </p>

              {/* Action Button in solid white */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onOpenPlayground}
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  LOAD STUDY ↗
                </button>
                <span className="text-[10px] font-mono text-[#777777]">SEED: 38921</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
