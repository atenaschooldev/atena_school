"use client"

import { useState, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"
import { useTranslation } from "@/i18n/context"
import { TrendingUp, FileX } from "lucide-react"

const chartConfig = {
  sales: {
    label: "Incasso (€)",
    color: "var(--primary)",
  },
}

export function SalesChart() {
  const { t } = useTranslation()
  const [timeRange, setTimeRange] = useState("12m")

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => api.get<any>("/admin/reports/revenue"),
  })

  const rawTrend = Array.isArray(revenueData?.monthlyTrend) ? revenueData.monthlyTrend : []

  const filteredData = useMemo(() => {
    if (!rawTrend.length) return []
    const currentMonth = new Date().getMonth() // 0-11
    let monthsBack = 12
    if (timeRange === "3m") monthsBack = 3
    if (timeRange === "6m") monthsBack = 6

    const startIdx = Math.max(0, currentMonth - monthsBack + 1)
    return rawTrend.slice(startIdx, currentMonth + 1)
  }, [rawTrend, timeRange])

  const totalPeriodSales = filteredData.reduce((acc, curr) => acc + (curr.sales || 0), 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t("dashboard.salesPerformance")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.totalRevenue")}: <span className="font-semibold text-foreground">{formatCurrency(totalPeriodSales)}</span>
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m" className="cursor-pointer">Ultimi 3 mesi</SelectItem>
              <SelectItem value="6m" className="cursor-pointer">Ultimi 6 mesi</SelectItem>
              <SelectItem value="12m" className="cursor-pointer">Ultimi 12 mesi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="h-[300px] border border-dashed rounded-xl flex flex-col items-center justify-center space-y-2 bg-card/40">
              <FileX className="w-8 h-8 text-muted-foreground" />
              <p className="font-semibold text-sm">{t("common.noData")}</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `€${value.toLocaleString()}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Incasso (€)"
                  stroke="var(--primary)"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
