import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { courses, teachers } from "@/lib/mock-data";
import { GIORNI } from "@/lib/utils";
import { levelColor, levelColorSolid } from "@/features/courses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LessonForm } from "./lesson-form";
import type { Course } from "@/features/courses";
import type { Lesson } from "../types";
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles, Pencil, Trash2 } from "lucide-react";
import { format, isSameMonth } from "date-fns";
import { it } from "date-fns/locale";
import { useSchedule } from "../hooks/use-schedule";
import { CalendarLessonCard } from "./calendar-lesson-card";

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

const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function computeOverlapLayout(
  dayLessons: Array<{ id: string; oraInizio: string; oraFine: string }>,
): Map<string, { columnIdx: number; totalColumns: number }> {
  const sorted = [...dayLessons].sort((a, b) => timeToMin(a.oraInizio) - timeToMin(b.oraInizio));
  const lanes: number[] = [];
  const laneOf = new Map<string, number>();

  for (const lesson of sorted) {
    const start = timeToMin(lesson.oraInizio);
    const end = timeToMin(lesson.oraFine);

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
      if (oStart < lEnd && oEnd > lStart) {
        maxLane = Math.max(maxLane, laneOf.get(other.id)!);
      }
    }

    result.set(lesson.id, { columnIdx: myLane, totalColumns: maxLane + 1 });
  }

  return result;
}

export function OrariView() {
  const {
    currentDate,
    setCurrentDate,
    localLessons,
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
    calDays,
    draggedDurationMinutes,
    dateRangeStr,
    goPrev,
    goNext,
    handleDrop,
    handleCreateLesson,
    handleDeleteLesson,
    handleSaveEdit,
    minToTime,
  } = useSchedule();

  const GIORNI_BREVI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const GIORNI_COMPLETI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

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
      if ((e.target as HTMLElement) !== e.currentTarget) return;
      if (draggedLessonId || resizing) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const snappedMin = Math.round(Math.round((offsetY / rect.height) * 12 * 60) / 30) * 30;
      const startAbsMin = 8 * 60 + Math.min(snappedMin, 11 * 60);
      const endAbsMin = Math.min(startAbsMin + 90, 20 * 60);
      setCreatingLesson({
        giornoIdx,
        oraInizio: minToTime(startAbsMin),
        oraFine: minToTime(endAbsMin),
        anchorEl: e.currentTarget,
      });
    };

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
                const lStartH = parseInt(l.oraInizio.split(":")[0]);
                const lStartM = parseInt(l.oraInizio.split(":")[1]);
                const lEndH = parseInt(l.oraFine.split(":")[0]);
                const lEndM = parseInt(l.oraFine.split(":")[1]);
                const topPercentage = ((lStartH - 8 + lStartM / 60) / 12) * 100;
                const heightPercentage = ((lEndH - lStartH + (lEndM - lStartM) / 60) / 12) * 100;

                const q = tableSearch.toLowerCase().trim();
                const matches = q
                  ? [c.nome, c.livello, l.aula, t ? `${t.nome} ${t.cognome}` : ""].some((s) =>
                      s.toLowerCase().includes(q),
                    )
                  : true;
                const hasSearch = q.length > 0;

                return (
                  <CalendarLessonCard
                    key={l.id}
                    lesson={l}
                    course={c}
                    teacher={t}
                    isResizingActive={resizing?.lessonId === l.id}
                    isDragged={draggedLessonId === l.id}
                    matchesSearch={matches}
                    hasSearch={hasSearch}
                    topPercentage={topPercentage}
                    heightPercentage={heightPercentage}
                    leftPct={leftPct}
                    rightPct={rightPct}
                    giornoIdx={giornoIdx}
                    columnRefs={columnRefs}
                    wasResizingRef={wasResizingRef}
                    setResizing={setResizing}
                    setDraggedLessonId={setDraggedLessonId}
                    setDragStartClickOffsetY={setDragStartClickOffsetY}
                    setActiveDragGiorno={setActiveDragGiorno}
                    setDragOverMinutes={setDragOverMinutes}
                    setCardContextMenu={setCardContextMenu}
                    onEditClick={setEditingLesson}
                  />
                );
              });
            })()}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => {
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
                <div className="grid-cols-[80px] flex flex-col h-full relative bg-muted/5">
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
