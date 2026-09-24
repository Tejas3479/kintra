import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '../src/store/useBrandStore';
import { LaunchKitSchema } from '../src/lib/schemas/launch-kit-schemas';

describe('Prompt 11 End-to-End Acceptance Test: Rough Idea to Verified Launch Kit', () => {
  beforeEach(() => {
    // Reset to demo project baseline with grounded research and facts
    const store = useBrandStore.getState();
    store.createProject(
      'Kintra Pull Request Verification',
      'Deterministic AST-level pull request security and code correctness for high-velocity software engineering teams.'
    );
    store.loadDemoProject();
  });

  it('navigates through the complete lifecycle from raw founder idea to verified Launch Kit and Brand Guidelines export', async () => {
    // ---------------------------------------------------------
    // STEP 1: Intake & Discovery State
    // ---------------------------------------------------------
    const initialProject = useBrandStore.getState().project;
    expect(initialProject.metadata.name).toBeDefined();
    expect(initialProject.extractedFacts.length).toBeGreaterThan(0);
    expect(initialProject.marketLandscape?.evidenceRecords.length).toBeGreaterThan(0);

    // ---------------------------------------------------------
    // STEP 2: Strategic Positioning Worlds & Decision Graph
    // ---------------------------------------------------------
    await useBrandStore.getState().generatePositioningWorlds();
    const worlds = useBrandStore.getState().project.positioningWorlds;
    expect(worlds.length).toBeGreaterThanOrEqual(3);

    const puristWorld =
      worlds.find((w) => w.archetype === 'The Engineering Purist') || worlds[0];
    useBrandStore
      .getState()
      .selectPositioningWorld(
        puristWorld.id,
        'Engineering rigor over superficial generic AI copilot wrappers'
      );

    expect(useBrandStore.getState().project.selectedWorldId).toBe(puristWorld.id);
    const posDecision = Object.values(
      useBrandStore.getState().project.decisionGraph.nodes
    ).find((n) => n.category === 'positioning_world');
    expect(posDecision).toBeDefined();

    // ---------------------------------------------------------
    // STEP 3: Creative Identity (Naming, Voice, Visuals)
    // ---------------------------------------------------------
    await useBrandStore.getState().generateCreativeIdentity();
    const identity = useBrandStore.getState().project.creativeIdentity;
    expect(identity).not.toBeNull();
    expect(identity!.namingCandidates.length).toBeGreaterThan(0);
    expect(identity!.personalityTraits.length).toBeGreaterThan(0);
    expect(identity!.voiceSystem.bannedPatterns.length).toBeGreaterThan(0);

    // Select name and approve identity
    const kintraCandidate =
      identity!.namingCandidates.find((n) => n.name.toLowerCase().includes('kintra')) ||
      identity!.namingCandidates[0];
    useBrandStore.getState().selectName(kintraCandidate.id);
    useBrandStore
      .getState()
      .approveCreativeIdentity('Approved deterministic visual and voice guidelines');
    expect(useBrandStore.getState().project.stage).toBe('identity_locked');

    // ---------------------------------------------------------
    // STEP 4: Consistency Guardian Artifact Validation
    // ---------------------------------------------------------
    await useBrandStore.getState().generateArtifact('website_headline');
    const brandArtifacts = useBrandStore.getState().project.brandArtifacts || [];
    expect(brandArtifacts.length).toBeGreaterThan(0);

    const headlineArtifact = brandArtifacts.find((a) => a.artifactType === 'website_headline');
    expect(headlineArtifact).toBeDefined();
    expect(headlineArtifact?.validationReport?.passed).toBe(true);
    expect(headlineArtifact?.validationReport?.dimensions.strategic_alignment.status).toBe('pass');

    // ---------------------------------------------------------
    // STEP 5: Scenario Lab Simulation
    // ---------------------------------------------------------
    const scenarioSuccess = await useBrandStore.getState().runScenarioTest('website_launch');
    expect(scenarioSuccess).toBe(true);

    const scenarios = useBrandStore.getState().scenarioArtifacts;
    expect(scenarios.length).toBeGreaterThan(0);
    const activeScenario = scenarios[0];

    // Verify Tri-State comparison (Raw vs Brand-Aware vs Validated Final)
    expect(activeScenario.rawGeneration.content).toContain('copilot');
    expect(activeScenario.brandAwareGeneration.content).toBeDefined();
    expect(activeScenario.validatedFinal.content).toBeDefined();
    expect(activeScenario.lineage.worldId).toBe(puristWorld.id);

    // ---------------------------------------------------------
    // STEP 6: Practical Output Layer: Launch Kit & Brand Guidelines
    // ---------------------------------------------------------
    const launchKitSuccess = await useBrandStore.getState().generateLaunchKit();
    expect(launchKitSuccess).toBe(true);

    const kit = useBrandStore.getState().launchKit;
    expect(kit).not.toBeNull();

    // Verify conformity to strict Zod schema
    const schemaValidation = LaunchKitSchema.safeParse(kit);
    expect(schemaValidation.success).toBe(true);

    // Verify all 8 core deliverables
    expect(kit!.items).toHaveLength(8);
    const requiredTypes = [
      'one_line_pitch',
      'homepage_hero',
      'homepage_supporting_copy',
      'launch_announcement',
      'social_post',
      'launch_email',
      'elevator_pitch',
      'brand_summary',
    ];
    const generatedTypes = kit!.items.map((item) => item.type);
    requiredTypes.forEach((reqType) => {
      expect(generatedTypes).toContain(reqType);
    });

    // Verify causal lineage on every deliverable
    kit!.items.forEach((item) => {
      expect(item.lineage.worldId).toBe(puristWorld.id);
      expect(item.lineage.worldArchetype).toBe(puristWorld.archetype);
      expect(item.lineage.governingDecisionIds.length).toBeGreaterThan(0);
      expect(item.lineage.generatedAt).toBeDefined();
    });

    // Verify Brand Guidelines completeness
    const guidelines = kit!.guidelines;
    expect(guidelines.brandName).toBeDefined();
    expect(guidelines.positioning.targetAudience).toBeDefined();
    expect(guidelines.positioning.proofMechanism).toBeDefined();
    expect(guidelines.voice.vocabularyRules.preferredWords.length).toBeGreaterThan(0);
    expect(guidelines.voice.vocabularyRules.forbiddenWords).toContain('supercharge');
    expect(guidelines.visualDirection.primaryColor).toBeDefined();
    expect(guidelines.visualDirection.typographyPairing.monoFont).toContain('JetBrains Mono');
    expect(guidelines.naming.pronunciation).toBeDefined();
    expect(guidelines.doAndDontExamples.length).toBeGreaterThanOrEqual(5);

    // ---------------------------------------------------------
    // STEP 7: Export Formats & Shareable Presentation Mode
    // ---------------------------------------------------------
    // Markdown export
    const markdownContent = useBrandStore.getState().exportLaunchKit('markdown');
    expect(typeof markdownContent).toBe('string');
    expect(markdownContent).toContain('# KINTRA — BRAND BOOK & LAUNCH KIT');
    expect(markdownContent).toContain('## TABLE OF CONTENTS');
    expect(markdownContent).toContain('## 7. DO AND DON\'T EDITORIAL MATRIX');
    expect(markdownContent).toContain('## 8. COMPLETE LAUNCH KIT ARTIFACTS');

    // JSON export
    const jsonContent = useBrandStore.getState().exportLaunchKit('json');
    expect(typeof jsonContent).toBe('string');
    const parsedJson = JSON.parse(jsonContent);
    expect(parsedJson.brandName).toBe(guidelines.brandName);
    expect(parsedJson.items).toHaveLength(8);

    // Presentation Mode toggle
    expect(useBrandStore.getState().isPresentationModeOpen).toBe(false);
    useBrandStore.getState().togglePresentationMode(true);
    expect(useBrandStore.getState().isPresentationModeOpen).toBe(true);
    useBrandStore.getState().togglePresentationMode(false);
    expect(useBrandStore.getState().isPresentationModeOpen).toBe(false);

    // Stage progression verification
    expect(useBrandStore.getState().project.stage).toBe('launch_kit');
  });
});
