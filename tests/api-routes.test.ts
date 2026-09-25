import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as discoveryPost } from '@/app/api/discovery/route';
import { POST as researchPost } from '@/app/api/research/route';
import { POST as strategyPost } from '@/app/api/strategy/route';
import { POST as identityPost } from '@/app/api/identity/route';
import { POST as guardianPost } from '@/app/api/guardian/route';
import { POST as evolutionPost } from '@/app/api/evolution/route';
import { POST as launchKitPost } from '@/app/api/launch-kit/route';

import { DEMO_BRAND_PRGUARD, INITIAL_DEMO_PROJECT } from '@/fixtures/demo-brands';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import { ScenarioLabEngine } from '@/lib/evolution/scenario-lab-engine';
import { LaunchKitEngine } from '@/lib/launch-kit/launch-kit-engine';
import { BrandBranch } from '@/types/evolution';

function makeRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API Routes Integration & Strict Schema Validation Suite', () => {
  // Setup baseline state
  const demoBrief = DEMO_BRAND_PRGUARD.ideaBrief;
  const worlds = StrategyService.generateWorlds(demoBrief, []);
  const testWorld = worlds[0];
  const demoProject = {
    ...INITIAL_DEMO_PROJECT,
    positioningWorlds: worlds,
    selectedWorldId: testWorld.id,
  };

  describe('1. /api/discovery', () => {
    it('handles action: intake successfully with >= 10 chars', async () => {
      const req = makeRequest('/api/discovery', {
        action: 'intake',
        rawIdea: 'Automated CI security tool that catches logic flaws in GitHub PRs.',
      });
      const res = await discoveryPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.extractedFacts.length).toBeGreaterThan(0);
      expect(json.data.hypotheses.length).toBeGreaterThan(0);
    });

    it('rejects action: intake with < 10 chars with 400 Bad Request', async () => {
      const req = makeRequest('/api/discovery', {
        action: 'intake',
        rawIdea: 'Too short',
      });
      const res = await discoveryPost(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it('handles action: next_question successfully', async () => {
      const req = makeRequest('/api/discovery', {
        action: 'next_question',
        history: [],
        rawIdea: 'AI security reviewer for pull requests.',
      });
      const res = await discoveryPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
    });

    it('handles action: synthesize successfully', async () => {
      const req = makeRequest('/api/discovery', {
        action: 'synthesize',
        rawIdea: 'AI security reviewer for pull requests.',
        facts: DEMO_BRAND_PRGUARD.extractedFacts,
        assumptions: DEMO_BRAND_PRGUARD.hypotheses,
        history: [],
      });
      const res = await discoveryPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.problem).toBeDefined();
    });

    it('rejects unrecognized action with 400 Bad Request', async () => {
      const req = makeRequest('/api/discovery', {
        action: 'invalid_action_xyz',
      });
      const res = await discoveryPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('2. /api/research', () => {
    it('processes valid market query and returns validated MarketLandscape', async () => {
      const req = makeRequest('/api/research', {
        query: 'Developer pull request code security',
        rawIdea: 'PR security audit tool',
      });
      const res = await researchPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.categoryName).toBeDefined();
      expect(json.data.competitors.length).toBeGreaterThan(0);
    });

    it('rejects empty query with 400 Bad Request', async () => {
      const req = makeRequest('/api/research', {
        query: '',
      });
      const res = await researchPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('3. /api/strategy', () => {
    it('generates high-contrast positioning worlds from IdeaBrief', async () => {
      const req = makeRequest('/api/strategy', {
        action: 'generate_worlds',
        brief: demoBrief,
        evidenceRecords: [],
      });
      const res = await strategyPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.worlds.length).toBeGreaterThanOrEqual(3);
    });

    it('audits contradictions for a positioning world', async () => {
      const req = makeRequest('/api/strategy', {
        action: 'audit_contradictions',
        world: testWorld,
        evidenceRecords: [],
      });
      const res = await strategyPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('rejects invalid action with 400 Bad Request', async () => {
      const req = makeRequest('/api/strategy', {
        action: 'unknown_strategy_action',
      });
      const res = await strategyPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('4. /api/identity', () => {
    it('generates creative identity from approved positioning world', async () => {
      const req = makeRequest('/api/identity', {
        action: 'generate_identity',
        world: testWorld,
        brief: demoBrief,
        evidenceRecords: [],
      });
      const res = await identityPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.namingCandidates.length).toBeGreaterThan(0);
      expect(json.data.voiceSystem).toBeDefined();
    });

    it('audits identity consistency across layers', async () => {
      const req = makeRequest('/api/identity', {
        action: 'audit_consistency',
        positioningWorld: testWorld,
      });
      const res = await identityPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('audits naming candidates with anti-generic heuristic', async () => {
      const req = makeRequest('/api/identity', {
        action: 'audit_name',
        name: 'SmartPRGuardAI',
        categoryFraming: 'Developer Tooling',
      });
      const res = await identityPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.genericnessRisk).toBeDefined();
      expect(json.data.flags).toBeDefined();
    });

    it('generates deterministic SVG brand visual asset', async () => {
      const req = makeRequest('/api/identity', {
        action: 'generate_visual',
        promptContext: {
          positioningArchetype: 'The Engineering Purist',
          brandName: 'Kintra',
          tagline: 'Deterministic Logic Audits',
          primaryHex: '#09090b',
          secondaryHex: '#27272a',
          accentHex: '#10b981',
          visualMetaphors: ['Grid'],
          audience: 'Engineers',
          borderRadius: 'rounded-lg',
          assetType: 'brand_mark',
        },
      });
      const res = await identityPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.asset.svgContent).toContain('<svg');
    });

    it('rejects invalid action with 400 Bad Request', async () => {
      const req = makeRequest('/api/identity', {
        action: 'invalid_identity_action',
      });
      const res = await identityPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('5. /api/guardian', () => {
    it('generates and validates on-brand marketing artifact', async () => {
      const req = makeRequest('/api/guardian', {
        action: 'generate_artifact',
        artifactType: 'website_headline',
        brandState: demoProject,
      });
      const res = await guardianPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.artifact.content).toBeDefined();
      expect(json.data.report.dimensions).toBeDefined();
    });

    it('validates an existing artifact against brand state', async () => {
      const artifact = ConsistencyGuardian.generateDefaultArtifact('website_headline', demoProject);
      const req = makeRequest('/api/guardian', {
        action: 'validate_artifact',
        artifact,
        brandState: demoProject,
      });
      const res = await guardianPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.dimensions.strategic_alignment).toBeDefined();
    });

    it('applies surgical repair to artifact without content duplication', async () => {
      const artifact = ConsistencyGuardian.generateDefaultArtifact('website_headline', demoProject);
      artifact.content = 'Revolutionize your workflow with the all-in-one AI platform.';
      const report = ConsistencyGuardian.evaluateArtifact(artifact, demoProject);
      const finding = report.findings[0];

      if (finding) {
        const req = makeRequest('/api/guardian', {
          action: 'apply_repair',
          artifact,
          findingId: finding.id,
        });
        const res = await guardianPost(req);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.content).not.toContain('[Repaired: [Repaired:');
      }
    });

    it('rejects invalid action with 400 Bad Request', async () => {
      const req = makeRequest('/api/guardian', {
        action: 'unknown_guardian_action',
      });
      const res = await guardianPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('6. /api/evolution', () => {
    it('generates tri-state realistic scenario test', async () => {
      const req = makeRequest('/api/evolution', {
        action: 'generate_scenario',
        scenarioType: 'website_launch',
        brandState: demoProject,
      });
      const res = await evolutionPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.rawGeneration).toBeDefined();
      expect(json.data.brandAwareGeneration).toBeDefined();
      expect(json.data.validatedFinal).toBeDefined();
    });

    it('analyzes assumption impact blast radius', async () => {
      const req = makeRequest('/api/evolution', {
        action: 'analyze_impact',
        changeRequest: {
          id: 'req-target-1',
          category: 'target_audience',
          title: 'Evolve Target Audience',
          currentValue: 'Senior Engineers',
          proposedValue: 'Enterprise CISOs & Compliance Officers',
          rationale: 'Compliance budgets are 5x larger and mandate automated verification.',
          requestedAt: new Date().toISOString(),
        },
        brandState: demoProject,
      });
      const res = await evolutionPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.blastRadius).toBeDefined();
    });

    it('applies evolution with choice: apply_update', async () => {
      const req = makeRequest('/api/evolution', {
        action: 'apply_evolution',
        changeRequest: {
          id: 'req-target-2',
          category: 'target_audience',
          title: 'Evolve Target Audience',
          currentValue: 'Senior Engineers',
          proposedValue: 'Enterprise CISOs & Compliance Officers',
          rationale: 'Compliance budgets are 5x larger and mandate automated verification.',
          requestedAt: new Date().toISOString(),
        },
        brandState: demoProject,
        choice: 'apply_update',
      });
      const res = await evolutionPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.updatedState).toBeDefined();
    });

    it('compares two branches and returns divergence diff', async () => {
      const baseBranch: BrandBranch = {
        id: 'branch-main',
        name: 'Main Track',
        createdAt: new Date().toISOString(),
        snapshot: {
          id: 'snap-1',
          version: 1,
          label: 'Main',
          timestamp: new Date().toISOString(),
          state: demoProject,
        },
      };

      const targetBranch: BrandBranch = {
        id: 'branch-ciso',
        name: 'CISO Compliance Track',
        createdAt: new Date().toISOString(),
        snapshot: {
          id: 'snap-2',
          version: 2,
          label: 'CISO',
          timestamp: new Date().toISOString(),
          state: {
            ...demoProject,
            positioningWorlds: demoProject.positioningWorlds.map((w) => ({
              ...w,
              targetAudience: 'Enterprise CISOs',
            })),
          },
        },
      };

      const req = makeRequest('/api/evolution', {
        action: 'compare_branches',
        baseBranch,
        targetBranch,
      });
      const res = await evolutionPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.divergenceScore).toBeGreaterThanOrEqual(0);
    });

    it('rejects invalid action with 400 Bad Request', async () => {
      const req = makeRequest('/api/evolution', {
        action: 'unknown_evolution_action',
      });
      const res = await evolutionPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('7. /api/launch-kit', () => {
    it('generates a comprehensive Launch Kit and guidelines', async () => {
      const req = makeRequest('/api/launch-kit', {
        action: 'generate',
        state: demoProject,
      });
      const res = await launchKitPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.launchKit.items.length).toBeGreaterThanOrEqual(7);
    });

    it('exports Launch Kit to Markdown and JSON', async () => {
      const kit = LaunchKitEngine.generateLaunchKit(demoProject);

      const mdReq = makeRequest('/api/launch-kit', {
        action: 'export_markdown',
        kit,
      });
      const mdRes = await launchKitPost(mdReq);
      expect(mdRes.status).toBe(200);
      const mdJson = await mdRes.json();
      expect(mdJson.markdown).toContain('# ');

      const jsonReq = makeRequest('/api/launch-kit', {
        action: 'export_json',
        kit,
      });
      const jsonRes = await launchKitPost(jsonReq);
      expect(jsonRes.status).toBe(200);
      const jsonParsed = await jsonRes.json();
      expect(jsonParsed.json).toContain('"guidelines"');
    });

    it('rejects invalid action with 400 Bad Request', async () => {
      const req = makeRequest('/api/launch-kit', {
        action: 'unknown_launch_kit_action',
      });
      const res = await launchKitPost(req);
      expect(res.status).toBe(400);
    });
  });
});
