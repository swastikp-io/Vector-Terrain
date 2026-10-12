import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FinalCTAProps {
  onOpenPlayground: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenPlayground }) => {
  return (
    <section className="relative py-32 bg-white text-black overflow-hidden border-b border-[#E5E5E5]">
      {/* Subtle monochrome background motif */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-30 pointer-events-none pr-8">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_40s_linear_infinite]">
          {[15, 30, 45, 60, 75, 90].map((r, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={r}
              stroke="#000000"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray={i % 2 === 0 ? '4 4' : 'none'}
              opacity={0.35}
            />
          ))}
          <line x1="100" y1="5" x2="100" y2="195" stroke="#E5E5E5" strokeWidth="0.8" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="#E5E5E5" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black" />
            WORKSPACE READY
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight font-display mb-8 text-black leading-[1.05]">
            Start with nothing.<br />
            <span className="text-[#888888]">See what emerges.</span>
          </h2>

          <p className="font-mono text-sm sm:text-base text-[#666666] mb-10 max-w-xl leading-relaxed">
            Open Vector Terrain and begin with a single rule. Tune waveforms, explore noise topologies, and export publication-ready vector artwork in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onOpenPlayground}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-black hover:bg-neutral-800 text-white font-mono text-xs uppercase font-semibold tracking-wider transition-all duration-200 shadow-sm"
            >
              Enter Vector Terrain
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <a
              href="#systems"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-[#F0F0F0] text-black border border-[#E5E5E5] hover:border-black font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Review Systems
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
