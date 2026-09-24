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
      selectedNameId: 'name-kintra-1',
      selectedTaglineId: 'tagline-kintra-1',
      namingTerritories: [],
      namingCandidates: [
        {
          id: 'name-kintra-1',
          name: 'Kintra',
          territoryId: 't-structural',
          territoryName: 'Structural Precision',
          pronunciation: 'KIN-trah',
          rationale: 'Kinship + intransitive verification',
          semanticAssociation: 'Precision, kinship',
          possibleAmbiguity: 'None',
          genericnessRisk: 'low',
          antiGenericFlags: ['non-dictionary', 'morpheme-blend'],
          strategicFit: 'Perfect match for engineering rigor',
          confidence: 0.92,
          status: 'selected',
          legalDisclaimer: 'Current preliminary check, not legal clearance',
        },
      ],
      taglineCandidates: [
        {
          id: 'tagline-kintra-1',
          tagline: 'Deterministic pull request intelligence',
          supportingWorldId: 'world-purist',
          strategicMechanism: 'AST compiler invariant analysis',
          falsifiabilityScore: 0.95,
          status: 'selected',
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
        tonalSliders: {
          precision: 95,
          warmth: 30,
          authority: 85,
          energy: 60,
        },
        sentenceBehavior: {
          averageLength: 'concise',
          voicePreference: 'active_direct',
          cadenceDescription: 'Direct, unadorned engineering precision',
        },
        vocabulary: {
          preferredTerms: ['deterministic', 'AST diff', 'telemetry', 'invariant'],
          technicalDensity: 'practitioner',
          signaturePhrases: ['Verify invariants before merge'],
        },
        bannedPatterns: ['supercharge', 'revolutionary', 'game-changing', 'copilot'],
        weSayVsWeAvoid: [],
        examples: [],
        channelAdaptations: {},
      },
      visualSystem: {
        palette: {
          primary: { name: 'Obsidian', hex: '#09090b', role: 'base', contrastOnDark: '1.0' },
          secondary: { name: 'Indigo', hex: '#4f46e5', role: 'accent', contrastOnDark: '4.5' },
          accent: { name: 'Emerald', hex: '#10b981', role: 'invariant', contrastOnDark: '7.0' },
          neutralDark: { name: 'Dark', hex: '#18181b', role: 'surface', contrastOnDark: '1.2' },
          neutralLight: { name: 'Light', hex: '#fafafa', role: 'text', contrastOnDark: '12.0' },
          semantic: {
            success: { name: 'Success', hex: '#10b981', role: 'success', contrastOnDark: '7.0' },
            warning: { name: 'Warning', hex: '#f59e0b', role: 'warning', contrastOnDark: '6.0' },
            error: { name: 'Error', hex: '#ef4444', role: 'error', contrastOnDark: '5.0' },
          },
        },
        typography: {
          headline: { family: 'Space Grotesk', weights: ['600', '700'], category: 'sans', rationale: 'Precise geometry' },
          body: { family: 'Inter', weights: ['400', '500'], category: 'sans', rationale: 'Clean readability' },
          code: { family: 'JetBrains Mono', weights: ['400', '600'], category: 'mono', rationale: 'Terminal telemetry' },
          scaleNotes: '1.25 major third',
        },
        shapes: {
          borderRadius: '6px',
          geometryNotes: 'Sharp, disciplined corners',
          borderStyle: '1px solid',
        },
        layoutBehavior: { density: 'compact', gridPrinciples: 'Strict 4px baseline' },
        imagery: { artDirection: 'Terminal Deep Obsidian Dark Mode', renderingStyle: 'clean vector', contrastLevel: 'high' },
        texture: { surface: 'matte', grainLevel: 'none', glassmorphism: false },
        motionPrinciples: { timing: '150ms', easing: 'ease-out', purpose: 'immediate feedback' },
        visualMetaphors: ['Compilers', 'AST graphs'],
        thingsToAvoid: ['Drop shadows', 'Gradients'],
      },
      generatedVisuals: [],
      consistencyConflicts: [],
      status: 'approved',
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
          tradeoff: 'Prioritize security-critical buyers over general hobbyists',
          dependsOn: [],
          governs: ['node-proof-model'],
          status: 'approved',
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
          tradeoff: 'Strict mathematical correctness over conversational flexibility',
          dependsOn: ['node-target-niche'],
          governs: [],
          status: 'approved',
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
