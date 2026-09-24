import { NextRequest, NextResponse } from 'next/server';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { ContradictionDetector } from '@/lib/strategy/contradiction-detector';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing required field: action' }, { status: 400 });
    }

    if (action === 'generate_worlds') {
      const { brief, evidenceRecords } = body;
      if (!brief) {
        return NextResponse.json({ error: 'Missing required field: brief' }, { status: 400 });
      }

      logger.info('API /api/strategy: generating divergent positioning worlds');
      const worlds = StrategyService.generateWorlds(brief, evidenceRecords || []);
      const contradictions = StrategyService.auditWorlds(worlds, evidenceRecords || []);

      return NextResponse.json({ success: true, data: { worlds, contradictions } });
    }

    if (action === 'audit_contradictions') {
      const { world, evidenceRecords } = body;
      if (!world) {
        return NextResponse.json({ error: 'Missing required field: world' }, { status: 400 });
      }

      const alerts = ContradictionDetector.auditPositioningWorld(world, evidenceRecords || []);
      return NextResponse.json({ success: true, data: alerts });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    logger.error('API /api/strategy error:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Strategy processing failed.',
      },
      { status: 500 }
    );
  }
}
