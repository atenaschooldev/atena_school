"use client"

import { FileX, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { assetUrl } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency, formatDateItalian } from "@atena/utils"
import { useTranslation } from "@/i18n/context"
import { StatusBadge } from "@/components/shared/status-badge"

export function RecentTransactions() {
  const { t, locale } = useTranslation()
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => api.get<any>("/admin/reports/revenue"),
  })

  const realList = Array.isArray(revenueData?.recentTransactions) ? revenueData.recentTransactions : []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t("dashboard.recentTransactionsTitle")}</CardTitle>
          <CardDescription>{t("dashboard.recentTransactionsSubtitle")}</CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          {t("common.total")}: {realList.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : realList.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center space-y-2 bg-card/40">
            <FileX className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-semibold text-sm">{t("common.noData")}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.noTransactionsFound")}</p>
          </div>
        ) : (
          realList.slice(0, 5).map((transaction: any, idx: number) => {
            const name = transaction.purchaserName || t("common.purchaser")
            const email = transaction.purchaserEmail || transaction.paymentMethod || "Stripe"
            const amount = formatCurrency(transaction.amount ?? 0)
            const date = locale === "en"
              ? new Date(transaction.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : formatDateItalian(transaction.createdAt)

            return (
              <div key={transaction.id || idx}>
                <div className="flex p-3 rounded-lg border gap-2 hover:border-primary/30 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={assetUrl("https://notion-avatars.netlify.app/api/avatar/?preset=female-")} alt={name} />
                    <AvatarFallback>{name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 items-center flex-wrap justify-between gap-1">
                    <div className="flex items-center space-x-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={transaction.status} />
                      <div className="text-right">
                        <p className="text-sm font-medium">{amount}</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">{t("common.details")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
