import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 60;
import { IdentityService } from '@/lib/identity/identity-service';
import { IdentityConsistencyChecker } from '@/lib/identity/identity-consistency-checker';
import { AntiGenericNamer } from '@/lib/identity/anti-generic-namer';
import { DefaultImageGenerationProvider } from '@/lib/identity/image-provider';
import { logger } from '@/lib/logger';
import { enforceRateLimit, RATE_LIMIT_STANDARD } from '@/lib/security/rate-limiter';
import { IdeaBriefSchema } from '@/lib/schemas/brand-schemas';
import { PositioningWorldSchema } from '@/lib/schemas/strategy-schemas';
import { EvidenceRecordSchema } from '@/lib/schemas/research-schemas';
import {
  NamingCandidateSchema,
  TaglineCandidateSchema,
  VoiceSystemSchema,
  VisualSystemSchema,
} from '@/lib/schemas/identity-schemas';

const IdentityRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('generate_identity'),
    world: PositioningWorldSchema,
    brief: IdeaBriefSchema,
    evidenceRecords: z.array(EvidenceRecordSchema).optional().default([]),
  }),
  z.object({
    action: z.literal('audit_consistency'),
    selectedName: NamingCandidateSchema.optional().nullable(),
    selectedTagline: TaglineCandidateSchema.optional().nullable(),
    voiceSystem: VoiceSystemSchema.optional(),
    visualSystem: VisualSystemSchema.optional(),
    positioningWorld: PositioningWorldSchema.optional(),
  }),
  z.object({
    action: z.literal('audit_name'),
    name: z.string().min(1),
    categoryFraming: z.string().optional().default(''),
  }),
  z.object({
    action: z.literal('generate_visual'),
    promptContext: z.object({
      positioningArchetype: z.string(),
      brandName: z.string(),
      tagline: z.string().optional().default(''),
      primaryHex: z.string(),
      secondaryHex: z.string(),
      accentHex: z.string(),
      visualMetaphors: z.array(z.string()).optional().default([]),
      audience: z.string(),
      borderRadius: z.string(),
      assetType: z.enum(['brand_mark', 'hero_graphic', 'system_badge']),
    }),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const rateLimitError = enforceRateLimit(req, 'identity', RATE_LIMIT_STANDARD);
    if (rateLimitError) return rateLimitError;

    const body = await req.json();
    const parsed = IdentityRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload for Identity API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    logger.info('API /api/identity action:', { action: data.action });

    switch (data.action) {
      case 'generate_identity': {
        const identity = await IdentityService.generateIdentity(data.world, data.brief, data.evidenceRecords);
        return NextResponse.json({ success: true, data: identity });
      }

      case 'audit_consistency': {
        const conflicts = IdentityConsistencyChecker.auditConsistency({
          selectedName: data.selectedName || undefined,
          selectedTagline: data.selectedTagline || undefined,
          voiceSystem: data.voiceSystem,
          visualSystem: data.visualSystem,
          positioningWorld: data.positioningWorld,
        });
        return NextResponse.json({ success: true, data: conflicts });
      }

      case 'audit_name': {
        const audit = AntiGenericNamer.auditName(data.name, data.categoryFraming);
        return NextResponse.json({ success: true, data: audit });
      }

      case 'generate_visual': {
        const provider = new DefaultImageGenerationProvider();
        const result = await provider.generateVisual(data.promptContext);
        return NextResponse.json({ success: true, data: result });
      }
    }
  } catch (err: unknown) {
    logger.error('API /api/identity error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Identity processing failed.',
      },
      { status: 500 }
    );
  }
}
