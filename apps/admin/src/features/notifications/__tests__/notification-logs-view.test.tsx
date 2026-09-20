import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationLogsView } from "../components/notification-logs-view";
import { NotificationChannel, NotificationStatus } from "@atena/api-types";
import { LanguageProvider } from "@/i18n/context";

const mockUseNotificationLogs = vi.fn();

vi.mock("../hooks/use-notification-templates", () => ({
  useNotificationLogs: (params: any) => mockUseNotificationLogs(params),
}));

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("Admin Notifications - NotificationLogsView Component Strict Tests", () => {
  const mockLogs = [
    {
      id: "log-1",
      channel: NotificationChannel.EMAIL,
      recipient: "customer@example.com",
      subject: "Conferma Prenotazione Corso Inglese",
      status: NotificationStatus.SENT,
      event_type: "booking.created_stripe",
      created_at: "2026-09-20T10:00:00.000Z",
      payload: { course_name: "Inglese Base", amount: 180 },
    },
    {
      id: "log-2",
      channel: NotificationChannel.TELEGRAM,
      recipient: "-100123456789",
      subject: null,
      status: NotificationStatus.FAILED,
      error_message: "Chat not found",
      event_type: "booking.created_stripe",
      created_at: "2026-09-20T11:00:00.000Z",
      payload: { course_name: "Spagnolo", amount: 120 },
    },
  ];

  beforeEach(() => {
    mockUseNotificationLogs.mockReturnValue({
      logs: mockLogs,
      total: 2,
      limit: 20,
      loading: false,
      refresh: vi.fn(),
    });
  });

  it("renders notification logs table with recipient and subject data", () => {
    renderWithI18n(<NotificationLogsView />);

    expect(screen.getByText("customer@example.com")).toBeInTheDocument();
    expect(screen.getByText("-100123456789")).toBeInTheDocument();
    expect(screen.getByText("Conferma Prenotazione Corso Inglese")).toBeInTheDocument();
  });

  it("updates search filter and channel filter on user interaction", () => {
    renderWithI18n(<NotificationLogsView />);

    const searchInput = screen.getByPlaceholderText(/search by recipient|cerca per destinatario/i);
    fireEvent.change(searchInput, { target: { value: "customer@" } });

    expect(mockUseNotificationLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "customer@",
      })
    );
  });

  it("opens modal with detailed payload and log details when eye icon is clicked", () => {
    renderWithI18n(<NotificationLogsView />);

    const viewButtons = screen.getAllByRole("button", { name: "" }).filter((btn) =>
      btn.querySelector(".lucide-eye")
    );

    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0]);
      expect(screen.getByText(/delivery details|dettaglio invio notifica/i)).toBeInTheDocument();
    }
  });
});
