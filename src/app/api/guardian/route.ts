import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import { logger } from '@/lib/logger';
import { CanonicalBrandStateSchema } from '@/lib/schemas/brand-schemas';
import { BrandArtifactSchema, GuardianArtifactTypeSchema } from '@/lib/schemas/guardian-schemas';

const GuardianRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('validate_artifact'),
    artifact: BrandArtifactSchema,
    brandState: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('generate_artifact'),
    artifactType: GuardianArtifactTypeSchema,
    brandState: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('apply_repair'),
    artifact: BrandArtifactSchema,
    findingId: z.string().min(1),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GuardianRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload for Guardian API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    logger.info('Guardian API route request:', { action: data.action });

    switch (data.action) {
      case 'validate_artifact': {
        const report = ConsistencyGuardian.evaluateArtifact(data.artifact, data.brandState);
        return NextResponse.json({ success: true, data: report });
      }

      case 'generate_artifact': {
        const artifact = ConsistencyGuardian.generateDefaultArtifact(data.artifactType, data.brandState);
        const report = ConsistencyGuardian.evaluateArtifact(artifact, data.brandState);
        artifact.validationReport = report;

        return NextResponse.json({
          success: true,
          data: { artifact, report },
        });
      }

      case 'apply_repair': {
        const repaired = ConsistencyGuardian.applyRepair(data.artifact, data.findingId);
        return NextResponse.json({ success: true, data: repaired });
      }
    }
  } catch (error: unknown) {
    logger.error('Error in Guardian API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error in Guardian API',
      },
      { status: 500 }
    );
  }
}
