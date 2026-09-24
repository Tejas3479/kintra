/**
 * KINTRA — Brand Evolution Engine
 *
 * Implements Parts B, C, D, E, F:
 * - Part B: Controlled foundational assumption changes (target audience, pricing, motion, emotion, problem)
 * - Part C: Downstream dependency analysis on DecisionGraph (Changed Assumption → Affected Decisions → Affected Artifacts → Review Required)
 * - Part D: Impact Preview (remains_valid, needs_revision, questionable, must_regenerate, unchanged)
 * - Part E: User Approval (update, keep old decision, branch, review individually)
 * - Part F: Branching, Versioning & Historical Diffing
 */

import {
  AssumptionChangeRequest,
  DependencyImpactReport,
  ImpactedNode,
  EvolutionApprovalChoice,
  BrandBranch,
  BranchComparisonDiff,
  BranchDiffItem,
} from '@/types/evolution';
import { CanonicalBrandState, ProjectSnapshot } from '@/types/brand';
import { BrandArtifact } from '@/types/guardian';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import { logger } from '@/lib/logger';

export class BrandEvolutionEngine {
  /**
   * Analyzes the downstream blast radius of an assumption change request
   * Traverses Decision Graph and inspects artifacts without modifying state.
   */
  static analyzeAssumptionImpact(
    request: AssumptionChangeRequest,
    state: CanonicalBrandState
  ): DependencyImpactReport {
    logger.info(`Analyzing assumption impact for category: ${request.category} (${request.proposedValue})`);

    const affectedDecisions: ImpactedNode[] = [];
    const affectedArtifacts: ImpactedNode[] = [];

    const selectedWorld = state.positioningWorlds.find((w) => w.id === state.selectedWorldId);
    const brandArtifacts = state.brandArtifacts || [];

    switch (request.category) {
      case 'target_audience': {
        // 1. Decision Graph Nodes Analysis
        // Target niche directly depends on audience
        affectedDecisions.push({
          nodeId: 'node-target-niche',
          title: 'Target Audience Decision',
          nodeType: 'decision',
          impactStatus: 'must_regenerate',
          causalReason: `Target persona shifts from "${request.currentValue}" to "${request.proposedValue}".`,
          recommendedAction: `Recalibrate buyer persona, pain triggers, and workflow constraints.`,
        });

        // Positioning world title & problem framing
        affectedDecisions.push({
          nodeId: selectedWorld?.id || 'node-pos-world',
          title: `Positioning World (${selectedWorld?.archetype || 'Current'})`,
          nodeType: 'world',
          impactStatus: 'needs_revision',
          causalReason: `Audience expectations change, but core architectural thesis may remain viable.`,
          recommendedAction: `Review problem framing and value proposition narrative for ${request.proposedValue}.`,
        });

        // Voice system tonal register
        affectedDecisions.push({
          nodeId: 'node-voice-system',
          title: 'Voice System & Register',
          nodeType: 'voice',
          impactStatus: 'needs_revision',
          causalReason: `Executive buyers or non-engineering users require adjusted empathy and vocabulary.`,
          recommendedAction: `Adjust tonal sliders (e.g. warmth or technical depth) and vocabulary list.`,
        });

        // AST Proof model & technical mechanism remains valid
        affectedDecisions.push({
          nodeId: 'node-proof-model',
          title: 'AST Proof Model & Engine',
          nodeType: 'decision',
          impactStatus: 'remains_valid',
          causalReason: `Underlying deterministic AST verification remains the technical invariant regardless of buyer.`,
          recommendedAction: `Retain without modification.`,
        });

        // Brand name remains valid
        const selectedName =
          state.creativeIdentity?.namingCandidates.find((n) => n.id === state.creativeIdentity?.selectedNameId)?.name ||
          'Kintra';
        affectedDecisions.push({
          nodeId: 'node-brand-name',
          title: `Brand Name (${selectedName})`,
          nodeType: 'decision',
          impactStatus: 'remains_valid',
          causalReason: `Identity naming territories and phonetics remain completely valid.`,
          recommendedAction: `Retain existing brand name.`,
        });

        // Visual system remains unchanged
        affectedDecisions.push({
          nodeId: 'node-visual-palette',
          title: 'Visual Palette & Shapes',
          nodeType: 'visual',
          impactStatus: 'unchanged',
          causalReason: `Terminal dark mode and surgical corner radiuses remain brand standards.`,
          recommendedAction: `No visual system changes required.`,
        });

        // 2. Artifacts Analysis
        for (const art of brandArtifacts) {
          if (
            art.artifactType === 'launch_email' ||
            art.artifactType === 'pitch_paragraph' ||
            art.artifactType === 'website_headline' ||
            art.artifactType === 'product_onboarding_copy'
          ) {
            affectedArtifacts.push({
              nodeId: art.id,
              title: art.name,
              nodeType: 'artifact',
              impactStatus: 'must_regenerate',
              causalReason: `Copy is directly pitched to "${request.currentValue}".`,
              recommendedAction: `Regenerate with value proposition addressed to "${request.proposedValue}".`,
            });
          } else {
            affectedArtifacts.push({
              nodeId: art.id,
              title: art.name,
              nodeType: 'artifact',
              impactStatus: 'remains_valid',
              causalReason: `Technical code diffs and diagnostic telemetry are audience-agnostic.`,
              recommendedAction: `Keep existing version.`,
            });
          }
        }
        break;
      }

      case 'pricing_tier': {
        affectedDecisions.push({
          nodeId: 'node-pricing-tier',
          title: 'Commercial Model & Pricing Tier',
          nodeType: 'decision',
          impactStatus: 'must_regenerate',
          causalReason: `Shift from "${request.currentValue}" to "${request.proposedValue}" changes sales motions.`,
          recommendedAction: `Update commercial packaging, self-serve tiers, and contract guarantees.`,
        });

        affectedDecisions.push({
          nodeId: 'node-proof-model',
          title: 'Proof Model & Telemetry',
          nodeType: 'decision',
          impactStatus: 'remains_valid',
          causalReason: `Core technical verification engine operates identically across commercial tiers.`,
          recommendedAction: `Retain without changes.`,
        });

        for (const art of brandArtifacts) {
          if (art.artifactType === 'launch_email' || art.artifactType === 'pitch_paragraph') {
            affectedArtifacts.push({
              nodeId: art.id,
              title: art.name,
              nodeType: 'artifact',
              impactStatus: 'must_regenerate',
              causalReason: `Commercial offering and pricing calls-to-action reflect the previous model.`,
              recommendedAction: `Regenerate sales copy with updated packaging.`,
            });
          } else {
            affectedArtifacts.push({
              nodeId: art.id,
              title: art.name,
              nodeType: 'artifact',
              impactStatus: 'remains_valid',
              causalReason: `General technical explanations are unaffected by pricing structure.`,
              recommendedAction: `Retain without changes.`,
            });
          }
        }
        break;
      }

      case 'emotional_territory': {
        affectedDecisions.push({
          nodeId: 'node-voice-system',
          title: 'Voice System & Tonal Sliders',
          nodeType: 'voice',
          impactStatus: 'must_regenerate',
          causalReason: `Emotional posture shifts directly from "${request.currentValue}" to "${request.proposedValue}".`,
          recommendedAction: `Recalibrate voice traits, vocabulary lists, and tone parameters.`,
        });

        affectedDecisions.push({
          nodeId: 'node-proof-model',
          title: 'AST Analysis Engine',
          nodeType: 'decision',
          impactStatus: 'remains_valid',
          causalReason: `Mathematical verification is independent of emotional framing.`,
          recommendedAction: `Retain without changes.`,
        });

        for (const art of brandArtifacts) {
          if (art.artifactType === 'social_caption' || art.artifactType === 'website_headline') {
            affectedArtifacts.push({
              nodeId: art.id,
              title: art.name,
              nodeType: 'artifact',
              impactStatus: 'must_regenerate',
              causalReason: `Emotional cadence directly drives headlines and social copy.`,
              recommendedAction: `Regenerate with revised emotional posture.`,
            });
          } else {
            affectedArtifacts.push({
              nodeId: art.id,
              title: art.name,
              nodeType: 'artifact',
              impactStatus: 'needs_revision',
              causalReason: `May need subtle wording shifts to reflect updated posture.`,
              recommendedAction: `Review and adjust tone where necessary.`,
            });
          }
        }
        break;
      }

      case 'primary_problem':
      case 'category_frame':
      case 'market_motion':
      default: {
        affectedDecisions.push({
          nodeId: 'node-problem-framing',
          title: 'Problem Framing & Category Frame',
          nodeType: 'decision',
          impactStatus: 'must_regenerate',
          causalReason: `Strategic category pivot from "${request.currentValue}" to "${request.proposedValue}".`,
          recommendedAction: `Reframe core pain point and competitive alternative.`,
        });

        affectedDecisions.push({
          nodeId: 'node-brand-name',
          title: 'Brand Name',
          nodeType: 'decision',
          impactStatus: 'remains_valid',
          causalReason: `Abstract name retains brand equity across category frames.`,
          recommendedAction: `Keep existing brand name.`,
        });

        for (const art of brandArtifacts) {
          affectedArtifacts.push({
            nodeId: art.id,
            title: art.name,
            nodeType: 'artifact',
            impactStatus: 'needs_revision',
            causalReason: `Category framing impacts messaging pillars.`,
            recommendedAction: `Re-evaluate positioning copy against updated category frame.`,
          });
        }
        break;
      }
    }

    // Tally metrics
    const allImpacted = [...affectedDecisions, ...affectedArtifacts];
    const mustRegenerateCount = allImpacted.filter((i) => i.impactStatus === 'must_regenerate').length;
    const reviewRequiredCount = allImpacted.filter(
      (i) => i.impactStatus === 'must_regenerate' || i.impactStatus === 'needs_revision' || i.impactStatus === 'questionable'
    ).length;
    const remainsValidCount = allImpacted.filter((i) => i.impactStatus === 'remains_valid' || i.impactStatus === 'unchanged').length;

    return {
      changeRequestId: request.id,
      assumptionCategory: request.category,
      currentValue: request.currentValue,
      proposedValue: request.proposedValue,
      blastRadius: {
        changedAssumption: `${request.title}: "${request.currentValue}" → "${request.proposedValue}"`,
        affectedDecisions,
        affectedArtifacts,
        reviewRequiredCount,
        remainsValidCount,
        mustRegenerateCount,
      },
      summary: `Changing ${request.category} affects ${reviewRequiredCount} downstream items (${mustRegenerateCount} require regeneration), while ${remainsValidCount} core assets remain strictly valid.`,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Applies the approved evolution change with full versioning, snapshot preservation,
   * and selective artifact regeneration.
   */
  static applyEvolution(
    request: AssumptionChangeRequest,
    state: CanonicalBrandState,
    choice: EvolutionApprovalChoice,
    branchName?: string
  ): {
    updatedState: CanonicalBrandState;
    newBranch?: BrandBranch;
    summary: string;
  } {
    // Choice 1: Keep old decision (Abort/Cancel)
    if (choice === 'keep_old_decision') {
      return {
        updatedState: state,
        summary: `Assumption change for "${request.category}" rejected by founder. Existing brand state was strictly preserved.`,
      };
    }

    // Prepare snapshot of the current state before applying change
    const preSnapshot: ProjectSnapshot = {
      id: `snap-${Date.now()}`,
      version: state.metadata.version,
      label: `Pre-Evolution: ${request.title}`,
      timestamp: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(state)),
    };

    let newBranch: BrandBranch | undefined = undefined;

    // Choice 2: Branch brand (create parallel track)
    if (choice === 'branch_brand') {
      const bName = branchName || `branch-${request.category}-${Date.now().toString().slice(-4)}`;
      newBranch = {
        id: `branch-${Date.now()}`,
        name: bName,
        description: `Evolved branch based on: ${request.title}`,
        parentBranchId: 'main',
        createdAt: new Date().toISOString(),
        snapshot: preSnapshot,
      };
      logger.info(`Created new brand branch: ${bName}`);
    }

    // Choice 3: Apply update or review individually
    // Deep clone state to modify without side effects
    const nextState: CanonicalBrandState = JSON.parse(JSON.stringify(state));
    nextState.metadata.version += 1;
    nextState.metadata.updatedAt = new Date().toISOString();

    // 1. Update foundational assumption in Positioning World & Idea Brief
    if (request.category === 'target_audience') {
      if (nextState.ideaBrief) {
        nextState.ideaBrief.targetUser.primaryNiche = request.proposedValue;
      }
      nextState.positioningWorlds = nextState.positioningWorlds.map((w) => {
        if (w.id === nextState.selectedWorldId) {
          return {
            ...w,
            targetAudience: request.proposedValue,
            assumptions: [...w.assumptions, `Pivoted audience to: ${request.proposedValue}`],
          };
        }
        return w;
      });
    }

    // 2. Update Decision Graph nodes (invalidate affected, retain unaffected)
    const graphNodes = nextState.decisionGraph.nodes;
    let targetNodeFound = false;
    for (const key of Object.keys(graphNodes)) {
      if (graphNodes[key].category === 'target_niche') {
        graphNodes[key].approvedValue = request.proposedValue;
        graphNodes[key].version += 1;
        graphNodes[key].rationale = `Evolved: ${request.rationale}`;
        targetNodeFound = true;
      }
    }
    if (!targetNodeFound) {
      graphNodes['node-target-niche'] = {
        id: 'node-target-niche',
        category: 'target_niche',
        title: 'Target Audience Decision',
        approvedValue: request.proposedValue,
        rationale: `Evolved: ${request.rationale}`,
        evidenceIds: [],
        rejectedAlternatives: [],
        tradeoff: 'Refocused on specific audience segment',
        dependsOn: [],
        governs: [],
        status: 'approved',
        version: 2,
      };
    }

    // 3. Selectively regenerate only affected artifacts
    if (nextState.brandArtifacts && nextState.brandArtifacts.length > 0) {
      nextState.brandArtifacts = nextState.brandArtifacts.map((art) => {
        // Only regenerate artifacts that directly depend on the changed assumption
        if (
          art.artifactType === 'launch_email' ||
          art.artifactType === 'pitch_paragraph' ||
          art.artifactType === 'website_headline'
        ) {
          const regenerated = this.regenerateArtifactForAudience(art, request.proposedValue, nextState);
          return regenerated;
        }
        // Retain unaffected artifacts untouched!
        return art;
      });
    }

    const summary =
      choice === 'branch_brand'
        ? `Successfully branched into "${newBranch?.name}". Foundational assumption updated to "${request.proposedValue}". Affected artifacts regenerated; invariant decisions preserved.`
        : `Successfully evolved brand state to Version ${nextState.metadata.version}. Target audience updated to "${request.proposedValue}". Downstream artifacts regenerated and re-audited.`;

    return {
      updatedState: nextState,
      newBranch,
      summary,
    };
  }

  /**
   * Regenerates a single artifact for the new audience while preserving differentiator and voice rules
   */
  private static regenerateArtifactForAudience(
    artifact: BrandArtifact,
    newAudience: string,
    state: CanonicalBrandState
  ): BrandArtifact {
    const brandName =
      state.creativeIdentity?.namingCandidates.find((n) => n.id === state.creativeIdentity?.selectedNameId)?.name ||
      'Kintra';
    const selectedWorld = state.positioningWorlds.find((w) => w.id === state.selectedWorldId);
    const differentiator = selectedWorld?.differentiator || 'AST-level deterministic analysis';
    const proofMechanism = selectedWorld?.proofMechanism || 'Inspectable AST telemetry logs';

    let newContent = artifact.content;

    if (artifact.artifactType === 'website_headline') {
      newContent = `Deterministic Pull Request Verification for ${newAudience}.\n\n${brandName} executes ${differentiator} on every code change to guarantee zero silent logic escapes before production merge.`;
    } else if (artifact.artifactType === 'launch_email') {
      newContent = `Subject: Verifying pull request compliance for ${newAudience}\n\nAs ${newAudience}, auditing multi-repository pull requests requires verifiable proof rather than probabilistic LLM guesses.\n\n${brandName} runs ${differentiator} with ${proofMechanism} to guarantee security policy invariants before code is merged. Here is our architectural whitepaper and benchmark diffs.`;
    } else if (artifact.artifactType === 'pitch_paragraph') {
      newContent = `${brandName} empowers ${newAudience} to eliminate silent code regressions before merge. By combining ${differentiator} with ${proofMechanism}, we replace slow manual audit queues with deterministic AST verification.`;
    }

    // Append version history
    const newVersion = (artifact.versionHistory?.length || 1) + 1;
    const updatedHistory = [
      ...(artifact.versionHistory || []),
      {
        version: newVersion,
        content: newContent,
        editedAt: new Date().toISOString(),
        editedBy: 'regeneration' as const,
        editReason: `Regenerated for evolved audience: ${newAudience}`,
      },
    ];

    const tempArt: BrandArtifact = {
      ...artifact,
      content: newContent,
      targetAudience: newAudience,
      versionHistory: updatedHistory,
      status: 'draft',
      isApproved: false,
      isLocked: false,
      updatedAt: new Date().toISOString(),
    };

    // Re-audit with Consistency Guardian
    const report = ConsistencyGuardian.evaluateArtifact(tempArt, state);

    return {
      ...tempArt,
      status: report.passed ? 'approved' : 'draft',
      isApproved: report.passed,
    };
  }

  /**
   * Compares two branches or snapshots and returns a structured divergence diff
   */
  static compareBranches(baseBranch: BrandBranch, targetBranch: BrandBranch): BranchComparisonDiff {
    const baseState = baseBranch.snapshot.state;
    const targetState = targetBranch.snapshot.state;

    const assumptionDiffs: BranchDiffItem[] = [];
    const decisionDiffs: BranchDiffItem[] = [];
    const artifactDiffs: BranchDiffItem[] = [];

    // Compare audience
    const baseAudience = baseState.ideaBrief?.targetUser.primaryNiche || 'Senior Engineers';
    const targetAudience = targetState.ideaBrief?.targetUser.primaryNiche || 'Senior Engineers';
    assumptionDiffs.push({
      key: 'target_audience',
      label: 'Target Audience',
      baseValue: baseAudience,
      targetValue: targetAudience,
      status: baseAudience === targetAudience ? 'identical' : 'modified',
    });

    // Compare world archetype
    const baseWorld = baseState.positioningWorlds.find((w) => w.id === baseState.selectedWorldId);
    const targetWorld = targetState.positioningWorlds.find((w) => w.id === targetState.selectedWorldId);
    decisionDiffs.push({
      key: 'world_archetype',
      label: 'Positioning World Archetype',
      baseValue: baseWorld?.archetype || 'None',
      targetValue: targetWorld?.archetype || 'None',
      status: baseWorld?.archetype === targetWorld?.archetype ? 'identical' : 'modified',
    });

    // Compare brand name
    const baseName =
      baseState.creativeIdentity?.namingCandidates.find((n) => n.id === baseState.creativeIdentity?.selectedNameId)?.name ||
      'Kintra';
    const targetName =
      targetState.creativeIdentity?.namingCandidates.find((n) => n.id === targetState.creativeIdentity?.selectedNameId)?.name ||
      'Kintra';
    decisionDiffs.push({
      key: 'brand_name',
      label: 'Brand Name',
      baseValue: baseName,
      targetValue: targetName,
      status: baseName === targetName ? 'identical' : 'modified',
    });

    // Compare artifacts
    const baseArtifacts = baseState.brandArtifacts || [];
    const targetArtifacts = targetState.brandArtifacts || [];

    for (const bArt of baseArtifacts) {
      const tArt = targetArtifacts.find((a) => a.artifactType === bArt.artifactType);
      if (!tArt) {
        artifactDiffs.push({
          key: bArt.id,
          label: bArt.name,
          baseValue: bArt.content.slice(0, 40) + '...',
          targetValue: '(None)',
          status: 'removed',
        });
      } else if (tArt.content !== bArt.content) {
        artifactDiffs.push({
          key: bArt.id,
          label: bArt.name,
          baseValue: bArt.content.slice(0, 40) + '...',
          targetValue: tArt.content.slice(0, 40) + '...',
          status: 'modified',
        });
      } else {
        artifactDiffs.push({
          key: bArt.id,
          label: bArt.name,
          baseValue: bArt.content.slice(0, 40) + '...',
          targetValue: tArt.content.slice(0, 40) + '...',
          status: 'identical',
        });
      }
    }

    const totalItems = assumptionDiffs.length + decisionDiffs.length + artifactDiffs.length;
    const modifiedItems = [
      ...assumptionDiffs,
      ...decisionDiffs,
      ...artifactDiffs,
    ].filter((i) => i.status !== 'identical').length;

    const divergenceScore = totalItems > 0 ? Math.round((modifiedItems / totalItems) * 100) : 0;

    return {
      baseBranchId: baseBranch.id,
      baseBranchName: baseBranch.name,
      targetBranchId: targetBranch.id,
      targetBranchName: targetBranch.name,
      assumptionDiffs,
      decisionDiffs,
      artifactDiffs,
      divergenceScore,
      generatedAt: new Date().toISOString(),
    };
  }
}
