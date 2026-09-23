"use client";

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

      {/* 2. Calendar + Info Grid */}
      <div className="space-y-3">
        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          {isFixedSchedule ? "Data Inizio e Calendario Lezioni *" : "Orario Flessibile"}
        </FormLabel>

        {!selectedCourse ? (
          <div className="h-44 flex flex-col items-center justify-center bg-muted/10 border border-dashed rounded-xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-semibold text-foreground">Nessun corso selezionato</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Seleziona prima un corso dal catalogo per abilitare il calendario.
            </p>
          </div>
        ) : isFlexibleSchedule ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-600 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Orario Flessibile
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Questo corso non ha giorni fissi a calendario. Gli orari verranno concordati direttamente
              con la scuola dopo l'iscrizione.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Compact Calendar */}
            <div className="p-2 bg-background rounded-xl border border-border/70 shadow-2xs flex justify-center items-center">
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
                className="rounded-md border-0 p-0 text-xs scale-90 sm:scale-95 origin-top"
              />
            </div>

            {/* Right: Schedule Details & Generated Lessons */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px] font-medium">Orari & Frequenza:</span>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    {selectedCourse.totalHours ? `${selectedCourse.totalHours}h tot.` : "Modulare"}
                  </Badge>
                </div>
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{formattedScheduleText || "Orario da definire"}</span>
                </div>
                {selectedCourse.teacherName && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1.5 border-t border-border/40">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Docente: {selectedCourse.teacherName}</span>
                  </div>
                )}
              </div>

              {/* Generated Lessons Pill Box */}
              {previewLessons.length > 0 && (
                <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    <span>Lezioni a Calendario</span>
                    <span className="text-primary font-mono font-bold">{previewLessons.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {previewLessons.map((l, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[10px] font-mono px-2 py-0.5 bg-background border border-border/60 text-foreground flex items-center gap-1 rounded-md"
                      >
                        <span className="font-bold text-primary font-mono">#{i + 1}</span>
                        <span>
                          {l.startsAt
                            ? format(new Date(l.startsAt), "d MMM", { locale: dateLocale })
                            : l.date}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
