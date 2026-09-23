import { SupabaseClient } from '@supabase/supabase-js';
import { getSentryCredentials } from './integration-secrets.service';

export interface SentryReportContext {
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, any>;
  req?: {
    url?: string;
    method?: string;
    headers?: Record<string, string | undefined>;
    body?: any;
    ip?: string;
  };
  instance?: string;
  level?: 'error' | 'fatal' | 'warning' | 'info';
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
}

export interface SentryParsedDsn {
  publicKey: string;
  host: string;
  projectId: string;
}

export function parseSentryDsn(dsn?: string): SentryParsedDsn | null {
  if (!dsn || !dsn.trim()) return null;
  try {
    const url = new URL(dsn.trim());
    const publicKey = url.username;
    const host = url.host;
    const projectId = url.pathname.replace(/^\//, '');
    if (!publicKey || !host || !projectId) return null;
    return { publicKey, host, projectId };
  } catch {
    return null;
  }
}

/**
 * Universal Zero-Overhead Sentry Exception Reporter.
 * Captures exceptions across Node.js (Next.js server, NestJS backend) and browser runtime
 * without requiring heavy SDK dependencies.
 */
export async function captureExceptionToSentry(
  err: unknown,
  context?: SentryReportContext,
  options?: {
    dsn?: string;
    supabase?: SupabaseClient | null;
    environment?: string;
    release?: string;
  }
): Promise<string | null> {
  try {
    let dsn = options?.dsn;
    if (!dsn) {
      const creds = await getSentryCredentials(options?.supabase);
      dsn = creds.dsn;
    }

    const dsnInfo = parseSentryDsn(dsn);
    if (!dsnInfo) return null;

    const { publicKey, host, projectId } = dsnInfo;
    const eventId = (
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36)
    ).replace(/-/g, '');

    const sentAt = new Date().toISOString();
    const endpoint = `https://${host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`;

    const errorObj = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
    const errorName = errorObj.name || 'Error';
    const errorMessage = errorObj.message || 'Unknown exception';

    const frames = errorObj.stack
      ? errorObj.stack
          .split('\n')
          .slice(1, 15)
          .map((line) => ({ filename: line.trim() }))
      : undefined;

    const envelopeHeader = JSON.stringify({
      event_id: eventId,
      sent_at: sentAt,
      dsn,
    });

    const itemHeader = JSON.stringify({
      type: 'event',
      content_type: 'application/json',
    });

    const sanitizedHeaders = { ...context?.req?.headers };
    // Strip sensitive auth tokens
    delete sanitizedHeaders['authorization'];
    delete sanitizedHeaders['cookie'];
    delete sanitizedHeaders['x-supabase-auth'];

    const eventPayload = JSON.stringify({
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level: context?.level || 'error',
      logger: context?.instance || 'server',
      environment: options?.environment || process.env.NODE_ENV || 'production',
      release: options?.release || 'atena-school@1.0.0',
      exception: {
        values: [
          {
            type: errorName,
            value: errorMessage,
            stacktrace: frames ? { frames } : undefined,
          },
        ],
      },
      tags: {
        ...(context?.instance ? { instance: context.instance } : {}),
        ...context?.tags,
      },
      extra: context?.extra,
      user: context?.user,
      request: context?.req
        ? {
            url: context.req.url,
            method: context.req.method,
            headers: sanitizedHeaders,
            data: context.req.body,
          }
        : undefined,
    });

    const body = `${envelopeHeader}\n${itemHeader}\n${eventPayload}\n`;

    // Asynchronously send to Sentry Ingest
    if (typeof fetch !== 'undefined') {
      fetch(endpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'text/plain' },
      }).catch(() => {});
    }

    return eventId;
  } catch {
    // Non-blocking: reporting errors must never throw or crash the app
    return null;
  }
}
