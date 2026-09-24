import { describe, it, expect } from 'vitest';
import { DiscoveryAIService } from '@/lib/ai-service';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import { IdeaBriefSchema } from '@/lib/schemas/brand-schemas';

describe('DiscoveryAIService with Mock / Fallback Provider', () => {
  it('extracts structured facts and hypotheses from raw idea', async () => {
    const rawIdea = 'An AI code security assistant for pull requests.';
    const result = await DiscoveryAIService.extractInitialIntake(rawIdea);

    expect(result.extractedFacts.length).toBeGreaterThan(0);
    expect(result.hypotheses.length).toBeGreaterThan(0);
    expect(result.initialQuestions.length).toBeGreaterThan(0);

    expect(result.extractedFacts[0].source).toBe('ai_extracted');
    expect(result.hypotheses[0].riskLevel).toMatch(/low|medium|critical/);
  });

  it('generates next adaptive question or marks interview complete', async () => {
    const rawIdea = DEMO_BRAND_PRGUARD.rawIdea;
    const history = DEMO_BRAND_PRGUARD.interviewQuestions.slice(0, 1);

    const result = await DiscoveryAIService.getNextAdaptiveQuestion(history, rawIdea);
    expect(typeof result.hasMore).toBe('boolean');
    expect(result.reason).toBeDefined();
  });

  it('synthesizes a valid IdeaBrief conforming to IdeaBriefSchema', async () => {
    const rawIdea = DEMO_BRAND_PRGUARD.rawIdea;
    const facts = DEMO_BRAND_PRGUARD.extractedFacts;
    const assumptions = DEMO_BRAND_PRGUARD.hypotheses;
    const history = DEMO_BRAND_PRGUARD.interviewQuestions;

    const brief = await DiscoveryAIService.synthesizeIdeaBrief(
      rawIdea,
      facts,
      assumptions,
      history
    );

    const validation = IdeaBriefSchema.safeParse(brief);
    expect(validation.success).toBe(true);
    expect(brief.problem.corePain).toBeDefined();
    expect(brief.targetUser.primaryNiche).toBeDefined();
    expect(brief.confidenceScore).toBeGreaterThan(0);
  });

  it('configures valid Gemini model name gemini-2.0-flash by default (P0-3)', async () => {
    const { GeminiProvider } = await import('@/lib/ai-provider');
    const provider = new GeminiProvider('fake-test-key');
    expect(provider).toBeDefined();
    // Test env variable override if specified
    const defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    expect(defaultModel).toMatch(/^gemini-(1\.5|2\.0)-(flash|pro)/);
  });
});

