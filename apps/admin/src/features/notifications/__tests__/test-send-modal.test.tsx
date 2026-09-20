import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestSendModal } from "../components/test-send-modal";
import { NotificationChannel } from "@atena/api-types";
import { LanguageProvider } from "@/i18n/context";

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("Admin Notifications - TestSendModal Component Strict Tests", () => {
  const emailTemplate = {
    id: "tmpl-email-1",
    code: "booking_confirmation_customer",
    name: "Conferma Prenotazione Cliente",
    channel: NotificationChannel.EMAIL,
    subject: "Conferma Corso",
    body_html: "<p>Hello</p>",
    body_text: "Hello",
    is_active: true,
    created_at: "2026-09-20T00:00:00.000Z",
    updated_at: "2026-09-20T00:00:00.000Z",
  } as any;

  const telegramTemplate = {
    id: "tmpl-tg-1",
    code: "telegram_booking_alert",
    name: "Alert Telegram Segreteria",
    channel: NotificationChannel.TELEGRAM,
    subject: null,
    body_html: null,
    body_text: "Nuova prenotazione!",
    is_active: true,
    created_at: "2026-09-20T00:00:00.000Z",
    updated_at: "2026-09-20T00:00:00.000Z",
  } as any;

  it("does not render when isOpen=false or template=null", () => {
    const { container } = renderWithI18n(
      <TestSendModal
        template={null}
        isOpen={false}
        onClose={vi.fn()}
        onSendTest={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("prefills default email recipient for email template and validates email regex", async () => {
    const onSendTest = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <TestSendModal
        template={emailTemplate}
        isOpen={true}
        onClose={onClose}
        onSendTest={onSendTest}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("atenaschool20@gmail.com");

    // Clear and enter invalid email
    fireEvent.change(input, { target: { value: "invalid-email-address" } });
    expect(screen.getByText(/valid email address|indirizzo email valido/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /send now|invia ora/i });
    expect(submitBtn).toBeDisabled();

    // Enter valid email
    fireEvent.change(input, { target: { value: "tester@example.com" } });
    expect(screen.queryByText(/valid email address|indirizzo email valido/i)).not.toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSendTest).toHaveBeenCalledWith({ recipient: "tester@example.com" });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("validates telegram chat ID and rejects IDs containing spaces", async () => {
    const onSendTest = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <TestSendModal
        template={telegramTemplate}
        isOpen={true}
        onClose={onClose}
        onSendTest={onSendTest}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");

    // Enter invalid telegram chat ID with space
    fireEvent.change(input, { target: { value: "invalid chat id" } });
    expect(screen.getByText(/valid telegram chat id|chat id telegram valido/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /send now|invia ora/i });
    expect(submitBtn).toBeDisabled();

    // Enter valid telegram chat ID
    fireEvent.change(input, { target: { value: "-100198273645" } });
    expect(screen.queryByText(/valid telegram chat id|chat id telegram valido/i)).not.toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSendTest).toHaveBeenCalledWith({ recipient: "-100198273645" });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
