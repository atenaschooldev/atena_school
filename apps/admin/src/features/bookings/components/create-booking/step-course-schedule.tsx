"use client";

import { useState, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import {
  User,
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  CalendarDays,
  Hourglass,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Course } from "@/features/courses/types";
import type { CreateBookingValues } from "./types";

interface StepCourseScheduleProps {
  form: UseFormReturn<CreateBookingValues>;
  coursesList: Course[];
  selectedCourse: Course | null;
  handleCourseChange: (courseId: string) => void;
  isFixedSchedule: boolean;
  isFlexibleSchedule: boolean;
  selectedDateState: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
  allowedDays: number[];
  formattedScheduleText: string;
  previewLessons: Array<{ date?: string; startsAt?: string; endsAt?: string }>;
}

export function StepCourseSchedule({
  form,
  coursesList,
  selectedCourse,
  handleCourseChange,
  isFixedSchedule,
  isFlexibleSchedule,
  selectedDateState,
  handleDateSelect,
  allowedDays,
  formattedScheduleText,
  previewLessons,
}: StepCourseScheduleProps) {
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const { data: openGroupsData } = useQuery({
    queryKey: ["groups", "course", selectedCourse?.id],
    queryFn: () => api.get<any[]>(`/admin/groups?courseId=${selectedCourse?.id}&status=1`),
    enabled: !!selectedCourse?.id,
  });
  const availableGroups = Array.isArray(openGroupsData) ? openGroupsData : [];

  // Generate 6 upcoming allowed start dates matching landing UX
  const upcomingDates = useMemo(() => {
    if (!allowedDays || allowedDays.length === 0) return [];
    const dates: Date[] = [];
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    current.setDate(current.getDate() + 1);
    let iterations = 0;
    while (dates.length < 6 && iterations < 45) {
      if (allowedDays.includes(current.getDay())) dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
      iterations++;
    }
    return dates;
  }, [allowedDays]);

  return (
    <div className="space-y-4">
      {/* 1. Select Course Dropdown */}
      <FormField
        control={form.control}
        name="courseId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Seleziona Corso dal Catalogo *
            </FormLabel>
            <Select
              onValueChange={(val) => {
                field.onChange(val);
                handleCourseChange(val);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="cursor-pointer h-10 text-xs bg-background border-border/70 rounded-xl">
                  <SelectValue placeholder="Scegli un corso dal catalogo..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-60">
                {coursesList.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer text-xs font-medium">
                    {c.nome} {c.prezzo ? `(€${Number(c.prezzo).toFixed(2)})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 2. Optional Group Selector */}
      {selectedCourse && (
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gruppo / Classe (Opzionale)
                </FormLabel>
                <span className="text-[10px] text-muted-foreground">Predefinito: Auto-assegnazione</span>
              </div>
              <Select
                onValueChange={(val) => field.onChange(val === "auto" ? "" : val)}
                value={field.value || "auto"}
              >
                <FormControl>
                  <SelectTrigger className="cursor-pointer h-9 text-xs bg-background border-border/70 rounded-xl">
                    <SelectValue placeholder="Auto-assegnazione intelligente (Consigliato)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-56">
                  <SelectItem value="auto" className="cursor-pointer text-xs font-medium text-primary">
                    ✨ Auto-assegnazione intelligente (trova o crea gruppo)
                  </SelectItem>
                  {availableGroups.map((g: any) => (
                    <SelectItem key={g.id} value={g.id} className="cursor-pointer text-xs">
                      👥 {g.name} ({g.members?.length || 0}/{g.maxStudents || 8} iscritti)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* 3. Course Details & Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            {isFixedSchedule ? "Data Inizio e Calendario Lezioni *" : "Modalità Orario"}
          </FormLabel>

          {selectedCourse && isFixedSchedule && (
            <button
              type="button"
              onClick={() => setShowFullCalendar(!showFullCalendar)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {showFullCalendar ? "Mostra Date Rapide" : "Mostra Calendario Completo"}
            </button>
          )}
        </div>

        {!selectedCourse ? (
          <div className="h-44 flex flex-col items-center justify-center bg-muted/10 border border-dashed rounded-xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-semibold text-foreground">Nessun corso selezionato</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Seleziona prima un corso dal catalogo per abilitare il calendario e gli orari.
            </p>
          </div>
        ) : isFlexibleSchedule ? (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-primary">
              <Sparkles className="w-4 h-4 text-[#F8861D]" />
              Orario Flessibile / Individuale (Concordato)
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Questo corso non ha giorni fissi a calendario. Gli orari e i giorni delle lezioni verranno concordati direttamente
              tra la segreteria, il docente e lo studente.
            </p>
            {selectedCourse.lessonDurationMinutes && (
              <div className="text-[11px] font-semibold text-foreground pt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>DURATA LEZIONE: {selectedCourse.lessonDurationMinutes} minuti</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick-dates 6 cards matching landing UX or Full Calendar */}
            {!showFullCalendar ? (
              <div>
                <div className="text-[11px] font-medium text-muted-foreground mb-2">
                  Seleziona la data del primo incontro (disponibili i giorni del corso: {formattedScheduleText}):
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {upcomingDates.map((d, idx) => {
                    const isSelected =
                      selectedDateState &&
                      selectedDateState.toDateString() === d.toDateString();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDateSelect(d)}
                        className={cn(
                          "relative p-2.5 rounded-xl text-center transition-all duration-150 cursor-pointer border select-none flex flex-col items-center justify-center",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02] ring-2 ring-primary/30"
                            : "bg-background border-border/70 hover:border-primary/50 hover:bg-muted/40"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="w-3 h-3 text-[#F8861D]" />
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider leading-none mb-1",
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {format(d, "EEE", { locale: dateLocale })}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-black leading-none",
                            isSelected ? "text-primary-foreground" : "text-foreground"
                          )}
                        >
                          {format(d, "d", { locale: dateLocale })}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold leading-none mt-1",
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {format(d, "MMM", { locale: dateLocale })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-background rounded-xl border border-border/70 shadow-2xs flex justify-center items-center">
                <Calendar
                  mode="single"
                  selected={selectedDateState}
                  onSelect={(date) => {
                    handleDateSelect(date);
                    if (date) setShowFullCalendar(false);
                  }}
                  locale={dateLocale}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) return true;
                    return !allowedDays.includes(date.getDay());
                  }}
                  modifiers={{
                    free: (date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) return false;
                      return allowedDays.includes(date.getDay());
                    },
                  }}
                  modifiersClassNames={{
                    free: "font-bold text-primary bg-primary/15 border border-primary/25 rounded-lg hover:bg-primary/25",
                  }}
                  fixedWeeks
                  className="rounded-md border-0 p-0 text-xs scale-90 sm:scale-95 origin-top"
                />
              </div>
            )}

            {/* Course Metadata Strip & Scheduled Lessons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Details Box */}
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px] font-medium">Orari & Frequenza:</span>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    {selectedCourse.totalHours
                      ? `${selectedCourse.totalHours} ore tot.`
                      : selectedCourse.totalLessons
                      ? `${selectedCourse.totalLessons} lezioni`
                      : "Modulare"}
                  </Badge>
                </div>
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{formattedScheduleText || "Orario da definire"}</span>
                </div>
                {selectedCourse.lessonDurationMinutes && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Hourglass className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>DURATA: {selectedCourse.lessonDurationMinutes} min / lezione</span>
                  </div>
                )}
                {selectedCourse.teacherName && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1.5 border-t border-border/40">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Docente: {selectedCourse.teacherName}</span>
                  </div>
                )}
              </div>

              {/* Right Generated Lessons Pill Box */}
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span>Lezioni a Calendario</span>
                  <span className="text-primary font-mono font-bold">{previewLessons.length}</span>
                </div>

                {previewLessons.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {previewLessons.map((l, i) => {
                      const raw = l.startsAt || l.date;
                      const d = raw ? new Date(raw) : null;
                      const dateText =
                        d && !isNaN(d.getTime())
                          ? format(d, "d MMM", { locale: dateLocale })
                          : raw || `#${i + 1}`;
                      return (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[10px] font-mono px-2 py-0.5 bg-background border border-border/60 text-foreground flex items-center gap-1 rounded-md"
                        >
                          <span className="font-bold text-primary font-mono">#{i + 1}</span>
                          <span>{dateText}</span>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic py-3 text-center">
                    Seleziona una data di inizio per calcolare il piano lezioni.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

