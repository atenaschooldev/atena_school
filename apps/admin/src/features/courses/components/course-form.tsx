"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import type { CourseFormValues } from "../types";
import type { Teacher } from "@/features/teachers";
import { X, FileText, ExternalLink } from "lucide-react";
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

export interface CourseCategoryOption {
  id: string;
  slug: string;
  name: string;
}

export function CourseForm({ initialValues, onSubmit, onCancel, submitLabel }: CourseFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CourseFormValues>(initialValues);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [categories, setCategories] = useState<CourseCategoryOption[]>([]);
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

  const [settingsPresets, setSettingsPresets] = useState<any[]>([]);

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
    const dayIndices: number[] = Array.isArray(preset.scheduleDays || preset.schedule_days) ? (preset.scheduleDays || preset.schedule_days) : [];
    const mappedDays = dayIndices.map((d: number) => DAYS_OF_WEEK[d - 1]?.key || String(d));
    setForm((f) => ({
      ...f,
      settingsId: preset.id,
      deliveryMode: mode,
      courseFormat: mode === 4 ? "certification" : (mode === 2 ? "private" : "group"),
      scheduleType: mode === 1 ? "fixed" : "flexible",
      scheduleDays: mappedDays.length > 0 ? mappedDays : f.scheduleDays,
      startTime: preset.startTime || preset.start_time || "",
      endTime: preset.endTime || preset.end_time || "",
      lessonDurationMinutes: preset.lessonDurationMinutes ?? preset.lesson_duration_minutes ?? null,
      lessonsPerWeek: preset.lessonsPerWeek ?? preset.lessons_per_week ?? null,
      totalLessons: preset.totalLessons ?? preset.total_lessons ?? null,
      totalHours: preset.totalHours ?? preset.total_hours ?? null,
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

        {/* ── Categoria + Modalità di Erogazione ── */}
        <div>
          <Label className={L}>{t("courses.allCategories")}</Label>
          <Select
            value={form.categoryId || form.categoria || "languages"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder={t("courses.allCategories")} />
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
                  <SelectItem value="languages" className="cursor-pointer">{t("courses.categories.languages")}</SelectItem>
                  <SelectItem value="academic" className="cursor-pointer">{t("courses.categories.academic")}</SelectItem>
                  <SelectItem value="Certipass" className="cursor-pointer">{t("courses.categories.certipass")}</SelectItem>
                  <SelectItem value="other" className="cursor-pointer">{t("courses.categories.general")}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className={L}>Modalità di Erogazione (Settings) *</Label>
          <Select
            value={String(currentDeliveryMode)}
            onValueChange={(val) => setDeliveryMode(Number(val))}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder="Seleziona modalità..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1" className="cursor-pointer">📅 Orario Fisso (Corsi di Gruppo)</SelectItem>
              <SelectItem value="2" className="cursor-pointer">🤝 Flessibile / Pacchetti di Lezioni</SelectItem>
              <SelectItem value="4" className="cursor-pointer">🎓 Certificazione (EIPASS / Monte Ore)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Preset Configurazione (Template) ── */}
        {settingsPresets.length > 0 && (
          <div className="col-span-2 bg-blue-50/30 p-3 rounded-xl border border-blue-200/60">
            <Label className={L}>Preset / Template Configurazione</Label>
            <Select
              value={form.settingsId || "custom"}
              onValueChange={handlePresetChange}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer bg-white">
                <SelectValue placeholder="— Configurazione personalizzata —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom" className="cursor-pointer">— Personalizzata / Nuovo preset per questo corso —</SelectItem>
                {settingsPresets.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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

        {/* ── Docente Principale (PRIMARY) ── */}
        <div>
          <Label className={L}>Docente Principale (Lead)</Label>
          <Select
            value={primaryTeacherId}
            onValueChange={handlePrimaryTeacherChange}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder={`— ${t("groups.unassigned")} —`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="cursor-pointer">— {t("groups.unassigned")} —</SelectItem>
              {teachers.length > 0
                ? teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id} className="cursor-pointer">
                      {teacher.fullName}
                    </SelectItem>
                  ))
                : <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* ── Docente di Supporto (ASSISTANT) ── */}
        <div>
          <Label className={L}>Docente Assistente / Supporto</Label>
          <Select
            value={assistantTeacherId}
            onValueChange={handleAssistantTeacherChange}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
              <SelectValue placeholder="— Nessun assistente —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="cursor-pointer">— Nessun assistente —</SelectItem>
              {teachers.length > 0
                ? teachers
                    .filter((t) => t.id !== primaryTeacherId)
                    .map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id} className="cursor-pointer">
                        {teacher.fullName}
                      </SelectItem>
                    ))
                : <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* ══ 1. ORARIO FISSO (FIXED SCHEDULE) ════════════════════════════════ */}
        {isFixed && (
          <>
            <div>
              <Label className={L}>{t("courses.duration")} ({t("courses.minutes")})</Label>
              <Input type="number" placeholder="75" min="15" step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value) || null)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>{t("courses.lessonsCount")} / settimana</Label>
              <Input type="number" placeholder="2" min="1"
                value={form.lessonsPerWeek?.toString() ?? ""}
                onChange={(e) => setForm({ ...form, lessonsPerWeek: parseInt(e.target.value) || null })}
                className="h-9 text-xs rounded-xl" />
            </div>

            <div className="col-span-2 bg-muted/40 p-3.5 rounded-2xl border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <Label className={L}>{t("courses.scheduleDays")}</Label>
                {form.lessonsPerWeek && (
                  <span className="text-xs text-muted-foreground">
                    {form.scheduleDays.length}/{form.lessonsPerWeek} selezionati
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
                {t("courses.endTime")} (Calcolato)
              </Label>
              <div className={readOnly}>
                {form.endTime || <span className="text-muted-foreground">—</span>}
              </div>
            </div>
          </>
        )}

        {/* ══ 2. FLESSIBILE / PACCHETTO ═════════════════════════════════════ */}
        {isFlexible && (
          <>
            <div>
              <Label className={L}>{t("courses.duration")} ({t("courses.minutes")})</Label>
              <Input type="number" placeholder="60" min="15" step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value) || null)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>Numero Totale Lezioni (Pacchetto)</Label>
              <Input type="number" placeholder="10" min="1"
                value={form.totalLessons?.toString() ?? ""}
                onChange={(e) => setForm({ ...form, totalLessons: parseInt(e.target.value) || null })}
                className="h-9 text-xs rounded-xl" />
            </div>
          </>
        )}

        {/* ══ 4. CERTIFICAZIONE (EIPASS) ════════════════════════════════════ */}
        {isCertification && (
          <div className="col-span-2">
            <Label className={L}>Monte Ore Complessivo ({t("courses.totalLessonsEst")})</Label>
            <Input type="number" placeholder="30" min="0" step="0.5"
              value={form.totalHours?.toString() ?? ""}
              onChange={(e) => setForm({ ...form, totalHours: parseFloat(e.target.value) || null })}
              className="h-9 text-xs rounded-xl" />
          </div>
        )}

        {/* ── Modulo di Iscrizione & Form Engine ── */}
        <div className="col-span-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl p-4 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#043569] text-[#FAA904] rounded-xl shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                Modulo di Iscrizione & Form Engine
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Database-First
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Personalizza le domande e i campi richiesti al corsista durante il checkout di questo corso.
              </p>
            </div>
          </div>
          <a
            href={`/moduli?courseId=${form.slug || (initialValues as any).id || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-white hover:bg-slate-50 text-[#043569] border border-blue-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FAA904]" />
            Personalizza Modulo
          </a>
        </div>

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
