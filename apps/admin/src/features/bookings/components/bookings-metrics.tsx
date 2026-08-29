import { ShoppingBag, CheckCircle2, Store, CircleDashed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";

export interface BookingsMetricsProps {
  stats: {
    totalCount: number;
    paidCount: number;
    reservedCount: number;
    leadsCount: number;
  };
}

export function BookingsMetrics({ stats }: BookingsMetricsProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t("bookings.totalBookings"),
      value: stats.totalCount,
      description: t("bookings.title"),
      icon: ShoppingBag,
    },
    {
      title: t("bookings.confirmedBookings"),
      value: stats.paidCount,
      description: t("common.paid"),
      icon: CheckCircle2,
    },
    {
      title: t("common.reserved"),
      value: stats.reservedCount,
      description: t("common.cash"),
      icon: Store,
    },
    {
      title: t("common.pending"),
      value: stats.leadsCount,
      description: t("courses.inPlanning"),
      icon: CircleDashed,
    },
  ];

  return (
    <div className="@container/main px-4 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <metric.icon className="text-muted-foreground size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-muted-foreground text-xs">{metric.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
