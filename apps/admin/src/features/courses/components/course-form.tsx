"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import type { CourseFormValues } from "../types";
import type { Teacher } from "@/features/teachers";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSE_CATEGORIES, COURSE_FORMAT_OPTIONS } from "../utils";
import { useTranslation } from "@/i18n/context";
import { api } from "@/lib/api";

export interface CourseFormProps {
  initialValues: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
}

function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[àáâã]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõ]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}

function calcEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";
  const total = h * 60 + m + durationMin;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function CourseForm({ initialValues, onSubmit, onCancel, submitLabel }: CourseFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CourseFormValues>(initialValues);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [slugManual, setSlugManual] = useState(!!initialValues.slug);

  const STATUS_OPTIONS = [
    { value: "attivo", label: t("common.active") },
    { value: "in-programmazione", label: t("courses.inPlanning") },
    { value: "concluso", label: t("common.completed") },
    { value: "archiviato", label: t("groups.archived") },
  ];

  const DAYS_OF_WEEK = [
    { key: "Lunedì", label: t("weekdays.monday") },
    { key: "Martedì", label: t("weekdays.tuesday") },
    { key: "Mercoledì", label: t("weekdays.wednesday") },
    { key: "Giovedì", label: t("weekdays.thursday") },
    { key: "Venerdì", label: t("weekdays.friday") },
    { key: "Sabato", label: t("weekdays.saturday") },
    { key: "Domenica", label: t("weekdays.sunday") },
  ];

  useEffect(() => {
    api.get<any[]>("/admin/teachers")
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data.map((teacher) => ({ ...teacher, id: teacher.teacherId || teacher.id, fullName: teacher.fullName })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugManual && form.nome) {
      setForm((f) => ({ ...f, slug: slugify(f.nome) }));
    }
  }, [form.nome, slugManual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const toggleDay = (dayKey: string) => {
    const limit = form.lessonsPerWeek;
    setForm((f) => {
      if (f.scheduleDays.includes(dayKey)) {
        return { ...f, scheduleDays: f.scheduleDays.filter((d) => d !== dayKey) };
      }
      if (limit && f.scheduleDays.length >= limit) return f;
      return { ...f, scheduleDays: [...f.scheduleDays, dayKey] };
    });
  };

  // ─── Derived flags ────────────────────────────────────────────────────────
  const fmt = form.courseFormat || "group";
  const isGroup = fmt === "group";
  const isPrivate = fmt === "private";
  const isCertification = fmt === "certification";
  const isFixed = isGroup && form.scheduleType === "fixed";

  function updateStartTime(start: string) {
    const dur = form.lessonDurationMinutes;
    const end = start && dur ? calcEndTime(start, dur) : form.endTime;
    setForm((f) => ({ ...f, startTime: start, endTime: end }));
  }

  function updateDuration(min: number | null) {
    const start = form.startTime;
    const end = isFixed && start && min ? calcEndTime(start, min) : form.endTime;
    setForm((f) => ({ ...f, lessonDurationMinutes: min, endTime: end }));
  }

  // ─── Styles ───────────────────────────────────────────────────────────────
  const L = "text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5";
  const readOnly = "h-9 rounded-xl border border-input bg-muted/50 px-3 flex items-center text-xs font-medium text-foreground";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 pb-4">

        {/* ── Photo ── */}
        <div className="col-span-2 flex items-center gap-4 bg-muted/40 rounded-2xl p-3.5 border border-border/60">
          <div className="relative shrink-0 h-14 w-20 rounded-xl overflow-hidden border border-border bg-card flex items-center justify-center">
            {form.foto ? (
              <>
                <img src={form.foto} alt="" className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")} />
                <button type="button" onClick={() => setForm({ ...form, foto: "" })}
                  className="absolute top-1 right-1 h-5 w-5 bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer z-10">
                  <X className="h-3 w-3 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <span className="text-[11px] font-semibold text-muted-foreground">{t("common.noData")}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label className={L}>{t("teachers.photoUrl")}</Label>
            <Input placeholder="URL (https://...)" value={form.foto || ""}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="h-9 text-xs rounded-xl" />
          </div>
        </div>

        {/* ── Nome + Slug ── */}
        <div>
          <Label className={L}>{t("courses.courseName")} *</Label>
          <Input placeholder="Es. B2 First, General English..." value={form.nome} required
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="h-9 text-xs rounded-xl" />
        </div>
        <div>
          <Label className={L}>Slug (URL)</Label>
          <Input placeholder="b2-first" value={form.slug}
            onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }); }}
            className="h-9 text-xs rounded-xl" />
        </div>

        {/* ── Categoria + Formato ── */}
        <div>
          <Label className={L}>{t("courses.allCategories")}</Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder={t("courses.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="languages" className="cursor-pointer">{t("courses.categories.languages")}</SelectItem>
              <SelectItem value="academic" className="cursor-pointer">{t("courses.categories.academic")}</SelectItem>
              <SelectItem value="Certipass" className="cursor-pointer">{t("courses.categories.certipass")}</SelectItem>
              <SelectItem value="other" className="cursor-pointer">{t("courses.categories.general")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className={L}>{t("courses.format")} *</Label>
          <Select value={fmt}
            onValueChange={(f) => {
              setForm((prev) => ({
                ...prev,
                courseFormat: f,
                scheduleType: f === "group" ? (prev.scheduleType || "fixed") : "flexible",
                scheduleDays: f === "group" ? prev.scheduleDays : [],
                startTime: f === "group" ? prev.startTime : "",
                endTime: f === "group" ? prev.endTime : "",
                lessonsPerWeek: f === "group" ? prev.lessonsPerWeek : null,
                totalLessons: f === "private" ? prev.totalLessons : null,
                totalHours: f === "certification" ? prev.totalHours : null,
                lessonDurationMinutes: f === "certification" ? null : prev.lessonDurationMinutes,
              }));
            }}>
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder={t("courses.format")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group" className="cursor-pointer">{t("courses.group")}</SelectItem>
              <SelectItem value="private" className="cursor-pointer">{t("courses.individual")}</SelectItem>
              <SelectItem value="online" className="cursor-pointer">{t("courses.online")}</SelectItem>
              <SelectItem value="certification" className="cursor-pointer">{t("courses.certification")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Stato + Prezzo ── */}
        <div>
          <Label className={L}>{t("common.status")}</Label>
          <Select value={form.stato} onValueChange={(v) => setForm({ ...form, stato: v as any })}>
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder={t("common.status")} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="cursor-pointer">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className={L}>{t("courses.price")} *</Label>
          <Input type="number" placeholder="0.00" step="0.01" min="0" required
            value={form.prezzo?.toString() ?? ""}
            onChange={(e) => setForm({ ...form, prezzo: parseFloat(e.target.value) || 0 })}
            className="h-9 text-xs rounded-xl" />
        </div>

        {/* ── Insegnante ── */}
        <div>
          <Label className={L}>{t("courses.assignedTeacher")}</Label>
          <Select
            value={form.insegnanteIds[0] || "none"}
            onValueChange={(v) => setForm({ ...form, insegnanteIds: v === "none" ? [] : [v] })}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder={`— ${t("groups.unassigned")} —`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="cursor-pointer">— {t("groups.unassigned")} —</SelectItem>
              {teachers.length > 0
                ? teachers.map((teacher) => <SelectItem key={teacher.id} value={teacher.id} className="cursor-pointer">{teacher.fullName}</SelectItem>)
                : <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* ══ GROUP ══════════════════════════════════════════════════════════ */}
        {isGroup && (
          <>
            <div className="col-span-2">
              <Label className={L}>{t("courses.scheduleType")}</Label>
              <Select
                value={form.scheduleType || "fixed"}
                onValueChange={(sType) =>
                  setForm((f) => ({
                    ...f,
                    scheduleType: sType,
                    scheduleDays: sType === "flexible" ? [] : f.scheduleDays,
                    startTime: sType === "flexible" ? "" : f.startTime,
                    endTime: sType === "flexible" ? "" : f.endTime,
                  }))
                }
              >
                <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed" className="cursor-pointer">{t("courses.fixed")}</SelectItem>
                  <SelectItem value="flexible" className="cursor-pointer">{t("courses.flexible")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={L}>{t("courses.duration")} ({t("courses.minutes")})</Label>
              <Input type="number" placeholder="75" min="15" step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value) || null)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>{t("courses.lessonsCount")}</Label>
              <Input type="number" placeholder="2" min="1"
                value={form.lessonsPerWeek?.toString() ?? ""}
                onChange={(e) => setForm({ ...form, lessonsPerWeek: parseInt(e.target.value) || null })}
                className="h-9 text-xs rounded-xl" />
            </div>
          </>
        )}

        {/* Fixed: giorni + start_time + end_time auto */}
        {isFixed && (
          <>
            <div className="col-span-2 bg-muted/40 p-3.5 rounded-2xl border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <Label className={L}>{t("courses.scheduleDays")}</Label>
                {form.lessonsPerWeek && (
                  <span className="text-xs text-muted-foreground">
                    {form.scheduleDays.length}/{form.lessonsPerWeek} {t("courses.enrolledStudents").toLowerCase()}
                  </span>
                )}
              </div>
              <div className="flex gap-4 flex-wrap pt-1">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const isSelected = form.scheduleDays.includes(key);
                  const limitReached = !!form.lessonsPerWeek && form.scheduleDays.length >= form.lessonsPerWeek;
                  const isDisabled = !isSelected && limitReached;
                  return (
                    <label key={key}
                      className={`flex items-center gap-2 select-none text-xs font-medium ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                      <Checkbox checked={isSelected} disabled={isDisabled} onCheckedChange={() => toggleDay(key)} />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className={L}>{t("courses.startTime")}</Label>
              <Input type="time" value={form.startTime || ""}
                onChange={(e) => updateStartTime(e.target.value)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>
                {t("courses.endTime")}
              </Label>
              <div className={readOnly}>
                {form.endTime || <span className="text-muted-foreground">{t("courses.schedule")}</span>}
              </div>
            </div>
          </>
        )}

        {/* ══ PRIVATE ════════════════════════════════════════════════════════ */}
        {isPrivate && (
          <>
            <div>
              <Label className={L}>{t("courses.duration")} ({t("courses.minutes")})</Label>
              <Input type="number" placeholder="60" min="15" step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value) || null)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>{t("courses.lessonsCount")}</Label>
              <Input type="number" placeholder="10" min="1"
                value={form.totalLessons?.toString() ?? ""}
                onChange={(e) => setForm({ ...form, totalLessons: parseInt(e.target.value) || null })}
                className="h-9 text-xs rounded-xl" />
            </div>
          </>
        )}

        {/* ══ CERTIFICATION ══════════════════════════════════════════════════ */}
        {isCertification && (
          <div>
            <Label className={L}>{t("courses.totalLessonsEst")}</Label>
            <Input type="number" placeholder="30" min="0" step="0.5"
              value={form.totalHours?.toString() ?? ""}
              onChange={(e) => setForm({ ...form, totalHours: parseFloat(e.target.value) || null })}
              className="h-9 text-xs rounded-xl" />
          </div>
        )}

        {/* ── Descrizione ── */}
        <div className="col-span-2">
          <Label className={L}>{t("promotions.description")}</Label>
          <Textarea placeholder="..."
            value={form.descrizione}
            onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
            className="min-h-[80px] rounded-xl text-xs" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
        <Button type="button" variant="ghost" onClick={onCancel} className="font-semibold cursor-pointer">
          {t("common.cancel")}
        </Button>
        <Button type="submit" className="font-semibold rounded-xl cursor-pointer">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
