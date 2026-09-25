'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Rocket,
  BookOpen,
  Download,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileText,
  FileCode,
  Terminal,
  AlertCircle,
  X,
} from 'lucide-react';

export const LaunchKitWorkspace: React.FC = () => {
  const {
    project,
    selectedLaunchItemId,
    generateLaunchKit,
    selectLaunchItem,
    exportLaunchKit,
    clearExport,
    togglePresentationMode,
    isLoading,
    loadingMessage,
    error,
    clearError,
    exportContent,
  } = useBrandStore();

  const [activeTab, setActiveTab] = useState<'deliverables' | 'guidelines'>('deliverables');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  const kit = project.launchKit;
  const selectedItem =
    kit?.items.find((item) => item.id === selectedLaunchItemId) || kit?.items[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadExport = () => {
    if (!exportContent) return;
    const blob = new Blob([exportContent.content], {
      type: exportContent.format === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.metadata.slug}-brand-${exportContent.format}.${
      exportContent.format === 'json' ? 'json' : 'md'
    }`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    if (!exportContent) return;
    navigator.clipboard.writeText(exportContent.content);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <section
      id="launch-kit-workspace"
      aria-label="Launch Kit and Brand Guidelines"
      className="monolith-card rounded-2xl p-6 sm:p-8 space-y-6 relative"
    >
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne-400 bg-champagne-500/10 px-2.5 py-0.5 rounded border border-champagne-500/25 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-champagne-400" />
              <span>Stage 7: Practical Output Layer</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Decision Graph Governed</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            <span className="text-titanium-shimmer">Launch Kit & Brand Guidelines</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Autonomous synthesis of 8 practical go-to-market launch assets and a concise, usable brand book with zero generic marketing fluff.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => generateLaunchKit()}
            disabled={isLoading}
            className="btn-monolith-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{kit ? 'Regenerate Kit' : 'Synthesize Launch Kit'}</span>
          </button>

          <button
            onClick={() => togglePresentationMode(true)}
            className="px-3.5 py-2 bg-obsidian-900 hover:bg-obsidian-850 text-zinc-200 border border-white/[0.08] hover:border-champagne-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Open distraction-free presentation deck for judges and team"
          >
            <Eye className="w-3.5 h-3.5 text-champagne-400" />
            <span>Presentation Mode</span>
          </button>

          <button
            onClick={() => exportLaunchKit('markdown')}
            disabled={!kit}
            className="px-3 py-2 bg-obsidian-900 hover:bg-obsidian-800 disabled:opacity-40 text-zinc-300 border border-white/[0.06] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export Brand Book as Markdown (.md)"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export .md</span>
          </button>

          <button
            onClick={() => exportLaunchKit('json')}
            disabled={!kit}
            className="px-3 py-2 bg-obsidian-900 hover:bg-obsidian-800 disabled:opacity-40 text-zinc-300 border border-white/[0.06] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export Complete Brand State & Launch Kit as JSON (.json)"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Export .json</span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={!kit}
            className="p-2 bg-obsidian-900 hover:bg-obsidian-800 disabled:opacity-40 text-zinc-400 hover:text-zinc-200 border border-white/[0.06] rounded-xl text-xs transition-colors"
            title="Print or Save Brand Book as PDF"
            aria-label="Print Brand Book"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-200 font-mono text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="bg-champagne-500/10 border border-champagne-500/25 rounded-2xl p-6 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-champagne-400 animate-spin mx-auto" />
          <h4 className="text-sm font-semibold text-zinc-200 font-mono">
            {loadingMessage || 'Synthesizing Launch Kit & Brand Guidelines...'}
          </h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Resolving canonical Decision Graph nodes, extracting personality guardrails, and compiling 8 production deliverables.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      {!kit && !isLoading ? (
        /* Empty State */
        <div className="bg-obsidian-950/70 border border-dashed border-white/[0.08] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-champagne-500/10 border border-champagne-500/25 flex items-center justify-center mx-auto text-champagne-400">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No Launch Kit Generated Yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Synthesize 8 production-ready launch deliverables (homepage hero, launch post, email cadence, spoken elevator pitch) and a concise brand book directly from your approved strategy.
            </p>
          </div>
          <button
            onClick={() => generateLaunchKit()}
            className="btn-monolith-primary px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            Generate Complete Launch Kit
          </button>
        </div>
      ) : (
        kit && (
          <div className="space-y-6">
            {/* View Tabs */}
            <div className="flex border-b border-white/[0.06]">
              <button
                onClick={() => setActiveTab('deliverables')}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'deliverables'
                    ? 'border-champagne-400 text-champagne-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Launch Deliverables ({kit.items.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('guidelines')}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'guidelines'
                    ? 'border-champagne-400 text-champagne-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Brand Guidelines (Brand Book)</span>
              </button>
            </div>

            {/* TAB 1: LAUNCH DELIVERABLES (8 ARTIFACTS) */}
            {activeTab === 'deliverables' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Artifact Item List */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                    8 Core Launch Deliverables
                  </span>
                  <div className="space-y-1.5">
                    {kit.items.map((item, idx) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => selectLaunchItem(item.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'monolith-card-gold ring-1 ring-champagne-400/80 text-white shadow-sm'
                              : 'bg-obsidian-950/70 border-white/[0.05] text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-900/80'
                          }`}
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-zinc-500">
                                0{idx + 1}
                              </span>
                              <span className="text-xs font-medium truncate">{item.title}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 truncate block font-mono">
                              {item.suggestedChannels[0]}
                            </span>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isSelected ? 'text-champagne-400 translate-x-0.5' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Artifact Preview & Lineage */}
                <div className="lg:col-span-8 space-y-4">
                  {selectedItem && (
                    <div className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-4">
                      {/* Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.05] gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{selectedItem.title}</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-900 border border-white/[0.06] text-champagne-400">
                              {selectedItem.type}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{selectedItem.summary}</p>
                        </div>

                        <button
                          onClick={() => handleCopy(selectedItem.content, selectedItem.id)}
                          className="self-start sm:self-auto px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-850 text-zinc-200 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0 border border-white/[0.06]"
                        >
                          {copiedId === selectedItem.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-champagne-400" />
                          )}
                          <span>{copiedId === selectedItem.id ? 'Copied' : 'Copy Deliverable'}</span>
                        </button>
                      </div>

                      {/* Content Box */}
                      <div className="relative">
                        <pre className="w-full bg-obsidian-900 p-4 rounded-xl border border-white/[0.06] text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                          {selectedItem.content}
                        </pre>
                      </div>

                      {/* Channels & Persona */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="bg-obsidian-900/60 p-3 rounded-xl border border-white/[0.04]">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                            Target Audience Calibration
                          </span>
                          <span className="text-zinc-300 font-medium">
                            {selectedItem.targetAudience}
                          </span>
                        </div>

                        <div className="bg-obsidian-900/60 p-3 rounded-xl border border-white/[0.04]">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                            Recommended Channels
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedItem.suggestedChannels.map((c, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-obsidian-950 text-champagne-300 border border-white/[0.05]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Causal Lineage Stamp */}
                      <div className="p-3 bg-obsidian-900/80 rounded-xl border border-white/[0.05] text-[11px] font-mono text-zinc-400 space-y-1">
                        <div className="flex items-center justify-between text-zinc-300 font-semibold">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Causal Lineage Verification</span>
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(selectedItem.lineage.generatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <span>
                            World:{' '}
                            <span className="text-champagne-300">
                              {selectedItem.lineage.worldArchetype}
                            </span>
                          </span>
                          <span>
                            Governing Decisions:{' '}
                            <span className="text-emerald-300">
                              {selectedItem.lineage.governingDecisionIds.length} nodes
                            </span>
                          </span>
                          <span>
                            Grounding Evidence:{' '}
                            <span className="text-amber-300">
                              {selectedItem.lineage.evidenceIds.length} sources
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: BRAND GUIDELINES (BRAND BOOK) */}
            {activeTab === 'guidelines' && (
              <div className="space-y-6">
                {/* 1. Positioning */}
                <div className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-champagne-400" />
                      <span>1. Strategic Positioning Thesis</span>
                    </h3>
                    <span className="text-xs font-mono text-champagne-300">
                      {kit.guidelines.positioning.archetype}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        Problem Framing
                      </span>
                      <p className="text-zinc-300 bg-obsidian-900 p-2.5 rounded-lg border border-white/[0.04]">
                        {kit.guidelines.positioning.problemFraming}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        Value Proposition
                      </span>
                      <p className="text-zinc-300 bg-obsidian-900 p-2.5 rounded-lg border border-white/[0.04]">
                        {kit.guidelines.positioning.valueProposition}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-obsidian-900 rounded-lg border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Category Frame
                      </span>
                      <span className="text-white font-medium">
                        {kit.guidelines.positioning.categoryFraming}
                      </span>
                    </div>

                    <div className="p-2.5 bg-obsidian-900 rounded-lg border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Core Differentiator
                      </span>
                      <span className="text-champagne-300 font-medium">
                        {kit.guidelines.positioning.differentiator}
                      </span>
                    </div>

                    <div className="p-2.5 bg-obsidian-900 rounded-lg border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        AST Proof Mechanism
                      </span>
                      <span className="text-emerald-300 font-medium">
                        {kit.guidelines.positioning.proofMechanism}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Personality & Voice */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personality Traits */}
                  <div className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white border-b border-white/[0.05] pb-2 font-mono">
                      2. Personality Traits
                    </h3>
                    <div className="space-y-2">
                      {kit.guidelines.personality.traits.map((trait, i) => (
                        <div key={i} className="p-3 bg-obsidian-900 rounded-lg border border-white/[0.04] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-champagne-300">{trait.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500">Trait 0{i + 1}</span>
                          </div>
                          <p className="text-xs text-zinc-300">{trait.definition}</p>
                          <div className="text-[10px] text-zinc-500 pt-1">
                            <span className="text-red-400 font-mono">Avoids:</span> {trait.avoid}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voice Rules & Banned Words */}
                  <div className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white border-b border-white/[0.05] pb-2 font-mono">
                      3. Voice & Vocabulary Rules
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                          Tonal Register
                        </span>
                        <p className="text-xs font-mono text-champagne-300 bg-obsidian-900 p-2 rounded-lg border border-white/[0.04]">
                          {kit.guidelines.voice.tonalRegister}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">
                          Preferred Vocabulary (Use Freely)
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {kit.guidelines.voice.vocabularyRules.preferredWords.map((w, i) => (
                            <span
                              key={i}
                              className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-900/40"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-red-400 uppercase block mb-1">
                          Forbidden Banned Buzzwords (Never Use)
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {kit.guidelines.voice.vocabularyRules.forbiddenWords.map((w, i) => (
                            <span
                              key={i}
                              className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/30 text-red-300 border border-red-900/40 line-through"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Visual Identity */}
                <div className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-white/[0.05] pb-2 font-mono">
                    4. Visual Identity & Typography Tokens
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Palette */}
                    <div className="p-3 bg-obsidian-900 rounded-lg border border-white/[0.04] space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                        Palette
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-white/20"
                          style={{ backgroundColor: kit.guidelines.visualDirection.primaryColor }}
                          title="Primary Dominant"
                        />
                        <div
                          className="w-6 h-6 rounded border border-white/20"
                          style={{ backgroundColor: kit.guidelines.visualDirection.secondaryColor }}
                          title="Secondary Brand"
                        />
                        <div
                          className="w-6 h-6 rounded border border-white/20"
                          style={{ backgroundColor: kit.guidelines.visualDirection.accentColor }}
                          title="Accent Invariant"
                        />
                        <span className="text-xs font-mono text-zinc-400">
                          {kit.guidelines.visualDirection.primaryColor}
                        </span>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="p-3 bg-obsidian-900 rounded-lg border border-white/[0.04] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                        Type Pairing
                      </span>
                      <p className="text-xs text-zinc-300">
                        <span className="text-zinc-500 font-mono text-[10px]">Display:</span>{' '}
                        {kit.guidelines.visualDirection.typographyPairing.headingFont}
                      </p>
                      <p className="text-xs text-zinc-300">
                        <span className="text-zinc-500 font-mono text-[10px]">Body:</span>{' '}
                        {kit.guidelines.visualDirection.typographyPairing.bodyFont}
                      </p>
                      <p className="text-xs text-emerald-400 font-mono">
                        <span className="text-zinc-500 font-mono text-[10px]">Code:</span>{' '}
                        {kit.guidelines.visualDirection.typographyPairing.monoFont}
                      </p>
                    </div>

                    {/* Shapes */}
                    <div className="p-3 bg-obsidian-900 rounded-lg border border-white/[0.04] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                        UI Shape & Corner Radius
                      </span>
                      <p className="text-xs font-mono text-champagne-300">
                        {kit.guidelines.visualDirection.uiCornerRadius}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {kit.guidelines.visualDirection.logoRules}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Do & Don't Matrix */}
                <div className="bg-obsidian-950/80 border border-white/[0.06] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white border-b border-white/[0.05] pb-2 font-mono">
                    5. Editorial Do and Don’t Matrix
                  </h3>
                  <div className="space-y-3">
                    {kit.guidelines.doAndDontExamples.map((ex, i) => (
                      <div key={i} className="p-3 bg-obsidian-900 rounded-lg border border-white/[0.04] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-champagne-400 font-bold uppercase">
                            {ex.category}
                          </span>
                          <span className="text-[10px] text-zinc-500 italic">{ex.explanation}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                            <span className="font-mono text-emerald-400 block mb-0.5">✓ DO:</span>
                            &quot;{ex.doExample}&quot;
                          </div>
                          <div className="p-2 rounded bg-red-950/20 border border-red-900/40 text-red-200">
                            <span className="font-mono text-red-400 block mb-0.5">✕ DON’T:</span>
                            &quot;{ex.dontExample}&quot;
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Export File Drawer / Modal */}
      {exportContent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export Brand Artifact"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="monolith-card rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-white/[0.1]">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-obsidian-900/60">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-champagne-400" />
                <h3 className="text-sm font-semibold text-white">
                  Export Brand Book ({exportContent.format.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={clearExport}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-obsidian-800"
                aria-label="Close export dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <pre className="text-xs font-mono text-zinc-300 bg-obsidian-950 p-4 rounded-xl border border-white/[0.06] whitespace-pre-wrap leading-relaxed">
                {exportContent.content}
              </pre>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between bg-obsidian-900/60">
              <span className="text-xs font-mono text-zinc-500">
                {exportContent.content.length} characters
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyExport}
                  className="px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-800 text-zinc-200 rounded-lg text-xs font-mono flex items-center gap-1.5 border border-white/[0.06]"
                >
                  {copiedExport ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-champagne-400" />
                  )}
                  <span>{copiedExport ? 'Copied' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleDownloadExport}
                  className="btn-monolith-primary px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .{exportContent.format === 'markdown' ? 'md' : 'json'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
