import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriggerEditorDrawer } from "../components/trigger-editor-drawer";
import { NotificationChannel, RecipientType } from "@atena/api-types";
import { LanguageProvider } from "@/i18n/context";

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

const mockSystemEvents = {
  "booking.created_stripe": {
    event_key: "booking.created_stripe",
    label_it: "Nuova Prenotazione Stripe",
    label_en: "New Stripe Booking",
    description_it: "Scatta al completamento del checkout online Stripe",
    description_en: "Fires when checkout is completed via Stripe",
    available_variables: [
      { key: "purchaser_name", label_it: "Nome Cliente", label_en: "Purchaser Name", example: "Mario Rossi" },
      { key: "total_amount", label_it: "Importo Totale", label_en: "Total Amount", example: "180" },
    ],
  },
  "lesson.reminder_24h": {
    event_key: "lesson.reminder_24h",
    label_it: "Promemoria Lezione (24h)",
    label_en: "Lesson Reminder (24h)",
    description_it: "Scatta 24 ore prima dell'inizio della lezione",
    description_en: "Fires 24 hours prior to lesson start",
    available_variables: [
      { key: "student_name", label_it: "Nome Studente", label_en: "Student Name", example: "Luca" },
      { key: "lesson_date", label_it: "Data Lezione", label_en: "Lesson Date", example: "2026-10-01" },
    ],
  },
};

const mockTemplates = [
  {
    id: "tmpl-email-1",
    code: "email_booking_confirm",
    name: "Email Conferma Prenotazione",
    channel: 1, // NotificationChannel.EMAIL
    subject: "Conferma Prenotazione",
    body_html: "<p>Conferma</p>",
    body_text: "Conferma",
    is_active: true,
    created_at: "2026-09-20T00:00:00.000Z",
    updated_at: "2026-09-20T00:00:00.000Z",
  },
  {
    id: "tmpl-tg-1",
    code: "tg_admin_alert",
    name: "Telegram Alert Segreteria",
    channel: 2, // NotificationChannel.TELEGRAM
    subject: null,
    body_html: null,
    body_text: "Nuova prenotazione ricevuta!",
    is_active: true,
    created_at: "2026-09-20T00:00:00.000Z",
    updated_at: "2026-09-20T00:00:00.000Z",
  },
] as any[];

describe("Admin Notifications - TriggerEditorDrawer Strict Component Tests", () => {
  it("does not render when isOpen=false", () => {
    const { container } = renderWithI18n(
      <TriggerEditorDrawer
        trigger={null}
        templates={mockTemplates}
        systemEvents={mockSystemEvents}
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders new trigger form with default values and validates required name", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <TriggerEditorDrawer
        trigger={null}
        templates={mockTemplates}
        systemEvents={mockSystemEvents}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // Title for new trigger
    expect(screen.getByText(/create automation rule|crea nuova regola/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Ricevuta Stripe al Cliente/i);
    expect(nameInput).toHaveValue("");

    // Submit button should be disabled when name is empty
    const submitBtn = screen.getByRole("button", { name: /create rule|crea regola/i });
    expect(submitBtn).toBeDisabled();

    // Type name
    fireEvent.change(nameInput, { target: { value: "Automazione Notifica Cliente" } });
    expect(submitBtn).not.toBeDisabled();

    // Click variable button to insert into conditions
    const varBtn = screen.getByRole("button", { name: /purchaser_name/i });
    fireEvent.click(varBtn);

    const conditionTextarea = screen.getByPlaceholderText(/\{\} o \{"payment_method"/i);
    expect(conditionTextarea).toHaveValue('{\n  "purchaser_name": "Mario Rossi"\n}');

    // Submit form
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Automazione Notifica Cliente",
        description: undefined,
        event_key: "booking.created_stripe",
        template_id: "tmpl-email-1",
        channel: NotificationChannel.EMAIL,
        recipient_type: RecipientType.CUSTOMER,
        custom_recipient: undefined,
        conditions: { purchaser_name: "Mario Rossi" },
        timing_type: "immediate",
        delay_seconds: 0,
        is_active: true,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("switches channel to Telegram, updating templateId automatically", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <TriggerEditorDrawer
        trigger={null}
        templates={mockTemplates}
        systemEvents={mockSystemEvents}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/e\.g\. Ricevuta Stripe al Cliente/i);
    fireEvent.change(nameInput, { target: { value: "Telegram Notifica Admin" } });

    // Switch channel to Telegram
    const tgChannelBtn = screen.getByRole("button", { name: /telegram/i });
    fireEvent.click(tgChannelBtn);

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /create rule|crea regola/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Telegram Notifica Admin",
          channel: NotificationChannel.TELEGRAM,
          template_id: "tmpl-tg-1",
        })
      );
    });
  });

  it("pre-populates existing trigger data and handles delayed timing and custom recipient", async () => {
    const existingTrigger = {
      id: "trig-123",
      name: "Sollecito Pagamento",
      description: "Invia promemoria dopo 2 ore",
      event_key: "lesson.reminder_24h",
      template_id: "tmpl-email-1",
      channel: NotificationChannel.EMAIL,
      recipient_type: 4, // Custom recipient
      custom_recipient: "director@atenaschool.com",
      timing_type: "delayed",
      delay_seconds: 7200, // 120 minutes
      conditions: { min_amount: 50 },
      is_active: false,
    } as any;

    const onSave = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <TriggerEditorDrawer
        trigger={existingTrigger}
        templates={mockTemplates}
        systemEvents={mockSystemEvents}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/edit automation rule|modifica regola/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Ricevuta Stripe al Cliente/i);
    expect(nameInput).toHaveValue("Sollecito Pagamento");

    const customRecipientInput = screen.getByPlaceholderText(/director@atenaschool\.com/i);
    expect(customRecipientInput).toHaveValue("director@atenaschool.com");

    const delayInput = screen.getByPlaceholderText(/120 \(2 ore\)/i);
    expect(delayInput).toHaveValue(120);

    // Change delay minutes to 60
    fireEvent.change(delayInput, { target: { value: "60" } });

    const submitBtn = screen.getByRole("button", { name: /save changes|salva modifiche/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Sollecito Pagamento",
        description: "Invia promemoria dopo 2 ore",
        event_key: "lesson.reminder_24h",
        template_id: "tmpl-email-1",
        channel: NotificationChannel.EMAIL,
        recipient_type: 4,
        custom_recipient: "director@atenaschool.com",
        conditions: { min_amount: 50 },
        timing_type: "delayed",
        delay_seconds: 3600, // 60 * 60
        is_active: false,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("handles malformed JSON conditions gracefully by falling back to empty object", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <TriggerEditorDrawer
        trigger={null}
        templates={mockTemplates}
        systemEvents={mockSystemEvents}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByPlaceholderText(/e\.g\. Ricevuta Stripe al Cliente/i);
    fireEvent.change(nameInput, { target: { value: "Trigger Test Malformed JSON" } });

    const conditionTextarea = screen.getByPlaceholderText(/\{\} o \{"payment_method"/i);
    fireEvent.change(conditionTextarea, { target: { value: "{ this is invalid json !!!" } });

    const submitBtn = screen.getByRole("button", { name: /create rule|crea regola/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Trigger Test Malformed JSON",
          conditions: {},
        })
      );
    });
  });
});
