'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  SlidersHorizontal,
  Compass,
  Zap,
} from 'lucide-react';
import { SourceCategory } from '@/types/research';

export const EvidenceWorkspace: React.FC = () => {
  const { project, isLoading, loadingMessage, runMarketResearch, addManualCompetitor, removeEvidenceRecord } =
    useBrandStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [customQuery, setCustomQuery] = useState('');
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compPositioning, setCompPositioning] = useState('');
  const [compAudience, setCompAudience] = useState('');

  const landscape = project.marketLandscape;

  const handleSearch = async () => {
    const q = customQuery.trim() || project.rawFounderInput || 'Developer code security';
    await runMarketResearch(q);
  };

  const handleAddCompetitor = () => {
    if (!compName.trim()) return;
    addManualCompetitor(compName.trim(), compPositioning.trim() || 'General market incumbent', compAudience.trim());
    setCompName('');
    setCompPositioning('');
    setCompAudience('');
    setShowAddCompModal(false);
  };

  const filteredEvidence =
    landscape?.evidenceRecords.filter((rec) => {
      if (categoryFilter === 'all') return true;
      return rec.sourceCategory === (categoryFilter as SourceCategory);
    }) || [];

  return (
    <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
      {/* Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              2. Evidence Ledger & Market Grounding
            </h2>
            {landscape && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {landscape.evidenceRecords.length} Sources Grounded
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Traceable external evidence, competitor teardowns, and market friction points. No hallucinated citations.
          </p>
        </div>

        {/* Search Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category landscape..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {landscape ? 'Re-scan' : 'Scan Market'}
          </button>
        </div>
      </div>

      {!landscape ? (
        <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-xl p-8 text-center space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No Market Evidence Gathered Yet</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Scan the competitive landscape to extract verified claims, category defaults, and strategic friction points from actual market sources.
          </p>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingMessage || 'Scanning...'}</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Run Grounded Market Scan</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ========================================================================= */}
          {/* COMPETITOR TEARDOWN PROFILES                                              */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Competitor Positioning Teardowns ({landscape.competitors.length})
              </h3>
              <button
                onClick={() => setShowAddCompModal(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Competitor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landscape.competitors.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{comp.name}</span>
                      {comp.url && (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {comp.targetAudience}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300 leading-normal">
                    <span className="text-zinc-500 font-medium">Claimed Positioning: </span>
                    {comp.claimedPositioning}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-zinc-900">
                    <div>
                      <span className="text-emerald-400 font-medium">Observed Strengths:</span>
                      <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-0.5">
                        {comp.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-amber-400 font-medium">Vulnerabilities:</span>
                      <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-0.5">
                        {comp.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Clichés Used by Competitor */}
                  {comp.clichePhrases.length > 0 && (
                    <div className="pt-2 border-t border-zinc-900 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-500">Clichés used:</span>
                      {comp.clichePhrases.map((phrase, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-900/40"
                        >
                          &ldquo;{phrase}&rdquo;
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONFLICTING EVIDENCE CALLOUT (DO NOT COLLAPSE DISAGREEMENT)               */}
          {/* ========================================================================= */}
          {landscape.conflicts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Strategic Market Friction & Disagreement ({landscape.conflicts.length})
              </h3>
              <p className="text-xs text-zinc-400">
                KINTRA detects where sources disagree rather than flattening reality into a false consensus.
              </p>

              <div className="space-y-3">
                {landscape.conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="bg-zinc-950 border border-amber-500/20 rounded-xl p-4 space-y-3"
                  >
                    <span className="text-xs font-semibold text-zinc-200">
                      Friction: {conflict.topic}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          Perspective A: {conflict.claimA.sourceTitle}
                        </div>
                        <p className="text-zinc-300 italic">&ldquo;{conflict.claimA.statement}&rdquo;</p>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
                        <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                          Perspective B: {conflict.claimB.sourceTitle}
                        </div>
                        <p className="text-zinc-300 italic">&ldquo;{conflict.claimB.statement}&rdquo;</p>
                      </div>
                    </div>

                    <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-2.5 text-xs text-indigo-200 flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-indigo-300">Strategic Angle for Founder: </span>
                        {conflict.strategicImplication}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EVIDENCE LEDGER SOURCE ENTRIES                                            */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Traceable Evidence Ledger ({filteredEvidence.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Every claim is paired with exact supporting excerpts and stated limitations.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'primary_competitor', 'customer_voice', 'market_data'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors capitalize ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvidence.map((record) => (
                <div
                  key={record.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{record.title}</span>
                      {record.url && (
                        <a
                          href={record.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">
                        {record.publisher}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-cyan-400 capitalize">
                        {record.pageType.replace('_', ' ')}
                      </span>
                      <span className="text-zinc-500 font-mono">
                        Confidence: {Math.round(record.confidence * 100)}%
                      </span>
                      <button
                        onClick={() => removeEvidenceRecord(record.id)}
                        className="text-zinc-600 hover:text-red-400 p-0.5"
                        title="Dismiss evidence"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Claim and Excerpt */}
                  <div>
                    <span className="text-zinc-500 font-medium">Extracted Claim: </span>
                    <span className="text-zinc-200 font-medium">{record.extractedClaim}</span>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800/80 rounded p-2.5 text-zinc-300 italic text-[11px] leading-relaxed">
                    &ldquo;{record.supportingExcerpt}&rdquo;
                  </div>

                  {/* Stated Limitations: Crucial to avoid fake truth */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1">
                    <ShieldCheck className="w-3 h-3 text-amber-500/70" />
                    <span>
                      <strong className="text-zinc-400">Methodological Limit:</strong> {record.limitations}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CATEGORY DEFAULTS VS DIFFERENTIATOR GAPS                                 */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Category Clichés to Avoid
              </span>
              <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                {landscape.categoryDefaults.map((def, i) => (
                  <li key={i}>{def}</li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Unclaimed Differentiator White Space
              </span>
              <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                {landscape.differentiatorGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Competitor Modal */}
      {showAddCompModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add Known Competitor</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400">Competitor / Tool Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Snyk, Dependabot, SonarQube"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400">Their Claimed Positioning:</label>
                <input
                  type="text"
                  placeholder="e.g. Developer-first security scanner"
                  value={compPositioning}
                  onChange={(e) => setCompPositioning(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400">Target Audience:</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise CISOs or Solo Devs"
                  value={compAudience}
                  onChange={(e) => setCompAudience(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddCompModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={!compName.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Add Competitor
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
