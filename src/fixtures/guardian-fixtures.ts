/**
 * Consistency Guardian Test Fixtures
 * 8 canonical test fixtures designed to stress-test multi-dimensional validation
 */

import { BrandArtifact } from '@/types/guardian';

export const FIXTURE_CORRECT_ARTIFACT: BrandArtifact = {
  id: 'fixture-correct-1',
  name: 'Correct Website Hero Headline',
  artifactType: 'website_headline',
  content: 'Three comments or zero. Deterministic pull request review intelligence that isolates critical logic flaws with reproducible unit tests. Zero false alarms.',
  targetAudience: 'Senior Staff Engineers and DevOps Architects',
  versionHistory: [
    {
      version: 1,
      content: 'Three comments or zero. Deterministic pull request review intelligence that isolates critical logic flaws with reproducible unit tests. Zero false alarms.',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_SUBTLE_INCONSISTENCY: BrandArtifact = {
  id: 'fixture-subtle-1',
  name: 'Subtle Inconsistency Launch Email',
  artifactType: 'launch_email',
  content: 'Hi there, we think this might be an issue in your pull request diff. Consider maybe checking this line when you have a moment!',
  targetAudience: 'Senior Staff Engineers',
  versionHistory: [
    {
      version: 1,
      content: 'Hi there, we think this might be an issue in your pull request diff. Consider maybe checking this line when you have a moment!',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_OBVIOUS_INCONSISTENCY: BrandArtifact = {
  id: 'fixture-obvious-1',
  name: 'Obvious Inconsistency Social Caption',
  artifactType: 'social_caption',
  content: 'The premier social media scheduler and customer CRM tool designed to schedule tweets and manage your customer leads automatically!',
  targetAudience: 'Marketing Teams',
  versionHistory: [
    {
      version: 1,
      content: 'The premier social media scheduler and customer CRM tool designed to schedule tweets and manage your customer leads automatically!',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_UNSUPPORTED_CLAIM: BrandArtifact = {
  id: 'fixture-unsupported-1',
  name: 'Unsupported Absolute Claim Pitch',
  artifactType: 'pitch_paragraph',
  content: 'Kintra guarantees 100% bug free software and zero bugs guaranteed forever with the fastest in the world analysis that never makes mistakes.',
  targetAudience: 'CISOs and VPs of Engineering',
  versionHistory: [
    {
      version: 1,
      content: 'Kintra guarantees 100% bug free software and zero bugs guaranteed forever with the fastest in the world analysis that never makes mistakes.',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_WRONG_AUDIENCE: BrandArtifact = {
  id: 'fixture-wrong-audience-1',
  name: 'Wrong Audience Onboarding Copy',
  artifactType: 'product_onboarding_copy',
  content: 'Welcome! Coding made easy for beginners with our simple one-click trick. Coding for dummies has never been so accessible with no coding required!',
  targetAudience: 'Senior Staff Engineers and DevOps Architects',
  versionHistory: [
    {
      version: 1,
      content: 'Welcome! Coding made easy for beginners with our simple one-click trick. Coding for dummies has never been so accessible with no coding required!',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_TONE_VIOLATION: BrandArtifact = {
  id: 'fixture-tone-violation-1',
  name: 'Tone Violation LinkedIn Post',
  artifactType: 'linkedin_post',
  content: 'Supercharge your workflow today with revolutionary AI magic! This next-gen game-changer will seamlessly transform your engineering rockstars into 10x legends!!!',
  targetAudience: 'Senior Engineers',
  versionHistory: [
    {
      version: 1,
      content: 'Supercharge your workflow today with revolutionary AI magic! This next-gen game-changer will seamlessly transform your engineering rockstars into 10x legends!!!',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_VISUAL_MISMATCH: BrandArtifact = {
  id: 'fixture-visual-mismatch-1',
  name: 'Visual Mismatch Landing Page Section',
  artifactType: 'landing_page_section',
  content: 'Inspect every code diff with rigorous architectural analysis.',
  targetAudience: 'Senior Engineers',
  visualSpec: {
    dominantHex: '#FF69B4', // Hot pink clashing with dark terminal #0D1117
    geometryStyle: 'rounded_organic', // Bubbly circles clashing with sharp angles
  },
  versionHistory: [
    {
      version: 1,
      content: 'Inspect every code diff with rigorous architectural analysis.',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};

export const FIXTURE_INTENTIONALLY_GENERIC_CONTENT: BrandArtifact = {
  id: 'fixture-generic-1',
  name: 'Intentionally Generic Landing Page Section',
  artifactType: 'landing_page_section',
  content: 'The all-in-one platform and ultimate tool to take your business to the next level. Powered by ShieldCopilotly.ai for seamless synergy.',
  targetAudience: 'Everyone',
  versionHistory: [
    {
      version: 1,
      content: 'The all-in-one platform and ultimate tool to take your business to the next level. Powered by ShieldCopilotly.ai for seamless synergy.',
      editedAt: '2026-09-24T12:00:00Z',
      editedBy: 'user',
    },
  ],
  status: 'draft',
  isApproved: false,
  isLocked: false,
  createdAt: '2026-09-24T12:00:00Z',
  updatedAt: '2026-09-24T12:00:00Z',
};
