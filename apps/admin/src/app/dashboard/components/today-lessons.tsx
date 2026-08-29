import { Calendar, Clock, MapPin, Video, CheckCircle2, FileX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useTranslation } from "@/i18n/context"

export function TodayLessons() {
  const { t } = useTranslation()
  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ["schedules", "list"],
    queryFn: () => api.get<any[]>("/schedules"),
  })

  const lessonsList = Array.isArray(schedulesData) ? schedulesData : []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t("dashboard.upcomingLessons")}
          </CardTitle>
          <CardDescription>{t("dashboard.calendarNotice")}</CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          {t("common.total")}: {lessonsList.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : lessonsList.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center space-y-2 bg-card/40">
            <FileX className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-semibold text-sm">{t("dashboard.noLessonsToday")}</p>
            <p className="text-xs text-muted-foreground">{t("schedule.subtitle")}</p>
          </div>
        ) : (
          lessonsList.slice(0, 5).map((lesson: any, idx: number) => (
            <div key={lesson.id || idx} className="p-3.5 rounded-xl border bg-card hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center min-w-[90px]">
                  <Clock className="w-4 h-4 mb-0.5" />
                  <span className="text-xs font-semibold">{lesson.start_time || '10:00'} - {lesson.end_time || '11:30'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{lesson.courseName || `${t("common.course")} #${idx + 1}`}</span>
                    {lesson.format === 'online' ? (
                      <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Video className="w-3 h-3 mr-1" /> {t("courses.online")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <MapPin className="w-3 h-3 mr-1" /> {t("courses.inPerson")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{lesson.teacherName || t("common.teacher")} • {lesson.room || t("common.classroom")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge variant="outline" className="text-xs px-2.5 py-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  {t("common.active")}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
