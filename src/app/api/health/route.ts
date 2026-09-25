import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export const maxDuration = 15;

export async function GET() {
  const env = getServerEnv();
  const hasApiKey = Boolean(env.geminiApiKey);
  const hasTavilyKey = Boolean(process.env.TAVILY_API_KEY);

  return NextResponse.json({
    status: 'ok',
    isDemoMode: env.isDemoMode,
    hasApiKey,
    hasTavilyKey,
    model: 'gemini-3.8-flash',
    searchProvider: hasTavilyKey ? 'tavily' : 'hybrid_curated',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const env = getServerEnv();
    const testKey = body.apiKey || env.geminiApiKey;

    if (!testKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key provided or configured on server.',
        latencyMs: 0,
      });
    }

    const startTime = Date.now();
    const { GeminiProvider } = await import('@/lib/ai-provider');
    const { z } = await import('zod');
    const provider = new GeminiProvider(testKey);
    const result = await provider.generateStructured(
      'Respond with status: ok and echo test.',
      z.object({ status: z.string() }),
      'Health check connection probe.'
    );

    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      success: result.success,
      latencyMs,
      model: 'gemini-3.8-flash',
      isFallback: result.metadata?.isFallback || false,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: 0,
    });
  }
}
