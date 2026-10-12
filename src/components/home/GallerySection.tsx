import React, { useMemo } from 'react';
import { generateGeometry } from '../../engine/generators';
import { commandsToSvgPathData } from '../../engine/renderers/svgRenderer';
import { GeneratorMode, GeneratorConfig } from '../../engine/core/types';
import {
  DEFAULT_WAVEFORMS,
  DEFAULT_CONTOURS,
  DEFAULT_LOOPS,
  DEFAULT_BRANCHES,
  DEFAULT_INTERFERENCE,
  DEFAULT_CONNECTIONS,
} from '../../store/defaults';

interface GallerySectionProps {
  onSelectStudy?: (study: {
    mode: GeneratorMode;
    seed: number;
    config?: GeneratorConfig;
  }) => void;
}

interface StudyItem {
  id: string;
  title: string;
  seed: number;
  mode: GeneratorMode;
  systemName: string;
  config: GeneratorConfig;
  paletteColors: string[];
  span: string;
}

export const GallerySection: React.FC<GallerySectionProps> = () => {
  const studies: StudyItem[] = useMemo(
    () => [
      {
        id: 'study-01',
        title: 'STUDY 001 / FLUID TENSION',
        seed: 82104,
        mode: 'waveforms',
        systemName: 'FLOW FIELD',
        config: {
          ...DEFAULT_WAVEFORMS,
          lineCount: 26,
          amplitude: 85,
          frequency: 3.1,
          distortion: 0.42,
          splitMergeStrength: 0.7,
          strokeWidth: 1.2,
        },
        paletteColors: ['#000000', '#222222', '#555555'],
        span: 'col-span-1 md:col-span-2 lg:col-span-8',
      },
      {
        id: 'study-02',
        title: 'STUDY 002 / TOPOGRAPHIC ELEVATION',
        seed: 19482,
        mode: 'contours',
        systemName: 'NOISE CONTOUR',
        config: {
          ...DEFAULT_CONTOURS,
          contourCount: 22,
          noiseIntensity: 1.8,
          lineSpacing: 11,
          radialInfluence: 0.5,
          strokeWidth: 1.25,
        },
        paletteColors: ['#000000', '#333333', '#666666'],
        span: 'col-span-1 md:col-span-1 lg:col-span-4',
      },
      {
        id: 'study-03',
        title: 'STUDY 003 / RECURSIVE TORUS',
        seed: 30419,
        mode: 'loops',
        systemName: 'RECURSIVE GEOMETRY',
        config: {
          ...DEFAULT_LOOPS,
          loopCount: 18,
          loopWidth: 175,
          loopHeight: 230,
          rotation: 30,
          overlap: 0.55,
          strokeWidth: 1.3,
        },
        paletteColors: ['#000000', '#222222', '#555555'],
        span: 'col-span-1 md:col-span-1 lg:col-span-4',
      },
      {
        id: 'study-04',
        title: 'STUDY 004 / DENDRITIC BIFURCATION',
        seed: 71205,
        mode: 'branches',
        systemName: 'ORGANIC GROWTH',
        config: {
          ...DEFAULT_BRANCHES,
          initialLineCount: 3,
          branchCount: 9,
          branchAngle: 38,
          splitPosition: 0.2,
          curvature: 0.9,
          strokeWidth: 1.3,
        },
        paletteColors: ['#000000', '#333333', '#666666'],
        span: 'col-span-1 md:col-span-2 lg:col-span-8',
      },
      {
        id: 'study-05',
        title: 'STUDY 005 / HARMONIC RESONANCE',
        seed: 45012,
        mode: 'interference',
        systemName: 'MOIRÉ INTERFERENCE',
        config: {
          ...DEFAULT_INTERFERENCE,
          frequencyX: 4,
          frequencyY: 5,
          repetitions: 12,
          distortion: 0.28,
          strokeWidth: 1.1,
        },
        paletteColors: ['#000000', '#222222', '#444444'],
        span: 'col-span-1 md:col-span-1 lg:col-span-4',
      },
      {
        id: 'study-06',
        title: 'STUDY 006 / SYNAPTIC FILAMENTS',
        seed: 92831,
        mode: 'connections',
        systemName: 'GRAPH TOPOLOGY',
        config: {
          ...DEFAULT_CONNECTIONS,
          nodeCount: 22,
          connectionCount: 36,
          pathCurvature: 0.5,
          strokeWidth: 1.25,
        },
        paletteColors: ['#000000', '#333333', '#555555'],
        span: 'col-span-1 md:col-span-1 lg:col-span-4',
      },
      {
        id: 'study-07',
        title: 'STUDY 007 / STRATIFIED TERRAIN',
        seed: 63821,
        mode: 'contours',
        systemName: 'ISOLINE FIELD',
        config: {
          ...DEFAULT_CONTOURS,
          contourCount: 28,
          noiseIntensity: 2.1,
          lineSpacing: 9,
          strokeWidth: 1.15,
        },
        paletteColors: ['#000000', '#222222', '#555555'],
        span: 'col-span-1 md:col-span-1 lg:col-span-4',
      },
    ],
    []
  );

  // Generate vector paths for each study
  const renderedStudies = useMemo(() => {
    return studies.map((item) => {
      const geom = generateGeometry(
        item.config,
        item.seed,
        { width: 600, height: 420 },
        {
          id: item.id,
          name: item.title,
          background: '#FFFFFF',
          primary: '#000000',
          secondary: '#333333',
          accent: '#666666',
          colors: item.paletteColors,
          mode: 'monochrome',
        }
      );
      return {
        ...item,
        geometry: geom,
      };
    });
  }, [studies]);

  return (
    <section id="archive" className="relative py-28 bg-white text-black border-b border-[#E5E5E5] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black" />
              04 / SELECTED OUTPUTS
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight font-display text-black">
              Every seed is a<br />
              <span className="text-[#888888]">starting point.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#666666] font-mono leading-relaxed">
            A curated archive of generative studies exploring density, recursion, harmonic distortion, and topology.
          </p>
        </div>

        {/* Computational Print Grid — Static Exhibition Archive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {renderedStudies.map((study) => (
            <div
              key={study.id}
              className={`relative bg-[#F7F7F7] border border-[#E5E5E5] flex flex-col justify-between overflow-hidden shadow-sm ${study.span}`}
            >
              {/* Artwork Viewport */}
              <div className="relative w-full h-72 sm:h-80 bg-white border-b border-[#E5E5E5] flex items-center justify-center p-6 overflow-hidden">
                {/* Technical Coordinates Watermark */}
                <div className="absolute top-3 left-3 font-mono text-[10px] text-[#888888]/60 uppercase tracking-widest pointer-events-none">
                  X: {study.seed % 1000} / Y: {Math.floor(study.seed / 1000)}
                </div>

                <div className="absolute top-3 right-3 font-mono text-[10px] text-[#666666] bg-white px-2 py-0.5 border border-[#E5E5E5]">
                  SEED: {study.seed}
                </div>

                {/* Real Procedural Vector Paths in pure monochrome (No hover scale animation) */}
                <svg
                  viewBox="0 0 600 420"
                  className="w-full h-full object-contain relative z-10"
                >
                  {study.geometry.paths.map((p, idx) => {
                    const d = commandsToSvgPathData(p.commands);
                    const stroke =
                      study.paletteColors[idx % study.paletteColors.length];
                    return (
                      <path
                        key={p.id || idx}
                        d={d}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={p.strokeWidth || 1.3}
                        strokeOpacity={idx % 3 === 0 ? 0.95 : 0.65}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Study Card Metadata Footer (Static archival exhibition info) */}
              <div className="p-4 sm:p-5 bg-[#F7F7F7] flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#888888] mb-1">
                    {study.systemName}
                  </div>
                  <div className="font-mono text-xs font-semibold text-black">
                    {study.title}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#888888] uppercase tracking-wider bg-white px-2.5 py-1 border border-[#E5E5E5]">
                  STUDY
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
