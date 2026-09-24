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

  it('exports and round-trips state through JSON export/import', () => {
    useBrandStore.getState().loadDemoProject();
    const exportedJson = useBrandStore.getState().exportProjectJSON();

    useBrandStore.getState().resetProject();
    expect(useBrandStore.getState().project.extractedFacts).toHaveLength(0);

    const importResult = useBrandStore.getState().importProjectJSON(exportedJson);
    expect(importResult.success).toBe(true);
    expect(useBrandStore.getState().project.metadata.name).toBe('PRGuard Security');
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
});
