'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { VisualDecisionGraph } from './VisualDecisionGraph';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  Sparkles,
  ExternalLink,
  Edit3,
  Save,
  X,
} from 'lucide-react';

export const DecisionLedger: React.FC = () => {
  const { project, editDecision } = useBrandStore();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editRationale, setEditRationale] = useState('');
  const [editTradeoff, setEditTradeoff] = useState('');

  const nodes = Object.values(project.decisionGraph.nodes);
  const edges = project.decisionGraph.edges;

  if (nodes.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Interactive Visual DAG */}
      <VisualDecisionGraph />

      {/* Decision Detail Ledger */}
      <div className="monolith-card rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-champagne-400" />
                <span className="text-titanium-shimmer">Strategic Decision Ledger</span>
                <span className="text-sm font-normal text-zinc-400">({nodes.length} Committed)</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-champagne-500/10 text-champagne-400 border border-champagne-500/25 font-mono">
                Immutable Trace
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Every strategic decision records its rationale, grounded evidence, rejected alternatives, and downstream dependencies.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="px-2 py-1 rounded bg-obsidian-900 border border-white/[0.06]">{edges.length} Causal Edges</span>
            <span>•</span>
            <span className="px-2 py-1 rounded bg-obsidian-900 border border-white/[0.06]">v{project.metadata.version}</span>
          </div>
        </div>

        {/* Nodes List */}
        <div className="space-y-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="bg-obsidian-900/90 border border-white/[0.06] rounded-xl p-5 space-y-4 text-xs hover:border-champagne-500/30 transition-all shadow-md"
            >
              {/* Top Bar: Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-champagne-400 animate-pulse" />
                  <span className="font-bold text-sm text-white">{node.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-obsidian-800 border border-white/[0.06] text-zinc-300">
                    {node.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Founder
                  </span>
                  {node.approvedAt && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {new Date(node.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {editingNodeId !== node.id ? (
                    <button
                      onClick={() => {
                        setEditingNodeId(node.id);
                        setEditValue(node.approvedValue);
                        setEditRationale(node.rationale);
                        setEditTradeoff(node.tradeoff);
                      }}
                      className="px-2 py-1 rounded hover:bg-obsidian-800 text-zinc-400 hover:text-champagne-300 border border-transparent hover:border-white/[0.08] transition-colors flex items-center gap-1 text-[11px]"
                      title="Edit Decision"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingNodeId(null)}
                      className="p-1 rounded hover:bg-obsidian-800 text-zinc-400 hover:text-white transition-colors"
                      title="Cancel Edit"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Core Decision Value */}
              {editingNodeId === node.id ? (
                <div className="space-y-3 bg-obsidian-950 border border-champagne-500/50 p-4 rounded-xl">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-champagne-400">
                      Edit Decision Value:
                    </label>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full bg-obsidian-900 border border-white/[0.1] rounded p-2 text-xs text-white mt-1 focus:border-champagne-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400">
                        Edit Strategic Rationale (Why):
                      </label>
                      <textarea
                        value={editRationale}
                        onChange={(e) => setEditRationale(e.target.value)}
                        rows={2}
                        className="w-full bg-obsidian-900 border border-white/[0.1] rounded p-2 text-xs text-white mt-1 focus:border-champagne-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400">
                        Edit Explicit Tradeoff (Sacrifice):
                      </label>
                      <textarea
                        value={editTradeoff}
                        onChange={(e) => setEditTradeoff(e.target.value)}
                        rows={2}
                        className="w-full bg-obsidian-900 border border-white/[0.1] rounded p-2 text-xs text-white mt-1 focus:border-champagne-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingNodeId(null)}
                      className="px-3 py-1 rounded bg-obsidian-800 text-zinc-300 text-xs hover:bg-obsidian-700 border border-white/[0.06]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        editDecision(node.id, {
                          approvedValue: editValue.trim() || node.approvedValue,
                          rationale: editRationale.trim() || node.rationale,
                          tradeoff: editTradeoff.trim() || node.tradeoff,
                        });
                        setEditingNodeId(null);
                      }}
                      className="btn-monolith-primary px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Save & Bump Version
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-champagne-500/80 tracking-wider">
                      The Committed Decision:
                    </span>
                    <p className="text-sm font-semibold text-zinc-100 bg-obsidian-950/80 p-3.5 rounded-lg border border-white/[0.05]">
                      &ldquo;{node.approvedValue}&rdquo;
                    </p>
                  </div>

                  {/* WHY & TRADEOFF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* WHY */}
                    <div className="bg-obsidian-950/60 border border-white/[0.05] rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-bold text-champagne-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-champagne-400" />
                        ✨ AI Strategic Rationale:
                      </span>
                      <p className="text-zinc-300 leading-normal">{node.rationale}</p>
                    </div>

                    {/* TRADEOFF */}
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                        <Scale className="w-3.5 h-3.5" />
                        Explicit Tradeoff (Sacrifice):
                      </span>
                      <p className="text-amber-200/90 leading-normal">{node.tradeoff}</p>
                    </div>
                  </div>
                </>
              )}

              {/* REJECTED ALTERNATIVES */}
              {node.rejectedAlternatives.length > 0 && (
                <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Alternatives Considered & Rejected ({node.rejectedAlternatives.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {node.rejectedAlternatives.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2 rounded bg-obsidian-950/60 border border-white/[0.04] text-[11px] space-y-0.5"
                      >
                        <div className="font-semibold text-zinc-400 line-through">{alt.title}</div>
                        <div className="text-zinc-500 text-[10px]">{alt.whyRejected}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DEPENDENCY RELATIONS */}
              <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-[10px]">Depends on:</span>
                  {node.dependsOn.map((dep, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-obsidian-800 text-champagne-300 font-mono text-[10px] border border-white/[0.05]">
                      {dep}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-champagne-400/90">
                  <span className="text-zinc-500 font-mono text-[10px]">Governs downstream:</span>
                  <ArrowRight className="w-3 h-3 text-champagne-400" />
                  <span className="font-mono text-[10px] text-zinc-300">{node.governs.join(', ')}</span>
                </div>

                {node.evidenceIds.length > 0 && (
                  <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px]">
                    <ExternalLink className="w-3 h-3 text-champagne-400" />
                    <span>{node.evidenceIds.length} Groundings</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
