import { NextRequest, NextResponse } from 'next/server';
import { ScenarioLabEngine } from '@/lib/evolution/scenario-lab-engine';
import { BrandEvolutionEngine } from '@/lib/evolution/brand-evolution-engine';
import { logger } from '@/lib/logger';
import {
  ScenarioTemplateType,
  ScenarioArtifact,
  AssumptionChangeRequest,
  EvolutionApprovalChoice,
  BrandBranch,
} from '@/types/evolution';
import { CanonicalBrandState } from '@/types/brand';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    logger.info('Evolution API route request:', { action });

    switch (action) {
      case 'generate_scenario': {
        const { scenarioType, brandState } = body as {
          scenarioType: ScenarioTemplateType;
          brandState: CanonicalBrandState;
        };

        if (!scenarioType || !brandState) {
          return NextResponse.json(
            { success: false, error: 'Both scenarioType and brandState are required.' },
            { status: 400 }
          );
        }

        const scenario = ScenarioLabEngine.generateScenario(scenarioType, brandState);
        return NextResponse.json({ success: true, data: scenario });
      }

      case 'repair_scenario': {
        const { scenarioArtifact, findingId, brandState } = body as {
          scenarioArtifact: ScenarioArtifact;
          findingId: string;
          brandState: CanonicalBrandState;
        };

        if (!scenarioArtifact || !findingId || !brandState) {
          return NextResponse.json(
            { success: false, error: 'scenarioArtifact, findingId, and brandState are required.' },
            { status: 400 }
          );
        }

        const repaired = ScenarioLabEngine.applyRepairToScenario(scenarioArtifact, findingId, brandState);
        return NextResponse.json({ success: true, data: repaired });
      }

      case 'manually_edit_scenario': {
        const { scenarioArtifact, newContent, brandState } = body as {
          scenarioArtifact: ScenarioArtifact;
          newContent: string;
          brandState: CanonicalBrandState;
        };

        if (!scenarioArtifact || !newContent || !brandState) {
          return NextResponse.json(
            { success: false, error: 'scenarioArtifact, newContent, and brandState are required.' },
            { status: 400 }
          );
        }

        const updated = ScenarioLabEngine.manuallyEditScenario(scenarioArtifact, newContent, brandState);
        return NextResponse.json({ success: true, data: updated });
      }

      case 'analyze_impact': {
        const { changeRequest, brandState } = body as {
          changeRequest: AssumptionChangeRequest;
          brandState: CanonicalBrandState;
        };

        if (!changeRequest || !brandState) {
          return NextResponse.json(
            { success: false, error: 'Both changeRequest and brandState are required.' },
            { status: 400 }
          );
        }

        const report = BrandEvolutionEngine.analyzeAssumptionImpact(changeRequest, brandState);
        return NextResponse.json({ success: true, data: report });
      }

      case 'apply_evolution': {
        const { changeRequest, brandState, choice, branchName } = body as {
          changeRequest: AssumptionChangeRequest;
          brandState: CanonicalBrandState;
          choice: EvolutionApprovalChoice;
          branchName?: string;
        };

        if (!changeRequest || !brandState || !choice) {
          return NextResponse.json(
            { success: false, error: 'changeRequest, brandState, and choice are required.' },
            { status: 400 }
          );
        }

        const result = BrandEvolutionEngine.applyEvolution(changeRequest, brandState, choice, branchName);
        return NextResponse.json({ success: true, data: result });
      }

      case 'compare_branches': {
        const { baseBranch, targetBranch } = body as {
          baseBranch: BrandBranch;
          targetBranch: BrandBranch;
        };

        if (!baseBranch || !targetBranch) {
          return NextResponse.json(
            { success: false, error: 'Both baseBranch and targetBranch are required.' },
            { status: 400 }
          );
        }

        const diff = BrandEvolutionEngine.compareBranches(baseBranch, targetBranch);
        return NextResponse.json({ success: true, data: diff });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unrecognized action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error in Evolution API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown server error.' },
      { status: 500 }
    );
  }
}
