"use client";

import { UseFormReturn } from "react-hook-form";
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
} from "lucide-react";
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
  previewLessons: Array<{ date: string; startsAt?: string; endsAt?: string }>;
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
  return (
    <div className="space-y-5">
      {/* Select Course Dropdown */}
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
                <SelectTrigger className="cursor-pointer h-11 text-sm bg-background border-border/70 shadow-2xs">
                  <SelectValue placeholder="Scegli un corso dal catalogo..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {coursesList.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer text-sm font-medium">
                    {c.nome} {c.prezzo ? `(€${Number(c.prezzo).toFixed(2)})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 1. TOP PANEL: CALENDAR PICKER */}
      <div className="space-y-2">
        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          {isFixedSchedule ? "1. Seleziona Data di Inizio *" : "Orario Flessibile"}
        </FormLabel>

        {!selectedCourse ? (
          <div className="h-44 flex flex-col items-center justify-center bg-muted/10 border border-dashed rounded-2xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-semibold text-foreground">Nessun corso selezionato</p>
            <p className="text-[11px] text-muted-foreground mt-1">Seleziona prima un corso dal catalogo per abilitare il calendario.</p>
          </div>
        ) : isFlexibleSchedule ? (
          <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Orario Flessibile
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Questo corso non ha giorni fissi. Gli orari verranno concordati direttamente con la scuola dopo la prenotazione.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-background rounded-2xl border border-border/70 shadow-2xs flex justify-center items-center">
            <Calendar
              mode="single"
              selected={selectedDateState}
              onSelect={handleDateSelect}
              locale={dateLocale}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return true;
                if (isFixedSchedule) return !allowedDays.includes(date.getDay());
                return date.getDay() === 0 || date.getDay() === 6;
              }}
              modifiers={{
                free: (date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return false;
                  if (isFixedSchedule) return allowedDays.includes(date.getDay());
                  return date.getDay() !== 0 && date.getDay() !== 6;
                },
              }}
              modifiersClassNames={{
                free: "font-bold text-primary bg-primary/15 border border-primary/25 rounded-lg hover:bg-primary/25",
              }}
              fixedWeeks
              className="rounded-md border-0 p-1"
            />
          </div>
        )}
      </div>

      {/* 2. BOTTOM PANEL: COURSE DETAILS & LESSONS BREAKDOWN */}
      {selectedCourse && (
        <div className="p-5 bg-gradient-to-br from-card via-card/95 to-muted/20 rounded-2xl border border-border/80 shadow-md space-y-4">
          {/* Title, Category & Price Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-extrabold bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-md">
                  {selectedCourse.categoria || "Corso"}
                </Badge>
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {selectedCourse.teacherName || "Staff Atena School"}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-foreground tracking-tight leading-snug">{selectedCourse.nome}</h3>
            </div>
            <Badge className="text-base font-black font-mono bg-primary text-primary-foreground px-3.5 py-1 rounded-xl shadow-xs border-0">
              €{Number(selectedCourse.prezzo || 0).toFixed(2)}
            </Badge>
          </div>

          {/* Hours & Schedule Info Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Durata e Frequenza</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedCourse.totalHours ? `${selectedCourse.totalHours} ore totali` : "Corso modulare"} · {selectedCourse.lessonDurationMinutes || 60} min/lez.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Orari & Giorni</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {formattedScheduleText || "Orario flessibile"}
                </p>
              </div>
            </div>
          </div>

          {/* Start Date & Lessons Breakdown */}
          {selectedDateState && isFixedSchedule && (
            <div className="space-y-3.5 text-xs pt-1">
              <div className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/25">
                <span className="text-primary font-bold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  Data Inizio Corso:
                </span>
                <span className="font-extrabold text-primary font-mono text-sm">
                  {format(selectedDateState, "dd MMMM yyyy", { locale: dateLocale })}
                </span>
              </div>

              {previewLessons.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    <span>Calendario Lezioni Generato</span>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-background text-foreground px-2 py-0.5">
                      {previewLessons.length} lezioni
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previewLessons.map((l, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs font-mono px-2.5 py-1 bg-muted/40 hover:bg-primary/10 border border-border/60 text-foreground transition-all flex items-center gap-1.5 rounded-lg"
                      >
                        <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.2 rounded font-mono">
                          #{i + 1}
                        </span>
                        <span className="font-semibold">
                          {l.startsAt ? format(new Date(l.startsAt), "EEE d MMM", { locale: dateLocale }) : l.date}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
