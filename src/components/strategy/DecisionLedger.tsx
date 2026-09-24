'use client';

import React from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Scale,
  ExternalLink,
} from 'lucide-react';

export const DecisionLedger: React.FC = () => {
  const { project } = useBrandStore();

  const nodes = Object.values(project.decisionGraph.nodes);
  const edges = project.decisionGraph.edges;

  if (nodes.length === 0) {
    return null;
  }

  return (
    <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-emerald-400" />
              Decision Ledger & Causal Graph ({nodes.length} Committed)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Immutable Trace
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Every strategic decision records its rationale, grounded evidence, rejected alternatives, and downstream dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>{edges.length} Causal Edges</span>
          <span>•</span>
          <span>v{project.metadata.version}</span>
        </div>
      </div>

      {/* Nodes List */}
      <div className="space-y-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 text-xs"
          >
            {/* Top Bar: Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-sm text-white">{node.title}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {node.category.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-zinc-500">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Founder
                </span>
                {node.approvedAt && (
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3" />
                    {new Date(node.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            {/* Core Decision Value */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                The Committed Decision:
              </span>
              <p className="text-sm font-semibold text-zinc-100 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                &ldquo;{node.approvedValue}&rdquo;
              </p>
            </div>

            {/* WHY & TRADEOFF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* WHY */}
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Strategic Rationale (Why):
                </span>
                <p className="text-zinc-300 leading-normal">{node.rationale}</p>
              </div>

              {/* TRADEOFF */}
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  Explicit Tradeoff (What was sacrificed):
                </span>
                <p className="text-amber-200/90 leading-normal">{node.tradeoff}</p>
              </div>
            </div>

            {/* REJECTED ALTERNATIVES */}
            {node.rejectedAlternatives.length > 0 && (
              <div className="pt-2 border-t border-zinc-900 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Alternatives Considered & Rejected ({node.rejectedAlternatives.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {node.rejectedAlternatives.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2 rounded bg-zinc-900/80 border border-zinc-800/70 text-[11px] space-y-0.5"
                    >
                      <div className="font-semibold text-zinc-300 line-through">{alt.title}</div>
                      <div className="text-zinc-500 text-[10px]">{alt.whyRejected}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEPENDENCY RELATIONS */}
            <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span>Depends on:</span>
                {node.dependsOn.map((dep, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px]">
                    {dep}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-indigo-400">
                <span>Governs downstream:</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-mono text-[10px] text-zinc-300">{node.governs.join(', ')}</span>
              </div>

              {node.evidenceIds.length > 0 && (
                <div className="flex items-center gap-1 text-cyan-400">
                  <ExternalLink className="w-3 h-3" />
                  <span>{node.evidenceIds.length} Evidence Groundings</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
