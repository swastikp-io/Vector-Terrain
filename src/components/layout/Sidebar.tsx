import React, { useState } from 'react';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { GeneratorMode } from '../../engine/core/types';
import { PARAM_DEFINITIONS, ASPECT_RATIOS } from '../../store/defaults';
import { PALETTES } from '../../store/palettes';
import {
  Waves,
  Infinity as LoopIcon,
  GitFork,
  Radio,
  Mountain,
  Share2,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check,
  Palette as PaletteIcon,
  Sliders,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const MODE_ITEMS: { mode: GeneratorMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'waveforms', label: 'Waveforms', icon: <Waves size={15} /> },
  { mode: 'loops', label: 'Loops', icon: <LoopIcon size={15} /> },
  { mode: 'branches', label: 'Branches', icon: <GitFork size={15} /> },
  { mode: 'interference', label: 'Interference', icon: <Radio size={15} /> },
  { mode: 'contours', label: 'Contours', icon: <Mountain size={15} /> },
  { mode: 'connections', label: 'Connections', icon: <Share2 size={15} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const {
    mode,
    setMode,
    configs,
    updateParam,
    seed,
    setSeed,
    rollSeed,
    paletteId,
    setPaletteId,
    dimensions,
    setDimensions,
    lockedParams,
    toggleLockParam,
    isPaletteLocked,
    toggleLockPalette,
    resetCurrentMode,
    randomizeGeometryOnly,
  } = usePlaygroundStore();

  const [copiedSeed, setCopiedSeed] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'style' | 'seed'>('params');

  const currentConfig = configs[mode] as any;
  const paramDefs = PARAM_DEFINITIONS[mode] || [];

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seed.toString());
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1500);
  };

  return (
    <aside
      className={`h-full bg-[#0c0d0e] border-l border-[#222326] flex flex-col flex-shrink-0 transition-all duration-200 z-20 relative select-none ${
        collapsed ? 'w-14' : 'w-80 md:w-84'
      }`}
    >
      {/* Mode Selector Navigation */}
      <div className={`p-2 border-b border-[#222326] bg-[#121316] ${collapsed ? 'flex flex-col gap-1' : 'grid grid-cols-6 gap-1'}`}>
        {MODE_ITEMS.map((item) => {
          const isActive = mode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              title={item.label}
              className={`flex flex-col items-center justify-center py-2 rounded transition relative border ${
                isActive
                  ? 'border-white text-white bg-[#1a1b1f] font-medium'
                  : 'border-transparent text-[#8e919a] hover:text-white hover:border-[#333338] hover:bg-[#18191c]'
              }`}
            >
              {item.icon}
              {!collapsed && (
                <span className="text-[9px] mt-1 tracking-tight truncate max-w-full hidden md:inline">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub Tabs: Parameters | Palette | Seed */}
      {!collapsed && (
        <div className="flex border-b border-[#222326] text-xs font-mono bg-[#121316]">
          <button
            onClick={() => setActiveTab('params')}
            className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'params'
                ? 'text-white border-b-2 border-white font-semibold bg-[#0c0d0e]'
                : 'text-[#8e919a] hover:text-white hover:bg-[#18191c]'
            }`}
          >
            <Sliders size={12} />
            <span>Parameters</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'style'
                ? 'text-white border-b-2 border-white font-semibold bg-[#0c0d0e]'
                : 'text-[#8e919a] hover:text-white hover:bg-[#18191c]'
            }`}
          >
            <PaletteIcon size={12} />
            <span>Palette</span>
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'seed'
                ? 'text-white border-b-2 border-white font-semibold bg-[#0c0d0e]'
                : 'text-[#8e919a] hover:text-white hover:bg-[#18191c]'
            }`}
          >
            <RefreshCw size={12} />
            <span>Seed</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-white">
        {collapsed ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-[#18191c] text-[#8e919a] hover:text-white rounded"
              title="Expand Controls"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: PARAMETERS */}
            {activeTab === 'params' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#222326]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e919a]">
                    {mode.toUpperCase()} Controls
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={randomizeGeometryOnly}
                      className="text-[10px] text-[#8e919a] hover:text-white underline font-mono"
                    >
                      Shuffle
                    </button>
                    <button
                      onClick={resetCurrentMode}
                      className="text-[10px] text-[#8e919a] hover:text-white underline font-mono"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {paramDefs.map((def) => {
                    const value = currentConfig[def.key];
                    const lockKey = `${mode}.${def.key}`;
                    const isLocked = Boolean(lockedParams[lockKey] || lockedParams[def.key]);

                    if (def.type === 'range') {
                      return (
                        <div key={def.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#e4e4e7] font-medium flex items-center gap-1.5">
                              {def.label}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[#a1a1aa] text-[11px] tabular-nums">
                                {typeof value === 'number'
                                  ? def.step < 1
                                    ? value.toFixed(2)
                                    : value
                                  : value}
                              </span>
                              <button
                                onClick={() => toggleLockParam(lockKey)}
                                title={isLocked ? 'Unlock parameter' : 'Lock parameter during randomization'}
                                className={`p-0.5 rounded transition ${
                                  isLocked
                                    ? 'text-white'
                                    : 'text-[#71717a] hover:text-white'
                                }`}
                              >
                                {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                              </button>
                            </div>
                          </div>

                          <input
                            type="range"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={value}
                            onChange={(e) =>
                              updateParam(def.key, parseFloat(e.target.value))
                            }
                            className="w-full cursor-pointer"
                          />
                        </div>
                      );
                    }

                    if (def.type === 'boolean') {
                      return (
                        <div
                          key={def.key}
                          className="flex items-center justify-between py-1 text-xs"
                        >
                          <span className="text-[#e4e4e7] font-medium">{def.label}</span>
                          <button
                            onClick={() => updateParam(def.key, !value)}
                            className={`w-9 h-5 rounded-full transition-colors relative border ${
                              value ? 'bg-white border-white' : 'bg-[#27282d] border-[#3f3f46]'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full transition-transform absolute top-0.5 ${
                                value ? 'bg-black right-0.5' : 'bg-[#a1a1aa] left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    }

                    if (def.type === 'select' && def.options) {
                      return (
                        <div key={def.key} className="space-y-1 text-xs">
                          <label className="text-[#e4e4e7] font-medium block">
                            {def.label}
                          </label>
                          <select
                            value={value}
                            onChange={(e) => updateParam(def.key, e.target.value)}
                            className="w-full bg-[#18191c] border border-[#27282d] hover:border-white rounded px-2.5 py-1.5 text-xs text-white outline-none capitalize cursor-pointer"
                          >
                            {def.options.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#18191c] text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PALETTE & ARTBOARD */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* Palette Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#222326]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e919a]">
                      Curated Palettes
                    </span>
                    <button
                      onClick={toggleLockPalette}
                      title={isPaletteLocked ? 'Unlock Palette' : 'Lock Palette'}
                      className={`flex items-center gap-1 text-[11px] font-mono ${
                        isPaletteLocked ? 'text-white font-semibold' : 'text-[#8e919a] hover:text-white'
                      }`}
                    >
                      {isPaletteLocked ? <Lock size={11} /> : <Unlock size={11} />}
                      <span>{isPaletteLocked ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {PALETTES.map((pal) => {
                      const isSelected = pal.id === paletteId;
                      return (
                        <button
                          key={pal.id}
                          onClick={() => setPaletteId(pal.id)}
                          className={`flex items-center justify-between p-2 rounded border transition text-left ${
                            isSelected
                              ? 'border-white bg-[#18191c]'
                              : 'border-[#27282d] hover:border-[#3f3f46] bg-[#121316]'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-medium text-white">
                              {pal.name}
                            </div>
                            <div className="text-[10px] text-[#8e919a] font-mono capitalize">
                              {pal.mode}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-[#0c0d0e] p-1 rounded border border-[#27282d]">
                            <div
                              className="w-4 h-4 rounded-sm border border-[#3f3f46]"
                              style={{ backgroundColor: pal.background }}
                              title="Background"
                            />
                            {pal.colors.slice(0, 3).map((c, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-sm border border-[#3f3f46]"
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Artboard Aspect Ratio */}
                <div className="space-y-2.5 pt-2 border-t border-[#222326]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e919a] block pb-1 border-b border-[#222326]">
                    Artboard Ratio
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {ASPECT_RATIOS.map((aspect) => {
                      const isSelected =
                        dimensions.width === aspect.width &&
                        dimensions.height === aspect.height;
                      return (
                        <button
                          key={aspect.label}
                          onClick={() =>
                            setDimensions({
                              width: aspect.width,
                              height: aspect.height,
                              aspectRatioLabel: aspect.label,
                            })
                          }
                          className={`flex items-center justify-between px-3 py-2 rounded text-xs border transition ${
                            isSelected
                              ? 'border-white bg-white text-black font-medium'
                              : 'border-[#27282d] hover:border-white bg-[#121316] text-[#e4e4e7]'
                          }`}
                        >
                          <span>{aspect.label}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-neutral-700' : 'text-[#71717a]'}`}>
                            {aspect.width} × {aspect.height}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SEED & REPRODUCIBILITY */}
            {activeTab === 'seed' && (
              <div className="space-y-4">
                <div className="pb-1 border-b border-[#222326]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e919a]">
                    Deterministic Seed
                  </span>
                </div>

                <p className="text-xs text-[#8e919a] leading-relaxed">
                  Every unique seed and parameter set produces an identical vector composition.
                  Save or share your seed to recreate this artwork anytime.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[#8e919a] block">
                    Active Seed Value
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-[#18191c] border border-[#27282d] rounded px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-white"
                    />
                    <button
                      onClick={rollSeed}
                      title="Roll New Random Seed"
                      className="p-2 bg-[#18191c] hover:bg-[#25262c] border border-[#27282d] hover:border-[#3f3f46] rounded text-white transition"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={handleCopySeed}
                      title="Copy Seed"
                      className="p-2 bg-[#18191c] hover:bg-[#25262c] border border-[#27282d] hover:border-[#3f3f46] rounded text-white transition"
                    >
                      {copiedSeed ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222326] space-y-2">
                  <span className="text-[11px] font-mono text-[#8e919a] block">
                    Quick Jump Seeds
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1042, 2048, 4401, 7705, 6632, 5531].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeed(s)}
                        className={`py-1 rounded text-xs font-mono border transition ${
                          seed === s
                            ? 'border-white bg-white text-black font-medium'
                            : 'border-[#27282d] hover:border-white bg-[#121316] text-[#a1a1aa]'
                        }`}
                      >
                        #{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#222326] flex items-center justify-between text-[#71717a] text-xs bg-[#121316]">
        {!collapsed && (
          <span className="text-[10px] font-mono px-2 text-[#71717a]">v1.1.0-RELEASE</span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-[#18191c] hover:text-white rounded ml-auto transition text-[#a1a1aa]"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
};
