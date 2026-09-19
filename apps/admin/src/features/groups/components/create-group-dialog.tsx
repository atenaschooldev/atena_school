"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useTeachers } from "@/features/teachers/hooks/use-teachers";
import { GroupStatus, WEEKDAY_DICTIONARY, Weekday } from "@atena/api-types";
import type { CreateGroupFormValues } from "../types";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateGroupFormValues) => Promise<any>;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateGroupDialogProps) {
  const { allCourses = [] } = useCourses();
  const { teachers = [] } = useTeachers();

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [room, setRoom] = useState("Aula 1");
  const [maxStudents, setMaxStudents] = useState(8);
  const [status, setStatus] = useState<number>(GroupStatus.RECRUITING);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDays, setSelectedDays] = useState<number[]>([Weekday.TUESDAY, Weekday.THURSDAY]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [notes, setNotes] = useState("");
  const [generateLessons, setGenerateLessons] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleCourseChange = (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    const found = allCourses.find((c) => c.id === selectedCourseId);
    if (found && !name) {
      setName(`Gruppo ${found.title} - ${startTime}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Inserisci il nome del gruppo");
      return;
    }
    if (!courseId) {
      toast.error("Seleziona il corso di riferimento");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Seleziona almeno un giorno della settimana");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        courseId,
        teacherId: teacherId || undefined,
        room: room || undefined,
        maxStudents: Number(maxStudents) || 8,
        status: Number(status) || GroupStatus.RECRUITING,
        startDate: startDate || undefined,
        scheduleDays: selectedDays,
        startTime,
        endTime: endTime || undefined,
        notes: notes || undefined,
        generateLessons,
      });
      onOpenChange(false);
      // Reset form
      setName("");
      setCourseId("");
      setTeacherId("");
      setNotes("");
    } catch (err: any) {
      // Handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekdays = [
    { day: Weekday.MONDAY, label: "Lunedì" },
    { day: Weekday.TUESDAY, label: "Martedì" },
    { day: Weekday.WEDNESDAY, label: "Mercoledì" },
    { day: Weekday.THURSDAY, label: "Giovedì" },
    { day: Weekday.FRIDAY, label: "Venerdì" },
    { day: Weekday.SATURDAY, label: "Sabato" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Crea Nuovo Gruppo / Classe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Corso */}
          <div className="space-y-1.5">
            <Label htmlFor="courseId" className="text-sm font-semibold">
              Corso di Riferimento *
            </Label>
            <Select value={courseId} onValueChange={handleCourseChange}>
              <SelectTrigger id="courseId">
                <SelectValue placeholder="Seleziona un corso..." />
              </SelectTrigger>
              <SelectContent>
                {allCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome Gruppo */}
          <div className="space-y-1.5">
            <Label htmlFor="groupName" className="text-sm font-semibold">
              Nome Gruppo / Classe *
            </Label>
            <Input
              id="groupName"
              placeholder="es. Inglese B1 - Mar/Gio 18:00"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Docente & Aula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="teacherId" className="text-sm font-semibold">
                Docente Assegnato
              </Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger id="teacherId">
                  <SelectValue placeholder="Seleziona docente..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room" className="text-sm font-semibold">
                Aula / Sede
              </Label>
              <Input
                id="room"
                placeholder="es. Aula 1 / Online Zoom"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          </div>

          {/* Capienza & Data Inizio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxStudents" className="text-sm font-semibold">
                Capienza Massima (Posti)
              </Label>
              <Input
                id="maxStudents"
                type="number"
                min={2}
                max={50}
                value={maxStudents}
                onChange={(e) => setMaxStudents(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-sm font-semibold">
                Data di Inizio Corso
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Giorni della settimana */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Giorni di Lezione *</Label>
            <div className="grid grid-cols-3 gap-2">
              {weekdays.map(({ day, label }) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border"
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orario Inizio & Fine */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-sm font-semibold">
                Orario Inizio *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-sm font-semibold">
                Orario Fine
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Note interne
            </Label>
            <Textarea
              id="notes"
              placeholder="Note sul livello del gruppo o requisiti..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Checkbox auto-genera lezioni */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="generateLessons"
              checked={generateLessons}
              onCheckedChange={(checked) => setGenerateLessons(!!checked)}
            />
            <Label htmlFor="generateLessons" className="text-xs text-muted-foreground cursor-pointer">
              Genera automaticamente il calendario delle lezioni in base ai giorni e all'orario
            </Label>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creazione in corso..." : "Crea Gruppo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
