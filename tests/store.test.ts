import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '@/store/useBrandStore';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';

describe('useBrandStore Workspace & User Control', () => {
  beforeEach(() => {
    useBrandStore.getState().resetProject();
  });

  it('initializes with a clean, uncommitted brand state', () => {
    const { project } = useBrandStore.getState();
    expect(project.stage).toBe('intake');
    expect(project.extractedFacts).toHaveLength(0);
    expect(project.ideaBrief).toBeNull();
    expect(Object.keys(project.decisions)).toHaveLength(0);
  });

  it('creates a new project with slug and metadata', () => {
    useBrandStore.getState().createProject('My Test SaaS', 'An automated invoicing agent.');
    const { project } = useBrandStore.getState();

    expect(project.metadata.name).toBe('My Test SaaS');
    expect(project.metadata.slug).toBe('my-test-saas');
    expect(project.rawFounderInput).toBe('An automated invoicing agent.');
  });

  it('loads sample demo project with full epistemic separation', () => {
    useBrandStore.getState().loadDemoProject();
    const { project } = useBrandStore.getState();

    expect(project.metadata.isDemoProject).toBe(true);
    expect(project.extractedFacts.length).toBeGreaterThan(0);
    expect(project.hypotheses.length).toBeGreaterThan(0);
    expect(project.ideaBrief).not.toBeNull();
    expect(project.ideaBrief?.status).toBe('under_review');
  });

  it('persists user corrections to facts and sets verified flag', () => {
    useBrandStore.getState().loadDemoProject();
    const factId = DEMO_BRAND_PRGUARD.extractedFacts[0].id;

    useBrandStore.getState().updateFact(factId, 'Updated verified requirement.', true);
    const { project } = useBrandStore.getState();
    const updated = project.extractedFacts.find((f) => f.id === factId);

    expect(updated?.statement).toBe('Updated verified requirement.');
    expect(updated?.verifiedByUser).toBe(true);
    expect(updated?.source).toBe('user_edited');
  });

  it('never marks AI output as an approved decision automatically', () => {
    useBrandStore.getState().loadDemoProject();
    const { project } = useBrandStore.getState();

    // AI generated brief exists, but decisions must NOT contain it automatically
    expect(project.ideaBrief?.status).toBe('under_review');
    expect(project.stage).toBe('brief_review');
    expect(Object.keys(project.decisions)).toHaveLength(0);
  });

  it('locks decision only upon explicit user approval', () => {
    useBrandStore.getState().loadDemoProject();
    useBrandStore.getState().approveIdeaBrief('Founder checked and approved baseline.');

    const { project, snapshots } = useBrandStore.getState();
    expect(project.ideaBrief?.status).toBe('approved');
    expect(project.stage).toBe('strategy_locked');
    expect(Object.keys(project.decisions).length).toBe(1);

    const firstDecision = Object.values(project.decisions)[0];
    expect(firstDecision.approvedBy).toBe('founder');
    expect(firstDecision.rationale).toBe('Founder checked and approved baseline.');
    expect(snapshots.length).toBeGreaterThan(0);
  });

  it('records rejection reason when user rejects the brief', () => {
    useBrandStore.getState().loadDemoProject();
    useBrandStore.getState().rejectIdeaBrief('Niche is too crowded, need narrower B2B focus.');

    const { project } = useBrandStore.getState();
    expect(project.ideaBrief?.status).toBe('rejected');
    expect(project.ideaBrief?.rejectionReason).toBe(
      'Niche is too crowded, need narrower B2B focus.'
    );
  });

  it('exports and round-trips state through JSON export/import including launchKit and branches', () => {
    useBrandStore.getState().loadDemoProject();
    useBrandStore.getState().createBranch('Experimental Branch');
    const exportedJson = useBrandStore.getState().exportProjectJSON();

    useBrandStore.getState().resetProject();
    expect(useBrandStore.getState().project.extractedFacts).toHaveLength(0);
    expect(useBrandStore.getState().branches).toHaveLength(0);

    const importResult = useBrandStore.getState().importProjectJSON(exportedJson);
    expect(importResult.success).toBe(true);
    expect(useBrandStore.getState().project.metadata.name).toBe('PRGuard Security');
    expect(useBrandStore.getState().branches.length).toBeGreaterThan(0);
  });

  it('creates and restores version snapshots', () => {
    useBrandStore.getState().loadDemoProject();
    useBrandStore.getState().createSnapshot('Baseline Snapshot');

    const snapId = useBrandStore.getState().snapshots[0].id;
    useBrandStore.getState().resetProject(true);
    expect(useBrandStore.getState().project.metadata.name).toBe('Untitled Brand Project');

    const restored = useBrandStore.getState().rollbackToSnapshot(snapId);
    expect(restored).toBe(true);
    expect(useBrandStore.getState().project.metadata.name).toBe('PRGuard Security');
  });

  it('caps snapshots array to maximum 10 items to prevent unbounded memory growth', () => {
    useBrandStore.getState().loadDemoProject();

    for (let i = 1; i <= 15; i++) {
      useBrandStore.getState().createSnapshot(`Snapshot #${i}`);
    }

    const { snapshots } = useBrandStore.getState();
    expect(snapshots.length).toBeLessThanOrEqual(10);
    expect(snapshots[0].label).toBe('Snapshot #15');
  });

  it('ensures brief-baseline node exists in decision graph on brief approval', () => {
    useBrandStore.getState().loadDemoProject();
    useBrandStore.getState().approveIdeaBrief('Approved baseline.');

    const { project } = useBrandStore.getState();
    expect(project.decisionGraph.nodes['brief-baseline']).toBeDefined();
    expect(project.decisionGraph.nodes['brief-baseline'].category).toBe('problem_framing');
    expect(project.decisionGraph.nodes['brief-baseline'].governs).toContain('positioning_world');
  });

  it('ensures brief-baseline node is not dangling when selecting positioning world directly', () => {
    useBrandStore.getState().loadDemoProject();
    const worldId = useBrandStore.getState().project.positioningWorlds[0]?.id;
    if (worldId) {
      useBrandStore.getState().selectPositioningWorld(worldId, 'Selected strategy territory');
      const { project } = useBrandStore.getState();
      expect(project.decisionGraph.nodes['brief-baseline']).toBeDefined();
      const edge = project.decisionGraph.edges.find((e) => e.source === 'brief-baseline');
      expect(edge).toBeDefined();
    }
  });

  it('synchronizes top-level scenarioArtifacts and launchKit on rollback and import', () => {
    useBrandStore.getState().loadDemoProject();
    const demoLaunchKit = useBrandStore.getState().project.launchKit;

    // Snapshot state
    useBrandStore.getState().createSnapshot('Demo Snapshot');
    const snapId = useBrandStore.getState().snapshots[0].id;

    // Reset project
    useBrandStore.getState().resetProject(true);
    expect(useBrandStore.getState().launchKit).toBeNull();
    expect(useBrandStore.getState().scenarioArtifacts).toHaveLength(0);

    // Rollback
    useBrandStore.getState().rollbackToSnapshot(snapId);
    if (demoLaunchKit) {
      expect(useBrandStore.getState().launchKit).not.toBeNull();
    }
  });

  it('caps branch creation to 5 to protect memory and local storage quota', () => {
    useBrandStore.getState().loadDemoProject();

    for (let i = 1; i <= 8; i++) {
      useBrandStore.getState().createBranch(`Branch Variant #${i}`);
    }

    const { branches } = useBrandStore.getState();
    expect(branches.length).toBeLessThanOrEqual(5);
    expect(branches[branches.length - 1].name).toBe('Branch Variant #8');
  });

  it('cancels in-flight operations and resets loading state via cancelOperation', () => {
    useBrandStore.setState({ isLoading: true, loadingMessage: 'Running deep synthesis...' });
    expect(useBrandStore.getState().isLoading).toBe(true);

    useBrandStore.getState().cancelOperation('discovery_intake');
    expect(useBrandStore.getState().isLoading).toBe(false);
    expect(useBrandStore.getState().loadingMessage).toBe('');
  });
});

