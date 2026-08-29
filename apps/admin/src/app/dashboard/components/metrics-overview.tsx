"use client"

import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  BarChart3 
} from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"

import { useTranslation } from "@/i18n/context"

export function MetricsOverview() {
  const { t } = useTranslation()
  const { data: revenueData } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => api.get<any>("/admin/reports/revenue"),
  })

  const { data: studentsData } = useQuery({
    queryKey: ["students", "list"],
    queryFn: () => api.get<any>("/admin/students"),
  })

  const { data: attendanceData } = useQuery({
    queryKey: ["reports", "attendance-summary"],
    queryFn: () => api.get<any>("/admin/reports/attendance-summary"),
  })

  const realRevenue = revenueData?.summary?.totalRevenue ?? 0
  const realCourseRev = revenueData?.summary?.coursePaymentsRevenue ?? 0
  const realFeeRev = revenueData?.summary?.membershipFeesRevenue ?? 0
  const realStudentsCount = Array.isArray(studentsData?.items) 
    ? studentsData.items.length 
    : (Array.isArray(studentsData) ? studentsData.length : (studentsData?.total ?? 0))
  const realTransactionsCount = revenueData?.summary?.transactionCount ?? 0
  const realAttendanceRate = attendanceData?.summary?.attendanceRatePercentage ?? 0

  const metrics = [
    {
      title: t("dashboard.totalRevenue"),
      value: formatCurrency(realRevenue),
      description: t("payments.totalIncome"),
      icon: DollarSign,
      footer: `${t("payments.courseTuitions")}: ${formatCurrency(realCourseRev)}`,
      subfooter: `${t("payments.membershipFees")}: ${formatCurrency(realFeeRev)}`,
    },
    {
      title: t("dashboard.activeStudents"),
      value: realStudentsCount.toLocaleString(),
      description: t("users.studentProfile"),
      icon: Users,
      footer: t("users.title"),
      subfooter: "Atena CRM",
    },
    {
      title: t("dashboard.totalBookings"),
      value: realTransactionsCount.toLocaleString(),
      description: t("bookings.title"),
      icon: ShoppingCart,
      footer: t("payments.title"),
      subfooter: "Stripe / Cash / POS",
    },
    {
      title: t("attendance.title"),
      value: `${realAttendanceRate}%`,
      description: t("attendance.subtitle"),
      icon: BarChart3,
      footer: `${t("attendance.todayLessons")}: ${attendanceData?.summary?.totalLessons ?? 0}`,
      subfooter: `${t("attendance.present")}: ${attendanceData?.summary?.presentCount ?? 0}`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        return (
          <Card key={metric.title} className="border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-xs text-muted-foreground flex items-center justify-between">
                <span>{metric.title}</span>
                <metric.icon className="h-4 w-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-xs pt-0">
              <div className="font-medium text-foreground">
                {metric.footer}
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
