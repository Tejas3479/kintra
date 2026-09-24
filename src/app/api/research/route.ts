import { NextRequest, NextResponse } from 'next/server';
import { getResearchProvider } from '@/lib/research/research-provider';
import { EvidenceEngine } from '@/lib/research/evidence-engine';
import { MarketLandscapeSchema } from '@/lib/schemas/research-schemas';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, rawIdea } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing required research search query.' },
        { status: 400 }
      );
    }

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
        error: err instanceof Error ? err.message : 'Research aggregation failed.',
      },
      { status: 500 }
    );
  }
}
