"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"
import { useTranslation } from "@/i18n/context"
import { CreditCard, Wallet, FileX, PieChart as PieChartIcon } from "lucide-react"

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  stripe: { label: "Stripe (Online)", color: "#6366f1" },
  card: { label: "Carta (Online)", color: "#6366f1" },
  pos: { label: "POS Fisico", color: "#3b82f6" },
  cash: { label: "Contanti", color: "#10b981" },
  contanti: { label: "Contanti", color: "#10b981" },
  bank_transfer: { label: "Bonifico Bancario", color: "#f59e0b" },
  bonifico: { label: "Bonifico Bancario", color: "#f59e0b" },
}

export function RevenueBreakdown() {
  const { t } = useTranslation()
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => api.get<any>("/admin/reports/revenue"),
  })

  const byMethod = revenueData?.byMethod || {}
  const totalRevenue = revenueData?.summary?.totalRevenue ?? 0
  const courseRevenue = revenueData?.summary?.coursePaymentsRevenue ?? 0
  const membershipRevenue = revenueData?.summary?.membershipFeesRevenue ?? 0

  const chartData = React.useMemo(() => {
    const entries = Object.entries(byMethod)
    if (!entries.length) return []
    return entries.map(([key, value]) => {
      const normalizedKey = key.toLowerCase()
      const meta = METHOD_LABELS[normalizedKey] || {
        label: key.toUpperCase(),
        color: "#8b5cf6",
      }
      return {
        name: meta.label,
        value: Number(value),
        color: meta.color,
      }
    }).filter(d => d.value > 0)
  }, [byMethod])

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            {t("dashboard.revenueBreakdownTitle")}
          </CardTitle>
          <CardDescription>{t("dashboard.revenueBreakdownSubtitle")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-4">
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[280px] border border-dashed rounded-xl flex flex-col items-center justify-center space-y-2 bg-card/40">
            <FileX className="w-8 h-8 text-muted-foreground" />
            <p className="font-semibold text-sm">{t("common.noData")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                    contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("dashboard.coursePayments")}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(courseRevenue)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("dashboard.membershipFees")}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(membershipRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
