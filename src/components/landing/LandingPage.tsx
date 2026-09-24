'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Cpu,
  Layers,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Flame,
  Radio,
  BookOpen,
  Compass,
  Search,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Zap,
  Lock,
  Workflow,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface LandingPageProps {
  onEnterStudio: () => void;
  onLoadSample: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onLoadSample,
}) => {
  // Interactive Simulator Tab
  const [activeSimScenario, setActiveSimScenario] = useState<'headline' | 'pitch' | 'support'>('headline');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(true);
  const [activeStageNav, setActiveStageNav] = useState<number>(3);
  const [copiedSim, setCopiedSim] = useState(false);

  // Trigger simulated audit scan
  const runSimulatedAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 900);
  };

  const handleCopySim = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSim(true);
    setTimeout(() => setCopiedSim(false), 2000);
  };

  // Simulator Data Mocking
  const scenarios = {
    headline: {
      title: 'Website Launch Headline',
      context: 'Developer Security Platform • Engineering Purist Archetype',
      genericAi: {
        headline: 'Supercharge your DevSecOps with our next-gen AI-powered synergy platform.',
        tagline: 'The ultimate all-in-one smart solution for modern high-velocity teams.',
        issues: [
          'Violates forbidden word blacklist: "supercharge", "synergy", "all-in-one"',
          'Zero empirical grounding — claims "ultimate" without evidence',
          'Fails chosen archetype: reads like generic marketing copywriter',
        ],
      },
      kintraEngine: {
        headline: 'Zero code merges without cryptographic AST verification.',
        tagline: 'Deterministic pull-request governance for purist engineering teams.',
        proof: 'Grounded in 14 empirical static analysis benchmarks (Source: NIST CVE-2025-019)',
        archetype: 'The Engineering Purist',
        guardianScore: '100% Deterministic Match',
        hash: '0x8f2a...c4e1',
      },
    },
    pitch: {
      title: 'Enterprise Investor & CISO Pitch',
      context: 'Series A Deck • Radical Differentiator vs Snyk / SonarQube',
      genericAi: {
        headline: 'We leverage disruptive neural LLMs to revolutionize cybersecurity for everyone.',
        tagline: 'Effortless automated protection that seamlessly scales with your enterprise.',
        issues: [
          'No strategic sacrifice: claims to be "for everyone" (fatal positioning failure)',
          'Stateless promise: offers "effortless" fix without verifiable proof mechanism',
          'Vague buzzword overload: "disruptive", "revolutionize", "seamlessly"',
        ],
      },
      kintraEngine: {
        headline: 'We reject heuristic scanning. If a security rule cannot be formally proven, we do not alert.',
        tagline: 'Eliminating 99.4% of false-positive alert fatigue for mission-critical infrastructure.',
        proof: 'Empirical benchmark: 0 false alerts across 1.2M lines of Linux kernel commits',
        archetype: 'The Engineering Purist',
        guardianScore: '100% Deterministic Match',
        hash: '0xb34d...7729',
      },
    },
    support: {
      title: 'Customer Crisis & Support Response',
      context: 'High-Severity Pipeline Blocker • Mission-Critical Tone',
      genericAi: {
        headline: 'We are super sorry for any inconvenience caused! Our rockstar devs are looking into it right now :)',
        tagline: 'Thanks a million for your patience while we work our magic!',
        issues: [
          'Tonal dissonance: casual emojis and "rockstar devs" during high-severity blocker',
          'Violates Voice System: "rockstar", "work our magic" breach serious technical register',
          'Zero technical telemetry provided to the affected engineer',
        ],
      },
      kintraEngine: {
        headline: 'Root-cause analysis underway on AST parsing incident #8492. Deterministic rollback available via commit hash.',
        tagline: 'Audit log exported to telemetry stream. Incident review commits in 20 minutes.',
        proof: 'Adheres to Emergency Technical Register: concise, transparent, zero placating fluff',
        archetype: 'The Engineering Purist',
        guardianScore: '100% Deterministic Match',
        hash: '0x71e9...fa02',
      },
    },
  };

  const currentSim = scenarios[activeSimScenario];

  // 7 Stages Data
  const stages = [
    {
      num: 1,
      title: 'Epistemic Discovery',
      badge: 'Fact Extraction',
      description: 'An adaptive interrogation protocol parses messy founder instincts, strictly bifurcating verified empirical facts from unproven hypotheses.',
      metric: 'Zero assumption leakage',
      input: 'Unstructured founder thoughts',
      output: 'Validated IdeaBrief AST',
    },
    {
      num: 2,
      title: 'Market Evidence Matrix',
      badge: 'Empirical Grounding',
      description: 'Crawls and synthesizes live competitor footprints, mapping pricing models, positioning claims, and weaknesses with source confidence ratings.',
      metric: 'Publisher confidence weighting',
      input: 'Live competitor endpoints',
      output: 'Evidence Ledger & Gap Map',
    },
    {
      num: 3,
      title: 'Divergent Positioning Worlds',
      badge: 'Forced Strategic Sacrifices',
      description: 'Generates 3 radically polarized strategic universes. Demands explicit tradeoffs (what you refuse to build) rather than lukewarm consensus.',
      metric: '3 Non-overlapping archetypes',
      input: 'Evidence & IdeaBrief',
      output: 'Chosen Strategic World & DAG',
    },
    {
      num: 4,
      title: 'Creative Identity & Lexicon',
      badge: 'Phonetic Architecture',
      description: 'Synthesizes phonetic brand naming, semantic rationales, vocal register rules, and a strict forbidden-vocabulary blacklist.',
      metric: 'Zero-cliché vocabulary rule',
      input: 'Approved Positioning World',
      output: 'Voice, Mark & Design System',
    },
    {
      num: 5,
      title: 'The Consistency Guardian',
      badge: 'Deterministic Gatekeeper',
      description: 'An immutable AST validation engine that inspects every generated artifact. Calculates mathematical conformity scores and blocks off-brand copy.',
      metric: 'Sub-100ms rule validation',
      input: 'Draft artifact + Brand Ledger',
      output: 'Cryptographic Audit Seal',
    },
    {
      num: 6,
      title: 'Scenario Lab & Stress Testing',
      badge: 'Tri-State Simulation',
      description: 'Simulates 7 real-world execution environments—from launch headlines to support crises—comparing raw LLM copy vs. brand-governed outputs.',
      metric: 'Tri-state visual diffs',
      input: 'Edge-case channels & prompts',
      output: 'Audited Scenario Artifacts',
    },
    {
      num: 7,
      title: 'Launch Kit & Brand Operating System',
      badge: 'Production Deliverables',
      description: 'Exports a comprehensive 8-asset launch repository and an exhaustive Brand Guidelines book in production-ready Markdown and JSON.',
      metric: '1-Click Presentation Mode',
      input: 'All Approved Decisions',
      output: 'Full Brand Guidelines & JSON',
    },
  ];

  return (
    <div className="relative overflow-hidden text-zinc-100 min-h-screen">
      {/* ========================================================================= */}
      {/* ATMOSPHERIC BACKGROUND EFFECTS                                            */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-grid-cyber opacity-70 mask-radial-fade" />
        <div className="absolute inset-0 bg-dot-matrix opacity-25" />

        {/* Ambient Moving Glow Orbs */}
        <div
          className="glow-orb-gold w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 animate-pulse-slow"
          style={{ transform: 'translateX(-50%)' }}
        />
        <div
          className="glow-orb-steel w-[450px] h-[450px] top-[40%] -left-32 animate-float"
        />
        <div
          className="glow-orb-gold w-[550px] h-[550px] top-[65%] -right-40 animate-float-delayed"
        />
        <div
          className="glow-orb-gold w-[700px] h-[700px] bottom-[-200px] left-1/3 opacity-30 blur-[90px]"
        />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-900/90 border border-champagne-500/30 text-champagne-300 text-xs font-mono shadow-gold-glow animate-float">
            <span className="w-2 h-2 rounded-full bg-champagne-400 animate-pulse" />
            <span className="font-semibold text-champagne-200">INKLOOM 2026</span>
            <span className="text-zinc-600">•</span>
            <span>Autonomous Brand Intelligence & Consistency Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            Stop Prompting LLMs.{' '}
            <span className="text-titanium-shimmer block mt-1 sm:mt-2">
              Architect Causal Brand Intelligence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Generic AI generates forgettable, stateless marketing fluff. <strong className="text-zinc-200 font-semibold">KINTRA</strong> compiles your brand like software—binding every position, voice nuance, and launch artifact to empirical evidence and irreversible strategic sacrifices.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterStudio}
              className="w-full sm:w-auto px-8 py-4 rounded-xl btn-monolith-primary text-base font-bold flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Launch Brand Studio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onLoadSample}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-obsidian-900/90 hover:bg-obsidian-850 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-champagne-500/30 transition-all text-base font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-champagne-400" />
              <span>Explore PRGuard Sample Fixture</span>
            </button>
          </div>

          {/* Key Metric Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 text-left">
            <div className="monolith-card rounded-xl p-4 border border-white/[0.06] hover:border-champagne-500/20 transition-all">
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-1.5">
                <span>100%</span>
                <span className="text-xs font-normal text-emerald-400 font-mono">AST</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-1">Causal Lineage Provenance</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Every claim backed by evidence</div>
            </div>

            <div className="monolith-card rounded-xl p-4 border border-white/[0.06] hover:border-champagne-500/20 transition-all">
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-1.5">
                <span>0.0%</span>
                <span className="text-xs font-normal text-champagne-400 font-mono">BANNED</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-1">Cliché Drift Infiltration</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Forbidden buzzword gatekeeper</div>
            </div>

            <div className="monolith-card rounded-xl p-4 border border-white/[0.06] hover:border-champagne-500/20 transition-all">
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-1.5">
                <span>7</span>
                <span className="text-xs font-normal text-zinc-400 font-mono">STAGES</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-1">Governed Operating Workspaces</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Discovery to full Brand Book</div>
            </div>

            <div className="monolith-card rounded-xl p-4 border border-white/[0.06] hover:border-champagne-500/20 transition-all">
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-1.5">
                <span>&lt; 50ms</span>
                <span className="text-xs font-normal text-emerald-400 font-mono">SEAL</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-1">Consistency Guardian Audits</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Deterministic AST verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE TRI-STATE SIMULATION SHOWCASE                                */}
      {/* ========================================================================= */}
      <section className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="monolith-card rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden">
          {/* Subtle radar sweep line */}
          {isAuditing && (
            <div className="absolute inset-0 bg-gradient-to-b from-champagne-500/10 via-transparent to-transparent animate-scanline pointer-events-none" />
          )}

          {/* Showcase Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-white/[0.06] gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-champagne-400 uppercase tracking-wider mb-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Interactive Telemetry Simulator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Observe the Causal Differential in Real Time
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Toggle between real-world scenarios to inspect how KINTRA replaces stateless LLM hallucinations with audited, evidence-grounded copy.
              </p>
            </div>

            {/* Scenario Selector Pills */}
            <div className="flex items-center gap-2 bg-obsidian-950/80 p-1.5 rounded-xl border border-white/[0.08] self-start lg:self-auto">
              {(['headline', 'pitch', 'support'] as const).map((scen) => (
                <button
                  key={scen}
                  onClick={() => {
                    setActiveSimScenario(scen);
                    runSimulatedAudit();
                  }}
                  className={`text-xs px-3.5 py-2 rounded-lg font-mono font-medium transition-all ${
                    activeSimScenario === scen
                      ? 'bg-champagne-500/20 text-champagne-200 border border-champagne-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  {scen === 'headline' && 'Website Headline'}
                  {scen === 'pitch' && 'Enterprise Pitch'}
                  {scen === 'support' && 'Support Crisis'}
                </button>
              ))}
            </div>
          </div>

          {/* Active Scenario Context Banner */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3.5 rounded-lg bg-obsidian-900/60 border border-white/[0.04] text-xs font-mono text-zinc-400">
            <div>
              <span className="text-zinc-500">Scenario Target: </span>
              <span className="text-white font-semibold">{currentSim.title}</span>
              <span className="text-zinc-600 mx-2">•</span>
              <span className="text-zinc-400">{currentSim.context}</span>
            </div>
            <button
              onClick={runSimulatedAudit}
              disabled={isAuditing}
              className="inline-flex items-center gap-1.5 text-champagne-400 hover:text-champagne-300 font-mono text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing AST...' : 'Re-run Guardian Gate'}</span>
            </button>
          </div>

          {/* The Side-by-Side Dual Engine Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Left: Traditional Generative AI (Stateless LLM) */}
            <div className="bg-obsidian-950/80 rounded-2xl p-6 border border-rose-500/20 space-y-4 relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                    Traditional Generative AI
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Stateless Prompting
                </span>
              </div>

              {/* Output Content */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-zinc-500 uppercase">Generated Output:</div>
                <div className="p-4 rounded-xl bg-obsidian-900/70 border border-white/[0.04] font-serif text-sm sm:text-base text-zinc-300 italic leading-relaxed line-through decoration-rose-500/60 decoration-2">
                  &ldquo;{currentSim.genericAi.headline}&rdquo;
                </div>
                <p className="text-xs text-zinc-400 font-mono italic">
                  {currentSim.genericAi.tagline}
                </p>
              </div>

              {/* Detected Failures List */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="text-[11px] font-mono text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Consistency Violations & Hallucinations:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {currentSim.genericAi.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 text-xs font-mono">✕</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: KINTRA Causal Intelligence */}
            <div className="monolith-card-gold rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-champagne-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne-200">
                    KINTRA Causal Intelligence
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Guardian Audited</span>
                  </span>
                </div>
              </div>

              {/* Output Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-champagne-400/80 uppercase">Audited Asset:</span>
                  <span className="text-zinc-500 text-[10px] font-mono">{currentSim.kintraEngine.hash}</span>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-950/80 border border-champagne-500/30 text-sm sm:text-base font-bold text-white leading-relaxed shadow-sm">
                  &ldquo;{currentSim.kintraEngine.headline}&rdquo;
                </div>
                <p className="text-xs text-champagne-300 font-mono">
                  {currentSim.kintraEngine.tagline}
                </p>
              </div>

              {/* Lineage & Telemetry */}
              <div className="space-y-2 pt-2 border-t border-champagne-500/20 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Epistemic Grounding:</span>
                  <span className="text-emerald-300">{currentSim.kintraEngine.guardianScore}</span>
                </div>
                <p className="text-zinc-300 text-[11px] bg-obsidian-950/60 p-2.5 rounded-lg border border-white/[0.04]">
                  {currentSim.kintraEngine.proof}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-zinc-500">
                    Archetype: <span className="text-champagne-300 font-semibold">{currentSim.kintraEngine.archetype}</span>
                  </div>
                  <button
                    onClick={() => handleCopySim(currentSim.kintraEngine.headline)}
                    className="text-[11px] text-champagne-400 hover:text-champagne-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSim ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSim ? 'Copied' : 'Copy Deliverable'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* THE HARD TRUTH / THE PARADIGM SHIFT                                       */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
            The Fundamental Architectural Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Generic AI Fails Serious Brands
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            LLMs are stateless prediction engines. When you ask them to write brand copy, they average all the lukewarm marketing clichés on the public web. KINTRA replaces probability with mathematical constraint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: The Fragility of Prompting */}
          <div className="monolith-card rounded-2xl p-8 border border-white/[0.06] space-y-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 font-bold">
              ✕
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">The Fragility of Prompting</h3>
              <p className="text-xs text-rose-400/90 font-mono mt-1">ChatGPT, Claude, Jasper, Copy.ai</p>
            </div>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-mono mt-0.5">•</span>
                <div>
                  <strong className="text-zinc-200">Stateless Amnesia:</strong> Every new prompt forgets the founder’s target audience nuances, producing copy that gradually drifts off-brand.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-mono mt-0.5">•</span>
                <div>
                  <strong className="text-zinc-200">The Compromise Trap:</strong> Generative models try to appeal to everyone, removing bold differentiators in favor of vanilla consensus.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-mono mt-0.5">•</span>
                <div>
                  <strong className="text-zinc-200">Buzzword Cliché Infiltration:</strong> Defaulting to &ldquo;synergize,&rdquo; &ldquo;supercharge,&rdquo; and &ldquo;next-gen&rdquo; that erode technical credibility.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-mono mt-0.5">•</span>
                <div>
                  <strong className="text-zinc-200">No Provenance:</strong> Inability to verify which competitor weakness or market metric justified a specific headline claim.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: The KINTRA Deterministic Architecture */}
          <div className="monolith-card-gold rounded-2xl p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-champagne-500/15 border border-champagne-500/40 flex items-center justify-center text-champagne-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">The KINTRA Deterministic Engine</h3>
              <p className="text-xs text-champagne-400 font-mono mt-1">Causal Directed Acyclic Graph (DAG) + Consistency AST</p>
            </div>
            <ul className="space-y-4 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Strict Causal Dependency:</strong> If you mutate your target audience, KINTRA automatically highlights affected downstream nodes and triggers re-audits.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Enforceable Strategic Sacrifices:</strong> Explicitly codifies what you *refuse* to build or say, preventing positioning dilution.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Continuous Consistency Guardian:</strong> Mathematical AST gatekeeper intercepts copy with banned vocabulary or unauthorized tonal registers.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Production Brand Operating System:</strong> Instant compilation into Markdown Brand Book and JSON schema for programmatic use.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7-STAGE PIPELINE INTERACTIVE EXPLORER                                    */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-obsidian-900/40 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
              End-to-End Autonomous Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The 7 Governed Brand Workspaces
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Step through the causal workflow that takes a raw founder idea from epistemic discovery to a complete production launch kit.
            </p>
          </div>

          {/* Interactive Navigation Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin mb-8">
            {stages.map((stage) => (
              <button
                key={stage.num}
                onClick={() => setActiveStageNav(stage.num)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  activeStageNav === stage.num
                    ? 'bg-champagne-500/20 border-champagne-500/50 text-champagne-200 shadow-gold-glow'
                    : 'bg-obsidian-950/70 border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStageNav === stage.num
                    ? 'bg-champagne-400 text-obsidian-950'
                    : 'bg-obsidian-850 text-zinc-500'
                }`}>
                  {stage.num}
                </span>
                <span>{stage.title}</span>
              </button>
            ))}
          </div>

          {/* Selected Stage Detail Showcase */}
          {(() => {
            const current = stages[activeStageNav - 1];
            return (
              <div className="monolith-card rounded-2xl p-6 sm:p-10 border border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-champagne-500/10 text-champagne-300 border border-champagne-500/25">
                      Stage {current.num} of 7
                    </span>
                    <span className="text-xs font-mono text-zinc-500 uppercase">• {current.badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {current.title}
                  </h3>

                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    {current.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-obsidian-950/80 border border-white/[0.05]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Input Contract</div>
                      <div className="text-xs font-semibold text-zinc-200 mt-1">{current.input}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-obsidian-950/80 border border-white/[0.05]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Guaranteed Output</div>
                      <div className="text-xs font-semibold text-champagne-300 mt-1">{current.output}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-obsidian-950/80 border border-white/[0.05]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Verification Metric</div>
                      <div className="text-xs font-semibold text-emerald-400 mt-1">{current.metric}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onEnterStudio}
                      className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-champagne-400 hover:text-champagne-200 transition-colors cursor-pointer"
                    >
                      <span>Jump straight into Stage {current.num} in Brand Studio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stage Visual Representation */}
                <div className="lg:col-span-5 bg-obsidian-950/90 rounded-xl p-6 border border-white/[0.08] font-mono text-xs text-zinc-300 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[10px] text-zinc-500">
                    <span>STATE_EXECUTION_TRACE</span>
                    <span className="text-emerald-400">STRICT_AST_VALID</span>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div className="text-zinc-500">// Governing State Parameters</div>
                    <div>
                      <span className="text-champagne-400">stage_index:</span> {current.num}
                    </div>
                    <div>
                      <span className="text-champagne-400">deterministic_gate:</span> true
                    </div>
                    <div>
                      <span className="text-champagne-400">governing_contract:</span> &quot;{current.badge}&quot;
                    </div>
                    <div>
                      <span className="text-champagne-400">causal_edge_relation:</span> &quot;depends_on&quot;
                    </div>
                    <div className="text-emerald-400 pt-2">
                      ✔ AST validation passed: 0 schema warnings
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ARCHITECTURAL MONOLITHS (4 CORE PILLARS)                                */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
            Enterprise Grade Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Irreversible Precision
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            KINTRA is built with the rigor of a compiler. Every feature solves a real-world enterprise brand failure mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="monolith-card rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-champagne-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-champagne-500/10 border border-champagne-500/25 flex items-center justify-center text-champagne-400">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Visual Causal DAG</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live SVG bezier graph mapping causal lineage from founder inputs to launch deliverables with node dependency propagation.
            </p>
            <div className="text-[10px] font-mono text-champagne-400/90 pt-1">
              • Graph Traversal & AST Validation
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="monolith-card rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-champagne-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Consistency Guardian</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-100ms deterministic gatekeeper. Audits artifacts against forbidden words, tonal registers, and governing strategic decisions.
            </p>
            <div className="text-[10px] font-mono text-emerald-400/90 pt-1">
              • Zero Cliché Leakage Guarantee
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="monolith-card rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-champagne-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Brand Evolution Lab</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Git-style assumption branching. Test pivots to pricing or audience in isolated branches and inspect visual diffs before merging.
            </p>
            <div className="text-[10px] font-mono text-amber-400/90 pt-1">
              • Snapshot Rollback & Merges
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="monolith-card rounded-2xl p-6 border border-white/[0.06] space-y-4 hover:border-champagne-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/25 flex items-center justify-center text-slate-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Presentation Mode</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instant executive pitch deck view. Step through your positioning, voice, tokens, and deliverables with keyboard navigation.
            </p>
            <div className="text-[10px] font-mono text-slate-300/90 pt-1">
              • Full-Screen Executive Review
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION (THE LAUNCHPAD)                                     */}
      {/* ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="monolith-card-gold rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Rays */}
          <div className="absolute inset-0 bg-radial-gradient from-champagne-500/10 to-transparent pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-950/80 border border-champagne-500/30 text-champagne-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-champagne-400" />
              <span>Ready for Immediate Deployment</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Architect Your Brand Operating System.
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              No credit card required. Works 100% locally with sample fixtures or connect your Google Gemini API key for live inference.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={onEnterStudio}
              className="w-full sm:w-auto px-8 py-4 rounded-xl btn-monolith-primary text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow-lg"
            >
              <span>Launch Brand Studio Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadSample}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-obsidian-950/90 hover:bg-obsidian-900 text-zinc-200 border border-white/[0.1] hover:border-champagne-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-champagne-400" />
              <span>Load PRGuard Fixture</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
