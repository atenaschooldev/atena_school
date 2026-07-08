import { useState, useEffect, useRef } from "react";
import { AppHeader } from "@/components/app-header";
import { lessons, courses, teachers, GIORNI } from "@/lib/mock-data";
import { levelColor, levelColorSolid } from "@/features/courses";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LessonForm } from "./lesson-form";
import type { Lesson, LessonFormValues } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  Pencil,
  Trash2,
  Copy,
  Video,
} from "lucide-react";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfMonth,
  isSameMonth,
} from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { useAppStore } from "@/stores/app-store";

const ORE = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

// Converts "HH:MM" time string to minutes from midnight
const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Computes column layout for overlapping lessons in the same day.
// Returns a Map from lesson id -> { columnIdx, totalColumns }.
// Algorithm: greedy lane assignment (like Google Calendar).
function computeOverlapLayout(
  dayLessons: Array<{ id: string; oraInizio: string; oraFine: string }>,
): Map<string, { columnIdx: number; totalColumns: number }> {
  const sorted = [...dayLessons].sort((a, b) => timeToMin(a.oraInizio) - timeToMin(b.oraInizio));

  // lanes[i] = end time (in minutes) of the last event assigned to lane i
  const lanes: number[] = [];
  const laneOf = new Map<string, number>();

  for (const lesson of sorted) {
    const start = timeToMin(lesson.oraInizio);
    const end = timeToMin(lesson.oraFine);

    // Find first lane whose last event has already ended
    let assigned = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i] <= start) {
        assigned = i;
        lanes[i] = end;
        break;
      }
    }
    if (assigned === -1) {
      assigned = lanes.length;
      lanes.push(end);
    }
    laneOf.set(lesson.id, assigned);
  }

  // For each lesson, totalColumns = (max lane index among all overlapping events) + 1
  const result = new Map<string, { columnIdx: number; totalColumns: number }>();
  for (const lesson of sorted) {
    const lStart = timeToMin(lesson.oraInizio);
    const lEnd = timeToMin(lesson.oraFine);
    const myLane = laneOf.get(lesson.id)!;

    let maxLane = myLane;
    for (const other of sorted) {
      if (other.id === lesson.id) continue;
      const oStart = timeToMin(other.oraInizio);
      const oEnd = timeToMin(other.oraFine);
      // Overlap if intervals intersect
      if (oStart < lEnd && oEnd > lStart) {
        maxLane = Math.max(maxLane, laneOf.get(other.id)!);
      }
    }

    result.set(lesson.id, { columnIdx: myLane, totalColumns: maxLane + 1 });
  }

  return result;
}

