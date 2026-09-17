"use client";

import { Users, CheckCircle2, GraduationCap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Teacher } from "../types";

export interface TeachersMetricsProps {
  teachers: Teacher[];
}

export function TeachersMetrics({ teachers }: TeachersMetricsProps) {
  const activeCount = teachers.filter((t) => {
    const s = String(t.status ?? "").toLowerCase();
    return s === "active" || s === "attivo" || Number(t.status) === 1;
  }).length;
  const totalLessons = teachers.reduce((acc, t) => acc + (t.lessonCount || 0), 0);
  const totalCourses = teachers.reduce((acc, t) => acc + (t.courseCount || 0), 0);

  const metrics = [
    {
      title: "Docenti Registrati",
      value: teachers.length,
      description: "Corpo docente scuola",
      icon: Users,
    },
    {
      title: "Docenti Attivi",
      value: activeCount,
      description: "Insegnanti con corsi attivi",
      icon: CheckCircle2,
    },
    {
      title: "Corsi Assegnati",
      value: totalCourses,
      description: "Corsi gestiti dai docenti",
      icon: GraduationCap,
    },
    {
      title: "Lezioni Svolte",
      value: totalLessons,
      description: "Ore и lezioni erogate",
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
