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
});
