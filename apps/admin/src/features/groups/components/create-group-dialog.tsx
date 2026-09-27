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
import { GroupStatus, Weekday } from "@atena/api-types";
import { useTranslation } from "@/i18n/context";
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
  const { t } = useTranslation();
  const { coursesList: allCourses = [] } = useCourses();
  const { teachers = [] } = useTeachers();

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [room, setRoom] = useState("");
  const [maxStudents, setMaxStudents] = useState(8);
  const [status, setStatus] = useState<number>(GroupStatus.RECRUITING);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
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
    if (found) {
      const courseTitle = found.nome || (found as any).name || (found as any).title || "";
      if (!name) {
        setName(`${courseTitle} - ${found.startTime || startTime}`);
      }
      if (found.insegnanteId) {
        setTeacherId(found.insegnanteId);
      }
      if (found.scheduleDays && found.scheduleDays.length > 0) {
        setSelectedDays(found.scheduleDays.map((d: any) => Number(d)));
      }
      if (found.startTime) {
        setStartTime(found.startTime);
      }
      if (found.endTime) {
        setEndTime(found.endTime);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("groups.groupName"));
      return;
    }
    if (!courseId) {
      toast.error(t("groups.selectCourse"));
      return;
    }
    if (selectedDays.length === 0) {
      toast.error(t("groups.classDays"));
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
      toast.success(t("groups.createdSuccess"));
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
    { day: Weekday.MONDAY, label: t("weekdays.monday") },
    { day: Weekday.TUESDAY, label: t("weekdays.tuesday") },
    { day: Weekday.WEDNESDAY, label: t("weekdays.wednesday") },
    { day: Weekday.THURSDAY, label: t("weekdays.thursday") },
    { day: Weekday.FRIDAY, label: t("weekdays.friday") },
    { day: Weekday.SATURDAY, label: t("weekdays.saturday") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("groups.newGroup")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Corso */}
          <div className="space-y-1.5">
            <Label htmlFor="courseId" className="text-sm font-semibold">
              {t("groups.selectCourse")} *
            </Label>
            <Select value={courseId} onValueChange={handleCourseChange}>
              <SelectTrigger id="courseId" className="cursor-pointer">
                <SelectValue placeholder={t("groups.selectCourse")} />
              </SelectTrigger>
              <SelectContent>
                {allCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                    {c.nome || (c as any).name || (c as any).title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome Gruppo */}
          <div className="space-y-1.5">
            <Label htmlFor="groupName" className="text-sm font-semibold">
              {t("groups.groupName")} *
            </Label>
            <Input
              id="groupName"
              placeholder="es. English B1 - 18:00"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Docente & Aula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="teacherId" className="text-sm font-semibold">
                {t("groups.teacher")}
              </Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger id="teacherId" className="cursor-pointer">
                  <SelectValue placeholder={t("groups.selectTeacher")} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((tItem) => (
                    <SelectItem key={tItem.id} value={tItem.id} className="cursor-pointer">
                      {tItem.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room" className="text-sm font-semibold">
                {t("groups.classroom")}
              </Label>
              <Input
                id="room"
                placeholder="Aula 1 / Online"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          </div>

          {/* Capienza & Data Inizio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxStudents" className="text-sm font-semibold">
                {t("groups.maxStudents")}
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
                {t("groups.startDate")}
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
            <Label className="text-sm font-semibold">{t("groups.classDays")} *</Label>
            <div className="grid grid-cols-3 gap-2">
              {weekdays.map(({ day, label }) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-left flex items-center justify-between cursor-pointer ${
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
                {t("groups.startTime")} *
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
                {t("groups.endTime")}
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
              {t("groups.notes")}
            </Label>
            <Textarea
              id="notes"
              placeholder="..."
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
              {t("groups.generateLessons")}
            </Label>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? t("common.saving") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
