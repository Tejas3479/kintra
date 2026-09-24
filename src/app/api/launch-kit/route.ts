import { NextRequest, NextResponse } from 'next/server';
import { LaunchKitEngine } from '@/lib/launch-kit/launch-kit-engine';
import { CanonicalBrandStateSchema } from '@/lib/schemas/brand-schemas';
import { LaunchKitSchema } from '@/lib/schemas/launch-kit-schemas';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const LaunchKitRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('generate'),
    state: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('export_markdown'),
    kit: LaunchKitSchema,
  }),
  z.object({
    action: z.literal('export_json'),
    kit: LaunchKitSchema,
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LaunchKitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request payload for Launch Kit API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    switch (data.action) {
      case 'generate': {
        logger.info('API /api/launch-kit action: generate');
        const launchKit = LaunchKitEngine.generateLaunchKit(data.state);
        return NextResponse.json({ success: true, launchKit });
      }

      case 'export_markdown': {
        logger.info('API /api/launch-kit action: export_markdown');
        const markdown = LaunchKitEngine.exportToMarkdown(data.kit);
        return NextResponse.json({ success: true, markdown });
      }

      case 'export_json': {
        logger.info('API /api/launch-kit action: export_json');
        const json = LaunchKitEngine.exportToJson(data.kit);
        return NextResponse.json({ success: true, json });
      }
    }
  } catch (error: unknown) {
    logger.error('Error in /api/launch-kit route', error);
    return NextResponse.json(
      {
        error: 'Failed to process Launch Kit request',
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
