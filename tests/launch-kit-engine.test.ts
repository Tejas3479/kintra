import { describe, it, expect } from 'vitest';
import { LaunchKitEngine } from '../src/lib/launch-kit/launch-kit-engine';
import { LaunchKitSchema } from '../src/lib/schemas/launch-kit-schemas';
import { CanonicalBrandState } from '../src/types/brand';
import { INITIAL_DEMO_PROJECT } from '../src/fixtures/demo-brands';

describe('LaunchKitEngine Suite (Prompt 11)', () => {
  const mockState: CanonicalBrandState = {
    ...INITIAL_DEMO_PROJECT,
    selectedWorldId: 'world-purist',
    positioningWorlds: [
      {
        id: 'world-purist',
        title: 'The Engineering Purist',
        archetype: 'The Engineering Purist',
        targetAudience: 'Senior Infrastructure & Security Engineers',
        problemFraming: 'Probabilistic AI models introduce silent logic hallucinations into pull requests.',
        valueProposition: 'Deterministic pull request verification with zero code egress and compiler-grade AST proofs.',
        differentiator: 'Deterministic multi-file AST semantic diff analysis',
        categoryFraming: 'Causal Pull Request Verification Engine',
        emotionalTerritory: 'Surgical confidence and uncompromising rigor',
        proofMechanism: 'Deterministic compiler invariant checking',
        supportingEvidenceIds: ['ev-ast-1'],
        assumptions: ['Engineers reject black-box AI'],
        risks: ['Steeper learning curve'],
        tradeoffs: {
          whatWeEmphasize: 'Deterministic correctness and code privacy',
          whatWeSacrifice: 'Flashy superficial AI chat assistants',
        },
        challenges: [],
        status: 'selected',
      },
    ],
    creativeIdentity: {
      selectedWorldId: 'world-purist',
      selectedNameId: 'name-kintra-1',
      selectedTaglineId: 'tagline-kintra-1',
      namingTerritories: [],
      namingCandidates: [
        {
          id: 'name-kintra-1',
          name: 'Kintra',
          territory: 'Structural Precision',
          pronunciation: 'KIN-trah',
          rationale: 'Kinship + intransitive verification',
          semanticAssociation: 'Precision, kinship',
          ambiguityRisk: 'Low',
          genericnessRisk: 'Low',
          strategicFitScore: 0.95,
          confidence: 0.92,
        },
      ],
      taglineCandidates: [
        {
          id: 'tagline-kintra-1',
          tagline: 'Deterministic pull request intelligence',
          strategicAlignment: 'High',
          emotionalResonance: 'Authoritative',
        },
      ],
      personalityTraits: [
        {
          id: 'trait-surgical-rigor',
          name: 'Surgical Rigor',
          definition: 'Every claim is backed by deterministic AST traces.',
          audienceRelevance: 'Senior engineers distrust unsubstantiated claims.',
          strategicBasis: 'Eliminates marketing fluff.',
          behaviorExamples: ['Show AST traces directly in PR comments.'],
          traitToAvoid: 'Marketing hype and subjective guarantees.',
          confidence: 0.96,
        },
      ],
      voiceSystem: {
        tonalRegister: 'Direct, unadorned engineering precision',
        vocabularyList: ['deterministic', 'AST diff', 'telemetry', 'invariant'],
        bannedWords: ['supercharge', 'revolutionary', 'game-changing', 'copilot'],
        tonalSliders: {
          formality: 0.8,
          warmth: 0.3,
          technicalDepth: 0.95,
          boldness: 0.85,
        },
        syntaxRules: ['Use active voice', 'Cite inspectable diff traces'],
      },
      visualStyle: {
        primaryColor: '#09090b',
        secondaryColor: '#4f46e5',
        accentColor: '#10b981',
        backgroundStyle: 'Terminal Deep Obsidian Dark Mode',
        typography: {
          headingFont: 'Space Grotesk',
          bodyFont: 'Inter',
          monoFont: 'JetBrains Mono',
        },
        uiStyling: {
          cornerRadius: '6px',
          borderWeight: '1px',
          shadowStyle: 'subtle',
          density: 'compact',
        },
        artDirectionRationale: 'Inspired by modern command-line utilities and IDE diagnostic panels.',
      },
      visualAssets: [],
    },
    decisionGraph: {
      nodes: {
        'node-target-niche': {
          id: 'node-target-niche',
          category: 'target_niche',
          title: 'Target Audience Decision',
          approvedValue: 'Senior Infrastructure & Security Engineers',
          rationale: 'High willingness to pay for verifiable code security',
          evidenceIds: ['ev-ast-1'],
          rejectedAlternatives: [],
          status: 'approved',
          confidence: 0.9,
          version: 1,
        },
        'node-proof-model': {
          id: 'node-proof-model',
          category: 'proof_model',
          title: 'AST Proof Verification Model',
          approvedValue: 'Deterministic compiler invariant checking',
          rationale: 'Eliminates probabilistic false alarms',
          evidenceIds: ['ev-ast-1'],
          rejectedAlternatives: [],
          status: 'approved',
          confidence: 0.95,
          version: 1,
        },
      },
      edges: [],
    },
  };

  it('generates a complete LaunchKit conforming to LaunchKitSchema with all 8 artifact types', () => {
    const kit = LaunchKitEngine.generateLaunchKit(mockState);

    // Schema validation
    const parsed = LaunchKitSchema.safeParse(kit);
    expect(parsed.success).toBe(true);

    // Artifact items verification
    expect(kit.items).toHaveLength(8);
    const types = kit.items.map((i) => i.type);
    expect(types).toContain('one_line_pitch');
    expect(types).toContain('homepage_hero');
    expect(types).toContain('homepage_supporting_copy');
    expect(types).toContain('launch_announcement');
    expect(types).toContain('social_post');
    expect(types).toContain('launch_email');
    expect(types).toContain('elevator_pitch');
    expect(types).toContain('brand_summary');

    // Content verification
    const pitch = kit.items.find((i) => i.type === 'one_line_pitch');
    expect(pitch?.content).toContain('Kintra');
    expect(pitch?.content).toContain('Deterministic pull request intelligence');

    // Lineage verification
    kit.items.forEach((item) => {
      expect(item.lineage.worldId).toBe('world-purist');
      expect(item.lineage.worldArchetype).toBe('The Engineering Purist');
      expect(item.lineage.governingDecisionIds).toContain('node-target-niche');
      expect(item.lineage.governingDecisionIds).toContain('node-proof-model');
      expect(item.lineage.identityTraitIds).toContain('trait-surgical-rigor');
      expect(item.lineage.evidenceIds).toContain('ev-ast-1');
    });
  });

  it('generates rich, usable BrandGuidelines with positioning, voice, visual, and do/dont examples', () => {
    const kit = LaunchKitEngine.generateLaunchKit(mockState);
    const { guidelines } = kit;

    expect(guidelines.brandName).toBe('Kintra');
    expect(guidelines.positioning.archetype).toBe('The Engineering Purist');
    expect(guidelines.personality.traits).toHaveLength(1);
    expect(guidelines.personality.traits[0].name).toBe('Surgical Rigor');

    // Voice & Banned words
    expect(guidelines.voice.vocabularyRules.forbiddenWords).toContain('supercharge');
    expect(guidelines.voice.vocabularyRules.preferredWords).toContain('deterministic');

    // Visual direction
    expect(guidelines.visualDirection.primaryColor).toBe('#09090b');
    expect(guidelines.visualDirection.typographyPairing.monoFont).toBe('JetBrains Mono');

    // Naming & Pronunciation
    expect(guidelines.naming.approvedName).toBe('Kintra');
    expect(guidelines.naming.pronunciation).toBe('KIN-trah');

    // Do & Don't examples
    expect(guidelines.doAndDontExamples.length).toBeGreaterThanOrEqual(5);
    const headlineExample = guidelines.doAndDontExamples.find((e) => e.category === 'Headline Copy');
    expect(headlineExample).toBeDefined();
    expect(headlineExample?.dontExample).toContain('10x developer');
  });

  it('exports formatted Markdown Brand Book containing all major sections', () => {
    const kit = LaunchKitEngine.generateLaunchKit(mockState);
    const md = LaunchKitEngine.exportToMarkdown(kit);

    expect(typeof md).toBe('string');
    expect(md).toContain('# KINTRA — BRAND BOOK & LAUNCH KIT');
    expect(md).toContain('## TABLE OF CONTENTS');
    expect(md).toContain('## 1. BRAND POSITIONING & STRATEGIC THESIS');
    expect(md).toContain('## 2. PERSONALITY TRAITS');
    expect(md).toContain('## 3. VOICE & TONAL GUIDELINES');
    expect(md).toContain('## 4. VISUAL IDENTITY & DESIGN DIRECTION');
    expect(md).toContain('## 5. NAMING & PRONUNCIATION RULES');
    expect(md).toContain('## 6. CORE USAGE PRINCIPLES');
    expect(md).toContain('## 7. DO AND DON\'T EDITORIAL MATRIX');
    expect(md).toContain('## 8. COMPLETE LAUNCH KIT ARTIFACTS');
    expect(md).toContain('## 9. CAUSAL LINEAGE & VERIFICATION LEDGER');
  });

  it('exports formatted JSON that parses back into valid LaunchKit data', () => {
    const kit = LaunchKitEngine.generateLaunchKit(mockState);
    const jsonStr = LaunchKitEngine.exportToJson(kit);

    const parsed = JSON.parse(jsonStr);
    const validated = LaunchKitSchema.safeParse(parsed);
    expect(validated.success).toBe(true);
    expect(parsed.brandName).toBe('Kintra');
    expect(parsed.items).toHaveLength(8);
  });
});
