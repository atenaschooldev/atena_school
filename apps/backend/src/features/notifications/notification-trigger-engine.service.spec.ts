import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationTriggerEngineService } from './notification-trigger-engine.service';
import { NotificationChannel, RecipientType } from '@atena/api-types';

describe('NotificationTriggerEngineService', () => {
  let service: NotificationTriggerEngineService;
  let mockPrisma: any;
  let mockMailService: any;
  let mockTelegramService: any;

  beforeEach(() => {
    mockPrisma = {
      notification_triggers: {
        findMany: vi.fn(),
      },
      school_profile: {
        findFirst: vi.fn().mockResolvedValue({
          name: 'Atena School',
          email: 'info@atenaschool.com',
          secretariatEmail: 'segreteria@atenaschool.com',
        }),
      },
      notification_logs: {
        create: vi.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };

    mockMailService = {
      sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
    };

    mockTelegramService = {
      sendMessage: vi.fn().mockResolvedValue({ success: true, messageId: 100 }),
    };

    service = new NotificationTriggerEngineService(
      mockPrisma,
      mockMailService,
      mockTelegramService,
    );
  });

  it('processes active email trigger and resolves customer recipient correctly', async () => {
    mockPrisma.notification_triggers.findMany.mockResolvedValue([
      {
        id: 'trg-1',
        name: 'Confirmation to Customer',
        eventKey: 'booking.created_stripe',
        channel: NotificationChannel.EMAIL,
        recipientType: RecipientType.CUSTOMER,
        conditions: {},
        isActive: true,
        template: {
          id: 'tmpl-1',
          code: 'email_booking_confirmation',
          subject: 'Conferma prenotazione {{course_name}}',
          isActive: true,
          blocksConfig: null,
          bodyHtml: '<p>Ciao {{purchaser_name}}, la tua prenotazione per {{course_name}} è confermata.</p>',
        },
      },
    ]);

    const payload = {
      purchaser_name: 'Giulia Bianchi',
      purchaser_email: 'giulia@example.com',
      course_name: 'Corso di Inglese',
      booking_id: 'b-999',
    };

    await service.processEvent('booking.created_stripe', payload);

    expect(mockMailService.sendEmail).toHaveBeenCalledWith(
      'giulia@example.com',
      'Conferma prenotazione Corso di Inglese',
      'Conferma prenotazione Corso di Inglese',
      '<p>Ciao Giulia Bianchi, la tua prenotazione per Corso di Inglese è confermata.</p>',
      undefined
    );

    expect(mockPrisma.notification_logs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationTriggerId: 'trg-1',
          notificationTemplateId: 'tmpl-1',
        }),
      })
    );
  });

  it('processes admin telegram trigger and delivers message to chat', async () => {
    mockPrisma.notification_triggers.findMany.mockResolvedValue([
      {
        id: 'trg-2',
        name: 'Telegram Admin Alert',
        eventKey: 'contact_form.submitted',
        channel: NotificationChannel.TELEGRAM,
        recipientType: RecipientType.ADMIN,
        conditions: {},
        isActive: true,
        template: {
          id: 'tmpl-2',
          code: 'telegram_contact_form',
          isActive: true,
          blocksConfig: null,
          bodyText: '📩 Nuovo messaggio da {{sender_name}}: {{message}}',
        },
      },
    ]);

    const payload = {
      sender_name: 'Marco Rossi',
      sender_email: 'marco@example.com',
      message: 'Vorrei info sui corsi serali',
    };

    await service.processEvent('contact_form.submitted', payload);

    expect(mockTelegramService.sendMessage).toHaveBeenCalledWith(
      '📩 Nuovo messaggio da Marco Rossi: Vorrei info sui corsi serali',
      undefined,
      undefined,
      undefined
    );
  });

  it('skips execution when trigger condition does not match', async () => {
    mockPrisma.notification_triggers.findMany.mockResolvedValue([
      {
        id: 'trg-3',
        name: 'Only For High Value',
        eventKey: 'payment.succeeded',
        channel: NotificationChannel.EMAIL,
        recipientType: RecipientType.ADMIN,
        conditions: {
          total_amount: { '>=': 500 },
        },
        isActive: true,
        template: {
          id: 'tmpl-3',
          code: 'high_value_alert',
          isActive: true,
          subject: 'Grande incasso!',
          bodyHtml: '<p>Incasso di {{total_amount}} euro</p>',
        },
      },
    ]);

    // Payload with amount < 500
    await service.processEvent('payment.succeeded', { total_amount: 150 });

    expect(mockMailService.sendEmail).not.toHaveBeenCalled();
  });
});
