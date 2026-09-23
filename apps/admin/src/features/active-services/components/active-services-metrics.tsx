import { Sparkles, RefreshCw, BookOpenCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import type { ActiveServicesStats } from "../types/active-service";

export interface ActiveServicesMetricsProps {
  stats: ActiveServicesStats;
}

export function ActiveServicesMetrics({ stats }: ActiveServicesMetricsProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t("activeServices.totalActive") || "Servizi Attivi Totali",
      value: stats.totalActive,
      description: t("activeServices.totalActiveDesc") || "Corsi e iscrizioni attive",
      icon: Sparkles,
      color: "text-primary",
    },
    {
      title: t("activeServices.subscriptions") || "Abbonamenti Stripe",
      value: stats.activeSubscriptions,
      description: t("activeServices.subscriptionsDesc") || "Piani ricorrenti attivi",
      icon: RefreshCw,
      color: "text-blue-500",
    },
    {
      title: t("activeServices.lessonsRatio") || "Lezioni Rimanenti",
      value: `${stats.totalRemainingLessons} / ${stats.totalCompletedLessons + stats.totalRemainingLessons}`,
      description: `${stats.totalCompletedLessons} ${t("activeServices.completed") || "completate"}`,
      icon: BookOpenCheck,
      color: "text-emerald-500",
    },
    {
      title: t("activeServices.unpaidAnnualFees") || "Quote €30 da Regolarizzare",
      value: stats.unpaidAnnualFeeCount,
      description: t("activeServices.unpaidAnnualFeesDesc") || "Studenti senza quota annuale",
      icon: AlertTriangle,
      color: stats.unpaidAnnualFeeCount > 0 ? "text-amber-500" : "text-muted-foreground",
    },
  ];

  return (
    <div className="@container/main px-4 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border bg-card shadow-xs">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <metric.icon className={`size-6 ${metric.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
                <div className="text-muted-foreground text-xs">{metric.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
