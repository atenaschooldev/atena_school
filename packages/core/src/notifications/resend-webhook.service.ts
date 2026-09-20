import type { SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  ResendWebhookEvent,
} from '@atena/api-types';
import { getResendCredentials } from '../system/integration-secrets.service';

/**
 * Verifies Svix webhook signature (standard for Resend Webhooks)
 */
export function verifyResendWebhookSignature(params: {
  payload: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  webhookSecret: string;
}): boolean {
  const { payload, headers, webhookSecret } = params;
  if (!webhookSecret) return true; // If no secret configured, skip verification in dev

  const msgId = (headers['svix-id'] || headers['Svix-Id']) as string | undefined;
  const msgTimestamp = (headers['svix-timestamp'] || headers['Svix-Timestamp']) as string | undefined;
  const msgSignature = (headers['svix-signature'] || headers['Svix-Signature']) as string | undefined;

  if (!msgId || !msgTimestamp || !msgSignature) {
    return false;
  }

  // Reject signatures older than 5 minutes to prevent replay attacks
  const timestampNum = parseInt(msgTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(timestampNum) || Math.abs(now - timestampNum) > 300) {
    return false;
  }

  const rawBody = typeof payload === 'string' ? payload : payload.toString('utf8');
  const toSign = `${msgId}.${msgTimestamp}.${rawBody}`;

  // Resend webhook secrets start with "whsec_"
  const secretBytes = webhookSecret.startsWith('whsec_')
    ? Buffer.from(webhookSecret.slice(6), 'base64')
    : Buffer.from(webhookSecret, 'utf8');

  const expectedSig = crypto
    .createHmac('sha256', secretBytes)
    .update(toSign)
    .digest('base64');

  const passedSignatures = msgSignature.split(' ');
  for (const versionedSig of passedSignatures) {
    const parts = versionedSig.split(',');
    const sig = parts.length > 1 ? parts[1] : parts[0];
    try {
      if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        return true;
      }
    } catch {
      // safe continue
    }
  }

  return false;
}

/**
 * Handles incoming Resend webhook events and updates notification_logs
 */
export async function handleResendWebhook(params: {
  supabase: SupabaseClient;
  rawBody: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  webhookSecret?: string;
}): Promise<{ success: boolean; processed: number; error?: string }> {
  const { supabase, rawBody, headers, webhookSecret } = params;

  const resendCreds = await getResendCredentials(supabase);
  const secret = webhookSecret || resendCreds.webhookSecret;

  if (secret) {
    const isValid = verifyResendWebhookSignature({
      payload: rawBody,
      headers,
      webhookSecret: secret,
    });

    if (!isValid) {
      return { success: false, processed: 0, error: 'Invalid Resend webhook signature' };
    }
  }

  let eventPayload: any;
  try {
    const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    eventPayload = JSON.parse(bodyStr);
  } catch (err: any) {
    return { success: false, processed: 0, error: `JSON parse error: ${err.message}` };
  }

  const events: ResendWebhookEvent[] = Array.isArray(eventPayload)
    ? eventPayload
    : [eventPayload];

  let processedCount = 0;

  for (const event of events) {
    if (!event || !event.type || !event.data) continue;

    const emailId = event.data.email_id;
    const eventType = event.type;
    const recipient = Array.isArray(event.data.to) ? event.data.to[0] : (event.data.to || '');
    const subject = event.data.subject || '';

    let isSuccessStatus = true;
    if (eventType === 'email.bounced' || eventType === 'email.complained') {
      isSuccessStatus = false;
    }

    try {
      // Find matching notification_log by messageId in response jsonb
      let matchedLog: any = null;

      if (emailId) {
        const { data: logs } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('channel', NotificationChannel.EMAIL)
          .contains('response', { id: emailId })
          .limit(1);

        if (logs && logs.length > 0) {
          matchedLog = logs[0];
        } else {
          // Check response->messageId variant
          const { data: altLogs } = await supabase
            .from('notification_logs')
            .select('*')
            .eq('channel', NotificationChannel.EMAIL)
            .contains('response', { messageId: emailId })
            .limit(1);

          if (altLogs && altLogs.length > 0) {
            matchedLog = altLogs[0];
          }
        }
      }

      if (matchedLog) {
        // Append event to existing response jsonb
        const existingResponse = matchedLog.response || {};
        const eventsList = Array.isArray(existingResponse.webhook_events)
          ? existingResponse.webhook_events
          : [];

        eventsList.push({
          type: eventType,
          timestamp: event.created_at || new Date().toISOString(),
          data: event.data,
        });

        const newStatus = isSuccessStatus
          ? matchedLog.status
          : NotificationStatus.FAILED;

        await supabase
          .from('notification_logs')
          .update({
            status: newStatus,
            response: {
              ...existingResponse,
              last_event: eventType,
              webhook_events: eventsList,
            },
          })
          .eq('id', matchedLog.id);

        processedCount++;
      } else if (recipient) {
        // If not matched by ID, record as a new notification_log entry
        await supabase.from('notification_logs').insert({
          channel: NotificationChannel.EMAIL,
          notification_type: NotificationType.BOOKING_CONFIRMATION,
          recipient,
          subject: subject || `Resend Email ${eventType}`,
          request: {
            provider: 'resend_webhook',
            email_id: emailId,
          },
          response: {
            id: emailId,
            last_event: eventType,
            webhook_events: [
              {
                type: eventType,
                timestamp: event.created_at || new Date().toISOString(),
                data: event.data,
              },
            ],
          },
          status: isSuccessStatus ? NotificationStatus.SENT : NotificationStatus.FAILED,
        });

        processedCount++;
      }
    } catch (err) {
      console.warn('[ResendWebhook] Error processing event:', err);
    }
  }

  return { success: true, processed: processedCount };
}
