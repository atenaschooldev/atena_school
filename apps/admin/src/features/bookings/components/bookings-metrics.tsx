"use client";

import { ShoppingBag, CheckCircle2, Store, CircleDashed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface BookingsMetricsProps {
  stats: {
    totalCount: number;
    paidCount: number;
    reservedCount: number;
    leadsCount: number;
  };
}

export function BookingsMetrics({ stats }: BookingsMetricsProps) {
  const metrics = [
    {
      title: "Totale Ordini",
      value: stats.totalCount,
      description: "Ordini registrati a sistema",
      icon: ShoppingBag,
    },
    {
      title: "Pagati Online",
      value: stats.paidCount,
      description: "Pagamenti completati via Stripe",
      icon: CheckCircle2,
    },
    {
      title: "Da Saldare in Sede",
      value: stats.reservedCount,
      description: "Prenotazioni da saldare alla scuola",
      icon: Store,
    },
    {
      title: "In Coordinamento",
      value: stats.leadsCount,
      description: "Richieste in attesa di orario",
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
