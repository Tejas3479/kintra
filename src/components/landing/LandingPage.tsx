'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Radio,
  ChevronRight,
  Plus,
  GitBranch,
} from 'lucide-react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'section';
  style?: React.CSSProperties;
  id?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  y = 24,
  blur = 4,
  duration = 750,
  as: Component = 'div',
  style = {},
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const combinedStyle: React.CSSProperties = {
    ...style,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : `translateY(${y}px)`,
    filter: isVisible ? 'blur(0px)' : `blur(${blur}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform, filter',
  };

  const Comp = Component as React.ElementType;

  return (
    <Comp ref={ref} id={id} className={className} style={combinedStyle}>
      {children}
    </Comp>
  );
};

interface LandingPageProps {
  onEnterStudio: () => void;
  onLoadSample: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onLoadSample,
}) => {
  // Dynamic Scroll Reading Progress
  const [scrollPercent, setScrollPercent] = useState(0);

  // Cycling Guarantee Pill (Ezee rhythm)
  const [guaranteeIndex, setGuaranteeIndex] = useState(0);
  const guaranteePhrases = [
    'Clichés? Mathematically rejected.',
    'Downstream blast radius? Fully isolated.',
    'Strategic conviction? Formally proven.',
    'Hallucinations? 0% tolerated.',
  ];

  // Interactive 3D Card Tilt
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });


  // 8 Stages Navigation Tab
  const [activeStageNav, setActiveStageNav] = useState<number>(3);

  // FAQ Accordion State
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  // Scroll listener for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollPercent(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll listener for the Sequential Journey (#how section)
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  useEffect(() => {
    const handleScrollJourney = () => {
      const card0 = document.getElementById('pipeline-card-0');
      const card3 = document.getElementById('pipeline-card-3');
      if (!card0 || !card3) {
        const el = document.getElementById('how');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const current = window.innerHeight * 0.5 - rect.top;
        const progress = Math.min(1, Math.max(0, current / rect.height));
        setJourneyProgress(progress);
        return;
      }

      const r0 = card0.getBoundingClientRect();
      const r3 = card3.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Focal center line in viewport (around 48% of screen height)
      const focalLine = windowHeight * 0.48;

      const c0Center = r0.top + r0.height / 2;
      const c3Center = r3.top + r3.height / 2;
      const totalSpan = c3Center - c0Center;

      if (totalSpan <= 0) return;

      // Progress: 0 when card 0 is at focalLine, 1 when card 3 is at focalLine
      const rawProgress = (focalLine - c0Center) / totalSpan;
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));
      setJourneyProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScrollJourney, { passive: true });
    window.addEventListener('resize', handleScrollJourney, { passive: true });
    handleScrollJourney();
    return () => {
      window.removeEventListener('scroll', handleScrollJourney);
      window.removeEventListener('resize', handleScrollJourney);
    };
  }, []);

  const effectiveProgress = hoveredStage !== null 
    ? (hoveredStage - 1) / 3 
    : journeyProgress;

  // Cubic Bézier calculation along the exact SVG path:
  // d="M 240,90 C 500,90 500,310 760,310 C 500,310 500,530 240,530 C 500,530 500,750 760,750"
  // In viewBox 1000x860: P1:(24%, 10.47%), P2:(76%, 36.05%), P3:(24%, 61.63%), P4:(76%, 87.21%)
  const cubicBezier = (p0: number, p1: number, p2: number, p3: number, t: number) => {
    const omt = 1 - t;
    return (
      omt * omt * omt * p0 +
      3 * omt * omt * t * p1 +
      3 * omt * t * t * p2 +
      t * t * t * p3
    );
  };

  const getProbePosition = (p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    let stage = 1;
    if (clamped < 0.17) stage = 1;
    else if (clamped < 0.50) stage = 2;
    else if (clamped < 0.83) stage = 3;
    else stage = 4;

    if (clamped <= 0.333) {
      const t = clamped / 0.333;
      const x = cubicBezier(24, 50, 50, 76, t);
      const y = cubicBezier(10.47, 10.47, 36.05, 36.05, t);
      return { x, y, stage };
    } else if (clamped <= 0.666) {
      const t = (clamped - 0.333) / 0.333;
      const x = cubicBezier(76, 50, 50, 24, t);
      const y = cubicBezier(36.05, 36.05, 61.63, 61.63, t);
      return { x, y, stage };
    } else {
      const t = (clamped - 0.666) / 0.334;
      const x = cubicBezier(24, 50, 50, 76, t);
      const y = cubicBezier(61.63, 61.63, 87.21, 87.21, t);
      return { x, y, stage };
    }
  };

  const probePos = getProbePosition(effectiveProgress);

  // Cycling guarantee loop
  useEffect(() => {
    const timer = setInterval(() => {
      setGuaranteeIndex((prev) => (prev + 1) % guaranteePhrases.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [guaranteePhrases.length]);

  // Handle 3D Parallax Tilt on Hero Card
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ x: x * 12, y: -y * 12 });
  };

  const handleHeroMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };


  // 4 Core Journey Steps (Ezee "How the magic happens" style)
  const journeySteps = [
    {
      num: '01',
      title: 'Extract Founder Invariants',
      desc: 'An adaptive interrogator unpacks messy founder intuition, bifurcating verified empirical ground-truth from unproven hypotheses.',
      tag: 'Zero Assumption Leakage',
      badgeColor: 'bg-champagne-500/20 text-champagne-300 border-champagne-500/40',
      icon: Sparkles,
      input: 'Unstructured founder thoughts',
      output: 'Validated Invariant AST',
    },
    {
      num: '02',
      title: 'Ground in Market Evidence',
      desc: 'SSRF-protected autonomous web telemetry crawls live competitor footprints, mapping pricing models, positioning claims, and verified proof points.',
      tag: 'SSRF-Hardened Telemetry',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Radio,
      input: 'Live competitor footprints',
      output: 'Empirical Evidence Matrix',
    },
    {
      num: '03',
      title: 'Synthesize Divergent Worlds',
      desc: 'Generates 3 radically polarized strategic universes with explicit tradeoffs (what you refuse to build or say) rather than lukewarm consensus.',
      tag: 'Forced Strategic Sacrifices',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: GitBranch,
      input: 'Tradeoff vector matrix',
      output: 'Governed Positioning Worlds',
    },
    {
      num: '04',
      title: 'Enforce Consistency AST',
      desc: 'Sub-50ms deterministic gatekeeper audits all launch copy across 9 independent dimensions, locking deliverables into an immutable Causal DAG.',
      tag: '100% Deterministic Guarantee',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: ShieldCheck,
      input: 'Draft artifact + Brand Ledger',
      output: 'Cryptographic Audit Seal',
    },
  ];

  // 8 Stages Data
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
    {
      num: 8,
      title: 'Brand Decision Graph & Ledger',
      badge: 'Causal Lineage DAG',
      description: 'An immutable, versioned causal Directed Acyclic Graph tracing all approved brand commitments, explicit tradeoffs, and dependencies across stages.',
      metric: 'Cryptographic DAG Lineage',
      input: 'Governed decisions from all stages',
      output: 'Immutable Decision Graph & Visual DAG',
    },
  ];

  // Proof of Conviction Testimonials Data (Marquee)
  const testimonials = [
    {
      badge: '100% AST MATCH',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      tilt: '-rotate-2',
      quote:
        'Every AI tool we tried previously wrote the exact same boring copy with ‘supercharge your workflow’. KINTRA forced us to decide what we refuse to build. Our conversion rate doubled on launch day.',
      author: 'Tobias Lindqvist',
      role: 'Founder, Astrolabe Infrastructure',
      avatar: 'TL',
      avatarBg: 'bg-champagne-500/20 text-champagne-300 border-champagne-500/40',
      isGold: false,
    },
    {
      badge: 'GUARDIAN VERIFIED',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      tilt: 'rotate-2',
      quote:
        'The Consistency Guardian caught three marketing violations before our Series A deck was sent to partners. It is literally impossible for off-brand copy to slip through to production.',
      author: 'Maya Kulkarni',
      role: 'Chief Architect, PRGuard DevSec',
      avatar: 'MK',
      avatarBg: 'bg-champagne-500/30 text-champagne-200 border-champagne-400',
      isGold: true,
    },
    {
      badge: 'BRANCH MERGED',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      tilt: '-rotate-1.5',
      quote:
        'When we pivoted from SMBs to enterprise CISO buyers, the blast-radius dependency graph highlighted exactly which 4 artifacts needed rewrites. Saved us 3 weeks of brand confusion.',
      author: 'Soren Carlsen',
      role: 'VP Product, Hyperion Telemetry',
      avatar: 'SC',
      avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isGold: false,
    },
    {
      badge: 'ZERO CONTRADICTIONS',
      badgeColor: 'text-champagne-300 border-champagne-500/30 bg-champagne-500/10',
      tilt: 'rotate-1.5',
      quote:
        'We run KINTRA validations on every product release commit. If sales copy promises an SLA that engineering hasn’t codified in the DAG, CI fails. It ended founder-sales drift forever.',
      author: 'Elena Rostova',
      role: 'Head of Engineering, VectorDB Labs',
      avatar: 'ER',
      avatarBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isGold: false,
    },
    {
      badge: 'DETERMINISTIC COPY',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      tilt: '-rotate-2',
      quote:
        'Stateless LLM prompting was giving us a different brand personality every Monday. KINTRA’s immutable causal graph gave our team unified, provable tone and vocabulary.',
      author: 'Julian Mercer',
      role: 'Co-Founder & CEO, Lattice Protocol',
      avatar: 'JM',
      avatarBg: 'bg-champagne-500/30 text-champagne-200 border-champagne-400',
      isGold: true,
    },
    {
      badge: 'ARCHETYPE GOVERNED',
      badgeColor: 'text-champagne-300 border-champagne-500/30 bg-champagne-500/10',
      tilt: 'rotate-2.5',
      quote:
        'Our technical buyers immediately smell marketing hand-waving. KINTRA grounded every claim in verified CVE benchmarks and system telemetry. Clean, authoritative, zero fluff.',
      author: 'Devon Vance',
      role: 'Principal Systems Architect, KernelSec',
      avatar: 'DV',
      avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isGold: false,
    },
  ];

  // FAQs Data
  const faqs = [
    {
      q: 'How does KINTRA differ from prompting ChatGPT or Claude?',
      a: 'Chatbots are stateless probability engines that suffer from prompt amnesia. After two turns, they forget your audience constraints, average out your strategic edges, and revert to generic buzzwords like "supercharge" or "revolutionize". KINTRA compiles your brand into a mathematical Causal Decision Graph with strict AST validators that never silently destroy prior commitments.',
    },
    {
      q: 'What is the Consistency Guardian and how does it prevent brand drift?',
      a: 'The Consistency Guardian is a deterministic evaluation engine that audits all generated text against 9 orthogonal dimensions (Archetype alignment, Forbidden vocabulary, Vocal register, Positioning coherence, and Evidence grounding). It immediately blocks copy containing forbidden clichés or violating the approved strategic archetype.',
    },
    {
      q: 'Can I pivot or change brand decisions without losing all my work?',
      a: 'Yes. KINTRA includes the Brand Evolution Lab with Git-style branching. You can branch your brand to test a new target audience or pricing tier. The engine analyzes the downstream "blast radius" to show you exactly which artifacts remain valid and which require updating, preserving full historical rollback.',
    },
    {
      q: 'Do I need an active API key to test the platform?',
      a: 'No. KINTRA works 100% out of the box in Demo Mode with built-in fixtures (such as the developer-security platform PRGuard). When you want live autonomous intelligence, connect your Google Gemini API key via the settings panel.',
    },
    {
      q: 'Can I export the brand system to my team and engineering tools?',
      a: 'KINTRA generates a production-ready Launch Kit containing 8 ready-to-deploy assets (website copy, investor pitches, social announcements, support manuals) alongside an exhaustive Brand Guidelines book in Markdown and JSON schemas for CI/CD integration.',
    },
  ];

  return (
    <div className="relative overflow-hidden text-zinc-100 min-h-screen bg-obsidian-950 font-sans">
      {/* ========================================================================= */}
      {/* DYNAMIC SCROLL READING PROGRESS LINE                                      */}
      {/* ========================================================================= */}
      <div
        className="scroll-progress-line"
        style={{ width: `${scrollPercent}%` }}
        aria-hidden="true"
      />

      {/* ========================================================================= */}
      {/* FLOATING CAPSULE NAVBAR (Ezee Figma Style)                                 */}
      {/* ========================================================================= */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-2.5 rounded-full bg-obsidian-900/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/80 transition-all duration-300">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onEnterStudio}
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-champagne-500/35 bg-obsidian-950 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="KINTRA Logo"
              width={28}
              height={28}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-white">KINTRA</span>
        </div>

        <div className="w-px h-4 bg-white/10 hidden md:block" />

        <div className="hidden md:flex items-center gap-5 text-xs font-mono text-zinc-400">
          <a href="#how" className="hover:text-champagne-300 transition-colors">How it works</a>
          <a href="#comparison" className="hover:text-champagne-300 transition-colors">Why KINTRA</a>
          <a href="#stages" className="hover:text-champagne-300 transition-colors">8 Stages</a>
          <a href="#faq" className="hover:text-champagne-300 transition-colors">FAQ</a>
        </div>

        <div className="w-px h-4 bg-white/10 hidden md:block" />

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="hidden sm:flex px-3 py-1.5 rounded-full bg-obsidian-950/80 hover:bg-obsidian-850 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-champagne-500/30 text-xs font-mono items-center gap-1.5 cursor-pointer transition-all"
            title="Load PRGuard DevSecOps sample fixture"
          >
            <ShieldCheck className="w-3 h-3 text-champagne-400" />
            <span>Sample</span>
          </button>

          <button
            onClick={onEnterStudio}
            className="px-4 py-1.5 rounded-full btn-monolith-primary text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-gold-glow"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* ATMOSPHERIC BACKGROUND EFFECTS & PARTICLES                                */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-grid-cyber opacity-70 mask-radial-fade" />
        <div className="absolute inset-0 bg-dot-matrix opacity-25" />

        {/* Ambient Moving Glow Orbs */}
        <div
          className="glow-orb-gold w-[680px] h-[680px] -top-40 left-1/2 -translate-x-1/2 animate-pulse-slow"
          style={{ transform: 'translateX(-50%)' }}
        />
        <div className="glow-orb-steel w-[480px] h-[480px] top-[32%] -left-36 animate-float" />
        <div className="glow-orb-gold w-[560px] h-[560px] top-[62%] -right-40 animate-float-delayed" />

        {/* Floating dust motes (Ezee rhythm) */}
        <div className="absolute left-[14%] top-[22%] w-2 h-2 rounded-full bg-champagne-400 opacity-40 animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute left-[44%] top-[16%] w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-35 animate-float-delayed" style={{ animationDuration: '10s' }} />
        <div className="absolute left-[80%] top-[36%] w-2 h-2 rounded-full bg-champagne-500 opacity-30 animate-float" style={{ animationDuration: '9s' }} />
        <div className="absolute left-[26%] top-[66%] w-1.5 h-1.5 rounded-full bg-amber-400 opacity-35 animate-float-delayed" style={{ animationDuration: '11s' }} />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION (Figma 2-Column Split: Punchy Typography + 3D Motion Card)   */}
      {/* ========================================================================= */}
      <section className="relative pt-20 pb-12 md:pt-24 md:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Typography & Intent */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Giant 3-Row Stacked Typography (Exact Ezee Rhythm) */}
            <h1 className="font-extrabold text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.92] text-white">
              <ScrollReveal delay={80} y={24} as="span" className="block">
                Decide.
              </ScrollReveal>
              <ScrollReveal delay={200} y={24} as="span" className="text-titanium-shimmer block">
                Verify.
              </ScrollReveal>
              <ScrollReveal delay={320} y={24} as="span" className="block text-zinc-300">
                Govern.
              </ScrollReveal>
            </h1>

            {/* Subtitle */}
            <ScrollReveal delay={400} y={20}>
              <p className="text-base sm:text-lg text-zinc-400 max-w-lg leading-relaxed">
                Transform unshaped founder intuition into verifiable, contradiction-free brand operating systems backed by empirical evidence and immutable causal DAGs.
              </p>
            </ScrollReveal>

            {/* Cycling Guarantee Tag (Exact Ezee "Deadline? Already handled" style) */}
            <ScrollReveal delay={480} y={16}>
              <div className="flex items-center gap-2 text-xs font-mono text-champagne-300 pt-1">
                <span className="w-2 h-2 rounded-full bg-champagne-400 animate-ping" />
                <span className="font-semibold transition-all duration-300">
                  • {guaranteePhrases[guaranteeIndex]}
                </span>
              </div>
            </ScrollReveal>

            {/* Dual CTAs */}
            <ScrollReveal delay={560} y={20}>
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={onEnterStudio}
                  className="px-7 py-3.5 rounded-xl btn-monolith-primary text-sm font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow-lg group"
                >
                  <span>Launch Brand Studio</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onLoadSample}
                  className="px-5 py-3.5 rounded-xl bg-obsidian-900/80 hover:bg-obsidian-850 text-zinc-200 hover:text-white border border-white/[0.08] hover:border-champagne-500/30 transition-all text-sm font-medium flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-champagne-400" />
                  <span>Explore PRGuard Fixture</span>
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Figma-Style Animated 3D Perspective Card (Ezee Desk Scene Style) */}
          <ScrollReveal delay={240} y={32} duration={850} className="lg:col-span-6 flex justify-center">
            <div
              className="relative w-full max-w-[540px] perspective-[1200px]"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              {/* Radial Aura behind 3D card */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-champagne-500/20 via-champagne-400/10 to-amber-500/20 rounded-[36px] blur-2xl opacity-70 animate-pulse-slow" />

              {/* 3D Tilting Card Container */}
              <div
                className="relative rounded-3xl overflow-hidden border border-champagne-500/30 shadow-2xl bg-obsidian-900/90 transition-transform duration-200 ease-out"
                style={{
                  transform: `perspective(1200px) rotateX(${cardTilt.y}deg) rotateY(${cardTilt.x}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Console Window Header Bar */}
                <div className="px-4 py-3 bg-obsidian-950/90 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 shrink-0" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 shrink-0" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 shrink-0" />
                    <div className="flex items-center gap-1.5 ml-2 min-w-0 truncate">
                      <span className="text-[11px] font-mono font-bold text-white tracking-wider">KINTRA</span>
                      <span className="text-[10px] font-mono text-zinc-600">{'//'}</span>
                      <span className="text-[11px] font-mono text-champagne-300 font-medium truncate">Causal Brand Decision Engine</span>
                      <span className="text-[10px] font-mono text-zinc-600 hidden sm:inline">•</span>
                      <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">v2026.04</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                      AST_ACTIVE
                    </span>
                  </div>
                </div>

                {/* Main Illustrated Monolith Render with Pristine Palettes & Flowing White Data Dots */}
                <div className="relative aspect-[4/3] w-full bg-obsidian-950 overflow-hidden">
                  <Image
                    src="/hero-monolith.png"
                    alt="KINTRA Causal Decision Terminal Monolith"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Flowing White/Gold Data Dot Animation Along Wire Splines */}
                  <svg
                    viewBox="0 0 1200 896"
                    className="absolute inset-0 w-full h-full pointer-events-none select-none"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                  >
                    <defs>
                      <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                        <feMerge>
                          <feMergeNode in="blur2" />
                          <feMergeNode in="blur1" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="45%" stopColor="#fef08a" stopOpacity="0.95" />
                        <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Wire 1: Top-Left Card upper to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.4s" repeatCount="indefinite" path="M 335,275 C 380,330 410,410 445,485" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M 335,275 C 380,330 410,410 445,485" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 2: Top-Left Card lower to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.6s" begin="0.4s" repeatCount="indefinite" path="M 330,305 C 375,355 410,430 445,495" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.6s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.6s" begin="1.7s" repeatCount="indefinite" path="M 330,305 C 375,355 410,430 445,495" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.6s" begin="1.7s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 3: Mid-Left Card upper to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.2s" begin="0.2s" repeatCount="indefinite" path="M 275,490 C 330,495 385,495 440,500" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.2s" begin="0.2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.2s" begin="1.3s" repeatCount="indefinite" path="M 275,490 C 330,495 385,495 440,500" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.2s" begin="1.3s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 4: Mid-Left Card lower to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.5s" begin="0.7s" repeatCount="indefinite" path="M 275,525 C 335,520 390,515 440,515" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.5s" begin="0.7s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.5s" begin="1.95s" repeatCount="indefinite" path="M 275,525 C 335,520 390,515 440,515" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.5s" begin="1.95s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 5: Bottom-Left Card upper to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.3s" begin="0.5s" repeatCount="indefinite" path="M 355,630 C 395,610 420,570 440,530" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.3s" begin="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.3s" begin="1.65s" repeatCount="indefinite" path="M 355,630 C 395,610 420,570 440,530" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.3s" begin="1.65s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 6: Bottom-Left Card lower to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.7s" begin="0.9s" repeatCount="indefinite" path="M 365,665 C 405,635 425,585 440,540" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.7s" begin="0.9s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.7s" begin="2.25s" repeatCount="indefinite" path="M 365,665 C 405,635 425,585 440,540" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.7s" begin="2.25s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 7: Top-Right Card upper to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.4s" begin="0.1s" repeatCount="indefinite" path="M 870,260 C 840,320 815,380 770,440" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="0.1s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.4s" begin="1.3s" repeatCount="indefinite" path="M 870,260 C 840,320 815,380 770,440" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="1.3s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 8: Top-Right Card lower to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.5s" begin="0.6s" repeatCount="indefinite" path="M 870,290 C 845,350 820,405 770,455" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.5s" begin="1.85s" repeatCount="indefinite" path="M 870,290 C 845,350 820,405 770,455" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.5s" begin="1.85s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 9: Mid-Right Card upper to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.3s" begin="0.3s" repeatCount="indefinite" path="M 935,430 C 880,445 830,460 780,470" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.3s" begin="0.3s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.3s" begin="1.45s" repeatCount="indefinite" path="M 935,430 C 880,445 830,460 780,470" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.3s" begin="1.45s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 10: Mid-Right Card lower to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.6s" begin="0.8s" repeatCount="indefinite" path="M 935,460 C 885,470 835,480 780,485" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.6s" begin="0.8s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.6s" begin="2.1s" repeatCount="indefinite" path="M 935,460 C 885,470 835,480 780,485" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.6s" begin="2.1s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 11: Bottom-Right Card upper to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.4s" begin="0.4s" repeatCount="indefinite" path="M 870,630 C 840,585 820,545 770,510" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.4s" begin="1.6s" repeatCount="indefinite" path="M 870,630 C 840,585 820,545 770,510" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="1.6s" repeatCount="indefinite" />
                    </circle>

                    {/* Wire 12: Bottom-Right Card lower to Monolith */}
                    <circle r="4" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.7s" begin="1.0s" repeatCount="indefinite" path="M 870,665 C 845,615 820,565 770,525" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.7s" begin="1.0s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="url(#pulse-grad)" filter="url(#dot-glow)">
                      <animateMotion dur="2.7s" begin="2.35s" repeatCount="indefinite" path="M 870,665 C 845,615 820,565 770,525" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.7s" begin="2.35s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Prompt (Ezee "Scroll into the nook" style) */}
        <ScrollReveal delay={640} y={16}>
          <div className="pt-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono tracking-widest uppercase">
            <span>Scroll into the engine</span>
            <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-champagne-400 animate-bounce" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* CONTINUOUS LIVE TELEMETRY MARQUEE                                         */}
      {/* ========================================================================= */}
      <ScrollReveal delay={100} y={20}>
        <div className="relative bg-obsidian-900/60 border-y border-white/[0.06] py-3 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-obsidian-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-obsidian-950 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee font-mono text-xs text-zinc-400 flex items-center gap-8 whitespace-nowrap">
            {/* Loop 1 */}
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2"><span className="text-champagne-400 font-bold">✦</span><span>14,892 Causal DAG nodes evaluated</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-emerald-400 font-bold">⚡</span><span>42ms Consistency Guardian latency</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-champagne-400 font-bold">🛡️</span><span>100% Zero-Cliché Guarantee</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-amber-400 font-bold">⚖️</span><span>4 Adversarial challenge agents</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-blue-400 font-bold">📜</span><span>9 Independent brand dimensions audited</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-rose-400 font-bold">💎</span><span>0 Hallucinated marketing adjectives</span></span>
            </div>

            {/* Loop 2 (Duplicate for Seamless Scroll) */}
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2"><span className="text-champagne-400 font-bold">✦</span><span>14,892 Causal DAG nodes evaluated</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-emerald-400 font-bold">⚡</span><span>42ms Consistency Guardian latency</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-champagne-400 font-bold">🛡️</span><span>100% Zero-Cliché Guarantee</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-amber-400 font-bold">⚖️</span><span>4 Adversarial challenge agents</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-blue-400 font-bold">📜</span><span>9 Independent brand dimensions audited</span></span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-2"><span className="text-rose-400 font-bold">💎</span><span>0 Hallucinated marketing adjectives</span></span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* "HOW IT WORKS" SEQUENTIAL JOURNEY (Ezee Winding Spline + Motion Engine)    */}
      {/* ========================================================================= */}
      <section id="how" className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Background Radiance */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-champagne-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
          <ScrollReveal delay={0} y={16}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-900/90 border border-champagne-500/30 text-champagne-300 text-xs font-mono shadow-gold-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-champagne-400 animate-ping" />
              <span>A Governed Strategic Journey</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={120} y={24}>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How the Causal Engine Compiles
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={220} y={20}>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Four rigorous phases between unshaped founder instincts and an immutable brand operating system.
            </p>
          </ScrollReveal>
        </div>

        {/* Outer Container with Grand Connecting Winding Spline */}
        <div className="relative max-w-4xl mx-auto py-4">
          {/* SVG Winding Spline Path Background (Exact Ezee Spline Style) */}
          <svg
            viewBox="0 0 1000 860"
            preserveAspectRatio="none"
            className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none select-none -z-0"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="journey-laser-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4b483" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="100%" stopColor="#b9935b" stopOpacity="0.85" />
              </linearGradient>

              <filter id="how-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Dashed Trajectory Line */}
            <path
              d="M 240,90 C 500,90 500,310 760,310 C 500,310 500,530 240,530 C 500,530 500,750 760,750"
              fill="none"
              stroke="#71717a"
              strokeWidth="2.5"
              strokeDasharray="4 12"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />

            {/* Scroll-Driven Active Laser Beam filling along the path as user scrolls */}
            <path
              d="M 240,90 C 500,90 500,310 760,310 C 500,310 500,530 240,530 C 500,530 500,750 760,750"
              fill="none"
              stroke="url(#journey-laser-grad)"
              strokeWidth="3.5"
              strokeDasharray="2200"
              strokeDashoffset={Math.max(0, 2200 * (1 - effectiveProgress))}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
              filter="url(#how-glow)"
              strokeLinecap="round"
            />

            {/* Flowing Data Packets Traveling Along the Spline */}
            <circle r="4" fill="#ffffff" filter="url(#how-glow)">
              <animateMotion dur="6s" repeatCount="indefinite" path="M 240,90 C 500,90 500,310 760,310 C 500,310 500,530 240,530 C 500,530 500,750 760,750" />
            </circle>
            <circle r="3.5" fill="#fef08a" filter="url(#how-glow)">
              <animateMotion dur="6s" begin="2s" repeatCount="indefinite" path="M 240,90 C 500,90 500,310 760,310 C 500,310 500,530 240,530 C 500,530 500,750 760,750" />
            </circle>
            <circle r="3.5" fill="#f59e0b" filter="url(#how-glow)">
              <animateMotion dur="6s" begin="4s" repeatCount="indefinite" path="M 240,90 C 500,90 500,310 760,310 C 500,310 500,530 240,530 C 500,530 500,750 760,750" />
            </circle>
          </svg>

          {/* Interactive Traveling Causal Telemetry Probe Tracking User Scroll (Exact Ezee bobwalk style) */}
          <div
            className="hidden sm:flex absolute items-center gap-2 pointer-events-none z-20"
            style={{
              left: `${probePos.x}%`,
              top: `${probePos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ animation: 'bobwalk 1.6s ease-in-out infinite' }} className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-champagne-500/20 border border-champagne-400/60 animate-ping opacity-75" />
                <div className="absolute w-5 h-5 rounded-full bg-champagne-400 shadow-gold-glow flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-obsidian-950" />
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-obsidian-950/95 border border-champagne-500/40 backdrop-blur-md shadow-2xl text-[10px] font-mono text-champagne-200 font-bold whitespace-nowrap flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{`AST_STAGE_0${probePos.stage} // COMPILING`}</span>
              </div>
            </div>
          </div>

          {/* 4 Zigzag Steps (Interactive Cards with Hover Elevation & Scroll-Highlight) */}
          <div className="relative flex flex-col gap-12 sm:gap-20 z-10">
            {journeySteps.map((step, idx) => {
              const isEven = idx % 2 === 1;
              const StepIcon = step.icon;
              const isCardActive = probePos.stage === idx + 1;

              return (
                <ScrollReveal
                  key={step.num}
                  id={`pipeline-card-${idx}`}
                  delay={idx * 100}
                  y={28}
                  className={`w-full flex ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}
                >
                  <div
                    className={`w-full sm:max-w-md rounded-2xl p-6 sm:p-7 border transition-all duration-300 space-y-4 group cursor-pointer ${
                      isCardActive
                        ? 'border-champagne-500/70 bg-obsidian-900/95 shadow-gold-glow-lg -translate-y-1 ring-1 ring-champagne-400/25'
                        : 'border-white/[0.08] bg-obsidian-950/80 hover:border-champagne-500/30 hover:bg-obsidian-900/90 hover:-translate-y-1.5 hover:shadow-2xl'
                    }`}
                    onMouseEnter={() => setHoveredStage(idx + 1)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => setHoveredStage(idx + 1)}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                          isCardActive
                            ? 'bg-champagne-500 text-obsidian-950 border-champagne-400 font-extrabold shadow-md'
                            : 'bg-obsidian-850 text-champagne-300 border-white/[0.08] group-hover:border-champagne-500/40'
                        }`}>
                          {step.num}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-obsidian-900 border border-white/[0.06] flex items-center justify-center text-champagne-300 group-hover:scale-110 transition-transform">
                          <StepIcon className="w-4 h-4 text-champagne-400" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCardActive && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-champagne-500/15 border border-champagne-500/40 text-[9px] font-mono text-champagne-300 animate-pulse font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-champagne-400" />
                            ACTIVE PHASE
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${step.badgeColor}`}>
                          {step.tag}
                        </span>
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-champagne-200 transition-colors">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                      {step.desc}
                    </p>

                    {/* Input -> Output Contract Telemetry Bar */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <div className="truncate max-w-[45%]">
                        <span className="text-zinc-600">IN: </span>
                        <span className="text-zinc-400">{step.input}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-champagne-500 shrink-0" />
                      <div className="truncate max-w-[45%] text-right">
                        <span className="text-zinc-600">OUT: </span>
                        <span className="text-champagne-300 font-semibold">{step.output}</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* "THE CLICHÉ WAY VS THE KINTRA WAY" COMPARISON GRID (Ezee Style)            */}
      {/* ========================================================================= */}
      <section id="comparison" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <ScrollReveal delay={0} y={16}>
            <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
              The Fundamental Paradigm Shift
            </span>
          </ScrollReveal>
          <ScrollReveal delay={120} y={24}>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The Cliché Way vs.{' '}
              <span className="text-champagne-300">The KINTRA Way</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={220} y={20}>
            <p className="text-sm sm:text-base text-zinc-400">
              This isn’t about generating copy—it’s about eliminating brand debt, commoditization, and strategic drift before you ever spend a dollar on growth.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left: The Old Way */}
          <ScrollReveal delay={150} y={32} className="flex">
            <div className="bg-obsidian-900/60 rounded-3xl p-8 border border-rose-500/20 flex flex-col justify-between space-y-6 w-full">
              <div>
                <div className="flex items-center gap-3 pb-6 border-b border-white/[0.06]">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-lg">
                    😩
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">The Cliché Way</h3>
                    <p className="text-xs text-rose-400 font-mono">Chatbots, Generic Agencies & Hallucinated Prompts</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs shrink-0 mt-0.5">✕</div>
                    <div>
                      <span className="font-semibold text-zinc-200 line-through decoration-rose-500/50 decoration-2">
                        Stateless Prompt Amnesia
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">Every new prompt forgets audience constraints and drifts into consensus.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs shrink-0 mt-0.5">✕</div>
                    <div>
                      <span className="font-semibold text-zinc-200 line-through decoration-rose-500/50 decoration-2">
                        The Compromise Trap (&ldquo;For Everyone&rdquo;)
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">Refuses to make sacrifices; writes lukewarm copy that appeals to nobody.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs shrink-0 mt-0.5">✕</div>
                    <div>
                      <span className="font-semibold text-zinc-200 line-through decoration-rose-500/50 decoration-2">
                        Forbidden Buzzword Soup
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">Overloads copy with &ldquo;supercharge&rdquo;, &ldquo;synergy&rdquo;, and &ldquo;next-gen magic&rdquo;.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs shrink-0 mt-0.5">✕</div>
                    <div>
                      <span className="font-semibold text-zinc-200 line-through decoration-rose-500/50 decoration-2">
                        Zero Empirical Grounding
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">Makes claims without citing verified competitor data or proof points.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/[0.04] text-xs font-mono text-zinc-400">
                <span className="text-rose-400 font-semibold">Outcome: </span>
                Instant brand commoditization and 84% wasted marketing spend.
              </div>
            </div>
          </ScrollReveal>

          {/* Right: The KINTRA Way */}
          <ScrollReveal delay={300} y={32} className="flex">
            <div className="monolith-card-gold rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-2xl w-full">
              <div>
                <div className="flex items-center gap-3 pb-6 border-b border-champagne-500/20">
                  <div className="w-10 h-10 rounded-xl bg-champagne-500/20 border border-champagne-500/40 flex items-center justify-center text-lg">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">The KINTRA Way</h3>
                    <p className="text-xs text-champagne-300 font-mono">Causal Directed Acyclic Graph + AST Consistency Engine</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">
                        Strict Cryptographic Lineage
                      </span>
                      <p className="text-xs text-zinc-300 mt-0.5">Every claim is bound to upstream parent nodes and verified facts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">
                        Explicit Strategic Sacrifices
                      </span>
                      <p className="text-xs text-zinc-300 mt-0.5">Codifies exactly what you refuse to build or say to preserve positioning polarity.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">
                        Deterministic Buzzword Blacklist
                      </span>
                      <p className="text-xs text-zinc-300 mt-0.5">Sub-50ms AST compiler immediately blocks forbidden vocabulary drift.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">
                        Blast Radius Dependency Tracing
                      </span>
                      <p className="text-xs text-zinc-300 mt-0.5">Evolve core assumptions in isolated branches without destroying prior work.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-950/90 border border-champagne-500/30 text-xs font-mono text-champagne-300">
                <span className="text-emerald-400 font-semibold">Outcome: </span>
                Indelible brand conviction with zero contradiction across all channels.
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8-STAGE PIPELINE INTERACTIVE EXPLORER                                    */}
      {/* ========================================================================= */}
      <section id="stages" className="py-20 bg-obsidian-900/40 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <ScrollReveal delay={0} y={16}>
              <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
                End-to-End Autonomous Pipeline
              </span>
            </ScrollReveal>
            <ScrollReveal delay={120} y={24}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                The 8 Governed Brand Workspaces
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={220} y={20}>
              <p className="text-sm sm:text-base text-zinc-400">
                Step through the causal workflow that takes a raw founder idea from epistemic discovery to a complete production launch kit.
              </p>
            </ScrollReveal>
          </div>

          {/* Interactive Navigation Ribbon */}
          <ScrollReveal delay={280} y={20}>
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
          </ScrollReveal>

          {/* Selected Stage Detail Showcase */}
          <ScrollReveal delay={360} y={28}>
            {(() => {
              const current = stages[activeStageNav - 1];
              return (
                <div className="monolith-card rounded-2xl p-6 sm:p-10 border border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-champagne-500/10 text-champagne-300 border border-champagne-500/25">
                        Stage {current.num} of 8
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
                      <div className="text-zinc-500">{'// Governing Node Signature'}</div>
                      <div><span className="text-champagne-400">stage_index:</span> {current.num}</div>
                      <div><span className="text-champagne-400">deterministic_gate:</span> true</div>
                      <div><span className="text-champagne-400">governing_contract:</span> &quot;{current.badge}&quot;</div>
                      <div><span className="text-champagne-400">causal_edge_relation:</span> &quot;depends_on&quot;</div>
                      <div className="text-emerald-400 pt-2">
                        ✔ AST validation passed: 0 schema warnings
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TACTILE "FOUNDERS FROM THE FIELD" AUDIT SLATES (Marquee Looping Style)     */}
      {/* ========================================================================= */}
      <section className="py-20 overflow-hidden relative">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14 px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0} y={16}>
            <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
              Cryptographic Field Logs
            </span>
          </ScrollReveal>
          <ScrollReveal delay={120} y={24}>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Proof of Conviction
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={220} y={20}>
            <p className="text-sm sm:text-base text-zinc-400">
              Real feedback from technical founders and architects who replaced marketing fluff with mathematical brand governance.
            </p>
          </ScrollReveal>
        </div>

        {/* Horizontal Marquee Track with Edge Fades */}
        <ScrollReveal delay={300} y={28}>
          <div className="relative w-full overflow-hidden">
            {/* Subtle edge fades */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-obsidian-950 via-obsidian-950/80 to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-obsidian-950 via-obsidian-950/80 to-transparent z-20" />

            {/* Continuous looping track */}
            <div className="flex gap-8 animate-marquee py-8 px-4 w-max">
              {[...testimonials, ...testimonials].map((item, idx) => {
                const cardBorder = item.isGold
                  ? 'monolith-card-gold border-champagne-500/40'
                  : 'monolith-card border-white/[0.08]';

                return (
                  <div
                    key={`${item.author}-${idx}`}
                    className={`w-[340px] sm:w-[380px] shrink-0 relative group transition-transform duration-300 hover:scale-105 hover:rotate-0 hover:z-30 cursor-pointer ${item.tilt}`}
                  >
                    {/* Security Scotch Tape */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 security-tape z-20" />

                    {/* Card Body */}
                    <div className={`${cardBorder} rounded-2xl p-6 shadow-2xl space-y-4 relative bg-obsidian-900/95`}>
                      {/* Top Row: Verification Badge (NO Commit Hashes) */}
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                            VERIFIED LOG
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${item.badgeColor} font-bold`}>
                          {item.badge}
                        </span>
                      </div>

                      {/* Quote */}
                      <p className={`text-sm italic leading-relaxed pt-1 ${item.isGold ? 'text-white' : 'text-zinc-200'}`}>
                        &ldquo;{item.quote}&rdquo;
                      </p>

                      {/* Author Details */}
                      <div className={`pt-2.5 border-t ${item.isGold ? 'border-champagne-500/20' : 'border-white/[0.06]'} flex items-center gap-3`}>
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${item.avatarBg}`}>
                          {item.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{item.author}</div>
                          <div className={`text-[10px] font-mono ${item.isGold ? 'text-champagne-300/80' : 'text-zinc-500'}`}>
                            {item.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE CRYPTOGRAPHIC FAQ ACCORDION                                   */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
          <ScrollReveal delay={0} y={16}>
            <span className="text-xs font-mono text-champagne-400 uppercase tracking-widest">
              Audit Transcripts & Inquiries
            </span>
          </ScrollReveal>
          <ScrollReveal delay={120} y={24}>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Frequently Analyzed Invariants
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={220} y={20}>
            <p className="text-sm sm:text-base text-zinc-400">
              Tap any question below to inspect KINTRA’s underlying architectural philosophy.
            </p>
          </ScrollReveal>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaqIndex === index;
            return (
              <ScrollReveal key={index} delay={index * 75} y={20}>
                <div
                  className={`monolith-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-champagne-500/40 bg-obsidian-900/90 shadow-gold-glow'
                      : 'border-white/[0.06] hover:border-white/[0.12] bg-obsidian-950/60'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm transition-transform duration-300 shrink-0 ${
                      isOpen
                        ? 'bg-champagne-500 text-obsidian-950 rotate-45'
                        : 'bg-obsidian-850 text-zinc-400 border border-white/[0.08]'
                    }`}>
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04]">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION (THE EXECUTIVE LAUNCHPAD)                           */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={100} y={32}>
          <div className="monolith-card-gold rounded-3xl p-8 sm:p-14 lg:p-18 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <ScrollReveal delay={150} y={16}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-950/80 border border-champagne-500/30 text-champagne-300 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-champagne-400" />
                  <span>Ready for Immediate Production Deployment</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={250} y={24}>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Architect Your Brand Operating System.
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={350} y={20}>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  No credit card required. Works 100% locally with sample fixtures or connect your Google Gemini API key for live autonomous inference.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={450} y={20}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
                <button
                  onClick={onEnterStudio}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl btn-monolith-primary text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow-lg group"
                >
                  <span>Launch Brand Studio Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onLoadSample}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-obsidian-950/90 hover:bg-obsidian-900 text-zinc-200 border border-white/[0.1] hover:border-champagne-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-champagne-400" />
                  <span>Load PRGuard Fixture</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* SYSTEM STATUS FOOTER                                                      */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/[0.06] bg-obsidian-950/90 py-10 px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={50} y={16}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md overflow-hidden border border-champagne-500/30 bg-obsidian-950">
                <Image src="/logo.png" alt="KINTRA Logo" width={24} height={24} className="w-full h-full object-cover" />
              </div>
              <span className="text-zinc-300 font-bold">KINTRA™ Engine</span>
              <span>•</span>
              <span>Deterministic Causal Brand Intelligence</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Verified</span>
              </span>
              <span>•</span>
              <span>Version 2026.04</span>
              <span>•</span>
              <span className="text-zinc-400 hover:text-white cursor-pointer" onClick={onEnterStudio}>
                Brand Studio
              </span>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
};
