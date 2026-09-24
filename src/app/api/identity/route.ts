import { NextRequest, NextResponse } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { IdentityConsistencyChecker } from '@/lib/identity/identity-consistency-checker';
import { AntiGenericNamer } from '@/lib/identity/anti-generic-namer';
import { DefaultImageGenerationProvider } from '@/lib/identity/image-provider';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing required field: action' }, { status: 400 });
    }

    if (action === 'generate_identity') {
      const { world, brief, evidenceRecords } = body;
      if (!world) {
        return NextResponse.json(
          { error: 'Cannot generate creative identity without an approved Positioning World.' },
          { status: 400 }
        );
      }
      if (!brief) {
        return NextResponse.json(
          { error: 'Cannot generate creative identity without an Idea Brief.' },
          { status: 400 }
        );
      }

      logger.info('API /api/identity: generating creative identity from approved world:', {
        worldId: world.id,
      });

      const identity = await IdentityService.generateIdentity(world, brief, evidenceRecords || []);
      return NextResponse.json({ success: true, data: identity });
    }

    if (action === 'audit_consistency') {
      const { selectedName, selectedTagline, voiceSystem, visualSystem, positioningWorld } = body;
      const conflicts = IdentityConsistencyChecker.auditConsistency({
        selectedName,
        selectedTagline,
        voiceSystem,
        visualSystem,
        positioningWorld,
      });
      return NextResponse.json({ success: true, data: conflicts });
    }

    if (action === 'audit_name') {
      const { name, categoryFraming } = body;
      if (!name) {
        return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
      }
      const audit = AntiGenericNamer.auditName(name, categoryFraming || '');
      return NextResponse.json({ success: true, data: audit });
    }

    if (action === 'generate_visual') {
      const { promptContext } = body;
      if (!promptContext) {
        return NextResponse.json({ error: 'Missing promptContext parameter' }, { status: 400 });
      }
      const provider = new DefaultImageGenerationProvider();
      const result = await provider.generateVisual(promptContext);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    logger.error('API /api/identity error:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Identity processing failed.',
      },
      { status: 500 }
    );
  }
}