// Converts total minutes to "HH:MM" string
const minToTime = (totalMin: number): string => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function OrariView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localLessons, setLocalLessons] = useState(lessons);
  const [activeDragGiorno, setActiveDragGiorno] = useState<number | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragStartClickOffsetY, setDragStartClickOffsetY] = useState<number>(0);
  const [dragOverMinutes, setDragOverMinutes] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [resizing, setResizing] = useState<{
    lessonId: string;
    edge: "top" | "bottom";
    columnTop: number;
    columnHeight: number;
  } | null>(null);
  const tableSearch = useAppStore((s) => s.tableSearch);
  const columnRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // Tracks if the last interaction was a resize — used to suppress the popover click that follows mouseup
  const wasResizingRef = useRef(false);

  // Lesson creation state
  const [creatingLesson, setCreatingLesson] = useState<{
    giornoIdx: number;
    oraInizio: string;
    oraFine: string;
    anchorEl: Element | null;
  } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  // Stores time computed at right-click so ContextMenuItem onSelect can use it
  const contextMenuPendingRef = useRef<{
    giornoIdx: number;
    oraInizio: string;
    oraFine: string;
  } | null>(null);
  // Lesson editing state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  // Card right-click context menu
  const [cardContextMenu, setCardContextMenu] = useState<{
    lessonId: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Resize mouse tracking
  useEffect(() => {
    if (!resizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const { lessonId, edge, columnTop, columnHeight } = resizing;
      const offsetY = e.clientY - columnTop;
      const clampedY = Math.max(0, Math.min(columnHeight, offsetY));
      const hourFraction = (clampedY / columnHeight) * 12;
      const totalMinFromEight = Math.round(hourFraction * 60);
      const snappedMin = Math.round(totalMinFromEight / 30) * 30;
      const newAbsMin = 8 * 60 + snappedMin;

      setLocalLessons((prev) =>
        prev.map((l) => {
          if (l.id !== lessonId) return l;
          const startAbsMin = timeToMin(l.oraInizio);
          const endAbsMin = timeToMin(l.oraFine);
          if (edge === "top") {
            const clamped = Math.max(8 * 60, Math.min(endAbsMin - 30, newAbsMin));
            return { ...l, oraInizio: minToTime(clamped) };
          } else {
            const clamped = Math.min(20 * 60, Math.max(startAbsMin + 30, newAbsMin));
            return { ...l, oraFine: minToTime(clamped) };
          }
        }),
      );
    };

    const onMouseUp = () => setResizing(null);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing]);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const saturdayOfCurrentWeek = addDays(startOfCurrentWeek, 5);

  // Adaptive date label per view mode
  let dateRangeStr = "";
  if (viewMode === "day") {
    dateRangeStr = format(currentDate, "EEEE, d MMMM yyyy", { locale: it });
  } else if (viewMode === "week") {
    const sm = format(startOfCurrentWeek, "MMMM", { locale: it });
    const em = format(saturdayOfCurrentWeek, "MMMM", { locale: it });
    const sy = format(startOfCurrentWeek, "yyyy");
    const ey = format(saturdayOfCurrentWeek, "yyyy");
    if (sy !== ey) {
      dateRangeStr = `${format(startOfCurrentWeek, "d")} ${sm} ${sy} – ${format(saturdayOfCurrentWeek, "d")} ${em} ${ey}`;
    } else if (sm !== em) {
      dateRangeStr = `${format(startOfCurrentWeek, "d")} ${sm} – ${format(saturdayOfCurrentWeek, "d")} ${em} ${sy}`;
    } else {
      dateRangeStr = `${format(startOfCurrentWeek, "d")} – ${format(saturdayOfCurrentWeek, "d")} ${sm} ${sy}`;
    }
  } else {
    dateRangeStr = format(currentDate, "MMMM yyyy", { locale: it });
  }
  dateRangeStr = dateRangeStr.charAt(0).toUpperCase() + dateRangeStr.slice(1);

  const goPrev = () => {
    if (viewMode === "day") setCurrentDate((d) => subDays(d, 1));
    else if (viewMode === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };
  const goNext = () => {
    if (viewMode === "day") setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  const daysOfCurrentWeek = Array.from({ length: 6 }).map((_, i) => addDays(startOfCurrentWeek, i));

  // Day view: which column index in our week grid does currentDate map to?
  const dayGiornoIdx = (currentDate.getDay() + 6) % 7; // Mon=0 … Sat=5

  // Month view grid (6 weeks × 7 days, Mon-Sun, but we show Mon-Sat = 6 cols)
  const monthStart = startOfMonth(currentDate);
  const calGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calDays = Array.from({ length: 42 }).map((_, i) => addDays(calGridStart, i));
  const GIORNI_BREVI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const GIORNI_COMPLETI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

  // Find dragged lesson and calculate its duration
  const draggedLesson = localLessons.find((l) => l.id === draggedLessonId);
  let draggedDurationMinutes = 60; // Default 1 hour
  if (draggedLesson) {
    const [startH, startM] = draggedLesson.oraInizio.split(":").map(Number);
    const [endH, endM] = draggedLesson.oraFine.split(":").map(Number);
    draggedDurationMinutes = (endH - startH) * 60 + (endM - startM);
  }

  const handleDrop = (e: React.DragEvent, targetGiornoIdx: number) => {
    e.preventDefault();
    setActiveDragGiorno(null);
    setDraggedLessonId(null);
    setDragOverMinutes(null);
    const lessonId = e.dataTransfer.getData("text/plain");
    if (!lessonId) return;

    // Calculate vertical offset relative to the day column container, adjusting for mouse click offset inside card
    const rect = e.currentTarget.getBoundingClientRect();
    const adjustedOffsetY = e.clientY - rect.top - dragStartClickOffsetY;
    const clampedOffsetY = Math.max(0, Math.min(rect.height, adjustedOffsetY));

    // There are 12 hours from 08:00 to 20:00
    const hourFraction = (clampedOffsetY / rect.height) * 12;

    // Snap to nearest 30 minutes (0.5 hours)
    const totalMinutesFromEight = Math.round(hourFraction * 60);
    const snappedMinutesFromEight = Math.round(totalMinutesFromEight / 30) * 30;

    setLocalLessons((prev) =>
      prev.map((item) => {
        if (item.id !== lessonId) return item;

        // Extract original duration
        const [startH, startM] = item.oraInizio.split(":").map(Number);
        const [endH, endM] = item.oraFine.split(":").map(Number);
        const durationMinutes = (endH - startH) * 60 + (endM - startM);

        // Calculate new start/end times
        let newStartTotalMinutes = 8 * 60 + snappedMinutesFromEight;
        let newEndTotalMinutes = newStartTotalMinutes + durationMinutes;

        // Clamp within calendar hours: 08:00 to 20:00
        if (newEndTotalMinutes > 20 * 60) {
          newEndTotalMinutes = 20 * 60;
          newStartTotalMinutes = Math.max(8 * 60, newEndTotalMinutes - durationMinutes);
        }

        const finalStartH = Math.floor(newStartTotalMinutes / 60);
        const finalStartM = newStartTotalMinutes % 60;
        const finalEndH = Math.floor(newEndTotalMinutes / 60);
        const finalEndM = newEndTotalMinutes % 60;

        const pad = (n: number) => String(n).padStart(2, "0");
        const newOraInizio = `${pad(finalStartH)}:${pad(finalStartM)}`;
        const newOraFine = `${pad(finalEndH)}:${pad(finalEndM)}`;

        return {
          ...item,
          giorno: targetGiornoIdx,
          oraInizio: newOraInizio,
          oraFine: newOraFine,
        };
      }),
    );

    const affectedLesson = localLessons.find((item) => item.id === lessonId);
    const affectedCourse = courses.find((x) => x.id === affectedLesson?.corsoId);
    const giornoName = GIORNI[targetGiornoIdx];
    toast.success(
      `Lezione ${affectedCourse ? `di "${affectedCourse.nome}"` : ""} spostata a ${giornoName}!`,
    );
  };

  const handleCreateLesson = (values: LessonFormValues) => {
    const newLesson: Lesson = { ...values, id: `l-${Date.now()}` };
    setLocalLessons((prev) => [...prev, newLesson]);
    setCreatingLesson(null);
    setShowCreateDialog(false);
    const corso = courses.find((c) => c.id === values.corsoId);
    toast.success(`Lezione "${corso?.nome ?? ""}" creata con successo!`);
  };

  const handleDeleteLesson = (lessonId: string) => {
    const lesson = localLessons.find((l) => l.id === lessonId);
    const corso = courses.find((c) => c.id === lesson?.corsoId);
    setLocalLessons((prev) => prev.filter((l) => l.id !== lessonId));
    toast.success(`Lezione "${corso?.nome ?? ""}" eliminata.`);
  };

  const handleSaveEdit = (values: LessonFormValues) => {
    if (!editingLesson) return;
    setLocalLessons((prev) =>
      prev.map((l) => (l.id === editingLesson.id ? { ...values, id: l.id } : l)),
    );
    setEditingLesson(null);
    const corso = courses.find((c) => c.id === values.corsoId);
    toast.success(`Lezione "${corso?.nome ?? ""}" aggiornata!`);
  };

  // Reusable day column body (used by both Week and Day views)
  const renderDayColumn = (giornoIdx: number, colKey: string | number) => {
    const currentH = currentTime.getHours();
    const currentM = currentTime.getMinutes();
    const day = daysOfCurrentWeek[giornoIdx];
    const isToday = day ? format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false;
    const isWithinTimeRange = currentH >= 8 && currentH < 20;
    const timeLineTopPercent = isWithinTimeRange
      ? (((currentH - 8) * 60 + currentM) / (12 * 60)) * 100
      : 0;

    const handleColumnMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only create if the click reached the column background (not a card/handle)
      if ((e.target as HTMLElement) !== e.currentTarget) return;
      if (draggedLessonId || resizing) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const snappedMin = Math.round(Math.round((offsetY / rect.height) * 12 * 60) / 30) * 30;
      const startAbsMin = 8 * 60 + Math.min(snappedMin, 11 * 60); // cap at 19:00 so end fits
      const endAbsMin = Math.min(startAbsMin + 90, 20 * 60);
      setCreatingLesson({
        giornoIdx,
        oraInizio: minToTime(startAbsMin),
        oraFine: minToTime(endAbsMin),
        anchorEl: e.currentTarget,
      });
    };

    // Called by onContextMenu on the column div — captures time into ref BEFORE ContextMenu opens
    const handleColumnContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const snappedMin = Math.round(Math.round((offsetY / rect.height) * 12 * 60) / 30) * 30;
      const startAbsMin = 8 * 60 + Math.min(snappedMin, 11 * 60);
      const endAbsMin = Math.min(startAbsMin + 90, 20 * 60);
      contextMenuPendingRef.current = {
        giornoIdx,
        oraInizio: minToTime(startAbsMin),
        oraFine: minToTime(endAbsMin),
      };
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            key={colKey}
            ref={(el) => {
              if (el) columnRefs.current.set(giornoIdx, el);
              else columnRefs.current.delete(giornoIdx);
            }}
            className={`border-l relative flex flex-col h-full transition-colors duration-200
              ${activeDragGiorno === giornoIdx ? "bg-primary/[0.04] dark:bg-primary/[0.08]" : "bg-background/50"}
              ${creatingLesson?.giornoIdx === giornoIdx ? "bg-primary/[0.02]" : ""}`}
            onMouseDown={handleColumnMouseDown}
            onContextMenu={handleColumnContextMenu}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              const rect = e.currentTarget.getBoundingClientRect();
              const adjustedOffsetY = e.clientY - rect.top - dragStartClickOffsetY;
              const clampedOffsetY = Math.max(0, Math.min(rect.height, adjustedOffsetY));
              const snappedMin =
                Math.round(Math.round((clampedOffsetY / rect.height) * 12 * 60) / 30) * 30;
              setDragOverMinutes(snappedMin);
              setActiveDragGiorno(giornoIdx);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setActiveDragGiorno(giornoIdx);
            }}
            onDragLeave={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
              ) {
                setActiveDragGiorno(null);
                setDragOverMinutes(null);
              }
            }}
            onDrop={(e) => handleDrop(e, giornoIdx)}
          >
            {isToday && isWithinTimeRange && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                style={{ top: `${timeLineTopPercent}%` }}
              >
                <div className="h-2 w-2 rounded-full bg-red-500 -ml-1 shadow-sm shrink-0" />
              </div>
            )}
            {draggedLessonId !== null &&
              activeDragGiorno === giornoIdx &&
              dragOverMinutes !== null &&
              (() => {
                let startMin = dragOverMinutes;
                let endMin = dragOverMinutes + draggedDurationMinutes;
                if (endMin > 12 * 60) {
                  endMin = 12 * 60;
                  startMin = Math.max(0, endMin - draggedDurationMinutes);
                }
                const fmtMin = (m: number) => {
                  const t = 8 * 60 + m;
                  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
                };
                return (
                  <div
                    className="absolute rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 pointer-events-none z-10 flex flex-col items-center justify-center text-[10px] font-bold text-primary animate-pulse shadow-sm"
                    style={{
                      top: `${(startMin / (12 * 60)) * 100}%`,
                      height: `calc(${((endMin - startMin) / (12 * 60)) * 100}% - 4px)`,
                      left: "4px",
                      right: "4px",
                    }}
                  >
                    <span className="opacity-90">Sposta qui</span>
                    <span className="text-[9px] opacity-75 font-semibold mt-0.5">
                      {fmtMin(startMin)} - {fmtMin(endMin)}
                    </span>
                  </div>
                );
              })()}
            {ORE.map((o) => {
              const isHalfHour = o.endsWith(":30");
              return (
                <div
                  key={o}
                  className={`flex-1 border-b last:border-b-0
                ${isHalfHour ? "border-dashed border-border/20" : "border-border/40"}`}
                />
              );
            })}
            {(() => {
              const dayLessons = localLessons.filter((l) => l.giorno === giornoIdx);
              const overlapLayout = computeOverlapLayout(dayLessons);
              return dayLessons.map((l) => {
                const layout = overlapLayout.get(l.id) ?? { columnIdx: 0, totalColumns: 1 };
                const colW = 100 / layout.totalColumns;
                const leftPct = layout.columnIdx * colW;
                const rightPct = 100 - leftPct - colW;
                const c = courses.find((x) => x.id === l.corsoId)!;
                const t = teachers.find((x) => x.id === c.insegnanteId);
                const startH = parseInt(l.oraInizio.split(":")[0]);
                const startM = parseInt(l.oraInizio.split(":")[1]);
                const endH = parseInt(l.oraFine.split(":")[0]);
                const endM = parseInt(l.oraFine.split(":")[1]);
                const topPercentage = ((startH - 8 + startM / 60) / 12) * 100;
                const heightPercentage = ((endH - startH + (endM - startM) / 60) / 12) * 100;

                // Search matching
                const q = tableSearch.toLowerCase().trim();
                const matches = q
                  ? [c.nome, c.livello, l.aula, t ? `${t.nome} ${t.cognome}` : ""].some((s) =>
                      s.toLowerCase().includes(q),
                    )
                  : true;
                const hasSearch = q.length > 0;

                return (
                  <Popover key={l.id}>
                    <PopoverTrigger asChild>
                      <button
                        draggable={!resizing}
                        onClick={(e) => {
                          if (wasResizingRef.current) {
                            e.preventDefault();
                            e.stopPropagation();
                            wasResizingRef.current = false;
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCardContextMenu({ lessonId: l.id, x: e.clientX, y: e.clientY });
                        }}
                        onDragStart={(e) => {
                          if (resizing) {
                            e.preventDefault();
                            return;
                          }
                          setDraggedLessonId(l.id);
                          const cardRect = e.currentTarget.getBoundingClientRect();
                          setDragStartClickOffsetY(e.clientY - cardRect.top);
                          e.dataTransfer.setData("text/plain", l.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggedLessonId(null);
                          setActiveDragGiorno(null);
                          setDragOverMinutes(null);
                        }}
                        className={`absolute rounded-lg border p-2 pb-3 pt-3 text-left overflow-hidden transition-[transform,opacity,shadow,background-color,border-color] duration-155
                      ${resizing?.lessonId === l.id ? "cursor-ns-resize" : "cursor-grab active:cursor-grabbing"}
                      flex flex-col justify-between
                      ${
                        hasSearch
                          ? matches
                            ? `${levelColorSolid(c.livello)} hover:shadow-lg scale-[1.01] z-10`
                            : "bg-muted/30 border-border/20 text-muted-foreground/30 opacity-40"
                          : `${levelColor(c.livello)} hover:shadow-md`
                      }
                      ${draggedLessonId === l.id ? "opacity-30 scale-95" : ""}`}
                        style={{
                          top: `${topPercentage}%`,
                          height: `calc(${heightPercentage}% - 4px)`,
                          left: `calc(${leftPct}% + 4px)`,
                          right: `calc(${rightPct}% + 4px)`,
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-2.5 cursor-n-resize z-20 flex items-center justify-center group/handle"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            wasResizingRef.current = true;
                            const colEl = columnRefs.current.get(giornoIdx);
                            if (!colEl) return;
                            const rect = colEl.getBoundingClientRect();
                            setResizing({
                              lessonId: l.id,
                              edge: "top",
                              columnTop: rect.top,
                              columnHeight: rect.height,
                            });
                          }}
                        >
                          <div className="w-6 h-0.5 rounded-full bg-current opacity-0 group-hover/handle:opacity-40 transition-opacity" />
                        </div>
                        <div className="flex flex-col h-full justify-between w-full">
                          <div>
                            <div className="text-[10px] font-bold opacity-85 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                {c.livello}
                                {l.isOnline && (
                                  <Video className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                )}
                              </span>
                              <span>
                                {l.oraInizio} - {l.oraFine}
                              </span>
                            </div>
                            <div className="text-xs font-bold truncate mt-1 leading-tight">
                              {c.nome}
                            </div>
                          </div>
                          <div className="text-[10px] opacity-75 flex items-center justify-between mt-1">
                            <span className="truncate max-w-[60%]">
                              {t ? `${t.nome[0]}. ${t.cognome}` : ""}
                            </span>
                            <span className="shrink-0 flex items-center gap-0.5">
                              {l.isOnline ? (
                                <>
                                  <Video className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                  <span>{l.aula}</span>
                                </>
                              ) : (
                                <>
                                  <span>📍 {l.aula}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div
                          className="absolute bottom-0 left-0 right-0 h-2.5 cursor-s-resize z-20 flex items-center justify-center group/handle-b"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            wasResizingRef.current = true;
                            const colEl = columnRefs.current.get(giornoIdx);
                            if (!colEl) return;
                            const rect = colEl.getBoundingClientRect();
                            setResizing({
                              lessonId: l.id,
                              edge: "bottom",
                              columnTop: rect.top,
                              columnHeight: rect.height,
                            });
                          }}
                        >
                          <div className="w-6 h-0.5 rounded-full bg-current opacity-0 group-hover/handle-b:opacity-40 transition-opacity" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-xl border border-border shadow-lg bg-popover text-popover-foreground">
                      <Badge variant="outline" className={`text-[11px] ${levelColor(c.livello)}`}>
                        {c.livello}
                      </Badge>
                      <h4 className="font-semibold mt-2">{c.nome}</h4>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div>
                          ⏰ {l.oraInizio} – {l.oraFine}
                        </div>
                        <div>📍 {l.aula}</div>
                        {t && (
                          <div>
                            👤 {t.nome} {t.cognome}
                          </div>
                        )}
                        {l.isOnline && l.meetLink && (
                          <div className="flex items-center justify-between gap-2 mt-2 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-xs shrink-0">🔗</span>
                              <span className="font-mono text-[10px] truncate">{l.meetLink}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                navigator.clipboard.writeText(l.meetLink!);
                                toast.success("Link copiato negli appunti!");
                              }}
                              title="Copia link"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              });
            })()}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => {
              // Read the position captured by onContextMenu before the menu opened
              const pending = contextMenuPendingRef.current;
              setCreatingLesson({
                giornoIdx: pending?.giornoIdx ?? giornoIdx,
                oraInizio: pending?.oraInizio ?? "09:00",
                oraFine: pending?.oraFine ?? "10:30",
                anchorEl: null,
              });
              contextMenuPendingRef.current = null;
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Crea lezione qui
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const VIEW_LABELS = [
    { key: "day" as const, label: "Giorno" },
    { key: "week" as const, label: "Settimana" },
    { key: "month" as const, label: "Mese" },
  ];

  return (
    <>
      <AppHeader
        searchPlaceholder="Cerca lezioni..."
        onNew={() => setShowCreateDialog(true)}
        newLabel="Lezione"
      />
      <main className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
        <div className="rounded-xl border bg-card overflow-hidden flex-1 flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.02)] min-h-0">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 shrink-0">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted/80 active:scale-95 transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={goPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-xs font-bold hover:bg-muted/80 active:scale-95 transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setCurrentDate(new Date())}
              >
                Oggi
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted/80 active:scale-95 transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={goNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Date label */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary/80" />
              <span className="text-sm font-bold text-foreground tracking-wide">
                {dateRangeStr}
              </span>
            </div>

            {/* Right side: view switcher only */}
            <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5">
              {VIEW_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer
                    ${viewMode === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Mini-popover: created from column click ─────── */}
          {creatingLesson && (
            <div
              className="fixed inset-0 z-50"
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                if (
                  target.closest("[data-create-popover]") ||
                  target.closest("[data-radix-popper-content-wrapper]") ||
                  target.closest("[role='listbox']")
                ) {
                  return;
                }
                setCreatingLesson(null);
              }}
            >
              <div
                data-create-popover=""
                className="absolute z-50 w-full max-w-lg rounded-xl border bg-popover shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nuova Lezione
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                    {GIORNI[creatingLesson.giornoIdx]} · {creatingLesson.oraInizio}–
                    {creatingLesson.oraFine}
                  </span>
                </div>
                <LessonForm
                  defaultValues={{
                    giorno: creatingLesson.giornoIdx,
                    oraInizio: creatingLesson.oraInizio,
                    oraFine: creatingLesson.oraFine,
                  }}
                  onSubmit={handleCreateLesson}
                  onCancel={() => setCreatingLesson(null)}
                />
              </div>
            </div>
          )}

          {/* ── Dialog: created from + button ─────────────── */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="sm:max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Nuova Lezione
                </DialogTitle>
              </DialogHeader>
              <LessonForm
                defaultValues={{
                  giorno: viewMode === "day" ? dayGiornoIdx : 0,
                  oraInizio: "09:00",
                  oraFine: "10:30",
                }}
                onSubmit={handleCreateLesson}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>

          {/* ── Edit Lesson Dialog ─────────────────────────── */}
          <Dialog
            open={!!editingLesson}
            onOpenChange={(open) => {
              if (!open) setEditingLesson(null);
            }}
          >
            <DialogContent className="sm:max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Pencil className="h-4 w-4 text-primary" />
                  Modifica Lezione
                </DialogTitle>
              </DialogHeader>
              {editingLesson && (
                <LessonForm
                  key={editingLesson.id}
                  defaultValues={{
                    corsoId: editingLesson.corsoId,
                    insegnanteId: editingLesson.insegnanteId,
                    giorno: editingLesson.giorno,
                    data: editingLesson.data,
                    oraInizio: editingLesson.oraInizio,
                    oraFine: editingLesson.oraFine,
                    aula: editingLesson.aula,
                    isOnline: editingLesson.isOnline,
                    meetLink: editingLesson.meetLink,
                  }}
                  onSubmit={handleSaveEdit}
                  onCancel={() => setEditingLesson(null)}
                  submitLabel="✓ Salva modifiche"
                />
              )}
            </DialogContent>
          </Dialog>

          {/* ── WEEK VIEW ─────────────────────────────────────── */}
          {viewMode === "week" && (
            <>
              <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b bg-muted/20 items-center shrink-0">
                <div className="p-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 text-center">
                  Ora / Giorno
                </div>
                {daysOfCurrentWeek.map((day, idx) => {
                  const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  return (
                    <div
                      key={idx}
                      className={`p-1.5 text-center text-xs font-semibold uppercase tracking-wider border-l flex flex-col gap-0.5 items-center justify-center ${isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}
                    >
                      <span>{GIORNI_COMPLETI[idx]}</span>
                      <span
                        className={`text-sm font-bold mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${isToday ? "bg-primary text-white shadow-sm" : "text-foreground"}`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-[80px_repeat(6,1fr)] flex-1 min-h-0">
                <div className="flex flex-col h-full relative bg-muted/5">
                  {ORE.map((o) => {
                    const isHalfHour = o.endsWith(":30");
                    return (
                      <div
                        key={o}
                        className={`flex-1 border-b relative border-r last:border-b-0 ${isHalfHour ? "border-dashed border-border/20" : "border-border/40"}`}
                      >
                        <span
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 bg-background dark:bg-muted/30 px-1.5 py-0.5 tabular-nums border rounded shadow-sm z-10 transition-all duration-150
                          ${
                            isHalfHour
                              ? "text-[7.5px] font-medium text-muted-foreground/60 border-border/10 scale-90"
                              : "text-[9px] font-bold text-muted-foreground/90 border-border/25"
                          }`}
                        >
                          {o}
                        </span>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-background dark:bg-muted/30 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground/90 tabular-nums border border-border/25 rounded shadow-sm z-10">
                    20:00
                  </div>
                </div>
                {GIORNI.map((_, idx) => renderDayColumn(idx, idx))}
              </div>
            </>
          )}

          {/* ── DAY VIEW ──────────────────────────────────────── */}
          {viewMode === "day" &&
            (() => {
              const isToday =
                format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <>
                  <div className="grid grid-cols-[80px_1fr] border-b bg-muted/20 items-stretch shrink-0">
                    <div
                      className={`p-2 text-[9px] font-bold uppercase tracking-wider text-center flex items-center justify-center
                      ${isToday ? "bg-primary/5 text-primary" : "text-muted-foreground/80"}`}
                    >
                      Ora
                    </div>
                    <div
                      className={`p-1.5 text-center text-xs font-semibold uppercase tracking-wider border-l flex flex-col gap-0.5 items-center justify-center ${isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}
                    >
                      <span>{GIORNI_COMPLETI[dayGiornoIdx]}</span>
                      <span
                        className={`text-sm font-bold mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${isToday ? "bg-primary text-white shadow-sm" : "text-foreground"}`}
                      >
                        {format(currentDate, "d")}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] flex-1 min-h-0">
                    <div className="flex flex-col h-full relative bg-muted/5">
                      {ORE.map((o) => {
                        const isHalfHour = o.endsWith(":30");
                        return (
                          <div
                            key={o}
                            className={`flex-1 border-b relative border-r last:border-b-0 ${isHalfHour ? "border-dashed border-border/20" : "border-border/40"}`}
                          >
                            <span
                              className={`absolute -top-2 left-1/2 -translate-x-1/2 bg-background dark:bg-muted/30 px-1.5 py-0.5 tabular-nums border rounded shadow-sm z-10 transition-all duration-150
                          ${
                            isHalfHour
                              ? "text-[7.5px] font-medium text-muted-foreground/60 border-border/10 scale-90"
                              : "text-[9px] font-bold text-muted-foreground/90 border-border/25"
                          }`}
                            >
                              {o}
                            </span>
                          </div>
                        );
                      })}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-background dark:bg-muted/30 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground/90 tabular-nums border border-border/25 rounded shadow-sm z-10">
                        20:00
                      </div>
                    </div>
                    {renderDayColumn(dayGiornoIdx, "day-col")}
                  </div>
                </>
              );
            })()}

          {/* ── MONTH VIEW ────────────────────────────────────── */}
          {viewMode === "month" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b bg-muted/20 shrink-0">
                {GIORNI_BREVI.map((d) => (
                  <div
                    key={d}
                    className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-l first:border-l-0"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* 6-week grid */}
              <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0">
                {calDays.map((day, i) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const todayStr = format(new Date(), "yyyy-MM-dd");
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = dayStr === todayStr;
                  const dowIdx = (day.getDay() + 6) % 7; // Mon=0, Sun=6
                  // Only Mon–Sat have lessons (GIORNI has 6 entries)
                  const dayLessons =
                    dowIdx < 6 ? localLessons.filter((l) => l.giorno === dowIdx) : [];

                  return (
                    <div
                      key={i}
                      className={`border-b border-r last:border-r-0 p-1 flex flex-col overflow-hidden min-h-0 cursor-pointer hover:bg-muted/30 transition-colors
                        ${!isCurrentMonth ? "opacity-40" : ""}
                        ${isToday ? "bg-primary/[0.03]" : ""}`}
                      onClick={() => {
                        setCurrentDate(day);
                        setViewMode("day");
                      }}
                    >
                      <span
                        className={`text-xs font-bold self-start h-5 w-5 flex items-center justify-center rounded-full mb-0.5 shrink-0
                        ${isToday ? "bg-primary text-white" : "text-muted-foreground"}`}
                      >
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-h-0">
                        {dayLessons.slice(0, 3).map((l) => {
                          const c = courses.find((x) => x.id === l.corsoId);
                          if (!c) return null;
                          const t = teachers.find((x) => x.id === c.insegnanteId);
                          const q = tableSearch.toLowerCase().trim();
                          const matches = q
                            ? [c.nome, c.livello, l.aula, t ? `${t.nome} ${t.cognome}` : ""].some(
                                (s) => s.toLowerCase().includes(q),
                              )
                            : true;
                          const hasSearch = q.length > 0;

                          return (
                            <div
                              key={l.id}
                              className={`text-[9px] font-semibold truncate px-1 py-0.5 rounded leading-tight transition-all duration-150
                                ${
                                  hasSearch
                                    ? matches
                                      ? `${levelColorSolid(c.livello)} shadow-sm z-10`
                                      : "bg-muted/30 text-muted-foreground/30 border-transparent opacity-40"
                                    : levelColor(c.livello)
                                }`}
                            >
                              {l.oraInizio} {c.nome}
                            </div>
                          );
                        })}
                        {dayLessons.length > 3 && (
                          <div className="text-[9px] text-muted-foreground font-semibold px-1">
                            +{dayLessons.length - 3} altri
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Card right-click context menu ─────────────── */}
      {cardContextMenu && (
        <div className="fixed inset-0 z-[100]" onMouseDown={() => setCardContextMenu(null)}>
          <div
            className="absolute rounded-lg border bg-popover shadow-xl py-1 w-44 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: cardContextMenu.y, left: cardContextMenu.x }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              onClick={() => {
                const lesson = localLessons.find((l) => l.id === cardContextMenu.lessonId);
                if (lesson) setEditingLesson(lesson);
                setCardContextMenu(null);
              }}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              Modifica lezione
            </button>
            <div className="my-1 border-t border-border/40" />
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              onClick={() => {
                handleDeleteLesson(cardContextMenu.lessonId);
                setCardContextMenu(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              Elimina lezione
            </button>
          </div>
        </div>
      )}
    </>
  );
}
