import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ShoppingBag, BookOpen, Calendar, CreditCard } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";

interface BookingStats {
  totalCount: number;
  paidCount: number;
  reservedCount: number;
  leadsCount: number;
}

interface PaymentsSummary {
  todayTotalCash?: number;
  todayTotalCount?: number;
}

export function DashboardView() {
  const { t } = useTranslation();
  const { data: bookingStats, isLoading: loadingBookings } = useQuery<BookingStats>({
    queryKey: ["bookings-stats"],
    queryFn: () => apiFetch<BookingStats>("/admin/bookings/stats"),
    staleTime: 1000 * 30,
  });

  const { data: paymentsSummary, isLoading: loadingPayments } = useQuery<PaymentsSummary>({
    queryKey: ["payments-summary"],
    queryFn: () => apiFetch<PaymentsSummary>("/admin/payments/summary"),
    staleTime: 1000 * 30,
  });

  const kpis = [
    {
      label: t("dashboard.totalBookings"),
      value: loadingBookings ? "..." : bookingStats?.totalCount ?? 0,
      icon: ShoppingBag,
      trend: t("bookings.statusActive"),
    },
    {
      label: t("dashboard.recentBookings"),
      value: loadingBookings ? "..." : bookingStats?.paidCount ?? 0,
      icon: BookOpen,
      trend: t("payments.succeeded"),
    },
    {
      label: t("dashboard.debtorsTitle"),
      value: loadingBookings ? "..." : bookingStats?.reservedCount ?? 0,
      icon: Calendar,
      trend: t("payments.pending"),
    },
    {
      label: t("dashboard.totalRevenue"),
      value: loadingPayments ? "..." : `€${Number(paymentsSummary?.todayTotalCash || 0).toFixed(2)}`,
      icon: CreditCard,
      trend: t("dashboard.monthlyEarnings"),
    },
  ];

  return (
    <main className="flex-1 overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </div>
                <div className="text-3xl font-semibold mt-2 tabular">{k.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{k.trend}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
