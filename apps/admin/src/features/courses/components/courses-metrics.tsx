import { GraduationCap, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "../types";
import { useTranslation } from "@/i18n/context";

export interface CoursesMetricsProps {
  courses: Course[];
}

export function CoursesMetrics({ courses }: CoursesMetricsProps) {
  const { t } = useTranslation();
  const activeCount = courses.filter((c) => String(c.stato ?? "").toLowerCase() === "attivo" || Number(c.stato) === 1).length;
  const inProgCount = courses.filter((c) => String(c.stato ?? "").toLowerCase() === "in-programmazione" || Number(c.stato) === 0).length;
  const totalLessonsCount = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);

  const metrics = [
    {
      title: t("courses.totalCourses"),
      value: courses.length,
      description: t("courses.coursesInCatalog"),
      icon: GraduationCap,
    },
    {
      title: t("courses.activeCourses"),
      value: activeCount,
      description: t("courses.ongoing"),
      icon: CheckCircle2,
    },
    {
      title: t("courses.inPlanning"),
      value: inProgCount,
      description: t("courses.startingSoon"),
      icon: Clock,
    },
    {
      title: t("courses.totalLessonsEst"),
      value: totalLessonsCount,
      description: t("courses.calendarLessons"),
      icon: Calendar,
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
