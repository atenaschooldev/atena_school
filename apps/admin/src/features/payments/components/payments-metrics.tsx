"use client";

import { DollarSign, Banknote, CreditCard, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@atena/utils";
import type { PaymentsSummary } from "../types";

export interface PaymentsMetricsProps {
  summary?: PaymentsSummary;
}

export function PaymentsMetrics({ summary }: PaymentsMetricsProps) {
  const metrics = [
    {
      title: "Totale Incassato",
      value: formatCurrency(summary?.totalRevenue ?? 0),
      description: "Totale entrate confermate",
      icon: DollarSign,
    },
    {
      title: "Incassato in Contanti",
      value: formatCurrency(summary?.cashRevenue ?? 0),
      description: "Scontrini e contanti in sede",
      icon: Banknote,
    },
    {
      title: "Carta / POS / Stripe",
      value: formatCurrency((summary?.posRevenue ?? 0) + (summary?.stripeRevenue ?? 0)),
      description: "Pagamenti digitali e POS",
      icon: CreditCard,
    },
    {
      title: "In Attesa di Saldo",
      value: formatCurrency(summary?.pendingAmount ?? 0),
      description: "Prenotazioni da saldare",
      icon: Clock,
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
