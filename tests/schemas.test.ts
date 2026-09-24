import { describe, it, expect } from 'vitest';
import {
  CanonicalBrandStateSchema,
  IdeaBriefSchema,
  ExtractedFactSchema,
  HypothesisSchema,
  InterviewQuestionSchema,
} from '@/lib/schemas/brand-schemas';
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
});
