'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  ShieldAlert,
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            Strategic Naming Territories ({identity.namingTerritories.length})
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Structural Semantics</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {identity.namingTerritories.map((terr) => (
            <div key={terr.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 text-xs space-y-1.5">
              <span className="font-bold text-indigo-300">{terr.name}</span>
              <p className="text-zinc-300 text-[11px] leading-relaxed">{terr.semanticLogic}</p>
              <div className="text-[10px] text-zinc-500">
                <strong>Phonetic Architecture:</strong> {terr.phoneticLogic}
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
              <Tag className="w-4 h-4 text-emerald-400" />
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
                className={`bg-zinc-950 border rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                    : isRejected
                    ? 'border-zinc-800/50 opacity-60'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Name + Badges */}
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-900 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-white tracking-wide">{candidate.name}</span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 font-mono">
                          <Volume2 className="w-2.5 h-2.5" />
                          {candidate.pronunciation}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-medium">{candidate.territoryName}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : isRejected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400">Rejected</span>
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
                      <span className="text-zinc-500">Semantic Link: </span>
                      {candidate.semanticAssociation}
                    </div>
                  </div>

                  {/* Anti-Generic Flags */}
                  {candidate.antiGenericFlags.length > 0 && (
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded p-2 text-[10px] space-y-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
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
                  <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-2 rounded border border-zinc-800/60">
                    <span className="text-zinc-500 font-semibold">Strategic Fit: </span>
                    {candidate.strategicFit}
                  </div>

                  {/* Rejection Note if rejected */}
                  {candidate.rejectionReason && (
                    <div className="text-[10px] text-red-400 italic">Rejected: {candidate.rejectionReason}</div>
                  )}

                  {/* Legal Disclaimer */}
                  <div className="text-[9px] text-zinc-600 flex items-start gap-1 pt-1">
                    <Scale className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                    <span>{candidate.legalDisclaimer}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
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
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 ml-auto shadow-sm"
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-cyan-400" />
              Strategic Tagline Options
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
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
                className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-cyan-950/20 border-cyan-500 ring-1 ring-cyan-500/40'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {Math.round(tag.falsifiabilityScore * 100)}% Falsifiability
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-xs font-semibold text-zinc-100">&ldquo;{tag.tagline}&rdquo;</p>
                <p className="text-[10px] text-zinc-400">{tag.strategicMechanism}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-sm w-full space-y-3">
            <h4 className="text-sm font-bold text-white">Specify Rejection Reason</h4>
            <textarea
              placeholder="e.g. Sounds too similar to existing competitor, or phonetic rhythm is awkward..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectId(null)} className="px-3 py-1 text-xs text-zinc-400">
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded disabled:opacity-50"
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
