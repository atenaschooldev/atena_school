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

export function MetricsOverview() {
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
      title: "Выручка (Total Revenue)",
      value: formatCurrency(realRevenue),
      description: "Все поступления в системе",
      icon: DollarSign,
      footer: `Курсы: ${formatCurrency(realCourseRev)}`,
      subfooter: `Взносы €30: ${formatCurrency(realFeeRev)}`,
    },
    {
      title: "Активные студенты",
      value: realStudentsCount.toLocaleString(),
      description: "Зарегистрированные студенты",
      icon: Users,
      footer: "Зарегистрированные профили",
      subfooter: "База данных CRM",
    },
    {
      title: "Успешные транзакции",
      value: realTransactionsCount.toLocaleString(),
      description: "Количество успешных оплат",
      icon: ShoppingCart,
      footer: "Проведённые платежи",
      subfooter: "Stripe & Наличные/POS",
    },
    {
      title: "Посещаемость уроков",
      value: `${realAttendanceRate}%`,
      description: "Средний показатель присутствия",
      icon: BarChart3,
      footer: `Всего уроков: ${attendanceData?.summary?.totalLessons ?? 0}`,
      subfooter: `Присутствовали: ${attendanceData?.summary?.presentCount ?? 0}`,
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
