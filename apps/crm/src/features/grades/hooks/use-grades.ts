import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { courses, grades } from "@/lib/mock-data";

export function useGrades() {
  const students = useAppStore((s) => s.students);
  const [corsoId, setCorsoId] = useState(courses[0].id);

  const corso = courses.find((c) => c.id === corsoId)!;

  const rows = students
    .filter((s) => s.corsiIds.includes(corsoId))
    .map((s) => {
      const g = grades.find((x) => x.studentId === s.id && x.corsoId === corsoId);
      const media = g ? Math.round((g.speaking + g.listening + g.reading + g.writing) / 4) : 0;
      return { s, g, media };
    });

  const votoColor = (v: number) =>
    v >= 85
      ? "bg-success/10 text-success border-success/40"
      : v >= 70
        ? "bg-primary/10 text-primary border-primary/40"
        : v >= 55
          ? "bg-warning/15 text-warning-foreground border-warning/40"
          : "bg-destructive/10 text-destructive border-destructive/40";

  return {
    corsoId,
    setCorsoId,
    corso,
    rows,
    votoColor,
  };
}
