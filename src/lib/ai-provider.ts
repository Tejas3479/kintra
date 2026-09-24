import { z } from 'zod';
import { getServerEnv } from './env';
import { logger } from './logger';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import {
  IntakeExtractionOutputSchema,
  NextAdaptiveQuestionOutputSchema,
  IdeaBriefSchema,
} from './schemas/brand-schemas';

export interface AIServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: 'parse_error' | 'timeout' | 'provider_error';
    message: string;
    retryable: boolean;
  };
  metadata: {
    model: string;
    latencyMs: number;
    isFallback: boolean;
    retries: number;
  };
}

export interface AIProvider {
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<AIServiceResult<T>>;
}

/**
 * Deterministic Mock AI Provider
 * Provides realistic, intelligent responses for demo stability, tests, and offline runs
 */
export class MockAIProvider implements AIProvider {
  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _systemPrompt?: string
  ): Promise<AIServiceResult<T>> {
    const startTime = Date.now();

    // Check which schema is being requested
    if ((schema as unknown) === IntakeExtractionOutputSchema || prompt.includes('intake') || prompt.includes('Extract facts')) {
      const mockData = {
        extractedFacts: [
          {
            statement: `Core product purpose identified from input: ${prompt.slice(0, 100).replace(/["\n]/g, ' ')}...`,
            confidence: 0.95,
          },
          {
            statement: 'Founder is targeting rapid time-to-market without traditional agency overhead.',
            confidence: 0.9,
          },
          {
            statement: 'Value proposition relies on automated intelligence rather than manual service delivery.',
            confidence: 0.85,
          },
        ],
        unvalidatedAssumptions: [
          {
            claim: 'Target customers already experience this pain acutely and actively search for a software solution.',
            riskLevel: 'critical' as const,
            potentialConsequenceIfFalse: 'Product struggles with customer acquisition and high bounce rates.',
          },
          {
            claim: 'Users will trust an AI-driven workflow for strategic or high-consequence decisions.',
            riskLevel: 'medium' as const,
            potentialConsequenceIfFalse: 'Adoption stalls unless manual override and explanation controls are visible.',
          },
        ],
        initialQuestions: [
          {
            topic: 'audience' as const,
            question: 'Who is the exact individual that suffers most from this problem on a daily basis?',
            whyAsking: 'Clarifying the specific human avatar anchors the tone and messaging before choosing brand archetypes.',
            suggestedAnswers: [
              'Solo builders and seed-stage founders',
              'Engineering and product team leads',
              'Marketing and creative directors',
            ],
            answerType: 'hybrid' as const,
          },
          {
            topic: 'alternatives' as const,
            question: 'What is the current, painful workaround they use when your product is not available?',
            whyAsking: 'Every successful brand positions against a concrete enemy: either a competitor or a messy manual routine.',
            suggestedAnswers: [
              'Cobbling together generic LLM prompts in ChatGPT',
              'Paying high agency retainers or freelance designers',
              'Ignoring the problem until it creates an acute crisis',
            ],
            answerType: 'choice' as const,
          },
        ],
      };

      return {
        success: true,
        data: schema.parse(mockData),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 150,
          isFallback: true,
          retries: 0,
        },
      };
    }

    if ((schema as unknown) === NextAdaptiveQuestionOutputSchema || prompt.includes('adaptive_question')) {
      const mockNext = {
        hasMoreQuestions: false,
        reasonForCompletionOrNext: 'Sufficient context gathered across audience, alternatives, and value proposition.',
      };
      return {
        success: true,
        data: schema.parse(mockNext),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 100,
          isFallback: true,
          retries: 0,
        },
      };
    }

    if ((schema as unknown) === IdeaBriefSchema || prompt.includes('Idea Brief')) {
      const mockBrief = {
        ...DEMO_BRAND_PRGUARD.ideaBrief,
        id: `brief-${Date.now()}`,
        generatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: schema.parse(mockBrief),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 250,
          isFallback: true,
          retries: 0,
        },
      };
    }

    // Default fallback
    try {
      const parsed = schema.parse({});
      return {
        success: true,
        data: parsed,
        metadata: { model: 'mock-fallback', latencyMs: 50, isFallback: true, retries: 0 },
      };
    } catch {
      return {
        success: false,
        error: {
          type: 'parse_error',
          message: 'Mock provider could not synthesize empty mock for this schema.',
          retryable: false,
        },
        metadata: { model: 'mock-fallback', latencyMs: 50, isFallback: true, retries: 0 },
      };
    }
  }
}

/**
 * Gemini Provider using Google Gen AI SDK
 */
export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<AIServiceResult<T>> {
    const startTime = Date.now();
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        // Dynamic import to avoid SSR bundling issues if SDK needs node env
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.apiKey });

        const fullPrompt = `${systemPrompt ? `${systemPrompt}\n\n` : ''}
STRICT JSON OUTPUT REQUIREMENT:
You must output a strictly valid JSON object that conforms to the requested schema.
Do NOT wrap in markdown code blocks like \`\`\`json. Output raw JSON only.

User Request:
${prompt}`;

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        let jsonStr = rawText.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedJson = JSON.parse(jsonStr);
        const validated = schema.parse(parsedJson);

        return {
          success: true,
          data: validated,
          metadata: {
            model: modelName,
            latencyMs: Date.now() - startTime,
            isFallback: false,
            retries,
          },
        };
      } catch (err: unknown) {
        retries++;
        logger.warn(`Gemini structured call failed (attempt ${retries}/${maxRetries + 1}):`, {
          error: err instanceof Error ? err.message : String(err),
        });

        if (retries > maxRetries) {
          logger.error('Gemini provider exhausted retries, failing over to mock:', err);
          // Graceful fallback to mock on provider failure
          const mock = new MockAIProvider();
          const fallbackResult = await mock.generateStructured(prompt, schema, systemPrompt);
          fallbackResult.metadata.retries = retries;
          return fallbackResult;
        }
      }
    }

    const mock = new MockAIProvider();
    return mock.generateStructured(prompt, schema, systemPrompt);
  }
}

/**
 * Returns active provider according to server environment
 */
export function getAIProvider(): AIProvider {
  const env = getServerEnv();
  if (env.isDemoMode || !env.geminiApiKey) {
    logger.info('Using MockAIProvider (Demo Mode or missing API Key)');
    return new MockAIProvider();
  }
  return new GeminiProvider(env.geminiApiKey);
}
