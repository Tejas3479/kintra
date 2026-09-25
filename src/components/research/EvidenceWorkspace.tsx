'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Compass,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  SlidersHorizontal,
  Flame,
  Zap,
} from 'lucide-react';

export const EvidenceWorkspace: React.FC = () => {
  const {
    project,
    isLoading,
    loadingMessage,
    runMarketResearch,
    addManualCompetitor,
    removeEvidenceRecord,
  } = useBrandStore();

  const [customQuery, setCustomQuery] = useState('');
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compPositioning, setCompPositioning] = useState('');
  const [compAudience, setCompAudience] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const landscape = project.marketLandscape;

  const handleSearch = async () => {
    await runMarketResearch(customQuery.trim() || undefined);
    setCustomQuery('');
  };

  const handleAddCompetitor = () => {
    if (!compName.trim()) return;
    addManualCompetitor(
      compName.trim(),
      compPositioning.trim() || 'Unknown claimed value',
      compAudience.trim() || 'General market'
    );
    setShowAddCompModal(false);
    setCompName('');
    setCompPositioning('');
    setCompAudience('');
  };

  const filteredEvidence =
    landscape?.evidenceRecords.filter((rec) => {
      if (categoryFilter === 'all') return true;
      return rec.pageType === categoryFilter;
    }) || [];

  return (
    <section className="monolith-card rounded-2xl p-6 sm:p-8 space-y-8">
      {/* Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-champagne-400" />
              <span className="text-titanium-shimmer">2. Evidence Ledger & Market Grounding</span>
            </h2>
            {landscape && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono">
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
              aria-label="Search category landscape"
              type="text"
              placeholder="Search category landscape..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="bg-obsidian-950 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-champagne-400 w-52 sm:w-64"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="btn-monolith-primary px-3.5 py-1.5 rounded-xl disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {landscape ? 'Re-scan' : 'Scan Market'}
          </button>
        </div>
      </div>

      {!landscape ? (
        <div className="bg-obsidian-950/70 border border-dashed border-white/[0.1] rounded-2xl p-8 text-center space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No Market Evidence Gathered Yet</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Scan the competitive landscape to extract verified claims, category defaults, and strategic friction points from actual market sources.
          </p>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="btn-monolith-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
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
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Competitor Positioning Teardowns ({landscape.competitors.length})
              </h3>
              <button
                onClick={() => setShowAddCompModal(true)}
                className="text-xs text-champagne-400 hover:text-champagne-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Competitor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landscape.competitors.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-3 hover:border-champagne-500/30 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="font-bold text-base text-white">{comp.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {(comp.sourceIds || []).length} Sources Grounded
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-zinc-500 font-mono text-[10px]">Claimed Value Proposition:</span>
                    <p className="text-zinc-200 font-medium">{comp.claimedPositioning}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="space-y-1">
                      <span className="text-emerald-400 font-medium font-mono text-[10px]">Strengths:</span>
                      <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                        {(comp.strengths || []).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <span className="text-rose-400 font-medium font-mono text-[10px]">Vulnerabilities:</span>
                      <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                        {(comp.weaknesses || []).map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STRATEGIC FRICTION POINTS                                                */}
          {/* ========================================================================= */}
          {landscape.conflicts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Category Friction & Contradictions ({landscape.conflicts.length})
              </h3>

              <div className="space-y-3">
                {landscape.conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="bg-obsidian-950/80 border border-amber-500/20 rounded-xl p-4 space-y-3"
                  >
                    <span className="text-xs font-semibold text-zinc-200 font-mono">
                      Friction: {conflict.topic}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-obsidian-900 border border-white/[0.05] space-y-1">
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                          Perspective A: {conflict.claimA.sourceTitle}
                        </div>
                        <p className="text-zinc-300 italic">&ldquo;{conflict.claimA.statement}&rdquo;</p>
                      </div>

                      <div className="p-3 rounded-lg bg-obsidian-900 border border-white/[0.05] space-y-1">
                        <div className="text-[10px] font-bold text-champagne-300 uppercase tracking-wider font-mono">
                          Perspective B: {conflict.claimB.sourceTitle}
                        </div>
                        <p className="text-zinc-300 italic">&ldquo;{conflict.claimB.statement}&rdquo;</p>
                      </div>
                    </div>

                    <div className="bg-champagne-500/10 border border-champagne-500/25 rounded-lg p-2.5 text-xs text-champagne-200 flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-champagne-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-champagne-300 font-mono text-[10px]">Strategic Angle for Founder: </span>
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
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
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
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all capitalize font-mono ${
                      categoryFilter === cat
                        ? 'btn-monolith-primary text-obsidian-950 font-bold'
                        : 'bg-obsidian-950 text-zinc-400 border-white/[0.06] hover:bg-obsidian-900'
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
                  className="bg-obsidian-950/80 border border-white/[0.05] rounded-xl p-4 space-y-2.5 text-xs hover:border-champagne-500/25 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{record.title}</span>
                      {record.url && (
                        <a
                          href={record.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-champagne-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-obsidian-900 text-zinc-400 font-mono border border-white/[0.05]">
                        {record.publisher}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-obsidian-900 text-champagne-400 capitalize font-mono border border-white/[0.05]">
                        {record.pageType.replace('_', ' ')}
                      </span>
                      <span className="text-zinc-500 font-mono">
                        Confidence: {Math.round(record.confidence * 100)}%
                      </span>
                      <button
                        onClick={() => removeEvidenceRecord(record.id)}
                        className="text-zinc-600 hover:text-red-400 p-0.5 transition-colors"
                        title="Dismiss evidence"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Claim and Excerpt */}
                  <div>
                    <span className="text-zinc-500 font-mono text-[10px]">Extracted Claim: </span>
                    <span className="text-zinc-200 font-medium">{record.extractedClaim}</span>
                  </div>

                  <div className="bg-obsidian-900/90 border border-white/[0.05] rounded-lg p-2.5 text-zinc-300 italic text-[11px] leading-relaxed">
                    &ldquo;{record.supportingExcerpt}&rdquo;
                  </div>

                  {/* Stated Limitations: Crucial to avoid fake truth */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1 font-mono">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
            <div className="bg-obsidian-950/80 border border-white/[0.05] rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                Category Clichés to Avoid
              </span>
              <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                {landscape.categoryDefaults.map((def, i) => (
                  <li key={i}>{def}</li>
                ))}
              </ul>
            </div>

            <div className="bg-obsidian-950/80 border border-white/[0.05] rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-white/[0.1]">
            <h3 className="text-base font-bold text-white">Add Known Competitor</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-mono">Competitor / Tool Name:</label>
                <input
                  aria-label="Competitor or tool name"
                  type="text"
                  placeholder="e.g. Snyk, Dependabot, SonarQube"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-champagne-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono">Their Claimed Positioning:</label>
                <input
                  aria-label="Competitor claimed positioning"
                  type="text"
                  placeholder="e.g. Developer-first security scanner"
                  value={compPositioning}
                  onChange={(e) => setCompPositioning(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-champagne-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono">Target Audience:</label>
                <input
                  aria-label="Competitor target audience"
                  type="text"
                  placeholder="e.g. Enterprise CISOs or Solo Devs"
                  value={compAudience}
                  onChange={(e) => setCompAudience(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-champagne-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddCompModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={!compName.trim()}
                className="btn-monolith-primary px-4 py-1.5 text-xs rounded-xl disabled:opacity-50"
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
