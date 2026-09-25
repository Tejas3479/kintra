/**
 * In-Memory Sliding-Window Rate Limiter
 * Provides per-IP sliding window rate limiting for Kintra API routes.
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  endpoint?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number; // in seconds
  response?: NextResponse;
}

export const RATE_LIMIT_STANDARD = {
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
};

export const RATE_LIMIT_HEAVY = {
  maxRequests: 15,
  windowMs: 60 * 1000, // 1 minute
};

// In-memory sliding window timestamps: Map<key, timestamp[]>
const requestStore = new Map<string, number[]>();
let lastPruneTime = Date.now();
const PRUNE_INTERVAL_MS = 60 * 1000;

/**
 * Extracts client IP from request headers or fallback.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // NextRequest might have ip property in newer runtimes
  const directIp = (req as unknown as { ip?: string }).ip;
  if (directIp) return directIp;

  return '127.0.0.1';
}

/**
 * Prunes expired timestamps and empty entries to prevent memory leaks.
 */
function pruneStaleEntries(now: number, maxWindow: number): void {
  for (const [key, timestamps] of requestStore.entries()) {
    const active = timestamps.filter((t) => now - t <= maxWindow);
    if (active.length === 0) {
      requestStore.delete(key);
    } else {
      requestStore.set(key, active);
    }
  }
  lastPruneTime = now;
}

/**
 * Checks whether a request exceeds the configured rate limit.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): RateLimitResult {
  const maxRequests = options.maxRequests ?? RATE_LIMIT_STANDARD.maxRequests;
  const windowMs = options.windowMs ?? RATE_LIMIT_STANDARD.windowMs;
  const endpoint = options.endpoint ?? 'api';

  // Test mode handling: bypass unless explicit testing header is present
  const isTestEnv = process.env.NODE_ENV === 'test';
  const testForce = req.headers.get('x-test-ratelimit') === 'true';
  const testLimitHeader = req.headers.get('x-test-ratelimit-limit');
  const effectiveLimit = testLimitHeader ? parseInt(testLimitHeader, 10) : maxRequests;

  if (isTestEnv && !testForce) {
    return {
      allowed: true,
      limit: effectiveLimit,
      remaining: effectiveLimit,
      retryAfter: 0,
    };
  }

  const clientIp = getClientIp(req);
  const key = `${endpoint}:${clientIp}`;
  const now = Date.now();

  // Periodic pruning
  if (now - lastPruneTime > PRUNE_INTERVAL_MS || requestStore.size > 2000) {
    pruneStaleEntries(now, windowMs);
  }

  const timestamps = requestStore.get(key) || [];
  // Filter only timestamps within the current sliding window
  const activeTimestamps = timestamps.filter((t) => now - t <= windowMs);

  if (activeTimestamps.length >= effectiveLimit) {
    const oldestTimestamp = activeTimestamps[0];
    const retryAfterMs = oldestTimestamp + windowMs - now;
    const retryAfter = Math.max(1, Math.ceil(retryAfterMs / 1000));

    const response = NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(effectiveLimit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((oldestTimestamp + windowMs) / 1000)),
        },
      }
    );

    return {
      allowed: false,
      limit: effectiveLimit,
      remaining: 0,
      retryAfter,
      response,
    };
  }

  activeTimestamps.push(now);
  requestStore.set(key, activeTimestamps);

  const remaining = effectiveLimit - activeTimestamps.length;

  return {
    allowed: true,
    limit: effectiveLimit,
    remaining,
    retryAfter: 0,
  };
}

/**
 * Convenient helper to enforce rate limits directly in Next.js route handlers.
 * Returns a 429 NextResponse if rate limit is exceeded, or null if allowed.
 */
export function enforceRateLimit(
  req: NextRequest,
  endpoint: string,
  options?: Omit<RateLimitOptions, 'endpoint'>
): NextResponse | null {
  const result = checkRateLimit(req, { ...options, endpoint });
  if (!result.allowed && result.response) {
    return result.response;
  }
  return null;
}

/**
 * Clears the rate limiter store. Useful for testing.
 */
export function resetRateLimiter(): void {
  requestStore.clear();
  lastPruneTime = Date.now();
}
