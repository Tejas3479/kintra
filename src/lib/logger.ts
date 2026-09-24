/**
 * KINTRA Structured Logger
 * Sanitizes keys, tokens, and logs structured JSON events
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'audit';

interface LogContext {
  [key: string]: unknown;
}

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    // Redact strings that look like API keys or tokens
    return value.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/key|token|secret|password|auth/i.test(k)) {
        sanitizedObj[k] = '[REDACTED]';
      } else {
        sanitizedObj[k] = sanitize(v);
      }
    }
    return sanitizedObj;
  }
  return value;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, context ? sanitize(context) : '');
  },
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, context ? sanitize(context) : '');
  },
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      context: context ? sanitize(context) : undefined,
    });
  },
  audit(action: string, actor: string, details?: LogContext): void {
    console.log(`[AUDIT] [${new Date().toISOString()}] ${actor} -> ${action}`, details ? sanitize(details) : '');
  },
};
