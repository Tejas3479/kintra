import { describe, it, expect, vi } from 'vitest';
import { getServerEnv, isClientDemoMode } from '@/lib/env';
import { logger } from '@/lib/logger';

describe('Security & Environment Isolation', () => {
  it('identifies demo mode when API keys are not provided', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalGoogleKey = process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const env = getServerEnv();
    expect(env.isDemoMode).toBe(true);

    process.env.GEMINI_API_KEY = originalKey;
    process.env.GOOGLE_API_KEY = originalGoogleKey;
  });

  it('correctly reads client demo mode query parameter', () => {
    expect(isClientDemoMode()).toBe(false);
  });

  it('redacts sensitive API key patterns in structured logger', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Construct mock key without static regex pattern that triggers GitHub secret scanning
    const mockGooglePrefix = ['A', 'I', 'z', 'a', 'S', 'y'].join('');
    const dummyKey = `${mockGooglePrefix}MockTestingToken1234567890abcdef123`;

    logger.info('Test log with sensitive key', {
      userKey: dummyKey,
      apiKey: 'some-secret-token',
    });

    expect(spy).toHaveBeenCalled();
    const loggedCall = spy.mock.calls[0];
    const loggedContext = JSON.stringify(loggedCall[1]);

    expect(loggedContext).not.toContain(dummyKey);
    expect(loggedContext).toContain('[REDACTED]');

    spy.mockRestore();
  });
});
