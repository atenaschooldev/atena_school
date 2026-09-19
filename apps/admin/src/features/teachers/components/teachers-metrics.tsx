"use client";

import { Users, CheckCircle2, GraduationCap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";
import type { Teacher } from "../types";

export interface TeachersMetricsProps {
  teachers: Teacher[];
}

export function TeachersMetrics({ teachers }: TeachersMetricsProps) {
  const { t } = useTranslation();
  const activeCount = teachers.filter((teacher) => {
    const s = String(teacher.status ?? "").toLowerCase();
    return s === "active" || s === "attivo" || Number(teacher.status) === 1;
  }).length;
  const totalLessons = teachers.reduce((acc, teacher) => acc + (teacher.lessonCount || 0), 0);
  const totalCourses = teachers.reduce((acc, teacher) => acc + (teacher.courseCount || 0), 0);

  const metrics = [
    {
      title: t("teachers.registeredTeachers"),
      value: teachers.length,
      description: t("teachers.schoolFaculty"),
      icon: Users,
    },
    {
      title: t("teachers.activeTeachers"),
      value: activeCount,
      description: t("teachers.teachersWithCourses"),
      icon: CheckCircle2,
    },
    {
      title: t("teachers.assignedCourses"),
      value: totalCourses,
      description: t("teachers.coursesManaged"),
      icon: GraduationCap,
    },
    {
      title: t("teachers.lessonsCompleted"),
      value: totalLessons,
      description: t("teachers.hoursDelivered"),
      icon: Award,
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
