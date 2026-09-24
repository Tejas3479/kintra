import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '@/store/useBrandStore';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';

describe('Critical Acceptance Test: End-to-End Brand Evolution (Prompt 10)', () => {
  beforeEach(() => {
    useBrandStore.getState().resetProject();
  });

  it('executes full 10-step strategic evolution workflow reliably', async () => {
    const store = useBrandStore.getState();

    // ----------------------------------------------------
    // STEP 1: Create a Brand
    // ----------------------------------------------------
    store.createProject('PRGuard Security', 'Deterministic AST-level pull request security for development teams.');
    expect(useBrandStore.getState().project.metadata.name).toBe('PRGuard Security');
    expect(useBrandStore.getState().project.metadata.version).toBe(1);

    // Setup initial brief & landscape
    store.loadDemoProject();
    expect(useBrandStore.getState().project.ideaBrief).toBeDefined();

    // ----------------------------------------------------
    // STEP 2: Approve Positioning
    // ----------------------------------------------------
    await useBrandStore.getState().generatePositioningWorlds();
    const worlds = useBrandStore.getState().project.positioningWorlds;
    expect(worlds.length).toBeGreaterThanOrEqual(3);

    const puristWorld = worlds.find((w) => w.archetype === 'The Engineering Purist') || worlds[0];
    useBrandStore.getState().selectPositioningWorld(puristWorld.id, 'Engineering rigor over generic AI copilot wrappers');

    expect(useBrandStore.getState().project.selectedWorldId).toBe(puristWorld.id);
    const posDecision = Object.values(useBrandStore.getState().project.decisionGraph.nodes).find(
      (n) => n.category === 'positioning_world'
    );
    expect(posDecision).toBeDefined();

    // ----------------------------------------------------
    // STEP 3: Generate Voice System
    // ----------------------------------------------------
    await useBrandStore.getState().generateCreativeIdentity();
    const identity = useBrandStore.getState().project.creativeIdentity;
    expect(identity).toBeDefined();
    expect(identity?.voiceSystem.tonalSliders.precision).toBeGreaterThanOrEqual(80);
    expect(identity?.voiceSystem.bannedPatterns.length).toBeGreaterThan(0);

    // ----------------------------------------------------
    // STEP 4: Generate Visual Direction & Approve Identity
    // ----------------------------------------------------
    await useBrandStore.getState().generateVisualAsset('brand_mark');
    expect(useBrandStore.getState().project.creativeIdentity?.generatedVisuals.length).toBeGreaterThan(0);

    useBrandStore.getState().approveCreativeIdentity('Approved deterministic visual and voice guidelines');
    expect(useBrandStore.getState().project.stage).toBe('identity_locked');

    // ----------------------------------------------------
    // STEP 5: Generate Launch Artifacts (in Scenario Lab & Guardian)
    // ----------------------------------------------------
    await useBrandStore.getState().generateArtifact('website_headline');
    await useBrandStore.getState().generateArtifact('launch_email');
    await useBrandStore.getState().runScenarioTest('website_launch');

    const artifacts = useBrandStore.getState().project.brandArtifacts || [];
    expect(artifacts.length).toBeGreaterThanOrEqual(2);
    expect(useBrandStore.getState().scenarioArtifacts.length).toBe(1);

    const initialHeadline = artifacts.find((a) => a.artifactType === 'website_headline');
    expect(initialHeadline).toBeDefined();

    // ----------------------------------------------------
    // STEP 6: Propose Assumption Change (Target Audience Pivot)
    // ----------------------------------------------------
    const oldAudience = puristWorld.targetAudience;
    const newAudience = 'Enterprise CISOs & Compliance Officers';
    const rationale = 'Enterprise compliance budgets are centralized and mandate verifiable pull request security audit trails.';

    useBrandStore.getState().proposeAssumptionChange('target_audience', newAudience, rationale);

    const changeRequest = useBrandStore.getState().activeChangeRequest;
    expect(changeRequest).toBeDefined();
    expect(changeRequest?.category).toBe('target_audience');
    expect(changeRequest?.proposedValue).toBe(newAudience);

    // ----------------------------------------------------
    // STEP 7: Verify Affected Dependencies
    // ----------------------------------------------------
    const impact = useBrandStore.getState().impactReport;
    expect(impact).toBeDefined();
    expect(impact?.blastRadius.mustRegenerateCount).toBeGreaterThan(0);

    // Affected decisions
    const affectedDecisions = impact?.blastRadius.affectedDecisions || [];
    const targetNicheDecision = affectedDecisions.find((d) => d.nodeId === 'node-target-niche');
    expect(targetNicheDecision?.impactStatus).toBe('must_regenerate');

    // Affected artifacts
    const affectedArtifacts = impact?.blastRadius.affectedArtifacts || [];
    const affectedHeadline = affectedArtifacts.find((a) => a.title.includes('Headline'));
    expect(affectedHeadline?.impactStatus).toBe('must_regenerate');

    // ----------------------------------------------------
    // STEP 8: Retain Unaffected Decisions
    // ----------------------------------------------------
    const proofDecision = affectedDecisions.find((d) => d.nodeId === 'node-proof-model');
    expect(proofDecision?.impactStatus).toBe('remains_valid');

    const nameDecision = affectedDecisions.find((d) => d.nodeId === 'node-brand-name');
    expect(nameDecision?.impactStatus).toBe('remains_valid');

    const visualDecision = affectedDecisions.find((d) => d.nodeId === 'node-visual-palette');
    expect(visualDecision?.impactStatus).toBe('unchanged');

    // ----------------------------------------------------
    // STEP 9: Regenerate Affected Artifacts (Apply Update)
    // ----------------------------------------------------
    const initialVersion = useBrandStore.getState().project.metadata.version;
    useBrandStore.getState().approveEvolution('apply_update');

    // Version incremented
    expect(useBrandStore.getState().project.metadata.version).toBeGreaterThan(initialVersion);

    // Target audience updated in canonical state
    const updatedWorld = useBrandStore.getState().project.positioningWorlds.find(
      (w) => w.id === useBrandStore.getState().project.selectedWorldId
    );
    expect(updatedWorld?.targetAudience).toBe(newAudience);

    // Decision graph node updated
    const updatedNode =
      useBrandStore.getState().project.decisionGraph.nodes['node-target-niche'] ||
      Object.values(useBrandStore.getState().project.decisionGraph.nodes).find(
        (n) => n.category === 'target_niche'
      );
    expect(updatedNode?.approvedValue).toBe(newAudience);

    // Regenerated headline copy targets new audience
    const updatedArtifacts = useBrandStore.getState().project.brandArtifacts || [];
    const updatedHeadline = updatedArtifacts.find((a) => a.artifactType === 'website_headline');
    expect(updatedHeadline?.targetAudience).toBe(newAudience);
    expect(updatedHeadline?.content).toContain(newAudience);
    expect(updatedHeadline?.versionHistory.length).toBeGreaterThan(1);

    // ----------------------------------------------------
    // STEP 10: Re-run Consistency Checks on Evolved Brand
    // ----------------------------------------------------
    const currentState = useBrandStore.getState().project;
    const finalReport = ConsistencyGuardian.evaluateArtifact(updatedHeadline!, currentState);

    expect(finalReport.passed).toBe(true);
    expect(finalReport.blockingFindingsCount).toBe(0);
    expect(finalReport.dimensions.strategic_alignment.status).toBe('pass');
    expect(finalReport.dimensions.unsupported_claims.status).toBe('pass');
    expect(finalReport.dimensions.distinctiveness.status).toBe('pass');
  });
});
