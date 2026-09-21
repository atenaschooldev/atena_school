import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SYSTEM_TRIGGERS, SystemTriggerDefinition } from '../system-triggers.config';
import { processNotificationTriggers } from '../notification.service';
import { NotificationChannel, NotificationType, RecipientType } from '@atena/api-types';

describe('System Notification Triggers (Code-as-Configuration)', () => {
  it('defines all required core system triggers', () => {
    expect(SYSTEM_TRIGGERS.length).toBeGreaterThanOrEqual(8);

    const eventKeys = SYSTEM_TRIGGERS.map((t) => t.event_key);
    expect(eventKeys).toContain('booking.created_stripe');
    expect(eventKeys).toContain('booking.pending_cash');
    expect(eventKeys).toContain('contact_form.submitted');
    expect(eventKeys).toContain('booking.cancelled');
    expect(eventKeys).toContain('membership.card_issued');
  });

  it('all triggers have valid template codes and channel assignments', () => {
    for (const trigger of SYSTEM_TRIGGERS) {
      expect(trigger.id).toBeDefined();
      expect(trigger.template_code).toBeDefined();
      expect([NotificationChannel.EMAIL, NotificationChannel.TELEGRAM]).toContain(trigger.channel);
      expect(trigger.is_active).toBe(true);
    }
  });

  describe('processNotificationTriggers Execution', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
    });

    it('processes active triggers for booking.created_stripe without error', async () => {
      const payload = {
        booking_id: 'b-123',
        purchaser_email: 'test@example.com',
        purchaser_name: 'Mario Rossi',
        course_name: 'English B1',
        total_amount: '120.00',
        is_paid_online: true,
      };

      await expect(
        processNotificationTriggers(mockSupabase, 'booking.created_stripe', payload)
      ).resolves.not.toThrow();
    });

    it('skips processing gracefully for unknown event key', async () => {
      await expect(
        processNotificationTriggers(mockSupabase, 'unknown.event.name', {})
      ).resolves.not.toThrow();
    });
  });
});
