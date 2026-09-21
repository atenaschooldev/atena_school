import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  processNotificationTriggers,
  compileTemplate,
} from "../notification.service";
import { NotificationChannel, RecipientType, NotificationStatus } from "@atena/api-types";

describe("@atena/core - NotificationService Integration Tests", () => {
  let mockSupabase: any;
  let loggedNotifications: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    loggedNotifications = [];

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "notification_triggers") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation(function (this: any, col: string, val: any) {
              return this;
            }),
            order: vi.fn().mockReturnThis(),
            then: (resolve: any) =>
              resolve({
                data: [
                  {
                    id: "trigger-1",
                    name: "Conferma Prenotazione Stripe Cliente",
                    event_key: "booking.created_stripe",
                    channel: NotificationChannel.EMAIL,
                    recipient_type: RecipientType.CUSTOMER,
                    is_active: true,
                    conditions: {},
                    template: {
                      id: "tmpl-1",
                      code: "booking_confirmation_customer",
                      name: "Conferma Prenotazione",
                      channel: NotificationChannel.EMAIL,
                      subject: "Conferma Iscrizione {{student_name}}",
                      body_html: "<h1>Grazie {{purchaser_name}}!</h1>",
                      blocks_config: null,
                      is_active: true,
                    },
                  },
                  {
                    id: "trigger-2",
                    name: "Alert Telegram Segreteria",
                    event_key: "booking.created_stripe",
                    channel: NotificationChannel.TELEGRAM,
                    recipient_type: RecipientType.ADMIN,
                    is_active: true,
                    conditions: { min_amount: 50 },
                    template: {
                      id: "tmpl-2",
                      code: "telegram_booking_alert",
                      name: "Alert Telegram",
                      channel: NotificationChannel.TELEGRAM,
                      subject: null,
                      body_text: "Nuova prenotazione da {{amount_paid}}€ per {{student_name}}",
                      blocks_config: null,
                      is_active: true,
                    },
                  },
                ],
                error: null,
              }),
          };
        }

        if (table === "notification_logs") {
          return {
            insert: vi.fn().mockImplementation((record: any) => {
              loggedNotifications.push(record);
              return Promise.resolve({ data: [{ id: "log-1" }], error: null });
            }),
          };
        }

        if (table === "app_settings" || table === "system_integrations") {
          const appData = {
            data: {
              key: "school_profile",
              value: {
                name: "Atena School",
                email: "info@atenaschool.com",
                secretariat_email: "segreteria@atenaschool.com",
              },
            },
            error: null,
          };
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue(appData),
            maybeSingle: vi.fn().mockResolvedValue(appData),
          };
        }

        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };
  });

  describe("Template String Compiler (compileTemplate)", () => {
    it("compiles variables in string templates", () => {
      const compiled = compileTemplate("Benvenuto {{student_name}}, costo {{amount_paid}}€", {
        student_name: "Matteo",
        amount_paid: "103.20",
      });
      expect(compiled).toBe("Benvenuto Matteo, costo 103.20€");
    });
  });

  describe("Event Trigger Ingestion & Condition Routing", () => {
    it("processes triggers and routes notifications for matching events", async () => {
      const payload = {
        booking_id: "bk-12345",
        student_name: "Alessandro Manzoni",
        purchaser_name: "Alessandro Manzoni",
        purchaser_email: "alessandro@libero.it",
        amount_paid: 103.2,
        total_amount: 103.2,
      };

      await processNotificationTriggers(mockSupabase, "booking.created_stripe", payload);

      expect(mockSupabase.from).toHaveBeenCalledWith("notification_logs");
    });
  });
});
