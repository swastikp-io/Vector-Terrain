import React from 'react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      name: 'Define',
      lead: 'Choose a system, seed, and starting parameters.',
      detail:
        'Select from six generative engines including waveforms, recursive loops, dendritic branches, and noise contours. Set the random seed to initialize a deterministic mathematical coordinate space.',
      graphic: (
        <svg viewBox="0 0 160 120" className="w-full h-24 mb-6">
          <line x1="20" y1="60" x2="140" y2="60" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="80" y1="15" x2="80" y2="105" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="80" cy="60" r="28" stroke="#000000" strokeWidth="1.5" fill="none" />
          <circle cx="80" cy="60" r="3" fill="#000000" />
          <rect x="42" y="24" width="76" height="72" stroke="#E5E5E5" strokeWidth="1" fill="none" />
          <text x="86" y="55" fill="#888888" fontSize="9" fontFamily="monospace">SEED: RND</text>
        </svg>
      ),
    },
    {
      num: '02',
      name: 'Discover',
      lead: 'Adjust the variables and explore unexpected compositions.',
      detail:
        'Tweak line density, noise scale, phase offsets, and curvature forces in real time. Watch complex emergence and unintended harmonics materialize across hundreds of mathematical vector paths.',
      graphic: (
        <svg viewBox="0 0 160 120" className="w-full h-24 mb-6">
          <path
            d="M 20 80 Q 50 20, 80 60 T 140 40"
            stroke="#000000"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 20 88 Q 50 28, 80 68 T 140 48"
            stroke="#555555"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 2"
          />
          <path
            d="M 20 96 Q 50 36, 80 76 T 140 56"
            stroke="#888888"
            strokeWidth="1"
            fill="none"
            strokeOpacity="0.8"
          />
          <circle cx="50" cy="20" r="2" fill="#000000" />
          <circle cx="80" cy="60" r="2.5" fill="#000000" />
          <circle cx="110" cy="80" r="2" fill="#000000" />
        </svg>
      ),
    },
    {
      num: '03',
      name: 'Export',
      lead: 'Take your selected artwork into your next creative project.',
      detail:
        'Download clean SVG vector files for Illustrator & Figma, print-ready high-DPI PDFs, lossless raster PNGs, or up to 15-second high-framerate WebM & MP4 animated vector loops.',
      graphic: (
        <svg viewBox="0 0 160 120" className="w-full h-24 mb-6">
          <rect x="35" y="25" width="90" height="70" stroke="#E5E5E5" strokeWidth="1" fill="none" />
          <polyline points="70,45 80,35 90,45" stroke="#000000" strokeWidth="1.5" fill="none" />
          <line x1="80" y1="35" x2="80" y2="70" stroke="#000000" strokeWidth="1.5" />
          <line x1="50" y1="80" x2="110" y2="80" stroke="#000000" strokeWidth="1.5" />
          <text x="40" y="105" fill="#888888" fontSize="8" fontFamily="monospace">SVG • PDF • MP4</text>
        </svg>
      ),
    },
  ];

  return (
    <section id="process" className="relative py-28 bg-white text-black border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-20">
          <div className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black" />
            05 / THE PROCESS
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight font-display text-black">
            From rule to form.
          </h2>
        </div>

        {/* 3 Step Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st) => (
            <div
              key={st.num}
              className="border border-[#E5E5E5] bg-[#F7F7F7] p-8 flex flex-col justify-between hover:border-black transition-colors duration-200 shadow-sm"
            >
              <div>
                {/* Step Glyph */}
                <div className="border-b border-[#E5E5E5] pb-4 mb-6 flex items-center justify-between">
                  <span className="font-mono text-xs text-[#888888] tracking-widest uppercase">
                    STEP {st.num}
                  </span>
                  <span className="w-1.5 h-1.5 bg-black" />
                </div>

                {st.graphic}

                <h3 className="text-2xl font-light font-display text-black mb-2">
                  {st.name}
                </h3>
                <p className="font-mono text-xs uppercase text-black font-semibold tracking-wider mb-4 leading-relaxed">
                  {st.lead}
                </p>
                <p className="font-mono text-xs text-[#666666] leading-relaxed">
                  {st.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
