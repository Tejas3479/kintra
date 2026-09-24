import {
  CreativeIdentity,
  BrandPersonalityTrait,
  NamingTerritory,
  NamingCandidate,
  TaglineCandidate,
  VoiceSystem,
  VisualSystem,
} from '@/types/identity';
import { PositioningWorld } from '@/types/strategy';
import { IdeaBrief } from '@/types/brand';
import { EvidenceRecord } from '@/types/research';
import { AntiGenericNamer } from './anti-generic-namer';
import { DefaultImageGenerationProvider } from './image-provider';
import { IdentityConsistencyChecker } from './identity-consistency-checker';
import { logger } from '../logger';

export class IdentityService {
  /**
   * Generates a coherent creative identity derived directly from the approved Positioning World
   */
  static async generateIdentity(
    world: PositioningWorld,
    brief: IdeaBrief,
    _evidenceRecords: EvidenceRecord[] = []
  ): Promise<CreativeIdentity> {
    logger.info('Generating creative identity from approved Positioning World:', {
      worldId: world.id,
      archetype: world.archetype,
    });

    const isPurist = (world.archetype || '').includes('Purist');
    const isGatekeeper = (world.archetype || '').includes('Gatekeeper');

    // 1. BRAND PERSONALITY (3-5 traits)
    const personalityTraits: BrandPersonalityTrait[] = [
      {
        id: 'trait-rigor',
        name: isPurist ? 'Deterministic Rigor' : isGatekeeper ? 'Institutional Authority' : 'Flow Accelerator',
        definition: isPurist
          ? 'Refuses to speculate, hedge, or output probabilistic hunches. Speaks only in mathematically verifiable facts.'
          : isGatekeeper
          ? 'Unshakable policy certainty backed by cryptographic logs and audit compliance.'
          : 'Removes all developer friction with surgical speed and actionable clarity.',
        audienceRelevance: `Directly answers ${world.targetAudience} who distrust vague AI claims.`,
        strategicBasis: `Anchored in differentiator: "${world.differentiator}"`,
        behaviorExamples: [
          'Synthesizes an executable repro test case before filing any PR review comment.',
          'Limits comments to high-severity logic bugs; suppresses all subjective formatting debates.',
        ],
        traitToAvoid: 'Never post speculative warnings with "might", "could possibly", or "consider checking".',
        confidence: 0.95,
      },
      {
        id: 'trait-candor',
        name: 'Surgical Candor',
        definition: 'Communicates with zero corporate theater, zero decorative adjectives, and total transparency.',
        audienceRelevance: 'Senior engineers appreciate concise technical respect over patronizing encouragement.',
        strategicBasis: `Derived from emotional territory: "${world.emotionalTerritory}"`,
        behaviorExamples: [
          'State the flaw, the failing test line, and the proposed diff in under 40 words.',
          'Never use cheerleading phrases or emojis in critical code reviews.',
        ],
        traitToAvoid: 'Avoid cynical snark or condescending tone.',
        confidence: 0.92,
      },
      {
        id: 'trait-restraint',
        name: 'Earned Restraint',
        definition: 'Measures product value by what it refuses to say. The discipline of commenting less.',
        audienceRelevance: 'Addresses alert fatigue and noise blindness caused by legacy linters.',
        strategicBasis: `Upholds the sacrifice: "${world.tradeoffs.whatWeSacrifice}"`,
        behaviorExamples: [
          'Silently approves PRs that contain no logic flaws without demanding vanity interaction.',
          'Never exceeds 3 comments per PR.',
        ],
        traitToAvoid: 'Do not stay silent on genuine critical security vulnerabilities.',
        confidence: 0.94,
      },
      {
        id: 'trait-craft',
        name: 'Engineering Craft',
        definition: 'Obsessed with internal code beauty, deterministic reproducibility, and terminal elegance.',
        audienceRelevance: 'Resonates with developers who take deep personal pride in their codebase health.',
        strategicBasis: `Reinforces proof mechanism: "${world.proofMechanism}"`,
        behaviorExamples: [
          'Formats diff snippets cleanly with exact syntax highlighting and zero markdown bloat.',
          'Provides one-click copyable git commands to reproduce the issue locally.',
        ],
        traitToAvoid: 'Avoid academic pedantry that stalls production deployments.',
        confidence: 0.91,
      },
    ];

    // 2. NAMING TERRITORIES
    const namingTerritories: NamingTerritory[] = [
      {
        id: 'terr-precision',
        name: 'The Verifiable Mechanism',
        semanticLogic: 'Rooted in determinism, mathematical proof, and mechanical certainty.',
        phoneticLogic: 'Hard plosives (/k/, /t/, /p/) with crisp, monosyllabic or disyllabic cadence.',
        emotionalEffect: 'Invokes surgical mastery, precision instrumentation, and quiet confidence.',
        risks: 'Can feel overly rigid if not balanced by modern typographic craft.',
        categoryFit: 'Stands apart from generic security tools by sounding like an engineering compiler.',
        distinctivenessConsiderations: 'Avoids "Guard", "Shield", "Fortress" tropes completely.',
      },
      {
        id: 'terr-momentum',
        name: 'Velocity & Flow',
        semanticLogic: 'Derived from frictionless movement, clean pipelines, and unbroken focus.',
        phoneticLogic: 'Fluid sonorants (/m/, /n/, /l/) paired with sharp terminal consonants.',
        emotionalEffect: 'Generates momentum, calm flow states, and rapid release confidence.',
        risks: 'Could be mistaken for a generic task manager if value proposition is lost.',
        categoryFit: 'High resonance with startup teams shipping multiple times per day.',
        distinctivenessConsiderations: 'Rejects "-ify" and "-ly" suffixes in favor of grounded stems.',
      },
    ];

    // 3. NAMING CANDIDATES WITH ANTI-GENERIC AUDIT
    const rawNames = [
      {
        name: 'Kintra',
        territory: namingTerritories[0],
        rationale: 'Derived from kinetic and track. Expresses continuous momentum with deterministic rails.',
        semantic: 'Kinetic, track, integrity, focus.',
        pronunciation: 'KIN-truh',
        ambiguity: 'Clean disyllable; no conflicting homophones.',
        strategicFit: 'Embodies zero-fluff deterministic PR review engine.',
      },
      {
        name: 'AxiomPR',
        territory: namingTerritories[0],
        rationale: 'Axiom implies self-evident, mathematically established truth requiring no further proof.',
        semantic: 'Self-evident truth, formal logic, foundational certainty.',
        pronunciation: 'AK-see-um P-R',
        ambiguity: 'Contains explicit "PR" suffix; binds tightly to pull request category.',
        strategicFit: 'Communicates that review comments are mathematical axioms, not opinions.',
      },
      {
        name: 'Verifix',
        territory: namingTerritories[0],
        rationale: 'Portmanteau of verification and fix. Clear, punchy, diagnostic.',
        semantic: 'Verification, precision repair, deterministic check.',
        pronunciation: 'VER-ih-fiks',
        ambiguity: 'Slightly functional; risk of sounding like a static utility.',
        strategicFit: 'Promises that every finding comes with a verified reproducible fix.',
      },
      {
        name: 'PrismLogic',
        territory: namingTerritories[1],
        rationale: 'Separates dense, tangled code diffs into clean, observable constituent wavelengths.',
        semantic: 'Refraction, clarity, inspection, multi-spectrum analysis.',
        pronunciation: 'PRIZ-um LAH-jik',
        ambiguity: 'Two words; slightly longer URL footprint.',
        strategicFit: 'Highlights ability to expose hidden logic flaws through deep diff inspection.',
      },
      {
        name: 'ReviewOps',
        territory: namingTerritories[1],
        rationale: 'Attempts to frame PR review as an operational discipline like DevOps or DevSecOps.',
        semantic: 'Operations, infrastructure, process automation.',
        pronunciation: 'Reh-view-AHPS',
        ambiguity: 'Contains overused suffix "-ops".',
        strategicFit: 'Functional but lacks emotional resonance; intentionally included as comparative baseline.',
      },
    ];

    const namingCandidates: NamingCandidate[] = rawNames.map((item, idx) => {
      const audit = AntiGenericNamer.auditName(item.name, world.categoryFraming);
      return {
        id: `name-candidate-${idx + 1}`,
        name: item.name,
        territoryId: item.territory.id,
        territoryName: item.territory.name,
        rationale: item.rationale,
        semanticAssociation: item.semantic,
        pronunciation: item.pronunciation,
        possibleAmbiguity: item.ambiguity,
        genericnessRisk: audit.genericnessRisk,
        antiGenericFlags: audit.flags,
        strategicFit: item.strategicFit,
        confidence: audit.genericnessRisk === 'low' ? 0.94 : audit.genericnessRisk === 'medium' ? 0.82 : 0.65,
        status: idx === 0 ? 'selected' : 'candidate',
        legalDisclaimer:
          'Preliminary linguistic and phonetic analysis only. Not legal clearance or registered trademark clearance.',
      };
    });

    // 4. TAGLINE CANDIDATES (Tied to proof mechanism & explicit sacrifice)
    const taglineCandidates: TaglineCandidate[] = [
      {
        id: 'tag-1',
        tagline: 'Three comments or zero. Mathematically verifiable PR reviews.',
        supportingWorldId: world.id,
        strategicMechanism: 'Enforces the maximum 3-comment signal threshold and reproducible repro test proof.',
        falsifiabilityScore: 0.96,
        status: 'selected',
      },
      {
        id: 'tag-2',
        tagline: 'Never more noise than the bug itself.',
        supportingWorldId: world.id,
        strategicMechanism: 'Articulates the sacrifice of superficial styling advice in favor of critical logic integrity.',
        falsifiabilityScore: 0.88,
        status: 'candidate',
      },
      {
        id: 'tag-3',
        tagline: 'Deterministic pull request intelligence for teams that ship.',
        supportingWorldId: world.id,
        strategicMechanism: 'Frames the category precisely while affirming engineer velocity.',
        falsifiabilityScore: 0.84,
        status: 'candidate',
      },
    ];

    // 5. VOICE SYSTEM
    const voiceSystem: VoiceSystem = {
      tonalSliders: {
        precision: isPurist ? 92 : 80,
        warmth: 35, // Restrained, professional, never gushing
        authority: isGatekeeper ? 90 : 85,
        energy: 60, // Focused momentum, not manic hype
      },
      sentenceBehavior: {
        averageLength: 'concise',
        voicePreference: 'active_direct',
        cadenceDescription:
          'Staccato declarations followed by verifiable code evidence. Eliminates dependent filler clauses.',
      },
      vocabulary: {
        preferredTerms: [
          'deterministic',
          'verifiable',
          'signal-to-noise',
          'logic flaw',
          'reproducible test',
          'merging with certainty',
        ],
        technicalDensity: 'practitioner',
        signaturePhrases: [
          'Executable proof attached.',
          'Logic flaw isolated at line {n}.',
          'No other warnings found.',
        ],
      },
      bannedPatterns: [
        'supercharge your workflow',
        'next-gen AI copilot',
        'game-changer',
        'seamless integration',
        'easy-peasy',
        'might possibly be wrong',
      ],
      weSayVsWeAvoid: [
        {
          weSay: 'Line 42 throws NullPointerException when payload is empty. Repro unit test attached.',
          weAvoid: 'Hey team! Looks like there could maybe be a tiny bug here if you get a chance to check it out!',
          why: 'Developers respect unambiguous diagnostic proof over conversational fluff.',
        },
        {
          weSay: 'Zero logic flaws detected across 14 files. Ready to merge.',
          weAvoid: 'Awesome job rockstar! Your code is looking super clean and sparkly!',
          why: 'Eliminates patronizing cheerleader AI tropes that degrade tool credibility.',
        },
      ],
      examples: [
        {
          channel: 'pr_comment',
          sampleText:
            '**Critical Logic Flaw Detected** (`src/auth/session.ts:88`)\nConcurrent session invalidation causes race condition under >50 req/sec.\n`npm test tests/auth-race.test.ts` fails with code 1.\nSuggested fix: Wrap token revocation in Redis transaction.',
          annotation: 'Specific line, empirical repro command, actionable diff fix.',
        },
        {
          channel: 'hero_copy',
          sampleText: 'The deterministic PR reviewer that only comments when it has proof.',
          annotation: 'Immediate contrast against noisy SAST linters.',
        },
      ],
      channelAdaptations: {
        github_pr: 'High density, markdown code blocks, failing test reproduction snippet.',
        terminal_cli: 'Monospace ANSI summary, exit code 0 or 1, single-line error locator.',
        executive_summary: 'Turnaround latency reduction metrics and zero-false-alarm audit score.',
      },
    };

    // 6. VISUAL SYSTEM
    const visualSystem: VisualSystem = {
      palette: {
        primary: {
          name: 'Obsidian Zinc',
          hex: '#09090b',
          role: 'Foundational terminal backdrop and structural surfaces.',
          contrastOnDark: 'Base background',
        },
        secondary: {
          name: 'Graphite Wire',
          hex: '#27272a',
          role: 'Hairline grid borders, divider lines, and card containers.',
          contrastOnDark: '3.1:1 subtle contour',
        },
        accent: {
          name: 'Verifiable Emerald',
          hex: isPurist ? '#10b981' : isGatekeeper ? '#06b6d4' : '#6366f1',
          role: 'Approval state, verified proof badges, and primary action indicators.',
          contrastOnDark: '7.8:1 high legibility',
        },
        neutralDark: {
          name: 'Charcoal Depth',
          hex: '#18181b',
          role: 'Elevated inspectable code blocks and ledger cards.',
          contrastOnDark: 'Surface elevation',
        },
        neutralLight: {
          name: 'Pure Terminal White',
          hex: '#fafafa',
          role: 'Primary technical copy and headline typography.',
          contrastOnDark: '16.5:1 maximum contrast',
        },
        semantic: {
          success: { name: 'Verified Proof', hex: '#10b981', role: 'Passing tests', contrastOnDark: '7.8:1' },
          warning: { name: 'Ambiguity Alert', hex: '#f59e0b', role: 'Assumption unverified', contrastOnDark: '8.2:1' },
          error: { name: 'Logic Flaw', hex: '#ef4444', role: 'Critical bug repro', contrastOnDark: '6.4:1' },
        },
      },
      typography: {
        headline: {
          family: 'Inter, system-ui, sans-serif',
          weights: ['600', '700', '800'],
          category: 'sans',
          rationale: 'Crisp neo-grotesque legibility at large display sizes without quirky serifs.',
        },
        body: {
          family: 'Inter, system-ui, sans-serif',
          weights: ['400', '500'],
          category: 'sans',
          rationale: 'Neutral, highly legible text rendering across diverse monitors.',
        },
        code: {
          family: 'JetBrains Mono, ui-monospace, monospace',
          weights: ['400', '600'],
          category: 'mono',
          rationale: 'Explicit monospace code readability with clear distinction between 0 and O, 1 and l.',
        },
        scaleNotes: 'Strict modular scale (12px, 14px, 16px, 20px, 28px, 36px) optimized for high information density.',
      },
      shapes: {
        borderRadius: isPurist ? 'rounded-lg' : 'rounded-xl',
        geometryNotes: 'Surgical rectangular surfaces with sharp 1px hairline graphite borders. Zero bubble pills.',
        borderStyle: 'border border-zinc-800',
      },
      layoutBehavior: {
        density: 'compact',
        gridPrinciples: 'Subtle 24px baseline technical coordinate grid with inspectable telemetry strips.',
      },
      imagery: {
        artDirection: 'High-contrast dark terminal telemetry; technical schematics over lifestyle stock photography.',
        renderingStyle: 'Precision vector geometry, wireframe coordinates, and real code diff views.',
        contrastLevel: 'Ultra-high contrast dark mode.',
      },
      texture: {
        surface: 'Matte technical composite with subtle 1px grid guides.',
        grainLevel: 'Subtle 2% film grain on dark canvas to prevent color banding.',
        glassmorphism: false, // Explicitly false: engineering purism avoids heavy blur gimmicks
      },
      motionPrinciples: {
        timing: '150ms - 200ms',
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        purpose: 'Instant snap transitions and mechanical confirmation. Zero bouncy cartoon springs.',
      },
      visualMetaphors: [
        'The surgical crosshair (precision targeting)',
        'The coordinate grid (verifiable rails)',
        'The terminal diff (tangible truth)',
      ],
      thingsToAvoid: [
        'Vibrant neon gradient blobs',
        'Curved cartoon characters or 3D mascots',
        'Soft pastel baby tones',
        'Floating glowing orbs without functional meaning',
      ],
    };

    // 7. GENERATE INITIAL VISUAL ASSET (Image Provider Abstraction)
    const imageProvider = new DefaultImageGenerationProvider();
    const visualResult = await imageProvider.generateVisual({
      positioningArchetype: world.archetype,
      brandName: namingCandidates[0].name,
      tagline: taglineCandidates[0].tagline,
      primaryHex: visualSystem.palette.primary.hex,
      secondaryHex: visualSystem.palette.secondary.hex,
      accentHex: visualSystem.palette.accent.hex,
      visualMetaphors: visualSystem.visualMetaphors,
      audience: world.targetAudience,
      borderRadius: visualSystem.shapes.borderRadius,
      assetType: 'brand_mark',
    });

    // 8. AUDIT CONSISTENCY
    const consistencyConflicts = IdentityConsistencyChecker.auditConsistency({
      selectedName: namingCandidates[0],
      selectedTagline: taglineCandidates[0],
      voiceSystem,
      visualSystem,
      positioningWorld: world,
    });

    return {
      personalityTraits,
      namingTerritories,
      namingCandidates,
      selectedNameId: namingCandidates[0].id,
      taglineCandidates,
      selectedTaglineId: taglineCandidates[0].id,
      voiceSystem,
      visualSystem,
      generatedVisuals: visualResult.asset ? [visualResult.asset] : [],
      consistencyConflicts,
      status: 'under_review',
    };
  }
}
