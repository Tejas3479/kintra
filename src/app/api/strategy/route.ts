import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { ContradictionDetector } from '@/lib/strategy/contradiction-detector';
import { logger } from '@/lib/logger';
import { enforceRateLimit, RATE_LIMIT_STANDARD } from '@/lib/security/rate-limiter';
import { IdeaBriefSchema } from '@/lib/schemas/brand-schemas';
import { PositioningWorldSchema } from '@/lib/schemas/strategy-schemas';

const StrategyRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('generate_worlds'),
    brief: IdeaBriefSchema,
    evidenceRecords: z.array(z.any()).optional().default([]),
  }),
  z.object({
    action: z.literal('audit_contradictions'),
    world: PositioningWorldSchema,
    evidenceRecords: z.array(z.any()).optional().default([]),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const rateLimitError = enforceRateLimit(req, 'strategy', RATE_LIMIT_STANDARD);
    if (rateLimitError) return rateLimitError;

    const body = await req.json();
    const parsed = StrategyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload for Strategy API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    logger.info('API /api/strategy action:', { action: data.action });

    switch (data.action) {
      case 'generate_worlds': {
        const worlds = StrategyService.generateWorlds(data.brief, data.evidenceRecords);
        const contradictions = StrategyService.auditWorlds(worlds, data.evidenceRecords);
        return NextResponse.json({ success: true, data: { worlds, contradictions } });
      }

      case 'audit_contradictions': {
        const alerts = ContradictionDetector.auditPositioningWorld(data.world, data.evidenceRecords);
        return NextResponse.json({ success: true, data: alerts });
      }
    }
  } catch (err: unknown) {
    logger.error('API /api/strategy error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Strategy processing failed.',
      },
      { status: 500 }
    );
  }
}
