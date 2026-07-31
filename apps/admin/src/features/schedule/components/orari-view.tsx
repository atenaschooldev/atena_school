import { useMemo } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { EventManager, type CalEvent } from "@/components/ui/event-manager";
import { useSchedule } from "../hooks/use-schedule";
import type { Lesson } from "../types";

// ─── Color palette for courses ────────────────────────────────────────────────
const COURSE_COLORS = [
  { name: "Teal", value: "teal", bg: "bg-teal-500", text: "text-teal-700" },
  { name: "Blue", value: "blue", bg: "bg-blue-500", text: "text-blue-700" },
  { name: "Purple", value: "purple", bg: "bg-purple-500", text: "text-purple-700" },
  { name: "Orange", value: "orange", bg: "bg-orange-500", text: "text-orange-700" },
  { name: "Green", value: "green", bg: "bg-green-500", text: "text-green-700" },
  { name: "Pink", value: "pink", bg: "bg-pink-500", text: "text-pink-700" },
  { name: "Indigo", value: "indigo", bg: "bg-indigo-500", text: "text-indigo-700" },
  { name: "Red", value: "red", bg: "bg-red-500", text: "text-red-700" },
];

function hashColorIdx(corsoId: string): number {
  let h = 0;
  for (const ch of corsoId) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return h % COURSE_COLORS.length;
}

/**
 * Convert one Lesson record to one CalEvent.
 * lesson.data is the specific date of this occurrence (ISO string from start_date).
 * If data is missing, falls back to the nearest future matching giorno.
 */
function lessonToEvent(lesson: Lesson): CalEvent {
  // Use the lesson's specific date
  const baseDate = lesson.data ? new Date(lesson.data) : (() => {
    // Fallback: find next occurrence of giorno (0=Mon…5=Sat)
    const d = new Date();
    const targetJsDay = lesson.giorno + 1;
    while (d.getDay() !== targetJsDay) d.setDate(d.getDate() + 1);
    return d;
  })();

  const [startH, startM] = lesson.oraInizio.split(":").map(Number);
  const [endH, endM] = lesson.oraFine.split(":").map(Number);

  const startTime = new Date(baseDate);
  startTime.setHours(startH, startM, 0, 0);

  const endTime = new Date(baseDate);
  endTime.setHours(endH, endM, 0, 0);

  return {
    id: lesson.id,
    title: lesson.corsoName ?? "Corso",
    description: lesson.insegnanteName ? `Insegnante: ${lesson.insegnanteName}` : lesson.aula,
    startTime,
    endTime,
    color: COURSE_COLORS[hashColorIdx(lesson.corsoId)].value,
    category: lesson.aula,
    tags: lesson.isOnline ? ["Online"] : ["In presenza"],
  };
}

export function OrariView() {
  const { localLessons, handleDeleteLesson } = useSchedule();

  const calEvents = useMemo(() => localLessons.map(lessonToEvent), [localLessons]);

  const handleDelete = (eventId: string) => {
    handleDeleteLesson(eventId);
  };

  return (
    <div className="p-4 md:p-6">
      <EventManager
        events={calEvents}
        colors={COURSE_COLORS}
        categories={["Lezione", "Esame", "Laboratorio", "Altro"]}
        availableTags={["Online", "In presenza", "Importante"]}
        defaultView="week"
        createButtonLabel="Nuova Lezione"
        onEventDelete={handleDelete}
      />
    </div>
  );
}
