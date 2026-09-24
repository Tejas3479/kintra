import { describe, it, expect } from 'vitest';
import {
  CanonicalBrandStateSchema,
  IdeaBriefSchema,
  ExtractedFactSchema,
  HypothesisSchema,
  InterviewQuestionSchema,
} from '@/lib/schemas/brand-schemas';
import {
  BrandPersonalityTraitSchema,
  NamingCandidateSchema,
} from '@/lib/schemas/identity-schemas';
import {
  ArtifactValidationReportSchema,
  BrandArtifactSchema,
} from '@/lib/schemas/guardian-schemas';
import { INITIAL_DEMO_PROJECT, DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';

describe('Canonical Brand State & Domain Schemas', () => {
  it('should validate the initial demo brand state cleanly', () => {
    const result = CanonicalBrandStateSchema.safeParse(INITIAL_DEMO_PROJECT);
    expect(result.success).toBe(true);
  });

  it('should validate an IdeaBrief object cleanly', () => {
    const result = IdeaBriefSchema.safeParse(DEMO_BRAND_PRGUARD.ideaBrief);
    expect(result.success).toBe(true);
  });

  it('should reject malformed or incomplete ExtractedFact objects', () => {
    const malformed = {
      id: 'fact-1',
      // missing statement
      confidence: 1.5, // invalid confidence > 1
      verifiedByUser: 'yes', // should be boolean
    };
    const result = ExtractedFactSchema.safeParse(malformed);
    expect(result.success).toBe(false);
  });

  it('should reject invalid Hypothesis risk levels', () => {
    const invalidHyp = {
      id: 'hyp-1',
      claim: 'Target customers need this.',
      riskLevel: 'catastrophic', // invalid enum
      potentialConsequenceIfFalse: 'Failure',
      status: 'untested',
    };
    const result = HypothesisSchema.safeParse(invalidHyp);
    expect(result.success).toBe(false);
  });

  it('should validate InterviewQuestion structure with whyAsking rationale', () => {
    const validQuestion = {
      id: 'q-test-1',
      topic: 'audience',
      question: 'Who will use this product every day?',
      whyAsking: 'Ensures brand voice resonates with the actual end user rather than just the economic buyer.',
      answerType: 'text',
      skipped: false,
    };
    const result = InterviewQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it('should reject InterviewQuestion if whyAsking is too short or missing', () => {
    const invalidQuestion = {
      id: 'q-test-2',
      topic: 'audience',
      question: 'Who will use this?',
      whyAsking: 'Short', // too short (< 10 chars)
      answerType: 'text',
      skipped: false,
    };
    const result = InterviewQuestionSchema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('should validate Creative Identity Personality, Naming, Voice, and Visual schemas', () => {
    const validTrait = {
      id: 'trait-1',
      name: 'Deterministic Rigor',
      definition: 'Refuses to guess or present speculative findings without mathematical proof.',
      audienceRelevance: 'Builds deep trust with cynical senior staff engineers and architects.',
      strategicBasis: 'Directly reinforces the zero-fluff, zero-false-alarm positioning.',
      behaviorExamples: ['Only comments when an executable unit test reproduces the bug.'],
      traitToAvoid: 'Never nitpick code style or post speculative warnings.',
      confidence: 0.95,
    };
    expect(BrandPersonalityTraitSchema.safeParse(validTrait).success).toBe(true);

    const validCandidate = {
      id: 'name-1',
      name: 'Kintra',
      territoryId: 'terr-1',
      territoryName: 'Precision Mechanisms',
      rationale: 'Derived from kinetic and track, symbolizing determinism and momentum.',
      semanticAssociation: 'Movement, certainty, flow.',
      pronunciation: 'KIN-truh',
      possibleAmbiguity: 'None detected.',
      genericnessRisk: 'low' as const,
      antiGenericFlags: [],
      strategicFit: 'Perfect match for deterministic PR intelligence.',
      confidence: 0.92,
      status: 'candidate' as const,
      legalDisclaimer: 'Preliminary linguistic and phonetic analysis only. Not legal clearance.',
    };
    expect(NamingCandidateSchema.safeParse(validCandidate).success).toBe(true);
  });

  it('should validate Consistency Guardian BrandArtifact and ArtifactValidationReport schemas', () => {
    const validReport = {
      id: 'rep-1',
      artifactId: 'art-1',
      evaluatedAt: new Date().toISOString(),
      passed: true,
      totalFindings: 1,
      blockingFindingsCount: 0,
      dimensions: {
        strategic_alignment: {
          dimension: 'strategic_alignment' as const,
          label: 'Strategic Alignment',
          status: 'pass' as const,
          score: 95,
          rationale: 'Perfect alignment with approved value proposition.',
          findingsCount: 0,
          criticalIssues: [],
        },
        audience_alignment: {
          dimension: 'audience_alignment' as const,
          label: 'Audience Alignment',
          status: 'pass' as const,
          score: 90,
          rationale: 'Addresses senior engineers directly.',
          findingsCount: 0,
          criticalIssues: [],
        },
        voice_alignment: {
          dimension: 'voice_alignment' as const,
          label: 'Voice Alignment',
          status: 'warning' as const,
          score: 80,
          rationale: 'Minor passive phrasing detected.',
          findingsCount: 1,
          criticalIssues: [],
        },
        message_alignment: {
          dimension: 'message_alignment' as const,
          label: 'Message Alignment',
          status: 'pass' as const,
          score: 95,
          rationale: 'Reinforces zero-noise guarantee.',
          findingsCount: 0,
          criticalIssues: [],
        },
        visual_alignment: {
          dimension: 'visual_alignment' as const,
          label: 'Visual Alignment',
          status: 'pass' as const,
          score: 100,
          rationale: 'Monospace aesthetic and sharp corners respected.',
          findingsCount: 0,
          criticalIssues: [],
        },
        distinctiveness: {
          dimension: 'distinctiveness' as const,
          label: 'Distinctiveness',
          status: 'pass' as const,
          score: 90,
          rationale: 'Zero startup cliches or buzzwords.',
          findingsCount: 0,
          criticalIssues: [],
        },
        unsupported_claims: {
          dimension: 'unsupported_claims' as const,
          label: 'Unsupported Claim Risk',
          status: 'pass' as const,
          score: 100,
          rationale: 'No unprovable absolutes.',
          findingsCount: 0,
          criticalIssues: [],
        },
        contradiction_risk: {
          dimension: 'contradiction_risk' as const,
          label: 'Contradiction Risk',
          status: 'pass' as const,
          score: 100,
          rationale: 'Preserves sacrifice of non-technical teams.',
          findingsCount: 0,
          criticalIssues: [],
        },
        brand_rule_violations: {
          dimension: 'brand_rule_violations' as const,
          label: 'Brand Rule Violations',
          status: 'pass' as const,
          score: 100,
          rationale: 'Zero banned pattern violations.',
          findingsCount: 0,
          criticalIssues: [],
        },
      },
      findings: [
        {
          id: 'find-1',
          dimension: 'voice_alignment' as const,
          issue: 'Passive phrasing weakens direct surgical tone',
          severity: 'low' as const,
          violatedRule: 'Prefer active direct voice over passive hedging',
          evidence: 'was reviewed by the bot',
          explanation: {
            whatIsWrong: 'Sentence uses passive construction.',
            whyItMatters: 'Senior engineers respect active, definitive statements.',
            whichDecisionConflicts: 'Brand Voice Sentence Behavior',
            howToCorrect: 'Change to active voice: "the bot reviewed the PR".',
          },
          suggestedRepair: 'the engine analyzed the diff',
          status: 'open' as const,
        },
      ],
      summary: 'Artifact aligns strongly with brand boundaries with 1 minor voice refinement suggested.',
    };

    const validArtifact = {
      id: 'art-1',
      name: 'Website Headline V1',
      artifactType: 'website_headline' as const,
      content: 'Three comments or zero. Mathematically verifiable PR reviews.',
      targetAudience: 'Staff Engineers',
      versionHistory: [
        {
          version: 1,
          content: 'Three comments or zero. Mathematically verifiable PR reviews.',
          editedAt: new Date().toISOString(),
          editedBy: 'user' as const,
        },
      ],
      validationReport: validReport,
      status: 'approved' as const,
      isApproved: true,
      isLocked: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(ArtifactValidationReportSchema.safeParse(validReport).success).toBe(true);
    expect(BrandArtifactSchema.safeParse(validArtifact).success).toBe(true);
  });
});
