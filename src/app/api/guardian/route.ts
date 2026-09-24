import { NextRequest, NextResponse } from 'next/server';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import { logger } from '@/lib/logger';
import { BrandArtifact, GuardianArtifactType } from '@/types/guardian';
import { CanonicalBrandState } from '@/types/brand';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    logger.info('Guardian API route request:', { action });

    switch (action) {
      case 'validate_artifact': {
        const { artifact, brandState } = body as {
          artifact: BrandArtifact;
          brandState: CanonicalBrandState;
        };

        if (!artifact || !brandState) {
          return NextResponse.json(
            { success: false, error: 'Both artifact and brandState are required for validation.' },
            { status: 400 }
          );
        }

        const report = ConsistencyGuardian.evaluateArtifact(artifact, brandState);
        return NextResponse.json({ success: true, data: report });
      }

      case 'generate_artifact': {
        const { artifactType, brandState } = body as {
          artifactType: GuardianArtifactType;
          brandState: CanonicalBrandState;
        };

        if (!artifactType || !brandState) {
          return NextResponse.json(
            { success: false, error: 'Both artifactType and brandState are required.' },
            { status: 400 }
          );
        }

        const artifact = ConsistencyGuardian.generateDefaultArtifact(artifactType, brandState);
        const report = ConsistencyGuardian.evaluateArtifact(artifact, brandState);
        artifact.validationReport = report;

        return NextResponse.json({
          success: true,
          data: { artifact, report },
        });
      }

      case 'apply_repair': {
        const { artifact, findingId } = body as {
          artifact: BrandArtifact;
          findingId: string;
        };

        if (!artifact || !findingId) {
          return NextResponse.json(
            { success: false, error: 'Both artifact and findingId are required to apply repair.' },
            { status: 400 }
          );
        }

        const repaired = ConsistencyGuardian.applyRepair(artifact, findingId);
        return NextResponse.json({ success: true, data: repaired });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported guardian action: ${action}` },
          { status: 400 }
        );
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
