'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';

export const PresentationModeModal: React.FC = () => {
  const { isPresentationModeOpen, togglePresentationMode, launchKit, project } = useBrandStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const kit = launchKit || (project.launchKit as typeof launchKit);
  const guidelines = kit?.guidelines;
  const brandName = guidelines?.brandName || project.metadata?.name || 'Kintra';
  const tagline = guidelines?.tagline || 'Deterministic pull request intelligence';

  const slides = [
    { id: 'cover', title: 'Executive Overview' },
    { id: 'strategy', title: 'Strategic Thesis & Sacrifice' },
    { id: 'identity', title: 'Personality & Voice System' },
    { id: 'visual', title: 'Visual & Design Direction' },
    { id: 'dodont', title: 'Do & Don’t Editorial Standards' },
    { id: 'launchkit', title: 'Launch Deliverables' },
    { id: 'audit', title: 'Causal Governance Ledger' },
  ];

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard Navigation: Esc to close, Arrow keys to navigate slides
  useEffect(() => {
    if (!isPresentationModeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePresentationMode(false);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationModeOpen, nextSlide, prevSlide, togglePresentationMode]);

  if (!isPresentationModeOpen) return null;

  const copyContent = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Brand Presentation Mode"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between text-zinc-100 select-none overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-mono text-sm font-bold shadow-inner">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">{brandName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Brand Deck</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Slide {currentSlide + 1} of {totalSlides}: {slides[currentSlide].title}
            </p>
          </div>
        </div>

        {/* Slide Selector Indicators */}
        <div className="hidden md:flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-200 ${
                currentSlide === idx
                  ? 'w-8 bg-indigo-500'
                  : 'w-2 bg-zinc-800 hover:bg-zinc-700'
              }`}
              title={s.title}
              aria-label={`Go to slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Exit Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            Esc to exit · ← → to navigate
          </span>
          <button
            onClick={() => togglePresentationMode(false)}
            aria-label="Close presentation mode"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Slide Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col justify-center overflow-y-auto">
        {/* SLIDE 1: Cover & Elevator Pitch */}
        {currentSlide === 0 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/80 text-xs font-mono text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{guidelines?.positioning.archetype || 'The Engineering Purist'} Archetype</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
                {brandName}
              </h1>
              <p className="text-xl sm:text-2xl text-indigo-300 font-light max-w-3xl mx-auto">
                {tagline}
              </p>
            </div>

            {/* Spoken Pitch Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto text-left space-y-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>30-Second Spoken Pitch</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                  Investor & Partner Ready
                </span>
              </div>
              <blockquote className="text-sm sm:text-base text-zinc-200 italic leading-relaxed">
                {kit?.items.find((i) => i.type === 'elevator_pitch')?.content ||
                  `"We build ${brandName}. As developers use AI to generate more code faster, reviewing pull requests has become the mission-critical bottleneck. Linters are too dumb to catch multi-file semantic bugs, while AI chatbots hallucinate false positives. ${brandName} replaces guesswork with deterministic AST verification in CI runners—giving engineering teams verifiable correctness guarantees before code merges."`}
              </blockquote>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-xs font-mono">
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">Target Audience</span>
                <span className="text-zinc-200 font-semibold">{guidelines?.positioning.targetAudience}</span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">Differentiator</span>
                <span className="text-indigo-300 font-semibold">{guidelines?.positioning.differentiator}</span>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">Proof Mechanism</span>
                <span className="text-emerald-300 font-semibold">{guidelines?.positioning.proofMechanism}</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Strategic Thesis & Sacrifice */}
        {currentSlide === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-bold text-white">Strategic Thesis & The Strategic Sacrifice</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Strategy is fundamentally defined by what a brand chooses NOT to do.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem vs Value Proposition */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-red-400 block mb-1">
                    The Problem Framing
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed bg-red-950/10 border border-red-900/20 p-3 rounded-lg">
                    {guidelines?.positioning.problemFraming}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                    Value Proposition & Thesis
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed bg-emerald-950/10 border border-emerald-900/20 p-3 rounded-lg">
                    {guidelines?.positioning.valueProposition}
                  </p>
                </div>
              </div>

              {/* The Explicit Tradeoff / Sacrifice */}
              <div className="bg-zinc-900/60 border border-indigo-900/40 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
                    <Sliders className="w-4 h-4" />
                    <span>The Real Strategic Sacrifice</span>
                  </div>

                  <div className="p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-lg space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">What We Emphasize:</span>
                      <p className="text-sm font-semibold text-white">
                        Deterministic mathematical proofs, reproducible diff telemetry, and zero code egress.
                      </p>
                    </div>

                    <div className="border-t border-indigo-900/40 pt-2">
                      <span className="text-[10px] font-mono text-red-300 uppercase">What We Explicitly Sacrifice:</span>
                      <p className="text-sm text-zinc-300">
                        Generic conversational AI bots, superficial hype slogans, and consumer commodity workflows.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded border border-zinc-800">
                  <span className="text-emerald-400 font-semibold">Category Framing: </span>
                  <span>{guidelines?.positioning.categoryFraming}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Personality & Voice System */}
        {currentSlide === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-bold text-white">Brand Personality & Tonal Voice System</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Calibrated against senior practitioners who instantly dismiss artificial marketing speech.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guidelines?.personality.traits.map((trait, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-300">{trait.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">Trait 0{i + 1}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{trait.definition}</p>
                  <div className="border-t border-zinc-800 pt-2 text-[11px]">
                    <span className="text-zinc-500 block">Avoids Anti-Pattern:</span>
                    <span className="text-red-400 font-mono">{trait.avoid}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Voice & Vocabulary */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono text-zinc-400 uppercase">Tonal Register:</span>
                <span className="text-xs font-mono text-indigo-300 font-semibold">{guidelines?.voice.tonalRegister}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase block mb-1.5">
                    ✓ Preferred Technical Vocabulary:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guidelines?.voice.vocabularyRules.preferredWords.map((w, idx) => (
                      <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-900/40">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-red-400 uppercase block mb-1.5">
                    ✕ Strictly Banned Marketing Buzzwords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guidelines?.voice.vocabularyRules.forbiddenWords.map((w, idx) => (
                      <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/30 text-red-300 border border-red-900/40 line-through">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Visual & Design Direction */}
        {currentSlide === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-bold text-white">Visual Identity & Design Direction</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Obsidian terminal foundation with high-contrast diagnostic indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Color Palette */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Core Color Hierarchy
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-zinc-800">
                    <div
                      className="w-8 h-8 rounded border border-zinc-700 shrink-0"
                      style={{ backgroundColor: guidelines?.visualDirection.primaryColor }}
                    />
                    <div>
                      <span className="text-xs font-semibold block text-white">Dominant Base</span>
                      <span className="text-[10px] font-mono text-zinc-400">{guidelines?.visualDirection.primaryColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-zinc-800">
                    <div
                      className="w-8 h-8 rounded border border-zinc-700 shrink-0"
                      style={{ backgroundColor: guidelines?.visualDirection.secondaryColor }}
                    />
                    <div>
                      <span className="text-xs font-semibold block text-white">Brand Indigo</span>
                      <span className="text-[10px] font-mono text-zinc-400">{guidelines?.visualDirection.secondaryColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-zinc-800">
                    <div
                      className="w-8 h-8 rounded border border-zinc-700 shrink-0"
                      style={{ backgroundColor: guidelines?.visualDirection.accentColor }}
                    />
                    <div>
                      <span className="text-xs font-semibold block text-white">Invariant Emerald</span>
                      <span className="text-[10px] font-mono text-zinc-400">{guidelines?.visualDirection.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Typography Pairing
                </span>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Display / Heading</span>
                    <p className="text-base font-bold text-white tracking-tight">
                      {guidelines?.visualDirection.typographyPairing.headingFont}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Body Reading</span>
                    <p className="text-sm text-zinc-300">
                      {guidelines?.visualDirection.typographyPairing.bodyFont}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Code & Telemetry</span>
                    <p className="text-sm font-mono text-emerald-400">
                      {guidelines?.visualDirection.typographyPairing.monoFont}
                    </p>
                  </div>
                </div>
              </div>

              {/* Naming & Mark Rules */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                  Brand Name & Mark
                </span>
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white tracking-wide">{guidelines?.naming.approvedName}</span>
                    <span className="text-xs font-mono text-indigo-400">{guidelines?.naming.pronunciation}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {guidelines?.naming.semanticRationale}
                  </p>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                  <span className="text-zinc-500 block mb-1">Corner Radius:</span>
                  <span className="text-zinc-200">{guidelines?.visualDirection.uiCornerRadius}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Do & Don't Standards */}
        {currentSlide === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-bold text-white">Editorial Do and Don’t Matrix</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Concrete guardrails enforcing practitioner authenticity across all public touchpoints.
              </p>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {guidelines?.doAndDontExamples.map((ex, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                      {ex.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 italic">{ex.explanation}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                      <span className="font-mono text-emerald-400 font-bold block mb-1">✓ DO (Aligned):</span>
                      &quot;{ex.doExample}&quot;
                    </div>

                    <div className="p-2.5 rounded bg-red-950/20 border border-red-900/40 text-red-200">
                      <span className="font-mono text-red-400 font-bold block mb-1">✕ DON’T (Banned Cliché):</span>
                      &quot;{ex.dontExample}&quot;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 6: Launch Deliverables Showcase */}
        {currentSlide === 5 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-bold text-white">Generated Launch Deliverables</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                8 canonical launch deliverables grounded in the KINTRA Decision Graph.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {kit?.items.slice(0, 4).map((item, idx) => (
                <div key={item.id} className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{item.title}</span>
                      <button
                        onClick={() => copyContent(item.content, idx)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-850 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {item.content}
                    </pre>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-850">
                    <span>{item.targetAudience}</span>
                    <span className="text-indigo-400">{item.suggestedChannels[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 7: Causal Governance Ledger */}
        {currentSlide === 6 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/80 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/50">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Deterministic Brand Governance
              </h2>
              <p className="text-sm text-zinc-400 font-mono">
                Every deliverable is cryptographically linked to empirical evidence and approved decisions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Governance</span>
                <span className="text-xl font-bold text-white">100%</span>
                <span className="text-[10px] text-emerald-400 block">Guardian Passed</span>
              </div>
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Decision Nodes</span>
                <span className="text-xl font-bold text-indigo-400">
                  {Object.keys(project.decisionGraph?.nodes || {}).length || 5}
                </span>
                <span className="text-[10px] text-zinc-400 block">Locked Invariants</span>
              </div>
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Empirical Sources</span>
                <span className="text-xl font-bold text-white">
                  {project.marketLandscape?.evidenceRecords.length || 4}
                </span>
                <span className="text-[10px] text-zinc-400 block">Evidence Records</span>
              </div>
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Version</span>
                <span className="text-xl font-bold text-emerald-400">
                  v{project.metadata?.version || 1}.0
                </span>
                <span className="text-[10px] text-zinc-400 block">Snapshot Validated</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 text-left space-y-1">
              <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Verification Audit Fingerprint:</span>
              </div>
              <p className="text-[11px] text-zinc-500 break-all">
                governed_by: kintra_decision_graph_v1.0 | world: {guidelines?.positioning.archetype} | verified: true | zero_hallucination_guarantee
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Controls */}
      <footer className="px-8 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        <div className="text-xs font-mono text-zinc-500">
          Slide {currentSlide + 1} of {totalSlides}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/30 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
