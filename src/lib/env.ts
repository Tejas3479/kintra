/**
 * Environment configuration and safe validation
 *
 * Invariant: Private keys (GEMINI_API_KEY) are NEVER exposed to client bundles.
 */

export interface ServerEnv {
  geminiApiKey: string | undefined;
  isDemoMode: boolean;
}

export function getServerEnv(): ServerEnv {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || undefined;
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true' ||
    !geminiApiKey; // Automatically fallback to demo/fixture mode if key is unset

  return {
    geminiApiKey,
    isDemoMode,
  };
}

export function isClientDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      return true;
    }
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}
