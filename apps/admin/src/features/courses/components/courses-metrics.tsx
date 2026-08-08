"use client";

import { GraduationCap, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "../types";

export interface CoursesMetricsProps {
  courses: Course[];
}

export function CoursesMetrics({ courses }: CoursesMetricsProps) {
  const activeCount = courses.filter((c) => (c.stato || "").toLowerCase() === "attivo").length;
  const inProgCount = courses.filter((c) => (c.stato || "").toLowerCase() === "in-programmazione").length;
  const totalLessonsCount = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);

  const metrics = [
    {
      title: "Totale Corsi",
      value: courses.length,
      description: "Corsi a catalogo",
      icon: GraduationCap,
    },
    {
      title: "Corsi Attivi",
      value: activeCount,
      description: "In corso di svolgimento",
      icon: CheckCircle2,
    },
    {
      title: "In Programmazione",
      value: inProgCount,
      description: "In partenza a breve",
      icon: Clock,
    },
    {
      title: "Totale Lezioni Stimate",
      value: totalLessonsCount,
      description: "Lezioni a calendario",
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
