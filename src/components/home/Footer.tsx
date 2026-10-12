import React from 'react';

interface FooterProps {
  onOpenPlayground: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPlayground }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-[#A0A0A0] border-t border-[#222222] py-14 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#222222]">
          {/* Brand & Description (6 cols) */}
          <div className="md:col-span-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-5 h-5 border border-[#333333] bg-[#141414] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rotate-45" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
                VECTOR <span className="text-[#666666] font-normal">/</span> TERRAIN
              </span>
            </div>
            <p className="font-mono text-xs text-[#A0A0A0] max-w-sm leading-relaxed mb-6">
              An experimental space for computational graphics, parametric vectors, and generative systems.
            </p>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#A0A0A0] bg-[#141414] px-3 py-1.5 border border-[#262626]">
              <span className="w-1.5 h-1.5 bg-white" />
              <span>ALL GENERATIVE ENGINES NOMINAL</span>
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-widest text-white mb-4">
              Navigation
            </div>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <a href="#systems" className="hover:text-white transition-colors">
                  Generative Systems
                </a>
              </li>
              <li>
                <a href="#statement" className="hover:text-white transition-colors">
                  Manifesto
                </a>
              </li>
              <li>
                <a href="#experiment" className="hover:text-white transition-colors">
                  Live Experiment
                </a>
              </li>
              <li>
                <a href="#archive" className="hover:text-white transition-colors">
                  Selected Outputs
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-white transition-colors">
                  The Process
                </a>
              </li>
            </ul>
          </div>

          {/* Studio Workspace (3 cols) */}
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-widest text-white mb-4">
              Workspace
            </div>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <button
                  onClick={onOpenPlayground}
                  className="text-white font-semibold hover:underline transition-colors flex items-center gap-1"
                >
                  Enter Vector Terrain Studio ↗
                </button>
              </li>
              <li className="text-[#777777]">Engine: p5.js & Pure Vector Math</li>
              <li className="text-[#777777]">Output: SVG, PNG, PDF, WebM, MP4</li>
              <li className="text-[#777777]">Precision: Deterministic Seed RNG</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Year */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[#777777] gap-4">
          <div>
            &copy; {currentYear} VECTOR TERRAIN. Independent Creative Technology.
          </div>
          <div className="flex items-center gap-6">
            <span>EXPERIMENTAL GRAPHICS / 001</span>
            <span>NO COOKIES • LOCAL GENERATION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
