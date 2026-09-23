import { Award, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";

export interface MembershipsMetricsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    expiredOrRevoked: number;
  };
}

export function MembershipsMetrics({ stats }: MembershipsMetricsProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t("memberships.metrics.totalTitle") || "Totale Tessere",
      value: stats.total,
      description: t("memberships.metrics.totalDesc") || "Registro generale soci registrati",
      icon: Award,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t("memberships.metrics.activeTitle") || "Soci Attivi",
      value: stats.active,
      description: t("memberships.metrics.activeDesc") || "In regola con la quota annuale",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: t("memberships.metrics.pendingTitle") || "In Attesa",
      value: stats.pending,
      description: t("memberships.metrics.pendingDesc") || "Da verificare o completare",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: t("memberships.metrics.expiredTitle") || "Scaduti / Da Rinnovare",
      value: stats.expiredOrRevoked,
      description: t("memberships.metrics.expiredDesc") || "Tessere pregresse o revocate",
      icon: AlertCircle,
      color: stats.expiredOrRevoked > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground",
      bgColor: stats.expiredOrRevoked > 0 ? "bg-rose-500/10" : "bg-muted/30",
    },
  ];

  return (
    <div className="@container/main px-4 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border bg-card shadow-xs">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${metric.bgColor}`}>
                  <metric.icon className={`size-5 ${metric.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{metric.title}</p>
                <div className="text-2xl font-bold tracking-tight text-foreground">{metric.value}</div>
                <div className="text-muted-foreground text-xs">{metric.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
