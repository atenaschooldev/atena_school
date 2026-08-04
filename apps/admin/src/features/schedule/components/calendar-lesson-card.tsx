import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { levelColor, levelColorSolid } from "@/features/courses";
import type { Lesson } from "../types";
import type { Course } from "@/features/courses";
import type { Teacher } from "@/features/teachers";

interface CalendarLessonCardProps {
  lesson: Lesson;
  course?: Course;
  teacher?: Teacher;
  isResizingActive: boolean;
  isDragged: boolean;
  matchesSearch: boolean;
  hasSearch: boolean;
  topPercentage: number;
  heightPercentage: number;
  leftPct: number;
  rightPct: number;
  giornoIdx: number;
  columnRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  wasResizingRef: React.MutableRefObject<boolean>;
  setResizing: (
    val: {
      lessonId: string;
      edge: "top" | "bottom";
      columnTop: number;
      columnHeight: number;
    } | null,
  ) => void;
  setDraggedLessonId: (id: string | null) => void;
  setDragStartClickOffsetY: (y: number) => void;
  setActiveDragGiorno: (idx: number | null) => void;
  setDragOverMinutes: (min: number | null) => void;
  setCardContextMenu: (
    val: {
      lessonId: string;
      x: number;
      y: number;
    } | null,
  ) => void;
  onEditClick: (lesson: Lesson) => void;
}

export function CalendarLessonCard({
  lesson,
  course,
  teacher,
  isResizingActive,
  isDragged,
  matchesSearch,
  hasSearch,
  topPercentage,
  heightPercentage,
  leftPct,
  rightPct,
  giornoIdx,
  columnRefs,
  wasResizingRef,
  setResizing,
  setDraggedLessonId,
  setDragStartClickOffsetY,
  setActiveDragGiorno,
  setDragOverMinutes,
  setCardContextMenu,
}: CalendarLessonCardProps) {
  const courseTitle = course?.nome || lesson.corsoName || "Corso";
  const teacherTitle = teacher ? `${teacher.nome[0]}. ${teacher.cognome}` : lesson.insegnanteName || "";
  const courseLevel = course?.livello || "B1";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          draggable={!isResizingActive}
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
            setCardContextMenu({ lessonId: lesson.id, x: e.clientX, y: e.clientY });
          }}
          onDragStart={(e) => {
            if (isResizingActive) {
              e.preventDefault();
              return;
            }
            setDraggedLessonId(lesson.id);
            const cardRect = e.currentTarget.getBoundingClientRect();
            setDragStartClickOffsetY(e.clientY - cardRect.top);
            e.dataTransfer.setData("text/plain", lesson.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            setDraggedLessonId(null);
            setActiveDragGiorno(null);
            setDragOverMinutes(null);
          }}
          className={`absolute rounded-lg border p-2 pb-3 pt-3 text-left overflow-hidden transition-[transform,opacity,shadow,background-color,border-color] duration-155
          ${isResizingActive ? "cursor-ns-resize" : "cursor-grab active:cursor-grabbing"}
          flex flex-col justify-between
          ${
            hasSearch
              ? matchesSearch
                ? `${levelColorSolid(courseLevel)} hover:shadow-lg scale-[1.01] z-10`
                : "bg-muted/30 border-border/20 text-muted-foreground/30 opacity-40"
              : `${levelColor(courseLevel)} hover:shadow-md`
          }
          ${isDragged ? "opacity-30 scale-95" : ""}`}
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
                lessonId: lesson.id,
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
                  {courseLevel}
                  {lesson.isOnline && (
                    <Video className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </span>
                <span>
                  {lesson.oraInizio} - {lesson.oraFine}
                </span>
              </div>
              <div className="text-xs font-bold truncate mt-1 leading-tight">{courseTitle}</div>
            </div>
            <div className="text-[10px] opacity-75 flex items-center justify-between mt-1">
              <span className="truncate max-w-[60%]">
                {teacherTitle}
              </span>
              <span className="shrink-0 flex items-center gap-0.5">
                {lesson.isOnline ? (
                  <>
                    <Video className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{lesson.aula}</span>
                  </>
                ) : (
                  <>
                    <span>📍 {lesson.aula}</span>
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
                lessonId: lesson.id,
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
        <Badge variant="outline" className={`text-[11px] ${levelColor(courseLevel)}`}>
          {courseLevel}
        </Badge>
        <h4 className="font-semibold mt-2">{courseTitle}</h4>
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <div>
            ⏰ {lesson.oraInizio} – {lesson.oraFine}
          </div>
          <div>📍 {lesson.aula}</div>
          {teacherTitle && (
            <div>
              👤 {teacherTitle}
            </div>
          )}
          {lesson.isOnline && lesson.meetLink && (
            <div className="flex items-center justify-between gap-2 mt-2 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs shrink-0">🔗</span>
                <span className="font-mono text-[10px] truncate">{lesson.meetLink}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigator.clipboard.writeText(lesson.meetLink!);
                  toast.success("Link copiato negli appunti!");
                }}
                title="Copia link"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="mt-3 pt-2 border-t">
          <Button
            type="button"
            size="sm"
            className="w-full text-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.location.href = `/presenze?lessonId=${lesson.id}`;
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Отметить посещаемость
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
