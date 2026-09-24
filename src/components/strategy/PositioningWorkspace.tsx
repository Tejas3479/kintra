'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  XCircle,
  Merge,
  ShieldAlert,
  Flame,
  Quote,
} from 'lucide-react';

export const PositioningWorkspace: React.FC = () => {
  const {
    project,
    isLoading,
    loadingMessage,
    generatePositioningWorlds,
    selectPositioningWorld,
    editPositioningWorld,
    combinePositioningWorlds,
    rejectPositioningWorld,
  } = useBrandStore();

  const [editingWorldId, setEditingWorldId] = useState<string | null>(null);
  const [showHybridModal, setShowHybridModal] = useState(false);
  const [hybridTitle, setHybridTitle] = useState('');
  const [hybridValue, setHybridValue] = useState('');
  const [hybridSacrifice, setHybridSacrifice] = useState('');
  const [rejectWorldId, setRejectWorldId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const worlds = project.positioningWorlds;
  const contradictions = project.contradictions;
  const selectedWorldId = project.selectedWorldId;

  const handleGenerate = async () => {
    await generatePositioningWorlds();
  };

  const handleCreateHybrid = () => {
    if (!hybridTitle.trim() || !hybridValue.trim() || !hybridSacrifice.trim()) return;
    combinePositioningWorlds(
      hybridTitle.trim(),
      'The Engineering Purist',
      hybridValue.trim(),
      hybridSacrifice.trim()
    );
    setShowHybridModal(false);
    setHybridTitle('');
    setHybridValue('');
    setHybridSacrifice('');
  };

  const handleConfirmReject = () => {
    if (!rejectWorldId || !rejectReason.trim()) return;
    rejectPositioningWorld(rejectWorldId, rejectReason.trim());
    setRejectWorldId(null);
    setRejectReason('');
  };

  return (
    <section className="monolith-card rounded-2xl p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-champagne-400" />
              <span className="text-titanium-shimmer">3. Positioning Worlds & Adversarial Pressure</span>
            </h2>
            {worlds.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-champagne-500/10 text-champagne-300 border border-champagne-500/25 font-mono">
                {worlds.length} Territories Diverged
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real strategy requires explicit sacrifice. Compare 3 high-contrast territories pressure-tested by adversarial evaluators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {worlds.length > 0 && (
            <button
              onClick={() => setShowHybridModal(true)}
              className="px-3 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/[0.08]"
            >
              <Merge className="w-3.5 h-3.5 text-champagne-400" />
              Create Custom Hybrid
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !project.ideaBrief}
            className="btn-monolith-primary px-4 py-1.5 rounded-lg disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {worlds.length > 0 ? 'Regenerate Worlds' : 'Generate Strategic Worlds'}
          </button>
        </div>
      </div>

      {/* Contradiction Alerts Banner */}
      {contradictions.length > 0 && (
        <div className="space-y-2">
          {contradictions.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                alert.severity === 'blocking'
                  ? 'bg-red-950/40 border-red-800/60 text-red-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span>Strategic Contradiction Detected:</span>
                  <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                    {alert.conflictType.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-zinc-300">{alert.exactContradiction}</p>
                <div className="text-[11px] text-zinc-400">
                  <strong className="text-champagne-400">Suggested Fix:</strong> {alert.suggestedResolution}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {worlds.length === 0 ? (
        <div className="bg-obsidian-950/70 border border-dashed border-white/[0.1] rounded-2xl p-8 text-center space-y-3">
          <Flame className="w-8 h-8 text-champagne-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-200">No Positioning Territories Diverged Yet</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Generate 3 high-contrast strategic positioning worlds to compare their archetypes, proof mechanisms, and explicit sacrifices.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !project.ideaBrief}
            className="btn-monolith-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-50 text-xs font-semibold"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingMessage || 'Synthesizing...'}</span>
              </>
            ) : (
              <span>Diverge 3 Positioning Worlds</span>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {worlds.map((world) => {
            const isSelected = selectedWorldId === world.id || world.status === 'selected';
            const isRejected = world.status === 'rejected';

            return (
              <div
                key={world.id}
                className={`rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all duration-300 ${
                  isSelected
                    ? 'monolith-card-gold ring-1 ring-champagne-400/90 shadow-gold-glow'
                    : isRejected
                    ? 'bg-obsidian-950/50 border border-white/[0.04] opacity-50'
                    : 'monolith-card hover:border-champagne-500/40'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/[0.05] pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-champagne-400">
                        {world.archetype}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{world.title}</h3>
                    </div>
                    {isSelected ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Selected
                      </span>
                    ) : isRejected ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40">
                        Rejected
                      </span>
                    ) : null}
                  </div>

                  {/* Value Proposition */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                      Strategic Value Proposition
                    </label>
                    {editingWorldId === world.id ? (
                      <textarea
                        value={world.valueProposition}
                        onChange={(e) => editPositioningWorld(world.id, { valueProposition: e.target.value })}
                        className="w-full bg-obsidian-900 border border-white/[0.1] rounded p-2 text-xs text-white focus:outline-none focus:border-champagne-400"
                        rows={3}
                      />
                    ) : (
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                        {world.valueProposition}
                      </p>
                    )}
                  </div>

                  {/* Core Differentiator */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                      Core Differentiator
                    </label>
                    <p className="text-xs text-champagne-300 font-medium">{world.differentiator}</p>
                  </div>

                  {/* Target Audience & Emotional Territory */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/[0.04]">
                    <div>
                      <span className="text-zinc-500">Target Buyer:</span>
                      <p className="text-zinc-300 mt-0.5 font-medium">{world.targetAudience}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Vibe / Emotion:</span>
                      <p className="text-zinc-300 mt-0.5 font-medium">{world.emotionalTerritory}</p>
                    </div>
                  </div>

                  {/* WHAT WE SACRIFICE CALLOUT (THE STRATEGIC ACID TEST) */}
                  <div className="bg-amber-950/20 border border-amber-700/40 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      The Strategic Sacrifice
                    </div>
                    <div className="text-xs text-amber-100/90 leading-normal">
                      <span className="text-amber-300/70 font-medium">We explicitly give up: </span>
                      {world.tradeoffs.whatWeSacrifice}
                    </div>
                  </div>

                  {/* Adversarial Challenges Drawer */}
                  {world.challenges.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500">
                        Adversarial Pressure-Testing ({world.challenges.length})
                      </span>
                      <div className="space-y-2">
                        {world.challenges.map((c, i) => (
                          <div
                            key={i}
                            className="bg-obsidian-950/80 border border-white/[0.05] rounded-xl p-3 text-[11px] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-champagne-400 font-mono text-[10px] tracking-wide uppercase">
                                {c.evaluatorRole}
                              </span>
                              <Quote className="w-3 h-3 text-champagne-500/40" />
                            </div>
                            <p className="text-zinc-300 leading-normal">{c.perspective}</p>
                            <p className="text-zinc-400 italic bg-obsidian-900/60 p-2 rounded-lg border-l-2 border-champagne-500/60">
                              &ldquo;{c.unforgivingQuestion}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejection Note */}
                  {world.rejectionReason && (
                    <div className="text-[11px] text-red-300 italic p-2.5 bg-red-950/30 border border-red-900/30 rounded-xl">
                      Rejected: {world.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingWorldId(editingWorldId === world.id ? null : world.id)}
                      className="p-1.5 rounded-lg hover:bg-obsidian-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/[0.06]"
                      title="Edit territory"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!isSelected && (
                      <button
                        onClick={() => setRejectWorldId(world.id)}
                        className="p-1.5 rounded-lg hover:bg-red-950 text-zinc-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/30"
                        title="Reject territory"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {!isSelected && (
                    <button
                      onClick={() => selectPositioningWorld(world.id)}
                      className="btn-monolith-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lock Strategy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Hybrid Synthesis Modal */}
      {showHybridModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-white/[0.1]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Merge className="w-4 h-4 text-champagne-400" />
              Synthesize Custom Hybrid Strategy
            </h3>
            <p className="text-xs text-zinc-400">
              Combine elements from multiple worlds into an intentional custom positioning baseline.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-mono">Strategy Name:</label>
                <input
                  type="text"
                  placeholder="e.g. The Quiet Authority"
                  value={hybridTitle}
                  onChange={(e) => setHybridTitle(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-champagne-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono">Synthesized Value Proposition:</label>
                <textarea
                  placeholder="Articulate the core value proposition..."
                  value={hybridValue}
                  onChange={(e) => setHybridValue(e.target.value)}
                  rows={2}
                  className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-champagne-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono">Explicit Strategic Sacrifice:</label>
                <input
                  type="text"
                  placeholder="What will this brand explicitly refuse to do?"
                  value={hybridSacrifice}
                  onChange={(e) => setHybridSacrifice(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-champagne-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowHybridModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateHybrid}
                disabled={!hybridTitle.trim() || !hybridValue.trim() || !hybridSacrifice.trim()}
                className="btn-monolith-primary px-4 py-1.5 text-xs rounded-xl disabled:opacity-50"
              >
                Commit Hybrid Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectWorldId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-white/[0.1]">
            <h3 className="text-base font-bold text-white">Reject Strategic Territory</h3>
            <p className="text-xs text-zinc-400">
              Specify why this positioning world is rejected to record the alternative in the Decision Graph.
            </p>
            <textarea
              placeholder="e.g. Too compliance-heavy; our initial traction must come from bottom-up developers..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-champagne-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectWorldId(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
