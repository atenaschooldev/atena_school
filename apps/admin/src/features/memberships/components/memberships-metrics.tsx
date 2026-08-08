"use client";

import { Award, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Membership } from "../types";

export interface MembershipsMetricsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    expiredOrRevoked: number;
  };
}

export function MembershipsMetrics({ stats }: MembershipsMetricsProps) {
  const metrics = [
    {
      title: "Tessere Totali",
      value: stats.total,
      description: "Iscrizioni annuali registrate",
      icon: Award,
    },
    {
      title: "Tessere Attive",
      value: stats.active,
      description: "Quota €30 saldata per l'anno",
      icon: CheckCircle2,
    },
    {
      title: "In Attesa",
      value: stats.pending,
      description: "In attesa di conferma",
      icon: Clock,
    },
    {
      title: "Scadute / Revocate",
      value: stats.expiredOrRevoked,
      description: "Da rinnovare per l'anno corrente",
      icon: AlertCircle,
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
