"use client"

import { 
  Euro, 
  Users, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"
import { useTranslation } from "@/i18n/context"

export function MetricsOverview() {
  const { t, locale } = useTranslation()

  // 1. Revenue Report
  const { data: revenueData } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => api.get<any>("/admin/reports/revenue"),
  })

  // 2. Students Data
  const { data: studentsData } = useQuery({
    queryKey: ["students", "list"],
    queryFn: () => api.get<any>("/admin/students"),
  })

  // 3. Debtors / Pending balances
  const { data: debtorsData } = useQuery({
    queryKey: ["reports", "debtors"],
    queryFn: () => api.get<any>("/admin/reports/debtors"),
  })

  // 4. Schedules / Today Lessons
  const { data: schedulesData } = useQuery({
    queryKey: ["schedules", "list"],
    queryFn: () => api.get<any[]>("/admin/schedules"),
  })

  const realRevenue = revenueData?.summary?.totalRevenue ?? 0
  const realCourseRev = revenueData?.summary?.coursePaymentsRevenue ?? 0
  const realFeeRev = revenueData?.summary?.membershipFeesRevenue ?? 0

  const realStudentsCount = Array.isArray(studentsData?.items) 
    ? studentsData.items.length 
    : (Array.isArray(studentsData) ? studentsData.length : (studentsData?.total ?? 0))

  const debtorsList = Array.isArray(debtorsData?.debtors) ? debtorsData.debtors : []
  const totalOutstanding = debtorsData?.totalOutstandingEstimate ?? 0

  const schedulesList = Array.isArray(schedulesData) ? schedulesData : []
  // Count schedules running today (matching day of week or current date)
  const currentDayOfWeek = new Date().getDay()
  const todayLessonsCount = schedulesList.filter((s: any) => {
    if (s.dayOfWeek !== undefined) return s.dayOfWeek === currentDayOfWeek
    if (s.startDate) {
      const d = new Date(s.startDate)
      return d.toDateString() === new Date().toDateString()
    }
    return true
  }).length || schedulesList.length

  const metrics = [
    {
      title: locale === "en" ? "Total Revenue" : "Incasso Registrato",
      value: formatCurrency(realRevenue),
      subtitle: `${locale === "en" ? "Courses" : "Corsi"}: ${formatCurrency(realCourseRev)} • ${locale === "en" ? "Fees" : "Quote €30"}: ${formatCurrency(realFeeRev)}`,
      icon: Euro,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
    },
    {
      title: locale === "en" ? "Today's Lessons" : "Lezioni di Oggi",
      value: `${todayLessonsCount} ${locale === "en" ? "lessons" : "lezioni"}`,
      subtitle: locale === "en" ? "Scheduled in classrooms & online" : "Programmate in sede e online",
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/30",
    },
    {
      title: locale === "en" ? "Pending Payments" : "Da Saldare / In Sospeso",
      value: formatCurrency(totalOutstanding),
      subtitle: `${debtorsList.length} ${locale === "en" ? "unpaid bookings" : "iscrizioni in attesa"}`,
      icon: AlertCircle,
      color: totalOutstanding > 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400",
      bg: totalOutstanding > 0 ? "bg-rose-500/10" : "bg-amber-500/10",
      border: totalOutstanding > 0 ? "border-rose-500/30 hover:border-rose-500/50" : "hover:border-amber-500/30",
    },
    {
      title: locale === "en" ? "Active Students" : "Studenti Iscritti",
      value: `${realStudentsCount} ${locale === "en" ? "students" : "allievi"}`,
      subtitle: locale === "en" ? "Registered in courses & groups" : "Anagrafiche attive nel gestionale",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/30",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className={`border bg-card/80 backdrop-blur-xs shadow-xs transition-all ${metric.border}`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{metric.title}</span>
                <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {metric.subtitle}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
