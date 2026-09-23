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
 * Ultra-lightweight Sentry Error Reporter (<1 KB, 0ms LCP / TBT impact).
 * Hooks into window error events after page load and forwards crashes directly to Sentry Ingest.
 */
export function SentryMonitoring({ initialDsn }: SentryMonitoringProps) {
  const dsnInfo = parseDsn(initialDsn || process.env.NEXT_PUBLIC_SENTRY_DSN);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!dsnInfo || isInitialized.current) return;
    isInitialized.current = true;

    // Send Sentry Envelope
    const sendEventToSentry = (eventData: Record<string, any>) => {
      try {
        const { publicKey, host, projectId } = dsnInfo;
        const endpoint = `https://${host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`;

        const eventId = crypto.randomUUID().replace(/-/g, '');
        const sentAt = new Date().toISOString();

        const envelopeHeader = JSON.stringify({
          event_id: eventId,
          sent_at: sentAt,
          dsn: initialDsn,
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
        // Non-blocking catch to ensure client UI is never interrupted
      }
    };

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
                        .slice(1, 10)
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
                        .slice(1, 10)
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
  }, [dsnInfo, initialDsn]);

  return null;
}
