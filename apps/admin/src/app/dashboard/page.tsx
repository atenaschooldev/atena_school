import { BaseLayout } from "@/components/layouts/base-layout"
import { MetricsOverview } from "./components/metrics-overview"
import { DebtorsAndRenewals } from "./components/debtors-and-renewals"
import { SalesChart } from "./components/sales-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { TopProducts } from "./components/top-products"
import { TodayLessons } from "./components/today-lessons"
import { QuickActions } from "./components/quick-actions"
import { RevenueBreakdown } from "./components/revenue-breakdown"
import { useTranslation } from "@/i18n/context"

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <BaseLayout title={t("nav.dashboard")}>
      <div className="flex-1 space-y-6 px-4 lg:px-6 pt-0 pb-8">
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Main Dashboard Grid */}
        <div className="@container/main space-y-6">
          {/* Top Row - Key Operational KPI Metrics */}
          <MetricsOverview />

          {/* Action Required: Debtors & Unpaid Balances with Direct Settlement */}
          <DebtorsAndRenewals />

          {/* Second Row - Financial Charts (Revenue Timeline & Payment Method Breakdown) */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <SalesChart />
            <RevenueBreakdown />
          </div>

          {/* Third Row - Today's Live Schedule & Active Courses */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <TodayLessons />
            <TopProducts />
          </div>

          {/* Fourth Row - Real Live Transactions History */}
          <div className="grid gap-6 grid-cols-1">
            <RecentTransactions />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
