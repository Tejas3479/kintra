import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '@/store/useBrandStore';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { IdentityService } from '@/lib/identity/identity-service';
import { AntiGenericNamer } from '@/lib/identity/anti-generic-namer';
import { IdentityConsistencyChecker } from '@/lib/identity/identity-consistency-checker';
import { DefaultImageGenerationProvider } from '@/lib/identity/image-provider';
import {
  CreativeIdentitySchema,
  BrandPersonalityTraitSchema,
  NamingCandidateSchema,
  VisualSystemSchema,
  IdentityConsistencyConflictSchema,
} from '@/lib/schemas/identity-schemas';
import {
  NamingCandidate,
  TaglineCandidate,
  VoiceSystem,
  VisualSystem,
} from '@/types/identity';

describe('Creative Identity & Visual Brand System Suite (Prompt 08)', () => {
  beforeEach(() => {
    useBrandStore.getState().resetProject();
  });

  // ==========================================
  // 1. ZOD SCHEMA VALIDATION
  // ==========================================
  describe('Identity Zod Schemas', () => {
    it('validates a complete, structurally sound CreativeIdentity object', async () => {
      const brief = DEMO_BRAND_PRGUARD.ideaBrief;
      const worlds = StrategyService.generateWorlds(brief);
      const selectedWorld = worlds[0];

      const identity = await IdentityService.generateIdentity(selectedWorld, brief);
      const parseResult = CreativeIdentitySchema.safeParse(identity);

      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.personalityTraits.length).toBeGreaterThanOrEqual(3);
        expect(parseResult.data.namingTerritories.length).toBeGreaterThanOrEqual(2);
        expect(parseResult.data.namingCandidates.length).toBeGreaterThanOrEqual(3);
        expect(parseResult.data.taglineCandidates.length).toBeGreaterThanOrEqual(2);
        expect(parseResult.data.voiceSystem.tonalSliders.precision).toBeGreaterThan(0);
        expect(parseResult.data.visualSystem.palette.primary.hex).toMatch(/^#/);
      }
    });

    it('rejects invalid BrandPersonalityTrait if confidence is out of 0-1 bounds', () => {
      const invalidTrait = {
        id: 'trait-invalid',
        name: 'Surgical Precision',
        definition: 'Exact and unyielding code review enforcement',
        audienceRelevance: 'Senior Engineers require zero noise',
        strategicBasis: 'Eliminate false alarms',
        behaviorExamples: ['Provide line references with test repros'],
        traitToAvoid: 'Never post speculative warnings',
        confidence: 1.5, // Invalid: must be <= 1
      };

      const result = BrandPersonalityTraitSchema.safeParse(invalidTrait);
      expect(result.success).toBe(false);
    });

    it('rejects NamingCandidate if missing required legal disclaimer', () => {
      const invalidCandidate = {
        id: 'name-test-1',
        name: 'VigilPR',
        territoryId: 'territory-1',
        territoryName: 'Root Morphemes',
        rationale: 'Crisp plosive communicating vigilance and alertness.',
        semanticAssociation: 'Vigilant guard against regression bugs.',
        pronunciation: 'VIH-jil-P-R',
        possibleAmbiguity: 'None detected',
        genericnessRisk: 'low',
        antiGenericFlags: [],
        strategicFit: 'Directly aligns with zero noise positioning.',
        confidence: 0.9,
        status: 'candidate',
        // legalDisclaimer is intentionally missing
      };

      const result = NamingCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
    });

    it('validates VisualSystemSchema with valid hex color tokens and typography', async () => {
      const brief = DEMO_BRAND_PRGUARD.ideaBrief;
      const worlds = StrategyService.generateWorlds(brief);
      const identity = await IdentityService.generateIdentity(worlds[0], brief);

      const result = VisualSystemSchema.safeParse(identity.visualSystem);
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // 2. ANTI-GENERIC NAMING SCANNER
  // ==========================================
  describe('AntiGenericNamer Scanner', () => {
    it('flags startup cliché suffixes like -ly, -ify, -ops, and -ai', () => {
      const auditLy = AntiGenericNamer.auditName('Reviewly');
      expect(auditLy.flags.some((f) => f.includes('-ly'))).toBe(true);
      expect(auditLy.genericnessRisk).toBe('medium');

      const auditIfy = AntiGenericNamer.auditName('Codeify', 'code review');
      expect(auditIfy.flags.some((f) => f.includes('-ify'))).toBe(true);

      const auditOps = AntiGenericNamer.auditName('ReviewOps', 'code review');
      expect(auditOps.flags.some((f) => f.includes('-ops'))).toBe(true);

      const auditAi = AntiGenericNamer.auditName('PrAI', 'code review');
      expect(auditAi.flags.some((f) => f.includes('-ai'))).toBe(true);
    });

    it('flags category metaphors and buzzwords (copilot, shield, bot, sync, cloud)', () => {
      const auditCopilot = AntiGenericNamer.auditName('CodeCopilot', 'software engineering');
      expect(auditCopilot.flags.some((f) => f.toLowerCase().includes('copilot'))).toBe(true);

      const auditShield = AntiGenericNamer.auditName('CloudShield', 'security scanner');
      expect(auditShield.flags.some((f) => f.toLowerCase().includes('shield'))).toBe(true);
    });

    it('flags vowel-dropping gimmicks (e.g. Fndr, Prgrd)', () => {
      const auditVowel = AntiGenericNamer.auditName('Prgrd', 'code review');
      expect(auditVowel.flags.some((f) => f.toLowerCase().includes('vowel-stripping'))).toBe(true);
    });

    it('assigns high genericness score when multiple clichés collide', () => {
      const audit = AntiGenericNamer.auditName('ShieldCopilotly.ai', 'security');
      expect(audit.genericnessRisk).toBe('high');
      expect(audit.flags.length).toBeGreaterThanOrEqual(3);
    });

    it('gives clean ratings to distinctive, root-morpheme names', () => {
      const audit = AntiGenericNamer.auditName('Vigil', 'code review');
      expect(audit.genericnessRisk).toBe('low');
      expect(audit.flags).toHaveLength(0);
      expect(audit.recommendations.some((r) => r.includes('distinctive'))).toBe(true);
    });

    it('always attaches a strict legal disclaimer that forbids claiming legal clearance', () => {
      const audit = AntiGenericNamer.auditName('Kintra', 'brand engine');
      expect(audit.legalDisclaimer).toBeDefined();
      expect(audit.legalDisclaimer).toContain('Not legal clearance');
    });
  });

  // ==========================================
  // 3. IDENTITY CONSISTENCY CHECKER
  // ==========================================
  describe('IdentityConsistencyChecker', () => {
    it('flags name_voice_conflict when playful or cutesy name is paired with clinical/formal voice', async () => {
      const world = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief)[0];
      const identity = await IdentityService.generateIdentity(world, DEMO_BRAND_PRGUARD.ideaBrief);

      // Force a playful candidate name
      const playfulCandidate: NamingCandidate = {
        ...identity.namingCandidates[0],
        name: 'HappyReviewBot',
        semanticAssociation: 'Whimsical and bubbly emoji assistant',
      };

      // Set voice to highly clinical (precision > 75, warmth < 30)
      const clinicalVoice: VoiceSystem = {
        ...identity.voiceSystem,
        tonalSliders: {
          precision: 95,
          warmth: 15,
          authority: 90,
          energy: 40,
        },
      };

      const conflicts = IdentityConsistencyChecker.auditConsistency({
        selectedName: playfulCandidate,
        voiceSystem: clinicalVoice,
        positioningWorld: world,
      });

      expect(conflicts.some((c) => c.layerA === 'name' && c.layerB === 'voice')).toBe(true);
      const nameVoiceConflict = conflicts.find((c) => c.layerA === 'name' && c.layerB === 'voice');
      expect(nameVoiceConflict?.severity).toBe('blocking');
      expect(IdentityConsistencyConflictSchema.safeParse(nameVoiceConflict).success).toBe(true);
    });

    it('flags tagline_positioning_conflict when all-in-one tagline contradicts specialist positioning sacrifice', async () => {
      const world = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief)[0]; // Has archetype: 'The Engineering Purist'
      const identity = await IdentityService.generateIdentity(world, DEMO_BRAND_PRGUARD.ideaBrief);

      const broadTagline: TaglineCandidate = {
        id: 'tag-broad-1',
        tagline: 'The all-in-one complete suite for every single engineering team in the world.',
        supportingWorldId: world.id,
        strategicMechanism: 'Mass appeal',
        falsifiabilityScore: 0.1,
        status: 'candidate',
      };

      const conflicts = IdentityConsistencyChecker.auditConsistency({
        selectedTagline: broadTagline,
        positioningWorld: world,
        voiceSystem: identity.voiceSystem,
      });

      expect(conflicts.some((c) => c.layerA === 'tagline' && c.layerB === 'positioning')).toBe(true);
      const taglineConflict = conflicts.find((c) => c.layerA === 'tagline' && c.layerB === 'positioning');
      expect(taglineConflict?.severity).toBe('blocking');
    });

    it('flags voice_visual_conflict when clinical voice is paired with bubble rounded visual styling', async () => {
      const world = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief)[0];
      const identity = await IdentityService.generateIdentity(world, DEMO_BRAND_PRGUARD.ideaBrief);

      const clinicalVoice: VoiceSystem = {
        ...identity.voiceSystem,
        tonalSliders: {
          precision: 90,
          warmth: 20,
          authority: 85,
          energy: 50,
        },
      };

      const bubbleVisual: VisualSystem = {
        ...identity.visualSystem,
        shapes: {
          ...identity.visualSystem.shapes,
          borderRadius: 'rounded-2xl',
        },
      };

      const conflicts = IdentityConsistencyChecker.auditConsistency({
        voiceSystem: clinicalVoice,
        visualSystem: bubbleVisual,
        positioningWorld: world,
      });

      expect(conflicts.some((c) => c.layerA === 'voice' && c.layerB === 'visual')).toBe(true);
    });

    it('reports zero blocking conflicts when identity components are aligned with positioning', async () => {
      const world = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief)[0];
      const identity = await IdentityService.generateIdentity(world, DEMO_BRAND_PRGUARD.ideaBrief);

      const conflicts = IdentityConsistencyChecker.auditConsistency({
        selectedName: identity.namingCandidates[0],
        selectedTagline: identity.taglineCandidates[0],
        voiceSystem: identity.voiceSystem,
        visualSystem: identity.visualSystem,
        positioningWorld: world,
      });

      const blocking = conflicts.filter((c) => c.severity === 'blocking');
      expect(blocking).toHaveLength(0);
    });
  });

  // ==========================================
  // 4. IMAGE GENERATION PROVIDER & FALLBACK
  // ==========================================
  describe('ImageGenerationProvider & SvgBrandVisualGenerator', () => {
    it('generates an SVG brand mark vector asset deterministically without network calls', async () => {
      const provider = new DefaultImageGenerationProvider();
      const result = await provider.generateVisual({
        positioningArchetype: 'The Engineering Purist',
        brandName: 'Vigil',
        tagline: 'Three comments or zero.',
        primaryHex: '#0D1117',
        secondaryHex: '#161B22',
        accentHex: '#10B981',
        visualMetaphors: ['Target crosshair', 'Diamond syntax boundary'],
        audience: 'Staff Engineers',
        borderRadius: 'rounded-none',
        assetType: 'brand_mark',
      });

      expect(result.success).toBe(true);
      expect(result.asset.assetType).toBe('brand_mark');
      expect(result.asset.svgContent).toBeDefined();
      expect(result.asset.svgContent).toContain('<svg');
      expect(result.asset.svgContent).toContain('VIGIL');
      expect(result.asset.svgContent).toContain('#10B981');
      expect(result.asset.isFallback).toBe(false);
    });

    it('falls back gracefully on missing or minimal parameters', async () => {
      const provider = new DefaultImageGenerationProvider();
      const result = await provider.generateVisual({
        positioningArchetype: 'The Institutional Gatekeeper',
        brandName: 'Kintra',
        tagline: 'Cryptographic policy enforcement.',
        primaryHex: '#000000',
        secondaryHex: '#222222',
        accentHex: '#3B82F6',
        visualMetaphors: [],
        audience: 'Security Officers',
        borderRadius: 'rounded-md',
        assetType: 'brand_mark',
      });

      expect(result.success).toBe(true);
      expect(result.asset.svgContent).toContain('<svg');
      expect(result.asset.svgContent).toContain('KINTRA');
    });
  });

  // ==========================================
  // 5. BRAND STORE INTEGRATION & GRAPH COMMITMENTS
  // ==========================================
  describe('BrandStore Creative Identity Integration', () => {
    it('prevents generating creative identity if positioning world is not locked', async () => {
      useBrandStore.getState().loadDemoProject();
      // Reset selectedWorldId
      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          selectedWorldId: null,
        },
      }));

      const res = await useBrandStore.getState().generateCreativeIdentity();
      expect(res).toBe(false);

      const { project } = useBrandStore.getState();
      expect(project.creativeIdentity).toBeNull();
    });

    it('generates and populates creative identity when positioning world is locked', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);

      const res = await useBrandStore.getState().generateCreativeIdentity();
      expect(res).toBe(true);

      const { project } = useBrandStore.getState();
      expect(project.creativeIdentity).toBeDefined();
      expect(project.creativeIdentity?.personalityTraits.length).toBeGreaterThanOrEqual(3);
      expect(project.stage).toBe('identity');
    });

    it('commits approved Name candidate and records rejection reasons for others', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);
      await useBrandStore.getState().generateCreativeIdentity();

      const candidate = useBrandStore.getState().project.creativeIdentity!.namingCandidates[0];
      const otherCandidate = useBrandStore.getState().project.creativeIdentity!.namingCandidates[1];

      // Reject other candidate
      useBrandStore.getState().rejectName(otherCandidate.id, 'Sounds too derivative of legacy tooling.');
      // Select candidate
      useBrandStore.getState().selectName(candidate.id);

      const { project } = useBrandStore.getState();
      expect(project.creativeIdentity?.selectedNameId).toBe(candidate.id);

      const rejected = project.creativeIdentity?.namingCandidates.find((c) => c.id === otherCandidate.id);
      expect(rejected?.status).toBe('rejected');
      expect(rejected?.rejectionReason).toBe('Sounds too derivative of legacy tooling.');
    });

    it('selects Tagline and audits consistency', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);
      await useBrandStore.getState().generateCreativeIdentity();

      const tagline = useBrandStore.getState().project.creativeIdentity!.taglineCandidates[0];
      useBrandStore.getState().selectTagline(tagline.id);

      const { project } = useBrandStore.getState();
      expect(project.creativeIdentity?.selectedTaglineId).toBe(tagline.id);

      const selected = project.creativeIdentity?.taglineCandidates.find((t) => t.id === tagline.id);
      expect(selected?.status).toBe('selected');
    });

    it('updates voice tonal sliders and visual palette colors interactively', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);
      await useBrandStore.getState().generateCreativeIdentity();

      // Update precision slider
      useBrandStore.getState().updateVoiceTonalSlider('precision', 98);
      expect(useBrandStore.getState().project.creativeIdentity?.voiceSystem.tonalSliders.precision).toBe(98);

      // Update primary palette color
      useBrandStore.getState().updateVisualPaletteColor('primary', '#0B0F19');
      expect(useBrandStore.getState().project.creativeIdentity?.visualSystem.palette.primary.hex).toBe('#0B0F19');
    });

    it('generates visual asset and stores it in creativeIdentity.generatedVisuals', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);
      await useBrandStore.getState().generateCreativeIdentity();

      const res = await useBrandStore.getState().generateVisualAsset('brand_mark');
      expect(res).toBe(true);

      const { project } = useBrandStore.getState();
      expect(project.creativeIdentity?.generatedVisuals.length).toBeGreaterThanOrEqual(1);
      expect(project.creativeIdentity?.generatedVisuals[0].assetType).toBe('brand_mark');
      expect(project.creativeIdentity?.generatedVisuals[0].svgContent).toContain('<svg');
    });

    it('approves creative identity, advances stage to identity_locked, and commits Name and Tagline nodes into Decision Graph', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);
      await useBrandStore.getState().generateCreativeIdentity();

      const candidate = useBrandStore.getState().project.creativeIdentity!.namingCandidates[0];
      const tagline = useBrandStore.getState().project.creativeIdentity!.taglineCandidates[0];
      useBrandStore.getState().selectName(candidate.id);
      useBrandStore.getState().selectTagline(tagline.id);

      const versionBefore = useBrandStore.getState().project.metadata.version;
      useBrandStore.getState().approveCreativeIdentity('Approved sharp minimalist developer identity.');

      const { project, snapshots } = useBrandStore.getState();
      expect(project.stage).toBe('identity_locked');
      expect(project.metadata.version).toBeGreaterThan(versionBefore);
      expect(snapshots.some((s) => s.label.includes('Approved Creative Identity'))).toBe(true);

      // Verify Decision Graph Nodes
      const decisionNodes = Object.values(project.decisionGraph.nodes);
      const nameNode = decisionNodes.find((n) => n.title.includes(candidate.name));
      const taglineNode = decisionNodes.find((n) => n.title.includes(tagline.tagline));

      expect(nameNode).toBeDefined();
      expect(nameNode?.approvedValue).toBe(candidate.name);
      expect(taglineNode).toBeDefined();
      expect(taglineNode?.approvedValue).toBe(tagline.tagline);
      expect(Object.keys(project.decisions)).toContain(nameNode!.id);
      expect(Object.keys(project.decisions)).toContain(taglineNode!.id);
    });

    it('preserves creative identity and decision graph across JSON export and import', async () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));
      useBrandStore.getState().selectPositioningWorld(worlds[0].id);
      await useBrandStore.getState().generateCreativeIdentity();

      const candidate = useBrandStore.getState().project.creativeIdentity!.namingCandidates[0];
      const tagline = useBrandStore.getState().project.creativeIdentity!.taglineCandidates[0];
      useBrandStore.getState().selectName(candidate.id);
      useBrandStore.getState().selectTagline(tagline.id);
      useBrandStore.getState().approveCreativeIdentity();

      const exported = useBrandStore.getState().exportProjectJSON();

      // Reset store completely
      useBrandStore.getState().resetProject();
      expect(useBrandStore.getState().project.creativeIdentity).toBeNull();

      // Import exported JSON
      const res = useBrandStore.getState().importProjectJSON(exported);
      expect(res.success).toBe(true);

      const reloaded = useBrandStore.getState().project;
      expect(reloaded.creativeIdentity).toBeDefined();
      expect(reloaded.creativeIdentity?.selectedNameId).toBe(candidate.id);
      expect(reloaded.stage).toBe('identity_locked');
      expect(Object.keys(reloaded.decisionGraph.nodes).length).toBeGreaterThanOrEqual(3);
    });
  });
});
