import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryAIService } from '@/lib/ai-service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing required field: action' }, { status: 400 });
    }

    if (action === 'intake') {
      const { rawIdea } = body;
      if (!rawIdea || typeof rawIdea !== 'string' || rawIdea.trim().length < 10) {
        return NextResponse.json(
          { error: 'Please provide an idea description of at least 10 characters.' },
          { status: 400 }
        );
      }

      logger.info('API: /api/discovery intake requested', { ideaLength: rawIdea.length });
      const result = await DiscoveryAIService.extractInitialIntake(rawIdea);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'next_question') {
      const { history, rawIdea } = body;
      logger.info('API: /api/discovery next_question requested', { historyLength: history?.length });
      const result = await DiscoveryAIService.getNextAdaptiveQuestion(history || [], rawIdea || '');
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'synthesize') {
      const { rawIdea, facts, assumptions, history } = body;
      logger.info('API: /api/discovery synthesize requested');
      const result = await DiscoveryAIService.synthesizeIdeaBrief(
        rawIdea || '',
        facts || [],
        assumptions || [],
        history || []
      );
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    logger.error('API /api/discovery error:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'An unexpected error occurred during discovery.',
      },
      { status: 500 }
    );
  }
}
