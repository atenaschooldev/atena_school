import { useState, useEffect, useRef, useMemo } from "react";
import { lessons, courses } from "@/lib/mock-data";
import { GIORNI } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import type { Lesson, LessonFormValues } from "../types";
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

// Converts "HH:MM" time string to minutes from midnight
const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Converts total minutes to "HH:MM" string
const minToTime = (totalMin: number): string => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function useSchedule() {
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

  const startOfCurrentWeek = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate],
  );
  const saturdayOfCurrentWeek = useMemo(() => addDays(startOfCurrentWeek, 5), [startOfCurrentWeek]);

  // Adaptive date label per view mode
  const dateRangeStr = useMemo(() => {
    let rangeStr = "";
    if (viewMode === "day") {
      rangeStr = format(currentDate, "EEEE, d MMMM yyyy", { locale: it });
    } else if (viewMode === "week") {
      const sm = format(startOfCurrentWeek, "MMMM", { locale: it });
      const em = format(saturdayOfCurrentWeek, "MMMM", { locale: it });
      const sy = format(startOfCurrentWeek, "yyyy");
      const ey = format(saturdayOfCurrentWeek, "yyyy");
      if (sy !== ey) {
        rangeStr = `${format(startOfCurrentWeek, "d")} ${sm} ${sy} – ${format(saturdayOfCurrentWeek, "d")} ${em} ${ey}`;
      } else if (sm !== em) {
        rangeStr = `${format(startOfCurrentWeek, "d")} ${sm} – ${format(saturdayOfCurrentWeek, "d")} ${em} ${sy}`;
      } else {
        rangeStr = `${format(startOfCurrentWeek, "d")} – ${format(saturdayOfCurrentWeek, "d")} ${sm} ${sy}`;
      }
    } else {
      rangeStr = format(currentDate, "MMMM yyyy", { locale: it });
    }
    return rangeStr.charAt(0).toUpperCase() + rangeStr.slice(1);
  }, [currentDate, viewMode, startOfCurrentWeek, saturdayOfCurrentWeek]);

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

  const daysOfCurrentWeek = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);

  // Day view: which column index in our week grid does currentDate map to?
  const dayGiornoIdx = useMemo(() => {
    return (currentDate.getDay() + 6) % 7; // Mon=0 … Sat=5
  }, [currentDate]);

  // Month view grid (6 weeks × 7 days, Mon-Sun, but we show Mon-Sat = 6 cols)
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const calGridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const calDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => addDays(calGridStart, i));
  }, [calGridStart]);

  // Find dragged lesson and calculate its duration
  const draggedLesson = useMemo(() => {
    return localLessons.find((l) => l.id === draggedLessonId);
  }, [localLessons, draggedLessonId]);

  const draggedDurationMinutes = useMemo(() => {
    if (!draggedLesson) return 60; // Default 1 hour
    const [startH, startM] = draggedLesson.oraInizio.split(":").map(Number);
    const [endH, endM] = draggedLesson.oraFine.split(":").map(Number);
    return (endH - startH) * 60 + (endM - startM);
  }, [draggedLesson]);

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

  return {
    currentDate,
    setCurrentDate,
    localLessons,
    setLocalLessons,
    activeDragGiorno,
    setActiveDragGiorno,
    draggedLessonId,
    setDraggedLessonId,
    dragStartClickOffsetY,
    setDragStartClickOffsetY,
    dragOverMinutes,
    setDragOverMinutes,
    currentTime,
    viewMode,
    setViewMode,
    resizing,
    setResizing,
    tableSearch,
    columnRefs,
    wasResizingRef,
    creatingLesson,
    setCreatingLesson,
    showCreateDialog,
    setShowCreateDialog,
    contextMenuPendingRef,
    editingLesson,
    setEditingLesson,
    cardContextMenu,
    setCardContextMenu,
    daysOfCurrentWeek,
    dayGiornoIdx,
    monthStart,
    calGridStart,
    calDays,
    draggedLesson,
    draggedDurationMinutes,
    dateRangeStr,
    goPrev,
    goNext,
    handleDrop,
    handleCreateLesson,
    handleDeleteLesson,
    handleSaveEdit,
    minToTime,
  };
}
