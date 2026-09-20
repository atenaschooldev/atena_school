import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTemplateDialog } from "../components/create-template-dialog";
import { NotificationChannel, NotificationType, RecipientType } from "@atena/api-types";
import { LanguageProvider } from "@/i18n/context";

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("Admin Notifications - CreateTemplateDialog Component Strict Tests", () => {
  it("does not render when isOpen=false", () => {
    const { container } = renderWithI18n(
      <CreateTemplateDialog
        isOpen={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("auto-generates code slug from template name and submits valid Email template", async () => {
    const onCreate = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <CreateTemplateDialog
        isOpen={true}
        onClose={onClose}
        onCreate={onCreate}
      />
    );

    const nameInput = screen.getByPlaceholderText(/e\.g\. Promemoria Saldo Inizio Corso/i);
    const codeInput = screen.getByPlaceholderText(/e\.g\. payment_reminder_start/i);
    const submitBtn = screen.getByRole("button", { name: /create template|crea modello/i });

    expect(submitBtn).toBeDisabled();

    // Type name -> slug should auto-generate
    fireEvent.change(nameInput, { target: { value: "Sollecito Pagamento Quota" } });
    expect(codeInput).toHaveValue("sollecito_pagamento_quota");
    expect(submitBtn).not.toBeDisabled();

    // Subject input should be visible for email
    const subjectInput = screen.getByPlaceholderText(/e\.g\. Conferma Iscrizione/i);
    fireEvent.change(subjectInput, { target: { value: "Attenzione: Pagamento in scadenza" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        name: "Sollecito Pagamento Quota",
        code: "sollecito_pagamento_quota",
        description: undefined,
        channel: NotificationChannel.EMAIL,
        notification_type: NotificationType.BOOKING_CONFIRMATION,
        recipient_type: RecipientType.CUSTOMER,
        subject: "Attenzione: Pagamento in scadenza",
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("allows overriding with custom code slug without name overwrite", async () => {
    const onCreate = vi.fn().mockResolvedValue({ success: true });
    const onClose = vi.fn();

    renderWithI18n(
      <CreateTemplateDialog
        isOpen={true}
        onClose={onClose}
        onCreate={onCreate}
      />
    );

    const nameInput = screen.getByPlaceholderText(/e\.g\. Promemoria Saldo Inizio Corso/i);
    const codeInput = screen.getByPlaceholderText(/e\.g\. payment_reminder_start/i);

    // Enter custom slug first
    fireEvent.change(codeInput, { target: { value: "custom_unique_slug_99" } });
    // Now change name
    fireEvent.change(nameInput, { target: { value: "Different Template Name" } });

    // Custom code should be preserved
    expect(codeInput).toHaveValue("custom_unique_slug_99");

    const submitBtn = screen.getByRole("button", { name: /create template|crea modello/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Different Template Name",
          code: "custom_unique_slug_99",
        })
      );
    });
  });
});
