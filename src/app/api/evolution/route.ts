import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ScenarioLabEngine } from '@/lib/evolution/scenario-lab-engine';
import { BrandEvolutionEngine } from '@/lib/evolution/brand-evolution-engine';
import { logger } from '@/lib/logger';
import { CanonicalBrandStateSchema } from '@/lib/schemas/brand-schemas';
import {
  ScenarioTemplateTypeSchema,
  ScenarioArtifactSchema,
  AssumptionChangeRequestSchema,
  EvolutionApprovalChoiceSchema,
} from '@/lib/schemas/evolution-schemas';
import { BrandBranch } from '@/types/evolution';

const BrandBranchInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  parentBranchId: z.string().optional(),
  createdAt: z.string(),
  snapshot: z.any(),
});

const EvolutionRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('generate_scenario'),
    scenarioType: ScenarioTemplateTypeSchema,
    brandState: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('repair_scenario'),
    scenarioArtifact: ScenarioArtifactSchema,
    findingId: z.string().min(1),
    brandState: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('manually_edit_scenario'),
    scenarioArtifact: ScenarioArtifactSchema,
    newContent: z.string().min(1),
    brandState: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('analyze_impact'),
    changeRequest: AssumptionChangeRequestSchema,
    brandState: CanonicalBrandStateSchema,
  }),
  z.object({
    action: z.literal('apply_evolution'),
    changeRequest: AssumptionChangeRequestSchema,
    brandState: CanonicalBrandStateSchema,
    choice: EvolutionApprovalChoiceSchema,
    branchName: z.string().optional(),
  }),
  z.object({
    action: z.literal('compare_branches'),
    baseBranch: BrandBranchInputSchema,
    targetBranch: BrandBranchInputSchema,
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EvolutionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload for Evolution API',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    logger.info('Evolution API route request:', { action: data.action });

    switch (data.action) {
      case 'generate_scenario': {
        const scenario = ScenarioLabEngine.generateScenario(data.scenarioType, data.brandState);
        return NextResponse.json({ success: true, data: scenario });
      }

      case 'repair_scenario': {
        const repaired = ScenarioLabEngine.applyRepairToScenario(data.scenarioArtifact, data.findingId, data.brandState);
        return NextResponse.json({ success: true, data: repaired });
      }

      case 'manually_edit_scenario': {
        const updated = ScenarioLabEngine.manuallyEditScenario(data.scenarioArtifact, data.newContent, data.brandState);
        return NextResponse.json({ success: true, data: updated });
      }

      case 'analyze_impact': {
        const report = BrandEvolutionEngine.analyzeAssumptionImpact(data.changeRequest, data.brandState);
        return NextResponse.json({ success: true, data: report });
      }

      case 'apply_evolution': {
        const result = BrandEvolutionEngine.applyEvolution(data.changeRequest, data.brandState, data.choice, data.branchName);
        return NextResponse.json({ success: true, data: result });
      }

      case 'compare_branches': {
        const diff = BrandEvolutionEngine.compareBranches(
          data.baseBranch as unknown as BrandBranch,
          data.targetBranch as unknown as BrandBranch
        );
        return NextResponse.json({ success: true, data: diff });
      }
    }
  } catch (error) {
    logger.error('Error in Evolution API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown server error.' },
      { status: 500 }
    );
  }
}
