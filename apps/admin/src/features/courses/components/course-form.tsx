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

export interface CourseFormProps {
  initialValues: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
}

const STATUS_OPTIONS = [
  { value: "attivo", label: "Attivo" },
  { value: "in-programmazione", label: "In Programmazione" },
  { value: "concluso", label: "Concluso" },
  { value: "archiviato", label: "Archiviato" },
];

const DAYS_OF_WEEK = [
  "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica",
];

import { api } from "@/lib/api";

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
  const [form, setForm] = useState<CourseFormValues>(initialValues);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [slugManual, setSlugManual] = useState(!!initialValues.slug);

  useEffect(() => {
    api.get<any[]>("/admin/teachers")
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data.map((t) => ({ ...t, id: t.teacherId || t.id, fullName: t.fullName })));
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

  const toggleDay = (day: string) => {
    const limit = form.lessonsPerWeek;
    setForm((f) => {
      if (f.scheduleDays.includes(day)) {
        return { ...f, scheduleDays: f.scheduleDays.filter((d) => d !== day) };
      }
      if (limit && f.scheduleDays.length >= limit) return f;
      return { ...f, scheduleDays: [...f.scheduleDays, day] };
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
              <span className="text-[11px] font-semibold text-muted-foreground">Nessuna</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label className={L}>Foto Copertina</Label>
            <Input placeholder="URL Foto (https://...)" value={form.foto || ""}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="h-9 text-xs rounded-xl" />
          </div>
        </div>

        {/* ── Nome + Slug ── */}
        <div>
          <Label className={L}>Nome Corso *</Label>
          <Input placeholder="Es. B2 First, Lezioni Private..." value={form.nome} required
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
          <Label className={L}>Categoria</Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Seleziona categoria..." />
            </SelectTrigger>
            <SelectContent>
              {COURSE_CATEGORIES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className={L}>Formato *</Label>
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
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Seleziona formato..." />
            </SelectTrigger>
            <SelectContent>
              {COURSE_FORMAT_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Stato + Prezzo ── */}
        <div>
          <Label className={L}>Stato</Label>
          <Select value={form.stato} onValueChange={(v) => setForm({ ...form, stato: v as any })}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Seleziona stato..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className={L}>Prezzo (€) *</Label>
          <Input type="number" placeholder="0.00" step="0.01" min="0" required
            value={form.prezzo?.toString() ?? ""}
            onChange={(e) => setForm({ ...form, prezzo: parseFloat(e.target.value) || 0 })}
            className="h-9 text-xs rounded-xl" />
        </div>

        {/* ── Insegnante ── */}
        <div>
          <Label className={L}>Insegnante</Label>
          <Select
            value={form.insegnanteIds[0] || "none"}
            onValueChange={(v) => setForm({ ...form, insegnanteIds: v === "none" ? [] : [v] })}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="— Nessun insegnante —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Nessun insegnante —</SelectItem>
              {teachers.length > 0
                ? teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)
                : <SelectItem value="loading" disabled>Caricamento...</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* ══ GROUP ══════════════════════════════════════════════════════════ */}
        {isGroup && (
          <>
            <div className="col-span-2">
              <Label className={L}>Tipo Schedulazione</Label>
              <Select
                value={form.scheduleType || "fixed"}
                onValueChange={(t) =>
                  setForm((f) => ({
                    ...f,
                    scheduleType: t,
                    scheduleDays: t === "flexible" ? [] : f.scheduleDays,
                    startTime: t === "flexible" ? "" : f.startTime,
                    endTime: t === "flexible" ? "" : f.endTime,
                  }))
                }
              >
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fisso (orario definito)</SelectItem>
                  <SelectItem value="flexible">Flessibile (da concordare)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={L}>Durata Lezione (min)</Label>
              <Input type="number" placeholder="75" min="15" step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value) || null)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>Lezioni a Settimana</Label>
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
                <Label className={L}>Giorni di Lezione</Label>
                {form.lessonsPerWeek && (
                  <span className="text-xs text-muted-foreground">
                    {form.scheduleDays.length}/{form.lessonsPerWeek} selezionati
                  </span>
                )}
              </div>
              <div className="flex gap-4 flex-wrap pt-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = form.scheduleDays.includes(day);
                  const limitReached = !!form.lessonsPerWeek && form.scheduleDays.length >= form.lessonsPerWeek;
                  const isDisabled = !isSelected && limitReached;
                  return (
                    <label key={day}
                      className={`flex items-center gap-2 select-none text-xs font-medium ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                      <Checkbox checked={isSelected} disabled={isDisabled} onCheckedChange={() => toggleDay(day)} />
                      <span>{day}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className={L}>Orario Inizio</Label>
              <Input type="time" value={form.startTime || ""}
                onChange={(e) => updateStartTime(e.target.value)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>
                Orario Fine <span className="text-muted-foreground font-normal normal-case">(calcolato)</span>
              </Label>
              <div className={readOnly}>
                {form.endTime || <span className="text-muted-foreground">Inserisci orario e durata</span>}
              </div>
            </div>
          </>
        )}

        {/* ══ PRIVATE ════════════════════════════════════════════════════════ */}
        {isPrivate && (
          <>
            <div>
              <Label className={L}>Durata Lezione (min)</Label>
              <Input type="number" placeholder="60" min="15" step="5"
                value={form.lessonDurationMinutes?.toString() ?? ""}
                onChange={(e) => updateDuration(parseInt(e.target.value) || null)}
                className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <Label className={L}>N° Lezioni nel Pacchetto</Label>
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
            <Label className={L}>Totale Ore</Label>
            <Input type="number" placeholder="30" min="0" step="0.5"
              value={form.totalHours?.toString() ?? ""}
              onChange={(e) => setForm({ ...form, totalHours: parseFloat(e.target.value) || null })}
              className="h-9 text-xs rounded-xl" />
          </div>
        )}

        {/* ── Descrizione ── */}
        <div className="col-span-2">
          <Label className={L}>Descrizione</Label>
          <Textarea placeholder="Descrivi gli argomenti e gli obiettivi del corso..."
            value={form.descrizione}
            onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
            className="min-h-[80px] rounded-xl text-xs" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
        <Button type="button" variant="ghost" onClick={onCancel} className="font-semibold">Annulla</Button>
        <Button type="submit" className="font-semibold rounded-xl">{submitLabel}</Button>
      </div>
    </form>
  );
}
