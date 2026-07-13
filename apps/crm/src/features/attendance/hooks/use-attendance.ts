import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { lessons, courses } from "@/lib/mock-data";

export type Stato = "presente" | "assente" | "ritardo";

export function useAttendance() {
  const students = useAppStore((s) => s.students);
  const [lessonId, setLessonId] = useState(lessons[0].id);

  const lesson = lessons.find((l) => l.id === lessonId)!;
  const corso = courses.find((c) => c.id === lesson.corsoId)!;

  const iscritti = useMemo(
    () => students.filter((s) => s.corsiIds.includes(corso.id)),
    [students, corso.id],
  );

  const [attendance, setAttendance] = useState<Record<string, Stato>>({});

  // Reset/reinitialize attendance values when the selected lesson changes to resolve state bleed.
  useEffect(() => {
    setAttendance(Object.fromEntries(iscritti.map((s) => [s.id, "presente" as Stato])));
  }, [lessonId, iscritti]);

  const updateAttendance = (studentId: string, status: Stato) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const totali = useMemo(() => {
    const counts = { presente: 0, assente: 0, ritardo: 0 };
    iscritti.forEach((s) => {
      const state = attendance[s.id] || "presente";
      counts[state]++;
    });
    return counts;
  }, [iscritti, attendance]);

  const pct = useMemo(() => {
    return iscritti.length ? Math.round((totali.presente / iscritti.length) * 100) : 0;
  }, [iscritti.length, totali.presente]);

  return {
    lessonId,
    setLessonId,
    lesson,
    corso,
    iscritti,
    attendance,
    updateAttendance,
    totali,
    pct,
  };
}
