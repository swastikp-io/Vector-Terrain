import React from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onOpenPlayground: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenPlayground }) => {
  return (
    <section className="relative w-full bg-white text-black pt-12 sm:pt-20 pb-20 sm:pb-28 border-b border-[#E5E5E5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Editorial Composition with Generous Negative Space */}
        <div className="max-w-4xl">
          {/* Oversized Lightweight Typography */}
          <h1 className="font-['Space_Grotesk'] text-5xl sm:text-7xl lg:text-[92px] font-light leading-[0.95] tracking-tight text-black mb-8">
            Make the<br />
            unpredictable<br />
            <span className="text-black font-normal relative">
              visible
              <span className="inline-block w-2.5 h-2.5 bg-black ml-1.5 align-baseline" />
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg font-sans text-[#666666] leading-relaxed max-w-2xl mb-12 font-normal">
            An interactive studio for procedural vector art. Explore patterns, distort
            geometry, and turn mathematical systems into visual compositions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenPlayground}
              className="group flex items-center gap-2.5 px-7 py-4 bg-black hover:bg-neutral-800 text-white font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-sm"
            >
              <span>ENTER TERRAIN</span>
              <ArrowUpRight
                size={16}
                className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>

            <a
              href="#systems"
              className="flex items-center gap-2 px-6 py-4 bg-white hover:bg-[#F0F0F0] text-black border border-[#E5E5E5] hover:border-black font-mono text-xs uppercase tracking-wider transition-all duration-150"
            >
              <span>EXPLORE THE SYSTEMS</span>
              <ArrowDown size={14} className="text-[#666666]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
