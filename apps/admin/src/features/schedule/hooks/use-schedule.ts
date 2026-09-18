import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GIORNI } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import type { Lesson, LessonFormValues, ScheduleApiResponse } from "../types";
import { mapApiToLesson, mapLessonToApiPayload } from "../types";
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
} from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minToTime = (totalMin: number): string => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function useSchedule() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
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
  const wasResizingRef = useRef(false);
  const [creatingLesson, setCreatingLesson] = useState<{
    giornoIdx: number;
    oraInizio: string;
    oraFine: string;
    anchorEl: Element | null;
  } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const contextMenuPendingRef = useRef<{
    giornoIdx: number;
    oraInizio: string;
    oraFine: string;
  } | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [cardContextMenu, setCardContextMenu] = useState<{
    lessonId: string;
    x: number;
    y: number;
  } | null>(null);

  // TanStack React Query for schedule/lessons data
  const { data: fetchedLessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const data = await apiFetch<ScheduleApiResponse[]>("/admin/schedules");
      return Array.isArray(data) ? data.map(mapApiToLesson) : [];
    },
    staleTime: 1000 * 30, // 30s stale time for instant 0ms cached render
  });

  // Local state for optimistic updates during drag/resize
  const [localLessonsState, setLocalLessonsState] = useState<Lesson[]>([]);

  useEffect(() => {
    setLocalLessonsState(fetchedLessons);
  }, [fetchedLessons]);

  const localLessons = localLessonsState;
  const setLocalLessons = setLocalLessonsState;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

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

      setLocalLessonsState((prev) =>
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

  const dayGiornoIdx = useMemo(() => {
    return (currentDate.getDay() + 6) % 7;
  }, [currentDate]);

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const calGridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const calDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => addDays(calGridStart, i));
  }, [calGridStart]);

  const draggedLesson = useMemo(() => {
    return localLessons.find((l) => l.id === draggedLessonId);
  }, [localLessons, draggedLessonId]);

  const draggedDurationMinutes = useMemo(() => {
    if (!draggedLesson) return 60;
    const [startH, startM] = draggedLesson.oraInizio.split(":").map(Number);
    const [endH, endM] = draggedLesson.oraFine.split(":").map(Number);
    return (endH - startH) * 60 + (endM - startM);
  }, [draggedLesson]);

  const createMutation = useMutation({
    mutationFn: async (values: LessonFormValues) => {
      const payload = mapLessonToApiPayload(values);
      return apiFetch<ScheduleApiResponse>("/admin/schedules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Lezione creata con successo!");
      setCreatingLesson(null);
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (e) => {
      console.error("Failed to create lesson:", e);
      toast.error("Errore nella creazione della lezione");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return apiFetch(`/admin/schedules/${lessonId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Lezione eliminata.");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (e) => {
      console.error("Failed to delete lesson:", e);
      toast.error("Errore nell'eliminazione della lezione");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: LessonFormValues }) => {
      const payload = mapLessonToApiPayload(values);
      return apiFetch<ScheduleApiResponse>(`/admin/schedules/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Lezione aggiornata!");
      setEditingLesson(null);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (e) => {
      console.error("Failed to update lesson:", e);
      toast.error("Errore nell'aggiornamento della lezione");
    },
  });

  const handleDrop = (e: React.DragEvent, targetGiornoIdx: number) => {
    e.preventDefault();
    setActiveDragGiorno(null);
    setDraggedLessonId(null);
    setDragOverMinutes(null);
    const lessonId = e.dataTransfer.getData("text/plain");
    if (!lessonId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const adjustedOffsetY = e.clientY - rect.top - dragStartClickOffsetY;
    const clampedOffsetY = Math.max(0, Math.min(rect.height, adjustedOffsetY));
    const hourFraction = (clampedOffsetY / rect.height) * 12;
    const totalMinutesFromEight = Math.round(hourFraction * 60);
    const snappedMinutesFromEight = Math.round(totalMinutesFromEight / 30) * 30;

    setLocalLessonsState((prev) =>
      prev.map((item) => {
        if (item.id !== lessonId) return item;
        const [startH, startM] = item.oraInizio.split(":").map(Number);
        const [endH, endM] = item.oraFine.split(":").map(Number);
        const durationMinutes = (endH - startH) * 60 + (endM - startM);
        let newStartTotalMinutes = 8 * 60 + snappedMinutesFromEight;
        let newEndTotalMinutes = newStartTotalMinutes + durationMinutes;
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

    const giornoName = GIORNI[targetGiornoIdx];
    toast.success(`Lezione spostata a ${giornoName}!`);
  };

  const handleCreateLesson = async (values: LessonFormValues) => {
    await createMutation.mutateAsync(values);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await deleteMutation.mutateAsync(lessonId);
  };

  const handleSaveEdit = async (values: LessonFormValues) => {
    if (!editingLesson) return;
    await updateMutation.mutateAsync({ id: editingLesson.id, values });
  };

  return {
    currentDate,
    setCurrentDate,
    localLessons,
    setLocalLessons,
    loading: isLoading,
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
