import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '@/store/useBrandStore';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { IdentityService } from '@/lib/identity/identity-service';
import { ScenarioLabEngine, SCENARIO_TEMPLATES } from '@/lib/evolution/scenario-lab-engine';
import { ScenarioTemplateType } from '@/types/evolution';
import { CanonicalBrandState } from '@/types/brand';

describe('Scenario Lab Engine Suite (Prompt 10 Part A)', () => {
  let initializedState: CanonicalBrandState;

  beforeEach(async () => {
    useBrandStore.getState().resetProject();
    useBrandStore.getState().loadDemoProject();

    // Lock Strategy
    const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);
    useBrandStore.setState((s) => ({
      project: {
        ...s.project,
        positioningWorlds: worlds,
        selectedWorldId: worlds[0].id,
      },
    }));

    // Lock Creative Identity
    const identity = await IdentityService.generateIdentity(worlds[0], DEMO_BRAND_PRGUARD.ideaBrief);
    useBrandStore.setState((s) => ({
      project: {
        ...s.project,
        creativeIdentity: identity,
        stage: 'identity_locked',
      },
    }));

    initializedState = useBrandStore.getState().project;
  });

  it('generates all 7 realistic scenario templates with valid tri-state structure', () => {
    const templates: ScenarioTemplateType[] = [
      'website_launch',
      'social_announcement',
      'onboarding_screen',
      'sales_email',
      'investor_pitch',
      'advertisement',
      'support_response',
    ];

    for (const templateType of templates) {
      const scenario = ScenarioLabEngine.generateScenario(templateType, initializedState);

      expect(scenario.id).toContain(`scen-${templateType}`);
      expect(scenario.scenarioType).toBe(templateType);
      expect(scenario.title).toBe(SCENARIO_TEMPLATES[templateType].defaultTitle);

      // 1. Raw Generation checks
      expect(scenario.rawGeneration.content.length).toBeGreaterThan(20);
      expect(scenario.rawGeneration.detectedFlaws.length).toBeGreaterThan(0);
      expect(scenario.rawGeneration.description.length).toBeGreaterThan(10);

      // 2. Brand-Aware Generation checks
      expect(scenario.brandAwareGeneration.content.length).toBeGreaterThan(20);
      expect(scenario.brandAwareGeneration.alignedDecisions.length).toBeGreaterThan(0);
      const expectedBrandName =
        initializedState.creativeIdentity?.namingCandidates.find(
          (n) => n.id === initializedState.creativeIdentity?.selectedNameId
        )?.name || 'Kintra';
      expect(scenario.brandAwareGeneration.content).toContain(expectedBrandName);

      // 3. Validated Final checks
      expect(scenario.validatedFinal.validationReport.passed).toBe(true);
      expect(scenario.validatedFinal.validationReport.blockingFindingsCount).toBe(0);

      // 4. Lineage checks
      expect(scenario.lineage.originScenario).toBe(templateType);
      expect(scenario.lineage.worldId).toBe(initializedState.selectedWorldId);
      expect(scenario.lineage.version).toBe(1);
    }
  });

  it('preserves lineage and updates version on manual edit and re-audit', () => {
    const scenario = ScenarioLabEngine.generateScenario('website_launch', initializedState);
    expect(scenario.lineage.version).toBe(1);

    const editedContent = 'Deterministic AST-level pull request security for mission-critical infrastructure.';
    const updated = ScenarioLabEngine.manuallyEditScenario(scenario, editedContent, initializedState);

    expect(updated.validatedFinal.content).toBe(editedContent);
    expect(updated.lineage.version).toBe(2);
    expect(updated.validatedFinal.validationReport.passed).toBe(true);
  });
});
