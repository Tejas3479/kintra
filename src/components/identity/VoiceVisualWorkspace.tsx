'use client';

import React from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { sanitizeSvg } from '@/lib/security/content-sanitizer';
import {
  Sliders,
  Palette,
  Type,
  ImageIcon,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Sparkles,
  Ban,
} from 'lucide-react';

export const VoiceVisualWorkspace: React.FC = () => {
  const {
    project,
    updateVoiceTonalSlider,
    generateVisualAsset,
    approveCreativeIdentity,
    isLoading,
  } = useBrandStore();

  const identity = project.creativeIdentity;

  if (!identity) {
    return null;
  }

  const { voiceSystem, visualSystem, generatedVisuals, consistencyConflicts } = identity;
  const isApproved = identity.status === 'approved' || project.stage === 'identity_locked';

  return (
    <div className="space-y-6">
      {/* Consistency Conflicts Banner */}
      {consistencyConflicts.length > 0 && (
        <div className="space-y-2">
          {consistencyConflicts.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                c.severity === 'blocking'
                  ? 'bg-red-950/40 border-red-800/60 text-red-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span>Identity Consistency Alert:</span>
                  <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                    {c.layerA} ↔ {c.layerB}
                  </span>
                </div>
                <p className="text-zinc-300">{c.conflictDescription}</p>
                <div className="text-[11px] text-zinc-400">
                  <strong>Suggested Alignment:</strong> {c.suggestedAlignment}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: Voice System & Visual System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Voice System */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                Deterministic Voice System
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dynamic tone sliders and staccato cadence specifications.
              </p>
            </div>
          </div>

          {/* Tonal Sliders */}
          <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Tonal Weight Sliders
            </span>
            <div className="space-y-3">
              {(['precision', 'warmth', 'authority', 'energy'] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-zinc-300 font-medium">{key}</span>
                    <span className="font-mono text-violet-400">{voiceSystem.tonalSliders[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={voiceSystem.tonalSliders[key]}
                    onChange={(e) => updateVoiceTonalSlider(key, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* We Say vs We Avoid */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              We Say vs. We Avoid
            </span>
            <div className="space-y-2.5">
              {voiceSystem.weSayVsWeAvoid.map((pair, idx) => (
                <div key={idx} className="bg-zinc-900/70 border border-zinc-800/70 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-[10px] text-emerald-400 uppercase block">We Say:</span>
                      &ldquo;{pair.weSay}&rdquo;
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-red-300 bg-red-950/20 p-2 rounded border border-red-900/30">
                    <Ban className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <span className="font-bold text-[10px] text-red-400 uppercase block">We Avoid:</span>
                      &ldquo;{pair.weAvoid}&rdquo;
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 italic pt-0.5">Rationale: {pair.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Banned Patterns */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
              <Ban className="w-3 h-3 text-red-400" /> Banned Buzzword Patterns:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {voiceSystem.bannedPatterns.map((banned, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-[10px] text-red-300 font-mono"
                >
                  {banned}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual System & Asset Synthesis */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                Visual Design System & Tokens
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Exact hex tokens, typography hierarchy, and shape geometry.
              </p>
            </div>
          </div>

          {/* Color Palette Swatches */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Tokenized Palette Architecture
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                visualSystem.palette.primary,
                visualSystem.palette.secondary,
                visualSystem.palette.accent,
                visualSystem.palette.neutralLight,
                visualSystem.palette.semantic.success,
                visualSystem.palette.semantic.error,
              ].map((color, i) => (
                <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-bold text-zinc-200 text-[11px] truncate">{color.name}</span>
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400">{color.hex}</div>
                  <div className="text-[9px] text-zinc-500 leading-tight">{color.contrastOnDark}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-400" /> Typography Hierarchy
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-500 block">Headline:</span>
                <span className="font-semibold text-zinc-200">{visualSystem.typography.headline.family}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Body:</span>
                <span className="font-semibold text-zinc-200">{visualSystem.typography.body.family}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Code:</span>
                <span className="font-mono text-zinc-200">{visualSystem.typography.code.family}</span>
              </div>
            </div>
          </div>

          {/* Synthesized Visual Asset Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Synthesized Brand Visual Mark
              </span>
              <button
                onClick={() => generateVisualAsset('brand_mark')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" /> Regenerate Mark
              </button>
            </div>

            {generatedVisuals.length > 0 && generatedVisuals[0].svgContent ? (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-3">
                <div
                  className="w-48 h-48 max-w-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(generatedVisuals[0].svgContent) }}
                />
                <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                  <span>Inherited Constraints:</span>
                  <span className="font-mono text-zinc-400">
                    {generatedVisuals[0].inheritedConstraints.length} parameters
                  </span>
                  {generatedVisuals[0].isFallback && (
                    <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded">Fallback Mode</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Action: Lock Creative Identity */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Commit Creative Identity to Decision Graph
          </h4>
          <p className="text-xs text-zinc-400">
            Locks Name and Tagline into the immutable causal graph and archives version snapshot.
          </p>
        </div>

        <button
          onClick={() => approveCreativeIdentity()}
          disabled={isApproved || isLoading}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
            isApproved
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          {isApproved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Creative Identity Locked</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Lock Creative Identity & Advance</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
