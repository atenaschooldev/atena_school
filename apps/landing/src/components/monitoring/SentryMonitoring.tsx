'use client';

import { useEffect, useRef } from 'react';

export interface SentryMonitoringProps {
  initialDsn?: string;
}

interface SentryParsedDsn {
  publicKey: string;
  host: string;
  projectId: string;
}

declare global {
  interface Window {
    __sentryDsn?: string;
    __reportToSentry?: (error: unknown, extra?: Record<string, any>) => void;
  }
}

function parseDsn(dsn?: string): SentryParsedDsn | null {
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
 * Manually capture exception from React Error Boundary or client code.
 */
export function reportClientError(error: unknown, extra?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.__reportToSentry) {
    window.__reportToSentry(error, extra);
  } else {
    console.error('[Client Error]:', error, extra);
  }
}

/**
 * Ultra-lightweight Sentry Error Reporter (<1 KB, 0ms LCP / TBT impact).
 * Hooks into window error events, unhandled rejections, and React Error Boundaries.
 */
export function SentryMonitoring({ initialDsn }: SentryMonitoringProps) {
  const activeDsn = initialDsn || (typeof window !== 'undefined' ? window.__sentryDsn : undefined) || process.env.NEXT_PUBLIC_SENTRY_DSN;
  const dsnInfo = parseDsn(activeDsn);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeDsn) {
      window.__sentryDsn = activeDsn;
    }

    if (!dsnInfo) return;

    // Direct event sender to Sentry Ingest
    const sendEventToSentry = (eventData: Record<string, any>) => {
      try {
        const { publicKey, host, projectId } = dsnInfo;
        const endpoint = `https://${host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`;

        const eventId = (
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2) + Date.now().toString(36)
        ).replace(/-/g, '');

        const sentAt = new Date().toISOString();

        const envelopeHeader = JSON.stringify({
          event_id: eventId,
          sent_at: sentAt,
          dsn: activeDsn,
        });

        const itemHeader = JSON.stringify({
          type: 'event',
          content_type: 'application/json',
        });

        const itemPayload = JSON.stringify({
          event_id: eventId,
          timestamp: Date.now() / 1000,
          platform: 'javascript',
          level: 'error',
          logger: 'client-window',
          environment: process.env.NODE_ENV || 'production',
          release: 'atena-school-landing@1.0.0',
          request: {
            url: typeof window !== 'undefined' ? window.location.href : '',
            headers: {
              'User-Agent': typeof navigator !== 'undefined' ? navigator.userAgent : '',
            },
          },
          ...eventData,
        });

        const body = `${envelopeHeader}\n${itemHeader}\n${itemPayload}\n`;

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, body);
        } else {
          fetch(endpoint, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'text/plain' },
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Non-blocking
      }
    };

    // Expose programmatic error reporter for React error boundaries
    window.__reportToSentry = (err: unknown, extra?: Record<string, any>) => {
      const errorObj = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Manual exception');
      sendEventToSentry({
        exception: {
          values: [
            {
              type: errorObj.name || 'Error',
              value: errorObj.message || 'Unknown Error',
              stacktrace: errorObj.stack
                ? {
                    frames: errorObj.stack
                      .split('\n')
                      .slice(1, 12)
                      .map((line) => ({ filename: line.trim() })),
                  }
                : undefined,
            },
          ],
        },
        extra,
      });
    };

    if (isInitialized.current) return;
    isInitialized.current = true;

    // Idle-delayed listeners initialization so it never impacts LCP / TBT
    const attachHandlers = () => {
      const handleError = (event: ErrorEvent) => {
        if (!event.error && !event.message) return;
        sendEventToSentry({
          exception: {
            values: [
              {
                type: event.error?.name || 'Error',
                value: event.error?.message || event.message || 'Unknown Error',
                stacktrace: event.error?.stack
                  ? {
                      frames: event.error.stack
                        .split('\n')
                        .slice(1, 12)
                        .map((line: string) => ({ filename: line.trim() })),
                    }
                  : undefined,
              },
            ],
          },
          tags: {
            source: event.filename || 'unknown',
            line: event.lineno,
            col: event.colno,
          },
        });
      };

      const handleRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason;
        const msg = typeof reason === 'string' ? reason : reason?.message || 'Unhandled Promise Rejection';
        sendEventToSentry({
          exception: {
            values: [
              {
                type: reason?.name || 'UnhandledRejection',
                value: msg,
                stacktrace: reason?.stack
                  ? {
                      frames: reason.stack
                        .split('\n')
                        .slice(1, 12)
                        .map((line: string) => ({ filename: line.trim() })),
                    }
                  : undefined,
              },
            ],
          },
        });
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
      };
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(attachHandlers);
      } else {
        setTimeout(attachHandlers, 1500);
      }
    }
  }, [dsnInfo, activeDsn]);

  return null;
}
