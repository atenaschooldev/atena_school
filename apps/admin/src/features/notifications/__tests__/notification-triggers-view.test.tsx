import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationTriggersView } from "../components/notification-triggers-view";
import { NotificationChannel, RecipientType, TriggerTimingType } from "@atena/api-types";
import { LanguageProvider } from "@/i18n/context";

const mockUseNotificationTriggers = vi.fn();
const mockUseNotificationTemplates = vi.fn();

vi.mock("../hooks/use-notification-triggers", () => ({
  useNotificationTriggers: () => mockUseNotificationTriggers(),
}));

vi.mock("../hooks/use-notification-templates", () => ({
  useNotificationTemplates: () => mockUseNotificationTemplates(),
}));

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("Admin Notifications - NotificationTriggersView Component Strict Tests", () => {
  const mockTriggers = [
    {
      id: "trg-1",
      name: "Ricevuta Pagamento Stripe",
      event_key: "booking.created_stripe",
      notification_template_id: "tmpl-1",
      template_id: "tmpl-1",
      channel: NotificationChannel.EMAIL,
      recipient_type: RecipientType.CUSTOMER,
      timing_type: TriggerTimingType.IMMEDIATE,
      delay_seconds: 0,
      conditions: {},
      is_active: true,
      template: { id: "tmpl-1", name: "Conferma Prenotazione Email", code: "booking_confirm" },
    },
    {
      id: "trg-2",
      name: "Alert Telegram Segreteria",
      event_key: "booking.created_stripe",
      notification_template_id: "tmpl-2",
      template_id: "tmpl-2",
      channel: NotificationChannel.TELEGRAM,
      recipient_type: RecipientType.ADMIN,
      timing_type: TriggerTimingType.DELAYED,
      delay_seconds: 300,
      conditions: { min_amount: 50 },
      is_active: false,
      template: { id: "tmpl-2", name: "Notifica Nuova Iscrizione Admin", code: "admin_alert" },
    },
  ];

  const mockSystemEvents = {
    "booking.created_stripe": {
      event_key: "booking.created_stripe",
      label_it: "Nuova Prenotazione Stripe",
      label_en: "New Stripe Booking",
      description_it: "Scatta al checkout",
      description_en: "Fires on checkout",
      available_variables: [],
    },
  };

  beforeEach(() => {
    mockUseNotificationTemplates.mockReturnValue({ templates: [] });
  });

  it("renders trigger list with active statuses and channel indicators", () => {
    mockUseNotificationTriggers.mockReturnValue({
      triggers: mockTriggers,
      systemEvents: mockSystemEvents,
      loading: false,
      refresh: vi.fn(),
      createTrigger: vi.fn(),
      updateTrigger: vi.fn(),
      toggleTrigger: vi.fn(),
      deleteTrigger: vi.fn(),
      isCreating: false,
      isUpdating: false,
    });

    renderWithI18n(<NotificationTriggersView />);

    expect(screen.getByText("Ricevuta Pagamento Stripe")).toBeInTheDocument();
    expect(screen.getByText("Alert Telegram Segreteria")).toBeInTheDocument();
  });

  it("filters trigger list based on search term in real time", () => {
    mockUseNotificationTriggers.mockReturnValue({
      triggers: mockTriggers,
      systemEvents: mockSystemEvents,
      loading: false,
      refresh: vi.fn(),
      createTrigger: vi.fn(),
      updateTrigger: vi.fn(),
      toggleTrigger: vi.fn(),
      deleteTrigger: vi.fn(),
      isCreating: false,
      isUpdating: false,
    });

    renderWithI18n(<NotificationTriggersView />);

    const searchInput = screen.getByPlaceholderText(/search by rule|cerca per nome regola/i);
    fireEvent.change(searchInput, { target: { value: "Telegram" } });

    expect(screen.queryByText("Ricevuta Pagamento Stripe")).not.toBeInTheDocument();
    expect(screen.getByText("Alert Telegram Segreteria")).toBeInTheDocument();
  });

  it("calls toggleTrigger when switch is toggled", () => {
    const toggleTrigger = vi.fn();
    mockUseNotificationTriggers.mockReturnValue({
      triggers: mockTriggers,
      systemEvents: mockSystemEvents,
      loading: false,
      refresh: vi.fn(),
      createTrigger: vi.fn(),
      updateTrigger: vi.fn(),
      toggleTrigger,
      deleteTrigger: vi.fn(),
      isCreating: false,
      isUpdating: false,
    });

    renderWithI18n(<NotificationTriggersView />);

    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(2);

    fireEvent.click(switches[0]);
    expect(toggleTrigger).toHaveBeenCalledWith("trg-1", false);
  });
});
