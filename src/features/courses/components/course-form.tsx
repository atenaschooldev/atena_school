import * as React from "react";
import { useState } from "react";
import { useAppStore, LEVELS_UI } from "@/stores/app-store";
import type { Level, CourseFormValues } from "../types";
import { levelColorSolid } from "../utils";
import { X, Check, Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CourseFormProps {
  initialValues: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
}

const CATEGORIES = [
  "General English",
  "Business English",
  "Preparazione Esami",
  "Conversazione",
  "Letteratura",
];

const COLORS = [
  { value: "chart-1", label: "Rosso Atena", class: "bg-chart-1" },
  { value: "chart-2", label: "Verde Smeraldo", class: "bg-chart-2" },
  { value: "chart-3", label: "Blu Zaffiro", class: "bg-chart-3" },
  { value: "chart-4", label: "Viola Ametista", class: "bg-chart-4" },
  { value: "chart-5", label: "Arancione Ambra", class: "bg-chart-5" },
];

export function CourseForm({ initialValues, onSubmit, onCancel, submitLabel }: CourseFormProps) {
  const teachers = useAppStore((s) => s.teachers);
  const [form, setForm] = useState<CourseFormValues>(initialValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };



  const filteredTeachers = teachers.filter((t) =>
    `${t.nome} ${t.cognome}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTeacher = (tid: string) => {
    const checked = form.insegnanteIds.includes(tid);
    setForm({
      ...form,
      insegnanteIds: checked
        ? form.insegnanteIds.filter((x) => x !== tid)
        : [...form.insegnanteIds, tid],
    });
    setSearchQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-h-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-h-[70vh] overflow-y-visible">
        {/* Course Banner Photo */}
        <div className="col-span-2 flex items-center gap-4 bg-muted/15 rounded-xl p-3 border border-border/20">
          <div className="relative shrink-0 group h-14 w-20 rounded-lg overflow-hidden border border-border/40 bg-muted/30">
            {form.foto ? (
              <img
                src={form.foto}
                alt={form.nome}
                className="h-full w-full object-cover transition-all duration-250 group-hover:scale-105"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground/60 text-xs font-semibold">
                Nessuna
              </div>
            )}
            {form.foto && (
              <button
                type="button"
                onClick={() => setForm({ ...form, foto: "" })}
                className="absolute top-1 right-1 h-5 w-5 bg-destructive hover:bg-destructive/90 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all cursor-pointer z-10"
                title="Rimuovi foto"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              URL Immagine Corso
            </Label>
            <Input
              placeholder="https://images.unsplash.com/... (opzionale)"
              value={form.foto}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="h-9 text-xs bg-background/50 mt-1 focus-visible:ring-1 focus-visible:ring-primary/45"
            />
          </div>
        </div>

        {/* Course name */}
        <div className="col-span-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Nome Corso
          </Label>
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: Business English Avanzato"
            required
          />
        </div>

        {/* Category & Level */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Categoria
          </Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger className="h-9 text-xs mt-1.5 bg-background focus:ring-1 focus:ring-primary/45">
              <SelectValue placeholder="Seleziona categoria..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Livello di Lingua
          </Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {LEVELS_UI.map((l) => {
              const isSelected = form.livello === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm({ ...form, livello: l })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer border select-none
                    ${
                      isSelected
                        ? levelColorSolid(l)
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.02] active:scale-98"
                    }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration & Price */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Durata
          </Label>
          <Input
            value={form.durata}
            onChange={(e) => setForm({ ...form, durata: e.target.value })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: 60 ore"
            required
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Prezzo (€)
          </Label>
          <div className="relative mt-1.5">
            <Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              type="number"
              value={form.prezzo || ""}
              onChange={(e) => setForm({ ...form, prezzo: parseInt(e.target.value) || 0 })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="Esempio: 540"
              min={0}
              required
            />
          </div>
        </div>

        {/* Modules & Capacity */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Numero di Moduli
          </Label>
          <Input
            type="number"
            value={form.moduli || ""}
            onChange={(e) => setForm({ ...form, moduli: parseInt(e.target.value) || 0 })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: 8"
            min={1}
            required
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Capienza Massima Studenti
          </Label>
          <Input
            type="number"
            value={form.capienza || ""}
            onChange={(e) => setForm({ ...form, capienza: parseInt(e.target.value) || 0 })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: 15"
            min={1}
            required
          />
        </div>

        {/* Status & Color theme */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Stato Corso
          </Label>
          <div className="flex gap-2 mt-1.5">
            {[
              {
                value: "attivo",
                label: "Attivo",
                color: "bg-emerald-500 hover:bg-emerald-500/90 text-white border-transparent",
              },
              {
                value: "in-programmazione",
                label: "Pianificato",
                color: "bg-amber-500 hover:bg-amber-500/90 text-white border-transparent",
              },
              {
                value: "concluso",
                label: "Concluso",
                color: "bg-slate-500 hover:bg-slate-500/90 text-white border-transparent",
              },
            ].map((opt) => {
              const isSelected = form.stato === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      stato: opt.value as "attivo" | "in-programmazione" | "concluso",
                    })
                  }
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer border select-none text-center
                    ${
                      isSelected
                        ? opt.color + " shadow-sm font-bold"
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.02] active:scale-98"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-semibold">
            Tema Colore
          </Label>
          <div className="flex gap-2 mt-1.5">
            {COLORS.map((col) => {
              const isSelected = form.colore === col.value;
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setForm({ ...form, colore: col.value })}
                  className={`h-7 w-7 rounded-full transition-all duration-150 cursor-pointer border relative flex items-center justify-center hover:scale-105 active:scale-95
                    ${col.class} ${isSelected ? "border-foreground ring-2 ring-primary/40" : "border-border/30"}`}
                  title={col.label}
                >
                  {isSelected && <Check className="h-3 w-3 text-white stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assigned Teachers (Multi-select) */}
        <div className="col-span-2 relative">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Insegnanti Assegnati
          </Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="mt-1.5 w-full min-h-9 p-1.5 rounded-md border border-input bg-background flex flex-wrap gap-1.5 items-center focus-within:ring-1 focus-within:ring-primary/45 cursor-text select-none"
                onClick={() => {
                  const input = document.getElementById("course-teacher-search-input");
                  if (input) input.focus();
                }}
              >
                {form.insegnanteIds.map((tid) => {
                  const teacher = teachers.find((t) => t.id === tid);
                  if (!teacher) return null;
                  return (
                    <Badge
                      key={tid}
                      variant="secondary"
                      className="h-7 pl-2.5 pr-1 py-0 text-xs font-semibold bg-primary/10 text-primary border-primary/20 gap-1.5 flex items-center shrink-0 rounded-md"
                    >
                      <span>
                        {teacher.nome} {teacher.cognome}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTeacher(tid);
                        }}
                        className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-primary/20 hover:text-primary active:scale-90 transition-all cursor-pointer"
                        title="Rimuovi insegnante"
                      >
                        <X className="h-3 w-3 stroke-[2.5]" />
                      </button>
                    </Badge>
                  );
                })}
                <input
                  id="course-teacher-search-input"
                  type="text"
                  placeholder={form.insegnanteIds.length === 0 ? "Cerca insegnanti..." : ""}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPopoverOpen(true);
                  }}
                  className="flex-1 min-w-[150px] bg-transparent border-0 outline-none text-xs h-6 p-0 px-1 text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </PopoverTrigger>

            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              className="z-50 p-1 flex flex-col w-[340px] rounded-xl shadow-lg border border-border bg-popover text-popover-foreground overflow-hidden"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-1 flex flex-col gap-1 max-h-48 overflow-y-auto">
                {filteredTeachers.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-4 text-center">
                    Nessun insegnante trovato
                  </div>
                ) : (
                  filteredTeachers.map((t) => {
                    const checked = form.insegnanteIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTeacher(t.id)}
                        className={`rounded-full px-3.5 py-1.5 flex items-center justify-between text-xs cursor-pointer select-none outline-none transition-all duration-150 w-full text-left
                          ${
                            checked
                              ? "bg-primary hover:bg-primary/90 focus:bg-primary text-white font-semibold hover:scale-[1.02] focus:scale-[1.02] hover:shadow-md focus:shadow-md active:scale-95"
                              : "bg-muted/40 hover:bg-muted/70 focus:bg-muted/70 text-muted-foreground hover:text-foreground focus:text-foreground font-medium hover:scale-[1.02] focus:scale-[1.02] hover:shadow-sm focus:shadow-sm active:scale-95"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${checked ? "bg-white" : "bg-primary/45"}`}
                          />
                          <span>
                            {t.nome} {t.cognome}
                          </span>
                        </div>
                        {checked && <Check className="h-3 w-3 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverPrimitive.Content>
          </Popover>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Descrizione
          </Label>
          <Textarea
            value={form.descrizione}
            onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
            className="text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45 bg-background resize-none h-20"
            placeholder="Descrivi gli argomenti e gli obiettivi del corso..."
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/20 shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-xs h-8 hover:bg-muted/70 rounded-full px-4"
        >
          Annulla
        </Button>
        <Button
          type="submit"
          className="text-xs h-8 bg-primary hover:bg-primary/95 text-white font-semibold rounded-full px-5 shadow-sm hover:scale-[1.02] active:scale-98 transition-all"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
