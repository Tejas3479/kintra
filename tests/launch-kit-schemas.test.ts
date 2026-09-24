import { describe, it, expect } from 'vitest';
import {
  LaunchKitSchema,
  LaunchKitItemSchema,
  BrandGuidelinesSchema,
  DoDontExampleSchema,
} from '../src/lib/schemas/launch-kit-schemas';
import { LaunchKit, LaunchKitItem, BrandGuidelines } from '../src/types/launch-kit';

describe('Launch Kit Schemas Suite (Prompt 11)', () => {
  const mockLineage = {
    worldId: 'world-purist-1',
    worldArchetype: 'The Engineering Purist',
    governingDecisionIds: ['node-target-niche', 'node-proof-model'],
    identityTraitIds: ['trait-surgical-rigor'],
    evidenceIds: ['ev-ast-bench-1'],
    generatedAt: new Date().toISOString(),
  };

  const mockItem: LaunchKitItem = {
    id: 'item-pitch-1',
    type: 'one_line_pitch',
    title: 'One-Line Pitch',
    summary: 'Concise executive thesis',
    content: 'Deterministic AST pull request verification for mission-critical software teams.',
    suggestedChannels: ['GitHub README', 'Product Hunt', 'Investor One-Pager'],
    targetAudience: 'Lead Software Engineers & Staff Architects',
    lineage: mockLineage,
  };

  const mockGuidelines: BrandGuidelines = {
    brandName: 'Kintra',
    tagline: 'Deterministic pull request intelligence',
    version: '1.0.0',
    positioning: {
      archetype: 'The Engineering Purist',
      targetAudience: 'Senior Engineers & Technical Founders',
      problemFraming: 'Probabilistic LLMs hallucinate false positives in code reviews.',
      valueProposition: 'Verifiable AST-backed pull request guarantees with zero telemetry egress.',
      differentiator: 'Deterministic multi-file semantic diff analysis',
      proofMechanism: 'Open-source AST verification engine',
      categoryFraming: 'Causal Pull Request Verification Engine',
    },
    personality: {
      traits: [
        {
          name: 'Surgical Rigor',
          definition: 'Every statement is backed by inspectable telemetry.',
          behavior: 'Show AST traces rather than subjective opinions.',
          avoid: 'Speculative buzzwords and marketing hype.',
        },
      ],
    },
    messaging: {
      coreMessage: 'Code correctness cannot be left to probabilistic guessing.',
      pillars: [
        {
          pillar: 'Deterministic Guarantees',
          proof: 'Compiler-level invariant checking on every pull request.',
        },
      ],
      bannedBuzzwords: ['supercharge', '10x', 'magic', 'copilot'],
    },
    voice: {
      tonalRegister: 'Direct, unadorned engineering precision',
      attributes: ['Precise', 'Authoritative', 'Restrained'],
      vocabularyRules: {
        preferredWords: ['deterministic', 'AST diff', 'telemetry', 'invariant'],
        forbiddenWords: ['supercharge', 'revolutionary', 'game-changing'],
      },
    },
    visualDirection: {
      primaryColor: '#09090b',
      secondaryColor: '#4f46e5',
      accentColor: '#10b981',
      backgroundStyle: 'Terminal Deep Obsidian Dark Mode',
      typographyPairing: {
        headingFont: 'Space Grotesk',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono',
      },
      uiCornerRadius: '6px',
      logoRules: 'Never add drop shadows or gradients to the monospaced mark.',
    },
    naming: {
      approvedName: 'Kintra',
      pronunciation: 'KIN-trah',
      semanticRationale: 'Derived from kinship (trust among peers) and intransitive rigor.',
      usageRules: ['Always capitalize the initial K', 'Never append lowercase .ai in formal prose'],
    },
    usagePrinciples: [
      'Empower the developer; never obscure diagnostic logs.',
      'Prefer understatement backed by evidence over bold assertions.',
    ],
    doAndDontExamples: [
      {
        category: 'Headline Copy',
        doExample: 'Deterministic pull request verification for mission-critical codebases.',
        dontExample: 'Supercharge your team with the magical 10x AI copilot!',
        explanation: 'Avoid cheap marketing hype and unsubstantiated claims.',
      },
    ],
  };

  it('validates a valid LaunchKitItem', () => {
    const parsed = LaunchKitItemSchema.safeParse(mockItem);
    expect(parsed.success).toBe(true);
  });

  it('validates a valid BrandGuidelines specification', () => {
    const parsed = BrandGuidelinesSchema.safeParse(mockGuidelines);
    expect(parsed.success).toBe(true);
  });

  it('validates a complete 8-item LaunchKit conforming to LaunchKitSchema', () => {
    const requiredTypes = [
      'one_line_pitch',
      'homepage_hero',
      'homepage_supporting_copy',
      'launch_announcement',
      'social_post',
      'launch_email',
      'elevator_pitch',
      'brand_summary',
    ] as const;

    const fullKit: LaunchKit = {
      id: 'kit-kintra-1',
      projectId: 'proj-kintra-demo',
      brandName: 'Kintra',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      items: requiredTypes.map((type, idx) => ({
        ...mockItem,
        id: `item-${type}-${idx}`,
        type,
        title: type.replace(/_/g, ' ').toUpperCase(),
      })),
      guidelines: mockGuidelines,
    };

    const parsed = LaunchKitSchema.safeParse(fullKit);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.items).toHaveLength(8);
      expect(parsed.data.guidelines.doAndDontExamples).toHaveLength(1);
    }
  });

  it('fails validation when fewer than 8 artifacts are provided in LaunchKit', () => {
    const incompleteKit = {
      id: 'kit-incomplete',
      projectId: 'proj-demo',
      brandName: 'Kintra',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      items: [mockItem], // only 1 item, requires at least 8
      guidelines: mockGuidelines,
    };

    const parsed = LaunchKitSchema.safeParse(incompleteKit);
    expect(parsed.success).toBe(false);
  });
});
