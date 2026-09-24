'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Volume2,
  Quote,
} from 'lucide-react';

export const NamingWorkspace: React.FC = () => {
  const { project, selectName, rejectName, selectTagline } = useBrandStore();
  const identity = project.creativeIdentity;

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!identity) {
    return null;
  }

  const handleConfirmReject = () => {
    if (!rejectId || !rejectReason.trim()) return;
    rejectName(rejectId, rejectReason.trim());
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Naming Territories Banner */}
      <div className="monolith-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <span className="text-xs uppercase font-mono font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-champagne-400" />
            Strategic Naming Territories ({identity.namingTerritories.length})
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Structural Semantics</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {identity.namingTerritories.map((terr) => (
            <div key={terr.id} className="bg-obsidian-950/70 border border-white/[0.05] rounded-lg p-3 text-xs space-y-1.5">
              <span className="font-bold text-champagne-300">{terr.name}</span>
              <p className="text-zinc-300 text-[11px] leading-relaxed">{terr.semanticLogic}</p>
              <div className="text-[10px] text-zinc-500 font-mono">
                <strong className="text-zinc-400">Phonetic Architecture:</strong> {terr.phoneticLogic}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Naming Candidates Studio */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-champagne-400" />
              Naming Candidates & Anti-Generic Linguistic Audit
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pressure-tested for genericness, suffix clichés, and category tropes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {identity.namingCandidates.map((candidate) => {
            const isSelected = candidate.id === identity.selectedNameId;
            const isRejected = candidate.status === 'rejected';

            return (
              <div
                key={candidate.id}
                className={`rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  isSelected
                    ? 'monolith-card-gold ring-1 ring-champagne-400/90 shadow-gold-glow'
                    : isRejected
                    ? 'bg-obsidian-950/50 border border-white/[0.04] opacity-60'
                    : 'monolith-card hover:border-champagne-500/30'
                }`}
              >
                <div className="space-y-3">
                  {/* Name + Badges */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/[0.05] pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-white tracking-wide">{candidate.name}</span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 font-mono">
                          <Volume2 className="w-2.5 h-2.5 text-champagne-500/70" />
                          {candidate.pronunciation}
                        </span>
                      </div>
                      <span className="text-[10px] text-champagne-400 font-medium font-mono">{candidate.territoryName}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : isRejected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-400 font-mono">Rejected</span>
                      ) : null}

                      {/* Genericness Risk Badge */}
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                          candidate.genericnessRisk === 'low'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : candidate.genericnessRisk === 'medium'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                            : 'bg-red-950/40 text-red-300 border-red-800/40'
                        }`}
                      >
                        {candidate.genericnessRisk} risk
                      </span>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="space-y-1 text-xs">
                    <p className="text-zinc-300 leading-relaxed">{candidate.rationale}</p>
                    <div className="text-[11px] text-zinc-400">
                      <span className="text-zinc-500 font-mono text-[10px]">Semantic Link: </span>
                      {candidate.semanticAssociation}
                    </div>
                  </div>

                  {/* Anti-Generic Flags */}
                  {candidate.antiGenericFlags.length > 0 && (
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-2.5 text-[10px] space-y-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3 h-3" />
                        Flagged Startup Clichés:
                      </span>
                      <ul className="list-disc pl-3.5 text-amber-200/80 space-y-0.5">
                        {candidate.antiGenericFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strategic Fit */}
                  <div className="text-[11px] text-zinc-400 bg-obsidian-950/80 p-2.5 rounded-lg border border-white/[0.05]">
                    <span className="text-zinc-500 font-semibold font-mono text-[10px]">Strategic Fit: </span>
                    {candidate.strategicFit}
                  </div>

                  {/* Rejection Note if rejected */}
                  {candidate.rejectionReason && (
                    <div className="text-[10px] text-red-400 italic">Rejected: {candidate.rejectionReason}</div>
                  )}

                  {/* Legal Disclaimer */}
                  <div className="text-[9px] text-zinc-500 flex items-start gap-1 pt-1 font-mono">
                    <Scale className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                    <span>{candidate.legalDisclaimer}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  {!isSelected && (
                    <button
                      onClick={() => setRejectId(candidate.id)}
                      className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}

                  {!isSelected && (
                    <button
                      onClick={() => selectName(candidate.id)}
                      className="btn-monolith-primary px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Select Name
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Tagline Selector */}
      <div className="monolith-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
          <div>
            <h4 className="text-xs uppercase font-mono font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-champagne-400" />
              Strategic Tagline Options
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Every tagline is tested for falsifiability — empty promotional claims are suppressed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {identity.taglineCandidates.map((tag) => {
            const isSelected = tag.id === identity.selectedTaglineId;

            return (
              <div
                key={tag.id}
                onClick={() => selectTagline(tag.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'monolith-card-gold ring-1 ring-champagne-400/80'
                    : 'bg-obsidian-950/70 border-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-champagne-400 font-bold">
                    {Math.round(tag.falsifiabilityScore * 100)}% Falsifiability
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-champagne-400" />}
                </div>
                <p className="text-xs font-semibold text-zinc-100">&ldquo;{tag.tagline}&rdquo;</p>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{tag.strategicMechanism}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card rounded-2xl p-5 max-w-sm w-full space-y-3 border border-white/[0.1]">
            <h4 className="text-sm font-bold text-white">Specify Rejection Reason</h4>
            <textarea
              placeholder="e.g. Sounds too similar to existing competitor, or phonetic rhythm is awkward..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-champagne-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setRejectId(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                Reject Name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
