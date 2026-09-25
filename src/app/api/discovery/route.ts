import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DiscoveryAIService } from '@/lib/ai-service';
import { logger } from '@/lib/logger';
import { enforceRateLimit, RATE_LIMIT_STANDARD } from '@/lib/security/rate-limiter';
import {
  ExtractedFactSchema,
  HypothesisSchema,
  InterviewQuestionSchema,
} from '@/lib/schemas/brand-schemas';

const DiscoveryRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('intake'),
    rawIdea: z.string().min(10, 'Please provide an idea description of at least 10 characters.'),
  }),
  z.object({
    action: z.literal('next_question'),
    history: z.array(InterviewQuestionSchema).optional().default([]),
    rawIdea: z.string().optional().default(''),
  }),
  z.object({
    action: z.literal('synthesize'),
    rawIdea: z.string().optional().default(''),
    facts: z.array(ExtractedFactSchema).optional().default([]),
    assumptions: z.array(HypothesisSchema).optional().default([]),
    history: z.array(InterviewQuestionSchema).optional().default([]),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const rateLimitError = enforceRateLimit(req, 'discovery', RATE_LIMIT_STANDARD);
    if (rateLimitError) return rateLimitError;

    const body = await req.json();
    const parsed = DiscoveryRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload for Discovery API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    logger.info('API /api/discovery action:', { action: data.action });

    switch (data.action) {
      case 'intake': {
        const result = await DiscoveryAIService.extractInitialIntake(data.rawIdea);
        return NextResponse.json({ success: true, data: result });
      }

      case 'next_question': {
        const result = await DiscoveryAIService.getNextAdaptiveQuestion(data.history, data.rawIdea);
        return NextResponse.json({ success: true, data: result });
      }

      case 'synthesize': {
        const result = await DiscoveryAIService.synthesizeIdeaBrief(
          data.rawIdea,
          data.facts,
          data.assumptions,
          data.history
        );
        return NextResponse.json({ success: true, data: result });
      }
    }
  } catch (err: unknown) {
    logger.error('API /api/discovery error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'An unexpected error occurred during discovery.',
      },
      { status: 500 }
    );
  }
}
