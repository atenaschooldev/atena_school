import { BaseLayout } from "@/components/layouts/base-layout"
import { MetricsOverview } from "./components/metrics-overview"
import { DebtorsAndRenewals } from "./components/debtors-and-renewals"
import { SalesChart } from "./components/sales-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { TopProducts } from "./components/top-products"
import { TodayLessons } from "./components/today-lessons"
import { CustomerInsights } from "./components/customer-insights"
import { QuickActions } from "./components/quick-actions"
import { RevenueBreakdown } from "./components/revenue-breakdown"

export default function DashboardPage() {
  return (
    <BaseLayout title="Dashboard">
      <div className="flex-1 space-y-6 px-4 lg:px-6 pt-0 pb-8">
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Центр управления языковой школой</h1>
            <p className="text-muted-foreground text-sm">
              Аналитика выручки, задолженности, посещаемость и расписание уроков в реальном времени
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Main Dashboard Grid */}
        <div className="@container/main space-y-6">
          {/* Top Row - Key Metrics */}
          <MetricsOverview />

          {/* Action Required Alert Section */}
          <DebtorsAndRenewals />

          {/* Second Row - Financial Charts */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <SalesChart />
            <RevenueBreakdown />
          </div>

          {/* Third Row - Today's Live Operations */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <TodayLessons />
            <TopProducts />
          </div>

          {/* Fourth Row - Transactions & Demographics */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <RecentTransactions />
            <CustomerInsights />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
