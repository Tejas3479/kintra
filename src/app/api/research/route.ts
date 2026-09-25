import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getResearchProvider } from '@/lib/research/research-provider';
import { EvidenceEngine } from '@/lib/research/evidence-engine';
import { MarketLandscapeSchema } from '@/lib/schemas/research-schemas';
import { logger } from '@/lib/logger';
import { enforceRateLimit, RATE_LIMIT_STANDARD } from '@/lib/security/rate-limiter';

const ResearchRequestSchema = z.object({
  query: z.string().min(1, 'Missing required research search query.'),
  rawIdea: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const rateLimitError = enforceRateLimit(req, 'research', RATE_LIMIT_STANDARD);
    if (rateLimitError) return rateLimitError;

    const body = await req.json();
    const parsed = ResearchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload for Research API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { query, rawIdea } = parsed.data;
    logger.info('API /api/research: executing market landscape research', { query });

    const provider = getResearchProvider();
    const rawResults = await provider.search(query, 5);

    const landscape = EvidenceEngine.synthesizeLandscape(
      rawResults,
      rawIdea || query,
      query.slice(0, 40)
    );

    const validated = MarketLandscapeSchema.parse(landscape);

    return NextResponse.json({ success: true, data: validated });
  } catch (err: unknown) {
    logger.error('API /api/research failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Research aggregation failed.',
      },
      { status: 500 }
    );
  }
}
