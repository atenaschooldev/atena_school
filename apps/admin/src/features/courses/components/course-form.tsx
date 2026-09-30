"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import type { CourseFormValues } from "../types";
import type { Teacher } from "@/features/teachers";
import {
  X,
  FileText,
  ExternalLink,
  Clock,
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Check,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/context";
import { api } from "@/lib/api";

export interface CourseFormProps {
  initialValues: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[àáâã]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõ]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function calcEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";
  const total = h * 60 + m + durationMin;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export interface CourseCategoryOption {
  id: string;
  slug: string;
  name: string;
}

export function CourseForm({ initialValues, onSubmit, onCancel, submitLabel }: CourseFormProps) {
  const { t, locale } = useTranslation();
  const [form, setForm] = useState<CourseFormValues>(initialValues);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [categories, setCategories] = useState<CourseCategoryOption[]>([]);
  const [settingsPresets, setSettingsPresets] = useState<any[]>([]);
  const [slugManual, setSlugManual] = useState(!!initialValues.slug);

  const STATUS_OPTIONS = [
    { value: "attivo", label: t("common.active") || "Attivo" },
    { value: "in-programmazione", label: t("courses.inPlanning") || "In Programmazione" },
    { value: "concluso", label: t("common.completed") || "Concluso" },
    { value: "archiviato", label: t("groups.archived") || "Archiviato" },
  ];

  const DAYS_OF_WEEK = [
    { key: "Lunedì", label: locale === "en" ? "Mon" : "Lun", full: t("weekdays.monday") || "Lunedì" },
    { key: "Martedì", label: locale === "en" ? "Tue" : "Mar", full: t("weekdays.tuesday") || "Martedì" },
    { key: "Mercoledì", label: locale === "en" ? "Wed" : "Mer", full: t("weekdays.wednesday") || "Mercoledì" },
    { key: "Giovedì", label: locale === "en" ? "Thu" : "Gio", full: t("weekdays.thursday") || "Giovedì" },
    { key: "Venerdì", label: locale === "en" ? "Fri" : "Ven", full: t("weekdays.friday") || "Venerdì" },
    { key: "Sabato", label: locale === "en" ? "Sat" : "Sab", full: t("weekdays.saturday") || "Sabato" },
    { key: "Domenica", label: locale === "en" ? "Sun" : "Dom", full: t("weekdays.sunday") || "Domenica" },
  ];

  useEffect(() => {
    api.get<any[]>("/admin/teachers")
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data.map((teacher) => ({ ...teacher, id: teacher.teacherId || teacher.id, fullName: teacher.fullName })));
        }
      })
      .catch(() => {});

    api.get<CourseCategoryOption[]>("/admin/courses/categories")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});

    api.get<any[]>("/admin/courses/settings")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSettingsPresets(data);
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

  // ─── Derived flags & Delivery Mode ───────────────────────────────────────
  const currentDeliveryMode = Number(form.deliveryMode ?? (
    form.courseFormat === "certification" || form.courseFormat === 4 ? 4 :
    form.scheduleType === "flexible" || form.scheduleType === 2 || form.courseFormat === "private" || form.courseFormat === 2 ? 2 : 1
  ));

  const isFixed = currentDeliveryMode === 1;
  const isFlexible = currentDeliveryMode === 2;
  const isCertification = currentDeliveryMode === 4;

  const setDeliveryMode = (mode: number) => {
    setForm((prev) => ({
      ...prev,
      deliveryMode: mode,
      courseFormat: mode === 4 ? "certification" : (mode === 2 ? "private" : "group"),
      scheduleType: mode === 1 ? "fixed" : "flexible",
      scheduleDays: mode === 1 ? prev.scheduleDays : [],
      startTime: mode === 1 ? prev.startTime : "",
      endTime: mode === 1 ? prev.endTime : "",
      totalLessons: mode === 2 ? (prev.totalLessons || 10) : null,
      totalHours: mode === 4 ? (prev.totalHours || 30) : null,
      lessonDurationMinutes: mode === 4 ? null : (prev.lessonDurationMinutes || (mode === 1 ? 75 : 60)),
    }));
  };

  const handlePresetChange = (presetId: string) => {
    if (presetId === "custom") {
      setForm((f) => ({ ...f, settingsId: null }));
      return;
    }
    const preset = settingsPresets.find((p) => p.id === presetId);
    if (!preset) return;
    const mode = Number(preset.deliveryMode || preset.delivery_mode || 1);
    setForm((f) => ({
      ...f,
      settingsId: preset.id,
      deliveryMode: mode,
      courseFormat: mode === 4 ? "certification" : (mode === 2 ? "private" : "group"),
      scheduleType: mode === 1 ? "fixed" : "flexible",
      lessonDurationMinutes: preset.lessonDurationMinutes ?? preset.lesson_duration_minutes ?? f.lessonDurationMinutes,
      lessonsPerWeek: preset.lessonsPerWeek ?? preset.lessons_per_week ?? f.lessonsPerWeek,
      totalLessons: preset.totalLessons ?? preset.total_lessons ?? f.totalLessons,
      totalHours: preset.totalHours ?? preset.total_hours ?? f.totalHours,
    }));
  };

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

  const primaryTeacherId = form.insegnanteIds[0] || "none";
  const assistantTeacherId = form.insegnanteIds[1] || "none";

  const handlePrimaryTeacherChange = (id: string) => {
    setForm((f) => {
      const currentAssistant = f.insegnanteIds[1];
      if (id === "none") {
        return { ...f, insegnanteIds: currentAssistant ? [currentAssistant] : [] };
      }
      const newIds = [id];
      if (currentAssistant && currentAssistant !== id) {
        newIds.push(currentAssistant);
      }
      return { ...f, insegnanteIds: newIds };
    });
  };

  const handleAssistantTeacherChange = (id: string) => {
    setForm((f) => {
      const currentPrimary = f.insegnanteIds[0];
      if (id === "none") {
        return { ...f, insegnanteIds: currentPrimary ? [currentPrimary] : [] };
      }
      if (!currentPrimary || currentPrimary === "none") {
        return { ...f, insegnanteIds: [id] };
      }
      return { ...f, insegnanteIds: [currentPrimary, id] };
    });
  };

  const handleCategoryChange = (catVal: string) => {
    const matchCat = categories.find((c) => c.id === catVal || c.slug === catVal);
    if (matchCat) {
      setForm((f) => ({ ...f, categoryId: matchCat.id, categoria: matchCat.slug }));
    } else {
      setForm((f) => ({ ...f, categoria: catVal }));
    }
  };

  const selectedDaysLimit = form.lessonsPerWeek;
  const selectedDaysCount = form.scheduleDays.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      
      {/* ── Section 1: Informazioni Generali ── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-border/50">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t("courses.sectionGeneral") || "Informazioni Generali"}
          </h3>
        </div>

        {/* Photo URL preview */}
        <div className="flex items-center gap-3.5 bg-muted/30 dark:bg-muted/20 rounded-xl p-3 border border-border/60">
          <div className="relative shrink-0 h-13 w-18 rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
            {form.foto ? (
              <>
                <img
                  src={form.foto}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, foto: "" })}
                  className="absolute top-1 right-1 h-4.5 w-4.5 bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer z-10 shadow-xs hover:bg-rose-700 transition-colors"
                >
                  <X className="h-3 w-3 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <Label htmlFor="course-photo" className="text-xs font-semibold text-foreground">
              {t("courses.photoUrlLabel") || "URL Immagine di Copertina"}
            </Label>
            <Input
              id="course-photo"
              placeholder="https://.../photo.jpg"
              value={form.foto || ""}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="h-8 text-xs rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="course-name" className="text-xs font-semibold text-foreground">
              {t("courses.courseName") || "Nome Corso"} *
            </Label>
            <Input
              id="course-name"
              placeholder="Es. B2 First, General English..."
              value={form.nome}
              required
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-slug" className="text-xs font-semibold text-foreground">
              Slug URL
            </Label>
            <Input
              id="course-slug"
              placeholder="b2-first"
              value={form.slug}
              onChange={(e) => {
                setSlugManual(true);
                setForm({ ...form, slug: e.target.value });
              }}
              className="h-9 text-xs font-mono rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="course-category" className="text-xs font-semibold text-foreground">
              {t("courses.categoryLabel") || "Categoria"} *
            </Label>
            <Select
              value={form.categoryId || form.categoria || "languages"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="course-category" className="h-9 text-xs rounded-xl cursor-pointer">
                <SelectValue placeholder={t("courses.categoryLabel") || "Seleziona categoria..."} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                      {c.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="languages" className="cursor-pointer">{t("courses.categories.languages") || "Corsi di Lingua"}</SelectItem>
                    <SelectItem value="academic" className="cursor-pointer">{t("courses.categories.academic") || "Recupero Scolastico"}</SelectItem>
                    <SelectItem value="certipass" className="cursor-pointer">{t("courses.categories.certipass") || "Certificazioni EIPASS"}</SelectItem>
                    <SelectItem value="other" className="cursor-pointer">{t("courses.categories.general") || "Generale / Altro"}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-status" className="text-xs font-semibold text-foreground">
              {t("common.status") || "Stato"}
            </Label>
            <Select value={form.stato} onValueChange={(v) => setForm({ ...form, stato: v as any })}>
              <SelectTrigger id="course-status" className="h-9 text-xs rounded-xl cursor-pointer">
                <SelectValue placeholder={t("common.status") || "Stato"} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="cursor-pointer">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="course-desc" className="text-xs font-semibold text-foreground">
            {t("promotions.description") || "Descrizione"}
          </Label>
          <Textarea
            id="course-desc"
            placeholder="Breve panoramica del corso, obiettivi formativi e destinatari..."
            value={form.descrizione}
            onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
            className="min-h-[70px] rounded-xl text-xs"
          />
        </div>
      </div>

      {/* ── Section 2: Formato Didattico & Prezzo ── */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center gap-2 pb-1 border-b border-border/50">
          <Award className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t("courses.sectionFormat") || "Formato Didattico & Prezzo"}
          </h3>
        </div>

        {/* Preset / Template Selector */}
        {settingsPresets.length > 0 && (
          <div className="bg-muted/30 dark:bg-muted/20 p-3 rounded-xl border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="course-preset" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t("courses.presetNameLabel") || "Preset / Template Formato"}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                (Compila automaticamente i valori predefiniti)
              </span>
            </div>
            <Select
              value={form.settingsId || "custom"}
              onValueChange={handlePresetChange}
            >
              <SelectTrigger id="course-preset" className="h-9 text-xs rounded-xl cursor-pointer bg-background">
                <SelectValue placeholder={t("courses.customPreset") || "— Configurazione personalizzata —"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom" className="cursor-pointer">
                  — {t("courses.customPreset") || "Configurazione personalizzata"} —
                </SelectItem>
                {settingsPresets.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="delivery-mode" className="text-xs font-semibold text-foreground">
              {t("courses.deliveryModeLabel") || "Modalità di Erogazione"} *
            </Label>
            <Select
              value={String(currentDeliveryMode)}
              onValueChange={(val) => setDeliveryMode(Number(val))}
            >
              <SelectTrigger id="delivery-mode" className="h-9 text-xs rounded-xl cursor-pointer">
                <SelectValue placeholder="Seleziona modalità..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="cursor-pointer">
                  📅 {t("courses.deliveryModeFixed") || "1 — Orario Fisso di Gruppo"}
                </SelectItem>
                <SelectItem value="2" className="cursor-pointer">
                  🤝 {t("courses.deliveryModeFlexible") || "2 — Flessibile / Individuale"}
                </SelectItem>
                <SelectItem value="4" className="cursor-pointer">
                  🎓 {t("courses.deliveryModeCertification") || "4 — Certificazione / Monte Ore"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-price" className="text-xs font-semibold text-foreground">
              {t("courses.price") || "Prezzo (€)"} *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">€</span>
              <Input
                id="course-price"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                value={form.prezzo !== undefined && form.prezzo !== null ? form.prezzo.toString() : ""}
                onChange={(e) => setForm({ ...form, prezzo: parseFloat(e.target.value) || 0 })}
                className="h-9 text-xs pl-7 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Docenti Assegnati ── */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center gap-2 pb-1 border-b border-border/50">
          <Users className="h-4 w-4 text-sky-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t("courses.sectionTeachers") || "Docenti Assegnati"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="primary-teacher" className="text-xs font-semibold text-foreground">
              {t("courses.primaryTeacher") || "Docente Principale (Lead)"}
            </Label>
            <Select
              value={primaryTeacherId}
              onValueChange={handlePrimaryTeacherChange}
            >
              <SelectTrigger id="primary-teacher" className="h-9 text-xs rounded-xl cursor-pointer">
                <SelectValue placeholder={`— ${t("groups.unassigned") || "Non assegnato"} —`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">
                  — {t("groups.unassigned") || "Non assegnato"} —
                </SelectItem>
                {teachers.length > 0
                  ? teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id} className="cursor-pointer">
                        {teacher.fullName}
                      </SelectItem>
                    ))
                  : <SelectItem value="loading" disabled>{t("common.loading") || "Caricamento..."}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assistant-teacher" className="text-xs font-semibold text-foreground">
              {t("courses.assistantTeacher") || "Docente Assistente / Supporto"}
            </Label>
            <Select
              value={assistantTeacherId}
              onValueChange={handleAssistantTeacherChange}
            >
              <SelectTrigger id="assistant-teacher" className="h-9 text-xs rounded-xl cursor-pointer">
                <SelectValue placeholder={`— ${t("courses.noAssistant") || "Nessun assistente"} —`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">
                  — {t("courses.noAssistant") || "Nessun assistente"} —
                </SelectItem>
                {teachers.length > 0
                  ? teachers
                      .filter((t) => t.id !== primaryTeacherId)
                      .map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id} className="cursor-pointer">
                          {teacher.fullName}
                        </SelectItem>
                      ))
                  : <SelectItem value="loading" disabled>{t("common.loading") || "Caricamento..."}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Section 4: Programmazione Didattica & Orari ── */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center gap-2 pb-1 border-b border-border/50">
          <Calendar className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {t("courses.sectionSchedule") || "Programmazione Didattica & Orari"}
          </h3>
        </div>

        {/* 1. Gruppo a orario fisso */}
        {isFixed && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="fixed-duration" className="text-xs font-semibold text-foreground">
                  {t("courses.lessonDurationLabel") || "Durata Singola Lezione (min)"}
                </Label>
                <Input
                  id="fixed-duration"
                  type="number"
                  placeholder="75"
                  min="15"
                  step="5"
                  value={form.lessonDurationMinutes?.toString() ?? ""}
                  onChange={(e) => updateDuration(parseInt(e.target.value, 10) || null)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fixed-lessons-week" className="text-xs font-semibold text-foreground">
                  {t("courses.lessonsPerWeekLabel") || "Frequenza (Lezioni / Settimana)"}
                </Label>
                <Input
                  id="fixed-lessons-week"
                  type="number"
                  placeholder="2"
                  min="1"
                  value={form.lessonsPerWeek?.toString() ?? ""}
                  onChange={(e) => setForm({ ...form, lessonsPerWeek: parseInt(e.target.value, 10) || null })}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Weekday pills */}
            <div className="bg-muted/30 dark:bg-muted/20 p-3 rounded-xl border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  {t("courses.scheduleDays") || "Giorni Settimanali di Lezione"}
                </Label>
                {selectedDaysLimit && (
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {selectedDaysCount} / {selectedDaysLimit} {locale === "en" ? "selected" : "selezionati"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {DAYS_OF_WEEK.map(({ key, label, full }) => {
                  const isSelected = form.scheduleDays.includes(key);
                  const limitReached = !!selectedDaysLimit && selectedDaysCount >= selectedDaysLimit;
                  const isDisabled = !isSelected && limitReached;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleDay(key)}
                      title={full}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : isDisabled
                          ? "opacity-40 cursor-not-allowed bg-muted/30 text-muted-foreground border-border/40"
                          : "bg-background text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="fixed-start-time" className="text-xs font-semibold text-foreground">
                  {t("courses.startTimeLabel") || "Orario di Inizio"}
                </Label>
                <Input
                  id="fixed-start-time"
                  type="time"
                  value={form.startTime || ""}
                  onChange={(e) => updateStartTime(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("courses.endTimeLabel") || "Orario di Fine"} ({t("courses.calculated") || "Calcolato"})
                </Label>
                <div className="h-9 rounded-xl border border-input bg-muted/40 dark:bg-muted/20 px-3 flex items-center text-xs font-semibold text-foreground font-mono">
                  {form.endTime ? (
                    form.endTime
                  ) : (
                    <span className="text-muted-foreground font-normal font-sans text-xs">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Flessibile / Pacchetto individuale */}
        {isFlexible && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="flex-duration" className="text-xs font-semibold text-foreground">
                {t("courses.lessonDurationLabel") || "Durata Singola Lezione (min)"}
              </Label>
              <Input
                id="flex-duration"
                type="number"
                placeholder="60"
                min="15"
                step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value, 10) || null)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="flex-total-lessons" className="text-xs font-semibold text-foreground">
                {t("courses.totalLessonsLabel") || "Numero Totale Lezioni (Pacchetto)"}
              </Label>
              <Input
                id="flex-total-lessons"
                type="number"
                placeholder="10"
                min="1"
                value={form.totalLessons?.toString() ?? ""}
                onChange={(e) => setForm({ ...form, totalLessons: parseInt(e.target.value, 10) || null })}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>
        )}

        {/* 4. Certificazione / Monte ore */}
        {isCertification && (
          <div className="space-y-1.5">
            <Label htmlFor="cert-total-hours" className="text-xs font-semibold text-foreground">
              {t("courses.totalHoursLabel") || "Monte Ore Complessivo"}
            </Label>
            <Input
              id="cert-total-hours"
              type="number"
              placeholder="30"
              min="0"
              step="0.5"
              value={form.totalHours?.toString() ?? ""}
              onChange={(e) => setForm({ ...form, totalHours: parseFloat(e.target.value) || null })}
              className="h-9 text-xs rounded-xl font-mono"
            />
          </div>
        )}
      </div>

      {/* ── Section 5: Modulo di Iscrizione & Form Engine ── */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-3.5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-2xs shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {t("courses.formEngineTitle") || "Modulo di Iscrizione & Form Engine"}
              <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                Database-First
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {t("courses.formEngineDesc") || "Personalizza le domande e i campi richiesti al corsista durante il checkout."}
            </p>
          </div>
        </div>
        <a
          href={`/moduli?courseId=${form.slug || (initialValues as any).id || ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-background hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-primary" />
          {t("courses.formEngineBtn") || "Personalizza Modulo"}
        </a>
      </div>

      {/* ── Dialog Footer Buttons ── */}
      <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="font-medium cursor-pointer text-xs h-9 px-4 rounded-xl"
        >
          {t("common.cancel") || "Annulla"}
        </Button>
        <Button
          type="submit"
          className="font-bold rounded-xl cursor-pointer text-xs h-9 px-5 shadow-xs"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
